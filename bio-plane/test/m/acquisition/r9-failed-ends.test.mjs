/* acquisition R46 (T51 fix round 9; re-walk 8 A, N1; K4853): A FAILED OWED FETCH IS LISTED FOR ONE DAY, AND A RE-PRESS REPLACES IT. A session whose fetch ended
   with a stated refusal is listed by `openCaptures` for one day after the failure (the injected clock) and not after; a new press of the same address by the
   same member replaces it, its refusal no longer listed. The parked session is the member's own press and the refusal the real alarm run's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, network } from "./fixture.mjs";
import { owedFetch, openCaptures } from "../../../src/acquisition/index.mjs";

const MIB = 1024 * 1024;
const BIG = "https://www.oaklandca.gov/files/BIG.pdf";
const bytes = new Uint8Array(9 * MIB).fill(7);
const source = () => new Response(bytes, { headers: { "content-type": "application/pdf", "content-length": String(bytes.length) } });

async function failed() {
  const w = world();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async () => ({ ok: true });
  const first = await run(w, { [BIG]: source }, { locator: BIG, project: "P" }, { settle: false });
  const session = first.body.fetch_pending.session;
  const net = network({ [BIG]: source });
  // fixtures-contract: control-plane deliver-owed
  try { await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async () => ({ ok: false, reason: "CAPTURE_HELD_BY_ANOTHER_BUNDLE" }) }); } finally { net.restore(); }
  return { w, session };
}
const at = (offsetMs) => new Date(Date.now() + offsetMs).toISOString().replace(/\.\d+Z$/, "Z");

test("R46 (N1): the refused fetch is listed at once, still listed just under a day later, and not listed a day and a minute later (injected clock)", async () => {
  const { w } = await failed();
  assert.equal(openCaptures(w.store, { by: "member:m1" }).captures.length, 1, "listed at once");
  assert.equal(openCaptures(w.store, { by: "member:m1", now: at(23 * 3600e3) }).captures.length, 1);
  assert.equal(openCaptures(w.store, { by: "member:m1", now: at(24 * 3600e3 + 60e3) }).captures.length, 0, "not a day and a minute later");
});

test("R46 (N1): a re-press of the same address by the same member replaces the failed session: its refusal is no longer listed", async () => {
  const { w, session } = await failed();
  assert.equal(w.store.loadCaptureSession({ session }).found, true);
  const again = await run(w, { [BIG]: source }, { locator: BIG, project: "P" }, { settle: false });
  const listed = openCaptures(w.store, { by: "member:m1" }).captures;
  assert.equal(listed.every((c) => !(c.fetch_pending && c.fetch_pending.failed)), true, "no failed session is listed");
  assert.equal(w.store.loadCaptureSession({ session }).found, false, "the old session is replaced");
  assert.ok(again.body.fetch_pending && again.body.fetch_pending.session !== session);
});

test("R46 (N1, control): another member's press of the same address leaves the first member's refusal listed", async () => {
  const { w } = await failed();
  await run(w, { [BIG]: source }, { locator: BIG, project: "P" }, { settle: false, sessMember: "m2" });
  assert.equal(openCaptures(w.store, { by: "member:m1" }).captures.filter((c) => c.fetch_pending && c.fetch_pending.failed).length, 1);
});
