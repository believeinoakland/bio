/* queue R91 (T51-L13; K4194): the feeds' time. Each feed's row states the milliseconds its feed took, a feed that throws still
   carries its time, and the reads of one ask grow with the distinct subjects and homes it meets, not with items x ancestors. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./world.mjs";
import { Queue } from "../../../src/queue/index.mjs";

const FACTS = { dispositions: [], unattributed: { count: 0, inquiries: [] } };
const row = (f, id) => f.feeds.find((x) => x.feed === id);
const isMs = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0;

function setup({ facts = {}, items = [], fakes = {}, notices = null } = {}) {
  const w = world({ producers: { feedItems: () => ({ facts: { ...FACTS, ...facts }, items }) }, ...fakes },
                  notices ? { notices: () => notices } : {});
  w.member("alice");
  return w;
}

test("R91: every feed's row states its milliseconds: this module's measure for tasks and notice-producers, the producers' for theirs, null where none is stated; feeds_ms is the producers' call", () => {
  const w = setup({ facts: { ms: { proposals: 12.5, sources: 0, machinery: 3, leads: -1, exports: "slow", places: Infinity } } });
  const f = w.feed("alice");
  assert.equal(f.ok, true);
  assert.ok(isMs(row(f, "tasks").ms) && isMs(row(f, "notice-producers").ms), "the two this module reads itself");
  assert.ok(isMs(f.feeds_ms));
  assert.deepEqual(["proposals", "sources", "machinery"].map((id) => row(f, id).ms), [12.5, 0, 3]);
  /* never a made-up number: a negative, a non-number and a non-finite figure are not stated, and nor is a feed named in none */
  assert.deepEqual(["leads", "exports", "places", "references", "bias-debts"].map((id) => row(f, id).ms), [null, null, null, null, null]);
  for (const x of f.feeds) assert.ok(x.ms === null || isMs(x.ms), x.feed);
  /* the rest of each row is as R60 states it */
  assert.deepEqual(Object.keys(row(f, "tasks")), ["feed", "classes", "answered", "failed", "ms"]);
});

test("R91: a producer that states no facts.ms leaves every one of its feeds null (control); a feed id R45 does not know is a row that carries its stated time", () => {
  const f = setup().feed("alice");
  assert.deepEqual(f.feeds.filter((x) => x.feed !== "tasks" && x.feed !== "notice-producers").map((x) => x.ms), Array(19).fill(null));
  const g = setup({ facts: { failed: [{ feed: "a-new-feed", reason: "threw" }], ms: { "a-new-feed": 7 } } }).feed("alice");
  assert.deepEqual([row(g, "a-new-feed").answered, row(g, "a-new-feed").ms], [false, 7]);
});

test("R91 (control): a feed that throws still carries its time: notice-producers throwing, and a producer feed named failed", () => {
  const threw = setup({ notices: { noticeItems: () => { throw new Error("boom"); } },
                        facts: { failed: [{ feed: "sources", reason: "threw" }], ms: { sources: 41.25 } } }).feed("alice");
  assert.equal(row(threw, "notice-producers").answered, false);
  assert.ok(isMs(row(threw, "notice-producers").ms), "the notice read that threw was timed");
  assert.deepEqual([row(threw, "sources").answered, row(threw, "sources").ms], [false, 41.25]);
  assert.ok(isMs(threw.feeds_ms));
});

test("R91: the timings are how long this ask took and nothing else: the items, counts and blocks are the answer's without them", () => {
  const w = setup();
  w.bundle("DOC-1"); w.task("TASK-2026-0001-a", "DOC-1", { assignee: "alice" });
  const a = w.feed("alice"), b = w.feed("alice");
  const strip = ({ feeds_ms: _, feeds, ...rest }) => ({ ...rest, feeds: feeds.map(({ ms: __, ...r }) => r) });
  assert.deepEqual(strip(a), strip(b));
  assert.equal(a.items.length, 1);
});

/* a subject holds one task of a kind, so several tasks on one subject are of several kinds (all to-dos) */
const KINDS = ["authority-undetermined", "check-requested", "membership-request", "expertise-confirmation-owed", "project-owners-inactive",
               "endorsement-owed", "signer-self-registered", "contradiction-duty"];
/* P projects each cite every one of K documents (so each document has P homes); M tasks on those documents */
function fixture({ projects, docs, tasks }) {
  /* the producers are stubbed: their reads are `queue-producers`', and this test counts what this module reads */
  const w = world({ producers: { feedItems: () => ({ facts: FACTS, items: [] }) } });
  w.member("alice");
  for (let d = 0; d < docs; d += 1) w.bundle(`DOC-${d}`);
  for (let p = 0; p < projects; p += 1) { w.bundle(`PRJ-${p}`, "project"); w.join(`PRJ-${p}`, "alice"); for (let d = 0; d < docs; d += 1) w.cite(`PRJ-${p}`, `DOC-${d}`); }
  for (let t = 0; t < tasks; t += 1) w.task(`TASK-2026-${String(t).padStart(4, "0")}-a`, `DOC-${t % docs}`, { assignee: "alice", kind: KINDS[Math.floor(t / docs) % KINDS.length] });
  return w;
}
const statementsOf = (w) => { const n = w.statements.length; const f = w.feed("alice"); assert.equal(f.ok, true); return { n: w.statements.length - n, f }; };

test("R91: the reads of an ask do not grow with items x homes: forty tasks cost what ten do over the same subjects, and twelve projects cost a fixed number of reads each, shown at two sizes", () => {
  const small = statementsOf(fixture({ projects: 3, docs: 5, tasks: 10 }));
  const more = statementsOf(fixture({ projects: 3, docs: 5, tasks: 40 }));
  assert.equal(small.f.items.length, 10);
  assert.equal(more.f.items.length, 40);
  for (const it of more.f.items) assert.equal(it.case.ancestors.length, 3, "every task is still filed under all three projects");
  assert.equal(more.n, small.n, "four times the items over the same subjects and homes: the same reads");
  const wide = statementsOf(fixture({ projects: 12, docs: 5, tasks: 40 }));
  for (const it of wide.f.items) assert.equal(it.case.ancestors.length, 12);
  const perHome = (wide.n - more.n) / (12 - 3);
  assert.ok(perHome <= 4, `nine more homes cost ${wide.n - more.n} reads, ${perHome} each`);
  /* a different subject is the only thing that costs more per item: ten distinct subjects cost more than five */
  const distinct = statementsOf(fixture({ projects: 3, docs: 10, tasks: 40 }));
  assert.ok(distinct.n > more.n && distinct.n - more.n <= 5 * 3 * 8, `five more subjects cost ${distinct.n - more.n}`);
});

test("R91 (control): the memoised walk answers what the unmemoised one did: homes, depth bound and out_of_view, per item", () => {
  const w = world();
  w.member("alice"); w.bundle("DOC-1"); w.bundle("DOC-2");
  w.bundle("INQ-1", "inquiry"); w.leg("INQ-1", "DOC-1"); w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice"); w.cite("PRJ-1", "INQ-1");
  w.bundle("PRJ-HIDDEN", "project"); w.cite("PRJ-HIDDEN", "DOC-2");
  for (let i = 0; i < 3; i += 1) { w.task(`TASK-2026-000${i}-a`, "DOC-1", { assignee: "alice", kind: KINDS[i] }); w.task(`TASK-2026-001${i}-a`, "DOC-2", { assignee: "alice", kind: KINDS[i] }); }
  const f = w.feed("alice");
  const homes = (id) => f.items.filter((i) => i.subject.id === id).map((i) => i.case);
  for (const c of homes("DOC-1")) assert.deepEqual([c.state, c.ancestors.map((a) => a.id)], ["determined", ["INQ-1", "PRJ-1"]]);
  for (const c of homes("DOC-2")) assert.deepEqual([c.state, c.reasons, c.ancestors], ["undetermined", ["out_of_view"], []]);
  /* items of one subject share no object: a change to one item's homes is not seen in another's */
  const same = f.items.filter((i) => i.subject.id === "DOC-1");
  assert.equal(same.length, 3);
  assert.notEqual(same[0].case, same[1].case);
  assert.notEqual(same[0].case.ancestors, same[1].case.ancestors);
  assert.notEqual(same[0].case.ancestors[0], same[1].case.ancestors[0]);
  assert.equal(typeof Queue.QUEUE_ANCESTOR_DEPTH, "number");
});
