/* ai-runs R48–R53 (T33-50; Q0-6; K1450, K1481, K1502, K1503; T34-33: N588, K1621, K1755): the use of every model call
   counted per member, local day and mode, one entry per conversation carrying its calls; each member's own daily ceiling
   and the administrator's lower one for the copy; the two reads of use; the account a run carries (the member's own or
   the group's API key, the act still the member's); and the tables declared explicitly. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, OPEN, INQ, PROJ, ANN, ORG, T0, USAGE, sha, agentWorker } from "./world.mjs";
import { AI_CEILING_DEFAULT, USAGE_FIGURES } from "../../../src/ai-runs/index.mjs";
import { AI_RUNS_CHECKS } from "../../../src/run-rules/index.mjs";

const at = (s) => `2026-07-01T${s}Z`;
const ROWS = AI_RUNS_CHECKS;
const usageRows = (w) => w.rows(`SELECT * FROM ai_usage ORDER BY member, day, mode`);
/** One conversation's entry, `{mode, model, usage, calls}` (agent-worker R26, agent-model R6). */
const call = (mode = "check", over = {}, calls = 1) => ({ mode, model: "claude-model-x", usage: USAGE(over), calls });
/** A refusal carrying its row (R35: read by key from `run-rules`' table, its R20). */
function refused(r, code) {
  assert.equal(r.code, code, JSON.stringify(r).slice(0, 300));
  assert.equal(r.check, ROWS[code].check, code);
  assert.equal(r.translation, ROWS[code].translation, code);
}
/** K1450: a member is never told a cost; a refusal in plain words names none. */
const COST = /\$|usd|cost|dollar|price/i;

async function useWorld(opts = {}) {
  const w = world(opts);
  await w.group("ann", "bob", "dan", { noAccount: ["dan"] });
  w.bundle(INQ);
  w.project(PROJ, "ann", { joined: ["bob", "dan"] });
  return w;
}

test("R48: tick takes usage, one entry per conversation {mode, model, usage, calls}; each is added to the counter of the member whose act the run serves, its figures to the sums and its calls to the count (a null calls counting as one, never none), inside the tick's transaction; nothing of it reaches the run's log, an observation or a bundle", async () => {
  const w = await useWorld();
  await w.runs.open(OPEN());
  const logBefore = w.rows(`SELECT * FROM observation_log`);
  const bundlesBefore = w.rows(`SELECT * FROM bundles ORDER BY bundle_id`);
  const t = await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: at("00:05:00"),
    usage: [call("check", {}, 4), call("check", { input_tokens: 10, output_tokens: 5, total_cost_usd: 0.5 }, 1),
            call("check", { total_cost_usd: null }, null)] });
  assert.deepEqual([t.ticked, t.counted, t.appended], [true, 3, 0]);
  /* three conversations: 4 calls, 1 call, and one whose runner stated none, counted as one */
  assert.deepEqual(usageRows(w), [{ member: "ann", day: "2026-07-01", mode: "check", calls: 6, input_tokens: 2010, output_tokens: 405,
    cache_read_input_tokens: 0, cache_creation_input_tokens: 0, cost_micro_usd: 512000, tokens_unstated: 0, cost_unstated: 1 }]);
  assert.deepEqual(w.rows(`SELECT * FROM observation_log`), logBefore, "no entry for the calls");
  assert.deepEqual(w.rows(`SELECT * FROM bundles ORDER BY bundle_id`), bundlesBefore);
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM ai_runs`)).includes("claude-model-x"), false, "nothing of a call on the run");
  /* the counter joins the tick's transaction: a tick inside a caller's refused transaction counts nothing */
  const before = w.dump() + JSON.stringify(usageRows(w));
  const out = w.record.transact(() => { w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: at("00:06:00"), usage: [call()] });
    return { ok: false, reason: "CALLER_REFUSED" }; });
  assert.equal(out.reason, "CALLER_REFUSED");
  assert.equal(w.dump() + JSON.stringify(usageRows(w)), before);
  /* a member-kind credential's run is counted against that member; a session's against the session member */
  await w.runs.open(OPEN({ run: "RB", principalPlane: "member:bob/t1", principalClaude: ANN }));
  await w.runs.tick({ run: "RB", viewer: "admin", caller: "member:bob/t1", at: at("00:07:00"), usage: [call("check")] });
  assert.equal(w.row(`SELECT calls FROM ai_usage WHERE member='bob'`).calls, 1);
  /* no usage, or an empty list: nothing counted and no `counted` key */
  const plain = await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: at("00:08:00"), usage: [] });
  assert.equal("counted" in plain, false);
});

test("R48: a usage entry not of that shape refuses the whole tick as R3 refuses a malformed consumption (AI_RUN_CONSUME_INVALID), writing nothing; a null figure is accepted and counted as unstated, never as 0", async () => {
  const w = await useWorld();
  await w.runs.open(OPEN({ bounds: [{ bound: "fetches", allowed: 9 }] }));
  const look = { level: "document", subject: "https://example.org/a", state: "LOOKED_ABSENT", detail: "none" };
  const before = w.dump() + JSON.stringify(usageRows(w));
  const { input_tokens: _drop, ...missing } = USAGE();
  for (const usage of [{}, "x", [null], [1], [{ model: "m", usage: USAGE(), calls: 1 }], [{ mode: "", model: "m", usage: USAGE(), calls: 1 }],
                       [{ mode: "check", model: 7, usage: USAGE(), calls: 1 }], [{ mode: "check", model: "m", calls: 1 }],
                       [{ mode: "check", model: "m", usage: [], calls: 1 }],
                       /* N588: `calls` absent, or neither null nor a positive whole number */
                       [{ mode: "check", model: "m", usage: USAGE() }], [call("check", {}, 0)], [call("check", {}, -1)], [call("check", {}, 1.5)],
                       [call("check", {}, "2")], [call("check", {}, Number.NaN)], [call("check", {}, Infinity)], [call("check", {}, 2 ** 53)],
                       [{ ...call(), calls: undefined }], [call("check", {}, true)], [call("check"), call("check", {}, [3])],
                       [{ mode: "check", model: "m", usage: missing, calls: 1 }], [call("check", { input_tokens: -1 })], [call("check", { output_tokens: 1.5 })],
                       [call("check", { cache_read_input_tokens: "5" })], [call("check", { total_cost_usd: -0.1 })],
                       [call("check", { total_cost_usd: Number.NaN })], [call("check"), call("check", { cache_creation_input_tokens: Infinity })]]) {
    const r = await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: at("00:05:00"), usage, log: [look], consume: { fetches: 1 } });
    assert.deepEqual([r.ticked, r.found], [false, true], JSON.stringify(usage));
    refused(r, "AI_RUN_CONSUME_INVALID");
    assert.equal(typeof r.detail, "string");
  }
  assert.equal(w.dump() + JSON.stringify(usageRows(w)), before, "no entry, figure, lease, tick or count");
  /* every figure stated or null: accepted; nulls are counted as unstated */
  const nulls = Object.fromEntries(USAGE_FIGURES.map((f) => [f, null]));
  assert.equal((await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: at("00:05:00"),
    usage: [{ mode: "check", model: null, usage: nulls, calls: null }] })).counted, 1);
  assert.deepEqual(w.row(`SELECT calls, input_tokens, cost_micro_usd, tokens_unstated, cost_unstated FROM ai_usage`),
    { calls: 1, input_tokens: 0, cost_micro_usd: 0, tokens_unstated: 1, cost_unstated: 1 });
  /* the order: the run's own refusals come first (an absent run is absent; a stranger is not its principal) */
  assert.equal((await w.runs.tick({ run: "R404", viewer: "admin", caller: ORG, usage: "x" })).found, false);
  assert.equal((await w.runs.tick({ run: "R1", viewer: "admin", caller: "class:ai/other", usage: "x" })).code, "AI_RUN_NOT_PRINCIPAL");
  /* a run carrying no member account (opened before T33-50) cannot have calls counted: refused by name, nothing written */
  w.sql.exec(`UPDATE ai_runs SET principal_claude = 'instance' WHERE run = 'R1'`);
  const was = w.dump() + JSON.stringify(usageRows(w));
  const legacy = await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: at("00:09:00"), usage: [call()], log: [look] });
  assert.equal(legacy.ticked, false);
  refused(legacy, "AI_NO_ACCOUNT");
  assert.equal(w.dump() + JSON.stringify(usageRows(w)), was);
  assert.equal((await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: at("00:09:00"), log: [look] })).ticked, true,
    "without calls it ticks as before");
});

test("R48, R52: countAskUsage counts an ask's conversation (no run) for its member — a standing question's AI half for its author — its calls read as in a tick's entry (a null counting as one; omitted read as null, J1 (1)), and refuses a malformed entry or no member, writing nothing", () => {
  const w = world();
  const before = JSON.stringify(usageRows(w));
  refused(w.runs.countAskUsage({ member: "member:ann", mode: "ask", usage: { input_tokens: 1 }, at: at("09:00:00") }), "AI_RUN_CONSUME_INVALID");
  refused(w.runs.countAskUsage({ member: "member:ann", mode: "", usage: USAGE(), at: at("09:00:00") }), "AI_RUN_CONSUME_INVALID");
  for (const calls of [0, -2, 1.5, "3", Number.NaN, true, {}])
    refused(w.runs.countAskUsage({ member: "member:ann", mode: "ask", usage: USAGE(), calls, at: at("09:00:00") }), "AI_RUN_CONSUME_INVALID");
  for (const member of [null, "", "class:ai", "token:admin", "member:"])
    refused(w.runs.countAskUsage({ member, mode: "ask", usage: USAGE(), calls: 1 }), "AI_NO_ACCOUNT");
  assert.equal(JSON.stringify(usageRows(w)), before);
  assert.deepEqual(w.runs.countAskUsage({ member: "member:ann", mode: "ask", usage: USAGE(), calls: 3, at: at("09:00:00") }),
    { ok: true, counted: 1, calls: 3, day: "2026-07-01" });
  assert.equal(w.runs.countAskUsage({ member: "ann", mode: "ask", usage: USAGE({ output_tokens: 1 }), calls: null, at: at("10:00:00") }).calls, 1);
  assert.equal(w.runs.countAskUsage({ member: "ann", mode: "ask", usage: USAGE({ output_tokens: 0 }), at: at("11:00:00") }).calls, 1,
    "an omitted calls reads as null: one call");
  assert.deepEqual(w.row(`SELECT member, mode, calls, input_tokens, output_tokens FROM ai_usage`),
    { member: "ann", mode: "ask", calls: 5, input_tokens: 3000, output_tokens: 201 });
  assert.equal(w.count("ai_runs"), 0, "an ask writes no run row");
  assert.equal(w.count("observation_log"), 0, "and no observation");
});

test("R49: ai_usage holds, per member, per local day in the group's time zone and per mode, the sums of the figures and a count of calls; no question, answer, address or content; declared admin-only", async () => {
  const w = await useWorld({ zone: "America/Los_Angeles" });
  /* 03:00Z on 1 July is still 30 June in Los Angeles; 08:00Z is 1 July */
  for (const [member, mode, when] of [["ann", "ask", at("03:00:00")], ["ann", "ask", at("06:59:59")], ["ann", "ask", at("07:00:00")],
                                      ["ann", "draft", at("08:00:00")], ["bob", "ask", at("08:00:00")]])
    w.runs.countAskUsage({ member, mode, usage: USAGE(), at: when });
  assert.deepEqual(w.rows(`SELECT member, day, mode, calls, input_tokens, output_tokens FROM ai_usage ORDER BY member, day, mode`), [
    { member: "ann", day: "2026-06-30", mode: "ask", calls: 2, input_tokens: 2000, output_tokens: 400 },
    { member: "ann", day: "2026-07-01", mode: "ask", calls: 1, input_tokens: 1000, output_tokens: 200 },
    { member: "ann", day: "2026-07-01", mode: "draft", calls: 1, input_tokens: 1000, output_tokens: 200 },
    { member: "bob", day: "2026-07-01", mode: "ask", calls: 1, input_tokens: 1000, output_tokens: 200 }]);
  /* the columns: a member, a day, a mode and numbers — nothing else */
  assert.deepEqual(w.rows(`PRAGMA table_info(ai_usage)`).map((c) => c.name), ["member", "day", "mode", "calls", "input_tokens",
    "output_tokens", "cache_read_input_tokens", "cache_creation_input_tokens", "cost_micro_usd", "tokens_unstated", "cost_unstated"]);
  const d = w.record.declaredTables().find((t) => t.name === "ai_usage");
  assert.deepEqual([d.module, d.export, d.sight], ["ai-runs", "admin-only", "group"]);
  /* without a governing zone the day is UTC's */
  const u = world();
  u.runs.countAskUsage({ member: "ann", mode: "ask", usage: USAGE(), at: at("03:00:00") });
  assert.equal(u.row(`SELECT day FROM ai_usage`).day, "2026-07-01");
});

test("R50: the ceiling — the member's own (aiCeilingSet, by that member's own act only: NOT_YOUR_CEILING otherwise), a provisional default until then, and an administrator's lower copy ceiling (aiCopyCeilingSet, NOT_AN_ADMIN otherwise); in force the lower of the two; a figure not a whole number of one or more AI_CEILING_INVALID; null clears", async () => {
  const w = await useWorld();
  assert.deepEqual(AI_CEILING_DEFAULT, { tokens: 2_000_000, calls: 200 });
  const mine = (id) => w.runs.aiUsageMine({ viewer: `member:${id}`, at: T0 });
  assert.deepEqual([mine("ann").ceiling, mine("ann").own.basis], [{ ...AI_CEILING_DEFAULT }, { tokens: "default", calls: "default" }]);
  const before = w.dump() + JSON.stringify(w.rows(`SELECT * FROM ai_ceilings`));
  for (const by of ["member:bob", "admin", "member:second", "class:ai/tok-org", "token:admin", null, ""])
    refused(w.runs.aiCeilingSet({ member: "member:ann", calls: 5, by }), "NOT_YOUR_CEILING");
  for (const bad of [0, -1, 1.5, "5", Number.NaN, {}, true])
    refused(w.runs.aiCeilingSet({ member: "member:ann", calls: bad, by: "member:ann" }), "AI_CEILING_INVALID");
  refused(w.runs.aiCeilingSet({ member: "member:ann", tokens: 0, by: "member:ann" }), "AI_CEILING_INVALID");
  for (const by of ["member:ann", "class:ai/tok-org", null])
    assert.equal(w.runs.aiCopyCeilingSet({ calls: 5, by }).code, "NOT_AN_ADMIN");
  refused(w.runs.aiCopyCeilingSet({ calls: -2, by: "admin" }), "AI_CEILING_INVALID");
  assert.equal(w.dump() + JSON.stringify(w.rows(`SELECT * FROM ai_ceilings`)), before, "no refusal wrote anything");
  /* a member's own: above or below the default, figure by figure; the other figure keeps the default */
  const set = w.runs.aiCeilingSet({ member: "member:ann", calls: 500, by: "member:ann", at: T0 });
  assert.deepEqual([set.ok, set.own, set.in_force], [true, { tokens: null, calls: 500 }, { tokens: 2_000_000, calls: 500 }]);
  assert.deepEqual(mine("ann").own.basis, { tokens: "default", calls: "own" });
  assert.deepEqual(mine("bob").ceiling, { ...AI_CEILING_DEFAULT }, "one member's ceiling is theirs alone");
  /* the copy's, by an administrator (the founder, or another): the lower of the two is in force */
  assert.deepEqual(w.runs.aiCopyCeilingSet({ calls: 50, by: "admin", at: T0 }).copy, { tokens: null, calls: 50 });
  assert.deepEqual([mine("ann").ceiling, mine("bob").ceiling], [{ tokens: 2_000_000, calls: 50 }, { tokens: 2_000_000, calls: 50 }]);
  assert.equal(w.runs.aiCopyCeilingSet({ tokens: 900, by: "member:second" }).ok, true);
  assert.deepEqual(mine("ann").ceiling, { tokens: 900, calls: 50 }, "an absent figure is left as held");
  w.runs.aiCeilingSet({ member: "ann", calls: 10, by: "member:ann" });
  assert.deepEqual(mine("ann").ceiling, { tokens: 900, calls: 10 }, "a member may hold themself lower still");
  /* null clears: the member's back to the default, the copy's to none */
  w.runs.aiCeilingSet({ member: "member:ann", calls: null, by: "member:ann" });
  w.runs.aiCopyCeilingSet({ tokens: null, calls: null, by: "admin" });
  assert.deepEqual(mine("ann").ceiling, { ...AI_CEILING_DEFAULT });
  assert.equal(w.count("ai_ceilings"), 0);
  /* the ops: `by` is the stamp, never the body's */
  const viaOp = await w.op("aiceilingset", { by: "member:bob" }, { member: "member:ann", calls: 1, by: "member:ann" });
  refused(viaOp, "NOT_YOUR_CEILING");
  assert.equal((await w.op("aiceilingset", { by: "member:ann" }, { member: "member:ann", calls: 3 })).ok, true);
  assert.equal((await w.op("aicopyceilingset", { by: "member:ann" }, { calls: 1, by: "admin" })).code, "NOT_AN_ADMIN");
  const d = w.record.declaredTables().find((t) => t.name === "ai_ceilings");
  assert.deepEqual([d.module, d.export, d.sight], ["ai-runs", "admin-only", "group"]);
});

test("R50: the open, the tick and an ask are refused once the member's use today reaches the ceiling in force — AI_USE_CEILING_REACHED for their own, AI_USE_COPY_CEILING_REACHED for the copy's — in plain words naming no cost, nothing written; the next local day is free again", async () => {
  const w = await useWorld();
  w.runs.aiCeilingSet({ member: "member:ann", calls: 3, by: "member:ann" });
  await w.runs.open(OPEN());
  /* two calls on the tick: under the ceiling */
  assert.equal((await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: at("00:05:00"), usage: [call(), call()] })).ticked, true);
  assert.equal(w.runs.aiUseCheck({ member: "member:ann", at: at("00:06:00") }), null);
  w.runs.countAskUsage({ member: "member:ann", mode: "ask", usage: USAGE(), at: at("00:07:00") });
  /* now at 3 of 3: the ask is refused before any model call */
  const ask = w.runs.aiUseCheck({ member: "member:ann", at: at("00:08:00") });
  refused(ask, "AI_USE_CEILING_REACHED");
  /* the open: refused, nothing written, after the re-run refusals and before R47's check */
  const before = w.dump();
  const o = await w.runs.open(OPEN({ run: "R2", at: at("00:09:00") }));
  assert.equal(o.started, false);
  refused(o, "AI_USE_CEILING_REACHED");
  assert.equal(w.dump(), before);
  assert.equal((await w.runs.open(OPEN({ run: "R2", rerunOf: "R404", at: at("00:09:00") }))).code, "AI_RUN_RERUN_UNKNOWN", "re-run first");
  assert.equal((await w.runs.open(OPEN({ run: "R1", at: at("00:09:00") }))).code, "AI_RUN_ALREADY_OPEN");
  /* the tick: its calls are still counted (they were made), the rest refused — no entry, figure, lease or tick */
  const runBefore = w.row(`SELECT * FROM ai_runs WHERE run='R1'`);
  const t = await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: at("00:10:00"), usage: [call()],
    log: [{ level: "document", subject: "https://example.org/a", state: "LOOKED_ABSENT" }], consume: { fetches: 1 } });
  assert.deepEqual([t.ticked, t.found, t.counted], [false, true, 1]);
  refused(t, "AI_USE_CEILING_REACHED");
  assert.deepEqual(w.row(`SELECT * FROM ai_runs WHERE run='R1'`), runBefore);
  assert.equal(w.rows(`SELECT * FROM observation_log WHERE authority='R1'`).length, 0);
  assert.equal(w.row(`SELECT SUM(calls) n FROM ai_usage WHERE member='ann'`).n, 4);
  /* plain words, no cost, in every refusal */
  for (const r of [ask, o, t]) for (const text of [r.translation, r.detail]) assert.equal(COST.test(text), false, text);
  /* the copy's ceiling: bob, under his own default, over the copy's lower one */
  w.runs.aiCopyCeilingSet({ tokens: 1000, by: "admin" });
  w.runs.countAskUsage({ member: "member:bob", mode: "ask", usage: USAGE({ input_tokens: 999, output_tokens: 1 }), at: at("01:00:00") });
  const copy = await w.runs.open(OPEN({ run: "RB", actor: "bob", viewer: "member:bob", principalPlane: "member:bob", at: at("01:00:00") }));
  refused(copy, "AI_USE_COPY_CEILING_REACHED");
  for (const text of [copy.translation, copy.detail]) assert.equal(COST.test(text), false, text);
  refused(w.runs.aiUseCheck({ member: "bob", at: at("01:00:00") }), "AI_USE_COPY_CEILING_REACHED");
  /* the member's own wins the naming when both are reached */
  w.runs.aiCopyCeilingSet({ calls: 1, by: "admin" });
  refused(w.runs.aiUseCheck({ member: "ann", at: at("01:00:00") }), "AI_USE_CEILING_REACHED");
  /* tomorrow (the group's local day) the ceiling is free again */
  w.runs.aiCopyCeilingSet({ tokens: null, calls: null, by: "admin" });
  assert.equal(w.runs.aiUseCheck({ member: "ann", at: "2026-07-02T00:00:00Z" }), null);
  assert.equal((await w.runs.open(OPEN({ run: "R3", at: "2026-07-02T00:00:00Z" }))).started, true);
});

test("R50: a provider's refusal for a spent limit (429 enforced_spend_limit_reached) is answered in the same plain way, never as an error — providerLimit for a relay, and the wake's own dispatch", async () => {
  const w = world();
  const r = w.runs.providerLimit("rate_limit_error: enforced_spend_limit_reached");
  refused(r, "AI_USE_CEILING_REACHED");
  assert.equal(r.provider_limit, true);
  assert.equal(COST.test(r.detail), false);
  assert.equal(w.runs.providerLimit("overloaded_error"), null);
  assert.equal(w.runs.providerLimit(null), null);
  /* the wake: a dispatch agent-worker refuses with the provider's limit is a plain LIMIT, its entry says so without an error code */
  const TOKEN = "instance-ai-secret-value-7f3c";
  const aw = agentWorker({ status: 429, body: { ok: false, reason: "enforced_spend_limit_reached" } });
  const x = world({ env: { AGENT_WORKER: aw, INSTANCE_AI_TOKEN: TOKEN, STORE: { idFromName: (n) => `id:${n}` }, AI_RUN_DISPATCH_WAIT_MS: "50" } });
  await x.group("ann");
  x.bundle(INQ);
  x.ctx.id = { equals: (v) => v === "id:bio" };
  x.credentials.aiCredentialMint({ who: "admin", tokenId: "tok-org", secretSha: sha(TOKEN), principalKind: "organisation",
    taskScope: "investigative", writes: ["airuntick"], note: "the instance's key" });
  const cred = x.credentials.aiCredentialLook({ secretSha: sha(TOKEN) }).credential;
  await x.runs.open(OPEN({ principalPlane: `${cred.principal}/${cred.tokenId}` }));
  const reqs = [{ request: "q1", state: "captured" }];
  x.runs.registerWaitSource("capture-requests", { tickMs: () => 5000, configured: () => true, holds: () => [],
    woken: () => (reqs[0].woken ? [] : ["R1"]), completions: () => (reqs[0].woken ? [] : [{ request: "q1", state: "captured" }]),
    markWoken: () => { reqs[0].woken = true; } });
  const k = await x.runs.wake(Date.parse(at("00:00:10")));
  assert.deepEqual([k.wakes[0].dispatch.state, k.wakes[0].dispatch.code, k.dispatched], ["LIMIT", "AI_USE_CEILING_REACHED", 0]);
  const last = x.rows(`SELECT detail FROM observation_log WHERE authority='R1' ORDER BY seq`).pop().detail;
  assert.match(last, /^Resumption: not continued now — Your own Claude account has reached the spending limit/);
  assert.equal(/did not complete|REFUSED|429/.test(last), false);
});

test("R51: aiUsage answers an administrator the month's use per mode, summed over every member and naming none (NOT_AN_ADMIN to any other viewer); aiUsageMine answers a member their own day against the ceiling in force, never a cost; neither writes; op=aiusage routes both", async () => {
  const w = await useWorld();
  for (const [m, mode, when, over] of [["ann", "ask", "2026-07-01T05:00:00Z", {}], ["bob", "ask", "2026-07-20T05:00:00Z", { total_cost_usd: null }],
                                       ["ann", "draft", "2026-07-02T05:00:00Z", { input_tokens: null }], ["bob", "ask", "2026-08-01T05:00:00Z", {}]])
    w.runs.countAskUsage({ member: m, mode, usage: USAGE(over), at: when });
  const before = w.dump() + JSON.stringify(usageRows(w));
  const july = w.runs.aiUsage({ viewer: "admin", month: "2026-07" });
  assert.deepEqual(july, { ok: true, month: "2026-07", zone: "UTC", modes: [
    { mode: "ask", calls: 2, input_tokens: 2000, output_tokens: 400, cache_read_input_tokens: 0, cache_creation_input_tokens: 0,
      total_cost_usd: 0.012, tokens_unstated: 0, cost_unstated: 1 },
    { mode: "draft", calls: 1, input_tokens: 0, output_tokens: 200, cache_read_input_tokens: 0, cache_creation_input_tokens: 0,
      total_cost_usd: 0.012, tokens_unstated: 1, cost_unstated: 0 }] });
  assert.equal(/ann|bob/.test(JSON.stringify(july)), false, "naming no member");
  assert.equal(w.runs.aiUsage({ viewer: "member:second", month: "2026-08" }).modes[0].calls, 1, "any administrator");
  assert.deepEqual(w.runs.aiUsage({ viewer: "admin", month: "2026-13" }).modes, [], "a month nothing was counted in answers none");
  assert.equal(w.runs.aiUsage({ viewer: "admin", at: "2026-08-05T00:00:00Z" }).month, "2026-08", "this month by default");
  for (const viewer of ["member:ann", "class:ai/tok-org", null, ""]) {
    const r = w.runs.aiUsage({ viewer, month: "2026-07" });
    assert.deepEqual([r.ok, r.code], [false, "NOT_AN_ADMIN"]);
  }
  /* a member's own day */
  const me = w.runs.aiUsageMine({ viewer: "member:ann", day: "2026-07-01" });
  assert.deepEqual(me, { ok: true, member: "ann", day: "2026-07-01", zone: "UTC", used: { tokens: 1200, calls: 1 },
    ceiling: { ...AI_CEILING_DEFAULT }, own: { ...AI_CEILING_DEFAULT, basis: { tokens: "default", calls: "default" } }, copy: null, reached: null });
  assert.equal(COST.test(JSON.stringify(me)), false, "never a cost");
  assert.equal(w.runs.aiUsageMine({ viewer: "member:ann", at: "2026-07-02T09:00:00Z" }).day, "2026-07-02", "today by default");
  w.runs.aiCeilingSet({ member: "ann", calls: 1, by: "member:ann" });
  assert.equal(w.runs.aiUsageMine({ viewer: "member:ann", day: "2026-07-01" }).reached, "own");
  refused(w.runs.aiUsageMine({ viewer: "class:ai/tok-org" }), "NOT_YOUR_CEILING");
  refused(w.runs.aiUsageMine({ viewer: null }), "NOT_YOUR_CEILING");
  w.runs.aiCeilingSet({ member: "ann", calls: null, by: "member:ann" });
  assert.equal(w.dump() + JSON.stringify(usageRows(w)), before, "neither read writes");
  /* the op: `month` for the administrator's read, else the viewer's own; the viewer is the stamp */
  assert.equal((await w.op("aiusage", { viewer: "admin", month: "2026-07" })).modes.length, 2);
  assert.equal((await w.op("aiusage", { viewer: "member:ann", month: "2026-07" })).code, "NOT_AN_ADMIN");
  assert.equal((await w.op("aiusage", { viewer: "member:bob", day: "2026-07-20" })).used.calls, 1);
});

test("R52: a run carries the account of the member whose act started it — the session member, else the member a member-kind key acts for, else the member a machine credential names — recorded as principal_claude; with no member's act AI_RUN_NOT_A_MEMBER_ACT (run-rules R18, K1606), with none held AI_NO_ACCOUNT, before anything is written", async () => {
  const w = await useWorld();
  const before = w.dump();
  /* a machine credential naming no member, or a level word: no member's act at all (run-rules R18, relayed, K1606) */
  for (const principalClaude of ["instance", "project", "member", "class:ai/x"])
    refused(await w.runs.open(OPEN({ principalClaude })), "AI_RUN_NOT_A_MEMBER_ACT");
  /* a member who holds no account: by session, by their own key, or named by a machine credential */
  refused(await w.runs.open(OPEN({ contextType: "project", contextId: PROJ, actor: "dan", viewer: "member:dan", principalPlane: "member:dan" })), "AI_NO_ACCOUNT");
  refused(await w.runs.open(OPEN({ principalPlane: "member:dan/t1" })), "AI_NO_ACCOUNT");
  const named = await w.runs.open(OPEN({ principalClaude: "member:dan" }));
  assert.equal(named.started, false);
  refused(named, "AI_NO_ACCOUNT");
  assert.equal(COST.test(named.translation + named.detail), false);
  assert.equal(w.dump(), before, "nothing written");
  /* after the earlier refusals: a malformed request is still its own refusal */
  assert.equal((await w.runs.open(OPEN({ principalClaude: "instance", skillVersion: "" }))).code, "AI_RUN_SKILL_VERSION_UNNAMED");
  assert.equal((await w.runs.open(OPEN({ principalClaude: "instance", rerunOf: "R404" }))).code, "AI_RUN_RERUN_UNKNOWN");
  /* the account member, in each case */
  const opened = async (run, o) => { const r = await w.runs.open(OPEN({ run, ...o })); assert.equal(r.started, true, JSON.stringify(r));
    return w.row(`SELECT principal_claude FROM ai_runs WHERE run=?`, run).principal_claude; };
  assert.equal(await opened("S1", { contextType: "project", contextId: PROJ, actor: "bob", viewer: "member:bob", principalPlane: "member:bob",
                                     principalClaude: "member:ann" }), "member:bob", "a session's own account, whatever the body names");
  assert.equal(await opened("K1", { principalPlane: "member:bob/t1", principalClaude: "member:ann" }), "member:bob", "a member key's member");
  assert.equal(await opened("M1", { principalClaude: "member:bob" }), "member:bob", "the member a machine credential names");
  assert.equal((await w.runs.read({ run: "M1", viewer: "admin" })).session.principal.claude, "member:bob");
  /* a standing question's AI half counts within its author's ceiling, and is held back as the author's own asks are */
  w.runs.aiCeilingSet({ member: "bob", calls: 1, by: "member:bob" });
  w.runs.countAskUsage({ member: "member:bob", mode: "ask", usage: USAGE(), at: T0 });
  refused(w.runs.aiUseCheck({ member: "member:bob", at: T0 }), "AI_USE_CEILING_REACHED");
  refused(w.runs.aiUseCheck({ member: "member:dan", at: T0 }), "AI_NO_ACCOUNT");
  refused(w.runs.aiUseCheck({ member: null, at: T0 }), "AI_NO_ACCOUNT");
});

test("R48, R50 (N588): a ceiling on calls is reached by the calls a conversation made, never later — one entry of five calls reaches a five-call ceiling, and a null calls counts as one", async () => {
  const w = await useWorld();
  w.runs.aiCeilingSet({ member: "member:ann", calls: 5, by: "member:ann" });
  await w.runs.open(OPEN());
  assert.equal((await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: at("00:05:00"), usage: [call("check", {}, 4)] })).ticked, true);
  assert.equal(w.runs.aiUseCheck({ member: "member:ann", at: at("00:06:00") }), null, "4 of 5: under");
  assert.equal((await w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: at("00:07:00"), usage: [call("check", {}, null)] })).ticked, true);
  assert.equal(w.runs.aiUsageMine({ viewer: "member:ann", day: "2026-07-01" }).used.calls, 5, "a null counted as one");
  refused(w.runs.aiUseCheck({ member: "member:ann", at: at("00:08:00") }), "AI_USE_CEILING_REACHED");
  refused(await w.runs.open(OPEN({ run: "R2", at: at("00:08:00") })), "AI_USE_CEILING_REACHED");
  /* one conversation of many calls: bob's five-call ceiling is reached by a single entry, not after five conversations */
  w.runs.aiCeilingSet({ member: "member:bob", calls: 5, by: "member:bob" });
  w.runs.countAskUsage({ member: "member:bob", mode: "ask", usage: USAGE(), calls: 5, at: at("00:09:00") });
  refused(w.runs.aiUseCheck({ member: "member:bob", at: at("00:09:00") }), "AI_USE_CEILING_REACHED");
});

test("R52 (K1755): a member with no account of their own is served by the group's API key while it is held and on — the run opens as that member's act (principal_claude their own id), its use counted to their day and held by the ceiling in force for them, the copy's included; the key off or removed, AI_NO_ACCOUNT; credentials' other refusals (the key's notice unread) relayed as given; nothing written on any refusal", async () => {
  const w = await useWorld();
  const C = w.credentials;
  const danOpen = (run, over = {}) => w.runs.open(OPEN({ run, contextType: "project", contextId: PROJ, actor: "dan", viewer: "member:dan",
                                                          principalPlane: "member:dan", ...over }));
  /* no key yet: dan has no assistant */
  const before = w.dump();
  refused(await danOpen("D0"), "AI_NO_ACCOUNT");
  refused(w.runs.aiUseCheck({ member: "member:dan", at: T0 }), "AI_NO_ACCOUNT");
  /* held but off (off when first set): still none */
  assert.equal((await C.groupKeySet({ key: "group-key-secret", by: "admin" })).ok, true);
  refused(await danOpen("D0"), "AI_NO_ACCOUNT");
  refused(w.runs.aiUseCheck({ member: "member:dan", at: T0 }), "AI_NO_ACCOUNT");
  /* on, the notice unread: accountFor refuses GROUP_KEY_NOTICE_DUE (credentials R36), relayed with its row */
  assert.equal(C.groupKeySwitch({ on: true, by: "admin" }).ok, true);
  const due = await danOpen("D0");
  assert.deepEqual([due.started, due.code], [false, "GROUP_KEY_NOTICE_DUE"], JSON.stringify(due).slice(0, 300));
  assert.equal(typeof due.check, "string");
  assert.equal(typeof due.translation, "string");
  assert.equal(w.dump(), before, "nothing written on any refusal");
  /* the notice read: the run opens, and it is dan's act */
  assert.equal(C.groupKeyNoticeSeen({ member: "member:dan", by: "member:dan" }).ok, true);
  assert.equal(w.runs.aiUseCheck({ member: "member:dan", at: T0 }), null);
  const o = await danOpen("D1");
  assert.equal(o.started, true, JSON.stringify(o).slice(0, 300));
  assert.equal(w.row(`SELECT principal_claude FROM ai_runs WHERE run='D1'`).principal_claude, "member:dan");
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM ai_runs`)).includes("group-key-secret"), false, "the key enters no record");
  assert.equal(JSON.stringify(o).includes("group-key-secret"), false);
  /* its use is dan's, on dan's day */
  await w.runs.tick({ run: "D1", viewer: "member:dan", actor: "dan", caller: "member:dan", at: at("00:05:00"), usage: [call("check", {}, 2)] });
  assert.deepEqual(w.rows(`SELECT member, calls FROM ai_usage`), [{ member: "dan", calls: 2 }]);
  /* the copy's ceiling caps the group key's use as it caps every use; dan's own ceiling holds too */
  w.runs.aiCopyCeilingSet({ calls: 2, by: "admin" });
  refused(w.runs.aiUseCheck({ member: "member:dan", at: at("00:06:00") }), "AI_USE_COPY_CEILING_REACHED");
  refused(await danOpen("D2", { at: at("00:06:00") }), "AI_USE_COPY_CEILING_REACHED");
  w.runs.aiCopyCeilingSet({ calls: null, by: "admin" });
  w.runs.aiCeilingSet({ member: "member:dan", calls: 2, by: "member:dan" });
  refused(await danOpen("D2", { at: at("00:06:00") }), "AI_USE_CEILING_REACHED");
  w.runs.aiCeilingSet({ member: "member:dan", calls: null, by: "member:dan" });
  /* a member with their own account is served by it, the group key on or not */
  assert.equal(w.runs.aiUseCheck({ member: "member:ann", at: T0 }), null);
  /* the key switched off: dan has none again */
  assert.equal(C.groupKeySwitch({ on: false, by: "admin" }).ok, true);
  const was = w.dump();
  refused(await danOpen("D3", { at: at("00:07:00") }), "AI_NO_ACCOUNT");
  refused(w.runs.aiUseCheck({ member: "member:dan", at: T0 }), "AI_NO_ACCOUNT");
  assert.equal(w.dump(), was);
});

test("R53: the module's tables are declared explicitly through record-core's declareTable — ai_usage and ai_ceilings admin-only, group sight, purged only with the whole store; ai_runs, ai_run_bounds and inquiry_run_surfacings with a run's sight, as R38 purges them", async () => {
  const w = await useWorld();
  const decl = Object.fromEntries(w.record.declaredTables().filter((t) => t.module === "ai-runs").map((t) => [t.name, t]));
  assert.deepEqual(Object.keys(decl).sort(), ["ai_ceilings", "ai_mode_verifications", "ai_run_bounds", "ai_runs", "ai_usage",
                                               "inquiry_run_surfacings"]);
  for (const t of Object.values(decl))
    assert.deepEqual([t.purge, t.expunge, t.export, t.derive, t.version_chain], ["clear", "none", "admin-only", "stored", false], t.name);
  assert.deepEqual(["ai_usage", "ai_ceilings", "ai_mode_verifications"].map((n) => [decl[n].sight, decl[n].keys]),
                   [["group", []], ["group", []], ["group", []]]);
  assert.deepEqual(["ai_runs", "ai_run_bounds", "inquiry_run_surfacings"].map((n) => decl[n].sight), ["bundle", "bundle", "bundle"]);
  assert.deepEqual([decl.ai_runs.keys, decl.ai_run_bounds.keys, decl.inquiry_run_surfacings.keys], [[], [], undefined]);
  /* a bundle's purge leaves the counter and the ceilings; the whole store's clears them */
  w.runs.countAskUsage({ member: "ann", mode: "ask", usage: USAGE(), at: T0 });
  w.runs.aiCeilingSet({ member: "ann", calls: 9, by: "member:ann" });
  w.purge({ bundleId: INQ });
  assert.deepEqual([w.count("ai_usage"), w.count("ai_ceilings")], [1, 1]);
  w.purge({});
  assert.deepEqual([w.count("ai_usage"), w.count("ai_ceilings")], [0, 0]);
});

/* T35-44 (N686; DEC-152, DEC-153; K1837): a draft (run-rules R21) is no run; it is the act of the member who asked for it. */
test("R48, R52 (T35; N686): countAskUsage counts a draft's conversation with mode draft to the member who asked for it, under mode draft in the counter, so the reads of use answer drafts as a mode of their own; a mode other than ask or draft is refused AI_RUN_CONSUME_INVALID, counting nothing; a draft writes no run row and no observation", async () => {
  const w = await useWorld();
  const before = JSON.stringify(usageRows(w));
  for (const mode of ["check", "plan", "extract", "Draft", "asks", "draft "  + "x"])
    refused(w.runs.countAskUsage({ member: "member:ann", mode, usage: USAGE(), calls: 1, at: at("09:00:00") }), "AI_RUN_CONSUME_INVALID");
  assert.equal(JSON.stringify(usageRows(w)), before, "nothing counted on a refusal");
  /* the draft's use, its member's, under its own mode; an ask beside it under its own */
  assert.deepEqual(w.runs.countAskUsage({ member: "member:ann", mode: "draft", usage: USAGE(), calls: 2, at: at("09:00:00") }),
    { ok: true, counted: 1, calls: 2, day: "2026-07-01" });
  assert.equal(w.runs.countAskUsage({ member: "ann", mode: "draft", usage: USAGE({ output_tokens: 1 }), calls: null, at: at("10:00:00") }).calls, 1,
    "a null calls counts as one, as in a tick's entry");
  w.runs.countAskUsage({ member: "member:ann", mode: "ask", usage: USAGE(), calls: 1, at: at("11:00:00") });
  assert.deepEqual(w.rows(`SELECT member, day, mode, calls, input_tokens, output_tokens FROM ai_usage ORDER BY mode`), [
    { member: "ann", day: "2026-07-01", mode: "ask", calls: 1, input_tokens: 1000, output_tokens: 200 },
    { member: "ann", day: "2026-07-01", mode: "draft", calls: 3, input_tokens: 2000, output_tokens: 201 }]);
  assert.deepEqual([w.count("ai_runs"), w.count("observation_log")], [0, 0], "a draft writes no run row and no observation");
  /* R51: the administrator's month answers drafts apart; the member's own day counts them in her use */
  assert.deepEqual(w.runs.aiUsage({ viewer: "admin", month: "2026-07" }).modes.map((m) => [m.mode, m.calls]), [["ask", 1], ["draft", 3]]);
  assert.deepEqual(w.runs.aiUsageMine({ viewer: "member:ann", day: "2026-07-01" }).used, { tokens: 3401, calls: 4 });
});

test("R52, R50 (T35; N686; DEC-152, DEC-153): a draft is the act of the member who asked for it — before its first model call aiUseCheck holds it back by the ceiling in force for that member, the copy's included, exactly as that member's ask; with no account serving them AI_NO_ACCOUNT, in words naming a draft; served by the group's API key it is still that member's, its use counted to their day; nothing written by the check", async () => {
  const w = await useWorld();
  const check = (member, when) => w.runs.aiUseCheck({ member, mode: "draft", at: when });
  /* no account: dan has none of his own and the group key is not set */
  const none = check("member:dan", T0);
  refused(none, "AI_NO_ACCOUNT");
  assert.match(none.detail, /^A draft needs a Claude account to serve the member whose act started it/);
  refused(check(null, T0), "AI_NO_ACCOUNT");
  refused(check("class:ai/tok-org", T0), "AI_NO_ACCOUNT");
  /* an account serves ann: under her ceiling, the draft may start; the check writes nothing */
  const before = w.dump() + JSON.stringify(usageRows(w));
  assert.equal(check("member:ann", at("00:01:00")), null);
  assert.equal(w.dump() + JSON.stringify(usageRows(w)), before);
  /* her own ceiling: drafts and asks count alike, and hold back a draft and an ask alike */
  w.runs.aiCeilingSet({ member: "member:ann", calls: 2, by: "member:ann" });
  w.runs.countAskUsage({ member: "member:ann", mode: "draft", usage: USAGE(), calls: 1, at: at("00:02:00") });
  assert.equal(check("member:ann", at("00:03:00")), null);
  w.runs.countAskUsage({ member: "member:ann", mode: "ask", usage: USAGE(), calls: 1, at: at("00:04:00") });
  const own = check("member:ann", at("00:05:00"));
  refused(own, "AI_USE_CEILING_REACHED");
  assert.deepEqual(w.runs.aiUseCheck({ member: "member:ann", at: at("00:05:00") }), own, "exactly as her ask is held back");
  for (const text of [own.translation, own.detail]) assert.equal(COST.test(text), false, text);
  /* the copy's ceiling holds a draft too */
  w.runs.aiCeilingSet({ member: "member:ann", calls: null, by: "member:ann" });
  w.runs.aiCopyCeilingSet({ calls: 2, by: "admin" });
  refused(check("member:ann", at("00:06:00")), "AI_USE_COPY_CEILING_REACHED");
  w.runs.aiCopyCeilingSet({ calls: null, by: "admin" });
  assert.equal(check("member:ann", at("00:06:00")), null);
  /* the group's API key serves dan: his draft is his act, counted to his day and held by his ceiling */
  assert.equal((await w.credentials.groupKeySet({ key: "group-key-secret", by: "admin" })).ok, true);
  assert.equal(w.credentials.groupKeySwitch({ on: true, by: "admin" }).ok, true);
  assert.equal(check("member:dan", at("00:07:00")), null);
  w.runs.countAskUsage({ member: "member:dan", mode: "draft", usage: USAGE(), calls: 1, at: at("00:07:30") });
  assert.deepEqual(w.rows(`SELECT member, mode, calls FROM ai_usage WHERE member='dan'`), [{ member: "dan", mode: "draft", calls: 1 }]);
  w.runs.aiCeilingSet({ member: "member:dan", calls: 1, by: "member:dan" });
  refused(check("member:dan", at("00:08:00")), "AI_USE_CEILING_REACHED");
  /* tomorrow, free again */
  assert.equal(check("member:dan", "2026-07-02T00:00:00Z"), null);
});
