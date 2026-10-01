/* plane R9, R10 (K861 (2)): the plane's own stats sight, registered as `plane` through record-core's R65. It is the one
   source behind `op=stats` and purge's proof: the caller's sight over hidden bundles and hidden runs, the three figures
   no owner reports (`refs`, read from `connections`' export, its R61; `textIndexOk`, `extraction`'s boolean;
   `observationsNonLead`), and the spread of every module's registered figures (record-core R63). Each owner's figures are
   its own, registered under its name by the composition root (`store.mjs`, `registerOwnersCounts`). It writes nothing. */
import { recordOf, RecordCore } from "../record-core/index.mjs";
import { hiddenBundles, membershipOf, Membership } from "../membership/index.mjs";
import { hiddenRuns } from "../ai-runs/index.mjs";
import { extractionOf } from "../extraction/index.mjs";
import { connectionsOf } from "../connections/index.mjs";
import { runProductionsOf, RunProductions } from "../run-productions/index.mjs";
import { inquiryOf, Inquiry } from "../inquiry/index.mjs";
import { basisVersionsOf, BasisVersions } from "../basis-versions/index.mjs";
import { observationLogOf, ObservationLog } from "../observation-log/index.mjs";

/* The name the stats source is registered under. */
export const PLANE = "plane";

/* R10 (K861 (1)): each owner's exported figure source, registered by plane under its owner's name, in the order
   `op=stats` has answered its keys since plane held them (K923). Each is asked of
   its owner's instance when the figures are read, never at registration, so no factory is built here before its turn
   in the composition root (R2). */
const OWNERS = Object.freeze([
  ["record-core", RecordCore.COUNT_KEYS, (ctx, hid) => recordOf(ctx).ownCounts(hid)],
  ["membership", Membership.COUNT_KEYS, (ctx, hid) => membershipOf(ctx).counts(hid)],
  ["run-productions", RunProductions.COUNT_KEYS, (ctx, hid) => runProductionsOf(ctx).counts(hid)],
  ["inquiry", Inquiry.COUNT_KEYS, (ctx, hid) => inquiryOf(ctx).counts(hid)],
  ["observation-log", ObservationLog.COUNT_KEYS, (ctx, hid) => observationLogOf(ctx).counts(hid)],
  ["basis-versions", BasisVersions.COUNT_KEYS, (ctx, hid) => basisVersionsOf(ctx).counts(hid)],
]);

/** R10: every owner's figure source registered through record-core R63 under the owner's own name. Answers each
 *  registration's answer, in order. */
export function registerOwnersCounts(ctx) {
  const record = recordOf(ctx);
  return OWNERS.map(([module, keys, counts]) => record.registerCounts(module, [...keys], (hid) => counts(ctx, hid)));
}

/** R10: the plane's own stats sight, registered as the instance's stats source (record-core R65). */
export function registerStats(ctx) {
  return recordOf(ctx).registerStatsSource(PLANE, ({ viewer, proof }) => figures(ctx, { proof, viewer }));
}

/** The one body behind both answers, so the wire's counts and purge's proof cannot drift apart on any key but the ones
 *  the ruling names. `proof` is PRIVATE: only `purge` passes it (D-113: its before/after are its proof), and that proof
 *  stays WHOLE (§5: *the purge proof's own count stays whole*): record-core keeps its `observations` and `leads`
 *  (observation-log's figures) and drops `observationsNonLead` (its R64, R65). No route reaches it. */
function figures(ctx, { proof, viewer }) {
  /* D-464 — A COUNT IS TAKEN THROUGH THE CALLER'S OWN SIGHT (Membership v2 §7.9, *"Not its existence"*): a count over
   * rows the caller could not all read discloses that they exist. The fix is subtraction, never a second rule: `hid` is
   * every bundle the caller's `viewerPredicate` does NOT pass (membership's `hiddenBundles`, its R88, N352), and every
   * counter whose rows name a bundle drops the rows naming one in `hid`. Who is filtered is the gate's word: a credential
   * the gate does not filter gets `hid` = nothing, an enrolled administrator's session passes every project, and a
   * viewer SENT but not recognised (an empty stamp included) is DENY, so `hid` is every bundle — fails closed. A viewer
   * NEVER SENT (`undefined`) is a direct INTERNAL call (purge's proof, and suites reading the store's own counters) and
   * stays WHOLE, so it is not asked; the stamp is load-bearing at the control plane, whose every door sets it. D-486's
   * run subtraction (`observationsNonLead`) is ai-runs' R42 (N191), with the same reading of the never-sent stamp. */
  const hid = viewer === undefined ? null : hiddenBundles(viewer);
  const runTail = viewer === undefined ? { sql: "", args: [] } : hiddenRuns(viewer);
  return {
    /* K877, K882 (N454): `refs` is connections' table, counted by its export (its R61) through this sight. */
    ...connectionsOf(ctx).refsCounts(hid),
    textIndexOk: extractionOf(ctx).textIndexOk(),
    /* REC-131 / IC-148 — ONE KEY NEVER CARRIES TWO MEANINGS. The wire's log count excludes lead looks, so it is
       published as `observationsNonLead`, a name that states its predicate (`authority_kind <> 'lead'`); purge's
       `observations` (observation-log's figure) keeps the whole log, and the wire carries no `observations` key.
       D-486 / BOB #32: it also subtracts a hidden project's RUN rows, the caller's sight, which moves with the viewer;
       the two predicates are deliberately not folded. Purge's proof does not carry it (record-core R65). */
    ...(proof ? {} : { observationsNonLead: [...ctx.storage.sql.exec(
      `SELECT count(*) c FROM observation_log WHERE authority_kind <> 'lead'${runTail.sql}`, ...runTail.args)][0].c }),
    /* N342 (K445): every module's registered figures (record-core R63), after the plane's own. */
    ...recordOf(ctx).counts(hid),
  };
}
