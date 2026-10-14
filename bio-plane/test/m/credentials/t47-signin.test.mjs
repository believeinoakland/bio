/* T47 (T47-81; Bob K3060 D4, D10, K3061 D3, K3069; K3070, K3076), at the interface: sessions by device and inactivity,
   the lock and `unlock` (R65); the password asked again and REAUTH_DUE (R66); sign-in by handle (R67); every member's
   recovery codes (R68); the administrator's reset link (R69); the held sign-in token (R70); and R71's clarifications.
   Each limit is tested at a fake clock, one second either side. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, FOUNDER_PASSWORD, SIGNIN_TOKEN, sha } from "./fixture.mjs";
import { ACCOUNT_CHECKS, SIGN_IN_CHECKS, Credentials, SESSION_DEVICES, SESSION_LIMITS, REAUTH_WINDOW_MS, RESET_LINK_DAYS }
  from "../../../src/credentials/index.mjs";
import { notAnAdmin } from "../../../src/membership/index.mjs";

/* Date.now moved for the length of `fn`. */
const at = async (ms, fn) => { const real = Date.now; Date.now = () => ms; try { return await fn(); } finally { Date.now = real; } };
const S = 1000;
const T0 = Date.parse("2026-10-13T08:00:00Z");
const refused = { ok: false, reason: "SIGN_IN_REFUSED", detail: Credentials.LOGIN_REFUSAL_DETAIL.SIGN_IN_REFUSED };
const row = (code) => [false, code, ACCOUNT_CHECKS[code].check, ACCOUNT_CHECKS[code].translation];
const said = (r) => [r.ok, r.code, r.check, r.translation];
const windowCount = (w) => w.row(`SELECT COALESCE(SUM(count), 0) AS n FROM signin_window`).n;

/* ann signs in on `device` at T0. */
async function signedIn(device, extra = {}) {
  const w = await world().group("ann", "bob");
  const s = await at(T0, () => w.c.login({ role: "member:ann", password: PASSWORD("ann"), device, ...extra }));
  assert.equal(s.ok, true);
  return { w, token: s.token, s };
}

/* ===== R65: sessions by device and inactivity ===== */

test("R65 login takes device own or shared (absent or anything else: shared), recorded on the session and answered; an own session is capped 30 days after its sign-in, a shared one by R4's ttlSeconds (R71 (7))", async () => {
  assert.deepEqual(SESSION_DEVICES, ["own", "shared"]);
  assert.ok(Object.isFrozen(SESSION_DEVICES) && Object.isFrozen(SESSION_LIMITS));
  assert.deepEqual(SESSION_LIMITS, { sharedIdle: 15 * 60 * S, ownLock: 30 * 60 * S, ownEndAfterLock: 12 * 3600 * S,
                                     ownMax: 30 * 24 * 3600 * S });
  const w = await world().group("ann");
  for (const [device, want] of [["own", "own"], ["shared", "shared"], [undefined, "shared"], ["OWN", "shared"], [7, "shared"]]) {
    const s = await at(T0, () => w.c.login({ role: "member:ann", password: PASSWORD("ann"), device }));
    assert.equal(s.device, want, String(device));
    assert.equal(w.row(`SELECT device FROM sessions WHERE token_sha=?`, sha(s.token)).device, want);
    assert.equal(s.expires, T0 + (want === "own" ? SESSION_LIMITS.ownMax : 43200 * S), "R4's 12 hours for shared");
    assert.equal((await at(T0, () => w.c.session(s.token))).device, want);
  }
  const short = await at(T0, () => w.c.login({ role: "member:ann", password: PASSWORD("ann"), ttlSeconds: 60 }));
  assert.equal(short.expires, T0 + 60 * S, "R71 (7): a shared session keeps ttlSeconds' cap");
});

test("R65 a shared session ends after 15 minutes without activity, one second either side; control: activity resets the idle count", async () => {
  const { w, token } = await signedIn("shared");
  const L = SESSION_LIMITS.sharedIdle;
  assert.equal((await at(T0 + L - S, () => w.c.session(token))).locked, false, "live just before");
  /* activity at T0 + L - S: counted from there */
  assert.equal((await at(T0 + 2 * L - 2 * S, () => w.c.session(token))).role, "member:ann", "control: activity reset it");
  assert.equal(await at(T0 + 3 * L - S, () => w.c.session(token)), null, "ended just after 15 idle minutes");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM sessions WHERE token_sha=?`, sha(token)).n, 0, "and ended");
  /* a shared session never locks: no activity at all, one second past the limit */
  const { w: v, token: t2 } = await signedIn(undefined);
  assert.equal(await at(T0 + L + S, () => v.c.session(t2)), null);
});

test("R65 an own session locks after 30 minutes without activity and ends 12 hours after it locked, one second either side; a locked session holds no capability and its reads are no activity; control: activity before the lock resets the count", async () => {
  const { w, token } = await signedIn("own");
  const { ownLock: L, ownEndAfterLock: E } = SESSION_LIMITS;
  const before = await at(T0 + L - S, () => w.c.session(token));
  assert.deepEqual([before.locked, before.capabilities, before.administer], [false, ["contribute"], false]);
  /* control: that read was activity, so the lock comes 30 minutes after it */
  assert.equal((await at(T0 + 2 * L - 2 * S, () => w.c.session(token))).locked, false);
  const last = T0 + 2 * L - 2 * S;
  const locked = await at(last + L + S, () => w.c.session(token));
  assert.deepEqual([locked.locked, locked.capabilities, locked.administer, locked.rootOfTrust, locked.member, locked.role],
    [true, [], false, false, "ann", "member:ann"], "R71 (1): locked, no capability");
  /* reads while locked are no activity: the end stays 12 hours after the lock */
  assert.equal((await at(last + L + E - S, () => w.c.session(token))).locked, true, "still locked just before the end");
  assert.equal(await at(last + L + E + S, () => w.c.session(token)), null, "ended 12 hours after it locked");
});

test("R65 an own session ends 30 days after its sign-in whatever its activity, one second either side", async () => {
  const { w, token } = await signedIn("own");
  const M = SESSION_LIMITS.ownMax;
  /* active throughout: a read every 20 minutes up to the cap */
  for (let t = T0; t < T0 + M - 20 * 60 * S; t += 20 * 60 * S * 36) w.sql.exec(`UPDATE sessions SET last_active=?`, t);
  w.sql.exec(`UPDATE sessions SET last_active=?`, T0 + M - 60 * S);
  assert.equal((await at(T0 + M - S, () => w.c.session(token))).locked, false);
  assert.equal(await at(T0 + M + S, () => w.c.session(token)), null);
});

test("R65 a request marked background is no activity; the session route reads background=1 (R71 (7))", async () => {
  const { w, token } = await signedIn("shared");
  const L = SESSION_LIMITS.sharedIdle;
  await at(T0 + L - S, () => w.c.session(token, { background: true }));
  await at(T0 + L - S, () => w.ops(`t=${token}&background=1`).session());
  assert.equal(await at(T0 + L + S, () => w.c.session(token)), null, "background reads kept nothing alive");
  const { w: v, token: t2 } = await signedIn("shared");
  await at(T0 + L - S, () => v.ops(`t=${t2}`).session());
  assert.equal((await at(T0 + L + S, () => v.c.session(t2))).locked, false, "control: the same read, not background, is activity");
});

test("R65 R71 a locked session serves only unlock and sign-out: another act answers SESSION_LOCKED (C-29.43) through sessionLockedRefusal, writing nothing; control: unlocked, the act is served", async () => {
  const { w, token } = await signedIn("own");
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  const late = T0 + SESSION_LIMITS.ownLock + S;
  assert.deepEqual(said(Credentials.sessionLockedRefusal()), row("SESSION_LOCKED"));
  const before = w.snapshot();
  assert.deepEqual(said(await at(late, () => w.c.passwordChange({ current: PASSWORD("ann"), password: "another-passphrase",
    by: "ann", session: token }))), row("SESSION_LOCKED"));
  assert.deepEqual(said(await at(late, () => w.c.aiGrantMint({ member: "ann", by: "ann", session: token }))), row("SESSION_LOCKED"));
  assert.equal(w.snapshot(), before, "writing nothing");
  assert.equal((await at(late, () => w.c.unlock({ token, password: PASSWORD("ann") }))).ok, true);
  assert.equal((await at(late, () => w.c.aiGrantMint({ member: "ann", by: "ann", session: token }))).ok, true, "control");
  /* sign-out is served on a locked session */
  const { w: v, token: t2 } = await signedIn("own");
  assert.deepEqual(await at(late, () => v.c.signOut({ token: t2 })), { ok: true, ended: 1 });
});

test("R65 R71 an ask's grant is not admitted while its session is locked, and again once it is unlocked", async () => {
  const { w, token } = await signedIn("own");
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  const g = await at(T0, () => w.c.aiGrantMint({ member: "ann", by: "ann", session: token }));
  const late = T0 + SESSION_LIMITS.ownLock + S;
  w.sql.exec(`UPDATE ai_grants SET expires=?`, late + 3600 * S);
  assert.equal((await at(late, () => w.c.aiGrantHeld({ token: g.token }))).reason, "GRANT_NOT_HELD");
  await at(late, () => w.c.unlock({ token, password: PASSWORD("ann") }));
  assert.equal((await at(late, () => w.c.aiGrantHeld({ token: g.token }))).ok, true);
});

test("R65 unlock clears the lock with the session's password, under R38's window, compared as R41; a wrong password answers SIGN_IN_REFUSED, counted, and leaves it locked; an unknown token NOT_SIGNED_IN", async () => {
  const { w, token } = await signedIn("own");
  const late = T0 + SESSION_LIMITS.ownLock + S;
  const n0 = windowCount(w);
  assert.deepEqual(await at(late, () => w.c.unlock({ token, password: "wrong-passphrase" })), refused);
  assert.equal(windowCount(w), n0 + 2, "counted per source and per role (R38)");
  assert.equal((await at(late, () => w.c.session(token))).locked, true, "left locked");
  for (const t of ["nope", null, ""])
    assert.equal((await at(late, () => w.c.unlock({ token: t, password: PASSWORD("ann") }))).reason, "NOT_SIGNED_IN", String(t));
  assert.deepEqual(await at(late, () => w.c.unlock({ token, password: PASSWORD("ann") })), { ok: true, role: "member:ann", locked: false });
  const s = await at(late + S, () => w.c.session(token));
  assert.deepEqual([s.locked, s.capabilities], [false, ["contribute"]], "unlocked, place kept");
  /* paused: one answer, nothing judged */
  const { w: v, token: t2 } = await signedIn("own");
  for (let i = 0; i < 10; i++) await at(late, () => v.c.unlock({ token: t2, password: "wrong", source: "fp" }));
  assert.equal((await at(late, () => v.c.unlock({ token: t2, password: PASSWORD("ann"), source: "fp" }))).reason, "SIGN_IN_PAUSED");
  /* the route: the stamped session, the password from the body */
  const { w: u, token: t3 } = await signedIn("own");
  assert.equal((await at(late, () => u.ops(`session=${t3}&password=wrong`, { password: PASSWORD("ann") }).unlock())).ok, true);
});

/* ===== R66: the password asked again ===== */

test("R66 R71 reauth opens a 5-minute window that session answers as reauthUntil; reauthDue answers null inside it and REAUTH_DUE (C-29.42) outside, one second either side, a locked or unknown session included; control: an act not named is unaffected", async () => {
  assert.equal(REAUTH_WINDOW_MS, 5 * 60 * S);
  const { w, token } = await signedIn("own");
  assert.equal((await at(T0, () => w.c.session(token))).reauthUntil, null);
  assert.deepEqual(said(await at(T0, () => w.c.reauthDue({ token }))), row("REAUTH_DUE"), "none opened");
  assert.deepEqual(await at(T0, () => w.c.reauth({ token, password: "wrong-passphrase" })), refused, "a wrong password");
  assert.deepEqual(said(await at(T0, () => w.c.reauthDue({ token }))), row("REAUTH_DUE"));
  const r = await at(T0, () => w.c.reauth({ token, password: PASSWORD("ann") }));
  assert.deepEqual(r, { ok: true, role: "member:ann", locked: false, reauthUntil: T0 + REAUTH_WINDOW_MS });
  assert.equal((await at(T0 + S, () => w.c.session(token))).reauthUntil, T0 + REAUTH_WINDOW_MS);
  assert.equal(await at(T0 + REAUTH_WINDOW_MS - S, () => w.c.reauthDue({ token })), null, "inside");
  assert.deepEqual(said(await at(T0 + REAUTH_WINDOW_MS + S, () => w.c.reauthDue({ token }))), row("REAUTH_DUE"), "outside");
  assert.equal((await at(T0 + REAUTH_WINDOW_MS + S, () => w.c.session(token))).reauthUntil, null);
  for (const t of ["nope", null, ""]) assert.equal(w.c.reauthDue({ token: t }).code, "REAUTH_DUE", String(t));
  /* control: an act not named (sign-out everywhere) needs no window */
  assert.equal((await at(T0 + REAUTH_WINDOW_MS + 2 * S, () => w.c.signOutEverywhere({ token }))).ok, true);
});

test("R66 R71 reauth on a locked session also clears the lock; a locked session's reauthDue is REAUTH_DUE; the route acts on the stamped session", async () => {
  const { w, token } = await signedIn("own");
  const late = T0 + SESSION_LIMITS.ownLock + S;
  w.sql.exec(`UPDATE sessions SET reauth_until=?`, late + 60 * S);
  assert.equal((await at(late, () => w.c.reauthDue({ token }))).code, "REAUTH_DUE", "locked");
  const r = await at(late, () => w.ops(`session=${token}`, { password: PASSWORD("ann") }).reauth());
  assert.deepEqual([r.ok, r.locked, r.reauthUntil], [true, false, late + REAUTH_WINDOW_MS]);
  assert.equal(await at(late + S, () => w.c.reauthDue({ token })), null);
  assert.equal((await at(late + S, () => w.c.session(token))).locked, false);
});

/* ===== R67: sign-in by handle ===== */

/* hana's member id is h1; her handle is hana. */
async function handleWorld() {
  const w = await world().group("ann", "rev");
  const a = await w.m.memberAdd({ memberId: "h1", cover: "c", by: "admin" });
  assert.equal((await w.m.enroll({ invite: a.invite, handle: "hana", password: PASSWORD("hana") })).ok, true);
  await w.c.setPassword({ role: "member:h1", password: PASSWORD("hana") });
  w.m.memberSet({ memberId: "rev", status: "revoked", by: "admin" });
  return w;
}

test("R67 login takes a handle, resolved through membership.memberByHandle; the handle admin is the founder's; control: the right handle and password sign in", async () => {
  const w = await handleWorld();
  const s = await w.c.login({ handle: "hana", password: PASSWORD("hana") });
  assert.deepEqual([s.ok, s.role], [true, "member:h1"]);
  assert.equal(w.c.session(s.token).handle, "hana");
  const f = await w.c.login({ handle: "admin", password: FOUNDER_PASSWORD });
  assert.deepEqual([f.ok, f.role], [true, "admin"]);
  assert.equal(w.c.session(f.token).rootOfTrust, true);
  /* a handle wins over a role in the same call */
  assert.equal((await w.c.login({ handle: "hana", role: "admin", password: PASSWORD("hana") })).role, "member:h1");
  /* the route passes the body's handle */
  assert.equal((await w.ops("", { handle: "hana", password: PASSWORD("hana"), device: "own" }).login()).device, "own");
});

test("R67 every refusal arm by handle (no such handle, a revoked member, a wrong password) answers the one SIGN_IN_REFUSED at one cost; paused answers one SIGN_IN_PAUSED for a handle held or not", async () => {
  const w = await handleWorld();
  const arms = [{ handle: "nobody-here", password: PASSWORD("hana") }, { handle: "rev", password: PASSWORD("rev") },
                { handle: "hana", password: "wrong-passphrase" }, { handle: "admin", password: "wrong-passphrase" }];
  const times = [];
  for (const [i, a] of arms.entries()) {
    const t = performance.now();
    assert.deepEqual(await w.c.login({ ...a, source: `s${i}` }), refused, a.handle);
    times.push(performance.now() - t);
  }
  assert.ok(Math.max(...times) < 5 * Math.min(...times), `one cost: ${times.map((x) => x.toFixed(1))}`);
  const paused = [];
  for (const h of ["hana", "nobody-here"]) {
    for (let i = 0; i < 10; i++) await w.c.login({ handle: h, password: "wrong-passphrase", source: `p-${h}-${i}` });
    paused.push(await w.c.login({ handle: h, password: PASSWORD("hana"), source: `q-${h}` }));
  }
  assert.deepEqual(paused[0], paused[1]);
  assert.equal(paused[0].reason, "SIGN_IN_PAUSED");
});

test("R67 recover takes a handle as login does: the member's codes recover by her handle; an unknown handle is the one RECOVERY_REFUSED", async () => {
  const w = await handleWorld();
  const codes = w.c.recoveryCodesIssue({ by: "h1" }).codes;
  const no = await w.c.recover({ handle: "nobody-here", code: codes[0], password: "new-passphrase-1" });
  assert.equal(no.reason, "RECOVERY_REFUSED");
  assert.deepEqual(await w.c.recover({ handle: "hana", code: codes[0], password: "new-passphrase-1" }),
    { ok: true, role: "member:h1", remaining: 9 });
  assert.equal((await w.c.login({ handle: "hana", password: "new-passphrase-1" })).ok, true);
});

/* ===== R68: recovery codes for every member ===== */

test("R68 any active member issues their own ten codes and recovers with one: a new password, every other session of hers ended, the code spent; issuing again spends the earlier; control: a revoked member's code is refused", async () => {
  const w = await world().group("ann", "bob");
  const first = w.c.recoveryCodesIssue({ by: "ann" });
  assert.equal(first.codes.length, 10);
  const codes = w.c.recoveryCodesIssue({ by: "member:ann" }).codes;
  assert.equal((await w.c.recover({ role: "member:ann", code: first.codes[0], password: "new-passphrase-1" })).reason,
    "RECOVERY_REFUSED", "the earlier issue spent");
  const sA = (await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token;
  const sB = (await w.c.login({ role: "member:bob", password: PASSWORD("bob") })).token;
  assert.deepEqual(await w.c.recover({ role: "member:ann", code: codes[0], password: "new-passphrase-1" }),
    { ok: true, role: "member:ann", remaining: 9 });
  assert.equal(w.c.session(sA), null, "her sessions ended");
  assert.equal(w.c.session(sB).role, "member:bob", "another's stand");
  assert.equal((await w.c.recover({ role: "member:ann", code: codes[0], password: "new-passphrase-2" })).reason,
    "RECOVERY_REFUSED", "spent");
  assert.equal((await w.c.login({ role: "member:ann", password: "new-passphrase-1" })).ok, true);
  /* control: revoked, her codes die (R16) and a code she kept is refused */
  const bobs = w.c.recoveryCodesIssue({ by: "bob" }).codes;
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.equal((await w.c.recover({ role: "member:bob", code: bobs[0], password: "new-passphrase-1" })).reason, "RECOVERY_REFUSED");
});

test("R68 R71 recoveryCodesIssue by anyone but an active member or the claimed founder is RECOVERY_CODES_NOT_A_MEMBER (C-96.53), issuing nothing; RECOVERY_REFUSED says member; control: the founder issues", async () => {
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const before = w.snapshot();
  for (const by of ["dee", "ghost", "class:admin", "token:ai", null, ""]) {
    const r = w.c.recoveryCodesIssue({ by });
    assert.deepEqual([r.ok, r.code, r.check, r.translation], [false, "RECOVERY_CODES_NOT_A_MEMBER", "C-96.53",
      SIGN_IN_CHECKS.RECOVERY_CODES_NOT_A_MEMBER.translation], String(by));
  }
  assert.equal(w.snapshot(), before);
  assert.match(SIGN_IN_CHECKS.RECOVERY_REFUSED.translation, /member/);
  assert.doesNotMatch(SIGN_IN_CHECKS.RECOVERY_REFUSED.translation, /administrator it was given to/);
  assert.equal(w.c.recoveryCodesIssue({ by: "admin" }).ok, true, "control: the founder");
  const unclaimed = world();
  assert.equal(unclaimed.c.recoveryCodesIssue({ by: "admin" }).code, "RECOVERY_CODES_NOT_A_MEMBER", "before the claim, no founder");
});

/* ===== R69: the administrator's reset link ===== */

test("R69 R71 passwordResetLinkMake: an administrator's act for an active member, answered once, kept only as its digest; a non-administrator NOT_AN_ADMIN, a member not active RESET_LINK_MEMBER_NOT_ACTIVE (C-29.47), each writing nothing", async () => {
  assert.equal(RESET_LINK_DAYS, 7);
  const w = await world().group("ann", "bob", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const before = w.snapshot();
  for (const by of ["ann", "class:admin", null, "dee"])
    assert.deepEqual(w.c.passwordResetLinkMake({ member: "bob", by }), notAnAdmin(by, "making a password reset link"), String(by));
  for (const member of ["dee", "ghost", "admin", null, "class:ai"])
    assert.deepEqual(said(w.c.passwordResetLinkMake({ member, by: "second" })), row("RESET_LINK_MEMBER_NOT_ACTIVE"), String(member));
  assert.equal(w.snapshot(), before, "writing nothing");
  const r = await at(T0, () => w.c.passwordResetLinkMake({ member: "member:bob", by: "second" }));
  assert.deepEqual(Object.keys(r).sort(), ["expiresAt", "link", "member", "ok"]);
  assert.deepEqual([r.ok, r.member, r.expiresAt], [true, "bob", new Date(T0 + 7 * 86400 * S).toISOString().replace(/\.\d+Z$/, "Z")]);
  assert.match(r.link, /^rl-[0-9a-f]{64}$/);
  assert.ok(!w.snapshot().includes(r.link) && !w.snapshot().includes(r.link.slice(3)), "never stored in clear");
  const stored = w.row(`SELECT * FROM password_reset_links`);
  assert.deepEqual([stored.link_sha, stored.member_id, stored.made_by], [sha(r.link), "bob", "second"], "who made it and when");
  assert.ok(stored.made_at);
  /* the route: the stamp, the member from the body */
  assert.equal(w.ops("by=second", { member: "ann" }).passwordresetlink().member, "ann");
  assert.equal(w.ops("by=ann", { member: "bob", by: "second" }).passwordresetlink().reason, "NOT_AN_ADMIN");
});

test("R69 R71 passwordResetLook answers a live link {live, handle, expiresAt} and one RESET_LINK_DEAD (C-29.46) for every dead arm: unknown, expired (one second either side), spent, ended by a newer link, ended by revocation", async () => {
  const w = await world().group("ann", "bob");
  const one = await at(T0, () => w.c.passwordResetLinkMake({ member: "bob", by: "admin" }));
  const D = RESET_LINK_DAYS * 86400 * S;
  assert.deepEqual(await at(T0 + D - S, () => w.c.passwordResetLook({ link: one.link })),
    { ok: true, live: true, handle: "bob", expiresAt: one.expiresAt });
  const dead = [];
  dead.push(await at(T0 + D + S, () => w.c.passwordResetLook({ link: one.link })));   /* expired */
  for (const link of ["rl-nope", "", null, 7]) dead.push(w.c.passwordResetLook({ link }));   /* unknown */
  const two = w.c.passwordResetLinkMake({ member: "bob", by: "admin" });
  dead.push(w.c.passwordResetLook({ link: one.link }));   /* ended by a newer one (and expired: still one answer) */
  const three = w.c.passwordResetLinkMake({ member: "bob", by: "admin" });
  dead.push(w.c.passwordResetLook({ link: two.link }));   /* ended by a newer one */
  assert.equal((await w.c.passwordReset({ link: three.link, password: "new-passphrase-1" })).ok, true);
  dead.push(w.c.passwordResetLook({ link: three.link }));   /* spent */
  const four = w.c.passwordResetLinkMake({ member: "ann", by: "admin" });
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  dead.push(w.c.passwordResetLook({ link: four.link }));   /* ended by revocation (R16) */
  for (const d of dead) assert.deepEqual(d, dead[0]);
  assert.deepEqual(said(dead[0]), row("RESET_LINK_DEAD"));
  /* public, the link from the body only */
  const five = w.c.passwordResetLinkMake({ member: "bob", by: "admin" });
  assert.equal(w.ops("", { link: five.link }).passwordresetlook().live, true);
  assert.equal(w.ops(`link=${five.link}`).passwordresetlook().code, "RESET_LINK_DEAD", "never the query");
});

test("R69 passwordReset sets the password as R3 does, ends every session of that member, spends the link and records it; reuse refused RESET_LINK_DEAD, counted under R38; 12 characters or more; control: another member's sessions stay", async () => {
  const w = await world().group("ann", "bob");
  const link = w.c.passwordResetLinkMake({ member: "bob", by: "second" }).link;
  const sB = (await w.c.login({ role: "member:bob", password: PASSWORD("bob") })).token;
  const sA = (await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token;
  assert.deepEqual(await w.c.passwordReset({ link, password: "short" }), { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 });
  assert.equal(w.c.passwordResetLook({ link }).live, true, "a short password spends nothing");
  assert.deepEqual(await w.c.passwordReset({ link, password: "bobs-new-passphrase" }), { ok: true, member: "bob", ended: 1 });
  assert.equal(w.c.session(sB), null, "his sessions ended");
  assert.equal(w.c.session(sA).role, "member:ann", "control: another's stand");
  assert.equal((await w.c.login({ role: "member:bob", password: "bobs-new-passphrase" })).ok, true);
  assert.deepEqual(await w.c.login({ role: "member:bob", password: PASSWORD("bob") }), refused, "the old one no more");
  assert.ok(w.row(`SELECT spent_at FROM password_reset_links`).spent_at, "spent, recorded");
  const n0 = windowCount(w);
  assert.deepEqual(said(await w.c.passwordReset({ link, password: "bobs-other-passphrase" })), row("RESET_LINK_DEAD"));
  assert.equal(windowCount(w), n0 + 2, "a dead link counted under R38's window");
  assert.equal((await w.c.login({ role: "member:bob", password: "bobs-new-passphrase" })).ok, true, "reuse changed nothing");
  /* the route, public, from the body only; under the window */
  const l2 = w.c.passwordResetLinkMake({ member: "ann", by: "second" }).link;
  assert.equal((await w.ops(`link=${l2}&password=anns-new-passphrase`).passwordreset()).reason, "PASSWORD_TOO_SHORT",
    "the query is never read: no password, no link");
  assert.equal(w.c.passwordResetLook({ link: l2 }).live, true);
  assert.equal((await w.ops("source=fp", { link: l2, password: "anns-new-passphrase" }).passwordreset()).ok, true);
  for (let i = 0; i < 10; i++) await w.ops("source=fp2", { link: "rl-x", password: "x".repeat(12) }).passwordreset();
  assert.equal((await w.ops("source=fp2", { link: "rl-y", password: "x".repeat(12) }).passwordreset()).reason, "SIGN_IN_PAUSED");
});

/* ===== R70: the held sign-in token ===== */
