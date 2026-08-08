# Productization record

## Current repository assessment

The repository originally described a large “portal constellation,” but the checked-in, deployable surface is a collection of static HTML pages under `docs/`. It also contains archived conversations and logs, duplicated portal prototypes, incomplete Android/Node/Python experiments, deployment scripts, and claims about services that are not implemented here. The previous README documented nonexistent `src/`, `tests/`, `examples/`, development requirements, CI, API documentation, and an MIT license.

The first maintained product release was **Samsarix Hub Directory**: a dependency-free static catalog from Samsarix LLC that lets someone discover the pages actually bundled in this repository and distinguishes them from external or archived destinations. That release remains useful as a secondary repository directory, but a general portfolio navigator now overlaps the canonical Samsarix Field Guide.

The owner authorized a differentiated next release on 2026-08-08. The maintained product is evolving into **Samsarix Agent Readiness Registry**: a vendor-neutral, local-first workspace for inventorying AI agents, normalizing portable manifests, and explaining the evidence missing before deployment or integration. The accepted product decision, evidence, readiness model, and non-goals are recorded in [`AGENT_REGISTRY_PRODUCT.md`](AGENT_REGISTRY_PRODUCT.md). “Helix” remains only where needed for repository URLs, filenames, or clearly historical artifacts.

## Target user and primary use case

The initial target user is an individual builder or team of roughly 2–50 people prototyping agents across A2A, MCP, framework-specific, or custom interfaces without an enterprise control plane. The primary journey is: open a bundled inventory, understand why each agent is or is not ready, import a local Samsarix registry or A2A Agent Card, review explainable evidence gates and blockers, and export a deterministic JSON or Markdown review packet.

The existing repository-directory journey remains available as a secondary path for Samsarix collaborators and evaluators.

## Key product and architecture decisions

- Keep GitHub Pages and `docs/` as the sole maintained runtime surface; do not introduce a second host or backend for the first registry release.
- Use semantic HTML, CSS, ES modules, and a versioned JSON catalog with no runtime packages or third-party CDN assets.
- Add a portable, versioned agent-registry schema, with bounded local-file import and deterministic export. Normalize A2A Agent Cards without making network requests or treating discovery metadata as governance proof.
- Calculate readiness from visible evidence gates and critical blockers. Treat the numerical result as a workflow signal, not a compliance certification or safety warranty.
- Persist imported records only in the current browser, provide an explicit reset path, and never accept credential-bearing fields, prompts, traces, or production conversation data.
- Treat “included,” “external,” and “archive” as lifecycle facts rather than claiming that every link is live.
- Validate catalog schema, safe URL protocols, unique IDs, local destination existence, core accessibility hooks, and the release artifact with Node's standard library.
- Keep experimental mobile, bot, webhook, orchestration, and archived material out of the core journey. They remain evidence and prototypes, not supported product features.
- Do not add authentication, a database, analytics, AI APIs, live endpoint probing, or a backend; none is needed to prove the local readiness-review journey.

## Bounded ecosystem research

The 2026-08-08 registry decision used official A2A discovery/specification material, Microsoft Agent Registry, Backstage, NIST AI RMF, LangSmith, and OWASP Agentic Top 10 sources. The concrete comparisons and citations are maintained in [`AGENT_REGISTRY_PRODUCT.md`](AGENT_REGISTRY_PRODUCT.md). The resulting wedge is pre-deployment inventory and evidence review for smaller teams, not runtime observability or an enterprise tenant control plane.

- GitHub documents both branch-folder and Actions-based Pages publishing, and warns that published sites are public even when a repository may be private. Because this repository contains logs and archived conversations outside `docs/`, the release uses an explicit generated `dist/` artifact rather than publishing the repository root: <https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>.
- LinkStack demonstrates that a multi-user, self-hosted link manager can offer themes and administration, but those capabilities bring a server, database, accounts, updates, and a separate license boundary. This repository only needs a curated owner-maintained catalog, so the static wedge is intentionally narrower: <https://github.com/LinkStackOrg/LinkStack>.
- WCAG 2.2 target-size guidance informed the 44–48 CSS-pixel interactive controls and visible focus treatment: <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>.
- Lychee is a credible later option for scheduled external-link checks across HTML/Markdown/text, but external availability is inherently flaky and no owner review cadence is configured yet: <https://github.com/lycheeverse/lychee-action>.

## Assumptions

- GitHub Pages remains the intended distribution channel because the existing deployment publishes `docs/`.
- Imported inventory data can be sensitive architecture metadata. The first release therefore keeps processing and persistence on-device and makes exports an explicit user action.
- An A2A Agent Card establishes discoverable identity and interface metadata, but does not by itself establish internal ownership, data handling, evaluation, oversight, or operational readiness.
- Samsarix LLC is the owner-provided company identity, with `contact@samsarix.com` and `support@samsarix.com` as the confirmed contact routes. The repository implements the requested BSL/commercial direction, subject to counsel review before production promotion.
- Existing legacy artifacts must be preserved unless a later owner-approved cleanup explicitly archives or removes them.

## Baseline command results

Recorded on 2026-07-28 at commit `52a7375b614aca8b3b88843e8e5ab3798239e938` before implementation:

| Command/check | Result |
| --- | --- |
| `git status --short --branch --untracked-files=all` | Clean `main`, tracking `origin/main`. |
| `python -m pytest tests/ -v --cov=src` | Failed: `tests/` did not exist; zero tests collected. |
| `npm test --prefix zapier-integration -- --runInBand` | Failed: `jest` was not installed and no lockfile was present. |
| Documented paths | `src/`, `tests/`, `examples/`, `requirements-dev.txt`, and `.github/workflows/ci.yml` were absent. |
| Docker readiness | Docker was unavailable locally; the root Dockerfile also referenced absent `backend/`, `Shadow/`, and `scripts/` paths. |
| Android readiness | Gradle and project wrapper/settings files were absent; the checked-in APK cannot be reproduced from documented steps. |

Registry-increment baseline recorded on 2026-08-08 at `00efe5a576d4874bd4b9d8c86ac90748816815e5` before implementation:

| Command/check | Result |
| --- | --- |
| `git status --short --branch --untracked-files=all` | Clean updated `main` before branching; work continues on `agent/competitive-offering`. |
| `npm ci` | The first attempt did not complete in the local Windows environment despite a dependency-free lockfile; the exact stalled `npm ci` process was stopped without touching unrelated Node processes. A later bounded clean-install command passed; see current verification evidence below. |
| `npm run check` | Pending at baseline; completed successfully after implementation as recorded below. |
| Existing maintained surface | Dependency-free static site under `docs/`, Node standard-library checks/tests/build, and GitHub Pages deployment from generated `dist/`. |
| Product overlap | The generic directory overlaps the canonical Field Guide, so the new work must remain a distinct agent-readiness workflow rather than another portfolio homepage. |

## Findings and implementation checklist

### P0

- [x] Replace the misleading README with setup and product documentation that matches the repository.
- [x] Replace the primary loading/CDN page with a self-contained core journey and explicit failure state.
- [x] Add deterministic checks, tests, and a build artifact.
- [x] Consolidate Pages deployment to one workflow that runs the real checks before publishing.
- [x] Implement the complete registry journey: sample inventory, bounded import, explainable assessment, local persistence, filtering, and deterministic export.
- [x] Update the first viewport, README, release artifact, and checks so product claims match the implemented registry rather than the earlier directory-only product.
- [x] Re-run bounded clean-install, full check, build/artifact, and primary-journey verification for the registry release.

### P1

- [x] Separate bundled, external, and archived destinations in the product model.
- [x] Remove third-party runtime scripts/fonts from the primary page and add a restrictive CSP.
- [x] Add responsive, keyboard-focus, reduced-motion, empty, loading, and error behavior.
- [x] Add a repository threat model for the security review.
- [x] Finish the repository-wide security candidate validation and apply locally actionable fixes.
- [x] Quarantine the incomplete backend manifests, remove exact duplicate root Android build files, and consolidate duplicate deployment workflows.
- [x] Add unit and integration coverage for schema normalization, A2A import, critical blockers, stale evidence, secret-bearing input rejection, persistence boundaries, and exports.
- [x] Add accessible, responsive loading, empty, validation-failure, reset, and recovery states for the workspace.
- [x] Publish a starter registry manifest, machine-readable JSON Schema, A2A example, and precise trust-boundary documentation.

### P2

- [ ] Add an owner-maintained process for reviewing external link freshness.
- [ ] Normalize or archive duplicate historical HTML and documentation after owner review.
- [ ] Decide whether the Android, Discord, webhook, and generator prototypes should be extracted into separate repositories or removed.
- [ ] Add a dependency-free CLI and GitHub check only after the browser schema and readiness policy stabilize with real inventories.
- [ ] Validate demand before considering team history, signed approvals, managed hosting, or enterprise imports.

## Release acceptance criteria

- `npm ci` succeeds without runtime dependencies.
- `npm run check` passes from the repository root.
- The built `dist/` contains the complete `docs/` site.
- Every catalogued local destination exists and every external destination uses HTTPS.
- Search and lifecycle/category filtering work without remote services.
- Empty, load-failure, no-JavaScript, reduced-motion, mobile, keyboard, and 404 paths are represented.
- A single least-privilege Pages workflow gates deployment on the checks.
- No locally actionable P0 issue remains.
- The README and UI make limitations, source-available licensing, privacy behavior, ownership, and legacy scope explicit.
- A first-time visitor can understand the agent-readiness job from the first viewport and identify why a bundled concept is not deployable.
- A valid Samsarix registry and a current A2A Agent Card import locally; malformed, oversized, duplicate-ID, unsafe-URL, and credential-bearing input fail safely with an actionable message.
- Every record exposes its readiness gates, score rationale, blockers, and stale-review state; concept lifecycle records cannot be labeled ready.
- Search plus lifecycle, risk, and readiness filters work locally, and JSON/Markdown exports are deterministic and useful without this application.
- Browser storage behavior, reset semantics, import limits, non-goals, and the absence of telemetry/network execution are visible to the user.

## Completed work

- Chose and implemented the static directory product wedge.
- Added a versioned catalog, safe filtering logic, responsive UI, lifecycle semantics, and graceful fallback paths.
- Added dependency-free lint/check, unit tests, a local server, and a deterministic build.
- Added a repository threat model and this living record.
- Added one validation-gated, least-privilege Pages workflow and removed three overlapping workflows that mutated source or published without the product checks.
- Moved the unusable backend Docker/requirements manifests under `legacy/` and removed exact root duplicates of the preserved mobile prototype build files.
- Replaced the duplicate root portal entry points with a safe redirect to `docs/` and preserved their original versions under `legacy/portal-prototypes/`.
- Redacted token-shaped GitHub credentials and non-placeholder Zapier hook URLs from current text files and the preserved ZIP; rotation and Git-history cleanup remain owner actions.
- Required authentication and bounded inputs for the Zapier service prototype, made Discord deployment authorization fail closed, bounded voice capture, removed shell command composition, contained generator output paths, and required local database/cache secrets.
- Removed remote executable scripts and font imports from the Pages artifact, pinned every privileged GitHub Action to an immutable revision, and repaired the agent gallery's bundled links.
- Verified the built journey in a real browser at desktop and 390×844 mobile sizes, including search, lifecycle filtering, bundled navigation, and a clean browser console.
- Rebranded the maintained product to Samsarix, added public ownership/support routes, and replaced conflicting legacy license claims with a scoped BSL 1.1 release, commercial notice, trademark policy, third-party boundary, and contributor gate.
- Researched current agent discovery, inventory, evaluation, and governance offerings and selected a differentiated local-first Agent Readiness Registry wedge with explicit v1.1 acceptance criteria.
- Implemented the local registry workspace with a 12-concept starter inventory, one-version browser persistence, explicit two-step reset, search, lifecycle/risk/readiness/stale filters, detailed evidence tables, and ordinary loading/empty/error/recovery states.
- Added bounded Samsarix registry and A2A Agent Card import with a 1 MiB/500-agent limit, iterative structural and credential-field scans, duplicate/enum/length validation, HTTPS-only interface URLs, and no remote fetching or agent execution.
- Added deterministic normalized JSON and human-readable Markdown review packets, including control-syntax neutralization and visible score/blocker disclaimers.
- Published a prose schema, Draft 2020-12 JSON Schema, starter manifest, fictional current-format A2A example, and citation metadata for adoption and attribution.
- Updated the first viewport, product metadata, package/legal identity, security policy, threat model, supporting directory, and generated social card to Samsarix Agent Readiness Registry v1.1.0-rc.1.

## Deferred and owner-blocked work

- The owner authorized pushing this work and merging validated changes to `main`; the existing Pages workflow will deploy the allowlisted `dist/` artifact after that merge. No custom domain, environment rule, live service, credential, or external account setting is created or changed here.
- Counsel review remains recommended for the BSL scope, Additional Use Grant, Change License, trademark policy, and future commercial agreement; the obsolete pricing domains and unsupported click-through proprietary terms were removed.
- The provenance and release status of the checked-in APK, PDFs, archives, exported conversations, and logs require owner review before removal or redistribution decisions.
- Credentials and external account configuration for Railway, Discord, Zapier, Manus, domains, and app signing are intentionally not fabricated.
- A historical GitHub PAT and three Zapier bearer hooks must be revoked/rotated by the account owner; current-tree redaction cannot invalidate them or erase Git history.
- Tracked conversation, context, ChatGPT, and ZIP exports contain personal or non-public material. Removal/redaction and any coordinated history rewrite require owner approval and a retention decision.

## Known risks

- The repository remains much larger and less coherent than the maintained static product because legacy material is preserved.
- External URLs can change independently; the product labels them external and does not fabricate health.
- Secondary prototypes may contain security or reliability flaws and must not be deployed as supported services without separate hardening.
- Production promotion remains blocked on credential rotation, personal-data disposition, Pages settings, and legal review even though the generated `dist/` artifact passes its local acceptance checks.
- Readiness policy can create false confidence if scores are detached from evidence. The registry must keep blockers and evidence references primary and must not describe a score as certification.
- Browser persistence reduces service-side exposure but is not encrypted storage; users must be told not to import secrets, prompts, traces, or sensitive production content.

## Final verification evidence

Registry release-candidate evidence recorded on 2026-08-08 on `agent/competitive-offering`:

| Verification | Result |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | Passed in 5 seconds; dependency-free lockfile was current. |
| `node --check docs/assets/readiness.mjs`, `node --check docs/assets/registry-app.mjs`, `node --check scripts/check.mjs` | Passed with no syntax errors. |
| `npm run check` | Passed: 22 catalog entries and 12 agent records validated, 20/20 tests passed, and `dist/` rebuilt. |
| Readiness/adversarial fixtures | Passed for valid and stale ready records, bundled concepts, current A2A normalization, concrete authentication/data/operations requirements, published schema/example, duplicate IDs, HTTP/credential URLs, credential-bearing fields, malformed/oversized input, deterministic JSON/Markdown, Markdown control syntax, and composed filters. |
| Built-artifact HTTP smoke | Eight contracts passed: landing page, registry, bundled registry, template, policy module, and social card returned 200 with expected content/types; missing and traversal-shaped paths returned 404. |
| Source/artifact parity | `docs/` and rebuilt `dist/` each contained 44 files with zero missing or hash-mismatched paths. |
| Social image | One image-generation edit produced `docs/assets/og-agent-registry.png`; text, spelling, safe margins, palette, and project metadata reference were visually inspected. |
| Browser visual automation | Not run for this increment because the applicable Sites workflow requires explicit user request before browser QA. Responsive, keyboard-focus, reduced-motion, semantic/fallback, and live-region behavior is covered by implementation review and static contracts, not a new rendered-browser claim. |
| Formal Codex Security diff scan | Not run: the desktop scan launcher returned `Transport closed` before issuing a scan ID. It was not retried or represented as completed; local threat-model review, bounded-input tests, syntax checks, CSP contracts, and the adversarial fixtures above remain the available evidence. |

Earlier directory-release evidence is retained below for historical traceability.

Recorded against the release-candidate working tree on 2026-07-28:

| Verification | Result |
| --- | --- |
| `npm ci` | Passed; one root package audited, zero vulnerabilities. |
| `npm run check` | Passed: repository checks, 7/7 tests, and deterministic `dist/` build. |
| Secondary Node syntax checks | Passed for the portal generator, MCP adapter, Discord voice commander, and Zapier prototype. |
| Local HTTP smoke test | `index.html` and catalog returned 200; missing and traversal-shaped paths returned 404. |
| Browser journey | Search returned Phoenix for “resilience”; archive filter returned two destinations; bundled gallery navigation succeeded; final console had zero errors and warnings. |
| Mobile layout | 390×844 viewport visually inspected with readable hierarchy and controls; no visible horizontal overflow. |
| Credential-shape scan | No GitHub-token patterns or non-placeholder Zapier-hook patterns remain in current text or archived text entries. |

## Distribution and sustainability

Distribute as a static GitHub Pages artifact built from `docs/`. Hosting cost is effectively the repository/Pages plan plus normal maintainer time; the core product has no API, database, AI-token, or telemetry cost. The local registry is the free adoption surface. Plausible later revenue comes from managed private registries, policy packs, signed approval history, GitHub enforcement, migration/review services, and contracted support—but only after real demand and a separately approved security/operating model. No market demand or product-market fit is claimed.
