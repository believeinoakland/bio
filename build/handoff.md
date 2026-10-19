# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #226 (`session_01W1R9rKhazY6BWGbev9yHgz`, depth 1, parent ROOT #7, primary account), 2026-10-19 ~17:45 UTC, at ~39% context, with no step half done. **T51 is OPEN** on `tranche/T51`; **L11: every job merged; its close begun (artifacts regenerated, checks run); two jobs re-opened by the local walk.** Read `build/rulings-active.md` whole, then with the Read tool, whole, K4100–K4106 (the last lines of `build/rulings.md`; `sed -n` the line numbers into a scratch file first, the file is too large for one Read), then the plan's "Completion round" (CR-5, CR-12, CR-14 to CR-19) and "BOB's acts" in `build/plan/current.md`.

## Standing

- **Bob is angry, rightly, that work slips** (K3913, K3919, K3921). Nothing leaves T51 except for P19's three reasons.
- **Words:** setup-words R13 binds every sentence a member reads; tests never copy one (K3810); a slug or id drawn as text is a defect; a jurisdiction profile's values and any value read from the record are data (K4086).
- **Design merges mid-layer (K4072):** merge, `node bio-plane/src/setup-words/build.mjs`, `--check`, CHANGE each job that reads the rows (quoted verbatim), ACK, `xdone`, ring UX design #33 (`session_01EkYGWQGqSXhiemwre3NyZq`). Channel read through U399, posted through B387. Nothing open with the lane.
- **Merging:** scratchpad helpers are gone with my container; rebuild them: `mt.mjs` (a copy of `.github/scripts/module-tests.mjs` filtering modules by argv and passing `--test-force-exit`) and `mergejob.sh <module> <K>` (fetch the job and tranche branches, ownership against `git merge-base HEAD origin/job/T51/<m>`, `git merge --no-ff`, the module's suite; push after). **Never wait on a background merge with `pgrep -f mergejob.sh` from a command line that itself names mergejob.sh**: it waits on itself (I lost 20 minutes to it). Plane's suite takes ~18 minutes, journey-check's ~22.
- **Doorbells:** `run_once_at` the next whole minute.
- **The window:** 1,000,000. Refresh at 40%.

## L11 state

- **Merged:** all 37 L11 modules (`legacy-ui` retired and its row removed, K4100). Every `job/T51/<L11>` branch is an ancestor of the tranche.
- **Re-opened by CHANGE (merge again when COMPLETE):** screens-inquiry (B12: `document` draws no `screen.document.passages.head` on the walked document, journey-check `investigation.mjs`:178; `dash-project` draws "Nothing is here" from Home's door); journey-check (B4: R27 counts no profile value or vendor name; the fixture text at `investigation.mjs`:422; which `setup` strings remain and whose).
- **Accepted reds by name:** journey-check R1 (a) and the six tests after it until both merge again (then re-run R1 (a) alone: `node --test --test-force-exit --test-name-pattern="R1 \(a\)" bio-plane/test/m/journey-check/journey.test.mjs`, ~14 minutes; group its findings by `detail`); the `setup` scanner catalogue labels until CR-17; coverage's six (K4105); words' instance-setup 12 (CR-12) and promotion 3 (CR-5).
- **Done at the close so far (K4105):** step 1, artifacts regenerated and committed (fleetbundles, newgroup-bundle-fresh green; plane bundle 28.04 MiB); step 2, `checks/run.mjs` read. **Left:** after the two merges, re-run R1 (a) and the touched suites, regenerate `rows.mjs` (and any bundle a merge stales; `node bio-plane/scripts/bundles.mjs` rebuilds only stale ones), `checks/run.mjs` again; step 3, archive L11's job sessions with their rows (§5.6 (3), `archive_session`'s usage and each record's `Size` line into `build/metrics/T51.csv`); step 4, the completion round.
- **BOB's wording edits still owed (rule 7):** answer-envelope R6, notice-producers R25, rule 7's list (requirement text naming the old interface); screens-daily's requirement naming the retired `queue.answered.photos`/`.granted`.

## The completion round (§5.7 (0); K4104's order)

CR-18 extraction (R77, `bytes` on `reading`), CR-16 credentials then CR-12 instance-setup, CR-14 setup-words, CR-15 bundler, CR-17 file-scanner, then CR-5 promotion (with R59 `capture_sha`, the row-census stamp), then CR-19 screens-inquiry last (R81, R82). Each its START, its model as the entry names, a provider merged before its users. Then the tranche's checks and words read zero, then the close (§5.7).

## Timers

My backstop (`send_later`, next ~17:46) and WATCH #226 `trig_01Jswe84piGx9zKKunVpAXdb` (into ROOT, 18:25): delete the WATCH at takeover; my backstop fires harmlessly into my archived session.

## What comes next, in order

1. Take over (§5.1): archive BOB #226 once idle (BOB-final row under T51); WATCH and backstop.
2. Read screens-inquiry's and journey-check's entries; merge each when COMPLETE; finish L11's close as above.
3. The completion round, then the close (§5.7): the release cut with the images recorded (BOB's acts), deploys (Bob approves each deploy act in session), BOB's live walk, fix rounds, the PR to `main`.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by the tranche's close PR (§5.7 (3), K2273) and the design PR at the close on its MERGE (K1177); no refusal recorded.
- Never force-push. Job branches are fast-forwarded with plain pushes only (K3969).
- `git rm` in a job session: auto mode refuses it even for standing-list paths (K4070): Bob's approval in that session each time (§16).
- Deploys to biosmoke8 and the `civicos` Worker's removal: Bob's one-line approval in the refused session each time (rulings-active §2).

## Open with Bob

- None. (Bob removed `.claude/settings.json`:15 himself, K4102.)
