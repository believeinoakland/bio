/* office-readers, T35-9: R32 (`active`, what in a file can act when it is
 * opened, found and read and never run), R33 (the macro-enabled flavours read
 * as their plain twins) and R12 as amended (every part read passes ooxml's
 * part cap). Driven through the entries' interface on packages built by
 * ./fixtures.mjs; the VBA project's oracle is olevba's report, recorded beside
 * the fixture (vba-sample.olevba.json). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { docxEntry } from "../../../src/docx.mjs";
import { pptxEntry } from "../../../src/pptx.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { csvEntry } from "../../../src/csv.mjs";
import { readContainer, readVbaProject, VBA_SUSPICIOUS_KEYWORDS, VBA_AUTORUN_NAMES, MEMBER_MAX, ARCHIVE_TOTAL_MAX } from "../../../src/ooxml.mjs";
import * as F from "./fixtures.mjs";

const here = (f) => new URL(f, import.meta.url);
const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const T = { hyperlink: `${R}/hyperlink`, template: `${R}/attachedTemplate`, ole: `${R}/oleObject`, image: `${R}/image`,
  extLink: `${R}/externalLinkPath`, frame: `${R}/frame` };

/* The sample project olevba read (vba-sample.olevba.json). */
const SAMPLE = { project: "Sample", modules: [
  { name: "ThisDocument", document: true, source: 'Attribute VB_Name = "ThisDocument"\r\nSub AutoOpen()\r\n  Dim s\r\n  s = Environ("TEMP")\r\n  CreateObject("WScript.Shell").Run "calc"\r\nEnd Sub\r\n' },
  { name: "Module1", source: 'Attribute VB_Name = "Module1"\r\nSub Hello()\r\n  MsgBox "hi"\r\nEnd Sub\r\n' },
] };
const VBA = F.vbaProject(SAMPLE);
const OLEVBA = JSON.parse(readFileSync(here("vba-sample.olevba.json"), "utf8"));

const FORMATS = [
  { entry: docxEntry, format: "docx", dir: "word/", build: F.docx },
  { entry: pptxEntry, format: "pptx", dir: "ppt/", build: F.pptx },
  { entry: xlsxEntry, format: "xlsx", dir: "xl/", build: F.xlsx },
];

/* What ooxml reads of a project, projected onto the item R32 words. */
async function vbaItem(bytes, part) {
  const v = await readVbaProject(bytes, readContainer(bytes), part);
  return v.ok
    ? { kind: "vba-project", part, read: true, why: null, project: v.project, modules: v.modules.map((m) => m.name), autoRun: v.autoRun, suspicious: v.suspicious, undetermined: v.undetermined }
    : { kind: "vba-project", part, read: false, why: v.why, project: null, modules: null, autoRun: null, suspicious: null, undetermined: null };
}

/* Every kind of acting part, under `dir`, in this member order. */
function acting(dir) {
  return [
    { name: `${dir}vbaProject.bin`, data: VBA },
    { name: `${dir}activeX/activeX1.xml`, data: "<ax:ocx/>" },
    { name: `${dir}activeX/activeX1.bin`, data: "AXBIN" },
    { name: `${dir}activeX/_rels/activeX1.xml.rels`, data: F.rels([
      { id: "a1", type: T.image, target: "http://example.org/ax.png", external: true },
      { id: "a2", type: T.hyperlink, target: "http://example.org/ax", external: true },
    ]) },
    { name: `${dir}embeddings/oleObject1.bin`, data: "OLE1" },
    { name: `${dir}embeddings/Microsoft_Excel_Worksheet.xlsx`, data: "XLSX" },
    { name: `${dir}embeddings/OLEOBJECT2.BIN`, data: "OLE2" },
    { name: `${dir}embeddings/_rels/oleObject1.bin.rels`, data: F.rels([]) },
    { name: "xl/macrosheets/sheet1.xml", data: "<xm:macrosheet/>" },
    { name: `${dir === "ppt/" ? "word/" : "ppt/"}activeX/elsewhere.xml`, data: "<x/>" },
    { name: "customXml/_rels/item1.xml.rels", data: F.rels([]), cd: F.CORRUPT },
    { name: "customXml/_rels/item2.xml.rels", data: F.rels([
      { id: "c1", type: T.frame, target: "\\\\host\\share\\f.htm", external: true },
      { id: "c2", type: T.template, target: "https://example.org/t.dotm", external: true },
    ]) },
  ];
}

/* The list R32 words for acting(dir), after the package's own rels' items. */
async function expected(bytes, dir, format) {
  return [
    await vbaItem(bytes, `${dir}vbaProject.bin`),
    { kind: "activex", part: `${dir}activeX/activeX1.xml` },
    { kind: "activex", part: `${dir}activeX/activeX1.bin` },
    { kind: "external-target", part: `${dir}activeX/_rels/activeX1.xml.rels`, type: T.image, target: "http://example.org/ax.png" },
    { kind: "ole-object", part: `${dir}embeddings/oleObject1.bin` },
    { kind: "embedded-file", part: `${dir}embeddings/Microsoft_Excel_Worksheet.xlsx` },
    { kind: "ole-object", part: `${dir}embeddings/OLEOBJECT2.BIN` },
    ...(format === "xlsx" ? [{ kind: "xl4-macrosheet", part: "xl/macrosheets/sheet1.xml" }] : []),
    { kind: "unread", part: "customXml/_rels/item1.xml.rels", why: "crc_mismatch" },
    { kind: "external-target", part: "customXml/_rels/item2.xml.rels", type: T.frame, target: "\\\\host\\share\\f.htm" },
    { kind: "external-target", part: "customXml/_rels/item2.xml.rels", type: T.template, target: "https://example.org/t.dotm" },
  ];
}

/* Each format's own rels part, carrying external targets of both kinds. */
const OWN_RELS = [
  { id: "h1", type: T.hyperlink, target: "https://example.org/web", external: true },
  { id: "t1", type: T.template, target: "file:///C:/Templates/evil.dotm", external: true },
  { id: "i1", type: T.image, target: "media/image1.png" },
  { id: "o1", type: T.ole, target: "http://example.org/remote.bin", external: true },
];
function withOwnRels(format, dir) {
  if (format === "docx") return F.docx({ rels: F.rels(OWN_RELS), extra: acting(dir) });
  if (format === "pptx") return F.pptx({ slides: [{ file: "slide1.xml", texts: ["s"], rels: OWN_RELS }], extra: acting(dir) });
  return F.xlsx({ sheets: [{ name: "S", data: {}, rels: OWN_RELS }], extra: acting(dir) });
}
const OWN_RELS_PART = { docx: "word/_rels/document.xml.rels", pptx: "ppt/slides/_rels/slide1.xml.rels", xlsx: "xl/worksheets/_rels/sheet1.xml.rels" };
const ownItems = (format) => [
  { kind: "external-target", part: OWN_RELS_PART[format], type: T.template, target: "file:///C:/Templates/evil.dotm" },
  { kind: "external-target", part: OWN_RELS_PART[format], type: T.ole, target: "http://example.org/remote.bin" },
];

/* ------------------------------------------------------------------ R32 */

test("R32 docx, pptx and xlsx active: every part that can act, in central-directory order of its part and .rels order within one, hyperlinks left to links, a _rels/ part only by its targets, nothing run", async () => {
  for (const { entry, format, dir } of FORMATS) {
    const b = withOwnRels(format, dir);
    const s = await entry.structure(b);
    const t = await entry.text(b);
    assert.equal(s.ok, true, format);
    const want = [...ownItems(format), ...await expected(b, dir, format)];
    assert.deepEqual(s.active, want, format);
    assert.deepEqual(t.active, want, `${format} text() carries the same list`);
    /* the hyperlink-typed external targets stay R7's links, never items */
    assert.ok(!s.active.some((i) => i.type === T.hyperlink), format);
    assert.ok(s.links.some((l) => l.target.url === "https://example.org/web"), format);
  }
});

test("R32 the vba-project item: ooxml.readVbaProject's reading as worded, the module names, auto-run and suspicious lists; olevba's report agrees", async () => {
  assert.deepEqual(VBA, new Uint8Array(readFileSync(here("vba-sample.bin"))), "the fixture olevba read is the one built here");
  for (const { entry, format, dir, build } of FORMATS) {
    const b = build({ extra: [{ name: `${dir}vbaProject.bin`, data: VBA }] });
    const [item] = (await entry.structure(b)).active;
    assert.deepEqual(item, await vbaItem(b, `${dir}vbaProject.bin`), format);
    assert.equal(item.read, true);
    assert.equal(item.why, null);
    assert.equal(item.project, "Sample");
    assert.deepEqual(item.modules, OLEVBA.modules, `${format}: olevba's modules`);
    for (const k of OLEVBA.autoexec) assert.ok(item.autoRun.includes(k), `${format}: olevba's auto-run ${k}`);
    for (const k of OLEVBA.suspicious) if (VBA_SUSPICIOUS_KEYWORDS.includes(k)) assert.ok(item.suspicious.includes(k), `${format}: olevba's suspicious ${k}`);
    assert.ok(item.autoRun.every((k) => VBA_AUTORUN_NAMES.includes(k)));
    assert.ok(item.suspicious.every((k) => VBA_SUSPICIOUS_KEYWORDS.includes(k)));
    assert.deepEqual(item.undetermined, [], `${format}: every module read`);
    assert.deepEqual(Object.keys(item), ["kind", "part", "read", "why", "project", "modules", "autoRun", "suspicious", "undetermined"]);
  }
});

test("R32 a VBA project ooxml refuses is still listed, read:false with its why and the other fields null; the name matched without case, at any depth", async () => {
  const b = F.docx({ extra: [
    { name: "word/vbaProject.bin", data: "not a compound file" },
    { name: "custom/VBAPROJECT.BIN", data: VBA },
    { name: "word/vbaProject.bin.txt", data: "x" },
  ] });
  const active = (await docxEntry.structure(b)).active;
  assert.deepEqual(active, [await vbaItem(b, "word/vbaProject.bin"), await vbaItem(b, "custom/VBAPROJECT.BIN")]);
  assert.deepEqual(active[0], { kind: "vba-project", part: "word/vbaProject.bin", read: false, why: active[0].why, project: null, modules: null, autoRun: null, suspicious: null, undetermined: null });
  assert.equal(typeof active[0].why, "string");
  assert.equal(active[1].read, true);
  /* a module whose source cannot be read leaves the project read, its name listed, and says so (K1916) */
  const half = F.vbaProject({ ...SAMPLE, corrupt: ["Module1"] });
  const h = F.docx({ extra: [{ name: "word/vbaProject.bin", data: half }] });
  const [item] = (await docxEntry.structure(h)).active;
  assert.deepEqual(item, await vbaItem(h, "word/vbaProject.bin"));
  assert.deepEqual(item.modules, ["ThisDocument", "Module1"]);
  assert.deepEqual(item.undetermined.map((u) => u.module), ["Module1"]);
  assert.equal(typeof item.undetermined[0].why, "string");
});

test("R32 an unreadable .rels part is an unread item: the list may be missing items, stated, never read as none", async () => {
  for (const { entry, format, build } of FORMATS) {
    const bad = build({ extra: [{ name: "docProps/_rels/app.xml.rels", data: "<notRels/>" }] });
    assert.deepEqual((await entry.structure(bad)).active, [{ kind: "unread", part: "docProps/_rels/app.xml.rels", why: "rels_unparseable" }], format);
    assert.deepEqual((await entry.text(bad)).active, [{ kind: "unread", part: "docProps/_rels/app.xml.rels", why: "rels_unparseable" }], format);
  }
});

test("R32 active is [] only when nothing was found and nothing went unread; csv's is always []; another format's directories are not this one's", async () => {
  for (const { entry, format, build } of FORMATS) {
    assert.deepEqual((await entry.structure(build())).active, [], format);
    assert.deepEqual((await entry.text(build())).active, [], format);
  }
  for (const body of ["a,b\n1,2\n", "x"]) {
    assert.deepEqual((await csvEntry.structure(F.enc(body))).active, []);
    assert.deepEqual((await csvEntry.text(F.enc(body))).active, []);
  }
  const big = new Uint8Array(20 * 1024 * 1024 + 1).fill(0x61);
  assert.deepEqual((await csvEntry.structure(big)).active, []);
  assert.deepEqual((await csvEntry.text(big)).active, []);
  /* a docx's word/ is its directory: ppt/ and xl/ members, macro sheets included, are not its items */
  const strays = [{ name: "ppt/activeX/a.xml", data: "x" }, { name: "xl/embeddings/oleObject1.bin", data: "x" }, { name: "xl/macrosheets/m.xml", data: "x" }, { name: "word/activeXish/a.xml", data: "x" }];
  assert.deepEqual((await docxEntry.structure(F.docx({ extra: strays }))).active, []);
  assert.deepEqual((await pptxEntry.structure(F.pptx({ extra: strays.filter((s) => !s.name.startsWith("ppt/")) }))).active, []);
  assert.deepEqual((await xlsxEntry.structure(F.xlsx({ extra: strays.filter((s) => !s.name.startsWith("xl/macro")) }))).active,
    [{ kind: "ole-object", part: "xl/embeddings/oleObject1.bin" }]);
});

test("R32 carried in full over the text size guard (R12), the same list as under it", async () => {
  const over = {
    docx: (extra) => F.docx({ mainCd: F.OVER, extra }),
    pptx: (extra) => F.pptx({ slides: [{ file: "slide1.xml", texts: ["s"], cd: F.OVER }], extra }),
    xlsx: (extra) => F.xlsx({ sheets: [{ name: "S", data: {}, cd: F.OVER }], extra }),
  };
  for (const { entry, format, dir, build } of FORMATS) {
    const b = over[format](acting(dir));
    const t = await entry.text(b);
    assert.equal(t.document, null, format);
    assert.equal(t.undetermined[0].why, "over_size_bound", format);
    const want = await expected(b, dir, format);
    assert.deepEqual(t.active, want, format);
    assert.deepEqual((await entry.structure(b)).active, want, format);
    assert.deepEqual((await entry.text(build({ extra: acting(dir) }))).active, await expected(build({ extra: acting(dir) }), dir, format), format);
  }
});

/* ------------------------------------------------------------------ R33 */

const TWINS = [
  { entry: docxEntry, format: "docx", variant: "docm", main: "application/vnd.ms-word.document.macroEnabled.main+xml", pkg: "application/vnd.ms-word.document.macroEnabled.12" },
  { entry: docxEntry, format: "docx", variant: "dotm", main: "application/vnd.ms-word.template.macroEnabledTemplate.main+xml", pkg: "application/vnd.ms-word.template.macroEnabled.12" },
  { entry: xlsxEntry, format: "xlsx", variant: "xlsm", main: "application/vnd.ms-excel.sheet.macroEnabled.main+xml", pkg: "application/vnd.ms-excel.sheet.macroEnabled.12" },
  { entry: xlsxEntry, format: "xlsx", variant: "xltm", main: "application/vnd.ms-excel.template.macroEnabled.main+xml", pkg: "application/vnd.ms-excel.template.macroEnabled.12" },
  { entry: xlsxEntry, format: "xlsx", variant: "xlam", main: "application/vnd.ms-excel.addin.macroEnabled.main+xml", pkg: "application/vnd.ms-excel.addin.macroEnabled.12" },
  { entry: pptxEntry, format: "pptx", variant: "pptm", main: "application/vnd.ms-powerpoint.presentation.macroEnabled.main+xml", pkg: "application/vnd.ms-powerpoint.presentation.macroEnabled.12" },
  { entry: pptxEntry, format: "pptx", variant: "potm", main: "application/vnd.ms-powerpoint.template.macroEnabled.main+xml", pkg: "application/vnd.ms-powerpoint.template.macroEnabled.12" },
  { entry: pptxEntry, format: "pptx", variant: "ppsm", main: "application/vnd.ms-powerpoint.slideshow.macroEnabled.main+xml", pkg: "application/vnd.ms-powerpoint.slideshow.macroEnabled.12" },
  { entry: pptxEntry, format: "pptx", variant: "ppam", main: "application/vnd.ms-powerpoint.addin.macroEnabled.main+xml", pkg: "application/vnd.ms-powerpoint.addin.macroEnabled.12" },
];
const DIR = { docx: "word/", pptx: "ppt/", xlsx: "xl/" };
const content = {
  docx: (o) => F.docx({ ...o, body: F.wp(F.wr("Body text")), comments: '<w:comments xmlns:w="w"><w:comment w:id="1"><w:p><w:r><w:t>c</w:t></w:r></w:p></w:comment></w:comments>', core: F.core({ creator: "A" }) }),
  pptx: (o) => F.pptx({ ...o, slides: [{ file: "slide1.xml", texts: ["Slide text"], notes: "notes" }], core: F.core({ creator: "A" }) }),
  xlsx: (o) => F.xlsx({ ...o, sheets: [{ name: "S", data: { rows: [{ r: 1, cells: [{ r: "A1", f: "1+1", v: "2" }] }] } }], core: F.core({ creator: "A" }) }),
};
const without = (o, ...keys) => { const c = { ...o }; for (const k of keys) delete c[k]; return c; };

test("R33 each macro-enabled twin reads as its plain twin through the same parts(), structure() and text(), with variant set and its VBA project in active", async () => {
  for (const tw of TWINS) {
    const extra = [{ name: `${DIR[tw.format]}vbaProject.bin`, data: VBA }];
    const twin = content[tw.format]({ mainType: tw.main, extra });
    const plain = content[tw.format]({ extra });
    const p = await tw.entry.parts(twin);
    assert.equal(p.ok, true, tw.variant);
    const [st, sp] = [await tw.entry.structure(twin), await tw.entry.structure(plain)];
    const [tt, tp] = [await tw.entry.text(twin), await tw.entry.text(plain)];
    assert.equal(st.variant, tw.variant);
    assert.equal(tt.variant, tw.variant);
    assert.equal(sp.variant, null, `${tw.format}: a plain file's variant is null`);
    assert.equal(tp.variant, null);
    assert.deepEqual(without(st, "variant"), without(sp, "variant"), `${tw.variant} structure() is the plain twin's`);
    assert.deepEqual(without(tt, "variant"), without(tp, "variant"), `${tw.variant} text() is the plain twin's`);
    assert.deepEqual(st.active, [await vbaItem(twin, `${DIR[tw.format]}vbaProject.bin`)]);
    assert.equal(st.active[0].read, true);
    /* another entry does not claim the twin: it is discriminated as its plain twin's format */
    for (const other of FORMATS) if (other.format !== tw.format) assert.equal((await other.entry.parts(twin)).ok, false, `${other.format} on ${tw.variant}`);
    /* the byte ladder is the plain entry's (R2) */
    assert.deepEqual(tw.entry.detect(twin, null), tw.entry.detect(plain, null));
  }
  /* csv carries no variant */
  assert.ok(!("variant" in await csvEntry.structure(F.enc("a,b\n1,2\n"))));
  assert.ok(!("variant" in await csvEntry.text(F.enc("a,b\n1,2\n"))));
});

test("R33 detect(null, contentType): each twin's package type is likely, format the entry's own; exact, never case-folded; no other entry claims it", () => {
  for (const tw of TWINS) {
    const d = tw.entry.detect(null, tw.pkg);
    assert.equal(d.format, tw.format, tw.pkg);
    assert.equal(d.confidence, "likely");
    assert.ok(d.signals.length > 0 && d.signals.some((s) => s.includes(tw.variant)), tw.pkg);
    for (const e of [docxEntry, pptxEntry, xlsxEntry, csvEntry]) if (e !== tw.entry) assert.equal(e.detect(null, tw.pkg), null, `${e.format} on ${tw.pkg}`);
    assert.equal(tw.entry.detect(null, tw.pkg.toUpperCase()), null);
    assert.equal(tw.entry.detect(null, `${tw.pkg}; charset=binary`), null);
    assert.equal(tw.entry.detect(null, tw.main), null, "the main part's type is not the package's");
  }
  for (const e of [docxEntry, pptxEntry, xlsxEntry]) for (const odd of ["constructor", "__proto__", "toString", 5, {}]) assert.equal(e.detect(null, odd), null);
});

/* ------------------------------------------------------------------ R12 (F18) */

const MiB = 1024 * 1024;

test("R12 every part read passes ooxml's part cap: a part declared over MEMBER_MAX puts the file over ARCHIVE_TOTAL_MAX, so nothing is inflated and the refusal names the limit", async () => {
  assert.equal(MEMBER_MAX, ARCHIVE_TOTAL_MAX, "the two figures this test reasons from (ooxml R30)");
  const huge = { usize: MEMBER_MAX + 1 };
  for (const { entry, format, dir, build } of FORMATS) {
    for (const part of [`${dir}embeddings/oleObject1.bin`, `${dir}media/image1.png`, `${dir}vbaProject.bin`, `${dir}_rels/x.xml.rels`, "docProps/core.xml", "customXml/item1.xml"]) {
      const b = build({ extra: [{ name: part, data: "small", cd: huge }] });
      const p = await entry.parts(b);
      assert.equal(p.ok, false, `${format} ${part}`);
      assert.match(p.why, /ARCHIVE_TOTAL_MAX|MEMBER_MAX/, `${format} ${part}: ${p.why}`);
      assert.doesNotMatch(p.why, /size_mismatch|inflate_failed|crc_mismatch/, "refused before any inflation");
      const s = await entry.structure(b);
      const t = await entry.text(b);
      assert.deepEqual(s, { ok: false, container: format, reason: p.why });
      assert.deepEqual(t, { ok: false, container: format, reason: p.why });
    }
  }
});

test("R12 the file's declared total: over ARCHIVE_TOTAL_MAX every read refuses by that name; at it, the file reads (and a member no reader inflates is never refused)", async () => {
  for (const { entry, format, build } of FORMATS) {
    /* each member under MEMBER_MAX, together over the total */
    const over = build({ extra: [{ name: "customXml/a.xml", data: "a", cd: { usize: 200 * MiB } }, { name: "customXml/b.xml", data: "b", cd: { usize: 200 * MiB } }] });
    const p = await entry.parts(over);
    assert.equal(p.ok, false, format);
    assert.equal(p.why, "content_types_unreadable:ARCHIVE_TOTAL_MAX", format);
    /* exactly the total: everything the reader inflates still reads */
    const draft = readContainer(build({ extra: [{ name: "customXml/a.xml", data: "a" }] }));
    const others = draft.entries.reduce((n, e) => n + e.uncompressedSize, 0) - 1;
    const at = build({ extra: [{ name: "customXml/a.xml", data: "a", cd: { usize: ARCHIVE_TOTAL_MAX - others } }] });
    assert.equal(readContainer(at).entries.reduce((n, e) => n + e.uncompressedSize, 0), ARCHIVE_TOTAL_MAX);
    const t = await entry.text(at);
    assert.equal(t.ok, true, format);
    assert.notEqual(t.document, null, format);
    assert.deepEqual(t.active, [], format);
  }
});
