# Draft: T39 L11, `setup-words` split from `instance-setup` (T39-16a/b; N807; K2337, K2343)

A worker's draft for BOB, 2026-10-08. Files read whole: `build/requirements/README.md`, `build/requirements/instance-setup.md`, `bio-plane/src/setup-words.mjs` (lines 1–929), `civicos-process/PROCESS-MECHANICS.md` §3. Also read: `setup.mjs`'s import of the word list and every function using it (`setup.mjs`:40–41, 667–674, 2050–2060, 2225, 2511–2532, 2559–2563); `test/m/instance-setup/interface-words.test.mjs` and `words.test.mjs` whole; the word-list uses in `translations.test.mjs`, `store-door/routes.test.mjs` and `membership/module-order.test.mjs`; the generator in `build/jobs/T37/instance-setup.md`:54–79.

**Findings that shape the split.**
- `setup-words.mjs` exports two names and nothing else: `WORDS_COMMIT = "e08cd35ecb"` (:6) and `WORD_ROWS`, a frozen array of 921 rows `[key, en, note, means, protected]` (:7–929). It imports nothing. Measured: 921 rows, 345 with `protected === true`, 921 distinct keys, 284 with a non-null `means`. `Object.isFrozen(WORD_ROWS)` is true, `Object.isFrozen(WORD_ROWS[0])` is false: `Object.freeze` at :7 covers the list, not its rows.
- Its only importer is `setup.mjs`:41. `setup.mjs`:671–674 maps the rows to frozen `{key, en, note, means, protected}` objects (`INTERFACE_WORDS`), re-exports the commit as `INTERFACE_WORDS_COMMIT`, and builds `WORD_BY_KEY`. Every other use reads `INTERFACE_WORDS` or `WORD_BY_KEY` (`setup.mjs`:2053 `NO_SUCH_WORD`, R70–R73; :2225 R67's missing words; :2511–2532 R74 `translations`, `english_changed` at :2525; :2559–2563 R74 `interfaceWords`).
- So exactly one instance-setup requirement has behaviour in `setup-words.mjs`: **R68**, and only its list share (which words, in which order, with which fields and values, at which commit). The object form and its export (`setup.mjs`:671–674) and DEC-179 (3)'s "a word keeps its key" (adoptions record their English, `english_changed`, `setup.mjs`:2525) are in `setup.mjs` and stay. R67 and R69–R75 use the list's contents but are built in `setup.mjs`: they stay unchanged. **R68 is split; no id is retired whole.**

---

## 1. Proposed `build/requirements/setup-words.md`

```markdown
# setup-words — requirements

**Status** · In force: split from `instance-setup` by copy for size (K617, K624; N807; K2337, K2343), meaning unchanged: R1–R3 carry `instance-setup` R68's list share, which is re-worded there and keeps the object form and its export. R3's per-row freeze is not yet met (T39-16a). Layer 11, directly before `instance-setup`.

**Size (P6).** 929 lines of generated data (`setup-words.mjs`:1–929), no code; `instance-setup` about 3,300 after its copy goes (4,228 at T38's close, K2337).

## Public

### Purpose

The interface's word list as frozen data: each word the screens show, with its key, English, note, meaning and protected mark, as the design stream's `words.json` gave them at a named commit. Pure data: it imports nothing, reads nothing and writes nothing; `instance-setup` reads it for the translation workspace (its R68).

### Provides

**The word list: `WORD_ROWS`, `WORDS_COMMIT`** (DEC-179; K2200 (4))
- **R1** (was `instance-setup` R68, the list) `WORD_ROWS` is `docs/development/ux-substrate/screens/words.json` as PR #14 merged it to `main` at `WORDS_COMMIT`: 921 rows, 345 of them protected, one per word of the file's `words`, in the file's order, keys distinct. Each row is `[key, en, note, means, protected]`: `key` and `en` as the file gives them; `note` the file's `note`, or `null` when it gives none; `protected` `true` exactly when the file's `protected` is `true`, else `false`; `means` the `en` of the word's sibling entry, or `null`. The sibling is found from the nearest dotted prefix of the key, of at least two segments, holding an entry `<prefix>.means` or `<prefix>.does` other than the word itself; a word whose key ends in `.means` or `.does` has no sibling (`means` `null`). A test finds `WORD_ROWS` equal to the file at that commit word by word.
- **R2** (was `instance-setup` R68, the commit) `WORDS_COMMIT` is `"e08cd35ecb"`, the commit R1's file is read at. A later list is carried only by a later requirement naming its commit, which states R1's counts anew.
- **R3** (was `instance-setup` R68, "carried as frozen data") `WORD_ROWS` and each of its rows are frozen: no write changes the list, a row or a field. *(not yet met: T39-16a; `setup-words.mjs`:7 freezes the list, not its rows)*

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
```

---

## 2. Edits to `build/requirements/instance-setup.md`

**R68, split** (no id retired whole; replace the whole R68 line, `instance-setup.md`:119):

```markdown
- **R68** (DEC-179; T39, N807: the list itself moved to `setup-words` R1–R3) `INTERFACE_WORDS` is `setup-words`' `WORD_ROWS` (its R1) in its order, each row exported as `{key, en, note, means, protected}`, the list and each word frozen; `INTERFACE_WORDS_COMMIT` is its `WORDS_COMMIT` (its R2). This module holds no copy of the list. *(not yet met: T39-16b)* A word keeps its key when its English changes (DEC-179 (3)): every adoption records the English it translated, and R74 answers `english_changed: true` for a shown word whose recorded English is not the list's.
```

(The moved sentences: "The word list is `…words.json` as PR #14 merged it to `main` (`e08cd35ecb`: 921 words, 345 protected), carried by this module as frozen data", the field definitions, "A test finds it equal to the file word by word" and "A later list is carried only by a later requirement naming its commit" → `setup-words` R1–R3. The not-yet-met mark covers only "holds no copy": today `setup.mjs`:41 imports instance-setup's own `setup-words.mjs`; T39-16b re-points it and deletes the copy.)

**Uses**, a new line after the `(T37; K2200, rule 5)` line (`instance-setup.md`:134):

```markdown
- (T39; N807) `setup-words`: `WORD_ROWS` and `WORDS_COMMIT` (its R1, R2; R68), read, never copied.
```

**Status**, appended to the paragraph at `instance-setup.md`:3:

```markdown
Split for size again (T39-16; N807; K617, K624, K2337, K2343): the interface's word list, R68's list share, moved to `setup-words` R1–R3 by copy; R68 keeps the object form, its export and DEC-179 (3); marked not yet met (T39).
```

**Size**, optional, appended to `instance-setup.md`:5: `(T39) 4,228 lines over its paths at T38's close (K2337); 3,299 after the word list leaves (setup.mjs 2,998, setup-fleet.mjs 52, livefire.mjs 249).`

Nothing else changes: R67, R69–R75 read the list through `INTERFACE_WORDS` and stay as written; Purpose, Satisfies and Suggestions unchanged.

---

## 3. Tests

There are no `describe` blocks in these files: each is top-level `test(...)` calls.

**Move (rewritten) to `bio-plane/test/m/setup-words/`** (the convention `bio-plane/test/m/<module>/`):
- `instance-setup/interface-words.test.mjs`, its one test (:33–55, with `theFile` :13–18 and `siblingOf` :20–31): the only test exercising the word list's data. In the new `word-list.test.mjs` it reads `WORD_ROWS` and `WORDS_COMMIT` from `../../../src/setup-words/index.mjs` instead of `INTERFACE_WORDS` from `setup.mjs` (:11), compares rows (`[f.key, f.en, f.note ?? null, siblingOf(...), f.protected === true]`) in place of objects (:44), and is titled `R1 R2`. New in the same file: `R3` (writes on the list and on a row throw; red until the regenerated copy freezes rows) and `R4` (no `import` in the source).

**Stays in `bio-plane/test/m/instance-setup/`:**
- `interface-words.test.mjs`, reduced to R68's share: `INTERFACE_WORDS` equals `WORD_ROWS` (imported from `setup-words`) mapped to `{key, en, note, means, protected}` in order; the list and each word frozen (as :53); `INTERFACE_WORDS_COMMIT === WORDS_COMMIT`; titled `R68`, so instance-setup's coverage still names R68. Optional at T39-16b: a source read that `setup.mjs` imports the word list only from `./setup-words/index.mjs` (R68's "holds no copy").
- `translations.test.mjs` (R67, R69–R74): it uses `INTERFACE_WORDS` as fixtures only (:18, :23–26, :118, :140, :144–151, :316, :468, :501). Unchanged.
- `words.test.mjs` (R63, member-facing sentences; despite its name it never reads the word list, :8–9). Unchanged.

**Elsewhere, not moved, not changed:** `store-door/routes.test.mjs`:179 (a fixture word from `INTERFACE_WORDS`, store-door's own test); `membership/module-order.test.mjs`:60–65, :95–110 (membership R83; `NOT_YET_BUILT = ["setup-words"]` is consulted only for a module with empty `paths`, so it stops mattering when T39-16a gives setup-words its paths and fails nothing; its removal is membership's wording at a later job, not owed here).

---

## 4. `modules.json`

`setup-words` (T39-16a, replacing the entry at `build/modules.json`:134):

```json
{"id": "setup-words", "layer": 11, "paths": ["bio-plane/src/setup-words/"], "tests": ["bio-plane/test/m/setup-words/"], "uses": []}
```

`instance-setup` (T39-16b): `paths` loses `"bio-plane/src/setup-words.mjs"` (keeping `setup.mjs`, `setup-fleet.mjs`, `livefire.mjs`); `uses` gains `"setup-words"`. Order: T39-16a merges first (setup-words' copy and tests), then T39-16b (instance-setup deletes `bio-plane/src/setup-words.mjs`, re-points `setup.mjs`:41 to `./setup-words/index.mjs`, reduces its test). Between the two merges the list is held twice for one layer only, as K624 allows.

---

## 5. Doubts, each with my best reading

1. **The path.** The entry says setup-words "takes the file `bio-plane/src/setup-words.mjs`". Taken literally (setup-words owning that path, instance-setup dropping it) there is no copy, and both entries would name one path while T39-16a and T39-16b are apart (ownership refuses that). Best reading: copy to `bio-plane/src/setup-words/index.mjs` (convention, as `setup-page/`), then T39-16b deletes the old file (K624). The plane bundle's input list names `src/setup-words.mjs` (`bio-plane/dist/bio-plane.bundle.json`:2520): regenerated at L11's close (§14), as every L11 change.
2. **R3, rows not frozen.** R68 says "carried … as frozen data"; today only the list is frozen (`setup-words.mjs`:7) and `setup.mjs`:671–672 freezes its own objects, so instance-setup's interface is deeply frozen and setup-words' is not. Best reading: freezing each row keeps R68's meaning at the new interface, costs one generator change, and is marked not yet met (T39-16a). If BOB prefers no new obligation, R3 reads "the list is frozen" and is met today.
3. **R1 vs R2 as separate ids.** I split the commit (R2) from the rows (R1) because each is a separate export with its own test; folding R2 into R1 is equally sound.
4. **The sibling rule's tie.** The generator tries `.means` before `.does` at the same prefix (`build/jobs/T37/instance-setup.md`:62–66). Measured: no prefix in the list holds both, so R1 states no tie-break; a later list that has one would need it stated.
5. **Local facts in the words.** `setup-words.mjs`:668 (`column.money.period.shows`) says "here the city's fiscal year (FY2022 ran 1 July 2021 to 30 June 2022)", a jurisdiction's fact in product data (README rule 7; `layers.md`, "No jurisdiction in the product"); :685 names the column "Español" for one screen's example. They are the design stream's words carried verbatim, and R1 requires equality with the file, so this split changes nothing. Best reading: no invariant claims "no place named" for this module; a NOTICE to UX-DESIGN that the column note names one city's fiscal year, the fix arriving with a later list (a later requirement naming its commit, R2).
6. **The header comment.** `setup-words.mjs`:1–5 names `instance-setup` R68 and "words.test.mjs checks it word by word"; `words.test.mjs` is R63's test and the check is `interface-words.test.mjs`. Best reading: the T39-16a copy is regenerated with a header naming `setup-words` R1 and its own test; the data lines are byte-identical.
7. **Uses `none` and the test's file read.** The test reads `words.json` from git; that is a docs file, not a module, so `uses` stays `[]`.
