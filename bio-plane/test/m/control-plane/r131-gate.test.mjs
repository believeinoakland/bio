/* control-plane R131, R132 (fix round 9, G126b, G126d, G124a; K4811 (6), (8), K4831 (3), K4835 (1); R125 (a), R100, R123): THE INLINE GATE, `reading-gate.mjs`, at its boundaries.
   `inlineVerdict` judges by size and kind alone (a PDF at `boundOf("pdf","request_bytes")` and one byte over, every other kind at the 3 MiB constant and one over, a capture held
   in parts over `boundOf("office","text_bytes")`, a document over the whole-read ceiling of its kind `stated` through `statement`'s `{size, bound, key}`, a text between the alpha
   ceiling and the standard's a deferral); `readingVerdict`/`containerUnpacked` look into a stored container through the evidence bucket (`env.CAPTURES.get(key, {range})`, a
   fake here) at its declared unpacked text (one fixture per container kind, small stored and over the bound unpacked, deferred with `unpacked_estimate`; a small ODS inline; a
   lying or corrupt directory deferred as `lying`; a file that is no ZIP `container: false`), and the grep of R132: no numeric literal for a ceiling in `src/control-plane/*.mjs`
   (the 3 MiB is now the `text.request_bytes` row). Counts and values only (R-CLOCK). Controls beside every case (K874).

   Red against the tree before round 9's change (`tooBigToReadInline`, which counted a container's STORED bytes and kept `READING_DEFER_PDF_BYTES` a literal): the R131 container
   cases (a 1 MB ODS unpacking to 4 MiB was read inline), the `stated` cases' `{size, bound, key}` (the old gate answered a boolean), and the R132 grep (the literals 2 MiB, 3 MiB,
   20 MiB and 24 MiB stood in `index.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { makeZip } from "../../make-zip.mjs";
import { boundOf, statement } from "../../../src/read-bounds.mjs";
import { inlineVerdict, readingVerdict, containerUnpacked, sizeOfDocument, kindOf, wholeRowOf, CONTAINER_TEXT_PART,
         READING_DEFER_PDF_BYTES, READING_DEFER_OTHER_BYTES, READING_PARTS_MAX } from "../../../src/control-plane/reading-gate.mjs";
import { ceilingConstantsIn } from "./r9-seam-limits.mjs";

const MiB = 1048576;
const SHA = "a".repeat(64);
const te = (s) => new TextEncoder().encode(s);
const doc = ({ bytes = 10, type = null, sha = SHA, parts = null, locator = "https://example.org/x", format = null, declared = null } = {}) => ({
  file: "snapshots/x", locator, profile: { ...(format ? { format: { format } } : {}), ...(declared ? { source_content_type: declared } : {}) },
  capture: { sha256: sha, bytes, ...(type ? { content_type: type } : {}) }, ...(parts ? { parts } : {}) });
const inPartsOf = (total) => { const n = Math.ceil(total / (8 * MiB)); return Array.from({ length: n }, (_, i) => ({ sha256: i.toString(16).padStart(64, "1"), bytes: i < n - 1 ? 8 * MiB : total - 8 * MiB * (n - 1) })); };

/* ---- the bounds the gate quotes ---- */

test("R132 (G124a): the gate's ceilings are READ_BOUNDS rows read through boundOf: the PDF defer is `pdf.request_bytes`, the parts ceiling is `office.text_bytes`, and the inline ceiling of every other kind is `text.request_bytes` (3 MiB)", () => {
  assert.equal(READING_DEFER_PDF_BYTES, boundOf("pdf", "request_bytes"));
  assert.equal(READING_PARTS_MAX, boundOf("office", "text_bytes"));
  assert.equal(READING_DEFER_OTHER_BYTES, boundOf("text", "request_bytes"));
  assert.equal(READING_DEFER_OTHER_BYTES, 3 * MiB, "the figure BOB recorded (K4919)");
  assert.deepEqual([wholeRowOf("pdf"), wholeRowOf("csv"), wholeRowOf("text"), wholeRowOf("other")], [["pdf", "bytes"], ["csv", "bytes"], ["text", "bytes"], ["pdf", "bytes"]]);
});

/* ---- inlineVerdict: a PDF ---- */

test("R131 (inlineVerdict, a PDF): at `pdf.request_bytes` it is read inline, one byte over it is deferred as a size with the limit it was over (control: a small PDF is inline)", () => {
  const at = boundOf("pdf", "request_bytes");
  assert.deepEqual(inlineVerdict(doc({ bytes: at, type: "application/pdf" })), { verdict: "inline", kind: "pdf", size: at });
  assert.deepEqual(inlineVerdict(doc({ bytes: at + 1, type: "application/pdf" })), { verdict: "deferred", why: "size", kind: "pdf", size: at + 1, limit: at });
  assert.equal(inlineVerdict(doc({ bytes: 900, type: "application/pdf" })).verdict, "inline", "control: a one-page PDF");
  /* the kind is read from what the document states of itself, in the order the door meets them */
  for (const d of [doc({ bytes: at + 1, declared: "application/pdf" }), doc({ bytes: at + 1, format: "pdf" }), doc({ bytes: at + 1, locator: "https://example.org/files/budget.pdf?x=1" })])
    assert.equal(inlineVerdict(d).kind, "pdf");
});

test("R131 (inlineVerdict, other kinds): a text, a CSV, an office file and an unknown kind are read inline at the 3 MiB constant and deferred one byte over it", () => {
  const at = READING_DEFER_OTHER_BYTES;
  for (const [what, d] of [["text", doc({ type: "text/plain" })], ["csv", doc({ type: "text/csv" })], ["docx", doc({ type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })],
                           ["no type", doc({})]]) {
    const kind = kindOf(d);
    assert.deepEqual(inlineVerdict({ ...d, capture: { ...d.capture, bytes: at } }), { verdict: "inline", kind, size: at }, `${what} at the constant`);
    assert.deepEqual(inlineVerdict({ ...d, capture: { ...d.capture, bytes: at + 1 } }), { verdict: "deferred", why: "size", kind, size: at + 1, limit: at }, `${what} one over`);
  }
  assert.deepEqual([kindOf(doc({ type: "text/plain" })), kindOf(doc({ type: "text/csv" })), kindOf(doc({ type: "application/json" })), kindOf(doc({}))], ["text", "csv", "text", "other"]);
  /* a PDF's limit is its own: 3 MiB of PDF is deferred while 3 MiB of text is not */
  assert.equal(inlineVerdict(doc({ bytes: at, type: "application/pdf" })).verdict, "deferred");
  assert.equal(inlineVerdict(doc({ bytes: at, type: "text/plain" })).verdict, "inline");
});

test("R131 (inlineVerdict, a capture held in parts): the size is the sum of its parts when that is more than the capture's own, and parts over `office.text_bytes` are deferred, never read at the door", () => {
  const over = boundOf("office", "text_bytes") + 1;
  const parts = inPartsOf(over);
  const held = doc({ bytes: 8 * MiB, type: "text/plain", parts });
  assert.equal(sizeOfDocument(held), over, "the sum of the parts, whichever is more");
  assert.equal(sizeOfDocument(doc({ bytes: 5 })), 5);
  assert.equal(sizeOfDocument(null), 0);
  const v = inlineVerdict(held);
  assert.deepEqual([v.verdict, v.size], ["deferred", over]);
  assert.ok(over > READING_DEFER_OTHER_BYTES && over <= boundOf("pdf", "bytes"), "between the inline ceiling and the whole-read ceiling: owed, not stated");
  /* control: a small capture in one part is inline */
  assert.equal(inlineVerdict(doc({ bytes: 1000, type: "text/plain", parts: inPartsOf(1000) })).verdict, "inline");
});

/* ---- inlineVerdict: stated over the whole-read ceiling of the kind ---- */

test("R132 (G124a, PDF A3/A2): a PDF one byte over `pdf.bytes` is `stated` with statement's {size, bound, key}, owing nothing; one at it is deferred (read by the ledger), never stated", () => {
  const ceiling = boundOf("pdf", "bytes");
  const over = inlineVerdict(doc({ bytes: ceiling + 1, type: "application/pdf" }));
  assert.deepEqual(over, { verdict: "stated", kind: "pdf", size: ceiling + 1, ...statement("pdf", "bytes", ceiling + 1) });
  assert.deepEqual([over.size, over.bound, over.key], [ceiling + 1, ceiling, "limit.pdf.bytes"]);
  const at = inlineVerdict(doc({ bytes: ceiling, type: "application/pdf" }));
  assert.deepEqual([at.verdict, at.why], ["deferred", "size"], "A2: at the ceiling it is read, by the job table");
  /* an office file or an unknown kind is judged by the whole-load row, which is the PDF's */
  for (const type of ["application/vnd.oasis.opendocument.spreadsheet", "application/zip", null]) {
    const v = inlineVerdict(doc({ bytes: ceiling + 1, type }));
    assert.deepEqual([v.verdict, v.key, v.bound], ["stated", "limit.pdf.bytes", ceiling], String(type));
    assert.equal(inlineVerdict(doc({ bytes: ceiling, type })).verdict, "deferred", `${type}: at the ceiling`);
  }
});

test("R132 (G124a): a CSV and a text take their own whole-read rows (the light kinds' standard): stated one byte over `csv.bytes` / `text.bytes`, deferred at it and between the alpha ceiling and the standard", () => {
  for (const [type, kind] of [["text/csv", "csv"], ["text/plain", "text"]]) {
    const ceiling = boundOf(kind, "bytes");
    const over = inlineVerdict(doc({ bytes: ceiling + 1, type }));
    assert.deepEqual(over, { verdict: "stated", kind, size: ceiling + 1, ...statement(kind, "bytes", ceiling + 1) });
    assert.equal(over.key, `limit.${kind}.bytes`);
    assert.equal(inlineVerdict(doc({ bytes: ceiling, type })).verdict, "deferred", `${kind} at the ceiling is owed`);
  }
  /* text between 24 MiB and 50 MiB (the pdf alpha ceiling and the text standard) is deferred, not stated: the standard's row governs a light kind (K4834) */
  const between = 30 * MiB;
  assert.ok(between > boundOf("pdf", "bytes") && between < boundOf("text", "bytes"));
  for (const type of ["text/plain", "text/csv"]) assert.deepEqual([inlineVerdict(doc({ bytes: between, type })).verdict, inlineVerdict(doc({ bytes: between, type })).why], ["deferred", "size"], type);
  assert.equal(inlineVerdict(doc({ bytes: between, type: "application/pdf" })).verdict, "stated", "control: the same 30 MiB as a PDF is over its (lower) ceiling");
});

/* ---- containerUnpacked / readingVerdict ---- */

/* an evidence bucket whose objects are `held` by key; every `get` is recorded with its option */
function bucketOf(held) {
  const calls = [];
  return { calls, async get(key, opts) {
    calls.push([key, opts && opts.range ? { ...opts.range } : null]);
    const bytes = held.get(key);
    if (!bytes) return null;
    const part = opts && opts.range ? bytes.slice(opts.range.offset, opts.range.offset + opts.range.length) : bytes;
    return { async arrayBuffer() { return part.buffer.slice(part.byteOffset, part.byteOffset + part.byteLength); } };
  } };
}
const envWith = (bytes, sha = SHA, store = "bio") => { const held = new Map([[`${store}/captures/${sha}`, bytes]]); const b = bucketOf(held); return { env: { CAPTURES: b }, bucket: b }; };
const textOf = (n) => new Uint8Array(n).fill(0x61);

/* one fixture per container kind: the part that bears its text, and the type a capture states */
const KINDS = [
  { kind: "xlsx", part: "xl/worksheets/sheet1.xml", rest: [["[Content_Types].xml", "<Types/>"], ["xl/workbook.xml", "<workbook/>"]], type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  { kind: "docx", part: "word/document.xml", rest: [["[Content_Types].xml", "<Types/>"]], type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  { kind: "pptx", part: "ppt/slides/slide1.xml", rest: [["[Content_Types].xml", "<Types/>"], ["ppt/presentation.xml", "<p/>"]], type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  { kind: "odt", part: "content.xml", rest: [["mimetype", "application/vnd.oasis.opendocument.text"], ["meta.xml", "<m/>"]], type: "application/vnd.oasis.opendocument.text" },
  { kind: "ods", part: "content.xml", rest: [["mimetype", "application/vnd.oasis.opendocument.spreadsheet"], ["meta.xml", "<m/>"]], type: "application/vnd.oasis.opendocument.spreadsheet" },
  { kind: "zip", part: "notes/readme.txt", rest: [["notes/index.html", "<p>x</p>"]], type: "application/zip" },
  { kind: "epub", part: "OEBPS/chapter1.xhtml", rest: [["mimetype", "application/epub+zip"], ["OEBPS/content.opf", "<package/>"]], type: "application/epub+zip" },
];
const zipOf = (k, partBytes, method = 8) => makeZip([...k.rest.map(([name, text]) => ({ name, data: te(text) })), { name: k.part, data: partBytes, method }]);

test("R131 (G126d): one fixture per container kind (xlsx, docx, pptx, odt, ods, zip, epub), small stored and over the bound unpacked, is deferred as `unpacked` with its `unpacked_estimate`, and never read inline", async () => {
  for (const k of KINDS) {
    const bytes = zipOf(k, textOf(READING_DEFER_OTHER_BYTES + MiB));   /* 4 MiB of text, deflating to a few KiB */
    assert.ok(bytes.length < 64 * 1024, `${k.kind}: stored small (${bytes.length} B)`);
    const { env, bucket } = envWith(bytes);
    const d = doc({ bytes: bytes.length, type: k.type });
    assert.equal(inlineVerdict(d).verdict, "inline", `${k.kind}: by its stored size alone the gate would read it`);
    const v = await readingVerdict(d, { env });
    assert.deepEqual([v.verdict, v.why, v.container, v.limit], ["deferred", "unpacked", true, READING_DEFER_OTHER_BYTES], k.kind);
    assert.ok(Number.isInteger(v.unpacked_estimate) && v.unpacked_estimate >= READING_DEFER_OTHER_BYTES + MiB, `${k.kind}: unpacked_estimate ${v.unpacked_estimate}`);
    assert.equal(v.lying, undefined, `${k.kind}: a true directory is not a lying one`);
    assert.deepEqual(bucket.calls.map((c) => c[1]), [{ offset: 0, length: 4 }, null], `${k.kind}: the magic by a ranged get, then the whole once`);
  }
});

test("R131 (G126d, control): a small ODS is read inline (inline, its container and its estimate stated), and so is each kind with a small text part; the declared size counts only the parts that bear text", async () => {
  for (const k of KINDS) {
    const bytes = zipOf(k, te("<office:document-content>a few cells</office:document-content>"));
    const { env } = envWith(bytes);
    const v = await readingVerdict(doc({ bytes: bytes.length, type: k.type }), { env });
    assert.deepEqual([v.verdict, v.container, v.why], ["inline", true, undefined], k.kind);
    assert.ok(v.unpacked_estimate > 0 && v.unpacked_estimate < 1024, `${k.kind}: ${v.unpacked_estimate}`);
  }
  /* a big member that bears no text (an image, a binary) does not make a container large for the gate */
  const withImage = makeZip([{ name: "content.xml", data: te("<c/>") }, { name: "Pictures/photo.png", data: textOf(READING_DEFER_OTHER_BYTES + MiB) }]);
  assert.equal(CONTAINER_TEXT_PART.test("Pictures/photo.png"), false);
  const { env } = envWith(withImage);
  const v = await readingVerdict(doc({ bytes: withImage.length, type: "application/vnd.oasis.opendocument.text" }), { env });
  assert.deepEqual([v.verdict, v.container], ["inline", true]);
  assert.ok(v.unpacked_estimate < 64, `only the text part is counted (${v.unpacked_estimate})`);
  /* and the line is the bound's own: text parts summing exactly to it are inline, one more is not */
  const exact = makeZip([{ name: "content.xml", data: textOf(READING_DEFER_OTHER_BYTES) }]);
  assert.equal((await readingVerdict(doc({ bytes: exact.length, type: "application/zip" }), { env: envWith(exact).env })).verdict, "inline");
  const plus = makeZip([{ name: "content.xml", data: textOf(READING_DEFER_OTHER_BYTES + 1) }]);
  assert.equal((await readingVerdict(doc({ bytes: plus.length, type: "application/zip" }), { env: envWith(plus).env })).verdict, "deferred");
});

test("R131 (G126d): a corrupt or lying directory counts as large: a truncated archive and one whose directory is garbage are deferred as `lying` with no estimate; a directory declaring more than any bound is deferred by its figure", async () => {
  const good = zipOf(KINDS[4], te("<c/>"));
  const truncated = good.slice(0, good.length - 30);
  const garbage = new Uint8Array(200); garbage.set([0x50, 0x4b, 0x03, 0x04]); garbage.fill(0x7f, 4);
  for (const [what, bytes] of [["truncated", truncated], ["garbage after the magic", garbage]]) {
    const { env } = envWith(bytes);
    const looked = await containerUnpacked(env, "bio", SHA);
    assert.deepEqual([looked.container, looked.unpacked, looked.lying], [true, Infinity, true], what);
    const v = await readingVerdict(doc({ bytes: bytes.length, type: "application/vnd.oasis.opendocument.spreadsheet" }), { env });
    assert.deepEqual([v.verdict, v.why, v.container, v.lying, v.unpacked_estimate], ["deferred", "unpacked", true, true, null], what);
  }
  /* the central directory says the one member unpacks to 4 GiB less a little: that figure is the estimate, and it is not called lying */
  const lie = makeZip([{ name: "content.xml", data: te("<c/>"), central: { uncompressedSize: 0xfffffff0 } }]);
  const v = await readingVerdict(doc({ bytes: lie.length, type: "application/zip" }), { env: envWith(lie).env });
  assert.deepEqual([v.verdict, v.unpacked_estimate, v.lying], ["deferred", 0xfffffff0, undefined]);
  /* control: the same archive with its true directory is inline */
  assert.equal((await readingVerdict(doc({ bytes: good.length, type: "application/zip" }), { env: envWith(good).env })).verdict, "inline");
});

test("R131 (G126d): a file that is no ZIP answers `container: false` after the first four bytes only, the whole object never being got; an absent object or bucket leaves the size's verdict", async () => {
  const plain = te("name,amount\nclerk,1\n");
  const { env, bucket } = envWith(plain);
  assert.deepEqual(await containerUnpacked(env, "bio", SHA), { container: false });
  assert.deepEqual(bucket.calls, [[`bio/captures/${SHA}`, { offset: 0, length: 4 }]], "one ranged get of four bytes, no whole read");
  const v = await readingVerdict(doc({ bytes: plain.length, type: "application/octet-stream" }), { env });
  assert.deepEqual(v, { verdict: "inline", kind: "other", size: plain.length }, "a non-container keeps the size's verdict with no container claim");
  /* the store's name is the key's prefix */
  const other = envWith(plain, SHA, "scratch");
  await containerUnpacked(other.env, "scratch", SHA);
  assert.equal(other.bucket.calls[0][0], `scratch/captures/${SHA}`);
  /* unanswerable: no bucket, a bad digest, an object not held: null (the gate then judges by size alone), never a throw */
  assert.equal(await containerUnpacked({}, "bio", SHA), null);
  assert.equal(await containerUnpacked({ CAPTURES: {} }, "bio", SHA), null);
  assert.equal(await containerUnpacked(env, "bio", "not-a-digest"), null);
  assert.equal(await containerUnpacked({ CAPTURES: bucketOf(new Map()) }, "bio", SHA), null);
  assert.equal(await containerUnpacked({ CAPTURES: { get: async () => { throw new Error("r2 down"); } } }, "bio", SHA), null);
  const none = await readingVerdict(doc({ bytes: 100, type: "application/zip" }), { env: { CAPTURES: bucketOf(new Map()) } });
  assert.equal(none.verdict, "inline");
});

test("R131 (G126d): the gate looks into a container only for a document its size admits: a PDF, a CSV, a stated or a size-deferred document asks the bucket nothing", async () => {
  const bytes = zipOf(KINDS[0], te("<w/>"));
  const { env, bucket } = envWith(bytes);
  for (const d of [doc({ bytes: 100, type: "application/pdf" }), doc({ bytes: 100, type: "text/csv" }),
                   doc({ bytes: READING_DEFER_OTHER_BYTES + 1, type: "application/zip" }), doc({ bytes: boundOf("pdf", "bytes") + 1, type: "application/zip" })])
    await readingVerdict(d, { env });
  assert.deepEqual(bucket.calls, [], "no get of any kind");
  assert.equal((await readingVerdict(doc({ bytes: boundOf("pdf", "bytes") + 1, type: "application/zip" }), { env })).verdict, "stated");
});

/* ---- R132's grep over src/control-plane ---- */

const SRC = fileURLToPath(new URL("../../../src/control-plane/", import.meta.url));

test("R132 (G124a): no numeric literal for a ceiling stands in `src/control-plane/*.mjs`: every ceiling is a READ_BOUNDS row read through boundOf", () => {
  const found = [];
  for (const f of readdirSync(SRC).filter((n) => n.endsWith(".mjs")).sort()) {
    const text = readFileSync(join(SRC, f), "utf8");
    for (const c of ceilingConstantsIn(text)) found.push({ file: f, ...c });
  }
  assert.deepEqual(found.map((c) => `${c.file}:${c.line} ${c.name} = ${c.rhs}`), [], "ceiling constants written as numbers in the module");
  /* the old literals are gone from the door: the PDF defer, the whole-read and the parts ceilings and the 20/24 MiB figures are not written as numbers in index.mjs */
  const index = readFileSync(join(SRC, "index.mjs"), "utf8").split("\n").filter((l) => !/^\s*(?:\/\/|\/\*|\*)/.test(l)).join("\n");
  for (const lit of [/\b2097152\b/, /\b3145728\b/, /\b20971520\b/, /\b25165824\b/, /\b24\s*\*\s*(?:1024|MiB)\b/, /\b20\s*\*\s*(?:1024|MiB)\b/, /\b3\s*\*\s*(?:1024\s*\*\s*1024|MiB)\b/, /\b2\s*\*\s*(?:1024\s*\*\s*1024|MiB)\b/])
    assert.equal(lit.test(index), false, `index.mjs holds no ${lit}`);
  assert.equal(/READING_DEFER_PDF_BYTES\s*=/.test(index), false, "index.mjs does not redefine the PDF defer");
});

test("R132 (control): the detector sees a ceiling written as a number (a constant, an arithmetic of unit names, an underscore literal) and passes one read through the table", () => {
  const src = [
    "export const OLD_MAX = 24 * 1024 * 1024;", "const BIG_BYTES = 3 * MiB;", "export const LIMIT_BOUND = 25_165_824; // a comment",
    "export const QUOTED_MAX = boundOf(\"pdf\", \"bytes\");", "const DERIVED_MAX = QUOTED_MAX * 2;", "const TICK_MS = 300000;", "const SMALL_MAX = 4096;", "  const indented_MAX = 5 * MiB;",
  ].join("\n");
  assert.deepEqual(ceilingConstantsIn(src).map((c) => [c.name, c.value]), [["OLD_MAX", 25165824], ["BIG_BYTES", 3145728], ["LIMIT_BOUND", 25165824]]);
});
