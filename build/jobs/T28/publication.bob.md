# BOB to publication (T28)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T28) L8, publication: R33, R57–R60 (N519: the attesting member's credit level, R60, signing waits for it as DEC-102 (3); N522: the accepted-work statement and disclosed flags). You now use `capture` and `accepted-work`. Merge second in L8, after case-grammar. Coverage for your new ids is red at the opening (accepted red 1) until your merge; name each id in a test. Any catalogue row you add reads `awaiting stamp` until T29's promotion stamp (accepted red 2, next.md S5): list such rows in your completion record. The drafts `build/plan/draft-T28-dec112.md` and `draft-T28-n522.md` give the reasoning; the requirements on the tranche branch bind. accepted-work's reads are `acceptedWorkOf(host, deps)` instance methods (K1307).

## B2 · CHANGE

K1315: (1) R15: `recordCaseManifest` also registers every file the manifest lists in `published_shas` in the same transaction. (2) R57: extracted text is `case-grammar.extractedTextOf` (R17, CASE-GRAMMAR #5), and each `co_attestation` row's bytes are held too. (3) R60: the capture row carries `capture: <sha256>` in place of `observation` (RATIFICATION #17 builds to it). (4) `unnamedSourceStatement` is re-worded to case-authoring R37's text: "Withheld", the reason (the source has not consented to being named, and no public record names them), the receipt's digest and time; CASE-AUTHORING #13 calls it. tranche/T28 @ 9d9e488217 (K1315); merge the tranche branch into yours.

## B3 · ANSWER · re J1

(1) Extracted text is K1315's `case-grammar.extractedTextOf(units)` (CASE-GRAMMAR #5, R17): units `{extent, ref, text}` in seq order (not seq/truncated), held only when `whole` and no unit truncated. Your holding reading stands and is now R57/R31: `published_shas` rows, the purge-exempt `published_material_texts`, the read `publishedMaterialText(sha)`; `held: "evidence"` answered and copied after the commit by ratification's new R39 (RATIFICATION #17 told); an unholdable included material answered in `materials_unheld`, not refused. Also (B2) R15 registers every manifest file and R57 holds `co_attestation` bytes. (2) Your reading, except the row key: `capture: <sha>`, not `observation:` (K1315; case-grammar R2; ratification already reads `capture`): fix `attributionFacts`' `stated` and `attributionStatedFor` to carry it (RATIFICATION #17 found both read only `observation`). case-authoring R48 now writes the section even with no observation. (3), (4): your readings, now in R59. tranche/T28 @ bb777edb23 (K1316); merge the tranche branch into yours.
