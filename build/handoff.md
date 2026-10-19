# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #228 (`session_012ZaXvk32o1oBNUZfgpjcDj`, depth 1, parent ROOT #7, primary account), 2026-10-19 ~23:45 UTC, at ~40% context, with no step half done and **no job running**. **T51 is OPEN** on `tranche/T51`. The completion round and the reds round after it are closed (K4144, K4157); the next act is **the local walk, once** (K4111). Read `build/rulings-active.md` whole, then with the Read tool, whole, K4140–K4158 (the last lines of `build/rulings.md`; `sed -n` them into a scratch file first), then `build/plan/walk-T51-findings.md`.

## Standing

- **Bob is angry, rightly, that work slips** (K3913, K3919, K3921). Nothing leaves T51 except for P19's three reasons; nothing found waits (K3915).
- **Walks (Bob, K4111, K4112):** the local walk (journey-check R1 (a)) runs only when every finding of its last run is closed by a fix whose test exercises the live page's path (K4145: the K4113/K4123 fixes failed that, which cost a run). Its last run (K4145, `walk-T51-run.txt`, 120 failures) is fully traced and closed (groups A–D, journey-check CR-25, K4148). No job runs the walk.
- **Packages before any test run (K4113):** `for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`.
- **Helpers (rebuild in your scratchpad):** `mt.mjs`, a copy of `.github/scripts/module-tests.mjs` that filters modules by argv, passes `--test-force-exit`, and **excludes `journey-check/journey.test.mjs`** (the full run must never run the walk; K4111); `mergejob.sh <module> <K>` (refuse if a lockfile dir lacks `node_modules`; fetch; ff the tranche; ownership against `git merge-base HEAD origin/job/T51/<m>`; `git merge --no-ff`; the module's suite via `mt.mjs`; push only after reading). Never `pkill -f` a pattern your own shell's command line contains.
- **Design merges (K4072):** merge, `node bio-plane/src/setup-words/build.mjs`, `--check`, the reading modules' suites, ACK, `xdone`, ring UX design #33 (`session_01EkYGWQGqSXhiemwre3NyZq`). Channel read through U404, posted through B397.
- **Doorbells:** `run_once_at` the next whole minute. The window: 1,000,000; refresh at 40%.

## State

- Every T51 job is merged and every job session archived (the last six at K4157). `main` has not moved since T50's close (97de901231). The full module run (K4149) found six reds, all fixed (K4150–K4156); doc-clean R4 fails only under the full run's load (passes alone).
- **Accepted reds by name now:** journey-check R1 (a) and the six tests after it until the walk; coverage's standing six (agent-harness R17, agent-runner R36–R38, R40, installer-steps R26, R31, journey-check R19).

## Next, in order

1. Take over (§5.1): archive BOB #228 once idle (BOB-final row under T51); delete WATCH #228 `trig_01L97bLkfdVBJPnyCKpjjEyA` (into ROOT) and arm yours; my backstop `trig_01TM8QhiXMxMjwga5NMX5gCu` fires harmlessly into my archived session.
2. **The local walk, once (K4111):** install packages; `node --test --test-force-exit bio-plane/test/m/journey-check/journey.test.mjs > build/plan/walk-T51-run.txt 2>&1` in the background (about 25 minutes), with its whole output committed. If it reports any failure: group by cause, trace each with a reading worker (sonnet, medium) to code, place each fix in a job whose test draws the real screens (as CR-25 did), and run again only when every group is closed; never re-run to see.
3. **The close (§5.7):** the full module run with `mt.mjs` (walk excluded; doc-clean alone if it fails under load); `main` into the tranche only if it moved; archive the plan (`archive/T51.md`, Status `CLOSING`, outcomes and measured usage); the PR from `tranche/T51` to `main` merged with the GitHub merge tool (method `merge`); delete backstop and WATCH; report T51 to Bob (elapsed, work finished, deferred with reasons, work left, cost) and ask his meter.
4. Then the release cut with the images recorded (plan's "BOB's acts"), deploys (Bob approves each deploy act in its refused session), and the live walk by K4112's method; open T52 at once (§5.2, P18).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by the tranche's close PR (§5.7 (3), K2273) and the design PR at the close on its MERGE (K1177); no refusal recorded.
- Never force-push. Job branches are fast-forwarded with plain pushes only (K3969).
- Deploys to biosmoke8 and the `civicos` Worker's removal: Bob's one-line approval in the refused session each time (rulings-active §2).

## Open with Bob

- None.
