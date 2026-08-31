# Samsarix Agent Readiness Registry product brief

Date: 2026-08-08
Decision status: accepted direction for the next release increment

## Product decision

Evolve the maintained static directory into **Samsarix Agent Readiness Registry**:
a vendor-neutral, local-first workspace for inventorying AI agents, importing
portable manifests, and explaining what evidence is missing before an agent should
be treated as production-ready.

This is not another Samsarix portfolio homepage. The Field Guide remains the
canonical portfolio navigator. This repository now has a distinct job: help a
builder, reviewer, or small platform team turn scattered agent descriptions into a
reviewable inventory and readiness packet without first adopting a cloud tenant,
runtime tracing SDK, or internal developer portal.

## Target user and job

Initial user:

- an individual builder or team of roughly 2–50 people;
- prototyping agents across A2A, MCP, framework-specific, or custom interfaces;
- needing a credible inventory and review process before enterprise tooling is
  justified; and
- unwilling or unable to upload sensitive architecture metadata to another service.

Primary job:

> “Show me which agents we have, who owns them, what they can access, and exactly
> what evidence is missing before we deploy or integrate them.”

Secondary jobs:

- normalize an A2A Agent Card or official MCP Registry `server.json` into an
  internal review record;
- identify ownerless, unassessed, unauthenticated, or stale agent definitions;
- share a deterministic JSON or Markdown review packet with another person; and
- keep concept-stage profiles visibly separate from deployable agents.

## Current market evidence

The market has converged on inventory, ownership, discovery, risk, and evidence as
real agent-management problems:

- The A2A project standardizes a JSON Agent Card containing identity, endpoints,
  capabilities, authentication, and skills. Its discovery guidance identifies
  centralized registries as useful for governance and capability search, while also
  stating that A2A does not prescribe a standard curated-registry API:
  <https://github.com/a2aproject/A2A/blob/main/docs/topics/agent-discovery.md>.
- The official MCP Registry now provides a preview discovery catalog and a dated
  `server.json` publishing format for package, remote, transport, and secret-input
  metadata. Its registry API supports downstream synchronization, but discovery
  metadata does not supply organization-specific deployment approval:
  <https://modelcontextprotocol.io/registry/quickstart> and
  <https://github.com/modelcontextprotocol/registry/blob/main/docs/reference/api/official-registry-api.md>.
- Microsoft Agent Registry exposes status, publisher, channel, platform, data-source,
  ownerless-agent, risk, import, and export workflows. It is a strong enterprise
  control plane, but it is tied to Microsoft 365 administration and licensed tenant
  capabilities:
  <https://learn.microsoft.com/en-us/microsoft-365/admin/manage/agent-registry>.
- Backstage proves the value of source-controlled ownership and metadata catalogs at
  large scale, but it is a general developer-portal platform rather than a small,
  agent-specific readiness tool:
  <https://backstage.io/docs/features/software-catalog/>.
- NIST AI RMF Govern 1.6 calls for mechanisms to inventory AI systems according to
  organizational risk priorities; the framework also emphasizes clear roles,
  lifecycle review, documentation, and third-party risk:
  <https://airc.nist.gov/airmf-resources/airmf/5-sec-core/>.
- LangSmith concentrates on execution traces, evaluations, datasets, and production
  monitoring. Samsarix should complement that category by reviewing identity,
  ownership, interfaces, risk, and evidence before or outside runtime instrumentation:
  <https://docs.langchain.com/langsmith/evaluation>.
- OWASP's Top 10 for Agentic Applications 2026 provides a practical security-risk
  reference, but a registry still needs to turn risk awareness into concrete,
  reviewable agent records:
  <https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/>.
- OWASP's 2026 State of Agentic AI Security and Governance calls for a formal,
  authoritative inventory of AI and agentic components, explicitly including MCP
  servers. That reinforces the gap between protocol discovery and internal
  governance inventory:
  <https://genai.owasp.org/download/50592/?tmstv=1754459367>.

## Defensible wedge

Samsarix wins the first use case through the combination of:

1. **Local-first privacy.** The release is a static site. Imported records remain in
   the browser unless the user explicitly exports them. There is no account,
   analytics SDK, remote fetch, or agent execution.
2. **Portable input.** Accept the Samsarix registry schema and normalize public A2A
   Agent Cards plus official MCP Registry server metadata without pretending either
   discovery format proves governance readiness.
3. **Explainable readiness.** Scores come from visible gates and blockers, not a
   proprietary model or unexplained “AI risk score.”
4. **Honest lifecycle.** Concept, development, review, production, paused, and retired
   states are distinct; a concept can never be labeled production-ready solely from
   complete documentation.
5. **Review-packet export.** The output is useful outside the product: deterministic
   JSON plus a human-readable Markdown assessment.
6. **Zero-infrastructure adoption.** A team can evaluate the workflow from GitHub
   Pages or a local checkout before buying or operating a control plane.

## Readiness model

Each record has identity and governance metadata plus evidence references. The first
version evaluates nine gates:

| Gate           | Minimum evidence                                           |
| -------------- | ---------------------------------------------------------- |
| Purpose        | Bounded purpose and declared skills or capabilities        |
| Ownership      | Named accountable owner and support contact                |
| Interface      | Versioned interface or explicit concept-only status        |
| Authentication | Declared scheme for a deployed interface                   |
| Data           | Data classification and data-source/retention notes        |
| Evaluation     | Dated evaluation summary and evidence reference            |
| Security       | Risk tier, security-review date, and evidence reference    |
| Oversight      | Human-oversight and stop/escalation behavior               |
| Operations     | Environment, monitoring owner, incident route, and runbook |

Every missing gate is shown. Critical blockers override the numerical score. A
production claim is blocked when ownership, purpose, risk, authentication, security,
oversight, or operations evidence is absent.

The score is a workflow signal, not a compliance certification, safety warranty, or
substitute for testing.

## First registry release increment: v1.1

Implementation status on 2026-08-08: merged to `main`, published through GitHub
Pages, and verified at the merge commit after repository and deployment checks
passed.

The release includes:

- an Agent Registry workspace linked from the primary product viewport;
- a bundled, honestly classified sample inventory based on the existing agent
  concepts;
- import of Samsarix registry JSON and one A2A Agent Card JSON document;
- explicit additive browser imports to accumulate distinct agent IDs while keeping
  workspace metadata; atomic duplicate/aggregate-limit rejection and confirmation
  before replacing imported/restored inventories;
- bounded schema validation with duplicate, unsafe-URL, oversized-file, and
  credential-field rejection;
- local browser persistence with an explicit reset control;
- search plus lifecycle, risk, and readiness filters;
- explainable scores, blockers, stale-review warnings, and evidence detail;
- deterministic JSON and Markdown export; and
- automated unit, integration, artifact, accessibility-contract, and security checks.

## Repository enforcement increment: v1.2

The second release increment makes the same readiness decision usable at the point
where teams review and merge agent metadata. It includes:

- a dependency-free CLI for supported Node.js releases (22 LTS or newer) with `validate`, `check`, and deterministic `report`
  commands;
- bounded file and standard-input parsing through the browser workspace's existing
  parser, normalization, and evaluator;
- conservative default gating of `review` and `production` records, with explicit
  lifecycle overrides and an empty-candidate failure option;
- stable success, policy, usage, data, input, and internal-error exit codes;
- text, JSON, Markdown, and escaped GitHub annotation output;
- a zero-dependency JavaScript Action that requires no token or network access; and
- a fictional fully evidenced review fixture plus command/action integration tests.

This increment still evaluates declared metadata and evidence. It does not verify
evidence references, observe an agent, prove an endpoint is owned or healthy, or
turn a passing status into certification.

## MCP interoperability increment: v1.3

The third release increment bridges the official MCP discovery catalog into the
same local readiness workflow. It includes:

- bounded import of one official dated MCP Registry `server.json` or one official
  API response wrapper containing a server object;
- conservative normalization of registry identity, description, version, repository
  provenance, package transports, concrete HTTPS remotes, and secret-input names;
- safe handling of URL templates as declared but unresolved interfaces;
- rejection of unsafe/credential-bearing URLs and actual secret values or defaults;
- explicit gaps for accountable ownership, tool inventory, authentication, data
  handling, evaluation, security review, oversight, and operations; and
- one fictional current-format MCP fixture usable in the browser, CLI, and Action.

This is not an MCP client, package installer, publisher, full schema validator,
behavioral test, or hosted registry. It performs no discovery fetch and treats the
official Registry's preview schema/API as external, versioned inputs rather than a
Samsarix-controlled contract.

## Non-goals for v1.1

- running or calling an agent;
- accepting credentials, secrets, prompts, traces, or production conversation data;
- live endpoint probing or availability claims;
- replacing runtime observability/evaluation platforms;
- multi-user authentication, approvals, or cloud synchronization;
- asserting legal or regulatory compliance; or
- migrating the historical archives into the maintained product.

## Success measures

The first release is successful when a new visitor can, without documentation:

1. understand the product job from the first viewport;
2. open the workspace and identify why a bundled concept is not deployable;
3. import a valid A2A Agent Card or MCP server definition and see governance gaps
   that discovery metadata cannot express;
4. reject a malformed, oversized, duplicate, or secret-bearing manifest safely;
5. filter to blocked/high-risk/stale records; and
6. export a review packet that another person can inspect without Samsarix.

Early adoption signals are local template downloads, imported manifests, exported
review packets, GitHub issues from real agent inventories, and requests for team
history or signed approvals. No analytics will be added merely to count those events.

## Commercial path

The local static registry is the adoption surface. Potential paid offerings should
be demand-led and separable:

- managed private registry hosting;
- organization policy packs and signed approval history;
- organization-specific policy packs layered on the open readiness check;
- migration/import services for existing agent inventories;
- security and readiness review engagements; and
- support with agreed response terms.

Do not add a hosted backend or enterprise integration until a real user requires it
and the security, privacy, pricing, and operational model is separately approved.
