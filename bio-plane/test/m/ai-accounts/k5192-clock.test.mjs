/* ai-accounts (fix round 10, STORE-REQUEST #5; K5192, K5132's rule; R39): every instant this module records, and every
   judgement of one, reads the instance clock: a clock handed to the instance, else the store's `env.BIO_NOW_MS` (handed in
   through the ops map, as the store's door hands it), else the wall clock. In a pinned world the recorded instants agree
   with the pinned day; unpinned, the wall clock is read as before. Driven at the interface: the ops map with the store's
   environment, and the instance with a clock handed in. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, SIGNIN_TOKEN } from "./fixture.mjs";
import { aiAccountsOps } from "../../../src/ai-accounts/index.mjs";

const PINNED = Date.parse("2026-10-20T10:15:30.000Z");
const PINNED_SECOND = "2026-10-20T10:15:30Z";
const SENTINEL = "sk-ant-SENTINEL-7f3a9c";
const url = (query = "by=ann") => new URL(`http://x/?${query}`);

test("R39 an API key set in a pinned world records the pinned instant as its set_at and its change's at, not the wall clock", async () => {
  const w = await world().group("ann");
  const answer = await aiAccountsOps(w.a, url(), { kind: "apikey", secret: SENTINEL }, { BIO_NOW_MS: PINNED }).accountreferenceset();
  assert.equal(answer.ok, true);
  assert.equal(answer.set_at, PINNED_SECOND);
  assert.equal(w.row("SELECT set_at FROM account_references WHERE member_id = 'ann'").set_at, PINNED_SECOND);
  assert.equal(w.row("SELECT at FROM account_changes ORDER BY seq DESC LIMIT 1").at, PINNED_SECOND);
});

test("R39 control: an API key set in a world with no pinned clock records the wall clock, between the calls either side", async () => {
  const w = await world().group("ann");
  const before = Date.now();
  const answer = await aiAccountsOps(w.a, url(), { kind: "apikey", secret: SENTINEL }, {}).accountreferenceset();
  const after = Date.now();
  assert.equal(answer.ok, true);
  const at = Date.parse(answer.set_at);
  assert.ok(at >= Math.floor(before / 1000) * 1000 && at <= after, `wall clock, got ${answer.set_at}`);
});

test("R39 an instance handed a pinned clock records that instant with no environment at the door", async () => {
  const w = await world({ now: () => PINNED }).group("ann");
  const answer = await w.a.accountReferenceSet({ member: "ann", kind: "apikey", secret: SENTINEL, by: "ann" });
  assert.equal(answer.ok, true);
  assert.equal(answer.set_at, PINNED_SECOND);
  assert.equal(w.row("SELECT set_at FROM account_references WHERE member_id = 'ann'").set_at, PINNED_SECOND);
});

test("R39 a sign-in held in a pinned world judges its validity from the pinned instant: the stated day count runs from that clock", async () => {
  const w = await world().group("ann");
  aiAccountsOps(w.a, url(), null, { BIO_NOW_MS: PINNED });
  const held = await w.a.subscriptionTokenHold({ member: "ann", token: SIGNIN_TOKEN("ann"), validFor: "1 day" });
  assert.equal(held.ok, true);
  assert.equal(held.since, PINNED_SECOND);
  const row = w.row("SELECT since, valid_until FROM subscription_connections WHERE member_id = 'ann'");
  assert.equal(row.since, PINNED_SECOND);
  assert.equal(row.valid_until, "2026-10-21T10:15:30Z");
});
