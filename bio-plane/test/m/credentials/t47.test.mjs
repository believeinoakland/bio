/* T47 (T47-9; N981, N955; K231, K2976, K3027, K3030, K3033), at the interface: the disclosure-first order held here
   (R64's registration seam and its one site of DISCLOSURE_DUE, and R22's T47 clause refusing an API key through it),
   and a run segment's credential minted in the plane (R63). Every refusal has a control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, sha } from "./fixture.mjs";
import { ACCOUNT_CHECKS, AI_CREDENTIAL_CHECKS, AI_RUN_WRITES, AI_RUN_CREDENTIAL_TTL_SECONDS } from "../../../src/credentials/index.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

const WORDS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"));
const word = (key) => {
  const found = [];
  const walk = (v) => {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") { if (v.key === key && typeof v.en === "string") found.push(v.en); Object.values(v).forEach(walk); }
  };
  walk(WORDS);
  assert.equal(found.length, 1, `words.json holds ${key} once`);
  return found[0];
};
const DUE_KEYS = ["check", "code", "detail", "member", "ok", "reason", "translation"];

test("R64 registerDisclosureRead: one registration whoever makes it, malformed and second refused through membership R81; disclosureDue null for shown, DISCLOSURE_DUE (C-29.40) for anything else or a throw, nothing asked with none registered; writes nothing; reached by no route", async () => {
  const w = await world().group("ann");
  /* with none registered: no order is held, and nothing is asked */
  assert.equal(w.c.disclosureDue({ member: "ann" }), null);
  for (const [module, fn] of [[null, () => ({ shown: true })], ["", () => ({ shown: true })], ["instance-setup", null],
                              ["instance-setup", "disclosureOf"], [7, () => ({})]]) {
    const r = w.c.registerDisclosureRead(module, fn);
    assert.deepEqual([r.ok, r.code, r.check, r.translation], [false, "LISTENER_MALFORMED", MEMBERSHIP_CHECKS.LISTENER_MALFORMED.check,
      MEMBERSHIP_CHECKS.LISTENER_MALFORMED.translation], String(module));
  }
  assert.equal(w.c.disclosureDue({ member: "ann" }), null, "a refused registration registers nothing");
  let answer = { ok: true, shown: false };
  const asked = [];
  const fn = (a) => { asked.push(a); if (answer instanceof Error) throw answer; return answer; };
  assert.deepEqual(w.c.registerDisclosureRead("instance-setup", fn), { ok: true, module: "instance-setup" });
  for (const who of ["instance-setup", "plane"]) {
    const second = w.c.registerDisclosureRead(who, () => ({ shown: true }));
    assert.deepEqual([second.ok, second.code, second.module, second.check], [false, "LISTENER_DECLARED", "instance-setup",
      MEMBERSHIP_CHECKS.LISTENER_DECLARED.check], who);
  }
  const before = w.snapshot();
  /* fail closed: every answer but `shown: true`, and a throw, is the one refusal */
  const notShown = [{ ok: true, shown: false }, { shown: "true" }, { shown: 1 }, {}, null, undefined, "shown", true,
                    Promise.resolve({ shown: true }), new Error("store unreadable")];
  for (const a of notShown) {
    answer = a;
    const r = w.c.disclosureDue({ member: "ann" });
    assert.deepEqual(Object.keys(r).sort(), DUE_KEYS, String(a));
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.member],
      [false, "DISCLOSURE_DUE", "DISCLOSURE_DUE", "C-29.40", word("refusal.DISCLOSURE_DUE"), "ann"], String(a));
    assert.ok(typeof r.detail === "string" && r.detail.length > 20);
  }
  answer = { ok: true, member: "ann", shown: true, shown_at: "2026-10-12T00:00:00Z" };
  assert.equal(w.c.disclosureDue({ member: "ann" }), null, "shown: the order is met");
  assert.deepEqual(asked.at(-1), { member: "ann" }, "the registered read is asked for the member named");
  assert.equal(w.snapshot(), before, "R64 writes nothing");
  /* its row: C-29.40, its `where` its one site, its translation words.json's by key (C-69.6's code and sentence) */
  assert.deepEqual(ACCOUNT_CHECKS.DISCLOSURE_DUE, { check: "C-29.40",
    where: "src/credentials/index.mjs disclosureDue > is-disclosure-shown", translation: word("refusal.DISCLOSURE_DUE") });
  const routes = Object.keys(w.ops());
  assert.ok(!routes.some((r) => /disclosure/.test(r)), "in-plane: no route reaches the seam or the read");
});

test("R22 (T47 clause) accountReferenceSet: an API key is refused DISCLOSURE_DUE while R64 answers the disclosure due, asked after every other refusal, writing nothing; held once shown; accountReferenceRemove never refused for it", async () => {
  const w = await world().group("ann", "bob");
  const shown = new Set();
  const asked = [];
  w.c.registerDisclosureRead("instance-setup", ({ member }) => { asked.push(member); return { ok: true, shown: shown.has(member) }; });
  const set = (o) => w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ant-T47-SENTINEL", by: "ann", ...o });
  const before = w.snapshot();
  /* every earlier refusal answers as before, while the disclosure is due */
  const earlier = [[{ by: "class:member" }, "MACHINE_CANNOT_HOLD_ACCOUNT"], [{ by: "bob" }, "NOT_YOUR_ACCOUNT"],
                   [{ kind: "subscription" }, "UNKNOWN_ACCOUNT_KIND"], [{ secret: " " }, "NO_SECRET"]];
  for (const [o, code] of earlier) assert.equal((await set(o)).code, code, code);
  const due = await set({});
  assert.deepEqual([due.ok, due.code, due.check, due.translation], [false, "DISCLOSURE_DUE", "C-29.40", word("refusal.DISCLOSURE_DUE")]);
  assert.equal(asked.at(-1), "ann", "asked for the acting member, the door's stamp");
  /* through the route too: the same refusal */
  assert.equal((await w.ops("by=ann", { member: "ann", kind: "apikey", secret: "sk-ant-T47-SENTINEL" }).accountreferenceset()).code,
    "DISCLOSURE_DUE");
  assert.equal(w.snapshot(), before, "no refusal writes, and the key is held nowhere");
  assert.equal(w.c.accountReferenceState({ member: "ann", viewer: "member:ann" }).held, false);
  /* control: once shown, the key is held */
  shown.add("ann");
  const ok = await set({});
  assert.deepEqual([ok.ok, ok.kind], [true, "apikey"]);
  assert.equal(w.c.accountReferenceState({ member: "ann", viewer: "member:ann" }).held, true);
  /* the member not active is refused as before (asked before the disclosure) */
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.equal((await w.c.accountReferenceSet({ member: "bob", kind: "apikey", secret: "x", by: "bob" })).code,
    "ACCOUNT_MEMBER_NOT_ACTIVE");
  /* removal is never refused for the disclosure */
  shown.delete("ann");
  assert.deepEqual(w.c.accountReferenceRemove({ member: "ann", by: "ann" }), { ok: true, removed: true });
  /* control: with no read registered (a module test with no instance-setup), no order is held */
  const v = await world().group("ann");
  assert.equal((await v.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "x", by: "ann" })).ok, true);
});

/* Date.now moved for the length of `fn`. */
const at = async (ms, fn) => { const real = Date.now; Date.now = () => ms; try { return await fn(); } finally { Date.now = real; } };

test("R63 aiRunCredentialMint: in-plane, member-scoped, its run on its row, its writes AI_RUN_WRITES only, expiring under a day, answered once (only its token's SHA-256 kept); refused in order ACCOUNT_MEMBER_NOT_ACTIVE, AI_RUN_CREDENTIAL_MALFORMED (C-29.41), AI_KEPT_AWAY, each minting nothing", async () => {
  assert.deepEqual(AI_RUN_WRITES, ["airuntick", "suggest", "capturerequest", "airunclose", "optionpropose"]);
  assert.ok(Object.isFrozen(AI_RUN_WRITES));
  assert.ok(Number.isInteger(AI_RUN_CREDENTIAL_TTL_SECONDS) && AI_RUN_CREDENTIAL_TTL_SECONDS > 0
    && AI_RUN_CREDENTIAL_TTL_SECONDS < 24 * 3600, "under one day");
  const w = await world().group("ann", "bob");
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  const before = w.snapshot();
  /* refusals in order: the member first, whatever else is wrong */
  for (const member of ["bob", "nobody", null, "", "class:ai", "token:ai", "member:bob"]) {
    const r = w.c.aiRunCredentialMint({ member, run: "", writes: ["promote"] });
    assert.deepEqual([r.ok, r.code, r.check], [false, "ACCOUNT_MEMBER_NOT_ACTIVE", ACCOUNT_CHECKS.ACCOUNT_MEMBER_NOT_ACTIVE.check], String(member));
  }
  for (const [run, writes, what] of [["", ["airuntick"], "run"], ["  ", ["airuntick"], "run"], [null, ["airuntick"], "run"],
                                      [7, ["airuntick"], "run"], ["RUN-1", [], "writes"], ["RUN-1", null, "writes"],
                                      ["RUN-1", "airuntick", "writes"], ["RUN-1", ["promote"], "writes"],
                                      ["RUN-1", ["airuntick", "airunopen"], "writes"], ["RUN-1", ["airuntick", 5], "writes"]]) {
    const r = w.c.aiRunCredentialMint({ member: "ann", run, writes });
    assert.deepEqual([r.ok, r.code, r.check, r.translation, r.what], [false, "AI_RUN_CREDENTIAL_MALFORMED", "C-29.41",
      AI_CREDENTIAL_CHECKS.AI_RUN_CREDENTIAL_MALFORMED.translation, what], `${run} ${JSON.stringify(writes)}`);
  }
  /* keep-away: the group's limit, whatever uses it covers (R35's aiKeptAway(), asked with no use) */
  assert.equal(w.c.aiKeepAwaySet({ on: true, uses: ["standing"], reason: "a review", by: "second" }).ok, true);
  const mid = w.snapshot();
  const away = w.c.aiRunCredentialMint({ member: "ann", run: "RUN-1", writes: ["airuntick"] });
  assert.deepEqual([away.ok, away.code], [false, "AI_KEPT_AWAY"]);
  assert.equal(w.snapshot(), mid, "kept away: nothing minted");
  assert.equal(w.c.aiKeepAwaySet({ on: false, by: "second" }).ok, true);
  assert.equal(w.rows(`SELECT * FROM ai_credentials`).length, 0, "no refusal minted");
  assert.ok(before.length > 0);
  /* the mint */
  const t0 = Date.parse("2026-10-12T10:00:00Z");
  const ok = await at(t0, () => w.c.aiRunCredentialMint({ member: "member:ann", run: "RUN-1",
    writes: ["airunclose", "suggest", "airuntick", "suggest"] }));
  assert.deepEqual(Object.keys(ok).sort(), ["expiresAt", "ok", "run", "token", "tokenId", "writes"]);
  const expiresAt = new Date(t0 + AI_RUN_CREDENTIAL_TTL_SECONDS * 1000).toISOString().replace(/\.\d+Z$/, "Z");
  assert.deepEqual([ok.ok, ok.run, ok.writes, ok.expiresAt], [true, "RUN-1", ["airuntick", "suggest", "airunclose"], expiresAt]);
  assert.match(ok.token, /^aik-[0-9a-f]{64}$/, "the shape the gate reads");
  const stored = w.row(`SELECT * FROM ai_credentials WHERE token_id=?`, ok.tokenId);
  assert.deepEqual([stored.secret_sha, stored.principal_kind, stored.principal, stored.minted_by, stored.run, stored.confined_to],
    [sha(ok.token), "member", "member:ann", "ann", "RUN-1", null]);
  assert.ok(!w.snapshot().includes(ok.token.slice(4)), "the token is stored nowhere");
  /* the gate's lookup and the list answer its run, writes and expiry */
  const look = await at(t0, () => w.c.aiCredentialLook({ secretSha: sha(ok.token) }));   /* at the mint's instant */
  assert.deepEqual([look.found, look.credential.run, look.credential.writes, look.credential.expiresAt, look.credential.expired,
                    look.credential.revoked, look.credential.principal, look.credential.principalKind],
    [true, "RUN-1", ["airuntick", "suggest", "airunclose"], expiresAt, false, false, "member:ann", "member"]);
  assert.equal(JSON.stringify(look).includes(ok.token), false);
  assert.equal(w.c.aiCredentials({}).credentials.find((x) => x.tokenId === ok.tokenId).run, "RUN-1");
  /* it expires, never renewed */
  await at(t0 + AI_RUN_CREDENTIAL_TTL_SECONDS * 1000 - 1000, () =>
    assert.equal(w.c.aiCredentialLook({ secretSha: sha(ok.token) }).credential.expired, false));
  await at(t0 + AI_RUN_CREDENTIAL_TTL_SECONDS * 1000, () =>
    assert.equal(w.c.aiCredentialLook({ secretSha: sha(ok.token) }).credential.expired, true));
  /* in-plane only */
  assert.ok(!Object.keys(w.ops()).some((r) => /^airun|runcredential/.test(r)), "no route reaches R63");
});

test("R63 revocation: the next segment's mint revokes every earlier credential of its run, at most one live per run; aiRunCredentialsEnd at the run's end; the member's revocation (R16) and her sign-in's disconnection (R43); nothing else changed", async () => {
  const w = await world().group("ann", "cy");
  const live = (t) => !w.c.aiCredentialLook({ secretSha: sha(t.token) }).credential.revoked;
  const mint = (member, run) => w.c.aiRunCredentialMint({ member, run, writes: ["airuntick"] });
  const own = w.c.aiCredentialMint({ who: "ann", tokenId: "ann-own", secretSha: "a".repeat(64), principalKind: "member" });
  assert.equal(own.ok, true);
  const a1 = mint("ann", "RUN-A"), b1 = mint("ann", "RUN-B");
  const a2 = mint("ann", "RUN-A");
  assert.deepEqual([live(a1), live(a2), live(b1)], [false, true, true], "the next segment revokes the earlier one of its run only");
  assert.equal(w.rows(`SELECT * FROM ai_credentials WHERE run='RUN-A' AND revoked_at IS NULL`).length, 1);
  /* the run's end */
  assert.deepEqual(w.c.aiRunCredentialsEnd({ run: "RUN-A" }), { ok: true, revoked: 1 });
  assert.deepEqual([live(a2), live(b1)], [false, true]);
  assert.deepEqual(w.c.aiRunCredentialsEnd({ run: "RUN-A" }), { ok: true, revoked: 0 }, "again: none left");
  assert.deepEqual(w.c.aiRunCredentialsEnd({ run: "RUN-none" }), { ok: true, revoked: 0 });
  for (const run of [null, "", 3]) assert.deepEqual(w.c.aiRunCredentialsEnd({ run }), { ok: true, revoked: 0 });
  /* never throws: a store that cannot be written answers ok: false */
  const broken = await world().group("ann");
  broken.sql.exec(`DROP TABLE ai_credentials`);
  assert.equal(broken.c.aiRunCredentialsEnd({ run: "RUN-A" }).ok, false);
  /* the member's sign-in disconnected: her run credentials end; cy's do not */
  const c1 = mint("cy", "RUN-C");
  assert.equal((await w.signin("ann")).ok, true);
  const b2 = mint("ann", "RUN-B");
  assert.deepEqual(w.c.subscriptionDisconnect({ member: "ann", by: "ann" }), { ok: true, disconnected: true });
  assert.deepEqual([live(b2), live(c1)], [false, true]);
  assert.equal(w.c.aiCredentialLook({ secretSha: "a".repeat(64) }).credential.revoked, false, "her own R12 credential is not touched");
  /* the member's revocation (R16) */
  const c2 = mint("cy", "RUN-D");
  w.m.memberSet({ memberId: "cy", status: "revoked", by: "admin" });
  assert.deepEqual([live(c1), live(c2)], [false, false]);
  assert.equal(w.c.aiCredentialLook({ secretSha: "a".repeat(64) }).credential.revoked, false, "another member's untouched");
});
