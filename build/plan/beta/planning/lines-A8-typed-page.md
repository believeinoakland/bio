# Requirement-line draft: A8 citing a typed page (DEC-464)

**Status** · DRAFT for BOB · PLANNING L2, 2026-10-27. Drafted by a Sonnet reading worker from leg-earning, strength, citation, content and extraction read whole (record-grammar's grade section, and text-chain's named lines); reviewed by PLANNING. Placement corrected from DEC-464's owed line: a member's typed page is `content`'s (`op=transcribe`, `transcriptionattest`), not extraction's (`pagetranscribe` is the AI's reading), so "transcription" means text-chain (L1) and content (L4); no extraction line. Layer order holds (text-chain L1 < content L4 < leg-earning, strength, citation L6). Also owed (not drafted): frozen copies label typist and checkers as of the freeze (basis-versions, case-grammar, case-disclosures, publication). Bob's open points: §8.1 (at a document weaker than B a checked typing equals an attested machine reading), §8.5 (names in a published edition).

Fixed for BOB #321's review (L4).


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
Edge cases (L10 on Bob's page; Q-A8-2): at document byte grade C a checked typing equals an attested machine reading; at D there is no step to take.

## 2. text-chain (earlier module the decision needs: "transcription")

Highest R: **R106**; none retired. Existing: R56 (any covering attestation gives `EARNED_CAPTURE_CEILING`), R57 (else `derivationCap`, null when unmeasured), R3/R11. R56 contradicts DEC-464 for a typed chain.

- **A8-R107** (T53; DEC-464; amends text-chain R56, R57) **A typed passage has two grades and no more.** [depends on L10: as written if Bob says as recommended (accept that at a weak document a checked typing equals an attested machine reading); else the two grades are ranked relative to the document's letter, so a check sometimes raises nothing.] `TYPED_UNCHECKED_GRADE` is the last letter of `BASIS_GRADES` and `TYPED_CHECKED_GRADE` the letter one rank stronger (`'D'`, `'C'` today); both derived, never typed, and `TYPED_CHECKED_GRADE` is strictly weaker than `EARNED_CAPTURE_CEILING`. For a chain whose derivation step covering the target is a typed step, `gradeCeiling` answers: with no covering attestation by a member other than that step's member, ceiling `TYPED_UNCHECKED_GRADE`, determinant "typist", by the typist; with one or more, ceiling `TYPED_CHECKED_GRADE`, determinant "second_member", by those members sorted, however many (more than one raises nothing, Q-A8-2). An attestation by the typist is ignored as well as refused at the act. R56's `EARNED_CAPTURE_CEILING` is answered for no typed chain; every other chain is answered as R56, R57 say. `why` names the typist and the checkers. *(not yet met: T53)* Test: typed chain, no attestation: D by the typist; one other member's covering attestation: C; two: C; the typist's own, or a non-covering one: D. Control: an AI-reading chain with the same attestation: `EARNED_CAPTURE_CEILING`.

## 3. content

Highest R: **R62**; none retired. Touched: R21 ("for a typed row, only the attestations of that typing by members other than the typist": kept), R24 ("Its fidelity is undetermined until a different member attests it": **superseded**), R25 (the answer carries the ceiling before and after: values change), R26, R16 (mint label), R19-R20 (what a read and the standings carry), R35 (capture grade is the document's; not contradicted).

- **A8-R63** (T53; DEC-464; amends content R21, R24, R25, R26; supersedes R24's last sentence) **A typing is graded as its typist's word, and a second member's check raises it one step.** [grades as A8-R107; depends on L10 likewise.] The transcription grade of a typed row is `text-chain` A8-R107's answer: D, determinant typist, until a member other than the typist attests the typing; C, determinant second member, from the first such attestation on; further attestations are kept with their notes (R25), named, and raise nothing. It is never undetermined and never `EARNED_CAPTURE_CEILING`. Typing a page, attesting it, and every read of it state this grade; a repeat attestation by the same member replaces her own (R25) and does not change the grade. *(not yet met: T53)* Test: a page typed reads D; a second member attests it: before D, after C; a third member attests: C; the typist's own attestation leaves it at D. Control: the check of the machine text of the same page (R43) leaves the typing at D.
- **A8-R64** (T53; DEC-464; amends content R16, R19, R20, R26) **A typed row says who typed it and who checked it, by key, except as credited.** [depends on L11: as written if Bob says as recommended (names in the team; in a published edition the member's chosen credit level applies); else names always.] Every read and the standings carry for a typed row the typist, when, the checkers (only members other than the typist, in time order, each with when) and a label by key: `content.typed.unchecked` ("typed by {typist}, not yet checked") or `content.typed.checked` ("typed by {typist}, checked by {checkers}"); the words are the design stream's (the first is Bob's). A member is named as the credit level in force for her allows ("a member of the team" where she asked not to be named); the label never names someone the level hides. Its mint label stays "member marked", never machine work, and no field of it says the words are Civicsmith's reading or the original. *(not yet met: T53)* Test: before and after a check the matching key and names; a hidden bundle answers as absent; a member credited anonymously is "a member of the team" where credit applies. Control: a machine-read row has no typed block; a member credited by name is named.

Stale words owed (design stream's): the typing act's "fidelity is UNDETERMINED" sentence, `content.says.checked_typing_against`, `refusal.TEXT_CHAIN_LETTER_ON_PERSON` ("stays 'not yet determined'").

## 4. leg-earning

Highest R: **R17**; none retired. Touched: R1 (the capture ceiling, "bounded by `text-chain.captureBound` over machine transcriptions"), R2 (`legCapped`), R3 (`earnedBasis` carries the content row), R10 (invariant: "Nothing here gives a leg a grade the record did not earn or a member did not author; an ungraded leg is inert"), R15 (the AI sibling, the model for A8-R18).

- **A8-R18** (T53; DEC-464; sibling of leg-earning R15) **A typed passage's capture ceiling is its own.** [depends on L10, as A8-R107.] The capture ceiling `earned` answers for a content row cited as text whose chain's derivation step is a typed step (content R24) is at the passage's own grain, replacing the pointer to the document: the weaker of the document's own capture letter (R1's route rule for the capture, with no text chain, so a machine reading of the page does not bind a typing) and content A8-R63's grade (D, or C once a second member has checked). An undetermined document letter makes it undetermined, with the route's reason. The entry carries `grain: "passage"`, the determinant (typist or second member) and A8-R64's typed block so `earnedBasis` (R3) shows who typed and who checked. It is never the capture's machine-chain bound and never stronger than C. *(not yet met: T53)* Test: byte grade B: unchecked D, checked C; byte grade C: checked C; unruled: undetermined. Control: an attested AI passage keeps R15's grade.
- **A8-R19** (T53; DEC-464; amends leg-earning R2, R10) **A leg on a typed passage is graded by the record without a member's act.** [depends on Q-A8-1: as written if Bob says as recommended; else a typed passage's grade is only a ceiling, a leg on it counts at the letter its member states up to A8-R18's grade, a leg stating none stays inert and R10 stands whole.] A leg on a typed passage counts on the capture axis at A8-R18's grade, or at its stated letter when that is weaker; it needs no stated letter, and none above A8-R18's grade is taken. The grade follows a check without any member re-stating it; R10 names this exception, for this kind alone. *(not yet met: T53)* Test: a typed leg stating no letter reads D, then C after the check; stating A reads D with why. Control: a document leg stating nothing is inert.

Needs from earlier modules: `text-chain` A8-R107, `content` A8-R63 and A8-R64 only.

## 5. strength

Highest R: **R45**; none retired. Touched: R1 (a document leg's stated capture grade bounded by what its target earns), R3 (ungraded is inert), R9, R19 (no leg above what the record earns; no Grade A), R31 (`GRADING_METHOD_VERSION`, now `bio-grading/4`), R32 (`recomputePair`), R35 (`gradingFacts`), R36-R38 (derived legs, the model).

- **A8-R46** (T53; DEC-464; amends strength R1, R9) **A leg on a typed passage counts at the passage's grade.** [depends on Q-A8-1 and L10: as written if Bob says as recommended; under the alternative of Q-A8-1, the leg counts at its stated letter up to the passage's grade and a leg stating none is inert.] On the capture axis it counts at A8-R18/R19's grade (D unchecked, C checked), in every reading of strength alike (the question's, a version's, a candidate pair, a recomputation); its member's `why` says "the typist's word" or "typed by X, checked by Y" by key, never "Civicsmith read". The arithmetic of R4 is unchanged. *(not yet met: T53)* Test: byte grade B, legs: attested AI passage (B), checked typing (C), unchecked typing (D): the axis reads D naming the unchecked typing; after its check, C; never B for a typing. Control: a stored version keeps its stored grade (R9).
- **A8-R47** (T53; DEC-464; amends strength R31, R35) **The grading method gains its rule and a new version.** [depends on Q-A8-1, as A8-R46.] A typed passage is worth its typist's word, one step more once a second member checked it, never the standing of text Civicsmith read; the method has a new version naming this rule, and every earlier version keeps its words and arithmetic, each recomputing from the leg's recorded grade as before. The grading facts of a leg on a typed passage say it is typed and whether it is checked (no names). *(not yet met: T53)* Test: the new version's text names the rule; earlier versions byte-identical. Control: a stored pair keeps its version.

## 6. citation

Highest R: **R25** (R1-R25 all used, none retired); next **R26**. Touched: R1 (refusals), R2 (a leg's grade is filled only from `earned`'s connection; no capture grade assumed, R8), R3 (the Session Log and answer), R19 (declares `cite` fields: `content_id` already accepted), R24 (member-stated capture grade up to the ceiling), R22 (identity of a passage = target + same part).

- **A8-R26** (T53; DEC-464; amends citation R1, R2) **A typed passage is citable at once.** Citing a document and a part's content id naming a member's typing is judged as any held content id (content R27: unknown row, row not of this target) and by no rule of its own against being typed: a typing no second member has checked is cited. A machine author is refused as for any cite; a typing is not a passage "a run proposed", so inquiry R62's read lets it stand. The leg is written as R2 writes any (role the member's, no capture grade assumed, R8); its capture grade is A8-R19's (or the stated letter, under Q-A8-1's alternative). *(not yet met: T53)* Test: a member cites an unchecked typing onto an inquiry with a role: the leg is in the basis with that content id. Control: another document's typing is refused C-45.6; a hidden bundle gets the unknown-project answer.
- **A8-R27** (T53; DEC-464; amends citation R3) **The citation names the typist and any checker, except as credited, and never the original or Civicsmith.** [depends on L11, as A8-R64.] For a leg on a typing, the citation's per-leg answer and the Session Log entry carry A8-R64's typed information as at the act, and the leg is read afterward with it as it stands then (a later check adds a checker; the typed words are the passage's words byte for byte). A member is named as the credit level in force allows. No field of the citation or its `why` calls the words Civicsmith's reading or the original; its label is `content.typed.*` by key. *(not yet met: T53)* Test: cite unchecked: no checkers; a second member checks; the leg read afterward lists the checker; the Session Log entry names the typist. Control: a machine-text leg has no typed information; an anonymously credited typist is "a member of the team".

## 7. Owed lines (frozen copies)

§ owed lines: in `lines-A6-queue-acts.md` (queue, screens-daily) and `lines-A5-A8-case-modules.md` (the seven layer-8 case modules), drafted separately in L4

## 8. What the screens need (needs only)

- A Cite act on a typing's words (none today); the label "typed by {name}, not yet checked" / "typed by {name}, checked by {names}" wherever typed words show (Document, cite picker, a question's legs, a case); the grade (D / C) with its plain reason; Confirm saying a check raises one step, not to what Civicsmith reads.
- The cite picker must offer typings. A question's leg on a typing shows grade and label. A case shows typed words as typed, never as quoted from the document (names as credited, L11).

## 9. Suggestions (how, not requirements)

- **content**: a typing is made by `op=transcribe` (`content.transcribe`, R23-R24), checked by `op=transcriptionattest` (R25), read by `op=transcription` (R26) and `op=transcriptions` (R57); the typed information is a `typed: {typist, at, checked_by: [{attestor, at}], label_key}` block on `contentRead`, `standings` and `transcriptionRead`.
- **leg-earning**: `legCapped` answers a typed leg given the leg's content id; the signature that carries it is BOB's name.
- **strength**: the method version is `bio-grading/5`; `gradingFacts` marks a leg `typed: {checked: boolean}`.
- **citation**: typings are cited by `handle` + `content_id`, never found by `found` (typed text is in `transcriptions`, not `capture_text`).
- The screen `document` (`document.mjs` ~746-757) draws typed words with no Cite act and offers Confirm only (R97).

## 10. Notes (technical, BOB's)

1. **Axis.** Capture axis (precedent strength R36). Testimony is a fixed D (strength R1), with no step to climb.
2. **Method version.** A new version; published editions keep theirs.
3. Open points 1 and 5 of the earlier draft are on Bob's page as L10 and L11 (QUESTIONS-L2); the lines they affect are bracketed.

## Questions for Bob raised in L4

**Q-A8-1. When a typed page is cited, does the record grade the leg, or does the member?** (doctrine) Today a leg a member has not graded counts for nothing. Your decision says a second member's check "raises" the typed page's grade by a step. Options: A, the record grades a leg on a typed page by itself (D when typed, C once checked), so the grade rises on its own when someone checks, and the member need not touch it (recommended; it is how derived legs already work and "strength is never stated by a member alone" stays true); B, the typed grade is only a ceiling: the member states the leg's grade up to it, and after a check she must re-state it to C, a leg she has not graded still counts for nothing. Recommendation: A. A8-R19, A8-R46, A8-R47 depend on it.

**Q-A8-2. Do more checks raise a typed page further?** Options: A, no: one check takes it from D to C and later checks are recorded and named but raise nothing (recommended, your words "only incrementally better"); B, each further check, up to a limit, raises it again. Recommendation: A, with C the highest a typed page reaches. A8-R107 and A8-R63 are written as A.
