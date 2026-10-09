# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #144 (`session_017eYwzMF5vwqLhpqcuC3iU8`), 2026-10-09 ~00:05 UTC, for BOB #145. Read `build/rulings-active.md` first; this BOB's rulings are K2369–K2395.

## Open with Bob

None. Meter 74% at ~23:50 UTC (K2388): "So keep going." Pause at 80% (K2341); Bob says when to ask each layer, do not ask before (K2357).

## Open with UX-DESIGN

- B121 (QUESTION, K2394): two readings of DEC-186, built meanwhile on the first of each: (1) earlier handles stay reserved for their member; (2) a handle is fixed once its member is signer, deliverer or preparer of a published or signed case, or named by handle in its rows. If U answers otherwise, change membership R124/R16 or publication R76 before their layers' START (L2 / L8), or by CHANGE if running.
- B119 (fiscal-year word), B120 (T40's NOTICE): no answer needed.

## Where things stand

- **T39 closed** (PR #18, `main` @ `fc8d9c9f36`, K2389), after PR #16 merged into `main` (K2388). Archived `plan/archive/T39.md`.
- **T40 open** on `tranche/T40` (plan `build/plan/current.md`). Opening acts done (K2389): `ai-use` in `modules.json` before `ai-runs`, users' edges, `layers.md`. Requirement text adopted (K2394): `plan/draft-T40-reqs.md` and `plan/draft-T40-N812.md`, applied before each layer's START. L1 and L2 text applied (K2390, K2395); canon and register folds applied (K2395).
- **L1 running:** RECORD-GRAMMAR #11 merged (K2393). PDF-READER #6 (`session_01KA1AV3RDoRZjWqoUbFgBdC`) working on R38 (raw string bytes; K2392 answered its J1; B2 sent). Merge it when complete (its users doc-clean, pdf-pixels, pdf-worker: it names any whose `v` changed), then close L1 (§5.6: the plane bundle stale from record-grammar; regenerate per the manifest).
- **L2 next:** membership (T40-M), credentials (T40-3), promotion (T40-4, the stamp, last). Text is in the files; write `starts-T40/<module>.txt` (T39's are the pattern; note each reading set over 300 KB names §17 step (3)); merge order membership, credentials, promotion.
- **Later layers:** apply each layer's text from the two drafts before its START (a worker applies, BOB reviews the diff, as K2395). L6 inquiry R39 (Bob's words, K2371); L8 adds T40-16a case-grammar and T40-16b case-checker; L9 filings tests only (N819); L11 adds T40-18a admission.
- `next.md` (T41): N748, N751, N780, N794, N796, N815, N817, each with its hard reason in `current.md`.

## Next steps, in order

1. Take over (§5.1): archive BOB #144, its `BOB-final` row under **T39** (it worked T39 and opened T40; put the row in `metrics/T39.csv`); `mail xwriter`; arm backstop and WATCH; delete mine (backstop `trig_0158NNrcfLgzVStZkp4AAs9m`, WATCH `trig_01R5Wb7ZiNgtSA5uff1PiwUv`).
2. Merge PDF-READER #6 when complete; close L1; start L2.
3. Run T40's layers in order; close T40 by §5.7: (1) no design-stream MERGE is open today; check the channel at the close; (3) PR `tranche/T40` → `main` merged with the GitHub merge tool, authority Bob's standing direction in the product's `CLAUDE.md` (K1177), standing list `mcp__github__merge_pull_request`; no refusal of it recorded since K2273 (K2388, K2389 did this for T39).

## Process notes

- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker, file-scanner, agent-worker and bio-plane (it now pins `pdfjs-dist`) before `fleetbundles`.
- A new module's tests that import another module's test fixtures need that module in `uses` (K2381).
- A provided service changed mid-tranche reaches its users' tests too: run the users' suites at each merge (K2374, K2387).
