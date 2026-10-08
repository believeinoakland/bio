/* file-safety R11, R12, R33, R37: the safe view, its render, the safe copy, and that neither is ever a capture. At the
   module's interface, over provenance's real tables (R37 reads them) and the scripted renderer and CDR tool. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, pdf, sha, enc } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { FILE_SAFETY_CHECKS, derivedKey } from "../../../src/file-safety/index.mjs";

const row = (code) => ({ check: FILE_SAFETY_CHECKS[code].check, translation: FILE_SAFETY_CHECKS[code].translation });
const refused = (r, code) => {
  assert.ok(!(r instanceof Response), `${code}: it served`);
  assert.deepEqual({ code: r.code, check: r.check, translation: r.translation }, { code, ...row(code) });
};
const XCT = `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>`;
const WB = `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Budget" sheetId="1" r:id="rId1"/></sheets></workbook>`;
const RELS = `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/externalLink" Target="https://evil.example/x" TargetMode="External"/></Relationships>`;
const SHEET = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1"><v>0.1</v></c><c r="B1"><f>A1*2+WEBSERVICE("https://evil.example")</f><v>99</v></c><c r="C1" t="inlineStr"><is><t>label</t></is></c></row></sheetData></worksheet>`;
const xlsx = () => makeZip([{ name: "[Content_Types].xml", data: XCT }, { name: "xl/workbook.xml", data: WB }, { name: "xl/_rels/workbook.xml.rels", data: RELS }, { name: "xl/worksheets/sheet1.xml", data: SHEET }]);
const CT = `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
const docx = () => makeZip([{ name: "[Content_Types].xml", data: CT }, { name: "word/document.xml", data: `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>hi</w:t></w:r></w:p></w:body></w:document>` }]);

test("R11: `safeView` by route: PDFs and office documents answer the image-only PDF {kind: pdf, derived: true, of, sha256, pages, source_pages, truncated, original} with its bytes; spreadsheets (OOXML, CSV) answer {kind: data, derived: true, of, sheets: [{name, cells: [{ref, value, type}]}], original}, the cached values, no formula computed, no link followed; `original` is R9's answer; NO_SAFE_VIEW, SAFE_VIEW_PENDING, SAFE_VIEW_FAILED with the renderer's reason, RENDERER_ABSENT, and R8's first two", async () => {
  const w = world({ scan: { render: (s) => (s === sha(docx()) ? { code: "RENDER_FAILED", detail: "soffice exited 1" } : enc(`%PDF-1.4 image-only view of ${s}`)) } });
  const p = await w.capture(pdf(true, "doc"));
  refused(await w.fs.safeView({ captureSha: p, viewer: "member:m1" }), "SAFE_VIEW_PENDING");
  await w.fs.renderBatch({});
  const r = await w.fs.safeView({ captureSha: p, viewer: "member:m1" });
  assert.ok(r instanceof Response);
  const body = new Uint8Array(await r.arrayBuffer());
  assert.deepEqual(body, enc(`%PDF-1.4 image-only view of ${p}`));
  assert.equal(r.headers.get("content-type"), "application/pdf");
  const d = JSON.parse(r.headers.get("x-file-safety"));
  assert.deepEqual(d, { kind: "pdf", derived: true, of: p, sha256: sha(body), pages: 2, source_pages: 3, truncated: true,
                        original: { may_open: true, path: "warned", why: null } });
  assert.deepEqual(d.original, (({ ok, captureSha, ...x }) => x)(await w.fs.originalState({ captureSha: p, viewer: "member:m1" })));
  assert.deepEqual(w.calls("/render").map((c) => c.body.route), ["pdf"]);
  /* an office document renders by the office route; the renderer's refusal is stated */
  const o = await w.capture(docx());
  await w.fs.renderBatch({});
  assert.deepEqual(w.calls("/render").map((c) => c.body.route), ["pdf", "office"]);
  const f = await w.fs.safeView({ captureSha: o, viewer: "member:m1" });
  refused(f, "SAFE_VIEW_FAILED");
  assert.deepEqual([f.renderer_reason, f.renderer_detail], ["RENDER_FAILED", "soffice exited 1"]);
  /* a spreadsheet: its cells as the file holds them */
  const x = await w.capture(xlsx());
  const v = await w.fs.safeView({ captureSha: x, viewer: "member:m1" });
  assert.deepEqual([v.ok, v.kind, v.derived, v.of], [true, "data", true, x]);
  assert.deepEqual(v.sheets, [{ name: "Budget", cells: [{ ref: "A1", value: "0.1", type: "number" }, { ref: "B1", value: "99", type: "number" }, { ref: "C1", value: "label", type: "text" }] }]);
  assert.deepEqual(v.original, { may_open: true, path: "warned", why: null }, "the external link makes it high; nothing was followed");
  assert.equal(w.calls("/render").filter((c) => c.body.target.capture_sha === x).length, 0, "no render is asked for data");
  const c = await w.capture(enc("year,amount\n2025,310000\n"));
  assert.deepEqual((await w.fs.safeView({ captureSha: c, viewer: "member:m1" })).sheets, [{ name: "csv", cells: [
    { ref: "A1", value: "year", type: "text" }, { ref: "B1", value: "amount", type: "text" }, { ref: "A2", value: "2025", type: "text" }, { ref: "B2", value: "310000", type: "text" }] }]);
  /* no safe view for another format */
  refused(await w.fs.safeView({ captureSha: await w.capture(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), viewer: "member:m1" }), "NO_SAFE_VIEW");
  refused(await w.fs.safeView({ captureSha: await w.capture(makeZip([{ name: "a", data: "a" }])), viewer: "member:m1" }), "NO_SAFE_VIEW");
  /* R8's first two */
  refused(await w.fs.safeView({ captureSha: sha("nothing"), viewer: "member:m1" }), "FILE_NOT_HELD");
  w.project("PROJ-1", "m1"); w.home(p, "INFO-P", { project: "PROJ-1" });
  assert.equal((await w.fs.safeView({ captureSha: p, viewer: "member:m2" })).code, "FILE_NOT_HELD");
  /* no renderer bound */
  const n = world({ bound: false });
  refused(await n.fs.safeView({ captureSha: await n.capture(pdf(false, "n")), viewer: "member:m1" }), "RENDERER_ABSENT");
  refused(await n.fs.renderBatch({}), "RENDERER_ABSENT");
});

test("R12: `renderBatch` renders queued files after their capture, never inside the capture's act; a view is stored under its own digest outside captures/, labelled derived and naming its original, never registered, a capture, graded or chained; a file under a scan hold still gets and serves its safe view", async () => {
  const w = world({ scan: { clamav: () => ({ result: "found", findings: ["Pdf.Exploit.R"] }) } });
  const s = await w.capture(pdf(false, "r"));
  assert.equal(w.calls("/render").length, 0, "nothing renders inside the capture");
  await w.fs.scanBatch({});
  assert.ok((await w.fs.threatOf({ captureSha: s })).scan_hold);
  const b = await w.fs.renderBatch({});
  assert.deepEqual([b.ok, b.rendered, b.failed, b.remaining], [true, 1, 0, 0]);
  const view = sha(enc(`%PDF-1.4 safe view of ${s}`));
  const put = w.bucket.calls.find((c) => c[0] === "put" && c[1] === derivedKey("bio", view));
  assert.ok(put, "stored under its own digest outside captures/");
  assert.equal(put[1], `bio/derived/${view}`);
  assert.deepEqual(put[2].customMetadata, { derived: "true", of: s, kind: "safe-view" });
  assert.equal(w.bucket.held.has(`bio/captures/${view}`), false);
  assert.equal((await w.fs.safeView({ captureSha: s, viewer: "member:m1" })).status, 200, "served under the hold");
  assert.equal(w.row("SELECT COUNT(*) AS n FROM captured_locators WHERE capture_sha = ?", view).n, 0);
  assert.equal(w.row("SELECT COUNT(*) AS n FROM register WHERE capture_sha = ?", view).n, 0);
  assert.equal(w.row("SELECT COUNT(*) AS n FROM fs_files WHERE capture_sha = ?", view).n, 0, "not queued as a capture");
  assert.equal(w.prov.captureGrade(view).route, "unrecorded", "never graded by a route");
  /* rendered once: a second batch asks nothing */
  await w.fs.renderBatch({});
  assert.equal(w.calls("/render").length, 1);
});

test("R33 (K1929 (4)): `requestSafeCopy` asks the first on CDR tool for a rebuilt file, stored under its own digest outside captures/ naming its original and the tool, never registered, a capture, graded or chained; then scanned by ClamAV with a copy note; `safeCopy` answers {kind: copy, derived: true, of, sha256, content_type, removed, tool, original} and its bytes, or NO_SAFE_COPY, SAFE_COPY_PENDING, SAFE_COPY_FAILED with the tool's reason, SAFE_COPY_WITHHELD when its ClamAV note is not clean, and R8's first two; it opens for a high file without a deeper check and under a scan hold; a routine CDR tool queues every file", async () => {
  let copyScan = { result: "clean" };
  let holdThis = null;
  const w = world({ scan: { clamav: (x) => (x === holdThis ? { result: "found", findings: ["Pdf.Exploit.H"] } : { result: "clean" }), copyScan: () => copyScan, cdr: (s) => (s === sha(pdf(true, "unsupported")) ? { code: "CDR_UNSUPPORTED_TYPE" } : { bytes: enc(`rebuilt ${s}`), removed: ["javascript", "open-action"] }) } });
  const s = await w.capture(pdf(true, "copy"));
  refused(await w.fs.requestSafeCopy({ captureSha: s, viewer: "member:m1" }), "NO_SAFE_COPY");
  refused(await w.fs.safeCopy({ captureSha: s, viewer: "member:m1" }), "NO_SAFE_COPY");
  const tool = await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  refused(await w.fs.safeCopy({ captureSha: s, viewer: "member:m1" }), "SAFE_COPY_PENDING");
  assert.deepEqual(await w.fs.requestSafeCopy({ captureSha: s, viewer: "member:m1" }), { ok: true, captureSha: s, state: "done" });
  const r = await w.fs.safeCopy({ captureSha: s, viewer: "member:m1" });
  assert.ok(r instanceof Response);
  const bytes = new Uint8Array(await r.arrayBuffer());
  assert.deepEqual(bytes, enc(`rebuilt ${s}`));
  const d = JSON.parse(r.headers.get("x-file-safety"));
  assert.deepEqual(d, { kind: "copy", derived: true, of: s, sha256: sha(bytes), content_type: "application/pdf", removed: ["javascript", "open-action"],
                        tool: "glasswall-halo", original: { may_open: true, path: "warned", why: null } });
  const put = w.bucket.calls.find((c) => c[0] === "put" && c[1] === derivedKey("bio", sha(bytes)));
  assert.deepEqual(put[2].customMetadata, { derived: "true", of: s, kind: "safe-copy", tool: "glasswall-halo" });
  /* scanned by ClamAV: the copy note, beside the original's notes */
  const scan = w.calls("/scan").find((c) => c.body.area === "derived");
  assert.deepEqual(scan.body.targets, [{ capture_sha: sha(bytes), parts: null }]);
  assert.deepEqual(w.fs.verdictNotes({ captureSha: s }).notes.filter((n) => n.kind === "copy").map((n) => [n.tool, n.result]), [["clamav", "clean"]]);
  /* never a capture, never graded */
  assert.equal(w.row("SELECT COUNT(*) AS n FROM captured_locators WHERE capture_sha = ?", sha(bytes)).n, 0);
  assert.equal(w.prov.homeOf(sha(bytes)), null);
  assert.equal(w.row("SELECT COUNT(*) AS n FROM fs_files WHERE capture_sha = ?", sha(bytes)).n, 0);
  /* under a scan hold it stays available */
  holdThis = s;
  await w.fs.scanBatch({});
  assert.ok((await w.fs.threatOf({ captureSha: s })).scan_hold);
  assert.equal((await w.fs.safeCopy({ captureSha: s, viewer: "member:m1" })).status, 200);
  /* the tool's refusal is stated */
  const u = await w.capture(pdf(true, "unsupported"));
  assert.equal((await w.fs.requestSafeCopy({ captureSha: u, viewer: "member:m1" })).state, "failed");
  const f = await w.fs.safeCopy({ captureSha: u, viewer: "member:m1" });
  refused(f, "SAFE_COPY_FAILED");
  assert.equal(f.tool_reason, "CDR_UNSUPPORTED_TYPE");
  /* withheld while its ClamAV note is not clean (today's scanner cannot read a derived file: its answer is NOT_FOUND) */
  copyScan = { result: "not_scanned", reason: "NOT_FOUND" };
  const h = await w.capture(pdf(true, "withheld"));
  assert.equal((await w.fs.requestSafeCopy({ captureSha: h, viewer: "member:m1" })).state, "withheld");
  refused(await w.fs.safeCopy({ captureSha: h, viewer: "member:m1" }), "SAFE_COPY_WITHHELD");
  copyScan = { result: "found", findings: ["Pdf.Trojan.Copy"] };
  const fd = await w.capture(pdf(true, "copyfound"));
  await w.fs.requestSafeCopy({ captureSha: fd, viewer: "member:m1" });
  refused(await w.fs.safeCopy({ captureSha: fd, viewer: "member:m1" }), "SAFE_COPY_WITHHELD");
  assert.equal((await w.fs.threatOf({ captureSha: fd })).scan_hold, null, "a copy's finding holds the copy back, not the original");
  /* R8's first two */
  refused(await w.fs.safeCopy({ captureSha: sha("x"), viewer: "member:m1" }), "FILE_NOT_HELD");
  refused(await w.fs.requestSafeCopy({ captureSha: sha("x"), viewer: "member:m1" }), "FILE_NOT_HELD");
  w.project("PROJ-1", "m1"); w.home(s, "INFO-P", { project: "PROJ-1" });
  assert.equal((await w.fs.safeCopy({ captureSha: s, viewer: "member:m2" })).code, "FILE_NOT_HELD");
  assert.ok(tool);
  /* a routine CDR tool queues every captured file, made at the render wake (R32). No catalogued CDR descriptor states
     the organization's own servers as its recipient today (reported to BOB), so the tool's use is set as R28 would
     record it for one that did. */
  const k = world({ scan: { copyScan: () => ({ result: "clean" }) } });
  const ct = await k.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  k.exec("UPDATE fs_tools SET use = 'routine' WHERE tool_id = ?", ct);
  const q1 = await k.capture(pdf(false, "q1")), q2 = await k.capture(pdf(false, "q2"));
  assert.deepEqual(k.rows("SELECT capture_sha, state FROM fs_copies ORDER BY capture_sha").map((x) => [x.capture_sha, x.state]),
                   [[q1, "queued"], [q2, "queued"]].sort());
  const rb = await k.fs.renderBatch({});
  assert.deepEqual(rb.copies, { made: 2, failed: 0 });
  assert.equal((await k.fs.safeCopy({ captureSha: q1, viewer: "member:m1" })).status, 200);
});

test("R37: a safe view and a safe copy are never a capture: provenance holds no register row, receipt or chain naming their digests, so nothing can cite them", async () => {
  const w = world({ scan: { copyScan: () => ({ result: "clean" }) } });
  const s = await w.capture(pdf(true, "x"));
  w.home(s, "INFO-1");
  await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  await w.fs.renderBatch({});
  await w.fs.requestSafeCopy({ captureSha: s, viewer: "member:m1" });
  const view = w.row("SELECT render_sha FROM fs_files WHERE capture_sha = ?", s).render_sha;
  const copy = w.row("SELECT copy_sha FROM fs_copies WHERE capture_sha = ?", s).copy_sha;
  assert.ok(view && copy && view !== copy);
  const prov = JSON.stringify([w.rows("SELECT * FROM register"), w.rows("SELECT * FROM captured_locators"), w.prov.receipts({}).rows]);
  for (const d of [view, copy]) {
    assert.doesNotMatch(prov, new RegExp(d), "no register row or receipt names it");
    assert.equal(w.prov.homeOf(d), null);
    assert.deepEqual(w.prov.registerHolds({ sha: d }), { ok: true, sha: d, asked: true, registered: false, acquired: false });
    assert.equal(w.prov.versionChain ? (w.prov.versionChain({ addressNorm: `https://files.example/${d.slice(0, 12)}` }).count ?? 0) : 0, 0);
  }
  /* negative control: the original is named there */
  assert.match(prov, new RegExp(s));
});
