/* The ooxml module's start-up cost (build/requirements/ooxml.md R34; T48-6,
 * N1039, K3147): evaluating the module builds none of its derived tables,
 * each is built on its first use and reused after, and every export keeps
 * its T47 value and shape. The global scope is measured as `bundler` R31
 * measures one: a fresh import in this process, at a URL no earlier import
 * used, so no module cache makes it free. What the evaluation does is watched
 * through the globals the module would have to reach to build a table. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { crc32 as zcrc32 } from "node:zlib";
import * as M from "../../../src/ooxml.mjs";
import { makeZip } from "../../make-zip.mjs";
import { makeVbaProject } from "./cfb.mjs";

const MODULE_URL = new URL("../../../src/ooxml.mjs", import.meta.url).href;
const enc = (s) => new TextEncoder().encode(s);
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const jsonHash = (v) => createHash("sha256").update(JSON.stringify(v)).digest("hex");

/* bundler R31's warning budget for a whole global scope (`BUDGET.startWarnMs`;
 * the platform allows 1 s). One helper module has no business near it. */
const START_WARN_MS = 500;

/* Counts, while `run` is awaited, every typed array and RegExp constructed
 * and every array map, filter, find, flatMap, forEach, reduce, from and
 * iteration (a spread or a destructuring runs the iterator): the means a
 * module has to build a table. Node's own loader uses its captured
 * primordials, so only the module's own work is counted. */
async function watching(run) {
  const seen = [];
  const saved = [];
  const swap = (owner, key, value) => { saved.push([owner, key, Object.getOwnPropertyDescriptor(owner, key)]); Object.defineProperty(owner, key, { value, configurable: true, writable: true }); };
  for (const name of ["Uint8Array", "Uint16Array", "Uint32Array", "Int32Array", "Float64Array", "RegExp"]) {
    const Real = globalThis[name];
    swap(globalThis, name, new Proxy(Real, {
      construct(t, a, nt) { seen.push(`new ${name}`); return Reflect.construct(t, a, nt === globalThis[name] ? t : nt); },
      apply(t, self, a) { seen.push(`${name}()`); return Reflect.apply(t, self, a); },
    }));
  }
  for (const key of ["map", "filter", "find", "flatMap", "forEach", "reduce", Symbol.iterator]) {
    const real = Array.prototype[key];
    const label = `Array.prototype.${String(key)}`;
    swap(Array.prototype, key, function (...a) { seen.push(label); return real.apply(this, a); });
  }
  const realFrom = Array.from;
  swap(Array, "from", function (...a) { seen.push("Array.from"); return realFrom.apply(this, a); });
  // restored with an index loop: a for-of or a destructuring here would itself be counted
  const restore = () => { for (let i = saved.length - 1; i >= 0; i--) Object.defineProperty(saved[i][0], saved[i][1], saved[i][2]); };
  let value;
  try {
    value = await run();
  } finally {
    restore();
  }
  return { value, seen };
}

let freshNo = 0;
/* A fresh evaluation of the module: its namespace and the milliseconds the
 * import took (load, parse, link and global scope, as bundler R31 times it). */
async function freshImport() {
  const url = `${MODULE_URL}?r34-fresh=${process.pid}-${++freshNo}`;
  const t0 = performance.now();
  const ns = await import(url);
  return { ns, ms: performance.now() - t0 };
}

/* The exports as T47 left them (taken from the module at T48's opening,
 * before this job changed it): every name, each constant's value, each
 * table's shape, and each function's declared arity. */
const T47_FUNCTIONS = {
  containerImages: 3, crc32: 1, declaredTextBytes: 2, discriminate: 1, hasZipMagic: 1, imageRef: 1, listArchive: 1,
  listRelsParts: 1, normalizePartName: 1, parseContentTypes: 1, parseCoreProperties: 1, parseRels: 1, partContentType: 2,
  readContainer: 1, readCoreProperties: 2, readPart: 3, readVbaProject: 3, relsPartFor: 0, sizeGuard: 1, streamMember: 2,
  walkRels: 2, withContainerImages: 3,
};
const T47_CONSTANTS = {
  ARCHIVE_DEPTH_MAX: 3, ARCHIVE_ENTRIES_MAX: 10000, ARCHIVE_RATIO_MAX: 1100, ARCHIVE_TOTAL_MAX: 268435456,
  ARCHIVE_TREE_ENTRIES_MAX: 10000, ARCHIVE_TREE_TOTAL_MAX: 268435456, CONTENT_TYPES_PART: "[Content_Types].xml",
  CORE_PROPERTIES_PART: "docProps/core.xml", MEASURED_OOXML_TEXT_BOUND_BYTES: 20971520, MEMBER_MAX: 268435456,
  ODF_MANIFEST_PART: "META-INF/manifest.xml", ODF_MIMETYPE_MAX_BYTES: 128, ODF_MIMETYPE_PART: "mimetype",
};
const OPC = (flavour, mainContentType, conventionalMainPart, variant) =>
  (variant ? { partMap: "opc", flavour, variant, mainContentType, conventionalMainPart } : { partMap: "opc", flavour, mainContentType, conventionalMainPart });
const T47_OOXML_FLAVOURS = [
  OPC("docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml", "word/document.xml"),
  OPC("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml", "xl/workbook.xml"),
  OPC("pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml", "ppt/presentation.xml"),
];
const T47_ODF_FLAVOURS = [
  { partMap: "odf", flavour: "odt", mimetype: "application/vnd.oasis.opendocument.text", conventionalMainPart: "content.xml" },
  { partMap: "odf", flavour: "ods", mimetype: "application/vnd.oasis.opendocument.spreadsheet", conventionalMainPart: "content.xml" },
  { partMap: "odf", flavour: "odp", mimetype: "application/vnd.oasis.opendocument.presentation", conventionalMainPart: "content.xml" },
];
const T47_CONTAINER_FLAVOURS = [
  ...T47_OOXML_FLAVOURS,
  OPC("docx", "application/vnd.ms-word.document.macroEnabled.main+xml", "word/document.xml", "docm"),
  OPC("docx", "application/vnd.ms-word.template.macroEnabledTemplate.main+xml", "word/document.xml", "dotm"),
  OPC("xlsx", "application/vnd.ms-excel.sheet.macroEnabled.main+xml", "xl/workbook.xml", "xlsm"),
  OPC("xlsx", "application/vnd.ms-excel.template.macroEnabled.main+xml", "xl/workbook.xml", "xltm"),
  OPC("xlsx", "application/vnd.ms-excel.addin.macroEnabled.main+xml", "xl/workbook.xml", "xlam"),
  OPC("pptx", "application/vnd.ms-powerpoint.presentation.macroEnabled.main+xml", "ppt/presentation.xml", "pptm"),
  OPC("pptx", "application/vnd.ms-powerpoint.template.macroEnabled.main+xml", "ppt/presentation.xml", "potm"),
  OPC("pptx", "application/vnd.ms-powerpoint.slideshow.macroEnabled.main+xml", "ppt/presentation.xml", "ppsm"),
  OPC("pptx", "application/vnd.ms-powerpoint.addin.macroEnabled.main+xml", "ppt/presentation.xml", "ppam"),
  ...T47_ODF_FLAVOURS,
];
const T47_IMAGE_MIME_BY_EXT = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", jpe: "image/jpeg", gif: "image/gif", bmp: "image/bmp",
  tif: "image/tiff", tiff: "image/tiff", svg: "image/svg+xml", webp: "image/webp", emf: "image/emf", wmf: "image/wmf",
  emz: "image/x-emz", wmz: "image/x-wmz",
};
const T47_ARCHIVE_LIMITS = {
  ARCHIVE_ENTRIES_MAX: 10000, ARCHIVE_TOTAL_MAX: 268435456, MEMBER_MAX: 268435456, ARCHIVE_RATIO_MAX: 1100,
  ARCHIVE_DEPTH_MAX: 3, ARCHIVE_TREE_TOTAL_MAX: 268435456, ARCHIVE_TREE_ENTRIES_MAX: 10000,
};
/* The two VBA tables are olevba's (R33's own test reads them against
 * oletools where it is installed); here each is pinned by its length, its
 * ends and the SHA-256 of its JSON, as T47 held it. */
const T47_VBA = {
  VBA_AUTORUN_NAMES: { length: 20, first: "AutoExec", last: "Worksheet_Calculate", hash: "d6e7826ef732a90f598da24709437a973e4d0e4ccce86e26b30263cb765e65c0" },
  VBA_SUSPICIOUS_KEYWORDS: { length: 139, first: "Environ", last: "RegWrite", hash: "3f26345a4bbf41d32c67fb6f79a15c6b8b3b15949415e21016eec67f3d8822dc" },
};

function assertT47Exports(ns) {
  const names = [...Object.keys(T47_FUNCTIONS), ...Object.keys(T47_CONSTANTS), "ARCHIVE_LIMITS", "CONTAINER_FLAVOURS",
    "IMAGE_MIME_BY_EXT", "OOXML_FLAVOURS", "ODF_FLAVOURS", ...Object.keys(T47_VBA)].sort();
  assert.deepEqual(Object.keys(ns).sort(), names);
  for (const [name, arity] of Object.entries(T47_FUNCTIONS)) {
    assert.equal(typeof ns[name], "function", name);
    assert.equal(ns[name].length, arity, name);
  }
  for (const [name, value] of Object.entries(T47_CONSTANTS)) assert.equal(ns[name], value, name);

  assert.deepEqual(ns.OOXML_FLAVOURS, T47_OOXML_FLAVOURS);
  assert.deepEqual(ns.ODF_FLAVOURS, T47_ODF_FLAVOURS);
  assert.deepEqual(ns.CONTAINER_FLAVOURS, T47_CONTAINER_FLAVOURS);
  for (const t of [ns.OOXML_FLAVOURS, ns.ODF_FLAVOURS, ns.CONTAINER_FLAVOURS]) {
    assert.ok(Array.isArray(t) && !Object.isFrozen(t));
    for (const row of t) assert.ok(!Object.isFrozen(row));
  }
  // the default table holds the plain and ODF rows themselves, not copies
  [0, 1, 2].forEach((i) => assert.equal(ns.CONTAINER_FLAVOURS[i], ns.OOXML_FLAVOURS[i]));
  [0, 1, 2].forEach((i) => assert.equal(ns.CONTAINER_FLAVOURS[12 + i], ns.ODF_FLAVOURS[i]));
  // each macro-enabled row's keys in T47's order (variant after flavour); a plain row has none
  for (const row of ns.CONTAINER_FLAVOURS) {
    assert.deepEqual(Object.keys(row), row.partMap === "odf" ? ["partMap", "flavour", "mimetype", "conventionalMainPart"]
      : row.variant ? ["partMap", "flavour", "variant", "mainContentType", "conventionalMainPart"]
        : ["partMap", "flavour", "mainContentType", "conventionalMainPart"]);
  }

  assert.deepEqual({ ...ns.IMAGE_MIME_BY_EXT }, T47_IMAGE_MIME_BY_EXT);
  assert.deepEqual(Object.keys(ns.IMAGE_MIME_BY_EXT), Object.keys(T47_IMAGE_MIME_BY_EXT));
  assert.ok(Object.isFrozen(ns.IMAGE_MIME_BY_EXT));
  assert.deepEqual({ ...ns.ARCHIVE_LIMITS }, T47_ARCHIVE_LIMITS);
  assert.deepEqual(Object.keys(ns.ARCHIVE_LIMITS), Object.keys(T47_ARCHIVE_LIMITS));
  assert.ok(Object.isFrozen(ns.ARCHIVE_LIMITS));
  for (const [name, want] of Object.entries(T47_VBA)) {
    const t = ns[name];
    assert.ok(Array.isArray(t) && Object.isFrozen(t), name);
    assert.deepEqual([t.length, t[0], t[t.length - 1], jsonHash(t)], [want.length, want.first, want.last, want.hash], name);
  }
}

/* ------------------------------------------------------------------ R34 */

test("R34 evaluating the module builds none of its derived tables, and its fresh import is measured as bundler R31 measures a global scope", async (t) => {
  const { value: { ns, ms }, seen } = await watching(freshImport);
  assert.deepEqual(seen, [], "the module's evaluation constructed or iterated these");
  // nothing is half-built: the fresh, unused namespace already holds every export as T47 held it
  assertT47Exports(ns);
  // the measurement: the best of several fresh imports (load, parse, link, global scope), against bundler R31's budget
  let best = ms;
  for (let i = 0; i < 4; i++) best = Math.min(best, (await freshImport()).ms);
  t.diagnostic(`ooxml: a fresh import took ${best.toFixed(2)} ms (best of 5; bundler R31 warns past ${START_WARN_MS} ms for a whole global scope)`);
  assert.ok(best < START_WARN_MS, `${best} ms`);

  // control: the watch sees a table being built, so its silence above means something
  const control = await watching(async () => {
    const table = new Uint32Array(256);
    return [...[1, 2]].map((x) => x + table.length);
  });
  assert.deepEqual(control.seen, ["new Uint32Array", "Array.prototype.Symbol(Symbol.iterator)", "Array.prototype.map"]);
});

test("R34 crc32 answers the known vectors on its first call and every later one, and builds its table once", async () => {
  const VECTORS = [["", 0], ["123456789", 0xcbf43926], ["The quick brown fox jumps over the lazy dog", 0x414fa339], ["a", 0xe8b7be43]];
  const { ns } = await freshImport();
  // the first CRC this evaluation computes is right
  const first = await watching(async () => ns.crc32(enc("123456789")));
  assert.equal(first.value, 0xcbf43926);
  // later calls are right too, and build nothing again
  for (let round = 0; round < 3; round++) {
    const later = await watching(async () => VECTORS.map(([s]) => ns.crc32(enc(s))));
    assert.deepEqual(later.value, VECTORS.map(([, v]) => v));
    assert.ok(!later.seen.includes("new Uint32Array"), later.seen.join(", "));
  }
  // and over every byte value and many lengths, against zlib's
  const all = new Uint8Array(1024).map((_, i) => (i * 131 + 7) & 255);
  for (let n = 0; n <= all.length; n += 37) assert.equal(ns.crc32(all.subarray(0, n)), zcrc32(all.subarray(0, n)) >>> 0, `length ${n}`);
  // a fresh evaluation whose first CRC is a member's verification (readPart) or a cut's (streamMember)
  const z = makeZip([{ name: "a.xml", data: "first use" }, { name: "b", data: "stored first use", method: 0 }]);
  const viaRead = (await freshImport()).ns;
  assert.deepEqual(await viaRead.readPart(z, viaRead.readContainer(z), "a.xml"), { ok: true, bytes: enc("first use") });
  const viaCut = (await freshImport()).ns;
  for (const row of (await viaCut.listArchive(z)).entries) {
    const { chunks, done } = viaCut.streamMember(z, row);
    for await (const c of chunks) void c;
    const data = enc(row.index === 0 ? "first use" : "stored first use");
    assert.deepEqual(await done, { ok: true, sha256: sha256(data), crc32: zcrc32(data) >>> 0, size: data.length });
  }
});

test("R34 the module's own SHA-256 is right on its first digest and every later one", async () => {
  const { ns } = await freshImport();
  for (const n of [0, 3, 55, 64, 1000, 70000, 3]) {
    const data = new Uint8Array(n).map((_, i) => (i * 101 + n) & 255);
    const z = makeZip([{ name: "x", data, method: 0 }]);
    const row = (await ns.listArchive(z)).entries[0];
    // a range source, so the cut hashes as the bytes pass (no host DigestStream in Node: the module's own SHA-256)
    const { chunks, done } = ns.streamMember({ size: z.length, read: async (o, k) => z.slice(o, o + k) }, row);
    for await (const c of chunks) void c;
    assert.equal((await done).sha256, sha256(data), `length ${n}`);
  }
});

test("R34 the VBA name tables are compiled on the first project read, matched rightly then and after, and not compiled again", async () => {
  const bin = makeVbaProject({ modules: [
    { name: "A", source: "Sub AutoOpen()\r\n  Shell \"x\"\r\nEnd Sub" },
    { name: "B", source: "Sub workbook_open\r\nSet o = CreateObject(\"WScript.Shell\")\r\nShellfish = Chr(1)" },
  ] }).bytes;
  const z = makeZip([{ name: "word/vbaProject.bin", data: bin }]);
  const want = {
    modules: [
      { name: "A", stream: "A", read: true, why: null, autoRun: ["AutoOpen"], suspicious: ["Shell"] },
      { name: "B", stream: "B", read: true, why: null, autoRun: ["Workbook_Open"], suspicious: ["Shell", "WScript.Shell", "CreateObject", "Chr"] },
    ],
    autoRun: ["AutoOpen", "Workbook_Open"], suspicious: ["Shell", "WScript.Shell", "CreateObject", "Chr"],
  };
  const { ns } = await freshImport();
  const pick = (r) => ({ modules: r.modules, autoRun: r.autoRun, suspicious: r.suspicious });
  const first = await ns.readVbaProject(z, ns.readContainer(z), "word/vbaProject.bin");
  assert.deepEqual(pick(first), want);
  // the same answer as the module evaluated once, used long since
  assert.deepEqual(first, await M.readVbaProject(z, M.readContainer(z), "word/vbaProject.bin"));
  for (let round = 0; round < 3; round++) {
    const later = await watching(() => ns.readVbaProject(z, ns.readContainer(z), "word/vbaProject.bin"));
    assert.deepEqual(pick(later.value), want);
    assert.ok(!later.seen.includes("new RegExp"), later.seen.filter((s) => s.includes("RegExp")).join(", "));
  }
});

test("R34 every exported name keeps its T47 value and shape, before any use and after every service has run", async () => {
  const { ns } = await freshImport();
  assertT47Exports(ns);
  // every service run once on the fresh evaluation leaves the exports as they were
  const z = makeZip([
    { name: "[Content_Types].xml", data: `<Types><Override PartName="/word/document.xml" ContentType="${T47_OOXML_FLAVOURS[0].mainContentType}"/></Types>` },
    { name: "word/document.xml", data: "<d/>" }, { name: "word/media/a.png", data: "png" },
    { name: "word/_rels/document.xml.rels", data: `<Relationships><Relationship Id="h" Target="https://x.example/" TargetMode="External"/></Relationships>` },
    { name: "docProps/core.xml", data: "<cp:coreProperties><dc:creator>c</dc:creator></cp:coreProperties>" },
    { name: "word/vbaProject.bin", data: makeVbaProject({ modules: [{ name: "M", source: "Sub AutoOpen()" }] }).bytes },
  ]);
  const c = ns.readContainer(z);
  assert.equal((await ns.discriminate(z)).format, "docx");
  assert.equal((await ns.walkRels(z, c)).outbound.length, 1);
  assert.equal((await ns.readCoreProperties(z, c)).creator, "c");
  assert.equal((await ns.withContainerImages({ ok: true }, { ok: true, bytes: z, container: c }, "word/media/")).images.length, 1);
  assert.deepEqual((await ns.readVbaProject(z, c, "word/vbaProject.bin")).autoRun, ["AutoOpen"]);
  for (const row of (await ns.listArchive(z)).entries) {
    const { chunks, done } = ns.streamMember(z, row);
    for await (const x of chunks) void x;
    assert.equal((await done).ok, true);
  }
  assertT47Exports(ns);
  assertT47Exports(M);
});
