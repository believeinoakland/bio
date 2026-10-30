# Task summary · T53 · filings

This summary stands for the filings job's reading set (SESSIONS §6.3): the `**filings**` block of `build/plan/current.md`, `build/plan/T53-R1/filings.md` (rows; no trims file exists), `build/requirements/filings.md` (both parts), `build/layers.md` (head, layer 9's row), the Purpose of 31 used modules and the named service blocks of `record-core`, `jurisdictions` (combine), `standards`, `conformance`, `consequences`, `actions`, `action-clocks`. The sources stay binding; read any cited section in full when the work touches it. R29, R71 (T53) keep every binding word; others keep codes, order, signatures, bounds.

## Entries

- T53-304 · K5527 (4) · R29: a profile template's recorded `sha` equals its counted review's hash; an earlier text is flagged (`planning/lines-K5527-texts-and-listing.md` §2) (R29).
- C T52-31 · W17 · E-K8 · MINOR · the counsel packet's claim is read from an empty `## Conclusion` section as empty, not as the next heading (`#fact`); PL2 W17 (R9).
- T53-305 · CAPABILITIES · rows: action-records R21, action-grammar R31, action-clocks R28, R29 (proposal and entry keep `layer`; a date never recomputed by a later layer), filing-templates R37, **filings R71**, all N1257 layer-names; filings R29 amended, no new id (R71, R29). Draft line: conformance C T52-29; actions C T52-30, N1257 R112; action-plans C T52-32, T52-33; action-clocks N1257 R27; filing-templates N1257 R36; shared judge `[owed: BOB writes]` (`planning/plan-T53-capabilities.md` §A Layer 9).
- T53-306 · K5565 · English in tests: convert the module's sites to the word key and its values (each assertion reads the key the product reads); a B site first gets its key; a C site kept as input or removed with its reason; every test the job touches is converted. Counts: literal A/B files 0/1; regex A/B/C sites 2/1/3 (3 files); `sonnet-5-5` where a B site needs a key. Test: baseline loses the module's files, suite green (R52).
- Journeys register: filings is co-owner with no draft line of its own; the job reads the screen-module line's owner clause (R68, R62).

## filings (own requirements)

Status: in force (K102); R8-R12 are K13. R29, R71 *(not yet met: T53)*. Purpose: what the group sends, prepared from the record: at governing tier 1 or 2 a filing pre-filled from an approved template version (latest default) or the member's own words, each filled blank naming its source, Tier 2 with its advisory note; at any tier a **counsel packet** (required at Tier 3) for counsel the group names or its own use, never published, never fileable as it stands. Counsel drafts and files at Tier 3. The AI prepares; a member approves, files and records the sending.

Terms: **governing tier** = the stricter of the kind's profile tier (`jurisdictions` R25) and the action's risk tier (`actions` R25); `undetermined` when the action's is; the action's alone when the profile gives the kind none. **Blank** = `{{name}}`, a key of `FILING_BLANKS`; **filled blank** = `{name, value, source}`.

**filingPrepare({action, template?, text?, preparer, viewer}) -> `{ok, id, tier, text, blanks, unfilled, advisory?, venue, label, template}`**
- R1 · Refusals in order: `FILING_NO_PREPARER`; `NO_SUCH_ACTION` (via `actions.noSuchAction`); `ACTION_CLOSED` (`resolved`/`abandoned`); `FILING_TIER_UNDETERMINED`; `TIER3_COUNSEL_PACKET`; then R28's. `KIND_NO_TEMPLATE` retired.
- R2 · Only governing tier 1 or 2; undetermined refused, never read as 1 (D-182); the stricter governs; a member may raise Tier 1 to 3 and get a packet.
- R3 · Every blank filled from the record or left `[UNFILLED: <name>]`, listed in `unfilled` with why; never invented, defaulted or taken from the preparer. Sources: addressee (`actions` R9: `role`+`body`, `role`+`organisation`, `description`); determination (act, date, standards' citations, findings' editions); governing laws, `law`; clock entries with bases; venue (`venue.name`, `venue.how`); `promotion` fact `producingGroup` (`FACT_UNAVAILABLE`/`FACT_FAILED`: undetermined); preparation date.
- R4 · Tier 2 carries the profile's advisory note first and as `advisory`; Tier 1 none.
- R5 · Any credential may prepare; draft stored apart, labelled `proposalLabel(preparer, "filing_draft")`, `evidence: false` with a sentence that nobody approved or sent it; preparing again makes a new draft; never edited.

**filingApprove({filing, text?, author, viewer}) -> `{ok, filing, approved_by, at, sha}`**
- R6 · Refusals in order: `MACHINE_CANNOT_APPROVE`; `NO_SUCH_FILING`; `FILING_STALE` (tier, counterparty, determination or laws changed, or determination superseded; names what); `STILL_UNFILLED`; `TEXT_UNWRITABLE`; then `ASSERTION_RESOLUTION_REFUSED`, `ASSERTION_UNRESOLVED` (R43), `CONTRADICTED_HELD` (R34), `SELF_BENEFIT_ASK` (R38), `RFC_QUOTING_MISSING` (R57). Approved text is the member's, with who, when, SHA-256; once only (`ALREADY_APPROVED`).

**filingRecordSent({filing, at, medium, artifactSha? | account?, reference?, author, viewer}) -> `{ok, filing, action, ord, proposed}`**
- R7 · Refusals: `MACHINE_CANNOT_FILE`; `NO_SUCH_FILING`; `NOT_APPROVED`; `ALREADY_SENT`; `actions.actionCorrespond`'s (R15-R16); `SECOND_APPROVAL_NEEDED` (R42), `NOT_THE_GROUPS_ACT` (R44), `SENT_REFERENCE_MALFORMED` (R54). One `sent` entry, linked both ways; moves no state, writes no clock entry (`proposed` carries next state and `clockPropose` entries); nothing transmitted.

**counselPacket({action, counsel?, template?, reason, purpose?, author, viewer}) -> `{ok, id, version, sections, marking, fileable: false, template}`**
- R8 · Any governing tier. Refusals in order: `MACHINE_CANNOT_NAME_COUNSEL`; `PACKET_NO_REASON` (C-115.44; `reason` absent, not a string, blank or over 2,000 chars); `NO_SUCH_ACTION`; `NO_COUNSEL` (tier 3 or undetermined: `counsel` lacks name or organisation; Tier 1/2 optional, one given needs both); R31's. `NO_DETERMINATION` retired. `purpose` `claim` (default) or `defence`. A standard whose `access` is not `free` (`null` on a non-`standard` kind is free; `undetermined` or unstated: not free) is carried in every version and export (R11) as designation, edition, issuer, citation, adoption, access, plus only the passages relied on (comparison rows' `requires`, findings' legs), each with content id, quoted; never its whole text.
- R9 · Six sections, each item naming its source: **facts** (findings with edition, claim, citations; per matter a live determination, else the inquiry and findings, each with kind (published, checked and held, accepted, unpublished) and grade, stated not determined); **chronology** (R33); **exhibits** (SHA-256, locator, capture time, `attestation.attestationsOf(captureSha)`, never by parsing the bundle); **standards** (citation, kind, issuer, content ids, `inForce` at the act's date); **candidate theories and remedies** (labelled candidate, proposer, machine or not; never a conclusion; says when empty); **deadlines** (every profile deadline applying to `claim`, `jurisdictions` R26: period, count, start event, citation; date only from a recorded start event and the rule's `count` on the holiday calendar, else `undetermined` with why, incl. a year the calendar lacks). `consequencesOf` consequences as recorded, states apart. `defence` adds **challenged statements**, **pressure received** (`action-holds.pressureFor`; `legal` marks, `docket` R27) and **defence deadlines** (`defends: true`, `jurisdictions` R87 (c)). Deadlines read are `local-facts.governingView`'s. No sentence says the group has a claim or that a protection applies (R14).
- R10 · Every section, head and export carries "Prepared for review by <counsel's name, organisation>. Not legal advice. Not for filing."; no counsel: "Prepared for the group's own review. Not legal advice. Not for filing." No caption, court heading, signature block, prayer, nor `use: file` text; `brief` text only in `briefing`. A counsel-matter project (`project-roster.projectScope`) also carries `packet.privileged`, `packet.privileged.warning`.
- R11 · Never published; read only by a member who sees the action and every project drawn on (`counselPacketRead`, else `NO_SUCH_PACKET`). `counselPacketExport({id, version, author})` records who, which version, when, for which counsel; machine `MACHINE_CANNOT_EXPORT`.
- R12 · Re-assembling makes a new version; `basis_changed` names each cause (determination superseded or flagged, finding in a later edition, standard superseded).
- R33 · Chronology = `events.timeline` (R28-R30) over the act event (`conformance` R25), the counterparty office entity and findings' entities, act date to assembly; two lanes apart ("what they did"; "what we did" via `actions`, `docket`), never interleaved; undetermined order shown with bounds; each item names its source; `truncated` said.

**filingsFor({action, viewer}) -> `{drafts, packets}`**
- R13 · Drafts and packets in creation order; `NO_SUCH_ACTION`; one on an unseen project's determination or consequence is left out wholly. R50 adds per draft `second_needed` (`true` exactly when `secondApprovalNeeded` is `needed` per R42 and none recorded).
- R14 · **theoryPropose({packet | action, theory, remedy?, standards, why, proposer, viewer})**: stored apart, `proposalLabel(proposer, "theory")`; `why` at most 1,000 chars; `THEORY_NO_STANDARDS`, `NO_SUCH_STANDARD`, `THEORY_STANDARD_UNREADABLE`, `THEORY_NO_PROPOSER`; a candidate in the next version.
- R15 · Available-actions block (registered with `public-read` R8): kinds against the counterparty's offices with tier and words; Tier 3: standards, factual basis, the sentence that competent counsel is required, the profile's legal organisations and contacts (`jurisdictions` R32) or "none named"; risk classification for every kind; never a Tier 3 template or packet content.
- R21 · **availableActions({determination, viewer})**: same composer; `NO_SUCH_DETERMINATION`; `DETERMINATION_UNREADABLE`.
- R22 · Approved bytes, packet exports and communications carry `public-read.inbandQuartet` (hash, date, author, both floors) with `groupFields()` as `group`; unapproved: none; fingerprint (R36) excludes it.
- R23 · **communicationPrepare({action, text, purpose, preparer, viewer})** (`op=communicationprepare`): addressee anyone; stored apart, `proposalLabel(preparer, "communication")`, `evidence: false`; no template. Refusals: `COMMUNICATION_NO_PREPARER`; `NO_SUCH_ACTION`; `ACTION_CLOSED`; `COMMUNICATION_TEXT_REFUSED`; `COMMUNICATION_PURPOSE_REFUSED` (empty or over 500). R6, R7 apply. Drafted from `from` findings/inquiries (`NO_SUCH_BUNDLE`); claims a sourced list labelled machine work; no published case needed.
- R24 · With `premise_override` (`actions` R8): first, "Rests on an unestablished premise:" with reason, author, time, ground (`actions` R74), then `disclosures` (R75) in order.
- R25 · No refusal for capture grade; each exhibit shows grade and co-attestation; where the profile states `evidence` (`jurisdictions` R39) the venue's standard, flagging below `accepts` or `contestable`.
- R26 · *(retired: moved to `filing-templates`)*
- R28 · At most one of `template: {id, version?}`, `text`: `filing-templates.offeredVersion` (`NO_SUCH_TEMPLATE`, `TEMPLATE_RETIRED`, `TEMPLATE_NOT_OFFERED`), then `TEMPLATE_USE_BRIEF`, `TEMPLATE_KIND_MISMATCH` (C-115.39); text judged as a template's (`TEXT_UNWRITABLE`, `FILING_TEXT_MAX`, `TEMPLATE_BLANK_UNKNOWN`); both: `TEMPLATE_AND_TEXT`; neither: the profile's latest `use: file` template for the kind, else `TEMPLATE_NOT_NAMED` (C-115.40; lists at most 20).
- R29 · *(not yet met: T53)* Every filing draft records `template: {id, version, sha, origin}`, or `template: null` for the member's own words. A template naming profiles none of which gave the action's kind (its `profile` tag, `jurisdictions` R13) is used, and the draft says first, after any advisory, that the template was not written for that jurisdiction, naming it; a `general` template says nothing of it. `filingsFor` (R13) shows the template with the version's state, approver and reviews, and flags a draft whose version was later updated ("prepared from version <n>, since updated by version <m>") or whose template was retired (naming the reason). Nothing in the draft changes, and no approval is refused for it. (T53; N858; K5510, K5527 (4); R137) For `origin: "profile"` the recorded `sha` is the SHA-256 of the profile text the draft was made from, the same value a counted review's `reviewed_text_sha` equals (`jurisdictions` R126); `filingsFor` shows a draft whose recorded `sha` differs from the offered text's present `sha` as made from an earlier text (the existing flag for an updated version, no new word). Test: a draft from a profile template records `template.sha` equal to the template's `reviewed_text_sha`; after the profile text changes and is re-reviewed, the old draft still records the old `sha` and `filingsFor` flags it. Control: a draft from a team's own template, and one from the member's own words (`template: null`), are unchanged.
- R30 · R9's deadlines and R7's `proposed` entries state the calendar's status as `action-clocks` R10 does, via `local-facts.factStatus` (R2); reader `action-clocks.factReader` (R12).
- R31 · `counselPacket` may take `template: {id, version?}`, `use: brief` (`TEMPLATE_USE_FILE` for `file`), refusals as R28; filled as R3, it is the seventh section `briefing` with R10's marking; recorded and flagged as R29.
- R32 · **templateSave({filing, template?, project?, name?, kind?, use?, profiles?, notes?, author, viewer})** (`op=templatesave`) -> `filing-templates.templateDraft` (R3) with `from: {filing, sha}`; refusals: `NO_SUCH_FILING`; `TEMPLATE_FROM_UNAPPROVED` (C-115.34); then its own. New template `project`: request's, else action's, else draft basis's, else `TEMPLATE_SCOPE_REFUSED`.
- R34 · **Record check**: every draft, `briefing` and communication judged per sentence (one split, R43) by `case-account` (R13): `supported`, `unsupported`, `contradicted` (`ACCOUNT_CONTRADICTED_BY_RECORD`), against R35's kinds and dated correspondence; this module classes `question`, member-marked `own_doing`. Unsupported pointed out, never refused. R6 refuses `CONTRADICTED_HELD` unless `release: [{ord, reason}]`; a throwing judgment reads undetermined.
- R35 · Findings checked and held: `prepared.rests.held` ("Rests on findings checked for publication on {date}, not yet published."); accepted: `prepared.rests.accepted` ("Rests on findings of {group} (edition of {date}), accepted by us on {date}.") with that group's identity and stake (`actions` R75 `disclosures`); published only: neither.
- R36 · **Joint texts**: with `partners` (`actions` R78) a body fingerprint (SHA-256 without R22's fields). **jointSignatory({filing, organisation, body_sha, account, author, viewer})** (`op=jointsignatory`): `MACHINE_CANNOT_APPROVE`; `NO_SUCH_FILING`; `NOT_APPROVED`; `NOT_A_PARTNER`; `JOINT_FINGERPRINT_MISMATCH`; listed in `filingsFor`.
- R37 · `communicationPrepare` `purpose: "document_infraction"` with `audience` (`violating_party`, `members`, `oversight`, `public`, `broad`): without AI assembled from the record (act, office, standard, evidence with grade, uncertainty, each sourced); `agent-worker` R76 `infractiondraft` a labelled proposal; `violating_party` is a request for comment (R40's sentence, a review time with basis).
- R38 · `purpose: "chance_to_fix"`: notice of correction and remedy with a time (law's period or `window` basis); `action-grammar.pointOut` `own_benefit_ask` (R18) sentences pointed out and R6 refuses `SELF_BENEFIT_ASK`, no override; other asks pointed out unless for the standard's act, remedy of a recorded consequence or a profile route.
- R39 · Member marks a draft naming a pending measure or candidate: `legal_facts` of trigger `pending_measure_or_candidate` (`jurisdictions` R79) answered once as `notices: [{kind: "election", citation}]`, key `filings.election.notice`; in a group public comment or testimony (R44) `position` sentences pointed out; never refusing.
- R40 · A request for comment carries `rfc.quoting`; R6 refuses `RFC_QUOTING_MISSING` (check is `filing-templates`', R57).
- R41 · **templatesForAction({action, viewer})**: offered `file` versions (`filing-templates` R14, R25) for the action's kind at tier 1 or 2, latest first; action only; `NO_SUCH_ACTION`.
- R42 · Where `project-roster.secondApprovalNeeded` (R24) is `needed`, `filingRecordSent` refuses `SECOND_APPROVAL_NEEDED` until another member: **filingSecondApprove({filing, author, viewer})** (`op=filingsecondapprove`): `MACHINE_CANNOT_APPROVE`; `NO_SUCH_FILING`; `NOT_APPROVED`; `SAME_APPROVER`.
- R43 · **Assertion gate**: outward text read by `action-grammar.pointOut` `assertion` (R18) over R34's sentences in the stated language with `phrasings`; `agent-worker` `textcheck` `reads_as: assertion` unioned, machine work, matched by verbatim `quote`, never `index`. `filingApprove` takes `resolutions` (R19's shape), recorded; `ASSERTION_RESOLUTION_REFUSED`; `ASSERTION_UNRESOLVED` after `TEXT_UNWRITABLE`; a machine never resolves; `breach_claim` makes a breach action (`actions` R8); no list for the language: lands with `phrasing.no_list`.
- R44 · Public comment or testimony `voice: "group"` (default; approved, stamped) or `"self"` (own notes, "not the group's act" sentence, never approved, stamped, recorded or published; `NOT_THE_GROUPS_ACT`).
- R45 · Kind `shape: recognition` (`actions` R93): `recognition.staff_public` once per draft, never refusing.
- R46 · Press draft's review copy (`actions` R79) carries `embargo_until`, `release_at` on its face and in the stamp's `subject`; sending before `release_at` recorded as the review copy; no terms: the no-embargo sentence.
- R47 · **holdNoticePrepare({place, viewer, preparer})** for a hold in place (`action-holds` R2): place, reason, date, material kinds; labelled as R5; no recipient, no compliance; `HOLD_NOT_IN_PLACE`.
- R48 · Staff named below the responsible official: only via `textcheck` `reads_as: staff_named`, machine work, never refusing; assistant off: `pointer.staff.notrun`.
- R49 · Each `legal_facts` entry (`jurisdictions` R79) applying to the kind shown once per draft/packet as `notices: [{kind: "legal_fact", key, citation}]`, never refusing.
- R51 · Rows C-115.45 `CONTRADICTED_HELD`, .46 `SELF_BENEFIT_ASK`, .47 `RFC_QUOTING_MISSING` (`filing-templates`'), .48 `NOT_A_PARTNER`, .49 `JOINT_FINGERPRINT_MISMATCH`, .50 `SECOND_APPROVAL_NEEDED`, .51 `SAME_APPROVER`, .52 `ASSERTION_UNRESOLVED`, .53 `ASSERTION_RESOLUTION_REFUSED` read `words.json` `refusal.<CODE>` by key; codes, numbers unmoved.
- R52 · Every keyed sentence is `words.json`'s, read by key, placeholders filled: `prepared.rests.held` (`{date}`), `prepared.rests.accepted` (`{group}`, `{date}`, `{date_accepted}`), `packet.privileged`, `packet.privileged.warning`, `filings.election.notice` (`{fact}`, `{citation}`), `recognition.staff_public`, `pointer.record.supported` (`{findings}`), `pointer.record.unsupported`, `pointer.record.contradicted`, `pointer.position`, `pointer.selfbenefit`, `pointer.staff`, `pointer.staff.notrun`, `voice.group`, `voice.group.means`, `voice.self`, `voice.self.means`, `filings.secondapproval.given` (`{member}`, `{date}`), `phrasing.no_list`, `rfc.quoting`, `filings.secondapproval.waiting`, `filings.review_copy.no_embargo`, `filings.review_copy.terms`.
- R53 · **approvedUnsent({viewer})**: approved, unsent drafts on seen actions `{filing, action, project, approved_by, approved_at}`, oldest first, at most 200, `truncated`.
- R54 · `filingRecordSent` `reference` 1-100 chars, one line; `SENT_REFERENCE_MALFORMED`. R55 · `fills: {<blank>: text}` on `filingPrepare`/`communicationPrepare`, labelled the member's; `FILL_UNKNOWN_BLANK`. R56 · unknown blank in own words: `filing-templates.blankUnknownRefusal`, as given.
- R57 · R40's check is `filing-templates.rfcQuotingRefusal` at R6 on the approved text of R40's and R37's texts; the sentence is `RFC_QUOTING_SENTENCE`; refusal code, number, place unchanged.
- R58 · Tier 2 filing answers `offers: ["counsel_packet"]` beside `advisory`; Tier 1 none; never required.
- R59 · **filingRead({filing, viewer})** (`op=filingread`): stored `text`, `blanks`, `unfilled`, `fills`, `template`, `advisory`, `offers`, `notices`, `label`, action, approval, sending, `exhibits`, `venue_standard`; nothing re-filled; absent or unseen: `NO_SUCH_FILING`; writes nothing.
- R60 · **Matter's stake**: the action's `own_stake` (`actions` R105), else the project's `matter_stake` (`public-read.groupFields({project})`, R36), else none: `{stake, set_by, set_at, source: "action" | "project"}` or `null`; unreadable: `stake: "undetermined"` with its `source`, never the other source, never `null`. R61 · stamp `group` = `groupFields({project})` at approval, `matter_stake` = R60, both shown; fingerprint (R36) excludes them. R62 · **stakeAtPreparation({action, viewer})** (`op=stakeatpreparation`) -> `{higher_stakes, governing_tier, group_stake, matter_stake, project}`; `higher_stakes` true at tier 2, 3 or undetermined; `NO_SUCH_ACTION`; changes nothing. R63 · accepted source line also prints its `matter_stake`.
- R64 · Registers `minutesComparisonsOn({case, members, viewer})` with `case-inputs.registerMinutesComparisons` (R19): per seen `public_comment` action with a `received` entry with `minutes`: `{meeting, date, minutes, filed, same}`; throws when it cannot read; writes nothing.
- R65 · `templatesForAction` also answers `not_offered: [{handle, name, lacks}]` (`lacks` among `writer`, `sources`, `professional_review`, `second_approval`) and `court_petition: true` (none listed) for a court-filed venue (`filing-templates` R28, R35).
- R66 · `filingApprove` accepts `resolutions: [{sentence, resolution, words?}]` (`only_asks` with `words`, or `breach_claim`) and `release: [{ord, reason}]`; R68's declaration names them.
- R67 · `templateSave` from a draft at governing tier 3: `use: file` refused `TEMPLATE_TIER3_FILE` (new or new version); `use: brief` accepted.
- R68 · Exports `DECLARED_OPS` for `filingprepare`, `communicationprepare`, `filingapprove`, `filingrecordsent`, `filingsecondapprove`, `counselpacket`, `holdnoticeprepare`, `templatesave`, `jointsignatory` (requires filing, organisation, body_sha, account): `fields: {accepts, requires}`; tested by `declaredOpHolds`.
- R69 · After the sight check, before any write, R1, R23, R6, R7, R42, R36, R8, R47 ask `membership.projectAuthority(project, identity, "joined", act)` of the stamped preparer/author; refusal `PROJECT_ACT_NOT_A_PARTICIPANT`; machine, no project, absent identity: not asked; after `NO_SUCH_ACTION` (before `ACTION_CLOSED` in R1, R23), after `NO_SUCH_FILING` in R6, R7, R36, R42.
- R71 · *(not yet met: T53)* (T53; N1257; K5458; amends R29, R3, R38, R49, R9, R6) **A filing records the layer of every rule it rests on.** The draft's `template: {id, version, sha, origin}` (R29) gains `layer` for a profile template (`filings/index.mjs:810-816`); the sources a draft keeps for its blanks, `profile:<id>/deadlines/<rule>` and `profile:<id>/action_kinds/<kind>/venue` (`index.mjs:636, 872, 1057`, stored in `filing_drafts.blanks`, `schema.mjs:12-26`), carry the layer id as `<id>` for a new draft (the `profile` tag of R13 of `jurisdictions` names the layer, R114 there); each `notices` entry `{kind: "legal_fact", key, citation}` (R49) gains `layer`; a packet's deadlines section (R9) and the chance-to-fix time (R38) name the layer of each rule. R6's account of what changed since a draft (tier, counterparty, determination, laws, `schema.mjs:8-11`) does not report a layer's arrival as a change, and a draft prepared before the change is neither re-read nor rewritten. Test: a draft prepared under the Oakland layer's rule keeps its `layer` and its source string after a second city layer arrives, and R6 reports no change. Control: a draft prepared before the change reads and approves as it did, source strings untouched.

Private. Invariants:
- R16 · A machine never approves, sends, names counsel or exports. R17 · Tier 3 never yields a `use: file` template, pre-filled filing or fileable document (R31). R18 · Every value, item and event names its source; nothing invented. R19 · Drafts, approvals, sendings, packets, exports, proposals append-only, declared to purge; unseen action reads as absent. R20 · No place, law, venue or template named in behaviour or text.
- R27 · What the reader may not see is withheld whole as `conformance` R24 answers: omitted findings/standards never stood in by null, section `out_of_view: true`; a superseded standard with unseen successor named without `by`; R3 blank stays `[UNFILLED: <name>]` with why "... is not one you may see"; assembled versions keep their bytes (R12).
- R70 · Every recorded instant reads a handed clock, else env `BIO_NOW_MS`, else the wall clock to the second (test `clock.test.mjs`).

Satisfies: `BIO_Action_v0_1.md` §3, §4 rules 2, 7, 12, 13; `BIO_Action_v0_2.md` §3, §4 rules 2, 3, 5, 8, 9, 11, 12, 14, 15, 19, 20, 21 (R8-R10, R34-R49); `BIO_Design_Requirements_v2.md` §8, §12; `BIO_Functional_Architecture_v3.md` Layer 3; `BIO_Complete_Roadmap_v5.md` §8, §9; `BIO_Publication_v0_1.md` §8; `build/layers.md` layer 9; `BIO_Capability_Ladders_v0_1.md` §6C.8 (R8).

Suggestions: ids `FIL-`, `CPK-`; tables `filing_drafts`, `filing_approvals`, `filing_sendings`, `counsel_packets`, `counsel_packet_exports`, `theory_proposals` (R19); packet bytes one Markdown with an exhibit-digest manifest (R10, R11); rows C-115.31-.33, .35-.38 moved to `filing-templates`; `KIND_NO_TEMPLATE`, `NOT_TIER3` retired (R28); Tier 2 advisory text is the profile's, absent: `STILL_UNFILLED` (R4, R6).

Uses (edges): the modules under `## Uses:` below, each as cited in R1-R71; new edges are BOB's (K2780): `case-checker` `checkAccount` (its R24; R34), `case-inputs` (R64).

## Uses: record-grammar
Shared record grammar (ids, canonical JSON, actor identity, SHA-256); no store or clock (R5, R16).

## Uses: jurisdictions
Holds the jurisdiction profiles (local facts as data); no other module names a place.
**combine(list) -> `{ok: true, view, conflicts}` or `{ok: false, errors}`**
- R12 · `UNKNOWN_PROFILE`; `INVALID_PROFILE`; `NOT_A_LIST`; `UNKNOWN_SECTION`; never throws. R13 · `view` has profile shape plus `profiles`, `covers`, `test`; facts carry `profile`. R14 · lists unioned in order. R15 · one-value-per-key facts withheld on disagreement into `conflicts`; combine never chooses. R16 · empty list: `ok: true`. R34 · `legal_organisations` unioned; `holidays` year one value per key. R29 · kind `tier`, `venue`, `template`, deadline `days`, `count`, `starts` one value per key; `laws` unioned.
- R95-R98 · federal records law; `response`; deadline `label`; `governingZone`. R99 · `layer: {level, place, within?, origin}` (`LAYER_INVALID`); `<layer id>:<name>`; `NAME_AMBIGUOUS`. R100 · `LAYER_LEVEL_MISMATCH`. R101 · `LAYER_ID_TWICE`, `LAYER_FEDERAL_TWICE`, `LAYER_PARENT_MISSING`, `LAYER_PARENT_LEVEL`, `LAYER_CYCLE`, `LAYER_NO_FEDERAL`, `LAYER_TEAM_TWICE`. R102 · conflicts carry each giver's layer. R103 · equal weekend `days` agree. R104 · `CLOSURES_UNKNOWN`. R105-R108 · `records_help` per `law`; `governs`; `federal` level; `coverage`.
- R121 · pure `nameResolve({section, name, layer?, asking?, layers})`; `NAME_UNKNOWN`, `NAME_AMBIGUOUS`. R115-R117 · one team layer `{origin: "team"}`; `TEAM_SECTION_REFUSED`; team never replaces a shipped value. R123-R124, R134-R135 · `fiscal_year` per government. R125-R126 · `GUIDE_UNATTRIBUTED`; `attributionLacks`, `textsLack`, `countedReview` (`reviewed_text_sha` = SHA-256 of the text now). R136-R139 · `TEMPLATE_COURT_PETITION`; `MACHINE_CANNOT_DRAFT_TEMPLATE`, `MACHINE_CANNOT_APPROVE_TEMPLATE`. R127-R132: registers.

## Uses: record-core
Storage: ids, leases, history, purge.
**allocId(prefix, year) -> `{id}`**
- R1 · `<prefix>-<year>-N`, four digits, no ceiling, never twice; opaque per R76. R2 · same step inside a transaction.
**declarePurge(module, tables, {exempt?}) -> void**
- R21 · declared once via `declareTable` (classes `purge`, `expunge`, `export`, `sight`, `derive`, `version_chain`; `TABLE_CLASS_MISSING`, `TABLE_CLASS_UNKNOWN`, `TABLE_DECLARED`). R46 · `keys`, `whole`, `clears`. R22-R24 · `purge({bundleId})` never clears `seq`, `minted_ids`, exempt tables.
**getSetting(name, options?) -> value, `null` or `SETTING_UNREADABLE`; setSetting(name, value, by)**
- R25 · last value, `null` if none; exempt from purge; refusals `SETTING_NAME_REQUIRED`, `SETTING_BY_REQUIRED`, `SETTING_VALUE_REQUIRED`, `SETTING_INVALID`. R83 · `{strict: true}`. R84 · `SETTING_NOT_JSON`. R86 · `ALLOCID_PREFIX_REQUIRED`, `ALLOCID_YEAR_REQUIRED`. R26 · active profiles = setting `jurisdiction_profiles`. R85, R87-R90: `allocid` op, `putFromParts`, ranged `get`, `writeCount()`.
**transact(fn) -> fn's result**
- R32 · one transaction; throw or `ok:false` rolls back rows and ids; nested = savepoint.
**stampInstant(precision, when?) -> string; instantOrder(a, b)**
- R47 · `"second"` -> `YYYY-MM-DDTHH:MM:SSZ`, `"millisecond"` -> `...sssZ`; else throws. R48 · compares instants, NaN if unreadable.

## Uses: membership
Members, projects, the fence (R69, R13).

## Uses: promotion
The one write path for a bundle (R3).

## Uses: provenance
Register of captured bytes, receipts, capture grade (R7, R25).

## Uses: attestation
Trusted timestamps over a capture's hash (R9).

## Uses: content
Reference to a part of a captured document (R9).

## Uses: publication
The published record; one irreversible act (R3, R9).

## Uses: standards
A standard held as content with citation and period in force.
**standardRead({id, viewer}) -> answer or refusal; standardsIn({at?, kind?, source?, cite?, after?, limit?, viewer})**
- R5 · R1's fields, source, supersession, text standing, `passageNotice`; `STANDARD_NO_ID`; absent id or non-member viewer: `NO_SUCH_STANDARD`. R6 · `STANDARD_ALREADY_SUPERSEDED`. R7 · `inForce(id, date)` -> `in_force` | `not_in_force` | `undetermined` with why (alias of R20 `inForceAt`; `known_through`). R8 · at most 200 per page, `truncated`.

## Uses: conformance
A member's determination of an act per standard; a machine never determines.
**determinationRead({id, viewer}); determinationsFor({project?, act?, standard?, finding?, outcome?, live?, after?, limit?, viewer})**
- R9 · outcomes per standard, findings' pinned edition and strength pair, `basis`, `void`, `cured_by`/`cures`, `outcomes_differ`; absent or invisible: `NO_SUCH_DETERMINATION`; unseen withheld whole (R24). R10 · `live` until superseded; `basis_changed` names causes. R11 · at most 200 per page, id order, `truncated`.

## Uses: consequences
What a breach did and to whom; undetermined where the record lacks figures.
**consequencesOf({determination, standard?, viewer}) -> `{parts, totals, undetermined, unproven}`**
- R7 · every live part with state, grade, causation, addressed; `totals` only within one state, unit, currency. R8 · a part with a newer non-carrying capture or reopened causation is `basis_changed`.

## Uses: actions
The Action object; a member decides every move.
**actionCorrespond({target, direction, at, medium?, party?, artifactSha? | account?, quote..., lifecycle..., viewer, author})**
- R15 · refusals in order: `MACHINE_CANNOT_CORRESPOND`; `NO_TARGET`; `BAD_DIRECTION`; `BAD_DATE`; `CAPTURE_AND_TESTIMONY`; `NEITHER_CAPTURE_NOR_TESTIMONY`; `BAD_SHA`; `NO_RESPONSE_HAS_NO_BYTES`; `BAD_ACCOUNT`, `BAD_MEDIUM`, `BAD_PARTY`; `QUOTE_TEXT_UNWRITABLE`; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION`; `UNREGISTERED_ARTIFACT`; `LEASE_HELD`; `NO_DOCUMENT`; `DUE_CITE_NOT_GOVERNING`; `UNSPLICEABLE_CORRESPONDENCE`; promotion's. R16 · 30-second lease; appends one entry; answer `{ok, target, ord, direction, at, author, recorded_at, held_as, weight: "single"}`. R17 · `responds_to` edge once.
**noSuchAction(actionId, extra?) -> refusal**
- R43 · one answer for absent, invisible, non-action: `{ok: false, reason: "NO_SUCH_ACTION", code, check, translation, action, detail}` (C-117.2); never writes or throws. R45 · `contact`; `CONTACT_NOT_A_MEMBER`. R46 · `plan`, `option`. R47 · `actionCreate`. R49 · no action refused for grade. R51 · audit arm. R44, R48, R50, R52, R54-R60 retired.

## Uses: action-clocks
Deadlines across actions; a machine proposes only.
**clockPropose({target, rule, proposer, viewer})**
- R2 · entry from a profile deadline (`jurisdictions` R26): start from the ledger (`received` counted from `sent` or the recorded receipt), date by `civil-time.evaluateRule`, `trace`; stored apart, never in `clock[]`. Refusals: `NO_AUTHOR`; `NO_TARGET`; absent rule; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION`; `NO_SUCH_RULE` (with `deadlines`). Deadlines from `local-facts.governingView` (R12).
**factReader(localFacts, viewer)**
- R12 · `factOf` in `computeDeadline`'s shape via `factStatus` and `factPath`; unreadable: `absent` with why; null if no `factStatus`; never throws.

## Uses: public-read
Public reads and packaging (R15, R22).

## Uses: strength
Claim worth as a pair (R9).

## Uses: filing-templates
Template library; `FILING_BLANKS` (R28).

## Uses: local-facts
Calendar confirmation (R9, R30).

## Uses: events
Dated happenings, timelines (R33).

## Uses: case-account
Case account; sentence judgment (R34).

## Uses: docket
Entries beside a published case (R9).

## Uses: project-roster
Acts on a project's group (R10, R42).

## Uses: action-grammar
Action vocabularies, `pointOut` (R38, R43).

## Uses: action-holds
Holds and pressure received (R9, R47).

## Uses: case-checker
Pure case checker (R34).

## Uses: case-check
A case checked and held (R9).

## Uses: accepted-work
Accepted findings (R9).

## Uses: case-inputs
Inputs to a next edition (R64).

## Uses: setup-words
Word list (R52).

## Uses: test-support
Test sandbox, ZIP writers (R68).

