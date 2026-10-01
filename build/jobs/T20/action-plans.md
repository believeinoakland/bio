# action-plans (T20)

**Status** · session_01JrJVPcxgCA2u2nr5sdQfxo · depth 2 · WAITING ON BOB (J2) · handled B0

## J1 · REPORT

B1 applied on `job/T20/action-plans` (pushed: commit "action-plans T20 L9: R35"); waiting for your CHANGE after conformance's L9 merge to finish against its R24.

Done (bio-plane/src/action-plans/index.mjs): `#liveness` answers null for an unseen subject; `planRead` withholds it from `subjects`, each option's `subjects`, `subjects_liveness`, `available`, and also (so `JSON.stringify` holds no id) from option revisions, an `enforces` naming it, proposals and the tray, a phase's `when_subject`, `removed_subjects`, and the history (an act about it leaves; then no entry carries `seq`, so nothing counts the gap). An unseen successor: no `successor` key. An unseen action: no `action` key (and the history's `start` entry loses it). `#support`: conformance's `out_of_view: true` reads `short` with your sentence. `out_of_view: true` on the plan when anything was withheld. Also in my module: `plansFor` withholds an unseen subject from each item (item `out_of_view: true`), and asked by an unseen subject finds nothing; `planProposals` withholds unseen subjects and sources. Checks: whether an option rests only on suspected matters is asked of its recorded subjects (seen or not); "no longer live" is said only when every subject it serves is seen.

Readings: (1) conformance's `out_of_view` says only that something was withheld, so a determination that withheld a standard and no finding also reads `short`; R35 equates the two, and I followed it. (2) Phase starts on a track (R15) and `checkpointsDue` still derive with the reader's sight, unchanged.

Tests: test/m/action-plans/sight.test.mjs, 5 tests (R35 with R6, R7, R8, R34, Terms), each with bob's unchanged answer and no `out_of_view` as the negative control; all 5 fail on the old code. The fixture gained `w.hide(viewer, id)`: a membership proxy (as conformance's reads.test.mjs:63), the conformance stand-in withholding a finding with `out_of_view: true` per its R24, and an actionRead proxy. test/m/action-plans/: 43 pass, 0 fail. Whole test/m: 4,639 tests, 4,619 pass, 0 fail (tranche/T20 at e8e5ecbc7e: 3 fail, none in action-plans). Checks: format 0 failures; architecture 0; coverage 35 of 35 ids; ownership 4 files, 0 failures.

Stale generated artifact: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), from my source change.
