# filings — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30, from `build/plan/action-design/deltas.md` §2–§3 and `tests.md` (K590, K597, K600, K608), against `build/requirements/filings.md` on `tranche/T17` (highest id R21). Ids final: the draft's R22–R24 are free and kept; **R25** is new here, carrying the display half of the draft's `actions` R48 (the venue's standard of evidence), which is this module's to test (the draft's own test is a filing's). The Status line gains: "Action layer folded 2026-09-30 (K608): R3, R8 amended; R22–R25 added, not yet met."

## Replacements

**R3** — in the current line, the clause

> Blanks are filled from: the counterparty's office (`role`, `body`);

becomes

> Blanks are filled from: the action's addressee (`actions` R9: `role` and `body` for an office, `role` and `organisation` for a reporter, organisation or group, `description` for an audience; a blank the addressee's arm does not hold is left unfilled with why);

(the rest of R3 unchanged).

**R8** — in the current line, the clause

> `NO_DETERMINATION` (the action rests on no live determination, `actions` R8).

becomes

> `NO_DETERMINATION` (the action rests on no live determination, `actions` R8, and states no `premise_override`; a packet for an overridden action is assembled with R24's disclosure and its facts section says in words that no determination is held).

*Why:* K600 (a) says the override's disclosure is carried "on every filing, packet and communication prepared from it", so a packet must be preparable for an overridden Tier 3 action; the current R8 refuses it. Recorded as a wording consequence of K600, not a new meaning.

## Additions

- **R22** (Publication §3 rule 9; BOB) Every filing draft's approved bytes (R6), every counsel-packet export (R11) and every communication's approved bytes (R23) carry `publication.inbandQuartet` (its R16) in-band: its hash over the bytes, the date, the author and both threshold floors. A draft not yet approved carries none. *(not yet met: found by ACTION_DESIGN #1; confirmed 2026-09-30: nothing under `bio-plane/src/filings/` calls `inbandQuartet`)*
- **R23** (D2, K590) `communicationPrepare({action, text, purpose, preparer, viewer})` (`op=communicationprepare`): a draft message, briefing or statement for an action whose addressee is anyone (`actions` R9), stored apart and labelled as R5's drafts are (`proposalLabel(preparer, "communication")`), answered with `evidence: false`; any credential may prepare, a machine from the published case and the plan; no template is read. Refusals: `COMMUNICATION_NO_PREPARER`; `NO_SUCH_ACTION` (`actions.noSuchAction`); `ACTION_CLOSED`; `COMMUNICATION_TEXT_REFUSED` (empty, over the length bound, or not UTF-8 text); `COMMUNICATION_PURPOSE_REFUSED` (empty or over 500 characters). `filingApprove` (R6) and `filingRecordSent` (R7) apply to it unchanged: a member approves it, sends it by their own hand, and the sending is recorded with the bytes sent. Nothing is transmitted by the instance (R7); `filingsFor` (R13) lists it among the drafts, marked a communication. *(not yet met: new)*
- **R24** (K600 (a)) A filing draft, counsel packet or communication prepared from an action carrying a `premise_override` (`actions` R8) carries, first on its face and in every export, "Rests on an unestablished premise:" with the override's reason, author and time. One prepared from an action without one carries none. *(not yet met: new)*
- **R25** (K597 (3), K600 (b): the venue sets the standard) No draft, packet or communication is refused for the capture grade of what it rests on. Every filing draft and counsel packet shows, for each exhibit, its capture grade and whether it is co-attested (`provenance`); where the kind's profile entry states `evidence` (`jurisdictions` R39), it shows the venue's standard beside the grades, and flags an exhibit below the grades the venue `accepts`, or at a grade the profile marks `contestable`, so counsel and members can prepare. Where the profile states none, the venue's standard reads undetermined and the grades are shown alone. *(not yet met: new)*

## Uses

No new edge: `publication` (R22's `inbandQuartet`), `provenance` (R25's grades) and `jurisdictions` (R25's `evidence`) are in its uses. The Uses line for `publication` gains "`inbandQuartet` (its R16; R22)"; `legacy-checks`' `proposalLabel` gains the subject `communication` (the head-of-layer `legacy-checks` job).

## Satisfies (add)

> - `BIO_Action_v0_1.md` §3 (filing and communication), §4 rules 2, 7, 12 and 13.
