# DRAFT · Runbook: the release at T33's close (K1501)

Drafted by a read-only worker for BOB #121, 2026-10-06, from `tranche/T33`. Nothing in the repository was changed.
Sources: `build/plan/current.md:233-283`; `civicos-process/PROCESS-MECHANICS.md` §5.7, §11, §14, §16; `build/manifest.md:30-50`;
`.github/workflows/regression.yml`; `bio-plane/scripts/{release-assemble,deploy,deploy-fleet,bundles,resolve-version}.mjs`;
`newgroup/scripts/embed-release.mjs`, `newgroup/DEPLOY.md`, `bio-plane/INSTALLER.md:86-160`; the last cut, commit `dd324152c9`
(0.79.0); the old process's cut procedure `docs/development/kickoffs/DIST.md:95-200` (retired, used here only as the record of how
cuts were done; mechanics §11 says "the distribution process (a separate document)", and no such document exists yet, gap G1).

## 0. The last release, as recorded

- **0.79.0**, cut 2026-09-24 on branch `dist/cut-0.79.0` (commit `dd324152c9d999b9a0cc8cadc99947c15bebdd88`) by DIST #6 at Bob's ask.
  Plane asset sha256 `09e4e334…`, 4,436,123 B; members agent-worker, ocr-worker (2 parts), pdf-worker (`release/RELEASE.json`).
- **Signed by a session**, not by Bob: `release-assemble.mjs --sign` with the environment secret `BIO_RELEASE_SEED` (BIOKEY-RAW1
  envelope), signer `ssh-ed25519 …N3Vl bio-release`, the one key in `newgroup/src/signers.mjs:15-16` `ARMED_SIGNERS`. Both `sig`
  (plane bytes) and `fleetSig` (the set) verified with stock `ssh-keygen -Y verify`; 7/7 signature controls.
- **Distributed** by: deploying the plane to `biosmoke7` (`deploy.mjs`), members from source through wrangler (`deploy-fleet.mjs`),
  re-cutting and deploying the `newgroup` wizard with the signed embed, then landing `release/` on `main` (every installer's
  `/update` reads `main/release/RELEASE.json`, `newgroup/src/index.mjs:50`). Groups update by the wizard's update option
  (`INSTALLER.md:90-102`: re-upload with `keep_bindings`, store migrates on boot). Rollback targets were recorded first.
- **Tags:** cuts were pinned by branch `dist/cut-X.Y.Z`; the newest tag on the remote is `v0.71.0`. A tag push from a cloud session
  is refused by the session's git proxy (K1433, K1436: HTTP 403 with no GitHub request id; "no setting of Bob's changes it").
- **Live today:** `biosmoke7` serves 0.79.0 (`docs/development/TRANSITION.md:156`). Every version site reads 0.79.0
  (`node bio-plane/scripts/resolve-version.mjs`, 11 sites agree), so the cut must bump (release-assemble refuses a second,
  different 0.79.0: `VERSION_ALREADY_RELEASED`).

## 1. Preconditions

| # | precondition | how checked |
|---|---|---|
| P1 | Every T33 layer closed (§5.6), L11 included; `current.md` moved to `archive/T33.md`; `main` at the tranche's close commit (§5.7 (2)-(3)) | `git merge-base --is-ancestor origin/tranche/T33 origin/main` and the reverse |
| P2 | Generated artifacts fresh on `main` in K1540's order: `node bio-plane/src/case-checker/build-program.mjs`; `node court-citations/build.mjs --check`; `node bio-plane/scripts/bundles.mjs`; `cd newgroup && npm run build` | `node --test bio-plane/test/system/fleetbundles.test.mjs` (0 fail, no SKIP, except the named agent-runner reds K1604/N578) and `node --test bio-plane/test/system/newgroup-bundle-fresh.test.mjs` (`build/manifest.md:47-50`) |
| P3 | `node_modules` installed in every bundled member (release-assemble refuses `GUARD_CANNOT_RUN` otherwise): bio-plane, pdf-worker, ocr-worker, sheet-worker, agent-runner, newgroup (`npm ci`) | `node bio-plane/scripts/release-assemble.mjs --dry-run` |
| P4 | Session environment holds `BIO_RELEASE_SEED`, `CLOUDFLARE_API_TOKEN`/`CF_TOKEN`, `CF_ACCT`/`CLOUDFLARE_ACCOUNT_ID` (names present in this session; values never printed) | `[ -n "$BIO_RELEASE_SEED" ]`; `npx wrangler whoami` must show account `20b533579290b9b93168345edd3b7f72` or STOP (CLAUDE.md) |
| P5 | The everyday response budgets' **baseline** (K1432, T33-M2) taken on `biosmoke7` while it still serves 0.79.0 | see §4; it cannot be taken after step 6 |
| P6 | The gaps marked "blocks" in §5 resolved or ruled around | §5 |

## 2. Steps, in order

Who: **S** = a session (BOB, or a worker BOB starts) can do it; **B** = only Bob (§16, K1501).

| # | step: command or tool | verifies / writes | est. | who |
|---|---|---|---|---|
| 1 | **Full regression** (§11, K19): GitHub workflow `regression` (`.github/workflows/regression.yml`), `workflow_dispatch`, no inputs, on `main` (MCP `actions_run_trigger`, or `gh workflow run regression.yml --ref main`). Read the step summary line `regression: every package passed` | each package's `npm test` (bio-plane, pdf-worker, ocr-worker, newgroup, agent-worker) and the kept suites `bio-plane/test/*.test.mjs`, `bio-plane/test/system/*.test.mjs`, `civicos-ui/test/*.test.mjs`. **Does not cover T33's top-level modules (G2)**; run them locally until the workflow is extended | 30-90 min (timeout 120; no run recorded under the new process) | S (dispatch is not a refused act) |
| 2 | **Record rollback targets** before any deploy: `npx wrangler deployments list --name <w>` for `biosmoke7`, `agent-worker`, `pdf-worker`, `ocr-worker`, `civicos`, `newgroup`; note each `(100%)` version id (DIST.md:226) | a ruling line listing them (0.79.0's are in `dd324152c9`'s message) | 5 min | S |
| 3 | **Cut branch** `git switch -c dist/cut-0.80.0 origin/main`. Bump every site `resolve-version.mjs` names (bio-plane, agent-runner, agent-worker, ocr-worker, pdf-worker, sheet-worker `package.json` and `wrangler.jsonc` `vars.VERSION`). Add `["0.79.0", "dd324152c9d999b9a0cc8cadc99947c15bebdd88"]` to `RELEASES` in `bio-plane/test/system/migrate-released.test.mjs` (last row is 0.78.0; DIST.md:190 lesson 2). Rebuild: `node bio-plane/scripts/bundles.mjs` | `node bio-plane/scripts/resolve-version.mjs` prints "every site agrees" at 0.80.0 | 15 min | S |
| 4 | **agent-runner image** (T33-D1, K1604): pin the base image by digest in `agent-runner/Dockerfile:4`; `docker build --platform linux/amd64 -t docker.io/civicos/agent-runner:0.80.0 agent-runner`; push; write the pushed digest into `agent-runner/fleet-member.json` `image.digest` (now `null`) | R7: an install names `repository@sha256:…` only; R10 egress `api.anthropic.com` | 20-40 min | S for build (docker present); **push needs a registry credential the repo and env do not hold (G3)** |
| 5 | **Assemble and sign**: `node bio-plane/scripts/release-assemble.mjs --dry-run`, then `--version 0.80.0 --sign`. If the container member ships, hand-write its `container.json` part into the fleet entry before signing (N610, K1678 (1); G4) | writes `release/RELEASE.json`, `release/*.bundled.mjs`, `release/ocr-worker/assets/*`, sheet-worker's wasm part; refuses stale, skewed or already-released; verifies `sig` and `fleetSig` with stock `ssh-keygen` | 5-10 min | **S**: the seed is in the session env and 0.79.0 was signed this way. B only if BOB finds `BIO_RELEASE_SEED` absent; then Bob signs the emitted payload (`--emit-payload <f>`, then `--fleet-sig <f>`) in `sign-release.html` (K1501) |
| 6 | **Signature controls** (DIST.md:159-163): stock `ssh-keygen -Y verify -n bio-release` positive on plane bytes and fleet payload; refusals for altered bytes, wrong namespace, wrong key, 0.79.0's sig over new bytes, altered fleet payload | 7/7 as at 0.79.0 | 10 min | S |
| 7 | **Embed the installer**: `cd newgroup && npm run build` then `npm test` | `embed-release.mjs` refuses unless asset hash = RELEASE.json, sig verifies against `ARMED_SIGNERS`, version = `bio-plane/package.json`, no published token | 5 min | S |
| 8 | **Commit and push the cut branch** `dist/cut-0.80.0` (branch push allowed). **No tag**: the pin is the branch (K1433 precedent). Optional, B: a `v0.80.0` tag pushed from outside a cloud session | the cut is a named, pushed state | 2 min | S (tag: B, and only if wanted) |
| 9 | **Containers on the account**: `npx wrangler containers list` (read) | answers whether Containers is enabled on `20b5…7f72` | 2 min | S to check; **B to enable** in the Cloudflare dashboard if off (`draft-T33-entries-C.md:392`) |
| 10 | **Deploy the fleet to `biosmoke7`** from a worktree at the cut commit (DIST.md:246), in order: **agent-worker first or with the plane, never the plane first** (IC-130): `node bio-plane/scripts/deploy-fleet.mjs agent-worker --instance biosmoke7` (dry-run first); `pdf-worker`, `ocr-worker`, `sheet-worker` likewise; then `agent-runner` (no script exists, G5); then the plane: `cd bio-plane && node scripts/deploy.mjs biosmoke7 0.80.0 ../release/bio-plane.bundled.mjs` | `deploy.mjs` reads back and hashes the script, waits for `/version`; the store migrates on boot (B16 N473 `filing_templates`, C1 R28/R29) | 20-30 min | S; if the permission check refuses a deploy, §16: B approves in that session (`draft-T33-entries-C.md:393`) |
| 11 | **Live verification on `biosmoke7`**: `/version` = 0.80.0 for plane and each member (read from the deployments API, not `/workers/scripts`, DIST.md:229); headline ops live in `store=scratch`; `op=audit` (10 known C-18.9 findings, D-200); `MODES.plan` listed (C2); `filing_templates` present (B16); then sweep scratch (DIST.md:175-182) | on failure: `npx wrangler rollback <id> --name <w> -m "<why>" -y` per step 2, and the branch never reaches `main` | 30-60 min | S |
| 12 | **UI worker `civicos`** moves with the plane only if `civicos-ui/app.html` changed since 0.79.0 (`git diff dd324152c9 -- civicos-ui/app.html`); deploy with `civicos-ui/deploy-ui.mjs` | DIST.md:193, :235 | 10 min | S |
| 13 | **Deploy the wizard** `newgroup`: `cd newgroup && npx wrangler deploy` (or DEPLOY.md's paste); read the script back: embedded version 0.80.0 and `bindings: []` still empty (DIST.md:184-186) | the installer offers 0.80.0 to new groups; N336/C3 | 10 min | S. The OAuth client's added scope `containers.write` (K1678) is a dashboard change on the OAuth client: **B** if the session's token cannot edit it (G10) |
| 14 | **Advance the pointer**: merge `dist/cut-0.80.0` into `main` with the GitHub merge tool (PR, method `merge`; standing list K1261, CLAUDE.md). From then every copy's `/update` offers 0.80.0 | `release/` on `main` = the live-verified release; distribution to groups | 5 min | S; if refused, §16: K1454's precedent, B approves in that session |
| 15 | **Record**: one ruling (version, sha256s, image digest, rollback targets, controls, live checks); mark B11/C9 (N461 release share, N471 release copies), B16, C1, C2, C3, T33-D9 done in `next.md` | P15 | 10 min | S |

## 3. Acts that are Bob's (or may be)

| act | status | cite |
|---|---|---|
| The release signature | **Probably not Bob's**: `BIO_RELEASE_SEED` is in this session's env and signed 0.79.0 (`dd324152c9`). Bob's only if a BOB session lacks it: then `sign-release.html` over the emitted payload | K1501; `release-assemble.mjs:96-101,361-366,394-395` |
| Pushing a release tag | Not needed; the proxy refuses it and no setting of Bob's changes it. Pin by branch | K1433, K1436 |
| Merging the cut into `main` | Standing list covers the GitHub merge tool; a direct `git push` of `main` was refused once | K1454, K1497, K1261; CLAUDE.md |
| Enabling Containers on `20b5…7f72` | Bob's, if `wrangler containers list` shows it off | plan :254; entries C (e) 2 |
| His own Claude sign-in (`claude setup-token`) or API key, as a **member** of `biosmoke7`, through the member's connect flow (never a copy-wide token) | Bob's | K1502; plan :254 |
| Console credit for the API-key path (M-Q1 comparison, M-Q9) | Bob's | plan :254; entries C (e) 2 |
| Approving a deploy if the permission check refuses one | Bob's, typed in the refused session | §16; entries C (e) 3 |
| Container registry account and credential (Docker Hub `civicos`, or a decision to use Cloudflare's registry) | Bob's to create/pay if Docker Hub; see G3 | M-Q8 (`measures-T33/assistant-substrate.md:185-196`) |

## 4. Deployment-gated measurements (plan `current.md:238-252`), run at once after step 11

| measurement | how run | needs |
|---|---|---|
| VF-4 = M-Q3, CHECK's first live run; Q0-11 ends in `verification_recorded` | op: a CHECK run on `biosmoke7` under the member's own account, then `op=airunverify` (store handler `bio-plane/src/ai-runs/index.mjs:3062` → `verificationRecord`, :2860); its public route is L11's (G7) | Bob's member credential (K1502); agent-runner deployed for the subscription path, or an API key |
| M-Q1, one model turn through each path | op: one ask on the API-key path and one on the subscription path; record latency, CPU, cost or plan usage | both credentials; Containers on; agent-runner live |
| M-Q2, container reliability | manual series of cold and warm starts through `RUNNER`; spawn failures, memory | agent-runner deployed (G3, G5) |
| M-Q6, default use ceiling | `op=aiusage` (`ai-runs/index.mjs:3055-3057`: a member's day against the ceiling; an administrator's month per mode) over a series of asks and runs | M-Q1 done; T33-50's provisional ceiling |
| M-Q7, per-ask bounds | op: asks of graded size; read per-ask usage | as M-Q6 |
| M-Q9, the 150-question set on Sonnet 5.5 and Opus 5.5 | manual, scripted asks against a frozen reference corpus; bar fixed before measuring (`measures-T33/assistant-substrate.md:282-472`) | Console credit; a frozen corpus; **two raters** for grounding and mistranslation, BOB settles disagreements; no runner script (G8) |
| N540, live acquisition with the Civicsmith user agent | ops: re-read the sources measured before (`civicsmithUserAgent`, `bio-plane/src/setup.mjs:2142`) | plane 0.80.0 live |
| Legistar live acquisition | ops: legistar-reader and following (T33-14, T33-79) against the live API | plane live |
| Everyday response budgets (K1432), before and after | op timings of the everyday reads, on 0.79.0 (P5) then 0.80.0 | **no defined op list or script (G9)** |
| M-X1b, Bob's chain on real data | op `explore` on `biosmoke7`'s populated `bio` store | the first populated deploy; Bob names the chain? (plan :251 says "Bob's chain") |
| B1 DIST-14 CSV bound; B2 N75 61.3 MB; B3 N34 JPX bound | ops on the deployed plane with fixture inputs (`bio-plane/test/fixtures/`); JBIG2 needs a fixture encoder (plan :273) | plane and pdf/ocr workers live |

## 5. Open gaps (what the repository does not hold)

- **G1** · The "distribution process (a separate document)" of mechanics §11 does not exist; the only written procedure is the retired DIST kickoff (`docs/development/kickoffs/DIST.md`). This runbook stands in; BOB should rule it (P15).
- **G2 · blocks step 1's meaning** · `regression.yml:31-35` runs only bio-plane, pdf-worker, ocr-worker, newgroup, agent-worker and the kept suites. It omits every top-level T33 module with tests: `agent-runner`, `agent-model`, `agent-harness`, `sheet-worker`, `jurisdictions`, `court-citations`, `court-doctypes`, `budget-doctypes`, `docprofile`, `doctypes`, `legistar-reader`, `roster-reader`, `site-profiles` (each has a `tests` path in `build/modules.json`). Extend the workflow from `modules.json` before the release.
- **G3 · blocks the container member** · No registry credential in the repo or env (no `DOCKER*` variable). `fleet-member.json` names `docker.io/civicos/agent-runner`; whether that Docker Hub namespace exists is unrecorded. M-Q8 chose public Docker Hub by digest for group copies; the project's own copy could use Cloudflare's registry (`wrangler containers push`) with the existing token. The base image `node:22-bookworm-slim` is not digest-pinned (K1604 says pinned at the release).
- **G4** · release-assemble skips agent-runner (`discoverMembers().filter(m => m.bundle)`, `release-assemble.mjs:137`), so the fleet signature does not cover it. The `container.json` part (`{class_name, image: "<repo>@sha256:…", scheduling_policy: "default", max_instances, bind}`, type `Container`) is N610 (T34); the T33 release writes it by hand (K1678, `next.md:107`), which the assembler has no input for.
- **G5 · blocks the subscription path** · No `agent-runner` **Worker** exists: agent-worker binds `RUNNER` to class `AgentRunner` in script `agent-runner` (`agent-worker/wrangler.jsonc:97-100`), but no source defines `AgentRunner`, no wrangler config declares the container, and `deploy-fleet.mjs` cannot deploy a container member. K1615: "installer's and the release's". If not written, ship 0.80.0 without the container member (agent-worker then uploads without `RUNNER`, K1678 (1)) and run M-Q1/M-Q2 on the API-key path only.
- **G6** · `sheet-worker` (GO, K1506) is bundled and versioned, but the plane's `wrangler.jsonc:108-112` declares no `SHEET_WORKER` service; K1683 says it "binds with the release". Without that line the member deploys but stays unbound. None of the L11 branches (plane, installer, instance-setup, control-plane) adds it.
- **G7** · VF-4's act `airunverify` exists as a store handler (`ai-runs/index.mjs:3062`), but no control-plane or op-declarations source on `tranche/T33` or the L11 branches names it yet (only their briefs, `build/jobs/T33/control-plane.bob.md`, `op-declarations.bob.md`); confirm it is routed when L11 closes, or VF-4 cannot end in `verification_recorded`.
- **G8** · M-Q9 has a question set and a bar but no runner, no frozen corpus snapshot and no named raters.
- **G9** · Everyday response budgets (K1432) name no op list, script or numbers; the "before" baseline must be taken on 0.79.0 before step 10 or is lost.
- **G10** · newgroup's OAuth client must gain `containers.write` (K1678, M-Q8 (a)) and each group re-consents; whether a session token can edit the OAuth client is unrecorded.
- **G11** · No inventory of instances other than `biosmoke7` (and the `newgroup`, `civicos` workers). "Migrations at every instance" (B16, C1) for group copies happens only when each group runs the wizard's update; the release cannot do it for them.
- **G12** · `fleetbundles.test.mjs` carries named reds for agent-runner (K1604, N578, T34) and agent-worker's inputs (N575); P2's "0 fail" is "0 fail but the named reds" until T34.
