/* store-assembly's copy of plane's test. plane R77 -> R64 (fix round 7, G79's plane half; BOB's ruling on CAPTURE #51 J28): a keep that ends before the document is filed owes no reading (`NO_HOME`: the filing's
   promotion owes it through control-plane's `unreadDocuments`); a keep whose document is filed still owes its reading. Through the real keep owner and the
   real `readHeld`; the end-to-end case is control-plane's G7. */
import "../../../src/store-assembly/register.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "./fixture.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { pendingOf } from "../../../src/store-assembly/pending.mjs";

const sha = (b) => createHash("sha256").update(b).digest("hex");
async function world(home) {
  const x = await store({});
  const parts = [sha("part one"), sha("part two")], whole = sha("the whole");
  recordOf(x.ctx).evidenceStore = () => ({ putFromParts: async () => ({ ok: true }) });
  x.read = [];
  extractionOf(x.ctx).readHeld = async (a) => { x.read.push(a.sha); return home ? { ok: true, read: true } : { ok: true, read: false, why: "NO_HOME" }; };
  await pendingOf(x.ctx).keepLater({ sha: whole, parts });
  await pendingOf(x.ctx).consumer().tick(Date.now() + 1000);
  return { x, whole, rows: pendingOf(x.ctx).list() };
}
test("R64 R73 (G79): a keep that ends before the document is filed (no home) ends owing nothing: no keep row, no reading row", async () => {
  const { x, rows, whole } = await world(false);
  assert.deepEqual(x.read, [whole], "the reading was asked once, in the keep's tick");
  assert.deepEqual(rows, []);
});
test("R64 R73 (G79) control: a keep whose document is filed (a home) still reads at once and ends", async () => {
  const { x, rows, whole } = await world(true);
  assert.deepEqual(x.read, [whole]);
  assert.deepEqual(rows, []);
});
test("R64 R73 (G79) control: a transient failure of the reading after a keep still leaves the reading owed", async () => {
  const x = await store({});
  recordOf(x.ctx).evidenceStore = () => ({ putFromParts: async () => ({ ok: true }) });
  extractionOf(x.ctx).readHeld = async () => ({ ok: false, reason: "STORE_DOWN" });
  await pendingOf(x.ctx).keepLater({ sha: sha("w2"), parts: [sha("p")] });
  await pendingOf(x.ctx).consumer().tick(Date.now() + 1000);
  assert.deepEqual(pendingOf(x.ctx).list().map((r) => [r.kind, r.state]), [["reading", "owed"]]);
});
