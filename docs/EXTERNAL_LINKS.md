# External link review

Samsarix LLC maintains the product-facing external destinations in
`docs/portals.json` and the authoritative research references in
`.github/external-links.json`.

## Cadence and ownership

- GitHub Actions checks the list each Monday at 09:17 UTC and supports a manual
  run from the Actions tab.
- `support@samsarix.com` owns triage. Review a failed scheduled run within seven
  days and record the resolution in the commit or issue that changes the link.
- Run `npm run check:links` before a prerelease and after changing an external
  catalog destination or research reference.

The workflow is deliberately read-only. It never edits catalog status, opens an
issue, or follows a link as proof that the remote service is safe or endorsed.

## Result policy

- HTTP 2xx and 3xx responses pass.
- HTTP 401, 403, and 429 responses are recorded as reachable but restricted.
- Other HTTP 4xx responses are broken and require a corrected link, an archive
  label, or removal.
- HTTP 5xx, timeout, DNS, and transport failures are indeterminate and fail the
  run so an owner can retry before changing product metadata.
- Redirects must remain on public HTTPS. Literal local, link-local, and private
  IP destinations are rejected before a request is made.

Scheduled workflows run from the default branch and GitHub may disable a public
repository's schedule after 60 days without activity. If the check disappears,
re-enable `Review external link health` and run it manually.
