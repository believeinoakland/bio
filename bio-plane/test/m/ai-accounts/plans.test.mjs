/* ai-accounts R19, R42, R44, R46, R47, R69, R73 at the interface: plan scope enforced from the catalogue, the gateway and its
   key, an issued account's token, the sealed hold, the entries an account allows and the ceilings above it, and a personal
   subscription's record. Every id is tested with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SECRET } from "./fixture.mjs";
import { PLANS as P, ENTRIES as E, addTerm, HOSTS } from "./catalogue.mjs";
import { shape, refusal, ask, projectWorld, on, leaks } from "./helpers.mjs";
import { AI_ACCOUNT_CHECKS } from "../../../src/ai-accounts/index.mjs";

const TOKEN = (who) => `sk-ant-oat01-sentinel-${who}-0123456789`;
const sub = (w, owner, by, more = {}) => w.a.accountSet({ owner, provider: P.provider, plan: P.subscription, means: "issued", secret: TOKEN(by), by, ...more });

test("R42: plan scope is enforced from the catalogue: a member-scope API plan at team level is PLAN_SCOPE_REFUSED; a personal subscription at team and at project level PERSONAL_SUBSCRIPTION_LEVEL, each naming the plan and the level; the same plans at member level accepted; control: a team-scope subscription at team level accepted, an `unconfirmed` API plan accepted anywhere", async () => {
  const w = await projectWorld();
  const a = await w.a.accountSet({ owner: "group", provider: P.provider, plan: P.memberApi, means: "sealed", secret: "s", by: "admin" });
  assert.deepEqual(shape(a), refusal("PLAN_SCOPE_REFUSED"));
  assert.deepEqual([a.plan, a.level], [P.memberApi, "group"]);
  assert.match(a.detail, new RegExp(`${P.memberApi}.*team level`));
  assert.equal((await w.a.accountSet({ owner: "project:P", provider: P.provider, plan: P.memberApi, means: "sealed", secret: "s", by: "ann" })).reason, "PLAN_SCOPE_REFUSED");
  for (const [owner, by] of [["group", "admin"], ["project:P", "ann"]]) {
    const r = await sub(w, owner, by);
    assert.deepEqual(shape(r), refusal("PERSONAL_SUBSCRIPTION_LEVEL"), owner);
    assert.deepEqual([r.plan, r.level], [P.subscription, owner === "group" ? "group" : "project"]);
  }
  assert.equal((await w.a.accountSet({ owner: "member:ann", provider: P.provider, plan: P.memberApi, means: "sealed", secret: "s", by: "ann" })).ok, true, "member level");
  assert.equal((await sub(w, "member:ann", "ann")).ok, true, "member level");
  assert.equal((await w.a.accountSet({ owner: "group", provider: P.provider, plan: P.teamSubscription, means: "issued", secret: TOKEN("team"), by: "admin" })).ok, true, "team-scope subscription at team level");
  assert.equal((await w.a.accountSet({ owner: "group", provider: P.freeProvider, plan: P.freeApi, means: "sealed", secret: "s", by: "admin" })).ok, true, "unconfirmed restricts nothing");
  assert.equal((await w.a.accountSet({ owner: "project:P", provider: P.freeProvider, plan: P.freeApi, means: "sealed", secret: "s", by: "ann" })).ok, true);
  assert.equal(w.rows(`SELECT 1 FROM ai_accounts WHERE owner='group' AND plan=?`, P.memberApi).length, 0, "no refusal left a row");
});

test("R44 R73: a key reaches a gateway account by (a) gatewayKeyEnter: handed to the port's put and kept nowhere (in no table, history row, log, error, export or answer, nor a digest), or (b) gatewayKeyAttest, only when the port's exists says so; either records held and the route; a port refusal is GATEWAY_STORE_REFUSED writing nothing; with no port, GATEWAY_UNAVAILABLE naming who can grant it", async () => {
  const w = await projectWorld();
  const noPort = { grant: { extra: { grant_by: "hosting_account" } } };
  const unavailable = await w.a.accountSet({ owner: "group", provider: P.provider, plan: P.teamApi, means: "gateway", by: "admin" });
  assert.deepEqual(shape(unavailable), refusal("GATEWAY_UNAVAILABLE"));
  assert.deepEqual(unavailable.extra, noPort.grant.extra, "R73: the one who holds the team's Cloudflare account");
  assert.equal(unavailable.detail, AI_ACCOUNT_CHECKS.GATEWAY_UNAVAILABLE.translation, "its words name who can grant it and what works without it (R73)");
  assert.equal((await w.team()).ok, true, "a sealed account is set in the same copy with no port");
  const puts = [];
  const flags = { refuse: false };
  let there = false;
  const port = { create: async () => "gw-77", put: async (id, key) => { puts.push([id, key]); return !flags.refuse; }, exists: async () => there };
  assert.equal(w.a.registerGatewayStore("root", port).ok, true);
  assert.equal(w.a.registerGatewayStore("other", port).code, "LISTENER_DECLARED");
  assert.equal(w.a.registerGatewayStore("root", { put() {} }).code, "LISTENER_MALFORMED");
  const t = await w.a.accountSet({ owner: "group", provider: P.provider, plan: P.teamApi, means: "gateway", by: "admin" });
  assert.deepEqual([t.ok, t.means, t.held], [true, "gateway", false], "no key held: it serves nothing");
  assert.equal(w.row(`SELECT gateway_id FROM ai_accounts WHERE account_id=?`, t.account_id).gateway_id, "gw-77");
  /* (a) enter */
  const KEY = "gw-key-sentinel-0123456789abcdef";
  flags.refuse = true;
  const before = w.snapshot();
  assert.deepEqual(shape(await w.a.gatewayKeyEnter({ account_id: t.account_id, key: KEY, by: "admin" })), refusal("GATEWAY_STORE_REFUSED"));
  assert.equal(w.snapshot(), before, "a port refusal writes nothing");
  flags.refuse = false;
  for (const by of ["ann", "class:ai", null]) assert.equal((await w.a.gatewayKeyEnter({ account_id: t.account_id, key: KEY, by })).reason, "NOT_AN_ADMIN", String(by));
  assert.equal((await w.a.gatewayKeyEnter({ account_id: t.account_id, key: "", by: "admin" })).reason, "NO_SECRET");
  const ok = await w.a.gatewayKeyEnter({ account_id: t.account_id, key: KEY, by: "admin" });
  assert.deepEqual([ok.ok, ok.held, ok.route], [true, true, "screen"]);
  assert.deepEqual(puts, [["gw-77", KEY], ["gw-77", KEY]], "the port received the key, once by the refused try and once by the accepted");
  assert.deepEqual(leaks(w, KEY, { allow: [], answers: [ok, w.a.accountState({ account_id: t.account_id, viewer: "admin" }), w.a.accountHistory({ owner: "group", viewer: "admin" })] }), []);
  assert.equal(w.a.accountState({ account_id: t.account_id, viewer: "admin" }).held, true);
  /* (b) attest, on a second gateway account */
  const t2 = await w.a.accountSet({ owner: "project:P", provider: P.provider, plan: P.teamApi, means: "gateway", by: "ann" });
  const absent = w.snapshot();
  assert.deepEqual(shape(await w.a.gatewayKeyAttest({ account_id: t2.account_id, by: "ann" })), refusal("GATEWAY_KEY_ABSENT"));
  assert.equal(w.snapshot(), absent, "recording nothing");
  there = true;
  const att = await w.a.gatewayKeyAttest({ account_id: t2.account_id, by: "ann" });
  assert.deepEqual([att.ok, att.held, att.route], [true, true, "dashboard"]);
  assert.equal((await w.a.gatewayKeyAttest({ account_id: t2.account_id, by: "bob" })).reason, "PROJECT_ACT_NOT_THE_OWNER");
  /* neither clears a payer flag (R68): entering a key on a flagged account leaves the flag standing */
  w.a.gatewayServedCheck({ account_id: t.account_id, record: { gateway_id: "gw-77", own_key_served: false, platform_credits_used: true } });
  await w.a.gatewayKeyEnter({ account_id: t.account_id, key: KEY, by: "admin" });
  assert.equal(w.a.accountState({ account_id: t.account_id, viewer: "admin" }).flagged, true);
  /* a non-gateway account refuses both */
  const s = await w.team({ secret: SECRET("t2") });
  assert.equal((await w.a.gatewayKeyEnter({ account_id: s.account_id, key: KEY, by: "admin" })).reason, "MEANS_NOT_ALLOWED");
});

test("R19: an issued account's token, held sealed: issuedTokenHold replaces any earlier token and answers {ok, since} and never the token or a digest; ISSUED_TOKEN_MALFORMED outside the plan's bounds; ACCOUNT_MEMBER_NOT_ACTIVE for an owner not active; issuedTokenRefused drops it, records refused_at and tells the listeners once; disconnecting and removing drop it; an issued account with no token held is held: false; control: a sealed account is unchanged", async () => {
  const w = await projectWorld();
  const told = [];
  assert.equal(w.a.onAccountCleared("credentials", (n) => told.push(n)).ok, true);
  const x = await sub(w, "member:ann", "ann");
  assert.deepEqual([x.ok, x.means, x.held], [true, "issued", true]);
  assert.deepEqual(shape(await sub(w, "member:ann", "ann", { secret: "too-short" })), refusal("ISSUED_TOKEN_MALFORMED"));
  const bounds = await w.a.issuedTokenHold({ account_id: x.account_id, token: "x".repeat(201) });
  assert.deepEqual([bounds.reason, bounds.min, bounds.max], ["ISSUED_TOKEN_MALFORMED", 20, 200]);
  assert.equal((await w.a.issuedTokenHold({ account_id: x.account_id, token: "short" })).reason, "ISSUED_TOKEN_MALFORMED");
  const NEW = TOKEN("ann-new");
  const held = await w.a.issuedTokenHold({ account_id: x.account_id, token: NEW, valid_until: "30 days" });
  assert.deepEqual(Object.keys(held).sort(), ["ok", "since"]);
  assert.equal(w.row(`SELECT valid_until FROM ai_accounts WHERE account_id=?`, x.account_id).valid_until > held.since, true, "a stated 30 days");
  assert.deepEqual(leaks(w, NEW, { answers: [held] }), []);
  assert.deepEqual(leaks(w, TOKEN("ann")), []);
  w.a.accountSwitch({ account_id: x.account_id, on: true, by: "ann" });
  w.a.recipientNoticeSeen({ member: "ann", provider: P.provider, host: HOSTS.main, by: "ann" });
  assert.equal((await w.a.accountFor({ member: "ann", act: ask("ann") })).secret, NEW, "the replacement is the token held");
  /* refused: dropped, refused_at recorded, listeners told once, held: false and it serves nothing */
  assert.deepEqual(w.a.issuedTokenRefused({ account_id: x.account_id }), { ok: true, dropped: true });
  assert.deepEqual(told.map((n) => [n.account_id, n.why, n.means, n.member, n.by]), [[x.account_id, "refused", "issued", "ann", null]]);
  const row = w.row(`SELECT held, sealed, refused_at FROM ai_accounts WHERE account_id=?`, x.account_id);
  assert.deepEqual([row.held, row.sealed, typeof row.refused_at], [0, null, "string"]);
  assert.equal((await w.a.accountFor({ member: "ann", act: ask("ann") })).reason, "NO_ACCOUNT");
  assert.deepEqual(w.a.issuedTokenRefused({ account_id: x.account_id }), { ok: true, dropped: false });
  assert.equal(told.length, 1, "a token with none held tells no one");
  /* hold again, disconnect (the owner's act), then removal */
  await w.a.issuedTokenHold({ account_id: x.account_id, token: NEW });
  assert.equal(w.a.issuedTokenDrop({ account_id: x.account_id, by: "bob" }).reason, "NOT_YOUR_ACCOUNT");
  assert.deepEqual(w.a.issuedTokenDrop({ account_id: x.account_id, by: "ann" }), { ok: true, account_id: x.account_id, disconnected: true });
  assert.equal(told.at(-1).why, "disconnected");
  await w.a.issuedTokenHold({ account_id: x.account_id, token: NEW });
  w.a.accountRemove({ account_id: x.account_id, by: "ann" });
  assert.equal(told.at(-1).why, "removed");
  assert.deepEqual(told.map((n) => n.why), ["refused", "disconnected", "removed"]);
  /* an owner not active: refused */
  const y = await sub(w, "member:bob", "bob");
  w.sql.exec(`UPDATE members SET status='suspended' WHERE member_id='bob'`);
  assert.equal((await w.a.issuedTokenHold({ account_id: y.account_id, token: TOKEN("bob2") })).reason, "ACCOUNT_MEMBER_NOT_ACTIVE");
  /* control: a sealed account has no token to drop */
  const s = await w.own("cy");
  assert.deepEqual(w.a.issuedTokenRefused({ account_id: s.account_id }), { ok: true, dropped: false });
  assert.equal(w.row(`SELECT held FROM ai_accounts WHERE account_id=?`, s.account_id).held, 1);
  assert.equal((await w.a.issuedTokenHold({ account_id: s.account_id, token: NEW })).reason, "NOT_YOUR_ACCOUNT");
});

test("R69: aiKeySeal replaces an existing account's credential with a sealed one, exactly as accountSet does and in its order: the owner's authority (an administrator for the team, an owner for a project, the member alone, a machine credential MACHINE_CANNOT_HOLD_ACCOUNT), NO_SECRET, MEANS_NOT_ALLOWED when the plan lacks sealed, DISCLOSURE_DUE for a member, an account not there or another owner's NOT_YOUR_ACCOUNT; answers {ok, account_id, means: sealed, held: true, since}; a sentinel appears in no table but the sealed column and no answer", async () => {
  const w = await projectWorld();
  w.a.registerGatewayStore("root", { create: async () => "gw-s", put: async () => true, exists: async () => true });
  const team = await w.a.accountSet({ owner: "group", provider: P.provider, plan: P.teamApi, means: "gateway", by: "admin" });
  const proj = await w.a.accountSet({ owner: "project:P", provider: P.provider, plan: P.teamApi, means: "gateway", by: "ann" });
  const mine = await w.a.accountSet({ owner: "member:ann", provider: P.provider, plan: P.memberApi, means: "reference", reference: { store: "v", locator: "l" }, by: "ann" });
  const KEY = "sealed-hold-sentinel-0123456789";
  const outs = [];
  for (const [x, by] of [[team, "admin"], [proj, "ann"], [mine, "ann"]]) {
    const r = await w.a.aiKeySeal({ account_id: x.account_id, secret: KEY + by, by });
    outs.push(r);
    assert.deepEqual([r.ok, r.account_id, r.means, r.held], [true, x.account_id, "sealed", true], by);
    assert.match(r.since, /^\d{4}-/);
    assert.equal(w.row(`SELECT means FROM ai_accounts WHERE account_id=?`, x.account_id).means, "sealed");
  }
  assert.deepEqual(leaks(w, KEY + "admin", { answers: outs }), []);
  assert.deepEqual(leaks(w, KEY + "ann", { answers: outs }), []);
  const hist = w.a.accountHistory({ owner: "group", viewer: "admin" }).changes.filter((c) => c.change === "account_set").at(-1);
  assert.deepEqual([hist.replaced, hist.old_means, hist.means], [true, "gateway", "sealed"], "recorded with the old and new means, never a secret");
  /* the secret is read only through accountFor or accountSecretFor, for the act that runs */
  assert.equal((await w.a.accountSecretFor({ account_id: mine.account_id, act: ask("ann") })).secret, KEY + "ann");
  /* control: refusals in order, none leaving a row */
  const before = w.snapshot();
  assert.equal((await w.a.aiKeySeal({ account_id: team.account_id, secret: "k", by: "ann" })).reason, "NOT_AN_ADMIN");
  assert.equal((await w.a.aiKeySeal({ account_id: mine.account_id, secret: "k", by: "bob" })).reason, "NOT_YOUR_ACCOUNT");
  for (const by of [null, "class:ai", "token:ai"]) assert.equal((await w.a.aiKeySeal({ account_id: team.account_id, secret: "k", by })).reason, "MACHINE_CANNOT_HOLD_ACCOUNT", String(by));
  assert.equal((await w.a.aiKeySeal({ account_id: team.account_id, secret: "", by: "admin" })).reason, "NO_SECRET");
  assert.equal((await w.a.aiKeySeal({ account_id: "acct-none", secret: "k", by: "ann" })).reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.snapshot(), before);
  const sub1 = await sub(w, "member:bob", "bob");
  assert.equal((await w.a.aiKeySeal({ account_id: sub1.account_id, secret: "k", by: "bob" })).reason, "MEANS_NOT_ALLOWED", "the plan does not allow sealed");
  w.a.registerDisclosureRead("instance-setup", () => ({ shown: false }));
  assert.equal((await w.a.aiKeySeal({ account_id: mine.account_id, secret: "k", by: "ann" })).reason, "DISCLOSURE_DUE");
  assert.equal((await w.a.aiKeySeal({ account_id: team.account_id, secret: "k2", by: "admin" })).ok, true, "the team's is asked no disclosure");
});

test("R46: an account's entries are an ordered allow-list of entries of its plan, non-empty (ENTRIES_EMPTY), each in the plan (ENTRY_NOT_ALLOWED), changed by accountEntriesSet with the owner's authority; omitted at set, the plan's entries in catalogue order; recorded", async () => {
  const w = await projectWorld();
  const x = await w.own("ann", { entries: [E.b, E.a] });
  assert.deepEqual(x.entries, [E.b, E.a], "in the order given");
  assert.deepEqual((await w.own("bob")).entries, [E.a, E.b], "omitted: the plan's, in catalogue order");
  assert.equal((await w.own("cy", { entries: [] })).reason, "ENTRIES_EMPTY");
  const bad = await w.own("cy", { entries: [E.free] });
  assert.deepEqual([bad.reason, bad.entry], ["ENTRY_NOT_ALLOWED", E.free], "an entry of another plan");
  assert.equal((await w.own("cy", { entries: ["no-such-entry"] })).reason, "ENTRY_NOT_ALLOWED");
  assert.equal(w.a.accountEntriesSet({ account_id: x.account_id, entries: [E.a], by: "ann" }).entries.join(), E.a);
  assert.equal(w.a.accountEntriesSet({ account_id: x.account_id, entries: [], by: "ann" }).reason, "ENTRIES_EMPTY");
  assert.equal(w.a.accountEntriesSet({ account_id: x.account_id, entries: [E.free], by: "ann" }).reason, "ENTRY_NOT_ALLOWED");
  assert.equal(w.a.accountEntriesSet({ account_id: x.account_id, entries: [E.b], by: "bob" }).reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.a.accountState({ account_id: x.account_id, viewer: "ann" }).entries.join(), E.a);
  assert.equal(w.a.accountHistory({ owner: "member:ann", viewer: "ann" }).changes.some((c) => c.change === "entries_set" && c.entries.join() === E.a), true);
});

test("R46: the ceilings above the accounts: offeredSet sets an owner's ceiling (the team's by administrators, a project's by its owners, a member's own by that member; null: none); a lower level's set must lie inside the team's, else NARROWING_ONLY naming the entry; for an act the entries allowed are the intersection of the account's list, the team's ceiling, the project's when the act is directly in it and the member's own, so a later shrink above drops out below with no rewrite", async () => {
  const w = await projectWorld();
  const x = await on(w, w.own("ann"));
  w.a.recipientNoticeSeen({ member: "ann", provider: P.provider, host: HOSTS.main, by: "ann" });
  assert.deepEqual(w.a.offeredSet({ owner: "group", entries: [E.a, E.b], by: "admin" }), { ok: true, owner: "group", entries: [E.a, E.b] });
  const out = w.a.offeredSet({ owner: "project:P", entries: [E.a, E.free], by: "ann" });
  assert.deepEqual([out.reason, out.entry], ["NARROWING_ONLY", E.free]);
  assert.match(out.detail, new RegExp(E.free));
  assert.equal(w.a.offeredSet({ owner: "member:ann", entries: [E.builtin], by: "ann" }).reason, "NARROWING_ONLY");
  assert.equal(w.a.offeredSet({ owner: "project:P", entries: [E.b], by: "ann" }).ok, true, "inside the team's");
  assert.equal((await w.a.accountFor({ member: "ann", act: ask("ann", "P") })).entry_id, E.b, "the project's ceiling cuts the project's act");
  assert.equal((await w.a.accountFor({ member: "ann", act: ask("ann") })).entry_id, E.a, "outside the project, the account's order");
  assert.equal(w.a.offeredSet({ owner: "member:ann", entries: [E.b], by: "ann" }).ok, true);
  assert.equal((await w.a.accountFor({ member: "ann", act: ask("ann") })).entry_id, E.b, "the member's own");
  /* the team shrinking its ceiling removes the entry from a project's effective set with no write */
  const before = w.snapshot();
  w.a.offeredSet({ owner: "group", entries: [E.a], by: "admin" });
  const after = w.rows(`SELECT owner, entries FROM ai_offered ORDER BY owner`);
  assert.deepEqual(after.map((r) => [r.owner, JSON.parse(r.entries)]), [["group", [E.a]], ["member:ann", [E.b]], ["project:P", [E.b]]], "nothing below was rewritten");
  const refused = await w.a.accountFor({ member: "ann", act: ask("ann", "P") });
  assert.equal(refused.reason, "NO_ENTRY_OFFERED", "the shrink drops the entry below");
  assert.notEqual(before, null);
  w.a.offeredSet({ owner: "group", entries: null, by: "admin" });
  assert.equal((await w.a.accountFor({ member: "ann", act: ask("ann", "P") })).entry_id, E.b);
  /* authority and shape */
  assert.equal(w.a.offeredSet({ owner: "group", entries: [E.a], by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.a.offeredSet({ owner: "project:P", entries: [E.a], by: "bob" }).reason, "PROJECT_ACT_NOT_THE_OWNER");
  assert.equal(w.a.offeredSet({ owner: "member:ann", entries: [E.a], by: "bob" }).reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.a.offeredSet({ owner: "group", entries: [], by: "admin" }).reason, "ENTRIES_EMPTY");
  assert.equal(w.a.offeredSet({ owner: "group", entries: ["no-such"], by: "admin" }).reason, "ENTRY_NOT_ALLOWED");
  assert.deepEqual(w.a.offeredOf({ owner: "member:ann", viewer: "ann" }), { ok: true, owner: "member:ann", entries: [E.b] });
  assert.equal(w.a.offeredOf({ owner: "member:ann", viewer: "bob" }).reason, "NOT_YOUR_ACCOUNT");
  assert.equal(x.ok, true);
});

test("R47 R48: connecting a personal subscription records {member, at, plan, terms_version, account_id} in the same act; personalChoiceState answers the member alone and `stale: true` once the catalogue's terms version has changed, and a stale record does not stop serving; control: a sealed API account has no record", async () => {
  const w = await projectWorld();
  const t1 = w.catalogue.plansOf({ provider: P.provider }).flatMap((g) => g.plans).find((p) => p.plan_id === P.subscription).terms_version;
  const x = await sub(w, "member:ann", "ann", { terms_version: t1 });
  assert.equal(x.ok, true);
  const st = w.a.personalChoiceState({ account_id: x.account_id, viewer: "ann" });
  assert.deepEqual({ ...st, record: { ...st.record, at: null } }, { ok: true, account_id: x.account_id, record: { member: "ann", at: null, plan: P.subscription, terms_version: t1, account_id: x.account_id }, stale: false });
  assert.match(st.record.at, /^\d{4}-/);
  for (const viewer of ["bob", "admin", "class:ai", null]) assert.equal(w.a.personalChoiceState({ account_id: x.account_id, viewer }).ok, false, String(viewer));
  w.a.accountSwitch({ account_id: x.account_id, on: true, by: "ann" });
  w.a.recipientNoticeSeen({ member: "ann", provider: P.provider, host: HOSTS.main, by: "ann" });
  await addTerm(w, P.subscription);
  const changed = w.a.personalChoiceState({ account_id: x.account_id, viewer: "ann" });
  assert.deepEqual([changed.stale, changed.record.terms_version], [true, t1], "the catalogue's version changed: the record is stale");
  assert.equal((await w.a.accountFor({ member: "ann", act: ask("ann") })).ok, true, "a stale record does not stop serving");
  assert.equal(w.a.personalChoiceState({ account_id: (await w.own("bob")).account_id, viewer: "bob" }).ok, false, "control: not a personal subscription");
  assert.equal(w.a.accountHistory({ owner: "member:ann", viewer: "ann" }).changes.some((c) => c.change === "personal_choice"), true, "R16");
});
