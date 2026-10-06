# case-disclosures (T33)

**Status** · session_017bRszvdvSZrLGuTMUoFyp2 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Four points, each with my best reading; I am building on these readings now and will bring the work in line with any answer.

(1) `modules.json` uses. The requirements' Uses gain entities, events, lines, money, people and case-tensions (T33-68), but `modules.json` still lists the T29 set, so the architecture check will refuse my imports of `entitiesOf`, `eventsOf`, `linesOf`, `moneyOf`, `peopleOf` and the tests' use of them. Also: R21's fix reads the profiles' `covers` through `jurisdictions.list()` (its R8), so jurisdictions is a use of the tests. Best reading: add entities, events, lines, money, people and jurisdictions to case-disclosures' `uses` (case-tensions needs no import: R10's attribution rows arrive as an argument). Please make that edit on `tranche/T33`; I merge it when you say.

(2) R24's `parts`. Best reading of the caller's shape: a flat list `[{place, where, people?, event?, fact?}]`, `place` one of `statement`, `claim`, `lens`, `docket`, `timeline`, `money`; `where` the caller's locator; `people` the references a statement, claim, lens or docket part makes to people (entity ids; one the record does not resolve to a person entity is answered in `unresolved`); `event` a timeline item's `EVT-` id, whose participants are read through `events.readEvent`; `fact` a cited `MNY-` id, whose parties are read through `money.readFact`. Each finding's subject is read from `prepared` (`inquiry.subjectEntityOf`). Besides `{named, unresolved}` it answers `entities` (every registered entity the case names, any kind) and `money_parties` (the payers' and payees' entity ids), which R27 takes. One person is the identity cluster (`people.identityOf`, `linked` state); its key is its least member id.

(3) R25's `ref` per basis: `act_or_position` `{line, event}` (a live `holds` line from a cluster member; the event found by `readEvent` with a `when`; the line judged `in` at the event's `when` through `lines.structureAt`, so `undetermined` is not standing); `tie` a live line of a people kind with a cluster member at one end; `interest` a `LIN-` or `MNY-` id `people.interestsOf` answers; `consent` and `prior_publication` a capture SHA-256 the record registers in a bundle the viewer may see (a member's cited testimony is their observation's capture); `private_party` no ref, its words required (empty words are not standing). A person listed twice keeps its first entry (the module's convention). R26 over the owner's words: they are refused `BAD_COMPLETENESS` naming the field when they carry a value of a named person's address or contact fact that `people.personAt` answers the viewer (held or undetermined) at the judgment's day.

(4) R22's new rows: I hold them provisionally as C-120.14 `PERSON_BASIS_UNRECORDED`, C-120.15 `PERSON_BASIS_NOT_STANDING`, C-120.16 `TIE_ATTESTATION_MISSING` (numbered at their stamp, T34). The requirements say their translations are BOB's drafts and none is in the file. I use these until you give yours:
 - C-120.14: "This case names a person without a recorded reason for naming them. Give each person named a basis: their act or position, a tie, an interest, their consent, an earlier publication, or why a private person is named. Nothing was written."
 - C-120.15: "A reason given for naming a person is not one the record holds, or the position it cites was not held on the date of the act. Read the list again. Nothing was written."
 - C-120.16: "Each member who signs a case first attests that they hold no undeclared tie to anyone or anything the case names, including those paid or paying in its money. Attest, or declare the tie first. Nothing was written."
R27's `attested` is `[{signer, at}]`; a missing signer is named in the refusal only when the viewer is that signer (others are counted). `member_ties:` rows are flat: `{row: attestation|tie, signer, at, entity, kind, level, shown}`, a tie row at `group`/`project` with `signer` and `shown` null, at `cover`/`name` with the member's cover or handle as `shown` (`membership.memberFacts`).

## J2 · REPORT

Findings outside my module (T33-68), each against that module's requirements.

1. **case-authoring R29 (its `invariants.test.mjs` and `preflight.test.mjs`): two new reds.** Both tests pin case-disclosures' C-120 family as exactly C-120.1–C-120.8 and C-120.10–C-120.13. R22 now adds C-120.14 `PERSON_BASIS_UNRECORDED`, C-120.15 `PERSON_BASIS_NOT_STANDING` and C-120.16 `TIE_ATTESTATION_MISSING`. On the unchanged base, case-authoring is 121/122, the one fail being R30 (K1545). On my branch it is 119/122. Proposal: CASE-AUTHORING #17 (T33-69, after my merge) widens both pins to the three new rows, as its R34 pre-flight and R55 `publishCase` start asking R25 and R27.
2. **control-plane R22/R43 (`families.test.mjs:245`, "the list reads case-disclosures' C-120 … every one of its rows (C-120.1–C-120.8, C-120.10–C-120.13)"): a new red, for the same reason.** On the unchanged base, the file fails only `:47` "CHECK_FAMILIES is total" (K1581). Proposal: name it beside the other control-plane reds until T33-89 widens the row list.
3. **Row census (`test/system/row-census.test.mjs`): three rows arrive with no record.** C-120.14, C-120.15 and C-120.16 are awaiting stamp (T34). My COMPLETE names each `awaiting stamp`. Proposal: they join the row-census named red, as docket's C-129.27/.28 did (K1635).
4. **Generated artifact (§14).** The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale, because case-disclosures' source changed. It is regenerated at L8's close. Running the row census rebuilt `sheet-worker`'s bundle byte-identically (no change in git).
5. **K1619's fixture finding.** My fixture now builds `entities` on the host and hands it to inquiry, instead of reaching it through `inquiry.entities`. `connections` is still migrated through `inquiry.connections`, because connections is not a use of case-disclosures (the architecture check would refuse a direct import). It stays while inquiry keeps that getter.

## J3 · COMPLETE

**T33-68 applied** (B1a.9; K1483, K1490, K1493, K1494; readings as J1, accepted by B2, K1634). Commit 530afda9fe on `job/T33/case-disclosures`. No file BOB changed after my start was one I read, so `tranche/T33` was not merged in. The module's source grows 1,262 → 1,808 lines (P6 well under).
- **R24 `peopleNamed(prepared, parts, viewer)`:** each finding's subject (`inquiry.subjectEntityOf`); `parts` `[{place, where, people?, event?, fact?}]` (statement, claim, lens, docket; a timeline item's live participants through `events.readEvent`; a money fact's payer and payee through `money.readFact`). A person is a `person` entity (`entities.readEntity`) joined by `people.identityOf`'s `linked` cluster, so it is one person under two references, keyed by the least id. Each place is listed once. A non-person where a person was named, an unknown id, an unreadable event or fact, a words-only party, and an unknown place are each answered in `unresolved` with where. It also answers `entities` (any kind) and `money_parties`. Writes nothing; never throws.
- **R25 `peopleJudged(named, peopleBases, viewer)`:** `BAD_COMPLETENESS` naming the field, alone (the list's shape; each basis' `ref` shape). Then C-120.14 for each named person with no basis, matched through the cluster (first entry kept). Then C-120.15 for each basis that does not stand: `act_or_position` (a live `holds` line from the person, `in` at the cited event's `when` by `lines.structureAt`, so undetermined does not stand); `tie` (a live line of `lines`' `PEOPLE_KINDS` with the person at an end); `interest` (a line or money fact `people.interestsOf` answers); `consent`/`prior_publication` (a capture registered in a bundle the viewer sees); `private_party` (words required). Rows `{person, places, basis, citation, words}` only for persons whose basis stands.
- **R26:** no answer or block carries a person fact. The owner's words carrying a named person's address or contact value (`people.personAt`, `publishable: false`, at the judgment's day) are `BAD_COMPLETENESS` naming the field; the refusal does not repeat the value.
- **R27 `tieAttestationJudged(signers, named, moneyParties, attested, viewer)`:** C-120.16 names a missing signer only to themself and counts the others. Each signer has an `attestation` row `{signer, at}`. Each live tie (`people.tiesConcerning`, read as that signer) to a named entity or money party is a `tie` row at its level: `group`/`project` with nothing shown, `cover`/`name` with the cover or handle (`membership.memberFacts`). A failed ties read goes in `undetermined`.
- **R28:** `peopleLines`, `memberTieLines`, `peopleOf`, `memberTiesOf` (`people.mjs`), flat rows through `fmSafe`; a document without them reads `[]`.
- **R22:** C-120.14–C-120.16 added with B2's accepted translations, each `where` naming its method and DEC-49 region. Provisional ids, **awaiting stamp** (T34): C-120.14 PERSON_BASIS_UNRECORDED awaiting stamp; C-120.15 PERSON_BASIS_NOT_STANDING awaiting stamp; C-120.16 TIE_ATTESTATION_MISSING awaiting stamp.
- **R21 (K1545, my own red, fixed):** places are read through `jurisdictions.list()`'s `covers`, not scraped from profile source.
- **R10:** the comment re-pointed to `case-tensions.attributionStatements` (wording only).
- **K1619:** the fixture builds `entities` on the host (REPORT J2 item 5).

**Deferred:** none.

**Found in other modules:** REPORT J2: case-authoring R29 ×2 and control-plane `families.test.mjs:245`, which pin the old C-120 row set; the row census's three new rows; and the stale plane bundle.

**Final `uses`:** record-grammar, record-core, membership, promotion, provenance, attestation, capture, sources, extraction, content, inquiry-grammar, inquiry, strength, contradiction, case-grammar, publication, case-import, plus **entities, events, lines, money, people, jurisdictions** (jurisdictions for the tests; case-tensions needs no import).

**Tests and checks:**
- `node --test bio-plane/test/m/case-disclosures/`: tests 56, pass 56, fail 0. New `people.test.mjs` has 8 tests (R24, R25 ×4, R26, R27, R28). `seam.test.mjs` R22/R23 now cover the new rows and services.
- Users of the module, on my tree against the unchanged base:
  - case-authoring: 119/122 vs 121/122. The new fails are R29 ×2 (J2 item 1); R30 is named (K1545).
  - control-plane `families.test.mjs`: 7/9 vs 8/9. The new fail is `:245` (J2 item 2); `:47` is named (K1581).
  - plane: 85/85 on both.
  - `catalogue-end` R43: named red (K1606).
- `format`: 0 failures. `architecture case-disclosures`: 13 failures, all the undeclared `uses` edges above (expected until the merge, B2). `coverage case-disclosures`: 28 of 28 live ids named, 0 failures. `ownership case-disclosures tranche/T33`: 7 files, 0 failures.

Size (session_017bRszvdvSZrLGuTMUoFyp2): test runs 9, module lines 1808
