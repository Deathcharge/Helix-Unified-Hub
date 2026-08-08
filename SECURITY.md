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

The maintained static agent-readiness registry and secondary directory on the latest `main` branch are in scope. Historical
exports and prototypes are retained for reference and are not supported production
services. See `docs/THREAT_MODEL.md` for the trust boundaries and known owner gates.

Historical credential-shaped values were redacted from the current tree, but
redaction does not revoke credentials or remove them from earlier Git history.
