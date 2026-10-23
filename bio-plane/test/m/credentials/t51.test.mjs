/* (T51 CR-16) The newest activity this module holds, for `instance-setup`'s bootstrapfacts: R80's lastActivity(). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, sha } from "./fixture.mjs";
import { noSuchMember } from "../../../src/membership/index.mjs";

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

/* ann and bob active, the founder claimed */
const keyed = async () => world().group("ann", "bob");

test("R81 a founder's own key is registered like any member's once the instance is claimed: signerRegisterOwn by 'admin' is active, self-registered, notified to every administrator, and attests; before the claim it is refused", async () => {
  const before = world();   /* the control: the same call, the instance not yet claimed */
  assert.deepEqual(before.c.signerRegisterOwn({ keyB64: "AAAAfounderkey", comment: "founder's laptop", by: "admin" }), noSuchMember("admin"));
  assert.equal(before.row(`SELECT COUNT(*) AS n FROM signers`).n, 0, "the refusal writes nothing");
  const w = await keyed();
  const r = w.c.signerRegisterOwn({ keyB64: "AAAAfounderkey", comment: "founder's laptop", by: "admin" });
  assert.deepEqual({ ...r, detail: null, timings: null }, { ok: true, keyB64: "AAAAfounderkey", memberId: "admin", status: "active", origin: "self",
    registered_by: "admin", existed: false, notified: ["admin", "second"], detail: null, timings: null });
  const l = w.c.signerList().signers.find((s) => s.key_b64 === "AAAAfounderkey");
  assert.deepEqual([l.member_id, l.origin, l.registered_by, l.status, l.attests, l.attests_why], ["admin", "self", "admin", "active", true, null]);
  assert.ok(w.c.attestingKeys().some((k) => k.key_b64 === "AAAAfounderkey" && k.member_id === "admin"));
  /* registered again: the same key, nothing rewritten (R9) */
  const again = w.c.signerRegisterOwn({ keyB64: "AAAAfounderkey", by: "admin" });
  assert.deepEqual([again.ok, again.existed], [true, true]);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM signers`).n, 1);
  /* and a key a member holds is never the founder's (R9) */
  assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAannkey", by: "ann" }).ok, true);
  assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAannkey", by: "admin" }).reason, "SIGNER_KEY_HELD_BY_ANOTHER");
});

test("R81 control: a non-founder is as before: a member registers, a member never enrolled and a name no one holds are refused", async () => {
  const w = await keyed();
  assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAannkey", by: "ann" }).origin, "self");
  assert.deepEqual(w.c.signerRegisterOwn({ keyB64: "AAAAnew", by: "nobody" }), noSuchMember("nobody"));
  assert.equal((await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" })).ok, true);
  assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAnew", by: "cal" }).reason, "SIGNER_MEMBER_NOT_ENROLLED");
});
