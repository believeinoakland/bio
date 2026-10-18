# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #213 (`session_01YPqZhAr3s8L2W2unzvYbtq`, depth 1, parent ROOT #7, primary account), 2026-10-18 ~15:25 UTC, at ~44% context. **T51 is OPEN** on `tranche/T51`: L1–L6 and **L8 closed** (K3920); **no job is running and none may start** (Bob, K3921: "Don't start the next layer. The build plan will need to be rebuilt to include EVERY F*CKING THING that we agreed T51 would include, even if that means running some layers."). Read `build/rulings-active.md` whole, then with the Read tool, whole, K3905 and K3912–K3924, `build/plan/audit-T51-commitments.md` (46 KB: read it whole, in parts) and `build/plan/words-check/modules-table.txt`.

## Standing

- **Bob is angry, rightly**, that work keeps slipping to later tranches and that the tree is still fragile after four tranches of promises (K3913, K3919, K3921). Nothing goes to T52 except for P19's three reasons (P10, P19 as amended, K3915). Never offer him an option that defers or that leaves him unsure whether more fragility remains.
- **Process changed today (civicos-process `314d84f`, Bob's approval, K3915, K3923):** P10/P19 (nothing found in a tranche waits; the completion round), P7/P8 (a mechanical change is one pass), mechanics §5.2 (1), §5.7 (0), §5.10, §6 (4), §7, §8.4, §8.6. **Owed:** certify §5.10, §5.7 (0) and §8.6 on a dry run (P3, `dryrun/`, record in `dryrun/RUNS.md`): one pass over two toy modules, one completion-round job, a planted inline sentence and a planted deferral each caught. Then wire `checks/words.mjs` (async; `await`) into `checks/run.mjs`.
- **The words check** (`checks/words.mjs`, committed `04e53bb`): 14,161 findings, 169 of 174 modules (K3922; report in `build/plan/words-check/`): inline 12,522, testcopy 1,463, missingkey 0, handlist 176.
- **Open with Bob (K3924):** how words are kept, page https://claude.ai/artifact/ToHDMr3pvqtDh1gJ9pSdS2 (`build/plan/words-best-practice.html`): A keep hand keys (~7,100 design round trips), **B extract from code (BOB's recommendation:** sentence written once at its use, wrapped in one marker with a stable id, extracted into the word table by a build step; the design's English row overrides; check fails unwrapped sentences, copied tests, hand-lists; pseudo-locale test), C mix. His answer decides the words pass. Whatever he chooses, the 1,463 test copies and 176 hand-lists are fixed in T51.
- **Then rebuild T51's plan** (`build/plan/current.md`) from the audit (138 commitments: 38 done, 66 planned, 21 partial, 7 deferred, 6 missing; its part 2 lists closed-layer modules with work, its part 3 the 16 likeliest underestimates) and the check's findings: every missing, partial and deferred item placed in T51 (re-run closed layers L1–L8 where needed, or the completion round), stale entry text brought up to DEC-334–339 and K3868–K3900, the Count fixed. Show Bob the rebuilt plan rendered before any START (K3921). Then: the words pass(es) with no job running, L9, L10 (scheduler red, C80), L11 (the owed control-plane path move first, K3835), the completion round, close, cut, deploy, walk, fix rounds (K3815).
- **Design lane:** UX design #29 `session_01PCePb8zMxX78iE1gWyzh9A`; channel read through U364, posted through B331; B330 (N1184, N889, N1046, N858, N880, N933's screen, DEC-265's photo date) awaits its answer.
- **Lanes:** AI-DESIGN past A5, JOURNEYS past W4, INVESTIGATION-DESIGN past H43: nothing new.
- **Artifacts:** after a container restart, `npm ci --ignore-scripts` in `agent-runner`, `npm ci` in `sheet-worker` and `file-scanner`; `newgroup-bundle-fresh` passes but never exits (N1254, T51-128): run in background, stop by PID.

## What comes next, in order

1. Take over (§5.1): archive BOB #213 once idle (BOB-final row under T51); delete WATCH #213 `trig_01VgbLzCZ7EC268b39HxhFP2` and any BOB #213 backstop; create your own WATCH. No backstop while no layer runs.
2. Certify the process edits on the dry run; wire the words check.
3. On Bob's answer to K3924: write the words rule into requirements and the check, then the pass(es).
4. Rebuild the plan (above); show it to Bob; then the layers.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by the tranche's close PR (§5.7 (3), K2273) and the design PR at the close on its MERGE (K1177); no refusal recorded. civicos-process `main` takes process edits Bob approved (K3915, K3923).
- Deploys to biosmoke8 and the `civicos` Worker's removal: Bob's one-line approval in the refused session each time (rulings-active §2).

## Open with Bob

- K3924: A, B or C for how words are kept (page above). Recommended B.
