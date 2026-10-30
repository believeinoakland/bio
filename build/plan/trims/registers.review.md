# registers — review of the rewrite against the original

Both texts read whole. Uses, Satisfies, Suggestions and every cited ruling id match. Five gaps.

1. **R2**: `none` is narrowed, so one case is left without a value.
   - Original: "`watched` is `auto` (... `autoWatchable` ... and a watch is running), `by_act` (...) or `none`". Here `none` covers every other case.
   - Rewrite: "or `none` (no interest, including a pre-read with none)".
   - The gap: an interest that is `autoWatchable` but has no watch running (for example saved with `watch: false`) is not `auto` and not `by_act`. The original makes it `none`. The rewrite gives it no value.
   - Restore: "or `none` (otherwise, including no interest and a pre-read with none)".

2. **R26**: "anywhere" is dropped, so the ban covers only the places listed.
   - Original: "No query text, criterion, count or result, and no member id against one, is written anywhere: not to a table, the observation log, a tally, an error, a log line or a response header."
   - Rewrite: "... is written to a table, observation log, tally, error, log line or response header".
   - Restore: "... is written anywhere (a table, observation log, tally, error, log line, response header included)".

3. **R27**: the ban on sending is narrowed from the whole module to its ops.
   - Original: "Nothing in the module sends a row to a recipient."
   - Rewrite: "no op returns rows as a file or unbounded list or sends a row to a recipient".
   - Restore: "...; nothing in the module sends a row to a recipient."

4. **R37**: narrowed from the whole module to its ops, in the same way.
   - Original: "Nothing in this module resolves a name to an entity, proposes a match or creates a link".
   - Rewrite: "No op resolves a name to an entity, proposes a match or creates a link (entity, link tables unchanged)".
   - Restore: "Nothing in this module resolves a name to an entity, proposes a match or creates a link (entity and link tables unchanged by any op)".

5. **R1**: the source of the read is now ambiguous.
   - Original: "reads the profile and this module's tables".
   - Rewrite: "reads the profile and own tables".
   - The gap: in R1, `own` is the field for the team's own definitions, so "own tables" can be read as only those tables.
   - Restore: "reads the profile and this module's tables".

Checked and not gaps:
- R25 "no `absence`; nor with matches" keeps the original's control, which says a complete search with matches carries no `absence`. It is terse. If it should be explicit: "a complete search with matches carries no `absence`".
- R23 drops the test's "nothing written past the pause". The rule's "nothing is partly written", together with the pause before writing, still carries it.
