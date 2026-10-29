# Onboarding survey

Written by `proc init --mode convert` from git alone (ONBOARDING §2, step 1): where the project stands before it comes under the process. Helpers read the code and documents in full from here (P20).

## Directories

| directory | files | code files | kinds |
| --- | --- | --- | --- |
| `.` | 5 | 0 | .md 2, .example 1, .gitignore 1, .worktreeinclude 1 |
| `.claude` | 5 | 1 | .md 3, .sh 1, .json 1 |
| `.github` | 6 | 1 | .yml 5, .mjs 1 |
| `agent-harness` | 4 | 4 | .mjs 4 |
| `agent-model` | 5 | 5 | .mjs 5 |
| `agent-runner` | 44 | 36 | .mjs 36, .json 4, .dockerignore 1, .gitignore 1, (none) 1 |
| `agent-steps` | 27 | 27 | .mjs 27 |
| `agent-worker` | 55 | 50 | .mjs 50, .json 3, .gitignore 1, .jsonc 1 |
| `bio-plane` | 4342 | 4177 | .mjs 4175, .json 65, .png 24, .jpg 23, .pdf 10 |
| `budget-doctypes` | 17 | 9 | .mjs 9, .json 4, .csv 3, .md 1 |
| `court-citations` | 40 | 5 | .txt 28, .mjs 5, .json 5, (none) 2 |
| `court-doctypes` | 19 | 8 | .html 10, .mjs 8, .md 1 |
| `docprofile` | 21 | 20 | .mjs 20, .json 1 |
| `docs` | 554 | 34 | .md 438, .json 33, .py 21, .html 20, .woff2 15 |
| `doctypes` | 54 | 39 | .mjs 39, .json 15 |
| `file-scanner` | 65 | 53 | .mjs 53, .json 6, .dockerignore 1, .gitignore 1, .renderer 1 |
| `jurisdictions` | 26 | 26 | .mjs 26 |
| `legistar-reader` | 64 | 3 | .json 61, .mjs 3 |
| `newgroup` | 62 | 57 | .mjs 57, .json 2, .gitignore 1, .md 1, .jsonc 1 |
| `ocr-worker` | 34 | 16 | .mjs 16, .jpg 7, .json 5, .gitignore 1, .traineddata 1 |
| `pdf-worker` | 246 | 50 | .png 176, .mjs 42, .json 12, .py 8, .pdf 4 |
| `release` | 24 | 7 | .json 14, .mjs 7, .wasm 2, .traineddata 1 |
| `roster-reader` | 22 | 17 | .mjs 17, .json 5 |
| `sheet-worker` | 38 | 20 | .mjs 19, .xlsx 9, .json 4, .gitignore 1, .wasm 1 |
| `site` | 9 | 5 | .mjs 5, .json 2, .gitignore 1, .jsonc 1 |
| `site-profiles` | 14 | 14 | .mjs 14 |
| `stewards` | 12 | 8 | .mjs 8, .md 2, .json 1, .jsonc 1 |

## What builds and tests it

- package manifests: `agent-runner/package.json`, `agent-worker/package.json`, `bio-plane/package.json`, `bio-plane/src/journey-check/package.json`, `file-scanner/package.json`, `newgroup/package.json`, `ocr-worker/package.json`, `pdf-worker/package.json`, `sheet-worker/engine/Cargo.toml`, `sheet-worker/package.json`, `site/package.json`, `stewards/package.json`
- test directories: `agent-harness/test/`, `agent-model/test/`, `agent-runner/test/`, `agent-steps/test/`, `agent-worker/test/`, `bio-plane/test/`, `budget-doctypes/test/`, `court-citations/test/`, `court-doctypes/test/`, `docprofile/test/`, `doctypes/test/`, `file-scanner/test/`, `jurisdictions/test/`, `legistar-reader/test/`, `newgroup/test/`, `ocr-worker/test/`, `pdf-worker/test/`, `roster-reader/test/`, `sheet-worker/test/`, `site-profiles/test/`, `site/test/`, `stewards/test/`
- workflows: `.github/workflows/container-images.yml`, `.github/workflows/deploy-test.yml`, `.github/workflows/prune-branches.yml`, `.github/workflows/regression.yml`, `.github/workflows/release-sign.yml`
- deploy and service configuration: `.env.example`, `agent-runner/Dockerfile`, `agent-runner/wrangler.jsonc`, `agent-worker/wrangler.jsonc`, `bio-plane/wrangler.jsonc`, `file-scanner/wrangler.jsonc`, `newgroup/wrangler.jsonc`, `ocr-worker/wrangler.jsonc`, `pdf-worker/wrangler.jsonc`, `sheet-worker/wrangler.jsonc`, `site/wrangler.jsonc`, `stewards/wrangler.jsonc` (read for the grant list, step 3)

## The legacy modules proposed (`build/modules.json`)

- `agent-harness`: `agent-harness/`
- `agent-model`: `agent-model/`
- `agent-runner`: `agent-runner/`
- `agent-steps`: `agent-steps/`
- `agent-worker`: `agent-worker/`
- `bio-plane`: `bio-plane/`
- `budget-doctypes`: `budget-doctypes/`
- `court-citations`: `court-citations/`
- `court-doctypes`: `court-doctypes/`
- `docprofile`: `docprofile/`
- `doctypes`: `doctypes/`
- `file-scanner`: `file-scanner/`
- `jurisdictions`: `jurisdictions/`
- `legistar-reader`: `legistar-reader/`
- `newgroup`: `newgroup/`
- `ocr-worker`: `ocr-worker/`
- `pdf-worker`: `pdf-worker/`
- `release`: `release/`
- `roster-reader`: `roster-reader/`
- `sheet-worker`: `sheet-worker/`
- `site-profiles`: `site-profiles/`
- `site`: `site/`
- `stewards`: `stewards/`
