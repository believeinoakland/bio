# control-plane (T28)

**Status** · session_01NE62TdrMXNdMYfJdn16std · depth 2 · WORKING · handled B2

## J1 · QUESTION

R43 as amended asks two things that cannot both hold today: docket's family read at its module-order place (directly after publication), and every code keeping the row it had. Docket's own code `MACHINE_CANNOT_MARK_DOCKET_PRESSURE` is merged (N526), but docket's family still shares two more codes with action-grammar: `PRESSURE_MARKED` (docket C-129.12, action-grammar C-117.17) and `PRESSURE_REFUSED` (C-129.13, C-117.15). The composition gives a code to the first source that holds it. So moving docket before action-grammar re-rows both codes from C-117.17/.15 to C-129.12/.13. I measured this: `catalogue-end.test.mjs` (R43) reports exactly those two codes changed, beside the expected C-92.4, C-92.5 and C-92.10 re-words.

Best reading (applied, so my work goes on): R43's invariant wins. Docket stays read after action-grammar, the comment at `families.mjs` now names the two shared codes instead of the stale K1280 one, and R43's docket clause stays not met, carried with N526. The move is a one-line change once docket has its own codes for the two (a docket CHANGE, not mine). Alternative: move docket now and re-pin the two codes to docket's rows. That changes what `actionpressure`'s two refusals are decorated with and what `dec49Row` answers, which R43's last sentence forbids, so it needs your word.

Not affected: accepted-work's C-21.4/.5 and case-import's C-130 are added at their module-order places (no shared codes); case-checker holds no family, so it has no entry and no edge.
