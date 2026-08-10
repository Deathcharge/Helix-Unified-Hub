# Legacy and experimental material

The maintained product in this repository is the static site under `docs/`. Other application code, deployment scripts, generated outputs, exported conversations, logs, mobile files, integrations, and architecture drafts are preserved for historical context or future extraction; they are not part of the supported release unless the root README says otherwise.

Do not deploy these surfaces based on historical “production ready,” “live,” or “complete” language inside archived files. Re-evaluate credentials, permissions, dependencies, authorization, data retention, external endpoints, tests, and licensing before reuse.

Historical Python dependency text is preserved under
[`dependency-snapshots/`](dependency-snapshots/README.md) with non-installable
`.snapshot` extensions and recorded hashes. The original `requirements*.txt` paths
were quarantined after GitHub associated 130 open alerts with them. Reconstruct and
lock dependencies from current authoritative sources before reviving any prototype.
