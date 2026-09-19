# FLEET — resume here. Written 2026-09-19 by FLEET (standing lane) at STAND DOWN

Bob, 2026-09-19, via BOB #16: at 91% of weekly usage, every lane in this account stops and development moves to the
OTHER Claude Code account. This file is for the first FLEET session THERE. Read `CLAUDE.md`, then `kickoffs/FLEET.md`
(the area's law, and its "Process lessons" section, which is new at this handoff), then this. Every fact below was
MEASURED on the date given — treat each as a POINTER and re-measure it; a deployment is a fact about an account, not
a tree.

## What the fleet is, live (measured 2026-09-19, after DIST's 0.65.0 deploy)

| member | serves | committed bundle sha256 (unchanged since 0.59.0) |
| --- | --- | --- |
| `agent-worker` | `0.65.0` | `a7e5f590…` |
| `pdf-worker` | `0.65.0` | `b26dee19…` |
| `ocr-worker` | `0.65.0`, `engine_loaded: true`, tesseract-wasm 0.11.0, tessdata_fast/eng | `0d99f5d0…` (+2 upload parts) |
| plane `biosmoke7` | `0.65.0` at the isolate AND through the DO (`op=bootstrap`) | — |

`main`'s `release/RELEASE.json` = 0.65.0, and its `fleet[]` names those three hashes. The member bytes have not moved
since REC-100's migration (0.59.0): the version bumps 0.59.0 → 0.65.0 were the VERSION label only, and the fleet sources
are identical from v0.62.0 to v0.65.0 (`git diff --stat` empty). A guard run on `main` 2026-09-18: `fleetbundles` 87 pass
/ 0 fail / 0 skipped (all three `node_modules` installed), `agent-worker` harness 227/0.

## IC-130 — the one deploy constraint the fleet carries

IC-130 (I3 24.0.0, REC-100): the plane now REFUSES a run step `PRESENT` that names nothing. `agent-worker` was migrated in
the same landing — a model-judged PRESENT is recorded `LOOKED_INDETERMINATE` with the judgement in `detail`, counted in
`present_unbacked`, and per-entry refusals surface in `log_refused`.

**ORDER: agent-worker FIRST, or in the same act as the plane — NEVER the plane first.** An OLD agent-worker in front of a
NEW plane silently loses every model-judged PRESENT step. A NEW agent-worker in front of an OLD plane is safe, and that
was TESTED, not reasoned: (1) offline — a throwaway tree at `v0.58.0` with `agent-worker/` from `v0.62.0`, harness 227/0
incl. section R against the real 0.58.0 plane; (2) live, 2026-09-19, `biosmoke7` scratch at plane 0.58.0 + agent-worker
0.62.0 — 11 steps, 11/11 ticks landed, 9 model-judged PRESENT recorded LOOKED_INDETERMINATE, 0 refused, run closed
`completed`, swept (purge scope=all, `op=stats` zero, `op=audit` clean). DIST's deploy step now names this order
(`80d3de44`). It held in the 0.64.0 deploy (agent-worker went first; the in-between state was verified safe).

## Open residue — none of it is FLEET's to run

- **M0-69** (queued): a scratch whole-store purge must also clear the identity tables (BOB #16's ruling,
  `BIO_Distribution_v0_1.md` §6 rung 6). Today `op=purge&scope=all&confirm=scratch` leaves `members`.
- **M0-70** (queued): the VF-4 instrument's arm 2a leaves a `proposed` member by design (Membership v2 §4.7) and must
  purge scratch after itself.
- **M0-68** (queued): `bio-plane/test/vf4-live-scratch.mjs` arm 4b-ii still asserts D-323's refusal; D-323 is closed, so
  it fails 4 assertions on any current plane. Correct or retire to W8 with a dated reason — never exempt.
- **Scratch on `biosmoke7`, stated at stand-down (2026-09-19):** every derived counter 0 (`op=stats`), `op=audit`
  `ok:true checked=0 withErrors=0 offenders=0`. **Members: 7 VF-4 rows remain** — `vf4m202609140058/0101/0103/0104`,
  `vf4t1` (proposed, 2026-09-14), `vf4ruth` (active, 2026-09-14), and **`vf4m202609190139` (proposed) left by FLEET's own
  run of 2026-09-19**. No op in the plane removes a member; M0-69 is what clears them. The `bio` namespace holds none.

## Claims, workers, delegations, instruments FLEET is carrying

- **Claims held: NONE.** The one FLEET claim this session made (FLEET.md routing, `8a585611`) was released in its commit.
- **Workers spawned: none. Open toward FLEET: nothing** — `node tools/owed.mjs FLEET` read 0 attributed at stand-down.
- **Self-wake: DELETED** at stand-down (the 6-hourly `CronCreate` and its re-arm reminder). A successor arms its own —
  and see FLEET.md's lesson on the 7-day expiry.
- **Throwaway instruments: all deleted** (the mixed tree, the adapted VF-4 copy). Nothing untracked is left.

## What a successor must not get wrong

1. **"Safe" from a diff is a reading; say so until it is tested.** This lane first told DIST the mixed rollout was safe
   from the diff alone; DIST then left production in exactly that state on the strength of it. It happened to be right.
   The mixed-tree test (FLEET.md, Process lessons) costs minutes — run it BEFORE the claim leaves the lane.
2. **A fleet member's version label is not its code.** Compare `fleet[].sha256` between tags before reasoning about a
   rollout; identical bytes make a partial rollout safe regardless of the labels.
3. **A lane reading `waiting` on `ListAgents` is holding a prompt nobody is answering.** Route to BOB as the one act
   only Bob can take; do not re-send to the stalled lane and wait.
4. The rest of FLEET #1's list (2026-09-14) still stands and now lives in FLEET.md: the commit is the record, a plane
   change stales a fleet artifact, `npm ci` before measuring, claim precisely, report to the CURRENT lead BOB.
