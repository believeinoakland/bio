/* retrieval: a field whose column a later module holds in a table of its own (R62, N136, N137), at the interface.
 *
 * The two tables here are the tests' own, standing in for inquiry's `inquiry_bundle_facts` (the leg count, `legs`; its
 * R36) and strength's `strength_cache` (`capture`, `connection`; its R23), each keyed by `bundle_id` as their owners'
 * are. The values are written as their owners write them; the same values on `bundles` are where those columns stood
 * before their owners moved them, which a field with none registered still reads. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { Retrieval } from "../../../src/retrieval/index.mjs";
import { FIELDS } from "../../../src/query.mjs";

const STRENGTH = { table: "strength_cache", key: "bundle_id" };
const LEGS = { table: "inquiry_legs", key: "bundle_id", col: "basis_count" };

/* Five inquiries with a capture letter, a connection letter and a leg count each (one with none), two information
   bundles, and a project only ann may see holding the letters too. */
function corpus() {
  const w = world();
  w.doc("INFO-1", { title: "Water fund audit" });
  w.doc("INFO-2", { title: "Sewer bonds" });
  const vals = { "INQ-1": ["A", "B", 3], "INQ-2": ["B", "B", 1], "INQ-3": ["C", "A", 2], "INQ-4": ["B", "C", 5], "INQ-5": [null, null, null] };
  for (const id of Object.keys(vals)) w.doc(id, { object_type: "inquiry", title: `Question ${id} about water` });
  const proj = w.project("Water Secret Fund", "ann");
  vals[proj] = ["A", "A", 4];
  w.st.db.exec(`CREATE TABLE strength_cache (bundle_id TEXT PRIMARY KEY, capture_letter TEXT, connection_letter TEXT)`);
  w.st.db.exec(`CREATE TABLE inquiry_legs (bundle_id TEXT PRIMARY KEY, basis_count INTEGER)`);
  for (const [id, [cap, con, n]] of Object.entries(vals)) {
    w.st.sql.exec(`UPDATE bundles SET inquiry_capture_strength=?, inquiry_connection_strength=?, inquiry_basis_count=? WHERE bundle_id=?`,
      cap, con, n, id);
    w.st.sql.exec(`INSERT INTO strength_cache (bundle_id, capture_letter, connection_letter) VALUES (?,?,?)`, id, cap, con);
    w.st.sql.exec(`INSERT INTO inquiry_legs (bundle_id, basis_count) VALUES (?,?)`, id, n);
  }
  return { w, proj };
}

const register = (r) => [
  r.registerField("strength", "capture", { ...STRENGTH, col: "capture_letter" }),
  r.registerField("strength", "connection", { ...STRENGTH, col: "connection_letter" }),
  r.registerField("inquiry", "legs", LEGS)];

/* Every answer a registration reaches: a page, a count, every id, facets (both forms), the sorts, a meaning-grain read
   and the selections, for two viewers, over filters, facets and sorts on all three fields. */
async function answers(w) {
  const out = [];
  const qs = ["capture:B", "capture:<=B", "connection:B", "legs:>2", "has:legs", "legs:1..3 capture:A",
              "water sort:capture", "sort:-legs", "sort:connection:asc", "capture:B OR connection:C", "-capture:B type:inquiry", ""];
  for (const viewer of [V("vera"), V("ann")]) {
    for (const q of qs) {
      for (const mode of ["page", "count", "ids"]) {
        const s = w.retrieval.search({ q, viewer, mode, facets: ["capture", "connection", "legs", "state"] });
        out.push([q, viewer, mode, s]);
      }
      out.push([q, viewer, "groupby", w.retrieval.search({ q, viewer, facetMode: "groupby", facets: ["capture", "connection", "legs"] })]);
      out.push([q, viewer, "default facets", w.retrieval.search({ q, viewer })]);
      out.push([q, viewer, "sort param", w.retrieval.search({ q, viewer, sort: "legs", dir: "asc", facets: false })]);
    }
    out.push(["rows=leg", viewer, w.retrieval.meaningRows({ q: "capture:<=B", rows: "leg", viewer })]);
    const sel = await w.retrieval.selectionCreate({ owner: `o-${viewer}`, viewer, q: "capture:B sort:legs" });
    out.push(["select", viewer, { ...sel, handle: null, expires: null }]);
    const en = await w.retrieval.selectionCreate({ owner: `e-${viewer}`, viewer, ids: ["INQ-1", "INQ-4", "INFO-1"], q: "capture:B" });
    out.push(["enumerate", viewer, { ...en, handle: null, expires: null }]);
    const res = w.retrieval.selectionResolve({ handle: sel.handle, owner: `o-${viewer}`, viewer, weight: "refuse" });
    out.push(["resolve", viewer, { ...res, handle: null, expires: null }]);
  }
  return JSON.stringify(out);
}

test("R62: registerField refuses a field outside FIELDS, a projection column, and a table, key or column that is not an SQL identifier (FIELD_MALFORMED), and a second registration of one field (FIELD_DECLARED)", () => {
  const w = world();
  const r = w.retrieval;
  const ok = { table: "t", key: "bundle_id", col: "c" };
  const malformed = [
    ["", "legs", ok], [null, "legs", ok], ["inquiry", "bogus", ok], ["inquiry", "", ok], ["inquiry", null, ok],
    ["inquiry", "constructor", ok], ["inquiry", "toString", ok],
    ["inquiry", "legs", null], ["inquiry", "legs", "t.bundle_id.c"], ["inquiry", "legs", {}],
    ["inquiry", "legs", { ...ok, table: "t; DROP TABLE bundles" }], ["inquiry", "legs", { ...ok, table: "1t" }],
    ["inquiry", "legs", { ...ok, key: "bundle id" }], ["inquiry", "legs", { ...ok, key: "" }],
    ["inquiry", "legs", { ...ok, col: "c--" }], ["inquiry", "legs", { ...ok, col: 5 }], ["inquiry", "legs", { table: "t", key: "k" }],
    ["inquiry", "legs", { ...ok, table: "main.t" }], ["inquiry", "legs", { ...ok, col: "\"c\"" }],
  ];
  /* Every projection field (R2's columns, read through this module's own relation, R61). */
  for (const [f, def] of Object.entries(FIELDS)) if (def.proj) malformed.push(["strength", f, ok]);
  assert.ok(malformed.filter(([, f]) => f === "status" || f === "overdue").length === 2, "the projection fields are all refused");
  for (const [m, f, rel] of malformed) {
    const a = r.registerField(m, f, rel);
    assert.deepEqual([a.ok, a.reason], [false, "FIELD_MALFORMED"], JSON.stringify([m, f, rel]));
    assert.equal(typeof a.detail, "string");
  }
  /* Every field that is not a projection column may be registered, once. */
  const free = Object.entries(FIELDS).filter(([, d]) => !d.proj).map(([f]) => f);
  assert.ok(["capture", "connection", "legs", "id", "title", "state"].every((f) => free.includes(f)));
  for (const f of free) assert.deepEqual(r.registerField("strength", f, { ...ok, col: `c_${f}` }), { ok: true, module: "strength", field: f }, f);
  for (const f of free) {
    const again = r.registerField("inquiry", f, ok);
    assert.deepEqual([again.ok, again.reason, again.declaredBy], [false, "FIELD_DECLARED", "strength"], f);
    assert.equal(r.registerField("strength", f, ok).reason, "FIELD_DECLARED", "the same module twice");
  }
  /* A refused registration held nothing: after the refusals above, `legs` was free until strength registered it. */
  const w2 = world();
  for (const [m, f, rel] of malformed) w2.retrieval.registerField(m, f, rel);
  assert.equal(w2.retrieval.registerField("inquiry", "legs", LEGS).ok, true);
});

test("R62: no answer changes by a registration — every page, count, id list, facet (both forms), sort, cached note, meaning-grain read and selection is the one the same column gave on bundles", async () => {
  const { w } = corpus();
  const before = await answers(w);
  assert.deepEqual(register(w.retrieval).map((a) => a.ok), [true, true, true]);
  w.st.sql.exec(`DELETE FROM selection_items`); w.st.sql.exec(`DELETE FROM selections`);
  assert.equal(await answers(w), before);
  /* The answers are armed against real rows: letters, counts and facets over all three fields, gated per viewer. */
  const s = w.retrieval.search({ q: "capture:B", viewer: V("vera"), facets: ["capture", "legs"] });
  assert.deepEqual(s.hits.map((h) => h.bundle_id).sort(), ["INQ-2", "INQ-4"]);
  assert.deepEqual(w.retrieval.search({ q: "sort:-legs type:inquiry", viewer: V("vera"), mode: "ids" }).ids,
    ["INQ-4", "INQ-1", "INQ-3", "INQ-2", "INQ-5"], "nulls last");
  assert.deepEqual(w.retrieval.search({ q: "capture:A", viewer: V("ann"), mode: "count" }).total, 2);
  assert.deepEqual(w.retrieval.search({ q: "capture:A", viewer: V("vera"), mode: "count" }).total, 1);
  assert.deepEqual(w.retrieval.search({ q: "", viewer: V("vera"), facets: ["capture"] }).facets.capture,
    [{ value: "B", n: 2 }, { value: "A", n: 1 }, { value: "C", n: 1 }]);
  /* R17 of query-language: capture and connection stay cached, legs exact. */
  assert.deepEqual(w.retrieval.search({ q: "capture:B connection:B legs:1", viewer: V("vera") }).cached.map((n) => n.field),
    ["capture", "connection"]);
});

test("R62: each registered field is read through its relation — with the columns on bundles emptied, every answer is the one the same values gave on bundles; a field with none registered is read where it stands", async () => {
  const { w } = corpus();
  const before = await answers(w);
  register(w.retrieval);
  w.st.sql.exec(`DELETE FROM selection_items`); w.st.sql.exec(`DELETE FROM selections`);
  /* The owners' tables now hold the only copy of the values. */
  w.st.sql.exec(`UPDATE bundles SET inquiry_capture_strength=NULL, inquiry_connection_strength=NULL, inquiry_basis_count=NULL`);
  assert.equal(await answers(w), before);
  /* An unregistered field on another instance over the same storage reads bundles, where it now reads nothing. */
  const bare = new Retrieval({ storage: w.st, record: w.record, membership: w.membership, promotion: w.promotion,
    extraction: w.extraction, observation: w.observation });
  assert.equal(bare.search({ q: "capture:B", viewer: V("vera"), mode: "count" }).total, 0);
  bare.registerField("strength", "capture", { ...STRENGTH, col: "capture_letter" });
  assert.equal(bare.search({ q: "capture:B", viewer: V("vera"), mode: "count" }).total, 2);
  assert.equal(bare.search({ q: "has:legs", viewer: V("vera"), mode: "count" }).total, 0, "legs not registered here");
});

test("R62: registrations apply in the modules' total order — the answers are the same whichever module registers first", async () => {
  const { w } = corpus();
  const make = (order) => new Retrieval({ storage: w.st, record: w.record, membership: w.membership, promotion: w.promotion,
    extraction: w.extraction, observation: w.observation, order });
  const a = make(["inquiry", "strength"]), b = make(["inquiry", "strength"]);
  a.registerField("inquiry", "legs", LEGS);
  a.registerField("strength", "capture", { ...STRENGTH, col: "capture_letter" });
  b.registerField("strength", "capture", { ...STRENGTH, col: "capture_letter" });
  b.registerField("inquiry", "legs", LEGS);
  w.st.sql.exec(`UPDATE bundles SET inquiry_capture_strength=NULL, inquiry_basis_count=NULL`);
  for (const q of ["capture:B legs:>1", "sort:-legs", "has:legs capture:<=B", ""])
    assert.deepEqual(a.search({ q, viewer: V("ann"), facets: ["capture", "legs"] }), b.search({ q, viewer: V("ann"), facets: ["capture", "legs"] }), q);
});
