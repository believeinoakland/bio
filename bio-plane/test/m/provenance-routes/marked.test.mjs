/* provenance-routes: `routeFinding` and `provenanceRoutesMarked` (R5). Moved from `test/m/provenance/chain-route.test.mjs`
   and `convert-chain-marker.test.mjs` by N512 (provenance R23), their assertions unchanged, with the census's
   incomplete case and the bounds' controls added. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, provDoc } from "./fixture.mjs";
import { routeFinding, ROUTE_MARK_NOTE, ROUTE_MARKED_LIMIT_DEFAULT, ROUTE_MARKED_LIMIT_MAX, ROUTE_MARKED_CAUSES,
         FINDING_MEANS, OBSERVATION_MEANS } from "../../../src/provenance-routes/index.mjs";

function twoDocs(w, id, { secondRouted = false } = {}) {
  const a = w.cap(`${id}-a`), b = w.cap(`${id}-b`);
  const docs = [provDoc(a), { ...provDoc(b), ...(secondRouted ? {} : { locator: "in hand" }) }];
  assert.equal(w.promoteInfo(id, { captures: [a, b], docs }).ok, true);
}
const assess = (w, id) => w.routes.provenanceRouteAssess({ bundleId: id, author: V("r"), viewer: V("r") });

test("R5: routeFinding states never-looked as the question never asked, not applicable to a bundle that is not information", () => {
  for (const t of ["inquiry", "project", "action", undefined, null]) {
    const na = routeFinding(t, { finding: "LOOKED_INDETERMINATE" });
    assert.deepEqual([na.applies, na.assessed, na.marked, na.finding, na.means], [false, false, false, null, null], String(t));
    assert.equal(na.note, "a route is a fact about a captured document, and this record is not one");
  }
  const never = routeFinding("information", null);
  assert.deepEqual([never.applies, never.assessed, never.marked, never.finding, never.means],
                   [true, false, false, "NEVER_LOOKED", OBSERVATION_MEANS.NEVER_LOOKED]);
  assert.equal(never.note, "no assessment of this document's route has ever been recorded. This is NOT a finding "
    + "that the route cannot be shown; it is the absence of the question having been asked.");
  const mark = { finding: "LOOKED_INDETERMINATE", at: "t", by: V("r"), state_at: "verified", seq: 3, register_state: "readable",
                 undetermined: 1, documents_n: 2 };
  assert.deepEqual(routeFinding("information", mark), {
    applies: true, assessed: true, marked: true, finding: "LOOKED_INDETERMINATE", means: OBSERVATION_MEANS.LOOKED_INDETERMINATE,
    at: "t", by: V("r"), stateAt: "verified", seq: 3, register: "readable", undetermined: 1, documents: 2, note: ROUTE_MARK_NOTE });
  const present = routeFinding("information", { ...mark, finding: "PRESENT" });
  assert.deepEqual([present.marked, present.means], [false, OBSERVATION_MEANS.PRESENT]);
  assert.match(ROUTE_MARK_NOTE, /this document stays where the group put it/);
  assert.match(ROUTE_MARK_NOTE, /corrects FORWARD rather than un-saying one \(DEC-19\)/);
  assert.match(ROUTE_MARK_NOTE, /The state and this finding disagree deliberately, and neither is a defect in the other/);
  assert.deepEqual(FINDING_MEANS, { NEVER_LOOKED: OBSERVATION_MEANS.NEVER_LOOKED,
    LOOKED_INDETERMINATE: OBSERVATION_MEANS.LOOKED_INDETERMINATE, PRESENT: OBSERVATION_MEANS.PRESENT });
  assert.equal(Object.isFrozen(FINDING_MEANS), true);
});

test("R5: routeOf reads the standing mark of a bundle; a mark at verified records the state it was made at", () => {
  const w = world();
  const cap = w.cap("a");
  const id = "INFO-2026-0001-n";
  assert.equal(w.promoteInfo(id, { captures: [cap], state: "verified", docs: [{ ...provDoc(cap), locator: "in hand" }], pkg: { replay: true } }).ok, true);
  assert.deepEqual(w.routes.routeOf(id, "information"), routeFinding("information", null));
  const head0 = w.head(id);
  const m = w.routes.provenanceRouteAssess({ bundleId: id, author: V("riley"), viewer: V("riley") });
  assert.deepEqual([m.route.finding, m.route.marked, m.route.stateAt, m.route.by], ["LOOKED_INDETERMINATE", true, "verified", V("riley")]);
  assert.deepEqual(w.head(id), head0);
  assert.deepEqual(w.routes.routeOf(id, "information"), m.route);
  assert.equal(w.routes.routeOf(id, "inquiry").applies, false, "the type asked decides applicability");
});

test("R5: the marked roster pages visible bundles in id order with a census, and an empty page says why", () => {
  const w = world();
  const empty = w.routes.provenanceRoutesMarked({ viewer: V("x") });
  assert.deepEqual([empty.ok, empty.documents.length, empty.cause, empty.says], [true, 0, "no_documents_visible", ROUTE_MARKED_CAUSES.no_documents_visible]);
  twoDocs(w, "INFO-2026-0001-x");
  const never = w.routes.provenanceRoutesMarked({ viewer: V("x") });
  assert.deepEqual([never.cause, never.complete, never.census.never_assessed], ["never_assessed", false, 1]);
  assess(w, "INFO-2026-0001-x");
  const w2 = world();
  twoDocs(w2, "INFO-2026-0002-y", { secondRouted: true });
  assess(w2, "INFO-2026-0002-y");
  assert.equal(w2.routes.provenanceRoutesMarked({ viewer: V("x") }).cause, "none_standing");
  const page = w.routes.provenanceRoutesMarked({ viewer: V("x") });
  assert.deepEqual(page.documents.map((d) => [d.bundleId, d.state, d.finding]), [["INFO-2026-0001-x", "collected", "LOOKED_INDETERMINATE"]]);
  assert.deepEqual(page.census, { documents_visible: 1, assessed: 1, never_assessed: 0,
                                  standing: { LOOKED_INDETERMINATE: 1 }, marked: 1 });
  assert.deepEqual([page.complete, page.cause, page.finding, page.means, page.returned, page.truncated, page.cursor],
                   [true, null, "LOOKED_INDETERMINATE", FINDING_MEANS.LOOKED_INDETERMINATE, 1, false, null]);
  assert.equal(page.limit, ROUTE_MARKED_LIMIT_DEFAULT);
  assert.equal(ROUTE_MARKED_LIMIT_DEFAULT, 50);
  assert.equal(ROUTE_MARKED_LIMIT_MAX, 200);
  assert.equal(w.routes.provenanceRoutesMarked({ viewer: V("x"), limit: 10000 }).limit, ROUTE_MARKED_LIMIT_MAX);
  for (const bad of [0, -3, "x", null]) assert.equal(w.routes.provenanceRoutesMarked({ viewer: V("x"), limit: bad }).limit, 50, String(bad));
  assert.equal(w.routes.provenanceRoutesMarked({ viewer: V("x"), limit: "7.9" }).limit, 7);
  const past = w.routes.provenanceRoutesMarked({ viewer: V("x"), after: "INFO-2026-0001-x" });
  assert.deepEqual([past.cause, past.says, past.after], ["page_exhausted", ROUTE_MARKED_CAUSES.page_exhausted, "INFO-2026-0001-x"]);
  /* Withheld whole and counted nowhere for a viewer who may see nothing. */
  const denied = w.routes.provenanceRoutesMarked({ viewer: "stranger" });
  assert.deepEqual([denied.documents.length, denied.census.marked, denied.census.documents_visible, denied.cause],
                   [0, 0, 0, "no_documents_visible"]);
  assert.equal(JSON.stringify(denied).includes("INFO-2026-0001-x"), false);
  assert.deepEqual(w.routes.provenanceRoutesMarked({}), denied, "no viewer sees nothing");
});

test("R5: the roster is incomplete while any visible information bundle was never assessed, and the census counts it", () => {
  const w = world();
  twoDocs(w, "INFO-2026-0001-a");
  twoDocs(w, "INFO-2026-0002-b", { secondRouted: true });
  twoDocs(w, "INFO-2026-0003-c");
  w.inquiry("INQ-2026-0004-q");
  assess(w, "INFO-2026-0001-a");
  assess(w, "INFO-2026-0002-b");
  const r = w.routes.provenanceRoutesMarked({ viewer: V("x") });
  assert.deepEqual(r.census, { documents_visible: 3, assessed: 2, never_assessed: 1,
                               standing: { LOOKED_INDETERMINATE: 1, PRESENT: 1 }, marked: 1 }, "the inquiry is no information bundle");
  assert.deepEqual([r.complete, r.documents.length, r.cause], [false, 1, null]);
  assert.match(r.completeness, /1 of 3 captured documents have NEVER been assessed/);
  assess(w, "INFO-2026-0003-c");
  const all = w.routes.provenanceRoutesMarked({ viewer: V("x") });
  assert.deepEqual([all.complete, all.census.never_assessed, all.census.marked], [true, 0, 2]);
});

test("R5: truncation is read from one past the page, and the cursor is the last id read", () => {
  const w = world();
  for (const n of [1, 2, 3]) { twoDocs(w, `INFO-2026-000${n}-z`); assess(w, `INFO-2026-000${n}-z`); }
  const p1 = w.routes.provenanceRoutesMarked({ viewer: V("x"), limit: 2 });
  assert.deepEqual([p1.documents.length, p1.truncated, p1.cursor], [2, true, "INFO-2026-0002-z"]);
  const p2 = w.routes.provenanceRoutesMarked({ viewer: V("x"), limit: 2, after: p1.cursor });
  assert.deepEqual([p2.documents.length, p2.truncated, p2.cursor], [1, false, null]);
  /* Exactly a full page is not truncated: measured, never inferred. */
  const p3 = w.routes.provenanceRoutesMarked({ viewer: V("x"), limit: 3 });
  assert.deepEqual([p3.documents.length, p3.truncated], [3, false]);
});

test("R5: a bundle the viewer may not see is withheld from the page and the census alike, and the cursor still moves past it", () => {
  const w = world();
  for (const n of [1, 2, 3]) twoDocs(w, `INFO-2026-000${n}-f`);
  w.fence("INFO-2026-0002-f");
  for (const n of [1, 2, 3])
    assert.equal(w.routes.provenanceRouteAssess({ bundleId: `INFO-2026-000${n}-f`, author: V("r"), viewer: "admin" }).ok, true);
  /* The founder sees all three. */
  const all = w.routes.provenanceRoutesMarked({ viewer: "admin" });
  assert.deepEqual([all.documents.length, all.census.marked, all.census.documents_visible], [3, 3, 3]);
  /* A member outside the project: the fenced bundle is absent from the page and from every count. */
  const m = w.routes.provenanceRoutesMarked({ viewer: V("x") });
  assert.deepEqual(m.documents.map((d) => d.bundleId), ["INFO-2026-0001-f", "INFO-2026-0003-f"]);
  assert.deepEqual(m.census, { documents_visible: 2, assessed: 2, never_assessed: 0, standing: { LOOKED_INDETERMINATE: 2 }, marked: 2 });
  assert.equal(JSON.stringify(m).includes("INFO-2026-0002-f"), false);
  /* A page whose rows are all withheld still advances: the cursor is over what was read, not what was returned. */
  const p1 = w.routes.provenanceRoutesMarked({ viewer: V("x"), after: "INFO-2026-0001-f", limit: 1 });
  assert.deepEqual([p1.documents.length, p1.truncated, p1.cursor], [0, true, "INFO-2026-0002-f"]);
  const p2 = w.routes.provenanceRoutesMarked({ viewer: V("x"), after: p1.cursor, limit: 1 });
  assert.deepEqual(p2.documents.map((d) => d.bundleId), ["INFO-2026-0003-f"]);
});
