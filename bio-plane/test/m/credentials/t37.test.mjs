/* T37 (T37-6; N755, N761, N765, N776; DEC-182 (4); K231, K2101, K2129, K2130, K2175), at the interface: a member's own
   password change (R3, under R38's window and R44's tally), the one keep-away read every gate asks (R35's
   `aiKeptAway`), keep-away's reason refused under a code of this module's own (R51), and a mint's digest read from the
   body only and refused when absent (R53). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, FOUNDER_PASSWORD, sha } from "./fixture.mjs";
import { SIGN_IN_CHECKS, ACCOUNT_CHECKS, AI_CREDENTIAL_CHECKS, SIGN_IN_WINDOW, SIGN_IN_STATED } from "../../../src/credentials/index.mjs";

const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const row = (table, code) => ({ ok: false, reason: code, code, check: table[code].check, translation: table[code].translation });
const counts = (w, kind) => Number(w.row(`SELECT COALESCE(SUM(count), 0) AS n FROM security_counts WHERE kind=?`, kind).n);
/* every table but the window's and the tally's: what a refusal that writes "nothing but its count" leaves unchanged */
const COUNT_TABLES = ["signin_window", "security_counts", "security_pending", "security_key", "sqlite_sequence"];
const uncounted = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .filter(({ name }) => !COUNT_TABLES.includes(name)).map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));
async function at(t, fn) {
  const real = Date.now;
  Date.now = () => t;
  try { return await fn(); } finally { Date.now = real; }
}
const WINDOW = SIGN_IN_WINDOW.windowMs;
const into = (frac) => (Math.floor(Date.now() / WINDOW) + 1) * WINDOW + Math.floor(frac * WINDOW);
const NEW = "a-new-passphrase-9";

/* ann signed in twice (one session presents the change), with an ask grant under each and a standing grant; bob signed in */
async function signedIn() {
  const w = await world().group("ann", "bob");
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "ann" });
  w.s = {};
  for (const k of ["ann1", "ann2", "ann3"]) w.s[k] = (await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token;
  w.s.bob = (await w.c.login({ role: "member:bob", password: PASSWORD("bob") })).token;
  w.s.founder = (await w.c.login({ role: "admin", password: FOUNDER_PASSWORD })).token;
  w.g = {};
  for (const k of ["ann1", "ann2"]) w.g[k] = (await w.c.aiGrantMint({ member: "ann", by: "ann", session: w.s[k] })).token;
  w.g.standing = (await w.c.aiGrantMintStanding({ member: "ann", question: "what is new?" })).token;
  return w;
}

/* ===== R3: a member's own password change ===== */

test("R3 passwordChange refuses, in order, each writing nothing but its count: MACHINE_CANNOT_SET_PASSWORD (C-96.45) for a machine credential, the operator's token or no stamp; NOT_SIGNED_IN (R39's row) for no live session; PASSWORD_TOO_SHORT under 12; CURRENT_PASSWORD_WRONG (C-96.46) for a wrong current password, the one counted", async () => {
  const w = await signedIn();
  w.sql.exec(`INSERT INTO sessions (token_sha, role, expires, created) VALUES (?, 'member:ann', ?, 'x')`, sha("stale"), Date.now() - 1);
  const before = w.snapshot();
  /* a caller with no member behind it, asked first: before its session, its password or anything else */
  for (const by of [null, undefined, "", "class:admin", "class:member", "class:ai", "token:ai", "token:member"]) {
    const r = await w.c.passwordChange({ current: PASSWORD("ann"), password: NEW, by, session: w.s.ann1 });
    assert.deepEqual(shape(r), row(SIGN_IN_CHECKS, "MACHINE_CANNOT_SET_PASSWORD"), String(by));
    assert.match(r.detail, /Nothing was changed\.$/);
  }
  assert.equal(w.snapshot(), before, "a machine's refusal writes nothing");
  /* no live session: unknown, expired, ended, none: R39's one answer */
  w.c.signOut({ token: w.s.ann3 });
  const before2 = w.snapshot();
  const notSignedIn = w.c.signOut({ token: "never-issued" });
  for (const session of ["never-issued", "stale", w.s.ann3, "", null, undefined, sha(w.s.ann1)])
    assert.deepEqual(await w.c.passwordChange({ current: PASSWORD("ann"), password: NEW, by: "ann", session }), notSignedIn, String(session));
  assert.deepEqual(shape(notSignedIn), row(SIGN_IN_CHECKS, "NOT_SIGNED_IN"));
  /* a new password under 12 characters, the current one right or wrong: not counted */
  for (const password of ["short", "x".repeat(11), "", null, 7, undefined])
    assert.deepEqual(await w.c.passwordChange({ current: "wrong-current-x", password, by: "ann", session: w.s.ann1 }),
      { ok: false, reason: "PASSWORD_TOO_SHORT", minimum: 12 }, String(password));
  assert.equal(w.snapshot(), before2, "nothing written, not even a count");
  /* the current password wrong: its row, counted toward the window and the tally, nothing else written */
  const untouched = uncounted(w);
  for (const current of ["wrong-current-x", "", null, PASSWORD("bob"), FOUNDER_PASSWORD]) {
    const r = await w.c.passwordChange({ current, password: NEW, by: "ann", session: w.s.ann1, source: `s-${current}` });
    assert.deepEqual(shape(r), row(SIGN_IN_CHECKS, "CURRENT_PASSWORD_WRONG"), String(current));
    assert.deepEqual(Object.keys(r).sort(), ["check", "code", "detail", "ok", "reason", "translation"]);
    assert.match(r.detail, /Nothing was changed\.$/);
  }
  assert.equal(uncounted(w), untouched, "no password set, no session ended");
  assert.equal(counts(w, "signin"), 5, "each wrong current password counts as R44's `signin`");
  assert.equal(w.row(`SELECT SUM(count) AS n FROM signin_window WHERE kind='role'`).n, 5, "and toward the role's window");
  assert.equal((await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).ok, true, "the password unchanged");
  /* the rows: C-96's next free numbers, in R48's words */
  assert.deepEqual([SIGN_IN_CHECKS.MACHINE_CANNOT_SET_PASSWORD.check, SIGN_IN_CHECKS.CURRENT_PASSWORD_WRONG.check], ["C-96.45", "C-96.46"]);
  for (const code of ["MACHINE_CANNOT_SET_PASSWORD", "CURRENT_PASSWORD_WRONG"])
    assert.match(SIGN_IN_CHECKS[code].translation, /Nothing was changed\./, code);
});

test("R3 passwordChange on success: in one act the password is set and every other session of the session's role ends with its ask grants; the presenting session stays; another role's sessions and a standing question's grant stand; it answers {ok: true, role, ended} and never either password", async () => {
  const w = await signedIn();
  const r = await w.c.passwordChange({ current: PASSWORD("ann"), password: NEW, by: "ann", session: w.s.ann1, source: "home" });
  assert.deepEqual(r, { ok: true, role: "member:ann", ended: 2 }, "ann2 and ann3 ended");
  assert.equal(counts(w, "signin") + counts(w, "through") + counts(w, "rate"), 0, "a success is never counted");
  assert.equal(w.c.session(w.s.ann1).role, "member:ann", "the presenting session stays");
  assert.deepEqual([w.c.session(w.s.ann2), w.c.session(w.s.ann3)], [null, null]);
  assert.equal((await w.c.aiGrantHeld({ token: w.g.ann2 })).reason, "GRANT_NOT_HELD", "an ended session's grant ends with it");
  assert.equal((await w.c.aiGrantHeld({ token: w.g.ann1 })).ok, true, "the presenting session's grant stands");
  assert.equal((await w.c.aiGrantHeld({ token: w.g.standing })).ok, true, "a standing question's grant is no session's");
  assert.deepEqual([w.c.session(w.s.bob).role, w.c.session(w.s.founder).role], ["member:bob", "admin"], "another role's stand");
  assert.equal((await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).ok, false, "the old password no longer signs in");
  assert.equal((await w.c.login({ role: "member:ann", password: NEW })).ok, true, "the new one does");
  const cred = w.row(`SELECT salt, hash, iterations FROM credentials WHERE role='member:ann'`);
  assert.match(cred.hash, /^[0-9a-f]{64}$/);
  assert.equal(cred.iterations, 100000, "set as setPassword sets it: a salted derivation");
  const dump = w.snapshot();
  for (const p of [NEW, PASSWORD("ann")]) assert.ok(!dump.includes(p) && !JSON.stringify(r).includes(p), p);
  /* the founder changes theirs as `admin`, with no other session */
  assert.deepEqual(await w.c.passwordChange({ current: FOUNDER_PASSWORD, password: "founder-new-pass-2", by: "admin", session: w.s.founder }),
    { ok: true, role: "admin", ended: 0 });
  assert.equal((await w.c.login({ role: "admin", password: "founder-new-pass-2" })).ok, true);
  /* `by` naming someone else changes nothing about whose password it is: the session's role is the role */
  const b = await w.c.passwordChange({ current: PASSWORD("bob"), password: "bob-new-passphrase", by: "ann", session: w.s.bob });
  assert.equal(b.role, "member:bob");
  assert.equal((await w.c.login({ role: "member:ann", password: NEW })).ok, true, "ann's untouched");
});

test("R3 the route `setpassword`: `{current, password}` from the body; the role from the stamped session, `by`, `source` and `country` from the query; a role in the body is never read, so no op sets another's password", async () => {
  const w = await signedIn();
  const forged = await w.ops(`by=ann&session=${w.s.ann1}`, { role: "member:bob", current: PASSWORD("ann"), password: NEW, by: "bob",
    session: w.s.bob }).setpassword();
  assert.deepEqual(forged, { ok: true, role: "member:ann", ended: 2 }, "the stamps, never the body's role, by or session");
  assert.equal((await w.c.login({ role: "member:bob", password: PASSWORD("bob") })).ok, true, "bob's unchanged");
  assert.equal((await w.ops(`session=${w.s.bob}`, { current: PASSWORD("bob"), password: NEW, by: "bob" }).setpassword()).reason,
    "MACHINE_CANNOT_SET_PASSWORD", "no stamped `by`: the body's is never read");
  assert.equal((await w.ops("by=bob", { current: PASSWORD("bob"), password: NEW, session: w.s.bob }).setpassword()).reason,
    "NOT_SIGNED_IN", "no stamped session: the body's is never read");
  const wrong = await w.ops(`by=bob&session=${w.s.bob}&source=src-q&country=de`, { current: "nope-nope-nope", password: NEW,
    source: "src-body", country: "FR" }).setpassword();
  assert.equal(wrong.reason, "CURRENT_PASSWORD_WRONG");
  assert.deepEqual(w.rows(`SELECT country FROM security_pending`).map((x) => x.country), ["DE"], "the query's country, never the body's");
});

/* ===== R38, R44: the change under the sign-in window and the tally ===== */

test("R38 R3 passwordChange is under the one sign-in window, its role the session's: refused sign-ins for the role pause it, and wrong current passwords pause a sign-in from the same source or for the same role; a pause is asked before the new password's length or the current one, counted as R44's `rate` and toward neither window", async () => {
  const w = await signedIn();
  await at(into(0.2), async () => {
    for (let i = 0; i < 10; i++) await w.c.login({ role: "member:ann", password: "wrong-password-x", source: `s${i}` });
    const before = JSON.stringify(w.rows(`SELECT * FROM signin_window ORDER BY kind, key, win`));
    for (const a of [{ current: PASSWORD("ann"), password: NEW }, { current: PASSWORD("ann"), password: "short" }, { current: "x", password: NEW }]) {
      const p = await w.c.passwordChange({ ...a, by: "ann", session: w.s.ann1, source: "fresh" });
      assert.deepEqual(shape(p), row(SIGN_IN_CHECKS, "SIGN_IN_PAUSED"), JSON.stringify(a));
      assert.equal(p.stated, SIGN_IN_STATED);
    }
    assert.equal(JSON.stringify(w.rows(`SELECT * FROM signin_window ORDER BY kind, key, win`)), before, "a pause counts toward neither window");
    assert.equal(counts(w, "rate"), 3, "each pause is R44's `rate`");
    assert.equal((await w.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "fresh" })).ok, false, "the password unchanged");
    /* bob's role is not paused: his change is judged */
    assert.equal((await w.c.passwordChange({ current: PASSWORD("bob"), password: NEW, by: "bob", session: w.s.bob, source: "fresh" })).ok, true);
  });
  /* wrong current passwords fill the source's bucket and the role's, as refused sign-ins do */
  const v = await signedIn();
  await at(into(0.3), async () => {
    for (let i = 0; i < 10; i++)
      assert.equal((await v.c.passwordChange({ current: "wrong-current-x", password: NEW, by: "bob", session: v.s.bob, source: "cafe" })).reason,
        "CURRENT_PASSWORD_WRONG", String(i));
    assert.equal((await v.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "cafe" })).reason, "SIGN_IN_PAUSED", "the source's bucket");
    assert.equal((await v.c.login({ role: "member:bob", password: PASSWORD("bob"), source: "home" })).reason, "SIGN_IN_PAUSED", "the role's bucket");
    assert.equal((await v.c.passwordChange({ current: PASSWORD("bob"), password: NEW, by: "bob", session: v.s.bob, source: "home" })).reason,
      "SIGN_IN_PAUSED", "and the change itself");
    assert.equal((await v.c.login({ role: "member:ann", password: PASSWORD("ann"), source: "home" })).ok, true, "another role, another source");
  });
});

test("R44 R3 a wrong current password is R44's `signin`, held without a place under DEC-166's rule (its country waits beside a keyed digest of the role); every other refusal of the change and its success count nothing", async () => {
  const w = await signedIn();
  const before = JSON.stringify(w.rows(`SELECT * FROM security_counts`));
  await w.c.passwordChange({ by: "class:ai", session: w.s.ann1, current: "x", password: NEW, country: "US" });
  await w.c.passwordChange({ by: "ann", session: "none", current: "x", password: NEW, country: "US" });
  await w.c.passwordChange({ by: "ann", session: w.s.ann1, current: "x", password: "short", country: "US" });
  await w.c.passwordChange({ by: "ann", session: w.s.ann1, current: PASSWORD("ann"), password: NEW, country: "US" });
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM security_counts`)), before, "nothing counted");
  await w.c.passwordChange({ by: "ann", session: w.s.ann1, current: "wrong-current-x", password: NEW, country: "us" });
  assert.deepEqual(w.rows(`SELECT kind, country, count FROM security_counts`), [{ kind: "signin", country: "", count: 1 }], "held without a place");
  const waiting = w.rows(`SELECT country, role FROM security_pending`);
  assert.deepEqual(waiting.map((x) => x.country), ["US"]);
  assert.match(waiting[0].role, /^[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify(waiting).includes("ann"), "the role only as a keyed digest");
});

/* ===== R35: aiKeptAway, the one site of AI_KEPT_AWAY ===== */

test("R35 aiKeptAway answers null while the group does not keep its material away, and otherwise the one AI_KEPT_AWAY refusal (C-29.31, its `where` this function) with keep_away as R52 answers it; the refusal R35, R27 and R32 answer is exactly it; it writes nothing and is reached by no route", async () => {
  const w = await signedIn();
  assert.equal(w.c.aiKeptAway(), null, "off by default");
  w.c.aiKeepAwaySet({ on: false, reason: "not now", by: "admin" });
  assert.equal(w.c.aiKeptAway(), null, "set off");
  const set = w.c.aiKeepAwaySet({ on: true, reason: "A confidentiality order.", by: "second" });
  const before = w.snapshot();
  const k = w.c.aiKeptAway();
  assert.deepEqual(shape(k), row(ACCOUNT_CHECKS, "AI_KEPT_AWAY"));
  assert.deepEqual(Object.keys(k).sort(), ["check", "code", "detail", "keep_away", "ok", "reason", "translation"]);
  assert.deepEqual(k.keep_away, { reason: "A confidentiality order.", set_by: "second", set_at: set.set_at });
  const { on, ...state } = w.c.aiKeepAwayState();
  assert.deepEqual([on, k.keep_away], [true, state]);
  assert.equal(ACCOUNT_CHECKS.AI_KEPT_AWAY.where, "src/credentials/index.mjs aiKeptAway > is-kept-away");
  for (const r of [await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }),
                   await w.c.accountReferenceFor({ member: "ann", act: { kind: "run", member: "ann" } }),
                   await w.c.aiGrantMint({ member: "ann", by: "ann", session: w.s.ann1 }),
                   await w.c.aiGrantMintStanding({ member: "ann", question: "q" })])
    assert.deepEqual(r, k, "the one refusal, through the one site");
  assert.equal(w.snapshot(), before, "it writes nothing");
  assert.ok(!Object.keys(w.ops()).some((op) => /keptaway/i.test(op)), "reached by no route (aikeepawaystate is R52's)");
  w.c.aiKeepAwaySet({ on: false, by: "admin" });
  assert.equal(w.c.aiKeptAway(), null, "turned off again");
});

test("R35 aiKeptAway fails closed: when the setting cannot be read it answers the AI_KEPT_AWAY refusal, saying so, with the three null; it never throws", async () => {
  const w = await world().group("ann");
  w.sql.exec(`DROP TABLE ai_keep_away`);
  const k = w.c.aiKeptAway();
  assert.deepEqual([shape(k), k.keep_away], [row(ACCOUNT_CHECKS, "AI_KEPT_AWAY"), { reason: null, set_by: null, set_at: null }]);
  assert.match(k.detail, /could not be read/);
  const broken = Object.create(Object.getPrototypeOf(w.c));
  const b = w.c.aiKeptAway.call(broken);
  assert.deepEqual([shape(b), b.keep_away], [row(ACCOUNT_CHECKS, "AI_KEPT_AWAY"), { reason: null, set_by: null, set_at: null }]);
  assert.equal(w.c.aiKeptAway.length, 0);
});

/* ===== R51: a code of this module's own ===== */

test("R51 keep-away's reason refusal is AI_KEEP_AWAY_NO_REASON on row C-29.32, its number unmoved; the module holds no `NO_REASON` code of its own, so progressions' NO_REASON (C-100.18) reads its own row", () => {
  assert.deepEqual([ACCOUNT_CHECKS.AI_KEEP_AWAY_NO_REASON.check, ACCOUNT_CHECKS.AI_KEEP_AWAY_NO_REASON.where],
    ["C-29.32", "src/credentials/index.mjs aiKeepAwaySet > is-keep-away-reason"]);
  for (const f of [ACCOUNT_CHECKS, AI_CREDENTIAL_CHECKS, SIGN_IN_CHECKS]) assert.ok(!("NO_REASON" in f));
});

/* ===== R53: the mint's digest, from the body only ===== */

test("R53 aiCredentialMint refuses a secretSha that is not 64 lowercase hexadecimal characters AI_CREDENTIAL_NO_SECRET (C-29.33), writing nothing; R12's refusals about the caller and the record come first", async () => {
  const w = await world().group("ann");
  const base = { who: "ann", tokenId: "t1", principalKind: "member" };
  const before = w.snapshot();
  for (const secretSha of [undefined, null, "", "A".repeat(64), "a".repeat(63), "a".repeat(65), "g".repeat(64), ` ${"a".repeat(64)}`,
                           7, ["a".repeat(64)], { s: "a".repeat(64) }]) {
    const r = w.c.aiCredentialMint({ ...base, secretSha });
    assert.deepEqual(shape(r), row(AI_CREDENTIAL_CHECKS, "AI_CREDENTIAL_NO_SECRET"), JSON.stringify(secretSha)?.slice(0, 20));
    assert.match(r.detail, /Nothing was written\.$/);
  }
  assert.equal(w.snapshot(), before, "no refusal writes");
  assert.equal(w.c.aiCredentialMint({ ...base, who: "class:ai" }).reason, "AI_CREDENTIAL_MINT_NOT_A_MEMBER");
  assert.equal(w.c.aiCredentialMint({ ...base, principalKind: "x" }).reason, "AI_CREDENTIAL_PRINCIPAL_UNSTATED");
  assert.equal(w.c.aiCredentialMint({ ...base, expiresInDays: 0 }).reason, "AI_CREDENTIAL_BAD_EXPIRY");
  const ok = w.c.aiCredentialMint({ ...base, secretSha: "0123456789abcdef".repeat(4) });
  assert.equal(ok.ok, true);
  assert.equal(w.c.aiCredentialLook({ secretSha: "0123456789abcdef".repeat(4) }).credential.tokenId, "t1", "a lookup finds it");
});

test("R53 the ops map takes aicredentialmint's secretSha only from the body: a secretSha in the query is never read, so a mint with the digest only there is refused, and the body's wins over the query's", async () => {
  const w = await world().group("ann");
  const before = w.snapshot();
  const q = w.ops(`who=ann&secretSha=${"a".repeat(64)}&sha=${"a".repeat(64)}`, { tokenId: "t1", principalKind: "member" }).aicredentialmint();
  assert.deepEqual(shape(q), row(AI_CREDENTIAL_CHECKS, "AI_CREDENTIAL_NO_SECRET"));
  for (const body of [null, [], "x"])
    assert.equal(w.ops(`who=ann&secretSha=${"a".repeat(64)}&tokenId=t1&principalKind=member`, body).aicredentialmint().reason,
      "AI_CREDENTIAL_PRINCIPAL_UNSTATED", `no body (${JSON.stringify(body)}): nothing read from the query but the stamp`);
  assert.equal(w.snapshot(), before, "nothing written");
  const m = w.ops(`who=ann&secretSha=${"b".repeat(64)}`, { tokenId: "t1", principalKind: "member", secretSha: "c".repeat(64) }).aicredentialmint();
  assert.equal(m.ok, true);
  assert.equal(w.row(`SELECT secret_sha FROM ai_credentials`).secret_sha, "c".repeat(64));
  assert.equal(w.c.aiCredentialLook({ secretSha: "b".repeat(64) }).found, false, "the query's digest was never recorded");
  /* `who` stays the stamp's, after the body */
  assert.equal(w.ops("who=class:ai", { tokenId: "t2", principalKind: "member", who: "ann", secretSha: "d".repeat(64) }).aicredentialmint().reason,
    "AI_CREDENTIAL_MINT_NOT_A_MEMBER");
});
