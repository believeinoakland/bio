/* intent's published fixtures (fixtures.mjs): each is called here and its real answer checked (K4990). */
import test from "node:test";
import assert from "node:assert/strict";
import { intentWorld, notYoursRefusal, watchSetOf } from "./fixtures.mjs";
import { INTENT_CHECKS } from "../../../src/intent/index.mjs";

test("R6 R7 R15: intentWorld is the real intent over a condition with one gap; its gaps and watchSet are the real answers, which the same calls give again, and a source registers once", async () => {
  const f = await intentWorld();
  assert.equal(f.gaps.ok, true);
  assert.deepEqual(f.gaps.gaps.map((g) => g.basis.entity), ["ENT-2"], "ENT-2 lacks its award");
  assert.equal(f.gaps.truncated, false);
  assert.deepEqual(f.watch.progressions, ["proc"]);
  assert.deepEqual(f.watch.entities, ["ENT-1", "ENT-2"]);
  assert.deepEqual(f.captures, ["ent-1-award", "ent-1-need", "ent-2-need"]);
  assert.deepEqual(f.intent.gaps({ project: f.project, viewer: f.viewer }), f.gaps, "the fixture's intent is the real one: it answers again as it did");
  assert.deepEqual(f.intent.watchSet({ project: f.project }), f.watch);
  assert.equal(f.intent.registerSource("monitoring", () => []).ok, true);
  assert.equal(f.intent.registerSource("monitoring", () => []).reason, "SOURCE_DECLARED");
});

test("R9 R22: notYoursRefusal is the real refusal of a member's aspiration declared by another member, with intent's check C-111.15 and its words, and nothing written", () => {
  const f = notYoursRefusal();
  assert.deepEqual([f.refusal.ok, f.refusal.reason], [false, "NOT_YOURS"]);
  assert.equal(f.refusal.check, INTENT_CHECKS.NOT_YOURS.check);
  assert.ok(f.refusal.translation && f.refusal.detail);
  assert.equal(f.world.count("intent_departures"), 0);
  assert.deepEqual(f.intent.declareAspiration({ scope: "member", owner: "carol", statement: "x", author: "member:bob" }), f.refusal, "the real refusal, again");
});

test("R3 R6 R7 R15: watchSetOf is the real intent whose projects' conditions read exactly the digests named; its watchSet pages by the real cursor, an empty project has no condition, a named project throws, and a source registers once", async () => {
  const d = (c) => c.repeat(64);
  const f = await watchSetOf({ p: [d("c"), d("a"), d("b"), d("a")], q: [d("e")], none: [] }, { throwsFor: ["q"], page: 2 });
  assert.deepEqual(Object.keys(f.projects), ["p", "q", "none"]);
  assert.equal(new Set(Object.values(f.projects)).size, 3, "the record gave each project its own id");
  const whole = f.world.i.watchSet({ project: f.projects.p });
  assert.deepEqual(whole.captures, [d("a"), d("b"), d("c")], "exactly the digests held, once each, in order");
  assert.equal(whole.truncated, false);
  /* paged by two, the cursor followed to its end */
  const p1 = f.intent.watchSet({ project: f.projects.p });
  assert.deepEqual([p1.captures, p1.truncated, p1.cursor], [[d("a"), d("b")], true, d("b")]);
  const p2 = f.intent.watchSet({ project: f.projects.p, after: p1.cursor });
  assert.deepEqual([p2.captures, p2.truncated, p2.cursor], [[d("c")], false, null]);
  assert.deepEqual(f.calls, [{ project: f.projects.p, after: null }, { project: f.projects.p, after: d("b") }]);
  assert.deepEqual(f.intent.watchSet({ project: f.projects.p, limit: 1 }).captures, [d("a")], "a limit named is the caller's");
  /* a project with no digests held has no condition */
  assert.deepEqual(f.intent.watchSet({ project: f.projects.none }).captures, []);
  const progress = f.intent.progress({ project: f.projects.none, viewer: f.viewer });
  assert.deepEqual([progress.ok, progress.condition, progress.computable], [true, null, false]);
  assert.deepEqual(f.intent.gaps({ project: f.projects.none, viewer: f.viewer }).gaps, []);
  /* the real progress and gaps of a project holding digests: one instance, whose grade one stage leaves undetermined */
  const held = f.intent.progress({ project: f.projects.p, viewer: f.viewer });
  assert.deepEqual([held.computable, held.matched, held.undetermined.length, held.satisfied], [true, 1, 1, null]);
  assert.deepEqual(held, f.world.i.progress({ project: f.projects.p, viewer: f.viewer }));
  assert.deepEqual(f.intent.gaps({ project: f.projects.p, viewer: f.viewer }), f.world.i.gaps({ project: f.projects.p, viewer: f.viewer }));
  /* a project named in throwsFor throws, by its name; the others are unaffected */
  assert.throws(() => f.intent.watchSet({ project: f.projects.q }), /intent unreadable/);
  assert.deepEqual(f.world.i.watchSet({ project: f.projects.q }).captures, [d("e")], "the real module reads it: only the fixture's door throws");
  /* a source registers once, through the real registration */
  const reader = () => [];
  assert.equal(f.intent.registerSource("monitoring", reader).ok, true);
  assert.equal(f.intent.registerSource("monitoring", reader).reason, "SOURCE_DECLARED");
  assert.deepEqual(f.sources, [{ kind: "monitoring", reader }]);
});

test("R7: one digest held by two projects is read by both, each by its own condition", async () => {
  const f = await watchSetOf({ one: ["9".repeat(64)], two: ["9".repeat(64), "8".repeat(64)] });
  assert.deepEqual(f.intent.watchSet({ project: f.projects.one }).captures, ["9".repeat(64)]);
  assert.deepEqual(f.intent.watchSet({ project: f.projects.two }).captures, ["8".repeat(64), "9".repeat(64)]);
});
