/* retrieval: a meaning arm answered end to end at both grains, and a leg's earned letter (R6, R7, R11, R12, R16, R29, R55,
 * R8), at the module's interface.
 *
 * Converted from the old battery's `test/meaningquery.test.mjs` and `test/rec108-cache-asof.test.mjs`. From the first:
 * retrieval's share of its runtime sections 7–11 and 11b — `leg:`, `resolves:` and `concerns:` answered by search at
 * bundle grain (a bundle with several matching rows once; total, paging and facets over the arm's scope), by meaningRows
 * at meaning grain, hidden as absent, and the syntax sentence naming `leg:hunch`. Its compile, grammar, vocabulary,
 * compound-width and source-text sections are query-language's, inquiry's and entities'. From the second: its block 7,
 * `rows=leg` answering an earned C beside an authored B through a registered resolver (the test's own, standing in for
 * inquiry's, its R52, as `meaning.test.mjs` does), and the leg read's `cached` notes. The rows in `inquiry_basis` and
 * `resolutions` are written as inquiry and entities write them. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, T0 } from "./fixture.mjs";
import { PROJECTION_RELATION } from "../../../src/retrieval/index.mjs";
import { MEANING, cachedNotes, compile } from "../../../src/query.mjs";

/* The old suite's corpus: two documents, five inquiries (two carrying hunch debt, one of them twice, one argued the
   other way, one testimony, one grounded, one resting on nothing). Ground truth is computed from this, never read back. */
const FIX = [
  { id: "INQ-HUNCH-1", legs: [
      { target: "INFO-A", role: "supports", grade: "B", axis: "connection", source: "hunch" },
      { target: "INFO-B", role: "supports", grade: "C", axis: "connection", source: "hunch" },
      { target: "INFO-B", role: "supports" }] },
  { id: "INQ-HUNCH-2", legs: [{ target: "INFO-A", role: "cuts_against", grade: "C", axis: "connection", source: "hunch" }] },
  { id: "INQ-GROUNDED", legs: [{ target: "INFO-A", role: "supports", ground: "charter" },
                               { target: "INFO-B", role: "supports", ground: "code" }] },
  { id: "INQ-TESTIMONY", legs: [{ target: "INFO-B", role: "cuts_against", grade: "D", axis: "connection", source: "testimony" }] },
  { id: "INQ-LEGLESS", legs: [] },
];
const hunchLegs = FIX.flatMap((f) => f.legs.filter((l) => l.source === "hunch").map(() => f.id));
const HUNCH = [...new Set(hunchLegs)].sort();

const writeLeg = (w, inq, ord, l) => w.st.sql.exec(
  `INSERT INTO inquiry_basis (bundle_id, ord, target_id, target_type, role, grade, grade_axis, grade_source, at, ground)
   VALUES (?,?,?,?,?,?,?,?,?,?)`, inq, ord, l.target, l.type || "information", l.role || "supports", l.grade ?? null,
  l.axis ?? null, l.source ?? null, T0, l.ground ?? null);

function corpus() {
  const w = world();
  w.doc("INFO-A", { title: "A memo about the sewer fund" });
  w.doc("INFO-B", { title: "A ledger naming the transfer" });
  for (const f of FIX) {
    w.doc(f.id, { object_type: "inquiry", title: `What does ${f.id} rest on?` });
    f.legs.forEach((l, i) => writeLeg(w, f.id, i, l));
  }
  return w;
}

const ids = (w, q, viewer = V("vera")) => w.retrieval.search({ q, viewer, mode: "ids" });

test("R6, R7: a meaning arm answered by search at bundle grain — exactly the bundles carrying a matching row, each once however many rows match; total agrees with the ids; every statement ran through the gate; paging covers the set exactly once; the facets count the arm's scope, not the corpus", () => {
  const w = corpus();
  assert.ok(hunchLegs.length > HUNCH.length, "one inquiry carries two hunch legs, so a join would repeat it");
  const got = ids(w, "leg:hunch");
  assert.deepEqual([...got.ids].sort(), HUNCH);
  assert.equal(new Set(got.ids).size, got.ids.length, "each bundle once");
  assert.equal(got.total, HUNCH.length);
  assert.ok(got.gate.applied > 0);
  const page = w.retrieval.search({ q: "leg:hunch", viewer: V("vera") });
  assert.deepEqual([page.total, page.hits.length, new Set(page.hits.map((h) => h.bundle_id)).size], [2, 2, 2]);
  /* The other questions the old suite asked, each against ground truth. */
  const withLeg = (pred) => FIX.filter((f) => f.legs.some(pred)).map((f) => f.id).sort();
  for (const [q, want] of [["leg:cuts_against", withLeg((l) => l.role === "cuts_against")],
                           ["leg:source=testimony", withLeg((l) => l.source === "testimony")],
                           ["leg:ground=*", withLeg((l) => !!l.ground)],
                           ["leg:grade=C", withLeg((l) => l.grade === "C")],
                           ["leg:axis=connection", withLeg((l) => l.axis === "connection")],
                           ["has:leg", withLeg(() => true)]]) {
    const r = ids(w, q);
    assert.deepEqual([[...r.ids].sort(), r.total], [want, want.length], q);
  }
  assert.equal(ids(w, "has:leg").ids.includes("INQ-LEGLESS"), false, "absence is real");
  /* Paging over an arm, one bundle a page, sorted: every bundle exactly once. */
  const legged = withLeg(() => true);
  const pages = [];
  for (let off = 0; off < legged.length + 1; off++)
    pages.push(...w.retrieval.search({ q: "has:leg", viewer: V("vera"), sort: "updated", limit: 1, offset: off, facets: false })
      .hits.map((h) => h.bundle_id));
  assert.deepEqual(pages.sort(), legged);
  /* The facets over the arm's scope: two inquiries, not the corpus's five, nor the three hunch legs. */
  const f = w.retrieval.search({ q: "leg:hunch", viewer: V("vera"), facets: ["type"] }).facets;
  assert.deepEqual(f.type, [{ value: "inquiry", n: HUNCH.length }]);
  /* Composed with a metadata filter the arm keeps its set; with one that excludes it, nothing. */
  assert.deepEqual([...ids(w, "leg:hunch type:inquiry").ids].sort(), HUNCH);
  assert.deepEqual(ids(w, "leg:hunch type:information").ids, []);
});

test("R11: the same arm at meaning grain — rows=leg with q=leg:hunch answers every leg of each inquiry the arm selects, one row per leg (a basis is never returned in part), total counting rows, not bundles, and the grain in words", () => {
  const w = corpus();
  const r = w.retrieval.meaningRows({ q: "leg:hunch", rows: "leg", viewer: V("vera") });
  assert.equal(r.ok, true);
  const scoped = FIX.filter((f) => HUNCH.includes(f.id)).flatMap((f) => f.legs.map((l, i) => [f.id, i, l.source ?? null]));
  assert.ok(scoped.length > hunchLegs.length, "the scope holds a leg that is not a hunch");
  assert.deepEqual([r.arm, r.grain, r.count, r.total], ["leg", MEANING.leg.rowGrain, scoped.length, scoped.length]);
  assert.deepEqual(r.rows.map((x) => [x.bundle_id, x.ord, x.grade_source]).sort(), scoped.sort());
  assert.equal(new Set(r.rows.map((x) => `${x.bundle_id}/${x.ord}`)).size, r.rows.length, "each leg once");
  assert.deepEqual(r.query.meaningArms.map((a) => `${a.arm}.${a.column}`), ["leg.grade_source"]);
  /* The bundle grain and the meaning grain of one question: 2 bundles, 3 rows, both right. */
  assert.equal(w.retrieval.search({ q: "leg:hunch", viewer: V("vera"), mode: "count" }).total, HUNCH.length);
});

/* A capture carrying references, and the resolutions entities writes for them: INFO-R (visible) and a project only ann
   may see, each holding one. */
function resolved() {
  const w = corpus();
  const c = w.cap("named", "a document naming two subjects");
  w.doc("INFO-R", {}, { captures: [c] });
  const h = w.cap("hidden", "a hidden document naming the same subject");
  const proj = w.project("Hidden Oversight", "ann", { captures: [h] });
  const res = (capSha, bundleId, ref, entity, grade) => w.st.sql.exec(
    `INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, basis, established, resolved_by, at)
     VALUES (?,?,?,?,?, 'recogniser', ?, 0, 'test', ?)`, capSha, bundleId, ref, entity, grade, ref, T0);
  res(c.sha, "INFO-R", "vendor:77", "ENT-1", "C");
  res(c.sha, "INFO-R", "office:sanitation", "ENT-2", "A");
  res(h.sha, proj, "vendor:77", "ENT-1", "C");
  return { w, proj };
}

test("R6, R11: resolves: and concerns: answer at both grains — the document carrying such a resolution, a grade or subject nothing resolved at finds nothing (not everything), and composition with a type that cannot carry it is empty", () => {
  const { w, proj } = resolved();
  for (const [q, want] of [["resolves:C", ["INFO-R"]], ["resolves:A", ["INFO-R"]], ["resolves:grade=Z", []],
                           ["concerns:ENT-1", ["INFO-R"]], ["concerns:ENT-2", ["INFO-R"]], ["concerns:ENT-9999", []],
                           ["concerns:ENT-1 type:information", ["INFO-R"]], ["concerns:ENT-1 type:inquiry", []]]) {
    const r = ids(w, q);
    assert.deepEqual([r.ids, r.total], [want, want.length], q);
  }
  /* The resolution rows at meaning grain: both of INFO-R's, one per row; the hidden project's is not among them. */
  const rows = w.retrieval.meaningRows({ q: "", rows: "resolves", viewer: V("vera") });
  assert.deepEqual([rows.count, rows.total], [2, 2]);
  assert.deepEqual(rows.rows.map((r) => [r.bundle_id, r.entity_id, r.grade]).sort(), [["INFO-R", "ENT-1", "C"], ["INFO-R", "ENT-2", "A"]]);
  /* concerns:ENT-1 selects INFO-R and the project; their whole resolution sets are the rows. */
  const c = w.retrieval.meaningRows({ q: "concerns:ENT-1", rows: "concerns", viewer: V("ann") });
  assert.deepEqual(c.rows.map((r) => [r.bundle_id, r.entity_id]).sort(),
    [["INFO-R", "ENT-1"], ["INFO-R", "ENT-2"], [proj, "ENT-1"]].sort(), "the entitled viewer reads the project's row");
  assert.deepEqual(w.retrieval.meaningRows({ q: "concerns:ENT-1", rows: "concerns", viewer: V("vera") }).rows
    .map((r) => [r.bundle_id, r.entity_id]).sort(), [["INFO-R", "ENT-1"], ["INFO-R", "ENT-2"]]);
});

test("R29: hidden answers as absent through a meaning arm — the project's resolution moves no id, total, facet or meaning-grain count for a member outside it, and an unrecognised viewer sees zero on every statement at once", () => {
  const { w, proj } = resolved();
  const vera = ids(w, "resolves:C");
  assert.deepEqual([vera.ids, vera.total], [["INFO-R"], 1]);
  const ann = ids(w, "resolves:C", V("ann"));
  assert.deepEqual([[...ann.ids].sort(), ann.total], [["INFO-R", proj].sort(), 2]);
  /* Byte-identical to a world where the project never existed. */
  const base = corpus();
  const c = base.cap("named", "a document naming two subjects");
  base.doc("INFO-R", {}, { captures: [c] });
  for (const [ref, entity, grade] of [["vendor:77", "ENT-1", "C"], ["office:sanitation", "ENT-2", "A"]])
    base.st.sql.exec(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, basis, established, resolved_by, at)
                      VALUES (?, 'INFO-R', ?, ?, ?, 'recogniser', ?, 0, 'test', ?)`, c.sha, ref, entity, grade, ref, T0);
  const answers = (x) => JSON.stringify([
    x.retrieval.search({ q: "resolves:C", viewer: V("vera"), facets: ["type", "state"] }),
    x.retrieval.search({ q: "concerns:ENT-1", viewer: V("vera"), mode: "ids" }),
    x.retrieval.search({ q: "resolves:C OR leg:hunch", viewer: V("vera"), mode: "count" }),
    x.retrieval.meaningRows({ q: "", rows: "concerns", viewer: V("vera") })]);
  assert.equal(answers(w), answers(base));
  /* The fail-closed half: an unrecognised viewer, every statement, one query. */
  for (const viewer of ["whoever", null]) {
    const s = w.retrieval.search({ q: "leg:hunch", viewer });
    assert.deepEqual([s.total, s.hits, s.gate.scope], [0, [], "DENY"], String(viewer));
    assert.ok(Object.values(s.facets).every((l) => l.length === 0), "no facet counts what the page withheld");
    assert.deepEqual(ids(w, "leg:hunch", viewer).ids, []);
    assert.equal(w.retrieval.search({ q: "resolves:C", viewer, mode: "count" }).total, 0);
    const m = w.retrieval.meaningRows({ q: "leg:hunch", rows: "leg", viewer });
    assert.deepEqual([m.count, m.total], [0, 0]);
  }
  /* The same query, a recognised viewer: armed against real rows. */
  assert.equal(w.retrieval.search({ q: "leg:hunch", viewer: V("vera") }).total, HUNCH.length);
});

test("R16: the syntax sentences name the meaning arms a member would type — leg:hunch as hunch debt, resolves: and concerns: — and say they answer at record grain; no arm is published as a projected field", () => {
  const f = world().retrieval.searchFields();
  const s = f.syntax.find((x) => x.includes("leg:hunch"));
  assert.ok(s, "a sentence names leg:hunch");
  assert.match(s, /hunch debt/);
  assert.match(s, /resolves:/);
  assert.match(s, /concerns:/);
  assert.match(s, /RECORD grain/);
  assert.deepEqual(Object.keys(MEANING).filter((a) => a in f.fields), []);
});

test("R12, R55: rows=leg through a registered resolver — a leg authored B on the capture axis answers the earned C with grade_authored B, grade_axis capture and the resolver's why verbatim; the control leg whose authored letter stands answers unchanged; selecting on the authored letter returns the row answering the earned one", () => {
  const w = world();
  w.doc("INFO-OCR");
  w.doc("INFO-TYPED");
  w.doc("INQ-MOVER", { object_type: "inquiry", title: "What does the mover rest on?" });
  w.doc("INQ-CLEAN", { object_type: "inquiry", title: "What does the control rest on?" });
  writeLeg(w, "INQ-MOVER", 0, { target: "INFO-OCR", grade: "B", axis: "capture", source: "capture" });
  writeLeg(w, "INQ-CLEAN", 0, { target: "INFO-TYPED", grade: "B", axis: "capture", source: "capture" });
  const WHY = "the capture was re-read by OCR capped at C, so the record can support no more than C for this leg";
  const calls = [];
  assert.equal(w.retrieval.registerLegGrades("inquiry", (legs) => {
    calls.push(legs);
    return legs.map((l) => (l.target_id === "INFO-OCR" ? { grade: "C", why: WHY } : null));
  }).ok, true);
  const mr = w.retrieval.meaningRows({ q: "type:inquiry", rows: "leg", viewer: V("vera"), limit: 500 });
  assert.equal(calls.length, 1, "one resolver call for the page");
  assert.deepEqual(calls[0].map((l) => [l.target_id, l.grade]).sort(), [["INFO-OCR", "B"], ["INFO-TYPED", "B"]]);
  const leg = (inq) => mr.rows.filter((r) => r.bundle_id === inq);
  assert.equal(leg("INQ-MOVER").length, 1);
  const [m] = leg("INQ-MOVER");
  assert.deepEqual({ earned: m.grade, authored: m.grade_authored, axis: m.grade_axis, why: m.grade_why, target: m.target_id },
    { earned: "C", authored: "B", axis: "capture", why: WHY, target: "INFO-OCR" });
  const [c] = leg("INQ-CLEAN");
  assert.deepEqual([c.grade, c.grade_authored, c.grade_why], ["B", "B", null]);
  /* The selector reads the authored column; the row it returns answers with the earned letter beside it. */
  const sel = w.retrieval.meaningRows({ q: "leg:grade=B leg:axis=capture", rows: "leg", viewer: V("vera") });
  assert.deepEqual(sel.rows.map((r) => [r.bundle_id, r.grade, r.grade_authored]).sort(),
    [["INQ-CLEAN", "B", "B"], ["INQ-MOVER", "C", "B"]]);
  /* It reads inquiry_basis live: no cached column, so the note is an empty statement, key present. */
  assert.deepEqual(mr.cached, []);
  assert.ok(Object.prototype.hasOwnProperty.call(mr, "cached"));
});

test("R8, R11: a leg read filtered on a cached field states it by the filter route only — a sort or the default facets add no route at meaning grain — and it is query-language's cachedNotes for that route", () => {
  const w = corpus();
  w.st.sql.exec(`UPDATE bundles SET inquiry_capture_strength='B', inquiry_connection_strength='C' WHERE bundle_id LIKE 'INQ-%'`);
  for (const q of ["capture:B", "capture:B sort:capture", "capture:B connection:C sort:connection"]) {
    const r = w.retrieval.meaningRows({ q, rows: "leg", viewer: V("vera") });
    const plan = compile({ q, viewer: V("vera"), rows: "leg" }, { projection: PROJECTION_RELATION });
    assert.deepEqual(r.cached, cachedNotes(plan.cached, { facets: false, ordered: false }), q);
    assert.ok(r.cached.length > 0 && r.cached.every((n) => n.via.join("+") === "filter"), q);
    assert.ok(r.total > 0, `${q}: armed against real rows`);
  }
  const both = w.retrieval.meaningRows({ q: "capture:B connection:C", rows: "leg", viewer: V("vera") });
  assert.deepEqual(both.cached.map((n) => n.field), ["capture", "connection"]);
  assert.deepEqual(w.retrieval.meaningRows({ q: "leg:hunch", rows: "leg", viewer: V("vera") }).cached, [], "no cached column read");
});
