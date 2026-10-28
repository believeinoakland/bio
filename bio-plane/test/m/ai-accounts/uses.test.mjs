/* ai-accounts R9, R14, R15, R16, R17 at the interface: every account's switch for each kind of use, an account's panel, its
   in-plane reads and the history of every change. Every id is tested with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SECRET } from "./fixture.mjs";
import { PLANS as P, ENTRIES as E } from "./catalogue.mjs";
import { shape, refusal, ask, act, projectWorld, on, DEFAULTS } from "./helpers.mjs";
import { USE_KINDS, USE_SWITCHES, EXPLORE_VALUES, PART_OF_KIND, HISTORY_LIMIT_DEFAULT, HISTORY_LIMIT_MAX } from "../../../src/ai-accounts/index.mjs";

const OFF = { ask: false, draft: false, run: false, standing: false, explore: "no", enquire: false, read: false, transcribe: false, account: false, suggestions: false };

test("R14: USE_KINDS is exported and frozen, each belongs to one Gate 1 part by PART_OF_KIND (exported, frozen): ask and standing to ask, draft and enquire to draft, read, transcribe, run and explore to run, account; every account holds a switch for each kind except explore (no, ask or yes, default no), plus suggestions; the defaults: ask, draft, run, enquire, read, transcribe, account on, standing and suggestions off", async () => {
  assert.deepEqual([...USE_KINDS], ["ask", "draft", "run", "standing", "explore", "enquire", "read", "transcribe", "account"]);
  assert.ok(Object.isFrozen(USE_KINDS) && Object.isFrozen(USE_SWITCHES) && Object.isFrozen(EXPLORE_VALUES) && Object.isFrozen(PART_OF_KIND));
  assert.deepEqual({ ...PART_OF_KIND }, { ask: "ask", standing: "ask", draft: "draft", enquire: "draft", read: "read", transcribe: "transcribe", run: "run", explore: "run", account: "account" });
  assert.deepEqual([...USE_SWITCHES], [...USE_KINDS, "suggestions"]);
  assert.deepEqual([...EXPLORE_VALUES], ["no", "ask", "yes"]);
  const w = await projectWorld();
  for (const x of [await w.own("ann"), await w.team(), await w.projectAccount("P", "ann")])
    assert.deepEqual(w.a.accountUses({ account_id: x.account_id, viewer: x.owner === "group" ? "admin" : x.owner === "member:ann" ? "ann" : "ann" }).uses, DEFAULTS, x.owner);
});

test("R14 R4: accountUsesSet (R4's two switches `suggestions` and `standing` are two of R14's: off by default, set only by this act, gone with the account) sets one switch of one account by its owner's authority (the team's by an active administrator, a project's by an owner, a member's own by that member); UNKNOWN_SWITCH; SWITCH_VALUE_INVALID naming the values (explore no, ask or yes; any other a boolean); a request naming no account NOT_YOUR_ACCOUNT naming account_id (a machine caller with none keeps MACHINE_CANNOT_HOLD_ACCOUNT); each refusal writing nothing; a removed account's switches go with it", async () => {
  const w = await projectWorld();
  const mine = await w.own("ann");
  const team = await w.team();
  const proj = await w.projectAccount("P", "ann");
  const set = (account_id, name, on, by) => w.a.accountUsesSet({ account_id, switch: name, on, by });
  for (const [x, by, other] of [[mine, "ann", "bob"], [team, "admin", "ann"], [proj, "ann", "bob"]]) {
    for (const name of USE_SWITCHES) {
      const on = name === "explore" ? "yes" : name === "standing" || name === "suggestions";
      const r = set(x.account_id, name, on, by);
      assert.deepEqual([r.ok, r.switch, r.on], [true, name, on], `${x.owner} ${name}`);
      assert.equal(w.a.accountUses({ account_id: x.account_id, viewer: by }).uses[name], on);
    }
    assert.notEqual(set(x.account_id, "ask", false, other).ok, true, `${x.owner} by ${other}`);
  }
  assert.equal(set(mine.account_id, "ask", false, "bob").reason, "NOT_YOUR_ACCOUNT");
  assert.equal(set(team.account_id, "ask", false, "ann").reason, "NOT_AN_ADMIN");
  assert.equal(set(proj.account_id, "ask", false, "bob").reason, "PROJECT_ACT_NOT_THE_OWNER");
  const before = w.snapshot();
  assert.deepEqual(shape(set(mine.account_id, "bogus", true, "ann")), refusal("UNKNOWN_SWITCH"));
  assert.equal(set(mine.account_id, null, true, "ann").switch, null);
  assert.equal(set(mine.account_id, "ask", "yes", "ann").reason, "SWITCH_VALUE_INVALID");
  assert.deepEqual(set(mine.account_id, "explore", true, "ann").values, [...EXPLORE_VALUES]);
  assert.deepEqual(set(mine.account_id, "ask", "no", "ann").values, [true, false]);
  assert.equal(set(mine.account_id, "ask", undefined, "ann").reason, "SWITCH_VALUE_INVALID");
  assert.equal(set(null, "ask", true, "ann").reason, "NOT_YOUR_ACCOUNT");
  assert.equal(set(null, "ask", true, "ann").account_id, null);
  assert.equal(set(null, "ask", true, null).reason, "MACHINE_CANNOT_HOLD_ACCOUNT");
  assert.equal(set("acct-none", "ask", true, "class:ai").reason, "MACHINE_CANNOT_HOLD_ACCOUNT");
  assert.equal(w.snapshot(), before, "each refusal writes nothing");
  w.a.accountRemove({ account_id: mine.account_id, by: "ann" });
  assert.equal(w.rows(`SELECT 1 FROM ai_accounts WHERE account_id=?`, mine.account_id).length, 0);
  assert.equal(w.a.accountUses({ account_id: mine.account_id, viewer: "ann" }).reason, "NOT_YOUR_ACCOUNT", "the switches went with the account");
});

test("R9: accountSwitchesOf, an in-plane read reached by no route, answers {on, suggestions, standing} for one account, never a secret, and {unreadable: true} when it cannot be read (fail closed: no switch reads as on); removing an account removes its switches", async () => {
  const w = await projectWorld();
  const team = await w.team();
  assert.deepEqual(w.a.accountSwitchesOf({ account_id: team.account_id }), { on: false, suggestions: false, standing: false });
  w.a.accountSwitch({ account_id: team.account_id, on: true, by: "admin" });
  w.a.accountUsesSet({ account_id: team.account_id, switch: "standing", on: true, by: "admin" });
  w.a.accountUsesSet({ account_id: team.account_id, switch: "suggestions", on: true, by: "admin" });
  assert.deepEqual(w.a.accountSwitchesOf({ account_id: team.account_id }), { on: true, suggestions: true, standing: true });
  assert.equal(JSON.stringify(w.a.accountSwitchesOf({ account_id: team.account_id })).includes(SECRET("team")), false);
  assert.ok(!Object.keys(w.ops()).some((op) => /switchesof/i.test(op)), "reached by no route");
  w.a.accountRemove({ account_id: team.account_id, by: "admin" });
  assert.deepEqual(w.a.accountSwitchesOf({ account_id: team.account_id }), { on: false, suggestions: false, standing: false });
  w.sql.exec(`ALTER TABLE ai_accounts RENAME TO ai_accounts_gone`);
  assert.deepEqual(w.a.accountSwitchesOf({ account_id: team.account_id }), { unreadable: true });
});

test("R15 R17: accountUses answers one account's owners {account_id, owner, held, uses, keptAway}: `uses` each R14 switch with its value (default where unset), `keptAway` every material limit binding the account as {scope, on, uses, reason, set_by, set_at}; anyone else is refused; accountUsesOf, in-plane, takes no viewer and answers the same without keptAway, `held: false, uses: null` for a revoked member's account (K2620), `held: null, uses: null, unreadable: true` when unreadable; never a secret, never throws", async () => {
  const w = await projectWorld();
  const mine = await w.own("ann");
  const proj = await w.projectAccount("P", "ann");
  w.a.aiKeepAwaySet({ on: true, uses: ["explore"], reason: "r", by: "admin" });
  w.a.projectAiKeepAwaySet({ project: "P", on: true, reason: "p", by: "ann" });
  const r = w.a.accountUses({ account_id: mine.account_id, viewer: "ann" });
  assert.deepEqual(Object.keys(r).sort(), ["account_id", "held", "keptAway", "ok", "owner", "uses"]);
  assert.deepEqual([r.owner, r.held, r.uses], ["member:ann", true, DEFAULTS]);
  assert.deepEqual(r.keptAway.map((k) => [k.scope, k.on, k.uses]), [["group", true, ["explore"]]]);
  const p = w.a.accountUses({ account_id: proj.account_id, viewer: "ann" });
  assert.deepEqual(p.keptAway.map((k) => [k.scope, k.project, k.on]), [["group", undefined, true], ["project", "P", true]]);
  assert.equal(p.keptAway[1].reason, "p");
  for (const viewer of ["bob", "admin", "class:ai", null]) assert.equal(w.a.accountUses({ account_id: mine.account_id, viewer }).ok, false, String(viewer));
  assert.equal(w.a.accountUses({ account_id: proj.account_id, viewer: "bob" }).reason, "PROJECT_ACT_NOT_THE_OWNER");
  const before = w.snapshot();
  assert.deepEqual(w.a.accountUsesOf({ account_id: mine.account_id }), { ok: true, account_id: mine.account_id, owner: "member:ann", held: true, uses: DEFAULTS });
  assert.deepEqual(w.a.accountUsesOf({ account_id: "acct-none" }), { ok: true, account_id: "acct-none", owner: null, held: false, uses: null });
  assert.equal(w.snapshot(), before, "writes nothing");
  assert.equal(JSON.stringify([r, w.a.accountUsesOf({ account_id: mine.account_id })]).includes(SECRET("ann")), false);
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  const bob = await w.a.accountSet({ owner: "member:ann", provider: P.provider, plan: P.memberApi, secret: "s", by: "ann" });
  w.sql.exec(`UPDATE ai_accounts SET owner='member:bob' WHERE account_id=?`, bob.account_id);
  assert.deepEqual(w.a.accountUsesOf({ account_id: bob.account_id }), { ok: true, account_id: bob.account_id, owner: "member:bob", held: false, uses: null }, "K2620");
  w.sql.exec(`ALTER TABLE ai_accounts RENAME TO ai_accounts_gone`);
  assert.deepEqual(w.a.accountUsesOf({ account_id: mine.account_id }), { ok: true, account_id: mine.account_id, owner: null, held: null, uses: null, unreadable: true });
  assert.equal(w.a.accountUses({ account_id: mine.account_id, viewer: "ann" }).unreadable, true);
  assert.ok(!Object.keys(w.ops()).some((op) => /usesof/i.test(op)), "accountUsesOf is reached by no route");
});

test("R16: every change is recorded with who and when, never a secret or digest: an account set, replaced, removed or switched; an owner's list; an opt-in; a use's switch; a material limit; a check; an offered set; a free-tier acceptance; a personal-subscription choice; a gateway key entered or attested; a payer flag and its clearing; accountHistory answers an owner's own and its accounts' changes to that owner's authority only, in order, each {at, by, change, level, …}, capped as credentials R15 with a measured `truncated`; control: a viewer outside the authority is refused, and rows before this change are not back-filled", async () => {
  const w = await projectWorld();
  w.a.registerGatewayStore("root", { create: async () => "gw-h", put: async () => true, exists: async () => true });
  const want = new Set();
  const mine = await w.own("ann"); want.add("account_set");
  await w.own("ann", { account_id: mine.account_id, secret: SECRET("ann2") });
  w.a.accountSwitch({ account_id: mine.account_id, on: true, by: "ann" }); want.add("switched");
  w.a.accountUsesSet({ account_id: mine.account_id, switch: "ask", on: false, by: "ann" }); want.add("use_set");
  w.a.accountEntriesSet({ account_id: mine.account_id, entries: [E.b], by: "ann" }); want.add("entries_set");
  w.a.offeredSet({ owner: "member:ann", entries: [E.b], by: "ann" }); want.add("offered_set");
  w.a.checksSet({ level: "member:ann", check: "P3", ticked: true, by: "ann" }); want.add("check_set");
  w.a.crossOwnerOptInSet({ account_id: mine.account_id, on: true, by: "ann" }); want.add("opt_in");
  w.a.accountOrderSet({ owner: "member:ann", accounts: [mine.account_id], by: "ann" }); want.add("order_set");
  const sub = await w.a.accountSet({ owner: "member:ann", provider: P.provider, plan: P.subscription, means: "issued", secret: "sk-ant-oat01-sentinel-ann-0123456789", by: "ann" }); want.add("personal_choice");
  const gw = await w.a.accountSet({ owner: "member:ann", provider: P.provider, plan: P.teamApi, means: "gateway", by: "ann" });
  await w.a.gatewayKeyAttest({ account_id: gw.account_id, by: "ann" }); want.add("gateway_key");
  w.a.gatewayServedCheck({ account_id: gw.account_id, record: { gateway_id: "gw-h", own_key_served: false, platform_credits_used: true } }); want.add("payer_flag");
  w.a.aiCreditsClear({ account_id: gw.account_id, by: "ann" }); want.add("payer_cleared");
  const fr = await w.a.accountSet({ owner: "member:ann", provider: P.freeProvider, plan: P.freeApi, means: "sealed", secret: "s", by: "ann" });
  w.a.freeTierAccept({ account_id: fr.account_id, by: "ann" }); want.add("free_tier");
  w.a.accountRemove({ account_id: sub.account_id, by: "ann" }); want.add("account_removed");
  const h = w.a.accountHistory({ owner: "member:ann", viewer: "ann" });
  assert.deepEqual(new Set(h.changes.map((c) => c.change)), want);
  for (const c of h.changes) { assert.match(c.at, /^\d{4}-\d\d-\d\dT/); assert.equal(c.by, c.change === "payer_flag" ? null : "ann", c.change); assert.equal(c.level, "member"); }
  assert.equal(JSON.stringify(h).includes(SECRET("ann")) || JSON.stringify(h).includes(SECRET("ann2")), false, "never a secret");
  assert.deepEqual(h.changes.map((c) => c.change).slice(0, 3), ["account_set", "account_set", "switched"], "in order");
  assert.deepEqual([h.limit, h.truncated], [HISTORY_LIMIT_DEFAULT, false]);
  const capped = w.a.accountHistory({ owner: "member:ann", viewer: "ann", limit: 3 });
  assert.deepEqual([capped.count, capped.limit, capped.truncated], [3, 3, true]);
  assert.equal(w.a.accountHistory({ owner: "member:ann", viewer: "ann", limit: 100000 }).limit, HISTORY_LIMIT_MAX);
  assert.equal(w.a.accountHistory({ owner: "member:ann", viewer: "ann", limit: 0 }).limit, HISTORY_LIMIT_DEFAULT);
  /* a limit and a project's, and who may read which */
  w.a.aiKeepAwaySet({ on: true, reason: "r", by: "admin" });
  w.a.projectAiKeepAwaySet({ project: "P", on: true, reason: "p", by: "ann" });
  assert.deepEqual(w.a.accountHistory({ owner: "group", viewer: "admin" }).changes.map((c) => [c.change, c.by, c.level]), [["limit_set", "admin", "group"]]);
  assert.deepEqual(w.a.accountHistory({ owner: "project:P", viewer: "ann" }).changes.map((c) => [c.change, c.level]), [["limit_set", "project"]]);
  for (const [owner, viewer] of [["member:ann", "bob"], ["member:ann", "admin"], ["group", "ann"], ["project:P", "bob"], ["project:P", "eve"], ["member:ann", null], ["bogus", "ann"]])
    assert.equal(w.a.accountHistory({ owner, viewer }).ok, false, `${owner} read by ${viewer}`);
  assert.equal(w.a.accountHistory({ owner: "member:bob", viewer: "bob" }).changes.length, 0, "nothing before any change is back-filled");
});
