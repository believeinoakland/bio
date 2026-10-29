# Grants

Every act of the four stages, with what it needs, by name only (GRANTS §2; PERMISSIONS §10). Gathered before the first tranche; the owner gives what only he can at one sitting. Written at onboarding (29 Oct 2026) from the product's own workflows, deploy scripts and configs, `build/situations/`, and the variables its code reads, each read in full by the onboarding session or its helpers; measured where it says so. Accounts: GitHub organization `civicsmith` (repository `civicsmith/civicsmith`); Cloudflare account `20b533579290b9b93168345edd3b7f72` only (`.claude/rules/standing-safety.md`); the sessions' Claude environment `BIO` (`env_01KzVwgH7Xye2XSEBvsbAPFN`). `build/grants.json` is the checkable part, read by `proc grants check`.

## Develop

| act | service and host | credential or access (name only) | where the product uses it |
| --- | --- | --- | --- |
| clone, fetch, push a session's own branch; pull requests; merges | GitHub, `github.com`, `api.github.com` | the Claude GitHub app on organization `civicsmith`, all repositories (the proxy injects it); the `main` ruleset (a pull request, zero approvals) and the `tranche` ruleset, both active (read back 29 Oct, ids 26169233, 26169232) | every session |
| read the process | `github.com/neobobkrause/neoprocess` (public), branch `main` | none | `CLAUDE.md`, `.claude/skills/neoprocess/` |
| the standing list | `.claude/settings.json` | Bob's approval of PERMISSIONS §6, written by `proc shims` | every session |
| node 26.10.0, `npm ci` in the bundle members, `ssh-keygen` in the session's container | `nodejs.org`, `registry.npmjs.org`, the container's apt mirrors | none | `.claude/hooks/session-start.sh` (installs all three); the container has node 22 and no `ssh-keygen` (measured 29 Oct). **Not registered after onboarding**: the shims' settings carry no hooks, so nothing runs it (open row 1 below) |
| a full history where a check reads old commits | `github.com` | the app (above) | `site/build.mjs:15,54` (commit `2a64c5ae77`), `bio-plane/test/system/migrate-released.test.mjs:174` |
| rebuild the sheet engine (by hand, never at a merge) | `static.rust-lang.org`, `index.crates.io`, `static.crates.io`, `github.com/ironcalc/IronCalc` | none | `sheet-worker/scripts/build-engine.mjs`; `build/manifest.md` |

## Test

| act | service and host | credential or access (name only) | where the product uses it |
| --- | --- | --- | --- |
| module and layer tests | local; Chromium at `/opt/pw-browsers/chromium` (or `CHROMIUM`) | none: no test reaches a real AI or Cloudflare API (in-process stand-ins) | each module's `tests` in `build/modules.json` |
| fixed public PDFs, checked by SHA-256 (fail by name offline) | `www.govinfo.gov`, `www.irs.gov` | none (`BIO_FIXTURE_CACHE` is a path) | `bio-plane/test/m/pdf-reader/range.test.mjs:19-31`, `doctypes/test/bounded.test.mjs:28-30`, `bio-plane/test/m/control-plane/t51-large-pdfs.test.mjs:19-31` and others |
| the full regression (at a release, or when Bob asks) | GitHub Actions, `regression.yml`; `registry.npmjs.org`; Playwright's browser download | the workflow's own `GITHUB_TOKEN` (read) | `.github/workflows/regression.yml` |
| the gate on every pull request to `tranche` | GitHub Actions, `gate.yml`; the process repository (public) | none | `.github/workflows/gate.yml` (node 22: open row 1) |
| the load check of a deployed plane (by hand, BOB's) | the copy's address | `PLANE_URL`, `PLANE_ADMIN_TOKEN` (given for the run, not held) | `bio-plane/test/m/plane/deployed-alarm-request-check.mjs:3-9` |

## Deploy a development release

| act | service and host | credential or access (name only) | where the product uses it |
| --- | --- | --- | --- |
| deploy a test copy (each member, then the plane) | GitHub Actions `deploy-test.yml`, dispatched or by a `deploy-test/<copy>/{dry-run,deploy}` branch; `api.cloudflare.com` (Workers Scripts, subdomain, Durable Objects, R2 bindings `bio-captures`, `bio-published`, Browser Rendering, cron, Containers) ; `registry.cloudflare.com`; `docker.io` | GitHub environment `deploy-test`, secret `CLOUDFLARE_API_TOKEN` (the "Edit Cloudflare Workers" template plus Containers · Edit, account …7f72 only; K4184, K1985); the account id is in the workflow | `.github/workflows/deploy-test.yml`; `bio-plane/scripts/deploy.mjs`, `deploy-fleet.mjs` (they refuse any other account and any copy not marked a test instance) |
| a session's own Cloudflare acts (read back, tear down, `wrangler`) | `api.cloudflare.com` | the proxy's injected Cloudflare token (verify: active; account …7f72 readable; measured 29 Oct); `CF_TOKEN`, `CF_ACCT`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` in the environment | `bio-plane/scripts/deploy.mjs:62`; K5803 |
| build and publish the container images | GitHub Actions `container-images.yml`; `ghcr.io/civicsmith`, `docker.io/civicsmith` | the workflow's `GITHUB_TOKEN` (packages: write); repository secrets `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` | `.github/workflows/container-images.yml` (its GitHub package space follows the repository's owner since onboarding) |
| assemble a release | local; `ssh-keygen` | none | `bio-plane/scripts/release-assemble.mjs` |
| sign a release | GitHub Actions `release-sign.yml` on a `dist/cut-*` branch | GitHub environment `release`: secret `BIO_RELEASE_SEED`, required reviewer Bob: **his one development act, approving each release** (GOV 10) | `.github/workflows/release-sign.yml` |
| deploy the site, the installer, the stewards worker | `api.cloudflare.com` by `wrangler deploy` | the Cloudflare token above; the stewards' secrets `STEWARD_KEYS`, `SOURCE_KEY` (set on the worker) | `site/package.json:9`, `newgroup/wrangler.jsonc`, `stewards/scripts/deploy.mjs` |
| a capture's storage (walk screenshots never enter git; PROTOCOL §7d) | Cloudflare R2, a bucket with a 30-day expiry on account …7f72 | the Cloudflare token (R2 readable, measured 29 Oct); `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` in the environment (no product code reads them; which bucket they reach is unmeasured) | no bucket for walks exists yet (measured: `bio-captures`, `bio-published` and their `plat-s1` copies only): owed, `build/plan/next.md` |

## Exercise a release

| act | service and host | credential or access (name only) | where the product uses it |
| --- | --- | --- | --- |
| a live walk of the test copy (signed in as administrator and member) | `https://biosmoke8.believeinoakland.workers.dev` (answers 200, measured 29 Oct) | `JOURNEY_ADMIN_HANDLE`, `JOURNEY_ADMIN_PASSWORD`, `JOURNEY_MEMBER_HANDLE`, `JOURNEY_MEMBER_PASSWORD` (present); sign-in is a handle and password on the copy's own form, no inbox code | `bio-plane/src/journey-check/run.mjs:293-358`; `build/situations/deploy-and-walk.md` |
| the walk's assistant step (only with `--assistant`, off by default) | `claude.ai` | a person's own Claude sign-in and a code typed at the terminal; alternative: reported "not walked" (no API key, PERMISSIONS §9.3) | `bio-plane/src/journey-check/run.mjs:209-222` |
| the installer and the site | `https://newgroup.believeinoakland.workers.dev`, `https://civicsmith.org` (both 200, measured) | none | `newgroup/`, `site/` |
| BOB's new-team rehearsal | a fresh test copy on account …7f72, never Bob's throwaway account (K5258); the installer's Cloudflare consent page | Cloudflare's OAuth consent is a person's click behind bot protection (K4942, K4952): Bob's walk when he installs under his own throwaway account; `CS_TEST_CF_TOKEN`, `CS_TEST_CF_ACCOUNT_ID` live on another Claude account's environment and no product code reads them | `newgroup/src/index.mjs:56-84`; `build/rulings-product/installer-accounts.md` |
| deployed copies read the release notice; the installer fetches releases | `raw.githubusercontent.com/believeinoakland/bio/...` | none; the old address still answers 200 with no redirect (measured 29 Oct) | `bio-plane/src/setup.mjs:458`; `newgroup/src/steps/api.mjs:118-120` |

## Open rows: found at onboarding, each owed where it says

1. **The session setup and the gate's node.** The product's sessions need node 26.10.0, `npm ci` and `ssh-keygen` (`.claude/hooks/session-start.sh`), and the shims' settings register no hook; the gate runs node 22, the regression 26.10.0. A process matter (PRODUCT-SUPPLIES has no row for a product's session setup), reported to the neoProcess lane; until it is answered, a session runs `CLAUDE_CODE_REMOTE=true bash .claude/hooks/session-start.sh` itself before its first test and puts `/opt/node26/bin` first on its `PATH` (owed, `build/plan/next.md`).
2. **The release address names the old repository** (`believeinoakland/bio`): it answers today; moving it to `civicsmith/civicsmith` changes every installed copy's update check (owed, `build/plan/next.md`).
3. **The live walk's route.** `deploy-and-walk.md` (K4733) says a walk goes through the environment's proxy; `journey-check/run.mjs:31-33, 53-70, 306` launches Chromium on the direct route (owed, `build/plan/next.md`).
4. **`BIO_RELEASE_SEED` is in the sessions' environment**, though only `release-sign.yml` signs (`--sign` refuses outside GitHub Actions): nothing a session does needs it, so it comes out of the `BIO` environment at the sitting (PERMISSIONS §10.4). `BIO_ADMIN_TOKEN`, `BIO_MEMBER_TOKEN`, `BIO_INSTANCE`, `BIO_RATIFY_SEED` are also present and read by no code (`.env.example` only): the same.
