# Browser verification

The registry has a dependency-free application and Node test suite. Rendered-browser
checks are separate, optional maintainer tooling; `npm run check` does **not** prove
browser compatibility or accessibility conformance.

## Repeat the core workflow

Use only a **fresh, nonpersistent test session**. The smoke check imports fictional
bundled fixtures and resets that session's inventory. It refuses a workspace that
reports restored/imported data, but this guard is not a reason to use a personal
browser profile. Never pass `--persistent`, `--profile`, or a real inventory.

Prerequisites: a repository checkout, Node.js 22+, npm, internet access for the
optional test tool/browser downloads, and the selected engine installed for that
tool version. These are not application dependencies. The exercised tool version
is `@playwright/cli@0.1.18`; its test-engine builds need not match a stable consumer
browser. See the official [CLI instructions](https://github.com/microsoft/playwright-cli)
and [browser installation guidance](https://playwright.dev/docs/browsers).

From the repository root, create and enter `output/playwright/smoke` (an ignored
artifact directory). In PowerShell:

```powershell
New-Item -ItemType Directory -Force output/playwright/smoke
Set-Location output/playwright/smoke
```

Or in a POSIX shell:

```sh
mkdir -p output/playwright/smoke
cd output/playwright/smoke
```

Then run these commands one at a time, inspecting the result before continuing:

```sh
npx --yes --package=@playwright/cli@0.1.18 playwright-cli -s=samsarix-smoke open https://deathcharge.github.io/Helix-Unified-Hub/registry.html --browser=firefox
npx --yes --package=@playwright/cli@0.1.18 playwright-cli -s=samsarix-smoke run-code --filename=../../../scripts/browser-smoke.mjs
npx --yes --package=@playwright/cli@0.1.18 playwright-cli -s=samsarix-smoke run-code --filename=../../../scripts/browser-smoke-result.mjs
npx --yes --package=@playwright/cli@0.1.18 playwright-cli -s=samsarix-smoke console error
npx --yes --package=@playwright/cli@0.1.18 playwright-cli -s=samsarix-smoke close
```

Repeat in a new session for `--browser=chrome` and `--browser=webkit`. An absent
engine is an unverified configuration, not an application failure or a passing
test. Install only the selected test engine using the tool's instructions; do not
replace someone's normal Chrome/Edge installation just to run this check.

Success requires a successful command and a returned object containing
`"passed": true`, the actual browser version, and all seven completed check groups.
Any error, missing group, or cleanup failure is a failed/unverified run. Keep the
console check separate: the script does not currently assert console contents.
The CLI may yield while a native replacement dialog is handled and the check is
still running. Exit 0 from the first `run-code` is **not** completion. Always run
the companion result command in the same session; it waits up to 30 seconds for
the final seven-group result. If another dialog causes an early yield there too,
repeat the result command once the dialog is handled; no explicit result means
unverified, never pass. Do not reload between these two commands: the test-only
result marker is held in page memory, not browser storage or production code.
Always close the isolated session, even after failure: its date remains fixed for
the test. Do not run the function directly with `node`; it is an input to the CLI's
`run-code --filename` command.

To exercise local source instead, start `npm run serve` in another terminal from
the repository root and substitute `http://127.0.0.1:4173/registry.html` in `open`.
No source overrides are needed. Stop that server when verification is finished.

## What the smoke check covers

- Selected heading visibility; Tab to return control and evidence region;
  arrow-key horizontal scrolling; return focus to the selected row.
- Document width at 320, 390, 768, and 1280px; empty results and search-focus retention.
- Samsarix, A2A, and MCP imports; nine evidence rows; conservative classifications.
- Add A2A/MCP records to the ready fixture; duplicate addition rejects atomically;
  three-agent reload persistence; cancelling a native replacement confirmation.
- Malformed-file rejection without changing the three-agent inventory; confirmed
  replacement restores the single ready fixture after the export checks.
- Actual JSON and Markdown downloads compared byte-for-byte with the shared policy.
- Confirmed reset followed by reload, including cleanup on intermediate failure.

The review date is fixed to 2026-08-31 so dated fixtures do not silently expire.
Timers still run; the scripted layout/keyboard flow uses reduced motion. This is
UI/export integration coverage, not an independent implementation of the readiness
policy. The separate Node policy tests check scoring and validation rules.

## Recorded compatibility evidence

The safe multi-agent import continuation extended the smoke to seven groups. Before
publication, the final changed web files were exercised through isolated source
overrides in Chrome 151.0.7922.175, Firefox 153.0, and WebKit 26.5: all seven groups
passed, including real native confirmation acceptance/cancellation and three-agent
export parity. Firefox's form-value restoration on reload was reproduced and fixed
by explicit mode initialization. The companion result command is required because
the CLI can yield early at a native dialog. Public deployment evidence is recorded
on the corresponding PR; these source-override checks alone do not prove deployment.

On 2026-08-31, the public application at `169e181a4d7d174f3fdf8c8b4afd511373b342e2`
was exercised with isolated Windows test sessions:

| Engine | Version | Evidence |
| --- | --- | --- |
| Chrome / Chromium | 151.0.7922.175 | Public journey and keyboard/layout evidence in PR #20; reusable smoke result recorded in this increment's PR. |
| Firefox test build | 153.0 | Imports, persistence, invalid/oversized/duplicate/credential-field rejection, stale filtering, exports, reset, keyboard navigation, and responsive checks. |
| WebKit test build | 26.5 | Imports, persistence, invalid/oversized/duplicate/credential-field rejection, stale filtering, exports, reset, and keyboard navigation; reusable smoke includes responsive checks. |

The original six-group smoke function returned all passing groups in each engine. The
documented pinned `npx` command sequence was additionally exercised in Firefox.
Final consoles had zero errors/warnings, and all isolated sessions were closed.

Firefox and WebKit downloads were also compared with the Node policy output outside
the browser. One WebKit pointer-action acknowledgment exceeded the CLI's initial
5-second timeout; inspecting the same live session showed that selection completed,
and the subsequent keyboard and repeatable smoke checks passed. This is not a
browser-performance benchmark.

WebKit on Windows is **not Safari on macOS/iOS**. These results do not establish
physical-device behavior, screen-reader support, old-browser support, forced-colors
behavior, full WCAG conformance, or production readiness. Real-user validation and
the credential/history/provenance/legal release gates remain open.
