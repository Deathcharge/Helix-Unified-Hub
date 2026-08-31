# Samsarix Agent Readiness Registry

Samsarix Agent Readiness Registry is a dependency-free, local-first web workspace
from Samsarix LLC for answering a practical question: **which AI agents do we have,
and what evidence is still missing before we deploy or integrate them?**

It imports a versioned Samsarix registry, a current A2A Agent Card, or an official
MCP Registry `server.json`, normalizes the metadata without making network requests,
evaluates nine visible readiness gates, and exports deterministic JSON or Markdown
review packets. Imported data stays in the current browser unless the user explicitly
exports it.

The initial audience is an individual builder or a team of roughly 2–50 people that
needs an ownership and pre-deployment review workflow before an enterprise control
plane is justified. The product is a v1.3 release candidate: the complete local
review journey, repository-enforced readiness gate, and A2A/MCP metadata adapters are
implemented, while production promotion remains subject to the owner gates below.

The earlier Hub Directory remains available as a secondary repository map. The
[Samsarix Field Guide](https://github.com/Deathcharge/samsarix-field-guide) remains
the canonical portfolio navigator; this repository has the distinct agent-readiness
role documented in [`docs/AGENT_REGISTRY_PRODUCT.md`](docs/AGENT_REGISTRY_PRODUCT.md)
and [`CONSOLIDATION.md`](CONSOLIDATION.md).

## Fastest successful path

For browser review, open the [hosted workspace](https://deathcharge.github.io/Helix-Unified-Hub/registry.html).
For command-line use without cloning the historical repository, download the
CLI-only `*-cli.tgz`, `*-cli.manifest.json`, and `*-cli.sha256` assets from
[v1.3.0-rc.2](https://github.com/Deathcharge/Helix-Unified-Hub/releases/tag/v1.3.0-rc.2).
The [standalone quickstart](docs/CLI_DISTRIBUTION.md) covers integrity checking,
extraction, offline installation, and a reproducible passing/failing review.

For development from source:

Prerequisites:

- Node.js 22 LTS or newer
- npm 10 or newer
- Git and `tar` (used by the packaged-distribution tests)

```bash
git clone https://github.com/Deathcharge/Helix-Unified-Hub.git
cd Helix-Unified-Hub
npm ci
npm run check
npm run serve
```

Open `http://127.0.0.1:4173/`, choose **Open readiness workspace**, and select a
bundled concept to see its blockers. Import
[`docs/agent-registry-template.json`](docs/agent-registry-template.json), a local
A2A Agent Card, or an MCP Registry `server.json` to review your own metadata. No
environment variables, credentials, database, account, AI provider, or private
Samsarix service is required.

If that port is occupied, set `SAMSARIX_HUB_PORT` to another local port before
running `npm run serve`.

## Core workflow

1. Start with the honest bundled inventory or download the starter manifest.
2. Import one Samsarix registry, one A2A Agent Card, or one MCP Registry
   `server.json` document.
3. Review purpose, ownership, interface, authentication, data, evaluation,
   security, oversight, and operations evidence.
4. Search and filter by lifecycle, risk, readiness, or stale evidence.
5. Export normalized JSON for version control or Markdown for a human review.
6. Use **Reset sample** twice to explicitly clear the browser-saved inventory and
   restore the bundled concepts.

Selecting an agent brings its detail heading into view. **Back to agent list**
returns focus to that agent, including in filtered results. Keyboard users can
Tab from the heading to the return button and then to the evidence table; use
Left and Right arrow keys to read columns that extend beyond a narrow screen.

Files are limited to 1 MiB and 500 agents. Duplicate identifiers, malformed JSON,
non-HTTPS interface URLs, embedded URL credentials, unsupported schema values,
credential-bearing fields, and secret MCP values/defaults are rejected before the
current workspace changes. The browser renders imported values as text, never
imported HTML.

The newest selected file owns a pending import; an older read cannot overwrite it.
Confirming **Reset sample** also invalidates unfinished reads before removing this
application's saved inventory. If browser settings prevent removal, the workspace
reports that only its in-memory view was reset and that saved data may return.
Clear this site's data in browser settings when an explicit removal warning appears.

The readiness score is an explainable workflow signal. It is not a compliance
certification, a safety warranty, live health, or a substitute for evaluation and
human approval. Concepts, paused records, and retired records cannot be labeled
ready.

## Registry, A2A, and MCP support

- [`docs/AGENT_REGISTRY_SCHEMA.md`](docs/AGENT_REGISTRY_SCHEMA.md) defines the
  versioned registry shape, constraints, evidence statuses, and import behavior.
- [`docs/agent-registry.schema.json`](docs/agent-registry.schema.json) is the matching
  Draft 2020-12 machine-readable contract for editors and tooling.
- [`docs/agent-registry-template.json`](docs/agent-registry-template.json) is a valid,
  intentionally incomplete starter that exposes its own readiness gaps.
- [`docs/agents.json`](docs/agents.json) contains 12 bundled concepts; it does not
  invent endpoints, security reviews, risk tiers, or deployment claims.
- A2A import recognizes current `supportedInterfaces`, provider, version, skills,
  security-scheme, and security-requirement fields. It carries discovery metadata
  into the registry but leaves organization-specific governance evidence missing.
- [`docs/a2a-agent-card-example.json`](docs/a2a-agent-card-example.json) is a
  fictional current-format card that reproduces that import journey.
- MCP import recognizes the official dated `server.json` contract and one official
  Registry API `{ "server": ... }` wrapper. It carries registry identity, package,
  concrete HTTPS remote, and bounded environment/header/argument/variable input
  declarations into a review record without treating them as ownership,
  authentication, tool inventory, or governance proof.
- [`docs/mcp-server-example.json`](docs/mcp-server-example.json) is a fictional
  current-format MCP server that reproduces the adapter and its conservative gaps.

The application never fetches an Agent Card, MCP endpoint, package, or imported
interface. It rejects declared secret values/defaults and retains only bounded
secret-input names as inert notes.

## CLI and GitHub enforcement

The v1.3 CLI applies the browser workspace's parser and readiness policy without a
browser or network request:

```bash
node bin/samsarix-registry.mjs validate docs/agents.json
node bin/samsarix-registry.mjs check docs/review-ready-registry-example.json \
  --require-candidates --now 2026-08-09
node bin/samsarix-registry.mjs report docs/agents.json --format markdown
```

`check` selects `review` and `production` records by default, returns exit code `2`
for policy failures, and offers JSON or escaped GitHub annotations for automation.
Concepts therefore remain honest inventory without breaking deployment CI, while
`--require-candidates` detects an accidentally empty gate.

See [`docs/CI_INTEGRATION.md`](docs/CI_INTEGRATION.md) for exact exit codes, stdin
usage, lifecycle controls, the fictional passing fixture, and a least-privilege
GitHub Actions workflow. GitHub release assets provide an npm-installable CLI
tarball; nothing is published to the npm registry and no stable Action tag is claimed.

## Development commands

| Command                      | Purpose                                                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run serve`              | Serve `docs/` locally on `127.0.0.1:4173`.                                                                                             |
| `npm run lint`               | Validate both registries, safe links, local destinations, CSP, deterministic serialization, legal mirrors, and primary HTML contracts. |
| `npm run registry -- --help` | Inspect the local registry CLI and its policy/exit contract.                                                                           |
| `npm test`                   | Run dependency-free catalog, readiness-policy, security-boundary, export, and site-contract tests.                                     |
| `npm run build`              | Recreate the complete static release in `dist/`.                                                                                       |
| `npm run check`              | Run lint, tests, and build in the same order as CI.                                                                                    |
| `npm run check:links`        | Probe the owner-maintained external-link inventory with bounded HTTPS requests.                                                        |
| `npm run pack:cli`           | Build the CLI-only archive, file manifest, and checksums in `release/` (requires Git and npm).                                         |

There are no npm runtime or development dependencies. `package-lock.json` records
the package identity and Node compatibility for deterministic installation.

The protected `validate` check also requires packaged CLI tests on Windows and
Linux with Node 22 and 24. Tests unpack and offline-install the real archive, check
its exact contents and hashes, exercise the installed executable and all commands,
and retain security/error-code coverage. The matrix also runs controller state and
recovery tests with a minimal DOM/storage adapter and a fixed review clock. These
execute the actual browser module but do not replace rendered browser, accessibility,
or device testing. Browser QA notes are in the productization record.

Build release assets from a clean checkout with `npm run pack:cli`. Outputs include
the source revision and dirty-state marker; do not publish a dirty build. Rebuilding
identical content reuses the output, but different existing files are never replaced.
Use `npm run pack:cli -- --out <new-directory>` when testing another build. The
archive is repeatable with the same source and npm toolchain; byte identity across
different npm versions is not promised. A checksum is not a signed attestation.

## Architecture

- `docs/index.html` — product landing page and secondary repository directory
- `docs/registry.html` — accessible local readiness workspace and fallbacks
- `docs/assets/readiness.mjs` — pure schema normalization, validation, scoring,
  filtering, and deterministic export logic
- `docs/assets/registry-app.mjs` — browser persistence, import/export, recovery, and
  safe DOM rendering
- `docs/agents.json` — bundled concept inventory
- `docs/agent-registry-template.json` — portable starter registry
- `docs/a2a-agent-card-example.json` and `docs/mcp-server-example.json` — fictional
  portable metadata adapter fixtures
- `docs/CI_INTEGRATION.md` — CLI, GitHub Action, lifecycle, and exit-code contract
- `action.yml`, `bin/`, and `scripts/registry-cli.mjs` — dependency-free CI and
  command-line enforcement using the shared policy module
- `docs/assets/catalog.mjs`, `docs/assets/app.mjs`, and `docs/portals.json` — retained
  secondary directory journey
- `scripts/` — dependency-free validation, build, local serving, and external-link review
- `scripts/package-cli.mjs` — explicit CLI-only staging and release integrity metadata;
  `docs/CLI_DISTRIBUTION.md` becomes the archive's self-contained README
- `tests/` — unit and integration contracts for the product and release artifact
- `docs/PRODUCTIZATION.md` — living assessment, priorities, evidence, and release gates
- `docs/THREAT_MODEL.md` — maintained and legacy trust boundaries

GitHub Actions validates the project and publishes only the generated `dist/`
directory to GitHub Pages on pushes to `main`. The root `action.yml` also exposes
the bounded readiness check to caller repositories without write permissions. The
site and action have no hosted backend or ongoing API, database, AI-token,
telemetry, or per-user infrastructure cost.

## Security and privacy

Imported JSON and restored browser state are untrusted. The product applies bounded
parsing and schemas, rejects credential-shaped keys, permits only HTTPS interface
URLs without embedded credentials or credential-like query/fragment values, blocks
future-dated evidence and unversioned active interfaces, and renders values through
text nodes. Markdown export HTML-encodes tag openers. It uses a
restrictive Content Security Policy and has no third-party runtime scripts, fonts,
analytics, remote model calls, or live endpoint probes.

Local-first does not mean encrypted: browser storage is readable by someone with
access to the browser profile and is subject to device/browser controls. Do not
import secrets, prompts, traces, production conversations, personal data, or
sensitive architecture metadata that is inappropriate for that device. Export is an
explicit download; resetting clears only this application's saved registry.
CLI and action output may expose the same metadata in local terminals or CI logs;
use appropriate repository access and log-retention controls.

Report vulnerabilities privately to `support@samsarix.com`; do not open a public
issue containing exploit details. See [`SECURITY.md`](SECURITY.md) and
[`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md).

### Owner gates before production promotion

Do not promote this release candidate as production-ready until the repository owner
has:

1. revoked the GitHub personal access token found in tracked history;
2. rotated or disabled the three Zapier catch hooks found in tracked history;
3. decided whether Git history containing the now-removed conversation/context
   exports needs coordinated rewriting and cache-removal requests;
4. established provenance and redistribution approval for retained binaries and
   historical datasets; and
5. obtained appropriate legal review of the Business Source License scope,
   trademark policy, and any commercial offering.

The public Pages repository settings were verified on 2026-08-11: workflow-based
publishing is HTTPS-enforced and limited to `main`, while `main` requires the
`validate` check, pull-request flow, and resolved conversations and disallows force
pushes and deletion. Repository administrators retain recovery bypass access.

Current-tree redaction does not revoke credentials or erase earlier commits.

## Limitations and project status

- The registry does not run agents or MCP servers, fetch discovery metadata, install
  packages, probe endpoints, monitor production behavior, or replace an
  evaluation/observability system.
- A2A discovery metadata cannot prove internal ownership, data handling, evaluation,
  human oversight, incident response, or approval.
- MCP Registry metadata cannot prove tool behavior, accountable ownership,
  authentication, data handling, security review, oversight, or operational
  readiness. This adapter is not a substitute for official schema validation.
- Readiness policy is deterministic and intentionally conservative, but teams must
  review whether its gates and evidence are sufficient for their own risk context.
- Browser storage is single-device, has no collaboration history or signed approval,
  and may be cleared by browser policy or the user.
- External link availability is reviewed weekly and before prereleases, but a
  successful request is not represented as service health, safety, or endorsement.
- Archived pages and the Android, Discord, Zapier, orchestration, and deployment
  folders are preserved prototypes, not supported product runtime.
- Historical Python dependency text is retained only as hash-recorded, quarantined
  snapshots under `legacy/dependency-snapshots/`; the files are excluded from
  supported build inputs and are not safe environment specifications.
- Identified current-tree conversation, context, workspace-output, and runtime-log
  exports were removed. Git-history treatment plus remaining PDF, ZIP, APK, audio,
  and dataset provenance still require an owner-controlled retention decision.

See [`docs/EXTERNAL_LINKS.md`](docs/EXTERNAL_LINKS.md) for the owner review process,
[`docs/SECURITY_REVIEW.md`](docs/SECURITY_REVIEW.md) for the prerelease audit, and
[`CONTRIBUTING.md`](CONTRIBUTING.md) before proposing changes.

## Ownership and license

Copyright © 2026 Samsarix LLC. The Samsarix-authored Licensed Work identified in
[`LICENSE`](LICENSE) is source-available under the Business Source License 1.1
(`BUSL-1.1`). Its Additional Use Grant permits specified personal, educational,
charitable, and internal-business production use; hosted, managed, substitute, or
other production use may require a separate written commercial agreement.

Each covered version changes to the GNU Affero General Public License v3 or later on
the date stated in `LICENSE` or the fourth anniversary of its first public BSL
distribution, whichever comes first. BSL protects commercial substitution during
the change period but is not an Open Source license before that transition.

Legacy and third-party material is excluded unless its file expressly says otherwise.
See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md),
[`TRADEMARKS.md`](TRADEMARKS.md), and [`LICENSE.PROPRIETARY`](LICENSE.PROPRIETARY).
Commercial and general inquiries: `contact@samsarix.com`; product support and
security reports: `support@samsarix.com`.

These notices implement the owner's stated licensing direction but are not legal
advice; counsel should review them before production or commercial promotion.
