# action-replies (T48)

**Status** · session_01QhpiJEWup9HwKXyDqimoCa · depth 2 · WORKING · handled B1

## Record

**Read** (whole): `build/requirements/action-replies.md`; plan entry T48-49; `build/requirements/case-inputs.md` R18 (the seam's `quotable`); the module's `index.mjs`, `checks.mjs`, `schema.mjs`; `test/m/action-replies/{fixture,ops,open}.test.mjs` and the heads of `bearings`, `t46`. Layer-9 contract not re-read beyond the module's Uses (no edge changed).

**Entries applied (T48-49)**
- R10: `actionReplyQuoting({target, ord, quotable, words?, author, viewer})`, `op=actionreplyquoting`, appended to the new table `action_reply_quoting` (declared to purge, R4). Refusals in order: `MACHINE_CANNOT_RECORD_QUOTING` C-150.8, `NO_TARGET`, `NO_SUCH_BUNDLE`, `NOT_AN_ACTION`, `QUOTING_NOT_RFC` C-150.9, `QUOTING_REFUSED` C-150.10, translations BOB's drafts verbatim in `checks.mjs`. `bearingsOf` answers per entry `quotable` (true with nothing recorded) and `quoting: {quotable, words, by, at} | null` (my reading of "with its words, who and when").
- R11: each open-request row answers `quotable`: false when the latest record on any received reply of the request says so.
- R4: a machine records no quoting; the table is this module's, declared to purge.
- Reading of R10 I took: `words` that are present but malformed are refused even with `quotable: true` (nothing is stored then); `words` are trimmed; a double quote, backslash, CR, LF, U+2028/9 are refused.

**Deferred**: none. Flaws found in my module: none.

**Found in other modules (not mine to change)** — adding the op arm makes `actionreplyquoting` a new op of this module's map, so L11/ops owners need it:
- `op-declarations` (test `R49, R6`, `test/m/op-declarations/t45.test.mjs`): "action-replies: actionreplyquoting has no spec" — the op needs its declaration (a member act, `author` and `viewer` stamps).
- Same family, to be expected at their next job: `op-grades` (a grade and its machine-refusal code `MACHINE_CANNOT_RECORD_QUOTING`), `affordances` (`catalogue.test.mjs` lists `actionReplies` writes and the map's keys; `act-help.mjs`, `setup-words` help for the op), `plane` tests that enumerate `actionRepliesOps` keys, and `answer-envelope`/row census for C-150.8–.10 (accepted until T49's stamp). The three sentences await UX-DESIGN keys.
- The inherited coverage reds (28 modules, none mine) are as at START.

**Tests and checks**
- `node --test test/m/action-replies/`: pass 31, fail 0 (new `quoting.test.mjs`: R10 ×4, R11, R4; R3/R8 rows, ops, tables and the C-150 count tests updated for the new field, table, op and rows).
- `format`: 168 modules, 167 requirements files; 0 failures. `architecture action-replies`: 10 product files, 28 relative imports; 0 failures. `coverage action-replies`: 11 of 11 live ids named; 0 failures. `ownership action-replies tranche/T48`: 0 failures.
- `checks/run.mjs` over the product: the only failures are other modules' coverage (inherited) — none for action-replies, none architecture.

Size (session_01QhpiJEWup9HwKXyDqimoCa): test runs 9, module lines 570
