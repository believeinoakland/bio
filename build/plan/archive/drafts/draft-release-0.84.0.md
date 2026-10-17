# Release 0.84.0: cut and checks (cut worker for BOB #170), 2026-10-14

Runbook draft-T46-trial.md §4, steps 0–6, in the form of K2910–K2912, K3044 and K3048. Nothing was deployed, no ssh-keygen controls were run, no tag was pushed, nothing was force-pushed, and main was not touched.

## Finding first: 0.83.0's cut never reached T47, T48 or main
`dist/cut-0.83.0` (f496e444ba … add6de3bde) is an ancestor of neither `tranche/T47`, `tranche/T48` nor `main`. T48's head 99404ccba4 was still at 0.82.0 in every version site and in `release/`. It also lacked RELEASES' 0.82.0 row, 0.83.0's section-26 harness fix (f1c3a30deb), and agent-runner's 0.83.0 digest (it pinned 0.82.0's `e56253c5…`). So K2273's "reaches main through the tranche's close" did not happen for 0.83.0. T47's close (PR to main) did not carry it.
**Act (BOB's detail, taken by the worker):** merged `origin/dist/cut-0.83.0` into the cut, as commit 7f02727a42 (`--no-ff`). The merge had one conflict, in a generated file (`agent-runner/dist/agent-runner.bundle.json`), which was rebuilt afterwards. Effect: 0.84.0 descends from the signed, live 0.83.0, and 0.83.0's `release/` and harness fix reach main when T48 closes.
The merge also carried 0.83.0's installer bundle, built from older installer source. That bundle was put back to T48's own fresh bundle (sha `d5784fb8…`), which embeds 0.82.0 until step 8.

## Step 0
`npx wrangler whoami` showed one account only: 20b533579290b9b93168345edd3b7f72. No secret was printed.

## Step 1: rollback targets (Cloudflare, version at 100%, read-only)
| worker | deployment | version (100%) | created |
|---|---|---|---|
| biosmoke7 | af953351-a11b-4403-8051-9abc89f0179f | 64ed6feb-ac4d-4f4f-9272-4dfed12e6115 | 2026-10-12 13:49 |
| agent-worker | 549c198f-279e-44f6-8278-8f0b3d0c4876 | bd447ea4-a873-4377-998a-26ac0422338d | 2026-10-12 13:47 |
| agent-runner | e0537963-4b0e-4538-bfae-d5d1d44b3e48 | e338042e-b065-450e-8df7-877509b4e89a | 2026-10-12 13:45 |
| pdf-worker | 72508261-cb08-4214-a437-15a42911ffee | 287ada3c-81b8-45e9-9887-3072c6ba3b2b | 2026-10-12 13:48 |
| ocr-worker | 79a6406f-6317-48c7-80fd-38a14b4d18d1 | b3030c97-bd58-4058-8ee6-8e9083a16cb2 | 2026-10-12 13:48 |
| sheet-worker | 07e7c69b-f368-401b-bb0d-e110f7b09228 | 64d02380-fc17-48f6-bf5a-badfbc304abf | 2026-10-12 13:48 |
| file-scanner | 9d3bb838-4cde-4d65-be61-c5d9e38cc439 | ae12c08b-7da1-46f9-a08f-f3cb229b6cc8 | 2026-10-12 05:01 |
| civicos (UI) | 15baff7c-caac-41c6-b786-3de1ac4a3ce2 | 4584a81a-0ca5-4f33-8649-056befef518f | 2026-10-12 05:05 |
| newgroup | 3381a5e5-d58e-4336-9d99-98cc43e71b82 | bd130ee0-93e8-4b1e-8080-6514b70b18da | 2026-10-08 02:23 |

## Step 2: the cut
Branch `dist/cut-0.84.0`, pushed with no tag:
- 7f02727a42: merges dist/cut-0.83.0 into tranche/T48 @ 99404ccba4.
- a0d6ce0ddd: the version cut.
  - All 14 version sites and 4 lockfiles (agent-runner, bio-plane, file-scanner, sheet-worker) are at 0.84.0. `resolve-version`: "fleet version: 0.84.0 — every site agrees".
  - RELEASES gains `["0.83.0", "add6de3bde7bbb0c65c1dc55cf72406a994d371a"]`. Its `release/RELEASE.json` is 0.83.0, plane 15fa44b9…6210.
  - K1540's order: program.mjs unchanged (sha 0d80811c…, 80 inputs); court-data unchanged (`--check` fresh). `bundles.mjs` rebuilt agent-runner, bio-plane, file-scanner and sheet-worker; their artifacts are byte-identical and only the manifests moved.
  - newgroup waits for the signature (step 8): embed-release refuses an unsigned 0.84.0.
- **0f31ff9d73 (tip, the cut that signing runs on):** agent-runner digest pinned, agent-runner bundle rebuilt (sha 14d2df8d…).
- After the tip: fleetbundles 149 pass, 0 fail, no skip; newgroup-bundle-fresh 4/0.

## Step 3: images
agent-runner's source changed since 0.83.0's cut (`src/` sign-in rework, new `screen.mjs` and `waits.mjs`, Dockerfile COPY line), so it is rebuilt. file-scanner changed only in its Dockerfile comments and its version, so its source is unchanged and it keeps 0.82.0's digests, as at 0.83.0. The run built all three images (the workflow's matrix). Only agent-runner's new digest is used; file-scanner's new ones (scanner cd5b30c7…, renderer bd68a31a…) are not pinned.

container-images run **38539843563** (push of a0d6ce0ddd) was green on all three jobs.

| image | digest | anonymous pull by digest |
|---|---|---|
| agent-runner (new) | `ghcr.io/believeinoakland/agent-runner@sha256:d7c81712ef95683068451476597ca22844937d6c9bccc756d713f5943c64ee00` | 200 |
| file-scanner-scanner (kept) | `ghcr.io/believeinoakland/file-scanner-scanner@sha256:2af812a3bde157731a05a827c035f49e8faf83ad29e6cbbf4ff440844b6e5db8` | 200 |
| file-scanner-renderer (kept) | `ghcr.io/believeinoakland/file-scanner-renderer@sha256:90385aeddbc05b66882506a0ae6ec48dfb635119bae8c20cfba3c31e4afb974b` | 200 |

The agent-runner digest is written into `agent-runner/fleet-member.json` and `wrangler.jsonc`, and its bundle is rebuilt (0f31ff9d73).

## Step 4: module tests (`node .github/scripts/module-tests.mjs`, local, on the cut)
The full run reported 90 failures in 22 modules. Each was traced:
- **70 are T47's close reds by name** (K3192, rule 5): S 45, D 17, R 6 (membership :13, :151 now for ai-accounts, :218, :325 and t9:161; promotion registry:64), T 1 (promotion row-census), E 1 (test-support R2). file-safety's R1c red (rows.test.mjs:193) is gone, cleared by the opening act.
- **17 were this container's environment, now green.** My run lacked `npm ci` in `bio-plane/src/journey-check` (playwright-core):
  - journey-check 14: re-run 17 pass, 0 fail.
  - following checks.test.mjs 1: re-run 25/0.
  - answer-envelope families.test.mjs 1: re-run 1/0.
  - The local journey then ran 92 steps, 0 failures.
- **New, named (none is a product bug):**
  1. membership `module-order.test.mjs:285` (R83 T47-7): "no module outside T47's six and screens-entry is without paths", actual `['ai-accounts']`. The cause is the opening act K3196, which placed ai-accounts with empty `paths`. It is the same build-state family as rule 5 (3) and clears when ai-accounts' job merges (T48 L2), or by membership's tolerance (T48-9). Recommended: accept it by name with rule 5 (3).
  2. installer, 3 reds with one cause (the merge brought `release/` 0.83.0, while the committed `newgroup/src/release.mjs` embeds 0.82.0): `embed.test.mjs` ("the committed embed IS the signed release asset", "its label is RELEASE.json's version"), `requirements.test.mjs:1146` R23 (images e56253c5… vs 9fcf5ee5…) and `:1430` R26 (0.82.0/e3f69fad… vs 0.83.0/15fa44b9…). All clear at step 8, when `npm run build` embeds the signed 0.84.0 and `src/release.mjs` and the bundle are committed together. Note that K3048's step 8 committed only the bundle, not `src/release.mjs`. Step 8 should commit both.
- Green, among others: plane 234/0 (including migrate-released with the 0.83.0 row), bundler 97/0 (re-run on the tip 96/0 without the control file), agent-runner 55/0 (re-run on the tip), file-scanner 54/0, stewards 23/0.

Logs are in the scratchpad: `module-tests.log`, `fleetbundles.log`, `ngfresh.log`, `dryrun.log`.

## Step 5: assembly dry-run and signing
`release-assemble.mjs --version 0.84.0 --dry-run` on 0f31ff9d73: "7 assets at 0.84.0, all proved fresh against this tree". Both container members carry their `container…json` parts.

| asset | sha256 | bytes |
|---|---|---|
| plane | ff30ebb1c671acb8f6ed13d67d0b961f1064c307761c7312e5738d6ae3c0caa5 | 19,351,881 |
| agent-runner | 14d2df8d18eaad4578a3b685428ec3fe5222cd1cb9f6a44ae9c46340d21fe4b1 | 65,644 |
| agent-worker | 6ccc930db26dbfe812cf2533bf69e97537065e7df0ac4423607477a5250a99c2 | 304,971 |
| file-scanner | 38bc5dee4076d4fe243f0cf92c4a681cc62481217f4311b743fc6f566d503e90 | 176,562 |
| ocr-worker | da20f40d0c6689e7c37650a677cd8beed442c78a9036138b9d114bda79f6ff44 | 303,361 |
| pdf-worker | 6cc211a9fd5b8c90d194bac06b40e3be962f3fb0d5bb22327d0d2b3fa761e036 | 2,465,783 |
| sheet-worker | 31b70e1d0d9bb9d8eebcdd860af9858e08837ad4365b31047c905707bd173ac6 | 26,160 |

**Signing:** `release-sign.yml` was dispatched with `version: 0.84.0` on `dist/cut-0.84.0` (head 0f31ff9d73). Run **38550200586** is `waiting` for Bob's approval in the `release` environment.

## Blocked or refused
Nothing was refused. Open after this worker:
- Bob's approval of run 38550200586.
- Then the seven controls (step 7), step 8 (newgroup embed: commit `src/release.mjs` with the bundle), and the deploys (Bob's approval, K1715).
