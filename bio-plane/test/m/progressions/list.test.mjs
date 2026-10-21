/* R48 (T51; K4259): the progression definitions listed, so a screen offers the flows a group has declared instead of asking
   for a typed id. Driven through the ops map as the door calls it, over the module's real fixture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MEMBER } from "./fixture.mjs";
import { progressionOps } from "../../../src/progressions/index.mjs";

const run = (w, query = "", body = null, op = "progressions") =>
  progressionOps(w.p, new URL(`http://x/?viewer=${encodeURIComponent(MEMBER)}${query ? `&${query}` : ""}`), body)[op]();

/* three flows declared out of key order, the middle one revised once */
function declared() {
  const w = world();
  w.define("meeting");
  w.define("procurement");
  w.define("budget");
  assert.equal(w.define("procurement", { award: { within: "60 days" } }, { basis: "the award now takes longer", citation: "memo 4" }).version, 2);
  return w;
}

test("R48: op=progressions lists every definition in key order, each with its key, label, current version and the current version's stages in order", () => {
  const w = declared();
  const r = run(w);
  assert.equal(r.ok, true);
  assert.deepEqual(r.items.map((i) => i.progression_key), ["budget", "meeting", "procurement"]);
  assert.deepEqual([r.count, r.truncated, r.limit], [3, false, 50]);
  assert.equal(r.next, undefined);
  const proc = r.items.find((i) => i.progression_key === "procurement");
  assert.deepEqual([proc.label, proc.current_version, proc.stage_count], ["Procurement", 2, 3]);
  assert.deepEqual(proc.stages.map((s) => s.stage_key), ["need", "award", "contract"]);
  assert.deepEqual(Object.keys(proc.stages[1]).sort(),
    ["after_stage", "cardinality", "label", "required", "stage_key", "stage_no", "within_interval"]);
  assert.deepEqual([proc.stages[1].stage_no, proc.stages[1].after_stage, proc.stages[1].within_interval, proc.stages[1].required],
                   [2, "need", "60 days", "always"]);
  assert.equal(r.items.find((i) => i.progression_key === "meeting").current_version, 1);
});

test("R48 control: each listed item says what op=progression says for its key at the current version, and that read is unchanged", () => {
  const w = declared();
  const before = w.snapshot();
  for (const item of run(w).items) {
    const one = run(w, `key=${item.progression_key}`, null, "progression");
    assert.equal(one.found, true);
    assert.deepEqual([item.label, item.current_version], [one.label, one.current_version]);
    assert.deepEqual(item.stages, one.stages);
  }
  // reading the earlier version of the revised flow still answers version 1's stages, not the list's
  const v1 = run(w, "key=procurement&version=1", null, "progression");
  assert.equal(v1.stages[1].within_interval, "30 days");
  assert.equal(run(w, "key=nothing", null, "progression").found, false);
  assert.deepEqual(w.snapshot(), before);
});

test("R48: limit pages the list by reading one past, with a cursor that continues it; the limit is held to 1-200", () => {
  const w = declared();
  const first = run(w, "limit=2");
  assert.deepEqual([first.count, first.truncated, first.limit], [2, true, 2]);
  assert.deepEqual(first.items.map((i) => i.progression_key), ["budget", "meeting"]);
  assert.equal(typeof first.next, "string");
  const rest = run(w, `limit=2&after=${encodeURIComponent(first.next)}`);
  assert.deepEqual(rest.items.map((i) => i.progression_key), ["procurement"]);
  assert.deepEqual([rest.truncated, rest.next], [false, undefined]);
  // the page is exactly full: nothing past it, so not truncated
  assert.deepEqual([run(w, "limit=3").count, run(w, "limit=3").truncated], [3, false]);
  assert.equal(run(w, "limit=9999").limit, 200);
  assert.equal(run(w, "limit=0").limit, 1);
  assert.equal(run(w, "limit=nonsense").limit, 50);
});

test("R48 control: a store with no definition answers an empty list, no error; the body carries limit and after as the query does; nothing is written", () => {
  const w = world();
  const before = w.snapshot();
  const none = run(w);
  assert.deepEqual([none.ok, none.count, none.items, none.truncated], [true, 0, [], false]);
  assert.deepEqual(w.snapshot(), before);
  const d = declared();
  assert.deepEqual(run(d, "limit=2&after=budget"), run(d, "", { limit: 2, after: "budget" }));
  assert.deepEqual(run(d, "limit=2&after=budget").items.map((i) => i.progression_key), ["meeting", "procurement"]);
  // a cursor past the last key leaves nothing
  assert.deepEqual(run(d, "after=zzz").items, []);
  // no stamp, bundle or basis of a version is answered: the list names the flow, not who declared it or why
  assert.doesNotMatch(JSON.stringify(run(d)), /declared_by|basis|bundle|alice/);
});
