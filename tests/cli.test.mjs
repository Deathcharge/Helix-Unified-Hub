import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { spawnSync } from "node:child_process";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import {
  CLI_VERSION,
  EXIT_CODES,
  parseCliArguments,
  runCli,
} from "../scripts/registry-cli.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "bin", "samsarix-registry.mjs");
const temporary = await mkdtemp(path.join(tmpdir(), "samsarix-registry-cli-"));

after(async () => {
  await rm(temporary, { recursive: true, force: true });
});

function collector() {
  let output = "";
  return {
    stream: {
      write(value) {
        output += String(value);
      },
    },
    value() {
      return output;
    },
  };
}

async function invoke(args, overrides = {}) {
  const stdout = collector();
  const stderr = collector();
  const code = await runCli(args, {
    cwd: root,
    stdin: Readable.from([]),
    stdout: stdout.stream,
    stderr: stderr.stream,
    ...overrides,
  });
  return { code, stdout: stdout.value(), stderr: stderr.value() };
}

test("argument parser defines conservative deployment candidates and reproducible time", () => {
  const parsed = parseCliArguments([
    "check",
    "registry.json",
    "--include-development",
    "--require-candidates",
    "--now",
    "2026-08-09",
  ]);
  assert.deepEqual(parsed.lifecycles, ["development", "review", "production"]);
  assert.equal(parsed.requireCandidates, true);
  assert.equal(parsed.now.toISOString(), "2026-08-09T00:00:00.000Z");
  assert.throws(
    () => parseCliArguments(["check", "registry.json", "--now", "2026-02-30"]),
    /valid calendar date/,
  );
  assert.throws(
    () => parseCliArguments(["report", "registry.json"]),
    /requires --format/,
  );
  assert.throws(
    () =>
      parseCliArguments(["check", "registry.json", "--lifecycle", "imaginary"]),
    /Unsupported lifecycle/,
  );
});

test("validate emits stable inventory metadata for a Samsarix registry", async () => {
  const result = await invoke([
    "validate",
    "docs/agents.json",
    "--format",
    "json",
  ]);
  assert.equal(result.code, EXIT_CODES.success);
  assert.equal(result.stderr, "");
  const parsed = JSON.parse(result.stdout);
  assert.deepEqual(parsed, {
    valid: true,
    schemaVersion: 1,
    workspace: "Samsarix bundled agent concepts",
    agents: 12,
    lifecycles: { concept: 12 },
    risks: { unassessed: 12 },
  });
});

test("stdin accepts bounded A2A metadata without network access", async () => {
  const card = await readFile(
    path.join(root, "docs", "a2a-agent-card-example.json"),
    "utf8",
  );
  const result = await invoke(["validate", "-", "--format", "json"], {
    stdin: Readable.from([card]),
  });
  assert.equal(result.code, EXIT_CODES.success);
  assert.equal(JSON.parse(result.stdout).agents, 1);
});

test("CLI accepts bounded MCP Registry metadata without network access", async () => {
  const server = await readFile(
    path.join(root, "docs", "mcp-server-example.json"),
    "utf8",
  );
  const result = await invoke(["validate", "-", "--format", "json"], {
    stdin: Readable.from([server]),
  });
  assert.equal(result.code, EXIT_CODES.success);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.agents, 1);
  assert.equal(parsed.workspace, "Release Evidence MCP readiness review");
});

test("check passes a complete review candidate and fails a blocked development candidate", async () => {
  const passing = await invoke([
    "check",
    "docs/review-ready-registry-example.json",
    "--now",
    "2026-08-09",
    "--format",
    "json",
  ]);
  assert.equal(passing.code, EXIT_CODES.success);
  assert.equal(JSON.parse(passing.stdout).agents[0].score, 100);

  const blocked = await invoke([
    "check",
    "docs/a2a-agent-card-example.json",
    "--lifecycle",
    "development",
    "--now",
    "2026-08-09",
    "--format",
    "json",
  ]);
  assert.equal(blocked.code, EXIT_CODES.readiness);
  const result = JSON.parse(blocked.stdout);
  assert.equal(result.passed, false);
  assert.equal(result.summary.failed, 1);
  assert.ok(
    result.agents[0].blockers.some((entry) =>
      entry.includes("Risk tier is unassessed"),
    ),
  );
});

test("check ignores concepts by default and can require a deployment candidate", async () => {
  const inventory = await invoke([
    "check",
    "docs/agents.json",
    "--now",
    "2026-08-09",
  ]);
  assert.equal(inventory.code, EXIT_CODES.success);
  assert.match(inventory.stdout, /Candidates: 0\/0 ready/);

  const required = await invoke([
    "check",
    "docs/agents.json",
    "--require-candidates",
    "--now",
    "2026-08-09",
  ]);
  assert.equal(required.code, EXIT_CODES.readiness);
  assert.match(required.stdout, /Failure: no deployment candidates/);
});

test("GitHub format escapes annotation properties and reports blockers", async () => {
  const source = JSON.parse(
    await readFile(
      path.join(root, "docs", "a2a-agent-card-example.json"),
      "utf8",
    ),
  );
  source.name = "Research: Helper, CI";
  const fixture = path.join(temporary, "github-card.json");
  await writeFile(fixture, JSON.stringify(source), "utf8");
  const result = await invoke([
    "check",
    fixture,
    "--lifecycle",
    "development",
    "--format",
    "github",
    "--now",
    "2026-08-09",
  ]);
  assert.equal(result.code, EXIT_CODES.readiness);
  assert.match(
    result.stdout,
    /title=Research%3A Helper%2C CI readiness blocked/,
  );
  assert.match(result.stdout, /::error/);

  const capped = await invoke([
    "check",
    "docs/agents.json",
    "--lifecycle",
    "all",
    "--format",
    "github",
    "--now",
    "2026-08-09",
  ]);
  assert.equal(capped.code, EXIT_CODES.readiness);
  assert.equal((capped.stdout.match(/::error/g) || []).length, 10);
  assert.match(capped.stdout, /Annotation limit reached: 2 error and 0 notice/);
  assert.equal((capped.stdout.match(/^BLOCKED /gm) || []).length, 12);
});

test("report output is deterministic for normalized JSON and Markdown", async () => {
  const jsonFirst = await invoke([
    "report",
    "docs/review-ready-registry-example.json",
    "--format",
    "json",
  ]);
  const jsonSecond = await invoke([
    "report",
    "docs/review-ready-registry-example.json",
    "--format",
    "json",
  ]);
  assert.equal(jsonFirst.code, EXIT_CODES.success);
  assert.equal(jsonFirst.stdout, jsonSecond.stdout);
  const markdown = await invoke([
    "report",
    "docs/review-ready-registry-example.json",
    "--format",
    "markdown",
    "--now",
    "2026-08-09",
  ]);
  assert.equal(markdown.code, EXIT_CODES.success);
  assert.match(markdown.stdout, /Ready for governed use \(100\/100\)/);
});

test("usage, invalid data, oversized input, and missing input have distinct exits", async () => {
  const malformed = path.join(temporary, "malformed.json");
  const oversized = path.join(temporary, "oversized.json");
  await writeFile(malformed, "{not json", "utf8");
  await writeFile(oversized, " ".repeat(1024 * 1024 + 1), "utf8");

  assert.equal((await invoke(["unknown"])).code, EXIT_CODES.usage);
  assert.equal((await invoke(["validate", malformed])).code, EXIT_CODES.data);
  assert.equal((await invoke(["validate", oversized])).code, EXIT_CODES.data);
  assert.equal(
    (
      await invoke(["validate", "-"], {
        stdin: Readable.from([Buffer.alloc(1024 * 1024), Buffer.alloc(1)]),
      })
    ).code,
    EXIT_CODES.data,
  );
  assert.equal(
    (await invoke(["validate", path.join(temporary, "missing.json")])).code,
    EXIT_CODES.input,
  );
});

test("executable entry point provides help, version, and exact readiness exit codes", () => {
  const help = spawnSync(process.execPath, [cli, "--help"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(help.status, EXIT_CODES.success);
  assert.match(help.stdout, /Usage:/);

  const version = spawnSync(process.execPath, [cli, "--version"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(version.status, EXIT_CODES.success);
  assert.equal(version.stdout.trim(), CLI_VERSION);

  const pass = spawnSync(
    process.execPath,
    [
      cli,
      "check",
      "docs/review-ready-registry-example.json",
      "--now",
      "2026-08-09",
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(pass.status, EXIT_CODES.success);

  const fail = spawnSync(
    process.execPath,
    [
      cli,
      "check",
      "docs/agents.json",
      "--require-candidates",
      "--now",
      "2026-08-09",
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(fail.status, EXIT_CODES.readiness);
});
