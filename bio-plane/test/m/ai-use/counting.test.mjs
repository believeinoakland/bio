/* ai-use R1 (counting), R7 (the tables) and R8 (its codes and their rows), at the interface, each with a negative control
   (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, standard, usage, WORDS } from "./fixture.mjs";
import { AI_USE_CHECKS, AI_USE_TABLES, AI_USE_WORDS, NOT_RECORDED, USAGE_TOKEN_FIGURES } from "../../../src/ai-use/index.mjs";
import { AI_RUNS_CHECKS } from "../../../src/run-rules/index.mjs";

const AT = "2026-10-09T12:00:00Z";
const counter = (w) => w.rows(`SELECT * FROM ai_usage ORDER BY owner, member, day, use, mode`);

test("R1 countUsage adds to the counter kept per owner, member, local day and use: the token sums, the calls and estimated_cost_usd; a second count on the same key adds to it, another key is its own row", async () => {
  const w = await standard();
  assert.equal(w.u.countUsage({ owner: "project:P", member: "bob", use: "run", mode: "explore-run", model: "m",
    usage: usage(100, 20, 0.5, { cache_read_input_tokens: 3, cache_creation_input_tokens: 4 }), calls: 2, at: AT }).ok, true);
  w.u.countUsage({ owner: "project:P", member: "bob", use: "run", mode: "explore-run", model: "m", usage: usage(1, 2, 0.25), calls: 3, at: AT });
  w.u.countUsage({ owner: "group", member: "bob", use: "ask", mode: "ask", model: "m", usage: usage(7, 0, null), calls: 1, at: AT });
  const rows = counter(w);
  assert.equal(rows.length, 2);
  const p = rows.find((r) => r.owner === "project:P");
  assert.deepEqual({ member: p.member, day: p.day, use: p.use, calls: p.calls, input: p.input_tokens, output: p.output_tokens,
    cr: p.cache_read_input_tokens, cw: p.cache_creation_input_tokens, micro: p.cost_micro_usd, cu: p.cost_unstated },
    { member: "bob", day: "2026-10-09", use: "run", calls: 5, input: 101, output: 22, cr: 3, cw: 4, micro: 750000, cu: 0 });
  const g = rows.find((r) => r.owner === "group");
  assert.deepEqual([g.use, g.input_tokens, g.cost_micro_usd, g.cost_unstated], ["ask", 7, 0, 1]);
});

test("R1 a null calls is counted as one, never none; a stated calls as given (negative control: calls 3 counts 3)", async () => {
  const w = await standard();
  w.u.countUsage({ owner: "member:ann", member: "ann", use: "ask", mode: "ask", usage: usage(1), calls: null, at: AT });
  assert.equal(w.row(`SELECT calls FROM ai_usage`).calls, 1);
  w.u.countUsage({ owner: "member:ann", member: "ann", use: "ask", mode: "ask", usage: usage(1), calls: 3, at: AT });
  assert.equal(w.row(`SELECT calls FROM ai_usage`).calls, 4);
});

test("R1 the cost summed is the figure usage carries: estimated_cost_usd when stated, else total_cost_usd, else unstated (counted as unstated, never as 0)", async () => {
  const w = await standard();
  const one = (u, mode) => w.u.countUsage({ owner: "member:ann", member: "ann", use: "run", mode, usage: u, calls: 1, at: AT });
  one(usage(1, 0, 0.1, { total_cost_usd: 9 }), "a");
  one(usage(1, 0, null, { total_cost_usd: 0.2 }), "b");
  one(usage(1, 0, null), "c");
  const { estimated_cost_usd: _omit, ...noEstimate } = usage(1, 0, null, { total_cost_usd: 0.3 });
  assert.equal(one(noEstimate, "d").ok, true, "an entry without estimated_cost_usd is read as it being null, not malformed");
  const by = Object.fromEntries(counter(w).map((r) => [r.mode, [r.cost_micro_usd, r.cost_unstated]]));
  assert.deepEqual(by, { a: [100000, 0], b: [200000, 0], c: [0, 1], d: [300000, 0] });
});

test("R1 the local day is the group's (civil-time.localDay in its zone): 03:00Z in Los Angeles is the day before", async () => {
  const w = await standard({ zone: "America/Los_Angeles" });
  w.count("member:ann", "ann", "ask", { at: "2026-10-09T03:00:00Z" });
  w.setZone("UTC");
  w.count("member:ann", "ann", "ask", { at: "2026-10-09T03:00:00Z" });
  assert.deepEqual(counter(w).map((r) => r.day), ["2026-10-08", "2026-10-09"]);
});

test("R1 a malformed entry is refused AI_RUN_CONSUME_INVALID with run-rules' row, counting nothing; a well-formed one counts (negative control)", async () => {
  const w = await standard();
  const before = w.snapshot();
  const row = AI_RUNS_CHECKS.AI_RUN_CONSUME_INVALID;
  const bad = [
    { owner: "nobody", member: "ann", use: "ask", mode: "ask", usage: usage(1), calls: 1 },
    { owner: "member:ann", member: null, use: "ask", mode: "ask", usage: usage(1), calls: 1 },
    { owner: "member:ann", member: "ann", use: "chat", mode: "ask", usage: usage(1), calls: 1 },
    { owner: "member:ann", member: "ann", use: "ask", mode: "", usage: usage(1), calls: 1 },
    { owner: "member:ann", member: "ann", use: "ask", mode: "ask", usage: null, calls: 1 },
    { owner: "member:ann", member: "ann", use: "ask", mode: "ask", usage: usage(-1), calls: 1 },
    { owner: "member:ann", member: "ann", use: "ask", mode: "ask", usage: usage(1.5), calls: 1 },
    { owner: "member:ann", member: "ann", use: "ask", mode: "ask", usage: usage(1, 0, -2), calls: 1 },
    { owner: "member:ann", member: "ann", use: "ask", mode: "ask", usage: (({ output_tokens, ...u }) => u)(usage(1)), calls: 1 },
    { owner: "member:ann", member: "ann", use: "ask", mode: "ask", usage: usage(1) },
    { owner: "member:ann", member: "ann", use: "ask", mode: "ask", usage: usage(1), calls: 0 },
    { owner: "member:ann", member: "ann", use: "ask", mode: "ask", usage: usage(1), calls: 1, act: "bad act!" },
  ];
  for (const b of bad) {
    const r = w.u.countUsage({ ...b, at: AT });
    assert.deepEqual([r.ok, r.code, r.check, r.translation], [false, "AI_RUN_CONSUME_INVALID", row.check, row.translation], JSON.stringify(b));
  }
  assert.equal(w.snapshot(), before, "nothing was counted");
  assert.equal(w.u.countUsage({ owner: "member:ann", member: "ann", use: "ask", mode: "ask", usage: usage(1), calls: 1, at: AT }).ok, true);
  assert.notEqual(w.snapshot(), before);
});

test("R1 countAskUsage counts an ask or a draft, its use its mode, to the owner the caller's accountFor answered; without an owner, as not recorded; any other mode refused AI_RUN_CONSUME_INVALID counting nothing", async () => {
  const w = await standard();
  assert.equal(w.u.countAskUsage({ member: "ann", mode: "ask", usage: usage(5), calls: 1, at: AT, owner: "member:ann" }).ok, true);
  assert.equal(w.u.countAskUsage({ member: "bob", mode: "draft", usage: usage(6), calls: null, at: AT, owner: "group" }).ok, true);
  assert.equal(w.u.countAskUsage({ member: "bob", mode: "ask", usage: usage(7), calls: 1, at: AT }).owner, NOT_RECORDED);
  const before = w.snapshot();
  const r = w.u.countAskUsage({ member: "bob", mode: "run", usage: usage(7), calls: 1, at: AT, owner: "group" });
  assert.equal(r.code, "AI_RUN_CONSUME_INVALID");
  assert.equal(w.u.countAskUsage({ member: "bob", mode: "ask", usage: null, calls: 1, at: AT, owner: "group" }).code, "AI_RUN_CONSUME_INVALID");
  assert.equal(w.snapshot(), before);
  assert.deepEqual(counter(w).map((x) => [x.owner, x.member, x.use, x.mode]),
    [["group", "bob", "draft", "draft"], ["member:ann", "ann", "ask", "ask"], [NOT_RECORDED, "bob", "ask", "ask"]]);
});

test("R1 it never reads a price table: a null figure on usage counts as unstated and adds nothing, whatever the model", async () => {
  const w = await standard();
  w.u.countUsage({ owner: "group", member: "ann", use: "ask", mode: "ask", model: "claude-opus", usage: usage(null, 5, null), calls: 1, at: AT });
  const r = w.row(`SELECT * FROM ai_usage`);
  assert.deepEqual([r.input_tokens, r.output_tokens, r.tokens_unstated, r.cost_micro_usd, r.cost_unstated], [0, 5, 1, 0, 1]);
});

test("R1 the counter holds no content, question or address: its columns are the owner, the member, the day, the use, the mode and numbers", async () => {
  const w = await standard();
  const cols = w.rows(`PRAGMA table_info(ai_usage)`).map((c) => c.name);
  assert.deepEqual(cols, ["owner", "member", "day", "use", "mode", "calls", ...USAGE_TOKEN_FIGURES, "cost_micro_usd",
    "tokens_unstated", "cost_unstated"]);
  /* negative control: the counted entry's model, a name, is not kept */
  w.u.countUsage({ owner: "group", member: "ann", use: "ask", mode: "ask", model: "secret-model-name", usage: usage(1), calls: 1, at: AT });
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM ai_usage`)).includes("secret-model-name"), false);
});

test("R1 rows from before T40 are kept with owner not recorded, their use read from their mode, and count toward no limit", async () => {
  const w = await world({ before: (db) => {
    db.exec(`CREATE TABLE ai_usage (member TEXT NOT NULL, day TEXT NOT NULL, mode TEXT NOT NULL, calls INTEGER NOT NULL DEFAULT 0,
      input_tokens INTEGER NOT NULL DEFAULT 0, output_tokens INTEGER NOT NULL DEFAULT 0, cache_read_input_tokens INTEGER NOT NULL DEFAULT 0,
      cache_creation_input_tokens INTEGER NOT NULL DEFAULT 0, cost_micro_usd INTEGER NOT NULL DEFAULT 0,
      tokens_unstated INTEGER NOT NULL DEFAULT 0, cost_unstated INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (member, day, mode))`);
    db.exec(`INSERT INTO ai_usage (member, day, mode, calls, input_tokens) VALUES ('ann', '2026-10-09', 'ask', 4, 900),
             ('ann', '2026-10-09', 'investigate', 2, 800), ('ann', '2026-10-09', 'draft', 1, 50)`);
  } });
  await w.group("ann");
  assert.deepEqual(counter(w).map((r) => [r.owner, r.member, r.use, r.mode, r.calls, r.input_tokens]),
    [[NOT_RECORDED, "ann", "ask", "ask", 4, 900], [NOT_RECORDED, "ann", "draft", "draft", 1, 50], [NOT_RECORDED, "ann", "run", "investigate", 2, 800]]);
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  assert.equal(w.u.aiLimitSet({ owner: "member:ann", scope: "overall", unit: "tokens", period: "day", amount: 100, by: "ann" }).ok, true);
  assert.equal(w.u.useCheck({ owner: "member:ann", member: "ann", use: "ask", at: AT }), null, "1,750 tokens not recorded count toward no limit");
  /* negative control: the same figure counted to her account reaches it */
  w.count("member:ann", "ann", "ask", { input: 100 });
  assert.equal(w.u.useCheck({ owner: "member:ann", member: "ann", use: "ask", at: AT }).code, "AI_LIMIT_REACHED");
});

test("R1 with an act, its sums are also measured per act (for R10, R11); without one, no act is measured", async () => {
  const w = await standard();
  w.count("member:ann", "ann", "run", { act: "RUN-1", input: 10, cost: 0.01 });
  w.count("member:ann", "ann", "run", { act: "RUN-1", input: 5, cost: 0.02 });
  w.count("member:ann", "ann", "run", { input: 5 });
  const acts = w.rows(`SELECT act, tokens, calls, cost_micro_usd FROM ai_use_acts`);
  assert.deepEqual(acts, [{ act: "RUN-1", tokens: 15, calls: 2, cost_micro_usd: 30000 }]);
});

test("R7 the tables (ai_usage, ai_limits and their history, with the act measure, the reached limits, the asks and the migrations) are declared through record-core.declareTable: export admin-only, sight group, purged with the whole store", async () => {
  const w = await standard();
  const mine = w.rc.declaredTables().filter((d) => d.module === "ai-use");
  assert.deepEqual(mine.map((d) => d.name).sort(), ["ai_explore_asks", "ai_limit_history", "ai_limit_reached", "ai_limits",
    "ai_usage", "ai_use_acts", "ai_use_migrations"]);
  for (const d of mine) assert.deepEqual([d.export, d.sight, d.purge, d.expunge], ["admin-only", "group", "clear", "none"], d.name);
  assert.deepEqual(AI_USE_TABLES.map((t) => t.name).sort(), mine.map((d) => d.name).sort());
  w.count("member:ann", "ann", "ask");
  w.u.aiLimitSet({ owner: "member:ann", scope: "ask", unit: "calls", period: "day", amount: 5, by: "ann" });
  w.rc.purge();
  for (const t of ["ai_usage", "ai_limits", "ai_limit_history"]) assert.equal(w.rows(`SELECT * FROM ${t}`).length, 0, t);
});

test("R7 a project's limits are deleted with its project, and nothing else is: another account's limits and the counter stay", async () => {
  const w = await standard();
  w.u.aiLimitSet({ owner: "project:P", scope: "overall", unit: "calls", period: "day", amount: 5, by: "ann" });
  w.u.aiLimitSet({ owner: "member:ann", scope: "overall", unit: "calls", period: "day", amount: 5, by: "ann" });
  w.count("project:P", "bob", "run");
  w.rc.purge({ bundleId: "P" });
  assert.deepEqual(w.rows(`SELECT owner FROM ai_limits`).map((r) => r.owner), ["member:ann"]);
  assert.equal(w.rows(`SELECT * FROM ai_limit_history WHERE owner='project:P'`).length, 0);
  assert.equal(w.rows(`SELECT * FROM ai_usage WHERE owner='project:P'`).length, 1, "use counted stays, purged only with the whole store");
});

test("R8 each code this module mints has its row in its own checks.mjs, family C-143 (K2480), numbered once, never a retired run-rules number; its translation the words.json sentence R13 names", () => {
  const rows = Object.entries(AI_USE_CHECKS);
  assert.deepEqual(rows.map(([c, r]) => [c, r.check]), [["AI_LIMIT_REACHED", "C-143.1"], ["AI_LIMIT_INVALID", "C-143.2"],
    ["LIMIT_UNIT_UNAVAILABLE", "C-143.3"], ["EXPLORE_NOT_ENABLED", "C-143.4"], ["EXPLORE_OUT_OF_SCOPE", "C-143.5"],
    ["EXPLORE_ASK_INVALID", "C-143.6"]]);
  for (const [, r] of rows) assert.match(r.where, /^src\/ai-use\/index\.mjs \S+ > is-[a-z-]+$/);
  const retired = ["C-109.8", "C-109.9", "C-109.12"];
  for (const [, r] of rows) assert.ok(!retired.includes(r.check));
  assert.equal(AI_USE_CHECKS.AI_LIMIT_REACHED.translation, WORDS["ai.refused.limit"]);
  assert.equal(AI_USE_CHECKS.AI_LIMIT_INVALID.translation, WORDS["ai.refused.limitinvalid"]);
  assert.equal(AI_USE_CHECKS.LIMIT_UNIT_UNAVAILABLE.translation, WORDS["ai.refused.unitunavailable"]);
  assert.equal(AI_USE_CHECKS.EXPLORE_NOT_ENABLED.translation, WORDS["ai.refused.explorenotenabled"]);
  /* negative control: the retired codes are not this module's */
  for (const c of ["AI_USE_CEILING_REACHED", "AI_USE_COPY_CEILING_REACHED", "AI_CEILING_INVALID"]) assert.equal(AI_USE_CHECKS[c], undefined);
  assert.ok(Object.keys(AI_USE_WORDS).length >= 10);
});

test("R8 AI_LIMIT_REACHED carries whose (group, project or own), scope and period; each refusal carries its row's check", async () => {
  const w = await standard();
  for (const [owner, member, whose] of [["group", "bob", "group"], ["project:P", "bob", "project"], ["member:ann", "ann", "own"]]) {
    const by = owner === "group" ? "admin" : "ann";
    w.u.aiLimitSet({ owner, scope: "overall", unit: "calls", period: "month", amount: 1, by });
    w.count(owner, member, "ask");
    const r = w.u.useCheck({ owner, member, use: "ask", at: AT });
    assert.deepEqual([r.code, r.check, r.whose, r.scope, r.period], ["AI_LIMIT_REACHED", "C-143.1", whose, "overall", "month"], owner);
  }
});
