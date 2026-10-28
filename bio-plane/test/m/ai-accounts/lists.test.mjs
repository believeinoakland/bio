/* ai-accounts R27, R41, R49, R50, R70, R72, R77 at the interface: each owner's one ordered list of accounts, the share flags
   that let an account of another owner stand on it, the hop along it, a member's own order, and what leaves a list when a flag
   is turned off or a member can no longer place a shared account. Every id is tested with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { SECRET } from "./fixture.mjs";
import { PLANS as P, ENTRIES as E, setCheck, setGate } from "./catalogue.mjs";
import { shape, refusal, ask, act, projectWorld, on, leaks } from "./helpers.mjs";

const seen = (w, ...members) => { for (const m of members) w.a.recipientNoticeSeen({ member: m, provider: P.provider, host: "api.anthropic.com", by: m }); };
const TOKEN = (who) => `sk-ant-oat01-sentinel-${who}-0123456789`;
const ids = (w, owner, viewer) => w.a.accountsOf({ owner, viewer }).accounts.map((x) => x.account_id);
const order = (w, owner, accounts, by) => w.a.accountOrderSet({ owner, accounts, by });
const hop = (w, member, from, reason = "limit", a = ask(member)) => w.a.hopFor({ member, act: a, from, reason, at_step_boundary: true });

test("R41: each owner has one ordered list of accounts: accountOrderSet replaces it and is recorded, by an administrator for the team, a project's owner for a project, each member for her own; each refusal leaves the old list standing: an unknown or repeated account ACCOUNT_NOT_LISTED, a machine credential MACHINE_CANNOT_HOLD_ACCOUNT, a member ordering the team's accounts NOT_AN_ADMIN; an account not on its owner's list serves no one", async () => {
  const w = await projectWorld();
  seen(w, "ann", "bob");
  const a1 = await on(w, w.own("ann", { entries: [E.a] }));
  const a2 = await on(w, w.own("ann", { entries: [E.b] }));
  const a3 = await on(w, w.own("ann", { entries: [E.a, E.b] }));
  assert.deepEqual(ids(w, "member:ann", "ann"), [a1.account_id, a2.account_id, a3.account_id]);
  assert.deepEqual(order(w, "member:ann", [a3.account_id, a1.account_id, a2.account_id], "ann"), { ok: true, owner: "member:ann", accounts: [a3.account_id, a1.account_id, a2.account_id] });
  assert.deepEqual(ids(w, "member:ann", "ann"), [a3.account_id, a1.account_id, a2.account_id]);
  assert.equal((await w.a.accountFor({ member: "ann", act: ask("ann") })).account_id, a3.account_id, "the walk follows her order (R11)");
  const hist = w.a.accountHistory({ owner: "member:ann", viewer: "ann" }).changes.filter((c) => c.change === "order_set");
  assert.deepEqual([hist.length, hist[0].accounts, hist[0].by, hist[0].level], [1, [a3.account_id, a1.account_id, a2.account_id], "ann", "member"], "recorded with the new order, who and when");
  /* refusals leave the old list standing */
  const before = w.snapshot();
  assert.equal(order(w, "member:ann", [a3.account_id, "acct-none"], "ann").reason, "ACCOUNT_NOT_LISTED");
  assert.equal(order(w, "member:ann", [a3.account_id, a3.account_id], "ann").reason, "ACCOUNT_NOT_LISTED");
  assert.equal(order(w, "member:ann", null, "ann").reason, "ACCOUNT_NOT_LISTED");
  for (const by of [null, "class:ai", "token:ai"]) for (const owner of ["member:ann", "group", "project:P"])
    assert.equal(order(w, owner, [], by).reason, "MACHINE_CANNOT_HOLD_ACCOUNT", `${owner} ${String(by)}`);
  assert.equal(order(w, "member:ann", [a1.account_id], "bob").reason, "NOT_YOUR_ACCOUNT");
  assert.equal(order(w, "group", [], "ann").reason, "NOT_AN_ADMIN");
  assert.equal(order(w, "project:P", [], "eve").code, "NO_SUCH_PROJECT");
  assert.equal(w.snapshot(), before, "each refusal leaves the old list standing");
  /* the team's, by an administrator; a project's, by its owner */
  const t1 = await on(w, w.team({ entries: [E.a] }));
  const t2 = await on(w, w.team({ entries: [E.b] }));
  assert.equal(order(w, "group", [t2.account_id, t1.account_id], "second").ok, true);
  assert.deepEqual(ids(w, "group", "bob"), [t2.account_id, t1.account_id]);
  const p1 = await w.projectAccount("P", "ann");
  assert.equal(order(w, "project:P", [p1.account_id], "ann").ok, true);
  /* an account not on its owner's list serves no one */
  assert.equal(order(w, "member:ann", [a2.account_id], "ann").ok, true);
  assert.deepEqual(w.a.accountsOf({ owner: "member:ann", viewer: "ann" }).accounts.map((x) => [x.account_id, x.position]), [[a2.account_id, 1], [a1.account_id, null], [a3.account_id, null]]);
  const f = await w.a.accountFor({ member: "ann", act: ask("ann") });
  assert.equal(f.account_id, a2.account_id, "only the listed account is walked");
  assert.equal(order(w, "member:ann", [], "ann").ok, true);
  assert.equal((await w.a.accountFor({ member: "ann", act: ask("ann") })).level, "group", "the list is empty: the member's level holds nothing, the team's is next");
});

test("R49: crossOwnerOptInSet sets the one share flag the account's owner level carries, and nothing else: a team account's share_with_lists by an active administrator only, a member's own API account's share_with_projects by that member alone; a project's account carries neither (OPT_IN_NOT_OFFERED), a personal subscription can carry neither (PERSONAL_SUBSCRIPTION_NOT_SHARED); both off when set; accountState answers the flag as opt_in {flag, on}", async () => {
  const w = await projectWorld();
  const team = await w.team();
  const mine = await w.own("bob");
  const proj = await w.projectAccount("P", "ann");
  const sub = await w.a.accountSet({ owner: "member:ann", provider: P.provider, plan: P.subscription, means: "issued", secret: TOKEN("ann"), by: "ann" });
  assert.deepEqual(w.a.accountState({ account_id: team.account_id, viewer: "admin" }).opt_in, { flag: "share_with_lists", on: false });
  assert.deepEqual(w.a.accountState({ account_id: mine.account_id, viewer: "bob" }).opt_in, { flag: "share_with_projects", on: false });
  assert.equal(w.a.accountState({ account_id: proj.account_id, viewer: "ann" }).opt_in, null);
  assert.equal(w.a.accountState({ account_id: sub.account_id, viewer: "ann" }).opt_in, null);
  assert.equal(order(w, "project:P", [proj.account_id, team.account_id], "ann").reason, "OPT_IN_MISSING", "both flags are off on a new account and the lists refuse it");
  /* who may turn each on */
  for (const by of ["ann", "class:ai", null]) assert.equal(w.a.crossOwnerOptInSet({ account_id: team.account_id, on: true, by }).reason, "NOT_AN_ADMIN", String(by));
  assert.equal(w.a.crossOwnerOptInSet({ account_id: mine.account_id, on: true, by: "admin" }).reason, "NOT_YOUR_ACCOUNT", "an administrator turning on a member's flag");
  assert.equal(w.a.crossOwnerOptInSet({ account_id: mine.account_id, on: true, by: "second" }).reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.a.crossOwnerOptInSet({ account_id: mine.account_id, on: true, by: "class:ai" }).reason, "MACHINE_CANNOT_HOLD_ACCOUNT");
  assert.equal(w.a.crossOwnerOptInSet({ account_id: proj.account_id, on: true, by: "ann" }).reason, "OPT_IN_NOT_OFFERED");
  assert.equal(w.a.crossOwnerOptInSet({ account_id: sub.account_id, on: true, by: "ann" }).reason, "PERSONAL_SUBSCRIPTION_NOT_SHARED");
  assert.equal(w.a.crossOwnerOptInSet({ account_id: team.account_id, on: "yes", by: "admin" }).reason, "SWITCH_VALUE_INVALID");
  assert.deepEqual(w.a.crossOwnerOptInSet({ account_id: team.account_id, on: true, by: "admin" }), { ok: true, account_id: team.account_id, flag: "share_with_lists", on: true, changed: true });
  assert.deepEqual(w.a.crossOwnerOptInSet({ account_id: mine.account_id, on: true, by: "bob" }), { ok: true, account_id: mine.account_id, flag: "share_with_projects", on: true, changed: true });
  /* bob has only joined P: he adds the team account to the project's list and to his own; ann (an owner) may too */
  assert.equal(order(w, "project:P", [team.account_id, proj.account_id], "bob").reason, "PROJECT_ACT_NOT_THE_OWNER", "a participant may not reorder what is not hers");
  assert.equal(order(w, "project:P", [], "bob").reason, "PROJECT_ACT_NOT_THE_OWNER", "nor remove it");
  assert.equal(order(w, "project:P", [proj.account_id, team.account_id], "bob").ok, true, "a member who has only joined the project places the team account (K5486)");
  assert.equal(order(w, "project:P", [proj.account_id, team.account_id, mine.account_id], "ann").ok, true, "an owner places bob's own");
  assert.deepEqual(ids(w, "project:P", "ann"), [proj.account_id, team.account_id, mine.account_id]);
  assert.equal(order(w, "member:bob", [mine.account_id, team.account_id], "bob").ok, true, "the team's account on her own list");
  const placed = w.rows(`SELECT owner, account_id, placed_by FROM ai_account_lists ORDER BY owner, position`);
  assert.deepEqual(placed.filter((r) => r.account_id === team.account_id && r.owner !== "group").map((r) => [r.owner, r.placed_by]), [["member:bob", "bob"], ["project:P", "bob"]], "who placed it (R77)");
  assert.equal(w.a.accountsOf({ owner: "project:P", viewer: "bob" }).accounts.some((x) => x.placed_here), true);
  /* a project she has not joined cannot take either account; the team's list and another member's never take a member's account */
  assert.equal(order(w, "project:S", [mine.account_id], "cy").reason, "OPT_IN_MISSING", "S: bob has not joined, so his account cannot be placed there");
  assert.equal(order(w, "project:S", [team.account_id], "cy").ok, true, "the team's account is open to every project's owners while its flag is on");
  assert.equal(order(w, "project:S", [], "cy").ok, true);
  assert.match(order(w, "project:D", [team.account_id], "bob").reason, /PROJECT_|NO_SUCH/, "a project she has not joined cannot take it");
  assert.equal(order(w, "group", [mine.account_id], "admin").reason, "OPT_IN_MISSING");
  assert.equal(order(w, "member:ann", [mine.account_id], "ann").reason, "OPT_IN_MISSING");
  assert.equal(order(w, "member:eve", [team.account_id], "ann").reason, "NOT_YOUR_ACCOUNT");
  assert.equal(order(w, "member:eve", [team.account_id], "eve").ok, true, "the team's account on eve's own list, by eve");
  assert.equal(order(w, "project:P", [sub.account_id], "ann").reason, "PERSONAL_SUBSCRIPTION_NOT_SHARED");
  /* a participant adds her own shared account and takes her own placements back */
  const w2 = await projectWorld();
  const m2 = await w2.own("bob");
  w2.a.crossOwnerOptInSet({ account_id: m2.account_id, on: true, by: "bob" });
  const pj = await w2.projectAccount("P", "ann");
  assert.equal(order(w2, "project:P", [pj.account_id, m2.account_id], "bob").ok, true, "a joined participant places her own shared account (K5486)");
  assert.equal(order(w2, "project:P", [pj.account_id], "bob").ok, true, "and takes it back");
  assert.equal(order(w2, "project:P", [], "bob").reason, "PROJECT_ACT_NOT_THE_OWNER", "not the project's own account");
  assert.equal(w.a.accountHistory({ owner: "group", viewer: "admin" }).changes.some((c) => c.change === "opt_in" && c.on === true && c.by === "admin"), true, "R16");
});

test("R50: hopFor walks on after `from` in the sequence R11 chose and returns the first pair that is usable, offered, passes Gate 1 and the checks in force, is the same owner's or an opted-in account's and has its free tier accepted; each reason advances; a target with a check open, a part not passed or an unaccepted free tier is skipped; the list ends LIST_EXHAUSTED naming who can act; the answer carries payer_change", async () => {
  const w = await projectWorld();
  seen(w, "ann", "bob");
  const a1 = await on(w, w.own("ann", { entries: [E.a, E.b] }));
  const a2 = await on(w, w.own("ann", { entries: [E.a] }));
  const team = await on(w, w.team({ entries: [E.b] }));
  w.a.crossOwnerOptInSet({ account_id: team.account_id, on: true, by: "admin" });
  order(w, "member:ann", [a1.account_id, a2.account_id, team.account_id], "ann");
  for (const reason of ["limit", "unavailable", "lapsed", "capability", "auth", "member_switch"])
    assert.deepEqual(hop(w, "ann", { account_id: a1.account_id, entry_id: E.a }, reason), { ok: true, account_id: a1.account_id, entry_id: E.b, level: "member", owner: "member:ann", means: "sealed", payer_change: null }, reason);
  const h2 = hop(w, "ann", { account_id: a1.account_id, entry_id: E.b });
  assert.deepEqual([h2.account_id, h2.entry_id, h2.payer_change], [a2.account_id, E.a, null], "to the next account's first entry");
  const h3 = hop(w, "ann", { account_id: a2.account_id, entry_id: E.a });
  assert.deepEqual([h3.account_id, h3.entry_id, h3.payer_change], [team.account_id, E.b, { from_owner: "member:ann", to_owner: "group" }], "payer_change names the owners");
  const end = hop(w, "ann", { account_id: team.account_id, entry_id: E.b });
  assert.deepEqual(shape(end), refusal("LIST_EXHAUSTED"));
  assert.equal(end.who, "member");
  /* a target with a check open, a part not passed or an unaccepted free tier is skipped */
  w.a.checksSet({ level: "member:ann", check: "P2", ticked: true, by: "ann" });
  setCheck(w, E.b, "P2", null);
  assert.equal(hop(w, "ann", { account_id: a1.account_id, entry_id: E.a }).account_id, a2.account_id, "claude-b is open on P2: skipped");
  setCheck(w, E.b, "P2", true);
  setGate(w, E.b, "ask", "not_suitable");
  assert.equal(hop(w, "ann", { account_id: a1.account_id, entry_id: E.a }).account_id, a2.account_id, "claude-b does not pass ask: skipped");
  setGate(w, E.b, "ask", "passes");
  /* the same owner's or an opted-in account's, tested at each hop */
  w.a.crossOwnerOptInSet({ account_id: team.account_id, on: false, by: "admin" });
  assert.equal(hop(w, "ann", { account_id: a2.account_id, entry_id: E.a }).reason, "LIST_EXHAUSTED", "the flag is off: it left her list (R72)");
  /* the project's list: a hop within a project act */
  const pa = await on(w, w.projectAccount("P", "ann"));
  assert.equal(hop(w, "bob", { account_id: pa.account_id, entry_id: E.b }, "limit", ask("bob", "P")).reason, "LIST_EXHAUSTED");
  assert.equal(hop(w, "bob", { account_id: pa.account_id, entry_id: E.a }, "limit", ask("bob", "P")).entry_id, E.b, "within the project's list");
});

test("R50: a hop reason is one of limit, unavailable, lapsed, capability, auth, member_switch, else HOP_REASON_REFUSED; mid-step is HOP_NOT_AT_STEP_BOUNDARY; a use its owner switched off is never a reason (AI_USE_SWITCHED_OFF) and nothing moves; a target whose recipient is not disclosed waits ({wait: true, code: RECIPIENT_NOTICE_DUE}), and a non-interactive hop waits and never proceeds; control: disclosed, it proceeds", async () => {
  const w = await projectWorld();
  seen(w, "ann");
  const a1 = await on(w, w.own("ann", { entries: [E.a] }));
  const free = await on(w, w.a.accountSet({ owner: "member:ann", provider: P.freeProvider, plan: P.freeApi, means: "sealed", secret: SECRET("free"), by: "ann" }));
  w.a.recipientNoticeSeen({ member: "ann", provider: P.freeProvider, host: "free.example", by: "ann" });
  w.sql.exec(`DELETE FROM ai_recipients_seen WHERE member_id='ann' AND host='free.example'`);
  w.a.freeTierAccept({ account_id: free.account_id, by: "ann" });
  const from = { account_id: a1.account_id, entry_id: E.a };
  const before0 = w.snapshot();
  for (const reason of ["bogus", null, "switch", ""]) assert.equal(hop(w, "ann", from, reason).reason, "HOP_REASON_REFUSED", String(reason));
  assert.equal(w.a.hopFor({ member: "ann", act: ask("ann"), from, at_step_boundary: true }).reason, "HOP_REASON_REFUSED", "no reason given");
  assert.equal(w.a.hopFor({ member: "ann", act: ask("ann"), from, reason: "limit", at_step_boundary: false }).reason, "HOP_NOT_AT_STEP_BOUNDARY");
  assert.equal(w.a.hopFor({ member: "ann", act: ask("ann"), from, reason: "limit" }).reason, "HOP_NOT_AT_STEP_BOUNDARY");
  assert.equal(w.snapshot(), before0, "a refused hop writes nothing and moves nothing");
  w.a.accountUsesSet({ account_id: a1.account_id, switch: "ask", on: false, by: "ann" });
  const before = w.snapshot();
  assert.equal(hop(w, "ann", from).reason, "AI_USE_SWITCHED_OFF", "a switched-off use is never a reason to move");
  assert.equal(w.snapshot(), before, "nothing moves");
  w.a.accountUsesSet({ account_id: a1.account_id, switch: "ask", on: true, by: "ann" });
  const wait = hop(w, "ann", from);
  assert.deepEqual([wait.ok, wait.wait, wait.code, wait.recipient, wait.account_id], [false, true, "RECIPIENT_NOTICE_DUE", { provider: P.freeProvider, host: "free.example" }, free.account_id]);
  const nonInteractive = hop(w, "ann", from, "limit", { kind: "run", member: "ann", interactive: false });
  assert.deepEqual([nonInteractive.wait, nonInteractive.code, nonInteractive.interactive], [true, "RECIPIENT_NOTICE_DUE", false], "it waits and never proceeds");
  w.a.recipientNoticeSeen({ member: "ann", provider: P.freeProvider, host: "free.example", by: "ann" });
  const go = hop(w, "ann", from);
  assert.deepEqual([go.ok, go.account_id, go.entry_id], [true, free.account_id, E.free]);
  /* an unaccepted free tier is skipped, never a wait */
  w.a.freeTierWithdraw({ account_id: free.account_id, by: "ann" });
  assert.equal(hop(w, "ann", from).reason, "LIST_EXHAUSTED");
  assert.equal(hop(w, "ann", { account_id: "none", entry_id: "none" }).ok, true, "a `from` that is not on the list starts at the head");
  assert.equal(hop(w, "bob", from).reason, "NO_ACCOUNT");
  assert.equal(w.a.hopFor({ member: "ann", act: ask("ann"), from, reason: "limit", at_step_boundary: true }).ok, false);
});

test("R70: `aiorderset` moves one account to a 1-based position as an explicit position change, never a toggle: the account is taken out of the list as read at that instant and put at `position`, the others keeping their relative order; a position outside 1 to the list's length ORDER_POSITION_INVALID, an account not on the list ACCOUNT_NOT_LISTED, a machine credential MACHINE_CANNOT_HOLD_ACCOUNT, `owner: group` by a non-administrator NOT_AN_ADMIN; owner `member` takes the member from the stamp, never the body", async () => {
  const w = await projectWorld();
  seen(w, "ann");
  const [a1, a2, a3] = [await on(w, w.own("ann", { entries: [E.a] })), await on(w, w.own("ann", { entries: [E.b] })), await on(w, w.own("ann", { entries: [E.a, E.b] }))];
  const t1 = await on(w, w.team({ entries: [E.a] }));
  const t2 = await on(w, w.team({ entries: [E.b] }));
  const move = (query, body) => w.ops(query, body).aiorderset();
  const r = move("by=ann", { owner: "member", account_id: a3.account_id, position: 1 });
  assert.deepEqual([r.ok, r.accounts], [true, [a3.account_id, a1.account_id, a2.account_id]], "the last to position 1, the other two keeping theirs");
  assert.deepEqual(ids(w, "member:ann", "ann"), [a3.account_id, a1.account_id, a2.account_id]);
  assert.equal((await w.a.accountFor({ member: "ann", act: ask("ann") })).account_id, a3.account_id, "accountFor then walks that order");
  assert.deepEqual(move("by=ann", { owner: "member", account_id: a3.account_id, position: 3 }).accounts, [a1.account_id, a2.account_id, a3.account_id]);
  assert.deepEqual(move("by=ann", { owner: "member", account_id: a1.account_id, position: 2, member: "bob" }).accounts, [a2.account_id, a1.account_id, a3.account_id], "a body naming another member acts on the caller's list only");
  const before = w.snapshot();
  for (const position of [0, 4, -1, 1.5, "1", null]) assert.deepEqual(shape(move("by=ann", { owner: "member", account_id: a1.account_id, position })), refusal("ORDER_POSITION_INVALID"), String(position));
  assert.equal(move("by=ann", { owner: "member", account_id: a1.account_id, position: 9 }).count, 3);
  assert.equal(move("by=ann", { owner: "member", account_id: t1.account_id, position: 1 }).reason, "ACCOUNT_NOT_LISTED");
  assert.equal(move("by=class:ai", { owner: "member", account_id: a1.account_id, position: 1 }).reason, "MACHINE_CANNOT_HOLD_ACCOUNT");
  assert.equal(move("by=ann", { owner: "group", account_id: t1.account_id, position: 2 }).reason, "NOT_AN_ADMIN");
  assert.equal(w.snapshot(), before, "the list stands, and the team's is unchanged by her moving her own");
  assert.deepEqual(move("by=admin", { owner: "group", account_id: t1.account_id, position: 2 }).accounts, [t2.account_id, t1.account_id]);
  assert.equal(w.a.accountHistory({ owner: "member:ann", viewer: "ann" }).changes.filter((c) => c.change === "order_set").length >= 3, true, "recorded (R16)");
  /* the team's account is on her list only while its share flag is on (R49) */
  assert.equal(move("by=ann", { owner: "member", account_id: t2.account_id, position: 1 }).reason, "ACCOUNT_NOT_LISTED");
});

test("R72: when the share flag is turned off the account leaves every list that is not its owner's own in that same act, each removal a change (R16) recorded with the list's owner and the instant; the owners of those lists are owed one notice, accountNoticesFor answering each `left-list` with a stable key, never a secret; turning on again restores no place; control: the team's own list keeps it, turning off an already-off flag writes nothing", async () => {
  const w = await projectWorld();
  seen(w, "ann", "bob", "cy");
  w.project("Q", "ann");
  const team = await on(w, w.team({ secret: SECRET("flagged") }));
  w.a.crossOwnerOptInSet({ account_id: team.account_id, on: true, by: "admin" });
  order(w, "project:P", [team.account_id], "ann");
  order(w, "project:Q", [team.account_id], "ann");
  order(w, "member:cy", [team.account_id], "cy");
  const before = w.rows(`SELECT COUNT(*) AS n FROM account_changes`)[0].n;
  const off = w.a.crossOwnerOptInSet({ account_id: team.account_id, on: false, by: "admin" });
  assert.deepEqual([off.on, off.changed], [false, true]);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ai_account_lists WHERE account_id=?`, team.account_id)[0].n, 1, "only the team's own list keeps it");
  assert.deepEqual(ids(w, "group", "admin"), [team.account_id]);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM account_changes`)[0].n - before, 4, "three removal rows and the flag row");
  const rows = w.rows(`SELECT owner, change, by FROM account_changes WHERE change IN ('list_left','opt_in') ORDER BY seq`);
  assert.deepEqual(rows.filter((r) => r.change === "list_left").map((r) => [r.owner, r.by]), [["member:cy", "admin"], ["project:P", "admin"], ["project:Q", "admin"]]);
  const notices = (viewer) => w.a.accountNoticesFor({ viewer });
  const nAnn = notices("ann");
  assert.deepEqual(nAnn.map((n) => [n.kind, n.list_owner, n.provider, n.plan]), [["left-list", "project:P", P.provider, P.teamApi], ["left-list", "project:Q", P.provider, P.teamApi]]);
  assert.deepEqual(notices("cy").map((n) => [n.kind, n.list_owner]), [["left-list", "member:cy"]]);
  assert.deepEqual(notices("ann"), nAnn, "the same keys on every read");
  assert.equal(new Set(nAnn.map((n) => n.key)).size, 2);
  for (const viewer of ["bob", "eve", "class:ai", null]) assert.deepEqual(notices(viewer), [], `${String(viewer)}: not an owner of any list`);
  assert.deepEqual(leaks(w, SECRET("flagged"), { answers: [nAnn, notices("cy")] }), []);
  assert.deepEqual(w.a.accountNoticesFor({ viewer: "ann", after: nAnn[0].at }).length, 0, "after the instant: none later");
  /* control: off again writes nothing; on again restores no place */
  const n = w.snapshot();
  assert.equal(w.a.crossOwnerOptInSet({ account_id: team.account_id, on: false, by: "admin" }).changed, false);
  assert.equal(w.snapshot(), n, "an already-off flag writes nothing");
  w.a.crossOwnerOptInSet({ account_id: team.account_id, on: true, by: "admin" });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ai_account_lists WHERE account_id=?`, team.account_id)[0].n, 1, "no place restored");
  assert.deepEqual(notices("ann"), nAnn);
  /* a member's own account shared to a project: off removes it from the project's list, its owners told */
  const mine = await w.own("bob");
  w.a.crossOwnerOptInSet({ account_id: mine.account_id, on: true, by: "bob" });
  order(w, "project:P", [mine.account_id], "ann");
  w.a.crossOwnerOptInSet({ account_id: mine.account_id, on: false, by: "bob" });
  assert.deepEqual(ids(w, "project:P", "ann"), []);
  assert.equal(notices("ann").length, 3);
});

/* membership's `onProjectLeft` (its R158) is built by MEMBERSHIP's job in this tranche; an arm that needs `projectRemove` to call it is
   todo until the tranche carries it (K208: a requirement not yet met is a todo, never a red test) */
import { world } from "./fixture.mjs";
const HOOK = typeof world().m.onProjectLeft === "function";

test("R77: a member who can no longer place a shared account loses her placements: when she is removed from a project (`projectRemove`), the entries she placed that are not the project's own and her own member account whoever placed it leave the project's list in the same act, each a change (R16) recorded with the project, the account, who placed it, the act's `by` and the instant; an entry placed by another member stays; the project's owners other than her are owed one notice per account, answered by accountNoticesFor as `left-project-list`", { todo: !HOOK }, async () => {
  const w = await projectWorld();
  seen(w, "ann", "bob");
  const team = await on(w, w.team());
  const team2 = await on(w, w.team({ secret: SECRET("t2") }));
  w.a.crossOwnerOptInSet({ account_id: team.account_id, on: true, by: "admin" });
  w.a.crossOwnerOptInSet({ account_id: team2.account_id, on: true, by: "admin" });
  const hers = await w.own("bob");
  w.a.crossOwnerOptInSet({ account_id: hers.account_id, on: true, by: "bob" });
  const pa = await w.projectAccount("P", "ann");
  assert.equal(order(w, "project:P", [pa.account_id, team.account_id], "bob").ok, true, "bob places the team account");
  assert.equal(order(w, "project:P", [pa.account_id, team.account_id, team2.account_id, hers.account_id], "ann").ok, true, "ann places a second and bob's own");
  const before = w.rows(`SELECT COUNT(*) AS n FROM account_changes WHERE change='list_left_project'`)[0].n;
  const removed = w.m.projectRemove({ projectId: "P", handle: "bob", by: "ann", viewer: "member:ann" });
  assert.equal(removed.ok, true, JSON.stringify(removed));
  assert.deepEqual(ids(w, "project:P", "ann"), [pa.account_id, team2.account_id], "the team account bob placed and bob's own left; the one ann placed stays");
  const rows = w.rows(`SELECT owner, by, detail FROM account_changes WHERE change='list_left_project' ORDER BY seq`).map((r) => ({ owner: r.owner, by: r.by, ...JSON.parse(r.detail) }));
  assert.equal(rows.length - before, 2);
  assert.deepEqual(rows.map((r) => [r.owner, r.by, r.account_id, r.placed_by]), [["project:P", "ann", team.account_id, "bob"], ["project:P", "ann", hers.account_id, "ann"]]);
  const notices = w.a.accountNoticesFor({ viewer: "ann" }).filter((n) => n.kind === "left-project-list");
  assert.deepEqual(notices.map((n) => [n.project, n.provider, n.plan]), [["P", P.provider, P.teamApi], ["P", P.provider, P.memberApi]]);
  assert.deepEqual(w.a.accountNoticesFor({ viewer: "bob" }).filter((n) => n.kind === "left-project-list"), [], "she is told nothing");
  assert.equal(ids(w, "group", "admin").length, 2, "the team's own list is untouched");
  assert.equal(ids(w, "member:bob", "bob").length, 1, "and bob's own");
  /* control: the project's own account stays; a removal with no placements writes nothing; a throwing notices read changes nothing */
  const w2 = await projectWorld();
  const pa2 = await w2.projectAccount("P", "ann");
  const n0 = w2.snapshot();
  w2.m.projectRemove({ projectId: "P", handle: "bob", by: "ann", viewer: "member:ann" });
  assert.deepEqual(ids(w2, "project:P", "ann"), [pa2.account_id]);
  assert.equal(w2.rows(`SELECT COUNT(*) AS n FROM account_changes WHERE change='list_left_project'`)[0].n, 0);
  assert.notEqual(n0, null);
});

test("R77 control: `projectLeave` (she is `leaving`) and `projectOwnerRemove` call the listener not at all and the placements stand; a refused removal calls nobody", { todo: !HOOK }, async () => {
  const w = await projectWorld();
  const mine = await w.own("bob");
  w.a.crossOwnerOptInSet({ account_id: mine.account_id, on: true, by: "bob" });
  order(w, "project:P", [mine.account_id], "bob");
  assert.equal(w.m.projectLeave({ projectId: "P", by: "bob", viewer: "member:bob" }).ok, true);
  assert.deepEqual(ids(w, "project:P", "ann"), [mine.account_id], "leaving: still joined, the placements stand");
  assert.equal(w.m.projectRemove({ projectId: "P", handle: "bob", by: "eve", viewer: "member:eve" }).ok, false);
  assert.deepEqual(ids(w, "project:P", "ann"), [mine.account_id], "a refused removal calls nobody");
});

test("R27: a revoked member's accounts, tokens, opt-ins and places in other owners' lists are cleared in the revoking act, each a change (R16) told through R26 with why: revoked; her placements leave every project's list in the same act as R77 (2) removes them, one notice per account to the owners other than her; choice records stay as history; control: another member's accounts and placements and the team's own list stand, a revoked member with none writes and answers nothing", async () => {
  const w = await projectWorld();
  seen(w, "ann", "bob");
  w.project("Q", "ann");
  assert.equal(w.join("Q", "ann", "bob").ok, true);
  const told = [];
  w.a.onAccountCleared("credentials", (n) => told.push(n));
  const team = await on(w, w.team());
  w.a.crossOwnerOptInSet({ account_id: team.account_id, on: true, by: "admin" });
  const hers = await on(w, w.own("bob"));
  const sub = await on(w, w.a.accountSet({ owner: "member:bob", provider: P.provider, plan: P.subscription, means: "issued", secret: TOKEN("bob"), by: "bob" }));
  const keep = await on(w, w.own("ann"));
  w.a.crossOwnerOptInSet({ account_id: hers.account_id, on: true, by: "bob" });
  const pa = await w.projectAccount("P", "ann");
  const qa = await w.projectAccount("Q", "ann");
  assert.equal(order(w, "project:P", [pa.account_id, team.account_id], "bob").ok, true);
  assert.equal(order(w, "project:P", [pa.account_id, team.account_id, hers.account_id], "ann").ok, true);
  assert.equal(order(w, "project:Q", [qa.account_id, team.account_id, hers.account_id], "ann").ok, true);
  w.a.crossOwnerOptInSet({ account_id: keep.account_id, on: true, by: "ann" });
  const r = w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual(w.rows(`SELECT account_id FROM ai_accounts WHERE owner='member:bob'`), [], "her accounts are gone, the token with them");
  assert.deepEqual(told.map((n) => [n.why, n.owner, n.member, n.means, n.by]).sort(), [["revoked", "member:bob", "bob", "issued", "admin"], ["revoked", "member:bob", "bob", "sealed", "admin"]]);
  assert.deepEqual(ids(w, "project:P", "ann"), [pa.account_id], "her placement of the team account and her own left P");
  assert.deepEqual(ids(w, "project:Q", "ann"), [qa.account_id, team.account_id], "Q: the team account was placed by ann; hers is gone");
  const notices = w.a.accountNoticesFor({ viewer: "ann" }).filter((n) => n.kind === "left-project-list");
  assert.deepEqual(notices.map((n) => [n.project, n.plan]).sort(), [["P", P.memberApi], ["P", P.teamApi], ["Q", P.memberApi]].sort());
  assert.deepEqual(ids(w, "group", "admin"), [team.account_id], "the team's own list stands");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ai_accounts WHERE owner='member:ann'`)[0].n, 1, "another member's accounts stand");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ai_personal_choices WHERE account_id=?`, sub.account_id)[0].n, 1, "choice records stay as history");
  assert.equal(w.a.accountHistory({ owner: "member:bob", viewer: "bob" }).reason, "ACCOUNT_MEMBER_NOT_ACTIVE");
  const n = w.snapshot();
  w.m.memberSet({ memberId: "eve", status: "revoked", by: "admin" });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM account_changes WHERE owner='member:eve'`)[0].n, 0, "a revoked member with none writes nothing");
  assert.notEqual(n, null);
  assert.equal(told.length, 2);
  /* a throwing notices read changes nothing of the revocation */
  const { AiAccounts } = await import("../../../src/ai-accounts/index.mjs");
  const orig = AiAccounts.prototype.accountNoticesFor;
  AiAccounts.prototype.accountNoticesFor = () => { throw new Error("no"); };
  const w2 = await projectWorld();
  const m2 = await w2.own("bob");
  w2.a.crossOwnerOptInSet({ account_id: m2.account_id, on: true, by: "bob" });
  order(w2, "project:P", [m2.account_id], "ann");
  assert.equal(w2.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" }).ok, true);
  AiAccounts.prototype.accountNoticesFor = orig;
  assert.deepEqual(ids(w2, "project:P", "ann"), []);
});
