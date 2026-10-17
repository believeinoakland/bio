/* ai-use T50 (T50-69): R15, each conversation's effort recorded beside its model (N1168; K3501 (f)): the effort a count takes
   and refuses, the models and efforts an act keeps, and what actualOf answers of them, at the interface, each with a
   negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { standard, usage } from "./fixture.mjs";

const AT = "2026-10-09T12:00:00Z";
const counter = (w) => w.rows(`SELECT * FROM ai_usage ORDER BY owner, member, day, use, mode`);

test("R15 two conversations under one act answer two by_model entries, first seen first, their calls summed per model and effort (claude-sonnet-5-5 low twice, claude-opus-5-5 medium once: 2 and 1 calls); the act's calls are their sum", async () => {
  const w = await standard();
  const conv = (model, effort) => w.u.countUsage({ owner: "member:ann", member: "ann", use: "run", mode: "run", model, effort,
    usage: usage(10, 2), calls: 1, at: AT, act: "RUN-R15" });
  for (const r of [conv("claude-sonnet-5-5", "low"), conv("claude-opus-5-5", "medium"), conv("claude-sonnet-5-5", "low")]) assert.equal(r.ok, true);
  const a = w.u.actualOf({ run: "RUN-R15", viewer: "ann" });
  assert.equal(a.found, true);
  assert.deepEqual(a.by_model, [
    { model: "claude-sonnet-5-5", effort: "low", calls: 2 },
    { model: "claude-opus-5-5", effort: "medium", calls: 1 },
  ]);
  assert.equal(a.by_model.reduce((s, m) => s + m.calls, 0), a.calls, "their calls sum to the act's calls");
  /* negative control: the same act read by a viewer who is not one of its owners answers as R11 answers, with no by_model */
  assert.deepEqual(w.u.actualOf({ run: "RUN-R15", viewer: "bob" }), { ok: true, found: false });
});

test("R15 the counter ai_usage keeps no model or effort key: the models of a conversation are kept beside its act only", async () => {
  const w = await standard();
  w.u.countUsage({ owner: "member:ann", member: "ann", use: "run", mode: "run", model: "claude-opus-5-5", effort: "high",
    usage: usage(1), calls: 1, at: AT, act: "RUN-K" });
  const cols = w.rows(`PRAGMA table_info(ai_usage)`).map((c) => c.name);
  assert.equal(cols.includes("model") || cols.includes("effort"), false);
  assert.equal(JSON.stringify(counter(w)).includes("claude-opus-5-5"), false);
  assert.equal(JSON.stringify(counter(w)).includes("high"), false);
});

test("R15 an effort is a lowercase word of at most 16 letters, or null where none was stated: any other value is refused AI_RUN_CONSUME_INVALID counting nothing, on countUsage and countAskUsage alike (negative control: 'Low!', 'MEDIUM', a seventeen-letter word, a number)", async () => {
  const w = await standard();
  const before = w.snapshot();
  for (const effort of ["Low!", "MEDIUM", "abcdefghijklmnopq", "", " low", 3, true]) {
    const r = w.u.countUsage({ owner: "member:ann", member: "ann", use: "run", mode: "run", model: "m", effort, usage: usage(1),
      calls: 1, at: AT, act: "RUN-BAD" });
    assert.deepEqual([r.ok, r.code], [false, "AI_RUN_CONSUME_INVALID"], JSON.stringify(effort));
    const ask = w.u.countAskUsage({ member: "ann", mode: "ask", model: "m", effort, usage: usage(1), calls: 1, at: AT, owner: "member:ann" });
    assert.deepEqual([ask.ok, ask.code], [false, "AI_RUN_CONSUME_INVALID"], JSON.stringify(effort));
  }
  assert.equal(w.snapshot(), before, "nothing was counted, measured or recorded");
  /* the boundary: sixteen letters pass, and a stated effort counts */
  assert.equal(w.u.countUsage({ owner: "member:ann", member: "ann", use: "run", mode: "run", model: "m", effort: "abcdefghijklmnop",
    usage: usage(1), calls: 1, at: AT, act: "RUN-OK" }).ok, true);
});

test("R15 an entry stating neither model nor effort is kept as {model: null, effort: null}, never a guessed one; a stated effort without a model is kept with model null", async () => {
  const w = await standard();
  w.u.countUsage({ owner: "member:ann", member: "ann", use: "run", mode: "run", usage: usage(1), calls: 1, at: AT, act: "RUN-N" });
  w.u.countUsage({ owner: "member:ann", member: "ann", use: "run", mode: "run", model: "claude-haiku-5-5", usage: usage(1), calls: 1,
    at: AT, act: "RUN-N" });
  w.u.countUsage({ owner: "member:ann", member: "ann", use: "run", mode: "run", effort: "low", usage: usage(1), calls: 2, at: AT,
    act: "RUN-N" });
  assert.deepEqual(w.u.actualOf({ run: "RUN-N", viewer: "ann" }).by_model, [
    { model: null, effort: null, calls: 1 },
    { model: "claude-haiku-5-5", effort: null, calls: 1 },
    { model: null, effort: "low", calls: 2 },
  ]);
  /* negative control: a model's name and an effort's word are each kept as stated, never swapped */
  assert.notDeepEqual(w.u.actualOf({ run: "RUN-N", viewer: "ann" }).by_model[1], { model: null, effort: "claude-haiku-5-5", calls: 1 });
});

test("R15 a count without an act keeps no model or effort measure: the act table holds only acts' own rows (negative control)", async () => {
  const w = await standard();
  w.u.countUsage({ owner: "member:ann", member: "ann", use: "ask", mode: "ask", model: "claude-opus-5-5", effort: "medium",
    usage: usage(1), calls: 1, at: AT });
  assert.deepEqual(w.rows(`SELECT * FROM ai_use_act_models`), []);
});
