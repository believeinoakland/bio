/* The seam with membership (K637): R16's revocation listener, R17's claim fact, R18's purge exemption; and the start
   that registers them, at the interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, realWorld, PASSWORD } from "./fixture.mjs";
import { credentialsOf, CREDENTIALS_EXEMPT_TABLES, CREDENTIALS_TABLES } from "../../../src/credentials/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";

const sessionsOf = (w, id) => w.rows(`SELECT token FROM sessions WHERE role=?`, `member:${id}`).length;
const keysOf = (w, id) => w.rows(`SELECT key_b64, status, status_by FROM signers WHERE member_id=? ORDER BY key_b64`, id);

async function revocationWorld() {
  const w = await world().group("ann", "bob");
  for (const id of ["ann", "bob"]) {
    for (let i = 0; i < 2; i++) assert.equal((await w.c.login({ role: `member:${id}`, password: PASSWORD(id) })).ok, true);
    w.c.signerAdd({ keyB64: `AAAA${id}1`, memberId: id, by: "admin" });
    w.c.signerRegisterOwn({ keyB64: `AAAA${id}2`, by: id });
  }
  return w;
}

test("R16 a revocation (membership R20) ends every session of the member and revokes every key registered to them, in the same act, named for its actor; no one else's", async () => {
  const w = await revocationWorld();
  const annTok = (await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token;
  assert.equal(sessionsOf(w, "ann"), 3);
  const r = w.m.memberSet({ memberId: "ann", status: "revoked", by: "second" });
  assert.equal(r.ok, true);
  /* in the same act: by the time the revoking call returns, the sessions are gone and the keys revoked */
  assert.equal(sessionsOf(w, "ann"), 0);
  assert.equal(w.c.session(annTok), null);
  assert.deepEqual(keysOf(w, "ann"), [{ key_b64: "AAAAann1", status: "revoked", status_by: "second" },
                                      { key_b64: "AAAAann2", status: "revoked", status_by: "second" }]);
  assert.deepEqual(w.c.attestingKeys().map((k) => k.member_id), ["bob", "bob"]);
  /* nobody else's */
  assert.equal(sessionsOf(w, "bob"), 2);
  assert.deepEqual(keysOf(w, "bob").map((k) => k.status), ["active", "active"]);
  /* a reactivation restores nothing: sessions are not reissued and keys are re-activated only by R7 */
  w.m.memberSet({ memberId: "ann", status: "active", by: "admin" });
  assert.deepEqual([sessionsOf(w, "ann"), keysOf(w, "ann").map((k) => k.status)], [0, ["revoked", "revoked"]]);
});

test("R16 a carried administrator removal (membership R8) ends the target's sessions and revokes their keys, named for the completing voter", async () => {
  const w = await world().group("ann");
  for (const id of ["third", "fourth"]) {
    const p = await w.m.memberAdd({ memberId: id, cover: `c ${id}`, role: "admin", by: "admin" });
    assert.equal(p.reason, "CONSENSUS_REQUIRED");
    let e = null;
    for (const by of w.m.activeAdmins()) e = await w.m.adminEndorse({ memberId: id, by });
    assert.equal(e.ok, true);
    assert.equal((await w.m.enroll({ invite: e.invite, handle: id, password: PASSWORD(id) })).ok, true);
    await w.c.setPassword({ role: `member:${id}`, password: PASSWORD(id) });
  }
  assert.equal((await w.c.login({ role: "member:fourth", password: PASSWORD("fourth") })).ok, true);
  w.c.signerAdd({ keyB64: "AAAAfourth", memberId: "fourth", by: "admin" });
  /* five administrators: three votes carry it; a vote short of it changes nothing here */
  assert.equal(w.m.adminRemove({ memberId: "fourth", by: "admin", reason: "r1" }).reason, "VOTES_SHORT");
  assert.equal(w.m.adminRemove({ memberId: "fourth", by: "second", reason: "r2" }).reason, "VOTES_SHORT");
  assert.deepEqual([sessionsOf(w, "fourth"), keysOf(w, "fourth")[0].status], [1, "active"]);
  const carried = w.m.adminRemove({ memberId: "fourth", by: "third", reason: "r3" });
  assert.equal(carried.ok, true);
  assert.deepEqual([sessionsOf(w, "fourth"), keysOf(w, "fourth")], [0, [{ key_b64: "AAAAfourth", status: "revoked", status_by: "third" }]]);
});

test("R16 R17 start registers the listener and the claim fact once; a second start is refused by membership's R81 and changes nothing", async () => {
  const w = await world().group("ann");
  const again = w.c.start();
  assert.deepEqual([again.revoked.ok, again.revoked.reason, again.revoked.module], [false, "LISTENER_DECLARED", "credentials"]);
  assert.deepEqual([again.claimed.ok, again.claimed.reason, again.claimed.module], [false, "LISTENER_DECLARED", "credentials"]);
  assert.equal(credentialsOf(w.ctx), w.c, "one instance per storage: credentialsOf starts it once");
  /* the registration still stands and fires once: one revocation, one cascade */
  assert.equal((await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).ok, true);
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.equal(sessionsOf(w, "ann"), 0);
  assert.equal(w.m.isAdministrator("admin"), true);
});

test("R17 claimed() is true exactly when the founder's credential is held; membership reads the founder through it; it writes nothing and never throws", async () => {
  const w = world();
  assert.equal(w.c.claimed(), false);
  assert.deepEqual([w.m.isAdministrator("admin"), w.m.activeAdmins()], [false, []], "membership R64, R86: not claimed");
  await w.c.setPassword({ role: "member:x", password: PASSWORD("x") });
  assert.equal(w.c.claimed(), false, "another role's credential is not the founder's");
  const before = w.snapshot();
  assert.equal(w.c.claimed(), false);
  assert.equal(w.snapshot(), before, "writes nothing");
  assert.equal((await w.c.claim({ password: "x".repeat(12), tokenFp: "fp-1" })).ok, true);
  assert.equal(w.c.claimed(), true);
  assert.deepEqual([w.m.isAdministrator("admin"), w.m.activeAdmins()], [true, ["admin"]], "membership R64, R86: claimed");
  /* a re-armed claim replaces the credential and the fact holds through it */
  assert.equal((await w.c.claim({ password: "y".repeat(12), tokenFp: "fp-2" })).ok, true);
  assert.equal(w.c.claimed(), true);
  /* never throws: a store it cannot read answers not claimed */
  const broken = credentialsOf({ storage: { sql: { exec() { throw new Error("no store"); } } } },
    { record: { declarePurge() {} }, membership: { onRevoked() { return { ok: true }; }, registerClaimed() { return { ok: true }; } } });
  assert.equal(broken.claimed(), false);
});

test("R18 every credentials table is declared exempt from purge, and a whole-store purge clears none of them (through the real record-core)", async () => {
  const w = realWorld();
  await w.c.claim({ password: "x".repeat(12), tokenFp: "fp-1" });
  const a = await w.m.memberAdd({ memberId: "second", cover: "c", role: "admin", by: "admin" });
  await w.m.enroll({ invite: a.invite, handle: "second", password: PASSWORD("second") });
  await w.c.setPassword({ role: "member:second", password: PASSWORD("second") });
  assert.equal((await w.c.login({ role: "member:second", password: PASSWORD("second") })).ok, true);
  w.c.signerAdd({ keyB64: "AAAAsecond", memberId: "second", by: "admin" });
  w.c.aiCredentialMint({ tokenId: "t1", secretSha: "a".repeat(64), principalKind: "member", who: "second" });
  assert.equal((await w.c.accountReferenceSet({ member: "second", kind: "apikey", secret: "sk-test", by: "second" })).ok, true);
  assert.equal((await w.c.keyedServiceSet({ service: "courtlistener", key: "cl-key", by: "second" })).ok, true);
  const sess = w.row(`SELECT token FROM sessions WHERE role='member:second'`).token;
  assert.equal((await w.c.aiGrantMint({ member: "second", by: "second", session: sess })).ok, true);
  const count = () => Object.fromEntries(CREDENTIALS_EXEMPT_TABLES.map((t) => [t, w.row(`SELECT COUNT(*) AS n FROM ${t}`).n]));
  const before = count();
  assert.deepEqual(before, { credentials: 2, sessions: 1, bootstrap: 1, signers: 1, ai_credentials: 1,
    account_references: 1, keyed_services: 1, ai_grants: 1 });
  assert.equal(w.rc.purge({}).ok, true);
  assert.deepEqual(count(), before, "a whole-store purge clears none of them");
  assert.equal(w.rc.purge({ bundleId: "second" }).ok, true);
  assert.deepEqual(count(), before);
  assert.equal((await w.c.login({ role: "member:second", password: PASSWORD("second") })).ok, true);
});

test("R18 R30 the declaration: every table declared once by credentials through declareTable, with its classes; any refusal is thrown", () => {
  const w = world();
  const mine = [...w.core.declared.entries()].filter(([, d]) => d.module === "credentials");
  assert.deepEqual(mine.map(([n]) => n).sort(), [...CREDENTIALS_EXEMPT_TABLES].sort(), "every table this module owns, and only those");
  const cls = Object.fromEntries(mine.map(([n, d]) => [n, d.classes]));
  for (const t of CREDENTIALS_EXEMPT_TABLES)
    assert.deepEqual([cls[t].purge, cls[t].expunge, cls[t].derive, cls[t].version_chain], ["exempt", "none", "stored", false], t);
  /* R30: account references, keyed-service keys, password hashes, sessions and AI credentials (and the ask grants) never
     exported; account references seen by their owner alone */
  for (const t of ["account_references", "keyed_services", "credentials", "sessions", "ai_credentials", "ai_grants"])
    assert.equal(cls[t].export, "never", t);
  assert.equal(cls.account_references.sight, "owner");
  assert.deepEqual(CREDENTIALS_TABLES.map((t) => t.name), CREDENTIALS_EXEMPT_TABLES);
  /* once */
  assert.equal(w.c.declareTables(), false, "once");
  /* a refusal is a fault: thrown, never silently left purgeable or exportable */
  const sqlStub = { exec() { return []; } };
  const membership = { onRevoked() { return { ok: true }; }, registerClaimed() { return { ok: true }; } };
  const held = { declareTable() { return { ok: false, reason: "TABLE_DECLARED", table: "signers", declaredBy: "membership" }; } };
  assert.throws(() => credentialsOf({ storage: { sql: sqlStub } }, { record: held, membership }).declareTables(),
    /refused its table declaration: TABLE_DECLARED \(signers\)/);
  const bad = { declareTable() { return { ok: false, reason: "TABLE_CLASS_UNKNOWN", table: "x" }; } };
  assert.throws(() => credentialsOf({ storage: { sql: sqlStub } }, { record: bad, membership }).declareTables(), /TABLE_CLASS_UNKNOWN/);
});

test("R16 R17 credentialsOf over a ctx reaches membership's own instance on that ctx, so the listener and the fact are that membership's", () => {
  const w = realWorld();
  assert.equal(w.c.membership, membershipOf(w.ctx));
  assert.equal(credentialsOf(w.ctx), w.c);
  assert.equal(w.m.isAdministrator("admin"), false);
});

test("R20 start registers setPassword as membership's password setter (its R95): the setter sets the member's password as R3 does, once; a second registration is membership's refusal", async () => {
  /* membership's R95 as worded: one registration, held; a second refused by R81 */
  const held = [];
  const m = world().m;
  const membership = {
    onRevoked: (mod, fn) => m.onRevoked(mod, fn), registerClaimed: (mod, fn) => ({ ok: true, module: mod }),
    memberFacts: (id) => m.memberFacts(id),
    registerPasswordSetter(fn) {
      if (typeof fn !== "function") return { ok: false, reason: "LISTENER_MALFORMED" };
      if (held.length) return { ok: false, reason: "LISTENER_DECLARED" };
      held.push(fn); return { ok: true };
    },
  };
  const w = world();
  const c = credentialsOf({ storage: { sql: w.sql } }, { record: { declarePurge() { return { ok: true }; } }, membership });
  assert.equal(held.length, 1, "registered once, at start");
  assert.deepEqual(c.start().password, { ok: false, reason: "LISTENER_DECLARED" }, "a second start is membership's refusal");
  /* the setter is R3's: a salted derived hash for the role, the password never stored, the answer {ok, role} */
  const r = await held[0]({ role: "member:ann", password: "ann-passphrase-x" });
  assert.deepEqual(r, { ok: true, role: "member:ann" });
  const row = w.row(`SELECT * FROM credentials WHERE role='member:ann'`);
  assert.match(row.hash, /^[0-9a-f]{64}$/);
  assert.doesNotMatch(JSON.stringify(row), /ann-passphrase-x/);
  await held[0]({ role: "member:ann", password: "ann-passphrase-y" });
  assert.equal(w.rows(`SELECT role FROM credentials WHERE role='member:ann'`).length, 1, "replaced, never a second row");
  /* through the real membership, once its R95 exists: enrol sets the password in the one act, and the member signs in */
  const real = world();
  if (typeof real.m.registerPasswordSetter === "function") {
    await real.claim();
    const a = await real.m.memberAdd({ memberId: "second", cover: "c", role: "admin", by: "admin" });
    assert.equal((await real.m.enroll({ invite: a.invite, handle: "second", password: "second-passphrase-z" })).ok, true);
    assert.equal((await real.c.login({ role: "member:second", password: "second-passphrase-z" })).ok, true);
  }
});
