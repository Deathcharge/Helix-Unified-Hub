# Samsarix Hub Directory

> **Portfolio status:** preserved consolidation source. The public [Samsarix Field Guide](https://github.com/Deathcharge/samsarix-field-guide) is the canonical portfolio navigator and now carries the shared lifecycle/boundary guidance. See [`CONSOLIDATION.md`](CONSOLIDATION.md). This repository remains intact; no archive or deletion action is implied.

Samsarix Hub Directory is a small, dependency-free website from Samsarix LLC for
exploring the useful material in this repository. It presents bundled agent
profiles, developer metadata, external destinations, and legacy concepts with
explicit lifecycle labels instead of implying that every historical portal is a
running service.

The project is a release candidate. The static directory and its build checks are
maintained; the Android, Discord, Zapier, orchestration, deployment, and historical
artifact folders are preserved prototypes and are not part of the supported runtime.

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

Open `http://127.0.0.1:4173/`. No environment variables, credentials, database,
account, or external Samsarix service is required.

If that port is occupied, set `SAMSARIX_HUB_PORT` to another local port before
running `npm run serve`.

## What users can do

1. Search the catalog by name, purpose, or tag.
2. Filter by category and lifecycle.
3. Open a destination bundled in this Pages site.
4. Follow an explicitly labeled external link in a separate tab.
5. Browse preserved concepts without mistaking them for maintained services.

Catalog entries live in [`docs/portals.json`](docs/portals.json). The browser code
renders values with DOM text nodes, validates destination protocols, and does not
inject catalog HTML.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run serve` | Serve `docs/` locally on `127.0.0.1:4173`. |
| `npm run lint` | Validate catalog data, safe links, local destinations, CSP, legal files, and primary HTML contracts. |
| `npm test` | Run dependency-free unit and integration checks with Node's test runner. |
| `npm run build` | Copy the release site to `dist/`. |
| `npm run check` | Run lint, tests, and build in the same order as CI. |

There are no npm runtime dependencies. `package-lock.json` makes installation
behavior deterministic.

## Deployment

GitHub Actions validates the project and publishes the generated `dist/` directory
to GitHub Pages on pushes to `main`. Production deployment, custom domains, and
environment protection rules remain owner-controlled settings; this repository does
not provision or mutate them.

## Architecture

- `docs/index.html` — accessible application shell and fallback content
- `docs/assets/styles.css` — responsive visual system with reduced-motion support
- `docs/assets/catalog.mjs` — pure catalog filtering and URL safety functions
- `docs/assets/app.mjs` — load, success, empty, and failure UI behavior
- `docs/portals.json` — versioned source of truth for catalog entries
- `scripts/` — dependency-free validation, build, and local serving
- `tests/` — catalog, legal-surface, and primary-journey checks
- `docs/PRODUCTIZATION.md` — assessment, decisions, priorities, gates, and remaining work
- `docs/THREAT_MODEL.md` — repository-wide security boundaries and severity model

All other root-level application material is legacy or experimental unless this
README says otherwise.

## Security and privacy

The maintained site is static, has no authentication, makes no analytics calls,
collects no personal data, and does not require a backend. The primary page uses a
restrictive Content Security Policy and no third-party runtime CDN. External
destinations leave this trust boundary and are labeled accordingly.

Report vulnerabilities privately to `support@samsarix.com`; do not open an issue
containing exploit details. See [`SECURITY.md`](SECURITY.md) and
[`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md).

### Owner gates before production

Do not promote this release candidate to production until the repository owner has:

1. revoked the GitHub personal access token found in tracked history;
2. rotated or disabled the three Zapier catch hooks found in tracked history;
3. removed, redacted, or explicitly approved the tracked conversation/context
   exports and decided whether Git history needs rewriting; and
4. confirmed the GitHub Pages environment, domain, and branch-protection settings.

The current tree and preserved ZIP were scrubbed of GitHub-token and non-placeholder
Zapier-hook values. That does not revoke credentials or erase earlier commits.

## Limitations and project status

- External link availability is not guaranteed or represented as live health.
- Archived pages retain historical wording and may describe unimplemented ideas.
- The checked-in Android APK is not a supported release and has no reproducible
  signed-build path here.
- Optional integration prototypes require separate dependency, credential,
  authorization, retry, and operational hardening before use.
- Legacy logs, exports, PDFs, and conversation archives remain pending an
  owner-controlled retention decision.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) before proposing changes.

## Ownership and license

Copyright © 2026 Samsarix LLC. The Samsarix-authored Licensed Work identified in
[`LICENSE`](LICENSE) is source-available under the Business Source License 1.1
(`BUSL-1.1`). Its Additional Use Grant permits specified personal, educational,
charitable, and internal-business production use; hosted, managed, substitute, or
other production use may require a separate written commercial agreement.

Each covered version changes to the GNU Affero General Public License v3 or later on
the date stated in `LICENSE` or the fourth anniversary of its first public BSL
distribution, whichever comes first. BSL is not an Open Source license before that
transition.

Legacy and third-party material is excluded unless its file expressly says otherwise.
See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md),
[`TRADEMARKS.md`](TRADEMARKS.md), and [`LICENSE.PROPRIETARY`](LICENSE.PROPRIETARY).
Commercial and general inquiries: `contact@samsarix.com`.

These repository notices implement the owner's stated licensing direction but are
not legal advice; counsel should review them before the release is promoted.
