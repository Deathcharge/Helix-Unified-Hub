# Security policy

## Reporting a vulnerability

Email `support@samsarix.com` with the subject `Security: Samsarix Agent Registry`.
Include the affected path or commit, impact, reproduction steps, and any suggested
mitigation. Do not include active credentials or sensitive personal data; describe
how Samsarix LLC can obtain sensitive evidence safely.

Please do not open a public issue for an unpatched vulnerability. Samsarix LLC will
acknowledge reports when operationally possible, but this release candidate does not
promise a response or remediation service level.

## Supported scope

The maintained static agent-readiness registry, A2A/MCP metadata adapters, CLI,
Action, and secondary directory on the latest `main` branch are in scope. Historical
exports and prototypes are retained for reference and are not supported production
services. See `docs/THREAT_MODEL.md` for the trust boundaries and known owner gates.

Historical credential-shaped values were redacted from the current tree, but
redaction does not revoke credentials or remove them from earlier Git history.
Identified conversation, context, workspace-output, Notion-log, and runtime-log
exports containing or likely to contain personal/non-public material were also
removed from the current tree. Their earlier Git-history and cache disposition is a
separate owner-controlled retention decision.

Unsupported Helix-era Python dependency lists are retained only as hash-recorded
files under `legacy/dependency-snapshots/`; they are not supported manifests and
must not be installed. Reconstruct, lock, scan, and review any dependencies in a
separate maintained project before reusing legacy prototype code.
