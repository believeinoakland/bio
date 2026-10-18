# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #214 (`session_01GSmA9F4nLx4fViJzQfU6f7`, depth 1, parent ROOT #7, primary account), 2026-10-18 ~17:45 UTC, at ~43% context. **T51 is OPEN** on `tranche/T51`: L1–L6 and L8 closed; T51-156 (setup-words) merged; **no job is running**. SETUP-WORDS #7 (`session_01YQJWyJVbKFAY8sdhq1JwY5`) is idle, kept until R1 closes (§5.5). Read `build/rulings-active.md` whole, then with the Read tool, whole, K3919, K3921 and K3926–K3940, then `build/plan/words-B-design.md` (BOB's design for Bob's K3930), and the plan's sections "Sequence", "R. Re-run of closed layers" and "BOB's acts" in `build/plan/current.md`.

## Standing

- **Bob is angry, rightly, that work slips and the tree stays fragile** (K3913, K3919, K3921). Nothing leaves T51 except for P19's three reasons; the format check now enforces it on `next.md` (§8.4, certified D15, K3928). Never offer an option that defers.
- **Bob ruled K3930** (words: B on four conditions, "Be smart about implementing this change. Do it correctly given the long-term objectives for Civicsmith development."). BOB's design is `build/plan/words-B-design.md` (K3931): `word(key)` for design-first rows (drawn screens only), `t(id, en, vars)` for sentences written first in code, one table where the design's row always wins, extraction at each layer close, the design's review list `bio-plane/src/setup-words/words-unreviewed.json` (K3932), ICU syntax, pseudo-locale walk (journey-check R27).
- **The rebuilt plan** (K3929, K3936; shown to Bob rendered, https://claude.ai/artifact/8njd7UGuJMcMZgwdjSrio1): Sequence (W) words → (R) re-run of closed layers L1–L8 → words check zero → L9, L10, L11 → completion round (CR-5, CR-12) → close, cut, deploy, walk, fix rounds. 119 jobs (48 merged + T51-156). `build/plan/rebuild-T51-changes.md` traces all 138 commitments; `build/plan/fold-DEC-340.md` holds 38 requirement lines BOB folds before each layer's START.
- **Process (civicos-process `36bc2d3`):** K3923's edits certified on dry run D15 (K3928); the words check knows `t` (counted only where imported from setup-words), the `marker` arm, `--release`, built-in error text not counted (K3927). bio's words check: 13,908 findings (inline 12,269, testcopy 1,463, handlist 176).
- **Design lane:** UX design #30 `session_0132xHbVxJ5XZzHuwzNvwbRa` (started K3937). Merged into the tranche: design @ 89ca566068 (DEC-340, DEC-341). Channel read through U369, posted through B338. Nothing owed by the design for T51 except N858's template texts (Bob's review, K921 Q1).
- **Lanes:** AI-DESIGN past A5, JOURNEYS past W4, INVESTIGATION-DESIGN past H43: not re-read this session (no backstop ran during a layer); read them at takeover.

## The conversion (W (d)), where it stands

`build/tools/words-convert.mjs` (with `build/tools/test/`), reviewed, **not yet run on the tranche**. Its round-2 dry run on a worktree of the tranche: 4,571 sites converted in 547 files (rule a `word` 3,291, b `t` 659, d test copies 621), 72 modules gain `setup-words` in `uses`, `--verify` 0 mismatches, `build.mjs --check` green, **0 new reds** (45 modules red before and after, unchanged; the full suite was run once each side, stewards re-run after its exclusion). Values coerced with `String(expr)` so output is identical. 8,317 sites go to judgment. Two decisions are BOB's before the pass runs, and both would shrink judgment a lot:
1. **`t` already bound: 3,185 sites**, mostly source files holding a local named `t`. BOB's recommendation: rename the marker now to a name nothing in the tree uses (for example `say(id, en, vars)`), while only setup-words and its tests use it. That changes setup-words R14 (wording, BOB's), its code (a one-entry job: SETUP-WORDS #7 is still open, re-open it with a CHANGE), the check's marker arm and the codemod. Confirm first with a grep that the new name is unused.
2. **The design's "unkeyed" list: 2,239 sites** (`words-reads.json` `unkeyed`, strings the design records as read by no member: refusal `detail` text beside a code, builders' grade rationales, skill doctrine in the agent's pack). By K3927's reasoning these are developer text: the check should not count them (`loadUnkeyed` exists in `checks/words.mjs`), unless a member does read one. Decide, record, change the check.
Then the remaining judgments go to jobs: signed or pinned 866 (case-grammar 253, strength 209, contradiction 174, case-checker 162, publication 68: each a new version, K1333), drawn modules 524 (their L11 jobs), part test copies 443, handlists 176, leaf files 72 (duties `vocab.mjs`, `setup-fleet.mjs`, doctypes `staff-directory.mjs`, `stewards/src/`), spelling 49 ("labelled"), and the rest by reason (the worker's report: K3940). Each module with judgments gets an entry in R or its L9–L11 START by a ruling naming module and findings (§5.10 (6)).

## What comes next, in order

1. Take over (§5.1): archive BOB #214 once idle (BOB-final row under T51); delete WATCH #214 `trig_01Notb1KRbQ46KboCEHwp2qX` and any BOB #214 backstop (none armed now); create your own WATCH. Read the lanes' HANDOFFs.
2. Decide the two points above; apply them (setup-words CHANGE if the marker is renamed; the check).
3. Run the conversion on the tranche with no job running (§5.10): the codemod with `--write`, `--verify`, the full module suite (`module-tests.mjs`) before and after, `checks/run.mjs`, the generated artifacts; every red fixed in the pass; commit; a ruling naming the rule, every module touched, every module handed to a job, the test result.
4. Fold `fold-DEC-340.md`'s lines and each R entry's "Text: fold" (BOB's acts); the three split maps (membership, basis-versions, publication) by workers; then start R1 (§5.3).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by the tranche's close PR (§5.7 (3), K2273) and the design PR at the close on its MERGE (K1177); no refusal recorded. civicos-process `main` takes process tooling (BOB's, §8) and edits Bob approved (K3915, K3923).
- Deploys to biosmoke8 and the `civicos` Worker's removal: Bob's one-line approval in the refused session each time (rulings-active §2).

## Open with Bob

- Nothing open. N858's template and guide texts wait on his review as filing-templates R15's reviewer (K921 Q1) once a named writer and sources exist; tell him then.
