# setup-words — requirements

**Status** · In force: split from `instance-setup` by copy for size (K617, K624; N807; K2337, K2343), meaning unchanged: R1–R3 carry `instance-setup` R68's list share, which is re-worded there and keeps the object form and its export. Layer 11, directly before `instance-setup`. Last changed T46 (T46-49: R5 new, amending R1 and R2, `WORD_ROWS` re-taken from `words.json` as PR #28 merged it, 1,503 words, 549 protected, `WORDS_COMMIT` that commit; N897, DEC-179, DEC-194, DEC-197; K2904, K2960); marked not yet met (T46). Last changed T47 (T47-52: R6 new, amending R1, R2 and R5, `WORD_ROWS` re-taken from `words.json` at PR #31's merge `a0fab7abf0`, 1,608 words, 570 protected; N992, DEC-198, DEC-199); marked not yet met (T47). Last changed T48 (T48-61: R8 new, amending R7, `WORD_ROWS` re-taken at PR #34's merge `4664e8efd4`, 1,895 words, 652 protected; N847, N1047; DEC-221, DEC-226, DEC-227; K3190, K3192 D1, K3195); marked not yet met (T48). Last changed T49 (T49-15: R9 new, amending R8, `WORD_ROWS` re-taken at `f498560a37`, 2,473 words, 741 protected, `signin.founderhint` dropped; K3334); marked not yet met (T49).

**Size (P6).** 929 lines of generated data (`setup-words.mjs`:1–929), no code; `instance-setup` about 3,300 after its copy goes (4,228 at T38's close, K2337).

## Public

### Purpose

The interface's word list as frozen data: each word the screens show, with its key, English, note, meaning and protected mark, as the design stream's `words.json` gave them at a named commit. Pure data: it imports nothing, reads nothing and writes nothing; `instance-setup` reads it for the translation workspace (its R68).

### Provides

**The word list: `WORD_ROWS`, `WORDS_COMMIT`** (DEC-179; K2200 (4))
- **R1** (was `instance-setup` R68, the list; T41: DEC-188, U142, K2484) `WORD_ROWS` is `docs/development/ux-substrate/screens/words.json` as PR #19 (DEC-188) merged it to `main` at `WORDS_COMMIT`: 1,006 rows, 388 of them protected, one per word of the file's `words`, in the file's order, keys distinct. Each row is `[key, en, note, means, protected]`: `key` and `en` as the file gives them; `note` the file's `note`, or `null` when it gives none; `protected` `true` exactly when the file's `protected` is `true`, else `false`; `means` the `en` of the word's sibling entry, or `null`. The sibling is found from the nearest dotted prefix of the key, of at least two segments, holding an entry `<prefix>.means` or `<prefix>.does` other than the word itself; a word whose key ends in `.means` or `.does` has no sibling (`means` `null`). A test finds `WORD_ROWS` equal to the file at that commit word by word.
- **R2** (was `instance-setup` R68, the commit) `WORDS_COMMIT` is `"3660c18803"` (PR #19's merge to `main`; before T41 `"e08cd35ecb"`), the commit R1's file is read at. The rows the file still holds for the acts DEC-188 (8) retires (`act.accountswitchset.*`, `act.groupswitchset.*`, `act.aiceilingset.*`, `act.aicopyceilingset.*`) are carried as the file gives them; re-keying them is the design stream's (NOTICE; K2484). A later list is carried only by a later requirement naming its commit, which states R1's counts anew.
- **R5** (T46; N897 (1); DEC-179; DEC-194, DEC-195–DEC-197; amends R1, R2; `build/plan/draft-T46-interface.md` §5 I2) `WORD_ROWS` is `words.json` as PR #28 merged it to `main` at `3f40899950`, and `WORDS_COMMIT` is `"3f40899950"` (before T46 `"3660c18803"`): 1,503 rows, 549 of them protected, read by R1's rule (one row per word of the file's `words`, in the file's order, keys distinct, each `[key, en, note, means, protected]` with R1's sibling rule for `means`), so R1's counts and R2's commit move to these. The rows the file holds for acts no longer served or retired (`handle.*` among them, which built code reads while `handlechange` is kept as a refusing op, K2903) are carried as the file gives them; re-keying them is the design stream's. A test finds `WORD_ROWS` equal to the file at that commit word by word.
- **R6** (T47; N992; DEC-198 (3), (7), (8), DEC-199 (1)–(5); amends R1, R2, R5) `WORD_ROWS` is `words.json` as it stands on `main` at PR #31's merge (`a0fab7abf0`, after PR #30's DEC-198 and PR #31's DEC-199), and `WORDS_COMMIT` is `"a0fab7abf0"` (before T47 `"3f40899950"`): 1,608 rows, 570 of them protected, read by R1's rule (one row per word of the file's `words`, in the file's order, keys distinct, each `[key, en, note, means, protected]` with R1's sibling rule for `means`), so R5's counts and commit move to these. The file no longer holds 18 keys R5 carried, so neither does `WORD_ROWS`: the rows DEC-198 drops (`refusal.DRAFT_NEEDS_GRANT`, `handle.refused.notmember`, `handle.refused.unchecked`), DEC-199's `signing.openrequest.nowindow` (replaced by whole sentences), and the `act.capture.*` and `act.owed_<op>.*` rows of the six acts DEC-198 (1) re-keys to their served names (`act.captureupload.*`, `act.actionscope.*`, `act.escalationstoppursuing.*`, `act.filingsecondapprove.*`, `act.infolevelset.*`, `act.itemtakeup.*`, `act.subscriptionsignin.*`); 123 keys are new. Every row is carried as the file gives it. A test finds `WORD_ROWS` equal to the file at that commit word by word.

- **R3** (was `instance-setup` R68, "carried as frozen data") `WORD_ROWS` and each of its rows are frozen: no write changes the list, a row or a field.

#### T47's L11 fold (K3100)

- **R7** (K3062; amends R6) `WORD_ROWS` is `words.json` as merged into `tranche/T47` at L11's START (K3127; `WORDS_COMMIT` that merge's commit), its counts as read there (1,788 rows, 651 protected at 6f0d88d8d5; K3143), by R1's rule. Test: equal word by word.

#### T48 (T48-61)

- **R8** (T48; N847, N1047; DEC-221, DEC-226, DEC-227; K3190, K3192 D1; amends R7) `WORD_ROWS` is `words.json` as it stands on `main` at PR #34's merge, and `WORDS_COMMIT` is `"4664e8efd4"`: 1,895 rows, 652 of them protected, by R1's rule. This carries DEC-226's and DEC-227's words (`updates.*`, `queue.update.*`, `home.update.*`, `installer.update.*`, `elsewhere.*`, `door.front.elsewhere.*`, `wizard.guide.elsewhere*`, `places.elsewhere.*`) and replaces every row R7 carried in DEC-221's earlier spelling. The counts as read at that commit bind (R1's rule). Test: equal word by word; control: no row's `en` holds "labelled".

#### T49 (T49-15)

- **R9** (T49; DEC-229 to DEC-241, DEC-245, DEC-246; N1072, DEC-230; amends R8) `WORD_ROWS` is `words.json` as it stands on `main` at the commit named at START (`f498560a37`, PR #37's merge, or a later `main` commit), and `WORDS_COMMIT` is that commit: 2,473 rows, 741 of them protected at `f498560a37`, by R1's rule. The counts as read at the named commit bind. This carries every key the T49 screen requirements name. It no longer carries `signin.founderhint` (DEC-230 withdrew it). Test: equal word by word. Control: no row's key is `signin.founderhint`, and no row's `en` holds "labelled". *(not yet met: T49)*

## Private

### Uses

None. It imports nothing. For its tests only: the file `docs/development/ux-substrate/screens/words.json` at `WORDS_COMMIT`, read from git (no module).

### Invariants

- **R4** The module imports nothing and does nothing when loaded beyond defining its two exports: no I/O, no store, no registration, no time or randomness; every read of it answers the same. It holds no code that decides anything: the reading of a word (its state, its translation, its fallback) is `instance-setup`'s.

### Satisfies

- DEC-179 (the interface's word list: its keys, its English, its protected marks; a word known by its key): R1, R2.
- DEC-127 (2) (each word carries its meaning note; K2200 (4): `means` from the sibling `.means` or `.does` entry): R1.

### Suggestions

- **Generated, never edited by hand.** The generator is recorded in `build/jobs/T37/instance-setup.md` (its "word list's generator"; run from the repository root over `git show e08cd35ecb:<the file>`). The copy is regenerated, not hand-copied: its header names this module's R1 and its own test (the current header, `setup-words.mjs`:1–5, names `instance-setup` R68 and `words.test.mjs`, which does not check it; the check is `instance-setup/interface-words.test.mjs`:33). R3 is met by the generator writing `Object.freeze([...])` around each row. Keeping the generator beside the module (not imported, so not bundled) is the job's choice.
- **Tests.** R1 reads the file from git at the commit (the working copy only when git cannot, the commit's own counts still binding), states the sibling rule independently of the module, and checks it by examples (`weight.reversible.name` → `weight.reversible.means`; `act.publish.label.ceremony` → `act.publish.does`; `weight.reversible.means` → `null`; `state.undetermined`'s note). R3 tries a write on the list and on a row, each throwing in strict mode. R4 reads its own source for an `import`.
- **The file's path.** `bio-plane/src/setup-words/index.mjs` (the repository's convention for a module), so the new copy and `instance-setup`'s old `bio-plane/src/setup-words.mjs` never share a path while both exist (K624: copy, then delete).
