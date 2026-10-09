/* T35 (T35-15; F3, F12, F13, F14, K1888; K1881, K1934): the sign-in window over `claim`, `login` and `recover` (R38,
   with R1 and R4), sign-out (R39), sessions held as digests (R40), constant-time comparison (R41), and administrators'
   recovery codes (R46, R47), at the interface. The clock is the module's `Date.now`, set by the test where a window
   or an hour must pass. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { world, sqlOver, PASSWORD, FOUNDER_PASSWORD, sha } from "./fixture.mjs";
import { SIGN_IN_CHECKS, SIGN_IN_WINDOW, SIGN_IN_STATED, RECOVERY_CODE_COUNT, credentialsOf }
  from "../../../src/credentials/index.mjs";
import { membershipOf, notAnAdmin } from "../../../src/membership/index.mjs";

const row = (code) => SIGN_IN_CHECKS[code];
const PAUSED = { ok: false, reason: "SIGN_IN_PAUSED", code: "SIGN_IN_PAUSED", check: "C-96.39",
                 translation: row("SIGN_IN_PAUSED").translation };
const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const counts = (w, kind) => Number(w.row(`SELECT COALESCE(SUM(count), 0) AS n FROM security_counts WHERE kind=?`, kind).n);
const windowRows = (w) => JSON.stringify(w.rows(`SELECT * FROM signin_window ORDER BY kind, key, win`));

/* Runs `fn` with the module's clock at `t` (milliseconds), restoring it after. */
async function at(t, fn) {
  const real = Date.now;
  Date.now = () => t;
  try { return await fn(); } finally { Date.now = real; }
}
const WINDOW = SIGN_IN_WINDOW.windowMs;
/* A time `frac` of the way into a window. */
const into = (frac, n = 0) => (Math.floor(Date.now() / WINDOW) + 1 + n) * WINDOW + Math.floor(frac * WINDOW);

test("R38 the bounds: 10 per source, 10 per role, in 10 minutes, stated from the same constants", () => {
  assert.deepEqual({ ...SIGN_IN_WINDOW }, { perSource: 10, perRole: 10, windowMs: 600000 });
  assert.ok(Object.isFrozen(SIGN_IN_WINDOW));
  assert.equal(SIGN_IN_STATED, "at most 10 refused attempts from one place, and 10 for one account, in any 10 minutes");
});

test("R38 R4 per source: ten refused sign-ins from one source pause the next from it, whatever role it asks and even with the right password; another source is not paused", async () => {
  const w = await world().group("ann", "bob");
  const t = into(0.1);
  await at(t, async () => {
    for (let i = 0; i < 10; i++)
      assert.equal((await w.c.login({ role: `member:r${i}`, password: "wrong-password-x", source: "src-A" })).reason,
        "SIGN_IN_REFUSED", String(i));
    const p = await w.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "src-A", country: "NL" });
    assert.deepEqual(p, { ...PAUSED, detail: p.detail, stated: SIGN_IN_STATED });
    assert.deepEqual(Object.keys(p).sort(), ["check", "code", "detail", "ok", "reason", "stated", "translation"]);
    assert.equal(w.rows(`SELECT * FROM sessions WHERE role='member:ann'`).length, 0, "no session for a paused attempt");
    assert.equal((await w.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "src-B" })).ok, true);
  });
});

test("R38 R4 per role: ten refused sign-ins for one role, from ten sources, pause the next for it from any source; another role is not paused", async () => {
  const w = await world().group("ann", "bob");
  await at(into(0.1), async () => {
    for (let i = 0; i < 10; i++)
      assert.equal((await w.c.login({ role: "member:ann", password: "wrong-password-x", source: `src-${i}` })).ok, false);
    assert.deepEqual(shape(await w.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "src-new" })), PAUSED);
    assert.equal((await w.c.login({ role: "member:bob", password: PASSWORD("bob"), source: "src-new" })).ok, true);
  });
});

test("R38 the estimate is two-bucket and sliding: the previous window's refusals weigh (1 − elapsed/W) of it, the current one's whole", async () => {
  const w = await world().group("ann");
  /* ten refusals early in one window */
  await at(into(0.5), async () => {
    for (let i = 0; i < 10; i++) await w.c.login({ role: "member:ann", password: "wrong-password-x", source: `s${i}` });
    assert.deepEqual(shape(await w.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "x" })), PAUSED);
  });
  /* 5% into the next window: 10 × 0.95 = 9.5, under the bound, so judged; one more refusal makes 10.5 */
  await at(into(0.05, 1), async () => {
    assert.equal((await w.c.login({ role: "member:ann", password: "wrong-password-x", source: "y" })).reason, "SIGN_IN_REFUSED");
    assert.deepEqual(shape(await w.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "z" })), PAUSED);
  });
  /* 96% into it: 10 × 0.04 + 1 = 1.4, so the right password signs in */
  await at(into(0.96, 1), async () => {
    assert.equal((await w.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "z" })).ok, true);
  });
  /* two windows on, nothing weighs */
  const w2 = await world().group("ann");
  await at(into(0.5), async () => {
    for (let i = 0; i < 10; i++) await w2.c.login({ role: "member:ann", password: "wrong-password-x", source: `s${i}` });
  });
  await at(into(0.01, 2), async () => {
    assert.equal((await w2.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "s0" })).ok, true);
  });
});

test("R38 one answer for every arm: either bucket full, a role held or not, a member active or not; at the same cost as R4's refusal", async () => {
  const w = await world().group("ann", "bob");
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  await at(into(0.2), async () => {
    for (let i = 0; i < 10; i++) await w.c.login({ role: "member:target", password: "wrong-password-x", source: `s${i}` });
    for (let i = 0; i < 10; i++) await w.c.login({ role: `member:q${i}`, password: "wrong-password-x", source: "busy" });
    const arms = [
      { role: "member:target", password: "wrong-password-x", source: "fresh" },    // the role's bucket, no credential
      { role: "member:ann", password: PASSWORD("ann"), source: "busy" },           // the source's bucket, an active member
      { role: "member:bob", password: PASSWORD("bob"), source: "busy" },           // a revoked member
      { role: "never-registered", password: "x", source: "busy" },                 // a role held by nobody
      { role: "admin", password: FOUNDER_PASSWORD, source: "busy" },               // the founder
    ];
    const answers = [];
    for (const a of arms) answers.push(await w.c.login(a));
    for (const a of answers) assert.deepEqual(a, answers[0]);
    assert.deepEqual(shape(answers[0]), PAUSED);
    /* the same cost: one password derivation, as a refusal pays */
    const time = async (a) => { const t0 = performance.now(); await w.c.login(a); return performance.now() - t0; };
    const paused = [], refused = [];
    for (const a of arms) paused.push(await time(a));
    for (let i = 0; i < arms.length; i++) refused.push(await time({ role: `member:z${i}`, password: "wrong-password-x", source: `fresh-${i}` }));
    const all = [...paused, ...refused];
    assert.ok(Math.min(...all) > Math.max(...all) / 5, `times differ too much: ${all.map((x) => x.toFixed(1))}`);
  });
});

test("R38 R44 a paused attempt counts toward neither window and is the tally's `rate`; a success counts toward neither and empties neither", async () => {
  const w = await world().group("ann", "bob");
  await at(into(0.3), async () => {
    for (let i = 0; i < 10; i++) await w.c.login({ role: "member:ann", password: "wrong-password-x", source: `s${i}` });
    assert.equal(counts(w, "signin"), 10);
    const before = windowRows(w);
    for (let i = 0; i < 3; i++) assert.equal((await w.c.login({ role: "member:ann", password: "x", source: `p${i}` })).reason, "SIGN_IN_PAUSED");
    assert.equal(windowRows(w), before, "a pause counts toward neither window");
    assert.deepEqual([counts(w, "rate"), counts(w, "signin")], [3, 10]);
    /* a success, from a source that refused before, changes neither window */
    for (let i = 0; i < 9; i++) await w.c.login({ role: `member:o${i}`, password: "wrong-password-x", source: "mixed" });
    const mid = windowRows(w);
    assert.equal((await w.c.login({ role: "member:bob", password: PASSWORD("bob"), source: "mixed" })).ok, true);
    assert.equal(windowRows(w), mid, "a success counts toward neither and empties neither");
    assert.equal((await w.c.login({ role: "member:o0", password: "wrong", source: "mixed" })).reason, "SIGN_IN_REFUSED");
    assert.equal((await w.c.login({ role: "member:bob", password: PASSWORD("bob"), source: "mixed" })).reason, "SIGN_IN_PAUSED",
      "the tenth refusal from it pauses it, success or no success between");
  });
});

test("R38 a call with no source counts under one shared source of its own; the window keys hold no source, address or role in the clear", async () => {
  const w = await world().group("ann", "bob");
  await at(into(0.2), async () => {
    for (let i = 0; i < 10; i++) await w.c.login({ role: `member:n${i}`, password: "wrong-password-x" });
    assert.deepEqual(shape(await w.c.login({ role: "member:ann", password: PASSWORD("ann") })), PAUSED, "no source: the shared one");
    assert.deepEqual(shape(await w.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "" })), PAUSED, "an empty one too");
    assert.equal((await w.c.login({ role: "member:bob", password: PASSWORD("bob"), source: "203.0.113.9" })).ok, true);
    await w.c.login({ role: "member:ann", password: "wrong", source: "203.0.113.9" });
  });
  const dump = JSON.stringify(w.rows(`SELECT * FROM signin_window`));
  for (const s of ["203.0.113.9", "member:ann", "member:n1", "ann"]) assert.ok(!dump.includes(s), s);
});

test("R38 R1 claim is under the window as the role `admin`: its refusals count, and refused sign-ins for `admin` pause a claim; a pause is asked before the password's length or the claim", async () => {
  const w = world();
  await at(into(0.2), async () => {
    assert.equal((await w.c.claim({ password: "short", tokenFp: "fp-1", source: "s0" })).reason, "PASSWORD_TOO_SHORT");
    assert.equal((await w.c.claim({ password: "founder-passphrase-1", tokenFp: "fp-1", source: "s1" })).ok, true);
    for (let i = 2; i < 10; i++)
      assert.equal((await w.c.claim({ password: "another-passphrase", tokenFp: "fp-1", source: `s${i}` })).reason, "ALREADY_CLAIMED");
    assert.equal(counts(w, "signin"), 9, "each refused claim counts");
    assert.equal((await w.c.login({ role: "admin", password: "wrong-passphrase", source: "s10" })).reason, "SIGN_IN_REFUSED");
    for (const args of [{ password: "short" }, { password: "another-passphrase" }, { password: "z".repeat(12), tokenFp: "fp-2" }])
      assert.deepEqual(shape(await w.c.claim({ tokenFp: "fp-1", source: "s11", ...args })), PAUSED, JSON.stringify(args));
    assert.deepEqual(shape(await w.c.login({ role: "admin", password: "founder-passphrase-1", source: "s12" })), PAUSED,
      "the founder's sign-in shares the role (K1934 (6))");
    assert.equal(w.c.bootstrapState("fp-2").rearmed, true, "the paused re-armed claim was not judged");
  });
});

test("R39 signOut ends the session its token names, with the ask grants minted under it; NOT_SIGNED_IN, ending nothing, for an unknown, expired or ended token, one answer", async () => {
  const w = await world().group("ann");
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  const one = (await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token;
  const two = (await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token;
  const g1 = (await w.c.aiGrantMint({ member: "ann", by: "ann", session: one })).token;
  const g2 = (await w.c.aiGrantMint({ member: "ann", by: "ann", session: two })).token;
  assert.deepEqual(w.c.signOut({ token: one }), { ok: true, ended: 1 });
  assert.equal(w.c.session(one), null);
  assert.equal((await w.c.aiGrantHeld({ token: g1 })).reason, "GRANT_NOT_HELD", "its grant ends with it");
  assert.equal((await w.c.aiGrantHeld({ token: g2 })).ok, true, "another session's grant stands");
  assert.equal(w.c.session(two).role, "member:ann", "another session of the same role stands");
  w.sql.exec(`INSERT INTO sessions (token_sha, role, expires, created) VALUES (?, 'member:ann', ?, 'x')`, sha("stale"), Date.now() - 1);
  const before = w.snapshot();
  const answers = [];
  for (const token of [one, "stale", "never-issued", "", null, undefined, 7]) answers.push(w.c.signOut({ token }));
  for (const a of answers) {
    assert.deepEqual(a, answers[0]);
    assert.deepEqual(Object.keys(a).sort(), ["check", "code", "detail", "ok", "reason", "translation"]);
    assert.deepEqual(shape(a), { ok: false, reason: "NOT_SIGNED_IN", code: "NOT_SIGNED_IN", check: "C-96.40",
      translation: row("NOT_SIGNED_IN").translation });
  }
  assert.equal(w.snapshot(), before, "ending nothing");
});

test("R39 signOutEverywhere ends every session of the token's role, that one included, and their ask grants; never another role's, nor a standing question's grant", async () => {
  const w = await world().group("ann", "bob");
  for (const id of ["ann", "bob"]) await w.c.accountReferenceSet({ member: id, kind: "apikey", secret: `sk-${id}`, by: id });
  w.c.accountUsesSet({ owner: "member:ann", switch: "standing", on: true, by: "ann" });
  const ann = [];
  for (let i = 0; i < 3; i++) ann.push((await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token);
  const bob = (await w.c.login({ role: "member:bob", password: PASSWORD("bob") })).token;
  const founder = (await w.c.login({ role: "admin", password: FOUNDER_PASSWORD })).token;
  const grants = [];
  for (const s of ann) grants.push((await w.c.aiGrantMint({ member: "ann", by: "ann", session: s })).token);
  const bobGrant = (await w.c.aiGrantMint({ member: "bob", by: "bob", session: bob })).token;
  const standing = (await w.c.aiGrantMintStanding({ member: "ann", question: "what is new?" })).token;
  w.sql.exec(`INSERT INTO sessions (token_sha, role, expires, created) VALUES (?, 'member:ann', ?, 'x')`, sha("old"), Date.now() - 1);
  assert.deepEqual(w.c.signOutEverywhere({ token: ann[1] }), { ok: true, ended: 3 }, "the live ones counted");
  for (const s of ann) assert.equal(w.c.session(s), null);
  assert.equal(w.rows(`SELECT * FROM sessions WHERE role='member:ann'`).length, 0);
  for (const g of grants) assert.equal((await w.c.aiGrantHeld({ token: g })).ok, false);
  assert.equal((await w.c.aiGrantHeld({ token: standing })).ok, true, "a standing question's grant is not a session's");
  assert.deepEqual([w.c.session(bob).role, w.c.session(founder).role], ["member:bob", "admin"], "another role's stand");
  assert.equal((await w.c.aiGrantHeld({ token: bobGrant })).ok, true);
  for (const token of [ann[0], "nope", null]) assert.equal(w.c.signOutEverywhere({ token }).reason, "NOT_SIGNED_IN");
  assert.deepEqual(w.c.signOutEverywhere({ token: founder }), { ok: true, ended: 1 });
});

test("R40 a session is held only as its token's SHA-256: login stores the digest and answers the token once; session, sign-out and revocation find it by the digest; no row holds a token", async () => {
  const w = await world().group("ann");
  const { token } = await w.c.login({ role: "member:ann", password: PASSWORD("ann") });
  assert.deepEqual(w.rows(`SELECT token_sha, role FROM sessions`).map((r) => [r.token_sha, r.role]), [[sha(token), "member:ann"]]);
  assert.deepEqual(Object.keys(w.row(`SELECT * FROM sessions`)).sort(), ["created", "expires", "role", "token_sha"]);
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  await w.c.aiGrantMint({ member: "ann", by: "ann", session: token });
  assert.ok(!w.snapshot().includes(token), "no row of any table holds the token");
  assert.equal(w.row(`SELECT session FROM ai_grants`).session, sha(token), "the grant names its session by the digest");
  assert.equal(w.c.session(token).role, "member:ann");
  assert.equal(w.c.session(sha(token)), null, "the digest is not itself a token");
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.equal(w.rows(`SELECT * FROM sessions`).length, 0, "R16 found it");
});

test("R40 sessions held as tokens when the migration runs are carried over as their digests: they and their grants stay live, no token stays stored, and a second boot changes nothing", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, title TEXT)`);
  db.exec(`CREATE TABLE sessions (token TEXT PRIMARY KEY, role TEXT NOT NULL, expires INTEGER NOT NULL, created TEXT NOT NULL)`);
  db.exec(`CREATE INDEX sessions_expires ON sessions(expires)`);
  db.exec(`CREATE TABLE ai_grants (grant_sha TEXT PRIMARY KEY, member_id TEXT NOT NULL, session TEXT NOT NULL, expires INTEGER NOT NULL, kind TEXT)`);
  const live = "a1".repeat(32), other = "b2".repeat(32), gone = "c3".repeat(32), grant = "d4".repeat(32);
  const later = Date.now() + 3600e3;
  db.prepare(`INSERT INTO sessions VALUES (?, 'member:ann', ?, 't'), (?, 'admin', ?, 't'), (?, 'member:ann', ?, 't')`)
    .run(live, later, other, later, gone, Date.now() - 1);
  db.prepare(`INSERT INTO ai_grants VALUES (?, 'ann', ?, ?, 'ask'), (?, 'ann', '', ?, 'standing')`)
    .run(sha(grant), live, later, sha("standing-grant"), later);
  const sql = sqlOver(db);
  const ctx = { storage: { sql } };
  const core = { declarePurge() { return { ok: true }; }, declareTable() { return { ok: true }; }, bundleInfo() { return null; } };
  const m = membershipOf(ctx, { record: core });
  m.migrate();
  const c = credentialsOf(ctx, { record: core, membership: m });
  c.migrate();
  await c.claim({ password: FOUNDER_PASSWORD, tokenFp: "fp" });
  const a = await m.memberAdd({ memberId: "ann", cover: "c", by: "admin" });
  await m.enroll({ invite: a.invite, handle: "ann", password: PASSWORD("ann") });
  const cols = db.prepare(`PRAGMA table_info(sessions)`).all().map((r) => r.name);
  assert.deepEqual(cols, ["token_sha", "role", "expires", "created"]);
  const dump = () => JSON.stringify(db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all()
    .map(({ name }) => db.prepare(`SELECT * FROM "${name}"`).all()));
  for (const t of [live, other, gone]) assert.ok(!dump().includes(t), "no token stays stored");
  assert.equal(c.session(live).role, "member:ann");
  assert.equal(c.session(other).role, "admin");
  assert.equal(c.session(gone), null);
  assert.deepEqual(await c.aiGrantHeld({ token: grant }), { ok: true, member: "ann", viewer: "member:ann", expires: later },
    "the ask's grant follows its session to the digest");
  assert.equal((await c.aiGrantHeld({ token: "standing-grant" })).ok, true);
  assert.deepEqual(db.prepare(`SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='sessions' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
    .all().map((r) => r.name), ["sessions_expires", "sessions_role"]);
  const once = dump();
  c.migrate();
  assert.equal(dump(), once, "a second boot changes nothing");
  assert.deepEqual(c.signOut({ token: live }), { ok: true, ended: 1 });
});

test("R41 the stored hash and a recovery code are compared in constant time: a value that differs at its first character and one that differs at its last are refused alike and at the same cost", async () => {
  const w = await world().group("ann");
  const { pbkdf2Sync } = await import("node:crypto");
  const cred = w.row(`SELECT salt, hash, iterations FROM credentials WHERE role='member:ann'`);
  assert.equal(pbkdf2Sync("probe-passphrase", cred.salt, cred.iterations, 32, "sha256").toString("hex").length, 64);
  const flip = (hex, i) => hex.slice(0, i) + (hex[i] === "0" ? "1" : "0") + hex.slice(i + 1);
  const derived = pbkdf2Sync("probe-passphrase", cred.salt, cred.iterations, 32, "sha256").toString("hex");
  const time = async (stored) => {
    w.sql.exec(`UPDATE credentials SET hash=? WHERE role='member:ann'`, stored);
    const t0 = performance.now();
    const r = await w.c.login({ role: "member:ann", password: "probe-passphrase", source: `t-${Math.random()}` });
    return [performance.now() - t0, r];
  };
  const [tFirst, rFirst] = await time(flip(derived, 0));
  const [tLast, rLast] = await time(flip(derived, 63));
  assert.deepEqual([rFirst.reason, rLast.reason], ["SIGN_IN_REFUSED", "SIGN_IN_REFUSED"]);
  assert.ok(Math.min(tFirst, tLast) > Math.max(tFirst, tLast) / 5, `${tFirst} ${tLast}`);
  assert.equal((await time(derived))[1].ok, true, "the same derivation agrees");
  /* recovery codes, likewise (R47) */
  const codes = w.c.recoveryCodesIssue({ by: "second" }).codes;
  const wrongFirst = (codes[0][0] === "A" ? "B" : "A") + codes[0].slice(1);
  const wrongLast = codes[0].slice(0, -1) + (codes[0].at(-1) === "A" ? "B" : "A");
  for (const code of [wrongFirst, wrongLast])
    assert.equal((await w.c.recover({ role: "member:second", code, password: "new-passphrase-1", source: code })).reason,
      "RECOVERY_REFUSED", code);
  assert.equal((await w.c.recover({ role: "member:second", code: codes[0], password: "new-passphrase-1" })).ok, true);
});

test("R46 recoveryCodesIssue: an active administrator, the founder included, gets ten one-time codes for their own role, answered once, at least 80 bits each, only their SHA-256 kept; anyone else NOT_AN_ADMIN, issuing nothing", async () => {
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const before = w.snapshot();
  for (const by of ["ann", "dee", "nobody", "class:admin", "class:ai", "token:ai", null, ""])
    assert.deepEqual(w.c.recoveryCodesIssue({ by }), notAnAdmin(by === "" ? "" : by ?? null, "issuing recovery codes"), String(by));
  assert.equal(w.snapshot(), before, "issuing nothing");
  assert.equal(RECOVERY_CODE_COUNT, 10);
  const r = w.c.recoveryCodesIssue({ by: "second" });
  assert.deepEqual(Object.keys(r).sort(), ["codes", "issuedAt", "ok"]);
  assert.equal(r.codes.length, 10);
  assert.equal(new Set(r.codes).size, 10);
  for (const c of r.codes) assert.match(c, /^[A-HJ-NP-Z2-9]{5}(-[A-HJ-NP-Z2-9]{5}){3}$/, "20 characters of 32: 100 bits");
  assert.match(r.issuedAt, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  const stored = w.rows(`SELECT code_sha, role, spent_at FROM recovery_codes ORDER BY code_sha`);
  assert.deepEqual(stored.map((x) => x.role), Array(10).fill("member:second"));
  assert.deepEqual(stored.map((x) => x.code_sha).sort(), r.codes.map((c) => sha(c.replace(/-/g, ""))).sort(), "only each code's SHA-256");
  const dump = w.snapshot();
  for (const c of r.codes) assert.ok(!dump.includes(c) && !dump.includes(c.replace(/-/g, "")), c);
  /* answered once: the state never carries a code or a digest */
  const st = w.c.recoveryCodesState({ by: "second" });
  assert.deepEqual(st, { ok: true, held: true, remaining: 10, issuedAt: r.issuedAt });
  assert.ok(!JSON.stringify(st).match(/[0-9a-f]{64}/));
  /* the founder's role is `admin`, by either spelling */
  const f = w.c.recoveryCodesIssue({ by: "member:admin" });
  assert.equal(f.ok, true);
  assert.deepEqual(w.rows(`SELECT DISTINCT role FROM recovery_codes ORDER BY role`).map((x) => x.role), ["admin", "member:second"]);
  assert.equal(w.c.recoveryCodesState({ by: "admin" }).remaining, 10);
  /* issuing again spends every earlier unspent code of that role, and only that role's */
  const again = w.c.recoveryCodesIssue({ by: "member:second" });
  assert.equal(w.c.recoveryCodesState({ by: "second" }).remaining, 10);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM recovery_codes WHERE role='member:second' AND spent_at IS NOT NULL`).n, 10);
  assert.equal((await w.c.recover({ role: "member:second", code: r.codes[0], password: "new-passphrase-1" })).reason, "RECOVERY_REFUSED");
  assert.equal((await w.c.recover({ role: "member:second", code: again.codes[0], password: "new-passphrase-1" })).ok, true);
  assert.equal(w.c.recoveryCodesState({ by: "admin" }).remaining, 10, "the founder's untouched");
  /* anyone else's state is their own, none held */
  for (const by of ["ann", "class:admin", null])
    assert.deepEqual(w.c.recoveryCodesState({ by }), { ok: true, held: false, remaining: 0, issuedAt: null }, String(by));
});

test("R47 recover: R38's window, then PASSWORD_TOO_SHORT, then one RECOVERY_REFUSED at one cost for every other arm, each writing nothing but its count", async () => {
  const w = await world().group("ann", "third");
  const codes = w.c.recoveryCodesIssue({ by: "second" }).codes;
  const founderCodes = w.c.recoveryCodesIssue({ by: "admin" }).codes;
  /* `ann` holds codes issued while she was an administrator, then made ordinary: her codes no longer serve */
  w.sql.exec(`INSERT INTO recovery_codes (code_sha, role, issued_at) VALUES (?, 'member:ann', 't')`, sha("ANNSCODE0000000000AA"));
  await at(into(0.3), async () => {
    assert.deepEqual(await w.c.recover({ role: "member:second", code: codes[0], password: "short", source: "a" }),
      { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 });
    const arms = [
      { role: "member:third", code: codes[1] },                  // a role holding no codes (another's code)
      { role: "member:second", code: "WRONG-WRONG-WRONG-WRONG" }, // not among its codes
      { role: "member:second", code: "" },                       // no code
      { role: "member:second" },
      { role: "member:ann", code: "ANNSCODE0000000000AA" },      // its code, but not an administrator now
      { role: "member:ghost", code: codes[2] },
      { role: "admin", code: codes[3] },
      { role: null, code: founderCodes[0] },
    ];
    const before = JSON.stringify([w.rows(`SELECT * FROM credentials ORDER BY role`), w.rows(`SELECT * FROM recovery_codes ORDER BY code_sha`),
                                   w.rows(`SELECT * FROM sessions`), w.rows(`SELECT * FROM recoveries`)]);
    const answers = [];
    for (const [i, a] of arms.entries()) answers.push(await w.c.recover({ ...a, password: "new-passphrase-1", source: `r${i}` }));
    for (const a of answers) assert.deepEqual(a, answers[0]);
    assert.deepEqual(shape(answers[0]), { ok: false, reason: "RECOVERY_REFUSED", code: "RECOVERY_REFUSED", check: "C-96.41",
      translation: row("RECOVERY_REFUSED").translation });
    assert.equal(JSON.stringify([w.rows(`SELECT * FROM credentials ORDER BY role`), w.rows(`SELECT * FROM recovery_codes ORDER BY code_sha`),
                                 w.rows(`SELECT * FROM sessions`), w.rows(`SELECT * FROM recoveries`)]), before, "nothing written but counts");
    assert.equal(counts(w, "signin"), arms.length + 1, "each refusal counts, the short password's included");
    const time = async (a, i) => { const t0 = performance.now(); await w.c.recover({ ...a, password: "new-passphrase-1", source: `t${i}` }); return performance.now() - t0; };
    const t = [];
    for (const [i, a] of arms.entries()) t.push(await time(a, i));
    assert.ok(Math.min(...t) > Math.max(...t) / 5, `times differ too much: ${t.map((x) => x.toFixed(1))}`);
    /* the window: refusals for a role pause the next recovery for it, before the password's length or the code */
    for (let i = 0; i < 10; i++) await w.c.recover({ role: "member:third", code: "x", password: "new-passphrase-1", source: `q${i}` });
    for (const a of [{ code: codes[4], password: "new-passphrase-1" }, { code: codes[4], password: "short" }])
      assert.deepEqual(shape(await w.c.recover({ role: "member:third", ...a, source: "new" })), PAUSED);
  });
});

test("R47 a recovery: in one act the password is set as R3 sets it, the code spent for good, every session of the role ended, the recovery recorded with role and instant and never the code; it answers {ok, role, remaining} and issues no session", async () => {
  const w = await world().group("ann");
  const codes = w.c.recoveryCodesIssue({ by: "second" }).codes;
  const s1 = (await w.c.login({ role: "member:second", password: PASSWORD("second") })).token;
  const s2 = (await w.c.login({ role: "member:second", password: PASSWORD("second") })).token;
  const annS = (await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token;
  const r = await w.c.recover({ role: "member:second", code: codes[5].toLowerCase().replace(/-/g, " "), password: "recovered-pass-1" });
  assert.deepEqual(r, { ok: true, role: "member:second", remaining: 9 }, "case, spaces and dashes do not matter");
  assert.equal(w.rows(`SELECT * FROM sessions WHERE role='member:second'`).length, 0, "no session issued, every one ended");
  assert.deepEqual([w.c.session(s1), w.c.session(s2)], [null, null]);
  assert.equal(w.c.session(annS).role, "member:ann", "another role's stands");
  assert.equal((await w.c.login({ role: "member:second", password: PASSWORD("second") })).ok, false);
  assert.equal((await w.c.login({ role: "member:second", password: "recovered-pass-1" })).ok, true);
  const salt = w.row(`SELECT salt, hash FROM credentials WHERE role='member:second'`);
  assert.match(salt.hash, /^[0-9a-f]{64}$/);
  assert.ok(!w.snapshot().includes("recovered-pass-1"), "the password is never kept");
  assert.equal((await w.c.recover({ role: "member:second", code: codes[5], password: "again-passphrase" })).reason, "RECOVERY_REFUSED",
    "never accepted again");
  const rec = w.rows(`SELECT * FROM recoveries`);
  assert.deepEqual(rec.map((x) => Object.keys(x).sort()), [["at", "role", "seq"]]);
  assert.equal(rec[0].role, "member:second");
  assert.match(rec[0].at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  assert.ok(!JSON.stringify(rec).includes(codes[5].replace(/-/g, "")));
  assert.equal(w.c.recoveryCodesState({ by: "second" }).remaining, 9);
  /* the founder recovers as `admin` */
  const f = w.c.recoveryCodesIssue({ by: "admin" }).codes;
  assert.deepEqual(await w.c.recover({ role: "admin", code: f[0], password: "founder-new-pass" }), { ok: true, role: "admin", remaining: 9 });
  assert.equal((await w.c.login({ role: "admin", password: "founder-new-pass" })).ok, true);
});
