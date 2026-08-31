# Contributing

Bug reports, registry-policy corrections, portable-schema proposals, accessibility
fixes, and documentation issues are welcome. Before a large change, open an issue so
scope and ownership can be agreed.

Use [Registry workflow feedback](https://github.com/Deathcharge/Helix-Unified-Hub/issues/new?template=workflow-feedback.yml)
for ordinary bugs, confusing behavior, or a concrete inventory-review need. Issues
are public: describe the job with bundled fixtures or a fictional reproduction,
not real inventories, exported packets, private URLs, logs, or personal data.
For vulnerabilities or sensitive reports, follow [SECURITY.md](SECURITY.md).
The form encourages safe reporting; it is not a sanitizer or access-control boundary.

Run the complete local gate before submitting a change:

```bash
npm ci
npm run check
```

After changing registry modules or shared styles, first run
`node scripts/version-registry-assets.mjs --write` to refresh dependency-based asset
versions. The issue-form `.yml` files use JSON-compatible YAML so Node can check
their structure without adding a YAML runtime dependency. Keep required context,
private-report routing, and the no-sensitive-attachments guidance intact.

Keep the maintained registry dependency-free at runtime, preserve lifecycle and
readiness semantics, and add tests for behavior, schema, policy, or catalog changes.
Do not commit credentials, private
exports, generated account data, or claims that an external service is healthy.

## Contribution rights

Samsarix LLC is not accepting nontrivial external code contributions until a
counsel-reviewed contributor license agreement is available. This prevents unclear
ownership from undermining the source-available and commercial licensing model.
Small corrections may be accepted when their provenance and licensing are explicit;
submission alone does not create a commercial license or transfer ownership.

Questions about contribution rights can be sent to `contact@samsarix.com`.
