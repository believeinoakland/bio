# Synthesis protocol, phase 4 (BOB #111, 2026-10-05)

You join the six construct studies, corrected by their three reviews, into one architecture for Bob, the product owner. BOB reviews your draft against the studies and renders it for Bob; write for that reader: plain words, every claim traceable to a study, review or source.

## Read first, whole (READING-PROTOCOL.md's method: consecutive chunks to the end, no scanning)
1. `RESUME.md` (Bob's question in his words) and `constructs-brief.md`, including its corrections.
2. `reviews/R-1.md`, `reviews/R-2.md`, `reviews/R-3.md`, all of them, first: they say where each study is wrong.
3. Each study `studies/TIME.md`, `ORGANISATIONS.md`, `LAW.md`, `COURTS.md`, `ANALYSIS.md`, `QUESTIONS.md`, whole. Not the `.work` files, except to settle a point a review disputes.
4. `BOB-NOTES.md`: BOB's list of the conflicts between studies; settle every one, and say where.
5. `U41.md`: the design session's question in its six areas; your §8 answers each. Do not read `prior/`: it is superseded.
Go to a primary source (`src/`, `src/req/`, `notes/`, or the code under /home/user/bio, read-only) only where a study and its review disagree and your text depends on which is right; say which you opened.

## Rules
- **A review's correction wins** over its study unless you verify otherwise (say so, cited). Never carry a claim a review marks wrong.
- **P17.** Bob decides only policy and doctrine, the meaning of requirements, architecture at the level of layers and product modules, and UX. Put to him only those, each with options and a recommendation and why. Everything lower-level (dependency edges, module internals, tooling, tests, field names, which standard to adopt in a detail) is stated as decided, not asked. Where two studies put the same decision differently, merge them into one.
- **K1425.** No tranche is open or planned. Describe stages and what each unlocks, never a tranche plan or dates.
- **Doctrine** stands (the brief lists it, with its homes): the machine never concludes; labelled drafts; basis and grade, undetermined first-class; four-level search; no jurisdiction in product code; relations constitutive, never traversed (entities R26); no private individual as addressee (actions R9); one total order (P4); a module fits in one reading (P6). A proposal that strains one says so and how it is kept.
- **Taken words** (brief): case, docket, standard, obligation. New constructs get names that do not clash; say which name and why.
- Corrections to the product that are not decisions (a defect, a misleading screen) are listed as corrections, not put to Bob as choices.

## Write `synthesis/constructs.md`, in exactly these sections
1. **The answer in one page.** Bob's question; for each construct, one line on where it stands today and one on what it needs; the architectural finding that joins them; the decisions he is asked for, by number.
2. **Per construct** (TIME, ORGANISATIONS, LAW, COURTS, ANALYSIS, QUESTIONS), each: the anticipated work (core needs, a member's example each); the ladder (levels, one line each); where the system stands, built and reachable by a member today, separately; the target level and why; the architecture (objects, modules extended or new, layer, uses); stages, each with what it unlocks and its trigger; the review's corrections taken in.
3. **The architecture across constructs.** Obligations (who owes what to whom, by when, under which authority) as the thread joining organisations, law, time and courts, and the name it takes; where `standards`, `consequences`, `action-clocks`, `local-facts` and any new module sit in the total order (today layer 9, after Publication: neither inquiry nor the assistant can use them), with the move proposed, checked against `build/modules.json`'s `uses` (which modules would have to move with them, which uses break); where the assistant's question answering sits and what it may call; the as-of (time-validity) model shared by organisations, law and courts; what the AI proposes and the member decides, construct by construct.
4. **One staged path across constructs.** Stages in dependency order (what must exist before what), each naming its modules (extended or new), rough size (modules, requirements), what it unlocks for members (journeys, use cases), and what must be measured first. Hard reasons for anything later (P19).
5. **Decisions for Bob.** Numbered B1, B2, …: the question in plain words; options; recommendation and why; what follows from each answer. Only P17-high-level items.
6. **Decided at BOB's level.** The lower-level choices the studies made or the reviews corrected, one line each, stated as decided.
7. **Corrections to make.** Defects and misleading wording found (e.g. the deadline calculator's weekends, holidays and UTC; the setup page's credential wording), each with its source and the fix; not choices.
8. **Answer to U41.** The design session's six areas, each: confirmed built, the limits, and the options (pointing to §5 decisions), in its order.
9. **Risks and open points.** Where reviews and studies still disagree, what is unverified, and what only a measurement or a real group can settle.
10. **Sources.** The studies, reviews and primary sources this draws on.

Aim for 350–500 lines: dense, no repetition between sections (refer back instead).

**Checkpoint.** Keep `synthesis/constructs.md.work` (what you have read, decisions merged so far), saved after each step; write `synthesis/constructs.md` section by section. If either exists when you start, you are resuming: read both whole, keep what is there, continue from the first unfinished step.

Read-only: never edit, commit or push in /home/user/bio or /home/user/civicos-process. Return a 20-line summary. If your file write is refused, return the full text of `synthesis/constructs.md` instead.
