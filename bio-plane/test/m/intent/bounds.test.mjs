/* intent's published bounds (the Bounds paragraph; N181, K239; N209, K338; N236, N277): each read that grows with the
   record answers at most its bound, says so with `truncated`, and at the bound exactly says nothing was cut. R4
   (MEASURE_MAX), R10 and R12 (DEPARTURES_MAX), R12 and R13 (ASPIRATIONS_MAX, CONTACTS_MAX), R16 (SET_ASIDE_MAX); and
   the internal reads (N305, K367): R28's context (CONTEXT_MAX), `proposals` with no project (PROJECTS_MAX), R14's named
   capture requests (REQUESTS_MAX). */
import test from "node:test";
import assert from "node:assert/strict";
import { MEASURE_MAX, DEPARTURES_MAX, SET_ASIDE_MAX, ASPIRATIONS_MAX, CONTACTS_MAX, CONTEXT_MAX, PROJECTS_MAX,
         REQUESTS_MAX } from "../../../src/intent/index.mjs";
import { seeded, V, COND, projMd } from "./fixture.mjs";

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

test("R28 (N305) servesOf measures against at most the first 1,000 held aspirations in force, in id order, member and retired ones not counted, answering context_truncated when cut", () => {
  assert.equal(CONTEXT_MAX, 1000);
  const w = seeded();
  w.entity("ENT-1");
  w.resolve("x-sha", "INFO-X", "ENT-1", "A");                        // a bundle concerning ENT-1, in no project
  const ids = declareGroup(w, 1000, { entities: ["ENT-1"] });
  /* neither a member's aspiration nor a retired one is in force for R28, so neither counts toward the bound */
  w.i.declareAspiration({ scope: "member", owner: "bob", statement: "Mine", entities: ["ENT-1"], author: V("bob") });
  const [old] = declareGroup(w, 1, { entities: ["ENT-1"] });
  assert.equal(w.i.retireAspiration({ aspiration: old, taught: "t", author: V("alice") }).ok, true);
  let r = w.i.servesOf({ bundles: ["INFO-X"] });
  assert.deepEqual([r.serves[0].aspirations.length, r.context_truncated], [1000, false], "at the bound, nothing is cut");
  assert.deepEqual(r.serves[0].aspirations, [...ids].sort());
  const [extra] = declareGroup(w, 1, { entities: ["ENT-1"] });
  r = w.i.servesOf({ bundles: ["INFO-X"] });
  assert.equal(r.context_truncated, true, "the 1,001st is cut, and it says so");
  assert.deepEqual(r.serves[0].aspirations, [...ids, extra].sort().slice(0, 1000), "the first 1,000 in id order");
  assert.equal(r.truncated, false, "the subjects were not cut");
});

test("R28 (N305, K391) servesOf walks at most the first 1,000 projects in id order and measures those with a condition, sparse among them, answering context_truncated when the walk is cut", async () => {
  const w = seeded();
  w.entity("ENT-1"); w.entity("ENT-2");
  w.relate("ENT-2", "ENT-1", "member_of");
  w.define();
  await w.thread("ENT-2", { need: "A" });                             // short (award missing) wherever it is measured
  const condition = { ...COND, relation: "member_of", required: { grade: "B", stages: ["need", "award"] } };
  const condition_ = (pid) => assert.equal(w.i.setCondition({ project: pid, condition, author: V("bob"), viewer: V("bob") }).ok, true);
  const gapOf = (pid) => `intent::${pid}::proc::ENT-2`;
  /* 1,000 projects, three of them conditioned: the first, the middle and the last in id order (ids are not in
     creation order, so they are chosen by sorting) */
  const plain = Array.from({ length: 999 }, (_, k) => w.project(`Plain ${k}`, "bob"));
  const ids = [w.P, ...plain].sort();
  const chosen = [ids[0], ids[500], ids[999]];
  chosen.forEach(condition_);
  let r = w.i.servesOf({ bundles: ["INFO-ENT-2-need"] });
  assert.deepEqual([r.serves[0].gaps, r.context_truncated], [chosen.map(gapOf).sort(), false],
                   "at the bound, the walk reaches the last in id order, and nothing is cut");
  /* a 1,001st project: the one now past the cut in id order is given a condition too; it is not measured */
  const after = [...ids, w.project("One more", "bob")].sort();
  const past = after[1000];
  condition_(past);
  r = w.i.servesOf({ bundles: ["INFO-ENT-2-need"] });
  assert.equal(r.context_truncated, true, "the 1,001st project is cut, and it says so");
  const inside = [...new Set([...chosen, past])].filter((pid) => after.indexOf(pid) < 1000);
  assert.deepEqual(r.serves[0].gaps, inside.map(gapOf).sort(), "only the conditioned among the first 1,000 are measured");
  assert.ok(!r.serves[0].gaps.includes(gapOf(past)), "the one past the cut is not");
});

test("R15 R16 (N305) proposals with no project named reads at most the first 1,000 projects the viewer may see, in id order, answering projects_limit and projects_truncated; a project it may not see is not counted", async () => {
  assert.equal(PROJECTS_MAX, 1000);
  const w = seeded();
  w.entity("ENT-1");
  w.define();
  const mine = Array.from({ length: 999 }, (_, k) => w.project(`Bob's ${k}`, "bob"));   // with P, 1,000 bob may see
  let r = w.i.proposals({ viewer: V("bob") });
  assert.deepEqual([r.projects_limit, r.projects_truncated], [1000, false], "at the bound, nothing is cut");
  w.project("Carol's", "carol");                                      // bob may not see it: not counted, and not said
  assert.equal(w.i.proposals({ viewer: V("bob") }).projects_truncated, false);
  /* a 1,001st bob may see: cut, and said. The one past the cut in id order and the last one before it state a condition
     with a gap each; the unnamed read offers the one before the cut and not the one past it (ids are not in creation
     order, so both are found by sorting) */
  const seen = [w.P, ...mine, w.project("One more", "bob")].sort();
  const [inside, past] = [seen[999], seen[1000]];
  for (const pid of [inside, past])
    assert.equal(w.i.setCondition({ project: pid, condition: { ...COND, required: { grade: null, stages: ["need"] } },
                                     author: V("bob"), viewer: V("bob") }).ok, true);
  await w.thread("ENT-1", { award: "A" });                            // need missing: one gap in each
  const gapOf = (pid) => w.i.proposals({ project: pid, viewer: V("bob") }).proposals.filter((p) => p.kind === "objective-gap");
  assert.deepEqual([gapOf(inside).length, gapOf(past).length], [1, 1], "named, each project's gap is offered");
  r = w.i.proposals({ viewer: V("bob") });
  assert.equal(r.projects_truncated, true, "the 1,001st is cut, and it says so");
  assert.ok(r.proposals.some((p) => p.key === gapOf(inside)[0].key), "the 1,000th in id order is read");
  assert.ok(!r.proposals.some((p) => p.key === gapOf(past)[0].key), "past the cut, its gap is not read");
  assert.equal(w.i.proposals({ viewer: V("carol") }).projects_truncated, false, "carol sees 2 of them");
});

test("R14 (N305) pursuitOf reads at most 1,000 named capture requests, in the order the basis names them, answering requests_limit and requests_truncated", () => {
  assert.equal(REQUESTS_MAX, 1000);
  const w = seeded();
  const a = w.i.declareAspiration({ scope: "group", statement: "Open procurement", author: V("alice") }).aspiration;
  const g = w.i.declareGoal({ statement: "The files", bounds: "this cycle", aspiration: a, author: V("bob") }).goal;
  w.i.linkObjective({ goal: g, project: w.P, author: V("bob") });
  const req = (k) => `CREQ-${String(k).padStart(4, "0")}`;
  const first = Array.from({ length: 1000 }, (_, k) => req(999 - k));   // named in descending order
  w.i.registerSource("monitoring", () => [
    { key: "a", kind: "capture-failed", basis: { capture_requests: first } },
    { key: "b", kind: "capture-failed", basis: { capture_request: req(0), requests: [req(1000)] } }]);
  assert.equal(w.i.triage({ proposal: "monitoring::a", act: "dismiss", project: w.P, reason: "r", author: V("bob") }).ok, true);
  let calls = w.calls.requestById.length;
  let p = w.i.pursuitOf({ aspiration: a, viewer: V("bob") });
  assert.deepEqual([p.capture_requests.length, p.requests_limit, p.requests_truncated], [1000, 1000, false], "at the bound, nothing is cut");
  assert.deepEqual(p.capture_requests.map((c) => c.request), first, "in the order the basis names them");
  assert.equal(w.calls.requestById.length - calls, 1000);
  /* a second act names one already named (read once) and one more: 1,001 distinct, cut, and said */
  assert.equal(w.i.triage({ proposal: "monitoring::b", act: "dismiss", project: w.P, reason: "r", author: V("bob") }).ok, true);
  calls = w.calls.requestById.length;
  p = w.i.pursuitOf({ aspiration: a, viewer: V("bob") });
  assert.deepEqual([p.capture_requests.length, p.requests_truncated], [1000, true]);
  assert.deepEqual(p.capture_requests.map((c) => c.request), first, "the one named last is the one cut");
  assert.equal(w.calls.requestById.length - calls, 1000, "no more than 1,000 are read");
});
