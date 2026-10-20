# Release 0.86.0: cut and checks (release-cut worker for BOB), 2026-10-20

Steps 0, 1, 2 and 5 of draft-T46-trial.md §4, in 0.85.0's form. Nothing was pushed, dispatched, deployed or tagged. /home/user/bio was not touched. Worktree: /tmp/claude-0/-home-user-bio/f96faa5e-b0cf-50ec-b4f0-6031a1fa0079/scratchpad/cut on dist/cut-0.86.0, cut from origin/tranche/T51 @ b8ba7e7b43.

## Step 0
- wrangler whoami: one account, 20b533579290b9b93168345edd3b7f72.
- npm ci --ignore-scripts in agent-runner, bio-plane, bio-plane/src/journey-check, file-scanner, newgroup, ocr-worker, pdf-worker, sheet-worker, site: all exit 0. agent-worker has no lockfile.
- GitHub environment "release": NOT READABLE from the session (the proxy answers 403 for repos/.../environments and secrets). 0.85.0 was signed by release-sign run 38772108995, so it existed then; Bob's click on the run will show it.

## Step 1: rollback targets (read-only, version at 100%)
| worker | deployment | version | created |
|---|---|---|---|
| biosmoke8 (plane) | 4fed1d3b-5d12-47db-8270-b6d77de79ed4 | 8970df60-afb6-4c20-b9f7-38d81d03793b | 2026-10-16 18:42 |
| agent-worker | 8831f433-9732-40d3-b16d-feec01df9287 | 7fcfd982-a37f-4643-99c6-fc67ea9d90e6 | 2026-10-16 18:42 |
| agent-runner | 3925fc3d-7806-4633-8f83-8a5fdddbef53 | 8fc20b15-dbac-47e6-94fe-a31132b3dda0 | 2026-10-16 19:34 |
| pdf-worker | a04e68c7-91e0-463a-ac65-eca77a40670f | 6bb80c56-998f-4109-8541-fd7fcb3c17e0 | 2026-10-15 21:25 |
| ocr-worker | 34bb4017-059f-4eb8-b796-effd28ce6c31 | 47c7c6c9-9ff6-4c0a-a26c-a2a88e3b9c3e | 2026-10-15 21:25 |
| sheet-worker | f7930629-6272-40f4-a279-3f77d5d9548c | 7a60b1cb-94dd-4030-af35-aa2cfd22fb9b | 2026-10-15 21:26 |
| file-scanner | 9bedf903-33bc-464c-aff9-bf593fcd4742 | 5f6cd998-4312-474f-8646-d7ad1031f833 | 2026-10-15 21:29 |
| newgroup (installer) | c69a39bb-c01f-4aee-8d4d-613a5be47baa | 320282bd-e390-471c-b5a1-96f90fd35b70 | 2026-10-15 20:47 |

No worker named civicos exists on the account any more (code 10007): the old UI worker is gone, so there is no UI-worker rollback and no UI deploy step (T51 retired civicos-ui).

## Step 2: the cut (one local commit, not pushed)
- **2ed10afbf1** "0.86.0: the version cut": 14 version sites and 4 lockfiles (agent-runner, bio-plane, file-scanner, sheet-worker) at 0.86.0 (resolve-version: "every site agrees"); migrate-released.test.mjs RELEASES gains ["0.85.0", "1053faa726f56a1e322ff64ad9243eb0adab6e90"]; bundles rebuilt.
- RELEASES row choice: dist/cut-0.85.0's signed cut with the installer embed (1053faa726), the same rule as 0.84.0's row (K3235). origin/dist/cut-0.85.0's tip is b29f55bb22, but it is a fast-forward of tranche/R085 with later work; release/ is identical at both (the last commit touching release/ is d530192fe5, the signing run, before 1053faa726). Change the row to the tip only if BOB prefers; the test reads release/ from it either way.
- K1540's order: member-roster order.mjs, court-data, setup-words rows, wizard-scripts data, site pages and the invitation page all fresh (--check); program.mjs rebuilt byte-identical (sha 853c172a..., 85 inputs, no diff); bundles.mjs rebuilt agent-runner, bio-plane, file-scanner, sheet-worker: artifacts byte-identical, only manifests moved. newgroup/dist waits for the signature (step 8); newgroup-bundle-fresh is green now (4 passed).
- fleetbundles.test.mjs: 151 pass, 0 fail, no skip.

## The image path (read from .github/workflows/container-images.yml, bundles.mjs, fleet-bundle.mjs)
- Only workflow: container-images.yml. Triggers: (a) a push to any branch dist/cut-* that touches agent-runner/Dockerfile|package.json|package-lock.json|src/**, file-scanner/Dockerfile.*|package*.json|packages-*.json|container/**|src/**, or the workflow file; (b) workflow_dispatch (any ref; the tranche/T51 run 39084912830 was one, which is why Docker Hub's only tags today are 0.85.0 at digests 954ac088..., 38d314ed..., 27941d2a...).
- It builds three images (agent-runner, file-scanner-scanner, file-scanner-renderer; linux/amd64, provenance off), tagging each with the member's package.json version (0.86.0) on ghcr.io/believeinoakland/<name> AND docker.io/civicsmith/<name>, and prints each digest in the step summary. It does NOT call --containers or --record-image; recording is BOB's act (current.md "Each image recorded").
- My commit changes agent-runner/ and file-scanner/ package.json and lockfiles, so **pushing dist/cut-0.86.0 starts the build** (about 2 minutes last time). Needs secrets DOCKERHUB_USERNAME and DOCKERHUB_TOKEN (used successfully on 2026-10-18).
- After it: read the three digests from Docker Hub's public tags (hub.docker.com/v2/repositories/civicsmith/<image>/tags, tag 0.86.0; readable from the session, checked) or the run summary; run `node bio-plane/scripts/bundles.mjs --record-image agent-runner AgentRunner sha256:...`, then `file-scanner FileScanner` (scanner image) and `file-scanner SafeViewRenderer` (renderer image); verify `--containers` reports 3 of 3 current; rebuild bundles (`bundles.mjs`), commit markers, wrangler.jsonc, bundles on the cut. Do the record commit as a push that touches only those files (the hashed sources do not change, so no rebuild is owed). Today `--containers` reports all three UNRECORDED (no source_sha256 recorded), so even unchanged 0.85.0 digests cannot be kept: the first record is required. Anonymous pull by digest is to be checked as for 0.85.0.
- The release/file-scanner/container/*.json parts still name ghcr.io: they are re-cut by release-assemble at the real assembly (current.md "The release cut").

## Step 4: module tests (node --test --test-force-exit, in the worktree, after the cut)
| module | result | reds |
|---|---|---|
| plane (m/plane + migrate-released, with the 0.85.0 row) | 267 pass, 0 fail | none |
| bundler (m/bundler, bundle, deploybindings, fleetbundles, resolveversion) | 132 pass, 0 fail | none (K3353's agent-worker pin red of 0.85.0 no longer appears) |
| installer (newgroup/test + newgroup-bundle-fresh) | 196 pass, 0 fail, 5 todo | none; it did not hang this time |
| agent-runner | 59 pass, 0 fail, 11 skipped | none (skips: no Docker/binary in the session) |
| file-scanner | 68 pass, 0 fail, 10 skipped | none (skips by design: ClamAV, LibreOffice/Poppler absent, as before) |
| sheet-worker | 37 pass, 0 fail | none |
No red at all. journey.test.mjs was not run. Logs: /tmp/claude-0/-home-user-bio/f96faa5e-b0cf-50ec-b4f0-6031a1fa0079/scratchpad/test-*.log.

## Step 5: the dry run
`node bio-plane/scripts/release-assemble.mjs --version 0.86.0 --dry-run` on 2ed10afbf1 **refuses [CONTAINER_IMAGE_STALE]**: agent-runner's AgentRunner image block records no source_sha256 (the check comes before the notes check, so NO_NOTES is not yet reached). Expected until the three digests are recorded. It will then likely refuse NO_NOTES until release/notes/0.86.0.json is committed.

## Release notes draft (not committed)
/tmp/claude-0/-home-user-bio/f96faa5e-b0cf-50ec-b4f0-6031a1fa0079/scratchpad/notes-0.86.0.DRAFT.json: date 2026-10-20, security false, must_do empty. Members and administrators texts come from T51's aim (new design everywhere, old interface retired, "team", American dates and 12-hour clock, both container images published where every install fetches them). It uses "team" only, no "group". `signatures.releaseNoticeStatement` accepts it (869 bytes). Its claims need BOB's check, especially that the unassisted journeys work: the live walk has not happened (K4162), so the sentence "work through an investigation and act on what you find" is the aim, not a measured result. Date: set it to the signing day.

## Remaining acts, in order
1. S: push dist/cut-0.86.0 (no tag). Starts container-images. (Approval in session if rulings §16 requires one for a push to dist/*.)
2. S: read the three 0.86.0 digests; `--record-image` x3; `--containers` shows 3 of 3 current; `bundles.mjs`; commit and push (no rebuild owed). Check anonymous pulls.
3. S (BOB): review and commit release/notes/0.86.0.json; push; re-run `release-assemble.mjs --version 0.86.0 --dry-run` (expect it to pass with 7 assets).
4. S: dispatch regression.yml on the cut's tip if wanted (runbook step 4); triage reds.
5. S dispatch, Bob-GitHub approval: release-sign.yml (version 0.86.0, on dist/cut-0.86.0): Bob clicks approve on the run (environment "release").
6. S: pull the signed release/ commit.
7. Bob (approval in session): the ssh-keygen -Y verify controls over the signed plane and fleet payload.
8. S: newgroup `npm run build` (embeds the signed 0.86.0), `npm test`; commit src/release.mjs with the bundle; confirm container members named as in R38.
9. S: push the cut.
10. Bob (approval in session): deploys to biosmoke8 in order: agent-runner, file-scanner, agent-worker, pdf/ocr/sheet-workers, the plane (deploy.mjs biosmoke8 0.86.0). Nothing for civicos (gone). Installer deploy per BOB's decision.
11. S (Bob approves the credential): live verification (/version per member, bootstrap, headline ops, scan).
12. S: one ruling recording version, hashes, digests, rollback targets, controls, checks.
