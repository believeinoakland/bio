# filings — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). N72 and the layer-9 maps' review folded 2026-09-27 (K171): R9's holiday calendar and `provenance.attestationsOf`, R5 and R14's `proposalLabel`, R21 `availableActions` (R15's block as a service); no meaning changed. DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code and the canon, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 9 (Action). A new module: no `from`, nothing moves. Code today (measured on `tranche/T3` @ `edbd39b`): **nothing prepares a filing, a template or a counsel packet.** `grep` for a template, an evidence package or counsel over `store.mjs`, `index.mjs`, `deliverer.mjs` and `container.mjs` finds only the tier words (`RISK_TIERS`, `bio-checks.mjs` 538). What it reads already exists or is drafted: the action (`actions`), the profile's action kinds with tier, venue and template and its deadlines (`jurisdictions` R25–R26, R28's `TEMPLATE_TIER3`), a determination (`conformance`), standards (`standards`), the breach consequences (`consequences`), captures and their attestation (`provenance`). Every requirement is *(not yet met: new module)*. Bob's ruling K13 (Design Requirement 8 as amended) is R8–R12. No old-plan row is carried to `filings`; no check in `bio-checks.mjs` belongs to it.

**Size (P6).** New. Estimated 900–1,300 lines of code with its tables; one session reads it with the public parts of its uses.

## Public

### Purpose

What the group sends, prepared from the record. For an action whose governing tier is 1 or 2, a filing pre-filled from the record into the profile's template for its kind, every filled blank naming its source, a Tier 2 filing carrying its advisory note. For Tier 3, a **counsel packet** for counsel the group names: the facts with their citations, a chronology, exhibits with provenance, the standards' text, candidate legal theories and remedies, and any deadline that binds a claim, marked as prepared for counsel's review, never published, never in a form that can be filed as it stands. Counsel drafts and files. The AI prepares; a member approves and files, and records that it was sent. Kinds, templates and venues come from the jurisdiction profile.

### Provides

Terms. The **governing tier** of an action is the stricter (higher) of its kind's tier in the profile (`jurisdictions` R25) and the action's risk tier (`actions` R25); it is `undetermined` when the action's tier is undetermined, and the action's tier alone when the profile gives the kind none (stated so). A **blank** is a named gap in a template; a **filled blank** is `{name, value, source}`, `source` the record id (action, determination, finding edition, standard, content, capture, profile entry) the value is read from. A refusal is `{ok: false, reason, ...}`.

**filingPrepare({action, preparer, viewer}) → `{ok: true, id, tier, text, blanks, unfilled, advisory?, venue, label}` or refusal**
- **R1** Refusals in order: `FILING_NO_PREPARER` (no stamped preparer; K254); `NO_SUCH_ACTION` (absent, invisible or not an action, one answer); `ACTION_CLOSED` (the action is `resolved` or `abandoned`); `FILING_TIER_UNDETERMINED` (R2); `TIER3_COUNSEL_PACKET` (governing tier 3: no filing is prepared, R8 is the route); `KIND_NO_TEMPLATE` (the profile's view holds no template for the kind, or withholds it as a conflict, `jurisdictions` R27, R29). *(not yet met: new module)*
- **R2** A filing is prepared only for a governing tier of 1 or 2. An undetermined action tier is refused, never read as 1 (D-182): a member states the tier first (`actions` R23). The stricter of the two tiers governs (K102): a Tier 3 kind is never templated even if a member marks the action 1, and a member may raise a Tier 1 kind to 3 and get a counsel packet (R8). *(not yet met: new module; K102)*
- **R3** Every blank of the template is filled from the record, or left in the text as a visible `[UNFILLED: <name>]` marker and listed in `unfilled` with why (the record holds no value; the value is undetermined; the viewer may not see its source). A value is never invented, defaulted or taken from the preparer. Blanks are filled from: the counterparty's office (`role`, `body`); the action's determination (the act, its date, the standards' citations, each finding's published edition); the action's governing laws and its `law`; its clock entries with their bases; the venue (`venue.name`, `venue.how`); the producing group; the preparation date. *(not yet met: new module)*
- **R4** A Tier 2 filing carries the profile's advisory note recommending legal review before filing, first in the text and as `advisory` in the answer; a Tier 1 filing carries none (Design Requirement 8). *(not yet met: new module)*
- **R5** Any credential may prepare. The draft is stored apart from the action, labelled with its preparer and whether it is machine work (`legacy-checks`' `proposalLabel(preparer, "filing_draft")`: `lawProposalState`'s three states, K171), answered with `evidence: false` and a sentence saying it is a draft nobody has approved or sent. Preparing again makes a new draft; drafts are never edited. *(not yet met: new module)*

**filingApprove({filing, text?, author, viewer}) → `{ok: true, filing, approved_by, at, sha}`**
- **R6** Refusals in order: `MACHINE_CANNOT_APPROVE` (an empty or machine author); `NO_SUCH_FILING` (absent or invisible, one answer); `FILING_STALE` (since the draft: the action's tier, counterparty, determination or governing laws changed, or its determination was superseded; it names what changed); `STILL_UNFILLED` (the approved text still holds an `[UNFILLED: …]` marker); `TEXT_UNWRITABLE` (over the length bound, or not UTF-8 text). A member may approve the draft's text or an edited text; the approved text is the member's, recorded with who, when and its SHA-256, and a filing is approved at most once (`ALREADY_APPROVED`). *(not yet met: new module)*

**filingRecordSent({filing, at, medium, artifactSha? | account?, author, viewer}) → `{ok: true, filing, action, ord, proposed}`**
- **R7** Refusals: `MACHINE_CANNOT_FILE`; `NO_SUCH_FILING`; `NOT_APPROVED`; `ALREADY_SENT`; then `actions.actionCorrespond`'s refusals. It records the sending as one `sent` entry on the action (`actions` R15–R16), held as the capture of the bytes sent or the member's account, and links the entry and the filing both ways. It moves no action state and writes no clock entry: `proposed` carries the next state a member may choose and the clock entries `actions.clockPropose` offers for the kind's deadlines that start at filing or receipt. The instance transmits nothing: a member files by the venue's means (K102). *(not yet met: new module)*

**counselPacket({action, counsel, author, viewer}) → `{ok: true, id, version, sections, marking, fileable: false}` or refusal**
- **R8** Refusals in order: `MACHINE_CANNOT_NAME_COUNSEL` (a machine or empty author: the group names its counsel); `NO_SUCH_ACTION`; `NOT_TIER3` (the governing tier is not 3); `NO_COUNSEL` (`counsel` lacks a name or an organisation; contact is optional); `NO_DETERMINATION` (the action rests on no live determination, `actions` R8). *(not yet met: new module, K13)*
- **R9** The packet holds six sections, each item naming its record source: **facts** (each finding the determination rests on, with its published edition, its claim and its citations); **chronology** (every dated event from the act, the findings' publication, the action's state history, correspondence and clock, in date order, same-day ties by source id); **exhibits** (each capture a fact or event cites, with its SHA-256, locator, capture time and attestations, from `provenance`, the attestations by its `attestationsOf(captureSha)`, never by parsing the bundle document; K171); **standards** (each standard's citation, kind, issuer, text content ids and in-force answer at the act's date, `standards` R5, R7); **candidate theories and remedies** (each labelled as a candidate with who proposed it and whether it is machine work; never stated as a conclusion; the section says in words when it is empty); **deadlines** (every profile deadline that applies to `claim`, `jurisdictions` R26, with its period, count, start event and citation; its date computed only from a recorded start event and the rule's `count`, `calendar` or `business` on the profile's holiday calendar (`jurisdictions` R33), else `undetermined` with why, including a count reaching into a year the calendar does not list; K108 (5), N72). The breach consequences (`consequences.consequencesOf`) are included as recorded, states kept apart. *(not yet met: new module, K13)*
- **R10** Every section, the packet's head and every export carry the marking "Prepared for review by <counsel's name, organisation>. Not legal advice. Not for filing." The packet holds no caption, court or venue heading, signature block, prayer or form of relief, and nothing from any kind's template; `fileable` is `false`. *(not yet met: new module, K13)*
- **R11** The packet is never published: it is not a bundle, has no path to `publication`, and is read only by a member who may see the action (`counselPacketRead`, `NO_SUCH_PACKET` otherwise). `counselPacketExport({id, version, author})` hands a member the packet's bytes and records who exported which version, when and for which counsel; a machine is refused `MACHINE_CANNOT_EXPORT`. *(not yet met: new module, K13)*
- **R12** Assembling again makes a new version; earlier versions stay readable. A version is flagged `basis_changed`, naming each cause, when the determination it drew on is superseded or flagged (`conformance` R10), a finding is published in a later edition, or a standard is superseded; nothing in it changes. *(not yet met: new module)*

**filingsFor({action, viewer}) → `{drafts, packets}`**
- **R13** Lists the action's drafts (each with its tier, label, approval and sending), and its counsel packets (each version with its counsel, `basis_changed` and exports), in creation order; `NO_SUCH_ACTION` for an absent or invisible action. It is the read `escalation` uses. *(not yet met: new module)*

**Candidate theories: theoryPropose({packet | action, theory, remedy?, standards, why, proposer, viewer})**
- **R14** Any credential may propose a candidate theory and remedy against named standards, stored apart, labelled (`proposalLabel(proposer, "theory")`, K171), with a `why` of at most 1,000 characters; `NO_STANDARDS` when none is named, `NO_SUCH_STANDARD` naming one (standards' own refusal, passed through), `THEORY_STANDARD_UNREADABLE` while standards cannot be read, and `THEORY_NO_PROPOSER` for no stamped proposer (K254). It is included in the next packet version (R9) as a candidate, never as the group's position. *(not yet met: new module)*

**The evidence package's available-actions block (registered with `publication`, the K31 pattern)**
- **R15** For a published case whose finding a live determination rests on, the block lists the kinds available against its counterparty's offices from the profile, each with its tier and words; for Tier 3 kinds, the standards the theories rest on, the factual basis (the determination's findings) and the sentence that such an action requires competent counsel; and for every kind, the risk classification in the package's metadata. For Tier 3 kinds it also lists the profile's legal organisations equipped to evaluate them, with their contacts (`jurisdictions` R32), or says the profile names none. It never includes a Tier 3 template or any counsel packet content. The evidence package is `publication`'s published case edition; this module supplies only this block, through the registration `publication` offers (its R36), composed by R21. *(not yet met: new module; K102)*

**availableActions({determination, viewer}) → the block of R15, or refusal**
- **R21** Answers R15's block for a live determination's counterparty offices, from the same composer R15's registration calls, so `escalation` (its R8) reads the available actions without reading a published case. `NO_SUCH_DETERMINATION` for an absent or invisible one, one answer (conformance's own refusal, passed through), and `DETERMINATION_UNREADABLE` while conformance cannot be read (K254). *(not yet met: new module; K171)*

## Private

### Uses

- `jurisdictions`: `combine`'s view: `action_kinds` (tier, venue, template, laws, `advisory`), `counterparties`, `deadlines`, `records_laws`, `legal_organisations`, `holidays` (R25, R32, R33: not yet met there, built by the `jurisdictions` job before layer 9, K171).
- `record-core`: `allocId`, `transact`, `stampInstant`, `getSetting` (the active profiles), `declarePurge`.
- `membership`: `viewerPredicate`; `legacy-checks`: `isMachineIdentity`, `proposalLabel` (added by the head-of-layer `legacy-checks` job, K171).
- `provenance`: the capture's digest, locator and time, and `attestationsOf(captureSha)` (R9's exhibits; to be stated in provenance's requirements before layer 9, K171); capture of the approved bytes (R7).
- `content`: the passages facts and exhibits cite. *(not declared)*
- `publication`: a finding's published edition (R3, R9); the evidence-package registration it offers (R15).
- `standards`: `standardRead`, `inForce` (R3, R9).
- `conformance`: `determinationRead` (R3, R8, R9, R12). *(not declared)*
- `actions`: `actionRead`, `actionCorrespond`, `clockPropose`.
- `consequences`: `consequencesOf` (R9).

### Invariants

- **R16** Nothing a machine writes approves, sends, names counsel or exports; a machine prepares drafts, packets' candidate theories and proposals only, each labelled (Design Requirement 12; DEC-24). *(not yet met: new module)*
- **R17** A Tier 3 governing tier never yields a template, a pre-filled filing or a fileable document (Design Requirement 8 as amended; `jurisdictions` R28's `TEMPLATE_TIER3`). *(not yet met: new module)*
- **R18** Every filled value, packet item and chronology event names the record source it was read from; nothing is invented or defaulted, and an undetermined fact is stated as undetermined. *(not yet met: new module)*
- **R19** Drafts, approvals, sendings, packets, exports and proposals are append-only, keyed to the action, declared to purge (K23); every read answers an action the viewer may not see as absent. *(not yet met: new module)*
- **R20** No place, law, venue, template or legal organisation is named in this module's behaviour or outward text; all come from the profile, and the tests include the test profile. *(not yet met: new module)*

### Satisfies

- `BIO_Design_Requirements_v2.md` §8 as amended 2026-09-26 (evidence separated from legal strategy; three tiers; the counsel packet) and §12 (tools are advisory).
- `BIO_Functional_Architecture_v3.md` Layer 3, Function 3 (Tier 1 and 2 templates pre-populated; Tier 3 directed to counsel) and Function 4 (communicate with the city).
- `BIO_Complete_Roadmap_v5.md` §8 (evidence package design and risk tiering) and §9, Skill 8.
- `BIO_Publication_v0_1.md` §8 (evidence packages classified by tier).
- `build/layers.md`, layer 9 (the `filings` row and the contract); K13.

### Suggestions

- Id prefixes `FIL-` (a draft and its approval and sending) and `CPK-` (a packet, versioned). Tables `filing_drafts`, `filing_approvals`, `filing_sendings`, `counsel_packets`, `counsel_packet_exports`, `theory_proposals`.
- The packet's bytes: one Markdown document with a manifest of the exhibits' digests, or a container through `publication`'s packaging code (`container.mjs`) if its format fits; the marking goes in each file.
- The template grammar: named blanks as `{{name}}`, the names a closed set this module publishes; the profile's template text is data (`jurisdictions` R25).
- Sending by the instance (email or a portal) is not in this version: it would come later as a member's act through `publication`'s delivery, and is Bob's to add (K102).
- The advisory note text for Tier 2 is the profile's, on the kind beside the template (`jurisdictions` R25's `advisory`, K102), not in code; absent, the answer says the note is undetermined and the filing is still refused approval until a member writes one in (`STILL_UNFILLED` covers it).
- Tests: every refusal with a negative control; R3 with a template whose blanks the record can and cannot fill; R10 by searching the packet's bytes for the kind's template text and for a caption; R11 by trying every publication path with a packet id.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for rulings)

- `filings`' uses gain `legacy-checks`, `provenance`, `content` and `conformance`.
- A filing is stored apart from the action until a member records it sent; then it is one `sent` correspondence entry on the action (`actions` R15), and the action's state moves only by a member's `actionMove`.
- Counsel is named by organisation and name by a member; counsel is not a member of the instance and reads only what a member exports (R11).
- A packet's deadline dates follow `actions` R32's rule (recorded start events only; business days counted on the profile's holiday calendar, `jurisdictions` R33; K108 (5), K171).
