# escalation — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30. Not in the design's `deltas.md`: both additions are consequences of it, found at the fold. `actions` R8 as amended says an overridden breach action "is never attachable to an escalation", which is this module's refusal to make and test (the design's own test for it, "attaching it to an escalation refuses", sits under `actions`); and `action-plans` R6 and R15 read "each determined subject's escalation", which needs a read by determination this module does not offer (`escalationRead` takes an escalation id). Against `build/requirements/escalation.md` on `tranche/T17` (highest id R21). Ids final: **R22**, **R23**. The Status line gains: "Action layer folded 2026-09-30 (K608): R16 widened; R22, R23 added, not yet met."

## Replacement

**R16** — current line:

> - **R16** Lists every open escalation with at least one proposed edge not advanced or declined since its trigger was met, with the edge, the trigger's instant and its age, oldest first, at most 500 (`truncated` stated). This is what `monitoring` notifies on.

becomes:

> - **R16** Lists every open escalation with at least one proposed edge not advanced or declined since its trigger was met, with the edge, the trigger's instant and its age, the escalation's project and the member who opened it, oldest first, at most 500 (`truncated` stated). This is what `monitoring` asks and `queue-producers` (its R17) notifies on.

(Two fields added to a provided service's answer without a change of meaning: BOB's, K569.)

## Additions

- **R22** `escalationsFor({determination, viewer})` answers every escalation of that determination the viewer may see, oldest first, each with its id, state and stage (at most one is open or suspended, R1's `ALREADY_OPEN`); an absent or invisible determination answers `NO_SUCH_DETERMINATION` (`conformance.noSuchDetermination`), and a determination with none answers `items: []`. Writes nothing. *(not yet met: new; `action-plans` R6, R15)*
- **R23** R9 refuses an action carrying a `premise_override` (`actions` R8) `ACTION_PREMISE_OVERRIDDEN`, after `NO_SUCH_ACTION` and before `NOT_A_BREACH_ACTION`: an escalation pursues a determined breach only (K600 (a)). *(not yet met: new)*

## Satisfies (add)

> - `BIO_Action_v0_1.md` §3 (escalation), §4 rule 2, §5 rows 2, 3, 11 and 16.
