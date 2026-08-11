# Samsarix Agent Registry schema v1

This document describes the portable JSON accepted by Samsarix Agent Readiness
Registry. The implementation in `assets/readiness.mjs` is authoritative for input
validation and export ordering. [`agent-registry.schema.json`](agent-registry.schema.json)
provides the matching Draft 2020-12 machine-readable contract; runtime validation
adds duplicate-ID, credential-field, structural-complexity, and URL controls that
JSON Schema alone cannot fully express.

## Document shape

```json
{
  "schemaVersion": 1,
  "workspace": {
    "name": "My agent inventory",
    "description": "Why this inventory exists.",
    "updatedAt": "2026-08-08"
  },
  "agents": []
}
```

- `schemaVersion` must be the number `1`.
- `workspace.name` is required and limited to 120 characters.
- `workspace.description` is optional and limited to 600 characters.
- `workspace.updatedAt` is optional. When present, it must be `YYYY-MM-DD` or an ISO
  UTC timestamp ending in `Z`.
- `agents` must contain 1–500 unique agent records.
- The complete UTF-8 file must not exceed 1 MiB.

## Agent record

| Field            | Constraint                                                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`             | Required lowercase kebab-case identifier, at most 64 characters.                                                                                               |
| `name`           | Required display name, at most 120 characters.                                                                                                                 |
| `summary`        | Required bounded purpose, at most 600 characters.                                                                                                              |
| `version`        | Optional declared version, at most 80 characters.                                                                                                              |
| `lifecycle`      | `concept`, `development`, `review`, `production`, `paused`, or `retired`.                                                                                      |
| `risk`           | `unassessed`, `low`, `moderate`, `high`, or `critical`.                                                                                                        |
| `owner`          | Object with `name` and `contact`. Both are needed for readiness.                                                                                               |
| `authentication` | Optional `schemes` array plus inert `notes`. Review and production records need at least one declared scheme. A2A scheme names are preserved here.             |
| `interfaces`     | At most 20 `{ "protocol", "version", "url" }` objects. Protocol is required; an active record needs at least one nonempty interface version for readiness. A URL, when present, must use HTTPS and contain no embedded username/password or credential-like query/fragment value. |
| `skills`         | At most 50 short strings. Objects with a `name` or `id` are also normalized on import.                                                                         |
| `data`           | `classification`, `sources`, and `retention`; classification is `unassessed`, `public`, `internal`, `confidential`, or `restricted`.                           |
| `deployment`     | Optional `environment`, `monitoringOwner`, `incidentContact`, and `runbook` metadata.                                                                          |
| `evidence`       | One object per readiness gate as described below. Missing gate objects normalize to `missing`.                                                                 |

Unknown metadata is ignored during normalization and is not included in deterministic
exports. Do not use this registry as the only copy of framework-specific metadata.

## Evidence gates

The nine gate keys are:

1. `purpose`
2. `ownership`
3. `interface`
4. `authentication`
5. `data`
6. `evaluation`
7. `security`
8. `oversight`
9. `operations`

Each value has this shape:

```json
{
  "status": "verified",
  "reference": "reviews/security-2026-08-08.md",
  "reviewedAt": "2026-08-08"
}
```

Statuses are `missing`, `declared`, or `verified`. `verified` requires both a
reference and review date. References are inert text; the browser does not fetch or
render them as HTML. Calendar-invalid or non-UTC timestamp values are rejected.
Reviews older than 180 days are stale, and reviews dated after the evaluation time
are future-dated; both conditions block a ready result until corrected.

The weighted score is deterministic: purpose 12, ownership 12, interface 11,
authentication 10, data 12, evaluation 12, security 12, oversight 10, and operations 9. `missing` earns no weight, `declared` earns half, and `verified` earns full weight.

The score never overrides blockers. Concept, paused, or retired lifecycle; an
unassessed or critical risk tier; missing owner/contact; missing bounded purpose or
skill; missing versioned active interface; absent authentication schemes; unassessed or
incomplete data handling; incomplete environment/monitoring/incident/runbook
metadata; required missing evidence; and stale evidence can prevent a ready result.
This policy is a workflow aid, not certification.

## Credential and input boundary

Imports are metadata only. Any object key that normalizes to `apiKey`, `token`,
`accessToken`, `refreshToken`, `secret`, `clientSecret`, `password`, `authorization`,
`cookie`, `privateKey`, `credential`, or `credentials` rejects the entire file before
the current workspace changes. OAuth discovery keys such as `authorizationUrl` and
A2A `securitySchemes` remain valid because they describe a scheme rather than carry
a credential.

The importer also rejects malformed JSON, excessive structural complexity,
duplicate IDs, unsupported enum values, overlong strings/arrays, unsafe interface
URLs, and invalid verified evidence. Imported strings are rendered through DOM text
nodes.

## A2A Agent Card import

A single A2A Agent Card JSON object can be imported instead of a Samsarix document.
The normalizer recognizes current `supportedInterfaces` along with legacy `url` and
`protocolVersion`, plus `name`, `description`, `version`, `provider`, `skills`,
`securitySchemes`, `securityRequirements`, and `security`.

The resulting record is `development` and `unassessed` by default. Agent Card
purpose, provider, interface, and authentication metadata may become `declared`
evidence. Data handling, internal evaluation, security review, oversight, and
operations remain missing because a discovery card cannot prove them. The importer
does not fetch the card's URL or call its interfaces.

Download [`a2a-agent-card-example.json`](a2a-agent-card-example.json) for a fictional
current-format card that demonstrates this normalization without claiming a live
agent or endpoint.

## MCP Registry server.json import

A single official MCP Registry `server.json` object—or one official API response
wrapper with that object under `server`—can be imported instead of a Samsarix
document. The adapter recognizes an official dated schema URL plus `name`, `title`,
`description`, `version`, `repository`, `packages`, and `remotes`. The registry's
current publishing format is documented by the MCP project at
<https://modelcontextprotocol.io/registry/quickstart>.

The resulting record is `development` and `unassessed`. Package and remote transport
metadata becomes declared interface evidence. The description and safe HTTPS
repository URL become declared purpose/provenance metadata. The MCP format does not
identify an accountable internal owner, enumerate tools in `server.json`, prove an
authentication scheme, classify data, or supply internal evaluation, security,
oversight, and operations evidence, so those gaps remain visible and blocking.

The adapter accepts concrete HTTPS remote URLs without embedded credentials or
credential-like query/fragment values. A valid
HTTPS URL template is recognized as a declared interface but exported with an empty
concrete URL because its variables have not been resolved. Package commands,
arguments, packages, and endpoints are never fetched, installed, or executed.

Secret environment-variable, header, package/runtime-argument, and URL-variable
**names**—including one-level template variables—may be summarized as inert
authentication notes, but they do not become authentication proof. Any secret
descriptor containing an actual `value` or `default`, rather than a pure `{variable}`
reference, rejects the import before the current workspace changes. Unknown MCP and
Registry extension fields are ignored and do not appear in deterministic exports.

This bounded adapter does not claim full `server.json` schema conformance or MCP
server behavior. The MCP Registry remains in preview and its official publisher and
validation API remain authoritative for publication correctness. Samsarix answers a
different question: what organization-specific readiness evidence is still absent
after discovery metadata is available.

Download [`mcp-server-example.json`](mcp-server-example.json) for a fictional
current-format server definition that demonstrates this normalization without
claiming a live server, endpoint, or package.

## Persistence and export

The normalized registry is stored under the browser key
`samsarix.agent-readiness-registry.v1`. Storage is local to that browser profile and
is not encrypted. **Reset sample** requires a second confirmation action, removes
that key, and restores `agents.json`.

JSON export sorts agents by ID and emits fields and evidence gates in a fixed order.
Markdown export uses the same ordering, HTML-encodes imported tag openers, and
includes score, lifecycle, risk, owner, blockers, and the complete evidence table.
Neither export adds a generated timestamp,
so unchanged input and policy produce unchanged output.

Start with [`agent-registry-template.json`](agent-registry-template.json). It is
valid but intentionally incomplete, so its missing evidence remains visible.

## CLI and CI policy

The supported-LTS Node CLI and root GitHub Action use this same parser, normalization
order, and readiness evaluator. `validate` accepts this registry, one A2A Agent Card,
or one MCP Registry `server.json`; `report` produces deterministic normalized JSON
or Markdown; and `check` returns a nonzero policy result when a selected agent is not
ready.

By default, `check` gates only `review` and `production` records. Use an explicit
lifecycle selection for another policy and `--require-candidates` to fail an empty
selection. See [`CI_INTEGRATION.md`](CI_INTEGRATION.md) for command syntax, GitHub
annotations, inputs, and the stable exit-code contract. The fictional
[`review-ready-registry-example.json`](review-ready-registry-example.json) provides
a reproducible passing fixture without claiming a live agent.
