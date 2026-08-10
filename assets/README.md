# Archived source material

This root `assets/` directory contains Helix-era prototypes, exports, binaries,
generated material, and historical deployment notes. It is not the maintained
Samsarix Agent Readiness Registry runtime; the published product assets live under
`docs/assets/`.

Do not build or deploy the Docker, Railway, Streamlit, Discord, or Python material
from this directory based on historical “ready” or “complete” labels. Its former pip
manifests generated 80 of the repository's 130 open Dependabot alerts recorded on
2026-08-10. Their exact contents are now preserved with non-installable extensions
under [`legacy/dependency-snapshots/`](../legacy/dependency-snapshots/README.md).

Any extraction requires a current owner, provenance and retention review, fresh
dependencies and lockfiles, credential rotation, a threat model, tests, and a
separately approved release boundary.
