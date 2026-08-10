import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { EXIT_CODES } from "../scripts/registry-cli.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const action = path.join(root, "bin", "samsarix-action.mjs");

test("GitHub Action metadata declares its dependency-free Node entry point", async () => {
  const metadata = await readFile(path.join(root, "action.yml"), "utf8");
  assert.match(metadata, /using: node24/);
  assert.match(metadata, /main: bin\/samsarix-action\.mjs/);
});

test("GitHub Action wrapper preserves policy and configuration exit codes", () => {
  const baseEnvironment = {
    ...process.env,
    INPUT_LIFECYCLE: "review",
    INPUT_REQUIRE_CANDIDATES: "true",
    INPUT_NOW: "2026-08-09",
  };
  const ready = spawnSync(process.execPath, [action], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...baseEnvironment,
      INPUT_REGISTRY: "docs/review-ready-registry-example.json",
    },
  });
  assert.equal(ready.status, EXIT_CODES.success);
  assert.match(ready.stdout, /::notice/);

  const blocked = spawnSync(process.execPath, [action], {
    cwd: root,
    encoding: "utf8",
    env: { ...baseEnvironment, INPUT_REGISTRY: "docs/agents.json" },
  });
  assert.equal(blocked.status, EXIT_CODES.readiness);
  assert.match(blocked.stdout, /::error/);

  const mcp = spawnSync(process.execPath, [action], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...baseEnvironment,
      INPUT_REGISTRY: "docs/mcp-server-example.json",
      INPUT_LIFECYCLE: "development",
    },
  });
  assert.equal(mcp.status, EXIT_CODES.readiness);
  assert.match(mcp.stdout, /mcp-com-example-release-evidence/);
  assert.match(mcp.stdout, /::error/);

  const invalidRegistry = spawnSync(process.execPath, [action], {
    cwd: root,
    encoding: "utf8",
    env: { ...baseEnvironment, INPUT_REGISTRY: "docs/portals.json" },
  });
  assert.equal(invalidRegistry.status, EXIT_CODES.data);
  assert.match(
    invalidRegistry.stderr,
    /::error title=Agent readiness action::Invalid registry/,
  );

  const missing = spawnSync(process.execPath, [action], {
    cwd: root,
    encoding: "utf8",
    env: { ...baseEnvironment, INPUT_REGISTRY: "" },
  });
  assert.equal(missing.status, EXIT_CODES.usage);
  assert.match(missing.stderr, /registry input is required/);

  const invalidBoolean = spawnSync(process.execPath, [action], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...baseEnvironment,
      INPUT_REGISTRY: "docs/review-ready-registry-example.json",
      INPUT_REQUIRE_CANDIDATES: "sometimes",
    },
  });
  assert.equal(invalidBoolean.status, EXIT_CODES.usage);
  assert.match(invalidBoolean.stderr, /must be true or false/);
});
