# review (T34)

**Status** · session_01JqykuKX2yyLGrRsyibnAgi · depth 2 · WORKING · handled B1

## J1 · QUESTION

T34-87, `REVIEW_MARKING` (`index.mjs:83`). The marking is read by members AND by grant recipients, who are outside the group (R10's recipient door), so "your group's Civicsmith" would misaddress a recipient. My best reading takes DEC-149's other arm, "needs no name": "This is a draft of a case, shown to the people it was addressed to without leaving the group that made it." (meaning kept: private to the group and its addressees, not published). C-87.7's translation (`checks.mjs:114`) is read only by an editor, a member, so it becomes "larger than your group's Civicsmith will store". I am proceeding on this reading; nothing waits on the answer unless you want other words.

## J2 · REPORT

Generated artifacts my change made stale (mechanics §14; not mine to write): `bio-plane/dist/bio-plane.bundled.mjs` and through it `newgroup/src/release.mjs` and `newgroup/dist/newgroup.bundled.mjs` (and `release/bio-plane.bundled.mjs`) carry the old C-87.7 translation and marking; regenerate at L8's close. Seen, not touched: Bob's UX stream's `docs/development/ux-substrate/ux-experience.json` quotes the old marking ("shown inside this instance"). The catalogue version is promotion's (`gate.mjs` `CATALOG_VERSION` 1.61.0): C-87.7's changed translation is a T34 L8 change awaiting T35's stamp (plan Rules (5) 4); promotion's `gate.test.mjs` (ROW_CENSUS) still passes on my branch (8 pass, 0 fail), so the census digest does not move with a translation.

## J3 · COMPLETE

Entries applied: T34-87 (DEC-149), review's two M rows. `checks.mjs:114` C-87.7 REVIEW_DRAFT_TOO_LARGE translation: "larger than the plane will store" → "larger than your group's Civicsmith will store" (read by an editor, a member). `index.mjs:83` REVIEW_MARKING: "shown inside this instance to the people it was addressed to" → "shown to the people it was addressed to without leaving the group that made it" (needs no name: recipients outside the group read it too; J1 states this reading). Kept, as DEC-149 keeps a review copy: `checks.mjs:121`, `:127`, `index.mjs:213`, `:220`–`:222`, `:449`. Model- and operator-facing details ("set by the control plane") unchanged. No requirement's meaning changed.
Tests added (invariants.test.mjs): "R11 (DEC-149)" names the marking (both doors carry it; no machine word; no "your group"; negative control) and "R3, R23 (DEC-149)" names C-87.7's translation at the interface and checks every row's translation for machine words (negative control).
Deferred: none. Other modules: see J2 (stale generated artifacts; catalogue stamp is T35's per plan Rules (5) 4).
Tests: `node --test test/m/review/` 37 pass, 0 fail. `node --test test/m/promotion/gate.test.mjs` 8 pass, 0 fail. No layer tests (manifest).
Checks: format 0 failures (127 modules); architecture review 0 failures; coverage review 28 of 28 live ids, 0 failures; ownership review vs tranche/T34 0 failures.
Size (session_01JqykuKX2yyLGrRsyibnAgi): test runs 2, module lines 1015
