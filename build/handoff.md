# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #227 (`session_01XwbD48uLSyn42Cb57tMXvq`, depth 1, parent ROOT #7, primary account), 2026-10-19 ~20:10 UTC, at ~43% context, with no step half done. **T51 is OPEN** on `tranche/T51`; **L11 is closed (K4113); the completion round runs (K4114 on).** Read `build/rulings-active.md` whole (new this session: "A walk is run only when it can pass", K4111, K4112, and the package-install rule, K4113, in §4), then with the Read tool, whole, K4107–K4137 (the last lines of `build/rulings.md`; `sed -n` the line numbers into a scratch file first, the file is too large for one Read), then `build/plan/walk-T51-findings.md` and the plan's "Completion round" (CR-5, CR-12, CR-14 to CR-24) in `build/plan/current.md`.

## Standing

- **Bob is angry, rightly, that work slips** (K3913, K3919, K3921). Nothing leaves T51 except for P19's three reasons; nothing found in the round waits (K3915; K4132 corrected my own slip).
- **Walks (Bob, K4111, K4112):** the local walk (journey-check R1 (a)) runs **once**, after the round's last merge, only when every row of `walk-T51-findings.md` is closed and every change since is covered by a test; its whole output saved to `build/plan/walk-T51-run.txt`, grouped by screen and `detail`. No job runs it. The live walk of the release: everything checkable locally first, a smoke, one complete pass to `build/plan/walk-T51-live.md`, defects fixed by cause with failing tests first, all in one round, a targeted re-walk, then one final pass.
- **Packages before any test run (Bob, K4113):** `for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`. A suite failing for a missing package is the container, not the code.
- **Merging:** scratchpad helpers are gone with my container; rebuild them: `mt.mjs` (a copy of `.github/scripts/module-tests.mjs` filtering modules by argv and passing `--test-force-exit`) and `mergejob.sh <module> <K>` (refuse if any lockfile dir lacks `node_modules`; fetch the job and tranche branches; ownership against `git merge-base HEAD origin/job/T51/<m>`; `git merge --no-ff`; the module's suite; push after). A red `fleetbundles` or `newgroup-bundle-fresh` after a merge is staleness: `node bio-plane/scripts/bundles.mjs`, then re-run.
- **Design merges mid-round (K4072):** merge, `node bio-plane/src/setup-words/build.mjs`, `--check`, CHANGE each job that reads the rows, ACK, `xdone`, ring UX design #33 (`session_01EkYGWQGqSXhiemwre3NyZq`). Channel read through U402, posted through B393.
- **Doorbells:** `run_once_at` the next whole minute (`date -u -d '+1 minute' +%Y-%m-%dT%H:%M:00Z`).
- **The window:** 1,000,000. Refresh at 40%.

## The completion round: state

- **Merged:** extraction (CR-18, R77, R78), credentials (CR-16, R80), setup-words (CR-14, R19), bundler (CR-15), file-scanner (CR-17, R33, `EICAR_FOUND`), promotion (CR-5, R59, stamp 1.79.0), instance-setup (CR-12, R98), screens-inquiry (CR-19, R81–R83), installer-steps (CR-22, R37, and the empty export, K4132), installer (CR-23, R81), file-safety (CR-21), screens-settings (CR-20, R62).
- **Running:** PLANE #42 `session_011vKkDz3Fp8T8FuWAfs336Z` (CR-24, R67: `ask.mjs`:369 reads `readingLanguage` from `translations`; `door.test.mjs`:142's count 36; its suite ~18 min). When it merges: CHANGE instance-setup (INSTANCE-SETUP #26 `session_014RUYYmkPmsWz2WmzcUC1Mk`, still live) for **R99** (the last delegate `readingLanguage` and `#translations()` go), then merge it.
- **screens-settings re-opened (K4139):** the design's answer to B391 (DEC-371 @ 33e205c0de) is merged; SCREENS-SETTINGS #8 `session_01K19GNa6yQamxgFprY4YSqT` adds four `screen.members.*` keys it already draws to `keys.mjs` (CHANGE B11); merge it when COMPLETE, R39 then green.
- **Accepted reds by name now:** screens-settings R39 (`contract.test.mjs`:71) until its B11 merge; plane `door.test.mjs`:142 until CR-24; journey-check R1 (a) and the six after it until the walk; `newgroup-bundle-fresh` until the round's regeneration; coverage's standing six (agent-harness R17, agent-runner R36–R38, R40, journey-check R19, installer-steps R26, R31) plus plane R67 and instance-setup R99 until met.

## Next, in order

1. Take over (§5.1): archive BOB #227 once idle (BOB-final row under T51); delete WATCH #227 `trig_01E1HsSYDFg51hJNnRsKt1bR` (into ROOT, 20:55) and arm yours; my backstop fires harmlessly into my archived session.
2. Merge plane (CR-24), then instance-setup's R99; merge screens-settings (B11).
3. **Close the round as a layer (§5.6):** regenerate every artifact in the manifest's order (`order.mjs` `--check`, `program.mjs`, `court-data.mjs`, `rows.mjs`, wizard-scripts' data, `pages.mjs`, `bundles.mjs`, the invitation page, `newgroup` with `npm run build` there, which also re-embeds `newgroup/src/release.mjs`); `fleetbundles` and `newgroup-bundle-fresh` green, no skip; plane bundle under 32 MiB; `checks/run.mjs`: words **0** and coverage only the standing six (§5.7 (0)); archive the round's job sessions with their rows (the plan's `Jobs` line has each id; `Size` lines from each record).
4. **The local walk, once (K4111):** confirm every row of `walk-T51-findings.md` closed (all are, but for the changes after K4123 already covered by their jobs' tests); install packages (K4113); run `node --test --test-force-exit bio-plane/test/m/journey-check/journey.test.mjs` in the background with its whole output to `build/plan/walk-T51-run.txt`; group failures by `detail`; any failure is traced from the file, fixed by its module's job with a test, never by another run to see.
5. The close (§5.7): `main` into the tranche if it moved; the full module run (`module-tests.mjs`, K2704); archive the plan; the PR to `main` with the GitHub merge tool; then the release cut with the images recorded (plan's BOB's acts), deploys (Bob approves each deploy act in its refused session), and the live walk by K4112's method.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by the tranche's close PR (§5.7 (3), K2273) and the design PR at the close on its MERGE (K1177); no refusal recorded.
- Never force-push. Job branches are fast-forwarded with plain pushes only (K3969).
- `git rm` in a job session: auto mode refuses it even for standing-list paths (K4070): Bob's approval in that session each time (§16).
- Deploys to biosmoke8 and the `civicos` Worker's removal: Bob's one-line approval in the refused session each time (rulings-active §2).

## Open with Bob

- None.
