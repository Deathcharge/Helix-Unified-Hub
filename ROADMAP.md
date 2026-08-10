# Samsarix Agent Readiness Registry roadmap

This roadmap separates four gates: merge, release, publication, and flagship adoption. Passing one does not imply the next.

## 2026-08-08 product direction

The repository owner explicitly authorized further development into a competitive
offering. The product must still avoid competing with the Samsarix Field Guide as a
general portfolio front door. Its differentiated direction is now **Samsarix Agent
Readiness Registry**: a local-first, vendor-neutral inventory and pre-deployment
evidence workspace for AI agents.

The accepted product brief, market evidence, initial user, non-goals, readiness
model, and v1.1 acceptance criteria are in
[`docs/AGENT_REGISTRY_PRODUCT.md`](docs/AGENT_REGISTRY_PRODUCT.md).

Release sequence:

1. **Implemented for v1.1 RC:** static registry workspace, portable prose and JSON
   Schema contracts, A2A Agent Card import, explainable readiness assessment, and
   deterministic review-packet export.
2. **Implemented for v1.2 RC:** dependency-free validate/check/report CLI, exact
   policy exit codes, escaped GitHub annotations, and a read-only JavaScript Action
   using the shared bounded parser and evaluator.
3. **Implemented for v1.3 RC:** bounded official MCP Registry `server.json` import,
   conservative secret-input handling, and shared browser/CLI/Action readiness gaps.
4. Validate demand before any multi-user service, live discovery, or runtime
   observability integration.

The next evidence gate is external use: collect real registry fixtures, policy-gap
reports, workflow adoption, and requests for collaboration or signed approval
history. Do not infer demand from repository traffic alone or add a hosted control
plane before that signal exists.

The earlier consolidation guidance below remains historical context and a constraint
against generic portfolio duplication; it no longer freezes differentiated product
work authorized by the owner.

## Product boundary

Portfolio role: **merge/consolidation candidate**. Preserve the productized branch and migrate unique assets into the canonical Samsarix surface through an explicit consolidation plan; do not maintain two competing implementations.
Preferred future repository identity: `Deathcharge/samsarix-agent-readiness-registry`; the historical remote name remains owner-controlled.

Current disposition: The truthful productization state is merged. General lifecycle/boundary guidance has been represented in the canonical Field Guide without migrating source, binaries, exports, or sensitive-history categories. Preserve this repository as a consolidation source while credential, retention, rename, freeze, and archive decisions remain owner-controlled.

## Stabilize the productized default

- Keep the default branch buildable from a clean checkout and preserve exact-head CI evidence.
- Keep Samsarix LLC branding, package identity, license metadata, and compatibility aliases internally consistent.
- Preserve the pre-productization default under a rollback ref before merging; do not delete legacy history.
- Review priority: Rotate historical credential categories, decide personal-data/binary retention, and stop treating this maintained directory as a competing general portfolio front door.

## Release candidate

- Inventory unique routes, schemas, content, and deployment behavior.
- Migrate one bounded slice at a time with parity evidence and redirects where needed.
- Stop duplicate feature work once the canonical destination passes acceptance tests.

Current hardening backlog:

- Near-total functional duplication with the flagship's gallery and the stronger portfolio Field Guide.
- High repository burden: 396 tracked paths, ~64 MB, and ~46,000 code/markup lines, mostly outside the maintained product.
- Historical credentials require account-side revocation/rotation; Git history still contains sensitive categories.
- Tracked conversations/context/logs may contain personal or non-public data; retention and history rewrite are unresolved.
- APK/ZIP/PDF/data provenance and redistribution approval are unverified.
- Source-available BSL plus excluded legacy/third-party material is difficult to communicate and maintain.
- Remote description remains “Lol it's a H. U. B,” repository/product branding differs, and there is no release.

## Samsarix adoption

- Define a public API, event, schema, artifact, or deployment contract before connecting to Samsarix Unified.
- Add a consumer-owned contract fixture covering authentication, privacy, limits, errors, and version compatibility.
- Make one implementation canonical; remove or freeze duplicate behavior only after parity and rollback are proven.
- Record an owner, support level, compatibility window, and measurable adoption signal.

## Completion evidence

A milestone is complete only when its exact commit, commands and results, artifact digest, consumer or deployment, and rollback path are recorded in a pull request or release record. README claims must not exceed that evidence.
