/* provenance-routes: no place named in the module's behaviour or outward text (R13, a copy of provenance R40). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, provDoc } from "./fixture.mjs";
import { chainFromEvidence, routeFinding, ROUTE_MARK_CHECKS, ROUTE_MARK_NOTE, ROUTE_TALLY_NOTE, ROUTE_MARKED_CAUSES,
         OBSERVATION_MEANS } from "../../../src/provenance-routes/index.mjs";
import { provenanceRouteOps } from "../../../src/provenance-routes/ops.mjs";

const place = /oakland|alameda|california|\bca\b|berkeley/i;

test("R13: no place is named in the module's behaviour or outward text", async () => {
  /* Negative control: the pattern finds a place where there is one. */
  assert.equal(place.test(JSON.stringify({ detail: "the Oakland city clerk" })), true);
  const w = world();
  const a = w.cap("a"), b = w.cap("b");
  w.promoteInfo("INFO-2026-0001-a", { captures: [a, b], docs: [provDoc(a), { ...provDoc(b), locator: "in hand" }] });
  w.promoteInfo("INFO-2026-0002-b", { captures: [w.cap("c")] });
  w.inquiry("INQ-2026-0003-q");
  const texts = [ROUTE_MARK_CHECKS, ROUTE_MARK_NOTE, ROUTE_TALLY_NOTE, ROUTE_MARKED_CAUSES, OBSERVATION_MEANS];
  texts.push(chainFromEvidence({}), chainFromEvidence(null), chainFromEvidence(provDoc(a)), routeFinding("information", null),
             routeFinding("inquiry", null));
  for (const who of ["", "token:x", V("r")])
    for (const id of ["", "INFO-2026-0404-none", "INFO-2026-0001-a", "INFO-2026-0002-b", "INQ-2026-0003-q"]) {
      texts.push(w.routes.provenanceRouteAssess({ bundleId: id, author: who, viewer: V("r") }));
      texts.push(w.routes.provenanceChainRebuild({ bundleId: id, author: who, viewer: V("r") }));
    }
  texts.push(w.routes.provenanceChainRebuild({ bundleId: "INFO-2026-0002-b", apply: true, author: V("r"), viewer: V("r") }));
  texts.push(w.routes.provenanceRoutesMarked({ viewer: V("r") }), w.routes.provenanceRoutesMarked({ viewer: "x" }),
             w.routes.provenanceRoutesMarked({ viewer: V("r"), after: "INFO-2026-0009-z" }));
  texts.push(await w.record.auditPass({ after: "", limit: 10, visible: () => true }), w.routes.counts(null));
  const map = provenanceRouteOps(w.routes, new URL(`http://do/?viewer=${V("r")}`), null);
  for (const f of Object.values(map)) texts.push(f());
  /* Every finding and cause sentence reached, so the scan covers each of them. */
  const w2 = world();
  texts.push(w2.routes.provenanceRoutesMarked({ viewer: V("r") }));
  for (const x of texts) assert.equal(place.test(JSON.stringify(x)), false, JSON.stringify(x).slice(0, 200));
});
