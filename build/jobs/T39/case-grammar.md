# case-grammar (T39)

**Status** · session_015c5pkGR6f8FDqbTSrFjvzi · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied.** T39-9 (N806, K2333), with K2315, K2334, K2343, K2365 read. Confirmed first: the code already wrote and read any `document` row's `obscured` (`materials.mjs`' `materialRow`, `obscuredRead`) and R13's three departures key on the row, not on a photo, so R12 and R13 needed no behaviour change. Changed:
- **R12, R13 (words).** `materials.mjs` and `casefile.mjs` comments name a material carried as its copy, a photo's or a member document's cleaned copy (`case-carriage` R15, `COPY_CLEANED_LABEL`). `caseFileManifestCheck`'s details now say "a copy carried in its original's place" (`obscured_unnamed`) and "whose material the case carries as its copy" (`original_carried`); the rule names are unchanged and no other module matches those words (grep over `bio-plane` and `civicos-ui`).
- **R14 (a flaw fixed, J1).** The edition chose its copy line by the label alone, so a member document's labelled copy would have printed "Carried as a copy with marked areas covered", which is false for it. It now reads the copy's own bytes from the case file (`materials/<ref>/obscured`, which public-read R24 and the checker both hand in): a copy beginning `%PDF-` or `PK\x03\x04` (doc-clean's PDF, OOXML, ODF) prints the new `OBSCURED_WORDS.cleaned`, "Carried as a cleaned copy, with none of the details of who made it or of its pictures; the copy's fingerprint (SHA-256): ", then its label word for word. Every other copy (an image, or a copy not handed) prints exactly as before, so every photo's edition keeps its bytes (the T38 pin `910634ae…` and the pre-T37 goldens still hold). This is my best reading in J1, which BOB has not answered yet; the words are BOB's draft for the UX stream to re-word.

**Tests** (`obscured.test.mjs`, fixture `casefile-fixture.mjs` gains `memberDoc`: a member document's row and its cleaned copy, as a PDF or a zip package):
- "R12 (T39)": the member document's copy row written flat, `included: false`, `COPY_CLEANED_LABEL` as handed, the original's fingerprints kept, read back under `/7` and `/6`; beside a marked and an unmarked photo; negative control: no `obscured`, read `null`.
- "R13 (T39)": a `/3` case file carrying it meets the rule (PDF and OOXML copies); its copy no row names, a copy not carried, and each original kind under its ref each depart, by name and with the new words.
- "R14 (T39)": listed with the original's fingerprint, the cleaned-copy line and the label, never "marked areas covered"; content as bytes gives the same output; the photos in the same edition are listed as before, byte for byte.
- "R14 (T39) negative controls": the same row with an image copy (JPEG, PNG and WebP magic, and near-misses such as `%PDF` or lower-case `pk`) prints the photo's line; a copy not handed is never taken for a document; a cleaned copy with no label prints its line alone; an edition with no `obscured` renders the pre-T37 golden; odd copy content never throws.
- Re-worded: the suite's header and the "only a document row (a photo)" comment; `OBSCURED_WORDS`' keys test now lists `cleaned`. Mutations checked: the copy detection forced to never answer a document fails 2 tests; forced to always answer one fails 4.

**Reading set (§17).** About 248 KB (BOB's measure), read whole by this session: my requirements, all 15 source files, every test file and fixture (not the two golden JSON fixtures, large data, K2083), the Purpose and Provides of record-grammar, calc-grammar and strength, layer 8's row and split section of `build/layers.md`, the plan entry, rule 3 and the rulings named. No worker summary.

**Deferred.** None.

**Other modules (REPORT).**
- `bio-plane/src/case-checker/program.mjs` (case-checker's generated artifact, which bundles case-grammar) is stale after this change: `program.test.mjs` R13 fails (`a5d13426…` committed, `a9b6f53f…` built); it passed on the unchanged tranche. Accepted red (rule 3 (7)); regenerate at the layer's close. The plane bundle is staled likewise.
- case-checker's readable `/3` specification (T39-17) and public-read's R23 words may want to say that the complete edition tells a cleaned document's copy from a photo's by the copy's bytes. That is their wording, and T39-17 already covers case-checker's.

**Tests and checks.**
- `node --test bio-plane/test/m/case-grammar/`: tests 104, pass 104, fail 0.
- Layer tests: none named in `build/manifest.md`.
- Users of case-grammar (K2365's services I render), each `node --test bio-plane/test/m/<module>/`: case-carriage 56/56, case-tensions 23/23, publication 133 pass of 134 (1 todo, 0 fail), docket 59/59, public-read 155/155, case-catalogue 16/16, ratification 216/216, case-checker 59 of 60 (1 fail: the stale `program.mjs` above), case-import 88/88, case-disclosures 71/71, case-authoring 164/164.
- `checks/format.mjs`: 139 modules, 137 requirements files; 0 failures.
- `checks/architecture.mjs case-grammar`: 33 product files, 102 relative imports; 0 failures.
- `checks/coverage.mjs case-grammar`: 22 of 22 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs case-grammar tranche/T39`: 6 files changed by case-grammar between tranche/T39 and HEAD; 0 failures (after the commit).

Size (session_015c5pkGR6f8FDqbTSrFjvzi): test runs 19, module lines 2353

## J1 · QUESTION

R14 item 3 (T39-9). A member document's cleaned copy will carry a label (`COPY_CLEANED_LABEL`), and the complete edition today picks its copy line by the label alone: a labelled copy prints `OBSCURED_WORDS.copy`, "Carried as a copy with marked areas covered; the copy's fingerprint (SHA-256): ", then the label. For a member document that line is false (nothing is marked or covered). The row cannot tell a photo from a document (both `kind: document`, no format change), this module cannot import `case-carriage`'s labels, and a marked photo's edition must keep its bytes (case-checker re-renders and compares, check.mjs:507).

My best reading (building it now): the edition reads which kind of copy it is from the copy's own bytes, which the case file carries at `materials/<ref>/obscured` and both callers (public-read R24, case-checker) hand in. A copy whose bytes begin `%PDF-` or `PK\x03\x04` (doc-clean's PDF and OOXML/ODF output) is a cleaned member document and prints a new `OBSCURED_WORDS.cleaned`: "Carried as a cleaned copy, with none of the details of who made it or of its pictures; the copy's fingerprint (SHA-256): ", then its label word for word. Any other copy (an image, or a copy whose bytes are not handed) prints exactly as today, so every photo's edition, marked or not, keeps its bytes. The words are BOB's draft, for the UX stream to re-word. Also: `caseFileManifestCheck`'s `obscured_unnamed` and `original_carried` details say "a photo's place" / "whose photo"; I re-word them to "its original's place" / "whose material" (rule names unchanged; no caller matches those words outside this module's tests, checked by grep). Tell me if you want another rule.

## J2 · COMPLETE

T39-9 complete (job/T39/case-grammar @ HEAD). R12/R13: the code already read and wrote any document row's obscured; comments and caseFileManifestCheck's two details now name a material's copy (a photo's or a member document's), rule names unchanged. R14: on my J1 reading (still unanswered), the complete edition picks a cleaned-document line by the copy's own bytes (%PDF- or PK zip) and prints COPY_CLEANED_LABEL beside it; every photo's copy renders byte for byte as before (T38 pin and pre-T37 goldens hold). Four new T39 tests in obscured.test.mjs (R12, R13, R14 and R14 negative controls), PDF and OOXML copies; mutations caught both ways. case-grammar 104/104; format, architecture, coverage (22/22), ownership (6 files) 0 failures. Users' suites green except case-checker program.test R13: program.mjs staled by this change (rule 3 (7), regenerate at L8 close); the plane bundle likewise. Reading set ~248 KB read whole. Nothing deferred. If J1's answer differs, a CHANGE re-opens me.
