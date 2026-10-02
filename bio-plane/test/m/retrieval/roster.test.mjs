/* retrieval's bundle roster and gated whole-bundle reads (R63–R67): `listBundles` (`op=list`), `buildIndex`
   (`op=index`), `readImage`/`readFile` (`op=image`, `op=file`), their four routes, and the figures registered with
   record-core. Each is driven at the module's interface, over every kind of viewer: a machine credential, the founder,
   a member who may see a project, one who may not, an unrecognised stamp and none at all. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { retrievalOf, retrievalRoutes, RETRIEVAL_COUNT_KEYS } from "../../../src/retrieval/index.mjs";
import { routeFinding } from "../../../src/provenance-routes/index.mjs";
import { hiddenBundles, viewerPredicate } from "../../../src/membership/index.mjs";

const ROW_KEYS = ["bundle_id", "bundle_sha", "current_state", "last_updated", "object_type", "route", "title"];
const INDEX_KEYS = ["current_state", "id", "last_updated", "object_type", "sha256", "title"];
const VIEWERS = [MACHINE, "admin", V("ann"), V("vera"), "member:nobody", "garbage", "", null, undefined];

/* A record with information bundles (one marked twice, one once, one never), an inquiry, and a project only `ann` may
   see. The marks are rows of provenance-routes' `provenance_route_marks` (its R8), written in its columns as its R4
   appends them; the table is the one the fixture's provenance-routes migrated. */
function roster() {
  const w = world();
  for (const id of ["INFO-2026-0001-a", "INFO-2026-0002-b", "INFO-2026-0003-c"])
    w.doc(id, {}, { files: [{ path: "n.md", text: `notes of ${id}` }] });
  w.doc("INQ-2026-0001-q", { object_type: "inquiry", schema: "inquiry@1" });
  const proj = w.project("Hidden", "ann");
  const mark = (id, seq, finding, extra = {}) => w.st.sql.exec(
    `INSERT INTO provenance_route_marks (bundle_id, seq, at, by, finding, state_at, register_state, undetermined,
       documents_n, documents) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    id, seq, extra.at || `2026-09-27T0${seq}:00:00Z`, "member:ann", finding, "collected", extra.reg || "readable",
    extra.und ?? 1, extra.n ?? 2, "[]");
  mark("INFO-2026-0001-a", 1, "PRESENT", { und: 0 });
  mark("INFO-2026-0001-a", 2, "LOOKED_INDETERMINATE", { und: 1, n: 3 });
  mark("INFO-2026-0002-b", 1, "PRESENT", { und: 0, n: 1 });
  return { w, r: w.retrieval, proj };
}

/* The ids R43 passes for `viewer`, read from the one gate itself. */
const passes = (w, viewer) => {
  const g = viewerPredicate(viewer);
  return w.rows(`SELECT b.bundle_id FROM bundles b WHERE (${g.sql}) ORDER BY b.bundle_id`, ...g.args).map((x) => x.bundle_id);
};

test("R63: listBundles answers exactly the bundles membership's viewerPredicate passes, in bundle_id order, each {bundle_id, object_type, current_state, title, last_updated, bundle_sha, route}; an absent or unrecognised viewer gets an empty answer, never an unfiltered one", () => {
  const { w, r, proj } = roster();
  const all = w.rows(`SELECT bundle_id FROM bundles ORDER BY bundle_id`).map((x) => x.bundle_id);
  for (const viewer of VIEWERS) {
    const got = r.listBundles({ viewer });
    assert.ok(Array.isArray(got), String(viewer));
    assert.deepEqual(got.map((b) => b.bundle_id), passes(w, viewer), String(viewer));
    for (const b of got) assert.deepEqual(Object.keys(b).sort(), ROW_KEYS);
  }
  assert.deepEqual(r.listBundles({ viewer: MACHINE }).map((b) => b.bundle_id), all);
  assert.ok(r.listBundles({ viewer: V("ann") }).some((b) => b.bundle_id === proj));
  assert.ok(!r.listBundles({ viewer: V("vera") }).some((b) => b.bundle_id === proj), "hidden answers as absent");
  for (const viewer of [null, undefined, "", "garbage"]) assert.deepEqual(r.listBundles({ viewer }), [], String(viewer));
  assert.deepEqual(r.listBundles(), []);
  /* Each row's columns are the bundle's own. */
  for (const b of r.listBundles({ viewer: MACHINE })) {
    const own = w.row(`SELECT bundle_id, object_type, current_state, title, last_updated, bundle_sha FROM bundles WHERE bundle_id=?`, b.bundle_id);
    const { route, ...rest } = b;
    assert.deepEqual(rest, own);
  }
});

test("R63: route is provenance-routes' routeFinding(object_type, mark) over the bundle's standing route mark (its highest seq, provenance-routes R8), null mark when none; the mark's own columns are never on the row", () => {
  const { w, r } = roster();
  const standing = (id) => {
    const m = w.row(`SELECT seq, at, by, finding, state_at, register_state, undetermined, documents_n
                       FROM provenance_route_marks WHERE bundle_id=? ORDER BY seq DESC LIMIT 1`, id);
    return m ? { seq: m.seq, at: m.at, by: m.by, finding: m.finding, state_at: m.state_at,
                 register_state: m.register_state, undetermined: m.undetermined, documents_n: m.documents_n } : null;
  };
  const rows = r.listBundles({ viewer: MACHINE });
  for (const b of rows) {
    assert.deepEqual(b.route, routeFinding(b.object_type, standing(b.bundle_id)), b.bundle_id);
    for (const k of Object.keys(b)) assert.ok(!k.startsWith("route_"), k);
  }
  const by = Object.fromEntries(rows.map((b) => [b.bundle_id, b.route]));
  assert.equal(by["INFO-2026-0001-a"].finding, "LOOKED_INDETERMINATE", "the highest seq stands");
  assert.equal(by["INFO-2026-0002-b"].finding, "PRESENT");
  assert.equal(by["INFO-2026-0003-c"].finding, "NEVER_LOOKED", "no mark: the question never asked");
  assert.equal(by["INQ-2026-0001-q"].applies, false, "not information: a route does not apply");
  /* The paged arm carries the same rows. */
  assert.deepEqual(r.listBundles({ viewer: MACHINE, limit: 100 }).bundles, rows);
});

test("R63: against the real provenance-routes module, a mark its provenanceRouteAssess appends is the route listBundles answers; negative controls: the superseded mark, another bundle's mark and an unknown finding are not answered as the standing one", () => {
  const { w, r } = roster();
  const routeOf = (id, viewer = MACHINE) => r.listBundles({ viewer }).find((b) => b.bundle_id === id).route;
  /* Before: no mark, the question never asked. */
  assert.equal(routeOf("INFO-2026-0003-c").finding, "NEVER_LOOKED");
  /* provenance-routes' own act (its R4): no register is a route that cannot be shown, recorded as a standing mark. */
  const a = w.routes.provenanceRouteAssess({ bundleId: "INFO-2026-0003-c", author: "member:ann", viewer: MACHINE });
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(a.appended, true);
  const m = w.row(`SELECT seq, at, by, finding, state_at, register_state, undetermined, documents_n
                     FROM provenance_route_marks WHERE bundle_id=? ORDER BY seq DESC LIMIT 1`, "INFO-2026-0003-c");
  const want = routeFinding("information", m);
  for (const viewer of [MACHINE, V("ann"), V("vera")]) assert.deepEqual(routeOf("INFO-2026-0003-c", viewer), want, viewer);
  assert.equal(want.finding, "LOOKED_INDETERMINATE");
  assert.equal(want.register, "absent");
  assert.deepEqual(r.listBundles({ viewer: MACHINE, limit: 50 }).bundles.find((b) => b.bundle_id === "INFO-2026-0003-c").route, want);
  /* Negative control 1: the superseded mark (seq 1) is not the standing one, and the route differs from it. */
  const first = w.row(`SELECT seq, at, by, finding, state_at, register_state, undetermined, documents_n
                         FROM provenance_route_marks WHERE bundle_id='INFO-2026-0001-a' AND seq=1`);
  assert.notDeepEqual(routeOf("INFO-2026-0001-a"), routeFinding("information", first));
  /* Negative control 2: the route is not a constant of the finding: a different mark gives a different route. */
  assert.notDeepEqual(routeOf("INFO-2026-0001-a"), routeOf("INFO-2026-0003-c"));
  /* Negative control 3: a finding provenance-routes' vocabulary does not hold is answered as its `routeFinding` answers
     it (`means` null), never mapped onto a known finding. */
  w.st.sql.exec(`INSERT INTO provenance_route_marks (bundle_id, seq, at, by, finding, state_at, register_state, undetermined,
                   documents_n, documents) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    "INFO-2026-0002-b", 9, "2026-09-27T09:00:00Z", "member:ann", "NOT_A_FINDING", "collected", "readable", 0, 1, "[]");
  const odd = routeOf("INFO-2026-0002-b");
  assert.equal(odd.finding, "NOT_A_FINDING");
  assert.equal(odd.means, null);
  assert.equal(odd.seq, 9);
  /* A hidden bundle's mark rides on no answer. */
  const proj = r.listBundles({ viewer: V("ann") }).find((b) => b.object_type === "project");
  assert.ok(proj && !r.listBundles({ viewer: V("vera") }).some((b) => b.bundle_id === proj.bundle_id));
});

test("R63: type is matched in its canonical form (a legacy alias finds its canonical rows), state exactly, after keeps the ids after it, and the filters combine with the gate", () => {
  const { r, proj } = roster();
  const ids = (f) => r.listBundles({ viewer: MACHINE, ...f }).map((b) => b.bundle_id);
  assert.deepEqual(ids({ type: "information" }), ["INFO-2026-0001-a", "INFO-2026-0002-b", "INFO-2026-0003-c"]);
  for (const alias of ["inquiry", "focus", "problem"]) assert.deepEqual(ids({ type: alias }), ["INQ-2026-0001-q"], alias);
  assert.deepEqual(ids({ type: "project" }), [proj]);
  assert.deepEqual(r.listBundles({ viewer: V("vera"), type: "project" }), []);
  assert.deepEqual(ids({ state: "forming" }), [proj]);
  assert.deepEqual(ids({ state: "Forming" }), [], "state is matched exactly");
  assert.deepEqual(ids({ after: "INFO-2026-0002-b", type: "information" }), ["INFO-2026-0003-c"]);
  assert.deepEqual(ids({ after: "INFO-2026-0001-a" }), ids({}).filter((x) => x > "INFO-2026-0001-a"));
  assert.deepEqual(ids({ type: "information", state: "collected", after: "INFO-2026-0001-a" }), ["INFO-2026-0002-b", "INFO-2026-0003-c"]);
});

test("R63: with no limit, or one that is not a positive number, the answer is the bare array of every row, uncapped; with a limit, at most min(5000, floor(limit)) rows as {bundles, limit, cursor, total}, cursor the last id when the page is full, total the bundles the viewer passes", () => {
  const { w, r } = roster();
  for (let i = 4; i <= 9; i++) w.doc(`INFO-2026-000${i}-x`);
  const every = r.listBundles({ viewer: MACHINE });
  for (const limit of [undefined, null, "", "0", 0, -3, "abc", NaN, "-1"])
    assert.deepEqual(r.listBundles({ viewer: MACHINE, limit }), every, String(limit));
  const p1 = r.listBundles({ viewer: MACHINE, limit: "4.9" });
  assert.deepEqual(Object.keys(p1).sort(), ["bundles", "cursor", "limit", "total"]);
  assert.equal(p1.limit, 4);
  assert.deepEqual(p1.bundles, every.slice(0, 4));
  assert.equal(p1.cursor, every[3].bundle_id);
  assert.equal(p1.total, every.length);
  /* Walking the cursor reaches every row; the last, short page has no cursor. */
  const walked = [...p1.bundles];
  let cur = p1.cursor;
  while (cur) { const p = r.listBundles({ viewer: MACHINE, limit: 4, after: cur }); walked.push(...p.bundles); cur = p.cursor;
                assert.equal(p.total, every.length, "total counts the viewer's bundles, not what is left"); }
  assert.deepEqual(walked, every);
  const big = r.listBundles({ viewer: MACHINE, limit: 100000 });
  assert.equal(big.limit, 5000, "the bound applied is published");
  assert.deepEqual([big.bundles.length, big.cursor], [every.length, null]);
  /* total through the gate: a viewer who may not see the project is never told it exists. */
  for (const viewer of VIEWERS) {
    const p = r.listBundles({ viewer, limit: 2 });
    assert.equal(p.total, passes(w, viewer).length, String(viewer));
    assert.deepEqual(p.bundles.map((b) => b.bundle_id), passes(w, viewer).slice(0, 2));
  }
});

test("R63, R64: neither read writes anything", () => {
  const { w, r } = roster();
  const snap = () => JSON.stringify(["bundles", "provenance_route_marks", "bundle_projection", "bundles_fts", "selections"]
    .map((t) => w.rows(`SELECT * FROM ${t}`)));
  const before = snap();
  r.listBundles({ viewer: MACHINE }); r.listBundles({ viewer: V("vera"), limit: 2 }); r.buildIndex({ viewer: MACHINE });
  assert.equal(snap(), before);
});

test("R64: buildIndex answers {generated, version: 2, bundles}, generated the instant of the answer, bundles every bundle R63's gate passes in id order, each {id, object_type, current_state, title, last_updated, sha256} with sha256 its bundle_sha and no locator; an absent viewer gets no bundle", () => {
  const { w, r, proj } = roster();
  for (const viewer of VIEWERS) {
    const t0 = Date.now();
    const ix = r.buildIndex({ viewer });
    const t1 = Date.now();
    assert.deepEqual(Object.keys(ix).sort(), ["bundles", "generated", "version"]);
    assert.equal(ix.version, 2);
    assert.match(ix.generated, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
    assert.ok(Date.parse(ix.generated) >= t0 && Date.parse(ix.generated) <= t1, "the instant of the answer");
    assert.deepEqual(ix.bundles.map((b) => b.id), passes(w, viewer), String(viewer));
    for (const b of ix.bundles) {
      assert.deepEqual(Object.keys(b).sort(), INDEX_KEYS);
      const own = w.row(`SELECT object_type, current_state, title, last_updated, bundle_sha FROM bundles WHERE bundle_id=?`, b.id);
      assert.deepEqual(b, { id: b.id, object_type: own.object_type, current_state: own.current_state, title: own.title,
                            last_updated: own.last_updated, sha256: own.bundle_sha });
    }
  }
  assert.ok(r.buildIndex({ viewer: V("ann") }).bundles.some((b) => b.id === proj));
  assert.ok(!r.buildIndex({ viewer: V("vera") }).bundles.some((b) => b.id === proj));
  assert.deepEqual(r.buildIndex().bundles, []);
  assert.deepEqual(r.buildIndex({ viewer: null }).bundles, []);
});

test("R65: readImage and readFile answer record-core's readImage(id) and readFile(id, path) only when membership's inSight(id, viewer) is true; otherwise null, exactly as for an absent bundle, an absent viewer seeing nothing", () => {
  const { w, r, proj } = roster();
  const ids = [...w.rows(`SELECT bundle_id FROM bundles`).map((x) => x.bundle_id), "INFO-2026-0099-z", "", null];
  for (const viewer of VIEWERS) for (const id of ids) {
    const sees = !!id && !!viewer && w.membership.inSight(id, viewer) === true;
    const img = r.readImage({ id, viewer });
    const file = r.readFile({ id, path: "bundle.md", viewer });
    if (sees) {
      assert.deepEqual(img, w.record.readImage(id), `${viewer} ${id}`);
      assert.deepEqual(file, w.record.readFile(id, "bundle.md"), `${viewer} ${id}`);
    } else {
      assert.equal(img, null, `${viewer} ${id}`);
      assert.equal(file, null, `${viewer} ${id}`);
    }
  }
  /* Hidden answers exactly as absent. */
  assert.deepEqual([r.readImage({ id: proj, viewer: V("vera") }), r.readFile({ id: proj, path: "bundle.md", viewer: V("vera") })],
                   [r.readImage({ id: "PROJ-2026-0999-z", viewer: V("vera") }), r.readFile({ id: "PROJ-2026-0999-z", path: "bundle.md", viewer: V("vera") })]);
  assert.notEqual(r.readImage({ id: proj, viewer: V("ann") }), null);
  /* A file the bundle does not hold is record-core's null. */
  assert.equal(r.readFile({ id: "INFO-2026-0001-a", path: "nope.md", viewer: MACHINE }), null);
  assert.equal(r.readFile({ id: "INFO-2026-0001-a", path: "n.md", viewer: V("vera") }).text, "notes of INFO-2026-0001-a");
  assert.equal(r.readImage({ id: "INFO-2026-0001-a" }), null);
  assert.equal(r.readFile({ id: "INFO-2026-0001-a", path: "n.md" }), null);
});

test("R66: retrievalRoutes holds list (type, state, after — absent or empty: none —, limit, viewer), index (viewer), image (id, viewer) and file (id, path, viewer), each answering exactly what the service answers for those parameters", () => {
  const { r } = roster();
  const route = (op, qs) => retrievalRoutes(r, new URL(`http://x/?${qs}`), null)[op]();
  for (const viewer of [MACHINE, V("ann"), V("vera"), "garbage"]) {
    const v = encodeURIComponent(viewer);
    assert.deepEqual(route("list", `viewer=${v}`), r.listBundles({ viewer }));
    assert.deepEqual(route("list", `viewer=${v}&after=`), r.listBundles({ viewer }), "an empty after is none");
    assert.deepEqual(route("list", `viewer=${v}&type=focus&state=collected`), r.listBundles({ viewer, type: "focus", state: "collected" }));
    assert.deepEqual(route("list", `viewer=${v}&after=INFO-2026-0002-b&limit=2`), r.listBundles({ viewer, after: "INFO-2026-0002-b", limit: 2 }));
    const ix = route("index", `viewer=${v}`);
    assert.deepEqual(ix.bundles, r.buildIndex({ viewer }).bundles);
    assert.deepEqual(route("image", `id=INFO-2026-0001-a&viewer=${v}`), r.readImage({ id: "INFO-2026-0001-a", viewer }));
    assert.deepEqual(route("file", `id=INFO-2026-0001-a&path=n.md&viewer=${v}`), r.readFile({ id: "INFO-2026-0001-a", path: "n.md", viewer }));
  }
  /* No viewer stamp: nothing. */
  assert.deepEqual(route("list", ""), []);
  assert.deepEqual(route("list", "limit=3"), { bundles: [], limit: 3, cursor: null, total: 0 });
  assert.deepEqual(route("index", "").bundles, []);
  assert.equal(route("image", "id=INFO-2026-0001-a"), null);
  assert.equal(route("file", "id=INFO-2026-0001-a&path=n.md"), null);
});

test("R67: retrieval registers R60's counts(hid) once at start through record-core's registerCounts under indexed, selections and selectionItems, so record-core's counts answer them as retrieval's counts does, for every kind of viewer", async () => {
  const { w, r, proj } = roster();
  assert.deepEqual([...RETRIEVAL_COUNT_KEYS], ["indexed", "selections", "selectionItems"]);
  await r.selectionCreate({ owner: "o", viewer: V("ann"), ids: ["INFO-2026-0001-a", proj] });
  await r.selectionCreate({ owner: "o", viewer: MACHINE, q: "" });
  for (const viewer of VIEWERS) {
    const hid = viewer === undefined ? null : hiddenBundles(viewer);
    const mine = r.counts(hid), theirs = w.record.counts(hid);
    for (const k of RETRIEVAL_COUNT_KEYS) assert.equal(theirs[k], mine[k], `${viewer} ${k}`);
  }
  assert.ok(w.record.counts(hiddenBundles(V("vera"))).selectionItems < w.record.counts(null).selectionItems, "the subtraction is retrieval's");
  /* Once: the factory answers the same instance and registers nothing more; another module cannot report these keys. */
  assert.equal(retrievalOf(w.host), r);
  const again = w.record.registerCounts("retrieval", ["other"], () => ({ other: 1 }));
  assert.equal(again.reason, "COUNTS_DECLARED");
  for (const k of RETRIEVAL_COUNT_KEYS) {
    const clash = w.record.registerCounts("someone-else", [k], () => ({ [k]: 1 }));
    assert.deepEqual([clash.reason, clash.heldBy], ["COUNTS_DECLARED", "retrieval"], k);
  }
});
