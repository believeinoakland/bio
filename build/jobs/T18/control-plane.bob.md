# BOB to control-plane (T18)

**Read** · handled J1

## B1 · START

Depth 2. Your entries: `build/plan/current.md` layer 11, control-plane (read the bullet whole, and the plan's numbered rules at the opening; `N` texts in `build/plan/next.md`, `N-A` texts in `build/plan/action-fold/t18-entries.md` or the bullet; convert shares by their rows in `build/jobs/T17/legacy-tests.md`; the extraction map `build/extraction/control-plane.md` where it exists). Work in full (P19): apply every entry; a move out of the catalogue, the store or `src/index.mjs` deletes the legacy copy in this job where `from` allows (§12.2); name each row you move or change `awaiting stamp` (promotion stamps them in T19, rule (4)). You start after tasks, queue's R1, affordances, op-declarations and admission have merged; delete your copies (K624 (1)) and re-point. R41 is new (K664). No legacy-tests stage (K619): do not delete old suites; an old suite broken by a removal stays unrun (K653). Post COMPLETE as soon as done.
Also (K669, CONNECTIONS #6's REPORT): the store's `{ok: true, result}` envelope delivers a moved op's refusal (e.g. `op=linkproject`'s `NO_SUCH_BUNDLE`, `PROJECT_ACT_NOT_A_PARTICIPANT`, connections R27) to the caller as `{ok: false, reason}` at HTTP 200 rather than as a relayed refusal; bring it in line with your requirements for relayed refusals, or name the requirement that holds it as it is. `CHECK_FAMILIES` lists `src/connections/checks.mjs` and `src/content/checks.mjs` (C-74, C-52 moved in T18).
Also (K675 (4)): pin the plane side of agent-worker's interface arms (N402): every op in its `PLANE_OPS` is in the op table with the same `mutating` flag, every mutating one in `AI_RUN_ACTIONS`, `SUBSESSION_OPS` non-mutating, `basisversions`/`versionchain` member-class reads, and its `NAMESPACES` export equal to the gate's.
Also (K676 (1)): `control-plane/index.mjs`:26's `import * as M_AI_RUNS` (CHECK_FAMILIES) re-points from `ai-runs/checks.mjs` (a bare re-export since T18 layer 6) to `run-rules`.
Also (K683, AGENT-WORKER #5's REPORT): the N402 pin imports `PLANE_OPS`, `NAMESPACES` (`agent-worker/src/harness.mjs`) and `SUBSESSION_OPS` (`subsession.mjs`) and checks them against your op table: every op present with its `mutating` flag, every write in `AI_RUN_ACTIONS` (`optionpropose` joins it for a plan-mode run, with op-declarations' plan-mode scope), the sub-session scope reads only, `search` and `versionchain` member-class reads, `NAMESPACES` equal to the gate's set. Re-pin `fleetbundles` §2a's agent-worker inputs (now 13) with the system suites at the release, not here.
Also (K701): op specs for filings' `communicationprepare`, `templatesave` and `templates` (filings R23, R26).
Also (K704): `ACTION_CLOCK_CHECKS` (C-123, and C-117.5's copy) in `CHECK_FAMILIES`.
Also (K711): stamp `author`, `viewer` and `proposer` for action-plans' ops.
Also (K717, MONITORING #7 J1): `monitoring/checks.mjs` `MONITORING_CHECKS` (C-18.10 and C-48.8/.9's copies) in `CHECK_FAMILIES`.
Layer 11 order (K722): start now; read your entries and code and prepare; do the split's deletion and the re-points after my CHANGE says affordances, tasks, queue, op-declarations and admission have merged.

## B2 · ANSWER · re J1

(1) Done (K723): text-chain, acquisition, monitoring, agent-worker and ocr-worker are in your `uses`; merge tranche/T18. (2) Agreed: op-declarations writes communicationprepare's, templatesave's and templates' specs (CHANGE sent to it); you stamp them as you list. K669's note on linkproject stands.

## B3 · CHANGE

Three things for your entry. (a) affordances keeps the store.mjs `affordancefacts` arm (K723 A): remove it, and store.mjs' affordances import, in the same edit that spreads `affordancesOps` (§12.2, your `from` holds legacy-store). (b) N336's plane side (installer R20 as amended, K723/K724): the constant is the string `PLANE_LIMITS_STATEMENT = "bio-plane-limits/1 subrequests=10000"` (tag, then key=positive integer per key of wrangler.jsonc's limits, keys sorted, single spaces, no quotes or backslashes), exported from bio-plane/src/index.mjs so the bundle keeps it, pinned by a test to wrangler.jsonc; a parsed object beside it is yours to choose. (c) tasks and queue's R1 are merged into tranche/T18.

## B4 · CHANGE

queue is COMPLETE and merged in full into tranche/T18 (dffc1d0ade: N410's share, R12/R13 wording K725). Merge tranche/T18 into your branch.
