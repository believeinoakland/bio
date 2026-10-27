# PLANNING: handoff

**Writer** · PLANNING #1 (prefix L), session `session_018Bhcefb6SwLLagYbDTHR1M`, Opus, branch `lane/planning`, folder `build/plan/beta/planning/`, started 2026-10-27 by BOB #320. Section 0 is rewritten whole after every entry; entries below are numbered L1, L2, ….

## 0. State now and next steps

**State.** Takeover reading done (CLAUDE.md; LANES.md §1-§2; MAP.md; `carried-T52-R1.md`; `layers.md`; `modules.json` through a Sonnet worker; `requirements/README.md`; `next.md`; PROCESS-MECHANICS §3, §5, §6, §17). `STRUCTURE.md` drafted (L1): the plan's shape (R0 sweep merge, R1 layers 1-11, R2 measure on a scratch copy, R3 completion), the 78 carried entries by layer and module with their same-layer dependencies and layer 11's waves, each workstream's home modules, twelve candidate new modules with proposed layer and `uses`, what each lane owes, and four technical questions for BOB (Q1 scratch deploy, Q2 layer-11 waves, Q3 T52-100 into R1, Q4 the plan's size against the 51,200-byte cap). Not READY: it is completed as the lanes' drafts arrive. No lane has a draft READY yet (MAP.md; section 0s of PLATFORM, JOURNEYS, TESTS-SWEEP read; AI-DESIGN's A41 hand-over is on `lane/ai-design`; CAPABILITIES and FILES had nothing pushed). BOB is now BOB #321 (`session_018BhcefWqhwJGg3zA2NE2PZ`, `current.md`'s Status line).

**Next steps, in order.**
1. Take BOB's answers to Q1-Q4 into `STRUCTURE.md`.
2. At each check: MAP.md and every lane's section 0 on `tranche/T53` and its branch; take each READY draft as it comes.
3. For each READY draft: check its lines against the house format (`requirements/README.md`, PROCESS-MECHANICS §3), the layer order (P4: uses only earlier modules), the other lanes' drafts (one owner per overlap, STRUCTURE §4), then fold it into per-module requirement-line drafts (`lines-<module>.md` here) and the plan's entries (`plan-T53-draft.md`, split by layer group if over the cap).
4. Earliest likely: AI-DESIGN's A41 hand-over (AIR1-AIR45; BOB records them as K rulings first), then JOURNEYS's STANDS/FIXED/CHANGED for the carried entries.
5. Mark STRUCTURE.md READY when every lane's drafts are folded; then the plan draft, each job's reading set measured (`build/plan/reading-sets.py`, 600 KB, K2700), each exclusion with its hard reason (P19).

**Waiting on.** BOB: Q1-Q4. Lanes: their READY drafts. Nothing from Bob.

## L1 · 2026-10-27 · the plan's structure drafted

Read the takeover set; wrote `STRUCTURE.md`, `DECISIONS.md` (Bob's words this lane carries: K5417, K5418, layers.md ruling 5, K2425, K4635, K4747) and `NEXT-SESSION-PROMPT.md`. Found: T52's layers 1-6 closed and merged (K5419), so every `after W1`…`after W11` in the carried file is met; `proc round open` takes one plan file and `current.md` is capped at 51,200 bytes, so the plan's form needs BOB's choice (Q4); several carried layer-11 entries depend on same-layer entries, so layer 11 needs waves (Q2).
