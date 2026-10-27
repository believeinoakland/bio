/* mail-reader R4, R9, R10: attachments listed and cut as members, and the one nesting count over archives and
 * messages together (build/requirements/mail-reader.md). PDF, XLSX and ZIP members come from test-support's
 * generators; the cut XLSX is listed by `ooxml`, the provider of the archive route. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readMessage, attachmentBytes, nestingOf } from "../../../src/mail-reader/index.mjs";
import { listArchive } from "../../../src/ooxml.mjs";
import { makeZip } from "../../make-zip.mjs";
import { generate as pdfgen } from "../../pdfgen.mjs";
import { generate as sheetgen } from "../../sheetgen.mjs";
import * as F from "./fixtures.mjs";

const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

test("R4 a message with a PDF, an XLSX and an inner EML: three members, each cut whole and read", async () => {
  const pdf = await pdfgen({ kind: "pdf", seed: "mail-r4", size: { pages: 1, lines: 2 } }).bytes();
  const xlsx = await sheetgen({ kind: "xlsx", seed: "mail-r4", size: { rows: 3, cols: 2 } }).bytes();
  const inner = F.eml(["From: Inner <inner@example.org>", "Subject: The inner one", "Date: Mon, 5 Oct 2026 08:00:00 +0000"], "Inner body token-77");
  const outer = F.withAttachments([F.attachmentPart("minutes.pdf", "application/pdf", pdf), F.attachmentPart("budget.xlsx", XLSX, xlsx), F.rfc822Part(inner)]);
  const a = await readMessage(outer);
  assert.equal(a.ok, true);
  assert.deepEqual(a.attachments.map((x) => [x.index, x.name_stated, x.type_stated, x.size]), [
    [0, "minutes.pdf", "application/pdf", pdf.length], [1, "budget.xlsx", XLSX, xlsx.length], [2, "inner.eml", "message/rfc822", inner.length],
  ]);
  const cut = await Promise.all([0, 1, 2].map((i) => attachmentBytes(outer, i)));
  assert.deepEqual(cut.map((c) => c.ok), [true, true, true]);
  assert.deepEqual(cut[0].bytes, pdf);
  assert.deepEqual(cut[1].bytes, xlsx);
  const sheet = await listArchive(cut[1].bytes);
  assert.equal(sheet.ok, true);
  assert.ok(sheet.entries.some((e) => e.name === "xl/workbook.xml"));
  const read = await readMessage(cut[2].bytes, { within: 1 });
  assert.equal(read.headers.subject, "The inner one");
  assert.equal(read.body.text, "Inner body token-77");
});

test("R4 an attachment index the message lacks is refused, never thrown", async () => {
  const outer = F.withAttachments([F.attachmentPart("a.txt", "text/plain", "x")]);
  const r = await attachmentBytes(outer, 5);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "MAIL_ATTACHMENT_NO_SUCH");
  assert.equal(typeof r.detail, "string");
});

test("R9 two reads of the same message give the same indexes; an inline image is flagged inline; an attached EML is message/rfc822", async () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
  const related = F.multipart("rel", [
    { headers: ["Content-Type: text/html; charset=utf-8"], body: '<p>Logo <img src="cid:logo1"></p>' },
    { headers: ["Content-Type: image/png", "Content-Transfer-Encoding: base64", "Content-ID: <logo1>"], body: F.b64(png) },
  ]);
  const outer = F.eml([...F.STANDARD, 'Content-Type: multipart/mixed; boundary="mix"'], F.multipart("mix", [
    { headers: ['Content-Type: multipart/related; boundary="rel"'], body: related },
    F.attachmentPart("report.pdf", "application/pdf", "%PDF-1.4 r"),
    F.rfc822Part(F.eml(["From: x@example.org", "Subject: fwd"], "inner")),
  ]));
  const one = await readMessage(outer), two = await readMessage(outer);
  assert.deepEqual(one.attachments, two.attachments);
  assert.deepEqual(one.attachments.map((x) => [x.index, x.type_stated, x.inline]), [[0, "image/png", true], [1, "application/pdf", false], [2, "message/rfc822", false]]);
  assert.equal(one.attachments[0].size, png.length);
  assert.equal(one.attachments[0].content_id, "logo1");
  assert.equal(one.body.text, "Logo");
});

test("R9 an attachment whose name is RFC 2231 encoded is listed under its decoded name", async () => {
  const part = { headers: ["Content-Type: application/pdf", "Content-Disposition: attachment; filename*=UTF-8''r%C3%A9sum%C3%A9.pdf", "Content-Transfer-Encoding: base64"], body: F.b64("%PDF-1.4") };
  const a = await readMessage(F.withAttachments([part]));
  assert.equal(a.attachments[0].name_stated, "résumé.pdf");
});

/* chains: a message holding `inner`, an archive holding `inner` */
const msgHolding = (inner, tag) => F.withAttachments([inner instanceof Uint8Array && inner[0] === 0x50 ? F.attachmentPart(`${tag}.zip`, "application/zip", inner) : F.rfc822Part(inner, `${tag}.eml`)], `level ${tag}`, F.STANDARD, `b-${tag}`);
const zipHolding = (inner, tag) => makeZip([{ name: `${tag}.eml`, data: inner }]);
const leaf = F.eml(["From: leaf@example.org", "Subject: leaf"], "leaf");

test("R10 a ZIP holding an EML holding a ZIP holding an EML (depth 4) is refused naming its depth; depth 3 reads", async () => {
  const deep = zipHolding(msgHolding(zipHolding(leaf, "z2"), "m1"), "z1");
  const r = await nestingOf(deep);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "MAIL_TOO_NESTED");
  assert.equal(r.depth, 4);
  assert.equal(r.max, 3);
  assert.equal(typeof r.detail, "string");
  const three = zipHolding(msgHolding(leaf, "m1"), "z1");
  assert.deepEqual(await nestingOf(three), { ok: true, nesting_depth: 3 });
});

test("R10 the count is one along a message chain: a plain message is 1, each attached message one more, the fourth refused", async () => {
  assert.equal((await readMessage(leaf)).nesting_depth, 1);
  const two = msgHolding(leaf, "a");
  assert.equal((await readMessage(two)).nesting_depth, 2);
  const three = msgHolding(two, "b");
  assert.equal((await readMessage(three)).nesting_depth, 3);
  const four = await readMessage(msgHolding(three, "c"));
  assert.equal(four.ok, false);
  assert.equal(four.reason, "MAIL_TOO_NESTED");
  assert.equal(four.depth, 4);
});

test("R10 the containers enclosing a message, held by the caller, count in its depth", async () => {
  const two = msgHolding(leaf, "a");
  assert.equal((await readMessage(two, { within: 1 })).nesting_depth, 3);
  assert.equal((await readMessage(two, { within: 2 })).reason, "MAIL_TOO_NESTED");
});

test("R10 a message holding a ZIP holding a message counts the archive in the chain", async () => {
  const m = msgHolding(zipHolding(leaf, "z"), "m");
  assert.equal((await readMessage(m)).nesting_depth, 3);
});
