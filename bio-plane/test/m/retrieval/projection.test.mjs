/* retrieval: the projection and the text index (R1–R5, R30, R33, R53), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, md, T0, infoMd } from "./fixture.mjs";
import { projectionOf, PROJECTION_COLS, PROJECTION_LIMIT_DEFAULT, PROJECTION_LIMIT_MAX, RETRIEVAL_TABLES, retrievalRoutes,
         PROJECTION_RELATION, PROJECTION_TABLE } from "../../../src/retrieval/index.mjs";
import { textOf, FTS_COLUMNS } from "../../../src/query.mjs";

const ftsRow = (w, id) => {
  const b = w.row(`SELECT fts_id FROM bundle_projection WHERE bundle_id=?`, id);
  return b && b.fts_id != null ? w.row(`SELECT rowid, ${FTS_COLUMNS.join(", ")}, bundle_id FROM bundles_fts WHERE rowid=?`, b.fts_id) : null;
};
const projRow = (w, id) => w.row(`SELECT ${PROJECTION_COLS.join(", ")} FROM bundle_projection WHERE bundle_id=?`, id);

test("R1: after a promotion the projection equals projectionOf(bundle.md) and the index row equals textOf(files), in the same transaction; a revision replaces the bundle's own row under the key allocated once", () => {
  const w = world();
  const files = [{ path: "notes.md", text: "water rates rose in the flats" }];
  w.doc("INFO-1", { source_status: "live", source: { locator: "https://example.org/a", authority: "the city" } }, { files });
  const md1 = w.row(`SELECT content FROM files WHERE bundle_id='INFO-1' AND path='bundle.md'`).content;
  assert.deepEqual(projRow(w, "INFO-1"), projectionOf(md1, w.clock.now));
  const t1 = textOf("INFO-1", [{ path: "bundle.md", text: md1 }, ...files]);
  const r1 = ftsRow(w, "INFO-1");
  for (const c of FTS_COLUMNS) assert.equal(r1[c], t1[c], c);
  assert.equal(r1.bundle_id, "INFO-1");
  const key = r1.rowid;
  /* A revision: new text, same key; exactly one index row for the bundle. */
  w.doc("INFO-1", { source_status: "withdrawn" }, { files: [{ path: "notes.md", text: "sewer bonds instead" }] });
  const r2 = ftsRow(w, "INFO-1");
  assert.equal(r2.rowid, key);
  assert.match(r2.body, /sewer bonds/);
  assert.doesNotMatch(r2.body, /water rates/);
  assert.equal(w.row(`SELECT COUNT(*) n FROM bundles_fts WHERE bundle_id='INFO-1'`).n, 1);
  assert.equal(projRow(w, "INFO-1").source_status, "withdrawn");
  /* The same transaction: a promotion refused after the projection ran leaves neither changed (R30's first half). */
  w.promotion.registerStep("later-refuser", { project: () => { throw new Error("refuse after the projection"); } });
  const before = [projRow(w, "INFO-1"), ftsRow(w, "INFO-1")];
  const head = w.row(`SELECT bundle_sha FROM bundles WHERE bundle_id='INFO-1'`).bundle_sha;
  const refused = (() => { try { return w.promotion.promote({ bundleId: "INFO-1", base: head, snapKey: "kx", author: V("ann"),
    files: [{ path: "bundle.md", text: infoMd("INFO-1", { source_status: "gone" }) }, { path: "notes.md", text: "zebra" }],
    meta: { object_type: "information" } }); } catch (e) { return { threw: e.message }; } })();
  assert.notEqual(refused.ok, true);
  assert.deepEqual([projRow(w, "INFO-1"), ftsRow(w, "INFO-1")], before);
});

test("R2: projectionOf is pure — each column from the frontmatter, the re-evaluation record or legacy boolean, fm_json, and every column null (never a guess) when the frontmatter does not parse", () => {
  const text = md({ id: "INFO-9", object_type: "information", schema: "information@2", title: "t", current_state: "collected",
    source_status: "live", content_hash: "abc", annotations_open: 3,
    produced_by: { mode: "manual", capability_tier: "t2" },
    source: { locator: "https://example.org/x", authority: "the board", retrieved: "2026-09-01" },
    monitoring: { enabled: true, frequency: "weekly", last_checked: "2026-09-20" },
    reeval_pending: { flag: true, since: "2026-09-02", source: "INFO-8" } });
  const p = projectionOf(text, 0);
  assert.deepEqual(projectionOf(text, 0), p, "pure: the same bytes answer the same projection");
  assert.deepEqual({ ...p, fm_json: undefined }, {
    schema_id: "information@2", produced_mode: "manual", capability_tier: "t2", source_locator: "https://example.org/x",
    source_authority: "the board", source_retrieved: "2026-09-01", source_status: "live", content_hash: "abc",
    monitor_enabled: 1, monitor_frequency: "weekly", monitor_last_checked: "2026-09-20", annotations_open: 3,
    reeval_flag: 1, reeval_since: "2026-09-02", reeval_source: "INFO-8",
    action_kind: null, action_risk_tier: null, action_counterparty_state: null, action_resolution: null,
    action_clock_next: null, action_clock_overdue: null, fm_json: undefined });
  assert.equal(JSON.parse(p.fm_json).schema, "information@2");
  /* The legacy boolean form of the re-evaluation flag. */
  const legacy = projectionOf(md({ id: "INFO-9", object_type: "information", reeval_pending: false }), 0);
  assert.deepEqual([legacy.reeval_flag, legacy.reeval_since, legacy.reeval_source], [0, null, null]);
  /* Frontmatter the catalogue's parser cannot read (no fence, a fence never closed) and a non-string: every column null. */
  for (const bad of ["no frontmatter at all", "---\ntitle: never closed\n", null, 42]) {
    const q = projectionOf(bad, 0);
    assert.deepEqual(Object.keys(q), [...PROJECTION_COLS]);
    assert.ok(Object.values(q).every((v) => v === null), JSON.stringify(bad));
  }
});

test("R53: the six action columns are what the registered actionFacts answers, only for a bundle whose type normalises to action; a second registration is refused FACTS_DECLARED; with none registered the six are null", () => {
  const w = world();
  const action = md({ id: "ACTN-1", object_type: "action", title: "a request", action_kind: "records_request" });
  const six = ["action_kind", "action_risk_tier", "action_counterparty_state", "action_resolution", "action_clock_next", "action_clock_overdue"];
  /* Nothing registered: null. */
  assert.ok(six.every((c) => w.retrieval.projectionOf(action, 0)[c] === null));
  const asked = [];
  const r = w.retrieval.registerActionFacts("actions", (bundleMd, nowMs) => {
    asked.push(nowMs);
    return { kind: "records_request", risk_tier: 2, counterparty_state: "awaiting", resolution: "open",
             clock_next: "2026-10-01", clock_overdue: nowMs > Date.parse("2026-10-02") };
  });
  assert.equal(r.ok, true);
  assert.equal(w.retrieval.registerActionFacts("other", () => ({})).reason, "FACTS_DECLARED");
  const early = w.retrieval.projectionOf(action, Date.parse("2026-09-01"));
  assert.deepEqual(six.map((c) => early[c]), ["records_request", 2, "awaiting", "open", "2026-10-01", 0]);
  assert.equal(w.retrieval.projectionOf(action, Date.parse("2026-10-09")).action_clock_overdue, 1);
  /* A legacy spelling that normalises to action is asked too; any other type is not. */
  asked.length = 0;
  w.retrieval.projectionOf(md({ id: "INFO-1", object_type: "information" }), 0);
  assert.equal(asked.length, 0);
  /* A provider that throws leaves the six null rather than failing the promotion. */
  const w2 = world();
  w2.retrieval.registerActionFacts("actions", () => { throw new Error("boom"); });
  assert.ok(six.every((c) => w2.retrieval.projectionOf(action, 0)[c] === null));
  /* The promotion writes what the provider answers at the module's clock. */
  w.doc("ACTN-2026-0001", { object_type: "action", title: "an action", action_kind: "records_request" });
  assert.equal(projRow(w, "ACTN-2026-0001").action_kind, "records_request");
});

test("R3: reproject re-derives rows lacking a projection or an index, at most `limit` (500 by default, clamped 1–5,000) per call, and answers {reprojected, reindexed, limit, remaining}; the module's start runs it at 500", () => {
  const w = world();
  for (let i = 1; i <= 5; i++) w.doc(`INFO-${i}`, {}, { files: [{ path: "n.md", text: `word${i}` }] });
  w.retrieval.projectionClear({});
  assert.equal(w.row(`SELECT COUNT(*) n FROM bundle_projection WHERE fm_json IS NULL AND fts_id IS NULL`).n, 5);
  assert.deepEqual(w.retrieval.reproject({ limit: 2 }), { reprojected: 2, reindexed: 2, limit: 2, remaining: 3 });
  assert.equal(w.retrieval.reproject({ limit: 0 }).limit, 500);
  assert.equal(w.retrieval.reproject({ limit: 99999 }).limit, 5000);
  assert.equal(w.retrieval.reproject({ limit: "x" }).limit, 500);
  assert.equal(w.retrieval.reproject({ limit: -3 }).limit, 1);
  assert.deepEqual(w.retrieval.reproject({}), { reprojected: 0, reindexed: 0, limit: 500, remaining: 0 });
  for (let i = 1; i <= 5; i++) {
    const md1 = w.row(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, `INFO-${i}`).content;
    assert.deepEqual(projRow(w, `INFO-${i}`), projectionOf(md1, w.clock.now));
    assert.match(ftsRow(w, `INFO-${i}`).body, new RegExp(`word${i}`));
  }
  /* The start: migrate() runs the bounded pass at 500. */
  w.retrieval.projectionClear({ bundleId: "INFO-3" });
  assert.deepEqual(w.retrieval.migrate(), { reprojected: 1, reindexed: 1, limit: 500, remaining: 0 });
});

test("R4: projectionPlan shows the filtered columns' indexes are used; projectionClear nulls a projection and by default its index row, one bundle or all", () => {
  const w = world();
  w.doc("INFO-1"); w.doc("INFO-2");
  const plan = w.retrieval.projectionPlan();
  assert.deepEqual(Object.keys(plan), ["source_status", "produced_mode", "schema_id", "reeval_flag"]);
  for (const [c, rows] of Object.entries(plan)) assert.ok(rows.some((d) => d.includes(`bundle_projection_${c}`)), `${c}: ${rows}`);
  assert.deepEqual(w.retrieval.projectionClear({ bundleId: "INFO-1", text: false }), { ok: true, scope: "INFO-1", text: false });
  assert.equal(projRow(w, "INFO-1").fm_json, null);
  assert.ok(ftsRow(w, "INFO-1"), "text: false keeps the index row");
  w.retrieval.projectionClear({ bundleId: "INFO-1" });
  assert.equal(ftsRow(w, "INFO-1"), null);
  assert.notEqual(projRow(w, "INFO-2").fm_json, null);
  assert.deepEqual(w.retrieval.projectionClear({}), { ok: true, scope: "ALL", text: true });
  assert.equal(w.count("bundles_fts"), 0);
  assert.equal(w.row(`SELECT COUNT(*) n FROM bundle_projection WHERE fm_json IS NOT NULL OR fts_id IS NOT NULL`).n, 0);
});

test("R5: projection with an id answers the row or null (absent or hidden alike); without, {bundles, limit, cursor, total} in id order, limit clamped (200, at most 5,000), total counted through the gate, jsonPath/jsonEquals filtering", () => {
  const w = world();
  for (let i = 1; i <= 4; i++) w.doc(`INFO-${i}`, { source_status: i % 2 ? "live" : "gone" });
  const proj = w.project("Hidden Fund", "ann");
  const one = w.retrieval.projection({ bundleId: "INFO-2", viewer: V("vera") });
  assert.equal(one.bundle_id, "INFO-2");
  assert.equal(one.source_status, "gone");
  for (const c of PROJECTION_COLS) assert.ok(Object.prototype.hasOwnProperty.call(one, c), c);
  assert.equal(w.retrieval.projection({ bundleId: proj, viewer: V("vera") }), null, "hidden");
  assert.equal(w.retrieval.projection({ bundleId: "NO-SUCH", viewer: V("vera") }), null, "absent");
  assert.equal(w.retrieval.projection({ bundleId: "INFO-1", viewer: null }), null, "no viewer sees nothing");
  assert.equal(w.retrieval.projection({ bundleId: proj, viewer: V("ann") }).bundle_id, proj);
  const all = w.retrieval.projection({ viewer: V("vera") });
  assert.deepEqual(all.bundles.map((b) => b.bundle_id), ["INFO-1", "INFO-2", "INFO-3", "INFO-4"]);
  assert.deepEqual([all.limit, all.cursor, all.total], [PROJECTION_LIMIT_DEFAULT, null, 4]);
  assert.equal(w.retrieval.projection({ viewer: V("ann") }).total, 5);
  const page = w.retrieval.projection({ viewer: V("ann"), limit: 2 });
  assert.deepEqual([page.bundles.length, page.limit, page.cursor, page.total], [2, 2, "INFO-2", 5]);
  const next = w.retrieval.projection({ viewer: V("ann"), limit: 2, after: page.cursor });
  assert.deepEqual(next.bundles.map((b) => b.bundle_id), ["INFO-3", "INFO-4"]);
  assert.equal(w.retrieval.projection({ viewer: V("ann"), limit: 999999 }).limit, PROJECTION_LIMIT_MAX);
  const live = w.retrieval.projection({ viewer: V("vera"), jsonPath: "$.source_status", jsonEquals: "live" });
  assert.deepEqual([live.bundles.map((b) => b.bundle_id), live.total], [["INFO-1", "INFO-3"], 2]);
});

test("R5, R56: the single-bundle answer carries the registered decorations, in the modules' order, and a decoration that throws adds nothing; a second registration is DECORATION_DECLARED, a malformed one DECORATION_MALFORMED", async () => {
  const w = world();
  w.doc("INFO-1");
  assert.equal(w.retrieval.registerProjectionDecoration("actions", (row) => ({ action: { of: row.bundle_id } })).ok, true);
  w.retrieval.registerProjectionDecoration("ai-runs", async () => ({ surfaced_in: { recorded: false } }));
  w.retrieval.registerProjectionDecoration("broken", () => { throw new Error("x"); });
  assert.equal(w.retrieval.registerProjectionDecoration("actions", () => ({})).reason, "DECORATION_DECLARED");
  assert.equal(w.retrieval.registerProjectionDecoration("inquiry", null).reason, "DECORATION_MALFORMED");
  assert.equal(w.retrieval.registerProjectionDecoration("", () => ({})).reason, "DECORATION_MALFORMED");
  const one = await w.retrieval.projection({ bundleId: "INFO-1", viewer: V("vera") });
  assert.deepEqual([one.bundle_id, one.action, one.surfaced_in], ["INFO-1", { of: "INFO-1" }, { recorded: false }]);
  assert.equal(w.retrieval.projection({ viewer: V("vera") }).bundles[0].action, undefined, "never on the list arms");
});

test("R30: the projection and the index are derived: both are rebuilt from the stored files alone after being cleared", () => {
  const w = world();
  w.doc("INFO-1", { source_status: "live" }, { files: [{ path: "a.md", text: "alpha" }, { path: "b.txt", text: "beta" }] });
  const before = [projRow(w, "INFO-1"), ftsRow(w, "INFO-1")];
  w.retrieval.projectionClear({ bundleId: "INFO-1" });
  w.retrieval.reproject({});
  const after = [projRow(w, "INFO-1"), ftsRow(w, "INFO-1")];
  assert.deepEqual({ ...after[0] }, { ...before[0] });
  for (const c of [...FTS_COLUMNS, "bundle_id"]) assert.equal(after[1][c], before[1][c], c);
  assert.equal(w.retrieval.searchIndexCheck({ viewer: MACHINE }).ok, true);
});

test("R33, R61, R71: bundle_projection, bundle_terms, selections, selection_items and bundles_fts are declared to record-core; a bundle's purge removes its projection and index rows, and the whole-store purge clears all five", () => {
  const w = world();
  assert.deepEqual([...RETRIEVAL_TABLES].sort(), ["bundle_projection", "bundle_terms", "bundles_fts", "selection_items", "selections"]);
  /* Declared: a second declaration of any of them is refused as another module's. */
  for (const t of RETRIEVAL_TABLES) {
    const r = w.record.declarePurge("someone-else", [t]);
    assert.deepEqual([r.reason, r.declaredBy], ["TABLE_DECLARED", "retrieval"], t);
  }
  w.doc("INFO-1", {}, { files: [{ path: "n.md", text: "one" }] });
  w.doc("INFO-2", {}, { files: [{ path: "n.md", text: "two" }] });
  return w.retrieval.selectionCreate({ owner: "o", viewer: V("ann"), ids: ["INFO-1", "INFO-2"] }).then((sel) => {
    const one = w.record.purge({ bundleId: "INFO-1" });
    assert.equal(one.removed.bundles_fts, 1);
    assert.equal(one.removed.bundle_projection, 1);
    assert.equal(projRow(w, "INFO-1"), null);
    assert.notEqual(projRow(w, "INFO-2"), null);
    assert.equal(ftsRow(w, "INFO-2") !== null, true);
    assert.equal(w.row(`SELECT COUNT(*) n FROM bundles_fts WHERE bundle_id='INFO-1'`).n, 0);
    /* The selection survives a bundle's purge, so the next resolve names the purged item (R19). */
    const r = w.retrieval.selectionResolve({ handle: sel.handle, owner: "o", viewer: V("ann") });
    assert.deepEqual(r.drift.purged, ["INFO-1"]);
    assert.equal(w.retrieval.searchIndexCheck({ viewer: MACHINE }).orphans.length, 0, "no orphan left behind");
    const all = w.record.purge({});
    assert.deepEqual([all.removed.selections, all.removed.selection_items, all.removed.bundles_fts, all.removed.bundle_projection],
      [1, 2, 1, 1]);
    assert.deepEqual(RETRIEVAL_TABLES.map((t) => w.count(t)), [0, 0, 0, 0, 0]);
  });
});

test("R33: an older store's text index (no bundle key) is rebuilt in place at start: every row keeps its key and text, and gains its bundle", () => {
  const w = world();
  w.doc("INFO-1", {}, { files: [{ path: "n.md", text: "kept text" }] });
  const before = ftsRow(w, "INFO-1");
  /* The old shape: the five columns only. */
  w.st.db.exec(`DROP TABLE bundles_fts`);
  w.st.db.exec(`CREATE VIRTUAL TABLE bundles_fts USING fts5(${FTS_COLUMNS.join(", ")}, tokenize='unicode61')`);
  w.st.sql.exec(`INSERT INTO bundles_fts (rowid, ${FTS_COLUMNS.join(", ")}) VALUES (?, ${FTS_COLUMNS.map(() => "?").join(", ")})`,
    before.rowid, ...FTS_COLUMNS.map((c) => before[c]));
  w.retrieval.migrate();
  const after = ftsRow(w, "INFO-1");
  assert.deepEqual({ ...after }, { ...before });
  assert.equal(w.retrieval.search({ q: "kept", viewer: V("ann") }).total, 1);
});

test("R5, R56: decorations run in the modules' total order, whatever order they registered in", async () => {
  const w = world();
  w.doc("INFO-1");
  /* The fixture's instance was made without an order; a fresh one over the same storage takes the order given. */
  const { Retrieval } = await import("../../../src/retrieval/index.mjs");
  const r = new Retrieval({ storage: w.st, record: w.record, membership: w.membership, promotion: w.promotion,
    extraction: w.extraction, observation: w.observation, order: ["actions", "inquiry", "ai-runs"] });
  r.registerProjectionDecoration("ai-runs", () => ({ who: "ai-runs" }));
  r.registerProjectionDecoration("actions", () => ({ who: "actions", first: true }));
  const one = r.projection({ bundleId: "INFO-1", viewer: V("vera") });
  assert.equal(one.who, "ai-runs", "the later module's key is applied last");
  assert.equal(one.first, true);
});

test("R58: migrate() creates the projection table, its indexes, the keyed text index and the selection tables and backfills, idempotently; retrievalRoutes answers every op of R1–R54 and R63–R65 for the router", async () => {
  const w = world();
  w.doc("INFO-1", { source_status: "live" }, { files: [{ path: "n.md", text: "hello water" }] });
  const cols = w.rows(`PRAGMA table_info(bundle_projection)`).map((c) => c.name);
  for (const c of ["bundle_id", ...PROJECTION_COLS, "fts_id"]) assert.ok(cols.includes(c), c);
  assert.ok(w.rows(`PRAGMA table_info(bundles_fts)`).some((c) => c.name === "bundle_id"));
  assert.ok(w.rows(`SELECT name FROM sqlite_master WHERE type='index'`).some((r) => r.name === "bundle_projection_source_status"));
  for (const t of ["selections", "selection_items"]) assert.equal(w.rows(`PRAGMA table_info(${t})`).length > 0, true, t);
  const before = JSON.stringify(w.rows(`SELECT sql FROM sqlite_master ORDER BY name`));
  assert.deepEqual(w.retrieval.migrate(), { reprojected: 0, reindexed: 0, limit: 500, remaining: 0 });
  assert.equal(JSON.stringify(w.rows(`SELECT sql FROM sqlite_master ORDER BY name`)), before, "idempotent");
  /* The routes: each op answers what the service answers, with the stamps from the query. */
  const url = (op, q = "") => new URL(`http://x/${op}?${q}`);
  const routes = (u, body) => retrievalRoutes(w.retrieval, u, body);
  assert.deepEqual(Object.keys(routes(url("x"))).sort(), ["contentaxis", "file", "frontier", "image", "index", "list", "meaningrows",
    "projection", "projectionclear", "projectionplan", "reproject", "search", "searchfields", "searchindexcheck", "select", "selection",
    "selectionlist", "selectionrelease"]);
  assert.equal(routes(url("search", "q=water&viewer=member:vera")).search().total, 1);
  assert.equal(routes(url("search", "q=water")).search().total, 0, "no viewer stamp, nothing");
  assert.equal(routes(url("projection", "id=INFO-1&viewer=member:vera")).projection().source_status, "live");
  assert.equal(routes(url("meaningrows", "rows=leg&viewer=member:vera")).meaningrows().ok, true);
  assert.deepEqual(routes(url("searchfields")).searchfields(), w.retrieval.searchFields());
  assert.equal(routes(url("searchindexcheck", `viewer=${MACHINE}`)).searchindexcheck().ok, true);
  assert.equal(routes(url("frontier", "level=content&viewer=member:vera&limit=3")).frontier().limit, 3);
  assert.equal(routes(url("contentaxis", "viewer=member:vera")).contentaxis().found, false);
  const sel = await routes(url("select", "owner=o&viewer=member:vera"), { ids: ["INFO-1"] }).select();
  assert.deepEqual([sel.kind, sel.n], ["enumerated", 1]);
  const res = routes(url("selection", `handle=${sel.handle}&owner=o&viewer=member:vera&weight=refuse`)).selection();
  assert.deepEqual([res.ok, res.weight], [true, "refuse"]);
  assert.equal(routes(url("selectionlist", "owner=o&viewer=member:vera")).selectionlist().selections.length, 1);
  assert.equal(routes(url("selectionrelease", "owner=o")).selectionrelease().released, 1);
  assert.equal(routes(url("projectionclear"), { bundleId: "INFO-1" }).projectionclear().scope, "INFO-1");
  assert.equal(routes(url("reproject"), { limit: 3 }).reproject().reprojected, 1);
  assert.deepEqual(Object.keys(routes(url("projectionplan")).projectionplan()), ["source_status", "produced_mode", "schema_id", "reeval_flag"]);
  /* R63–R65's four (R66 tests their parameters whole, `roster.test.mjs`). */
  assert.deepEqual(routes(url("list", "viewer=member:vera")).list().map((b) => b.bundle_id), ["INFO-1"]);
  assert.deepEqual(routes(url("index", "viewer=member:vera")).index().bundles.map((b) => b.id), ["INFO-1"]);
  assert.equal(routes(url("image", "id=INFO-1&viewer=member:vera")).image()["n.md"], "hello water");
  assert.equal(routes(url("file", "id=INFO-1&path=n.md&viewer=member:vera")).file().text, "hello water");
});

const MOVED = [...PROJECTION_COLS, "fts_id"];

test("R61: the projection columns of R2 and fts_id are held in bundle_projection, keyed by bundle_id, declared to record-core's purge by that key, never on bundles; the module names the relation to the compiler and is its only writer", () => {
  const w = world();
  assert.deepEqual({ ...PROJECTION_RELATION }, { table: "bundle_projection", key: "bundle_id" });
  assert.equal(PROJECTION_TABLE, "bundle_projection");
  /* The table: keyed by bundle_id, every R2 column and the index key. */
  const info = w.rows(`PRAGMA table_info(bundle_projection)`);
  assert.deepEqual(info.filter((c) => c.pk).map((c) => c.name), ["bundle_id"]);
  assert.deepEqual(info.map((c) => c.name).sort(), ["bundle_id", ...MOVED].sort());
  /* Not on bundles, and no index there names one. */
  const onBundles = w.rows(`PRAGMA table_info(bundles)`).map((c) => c.name);
  for (const c of MOVED) assert.ok(!onBundles.includes(c), c);
  assert.ok(!w.rows(`SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='bundles'`)
    .some((r) => MOVED.some((c) => r.name === `bundles_${c}`)));
  /* Declared to purge by bundle_id (R33's test removes a bundle's row by it); a second declaration is another module's. */
  assert.deepEqual([w.record.declarePurge("someone-else", ["bundle_projection"]).reason], ["TABLE_DECLARED"]);
  /* The one writer: a promotion writes the bundle's row, a revision replaces it in place under the same key. */
  w.doc("INFO-1", { source_status: "live", source: { locator: "https://example.org/a" } }, { files: [{ path: "n.md", text: "rates" }] });
  const first = w.row(`SELECT * FROM bundle_projection WHERE bundle_id='INFO-1'`);
  assert.equal(first.source_status, "live");
  w.doc("INFO-1", { source_status: "withdrawn" }, { files: [{ path: "n.md", text: "bonds" }] });
  const second = w.row(`SELECT * FROM bundle_projection WHERE bundle_id='INFO-1'`);
  assert.deepEqual([second.source_status, second.fts_id], ["withdrawn", first.fts_id]);
  assert.equal(w.count("bundle_projection"), 1);
  /* The compiler reads it through the relation: a projection field filters, sorts and facets with the columns absent
     from bundles, and a page's hit carries the projected columns. */
  w.doc("INFO-2", { source_status: "live" }, { files: [{ path: "n.md", text: "bonds too" }] });
  const s = w.retrieval.search({ q: "bonds status:live", viewer: V("vera"), facets: ["status"] });
  assert.deepEqual([s.total, s.hits.map((h) => h.bundle_id), s.hits[0].source_status], [1, ["INFO-2"], "live"]);
  assert.deepEqual(s.facets.status, [{ value: "live", n: 1 }]);
  assert.deepEqual(w.retrieval.search({ q: "status:withdrawn", viewer: V("vera"), mode: "ids" }).ids, ["INFO-1"]);
  assert.equal(s.query.warnings.some((x) => /projection/.test(x)), false, "the relation is accepted as named");
});

test("R58, R61: an older store's projection columns on bundles are moved into bundle_projection once, with their values, and leave bundles with their indexes; a row already moved is kept; a second start does nothing", () => {
  const w = world();
  w.doc("INFO-1", { source_status: "live" }, { files: [{ path: "n.md", text: "water" }] });
  w.doc("INFO-2", { source_status: "gone" }, { files: [{ path: "n.md", text: "sewer" }] });
  const was = w.rows(`SELECT * FROM bundle_projection ORDER BY bundle_id`);
  /* The old arrangement: the columns and their indexes on bundles, holding the values; INFO-1's row not yet moved,
     INFO-2's already moved (a newer value than the one bundles holds). */
  const decl = new Map([["INTEGER", ["monitor_enabled", "annotations_open", "reeval_flag", "fts_id", "action_risk_tier", "action_clock_overdue"]]]);
  for (const c of MOVED) w.st.db.exec(`ALTER TABLE bundles ADD COLUMN ${c} ${decl.get("INTEGER").includes(c) ? "INTEGER" : "TEXT"}`);
  for (const c of ["source_status", "schema_id", "action_clock_overdue"]) w.st.db.exec(`CREATE INDEX bundles_${c} ON bundles(${c})`);
  w.st.db.exec(`CREATE UNIQUE INDEX bundles_fts_id ON bundles(fts_id)`);
  for (const r of was)
    w.st.sql.exec(`UPDATE bundles SET ${MOVED.map((c) => `${c}=?`).join(", ")} WHERE bundle_id=?`,
      ...MOVED.map((c) => (r.bundle_id === "INFO-2" && c === "source_status" ? "stale" : r[c])), r.bundle_id);
  w.st.sql.exec(`DELETE FROM bundle_projection WHERE bundle_id='INFO-1'`);
  const moved = w.retrieval.migrate();
  assert.deepEqual(moved, { reprojected: 0, reindexed: 0, limit: 500, remaining: 0 });
  assert.deepEqual(w.rows(`SELECT * FROM bundle_projection ORDER BY bundle_id`), was, "values moved; INFO-2's row kept");
  const cols = w.rows(`PRAGMA table_info(bundles)`).map((c) => c.name);
  for (const c of MOVED) assert.ok(!cols.includes(c), c);
  assert.deepEqual(w.rows(`SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'bundles_%' AND tbl_name='bundles'`)
    .map((r) => r.name).filter((n) => MOVED.some((c) => n === `bundles_${c}`)), []);
  assert.equal(w.retrieval.search({ q: "water", viewer: V("vera") }).total, 1);
  assert.equal(w.retrieval.searchIndexCheck({ viewer: MACHINE }).ok, true);
  const schema = JSON.stringify(w.rows(`SELECT sql FROM sqlite_master ORDER BY name`));
  w.retrieval.migrate();
  assert.equal(JSON.stringify(w.rows(`SELECT sql FROM sqlite_master ORDER BY name`)), schema, "idempotent");
  assert.deepEqual(w.rows(`SELECT * FROM bundle_projection ORDER BY bundle_id`), was);
});

test("R3, R61: a bundle with no projection row at all is stale on both counts and reproject writes it", () => {
  const w = world();
  w.doc("INFO-1", {}, { files: [{ path: "n.md", text: "gull" }] });
  const kept = w.row(`SELECT * FROM bundle_projection WHERE bundle_id='INFO-1'`);
  w.st.sql.exec(`DELETE FROM bundles_fts`);
  w.st.sql.exec(`DELETE FROM bundle_projection`);
  assert.deepEqual(w.retrieval.reproject({}), { reprojected: 1, reindexed: 1, limit: 500, remaining: 0 });
  assert.deepEqual(w.row(`SELECT * FROM bundle_projection WHERE bundle_id='INFO-1'`), kept);
  assert.equal(w.retrieval.search({ q: "gull", viewer: V("vera") }).total, 1);
});

test("R1, R17: a new bundle's index key is never an orphan's, so the orphan stays visible to the check", () => {
  const w = world();
  w.doc("INFO-1", {}, { files: [{ path: "n.md", text: "one" }] });
  w.st.sql.exec(`INSERT INTO bundles_fts (rowid, ${FTS_COLUMNS.join(", ")}) VALUES (50, 't', 'orphan text', 'm', 'l', 'a')`);
  w.doc("INFO-2", {}, { files: [{ path: "n.md", text: "two" }] });
  assert.equal(w.row(`SELECT fts_id FROM bundle_projection WHERE bundle_id='INFO-2'`).fts_id, 51);
  assert.deepEqual(w.retrieval.searchIndexCheck({ viewer: MACHINE }).orphans, [50]);
});
