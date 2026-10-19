# screens-action (T51)

**Status** · session_01694DjkFk3Xc4UJ3gbq7ezF · depth 2 · WORKING · handled B0

## J1 · REPORT

REPORT (start): read and merged tranche/T51 @ fe5d5656fb; baseline in my module is the 2 reds you named (contract.test.mjs:34, :142). Findings before I build R24–R35:
1. Providers my parts need that are not on the tranche yet: `cs.readonly` (interface-shell R94), `cs.strip`/`cs.reading` (R44, the kit has neither) and the op `holdsdue` (op-declarations R78, T51-107; `hold` R32 reads it). I build against those contracts and run their tests once those modules merge; tell me when interface-shell and op-declarations are in (I then merge tranche/T51).
2. Everything else the drawings need exists (registry rows and words for actionnew, dash-action, hold, holdnotice, counsel; ops actioninquiry, writinghelp, procedureguides, templatesforaction, projectholds, pressurerecord, actionhold, holdnoticeprepare/sent, counselpacket are declared).
3. Gaps already named in the requirements (R24, R30, R32–R34, fold-DEC-340 gaps 1) stay REPORTs at COMPLETE with the exact keys; I draw nothing the design does not draw.
4. Scope is large (about five new screens, the plan's list, the kinds, the dashboard). I work in stages, commit each, and will post BLOCKED (context) at half my window with the next step in my record.
