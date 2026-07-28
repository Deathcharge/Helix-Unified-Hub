# Contributing

Bug reports, catalog corrections, accessibility fixes, and documentation issues are
welcome. Before a large change, open an issue so scope and ownership can be agreed.

Run the complete local gate before submitting a change:

```bash
npm ci
npm run check
```

Keep the maintained directory dependency-free at runtime, preserve lifecycle labels,
and add tests for behavior or catalog changes. Do not commit credentials, private
exports, generated account data, or claims that an external service is healthy.

## Contribution rights

Samsarix LLC is not accepting nontrivial external code contributions until a
counsel-reviewed contributor license agreement is available. This prevents unclear
ownership from undermining the source-available and commercial licensing model.
Small corrections may be accepted when their provenance and licensing are explicit;
submission alone does not create a commercial license or transfer ownership.

Questions about contribution rights can be sent to `contact@samsarix.com`.
