# Draft: DEC-112's folds, a published case in three forms (T24)

**Status** · DRAFT by a worker for BOB #95, 2026-10-02, on `tranche/T23` @ c2b7341cd8, DEC text from `origin/claude/gallant-brown-zg0wc1` @ 132418b89a (DECISIONS.md `### DEC-112`; `BIO_Publication_v0_1.md` §5C, RULED 2026-10-01; `BIO_Complete_Roadmap_v5.md` §11); for BOB's review, then Bob's approval; nothing folded yet. Entry N481 of `next.md`. DEC-112 is not on `main` (checked: `origin/main` @ 5d473bb436 holds no DEC-112), so under the manifest's "Parallel work" it is folded only once it lands there or Bob names it. Each fold restates Bob's ruling; only the wording is new.

Conventions (as `draft-T22-dec-folds.md`). A new requirement takes its module's next free id; no retired id is reused (checked: none of the ids below was ever used). Every new or changed line ends `*(not yet met: T24)*` and cites DEC-112. Line counts are each module's `paths` in `build/modules.json`, measured on this branch (`git ls-files`, every line). "Order" means a module uses only earlier modules (P4); the index is the module's position in `modules.json`.

Modules touched, with sizes (P6, ~4,000):

| module | index, layer | lines now | next free id | after this fold (estimate) |
|---|---|---|---|---|
| strength | 44, L6 | 1,773 | R31 | ~1,950 |
| case-grammar | 54, L8 | 701 | R11 | ~900 |
| publication | 56, L8 | 3,643 own (4,361 with `publication/worker.mjs`, public-read's since K702) | R57 | ~3,750: **near the mark** |
| public-read | 57, L8 | 2,242 | R19 | ~3,300–3,600: **near the mark** (the complete edition's renderer is the unknown) |
| case-authoring | 61, L8 | 3,289 | R43 | ~3,500 |
| ratification | 60, L8 | 3,936 | (R39) | **no change proposed**: any growth passes the mark (K617) |
| corpus-export | 55, L8 | 348 | (R7) | no change (see Question 3) |

---

## 1. The public page's first line per finding, and the strength section's opening

**Ruled.** "(1) the public page: each finding opens with one line naming its role and the project's bar ("Relied on · meets this project's bar (capture B, connection C)"), never a bare "meets", then its two grades, then detail; the strength section opens "a case has two strengths, never one"" (DEC-112, response 4 (1); §5C "The public page").
**Owed.** "the public page's first line per finding and the strength section's opening (the redesign)".

### public-read (index 57, L8; 2,242 lines; next free id R19)

- **R19 (new)** `publishedCase` (R3) answers, for each member, `standing`, read from the signed document only: `{role, bar, meets}`. `role` is the member's role (`load_bearing` or `supporting`). `bar` is the bar the document records, per declared axis its grade, an undeclared axis null. `meets` is, for a load-bearing member, `true` when its frozen pair reaches the recorded bar on every declared axis, else `false` naming each axis it does not reach; for a supporting member, `not_asked` (supporting members are not held to the bar, `case-authoring` R6); with no bar recorded, `no_bar`. Beside it, `standing_line`: one sentence naming the role and the bar with its per-axis grades, never the word "meets" without the bar it is measured against. It composes no case-level strength (R11). (DEC-112 (4)(1); Publication §5C) *(not yet met: T24)*
- Uses: no new edge (`case-grammar`, `publication` already).

### Not folded here (the UX stream's)

- The page itself, the line's exact words, its order (line, two grades, detail) and the strength section's opening sentence are the redesign's: `legacy-ui`, Bob's UX (K633; manifest "Parallel work"). R19 gives the page its data; R21 below prints the sentence into the complete edition.

---

## 2. The complete edition

**Ruled.** "(2) the complete edition: a self-contained file anyone can read, check and use to recreate the case without CivicOS, no length limit, ordered so a reader can stop early, with the grading method and "How to check this case yourself", every page carrying the identifying notice; printing is incidental" (DEC-112 response 4 (2)); §5C lists its order: "the claims; each finding's chain down to the exact passages relied on, quoted with their location; every document with its fingerprint, origin and archived copy; what was searched; the declared bias; disclosed contradictions; the grading method, so a grade can be recomputed by hand; and "How to check this case yourself", in plain language. Every page carries the identifying notice (DEC-34)."
**Owed.** "the complete edition (a rendering inside the case file, closing DEC-41's import-only gap) with "How to check this case yourself" and the grading method".

### public-read (continued)

- **R21 (new)** `completeEditionOf(case, edition)` answers the complete edition of a ratified case edition: one file that opens with nothing installed and no network access, and that a reader can read, check and use to recreate the case without CivicOS. It has no length limit and nothing is left out for length. Its order: the claims; each finding, opening with R19's standing line, then its two grades with their plain meanings (DEC-82), then its chain down to the exact passages relied on, each quoted with its location; every document and observation the case rests on, with its fingerprint, origin and archived copy (one not included says so, `case-grammar` R12); what was searched; the declared bias (the lens section, `case-grammar` R9); disclosed contradictions (R3's `tensions`); the strength section, opening "a case has two strengths, never one" (the UX stream may re-word it); the grading method in plain words (`strength` R31), so a grade can be recomputed by hand; and "How to check this case yourself", in plain language. Every page carries the identifying notice: the case id, edition, authors, declared bias, both floors (the bar), the case document's hash and where to verify it (DEC-34; INVESTIGATIVE-SESSION, IS-8). The same case edition always gives the same bytes, so the file is verified by its SHA-256 recorded in the case file (R20). Every part is read from the published projection (R10, R16). (DEC-112 (4)(2); Publication §5C) *(not yet met: T24)*
- Uses gain `strength.gradingMethodText` (R31 there; 44 < 57).
- Suggestion: one HTML file with every style and image inline and no script is one way to meet "nothing installed"; its format is BOB's, at the START.

---

## 3. The case file, its published versioned specification, and parts

**Ruled.** "(3) the case file: the complete structured record in a published, versioned format rich and conformant enough that the results can be recreated: the complete edition, every document and observation a conclusion rests on (whole, with its extracted text), the findings' chains, attestations and signatures, and the version of the method and checks inside the signed case; split into parts, never trimmed; an open specification and a standalone open checker let anyone recreate a case without CivicOS" (response 4 (3)). §5C: "A large case file is split into parts, each fingerprinted, never trimmed. … Because the case file always carries the complete edition, no case file is "import-only" (DEC-41's gap is closed, not labelled)."
**Owed.** "the case file's published, versioned specification (documents and observations relied on, whole, with their extracted text; chains; attestations; signatures; parts when large)".

### case-grammar (index 54, L8; 701 lines; next free id R11)

R11 is item 4's. R12 is item 7's (the materials block, which this item's case file reads).

- **R13 (new)** `CASE_FILE_FORMAT` is `bio-case-file/1`. The case file's manifest names: the format; the case and edition; each part (a part is one file of the case file when it is split), its index and SHA-256; and, for every file it carries, its path, SHA-256, bytes and kind, one of `case_document`, `signature`, `complete_edition`, `finding` (a finding's published bytes: its questions, supports and passages), `document` (a captured document's bytes, whole), `extracted_text` (a document's extracted text), `observation` (an observation's text, whole), `attestation`. `caseFileManifestCheck(manifest)` answers every way a manifest departs from this, each named, or none; pure; never throws. It is the one spelling of the format for `public-read` R20, the standalone checker and import. (DEC-112 (4)(3); Publication §5C) *(not yet met: T24)*
- Uses: no new edge.
- The open, versioned specification (a document anyone reads) is Question 1.

### publication (index 56, L8; 3,643 own lines; next free id R57)

- **R57 (new)** At a case edition's commit (`commitCaseEdition`, R22), the published projection comes to hold, by SHA-256, the whole captured bytes and the extracted text of every document, and the whole text of every observation, that the case document's materials block (`case-grammar` R12) lists as included, so `public-read` can carry them in the case file from the published projection alone. Nothing is held for material listed as not included. Each is exempt from purge as published bytes are (R31). (DEC-112 (4)(3); Publication §5C: "today's container holds no rendering and no capture bytes") *(not yet met: T24)*
- Uses gain `extraction` (the readings' text; 31 < 56), unless the job finds the extracted text already reachable through a use it has (BOB's, at the START).

### public-read (continued)

- **R6 becomes:** The case file (`case-grammar` R13) is a stored (uncompressed) ZIP with fixed timestamps, the manifest at its root and each file under the root at its path; the same manifest and files give the same bytes. `assembleCaseFile(case, edition)` builds it once when a case edition's last member is published, recording its manifest through `publication`'s `recordCaseManifest` (`publication` R15), reached through its op as today. (Was "the container", `assembleCaseContainer`.) (DEC-112 (4)(3)) *(not yet met: T24)*
- **R20 (new)** The case file carries, from the published projection only: the signed case document and its signature; the complete edition (R21); each member's published bytes (its chain: questions, supports, passages); every included document whole with its extracted text, and every included observation whole (`publication` R57); the attestations and signatures each carries (item 7). When it would pass one part's bound, it is split into parts, each fingerprinted and listed in every part's manifest, and nothing is left out. (DEC-112 (4)(3); Publication §5C) *(not yet met: T24)*
- **R5 becomes:** … `CONTAINER_TOO_LARGE` (C-98.7) applies to one part; a case file is never refused for its size, it is split (R20). (rest unchanged) *(not yet met: T24)*
- **R3 gains:** For a document carrying them, the answer also carries its `method` and `materials` blocks (`case-grammar` R11, R12) as signed. *(not yet met: T24)*

---

## 4. The method and checks version inside the signed case document

**Ruled.** "the version of the method and checks inside the signed case" (response 4 (3)); §5C: "the version of the grading method and publication checks, carried inside the signed case document".
**Owed.** "the method and checks version moved inside the signed case document".

### strength (index 44, L6; 1,773 lines; next free id R31)

- **R31 (new)** `GRADING_METHOD_VERSION` names the grading arithmetic of R1–R5 and R29; it changes whenever any of them changes. `gradingMethodText(version)` answers that version's method in plain words, complete enough to recompute a grade by hand. Pure; never throws; an unknown version answers null. (DEC-112 (4)(2)(3)) *(not yet met: T24)*
- **R32 (new)** `recomputePair({legs, levels?, version})` answers the pair (R1–R5, R29) from the facts a case file states for one finding, reading nothing else: each leg with its target's recorded grade or answer, its axis, its source and its ground. It answers for every version this module has published; any other version is `UNKNOWN_METHOD_VERSION`. Pure; writes nothing; never throws. It is what the standalone checker and import recompute with (items 5, 8). (DEC-112 (4)(3)(6); Publication §5C "each grade recomputes the same by the stated method version") *(not yet met: T24)*

### case-grammar (continued)

- **R11 (new)** The case document's `method:` block, `{grading, checks}`: `grading` the grading method's version (`strength` R31), `checks` the catalogue version the document was checked under (`promotion`'s `CATALOG_VERSION`, its R34). `methodOf(fm)` reads it back; a document without it answers null. Pure; never throws. (DEC-112 (4)(3)) *(not yet met: T24)*
- R1 widened: the format carries R11's and R12's blocks (whether `/5` or a new `/6`: BOB's decisions, 3).

### case-authoring (index 61, L8; 3,289 lines; next free id R43)

- **R43 (new)** `publishCase` writes the `method:` block (`case-grammar` R11) with `strength`'s `GRADING_METHOD_VERSION` and `promotion`'s `CATALOG_VERSION` at the act, so the version is inside what the owner signs. (DEC-112 (4)(3)) *(not yet met: T24)*
- **R14 gains:** … the `method:` block (R43); the `materials:` block (R44, R46) … *(not yet met: T24)*
- Uses gain `promotion` (`CATALOG_VERSION`; 23 < 61). This reverses its "Decided by BOB" 5 ("not `promotion`"): BOB's decisions, 2.

---

## 5. The standalone open checker

**Ruled.** "an open specification and a standalone open checker let anyone recreate a case without CivicOS" (response 4 (3)); §5C "Import" lists what recreation checks: "signatures and fingerprints check; each passage is found where it is said to be; each grade recomputes the same by the stated method version; each relied-on finding meets the declared bar; the case passes the same publication checks."
**Owed.** "a standalone open checker".

No module holds it: Question 2. Its proposed interface, for the module Bob chooses:

- **(new)** `checkCaseFile({parts})` answers, per finding, `recreated`, `recreated_in_part` (naming each thing missing, for example a document to fetch) or `did_not_recreate` (naming each thing that differs), and for the case whether it passes the publication checks at the version it states. It checks: every signature (`signatures`); every file's and part's SHA-256 against the manifest (`case-grammar` R13); each passage found at its stated location in its document's extracted text (`text-chain`); each grade recomputed by `strength` R32 at the stated `grading` version; each load-bearing finding meeting the recorded bar; the case document passing `ratification`'s `checkCaseDocument` (its R8, pure). A document supplied later that matches its recorded fingerprint completes a finding recreated in part. It reads nothing but what it is given, writes nothing, never throws, and runs with no CivicOS copy. *(not yet met: T24)*

---

## 6. The publication refusal, and the warning's republication sentence

**Ruled.** "(4) everything a conclusion rests on must be presentable: publication is refused while a relied-on finding rests on material that cannot travel whole; material only under supporting findings may travel as fingerprint, origin and archived copy, labelled; the publishing warning says the case republishes these documents and that judging whether they may be republished is the group's" (response 4 (4)). §5C adds the remedies: "The group may find a presentable copy (often the public-record version), stop relying on the material, or move the finding to supporting."
**Owed.** "the publication refusal for relied-on material that cannot travel whole, and the warning's republication sentence".

### case-authoring (continued)

- **R44 (new)** `publishCase` refuses `RELIED_ON_NOT_PRESENTABLE` (C-120.8, a new row, `awaiting stamp`), before anything is written, when a load-bearing member rests on a document or observation this copy does not hold whole (its captured bytes and extracted text, or an observation's text), naming each member and each such document or observation. Its translation names the three remedies: find a presentable copy, stop relying on it, or make the finding supporting. A document or observation only supporting members rest on, and not held whole, is listed in the `materials:` block (`case-grammar` R12) with its fingerprint, origin and archived copy and `included: false`; it is never refused. (DEC-112 (4)(4); Publication §5C) *(not yet met: T24)*
- **R34 becomes:** … `blockers` lists every other refusal it can reach independently: R6, R12, R35, R44 and R31 … `steps` … what becomes permanent, which states that the case republishes in full every document it includes and that judging whether they may be republished, copyright included, is the group's (DEC-112 (4)(4); the words are the UX stream's, and until it gives them, that plain sentence); … (rest unchanged). *(not yet met: T24)*
- R29 gains C-120.8. Suggestions: the row's name and translation are BOB's.

### ratification (index 60, L8; 3,936 lines)

No change. The refusal is at preparation (R44) and in the pre-flight (R34); `op=caseratify` signs the document R44 let through, whose `materials:` block is signed. A second check at signing would push ratification past the mark (K617). BOB's decisions, 4.

---

## 7. Off-the-record material

**Ruled.** "(5) off-the-record sources: their material travels whole with its attestations (the attesting member's, the project's and the group's); only the identity is withheld, labelled "Withheld" with its reason; their grades recreate like any other" (response 4 (5)). §5C: "… and what of the source the group may publish (rule 7; the source's attribution level) … The unseen side of a disclosed contradiction is a disclosure, not a basis, and stays out (DEC-85)."
**Owed.** "off-the-record material carried with its attestations, the identity withheld".

### case-grammar (continued)

- **R12 (new)** The case document's `materials:` block, one row per document or observation any member rests on, `{ref, kind, sha, text_sha, origin, archived_copy, included, rests_under, identity, withheld_reason}`: `kind` `document` or `observation`; `included` true when it travels whole, false when only its fingerprint, origin and archived copy travel; `rests_under` `load_bearing` when any load-bearing member rests on it, else `supporting`; `identity` `shown` or `withheld`, and when `withheld`, `withheld_reason` the reason in words. `material_attestations:` holds one row per attestation, `{ref, by_kind, by, at, signature}`, `by_kind` one of `member`, `project`, `group`, `co_attestation` (flat rows, as R1's blocks, K549). `materialsOf(fm)` reads both back; a document without them answers null. Pure; never throws. (DEC-112 (4)(3)(5)) *(not yet met: T24)*

### case-authoring (continued)

- **R45 (new)** `publishCase` writes the `materials:` block (`case-grammar` R12) from the record at the act: every document and observation a member rests on, with its fingerprint, extracted text's fingerprint, origin and archived copy (`provenance.attestationsOf`), whether it is included (R44), and its attestations: the attesting member's (`capture.captureAccountsOf`, a firsthand observation's author as its attribution level allows, `publication` R17), any co-attestation (R35), and the project's and the group's (Ambiguity 2). A source's material travels whole like any other (R44 applies unchanged). (DEC-112 (4)(5)) *(not yet met: T24)*
- **R37 becomes:** For each capture whose `source` is a knocker or a hand-carried source, the `sources:` block states only what `sources.publishableAt({audience: "public"})` answers, with its basis. With nothing publishable it states the identity as `Withheld`, with its reason (that the source has not consented and no public record names them), and the receipt's digest and time; its material still travels whole (R44, R45). No authored field adds to it. (Was "an unnamed source".) (DEC-112 (4)(5)) *(not yet met: T24)*
- R33 (DEC-85, the unseen side stays out) is unchanged and binds R45: a side the publisher could not see is never listed in `materials:`.
- Grades of that material: `strength` R32 recomputes them from the recorded facts like any other; no change to `strength` R29 (anonymous testimony).

---

## 8. Import into a new read-only project, with recreation per finding and the importing group's bar

**Ruled.** "(6) import: a CivicOS copy imports a case file into a new, read-only project; the system confirms each finding by recreating it from the case file (Recreated; Recreated in part, naming what is missing; Did not recreate, naming what differs) and shows each against the importing group's own bar; recreating is not endorsing" (response 4 (6)); §5C: "a newer edition arrives beside the old, not over it … the source's bar never travels as the importer's (DEC-45)." Bob, response 2: "the system confirms the findings according to the structured case file."
**Owed.** "import into a new read-only project with recreation per finding (three results) and the importing group's bar".

No module holds it: Question 3. Its proposed interface:

- **(new)** `importCaseFile({parts, by, viewer})` (`op=caseimport`) refuses a machine `by`; refuses a case file whose manifest fails `case-grammar` R13; otherwise creates a new project, read-only to every member (nothing in it can be edited, promoted or published by this group), holding the case's findings and material as the case file states them, marked as another group's with that group's identity and the case and edition. A later edition of the same case arrives beside the earlier one, never over it. It then runs the checker (item 5) and records each finding's result. *(not yet met: T24)*
- **(new)** `importedCase({project, viewer})` answers each finding with its result (`recreated`, `recreated_in_part` with what is missing, `did_not_recreate` with what differs), the source's bar as the case states it (labelled the source's, never as this group's), and each finding against this group's own bar (`strength.strengthBarOf`, Ambiguity 3), and states that recreating shows the case intact and consistent, not true. *(not yet met: T24)*
- **(new)** A document fetched later that matches a missing document's recorded fingerprint is added and the finding re-checked; one that does not match is refused, naming the difference. *(not yet met: T24)*

---

## 9. Acceptance offered only on recreated findings

**Ruled.** "the group may accept an edition by its reasoned act only for findings recreated, or recreated in part with the gaps stated; an accepted finding may support the group's own work, marked as another group's" (response 4 (6)); §5C: "(DEC-96) … with the gaps stated in the acceptance".
**Owed.** "acceptance (DEC-96) offered only on recreated findings".

The acceptance acts are DEC-96's own owed fold, left out of T22 because "nothing brings another group's edition into this copy" (`next.md` H1, H6b, J4). Import (item 8) removes that reason, so DEC-96 joins this fold in the module Question 3 chooses. DEC-112's addition to it:

- **(new)** Accepting an imported edition is refused for a finding whose result is `did_not_recreate`, naming it; for a finding `recreated_in_part`, the acceptance must state each gap, else it is refused naming the gaps unstated. An accepted finding used in this group's own work is marked as another group's wherever it is shown (DEC-96's statement of acceptance). *(not yet met: T24)*

---

## 10. The UX page's question 30 marked ruled

The UX stream's own file (`docs/development/ux-substrate/`, manifest "Parallel work"). Nothing here.

---

## Order and `uses` edges

| edge | indices | |
|---|---|---|
| public-read → strength (R21) | 44 < 57 | new |
| publication → extraction (R57) | 31 < 56 | new, unless the job finds no need |
| case-authoring → promotion (R43) | 23 < 61 | new |
| case-authoring → strength, provenance, capture, sources, case-grammar, publication | all < 61 | existing |
| checker (Q2, option A at index 61) → record-grammar, signatures, text-chain, strength, case-grammar, ratification | 0, 4, 13, 44, 54, 60 | all earlier |
| import (Q3, option A at index 62) → record-core, membership, promotion, strength, case-grammar, ratification, the checker | 20, 21, 23, 44, 54, 60, 61 | all earlier |

New ops (`caseimport`, the imported-case read, acceptance's acts, a case-file read if one is added) take op-declarations specs, affordances entries and control-plane routes in L11, as in T22 (accepted red until L11).

---

## Questions for Bob (architecture: a new module carrying product capability)

**Q1. The open specification of the case file.** DEC-112 asks for "a published, versioned format" with "an open specification".
- (A) The machine part is `case-grammar` R13 (above); the readable specification is a document written beside it from those requirements and published with each format version. No new module.
- (B) A new canon document under `docs/architecture/`, Bob-approved like other canon.
- **Recommendation: A.** The format is a technical detail under Bob's ruling (P17), and one spelling in `case-grammar` keeps the plane, the checker and import from disagreeing. Bob approves only that it is published openly and versioned, which DEC-112 already rules.

**Q2. The standalone open checker (item 5).** It runs outside any CivicOS copy, so it is a separate deliverable, like `ocr-worker` or `installer`.
- (A) A new module `case-checker`, L8, immediately after `ratification` (new index 61; `case-authoring` and later shift by one), a standalone program built from the same pure code (`case-grammar`, `strength` R32, `ratification` R8, `signatures`, `text-chain`). Import (Q3) calls the same code, so CivicOS and anybody recreate one way.
- (B) Hosted in `case-grammar` (pure, ~700 lines): it would gain `signatures`, `text-chain`, `strength` uses, but cannot use `ratification` (later), so "passes the same publication checks" would be missing or copied.
- (C) Hosted in `public-read`: not standalone, and it is already near the mark after items 2–3.
- **Recommendation: A**, placed after `ratification` because the publication checks are `ratification`'s pure `checkCaseDocument`.

**Q3. Import with recreation (item 8) and acceptance (item 9, with DEC-96).**
- (A) A new module `case-import`, L8, immediately after the checker (new index 62), before `case-authoring`, holding import, the recreation results, the fetched-document completion and DEC-96's acts (accept, withdraw, flag, clear) gated as item 9 says. Before `case-authoring`, so `case-authoring` may later state in a case that a finding rests on another group's accepted work.
- (B) Two new modules: `case-import`, then `acceptance` after it. Cleaner if DEC-96's flag-and-clear grows; one more job per tranche.
- (C) Hosted in an existing module. `corpus-export` (index 55; its R3 verifies a working-corpus import) cannot: it comes before `ratification`, so it cannot run the publication checks, and its purpose is the group's own exit (Membership v2 §8). `ratification` cannot: 3,936 lines (K617).
- (D) A new layer for inter-group work after Publication (8): import and acceptance, with DEC-111's notices later. A change of layers, which is Bob's.
- **Recommendation: A**, splitting acceptance out later under K617 if it grows.

---

## BOB's decisions (lower-level, P17; for the ruling record)

1. Ids: strength R31–R32; case-grammar R11–R13; publication R57; public-read R19–R21, R3, R5 and R6 amended; case-authoring R43–R45, R14, R34 and R37 amended; row C-120.8. `assembleCaseContainer` renamed `assembleCaseFile` in R6 (callers: `ratification` R6, a wording change there, no meaning change).
2. Edges: public-read → strength; publication → extraction (conditional); case-authoring → promotion, reversing case-authoring's "Decided by BOB" 5.
3. Format: R11's and R12's blocks join `/5` if no `/5` document is stored on any deployed plane at the START, else `/6` (the T22 precedent, case-grammar's Suggestions).
4. The refusal sits at preparation and pre-flight (case-authoring R44, R34), not at signing, because `ratification` is at 3,936 lines. If BOB wants a signing-time check too, `ratification` is split first (K617).
5. The part bound for a split case file is R5's 64 MiB unless the START measures a better one.
6. `publication` R30 (a rendering verified by `pixels_sha256`, D-246) is about rendered captures, not the complete edition, which is verified by its own SHA-256 because the same case edition gives the same bytes (R21). R30 stays as it is.
7. Size: `public-read` (~3,300–3,600 after R20–R21) and `publication` (~3,750 after R57) are near the mark. Each job measures at its START and, if either would pass, BOB splits it first (K617; the complete edition's renderer is the natural seam in `public-read`).
8. The DEC-96 rows H1, H6b and J4 leave the "dependency not yet built" table of `next.md` once Q3 is answered.

## Ambiguities in the DEC text not resolved here

1. **"material that cannot travel whole".** Read as: this copy does not hold the whole captured bytes and extracted text (or an observation's text). It could also mean material the group may not lawfully republish, but the ruling puts "judging whether they may be republished (copyright included)" with the group, in the warning, not in a refusal. Bob to confirm.
2. **"the attesting member's, the project's and the group's" attestations.** The attesting member's is on record (capture accounts, co-attestation, the observation's author). No record holds a "project's" or "group's" attestation of a source's material today. Possible readings: the signatures on the case itself (the owner's, the group's key), or the trust level shown as an origin mark (DEC-92). R45 names them but cannot be met until Bob says which.
3. **"the importing group's own bar".** The importing project is new and has no bar. Read as the group default bar (`strength.strengthBarOf` with no project), and where the group has none, "no bar set". Bob to confirm.
4. **"a newer edition arrives beside the old"** with "a new, read-only project (DEC-46 (3))". It is unclear whether a later edition joins the same imported project or gets its own. DEC-46 (3) says "a new project per source lens". Read as: the same project per source case and lens, editions side by side.
5. **"by the stated method version"** for the publication checks. A copy whose catalogue has moved on may not hold the stated version's checks. R32 keeps every grading version. For checks, read as: run at the stated version where held, else at the copy's own version, saying which. Bob or BOB to confirm.
6. **"Withheld" with its reason.** Read as the source's own lack of consent or public record (`sources` R8), stated in words, never naming what was withheld.
