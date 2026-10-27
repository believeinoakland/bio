# Dead-end census of T51's build: brief for each reading worker

**Why (Bob, 2026-10-20):** "finding bugs is a good thing. But the process needs to be efficient and bounded and rigorous... I suspect that rigorously walking the real release will also identify not just bugs but whole sections of the discovery, investigation and action processes that don't work. I encourage you to find all those dead-ends that you can before going back to fix everything and redeploying."

**Your job:** for every item in your batch file, decide from the code on `tranche/T51` in /home/user/bio whether a real user (a non-technical member or administrator of a team) can actually do it, end to end, in the product as built today, with no assistant. You read code; you do not run the walk, deploy, commit, push, edit tracked files, or checkout branches. Small read-only node one-liners are fine. Never `node --test` the journey-check walk.

**Bounded:** only the items in your batch file, each judged once. Do not wander into other items.

**How to trace one item (rigorous):** start from what the user sees and follow the path the way a person would:
1. **Entry:** which screen (by its registry id and `bio-plane/src/screens-*/…` file) offers it, and how a person reaches that screen from Home or the rail (a door, a link, a menu) — not only by typing an address.
2. **Control:** the button/field/link that starts it (`data-act`, form), present and enabled in the state the user would be in.
3. **Act:** the op it calls (`op=...`), that the plane declares and implements it (op-declarations, the module that implements it), and what it needs (inputs the screen actually supplies).
4. **Result:** what the op writes or returns, and that a screen draws that result so the person sees it worked.
5. **Next:** the step the use case's `outcome` or the next journey step needs can read that result (the output of one stage is the input of the next: discovery → capture → reading/extraction → analysis → finding → case → publication → action).
Read each function on the path in full (not a grep hit alone). Cite file:line for each link.

**Verdicts (one per item):**
- `WORKS`: every link 1–5 exists.
- `DEAD END`: a link is missing: no way in, a control that does nothing or is never drawn, an op the screen calls that is not declared/implemented, an op that always refuses in a normal team's state, a result no screen shows, or a result the next stage cannot use. Name the first broken link and every later one you can see.
- `PARTIAL`: it completes, but a part of the stated goal/outcome cannot be done (name which part).
- `HELD`: it needs something Bob has ruled out of T51 (the assistant/any AI, K3717, N1220; API keys N1105; email capture N824; Translation K3190; stewards' address K2799; template texts N858; the directory N1110). For these, check only that the screen says honestly it is not available (no dead control, no error, no blank) — a dishonest or broken not-ready state is a DEAD END.
- `UNSURE`: say exactly what you could not determine.

**Context you may read:** `build/modules.json` (who owns which file), `build/requirements/<module>.md` (what a module must do), the design's screen registry under `docs/development/ux-substrate/screens/`, the word table `bio-plane/src/setup-words/rows.mjs` (to read what a key says). The plan's "Left out" table is `build/plan/current.md` (section "Left out of T51").

**Output file** (your batch's name, in the census folder): one markdown table, one row per item: `id | name | verdict | first broken link (1–5) | evidence (file:line) | cause in one line | owning module`. Then a section "Shared causes": causes that break several items (one op missing breaks five cases), each with the item ids. Then counts per verdict. **Final message:** the counts, then every DEAD END and PARTIAL row (id, first broken link, cause, module), and the shared causes, in under 500 words.
