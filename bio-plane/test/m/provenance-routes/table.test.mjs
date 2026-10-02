/* provenance-routes: the route marks' read contract (R8), the figure `routeMarks` (R10, record-core R63) and the table's
   one owner and writer (R12), driven through record-core's own services over the real modules. Moved from
   `test/m/provenance/audit-figures.test.mjs` (provenance R48's route-marks case, R55's `routeMarks` half) and
   `convert-chain-marker.test.mjs` (provenance R41's purge case) by N512, their assertions unchanged. The order of
   `op=stats`' keys with provenance's is `composition.test.mjs`'. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, provDoc } from "./fixture.mjs";
import { routeFinding, PROVENANCE_ROUTES_TABLES, PROVENANCE_ROUTES_SCHEMA } from "../../../src/provenance-routes/index.mjs";
import { hiddenBundles } from "../../../src/membership/index.mjs";

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

test("R10: routeMarks, registered once through record-core's counts, keyed on bundle_id and taken through the caller's sight", () => {
  const w = world();
  const a = unshowable(w, "INFO-2026-0001-a");
  showable(w, "INFO-2026-0002-b");
  assess(w, "INFO-2026-0001-a"); assess(w, "INFO-2026-0002-b");
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [a], base: w.head("INFO-2026-0001-a").bundleSha }).ok, true);
  assess(w, "INFO-2026-0001-a");
  const whole = w.record.counts(null);
  assert.equal(whole.routeMarks, 3, "rows, not bundles");
  assert.equal(whole.routeMarks, w.count("provenance_route_marks"));
  const hideA = { sql: "(SELECT ?)", args: ["INFO-2026-0001-a"] };
  assert.equal(w.record.counts(hideA).routeMarks, 1, "a hidden bundle's rows are left out");
  assert.equal(w.record.counts(hiddenBundles("stranger")).routeMarks, 0);
  assert.equal(w.record.counts(hiddenBundles(V("x"))).routeMarks, 3);
  /* A fenced bundle (in a project the member is not in) is subtracted for that member, counted for the founder. */
  w.fence("INFO-2026-0002-b");
  assert.deepEqual([w.record.counts(hiddenBundles(V("x"))).routeMarks, w.record.counts(hiddenBundles("admin")).routeMarks], [2, 3]);
  const before = w.snapshot();
  const got = w.routes.counts(null);
  assert.equal(typeof got.then, "undefined", "synchronous");
  assert.deepEqual(got, { routeMarks: 3 });
  assert.deepEqual(w.routes.counts({ sql: "(SELECT ?)", args: ["INFO-2026-0404-none"] }), { routeMarks: 3 });
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* Registered once, by this module: a second registration of the figure is refused, naming it. */
  const twice = w.record.registerCounts("provenance-routes", ["routeMarks2"], () => ({}));
  assert.deepEqual([twice.ok, twice.reason], [false, "COUNTS_DECLARED"]);
  const taken = w.record.registerCounts("someone-else", ["routeMarks"], () => ({}));
  assert.deepEqual([taken.ok, taken.reason, taken.heldBy], [false, "COUNTS_DECLARED", "provenance-routes"]);
});

test("R8: provenance_route_marks keeps its read-contract columns, and a later module's SQL finds the standing mark by the highest seq, read through routeFinding", () => {
  const w = world();
  const a = unshowable(w, "INFO-2026-0001-a");
  showable(w, "INFO-2026-0002-b");
  showable(w, "INFO-2026-0003-never");
  assess(w, "INFO-2026-0001-a");
  assess(w, "INFO-2026-0002-b");
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [a], base: w.head("INFO-2026-0001-a").bundleSha }).ok, true);
  assess(w, "INFO-2026-0001-a");
  const cols = w.rows(`PRAGMA table_info(provenance_route_marks)`).map((r) => r.name);
  for (const c of ["bundle_id", "seq", "at", "by", "finding", "state_at", "register_state", "undetermined", "documents_n"])
    assert.equal(cols.includes(c), true, c);
  /* retrieval's op=list shape (its R63): one LEFT JOIN against the highest seq, read through routeFinding. */
  const rows = w.rows(`SELECT b.bundle_id, b.object_type, m.seq, m.at, m.by, m.finding, m.state_at, m.register_state,
                              m.undetermined, m.documents_n
                         FROM bundles b LEFT JOIN provenance_route_marks m
                           ON m.bundle_id = b.bundle_id
                          AND m.seq = (SELECT MAX(x.seq) FROM provenance_route_marks x WHERE x.bundle_id = b.bundle_id)
                        ORDER BY b.bundle_id`);
  assert.deepEqual(rows.map((r) => [r.bundle_id, r.seq, r.finding]),
                   [["INFO-2026-0001-a", 2, "PRESENT"], ["INFO-2026-0002-b", 1, "PRESENT"], ["INFO-2026-0003-never", null, null]]);
  for (const r of rows) {
    const mark = r.finding === null ? null : { ...r };
    assert.deepEqual(routeFinding(r.object_type, mark), w.routes.routeOf(r.bundle_id, r.object_type), r.bundle_id);
  }
  const m = w.row(`SELECT * FROM provenance_route_marks WHERE bundle_id = ? AND seq = 1`, "INFO-2026-0001-a");
  assert.deepEqual([m.by, m.finding, m.state_at, m.register_state, m.undetermined, m.documents_n],
                   [V("ruth"), "LOOKED_INDETERMINATE", "collected", "readable", 1, 1]);
  assert.match(m.at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  /* Negative control: a read that ignored seq would see the superseded mark too. */
  assert.equal(w.rows(`SELECT * FROM provenance_route_marks WHERE bundle_id = ?`, "INFO-2026-0001-a").length, 2);
});

test("R12: this module declares its table to purge; purging one bundle removes its marks and leaves another's; an id later reused starts never looked", () => {
  const w = world();
  assert.deepEqual(PROVENANCE_ROUTES_TABLES, ["provenance_route_marks"]);
  const declared = w.record.declarePurge("another-module", ["provenance_route_marks"]);
  assert.deepEqual([declared.ok, declared.reason, declared.declaredBy], [false, "TABLE_DECLARED", "provenance-routes"],
                   "one owner: no other module may declare it");
  const a = w.cap("a"), b = w.cap("b");
  for (const [id, c] of [["INFO-2026-0001-a", a], ["INFO-2026-0002-b", b]]) {
    assert.equal(w.promoteInfo(id, { captures: [c], docs: [{ ...provDoc(c), locator: "in hand" }] }).ok, true);
    assess(w, id);
  }
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [a], docs: [provDoc(a)], base: w.head("INFO-2026-0001-a").bundleSha }).ok, true);
  assess(w, "INFO-2026-0001-a");
  const marks = (id) => w.rows(`SELECT COUNT(*) AS n FROM provenance_route_marks WHERE bundle_id=?`, id)[0].n;
  assert.deepEqual([marks("INFO-2026-0001-a"), marks("INFO-2026-0002-b")], [2, 1]);
  const p = w.record.purge({ bundleId: "INFO-2026-0001-a" });
  assert.deepEqual([p.ok, p.scope, p.removed.provenance_route_marks], [true, "INFO-2026-0001-a", 2]);
  assert.deepEqual([marks("INFO-2026-0001-a"), marks("INFO-2026-0002-b")], [0, 1]);
  assert.equal(w.routes.routeOf("INFO-2026-0002-b", "information").finding, "LOOKED_INDETERMINATE", "the other bundle's mark stands");
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [w.cap("a2")] }).ok, true);
  const reborn = w.routes.routeOf("INFO-2026-0001-a", "information");
  assert.deepEqual([reborn.finding, reborn.assessed, reborn.marked], ["NEVER_LOOKED", false, false]);
  /* The whole-store purge clears it too. */
  const all = w.record.purge({});
  assert.equal(all.removed.provenance_route_marks, 1);
  assert.equal(w.count("provenance_route_marks"), 0);
});

test("R12: of this module's services only the assessment writes a mark; every other read and the rebuild write none", async () => {
  const w = world();
  unshowable(w, "INFO-2026-0001-a");
  const writes = [];
  const exec = w.st.sql.exec.bind(w.st.sql);
  w.st.sql.exec = (q, ...args) => { if (/^\s*(INSERT|UPDATE|DELETE|REPLACE)\b[^;]*provenance_route_marks/i.test(q)) writes.push(q); return exec(q, ...args); };
  w.routes.routeOf("INFO-2026-0001-a", "information");
  w.routes.provenanceRoutesMarked({ viewer: V("x") });
  w.routes.counts(null);
  w.routes.routeTally({ bundles: [{ bundleId: "INFO-2026-0001-a", type: "information", state: "collected" }], after: "" });
  w.routes.provenanceChainRebuild({ bundleId: "INFO-2026-0001-a", apply: true, author: V("r"), viewer: V("r") });
  await w.record.auditPass({ after: "", limit: 5, visible: () => true });
  assert.deepEqual(writes, []);
  assess(w, "INFO-2026-0001-a");
  assert.equal(writes.length, 1, "the assessment is the one writer");
  w.st.sql.exec = exec;
});

test("R12: the migration creates the table and its index, is idempotent, and keeps an existing table's rows", () => {
  const w = world();
  const id = "INFO-2026-0001-a";
  unshowable(w, id);
  assess(w, id);
  const before = w.rows(`SELECT * FROM provenance_route_marks`).map((r) => ({ ...r }));
  assert.deepEqual(w.routes.migrate(), { ok: true });
  assert.deepEqual(w.routes.migrate(), { ok: true });
  assert.deepEqual(w.rows(`SELECT * FROM provenance_route_marks`).map((r) => ({ ...r })), before);
  const idx = w.rows(`SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='provenance_route_marks'`).map((r) => r.name);
  assert.ok(idx.includes("provenance_route_marks_finding"));
  assert.match(PROVENANCE_ROUTES_SCHEMA, /CREATE TABLE IF NOT EXISTS provenance_route_marks/);
});
