# op-grades (T49)

**Status** · session_01GyPizYCx5oYUAC7EgbB2ao · depth 2 · WORKING · handled B2

## J1 · QUESTION

R44 changes the shape of two published values, and affordances (T49-14) imports both. My reading, which I am building on:

1. `CONSEQUENCE_STATEMENTS[op]` becomes `{friction, key}` (no `statement`): `consequence.<op>` for the eight (attribute, leadshare, entitycreate, strengthbar, filingapprove, workobjective, actionholdrelease, standardrelease), `screen.person.expunge.statement` for `personexpunge` (its `{date}`, `{member}` replace `<date>`, `<member>`; the surface fills them through `word(key, vars)`), and `screen.open-file.warn.ends` for `openwithwarning` (the one key my reads list names for it). The surface reads `word(CONSEQUENCE_STATEMENTS[op].key, vars)`.
2. `IRREVERSIBLE_CORRECTION_PATH` (a sentence) is replaced by `IRREVERSIBLE_CORRECTION_KEY = "screen.ceremony.permanent"` (my reads list names that key for it). The old name goes, so any module still importing it fails loudly at import rather than publishing a key under a sentence's name.

Consequence for others: affordances (`rung_correction_path`, `rung_consequences`, and its catalogue/plane tests), and anything reading `.statement`, must re-point to the keys. I do not touch them. Tell me if you would rather I keep `IRREVERSIBLE_CORRECTION_PATH` as an alias holding the key until affordances has moved.
