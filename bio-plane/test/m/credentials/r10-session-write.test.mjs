/* Fix round 10, cause 24 (a) (K5057), at the interface: R65's grain. A session read that is not marked background used to
   end in a write on every request (a write hop costs a floor and a tail on a quiet copy); `last_active` is now kept at a
   grain of 60 seconds. Every limit is still judged from the stored value. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD } from "./fixture.mjs";
import { SESSION_LIMITS } from "../../../src/credentials/index.mjs";

const at = async (ms, fn) => { const real = Date.now; Date.now = () => ms; try { return await fn(); } finally { Date.now = real; } };
const S = 1000;
const T0 = Date.parse("2026-10-13T08:00:00Z");
const changes = (w) => w.row(`SELECT total_changes() AS n`).n;

async function signedIn(device = "shared") {
  const w = await world().group("ann");
  const s = await at(T0, () => w.c.login({ handle: "ann", password: PASSWORD("ann"), device }));
  assert.equal(s.ok, true);
  return { w, token: s.token };
}

test("R65 fifty reads of a session whose last_active is a second old change at most one row; a background read changes none; a read past the grain changes one; a session idle past 15 minutes still ends", async () => {
  const { w, token } = await signedIn("shared");
  const before = changes(w);
  for (let i = 0; i < 50; i++) assert.notEqual(await at(T0 + S, () => w.c.session(token)), null);
  assert.ok(changes(w) - before <= 1, `rows changed by fifty reads: ${changes(w) - before}`);

  /* control: a background read writes nothing, wherever the stored value stands */
  const b = changes(w);
  for (let i = 0; i < 10; i++) await at(T0 + 10 * 60 * S, () => w.c.session(token, { background: true }));
  assert.equal(changes(w) - b, 0, "background changes none");

  /* control: older than the grain, a foreground read writes it once, to now */
  const stored = w.row(`SELECT last_active AS a FROM sessions`).a;
  const g = changes(w);
  await at(stored + 61 * S, () => w.c.session(token));
  assert.equal(changes(w) - g, 1, "past the grain: one row");
  assert.equal(w.row(`SELECT last_active AS a FROM sessions`).a, stored + 61 * S);

  /* control: an idle ending is judged from the stored value, within one grain of the true last request */
  const last = w.row(`SELECT last_active AS a FROM sessions`).a;
  assert.equal(await at(last + SESSION_LIMITS.sharedIdle + S, () => w.c.session(token)), null, "idle beyond sharedIdle ends");
});
