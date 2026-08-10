# Published site

This directory is the complete GitHub Pages source for Samsarix Agent Readiness
Registry. It intentionally has no package, CDN, API, database, or telemetry runtime
dependency.

The maintained product files are:

- `index.html` for the product landing page and secondary repository directory;
- `registry.html` plus `assets/registry-app.mjs` for the local workspace;
- `assets/readiness.mjs` for schema validation, A2A/MCP normalization, readiness
  policy, filtering, and deterministic exports;
- `agents.json` for the honest bundled concepts;
- `agent-registry-template.json` for a valid starter inventory; and
- `review-ready-registry-example.json` for a fictional passing CI fixture;
- `CI_INTEGRATION.md` for the CLI, GitHub Action, lifecycle, and exit-code contract;
- `AGENT_REGISTRY_SCHEMA.md` plus `agent-registry.schema.json` for the prose and
  machine-readable portable contract; and
- `a2a-agent-card-example.json` and `mcp-server-example.json` for reproducible
  fictional portable-metadata imports.

The repository root additionally contains `action.yml`, `bin/`, and
`scripts/registry-cli.mjs`. Those supported-LTS Node entry points reuse `assets/readiness.mjs`
without adding a runtime package, network call, or second policy implementation.

Run the root checks after changing product data, policy, UI, legal files, or release
assets:

```bash
npm run check
```

The secondary `portals.json` directory retains deliberately narrow lifecycle values:

- `included`: bundled in this directory and validated during the build;
- `external`: an HTTPS destination controlled outside this site; and
- `archive`: preserved historical context, not a maintained-service claim.

Do not add a `live`, `healthy`, `safe`, `certified`, or production-ready claim without
a documented and bounded verification process. A readiness score is a workflow
signal and its blockers must remain visible.

`LICENSE.txt` and `NOTICE.txt` mirror the controlling repository-root files so every
published artifact carries its license and attribution. The workflow publishes the
generated root `dist/` directory, never the full repository.
