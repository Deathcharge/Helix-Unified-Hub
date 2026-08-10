# Samsarix Agent Readiness Registry

Samsarix Agent Readiness Registry is a dependency-free, local-first web workspace
from Samsarix LLC for answering a practical question: **which AI agents do we have,
and what evidence is still missing before we deploy or integrate them?**

It imports a versioned Samsarix registry or a current A2A Agent Card, normalizes the
metadata without making network requests, evaluates nine visible readiness gates,
and exports deterministic JSON or Markdown review packets. Imported data stays in
the current browser unless the user explicitly exports it.

The initial audience is an individual builder or a team of roughly 2–50 people that
needs an ownership and pre-deployment review workflow before an enterprise control
plane is justified. The product is a v1.2 release candidate: the complete local
review journey and repository-enforced readiness gate are implemented, while
production promotion remains subject to the owner gates below.

The earlier Hub Directory remains available as a secondary repository map. The
[Samsarix Field Guide](https://github.com/Deathcharge/samsarix-field-guide) remains
the canonical portfolio navigator; this repository has the distinct agent-readiness
role documented in [`docs/AGENT_REGISTRY_PRODUCT.md`](docs/AGENT_REGISTRY_PRODUCT.md)
and [`CONSOLIDATION.md`](CONSOLIDATION.md).

## Fastest successful path

Prerequisites:

- Node.js 22 LTS or newer
- npm 10 or newer

```bash
git clone https://github.com/Deathcharge/Helix-Unified-Hub.git
cd Helix-Unified-Hub
npm ci
npm run check
npm run serve
```

Open `http://127.0.0.1:4173/`, choose **Open readiness workspace**, and select a
bundled concept to see its blockers. Import
[`docs/agent-registry-template.json`](docs/agent-registry-template.json) or a local
A2A Agent Card to review your own metadata. No environment variables, credentials,
database, account, AI provider, or private Samsarix service is required.

If that port is occupied, set `SAMSARIX_HUB_PORT` to another local port before
running `npm run serve`.

## Core workflow

1. Start with the honest bundled inventory or download the starter manifest.
2. Import one Samsarix registry JSON document or one A2A Agent Card JSON file.
3. Review purpose, ownership, interface, authentication, data, evaluation,
   security, oversight, and operations evidence.
4. Search and filter by lifecycle, risk, readiness, or stale evidence.
5. Export normalized JSON for version control or Markdown for a human review.
6. Use **Reset sample** twice to explicitly clear the browser-saved inventory and
   restore the bundled concepts.

Files are limited to 1 MiB and 500 agents. Duplicate identifiers, malformed JSON,
non-HTTPS interface URLs, embedded URL credentials, unsupported schema values, and
credential-bearing fields are rejected before the current workspace changes. The
browser renders imported values as text, never imported HTML.

The readiness score is an explainable workflow signal. It is not a compliance
certification, a safety warranty, live health, or a substitute for evaluation and
human approval. Concepts, paused records, and retired records cannot be labeled
ready.

## Registry format and A2A support

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

The application never fetches an Agent Card URL or calls an imported interface.

## CLI and GitHub enforcement

The v1.2 CLI applies the browser workspace's parser and readiness policy without a
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
GitHub Actions workflow. This repository is the current distribution path; no npm
package or stable action tag is claimed.

## Development commands

| Command                      | Purpose                                                                                                                                |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run serve`              | Serve `docs/` locally on `127.0.0.1:4173`.                                                                                             |
| `npm run lint`               | Validate both registries, safe links, local destinations, CSP, deterministic serialization, legal mirrors, and primary HTML contracts. |
| `npm run registry -- --help` | Inspect the local registry CLI and its policy/exit contract.                                                                           |
| `npm test`                   | Run dependency-free catalog, readiness-policy, security-boundary, export, and site-contract tests.                                     |
| `npm run build`              | Recreate the complete static release in `dist/`.                                                                                       |
| `npm run check`              | Run lint, tests, and build in the same order as CI.                                                                                    |

There are no npm runtime or development dependencies. `package-lock.json` records
the package identity and Node compatibility for deterministic installation.

## Architecture

- `docs/index.html` — product landing page and secondary repository directory
- `docs/registry.html` — accessible local readiness workspace and fallbacks
- `docs/assets/readiness.mjs` — pure schema normalization, validation, scoring,
  filtering, and deterministic export logic
- `docs/assets/registry-app.mjs` — browser persistence, import/export, recovery, and
  safe DOM rendering
- `docs/agents.json` — bundled concept inventory
- `docs/agent-registry-template.json` — portable starter registry
- `docs/CI_INTEGRATION.md` — CLI, GitHub Action, lifecycle, and exit-code contract
- `action.yml`, `bin/`, and `scripts/registry-cli.mjs` — dependency-free CI and
  command-line enforcement using the shared policy module
- `docs/assets/catalog.mjs`, `docs/assets/app.mjs`, and `docs/portals.json` — retained
  secondary directory journey
- `scripts/` — dependency-free validation, build, and local serving
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
URLs without embedded credentials, and renders values through text nodes. It uses a
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
3. removed, redacted, or explicitly approved the tracked conversation/context
   exports and decided whether Git history needs rewriting;
4. confirmed GitHub Pages environment, domain, and branch-protection settings; and
5. obtained appropriate legal review of the Business Source License scope,
   trademark policy, and any commercial offering.

Current-tree redaction does not revoke credentials or erase earlier commits.

## Limitations and project status

- The registry does not run agents, fetch Agent Cards, probe endpoints, monitor
  production behavior, or replace an evaluation/observability system.
- A2A discovery metadata cannot prove internal ownership, data handling, evaluation,
  human oversight, incident response, or approval.
- Readiness policy is deterministic and intentionally conservative, but teams must
  review whether its gates and evidence are sufficient for their own risk context.
- Browser storage is single-device, has no collaboration history or signed approval,
  and may be cleared by browser policy or the user.
- External directory-link availability is not represented as live health.
- Archived pages and the Android, Discord, Zapier, orchestration, and deployment
  folders are preserved prototypes, not supported product runtime.
- Historical Python dependency text is retained only as hash-recorded,
  non-installable snapshots under `legacy/dependency-snapshots/`; it is not a safe
  environment specification for those prototypes.
- Legacy logs, exports, PDFs, binaries, and conversation archives remain pending an
  owner-controlled provenance and retention decision.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) before proposing changes.

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
