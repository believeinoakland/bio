/* reading-pipeline: a CSV past a whole read is read from its first piece by range (fix round 9, K4868; R45 R40 R41 R35 R37 R44 R54), at the module's
 * interface. A CSV between `WHOLE_READ_MAX` and its own bound (`READ_BOUNDS` csv, 50 MiB) is never held whole, nor is its text: the first piece reads a
 * head range, the pieces after it a byte window each, through the range source (the object held whole or in parts). The 48 MiB file is read to its
 * last row in a child of its own whose old space is the object's 128 MB (csv-range-child.mjs), in each shape a capture arrives in; the same
 * child run against the module before this change reads nothing (final, TOO_LARGE). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { fresh, hold, doc, evidenceStore, sha } from "./fixture.mjs";
import { read, cellsInRange, rangeSource, WHOLE_READ_MAX } from "../../../src/reading-pipeline/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";

const CHILD = fileURLToPath(new URL("./csv-range-child.mjs", import.meta.url));
const MIB = 48;
function child(shape) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, ["--expose-gc", "--max-old-space-size=128", "--max-semi-space-size=2", CHILD, shape, String(MIB)], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
    p.on("close", (code, signal) => resolve({ code, signal, out, err }));
  });
}

for (const [shape, what] of [["parts", "held in 8 MiB parts with no whole object (an upload)"], ["whole", "held whole under its digest (an archive member, a fetch)"],
                             ["undetermined", "held in parts and recorded with no format (acquire's record of an upload in parts)"]]) {
  test(`R45 R40 R41 R35 (K4868): a ${MIB} MiB CSV ${what} is read to its last row at the object's 128 MB: every row once, the marks found in extents that hold their rows, the first piece a head range, the last piece states the words`,
    { timeout: 600_000 }, async () => {
      const c = await child(shape);
      assert.equal(c.code, 0, `the read did not complete in a 128 MB old space (${c.signal ?? "exit " + c.code}): ${c.err.split("\n").slice(0, 3).join(" | ")}`);
      const r = JSON.parse(c.out);
      assert.ok(r.size > WHOLE_READ_MAX && r.size <= boundOf("csv", "bytes"), "the file is past a whole read and within the CSV's bound");
      assert.ok(!r.stuck, "no piece answered the cursor it was asked with");
      /* every row once, none twice (a block's repeated header is no row, R41) */
      assert.equal(r.rows, r.expectedRows, "every row of the sheet is in a unit");
      assert.equal(r.dup, 0, "no row is in two units");
      for (const [m, row] of [["FIRSTMARK", r.marks.FIRSTMARK], ["MIDMARK", r.marks.MIDMARK], ["LASTMARK", r.marks.LASTMARK]]) {
        const f = r.found[m];
        assert.ok(f, `${m} is in a unit's text`);
        assert.ok(f.from <= row && row <= f.to, `${m} is on row ${row}, in the rows ${f.from}-${f.to} of its unit's extent ${f.range}`);
        assert.match(f.range, new RegExp(`^A${f.from}:[A-Z]+${f.to}$`), `${m}'s extent names the rows it holds`);
      }
      /* the first piece: a head range is the reading's text, so the whole's totals are stated as not read (null), never the head's */
      assert.equal(r.first.failure, null);
      assert.equal(r.first.more, true);
      assert.equal(r.first.total, r.size, "progress is counted in the object's bytes");
      assert.equal(r.first.words_total, null, "the document's words are not known at the first piece (R35)");
      assert.ok(r.first.words_read > 0);
      assert.equal(r.first.dialect, "comma");
      assert.equal(r.first.scope.of, r.size);
      assert.equal(r.first.scope.bytes[0], 0);
      assert.ok(r.first.scope.bytes[1] >= 1048576 && r.first.scope.bytes[1] < 2 * 1048576, "the digest and counts cover the head the signatures read");
      assert.deepEqual(r.first.extent, [{ name: "csv", rows: null, cols: null, usedRows: null, usedCols: null }], "the head's rows are not the sheet's");
      assert.deepEqual(r.first.cells, { csv: null });
      assert.deepEqual(r.first.cells_held, ["csv"], "the typed cells are held in the file, made for a range (R44)");
      assert.equal(r.first.first_unit_range, "A1:D" + r.first.first_unit_range.split("D")[1], "the first unit begins at row 1");
      assert.equal(r.first.first_lines[0], "id\tname\tamount\tnote", "the header is the first line, once");
      /* the last piece states what only the whole could: the words, equal to the words the pieces held */
      assert.deepEqual(r.facts, { words_total: r.words }, "the last piece states the document's words, the sum of the pieces'");
      /* the work of a piece is a few ranged reads of the store, never the object */
      assert.ok(r.maxGets <= 8, `a piece made ${r.maxGets} reads of the store, over 8`);
      assert.ok(r.peakMB < 120, `the heap peaked ${r.peakMB} MB`);
      /* a read that is not in pieces holds nothing and says the sheet is read in pieces, to be tried again (R37) */
      assert.equal(r.notInPieces.failure, "transient");
      assert.match(r.notInPieces.basis, /read in pieces/);
      assert.equal(r.notInPieces.units, 0);
    });
}

/* in this process: a CSV just past a whole read (25 MiB), in parts */
async function csvInParts(mib) {
  const w = fresh();
  const lines = ["id,name,note\n"];
  let n = 0, bytes = 13;
  while (bytes < mib * 1048576) { n++; const l = `${n},name ${n},"a note, row ${n}${n === 3 ? " THIRDMARK" : ""}"\n`; lines.push(l); bytes += l.length; }
  lines.push(`${n + 1},last,"the final row"\n`);
  const all = new TextEncoder().encode(lines.join(""));
  const parts = [];
  for (let at = 0; at < all.length; at += 8388608) { const b = all.subarray(at, Math.min(all.length, at + 8388608)); parts.push({ sha256: await hold(w.evidence, b), bytes: b.length }); }
  return { w, all, parts, rows: n + 2, document: doc({ digest: sha(all), bytes: all.length, ct: "text/csv", format: "csv", parts }) };
}

test("R44 R45 (K4868): the typed cells of a row of a CSV past a whole read are made from its parts, the last row's included; a first piece and the row's cells agree", { timeout: 300_000 }, async () => {
  const { w, rows, document, all } = await csvInParts(25);
  assert.ok(all.length > WHOLE_READ_MAX);
  const ev = evidenceStore(w.evidence);
  const last = await cellsInRange(ev, document, { format: "csv", sheet: "csv", fromRow: rows, toRow: rows });
  assert.equal(last.ok, true, JSON.stringify(last).slice(0, 200));
  assert.deepEqual(last.cells.map((c) => c.value), [String(rows - 1), "last", "the final row"]);
  const third = await cellsInRange(ev, document, { format: "csv", sheet: "csv", fromRow: 4, toRow: 4 });
  assert.equal(third.ok, true);
  assert.equal(third.cells[2].value, "a note, row 3 THIRDMARK");
  const first = await read(document, { evidence: ev, env: {}, view: w.view(), cursor: null });
  assert.equal(first.reading.cells_held[0], "csv");
  assert.equal(first.reading.provenance.text_scope.of, all.length);
});

test("R45 (K4868): the range source reads the parts a document states first, asking the store nothing of the whole, and reads the whole when a part is not held", async () => {
  const { w, all, parts, document } = await csvInParts(1);
  const seen = [];
  const store = { head: async (k) => { seen.push(["head", k]); return w.evidence.head(`bio/captures/${k}`); }, get: async (k, o) => { seen.push(["get", k, o && o.range ? o.range.offset : null]); return w.evidence.get(`bio/captures/${k}`, o); } };
  const src = rangeSource(store, document);
  const got = await src.readRange(8388600, 100);
  assert.deepEqual([...got], [...all.subarray(8388600, 8388700)], "a range across the seam of two parts");
  assert.ok(!seen.some((c) => c[0] === "head"), "the store was not asked whether it holds the whole");
  assert.ok(!seen.some((c) => c[1] === document.capture.sha256), "the whole was not read");
  assert.equal(parts.length, Math.ceil(all.length / 8388608));
  /* a part not held: the whole is the range's */
  await hold(w.evidence, all);
  const lost = fresh();
  await hold(lost.evidence, all);   /* the whole under its digest, no part */
  const s2 = rangeSource(evidenceStore(lost.evidence), document);
  assert.deepEqual([...(await s2.readRange(8388600, 100))], [...all.subarray(8388600, 8388700)]);
});

test("R37 R54 (K4868): a CSV past its own bound is refused at once, final, with its size and the CSV's limit (not the whole-load ceiling's), nothing loaded", async () => {
  const bound = boundOf("csv", "bytes");
  const calls = [];
  const store = { head: async () => null, get: async (k) => { calls.push(k); return null; } };
  for (const cursor of [undefined, null]) {
    const out = await read(doc({ digest: "b".repeat(64), bytes: bound + 1, ct: "text/csv", format: "csv" }), { evidence: store, env: {}, ...(cursor === undefined ? {} : { cursor }) });
    assert.equal(out.reading.failure, "final");
    assert.equal(out.reading.reason, "TOO_LARGE");
    assert.equal(out.reading.size, bound + 1);
    assert.equal(out.reading.bound, bound);
    assert.equal(out.reading.key, "limit.csv.bytes");
    assert.match(out.reading.basis, new RegExp(String(bound)));
  }
  assert.deepEqual(calls, [], "nothing was loaded");
});

test("R45 R40 (K4868): a CSV the windows cannot take (UTF-16) past a whole read is refused as before, final with its size and limit; one under a whole read is read as it was", async () => {
  const w = fresh();
  const rowsText = "id,name\n" + Array.from({ length: 1000 }, (_, i) => `${i},n${i}`).join("\n") + "\n";
  const u16 = new Uint8Array(2 + rowsText.length * 2); u16[0] = 0xff; u16[1] = 0xfe;
  for (let i = 0; i < rowsText.length; i++) { u16[2 + 2 * i] = rowsText.charCodeAt(i); }
  const small = doc({ digest: await hold(w.evidence, u16), bytes: u16.length, ct: "text/csv", format: "csv" });
  const out = await read(small, { evidence: evidenceStore(w.evidence), env: {}, view: w.view(), cursor: null });
  assert.equal(out.reading.failure ?? null, null, "under a whole read, read whole as before");
  assert.equal(out.more, false);
  assert.ok(!out.reading.provenance.text_scope, "a whole read's provenance names no scope");
  /* past a whole read, an encoding the windows cannot take (UTF-16) is refused at once, as a whole read is: its size and the whole-load limit, nothing read */
  const rowsBig = Array.from({ length: 1000 }, (_, i) => `${i},n${i}`).join("\n") + "\n";
  const unit = new Uint8Array(rowsBig.length * 2);
  for (let i = 0; i < rowsBig.length; i++) unit[2 * i] = rowsBig.charCodeAt(i);
  const bigBytes = new Uint8Array(WHOLE_READ_MAX + 4096); bigBytes[0] = 0xff; bigBytes[1] = 0xfe;
  for (let at = 2; at + unit.length <= bigBytes.length; at += unit.length) bigBytes.set(unit, at);
  const bw = fresh();
  const bigDoc = doc({ digest: await hold(bw.evidence, bigBytes), bytes: bigBytes.length, ct: "text/csv", format: "csv" });
  const refused = await read(bigDoc, { evidence: evidenceStore(bw.evidence), env: {}, view: bw.view(), cursor: null });
  assert.equal(refused.reading.failure, "final");
  assert.equal(refused.reading.reason, "TOO_LARGE");
  assert.equal(refused.reading.size, bigBytes.length);
  assert.equal(refused.reading.bound, WHOLE_READ_MAX);
});
