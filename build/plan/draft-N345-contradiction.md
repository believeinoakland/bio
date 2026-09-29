# N345 (contradiction): requirement changes for Bob's approval (a worker for BOB #66, 2026-09-29)

**Status** · DRAFT, not folded. Read on `tranche/T13` @ f77ec838e9 (= `main`). Scope: the contradiction PRESENT and RESOLVE part of N345 only. N345's DEC-78 (capture, a source's disclosure history), DEC-80 (the ceremony) and DEC-81 (grade disclosure) parts are drafted separately.

**Sources, read whole:**
- `docs/development/CONTRADICTION-PRESENT-RESOLVE-DESIGN.md` (the design; §14 is the outline these texts fill)
- DEC-76, DEC-77 and DEC-84 in `docs/development/DECISIONS.md`. DEC-84 governs where it differs from the design's §15, notably points 3 and 10.
- K447, K450 in `build/rulings.md`
- `build/requirements/README.md`, and the requirements files of the modules below
- `build/modules.json` for the order

**Marks.** Each item is marked **CHANGE OF MEANING** (Bob approves) or **WORDING** (BOB's: a code, a row, a bound, a use, a rung, or a restatement of something already ruled). Every new or replaced requirement carries *(not yet met: N345)*. "Uses" and "Invariants" are private, as in each file.

**Next free ids** (counted after the T14 wordings already drafted: `draft-T14-wordings.md` to `-3.md`, `t14-reread.md`). None of these files marks a retired id at or above them. README 6 lets an unapproved draft renumber, so N345's other parts, if they fold first, move these numbers.

| file | next free id | used here | rows |
|---|---|---|---|
| entities | R38 | R38 | C-91.7 |
| inquiry | R46 | R46–R48 | C-2.11–C-2.17 (a new `src/inquiry/checks.mjs`) |
| contradiction | R24 | R24–R48 | C-60.2, C-60.3; C-93.8–C-93.33 |
| reevaluation | R27 | R27 | none |
| publication | R50 (R48 is N339's, R49 N346's) | R50 | none |
| case-authoring | R31 | R31 | C-120.1–C-120.3 (a new family, K343's pattern) |
| conformance | R21 | R21, R22 | C-113.24–C-113.27 |
| affordances | R28 | none (amendments only) | none |
| queue | R43 (R41 is N325's, R42 N342's) | R43–R46 | none |
| basis-versions | not needed | none | none |

**New `uses` edges** (each to an earlier module; `modules.json` amended in the same change):
- contradiction (40) → promotion (22)
- reevaluation (47) → contradiction (40)
- publication (48) → contradiction
- case-authoring (50) → contradiction
- conformance (53) → contradiction
- queue (62) → contradiction

`control-plane` already uses `contradiction`.

---

## 1. entities (layer 5)

**entities.md, new after R37** (a heading of its own) — **CHANGE OF MEANING**

> **reportResolutionDefect({captureSha, ref, entityId, reason, source, by})** (`op=resolutiondefect`; N345, DEC-76 item 3)
> - **R38** A report that a resolution (R10: the capture, the reference and the entity) matched the wrong subject. Refusals, in order:
>   - `NO_SHA` (extraction's `noSha`)
>   - `NO_REF`
>   - `NO_ENTITY` (R37)
>   - `NO_REASON`
>   - `NO_SUCH_RESOLUTION` (C-91.7), when no resolution is held under that key.
>
>   Otherwise one report is appended: the reason (trimmed, at most 2,000 characters); `source` (`{module, id}`, such as a contradiction candidate, or null for a member's own report); `by`, the control plane's stamp (R4); and the instant. A repeat by the same `by` from the same `source` answers `already: true` and writes nothing.
>
>   A report moves nothing. The grade is kept (R27), the resolution is kept, and every connection stays. `readEntity` (R5), `resolutionsFor` (R14) and `concerns` (R15) answer each resolution's reports beside it, as `defects: [{reason, source, by, at}]` with `defect_count`, so that a member can re-resolve (R8's pattern). R32's withholding applies to `by` as it does to `resolved_by`. *(not yet met: N345)*

**R14, R15** — **WORDING.** Each gains ", with its reports (R38)" after the fields listed.

**R30** — **WORDING.** "`resolutions` is keyed to its bundle" becomes "`resolutions` and `resolution_defects` are keyed to their bundle".

**R29** — **WORDING.** Gains C-91.7.

**Row: C-91.7 `NO_SUCH_RESOLUTION`**
- Translation: "The record holds no resolution of that reference to that subject, so there is nothing to report as wrong. Read the capture's resolutions and name one of them. Nothing was written."

**Uses.** No change.

**Interface tests:**
- Each refusal gets a negative control.
- A report leaves the grade, `established` and `strongestByCapture` unchanged.
- A repeat answers `already: true`.
- An outsider sees the defect without `by` (R32).

**Satisfies** — gains DEC-76 item 3 ("a wrong subject match also reports a defect in `entities`") and the design's §9.

---

## 2. inquiry (layer 6)

**inquiry.md, new after R45** (under a heading "The contradiction inquiry")

> **The vocabulary and its helpers: CONTRADICTION_COORDINATES, PLURALITY_DIFFERENCES, RESOLUTION_KINDS, DISSOLVED_BY, NORM_CANONS, resolutionFamily(kind), resolutionLines(resolution)** Pure; never throw. (N345; DEC-76 items 1 and 3, DEC-84 item 3)
> - **R46** — **CHANGE OF MEANING.** The frozen vocabularies:
>   - `CONTRADICTION_COORDINATES`: `time_or_occasion`, `scope`, `meaning`, `observer_or_method`, `subject`. These are DEC-77's clarifier choices.
>   - `PLURALITY_DIFFERENCES`: `scope`, `time_or_occasion`, `standard`, `evidence_set`, `weighing`. These are DEC-84 item 3's named differences between two projects' conclusions.
>   - `DISSOLVED_BY`: the union of both lists, plus `precision` and `opinion`.
>   - `NORM_CANONS`: `higher_over_lower`, `later_over_earlier`, `specific_over_general`, `harmonization`, `unreconciled`.
>   - `RESOLUTION_KINDS`, with `resolutionFamily` answering each kind's family and null for anything else:
>     - `dissolved` (family DISSOLVED)
>     - `misquote`, `transcription_or_reading_error`, `superseded_version` and `corrected` (the last with its category not stated) (family CORRECTED)
>     - `double_speak_or_reversal`, `obligation_against_act`, `conflict_of_norms` and `irreconcilable` (family GENUINE)
>
>   `resolutionLines` answers the frontmatter lines of a resolution in one fixed order, frontmatter-safe (`basis-versions` R5's normalising), for `contradiction` to write. These are the one list of each: `contradiction`, `affordances` and `queue` read them from here. *(not yet met: N345)*
>
> **The grammar's arm** (C-2.11–C-2.16; judged by R11 as C-2.8's entry requirements are)
> - **R47** — **CHANGE OF MEANING.**
>   - **The link.** A **contradiction inquiry** is one whose document carries `contradiction: {candidate}`, where `candidate` is 64 lowercase hex (`contradiction` R15's id). Anything else is `CONTRADICTION_LINK_MALFORMED` (C-2.11).
>   - **Where a resolution may appear.** A document that is not a contradiction inquiry and carries `resolution` is `RESOLUTION_WITHOUT_CONTRADICTION` (C-2.12).
>   - **Concluding.** A contradiction inquiry at `concluded` carries `resolution: {kind, coordinates?, qualifiers?, wrong_side?, reason?, canon?}`. With none, it is `RESOLUTION_MISSING` (C-2.13), so no door concludes one without its kind. A kind outside R46 is `RESOLUTION_KIND_UNKNOWN` (C-2.14).
>   - **What each kind requires.** Each missing or ill-formed field is `RESOLUTION_INCOMPLETE` (C-2.15), naming the field:
>     - `dissolved` names one or more distinct `coordinates` from `DISSOLVED_BY`.
>     - A CORRECTED kind names `wrong_side` (`a` or `b`) and a non-empty `reason`.
>     - `conflict_of_norms` names a `canon` from `NORM_CANONS`.
>     - `qualifiers`, when present, is `{a?, b?}`, each at most 200 characters.
>   - **Other states.** `resolution` is read only while the document is `concluded`. It is kept, never read, while the document is at any other state, so that reopening (R1) needs no edit.
>   - **Sub-inquiries.** A document carrying `explores` names exactly one of `coordinate` (from `DISSOLVED_BY`), `canon` (from `NORM_CANONS`) or `hypothesis` (non-empty, at most 500 characters). Anything else is `EXPLORES_MALFORMED` (C-2.16). *(not yet met: N345)*
>
> **contradictionLink(id), inquiryOfCandidate(candidate)** (reads for `contradiction`)
> - **R48** — **WORDING** (the reads R47's projection needs).
>   - `contradictionLink` answers the inquiry's recorded `{candidate, resolution, explores}` as its latest promotion projected them (R12), with `resolution` null unless it is `concluded`, or null for a plain inquiry.
>   - `inquiryOfCandidate` answers the one inquiry whose document names that candidate, or null.
>
>   Neither read is gated, and both are for in-process callers (R16's terms). Neither throws. *(not yet met: N345)*

**R11** — **CHANGE OF MEANING.** Gains, after `BASIS_CYCLE`:

> R47's arm over the document (inside `BASIS_REFUSED`, each finding with its code and translation); and a candidate another inquiry already names, `CANDIDATE_ALREADY_TAKEN_UP` (C-2.17, naming that inquiry), so that one candidate has one contradiction inquiry.

Mark *(not yet met: N345)*.

**R12** — **WORDING.** Gains "the contradiction link, resolution and `explores` recorded (R48)".

**R36** — **WORDING.** Gains the table that holds R48's projection, keyed by `bundle_id` and declared to purge.

**R38** — **WORDING.** Gains C-2.11–C-2.17, "held in this module's own table (DEC-49; K343's pattern in the C-2 family)".

**Rows** (this module's first `checks.mjs`; C-2.1–C-2.10 stay the catalogue's). Promotion stamps them:

| row | code | translation |
|---|---|---|
| C-2.11 | `CONTRADICTION_LINK_MALFORMED` | "A contradiction inquiry names the candidate it was taken up from by that candidate's id, and this document's link is not one. Take the candidate up again from where it is shown. Nothing was written." |
| C-2.12 | `RESOLUTION_WITHOUT_CONTRADICTION` | "Only an inquiry taken up from a contradiction records what kind of contradiction it turned out to be, and this one was not taken up from one. Remove the resolution, or take the contradiction up first. Nothing was written." |
| C-2.13 | `RESOLUTION_MISSING` | "A contradiction inquiry is concluded by saying what the conflict turned out to be: how the two sides differ, which one is wrong, or that the conflict is real. This conclusion does not say. Name its kind. Nothing was written." |
| C-2.14 | `RESOLUTION_KIND_UNKNOWN` | "That is not one of the kinds a contradiction can be resolved as. The kinds are listed with the question. Nothing was written." |
| C-2.15 | `RESOLUTION_INCOMPLETE` | "This kind of resolution needs one more thing to be complete: the respect in which the sides differ, which side is wrong and why, or the rule that reconciles them. The missing part is named. Nothing was written." |
| C-2.16 | `EXPLORES_MALFORMED` | "A question that explores a contradiction names one thing it explores: one respect in which the sides may differ, one rule that may reconcile them, or one hypothesis. This one names none, several, or one the record does not know. Nothing was written." |
| C-2.17 | `CANDIDATE_ALREADY_TAKEN_UP` | "That contradiction has already been taken up as another question, which is named. Work on it there, so that one conflict has one place where it is resolved. Nothing was written." |

**Uses.** No change. The vocabulary is held here, so none is needed.

**Interface tests:**
- Each finding gets a negative control.
- A contradiction inquiry concluded through `basis-versions`' `conclude` without a resolution is refused C-2.13, which is the "another door" arm.
- Reopening a resolved contradiction inquiry is admitted with its resolution kept, and `contradictionLink` answers `resolution: null`.
- A second inquiry naming a held candidate gets C-2.17.

**Satisfies** — gains:
- `BIO_Case_Making_v0_1.md` §CONTRADICTION, "RULED 2026-09-29 (DEC-76)"
- DEC-76 items 2 and 3
- DEC-84 items 3, 4 and 16
- the design's §8, §9 and §12

---

## 3. contradiction (layer 6)

### Status and Purpose — CHANGE OF MEANING

**Status line.** Append: "N345 (PRESENT and RESOLVE; DEC-76, DEC-77, DEC-84) adds R24–R48 and amends R5, R7, R8, R11, R12, R14, R19, R20."

**Purpose.** Replace its last sentence ("It never judges … are not designed).") with:

> PRESENT and RESOLVE are held here too. A candidate is shown to a member who may see both of its sides, at the weight its label and key give it. A member's attributed act says what the conflict turned out to be: inline, or by taking it up as a contradiction inquiry whose conclusion records its kind. The machine may recommend only in which respects the sides may differ. Nothing here edits a side. What an act implies (a qualifier, a stale mark, a tension) is read, never written onto the side.

### Terms — WORDING

Append:

> A **weight** is `lead`, `duty`, `plurality` or `not_shown` (R24). A candidate's **state** is `open`, `dismissed`, `explained_not_shown`, `taken_up` or `resolved` (R26). A **mark** is one of R27's. **Coordinates**, **kinds** and **canons** are `inquiry`'s vocabularies (its R46). An **acceptance basis** is R30's.

### The fifth key: two projects' conclusions (DEC-84 item 3) — CHANGE OF MEANING

**Terms, keys.** Add:

> `K5` (one question, two projects' conclusions): two projects whose stances on one inquiry are both `concluded` (`basis-versions` R22's `conclusionOf`), adopting claims whose text differs. Each side is `{kind: "stance", inquiry, project, version, claim}`.

**R5.** "all four keys" becomes "all five keys".

**R8.** Gains "K5's sides are read through `basis-versions`' `conclusionOf` for each project that draws on the inquiry (its R37)".

**R10.** Gains "for K5, both projects are ones the viewer may see (`membership` R44 at `FULL`)".

**R11.** K5's ladder is viewer, inquiry, drawing projects, concluded stances, differing claim. Its last level is `shared_question`.

**R14.** Gains "a stance is `inquiry|project|version`, versioned by the SHA-256 of the adopted claim".

**R18.** Unchanged ("keys are added, never widened").

The judgement over K5 pairs uses R2's pinned prompt unchanged. R3 renders a stance side as its claim text. Before a K5 candidate is shown, a K5 arm is added to the gate's corpus and measured (Satisfies).

### Replaced requirements

**R12** — **WORDING.** `judgement: {state: "NOT_REACHED", …}` becomes `judgement: {state: "HELD_APART", read: "candidatesFor"}`: the pairing answers pairs, and a run's judgements over them are read through R25. The label vocabulary is still not published here.

**R19** — **CHANGE OF MEANING.** Replaced by:

> - **R19** No act here edits, grades or deletes a side, and no act but a member's (R31–R36) says what a candidate turned out to be. A candidate is shown to a member only by R25–R29, only to a viewer who may see both of its sides now (R10), and only at a weight R24 gives it. *(not yet met: N345)*

**R20** — **WORDING.** Gains C-60.2, C-60.3 and C-93.8–C-93.33.

### New: what is shown, and at what weight

- **R24** — **CHANGE OF MEANING.** A candidate's **weight** comes from its label (R1) and its key, and is never stored:
  - `precision` and `unrelated` are `not_shown`: never shown as a tension, and counted where R25 answers.
  - `world` and `undetermined` are `lead` (DEC-84 item 1: the machine's uncertainty never creates an obligation).
  - `record` on K1–K4 is `duty`.
  - Any shown label on K5 is `plurality` until a `no_difference` act (R34), then `duty`.

  A **duty** is held for the joined participants of every project that draws on either side:
  - For a claim, leg or stance side, the projects drawing on its inquiry (`basis-versions` R37).
  - For an extent side, the projects drawing on each inquiry with a leg on its content row (`inquiry` R40).
  - For K5, the two projects.

  At most 32 projects per inquiry and 32 inquiries per content row, with `truncated` stated. A duty is never muted, dismissed or set aside, and it leaves only by resolution (DEC-84 item 2). *(not yet met: N345)*

**candidatesFor({on, label?, weight?, state?, after?, limit?, viewer})** (`op=contradictioncandidates`)
- **R25** — **CHANGE OF MEANING.**
  - **`on`.** Exactly one of `{inquiry}`, `{content}`, `{entity}`, `{bundle}`, `{project}` or `{candidate}`. None, or more than one, is `CANDIDATES_NO_SUBJECT` (C-60.2). `{project}` answers the candidates whose duty or lead reaches that project (R24's rule).
  - **Which candidates.** The candidates of weight other than `not_shown` whose both sides the viewer may see (R10), newest first. `{entity}` answers instead in the stated date of the earlier-dated side (R9), with undated candidates last and counted as `undated`, never placed by guess.
  - **Each candidate.** Its key and the sentence saying why its sides were paired (R11's table), both sides verbatim with their source, stated date, doctype and capture, the label and reason labelled machine work, the weight, the state (R26), its resolution and the member who made it, the standing recommendations (R37) labelled machine work, the reach of a duty (R24) and `default_question` (the stated default R35 may take).
  - **Filters and page.** `label`, `weight` and `state` filter. The page is at most 50 (a non-number is 50), with `truncated` observed by reading one past, and `cursor` the last id.
  - **Empty answers.** An empty answer names its level, never a bare empty list: `none_judged` (no visible candidate names it) or `none_shown` (visible candidates held, each `not_shown`, counted per label as `not_shown: {precision, unrelated}`). Whether the pairing forms pairs there is `pairs`' answer (R11). A candidate the viewer may not see is neither a level nor counted.

  It writes nothing and never throws. *(not yet met: N345)*
- **R26** — **CHANGE OF MEANING.** A candidate's **state** is derived at every read and never stored in place (R17):
  - `open` until a member acts.
  - `dismissed` after R31.
  - `explained_not_shown` after a `differs` act without evidence (R32).
  - `resolved`, with its kind, after an evidenced `differs`, a `one_wrong` (kind `corrected`) or an inquiry's conclusion.
  - `taken_up` while its contradiction inquiry (`inquiry` R48) is at any state but `concluded`.

  The kind, when concluded, is the inquiry's `resolution` (`inquiry` R47). A reopened inquiry makes its candidate `taken_up` again. A later act on an `explained_not_shown` candidate moves it on. *(not yet met: N345)*

**tensionsOn({referents, viewer})** (`op=contradictiontensions`)
- **R27** — **CHANGE OF MEANING.** For each referent at its version (R14), this answers its marks from every candidate the viewer may see on it:
  - `in_tension`: a duty that is `open` or `taken_up`.
  - `softened`: `explained_not_shown`, with the explanation, the member and the coordinates, each qualifier marked hypothesis.
  - `stale`: this side named wrong by a CORRECTED resolution, with the reason, the member, the instant and the act or inquiry.
  - `qualified`: resolved `dissolved`, with the coordinates, the qualifier and the explanation, marked evidenced.
  - `held_irreconcilable`: resolved `irreconcilable`, with the inquiry.
  - `lead`: an open lead.
  - `plurality`: an open K5 candidate before `no_difference`.

  Each mark carries its candidate. A stale side still resolves, and says it was corrected. Every surface that shows a side reads this, so no surface holds a copy of the rule. More than 200 referents is `TENSIONS_TOO_MANY` (C-60.3). It writes nothing and never throws. *(not yet met: N345)*

**contextFacts({candidate, viewer})** (`op=contradictionfacts`)
- **R28** — **CHANGE OF MEANING.** This answers the facts the record holds that bear on each coordinate, each `{coordinate, a, b, source}`, computed from what the sides already carry: the stated date and doctype (R9), each capture, each side's resolved entities (`entities` R14) and, for K5, each project. Each fact is labelled the record's, never machine work. A fact not stated is `undetermined`, with why, never guessed. An absent or invisible candidate is `NO_SUCH_CANDIDATE` (C-93.9). It writes nothing. *(not yet met: N345)*

**unresolvedRecordOn({finding, sha})** (in-process; read as the plane)
- **R29** — **CHANGE OF MEANING.** This answers the candidates that a case pinning `finding` at `sha` must disclose:
  - **Which candidates.** Each candidate of weight `duty` whose state is `open`, `explained_not_shown` or `taken_up`, or which is resolved `irreconcilable` (DEC-84 item 11), with a side whose referent is held one level deep (DEC-84 item 12):
    - an accepted, unhidden, claimed version of the finding at those bytes;
    - the content row of each document leg of its basis there;
    - for each inquiry leg, an accepted, unhidden, claimed version of that inquiry.
  - **Each candidate.** Both sides, its state, its explanation if any, its inquiry if any, and `depth: 1`. The answer states that deeper findings disclose their own when published.
  - **Sides the caller cannot see.** Every candidate is answered, because a publisher must see every tension on what they publish. A side in a bundle the stated `viewer` may not see (when one is passed) answers as `{hidden: true}` with no id, text, project or source.
  - **Bound and failure.** At most 200 candidates per finding, with `truncated`. A read that fails answers `undetermined: true`. It writes nothing and never throws. *(not yet met: N345)*

### New: the member's acts

- **R30** — **CHANGE OF MEANING.**
  - **Refusals common to R31–R36**, first and in order:
    - an empty or machine `author` is `MACHINE_CANNOT_ACT_ON_CANDIDATE` (C-93.10);
    - no candidate named is `NO_CANDIDATE` (C-93.8);
    - one absent, one whose side the viewer may not see, or one `not_shown` is `NO_SUCH_CANDIDATE` (C-93.9), all three the same answer;
    - any free text over its cap is `WORDS_MALFORMED` (C-93.33), naming the field. The caps are: explanation 1,000; reason 500; words 500; each qualifier 200; question 500.
  - **Who may act.** Any member who may see both sides may act. No project position is asked, because a RECORD tension is in the group's shared holding (DEC-84 item 4).
  - **The acceptance basis.** Every act that records a coordinate or a kind (R32, R36) records its **acceptance basis**, per coordinate recorded:
    - `accepted`, naming the recommendation (R37) it accepts, when the act names one;
    - else `unaided`.

    The act also records the recommendations standing at its instant. An acceptance naming a recommendation that is not standing for this candidate is `ACCEPTANCE_NOT_STANDING` (C-93.25). One whose coordinate is not among those the act records is `ACCEPTANCE_VALUE_DIFFERS` (C-93.26).
  - **The machine's reason.** The machine's reason stays labelled the machine's, and is never written as the member's (DEC-84 item 14).
  - **The row.** Each act appends one row: the candidate, the act, the author, the instant, the coordinates, the explanation, the evidence named, the wrong side and its reason, the qualifiers and the acceptance basis. The row never changes a side. *(not yet met: N345)*

**dismiss({candidate, reason, words?, viewer, author})** (`op=contradictiondismiss`)
- **R31** — **CHANGE OF MEANING.** After R30:
  - a candidate already `dismissed` or `resolved` is `CANDIDATE_CLOSED` (C-93.11), and one `taken_up` is `CANDIDATE_TAKEN_UP` (C-93.12), naming its inquiry;
  - a `duty` or a `plurality` is `RECORD_CANNOT_BE_DISMISSED` (C-93.13), whose answer says it closes only by a resolution;
  - a `reason` that is not one of `same_fact_different_precision`, `not_same_matter` or `real_conflict_not_pursued` (DEC-84 item 17) is `DISMISSAL_REASON_UNKNOWN` (C-93.14).

  Otherwise the lead is `dismissed`, with the reason and any words. *(not yet met: N345)*

**clarify({candidate, choice, coordinates?, explanation?, evidence?, qualifiers?, wrongSide?, reason?, accepted?, viewer, author})** (`op=contradictionclarify`)
- **R32** — **CHANGE OF MEANING.** After R30 and R31's closed-state refusals:
  - **Refusals.**
    - A `lead` is `CLARIFY_NOT_A_TENSION` (C-93.15); a lead is dismissed or taken up.
    - A `choice` other than `differs`, `one_wrong` or `no_difference` is `CLARIFY_CHOICE_UNKNOWN` (C-93.16).
    - For `differs`, no coordinate, or one outside the key's vocabulary, is `CLARIFY_COORDINATE_UNKNOWN` (C-93.17). The vocabulary is `CONTRADICTION_COORDINATES` for K1–K4 and `PLURALITY_DIFFERENCES` for K5 (`inquiry` R46).
    - No explanation is `CLARIFY_NO_EXPLANATION` (C-93.18), unless every coordinate recorded is `accepted` (DEC-84 item 14). The record then states that no words of the member's own were given.
    - An evidence item (`{content}`, `{inquiry, ord}` or `{fact: coordinate}`) that the viewer may not see, or a fact R28 answers `undetermined`, is `EVIDENCE_NOT_SEEN` (C-93.19).
  - **What `differs` does.**
    - With at least one evidence item, the candidate is `resolved`, kind `dissolved`, and each side's qualifier is marked evidenced.
    - With none, it is `explained_not_shown`: each qualifier is marked hypothesis, the mark softens and does not clear, and a duty stays (DEC-76 item 1).
    - On K4, `subject` also reports a defect on each resolution that paired the two sides, through `entities.reportResolutionDefect` (its R38), with the explanation as its reason and the candidate as its source.
    - On K5, an evidenced `differs` is recorded on both projects' stances as the named difference (DEC-84 item 3). *(not yet met: N345)*
- **R33** — **CHANGE OF MEANING.** `one_wrong`:
  - `wrongSide` must be `a` or `b`, else `WRONG_SIDE_UNNAMED` (C-93.20).
  - `reason` must not be blank, else `WRONG_SIDE_NO_REASON` (C-93.21).
  - On K5 it is `PLURALITY_HAS_NO_WRONG_SIDE` (C-93.22): neither project is made to adopt the other's answer.

  Otherwise the candidate is `resolved`, kind `corrected` (no category is asked; DEC-84 item 16), and the named side is marked stale with the reason, the member and the instant. The side is never deleted, and nothing resting on it moves (DEC-84 item 7). *(not yet met: N345)*
- **R34** — **CHANGE OF MEANING.** `no_difference` applies to K5 only; on any other key it is `CLARIFY_CHOICE_UNKNOWN`. It records that the member found no named difference, and the candidate's weight becomes `duty` for both projects (R24; DEC-84 item 3). *(not yet met: N345)*

**takeUp({candidate, question, frame, viewer, author})** (`op=contradictiontakeup`)
- **R35** — **CHANGE OF MEANING.** After R30 and R31's closed-state refusals:
  - a candidate already `taken_up` answers its inquiry with `existed: true` and writes nothing;
  - no question is `TAKE_UP_NO_QUESTION` (C-93.23). The plane fills in none: R25's `default_question` is shown, and the surface sends what the member accepts;
  - a `frame` other than `a` or `b` (the side the question is framed around) is `TAKE_UP_NO_FRAME` (C-93.24).

  **What it writes.** Otherwise, in one act, through `promotion.promote`: a new inquiry, `open`, `surfaced_by: human`, titled from the question (`inquiry` R10), carrying `contradiction: {candidate}` (`inquiry` R47) and both sides as legs, with no grade:
  - the framed side as `supports` and the other as `cuts_against` (K447 (8));
  - a claim or stance side as an inquiry leg on its inquiry;
  - a leg or extent side as a leg on its information bundle, naming its content row;
  - each leg's note naming its side of the candidate.

  A promotion refusal is relayed whole, and nothing is written. The candidate reads `taken_up` (R26). *(not yet met: N345)*

**resolve({inquiry, resolution, conclusion, version, falsifier | noFalsifier, accepted?, viewer, author})** (`op=contradictionresolve`)
- **R36** — **CHANGE OF MEANING.** After R30's first refusal:
  - an inquiry that is absent, invisible or not a contradiction inquiry is `NOT_A_CONTRADICTION_INQUIRY` (C-93.27), the same answer for each;
  - on K5, a CORRECTED kind or `double_speak_or_reversal` is `PLURALITY_HAS_NO_WRONG_SIDE` (C-93.22);
  - R30's acceptance checks follow.

  **What it writes.** Otherwise it writes `resolution` into the inquiry's document (`inquiry` R46's `resolutionLines`, judged by its R47) and concludes the question through `basis-versions`' `conclude` without a project (its R16–R19). This is the question's own conclusion, never a project's stance (DEC-84 item 4). Both land together or neither does. Every refusal of either is relayed whole.

  **What follows from each kind.**
  - A CORRECTED kind marks its `wrong_side` stale, as R33 does.
  - `dissolved` qualifies both sides, as an evidenced `differs` does.
  - `double_speak_or_reversal` is the inquiry concluded as a finding: nothing further.
  - `obligation_against_act` records no outcome. `conformance` reads it (its R21).
  - `irreconcilable` keeps both sides, and no choice is made.

  A conclusion reached by `basis-versions`' own door carries its resolution the same way, since the state is read from the document (R26), and records no acceptance basis. *(not yet met: N345)*

### New: the recommendation (the machine's one act)

**recommend({run, candidate, coordinates: [{coordinate, reason}], proposedBy, viewer, caller})** (`op=contradictionrecommend`)
- **R37** — **CHANGE OF MEANING** (DEC-77 item 3(b), DEC-84 item 5).
  - **Refusals.** R13's first four, in its order and with its codes (C-93.1, C-93.2, C-22.12, C-93.3, through R21's gate). Then:
    - no coordinates is `RECOMMEND_NO_COORDINATES` (C-93.28);
    - a coordinate outside the key's clarifier vocabulary (R32) is `RECOMMEND_COORDINATE_UNKNOWN` (C-93.29);
    - a blank reason is `RECOMMEND_NO_REASON` (C-93.30);
    - a candidate not shown to this viewer, or not `open` or `explained_not_shown`, is `RECOMMEND_CANDIDATE_NOT_STANDING` (C-93.31).
  - **What it writes.** Otherwise one recommendation per coordinate, each with an id, the run, `proposed_by`, the reason (at most 2,000 characters) and `origin: "machine"`, through one append site. The same run, candidate and coordinate again writes nothing.
  - **What a recommendation is.** It names only a respect in which the sides may differ, never which side is wrong and never a GENUINE kind. It is **standing** while its candidate is `open` or `explained_not_shown`.
  - **The answer** says each recommendation is machine work and not a member's choice. *(not yet met: N345)*

**The promotion check** (registered with `promotion`, its R39)
- **R38** — **WORDING** (enforces R47's link at the record's one door). A non-replay promotion of a document whose `contradiction.candidate` names a candidate this module does not hold, or one whose side the author may not see, is refused `CANDIDATE_NOT_HELD` (C-93.32). *(not yet met: N345)*

### New: the measures

- **R39** — **CHANGE OF MEANING** (DEC-77 item 3; K447 (15)). `acceptanceRates({coordinate?, since?})` answers, per coordinate:
  - `offered`: acts at whose instant a recommendation of it was standing;
  - `accepted`: acts that named it;
  - `chosen_unaided`: acts that recorded it without naming it;
  - `chose_otherwise`: acts that did not record it.

  All are counts, never a bare percentage. `review_due` is true when `accepted / offered` ≥ 0.95 over at least 30 offered. The threshold is stated `PROVISIONAL`, as IDENTIFY's was. It carries no id, and never throws. *(not yet met: N345)*
- **R40** — **CHANGE OF MEANING** (DEC-76 item 3, DEC-84 item 17). `dismissalMeasure({since?})` answers dismissed leads counted by reason, by key and by label, and `false_conflicts`: the count of `same_fact_different_precision` and `not_same_matter`. `real_conflict_not_pursued` is never counted as one. It carries no id, and never throws. *(not yet met: N345)*
- **R41** — **WORDING** (K447 (6)). `sha256(RECOMMEND_PROMPT)` equals `RECOMMEND_PROMPT_SHA256`: the digest under which the blind fixture of dissolved pairs was measured and recorded in `MEASUREMENTS.md`. The prompt changes only with a new measurement that moves the digest in the same change. *(not yet met: N345)*

### Invariants

- **R42** — **CHANGE OF MEANING.** `contradiction_acts` and `contradiction_recommendations` are append-only. A candidate's state, weight and marks are derived at the read from the candidate, those rows and the inquiry's document (R24, R26, R27). Nothing is copied that could disagree. *(not yet met: N345)*
- **R43** — **CHANGE OF MEANING.** A `duty` is never dismissed, muted or set aside, and leaves only by resolution. A `lead` never becomes a duty unless a member acts: taking it up, which leaves it a lead's inquiry, or a K5 `no_difference`. *(not yet met: N345)*
- **R44** — **CHANGE OF MEANING.** Nothing is silently preselected (DEC-77 item 3(c)):
  - every act names every value it records;
  - the plane fills in none;
  - an acceptance names a standing recommendation equal to what the act records (R30).

  Whether a screen showed a recommendation is the surface's to keep true (Suggestions). *(not yet met: N345)*
- **R45** — **WORDING.** `precision` and `unrelated` candidates are never shown as a tension, and are counted wherever R25 answers. *(not yet met: N345)*
- **R46** — **WORDING** (DEC-24, DEC-84 item 5). A machine credential holds no act of R31–R36, and R37 recommends only coordinates. *(not yet met: N345)*
- **R47** — **WORDING.** `contradiction_acts` and `contradiction_recommendations` are declared to record-core's purge by both sides' bundles, as R22 (K23). *(not yet met: N345)*
- **R48** — **WORDING** (DEC-77 item 1). No key pairs an aspiration: aspirations are in contact, never in contradiction. *(not yet met: N345)*

### Uses — WORDING

- **`promotion`** (new edge): `promote` (R35, R36) and `registerStep` (R38).
- **`membership`**: gains `sight` (K5), `isJoinedParticipant` and `projectOwners` (R24's reach).
- **`entities`**: gains `reportResolutionDefect` (its R38).
- **`inquiry`**: gains R46–R48.
- **`basis-versions`**: gains `conclude` (R36), `conclusionOf` (K5), `projectsDrawingOn` (R24), and the version legs (R29).

### Satisfies

- **CHANGE OF MEANING.** Gains:
  - `BIO_Case_Making_v0_1.md` §CONTRADICTION, the two RULED 2026-09-29 subsections (DEC-76, DEC-77)
  - DEC-84 items 1–5, 7, 11, 12, 14, 16 and 17
  - `CONTRADICTION-PRESENT-RESOLVE-DESIGN.md` §4–§9, §11 and §12
  - `BIO_Assistant_and_AI_Roles_v0_1.md` §3 (DEC-24: the machine recommends, a member disposes)
  - `BIO_Membership_Architecture_v2.md` §7
- **WORDING.** K5's judgement: the measured prompt is unchanged, and a K5 arm (two stances, at least one agreeing pair and one differing wording of one claim) is added to the gate's corpus. It is measured, recorded in `MEASUREMENTS.md` and passing (no false conflict) before any K5 candidate is shown.

### Suggestions — WORDING

- **For callers.** The control plane stamps `author`, `viewer`, `proposedBy` and `caller`, and routes the nine ops. A surface that offers "accept" shows the recommendation with its reason before the act, and sends `accepted` only when the member chose it (R44's other half).
- **Atomicity (R36).** Write the resolution through one `promotion.promote`, then `conclude`, inside one outer `record-core.transact`, as `conformance` R6 does. If `conclude` cannot nest, the job reports it.
- **R24's reach for `{project}`.** Use `basis-versions.projectQuestions` (its R41) to list the project's inquiries, then the candidates whose side's inquiry, or content row, is among them.
- **The recommender's prompt** is packaged into the skill pack by `skills`, as the judgement's prompt is.

### Rows (`CONTRADICTION_PAIR_CHECKS` C-60, `CONTRADICTION_CANDIDATE_CHECKS` C-93; promotion stamps them)

| row | code | translation |
|---|---|---|
| C-60.2 | `CANDIDATES_NO_SUBJECT` | "Candidates are read for one thing at a time: a question, a document part, a subject, a record, a project or one candidate. Name exactly one. Nothing was read." |
| C-60.3 | `TENSIONS_TOO_MANY` | "At most 200 items can be asked about in one request. Ask about fewer at a time. Nothing was read." |
| C-93.8 | `NO_CANDIDATE` | "This act is about one contradiction candidate, named by its id, and it names none. Nothing was written." |
| C-93.9 | `NO_SUCH_CANDIDATE` | "No contradiction you can see answers to that id. One whose side you may not see is answered exactly as one that does not exist. Nothing was written." |
| C-93.10 | `MACHINE_CANNOT_ACT_ON_CANDIDATE` | "Saying what a contradiction turned out to be is a member's act, and a machine credential cannot take it. A machine may recommend in which respects the two sides may differ. Nothing was written." |
| C-93.11 | `CANDIDATE_CLOSED` | "That contradiction has already been dismissed or resolved, by the member named, and it stays as they left it. If something new bears on it, take it up as a question. Nothing was written." |
| C-93.12 | `CANDIDATE_TAKEN_UP` | "That contradiction has been taken up as a question, which is named, and it is resolved there by the question's conclusion. Nothing was written." |
| C-93.13 | `RECORD_CANNOT_BE_DISMISSED` | "This conflict is between two things the record itself holds, so it cannot be dismissed. It closes only when a member says how the two differ, which one is wrong, or that they really conflict. Nothing was written." |
| C-93.14 | `DISMISSAL_REASON_UNKNOWN` | "Dismissing a lead gives one of three reasons: the same fact at different precision, not about the same matter, or a real conflict not pursued now. Choose one. Nothing was written." |
| C-93.15 | `CLARIFY_NOT_A_TENSION` | "This is a lead the record noticed about the world, not a conflict in the record, so there is nothing to clarify. Take it up as a question, or dismiss it with a reason. Nothing was written." |
| C-93.16 | `CLARIFY_CHOICE_UNKNOWN` | "That is not one of the answers to 'how do these differ?' for this conflict. The answers are listed with it. Nothing was written." |
| C-93.17 | `CLARIFY_COORDINATE_UNKNOWN` | "Saying the two differ names at least one respect in which they differ, from the ones listed for this conflict. Nothing was written." |
| C-93.18 | `CLARIFY_NO_EXPLANATION` | "Saying how the two differ is explained in your own words, unless you are accepting the recommendation shown. Add a sentence. Nothing was written." |
| C-93.19 | `EVIDENCE_NOT_SEEN` | "Something named as evidence is not one you can see, or is a fact the record does not state. Name only what is shown to you. Nothing was written." |
| C-93.20 | `WRONG_SIDE_UNNAMED` | "Saying one of them is wrong names which one. Nothing was written." |
| C-93.21 | `WRONG_SIDE_NO_REASON` | "Saying one side is wrong is a kept decision, and a kept decision says why. Give the reason. Nothing was written." |
| C-93.22 | `PLURALITY_HAS_NO_WRONG_SIDE` | "These are two projects' own conclusions, and neither is made to adopt the other's answer. Say how they differ, that they really conflict, or take the question up. Nothing was written." |
| C-93.23 | `TAKE_UP_NO_QUESTION` | "Taking a contradiction up starts a question, and the question is yours to word. Accept the suggested wording or write your own. Nothing was written." |
| C-93.24 | `TAKE_UP_NO_FRAME` | "The question is asked around one of the two sides. Choose which one. Nothing was written." |
| C-93.25 | `ACCEPTANCE_NOT_STANDING` | "The recommendation you accepted is no longer standing for this contradiction, or was never made for it. Read it again, and choose. Nothing was written." |
| C-93.26 | `ACCEPTANCE_VALUE_DIFFERS` | "You accepted a recommendation for something this act does not record. Accept only what you are recording, or record it unaided. Nothing was written." |
| C-93.27 | `NOT_A_CONTRADICTION_INQUIRY` | "No question you can see answers to that id as one taken up from a contradiction. Nothing was written." |
| C-93.28 | `RECOMMEND_NO_COORDINATES` | "A recommendation names at least one respect in which the two sides may differ. None was named, so nothing was written." |
| C-93.29 | `RECOMMEND_COORDINATE_UNKNOWN` | "A recommendation may name only the respects listed for this conflict, never which side is wrong or what kind of conflict it is. Nothing was written." |
| C-93.30 | `RECOMMEND_NO_REASON` | "Each recommendation says in one sentence why, so the member can see what the machine saw. One had no reason, so nothing was written." |
| C-93.31 | `RECOMMEND_CANDIDATE_NOT_STANDING` | "That contradiction is not open to recommendation: it has been resolved, dismissed or taken up, or it is not shown. Nothing was written." |
| C-93.32 | `CANDIDATE_NOT_HELD` | "This question names a contradiction the record does not hold, or one you cannot see both sides of. Take a contradiction up from where it is shown. Nothing was written." |
| C-93.33 | `WORDS_MALFORMED` | "A piece of text in this act is longer than it may be. The field and its limit are named. Nothing was written." |

### Interface tests

- **Refusals.** Every refusal has a negative control, in order.
- **Sight.** A candidate with one side in a hidden project answers every read and act as absent. `unresolvedRecordOn` answers that side `{hidden: true}`.
- **Weight.** One case for each label and key (R24). The K5 weight changes after `no_difference`.
- **State (R26).** Taken through each state by acts alone, including a reopened inquiry returning to `taken_up`.
- **R27.** Each mark, over a claim, a leg and an extent.
- **R30.** Accepting a stale recommendation is refused. An accepted act with no explanation records "no words of the member's own".
- **R36 and the other door.** The same conclusion reached through `op=conclude`, with its resolution, reads the same kind.
- **Over-strictness.** A repeated `recommend` writes nothing. A takeUp of a taken-up candidate writes nothing.
- **R39 and R40.** Counts over a scripted sequence.
- **R41.** The digest.
- **Jobs.** `test/m/contradiction/`, with the gate harness's K5 arm and the recommender fixture.

---

## 4. reevaluation (layer 7)

**Terms** — **CHANGE OF MEANING.** The `source` list gains `corrected`.

**reevaluation.md, new after R26:**

> **The corrected side** (N345; DEC-84 item 7)
> - **R27** — **CHANGE OF MEANING.**
>   - **The cause.** R2 gains one cause arm, derived on read: a dependent carries `corrected` when a live leg of it (R7's legs) rests on a side that `contradiction.tensionsOn` (its R27) marks `stale`:
>     - a leg naming the stale claim's or stance's inquiry;
>     - the stale leg's own inquiry;
>     - an inquiry with a leg on the stale leg's or extent's content row.
>
>     The cause carries the candidate, the reason, the member and `since`, the instant of the marking act. It closes as any cause does (R16). Nothing moves: no strength, conclusion or case changes (R19).
>   - **The listing.** `correctedDependents({after, limit, viewer})` answers each (dependent, candidate) so caused, in dependent then candidate order after `after`, at most `limit` (1–200, default 200), with `cursor`. A dependent the viewer may not see is withheld and not counted (R20).
>   - **The recovery read.** `changesOf` (R9) answers it too.
>
>   It writes nothing. *(not yet met: N345)*

**R2** — **WORDING.** "`reopened` when …" gains "; `corrected` by R27".

**R18** — unchanged: R27 writes no row.

**Uses** — **WORDING.** `contradiction` (new edge): `tensionsOn` (its R27).

**Interface tests:**
- A leg on a side marked stale gives the dependent `corrected`.
- A hidden dependent is withheld.
- A recorded re-evaluation closes the cause.
- No table changes across the read.

**Satisfies** — gains DEC-84 item 7 and the design's §9 ("telling the holders").

---

## 5. publication (layer 8)

**R20** — **CHANGE OF MEANING.**
- `CASE_DOCUMENT_FORMAT` becomes `bio-case-document/5`, and `/4` joins the formats accepted as written.
- The three predicates hold for `/5` as they hold for `/4`.
- A new predicate `caseDocumentRequiresTensionSection(fm)` is true for `/5` only.

Mark *(not yet met: N345)*.

*(If N345's DEC-81 part, the grade disclosure, also moves the format, both take this one move to `/5`. BOB folds them together.)*

**R10** — **CHANGE OF MEANING.** Append:

> The answer carries `tensions`, read from the signed document, never live. It lists each contradiction the owner disclosed (`case-authoring` R31), with the finding it touches, both sides with their sources (a side the publisher could not see stated as such, with no id, text or source), its state (`open`, `explained, not yet shown`, `taken up as a question` or `held irreconcilable, to be reopened by new evidence`), the explanation, who acknowledged it and when, and `depth: 1` with its sentence. Beside each member, its attributed tension sentences. A document before `/5` answers `tensions: null` with the sentence that its format predates the disclosure (R28).

Mark *(not yet met: N345)*.

**publication.md, new after R49:**

> - **R50** — **CHANGE OF MEANING** (DEC-84 item 13). `caseTensions({project?, after, limit})` answers, for each case whose latest ratified edition is owned by `project` (every such case when absent), in case id order after `after`, at most `limit` (1–200, default 200), with `cursor`: the candidates `contradiction.unresolvedRecordOn` (its R29) answers over each member at its pinned sha that the edition did not disclose. Each carries the case, the edition, the member, the candidate and its state. A candidate the edition disclosed and that has since been resolved is answered as `resolved_since`. It is read as the plane, for `queue`. It writes nothing, never throws, and composes no strength (R26). The signed edition never changes (R24). A later edition discloses or resolves the tension. *(not yet met: N345)*

**Uses** — **WORDING.** `contradiction` (new edge): `unresolvedRecordOn` (R50).

**Interface tests:**
- A `/5` document's section round-trips to `tensions`.
- A `/4` answers null, with its sentence.
- A tension formed after ratification appears in R50 and leaves when a later edition discloses it.
- The edition's bytes are unchanged.

**Satisfies** — gains:
- DEC-76 item 4
- DEC-84 items 11–13 ("discloses, never blocks")
- DEC-77 item 2 (the attributed tension sentence)
- the design's §10

---

## 6. case-authoring (layer 8)

**R14** — **CHANGE OF MEANING.**
- "format `bio-case-document/4`" becomes "format `bio-case-document/5`".
- The list gains, after the citations: "the tensions disclosed (R31) and, in each member's block, its tension sentences".

Mark *(not yet met: N345)*.

**case-authoring.md, new after R21:**

> **Disclosing a contradiction** (N345; DEC-76 item 4, DEC-84 items 11–13)
> - **R31** — **CHANGE OF MEANING.**
>   - **The input.** `publishCase` takes `tensionsDisclosed: [{candidate, words?}]`.
>   - **The read.** After R12 and before anything is written, it reads `contradiction.unresolvedRecordOn({finding, sha, viewer})` for each member at the bytes this act pins (R13).
>   - **Refusals.**
>     - A read that fails, or is `truncated`, is `TENSIONS_UNDETERMINED` (C-120.3), because what cannot be read cannot be disclosed (R26).
>     - Any candidate it answers that the list does not name is `TENSION_NOT_DISCLOSED` (C-120.1), naming each one. A side the owner may not see is named as "a side you may not see".
>     - A listed candidate the read does not answer is `DISCLOSURE_NOT_STANDING` (C-120.2).
>
>     The case is never refused because a contradiction exists (DEC-76 item 4).
>   - **The section.** Otherwise the document's tension section lists each one: the finding, both sides verbatim with source, date and doctype (a hidden side as "a side the publisher may not see", nothing more), its state, the explanation, the owner's words marked as the owner's, `acknowledged_by` (the `author` stamp) and the instant, and the sentence that the disclosure reaches one level (DEC-84 item 12).
>   - **Each member's block.** It gains one sentence per tension on it, from fixed templates:
>     - "In tension, not yet resolved: …";
>     - "Explained, not yet shown: …";
>     - "Held irreconcilable by the group: …".
>
>     It names no member it may not name. It composes no strength (R24). *(not yet met: N345)*

**R22, R25** — unchanged (the acknowledgement is the `author` stamp; the section is read from the record).

**R29** — **WORDING.** Gains C-120.1–C-120.3.

**Uses** — **WORDING.** `contradiction` (new edge): `unresolvedRecordOn` (its R29). `publication`: the `/5` predicate.

**Rows** (a new family, C-120, "a case's disclosures", held in this module's table; BOB assigns it as the next free family. N345's DEC-81 part may take its next numbers):

| row | code | translation |
|---|---|---|
| C-120.1 | `TENSION_NOT_DISCLOSED` | "A finding in this case rests on something the record holds in unresolved conflict, and a case may be published with it only if the conflict is disclosed. Each one is named. Disclose it, or resolve it first. Nothing was published." |
| C-120.2 | `DISCLOSURE_NOT_STANDING` | "One of the conflicts disclosed is not an unresolved conflict on this case's findings: it may have been resolved since. Read the list again. Nothing was published." |
| C-120.3 | `TENSIONS_UNDETERMINED` | "The record could not be read completely for conflicts on this case's findings, so what must be disclosed is not known. Try again. Nothing was published." |

**Interface tests:**
- An undisclosed tension is refused, and a disclosed one publishes: disclose, never block.
- A hidden side is named with no content.
- An `irreconcilable` conclusion must be disclosed.
- A resolved candidate listed gets C-120.2.
- R18's rollback arm is kept.

**Satisfies** — gains:
- DEC-76 item 4
- DEC-84 items 11–13
- `BIO_Publication_v0_1.md` §3 rule 16 (what the case states about itself)
- the design's §10

**Not here.** Where this sits in DEC-80's ceremony (step three, "what you are leaving out") is N345's DEC-80 part. R31 is its `op=publish` half.

---

## 7. conformance (layer 9)

**R12** — **CHANGE OF MEANING.** Append:

> A comparison may name `contradiction`, the contradiction inquiry it came from (`inquiry` R48). An absent or invisible inquiry, or one that is not a contradiction inquiry, is `NO_SUCH_CONTRADICTION_INQUIRY` (C-113.24). The proposal records the link, and it still carries no outcome.

Mark *(not yet met: N345)*.

**conformance.md, new after R20:**

> - **R21** — **CHANGE OF MEANING** (DEC-76 item 3, DEC-84 item 10). `comparisonFacts({contradiction, standardSide, viewer})` answers the rows a comparison may start from, as facts: `requires` from the side named `standardSide` (`a` or `b`, named by the member, never defaulted) and `did` from the other, each with its source, content id and date, labelled the record's and never an outcome. It answers the question's resolution when it is concluded. R12's refusal applies. It writes nothing. *(not yet met: N345)*
> - **R22** — **CHANGE OF MEANING** (DEC-84 item 10).
>   - **The input.** `determine` takes `cause?: {statement, evidence}`, member-authored.
>   - **Refusals.**
>     - A blank statement, or one over 2,000 characters, is `CAUSE_UNSTATED` (C-113.26).
>     - No evidence, or an evidence content id the author may not see, is `CAUSE_NOT_EVIDENCED` (C-113.25). A hypothesized cause stays in the working inquiry and never enters the determination.
>     - A determination carrying `recommendation` or `policy` is `RECOMMENDATION_IS_AN_ACTION` (C-113.27): a recommendation is a proposed action, recorded by `actions`, never a policy position held here.
>   - **The read.** `determinationRead` (R9) answers the cause, or `cause: null` with the sentence "cause not established". *(not yet met: N345)*

**R9** — **CHANGE OF MEANING.** Append:

> R22's cause; and `outcomes_differ: true` when the per-standard outcomes (R4) are not all the same, the quiet mark DEC-84 item 3 gives a determination's two standards: a statement, with no duty.

Mark *(not yet met: N345)*.

**R1** — **WORDING.** Gains R22's refusals after `SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT`.

**Uses** — **WORDING.** `contradiction` (new edge) and `inquiry` R48, for R12 and R21.

**Rows** (C-113, this module's):

| row | code | translation |
|---|---|---|
| C-113.24 | `NO_SUCH_CONTRADICTION_INQUIRY` | "No question you can see answers to that id as one taken up from a contradiction. Nothing was written." |
| C-113.25 | `CAUSE_NOT_EVIDENCED` | "A cause is recorded on a determination only when evidence you can see shows it. A cause not yet shown stays in the question where it is being worked out, and the determination says the cause is not established. Nothing was written." |
| C-113.26 | `CAUSE_UNSTATED` | "The cause is stated in a sentence of your own, of at most 2,000 characters. Nothing was written." |
| C-113.27 | `RECOMMENDATION_IS_AN_ACTION` | "A determination records what was required, what was done, and why, and never what should be done. Propose an action instead. Nothing was written." |

**Interface tests:**
- A cause with no evidence is refused. A determination with none reads "cause not established".
- `comparisonFacts` never fills an outcome, and needs `standardSide`.
- `outcomes_differ` for a compliant and a noncompliant standard.
- A `recommendation` key is refused.

**Satisfies** — gains:
- DEC-76 item 3 (contradiction is a source of determinations, never a second compliance mechanism)
- DEC-77 item 2 (Criteria, Condition, Cause)
- DEC-84 items 3 and 10

**Suggestion.** The five elements are composed by the surface, never by a module:
- Criteria and Condition from R21's facts or the rows;
- Cause from R22;
- Effect from `consequences`;
- Recommendation from `actions`' proposed action.

---

## 8. affordances (layer 11) — all WORDING (K447: the rungs are BOB's)

- **R1.** `ACTS`' `single` list gains `contradictionresolve`.
- **R2.** `RUNGS`' `reasoned` gains `contradictiondismiss`, `contradictionclarify`, `contradictiontakeup`, `contradictionresolve` and `resolutiondefect`. Each asks a reason, or a question or conclusion, and is corrected forward, as R27 says.
- **R3.** `RUNG_ABSENT` gains `contradictionrecommend`, ground `undetermined`, on `contradictionpropose`'s reasoning: a run proposes, and it is machine work.
- **R7.** `MACHINE_REFUSALS` gains `contradictionresolve` → `MACHINE_CANNOT_ACT_ON_CANDIDATE`. `NON_ACTS` gains:
  - `contradictiondismiss`, `contradictionclarify` and `contradictiontakeup`: "candidate-directed: keyed by a candidate, reached where its sides are shown";
  - `contradictionrecommend`: run-directed;
  - `resolutiondefect`: "registry correction, keyed by a resolution";
  - the four reads `contradictioncandidates`, `contradictiontensions`, `contradictionfacts` and `contradictionmeasures`: "read: …".
- **R8.** `conclude` is withheld on an inquiry whose `contradiction_inquiry` is true. `contradictionresolve` is offered exactly where `conclude` would be on such an inquiry. This keeps R18 true under inquiry R47.
- **R14.** Facts gain `contradiction_inquiry`: true when the document carries `contradiction`, false otherwise, null for a type that is not an inquiry. It is read from the front matter.
- **R4.** `VOCABULARIES` gains `contradiction_coordinates`, `plurality_differences`, `resolution_kinds`, `norm_canons` and `dismissal_reasons`, each the enforcing module's object (inquiry R46; contradiction R31).
- Mark each *(not yet met: N345)*.

**Tests:**
- R8–R10's table gains the contradiction-inquiry rows.
- R12's totality with the ten new ops.
- R20 for `contradictionresolve`.

---

## 9. queue (layer 11)

**R1** — **CHANGE OF MEANING.** `OBLIGATION` gains `contradiction-duty` ("a conflict the record holds that a member of this project must resolve"). `FINDING` gains:
- `contradiction-lead` (a lead the record noticed);
- `contradiction-plurality` (two projects' conclusions that may not both hold);
- `side-corrected` (something a finding rests on was marked wrong);
- `tension-after-publication` (a published case's finding rests on a conflict found since).

**queue.md, new after R42** (under "Contradictions", N345; DEC-76 item 3, DEC-84 items 2, 3, 7, 13):

> - **R43** — **CHANGE OF MEANING.** For each project the member has joined, at most 50 in id order (every visible project when there is no member), with the bound published beside `contradiction_projects_truncated`: one item per candidate `contradiction.candidatesFor({on: {project}})` answers (its R25), keyed `<CLASS>::contradiction::<candidate>` and counted once whatever number of projects it reaches:
>   - `duty` → `contradiction-duty`, `open`, `taken_up` or `explained_not_shown`;
>   - `lead` → `contradiction-lead`, `open`;
>   - `plurality` → `contradiction-plurality`, `open`.
>
>   Each is homed under both sides' ancestors (R7). *(not yet met: N345)*
> - **R44** — **CHANGE OF MEANING.** `side-corrected`: one per (dependent, candidate) that `reevaluation.correctedDependents` answers (its R27), keyed `FINDING::side-corrected::<dependent>::<candidate>` and homed under the dependent's ancestors. It leaves when the cause closes. *(not yet met: N345)*
> - **R45** — **CHANGE OF MEANING.** `tension-after-publication`: one per (case, candidate) that `publication.caseTensions({project})` answers (its R50), for each project the member owns (`membership` R65), at most 50. It goes to those owners, and to nobody else, keyed `FINDING::tension-after-publication::<case>::<candidate>`. It leaves when a later edition discloses it or the candidate resolves. *(not yet met: N345)*
> - **R46** — **CHANGE OF MEANING.** Dispositions (added to R12):
>   - **`contradiction-duty`**: `available: false`, `instead: [contradictionclarify, contradictiontakeup]`, or `contradictionresolve` naming its inquiry when `taken_up`. As an OBLIGATION it is never muted (R19's `KIND_NOT_PERSONAL`, R31).
>   - **`contradiction-lead`**: `available: true`, `scope: candidate`, `acts: [contradictiondismiss, contradictiontakeup]`.
>   - **`contradiction-plurality`**: `available: false` for R27's set-aside, `acts: [contradictionclarify, contradictiontakeup]`. A named difference clears it; a set-aside would not (DEC-84 item 3).
>   - **`side-corrected`**: R12's project-scoped disposition, with `acts: [reevaluationrecord]`.
>   - **`tension-after-publication`**: `available: false`, `instead: publish`.
>
>   *(not yet met: N345)*

**R11** — **WORDING.** Unchanged. The new kinds are catalogued by R1, so the mint holds.

**Uses** — **WORDING.**
- `contradiction` (new edge): `candidatesFor`.
- `reevaluation`: `correctedDependents`.
- `publication`: `caseTensions`.
- `membership`: `projectOwners`, the joined projects.

**Interface tests:**
- A duty cannot be muted.
- A duty reaching two projects is one item with two homes (R32).
- A lead dismissed leaves.
- A plurality mark has no set-aside.
- A hidden side yields no item and no count (R33).
- An owner and a non-owner for `tension-after-publication`.

**Satisfies** — gains DEC-76 item 3, DEC-84 items 1–3, 7 and 13, and the design's §4.

---

## 10. basis-versions (layer 6)

No change. `resolve` concludes through `conclude` without a project (R16–R19), unchanged, as DEC-84 item 4 makes it the question's own conclusion. The "another door" arm is inquiry's C-2.13.

---

## Decided in drafting (BOB's; for `build/rulings.md`)

1. **Resolution shape.** `dissolved` is one kind carrying `coordinates` (several may differ at once, since the clarifier is multi-select). The design's per-coordinate kinds become its coordinates, and `acceptanceRates` is per coordinate. The meaning is unchanged.
2. **`corrected`.** A fourth CORRECTED kind, `corrected` (category not stated), is the inline `one_wrong`'s kind, per DEC-84 item 16. It is also allowed in an inquiry's conclusion.
3. **K5.** DEC-84 item 3's "conclusions that cannot both hold" needs a judgement, so a fifth key forms the pairs and the pinned judgement labels them. K5 has its own weight (`plurality`) and choices (`PLURALITY_DIFFERENCES`; `no_difference`), and no `one_wrong`. Its corpus arm is measured before a K5 candidate is shown.
4. **Who may act.** Any member who may see both sides may act on a candidate, including a duty. No project position is asked, following basis-versions R19's no-project conclusion and DEC-84 item 4.
5. **No clarify on a lead.** A lead is only dismissed or taken up, following DEC-76 item 3's wording.
6. **Acceptance basis.** Per coordinate, `accepted` or `unaided`, with the recommendations standing at the instant. `chosen_unaided` is counted apart from `accepted`, so that a rate is not inflated by choices the member made without the accept act.
7. **The plane fills in no question.** The takeUp question is required. The plane publishes `default_question` for the surface to show. `frame` is required and never defaulted (R44).
8. **Resolve's route.** `resolve` = a promotion writing `resolution`, then `basis-versions.conclude` with no project, both in one outer transaction. basis-versions is unchanged.
9. **No stored holder notice.** Holders are told by derived reads:
   - a stale side, through reevaluation R27 and queue R44;
   - after publication, through publication R50 and queue R45.

   publication is later than reevaluation, so the case half cannot sit in reevaluation. No listener registration is added to `contradiction`.
10. **Quiet marks outside the keys** (DEC-84 item 3) are read from each module's existing statement: conformance R4 and R9's `outcomes_differ`, reevaluation R14, actions R19 and R28, basis-versions' alternative versions. Nothing new is stored.
11. **Disclosure mechanics.**
    - The owner's `publishCase` act is the attributed acknowledgement, with `tensionsDisclosed` as its list.
    - A failed or truncated read refuses (C-120.3), as R11 does for the searched section.
    - The format moves to `/5` (shared with DEC-81's part if both fold together).
12. **K4 subject defect.** On K4, the `subject` coordinate reports a defect on both resolutions that paired the sides, since the member need not know which is wrong. K2 records only the qualifier (its subject is authored, not resolved).
13. **Numbers.**
    - Candidate acts are in C-93, reads in C-60.
    - inquiry opens its own `checks.mjs` at C-2.11.
    - case-authoring takes C-120, a new family.
    - Bounds: pages of 50 or 200; 200 referents; 32 projects per inquiry; 50 projects per member; text caps as in R30.

## Did not reconcile, or needs Bob's eye

- **Sight against disclosure.**
  - The design §4 says a candidate never reveals that a hidden project holds a conflicting claim.
  - §10 (kept here) discloses "a side the publisher may not see" in the published case, which states that such a side exists.
  - A joined member who may not see the other side gets no duty item.

  Both follow the design as reviewed (K447). Bob may want to confirm that a published disclosure may state that an unseen side exists.
- **Design §15.3 versus DEC-84 item 3.** DEC-84 item 3 revises §15.3's recommendation (no mark on two projects' conclusions), so the design's §5 and §14 do not carry K5. This draft adds K5 (decided above). The design document should be amended to match.
- **Design §15.10 versus DEC-84 item 10.** §15.10 put an evidenced-or-hypothesis Cause on the determination. DEC-84 keeps a hypothesis off it. Drafted per DEC-84.

---

## Jobs by layer

| layer | module | what |
|---|---|---|
| 2 | promotion | stamps the rows: C-2.11–C-2.17, C-60.2–.3, C-93.8–.33, C-91.7, C-113.24–.27, C-120.1–.3 (K425) |
| 5 | entities | R38; `resolution_defects`; C-91.7; R14, R15, R30 wording |
| 6 | inquiry | R46–R48; R11, R12 amended; the new `checks.mjs` |
| 6 | contradiction | R24–R48; K5 (R5, R7, R8, R10, R11, R14); R12, R19, R20; the two tables; the promotion check; the K5 gate arm and the recommender fixture, recorded in `MEASUREMENTS.md` |
| 6 | skills | packages `RECOMMEND_PROMPT` into the skill pack; agent-worker's bundle regenerated at the close |
| 7 | reevaluation | R27; R2 |
| 8 | publication | R20 (`/5`), R10, R50 |
| 8 | case-authoring | R14 (`/5`), R31; C-120 |
| 9 | conformance | R12, R21, R22, R9, R1; C-113.24–.27 |
| 11 | affordances | R1–R4, R7, R8, R14 |
| 11 | queue | R1, R43–R46 |
| 11 | control-plane | routes, `NEEDS` rows and stamps for the ten new ops (no requirement text beyond its routing rule) |
| — | `build/modules.json` | the six new edges listed at the top (BOB, with the fold) |
| last | legacy-tests | re-anchors any suite that reads `bio-case-document/4` as current, or the affordances totality |

## For Bob

What changes in meaning, one line per module:

- **entities:** a member can report that the record matched the wrong subject. The report is kept and shown, and changes nothing by itself.
- **inquiry:** a question taken up from a contradiction must, when concluded, say what the conflict turned out to be (differ, wrong side, or genuine), in fixed words.
- **contradiction:** contradictions are now shown to members who can see both sides. A record conflict is a duty on every project using either side, until someone resolves it. A world lead can be dismissed with one of three reasons. Members resolve inline or by taking the conflict up as a question. The machine may only suggest in which respects the two sides differ, and accepting a suggestion is recorded as such and measured. Two projects' conclusions that cannot both hold now get a mark (a new pairing), which a named difference clears.
- **reevaluation:** when a side is marked wrong, every finding resting on it is told. Nothing changes by itself.
- **publication:** the published case now carries a "tensions disclosed" section. A tension found after publishing is reported to the owning project, and the signed edition is never changed.
- **case-authoring:** publishing is refused only when an unresolved record conflict on the case is not disclosed. Once disclosed, it publishes. Disclosure is the owner's attributed act.
- **conformance:** a comparison can start from a contradiction, with its facts filled in and never its outcome. A cause is recorded only when evidenced, otherwise "cause not established". A determination may not hold a recommendation. It states when its standards disagree.
- **queue:** new items: the conflict duty (cannot be muted), leads, two-project marks, "something you rest on was corrected", and, for case owners, "a conflict found since publishing".
- **affordances:** no change of meaning. The new acts get their rungs, and "conclude" gives way to "resolve" on a contradiction question.
