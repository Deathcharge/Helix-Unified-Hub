# Samsarix Agent Readiness CLI

This is the CLI-only distribution of Samsarix Agent Readiness Registry, from
Samsarix LLC. It helps individual builders and small platform teams turn Samsarix
registries, A2A Agent Cards, or MCP Registry metadata into a deployment review.
It runs locally with Node.js 22 or newer: no account, API key, network request,
package installation, or npm dependency is needed after extraction.

It is a release candidate, not a safety or compliance certification. The check
assesses declared metadata; it does not inspect referenced evidence, call agents,
install MCP servers, or attest that a review actually occurred.

## Download and verify

Download the named `*-cli.tgz`, `*-cli.manifest.json`, and `*-cli.sha256` assets from
the [GitHub release](https://github.com/Deathcharge/Helix-Unified-Hub/releases/tag/v1.3.0-rc.2).
GitHub's automatic **Source code** archives contain the full source snapshot,
including retained legacy material; they are not this minimal distribution.

Before extraction, compare the archive's SHA-256 with its entry in the downloaded
checksum file. On Linux use `sha256sum -c samsarix-agent-readiness-registry-1.3.0-rc.2-cli.sha256`;
on macOS use `shasum -a 256 -c samsarix-agent-readiness-registry-1.3.0-rc.2-cli.sha256`.
In PowerShell run:

```powershell
Get-FileHash .\samsarix-agent-readiness-registry-1.3.0-rc.2-cli.tgz -Algorithm SHA256
Get-Content .\samsarix-agent-readiness-registry-1.3.0-rc.2-cli.sha256
```

Checksums detect mismatches, not publisher identity: obtain them from the trusted
release, not an untrusted mirror. The manifest records the source Git revision,
whether that checkout was dirty, and SHA-256 hashes for all package files except
the manifest itself. Release assets must report `source.dirty: false`. The
manifest is build metadata, not a signed attestation.

## First successful run

Extract into a new directory (the archive contains a `package/` folder). The `tar`
command is available on current Windows, macOS, and Linux systems:

```bash
mkdir samsarix-cli
tar -xzf samsarix-agent-readiness-registry-1.3.0-rc.2-cli.tgz -C samsarix-cli
cd samsarix-cli/package
node bin/samsarix-registry.mjs --version
node bin/samsarix-registry.mjs validate docs/mcp-server-example.json
node bin/samsarix-registry.mjs check docs/review-ready-registry-example.json --require-candidates --now 2026-08-09
node bin/samsarix-registry.mjs report docs/review-ready-registry-example.json --format markdown --now 2026-08-09
```

The fictional review fixture passes at the pinned example date. The MCP fixture
validates but is deliberately not ready: discovery metadata does not prove internal
ownership, tool behavior, authentication, data handling, or governance evidence.
To reproduce a failing policy check (exit `2`):

```bash
node bin/samsarix-registry.mjs check docs/mcp-server-example.json --include-development --require-candidates --now 2026-08-09
```

Start your own file from `docs/agent-registry-template.json`. Its intentionally
incomplete fields expose what you need to supply. `docs/agent-registry.schema.json`
provides the editor contract. Pass an absolute path or a path relative to your
current directory, and omit `--now` for a real current-time check.

## Optional local npm installation

The tarball is also npm-installable without contacting a registry. From an existing
consumer project, use the explicit local archive path:

```bash
npm install --offline --ignore-scripts --no-audit --no-fund ./samsarix-agent-readiness-registry-1.3.0-rc.2-cli.tgz
node node_modules/samsarix-agent-readiness-registry/bin/samsarix-registry.mjs --help
```

npm creates a local `samsarix-registry` executable for npm scripts. This optional
installation changes that consumer project's manifest/lockfile. No package has
been published to the npm registry; `private: true` prevents accidental publication.

## Commands and outcomes

- `validate <file|-> [--format text|json]`: parse and normalize a supported manifest.
- `check <file|-> [--format text|json|github]`: gate `review,production` by default.
  `--include-development`, `--lifecycle all`, and `--require-candidates` adjust selection.
- `report <file|-> --format json|markdown`: export a deterministic review packet.
- `--help` and `--version`: inspect the installed command contract.

Exit codes are `0` success, `2` policy failure, `64` usage error, `65` invalid or
oversized data, `66` unreadable input, and `70` internal error. `-` reads JSON from
stdin. Inputs are limited to 1 MiB and 500 records. Evidence older than 180 days or
dated in the future blocks readiness. Never import secrets, private conversations,
or metadata inappropriate for the device or CI log. Output is not encrypted.

## Scope and support

The archive contains only the CLI entry point, shared parser/policy, fictional
starter fixtures, JSON Schema, this guide, and controlling legal/citation notices.
It excludes the web application, sample profile gallery, GitHub Action, deployment
prototypes, historical binaries/datasets, Git history, and development scripts.
Use the [source repository](https://github.com/Deathcharge/Helix-Unified-Hub) for
development, the [browser workspace](https://deathcharge.github.io/Helix-Unified-Hub/registry.html)
for local browser review, and the
[CI integration guide](https://github.com/Deathcharge/Helix-Unified-Hub/blob/main/docs/CI_INTEGRATION.md)
for the separately distributed GitHub Action.

Samsarix-authored work is source-available under `LICENSE` (BSL 1.1 with the stated
AGPL v3-or-later transition). `NOTICE`, `THIRD_PARTY_NOTICES.md`, `TRADEMARKS.md`,
and `CITATION.cff` retain the ownership and attribution boundaries. This archive
does not change the license or resolve the historical repository's credential,
retention, provenance, or legal-review gates. Support/security:
`support@samsarix.com`; commercial/general inquiries: `contact@samsarix.com`.
