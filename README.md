# Helix Hub Directory

Helix Hub Directory is a small, dependency-free website for exploring the useful material in this repository. It presents bundled agent profiles, developer metadata, external destinations, and legacy concepts with explicit lifecycle labels instead of implying that every historical portal is a running service.

The project is a release candidate. The static directory and its build checks are maintained; the Android, Discord, Zapier, orchestration, deployment, and historical artifact folders are preserved prototypes and are not part of the supported runtime.

## Fastest setup

Prerequisites:

- Node.js 20 or newer
- npm 10 or newer

```bash
git clone https://github.com/Deathcharge/Helix-Unified-Hub.git
cd Helix-Unified-Hub
npm ci
npm run check
npm run serve
```

Open `http://127.0.0.1:4173/`. No environment variables, credentials, database, account, or external Helix service is required.

If that port is occupied, set `HELIX_HUB_PORT` to another local port before running `npm run serve`.

## What users can do

1. Search the catalog by name, purpose, or tag.
2. Filter by category and lifecycle.
3. Open a destination bundled in this Pages site.
4. Follow an explicitly labeled external link in a separate tab.
5. Browse preserved concepts without mistaking them for maintained services.

Catalog entries live in [`docs/portals.json`](docs/portals.json). The browser code renders values with DOM text nodes, validates destination protocols, and does not inject catalog HTML.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run serve` | Serve `docs/` locally on `127.0.0.1:4173`. |
| `npm run lint` | Validate catalog data, safe links, local destinations, CSP, and primary HTML contracts. |
| `npm test` | Run dependency-free unit and integration checks with Node's test runner. |
| `npm run build` | Copy the release site to `dist/`. |
| `npm run check` | Run lint, tests, and build in the same order as CI. |

There are no npm runtime dependencies. `package-lock.json` makes installation behavior deterministic.

## Deployment

GitHub Actions validates the project and publishes the generated `dist/` directory to GitHub Pages on pushes to `main`. Production deployment, custom domains, and environment protection rules remain owner-controlled settings; this repository does not provision or mutate them.

## Architecture

- `docs/index.html` — accessible application shell and fallback content
- `docs/assets/styles.css` — responsive visual system with reduced-motion support
- `docs/assets/catalog.mjs` — pure catalog filtering and URL safety functions
- `docs/assets/app.mjs` — load, success, empty, and failure UI behavior
- `docs/portals.json` — versioned source of truth for catalog entries
- `scripts/` — dependency-free validation, build, and local serving
- `tests/` — catalog and primary-journey checks
- `docs/PRODUCTIZATION.md` — assessment, decisions, priorities, gates, and remaining work
- `docs/THREAT_MODEL.md` — repository-wide security boundaries and severity model

All other root-level application material is legacy or experimental unless this README says otherwise.

## Security and privacy

The maintained site is static, has no authentication, makes no analytics calls, collects no personal data, and does not require a backend. The primary page uses a restrictive Content Security Policy and no third-party runtime CDN. External destinations leave this trust boundary and are labeled accordingly.

Report security concerns through GitHub's private vulnerability reporting if it is enabled for the repository; otherwise contact the owner privately rather than opening an issue containing exploit details. See [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md) for the detailed model.

### Owner gates before production

Do not publish this release candidate until the repository owner has:

1. revoked the GitHub personal access token found in tracked history;
2. rotated or disabled the three Zapier catch hooks found in tracked history;
3. removed, redacted, or explicitly approved the tracked conversation/context exports and decided whether Git history needs rewriting; and
4. confirmed the license parameters and Pages environment settings.

The current working tree and the preserved ZIP have been scrubbed of GitHub-token and non-placeholder Zapier-hook values. That does not revoke credentials or erase earlier commits.

## Limitations and project status

- External link availability is not guaranteed or represented as live health.
- Archived pages retain their original wording and may describe unimplemented ideas.
- The checked-in Android APK is not a supported release and has no reproducible signed-build path here.
- Optional integration prototypes require separate dependency, credential, authorization, retry, and operational hardening before use.
- Legacy logs, exports, PDFs, and conversation archives remain in the repository pending an owner-controlled retention decision.

Contributions should keep the directory independently useful, avoid new runtime services unless they solve a demonstrated need, and include tests for catalog or behavior changes.

## License status

The repository contains `LICENSE` (Business Source License 1.1 text with project-specific parameters) and `LICENSE.PROPRIETARY`. Those files supersede earlier README claims of an MIT license. Their exact applicability and parameters require owner/legal confirmation; no license change is made by this productization work.
