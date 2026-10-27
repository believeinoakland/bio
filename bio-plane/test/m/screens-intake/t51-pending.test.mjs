/* screens-intake T51 fix round 4b (SCREENS-INTAKE #16; K4487): R57, a capture or upload answered `reading_pending` says the reading is on its way. Every test
 * enters by pressing the act, never by calling a `done` function. A sentence is asserted by its key (R26). The stand-in is the nearest held row
 * (`screen.document.text.unread.next`, K4269); the row owed is named in the job record.
 *
 * Fix round 10 (K5054): over the REAL store. The address is answered by the world's network (an environment double), the capture, the promotion, the upload,
 * the project and the reading are the owners' own. The ONE thing the world cannot make is the deferral itself: the control plane's door answers
 * `reading_pending: true` when a reading will not fit the request or its store gives no answer (control-plane R120, extraction R87), and the world's
 * door does not follow a capture or a promotion with a reading (store-request R17). `deferred` is that fault: the real act is made and its real answer
 * is passed on with the door's one added flag; nothing else of it is written here. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, main, fill, press, ok, says, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const ADDRESS = "https://www.nps.gov/yose/index.htm";
const PAGE = "<html><head><title>Yosemite</title></head><body><p>Yosemite National Park, as first captured.</p></body></html>";
const PENDING = "screen.document.text.unread.next";
const CAN = ["contribute", "create_projects"];
const marks = (p) => main(p).querySelectorAll('[data-reading="pending"]').length;

async function team() {
  const t = await members({ mai: CAN });
  t.world.script(ADDRESS, async () => new Response(PAGE, { status: 200, headers: { "content-type": "text/html" } }));
  return t;
}
/* the real act, its real answer, and the door's `reading_pending` (the deferral a world's door cannot make by itself): the reading the deferral did not make
   is left out of the answer, as the door's own deferred answer leaves it (extraction R87: the answer, `reading_pending: true`, no reading) */
const unread = ({ reading: _r, text_units: _u, text_units_over_bound: _o, text_units_skipped: _k, ...rest } = {}) => rest;
const owed = (r, flag) => ({ ...unread(r), ...(r.document ? { document: unread(r.document) } : {}), ...(flag ? { reading_pending: true } : {}) });
const deferred = (t, flag = true) => async (req) => {
  const a = await t.world.door(req, t.mai);
  /* the answer as its op gives it: some ops envelope it in `result`, `acquire` answers it whole */
  const j = a.json;
  return { ...a, json: j && j.result && typeof j.result === "object" ? { ...j, result: owed(j.result, flag) } : owed(j, flag) };
};
const at = (t, path, plane = {}) => openWorld(path, { world: t.world, as: t.mai, plane, screens: [...SCREENS, DOCUMENT_STUB] });
const pressCapture = async (p, address = ADDRESS) => { fill(p, { "ci-address": address }); await press(p, "acquire"); };

test("R57 pressing Capture on an address whose answer says reading_pending draws that the reading is on its way, beside the result", async () => {
  const t = await team();
  const p = await at(t, "/app/capture/address", { acquire: deferred(t) });
  await pressCapture(p);
  assert.equal(p.byOp("acquire").length, 1);
  assert.ok(says(p, PENDING), "the pending reading is said");
  assert.equal(marks(p), 1, "once");
});

test("R57 a promotion answered reading_pending (the door reads after promote, control-plane R123) says it too", async () => {
  const t = await team();
  /* the capture came with no reading (the door's own read gave none), and the promotion says the reading follows */
  const p = await at(t, "/app/capture/address", { acquire: deferred(t, false), promote: deferred(t) });
  await pressCapture(p);
  assert.equal(p.byOp("promote").length, 1);
  assert.ok(says(p, PENDING));
  assert.equal(marks(p), 1);
});

test("R57 an acquire of bytes the store already held, answered reading_pending, says it", async () => {
  const t = await team();
  /* the bytes are held by an earlier capture of another address that gave the same page, so this address is not held and its acquire finds the bytes held */
  const other = "https://records.example.org/yose-copy.htm";
  t.world.script(other, async () => new Response(PAGE, { status: 200, headers: { "content-type": "text/html" } }));
  const first = await at(t, "/app/capture/address");
  await pressCapture(first, other);
  const p = await at(t, "/app/capture/address", { acquire: deferred(t) });
  await pressCapture(p);
  assert.equal(p.byOp("acquire").length, 1);
  assert.equal((await t.mai.act("acquire", { body: { locator: ADDRESS } })).existed, true, "the store held these bytes already");
  assert.ok(says(p, PENDING));
  assert.equal(marks(p), 1);
});

const upload = (bytes = "pdf bytes", name = "packet.pdf", type = "application/pdf") => ({ "ci-file": new File([bytes], name, { type }), "ci-how-made": true, "ci-where": "City hall", "ci-what": "The packet." });

test("R57 an upload answered reading_pending says the reading is on its way, once, filed under no project and under a project", async () => {
  const t = await team();
  const project = await t.world.recipes.project(t.mai, "The Coliseum lease");
  for (const path of ["/app/capture/file", `/app/capture/file/${project}`]) {
    const p = await at(t, path, { captureupload: deferred(t) });
    fill(p, upload(`pdf bytes for ${path}`));
    await press(p, "captureupload");
    assert.equal(p.byOp("captureupload").length, 1, path);
    assert.ok(says(p, PENDING), path);
    assert.equal(marks(p), 1, `${path}: once, not beside the unread line too`);
  }
});

test("R57 a promotion of an upload answered reading_pending says it", async () => {
  const t = await team();
  const p = await at(t, "/app/capture/file", { promote: deferred(t) });
  fill(p, upload());
  await press(p, "captureupload");
  assert.equal(p.byOp("promote").length, 1);
  assert.ok(says(p, PENDING));
  assert.equal(marks(p), 1);
});

test("R57 control: an address capture, an upload and a promotion answered without reading_pending draw no pending line", async () => {
  const t = await team();
  const a = await at(t, "/app/capture/address");
  await pressCapture(a);
  assert.equal(marks(a), 0);
  const u = await at(t, "/app/capture/file");
  fill(u, upload("a note, no pending reading", "note.txt", "text/plain"));
  await press(u, "captureupload");
  assert.equal(u.byOp("promote").length, 1, "the upload was filed");
  assert.equal(marks(u), 0);
  /* and bytes the record already holds and has read: nothing is owed there either */
  const held = await t.world.recipes.hold(t.mai, "A note", "A note the record holds and has read.", "", { read: true });
  const again = await at(t, "/app/capture/file");
  fill(again, upload("A note the record holds and has read.", "note.txt", "text/plain"));
  await press(again, "captureupload");
  assert.equal(again.byOp("captureupload").length, 1);
  assert.equal(marks(again), 0);
  assert.ok(held.sha);
});

test("R57 control: reading_pending false or absent draws none, and a project-less upload with no reading keeps R2's unread line", async () => {
  const t = await team();
  const p = await at(t, "/app/capture/file");
  fill(p, upload());
  await press(p, "captureupload");
  assert.equal(marks(p), 0, "not pending: no pending mark");
  assert.ok(says(p, "screen.document.text.unread"), "R2's own line for an unread upload stands");
});
