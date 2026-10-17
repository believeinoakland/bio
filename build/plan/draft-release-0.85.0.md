# Release 0.85.0: cut and checks (cut worker for BOB #184, under K3426), 2026-10-15

This covers steps 0–6 of the runbook in draft-T46-trial.md §4, in the form of K2910–K2912, K3044, K3217 and K3235.

Nothing was deployed. No ssh-keygen controls were run, no tag was pushed and nothing was force-pushed. `main` and the `tranche/*` branches were not touched. The worktree stays at `/tmp/claude-0/-home-user-bio/fceaafa8-13e5-5ebe-b786-9edb74436baa/scratchpad/cut`, on `dist/cut-0.85.0`.

## Finding first: steps 5 and 6 are blocked by a missing release-notes file
Bundler R32 (T48-4, merged at K3205) adds a requirement. Every release must now include a committed `release/notes/<version>.json` file:

- Its fields are `{date, security, notes: {members, administrators, must_do}}`.
- The notes are written in members' words and are part of what gets signed: the signed release notice that each group's Civicsmith checks for (K3158, N1047).

0.85.0 is the first cut since R32. `release/notes/` does not exist, so `release-assemble.mjs --dry-run` refuses with `NO_NOTES`.

`release-sign.yml` runs that same dry run before it signs. If I dispatched it now, it would wait for Bob's approval and then fail at its first step. So I did **not** dispatch it.

No ruling or handoff says who writes the notes. They are product text that Bob's key will sign and that every group's administrators will read, so I left them to BOB.

- **What BOB has to do:** commit `release/notes/0.85.0.json` on `dist/cut-0.85.0`, re-run the dry run, then dispatch `release-sign.yml`.
- **A draft for BOB to review** is at `/tmp/claude-0/-home-user-bio/fceaafa8-13e5-5ebe-b786-9edb74436baa/scratchpad/notes-0.85.0.DRAFT.json`. It is not committed.
  - It has `security: false` and an empty `must_do`.
  - The member and administrator texts come from T49's outcome (archive/T49.md).
  - `signatures.releaseNoticeStatement` accepts it.
  - Its claims need BOB's check before it is used.

Adding the notes file does not change any asset's bytes, so the asset hashes in step 5 stand.

## Step 0
`npx wrangler whoami` (wrangler 4.114.0) showed one account only: 20b533579290b9b93168345edd3b7f72. No secret was printed.

I ran `npm ci` in agent-runner (`--ignore-scripts`), bio-plane, bio-plane/src/journey-check, file-scanner, newgroup, ocr-worker, pdf-worker, sheet-worker and site. All exited 0. agent-worker has no lockfile.

## Step 1: rollback targets (Cloudflare deployments API, version at 100%, read-only)
| worker | deployment | version (100%) | created |
|---|---|---|---|
| biosmoke7 | e85f71d1-b1f4-4d76-9397-af4b7ee40237 | 2a1bf3bf-4360-4633-ba82-b019c832535a | 2026-10-14 12:02 |
| agent-worker | b51f2265-796d-4999-aec5-f7d94ecc7943 | 970d78cc-6d73-4fb0-b47d-846b07aa1453 | 2026-10-14 11:59 |
| agent-runner | 7ea538e7-86cb-4382-923f-0985616c6b20 | c81e0928-0677-4cd1-9396-d82668bbf2c0 | 2026-10-14 11:58 |
| pdf-worker | 6b770bae-075a-4770-9acb-2bc5b2763d94 | 7abe537e-5843-410e-a669-2d57d960f701 | 2026-10-14 12:00 |
| ocr-worker | 670d3120-8bc8-482f-bd8b-a4899362870d | 639d9996-a7c7-4df7-82c1-d34653b6aa41 | 2026-10-14 12:01 |
| sheet-worker | b2e82576-6991-46aa-b1c1-f29089016188 | 2ed36af2-4a3a-43b9-b599-5fe66496a5e4 | 2026-10-14 12:01 |
| file-scanner | 9d3bb838-4cde-4d65-be61-c5d9e38cc439 | ae12c08b-7da1-46f9-a08f-f3cb229b6cc8 | 2026-10-12 05:01 |
| civicos (UI) | 15baff7c-caac-41c6-b786-3de1ac4a3ce2 | 4584a81a-0ca5-4f33-8649-056befef518f | 2026-10-12 05:05 |
| newgroup | 3381a5e5-d58e-4336-9d99-98cc43e71b82 | bd130ee0-93e8-4b1e-8080-6514b70b18da | 2026-10-08 02:23 |

The first six match 0.84.0's deploy (K3237: agent-runner c81e0928, agent-worker 970d78cc).

## Step 2: the cut
Branch `dist/cut-0.85.0`, cut from `main` @ dccb389428 (T49's close, which already contains 0.84.0's cut 396d992d31). It was pushed with no tag.

- **01d7a80544: the version cut.**
  - All 14 version sites and 4 lockfiles (agent-runner, bio-plane, file-scanner, sheet-worker) are at 0.85.0. `resolve-version` reports "fleet version: 0.85.0 — every site agrees".
  - RELEASES gains `["0.84.0", "396d992d316a9a61e1127ae801be5a5805f4bce9"]`. That is dist/cut-0.84.0's final commit, the installer embed (K3235); its `release/RELEASE.json` is 0.84.0, plane ff30ebb1….
  - K1540's order: program.mjs unchanged (sha d7aaf544…, 80 inputs); court-data unchanged (`--check` fresh); setup-words rows and site pages unchanged.
  - `bundles.mjs` rebuilt agent-runner, bio-plane, file-scanner and sheet-worker. Their artifacts are byte-identical; only the manifests moved.
  - newgroup waits for the signature (step 8).
- **0b26ba795d (tip):** agent-runner's digest pinned and its bundle rebuilt (sha 77d99256…).

## Step 3: images
container-images run **38768242807** (the push of 01d7a80544) was green on all three jobs.

**agent-runner is rebuilt** (BOB's detail, decided here). Its code under `src/` is unchanged since 0.84.0's cut. But its image copies `package.json` and serves that file's version at `/version` (`src/entry.mjs:15`), and the cut changes that version.

Keeping 0.84.0's image would put a runner that answers 0.84.0 inside a 0.85.0 release. resolve-version's rule is that a version is a promise about bytes. So the new digest is pinned.

**file-scanner keeps 0.82.0's digests.** Its images copy only `container/*.mjs` and `src/limits.mjs`, and neither changed. Its `src/` changed only in words (T48-7, R32 "safe view"), which is in the Worker bundle and not the images. The run's new file-scanner builds (scanner db943e12…, renderer eb7cc699…) are not pinned.

| image | digest | changed | anonymous pull by digest |
|---|---|---|---|
| agent-runner | `ghcr.io/believeinoakland/agent-runner@sha256:03dcdf70efee6f011a425294b80710ef8acdcf0d030541908772fad183f46d1b` | yes (was d7c81712…) | 200 |
| file-scanner-scanner | `ghcr.io/believeinoakland/file-scanner-scanner@sha256:2af812a3bde157731a05a827c035f49e8faf83ad29e6cbbf4ff440844b6e5db8` | no | 200 |
| file-scanner-renderer | `ghcr.io/believeinoakland/file-scanner-renderer@sha256:90385aeddbc05b66882506a0ae6ec48dfb635119bae8c20cfba3c31e4afb974b` | no | 200 |

The agent-runner digest is written into `agent-runner/fleet-member.json` and `wrangler.jsonc`, and its bundle is rebuilt.

`fleetbundles.test.mjs` on the tip: 148 pass, 1 fail, no skip. The one red is K3353's pin of agent-worker's 28 inputs (it now has 36), which is accepted.

## Step 4: module tests (only the modules the cut touches)
| module | result | reds |
|---|---|---|
| plane (with migrate-released and the 0.84.0 row) | 250 pass, 1 fail | `store.test.mjs` R2/R10 step rank: accepted (K3380, N1115; audit-T49-close row "plane store.test R2/R10 step rank") |
| bundler | 101 pass, 1 fail | fleetbundles: K3353's agent-worker input pin, accepted |
| installer | 71 pass, 0 fail | none. The expected `release/`-at-0.84.0 red did not appear |
| agent-runner | 55 pass, 0 fail | none |
| file-scanner | 58 pass, 0 fail, 10 skip | none. The skips are by design: ClamAV `clamscan`/`sigtool` and LibreOffice/Poppler are absent from the session, as at K3199 |
| sheet-worker | 36 pass, 0 fail | none |

I ran agent-runner, bundler and installer again after the digest pin, with the same results. **No red is outside the accepted list.**

## Step 5: assembly dry run
`release-assemble.mjs --version 0.85.0 --dry-run` on 0b26ba795d reports all 7 assets fresh. Both container members carry their `container…json` parts. Then it **refuses `NO_NOTES`** (see the finding above).

| asset | sha256 | bytes |
|---|---|---|
| plane | aa48b8cb6f0b6c2b64d76bde1c3227f1a9a5716af4abac2b346071975913d649 | 21,421,775 |
| agent-runner | 77d9925662aedab8046adc33288f1ee671b828d9dfc92d0c94a8895c165e4621 | 65,644 |
| agent-worker | ce1a9b1f9ddd2c2af5f812fad82eb71efb0ca91137e1d5fa1948bb7e04beaf31 | 320,184 |
| file-scanner | cbbb64e9c8f847b75e7492287202287a7b45ad0ef94f53333148f4acd1f5a972 | 176,556 |
| ocr-worker | da20f40d0c6689e7c37650a677cd8beed442c78a9036138b9d114bda79f6ff44 | 303,361 |
| pdf-worker | 6cc211a9fd5b8c90d194bac06b40e3be962f3fb0d5bb22327d0d2b3fa761e036 | 2,465,783 |
| sheet-worker | 31b70e1d0d9bb9d8eebcdd860af9858e08837ad4365b31047c905707bd173ac6 | 26,160 |

Compared with 0.84.0's assets: ocr-worker, pdf-worker and sheet-worker are unchanged. The plane, agent-runner, agent-worker and file-scanner are new.

## Step 6: signing
**Not dispatched**, because the run would fail on `NO_NOTES` (see the finding). There is no run id.

## Blocked or refused
No act was refused. The only block is `release/notes/0.85.0.json`, which is BOB's to write and commit. After that come the dry run again, the dispatch of `release-sign.yml` (`version: 0.85.0`, on `dist/cut-0.85.0`), and Bob's approval.

Then step 7 (the controls) and step 8 (newgroup: commit `src/release.mjs` together with the bundle). The deploys need Bob's approval (K1715).

Logs are in the scratchpad: `module-tests.log`, `module-tests-tip.log`, `fleetbundles.log`, `dryrun.log`, `bundles.log`, `bundles2.log`.
