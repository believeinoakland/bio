/* Ported from credentials' t35-misc.test.mjs (T48-10; split map §6, K874): its account arms, each under its new id
   with its old one kept. The connected subscription as a fact (R18, was credentials R43), the revocation's reach over
   a sign-in (R27, credentials R16's share), the connected subscriptions' table (R28, R29, credentials R30's share),
   the account's answer (R7, was R35), the group key's switches as an in-plane read (R9, was R37), its row (R33) and
   the words members read (R30, credentials R48's share), at the interface. Agent-credential expiry, the tally, the
   recovery codes and the T35 sign-in routes stay credentials'. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, SEAL, SIGNIN_TOKEN } from "./fixture.mjs";
import { AI_ACCOUNT_CHECKS, AI_ACCOUNTS_TABLES, AiAccounts, aiAccountsOf } from "../../../src/ai-accounts/index.mjs";

const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const SHA = (c) => c.repeat(64);

test("R18 (was credentials R43): subscriptionConnected records that an active member is connected, with the instant, and nothing else; a call carrying any field but `member` SUBSCRIPTION_LOGIN_REFUSED (C-29.29), recording nothing; a member not active ACCOUNT_MEMBER_NOT_ACTIVE", async () => {
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const before = w.snapshot();
  for (const extra of [{ login: "ann@example.org" }, { code: "anthropic-code-123" }, { token: "sk-ant-oat01-x" },
                       { digest: SHA("f") }, { by: "by-sentinel-91" }, { member: "ann", session: "session-sentinel-37" }])
    for (const member of ["ann", "dee"]) {
      const r = w.c.subscriptionConnected({ member, ...extra });
      assert.deepEqual(shape(r), { ok: false, reason: "SUBSCRIPTION_LOGIN_REFUSED", code: "SUBSCRIPTION_LOGIN_REFUSED",
        check: "C-29.29", translation: AI_ACCOUNT_CHECKS.SUBSCRIPTION_LOGIN_REFUSED.translation }, JSON.stringify(extra));
      for (const [k, v] of Object.entries(extra)) if (k !== "member") assert.ok(!JSON.stringify(r).includes(v), "the refusal echoes none of it");
    }
  /* (T47; R31, was credentials R71 (3)) the claimed founder is connected as a member is: not refused here */
  for (const member of ["dee", "ghost", "class:ai", null, ""])
    assert.deepEqual(shape(w.c.subscriptionConnected({ member })), { ok: false, reason: "ACCOUNT_MEMBER_NOT_ACTIVE",
      code: "ACCOUNT_MEMBER_NOT_ACTIVE", check: "C-29.15", translation: AI_ACCOUNT_CHECKS.ACCOUNT_MEMBER_NOT_ACTIVE.translation }, String(member));
  assert.equal(w.snapshot(), before, "recording nothing");
  const r = w.c.subscriptionConnected({ member: "member:ann" });
  assert.deepEqual(Object.keys(r).sort(), ["member", "ok", "since"]);
  assert.deepEqual([r.ok, r.member], [true, "ann"]);
  assert.deepEqual(w.rows(`SELECT member_id, since FROM subscription_connections`), [{ member_id: "ann", since: r.since }], "the fact and its instant");
  assert.deepEqual(Object.keys(w.row(`SELECT * FROM subscription_connections`)).sort(), ["explore", "iv", "member_id", "refused_at",
    "sealed", "since", "standing", "suggestions", "use_account", "use_ask", "use_draft", "use_enquire", "use_read", "use_run",
    "use_transcribe", "valid_until"], "and the sign-in's own switches (R14), and (T47; R19) its token's columns");
  const fact = w.row(`SELECT sealed, iv, valid_until, refused_at FROM subscription_connections`);
  assert.deepEqual(fact, { sealed: null, iv: null, valid_until: null, refused_at: null }, "the fact alone: no login, code or token");
  assert.equal(w.c.accountReferenceState({ member: "ann", viewer: "ann" }).subscription.connected, false,
    "(T47; R19) a fact with no token held answers not connected");
  assert.deepEqual(w.c.subscriptionConnected({ member: "ann" }).since, r.since, "connected since the first");
  assert.ok(!Object.keys(w.ops()).some((op) => op === "subscriptionconnected"), "reached by no route");
});

test("R18 R2 R19 (was credentials R43 R23 R70): accountReferenceState answers it to the member alone as subscription {connected, since, held}; subscriptionDisconnect is the member's own act (R1's refusals); since T38 accountFor reads it (R7); (T47) with its held token", async () => {
  const w = await world().group("ann", "bob");
  const since = (await w.signin("ann")).since;
  assert.deepEqual(w.c.accountReferenceState({ member: "ann", viewer: "ann" }).subscription, { connected: true, since, held: true,
    uses: { ask: true, draft: true, run: true, standing: false, explore: "no", enquire: true, read: true, transcribe: true, account: true, suggestions: false } });
  assert.deepEqual(w.c.accountReferenceState({ member: "bob", viewer: "bob" }).subscription, { connected: false, since: null, held: false, uses: null });
  for (const viewer of ["bob", "second", "admin"]) assert.equal(w.c.accountReferenceState({ member: "ann", viewer }).reason, "NOT_YOUR_ACCOUNT");
  /* T38: served by her own sign-in (R7); bob, not connected, by nothing */
  assert.deepEqual(await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }),
    { ok: true, kind: "signin", level: "member", member: "ann", key: SIGNIN_TOKEN("ann") });
  assert.equal((await w.c.accountFor({ member: "bob", act: { kind: "ask", member: "bob" } })).reason, "NO_ACCOUNT");
  const before = w.snapshot();
  for (const [by, code] of [[null, "MACHINE_CANNOT_HOLD_ACCOUNT"], ["class:ai", "MACHINE_CANNOT_HOLD_ACCOUNT"],
                            ["bob", "NOT_YOUR_ACCOUNT"], ["second", "NOT_YOUR_ACCOUNT"], ["admin", "NOT_YOUR_ACCOUNT"]])
    assert.equal(w.c.subscriptionDisconnect({ member: "ann", by }).reason, code, String(by));
  assert.equal(w.snapshot(), before);
  assert.deepEqual(w.c.subscriptionDisconnect({ member: "ann", by: "member:ann" }), { ok: true, disconnected: true });
  assert.deepEqual(w.c.accountReferenceState({ member: "ann", viewer: "ann" }).subscription, { connected: false, since: null, held: false, uses: null });
  assert.equal((await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })).reason, "NO_ACCOUNT", "disconnected: served by nothing");
  assert.deepEqual(w.c.subscriptionDisconnect({ member: "ann", by: "ann" }), { ok: true, disconnected: false });
  assert.deepEqual(w.ops("by=bob", { member: "ann" }).subscriptiondisconnect(), { ok: true, disconnected: false }, "the route acts for the stamped member only");
});

test("R27 (credentials R16's share): a member's revocation clears their connected subscription, in the same act; no one else's", async () => {
  const w = await world().group("ann");
  const p = await w.m.memberAdd({ memberId: "third", cover: "c3", role: "admin", by: "admin" });
  const e = await w.m.adminEndorse({ memberId: "third", by: "second" });
  assert.equal(p.reason, "CONSENSUS_REQUIRED");
  await w.m.enroll({ invite: e.invite, handle: "third", password: "third-passphrase-x" });
  for (const id of ["third", "ann"]) await w.signin(id);
  const r = await (async () => {
    for (const by of ["admin", "second"]) { const v = w.m.adminRemove({ memberId: "third", by, reason: "r" }); if (v.ok) return v; }
    return null;
  })();
  assert.equal(r?.ok, true);
  assert.deepEqual(w.rows(`SELECT member_id FROM subscription_connections`).map((x) => x.member_id), ["ann"]);
});

test("R28 R29 (credentials R30's share): the connected subscriptions' table is declared through declareTable, never exported, exempt from purge, its owner's; no table of this module is exported", () => {
  const w = world();
  const cls = (t) => w.core.declared.get(t)?.classes;
  assert.deepEqual([cls("subscription_connections").purge, cls("subscription_connections").export, cls("subscription_connections").sight],
    ["exempt", "never", "owner"]);
  assert.ok(AI_ACCOUNTS_TABLES.every((t) => t.export !== "yes"));
});

test("R7 (was credentials R35): accountFor answers {ok, kind, level, key} and nothing else, the shape agent-worker R6 carries on the wire with `key` as `secret`", async () => {
  const w = await world().group("ann", "bob");
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ant-api03-ann", by: "ann" });
  await w.c.groupKeySet({ key: "sk-group", by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  w.c.groupKeyNoticeSeen({ member: "bob", by: "bob" });
  for (const [m, level, kind, key] of [["ann", "member", "apikey", "sk-ant-api03-ann"], ["bob", "group", "apikey", "sk-group"]]) {
    const r = await w.c.accountFor({ member: m, act: { kind: "run", member: m } });
    assert.deepEqual(r, { ok: true, kind, level, key }, m);
    const wire = { kind: r.kind, level: r.level, secret: r.key, member: m };
    assert.deepEqual(Object.keys(wire), ["kind", "level", "secret", "member"]);
  }
});

test("R9 (was credentials R37): groupKeySwitches answers {on, suggestions, standing} for the group key and never the key; reached by no route; writes nothing; never throws", async () => {
  const w = await world().group("ann");
  assert.deepEqual(w.c.groupKeySwitches(), { on: false, suggestions: false, standing: false });
  await w.c.groupKeySet({ key: "sk-ant-api03-SWITCHES", by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  w.c.accountUsesSet({ owner: "group", switch: "suggestions", on: true, by: "second" });
  const before = w.snapshot();
  const r = w.c.groupKeySwitches();
  assert.deepEqual(r, { on: true, suggestions: true, standing: false });
  assert.ok(!JSON.stringify(r).includes("SWITCHES"));
  assert.equal(w.snapshot(), before);
  w.c.groupKeyRemove({ by: "admin" });
  assert.deepEqual(w.c.groupKeySwitches(), { on: false, suggestions: false, standing: false });
  assert.ok(!Object.keys(w.ops()).some((op) => /switches/.test(op)));
  const broken = Object.create(Object.getPrototypeOf(w.c));
  assert.deepEqual(w.c.groupKeySwitches.call(broken), { on: false, suggestions: false, standing: false });
});

test("R18 R33 (was credentials R43's row): SUBSCRIPTION_LOGIN_REFUSED keeps C-29.29, its `where` naming its one site here; one id per row across the module's rows, frozen", () => {
  assert.deepEqual([AI_ACCOUNT_CHECKS.SUBSCRIPTION_LOGIN_REFUSED.check, AI_ACCOUNT_CHECKS.SUBSCRIPTION_LOGIN_REFUSED.where],
    ["C-29.29", "src/ai-accounts/index.mjs subscriptionConnected > is-subscription-fact"]);
  assert.ok(Object.isFrozen(AI_ACCOUNT_CHECKS) && Object.isFrozen(AI_ACCOUNT_CHECKS.SUBSCRIPTION_LOGIN_REFUSED));
  const ids = Object.values(AI_ACCOUNT_CHECKS).map((r) => r.check);
  assert.equal(new Set(ids).size, ids.length);
});

test("R30 (credentials R48's share): the account sweep rows (DEC-149): each member-facing string says \"your group's Civicsmith\" where it said this instance, this copy or its seal secret, as answered at the interface", async () => {
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const has = (text, s) => assert.ok(String(text).includes(s), `${s}\n  in: ${text}`);
  /* C-29.22 and its detail */
  const bare = await world({ sealSecret: null }).group("ann");
  const unsealed = await bare.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk", by: "ann" });
  has(unsealed.translation, "Your group's Civicsmith cannot keep a key sealed right now, because its sealing secret is not set or has changed.");
  has(unsealed.translation, "Ask whoever hosts your group's Civicsmith to set it.");
  has(unsealed.detail, "your group's Civicsmith has no seal secret set, so a key cannot be kept sealed or read.");
  /* the unknown kind's detail */
  has((await w.c.accountReferenceSet({ member: "ann", kind: "oauth", secret: "sk", by: "ann" })).detail,
    "the kind your group's Civicsmith holds is apikey; a Claude subscription is connected through Claude Code's own sign-in");
  /* a sealed key that no longer opens */
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  await w.c.groupKeySet({ key: "sk-group", by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  w.c.groupKeyNoticeSeen({ member: "dee", by: "dee" });
  const other = aiAccountsOf({ storage: { sql: w.sql } }, { record: w.core, membership: w.m, sealSecret: `${SEAL}-changed` });
  has((await other.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })).detail,
    "the reference does not open under the seal secret of your group's Civicsmith, which has changed");
  w.c.groupKeyNoticeSeen({ member: "second", by: "second" });
  has((await other.accountFor({ member: "second", act: { kind: "ask", member: "second" } })).detail,
    "the group's key does not open under the seal secret of your group's Civicsmith, which has changed");
});

test("R30 (credentials R48's share; T36's R7 and R20 included): no member- or founder-facing string this module answers calls the group's Civicsmith a copy, an instance, a plane or a server, nor its seal secret bound: every row's translation and every refusal's detail and remedy", async () => {
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const said = [];
  const keep = async (p) => { said.push(await p); };
  for (const r of Object.values(AI_ACCOUNT_CHECKS)) said.push({ translation: r.translation });
  said.push({ detail: AiAccounts.GROUP_KEY_NOTICE_TEXT });
  const bare = await world({ sealSecret: null }).group("ann");
  for (const p of [
    w.c.accountReferenceSet({ member: "ann", kind: "x", secret: "s", by: "ann" }), w.c.accountReferenceSet({ member: "ann", by: null }),
    w.c.accountReferenceSet({ member: "ann", by: "dee" }), w.c.accountReferenceSet({ member: "dee", by: "dee" }),
    w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "", by: "ann" }), w.c.accountUsesSet({ owner: "member:ann", switch: "x", by: "ann" }),
    w.c.accountReferenceFor({ member: "ann", act: null }), w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }),
    w.c.groupKeySet({ key: "k", by: "ann" }), w.c.groupKeyState({ viewer: null }),
    w.c.subscriptionConnected({ member: "ann", token: "t" }), w.c.subscriptionConnected({ member: "dee" }),
    bare.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "s", by: "ann" }),
    /* T36's refusal: AI_KEEP_AWAY_NO_REASON */
    w.c.aiKeepAwaySet({ on: true, by: "admin" })]) await keep(p);
  /* AI_KEPT_AWAY, read and unread */
  w.c.aiKeepAwaySet({ on: true, reason: "r", by: "admin" });
  await keep(w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }));
  w.sql.exec(`DROP TABLE ai_keep_away`);
  await keep(w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }));
  let n = 0;
  /* membership's NOT_AN_ADMIN (C-96.1), answered through its `notAnAdmin`, is membership's string (its R112) */
  for (const a of said.filter((x) => x?.check !== "C-96.1"))
    for (const k of ["translation", "detail", "remedy", "message", "stated"]) {
      if (typeof a?.[k] !== "string") continue;
      n++;
      assert.doesNotMatch(a[k], /\b(?:instance|copy|copies|plane|server)\b/i, `${k}: ${a[k]}`);
      assert.doesNotMatch(a[k], /seal secret bound|secret is bound|no seal secret bound/i, `${k}: ${a[k]}`);
    }
  assert.ok(n > 40, `strings read: ${n}`);
});
