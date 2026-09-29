/* ai-runs R45 (N293): the ceiling on a run's `state` — the pure check, and its refusal at the open and at the tick. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, OPEN, INQ, PROJ, ORG } from "./world.mjs";
import { checkRunState, AI_RUN_STATE_MAX_BYTES as FROM_RULES, AI_RUN_CHECKS } from "../../../src/airun.mjs";
import { AI_RUN_STATE_MAX_BYTES, AI_RUNS_CHECKS } from "../../../src/ai-runs/index.mjs";

const LIMIT = 262144;
const ROW = AI_RUNS_CHECKS.AI_RUN_STATE_TOO_LARGE;
const bytesOf = (state) => Buffer.byteLength(JSON.stringify(state), "utf8");
/** A state whose JSON is exactly `n` bytes: `{"s":"…"}` is eight bytes around the string. */
const sized = (n) => ({ s: "x".repeat(n - 8) });
/** A state whose JSON is `n` bytes of which most are three-byte characters, so its UTF-16 length is about a third. */
const wide = (n) => { const k = Math.floor((n - 8) / 3); return { s: "€".repeat(k) + "x".repeat(n - 8 - 3 * k) }; };

function tooLarge(r, state) {
  assert.deepEqual([r.code, r.check, r.translation], ["AI_RUN_STATE_TOO_LARGE", "C-22.18", ROW.translation], JSON.stringify(r).slice(0, 200));
  assert.deepEqual([r.bytes, r.limit], [bytesOf(state), LIMIT]);
}

test("R45: AI_RUN_STATE_MAX_BYTES is 262,144; checkRunState measures the UTF-8 length of the state's JSON, passes it at or under the ceiling and refuses it over, naming bytes and limit (C-22.18); an absent or null state is not measured", () => {
  assert.equal(AI_RUN_STATE_MAX_BYTES, LIMIT);
  assert.equal(FROM_RULES, LIMIT);
  assert.equal(AI_RUN_CHECKS.AI_RUN_STATE_TOO_LARGE, ROW);
  for (const s of [null, undefined]) assert.equal(checkRunState(s), null);
  for (const s of [{}, [], 0, "", false, sized(LIMIT), wide(LIMIT), ["x".repeat(LIMIT - 4)], "x".repeat(LIMIT - 2)]) {
    assert.ok(bytesOf(s) <= LIMIT);
    assert.equal(checkRunState(s), null, `${bytesOf(s)} bytes`);
  }
  for (const s of [sized(LIMIT + 1), wide(LIMIT + 1), wide(LIMIT + 3), ["x".repeat(LIMIT - 3)], "x".repeat(LIMIT - 1),
                   { deep: { list: Array.from({ length: 30000 }, (_, i) => `item ${i}`) } }]) {
    assert.ok(bytesOf(s) > LIMIT);
    const r = checkRunState(s);
    assert.equal(r.ok, false);
    tooLarge(r, s);
    assert.match(r.detail, new RegExp(`^the run's state is ${bytesOf(s)} bytes as JSON, over the ${LIMIT}`));
  }
  /* bytes, not characters: under the ceiling in UTF-16 units and over it in UTF-8 */
  const w = wide(LIMIT + 1);
  assert.ok(JSON.stringify(w).length < LIMIT);
  tooLarge(checkRunState(w), w);
});

test("R45: the open refuses a state over the ceiling after R3 over the bounds and before the id is asked, with nothing written; a state at the ceiling opens and is stored whole", async () => {
  const w = world();
  await w.group("ann");
  w.bundle(INQ);
  const heard = [];
  w.runs.onRunOpened("scheduler", (e) => heard.push(e.run));
  const before = w.dump();
  const big = wide(LIMIT + 1);
  const r = await w.runs.open(OPEN({ state: big, bounds: [{ bound: "fetches", allowed: 2 }] }));
  assert.equal(r.started, false);
  tooLarge(r, big);
  assert.equal(typeof r.note, "string");
  /* R3 over the bounds is asked first; R8 before both */
  assert.equal((await w.runs.open(OPEN({ state: big, bounds: [{ bound: "fetches", allowed: -1 }] }))).code, "AI_RUN_CONSUME_INVALID");
  assert.equal((await w.runs.open(OPEN({ state: big, skillVersion: "3" }))).code, "AI_RUN_SKILL_VERSION_UNNAMED");
  assert.equal(w.dump(), before, "no run, no bound, no log row");
  assert.deepEqual(heard, [], "no listener heard a refused open");
  /* at the ceiling: opened, stored whole */
  const edge = sized(LIMIT);
  assert.equal((await w.runs.open(OPEN({ state: edge }))).started, true);
  assert.equal(Buffer.byteLength(w.row(`SELECT state FROM ai_runs WHERE run = 'R1'`).state, "utf8"), LIMIT);
  /* before the id is asked: a held id with a state over the ceiling is the state's refusal, and so is a re-run of itself */
  tooLarge(await w.runs.open(OPEN({ state: big })), big);
  tooLarge(await w.runs.open(OPEN({ run: "R2", state: big, rerunOf: "R2" })), big);
  assert.equal(w.count("ai_runs"), 1);
});

test("R45: the tick refuses a state over the ceiling after R3 over consume, writing nothing — no entry, no figure, no lease, no tick; an absent or null state is not measured and the held state stands; a state at the ceiling replaces it", async () => {
  const w = world();
  await w.group("ann", "bob", "dan");
  w.bundle(INQ);
  w.project(PROJ, "ann", { joined: ["bob"] });
  await w.runs.open(OPEN({ state: { todo: [1] }, bounds: [{ bound: "fetches", allowed: 5 }] }));
  await w.runs.open(OPEN({ run: "RP", contextType: "project", contextId: PROJ, actor: "bob", viewer: "member:bob", principalPlane: "member:bob" }));
  const look = { level: "document", subject: "https://example.org/a", state: "LOOKED_ABSENT", detail: "none there" };
  const tick = (o = {}) => w.runs.tick({ run: "R1", viewer: "admin", caller: ORG, at: "2026-07-01T00:05:00Z", ...o });
  const big = wide(LIMIT + 1);
  const before = w.dump();
  const r = await tick({ state: big, log: [look], consume: { fetches: 1 }, leaseMs: 60000 });
  assert.deepEqual([r.ticked, r.found, r.status], [false, true, "running"]);
  tooLarge(r, big);
  assert.equal(typeof r.detail, "string");
  assert.equal(w.dump(), before, "nothing appended, spent, extended or counted");
  /* the order: sight, R5, R6 and R3 over consume are asked first */
  assert.equal((await w.runs.tick({ run: "RP", viewer: "member:dan", caller: "member:dan", state: big })).found, false);
  assert.equal((await tick({ caller: "class:ai/other", state: big })).code, "AI_RUN_NOT_PRINCIPAL");
  w.membership.projectLeave({ projectId: PROJ, by: "bob", comment: "done" });
  assert.equal((await w.runs.tick({ run: "RP", actor: "bob", viewer: "member:bob", caller: "member:bob", state: big })).code,
    "AI_RUN_NOT_PROJECT_MEMBER");
  assert.equal((await tick({ state: big, consume: { fetches: -1 } })).code, "AI_RUN_CONSUME_INVALID");
  assert.equal(w.dump(), before);
  /* absent or null: not measured, the held state stands; at the ceiling: replaced */
  for (const state of [undefined, null]) {
    const t = await tick({ state, log: [look] });
    assert.equal(t.ticked, true);
    assert.equal(w.row(`SELECT state FROM ai_runs WHERE run = 'R1'`).state, '{"todo":[1]}');
  }
  const edge = wide(LIMIT);
  assert.equal((await tick({ state: edge })).ticked, true);
  assert.deepEqual(JSON.parse(w.row(`SELECT state FROM ai_runs WHERE run = 'R1'`).state), edge);
  assert.deepEqual((await w.runs.read({ run: "R1", viewer: "admin" })).session.state, edge, "the run reads its state back whole");
  /* an ended run's tick stays its stated no-op, whatever the state */
  await w.runs.close({ run: "R1", bound: "completed", viewer: "admin", caller: ORG });
  const ended = await tick({ state: big });
  assert.deepEqual([ended.ticked, ended.found, ended.status, ended.bound, ended.code], [false, true, "finished", "completed", undefined]);
});
