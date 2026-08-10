# Quarantined Python dependency snapshots

These files preserve the exact dependency text from four unsupported Helix-era
prototype manifests. Their `.snapshot` extension is a repository convention that
places them outside supported dependency discovery and build inputs. They remain
valid requirements text if explicitly passed to pip, but are historical evidence—not
supported Samsarix requirements, lockfiles, or a claim that the listed versions are
secure or mutually compatible.

GitHub reported 130 open Dependabot alerts against the four original pip-manifest
paths on 2026-08-10. None belonged to the dependency-free Samsarix Agent Readiness
Registry. Keeping vulnerable snapshots under active `requirements*.txt` names made
the repository security dashboard imply that unsupported prototypes were current
runtime surfaces.

| Original path                               | Preserved snapshot                       | Original SHA-256                                                   | Alerts at quarantine |
| ------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------ | -------------------: |
| `assets/requirements-backend.txt`           | `helix-v15.3-backend-assets.snapshot`    | `1c996f487498bf4b9fa96b849176577ebd032eee16abc453046e48cec2696b9e` |                   50 |
| `legacy/backend-prototype/requirements.txt` | `helix-v15.3-backend-prototype.snapshot` | `3b62c4f47d707e05f6b22c16eb098502970105742f7cc8419afa04968a4b85e3` |                   50 |
| `assets/requirements-frontend.txt`          | `helix-v14.5-frontend.snapshot`          | `2ee9c4cc7c4c2b828b8c9582f24d520df18fdd67e5ab93f45790a90d70acd960` |                   27 |
| `assets/requirements.txt`                   | `helix-community-hub.snapshot`           | `54a91cbdc8e3151a65ce5c1090e8b7b3ad7192aaa74233b6e7a302b8fd0cbab5` |                    3 |

Do not rename these files back or install them directly. Anyone reviving a prototype
must establish a supported owner and threat model, choose a currently supported
Python runtime, reconstruct and lock the minimum dependencies from authoritative
sources, review licenses, scan the resolved environment, and add tests in a separate
release increment. The original paths and complete history remain recoverable from
Git.
