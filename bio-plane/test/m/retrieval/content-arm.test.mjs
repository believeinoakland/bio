/* retrieval: the `content:` arm's rows at content grain (R11, R13), the gate over them (R29), and the path a caller
 * takes, `op=meaningrows` and `op=search` through `retrievalRoutes` (R58), at the module's interface.
 *
 * Converted from the old battery's `test/content-arm.test.mjs` (REC-90). Its retrieval share: §6's `rows=content`
 * envelope, §8's four-level statement and its sentences, §9's two members seeing the same content rows, and the old
 * suite's rule that every arm is driven through the op (there inside workerd; here the fixture's storage answers as
 * workerd does, cursors and the LIKE/GLOB cap included, and the op is `retrievalRoutes`). The vocabulary, the filters'
 * semantics, the `cited`/`chain_last` columns, the whole-set rule and the three columns on `rows=leg` are
 * query-language's and are tested there. The content rows are written into `content` as the `content` module's mint
 * writes them; the legs into `inquiry_basis` and `inquiry_basis_version_legs` as a promoted basis leaves them. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, T0, sha } from "./fixture.mjs";
import { retrievalRoutes } from "../../../src/retrieval/index.mjs";
import { MEANING, meaningVocabulary } from "../../../src/query.mjs";
import { CONTENT_MINTED_BY_PLANE } from "../../../src/content/index.mjs";

const DOC_OCR = "INFO-9000-ocr", DOC_LAYER = "INFO-9000-layer", DOC_BARE = "INFO-9000-bare",
      DOC_NONE = "INFO-9000-uncited", DOC_VER = "INFO-9000-versioned", INQ = "INQ-9000-basis";
const ocr = (cap) => [{ step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
                      { step: "ocr", engine: "tesseract", version: "5.3.4", cap, extent: { kind: "pages", pages: [0, 1, 2] } }];
const layer = [{ step: "layer" }];

/* One content row, as content's mint writes it: the id over the capture, the canonical extent and the chain. */
function mint(w, { bundle, capture, extent, ref, chain = null, cap = null, by = CONTENT_MINTED_BY_PLANE, stale = 0, kind = null }) {
  const ex = JSON.stringify(extent), ch = chain == null ? null : JSON.stringify(chain);
  const id = sha(`${capture}\n${ex}\n${ch}`);
  w.st.sql.exec(`INSERT OR IGNORE INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, chain, derivation_cap,
                 page_count, minted_by, at, stale, cited_as, chain_kind) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'text',?)`,
    id, capture, bundle, extent.kind, ex, ref, ch, cap, null, by, T0, stale, kind);
  return id;
}

/* The old suite's corpus: an OCR'd document re-read since its rows were minted (stale), a text-layer one with a
   plane row and a machine-marked page, a captured one a member marked, one cited only by a recorded basis version,
   one with no content row at all, and the inquiry whose legs cite them. ann owns a project vera may not see. */
function corpus() {
  const w = world();
  const c = Object.fromEntries(["ocr", "layer", "bare", "ver"].map((k) => [k, w.cap(k, `rec90-${k}-bytes`)]));
  w.doc(DOC_OCR, {}, { captures: [c.ocr] });
  w.doc(DOC_LAYER, {}, { captures: [c.layer] });
  w.doc(DOC_BARE, {}, { captures: [c.bare] });
  w.doc(DOC_NONE, { title: "A document nobody has cited" });
  w.doc(DOC_VER, {}, { captures: [c.ver] });
  w.doc(INQ, { object_type: "inquiry", title: "What does it rest on?" });
  const proj = w.project("Oversight", "ann", { captures: [w.cap("proj", "project bytes")] });
  const ids = {
    ocrDoc: mint(w, { bundle: DOC_OCR, capture: c.ocr.sha, extent: { kind: "document" }, ref: "the whole document",
                      chain: ocr("C"), cap: "C", stale: 1, kind: "ocr" }),
    ocrPage: mint(w, { bundle: DOC_OCR, capture: c.ocr.sha, extent: { kind: "pdf-page", page: 1 }, ref: "page 2, the transfer table",
                       chain: ocr("C"), cap: "C", stale: 1, kind: "ocr" }),
    layerDoc: mint(w, { bundle: DOC_LAYER, capture: c.layer.sha, extent: { kind: "document" }, ref: "the whole document",
                        chain: layer, kind: "layer" }),
    machine: mint(w, { bundle: DOC_LAYER, capture: c.layer.sha, extent: { kind: "pdf-page", page: 2 }, ref: "page 3",
                       chain: layer, kind: "layer", by: "class:extractor" }),
    member: mint(w, { bundle: DOC_BARE, capture: c.bare.sha, extent: { kind: "document" }, ref: "the whole document", by: "ann" }),
    ver: mint(w, { bundle: DOC_VER, capture: c.ver.sha, extent: { kind: "document" }, ref: "the whole document",
                   chain: layer, kind: "layer" }),
  };
  const leg = (ord, target, content) => w.st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, target_id, target_type, role, at,
    content_id) VALUES (?,?,?, 'information', 'supports', ?, ?)`, INQ, ord, target, T0, content);
  leg(0, DOC_OCR, ids.ocrDoc); leg(1, DOC_OCR, ids.ocrPage); leg(2, DOC_LAYER, ids.layerDoc);
  w.st.sql.exec(`INSERT INTO inquiry_basis_version_legs (bundle_id, name, ord, target_id, target_type, role, at, ground, content_id)
                 VALUES (?, 'v1', 0, ?, 'information', 'supports', ?, 'charter', ?)`, INQ, DOC_VER, T0, ids.ver);
  return { w, proj, ids };
}

const rows = (w, q, viewer = V("vera"), arm = "content") => w.retrieval.meaningRows({ q, rows: arm, viewer });

test("R11, R13: rows=content answers at content grain and says so — arm, table, identity, level and the grain's sentence; each row carries exactly the arm's published columns, one row per content row, total and count agreeing; the statement counts the content level at its own level and names the meaning level undetermined", () => {
  const { w, ids } = corpus();
  const r = rows(w, "has:content");
  assert.deepEqual([r.ok, r.arm, r.table, r.identity, r.level], [true, "content", "content", ["content_id"], "content"]);
  assert.equal(r.grain, "one content row — one addressable extent of one capture under one chain; cited or citable, and it says which");
  assert.equal(r.grain, MEANING.content.rowGrain);
  const published = meaningVocabulary().content.rows.columns;
  for (const row of r.rows)
    assert.deepEqual(Object.keys(row), ["bundle_id", "bundle_type", ...published], row.content_id);
  assert.equal("chain" in r.rows[0], false, "the chain blob is not in the row list");
  /* One row per content row: every minted row, once, in the grain's own order. */
  assert.deepEqual(r.rows.map((x) => x.content_id).sort(), Object.values(ids).sort());
  const key = (x) => [x.bundle_id, x.content_id];
  assert.deepEqual(r.rows.map(key), r.rows.map(key).sort((a, b) => (a[0] !== b[0] ? (a[0] < b[0] ? -1 : 1) : a[1] < b[1] ? -1 : 1)));
  assert.deepEqual([r.total, r.count, r.limit, r.offset], [6, 6, r.limit, 0]);
  assert.deepEqual(r.gate, { scope: "participant", applied: 3 }, "count, rows and the levels tally, each through the gate");
  /* The statement: `has:content` is the arm itself, so the scope is every document vera may see (the query has no other
     arm), four of the six holding content rows. */
  assert.deepEqual(r.scope, { documents: 6, documents_with_rows: 4, documents_without_rows: 2 });
  assert.deepEqual(Object.keys(r.levels), ["internet", "document", "content", "meaning"]);
  assert.deepEqual([r.levels.document.state, r.levels.document.documents], ["COUNTED", 6]);
  assert.deepEqual(r.levels.content, { state: "COUNTED", documents_with_rows: 4, rows_matched: 6,
    why: "4 of 6 document(s) in scope hold content rows; 2 hold none" });
  assert.equal(r.levels.meaning.state, "UNDETERMINED");
  assert.match(r.levels.meaning.why, /`content:cited` and `content:uncited` answer it/);
  assert.equal(r.says, "6 row(s) over 6 document(s) in scope");
  /* Paging: a page of two, then the rest, is the same set with no row twice. */
  const p1 = w.retrieval.meaningRows({ q: "has:content", rows: "content", viewer: V("vera"), limit: 2 });
  const p2 = w.retrieval.meaningRows({ q: "has:content", rows: "content", viewer: V("vera"), limit: 10, offset: 2 });
  assert.deepEqual([p1.count, p1.total, p2.count, p2.total], [2, 6, 4, 6]);
  assert.deepEqual([...p1.rows, ...p2.rows].map((x) => x.content_id), r.rows.map((x) => x.content_id));
});

test("R13: which level was empty is said by the envelope — a document in scope with no content row, no document in scope at all, and rows the filters excluded are three different answers; the level this read cannot reach is named undetermined; a meaning-level arm names rows=content as the read that answers the content level", () => {
  const { w } = corpus();
  /* A document in scope holding no content row. */
  const e = rows(w, `id:${DOC_NONE}`);
  assert.deepEqual([e.ok, e.total, e.rows], [true, 0, []]);
  assert.deepEqual(e.scope, { documents: 1, documents_with_rows: 0, documents_without_rows: 1 });
  assert.equal(e.levels.content.state, "COUNTED");
  assert.match(e.levels.content.why, /^none of the 1 document\(s\) in scope holds a single content row/);
  assert.match(e.levels.content.why, /a fact about CITATION and never evidence about what those documents say/);
  assert.match(e.levels.content.why, /`passage:` with `rows=passage` is the arm that searches what those documents SAY/);
  assert.equal(e.says, "nothing matched over 1 document(s) in scope, none of which holds a row of this kind at all. "
    + "That is absence at THIS level and says nothing about the level below it");
  assert.deepEqual(Object.keys(e.levels), ["internet", "document", "content", "meaning"]);
  assert.equal(e.levels.internet.state, "UNDETERMINED");
  assert.match(e.levels.internet.why, /observation log, which this read does not reach/);
  assert.match(e.levels.internet.why, /cannot tell 'we looked and found nothing' from 'nobody has looked yet'/);
  /* No document in scope at all. */
  const none = rows(w, "id:NOTHING-AT-ALL");
  assert.deepEqual([none.total, none.rows, none.scope.documents, none.levels.document.state, none.levels.document.documents],
    [0, [], 0, "COUNTED", 0]);
  assert.match(none.levels.document.why, /no document is in scope at all/);
  assert.equal(none.says, "nothing matched, and no document was in scope to match in — this is an empty DOCUMENT level, not an empty record");
  assert.notEqual(JSON.stringify(e.levels), JSON.stringify(none.levels), "the two empties differ by the envelope alone");
  assert.notEqual(e.says, none.says);
  /* A document holding content rows, none of which the filter admits. */
  const cut = rows(w, `id:${DOC_OCR} content:machine`);
  assert.deepEqual([cut.total, cut.rows], [0, []]);
  assert.deepEqual(cut.scope, { documents: 1, documents_with_rows: 1, documents_without_rows: 0 });
  assert.equal(cut.says, "nothing matched over 1 document(s) in scope, 1 of which hold rows of this kind that this query's filters excluded");
  assert.ok(![e.says, none.says].includes(cut.says));
  /* A meaning-level arm carries the same block at its own level, and sends the content question to rows=content. */
  const l = rows(w, "has:leg", V("vera"), "leg");
  assert.deepEqual([l.level, l.levels.meaning.state, l.levels.content.state], ["meaning", "COUNTED", "UNDETERMINED"]);
  assert.match(l.levels.content.why, /`content:` with `rows=content`/);
  assert.match(l.levels.content.why, /`passage:` with\s+`rows=passage`/);
  assert.deepEqual([l.total, l.says], [3, "3 row(s) over 6 document(s) in scope"]);
});

test("R29: two members see the same content rows — every content row hangs off an information bundle, which the participant clause does not fence — while the gate is live on the same call (ann's project is in her scope, not vera's); an absent viewer sees none and a zero", () => {
  const { w, proj } = corpus();
  const vera = rows(w, "has:content", V("vera")), ann = rows(w, "has:content", V("ann"));
  assert.equal(vera.total, 6, "armed: the corpus holds content rows");
  for (const k of ["rows", "total", "count", "gate", "level", "query"]) assert.deepEqual(ann[k], vera[k], k);
  assert.deepEqual([...new Set(vera.rows.map((x) => x.bundle_type))], ["information"]);
  assert.deepEqual([vera.gate, ann.gate], [{ scope: "participant", applied: 3 }, { scope: "participant", applied: 3 }]);
  /* The gate is live on the same call: ann's project is a document in her scope and absent from vera's, which says
     nothing of it. */
  assert.deepEqual([vera.scope.documents, ann.scope.documents], [6, 7]);
  assert.deepEqual([vera.scope.documents_with_rows, ann.scope.documents_with_rows], [4, 4]);
  assert.equal(JSON.stringify(vera).includes(proj), false);
  assert.equal(Object.keys(vera).some((k) => /withheld|hidden/.test(k)), false);
  /* No viewer: nothing, and no figure states what was withheld. */
  const deny = rows(w, "has:content", null);
  assert.deepEqual([deny.rows, deny.total, deny.scope.documents, deny.gate.scope], [[], 0, 0, "DENY"]);
});

test("R58: op=meaningrows and op=search through retrievalRoutes answer exactly what the service answers for the content arm, for each viewer, over the storage that answers as workerd does; searching mints nothing", () => {
  const { w } = corpus();
  const route = (op, params, body) => retrievalRoutes(w.retrieval, new URL(`http://x/${op}?${new URLSearchParams(params)}`), body)[op]();
  const before = w.count("content");
  const qs = ["has:content", `id:${DOC_NONE}`, "id:NOTHING-AT-ALL", "content:pdf-page", "content:ocr content:cap<D",
              "content:machine", "content:cap=undetermined", "content:uncited", `id:${DOC_OCR} content:machine`];
  for (const viewer of [V("vera"), V("ann")]) {
    for (const q of qs) {
      const got = route("meaningrows", { q, rows: "content", viewer });
      assert.deepEqual(got, w.retrieval.meaningRows({ q, rows: "content", viewer }), `${q} ${viewer}`);
      assert.deepEqual(route("meaningrows", { q, rows: "content", viewer, limit: "2", offset: "1" }),
        w.retrieval.meaningRows({ q, rows: "content", viewer, limit: 2, offset: 1 }), `${q} paged`);
      assert.deepEqual(route("search", { q, viewer, mode: "ids" }), w.retrieval.search({ q, viewer, mode: "ids" }), `${q} ids`);
      assert.deepEqual(route("search", { q, viewer, mode: "count" }), w.retrieval.search({ q, viewer, mode: "count" }), `${q} count`);
    }
  }
  /* Armed: the routes answer real rows and real ids, at both grains. */
  assert.equal(route("meaningrows", { q: "has:content", rows: "content", viewer: V("vera") }).total, 6);
  assert.deepEqual(route("search", { q: "content:pdf-page", viewer: V("vera"), mode: "ids" }).ids.sort(), [DOC_LAYER, DOC_OCR].sort());
  /* The refusals travel through the route as the service gives them. */
  assert.deepEqual(route("meaningrows", { q: "has:content", viewer: V("vera") }),
    w.retrieval.meaningRows({ q: "has:content", viewer: V("vera") }));
  assert.equal(route("meaningrows", { q: "has:content", viewer: V("vera") }).reason, "MEANING_ROWS_NO_ARM");
  /* No viewer stamp: nothing. */
  assert.deepEqual([route("meaningrows", { q: "has:content", rows: "content" }).total,
                    route("search", { q: "content:pdf-page", mode: "ids" }).ids], [0, []]);
  assert.equal(w.count("content"), before, "a hit is an address: no content row was minted by any read");
});
