# op-grades (T49)

**Status** · session_01GyPizYCx5oYUAC7EgbB2ao · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

R44 changes the shape of two published values, and affordances (T49-14) imports both. My reading, which I am building on:

1. `CONSEQUENCE_STATEMENTS[op]` becomes `{friction, key}` (no `statement`): `consequence.<op>` for the eight (attribute, leadshare, entitycreate, strengthbar, filingapprove, workobjective, actionholdrelease, standardrelease), `screen.person.expunge.statement` for `personexpunge` (its `{date}`, `{member}` replace `<date>`, `<member>`; the surface fills them through `word(key, vars)`), and `screen.open-file.warn.ends` for `openwithwarning` (the one key my reads list names for it). The surface reads `word(CONSEQUENCE_STATEMENTS[op].key, vars)`.
2. `IRREVERSIBLE_CORRECTION_PATH` (a sentence) is replaced by `IRREVERSIBLE_CORRECTION_KEY = "screen.ceremony.permanent"` (my reads list names that key for it). The old name goes, so any module still importing it fails loudly at import rather than publishing a key under a sentence's name.

Consequence for others: affordances (`rung_correction_path`, `rung_consequences`, and its catalogue/plane tests), and anything reading `.statement`, must re-point to the keys. I do not touch them. Tell me if you would rather I keep `IRREVERSIBLE_CORRECTION_PATH` as an alias holding the key until affordances has moved.

## Completion record (T49-13)

**Reading.** I read whole: `build/requirements/op-grades.md`, `bio-plane/src/op-grades/index.mjs` and `marks.mjs`, the parts of `t35.mjs`, `t36.mjs`, `t41.mjs` and `t48.mjs` that my entries touch, and the tests that name a requirement my entries change (R4, R8, R21, R24, R42 in `ladder`, `owners`, `pins`, `t35`, `t36`, `t48`). The other tables (`t33`, `t34`, `t37`, `t38`, `t42`, `t45`–`t47`) and tests were run, not read.

**Entries applied.**
- R42's two reds: the registry and kit moved on from PR #34. `MARKS` gains the 16 rungless acts the registry now lists (actioninquiry, actionstake, captureprogressions, connect, founderhandleset, instance, progression, projectleave, projectowneradd, projectremove, projectstakeset, readtranslate, reauth, secondlook, themeread, watchitem), read from the kit's `WEIGHT` (its `owed_` key for an owed act, Reasoned for an op it does not name); the kit now names `acquire` Reversible, so K3284's override and its source line are gone. `MARKS_KIT_COMMIT` is `fa3c8b7e8e` (both files identical there). The test's pins follow.
- R43: `founderhandleset` is `RUNG_ABSENT` ground `caller-owned` (not in `RUNGS`), with the member-directed `NON_ACTS` sentence, `phone: true`; `projectownervotes` is a read. New `t49.mjs`, spread into the tables. START measure: `undetermined` 110 (unchanged), `caller-owned` 36 before, 37 after. The registry names the act `owed:founderhandleset K3265`; it reaches `MARKS` as Reasoned through the kit's `owed_founderhandleset` (2), which is also `MARKS`' default. Explicit tests with controls: `t49.test.mjs`.
- R44 (B2 confirmed my readings): `CONSEQUENCE_STATEMENTS[op]` is `{friction, key}`: `consequence.<op>` for the eight, `screen.person.expunge.statement` (personexpunge), `screen.open-file.warn.ends` (openwithwarning); `IRREVERSIBLE_CORRECTION_KEY = "screen.ceremony.permanent"` replaces `IRREVERSIBLE_CORRECTION_PATH`, no alias. The 11 keys are exactly the `reads` list. The tests that compared sentence English are rewritten to key shape; `words.test.mjs` asserts each key with `hasWord` and the draw with `word(key, vars)`.
- Rule 6: words (above); N1068: the module holds no member-facing English (its 801 builder strings stay, unkeyed), so nothing to re-spell; `admin` grep: no match in the module; N1073: the registries' exception applies; D29: nothing drawn.

**Deferred.** None.

**Found in other modules.**
- `affordances` (T49-14) imports `IRREVERSIBLE_CORRECTION_PATH` and publishes `rung_correction_path` / `rung_consequences`: it fails at import until it publishes the keys (BOB told it, B2). Its `catalogue.test.mjs` and `plane.test.mjs` name the old export.
- `screens-investigate` `person.test.mjs`:95 holds the old expunge sentence and compares it; it re-points with that module's job (T49-26).
- `bio-plane/dist/bio-plane.bundled.mjs` and the `release` copy hold the old tables: stale generated artifacts (plan rule 5 (5)), regenerated at the layer close.

**One red until setup-words merges.** `words.test.mjs` imports `word` and `hasWord` from `setup-words`, which exports neither on this branch yet (its R11–R12 are in its own job). I ran it against a temporary local shim of R11–R12 over `words.json` (3 of 3 pass), then removed the shim; the committed file is unchanged. It needs BOB's CHANGE after setup-words merges.

**Tests and checks.**
- `node --test bio-plane/test/m/op-grades/`: tests 114, pass 113, fail 1 (the `words.test.mjs` import above; 3 tests not run).
- `node checks/format.mjs`: 170 modules, 169 requirements files; 0 failures. `architecture.mjs op-grades`: 30 product files, 53 relative imports; 0 failures. `coverage.mjs op-grades`: 1 modules, 44 of 44 live requirement ids named by a test; 0 failures. `ownership.mjs op-grades tranche/T49`: 14 files changed by op-grades; 0 failures.
- `checks/run.mjs` over the product: architecture 3354 files, 0 failures; coverage names 17 other modules' unmet ids (not mine); op-grades is not among them.

Size (session_01GyPizYCx5oYUAC7EgbB2ao): test runs 12, module lines 3311

## J2 · COMPLETE

op-grades T49-13 is complete on job/T49/op-grades. Details are in my record's "Completion record".

- R42: the two reds are cleared. MARKS gains 16 acts from the moved registry, `acquire` now comes from the kit, and the kit is read at `fa3c8b7e8e`.
- R43: `founderhandleset` is caller-owned (36 → 37 caller-owned; `undetermined` stays 110), `projectownervotes` is a read; both have explicit tests with controls.
- R44: the entries hold keys as you confirmed in B2; the 11 keys equal my `reads` list.
- Checks: format, architecture, coverage and ownership are all 0 failures. Module tests: 114, 113 pass.
- The one red is `words.test.mjs`, which imports `word` and `hasWord` from setup-words; neither exists on the tranche yet. I ran it against a temporary local shim of R11–R12 (3 of 3 pass) and removed the shim. Send CHANGE after setup-words merges, and I will merge the tranche and re-run.
- Others affected: affordances fails at import until it publishes the keys; screens-investigate `person.test.mjs`:95 holds the old expunge sentence; the dist bundles are stale (rule 5 (5)).

**Re-run after B3/B4 (setup-words merged).** Merged tranche/T49; `words.test.mjs` runs against the real `word`/`hasWord`: `node --test bio-plane/test/m/op-grades/`: tests 116, pass 116, fail 0. format, architecture, coverage (44 of 44) and ownership: 0 failures. The red noted above is cleared.

Size (session_01GyPizYCx5oYUAC7EgbB2ao): test runs 14, module lines 3311
