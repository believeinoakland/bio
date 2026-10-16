# BOB to screens-daily (R085)

**Read** · handled J1

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk on biosmoke8 (K3484) and its diagnosis (K3486, build/rulings.md on tranche/T49) found the check run stuck and Find missing held documents; your entry is part of fix round 3. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Four jobs run at once: agent-worker R93–R94, agent-model R17–R18, agent-harness R11, screens-daily R35. Each new id needs its own explicit test naming it (the coverage check counts any string, and some of these ids are already named by older tests, K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-haiku-5-5. Entry R085-12: screens-daily R35. Find (src/screens-daily/finder.mjs) and the question's "Search here" (answers.mjs) send the member's bare words to `op=search`, which searches the record's own text; a held document's passages are reached only by retrieval's `passage:` arm (retrieval R15), so live a captured file's words were not found. `pothole OR passage:pothole` found all three live. Build the query from the words so both arms are asked, for one word and several, in a form the query language parses (read query-language's grammar for `OR`, grouping and `passage:` before choosing). Your words file and generated `rows.mjs` are untouched.
