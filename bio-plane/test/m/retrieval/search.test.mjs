/* retrieval: search, the vocabulary and the index check (R6–R9, R15–R17, R28, R29, R32, R34, R54), at the interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { FIELDS, FTS_COLUMNS, DEFAULT_FACETS, IDS_MAX, PROVENANCE_COLS, cachedNotes, compile, meaningVocabulary }
  from "../../../src/query.mjs";

/* A small corpus: four documents, two states, two schemas, one hidden project. */
function corpus() {
  const w = world();
  w.doc("INFO-1", { source_status: "live", title: "Water fund audit" }, { files: [{ path: "n.md", text: "water rates rose sharply" }] });
  w.doc("INFO-2", { source_status: "live", schema: "information@2" }, { files: [{ path: "n.md", text: "water bonds and sewer bonds" }] });
  w.doc("INFO-3", { source_status: "gone", current_state: "verified" }, { files: [{ path: "n.md", text: "parks budget" }] });
  w.doc("INFO-4", { source_status: "gone" }, { files: [{ path: "n.md", text: "library hours" }] });
  const proj = w.project("Water Secret Fund", "ann");
  return { w, proj };
}

test("R6: mode page (default), ids or count; the answer carries query, gate {scope, applied}, total, limit, offset; hits carry the provenance columns and a snippet and no score; ids every id in the page's order with truncated at the cap", () => {
  const { w } = corpus();
  const s = w.retrieval.search({ q: "water", viewer: V("vera") });
  assert.deepEqual(Object.keys(s.query), ["q", "terms", "match", "sort", "warnings", "mode"]);
  assert.equal(s.query.mode, "page");
  assert.deepEqual([s.gate.scope, s.total, s.limit, s.offset], ["participant", 2, 50, 0]);
  assert.equal(s.gate.applied, 1 + 1 + 1, "count, page and the facet scan each ran through the gate");
  assert.deepEqual(s.hits.map((h) => h.bundle_id).sort(), ["INFO-1", "INFO-2"]);
  for (const h of s.hits) {
    assert.deepEqual(Object.keys(h), [...PROVENANCE_COLS.map((c) => String(c).replace(/^b\./, "").split(/\s+AS\s+/i).pop()), "snippet"]);
    assert.equal(typeof h.snippet, "string");
    assert.equal(Object.keys(h).some((k) => /score|rank|bm25/i.test(k)), false, "no score is published");
  }
  const ids = w.retrieval.search({ q: "water", viewer: V("vera"), mode: "ids" });
  assert.deepEqual(ids.ids, s.hits.map((h) => h.bundle_id), "ids in the page's order");
  assert.equal(ids.truncated, false);
  assert.equal(ids.hits, undefined);
  const count = w.retrieval.search({ q: "water", viewer: V("vera"), mode: "count" });
  assert.deepEqual([count.total, count.hits, count.ids, count.facets], [2, undefined, undefined, undefined]);
  assert.equal(count.gate.applied, 1);
  /* The cap: a corpus above IDS_MAX is not built here; the flag is the comparison with the published cap. */
  assert.equal(IDS_MAX, 50000);
});

test("R7: facets accompany every answer but a count unless facets is false: per field {value, n} by count then value, nulls excluded; scan and groupby give identical counts", () => {
  const { w } = corpus();
  const scan = w.retrieval.search({ q: "", viewer: V("vera") });
  const grp = w.retrieval.search({ q: "", viewer: V("vera"), facetMode: "groupby" });
  assert.deepEqual(Object.keys(scan.facets), DEFAULT_FACETS);
  assert.deepEqual(scan.facets, grp.facets);
  assert.deepEqual(scan.facets.status, [{ value: "gone", n: 2 }, { value: "live", n: 2 }]);
  for (const list of Object.values(scan.facets)) {
    assert.ok(list.every((f) => f.value !== null && f.value !== undefined));
    for (let i = 1; i < list.length; i++)
      assert.ok(list[i - 1].n > list[i].n || (list[i - 1].n === list[i].n && String(list[i - 1].value) < String(list[i].value)));
  }
  assert.equal(w.retrieval.search({ q: "", viewer: V("vera"), facets: false }).facets, undefined);
  assert.equal(w.retrieval.search({ q: "", viewer: V("vera"), mode: "count" }).facets, undefined);
  const chosen = w.retrieval.search({ q: "", viewer: V("vera"), facets: ["state"] });
  assert.deepEqual(Object.keys(chosen.facets), ["state"]);
});

test("R8: cached publishes query-language's cachedNotes for the routes the answer actually ran — no facet route on a count, no sort route on a count", () => {
  const { w } = corpus();
  const q = "capture:B sort:capture";
  const page = w.retrieval.search({ q, viewer: V("vera") });
  const plan = compile({ q, viewer: V("vera") });
  assert.deepEqual(page.cached[0].via, ["filter", "facet", "sort"], "a cached column read by three routes");
  assert.deepEqual(page.cached, cachedNotes(plan.cached, { facets: true, ordered: true }));
  const count = w.retrieval.search({ q, viewer: V("vera"), mode: "count" });
  assert.deepEqual(count.cached.map((n) => n.via), [["filter"]], "a count ran neither the facet nor the sort route");
  assert.ok(page.cached.some((n) => n.via.includes("facet")) && page.cached.some((n) => n.via.includes("sort")));
  assert.deepEqual(count.cached, cachedNotes(plan.cached, { facets: false, ordered: false }));
  const noFacets = w.retrieval.search({ q, viewer: V("vera"), facets: false });
  assert.deepEqual(noFacets.cached, cachedNotes(plan.cached, { facets: false, ordered: true }));
  assert.deepEqual(w.retrieval.search({ q: "parks", viewer: V("vera"), facets: false }).cached,
                   cachedNotes(compile({ q: "parks", viewer: V("vera") }).cached, { facets: false, ordered: true }));
});

test("R9: a conjunction of more than one atom that finds nothing counts the OR reading and offers widen only when it finds something; otherwise widen is null", () => {
  const { w } = corpus();
  const miss = w.retrieval.search({ q: "water library", viewer: V("vera") });
  assert.equal(miss.total, 0);
  assert.deepEqual(miss.widen, { interpretation: "OR", total: 3, q: "water library",
    detail: "no bundle matches all of these terms; this many match any of them" });
  assert.equal(w.retrieval.search({ q: "water library", viewer: V("vera"), widen: false }).widen, null);
  assert.equal(w.retrieval.search({ q: "zzqx yyqx", viewer: V("vera") }).widen, null, "the OR reading finds nothing");
  assert.equal(w.retrieval.search({ q: "zzqx", viewer: V("vera") }).widen, null, "one atom is not a conjunction");
  assert.equal(w.retrieval.search({ q: "water", viewer: V("vera") }).widen, null, "a hit");
  /* The OR count goes through the gate: the hidden project's title words are not counted for vera. */
  assert.equal(w.retrieval.search({ q: "secret library", viewer: V("vera") }).widen.total, 1);
});

test("R15: a text term found only in a captured document's text is found by passage: and not by text:; searching mints no content row", () => {
  const w = world();
  const c = w.cap("a", "bytes");
  w.doc("INFO-1", {}, { captures: [c] });
  w.unit(c.sha, "INFO-1", 0, "the quorum was never reached");
  const before = w.count("content");
  assert.equal(w.retrieval.search({ q: "text:quorum", viewer: V("vera") }).total, 0);
  assert.equal(w.retrieval.search({ q: "passage:quorum", viewer: V("vera") }).total, 1);
  const rows = w.retrieval.meaningRows({ q: "passage:quorum", rows: "passage", viewer: V("vera") });
  assert.equal(rows.count, 1);
  assert.equal(w.count("content"), before, "searching mints nothing");
});

test("R54: passage search honours NEAR — a unit matches only where its terms lie within the distance inside that one unit, never across two; rows=passage and its tally read the same match; the syntax states the operator", () => {
  const w = world();
  const c = w.cap("a", "bytes");
  w.doc("INFO-1", {}, { captures: [c] });
  w.unit(c.sha, "INFO-1", 0, "the council approved the budget after a long debate about parks");
  w.unit(c.sha, "INFO-1", 1, "the budget");
  w.unit(c.sha, "INFO-1", 2, "council members spoke");
  const near = (q) => w.retrieval.meaningRows({ q, rows: "passage", viewer: V("vera") });
  /* Within one unit, three words apart. */
  assert.equal(near("passage:NEAR(council budget, 3)").count, 1);
  assert.equal(near("passage:NEAR(council budget, 3)").rows[0].ref, "p0");
  /* Too far apart inside the unit. */
  assert.equal(near("passage:NEAR(council parks, 3)").count, 0);
  assert.equal(near("passage:NEAR(council parks, 10)").count, 1);
  /* Never across two units: "council" is in unit 2 and "budget" in unit 1, each alone. */
  assert.deepEqual(near("passage:NEAR(council budget, 3)").rows.map((r) => r.ref), ["p0"]);
  /* The bundle-grain search reads the same match. */
  assert.equal(w.retrieval.search({ q: "passage:NEAR(council parks, 3)", viewer: V("vera") }).total, 0);
  assert.equal(w.retrieval.search({ q: "passage:NEAR(council budget, 3)", viewer: V("vera") }).total, 1);
  /* The tally is over the same scope either way; the statement states the operator. */
  assert.equal(near("passage:NEAR(council budget, 3)").scope.captures_counted, 1);
  assert.ok(w.retrieval.searchFields().syntax.some((s) => /\bNEAR\(/.test(s) && /never across two/.test(s)));
});

test("R16: searchFields publishes the fields {type, freeText, column}, ftsColumns, defaultFacets, idsMax, meaning (meaningVocabulary) and the syntax, which says content: searches what has been cited and never a document's text", () => {
  const { w } = corpus();
  const f = w.retrieval.searchFields();
  assert.deepEqual(Object.keys(f.fields), Object.keys(FIELDS));
  for (const [k, def] of Object.entries(FIELDS)) assert.deepEqual(f.fields[k], { type: def.type, freeText: !!def.fts, column: def.col });
  assert.deepEqual([f.ftsColumns, f.defaultFacets, f.idsMax], [FTS_COLUMNS, DEFAULT_FACETS, IDS_MAX]);
  assert.deepEqual(f.meaning, meaningVocabulary());
  assert.ok(f.syntax.every((s) => typeof s === "string" && s.length));
  assert.ok(f.syntax.some((s) => /content: does NOT search the text of the documents/.test(s)));
  assert.ok(f.syntax.some((s) => /cited or marked citable/.test(s)));
});

test("R17: searchIndexCheck finds NO_FTS_ID, NO_INDEX_ROW and DIVERGED over visible bundles, lists orphans (bounded), counts through the gate, pages by cursor, ok only with neither", () => {
  const { w, proj } = corpus();
  const clean = w.retrieval.searchIndexCheck({ viewer: MACHINE });
  assert.deepEqual([clean.ok, clean.checked, clean.findings, clean.orphans, clean.cursor, clean.limit], [true, 5, [], [], null, 200]);
  assert.deepEqual(clean.counts, { bundles: 5, indexed: 5, keyed: 5 });
  assert.deepEqual([clean.orphans_limit, clean.orphans_truncated], [100, false]);
  /* Break it three ways. */
  const k1 = w.row(`SELECT fts_id FROM bundles WHERE bundle_id='INFO-1'`).fts_id;
  w.st.sql.exec(`UPDATE bundles SET fts_id=NULL WHERE bundle_id='INFO-1'`);   /* its index row is now an orphan */
  const k2 = w.row(`SELECT fts_id FROM bundles WHERE bundle_id='INFO-2'`).fts_id;
  w.st.sql.exec(`DELETE FROM bundles_fts WHERE rowid=?`, k2);
  const k3 = w.row(`SELECT fts_id FROM bundles WHERE bundle_id='INFO-3'`).fts_id;
  w.st.sql.exec(`UPDATE bundles_fts SET body='tampered' WHERE rowid=?`, k3);
  w.st.sql.exec(`INSERT INTO bundles_fts (rowid, title, body, meta, locator, authority) VALUES (999, 't', 'b', 'm', 'l', 'a')`);
  const bad = w.retrieval.searchIndexCheck({ viewer: V("vera") });
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.findings.map((f) => [f.bundleId, f.finding]),
    [["INFO-1", "NO_FTS_ID"], ["INFO-2", "NO_INDEX_ROW"], ["INFO-3", "DIVERGED"]]);
  const div = bad.findings[2];
  assert.deepEqual(div.columns, ["body"]);
  assert.deepEqual(div.chars.body[0], "tampered".length);
  assert.deepEqual(bad.orphans, [k1, 999]);
  /* Through the gate: vera does not see the project, so neither its row nor its claimed index row is counted; every
     orphan is (it names nothing). */
  assert.deepEqual(bad.counts, { bundles: 4, indexed: 4, keyed: 3 });
  const annCounts = w.retrieval.searchIndexCheck({ viewer: V("ann") }).counts;
  assert.deepEqual(annCounts, { bundles: 5, indexed: 5, keyed: 4 });
  /* Paging. */
  const p1 = w.retrieval.searchIndexCheck({ viewer: V("ann"), limit: 2 });
  assert.deepEqual([p1.checked, p1.cursor, p1.limit], [2, "INFO-2", 2]);
  const p2 = w.retrieval.searchIndexCheck({ viewer: V("ann"), limit: 2, after: p1.cursor });
  assert.equal(p2.checked, 2);
  assert.equal(w.retrieval.searchIndexCheck({ viewer: V("ann"), limit: 5000 }).limit, 1000);
  assert.equal(w.retrieval.searchIndexCheck({ viewer: null }).checked, 0, "an absent viewer sees nothing");
  assert.ok(proj);
});

test("R28: no search, meaning-row or selection statement runs without the gate's mark: the executor throws on one", () => {
  const { w } = corpus();
  assert.throws(() => w.retrieval.runQuery({ sql: "SELECT bundle_id FROM bundles", args: [] }, { applied: 0 }), /viewer visibility gate/);
  assert.throws(() => w.retrieval.runQuery(null, { applied: 0 }), /viewer visibility gate/);
  const tally = { applied: 0 };
  const plan = compile({ q: "water", viewer: V("vera") });
  assert.equal(w.retrieval.runQuery(plan.statements.count(), tally)[0].n, 2);
  assert.equal(tally.applied, 1);
});

test("R29: hidden answers as absent everywhere — a hidden project moves no total, facet, widen count or id list, and nothing states how much was withheld", () => {
  const w = world();
  w.doc("INFO-1", { title: "alpha" });
  const base = JSON.stringify([w.retrieval.search({ q: "", viewer: V("vera") }),
                               w.retrieval.search({ q: "alpha omega", viewer: V("vera") }),
                               w.retrieval.search({ q: "", viewer: V("vera"), mode: "ids" }),
                               w.retrieval.projection({ viewer: V("vera") })]);
  w.project("Alpha Omega Fund", "ann");
  const after = JSON.stringify([w.retrieval.search({ q: "", viewer: V("vera") }),
                                w.retrieval.search({ q: "alpha omega", viewer: V("vera") }),
                                w.retrieval.search({ q: "", viewer: V("vera"), mode: "ids" }),
                                w.retrieval.projection({ viewer: V("vera") })]);
  assert.equal(after, base, "byte-identical for the viewer who cannot see the project");
  assert.equal(w.retrieval.search({ q: "", viewer: V("ann") }).total, 2);
});

test("R32: a search, a meaning-row read, a vocabulary read and an index check write nothing", () => {
  const { w } = corpus();
  const snap = () => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
    .filter((t) => !/^bundles_fts_|^capture_text_fts_/.test(t.name))
    .map((t) => [t.name, w.rows(`SELECT * FROM "${t.name}"`)]));
  const before = snap();
  w.retrieval.search({ q: "water", viewer: V("vera") });
  w.retrieval.search({ q: "water library", viewer: V("vera") });
  w.retrieval.meaningRows({ q: "", rows: "leg", viewer: V("vera") });
  w.retrieval.searchFields();
  w.retrieval.searchIndexCheck({ viewer: MACHINE });
  w.retrieval.projection({ viewer: V("vera") });
  assert.equal(snap(), before);
});

test("R34: no place is named in the module's outward text — the vocabulary, the statements and the notes name no jurisdiction", () => {
  const w = world();
  const c = w.cap("a", "x");
  w.doc("INFO-1", {}, { captures: [c] });
  const texts = JSON.stringify([
    w.retrieval.searchFields(),
    w.retrieval.meaningRows({ q: "passage:x", rows: "passage", viewer: V("vera") }),
    w.retrieval.meaningRows({ q: "", rows: "leg", viewer: V("vera") }),
    w.retrieval.meaningRows({ rows: "nope", viewer: V("vera") }),
    w.retrieval.contentAxis({ captureSha: c.sha, viewer: V("vera") }),
    ...["document", "content", "meaning", "internet", "elsewhere"].map((level) => w.retrieval.frontier({ level, viewer: V("vera") })),
  ]);
  for (const place of ["Oakland", "Alameda", "California", "Bay Area", "Berkeley"])
    assert.equal(new RegExp(place, "i").test(texts), false, place);
});
