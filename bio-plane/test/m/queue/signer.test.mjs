/* N375 at queue's interface, over a stubbed `queue-producers.feedItems` (its R8, R14): the self-registered key's
   OBLIGATION passes the mint (R1, R11), names the door it leaves by (R12), and is never muted (R19, R26, R31). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const signer = (key) => ({ id: `OBLIGATION::signer-self-registered::${key}`, class: "OBLIGATION", kind: "signer-self-registered",
  subject: { kind: "signer", id: key }, summary: "a key", detail: null, basis: { source: "membership", detail: "d" },
  age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: null, assignee_role: null, options: [] });

function withSigner() {
  const w = world({ producers: { feedItems: (a) => ({ items: [{ ...signer("K1"), case: a.homesOf([]) }],
    facts: { objective_gap: { bound: 50, truncated: false }, unattributed: { count: 0, inquiries: [] },
             contradiction: { bound: 50, truncated: false }, dispositions: [] } }) } });
  w.member("alice"); w.bundle("INQ-1", "inquiry");
  return w;
}

test("R1, R11, R12: a signer-self-registered OBLIGATION passes the mint and names op=signerset as its door, never taskresolve", () => {
  const w = withSigner();
  const f = w.feed(null, "class:admin");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const d = byId(f)["OBLIGATION::signer-self-registered::K1"].disposition;
  assert.deepEqual([d.available, d.reason, d.instead], [false, "an_obligation_is_resolved_not_disposed", "signerset"]);
  assert.match(d.detail, /op=signerset/);
  assert.equal(f.counts.obligation, 1);
});

test("R19, R26, R31: a signer-self-registered obligation is refused KIND_NOT_PERSONAL by kind and by id, and no row suppresses it", () => {
  const w = withSigner();
  for (const r of [w.q.queueMute({ member: "alice", viewer: "member:alice", case: "INQ-1", kinds: ["signer-self-registered"] }),
                   w.q.queueMute({ member: "alice", viewer: "member:alice", item: "OBLIGATION::signer-self-registered::K1" })])
    assert.deepEqual([r.reason, r.kind_class, r.check], ["KIND_NOT_PERSONAL", "OBLIGATION", "C-33.27"]);
  w.run(`INSERT INTO queue_item_mutes VALUES ('alice','OBLIGATION::signer-self-registered::K1','OBLIGATION',?)`, iso(NOW));
  const f = w.feed("alice");
  assert.deepEqual(f.items.map((i) => i.id), ["OBLIGATION::signer-self-registered::K1"]);
  assert.equal(f.mute.suppressed.length, 0);
});
