/* R21 (N505): each signer key records `status_at`, the instant its status last changed, and R8's `signerList` answers
   it. Every act that writes a key is driven at the interface, each in both arms: one that changes the status moves
   `status_at` to the act's instant, one that leaves the status as it was leaves it unchanged; and a key registered
   before the column existed reads null until an act changes its status. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { world, sqlOver } from "./fixture.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";

const listed = (w, k) => w.c.signerList().signers.find((s) => s.key_b64 === k);
const at = (w, k) => listed(w, k).status_at;
const tick = () => new Promise((r) => setTimeout(r, 3));

/* Runs `act`, a few milliseconds clear of the acts around it, and answers the window its instant must fall in. */
async function timed(act) {
  await tick();
  const lo = Date.now();
  const answer = await act();
  const hi = Date.now();
  await tick();
  return { answer, lo, hi };
}
const within = (s, { lo, hi }, label) => {
  assert.match(s, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/, label);
  assert.ok(Date.parse(s) >= lo && Date.parse(s) <= hi, `${label}: ${s} outside the act's window`);
};

async function keyWorld() {
  const w = await world().group("ann", "bob");
  return w;
}

test("R21 R8 first registration sets status_at to the registration's instant (R6, R9), the key's `added`", async () => {
  const w = await keyWorld();
  const a = await timed(() => w.c.signerAdd({ keyB64: "AAAAadm", memberId: "ann", by: "admin" }));
  const s = await timed(() => w.c.signerRegisterOwn({ keyB64: "AAAAself", by: "bob" }));
  assert.deepEqual([a.answer.ok, s.answer.ok], [true, true]);
  within(at(w, "AAAAadm"), a, "R6");
  within(at(w, "AAAAself"), s, "R9");
  for (const k of ["AAAAadm", "AAAAself"]) assert.equal(at(w, k), listed(w, k).added, `${k}: registered and set at once`);
  /* the roster answers exactly the stored instant, for every key */
  for (const r of w.c.signerList().signers)
    assert.equal(r.status_at, w.row(`SELECT status_at FROM signers WHERE key_b64=?`, r.key_b64).status_at, r.key_b64);
});

test("R21 R6 on a known key: re-activating a revoked key moves status_at; registering an active key again, or rebinding it, leaves it", async () => {
  const w = await keyWorld();
  w.c.signerAdd({ keyB64: "AAAAk", memberId: "ann", by: "admin" });
  const first = at(w, "AAAAk");
  await tick();
  assert.equal(w.c.signerAdd({ keyB64: "AAAAk", memberId: "ann", comment: "again", by: "admin" }).ok, true);
  assert.equal(at(w, "AAAAk"), first, "active stays active: unchanged");
  await tick();
  assert.equal(w.c.signerAdd({ keyB64: "AAAAk", memberId: "bob", comment: "rebound", by: "second" }).ok, true);
  assert.deepEqual([listed(w, "AAAAk").member_id, at(w, "AAAAk")], ["bob", first], "rebound while active: the status did not change");
  const r = await timed(() => w.c.signerSet({ keyB64: "AAAAk", status: "revoked", by: "admin" }));
  within(at(w, "AAAAk"), r, "R7 revoke");
  const re = await timed(() => w.c.signerAdd({ keyB64: "AAAAk", memberId: "ann", by: "admin" }));
  assert.deepEqual([re.answer.ok, listed(w, "AAAAk").status], [true, "active"]);
  within(at(w, "AAAAk"), re, "R6's re-activation");
  /* a refused R6 writes nothing, status_at included */
  const before = at(w, "AAAAk");
  await tick();
  assert.equal(w.c.signerAdd({ keyB64: "AAAAk", memberId: "ann", by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.c.signerAdd({ keyB64: "AAAAk", memberId: "nobody", by: "admin" }).reason, "NO_SUCH_MEMBER");
  assert.equal(at(w, "AAAAk"), before);
});

test("R21 R7 signerSet moves status_at on each real change, either way, and never when it sets the status the key has or is refused", async () => {
  const w = await keyWorld();
  w.c.signerAdd({ keyB64: "AAAAk", memberId: "ann", by: "admin" });
  let last = at(w, "AAAAk");
  await tick();
  assert.equal(w.c.signerSet({ keyB64: "AAAAk", status: "active", by: "admin" }).ok, true);
  assert.equal(at(w, "AAAAk"), last, "active set active: unchanged");
  for (const status of ["revoked", "active", "revoked"]) {
    const t = await timed(() => w.c.signerSet({ keyB64: "AAAAk", status, by: "second" }));
    assert.equal(t.answer.ok, true);
    within(at(w, "AAAAk"), t, `set ${status}`);
    last = at(w, "AAAAk");
    await tick();
    assert.equal(w.c.signerSet({ keyB64: "AAAAk", status, by: "admin" }).ok, true);
    assert.equal(at(w, "AAAAk"), last, `${status} set ${status} again: unchanged`);
  }
  /* refusals: none writes it */
  assert.equal(w.c.signerSet({ keyB64: "AAAAk", status: "active", by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.c.signerSet({ keyB64: "AAAAk", status: "lost", by: "admin" }).reason, "BAD_STATUS");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  w.m.memberSet({ memberId: "ann", status: "active", by: "admin" });
  last = at(w, "AAAAk");
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='ann'`);
  await tick();
  assert.equal(w.c.signerSet({ keyB64: "AAAAk", status: "active", by: "admin" }).reason, "SIGNER_MEMBER_NOT_ACTIVE");
  assert.equal(at(w, "AAAAk"), last, "a refused activation leaves it");
});

test("R21 R9 a key the member already holds (existed: true) and every refusal leave status_at unchanged", async () => {
  const w = await keyWorld();
  w.c.signerRegisterOwn({ keyB64: "AAAAmine", by: "ann" });
  w.c.signerAdd({ keyB64: "AAAAbobs", memberId: "bob", by: "admin" });
  w.c.signerAdd({ keyB64: "AAAAgone", memberId: "ann", by: "admin" });
  w.c.signerSet({ keyB64: "AAAAgone", status: "revoked", by: "admin" });
  const before = Object.fromEntries(w.c.signerList().signers.map((s) => [s.key_b64, s.status_at]));
  await tick();
  assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAmine", by: "ann" }).existed, true);
  assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAbobs", by: "ann" }).reason, "SIGNER_KEY_HELD_BY_ANOTHER");
  assert.equal(w.c.signerRegisterOwn({ keyB64: "AAAAgone", by: "ann" }).reason, "SIGNER_KEY_REVOKED");
  assert.deepEqual(Object.fromEntries(w.c.signerList().signers.map((s) => [s.key_b64, s.status_at])), before);
});

test("R21 R10 signerRevokeOwn moves status_at when it revokes, and revoking twice leaves it", async () => {
  const w = await keyWorld();
  w.c.signerRegisterOwn({ keyB64: "AAAAmine", by: "ann" });
  const r = await timed(() => w.c.signerRevokeOwn({ keyB64: "AAAAmine", by: "ann" }));
  assert.equal(r.answer.already, false);
  within(at(w, "AAAAmine"), r, "R10");
  const last = at(w, "AAAAmine");
  await tick();
  assert.equal(w.c.signerRevokeOwn({ keyB64: "AAAAmine", by: "ann" }).already, true);
  assert.equal(w.c.signerRevokeOwn({ keyB64: "AAAAmine", by: "bob" }).reason, "NO_SUCH_KEY");
  assert.equal(at(w, "AAAAmine"), last);
});

test("R21 R16 a member's revocation moves status_at for each key it revokes, at the act's instant; a key already revoked, another member's, and a reactivation leave theirs", async () => {
  const w = await keyWorld();
  w.c.signerAdd({ keyB64: "AAAAann1", memberId: "ann", by: "admin" });
  w.c.signerRegisterOwn({ keyB64: "AAAAann2", by: "ann" });
  w.c.signerAdd({ keyB64: "AAAAann3", memberId: "ann", by: "admin" });
  w.c.signerSet({ keyB64: "AAAAann3", status: "revoked", by: "admin" });
  w.c.signerAdd({ keyB64: "AAAAbob1", memberId: "bob", by: "admin" });
  const kept = { AAAAann3: at(w, "AAAAann3"), AAAAbob1: at(w, "AAAAbob1") };
  const r = await timed(() => w.m.memberSet({ memberId: "ann", status: "revoked", by: "second" }));
  assert.equal(r.answer.ok, true);
  within(at(w, "AAAAann1"), r, "R16");
  assert.equal(at(w, "AAAAann2"), at(w, "AAAAann1"), "one act, one instant");
  assert.deepEqual({ AAAAann3: at(w, "AAAAann3"), AAAAbob1: at(w, "AAAAbob1") }, kept, "already revoked, and another's: unchanged");
  const revokedAt = at(w, "AAAAann1");
  await tick();
  w.m.memberSet({ memberId: "ann", status: "active", by: "admin" });
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.equal(at(w, "AAAAann1"), revokedAt, "a later revocation finds the key revoked: unchanged");
  /* the notice's own `at` is the act's time, so it is the instant recorded */
  w.m.memberSet({ memberId: "ann", status: "active", by: "admin" });
  w.c.signerSet({ keyB64: "AAAAann1", status: "active", by: "admin" });
  const seen = [];
  w.m.onRevoked("zz-probe", (n) => seen.push(n.at));
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.deepEqual([seen.length, at(w, "AAAAann1")], [1, seen[0]]);
});

test("R21 R8 a key registered before status_at existed reads null, never back-filled, until an act changes its status", async () => {
  /* a store whose signers table predates the column, with two keys in it */
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, title TEXT)`);
  db.exec(`CREATE TABLE signers (key_b64 TEXT PRIMARY KEY, member_id TEXT NOT NULL, comment TEXT,
           status TEXT NOT NULL DEFAULT 'active', added TEXT NOT NULL, status_by TEXT, origin TEXT, registered_by TEXT)`);
  db.exec(`INSERT INTO signers (key_b64, member_id, status, added) VALUES
           ('AAAAold1', 'ann', 'active', '2026-01-01T00:00:00.000Z'), ('AAAAold2', 'ann', 'revoked', '2026-01-02T00:00:00.000Z')`);
  const sql = sqlOver(db);
  const ctx = { storage: { sql } };
  const core = { declarePurge() { return { ok: true }; }, declareTable() { return { ok: true }; }, bundleInfo() { return null; } };
  const m = membershipOf(ctx, { record: core });
  m.migrate();
  const c = credentialsOf(ctx, { record: core, membership: m });
  c.migrate();
  c.migrate();
  await c.claim({ password: "x".repeat(12), tokenFp: "fp" });
  for (const id of ["second", "ann"]) {
    const a = await m.memberAdd({ memberId: id, cover: `c ${id}`, role: id === "second" ? "admin" : "member", by: "admin" });
    assert.equal((await m.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` })).ok, true, id);
  }
  const row = (k) => c.signerList().signers.find((s) => s.key_b64 === k);
  assert.deepEqual([row("AAAAold1").status_at, row("AAAAold2").status_at], [null, null], "not recorded");
  assert.deepEqual(db.prepare(`SELECT key_b64, status_at FROM signers ORDER BY key_b64`).all().map((r) => ({ ...r })),
    [{ key_b64: "AAAAold1", status_at: null }, { key_b64: "AAAAold2", status_at: null }], "never back-filled");
  /* acts that leave the status as it was leave it null */
  c.signerAdd({ keyB64: "AAAAold1", memberId: "ann", by: "admin" });
  c.signerSet({ keyB64: "AAAAold2", status: "revoked", by: "admin" });
  assert.deepEqual([row("AAAAold1").status_at, row("AAAAold2").status_at], [null, null]);
  /* a real change records it */
  const lo = Date.now();
  c.signerSet({ keyB64: "AAAAold1", status: "revoked", by: "admin" });
  c.signerAdd({ keyB64: "AAAAold2", memberId: "ann", by: "admin" });
  const hi = Date.now();
  for (const k of ["AAAAold1", "AAAAold2"]) within(row(k).status_at, { lo, hi }, k);
});
