/* acquisition R110 (T51 fix round 8, G103, G104; K4817; amends R46): OPEN CAPTURES ARE MATCHED BY THE MEMBER, UNTIL DELIVERED.
   G103: `opencaptures` was asked as the door stamps every declared `by`, the viewer's form `member:<id>`, while the session stores the bare id the
   `acquire` was made for (`opened_by: "<id>"`), so `openCaptures` compared two spellings of one member and listed nothing for any ordinary member
   (the founder's `admin` is one spelling in both). G104: once the alarm had made the capture, the session was saved with `queue: []` and
   `fetch_done` and listed for no one until the delivery dropped it. Failing first: `captures: []` at the member's form, and for the made state.
   The parked session below is made by the member's own `acquire` (the real entry path), never written by hand, and listed as the door asks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, network } from "./fixture.mjs";
import { acquire, openCaptures, owedFetch } from "../../../src/acquisition/index.mjs";

const MIB = 1024 * 1024;
const BIG = "https://www.oaklandca.gov/files/BIG.pdf";
const bytes = (() => { const b = new Uint8Array(9 * MIB); for (let i = 0; i < b.length; i += 4096) b.fill((i / 4096) % 251, i, Math.min(b.length, i + 4096)); return b; })();
const source = () => new Response(bytes, { headers: { "content-type": "application/pdf", "content-length": String(bytes.length) } });
const SESSION_OF = (w) => [...w.store.state.sessions.values()].find((s) => s.state && s.state.fetch_pending);

/* a member's large press, parked by the real `acquire` under the member's id exactly as the plane stamps it */
async function parked(sessMember = "m1", cls = "member") {
  const w = world();
  // fixtures-contract: plane owed-ledger
  w.store.owedLater = async () => ({ ok: true });
  const first = await run(w, { [BIG]: source }, { locator: BIG, project: "PROJ-1" }, { settle: false, sessMember, cls });
  assert.equal(first.status, 200);
  assert.ok(first.body.fetch_pending && first.body.fetch_pending.session, "the large capture is parked and owed");
  return { w, session: first.body.fetch_pending.session };
}

test("R110 (G103): a capture the member's own press parked is listed for her in the door's form `member:<id>` and in her bare id, and for no other member", async () => {
  const { w, session } = await parked("m1");
  assert.equal(SESSION_OF(w).state.opened_by, "m1", "the session stores the bare id (the fixture, as the plane's stamp)");
  for (const by of ["member:m1", "m1"]) {
    const r = openCaptures(w.store, { by });
    assert.equal(r.ok, true);
    assert.equal(r.captures.length, 1, `listed for ${by}`);
    assert.equal(r.captures[0].session, session);
    assert.equal(r.captures[0].outstanding, 1);
    assert.equal(r.captures[0].primary_sha, null);
    assert.equal(r.captures[0].fetch_pending.why, "LARGE_DECLARED");
  }
  assert.deepEqual(openCaptures(w.store, { by: "member:m2" }).captures, [], "another member's form lists nothing");
  assert.deepEqual(openCaptures(w.store, { by: "m2" }).captures, [], "another member's bare id lists nothing");
  assert.deepEqual(openCaptures(w.store, { by: "member:m" }).captures, [], "a prefix of her id is not her");
  assert.deepEqual(openCaptures(w.store, { by: "member:m10" }).captures, [], "an id that begins with hers is not her");
});

test("R110 (G103): the founder's session is listed for `admin` as before (and `member:admin`, the same member); control: a machine identity, a blank and a non-string list nothing", async () => {
  const { w, session } = await parked("admin");
  assert.equal(SESSION_OF(w).state.opened_by, "admin");
  assert.equal(openCaptures(w.store, { by: "admin" }).captures[0].session, session);
  assert.equal(openCaptures(w.store, { by: "member:admin" }).captures[0].session, session);
  for (const by of ["class:admin", "", "  ", null, undefined, 7, "daemon"])
    assert.deepEqual(openCaptures(w.store, { by }).captures, [], `nothing for ${JSON.stringify(by)}`);
});

test("R110 (G103): a session a hand-written state stores in the viewer's form is listed for the same member under either spelling (the match reads the member, not the spelling)", async () => {
  const w = world();
  w.store.saveCaptureSession({ session: "cs_a", locator: BIG, primarySha: "a".repeat(64), primaryFile: "snapshots/x", base: BIG,
    state: { queue: [{ n: 1 }], opened_by: "member:m1" } });
  assert.equal(openCaptures(w.store, { by: "m1" }).captures.length, 1);
  assert.equal(openCaptures(w.store, { by: "member:m1" }).captures.length, 1);
  assert.equal(openCaptures(w.store, { by: "member:m2" }).captures.length, 0);
});

test("R110 (G104): the state between made and delivered is listed: queue empty, `fetch_done` present, it is `fetch_pending` with `delivering: true` until the delivery drops it", async () => {
  const { w, session } = await parked("m1");
  const before = openCaptures(w.store, { by: "member:m1" }).captures[0];
  assert.equal(before.fetch_pending.delivering, undefined, "not yet made: not marked delivering");
  const net = network({ [BIG]: source });
  const seen = [];
  try {
    /* the delivery is held (refused) as a slow one is: the session is in the made state while it is, and listed */
    // fixtures-contract: control-plane deliver-owed
    const out = await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async (d) => {
      seen.push(openCaptures(w.store, { by: "member:m1" }).captures);   // as the screen's watch asks, in the middle of the delivery
      return { ok: false, reason: "DELIVERY_FAILED" };
    } });
    assert.deepEqual([out.ok, out.done], [true, false]);
  } finally { net.restore(); }
  assert.equal(seen.length, 1);
  assert.equal(seen[0].length, 1, "listed while the delivery is under way");
  assert.equal(seen[0][0].session, session);
  assert.equal(seen[0][0].fetch_pending.delivering, true);
  assert.equal(seen[0][0].outstanding, 1);
  assert.equal(seen[0][0].primary_sha, null);
  const between = openCaptures(w.store, { by: "m1" }).captures;
  assert.equal(between.length, 1, "and after a delivery that was refused, until it is delivered");
  assert.equal(between[0].fetch_pending.delivering, true);
  /* delivered: dropped, listed no more */
  const net2 = network({ [BIG]: source });
  // fixtures-contract: control-plane deliver-owed
  try { const out = await owedFetch(w.store, { kind: "fetch", session }, { storeName: "bio", deliver: async () => ({ ok: true }) }); assert.deepEqual([out.ok, out.done], [true, true]); }
  finally { net2.restore(); }
  assert.deepEqual(openCaptures(w.store, { by: "member:m1" }).captures, [], "dropped on delivery");
});

test("R110 (G104) controls: a session with an empty queue and no `fetch_done` (a finished visitor copy), and an expired made one, are listed for no one", async () => {
  const w = world();
  w.store.saveCaptureSession({ session: "cs_done", locator: BIG, primarySha: "a".repeat(64), primaryFile: "snapshots/x", base: BIG,
    state: { queue: [], opened_by: "m1", render_done: { sha256: "b".repeat(64), since: "2026-10-23T00:00:00Z" } } });
  assert.deepEqual(openCaptures(w.store, { by: "member:m1" }).captures, []);
  w.store.saveCaptureSession({ session: "cs_made", locator: BIG, primarySha: "c".repeat(64), primaryFile: "snapshots/y", base: BIG,
    state: { queue: [], opened_by: "m1", fetch_pending: { since: "2026-10-23T00:00:00Z", declared_bytes: 9, why: "LARGE_DECLARED" }, fetch_done: { sha256: "c".repeat(64), since: "2026-10-23T00:00:01Z" } },
    ttlMs: 1000 });
  assert.equal(openCaptures(w.store, { by: "member:m1" }).captures.length, 1, "the made state is listed while it lives");
  assert.deepEqual(openCaptures(w.store, { by: "member:m1", now: Date.now() + 60_000 }).captures, [], "past its expiry it is not");
});

test("R110 (G103) over the real entry path: `acquire` parks, and the door's form lists it every time until the document is delivered", async () => {
  const { w, session } = await parked("m7");
  /* nothing is delivered in this test until the alarm runs; the member's form lists the session at each poll */
  for (let poll = 0; poll < 5; poll++) {
    const r = openCaptures(w.store, { by: "member:m7" });
    assert.equal(r.captures.length, 1, `poll ${poll}`);
    assert.equal(r.captures[0].session, session);
  }
  /* a continuation of the parked session answers its state and fetches nothing (R12) */
  const net = network({});
  try {
    const again = await acquire(w.store, { continue: session }, { cls: "member", member: true, sessMember: "m7", storeName: "bio" });
    assert.equal(again.status, 200);
    assert.equal(again.body.fetch_pending.session, session);
    assert.equal(net.seen.length, 0);
  } finally { net.restore(); }
});
