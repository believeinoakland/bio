# Requirement-line draft: A8 citing a typed page (DEC-464)

**Status** · DRAFT for BOB · PLANNING L2, 2026-10-27. Drafted by a Sonnet reading worker from leg-earning, strength, citation, content and extraction read whole (record-grammar's grade section, and text-chain's named lines); reviewed by PLANNING. Placement corrected from DEC-464's owed line: a member's typed page is `content`'s (`op=transcribe`, `transcriptionattest`), not extraction's (`pagetranscribe` is the AI's reading), so "transcription" means text-chain (L1) and content (L4); no extraction line. Layer order holds (text-chain L1 < content L4 < leg-earning, strength, citation L6). Also owed (not drafted): frozen copies label typist and checkers as of the freeze (basis-versions, case-grammar, case-disclosures, publication). Bob's open points: §8.1 (at a document weaker than B a checked typing equals an attested machine reading), §8.5 (names in a published edition).


Read in full: the five assigned files (extraction all 223 lines), the grade section of record-grammar, the brief and DEC-457-464; for placement also text-chain R1-R14, R24-R31, R49-R60, R81, R104, screens-inquiry R96-R97, inquiry R62, run-productions R25, and the code of `content`, `leg-earning`, `screens-inquiry/document.mjs`.

## 0. Where the subject lives (placement)

- **A member's typed page is `content`'s, not `extraction`'s.** `op=transcribe` -> `content.transcribe` (R23-R24) mints a row whose chain is the single step `typed(member, text_sha256)`; `op=transcriptionattest` (R25) is the second member's check; `op=transcription` (R26) and `op=transcriptions` (R57) read them. Text-chain: `typed` is a derivation with `letter: "never"` (R3, R11: no cap on the step), so its `derivationCap` is null.
- **`op=pagetranscribe` (extraction R71-R75) is the AI's reading of unread pages** (`ai_transcription`, text-chain R104; leg-earning R15), not the member's typing. **No extraction line is owed for A8.**
- `content.attestText` (R43) checks Civicsmith's machine text, a different act from `transcriptionAttest`; content R21 already keeps them apart.
- **Where citation refuses typed words today: nowhere at the interface.** No `citation` requirement mentions a typing. `cite` with a part's `content_id` naming a typing passes content R27 (held id of this document) and is not `MACHINE_PASSAGE_UNCHECKED` (inquiry R62, run-productions R25 judge only rows "a run proposed"). Three real blocks sit around it:
  1. The **screen**: `document` draws a typing's words with no Cite act (document.mjs ~746-757; R97 offers Confirm only).
  2. **Search**: typed text is in `transcriptions`, not `capture_text`, so `found` can never name a typing; only `handle` + `content_id` can.
  3. **The ceiling**: an unchecked typing's fidelity is undetermined (a leg can state no capture grade, leg-earning R2), and once checked `gradeCeiling` gives the full `EARNED_CAPTURE_CEILING` B (text-chain R56), the standing of attested machine text. That is what DEC-464 forbids.
- Layers: text-chain 1 < content 4 < leg-earning, citation, strength 6. citation uses `content`, not `leg-earning`; strength uses `leg-earning`, not `content`.

## 1. The grade ladder proposed

The vocabulary (record-grammar R16-R18): `BASIS_GRADES = [A, B, C, D]`, strongest first; `EARNED_CAPTURE_CEILING = B`; `TESTIMONY_GRADE = D` (testimony axis).

| Passage | Capture-axis ceiling | Determinant |
|---|---|---|
| Machine text Civicsmith read, a member attested it (R15/`attestText`) | the capture's own letter, B at most | attestation |
| **Typed, unchecked** | **D** | the typist's word |
| **Typed, checked by a second member** | **C** | one step up, never B |

Both are also capped by the document's own capture letter, as R15 does; the page's machine chain does not bind a typing (the typing exists because that text is poor or absent).

**"One step" is well defined here.** `BASIS_GRADES` is a total order, strongest first, so one step is the adjacent letter: D -> C. Derive both letters (as R18 derives `UNREACHABLE_CAPTURE_GRADE`): unchecked = the last of `BASIS_GRADES`, checked = one rank stronger; checked is always strictly weaker than `EARNED_CAPTURE_CEILING`.
Edge cases (open points 1-2): at document byte grade C a checked typing equals an attested machine reading; at D there is no step to take.

## 2. text-chain (earlier module the decision needs: "transcription")

Highest R: **R106**; none retired. Existing: R56 (any covering attestation gives `EARNED_CAPTURE_CEILING`), R57 (else `derivationCap`, null when unmeasured), R3/R11. R56 contradicts DEC-464 for a typed chain.

- **R107** NEW (amends R56, R57; DEC-464) **A typed passage has two grades and no more.** `TYPED_UNCHECKED_GRADE` is the last letter of `BASIS_GRADES` and `TYPED_CHECKED_GRADE` the letter one rank stronger (`'D'`, `'C'` today); both derived, never typed, and `TYPED_CHECKED_GRADE` is strictly weaker than `EARNED_CAPTURE_CEILING`. For a chain whose derivation step covering `target` is a `typed` step, `gradeCeiling(chain, target, attestations)` answers: with no covering attestation by a member other than that step's `member`, `{ceiling: TYPED_UNCHECKED_GRADE, determinant: "typist", by: [member]}`; with one or more, `{ceiling: TYPED_CHECKED_GRADE, determinant: "second_member", by: [those members, sorted]}`, however many. An attestation by the typist is ignored here as well as refused at the act. R56's `EARNED_CAPTURE_CEILING` is answered for no typed chain. Every other chain is answered as R56, R57 say. `why` names the typist and the checkers. Test: `typed` chain, no attestation -> D/typist; one other member's covering attestation -> C; two -> C; the typist's own or a non-covering one -> D; control: an `ai_transcription` chain with the same attestation -> `EARNED_CAPTURE_CEILING`.

## 3. content

Highest R: **R62**; none retired. Touched: R21 ("for a typed row, only the attestations of that typing by members other than the typist" - kept), R24 ("Its fidelity is undetermined until a different member attests it" - **superseded**), R25 ("the answer carries the ceiling before and after" - values change), R26, R16 (mint label), R19-R20 (what `contentRead` and `standings` carry), R35 (capture grade is the document's; not contradicted).

- **R63** NEW (amends R21, R24, R25, R26; supersedes R24's last sentence; DEC-464) **A typing is graded as its typist's word, and a second member's check raises it one step.** The transcription axis of a typed row is `text-chain` R107's answer: D, determinant `typist`, until a member other than the typist attests the typing; C, determinant `second_member`, from the first such attestation on; further attestations are kept with their notes (R25), named, and raise nothing. It is never undetermined and never `EARNED_CAPTURE_CEILING`. `transcribe`, `transcriptionAttest` (`ceiling_before`, `transcription`), `transcriptionRead` and the `transcription` of `contentRead`/`standings` all state it; a repeat attestation by the same member replaces its own (R25) and does not change the grade. Test: type -> D; a second member attests -> before D, after C; a third -> C; the typist's own still C-52.9, D. Control: `attestText` of the machine text leaves the typing at D.
- **R64** NEW (amends R16, R19, R20, R26; DEC-464) **A typed row says who typed it and who checked it, by key.** `contentRead`, `standings` and `transcriptionRead` carry for a typed row `typed: {typist, at, checked_by: [{attestor, at}], label_key}`, `checked_by` only members other than the typist, in time order; `label_key` is `content.typed.unchecked` ("typed by {typist}, not yet checked") or `content.typed.checked` ("typed by {typist}, checked by {checkers}"), read by key (words are the design stream's; the first is Bob's). Its mint label stays `member_marked`, `machine_work: false`, and no field of it says the words are Civicsmith's reading or the original. Test: before and after a check the matching key and names; a hidden bundle answers as absent; control: a machine-read row has no `typed` block.

Stale words owed (design stream's): `transcribe`'s `says` ("fidelity is UNDETERMINED"), `content.says.checked_typing_against`, `refusal.TEXT_CHAIN_LETTER_ON_PERSON` ("stays 'not yet determined'").

## 4. leg-earning

Highest R: **R17**; none retired. Touched: R1 (the capture ceiling, "bounded by `text-chain.captureBound` over machine transcriptions"), R2 (`legCapped`), R3 (`earnedBasis` carries the content row), R10 (invariant: "Nothing here gives a leg a grade the record did not earn or a member did not author; an ungraded leg is inert"), R15 (the AI sibling, the model for R18).

- **R18** NEW (sibling of R15; DEC-464) `earned`'s capture ceiling for a content row cited as text whose chain's derivation step is a `typed` step (content R24) is answered at the passage's own grain, replacing the pointer to the document: the weaker of the document's own capture letter (R1's route rule for the capture, with no text chain, so a machine reading of the page does not bind a typing) and content R63's grade (D, or C once a second member has checked). An undetermined document letter makes it undetermined, with the route's reason. The entry carries `grain: "passage"`, `determinant` (`typist` or `second_member`), and content R64's `typed` block so `earnedBasis` (R3) shows who typed and who checked. It is never the capture's machine-chain bound and never stronger than C. Test: byte grade B: unchecked D, checked C; byte grade C: checked C; unruled: undetermined; control: an attested AI passage keeps R15's grade.
- **R19** NEW (amends R2, R10; BOB's call, open point 3) A leg on a typed passage is graded by the record, as a derived leg is (`strength` R36-R38): it counts on the capture axis at R18's grade, or at its stated letter when that is weaker; it needs no stated letter and none above R18's grade is taken (`legCapped` answers it, given the leg's content id; the signature that carries it is BOB's name). The grade follows a check without a member's act; R10 names this exception. Test: a typed leg stating no letter reads D, then C after the check; stating A reads D with why; control: a document leg stating nothing is inert.

Needs from earlier modules: `text-chain` R107, `content` R63-R64 only.

## 5. strength

Highest R: **R45**; none retired. Touched: R1 (a document leg's stated capture grade bounded by what its target earns), R9, R19 (no leg above what the record earns; no Grade A), R31 (`GRADING_METHOD_VERSION`, now `bio-grading/4`), R32 (`recomputePair`), R35 (`gradingFacts`), R36-R38 (derived legs, the model).

- **R46** NEW (amends R1, R9; DEC-464) **A leg on a typed passage counts at the passage's grade.** On the capture axis it counts at `leg-earning` R18/R19's grade (D unchecked, C checked), by `strengthOf`, `inquiryStrength`, `versionStrength`, `candidatePair` and `recomputePair` alike; its member's `why` says "the typist's word" or "typed by X, checked by Y" by key, never "Civicsmith read". The arithmetic of R4 is unchanged. Test: byte grade B, legs: attested AI passage (B), checked typing (C), unchecked typing (D): the axis reads D naming the unchecked typing; after its check, C; never B for a typing. Control: a stored version keeps its stored grade (R9).
- **R47** NEW (amends R31, R35; open point 6) The grading method gains its rule and `GRADING_METHOD_VERSION` becomes `bio-grading/5`: a typed passage is worth its typist's word, one step more once a second member checked it, never the standing of text Civicsmith read; versions 1-4 keep their words and arithmetic, and `recomputePair` at each recomputes from the leg's recorded grade as before. `gradingFacts` marks a leg on a typed passage `typed: {checked: boolean}` (no names). Test: version 5's text names the rule; versions 1-4 byte-identical.

## 6. citation

Highest R: **R25** (R1-R25 all used, none retired); next **R26**. Touched: R1 (refusals), R2 (a leg's grade is filled only from `earned`'s connection; no capture grade assumed, R8), R3 (the Session Log and answer), R19 (declares `cite` fields: `content_id` already accepted), R24 (`legGrade`: member-stated capture grade up to the ceiling), R22 (identity of a passage = target + same part).

- **R26** NEW (DEC-464) **A typed passage is citable at once.** `cite` with a document and a part's `content_id` naming a member's typing is judged as any held content id (content R27: `CONTENT_ROW_UNKNOWN`, `CONTENT_ROW_NOT_THIS_TARGET`) and by no rule of its own against being typed: a typing no second member has checked is cited. A machine `author` is refused as for any cite; a typing is not a passage "a run proposed", so inquiry R62's read lets it stand. The leg is written as R2 writes any (role the member's, no capture grade assumed, R8); its capture grade is `leg-earning` R19's. Test: a member cites an unchecked typing onto an inquiry with a role: `ok`, the leg in `basis[]` with that `content_id`. Typings are cited by `handle` + `content_id`, never `found` (typed text is not indexed). Control: another document's typing -> C-45.6; a hidden bundle -> `NO_SUCH_PROJECT`'s answer.
- **R27** NEW (DEC-464) **The citation names the typist and any checker, and never the original or Civicsmith.** For a leg on a typing, `cite`'s per-leg answer and the Session Log entry (R3) carry content R64's `typed` block as at the act, and the leg is read afterward (`basisFor`, `earnedBasis`) with the block as it stands then (a later check adds a checker; a typed passage's words are `content.passageText`, byte for byte). No field of the citation or its `why` calls the words Civicsmith's reading or the original; its label is `content.typed.*` by key. Test: cite unchecked -> `checked_by: []`; a second member checks; `earnedBasis` lists the checker; the Session Log entry names the typist. Control: a machine-text leg has no `typed` block.
- Placement doubt: frozen copies (basis-versions R29; case editions and disclosures that print passage words) must label typist and checkers as of the freeze. Those modules (basis-versions, case-grammar, case-disclosures, publication) were not assigned; PLANNING should send them the same need.

## 7. What the screens need (needs only)

- A Cite act on a typing's words (none today); the label "typed by {name}, not yet checked" / "typed by {name}, checked by {names}" wherever typed words show (Document, cite picker, a question's legs, a case); the grade (D / C) with its plain reason; Confirm (R97) saying a check raises one step, not to what Civicsmith reads.
- The cite picker must offer typings (read from `op=transcriptions`). A question's leg on a typing shows grade and label. A case shows typed words as typed, never as quoted from the document (names: open point 5).

## 8. Open points

1. **"Never the standing of text Civicsmith read" when the document's bytes are weaker than B.** (Meaning, Bob's; small.) With the absolute ladder D/C capped by the document, at byte grade C a checked typing equals an attested machine reading. Options: (a) accept, say so in `why` (recommended); (b) rank relative to the document, so a checked typing is one step below the attested reading (then no raise at byte grade C, against "raises").
2. **Third and later checks.** (BOB's, from "only incrementally better".) Recommend one step in all, C the top; more checks are recorded, named, and raise nothing.
3. **Derived or member-stated grade.** (BOB's.) Recommended (R19): the record grades the leg, so the check raises it with no re-grading; this amends the "ungraded leg is inert" rule (leg-earning R10, strength R3) for this kind alone. Alternative: a ceiling only, the member re-states C after a check; R10 stays whole.
4. **Axis.** (BOB's.) Capture axis (precedent strength R36). Testimony is a fixed D (strength R1, `TESTIMONY_GRADE`), with no step to climb.
5. **Names in a published edition.** (Meaning, Bob's.) DEC-464 names typist and checker; strength R29/R30 never name an anonymous contributor. Recommend names in the team as decided; in an edition, the member's chosen credit level applies ("typed by a member of the team" if she asked to be unnamed).
6. **Method version.** (BOB's.) Recommend `bio-grading/5` (R47); published editions keep theirs.
