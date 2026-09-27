import { test } from "node:test";
import assert from "node:assert/strict";
import { world, everyStatement } from "./fixture.mjs";
import { compile, cachedNotes, viewerPredicate, GATE_MARK, FIELDS, MEANING, PROVENANCE_COLS, DEFAULT_FACETS,
         LIMIT_DEFAULT, LIMIT_MAX, IDS_MAX, MEANING_LIMIT_DEFAULT, MEANING_LIMIT_MAX, MEANING_AXIS_CAP,
         RANK_ATOMS_MAX } from "../../../src/query.mjs";
import * as membership from "../../../src/membership/index.mjs";

const V = "class:member";
const sorted = (a) => [...a].sort();

/* Every shape of every arm, for the walks below. */
const QUERIES = ["", "water", "water -main state:open", "leg:hunch", "resolves:>=B", "concerns:ENT-1",
  "content:ocr content:cap<C", "passage:culvert", "NEAR(a b, 3) OR created:>2026-01-01 has:capture fm:a.b=c",
  "(title:x OR locator:y) -authority:z sort:capture"];
const ROWS = [null, "leg", "resolves", "concerns", "content", "passage"];

test("R7 no member input enters a statement's text: for every value a member can type, the SQL is byte-identical and only args move", () => {
  const hostile = ["x'); DROP TABLE bundles; --", "'; SELECT 1; --", "a\u0000b", "*/ 1=1 /*", "é‮ö", "' OR 1=1 --"];
  const shapes = (q, rows) => everyStatement(compile({ q, viewer: V, rows, facets: ["type", "state"] }))
    .map(([k, s]) => [k, s.sql]);
  const templates = [
    (v) => ["plain", `"${v}"`], (v) => ["text", `text:"${v}"`], (v) => ["title", `title:"${v}"`],
    (v) => ["state", `state:"${v}"`], (v) => ["cmp", `created:>"${v}"`], (v) => ["fm", `fm:a.b="${v}"`],
    (v) => ["leg", `leg:ground="${v}"`], (v) => ["legcmp", `leg:grade>="${v}"`], (v) => ["concerns", `concerns:"${v}"`],
    (v) => ["minted", `content:minted="${v}"`], (v) => ["passage", `passage:"${v}"`],
    (v) => ["near", `NEAR("${v}" "${v}2", 5)`], (v) => ["ids", "water"],
  ];
  for (const rows of ROWS)
    for (const t of templates) {
      const [name] = t("seed");
      const baseQ = t("seed")[1], base = shapes(baseQ, rows);
      for (const h of hostile) {
        const q = t(h)[1];
        const got = shapes(q, rows);
        assert.deepEqual(got, base, `${name} rows=${rows}: SQL moved for ${JSON.stringify(h)}`);
        for (const [, sql] of got) assert.ok(!sql.includes(h), `${name}: member text in SQL`);
      }
    }
  /* ids and sort parameters: ids are bound, and ORDER BY takes columns only from SORTABLE. */
  const a = compile({ q: "", viewer: V, ids: ["x'; --"], sort: "title" }).statements.page();
  const b = compile({ q: "", viewer: V, ids: ["y"], sort: "title" }).statements.page();
  assert.equal(a.sql, b.sql);
  const c = compile({ q: "", viewer: V, sort: "last_updated; DROP TABLE x" }).statements.page();
  assert.ok(!c.sql.includes("DROP"));
  for (const [f, col] of Object.entries(FIELDS).map(([n, x]) => [n, x.col]))
    assert.ok(compile({ q: "", viewer: V, sort: f }).statements.page().sql.includes(`b.${col}`));
});

test("R8 every statement of every shape carries the gate's mark and takes its visibility from one call of the gate", () => {
  for (const viewer of [V, "member:ann", "admin", "class:ai", null, "nobody", "member:"])
    for (const q of QUERIES)
      for (const rows of ROWS) {
        const plan = compile({ q, viewer, rows });
        const gate = viewerPredicate(viewer);
        assert.equal(plan.gate, gate.scope);
        for (const [shape, s] of everyStatement(plan)) {
          const marks = s.sql.split(GATE_MARK).length - 1;
          const uses = s.sql.split(gate.sql).length - 1;
          assert.ok(marks >= 1, `${shape} has no gate mark`);
          assert.equal(marks, uses, `${shape} (${q}) carries a mark that is not the gate's`);
        }
      }
  /* An absent or unrecognised viewer compiles to the deny predicate: the answer is empty, never unfiltered. */
  const w = world();
  w.bundle("A", { body: "water" });
  w.insert("inquiry_basis", { bundle_id: "A", ord: 0, grade_source: "hunch" });
  for (const viewer of [null, undefined, "", "nobody", "member:", "class:root", 7]) {
    const plan = compile({ q: "water", viewer, rows: "leg" });
    assert.equal(plan.gate, "DENY");
    for (const [shape, s] of everyStatement(plan)) {
      const rows = w.all(s);
      const empty = rows.length === 0 || rows.every((r) => Object.values(r).every((v) => v === 0 || v === null));
      assert.ok(empty, `${shape} answered a denied viewer: ${JSON.stringify(rows)}`);
    }
  }
  assert.equal(w.ids({ q: "water", viewer: V }).length, 1, "the same query answers a machine credential");
});

test("R9 viewerPredicate and GATE_MARK are membership's, re-exported unchanged", () => {
  assert.equal(viewerPredicate, membership.viewerPredicate);
  assert.equal(GATE_MARK, membership.GATE_MARK);
});

test("R10 order: relevance with a positive text term, else updated descending; bundle_id last; nulls last; the sort parameter outranks sort:", () => {
  const w = world();
  w.bundle("B", { body: "water water water", last_updated: "2026-01-02", criticality: null });
  w.bundle("A", { body: "water", last_updated: "2026-01-02", criticality: "high" });
  w.bundle("C", { body: "dry", last_updated: "2026-03-01", criticality: "low" });
  w.bundle("D", { body: "nothing", last_updated: "2026-01-02", criticality: "high" });
  assert.deepEqual(w.ids({ q: "water", viewer: V }), ["B", "A"], "relevance");
  assert.equal(compile({ q: "water", viewer: V }).sort.field, "relevance");
  assert.equal(compile({ q: "-water", viewer: V }).sort.field, "updated", "a negated term is not a positive one");
  assert.deepEqual(w.ids({ q: "", viewer: V }), ["C", "A", "B", "D"], "updated descending, then bundle_id");
  assert.deepEqual(w.ids({ q: "", viewer: V, sort: "criticality", dir: "asc" }), ["A", "D", "C", "B"], "nulls last ascending");
  assert.deepEqual(w.ids({ q: "", viewer: V, sort: "criticality", dir: "desc" }), ["C", "A", "D", "B"], "nulls last descending");
  assert.deepEqual(w.ids({ q: "sort:criticality:asc", viewer: V, sort: "updated", dir: "asc" }), ["A", "B", "D", "C"],
    "the parameter outranks the token");
  for (const [shape, s] of everyStatement(compile({ q: "water", viewer: V })))
    if (/ORDER BY/.test(s.sql) && !/^facets|meaning/.test(shape)) assert.match(s.sql, /bundle_id ASC LIMIT/);
});

test("R11 relevance is over the rows the viewer may see, only the order is published, and more than eight terms weigh as one", () => {
  const w = world();
  w.member("ann");
  w.bundle("A", { body: "water budget" });
  w.bundle("B", { body: "water water budget shortfall" });
  w.bundle("C", { body: "budget alone and budget again" });
  w.bundle("P1", { type: "project", body: "water water water water" });
  const ann = { q: "water budget", viewer: "member:ann", implicitOp: "or" };
  const before = w.run(ann).rows;
  assert.ok(!before.some((r) => r.bundle_id === "P1"));
  assert.ok(!before.some((r) => "score" in r), "no score is published");
  w.revise("P1", { body: "budget ".repeat(40) });
  w.bundle("P2", { type: "project", body: "water ".repeat(30) });
  w.bundle("P3", { type: "project", body: "budget budget" });
  assert.deepEqual(w.run(ann).rows, before, "hidden bundles move neither the order nor the snippets");
  const ids = w.run(ann, "ids").rows;
  w.revise("P2", { body: "budget" });
  assert.deepEqual(w.run(ann, "ids").rows, ids);
  /* Seen by a viewer who may see the projects, the order does move: the formula reads the viewer's rows. */
  const all = w.run({ ...ann, viewer: V }).rows.map((r) => r.bundle_id);
  assert.ok(all.includes("P1"));
  const many = compile({ q: "a b c d e f g h i", viewer: V });
  assert.ok(many.warnings.includes(`relevance weighs these 9 terms as one: more than ${RANK_ATOMS_MAX} are not weighed separately`));
  assert.deepEqual(compile({ q: "a b c d e f g h", viewer: V }).warnings, []);
  assert.equal(RANK_ATOMS_MAX, 8);
  w.bundle("M", { body: "a b c d e f g h i" });
  assert.deepEqual(w.ids({ q: "a b c d e f g h i", viewer: V }), ["M"]);
});

test("R12 bounds, each published as applied after clamping", () => {
  const lim = (limit) => compile({ q: "", viewer: V, limit }).limit;
  assert.equal(LIMIT_DEFAULT, 50); assert.equal(LIMIT_MAX, 500); assert.equal(IDS_MAX, 50000);
  assert.deepEqual([lim(undefined), lim(0), lim(-4), lim(1), lim(499.9), lim(9999), lim("x")], [50, 50, 1, 1, 499, 500, 50]);
  const off = (offset) => compile({ q: "", viewer: V, offset }).offset;
  assert.deepEqual([off(-3), off(0), off(7.8), off("x")], [0, 0, 7, 0]);
  const p = compile({ q: "", viewer: V, limit: 3, offset: 4 });
  assert.deepEqual(p.statements.page().args.slice(-2), [3, 4]);
  assert.equal(p.statements.ids().args.at(-1), IDS_MAX);
  assert.equal(p.statements.snapshot().args.at(-1), IDS_MAX);
  const m = (rowLimit, rowOffset) => compile({ q: "", viewer: V, rows: "leg", rowLimit, rowOffset }).meaning;
  assert.equal(MEANING_LIMIT_DEFAULT, 200); assert.equal(MEANING_LIMIT_MAX, 1000);
  assert.deepEqual([m().limit, m(0).limit, m(-1).limit, m(5000).limit, m(10, -2).offset, m(10, 3).offset], [200, 200, 1, 1000, 0, 3]);
  assert.deepEqual(compile({ q: "", viewer: V, rows: "leg", rowLimit: 9, rowOffset: 2 }).statements.meaning().args.slice(-2), [9, 2]);
  /* snippet length: 4–64 tokens, 12 by default. */
  const snip = (snippetChars) => compile({ q: "water", viewer: V, snippetChars }).statements.page().args.find((a) => typeof a === "number");
  assert.deepEqual([snip(undefined), snip(1), snip(100), snip(20.7), snip("x"), snip(null)], [12, 4, 64, 20, 12, 4]);
  const w = world();
  for (let i = 0; i < 12; i++) w.bundle(`B${String(i).padStart(2, "0")}`, { body: "water" });
  assert.equal(w.run({ q: "water", viewer: V, limit: 5, offset: 10 }).rows.length, 2);
});

test("R14 the bundle-grain shapes: page, count, ids, snapshot, facets and facetScan; ids is an arm; any number of arms compiles", () => {
  const w = world();
  w.bundle("A", { body: "water", current_state: "open", criticality: "high", bundle_sha: "s1" });
  w.bundle("B", { body: "water", current_state: "open", criticality: null, bundle_sha: "s2" });
  w.bundle("C", { body: "dry", current_state: "closed", criticality: "low", bundle_sha: "s3" });
  const page = w.run({ q: "", viewer: V }).rows;
  assert.deepEqual(Object.keys(page[0]), [...PROVENANCE_COLS, "snippet"]);
  assert.ok(page.every((r) => r.snippet === null), "null when there is no term");
  const hit = w.run({ q: "water", viewer: V }).rows;
  assert.ok(hit.every((r) => /\[water\]/.test(r.snippet)));
  assert.deepEqual(w.run({ q: "water", viewer: V }, "count").rows, [{ n: 2 }]);
  assert.deepEqual(w.run({ q: "water", viewer: V }, "ids").rows.map((r) => r.bundle_id), hit.map((r) => r.bundle_id));
  assert.deepEqual(w.run({ q: "", viewer: V }, "snapshot").rows, [{ bundle_id: "C", bundle_sha: "s3" },
    { bundle_id: "B", bundle_sha: "s2" }, { bundle_id: "A", bundle_sha: "s1" }]);
  /* facets: the requested ones (fields only) or DEFAULT_FACETS; both forms count alike, nulls excluded. */
  assert.deepEqual(compile({ q: "", viewer: V }).facetFields, DEFAULT_FACETS);
  const req = { q: "", viewer: V, facets: ["state", "criticality", "nope", "leg"] };
  assert.deepEqual(compile(req).facetFields, ["state", "criticality"]);
  const grouped = w.run(req, "facets").rows.map((r) => `${r.field}=${r.value}:${r.n}`).sort();
  const plan = compile(req), scan = w.all(plan.statements.facetScan()), tally = [];
  plan.facetFields.forEach((f, i) => {
    const col = plan.facetCols[i], counts = {};
    for (const r of scan) if (r[col] !== null) counts[r[col]] = (counts[r[col]] || 0) + 1;
    for (const [v, n] of Object.entries(counts)) tally.push(`${f}=${v}:${n}`);
  });
  assert.deepEqual(grouped, tally.sort());
  assert.deepEqual(grouped, ["criticality=high:1", "criticality=low:1", "state=closed:1", "state=open:2"]);
  /* ids: an arm intersected with the query. */
  assert.deepEqual(sorted(w.ids({ q: "water", viewer: V, ids: ["A", "C"] })), ["A"]);
  assert.equal(compile({ q: "", viewer: V, ids: ["A"] }).restricted, true);
  /* any number of arms */
  const q = Array.from({ length: 23 }, (_, i) => `-state:s${i}`).join(" ") + " " +
            Array.from({ length: 11 }, () => "(water OR state:open)").join(" ");
  assert.deepEqual(sorted(w.ids({ q, viewer: V })), ["A", "B"]);
  assert.deepEqual(sorted(w.ids({ q: Array.from({ length: 30 }, (_, i) => `state:x${i}`).join(" OR ") + " OR water", viewer: V })), ["A", "B"]);
});

function meaningWorld() {
  const w = world();
  w.member("ann");
  w.bundle("Q1", { type: "inquiry" });
  w.bundle("Q2", { type: "inquiry" });
  w.bundle("PR", { type: "project" });
  w.bundle("T1", { type: "information" });
  for (let i = 0; i < 5; i++)
    w.insert("inquiry_basis", { bundle_id: "Q1", ord: i, target_id: i === 4 ? "GONE" : "T1",
      grade_source: i === 2 ? "hunch" : "documented", grade: "B", role: "supports" });
  w.insert("inquiry_basis", { bundle_id: "Q2", ord: 0, target_id: "PR", grade_source: "hunch" });
  w.insert("inquiry_basis", { bundle_id: "Q2", ord: 1, target_id: "T1", grade_source: "hunch" });
  w.insert("inquiry_basis", { bundle_id: "PR", ord: 0, target_id: "T1", grade_source: "hunch" });
  return w;
}

test("R15 rows=<arm>: the whole meaning set of each bundle in scope, the gate on the owner and on every named bundle, counted alike", () => {
  const w = meaningWorld();
  const r = w.run({ q: "leg:hunch", viewer: "member:ann", rows: "leg" }, "meaning");
  assert.deepEqual(r.rows.map((x) => `${x.bundle_id}/${x.ord}`), ["Q1/0", "Q1/1", "Q1/2", "Q1/3", "Q1/4", "Q2/1"],
    "every leg of Q1, not only the hunch leg; Q2's leg naming the hidden project is absent; PR's legs are absent");
  assert.deepEqual(r.rows.map((x) => x.target_id_present), [1, 1, 1, 1, 0, 1], "a row naming nothing is returned, flagged");
  assert.deepEqual(Object.keys(r.rows[0]), ["bundle_id", "bundle_type", ...MEANING.leg.row, ...MEANING.leg.rowJoin.cols,
    "target_id_present"]);
  assert.deepEqual(w.run({ q: "leg:hunch", viewer: "member:ann", rows: "leg" }, "meaning", { mode: "count" }).rows, [{ n: 6 }]);
  const all = w.run({ q: "", viewer: V, rows: "leg" }, "meaning");
  assert.deepEqual(all.rows.map((x) => `${x.bundle_id}/${x.ord}`),
    ["PR/0", "Q1/0", "Q1/1", "Q1/2", "Q1/3", "Q1/4", "Q2/0", "Q2/1"], "ordered by the bundle, then the arm's identity");
  assert.equal(compile({ q: "", viewer: V, rows: "nope" }).statements.meaning(), null);
  /* rows=passage: the units matching the passage: terms (their OR), with the current content row at that extent. */
  const p = world();
  p.bundle("D", { type: "information" });
  const unit = (seq, text) => p.insert("capture_text", { capture_sha: "s", bundle_id: "D", extent_kind: "pdf-page",
    extent: `{"page":${seq}}`, ref: `p${seq}`, seq, text, chain_kind: "ocr" });
  unit(0, "culvert failed"); unit(1, "budget shortfall"); unit(2, "nothing here");
  p.insert("content", { content_id: "old", capture_sha: "s", bundle_id: "D", extent_kind: "pdf-page", extent: '{"page":0}', stale: 1, at: "1" });
  p.insert("content", { content_id: "cur", capture_sha: "s", bundle_id: "D", extent_kind: "pdf-page", extent: '{"page":0}', stale: 0, at: "2" });
  const pr = p.run({ q: "passage:culvert passage:budget", viewer: V, rows: "passage" }, "meaning");
  assert.deepEqual(pr.rows.map((x) => [x.ref, x.content_id]), [["p0", "cur"], ["p1", null]]);
  assert.ok(pr.rows.every((x) => /\[/.test(x.snippet)));
  assert.equal(pr.plan.meaning.matched, true);
  assert.deepEqual(p.run({ q: "passage:culvert passage:budget", viewer: V, rows: "passage" }, "meaning", { mode: "count" }).rows, [{ n: 2 }]);
  const none = p.run({ q: "", viewer: V, rows: "passage" }, "meaning");
  assert.deepEqual(none.rows.map((x) => [x.ref, x.snippet]), [["p0", null], ["p1", null], ["p2", null]]);
  assert.equal(none.plan.meaning.matched, false);
});

test("R16 meaning levels and axis take their scope from the query's other arms", () => {
  const w = world();
  w.bundle("D1", { body: "notes", current_state: "open" });
  w.bundle("D2", { body: "notes", current_state: "open" });
  w.bundle("D3", { body: "notes", current_state: "closed" });
  w.insert("capture_text", { capture_sha: "s1", bundle_id: "D1", extent_kind: "pdf-page", extent: "{}", ref: "p",
                             seq: 0, text: "culvert", chain_kind: "ocr" });
  w.insert("register", { capture_sha: "s1", bundle_id: "D1", registered: "t1" });
  w.insert("register", { capture_sha: "s2", bundle_id: "D2", registered: "t2" });
  w.insert("readings", { capture_sha: "s1" });
  w.insert("observation_log", { seq: 1, level: "content", subject_kind: "capture", authority_kind: "extract", subject: "s1", state: "PRESENT" });
  w.insert("observation_log", { seq: 2, level: "content", subject_kind: "capture", authority_kind: "derive", subject: "s1", state: "PRESENT", bound: 5 });
  const miss = { q: "passage:zebra state:open", viewer: V, rows: "passage" };
  assert.deepEqual(w.run(miss, "meaning", { mode: "rows" }).rows, []);
  assert.deepEqual(w.run(miss, "meaning", { mode: "levels" }).rows, [{ documents: 2, documents_with_rows: 1 }],
    "a miss never empties its own denominator");
  const axis = w.run(miss, "meaning", { mode: "axis" }).rows;
  assert.deepEqual(axis.map((r) => [r.capture_sha, r.extract_state, r.index_state, r.index_bound, r.has_reading]),
    [["s1", "PRESENT", "PRESENT", 5, 1], ["s2", null, null, null, 0]]);
  assert.equal(compile(miss).statements.meaning({ mode: "axis" }).args.at(-1), MEANING_AXIS_CAP + 1);
  assert.equal(MEANING_AXIS_CAP, 500);
  assert.deepEqual(w.run({ q: "state:none passage:zebra", viewer: V, rows: "passage" }, "meaning", { mode: "levels" }).rows,
    [{ documents: 0, documents_with_rows: null }], "a true zero survives");
});

test("R17 plan.cached names each cached column and route; cachedNotes publishes only routes that ran, in FIELDS order", () => {
  const cachedCols = Object.values(FIELDS).filter((f) => f.asOf).map((f) => f.col);
  assert.deepEqual(cachedCols, [FIELDS.capture.col, FIELDS.connection.col]);
  const p = compile({ q: "-(connection:A OR x)", viewer: V, sort: "capture", facets: ["type"] });
  assert.deepEqual(Object.fromEntries(Object.entries(p.cached).map(([k, s]) => [k, [...s].sort()])),
    { [FIELDS.connection.col]: ["filter"], [FIELDS.capture.col]: ["sort"] });
  const d = compile({ q: "", viewer: V });
  assert.deepEqual(Object.fromEntries(Object.entries(d.cached).map(([k, s]) => [k, [...s]])),
    { [FIELDS.capture.col]: ["facet"], [FIELDS.connection.col]: ["facet"] }, "default facets are a route");
  const notes = cachedNotes(p.cached, { facets: true, ordered: true });
  assert.deepEqual(notes.map((n) => [n.field, n.via]), [["capture", ["sort"]], ["connection", ["filter"]]]);
  for (const n of notes) {
    assert.equal(n.as_of, FIELDS[n.field].asOf);
    assert.equal(n.authority, FIELDS[n.field].authority);
    assert.ok(n.detail.includes(FIELDS[n.field].why));
  }
  assert.deepEqual(cachedNotes(p.cached, { ordered: false }).map((n) => n.field), ["connection"]);
  assert.deepEqual(cachedNotes(d.cached, { facets: false }), []);
  assert.deepEqual(cachedNotes({}), []);
});
