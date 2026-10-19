# How words are kept: B on four conditions (K3930): BOB's design

**Status** · BOB #214, 2026-10-18. Bob's ruling K3930 ("B with the four conditions. Be smart about implementing this change. Do it correctly given the long-term objectives for Civicsmith development."); everything below is BOB's detail (P17), folded into `setup-words` R14–R19, R13 restated, and the words check (`checks/words.mjs`, civicos-process). Long-term aims it serves: no wording change ever touches a module or its tests (Bob, K3919: the tree's fragility); translation into other languages without rework (N1094, Bob's to schedule); scale to tens of thousands of sentences and many languages.

**Since K3943** the marker written `t` below is named `localize` (1,450 files of the tree bind `t`); since K3944 the design's `unkeyed` list (`words-reads.json`, DEC-258, DEC-260) is not counted by the check.

## 1. Two ways to read a sentence, one table

- **`word(key, vars)`** (R11, unchanged): a row the design stream wrote first. The key must be in `words.json`; a missing key fails the check (`missingkey`). This is how drawn screens read their words (condition 3).
- **`t(id, en, vars)`** (R14, new): a sentence written first at its use. `id` and `en` are string literals at the call (so the build can extract them); `vars` fills `{name}` placeholders. It answers the table's row for `id` when the table holds one (**the table always wins**, condition 2), else `en`. Same placeholder rules and errors as `word`.
- **One table at run time**: `WORD_ROWS` = every row of `words.json` (origin `design`), then every extracted `t` sentence whose id `words.json` lacks (origin `code`). `word` and `t` read the same rows, so the translation workspace (instance-setup R68) and any later language see one list.
- **No sync back, ever** (condition 2): the check never compares the code's `en` with the table. The code's `en` is a first draft; once the design writes a row for that id, the row is what people read.

## 2. Fixed ids (condition 1)

- Existing `words.json` keys are ids and never change.
- An id is dotted, lowercase, `<module>.<area>.<name>` (`KEY_RE`); the conversion assigns `<module>.<file stem>.<slug of the sentence's first words>`, de-duplicated by a numeric suffix, **once**. After that an id is never renamed or reused for another meaning; a sentence whose meaning changes gets a new id. Two calls may share an id only with the same `en` (the check fails otherwise).

## 3. The build step (the extraction)

- The generator (`setup-words/build.mjs`, R10's, extended by R15) reads every product source file once (a real JavaScript parser, never a regular expression), collects each `t(id, en)` call, and writes `rows.mjs` from `words.json` plus the extracted rows. One step for the whole tree, under a minute; run at each layer close as a generated artifact (manifest, §14) and by `--check` in the tests. Between closes a new `t` call already works: it answers its own `en` until the rows are regenerated.
- The extraction also writes `bio-plane/src/setup-words/words-unreviewed.json` (generated, never edited): every code-origin row with its id, `en`, module, file and line. That is the design stream's review list.

## 4. The design stream (condition 3)

- **Drawn screens are written first by the design**: the screen modules (`screens-*`, `interface-shell`, `wizard-scripts`, `site`, the installer's pages) read only through `word`; a `t` call in them fails the check.
- **Every new row is reviewed before a release**: at each tranche close BOB sends the design one HANDOFF naming `bio-plane/src/setup-words/words-unreviewed.json`'s new rows. The design reviews a row by writing it into `words.json` under the same id (as is, or reworded, with a translator's `note`); the row then leaves the unreviewed list. The release cut's words check (`--release`, §10) fails while any unreviewed row remains.
- Nothing a job does waits on the design for words any more: a job writes `t(id, en)` and carries on.

## 5. Translation, ready but not built (N1094 is Bob's)

- Message syntax is ICU MessageFormat, of which `{name}` is the simple case, so plural and gender forms (`{n, plural, one {…} other {…}}`) are added later inside `word`/`t` without touching any call or any row. Until then the check refuses a plural or select form in a row (R18), so nobody writes one that is silently wrong.
- A translator's context is the row's `note` (the design's), plus the extracted file and line.
- A later language is one more table per language, keyed by the same ids; dates and numbers by `Intl` per language. None of it is T51's.

## 6. Pseudo-locale (condition 4)

- `node bio-plane/src/setup-words/build.mjs --pseudo` writes the rows with every sentence transformed (accented letters, widened by about a third, bracketed: `[Ŧĥé ţőţåļ ıś {total}]`), placeholders intact. A screen drawn with it shows every sentence from the table as visibly altered; any plain English left on screen is a sentence that escaped the table. journey-check walks every screen at both widths with these rows (its R27, T51-131), and BOB repeats it before the cut.

## 7. What is not a sentence people read

- Messages given to built-in JavaScript errors (`Error`, `TypeError`, …), console and log text, identifiers, codes, op names, keys: developer text, never in the table (K3927). A member-facing refusal is a code read by key (DEC-83, K231).
- Signed or versioned texts (a case document, the standalone checker, a byte-pinned prompt or method text): their sentences come from rows too, but a change to them is a new version of the document with every earlier version byte-identical (K1333), never a silent edit.

## 8. Tests (fragility, K3810, K3268)

- A test never contains a sentence people read. It asserts that the id is held (`hasWord`), or compares a module's answer with `word(key, vars)` or `t(id, en, vars)`, or checks the answer's id and vars.
- No test hand-lists another module's operations, codes or words: shared lists come from each module's own declaration.

## 9. The conversion (one mechanical pass, §5.10, then jobs for judgments)

Order: (a) setup-words' job (R1, alone) builds `t`, the extraction, the unreviewed list and the pseudo rows; merged, rows regenerated. (b) BOB updates the words check (§10). (c) One codemod, written by a worker, reviewed by BOB, run once with no job running, using a real parser and replacing exact source ranges:
- an inline sentence equal to a `words.json` row (unique) → `word('<key>')`; with placeholders matched in order → `word('<key>', { <name>: <expr> })`;
- any other inline sentence → `t('<id>', '<sentence>')`; a template literal → `t('<id>', '… {name} …', { name: <expr> })`, each name from the expression's last identifier, else `v1`, `v2`;
- a hand-written word table's values → `t(...)` each;
- a test comparing a sentence equal to a row → `word('<key>', …)`.
Everything else is listed for a judgment and goes to its module's job in R (closed layers) or its START (L9–L11): sentences stitched from pieces, partial test copies, hand-lists, custom error classes, signed texts.
**Proof (condition 4):** (1) the whole module test suite before and after, unchanged; (2) a verifier evaluates every converted site, `word`/`t` with the original expressions' sample values, and compares the result with the original literal character for character (all ~12,000); (3) the pseudo-locale walk (§6). A red is fixed in the pass, never accepted (§5.10 (4)).

## 10. The words check after K3930 (civicos-process, BOB's)

- `inline`: a sentence in product source not given to `word` or `t` (unchanged otherwise; stitched counted).
- `marker` (new): a `t` call whose id or `en` is not a string literal, whose id is not `KEY_RE`, whose id is used with two different `en`, or that sits in a drawn-screen module.
- `missingkey`: as now, for `word`, `hasWord`, `wordsOf` only (a `t` id needs no row).
- `testcopy`, `handlist`: as now.
- `--release`: also fails while `bio-plane/src/setup-words/words-unreviewed.json` lists a row.
