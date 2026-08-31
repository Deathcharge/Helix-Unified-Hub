import { createHash } from "node:crypto";
import { access, lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { SAFE_STATUSES, safeHref } from "../docs/assets/catalog.mjs";
import { loadLinkTargets } from "./check-links.mjs";
import { syncRegistryAssetVersions } from "./version-registry-assets.mjs";
import {
  evaluateAgent,
  normalizeRegistryDocument,
  serializeRegistry,
} from "../docs/assets/readiness.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(root, "docs");
const failures = [];
const fail = (message) => failures.push(message);
if ((await syncRegistryAssetVersions()).length) {
  fail("Registry asset versions are stale. Run node scripts/version-registry-assets.mjs --write.");
}
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");
const registry = JSON.parse(await read("docs/portals.json"));
const dependencySnapshots = [
  {
    original: "assets/requirements-backend.txt",
    snapshot: "legacy/dependency-snapshots/helix-v15.3-backend-assets.snapshot",
    sha256: "1c996f487498bf4b9fa96b849176577ebd032eee16abc453046e48cec2696b9e",
  },
  {
    original: "legacy/backend-prototype/requirements.txt",
    snapshot:
      "legacy/dependency-snapshots/helix-v15.3-backend-prototype.snapshot",
    sha256: "3b62c4f47d707e05f6b22c16eb098502970105742f7cc8419afa04968a4b85e3",
  },
  {
    original: "assets/requirements-frontend.txt",
    snapshot: "legacy/dependency-snapshots/helix-v14.5-frontend.snapshot",
    sha256: "2ee9c4cc7c4c2b828b8c9582f24d520df18fdd67e5ab93f45790a90d70acd960",
  },
  {
    original: "assets/requirements.txt",
    snapshot: "legacy/dependency-snapshots/helix-community-hub.snapshot",
    sha256: "54a91cbdc8e3151a65ce5c1090e8b7b3ad7192aaa74233b6e7a302b8fd0cbab5",
  },
];
const archivedBuildSnapshots = [
  {
    original: "assets/Dockerfile",
    snapshot: "assets/helix-v14.5-backend.container-snapshot",
  },
  {
    original: "assets/Dockerfile.streamlit",
    snapshot: "assets/helix-v14.5-streamlit.container-snapshot",
  },
  {
    original: "assets/docker-compose.yml",
    snapshot: "assets/helix-v15.3.compose-snapshot",
  },
  {
    original: "legacy/backend-prototype/Dockerfile",
    snapshot: "legacy/backend-prototype/helix-v14.5-backend.container-snapshot",
  },
];

function yamlBlock(source, key, indent) {
  const lines = source.split(/\r?\n/);
  const marker = `${" ".repeat(indent)}${key}:`;
  const start = lines.findIndex((line) => line.trimEnd() === marker);
  if (start < 0) return "";
  let end = lines.length;
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (line.length - line.trimStart().length <= indent) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n");
}

function yamlDirectEntries(source, indent) {
  const entries = [];
  for (const line of source.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (line.length - line.trimStart().length !== indent) continue;
    const match = line
      .trim()
      .match(
        /^(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+)):\s*([^#]*?)(?:\s+#.*)?$/,
      );
    if (!match) return null;
    entries.push([match[1] || match[2] || match[3], match[4].trim()]);
  }
  return entries;
}

function exactYamlMap(entries, expected) {
  if (!entries || entries.length !== Object.keys(expected).length) return false;
  const actual = new Map(entries);
  if (actual.size !== entries.length) return false;
  return Object.entries(expected).every(
    ([key, value]) => actual.get(key) === value,
  );
}
let agentRegistry;
let registryTemplate;
let registrySchema;
let a2aExample;
let mcpExample;
let readyExample;
try {
  agentRegistry = normalizeRegistryDocument(
    JSON.parse(await read("docs/agents.json")),
  );
  registryTemplate = normalizeRegistryDocument(
    JSON.parse(await read("docs/agent-registry-template.json")),
  );
  registrySchema = JSON.parse(await read("docs/agent-registry.schema.json"));
  a2aExample = normalizeRegistryDocument(
    JSON.parse(await read("docs/a2a-agent-card-example.json")),
  );
  mcpExample = normalizeRegistryDocument(
    JSON.parse(await read("docs/mcp-server-example.json")),
  );
  readyExample = normalizeRegistryDocument(
    JSON.parse(await read("docs/review-ready-registry-example.json")),
  );
} catch (error) {
  fail(`Agent registry data is invalid: ${error.message}`);
}

async function htmlFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(absolute)));
    else if (entry.name.endsWith(".html")) found.push(absolute);
  }
  return found;
}

async function repositoryFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && (
      ['.git', 'dist', 'node_modules'].includes(entry.name)
      || (directory === root && entry.name === 'release')
    )) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await repositoryFiles(absolute)));
    else found.push(absolute);
  }
  return found;
}

if (registry.schemaVersion !== 1 || !Array.isArray(registry.entries)) {
  fail(
    "docs/portals.json must use schemaVersion 1 and contain an entries array.",
  );
}

const ids = new Set();
for (const [index, entry] of registry.entries.entries()) {
  const label = entry.id || `entry ${index + 1}`;
  if (!entry.id || !/^[a-z0-9-]+$/.test(entry.id))
    fail(`${label}: invalid id.`);
  if (ids.has(entry.id)) fail(`${label}: duplicate id.`);
  ids.add(entry.id);
  if (!entry.name || !entry.description || !entry.category)
    fail(`${label}: missing display fields.`);
  if (!SAFE_STATUSES.has(entry.status))
    fail(`${label}: unsupported status ${entry.status}.`);
  if (!safeHref(entry.href)) fail(`${label}: unsafe href ${entry.href}.`);
  if (!Array.isArray(entry.tags) || entry.tags.length === 0)
    fail(`${label}: at least one tag is required.`);
  if (!/^https:\/\//.test(entry.href)) {
    try {
      await access(path.join(docs, entry.href));
    } catch {
      fail(`${label}: local destination ${entry.href} does not exist.`);
    }
  }
}

const primaryPages = [
  "docs/index.html",
  "docs/registry.html",
  "docs/404.html",
  "docs/legal.html",
];
for (const relativePath of primaryPages) {
  const html = await read(relativePath);
  if (!html.includes("Content-Security-Policy"))
    fail(`${relativePath}: missing Content Security Policy.`);
  if (!html.includes("<main")) fail(`${relativePath}: missing main landmark.`);
  if (/\son\w+\s*=/.test(html))
    fail(`${relativePath}: inline event handlers are not allowed.`);
  if (/<script(?![^>]+\bsrc=)/i.test(html))
    fail(`${relativePath}: inline scripts are not allowed.`);
  if (/https?:\/\/(?:fonts|cdnjs|cdn\.)/i.test(html))
    fail(`${relativePath}: runtime CDN dependency found.`);
  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/gi)) {
    if (!/rel="[^"]*noopener[^"]*noreferrer[^"]*"/i.test(match[0])) {
      fail(
        `${relativePath}: target=_blank link is missing noopener noreferrer.`,
      );
    }
  }
}

const [
  landingPage,
  registryPage,
  ciGuide,
  actionMetadata,
  packageText,
  lockText,
  pagesWorkflow,
  linkWorkflow,
  gitignore,
] = await Promise.all([
  read("docs/index.html"),
  read("docs/registry.html"),
  read("docs/CI_INTEGRATION.md"),
  read("action.yml"),
  read("package.json"),
  read("package-lock.json"),
  read(".github/workflows/deploy-pages.yml"),
  read(".github/workflows/link-health.yml"),
  read(".gitignore"),
]);
if (!landingPage.includes('href="CI_INTEGRATION.md"'))
  fail("docs/index.html: CI guide is not discoverable.");
if (!registryPage.includes('href="review-ready-registry-example.json"'))
  fail("docs/registry.html: ready example is not discoverable.");
if (!registryPage.includes('href="mcp-server-example.json"'))
  fail("docs/registry.html: MCP server example is not discoverable.");
if (
  !landingPage.includes("v1.3 release candidate") ||
  !registryPage.includes("v1.3 release candidate")
) {
  fail("Primary product pages must display the v1.3 release identity.");
}
if (!ciGuide.includes("contents: read") || !ciGuide.includes("Exit contract"))
  fail(
    "docs/CI_INTEGRATION.md: least-privilege workflow or exit contract is missing.",
  );
if (
  !actionMetadata.includes("using: node24") ||
  !actionMetadata.includes("main: bin/samsarix-action.mjs")
) {
  fail("action.yml: Node runtime entry point is inconsistent.");
}
const actionInputs = yamlDirectEntries(
  yamlBlock(actionMetadata, "inputs", 0),
  2,
);
const allowedActionInputs = [
  "lifecycle",
  "now",
  "registry",
  "require-candidates",
];
if (
  !actionInputs ||
  actionInputs
    .map(([key]) => key)
    .sort()
    .join(",") !== allowedActionInputs.join(",")
) {
  fail(`action.yml: inputs must be exactly ${allowedActionInputs.join(", ")}.`);
}
if (
  !pagesWorkflow.includes("node-version: 24") ||
  !pagesWorkflow.includes("uses: ./")
)
  fail(
    "Pages validation must use Node 24 and exercise the local readiness Action.",
  );
const workflowJobs = yamlBlock(pagesWorkflow, "jobs", 0);
const validatePermissions = yamlDirectEntries(
  yamlBlock(yamlBlock(workflowJobs, "validate", 2), "permissions", 4),
  6,
);
const deployPermissions = yamlDirectEntries(
  yamlBlock(yamlBlock(workflowJobs, "deploy", 2), "permissions", 4),
  6,
);
if (!exactYamlMap(validatePermissions, { contents: "read" }))
  fail("Pages validate job permissions must be exactly contents: read.");
if (!exactYamlMap(deployPermissions, { pages: "write", "id-token": "write" }))
  fail(
    "Pages deploy job permissions must be exactly pages: write and id-token: write.",
  );
for (const match of pagesWorkflow.matchAll(/^\s*uses:\s*([^\s#]+)/gm)) {
  if (!match[1].startsWith("./") && !/^[^@\s]+@[0-9a-f]{40}$/.test(match[1])) {
    fail(
      `Pages workflow action is not pinned to an immutable revision: ${match[1]}.`,
    );
  }
}
const linkPermissions = yamlDirectEntries(yamlBlock(linkWorkflow, "permissions", 0), 2);
if (!exactYamlMap(linkPermissions, { contents: "read" }))
  fail("External-link workflow permissions must be exactly contents: read.");
if (
  !linkWorkflow.includes('cron: "17 9 * * 1"')
  || !linkWorkflow.includes("workflow_dispatch:")
  || !linkWorkflow.includes("timeout-minutes: 10")
  || !linkWorkflow.includes("node scripts/check-links.mjs")
  || !linkWorkflow.includes("node-version: 24")
) {
  fail("External-link workflow must keep the documented schedule, manual trigger, timeout, and Node command.");
}
for (const match of linkWorkflow.matchAll(/^\s*uses:\s*([^\s#]+)/gm)) {
  if (!/^[^@\s]+@[0-9a-f]{40}$/.test(match[1])) {
    fail(`External-link workflow action is not pinned to an immutable revision: ${match[1]}.`);
  }
}
try {
  const linkTargets = await loadLinkTargets({ rootDir: root });
  if (!linkTargets.length) fail("External-link inventory must contain at least one target.");
} catch (error) {
  fail(`External-link inventory is invalid: ${error.message}`);
}
for (const requiredIgnore of [
  "original_conversation_*.txt",
  "assets/chat*.html",
  "assets/context_dump*.txt",
  "assets/workspace_output_*.txt",
  "assets/logs-*.txt",
  "outputs/workspace_output_*.txt",
]) {
  if (!gitignore.includes(requiredIgnore)) fail(`.gitignore: missing private-export guard ${requiredIgnore}.`);
}
const privateExportPattern = /(?:^|\/)(?:original_conversation_[^/]*\.txt|chat[^/]*\.html|context_dump[^/]*\.txt|workspace_output_[^/]*\.txt|logs-[^/]*\.txt)$/i;
for (const absolute of await repositoryFiles(root)) {
  const relativePath = path.relative(root, absolute).replaceAll(path.sep, "/");
  if (privateExportPattern.test(relativePath)) fail(`${relativePath}: private conversation, context, or generated output export must not be tracked.`);
}
const packageMetadata = JSON.parse(packageText);
const packageLock = JSON.parse(lockText);
if (
  packageMetadata.version !== "1.3.0-rc.2" ||
  packageLock.version !== packageMetadata.version
)
  fail("Package and lockfile release versions are inconsistent.");
if (
  packageMetadata.engines?.node !== ">=22" ||
  packageLock.packages?.[""]?.engines?.node !== ">=22"
)
  fail("Package and lockfile Node support floors are inconsistent.");
if (packageMetadata.bin?.["samsarix-registry"] !== "bin/samsarix-registry.mjs")
  fail("package.json: registry executable is not declared.");
if (packageMetadata.scripts?.registry !== "node bin/samsarix-registry.mjs")
  fail("package.json: registry script is inconsistent.");
if (packageMetadata.scripts?.['pack:cli'] !== "node scripts/package-cli.mjs")
  fail("package.json: CLI distribution builder is not declared.");
if (!/^permissions: \{\}\s*$/m.test(pagesWorkflow))
  fail("Pages workflow permissions must default to none; jobs grant only what they need.");
const packagePermissions = yamlDirectEntries(
  yamlBlock(yamlBlock(workflowJobs, "cli-package", 2), "permissions", 4), 6,
);
if (!exactYamlMap(packagePermissions, { contents: "read" }))
  fail("CLI package job permissions must be exactly contents: read.");
for (const [name, workflow] of [["Pages", pagesWorkflow], ["External-link", linkWorkflow]]) {
  const checkoutSteps = workflow.split(/(?=^\s*- (?:name:|uses:))/m)
    .filter((step) => /uses: actions\/checkout@/.test(step));
  if (!checkoutSteps.length || checkoutSteps.some((step) => !/^\s+persist-credentials: false\s*$/m.test(step)))
    fail(`${name} checkout steps must not persist credentials.`);
}
if (!pagesWorkflow.includes("needs: cli-package")
  || !pagesWorkflow.includes("if: always()")
  || !pagesWorkflow.includes('run: test "$PACKAGE_RESULT" = success')
  || !pagesWorkflow.includes("os: [ubuntu-latest, windows-latest]")
  || !pagesWorkflow.includes("node: [22, 24]")
  || !pagesWorkflow.includes("run: node --test tests/browser-state.test.mjs")
  || !pagesWorkflow.includes("run: node --test tests/distribution.test.mjs"))
  fail("Pages validation must require the Windows/Linux Node 22/24 CLI distribution and browser-state matrix.");

if (agentRegistry) {
  if (agentRegistry.agents.length !== 12)
    fail("docs/agents.json must retain the 12 bundled agent concepts.");
  if (agentRegistry.agents.some((agent) => agent.lifecycle !== "concept"))
    fail("Bundled profiles must remain honestly labeled as concepts.");
  if (
    serializeRegistry(agentRegistry) !==
    serializeRegistry(JSON.parse(serializeRegistry(agentRegistry)))
  ) {
    fail("Agent registry serialization must be deterministic.");
  }
}
if (registryTemplate && registryTemplate.agents.length !== 1)
  fail(
    "The starter registry template must contain exactly one example record.",
  );
if (registrySchema) {
  if (registrySchema.$schema !== "https://json-schema.org/draft/2020-12/schema")
    fail("The agent registry JSON Schema must use Draft 2020-12.");
  if (registrySchema.properties?.schemaVersion?.const !== 1)
    fail("The agent registry JSON Schema must describe schemaVersion 1.");
}
if (a2aExample) {
  if (
    a2aExample.agents.length !== 1 ||
    !a2aExample.agents[0].id.startsWith("a2a-")
  )
    fail("The A2A example must normalize to one A2A-derived record.");
  if (evaluateAgent(a2aExample.agents[0]).status !== "blocked")
    fail("The A2A example must honestly retain governance blockers.");
}
if (mcpExample) {
  if (
    mcpExample.agents.length !== 1 ||
    !mcpExample.agents[0].id.startsWith("mcp-")
  )
    fail("The MCP example must normalize to one MCP-derived record.");
  if (evaluateAgent(mcpExample.agents[0]).status !== "blocked")
    fail("The MCP example must honestly retain governance blockers.");
  if (mcpExample.agents[0].authentication.schemes.length)
    fail("MCP secret-input declarations must not become authentication proof.");
}
if (readyExample) {
  if (
    readyExample.agents.length !== 1 ||
    readyExample.agents[0].lifecycle !== "review"
  )
    fail("The ready example must contain one review candidate.");
  if (
    evaluateAgent(readyExample.agents[0], {
      now: new Date("2026-08-09T00:00:00Z"),
    }).status !== "ready"
  ) {
    fail(
      "The ready example must pass at the documented reproducible evaluation date.",
    );
  }
}

for (const absolute of await htmlFiles(docs)) {
  const relativePath = path.relative(root, absolute).replaceAll(path.sep, "/");
  const html = await readFile(absolute, "utf8");
  if (/<script\b[^>]*\bsrc=["']https?:\/\//i.test(html)) {
    fail(
      `${relativePath}: remote executable script is not allowed in the release artifact.`,
    );
  }
  if (/@import\s+url\(["']?https?:\/\//i.test(html)) {
    fail(
      `${relativePath}: remote CSS import is not allowed in the release artifact.`,
    );
  }
}

for (const relativePath of [
  "LICENSE",
  "NOTICE",
  "CITATION.cff",
  ".github/external-links.json",
  ".github/workflows/link-health.yml",
  "action.yml",
  "bin/samsarix-action.mjs",
  "bin/samsarix-registry.mjs",
  "docs/CI_INTEGRATION.md",
  "docs/EXTERNAL_LINKS.md",
  "docs/external-links.html",
  "docs/LICENSE.txt",
  "docs/NOTICE.txt",
  "docs/SECURITY_REVIEW.md",
  "docs/security-review.html",
  "docs/assets/og-agent-registry.png",
  "docs/review-ready-registry-example.json",
  "scripts/registry-cli.mjs",
  "scripts/package-cli.mjs",
  "tests/distribution.test.mjs",
  "docs/CLI_DISTRIBUTION.md",
]) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    fail(`${relativePath}: required release legal file is missing.`);
  }
}

for (const entry of dependencySnapshots) {
  try {
    await lstat(path.join(root, entry.original));
    fail(
      `${entry.original}: unsupported pip manifest must remain quarantined.`,
    );
  } catch (error) {
    if (error.code !== "ENOENT") {
      fail(
        `${entry.original}: quarantine absence check failed: ${error.message}`,
      );
    }
  }
  try {
    const snapshot = await readFile(path.join(root, entry.snapshot));
    const digest = createHash("sha256").update(snapshot).digest("hex");
    if (digest !== entry.sha256) {
      fail(`${entry.snapshot}: preserved dependency snapshot digest changed.`);
    }
  } catch (error) {
    fail(
      `${entry.snapshot}: preserved dependency snapshot is unavailable: ${error.message}`,
    );
  }
}

for (const entry of archivedBuildSnapshots) {
  try {
    await lstat(path.join(root, entry.original));
    fail(
      `${entry.original}: archived build entry point must remain quarantined.`,
    );
  } catch (error) {
    if (error.code !== "ENOENT") {
      fail(
        `${entry.original}: quarantine absence check failed: ${error.message}`,
      );
    }
  }
  try {
    await readFile(path.join(root, entry.snapshot));
  } catch (error) {
    fail(
      `${entry.snapshot}: archived build snapshot is unavailable: ${error.message}`,
    );
  }
}

const [license, publishedLicense, notice, publishedNotice] = await Promise.all([
  read("LICENSE"),
  read("docs/LICENSE.txt"),
  read("NOTICE"),
  read("docs/NOTICE.txt"),
]);
if (license !== publishedLicense)
  fail("docs/LICENSE.txt must exactly mirror LICENSE.");
if (notice !== publishedNotice)
  fail("docs/NOTICE.txt must exactly mirror NOTICE.");
if (!license.includes("Licensor:             Samsarix LLC"))
  fail("LICENSE: Samsarix LLC is not the named licensor.");
if (!license.includes("contact@samsarix.com"))
  fail("LICENSE: commercial contact is missing.");
if (!license.includes(`Version ${packageMetadata.version}`))
  fail("LICENSE: release version is inconsistent.");
if (!publishedLicense.includes(`Version ${packageMetadata.version}`))
  fail("docs/LICENSE.txt: release version is inconsistent.");
const citation = await read("CITATION.cff");
if (!citation.includes('title: "Samsarix Agent Readiness Registry"'))
  fail("CITATION.cff: product title is inconsistent.");
if (!citation.includes(`version: "${packageMetadata.version}"`))
  fail("CITATION.cff: release version is inconsistent.");

if (failures.length) {
  console.error(`Site checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Site checks passed: ${registry.entries.length} catalog entries, ${agentRegistry?.agents.length || 0} agent records, and ${primaryPages.length} primary pages validated.`,
);
