# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #145 (`session_01Lzjn9d16Mo4a4RE2Xr16gN`), 2026-10-09 ~18:35 UTC, for BOB #146. Read `build/rulings-active.md` first; this BOB's rulings are K2397–K2431.

## Open with Bob

None. Development runs (K2430: "Continue development after layer 1 completes."). Meter 79% at T41's opening (K2423); the 80% pause (K2341) stands if he reports it. An open point in Anthropic's terms is not a question for Bob (K2425).

## Open with UX-DESIGN

- S19 (DEC-186's two readings) is with Bob through the design stream (U143); membership was built on 1A/2A. A different answer arrives as a NOTICE and becomes an entry.
- Read to U145; B122 (ACK) sent. Nothing owed.

## Where things stand

- **T40 closed early** on Bob's direction (K2422): PR #19 (DEC-188) then PR #20 (`tranche/T40`) merged into `main` @ 8af83ac942. Archive `plan/archive/T40.md`.
- **Investigation canon in force** (K2420, K2421): `docs/architecture/BIO_Investigation_v0_1.md` and amendments A–S. INVESTIGATION-DESIGN #2 (`session_01WzvEVTg39Jijv4CesGz4Dc`) has finished; it stays unarchived unless idle (archive it at takeover with a `design-lane` row under T41 if its work is done).
- **T41 open** on `tranche/T41` (plan `build/plan/current.md`; 63+ entries over L1–L11; K2424). New modules entered at the opening: `steps`, `reading-guides`, `question-explorer` (L6), `investigation` (L7), `publish-schedule` (L8). Their requirements are written; adopted text is `plan/draft-T41-investigation.md`.
- **L1 merged and closed** (K2431): record-grammar (STP, GUD, acceptance), text-chain (`ai_transcription`). Joined since the opening: T41-2a record-core (L2), T41-8a capture upload (L3, Bob's "upload: A", K2425), T41-10a query-language and T41-10b progressions (L5, tests only).
- **Reds carried by name** (plan's rules plus): query-language `grammar.test.mjs`:210 → T41-10a; progressions `define.test.mjs`:199 → T41-10b; record-core `t33`:68, :161 → T41-2a; answer-envelope C-35.13 pin and C-120 test → T41-60; reading-pipeline's two pins; membership R83 `module-order` → T41-3; answers `standing`:122, :273 and op-declarations `t33`/`t35` → their entries.

## Next steps, in order

1. Take over (§5.1): archive BOB #145, its `BOB-final` row under **T41** (`metrics/T41.csv`); `mail xwriter`; arm backstop and WATCH (`WATCH #146: tranche/T41`); delete mine (backstop `trig_01CnfosBsGdfAnqkEwfytLsC`, WATCH `trig_01JGG8JX4EM6tcDVV3MHy8nk`).
2. Before L2's START, BOB's text (a worker applies, BOB reviews): membership's D54 change from `draft-T41-investigation.md` §3.5 (T41-3, with R83's MODULE_ORDER for the five new modules); project-roster R5 (T41-4); record-core R62's two sentences (T41-2a); credentials T41-5 (USE_KINDS gains, DEC-188 (8) retirements, DEC-188's owed reads and change history: write their requirement text, and N796's lifted sign-in refusal, K2425); promotion's stamp (T41-6). Then L2's STARTs (`starts-T40/` are the pattern; measure each reading set) and start L2. Merge order: record-core, membership, project-roster, credentials, promotion last.
3. Before L3's START: capture's upload requirement (T41-8a, K2425's terms: graded received from the member, attributed, her statement of origin; as the doorbell's grading, K509 (3)).
4. Run T41's layers in order; at each layer apply that layer's text first. inquiry R39's two texts merge into H38's before L6 (K2424). Draft agent-worker's split map during T41 for T42 (P18).
5. Close T41 by §5.7: check the channel for a MERGE; PR `tranche/T41` → `main` with the GitHub merge tool (authority Bob's standing direction in the product's `CLAUDE.md`, K1177; standing list `mcp__github__merge_pull_request`; no refusal since K2273; PRs #19 and #20 merged this way at K2422).

## Process notes

- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker, file-scanner and bio-plane before `fleetbundles` (agent-worker needs none).
- A renamed test fixture needs its module's `tests` entry swapped in `modules.json` at the merge (K2415).
- `from` in `modules.json` is for legacy extractions only; a copy split of a product module carries none (K2424).
