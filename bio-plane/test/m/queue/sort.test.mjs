/* R49 (DEC-110 (1), (3); K1038) at queueFeed's interface, with R6's order as the order among equals: the default (grouped
   by case), `added`, `due`, `case` and `kind`, each over one world built so every order differs from the others and
   from R6's; items lacking the value and ties keep R6's order; the sort comes before the cut; any other `sort` is
   refused QUEUE_SORT_UNKNOWN (C-33.51) before anything is read; the op arm and the door pass the query's `sort`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { queueOps, QUEUE_ACT_CHECKS, QUEUE_SORTS } from "../../../src/queue/index.mjs";
import { queueFeedOp } from "../../../src/queue/door.mjs";

const FACTS = { objective_gap: { bound: 50, truncated: false }, unattributed: { count: 0, inquiries: [] },
                contradiction: { bound: 50, truncated: false }, dispositions: [] };
const at = (ms) => ({ state: "determined", since: iso(NOW - ms), ms });

/* Seven items. Homes (R7): DOC-1 under PRJ-A (depth 1), DOC-2 under INQ-B (depth 1), DOC-3 under INQ-0 only at depth 2
   (through the waypoint INF-MID), so INQ-0's id is the least but its depth is not; #4 and #6 have no home. Ids are
   chosen so R6's id order runs against kind order within a class. */
const SEVEN = [
  { n: 1, id: "OBLIGATION::zz-reminder", class: "OBLIGATION", kind: "action-reminder", subjects: ["DOC-2"], age: at(5000), due: "2026-09-10" },
  { n: 2, id: "FINDING::aa-gap", class: "FINDING", kind: "objective-gap", subjects: ["DOC-1"], age: at(1000) },
  { n: 3, id: "CONDITION::zz-overdue", class: "CONDITION", kind: "action-clock-overdue", subjects: ["DOC-1"], age: at(3000), due: "2026-09-05" },
  { n: 4, id: "OBLIGATION::aa-checkpoint", class: "OBLIGATION", kind: "plan-checkpoint-due", subjects: [], age: at(2000), due: "2026-09-20" },
  { n: 5, id: "CONDITION::aa-held", class: "CONDITION", kind: "governor-holding-host", subjects: ["DOC-2"],
    age: { state: "undetermined", reason: "derived_on_read" } },
  { n: 6, id: "FINDING::zz-export", class: "FINDING", kind: "export-performed", subjects: [], age: at(4000) },
  { n: 7, id: "FINDING::mm-deep", class: "FINDING", kind: "grade-improvable", subjects: ["DOC-3"], age: at(6000) },
];
/* Worked by hand from R49's words, not read back from the code. */
const EXPECT = {
  r6:      [4, 1, 2, 7, 6, 5, 3],          // class, then id
  default: [1, 5, 2, 3, 7, 4, 6],          // INQ-B (d1), PRJ-A (d1), INQ-0 (d2), none; within each R6
  case:    [1, 5, 2, 3, 7, 4, 6],
  added:   [2, 4, 3, 6, 1, 7, 5],          // newest first; #5's age undetermined, last
  due:     [3, 1, 4, 2, 7, 6, 5],          // soonest first; the rest in R6's order
  kind:    [1, 4, 6, 7, 2, 3, 5],          // class, then kind
};

function sevenWorld(items = SEVEN) {
  const asked = { feedItems: 0 };
  const w = world({ producers: { feedItems: (a) => {
    asked.feedItems += 1;
    return { facts: FACTS, items: items.map(({ n, subjects, ...it }) => ({ subject: { kind: "bundle", id: subjects[0] ?? null },
      summary: it.kind, detail: null, basis: { source: "stub", detail: "stubbed" }, assignee: null, assignee_role: null,
      options: a.optionsOf(subjects), ...it, case: a.homesOf(subjects) })) };
  } } });
  w.asked = asked;
  for (const d of ["DOC-1", "DOC-2", "DOC-3", "INF-MID"]) w.bundle(d);
  w.bundle("PRJ-A", "project"); w.cite("PRJ-A", "DOC-1");
  w.bundle("INQ-B", "inquiry"); w.leg("INQ-B", "DOC-2");
  w.bundle("INQ-0", "inquiry"); w.cite("INF-MID", "DOC-3"); w.leg("INQ-0", "INF-MID");
  return w;
}
const nums = (f) => f.items.map((i) => SEVEN.find((s) => s.id === i.id).n);
const feed = (w, sort, limit = null) => w.q.queueFeed({ member: null, viewer: "class:admin", limit, sort });

test("R49, R6: the default groups by case (nearest home by depth, then id; none last), to-dos, noticed, signals within, R6's order among equals", () => {
  const w = sevenWorld();
  const f = feed(w, null);
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  // the world is what the expectations assume: #7's only home is INQ-0, at depth 2
  const homes = Object.fromEntries(f.items.map((i) => [i.id, i.case.ancestors.map((a) => [a.id, a.depth])]));
  assert.deepEqual(homes["FINDING::mm-deep"], [["INQ-0", 2]]);
  assert.deepEqual([homes["OBLIGATION::aa-checkpoint"], homes["FINDING::zz-export"]], [[], []]);
  assert.deepEqual(nums(f), EXPECT.default);
  assert.equal(f.sort, null, "the answer states the default as no sort");
  for (const blank of [undefined, "", "   "]) assert.deepEqual(nums(feed(w, blank)), EXPECT.default, String(blank));
  // negative control: the default is not R6's order in this world
  assert.notDeepEqual(EXPECT.default, EXPECT.r6);
});

test("R49: added, due, case and kind each order the world as their words say, each order different from the others, and the answer states its sort", () => {
  const w = sevenWorld();
  for (const s of QUEUE_SORTS) {
    const f = feed(w, s);
    assert.equal(f.ok, true, s);
    assert.deepEqual(nums(f), EXPECT[s], s);
    assert.equal(f.sort, s);
    assert.equal(feed(w, ` ${s} `).sort, s, "trimmed");
  }
  assert.deepEqual([...QUEUE_SORTS], ["added", "due", "case", "kind"]);
  // the world separates every order R49 names from every other (case is the default's, DEC-110 (3))
  const orders = ["r6", "default", "added", "due", "kind"].map((k) => JSON.stringify(EXPECT[k]));
  assert.equal(new Set(orders).size, orders.length);
});

test("R49, R6: items lacking the value sorted on, and ties, keep R6's order among themselves", () => {
  // every item without a due, the same age and the same kind per class: each sort falls through to R6 whole
  const flat = SEVEN.map(({ due, ...it }) => ({ ...it, age: at(1000), subjects: [] }));
  const w = sevenWorld(flat);
  const R6 = ["OBLIGATION::aa-checkpoint", "OBLIGATION::zz-reminder", "FINDING::aa-gap", "FINDING::mm-deep", "FINDING::zz-export",
              "CONDITION::aa-held", "CONDITION::zz-overdue"];
  for (const s of ["added", "due", "case", null]) assert.deepEqual(feed(w, s).items.map((i) => i.id), R6, String(s));
  // two items of one class and kind, one age: the tie is the id
  const twins = [{ ...SEVEN[1], id: "FINDING::b" }, { ...SEVEN[1], id: "FINDING::a" }];
  for (const s of ["added", "due", "case", "kind", null])
    assert.deepEqual(sevenWorld(twins).q.queueFeed({ viewer: "class:admin", sort: s }).items.map((i) => i.id), ["FINDING::a", "FINDING::b"], String(s));
  // a due that is no date is no value: it sorts with the items that have none
  const odd = [{ ...SEVEN[3], due: "soon" }, { ...SEVEN[0] }];
  assert.deepEqual(sevenWorld(odd).q.queueFeed({ viewer: "class:admin", sort: "due" }).items.map((i) => i.id),
    ["OBLIGATION::zz-reminder", "OBLIGATION::aa-checkpoint"]);
});

test("R49, R6: the sort is applied before the cut, so a small limit takes the sorted head", () => {
  const w = sevenWorld();
  for (const s of [null, ...QUEUE_SORTS]) {
    const f = feed(w, s, 2);
    assert.deepEqual(nums(f), EXPECT[s ?? "default"].slice(0, 2), String(s));
    assert.deepEqual([f.limit, f.item_count, f.truncated], [2, 2, true]);
  }
});

test("R49: any other sort is refused QUEUE_SORT_UNKNOWN (C-33.51) naming the four, before anything is read", () => {
  const w = sevenWorld();
  for (const bad of ["newest", "ADDED", "due,kind", "default", "r6", 7, {}, ["added"], true]) {
    const before = w.statements.length;
    const r = feed(w, bad);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
      [false, "QUEUE_SORT_UNKNOWN", "QUEUE_SORT_UNKNOWN", "C-33.51", QUEUE_ACT_CHECKS.QUEUE_SORT_UNKNOWN.translation], String(bad));
    assert.deepEqual(r.sorts, ["added", "due", "case", "kind"]);
    assert.equal(r.sort, typeof bad === "string" ? bad : null);
    assert.equal(w.statements.length, before, `nothing read: ${String(bad)}`);
  }
  assert.equal(w.asked.feedItems, 0, "the producers were never asked");
  // its row: catalogued with its check id and a translation naming the four orders in words
  const row = QUEUE_ACT_CHECKS.QUEUE_SORT_UNKNOWN;
  assert.equal(row.check, "C-33.51");
  assert.match(row.translation, /added.*due.*case.*kind/);
  assert.match(row.where, /queueFeed > is-queue-sort$/);
  // negative control: an accepted sort does read
  feed(w, "due");
  assert.equal(w.asked.feedItems, 1);
});

test("R49: the op arm passes the query's sort to queueFeed, and op=queue's door passes it to the store", async () => {
  const seen = [];
  const q = new Proxy({}, { get: (_, k) => (a) => { seen.push([k, a]); return { ok: true }; } });
  queueOps(q, new URL("http://do/queue?member=alice&viewer=member%3Aalice&sort=due"), {}).queue();
  queueOps(q, new URL("http://do/queue?member=alice&viewer=member%3Aalice"), { sort: "kind" }).queue();
  assert.deepEqual(seen.map(([, a]) => a.sort), ["due", null], "the query's, never a body's");
  const asked = [];
  const store = { fetch: (u) => { asked.push(new URL(u)); return new URL(u).pathname.slice(1); } };
  const helpers = { json: (body, status) => ({ body, status }), storeRefusal: (o) => ({ refusal: o }), storeSilent: (op) => ({ silent: op }),
    doAnswer: async (route) => ({ answered: true, result: route === "queue" ? { ok: true, items: [] } : { kinds: [] } }),
    gate: { needs: () => null, mode: () => "session" }, storeName: "bio", cls: "admin", member: "alice", viewer: "member:alice" };
  await queueFeedOp(new URL("http://plane/?op=queue&sort=added&limit=3"), store, helpers);
  assert.equal(asked[0].searchParams.get("sort"), "added");
  await queueFeedOp(new URL("http://plane/?op=queue"), store, helpers);
  assert.equal(asked[2].searchParams.has("sort"), false, "absent stays absent");
  // a refusal from the store reaches the caller with status 400 (R17)
  const refusing = { ...helpers, doAnswer: async (route) => ({ answered: true,
    result: route === "queue" ? { ok: false, reason: "QUEUE_SORT_UNKNOWN", check: "C-33.51" } : { kinds: [] } }) };
  const out = await queueFeedOp(new URL("http://plane/?op=queue&sort=newest"), store, refusing);
  assert.deepEqual([out.status, out.body.reason], [400, "QUEUE_SORT_UNKNOWN"]);
});
