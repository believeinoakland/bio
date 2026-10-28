/* acquisition T53 (T53-100; N824, C9 (2), C12 (d)): R136 `fileMember` files one member of a held container, a ZIP's entries and a message's attachments by the one
   function and the one job row; R38 registers the row for each entry it reaches; the outcome is `filed`, `already_held` or `not_filed`; a member that is itself a
   container registers its own rows. At the module's interface (`acquire`, `fileMember`, `memberRow`), over a held ZIP or message and the test-support
   job registrar (the real table's contract). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
// fixtures-contract: store-assembly job-registrar
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";
import { heldParts, homeOfEmpty } from "../provenance/fixtures.mjs";
import { fileMember, memberRow, unpack, ARCHIVE_CHECKS } from "../../../src/acquisition/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const enc = (s) => new TextEncoder().encode(s);
const b64 = (data) => Buffer.from(typeof data === "string" ? enc(data) : data).toString("base64").replace(/.{76}/g, "$&\r\n");
/* a message: headers, then a multipart body of the parts given ({name, type, data, inline?}) */
const message = (parts, { subject = "Records request", id = "m1@example.org" } = {}) => {
  const B = "b-test-1";
  const head = ["From: Ada Lane <ada@example.org>", "To: Clerk <clerk@example.gov>", "Date: Tue, 6 Oct 2026 09:30:00 -0700", `Subject: ${subject}`, `Message-ID: <${id}>`, "MIME-Version: 1.0",
                `Content-Type: multipart/mixed; boundary="${B}"`].join("\r\n");
  const body = [`--${B}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\nSee attached.\r\n`,
    ...parts.map((p) => `--${B}\r\nContent-Type: ${p.type}; name="${p.name}"\r\nContent-Disposition: ${p.inline ? "inline" : "attachment"}; filename="${p.name}"\r\n${p.inline ? "Content-ID: <img1>\r\n" : ""}Content-Transfer-Encoding: base64\r\n\r\n${b64(p.data)}\r\n`),
    `--${B}--\r\n`].join("");
  return enc(`${head}\r\n\r\n${body}`);
};
const PDF = enc("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n");
const CSV = enc("a,b\n1,2\n3,4\n");
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0x1f, 0x15, 0xc4, 0x89]);
const EXE = (() => { const b = new Uint8Array(512); b[0] = 0x4d; b[1] = 0x5a; b[60] = 0x80; b.set(enc("PE\0\0"), 0x80); return b; })();
const U = (n) => `https://files.example/${n}`;
const member = { cls: "member", member: true, sessMember: "m1" };

/* the message held as a capture (a file brought in by URL), and the registrar the plane would hand in */
async function held(w, bytes, name, type) {
  const r = await run(w, { [U(name)]: () => new Response(bytes, { headers: { "content-type": type } }) }, { locator: U(name) });
  assert.equal(r.status, 200, JSON.stringify(r.body).slice(0, 200));
  return r.body.document.capture.sha256;
}
// fixtures-contract: store-assembly job-registrar
const stubbed = (w) => { const j = jobRegistrarStub(); w.store.registerJob = j.registerJob; w.store.armJobs = j.armJobs; return j; };
const rowsOf = (j, kind) => j.rows().filter((x) => x.kind === kind);

test("R136: a ZIP's entries and a message's attachments are members of the one job: R38 registers a `member` row for each entry it reaches, keyed by the capture session, once", async () => {
  const w = world(); const j = stubbed(w);
  const z = makeZip([{ name: "a.txt", data: "alpha" }, { name: "b.txt", data: "beta" }, { name: "c.txt", data: "gamma" }]);
  const r = await run(w, { [U("b.zip")]: () => new Response(z, { headers: { "content-type": "application/zip" } }) }, { locator: U("b.zip") });
  assert.equal(r.status, 200);
  assert.equal(r.body.unpack.documents.length, 3);
  const rows = rowsOf(j, "member");
  assert.deepEqual(rows.map((x) => x.session), [0, 1, 2].map((i) => `${sha(z)}!${i}`));
  assert.ok(rows.every((x) => x.detail.container_kind === "archive" && x.detail.container === sha(z)));
  assert.ok(rows.every((x) => x.state === "queued" || x.state === "finished"));
  /* a second press leaves the same three rows */
  await run(w, { [U("b.zip")]: () => new Response(z, { headers: { "content-type": "application/zip" } }) }, { locator: U("b.zip") });
  assert.equal(rowsOf(j, "member").length, 3);
  /* the row is a pure function of the member */
  assert.deepEqual(memberRow({ container: sha(z), container_kind: "archive", index: 1, name_stated: "b.txt" }).session, `${sha(z)}!1`);
  assert.equal(memberRow({ container: "x", container_kind: "archive", index: 1 }), null);
  assert.equal(memberRow({ container: sha(z), container_kind: "tar", index: 1 }), null);
  /* control: an archive entry that is a folder registers no row, and an upload that is no container registers none */
  const w2 = world(); const j2 = stubbed(w2);
  const withFolder = makeZip([{ name: "dir/", data: "" }, { name: "dir/x.txt", data: "x" }]);
  await run(w2, { [U("f.zip")]: () => new Response(withFolder, { headers: { "content-type": "application/zip" } }) }, { locator: U("f.zip") });
  assert.equal(rowsOf(j2, "member").length, 1, "the folder is listed, never a member");
  const w3 = world(); const j3 = stubbed(w3);
  await run(w3, { [U("p.pdf")]: () => new Response(PDF, { headers: { "content-type": "application/pdf" } }) }, { locator: U("p.pdf") });
  assert.deepEqual(j3.rows(), []);
});

test("R136: a message's attachments are filed by the same function: each cut out unambiguously, filed with the message's receipt route, its container block, and its own reading row", async () => {
  const w = world(); const j = stubbed(w);
  const m = message([{ name: "notice.pdf", type: "application/pdf", data: PDF }, { name: "rows.csv", type: "text/csv", data: CSV }, { name: "logo.png", type: "image/png", data: PNG, inline: true }]);
  const msha = await held(w, m, "m1.eml", "message/rfc822");
  const out = [];
  for (const i of [0, 1, 2]) out.push(await fileMember(w.store, { container: msha, container_kind: "message", index: i, by: "m1", cls: "member", member: true }));
  assert.deepEqual(out.map((x) => [x.ok, x.outcome]), [[true, "filed"], [true, "filed"], [true, "filed"]]);
  const pdf = out[0].document;
  assert.equal(pdf.capture.method, "emailed-attachment");
  assert.deepEqual(pdf.container, { message_sha256: msha, index: 0, name_stated: "notice.pdf", type_stated: "application/pdf", size: PDF.length });
  assert.equal(pdf.locator, `email:${msha}!0`);
  assert.equal(pdf.provenance_chain[0].via, "email-attachment");
  assert.equal(pdf.capture.sha256, sha(PDF));
  assert.equal(pdf.profile.format.format, "pdf");
  assert.equal(w.held(sha(PDF)), true, "the attachment is held whole under its own digest");
  const receipts = w.prov.receipts.filter((x) => x.via === "email-attachment");
  assert.deepEqual(receipts.map((x) => x.address), [0, 1, 2].map((i) => `email:${msha}!${i}`));
  assert.equal(out[2].document.container.name_stated, "logo.png", "an inline image the body refers to is also an attachment");
  /* each filed member registers its own reading row */
  assert.deepEqual(rowsOf(j, "reading").map((x) => x.sha).sort(), [sha(PDF), sha(CSV), sha(PNG)].sort());
  /* a second run of the same row files nothing again: the receipt exists, the outcome is the same sighting */
  const puts = w.b.calls.filter((c) => c[0] === "put").length;
  const again = await fileMember(w.store, { container: msha, container_kind: "message", index: 0, by: "m1", cls: "member", member: true });
  assert.equal(again.outcome, "already_held");
  assert.equal(w.b.calls.filter((c) => c[0] === "put").length, puts, "nothing stored twice");
  assert.equal(w.prov.receipts.filter((x) => x.via === "email-attachment" && x.address === `email:${msha}!0`).length >= 1, true);
});

test("R136: the same attachment in two messages is one capture and two receipts; one attachment not filed (a program) leaves the others filed and the message's filing alone", async () => {
  const w = world();
  const a = message([{ name: "notice.pdf", type: "application/pdf", data: PDF }], { id: "a@x" });
  const b = message([{ name: "same.pdf", type: "application/pdf", data: PDF }, { name: "tool.exe", type: "application/octet-stream", data: EXE }, { name: "rows.csv", type: "text/csv", data: CSV }], { id: "b@x" });
  const sa = await held(w, a, "a.eml", "message/rfc822"), sb = await held(w, b, "b.eml", "message/rfc822");
  const first = await fileMember(w.store, { container: sa, container_kind: "message", index: 0 });
  const second = await fileMember(w.store, { container: sb, container_kind: "message", index: 0 });
  assert.deepEqual([first.outcome, second.outcome, second.sha256], ["filed", "already_held", sha(PDF)]);
  assert.equal(w.prov.receipts.filter((x) => x.captureSha === sha(PDF) && x.via === "email-attachment").length, 2, "two receipts");
  const exe = await fileMember(w.store, { container: sb, container_kind: "message", index: 1 });
  assert.deepEqual([exe.ok, exe.outcome, exe.code, exe.check], [true, "not_filed", "FILE_TYPE_REFUSED", ARCHIVE_CHECKS.FILE_TYPE_REFUSED.check]);
  assert.equal(exe.kind_text, word("file.kind.program"));
  assert.equal(w.held(sha(EXE)), false, "a refused attachment is not stored");
  const csv = await fileMember(w.store, { container: sb, container_kind: "message", index: 2 });
  assert.equal(csv.outcome, "filed");
  /* an attachment that does not exist, and a message that is not held, are refusals */
  assert.equal((await fileMember(w.store, { container: sb, container_kind: "message", index: 9 })).reason, "NO_SUCH_MEMBER");
  assert.equal((await fileMember(w.store, { container: "a".repeat(64), container_kind: "message", index: 0 })).reason, "CONTAINER_NOT_HELD");
  assert.equal((await fileMember(w.store, { container: "zz", container_kind: "message", index: 0 })).reason, "BAD_MEMBER");
  assert.equal((await fileMember(w.store, { container: sb, container_kind: "folder", index: 0 })).reason, "BAD_MEMBER");
});

test("R136: a member of a ZIP is filed by the same function: an entry R38 settled is answered from its outcome and not cut again; an entry still waiting is cut once; a refused entry is not_filed", async () => {
  const w = world();
  const z = makeZip([{ name: "a.txt", data: "alpha" }, { name: "setup.exe", data: EXE }]);
  /* the archive is held and listed but its entries have not been reached: a ZIP with more entries than one call cuts */
  const many = makeZip(Array.from({ length: 105 }, (_, i) => ({ name: `f${i}.txt`, data: `file ${i}` })));
  const r = await run(w, { [U("many.zip")]: () => new Response(many, { headers: { "content-type": "application/zip" } }) }, { locator: U("many.zip") });
  assert.equal(r.body.unpack.documents.length, 100);
  assert.equal(r.body.unpack.waiting, 5);
  const settled = await fileMember(w.store, { container: sha(many), container_kind: "archive", index: 3, by: "m1", cls: "member", member: true });
  assert.deepEqual([settled.ok, settled.outcome, settled.recorded], [true, "filed", true], "answered from the recorded outcome");
  const putsBefore = w.b.calls.filter((c) => c[0] === "put").length;
  await fileMember(w.store, { container: sha(many), container_kind: "archive", index: 3, by: "m1", cls: "member", member: true });
  assert.equal(w.b.calls.filter((c) => c[0] === "put").length, putsBefore, "never cut again");
  const waiting = await fileMember(w.store, { container: sha(many), container_kind: "archive", index: 102, by: "m1", cls: "member", member: true });
  assert.deepEqual([waiting.ok, waiting.outcome], [true, "filed"]);
  assert.equal(waiting.document.container.index, 102);
  const left = (await w.acq.archiveList({ archiveSha: sha(many), viewer: "member:m1", state: "waiting" })).entries.map((e) => e.index);
  assert.deepEqual(left, [100, 101, 103, 104], "only that entry was cut");
  /* a refused entry */
  const rz = await run(w, { [U("z.zip")]: () => new Response(z, { headers: { "content-type": "application/zip" } }) }, { locator: U("z.zip") });
  assert.equal(rz.body.unpack.not_filed.length, 1);
  const exe = await fileMember(w.store, { container: sha(z), container_kind: "archive", index: 1 });
  assert.deepEqual([exe.outcome, exe.code], ["not_filed", "FILE_TYPE_REFUSED"]);
  /* no such archive */
  assert.equal((await fileMember(w.store, { container: "b".repeat(64), container_kind: "archive", index: 0, by: "m1", cls: "member", member: true })).reason, "ARCHIVE_NOT_HELD");
  void unpack;
});

test("R136: a member that is itself a container registers its own rows when it is filed: an attached message its attachments, an attached ZIP its unpack; the chain stops at the nesting bound", async () => {
  const w = world(); const j = stubbed(w);
  const inner = message([{ name: "deep.pdf", type: "application/pdf", data: PDF }], { id: "inner@x", subject: "inner" });
  const z = makeZip([{ name: "a.txt", data: "alpha" }]);
  const outer = message([{ name: "inner.eml", type: "message/rfc822", data: inner }, { name: "pack.zip", type: "application/zip", data: z }], { id: "outer@x" });
  const so = await held(w, outer, "o.eml", "message/rfc822");
  const m0 = await fileMember(w.store, { container: so, container_kind: "message", index: 0, by: "m1", cls: "member", member: true, project: "p1" });
  assert.equal(m0.outcome, "filed");
  assert.deepEqual(rowsOf(j, "member").map((x) => x.session), [`${sha(inner)}!0`], "the inner message's attachment is a member of it");
  assert.deepEqual(rowsOf(j, "member")[0].detail, { container: sha(inner), container_kind: "message", index: 0, name_stated: "deep.pdf", type_stated: "application/pdf", project: "p1", within: 1 });
  const m1 = await fileMember(w.store, { container: so, container_kind: "message", index: 1, by: "m1", cls: "member", member: true });
  assert.equal(m1.outcome, "filed");
  assert.deepEqual(rowsOf(j, "unpack").map((x) => x.sha), [sha(z)]);
  /* the depth is counted through the whole chain: past the bound, no rows */
  const deep = await fileMember(w.store, { container: so, container_kind: "message", index: 0, by: "m1", cls: "member", member: true, within: 5 });
  assert.equal(deep.outcome, "already_held");
  const w2 = world(); const j2 = stubbed(w2);
  const so2 = await held(w2, outer, "o.eml", "message/rfc822");
  const far = await fileMember(w2.store, { container: so2, container_kind: "message", index: 0, by: "m1", cls: "member", member: true, within: 5 });
  assert.equal(far.outcome, "filed");
  assert.deepEqual(rowsOf(j2, "member"), [], "beyond MAIL_NEST_MAX no row is registered");
});

test("R136 (N1267, CC6): an attachment over its kind's bound is listed with its size and the bound and not filed; the message and the other attachments are filed", async () => {
  const w = world();
  const big = new Uint8Array(50 * 1024 * 1024 + 1);
  big.set(PNG, 0);
  const m = message([{ name: "huge.png", type: "image/png", data: big }, { name: "rows.csv", type: "text/csv", data: CSV }], { id: "big@x" });
  const msha = sha(m);
  await w.core.evidenceStore().put(msha, m);   // the message is held (a message this size is held in parts by the live copy; the range reader below reads either)
  const huge = await fileMember(w.store, { container: msha, container_kind: "message", index: 0 });
  assert.deepEqual([huge.ok, huge.outcome, huge.code, huge.size], [true, "not_filed", "MEMBER_MAX", big.length]);
  assert.equal(huge.limit, 50 * 1024 * 1024);
  assert.equal(w.held(sha(big)), false, "not stored");
  assert.equal(w.prov.receipts.filter((x) => x.via === "email-attachment").length, 0);
  const csv = await fileMember(w.store, { container: msha, container_kind: "message", index: 1 });
  assert.equal(csv.outcome, "filed");
  assert.equal(w.held(msha), true, "the message itself stays filed");
}, { timeout: 120000 });

test("R136: a message the record holds only in parts is read across its parts by the one range reader (R113); the attachment is cut and filed as when it is held whole", async () => {
  const w = world();
  const m = message([{ name: "notice.pdf", type: "application/pdf", data: PDF }, { name: "rows.csv", type: "text/csv", data: CSV }], { id: "parts@x" });
  const cut = Math.floor(m.length / 2);
  const parts = [m.slice(0, cut), m.slice(cut)];
  const ev = w.core.evidenceStore();
  const list = [];
  for (const p of parts) { const s = sha(p); await ev.put(s, p); list.push({ sha256: s, bytes: p.length }); }
  const msha = sha(m);
  assert.equal(w.held(msha), false, "the whole is not held");
  w.store.provenance = heldParts(msha, list);   /* the real provenance, the parts registered through its register path */
  const r = await fileMember(w.store, { container: msha, container_kind: "message", index: 1 });
  assert.deepEqual([r.ok, r.outcome, r.sha256], [true, "filed", sha(CSV)]);
  assert.equal(r.document.container.message_sha256, msha);
  /* a message the record names no parts for is not held */
  w.store.provenance = homeOfEmpty();   /* the real provenance with nothing registered: partsOf answers null */
  assert.equal((await fileMember(w.store, { container: msha, container_kind: "message", index: 0 })).reason, "CONTAINER_NOT_HELD");
});
