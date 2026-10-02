/* intent's published bounds (the Bounds paragraph; N181, K239; N209, K338; N236, N277): each read that grows with the
   record answers at most its bound, says so with `truncated`, and at the bound exactly says nothing was cut. R4
   (MEASURE_MAX), R10 and R12 (DEPARTURES_MAX), R12 and R13 (ASPIRATIONS_MAX, CONTACTS_MAX), R16 (SET_ASIDE_MAX); and
   the internal reads (N305, K367): R28's context (CONTEXT_MAX), `proposals` with no project (PROJECTS_MAX), R14's named
   capture requests (REQUESTS_MAX); and (N323, K408) R12's and R13's read of every aspiration the viewer may see, held or
   retired (ASPIRATIONS_MAX), R14's read of the goals (GOALS_READ_MAX), and R27's read of the questions at `surfaced`
   (AGEING_READ_MAX). */
import test from "node:test";
import assert from "node:assert/strict";
import { MEASURE_MAX, DEPARTURES_MAX, SET_ASIDE_MAX, ASPIRATIONS_MAX, CONTACTS_MAX, CONTEXT_MAX, PROJECTS_MAX,
         REQUESTS_MAX, GOALS_MAX, GOALS_READ_MAX, AGEING_READ_MAX } from "../../../src/intent/index.mjs";
import { seeded, V, COND, projMd, DAY } from "./fixture.mjs";

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
  /* N323: a retired aspiration is read and counted toward the bound, and not answered */
  assert.equal(w.i.retireAspiration({ aspiration: sorted[0], taught: "t", author: V("alice") }).ok, true);
  r = w.i.aspirationsFor({ viewer: V("bob") });
  assert.deepEqual([r.aspirations.length, r.truncated, r.aspirations[0].id], [999, true, sorted[1]]);
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
  assert.equal(w.i.setCondition({ reason: "Measured by the record.", project: w.P, author: V("bob"), viewer: V("bob"), condition: { progression: "proc", entity: "ENT-0",
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

test("R28 (N305, N323) servesOf reads the first 1,000 aspirations in id order, of any scope and held or retired alike, and measures against the held ones of group or project scope among them, answering context_truncated when the read is cut", () => {
  assert.equal(CONTEXT_MAX, 1000);
  const w = seeded();
  w.entity("ENT-1");
  w.resolve("x-sha", "INFO-X", "ENT-1", "A");                        // a bundle concerning ENT-1, in no project
  const ids = declareGroup(w, 998, { entities: ["ENT-1"] });
  /* a member's aspiration and a retired one are read and counted, and neither is in force for R28 */
  const mine = w.i.declareAspiration({ scope: "member", owner: "bob", statement: "Mine", entities: ["ENT-1"], author: V("bob") }).aspiration;
  const [old] = declareGroup(w, 1, { entities: ["ENT-1"] });
  assert.equal(w.i.retireAspiration({ aspiration: old, taught: "t", author: V("alice") }).ok, true);
  let r = w.i.servesOf({ bundles: ["INFO-X"] });
  assert.deepEqual([r.serves[0].aspirations.length, r.context_truncated], [998, false], "1,000 read: at the bound, nothing is cut");
  assert.deepEqual(r.serves[0].aspirations, [...ids].sort());
  assert.ok(!r.serves[0].aspirations.includes(mine) && !r.serves[0].aspirations.includes(old));
  /* a 1,001st, held and naming ENT-1: past the read, so not measured, and the cut is said */
  const [extra] = declareGroup(w, 1, { entities: ["ENT-1"] });
  const all = [...ids, mine, old, extra].sort();
  assert.equal(all.indexOf(extra), 1000, "the new one is the 1,001st in id order");
  r = w.i.servesOf({ bundles: ["INFO-X"] });
  assert.equal(r.context_truncated, true, "the 1,001st is cut, and it says so");
  assert.deepEqual(r.serves[0].aspirations, [...ids].sort(), "the held group ones among the first 1,000 in id order");
  assert.equal(r.truncated, false, "the subjects were not cut");
});

test("R28 (N305, K391) servesOf walks at most the first 1,000 projects in id order and measures those with a condition, sparse among them, answering context_truncated when the walk is cut", async () => {
  const w = seeded();
  w.entity("ENT-1"); w.entity("ENT-2");
  w.relate("ENT-2", "ENT-1", "member_of");
  w.define();
  await w.thread("ENT-2", { need: "A" });                             // short (award missing) wherever it is measured
  const condition = { ...COND, relation: "member_of", required: { grade: "B", stages: ["need", "award"] } };
  const condition_ = (pid) => assert.equal(w.i.setCondition({ reason: "Measured by the record.", project: pid, condition, author: V("bob"), viewer: V("bob") }).ok, true);
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
    assert.equal(w.i.setCondition({ reason: "Measured by the record.", project: pid, condition: { ...COND, required: { grade: null, stages: ["need"] } },
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

test("R12 R13 (N323) aspirationsFor and contacts read the first 1,000 aspirations the viewer may see, held or retired and of any scope, each counted: 1,001 retired and then one held answer none held, with truncated", () => {
  assert.equal(ASPIRATIONS_MAX, 1000);
  const w = seeded();
  w.entity("ENT-1");
  const retired = declareGroup(w, 1001, { entities: ["ENT-1"] });
  for (const a of retired) assert.equal(w.i.retireAspiration({ aspiration: a, taught: "t", author: V("alice") }).ok, true);
  /* two held, both past the read in id order, sharing ENT-1: in force and in contact, but not read */
  const held = declareGroup(w, 2, { entities: ["ENT-1"] });
  assert.ok(held.every((id) => id > [...retired].sort().at(-1)));
  let r = w.i.aspirationsFor({ viewer: V("bob") });
  assert.deepEqual([r.aspirations, r.limit, r.truncated], [[], 1000, true], "none held among the 1,000 read, and the cut is said");
  let c = w.i.contacts({ viewer: V("bob") });
  assert.deepEqual([c.contacts, c.truncated], [[], true], "no pair among R12's read; the cut is said");
  /* at the bound exactly: 998 retired, the two held, 1,000 read, nothing cut, both answered and paired */
  const v = seeded();
  v.entity("ENT-1");
  for (const a of declareGroup(v, 998)) v.i.retireAspiration({ aspiration: a, taught: "t", author: V("alice") });
  const two = declareGroup(v, 2, { entities: ["ENT-1"] }).sort();
  r = v.i.aspirationsFor({ viewer: V("bob") });
  assert.deepEqual([r.aspirations.map((a) => a.id), r.truncated], [two, false]);
  c = v.i.contacts({ viewer: V("bob") });
  assert.deepEqual([c.contacts.map((x) => [x.a, x.b]), c.truncated], [[two], false]);
});

test("R12 R13 (N323, DEC-36, K391) a project aspiration of a project the viewer may not see is skipped and never counted, so the cut says nothing of it", () => {
  const w = seeded();
  const hidden = w.project("Sealed", "carol");
  const group = declareGroup(w, 999);
  const sealed = w.i.declareAspiration({ scope: "project", owner: hidden, statement: "Sealed", author: V("carol") }).aspiration;
  const [last] = declareGroup(w, 1);
  assert.ok(sealed < last, "the hidden one sits inside the first 1,000 in id order");
  /* bob may see 1,000 of the 1,001: all read, nothing cut, nothing of the hidden one */
  const bob = w.i.aspirationsFor({ viewer: V("bob") });
  assert.deepEqual([bob.aspirations.length, bob.truncated], [1000, false]);
  assert.equal(w.i.contacts({ viewer: V("bob") }).truncated, false);
  /* carol may see all 1,001: the 1,001st in id order is cut, and it says so */
  const carol = w.i.aspirationsFor({ viewer: V("carol") });
  assert.deepEqual([carol.aspirations.length, carol.truncated], [999, true], "the group's 1,000 less the one past the cut");
  assert.ok(!carol.aspirations.some((a) => a.id === last));
  assert.equal(w.i.contacts({ viewer: V("carol") }).truncated, true);
  void group;
});

test("R14 (N323) pursuitOf finds the aspiration's goals by reading at most the first 1,000 goals held, in id order, whatever aspiration each names: 1,001 under other aspirations and then one under the asked answer no goal, with goals_read_truncated", () => {
  assert.equal(GOALS_READ_MAX, 1000);
  assert.equal(GOALS_MAX, 200);
  const goals = (w, n, aspiration = null) => Array.from({ length: n }, (_, k) =>
    w.i.declareGoal({ statement: `Goal ${k}`, bounds: "b", aspiration, author: V("bob") }).goal);
  const w = seeded();
  const a = w.i.declareAspiration({ scope: "group", statement: "Asked", author: V("alice") }).aspiration;
  const other = w.i.declareAspiration({ scope: "group", statement: "Other", author: V("alice") }).aspiration;
  const before = goals(w, 1001, other);
  const [mine] = goals(w, 1, a);
  assert.ok(mine > [...before].sort().at(-1), "the asked aspiration's goal is the 1,002nd in id order");
  let p = w.i.pursuitOf({ aspiration: a, viewer: V("bob") });
  assert.deepEqual([p.goals, p.goals_read_truncated, p.goals_truncated], [[], true, false], "not reached, and the cut is said");
  /* at the bound exactly: 999 under another and the asked one's, 1,000 read, found, nothing cut */
  const v = seeded();
  const b = v.i.declareAspiration({ scope: "group", statement: "Asked", author: V("alice") }).aspiration;
  goals(v, 999, null);
  const [found] = goals(v, 1, b);
  p = v.i.pursuitOf({ aspiration: b, viewer: V("bob") });
  assert.deepEqual([p.goals.map((g) => g.id), p.goals_read_truncated], [[found], false]);
  /* one more goal after it: the read is cut after the asked one's goal, which is still found, and the cut is said */
  const [late] = goals(v, 1, b);
  p = v.i.pursuitOf({ aspiration: b, viewer: V("bob") });
  assert.deepEqual([p.goals.map((g) => g.id), p.goals_read_truncated], [[found], true], `${late} is past the read`);
});

test("R27 R17 (N323) ageDue, ageWake and ageSurfaced read at most the first 1,000 questions at surfaced, those whose last entry is oldest first, then by id, and judge ageability among those alone: 1,001 human-surfaced questions older than an ageable one leave it unread (null, truncated); an ageable one older than all is aged", async () => {
  assert.equal(AGEING_READ_MAX, 1000);
  const w = seeded();
  const T = Date.parse("2026-09-28T00:00:00Z");
  const at = (days) => new Date(T - days * DAY).toISOString().replace(/\.\d+Z$/, "Z");
  const id = (n) => `INQ-2026-${String(n).padStart(4, "0")}`;
  /* 1,001 questions a member surfaced, at surfaced, 50 days old: never ageable */
  for (let n = 1000; n <= 2000; n++) w.inquiry(id(n), { created: at(50), surfacedBy: "human", author: V("bob") });
  /* an ageable question, 40 days old (due 10 days ago), newer than all of them: past the read */
  w.inquiry(id(3000), { created: at(40) });
  assert.equal(w.i.ageDue(T), null, "none ageable among the 1,000 read");
  assert.equal(w.i.ageWake(T - 20 * DAY), null, "nor woken for");
  let r = await w.i.ageSurfaced(T);
  assert.deepEqual([r.aged, r.limit, r.truncated], [[], 1000, true], "not reached, and the cut is said");
  assert.equal(w.fm(id(3000)).current_state, "surfaced");
  /* the same age as the human ones, and first by id among them: read, and due */
  w.inquiry(id(100), { created: at(50) });
  assert.equal(w.i.ageDue(T), T - 20 * DAY, "ties on the last entry are read by id");
  /* an ageable question older than all of them: read first, and aged */
  w.inquiry(id(500), { created: at(60) });
  assert.equal(w.i.ageDue(T), T - 30 * DAY);
  r = await w.i.ageSurfaced(T);
  assert.deepEqual([r.aged, r.truncated], [[id(500), id(100)], true]);
  assert.equal(w.fm(id(500)).current_state, "deferred");
  /* the two left surfaced; still 1,001 human ones at surfaced, so the 40-day one stays past the read */
  assert.equal(w.i.ageDue(T), null);
  /* at the bound exactly: 999 human ones and the 40-day one, 1,000 read, nothing cut, and it is aged */
  const v = seeded();
  for (let n = 1000; n <= 1998; n++) v.inquiry(id(n), { created: at(50), surfacedBy: "human", author: V("bob") });
  v.inquiry(id(3000), { created: at(40) });
  assert.equal(v.i.ageDue(T), T - 10 * DAY);
  r = await v.i.ageSurfaced(T);
  assert.deepEqual([r.aged, r.truncated], [[id(3000)], false]);
});

test("R27 R17 (N323) a question's authors are judged whole however many there are: past a page of machine authors, one member's entry still makes it unageable", async () => {
  const w = seeded();
  const T = Date.parse("2026-09-28T00:00:00Z");
  const at = (days) => new Date(T - days * DAY).toISOString().replace(/\.\d+Z$/, "Z");
  const ids = ["INQ-2026-0001", "INQ-2026-0002"];
  for (const id of ids) {
    w.inquiry(id, { created: at(40) });
    /* 70 distinct machine authors, more than one statement reads, sorted before the member's */
    for (let k = 0; k < 70; k++) {
      const r = w.revise(id, w.text(id).replace(/\n$/, `\nNote ${k}.\n`), `class:ai-${String(k).padStart(2, "0")}`,
                           { actorViewer: "class:daemon" });
      assert.equal(r.ok, true, JSON.stringify(r).slice(0, 200));
    }
  }
  w.st.sql.exec(`UPDATE manifest SET created=? WHERE bundle_id IN (?, ?)`, at(40), ...ids);
  assert.equal(w.i.ageDue(T), T - 10 * DAY, "every author a machine's: ageable");
  /* a member's entry on the second, its name sorted after every machine author's */
  assert.equal(w.revise(ids[1], w.text(ids[1]).replace(/\n$/, "\nNarrowed.\n"), V("zed")).ok, true);
  w.st.sql.exec(`UPDATE manifest SET created=? WHERE bundle_id=?`, at(40), ids[1]);
  assert.ok("member:zed" > "class:ai-69");
  const r = await w.i.ageSurfaced(T);
  assert.deepEqual([r.aged, r.truncated], [[ids[0]], false], "the member's entry is found past the first page");
});
