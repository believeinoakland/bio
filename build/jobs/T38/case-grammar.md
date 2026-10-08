# case-grammar (T38)

**Status** · session_013zcnQ4W9BbvuNM5wQzXJFL · depth 2 · WORKING · handled B1

## Reading set (mechanics §17)

Read whole myself, as B1 measured it (246 KB): `build/requirements/case-grammar.md` (both parts); the public parts of record-grammar, calc-grammar and strength; layer 8's contract in `build/layers.md` (its row and the layer-8 sections); the plan's rules 4, 6 and 8 and entry T38-19; K2220, K2248, K2291, K2303 (their lines); every file of `bio-plane/src/case-grammar/` and `bio-plane/test/m/case-grammar/`. Also `case-carriage` R11 (the label's words and `OBSCURED_LABEL`).

## Entries applied (T38-19; N779, K2248, K2303; rule 8)

- **R12** (`materials.mjs`): the grammar already wrote and read a copy whose label is null (a label not a sentence is written null; an absent label line reads null), so no behaviour changed and no format changed: every photo, marked or not, is written as `obscured: {copy, label}`, `included: false`, the original's `sha`, `text_sha`, `origin`, `archived_copy` kept; `label` is written as handed. My reading: "a published case states it for every photo it carries" binds the writers (`case-carriage`, `case-authoring`), since a row does not say whether its document is a photo and this module, earlier than `case-carriage`, names no label of its own; the grammar provides the spelling for both, tested. Comments in `materials.mjs` and `casefile.mjs` re-worded (no longer "a photo with people or plates marked").
- **R14** (`complete.mjs`): a copy with a label (a marked photo's) is listed as before T38, byte for byte (pinned: the marked-photo edition's SHA-256 `910634ae…`, rendered by this module's code at T38's opening); a copy with no label (an unmarked photo's) lists the original's fingerprint and `OBSCURED_WORDS.unmarked` ("Carried as a copy with nothing covered and none of the original's metadata; the copy's fingerprint (SHA-256): …") and no label line. `OBSCURED_WORDS.noLabel` ("The label this copy carries is not stated.") is gone: R14 now lists a label only when the copy has one. No module but this one reads `OBSCURED_WORDS`.
- **Tests** (`obscured.test.mjs`, K874, each title naming its id and "T38"): R12 an unmarked photo's row round-trips with `label: null` (handed absent, null or blank; an absent line reads null; formats unchanged); R12 a case carrying a marked and an unmarked photo states both obscured, passes R13's check with its rows, and departs when the unmarked photo's row states no `obscured` or its original is carried; R14 the unmarked copy listed without a label, the marked one with its label word for word, an absent label line rendering as a written null, and the marked-photo edition's bytes pinned. The T37 test's "a label not stated says so" arm removed (R14 now says the opposite). Fixture: `plainPhoto` option, `PLAIN_PHOTO_ROW`.
- Nothing deferred. No question was needed: R12 states the label is `OBSCURED_LABEL` when marked, else null, so the edition reads a label's presence as "marked".

## Found in other modules

- Generated artifact stale (REPORT): `bio-plane/src/case-checker/program.mjs` (it bundles this module), and the plane bundle that carries it. case-checker `program.test.mjs` R13 is red until L8's close regenerates it: rule 6's accepted red 8. Not rebuilt by hand.
- Nothing else: every other user's tests pass with my change.

## Tests and checks

- `node --test test/m/case-grammar/` (from `bio-plane/`): tests 100, pass 100, fail 0. No layer tests named for layer 8.
- Users (R14's rendering changed): case-carriage 48/0, case-tensions 23/0, publication 130/0, docket 59/0, public-read 153/0, case-catalogue 16/0, ratification 216/0, case-import 88/0, case-disclosures 68/0, case-authoring 163/0; case-checker 59 pass, 1 fail (`program.test.mjs` R13, the stale `program.mjs`: accepted red 8).
- `format`: 137 modules, 136 requirements files; 0 failures. `architecture`: 33 product files, 102 relative imports; 0 failures. `coverage`: 22 of 22 live requirement ids named by a test; 0 failures. `ownership … tranche/T38`: 6 files changed by case-grammar; 0 failures.

Size (session_013zcnQ4W9BbvuNM5wQzXJFL): test runs 15, module lines 2329

## J1 · REPORT

Generated artifact stale (mechanics §14): bio-plane/src/case-checker/program.mjs (it bundles case-grammar; complete.mjs changed), and the plane bundle carrying it. case-checker program.test.mjs R13 is red until L8's close regenerates it: rule 6's accepted red 8. Not rebuilt by hand. Every other user's tests pass with my change (record).
