# strength (T28)

**Status** · session_01Q7AodKmzj5rYSu6PxmkvRb · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

Five readings for R31–R34. I carry on with each as written; only (1) and (2) decide code that must change at the merge.

1. **Recognising a ref (R33).** Strength's Uses lack `inquiry-grammar`, whose R11 owns `IMPORTED_FINDING_RE` / `parseImportedFindingRef`. Best reading: strength's Uses gain `inquiry-grammar` (43, before 48) and import them; the alternative is `accepted-work` re-exporting them. Until you answer I code against inquiry-grammar's R11 names and switch at the merge. Without one of the two, strength would have to restate the grammar.
2. **The leg's edition (R33).** Neither `inquiry_basis` (inquiry R12) nor `inquiry_basis_version_legs` projects `target_edition`, and `acceptedFinding` needs it. Best reading: for the live basis strength reads `target_edition` from the inquiry's own `bundle.md` `basis[ord]` (record-core's `readFile`, as reevaluation does today); for a version it reads a `target_edition` column on the version leg, which I read basis-versions R3 as storing for a leg on a ref (its own `acceptedLegRefusals` call needs the edition too). Please confirm basis-versions stores it. Where no edition can be read, the leg is undetermined on every axis and named with why. Candidate legs and `recomputePair` facts carry `target_edition` themselves.
3. **accepted-work's form.** I take it as a dep `acceptedWork` with `acceptedFinding({ref, edition, viewer})`, defaulting to whatever accepted-work exports (its factory or module functions), wired at the merge. The reads strength makes: R2's answer (`{absent}`, `{unreadable}`, null, or the finding with `pair`). A ref is visible to an `inquiryStrength` viewer only when `acceptedFinding` answers that viewer a finding (R6); otherwise it is withheld like an unseen bundle.
4. **R34's corroboration.** (a) A document leg is anonymous evidence when any capture `register` holds for its target is stated at `group` or `project` in `levels`. (b) What corroborates it: a counted document leg sharing no origin that is not itself anonymous. A `cover`/`name` testimony leg does **not**, because strength cannot tell whether its author is the attesting member (a capture's actor is not in strength's read contracts). This is the cautious side, mirroring R29's same-member exclusion. (c) Likewise an anonymous-evidence document never corroborates an anonymous testimony leg (R29), and a leg on a ref never corroborates anything: it is another group's finding, not a document.
5. **R32's facts.** `recomputePair` "reads nothing else", so the facts must carry what R29, R30 and R34 judge. Per leg: `{target, kind (document|observation|inquiry|imported), role, grade, grade_axis, grade_source, ground, target_edition?, answer? (an inquiry's or an accepted edition's per-axis {state, grade}), origins[], origins_complete, captures[], author_key?}`. `author_key` is an opaque per-case token: equal for the same member, never an account. I propose that strength also provide the producer, `gradingFacts({inquiry, version?, levels, viewer})` (in-process), so `case-authoring` writes exactly what `recomputePair` reads and the round trip is one module's. That is a new provided service, so it is yours to add to the requirements. Without it, case-authoring has to rebuild the facts from strength's internals. `GRADING_METHOD_VERSION` will be `bio-grading/1`, covering R1–R5, R29, R30, R33 and R34 as built in T28.

## J2 · REPORT

R31–R35 built on job/T28/strength (merged tranche/T28 through B4; K1305–K1307 applied). strength 113/113; users' suites green (run-productions, skills, reevaluation, case-grammar, publication, ratification, case-authoring, review, conformance, consequences); format, architecture, coverage (35/35), ownership: 0 failures each. One thing left: the default for the acceptedWork dep, acceptedWorkOf(host, deps).acceptedFinding (K1307), which I wire when you tell me accepted-work is merged. Until then a host that hands in no acceptedWork reads every ref as {absent: true}. Then I merge tranche/T28, re-run, and post COMPLETE. For later readers: testimonyCorroboration (R30, R34) now also answers anonymous-evidence legs, as {…, kind: "evidence", capture: <sha>}. The levels map takes capture SHA-256s beside observation ids, which is what ratification R35's caller passes.

## J3 · COMPLETE

**Entries applied** (L6; N519, N522, N523; K1305–K1308): R31, R32, R33, R34, plus R35 (added by K1305).
- **R31.** `GRADING_METHOD_VERSION` is `bio-grading/1`, with `GRADING_METHOD_VERSIONS`. `gradingMethodText(version)` answers that version's method in plain words, or null for an unknown version.
- **R32.** `recomputePair({legs, levels?, version})` is pure. Any version not published here is `UNKNOWN_METHOD_VERSION`.
  - The arithmetic of one level of the walk (`levelPair`) and the anonymity judgement (`anonymityOf`) are in a new pure file, `src/strength/method.mjs`, which imports only `arithmetic.mjs` and `record-grammar/grades.mjs`.
  - The live walk resolves each leg against the record and then composes by `method.mjs`; `recomputePair` composes by the same code, so the two agree by construction (case-checker can import `method.mjs` alone).
- **R33.** A leg on an imported finding reference (recognised by inquiry-grammar's `parseImportedFindingRef`, K1305) is read through `acceptedWorkOf(host).acceptedFinding` (K1307), with its edition from the inquiry's `bundle.md` `basis[ord]`, a version leg's `target_edition` column, or the candidate leg itself.
  - It counts at the edition's published pair, with nothing walked past it, as member `via: "imported"` with `another_groups` `{group, case, edition, finding}`.
  - When the read answers absent, unreadable or null, or no edition is named, the leg is undetermined on every axis, named with why and marked `unknown`; the axis detail then says "nothing here establishes what … rests on" rather than naming the depth bound.
  - A withdrawn acceptance changes nothing. The ref is never asked of the capture registry.
  - In `inquiryStrength` (R6), a ref is seen only when accepted-work answers that viewer a finding.
- **R34.** `levels` also takes capture SHA-256s. A capture or connection leg on a document whose capture is stated at `group` or `project` is anonymous evidence: it is inert unless a counted document leg that shares no origin with it, and is not itself anonymous, stands beside it. A `cover`/`name` testimony leg does not bear it out (the cautious reading, K1305 (4)), and anonymous evidence never bears out anonymous testimony. `testimonyCorroboration` answers such legs as `{kind: "evidence", capture}`.
- **R35.** `gradingFacts({inquiry, version?, levels, viewer})` gives the leg shape K1305 fixed.
  - `author_key` is an opaque token (`a1`, `a2`, …) within one answer.
  - A leg the viewer may not see is withheld, with `out_of_view`.
  - Refusals are R30's.
  - Tested: `recomputePair` over its answer equals `strengthOf` (with and without levels) and `versionStrength`'s pair.
- **Also changed in this module:** `namedMember` passes `another_groups` and `unknown` through, and `axisResult`'s undetermined detail now separates the depth bound from what is unknown. The sentence naming another group's finding leaves the source's own finding id out, because R6's sweep of record ids would read it as one of this record's ids (it is in `another_groups.finding`). The words for another group's finding are a plain sentence until the UX stream gives its own (DEC-92).

**Deferred:** none.

**Found in other modules** (each told to BOB already, or for later readers):
- **basis-versions:** a version leg on a ref needs `target_edition` stored (K1305 (2)). Until then such a leg is undetermined and says why.
- **case-authoring and case-grammar:** `grading_facts` is R35's answer.
- **ratification R35:** passes capture-keyed levels for off-the-record captures (R34), and reads `kind: "evidence"` entries from `testimonyCorroboration`.

**Catalogue rows added:** none, so nothing reads `awaiting stamp`. **Generated artifacts:** none staled; no bundle takes strength as an input.

**Tests and checks** (on job/T28/strength after merging tranche/T28 through B5):
- strength 114 pass, 0 fail (87 before; new: `method.test.mjs`, `imported.test.mjs`, `evidence.test.mjs`, an R28 arm, an R33 factory arm).
- Users' suites: accepted-work 19/0, run-productions 39/0, skills 49/0, reevaluation 101/0, case-grammar 32/0, publication 98/0, ratification 199/0, case-authoring 100/0, review 35/0, conformance 54/0, consequences 30/0.
- `format`: 0 failures. `architecture strength`: 0 failures. `coverage strength`: 35 of 35, 0 failures. `ownership strength tranche/T28`: 9 files, 0 failures.
- No layer tests named in the manifest.
- Stale-note re-scan (K1138): found nothing live; only historical "moved from" notes.
- Module measures 2,209 lines (P6).

Size (session_01Q7AodKmzj5rYSu6PxmkvRb): test runs 34, module lines 2209
