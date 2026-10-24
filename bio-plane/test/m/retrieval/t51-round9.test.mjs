/* retrieval, fix round 9 (T51; K4831 (5), (7); K4837): R95 a passage hit names the part's kind and every kind is searched, R96 a
 * hit's extent locates the row, R97 a partial reading is searched only so far and says so. Each at the module's interface
 * (`search`, `meaningRows`), over units written as extraction's index writes them; extraction-2's `kind` column is the
 * fixture's `withKindColumn` (its R107), and the index state is `capture_text_state` as its R36 and R90 describe it. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { PART_KINDS } from "../../../src/retrieval/index.mjs";

const hitsOf = (w, q, viewer = V("vera")) => w.retrieval.search({ q, viewer }).hits;
const rowsOf = (w, q, viewer = V("vera")) => w.retrieval.meaningRows({ q, rows: "passage", viewer });
const para = (n) => ({ kind: "doc-para", para: n });

/* A document whose parts of every kind hold the word `figure` once each, beside a body paragraph holding `quorum`. */
function everyKind() {
  const w = world();
  w.withKindColumn();
  const c = w.cap("report.docx", "report bytes");
  w.doc("INFO-DOCX", {}, { captures: [c] });
  w.unit(c.sha, "INFO-DOCX", 0, "the quorum was absent", para(0), "body");
  PART_KINDS.forEach((kind, i) => w.unit(c.sha, "INFO-DOCX", i + 1, `${kind} holds a figure of $${4200 + i}`, para(i + 1), kind));
  return { w, c };
}

test("R95: a passage search returns every kind of part by default and each hit names its part's kind; a footnote's dollar figure is found by op=search and its hit says footnote, a body paragraph's hit says body; a hit that is not a passage's names none", () => {
  const w = world();
  w.withKindColumn();
  const c = w.cap("report.docx", "report bytes");
  w.doc("INFO-DOCX", {}, { captures: [c] });
  w.unit(c.sha, "INFO-DOCX", 0, "the board noted the quorum was absent", para(0), "body");
  w.unit(c.sha, "INFO-DOCX", 1, "the reserve stood at $4215000 at year end", para(1), "footnote");
  w.doc("INFO-NOTE", {}, { files: [{ path: "n.md", text: "a note about quorum" }] });
  const foot = hitsOf(w, "passage:4215000");
  assert.deepEqual(foot.map((h) => [h.bundle_id, h.snippet_from, h.kind]), [["INFO-DOCX", "passage", "footnote"]]);
  const body = hitsOf(w, "passage:quorum");
  assert.deepEqual(body.map((h) => [h.bundle_id, h.snippet_from, h.kind]), [["INFO-DOCX", "passage", "body"]], "control: a body paragraph says body");
  const plain = hitsOf(w, "text:note")[0];
  assert.deepEqual([plain.bundle_id, plain.snippet_from, plain.kind, plain.extent], ["INFO-NOTE", "text", null, null]);
  const row = rowsOf(w, "passage:4215000").rows;
  assert.deepEqual(row.map((r) => r.kind), ["footnote"], "the same through the meaning rows");
});

test("R95: every kind of the closed list is searched with no kind named, found by its own words, and the hit and the row of each say which kind it is; no kind is left out", () => {
  const { w } = everyKind();
  for (const [i, kind] of PART_KINDS.entries()) {
    const q = `passage:${4200 + i}`;
    assert.deepEqual(hitsOf(w, q).map((h) => h.kind), [kind], `hit: ${kind}`);
    assert.deepEqual(rowsOf(w, q).rows.map((r) => r.kind), [kind], `row: ${kind}`);
  }
  const all = rowsOf(w, "passage:figure");
  assert.equal(all.total, PART_KINDS.length, "one unit per kind matched");
  assert.deepEqual(all.rows.map((r) => r.kind).sort(), [...PART_KINDS].sort());
});

test("R95: a unit stored before the kind says null, undetermined and never body — a store whose units have no kind column, a unit whose kind is empty, and a kind outside the list", () => {
  const before = world();
  const c = before.cap("old.pdf", "old bytes");
  before.doc("INFO-OLD", {}, { captures: [c] });
  before.unit(c.sha, "INFO-OLD", 0, "a page about culverts");
  assert.equal(before.st.sql.exec(`PRAGMA table_info(capture_text)`).toArray().some((x) => x.name === "kind"), false, "the store holds no kind column");
  assert.deepEqual(hitsOf(before, "passage:culverts").map((h) => h.kind), [null]);
  assert.deepEqual(rowsOf(before, "passage:culverts").rows.map((r) => r.kind), [null]);
  const w = world();
  w.withKindColumn();
  const d = w.cap("mixed.pdf", "mixed bytes");
  w.doc("INFO-MIXED", {}, { captures: [d] });
  w.unit(d.sha, "INFO-MIXED", 0, "first culverts", { kind: "pdf-page", page: 0 });
  w.unit(d.sha, "INFO-MIXED", 1, "second culverts", { kind: "pdf-page", page: 1 }, "body");
  w.unit(d.sha, "INFO-MIXED", 2, "third culverts", { kind: "pdf-page", page: 2 }, "not_a_kind");
  const rows = rowsOf(w, "passage:culverts").rows;
  assert.deepEqual(rows.map((r) => [r.seq, r.kind]), [[0, null], [1, "body"], [2, null]]);
});

test("R95: a hit names the unit its snippet is cut from — the first matching unit by capture, reading order and extent — when a document's matching units are of several kinds; the kind and the extent are that unit's", () => {
  const w = world();
  w.withKindColumn();
  const c = w.cap("report.docx", "report bytes");
  w.doc("INFO-DOCX", {}, { captures: [c] });
  w.unit(c.sha, "INFO-DOCX", 5, "late body words on culverts", para(5), "body");
  w.unit(c.sha, "INFO-DOCX", 2, "an early footnote on culverts", para(2), "footnote");
  w.unit(c.sha, "INFO-DOCX", 9, "a comment on culverts", para(9), "comment");
  const [hit] = hitsOf(w, "passage:culverts");
  assert.deepEqual([hit.kind, hit.extent_kind, JSON.parse(hit.extent), hit.capture_sha], ["footnote", "doc-para", para(2), c.sha]);
  assert.match(hit.snippet, /footnote on \[culverts\]/, "the snippet is cut from the same unit");
});

test("R95, R29: the kind and the extent of a hit are read only for a document the viewer may see — a passage in a project the viewer is not in changes no byte of any answer, and the participant sees its kind", () => {
  const w = world();
  w.withKindColumn();
  const c = w.cap("open.docx", "open bytes");
  w.doc("INFO-OPEN", {}, { captures: [c] });
  w.unit(c.sha, "INFO-OPEN", 0, "open words on culverts", para(0), "body");
  const answers = (viewer) => JSON.stringify([w.retrieval.search({ q: "passage:culverts", viewer }), rowsOf(w, "passage:culverts", viewer)]);
  const before = answers(V("vera"));
  const hid = w.cap("secret.docx", "secret bytes");
  const proj = w.project("Culvert Secret", "ann", { captures: [hid] });
  w.unit(hid.sha, proj, 0, "secret words on culverts", para(0), "footnote");
  assert.equal(answers(V("vera")), before, "byte-identical for the viewer outside the project");
  assert.deepEqual(hitsOf(w, "passage:culverts", V("ann")).map((h) => [h.bundle_id, h.kind]).sort(), [["INFO-OPEN", "body"], [proj, "footnote"]].sort());
});

/* A workbook's sheet blocks as reading-pipeline R47 emits them: a block's text keeps its row numbers and its empty cells. */
const SHEET_ROWS = 300, BLOCK = 100, COLS = "ABCDEF";
function workbook() {
  const w = world();
  w.withKindColumn();
  const c = w.cap("budget.xlsx", "budget bytes");
  w.doc("INFO-XL", {}, { captures: [c] });
  const marks = { first: 2, middle: 151, last: SHEET_ROWS };   /* the row of each mark, a non-header cell in column D */
  for (let b = 0; b * BLOCK < SHEET_ROWS; b++) {
    const from = b * BLOCK + 1, to = Math.min(SHEET_ROWS, (b + 1) * BLOCK);
    const lines = [];
    for (let r = from; r <= to; r++) {
      const mark = Object.entries(marks).find(([, row]) => row === r);
      lines.push([r, `item ${r}`, "", "", mark ? `MARK${mark[0].toUpperCase()}` : "", ""].join("\t"));
    }
    w.unit(c.sha, "INFO-XL", b, lines.join("\n"), { kind: "sheet-range", sheet: "Budget", range: `A${from}:F${to}` }, "body");
  }
  return { w, c, marks };
}
const rangeOf = (extent) => {
  const m = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(JSON.parse(extent).range);
  return { c0: m[1], r0: Number(m[2]), c1: m[3], r1: Number(m[4]) };
};

test("R96: SHEET J-10 — the first, a middle and the last mark of a sheet are each found by op=search, each hit's extent is the sheet-range block holding the row, and the cell of the mark lies inside that extent; the unit keeps its row numbers and empty cells", () => {
  const { w, marks } = workbook();
  for (const [which, row] of Object.entries(marks)) {
    const hits = hitsOf(w, `passage:MARK${which.toUpperCase()}`);
    assert.equal(hits.length, 1, which);
    const [hit] = hits;
    assert.equal(hit.extent_kind, "sheet-range", which);
    const box = rangeOf(hit.extent);
    assert.ok(box.r0 <= row && row <= box.r1, `${which}: row ${row} lies in the extent ${hit.extent}`);
    const col = "D";
    assert.ok(box.c0 <= col && col <= box.c1, `${which}: the mark's cell D${row} lies in the extent`);
    const unit = w.st.sql.exec(`SELECT text FROM capture_text WHERE capture_sha = ? AND extent_kind = ? AND extent = ?`, hit.capture_sha, hit.extent_kind, hit.extent).toArray()[0];
    const line = unit.text.split("\n").find((l) => l.startsWith(`${row}\t`));
    assert.deepEqual(line.split("\t").length, COLS.length, "the empty cells keep their place");
    assert.equal(line.split("\t")[4].startsWith("MARK"), true);
    const asRow = rowsOf(w, `passage:MARK${which.toUpperCase()}`).rows;
    assert.deepEqual(asRow.map((r) => [r.extent_kind, r.extent]), [[hit.extent_kind, hit.extent]], `${which}: the meaning row names the same extent`);
  }
});

test("R96 control: a document with no sheet answers its hits' extents as before — the page unit of a PDF, one extent per hit", () => {
  const w = world();
  const c = w.cap("a.pdf", "a bytes");
  w.doc("INFO-PDF", {}, { captures: [c] });
  w.unit(c.sha, "INFO-PDF", 3, "page four mentions culverts");
  const [hit] = hitsOf(w, "passage:culverts");
  assert.deepEqual([hit.extent_kind, JSON.parse(hit.extent), hit.ref], ["pdf-page", { kind: "pdf-page", page: 3 }, "p3"]);
});

test("R97: a search over a text read to half finds its hit in the part read and states it was searched so far, with through and total; a term in the unread half is not stated absent; a reading that is whole says nothing of the kind", () => {
  const w = world();
  const TOTAL = 12 * 1024 * 1024, HALF = TOTAL / 2;
  const c = w.cap("minutes.txt", "minutes bytes");
  w.doc("INFO-TXT", {}, { captures: [c] });
  w.unit(c.sha, "INFO-TXT", 0, "the first half speaks of culverts", { kind: "doc-para", para: 0 });
  w.indexState(c.sha, "INFO-TXT", { state: "partial", more: 1, through: HALF, total: TOTAL });
  const hit = rowsOf(w, "passage:culverts");
  assert.equal(hit.total, 1, "found in the part read");
  assert.equal(hit.scope.partial, 1);
  assert.deepEqual(hit.scope.partial_reads, [{ capture_sha: c.sha, through: HALF, total: TOTAL, owed: 0 }]);
  assert.ok(hit.says.includes(String(HALF)) && hit.says.includes(String(TOTAL)), "says how far the reading had got");
  const miss = rowsOf(w, "passage:hydrants");
  assert.equal(miss.total, 0);
  assert.equal(miss.scope.partial, 1);
  assert.ok(miss.says.includes(String(HALF)) && miss.says.includes(String(TOTAL)), "the miss says how far it had got, in place of an absence");
  assert.notEqual(miss.says, rowsOf(w, "passage:culverts").says);
  /* The last piece: the same search states no such thing. */
  w.indexState(c.sha, "INFO-TXT", { state: "whole", more: 0, through: TOTAL, total: TOTAL });
  const done = rowsOf(w, "passage:hydrants");
  assert.deepEqual([done.scope.partial, done.scope.partial_reads, done.scope.partial_truncated], [0, [], false]);
  assert.ok(!done.says.includes(String(HALF)) && !done.says.includes(String(TOTAL)), "a whole reading states no extent");
  assert.notEqual(done.says, miss.says);
  assert.notEqual(rowsOf(w, "passage:culverts").says, hit.says);
});

test("R97: a partial reading whose extent is not stated (a unit bound hit, no pieces) is counted apart with through and total null, and says only that it was searched so far; a capture never indexed is not partial", () => {
  const w = world();
  const a = w.cap("a.pdf", "a bytes"), b = w.cap("b.pdf", "b bytes"), n = w.cap("n.pdf", "n bytes");
  w.doc("INFO-A", {}, { captures: [a] }); w.doc("INFO-B", {}, { captures: [b] }); w.doc("INFO-N", {}, { captures: [n] });
  w.unit(a.sha, "INFO-A", 0, "a page about culverts");
  w.indexState(a.sha, "INFO-A", { state: "partial" });
  const r = rowsOf(w, "passage:zzqx");
  assert.deepEqual([r.scope.partial, r.scope.partial_reads], [1, [{ capture_sha: a.sha, through: null, total: null, owed: 0 }]]);
  assert.ok(!r.says.includes("null") && !r.says.includes("undefined"), "no figure is made up where none is stated");
  w.indexState(a.sha, "INFO-A", { state: "whole" });
  assert.notEqual(rowsOf(w, "passage:zzqx").says, r.says, "the partial sentence goes once the reading is whole");
  assert.equal(rowsOf(w, "passage:zzqx").scope.partial, 0);
});

test("R97: the partial readings a tally lists are bounded and counted — more than the listed bound says so, and every one is counted", () => {
  const w = world();
  const N = 25;
  for (let i = 0; i < N; i++) {
    const c = w.cap(`p${i}.pdf`, `p${i} bytes`);
    w.doc(`INFO-P${i}`, {}, { captures: [c] });
    w.unit(c.sha, `INFO-P${i}`, 0, "a page about culverts");
    w.indexState(c.sha, `INFO-P${i}`, { state: "partial", more: 1, through: i + 1, total: 100 });
  }
  const r = rowsOf(w, "passage:zzqx");
  assert.equal(r.scope.partial, N);
  assert.equal(r.scope.partial_reads.length, 20);
  assert.equal(r.scope.partial_truncated, true);
});

/* extraction R108's `progressOf(shas)`: the interface text, as a stand-in until job 41 merges. */
const progressStub = (table) => (shas) => Object.fromEntries(shas.map((s) => [s, table[s] ?? { state: "none", read_through: null, total: null, owed: 0 }]));

test("R97, K4571: a reading with pages owed is counted partial and never whole — a 30-page scan read 24 pages, asked of the provider's progressOf, says searched so far with the pages owed; the calls are of at most 500 shas; a whole text is not partial", () => {
  const w = world();
  const scan = w.cap("scan.pdf", "scan bytes"), text = w.cap("text.txt", "text bytes");
  w.doc("INFO-SCAN", {}, { captures: [scan] }); w.doc("INFO-TXT", {}, { captures: [text] });
  w.unit(scan.sha, "INFO-SCAN", 0, "a scanned page about culverts");
  w.unit(text.sha, "INFO-TXT", 0, "a text about culverts");
  w.indexState(scan.sha, "INFO-SCAN", { state: "whole" });   /* the unit index says whole: what is owed is not in it */
  const calls = [];
  const table = { [scan.sha]: { state: "whole", read_through: 24, total: 30, owed: 6 }, [text.sha]: { state: "whole", read_through: 9, total: 9, owed: 0 } };
  const stub = progressStub(table);
  w.retrieval.extraction.progressOf = (shas) => { calls.push(shas.length); return stub(shas); };
  const r = rowsOf(w, "passage:zzqx");
  assert.deepEqual(r.scope.partial_reads, [{ capture_sha: scan.sha, through: 24, total: 30, owed: 6 }]);
  assert.equal(r.scope.partial, 1, "the scan, not the text");
  assert.ok(r.says.includes("24") && r.says.includes("30"));
  assert.ok(calls.length >= 1 && calls.every((n) => n <= 500));
});

test("R97, R108: through the real extraction's progressOf, a scan with pages owed is counted partial with the pages owed whatever its unit index says; a whole text is not", () => {
  const w = world();
  const scan = w.cap("scan.pdf", "scan bytes"), text = w.cap("text.txt", "text bytes");
  w.doc("INFO-SCAN", {}, { captures: [scan] }); w.doc("INFO-TXT", {}, { captures: [text] });
  w.unit(scan.sha, "INFO-SCAN", 0, "a scanned page about culverts");
  w.unit(text.sha, "INFO-TXT", 0, "a text about culverts");
  w.indexState(scan.sha, "INFO-SCAN", { state: "whole" });
  w.indexState(text.sha, "INFO-TXT", { state: "whole" });
  w.reading(scan.sha, "INFO-SCAN", { found: true, page_count: 30, ocr_left: { pages: 6, cursor: 24 } });
  w.reading(text.sha, "INFO-TXT", { found: true });
  const r = rowsOf(w, "passage:zzqx");
  assert.equal(r.scope.partial, 1);
  assert.deepEqual(r.scope.partial_reads.map((x) => [x.capture_sha, x.owed]), [[scan.sha, 6]]);
  assert.equal(typeof w.retrieval.extraction.progressOf, "function");
});
