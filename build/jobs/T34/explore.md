# explore (T34)

**Status** · session_01GwJdLNiEcK1ZBdPfzmRXHC · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

R19: which of a derivation's `inputs` "name a hop". Real owners' inputs are mostly not hops: duties' `met_by` names `[duty_id, event_id, occurrence_key]` (the ends and a free-text key); connections' `mentioned_together` names objects `{entity}`, `{end, capture, ref}`. A hunch hop's id is a `HYP-` record id. If every input not read at the ends were "undetermined", no `met_by` connection could ever re-derive (its occurrence key is no connection), and hypotheses R6 would refuse every leg on one.

My reading, which I am building on: an input is
- one of the derivation's own two ends → the end, not a hop (`hop: false`);
- an object without `connection` or `id` (`{entity}`, `{end, capture}`, `{source}`) → a cited record, not a hop;
- `{connection}`/`{id}`, or a string that is a record id (`record-grammar`) or a derived id (64 hex) → it names a hop: read among the connections at the two ends with `scope`; found → reported with its class (a hunch as a hunch, R6); not read → `undetermined` with one reason that is the same whether it does not exist, is withheld or is a hunch outside scope (R7), forcing `matches: false, undetermined: true`;
- any other string (an occurrence key) → a value the method names, not a hop.
`scope` malformed (not `{inquiry}`) is refused `BAD_SCOPE`, as `explore` already does.
Hypotheses does not yet pass `scope` to `rederive` (its T34 job's share, not mine). Nothing here waits on the answer.
