import { test } from "node:test";
import assert from "node:assert/strict";
import { world, everyStatement } from "./fixture.mjs";
import { compile, cachedNotes, viewerPredicate, GATE_MARK, FIELDS } from "../../../src/query.mjs";

const V = "class:member";
/* Relations of the caller's own naming, none of them retrieval's, inquiry's or strength's: nothing here may assume a
   later module's names. `capture` and `connection` share one table, as strength's cache holds both. */
const FIELDS_REL = {
  legs: { table: "rel_legs", key: "owner", col: "n_legs" },
  capture: { table: "rel_strength", key: "bid", col: "cap_letter" },
  connection: { table: "rel_strength", key: "bid", col: "conn_letter" },
};
const PROJ = { table: "proj_rel", key: "pid" };

function corpus(w) {
  w.member("ann");
  w.bundle("Q1", { type: "inquiry", title: "water main", body: "the water main broke", current_state: "open",
    inquiry_capture_strength: "B", inquiry_connection_strength: "C", inquiry_basis_count: 2, schema_id: "s1" });
  w.bundle("Q2", { type: "inquiry", title: "budget", body: "water budget shortfall", current_state: "closed",
    inquiry_capture_strength: "A", inquiry_connection_strength: "A", inquiry_basis_count: 1 });
  w.bundle("Q3", { type: "inquiry", title: "sewer", body: "sewer fund watering", inquiry_capture_strength: "D",
    inquiry_basis_count: 3 });
  w.bundle("Q4", { type: "inquiry", title: "streets", body: "nothing of note", inquiry_basis_count: 0 });
  w.bundle("I1", { title: "a document", body: "water water", schema_id: "s1" });
  w.bundle("PR", { type: "project", title: "hidden", body: "water", inquiry_capture_strength: "A",
    inquiry_connection_strength: "B", inquiry_basis_count: 5 });
  /* D54 (membership R43): PR is hidden (the index holds no setting for it), PD discoverable; erin is an administrator. */
  w.member("erin", "admin");
  w.bundle("PD", { type: "project", title: "open", body: "water", inquiry_capture_strength: "B", inquiry_basis_count: 1 });
  w.sight("PD", "discoverable");
  w.insert("inquiry_basis", { bundle_id: "Q1", ord: 0, target_id: "I1", grade_source: "hunch", grade: "B" });
  w.insert("inquiry_basis", { bundle_id: "Q2", ord: 0, target_id: "PR", grade_source: "documented" });
  w.insert("inquiry_basis", { bundle_id: "Q4", ord: 0, target_id: "PD", grade_source: "documented" });
  w.insert("capture_text", { capture_sha: "s", bundle_id: "I1", extent_kind: "pdf-page", extent: "{}", ref: "p1",
    seq: 0, text: "the culvert failed", chain_kind: "ocr" });
  w.insert("register", { capture_sha: "s", bundle_id: "I1", registered: "t" });
  return w;
}

const QUERIES = ["", "capture:A", "capture:b", "capture:<=B", "connection:C", "connection:>=B", "legs:>1", "legs:1..3",
  "legs:0", "has:capture", "capture:*", "connection:", "has:legs", "-capture:A", "capture:A OR legs:3", "water capture:B",
  "(capture:A OR connection:C) -legs:1", "leg:hunch capture:B", "passage:culvert legs:>0", "state:open capture:<=C",
  "sort:capture:asc", "sort:-legs water", "sort:connection:desc has:legs"];
const ROWS = [null, "leg", "passage"];
/* A machine credential, a member, the founder and an administrator (D54), and no viewer. */
const VIEWERS = [V, "member:ann", "admin", "member:erin", null];
const OPTS = [{}, { sort: "capture", dir: "asc" }, { sort: "connection", dir: "desc" }, { sort: "legs", dir: "asc" },
  { sort: "legs" }, { facets: ["capture", "connection", "legs", "type"] }, { facets: ["legs", "state"] },
  { ids: ["Q1", "Q3", "PR"] }];

test("R26 a field held in a later module's table is read through the relation the caller names, wherever the plan filters, facets or sorts by it, and no answer changes", () => {
  const flat = corpus(world());
  const cases = [
    { name: "fields", held: corpus(world({ fields: FIELDS_REL })), second: { fields: FIELDS_REL } },
    { name: "fields and projection", held: corpus(world({ projection: PROJ, fields: FIELDS_REL })),
      second: { projection: PROJ, fields: FIELDS_REL } },
    /* A field named with no relation is read where it stands: here only `legs` has one. */
    { name: "legs alone", held: corpus(world({ fields: { legs: FIELDS_REL.legs } })),
      second: { fields: { legs: FIELDS_REL.legs } } },
  ];
  let compared = 0;
  for (const { name, held, second } of cases)
    for (const viewer of VIEWERS)
      for (const q of QUERIES)
        for (const rows of ROWS)
          for (const o of OPTS) {
            const opts = { q, viewer, rows, ...o };
            const plain = compile(opts), named = compile(opts, second);
            const label = `${name} ${JSON.stringify(opts)}`;
            /* The plan's own statements about itself are unchanged: warnings, order, facets and R17's cached marks. */
            assert.deepEqual(named.warnings, plain.warnings, label);
            assert.deepEqual([named.sort, named.facetFields, named.facetCols, named.meaningArms],
                             [plain.sort, plain.facetFields, plain.facetCols, plain.meaningArms], label);
            assert.deepEqual(Object.entries(named.cached).map(([k, s]) => [k, [...s].sort()]),
                             Object.entries(plain.cached).map(([k, s]) => [k, [...s].sort()]), label);
            const a = everyStatement(plain), b = everyStatement(named);
            assert.deepEqual(b.map(([k]) => k), a.map(([k]) => k), label);
            const gate = viewerPredicate(viewer);
            b.forEach(([shape, s], i) => {
              /* The same rows, in the same order, though no named column is on `bundles` in `held`; `facetScan` is
                 unordered (it is tallied, R14), so its rows compare as a multiset. */
              const got = held.all(s), want = flat.all(a[i][1]);
              const bag = (rs) => rs.map((r) => JSON.stringify(r)).sort();
              if (shape === "facetScan") assert.deepEqual(bag(got), bag(want), `${shape} ${label}`);
              else assert.deepEqual(got, want, `${shape} ${label}`);
              /* R8: the gate unchanged, every mark the one gate's. */
              assert.equal(s.sql.split(GATE_MARK).length - 1, s.sql.split(gate.sql).length - 1, `${shape} ${label}`);
              assert.equal(s.sql.split(GATE_MARK).length - 1, a[i][1].sql.split(GATE_MARK).length - 1, `${shape} ${label}`);
              compared++;
            });
          }
  assert.ok(compared > 10000, `${compared} statements compared`);
  /* D54 through the relations: the hidden PR is withheld from the founder and an administrator as from ann, on a
     filter, a sort and a facet over a named field; the discoverable PD is theirs, and not ann's. */
  for (const { held, second } of cases)
    for (const [viewer, want] of [[V, ["PD", "PR"]], ["member:ann", []], ["admin", ["PD"]], ["member:erin", ["PD"]]]) {
      const projects = (o) => held.all(compile({ q: "capture:<=B type:project", viewer, ...o }, second).statements.page())
        .map((r) => r.bundle_id).sort();
      assert.deepEqual(projects({}), want, viewer);
      assert.deepEqual(projects({ sort: "legs" }), want, `${viewer} sorted`);
      const facet = held.all(compile({ q: "type:project", viewer, facets: ["capture"] }, second).statements.facets()[0]);
      assert.equal(facet.reduce((n, r) => n + r.n, 0), want.length, `${viewer} faceted`);
    }
  /* The relations are read only when given, and only by the caller's names. */
  const reads = (q, second, o = {}) => everyStatement(compile({ q, viewer: V, ...o }, second)).map(([, s]) => s.sql).join("\n");
  assert.ok(!/rel_legs|rel_strength/.test(reads("capture:A legs:2", {}, { sort: "legs", facets: ["capture"] })));
  assert.ok(/rel_legs/.test(reads("legs:2", { fields: FIELDS_REL })), "a filter reads the relation");
  assert.ok(/rel_strength/.test(reads("", { fields: FIELDS_REL })), "a default facet reads the relation");
  assert.ok(/rel_legs/.test(reads("", { fields: FIELDS_REL }, { sort: "legs", facets: ["type"] })), "a sort reads it");
  /* R17: `capture` and `connection` stay cached and `legs` exact, whoever holds the column. */
  const p = compile({ q: "capture:A connection:B legs:2", viewer: V, sort: "legs", facets: ["legs"] }, { fields: FIELDS_REL });
  assert.deepEqual(cachedNotes(p.cached).map((n) => [n.field, n.column, n.via]),
    [["capture", FIELDS.capture.col, ["filter"]], ["connection", FIELDS.connection.col, ["filter"]]]);
});

test("R26 the relation's names are the caller's and member input still moves only args (R7)", () => {
  const sqlOf = (q) => everyStatement(compile({ q, viewer: V, rows: "leg", sort: "capture",
    facets: ["capture", "legs"] }, { fields: FIELDS_REL })).map(([k, s]) => [k, s.sql]);
  const base = sqlOf('capture:"B" legs:>"1" connection:"C"');
  for (const h of ["x'); DROP TABLE rel_legs; --", "' OR 1=1 --", "*/ 1 /*"]) {
    const got = sqlOf(`capture:"${h}" legs:>"${h}" connection:"${h}"`);
    assert.deepEqual(got, base, h);
    for (const [, sql] of got) assert.ok(!sql.includes(h), h);
  }
});

test("R26 a relation that is not three identifiers, a name that is not a field, or fields that are not a map, is ignored with a warning and the field read as before", () => {
  const opts = { q: "capture:A legs:>1", viewer: V, rows: "leg", sort: "connection", facets: ["capture", "legs"] };
  const plain = everyStatement(compile(opts));
  const bad = [
    [{ legs: { table: "t; DROP TABLE bundles", key: "k", col: "c" } }, 'fields: "legs" is not a table, a key and a column; read as before'],
    [{ legs: { table: "t", key: "k" } }, 'fields: "legs" is not a table, a key and a column; read as before'],
    [{ legs: { table: "t", key: "k k", col: "c" } }, 'fields: "legs" is not a table, a key and a column; read as before'],
    [{ legs: "t" }, 'fields: "legs" is not a table, a key and a column; read as before'],
    [{ legs: null }, 'fields: "legs" is not a table, a key and a column; read as before'],
    [{ strength: { table: "t", key: "k", col: "c" } }, 'fields: "strength" is not a field; ignored'],
    [{ leg: { table: "t", key: "k", col: "c" } }, 'fields: "leg" is not a field; ignored'],
    ["legs", "fields: not a map of fields to relations; every field is read as before"],
    [[FIELDS_REL.legs], "fields: not a map of fields to relations; every field is read as before"],
    [7, "fields: not a map of fields to relations; every field is read as before"],
  ];
  for (const [fields, warning] of bad) {
    const p = compile(opts, { fields });
    assert.deepEqual(p.warnings, [warning], JSON.stringify(fields));
    assert.deepEqual(everyStatement(p), plain, JSON.stringify(fields));
  }
  /* One bad entry does not spoil a good one. */
  const mixed = compile(opts, { fields: { legs: FIELDS_REL.legs, capture: { table: "x" } } });
  assert.deepEqual(mixed.warnings, ['fields: "capture" is not a table, a key and a column; read as before']);
  assert.ok(everyStatement(mixed).some(([, s]) => s.sql.includes("rel_legs")));
  for (const none of [undefined, null, {}, { fields: null }, { fields: {} }, { projection: null }])
    assert.deepEqual(compile(opts, none).warnings, [], JSON.stringify(none));
});
