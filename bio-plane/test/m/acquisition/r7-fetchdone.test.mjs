/* acquisition R105 (T51 fix round 7, B33, the twin of G61): THE DELIVERY OF AN OWED FETCH STILL SEES THAT IT WAS A PARKED FETCH. `owedFetch` saved the made
   capture's session as `{queue: [], opened_by, project, cls, store, fetch_done}` and `saveCaptureSession` replaces the state whole, so the state the
   delivery loads (control-plane's `deliverOwedRender` records the member's `fetch-done` only `if (ld.state.fetch_pending)`) had lost `fetch_pending` and the
   record was never made. The saved state now keeps `fetch_pending` (its `since`, `declared_bytes`, `why`), on the first delivery and on the retry of a refused one.
   Failing first: the session loaded inside `deliver` carried no `fetch_pending`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, network } from "./fixture.mjs";
import { owedFetch } from "../../../src/acquisition/index.mjs";

const MIB = 1024 * 1024;
const BIG = "https://www.oaklandca.gov/files/BIG.pdf";
const bytes = (() => { const b = new Uint8Array(9 * MIB); for (let i = 0; i < b.length; i += 4096) b.fill((i / 4096) % 251, i, Math.min(b.length, i + 4096)); return b; })();
const source = () => new Response(bytes, { headers: { "content-type": "application/pdf", "content-length": String(bytes.length) } });

async function parked() {
  const w = world();
  const entries = [];
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async (e) => { entries.push(e); return { ok: true }; };
  const first = await run(w, { [BIG]: source }, { locator: BIG, project: "PROJ-1" }, { settle: false });
  assert.equal(first.status, 200);
  const fp = first.body.fetch_pending;
  assert.ok(fp && fp.session, "the large capture is parked and owed");
  return { w, session: fp.session, fp };
}
const alarm = async (w, session, refuse) => {
  const seen = [];
  const net = network({ [BIG]: source });
  try {
    // fixtures-contract: control-plane deliver-owed
    const out = await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async (d) => {
      const ld = w.store.loadCaptureSession({ session: d.session });
      seen.push({ found: ld.found, fetch_pending: ld.state && ld.state.fetch_pending, fetch_done: !!(ld.state && ld.state.fetch_done), opened_by: ld.state && ld.state.opened_by, project: ld.state && ld.state.project });
      return refuse ? { ok: false } : { ok: true };
    } });
    return { out, seen };
  } finally { net.restore(); }
};

test("R105 (B33): the session the delivery loads still states `fetch_pending` (as it was parked) beside the made document, so the member's fetch-done is recorded", async () => {
  const { w, session, fp } = await parked();
  const { out, seen } = await alarm(w, session, false);
  assert.deepEqual([out.ok, out.done], [true, true]);
  assert.equal(seen.length, 1);
  assert.deepEqual(seen[0].fetch_pending, { since: fp.since, declared_bytes: fp.declared_bytes, why: fp.why });
  assert.deepEqual([seen[0].fetch_done, seen[0].opened_by, seen[0].project], [true, "m1", "PROJ-1"]);
});

test("R105 (B33): a delivery refused and tried again sees `fetch_pending` each time, and the body is fetched once", async () => {
  const { w, session, fp } = await parked();
  const a = await alarm(w, session, true);
  assert.deepEqual([a.out.done, a.out.reason], [false, "DELIVERY_REFUSED"]);
  assert.deepEqual(a.seen[0].fetch_pending, { since: fp.since, declared_bytes: fp.declared_bytes, why: fp.why });
  const b = await alarm(w, session, false);
  assert.deepEqual([b.out.ok, b.out.done], [true, true]);
  assert.deepEqual(b.seen[0].fetch_pending, { since: fp.since, declared_bytes: fp.declared_bytes, why: fp.why });
  assert.equal(w.store.state.sessions.has(session), false, "dropped once delivered");
});
