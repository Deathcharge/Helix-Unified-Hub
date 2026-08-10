# Archived source material

This root `assets/` directory contains Helix-era prototypes, exports, binaries,
generated material, and historical deployment notes. It is not the maintained
Samsarix Agent Readiness Registry runtime; the published product assets live under
`docs/assets/`.

Do not build or deploy the Docker, Railway, Streamlit, Discord, or Python material
from this directory based on historical “ready” or “complete” labels. Its former pip
manifests generated 80 of the repository's 130 open Dependabot alerts recorded on
2026-08-10. Their exact contents are now preserved under quarantined `.snapshot`
names outside supported dependency discovery and build inputs; see
[`legacy/dependency-snapshots/`](../legacy/dependency-snapshots/README.md).

The former `Dockerfile`, `Dockerfile.streamlit`, and `docker-compose.yml` entry
points are likewise retained only as `*.container-snapshot` and
`*.compose-snapshot` files. They are evidence, not supported Docker or Compose
inputs.

Any extraction requires a current owner, provenance and retention review, fresh
dependencies and lockfiles, credential rotation, a threat model, tests, and a
separately approved release boundary.
