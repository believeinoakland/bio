# Draft: T45 requirement text, layer 9 (b): action-clocks, filing-templates, filings, escalation, action-plans (and a split, `plan-work`)

**Status** · A worker's draft for BOB (fold brief), 2026-10-11, on `tranche/T44`. Not adopted. Requirements are BOB's (P5); every line below is a proposal for BOB to word, number and place.

Sources:
- Canon `BIO_Action_v0_2.md` (approved whole, K2775; "v0.2 rule n" below), on `origin/design/actions`.
- `REQUIREMENTS-HANDOFF.md` (the hand-off), `DESIGN.md` §2, §10, §11, `research/S1-synthesis.md` §C, §D, on the same branch.
- `build/plan/next.md`: N828, N855, N858, N861, N879–N885, N887, N890, N892.
- The requirement files of the five target modules, and the public parts of `steps`, `duties`, `actions`, `case-account`, `jurisdictions`, `wizard-scripts`, `consequences`, `events`.
- Code read only to word change vs. new: `action-clocks/index.mjs`:90–91 (`BASIS_KINDS` has four kinds), `action-clocks/count.mjs`:245–262 (only `received` and `filed` starts are counted; `served` reads undetermined), `civil-time/rules.mjs`:39, 124 (`due_at`, time of day, is built), `filing-templates/index.mjs`:256 (a profile template is named by its kind's label: one per kind), `jurisdictions/profiles/oakland-alameda.mjs`:22 ("No template: none is approved").

Order check (`build/modules.json`): steps 76, duties 63, case-account 112, docket 103, conformance 115, consequences 116, actions 118, action-clocks 119, **filing-templates 120, filings 121** (the hand-off writes them the other way round; the file's order governs), escalation 122, action-plans 123, monitoring 124, following 125, wizard-scripts 128, queue-producers 133, notice-producers 134. Every new edge below points earlier.

Next free ids: action-clocks **R16** (highest R15), filing-templates **R28** (highest R27), filings **R34** (highest R33; R26 retired), escalation **R31** (highest R30), action-plans **R39** (highest R38). The proposed new module `plan-work` starts at **R1**.

Names of services in sibling modules (`actions`, `conformance`, `consequences`, `jurisdictions`, `project-roster`) are written as this draft assumes them, in angle brackets where no requirement names them yet (for example `<actions: receipt fact>`). BOB aligns them with the L9 (a) and profile drafts.

---

## 1. action-clocks (L9, position 119)

**(a) Changes.** R2, R3, R7, R15 amended; **R16**, **R17**, **R18** new; Satisfies re-pointed to v0.2.

**(b) Text.**

- **R2**, append: (T45; N882; Actions D15; v0.2 rule 6; S1 §C 9, §C 19) A rule whose `starts` is `received` counts from the counterparty's receipt as the action records it (`<actions: receipt fact>`: how and when the office received the group's request) when the ledger holds one, and otherwise from the group's first `sent` entry as now; the answer's `trace` says which, and a count from `sent` says "receipt not recorded: counted from sending". A rule whose `starts` is `served` counts from the action's recorded service on that party (`<actions: service fact>`), and reads undetermined with why when none is recorded. Time of day (`due_at`) is unchanged (`civil-time` R9–R13, already met). *(not yet met: T45)*
  - Control: the same rule with no receipt fact counts from `sent`; `served` with no service fact reads undetermined.
- **R3**, append: (T45; N882; Actions D15; v0.2 rule 6) Each item also carries `owed_by` (R18) and, where R17 holds, `noticed_by`. An item is a question about a date, never a finding: it carries no word saying the body failed or violated anything (R7). *(not yet met: T45)*
- **R7**, append: (T45; Actions D15; v0.2 rule 6; K1431 as v0.2 rule 6 reads it; S1 §C 15) A fifth basis kind, `stated`: a deadline the other side has stated (who stated it, and where it is held: a capture or a correspondence entry). It is never presented as a legal deadline: its basis words never call it a law, rule or legal period, R2 never proposes one, and R15 never counts it as a rule. `commitment` is read as v0.2 rule 6 reads it: the body's own commitment. `BASIS_KINDS` gains `stated`, exported frozen. *(not yet met: T45)*
  - Control: an entry of kind `rule` keeps its citation words; a `stated` entry answers words that name who stated it and no law.
- **R15**, append: (T45; N882; Actions D15; v0.2 rule 6) "The group's own deadlines" are the entries `owed_by: group` (R18), whatever their basis kind, with `dependency` and `window` entries as before; a `commitment` entry owed by a body, and every `stated` entry the group did not adopt as owed by it, are never counted. This replaces "whose basis kind is `commitment`, `dependency` or `window`". *(not yet met: T45)* (Doubt 1.)
- **R16** (T45; Actions, DESIGN §11 "one date, one reminder"; v0.2 rule 6; S1 §C 1) One date, one item. A step and a clock entry **stand for each other** when the step is tied to the action, as its product (`steps.stepsOf({record: action})`, its R9) or by a wait on the action's arrival (`steps` R11), and the step's `byWhen.date` (its R12) is the entry's date in the action's local day (Terms). `clockForStep({step, viewer})` answers `{action, entry, date, basis}` for the one pending entry that stands for the step, or `null` (none, more than one, or not visible); R3's and R5's items carry `steps: [step ids]` that stand for the entry. A reminder a member holds on the entry (R4) and a step reminder she holds on the same day for a step standing for it (`steps` R12) are one reminder: R5 answers it once, as the entry's. Writes nothing; never throws. *(not yet met: T45)*
  - Control: a step tied to the action with another date, or an untied step with the same date, stands for nothing (`null`, no `steps`).
- **R17** (T45; v0.2 rule 6; DESIGN §2.6; S1 §C 1) An adopted duty's "Noticed" item replaces the clock's overdue item. R3's item for an entry carries `noticed_by: {duty, occurrence}` when an adopted duty of the addressee office has an occurrence whose trigger is this action's own sending (`duties` R16's source, registered by `actions`) and whose due date (or a candidate of it) is the entry's date; `queue-producers` R15 draws no overdue item for an entry carrying it (Owed, §6). Writes nothing. *(not yet met: T45)*
  - Control: with the duty not adopted, or triggered by another action, `noticed_by` is absent and the overdue item stands.
- **R18** (T45; N882; Actions D15; v0.2 rule 6) **Our deadlines.** A clock entry is `owed_by: group` (what the group owes a venue: service, filings, contact reports, a requester's own deadlines), `body`, or `undetermined` when the entry does not say (`<actions: clock entry's owed_by>`; never defaulted). R2 proposes `owed_by` from the profile deadline's whose-duty (`<jurisdictions R26: owed_by>`), undetermined where the profile does not say. `ourDeadlines({from?, to?, after?, limit?, viewer})` lists the pending entries `owed_by: group` of visible actions not `resolved` or `abandoned`, with basis, date, zone, project and creator as R3, at most 500 per page, `cursor` and `truncated` as R1's. A reminder on one is only as a member asks (R4, R8); a missed one is told once (`queue-producers`, Owed). Writes nothing. *(not yet met: T45)*
  - Control: an entry `owed_by: body` or `undetermined` is never listed.
- **Satisfies**: replace "`BIO_Action_v0_1.md` (canon whole, K608): §4 rule 5" by "`BIO_Action_v0_2.md` (canon whole, K2775): §4 rule 6"; add DESIGN §11's de-duplication placement (R16, R17), N882 (R18).

**(c) Uses.** `steps` (new edge, the hand-off's: `stepsOf` R9, waits R11, `byWhen` R12; R16). `duties` (new edge, this draft's: `occurrencesOf`, the R16 trigger source, `readDuty`; R17; duties 63 is earlier). R8 and R4–R6 unchanged: v0.2 rule 6's reminder rule is v0.1 rule 5's (already met).

**(d) Tests.** Each new refusal and read with the controls above; R16 with a step tied by product, one tied by a wait, and one reminder told once for both; R17 with a duty triggered by this action's `sent` entry; R18 paging; R7 `stated` never counted by R15.

**(e) Size.** 1,629 lines today; R16–R18 and the amendments add an estimated 300–450. About 2,000: no split risk.

---

## 2. filing-templates (L9, position 120)

**(a) Changes.** R15, R26 amended; **R28** new; R23 gains rows.

**(b) Text.**

- **R15**, append: (T45; N858; Actions D8; v0.2 rule 11) The profile's templates are every template a kind carries (`<jurisdictions R25/R40: templates, a list, each with its own name and sources>`), each with its own `name` (R26's handle is read from it, no longer from the kind's label). A profile template is offered only when its attribution names its writer, the public sources it was written from, at least one `professional` review whose outcome is `no_concerns`, and an approver other than its writer; one lacking any is not offered and reads `TEMPLATE_NOT_REVIEWED` (a new row of C-125), naming what it lacks. *(not yet met: T45)*
  - Control: the same template with a professional `no_concerns` review is offered.
- **R26**, append: (T45; N858; Actions D8; S1 §D 5) A handle is resolved over each profile template's own `name`, so two templates of one kind ("Records request", "Records request with immediate disclosure") have two handles. *(not yet met: T45)*
- **R28** (T45; N858; Actions D8; v0.2 rule 11, §8) No court-petition template. A `use: file` template on a kind whose profile venue is filed with a court (`venue.how: court`, `jurisdictions` R25), in any profile it names (for a `general` one, in the active view), is refused at R1 `TEMPLATE_COURT_PETITION` (a new row of C-125), and a profile template so placed is not offered (reads the same code). A `brief` template is unaffected. This holds until certification by a licensed professional exists (v0.2 §8). *(not yet met: T45)*
  - Control: the same text on a kind whose venue is not a court is accepted.
- **R23**, append: (T45) Rows `TEMPLATE_NOT_REVIEWED` and `TEMPLATE_COURT_PETITION` join C-125, translations BOB's, awaiting promotion's stamp.

**(c) Uses.** No change.

**(d) What `wizard-scripts` needs (another worker drafts it).** R22's "Get a record" step `{template: "@records-request"}` resolves through `filing-templates.offeredVersion({name: "@records-request"})` (R26). It resolves once the active profile carries an offered template named "Records request" for `records_request` (R15 above; the template itself written, reviewed and approved under rule 11: Doubt 2). `wizard-scripts` needs no change of meaning: (1) a test, with the test profile holding an attributed, professionally reviewed "Records request" template, that the step drafts from it; (2) the control that, without one, R12 still refuses the step `WIZARD_DRAFT_REFUSED` (the script is not required, so R14 does not block a release). `@communication` is **not** fixed by this fold: no Tier 1 template is a communication, and a communication takes no template (`filings` R23); the step should draft through `communicationPrepare` instead, which is the design stream's and `wizard-scripts`' to settle (Owed, §6).

**(e) Tests.** R15 a profile template without a professional review not offered and with one offered; R26 two templates of one kind each by its handle; R28 a court kind refused and a non-court kind accepted.

**(f) Size.** 1,787 lines; this adds about 60–100. No risk.

---

## 3. filings (L9, position 121)

**(a) Changes.** R8, R9, R10, R22, R23, R24 amended; **R34–R42** new.

**(b) Text.**

- **R8**, append: (T45; N858; Actions D9; v0.2 rule 12; S1 §D 6) `NO_DETERMINATION` is retired (its number never reused): a packet needs no determination and no override, at any stage. Its facts section shows each matter's support as it stands (R9). `counselPacket` takes `purpose`, `claim` (the default) or `defence`. *(not yet met: T45)*
  - Control: an action resting on no determination and stating no override now assembles a packet (it was refused).
- **R9**, append: (T45; N858; Actions D9; v0.2 rule 12) The facts section holds, for each matter the action rests on, its support as it stands: a live determination with its findings (as now), or, with none, the inquiry and the findings it holds, each with its kind (published, checked and held, accepted from another group, or unpublished) and grade, stated as not determined. A `defence` packet adds three sections: **challenged statements** (each statement of the group the opposition challenges, as the member names it, with the findings and sources it rests on), **pressure received** (each `pressure` mark on the action's correspondence, `actions` R48, and each `legal` mark on the case's docket, `docket` R2, with its date), and **defence deadlines** (each profile deadline that applies to a defence, `<jurisdictions R26: applies_to defence>`, with R9's date rule). No sentence this module writes into a packet states that the group has a claim, or whether a protection applies; candidate theories stay labelled candidates (R14). *(not yet met: T45)*
  - Control: a `claim` packet has no defence sections; a search of a packet's own words (headings, markings, fixed sentences) finds neither statement.
- **R10**, append: (T45; v0.2 rule 15) A packet for an action in a counsel matter (`<project-roster: counsel matter>`) carries, beside R10's marking, the privilege marking and a warning on sharing outside, sentences keyed `packet.privileged` and `packet.privileged.warning` (words the design stream's). *(not yet met: T45)*
- **R22**, append: (T45; N883, N892; Actions D16, D28d; v0.2 rules 14, 21) The stamp carries the group's public identity (name, slug, verified domain) and declared stake, as per-group fields (`<public-read: inbandQuartet's per-group fields>`); a joint text's body fingerprint (R36) is computed without them. *(not yet met: T45)*
- **R23**, append: (T45; Actions, DESIGN §2.2; S1 §C 6) A communication is drafted from the findings and inquiries the member chooses (`from`), published or not, any the preparer may see (`NO_SUCH_BUNDLE` alike for one not seen); a request for comment's claims are assembled from them as a sourced list labelled machine work (`escalation` R29's pattern), each claim naming its finding. It never needs a published case. This replaces "a machine from the published case and the plan". *(not yet met: T45)*
- **R24**, append: (T45; N884; Actions D18; v0.2 rule 2) The disclosure names the override's ground, a legal deadline (its citation and date) or an imminent irreversible act (what and when), with the member's reason, as `<actions R8: the override's ground>` holds it. *(not yet met: T45)*
- **R34** (T45; Actions D2; v0.2 rule 3) **The record check.** Every filing draft, counsel packet's `briefing` section and communication is checked sentence by sentence with the case-account check (`case-account` R6's judgment) against the findings of R35's three kinds and the group's own dated correspondence: each sentence answers `supported` (naming what supports it), `unsupported`, `contradicted` (naming what contradicts it), `question` or `own_doing` (a sentence the member marks as about what the group itself is doing). An unsupported sentence is pointed out and never refused. `filingApprove` (R6) refuses a text holding a `contradicted` sentence `CONTRADICTED_HELD` unless the approval names that sentence with a reason (`release: [{ord, reason}]`), recorded with the approval. A `question` is never flagged. The check is re-run on the approved text. *(not yet met: T45)* (Doubt 9.)
  - Control: the same approval without a contradicted sentence needs no `release`; a question sentence is never in the flags.
- **R35** (T45; N828, N883; Actions D24, D16a, D28d; v0.2 rules 3, 21) Everything prepared from an action resting on findings checked for publication and held carries "Rests on findings checked for publication on {date}, not yet published." (`prepared.rests.held`); on another group's accepted findings, "Rests on findings of {group} (edition of {date}), accepted by us on {date}." (`prepared.rests.accepted`), with that group's public identity and declared stake (canon's words; keys for the design stream). Each is read from `<conformance: the kind of findings a determination rests on>`. One resting only on published findings carries neither. *(not yet met: T45)*
- **R36** (T45; N883; Actions D16; v0.2 rule 14) **Joint texts.** For an action with `partners` (`<actions: partners>`), the approved text has a body fingerprint, SHA-256 over the text without R22's per-group fields. `jointSignatory({filing, organisation, body_sha, account, author, viewer})` (`op=jointsignatory`): a member records that a partner organisation approved the same text in its own copy, by its own act (`account`, how it is known); refusals in order: `MACHINE_CANNOT_APPROVE`; `NO_SUCH_FILING`; `NOT_APPROVED`; `NOT_A_PARTNER` (an organisation not among the action's partners); `JOINT_FINGERPRINT_MISMATCH` (a `body_sha` other than this text's). `filingsFor` (R13) lists each signatory. No shared plan is made. *(not yet met: T45)*
  - Control: a matching fingerprint from a listed partner lands; the same text with one character changed mismatches.
- **R37** (T45; N887; Actions D25; v0.2 rule 19) **Documenting an infraction.** `communicationPrepare` takes `purpose: "document_infraction"` with `audience` (`violating_party`, `members`, `oversight`, `public` or `broad`). Without AI its text is assembled from the record: the act and its office, the standard it is measured against, the evidence for each point with its grade, and what is still uncertain, each part naming its source and an undetermined part stated so; the assistant's draft, where enabled, is a labelled proposal (R5). Each version is approved per R6. A version for `violating_party` is a request for comment: it carries R40's quoting sentence and a time for review and response (a date with its basis, `action-clocks` R7). *(not yet met: T45)*
- **R38** (T45; N887, N892; Actions D26, D28b; v0.2 rules 19, 21) **The chance to fix.** `purpose: "chance_to_fix"` drafts a notice stating what correcting the act and remedying its harm would look like under the standard, and a time: the law's period (a profile deadline, cited) or the group's window (`window` basis). Every sentence asking for something is pointed out unless it asks for what the standard requires, for remedy of a recorded consequence (`consequences`), or for a route the profile names; a sentence matching the self-benefit phrasing list (per language, profile-extendable, held where the assertion list is) is pointed out, and R6 refuses approval `SELF_BENEFIT_ASK` until each is rewritten. The same holds for any demand. *(not yet met: T45)* (Doubt 7.)
  - Control: a notice asking only for the standard's act and remedy is approved.
- **R39** (T45; N861; Actions D11; v0.2 rule 9) **Election notice and position sentences.** When a draft's text names a pending measure or a candidate (as `<jurisdictions/local-facts: election facts>` hold them, including an elected office whose holder is a candidate), the campaign-spending rule is answered once per draft with its citation (`notices: [{kind: "election", citation}]`, sentence keyed `filings.election.notice`), never refusing. In a public comment or testimony prepared as the group's act, each sentence matching the position phrasing list (per language, profile-extendable) is pointed out for the member to remove or resolve, as R34's flags are. *(not yet met: T45)* (Doubt 5.)
  - Control: text naming no held measure or candidate carries no notice.
- **R40** (T45; N880; Actions D13; v0.2 rule 8) Every draft or communication for an action of kind `request_for_comment` carries the sentence that the reply may be quoted unless it says otherwise (`rfc.quoting`, canon's meaning; words the design stream's); R6 refuses an approved text without it `RFC_QUOTING_MISSING`. *(not yet met: T45)*
- **R41** (T45; N858; Actions D8; v0.2 rule 11) Templates are offered only after the act is chosen: `templatesForAction({action, viewer})` answers the offered `file` versions (`filing-templates` R14, R25) for that action's kind and governing tier 1 or 2, latest first; it takes an action, never a kind alone, and no answer of this module lists kinds or templates as suggestions of what to do. `NO_SUCH_ACTION` as R1. *(not yet met: T45)*
- **R42** (T45; N890; Actions D27 B; v0.2 rule 20) **Second approval.** Where the action's project names its act (by kind, tier or "public") as needing a second member's approval (`<project-roster: second-approval setting>`), `filingRecordSent` (R7) refuses `SECOND_APPROVAL_NEEDED` until a member other than the approver records a second approval (`filingSecondApprove({filing, author, viewer})`, refused `MACHINE_CANNOT_APPROVE`, `NO_SUCH_FILING`, `NOT_APPROVED`, `SAME_APPROVER`). *(not yet met: T45)* (Doubt 6.)
  - Control: with no setting naming the act, one approval sends.

Rows: `CONTRADICTED_HELD`, `SELF_BENEFIT_ASK`, `RFC_QUOTING_MISSING`, `NOT_A_PARTNER`, `JOINT_FINGERPRINT_MISMATCH`, `SECOND_APPROVAL_NEEDED`, `SAME_APPROVER`: new rows of C-115, translations BOB's.

**(c) Uses.** `case-account` (new edge, 112: the check, R34). `docket` (new edge, 103: the `legal` marks, R9). `project-roster` (new edge, 35: counsel matter and second-approval setting, R10, R42). All earlier.

**(d) Tests.** Every new refusal with its control above; R8's retired code never answered; R35 each of the three kinds; R36 a mismatch; R37 assembled with AI off; R41 with no action refused.

**(e) Size.** 2,184 lines; R34–R42 and the amendments add an estimated 900–1,300: about 3,100–3,500, under the mark but the next large fold would cross it. Suggest BOB names the seam now (the counsel packet, R8–R12, R31, R33, R14, is the natural one) without splitting.

---

## 4. escalation (L9, position 122)

**(a) Changes.** R6, R14, R16, R23, R25, R30 amended; **R31**, **R32** new.

**(b) Text.**

- **R6**, append: (T45; v0.2 rule 6; S1 §C 8) A stage-3 action that owes no reply (`<actions: no reply owed>`) never triggers by time or by its lack of a reply; the read says "no reply owed". *(not yet met: T45)*
- **R14**, append: (T45; N855 (D5); Actions D5; v0.2 rule 17; S1 §D 7) Compliance is restored, for each standard pursued, by a live `compliant` determination recorded after the escalation opened either of the same act (as now) or of a curing act: a later act of the same office linked by a member as the cure of this escalation's determination (`<conformance: cures>`). `COMPLIANCE_NOT_RESTORED` names, per standard, what is missing. Harm is read through `consequences.addressed` unchanged. *(not yet met: T45)*
  - Control: a compliant determination of a later act of another office, or one not linked as the cure, does not restore compliance.
- **R16**, append: (T45) An escalation `stopped_pursuing` (R31) is never listed.
- **R23**, append: (T45; N884; Actions D3; v0.2 rule 2) `ACTION_PREMISE_OVERRIDDEN` applies only while the action has no `rests_on` leg naming this escalation's determination; once a member's revision adds one, R9 attaches it, and the attachment and R2's read show the override (its ground, reason, who and when) in the history. This revises K600 (a). *(not yet met: T45)*
  - Control: the same overridden action without the leg is still refused.
- **R25**, append: (T45) The map gains `escalationstoppursuing` and `escalationreopen` (R31), as R25's other acts.
- **R30**, append: (T45; N855 (D6a); Actions D6a; v0.2 rules 15, 17) The source also answers each stop and reopening, `kind: "stopped_pursuing"` or `"reopened"`, with its date and never its reason. An escalation every attached action of which is confidential (`<actions: confidential>`) is not answered at all, and a confidential attached action's attachment is never answered. *(not yet met: T45)* (Doubt 14.)
- **R31** (T45; N855 (D6a); Actions D6a; v0.2 rule 17) **Stopped pursuing.** `escalationStopPursuing({id, reason, author, viewer})` sets the state `stopped_pursuing` (a new state of the `ESC-` type, beside `open`, `suspended`, `ended`), recording the stage, reason, who and when. Refusals in order: `MACHINE_CANNOT_STOP`; `NO_SUCH_ESCALATION`; `NOT_OPEN` (ended or already stopped; a suspended one may be stopped); `ESCALATION_NO_REASON` (R24). A stopped escalation proposes nothing (R2 answers `proposed: []` and its triggers as facts), is never `ended` and never answered as success; R1 answers `ALREADY_OPEN` for its determination, naming it. `escalationReopen({id, reason, author, viewer})` returns it to `open` at the stage where it stopped (`NOT_STOPPED` otherwise). Both are append-only (R18). *(not yet met: T45)*
  - Control: an open escalation at the same stage still proposes its met edges.
- **R32** (T45; S1 §C 13) R2's read also answers `context`: the actions the viewer may see that rest on the determination or its findings and are not breach actions (records requests, requests for comment and other evidence-seeking acts), each with kind, sent date and resolution. They are never attachments and never meet a trigger. *(not yet met: T45)*
  - Control: an attached breach action is in `actions`, never in `context`.

**(c) Uses.** No new edge (`conformance`, `actions` already used).

**(d) Tests.** R31 stop, reopen at the stage, and every refusal; R14 a curing act of the same office restoring and another office's not; R23 attach after the leg is added; R30 the stop dated with no reason.

**(e) Size.** 2,101 lines; this adds about 200–300. No risk.

---

## 5. action-plans (L9, position 123) and the split

### 5.1 Size and the split (BOB's packaging; K617)

action-plans holds **2,775** code lines today (checks 309, doc 123, index 1,910, values 281, schema 152). The hand-off's section adds scenarios set aside, a third state, infraction offers, a machine-mark write and a close seam (an estimated 700–900 lines), and the work of managing a plan as it goes: per-matter outcome and state, the timeline, reviews, preparation items, notes, "where it stands", status reports, taking up, the watch registration and the re-examination driver (an estimated 1,800–2,300). All of it in action-plans would be about 5,300–6,000 lines: past the ~4,000 mark.

**Proposed split:** a new product module **`plan-work`** in layer 9 directly after `action-plans` and before `monitoring` (empty paths and tests until its job creates them, K1043's form). It holds rule 20's and rule 18's working layer and the re-examination driver; `action-plans` keeps the plan itself. `action-plans` then lands at about 3,500–3,700. The seams are registrations an earlier module offers and a later one fills (P4): `action-plans` offers `registerCloseSnapshot` (R44 below), `plan-work` offers `registerWatchReader` (its R9). Its name is BOB's to choose.

Edges then: `plan-work` uses `action-plans`, `actions`, `action-clocks`, `escalation`, `filings`, `conformance`, `consequences`, `duties`, `jurisdictions`, `civil-time`, `ai-runs`, `membership`, `record-core`, `record-grammar`. The hand-off's `monitoring` → `action-plans` and `following` → `action-plans` stay (they read a plan's state for the once-only question at close); each also gains → `plan-work` (to register its watches, R9). `queue-producers`, `affordances`, `op-declarations`, `control-plane`, `plane` and `answer-envelope` gain → `plan-work` with their jobs. If BOB declines the split, `plan-work` R1–R12 become `action-plans` R46–R57 unchanged in meaning.

### 5.2 action-plans

**(a) Changes.** R6, R14, R17, R20, R24, R31, R33, R34 amended; **R39–R45** new; Satisfies re-pointed.

**(b) Text.**

- **R14**, append: (T45; N885; Actions D19; v0.2 §3) A plan holds any number of scenarios: `scenario` is a positive integer, no upper bound (`SCENARIO_OUT_OF_RANGE` only for one that is not; its row re-worded). This replaces "at most three scenarios, numbered 1–3" and supersedes K590 ruling 8. *(not yet met: T45)*
  - Control: a fourth scenario lands; `0` is refused.
- **R39** (T45; N885; Actions D19; v0.2 §3) `scenarioSetAside({plan, scenario, reason, author, viewer})` and `scenarioRestore({plan, scenario, reason, author, viewer})` (`op=scenariosetaside`, `op=scenariorestore`): a member sets a scenario aside, or restores it, with a reason (R4's rule); refusals `MACHINE_CANNOT_PLAN`, `NO_SUCH_PLAN`, `PLAN_CLOSED`, `NO_SUCH_SCENARIO`, `PLAN_NO_REASON`, `SCENARIO_ALREADY_SET_ASIDE` / `SCENARIO_NOT_SET_ASIDE`. A set-aside scenario is kept whole and readable with its reason, never deleted, its checkpoints never due (R17) and its checks not run (R19). Comparing scenarios is the screens'. *(not yet met: T45)*
- **R40** (T45; N890; Actions D27; v0.2 rule 20) **Paused.** A plan's state is `open`, `paused` or `closed` (edges open→paused, paused→open, open→closed, paused→closed). `planPause({id, reason, look_again?, author, viewer})` and `planResume({id, reason, author, viewer})`: a member, with a reason; `look_again` an optional `YYYY-MM-DD`. Refusals as R20's, and `PLAN_NOT_OPEN` / `PLAN_NOT_PAUSED`. While paused, what the plan set running continues (its actions' clocks, escalations, watches) and `planRead` says so, naming them; its own checkpoints are not due (R17); every other act stays open to members. `plansToLookAgain({nowMs, limit?})` answers each paused plan whose `look_again` day has come, once, for `queue-producers` (Owed). *(not yet met: T45)* (Doubt 3.)
- **R20**, append: (T45; N855 (D6b), N890; Actions D6b, D27; v0.2 rules 17, 20) Closing (from open or paused) records the reason, a **closing summary** (the frozen answer of the reader registered by R44 at the instant of closing, stored with the plan; never machine prose, never published, never rated), and an optional `note` of at most 4,000 characters answering the lessons prompt (what the group would do differently; prompt sentence keyed `plan.close.lessons`, the design stream's). With no reader registered, the summary is `undetermined` and the close still lands. *(not yet met: T45)*
- **R41** (T45; N887; Actions D25, D25a, D26; v0.2 rule 19) **Offers for an infraction.** For each matter that may be an infraction (a suspected matter naming `standards`, or a determined outcome `noncompliant` or `unclear`), `planRead` answers two standing offers, derived on read and never stored as options or proposals: `document_infraction`, first in the matter's order, and `chance_to_fix`. A member adopts one as an option (`optionAdopt({offer: {subject, kind}})`, R11's act). The chance to fix is answered for as long as the matter is not fixed (`plan-work` R2), whatever was declined; after each later step on the matter (an action of the plan sent, an escalation stage advanced, a filing sent) it is answered with `offered_again: {step, at}`. The plan never withdraws it. *(not yet met: T45)* (Doubt 4.)
  - Control: a matter whose determined outcome is `compliant` has neither offer.
- **R42** (T45; N887; Actions D25a; v0.2 rule 19) **Document first, never a gate.** `optionStart` (R18) of any other outward option serving a matter of R41 whose `document_infraction` option is not started takes `why_first` (1–500 characters; R4's rule), recorded in the history; without it, `DOCUMENT_FIRST_NO_REASON`. *(not yet met: T45)*
  - Control: after the documentation option is started, no `why_first` is asked.
- **R43** (T45; Actions D21; v0.2 rules 1, 16) `planMark({plan, marks, cause})` (in-process, for `plan-work` R10 only): writes the machine marks of rule 1 (an option whose premise or date changed, with why; a phase whose start now holds, opened; the profile's next routes offered), each labelled machine work with its cause (the response recorded). A mark never changes a disposition, scenario, judgement or start (R24); `planRead` answers marks apart. *(not yet met: T45)*
- **R44** (T45; Actions D6b, D14) `registerCloseSnapshot(module, fn)`: one registration (`membership.listenerRefusal`); R20's close calls `fn({plan})` inside its transaction and stores its answer as the closing summary. A throwing `fn` leaves the summary `undetermined`, never undoes the close. *(not yet met: T45)*
- **R45** (T45; N890; Actions D27; v0.2 rules 4, 20) The planning run's inputs include the closing notes (R20) of the project's earlier closed plans (`skills`, `agent-worker`: Owed). *(not yet met: T45)*
- **R6**, append: (T45; N890) `planRead` also answers the state and pause (R40), set-aside scenarios with reasons (R39), R41's offers, R43's marks, and `decisions`: the history's choices, declines, set-asides, restorations, pauses, start-first reasons and close, each with its reason and date (the decision log). *(not yet met: T45)*
- **R17**, append: (T45) A paused plan's checkpoints and a set-aside scenario's are not due.
- **R24**, append: (T45; v0.2 rule 1) R43's marks are the only machine writes, and decide nothing.
- **R31**, append: (T45; N861; Actions D11b; v0.2 rule 9) The planning run never suggests advocacy: R12 holds for every machine proposal; already met, cited to v0.2.
- **R33**, append: (T45) `scenariosetaside`, `scenariorestore`, `planpause`, `planresume` refuse a machine credential by `MACHINE_CANNOT_PLAN`.
- **R34**: no change of meaning (D17 applied at K2443: every proposal, no cut-off, no paging; unticked is `open`, R13). Strike the stale test sentence in Suggestions ("twelve proposals page as five, five, two …") and test the whole tray in one answer.
- **Satisfies**: v0.1 → `BIO_Action_v0_2.md` (K2775) §3 (action plan), §4 rules 1, 2, 3, 4, 9, 12, 16, 17, 19, 20.

**(c) Uses.** None new (`consequences`, `civil-time` go to `plan-work`). Without the split: `consequences`, `civil-time` (both earlier).

### 5.3 plan-work (new; L9, directly after action-plans)

Purpose (draft): the work of managing a plan as it goes and handing it over: what the group wants of each matter and how far it has gone, one timeline, reviews, preparation taken up, notes, "where it stands", status reports, taking up an item, and the re-examination a response sets off. A member does every act; the machine marks and proposes, labelled. Nothing here is published (DEC-25) or scored.

- **R1** (N890; D27; rule 20) `matterOutcomeSet({plan, subject, text, author, viewer})`: the group's intended outcome for a matter, 1–1,000 characters, revisions kept; machine refused. *(not yet met: T45)*
- **R2** (N890; D27; rules 17, 19, 20) Each matter's **state** is derived on read, the first that holds of: `ended` (its escalation ended), `fixed` (a cure linked, `<conformance: cures>`), `stopped` (its escalation stopped pursuing), `acting` (another outward action of the plan sent), `fix_offered` (a chance-to-fix notice sent, `filings` R38), `documented` (a documentation version approved, `filings` R37), else `none`. Never a percentage or score. *(not yet met: T45)* (Doubt 4.)
- **R3** (N890; D27; rule 20) `planTimeline({plan, nowMs, viewer})`: every act the group did on the plan's actions (sendings, receipts, moves) and every coming date (clock entries with basis and `owed_by`, `action-clocks` R18; phase starts and checkpoints; proposed escalation stages, `escalation` R2), in date order; `next`, the coming dates from `nowMs`, at most 10. Writes nothing. *(not yet met: T45)*
- **R4** (N890; D27; rule 20) Reviews: `planReviewRhythm({plan, recurrence | null, author})` (a member-set repeating reminder, `civil-time`'s recurrence subset); `planReviewsDue({nowMs})` for `queue-producers` (one item per due review, told once); `planReviewOpen({plan, viewer})` answers what changed since the last review entry (responses recorded, dates passed, marks); `planReviewRecord({plan, decided, author})` a dated review entry (1–4,000 characters). No rhythm, no item. *(not yet met: T45)*
- **R5** (N890; D27 A; rule 20) Preparation items: `prepItemAdd({plan, option, text})`, `prepItemTakeUp({plan, item, target?, author})` (the author takes it up herself, with her own target date; no key names another member: `OPTION_KEY_REFUSED`, `action-plans` R26), `prepItemDone`; visible to whoever sees the plan. *(not yet met: T45)*
- **R6** (N890; D27 C; rule 20) `planComment({plan, on: {option} | {action} | {draft}, text, author})` and `planComments`: under the plan's sight, never published, never reachable from any public read. *(not yet met: T45)*
- **R7** (N881; D14; rule 18) `whereItStands({plan, nowMs, viewer})`: each wait with its basis, next dates, holds (`<actions: holds>`), overrides with reasons, declined options and set-aside scenarios with reasons, escalations with state, and watches with end dates (R9). Registered with `action-plans` R44 as the closing summary. Writes nothing. *(not yet met: T45)*
- **R8** (N881; D14; rule 18) `statusReportDraft({plan, nowMs, viewer})`: a sourced list from R7, labelled machine work where assembled by the system (the assistant's text only where enabled, labelled); `statusReportSave({plan, text, from?, author})` keeps a member's report with the plan, never required, never published. *(not yet met: T45)*
- **R9** (N855 (D6d), N881; rule 17) `registerWatchReader(module, fn)`: `monitoring` and `following` register once each; `fn({plan, viewer})` answers the watches the plan set running with their end dates, read by R7. *(not yet met: T45)*
- **R10** (D21; rules 1, 16) **Re-examination.** At start this module registers with `<actions: onCorrespondenceRecorded>`. On each recorded response on an action in a project, it re-examines every plan of that project and of the projects linked to it by `arose_from` (both ways): options whose regulated date or premise changed, phases whose start now holds, the profile's next routes for that kind and outcome (`<jurisdictions: next routes>`), and the chance to fix re-offered (`action-plans` R41), written through `action-plans` R43 only. Where AI is enabled, it opens one planning run on the account Capability Ladders §2 names for the recording act (the project's own account where it holds one, else the recording member's), within its limits and the project's and group's settings (`ai-runs`; Owed). No disposition, scenario, judgement or start changes. *(not yet met: T45)*
  - Control: a response in an unlinked project marks nothing; dispositions byte-identical before and after.
- **R11** (N881; D14; rule 18) **Take up.** `itemTakeUp({item, author, viewer})`, `item` one of a clock entry `{action, entry}`, a checkpoint, a proposed escalation stage, a hold: a member who can see it routes its to-dos to herself from then; refused for a machine, an item she cannot see, or any `for` naming another member. `takeUpsFor({after?, limit?, viewer})` for `queue-producers` (Owed). Nobody assigns anybody. *(not yet met: T45)*
- **R12** (invariants) A machine writes nothing but R10's marks (through `action-plans` R43) and labelled drafts; every table append-only and declared to purge; no field holds a cost, hours, assignee or score; nothing reachable from publication; no place named.

### 5.4 Tests (action-plans, plan-work)

Each refusal with its control; R14 a fourth scenario; R39 set aside and restore with history kept; R40 a paused plan's checkpoints not due while its action's clock is still overdue; R41 offers present and re-offered after a sending; R42 with and without the documentation started; R20 the snapshot frozen (a later change does not alter it); plan-work R2 each state from a fixture; R10 marks only, and the AI run on the recording member's account when the project holds none.

---

## 6. Owed to others

**To the UX design stream (keyed sentences, words theirs unless canon gives them):** `packet.privileged`, `packet.privileged.warning`; `prepared.rests.held`, `prepared.rests.accepted` (canon gives the words); `filings.election.notice`; `rfc.quoting`; the record-check, position and self-benefit pointers; `plan.close.lessons`; the six matter states (canon's words) and "what's next"; the offers "document the infraction" and "chance to fix it" and the document-first reason prompt; "no reply owed"; "stopped pursuing, {date}"; a missed date as a question ("Noticed: no reply recorded by {date}", canon's example); escalation stage names as questions (S1 §C 14); the scenario comparison (two or three side by side); `@communication`'s step in the "Get a record" wizard.

**To other modules:**
- `actions`: a receipt fact (how, when) and a service fact on the ledger; a clock entry's `owed_by` and the `stated` basis kind accepted at the write (its R7 arm); "no reply owed"; the override's ground; `partners`; `confidential`; `onCorrespondenceRecorded(module, fn)`; a holds read for `plan-work` R7; the assertion-resolution state that `filings` R6 must read before approval (coordination: the gate is `actions`', the approval `filings`').
- `conformance`: a `cures` read; the kind of findings a determination rests on with dates and source group (`filings` R35).
- `jurisdictions`: several `templates` per kind, each with `name` and `sources`; `deadlines`' whose-duty (`owed_by`); defence deadlines; next routes per kind and outcome; election facts and the campaign-spending rule with citation; Tier 1 data (records request; with immediate disclosure; follow-up; reconsideration; mediation; written public comment; grand jury complaint; Brown Act demand at Tier 2).
- `project-roster`: counsel matter; the second-approval setting.
- `public-read`: per-group stamp fields (identity, stake).
- `case-account` / `case-disclosures`: a `contradicted` outcome and `question` in the account check, if not already distinct (Doubt 9).
- `steps`: a read of the steps waiting on an action's arrival, if `stepsOf` alone is not enough for `action-clocks` R16.
- `notice-producers`: draw `step-date-due` and `step-reminder` not for a step `action-clocks.clockForStep` answers (R16).
- `queue-producers`: no overdue item for an entry with `noticed_by` (R17); a missed own deadline told once (R18); routing by `plan-work` R11; owners told once on departure; due plan reviews (`plan-work` R4); look-again dates (`action-plans` R40); no items for a stopped escalation.
- `monitoring`, `following`: register with `plan-work` R9; the once-only question (theirs, per the hand-off).
- `ai-runs`, `run-rules`, `agent-worker`, `skills`: the re-examination run (`plan-work` R10) and the closing notes as planning input (`action-plans` R45).
- `wizard-scripts`: §2 (d).

## 7. Doubts

1. **R15's "group's own"** (BOB's). Re-based on `owed_by: group`; a body's `commitment` leaves the lateness index. *Recommend* as drafted: v0.2 rule 6 calls commitment the body's.
2. **Who writes and reviews the Tier 1 templates** (possibly Bob's: people, money, legal exposure). Rule 11 needs a named writer and a professional reviewer; no job can do it. Options: (a) Civicsmith commissions a named writer and a licensed reviewer; (b) a pilot group's member writes, a volunteer attorney reviews; (c) build the machinery now and leave `@records-request` refused until (a) or (b). *Recommend* (c) now, with (a) put to Bob.
3. **A paused plan's checkpoints** (BOB's). Read as the plan's own, not due while paused; clocks, escalations and watches continue. *Recommend* as drafted.
4. **"May be an infraction", the chance to fix being "never withdrawn", and the state order** (BOB's). Read: a matter naming standards or an outcome `noncompliant`/`unclear`; a member may decline the offer, but it is offered again after each later step; states in the order of plan-work R2.
5. **Where the election facts come from** (BOB's). Profile or local facts holding pending measures and candidates with dates; no detection by AI is required. *Recommend* as drafted.
6. **Second approval's home** (BOB's). The hand-off puts the setting in `project-roster`; enforcing it at sending is `filings` R42 here. *Recommend* `filings`, the module that records sending.
7. **Self-benefit asks** (possibly Bob's: softens or hardens a ruled line). D28b says such asks are "never prepared". Options: (a) refusal until rewritten, no override (drafted); (b) a member may confirm in her own words that the sentence asks nothing for the group, as rule 2's assertions. *Recommend* (a), the ruling's words; (b) only if Bob wants it.
8. **The re-examination opening an AI run without the recording member choosing** (BOB's). D21 ruled it "where enabled", on the recording act's account. *Recommend* as drafted.
9. **Does the case-account check distinguish "contradicted" and questions?** (BOB's; verify at the job). If not, it is owed to `case-account`/`case-disclosures`.
10. **`stated` deadlines owed by the group** (BOB's). Read: a `stated` entry counts in R15 only when a member marks it `owed_by: group`.
11. **Step and entry "standing for each other"** (BOB's). Linked by product or wait plus the same local day; no new field. *Recommend* as drafted.
12. **N884's window beside the refusal**: `actions` (118) cannot call `action-clocks` (119); it computes the window through `civil-time` itself. `action-clocks` has no share.
13. **`suspended` beside `stopped_pursuing`** (BOB's). Both kept: a pause in reporting vs. a decision to stop. *Recommend* both.
14. **A confidential escalation in the published lane** (BOB's). Leave out an escalation whose attached actions are all confidential (rule 15).

## 8. N-entries

- **Fully applied for these modules' share; the entry moves to applied once the sibling drafts land:** N885 (all of it is here); N887 (with `actions`' share of the quoting rule, N880).
- **Partly applied, the rest elsewhere:** N828 (`filings` R35; `conformance`'s part elsewhere), N855 (6a `escalation` R31, R30; 6b `action-plans` R20, R44, `plan-work` R7; 6c `consequences`; 6d `monitoring`/`following`), N858 (D8 `filing-templates` R15, R26, R28, `filings` R41; D9 `filings` R8, R9; D10 the hold in `actions`; guides, profile and rules elsewhere), N861 (`filings` R39, `action-plans` R31; the rest in `actions`, the assistant and case-account), N879 (no line here: `actions`' share, with the stamp in R22), N880 (`filings` R40; the signing view and docket elsewhere), N881 (`plan-work` R7, R8, R11; `queue-producers` R15–R18), N882 (`action-clocks` R2, R18, R15; the kind, profile and following elsewhere), N883 (`filings` R22, R36; partners and conformance elsewhere), N884 (`filings` R24, `escalation` R23; the override in `actions`), N890 (`action-plans` R40, R20, R45, R6; `plan-work` R1–R6; `filings` R42; the setting in `project-roster`), N892 ((b) `filings` R38, (d) R22, R35; (a), (c) in `actions`; (e) the stewards').
- **Hard reasons for what stays:** Tier 1 template content needs a named writer and a professional reviewer (Doubt 2); `@communication` waits for the design stream.
- **M-notes:** none; the hand-off marks nothing "measure first" for these modules.

## 9. The hand-off's lines and where each went

| hand-off line | placed |
|---|---|
| action-clocks: five basis kinds | R7 (`stated`), R15 |
| local-day computation, time of day, from service, receipt as start | R2 (time of day already met) |
| one date, one reminder (steps; duty's Noticed) | R16, R17; Owed notice-producers, queue-producers |
| our deadlines | R18, R15; Owed queue-producers |
| reminders as v0.1 rule 5 | already met (R4–R6, R8); Satisfies re-pointed |
| filings R8: packet without determination; defence purpose | filings R8, R9 |
| record check | filings R34 |
| drafting from chosen findings | filings R23 |
| templates: Tier 1 set; offered after the act; no court petitions; fixes `@records-request` | filing-templates R15, R26, R28; filings R41; §2 (d); Doubt 2 |
| joint texts | filings R36, R22 |
| documentation of an infraction | filings R37 |
| chance-to-fix notice; asks limited | filings R38 |
| election notice; position sentences | filings R39 |
| escalation R14: curing act | R14 |
| stopped pursuing | R31, R30, R16 |
| R23: override joins once determined | R23 |
| evidence-seeking acts in history; stage names | R32; stage names Owed UX |
| action-plans R34 every option | R34 (already met, K2443) |
| R14 any number of scenarios; set aside | R14, R39 |
| states open, paused, closed | R40 |
| infraction: document first, chance to fix | R41, R42 |
| no advocacy suggestions | R31 (already met) |
| re-examination driver | `plan-work` R10, `action-plans` R43 |
| per matter outcome and state | `plan-work` R1, R2 |
| timeline, what's next, decision log, reviews | `plan-work` R3, R4; `action-plans` R6 |
| preparation items | `plan-work` R5 |
| notes and comments | `plan-work` R6 |
| closing: reason, summary, note, lessons | `action-plans` R20, R44, R45 |
| where it stands; status reports | `plan-work` R7, R8, R9 |
| take up | `plan-work` R11 |
| new edge `action-clocks` → `steps` | §1 (c) (and `duties`) |
| new edges `monitoring`, `following` → `action-plans` | kept; also → `plan-work` (§5.1) |
