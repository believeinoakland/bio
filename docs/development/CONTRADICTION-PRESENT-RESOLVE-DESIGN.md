# Contradiction — PRESENT and RESOLVE: how a member meets a candidate, and how resolving it records its kind

**Status** · DRAFT · written by a worker for BOB #66, 2026-09-29 (N344; K439); REVIEWED by BOB #66 (K447): its reading of DEC-76 and DEC-77 and its module placement checked; §15 points 6, 8, 9, 15 and 18 ruled by BOB as recommended; the other thirteen RULED by Bob as DEC-84 (2026-09-29): all as recommended, points 3 and 10 as revised there; DEC-84 governs where it and §15 differ; its #3 adds a fifth pairing key, K5 (two projects' conclusions on one question that cannot both hold in the same respect), shown only once the gate's corpus holds a K5 case (N345's draft, K454). Its requirement changes (§14) are N345's, drafted after Bob rules §15.

It continues `CONTRADICTION-IDENTIFY-DESIGN.md` §9 item 4. It rests on two rulings of Bob's of 2026-09-29: DEC-76 (a contradiction is conditional; a taken-up candidate becomes an inquiry whose conclusion records its kind; three families of kind; an unresolved RECORD contradiction is disclosed at publication) and DEC-77 (inline by default; six presentation forms; context recommends and never silently decides; the attributed act of accepting a proposal; its acceptance rate measured). Both are folded into `BIO_Case_Making_v0_1.md` §CONTRADICTION. This document decides only mechanism beneath them. Where it needs a choice the rulings do not make, it says so in §15 and does not make it. The screens themselves are the UX redesign's; this document says what the plane must hold and answer so that they can be built, and never what they look like. Every module, table and service it names as existing was read on `tranche/T13` on 2026-09-29.

**Place in the system** · Level 2 beneath `BIO_Case_Making_v0_1.md` §CONTRADICTION (mechanisms 2 and 3 of 3), for construct 8's `8.contradiction` in `BIO_System_Design.md` §3. It depends on IDENTIFY (`contradiction` R1–R23, built: the pairing read, the judgement, `contradiction_candidates`), on `inquiry` (the one recursive object), `basis-versions` (a conclusion), `promotion` (writing an inquiry), `entities` (resolutions), `content` (a side's passage), `BIO_Assistant_and_AI_Roles_v0_1.md` (DEC-24: the machine proposes, a member disposes; the machine never writes the member's reason) and `BIO_Membership_Architecture_v2.md` §7 (sight). `conformance`, `case-authoring`, `publication`, `reevaluation` and `queue` will read what it holds.

**Contents**
- [1. What PRESENT and RESOLVE are for, and what would make them worthless](#1-what-present-and-resolve-are-for-and-what-would-make-them-worthless)
- [2. The terms the rulings fix](#2-the-terms-the-rulings-fix)
- [3. What exists today, and what this adds](#3-what-exists-today-and-what-this-adds)
- [4. What reaches a member, and at what weight](#4-what-reaches-a-member-and-at-what-weight)
- [5. PRESENT: the tension mark, the clarifier and the six forms](#5-present-the-tension-mark-the-clarifier-and-the-six-forms)
- [6. Context: facts filled in, judgements recommended, nothing preselected](#6-context-facts-filled-in-judgements-recommended-nothing-preselected)
- [7. RESOLVE inline: the clarifier's acts](#7-resolve-inline-the-clarifiers-acts)
- [8. RESOLVE by inquiry: the contradiction inquiry and its conclusion](#8-resolve-by-inquiry-the-contradiction-inquiry-and-its-conclusion)
- [9. The three families, and what each does to the record](#9-the-three-families-and-what-each-does-to-the-record)
- [10. Publication: disclosing an unresolved RECORD contradiction](#10-publication-disclosing-an-unresolved-record-contradiction)
- [11. Accepting a proposal, and its acceptance rate](#11-accepting-a-proposal-and-its-acceptance-rate)
- [12. Where each part lives](#12-where-each-part-lives)
- [13. Decomposition, in order](#13-decomposition-in-order)
- [14. Requirement changes this implies (N345)](#14-requirement-changes-this-implies-n345)
- [15. Open points](#15-open-points)

---

## 1. What PRESENT and RESOLVE are for, and what would make them worthless

IDENTIFY proposes candidates and stores them out of sight (`contradiction` R19). PRESENT puts a candidate in front of a member, both sides in the record's own words, where the two points already sit. RESOLVE is the member's attributed act that says what the conflict turned out to be, and records that KIND.

Four failures would make them worthless, and each design choice below guards one.

- **Burying members.** A RECORD duty nobody can clear, or a flood of leads, gets switched off. So a WORLD lead dismisses in one act, a RECORD tension closes in one act when its evidence is on the screen, and the dedicated screen is the escalation, never the norm (DEC-77 item 1).
- **Resolving by assumption.** "They were talking about different years" ends a conflict only if something shows it. A coordinate offered without evidence leaves the conflict hypothetically dissolved, not resolved (DEC-76 item 1). The tension mark softens and does not clear.
- **Steering.** A recommendation accepted every time has become a decision. So acceptance is its own recorded act, and its rate is measured per kind (DEC-77 item 3).
- **Hiding.** A finding resting on an unresolved RECORD contradiction may be published, and the contradiction is disclosed in it. The gate discloses; it does not block (DEC-76 item 4).

## 2. The terms the rulings fix

These are Bob's terms, restated so the rest of this document can use them. Nothing here adds to them.

- **A contradiction is conditional.** Two assertions conflict only if they cannot both hold IN THE SAME RESPECT: the same subject, time or occasion, scope, meaning of terms, observer or method, accurate capture, and for rules the same applicability. These are the **coordinates**. A **candidate** is an apparent conflict whose shared coordinates are assumed (DEC-76 item 1).
- **Resolving** is one of three findings: the respect in which the sides differ, the side that is wrong, or that the conflict is genuine (DEC-76 item 1).
- **The machine may propose** which coordinates differ, labelled as machine work. It never picks one (DEC-76 item 1, DEC-24).
- **A candidate a member takes up becomes an INQUIRY.** Its question is how both sides can be held or which is wrong. Both sides are its legs. Each assumption explored is a sub-inquiry. Resolving it is the inquiry's conclusion, which records its KIND (DEC-76 item 2).
- **The three families** (DEC-76 item 3): DISSOLVED, CORRECTED, GENUINE (§9).
- **WORLD and RECORD weigh differently.** A WORLD candidate carries no duty and reaches a member as a lead to take up or dismiss with a reason. A RECORD candidate carries the duty, waits in a member's queue until resolved, and marks each side "in tension" wherever it is shown (DEC-76 item 3).
- **Disclosure.** A finding whose basis holds an unresolved RECORD contradiction may be published; the contradiction is disclosed, stated and attributed, in the pattern of `NO_FALSIFIER`'s override (DEC-76 item 4).
- **Inline by default**, with the "how do these differ" clarifier; **six presentation forms**; **context supports and never silently decides**; **accepting a proposal** is a new attributed act, introduced for contradictions first; **its acceptance rate is measured** (DEC-77 items 1–3).
- **Aspirations are excluded.** They are in contact, never in contradiction (Content Framework; DEC-77 item 1).

## 3. What exists today, and what this adds

| part | today | this design adds |
| --- | --- | --- |
| pairing and judgement | BUILT: `op=contradictionpairs`, `op=contradictionpropose`, `contradiction_candidates` with `state` always `proposed` (`bio-plane/src/contradiction/`, `contradiction.mjs`; `contradiction` R1–R23) | nothing; PRESENT reads the candidates as they are |
| a read of a candidate | none (R12: `judgement.state: NOT_REACHED`; R19: no read shows a candidate) | the candidate reads (§5), viewer-gated like the pairing |
| a member's act on a candidate | none | dismiss, clarify, take up, resolve (§7, §8), each attributed, each an appended row |
| the coordinate proposals | none | a second labelled machine proposal per candidate (§6) |
| filled-in facts | the sides already carry the reader-stated date and doctype (R9) and their capture | a read that states each fact with its source, or undetermined (§6) |
| an inquiry | BUILT: `inquiry` (grammar, legs, sub-inquiries as inquiry legs), `basis-versions` (`conclude`, no-project and project conclusions), `promotion` | a contradiction inquiry: its link to the candidate, its sub-inquiries' coordinate, and a conclusion that names its kind (§8) |
| the stale mark | `content.stale` exists, but only for a transcription change (content R22), and its meaning is a stated read contract (content R45) | a correction mark of its own, held with the contradiction, never by reusing `content.stale` (§9) |
| a comparison before publication | BUILT in requirements: `conformance` `comparisonPropose` (R12) and `determine` (R1–R8) | a comparison may name the contradiction it came from (§9) |
| the published case | `case-authoring` authors the document (`bio-case-document/4`, R14); `publication` stores and serves it (R20–R22, R10) | a disclosure section for unresolved RECORD contradictions (§10) |
| accepting a proposal | not an act the record has; the member surfaces read DEC-24 strictly (actions' governing laws, UI-102) | the act, for contradictions first (§11) |
| the measures | the false-conflict gate on a synthetic corpus (M-118, M-162) | the dismissal measure and the acceptance rate, per kind (§11) |

## 4. What reaches a member, and at what weight

**The gate stays.** A judgement that fails the over-strictness gate (IDENTIFY §7) reaches no member. The pinned judgement passed it (M-162). Nothing here changes that.

**Which labels are shown.** A candidate labelled `precision` or `unrelated` is Bob's NEITHER case: it is not a contradiction and is never shown as a tension. It is counted, so its absence is stated and not silent. A candidate labelled `world` is a **lead**. A candidate labelled `record` is a **duty**. What a candidate labelled `undetermined` becomes is not ruled (§15, point 1).

**Sight.** A candidate is shown only to a viewer who may see both of its sides now, through the same bundle gate the pairing uses (`contradiction` R10). A candidate whose side the viewer may not see answers exactly as an absent one. It never reveals that a hidden project holds a conflicting claim.

**Weight.**

| weight | which | where it waits | how it leaves |
| --- | --- | --- | --- |
| **lead** (WORLD) | `world` candidates | the queue, as a FINDING the record noticed (D-82: it names its source and derivation) | taken up (becomes an inquiry), or dismissed in one act with a reason |
| **duty** (RECORD) | `record` candidates | the queue, until resolved; each side marked "in tension" wherever shown | resolved: inline in one act, or by the contradiction inquiry's conclusion. Never dismissed, muted or set aside |

Whose queue a duty waits in is not ruled (§15, point 2).

**A changed side is a new candidate.** IDENTIFY versions each side (R14). A resolution is a statement about two things as they were. When a side changes, the old candidate keeps its resolution, and a new candidate over the new version is judged afresh.

## 5. PRESENT: the tension mark, the clarifier and the six forms

**Inline by default.** DEC-77 item 1 lists the places where two conflicting points already sit together: an inquiry's supporting and cutting-against legs; alternative basis versions; a determination's disagreement or its two standards; cases that disagree; a subject two sources describe differently; a newer capture that no longer holds a cited passage; a machine proposal beside a member's list; two projects' conclusions on one inquiry. In each, a **tension mark** opens the clarifier (§7). The dedicated screen is the contradiction inquiry (§8), reached only by "they really conflict" or "not sure".

IDENTIFY's four keys cover some of those places and not others. K1 is an inquiry's opposite legs. K2 and K3 are held claims. K4 is a subject two sources describe differently. A determination's disagreement is already stated by `conformance` R4. A newer capture that drops a passage is already a notice (`reevaluation` R14). A machine proposal beside a member's list is already stored apart (`actions` R19, R28). Two projects' conclusions on one inquiry are, by IDENTIFY §3, plurality and not a record defect. Whether those non-candidate places carry a tension mark, and at what weight, is not ruled (§15, point 3). This design builds the mark over candidates first.

**The six forms.** Each serves one purpose (DEC-77 item 2). The plane answers what each needs; the layout is the redesign's.

| form | purpose | what the plane answers | new or existing |
| --- | --- | --- | --- |
| **compare view** | seeing it | both sides verbatim, each with its source, date, doctype and capture as its reader states them; the key and its sentence saying why the two were paired; the label and reason as labelled machine work | new read over existing rows (`candidatesFor`, below) |
| **timeline** | understanding a reversal | the dated sides of every candidate that names one subject entity, in stated-date order; an unstated date is placed nowhere and counted, never guessed (IDENTIFY §4) | new read (`candidatesFor` by entity); dates as held |
| **assumptions checklist** (the Key Assumptions Check) | clarifying it; the contradiction inquiry's working view | one row per coordinate: not examined; proposed by the machine (labelled); stated as differing, as hypothesis or evidenced; ruled out. A row's evidence is the sub-inquiry exploring that coordinate | new: the sub-inquiry's coordinate (§8) |
| **competing-hypotheses matrix** | weighing a conflict that will not dissolve, and a conflict of norms | the contradiction inquiry's legs against its hypotheses. For a conflict of norms the columns are the canons that reconcile rules; the facts each canon needs (a standard's level, its period, what it supersedes) come from `standards`' reads | presentation over existing reads; whether its cells are stored is §15, point 9 |
| **Criteria, Condition, Cause, Effect, Recommendation** | pointing the finger: the published form of an obligation-against-act finding | Criteria from the standard side, Condition from the act side (facts, each with its source); Cause is held by no requirement today | Cause is new; where the five are held and published is §15, point 10 |
| **in-place tension marker** | signalling it | for any side shown anywhere: whether it is in tension (an unresolved RECORD candidate), softened (explained, not yet shown), stale (corrected, with its reason), or qualified (dissolved, with its qualifier). Published as an attributed sentence (§10) | new read (`tensionsOn`) |

**Reads (in `contradiction`).**

- `candidatesFor({on, label?, weight?, state?, after?, limit?, viewer})`. `on` names an inquiry, a content row, an entity, a bundle, or one candidate. Answers the candidates the viewer may see, each with its key, both sides, the label and reason labelled machine work, its weight, its state (below), its resolution when it has one, and the standing coordinate proposals. Bounded (at most 50 a page, `truncated` observed by reading one past, as `contradiction` R7). An empty answer names its level, never a bare empty list (IDENTIFY §6): nothing paired there; pairs formed and none labelled `world` or `record`; candidates held that the viewer may not see is NOT a level, because saying so would reveal them. Writes nothing.
- `tensionsOn({referents, viewer})`. For each referent at its version (a claim `inquiry|version`, a content row at its capture: `contradiction` R14), answers its marks: `in_tension`, `softened`, `stale` with its reason, `qualified` with its qualifier, and `lead`. Every surface that shows a side reads it, so no surface holds a copy of the rule. At most 200 referents a call. Writes nothing.

**A candidate's state is derived, never stored in place.** `contradiction_candidates` stays append-only (R17). Each member act appends a row (§7). The state is read from the latest act and, once taken up, from the contradiction inquiry's own state and conclusion:

`open` → `dismissed` (lead only) · `explained_not_shown` (softened) · `resolved` (with its kind) · `taken_up` (an inquiry is open) → `resolved` (the inquiry concluded, with its kind). An inquiry that is reopened makes its candidate `taken_up` again.

## 6. Context: facts filled in, judgements recommended, nothing preselected

DEC-77 item 3 separates three things. The plane keeps them apart.

**(a) A fact the record holds is filled in with its source.** Two dates that differ, one issuing body, two different subject entities. `contextFacts({candidate, viewer})` answers each fact as `{coordinate, a, b, source}`, computed deterministically from what the sides already carry: the reader-stated date and doctype (`contradiction` R9), each capture, and each side's resolved entity (`entities`). A fact the record does not state is `undetermined` with why, never guessed. A fact directs no one: it is shown, and the member still judges whether it explains the conflict. It is plane work, not machine work, and it is labelled as the record's.

**(b) A judgement is recommended.** Which coordinates may differ is a judgement. It comes from a run, as labelled machine work, the same way a candidate does. `recommend({run, candidate, coordinates: [{coordinate, reason}], proposedBy, viewer, caller})` (`op=contradictionrecommend`) appends proposals through one append site. Its refusals follow `contradiction` R13's order and gates: no proposer; no run, or one absent, invisible, not running or not the caller's; no coordinates; a coordinate outside the vocabulary; a blank reason; a candidate that is not standing for this viewer. A re-run over the same candidate with the same proposal writes nothing. The recommendation is shown first, with its reason, labelled machine work, and accepted in one act (§11). Its prompt is pinned by digest, as the judgement's is (`contradiction` R2); what it must pass before a member sees it is §15, point 6. Whether the machine may recommend anything beyond coordinates is §15, point 5.

**(c) Nothing is silently preselected.** A value a member never saw does not enter the record under their name. The plane enforces the half it can: every act names every value it records, the plane fills none in, and an acceptance must name the proposal it accepts, which must be standing and must equal the value chosen. The plane cannot see what a screen showed; that half is the surface's obligation, stated as a Suggestion for callers.

**Context also sets choices, order, weight and appearance** (DEC-77 item 3): obligation against act first in a determination; kinds of document change first on a changed capture; a RECORD duty against a dismissible WORLD lead; a quiet mark inside an inquiry and a disclosed notice on a published case. The weight is the plane's (§4). The order and appearance are the redesign's. So that no surface holds a copy of a rule, the plane publishes the clarifier's vocabulary and the kinds' vocabulary as data, as `affordances` publishes the other vocabularies.

## 7. RESOLVE inline: the clarifier's acts

The clarifier asks HOW DO THESE DIFFER. Its choices are DEC-77's, exactly: the coordinates as multi-select (different time or occasion; part or scope; meaning; observer or method; not the same subject), plus "one of them is wrong", "they really conflict" and "not sure". Each act below is a member's, attributed, and appended as a row on the candidate. A machine credential holds none of them.

**`clarify({candidate, choice, …, accepted?, viewer, author})`**

- **`differs`** names one or more coordinates and the member's stated explanation.
  - With evidence on the screen (the act names the content rows, legs or filled facts that show it, each one the viewer may see), the candidate is **resolved** as DISSOLVED in one act. Both sides stay. Each side gains its distinguishing qualifier, marked evidenced.
  - Without evidence, the candidate is **explained, not yet shown**. Each side's qualifier is marked hypothesis. The tension mark softens and does not clear. A RECORD duty stays in the queue, softened (DEC-76: hypothetically dissolved is not resolved).
  - "Not the same subject" also reports a defect on the resolution that paired the two (§9).
- **`one_wrong`** names which side and a required reason. That side is marked stale with the reason (§9). This is CORRECTED, and it discharges a RECORD duty.
- "They really conflict" and "not sure" are not clarify choices: they are `takeUp` (§8).

**`dismiss({candidate, reason, viewer, author})`** is a lead's one act. It needs a reason, because dismissals feed the over-strictness measurement (DEC-76 item 3). A RECORD candidate cannot be dismissed: it is refused by name, and the answer says a RECORD tension closes only by a resolution.

**Closing a RECORD tension names its reason and its member** (DEC-77 item 1). Every act above that closes one carries its author and a reason: the explanation, or the stated reason for the wrong side.

**What the rows hold.** One append-only table (`contradiction_acts`, K23's purge by both sides' bundles as R22): the candidate, the act, the author and instant, the coordinates, the explanation, the evidence named, the wrong side and its reason, each side's qualifier, and the acceptance basis (§11). The rows never change a side. The marks they imply are read through `tensionsOn`.

## 8. RESOLVE by inquiry: the contradiction inquiry and its conclusion

**`takeUp({candidate, question?, project?, viewer, author})`** turns a candidate into an inquiry, through `promotion`, in one act. The inquiry is `open`. Its question is how both sides can be held or which is wrong: the member's words, or a stated default shown to them before the act. Both sides are its legs: a claim side as a leg on the inquiry that holds the claim, a leg or extent side as a leg on its content row. The document names the candidate it came from, so the candidate reads `taken_up`. A candidate already taken up answers its existing inquiry and writes nothing. How the two sides take the grammar's `supports` and `cuts_against` roles is §15, point 8.

**Sub-inquiries are the assumptions.** Each coordinate a member explores is a sub-inquiry, cited as an inquiry leg of the contradiction inquiry, and its document names the coordinate it explores. That is what the assumptions checklist reads. A sub-inquiry concluded is a coordinate evidenced, and until then it is hypothesis.

**The irreconcilable pair needs no claim object** (DEC-76 item 2). An inquiry that concludes both sides are well supported, keeping both without choosing, records the kind `irreconcilable`. An inquiry may also stay open while evidence builds; its candidate stays `taken_up`, and a RECORD duty stays unresolved.

**`resolve({inquiry, resolution, conclusion, falsifier | noFalsifier, accepted?, viewer, author})`** concludes the contradiction inquiry and records its kind in its conclusion. `resolution` is `{kind, coordinates?, qualifiers?, wrong_side?, reason?, canon?}`, its kind from §9's vocabulary. The conclusion keeps every existing obligation: at least one leg, a falsifier stated or its absence overridden by a named member (`inquiry` R2, `basis-versions` R16). A conclusion of a contradiction inquiry that names no kind is refused by the inquiry's grammar, so the kind cannot be skipped by concluding through another door. Whether the conclusion is the question's own or a project's is §15, point 4.

**What the inquiry answers, the candidate reads.** The candidate's state and kind are derived from the inquiry's state and conclusion at the read. No listener is needed, and nothing is copied that could disagree.

## 9. The three families, and what each does to the record

The kinds are DEC-76 item 3's, as one vocabulary used by both the inline acts (§7) and the inquiry's conclusion (§8).

| family | kinds | what it does | discharges a RECORD duty |
| --- | --- | --- | --- |
| **DISSOLVED** | a coordinate differed: `subject`, `time_or_occasion`, `scope`, `meaning`, `observer_or_method`, `precision`; and `opinion` (two attributed opinions) | both sides stay; each gains the distinguishing qualifier, evidenced or marked hypothesis; a wrong subject match also reports a defect in `entities` | when evidenced; a hypothesis only softens it |
| **CORRECTED** | `misquote`, `transcription_or_reading_error`, `superseded_version` | the wrong side goes stale with its reason; it is never deleted | yes |
| **GENUINE** | `double_speak_or_reversal`, `obligation_against_act`, `conflict_of_norms` (reconciled by a named canon, or `unreconciled`), `irreconcilable` | below | yes; `irreconcilable` records the choice not to choose |

**DISSOLVED: the qualifier.** A claim version is frozen (`basis-versions` R29) and a content row is the source's words, so neither side is edited. The qualifier is held with the contradiction, keyed to the side at its version, and read by `tensionsOn` wherever the side is shown. A member who wants the qualified claim in the claim's own words writes a new version through `basis-versions`' existing acts; that is theirs, and nothing here requires it.

**DISSOLVED by subject: the defect in `entities`.** K4 pairs two sources through established resolutions to one entity. "Not the same subject" means one of those resolutions is wrong. `entities` has no act for that today: a member can withdraw an alias or a relation (`entities` R8), not report a resolution. This design needs `reportResolutionDefect({resolution, reason, source, by})` in `entities`: an appended report that moves nothing, read beside the resolution and shown to members so they can re-resolve (the pattern of R8's withdrawn alias). `entities` is earlier than `contradiction`, so `contradiction` calls it.

**CORRECTED: the stale mark.** The wrong side is marked stale with its reason, the member and the act that marked it. It is never deleted and it still resolves, saying it was corrected. The mark is held with the contradiction and read through `tensionsOn`. It is NOT `content.stale`: that column means "cited under an earlier transcription" and is a stated read contract (`content` R45). What a stale mark does to what rests on the side is §15, point 7. This design moves nothing by itself; it tells the holders (below).

**GENUINE.**
- **Double-speak or reversal by a subject** promotes into a finding. The contradiction inquiry concluded is that finding: its conclusion is the discrepancy, its legs both sides. A RECORD candidate becomes a WORLD finding, which is Bob's case two turning into case one. Nothing further is needed.
- **Obligation against act** routes into `conformance`. The contradiction records no outcome, so it is never a second compliance mechanism. The route is the existing one: before publication a comparison is inquiry work (`conformance` R12, K102). `comparisonPropose` may name the contradiction inquiry it came from, and its rows are pre-filled as facts from the two sides (the standard side as `requires`, the act side as `did`, each with its source), shown to the member and never an outcome. After the finding is published, a member determines (`conformance` R1–R8, unchanged). `conformance` is later than `contradiction`, so it reads it.
- **Conflict of norms** is explored by the canons that reconcile rules: higher over lower, later over earlier (through `standards`' periods and `supersedes`), specific over general, and harmonization, which is the dissolved family applied to rules. The canon that reconciles it is recorded. A conflict none reconciles is itself a finding; it may support an `unclear` determination, whose question names the contradiction inquiry (`conformance` R6 already allows an existing inquiry), and an action.
- **Irreconcilable**: both held, no choice made (§8).

**Telling the holders.** When a side goes stale, or a finding's basis gains or loses an unresolved RECORD tension, the members whose findings rest on that side are told through `reevaluation`, as a notice and never a silent change (Operational Principle 4). `reevaluation` is later than `contradiction`, so it reads it through a registration (K31's pattern).

## 10. Publication: disclosing an unresolved RECORD contradiction

**The rule** (DEC-76 item 4). A finding whose basis holds an unresolved RECORD contradiction may be published. The contradiction is disclosed in the published record, stated and attributed. The gate is at publication, and it discloses rather than blocks. DEC-80 item 2 puts it in step three of the ceremony ("what you are leaving out").

**Unresolved** means a `record` candidate that is `open`, `explained_not_shown` or `taken_up`, over a side the finding's basis holds at the bytes the case pins. Whether an `irreconcilable` conclusion is disclosed too is §15, point 11. How deep "holds" reaches is §15, point 12.

**The read.** `unresolvedRecordOn({finding, sha})` in `contradiction` answers those candidates, each with both sides, its state, its explanation if any, and the inquiry if one is open. It is read as the plane, because a publisher must see every tension on what they publish; a side the publisher may not see is disclosed as "a side you may not see", never skipped.

**The disclosure.** In the pattern of `NO_FALSIFIER`'s override (the `falsifier_override_by` and `_at` pair): the case is never refused because a contradiction exists. It is refused only when an unresolved RECORD contradiction on its basis is not disclosed. The owner discloses each by an attributed acknowledgement. The case document gains a section listing each one: the finding it touches, both sides with their sources, its state, and who acknowledged it and when. Beside each affected member of the case, the in-place tension marker is published as an attributed sentence (DEC-77 item 2). `case-authoring` authors the section and checks the acknowledgement, because it authors the document (`case-authoring` R14) and runs the pre-flight (DEC-80 item 3). `publication` states the format that requires the section (its R20 predicates) and carries it on the published read (its R10). Neither composes a strength (publication R26).

**After publication.** A published edition never changes (publication R24). A RECORD tension found later on a published finding reaches the owning project as a re-evaluation notice, so a later edition can disclose or resolve it. This is §15, point 13.

## 11. Accepting a proposal, and its acceptance rate

**The act.** DEC-77 item 3(b) introduces ACCEPTING A PROPOSAL, attributed like any other act, for contradictions first. Every contradiction act that records a judgement (`clarify`, `resolve`) carries an **acceptance basis**: `unaided` (no recommendation was standing), `chose_otherwise` (one or more were standing and the member chose differently), or `accepted` naming the proposal. An acceptance must name a standing proposal whose value equals what the act records, else it is refused by name. The record keeps which proposal was accepted. The machine's reason stays labelled as the machine's; it is never recorded as the member's reason (DEC-24 rule 1). How that meets "accepted in one act" is §15, point 14.

**Only contradictions, for now.** Governing laws and risk tiers are reconsidered under this act separately and are not changed by DEC-77. `actions` R19 and R28 stay as they are. `conformance` R18 (a determination names the comparison it drew on) is the nearest existing shape; aligning it is not in this design. The acceptance vocabulary is held in `contradiction` until a second module carries it; then it moves to the earliest module both use.

**The measures.**
- `acceptanceRates({kind?, since?})` answers, per recommendation kind (today: each coordinate), how many acts had a recommendation standing, how many accepted it, and how many chose otherwise, with the counts and never a bare percentage. A rate near all is the signal that recommendations have become decisions, and they are reviewed, as the detector's false-conflict rate is. The plane counts a recommendation as offered when it was standing at the act's instant; whether a screen showed it is the surface's to keep true.
- `dismissalMeasure({since?})` answers dismissed leads by reason, per key and per label. It is the over-strictness arm measured on real documents, which IDENTIFY §7 names as its binding gap: dismissals whose reason says "not a conflict" are false conflicts the synthetic corpus could not show.
Both are recorded in `MEASUREMENTS.md` when first read. What rate triggers a review is §15, point 15.

## 12. Where each part lives

The order is `build/modules.json`'s. A module uses only earlier ones; a later one reads an earlier one, or registers with it.

| part | module (order) | why there |
| --- | --- | --- |
| the kinds' and coordinates' vocabulary; the contradiction inquiry's grammar (its candidate link, a sub-inquiry's coordinate, a conclusion that names its kind) | `inquiry` (36) | the grammar judges the document at every promotion; `basis-versions` and `contradiction` are later and read the vocabulary from here |
| the conclusion act the kind rides on | `basis-versions` (38), unchanged if §15 point 4 goes as recommended | `resolve` concludes through it |
| candidate reads, marks, facts, recommendations, the member acts, the disclosure read, the measures | `contradiction` (40) | it holds the candidates; it uses `promotion` (new), `entities`, `inquiry`, `basis-versions`, `content` |
| the resolution-defect report | `entities` (29) | it holds resolutions; `contradiction` calls it |
| notices to holders | `reevaluation` (47) | later; reads `contradiction` through a registration |
| the section's format predicate; the published read | `publication` (48) | the format grammar is its R20; the published read is its R10 |
| the disclosure's authoring and acknowledgement; the pre-flight | `case-authoring` (50) | it authors the document (R14) and holds the pre-flight (DEC-80) |
| a comparison naming its contradiction; Cause | `conformance` (53) | it holds comparisons and determinations; it reads `contradiction` |
| the duty and lead items | `queue` (62) | it holds the member's feed; it reads `contradiction` |
| the acts' weights and rungs | `affordances` (61) | every writing op is in `RUNGS` or `RUNG_ABSENT` (its R3) |
| the six forms' screens | the UX redesign | UX is the redesign's; the plane answers what each form needs |

## 13. Decomposition, in order

1. **`inquiry`: the grammar.** The vocabulary; a contradiction inquiry's candidate link; a sub-inquiry's coordinate; a conclusion that must name its kind. Before any act can write one.
2. **`contradiction`: the reads.** `candidatesFor`, `tensionsOn`, `contextFacts`, with sight and bounds. Nothing written. This is PRESENT's plane half, and it lifts R19's "no read shows a candidate".
3. **`contradiction`: the acts.** `dismiss`, `clarify`, `takeUp`, `resolve`, the acts table, the derived state, the acceptance basis. With `entities`' defect report.
4. **`contradiction` + the run: `recommend`.** Its prompt pinned and measured as §15 point 6 settles.
5. **`queue`, `reevaluation`, `affordances`.** The items, the notices, the rungs.
6. **`case-authoring`, `publication`.** The disclosure, its acknowledgement and the format.
7. **`conformance`.** A comparison from a contradiction; Cause as §15 point 10 settles.
8. **The measures.** `acceptanceRates` and `dismissalMeasure`, first read recorded.
9. **The redesign's screens**, over 2–8.

## 14. Requirement changes this implies (N345)

Each item is in outline, for BOB to draft. **Every item below is a change of meaning, for Bob's approval** (P17), unless it says otherwise.

**`contradiction`** — change of meaning, for Bob's approval.
- Purpose and R19: PRESENT and RESOLVE are held here; a read may now show a candidate to a member, under R10's sight.
- New reads: `candidatesFor`, `tensionsOn`, `contextFacts`, `unresolvedRecordOn`, `acceptanceRates`, `dismissalMeasure` (§5, §6, §10, §11), each with inputs, outputs, bounds and its empty-level statement.
- New acts: `dismiss`, `clarify`, `takeUp`, `resolve`, `recommend` (§6–§8), each with its refusals in order; none a machine's except `recommend`.
- R12: `judgement.state` answers what is now reached. R15's `state` is no longer the only state: the state is derived (§5); R17 holds, the acts being appended rows.
- Uses gain `promotion`; `entities` gains the defect report as a use.
- Invariants: a RECORD candidate is never dismissed; nothing preselected; an acceptance names a standing proposal equal to its value; `precision` and `unrelated` never shown as tension.

**`inquiry`** — change of meaning, for Bob's approval.
- The kinds' and coordinates' vocabulary, exported.
- R2's entry requirements: a contradiction inquiry names its candidate; its conclusion names a kind from the vocabulary with the fields that kind needs; a sub-inquiry may name the coordinate it explores.
- R11's promotion check applies them.

**`conformance`** — change of meaning, for Bob's approval.
- R12: a comparison may name the contradiction inquiry it came from, with rows pre-filled as facts with their sources; it still carries no outcome.
- Cause, if §15 point 10 places it here.
- Uses gain `contradiction`.

**`publication`** — change of meaning, for Bob's approval.
- R20: a document format whose predicate requires the disclosure section.
- R10: the published case carries the section and each member's attributed tension sentence.

**Beyond N345's four, which this design also touches** (BOB to add to N345, each a change of meaning for Bob's approval):
- **`case-authoring`**: authoring the disclosure section; the attributed acknowledgement; the pre-flight's refusal for an undisclosed tension (§10). Uses gain `contradiction`.
- **`entities`**: `reportResolutionDefect` (§9).
- **`reevaluation`**: the notice when a side goes stale or a finding's basis gains or loses an unresolved RECORD tension (§9, §10). Uses gain `contradiction`.
- **`queue`**: the duty and lead kinds, their class, whose queue, and that a duty leaves only by resolution (§4). Uses gain `contradiction`.
- **`affordances`**: the new acts placed on the ladder (proposed: `dismiss`, `clarify`, `takeUp` and `resolve` at `reasoned`; `op=contradictionrecommend` in `RUNG_ABSENT` as machine work, like `op=contradictionpropose`). This part is not a change of meaning (BOB's).
- **`basis-versions`**: only if §15 point 4 makes the contradiction inquiry's conclusion a project's.

## 15. Open points (ruled: K447 for BOB's, DEC-84 for Bob's)

Each is left undecided by DEC-76 and DEC-77. Each names whose it is and recommends.

1. **An `undetermined` candidate.** Is it shown, and at what weight? *Bob's (requirements).* Recommend: shown as a lead labelled undetermined, never as a duty, so the machine's uncertainty never creates an obligation.
2. **Whose queue a RECORD duty waits in.** *Bob's (requirements).* Recommend: an OBLIGATION for the joined participants of every project drawing on either side's inquiry (`basis-versions` R37), which cannot be muted (`queue` R19's `KIND_NOT_PERSONAL`) and leaves only by resolution; a lead is a FINDING for the same projects.
3. **Tension marks outside IDENTIFY's keys** (a determination's disagreement or two standards, a newer capture, a machine proposal beside a list, two projects' conclusions). Do they carry a mark, at what weight? Two projects' conclusions are plurality by IDENTIFY §3, not a defect. *Bob's (UX and requirements).* Recommend: a quiet mark with no duty, read from the module that already states each disagreement; no RECORD duty unless IDENTIFY forms a candidate; two projects' conclusions stay plurality.
4. **Whose conclusion resolves a contradiction inquiry**: the question's own (no-project) conclusion, or a project's stance? *Bob's (requirements).* Recommend: the question's own, because a RECORD defect is in the group's shared holding and one project's stance must not discharge it for another (`basis-versions` R31).
5. **What the machine may recommend.** DEC-76 lets it propose coordinates. DEC-77 3(b) recommends "a judgement" generally. IDENTIFY §5 keeps cause from the machine. *Bob's (doctrine).* Recommend: coordinates only; never which side is wrong and never a GENUINE kind (double-speak is a civic verdict, DEC-24).
6. **What the coordinate recommender must pass before a member sees it.** *BOB's (technical).* Recommend: pinned by digest; a small labelled fixture of dissolved pairs run blind, recorded in `MEASUREMENTS.md`; thereafter its acceptance rate is its measure.
7. **What a stale mark does to what rests on the side** (strength, a conclusion, a later case). *Bob's (requirements).* Recommend: nothing moves by itself; the holders get a re-evaluation notice, and the mark is shown wherever the side is shown.
8. **The two sides' roles as legs.** The grammar has only `supports` and `cuts_against`. *BOB's (technical).* Recommend: the member frames the question around one side ("is A so, given B?"), A `supports`, B `cuts_against`, and each leg's note names its side of the candidate; the grammar is unchanged.
9. **The competing-hypotheses matrix's cells.** Stored member judgements, or derived? *BOB's (technical).* Recommend: derived from the legs of one sub-inquiry per hypothesis or canon; no new stored object until the redesign shows it is needed.
10. **Criteria, Condition, Cause, Effect, Recommendation.** Where are Cause, Effect and Recommendation held, and at which stage are they published: on the finding's case, or with the determination? A Recommendation may approach what policy should be, which `escalation` and Operational Principle 1 keep out. *Bob's (requirements and UX).* Recommend: Criteria and Condition filled as facts from the two sides; Cause a member-authored, evidenced-or-hypothesis statement on the determination in `conformance`, named "not stated" when absent; Effect from `consequences`; Recommendation limited to a proposed action, never a policy position; the five rendered together by the redesign.
11. **Is an `irreconcilable` conclusion disclosed at publication?** It is resolved as a kind, yet both sides stand. *Bob's (doctrine).* Recommend: disclosed, stated as held irreconcilable, because a reader should know the record declined to choose.
12. **How deep a finding's basis "holds" a contradiction.** *Bob's (requirements).* Recommend: the finding's own claim and each leg's referent at the pinned bytes, where an inquiry leg's referent is that inquiry's accepted claim; one level, stated as such, since deeper findings disclose their own when published.
13. **A tension found after publication.** *Bob's (requirements).* Recommend: the edition stays as signed; the owning project gets a re-evaluation notice; a later edition discloses or resolves it.
14. **Accepting a recommendation and the member's own reason.** DEC-77 says accepted in one act; DEC-24 rule 1 says the machine never writes the member's reason. *Bob's (doctrine).* Recommend: accepting records the proposal accepted, with the machine's reason kept as the machine's; the member's own explanation is optional in that act and never filled from the machine's.
15. **What acceptance rate triggers a review.** *BOB's (technical).* Recommend: report per kind with counts only; review when a kind's rate is 95% or more over at least 30 offered, recorded PROVISIONAL, as IDENTIFY's threshold was.
16. **"One of them is wrong" and its kind.** The clarifier asks which side and a reason, not which CORRECTED kind. *Bob's (UX).* Recommend: no extra question in the one act; the kind reads `corrected`, cause not stated, and the contradiction inquiry is where a kind is named.
17. **Dismissal reasons.** *Bob's (UX and requirements).* Recommend: one short fixed choice (the same fact at different precision; not about the same matter; a real conflict, not pursued now) with optional words; only the first two count as false conflicts in `dismissalMeasure`.
18. **Which module holds the disclosure's authoring.** N345 names `publication`; the document is authored by `case-authoring`. *BOB's (technical).* Recommend: as §10 (the section and acknowledgement in `case-authoring`, the format and published read in `publication`), and N345's list gains `case-authoring`, `entities`, `reevaluation`, `queue` and `affordances` (§14).
