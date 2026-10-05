# Synthesis protocol, phase 4 of the second study (BOB #112, 2026-10-05; adapted from BOB #111's)

You join the three construct studies and the integration study, corrected by their reviews, into one answer for Bob, the product owner, and into the amendments the first study's architecture needs. BOB reviews your draft against the studies and renders it for Bob; write for that reader: plain words, every claim traceable to a study, review or source.

## Read first, whole (READING-PROTOCOL.md's method: consecutive chunks to the end, no scanning)
1. `constructs-brief.md`.
2. `reviews/R-*.md`, all of them, first: they say where each study is wrong.
3. `studies/PEOPLE.md`, `studies/EVENTS.md`, `studies/MONEY.md`, `studies/INTEGRATION.md`, whole. Not the `.work` files, except to settle a point a review disputes.
4. `../synthesis/constructs.md` whole (the first study's synthesis, with §5A and §5B), and `src/BIO_Capability_Ladders_v0_1.txt` whole (its §5A–§5C are provisional drafts, K1459; your text replaces them).
Go to a primary source only where a study and its review disagree and your text depends on which is right; say which you opened.

## Rules
- **A review's correction wins** over its study unless you verify otherwise (say so, cited).
- **P17.** Bob decides only policy and doctrine, the meaning of requirements, and UX (layers and product modules are delegated to BOB, K1437, and stated as decided). Put to him only those, each with the question in plain words (what situation, what is at stake), options, a recommendation and why. Everything lower-level is stated as decided. Merge duplicates.
- **K1425.** No tranche is open or planned. Describe stages and what each unlocks, never a tranche plan or dates.
- **Bob's rulings are premises** (brief). The first study's open decisions (B12, B16 (i)–(ii), B17 (ii), B18, B21, B22) are not re-decided; say where this study bears on them.
- **Taken words** (brief), "action" included.

## Write `synthesis/constructs-2.md`, in exactly these sections
1. **The answer in one page.** Bob's three statements; for each construct, where it stands today and what it needs; how the three change the six; the decisions he is asked for, by number (C1, C2, …, so they do not clash with the first study's B numbers).
2. **Per construct** (PEOPLE, EVENTS, MONEY): the anticipated work (core needs, a member's example each); the ladder L0–L5 (one line each); where the system stands, built and reachable today, separately; the architecture (objects, modules extended or new, layer, uses); stages, each with what it unlocks; the reviews' corrections taken in.
3. **What changes in the six.** Per construct (TIME, ORGANISATIONS, LAW, COURTS, ANALYSIS, QUESTIONS): needs added, rungs changed, design changed, with the reason.
4. **The architecture across all nine.** The total order with every new, widened, merged or moved module, checked against `uses`; the shared models and where each lives; what the AI proposes and the member decides.
5. **One staged path across all nine.** Stages in dependency order, each naming its modules, rough size, what it unlocks, and what must be measured first.
6. **Decisions for Bob** (C1, C2, …).
7. **Decided at BOB's level.** One line each.
8. **Amendments to the capability ladders.** Section by section, precise enough for BOB to apply: what replaces §5A–§5C, and every change elsewhere.
9. **Risks and open points.**
10. **Sources.**

Aim for 400–600 lines: dense, no repetition (refer back instead).

**Checkpoint.** Keep `synthesis/constructs-2.md.work`, saved after each step; write the output section by section. If either exists when you start, you are resuming.
Read-only: never edit, commit or push in /home/user/bio or /home/user/civicos-process. Return a 20-line summary. If your file write is refused, return the full text instead.
