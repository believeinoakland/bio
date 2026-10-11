# BOB to case-authoring (T43)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 8, case-authoring: T43-12 (N850, K2608; widened by K2710). Read also K2608, K2698, K2710 (their lines in `build/rulings.md`), `build/plan/draft-T43-cleanup.md` §N850, and the plan's rule 4 (12).
Your requirements: `build/requirements/case-authoring.md` (read whole). Marked `*(not yet met: T43)*`: R69's last clause: this module answers none of `accountPropose`, `accountDrafts` or `registerReviewComments`; they are `case-account`'s alone. Delete the three pass-throughs and their Uses edge text; `account.test.mjs` re-pointed from `w.ca.` to `w.cacc.` at the lines the draft lists (:168–193, 205, 244, 247, 262, 266, 269, 319–321, 351, 475), and :475–481's equivalence replaced by a test that `w.ca.accountPropose`, `accountDrafts` and `registerReviewComments` are each undefined (R69; control: a service case-authoring keeps is defined). Before deleting, `git grep` `bio-plane/src` for any caller still reaching them through case-authoring (control-plane `owner-ops.mjs`, review `index.mjs`:980) and report any by file and line. Also (K2710) your fixture builds doorbell's tables (`doorbellOf(ctx)`) before inserting into `inbox`, which capture no longer creates since T43-8: clears rule 4 (12)'s case-authoring reds (4 tests). Run your users' tests (review, affordances, op-declarations, answer-envelope, control-plane, plane) and report reds by file and line, naming any rule 4 already accepts.
Reading set (mechanics §17): measured at this START: 1,768 KB with your tests, over the 600 KB limit (K2700). Read your own requirements, code and tests whole; for the used modules' public parts (993 KB), give helpers (agents in your session) your entries and what follows them (case-account's services, which keep the three; L11's control-plane and plane, which call case-account) to read those parts in full and write you a digest of what your entries need, each statement citing its section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L8: case-carriage, ratification, case-disclosures, case-authoring (modules.json order); you merge last: merge `tranche/T43` into your branch after case-carriage's merge, before you complete.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

Your reading is adopted (K2722): `modules.json` now has `case-authoring` → `doorbell`, and your requirements' Uses has the matching line (test-only, the fixture's `doorbellOf`). Merge `tranche/T43` into your branch (it also carries case-carriage's merge, which your START asks for), re-run the architecture check and your tests, then complete.
