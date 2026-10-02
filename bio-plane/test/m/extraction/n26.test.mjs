/* extraction, N26: moving the ¶ and table references of `.docx` readings made before N26 (R66; office-readers R11,
   R16, R28; K747, K763), and the promotion projection that does not undo it (R20). A reading "made before N26" is
   built here as the old walk wrote it (every branch of an mc:AlternateContent numbered), over bytes held in the
   evidence store; the migration re-reads those bytes through the docx entry and moves the references by
   `docxRenumbering`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, wp, wr, wtbl, box, docx, bucket } from "./fixture.mjs";
import { n26MigratedReading, n26Marked, renumberingMoves, N26_READER_MARK } from "../../../src/extraction/index.mjs";
import { textUnitsFor, layerChainFor, readingProvenance } from "../../../src/reading-pipeline/index.mjs";
import { docxRenumbering } from "../../../src/docx.mjs";
import { glyphCount } from "../../../src/textchain.mjs";

/* The document: a paragraph holding a text box (Choice and its Fallback copy), a plain paragraph, a paragraph holding
   a boxed table (Choice) whose Fallback holds a second copy, and a table after. Under N26: six paragraphs, two tables;
   the old walk numbered eight paragraphs and three tables. */
const BODY = wp(wr("before "), box([wp(wr("boxed"))]), wr("after")) + wp(wr("next"))
  + wp(box([wtbl("t in box")])) + wtbl("after table");
const OLD_PARAS = ["before after", "boxed", "boxed", "next", "", "t in box", "t in box", "after table"];
const NEW_PARAS = ["before after", "boxed", "next", "", "t in box", "after table"];
const P = (para, run) => ({ kind: "doc-para", ref: `¶${para + 1}`, para, run: run ?? null });
const T = (table, cell) => ({ kind: "doc-table", ref: `table ${table + 1}${cell ? `, ${cell}` : ""}`, table, ...(cell ? { cell } : {}) });
const AT = "2026-09-01T00:00:00Z";

const oldText = () => {
  const paragraphs = OLD_PARAS.map((text, para) => ({ para, ref: `¶${para + 1}`, text }));
  const document = OLD_PARAS.filter((t) => t.length).join("\n");
  return { ok: true, container: "docx", document, paragraphs, tables: [0, 1, 2].map((t) => ({ table: t, ref: `table ${t + 1}`, rows: 1, cols: 1 })),
           undetermined: [], counts: { chars: document.length, undetermined: 0 } };
};

/* The reading as the pre-N26 read composed it: references at the old numbers, the old paragraph count and tables. */
async function oldReading() {
  const text = oldText();
  const chain = layerChainFor(text, { tier: 1, container: "docx" });
  return {
    content_type: "doc", reader_version: 1, read_from_text: true, found: true, at: AT,
    entities: [
      { key: "1", kind: "item", label: "Next", facts: {}, ref: "item:1", source: P(3),
        occurrences: [P(1), P(2), P(7)] },
      { key: "b", kind: "box", label: "Boxed", facts: {}, ref: "box:b", source: P(2, 0) },
      { key: "t", kind: "tbl", label: null, facts: {}, ref: "tbl:t", source: T(2, "A1") },
      { key: "g", kind: "gone", label: null, facts: {}, ref: "gone:g", source: T(1) },
    ],
    facts: { link: { partition: "anchor", wrapper: "anchor:#para=7", target: { para: 6, fragment: "#para=7", bookmark: "bm" },
                     source: P(7, 0) } },
    text_source: chain, text_tier: 1, text_container: "docx", basis: "read by the doc reader",
    position_parts: 8, position_why: null, page_count: null, page_boxes: null,
    container_extent: { container: "docx", levels: ["paragraphs", "tables"], sheets: null, paragraphs: 8, slides: null,
                        tables: [{ rows: 1, cols: 1 }, { rows: 1, cols: 9 }, { rows: 1, cols: 2 }] },
    provenance: await readingProvenance({ text, chain, tier: 1, container: "docx" }),
    text_chars: text.document.length, text_glyphs: glyphCount(text.document), text_undetermined: 0,
  };
}

/* A store holding the document's bytes and its old reading in bundle INFO-1. */
async function seeded({ body = BODY, reading = null, evidence = bucket(), origin = "composed", author = null } = {}) {
  const f = fresh({ evidence });
  const digest = await hold(evidence, docx(body));
  bundle(f.s, "INFO-1");
  const r = reading || await oldReading();
  const u = textUnitsFor(oldText());
  const notices = [];
  f.x.onReading("observation-log", (e) => { notices.push(e); return null; });
  f.x.writeReading({ bundleId: "INFO-1", captureSha: digest, reading: r, textUnits: u.textUnits, profileFormat: "docx",
                     composed: origin === "composed", author, justification: origin === "asserted" ? "read it aloud" : null });
  notices.length = 0;
  return { ...f, digest, old: r, notices };
}

test("R66 R28: renumbering's map over the stored document.xml moves paragraphs, runs and tables, and a document with no mc:AlternateContent moves nothing", async () => {
  const xml = (b) => `<w:document><w:body>${b}</w:body></w:document>`;
  const map = docxRenumbering(xml(BODY));
  assert.equal(renumberingMoves(map), true);
  assert.deepEqual(map.paragraphs.map((p) => p.new), [0, 1, null, 2, 3, 4, null, 5]);
  assert.equal(renumberingMoves(docxRenumbering(xml(wp(wr("a")) + wtbl("b")))), false);
  assert.equal(renumberingMoves(null), false);
});

test("R66: a pre-N26 docx reading is migrated once: re-read from its bytes, every reference moved, the old reading kept, the chain marked, R19's writer and its listeners", async () => {
  const f = await seeded();
  const out = await f.x.migrateDocxReadings();
  assert.equal(out.done, true);
  assert.equal(out.examined, 1);
  assert.deepEqual(out.migrated.map((m) => m.capture_sha), [f.digest]);
  const got = f.x.readingFor(f.digest).reading;
  const [item, boxed, tbl, gone] = got.entities;
  /* doc-para: to `new`, and its ref; inside a branch not read: to `outer`, a whole paragraph, no run. */
  assert.deepEqual(item.source, P(2));
  assert.deepEqual(item.occurrences, [P(1), P(0), P(5)]);
  assert.deepEqual(boxed.source, P(0));
  /* doc-table: to `new` with its ref and cell; one in a branch not read is unplaced. */
  assert.deepEqual(tbl.source, T(1, "A1"));
  assert.equal(gone.source, null);
  /* a #para= anchor's target and the link's run source. */
  assert.deepEqual(got.facts.link.target, { para: 3, fragment: "#para=4", bookmark: "bm" });
  assert.equal(got.facts.link.wrapper, "anchor:#para=4");
  assert.deepEqual(got.facts.link.source, P(5, 0));
  /* the paragraph count, the tables N26 reads in its order, and the text's counts: the duplicate lost, nothing gained. */
  assert.equal(got.container_extent.paragraphs, 6);
  assert.deepEqual(got.container_extent.tables, [{ rows: 1, cols: 1 }, { rows: 1, cols: 2 }]);
  const doc = NEW_PARAS.filter((t) => t.length).join("\n");
  assert.deepEqual([got.text_chars, got.text_glyphs, got.text_undetermined], [doc.length, glyphCount(doc), 0]);
  /* the mark, the migration's own statement, and what did not change. */
  assert.equal(got.text_source[0].reader, N26_READER_MARK);
  assert.equal(n26Marked(got), true);
  assert.equal(n26Marked(f.old), false);
  assert.deepEqual(got.migrated.n26.moved, { paragraphs: 4, runs: 2, tables: 2, unplaced: 1 });
  for (const k of ["content_type", "reader_version", "at", "basis", "found", "text_tier", "text_container"])
    assert.deepEqual(got[k], f.old[k], k);
  assert.notEqual(got.provenance.text_sha256, f.old.provenance.text_sha256);
  /* R23: the reading it replaces is kept, then the new one. */
  const hist = f.rows(`SELECT reading FROM reading_history WHERE capture_sha=? ORDER BY seq`, f.digest);
  assert.deepEqual(hist.map((h) => JSON.parse(h.reading)), [f.old, got]);
  /* the text units rebuilt by R22 at N26's numbering, no duplicated branch; the references' places moved. */
  assert.deepEqual(f.rows(`SELECT extent, text FROM capture_text WHERE capture_sha=? ORDER BY seq`, f.digest)
                     .map((u) => [JSON.parse(u.extent).para, u.text]),
                   NEW_PARAS.map((t, i) => [i, t]).filter(([, t]) => t.length));
  assert.deepEqual(f.rows(`SELECT occurrence FROM reading_refs WHERE ref='item:1' ORDER BY seq`).map((r) => r.occurrence),
                   [2, 1, 0, 5].map((p) => `doc-para:${JSON.stringify({ para: p, run: null })}`));
  /* R19's listeners ran once, the plane's act, with the chain before and after differing (content R22 stales on it). */
  assert.equal(f.notices.length, 1);
  const e = f.notices[0];
  assert.equal(e.author, null);
  assert.notDeepEqual(e.chainAfter, e.chainBefore);
  assert.deepEqual(e.unitsBefore.map((u) => u.text), OLD_PARAS.filter((t) => t.length));
  /* once: a second run reads nothing and moves nothing. */
  const again = await f.x.migrateDocxReadings();
  assert.deepEqual([again.done, again.examined, again.migrated], [true, 0, []]);
  assert.deepEqual(f.x.readingFor(f.digest).reading, got);
  assert.equal(f.notices.length, 1);
});

test("R66: a docx reading whose renumbering moves nothing gets no mark and no re-read; a reading of another format is not a candidate", async () => {
  const plain = wp(wr("one")) + wp(wr("two")) + wtbl("t");
  const evidence = bucket();
  const f = await seeded({ body: plain, evidence });
  const html = await hold(evidence, "<p>x</p>");
  f.x.writeReading({ bundleId: "INFO-1", captureSha: html, reading: { content_type: "doc", found: false, entities: [], at: AT,
    text_source: layerChainFor(null, { tier: 1, container: "html" }) }, profileFormat: "html", composed: true });
  f.notices.length = 0;
  const before = f.rows(`SELECT * FROM readings ORDER BY capture_sha`);
  const out = await f.x.migrateDocxReadings();
  assert.deepEqual([out.done, out.examined, out.unmoved, out.migrated], [true, 1, 1, []]);
  assert.deepEqual(f.rows(`SELECT * FROM readings ORDER BY capture_sha`), before);
  assert.equal(f.one(`SELECT count(*) c FROM reading_history WHERE capture_sha=?`, f.digest).c, 1);
  assert.equal(n26Marked(f.x.readingFor(f.digest).reading), false);
  assert.equal(f.notices.length, 0);
});

test("R66: a reading already marked moves nothing; one written after the migration's cutoff, or whose paragraph count is N26's, is left as it is", async () => {
  /* Marked: the migrated reading carried into another store. */
  const a = await seeded();
  await a.x.migrateDocxReadings();
  const marked = a.x.readingFor(a.digest).reading;
  const b = await seeded({ reading: marked });
  const ob = await b.x.migrateDocxReadings();
  assert.deepEqual(ob.skipped.map((s) => s.why), ["already migrated"]);
  assert.deepEqual(b.x.readingFor(b.digest).reading, marked);
  /* N26's paragraph count: a reading the new walk made. */
  const fresh26 = { ...(await oldReading()), container_extent: { container: "docx", levels: ["paragraphs"], paragraphs: 6 } };
  const c = await seeded({ reading: fresh26 });
  const oc = await c.x.migrateDocxReadings();
  assert.equal(oc.migrated.length, 0);
  assert.match(oc.skipped[0].why, /paragraph count/);
  assert.deepEqual(c.x.readingFor(c.digest).reading, fresh26);
  /* After the cutoff: two old readings; the first run takes one; the other is then written again (a promotion after
     the migration started, so N26's), and the second run leaves it as it is. */
  const evidence = bucket();
  const d = await seeded({ evidence });
  const other = await hold(evidence, docx(BODY + wp(wr("tail"))));
  d.x.writeReading({ bundleId: "INFO-1", captureSha: other, reading: await oldReading(), profileFormat: "docx", composed: true });
  const first = await d.x.migrateDocxReadings({ limit: 1 });
  assert.deepEqual([first.done, first.examined], [false, 1]);
  const [, late] = [d.digest, other].sort();
  const rewritten = { ...(await oldReading()), basis: "written again after the migration started" };
  d.x.writeReading({ bundleId: "INFO-1", captureSha: late, reading: rewritten, profileFormat: "docx", composed: true });
  const rest = await d.x.migrateDocxReadings();
  assert.deepEqual([rest.done, rest.examined, rest.migrated.length], [true, 1, 0]);
  assert.match(rest.skipped[0].why, /after the migration's cutoff/);
  assert.deepEqual(d.x.readingFor(late).reading, rewritten);
});

test("R66: bytes not held, or a stored reading that changed while the bytes were read, leave the stored reading as it stands", async () => {
  /* not held */
  const ev1 = bucket();
  const a = await seeded({ evidence: ev1 });
  ev1.held.clear();
  const oa = await a.x.migrateDocxReadings();
  assert.match(oa.skipped[0].why, /not held/);
  assert.deepEqual(a.x.readingFor(a.digest).reading, a.old);
  /* a newer reading lands while the bytes are being read: it stands */
  const ev2 = bucket();
  const b = await seeded({ evidence: ev2 });
  const newer = { ...(await oldReading()), basis: "a promotion that landed meanwhile" };
  const get = ev2.get.bind(ev2);
  ev2.get = async (k) => { b.x.writeReading({ bundleId: "INFO-1", captureSha: b.digest, reading: newer, composed: true }); return get(k); };
  const ob = await b.x.migrateDocxReadings();
  assert.match(ob.skipped[0].why, /changed while/);
  assert.deepEqual(b.x.readingFor(b.digest).reading, newer);
});

test("R66 R21: an asserted reading stays the caller's assertion, with its standing and justification, after it is moved", async () => {
  const f = await seeded({ origin: "asserted", author: "member:ruth" });
  const before = f.x.readingFor(f.digest).origin;
  assert.equal(before.state, "asserted");
  await f.x.migrateDocxReadings();
  const after = f.x.readingFor(f.digest);
  assert.deepEqual(after.origin, before);
  assert.equal(n26Marked(after.reading), true);
});

test("R66 R44 R46: the pure migration re-grades and resolves nothing, changes the reading handed in not at all, and keeps an absent key absent", async () => {
  const old = await oldReading();
  const copy = JSON.parse(JSON.stringify(old));
  const map = docxRenumbering(`<w:document><w:body>${BODY}</w:body></w:document>`);
  const text = { paragraphs: NEW_PARAS.map((t, para) => ({ para, text: t })), document: NEW_PARAS.filter(Boolean).join("\n"),
                 counts: { chars: 0, undetermined: 0 } };
  const next = n26MigratedReading(old, map, text, { at: "2026-10-01T00:00:00Z" });
  assert.deepEqual(old, copy);
  assert.deepEqual(next.entities.map((e) => [e.ref, e.kind, e.key, e.label]), old.entities.map((e) => [e.ref, e.kind, e.key, e.label]));
  const bare = { ...old }; delete bare.text_chars; delete bare.text_glyphs; delete bare.text_undetermined; delete bare.container_extent;
  const n2 = n26MigratedReading(bare, map, text);
  for (const k of ["text_chars", "text_glyphs", "text_undetermined", "container_extent"]) assert.equal(k in n2, false, k);
});

test("R20 R66: a promotion re-submitting the pre-N26 reading with the same `at` does not undo the migration; a reading with another `at` replaces it", async () => {
  const f = await seeded();
  await f.x.migrateDocxReadings();
  const migrated = f.x.readingFor(f.digest).reading;
  const files = (reading) => [{ path: "data/provenance.json",
    text: JSON.stringify({ documents: [{ capture: { sha256: f.digest }, reading, profile: { format: { format: "docx" } } }] }) }];
  f.x.projectPromotion({ bundleId: "INFO-1", files: files(f.old), author: null });
  assert.deepEqual(f.x.readingFor(f.digest).reading, migrated);
  const later = { ...f.old, at: "2026-09-30T00:00:00Z" };
  f.x.projectPromotion({ bundleId: "INFO-1", files: files(later), author: null });
  assert.deepEqual(f.x.readingFor(f.digest).reading, later);
});

test("R66: on a Durable Object the migration is started by migrate() and carried by the object's waitUntil, once", async () => {
  const f = await seeded();
  const { Extraction } = await import("../../../src/extraction/index.mjs");
  /* The object restarting over the same storage: record-core's seams as the object hands them (purge already declared). */
  const record = { evidenceStore: () => f.core.evidenceStore(), transact: (fn) => f.core.transact(fn), readFile: () => null };
  const waited = [];
  const x2 = new Extraction(f.s, { record, membership: f.membership, env: {}, host: { waitUntil: (p) => waited.push(p) } });
  x2.migrate();
  assert.equal(waited.length, 1);
  await waited[0];
  assert.equal(n26Marked(f.x.readingFor(f.digest).reading), true);
  x2.migrate();
  assert.equal(waited.length, 1);
  /* no host, no background run */
  const x3 = new Extraction(f.s, { record, membership: f.membership, env: {} });
  assert.equal(x3.startMigrations(), null);
});
