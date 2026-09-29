/* intent's published bounds (the Bounds paragraph; N181, K239; N209, K338; N236, N277): each read that grows with the
   record answers at most its bound, says so with `truncated`, and at the bound exactly says nothing was cut. R4
   (MEASURE_MAX), R10 and R12 (DEPARTURES_MAX), R12 and R13 (ASPIRATIONS_MAX, CONTACTS_MAX), R16 (SET_ASIDE_MAX). */
import test from "node:test";
import assert from "node:assert/strict";
import { MEASURE_MAX, DEPARTURES_MAX, SET_ASIDE_MAX, ASPIRATIONS_MAX, CONTACTS_MAX } from "../../../src/intent/index.mjs";
import { seeded, V } from "./fixture.mjs";

const declareGroup = (w, n, extra = {}) => Array.from({ length: n }, (_, k) =>
  w.i.declareAspiration({ scope: "group", statement: `Aspiration ${k}`, author: V("alice"), ...extra }).aspiration);

test("R12 R10 aspirationsFor reads at most 1,000 held aspirations in id order, answering limit and truncated; the departures in force at most 1,000 (DEPARTURES_MAX), answering departures_limit and departures_truncated", () => {
  assert.equal(ASPIRATIONS_MAX, 1000);
  assert.equal(DEPARTURES_MAX, 1000);
  const w = seeded();
  const ids = declareGroup(w, 1000);
  let r = w.i.aspirationsFor({ viewer: V("bob") });
  assert.deepEqual([r.aspirations.length, r.limit, r.truncated], [1000, 1000, false], "at the bound, nothing is cut");
  /* a departure from each: 1,000 in force is the bound exactly */
  for (const a of ids) assert.equal(w.i.departFrom({ project: w.P, aspiration: a, reason: "r", author: V("bob") }).ok, true);
  r = w.i.aspirationsFor({ project: w.P, viewer: V("bob") });
  assert.deepEqual([r.departures.length, r.departures_limit, r.departures_truncated], [1000, 1000, false]);
  assert.deepEqual(r.aspirations, [], "every group aspiration departed from");
  /* one more of each */
  const [extra] = declareGroup(w, 1);
  r = w.i.aspirationsFor({ viewer: V("bob") });
  assert.deepEqual([r.aspirations.length, r.truncated], [1000, true], "the 1,001st is cut, and it says so");
  const sorted = [...ids, extra].sort();
  assert.deepEqual(r.aspirations.map((a) => a.id), sorted.slice(0, 1000), "the first 1,000 in id order");
  /* a retired aspiration is not held, so it neither counts toward the bound nor is answered */
  assert.equal(w.i.retireAspiration({ aspiration: sorted[0], taught: "t", author: V("alice") }).ok, true);
  r = w.i.aspirationsFor({ viewer: V("bob") });
  assert.deepEqual([r.aspirations.length, r.truncated, r.aspirations[0].id], [1000, false, sorted[1]]);
  const Q = w.project("Second", "bob");
  for (const a of [extra, ...ids.slice(0, 1)]) w.i.departFrom({ project: Q, aspiration: a, reason: "r", author: V("bob") });
  assert.equal(w.i.departFrom({ project: w.P, aspiration: extra, reason: "r", author: V("bob") }).ok, true);
  r = w.i.aspirationsFor({ project: w.P, viewer: V("bob") });
  assert.deepEqual([r.departures_limit, r.departures_truncated], [1000, true], "1,001 departures in force: cut, and said");
  assert.ok(r.departures.length <= 1000);
});

test("R13 contacts pairs at most the first 1,000 held aspirations in id order and lists at most 1,000 pairs, in the order of their first and then second aspiration's id, answering limit and truncated when either is cut", () => {
  assert.equal(CONTACTS_MAX, 1000);
  const w = seeded();
  w.entity("ENT-1");
  /* 45 aspirations naming ENT-1: 990 pairs, under the bound */
  const first = declareGroup(w, 45, { entities: ["ENT-1"] });
  let r = w.i.contacts({ viewer: V("bob") });
  assert.deepEqual([r.contacts.length, r.limit, r.truncated], [990, 1000, false]);
  /* a 46th: 1,035 pairs, cut at 1,000 in order */
  const all = [...first, ...declareGroup(w, 1, { entities: ["ENT-1"] })].sort();
  r = w.i.contacts({ viewer: V("bob") });
  assert.deepEqual([r.contacts.length, r.truncated], [1000, true]);
  const expected = [];
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) expected.push([all[i], all[j]]);
  assert.deepEqual(r.contacts.map((c) => [c.a, c.b]), expected.slice(0, 1000), "first by the first id, then by the second");
});

test("R13 contacts is truncated when the held aspirations are cut at 1,000, though the pairs are fewer", () => {
  const w = seeded();
  w.entity("ENT-1");
  const ids = declareGroup(w, 1000).sort();
  let r = w.i.contacts({ viewer: V("bob") });
  assert.deepEqual([r.contacts.length, r.truncated], [0, false]);
  /* two past the 1,000th in id order share ENT-1: neither is paired, and the answer says it was cut */
  const late = declareGroup(w, 2, { entities: ["ENT-1"] });
  assert.ok(late.every((id) => id > ids.at(-1)));
  r = w.i.contacts({ viewer: V("bob") });
  assert.deepEqual([r.contacts.length, r.truncated], [0, true]);
});

test("R4 progress measures at most 1,000 matched instances (MEASURE_MAX): at the bound it decides, past it satisfied is null with its reason, and progress and gaps answer limit and truncated", async () => {
  assert.equal(MEASURE_MAX, 1000);
  const w = seeded();
  w.entity("ENT-0");
  w.define();
  const others = Array.from({ length: 1000 }, (_, n) => `ENT-${String(n + 1).padStart(4, "0")}`);
  for (const e of others) { w.entity(e); w.relate(e, "ENT-0", "member_of"); }
  /* 999 related instances and the anchor's own: 1,000 matched, every one meeting */
  await w.thread("ENT-0", { need: "A", award: "A" });
  for (const e of others.slice(0, 999)) await w.thread(e, { need: "A", award: "A" });
  assert.equal(w.i.setCondition({ project: w.P, author: V("bob"), viewer: V("bob"), condition: { progression: "proc", entity: "ENT-0",
    relation: "member_of", required: { grade: "B", stages: ["need", "award"] }, satisfied: { share: 100 } } }).ok, true);
  let p = w.i.progress({ project: w.P, viewer: V("bob") });
  assert.deepEqual([p.matched, p.meeting, p.satisfied, p.limit, p.truncated], [1000, 1000, true, 1000, false]);
  assert.equal(p.satisfied_why, undefined);
  let g = w.i.gaps({ project: w.P, viewer: V("bob") });
  assert.deepEqual([g.gaps.length, g.limit, g.truncated], [0, 1000, false]);
  /* the 1,001st: the measure is cut, so no share is taken */
  await w.thread(others[999], { need: "A" });
  p = w.i.progress({ project: w.P, viewer: V("bob") });
  assert.deepEqual([p.matched, p.limit, p.truncated, p.satisfied], [1000, 1000, true, null]);
  assert.match(p.satisfied_why, /more than 1000 instances/);
  g = w.i.gaps({ project: w.P, viewer: V("bob") });
  assert.deepEqual([g.limit, g.truncated], [1000, true]);
});

test("R16 proposals lists at most 200 set-aside proposals, newest first (SET_ASIDE_MAX), answering set_aside_limit and set_aside_truncated", () => {
  assert.equal(SET_ASIDE_MAX, 200);
  const w = seeded();
  const keys = Array.from({ length: 201 }, (_, n) => `c-${String(n).padStart(3, "0")}`);
  w.i.registerSource("monitoring", () => keys.map((key) => ({ key, kind: "capture-failed", basis: null })));
  for (const k of keys.slice(0, 200))
    assert.equal(w.i.triage({ proposal: `monitoring::${k}`, act: "dismiss", reason: "r", author: V("bob") }).ok, true);
  let r = w.i.proposals({ viewer: V("bob") });
  assert.deepEqual([r.set_aside.length, r.set_aside_limit, r.set_aside_truncated], [200, 200, false], "at the bound, nothing is cut");
  assert.equal(w.i.triage({ proposal: `monitoring::${keys[200]}`, act: "defer", reason: "later", author: V("bob") }).ok, true);
  r = w.i.proposals({ viewer: V("bob") });
  assert.deepEqual([r.set_aside.length, r.set_aside_truncated], [200, true]);
  assert.deepEqual(r.set_aside.map((s) => s.key), keys.slice(1).reverse().map((k) => `monitoring::${k}`),
                   "newest first; the oldest is the one cut");
});
