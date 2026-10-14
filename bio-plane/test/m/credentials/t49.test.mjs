/* T49 (T49-3; N1072, K3265, K3320, N945, K3329; D2), at the interface: the founder chooses her handle at the claim
   (R74); sign-in and recovery by the founder's handle, `role` no longer read (R75); the founder's own Ask (R76); a
   spent bootstrap credential with no recorded fingerprint reads claimed, and a claim with none is refused (R77). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, FOUNDER_PASSWORD, FOUNDER_HANDLE } from "./fixture.mjs";
import { Credentials } from "../../../src/credentials/index.mjs";
import { viewerPredicate } from "../../../src/membership/index.mjs";

const COUNTS = ["signin_window", "security_counts", "security_pending", "security_key", "sqlite_sequence"];
/* every table but the counts the sign-in window and the tally keep (R38, R44): what an act wrote besides its count */
const unCounted = (w) => JSON.stringify(JSON.parse(w.snapshot()).filter(([t]) => !COUNTS.includes(t)));
const signins = (w) => Number(w.row(`SELECT COALESCE(SUM(count), 0) AS n FROM security_counts WHERE kind='signin'`).n);
const windowN = (w) => Number(w.row(`SELECT COALESCE(SUM(count), 0) AS n FROM signin_window WHERE kind='role'`).n);
const refusedAs = { ok: false, reason: "SIGN_IN_REFUSED", detail: Credentials.LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED };

/* ===== R74: the founder chooses her handle at the claim ===== */

test("R74 a first claim with a free handle sets the password and the handle, answers the handle, and login with that handle succeeds", async () => {
  const w = world();
  const c = await w.c.claim({ password: FOUNDER_PASSWORD, handle: "mara", tokenFp: "fp-1" });
  assert.deepEqual([c.ok, c.role, c.handle], [true, "admin", "mara"]);
  assert.equal(w.m.founderHandle(), "mara", "recorded through membership's R144");
  assert.equal(w.m.sessionRights("admin").handle, "mara");
  const s = await w.c.login({ handle: "mara", password: FOUNDER_PASSWORD });
  assert.deepEqual([s.ok, s.role], [true, "admin"]);
  assert.equal(w.c.session(s.token).handle, "mara", "R5 names it");
});

test("R74 controls: `admin` is HANDLE_TAKEN and a malformed handle BAD_HANDLE, each writing neither password nor handle and each counted under R38", async () => {
  const w = world();
  const before = unCounted(w);
  const arms = [["admin", "HANDLE_TAKEN"],
                ["Bad Handle!", "BAD_HANDLE"], ["ADMIN", "BAD_HANDLE"]];
  for (const [i, [handle, reason]] of arms.entries()) {
    const r = await w.c.claim({ password: FOUNDER_PASSWORD, handle, tokenFp: "fp-1", source: `s${i}` });
    assert.deepEqual([r.ok, r.reason], [false, reason], String(handle));
    assert.equal(unCounted(w), before, `${handle}: nothing written but its count`);
    assert.equal(w.m.founderHandle(), null);
    assert.equal(w.c.claimed(), false, "no password held");
    assert.deepEqual(w.c.bootstrapState("fp-1"), { claimed: false, rearmed: false, consumedAt: null });
    assert.equal(signins(w), i + 1, "each refused claim is R44's `signin`");
    assert.equal(windowN(w), i + 1, "and counts toward R38's window");
  }
});

test("R74 a claim with no handle (absent, null or empty; K3337) sets the password and holds no founder handle; `admin` then signs in (R75's transition) until she chooses one", async () => {
  for (const handle of [undefined, null, ""]) {
    const w = world();
    const c = await w.c.claim({ password: FOUNDER_PASSWORD, handle, tokenFp: "fp-1" });
    assert.deepEqual([c.ok, c.role, c.handle], [true, "admin", null], String(handle));
    assert.equal(w.m.founderHandle(), null);
    assert.equal((await w.c.login({ handle: "admin", password: FOUNDER_PASSWORD })).ok, true);
    assert.equal(w.m.founderHandleSet({ handle: "mara", by: "admin" }).ok, true, "she chooses once, later");
    assert.equal((await w.c.login({ handle: "admin", password: FOUNDER_PASSWORD, source: "x" })).reason, "SIGN_IN_REFUSED");
    assert.equal((await w.c.login({ handle: "mara", password: FOUNDER_PASSWORD })).ok, true);
  }
});

test("R74 control: a member's handle is taken too (membership R16), refused HANDLE_TAKEN on a claim, writing nothing", async () => {
  /* a group claimed before T49 whose founder is re-arming the claim and has chosen no handle: members already exist */
  const w = world();
  await w.c.setPassword({ role: "admin", password: FOUNDER_PASSWORD });
  w.sql.exec(`INSERT INTO bootstrap (id, consumed_at, token_fp) VALUES (1, ?, ?)`, "2026-01-01T00:00:00.000Z", "fp-old");
  assert.equal((await w.enrol("ann")).ok, true);
  const before = unCounted(w);
  const taken = await w.c.claim({ password: "another-passphrase", handle: "ann", tokenFp: "fp-new", source: "s-ann" });
  assert.deepEqual([taken.ok, taken.reason], [false, "HANDLE_TAKEN"]);
  assert.equal(unCounted(w), before);
  assert.equal(w.m.founderHandle(), null);
  assert.equal((await w.c.login({ handle: "admin", password: FOUNDER_PASSWORD })).ok, true, "the old password stands");
});

test("R74 the handle is read after R1's own refusals: a short password or a claimed store answers its own refusal whatever handle is given", async () => {
  const w = world();
  assert.equal((await w.c.claim({ password: "short", handle: "admin", tokenFp: "fp-1" })).reason, "PASSWORD_TOO_SHORT");
  assert.equal((await w.c.claim({ password: "short", tokenFp: "fp-1" })).reason, "PASSWORD_TOO_SHORT");
  assert.equal((await w.c.claim({ password: FOUNDER_PASSWORD, handle: "mara", tokenFp: "fp-1" })).ok, true);
  const again = await w.c.claim({ password: FOUNDER_PASSWORD, handle: "admin", tokenFp: "fp-1" });
  assert.equal(again.reason, "ALREADY_CLAIMED", "answered before the handle is read");
  assert.equal((await w.c.claim({ password: FOUNDER_PASSWORD, tokenFp: "fp-1" })).reason, "ALREADY_CLAIMED");
  assert.equal(w.m.founderHandle(), "mara");
});

test("R74 a re-armed claim with a handle held accepts none or the same handle and answers it; any other is HANDLE_FIXED, writing nothing; with none held one may be chosen", async () => {
  const w = world();
  assert.equal((await w.c.claim({ password: FOUNDER_PASSWORD, handle: "mara", tokenFp: "fp-1" })).ok, true);
  const before = unCounted(w);
  const fixed = await w.c.claim({ password: "another-passphrase", handle: "nora", tokenFp: "fp-2", source: "s1" });
  assert.deepEqual([fixed.ok, fixed.reason], [false, "HANDLE_FIXED"]);
  assert.equal(unCounted(w), before, "neither the password nor the handle nor the fingerprint changed");
  assert.equal(w.m.founderHandle(), "mara");
  assert.equal((await w.c.login({ handle: "mara", password: FOUNDER_PASSWORD })).ok, true, "the old password still stands");
  assert.equal(signins(w), 1, "a refused claim counts");
  const none = await w.c.claim({ password: "another-passphrase", tokenFp: "fp-2", source: "s2" });
  assert.deepEqual([none.ok, none.handle], [true, "mara"], "none named: the handle is kept and answered");
  assert.equal((await w.c.login({ handle: "mara", password: "another-passphrase" })).ok, true);
  assert.equal((await w.c.login({ handle: "mara", password: FOUNDER_PASSWORD })).ok, false, "the re-armed claim replaced the password");
  const same = await w.c.claim({ password: "third-passphrase-x", handle: "mara", tokenFp: "fp-3", source: "s3" });
  assert.deepEqual([same.ok, same.handle], [true, "mara"], "the same handle is accepted");
  /* with the founder's handle never recorded (a store claimed before T49, re-armed) one is required and recorded */
  const old = world();
  await old.c.setPassword({ role: "admin", password: FOUNDER_PASSWORD });
  old.sql.exec(`INSERT INTO bootstrap (id, consumed_at, token_fp) VALUES (1, ?, ?)`, "2026-01-01T00:00:00.000Z", "fp-old");
  assert.deepEqual(old.c.bootstrapState("fp-new"), { claimed: false, rearmed: true, consumedAt: null });
  const chosen = await old.c.claim({ password: "another-passphrase", handle: "olga", tokenFp: "fp-new", source: "o2" });
  assert.deepEqual([chosen.ok, chosen.handle], [true, "olga"]);
});

test("R74 the route: claim takes the handle from the body and the fingerprint from the query only", async () => {
  const w = world();
  const no = await world().ops("fp=fp-1", { password: FOUNDER_PASSWORD, tokenFp: "fp-forged" }).claim();
  assert.deepEqual([no.ok, no.handle], [true, null], "no handle: not refused (K3337)");
  const ok = await w.ops("fp=fp-1", { password: FOUNDER_PASSWORD, handle: "mara", tokenFp: "fp-forged", role: "member:x" }).claim();
  assert.deepEqual([ok.ok, ok.role, ok.handle], [true, "admin", "mara"], "a body's `role` is never read");
  assert.equal(w.c.bootstrapState("fp-1").claimed, true);
  assert.equal(w.c.bootstrapState("fp-forged").rearmed, true);
});

/* ===== R75: signing in by the founder's handle ===== */

async function founded() {
  const w = await world().group("ann");
  return w;
}

test("R75 with a founder handle held, login and recover by it succeed as the founder", async () => {
  const w = await founded();
  const s = await w.c.login({ handle: FOUNDER_HANDLE, password: FOUNDER_PASSWORD });
  assert.deepEqual([s.ok, s.role], [true, "admin"]);
  assert.equal(w.c.session(s.token).rootOfTrust, true);
  const codes = w.c.recoveryCodesIssue({ by: "admin" }).codes;
  const r = await w.c.recover({ handle: FOUNDER_HANDLE, code: codes[0], password: "founder-new-pass" });
  assert.deepEqual(r, { ok: true, role: "admin", remaining: 9 });
  assert.equal((await w.c.login({ handle: FOUNDER_HANDLE, password: "founder-new-pass" })).ok, true);
});

test("R75 controls: `admin` with the founder's right password is SIGN_IN_REFUSED, and with a valid founder code RECOVERY_REFUSED, each as an unknown handle's, whose answer and cost it equals", async () => {
  const w = await founded();
  const codes = w.c.recoveryCodesIssue({ by: "admin" }).codes;
  const unknown = await w.c.login({ handle: "nobody-here", password: FOUNDER_PASSWORD, source: "u1" });
  const admin = await w.c.login({ handle: "admin", password: FOUNDER_PASSWORD, source: "a1" });
  assert.deepEqual(unknown, refusedAs);
  assert.deepEqual(admin, refusedAs);
  const unknownR = await w.c.recover({ handle: "nobody-here", code: codes[0], password: "founder-new-pass", source: "u2" });
  const adminR = await w.c.recover({ handle: "admin", code: codes[0], password: "founder-new-pass", source: "a2" });
  assert.equal(adminR.reason, "RECOVERY_REFUSED");
  assert.deepEqual(adminR, unknownR);
  assert.equal(w.c.recoveryCodesState({ by: "admin" }).remaining, 10, "the code was not spent");
  assert.equal(w.rows(`SELECT * FROM sessions WHERE role='admin'`).length, 0, "no session was issued");
  /* the same cost class: each pays one password derivation */
  const time = async (fn) => { const t0 = performance.now(); await fn(); return performance.now() - t0; };
  const t = [await time(() => w.c.login({ handle: "nobody-here", password: FOUNDER_PASSWORD, source: "t1" })),
             await time(() => w.c.login({ handle: "admin", password: FOUNDER_PASSWORD, source: "t2" })),
             await time(() => w.c.login({ handle: FOUNDER_HANDLE, password: "wrong-passphrase", source: "t3" }))];
  assert.ok(Math.min(...t) > Math.max(...t) / 5, `times differ too much: ${t.map((x) => x.toFixed(1))}`);
});

test("R75 `role` is no longer read: a call naming a role and no handle, no handle at all, an empty one or a non-string is refused, never signed in as the founder", async () => {
  const w = await founded();
  const arms = [{ role: "admin", password: FOUNDER_PASSWORD }, { password: FOUNDER_PASSWORD }, { handle: "", password: FOUNDER_PASSWORD },
                { handle: null, password: FOUNDER_PASSWORD }, { handle: 7, password: FOUNDER_PASSWORD },
                { role: "member:ann", password: PASSWORD("ann") }, { handle: {}, role: "admin", password: FOUNDER_PASSWORD }];
  for (const [i, a] of arms.entries()) assert.deepEqual(await w.c.login({ ...a, source: `n${i}` }), refusedAs, JSON.stringify(a));
  assert.equal(w.rows(`SELECT * FROM sessions`).length, 0, "no session for any of them");
  /* a fresh world: the no-handle role is one bucket of R38's window, shared by login and recover */
  const v = await founded();
  const vcodes = v.c.recoveryCodesIssue({ by: "admin" }).codes;
  const rarms = [{ role: "admin" }, {}, { handle: "" }, { handle: null }, { role: "member:ann", code: "x" }];
  for (const [i, a] of rarms.entries()) {
    const r = await v.c.recover({ code: vcodes[1], password: "founder-new-pass", ...a, source: `r${i}` });
    assert.equal(r.reason, "RECOVERY_REFUSED", JSON.stringify(a));
  }
  assert.equal(v.c.recoveryCodesState({ by: "admin" }).remaining, 10, "no code was spent");
  assert.equal((await w.c.login({ handle: FOUNDER_HANDLE, password: FOUNDER_PASSWORD })).ok, true, "control: her handle signs in");
  assert.equal((await w.c.login({ handle: "ann", password: PASSWORD("ann") })).ok, true, "control: a member's handle too");
});

test("R75 with no founder handle held (a group claimed before T49) `admin` and the password still sign in, and the next `admin` sign-in after founderhandleset is refused", async () => {
  const w = world();
  /* a store claimed before T49: the founder's password is held, her handle never chosen */
  await w.c.setPassword({ role: "admin", password: FOUNDER_PASSWORD });
  w.sql.exec(`INSERT INTO bootstrap (id, consumed_at, token_fp) VALUES (1, ?, ?)`, "2026-01-01T00:00:00.000Z", "fp-old");
  assert.equal(w.m.founderHandle(), null);
  const s = await w.c.login({ handle: "admin", password: FOUNDER_PASSWORD });
  assert.deepEqual([s.ok, s.role], [true, "admin"]);
  const codes = w.c.recoveryCodesIssue({ by: "admin" }).codes;
  assert.equal((await w.c.recover({ handle: "admin", code: codes[0], password: "founder-new-pass" })).ok, true, "recover too");
  assert.equal((await w.c.login({ handle: "admin", password: "founder-new-pass" })).ok, true);
  assert.equal(w.m.founderHandleSet({ handle: "mara", by: "admin" }).ok, true);
  assert.deepEqual(await w.c.login({ handle: "admin", password: "founder-new-pass", source: "after" }), refusedAs);
  assert.equal((await w.c.recover({ handle: "admin", code: codes[1], password: "founder-newer-pass", source: "after" })).reason, "RECOVERY_REFUSED");
  const m = await w.c.login({ handle: "mara", password: "founder-new-pass" });
  assert.deepEqual([m.ok, m.role], [true, "admin"]);
});

test("R75 ten refused `admin` attempts do not pause the founder's own handle: R38 counts every unknown handle under `handle:<as typed>`", async () => {
  const w = await founded();
  for (let i = 0; i < 10; i++) assert.deepEqual(await w.c.login({ handle: "admin", password: "wrong-password-x", source: `adm-${i}` }), refusedAs);
  /* the `admin` handle is now paused (its own bucket); the founder's is not */
  assert.equal((await w.c.login({ handle: "admin", password: FOUNDER_PASSWORD, source: "adm-new" })).reason, "SIGN_IN_PAUSED");
  const s = await w.c.login({ handle: FOUNDER_HANDLE, password: FOUNDER_PASSWORD, source: "founder-home" });
  assert.deepEqual([s.ok, s.role], [true, "admin"]);
  /* the same for each unknown handle: its bucket is its own, keyed by a digest that names neither the handle nor a role */
  const dump = JSON.stringify(w.rows(`SELECT * FROM signin_window`));
  for (const x of ["handle:admin", "admin", "adm-1"]) assert.ok(!dump.includes(x), x);
  for (let i = 0; i < 10; i++) await w.c.recover({ handle: "admin", code: "x", password: "new-passphrase-1", source: `rec-${i}` });
  const codes = w.c.recoveryCodesIssue({ by: "admin" }).codes;
  assert.equal((await w.c.recover({ handle: FOUNDER_HANDLE, code: codes[0], password: "founder-new-pass", source: "rec-ok" })).ok, true);
});

/* ===== R76: the founder's own Ask ===== */

async function withAccount() {
  const w = await founded();
  assert.equal((await w.c.accountReferenceSet({ member: "admin", kind: "apikey", secret: "sk-founder-own", by: "admin" })).ok, true);
  assert.equal((await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann-own", by: "ann" })).ok, true);
  const f = (await w.c.login({ handle: FOUNDER_HANDLE, password: FOUNDER_PASSWORD })).token;
  const a = (await w.c.login({ handle: "ann", password: PASSWORD("ann") })).token;
  return { w, f, a };
}

test("R76 the founder asks under her own live session and is granted, for her own grant; it is read under her id and ends with her session", async () => {
  const { w, f } = await withAccount();
  const g = await w.c.aiGrantMint({ member: "admin", by: "admin", session: f });
  assert.equal(g.ok, true, JSON.stringify(g));
  assert.match(g.token, /^[0-9a-f]{64}$/);
  const held = await w.c.aiGrantHeld({ token: g.token });
  assert.deepEqual([held.ok, held.member], [true, "admin"]);
  assert.equal((await w.c.aiGrantAdmit({ token: g.token, op: "search" })).ok, true);
  assert.equal(w.row(`SELECT member_id FROM ai_grants`).member_id, "admin");
  assert.equal(w.c.signOut({ token: f }).ok, true);
  assert.equal((await w.c.aiGrantHeld({ token: g.token })).reason, "GRANT_NOT_HELD", "it ends with her session (R39)");
});

test("R76 controls: a grant for a member minted under the founder's session is refused NOT_YOUR_ACCOUNT; so is the founder's under a member's session; every other refusal of R27 stands", async () => {
  const { w, f, a } = await withAccount();
  const before = unCounted(w);
  for (const args of [{ member: "ann", by: "ann", session: f }, { member: "ann", by: "admin", session: f },
                      { member: "admin", by: "admin", session: a }, { member: "admin", by: "ann", session: f },
                      { member: "admin", by: "admin", session: "no-such-token" }, { member: "admin", by: "admin", session: null }]) {
    const r = await w.c.aiGrantMint(args);
    assert.equal(r.reason, "NOT_YOUR_ACCOUNT", JSON.stringify(args));
  }
  assert.equal(unCounted(w), before, "nothing minted");
  assert.equal((await w.c.aiGrantMint({ member: "ann", by: "ann", session: a })).ok, true, "control: a member under her own");
  /* the founder is judged as a member is: with her reference removed and no group key, no account serves her */
  assert.equal(w.c.accountReferenceRemove({ member: "admin", by: "admin" }).ok, true);
  assert.equal((await w.c.aiGrantMint({ member: "admin", by: "admin", session: f })).reason, "NO_ACCOUNT");
  /* a machine credential and an unclaimed store are refused as before */
  assert.equal((await w.c.aiGrantMint({ member: "admin", by: "class:ai", session: f })).ok, false);
});

/* ===== R77: a spent bootstrap credential with no recorded fingerprint reads claimed ===== */

test("R77 a store spent with a null fingerprint answers bootstrapState(fp) {claimed: true, rearmed: false} for any fp, and a claim on it is ALREADY_CLAIMED", async () => {
  const w = world();
  await w.c.setPassword({ role: "admin", password: FOUNDER_PASSWORD });
  w.sql.exec(`INSERT INTO bootstrap (id, consumed_at, token_fp) VALUES (1, ?, NULL)`, "2026-01-01T00:00:00.000Z");
  for (const fp of ["fp-1", "fp-2", "", null, undefined, "x".repeat(64)])
    assert.deepEqual(w.c.bootstrapState(fp), { claimed: true, rearmed: false, consumedAt: "2026-01-01T00:00:00.000Z" }, String(fp));
  const r = await w.c.claim({ password: "another-passphrase", handle: "olga", tokenFp: "fp-rotated" });
  assert.deepEqual([r.ok, r.reason], [false, "ALREADY_CLAIMED"]);
  assert.equal(w.m.founderHandle(), null, "nothing was recorded");
  assert.equal((await w.c.login({ handle: "admin", password: FOUNDER_PASSWORD })).ok, true, "the founder's password stands");
  /* a store from before `token_fp` (the column absent) reads the same */
  w.sql.exec(`UPDATE bootstrap SET token_fp=''`);
  assert.deepEqual(w.c.bootstrapState("fp-2"), { claimed: true, rearmed: false, consumedAt: "2026-01-01T00:00:00.000Z" });
});

test("R77 controls: a store spent with fingerprint A re-arms for B and stays claimed for A; a claim with no tokenFp succeeds and then reads claimed for any fp", async () => {
  const w = world();
  assert.equal((await w.c.claim({ password: FOUNDER_PASSWORD, handle: "mara", tokenFp: "A" })).ok, true);
  assert.deepEqual(w.c.bootstrapState("A"), { claimed: true, rearmed: false, consumedAt: w.c.bootstrapState("A").consumedAt });
  assert.deepEqual(w.c.bootstrapState("B"), { claimed: false, rearmed: true, consumedAt: null });
  assert.deepEqual(w.c.bootstrapState(null).rearmed, false, "none presented: not re-armed");
  assert.equal((await w.c.claim({ password: "another-passphrase", handle: "mara", tokenFp: "A", source: "s1" })).reason, "ALREADY_CLAIMED");
  assert.equal((await w.c.claim({ password: "another-passphrase", handle: "mara", tokenFp: "B", source: "s2" })).ok, true, "B re-arms");
  /* no fingerprint (K3337): the claim is not refused; it records none, and so reads claimed for any fingerprint */
  for (const tokenFp of [undefined, null, ""]) {
    const u = world();
    const r = await u.c.claim({ password: FOUNDER_PASSWORD, handle: "mara", tokenFp });
    assert.equal(r.ok, true, String(tokenFp));
    for (const fp of ["A", "B", null]) assert.deepEqual([u.c.bootstrapState(fp).claimed, u.c.bootstrapState(fp).rearmed], [true, false]);
    assert.equal((await u.c.claim({ password: "another-passphrase", handle: "mara", tokenFp: "B" })).reason, "ALREADY_CLAIMED");
  }
});

test("R76 the founder's Ask reads her own project: the grant's viewer `member:admin` is folded to the founder by membership's viewer predicate, so a project she owns is in sight", async () => {
  const { w, f } = await withAccount();
  w.project("p-hers", "admin", "hidden");
  const g = await w.c.aiGrantMint({ member: "admin", by: "admin", session: f });
  const held = await w.c.aiGrantHeld({ token: g.token });
  assert.equal(held.viewer, "member:admin");
  const pred = viewerPredicate(held.viewer);
  assert.notEqual(pred.scope, "DENY");
  const seen = w.rows(`SELECT b.bundle_id AS id FROM bundles b WHERE ${pred.sql} AND b.object_type='project'`, ...pred.args).map((r) => r.id);
  assert.ok(seen.includes("p-hers"), "her own project is read under her grant");
});
