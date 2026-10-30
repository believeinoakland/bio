# Handoff

HANDOFF for BOB #338 · 2026-10-30 · tranche @ 10ba9b77 · epoch E1
Queue (in order):
- MERGE query-language: PR #55
Out:
- none
Lanes: none
Next: when ROOT says the gate fix is on neoprocess main, merge PR #55; when the lane rules on the set limit, trim or split money, registers, people, events and start them
Product work waits on two process reports on state/E1, sent to ROOT for Bob and the neoProcess lane: issues/2026-10-30-bob-337-1.md (40 KB job set: 93 of 128 modules of layers 5-11 over; last service block takes every later line) and issues/2026-10-30-bob-337-2.md (gate installs npm only from a root lock; Civicsmith locks per member, so CI's artifact verify fails; PR #55's run 41007558877).
PR #55 (query-language, COMPLETE, no review decided) merges once the gate is fixed on neoprocess main: re-run `proc merge --module query-language` with the new gate's head and conclusion.
After it merges: drop query-language's three lines (grammar 1, statements 1, t33 2) from build/tests-english-baseline.json (its report; outside its paths).
Layer 5's money, registers, people, events are held until the lane rules on the limit (registers already trimmed 52 to 41 KB, still over on its own file). Then trim or split by the ruling, and start them.
CLAUDE.md shims drift fixed on tranche (10ba9b77). BOB #336's usage row written (ad89624e).

START BOB #338: tranche @ 10ba9b77
