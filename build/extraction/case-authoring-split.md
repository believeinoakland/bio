<!-- Seam read for case-authoring (N529, K617, K1328), written for BOB #106 on 2026-10-03 on tranche/T28 by a worker. Uncommitted; BOB reviews it. -->
# case-authoring — split proposal (seam read)

**Status** · DRAFT for BOB #106, 2026-10-03, on `tranche/T28`, uncommitted. Why: case-authoring merged at 4,010 lines of its own code (K1328), past K617's mark. N529 (K1315) names the seam: the disclosures arms (R31–R37, R43–R54), whose newest code is already in `materials.mjs` and `accepted.mjs`. Read whole: every file under `bio-plane/src/case-authoring/` and `bio-plane/test/m/case-authoring/`, `build/requirements/case-authoring.md`, the module's `modules.json` entry, `build/requirements/README.md`, and `publication-split.md`, the model this draft follows. Also read: the importers of case-authoring (`review`, `affordances`, `control-plane/families.mjs`, `plane/store.mjs` and their tests), `membership`'s `MODULE_ORDER`, and promotion's row census.

**Answer.** The split holds, as two modules:
- **`case-disclosures`** (new, ~1,210 lines), placed **immediately before** `case-authoring`, after `case-import`.
- **`case-authoring`** (~2,940 lines).

`case-authoring` uses `case-disclosures`, and `case-disclosures` uses nothing of `case-authoring`. `case-disclosures` holds no table and no op, and it reads only stated read contracts. `materials.mjs` and `accepted.mjs` move whole. Three things the seam names cannot move, because they run `publishCase` or case-authoring's authority and member checks (§4): R32's `op=publishtensions`, R34's pre-flight, and R53, the ceremony's share of R51–R52.

## 1. The order (P4)

Layer 8 becomes: … `case-checker`, `case-import`, **`case-disclosures`**, `case-authoring`, `review`. No layer changes.

**Why before case-authoring, not after.** The disclosures are judged inside `#publishCase`, which runs them back to back after R6 (index.mjs 364–391). Their rows are then written into the document by `caseDocumentText`. So `case-authoring` calls the disclosures code. A module may use only earlier modules, so the disclosures module must come first.

**Why not earlier than that.** The moved code uses `case-import` (`acceptanceOf`, `openFlagsOn`, `importedCase`), which is index 67, so the new module can be no earlier than 68.

**No cycle.** Nothing that moves calls anything that stays. The judgments take `prepared` (the members as case-authoring R4 prepared them) and `memberRoles` (R5's partition) as arguments, and never call back into case-authoring.

## 2. Every file, its lines, and where it goes

| file | lines | goes to |
| --- | --- | --- |
| `src/case-authoring/index.mjs` | 2,552 | split. ~512 move (below). ~2,030 stay. |
| `src/case-authoring/document.mjs` | 813 | lines 39–165 (R35–R37 and R43–R52 bodies: `SELF_ATTESTED_SENTENCE`, `captureBodyLines`, `attesterWords`, `carriesBodyLines`, `acceptedBodyLines`) and 176–301 (the tensions: `TENSION_TEMPLATES`, `HIGHLIGHT_SENTENCE`, `NOT_SHOWN_WORDS`, `TENSIONS_DEPTH_STATED`, `tensionSide`, `tensionTemplate`, `tensionSentence`, `tensionsUnreadStated`, `tensionFrontmatterLines`, `tensionBodyLines`) go to `case-disclosures/document.mjs`. That is 249 lines, less `CEREMONY_HIGHLIGHT_SENTENCE` (193–196), which stays with R32. ~566 stay. |
| `src/case-authoring/checks.mjs` | 227 | 134–227 (`CASE_DISCLOSURE_CHECKS`, C-120.1–.8 and .10–.13) go to `case-disclosures/checks.mjs`. 1–133 stay. |
| `src/case-authoring/materials.mjs` | 123 | moves whole (`chainsOf`, `materialHeld`, `materialRows`). |
| `src/case-authoring/accepted.mjs` | 85 | moves whole (`flagsListed`, `flagsJudged`, `acceptedWorkRow`, `FLAG_SENTENCE`, `FLAGS_SAY`). |
| `src/case-authoring/searched.mjs` | 149 | stays. |
| `src/case-authoring/schema.mjs` | 61 | stays (both tables are case-authoring's). |
| **total** | **4,010** | |
| `test/m/case-authoring/*` (16 files) | 3,961 | all stay (§6). |

**What moves out of `index.mjs`.** Each private method becomes a public method of the `CaseDisclosures` class with the same body, minus its `#`.

| range | method | lines | requirement |
| --- | --- | --- | --- |
| 1108–1129 | `#hunchDebt` | 22 | R12 (see decision D1) |
| 1131–1164 | `#tensionsJudged` | 34 | R31 |
| 1166–1212 | `#restingCaptures` | 47 | R35 |
| 1214–1241 | `#captureFacts` | 28 | R35, R36 |
| 1243–1311 | `#selfAttestedJudged` | 69 | R35 |
| 1313–1352 | `#materialsJudged` | 40 | R44–R46, R50 |
| 1354–1381 | `#findingFacts` | 28 | R54 |
| 1383–1387 | `#withheld` | 5 | R46, R48 |
| 1389–1434 | `#acceptedWorkJudged` | 46 | R51 |
| 1436–1476 | `#flagsJudged` | 41 | R52 |
| 1478–1512 | `#sourcesStated` | 35 | R37 |
| 1514–1541 | `#disclosuresListed` | 28 | R31 |
| 1543–1576 | `#tensionsRead` | 34 | R31, R32 |
| 1578–1586 | `#undetermined` | 9 | C-120.3 |
| 1588–1593 | `#namedInRefusal` | 6 | R31, R33 |
| 659–695, 698–700 | the block assembly in `#publishCase` (`captureRows`, `factsOf`, `group`, `materialRows(…)` with its four callbacks, `flagRows`), which becomes `disclosureBlocks(…)` | 40 | R36, R45, R48, R52 |
| 153, 181–191 | `disclosureRefusal`, and the getters `contradiction` … `caseImport` | ~10 | |

Moved total: ~522 lines.

**New code.** `case-disclosures/index.mjs` needs ~115 new lines:
- a header;
- the imports;
- its own copies of `COMPLETENESS_MAX` and `SEARCHED_CHUNK` (K57);
- `refusal`, `#rows`, `#one` and `#liveText`;
- the lazy getters;
- `methodOf()` (R43);
- `caseDisclosuresOf(host, deps)`.

`case-authoring` gains ~15 lines:
- a `disclosures` getter, `caseDisclosuresOf(host)`;
- the import;
- re-exports of the moved public names (§5);
- a one-line pass-through `get attestation()` (§5).

## 3. Which ids move

Moved ids follow publication-split: each is renumbered in the new module with its old id named on it, and retired here as moved. Meaning does not change. A moved requirement is restated at the new module's interface, as the service `publishCase` asks. Case-authoring's new **R55** states the order in which `publishCase` asks the services and that it writes their rows.

| case-authoring | → case-disclosures | what |
| --- | --- | --- |
| R31 | R1 | tensions disclosed |
| R35 | R2 | grade, co-attestation, self-attested acknowledgement |
| R36 | R3 | the self-attested mark and sentence |
| R37 | R4 | what may be said of a source |
| R43 | R5 | the `method:` block |
| R44 | R6 | relied-on material held whole |
| R45 | R7 | `materials:` and `material_attestations:` |
| R46 | R8 | terms |
| R47 | R9 | off-the-record material presentable |
| R48 | R10 | an off-the-record capture's attribution and attestation |
| R49 | R11 | named members' captures, unchanged |
| R50 | R12 | a chain stops at another group's finding |
| R51 | R13 | accepted work |
| R52 | R14 | open flags |
| R54 | R15 | `grading_facts:` and `passages:` |
| R12 | R16 | hunch debt (D1) |
| R29's C-120 share | R22 | the rows, ids and translations unchanged |

**Copied:** R33 → R17, R26 → R18, R24 → R19, R22 → R20, R30 → R21.

**New in case-disclosures:** R23 (the seam: synchronous, never throws, owns no table).

**Stay in case-authoring:**
- **R32** (`op=publishtensions`). It runs R2's authority and R4's member checks (`#authority`, `#judgeMembers`), then calls `tensionsRead`.
- **R34** (the pre-flight). It runs `#publishCase`.
- **R53** (the ceremony).
- **R33**, also copied.

Each is re-pointed to the new ids.

## 4. Services and calls across the seam

**`case-disclosures` provides** (each was a private method; its body is unchanged):
- `hunchDebt(prepared)`;
- `tensionsJudged(prepared, viewer, tensionsDisclosed)`, `tensionsRead(prepared, viewer)`, `tensionsUndetermined(failed)`;
- `restingCaptures(prepared)`, `captureFacts(sha)`, `selfAttestedJudged(resting, facts, memberRoles, selfAttested)`;
- `materialsJudged(prepared, memberRoles, viewer)`;
- `acceptedWorkJudged(refs, viewer)`, `flagsJudged(editions, flagsDisclosed)`;
- `sourcesStated(shas, viewer)`, `withheldOf(sourceRows)`;
- `findingFacts(findings, viewer)`;
- `methodOf()`;
- `disclosureBlocks({resting, facts, selfAttested, reached, flags, withheld, attributionOf, project, author, at})`, which answers `{captures, materials, flags, group}`;
- the renderers `tensionFrontmatterLines`, `tensionBodyLines`, `tensionSentence`, `captureBodyLines`, `carriesBodyLines`, `acceptedBodyLines`;
- the constants `SELF_ATTESTED_SENTENCE`, `TENSION_TEMPLATES`, `HIGHLIGHT_SENTENCE`, `NOT_SHOWN_WORDS`, `TENSIONS_DEPTH_STATED`, `FLAG_SENTENCE`, `FLAGS_SAY` and `CASE_DISCLOSURE_CHECKS`;
- the helpers `tensionSide`, `chainsOf`, `materialHeld`, `materialRows`, `flagsListed`, `acceptedWorkRow`.

**`case-authoring` then uses them as follows:**
- **`#publishCase`** calls `hunchDebt`, `tensionsJudged`, `restingCaptures`, `captureFacts`, `selfAttestedJudged`, `materialsJudged`, `acceptedWorkJudged` and `flagsJudged`, in today's order, answering the first refusal of each.
- **After R11, still in `#publishCase`:** it calls `sourcesStated` and `withheldOf`. It then calls `publication.attributionStatements` itself (R14's attribution run, which stays), then `findingFacts`, `disclosureBlocks` and `methodOf`.
- **The pre-flight (R34)** calls the same judgments.
- **R32** calls `tensionsRead`, and calls `tensionsUndetermined` when its own read throws.
- **`document.mjs`** imports the six renderers and `FLAG_SENTENCE`, and `caseDocumentText`'s arguments do not change.

**Bytes.** The renderers are copied unchanged, and `caseDocumentText` calls them in the same order. So the signed document is byte-identical before and after the split.

**What case-disclosures reads, all under stated contracts:**
- record-core R37's `bundles`;
- inquiry R40's `inquiry_basis`;
- content R45's `content`;
- provenance R48's `register` and `captured_locators`.

It calls:
- `contradiction.unresolvedRecordOn`;
- `provenance.captureGrade`;
- `attestation.attestationsOf`;
- `capture.lateAttestationsOf` and `captureAccountsOf`;
- `sources.sourceOf` and `publishableAt`;
- `extraction.unitsOf`;
- `strength.gradingFacts`, plus its constants `DEPTH_BOUND` and `GRADING_METHOD_VERSION`;
- `promotion.fact("producingGroup")` and `CATALOG_VERSION`;
- `case-import.acceptanceOf`, `openFlagsOn` and `importedCase`;
- `inquiry.basisFor` (for R16);
- `membership.viewerPredicate`;
- `record.readFile`.

From the grammars and publication it takes `parseImportedFindingRef`, `case-grammar`'s `extractedTextOf`, `sourceRowWithheld`, `fmSafe`, `pairLine` and `ANONYMOUS_ATTESTATION_LEVELS`, and `publication`'s `sourceStatement` and `unnamedSourceStatement`.

Its only write is the source id that `sources.sourceOf` mints, inside the caller's transaction, as today.

**`modules.json` (for the fold):**

```
{"id": "case-disclosures", "layer": 8, "paths": ["bio-plane/src/case-disclosures/"],
 "tests": ["bio-plane/test/m/case-disclosures/"],
 "uses": ["record-grammar", "record-core", "membership", "promotion", "provenance", "attestation", "capture", "sources",
          "extraction", "content", "inquiry-grammar", "inquiry", "strength", "contradiction", "case-grammar", "publication",
          "case-import"]},
{"id": "case-authoring", … "uses": today's, less "contradiction", "attestation", "capture", "sources", "promotion",
 "case-import", "inquiry-grammar", plus "case-disclosures"}
```

Case-authoring keeps `extraction` (the `readings` contract, R16, R17) and `provenance` (`register` and `captured_locators`, R16, R17).

**Test fixture.** Each module's tests may import only the modules it uses. So case-disclosures' tests may import `ratification` (index 65) for a copied fixture, but never `case-authoring`.

## 5. Users of case-authoring, and what changes for each

| user | calls | change |
| --- | --- | --- |
| `review` (L8) | `caseAuthoringOf`, `publishCase`, `statementAcknowledgements` | none |
| `affordances` (L11) | `SELF_ATTESTED_SENTENCE` (via `index.mjs`) | none: case-authoring re-exports it from case-disclosures, the way publication re-exports case-grammar. Optional later: import it directly, which needs a `case-disclosures` edge. |
| `control-plane` (L11) | `families.mjs` imports `case-authoring/checks.mjs` | **entry:** `CHECK_FAMILY_FILES` gains `src/case-disclosures/checks.mjs` directly before case-authoring's. Its family-walk test is red from case-disclosures' merge until then (the N512 precedent). |
| `plane` (L11) | `caseAuthoringOf(ctx, {attestation})` (store.mjs 156); `split.test` reads `caseAuthoringOf(x.ctx).attestation`; `caseAuthoringOps` | none required: case-authoring keeps a one-line `get attestation() { return this.disclosures.attestation; }` (K625's named-copy pattern). **Entry, carried:** plane re-points line 156 to `caseDisclosuresOf(ctx, {attestation})`, and its test likewise. Case-authoring's next job then drops the pass-through. |
| tests of `review`, `affordances`, `control-plane`, `plane` | `caseAuthoringOps`, `CASE_DISCLOSURE_CHECKS`, `SELF_ATTESTED_SENTENCE`, the case-authoring fixture | none: re-exports are kept, and the fixture changes inside case-authoring's own job |

**Other entries the split makes:**
- **`membership` (L2):** `MODULE_ORDER` gains `"case-disclosures"` before `"case-authoring"`. Its R83 test holds the list equal to `modules.json`, so it is red from the fold until membership's job runs.
- **`promotion`:** the `where`s of C-120.1–C-120.7 change (to `src/case-disclosures/index.mjs <method> > <region>`), which moves the stamped row census (1.57.0). They join the C-120.8 and .10–.13 rows already awaiting stamp (red 2), stamped together. Code, condition and translation do not move.
- **Fold wording, BOB's, no meaning change.** These cross-references are re-pointed to the new ids:
  - `affordances` R28 (R36 → R3);
  - `capture` R69 (R36);
  - `case-grammar` R1 (R36), R14 (R37), R17 (R44, R45);
  - `case-import` R8 and R9 (R51, R52);
  - `op-declarations` (R52);
  - `public-read` R3 (R31);
  - `publication` R60 (R46, R48) and its Satisfies (R37);
  - `ratification` R35 (R46) and its Satisfies (R44);
  - `strength` R5 (R12);
  - `sources`' Callers (R37).

## 6. Tests

None of the 16 test files moves. Nearly every arm drives `op=publish`, `op=publishpreflight` or `op=publishtensions` through the fixture's `w.publish`. Moved into case-disclosures, they would use a later module. They stay in case-authoring as end-to-end proofs of R55 and R14.

The arms to re-tag are in `tensions`, `carries`, `rests` and `imported`, plus the R35–R37 and R12 arms of `preflight` and `members`. Their tags change from the retired ids to R55 (with R14 for the blocks).

**The fixture** (`fixture.mjs` 246–249) builds `caseDisclosuresOf(host, {contradiction, provenance, attestation, capture, sources, extraction, caseImport, …})` first and passes the rest to `caseAuthoringOf`. Both factories are one instance per host, so case-authoring's lazy getter finds that same instance.

**`case-disclosures`' job writes its own interface tests**, R1–R23, over its services and renderers. It uses a fixture copied from case-authoring's, without `caseAuthoringOf`. The arms port from the files above, called directly on the services rather than through `w.publish`. Also: a byte-identity arm (a document rendered from fixed rows equals the pre-split bytes), and C-120's rows from its own `checks.mjs` with their new `where`s.

## 7. Line counts after the split

| module | files | lines |
| --- | --- | --- |
| `case-disclosures` | `index.mjs` ~630, `document.mjs` ~265, `checks.mjs` ~105, `materials.mjs` 123, `accepted.mjs` 85 | **~1,210** |
| `case-authoring` | `index.mjs` ~2,030, `document.mjs` ~566, `checks.mjs` ~133, `searched.mjs` 149, `schema.mjs` 61 | **~2,940** |

That leaves ~1,060 of headroom under the mark. Each count is ±50 until the jobs measure.

## 8. Copy, then delete (K624 (1))

1. **The fold (BOB).** Write the new `modules.json` entry, the requirements in Appendix A and the edits in Appendix B, and the cross-reference wording (§5).
2. **`membership` (L2).** Add the `MODULE_ORDER` line.
3. **`case-disclosures` (L8, first, merging early).**
   - Copy the ranges in §2 into `src/case-disclosures/`. `materials.mjs` and `accepted.mjs` are copied byte for byte, except their header comment and one import.
   - Copy the C-120 family into its own `checks.mjs`, with its `where`s re-pointed.
   - Write the factory and its tests.
   - Do not edit case-authoring's paths. The same code is held twice only within this tranche.
4. **`case-authoring` (L8, after case-disclosures merges).**
   - Delete every moved range, `materials.mjs`, `accepted.mjs`, the C-120 family and the moved renderers.
   - Call the services, and add the getter, the re-exports and the pass-through.
   - Edit the fixture and re-tag the tests.
5. **`control-plane` (L11).** Add `CHECK_FAMILY_FILES`.
6. **`plane` (L11).** Re-point, optionally (§5).
7. **`promotion`.** The next stamp takes the census.

## 9. Risks

1. **The signed bytes.** If a renderer is moved with any change, or the call order in `caseDocumentText` shifts, every new document's hash changes. Case-grammar's readers, publication R57 and case-checker would then each read a different document from the one an earlier test pinned. *Mitigation:* copy the renderers unchanged, add a byte-identity arm, and keep case-authoring's block tests green.
2. **Evaluation order.** `#publishCase` must still stop at the first refusing step, in today's order: R12, R31, R35, R44, R51, R52, then R7 onward. The source read in R37 mints ids, so it must stay after the last refusal (R11). Do not fold the steps into one composite call that reads everything before refusing.
3. **Reds between merges, each accepted:**
   - membership's R83 test, from the fold to L2;
   - control-plane's family walk, from case-disclosures' merge to L11;
   - promotion's census, until the stamp.

   K529's rule holds while the C-120 family exists twice: one family, and a code is not held twice once case-authoring deletes its copy.
4. **The `where` region check.** Each DEC-49 region in the moved methods must keep its marker text. The new `where`s name public methods, without `#`.
5. **A stray dependency.** If case-authoring keeps any getter or import for a moved dependency, its `uses` edge drops only on paper. The ownership and architecture checks at case-authoring's job catch this.
6. **Headroom.** case-disclosures starts at ~1,210 lines. The next disclosures entries (UX wording for the plain sentences, or DEC-112 follow-ups) land there, not in case-authoring.

## Decisions for BOB

- **D1. R12 (hunch debt, C-120.7).** *Recommended:* move it as case-disclosures R16, so the C-120 family moves whole. *Alternative:* keep it in case-authoring and hold C-120.7 in case-authoring's table, the family split across two modules as C-44 is. That saves 22 lines of move but leaves a family raised from two modules.
- **D2. R32, R34 and R53 stay in case-authoring.** This is forced (§3). The seam BOB named included R32, so the change is to be recorded.
- **D3. Tests.** The end-to-end arms stay in case-authoring under R55. case-disclosures' job writes new interface tests (§6).
- **D4. The name `case-disclosures`.**

---

## Appendix A — `build/requirements/case-disclosures.md` (full text)

```markdown
# case-disclosures — requirements

**Status** · DRAFT by a worker for BOB #106, 2026-10-03, on `tranche/T28`, for BOB's review; split from `case-authoring` by K617 and N529 (seam read `build/extraction/case-authoring-split.md`: a module whose code passes about 4,000 lines is split before its next job, along seams BOB names, with no change to any requirement's meaning). R1–R15 are `case-authoring` R31, R35, R36, R37, R43, R44, R45, R46, R47, R48, R49, R50, R51, R52 and R54, and R16 is its R12, each restated at this module's interface as the service `publishCase` asks (`case-authoring` R55), meaning unchanged; the old id is named on each, and `case-authoring` retires each as moved. R17–R21 are copies of `case-authoring` R33, R26, R24, R22 and R30, which hold here as there. R22 holds the C-120 family, moved with its ids, codes and translations (`case-authoring` R29's share); only the `where`s change. R23 states the seam. Layer 8, after `case-import`, before `case-authoring`. No `from`. Its code is taken by copy (K624 (1)) from `case-authoring/index.mjs` (1108–1129, 1131–1593, and `#publishCase`'s block assembly 659–700), `checks.mjs` 134–227, `document.mjs` 39–165 and 176–301 (less `CEREMONY_HIGHLIGHT_SENTENCE`), and `materials.mjs` and `accepted.mjs` whole; `case-authoring`'s job, after this one merges, deletes its copies. Not yet met: every id, until this module's job; rows C-120.8 and C-120.10–C-120.13 await stamp, and C-120.1–C-120.7's new `where`s join that stamp.

**Size (P6).** About 1,210 lines.

## Public

### Purpose

What a case discloses about what it rests on, judged and written before anything is signed (Publication §3 rule 16, §5C; DEC-76 item 4, DEC-81, DEC-96 item 4, DEC-112, DEC-119). That covers:
- the unresolved conflicts on its findings;
- each document's grade and co-attestation, and the owner's acknowledgement of a self-attested one;
- what may be said of a source;
- every document and observation a finding's chain reaches, with what this copy holds whole and who attests it;
- the method the case is signed under;
- another group's work it rests on, with its acceptance and open flags;
- each reached finding's grading facts and passages;
- hunch debt.

This module judges each against the owner's lists and the record at the act, and answers refusals and rows. It also spells each disclosure's lines in the case document. `case-authoring`'s `publishCase` asks it in order and writes what it answers (its R55). It holds no table and no op.

### Provides

**Terms.** Terms are `case-authoring`'s and `publication`'s.
- `prepared` is case-authoring R4's list, each member `{id, bundleSha, …}`.
- `memberRoles` is its R5 partition, `[{target, role}]`.
- `viewer` is the control plane's stamp.

**Refusals.** Every refusal names `reason`. One with a catalogue row carries its `check`, `code` and `translation`. A malformed owner's list is `BAD_COMPLETENESS` naming the field: a list that is not one; an entry that is not an object naming its key; or words that are not a string, are over 2,000 characters, or hold a double quote, a backslash or a line break.

**Judgments.** Each judgment answers `{refusals, …}`, its refusals in the order stated. `publishCase` answers the first; the pre-flight (`case-authoring` R34) lists all.

#### Tensions (N345; DEC-76 item 4, DEC-84 items 11–13, DEC-85)

- **R1** (was `case-authoring` R31)
  - **The read.** `tensionsRead(prepared, viewer)` reads `contradiction.unresolvedRecordOn({finding, sha, viewer})` (its R29) for each member at its `bundleSha`. It answers one entry per candidate and member, with each side as `tensionSide` states it, and `unread`: per member, the count of document legs with no content row, which are stated and never filled.
  - **Read failure.** A read that fails, throws or is `truncated` is `TENSIONS_UNDETERMINED` (C-120.3), naming each finding and why. `tensionsUndetermined(failed)` is the same refusal, for a caller's own failed read.
  - **The judgment.** `tensionsJudged(prepared, viewer, tensionsDisclosed)` takes `tensionsDisclosed: [{candidate, words?}]` (absent is none; a candidate listed twice is disclosed once, its first words kept). It answers `{refusals, entries, unread, byCandidate}`. Its refusals are:
    - a malformed list, or C-120.3, alone;
    - else `TENSION_NOT_DISCLOSED` (C-120.1), naming each candidate the read answers that the list does not name; one with a side the owner may not see is named by its candidate and finding, with the words "in conflict with a record not shown", and nothing of that side;
    - then `DISCLOSURE_NOT_STANDING` (C-120.2), for listed candidates the read does not answer.

    It never refuses because a contradiction exists.
  - **The section.** `tensionFrontmatterLines(tensions, unread)` and `tensionBodyLines(tensions, unread)` write the section. Each entry gives:
    - the finding;
    - both sides verbatim, with source, date and doctype;
    - its state and explanation;
    - the owner's words marked as the owner's;
    - `acknowledged_by` (the `author` stamp) and the instant;
    - the sentence that the disclosure reaches one level (`TENSIONS_DEPTH_STATED`).
  - **Each member's block.** `tensionSentence(t)` gives the member block one sentence per tension, from the fixed `TENSION_TEMPLATES`:
    - "In tension, not yet resolved: …";
    - "Explained, not yet shown: …";
    - "Held irreconcilable by the group: …";
    - "Rests on a side in conflict with a record not shown: …".
  - **The highlight** (DEC-85). A candidate answered `unseen_other_side: true` is highlighted:
    - its entry carries the seen side only, with `HIGHLIGHT_SENTENCE` ("This finding rests on a side in conflict with a record not shown here. The record and who holds it are not named.");
    - its member's block carries the last template, not its state's own sentence.

#### Each document's grade and co-attestation, and its source (N364; DEC-81 items 1 and 3, DEC-78 item 5)

- **R2** (was `case-authoring` R35)
  - **The captures.** `restingCaptures(prepared)` answers `[{member, capture}]`, one level deep: each document leg's content-row capture, else every capture its target registers. An inquiry leg names none. The list is in member order, then leg order, each pair once.
  - **One capture's facts.** `captureFacts(sha)` answers:
    - the capture's grade (`provenance.captureGrade`);
    - `co_attested`, true only with both a timestamp and a co-archive: from `attestation.attestationsOf` (its R7), else a late one that succeeded (`capture.lateAttestationsOf`), stated `late`;
    - its signed accounts (`capture.captureAccountsOf`).

    It never throws: a failed read states less.
  - **The judgment.** `selfAttestedJudged(resting, facts, memberRoles, selfAttested)` takes `selfAttested: [{capture, reason}]` and answers `{refusals, byCapture}`. Its refusals, in order:
    - `CO_ATTESTATION_UNACKNOWLEDGED` (C-120.4), naming each load-bearing Grade B capture that is not co-attested and not listed;
    - `SELF_ATTESTED_NO_REASON` (C-120.5), for a listed capture with an empty reason;
    - `SELF_ATTESTATION_NOT_STANDING` (C-120.6), for a listed capture that is co-attested or not in the case.

    The case is never refused because a capture is not co-attested.
- **R3** (was `case-authoring` R36) An acknowledged capture's rows, in `disclosureBlocks`' `captures`, are marked `self_attested_only: true` with `{reason, acknowledged_by, at, sentence}`, and carry its signed accounts on its first row. `captureBodyLines(captures, sources)` prints the fixed `SELF_ATTESTED_SENTENCE`: "Without co-attestation an outsider can verify the copy has not changed since capture and can follow the reasoning, but cannot independently verify that the source served those bytes, or when."
- **R4** (was `case-authoring` R37)
  - **The rows.** `sourcesStated(shas, viewer)` answers rows `{capture, stated, basis}`, each statement once. For each capture whose source is a knocker or a hand-carried source (`sources.sourceOf`), they state only what `sources.publishableAt({audience: "public"})` answers, with its basis, spelled by `publication.sourceStatement`.
  - **Withheld.** With no `name` entry publishable, the row states the identity "Withheld" with its reason (the source has not consented to being named, and no public record names them), and the receipt's digest and time, in `publication`'s `unnamedSourceStatement`, the one spelling (K1315 (8)). It never states what was withheld. No authored field adds to it. A source read that fails states the Withheld row.
  - **Off-the-record.** `withheldOf(rows)` is the set of off-the-record captures, read by `case-grammar.sourceRowWithheld`.

#### What the case carries, and what it may rest on (DEC-112; DEC-119)

- **R5** (was `case-authoring` R43) `methodOf()` answers `{grading: strength.GRADING_METHOD_VERSION, checks: promotion.CATALOG_VERSION}` at the call, written by `case-grammar`'s `methodBlockLines` (its R11) and `carriesBodyLines`, so the version is inside what the owner signs.
- **R6** (was `case-authoring` R44) `materialsJudged(prepared, memberRoles, viewer)` follows each member's chain (R8; `chainsOf`) and answers `{refusals, materials, refs, findings}`:
  - **What is held.** Each material carries what this copy holds of it (`materialHeld`: the captured bytes and extracted text, or an observation's text), and `included` when whole.
  - **The refusal.** `RELIED_ON_NOT_PRESENTABLE` (C-120.8) names each load-bearing member and each material its chain reaches that is not held whole.
  - **Supporting only.** Material only supporting members reach, and not held whole, is listed `included: false` and never refused.
- **R7** (was `case-authoring` R45) `disclosureBlocks(…)` answers the `materials:` and `material_attestations:` rows (`case-grammar` R12) for every material R6 answered, with:
  - its fingerprint, its extracted text's fingerprint, its origin and archived copy;
  - whether it is included;
  - its attestations:
    - the attesting member's (as R10 states them);
    - its co-attestation (R2);
    - the project's (the register row holding it, `provenance` R48);
    - the group's (one row whose signature is the case's own).

  No table and no act holds the project's or the group's attestation. A side the publisher could not see is never listed (R17).
- **R8** (was `case-authoring` R46) Terms for R6–R12.
  - **Off-the-record.** A capture is off-the-record when its `source` is a knocker or a hand-carried source and R4 states its identity "Withheld".
  - **Attesting member.** Its attesting member is the capture's `actor` (`acquisition` R16; for a pulled knock, the member who pulled it, `capture` R65).
  - **Reaches.** A chain reaches what its legs target, followed through inquiry legs to `strength`'s depth bound (its R2), as the viewer sees the record.
- **R9** (was `case-authoring` R47) Off-the-record material is presentable like any other: R6 and R7 apply unchanged, and nothing here refuses because material is off-the-record. Its grade is the capture's grade as recorded (`provenance` R51).
- **R10** (was `case-authoring` R48) For each off-the-record capture a chain reaches, the attesting member's `material_attestations:` row states them at the level in force for that capture (`publication` R60), read from the attribution rows the caller passes (`attributionOf`, `publication.attributionStatements`).
  - At `cover` or `name`, the row carries their handle and signature.
  - At `group`, `project` or no level yet, it carries the account's text only (`capture.captureAccountsOf`), never their handle, key or signature, in `disclosureBlocks`' `captures` too.
  - An off-the-record capture's origin is not stated.
- **R11** (was `case-authoring` R49) A capture a named member made, including a load-bearing self-attested Grade B capture, is governed by R2 and R3, unchanged. Testimony and off-the-record material credited at the group or project level are governed by `strength` R29 and `ratification` R35.

#### Another group's work this case rests on (DEC-96 item 4; N522)

- **R12** (was `case-authoring` R50) A chain stops at a leg on an imported finding reference (`inquiry-grammar` R11). That leg is answered in R6's `refs`, and R6, R7 and R10 do not follow past it.
- **R13** (was `case-authoring` R51) `acceptedWorkJudged(refs, viewer)` reads, for each ref leg, `case-import.acceptanceOf` and `importedCase` at the leg's `target_edition` (from the inquiry's own `bundle.md` `basis[ord]`). It answers `{refusals, rows, editions}`.
  - **The rows.** `rows` are `accepted_work:` rows (`case-grammar` R16): who accepted which edition, when and why, the recreation result and the gaps stated; `checked` stays inside the group.
  - **The refusal.** A leg with no acceptance in force is `ACCEPTED_WORK_NOT_IN_FORCE` (C-120.10), naming the member, the leg, and the source case and edition.
- **R14** (was `case-authoring` R52) `flagsJudged(editions, flagsDisclosed)` reads `case-import.openFlagsOn` for each edition R13 names, against `flagsDisclosed: [{flag, words?}]`. It answers `{refusals, open, byFlag}`.
  - **Refusals.**
    - A failed or incomplete read is `FLAGS_UNDETERMINED` (C-120.12), alone.
    - Else an open flag not listed is `FLAG_NOT_DISCLOSED` (C-120.11), naming each.
    - A listed flag not open is `FLAG_DISCLOSURE_NOT_STANDING` (C-120.13).
    - It never refuses because a flag is open.
  - **Rows and sentences.** `disclosureBlocks`' `flags` rows carry the issue, when it was flagged, the owner's words, `acknowledged_by` (the `author` stamp) and the instant. The flagging member is not named.
    - The member block's sentence is `FLAG_SENTENCE`.
    - The ceremony's words are `FLAGS_SAY`.
    - Both are plain sentences until the UX stream gives the words.

#### Grading facts and passages (DEC-112 (3); K1315)

- **R15** (was `case-authoring` R54) `findingFacts(findings, viewer)` answers the `grading_facts:` and `passages:` rows (`case-grammar` R17) for each finding R6 reached:
  - `strength.gradingFacts({inquiry, levels: null, viewer})` (its R35), one row per leg `{finding, ord, …}`;
  - one passage row per leg naming a content row, `{finding, ord, content_id, capture_sha, extent, chain, quoted}`, with `quoted` the extracted unit's text at that extent, or null where none is held.

  A finding `gradingFacts` refuses contributes no row, and is answered in `unread`.

#### Hunch debt (Publication §3 rule 4; DEC-20)

- **R16** (was `case-authoring` R12) `hunchDebt(prepared)` answers `UNCLEARED_HUNCH` (C-120.7), naming each member, leg and target whose live basis (`inquiry.basisFor`) carries a leg whose grade source is `hunch`, or null. It is asked of every member, load-bearing or supporting.

## Private

### Uses

- `record-grammar`: `parseFrontmatter`, `normalizeType`, `canonicalJson`, `createSha256`, `EARNED_CAPTURE_CEILING` (R2, R6, R15).
- `record-core`: `recordOf` (`readFile`); the `bundles` read contract (its R37; R6, R8).
- `membership`: `viewerPredicate` (R6, R8: sight at the act).
- `promotion`: `CATALOG_VERSION` (R5); the fact `producingGroup` (R7's group row).
- `provenance`: `captureGrade` (its R24–R27, R51; R2); the `register` and `captured_locators` read contracts (its R48; R2, R6, R7).
- `attestation`: `attestationsOf` (its R7; R2, R7).
- `capture`: `lateAttestationsOf`, `captureAccountsOf` (its R68, R69; R2, R3, R10).
- `sources`: `sourceOf`, `publishableAt` (its R1, R8; R4).
- `extraction`: `unitsOf` (its R36; R6, R15).
- `content`: the `content` read contract (its R45; R2, R6, R15).
- `inquiry-grammar`: `parseImportedFindingRef` (its R11; R12, R13).
- `inquiry`: `basisFor` (R16); the `inquiry_basis` read contract (its R40; R2, R6, R15).
- `strength`: `gradingFacts` (its R35; R15), `DEPTH_BOUND` (R8), `GRADING_METHOD_VERSION` (R5).
- `contradiction`: `unresolvedRecordOn` (its R29; R1).
- `case-grammar`: `extractedTextOf`, `sourceRowWithheld`, `fmSafe`, `pairLine`, `ANONYMOUS_ATTESTATION_LEVELS` (its R12, R16, R17; R4, R6, R7, R13).
- `publication`: `sourceStatement`, `unnamedSourceStatement` (its R51; R4).
- `case-import`: `acceptanceOf`, `openFlagsOn`, `importedCase` (its R4, R9; R13, R14).

### Invariants

- **R17** (copy of `case-authoring` R33; DEC-85) No row, sentence or answer this module gives names the project, members, content, kind or source of a side the publisher could not see at the act. A reveal (`contradiction` R52) never widens it: sight at the act, by `membership` R43, governs.
- **R18** (copy of `case-authoring` R26) Undetermined is stated and never filled. That covers a conflict leg unread (R1), a source read that failed (R4, stated Withheld), and a finding's grading facts unread (R15).
- **R19** (copy of `case-authoring` R24) No row composes a case-level strength: every pair is per member and per axis.
- **R20** (copy of `case-authoring` R22) Everything a row asserts arrived as an argument or was read from the record at the call. Nothing is composed, summarised or inferred.
- **R21** (copy of `case-authoring` R30) No place is named in this module's behaviour or outward text.
- **R22** (`case-authoring` R29's share) C-120.1–C-120.8 and C-120.10–C-120.13, the family "a case's disclosures and its pre-flight" (`CASE_DISCLOSURE_CHECKS`), are held in this module's own table with their ids, codes and translations unchanged, each `where` naming this module's raising method. C-120.9 is withdrawn and never reused. A change to any moves `CATALOG_VERSION` (rule 17).
- **R23** (the seam, K617)
  - Every service is synchronous.
  - It never throws on a failed read of another module (that read states less, never more).
  - It writes nothing of its own. The one write it reaches is `sources.sourceOf`'s minting of a source id, inside the caller's transaction (`case-authoring` R18), so the caller can roll it back.
  - It holds no table, so it declares nothing to purge.
  - It is reached as `caseDisclosuresOf(host, deps)`, one instance per host.

The rows' table (C-120.1–C-120.8, C-120.10–C-120.13), with their translations: as in `case-authoring.md` before this split, moved verbatim.

### Satisfies

- N345: DEC-76 item 4; DEC-84 items 11–13; DEC-85; `BIO_Publication_v0_1.md` §3 rule 16; `CONTRADICTION-PRESENT-RESOLVE-DESIGN.md` §10 (R1, R17).
- N364: DEC-81 items 1 and 3; DEC-78 item 5; K509 (3), (4) (R2–R4).
- DEC-112 response 4 (3)–(5) as restored by DEC-119; `BIO_Publication_v0_1.md` §5C (R4–R11, R15; K1275, K1315).
- DEC-96 item 4 (R12–R14; N522, K1273).
- `BIO_Publication_v0_1.md` §3 rule 4; DEC-20 (R16).

### Suggestions

- **The code.** The services are case-authoring's private methods, copied with their bodies unchanged (`#x` → `x`). `materials.mjs` and `accepted.mjs` are copied whole. The renderers are copied unchanged, so a document is byte-identical before and after the split.
- **Tests.** Interface tests over a fixture copied from case-authoring's (without `caseAuthoringOf`). The arms port from case-authoring's `tensions`, `carries`, `rests`, `imported` and `preflight`, called on the services. Also a byte-identity arm, each row's negative control, and R17's no-hidden-side arm. The end-to-end arms stay in case-authoring under its R55.
- **Order.** The caller must keep R16, R1, R2, R6, R13, R14 in that order and call R4 only after its last refusal; that is case-authoring R55's.

## Old ids (case-authoring → this file)

R31 → R1; R35 → R2; R36 → R3; R37 → R4; R43 → R5; R44 → R6; R45 → R7; R46 → R8; R47 → R9; R48 → R10; R49 → R11; R50 → R12; R51 → R13; R52 → R14; R54 → R15; R12 → R16; R33 → R17 (copy); R26 → R18 (copy); R24 → R19 (copy); R22 → R20 (copy); R30 → R21 (copy); R29's C-120 share → R22.
```

## Appendix B — exact edits to `build/requirements/case-authoring.md`

1. **Status** (line 3): append

   > Split for size by K617 and N529 (seam read `build/extraction/case-authoring-split.md`), by a worker for BOB #106 on `tranche/T28`, 2026-10-03, no requirement changing meaning: R31, R35, R36, R37, R43–R52 and R54 moved to `case-disclosures` R1–R15, and R12 to its R16; each retired here as moved. R29's C-120 family moved to its R22 with the rows' ids and translations. R33 copied there. New here: R55 (the order in which `publishCase` asks `case-disclosures`). R14, R15, R32, R34 and R53 re-pointed. Uses lose `contradiction`, `attestation`, `capture`, `sources`, `promotion`, `case-import` and `inquiry-grammar`, and gain `case-disclosures`.

2. **Size** (line 5): append

   > Measured 4,010 at T28's merge (K1328). After N529's split, about 2,940 (`case-disclosures` about 1,210).

3. **Purpose** (line 11): append

   > What the case discloses about what it rests on (tensions, grades and co-attestation, sources, materials, accepted work and flags, grading facts, hunch debt) is judged and spelled by `case-disclosures`, which `publishCase` asks (R55).

4. **R12** (line 30): replace with `- **R12** *(retired: moved to \`case-disclosures\` R16, N529)*`.

5. **R14** (line 32): re-point each reference:
   - "the tensions disclosed (R31)" → "(`case-disclosures` R1)";
   - "the `captures:` block (R35, R36) and the `sources:` block (R37)" → "(`case-disclosures` R2, R3) … (its R4)";
   - "the `method:` block (R43)" → "(its R5)";
   - "the `materials:` and `material_attestations:` blocks (R45)" → "(its R7)";
   - "the `accepted_work:` and `accepted_work_flags:` blocks (R51, R52)" → "(its R13, R14)".

   Then, after "(R38);", insert "the `grading_facts:` and `passages:` blocks (`case-disclosures` R15);".

6. **R15** (line 33): "(the last three by R31)" → "(the last three from `case-disclosures` R1's entries, R55)".

7. **Lines 44–65** (the heading "Disclosing a contradiction" and R31): replace with

   > - **R31** *(retired: moved to `case-disclosures` R1, N529)*

8. **R32** (lines 69–72) — re-point:
   - "Then R31's `TENSIONS_UNDETERMINED` (C-120.3), when a read fails or is truncated" → "Then `case-disclosures` R1's `TENSIONS_UNDETERMINED` (C-120.3), when its `tensionsRead` fails or is truncated, or this read throws (`tensionsUndetermined`)";
   - "Each candidate R31 would require the act to disclose, read exactly as R31 reads it (the same `unresolvedRecordOn`, …)" → "Each candidate `case-disclosures` R1 would require the act to disclose, read by its `tensionsRead` exactly as `publishCase` reads it (the same viewer, each member at its current bytes)";
   - "A highlighted one (R31)" → "A highlighted one (`case-disclosures` R1)".

9. **R34** (line 76) — re-point:
   - "R6, R12, R35, R44 and R31 (as R32 reads it)" → "R6, and `case-disclosures` R16, R2, R6 and R1 (as R32 reads it)";
   - "R35's self-attested documents, R37's source statements" → "`case-disclosures` R2's self-attested documents, its R4's source statements";
   - "each source shown as "Withheld" (R37)" → "(`case-disclosures` R4)".

10. **Lines 78–82** (the heading "Each document's grade…", and R35–R37): replace with

    > - **R35** *(retired: moved to `case-disclosures` R2, N529)*
    > - **R36** *(retired: moved to `case-disclosures` R3, N529)*
    > - **R37** *(retired: moved to `case-disclosures` R4, N529)*

11. **Uses** (lines 88–107):
    - **Delete** the lines for `contradiction` (102), N364 (103), `promotion` (105), `case-import` (106) and "Already used, now also for DEC-112" (107).
    - **Replace** N364's line with

      > - `ratification`: `caseRatifyPreflight` (its R18), for R34.
    - **In `record-grammar`'s line**, drop `canonicalJson`.
    - **Add:**

      > - `case-disclosures` (N529): `hunchDebt`, `tensionsJudged`, `tensionsRead`, `tensionsUndetermined`, `restingCaptures`, `captureFacts`, `selfAttestedJudged`, `materialsJudged`, `acceptedWorkJudged`, `flagsJudged`, `sourcesStated`, `withheldOf`, `findingFacts`, `methodOf`, `disclosureBlocks` (its R1–R16; R55); its renderers and `FLAG_SENTENCE` (R14); `SELF_ATTESTED_SENTENCE` and `FLAGS_SAY` (R34, R53); `CASE_DISCLOSURE_CHECKS`, re-exported for this module's importers. Index 68, before this module.

12. **R29** (line 118): replace from "and C-120.1–C-120.3 (N345)" through "it was never stamped.)" with

    > C-120.1–C-120.8 and C-120.10–C-120.13, "a case's disclosures and its pre-flight", moved with their ids, codes and translations to `case-disclosures` (its R22; N529).

13. **R33** (line 120): append " (Copied as `case-disclosures` R17.)".

14. **Lines 122–137 and 145–153** (the C-120 row tables and their lead-in lines): delete. Keep the C-82.8 table (139–143). In their place:

    > Rows C-120.1–C-120.8 and C-120.10–C-120.13 are `case-disclosures`' (its R22; N529).

15. **Lines 169–219** (the headings "What the case carries…" and "Another group's work…", and R43–R54) — replace with:

    > - **R43** … **R52** *(retired: moved to `case-disclosures` R5–R14, N529)*: one line per id, in the form "**R43** *(retired: moved to `case-disclosures` R5, N529)*", R44 → R6, R45 → R7, R46 → R8, R47 → R9, R48 → R10, R49 → R11, R50 → R12, R51 → R13, R52 → R14.

    Keep R53, re-pointed as:

    > - **R53** The ceremony.
    >   - R34's `blockers` gain `case-disclosures` R13 and R14.
    >   - Its step "what this rests on" names each `accepted_work:` row.
    >   - Its step three lists the flags `case-disclosures` R14 requires, read as `publishCase` reads them, beside R32's tensions, with the statement that publishing discloses them and is never blocked by them (`FLAGS_SAY`).
    >
    >   It writes nothing. (DEC-96 item 4; DEC-85)

    Then add `- **R54** *(retired: moved to \`case-disclosures\` R15, N529)*`, and a new heading and id:

    > #### The disclosures `publishCase` asks (N529; K617)
    >
    > - **R55** `publishCase` takes `tensionsDisclosed`, `selfAttested` and `flagsDisclosed`, and hands them to `case-disclosures`.
    >   - **The order.** After R6 and before the case identity is derived, it asks `case-disclosures`, in this order:
    >     - `hunchDebt` (its R16);
    >     - `tensionsJudged` (its R1, at the bytes R13 pins);
    >     - `restingCaptures`, `captureFacts` and `selfAttestedJudged` (its R2);
    >     - `materialsJudged` (its R6);
    >     - `acceptedWorkJudged` (its R13);
    >     - `flagsJudged` (its R14).
    >
    >     It answers the first refusal of the first step that refuses. Nothing is written and no id is drawn.
    >   - **After R11.** After R11, and only then, it asks `sourcesStated` and `withheldOf` (its R4). It passes `publication.attributionStatements` the reached observations and the withheld captures (its R10). Then it asks `findingFacts` (its R15), `methodOf` (its R5) and `disclosureBlocks` (its R3, R7, R10, R14).
    >   - **Into the document.** It writes their rows into R14's document through `case-disclosures`' renderers, in R14's order.
    >   - **The answer.** R15's `tensions`, `tensions_highlighted` and `tensions_legs_unread` are its R1 entries, each with the owner's words and the `author` stamp at this act.
    >   - **Never refused because it exists:** a contradiction, a capture that is not co-attested, off-the-record material, or an open flag.

16. **Satisfies** (lines 224–225) — re-point:
    - "(R14, R29, R34, R37, R43–R49; K1275)" → "(R14, R34, R55; `case-disclosures` R4–R11; K1275)";
    - "DEC-96 item 4 (R50–R53 …)" → "(R53, R55; `case-disclosures` R12–R14 …)";
    - "N364 (R12's pre-flight, R14's blocks, R32's step, R34–R37)" → "(R14's blocks, R32's step, R34; `case-disclosures` R2–R4, R16)";
    - "N345 (R14's `/5`, R31–R33)" → "(R14's `/5`, R32, R33; `case-disclosures` R1)".

17. **Suggestions** (line 249): replace the P6 (T28) bullet with

    > - **P6 (N529).** Split at the disclosures seam after T28 (4,010 lines): `case-disclosures` holds R31, R35–R37, R43–R52, R54 and R12 as its R1–R16. The end-to-end arms of `tensions`, `carries`, `rests`, `imported` and `preflight` stay here, proving R55 and R14. The fixture builds `caseDisclosuresOf` first. Until `plane` re-points, a one-line `get attestation()` passes through to `case-disclosures`.

    Keep the N345, ceremony and DEC-112/DEC-119 test bullets: they are proven at `publishCase`'s interface.

18. **Decided by BOB**: add

    > 6. N529: `case-disclosures` sits directly before this module. R32, R34 and R53 stay here, because they run `#authority`, `#judgeMembers` and `#publishCase`. R12 moves with the C-120 family (D1).

19. **Old ids**: append

    > N529: R31, R35, R36, R37, R43–R52, R54 → `case-disclosures` R1–R15; R12 → its R16; R33 copied as its R17.
