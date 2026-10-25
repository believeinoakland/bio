/* screens-intake fix round 9 (SCREENS-INTAKE #23), G127a and G127c, R21 (K4833; section 2c item 4): the promote register is WHOLES. A multipart upload is one row, the
 * capture's own digest with its total bytes, carrying `parts` in order; a part's digest is never a row of its own. Entered by pressing the act over the real served
 * page (the register the page sends), and by `promoteDocument` over the REAL provenance (the merged provider, job 21: provenance's own fixture), so two documents
 * that share a part are both held and only a whole answers `CAPTURE_HELD_BY_ANOTHER_BUNDLE`.
 * The page tests are over the REAL store (fix round 10, K5054): the file is sent in parts by the page's own acts and the owner (`captureupload`'s) answers the parts
 * it holds; what the register must hold is computed from the bytes the test made (their digests), never copied from an answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { openWorld, members, fill, press, ok, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { world, sha, provDoc } from "../provenance/fixture.mjs";

const MIB = 1024 * 1024;
const FILE = new File(["x"], "packet.pdf", { type: "application/pdf" });
const filled = { "ci-file": FILE, "ci-how-made": true, "ci-where": "City hall", "ci-what": "The packet." };
const open = async (plane = {}) => { const t = await members({ mai: ["contribute"] }); return openWorld("/app/capture/file", { world: t.world, as: t.mai, plane, screens: [...SCREENS, DOCUMENT_STUB] }); };
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

/* a multipart upload's door document, as `captureupload` answers it: the whole's digest, its parts in order */
function multipart(label, { n = 5, shared = {}, size = 8 * MIB } = {}) {
  const parts = Array.from({ length: n }, (_, i) => ({ file: `snapshots/${label}.part${String(i).padStart(3, "0")}`, sha256: shared[i] ?? sha(`${label}:part${i}`), bytes: i === n - 1 ? 4 * MIB + 17 : size }));
  const whole = sha(`${label}:whole`), total = parts.reduce((a, p) => a + p.bytes, 0), path = `snapshots/${label}`;
  const doc = provDoc({ path, text: "x" }, { capture: { method: "acquire", grade: "B", actor_class: "session", sha256: whole, encoding: "binary", bytes: total }, parts });
  return { label, whole, parts, total, path, doc };
}
const answer = (m) => ok({ ok: true, existed: false, capture: { sha256: m.whole, bytes: m.total }, document: m.doc });

test("R21 (G127a, G127c) a five-part upload registers ONE row, the whole with its five parts in order, and no part as a row of its own", { timeout: 300000 }, async () => {
  /* 36 MiB and 17 bytes: the owner takes it in parts of 8 MiB, the last the remainder (five) */
  const size = 4 * 8 * MIB + 17;
  const content = new Uint8Array(size);
  for (let i = 0; i < size; i += 13) content[i] = (i * 7 + 3) & 255;
  content.set(new TextEncoder().encode("%PDF-1.4 "));
  const p = await open();
  fill(p, { ...filled, "ci-file": new File([content], "packet.pdf", { type: "application/pdf" }) });
  await press(p, "captureupload");
  await p.settle(50);
  const reg = p.byOp("promote")[0].body.register;
  assert.equal(reg.length, 1, "red before: the whole and then each of the five parts, six rows");
  assert.equal(reg[0].sha256, digest(content), "the whole's own digest");
  assert.equal(reg[0].bytes, size, "with its total bytes");
  assert.equal(typeof reg[0].path, "string");
  assert.equal(reg[0].parts.length, 5, "five parts");
  let at = 0;
  for (const x of reg[0].parts) {
    assert.equal(x.sha256, digest(content.subarray(at, at + x.bytes)), "each part is the next bytes of the file, in order");
    at += x.bytes;
  }
  assert.equal(at, size, "and the parts make the whole");
  for (const x of reg[0].parts) assert.ok(!reg.some((r) => r.sha256 === x.sha256), "a part's digest is no register row");
  /* the bundle still names each part as a file, so the original is held by its parts */
  const files = p.byOp("promote")[0].body.files;
  for (const x of reg[0].parts) assert.ok(files.some((f) => f.path === x.path && f.blobSha === x.sha256), "the part is a file of the bundle");
});

test("R21 control: a single-part upload registers its one file as one row with no parts; a document whose only part is the whole is the same", async () => {
  const small = new TextEncoder().encode("%PDF-1.4 a small packet\n");
  const p = await open();
  fill(p, { ...filled, "ci-file": new File([small], "packet.pdf", { type: "application/pdf" }) });
  await press(p, "captureupload");
  const reg = p.byOp("promote")[0].body.register;
  assert.equal(reg.length, 1);
  assert.equal(reg[0].sha256, digest(small));
  assert.equal(reg[0].bytes, small.length);
  assert.ok(!("parts" in reg[0]), "one part: no parts stated");
  /* the owner's single upload states no `parts`; a document whose only part is the whole is a shape the world's owner never answers, so the part is laid on the owner's own answer for the file */
  const t = await members({ mai: ["contribute"] });
  const lone = new TextEncoder().encode("%PDF-1.4 another small packet\n");
  const door = t.world.boot(t.mai).door;
  const stored = (await door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: "The packet.", name: "packet.pdf", type: "application/pdf" })}`,
    init: { method: "POST", headers: { "content-type": "application/pdf" }, body: lone } })).json.result;
  const own = stored.document;
  const q = await openWorld("/app/capture/file", { world: t.world, as: t.mai, screens: [...SCREENS, DOCUMENT_STUB],
    plane: { captureupload: ok({ ...stored, document: { ...own, parts: [{ file: own.file, sha256: stored.capture.sha256, bytes: stored.capture.bytes }] } }) } });
  fill(q, { ...filled, "ci-file": new File([lone], "packet.pdf", { type: "application/pdf" }) });
  await press(q, "captureupload");
  assert.ok(!("parts" in q.byOp("promote")[0].body.register[0]), "the part is the whole: it states no parts");
});

/* the screen's calling kit over the real provenance: `allocid` mints, `promote` is the record's own promotion */
function kitOver(w) {
  let n = 0;
  return { now: () => Date.parse("2026-10-24T01:00:00.000Z"), digest: async (t) => sha(t), calls: [],
    async call(op, { body } = {}) {
      if (op === "allocid") return { ok: true, id: `INFO-2026-${String(++n).padStart(4, "0")}` };
      if (op === "promote") return w.promotion.promote({ ...body, author: "member:alice" });
      throw new Error(`unexpected op ${op}`);
    } };
}
const partsRows = (w, bundle) => w.rows(`SELECT part_sha, bytes, path FROM register_parts WHERE bundle_id = ? ORDER BY idx`, bundle).map((r) => ({ ...r }));
const promoteDoc = (w, m, title) => CAPTURE_SCREEN.parts.promoteDocument(kitOver(w), { doc: m.doc, title, locator: `upload:${m.whole}`, project: "" });

test("R21 (G127c) over the real provenance: promoteDocument of a multipart document whose part equals another bundle's part is accepted, and both documents are held", async () => {
  const w = world({ now: "2026-10-24T01:00:00.000Z" });
  const shared = sha("the shared filler part");
  const a = multipart("alpha", { n: 3, shared: { 2: shared } }), b = multipart("beta", { n: 3, shared: { 2: shared } });
  const first = await promoteDoc(w, a, "alpha.pdf");
  assert.equal(first.refused, undefined, JSON.stringify(first).slice(0, 300));
  const second = await promoteDoc(w, b, "beta.pdf");
  assert.equal(second.refused, undefined, "red before: refused CAPTURE_HELD_BY_ANOTHER_BUNDLE for the shared part: " + JSON.stringify(second).slice(0, 300));
  assert.equal(w.count("register"), 2, "two wholes, no part row");
  assert.equal(w.prov.homeOf(a.whole).bundleId, first.bundleId);
  assert.equal(w.prov.homeOf(b.whole).bundleId, second.bundleId);
  assert.deepEqual(partsRows(w, first.bundleId).map((r) => r.part_sha), a.parts.map((x) => x.sha256), "each bundle's parts read under its own bundle: no row moved");
  assert.deepEqual(partsRows(w, second.bundleId).map((r) => r.part_sha), b.parts.map((x) => x.sha256));
});

test("R21 control: the same whole sent twice is refused for the whole only", async () => {
  const w = world({ now: "2026-10-24T01:00:00.000Z" });
  const a = multipart("gamma", { n: 3 });
  const first = await promoteDoc(w, a, "gamma.pdf");
  assert.equal(first.refused, undefined, JSON.stringify(first).slice(0, 300));
  const again = await promoteDoc(w, a, "gamma again.pdf");
  assert.ok(again.refused, "refused");
  assert.equal(again.refused.reason, "CAPTURE_HELD_BY_ANOTHER_BUNDLE");
  assert.equal(again.refused.kind, "whole", "for the whole, never a part");
  assert.equal(again.refused.capture_sha, a.whole);
});
