/* provenance-routes: the route-marker tally on the audit (R6, record-core R68), driven through record-core's own
   `auditPass` over the real modules. Moved from `test/m/provenance/audit-figures.test.mjs` by N512 (provenance R54),
   its assertions unchanged, the registration's holder now this module. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, provDoc } from "./fixture.mjs";
import { routeFinding, OBSERVATION_MEANS, ROUTE_FINDING_KEY, ROUTE_TALLY_NOTE, ROUTE_TALLY_MARKED_MAX,
         PROVENANCE_ROUTES_MODULE } from "../../../src/provenance-routes/index.mjs";

/* An information bundle whose route the record cannot show (its one document is "in hand", with no custodian). */
const unshowable = (w, id) => {
  const c = w.cap(id);
  assert.equal(w.promoteInfo(id, { captures: [c], docs: [{ ...provDoc(c), locator: "in hand" }] }).ok, true, id);
  return c;
};
const showable = (w, id) => {
  const c = w.cap(id);
  assert.equal(w.promoteInfo(id, { captures: [c] }).ok, true, id);
  return c;
};
const assess = (w, id) => w.routes.provenanceRouteAssess({ bundleId: id, author: V("ruth"), viewer: V("ruth") });
/* Every statement on the marks table, with its arguments, while `fn` runs. */
function marksRead(w, fn) {
  const exec = w.st.sql.exec.bind(w.st.sql), seen = [];
  w.st.sql.exec = (q, ...args) => { if (/FROM provenance_route_marks m\b/.test(q)) seen.push({ q, args }); return exec(q, ...args); };
  return Promise.resolve(fn()).then((out) => { w.st.sql.exec = exec; return { out, seen }; });
}

test("R6: the audit answers the route tally under `route`, every key present, the marked bundles named with their state, over the page's ids only", async () => {
  const w = world();
  unshowable(w, "INFO-2026-0001-marked");
  showable(w, "INFO-2026-0002-present");
  showable(w, "INFO-2026-0003-never");
  w.inquiry("INQ-2026-0004-question");
  unshowable(w, "INFO-2026-0005-hidden");
  unshowable(w, "INFO-2026-0006-ended");
  for (const id of ["INFO-2026-0001-marked", "INFO-2026-0002-present", "INFO-2026-0005-hidden", "INFO-2026-0006-ended"]) assess(w, id);
  /* A later assessment that shows the route ends the standing mark (R5): the highest seq is the finding. */
  const ended = "INFO-2026-0006-ended", c = w.cap(ended);
  assert.equal(w.promoteInfo(ended, { captures: [c], base: w.head(ended).bundleSha }).ok, true);
  assert.equal(assess(w, ended).route.finding, "PRESENT");
  const visible = (id) => id !== "INFO-2026-0005-hidden";
  const pass = await w.record.auditPass({ after: "", limit: 10, visible });
  assert.equal(ROUTE_FINDING_KEY, "route");
  const mark = w.routes.routeOf("INFO-2026-0001-marked", "information");
  assert.deepEqual(pass.route, {
    tally: { LOOKED_INDETERMINATE: 1, PRESENT: 2, NEVER_LOOKED: 1, notApplicable: 1 },
    marked: [{ bundleId: "INFO-2026-0001-marked", state: "collected", ...mark }],
    markedTotal: 1, markedShown: 1, means: OBSERVATION_MEANS, note: ROUTE_TALLY_NOTE });
  assert.equal(JSON.stringify(pass.route).includes("INFO-2026-0005-hidden"), false, "a bundle the page withholds carries nothing out");
  /* Every key present on a page with none of a kind: NEVER_LOOKED stated, never absent. */
  const fresh = world();
  showable(fresh, "INFO-2026-0001-a");
  assert.deepEqual((await fresh.record.auditPass({ after: "", limit: 10, visible: () => true })).route.tally,
                   { LOOKED_INDETERMINATE: 0, PRESENT: 0, NEVER_LOOKED: 1, notApplicable: 0 });
  assert.deepEqual((await fresh.record.auditPass({ after: "", limit: 10, visible: () => false })).route,
                   { tally: { LOOKED_INDETERMINATE: 0, PRESENT: 0, NEVER_LOOKED: 0, notApplicable: 0 }, marked: [],
                     markedTotal: 0, markedShown: 0, means: OBSERVATION_MEANS, note: ROUTE_TALLY_NOTE });
});

test("R6: the finding never moves ok, clean, withErrors, tally or offenders, and its meanings and note are the fixed ones", async () => {
  const w = world();
  for (const n of [1, 2, 3]) unshowable(w, `INFO-2026-000${n}-x`);
  const before = await w.record.auditPass({ after: "", limit: 10, visible: () => true });
  for (const n of [1, 2, 3]) assess(w, `INFO-2026-000${n}-x`);
  const after = await w.record.auditPass({ after: "", limit: 10, visible: () => true });
  assert.deepEqual([before.route.tally.NEVER_LOOKED, after.route.tally.LOOKED_INDETERMINATE], [3, 3]);
  for (const k of ["ok", "checked", "clean", "withErrors", "tally", "tallyDetail", "offenders", "limit", "cursor"])
    assert.deepEqual(after[k], before[k], k);
  assert.equal(Object.keys(after.tally).some((k) => /route|LOOKED|PRESENT/.test(k)), false, "never inside the tally");
  assert.deepEqual(OBSERVATION_MEANS, {
    NEVER_LOOKED: "nobody looked at this level for this subject",
    LOOKED_ABSENT: "we looked and it is positively not there",
    LOOKED_INDETERMINATE: "we looked and could not tell",
    PRESENT: "we looked and it is there",
    partial: "we looked and got part of it (SWH's crawl status; CPDF-5's measured 88% case)" });
  assert.equal(Object.isFrozen(OBSERVATION_MEANS), true);
  assert.equal(ROUTE_TALLY_NOTE, "these are STATED DOUBTS, not conformance errors, and they are deliberately not counted in "
    + "`tally` or `withErrors`: each names a document whose route cannot be shown, standing where "
    + "the group put it (DEC-56/DEC-19). `NEVER_LOOKED` is a different fact again — it means no "
    + "assessment has run, not that anything is wrong.");
  for (const f of ["NEVER_LOOKED", "LOOKED_INDETERMINATE", "PRESENT"])
    assert.equal(routeFinding("information", f === "NEVER_LOOKED" ? null : { finding: f }).means, OBSERVATION_MEANS[f]);
});

test("R6: the marked list is bounded at 20 in page order, markedTotal and markedShown saying how many", async () => {
  const w = world();
  const ids = Array.from({ length: 23 }, (_, i) => `INFO-2026-${String(i + 1).padStart(4, "0")}-m`);
  for (const id of ids) { unshowable(w, id); assess(w, id); }
  const pass = await w.record.auditPass({ after: "", limit: 50, visible: () => true });
  assert.equal(ROUTE_TALLY_MARKED_MAX, 20);
  assert.deepEqual([pass.route.markedTotal, pass.route.markedShown, pass.route.marked.length], [23, 20, 20]);
  assert.deepEqual(pass.route.marked.map((m) => m.bundleId), ids.slice(0, 20));
  assert.equal(pass.route.tally.LOOKED_INDETERMINATE, 23);
  /* Negative control: under the bound, every marked bundle is shown. */
  const few = await w.record.auditPass({ after: "", limit: 5, visible: () => true });
  assert.deepEqual([few.route.markedTotal, few.route.markedShown], [5, 5]);
});

test("R6: the marks are read over the page's own id range, never the whole table, and kept for the page's ids", async () => {
  const w = world();
  for (const n of [1, 2, 3, 4, 5, 6]) { unshowable(w, `INFO-2026-000${n}-r`); assess(w, `INFO-2026-000${n}-r`); }
  const visible = (id) => id !== "INFO-2026-0003-r";
  const { out, seen } = await marksRead(w, () => w.record.auditPass({ after: "INFO-2026-0001-r", limit: 2, visible }));
  assert.deepEqual(out.route.marked.map((m) => m.bundleId), ["INFO-2026-0002-r", "INFO-2026-0004-r"]);
  assert.deepEqual(seen.map((s) => s.args), [["INFO-2026-0001-r", "INFO-2026-0004-r"]], "one read, bounded by the page's range");
  assert.match(seen[0].q, /m\.bundle_id > \? AND m\.bundle_id <= \?/);
  assert.equal(out.route.markedTotal, 2, "the withheld bundle inside the range rides on nothing");
  const none = await marksRead(w, () => w.record.auditPass({ after: "INFO-2026-0006-r", limit: 2, visible: () => true }));
  assert.deepEqual([none.seen.length, none.out.route.markedTotal], [0, 0]);
});

test("R6: registered once, at start, under `route` by this module: a second registration, or another module asking for the key, is refused", () => {
  const w = world();
  assert.equal(PROVENANCE_ROUTES_MODULE, "provenance-routes");
  const again = w.record.registerAuditFinding("provenance-routes", "route", () => ({}));
  assert.deepEqual([again.ok, again.reason], [false, "AUDIT_CHECK_DECLARED"]);
  const taken = w.record.registerAuditFinding("someone-else", "route", () => ({}));
  assert.deepEqual([taken.ok, taken.reason, taken.heldBy], [false, "AUDIT_CHECK_DECLARED", "provenance-routes"]);
  unshowable(w, "INFO-2026-0001-a");
  assess(w, "INFO-2026-0001-a");
  const before = w.snapshot();
  const page = { bundles: [{ bundleId: "INFO-2026-0001-a", type: "information", state: "collected" }], after: "", last: "INFO-2026-0001-a" };
  assert.equal(w.routes.routeTally(page).markedTotal, 1);
  assert.deepEqual(w.snapshot(), before, "the finding writes nothing");
  /* Malformed pages answer the empty tally, never a throw. */
  for (const p of [undefined, {}, { bundles: "x" }, { bundles: [null, 7] }])
    assert.deepEqual(w.routes.routeTally(p).tally, { LOOKED_INDETERMINATE: 0, PRESENT: 0, NEVER_LOOKED: 0, notApplicable: 0 });
});
