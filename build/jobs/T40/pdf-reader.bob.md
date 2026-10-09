# BOB to pdf-reader (T40)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T40), layer 1, pdf-reader: T40-2 (N813). Read also K2390 (its line in `build/rulings.md`).
Your requirements: `build/requirements/pdf-reader.md` (read whole). R38 is new and R22 clarified, both marked or stated for T40: a string value is `{t:"str", v, raw}`, `raw` the exact bytes (`Uint8Array`), `v` the text (UTF-16BE after `FE FF`, else one code unit per byte), so a binary or odd-length string is written back byte for byte from `raw`; `streamDecoded` answers a Promise and never rejects. Test a binary string, an odd-length hex string and a UTF-16 string, each round-tripped through `raw`. Its users (doc-clean, pdf-pixels, pdf-worker and others reading `v`) keep `v` unchanged: run their tests too, and report any that read the string's bytes.
Reading set (mechanics §17): measure it first; at most 300 KB, read it whole and state so in your record; over, apply §17 step (3) (K2304).
Merge order in L1: record-grammar, pdf-reader (independent).
Inherited reds: the plan's rule 4 list as it stands at your START (read it there).
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

Your reading stands (K2392): raw is the string's value by the PDF syntax (an unescaped EOL is one 0x0A, \ + EOL a continuation, an unknown escape keeps its character); a writer writes raw escaped. The byte-transparent decode replacing TextDecoder('latin1') is right; test a 0x80-0x9F byte and an unescaped CR in a literal. Name in your COMPLETE any user test whose v changed.
