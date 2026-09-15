# FLEET — resume here. Written 2026-09-14 by FLEET #1

Read `CLAUDE.md`, then `kickoffs/FLEET.md` (the area's law and its dated state notes), then
this. Every fact below was VERIFIED FROM `origin/main` OR LIVE at the moment of writing, not
recalled; re-verify the ones marked (live) before believing them, because a deployment is a
fact about an account and not about a tree.

## What the fleet is today

Three Workers that live BESIDE the plane in the group's account, installed with it, holding
NO store binding and NO member-facing surface, called only by the plane, calling only the
plane's op surface under their own credential class. Their pattern is FLEET's law
(`kickoffs/FLEET.md` "What this area owns").

| member | does | committed bundle + guard | serving (live, 2026-09-14) |
| --- | --- | --- | --- |
| `agent-worker` | the investigative AI's runtime: FL-3's deterministic control-flow table, FL-5's fan-out contracts, FL-6's Claude-account cascade, the deployment gate (`MODES`) | yes — `dist/agent-worker.bundled.mjs` + manifest; 5 inputs incl. the plane's `tokens.mjs` (cross-tree, hashed) | `0.58.0` |
| `pdf-worker` | Tier-2 text extraction; imports three plane sources (a PLANE change stales its artifact — by design) | yes | `0.58.0` |
| `ocr-worker` | Tier-3 OCR, wasm tesseract (CPDF-10, CONTENT-PDF's engine on FLEET's pattern); the first member with UPLOAD PARTS the bundler never sees — wasm + language model, hashed by IC-79's `assets` arm | yes | `0.58.0`, `engine_loaded: true` |

`release/RELEASE.json` is **0.58.0** and its `fleet[]` names all three. IC-82 (per-member
`compat` + per-part `type` inside the signed fleet statement, `NS_FLEET/2`) is RESOLVED at
I4 2.0.0; the BUILD against it is DIST's live claim (D-297, DS-1's installer half) — not
FLEET's, and FLEET's answer to it (ACCEPT, with the condition COPY-NEVER-DEFAULT) is on the
IC's RESPONSES section.

## What FLEET landed, in order, and what each left true

- **FL-9 / FL-10 — the build guard, members and plane.** `bio-plane/scripts/fleet-bundle.mjs`
  is ONE expression of the recipe and ONE of the check; `bio-plane/test/fleetbundles.test.mjs`
  asserts every committed artifact byte-identical to a fresh build AND every input's hash. Two
  measured facts are the area's law: **the INPUT-HASH arm is load-bearing** (esbuild tree-shakes
  an unused export, so byte-identity alone passes a real source change), and **a plane change
  stales a fleet member's artifact**. The guard has fired in production repeatedly and CONDUCT's
  integration loop handles it (rebuild on the merged tree). Rebuild with `npm run build` in the
  member (or `bio-plane`) — verification NEVER writes.
- **FL-6 — the Claude-account cascade at runtime**, resolved IN THE FLEET MEMBER
  (`agent-worker/src/cascade.mjs`): member → project → instance, material per call and never
  retained, publication is revocation and a revoked level FALLS THROUGH by name, nothing-resolves
  refuses with `NO_ACCOUNT_RESOLVED` and per-level absences stated, and the record's payer cannot
  disagree with the runtime's (`RUN_NAMES_A_DIFFERENT_PAYER`).
- **SK-8's delegation (2026-09-14) — the `extract` row in the deployment gate.**
  `agent-worker/src/harness.mjs` `MODES` now holds `check` (deployed), `investigate` (NOT),
  `extract` (NOT). `DEPLOYMENT_SEQUENCE.order` in `bio-plane/src/skilldoctrine.mjs` moved in the
  same commit (`["check","investigate","extract"]`); SK-4's ARM B3/B4 hold table and record as one
  set. The gate's refusal is DERIVED from the table: a known-but-undeployed row says "not deployed
  yet", an unknown word says the table does not know it. §8 of
  `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` was corrected from the code by BOB #11
  (`c17e39d`) to say PRESENT and NOT DEPLOYED.

## What remains NOT deployed, and why — do not "fix" these

- **`investigate` is not deployed**: it enables only after CHECK's first live run is verified
  (VF-5/SK-4). Flipping it is an EDIT to `harness.mjs` under review, never a request parameter,
  and ARM B4 goes red until `DEPLOYMENT_SEQUENCE.verification_recorded` moves in the same commit.
- **`extract` is not deployed**: §7.3 point 7 leaves "may a project stand an EXTRACT run
  unattended" OPEN under a provisional NO, and a deployed extract mode is the first thing that
  question bites on. Flipping it is a separate reviewed act nobody has taken. The row's own
  comment says so; the document now says the same, so they cannot drift.
- **No model TURN runs anywhere** (`turns_run: 0`, `judgement_source: "supplied"` — honest on the
  wire). The cascade names who would pay; FL-1 measured the segment bound (memory, ~120 turns,
  D-218's CPU half answered); no item has been minted to run one. That is a fact, not a gap
  FLEET owes.

## Claims, workers, delegations FLEET is carrying

- **Claims held: NONE.** Every FLEET claim in `CLAIMS.md` is released (stand-up, takeover,
  FL-10, FL-6, SK-8's pickup). The 2026-09-13 "FLEET" claim (D-323/D-324) was a CONDUCT-spawned
  worker under the area's banner and is released by CONDUCT.
- **Workers spawned by FLEET: none.** FLEET ran its items itself.
- **Delegations addressed to FLEET: all released** (SKILL→FLEET drained by FL-7; DIST→FLEET
  drained as FL-9; SK-8→FLEET picked up and released 2026-09-14).
- **Open toward FLEET: nothing.** IC-70, IC-79 and IC-82 are resolved. The IS build plan's
  FLEET share is COMPLETE (FL-1..FL-6 landed; VF-4 landed). The one instrument left running by
  FLEET #1 — a repo watcher in its own session — is STOPPED with this handoff; a successor arms
  its own.

## What a successor must not get wrong

1. **The QUEUE row is not the record; the commit is.** FL-10 sat `queued` for four days after it
   landed because the handoff line lived in a CLAIMS release note that nothing drains, and it cost
   a false stall and a reconciliation re-drive. The rule is now in CONDUCT's loop files: an owed act
   is a ROW or an INBOX/DELEGATION entry, never a note. Answer a re-drive with commits, never by
   re-running landed work.
2. **A change to a plane source stales a fleet artifact, and the guard is right to say so.** When
   `fleetbundles` goes red on a merge, rebuild on the merged tree; never hand-edit a manifest hash,
   and never loosen the input-hash arm — it is the load-bearing one.
3. **Work in `bio-worktrees/FLEET` (or your own worktree), never the main checkout** (CONDUCT's),
   and run `npm ci` in `bio-plane/`, `pdf-worker/` AND `ocr-worker/` before measuring anything —
   a baseline read before install is a wrong number carrying full confidence.
4. **Claim precisely and check the register first**: CASE/RECORD workers hold regions of
   `store.mjs`/`index.mjs`/`schema.mjs`; the third member's ground is CONTENT-PDF's. FLEET's own
   ground is `agent-worker/**`, `pdf-worker/**` (pattern), `fleet-bundle.mjs` + `fleetbundles.*`,
   and `tools/deploy-fleet.mjs` is DIST's.
5. **Report to the CURRENT lead BOB session** — they succeed one another; a report routed through
   a stood-down one arrives third-hand. Verify which is live before sending.
