# Samsarix Agent Readiness Registry threat model

## Overview

Samsarix Agent Readiness Registry is primarily a static GitHub Pages workspace that imports local agent metadata, persists a normalized inventory in browser storage, applies an explainable readiness policy, and exports review packets. The earlier repository directory remains a secondary path. The repository, still hosted at its historical Helix-named URL, also contains portal prototypes, a local portal generator, optional Discord and Zapier integration services, an Android prototype, deployment workflows, and a large archive of historical/generated material. Those secondary surfaces are not required for the registry to work and must not be presented as part of one trusted production system.

The highest-value assets are the confidentiality and integrity of a user's imported agent inventory, the integrity and explainability of readiness results and exports, CLI/CI policy outcomes and logs, published links and lifecycle labels, the repository and GitHub Pages deployment, any operator credentials used by optional integrations, and the operator workstation or CI runner used by generation/deployment scripts.

## Threat Model, Trust Boundaries, and Assumptions

- Public visitors and all browser-provided values are untrusted. Static content must not turn URL parameters, remote responses, or stored browser state into executable markup.
- Imported JSON files and restored local-storage values are untrusted. They may be malformed, oversized, deeply nested, secret-bearing, or crafted for DOM injection, misleading scores, storage exhaustion, or unsafe outbound navigation.
- Browser storage is a device-local persistence boundary, not encrypted storage or an access-control system. The UI must disclose that limitation, reject credential-shaped fields, bound file/record sizes, survive unavailable or quota-limited storage, and provide an explicit reset.
- A2A Agent Cards are discovery metadata, not trusted proof of ownership, data handling, internal evaluation, security review, oversight, or operational readiness. The static site must not fetch imported URLs, call agents, or convert card metadata into verified evidence.
- Portal metadata committed to the repository is trusted only after review. It controls destinations presented to users, so link changes are security-sensitive supply-chain changes.
- External portal and API availability is not trusted. A remote service may be offline, compromised, redirected, slow, or return malformed data; the directory must fail closed without fabricating health.
- GitHub Actions is a privileged boundary because workflows can publish Pages content or write to the repository. Workflows must use least privilege, pinned or reviewed actions, deterministic inputs, and no untrusted shell interpolation.
- CLI paths, standard input, action inputs, and registry files in caller repositories are untrusted. The readiness command must bound data before parsing, accept no code or credential input, avoid shell composition and network requests, escape workflow commands, preserve distinct configuration/data/policy exits, and never mutate the caller repository.
- Discord tokens, webhook URLs, API keys, signing material, and deployment credentials are operator secrets. They must come from environment or platform secret stores, never source, client-side JavaScript, logs, fixtures, or generated artifacts.
- Text/chat/voice events received by the Discord bot and JSON sent to webhook endpoints are attacker-controlled unless authenticated and authorized. They must not directly select shell commands, file paths, portal templates, or external destinations.
- The portal generator and deployment scripts run with developer or CI permissions. Configuration and command-line values that influence paths, subprocesses, repositories, or network destinations must be validated before side effects.
- The Android prototype crosses a mobile-device-to-network boundary. Remote data, deep links, cached values, and deployment actions require transport security, explicit user intent, and authorization.
- Files under `assets/`, `outputs/`, historical conversations, logs, PDFs, APKs, and archives are treated as untrusted legacy data. They are not evidence that a service is currently deployed or secure, and they should not be executed or published automatically.
- The static directory must remain useful without private Samsarix services, paid accounts, authentication, telemetry, or a live backend.
- Readiness scores must remain deterministic and secondary to visible evidence and blockers. The UI and exports must not imply certification, compliance, endpoint health, or agent safety.

Security objectives are to preserve honest navigation, prevent arbitrary code/command execution and file writes, prevent unauthorized deployment or webhook side effects, keep credentials private, bound network and resource use, minimize published data, and clearly separate maintained product code from unsupported experiments.

## Attack Surface, Mitigations, and Attacker Stories

### Static site and portal data

Relevant threats include malicious or stale outbound links, reverse-tabnabbing, DOM-based XSS, unsafe HTML rendering, third-party script compromise, misleading status claims, privacy-invasive analytics, and unbounded live health checks. Preferred controls are static rendering with no HTML injection, a restrictive Content Security Policy, `rel="noopener noreferrer"` for new tabs, explicit lifecycle labels, no telemetry by default, and opt-in bounded status checks when they are added.

### Registry import, persistence, policy, and export

Relevant threats include secret ingestion, malicious or over-complex JSON, duplicate identifiers, unsafe interface URLs, DOM injection, local-storage exhaustion or corruption, stale evidence presented as current, score gaming, Markdown control-character content, and accidental disclosure through exports. Controls are a 1 MiB/500-agent limit, file-size checks before reads, bounded streaming standard input, iterative credential-key scanning with a structural cap, strict schemas and lengths, HTTPS-only interface URLs without embedded credentials, text-node rendering, deterministic normalization, conservative lifecycle/risk blockers, stale-review warnings, storage failure recovery, explicit two-step reset, and user-initiated downloads. Exported files and CLI/CI output remain user-controlled artifacts and may reveal architecture metadata when shared or retained in logs.

### GitHub Pages and CI

Relevant threats include workflow-command injection, publishing unintended repository content, dependency/action supply-chain compromise, and over-broad write tokens. Preferred controls are a single Pages workflow with minimal permissions, an explicit `docs/` artifact, no mutation of checked-out source during release, validation before upload, and concurrency cancellation that cannot race older content over newer content. The reusable readiness Action declares no token input, performs no network or shell operation, reads only the caller-selected registry path, and escapes annotation properties and messages. Caller examples grant only `contents: read` and tell adopters to pin reviewed action commits.

### Local generator and deployment scripts

Relevant threats include command injection, path traversal, overwriting arbitrary files, repository-creation mistakes, leaked tokens, and large accidental deployments. Preferred controls are strict IDs and schemas, path containment checks, argument-array subprocess APIs, dry-run as the default, confirmation for destructive or external actions, bounded concurrency/timeouts, and tests with temporary directories and fake adapters.

### Discord and webhook integrations

Relevant threats include missing authentication/authorization, replay and duplicate events, request-body exhaustion, forged status data, webhook amplification, SSRF, secret leakage through logs, and shell execution selected from user text. Preferred controls are signed requests or platform identity, a required administrator allowlist, idempotency keys, size/rate limits, schema validation, bounded outbound clients, destination allowlists, redacted logs, and no shell composition.

### Android prototype

Relevant threats include cleartext or untrusted endpoints, exported component abuse, insecure credential storage, unauthorized remote deployment, and background work without informed user intent. Preferred controls are HTTPS-only network security configuration, non-exported components by default, Android Keystore-backed secrets, explicit authenticated confirmations for privileged actions, and WorkManager limits.

### Legacy and generated artifacts

Relevant threats include accidentally publishing personal conversation data, logs, internal URLs, credentials, unsafe archives, binaries of unknown provenance, active-looking vulnerable dependency manifests, or runnable prototype code that bypasses maintained controls. Preferred controls are an explicit publication allowlist, secret scanning, provenance/checksum documentation for shipped binaries, non-installable hash-recorded dependency snapshots, quarantine from build inputs, and staged removal or archival after owner review.

Realistic attacker stories include a public visitor following a compromised link, a contributor changing portal metadata or a workflow, an unauthenticated user triggering an exposed webhook/bot action, and a crafted generator configuration escaping its output directory. Operator-controlled configuration mistakes remain reliability concerns, while attacks requiring an already-compromised owner workstation or GitHub administrator are generally out of scope unless the code increases that privilege.

## Severity Calibration (Critical, High, Medium, Low)

- **Critical:** a public or low-privileged path to arbitrary code execution on a CI runner/operator host, theft of production deployment credentials, or unauthorized deployment with broad ecosystem impact.
- **High:** a realistic unauthorized webhook/bot action that changes external systems, path traversal causing sensitive file read/write, or stored browser injection affecting portal visitors with meaningful credential or account impact.
- **Medium:** cross-boundary integrity issues with constrained impact, exposure of non-public operational data, exploitable workflow races, or remote resource exhaustion that materially affects the maintained directory or integration service.
- **Low:** limited information disclosure, misleading availability behavior, missing defense-in-depth headers without a demonstrated exploit chain, or a narrowly scoped denial of service with easy recovery.

Pre-release scan baseline (recorded before the Samsarix branding/legal commit):
Repository: target_sha256_2dc3715dfcf2506e3e3f418ab675f1ac558c3525085d04d131a881ce97a288bb
Version: codex-security-snapshot/v1:sha256:241d180db973b7159e34bcc79161d73e5caaa0185b02f19bd7b8f0b2e6285152
