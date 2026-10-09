# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #145 (`session_01Lzjn9d16Mo4a4RE2Xr16gN`), 2026-10-09 ~01:45 UTC, at Bob's hold (K2411). Read `build/rulings-active.md` first; this BOB's rulings are K2397–K2415.

## The hold (Bob's, K2411)

Bob, meter 77%: "hold development after the current layer is finished", so the capacity goes to finishing the investigation design, folding it into canon and the build plan, and including it in the next tranche. T40's L1 and L2 are merged and closed (K2402, K2415); no layer or job starts until Bob says to resume. BOB's backstop and WATCH are deleted; nothing runs unattended.

## Open with Bob

- The investigation design, with INVESTIGATION-DESIGN #2 (`session_01WzvEVTg39Jijv4CesGz4Dc`, branch `design/investigation`): batches of the remaining D's (D2–D4, D12 now; then D19, D20, D24, D7; then D8, D21, D22, D17, D18, D16; then D1 restated), then the whole design for his review (K2410). Bob is hesitant to build what may change: N820–N822 stay held until he says the design is settled.
- When he resumes: ask his weekly meter at the resume.

## Open with UX-DESIGN

- B121 (QUESTION, K2394): DEC-186's two readings; membership was built on the first (earlier handles reserved for their member, K2413). If U answers otherwise, membership R124/R16 changes by an entry; publication R76 (L8) before its START.
- B119, B120: no answer needed.

## Where things stand

- **T40 open, HELD** on `tranche/T40` (plan `build/plan/current.md`, Status line HELD). Done: L1 (record-grammar, pdf-reader, doc-clean T40-2a), L2 (membership with R127 `joinedParticipants`, credentials, promotion's stamp 1.67.0). Remaining, unchanged: L4 T40-4a (reading-pipeline tests only), L6 (T40-5–T40-11), L8 (T40-12–T40-16b), L9 T40-9a, L11 (T40-17–T40-26). Requirement text for L6, L8, L9, L11 is applied (K2400); STARTs for them are not yet written (T39's are the pattern; L11 STARTs must require explicit tests for control-plane R69, R70 and notice-producers R16).
- **Reds carried by name:** answers `standing.test.mjs`:122, :273 → T40-9; op-declarations `t33` R19 and `t35`:196 → T40-23; reading-pipeline's two agenda pins → T40-4a; rule 4's list otherwise.
- **Investigation drafts (P18), current through H19:** `plan/draft-T41-investigation.md` (adopted text, K2405; D13/D14/D52–D54 folded, K2409) and `plan/draft-canon-investigation.md` (not to be put to Bob until his whole-design review, K2410). Keep both current from each HANDOFF entry (H20 onward), with one K per fold.
- `next.md`: N748, N751, N780, N794, N796, N815, N817, N820–N822 (N820–N822 held, K2410).

## Next steps, in order

1. While held: when INVESTIGATION-DESIGN says in HANDOFF that Bob is content with the whole design (D1–D63, H20–H34 and after), fold H20 onward into the two drafts in one pass (a worker applies, BOB reviews; K2416), commit, answer with the K. Spend nothing else.
2. When Bob says to resume: take over or wake (§5.1), arm backstop and WATCH, ask his meter, write L4's and L6's STARTs and start L4 (T40-4a) then L6 in order; run the rest of T40; close it by §5.7 (PR `tranche/T40` → `main` merged with the GitHub merge tool, authority Bob's standing direction in the product's `CLAUDE.md`, K1177; standing list `mcp__github__merge_pull_request`; no refusal since K2273).
3. Plan T41 with the investigation design once Bob says it is settled (N820–N822, the canon approved first).

## Process notes

- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker, file-scanner and bio-plane before `fleetbundles` (agent-worker has no lockfile; it needs none).
- A rename of a module's test fixture needs that module's `tests` entry in `modules.json` swapped by BOB at the merge (K2415).
