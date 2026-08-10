import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  MAX_IMPORT_BYTES,
  RegistryValidationError,
  evaluateAgent,
  parseRegistryText,
  readinessLabel,
  renderMarkdownPacket,
  serializeRegistry,
} from "../docs/assets/readiness.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageMetadata = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);
const DEFAULT_LIFECYCLES = Object.freeze(["review", "production"]);
const ALL_LIFECYCLES = Object.freeze([
  "concept",
  "development",
  "review",
  "production",
  "paused",
  "retired",
]);
const MAX_GITHUB_ANNOTATIONS_PER_LEVEL = 10;

export const EXIT_CODES = Object.freeze({
  success: 0,
  readiness: 2,
  usage: 64,
  data: 65,
  input: 66,
  software: 70,
});

export const CLI_VERSION = packageMetadata.version;

export const CLI_HELP = `Samsarix Agent Readiness Registry CLI ${CLI_VERSION}

Usage:
  samsarix-registry validate <registry.json|-> [--format text|json]
  samsarix-registry check <registry.json|-> [options]
  samsarix-registry report <registry.json|-> --format markdown|json [--now <date>]
  samsarix-registry --help
  samsarix-registry --version

Commands:
  validate  Parse a Samsarix registry, A2A Agent Card, or MCP server.json.
  check     Fail when selected deployment candidates are not ready.
  report    Write a deterministic normalized JSON or Markdown review packet.

Check options:
  --format text|json|github       Output format. Default: text.
  --lifecycle <list|all>          Comma-separated lifecycles. Default: review,production.
  --include-development          Shortcut for review,production,development.
  --require-candidates           Fail when the selected lifecycle set is empty.
  --now <YYYY-MM-DD|UTC time>    Reproducible evidence-staleness evaluation time.

Input and safety:
  Use - to read UTF-8 JSON from stdin. Input is limited to ${MAX_IMPORT_BYTES / 1024} KiB
  and ${500} agents. The CLI never fetches URLs, calls agents, or accepts credentials.

Exit codes:
  0   Command succeeded or all selected candidates are ready.
  2   Readiness policy failed.
  64  Command or option usage error.
  65  Registry data is invalid or oversized.
  66  Input could not be read.
  70  Unexpected internal error.
`;

class CliUsageError extends Error {
  constructor(message) {
    super(message);
    this.name = "CliUsageError";
  }
}

class CliInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "CliInputError";
  }
}

function write(stream, value) {
  stream.write(value.endsWith("\n") ? value : `${value}\n`);
}

function takeOptionValue(args, index, option) {
  const value = args[index + 1];
  if (!value || value.startsWith("--"))
    throw new CliUsageError(`${option} requires a value.`);
  return value;
}

function parseNow(value) {
  if (!value) return null;
  if (
    !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value)
  ) {
    throw new CliUsageError(
      "--now must be YYYY-MM-DD or an ISO UTC timestamp ending in Z.",
    );
  }
  const result = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(result.getTime()))
    throw new CliUsageError("--now is not a valid date.");
  const expectedSecond =
    value.length === 10 ? `${value}T00:00:00` : value.slice(0, 19);
  if (result.toISOString().slice(0, 19) !== expectedSecond) {
    throw new CliUsageError("--now is not a valid calendar date.");
  }
  return result;
}

function parseLifecycleOption(value) {
  if (value === "all") return [...ALL_LIFECYCLES];
  const lifecycles = [
    ...new Set(
      String(value)
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  ];
  if (!lifecycles.length)
    throw new CliUsageError(
      "--lifecycle must name at least one lifecycle or all.",
    );
  const unsupported = lifecycles.filter(
    (entry) => !ALL_LIFECYCLES.includes(entry),
  );
  if (unsupported.length)
    throw new CliUsageError(
      `Unsupported lifecycle: ${unsupported.join(", ")}.`,
    );
  return lifecycles;
}

export function parseCliArguments(argv) {
  if (!Array.isArray(argv))
    throw new CliUsageError("Arguments must be an array.");
  if (!argv.length || argv.includes("--help") || argv.includes("-h"))
    return { action: "help" };
  if (argv.includes("--version") || argv.includes("-v"))
    return { action: "version" };
  const [command, ...args] = argv;
  if (!["validate", "check", "report"].includes(command))
    throw new CliUsageError(`Unknown command: ${command}.`);
  const options = {
    action: "command",
    command,
    format: command === "report" ? "" : "text",
    inputPath: "",
    lifecycles: [...DEFAULT_LIFECYCLES],
    now: null,
    requireCandidates: false,
  };
  let lifecycleOptionUsed = false;
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === "--format") {
      options.format = takeOptionValue(args, index, "--format");
      index += 1;
    } else if (token === "--lifecycle") {
      options.lifecycles = parseLifecycleOption(
        takeOptionValue(args, index, "--lifecycle"),
      );
      lifecycleOptionUsed = true;
      index += 1;
    } else if (token === "--include-development") {
      options.lifecycles = ["development", ...DEFAULT_LIFECYCLES];
      lifecycleOptionUsed = true;
    } else if (token === "--require-candidates") {
      options.requireCandidates = true;
    } else if (token === "--now") {
      options.now = parseNow(takeOptionValue(args, index, "--now"));
      index += 1;
    } else if (token.startsWith("-") && token !== "-") {
      throw new CliUsageError(`Unknown option: ${token}.`);
    } else if (options.inputPath) {
      throw new CliUsageError(`Unexpected extra input: ${token}.`);
    } else {
      options.inputPath = token;
    }
  }
  if (!options.inputPath)
    throw new CliUsageError(
      `${command} requires a registry path or - for stdin.`,
    );
  if (
    command !== "check" &&
    (lifecycleOptionUsed || options.requireCandidates)
  ) {
    throw new CliUsageError(
      "--lifecycle, --include-development, and --require-candidates are check-only options.",
    );
  }
  if (command === "validate" && options.now)
    throw new CliUsageError("--now is only valid for check and report.");
  const formats = {
    validate: ["text", "json"],
    check: ["text", "json", "github"],
    report: ["markdown", "json"],
  };
  if (!formats[command].includes(options.format)) {
    const required =
      command === "report" && !options.format
        ? " requires --format markdown or json"
        : ` supports: ${formats[command].join(", ")}`;
    throw new CliUsageError(`${command}${required}.`);
  }
  return options;
}

async function readBoundedStream(stream, limitMessage) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > MAX_IMPORT_BYTES) {
      stream.destroy?.();
      throw new RegistryValidationError([limitMessage]);
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readBoundedStdin(stdin) {
  return readBoundedStream(
    stdin,
    `The stdin import exceeds the ${MAX_IMPORT_BYTES / 1024} KiB limit.`,
  );
}

async function readBoundedInput(inputPath, { cwd, stdin }) {
  if (inputPath === "-") return readBoundedStdin(stdin);
  const absolute = path.resolve(cwd, inputPath);
  let details;
  try {
    details = await stat(absolute);
  } catch (error) {
    throw new CliInputError(
      `Cannot read ${inputPath}: ${error.code === "ENOENT" ? "file does not exist" : error.message}.`,
    );
  }
  if (!details.isFile())
    throw new CliInputError(
      `Cannot read ${inputPath}: input is not a regular file.`,
    );
  if (details.size > MAX_IMPORT_BYTES) {
    throw new RegistryValidationError([
      `The import exceeds the ${MAX_IMPORT_BYTES / 1024} KiB limit.`,
    ]);
  }
  try {
    return await readBoundedStream(
      createReadStream(absolute, { highWaterMark: 64 * 1024 }),
      `The import exceeds the ${MAX_IMPORT_BYTES / 1024} KiB limit.`,
    );
  } catch (error) {
    if (error instanceof RegistryValidationError) throw error;
    throw new CliInputError(`Cannot read ${inputPath}: ${error.message}.`);
  }
}

function countBy(values, key) {
  const counts = {};
  for (const value of values)
    counts[value[key]] = (counts[value[key]] || 0) + 1;
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function validationResult(registry) {
  return {
    valid: true,
    schemaVersion: registry.schemaVersion,
    workspace: registry.workspace.name,
    agents: registry.agents.length,
    lifecycles: countBy(registry.agents, "lifecycle"),
    risks: countBy(registry.agents, "risk"),
  };
}

function assessmentRows(registry, options) {
  return registry.agents
    .filter((agent) => options.lifecycles.includes(agent.lifecycle))
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((agent) => {
      const assessment = evaluateAgent(agent, {
        now: options.now || new Date(),
      });
      return {
        id: agent.id,
        name: agent.name,
        lifecycle: agent.lifecycle,
        risk: agent.risk,
        readiness: assessment.status,
        score: assessment.score,
        blockers: assessment.blockers,
        staleGates: assessment.staleGates,
      };
    });
}

function checkResult(registry, options) {
  const agents = assessmentRows(registry, options);
  const failed = agents.filter((agent) => agent.readiness !== "ready");
  const noCandidates = options.requireCandidates && agents.length === 0;
  return {
    command: "check",
    passed: failed.length === 0 && !noCandidates,
    workspace: registry.workspace.name,
    selectedLifecycles: [...options.lifecycles],
    requireCandidates: options.requireCandidates,
    summary: {
      totalInventory: registry.agents.length,
      candidates: agents.length,
      ready: agents.length - failed.length,
      failed: failed.length,
      noCandidates,
    },
    agents,
  };
}

function renderTextCheck(result) {
  const lines = [
    `Samsarix readiness check: ${result.passed ? "PASS" : "FAIL"}`,
    `Workspace: ${result.workspace}`,
    `Candidates: ${result.summary.ready}/${result.summary.candidates} ready`,
    `Selected lifecycles: ${result.selectedLifecycles.join(", ")}`,
  ];
  if (result.summary.noCandidates)
    lines.push(
      "Failure: no deployment candidates matched the selected lifecycles.",
    );
  for (const agent of result.agents) {
    lines.push(
      `${agent.readiness === "ready" ? "READY" : "BLOCKED"} ${agent.id} — ${agent.score}/100 — ${readinessLabel(agent.readiness)}`,
    );
    if (agent.readiness !== "ready")
      agent.blockers.forEach((blocker) => lines.push(`  - ${blocker}`));
  }
  return `${lines.join("\n")}\n`;
}

function githubMessage(value) {
  return String(value)
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A");
}

function githubProperty(value) {
  return githubMessage(value).replace(/:/g, "%3A").replace(/,/g, "%2C");
}

function renderGithubCheck(result) {
  const lines = [];
  let errors = 0;
  let notices = 0;
  let suppressedErrors = 0;
  let suppressedNotices = 0;
  if (result.summary.noCandidates) {
    lines.push(
      `::error title=${githubProperty("Agent readiness check")}::${githubMessage("No deployment candidates matched the selected lifecycles.")}`,
    );
    errors += 1;
  }
  for (const agent of result.agents) {
    lines.push(
      `${agent.readiness === "ready" ? "READY" : "BLOCKED"} ${agent.id} — ${agent.score}/100 — ${readinessLabel(agent.readiness)}${agent.blockers.length ? ` — ${agent.blockers.join("; ")}` : ""}`,
    );
    if (agent.readiness === "ready") {
      if (notices < MAX_GITHUB_ANNOTATIONS_PER_LEVEL) {
        lines.push(
          `::notice title=${githubProperty(`${agent.name} ready`)}::${githubMessage(`${agent.id} passed at ${agent.score}/100.`)}`,
        );
        notices += 1;
      } else {
        suppressedNotices += 1;
      }
    } else {
      if (errors < MAX_GITHUB_ANNOTATIONS_PER_LEVEL) {
        lines.push(
          `::error title=${githubProperty(`${agent.name} readiness blocked`)}::${githubMessage(`${agent.id} scored ${agent.score}/100: ${agent.blockers.join("; ")}`)}`,
        );
        errors += 1;
      } else {
        suppressedErrors += 1;
      }
    }
  }
  if (suppressedErrors || suppressedNotices) {
    lines.push(
      `Annotation limit reached: ${suppressedErrors} error and ${suppressedNotices} notice annotations remain available in the ordinary log lines above.`,
    );
  }
  lines.push(
    `Samsarix readiness check: ${result.passed ? "PASS" : "FAIL"} — ${result.summary.ready}/${result.summary.candidates} candidates ready.`,
  );
  return `${lines.join("\n")}\n`;
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function runCli(argv, dependencies = {}) {
  const runtime = {
    cwd: dependencies.cwd || process.cwd(),
    stdin: dependencies.stdin || process.stdin,
    stdout: dependencies.stdout || process.stdout,
    stderr: dependencies.stderr || process.stderr,
  };
  try {
    const options = parseCliArguments(argv);
    if (options.action === "help") {
      write(runtime.stdout, CLI_HELP);
      return EXIT_CODES.success;
    }
    if (options.action === "version") {
      write(runtime.stdout, CLI_VERSION);
      return EXIT_CODES.success;
    }
    const registry = parseRegistryText(
      await readBoundedInput(options.inputPath, runtime),
    );
    if (options.command === "validate") {
      const result = validationResult(registry);
      write(
        runtime.stdout,
        options.format === "json"
          ? json(result)
          : `Valid registry: ${result.workspace} — ${result.agents} ${result.agents === 1 ? "agent" : "agents"} — schema v${result.schemaVersion}.`,
      );
      return EXIT_CODES.success;
    }
    if (options.command === "report") {
      write(
        runtime.stdout,
        options.format === "json"
          ? serializeRegistry(registry)
          : renderMarkdownPacket(registry, { now: options.now || new Date() }),
      );
      return EXIT_CODES.success;
    }
    const result = checkResult(registry, options);
    write(
      runtime.stdout,
      options.format === "json"
        ? json(result)
        : options.format === "github"
          ? renderGithubCheck(result)
          : renderTextCheck(result),
    );
    return result.passed ? EXIT_CODES.success : EXIT_CODES.readiness;
  } catch (error) {
    if (error instanceof CliUsageError) {
      write(
        runtime.stderr,
        `Usage error: ${error.message}\nRun samsarix-registry --help for usage.`,
      );
      return EXIT_CODES.usage;
    }
    if (error instanceof RegistryValidationError) {
      write(
        runtime.stderr,
        `Invalid registry: ${error.issues.slice(0, 10).join(" ")}`,
      );
      return EXIT_CODES.data;
    }
    if (error instanceof CliInputError) {
      write(runtime.stderr, error.message);
      return EXIT_CODES.input;
    }
    write(
      runtime.stderr,
      `Internal error: ${error.message || "unknown failure"}.`,
    );
    return EXIT_CODES.software;
  }
}
