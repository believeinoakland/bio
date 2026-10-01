/* provenance: the route-marker tally on the audit (R54, record-core R68), this module's figures for `op=stats` and
   purge's proof (R55, record-core R63), and the route marks' read contract (R48), each driven through record-core's
   own services over the real modules. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V, provDoc } from "./fixture.mjs";
import { routeFinding, OBSERVATION_MEANS, ROUTE_FINDING_KEY, ROUTE_TALLY_NOTE, ROUTE_TALLY_MARKED_MAX }
  from "../../../src/provenance/index.mjs";
import { hiddenBundles } from "../../../src/membership/index.mjs";

const T = "2026-09-27T00:00:00Z";
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
const assess = (w, id) => w.prov.provenanceRouteAssess({ bundleId: id, author: V("ruth"), viewer: V("ruth") });
const inquiry = (w, id) => w.record.transact(() => w.record.commit({ bundleId: id, type: "inquiry", title: "Q", project: null,
  snapKey: id, kind: "promotion", base: "", author: V("ruth"), writer: null, operation: null,
  files: [{ path: "bundle.md", text: `---\nid: ${id}\n---\n`, sha256: sha(`---\nid: ${id}\n---\n`), bytes: 1 }],
  state: "open", priorState: null, group: "test-group", created: T, lastUpdated: T, criticality: null, at: T }));
/* Every statement on the marks table, with its arguments, while `fn` runs. */
function marksRead(w, fn) {
  const exec = w.st.sql.exec.bind(w.st.sql), seen = [];
  w.st.sql.exec = (q, ...args) => { if (/FROM provenance_route_marks m\b/.test(q)) seen.push({ q, args }); return exec(q, ...args); };
  return Promise.resolve(fn()).then((out) => { w.st.sql.exec = exec; return { out, seen }; });
}

test("R54: the audit answers the route tally under `route`, every key present, the marked bundles named with their state, over the page's ids only", async () => {
  const w = world();
  unshowable(w, "INFO-2026-0001-marked");
  showable(w, "INFO-2026-0002-present");
  showable(w, "INFO-2026-0003-never");
  inquiry(w, "INQ-2026-0004-question");
  unshowable(w, "INFO-2026-0005-hidden");
  unshowable(w, "INFO-2026-0006-ended");
  for (const id of ["INFO-2026-0001-marked", "INFO-2026-0002-present", "INFO-2026-0005-hidden", "INFO-2026-0006-ended"]) assess(w, id);
  /* A later assessment that shows the route ends the standing mark (R23): the highest seq is the finding. */
  const ended = "INFO-2026-0006-ended", c = w.cap(ended);
  assert.equal(w.promoteInfo(ended, { captures: [c], base: w.head(ended).bundleSha }).ok, true);
  assert.equal(assess(w, ended).route.finding, "PRESENT");
  const visible = (id) => id !== "INFO-2026-0005-hidden";
  const pass = await w.record.auditPass({ after: "", limit: 10, visible });
  assert.equal(ROUTE_FINDING_KEY, "route");
  const mark = w.prov.routeOf("INFO-2026-0001-marked", "information");
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

test("R54: the finding never moves ok, clean, withErrors, tally or offenders, and its meanings and note are the fixed ones", async () => {
  const w = world();
  for (const n of [1, 2, 3]) unshowable(w, `INFO-2026-000${n}-x`);
  const before = await w.record.auditPass({ after: "", limit: 10, visible: () => true });
  for (const n of [1, 2, 3]) assess(w, `INFO-2026-000${n}-x`);
  const after = await w.record.auditPass({ after: "", limit: 10, visible: () => true });
  assert.deepEqual([before.route.tally.NEVER_LOOKED, after.route.tally.LOOKED_INDETERMINATE], [3, 3]);
  for (const k of ["ok", "checked", "clean", "withErrors", "tally", "tallyDetail", "offenders", "limit", "cursor"])
    assert.deepEqual(after[k], before[k], k);
  assert.equal(Object.keys(after.tally).some((k) => /route|LOOKED|PRESENT/.test(k)), false, "never inside the tally");
  /* The five meanings, word for word as the audit has always answered them (observation-log's OBSERVATION_STATES). */
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
  /* The finding's meanings agree with what a route finding means. */
  for (const f of ["NEVER_LOOKED", "LOOKED_INDETERMINATE", "PRESENT"])
    assert.equal(routeFinding("information", f === "NEVER_LOOKED" ? null : { finding: f }).means, OBSERVATION_MEANS[f]);
});

test("R54: the marked list is bounded at 20 in page order, markedTotal and markedShown saying how many", async () => {
  const w = world();
  const ids = Array.from({ length: 23 }, (_, i) => `INFO-2026-${String(i + 1).padStart(4, "0")}-m`);
  for (const id of ids) { unshowable(w, id); assess(w, id); }
  const pass = await w.record.auditPass({ after: "", limit: 50, visible: () => true });
  assert.equal(ROUTE_TALLY_MARKED_MAX, 20);
  assert.deepEqual([pass.route.markedTotal, pass.route.markedShown, pass.route.marked.length], [23, 20, 20]);
  assert.deepEqual(pass.route.marked.map((m) => m.bundleId), ids.slice(0, 20));
  assert.equal(pass.route.tally.LOOKED_INDETERMINATE, 23);
});

test("R54: the marks are read over the page's own id range, never the whole table, and kept for the page's ids", async () => {
  const w = world();
  for (const n of [1, 2, 3, 4, 5, 6]) { unshowable(w, `INFO-2026-000${n}-r`); assess(w, `INFO-2026-000${n}-r`); }
  /* A page of two after the first bundle: ids 2 and 3, the hidden 3 withheld by the caller's sight. */
  const visible = (id) => id !== "INFO-2026-0003-r";
  const { out, seen } = await marksRead(w, () => w.record.auditPass({ after: "INFO-2026-0001-r", limit: 2, visible }));
  assert.deepEqual(out.route.marked.map((m) => m.bundleId), ["INFO-2026-0002-r", "INFO-2026-0004-r"]);
  assert.deepEqual(seen.map((s) => s.args), [["INFO-2026-0001-r", "INFO-2026-0004-r"]], "one read, bounded by the page's range");
  assert.match(seen[0].q, /m\.bundle_id > \? AND m\.bundle_id <= \?/);
  assert.equal(out.route.markedTotal, 2, "the withheld bundle inside the range rides on nothing");
  /* An empty page reads no mark. */
  const none = await marksRead(w, () => w.record.auditPass({ after: "INFO-2026-0006-r", limit: 2, visible: () => true }));
  assert.deepEqual([none.seen.length, none.out.route.markedTotal], [0, 0]);
});

test("R54: registered once, at start, under `route`: a second registration, or another module asking for the key, is refused", () => {
  const w = world();
  const again = w.record.registerAuditFinding("provenance", "route", () => ({}));
  assert.deepEqual([again.ok, again.reason], [false, "AUDIT_CHECK_DECLARED"]);
  const taken = w.record.registerAuditFinding("someone-else", "route", () => ({}));
  assert.deepEqual([taken.ok, taken.reason, taken.heldBy], [false, "AUDIT_CHECK_DECLARED", "provenance"]);
  /* The finding is a function of the page alone, and writes nothing. */
  unshowable(w, "INFO-2026-0001-a");
  assess(w, "INFO-2026-0001-a");
  const before = w.snapshot();
  const page = { bundles: [{ bundleId: "INFO-2026-0001-a", type: "information", state: "collected" }], after: "", last: "INFO-2026-0001-a" };
  assert.equal(w.prov.routeTally(page).markedTotal, 1);
  assert.deepEqual(w.snapshot(), before);
});

test("R55: register and routeMarks, registered once through record-core's counts, each keyed on bundle_id and taken through the caller's sight", () => {
  const w = world();
  const a = unshowable(w, "INFO-2026-0001-a");
  showable(w, "INFO-2026-0002-b");
  assess(w, "INFO-2026-0001-a"); assess(w, "INFO-2026-0002-b");
  /* A second mark on the first bundle: routeMarks counts rows, not bundles. */
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [a], base: w.head("INFO-2026-0001-a").bundleSha }).ok, true);
  assess(w, "INFO-2026-0001-a");
  const whole = w.record.counts(null);
  assert.deepEqual([whole.register, whole.routeMarks], [2, 3]);
  assert.deepEqual([whole.register, whole.routeMarks], [w.count("register"), w.count("provenance_route_marks")]);
  /* A hidden bundle's rows are left out. */
  const hideA = { sql: "(SELECT ?)", args: ["INFO-2026-0001-a"] };
  assert.deepEqual([w.record.counts(hideA).register, w.record.counts(hideA).routeMarks], [1, 1]);
  /* membership's complement of its sight rule: a viewer it refuses sees no bundle, so counts none. */
  const stranger = w.record.counts(hiddenBundles("stranger"));
  assert.deepEqual([stranger.register, stranger.routeMarks], [0, 0]);
  /* A recognised member sees every bundle that is not a project's: the whole count. */
  const member = w.record.counts(hiddenBundles(V("x")));
  assert.deepEqual([member.register, member.routeMarks], [2, 3]);
  /* A register row whose home is gone names no held bundle: no hidden set names it, so it is counted. */
  w.st.sql.exec(`INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered) VALUES (?,?,?,?,?,?)`,
                sha("orphan"), "INFO-2026-0999-gone", "snapshots/o", "utf8", 1, "x");
  assert.equal(w.record.counts(hiddenBundles("stranger")).register, 1);
  /* Synchronous, and writes nothing. */
  const before = w.snapshot();
  const got = w.prov.counts(null);
  assert.equal(typeof got.then, "undefined");
  assert.deepEqual(got, { register: 3, routeMarks: 3 });
  assert.deepEqual(w.snapshot(), before);
  /* Registered once: a second registration of either figure is refused, naming provenance. */
  const twice = w.record.registerCounts("provenance", ["register"], () => ({}));
  assert.deepEqual([twice.ok, twice.reason], [false, "COUNTS_DECLARED"]);
  const taken = w.record.registerCounts("someone-else", ["routeMarks"], () => ({}));
  assert.deepEqual([taken.ok, taken.reason, taken.heldBy], [false, "COUNTS_DECLARED", "provenance"]);
});

test("R48: provenance_route_marks keeps its read-contract columns, and a later module's SQL finds the standing mark by the highest seq, read through routeFinding", () => {
  const w = world();
  unshowable(w, "INFO-2026-0001-a");
  const a = w.cap("INFO-2026-0001-a");
  showable(w, "INFO-2026-0002-b");
  showable(w, "INFO-2026-0003-never");
  assess(w, "INFO-2026-0001-a");
  assess(w, "INFO-2026-0002-b");
  assert.equal(w.promoteInfo("INFO-2026-0001-a", { captures: [a], base: w.head("INFO-2026-0001-a").bundleSha }).ok, true);
  assess(w, "INFO-2026-0001-a");
  const cols = w.rows(`PRAGMA table_info(provenance_route_marks)`).map((r) => r.name);
  for (const c of ["bundle_id", "seq", "at", "by", "finding", "state_at", "register_state", "undetermined", "documents_n"])
    assert.equal(cols.includes(c), true, c);
  /* retrieval's op=list shape: one LEFT JOIN against the highest seq, the columns renamed, read through routeFinding. */
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
    assert.deepEqual(routeFinding(r.object_type, mark), w.prov.routeOf(r.bundle_id, r.object_type), r.bundle_id);
  }
  /* by is the member who assessed; at a whole-second instant; state_at the bundle's state then. */
  const m = w.row(`SELECT * FROM provenance_route_marks WHERE bundle_id = ? AND seq = 1`, "INFO-2026-0001-a");
  assert.deepEqual([m.by, m.finding, m.state_at, m.register_state, m.undetermined, m.documents_n],
                   [V("ruth"), "LOOKED_INDETERMINATE", "collected", "readable", 1, 1]);
  assert.match(m.at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
});
