# BOB to screens-daily (R085)

**Read** · handled J3

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk on biosmoke8 (K3484) and its diagnosis (K3486, build/rulings.md on tranche/T49) found the check run stuck and Find missing held documents; your entry is part of fix round 3. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Four jobs run at once: agent-worker R93–R94, agent-model R17–R18, agent-harness R11, screens-daily R35. Each new id needs its own explicit test naming it (the coverage check counts any string, and some of these ids are already named by older tests, K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-haiku-5-5. Entry R085-12: screens-daily R35. Find (src/screens-daily/finder.mjs) and the question's "Search here" (answers.mjs) send the member's bare words to `op=search`, which searches the record's own text; a held document's passages are reached only by retrieval's `passage:` arm (retrieval R15), so live a captured file's words were not found. `pothole OR passage:pothole` found all three live. Build the query from the words so both arms are asked, for one word and several, in a form the query language parses (read query-language's grammar for `OR`, grouping and `passage:` before choosing). Your words file and generated `rows.mjs` are untouched.

## B2 · START

Depth 2. Tranche R085: fix round 7 on the 0.85.0 cut (K3550). The journeys walk on biosmoke8 (build/plan/lane-journeys/FINDINGS.md J-2, J-8, J-9, on origin/tranche/T49) found three acts on `find-in` that the server always refuses because the screen sends the wrong body. Entry R085-36: screens-daily R24 (clarified: "against" sends role `cuts_against`, `find-in.mjs` ~62 offers it, ~262 sends it), R36 (`recordpersonfact` needs `valid` {from, to, precision, zone}; `find-in.mjs` ~190–200 never sends it), R37 (`standarddeclare` for a text file's passage, which has no `content_id`, ~221–226; read `standarddeclare`'s accepted body in the standards module before choosing; if findin's result lacks what the act needs, REPORT it and meet the rest). Your requirements file marks the three ids not yet met. Each needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership). Lean: change only what these ids need; the weekly limit is spent and every token is billed at four times (K3549). COMPLETE as soon as green. Known reds on the base, not yours: screens-daily `contract.test.mjs` "R1–R13" (K3543).

Model: claude-haiku-5-5. Workers you spawn: haiku at low effort only, and only if needed.

## B3 · CHANGE

Scope narrowed by Bob (K3551): this round fixes only what the release's focus journey needs. Apply R24 only (the "against" choice sends role `cuts_against`, with its test). Do NOT do R36 or R37: they now read "not yet met: T50" in your requirements (merge tranche/R085 into your branch first). Then COMPLETE.

## B4 · ANSWER · re J2

R36 and R37 are withdrawn from the cut's requirements (tranche/R085 @ 9adaeb4458); T50's N1177 re-adds them. BOB's decision, not Bob's (P17). Merge tranche/R085 into your branch, re-run coverage, then COMPLETE.
