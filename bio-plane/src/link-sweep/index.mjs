/* link-sweep — the ratified link sweep (requirements: `build/requirements/link-sweep.md`; Intake Doctrine §4, §6, §9):
 * a sweep's definition and who may write one, its run for `scheduler`, and what members need to look at. The daemon it
 * runs under, with its pause, its idempotence key and its landing, is `monitoring`'s.
 *
 * Split from `monitoring` with N506 (K617, K1159; T24): `monitoring/sweep.mjs` and `sweep-match.mjs`, the sweep's
 * share of `checks.mjs` (C-18.16–C-18.18 and C-18.5's sweep arm) and of `schema.mjs` (`sweep_runs`, `sweep_filed`),
 * and the sweep services of `index.mjs` (`sweepDue`, `sweepWake`, `sweepTick`, `sweeps`, `sweepConditions`, the scope
 * check's registration, the `sweeps` route). Monitoring R53–R64 are R1–R12 here, no meaning changed.
 *
 * REACHED as `linkSweepOf(host, deps)` (K61): one instance per host, created on the first call. At creation it creates
 * its tables and declares them to record-core's purge, hands monitoring its share of C-18.5, the fence and the slate
 * (`registerSweep`, monitoring R66), and registers with capture-requests the scope check its R45 calls (R12) when
 * `captureRequests` is given, else on the first sweep service asked (so the composition root's own capture-requests,
 * built with its deps, is the one reached).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own): `record`,
 * `membership`, `promotion` (layer 2); `capture` (`acquire`, `sourceReachability`, `heldCount`); `observationLog`
 * (its one append); `projectStage` (R4's closed test); `captureRequests` (R12); `monitoring` (`sweepHost`,
 * `registerSweep`: its R65, R66); `now`, the instance clock in milliseconds.
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` and `files` (R4, R9's `data/gathering.json`, R12's
 * requests), provenance's `register` and `captured_locators` (R6's `already_held`), as `monitoring` read them. */

import { recordOf } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { observationLogOf } from "../observation-log/index.mjs";
import { projectStageOf } from "../project-stage/index.mjs";
import { captureRequestsOf } from "../capture-requests/index.mjs";
import { monitoringOf } from "../monitoring/index.mjs";
import { LinkSweep, LINK_SWEEP_MODULE } from "./sweep.mjs";
import { LINK_SWEEP_TABLES } from "./schema.mjs";

export { LinkSweep, LINK_SWEEP_MODULE, linksOf, SWEEP_TICK_BATCH, SWEEP_RUNS_SHOWN, SWEEP_CONDITION_KINDS, SWEEP_ACTOR,
         SWEEP_PURPOSE, SWEEP_CONSUMER, ANOMALY_MIN_RUNS, ANOMALY_WINDOW, ANOMALY_FACTOR, ANOMALY_FLOOR, ANOMALY_DRY_MEDIAN,
         SILENT_RUNS } from "./sweep.mjs";
export * from "./checks.mjs";
export { compileTerm, inScope, cut, isCut, TERM_MAX, MATCH_TEXT_MAX, TERM_PROGRAM_MAX, TERM_REPEAT_MAX } from "./sweep-match.mjs";
export { LINK_SWEEP_SCHEMA, LINK_SWEEP_TABLES, migrateLinkSweep } from "./schema.mjs";

const instances = new WeakMap();

/** K61: the one LinkSweep for this object's storage, created on the first call; `deps` is read on that call only. */
export function linkSweepOf(host, deps) {
  const storage = host && host.storage ? host.storage : host;
  let s = instances.get(storage);
  if (!s) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    /* the later services are reached on first use, so the composition root's own instances are the ones reached */
    const lazy = (given, make) => { let v = given || null; return () => (v ||= make()); };
    s = new LinkSweep({ storage: d.storage || storage, record, membership, promotion, now: d.now || null,
      capture: lazy(d.capture, () => captureOf(host)),
      observationLog: lazy(d.observationLog, () => observationLogOf(host, { record, membership })),
      projectStage: lazy(d.projectStage, () => projectStageOf(host, { record, membership })),
      captureRequests: lazy(d.captureRequests, () => captureRequestsOf(host, { record })),
      monitoring: lazy(d.monitoring, () => monitoringOf(host, { record, membership, promotion })) });
    instances.set(storage, s);
    s.migrate();
    record.declarePurge(LINK_SWEEP_MODULE, LINK_SWEEP_TABLES.map((t) => ({ name: t.name, keys: [...t.keys] })));
    /* R1–R3, R9: C-18.5's sweep arm, the fence and the slate share, with monitoring (its R66) */
    s.registration = s.registerWithMonitoring();
    /* R12: the sweep scope check capture-requests R45 calls, at creation when it was handed in */
    if (d.captureRequests) s.registerSweepScope();
  }
  return s;
}

/** The module's op (K3), as an entry of the plane's one op map, which the plane composes and control-plane's routes
 *  spread (`control-plane/dispatch.mjs`). `viewer` is the control plane's stamp, read from the query, so a caller's
 *  own copy never wins. R9: the sweeps the viewer may see. */
export function linkSweepOps(s, url) {
  const q = (k) => url.searchParams.get(k);
  return {
    sweeps: () => s.sweeps({ viewer: q("viewer"), now: q("now") }),
  };
}
