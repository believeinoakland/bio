import { localize } from "../setup-words/index.mjs";
/* provenance-routes' ops (requirements: `build/requirements/provenance-routes.md`, R9). The three route arms moved
 * here from `provenance`'s `provenanceOps` (its R53) with the code they reach (N512, K1193), unchanged: one ops map for
 * the composition root to spread beside provenance's (`build/extraction/legacy-store.md` §4.2 (6); the
 * `membershipOps` pattern). */

/** R9: the module's route arms, keyed by op name, each a function of no arguments answering what its service answers,
 *  its parameters read from `url`'s query, where the control plane stamps `viewer` and `author` (never from the body).
 *  `routes` is this module's instance (`provenanceRoutesOf`). Which credential reaches each op is `op-declarations`'
 *  and `control-plane`'s, never this map's. `body` is taken for the map's common shape and read by no arm. */
export function provenanceRouteOps(routes, url, body) {
  const q = (k) => url.searchParams.get(k);
  return {
    /* REC-54 / D-200: one bundle's chain rebuilt; `apply` is opt-in, the default a report (R2, R3). */
    provenancechain: () => routes.provenanceChainRebuild({ bundleId: q("bundleId"), apply: q("apply") === "1",
                                                           viewer: q("viewer"), author: q("author") }),
    /* REC-63 / DEC-56 / D-204: the route assessed and its finding recorded; no state moves (R4). */
    provenanceroute: () => routes.provenanceRouteAssess({ bundleId: q("bundleId"), viewer: q("viewer"),
                                                          author: q("author") }),
    /* REC-116 / IC-120: the bundles whose standing mark is LOOKED_INDETERMINATE (R5). With a `bundleId` (R15; K4259) it
       answers instead that one document's standing route, never absent; an empty `bundleId` is none. */
    provenanceroutes: () => q("bundleId")
      ? routes.provenanceRouteOf({ bundleId: q("bundleId"), viewer: q("viewer") })
      : routes.provenanceRoutesMarked({ after: q("after"), limit: q("limit"), viewer: q("viewer") }),
  };
}

/* R14 (T51; K4168; op-declarations R80, op-grades R49): the ops this module serves that the screens send, declared by their owner beside
   the ops map: each row's class, weight and description are the op's existing rows', its fields are what the arm reads. */
export const DECLARED_OPS = Object.freeze({
  provenanceroute: { classes: ["admin","member","probe"], mutating: true, weight: "substrate", description: localize("provenance-routes.declared.provenanceroute", "document-directed: records a standing marker that a document's route cannot be shown, keyed by bundleId; moves no state and no byte. Session reach since REC-155 (§4.10); whether a surface offers it beside a document is NOT decided, so no act row is published"),
    fields: { accepts: ["bundleId"], requires: ["bundleId"] } },
  provenanceroutes: { classes: ["admin","member","probe"], mutating: false, weight: "read", description: localize("provenance-routes.declared.provenanceroutes", "read: the documents whose standing route marker says the route cannot be shown, paged, with the census and why an empty page is empty; with bundleId, that one document's standing route, never absent (NEVER_LOOKED when nobody looked); writes nothing"),
    fields: { accepts: ["after","limit","bundleId"], requires: [] } },
});
