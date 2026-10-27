/* PROTO C (throwaway): the Worker cache's key, version and fill rules. */
import test from "node:test";
import assert from "node:assert/strict";
import * as SC from "../../../src/control-plane/shared-cache.mjs";

const ok = (v, e = v) => new Response('{"ok":true,"x":1}', { status: 200, headers: { "content-type": "application/json", "x-record-version": v, "x-record-version-end": e } });
const env = { PROTO_C: "1", PROTO_C_TTL_MS: "60000" };

test("off with PROTO_C unset; routes outside the list, POSTs and grants are never keyed", () => {
  assert.equal(SC.modeOf({}), 0);
  assert.equal(SC.keyOf(1, "http://do/heldcaptures?limit=5"), null);
  assert.equal(SC.keyOf(1, "http://do/memberlist", { method: "POST", body: "{}" }), null);
  assert.equal(SC.keyOf(1, "http://do/memberlist?viewer=a", { headers: { "x-bio-grant": "g" } }), null);
  assert.equal(SC.keyOf(1, "http://do/queue?viewer=a"), null);
  assert.ok(SC.keyOf(2, "http://do/queue?viewer=a"));
});

test("a team-wide key drops the caller's stamps; a viewer key keeps them", () => {
  assert.equal(SC.keyOf(1, "http://do/profiles?viewer=a&by=a").key, SC.keyOf(1, "http://do/profiles?viewer=b&by=b").key);
  assert.notEqual(SC.keyOf(1, "http://do/memberlist?viewer=a").key, SC.keyOf(1, "http://do/memberlist?viewer=b").key);
  assert.notEqual(SC.keyOf(1, "http://do/bootstrap?fp=1").key, SC.keyOf(1, "http://do/bootstrap?fp=2").key);
});

test("kept only when no write during the call; served only while its version is the newest; a write drops it", async () => {
  const k = SC.keyOf(1, "http://do/memberlist?viewer=a");
  await SC.fill("r", k, ok("t.1", "t.2"));
  SC.noteVersion("r", ok("t.2"));
  assert.equal(SC.lookup("r", env, k), null, "a write during the call: not kept");
  await SC.fill("r", k, ok("t.2"));
  assert.ok(SC.lookup("r", env, k), "same version: served");
  SC.noteVersion("r", ok("t.3"));
  assert.equal(SC.lookup("r", env, k), null, "a later write: gone");
  SC.noteVersion("r", ok("t.1"));
  await SC.fill("r", k, ok("t.3"));
  assert.ok(SC.lookup("r", env, k), "an older stamp arriving late does not move the newest back");
  SC.noteVersion("r", ok("u.0"));
  assert.equal(SC.lookup("r", env, k), null, "a restarted object (new instance tag): gone");
});

test("a refusal and a stale entry are not served; the probe states counts only", async () => {
  const k = SC.keyOf(1, "http://do/grouplanguages");
  await SC.fill("s", k, new Response('{"ok":false}', { status: 200, headers: { "content-type": "application/json", "x-record-version": "a.1", "x-record-version-end": "a.1" } }));
  SC.noteVersion("s", ok("a.1"));
  assert.equal(SC.lookup("s", env, k), null);
  await SC.fill("s", k, ok("a.1"));
  assert.equal(SC.lookup("s", { PROTO_C_TTL_MS: "0" }, k), null, "past the TTL");
  assert.deepEqual(Object.keys(SC.probe(env)).includes("ops"), true);
});

test("held paged: only a picker page of more than 20 with no cursor is cut to 20 with a total", () => {
  assert.match(SC.pagedHeld("http://do/heldcaptures?fields=picker&limit=500"), /limit=20.*total=1|total=1.*limit=20/);
  assert.equal(SC.pagedHeld("http://do/heldcaptures?fields=picker&limit=500&after=x"), "http://do/heldcaptures?fields=picker&limit=500&after=x");
  assert.equal(SC.pagedHeld("http://do/heldcaptures?limit=500"), "http://do/heldcaptures?limit=500");
});
