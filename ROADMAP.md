# Samsarix Hub Directory roadmap

This roadmap separates four gates: merge, release, publication, and flagship adoption. Passing one does not imply the next.

## Product boundary

Portfolio role: **merge/consolidation candidate**. Preserve the productized branch and migrate unique assets into the canonical Samsarix surface through an explicit consolidation plan; do not maintain two competing implementations.
Planned repository identity: `Deathcharge/samsarix-hub-directory` (merge-then-consolidate).

Current disposition: Merge the truthful productization state, then consolidate deliberately.

## Stabilize the productized default

- Keep the default branch buildable from a clean checkout and preserve exact-head CI evidence.
- Keep Samsarix LLC branding, package identity, license metadata, and compatibility aliases internally consistent.
- Preserve the pre-productization default under a rollback ref before merging; do not delete legacy history.
- Review priority: Rotate historical credential categories, decide personal-data/binary retention, migrate unique catalog content, and stop separate deployment investment.

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
