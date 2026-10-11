# action-replies (T45)

**Status** · session_01Y4ReYDmZmGL3tSnMbbX2V8 · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Readings I am building on (carrying on meanwhile; none blocks the build):
(a) R3 `window_closes` "as action-clocks answers it": action-clocks has no per-action read (R1/R3 page across actions, R3 only past entries). Reading: the request's window is DEC-13's clock entry, read from the action's own `clock[]` through `actions.actionRead`: the first entry in document order with a calendar date and status not `waived`; null when none. The `action-replies` → `action-clocks` edge is then unused (harmless). Alternative: action-clocks gains a per-action read (its job, not mine).
(b) R3: a request with no `sent` entry was never asked (no `asked_at`): not listed.
(c) R1 proposal label: `record-grammar`'s `PROPOSAL_STATES` has no bearing subject, so `proposalLabel(who, subject)` throws for any subject I could name (L1 is closed). Reading: the state from `record-grammar.lawProposalState` (the one rule `proposalLabel` uses) with this module's own sentence per state, as `actions` labels risk-tier and seeks proposals. Reported as a gap in record-grammar for a later tranche.
(d) R2: an `arising` that is neither `{project}` nor `{plan, matter}` (or a malformed id/text) has no code. Reading: a new row `AROSE_FROM_REFUSED` (C-150.7), asked after `AROSE_FROM_NOT_A_RESPONSE` and before `NO_SUCH_PROJECT`, writing nothing.
(e) Rows: per your START, my six codes are C-150.1–C-150.6 (plus (d)'s C-150.7) in `bio-plane/src/action-replies/checks.mjs`. `action-grammar` R9 still lists them among C-117's next numbers; reading: they are C-150 only and action-grammar holds none of them (please tell ACTION-GRAMMAR if its requirement is to change). `BEARING_REFUSED`'s findings come from `action-grammar.bearingFindings` (R24, code `BEARING_REFUSED`, check C-2.10); my refusal carries row C-150.3 and the findings.
(f) R2 withholding: a `{plan, matter}` link is withheld whole unless the viewer sees the plan bundle (`PLN-`, through the record's gate); the plan and matter are never read. A `{project}` link is withheld unless the viewer sees the project at FULL. `arisenFrom` answers nothing when the viewer cannot see the named project or plan.

## J2 · REPORT

Built (a153c651a5, pushed): R1–R4 on the readings K2845 confirmed. Files (for modules.json): bio-plane/src/action-replies/{index,checks,schema}.mjs; bio-plane/test/m/action-replies/{fixture,bearings,arose,open,ops}.test.mjs (fixture.mjs not a test). Run against a local, uncommitted stand-in for action-grammar R24's bearingFindings/BEARINGS: 16 pass, 0 fail; the four checks clean with my paths entered locally (format 0 failures; architecture 8 files, 0 failures; coverage 4 of 4; ownership pending your paths). On the branch as pushed, my tests cannot load until action-grammar exports bearingFindings and BEARINGS (its T45-25 merge): I wait for that CHANGE (and actions', action-clocks'), then merge, re-run and post COMPLETE.
