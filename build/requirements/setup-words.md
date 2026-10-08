# setup-words — requirements

**Status** · In force: split from `instance-setup` by copy for size (K617, K624; N807; K2337, K2343), meaning unchanged: R1–R3 carry `instance-setup` R68's list share, which is re-worded there and keeps the object form and its export. Layer 11, directly before `instance-setup`.

**Size (P6).** 929 lines of generated data (`setup-words.mjs`:1–929), no code; `instance-setup` about 3,300 after its copy goes (4,228 at T38's close, K2337).

## Public

### Purpose

The interface's word list as frozen data: each word the screens show, with its key, English, note, meaning and protected mark, as the design stream's `words.json` gave them at a named commit. Pure data: it imports nothing, reads nothing and writes nothing; `instance-setup` reads it for the translation workspace (its R68).

### Provides

**The word list: `WORD_ROWS`, `WORDS_COMMIT`** (DEC-179; K2200 (4))
- **R1** (was `instance-setup` R68, the list) `WORD_ROWS` is `docs/development/ux-substrate/screens/words.json` as PR #14 merged it to `main` at `WORDS_COMMIT`: 921 rows, 345 of them protected, one per word of the file's `words`, in the file's order, keys distinct. Each row is `[key, en, note, means, protected]`: `key` and `en` as the file gives them; `note` the file's `note`, or `null` when it gives none; `protected` `true` exactly when the file's `protected` is `true`, else `false`; `means` the `en` of the word's sibling entry, or `null`. The sibling is found from the nearest dotted prefix of the key, of at least two segments, holding an entry `<prefix>.means` or `<prefix>.does` other than the word itself; a word whose key ends in `.means` or `.does` has no sibling (`means` `null`). A test finds `WORD_ROWS` equal to the file at that commit word by word.
- **R2** (was `instance-setup` R68, the commit) `WORDS_COMMIT` is `"e08cd35ecb"`, the commit R1's file is read at. A later list is carried only by a later requirement naming its commit, which states R1's counts anew.
- **R3** (was `instance-setup` R68, "carried as frozen data") `WORD_ROWS` and each of its rows are frozen: no write changes the list, a row or a field.

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
