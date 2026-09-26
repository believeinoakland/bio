import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { Membership } from "../../../src/membership/index.mjs";

test("R1 claim sets the founder's password once; too short refused; a replaced bootstrap credential re-arms", async () => {
  const w = world();
  assert.equal((await w.m.claim({ password: "short", tokenFp: "fp-1" })).reason, "PASSWORD_TOO_SHORT");
  assert.equal((await w.m.claim({ password: "x".repeat(11), tokenFp: "fp-1" })).reason, "PASSWORD_TOO_SHORT");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM credentials`).n, 0);
  const ok = await w.m.claim({ password: "x".repeat(12), tokenFp: "fp-1" });
  assert.equal(ok.ok, true);
  const again = await w.m.claim({ password: "y".repeat(12), tokenFp: "fp-1" });
  assert.equal(again.reason, "ALREADY_CLAIMED");
  assert.equal((await w.m.login({ role: "admin", password: "x".repeat(12) })).ok, true);
  const rearmed = await w.m.claim({ password: "z".repeat(12), tokenFp: "fp-2" });
  assert.equal(rearmed.ok, true);
  assert.equal((await w.m.login({ role: "admin", password: "z".repeat(12) })).ok, true);
});

test("R2 login: one refusal for every failing case, same detail; success returns token and expiry", async () => {
  const w = await world().group("ann", "bob");
  const ok = await w.m.login({ role: "member:ann", password: "ann-passphrase-x", ttlSeconds: 60 });
  assert.equal(ok.ok, true);
  assert.match(ok.token, /^[0-9a-f]{64}$/);
  assert.ok(ok.expires > Date.now() && ok.expires <= Date.now() + 60_000);
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  const cases = [
    { role: "member:nobody", password: "whatever-password" },          // no credential
    { role: "member:bob", password: "bob-passphrase-x" },              // inactive member, right password
    { role: "member:ann", password: "wrong-password-1" },              // wrong password
    { role: "never-registered", password: "whatever-password" },
  ];
  const answers = [];
  for (const c of cases) answers.push(await w.m.login(c));
  for (const a of answers) {
    assert.equal(a.ok, false);
    assert.equal(a.reason, "SIGN_IN_REFUSED");
    assert.equal(a.detail, Membership.LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED);
    assert.deepEqual(Object.keys(a).sort(), ["detail", "ok", "reason"]);
  }
  // the same cost: every refusal derives a PBKDF2 key, so none answers in a fraction of the others' time
  const time = async (c) => { const t0 = performance.now(); await w.m.login(c); return performance.now() - t0; };
  const t = [];
  for (const c of cases) t.push(await time(c));
  assert.ok(Math.min(...t) > Math.max(...t) / 5, `refusal times differ too much: ${t.map((x) => x.toFixed(1))}`);
});

test("R3 session resolves rights at each call: founder, administrator, member, revoked, unknown, expired", async () => {
  const w = await world().group("ann");
  const tok = async (role, password) => (await w.m.login({ role, password })).token;
  assert.equal(w.m.session(null), null);
  assert.equal(w.m.session("no-such-token"), null);
  const f = w.m.session(await tok("admin", "founder-passphrase-1"));
  assert.deepEqual({ ...f, expires: 0 }, { role: "admin", expires: 0, capabilities: [...Membership.CAPABILITIES],
    administer: true, member: "admin", handle: null, rootOfTrust: true });
  const sTok = await tok("member:second", "second-passphrase-x");
  const s = w.m.session(sTok);
  assert.deepEqual([s.capabilities, s.administer, s.member, s.handle, s.rootOfTrust],
    [[...Membership.CAPABILITIES], true, "second", "second", false]);
  const aTok = await tok("member:ann", "ann-passphrase-x");
  assert.deepEqual(w.m.session(aTok).capabilities, ["contribute"]);
  w.m.memberCaps({ memberId: "ann", capabilities: ["contribute", "publish"], by: "admin" });
  assert.deepEqual(w.m.session(aTok).capabilities, ["contribute", "publish"], "a change takes effect at the next call");
  assert.equal(w.m.session(aTok).administer, false);
  // an inactive member holds none (the row flipped without the session delete, the race R3 covers)
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='ann'`);
  assert.deepEqual([w.m.session(aTok).capabilities, w.m.session(aTok).administer], [[], false]);
  // an unrecognised role holds none
  w.sql.exec(`INSERT INTO sessions (token, role, expires, created) VALUES ('odd', 'class:probe', ?, 'x')`, Date.now() + 1e6);
  assert.deepEqual(w.m.session("odd").capabilities, []);
  // expired
  w.sql.exec(`INSERT INTO sessions (token, role, expires, created) VALUES ('old', 'admin', ?, 'x')`, Date.now() - 1);
  assert.equal(w.m.session("old"), null);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM sessions WHERE token='old'`).n, 0);
});

test("R4 the capability vocabulary is exactly contribute, publish, create_projects; administer is not in it", () => {
  assert.deepEqual(Membership.CAPABILITIES, ["contribute", "publish", "create_projects"]);
  assert.ok(!Membership.CAPABILITIES.includes("administer"));
});

test("R5 adminMath and adminArithmetic", async () => {
  for (let n = 0; n <= 12; n++) {
    const need = Math.floor(n / 2) + 1, elig = Math.max(0, n - 1);
    assert.deepEqual(Membership.adminMath(n), { administrators: n, votesNeeded: need, eligibleVoters: elig,
      possible: need <= elig });
  }
  const w = await world().group();
  const a = w.m.adminArithmetic();
  assert.deepEqual(a.table, [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => Membership.adminMath(n)));
  assert.deepEqual(a.live, Membership.adminMath(2));
});

test("R72 bootstrapState: claimed, re-armed by a different fingerprint, the claim instant, nobody named", async () => {
  const w = world();
  assert.deepEqual(w.m.bootstrapState("fp-1"), { claimed: false, rearmed: false, consumedAt: null });
  const c = await w.m.claim({ password: "x".repeat(12), tokenFp: "fp-1" });
  assert.deepEqual(w.m.bootstrapState("fp-1"), { claimed: true, rearmed: false, consumedAt: c.consumedAt });
  assert.deepEqual(w.m.bootstrapState(null), { claimed: true, rearmed: false, consumedAt: c.consumedAt });
  assert.deepEqual(w.m.bootstrapState("fp-2"), { claimed: false, rearmed: true, consumedAt: null });
  assert.doesNotMatch(JSON.stringify(w.m.bootstrapState("fp-1")), /admin|x{12}/);
  const op = w.ops("fp=fp-1").bootstrap();
  assert.equal(op.claimed, true);
  assert.equal(op.storeVersion, "test-build");
});

test("R73 setPassword stores a salted derived hash, replacing any earlier one, never the password", async () => {
  const w = world();
  await w.m.setPassword({ role: "member:x", password: "first-password-1" });
  const a = w.row(`SELECT * FROM credentials WHERE role='member:x'`);
  await w.m.setPassword({ role: "member:x", password: "second-password-2" });
  const b = w.row(`SELECT * FROM credentials WHERE role='member:x'`);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM credentials`).n, 1);
  assert.notEqual(a.salt, b.salt);
  assert.match(b.hash, /^[0-9a-f]{64}$/);
  assert.doesNotMatch(JSON.stringify(w.rows(`SELECT * FROM credentials`)), /password/);
  w.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, created, updated) VALUES ('x','c','x','member','active','t','t')`);
  assert.equal((await w.m.login({ role: "member:x", password: "first-password-1" })).ok, false);
  assert.equal((await w.m.login({ role: "member:x", password: "second-password-2" })).ok, true);
});
