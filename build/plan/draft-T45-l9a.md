# Draft: T45 requirement text, L9 (a): conformance, consequences, actions — for BOB's review

Sources (read whole): `REQUIREMENTS-HANDOFF.md` and `canon-draft/BIO_Action_v0_2.md` (origin/design/actions); `DESIGN.md` (whole: §2, §3, §4, §10, §11 and the sections they cite); `research/S1-synthesis.md` §C and §D; `build/plan/next.md`; `build/requirements/README.md`; `conformance.md`, `consequences.md`, `actions.md` whole; the public parts used: `accepted-work` (R1, R2, R8), `publication` (R37, R63), `docket` (R2), `events` (R28, R30), `filings` (R8, R22–R24), `action-grammar` (R2, R5, R6, R13), `jurisdictions` (R53, R58), `store-door` (R4). Code read only to word change vs new: `actions/index.mjs` (`#breachRefusal`, `eventSource`, the holds region 1562–1870, the function list), `action-grammar/grammar.mjs` (`CORRESPONDENCE_STAGES`, `_OUTCOMES`).

Canon governs where the hand-off differs (none found that changes a line here; two readings noted in Doubts 4 and 12). Canon v0.2 is cited "rule n" or "§n"; Actions decisions "D n".

**Next free ids:** conformance **R31** (highest R30); consequences **R17** (highest R16); actions **R74** (highest R73; R53 never assigned). New ids used: conformance R31–R37; consequences R17–R23; actions R74–R97. Rows: every new refusal code takes the next number of its module's family (C-113, C-114, `action-grammar`'s C-117) at the job's stamp; the translations are BOB's drafts, the UX stream's to revise (listed under each module).

---

## conformance (L9, position 115)

### Changes

- **Purpose**, append: (T45; N828, N883; Actions D16, D16a, D23, D24; v0.2 §3 Determination) A determination rests on findings of one of three kinds: published; checked for publication and held (the case passed every publication check and is held unsigned); or another group's findings the group has accepted, read-only and never stronger than the edition they came from (R2, R31, R32). It is always made by a member of the group, against a standard in its own record; another group's determination is never adopted (R35). A determination whose held check is voided, or whose accepted source is withdrawn or revised, reads undetermined until a member re-evaluates (R33). This module also holds the link by which a member names a later compliant act as the cure of a noncompliant one (R36, R37). *(not yet met: T45)*

- **R2 amended**, append: (T45; N828, N883; Actions D16, D16a, D24; v0.2 §3, rule 2) This replaces "Every finding named is a finding-version that is a member of a published case edition": each finding named is one of three kinds, and the determination records which, per finding: **published** (as above, pinning the edition and version); **checked and held** (R31); **accepted** (R32). A finding of none of the three is refused `FINDING_NOT_PUBLISHED`, its code unchanged, its detail naming the three kinds (its translation re-worded, owed to UX). A finding published only by another project, and not accepted under R32, is still refused. *(not yet met: T45)*

- **R31 new** (T45; N828; Actions D23, D24; v0.2 §3, rule 2) A finding is **checked and held** when its version is a member of a preparation of a case of `project` that has passed every publication check and is held unsigned, as `publication`'s checked-and-held read answers it (its new requirement in this fold's L8 draft; the "held check"). The determination pins that held check (its id and the date it passed) and the version, exactly as it pins an edition for a published finding. A finding whose version is in no held check of `project` that `publication` answers as standing is not of this kind. `determinationRead` (R9) answers such a finding as `basis: {kind: "checked_held", check, checked_at}`. Negative control: the same finding, its project's held check voided before `determine`, is refused `FINDING_NOT_PUBLISHED`. *(not yet met: T45)*

- **R32 new** (T45; N883; Actions D16, D16a; DEC-96 item 1; v0.2 §3, rule 3) A finding is **accepted** when it is an imported finding reference (`inquiry-grammar` R11's spelling) naming an edition at which `accepted-work.acceptedFinding({ref, edition, viewer})` (its R2) answers an acceptance in force. The determination pins the ref, the source group, the case, the edition and the acceptance (`by`, `at`). The finding's strength pair is the source edition's `pair` as `accepted-work` answers it, never raised by anything here (read-only, never stronger than its source). `accepted-work` answering `absent` or `unreadable` is refused `ACCEPTED_WORK_UNREADABLE` as its R3 names it; an acceptance not in force at that edition is refused `IMPORTED_NOT_ACCEPTED`, its row (C-21.4) unchanged and answered through `accepted-work`'s minting, never a copy. `determinationRead` answers such a finding as `basis: {kind: "accepted", group, case, edition, edition_date, accepted_at, accepted_by}` (`edition_date` owed by `accepted-work`, below), labelled as another group's finding. Negative control: the same ref with its acceptance withdrawn before `determine` is refused. *(not yet met: T45)*

- **R33 new** (T45; N828, N883; Actions D16a, D24; v0.2 §3, rule 1's third machine mark) A determination is **void** while any of these holds: a checked-and-held finding it rests on (R31) has its held check voided by a change to the evidence the check covered (as `publication`'s read answers it); or an accepted finding it rests on (R32) has a later move of its source (`accepted-work.publisherMoves`, its R8: a withdrawal of that edition or of `all`, or a newer edition of the case) recorded after the determination, and no acceptance in force at that edition (`acceptedFinding`). A void determination:
  - is answered by `determinationRead` and `determinationsFor` with `void: {causes}` (each cause naming the finding and what happened, with its date) and every per-standard outcome read as `undetermined`, the outcome the member recorded kept beside it as `recorded_outcome`, never shown as the outcome;
  - stays `live` (R10) and is never edited; it stops being void only when a member re-evaluates it by superseding it (R7), the new determination resting on findings that stand;
  - is answered through one site: `determinationVoided(determinationId, causes, extra?)`, a module-level function, answers `{ok: false, reason: "DETERMINATION_VOID", code: "DETERMINATION_VOID", check, translation, determination, causes, detail}` as R19 and R20 do, so every later act that refuses a void determination (`actions` R8; `consequences` R1, Doubt 8; `escalation`, owed) answers through it. It writes nothing and never throws.
  
  Nothing is written when a determination becomes void: the state is derived on every read from the reads named (rule 1's mark, read as derived; Doubt 2). `determinationsFor` takes `void?: true | false`. A read that cannot complete `publication`'s or `accepted-work`'s answer for a finding answers `void: {causes: [{finding, cause: "unreadable"}]}`, never not-void. Negative control: the same determination over a held check still standing, and over an accepted edition with no later move, reads its recorded outcomes and no `void` key. *(not yet met: T45)*

- **R34 new** (T45; N828; Actions D24; v0.2 §3 "one resting on held findings moves to the edition when it is published") When the held check a determination pins (R31) is signed into an edition, so that `publication.publishedEditionsOf` (its R37) names an edition of the same case whose member is the same pinned `version_sha`, every read answers that finding as `basis: {kind: "published", case, edition, ...}` with `from_check: {check, checked_at}` beside it, and R14 and R2 read it as published. Nothing is rewritten: the held check stays recorded as what the member determined on. A finding whose version differs in the published edition stays `checked_held` and its check reads voided (R33). Negative control: an edition of the case that does not hold the pinned version leaves the finding `checked_held`. *(not yet met: T45)*

- **R35 new** (T45; Actions D16a; v0.2 §3 "another group's determination is never adopted as such") A determination is made only by `determine` from this group's own inputs. `determine` naming another group's determination (any input key `adopts`, `imported_determination` or `source_determination`, or a `supersedes` that is an imported reference) is refused `DETERMINATION_NOT_ADOPTABLE`, writing nothing; every standard it names is read through `standards` in this group's record (R3; unchanged). Negative control: the same call without the key lands. *(not yet met: T45)*

- **R36 new** (T45; Actions D5; v0.2 rule 17, §6 `cures`; State Rules §5.1) `cureLink({determination, standard, cure, reason?, author, viewer})` (`op=curelink`): a member records that the live determination `cure` is the curing act of the noncompliant outcome of `determination` for `standard`. Refusals in order, each writing nothing: `MACHINE_CANNOT_LINK_CURE` (an empty or machine author); `NO_SUCH_DETERMINATION` for either (R19); `DETERMINATION_SUPERSEDED` for either (R20); `CURE_TARGET_NOT_NONCOMPLIANT` (the outcome of `determination` for `standard` is not `noncompliant`); `CURE_NOT_COMPLIANT` (`cure`'s outcome for the same standard is not `compliant`, or `cure` does not name that standard); `CURE_OTHER_OFFICE` (the two acts' actors are not the same office: equal `entity_id`, or, where either is null, equal `{role, body}`); `CURE_NOT_LATER` (`cure`'s act event's `when` is not after `determination`'s, each read as R3 reads it; an order either side of which is undetermined is refused with that stated, Doubt 7); `DETERMINATION_VOID` for either (R33); `CURE_LINKED` (a link for that determination and standard already stands). The author must be a joined participant of `determination`'s project (R1's check, `DETERMINATION_NOT_A_PARTICIPANT`). The link is appended, never edited; a member may end it with `cureUnlink({link, reason, author, viewer})` (reason as R7's, `CONFORMANCE_NO_REASON` / `CONFORMANCE_BAD_REASON`), which appends the ending. A link whose `cure` is later superseded or void is answered with `cure_standing: false` and why; nothing moves. *(not yet met: T45)*

- **R37 new** (T45; Actions D5; v0.2 rule 17) `curesOf({determination, standard?, viewer})` answers, per standard, the standing cure link (`{link, cure, standard, by, at, cure_standing}`) or `null`, and the ended ones apart with their reasons. `determinationRead` (R9) answers the same as `cured_by`, and on the cure, `cures`. It is the read `escalation` R14 uses for "compliance restored" (owed). A cure the viewer may not see is withheld whole (R24). Writes nothing. *(not yet met: T45)*

- **R9 amended**, append: (T45; N828, N883) It answers each finding's `basis` (R2, R31, R32, R34), `void` (R33), and `cured_by` / `cures` (R37). *(not yet met: T45)*

- **R14 amended**, append: (T45; N828, N883) "published finding" reads "finding of one of R2's three kinds". *(not yet met: T45)*

- **R24 amended**, append: (T45) A pinned held check or accepted finding the viewer may not see is withheld whole as a pinned finding is; the source group's name and edition of an accepted finding are the record's facts and stand for every viewer who may read the determination. *(not yet met: T45)*

Rows (translations BOB's drafts, UX's to revise): `DETERMINATION_VOID`, `DETERMINATION_NOT_ADOPTABLE`, `MACHINE_CANNOT_LINK_CURE`, `CURE_TARGET_NOT_NONCOMPLIANT`, `CURE_NOT_COMPLIANT`, `CURE_OTHER_OFFICE`, `CURE_NOT_LATER`, `CURE_LINKED`; `FINDING_NOT_PUBLISHED`'s re-worded translation.

Tests (negative control on each): each kind of finding lands and each is refused when its condition fails; void by a voided held check and by a source withdrawal, each un-voided only by supersession; re-pin read with the same and a different version; every `cureLink` refusal; `curesOf` with a superseded cure.

### Uses

- **New:** `accepted-work` (position 72, earlier: ✓): `acceptedFinding`, `publisherMoves` (its R2, R8), and the minting of C-21.4/C-21.5 (R32).
- **Changed:** `publication` (101, earlier ✓): adds its checked-and-held read (R31, R33, R34; new in the L8 draft).
- No edge points later.

### Satisfies

Add: `BIO_Action_v0_2.md` §3 (Determination), §4 rules 1, 2, 3, 17, §6 (`cures`); Actions D5, D16, D16a, D23, D24; K102's "rests on published findings" read with v0.2 §3 (the hand-off's K-ruling line "`conformance` R2 read with §3").

### Owed to others

- **publication (L8 draft):** a read answering, for a finding-version and project, the standing held check (id, date passed) or its voiding (when, what evidence changed); the re-pin (R34) needs nothing more than `publication` R37's existing read.
- **accepted-work / case-import:** `acceptedFinding`'s answer gains `edition_date` (the source edition's date) and the source group's public identity and declared stake (D28d, rule 21), so the disclosure line (actions R75) names them.
- **escalation:** R14 reads `curesOf` (R37) for "compliance restored by a curing act"; a void determination's escalation is shown, not moved (owed with escalation's D5 lines).
- **UX:** the words for a void determination ("reads undetermined until a member re-evaluates") as a keyed sentence `conformance.void.reads`; the cure link's form.

### Size

2,145 lines today (`index.mjs` 1,746, `checks.mjs` 202, `schema.mjs` 197). The fold adds an estimated 400–550 (two basis kinds, the derived void, re-pin, the cure link and its read): about 2,700. No risk to the 4,000 mark (K617).

---

## consequences (L9, position 116)

### Changes

- **Purpose**, append: (T45; N855 6c; Actions D5, D6c; v0.2 §3 Consequence, Success record, rule 17) Whether a part is addressed is a member's reasoned statement with evidence for each part, with plain words offered and no percentage (R9). This module also holds the **success record**: per matter, a member's statement of what changed and when, on evidence, optionally with figures computed from cited sources; it may state the sequence of events, and says the group's action caused the change only on evidence other than the group's own act (R17–R23). Consequences stay breach-only: a success record is never a consequence. *(not yet met: T45)*

- **R9 amended**, append: (T45; Actions D5; v0.2 rule 17) An `addressed` statement may carry `words`, a list of at most five distinct tokens from `remedied`, `mitigated`, `compensated`, `acknowledged`, `cannot_be_undone`; any other token, or `words` on `not_addressed`, is refused `ADDRESSED_WORD_REFUSED`. A statement carrying a percentage, share, ratio or score of redress (any key `percent`, `percentage`, `share`, `ratio`, `score`, or a `%` figure in `words`) is refused `ADDRESSED_NO_PERCENTAGE`. The `reason` is required for both states (an absent or blank reason `ADDRESSED_NO_REASON`, over 2,000 characters `ADDRESSED_BAD_REASON`). R9's overall reading is unchanged. Negative control: the same statement without the key or with `words: ["mitigated"]` lands. *(not yet met: T45)*

- **R17 new** (T45; N855 6c; Actions D6c; v0.2 §3 Success record) `successRecord({project, matter?, statement, changed_on, evidence, figures?, sequence?, cause?, author, viewer})` (`op=successrecord`) records a success record, a record object of its own type (R14's pattern). `statement` is the member's words, 1 to 2,000 characters; `changed_on` a real calendar date (`civil-time.isCalendarDate`) or an EDTF band, the date the change took place; `evidence` 1 to 50 content ids or findings the author may see; `matter` is `{plan, matter}`, stored as given and never read here (`actions` R46's pattern; set by `action-plans`, Doubt 9). Refusals in order, each writing nothing: `MACHINE_CANNOT_RECORD_SUCCESS` (an empty or machine author); `NO_SUCH_PROJECT` (`membership.noSuchProject`); `SUCCESS_NOT_A_PARTICIPANT` (the author not joined); `SUCCESS_NO_STATEMENT` (blank or over 2,000); `SUCCESS_BAD_DATE`; `SUCCESS_NO_EVIDENCE` (none, or one the author may not see, alike); R18's figure refusals; R19's cause refusals; `SUCCESS_TOO_LARGE` (over 50 evidence items, 20 figures, or `sequence` over 1,000 characters), naming the part and cap. It answers `{ok: true, id}`. *(not yet met: T45)*

- **R18 new** (T45; Actions D6c) A success record's `figures` are each `{label, basis: {op, operands}}`, computed exactly as R2 computes a part (`calc-grammar`'s exact arithmetic, the operand kinds, `UNIT_MISMATCH` and `money.summable`'s refusals, each operand's grade and the weakest named), and answered with the operands shown. A figure is only computed: one carrying a stated `value` or `range` is refused `SUCCESS_FIGURE_NOT_COMPUTED`; a figure with an operand not in the record is answered `undetermined` with why, never zero (R4's rule). A machine may compute a figure for a member to adopt (labelled as R2's), and never records the success record (R17). *(not yet met: T45)*

- **R19 new** (T45; Actions D6c; v0.2 §3 "only on evidence other than the group's own act"; rule 16 "the group's own act never is [evidence]") `sequence` is the member's text stating the order of events ("after our demand of 6 Nov, the City published both reports on 14 May"), held as a sequence and answered with the sentence keyed `consequences.success.sequence_not_cause`. `cause` is `{statement, evidence}` (statement 1 to 2,000 characters, `SUCCESS_CAUSE_UNSTATED`; evidence 1 to 50 items the author may see, `SUCCESS_CAUSE_NOT_EVIDENCED`): the member's statement that the group's action caused the change. It is refused `SUCCESS_CAUSE_OWN_ACT_ONLY` when every evidence item is the group's own act, as the reader `actions` registers here answers it (`registerOwnActReader(fn)`, K31's pattern, one registration, `membership.listenerRefusal`; `fn({ids, viewer})` answering the ids that are an action of this group or the capture of one of its `sent` correspondence entries). With no reader registered, or one that throws, `cause` is refused `SUCCESS_CAUSE_UNCHECKABLE`, never accepted. Without `cause`, the read answers `cause: null` with the sentence keyed `consequences.success.cause_not_stated`. Negative control: the same cause with one evidence item that is not the group's own act lands. *(not yet met: T45)*

- **R20 new** (T45; Actions D6c) `successRecordRead({id, viewer})` answers R17's fields, the figures (R18) with their grades, `sequence`, `cause`, the author and time, and supersession links; an absent or invisible one `NO_SUCH_SUCCESS_RECORD`, one answer. `successRecordsFor({project?, matter?, after?, limit?, viewer})` lists live ones, at most 200 per page in id order, `truncated` by reading one past. What the viewer may not see is withheld whole as R15 states (evidence, operands, the cause's evidence), `out_of_view: true`. It is the read `actions` uses for recognition (its R93). *(not yet met: T45)*

- **R21 new** (T45; v0.2 rule 1) A success record is never edited: `successRevise({id, ..., reason, author, viewer})` records a successor with R17's refusals and a reason (`SUCCESS_NO_REASON`, `SUCCESS_BAD_REASON` as R9's reason rule), the earlier one staying readable with the link; a second successor of the same record is refused `SUCCESS_SUPERSEDED`. *(not yet met: T45)*

- **R22 new** (T45; Actions D6c; DESIGN §11 "layer 9 calling layer 8") `successCarry({id, case, author, viewer})` (`op=successcarry`): a member's act carrying a live success record into the case's next edition as an outcome, by calling the layer-8 op the L8 draft names for it (Doubt 10), passing the statement, the date, the evidence ids, the figures with their operands and the sequence or cause as recorded, never re-worded. Refusals: `MACHINE_CANNOT_CARRY` ; `NO_SUCH_SUCCESS_RECORD`; `SUCCESS_SUPERSEDED`; then the layer-8 op's refusals, passed through. It records `{carried_to: case, by, at}` on the record (appended) and answers the op's answer. A carry never changes the case except through that op. *(not yet met: T45)*

- **R23 new** (invariant; T45; Actions D6c; v0.2 §3 "Consequences belong to breaches only") A success record is never a consequence part: `consequencesOf` (R7), `addressed` (R9) and their totals never read, list or count one; `consequenceRecord` (R1) keeps its `CONSEQUENCE_NOT_NONCOMPLIANT`; no answer of the success record carries a significance, severity, priority, percentage of success or score (R11's rule). Success records, their successors and carries are append-only and declared to purge (K23). Negative control: a project holding a success record and a consequence part answers `consequencesOf` with the part alone. *(not yet met: T45)*

Rows (translations BOB's drafts, UX's to revise): `ADDRESSED_WORD_REFUSED`, `ADDRESSED_NO_PERCENTAGE`, `ADDRESSED_NO_REASON`, `ADDRESSED_BAD_REASON`, `MACHINE_CANNOT_RECORD_SUCCESS`, `SUCCESS_NOT_A_PARTICIPANT`, `SUCCESS_NO_STATEMENT`, `SUCCESS_BAD_DATE`, `SUCCESS_NO_EVIDENCE`, `SUCCESS_TOO_LARGE`, `SUCCESS_FIGURE_NOT_COMPUTED`, `SUCCESS_CAUSE_UNSTATED`, `SUCCESS_CAUSE_NOT_EVIDENCED`, `SUCCESS_CAUSE_OWN_ACT_ONLY`, `SUCCESS_CAUSE_UNCHECKABLE`, `NO_SUCH_SUCCESS_RECORD`, `SUCCESS_NO_REASON`, `SUCCESS_BAD_REASON`, `SUCCESS_SUPERSEDED`, `MACHINE_CANNOT_CARRY`.

### Uses

- **New:** `civil-time` (L1 ✓): `isCalendarDate` (R17). The layer-8 module whose op R22 calls (`case-authoring`, 113, or `docket`, 103, as the L8 draft names; either earlier ✓). `membership`'s `noSuchProject`, `listenerRefusal` (already a use).
- `actions` (118, later) is **not** a use: it registers the own-act reader here (R19), later registering with earlier (K31). No edge points later.

### Satisfies

Add: `BIO_Action_v0_2.md` §3 (Consequence, Success record), §4 rules 1, 16 (own act never evidence), 17; Actions D5, D6c.

### Owed to others

- **actions:** registers the own-act reader at start (its R97 below).
- **L8 draft:** the op that takes a success record as an outcome of the next edition.
- **action-plans:** sets `matter` on a success record created from a plan matter (D27's derived state reads success records for "fixed"/"ended" only where it says so).
- **UX:** `consequences.success.sequence_not_cause`, `consequences.success.cause_not_stated`; labels for the five words of R9.

### Size

1,443 lines today (`index.mjs` 1,148, `measures.mjs` 128, `schema.mjs` 111, `checks.mjs` 56). Estimated +450–600 (the success record reuses R2's computation): about 2,000. No risk.

---

## actions (L9, position 118)

### Size first (K617): a split is BOB's packaging decision

3,549 non-test lines today (`index.mjs` 3,279, `schema.mjs` 270); `action-grammar` 1,951. The lines below add an estimated 2,000–2,400 to `actions` (gate grounds, nine new fields, five new acts, holds widened, the reply records, three registrations, the R66 filter), even with every new field's shape grammar placed in `action-grammar` (as K653 placed the others, about 250 there). That is about 5,500–5,900: over the ~4,000 mark. **Proposed split (BOB's, P17), the third for this module (K617, K653 pattern: moved ids retired here, each naming its new home):**

| new module | position | takes | est. lines |
|---|---|---|---|
| `action-holds` | right after `actions` (before `action-clocks`) | R48's `actionPressure` act and the pressure table; R52, R54–R60, R69, R55 (moved); new R89, R90 | ~900 (≈ 420 moved + ~480 new) |
| `action-replies` | after `action-holds` | new R80 (receipt), R84 (claim bearings and their proposals), R91 (`arose_from`), R96 (the signing-view registration) | ~650 |

`actions` keeps the action object, its writes, the gate, the fields, scopes, promises, the reads and R66, the event registrations: about 4,000–4,300 after the move, the job trimming comment bulk as K617 asked. Both new modules use `actions` (earlier ✓); `action-clocks` (receipt as clock start) and `action-plans`/`queue-producers` (later) re-point their uses. `store-door` R4, `doorbell` R3 and `ratification` R45 re-point to `action-holds`; all three are reached by registration or by `plane` composition, so no edge points later. The ids below are numbered in `actions`; if the split is taken, the job's fold moves them as the table says.

### Changes: the gate (rule 2; D1, D3, D18)

- **R8 amended**, append: (T45; N884, N828, N883; Actions D3, D18, D24; v0.2 rule 2) (a) The determination a breach action rests on is live **and noncompliant** for at least one standard it names; a live determination with no `noncompliant` outcome is refused `DETERMINATION_NOT_NONCOMPLIANT` (today any live determination passes; canon says noncompliant). (b) A void determination (`conformance` R33) is refused through `conformance.determinationVoided`. (c) The override is R74's, with a ground. (d) This replaces "an overridden action is never attached to an escalation (`escalation` R23)": an action carrying an override may later gain, by a member's revision, a `rests_on` leg on a live noncompliant determination; the override stays, never removed (`PREMISE_OVERRIDE_REWRITTEN` unchanged), and the read answers both; the action may then join its escalation (`escalation` R23, owed). (e) A leg's `rests_on` target may also be a success record (`consequences` R17; R93). Negative controls: (a) the same leg on a noncompliant determination lands; (b) a determination not void lands. *(not yet met: T45)*

- **R74 new** (T45; N884; Actions D18, D3; v0.2 rule 2) `premise_override` is `{ground, reason}`; `reason` as before (1 to 500 characters, R14's text rule); `ground` one of:
  - `{kind: "legal_deadline", citation, date}`: the rule's citation (1 to 200 characters, R18's citation rule) and the deadline, a real calendar date (`civil-time.isCalendarDate`);
  - `{kind: "irreversible_act", what, when}`: what the imminent act is (1 to 500 characters) and when, a real calendar date or a `YYYY-MM-DDTHH:MM` local time.

  An override with no `ground`, or a ground of another kind, is refused `OVERRIDE_NO_GROUND`, the refusal naming both grounds (`grounds: ["legal_deadline", "irreversible_act"]`) and carrying `quick_route: {kind: "one_finding_case"}`, the fact that a case of one finding, run through every publication check, may be determined on (canon's quick route; the surface offers it, and shows beside it the window `action-clocks` computes, Doubt 1); a malformed ground is `OVERRIDE_GROUND_REFUSED`, naming the part. The ground is stated by a member, as the override is (R8's `MACHINE_CANNOT_OVERRIDE`), stamped and never edited. An override written before T45 with no ground reads as written, with `ground: null` and the sentence keyed `actions.override.ground_not_stated` (Doubt 6). The read (R25) and every disclosure (R75) carry ground and reason. Negative controls: each ground lands; the same override without `ground` is refused. *(not yet met: T45)*

- **R75 new** (T45; N828, N883; Actions D24, D16a, D28d; v0.2 rule 3) The read (R25) answers `disclosures`: for each live `rests_on` determination (`conformance` R9's per-finding `basis`), one item per distinct held check, `{kind: "checked_held", checked_at}`, worded as canon gives it, "rests on findings checked for publication on <date>, not yet published"; and one per distinct accepted source edition, `{kind: "accepted", group, edition_date, accepted_at, identity, stake}`, worded "rests on findings of <group> (edition of <date>), accepted by us on <date>", with that group's identity and declared stake as `accepted-work` answers them (owed there); and, for an override, `{kind: "override", ground, reason, by, at}` (filings R24's line, which gains the ground). Published findings carry no disclosure. `filings` R24 prints every item first on the face of everything prepared from the action (owed to filings). Negative control: an action resting only on published findings answers `disclosures: []`. *(not yet met: T45)*

- **R76 new** (T45; N828, N883; v0.2 §3, rule 1's third mark) The read (R25) and `actionsFor` (R30, with filter `basis_void: true`) answer `basis_void: [{determination, causes}]` for each `rests_on` determination `conformance` answers void (its R33), derived on every read and never written (Doubt 2); it clears when a member's superseding determination is linked by a revision. `actionsFor`'s `determination` filter keeps matching the void determination's legs. Negative control: the same action over a determination not void answers `basis_void: []`. *(not yet met: T45)*

### Changes: addressing (rule 7; D12, D16)

- **R9 amended**, append: (T45; N879; Actions D12; v0.2 rule 7) The press arm `{kind: press, role, organisation}` may carry `holder: {name}` (1 to 200 characters), the reporter who holds the role, kept inside the group: it is answered only in the read (R25) and `actionsFor`, never in R66's items, never in any registration's answer, and never in anything the instance publishes; on any other arm `holder` is refused `COUNTERPARTY_REFUSED` (an office's holder is read from `lines`, unchanged). The read also answers the venue's `delivery_point` beside an office addressee where the profile's venue for the kind states one (`jurisdictions`, owed), labelled as where it is delivered, never as the addressee. *(not yet met: T45)*

- **R77 new** (T45; S1 §C 4; v0.2 rule 7 "one action per office addressed, others copied") An action may state `copied`, a list of 0 to 20 addressees, each in R9's office or named arms (never `audience` or `undetermined`, never a person), checked as R9 checks the counterparty (`COUNTERPARTY_REFUSED`, its findings naming `copied[i]`); an office in `copied` that is also the counterparty is refused `COPIED_IS_ADDRESSEE`. Copied offices are not addressees: R8's office rule, R67's trigger and R92's open items read the counterparty only. Negative control: the same list without the duplicate lands. *(not yet met: T45)*

- **R78 new** (T45; N883; Actions D16; v0.2 rule 7, §6 `partners`; State Rules §4.4) An action may state `partners`, 0 to 20 organisations by role, each `{role, organisation, entity_id?}` (an `entity_id` naming an organisation entity, never a person: `entities`), stated and changed only by a member (`MACHINE_CANNOT_SET_PARTNERS`); a malformed entry, a person, or a repeated organisation is refused `PARTNERS_REFUSED`, naming the entry. Partners are shown in the read; nothing here gives a partner sight of the action (no shared plan; joint text approval is `filings`', owed). Negative control: an organisation entry lands. *(not yet met: T45)*

- **R79 new** (T45; N879; Actions D12; v0.2 rule 8 "press terms … noted on each press action") An action whose counterparty is the press arm may state `press_terms: {on_record, embargo_until?, release_at?, note?}`: `on_record` one of `on_record`, `background`, `off_record`; `embargo_until` and `release_at` a local date-time `YYYY-MM-DDTHH:MM`; `note` at most 500 characters. Stated by a member (`MACHINE_CANNOT_SET_PRESS_TERMS`); on another arm `PRESS_TERMS_NOT_PRESS`; malformed `PRESS_TERMS_REFUSED`. A change appends to `press_terms_history` and never edits an earlier entry. No member attribute is read or set (no named spokesperson). The review copy's embargo is `filings`' (owed). Negative control: the same terms on a press action land. *(not yet met: T45)*

### Changes: receipt, responses and outcomes (rules 6, 16; S1 §C 7–11)

- **R80 new** (T45; S1 §C 9; v0.2 rule 6 "Receipt is recorded as a fact (how, when)") `actionReceipt({target, ord, at, how, artifactSha? | account?, author, viewer})` (`op=actionreceipt`): a member records that the `sent` entry at `ord` was received by the addressee: `at` a real date or local date-time, `how` 1 to 200 characters (e.g. "stamped by the clerk"), held as a capture the register holds or a member's account, never both and never neither (R34's rule). Refusals in order: `MACHINE_CANNOT_CORRESPOND`; `NO_TARGET`; `BAD_DATE`; `CAPTURE_AND_TESTIMONY`; `NEITHER_CAPTURE_NOR_TESTIMONY`; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION`; `RECEIPT_NOT_ON_SENT` (the entry is not `sent`); `UNREGISTERED_ARTIFACT`. A second receipt of the same entry appends and the read answers the latest with the earlier ones. Appended to its own table, never rewriting the entry. The read (R25) answers each sent entry's receipt; `action-clocks` reads it as the clock's start where the rule counts from receipt (owed). *(not yet met: T45)*

- **R81 new** (T45; S1 §C 11; DESIGN §10 "Outcomes"; v0.2 rule 16, §6) A `received` entry carrying an `outcome` (`action-grammar` R5's fixed vocabulary, unchanged) may carry `office_status: {words, status?}`: `words` the office's own status wording quoted, 1 to 500 characters (R22's text rule), and `status` one of the active profiles' `response_statuses` (`jurisdictions` R58), else `OFFICE_STATUS_UNKNOWN`. The fixed outcome is never replaced: `office_status` without `outcome` is refused `OFFICE_STATUS_WITHOUT_OUTCOME`. With no `response_statuses` held, `status` is refused and `words` alone lands. Negative control: a held status with an outcome lands. *(not yet met: T45)*

- **R82 new** (T45; S1 §C 8; v0.2 rule 6 "never records silence as non-response") An action may state `reply_owed: false`, set or changed only by a member with a reason (`MACHINE_CANNOT_SET_REPLY_OWED`; reason as R14's), each change appended to its history. While `false`, `actionCorrespond` with `direction: no_response` is refused `NO_REPLY_OWED`, and the read answers `reply_owed: false` with the sentence keyed `actions.reply.not_owed`. Absent reads owed, unchanged. Negative control: the same `no_response` on an action with `reply_owed` absent lands. *(not yet met: T45)*

- **R83 new** (T45; S1 §C 10; v0.2 rule 16 "recorded wherever it is found") A `received` entry may state `found_elsewhere: {kind, note?}`, `kind` one of `press`, `report`, `decision`, `statement`, `other`, `note` at most 500 characters: a response found outside a direct reply, linked by the member to the action it answers. It is held as a capture (never testimony alone: `FOUND_ELSEWHERE_NEEDS_CAPTURE`); R17's `responds_to` edge is not added for it (that edge stays for direct replies). It is a response for R95. Negative control: the same entry without `found_elsewhere` adds the edge as before. *(not yet met: T45)*

- **R84 new** (T45; N880; S1 §C 7; Actions D13; v0.2 rule 16 "laid out claim by claim") `actionReplyBearing({target, ord, claims, author, viewer})` (`op=actionreplybearing`): for a `received` entry of a `request_for_comment`, a member lays out the reply claim by claim: `claims` a list of 1 to 50 `{claim, bearing, note?}`, `claim` the target of one of the action's `advances` or `rests_on` legs, `bearing` one of `new_evidence`, `disputed_without_evidence`, `not_addressed`, `note` at most 500 characters. Refusals in order: `MACHINE_CANNOT_RECORD_BEARING`; `NO_TARGET`; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION`; `BEARING_NOT_RFC` (another kind, or an entry not `received`); `BEARING_REFUSED` (a claim not among its legs, a repeated claim, a bearing outside the three), naming the item. A later layout appends and the read answers the latest. `actionBearingPropose({target, ord, claims, proposer, viewer})` stores a proposal apart, labelled (`proposalLabel`), as R28's shape (the assistant's claim bearings, owed to the AI modules). *(not yet met: T45)*

- **R85 new** (T45; S1 §C 18, §D 15; v0.2 §5 "Which stages a law has comes from the profile") A correspondence entry's `stage` on a `records_request` whose `law` the profile's records-law entry lists `stages` for (`jurisdictions`, owed) is refused `STAGE_NOT_IN_LAW` when that list does not hold it; with no list held, it lands and the read answers `stage_in_law: "undetermined"`. Negative control: a listed stage lands. *(not yet met: T45)*

- **R86 new** (T45; S1 §C 2; v0.2 §5 "mediation, an ethics complaint and a court petition are new actions linked to it") An action may state `follows_action: {action, ord?}` on its creation, never changed (`FOLLOWS_ACTION_REWRITTEN`): the action (and its entry) it follows, which the author may see (`NO_SUCH_ACTION` through R43) and which is not itself (`FOLLOWS_ACTION_SELF`). It has its own addressee, tier and clock. The read answers `follows_action` and, on the earlier action, `followed_by`; `actionsFor` takes `follows`. Reconsideration stays a stage (`appeal`) on the request. Negative control: the link to a visible earlier action lands. *(not yet met: T45)*

### Changes: scopes and promises (rule 15; D4)

- **R87 new** (T45; Actions D4; v0.2 rule 15, §6 `confidential`; State Rules §4.4) `actionScope({target, confidential, reason, author, viewer})` (`op=actionscope`): a member who may see the action sets (`true`) or removes (`false`) its confidential scope, with a reason (R14's text rule). Refusals: `MACHINE_CANNOT_SET_SCOPE`; `NO_TARGET`; `SCOPE_NO_REASON` / `BAD_REASON`; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION`; `SCOPE_UNCHANGED`. Each statement is appended (`by`, `at`, `reason`), never edited. A confidential action is seen inside the group as before and is never answered by R66 (below) or by any registration that feeds published output. Setting or removing it changes what R66 answers from then on and never changes a signed edition (`publication` R63); the answer says so with the sentence keyed `actions.scope.published_stays`. Negative control: the same action with the scope removed is answered by R66 again. *(not yet met: T45)*

- **R66 amended**, append: (T45; S1 §D 9; Actions D4, D22; v0.2 rule 15 "a published case's record of actions holds the group's outward acts only") Its source never answers: an action whose latest scope statement is confidential (R87); an action whose project is a counsel matter (`project-roster`'s read, owed from the L2 draft); an action with no `sent` correspondence entry (never outward: plan deliberation), nor the moves of any action before its first `sent` entry. No item carries a `contact`, `speaker`, press `holder`, promise note, pressure note or hold. These hold for every caller (Doubt 5). Negative controls: a non-confidential sent action in an ordinary project is answered; the same after R87 is not. *(not yet met: T45)*

- **R88 new** (T45; Actions D4; v0.2 rule 15 "Promises the group made to people … are notes on the action that every participant sees") `actionPromise({target, kind, text, ends?, author, viewer})` (`op=actionpromise`): a member records a promise the group made to a person, `kind` one of `embargo`, `anonymity`, `other`, `text` 1 to 500 characters, `ends` the position of an earlier promise this one ends (with `text` its reason). Refusals: `MACHINE_CANNOT_RECORD_PROMISE`; `NO_TARGET`; `PROMISE_REFUSED` (kind, text, or an `ends` naming no standing promise); `NO_SUCH_BUNDLE`; `NOT_AN_ACTION`. Appended, never edited; the read answers every promise to every viewer who may see the action, standing ones apart from ended ones; nothing published carries one (R66). *(not yet met: T45)*

### Changes: holds and pressure (rule 12; D10)

- **R52 amended**, append: (T45; N858 D10; Actions D10; v0.2 rule 12 "Any member who can see an action or case may place a litigation hold with a reason") This replaces "A received entry marked pressure of kind `legal` (R48) may carry a litigation hold" and `HOLD_NO_LEGAL_MARK` (its row C-117.22 retired from R52, R56 and R57, its number never reused): a hold is placed at a **place**: an action (`{target}`), an entry of one (`{target, ord}`), or a project (`{project}`), with `from?` naming what prompted it: a pressure mark of this module, a docket `legal` mark (`{docket_entry}`, read through `docket`'s legal-mark read, owed from the L8 draft; the hold's place is that entry's case's project), or a counsel matter (the project itself). `actionHold` takes `{target?, ord?, project?, from?, hold, reason, projects?}`; exactly one place, else `HOLD_PLACE_REFUSED`. A project place the author may not name is refused as R52 refuses a named project. A case the member can see places a hold on its project (`publication`'s case read). The latest statement at a place is its hold; R56–R60 and R69 read places for entries throughout. Negative control: a hold on an action with no pressure mark lands; one with two places is refused. *(not yet met: T45)*

- **R56, R57 amended**, append: (T45; D10) They take a place as R52 does; `HOLD_NO_LEGAL_MARK` is retired from both. *(not yet met: T45)*

- **R89 new** (T45; N858 D10; v0.2 rule 12 "a plain notice telling members what to keep outside Civicsmith is prepared and sent by a member's own hand") `holdNoticeSent({place, at, medium, artifactSha? | account?, author, viewer})` (`op=holdnoticesent`): a member records that she sent the hold notice for the hold at `place`, held as the bytes sent or her account (R34's rule). Refusals: `MACHINE_CANNOT_SEND`; the place's R52 refusals; `HOLD_NOT_IN_PLACE`; `BAD_DATE`; `CAPTURE_AND_TESTIMONY` / `NEITHER_CAPTURE_NOR_TESTIMONY`. It records no recipient, read, acknowledgement or compliance of any member, and no read of this module answers one (rule 10). The notice's text is prepared by `filings` (owed). Negative control: a hold in place takes the record. *(not yet met: T45)*

- **R90 new** (T45; S1 §C 16; v0.2 rule 12 "pressure … is recorded as evidence wherever it arrives") `pressureRecord({project, pressure, artifactSha? | account?, at, author, viewer})` (`op=pressurerecord`): a member records pressure that arrived outside any action (a letter, a post, a call), with R48's `pressure` shape, held as a capture or her account, in a project she sees at `FULL`, without creating an action to the sender. Refusals: `MACHINE_CANNOT_MARK_PRESSURE`; R48's shape refusals; `NO_SUCH_PROJECT` (through `membership.noSuchProject`); `BAD_DATE`; the capture/testimony pair. A `legal` record may carry a hold (R52's place `{project}` with `from: {pressure}`); `holdsDue` (R54) lists `legal` records with no hold as it lists marks. `actionsFor`'s `pressure: true` is unchanged; `pressureFor({project?, after?, limit?, viewer})` lists marks and records together, each with where it arrived. It is evidence and may be cited by an inquiry. *(not yet met: T45)*

### Changes: `arose_from` (rule 16; D20)

- **R91 new** (T45; Actions D20; v0.2 rule 16, §6 `arose_from`; State Rules §5.1) `aroseFromLink({target, ord, arising, author, viewer})` (`op=arosefrom`): a member records that a matter or project arose from the response at `ord` (a `received` entry): `arising` is `{project}` (a project the author sees at `FULL`) or `{plan, matter}` (stored as given, never read here: R46's pattern; `action-plans` sets it). Refusals: `MACHINE_CANNOT_LINK`; `NO_TARGET`; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION`; `AROSE_FROM_NOT_A_RESPONSE` (the entry is not `received`); `NO_SUCH_PROJECT`; `AROSE_FROM_LINKED` (the same link stands). Appended, never edited. The link is read both ways: `aroseFrom({target, ord, viewer})` (what arose from a response) and `arisenFrom({project} | {plan, matter}, viewer)` (the response a project or matter arose from), each withholding what the viewer may not see whole. It is the read `action-plans`' re-examination uses for its reach (projects linked by `arose_from`). It never counts a chain. *(not yet met: T45)*

### Changes: misuse guards and recognition (rules 5, 21; D6c, D12, D28)

- **R92 new** (T45; N892 (a); Actions D28a; v0.2 rule 21 "the group's open items with the same office … are shown as facts, never a block") `openItemsWith({counterparty | action, viewer})` (`op=openitemswith`) answers the actions the viewer may see addressed to the same office (R9's office equality: `entity_id`, else `{role, body}`) that are not `resolved` or `abandoned`, each with its kind, state, first `sent` date, and `clock_overdue` (R12), and the count of overdue replies among them. It is a read only: no act of this module or any other is refused on its answer. An addressee that is not an office answers `items: []` with the sentence keyed `actions.openitems.not_office`. Negative control: an action to another office is not listed. *(not yet met: T45)*

- **R93 new** (T45; N855 6c, N879; Actions D6c, D12; v0.2 rule 5, DESIGN §10 "Recognition … is not gated") For an action whose kind the profile marks `shape: recognition` (`jurisdictions`, owed; no kind is named in this code, R10), the read answers `recognition_basis`: `compliant` (a live `rests_on` determination with a `compliant` outcome), `success` (a `rests_on` leg on a live success record, `consequences` R20), or `promise_only` (neither), the last with the sentence keyed `actions.recognition.promise_only`. Nothing is refused for its basis. A `rests_on` leg naming a success record is read through `consequences.successRecordRead` (absent or invisible refused as R1's `ACTION_BASIS_REFUSED`). Negative control: a recognition with a success-record leg answers `success`. *(not yet met: T45)*

### Changes: several speakers; events and registrations

- **R94 new** (T45; S1 §C 5; Actions D12; v0.2 rule 8) A `sent` entry may state `speaker`, a member id (R45's `contactId`, `CONTACT_NOT_A_MEMBER` through `contactNotAMember`), the member who spoke for the group in that sending; one action may hold several sendings with different speakers. Only a member states it (`MACHINE_CANNOT_SET_CONTACT`). It is shown in the read to viewers who may see the action, and never in R66's items or anything published. Speaking "as myself" is not an action and is never recorded here (D12). *(not yet met: T45)*

- **R95 new** (T45; Actions D21; v0.2 rule 16 "Each recorded response sets off a re-examination"; DESIGN §11) This module offers `registerResponseListener(module, fn)` (K31's pattern; one registration per module, `membership.listenerRefusal`). After a `received` entry is promoted (by `actionCorrespond`, including R83's), each registered `fn({action, ord, project, recorder, at})` is called once, after the write's transaction; a listener that throws is logged and never undoes or refuses the entry. A refused write calls nothing. `action-plans` registers its re-examination driver (owed). Negative control: a `sent` entry calls no listener. *(not yet met: T45)*

- **R96 new** (T45; N880; Actions D13; v0.2 rule 8 "At signing, each request for comment still open on the case is shown once as one line of fact") At start this module registers once with the signing view's registration (the layer-8 seam the L8 draft names; `case-authoring` or `publication`) a reader `openRequestsFor({inquiries, findings, viewer})`: each `request_for_comment` the viewer may see, not `resolved` or `abandoned`, whose `advances` or `rests_on` legs name one of the given inquiries or findings, as `{action, addressee, asked_on, window_closes, reply}`: `addressee` R9's matching name, `asked_on` its first `sent` entry's date, `window_closes` its clock entry's date (`undetermined` when none), and `reply` the latest R84 layout as counts per bearing, or `null` with no reply. It asks no reason and refuses nothing. It writes nothing and never throws; a reader that cannot read answers `{unreadable: true}`, never `[]`. *(not yet met: T45)*

- **R97 new** (T45; Actions D6c; `consequences` R19) At start this module registers once with `consequences.registerOwnActReader` the reader answering, for a list of ids, those that are an action bundle of this instance or the capture (`artifact_sha`) of one of its `sent` entries, whatever the viewer (it names nothing back but the ids given). It writes nothing; it throws only when it cannot read, so `consequences` refuses `SUCCESS_CAUSE_UNCHECKABLE`. *(not yet met: T45)*

### Changes: invariants

- **R33 amended**, append: (T45; v0.2 rule 1) A machine credential also never states an override ground, partners, copied offices, press terms, `reply_owed`, a scope, a promise, a receipt, a bearing, a speaker, an `arose_from` link, a hold notice or a pressure record; it may propose a bearing (R84). *(not yet met: T45)*
- **R36 amended**, append: (T45) The new tables (receipts, bearings and their proposals, scopes, promises, press-terms history, reply-owed history, `arose_from` links, hold notices, pressure records) are this module's, keyed by `bundle_id` (pressure records and project-place holds by project), declared to purge, and covered by R60's held reading. *(not yet met: T45)*

Rows (translations BOB's drafts, UX's to revise; numbers in `action-grammar`'s C-117 at the stamp): `DETERMINATION_NOT_NONCOMPLIANT`, `OVERRIDE_NO_GROUND`, `OVERRIDE_GROUND_REFUSED`, `COPIED_IS_ADDRESSEE`, `MACHINE_CANNOT_SET_PARTNERS`, `PARTNERS_REFUSED`, `MACHINE_CANNOT_SET_PRESS_TERMS`, `PRESS_TERMS_NOT_PRESS`, `PRESS_TERMS_REFUSED`, `RECEIPT_NOT_ON_SENT`, `OFFICE_STATUS_UNKNOWN`, `OFFICE_STATUS_WITHOUT_OUTCOME`, `MACHINE_CANNOT_SET_REPLY_OWED`, `NO_REPLY_OWED`, `FOUND_ELSEWHERE_NEEDS_CAPTURE`, `MACHINE_CANNOT_RECORD_BEARING`, `BEARING_NOT_RFC`, `BEARING_REFUSED`, `STAGE_NOT_IN_LAW`, `FOLLOWS_ACTION_REWRITTEN`, `FOLLOWS_ACTION_SELF`, `MACHINE_CANNOT_SET_SCOPE`, `SCOPE_NO_REASON`, `SCOPE_UNCHANGED`, `MACHINE_CANNOT_RECORD_PROMISE`, `PROMISE_REFUSED`, `HOLD_PLACE_REFUSED`, `MACHINE_CANNOT_SEND`, `HOLD_NOT_IN_PLACE`, `MACHINE_CANNOT_LINK`, `AROSE_FROM_NOT_A_RESPONSE`, `AROSE_FROM_LINKED`; C-117.22 retired.

### Uses

New edges, each to an earlier module (✓):
- `consequences` (116): `successRecordRead` (R8 (e), R93), `registerOwnActReader` (R97). (Reverses "drop … `consequences`" in Decided by BOB; a new edge, BOB's.)
- `docket` (103): its legal-mark read (R52's `from`; owed from the L8 draft).
- `publication` (101): a case's project and sight (R52); the signing-view registration if the L8 draft homes it there (R96).
- `case-authoring` (113): the signing-view registration if homed there (R96).
- `project-roster` (35): whether a project is a counsel matter (R66, R52; owed from the L2 draft).
- `accepted-work`: none (actions reads disclosures through `conformance` R9).
No edge points later. `action-plans` (123) registers with R95 and sets R91's matter link and R46's plan link: later registering with earlier.

### Satisfies

Replace "`BIO_Action_v0_1.md` (canon whole, K608)" with `BIO_Action_v0_2.md` (canon whole, K2775): §3 (Action), §4 rules 1, 2, 3, 5, 6, 7, 8, 12, 15, 16, 21, §5, §6; Actions D3, D4, D6c, D10, D12, D13, D16, D18, D20, D21, D24, D28a; S1 §C 2, 4, 5, 7–11, 16, 18; S1 §D 9 (R66), 15 (R85).

### Owed to others (the hand-off's actions lines that are not this module's to test)

- **action-grammar** (L9, 117; no worker named for it in this fold, BOB to assign): (1) the shape grammars of R74's ground, R77, R78, R79, R81, R82, R83, R86, R94's fields, as pure findings `actions` asks at the write (K653's pattern), and the new rows; (2) **the assertion phrasing list** (rule 2; D1; DESIGN §10): a list per language held by the product, which a profile may extend, and a pure finder answering the sentences of a text that read as assertions of a breach. *Reading:* the list and finder are grammar, so here; pointing them out at approval is `filings`'.
- **filings:** the gate's text classing at approval (each pointed-out sentence resolved by the member: rewrite / confirm in her own recorded words that it only asks / treat the act as a breach claim, which sets `breach: true` through `actions`' revision); R24's disclosure gains the ground and R75's two lines; D28b (asks only for what the rule requires, remedy, the law's routes; refused at preparation), D28c (junior staff named only where the evidence turns on their act, pointed out), D28d (the group's public identity and declared stake on everything sent: the in-band stamp fields); the recognition text's one-time reminder about naming staff (rule 5); the hold notice's preparation (R89); the review copy's embargo and release time (R79); "as myself" speech kept out (D12).
- **action-clocks:** receipt (R80) as the clock's start where the rule counts from it; the legal-deadline window shown beside R74's refusal, computed where the profile holds the rule (Doubt 1); no overdue-reply item while `reply_owed: false` (R82).
- **escalation:** R23 (an overridden action joins once determined, R8 (d)); stage 3 never reads silence on `reply_owed: false`; R14 reads `conformance` R37.
- **action-plans:** registers R95's listener (re-examination); sets R91's `{plan, matter}` links and `consequences` R17's `matter`.
- **L8 draft:** the signing-view registration (R96); `docket`'s legal-mark read (R52); the published record of actions' escalation states (escalation R30).
- **L2 draft (project-roster):** a counsel matter as a project kind, readable (R66, R52).
- **jurisdictions:** a kind's `shape` (at least `recognition`; R93), a records law's `stages` (R85), a venue's `delivery_point` (R9), `response_statuses` per venue (R81 reads them as held today).
- **accepted-work / case-import:** the source edition's date, group identity and declared stake (R75).
- **affordances** (L11): derive every act an action offers (filing, escalation, hold, plan, reminder, and the new acts R80, R84, R87–R91) (S1 §D 12).
- **queue-producers:** the hold to-do raised from a docket `legal` mark and from R90's `legal` records (S1 §D 10).
- **Lawful demands complied with openly** (S1 §C 17): `people`' `expunge` on `lawful_demand` exists (its R12); the to-do and clock are `queue-producers`'/`action-clocks`'. Nothing for `actions`.
- **UX (keyed sentences, words the design stream's):** `actions.override.ground_not_stated`, `actions.reply.not_owed`, `actions.scope.published_stays`, `actions.openitems.not_office`, `actions.recognition.promise_only`; labels for the bearings, press terms, scope, promise kinds, receipt; the refusal translations above. The two disclosure lines are canon's words (rule 3) and need no key beyond their date format (`date.daymonth`/`date.daymonthyear`).

---

## Hand-off lines → where each went

| hand-off line (module) | placed |
|---|---|
| conformance: R2 three kinds | conformance R2 amended, R31, R32 |
| conformance: always a member of the group; never adopted | R1 unchanged (joined author); R35 |
| conformance: voiding; dependent actions marked | conformance R33; actions R76 |
| conformance: re-pin on publication | conformance R34 |
| conformance: curing act `cures` | conformance R36, R37 |
| consequences: harm addressed, words, no percentage | consequences R9 amended |
| consequences: success record | consequences R17–R23 |
| actions: kinds and shapes | product kinds unchanged (R10); records request R85, R86, reconsideration a stage; request for comment R84, R96; complaint R82, R87; demand to cure, party participation, public comment tiers: profile data (jurisdictions, owed); press R9, R79; recognition R93; joint R78; counsel: filings; "never says whether to become a party": filings/guides (owed) |
| actions: addressing | R9 amended, R77, R78 |
| actions: the gate | R8 amended, R74; text classing → filings + action-grammar (owed); window → action-clocks (Doubt 1); join escalation R8 (d) + escalation (owed) |
| actions: disclosure lines | R75 (+ filings R24, owed) |
| actions: receipt, no reply owed, outcomes, found elsewhere, claim by claim | R80, R82, R81, R83, R84 |
| actions: scopes | R87, R66 amended |
| actions: promises to people | R88 |
| actions: press terms; review copy | R79; review copy → filings (owed) |
| actions: holds | R52, R56, R57 amended, R89; docket mark read → L8 (owed) |
| actions: pressure; lawful demands | R90; lawful demands → people/queue-producers (owed) |
| actions: arose_from | R91 |
| actions: misuse guards | (a) R92; (b)(c)(d) → filings (owed) |
| actions: recognition | R93; staff reminder → filings (owed) |
| actions: several speakers | R94 |
| actions: affordances | affordances (L11, owed) |
| (implied by others' lines) re-examination event; signing seam; own-act reader | R95, R96, R97 |
| Defects S1 §D: 9 | R66 amended |
| S1 §D 15 | R85 (+ profile `stages`) |
| S1 §D 11 (does a hold stop a scheduled publication) | Verified on paper: `actions` R69 registers `holdsOn` with `ratification` R45 (its R41/R42 stop the publisher); U10's layering worry does not apply. Unchanged; carried by the split (Doubt 11). |
| S1 §D 3 (overdue on UTC day) | `actions` R12 reads the office's local day already; nothing here. |
| S1 §D 1, 12 | legacy-ui (C-8 UI half, already sent); affordances (owed) |

## Doubts

**BOB's (technical or wording; my recommended reading):**
1. **The window beside R74's refusal.** `actions` (118) cannot read `action-clocks` (119). *Reading:* the refusal carries the grounds and the quick route; the surface shows `action-clocks`' computed window beside it (owed there as a read), as conformance's five elements are composed by the surface. Alternative: `action-clocks` registers a window reader with `actions`.
2. **"Marked" read as derived.** Rule 1 names the voided-findings mark as a machine write. *Reading:* derived on read (conformance R33, actions R76): the same visible mark, nothing to un-write, no race with re-evaluation. Bob is told as done.
3. **Re-evaluation of a void determination** is a supersession (R7) only. A lighter "re-affirm on the re-run check" act could be added later if members find supersession heavy.
4. **Scope of R66's exclusions.** Applying rule 15's "outward acts only" leaves out never-sent actions and moves before the first sending, beyond the hand-off's confidential and counsel lines. *Reading:* canon governs; report it to Bob as done.
5. **R66 serves internal reads too** (`explore` R13, `filings` R33's packet chronology). Leaving confidential acts out for every caller means counsel's chronology loses them. *Reading:* leave them out everywhere (safe, enforced at the producer as the hand-off asks). Alternative: `events` R30 passes a `for: "publication"` purpose from the signing path, and R66 filters only then (touches `events` and `case-grammar`).
6. **Overrides written before T45** have no ground. *Reading:* read as written, `ground: null` with a keyed sentence; never re-asked.
7. **`CURE_NOT_LATER` with an undetermined order** is refused, stating why; a member places the event's date first.
8. **Consequences on a void determination.** *Reading:* `consequenceRecord` and `addressedRecord` refuse new parts through `conformance.determinationVoided` while void; held parts stand (owed as a one-line amendment to consequences R1, which I did not write: say if wanted).
9. **The matter key** on a success record and an `arose_from` link is stored unread (R46's pattern), since `action-plans` is later.
10. **Where the success record is carried** (R22): the L8 draft names the op (next-edition outcome in `case-authoring`, or `docket`).
11. **S1 §D 11:** verified on the requirements, not the code; the job's START checks `ratification` R41's call.
12. **Recognition as a profile `shape`.** DESIGN §3 marks recognition a profile kind and S1 §C 27 a product kind; canon §6 keeps product kinds to three. *Reading:* canon governs: a profile kind with a `shape` tag the product reads.

**Possibly Bob's:** none changes a ruled requirement's meaning. One to report as done, not to ask: R8 (a) now requires a **noncompliant** determination for a breach action (canon rule 2's words; today any live determination passes).

## N-entries

- **Fully applied by this draft (with the owed lines above going to the other L-drafts):** none on its own. Each spans modules outside these three.
- **Parts applied here:** N828 (conformance and actions parts; filings R24 and publication's held check remain, the L8 and filings drafts); N855 6c (all of 6c except the next-edition op, L8); N858 D10 (holds: all of `actions`' part; the hold notice's text is filings'); N879 (press addressee, holder, terms; recognition's basis; speakers: filings keeps "as myself", staff reminder); N880 (the open-requests reader and claim bearings; the signing view is L8's); N883 (partners; conformance accepted findings and voiding; joint approval and stamp are filings'); N884 (the grounds; filings' disclosure and action-clocks' computation remain); N892 (a) only.
- **Nothing here** for N861, N881, N882, N885, N887, N890 (their lines are filings', action-plans', action-clocks', queue-producers' or the profile's).
- Each moves to applied when the last of its owning drafts is adopted; the hard reason for every remaining part is the same: it lives in another module's draft in this fold.
