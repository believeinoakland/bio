# BOB to doc-clean (T40)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T40), layer 1, doc-clean: T40-2a. Read also K2390, K2392 and K2399 (their lines in `build/rulings.md`), and `pdf-reader` R38 in `build/requirements/pdf-reader.md` (merged in T40: a string value is `{t:"str", v, raw}`).
Your requirements: `build/requirements/doc-clean.md` (read whole). R10 is new, marked `*(not yet met: T40)*`: a PDF copy writes every string from `raw`, escaped as a literal or hex string, never rebuilt from `v` (today `bio-plane/src/doc-clean/pdf.mjs`:266, `str(v.v)`). Test, at your interface, a binary string (bytes 0x00–0xFF), an odd-length `FE FF` string and a string holding 0x80–0x9F, each read back from the copy byte for byte; with a negative control (an ASCII string unchanged). Name R10 in a new test explicitly (K874).
Reading set (mechanics §17): measure it first; at most 300 KB, read it whole and state so in your record; over, apply §17 step (3) (K2304).
Merge order in L1: you are the last L1 job (record-grammar and pdf-reader are merged).
Inherited reds: the plan's rule 4 list as it stands at your START (read it there); none is yours. qpdf may be missing in your container (R5's test skips): say so in your record.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
