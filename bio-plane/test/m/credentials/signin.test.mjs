/* Sign-in and sessions (R1–R5), at the interface: copied from membership's R1–R3, R72 and R73 tests at the split
   (K637), against this module's services. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, FOUNDER_PASSWORD } from "./fixture.mjs";
import { Credentials } from "../../../src/credentials/index.mjs";
import { Membership } from "../../../src/membership/index.mjs";

test("R1 claim sets the founder's password once; too short refused; a replaced bootstrap credential re-arms", async () => {
  const w = world();
  assert.deepEqual(await w.c.claim({ password: "short", tokenFp: "fp-1" }), { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 });
  assert.equal((await w.c.claim({ password: "x".repeat(11), tokenFp: "fp-1" })).reason, "PASSWORD_TOO_SHORT");
  assert.equal((await w.c.claim({ tokenFp: "fp-1" })).reason, "PASSWORD_TOO_SHORT");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM credentials`).n, 0);
  const ok = await w.c.claim({ password: "x".repeat(12), tokenFp: "fp-1" });
  assert.deepEqual([ok.ok, ok.role], [true, "admin"]);
  assert.match(ok.consumedAt, /^\d{4}-\d\d-\d\dT/);
  const again = await w.c.claim({ password: "y".repeat(12), tokenFp: "fp-1" });
  assert.deepEqual(again, { ok: false, reason: "ALREADY_CLAIMED", consumedAt: ok.consumedAt });
  assert.equal((await w.c.claim({ password: "y".repeat(12) })).reason, "ALREADY_CLAIMED", "no fingerprint never re-arms");
  assert.equal((await w.c.login({ role: "admin", password: "x".repeat(12) })).ok, true);
  assert.equal((await w.c.login({ role: "admin", password: "y".repeat(12) })).ok, false);
  const rearmed = await w.c.claim({ password: "z".repeat(12), tokenFp: "fp-2" });
  assert.equal(rearmed.ok, true);
  assert.equal((await w.c.login({ role: "admin", password: "z".repeat(12) })).ok, true);
  assert.equal((await w.c.login({ role: "admin", password: "x".repeat(12) })).ok, false, "the re-armed claim replaced it");
  assert.equal((await w.c.claim({ password: "w".repeat(12), tokenFp: "fp-2" })).reason, "ALREADY_CLAIMED");
});

test("R2 bootstrapState: claimed, re-armed by a different fingerprint, the claim instant, nobody named", async () => {
  const w = world();
  assert.deepEqual(w.c.bootstrapState("fp-1"), { claimed: false, rearmed: false, consumedAt: null });
  assert.deepEqual(w.c.bootstrapState(), { claimed: false, rearmed: false, consumedAt: null });
  const c = await w.c.claim({ password: "x".repeat(12), tokenFp: "fp-1" });
  assert.deepEqual(w.c.bootstrapState("fp-1"), { claimed: true, rearmed: false, consumedAt: c.consumedAt });
  assert.deepEqual(w.c.bootstrapState(null), { claimed: true, rearmed: false, consumedAt: c.consumedAt });
  assert.deepEqual(w.c.bootstrapState("fp-2"), { claimed: false, rearmed: true, consumedAt: null });
  await w.enrol("second", "admin");
  for (const fp of ["fp-1", "fp-2", null]) {
    const s = w.c.bootstrapState(fp);
    assert.deepEqual(Object.keys(s).sort(), ["claimed", "consumedAt", "rearmed"], "it names nobody and returns no secret");
    assert.doesNotMatch(JSON.stringify(s), /admin|second|x{12}|[0-9a-f]{32}/);
  }
});

test("R3 setPassword stores a salted derived hash, replacing any earlier one, never the password", async () => {
  const w = await world().group("xena");
  const before = w.rows(`SELECT role FROM credentials ORDER BY role`).length;
  assert.deepEqual(await w.c.setPassword({ role: "member:xena", password: "first-password-1" }), { ok: true, role: "member:xena" });
  const a = w.row(`SELECT * FROM credentials WHERE role='member:xena'`);
  await w.c.setPassword({ role: "member:xena", password: "second-password-2" });
  const b = w.row(`SELECT * FROM credentials WHERE role='member:xena'`);
  assert.equal(w.rows(`SELECT role FROM credentials`).length, before, "replaced, never a second row");
  assert.notEqual(a.salt, b.salt);
  assert.notEqual(a.hash, b.hash);
  assert.match(b.hash, /^[0-9a-f]{64}$/);
  assert.doesNotMatch(JSON.stringify(w.rows(`SELECT * FROM credentials`)), /password/);
  assert.equal((await w.c.login({ role: "member:xena", password: "first-password-1" })).ok, false);
  assert.equal((await w.c.login({ role: "member:xena", password: "second-password-2" })).ok, true);
});

test("R4 login: one refusal for every failing case, same detail, same cost; success returns token and expiry", async () => {
  const w = await world().group("ann", "bob", "dee");
  const ok = await w.c.login({ role: "member:ann", password: PASSWORD("ann"), ttlSeconds: 60 });
  assert.deepEqual(Object.keys(ok).sort(), ["expires", "ok", "role", "token"]);
  assert.deepEqual([ok.ok, ok.role], [true, "member:ann"]);
  assert.match(ok.token, /^[0-9a-f]{64}$/);
  assert.ok(ok.expires > Date.now() && ok.expires <= Date.now() + 60_000);
  assert.equal(w.row(`SELECT role FROM sessions WHERE token=?`, ok.token).role, "member:ann");
  assert.equal((await w.c.login({ role: "admin", password: FOUNDER_PASSWORD })).ok, true);
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  /* an invited member who never enrolled, with a password set for the role: inactive, refused */
  assert.equal((await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" })).ok, true);
  await w.c.setPassword({ role: "member:cal", password: PASSWORD("cal") });
  /* a member row that is gone (no row) though a credential exists */
  await w.c.setPassword({ role: "member:ghost", password: PASSWORD("ghost") });
  const before = w.snapshot();
  const cases = [
    { role: "member:nobody", password: "whatever-password" },          // no credential
    { role: "member:bob", password: PASSWORD("bob") },                 // revoked member, right password
    { role: "member:cal", password: PASSWORD("cal") },                 // invited, never enrolled, right password
    { role: "member:ghost", password: PASSWORD("ghost") },             // no member row, right password
    { role: "member:ann", password: "wrong-password-1" },              // wrong password
    { role: "admin", password: "wrong-password-1" },                   // the founder, wrong password
    { role: "never-registered", password: "whatever-password" },
    { role: "member:ann" },                                            // no password
  ];
  const answers = [];
  for (const c of cases) answers.push(await w.c.login(c));
  for (const a of answers)
    assert.deepEqual(a, { ok: false, reason: "SIGN_IN_REFUSED", detail: Credentials.LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED });
  assert.equal(w.snapshot(), before, "a refusal issues no session and writes nothing");
  /* the same cost: every refusal derives a PBKDF2 key, so none answers in a fraction of the others' time */
  const time = async (c) => { const t0 = performance.now(); await w.c.login(c); return performance.now() - t0; };
  const t = [];
  for (const c of cases) t.push(await time(c));
  assert.ok(Math.min(...t) > Math.max(...t) / 5, `refusal times differ too much: ${t.map((x) => x.toFixed(1))}`);
  /* a reactivated member signs in again */
  w.m.memberSet({ memberId: "bob", status: "active", by: "admin" });
  assert.equal((await w.c.login({ role: "member:bob", password: PASSWORD("bob") })).ok, true);
});

test("R4 login sweeps expired sessions as it issues one", async () => {
  const w = await world().group("ann");
  w.sql.exec(`INSERT INTO sessions (token, role, expires, created) VALUES ('stale', 'member:ann', ?, 'x')`, Date.now() - 1);
  assert.equal((await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).ok, true);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM sessions WHERE token='stale'`).n, 0);
});

test("R5 session resolves rights at each call through membership's sessionRights: founder, administrator, member, revoked, unknown, expired", async () => {
  const w = await world().group("ann");
  const tok = async (role, password) => (await w.c.login({ role, password })).token;
  assert.equal(w.c.session(null), null);
  assert.equal(w.c.session(""), null);
  assert.equal(w.c.session("no-such-token"), null);
  const fTok = await tok("admin", FOUNDER_PASSWORD);
  const f = w.c.session(fTok);
  assert.deepEqual({ ...f, expires: 0 }, { role: "admin", expires: 0, capabilities: [...Membership.CAPABILITIES],
    administer: true, member: "admin", handle: null, rootOfTrust: true });
  assert.deepEqual({ ...f, role: undefined, expires: undefined },
    { role: undefined, expires: undefined, ...w.m.sessionRights("admin") }, "exactly membership's R92");
  const sTok = await tok("member:second", PASSWORD("second"));
  const s = w.c.session(sTok);
  assert.deepEqual([s.capabilities, s.administer, s.member, s.handle, s.rootOfTrust],
    [[...Membership.CAPABILITIES], true, "second", "second", false]);
  const aTok = await tok("member:ann", PASSWORD("ann"));
  assert.deepEqual(w.c.session(aTok).capabilities, ["contribute"]);
  w.m.memberCaps({ memberId: "ann", capabilities: ["contribute", "publish"], by: "admin" });
  assert.deepEqual(w.c.session(aTok).capabilities, ["contribute", "publish"], "a change takes effect at the next call");
  assert.equal(w.c.session(aTok).administer, false);
  for (const t of [fTok, sTok, aTok]) {
    const r = w.c.session(t);
    assert.deepEqual({ ...r, role: undefined, expires: undefined },
      { role: undefined, expires: undefined, ...w.m.sessionRights(r.role) }, r.role);
  }
  /* an inactive member holds none (the row flipped without the session delete: the race R5 covers) */
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='ann'`);
  const r = w.c.session(aTok);
  assert.deepEqual([r.role, r.capabilities, r.administer, r.rootOfTrust], ["member:ann", [], false, false]);
  /* an unrecognised role holds none */
  w.sql.exec(`INSERT INTO sessions (token, role, expires, created) VALUES ('odd', 'class:probe', ?, 'x')`, Date.now() + 1e6);
  assert.deepEqual([w.c.session("odd").capabilities, w.c.session("odd").administer], [[], false]);
  /* expired: null, and the row is removed */
  w.sql.exec(`INSERT INTO sessions (token, role, expires, created) VALUES ('old', 'admin', ?, 'x')`, Date.now() - 1);
  assert.equal(w.c.session("old"), null);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM sessions WHERE token='old'`).n, 0);
});
