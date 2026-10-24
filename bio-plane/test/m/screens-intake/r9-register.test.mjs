/* screens-intake fix round 9 (SCREENS-INTAKE #23), G127a and G127c, R21 (K4833; section 2c item 4): the promote register is WHOLES. A multipart upload is one row, the
 * capture's own digest with its total bytes, carrying `parts` in order; a part's digest is never a row of its own. Entered by pressing the act over the real served
 * page (the register the page sends), and by `promoteDocument` over the REAL provenance (the merged provider, job 21: provenance's own fixture), so two documents
 * that share a part are both held and only a whole answers `CAPTURE_HELD_BY_ANOTHER_BUNDLE`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, fill, press, ok, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { world, sha, provDoc } from "../provenance/fixture.mjs";

const MIB = 1024 * 1024;
const FILE = new File(["x"], "packet.pdf", { type: "application/pdf" });
const filled = { "ci-file": FILE, "ci-how-made": true, "ci-where": "City hall", "ci-what": "The packet." };
const open = (plane) => openPage("/app/capture/file", { plane: { allocid: ok({ ok: true, id: "INFO-2026-0150" }), promote: (r) => ok({ ok: true, bundleId: r.body.bundleId }), ...plane }, screens: [...SCREENS, DOCUMENT_STUB] });

/* a multipart upload's door document, as `captureupload` answers it: the whole's digest, its parts in order */
function multipart(label, { n = 5, shared = {}, size = 8 * MIB } = {}) {
  const parts = Array.from({ length: n }, (_, i) => ({ file: `snapshots/${label}.part${String(i).padStart(3, "0")}`, sha256: shared[i] ?? sha(`${label}:part${i}`), bytes: i === n - 1 ? 4 * MIB + 17 : size }));
  const whole = sha(`${label}:whole`), total = parts.reduce((a, p) => a + p.bytes, 0), path = `snapshots/${label}`;
  const doc = provDoc({ path, text: "x" }, { capture: { method: "acquire", grade: "B", actor_class: "session", sha256: whole, encoding: "binary", bytes: total }, parts });
  return { label, whole, parts, total, path, doc };
}
const answer = (m) => ok({ ok: true, existed: false, capture: { sha256: m.whole, bytes: m.total }, document: m.doc });

test("R21 (G127a, G127c) a five-part upload registers ONE row, the whole with its five parts in order, and no part as a row of its own", async () => {
  const m = multipart("five");
  const p = await open({ captureupload: answer(m) });
  fill(p, filled);
  await press(p, "captureupload");
  const reg = p.byOp("promote")[0].body.register;
  assert.equal(reg.length, 1, "red before: the whole and then each of the five parts, six rows");
  assert.equal(reg[0].sha256, m.whole);
  assert.equal(reg[0].bytes, m.total, "with its total bytes");
  assert.equal(reg[0].path, m.path);
  assert.deepEqual(reg[0].parts, m.parts.map((x) => ({ sha256: x.sha256, path: x.file, bytes: x.bytes })), "the parts, in order, with their paths and sizes");
  for (const x of m.parts) assert.ok(!reg.some((r) => r.sha256 === x.sha256), "a part's digest is no register row");
  /* the bundle still names each part as a file, so the original is held by its parts */
  const files = p.byOp("promote")[0].body.files;
  for (const x of m.parts) assert.ok(files.some((f) => f.path === x.file && f.blobSha === x.sha256), "the part is a file of the bundle");
});

test("R21 control: a single-part upload registers its one file as one row with no parts; a document whose only part is the whole is the same", async () => {
  const SHA = "c".repeat(64);
  const one = { file: `snapshots/upload-${SHA}`, locator: `upload:${SHA}`, capture: { method: "uploaded", sha256: SHA, encoding: "binary", bytes: 9 }, source: { kind: "uploader" } };
  const p = await open({ captureupload: ok({ ok: true, existed: false, capture: { sha256: SHA, bytes: 9 }, document: one }) });
  fill(p, filled);
  await press(p, "captureupload");
  assert.deepEqual(p.byOp("promote")[0].body.register, [{ sha256: SHA, path: one.file, encoding: "binary", bytes: 9 }]);
  const q = await open({ captureupload: ok({ ok: true, existed: false, capture: { sha256: SHA, bytes: 9 }, document: { ...one, parts: [{ file: one.file, sha256: SHA, bytes: 9 }] } }) });
  fill(q, filled);
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
