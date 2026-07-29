# Productization record

## Current repository assessment

The repository originally described a large “portal constellation,” but the checked-in, deployable surface is a collection of static HTML pages under `docs/`. It also contains archived conversations and logs, duplicated portal prototypes, incomplete Android/Node/Python experiments, deployment scripts, and claims about services that are not implemented here. The previous README documented nonexistent `src/`, `tests/`, `examples/`, development requirements, CI, API documentation, and an MIT license.

The maintained product is now **Samsarix Hub Directory**: a dependency-free static catalog from Samsarix LLC that lets someone discover the pages actually bundled in this repository and distinguishes them from external or archived destinations. “Helix” remains only where needed for repository URLs, filenames, or clearly historical artifacts.

## Target user and primary use case

The target user is a Samsarix collaborator, evaluator, or curious visitor who wants a reliable map of this repository without private infrastructure or tribal knowledge. The primary journey is: open the site, understand its lifecycle labels, search or filter the catalog, and open a checked local page or explicitly external destination.

## Key product and architecture decisions

- Keep GitHub Pages and `docs/` as the sole maintained runtime surface.
- Use semantic HTML, CSS, ES modules, and a versioned JSON catalog with no runtime packages or third-party CDN assets.
- Treat “included,” “external,” and “archive” as lifecycle facts rather than claiming that every link is live.
- Validate catalog schema, safe URL protocols, unique IDs, local destination existence, core accessibility hooks, and the release artifact with Node's standard library.
- Keep experimental mobile, bot, webhook, orchestration, and archived material out of the core journey. They remain evidence and prototypes, not supported product features.
- Do not add authentication, a database, analytics, AI APIs, or a backend; none is needed for the directory.

## Bounded ecosystem research

- GitHub documents both branch-folder and Actions-based Pages publishing, and warns that published sites are public even when a repository may be private. Because this repository contains logs and archived conversations outside `docs/`, the release uses an explicit generated `dist/` artifact rather than publishing the repository root: <https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>.
- LinkStack demonstrates that a multi-user, self-hosted link manager can offer themes and administration, but those capabilities bring a server, database, accounts, updates, and a separate license boundary. This repository only needs a curated owner-maintained catalog, so the static wedge is intentionally narrower: <https://github.com/LinkStackOrg/LinkStack>.
- WCAG 2.2 target-size guidance informed the 44–48 CSS-pixel interactive controls and visible focus treatment: <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>.
- Lychee is a credible later option for scheduled external-link checks across HTML/Markdown/text, but external availability is inherently flaky and no owner review cadence is configured yet: <https://github.com/lycheeverse/lychee-action>.

## Assumptions

- GitHub Pages remains the intended distribution channel because the existing deployment publishes `docs/`.
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

## Findings and implementation checklist

### P0

- [x] Replace the misleading README with setup and product documentation that matches the repository.
- [x] Replace the primary loading/CDN page with a self-contained core journey and explicit failure state.
- [x] Add deterministic checks, tests, and a build artifact.
- [x] Consolidate Pages deployment to one workflow that runs the real checks before publishing.

### P1

- [x] Separate bundled, external, and archived destinations in the product model.
- [x] Remove third-party runtime scripts/fonts from the primary page and add a restrictive CSP.
- [x] Add responsive, keyboard-focus, reduced-motion, empty, loading, and error behavior.
- [x] Add a repository threat model for the security review.
- [x] Finish the repository-wide security candidate validation and apply locally actionable fixes.
- [x] Quarantine the incomplete backend manifests, remove exact duplicate root Android build files, and consolidate duplicate deployment workflows.

### P2

- [ ] Add an owner-maintained process for reviewing external link freshness.
- [ ] Normalize or archive duplicate historical HTML and documentation after owner review.
- [ ] Decide whether the Android, Discord, webhook, and generator prototypes should be extracted into separate repositories or removed.

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

## Deferred and owner-blocked work

- Production deployment is not performed without explicit owner authorization.
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

## Final verification evidence

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

Distribute as a static GitHub Pages artifact built from `docs/`. Hosting cost is effectively the repository/Pages plan plus normal maintainer time; the core product has no API, database, AI-token, or telemetry cost. A plausible sustainability model is portfolio/community infrastructure maintained alongside the flagship project, with paid implementation or support handled outside this repository if the owner chooses. No market demand is claimed.
