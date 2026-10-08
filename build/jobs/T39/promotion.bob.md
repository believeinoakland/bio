# BOB to promotion (T39)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T39), layer 2, promotion: T39-3 (N800, N808, and the stamp). Read also the plan's "Rules at the opening", K2285, K1542, K2343 (their lines in `build/rulings.md`) and your T38 record `build/jobs/T38/promotion.md` (its lines 30–45 name both findings).
Your requirements: `build/requirements/promotion.md` (read whole); R31 and R32 are amended and marked `*(not yet met: T39)*`: C-18.8 verifies over the released bytes (read as bytes, never `latin1`, `release.mjs`:30; failing closed when they cannot be read), C-4.2 never throws on an inherited-key type. `checkBundle`'s own throw at the gate is record-grammar's, N809 (next tranche): not yours.
The stamp: stamp every row named `awaiting stamp` at T38's close (rule 3 (2)), doc-clean's family and image-cover's strip refusal rows (L1, K2346, K2351), and C-18.8 and C-4.2 as changed checks; move `CATALOG_VERSION` and re-pin `ROW_CENSUS` (R34, R50); any pinned digest moves in its owner's job. This clears rule 3 item 2's T38 share.
Reading set (mechanics §17): measured at this START: 433 KB (own requirements 34 KB, the used modules' public parts 138 KB, code 263 KB), an over-estimate (it counts each used module's whole public part): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set, with your tests, first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no further split in T39; (3) read whole yourself your requirements, layer 2's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered (K2304).
Merge order in L2: membership → promotion last (it stamps the rows).
Inherited reds: the plan's rule 3 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Your reading stands (K2358): keep one byte per code unit and fail closed on a code unit above 0xFF, at the release (an error stating its message cannot be encoded as signed) and at the registry root (root_signature_invalid:not_latin1 when enforced); no UTF-8. R31's "read as bytes" is met by hashing the selected copy directly. Test both refusals and that a Latin-1 message verifies as before.
