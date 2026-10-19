/* (T51 CR-16) The newest activity this module holds, for `instance-setup`'s bootstrapfacts: R80's lastActivity(). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, sha } from "./fixture.mjs";

const T_EARLY = Date.parse("2026-10-18T09:00:00.000Z");
const T_LATE = Date.parse("2026-10-19T08:30:00.000Z");

test("R80 lastActivity() answers the later of two sessions' last_active, as an ISO-8601 instant; a read that changes nothing", async () => {
  const w = await world().group("ann");
  const first = (await w.c.login({ handle: "ann", password: PASSWORD("ann") })).token;
  const second = (await w.c.login({ handle: "ann", password: PASSWORD("ann") })).token;
  w.sql.exec(`UPDATE sessions SET last_active=? WHERE token_sha=?`, T_EARLY, sha(first));
  w.sql.exec(`UPDATE sessions SET last_active=? WHERE token_sha=?`, T_LATE, sha(second));
  const before = w.rows(`SELECT * FROM sessions ORDER BY token_sha`);
  assert.equal(w.c.lastActivity(), "2026-10-19T08:30:00.000Z");
  assert.deepEqual(w.rows(`SELECT * FROM sessions ORDER BY token_sha`), before);
});

test("R80 lastActivity() answers null when no session is held, and when none has recorded an activity", async () => {
  const w = await world().group("ann");
  assert.equal(w.c.lastActivity(), null);
  await w.c.login({ handle: "ann", password: PASSWORD("ann") });
  w.sql.exec(`UPDATE sessions SET last_active=NULL`);
  assert.equal(w.c.lastActivity(), null);
});

test("R80 lastActivity() answers null, and never throws, when the sessions cannot be read", async () => {
  const w = await world().group("ann");
  await w.c.login({ handle: "ann", password: PASSWORD("ann") });
  w.db.exec(`DROP TABLE sessions`);
  assert.equal(w.c.lastActivity(), null);
});
