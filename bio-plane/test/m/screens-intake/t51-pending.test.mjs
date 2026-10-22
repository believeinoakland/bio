/* screens-intake T51 fix round 4b (SCREENS-INTAKE #16; K4487): R57, a capture or upload answered `reading_pending` says the reading is on its way. Every test
 * enters by pressing the act, never by calling a `done` function. A sentence is asserted by its key (R26). The stand-in is the nearest held row
 * (`screen.document.text.unread.next`, K4269); the row owed is named in the job record. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, main, fill, press, ok, says, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const ADDRESS = "https://www.nps.gov/yose/index.htm";
const SHA = "b".repeat(64);
const PENDING = "screen.document.text.unread.next";
const DOC = { capture: { sha256: SHA, bytes: 9000, encoding: "utf-8" }, file: "snapshots/a.htm", title: null };
const PLANE = { projectlist: ok({ projects: [] }), heldat: ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined" } }),
  allocid: ok({ ok: true, id: "INFO-2026-0099" }), promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) };
const open = (path, plane) => openPage(path, { plane: { ...PLANE, ...plane }, screens: [...SCREENS, DOCUMENT_STUB] });
const marks = (p) => main(p).querySelectorAll('[data-reading="pending"]').length;
const pressCapture = async (p) => { fill(p, { "ci-address": ADDRESS }); await press(p, "acquire"); };

test("R57 pressing Capture on an address whose answer says reading_pending draws that the reading is on its way, beside the result", async () => {
  const p = await open("/app/capture/address", { acquire: ok({ ok: true, existed: false, reading_pending: true, document: DOC }) });
  await pressCapture(p);
  assert.equal(p.byOp("acquire").length, 1);
  assert.ok(says(p, PENDING), "the pending reading is said");
  assert.equal(marks(p), 1, "once");
});

test("R57 a promotion answered reading_pending (the door reads after promote, control-plane R123) says it too", async () => {
  const p = await open("/app/capture/address", { acquire: ok({ ok: true, existed: false, document: DOC }), promote: (req) => ok({ ok: true, bundleId: req.body.bundleId, reading_pending: true }) });
  await pressCapture(p);
  assert.equal(p.byOp("promote").length, 1);
  assert.ok(says(p, PENDING));
  assert.equal(marks(p), 1);
});

test("R57 an acquire of bytes the store already held, answered reading_pending, says it", async () => {
  const p = await open("/app/capture/address", { acquire: ok({ ok: true, existed: true, reading_pending: true, document: DOC }) });
  await pressCapture(p);
  assert.ok(says(p, PENDING));
  assert.equal(marks(p), 1);
});

const FILE = new File(["pdf bytes"], "packet.pdf", { type: "application/pdf" });
const filled = { "ci-file": FILE, "ci-how-made": true, "ci-where": "City hall", "ci-what": "The packet." };
const UPLOADED = (more) => ok({ ok: true, existed: false, capture: { sha256: SHA, bytes: 9 },
  document: { file: `snapshots/upload-${SHA}`, locator: `upload:${SHA}`, capture: { method: "uploaded", sha256: SHA, encoding: "binary", bytes: 9 }, provenance_chain: [], source: { kind: "uploader" } }, ...more });

test("R57 an upload answered reading_pending says the reading is on its way, once, filed under no project and under a project", async () => {
  for (const path of ["/app/capture/file", "/app/capture/file/PROJ-2026-0007"]) {
    const p = await open(path, { captureupload: UPLOADED({ reading_pending: true }),
      image: (r) => ok({ "bundle.md": `---\ntitle: "T"\n---\n\n## Summary\n` + (r.query.id ? "" : "") }) });
    fill(p, filled);
    await press(p, "captureupload");
    assert.equal(p.byOp("captureupload").length, 1, path);
    assert.ok(says(p, PENDING), path);
    assert.equal(marks(p), 1, `${path}: once, not beside the unread line too`);
  }
});

test("R57 a promotion of an upload answered reading_pending says it", async () => {
  const p = await open("/app/capture/file", { captureupload: UPLOADED({}), promote: (req) => ok({ ok: true, bundleId: req.body.bundleId, reading_pending: true }) });
  fill(p, filled);
  await press(p, "captureupload");
  assert.ok(says(p, PENDING));
  assert.equal(marks(p), 1);
});

test("R57 control: an address capture, an upload and a promotion answered without reading_pending draw no pending line", async () => {
  const a = await open("/app/capture/address", { acquire: ok({ ok: true, existed: false, document: DOC, reading: { title: "Yosemite" } }) });
  await pressCapture(a);
  assert.equal(marks(a), 0);
  const u = await open("/app/capture/file", { captureupload: UPLOADED({ reading: { words_read: 2, words_total: 2 }, text_units: [{ text: "a" }, { text: "b" }] }) });
  fill(u, filled);
  await press(u, "captureupload");
  assert.equal(marks(u), 0);
  assert.equal(says(u, PENDING), false);
});

test("R57 control: reading_pending false or absent draws none, and a project-less upload with no reading keeps R2's unread line", async () => {
  const p = await open("/app/capture/file", { captureupload: UPLOADED({ reading_pending: false }) });
  fill(p, filled);
  await press(p, "captureupload");
  assert.equal(marks(p), 0, "not pending: no pending mark");
  assert.ok(says(p, "screen.document.text.unread"), "R2's own line for an unread upload stands");
});
