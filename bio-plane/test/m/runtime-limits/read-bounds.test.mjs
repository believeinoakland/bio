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
    pdf: { page_content: 64 * MiB, object_stream: 32 * MiB, cmap: MiB, embedded_file: 64 * MiB, objects: 2000000, direct_object: 4 * MiB, operands: 65536, tree_depth: 256, bfrange_codes: 65536 },
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

test("R30 (K4845): the heavy kinds' standards are K4628's per kind: documents 100 MB, spreadsheets and images 50 MB, the alpha where it is above", () => {
  const std = (k, n) => READ_BOUNDS[k][n].standard;
  for (const [k, n] of [["pdf", "bytes"], ["pdf", "worker_bytes"], ["document", "clean_bytes"], ["file_safety", "grade_read"]]) assert.equal(std(k, n), 104857600, `${k}/${n}`);
  for (const [k, n] of [["xlsx", "declared_text"], ["ods", "content_xml"], ["sheet_worker", "bytes"], ["image", "cover_bytes"]]) assert.equal(std(k, n), 52428800, `${k}/${n}`);
  assert.equal(std("ocr", "frame_bytes"), 61300000);
  assert.equal(boundOf("pdf", "bytes"), 24 * MiB);
});

/* the rows the quoting jobs of batch B reported (K4857, K4858, K4859, K4860; R30: a quoting job's row, added by this module, K4842 (1)) */
const ADDED = [
  ["office", "text_bytes", 104857600, 20 * MiB, 104857600],
  ["office", "streamed_text_bytes", 104857600, 32 * MiB, 104857600],
  ["archive", "member_bytes", 2 * GiB, 256 * MiB, 2 * GiB],
  ["office", "decoded_chars", 67108864, 67108864, 67108864],
  ["image", "working_set", 61300000, 61300000, 61300000],
  ["image", "retained_objects", 250000, 250000, 250000],
  ["scan", "max_bytes", 524288000, 268435456, 524288000],
  ["scan", "time_ms", 900000, 900000, 900000],
  ["scan", "embedded_pe", 41943040, 41943040, 41943040],
  ["scan", "html_normalize", 41943040, 41943040, 41943040],
  ["scan", "script_normalize", 20971520, 20971520, 20971520],
  ["scan", "zip_type_rcg", 1048576, 1048576, 1048576],
  ["scan", "partitions", 50, 50, 50],
  ["scan", "icons_pe", 100, 100, 100],
  ["office", "structural_part_bytes", 8388608, 8388608, 8388608],
  ["office", "piece_chars", 8388608, 8388608, 8388608],
  ["image", "picture_source", 603979776, 603979776, 603979776],
  ["ocr", "picture_edge", 4096, 4096, 4096],
  ["document", "part_bytes", 104857600, 33554432, 33554432],
  ["image", "rows_pixels", 201326592, 201326592, 201326592],
  ["pdf", "object_stream", 33554432, 33554432, 33554432],
  ["pdf", "xmp", 2097152, 2097152, 2097152],
];

test("R30: the rows quoting jobs reported (19, then K4862's 22) hold exactly the figures BOB gave, and boundOf and statement answer them (R31)", () => {
  assert.equal(ADDED.length, 22);
  for (const [kind, name, standard, alpha, protective] of ADDED) {
    const row = READ_BOUNDS[kind]?.[name];
    assert.ok(row, `${kind}/${name}`);
    assert.deepEqual({ standard: row.standard, alpha: row.alpha, protective: row.protective }, { standard, alpha, protective }, `${kind}/${name}`);
    assert.equal(row.key, `limit.${kind}.${name}`);
    assert.equal(boundOf(kind, name), alpha, `${kind}/${name} answers the alpha`);
    assert.deepEqual(statement(kind, name, alpha + 1), { size: alpha + 1, bound: alpha, key: `limit.${kind}.${name}` });
  }
});

/* the three rows acquisition quotes (K4882; K4842 (1)): today's figure in all three columns, so no member-facing bound moves (K1881) */
const ACQUISITION_ROWS = [
  ["capture", "keep_bytes", 33554432],
  ["capture", "profile_text_bytes", 8388608],
  ["render", "dom_bytes", 26214400],
];

test("R30: the rows acquisition quotes (capture keep_bytes 32 MiB, profile_text_bytes 8 MiB; render dom_bytes 25 MiB) hold one figure in all three columns, and boundOf and statement answer them (R31)", () => {
  for (const [kind, name, n] of ACQUISITION_ROWS) {
    const row = READ_BOUNDS[kind]?.[name];
    assert.ok(row, `${kind}/${name}`);
    assert.deepEqual({ standard: row.standard, alpha: row.alpha, protective: row.protective }, { standard: n, alpha: n, protective: n }, `${kind}/${name}`);
    assert.equal(row.key, `limit.${kind}.${name}`);
    assert.equal(boundOf(kind, name), n, `${kind}/${name} answers the figure`);
    assert.deepEqual(statement(kind, name, n + 1), { size: n + 1, bound: n, key: `limit.${kind}.${name}` });
  }
});

/* the row file-safety quotes (K4893; K4842 (1)): today's figure in all three columns, so no member-facing bound moves (K1881) */
test("R30: the row file-safety quotes (file_safety ods_declared, 8 MiB) holds one figure in all three columns, and boundOf and statement answer it (R31)", () => {
  const n = 8 * MiB, row = READ_BOUNDS.file_safety?.ods_declared;
  assert.ok(row);
  assert.deepEqual({ standard: row.standard, alpha: row.alpha, protective: row.protective }, { standard: n, alpha: n, protective: n });
  assert.equal(row.key, "limit.file_safety.ods_declared");
  assert.equal(boundOf("file_safety", "ods_declared"), n);
  assert.deepEqual(statement("file_safety", "ods_declared", n + 1), { size: n + 1, bound: n, key: "limit.file_safety.ods_declared" });
  assert.equal(READ_BOUNDS.file_safety.grade_read.alpha, 20 * MiB);
});

/* the row extraction keeps and control-plane quotes (K4901; K4842 (1)): today's figure in all three columns, so no member-facing bound moves (K1881) */
test("R30: the row extraction and control-plane quote (pdf request_bytes, 2 MiB) holds one figure in all three columns, and boundOf and statement answer it (R31)", () => {
  const n = 2 * MiB, row = READ_BOUNDS.pdf?.request_bytes;
  assert.ok(row);
  assert.deepEqual({ standard: row.standard, alpha: row.alpha, protective: row.protective }, { standard: n, alpha: n, protective: n });
  assert.equal(row.key, "limit.pdf.request_bytes");
  assert.equal(boundOf("pdf", "request_bytes"), n);
  assert.deepEqual(statement("pdf", "request_bytes", n + 1), { size: n + 1, bound: n, key: "limit.pdf.request_bytes" });
  assert.equal(READ_BOUNDS.pdf.bytes.alpha, 24 * MiB);
});

/* the rows control-plane and content quote (K4916; K4842 (1)): today's figures in all three columns, so no member-facing bound moves (K1881) */
test("R30: the rows control-plane and content quote (text request_bytes 3 MiB, content held_text_chars 32 Mi, content kind_scan_pages 16) hold one figure in all three columns, and boundOf and statement answer them (R31)", () => {
  for (const [kind, name, n] of [["text", "request_bytes", 3 * MiB], ["content", "held_text_chars", 32 * MiB], ["content", "kind_scan_pages", 16]]) {
    const row = READ_BOUNDS[kind]?.[name];
    assert.ok(row, `${kind}/${name}`);
    assert.deepEqual({ standard: row.standard, alpha: row.alpha, protective: row.protective }, { standard: n, alpha: n, protective: n }, `${kind}/${name}`);
    assert.equal(row.key, `limit.${kind}.${name}`);
    assert.equal(boundOf(kind, name), n, `${kind}/${name} answers the figure`);
    assert.deepEqual(statement(kind, name, n + 1), { size: n + 1, bound: n, key: `limit.${kind}.${name}` });
  }
  /* text is a light kind (R31): it answers the standard, which here equals the alpha; its other rows are unmoved */
  assert.equal(boundOf("text", "bytes"), 52428800);
  assert.equal(READ_BOUNDS.text.bytes.alpha, 24 * MiB);
});

/* the rows calculations quotes (K4922; K4842 (1)): today's figures in all three columns, so no member-facing bound moves (K1881) */
test("R30: the rows calculations quotes (table bytes 20 MiB, table cells 1,000,000) hold one figure in all three columns, and boundOf and statement answer them (R31)", () => {
  for (const [name, n] of [["bytes", 20 * MiB], ["cells", 1000000]]) {
    const row = READ_BOUNDS.table?.[name];
    assert.ok(row, `table/${name}`);
    assert.deepEqual({ standard: row.standard, alpha: row.alpha, protective: row.protective }, { standard: n, alpha: n, protective: n }, `table/${name}`);
    assert.equal(row.key, `limit.table.${name}`);
    assert.equal(boundOf("table", name), n, `table/${name} answers the figure`);
    assert.deepEqual(statement("table", name, n + 1), { size: n + 1, bound: n, key: `limit.table.${name}` });
  }
  assert.deepEqual(Object.keys(READ_BOUNDS.table), ["bytes", "cells"]);
});
