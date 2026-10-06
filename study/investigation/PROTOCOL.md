# Protocol for every unit of the investigation study

Read `RESUME.md` (Bob's words) first, whole. You are one unit; your prompt names your id, scope and output file. The study folder is STUDY; the product tree you study is the repository root two levels above it (`STUDY/../..`), pinned at `SOURCES-PIN`.

## Rules for every unit
1. **Read whole, never scan.** Every source in your scope is read from its first line to its last (use Read with offset/limit in consecutive ranges for a long file). Searching (grep) is for finding *other* relevant passages after you have read your scope, never a substitute for reading it. A source too large for your budget is split: read the parts that bear on the question whole, and list in `## Sources opened` exactly which ranges you read and which you did not.
2. **Fact vs inference.** Every claim about the product cites its place: `path §section` or `module Rn` (or `path:line`). A claim you infer is marked *(inference)*. Every claim about the outside world cites a URL (phase 1b) or is marked *(general knowledge)*.
3. **Built vs specified.** For a product capability say which: **built** (a module's requirement met and merged; `build/modules.json` lists the module, and the requirement has no *(not yet met)* mark), **specified** (a requirement or canon section, not yet met), **planned** (a ladder rung or plan entry), or **absent**.
4. **Write as you go (checkpoint rule).** Create your output file early and append each section as you finish it. If your output file already exists when you start, you are resuming: keep what it holds, read its `<!-- next: … -->` comment if any, and continue from the first section or source not done. Keep one `<!-- next: … -->` comment at the end naming what remains; remove it when done.
5. **Done marker.** Your output's last section is `## Sources opened` (every file or URL, with ranges for partial reads). The status script counts a unit done only when that heading is present and no `<!-- next:` comment remains.
6. **Never** edit anything outside your output file; never commit, push or switch branches (BOB syncs the folder). Never print or copy a secret.
7. Be concrete and concise: tables and short paragraphs; no padding. Size guide: notes 3,000–8,000 words; studies 4,000–9,000; reviews 1,500–3,000.

## §P · Phase 0, the problem set (P0)
A catalogue of 12–15 realistic investigations a community member or group might bring, spread across domains (public works and procurement, budgets, policing, housing and code enforcement, land use and zoning, schools, utilities and energy, elections and campaign finance, environmental permits, public health, transit, courts), starting with Bob's school rebuild. For each: the member's opening words; the clarifying questions an investigator would ask first; the objective(s); the documents that would answer it (by kind, publisher, where found, what is in them that matters); the actors and relations; the time structure (promises, deadlines, schedules, slips); the money; competing explanations; typical dead ends and refusals (records requests, redactions, paywalls); how it iterates over weeks or months; what "an answer" looks like and what action follows. Then a cross-cutting section: the recurring needs (reading, planning, holding, linking, timing, money, people, explanations, member involvement), each with which scenarios show it.

## §R · Phase 1, what we have (C, D, M units)
For your scope, write: (1) a summary of each source's content as it bears on investigation (the questions: intake and clarifying, planning toward objectives, reading a document with purpose and extracting meaning, holding an investigation over time, competing explanations, evidence and grading, time and promises, money, people and organisations, procurement, member-in-the-loop acceptance, AI runs and their bounds, cost); (2) the doctrine that binds any design here (DEC-n, design requirements, principles: e.g. machine proposes / member accepts, UNDETERMINED, provenance, grades), quoted briefly with its citation; (3) for module units, per module: purpose, the services an investigation engine would use (name, inputs, outputs, Rn), built vs specified, limits and gaps, verified against the module's code where a claim matters (say which file you checked); (4) gaps and tensions you found; (5) `## Sources opened`.

## §B · Phase 1b, best practice (B units)
Research the outside world with WebSearch and WebFetch: authoritative sources first (professional bodies, standards, peer-reviewed or well-known practitioner guides, official documentation of systems). Fetch and read the key sources, not only search snippets. Write: (1) how practitioners in your area actually work, step by step, with their named methods and artefacts; (2) the data models and tools they use (what a "case file", a "lead", a "plan", a "document log" is in their practice); (3) what failed or is warned against; (4) lessons for a member-run, AI-assisted, evidence-graded civic investigation system, each tied to its source; (5) `## Sources opened` (URLs with what you read). If the web is unreachable, say so at the top and work from general knowledge, marked as such.

## §A · Phase 2, analysis per capability (A units)
Read whole: `notes/P0.md`, every `notes/*.md`, every `research/*.md` (all of them; they are your sources), and `RESUME.md`. Then write, for your capability:
1. **The need**, from the problem set: what members and investigators actually need, with the scenarios that show it.
2. **Best practice** that applies, with citations to `research/`.
3. **What the substrate already provides** (built, specified, planned), with citations to `notes/` and through them to the product; and how an engine would use it as is.
4. **Gaps**: what is missing, and what exists but does not fit.
5. **Options** (2–4), each with what it reuses, what it adds (modules, services, data), doctrine fit, cost and risk.
6. **Recommendation**: the one option, its design at the level of modules and services (names, responsibilities, interfaces in a sentence each, the existing modules it uses, where it sits in the layer order), what is deliberately left out and why.
7. **Staging**: the order of delivery, smallest useful step first, each step's acceptance test in a member's terms.
8. **Decisions for Bob** (policy, requirements, architecture, UX only), each with a recommendation.
9. **Interfaces with the other capabilities** (READING, PLANNING, HOME, PROCUREMENT, LOOP, COST).
10. `## Sources opened`.

## §V · Phase 3, review (R units)
Read whole the studies named in your prompt, and the notes and research they cite where a claim matters. For each study: claims not supported by its citations; substrate it missed (a built service it re-invents); over-building (anything not called for by the problem set); doctrine conflicts; inconsistencies with the other studies; risks unaddressed. Each finding: severity (blocking / should fix / minor), the claim, the evidence, the fix. Then `## Sources opened`.

## §S · Phase 4, synthesis (S-SYNTHESIS)
Read whole every `studies/*.md` and `reviews/*.md`, and `notes/P0.md`. Write `synthesis/architecture.md`: (1) the problem in a page, with Bob's school rebuild walked through end to end as the system would handle it; (2) the principles of the design; (3) the architecture: every new or changed module and construct, its responsibility, the services it provides and uses, its layer, shown also as one diagram description; what is reused unchanged; (4) how the six capabilities work together over an investigation's life (intake, plan, read, hold, explain, answer, iterate); (5) the staging across tranches, smallest useful step first; (6) decisions for Bob with recommendations, the reviews' blocking findings and how each is resolved; (7) what is deliberately not built; (8) `## Sources opened`.
