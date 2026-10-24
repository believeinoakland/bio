/* runtime-limits: the reading ceilings' one table (R29, R30, R31; fix round 9 G124; K4831 (3) (8), K4834, K4835 (1), K4840 (1)).
 * The table's shape and every row's invariants are pinned; the figures of R30 are pinned row by row, and a later job's added
 * row changes none of these expectations (a row is checked by its invariants, never by counting the table). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { READ_BOUNDS, boundOf, statement } from "../../../src/read-bounds.mjs";

const MiB = 1048576, GiB = 1073741824;
const LIGHT = ["text", "csv", "tsv", "json", "xml"];
const rows = () => Object.entries(READ_BOUNDS).flatMap(([kind, names]) => Object.entries(names).map(([name, row]) => [kind, name, row]));
const deepFrozen = (o) => Object.isFrozen(o) && Object.values(o).every((v) => v === null || typeof v !== "object" || deepFrozen(v));

test("R29: READ_BOUNDS is a deeply frozen map kind -> name -> {standard, alpha, protective, key}", () => {
  assert.ok(deepFrozen(READ_BOUNDS));
  assert.ok(rows().length > 0);
  for (const [kind, name, row] of rows()) {
    const at = `${kind}/${name}`;
    assert.deepEqual(Object.keys(row).sort(), ["alpha", "key", "protective", "standard"], at);
    for (const f of ["standard", "alpha", "protective"]) assert.ok(Number.isSafeInteger(row[f]) && row[f] > 0, `${at} ${f}`);
    assert.ok(row.alpha <= row.standard, `${at}: alpha is never above standard`);
    assert.ok(typeof row.key === "string" && row.key.length > 0, `${at} key`);
  }
});

test("R29: every pair a requirement file quotes with boundOf has a row (the 19 of fix round 9, and the pdf names quoted in prose)", () => {
  const pairs = [["archive", "depth"], ["archive", "members"], ["document", "clean_bytes"], ["file_safety", "grade_read"], ["image", "chunks"], ["image", "cover_bytes"],
    ["image", "edge"], ["image", "picture_frame"], ["image", "pixels"], ["image", "row_stride"], ["ocr", "frame_bytes"], ["office", "entries"], ["pdf", "bfrange_codes"],
    ["pdf", "need_mb"], ["pdf", "page_content"], ["pdf", "worker_bytes"], ["render", "safe_view_bytes"], ["render", "safe_view_pages"], ["xml", "tag"],
    ["pdf", "object_stream"], ["pdf", "cmap"], ["pdf", "embedded_file"]];
  for (const [k, n] of pairs) assert.ok(READ_BOUNDS[k]?.[n], `${k}/${n}`);
});

test("R29: no module's table is copied by hand: the frozen table cannot be edited by a caller", () => {
  assert.throws(() => { "use strict"; READ_BOUNDS.pdf.page_content.alpha = 1; }, TypeError);
  assert.throws(() => { "use strict"; READ_BOUNDS.pdf.extra = {}; }, TypeError);
  assert.throws(() => { "use strict"; READ_BOUNDS.newkind = {}; }, TypeError);
});

test("R30: the light kinds hold the standard 50 MB (52,428,800 bytes) and 1,048,576 rows", () => {
  for (const kind of ["text", "csv", "tsv", "json"]) {
    assert.equal(READ_BOUNDS[kind].bytes.standard, 52428800, kind);
    assert.equal(READ_BOUNDS[kind].rows.standard, 1048576, kind);
  }
  assert.equal(READ_BOUNDS.xml.bytes.standard, 52428800);
  assert.equal(READ_BOUNDS.xml.rows.standard, 1048576);
});

test("R30: archives hold 500 MB uploaded and 2 GB unpacked at the standard, 256 MiB each at the alpha, depth 3, ratio 1,100, 10,000 members", () => {
  const a = READ_BOUNDS.archive;
  assert.equal(a.uploaded_bytes.standard, 524288000);
  assert.equal(a.unpacked_bytes.standard, 2 * GiB);
  assert.equal(a.uploaded_bytes.alpha, 256 * MiB);
  assert.equal(a.unpacked_bytes.alpha, 256 * MiB);
  assert.equal(a.depth.alpha, 3);
  assert.equal(a.ratio.alpha, 1100);
  assert.equal(a.members.alpha, 10000);
  assert.equal(boundOf("archive", "uploaded_bytes"), 256 * MiB);
});

test("R30: the alpha figures of the heavy kinds the plan names", () => {
  assert.equal(boundOf("pdf", "bytes"), 24 * MiB);
  assert.equal(boundOf("xlsx", "declared_text"), 32 * MiB);
  assert.equal(boundOf("ods", "content_xml"), 20 * MiB);
  assert.equal(boundOf("ods", "repeat_units"), 262144);
  assert.equal(boundOf("workbook", "cells"), 50000);
  assert.equal(boundOf("sheet_worker", "cells"), 250000);
  assert.equal(boundOf("sheet_worker", "bytes"), 9000000);
  assert.equal(boundOf("sheet_worker", "ms"), 120000);
  assert.equal(boundOf("office", "retained_objects"), 250000);
  assert.equal(READ_BOUNDS.workbook.cells.standard, 250000);
});

test("R30: the protective figures, each as proposed", () => {
  const want = {
    sheet: { columns: 16384, cell_chars: 32767, cell_kept_chars: MiB, sheets: 1000 },
    archive: { members: 10000, depth: 3, ratio: 1100, directory: 16 * MiB, name: 4096 },
    pdf: { page_content: 64 * MiB, object_stream: 16 * MiB, cmap: MiB, embedded_file: 64 * MiB, objects: 2000000, direct_object: 4 * MiB, operands: 65536, tree_depth: 256, bfrange_codes: 65536 },
    image: { edge: 65535, chunks: 65536, row_stride: 8 * MiB, pixels: 120000000 },
    xml: { tag: 64 * 1024 },
    office: { entries: 100000, retained_objects: 250000 },
  };
  for (const [kind, names] of Object.entries(want)) for (const [name, f] of Object.entries(names)) assert.equal(READ_BOUNDS[kind][name].protective, f, `${kind}/${name}`);
});

test("R31: boundOf answers the alpha, except the light kinds, which answer the standard", () => {
  for (const [kind, name, row] of rows()) assert.equal(boundOf(kind, name), LIGHT.includes(kind) ? row.standard : row.alpha, `${kind}/${name}`);
  assert.equal(boundOf("csv", "bytes"), 52428800);
  assert.equal(boundOf("csv", "rows"), 1048576);
  assert.equal(boundOf("image", "pixels"), 120000000);
});

test("R31: statement answers {size, bound, key} with the size the caller measured and the row's key", () => {
  const s = statement("pdf", "bytes", 24 * MiB + 1);
  assert.deepEqual(s, { size: 24 * MiB + 1, bound: 24 * MiB, key: READ_BOUNDS.pdf.bytes.key });
  assert.deepEqual(Object.keys(s), ["size", "bound", "key"]);
  assert.equal(statement("csv", "rows", 1048577).bound, 1048576);
  assert.equal(statement("image", "pixels", 0).size, 0);
});

test("R31: boundOf and statement throw an Error naming the kind and the name when no such row exists, and never otherwise", () => {
  for (const [kind, name] of [["pdf", "nope"], ["nope", "bytes"], ["pdf", "__proto__"], ["pdf", "constructor"], ["pdf", "toString"], [undefined, undefined], [3, {}]]) {
    assert.throws(() => boundOf(kind, name), (e) => e instanceof Error && e.message.includes(String(kind)) && e.message.includes(String(name)), `${kind}/${name}`);
    assert.throws(() => statement(kind, name, 1), (e) => e instanceof Error && e.message.includes(String(kind)) && e.message.includes(String(name)));
  }
  for (const [kind, name] of rows()) assert.doesNotThrow(() => statement(kind, name, -1 === 0 ? 0 : 5));
});
