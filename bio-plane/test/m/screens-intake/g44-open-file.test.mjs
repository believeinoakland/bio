/* screens-intake R5, R36 (G44): the safe view of a spreadsheet draws what the answer says, a cut or an unreadable sheet and a file no
 * preview can show stated by key. Fix round 10 (K5054): over the REAL store: the spreadsheets are held by the member's real acts (workbooks written
 * with test-support's `makeZip`: a long sheet, many sheets, a sheet whose part is damaged, a package above what a safe view reads, an ODS declaring more
 * than its bound) and the answers are file-safety's own `safeview`, whose figures the assertions read from the owner's answer. The two answers the
 * owner cannot be made to give from a file (a sheet cut whose total it does not know; an answer from an older record) and the refusal without its
 * figures stay scripted, each said where it is. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, html, text, main, press, ok, refused, word, says, rawKeys } from "./page.mjs";
import { makeZip } from "../../make-zip.mjs";

const MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const XT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const sheetXml = (rows) => `<worksheet xmlns="${MAIN}"><sheetData>` + Array.from({ length: rows }, (_, i) => `<row r="${i + 1}"><c r="A${i + 1}"><v>${i + 1}</v></c></row>`).join("") + `</sheetData></worksheet>`;
/* a workbook of `sheets` `[{name, xml, entry?}]` (`entry` overrides the sheet part's zip entry: the central directory lying, a damaged part) */
function xlsxOf(sheets, extra = []) {
  const ct = `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>`;
  const wb = `<workbook xmlns="${MAIN}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>`
    + sheets.map((s, i) => `<sheet name="${s.name}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") + `</sheets></workbook>`;
  const rels = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
    + sheets.map((s, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("") + `</Relationships>`;
  return makeZip([{ name: "[Content_Types].xml", data: ct }, { name: "xl/workbook.xml", data: wb }, { name: "xl/_rels/workbook.xml.rels", data: rels },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: s.xml, ...(s.entry ?? {}) })), ...extra]);
}
/* an ODS of one small table whose content.xml the central directory says is `declared` bytes (a lie, so the part is never read) */
function odsDeclaring(declared) {
  const ns = 'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"';
  const type = "application/vnd.oasis.opendocument.spreadsheet";
  const cell = (v) => `<table:table-cell office:value-type="float" office:value="${v}"><text:p>${v}</text:p></table:table-cell>`;
  const content = `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${ns} office:version="1.3"><office:body><office:spreadsheet><table:table table:name="S"><table:table-row>${cell(1)}</table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`;
  const manifest = `<?xml version="1.0"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="${type}"/></manifest:manifest>`;
  return { bytes: makeZip([{ name: "mimetype", data: type, method: 0 }, { name: "META-INF/manifest.xml", data: manifest }, { name: "content.xml", data: content, central: { uncompressedSize: declared } }]), type };
}

/* the member's own held file, and the page opened on it; `safeview` pressed as a member presses it */
const held = async (bytes, type = XT, name = "Budget") => {
  const t = await members({ mai: ["contribute"] });
  const h = await t.world.recipes.hold(t.mai, name, bytes, "", { type });
  return { ...t, sha: h.sha };
};
/* a file too large to be filed as a document is still a capture the member's upload made (`captureupload`), which the screen opens by its digest */
const uploaded = async (bytes, type, name = "Budget") => {
  const t = await members({ mai: ["contribute"] });
  const up = await t.world.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: name, name, type })}`, init: { method: "POST", headers: { "content-type": type }, body: bytes } }, t.mai);
  const doc = up.json && up.json.result && up.json.result.document;
  if (!doc || !doc.capture) throw new Error(`captureupload was refused: ${JSON.stringify(up.json).slice(0, 300)}`);
  return { ...t, sha: doc.capture.sha256 };
};
const drawn = async (t, plane = {}) => {
  const p = await openWorld(`/app/open-file/${t.sha}`, { world: t.world, as: t.mai, plane });
  await press(p, "safeview", { reason: "to read it" });
  return p;
};
const MB = (n) => (n / 1048576).toFixed(1);
const cutWords = ["screen.open-file.safe.cut", "screen.open-file.safe.cut.more", "screen.open-file.safe.sheetscut", "screen.open-file.safe.sheet.unreadable"];

test("R5 R36 a cut sheet draws the rows shown of the total by key; a sheet of unknown total says the same without it", async () => {
  const t = await held(xlsxOf([{ name: "FY22", xml: sheetXml(2500) }]));
  const p = await drawn(t);
  const v = (await t.mai.read("safeview", { query: { capture: t.sha } })).sheets[0];
  assert.equal(v.truncated, true, "the owner cuts a long sheet");
  assert.ok(says(p, "screen.open-file.safe.cut", { from: v.rows.from, to: v.rows.to, total: v.total_rows }));
  assert.match(html(p), /<td>A3<\/td><td>3<\/td>/);
  /* the owner always states the total of a sheet it cuts, so the answer that does not is the one scripted answer of this test */
  const cells = Array.from({ length: 3 }, (_, i) => ({ ref: `A${i + 1}`, value: `v${i + 1}`, type: "s" }));
  const q = await drawn(t, { safeview: ok({ ok: true, kind: "data", derived: true, sheets: [{ name: "FY22", cells, rows: { from: 1, to: 3 }, total_rows: null, truncated: true, next_row: 4 }], sheets_total: 1, sheets_truncated: false }) });
  assert.ok(says(q, "screen.open-file.safe.cut.more", { from: 1, to: 3 }));
  assert.deepEqual(rawKeys(q), []);
});

test("R5 R36 a whole sheet and an answer from an older record draw no cut, no sheet statement", async () => {
  const t = await held(xlsxOf([{ name: "FY22", xml: sheetXml(2) }]));
  const whole = await drawn(t);
  const w = (await t.mai.read("safeview", { query: { capture: t.sha } })).sheets[0];
  assert.deepEqual([w.truncated, w.total_rows], [false, 2], "the owner states it whole");
  /* an answer from an older record carries no rows, no total, no cut: no file the owner holds now is answered so, so this one answer is scripted */
  const old = await drawn(t, { safeview: ok({ ok: true, kind: "data", derived: true, sheets: [{ name: "FY22", cells: [{ ref: "A1", value: "1", type: "s" }, { ref: "A2", value: "2", type: "s" }] }] }) });
  for (const [p, last] of [[whole, "2"], [old, "2"]]) {
    assert.match(html(p), new RegExp(`<td>A2<\\/td><td>${last}<\\/td>`));
    /* no sentence of the four is in the page: their keys are not even asked for when nothing is cut */
    assert.equal(main(p).querySelectorAll(".mk-note").length, 0);
  }
});

test("R5 R36 a cut list of sheets says how many of how many are shown; a sheet that could not be shown says so, with no empty table", async () => {
  /* twenty-five sheets, more than a safe view shows; the last of the shown a damaged part (its checksum is wrong) */
  const sheets = Array.from({ length: 25 }, (_, i) => ({ name: `S${i + 1}`, xml: sheetXml(2), ...(i === 1 ? { entry: { central: { crc32: 1 } } } : {}) }));
  const t = await held(xlsxOf(sheets));
  const p = await drawn(t);
  const v = await t.mai.read("safeview", { query: { capture: t.sha } });
  assert.equal(v.sheets_truncated, true);
  assert.ok(says(p, "screen.open-file.safe.sheetscut", { shown: v.sheets.length, total: v.sheets_total }));
  const bad = v.sheets.find((s) => s.reason);
  assert.equal(bad.name, "S2");
  assert.ok(says(p, "screen.open-file.safe.sheet.unreadable", { name: bad.name }));
  assert.equal(main(p).querySelectorAll("table").length, v.sheets.length - 1, "only the readable sheets draw a table");
  for (const k of cutWords) assert.ok(typeof word(k, { from: 1, to: 1, total: 1, shown: 1, name: "x" }) === "string", k);
});

test("R5 R36 a refusal with a size and a bound draws the no-preview sentence in MB; one without them draws as before", async () => {
  const MIB = 1024 * 1024;
  const pad = new Uint8Array(21 * MIB);
  const ods = odsDeclaring(600 * MIB);
  const files = { TOO_LARGE: [xlsxOf([{ name: "S", xml: sheetXml(2) }], [{ name: "xl/media/big.bin", data: pad, method: 0 }]), XT],
                  PREVIEW_NOT_DRAWN: [ods.bytes, ods.type] };
  for (const [reason, [bytes, type]] of Object.entries(files)) {
    const t = await uploaded(bytes, type);
    const p = await drawn(t);
    const r = await t.mai.act("safeview", { query: { capture: t.sha } }).then(() => null, (e) => e.message);
    assert.match(r, new RegExp(reason), "the owner refuses it, naming why");
    /* the figures are the owner's, read from its refusal */
    const refusal = JSON.parse(r.slice(r.indexOf("{")));
    const f = refusal.result;
    assert.ok(Number.isFinite(f.size) && Number.isFinite(f.bound), "the owner states the size and the bound");
    assert.ok(says(p, "screen.open-file.safe.notdrawn", { size: MB(f.size), bound: MB(f.bound) }), reason);
    assert.ok(!text(p).includes(f.translation), "not the generic sentence alone");
    assert.equal(main(p).querySelectorAll("table").length, 0, "never an empty table");
  }
  /* the owner states the figures with this refusal every time, so a refusal without them is a scripted one */
  const t = await held(xlsxOf([{ name: "S", xml: sheetXml(2) }]));
  const plain = await drawn(t, { safeview: refused("SAFE_VIEW_FAILED", "The safe view could not be made.", 422, { renderer_reason: "TOO_LARGE" }) });
  assert.match(text(plain), /The safe view could not be made\./);
});
