/* ai-accounts R7, R11, R25, R48, R51, R55, R56, R62, R63 at the interface: which account serves an act (keep-away first, then
   the level, then the head of the level's sequence), the refusals that never move an act to another payer, the entries and
   checks that offer an AI for the act's part, the free tier, the recipient's notice, and fail closed. Every id is tested with a
   negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, SECRET } from "./fixture.mjs";
import { PLANS as P, ENTRIES as E, setGate, setCheck, setLifecycle, setUnavailable } from "./catalogue.mjs";
import { shape, refusal, ask, act, projectWorld, on } from "./helpers.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";
import { AI_ACCOUNT_CHECKS } from "../../../src/ai-accounts/index.mjs";

const seen = (w, ...members) => { for (const m of members) w.a.recipientNoticeSeen({ member: m, provider: P.provider, host: "api.anthropic.com", by: m }); };
const TOKEN = (who) => `sk-ant-oat01-sentinel-${who}-0123456789`;
const served = async (w, member, a) => (await w.a.accountFor({ member, act: a ?? ask(member) }));

test("R7 R11: accountFor answers `{ok, account_id, level, owner, provider, plan, means, entry_id, entries, member, project?, suggestions, personal, disclosed}` plus, for the one call, the secret; the level is the project's when the act names a project whose list holds an account that is on, else the member's own, else the team's; control: with none on, NO_ACCOUNT", async () => {
  const w = await projectWorld();
  seen(w, "ann", "bob", "eve");
  assert.deepEqual(shape(await served(w, "bob")), refusal("NO_ACCOUNT"), "nothing held");
  const team = await on(w, w.team());
  const r = await served(w, "bob");
  assert.deepEqual({ ...r, secret: r.secret === SECRET("team") }, { ok: true, account_id: team.account_id, level: "group", owner: "group", provider: P.provider,
    plan: P.teamApi, means: "sealed", entry_id: E.a, entries: [E.a, E.b], member: "bob", suggestions: false, personal: false,
    disclosed: [{ provider: P.provider, host: "api.anthropic.com" }], secret: true });
  const proj = await on(w, w.projectAccount("P", "ann"));
  assert.equal((await served(w, "bob", ask("bob", "P"))).account_id, proj.account_id, "the project's, for an act in the project");
  assert.equal((await served(w, "bob")).account_id, team.account_id, "outside the project: the team's");
  const mine = await on(w, w.own("bob"));
  const p = await served(w, "bob", ask("bob", "P"));
  assert.deepEqual([p.account_id, p.level, p.project], [proj.account_id, "project", "P"], "the project's first");
  assert.equal((await served(w, "bob")).account_id, mine.account_id, "the member's own before the team's");
  w.a.accountSwitch({ account_id: proj.account_id, on: false, by: "ann" });
  assert.equal((await served(w, "bob", ask("bob", "P"))).account_id, mine.account_id, "the project's list holds no account that is on: the member's own");
  w.a.accountSwitch({ account_id: mine.account_id, on: false, by: "bob" });
  assert.equal((await served(w, "bob", ask("bob", "P"))).account_id, team.account_id, "else the team's");
  assert.equal((await served(w, "eve")).account_id, team.account_id);
  /* an act of another member, a kind that is not served, an inactive member */
  assert.equal((await w.a.accountFor({ member: "bob", act: ask("ann") })).reason, "NOT_YOUR_ACCOUNT");
  assert.equal((await w.a.accountFor({ member: "bob", act: act("explore", "bob") })).reason, "NOT_YOUR_ACCOUNT");
  assert.equal((await w.a.accountFor({ member: "bob", act: { kind: "bogus", member: "bob" } })).reason, "NOT_YOUR_ACCOUNT");
  w.sql.exec(`UPDATE members SET status='suspended' WHERE member_id='eve'`);
  assert.equal((await served(w, "eve")).reason, "ACCOUNT_MEMBER_NOT_ACTIVE");
});

test("R11: a project the member cannot see is absent; one seen and not joined is PROJECT_ACT_NOT_A_PARTICIPANT; keep-away is asked before either (R57)", async () => {
  const w = await projectWorld();
  await on(w, w.team());
  seen(w, "ann", "eve", "dee");
  assert.deepEqual(await served(w, "eve", ask("eve", "P")), noSuchProject("P"));
  for (const [member, project] of [["eve", "D"], ["ann", "D"]])
    assert.match((await served(w, member, ask(member, project))).reason, /^PROJECT_(SEEN|ACT)_NOT_A_PARTICIPANT$/, `${member} in ${project}: membership's refusal for a project seen and not joined`);
  assert.equal((await served(w, "dee", ask("dee", "D"))).ok, true, "control: the owner's own project");
});

test("R11 (4): the head is refused, never skipped: its switch for the kind off (AI_USE_SWITCHED_OFF naming the use and whose account) though the next account's switch is on; a free-tier plan not accepted (FREE_TIER_NOT_ACCEPTED); its recipient's notice due (RECIPIENT_NOTICE_DUE); its account flagged for a payer difference (PAYER_NOT_VERIFIED); control: a pair excluded only by a check in force is skipped, the next is served", async () => {
  const w = await projectWorld();
  const a1 = await on(w, w.own("ann", { entries: [E.a] }));
  const a2 = await on(w, w.own("ann", { entries: [E.b] }));
  seen(w, "ann");
  assert.equal((await served(w, "ann")).account_id, a1.account_id);
  w.a.accountUsesSet({ account_id: a1.account_id, switch: "ask", on: false, by: "ann" });
  const off = await served(w, "ann");
  assert.deepEqual([off.reason, off.whose, off.use], ["AI_USE_SWITCHED_OFF", "own", "ask"]);
  assert.equal(off.translation, AI_ACCOUNT_CHECKS.AI_USE_SWITCHED_OFF.translation);
  assert.equal((await served(w, "ann", act("run", "ann"))).account_id, a1.account_id, "another kind: the same head");
  w.a.accountUsesSet({ account_id: a1.account_id, switch: "ask", on: true, by: "ann" });
  /* a pair excluded only by a check in force is skipped */
  w.a.checksSet({ level: "member:ann", check: "P1", ticked: true, by: "ann" });
  setCheck(w, E.a, "P1", false);
  assert.equal((await served(w, "ann")).account_id, a2.account_id, "claude-a is not offered under P1: skipped");
  setCheck(w, E.a, "P1", true);
  /* the recipient's notice: eve, served by the team's account, has not read it (connecting records it, so a member's own account has) */
  await on(w, w.team());
  const due = await served(w, "eve");
  assert.deepEqual([due.reason, due.recipient], ["RECIPIENT_NOTICE_DUE", { provider: P.provider, host: "api.anthropic.com" }]);
  seen(w, "eve");
  assert.equal((await served(w, "eve")).level, "group");
  /* free tier */
  const fr = await on(w, w.a.accountSet({ owner: "member:cy", provider: P.freeProvider, plan: P.freeApi, means: "sealed", secret: SECRET("cy"), by: "cy" }));
  w.a.recipientNoticeSeen({ member: "cy", provider: P.freeProvider, host: "free.example", by: "cy" });
  assert.equal((await served(w, "cy")).reason, "FREE_TIER_NOT_ACCEPTED");
  assert.equal((await served(w, "cy")).reason, "FREE_TIER_NOT_ACCEPTED", "a free-tier head refuses and does not fall through to the team's");
  assert.equal(fr.ok, true);
});

test("R11 (5): no usable pair is NO_ACCOUNT when the level holds no account that is on and held, else NO_ENTRY_OFFERED naming the checks or part that excluded every pair", async () => {
  const w = await projectWorld();
  seen(w, "ann");
  const x = await on(w, w.own("ann"));
  setGate(w, E.a, "ask", "not_suitable");
  setGate(w, E.b, "ask", "not_rated");
  const none = await served(w, "ann");
  assert.deepEqual(shape(none), refusal("NO_ENTRY_OFFERED"));
  assert.deepEqual(none.reasons.sort(), ["PART_NOT_PASSED", "PART_NOT_RATED"]);
  assert.match(none.detail, /PART_NOT_PASSED/);
  assert.equal((await served(w, "ann", act("run", "ann"))).account_id, x.account_id, "the same entries are offered for another part");
  setGate(w, E.a, "ask", "passes"); setGate(w, E.b, "ask", "passes");
  w.a.accountSwitch({ account_id: x.account_id, on: false, by: "ann" });
  assert.equal((await served(w, "ann")).reason, "NO_ACCOUNT");
  w.a.accountSwitch({ account_id: x.account_id, on: true, by: "ann" });
  assert.equal((await served(w, "ann")).ok, true);
});

test("R55: entryOffered answers {ok} or the first refusal in order: ENTRY_NOT_ALLOWED (R46's intersection), then the first reason of the catalogue's whyNotOffered for the act's part by its code unchanged (ENTRY_LAPSED, ENTRY_RETIRED, PART_NOT_PASSED, PART_NOT_RATED, CHECK_NOT_MET, CHECK_OPEN, NEEDS_NEWER_RELEASE, NO_PLAN_OFFERED); an entry open on a ticked P1 is not offered, offered where P1 is not in force; one not suitable for a part is offered for the others; entriesOffered lists those that pass", async () => {
  const w = await projectWorld();
  const a = ask("ann");
  assert.deepEqual(w.a.entryOffered({ entry_id: E.a, member: "ann", act: a }), { ok: true });
  setCheck(w, E.a, "P1", null);
  const open = w.a.entryOffered({ entry_id: E.a, member: "ann", act: a });
  assert.equal(open.ok, false);
  assert.deepEqual([open.reason, open.entry_id, open.check_id], ["CHECK_OPEN", E.a, "P1"]);
  w.a.checksSet({ level: "group", check: "P1", ticked: false, by: "admin" });
  assert.deepEqual(w.a.entryOffered({ entry_id: E.a, member: "ann", act: a }), { ok: true }, "offered where P1 is not in force");
  w.a.checksSet({ level: "group", check: "P1", ticked: true, by: "admin" });
  setCheck(w, E.a, "P1", false);
  assert.equal(w.a.entryOffered({ entry_id: E.a, member: "ann", act: a }).reason, "CHECK_NOT_MET");
  setCheck(w, E.a, "P1", true);
  setGate(w, E.a, "draft", "not_suitable");
  const part = w.a.entryOffered({ entry_id: E.a, member: "ann", act: act("draft", "ann") });
  assert.deepEqual([part.reason, part.part], ["PART_NOT_PASSED", "draft"]);
  assert.match(part.detail, /draft/);
  assert.equal(w.a.entryOffered({ entry_id: E.a, member: "ann", act: a }).ok, true, "offered for the others");
  assert.equal(w.a.entryOffered({ entry_id: E.a, member: "ann", act: act("enquire", "ann") }).reason, "PART_NOT_PASSED", "enquire is the draft part");
  setGate(w, E.a, "draft", "not_rated");
  assert.equal(w.a.entryOffered({ entry_id: E.a, member: "ann", act: act("draft", "ann") }).reason, "PART_NOT_RATED");
  setLifecycle(w, E.b, "lapsed");
  assert.equal(w.a.entryOffered({ entry_id: E.b, member: "ann", act: a }).reason, "ENTRY_LAPSED");
  setLifecycle(w, E.b, "retired");
  assert.equal(w.a.entryOffered({ entry_id: E.b, member: "ann", act: a }).reason, "ENTRY_RETIRED");
  assert.equal(w.a.entryOffered({ entry_id: "no-such", member: "ann", act: a }).reason, "ENTRY_NOT_ALLOWED");
  /* the intersection first */
  w.a.offeredSet({ owner: "member:ann", entries: [E.a], by: "ann" });
  assert.equal(w.a.entryOffered({ entry_id: E.free, member: "ann", act: a }).reason, "ENTRY_NOT_ALLOWED");
  const list = w.a.entriesOffered({ member: "ann", act: a });
  assert.deepEqual(list.entries.map((e) => e.entry_id), [E.a]);
  assert.equal(w.a.entriesOffered({ member: "bob", act: a }).entries.some((e) => e.entry_id === E.b), false, "retired: not offered");
  assert.deepEqual(w.a.entriesOffered({ member: "bob", act: a }).entries.map((e) => e.entry_id).sort(), [E.a, E.free, E.builtin].sort());
});

test("R56: a plan the catalogue marks free_tier_trains serves only after the owner's acceptance of its current warning version: freeTierAccept (an administrator's for a team account, a project owner's for a project's, the member's for their own) records who, when, plan and warning version; freeTierWithdraw removes it; an acceptance of an older warning version no longer counts; control: a non-owner cannot accept, a plan not marked needs none", async () => {
  const w = await projectWorld();
  const x = await on(w, w.a.accountSet({ owner: "project:P", provider: P.freeProvider, plan: P.freeApi, means: "sealed", secret: SECRET("fp"), by: "ann" }));
  w.a.recipientNoticeSeen({ member: "bob", provider: P.freeProvider, host: "free.example", by: "bob" });
  assert.equal((await served(w, "bob", ask("bob", "P"))).reason, "FREE_TIER_NOT_ACCEPTED");
  assert.equal(w.a.freeTierAccept({ account_id: x.account_id, by: "bob" }).reason, "PROJECT_ACT_NOT_THE_OWNER");
  const acc = w.a.freeTierAccept({ account_id: x.account_id, by: "ann" });
  assert.deepEqual([acc.ok, acc.needed, acc.accepted, acc.warning_version], [true, true, true, "w1"]);
  assert.equal((await served(w, "bob", ask("bob", "P"))).account_id, x.account_id);
  const row = w.row(`SELECT * FROM ai_free_tier WHERE account_id=?`, x.account_id);
  assert.deepEqual([row.accepted_by, row.plan, row.warning_version], ["ann", P.freeApi, "w1"]);
  assert.equal(w.a.accountHistory({ owner: "project:P", viewer: "ann" }).changes.some((c) => c.change === "free_tier" && c.accepted === true && c.by === "ann"), true, "R16");
  w.sql.exec(`UPDATE ai_free_tier SET warning_version='w0' WHERE account_id=?`, x.account_id);
  assert.equal((await served(w, "bob", ask("bob", "P"))).reason, "FREE_TIER_NOT_ACCEPTED", "an older warning version no longer counts, with no act of anyone");
  w.a.freeTierAccept({ account_id: x.account_id, by: "ann" });
  assert.deepEqual(w.a.freeTierWithdraw({ account_id: x.account_id, by: "ann" }), { ok: true, account_id: x.account_id, withdrawn: true });
  assert.equal((await served(w, "bob", ask("bob", "P"))).reason, "FREE_TIER_NOT_ACCEPTED");
  const api = await w.projectAccount("P", "ann");
  assert.deepEqual(w.a.freeTierAccept({ account_id: api.account_id, by: "ann" }), { ok: true, account_id: api.account_id, needed: false });
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM ai_free_tier WHERE account_id=?`, api.account_id).n, 0, "a plan not marked needs none");
  /* the team's: an administrator's */
  const t = await w.a.accountSet({ owner: "group", provider: P.freeProvider, plan: P.freeApi, means: "sealed", secret: "s", by: "admin" });
  assert.equal(w.a.freeTierAccept({ account_id: t.account_id, by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.a.freeTierAccept({ account_id: t.account_id, by: "second" }).ok, true);
});

test("R51: disclosure is per provider and host: recipientNoticeDue answers null when the member has seen that recipient's notice, else RECIPIENT_NOTICE_DUE with the recipient; recipientNoticeSeen is the member's own act; connecting an account of one's own records its recipient seen in the same act; a second member's notice is separate", async () => {
  const w = await projectWorld();
  const due = w.a.recipientNoticeDue({ member: "ann", entry_id: E.a });
  assert.deepEqual([due.reason, due.recipient], ["RECIPIENT_NOTICE_DUE", { provider: P.provider, host: "api.anthropic.com" }]);
  assert.match(due.detail, /api\.anthropic\.com \(anthropic\)/);
  assert.equal(w.a.recipientNoticeSeen({ member: "ann", provider: P.provider, host: "api.anthropic.com", by: "bob" }).reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.a.recipientNoticeSeen({ member: "ann", provider: P.provider, host: "api.anthropic.com", by: null }).reason, "MACHINE_CANNOT_HOLD_ACCOUNT");
  assert.deepEqual(w.a.recipientNoticeSeen({ member: "ann", provider: P.provider, host: "api.anthropic.com", by: "ann" }), { ok: true, seen: true, already: false });
  assert.equal(w.a.recipientNoticeSeen({ member: "ann", provider: P.provider, host: "api.anthropic.com", by: "ann" }).already, true);
  assert.equal(w.a.recipientNoticeDue({ member: "ann", entry_id: E.a }), null);
  assert.equal(w.a.recipientNoticeDue({ member: "ann", entry_id: E.b }), null, "the same provider and host");
  assert.equal(w.a.recipientNoticeDue({ member: "bob", entry_id: E.a }).reason, "RECIPIENT_NOTICE_DUE", "a second member's notice is separate");
  assert.equal(w.a.recipientNoticeDue({ member: "ann", entry_id: E.free }).reason, "RECIPIENT_NOTICE_DUE", "another host");
  await w.own("bob");
  assert.equal(w.a.recipientNoticeDue({ member: "bob", entry_id: E.a }), null, "connecting records it seen");
  assert.equal(w.a.recipientNoticeSeen({ member: "ann", provider: "", host: "x", by: "ann" }).ok, false);
  assert.equal(w.a.recipientNoticeDue({ member: "ann", entry_id: "no-such" }).reason, "ENTRY_NOT_ALLOWED");
});

test("R48: a personal subscription serves only acts its owner runs: the owner's act, in a project or not, is served; another member's act in the same project, a team act and a hop from a team account are not, whatever sits on a list; it is never a hop target for another member; control: the owner's own team-less act", async () => {
  const w = await projectWorld();
  seen(w, "ann", "bob");
  const sub = await on(w, w.a.accountSet({ owner: "member:ann", provider: P.provider, plan: P.subscription, means: "issued", secret: TOKEN("ann"), by: "ann" }));
  const s = await served(w, "ann");
  assert.deepEqual([s.account_id, s.personal], [sub.account_id, true]);
  assert.equal((await served(w, "ann", ask("ann", "P"))).account_id, sub.account_id, "in a project, still the owner's act");
  assert.equal((await w.a.accountSecretFor({ account_id: sub.account_id, act: ask("bob") })).reason, "NOT_YOUR_ACCOUNT");
  /* whatever opt-in is given: a row forced onto a project's list and the team's list is not a candidate for another's act */
  const team = await on(w, w.team());
  w.sql.exec(`INSERT INTO ai_account_lists (owner, project_id, account_id, position, placed_by) VALUES ('project:P', 'P', ?, 1, 'ann')`, sub.account_id);
  w.sql.exec(`INSERT INTO ai_account_lists (owner, account_id, position, placed_by) VALUES ('group', ?, 1, 'admin')`, sub.account_id);
  w.sql.exec(`UPDATE ai_account_lists SET position=2 WHERE owner='group' AND account_id=?`, team.account_id);
  const b = await served(w, "bob", ask("bob", "P"));
  assert.equal(b.reason, "NO_ENTRY_OFFERED", "bob's act in the same project: the personal subscription is not a candidate");
  const t = await served(w, "bob");
  assert.equal(t.account_id, team.account_id, "a team-level act skips it and finds the team's own");
  const hop = w.a.hopFor({ member: "bob", act: ask("bob"), from: { account_id: team.account_id, entry_id: E.b }, reason: "limit", at_step_boundary: true });
  assert.equal(hop.reason, "LIST_EXHAUSTED", "never a hop target for another member");
  assert.equal(w.a.crossOwnerOptInSet({ account_id: sub.account_id, on: true, by: "ann" }).reason, "PERSONAL_SUBSCRIPTION_NOT_SHARED");
});

test("R25: accountServing answers R11's choice without unsealing, {refusal} or {account_id, level, provider, plan, means, entry_id, project?, member?}; servingAccountOf the head's {account_id, level, means, suggestions, standing} or null; accountActBar R1's, R5's or R10's refusals or null; none carries a secret, each equals the one accountFor reaches", async () => {
  const w = await projectWorld();
  seen(w, "ann", "bob");
  const x = await on(w, w.own("ann"));
  const proj = await on(w, w.projectAccount("P", "ann"));
  w.a.accountUsesSet({ account_id: x.account_id, switch: "standing", on: true, by: "ann" });
  const s = w.a.accountServing({ member: "ann", use: "ask", project: null });
  assert.deepEqual(s, { account_id: x.account_id, level: "member", provider: P.provider, plan: P.memberApi, means: "sealed", entry_id: E.a, member: "ann" });
  assert.equal(JSON.stringify(s).includes(SECRET("ann")), false);
  const f = await served(w, "ann");
  assert.equal(s.account_id, f.account_id);
  const p = w.a.accountServing({ member: "bob", use: "run", project: "P" });
  assert.deepEqual([p.account_id, p.level, p.project], [proj.account_id, "project", "P"]);
  assert.equal(w.a.accountServing({ member: "bob", use: "ask", project: null }).refusal.reason, "NO_ACCOUNT");
  assert.deepEqual(w.a.servingAccountOf({ member: "ann" }), { account_id: x.account_id, level: "member", means: "sealed", suggestions: false, standing: true });
  assert.equal(w.a.servingAccountOf({ member: "bob" }), null);
  assert.equal(w.a.accountActBar({ owner: "member:ann", by: "ann" }), null);
  assert.equal(w.a.accountActBar({ owner: "member:ann", by: "bob" }).reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.a.accountActBar({ owner: "group", by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.a.accountActBar({ owner: "project:P", by: "bob" }).reason, "PROJECT_ACT_NOT_THE_OWNER");
  assert.equal(w.a.accountActBar({ owner: "project:P", by: "ann" }), null);
  assert.equal(w.a.notYourAccount("d").reason, "NOT_YOUR_ACCOUNT");
  assert.equal(w.a.noAccount("ann").reason, "NO_ACCOUNT");
  assert.equal(w.a.accountMemberNotActive("d").reason, "ACCOUNT_MEMBER_NOT_ACTIVE");
});

test("R63: fail closed: an unreadable catalogue, check row, offered set or switch never offers an entry; the answer says it could not be read; control: with all four readable the same act is served", async () => {
  const w = await projectWorld();
  seen(w, "ann");
  const x = await on(w, w.own("ann"));
  assert.equal((await served(w, "ann")).ok, true, "control: all readable");
  setUnavailable(w);
  const cat = await served(w, "ann");
  assert.equal(cat.reason, "CATALOGUE_UNAVAILABLE");
  assert.equal(w.a.entryOffered({ entry_id: E.a, member: "ann", act: ask("ann") }).reason, "CATALOGUE_UNAVAILABLE");
  assert.deepEqual(w.a.entriesOffered({ member: "ann", act: ask("ann") }), { ok: true, entries: [], unreadable: true });
  setUnavailable(w, false);
  for (const [what, table] of [["a check row", "ai_check_ticks"], ["an offered set", "ai_offered"]]) {
    w.sql.exec(`ALTER TABLE ${table} RENAME TO ${table}_gone`);
    const r = await served(w, "ann");
    assert.deepEqual([what, r.reason, r.unreadable], [what, "NO_ENTRY_OFFERED", true]);
    assert.equal(w.a.checksInForce({ member: "ann", act: ask("ann") }).unreadable ?? (table === "ai_offered" ? true : undefined), true, what);
    w.sql.exec(`ALTER TABLE ${table}_gone RENAME TO ${table}`);
    assert.equal((await served(w, "ann")).ok, true, `control: ${what} readable again`);
  }
  assert.deepEqual(w.a.accountSwitchesOf({ account_id: x.account_id }), { on: true, suggestions: false, standing: false });
  w.sql.exec(`ALTER TABLE ai_accounts RENAME TO ai_accounts_gone`);
  assert.deepEqual(w.a.accountSwitchesOf({ account_id: x.account_id }), { unreadable: true }, "a switch that cannot be read reads as unreadable, not as on");
  assert.equal(w.a.accountUsesOf({ account_id: x.account_id }).unreadable, true);
  assert.notEqual((await served(w, "ann")).ok, true, "and offers nothing");
});

test("R62: the account rulings hold through accountFor, accountOrderSet and accountSet: (1) K2352: an account at its limit refuses, except along an owner-declared list (R50), and still refuses for a use its owner switched off; another owner's account joins only with its opt-in; a personal subscription is on no one else's list; (2) K2353 is ended: no project account is a sign-in; (3) K1755: a subscription token serves only that member; (4) K3061: one credential means beside reference and gateway", async () => {
  const w = await projectWorld();
  seen(w, "ann", "bob");
  const team = await on(w, w.team({ entries: [E.a] }));
  w.a.accountUsesSet({ account_id: team.account_id, switch: "ask", on: false, by: "admin" });
  const b = await served(w, "bob");
  assert.equal(b.reason, "AI_USE_SWITCHED_OFF", "(1) a switched-off use refuses");
  const mine = await on(w, w.own("bob"));
  const hop = w.a.hopFor({ member: "bob", act: ask("bob"), from: { account_id: mine.account_id, entry_id: E.a }, reason: "limit", at_step_boundary: true });
  assert.notEqual(hop.account_id, team.account_id, "(1) a hop never rescues a switched-off use");
  assert.equal(w.a.accountOrderSet({ owner: "project:P", accounts: [team.account_id], by: "ann" }).reason, "OPT_IN_MISSING", "(1) another owner's account joins only with its opt-in");
  assert.equal((await w.a.accountSet({ owner: "project:P", provider: P.provider, plan: P.subscription, means: "issued", secret: TOKEN("ann"), by: "ann" })).reason, "PERSONAL_SUBSCRIPTION_LEVEL", "(2) no project account is a sign-in");
  const sub = await on(w, w.a.accountSet({ owner: "member:ann", provider: P.provider, plan: P.subscription, means: "issued", secret: TOKEN("ann"), by: "ann" }));
  assert.equal(w.a.accountOrderSet({ owner: "project:P", accounts: [sub.account_id], by: "ann" }).reason, "PERSONAL_SUBSCRIPTION_NOT_SHARED", "(1) a personal subscription is on no one else's list");
  assert.equal((await w.a.accountSecretFor({ account_id: sub.account_id, act: ask("bob") })).reason, "NOT_YOUR_ACCOUNT", "(3) the token serves only that member");
  assert.equal(w.row(`SELECT means FROM ai_accounts WHERE account_id=?`, sub.account_id).means, "issued", "(4) one credential means");
});
