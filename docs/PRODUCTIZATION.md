# Productization record

## Current repository assessment

The repository originally described a large “portal constellation,” but the checked-in, deployable surface is a collection of static HTML pages under `docs/`. It originally contained archived conversations and logs and still retains duplicated portal prototypes, incomplete Android/Node/Python experiments, deployment scripts, binaries, and claims about services that are not implemented here. The previous README documented nonexistent `src/`, `tests/`, `examples/`, development requirements, CI, API documentation, and an MIT license.

The first maintained product release was **Samsarix Hub Directory**: a dependency-free static catalog from Samsarix LLC that lets someone discover the pages actually bundled in this repository and distinguishes them from external or archived destinations. That release remains useful as a secondary repository directory, but a general portfolio navigator now overlaps the canonical Samsarix Field Guide.

The owner authorized a differentiated next release on 2026-08-08. The maintained product is evolving into **Samsarix Agent Readiness Registry**: a vendor-neutral, local-first workspace for inventorying AI agents, normalizing portable manifests, and explaining the evidence missing before deployment or integration. The accepted product decision, evidence, readiness model, and non-goals are recorded in [`AGENT_REGISTRY_PRODUCT.md`](AGENT_REGISTRY_PRODUCT.md). “Helix” remains only where needed for repository URLs, filenames, or clearly historical artifacts.

## Target user and primary use case

The initial target user is an individual builder or team of roughly 2–50 people prototyping agents across A2A, MCP, framework-specific, or custom interfaces without an enterprise control plane. The primary journey is: open a bundled inventory, understand why each agent is or is not ready, import a local Samsarix registry, A2A Agent Card, or MCP Registry `server.json`, review explainable evidence gates and blockers, and export a deterministic JSON or Markdown review packet.

The existing repository-directory journey remains available as a secondary path for Samsarix collaborators and evaluators.

## Key product and architecture decisions

- Keep GitHub Pages and `docs/` as the sole maintained runtime surface; do not introduce a second host or backend for the first registry release.
- Use semantic HTML, CSS, ES modules, and a versioned JSON catalog with no runtime packages or third-party CDN assets.
- Add a portable, versioned agent-registry schema, with bounded local-file import and deterministic export. Normalize A2A Agent Cards and official MCP Registry server metadata without making network requests or treating discovery metadata as governance proof.
- Calculate readiness from visible evidence gates and critical blockers. Treat the numerical result as a workflow signal, not a compliance certification or safety warranty.
- Persist imported records only in the current browser, provide an explicit reset path, and never accept credential-bearing fields, prompts, traces, or production conversation data.
- Treat “included,” “external,” and “archive” as lifecycle facts rather than claiming that every link is live.
- Validate catalog schema, safe URL protocols, unique IDs, local destination existence, core accessibility hooks, and the release artifact with Node's standard library.
- Keep experimental mobile, bot, webhook, orchestration, and archived material out of the core journey. They remain evidence and prototypes, not supported product features.
- Do not add authentication, a database, analytics, AI APIs, live endpoint probing, or a backend; none is needed to prove the local readiness-review journey.

## Bounded ecosystem research

The 2026-08-08 registry decision used official A2A discovery/specification material, Microsoft Agent Registry, Backstage, NIST AI RMF, LangSmith, and OWASP Agentic Top 10 sources. The concrete comparisons and citations are maintained in [`AGENT_REGISTRY_PRODUCT.md`](AGENT_REGISTRY_PRODUCT.md). The resulting wedge is pre-deployment inventory and evidence review for smaller teams, not runtime observability or an enterprise tenant control plane.

- GitHub documents both branch-folder and Actions-based Pages publishing, and warns that published sites are public even when a repository may be private. Because this repository retains legacy, binary, and data artifacts outside `docs/`, the release uses an explicit generated `dist/` artifact rather than publishing the repository root: <https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site>.
- LinkStack demonstrates that a multi-user, self-hosted link manager can offer themes and administration, but those capabilities bring a server, database, accounts, updates, and a separate license boundary. This repository only needs a curated owner-maintained catalog, so the static wedge is intentionally narrower: <https://github.com/LinkStackOrg/LinkStack>.
- WCAG 2.2 target-size guidance informed the 44–48 CSS-pixel interactive controls and visible focus treatment: <https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html>.
- Lychee is a credible later option for scheduled external-link checks across HTML/Markdown/text, but external availability is inherently flaky and no owner review cadence is configured yet: <https://github.com/lycheeverse/lychee-action>.

## Assumptions

- GitHub Pages remains the intended distribution channel because the existing deployment publishes `docs/`.
- Imported inventory data can be sensitive architecture metadata. The first release therefore keeps processing and persistence on-device and makes exports an explicit user action.
- An A2A Agent Card establishes discoverable identity and interface metadata, but does not by itself establish internal ownership, data handling, evaluation, oversight, or operational readiness.
- An MCP Registry `server.json` establishes discovery, distribution, transport, and configuration-input metadata, but does not establish tool behavior, accountable ownership, authentication, data handling, security review, oversight, or operational readiness.
- Samsarix LLC is the owner-provided company identity, with `contact@samsarix.com` and `support@samsarix.com` as the confirmed contact routes. The repository implements the requested BSL/commercial direction, subject to counsel review before production promotion.
- Existing legacy artifacts must be preserved unless a later owner-approved cleanup explicitly archives or removes them.

## Baseline command results

Recorded on 2026-07-28 at commit `52a7375b614aca8b3b88843e8e5ab3798239e938` before implementation:

| Command/check                                         | Result                                                                                                                  |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `git status --short --branch --untracked-files=all`   | Clean `main`, tracking `origin/main`.                                                                                   |
| `python -m pytest tests/ -v --cov=src`                | Failed: `tests/` did not exist; zero tests collected.                                                                   |
| `npm test --prefix zapier-integration -- --runInBand` | Failed: `jest` was not installed and no lockfile was present.                                                           |
| Documented paths                                      | `src/`, `tests/`, `examples/`, `requirements-dev.txt`, and `.github/workflows/ci.yml` were absent.                      |
| Docker readiness                                      | Docker was unavailable locally; the root Dockerfile also referenced absent `backend/`, `Shadow/`, and `scripts/` paths. |
| Android readiness                                     | Gradle and project wrapper/settings files were absent; the checked-in APK cannot be reproduced from documented steps.   |

Registry-increment baseline recorded on 2026-08-08 at `00efe5a576d4874bd4b9d8c86ac90748816815e5` before implementation:

| Command/check                                       | Result                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short --branch --untracked-files=all` | Clean updated `main` before branching; work continues on `agent/competitive-offering`.                                                                                                                                                                                                   |
| `npm ci`                                            | The first attempt did not complete in the local Windows environment despite a dependency-free lockfile; the exact stalled `npm ci` process was stopped without touching unrelated Node processes. A later bounded clean-install command passed; see current verification evidence below. |
| `npm run check`                                     | Pending at baseline; completed successfully after implementation as recorded below.                                                                                                                                                                                                      |
| Existing maintained surface                         | Dependency-free static site under `docs/`, Node standard-library checks/tests/build, and GitHub Pages deployment from generated `dist/`.                                                                                                                                                 |
| Product overlap                                     | The generic directory overlaps the canonical Field Guide, so the new work must remain a distinct agent-readiness workflow rather than another portfolio homepage.                                                                                                                        |

## Findings and implementation checklist

### 2026-08-31 rollout follow-up: content-versioned registry assets

The first public check after PR #22 found a mixed-version runtime in an already-open
Firefox test session: the new Add control was visible, but Add still produced the
old `Imported 1 agent` replacement behavior. This was reproduced separately with
fictional A2A/MCP files (total remained 1 instead of 2), not dismissed as a flaky
test. Chrome and WebKit passed the public check. All test data was reset. The
earlier clean-source checks did not cover this cached upgrade path.

The registry HTML now refers to content-versioned script/style URLs. The controller
and import helper also use versioned dependency URLs, with one identical readiness
module URL in both. `scripts/version-registry-assets.mjs` calculates canonical-LF
SHA-256 versions from leaves to parents; a policy change updates both importers
and the HTML entry point. It adds no bundler or runtime package. `--write` performs
the bounded mechanical reference update; lint and build refuse stale references,
and build checks before removing the old artifact. Tests cover idempotence, source
immutability, dependency propagation, LF/CRLF stability, and missing/ambiguous
references. The four-way OS/Node matrix includes these checks.

The same Firefox session passed the seven-group smoke with the new source before
publication. The final public same-session upgrade and fresh-session result are
recorded on the follow-up PR after deployment. This is cache invalidation, not
cryptographic integrity verification, immutable server-side asset retention, or an
offline application. The host can still serve a previously cached HTML document
until it refreshes; export backups remain important. No policy or CLI behavior,
license, host, dependency count, or historical release asset changed.

### 2026-08-31 continuation: safe multi-agent inventory assembly

Baseline: clean `main` at `c1e5300aee5457c07068616c40de5ec98bc7ca56` (PR #21).
Every successful file import immediately replaced the current inventory and its
saved copy. Combining individual A2A cards and MCP definitions required manual JSON
editing, and replacement had no confirmation despite reset already being guarded.

Added an explicit browser Import mode: Replace inventory or Add agents. The first
replacement of the bundled sample is one-step; imported/restored or unreadable
saved data is protected by a native confirmation. Cancel preserves current and
saved records. Add preserves all existing records and workspace fields, including
the declared update date. Conflicting IDs reject the entire batch without changing
evidence. The pure preparation helper clones/normalizes inputs and checks combined
500-agent and canonical UTF-8 1 MiB bounds before mutation. The saved-size check also
covers replacement: compact source JSON can expand beyond the restore limit.
No implicit updates, per-record editor, or CLI merge command is claimed.

Regression coverage includes source immutability, mixed-format assembly, duplicate
batches, the 500/501 boundary, UTF-8 aggregate limits, normalized size expansion,
replacement cancellation/acceptance, restored-data protection, and import-mode
capture before asynchronous reads. Existing latest-selection/reset-race, storage
failure, and recovery checks remain in place. The Windows/Ubuntu Node 22/24 matrix
also runs the new pure import-helper tests alongside browser-controller contracts.

Rendered verification used isolated Chrome 151.0.7922.175, Firefox 153.0, and WebKit
26.5 Windows test sessions with local source overrides for the four changed web
files before publication. The final seven-group smoke passed in all three: native
confirmations, additive A2A/MCP imports, atomic duplicate rejection, three-agent
reload, malformed-file retention, byte-exact combined JSON/Markdown downloads,
confirmed replacement, keyboard navigation, 320/390/768/1280px width checks, and
reset cleanup. Firefox initially restored the Add select value across reload; a
separate reproduction confirmed this, and explicit initialization now enforces
the documented Replace default. The ordinary Node suite does not emulate browsers.

The CLI sometimes yields at native dialogs while its function continues running.
`scripts/browser-smoke-result.mjs` now requires an explicit final seven-group result;
exit 0 from the initial invocation alone is never a pass. This test-only marker is
page memory, not application code or persisted inventory. A failed or incomplete
result fails closed. The maintainer guide documents both commands and the limits.

Local `npm run check` passed 85/85 tests, lint, and build; focused import/controller
and smoke-harness tests, syntax, and `git diff --check` passed. Deployment and final
unmodified-public-site evidence will be attached to this increment's PR after CI.
The published `v1.3.0-rc.2` tag/assets, readiness policy, CLI, runtime dependency
count, license, host, and privacy boundary are unchanged. This remains a release
candidate, not a production-readiness or accessibility-conformance claim. No new
P1/P2 defect remains in the scoped change after verification; external credential,
provenance, legal, real-user, and physical-device gates below remain open.

### 2026-08-31 continuation: repeatable browser compatibility evidence

Baseline: clean `main` at `169e181a4d7d174f3fdf8c8b4afd511373b342e2`, with
PR #20 deployed. Chromium evidence existed, but Firefox/WebKit support was unproven
and the successful rendered workflow was not available as a repeatable script.

Isolated Firefox 153.0 and WebKit 26.5 test engines exercised the public application
without source overrides. Both imported all three formats, restored saved data,
rejected malformed/oversized/duplicate/credential-field fixtures without changing
the ready record, filtered stale evidence, downloaded matching JSON/Markdown, and
reset back to the bundled concepts. Independent Node comparisons matched both
engines' downloaded bytes against the shared policy output. Keyboard selection,
evidence scrolling, and return navigation also worked. The initial WebKit click
acknowledgment timeout and the narrower scope of a Windows WebKit test engine are
explicitly recorded in [`BROWSER_VERIFICATION.md`](BROWSER_VERIFICATION.md).

Added `scripts/browser-smoke.mjs`, an optional function for Playwright CLI's
`run-code --filename` command, plus a maintainer guide and four dependency-free
safety tests. The smoke check repeats selection, keyboard/overflow/empty behavior,
all three imports, reload, malformed-input recovery, real download parity, and
confirmed reset. It checks the fresh-workspace status before fixture requests or
imports, attempts cleanup after intermediate failure, preserves the original error
when cleanup also fails, and reports the actual engine version and fixed review
date. Real-browser guard verification refused a restored fixture and left it intact.

The final function returned all six passing check groups in Chrome 151.0.7922.175,
Firefox 153.0, and WebKit 26.5. Its fixed date avoids expiring the fictional ready
fixture; it does not change the operating-system clock, production policy, or
application source. The ordinary controller tests remain distinct from rendered
coverage, and browser smoke is optional rather than silently included in
`npm run check` or the required GitHub matrix.

Local verification: `npm ci --ignore-scripts --no-audit --no-fund` passed;
`npm run check` passed 74/74 tests, lint, and build; `node --check
scripts/browser-smoke.mjs` and `git diff --check` passed. The documented pinned
`npx` open/run-code/console/close sequence also passed in Firefox. All four isolated
audit sessions were closed after their test inventories were cleared; final browser
consoles reported zero errors and warnings. Exact-head CI and publication results
belong in the pull-request record.

No product-runtime correction was needed from these checks. No package/lockfile,
CLI release asset, license, hosting configuration, or supported runtime dependency
changed. The optional test engine was downloaded only to the local tool cache with
browser-cache garbage collection disabled; no personal profile or existing browser
installation was replaced. Test artifacts remain under ignored `output/playwright/`.
This closes a verification gap, not the real-user, physical-device, assistive-
technology, credential/history/provenance, or legal release gates.

### 2026-08-31 continuation: keyboard and narrow-screen navigation

Baseline: clean `main` at `5aa58b117552767c2dfd4ddb8ffdd7e0c0b99ddc`, after
PR #19's reset/recovery correction. The maintained product, target user, import
policy, CLI distribution, and external release gates are unchanged.

- **P1, off-screen selection:** at 390×844, selecting Agni focused the detail
  article with scrolling suppressed. Its heading remained at viewport Y=2155,
  so the selected evidence was invisible. Selection now focuses a short, named
  heading with native scrolling enabled and preserves the desktop list's scroll
  position. A normal 44px-minimum button returns to the current selected row,
  including filtered results. No imported identifier enters a CSS selector.
- **P2, keyboard evidence access:** the horizontally overflowing evidence table
  now has an explicit tab stop, named region, visible focus, scroll instructions,
  caption, and scoped column headers. The heading is programmatically focusable
  but not an extra Tab stop. The article is named by that heading rather than
  simultaneously announcing its entire replaced content as a live region;
  result counts and import/error status retain their announcements.
- **P2, narrow navigation overflow:** the shared header forced a 390px document
  width at a 320px viewport. Navigation links now wrap without shrinking their
  touch targets. The established theme and GitHub Pages architecture are retained.

The implementation follows [native focus scrolling](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus),
[keyboard access to overflow regions](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow#accessibility),
and [logical focus order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).
These sources inform the interaction; they are not a conformance certification.

Three new dependency-free controller tests cover title focus and return targets,
filtered/empty focus retention, and evidence-region semantics. The existing page
contract also checks the heading-to-article relationship. These tests execute the
real controller with the small adapter, not a browser layout or screen reader.

Isolated Chromium verification used the Playwright CLI because the in-app browser
runtime could not initialize. Before publication, only the four changed site
resources were overridden with local files in that isolated session. Observed:

- Selection and return worked at widths 320, 390, 768, and 1280 (height 844), with
  a visible 3px keyboard focus outline and no document-level horizontal overflow.
- A desktop list scrolled to 1136px retained that position across selection and
  returned focus to Vega; filtering to Phoenix returned to Phoenix instead.
- Starting from a fresh page, ordinary Tab navigation reached the first agent;
  Space opened its heading, Tab/Enter returned to its row, and the next Tab reached
  the next agent. From the heading, Tab reaches the return button and then the
  evidence region; Right Arrow scrolls its overflowing columns.
- Reduced-motion mode retained automatic rather than smooth scrolling. At 320px,
  the landing, registry, license, security-review, and external-links pages all
  fit the document width. Empty filtering retained input focus and hid the results
  layout completely.

Local verification: `npm ci --ignore-scripts --no-audit --no-fund` passed;
`npm run check` passed all 70 tests, lint, and build; focused controller/page tests
passed 26/26; controller syntax and `git diff --check` passed. Final exact-head
CI/deployment evidence is recorded with this increment's pull request. Browser artifacts remain ignored under
`output/playwright/`. No Safari/Firefox, physical mobile device, screen-reader, or
full WCAG audit is claimed. The CLI policy and published RC2 archive are unchanged;
no new dependency, service, telemetry, storage key, or billable resource is added.

### 2026-08-31 continuation: browser state and recovery

Baseline: clean `main` at `77b0e72e9d903a31f9d109dc31621ce6d2de7d6e`, public RC2
assets, and successful main CI/Pages run `33390034287`. CLI distribution was verified,
but the registry's browser controller had only static source contracts, not direct
event/state regression tests.

An isolated Chromium session exercised the public release. A2A and MCP imports,
reload persistence, and JSON/Markdown downloads worked; downloaded bytes matched the
shared policy's output. Malformed, oversized, duplicate-ID, and credential-field
imports retained the previous inventory. Observed requests were same-origin static
resources and bundled inventories, not imported endpoints or upload requests.

Two concrete gaps were reproduced:

- **P1, reset ordering:** delaying a File read, confirming reset, then completing
  the read changed the workspace from the restored sample back to the imported MCP
  record and saved it again. The controller now invalidates pending reads on a newer
  selection or confirmed reset, ignores obsolete successes/errors, and disarms stale
  confirmation controls. Oversized files can also be selected again immediately.
- **P1, error/recovery visibility:** an empty result set left a 620px blank results
  container above the explanation. The entire empty layout now becomes hidden.
  Storage-removal failures also no longer claim that saved data was removed; they
  explicitly distinguish an in-memory reset from clearing the saved copy.

Sixteen dependency-free controller tests execute the actual module through a small
DOM/storage adapter. They cover sample loading, all import formats, deterministic
JSON download, rejected imports, latest-selection ordering, reset/read races,
confirmation expiry, storage failures, invalid saved-state recovery, stale evidence,
and manual import after sample-load failure. Node's test clock is fixed so the
fictional ready fixture does not expire with wall-clock time. These tests run in
the existing Windows/Linux Node 22/24 compatibility matrix; they are not layout or
assistive-technology emulation.

The in-app browser tool could not start its runtime after two attempts. Browser
verification therefore used an isolated Playwright CLI session, never an existing
user profile. Before publication, the corrected controller was supplied through a
local request override in that session: the same reset race then kept the sample,
storage-removal fault injection produced the explicit warning, and stale filtering
worked. At 390px width the empty layout occupied zero height, its explanation began
16px below the result bar, and no document-level horizontal overflow was observed.
Local screenshots, snapshots, downloads, and fictional fixtures stay under ignored
`output/playwright/`; no personal browser data is included in the repository.

Local verification: `node --test tests/browser-state.test.mjs` passed 16/16;
`npm run check` passed 67/67 tests, lint, and build; controller syntax and
`git diff --check` passed. Final exact-head CI, merge, and unmodified public-browser
verification belong in the pull-request record. This correction does not change the
CLI policy/package or overwrite the published RC2 assets, and it does not close the
credential, historical retention, provenance, legal, or real-user-validation gates.

### 2026-08-31 continuation: distribution and consumer safety

Baseline: clean `main` at `b81dbd18d86fc0cb23c16d0c260a35c3b092affb`, no open
pull requests, `npm run check` passed 46 tests plus lint/build, and all three
post-release scheduled link checks succeeded. `v1.3.0-rc.1` had no downloadable
CLI asset: users had to clone the legacy-heavy repository. The CI guide also pinned
an Action revision from before the August security remediation.

This increment provides a minimal distribution of the existing offline workflow:

- The CLI distribution is staged from an explicit file allowlist, contains no
  runtime dependencies or install scripts, and retains `private: true` to prevent
  accidental npm publication. Website/gallery files, historical assets, prototypes,
  Git history, and the separately distributed Action are not included.
- The archive carries a self-contained README, fictional fixtures, JSON Schema,
  controlling notices, and a byte-hash manifest with source revision/dirty state.
  External SHA-256 files support download integrity checks, not identity attestation.
- Tests exercise the extracted and offline-installed archive, executable shim,
  passing and blocked cases, all commands, deterministic reports, failure exits,
  future evidence, exact contents/hashes, and safe packaging behavior.
- A four-job Windows/Linux, Node 22/24 matrix must succeed before the required
  `validate` check can pass and Pages can deploy.
- The Action example now pins the hardened `b81dbd1` prerelease.
- PR review prompted explicit non-persistent checkout credentials in both workflows
  and the adoption example, enforced by local checks. The Pages workflow defaults
  to no permissions and grants only each job's required scopes. The quick-download
  list names all three assets required for checksum verification.

Bounded research: [npm pack](https://docs.npmjs.com/cli/pack/) supports local tarballs
with scripts disabled, and [GitHub release integrity guidance](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/verify-release-integrity)
distinguishes named release assets from on-demand source archives. The implementation
uses npm's existing packer, not a custom archive format. No new market demand,
signed attestation, public npm publication, or stable-production claim is inferred.

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
- [x] Add a current official MCP Registry `server.json` adapter and fictional fixture with secret-value, URL-template, and no-execution boundaries.
- [x] Add a CLI-only release archive with provenance metadata, checksums, a standalone quickstart, and extracted/offline-installed compatibility tests.

### P2

- [x] Add an owner-maintained process for reviewing external link freshness.
- [ ] Normalize or archive duplicate historical HTML and documentation after owner review.
- [x] Decide whether the Android, Discord, webhook, and generator prototypes should be extracted into separate repositories or removed. They remain unsupported historical material; no extraction or revival is justified without a named owner and demand, while security-relevant runnable paths are hardened in place.
- [x] Add a dependency-free CLI and GitHub check after the browser schema and readiness policy stabilize.
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
- A valid Samsarix registry, current A2A Agent Card, and current MCP Registry `server.json` import locally; malformed, oversized, duplicate-ID, unsafe-URL, credential-bearing, and secret-default input fail safely with an actionable message.
- Every record exposes its readiness gates, score rationale, blockers, and stale-review state; concept lifecycle records cannot be labeled ready.
- Search plus lifecycle, risk, and readiness filters work locally, and JSON/Markdown exports are deterministic and useful without this application.
- Browser storage behavior, reset semantics, import limits, non-goals, and the absence of telemetry/network execution are visible to the user.
- The CLI archive contains exactly the maintained allowlist; it works outside the source checkout after extraction or offline npm installation, with matching file hashes and preserved readiness/error exits.

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
- Added the v1.2 dependency-free registry CLI and JavaScript Action with bounded file/stdin import, stable policy and error exits, deterministic reports, escaped workflow annotations, a fictional passing fixture, and command-level tests using the shared readiness implementation.
- Preserved four unsupported Helix-era pip manifests as hash-recorded, quarantined `.snapshot` files outside supported build inputs and removed their active `requirements*.txt` paths so legacy dependency text no longer masquerades as a supported runtime surface.
- Added the v1.3 MCP metadata adapter for one official dated `server.json` or API response wrapper, with conservative interface mapping, unresolved URL-template handling, secret-input-name summaries, actual secret-value rejection, and no network/package/runtime access.
- Completed a formal standard Codex Security scan against `a2d460e47f5ae2fa1897c6bb38b265a1676f38cb`, removed identified current-tree personal exports, blocked future-dated evidence and unversioned active interfaces, neutralized Markdown raw HTML, rejected credential-like URL values, and hardened the validated legacy WebSocket/DOM paths.
- Added a dependency-free external-link checker, unit tests, a weekly/manual read-only workflow, a curated authoritative-source inventory, and a seven-day owner triage policy.
- Added the v1.3.0-rc.2 CLI-only packer, byte-hash manifest/checksums, self-contained distribution guide, isolated consumer tests, and required Windows/Linux Node 22/24 package compatibility matrix.

## Deferred and owner-blocked work

- The owner authorized pushing and merging validated release increments to `main`; the existing Pages workflow deploys only the allowlisted `dist/` documentation artifact after each merge. On 2026-08-11, `main` protection was enabled with the existing `validate` check, pull-request flow, resolved-conversation enforcement, force-push/deletion blocking, and administrator recovery bypass. The existing main-only Pages environment and HTTPS enforcement were verified; no custom domain, live service, or credential was created.
- Counsel review remains recommended for the BSL scope, Additional Use Grant, Change License, trademark policy, and future commercial agreement; the obsolete pricing domains and unsupported click-through proprietary terms were removed.
- The provenance and release status of the checked-in APK, PDFs, ZIP, audio, and remaining historical datasets require owner review before removal or redistribution decisions.
- Credentials and external account configuration for Railway, Discord, Zapier, Manus, domains, and app signing are intentionally not fabricated.
- A historical GitHub PAT and three Zapier bearer hooks must be revoked/rotated by the account owner; current-tree redaction cannot invalidate them or erase Git history.
- Identified current-tree conversation, context, ChatGPT, workspace-output, Notion-log,
  and runtime-log exports were removed under the owner's repository wrap-up
  authorization. Any coordinated history rewrite, cache request, or private archival
  retention still requires an explicit retention plan.

## Known risks

- The repository remains much larger and less coherent than the maintained static product because legacy material is preserved.
- External URLs can change independently. A weekly/manual check detects reachability
  failures, while the product still does not fabricate service health or safety.
- Secondary prototypes may contain security or reliability flaws and must not be deployed as supported services without separate hardening.
- Production promotion remains blocked on credential rotation, Git-history/personal-data disposition, retained-artifact provenance, and legal review even though the generated `dist/` artifact passes its local acceptance checks.
- Readiness policy can create false confidence if scores are detached from evidence. The registry must keep blockers and evidence references primary and must not describe a score as certification.
- Browser persistence reduces service-side exposure but is not encrypted storage; users must be told not to import secrets, prompts, traces, or sensitive production content.
- On 2026-08-10 GitHub reported 130 open Dependabot alerts: 31 high, 61 medium, and 38 low. All mapped to four unsupported pip manifests, not to the dependency-free root registry package. PR #14 preserved their exact text under `legacy/dependency-snapshots/`, removed the recognized manifest/build paths, and added hash/absence checks. After merge `65b674792b5995ead6226f7ac4328090d9f0a92e`, the dependency graph workflow passed and GitHub reported 0 open alerts without manual dismissal. The snapshots remain unsafe to install merely because their alert records closed.

## Final verification evidence

CLI distribution evidence recorded on 2026-08-31 on
`codex/cli-release-distribution`:

- `npm run check` passed: 27 catalog entries and 12 agents validated, 51/51 tests
  passed, and `dist/` rebuilt. This includes all five new distribution tests.
- The tests extracted the archive and installed it offline into a separate consumer
  directory, then exercised the actual npm executable shim, all three import
  formats, passing/blocked gates, deterministic reports, stdin, malformed/oversized
  data, missing files, and future-dated evidence.
- Both installations contained exactly 16 files, with no runtime dependencies or
  install scripts. Every manifest byte count/hash matched; repeat builds with the
  same toolchain were identical. Different existing output and linked source/output
  directories were refused without overwriting their contents.
- GitHub compatibility/merge/deployment results and the final clean source revision
  belong in the pull request and release record; local tests are not a claim that
  those external checks have already completed.

CLI/action release-candidate evidence recorded on 2026-08-10 on
`agent/registry-cli-v1-2`:

| Verification                                   | Result                                                                                                                                                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci --ignore-scripts --no-audit --no-fund` | Passed; the dependency-free root lockfile was current and declared supported Node.js 22+.                                                                                                                                       |
| Node syntax and action/CLI command tests       | Passed; the executable modules parsed and success, policy, usage, malformed/oversized data, unreadable input, stdin, deterministic report, calendar-date, GitHub escaping, and action-wrapper paths retained their exact exits. |
| `npm run check`                                | Passed: 24 catalog entries and 12 agent records validated, 31/31 tests passed, and `dist/` rebuilt.                                                                                                                             |
| Manual CLI/action smoke                        | Registry validation passed, the fictional review candidate passed at 100/100 with a fixed date, Markdown output rendered, and the Action emitted an escaped GitHub notice.                                                      |
| Source/artifact parity                         | `docs/` and rebuilt `dist/` each contained 46 files with zero path or hash differences; the final ordered manifest digest is recorded in the pull request to avoid a self-referential artifact.                                 |
| Changed-scope credential-pattern scan          | No GitHub token, AWS access-key, private-key header, or non-placeholder Zapier hook pattern was found.                                                                                                                          |
| Remote dependency signal                       | After quarantine merge `65b6747`, GitHub reported 0 open alerts, down from the 130-alert pre-quarantine baseline; no alerts were manually dismissed.                                                                           |

GitHub PR #13 merged the exact reviewed head as `5431913fc3d45b48d934913ad2c8e66344679e07`.
Main run `31424526531` passed validation, the real local Action step, artifact upload,
and Pages deployment; the landing page, registry, CI guide, and ready fixture then
returned HTTP 200 with expected v1.2 content.

Legacy dependency quarantine evidence recorded on 2026-08-10:

- PR #14 merged reviewed head `adaa5f32ac71d73230268812cadcb3eadf5ed564` as
  `65b674792b5995ead6226f7ac4328090d9f0a92e`.
- Main Pages run `31428429232` and dependency-graph run `31428429471` both passed.
- Exact-content renames preserved all four dependency manifests with recorded
  SHA-256 values; the checker enforces their hashes plus absence of all eight former
  dependency/Docker/Compose entry-point paths, including dangling symlinks.
- The GitHub Dependabot API returned 0 open alerts after the default-branch graph
  refresh, down from 130 without manual alert dismissal.

Registry release-candidate evidence recorded on 2026-08-08 on `agent/competitive-offering`:

| Verification                                                                                                            | Result                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci --ignore-scripts --no-audit --no-fund`                                                                          | Passed in 5 seconds; dependency-free lockfile was current.                                                                                                                                                                                                                                                                                    |
| `node --check docs/assets/readiness.mjs`, `node --check docs/assets/registry-app.mjs`, `node --check scripts/check.mjs` | Passed with no syntax errors.                                                                                                                                                                                                                                                                                                                 |
| `npm run check`                                                                                                         | Passed: 22 catalog entries and 12 agent records validated, 20/20 tests passed, and `dist/` rebuilt.                                                                                                                                                                                                                                           |
| Readiness/adversarial fixtures                                                                                          | Passed for valid and stale ready records, bundled concepts, current A2A normalization, concrete authentication/data/operations requirements, published schema/example, duplicate IDs, HTTP/credential URLs, credential-bearing fields, malformed/oversized input, deterministic JSON/Markdown, Markdown control syntax, and composed filters. |
| Built-artifact HTTP smoke                                                                                               | Eight contracts passed: landing page, registry, bundled registry, template, policy module, and social card returned 200 with expected content/types; missing and traversal-shaped paths returned 404.                                                                                                                                         |
| Source/artifact parity                                                                                                  | `docs/` and rebuilt `dist/` each contained 44 files with zero missing or hash-mismatched paths.                                                                                                                                                                                                                                               |
| Social image                                                                                                            | One image-generation edit produced `docs/assets/og-agent-registry.png`; text, spelling, safe margins, palette, and project metadata reference were visually inspected.                                                                                                                                                                        |
| Browser visual automation                                                                                               | Not run for this increment because the applicable Sites workflow requires explicit user request before browser QA. Responsive, keyboard-focus, reduced-motion, semantic/fallback, and live-region behavior is covered by implementation review and static contracts, not a new rendered-browser claim.                                        |
| Formal Codex Security scan                                                                                              | Superseded on 2026-08-11 by completed standard scan `a46ac943-add5-4c90-a081-dcbef68bb61e` against `a2d460e47f5ae2fa1897c6bb38b265a1676f38cb`; eight findings were validated and locally actionable remediations are recorded in `SECURITY_REVIEW.md`.                                                                                                 |

Earlier directory-release evidence is retained below for historical traceability.

Recorded against the release-candidate working tree on 2026-07-28:

| Verification                 | Result                                                                                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci`                     | Passed; one root package audited, zero vulnerabilities.                                                                                                               |
| `npm run check`              | Passed: repository checks, 7/7 tests, and deterministic `dist/` build.                                                                                                |
| Secondary Node syntax checks | Passed for the portal generator, MCP adapter, Discord voice commander, and Zapier prototype.                                                                          |
| Local HTTP smoke test        | `index.html` and catalog returned 200; missing and traversal-shaped paths returned 404.                                                                               |
| Browser journey              | Search returned Phoenix for “resilience”; archive filter returned two destinations; bundled gallery navigation succeeded; final console had zero errors and warnings. |
| Mobile layout                | 390×844 viewport visually inspected with readable hierarchy and controls; no visible horizontal overflow.                                                             |
| Credential-shape scan        | No GitHub-token patterns or non-placeholder Zapier-hook patterns remain in current text or archived text entries.                                                     |

## Distribution and sustainability

Distribute the workspace as a static GitHub Pages artifact built from `docs/`, the CLI as a minimal named GitHub release asset, and the Action as pinned source in the same repository. Hosting cost is effectively the repository/Pages plan plus normal maintainer time; the core product has no API, database, AI-token, or telemetry cost. The local registry and baseline GitHub check are the free adoption surface. Plausible later revenue comes from managed private registries, organization policy packs, signed approval history, migration/review services, and contracted support—but only after real demand and a separately approved security/operating model. No market demand or product-market fit is claimed.
