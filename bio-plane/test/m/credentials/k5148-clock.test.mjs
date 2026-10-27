/* credentials (fix round 10, cause 1; plan item 71 (3); K5148, K5132; R-CLOCK): in a pinned world (`env.BIO_NOW_MS`) every
   instant this module records reads the instance clock, not the wall clock, so the answers and the rows agree with the
   pinned instant; unpinned, the wall clock is read as before. Driven through the ops map, as the store's door drives it,
   with the store's environment passed in. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, FOUNDER_PASSWORD, FOUNDER_HANDLE } from "./fixture.mjs";
import { credentialsOps } from "../../../src/credentials/index.mjs";

const PINNED = Date.parse("2026-10-20T10:15:30.000Z");
const PINNED_ISO = "2026-10-20T10:15:30.000Z";

test("R1 R2 a claim in a pinned world records the pinned instant as consumedAt, and bootstrap reads that instant back", async () => {
  const w = world();
  const url = new URL("http://x/?fp=fp-1&source=s&country=GB");
  const answer = await credentialsOps(w.c, url, { password: FOUNDER_PASSWORD, handle: FOUNDER_HANDLE }, { BIO_NOW_MS: PINNED }).claim();
  assert.equal(answer.ok, true);
  assert.equal(answer.consumedAt, PINNED_ISO);
  assert.equal(w.c.bootstrapState("fp-1").consumedAt, PINNED_ISO);
});

test("R1 R2 control: a claim with no pinned clock records the wall clock, between the calls either side", async () => {
  const w = world();
  const url = new URL("http://x/?fp=fp-1&source=s&country=GB");
  const before = Date.now();
  const answer = await credentialsOps(w.c, url, { password: FOUNDER_PASSWORD, handle: FOUNDER_HANDLE }, {}).claim();
  const after = Date.now();
  assert.equal(answer.ok, true);
  const at = Date.parse(answer.consumedAt);
  assert.ok(at >= Math.floor(before / 1000) * 1000 && at <= after, `wall clock, got ${answer.consumedAt}`);
});

test("R65 a sign-in in a pinned world stamps the session's last_active with the pinned instant", async () => {
  const w = await world().group("ann");
  const url = new URL("http://x/?source=s&country=GB");
  const l = await credentialsOps(w.c, url, { handle: "ann", password: PASSWORD("ann") }, { BIO_NOW_MS: PINNED }).login();
  assert.equal(l.ok, true);
  assert.equal(Number(w.row("SELECT last_active FROM sessions").last_active), PINNED);
});

test("R1 R2 an instance handed a pinned clock records that instant as consumedAt, with no environment at the door", async () => {
  const w = world({ now: () => PINNED });
  const answer = await w.claim();
  assert.equal(answer.ok, true);
  assert.equal(answer.consumedAt, PINNED_ISO);
  assert.equal(w.c.bootstrapState("fp-1").consumedAt, PINNED_ISO);
});

test("R1 R2 control: an instance handed no clock records the wall clock at its claim", async () => {
  const w = world();
  const before = Date.now();
  const answer = await w.claim();
  const after = Date.now();
  assert.equal(answer.ok, true);
  const at = Date.parse(answer.consumedAt);
  assert.ok(at >= Math.floor(before / 1000) * 1000 && at <= after, `wall clock, got ${answer.consumedAt}`);
});
