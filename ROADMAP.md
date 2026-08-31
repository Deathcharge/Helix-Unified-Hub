# Samsarix Agent Readiness Registry roadmap

## Current product boundary

This repository is a standalone, local-first agent inventory and evidence-review
tool for individual builders and small teams. The Samsarix Field Guide remains
the portfolio navigator; Samsarix Unified remains the flagship. Neither is a
runtime dependency, and this roadmap does not authorize changes to either project.
The [accepted product brief](docs/AGENT_REGISTRY_PRODUCT.md) defines the target user,
research, nine-gate policy, and non-goals.

Earlier guidance treated the directory as a consolidation source. That historical
portfolio assessment is superseded for the independently useful registry by the
owner's 2026-08-08 authorization. It does not require migrating or freezing this
product. Historical prototypes remain unsupported; source, binaries, and sensitive
history must not be moved to another repository as an incidental cleanup step.
The historical GitHub name remains a compatibility alias; renaming it is separate
owner-controlled work, not a prerequisite for using the registry.

## Delivered release-candidate capabilities

1. Browser workspace, portable JSON Schema, A2A import, explainable readiness gates,
   and deterministic JSON/Markdown review packets.
2. Dependency-free validate/check/report CLI and a pinned, read-only GitHub Action.
3. Bounded MCP Registry metadata import with secret-value rejection and no execution.
4. Security hardening, current-tree personal-export removal, and external-link review.
5. CLI-only release archive, manifests/checksums, and extracted/offline-installed
   Windows/Linux Node 22/24 compatibility checks.
6. Keyboard evidence navigation, recovery and race-condition coverage, and repeatable
   Chrome/Firefox/WebKit checks with explicit test-completion evidence.
7. Additive multi-agent imports, confirmed replacement, aggregate bounds, and
   content-versioned browser assets for cached upgrade paths.

Latest implementation and deployment evidence is in
[the productization record](docs/PRODUCTIZATION.md). Delivered functionality is not
evidence of customer adoption, legal approval, or production safety.

## Next work, ordered by value

1. Close the external credential, history/retention, provenance, and legal gates in
   the [owner evidence checklist](docs/PRODUCTIZATION.md#owner-evidence-checklist).
   Unknown or undocumented status remains open; do not dismiss alerts to improve
   the appearance of the repository.
2. Run the [first-use pilot protocol](docs/AGENT_REGISTRY_PRODUCT.md#first-use-pilot-protocol)
   with consenting target users. Collect task outcomes and the next real workflow
   need, not private inventories or invented adoption metrics. Fix observed blockers
   before adding more capability.
3. Verify physical Safari/mobile and screen-reader behavior. Test-engine WebKit and
   DOM contracts are useful evidence but do not establish those configurations.
4. Normalize or archive remaining duplicate historical material only after the
   owner decides retention and redistribution boundaries.

Team history, signed approvals, policy packs, live discovery, managed hosting, and
runtime observability are demand-gated possibilities, not promised or partially
implemented features. A new service requires a separately approved security,
privacy, support, and operating-cost model.

## Four distinct gates

| Gate | Evidence required |
| --- | --- |
| Merge | Exact-head tests, reviewed scope, required GitHub checks, and no locally actionable P0 defect. |
| Release-candidate publication | Verified Pages artifact or minimal CLI archive, explicit limitations, recoverable rollout, and recorded verification. |
| Stable/commercial promotion | Applicable owner evidence, acceptable residual risk, and observed target-user workflow results; a green build alone is insufficient. |
| Optional flagship adoption | Explicit owner request, consumer-owned integration contract, compatibility/support owner, and parity/rollback evidence. Never infer this from a standalone merge. |

Keep releases traceable to a commit, commands/results, artifact digest, deployment
or consumer, and rollback path. Preserve existing prerelease assets and Git history;
do not force-push, rewrite history, or migrate another repository implicitly.
