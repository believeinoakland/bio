# promotion (T19)

**Status** · session_01HJeD3rGAqsS7o4aqav9wm3 · depth 2 · WORKING · handled B2

## J1 · QUESTION

The entry says "as drafted" (draft-T19.md:41) plus your START's list. Measured at HEAD, my best reading of the drafted share, which I am building now:

1. **Re-points.** Every catalogue name promotion's code imports goes to record-grammar (parseFrontmatter, normalizeType, vocabFor, STATES, deriveInquiryTitle, inquiryQuestionOf, isMachineIdentity, canonicalJson). `checkBundle` too, once record-core's L2 job registers `LEGACY_GRAMMARS` at construction: until then gate.mjs keeps the catalogue's wrapper. CUSTODIAL_CHECKS and PROJECT_VISIBILITY_CHECKS go to membership after it merges.
2. **Rows into promotion's table**, each a ✱ move, so the census counts each line once: C-33.21 CAS_STALE, C-33.24 FILES_DROPPED, C-33.38 FILE_DIGEST_MISMATCH, C-33.49 ABSENT, C-67.1 SNAP_KEY_TAKEN (from ACT_SHAPE_CHECKS), C-32.5 MACHINE_CANNOT_REOPEN (MACHINE_FENCE_CHECKS), C-26.12 BIAS_ILLEGAL_TRANSITION (BIAS_CHECKS), C-59.1–.4 (PROJECT_ID_CHECKS), C-102.4–.9 (REGISTRATION_CHECKS), C-64.1 GROUP_UNDETERMINED (INSTANCE_GROUP_CHECKS). Lines unchanged except C-64.1's `where`, which goes to a new promote region `is-group-undetermined` (N44's missing marker). Each row leaves the catalogue table only when no other module's code or module test reads that code there. A table some later module still imports keeps its other rows. A whole table is deleted only when I am its last importer (rule 1). For PROJECT_ID_CHECKS and REGISTRATION_CHECKS that is after record-core merges. INSTANCE_GROUP_CHECKS stays for inquiry and strength (L6) and instance-setup's `setup.mjs` (L11), so C-64.1 is held twice until then.
3. **C-18.6/.7** (`checkInfo2Contract` with `CAPTURE_ENCODINGS`, `RAW_SHA_RE`, `storedToHashable`) moves to promotion. It becomes a grammar registered with record-core from `promotionOf` (claiming C-18.6, C-18.7), and its entry leaves `LEGACY_GRAMMARS`. Findings are identical at the gate and the audit. No R states it. I propose **R55**: "Promotion registers with record-core, once per record (its R67), the information@2 register grammar C-18.6 (a registered capture's stored bytes hash to its recorded digest; error) and C-18.7 (a release with no signed release record; warning), claiming those two ids, so the gate (R27) and the audit judge them identically." Please word it, or rule it out of T19.
4. **CHECK_RETIREMENTS** stays in the catalogue. It has no row with a C-number, so R50 does not count it. Its only readers are legacy-tests' `check-firing`, so no module needs it. I read the drafted ✱ as moot and propose deleting it with the catalogue file (control-plane, L11).
5. **CAPTURE_REQUEST_CHECKS**: the gate imports none now, so nothing is mine. **N70**'s nested `fact` refusal is already met (`#fact`). **N221**: confirmed, `runCaseGate` holds no per-member fallback.
6. **Store share** ("sight reindex and visibility answer"): `store.mjs` now only delegates to `promotionOf(...)`. I find nothing left to move except R54's three arms, which legacy-store spreads (K671).

The answer decides only items 3 and 4. I carry on with the rest.
