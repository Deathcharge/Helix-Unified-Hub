# Enforce agent readiness in CI

Samsarix Agent Readiness Registry v1.3 includes a dependency-free command-line
interface and GitHub Action. Both use the same bounded parser and deterministic
readiness policy as the browser workspace. They validate metadata and evidence;
they do not call agents, fetch URLs, inspect runtime traffic, or certify safety or
compliance.

## Run the CLI locally

Use a supported Node.js release (22 LTS or newer) from a checkout of this repository:

Alternatively, use the [CLI-only release archive](CLI_DISTRIBUTION.md); the same
commands and fictional fixtures work after extraction without cloning the repository
or installing dependencies. Its packaged README contains the complete quickstart.

```bash
node bin/samsarix-registry.mjs validate path/to/agents.json
node bin/samsarix-registry.mjs check path/to/agents.json --require-candidates
node bin/samsarix-registry.mjs report path/to/agents.json --format markdown
```

Use `-` for bounded UTF-8 JSON on standard input:

```bash
node bin/samsarix-registry.mjs validate - --format json < path/to/agents.json
node bin/samsarix-registry.mjs validate - --format json < path/to/server.json
```

The second command normalizes one official MCP Registry `server.json` into the same
bounded Samsarix readiness record used by the browser. It does not publish, fetch,
install, or execute the server.

`check` gates `review` and `production` records by default. Concepts remain visible
in the inventory but do not break deployment CI. Use `--include-development` to add
development records, `--lifecycle all` to assess every lifecycle, or
`--require-candidates` to fail when the selected set is empty. `--now 2026-08-09`
pins evidence-staleness evaluation for reproducible tests.

The fictional [`review-ready-registry-example.json`](review-ready-registry-example.json)
demonstrates a passing review candidate without describing a live agent:

```bash
node bin/samsarix-registry.mjs check docs/review-ready-registry-example.json \
  --require-candidates --now 2026-08-09
```

## Add the GitHub Action

This minimal workflow grants read-only repository access and emits bounded GitHub
annotations plus a complete ordinary log of selected agents:

```yaml
name: Agent readiness

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  readiness:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: Deathcharge/Helix-Unified-Hub@b81dbd18d86fc0cb23c16d0c260a35c3b092affb
        with:
          registry: path/to/agents.json
          lifecycle: review,production
          require-candidates: "true"
```

The example pins the v1.3 prerelease after the security fixes, including future-date
blocking, versioned active interfaces, and credential-URL/export handling.
The repository has not published a stable action tag; production workflows should
use an exact commit they have reviewed so a later branch update cannot silently
change policy. Do not pass credentials in the registry file or action inputs.

Action inputs:

| Input                | Default             | Behavior                                                                       |
| -------------------- | ------------------- | ------------------------------------------------------------------------------ |
| `registry`           | required            | Repository-relative Samsarix registry, A2A Agent Card, or MCP `server.json`.   |
| `lifecycle`          | `review,production` | Comma-separated lifecycles or `all`.                                           |
| `require-candidates` | `true`              | Fails an accidentally empty deployment gate.                                   |
| `now`                | current time        | Optional `YYYY-MM-DD` or UTC timestamp for reproducible stale-evidence checks. |

## Exit contract

| Code | Meaning                                                            |
| ---- | ------------------------------------------------------------------ |
| `0`  | Validation/report succeeded, or every selected candidate is ready. |
| `2`  | The readiness policy failed.                                       |
| `64` | Command, option, or action-input usage error.                      |
| `65` | Registry data is malformed, unsupported, or oversized.             |
| `66` | The input file cannot be read.                                     |
| `70` | Unexpected internal software error.                                |

Treat code `2` as an ordinary policy result and codes `64`–`70` as configuration or
tool failures. JSON imports are limited to 1 MiB and 500 agents. GitHub annotation
properties and messages are escaped before writing workflow commands. The Action
emits at most 10 annotations per severity level to respect the platform step limit;
every selected result remains present in ordinary log lines.

## Automation boundary

The CLI resolves only the file path supplied by the caller, or reads standard input.
It performs no network requests, shell execution, package installation, agent/MCP
invocation, secret lookup, repository mutation, or telemetry. Output may still
reveal agent names, owners, MCP input names, risk labels, evidence gaps, and
architecture metadata in CI logs; apply the repository's normal access and retention
controls to those logs.
