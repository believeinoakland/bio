/* ai-use R4 (the reads of use), R5 (limits reached), R12 (an account's limits, with its history) and R13 (the refusals'
   words by key), at the interface, each with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, WORDS } from "./fixture.mjs";
import { AI_USE_WORDS, LIMIT_WORD_BY_SCOPE, WHOSE_WORD, aiUseOps } from "../../../src/ai-use/index.mjs";

const AT = "2026-10-09T12:00:00Z";

/* ===== R4 ===== */

test("R4 aiUsage answers an account's owners its month of use per kind of use, summed over members and naming none; anyone else is refused as R2 refuses; it writes nothing", async () => {
  const w = await standard();
  w.count("project:P", "ann", "ask", { input: 10, cost: 0.1 });
  w.count("project:P", "bob", "ask", { input: 5, cost: 0.2 });
  w.count("project:P", "bob", "run", { input: 7 });
  w.count("project:P", "bob", "run", { input: 1000, at: "2026-09-30T12:00:00Z" });
  w.count("group", "bob", "ask", { input: 99 });
  const before = w.snapshot();
  const r = w.u.aiUsage({ owner: "project:P", viewer: "ann", at: AT });
  assert.deepEqual(r.uses.map((u) => [u.use, u.tokens, u.calls]), [["ask", 15, 2], ["run", 7, 1]]);
  assert.ok(Math.abs(r.uses[0].total_cost_usd - 0.3) < 1e-9, "the account's owners see its cost");
  assert.doesNotMatch(JSON.stringify(r), /"(ann|bob)"|member/);
  assert.deepEqual(w.u.aiUsage({ owner: "project:P", viewer: "ann", month: "2026-09" }).uses.map((u) => u.tokens), [1000]);
  for (const viewer of ["bob", "admin", null]) assert.equal(w.u.aiUsage({ owner: "project:P", viewer }).ok, false, String(viewer));
  assert.equal(w.u.aiUsage({ owner: "group", viewer: "ann" }).code, "NOT_AN_ADMIN");
  assert.equal(w.u.aiUsage({ owner: "member:ann", viewer: "bob" }).code, "NOT_YOUR_CEILING");
  assert.equal(w.u.aiUsage({ owner: "group", viewer: "second", at: AT }).uses[0].tokens, 99, "control: an administrator reads the group's");
  assert.equal(w.snapshot(), before);
});

test("R4 aiUsageMine answers a member their own use per payer and per use, with each limit that bound them; a cost only for the accounts they own; never another member's spending", async () => {
  const w = await standard();
  w.u.aiLimitSet({ owner: "group", scope: "per_member", unit: "calls", period: "day", amount: 1, by: "admin" });
  w.u.aiLimitSet({ owner: "project:P", scope: "ask", unit: "calls", period: "day", amount: 9, by: "ann" });
  w.count("group", "bob", "ask", { input: 3, cost: 0.5 });
  w.count("project:P", "bob", "ask", { input: 4, cost: 0.25 });
  w.count("project:P", "ann", "ask", { input: 400, cost: 9 });
  const bob = w.u.aiUsageMine({ viewer: "bob", at: AT });
  assert.deepEqual(bob.payers.map((p) => [p.owner, p.whose, p.uses.map((u) => [u.use, u.tokens])]),
    [["group", "group", [["ask", 3]]], ["project:P", "project", [["ask", 4]]]]);
  assert.equal(JSON.stringify(bob).includes("cost"), false, "bob owns neither account: no cost");
  assert.deepEqual(bob.payers[0].limits.map((l) => [l.scope, l.reached]), [["per_member", true]]);
  assert.deepEqual(bob.payers[1].limits.map((l) => [l.scope, l.reached]), [["ask", false]]);
  assert.equal(JSON.stringify(bob).includes("400"), false, "ann's use is not shown to bob");
  /* control: ann owns P, so its cost is hers to see */
  const ann = w.u.aiUsageMine({ viewer: "ann", at: AT });
  assert.equal(ann.payers[0].uses[0].total_cost_usd, 9);
  assert.equal(w.u.aiUsageMine({ viewer: "bob", month: "2026-10", at: AT }).payers.length, 2);
  assert.equal(w.u.aiUsageMine({ viewer: null }).code, "NOT_YOUR_CEILING");
  assert.equal(w.u.aiUsageMine({ viewer: "machine:agent" }).code, "NOT_YOUR_CEILING");
});

test("R4 the ops: aiusage with owner is R4's account read, without it the viewer's own; ailimitset and ailimits take who from the control plane's stamp, never the body", async () => {
  const w = await standard();
  w.count("member:ann", "ann", "ask");
  const ops = (q, body = null) => aiUseOps(w.u, new URL(`http://x/?${q}`), body);
  assert.equal(ops("owner=member:ann&viewer=ann").aiusage().owner, "member:ann");
  assert.equal(ops("viewer=ann").aiusage().member, "ann");
  assert.equal(ops("by=bob", { owner: "member:ann", scope: "ask", unit: "calls", period: "day", amount: 3, by: "ann" }).ailimitset().code,
    "NOT_YOUR_CEILING", "the body's by is not believed");
  assert.equal(ops("by=ann", { owner: "member:ann", scope: "ask", unit: "calls", period: "day", amount: 3 }).ailimitset().ok, true);
  assert.equal(ops("owner=member:ann&viewer=ann").ailimits().limits.length, 1);
});

/* ===== R5 ===== */

test("R5 limitsReached answers, for each account the viewer owns, each limit first reached in its current period with a stable key; not before it is reached, not to anyone else, not in the next period; it writes nothing", async () => {
  const w = await standard();
  w.u.aiLimitSet({ owner: "project:P", scope: "overall", unit: "calls", period: "day", amount: 2, by: "ann" });
  w.u.aiLimitSet({ owner: "member:ann", scope: "ask", unit: "calls", period: "month", amount: 1, by: "ann" });
  w.count("project:P", "bob", "run", { at: "2026-10-09T10:00:00Z" });
  assert.deepEqual(w.u.limitsReached({ viewer: "ann", at: AT }).reached, [], "not yet reached");
  w.count("project:P", "bob", "run", { at: "2026-10-09T11:00:00Z" });
  w.count("project:P", "bob", "run", { at: "2026-10-09T11:30:00Z" });
  w.count("member:ann", "ann", "ask", { at: "2026-10-09T11:45:00Z" });
  const before = w.snapshot();
  const r = w.u.limitsReached({ viewer: "ann", at: AT }).reached;
  assert.deepEqual(r, [
    { key: "ai-limit:project:P:overall:calls:day:2026-10-09", owner: "project:P", scope: "overall", unit: "calls", period: "day",
      period_start: "2026-10-09", reached_at: "2026-10-09T11:00:00Z" },
    { key: "ai-limit:member:ann:ask:calls:month:2026-10-01", owner: "member:ann", scope: "ask", unit: "calls", period: "month",
      period_start: "2026-10-01", reached_at: "2026-10-09T11:45:00Z" }]);
  assert.deepEqual(w.u.limitsReached({ viewer: "ann", at: AT }).reached, r, "the same keys again");
  assert.equal(w.snapshot(), before);
  assert.deepEqual(w.u.limitsReached({ viewer: "bob", at: AT }).reached, [], "bob owns neither account");
  assert.deepEqual(w.u.limitsReached({ viewer: "ann", at: "2026-10-10T12:00:00Z" }).reached.map((x) => x.owner), ["member:ann"],
    "the day's limit is a new period; the month's is not");
  assert.doesNotThrow(() => w.u.limitsReached({}));
});

test("R5 a limit set below what is already used is reached when set; the group's limits are answered to its administrators", async () => {
  const w = await standard();
  w.count("group", "bob", "ask", { calls: 3 });
  w.u.aiLimitSet({ owner: "group", scope: "ask", unit: "calls", period: "day", amount: 2, by: "admin", at: AT });
  assert.equal(w.u.limitsReached({ viewer: "second", at: AT }).reached[0].reached_at, AT);
  assert.deepEqual(w.u.limitsReached({ viewer: "ann", at: AT }).reached, []);
});

/* ===== R12 ===== */

test("R12 aiLimits answers each limit of one account (scope, use, unit, period, inclusive or on top) with its use in the current period naming no member, and its history (set, changed, removed; who and when), to its owners only", async () => {
  const w = await standard();
  w.u.aiLimitSet({ owner: "project:P", scope: "run", unit: "tokens", period: "day", amount: 500, inclusive: false, by: "ann", at: "2026-10-09T08:00:00Z" });
  w.u.aiLimitSet({ owner: "project:P", scope: "overall", unit: "usd", period: "month", amount: 2, by: "ann", at: "2026-10-09T08:01:00Z" });
  w.u.aiLimitSet({ owner: "project:P", scope: "per_member", unit: "calls", period: "day", amount: 4, by: "ann", at: "2026-10-09T08:02:00Z" });
  w.u.aiLimitSet({ owner: "project:P", scope: "ask", unit: "calls", period: "day", amount: 1, by: "ann", at: "2026-10-09T08:03:00Z" });
  w.u.aiLimitSet({ owner: "project:P", scope: "ask", unit: "calls", period: "day", amount: null, by: "ann", at: "2026-10-09T08:04:00Z" });
  w.count("project:P", "bob", "run", { input: 300, cost: 0.5, calls: 2 });
  w.count("project:P", "ann", "ask", { input: 10, cost: 0.25, calls: 1 });
  const r = w.u.aiLimits({ owner: "project:P", viewer: "ann", at: AT });
  const by = Object.fromEntries(r.limits.map((l) => [l.scope, l]));
  assert.deepEqual([by.run.use, by.run.inclusive, by.run.on_top, by.run.used, by.run.reached], ["run", false, true, 300, false]);
  assert.deepEqual([by.overall.use, by.overall.inclusive, by.overall.amount, by.overall.used], [null, null, 2, 0.25],
    "overall counts the uses that are not exclusive");
  assert.deepEqual([by.per_member.used, by.per_member.amount], [2, 4], "the most any one member used, naming none");
  assert.equal(by.ask, undefined, "a removed limit is not held");
  assert.deepEqual(r.history.map((h) => [h.change, h.scope, h.by, h.at]), [
    ["set", "run", "member:ann", "2026-10-09T08:00:00Z"], ["set", "overall", "member:ann", "2026-10-09T08:01:00Z"],
    ["set", "per_member", "member:ann", "2026-10-09T08:02:00Z"], ["set", "ask", "member:ann", "2026-10-09T08:03:00Z"],
    ["removed", "ask", "member:ann", "2026-10-09T08:04:00Z"]]);
  assert.doesNotMatch(JSON.stringify(r.limits), /bob/);
});

test("R12 anyone but the account's owners is refused as credentials R60 refuses them, writing nothing", async () => {
  const w = await standard();
  w.u.aiLimitSet({ owner: "member:ann", scope: "ask", unit: "calls", period: "day", amount: 1, by: "ann" });
  const before = w.snapshot();
  for (const [owner, viewer] of [["member:ann", "bob"], ["member:ann", "admin"], ["project:P", "bob"], ["project:P", "cy"],
                                 ["group", "ann"], ["group", null], ["group", "machine:agent"]]) {
    const r = w.u.aiLimits({ owner, viewer });
    const own = w.c.accountUses({ owner, viewer });
    assert.equal(r.ok, false, `${owner} ${viewer}`);
    assert.deepEqual([r.code, r.check], [own.code, own.check], `${owner} ${viewer}`);
  }
  assert.equal(w.snapshot(), before);
  /* negative controls: each account's owners read it */
  for (const [owner, viewer] of [["member:ann", "ann"], ["project:P", "ann"], ["group", "admin"], ["group", "second"]])
    assert.equal(w.u.aiLimits({ owner, viewer }).ok, true, `${owner} ${viewer}`);
});

/* ===== R13 ===== */

test("R13 each refusal's member-facing sentence is read by key from words.json, verbatim: AI_LIMIT_REACHED by its scope with {whose} filled from ai.whose.*, never a cost; AI_LIMIT_INVALID, LIMIT_UNIT_UNAVAILABLE, EXPLORE_NOT_ENABLED; the Ask item ai.queue.exploreask", async () => {
  for (const [key, en] of Object.entries(AI_USE_WORDS)) assert.equal(en, WORDS[key], `${key} is words.json's own sentence`);
  for (const key of ["ai.refused.limit", "ai.refused.limit.overall", "ai.refused.limit.member", "ai.whose.group", "ai.whose.project",
                     "ai.whose.own", "ai.refused.limitinvalid", "ai.refused.unitunavailable", "ai.refused.explorenotenabled",
                     "ai.queue.exploreask"])
    assert.ok(typeof WORDS[key] === "string" && AI_USE_WORDS[key] === WORDS[key], `${key} in words.json`);
  assert.deepEqual(LIMIT_WORD_BY_SCOPE, { overall: "ai.refused.limit.overall", per_member: "ai.refused.limit.member" });
  assert.deepEqual(WHOSE_WORD, { group: "ai.whose.group", project: "ai.whose.project", own: "ai.whose.own" });
  const w = await standard();
  w.u.aiLimitSet({ owner: "member:ann", scope: "ask", unit: "usd", period: "day", amount: 0.01, by: "ann" });
  w.u.aiLimitSet({ owner: "member:ann", scope: "overall", unit: "calls", period: "day", amount: 1, by: "ann" });
  w.count("member:ann", "ann", "ask", { cost: 0.5 });
  const r = w.u.useCheck({ owner: "member:ann", member: "ann", use: "ask", at: AT });
  assert.equal(r.word, "ai.refused.limit");
  assert.equal(r.translation, WORDS["ai.refused.limit"].replace("{whose}", WORDS["ai.whose.own"]));
  assert.doesNotMatch(r.translation, /0\.5|\$|cent|dollar/i, "never a cost");
  /* negative control: a different scope reads a different key */
  assert.equal(w.u.useCheck({ owner: "member:ann", member: "ann", use: "draft", at: AT }).word, "ai.refused.limit.overall");
  assert.equal(w.u.aiLimitSet({ owner: "member:ann", scope: "ask", unit: "x", period: "day", amount: 1, by: "ann" }).word, "ai.refused.limitinvalid");
});
