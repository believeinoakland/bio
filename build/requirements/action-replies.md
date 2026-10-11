# action-replies — requirements

**Status** · New at T45 (K2781 (1)): a new product module after `action-clocks`, built fresh (no ids move); its R1–R3 are the L9 (a) draft's `actions` R84, R91 and R96, placed here (reconciliation R2, R15). Not yet met (T45).

**Size (P6).** About 650 lines: the claim-by-claim layout and its proposals, the `arose_from` link and its two reads, the open-requests source for the signing view.

## Public

### Purpose

(T45; N880; Actions D13, D20; v0.2 rules 8, 16) What a reply to the group's action did, and what it set off: a member lays out a reply to a request for comment claim by claim (new evidence, disputed without evidence, not addressed), with the assistant's layout stored apart as a proposal; a member links a matter or project to the response it arose from; and, at signing, each open request for comment on a case is answered once as a line of fact, never a gate. A member does every act; nothing here rates a reply or counts a chain. *(not yet met: T45)*

### Provides

Terms. An **action**, its entries, positions and legs are `actions`' (its Terms). A **response** is a `received` entry of an action (`actions` R15, R83).

**actionReplyBearing({target, ord, claims, author, viewer}), actionBearingPropose({target, ord, claims, proposer, viewer})** (`op=actionreplybearing`, `op=actionbearingpropose`)
- **R1** (T45; N880; S1 §C 7; Actions D13; v0.2 rule 16 "laid out claim by claim") For a `received` entry of a `request_for_comment`, a member lays out the reply claim by claim: `claims` as `action-grammar.bearingFindings` (its R24) shapes them, each `claim` the target of one of the action's `advances` or `rests_on` legs, each `bearing` of `BEARINGS`. Refusals in order, each writing nothing: `MACHINE_CANNOT_RECORD_BEARING` (an empty or machine author); `NO_TARGET`; `NO_SUCH_BUNDLE` (absent and invisible alike, through `actions.actionRead`); `NOT_AN_ACTION`; `BEARING_NOT_RFC` (another kind, or an entry not `received`); `BEARING_REFUSED` (R24's findings), naming the item. A later layout appends; the read `bearingsOf({target, ord?, viewer})` answers the latest per entry with the earlier ones. `actionBearingPropose` stores a proposal apart, labelled (`record-grammar`'s `proposalLabel`), with `BEARING_REFUSED`'s shape check and never changing a layout; any credential may propose, a proposer's restatement replacing its own. Control: one claim per leg with a listed bearing lands; a claim not among the legs is refused. *(not yet met: T45)*

**aroseFromLink({target, ord, arising, author, viewer}), aroseFrom({target, ord, viewer}), arisenFrom({project} | {plan, matter}, viewer)** (`op=arosefrom`)
- **R2** (T45; Actions D20; v0.2 rule 16, §6 `arose_from`; State Rules §5.1) A member records that a matter or project arose from the response at `ord`: `arising` is `{project}` (a project the author sees at `FULL`) or `{plan, matter}` (stored as given and never read here; `action-plans` sets it). Refusals in order, each writing nothing: `MACHINE_CANNOT_LINK`; `NO_TARGET`; `NO_SUCH_BUNDLE`; `NOT_AN_ACTION`; `AROSE_FROM_NOT_A_RESPONSE` (the entry is not `received`); `NO_SUCH_PROJECT` (`membership.noSuchProject`); `AROSE_FROM_LINKED` (the same link stands). Appended, never edited. `aroseFrom` answers what arose from a response, `arisenFrom` the response a project or matter arose from, each withholding whole what the viewer may not see. It is the read `plan-work` R10 uses for its reach (projects linked both ways). It never counts a chain. Control: a link from a `received` entry lands; from a `sent` entry is refused. *(not yet met: T45)*

**The open requests at signing** (T45; N880; Actions D13; v0.2 rule 8; reconciliation R2)
- **R3** (T45; N880; Actions D13; v0.2 rule 8 "each request for comment still open on the case is shown once as one line of fact") At start this module registers once with `case-authoring.registerOpenRequests` (its R70) the source `openRequestsOn({case, members, viewer})`, in R70's names and shape: each `request_for_comment` the viewer may see, not `resolved` or `abandoned`, whose `advances` or `rests_on` legs name a bundle among `members` (the case's findings and inquiries, derived here from `members` itself), as `{whom, asked_at, window_closes, answers}`: `whom` R9's office by role and body as the action names it; `asked_at` its first `sent` entry's date; `window_closes` its clock entry's date as `action-clocks` answers it (null when the action states none); `answers` `{answered, claims}`, `claims` the claims of the latest R1 layout and `answered` those whose bearing is not `not_addressed`, or null with no reply recorded or no layout. It asks no reason, refuses nothing and writes nothing; it throws when it cannot read, so `case-authoring` answers `undetermined`, never `[]`. Control: a resolved request on the case is not answered. *(not yet met: T45)*

## Private

### Uses

- `actions` (L9, earlier): `actionRead`, `actionsFor` (the action, its kind, legs, entries, state; R1–R3).
- `action-clocks` (L9, earlier): the clock entry's date read (its R3; R3's `window_closes`; reconciliation R15: this module sits after it).
- `action-grammar`: `bearingFindings`, `BEARINGS` (its R24, R2; R1); the rows (its R9).
- `case-authoring` (L8): `registerOpenRequests` (its R70; R3).
- `membership`: `sight`, `noSuchProject` (R2).
- `record-core`: `transact`, `stampInstant`, `declarePurge` (R4). `record-grammar`: `isMachineIdentity`, `proposalLabel` (R1).

Every edge points earlier (this module 122). `plan-work` reads R2; `affordances` and the plane compose the ops.

### Invariants

- **R4** (T45; v0.2 rule 1) A machine never records a bearing layout or an `arose_from` link; it may propose a layout (R1). Layouts, proposals and links are this module's tables, append-only, keyed by `bundle_id`, declared to purge (K23). Every read answers an invisible action as an absent one. No place is named in this module's behaviour or outward text. *(not yet met: T45)*

### Satisfies

- `BIO_Action_v0_2.md` §4 rules 1, 8, 16, §6 (`arose_from`) (K2780; T45, N893): replies laid out claim by claim (R1), what arose from a response (R2), open requests shown once at signing (R3); Actions D13, D20; State Rules §5.1 (`arose_from`); S1 §C 7.

### Suggestions

- Rows: R1's, R2's codes (`MACHINE_CANNOT_RECORD_BEARING`, `BEARING_NOT_RFC`, `BEARING_REFUSED`, `MACHINE_CANNOT_LINK`, `AROSE_FROM_NOT_A_RESPONSE`, `AROSE_FROM_LINKED`) take C-117's next numbers in `action-grammar` until this module's own family is BOB's at its START (reconciliation R21).
- The assistant's claim bearings (a proposal through R1) wait for an AI task; none is in T45.
- Tests: each refusal with a control; R3 against `case-authoring` R70's shape (a second registration refused there), with a reply laid out and without.
