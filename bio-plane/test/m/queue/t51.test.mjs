/* T51-104's four requirements at the module's interface: R58 (a muted item's row names it), R59 (what a member answered),
   R60 (the feeds' honesty and the per-class all-clear) and R61 (the set-aside findings list). The producers are stubbed, so
   every answer here is this module's. Words are asserted by key (`hasWord`), never by their text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { queueOps, queueAnswer, Queue } from "../../../src/queue/index.mjs";
import { classOfKind, QUEUE_OBLIGATION_KINDS } from "../../../src/queuestate.mjs";
import { queueFeedOp } from "../../../src/queue/door.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { answeredRequests, answeredRequestsHidden } from "../project-roster/fixtures.mjs";

const DAY = 86400000;
const FACTS = { objective_gap: { bound: 50, truncated: false }, contradiction: { bound: 50, truncated: false }, dispositions: [] };
const stub = (a, it) => ({ summary: "an item", detail: "about it", basis: { source: "stub", detail: "stubbed" },
  age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: null, assignee_role: null,
  options: [], case: a.homesOf(it.subjects || []), ...it, subjects: undefined });
/** A world whose producers answer `items`, with `facts` beside the usual ones. */
const withItems = (items, facts = {}, extra = {}) =>
  world({ producers: { feedItems: (a) => ({ facts: { ...FACTS, ...facts }, items: items.map((it) => stub(a, it)) }) }, ...extra });
const asAlice = { member: "alice", viewer: "member:alice" };
const asBob = { member: "bob", viewer: "member:bob" };
const mute = (w, a, who = asAlice) => w.q.queueMute({ ...who, ...a });
const muted = (w, who = asAlice) => w.q.queueFeed({ ...who, muted: true }).muted;
const SRC = { class: "FINDING", kind: "source-modified" };

function setup(items = [], facts = {}, extra = {}) {
  const w = withItems(items, facts, extra);
  w.member("alice"); w.member("bob"); w.member("carol");
  w.bundle("INQ-1", "inquiry", { title: "Is the roof sound?" });
  w.bundle("PRJ-1", "project", { title: "Roof project" });
  w.bundle("PRJ-H", "project", { title: "Hidden project" });
  w.join("PRJ-1", "alice"); w.join("PRJ-H", "bob");
  return w;
}

/* ------------------------------------------------------------------------------------------------------------- R58 */

test("R58: a muted item's row names it: its kind and its subject's title as her feed held it when she muted it; a later retitle does not change the row", () => {
  const w = setup([{ id: "FINDING::source-modified::a", ...SRC, subject: { kind: "bundle", id: "DOC-T" }, subjects: ["DOC-T"] }]);
  w.bundle("DOC-T", "information", { title: "The roofing report" });
  assert.equal(mute(w, { item: "FINDING::source-modified::a", at: iso(NOW) }).ok, true);
  assert.deepEqual(muted(w), [{ item: "FINDING::source-modified::a", class: "FINDING", kind: "source-modified", title: "The roofing report", at: iso(NOW) }]);
  w.run(`UPDATE bundles SET title=? WHERE bundle_id=?`, "A different name", "DOC-T");
  assert.equal(muted(w)[0].title, "The roofing report", "recorded with the mute, not read again");
  // the row is what the sentence draws: queue.muted.item with the title, else the kind's plain name (the words are the design's)
  assert.ok(hasWord("queue.muted.item"));
  assert.ok(hasWord("queue.kind.source-modified"));
  // muting the same item again keeps what its row already held (the item is no longer in her feed to look up)
  assert.equal(mute(w, { item: "FINDING::source-modified::a", at: iso(NOW + 1000) }).ok, true);
  const again = muted(w)[0];
  assert.deepEqual([again.kind, again.title, again.at], ["source-modified", "The roofing report", iso(NOW + 1000)]);
});

test("R58: an item not live when muted answers title null and the kind its id names where the catalogue says so, else null; a row muted before the kind was kept does the same", () => {
  const w = setup();
  assert.equal(mute(w, { item: "CONDITION::governor-holding-host::h.example", at: iso(NOW + 1) }).ok, true);
  assert.equal(mute(w, { item: "FINDING::contradiction::CAND-1", at: iso(NOW + 2) }).ok, true, "a contradiction's id carries no kind in its second segment");
  assert.equal(mute(w, { item: "FINDING::some-progression::a-stage", at: iso(NOW + 3) }).ok, true, "a progression-stage finding's id names no kind either");
  // a row written before the columns were kept holds none of them
  w.run(`INSERT INTO queue_item_mutes (member_id, item_id, item_class, muted_at) VALUES ('alice','FINDING::watched-changed::W-9','FINDING',?)`, iso(NOW));
  const rows = Object.fromEntries(muted(w).map((r) => [r.item, r]));
  assert.deepEqual([rows["CONDITION::governor-holding-host::h.example"].kind, rows["CONDITION::governor-holding-host::h.example"].title], ["governor-holding-host", null]);
  assert.deepEqual([rows["FINDING::contradiction::CAND-1"].kind, rows["FINDING::contradiction::CAND-1"].title], [null, null]);
  assert.deepEqual([rows["FINDING::some-progression::a-stage"].kind, rows["FINDING::some-progression::a-stage"].title], [null, null]);
  assert.deepEqual([rows["FINDING::watched-changed::W-9"].kind, rows["FINDING::watched-changed::W-9"].title], ["watched-changed", null]);
  // a segment that is a kind of another class is not this row's kind: never guessed
  w.run(`INSERT INTO queue_item_mutes (member_id, item_id, item_class, muted_at) VALUES ('alice','FINDING::governor-holding-host::x','FINDING',?)`, iso(NOW));
  assert.equal(muted(w).find((r) => r.item === "FINDING::governor-holding-host::x").kind, null);
  for (const r of muted(w)) assert.deepEqual(Object.keys(r), ["item", "class", "kind", "title", "at"]);
});

test("R58 (control): another member's rows are never listed; a row whose subject bundle the viewer may no longer see answers no title", () => {
  const w = setup([{ id: "FINDING::source-modified::p", ...SRC, subject: { kind: "project", id: "PRJ-1" }, subjects: [] }]);
  assert.equal(mute(w, { item: "FINDING::source-modified::p", at: iso(NOW) }).ok, true);
  assert.equal(muted(w)[0].title, "Roof project");
  assert.deepEqual(muted(w, asBob), [], "bob sees none of alice's rows");
  assert.equal(mute(w, { item: "FINDING::source-modified::p", at: iso(NOW) }, asBob).ok, true);
  assert.equal(muted(w, asBob)[0].title, null, "bob may not see alice's project, so his feed held no title for it");
  w.run(`DELETE FROM project_participants WHERE project_id='PRJ-1' AND member_id='alice'`);
  const after = muted(w);
  assert.equal(after[0].title, null, "alice may no longer see the project: its title is not answered (R33)");
  assert.equal(after[0].kind, "source-modified", "the row still names the kind");
  assert.ok(!JSON.stringify(after).includes("Roof project"));
});

test("R58: a store made before the item mutes kept their kind and title gains the columns; its rows answer kind from the id and title null", () => {
  const w = world({}, { bare: true });
  w.db.exec(`CREATE TABLE queue_item_mutes (member_id TEXT NOT NULL, item_id TEXT NOT NULL, item_class TEXT NOT NULL,
               muted_at TEXT NOT NULL, PRIMARY KEY (member_id, item_id))`);
  w.db.exec(`CREATE TABLE queue_state (member_id TEXT NOT NULL, case_id TEXT NOT NULL, muted_kinds TEXT, snoozed_until TEXT,
               last_seen TEXT, PRIMARY KEY (member_id, case_id))`);
  w.boot();
  const cols = (t) => w.all(`PRAGMA table_info(${t})`).map((c) => c.name);
  assert.ok(["item_kind", "item_title", "item_subject"].every((c) => cols("queue_item_mutes").includes(c)));
  assert.ok(cols("queue_state").includes("snoozed_at"));
  w.q.migrate();   // idempotent
  w.member("alice");
  w.run(`INSERT INTO queue_item_mutes (member_id, item_id, item_class, muted_at) VALUES ('alice','FINDING::watched-changed::W','FINDING',?)`, iso(NOW));
  assert.deepEqual(muted(w).map((r) => [r.kind, r.title]), [["watched-changed", null]]);
});

/* ------------------------------------------------------------------------------------------------------------- R59 */

const hist = (...e) => [{ at: iso(NOW - 40 * DAY), event: "created", actor: "alarm" }, ...e];
const answered = (w, who = asAlice) => w.q.queueFeed({ ...who, answered: true });

function answeredWorld(extra = {}) {
  const w = setup([], {}, extra);
  /* tasks are unique per (subject, kind): each task gets a subject of its own, all titled alike */
  const task = (id, opts) => { w.bundle(`INF-${id}`, "information", { title: "The lease" }); w.task(id, `INF-${id}`, opts); };
  // resolved by another member for everyone (assigned to alice), and by alice herself (unassigned)
  task("T-by-bob", { assignee: "alice", status: "resolved", resolvedAt: iso(NOW - 3600000),
    history: hist({ at: iso(NOW - 3600000), event: "resolved", actor: "bob" }) });
  task("T-by-alice", { assignee: "unassigned", status: "resolved", resolvedAt: iso(NOW - 7200000),
    history: hist({ at: iso(NOW - 7200000), event: "resolved", actor: "alice" }) });
  // never hers: assigned to bob alone, resolved by bob; and hers but resolved before the window
  task("T-bobs", { assignee: "bob", status: "resolved", resolvedAt: iso(NOW - 3600000),
    history: hist({ at: iso(NOW - 3600000), event: "resolved", actor: "bob" }) });
  task("T-old", { assignee: "alice", status: "resolved", resolvedAt: iso(NOW - 40 * DAY),
    history: hist({ at: iso(NOW - 40 * DAY), event: "resolved", actor: "bob" }) });
  // forwarded by alice to bob (her forward is the latest); forwarded by alice, then again by bob to carol; bob's own forward
  task("T-fwd", { assignee: "bob", status: "forwarded", history: hist({ at: iso(NOW - 5000000), event: "forwarded", actor: "alice" }) });
  task("T-fwd-twice", { assignee: "carol", status: "forwarded", history: hist(
    { at: iso(NOW - 9000000), event: "forwarded", actor: "alice" }, { at: iso(NOW - 8000000), event: "forwarded", actor: "bob" }) });
  task("T-bob-fwd", { assignee: "carol", status: "forwarded", history: hist({ at: iso(NOW - 9000000), event: "forwarded", actor: "bob" }) });
  return w;
}

test("R59: a to-do another member resolved for everyone reads that and names them; one she resolved says so; a forward and a snooze appear with their instants", () => {
  const w = answeredWorld();
  assert.equal(w.q.queueSnooze({ ...asAlice, case: "INQ-1", until: iso(NOW + DAY), at: iso(NOW - 1000) }).ok, true);
  const a = answered(w);
  assert.deepEqual(Object.keys(a), ["ok", "answered", "count", "window_days", "bound", "truncated"]);
  assert.deepEqual([a.ok, a.window_days, a.bound, a.truncated, a.count], [true, 30, 64, false, a.answered.length]);
  const row = (act, id) => a.answered.find((r) => r.act === act && (r.id === id || (r.case && r.case.id === id)));
  assert.deepEqual(row("resolved", "T-by-bob"), { act: "resolved", id: "T-by-bob", class: "OBLIGATION", kind: "authority-undetermined",
    title: "The lease", by: "bob", by_you: false, at: iso(NOW - 3600000) });
  assert.deepEqual([row("resolved", "T-by-alice").by, row("resolved", "T-by-alice").by_you], ["alice", true]);
  assert.deepEqual(row("forwarded", "T-fwd"), { act: "forwarded", id: "T-fwd", kind: "authority-undetermined", title: "The lease",
    to: "bob", at: iso(NOW - 5000000) });
  assert.equal(row("forwarded", "T-fwd-twice").to, null, "an earlier forward names no recipient: never guessed");
  assert.deepEqual(row("snoozed", "INQ-1"), { act: "snoozed", case: { id: "INQ-1", title: "Is the roof sound?" },
    until: new Date(NOW + DAY).toISOString(), at: iso(NOW - 1000) });
  // newest first by instant
  const ats = a.answered.map((r) => Date.parse(r.at));
  assert.deepEqual(ats, [...ats].sort((x, y) => y - x));
  // the words the rows are drawn with are the design's, by key
  for (const k of ["queue.answered.title", "queue.answered.byyou", "queue.answered.bymember"]) assert.ok(hasWord(k), k);
  assert.equal(hasWord("queue.answered.left"), false, "dropped (U350)");
});

test("R59 (control): another member's forwards, snoozes and set-asides are in no list; a to-do for another alone, a resolution before the window and a snooze that lapsed have no row", () => {
  const w = answeredWorld();
  w.q.queueSnooze({ ...asBob, case: "PRJ-H", until: iso(NOW + DAY), at: iso(NOW) });
  w.run(`INSERT INTO queue_state (member_id, case_id, snoozed_until, snoozed_at) VALUES ('alice','INQ-1',?,?)`, iso(NOW - DAY), iso(NOW - 2 * DAY));
  const ids = answered(w).answered.map((r) => r.id ?? r.case?.id);
  assert.ok(!ids.includes("T-bobs") && !ids.includes("T-old") && !ids.includes("T-bob-fwd"), ids.join());
  assert.ok(!ids.includes("INQ-1") && !ids.includes("PRJ-H"), "a lapsed snooze, and bob's snooze of a project alice cannot see");
  const b = answered(w, asBob).answered;
  assert.deepEqual(b.filter((r) => r.act === "forwarded").map((r) => r.id).sort(), ["T-bob-fwd", "T-fwd-twice"]);
  assert.ok(b.every((r) => r.act !== "forwarded" || r.id !== "T-fwd"), "alice's forward is not in bob's list");
  assert.deepEqual(answered(w, { member: "carol", viewer: "member:carol" }).answered.filter((r) => r.act !== "resolved"), []);
});

test("R59: the set-aside findings she decided in the window are rows, of both scopes; a snooze made before its instant was kept answers at null; a caller with no member gets resolved rows only", () => {
  const dispositions = [
    { key: "p1::s1", progression_key: "p1", stage_key: "s1", state: "dismissed", reason: "r", decided_by: "alice", at: iso(NOW - 1000), definition_version: 3 },
    { key: "p1::s2", progression_key: "p1", stage_key: "s2", state: "deferred", reason: "r", decided_by: "bob", at: iso(NOW - 1000), definition_version: 3 },
    { key: "p1::s3", progression_key: "p1", stage_key: "s3", state: "dismissed", reason: "r", decided_by: "alice", at: iso(NOW - 60 * DAY), definition_version: 3 }];
  const w = answeredWorld({ progressions: { proposalsFeed: () => ({ instances: [], proposals: [], dispositions }) } });
  const r = w.q.proposeDispose({ project: "PRJ-1", finding: "FINDING::source-modified::a", to: "deferred", reason: "later", decidedBy: "alice",
    viewer: "member:alice", identity: "member:alice" });
  assert.equal(r.ok, true, JSON.stringify(r));
  w.run(`INSERT INTO queue_state (member_id, case_id, snoozed_until) VALUES ('alice','INQ-1',?)`, iso(NOW + DAY));
  const rows = answered(w).answered;
  assert.deepEqual(rows.filter((x) => x.act === "set_aside").map((x) => [x.scope, x.finding, x.state, x.at]).sort(),
    [["instance", "FINDING::p1::s1", "dismissed", iso(NOW - 1000)], ["project", "FINDING::source-modified::a", "deferred", r.at]].sort());
  const snooze = rows.find((x) => x.act === "snoozed");
  assert.equal(snooze.at, null, "never back-filled");
  assert.equal(rows.at(-1), snooze, "the undated row follows every dated one");
  const machine = w.q.queueFeed({ viewer: "class:admin", answered: true }).answered;
  assert.deepEqual([...new Set(machine.map((x) => x.act))], ["resolved"]);
  assert.ok(machine.some((x) => x.id === "T-bobs"), "a machine credential reads every resolved to-do on subjects it may see");
});

test("R59: the list is bound at 64 and states a cut; a to-do on a subject the viewer may not see is no row", () => {
  const w = setup();
  for (let i = 0; i < 70; i++) w.bundle(`INF-${i}`, "information");
  for (let i = 0; i < 70; i++)
    w.task(`T-${String(i).padStart(3, "0")}`, `INF-${i}`, { assignee: "alice", status: "resolved", resolvedAt: iso(NOW - 1000 * (i + 1)),
      history: hist({ at: iso(NOW - 1000 * (i + 1)), event: "resolved", actor: "bob" }) });
  const a = answered(w);
  assert.deepEqual([a.count, a.bound, a.truncated], [64, 64, true]);
  assert.equal(a.answered[0].id, "T-000", "newest first");
  w.run(`UPDATE tasks SET refers_to='PRJ-H' WHERE id='T-000'`);
  assert.ok(!answered(w).answered.some((r) => r.id === "T-000"), "its subject is a project alice cannot see (R33)");
});

test("R59: the door passes `answered` on to the store and answers the list as it is; the route reads it from the query", async () => {
  const w = setup();
  const op = queueOps(w.q, new URL("http://do/queue?member=alice&viewer=member%3Aalice&answered=true"), null).queue();
  assert.deepEqual(op, answered(w));
  assert.deepEqual(queueAnswer(op, { gate: {} }), { status: 200, result: op }, "no items are added to it");
  const asked = [];
  const helpers = { json: (body, status) => ({ body, status }), doAnswer: async () => ({ answered: true, result: op }),
    storeRefusal: (o) => ({ refusal: o }), storeSilent: (o) => ({ silent: o }), gate: { needs: () => null, mode: () => "session" },
    storeName: "bio", cls: "member", member: "alice", viewer: "member:alice" };
  const store = { fetch: (u) => { asked.push(new URL(u)); return "queue"; } };
  const out = await queueFeedOp(new URL("http://plane/?op=queue&answered=true&aside=true&after=abc&limit=5"), store, helpers);
  assert.equal(out.status, 200);
  assert.deepEqual(out.body.result, op);
  assert.deepEqual(Object.fromEntries(asked[0].searchParams), { viewer: "member:alice", member: "alice", limit: "5", answered: "true", aside: "true", after: "abc" });
});

/* ------------------------------------------------------------------------------------------------------------- R60 */

const clear = (f) => f.all_clear;
const feedRow = (f, id) => { const r = f.feeds.find((x) => x.feed === id); if (!r) return r; const { ms: _, ...rest } = r; return rest; };   /* the row without its timing (R91) */
const ONE_FINDING = [{ id: "FINDING::source-modified::a", ...SRC, subject: { kind: "bundle", id: "DOC-1" }, subjects: [] }];

test("R60: a sources feed that fails answers answered false for it, all_clear false for the class it can raise even with no item, and true for a class whose feeds all answered", () => {
  const w = setup([], { failed: [{ feed: "sources", reason: "threw" }] });
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.deepEqual(feedRow(f, "sources"), { feed: "sources", classes: ["FINDING"], answered: false, failed: ["threw"] });
  assert.deepEqual(clear(f), { OBLIGATION: true, FINDING: false, CONDITION: true });
  assert.deepEqual(f.classes_answered, { OBLIGATION: true, FINDING: false, CONDITION: true });
  assert.equal(f.all_answered, false);
  assert.ok(hasWord("queue.allclear.failed"), "the word list's one key for a failed feed");
  // the retry is asking again: nothing is kept between asks, and a feed that answers the next time is answered
  const ok = setup([], {}).feed("alice");
  assert.deepEqual(feedRow(ok, "sources"), { feed: "sources", classes: ["FINDING"], answered: true, failed: [] });
  assert.deepEqual([ok.all_answered, clear(ok)], [true, { OBLIGATION: true, FINDING: true, CONDITION: true }]);
});

test("R60: every feed is a row (tasks, the producers' feeds, notice-producers); the answer's other counts and blocks are unchanged", () => {
  const f = setup().feed("alice");
  assert.deepEqual(f.feeds.map((x) => x.feed), ["tasks", "bias-debts", "proposals", "shared-inquiries", "leads", "exports", "references",
    "objectives", "sources", "machinery", "contradictions", "signing-keys", "action", "attribution", "docket", "cited-cases", "wizards",
    "schedule", "places", "projects", "members", "notice-producers"]);
  for (const x of f.feeds) assert.deepEqual(Object.keys(x), ["feed", "classes", "answered", "failed", "ms"]);
  assert.deepEqual(f.classes, ["OBLIGATION", "FINDING", "CONDITION"]);
  assert.deepEqual(f.classes_deferred, {});
  assert.deepEqual(Object.keys(f.notice_producers).sort(), ["detail", "failed"]);
});

test("R60 (control): a muted item does not make a class not clear, and an item held makes all_clear false for its class", () => {
  const w = setup(ONE_FINDING);
  w.bundle("DOC-1");
  assert.deepEqual(clear(w.feed("alice")), { OBLIGATION: true, FINDING: false, CONDITION: true }, "an item held");
  assert.equal(mute(w, { item: "FINDING::source-modified::a" }).ok, true);
  const f = w.feed("alice");
  assert.equal(f.mute.suppressed_count, 1);
  assert.deepEqual(clear(f), { OBLIGATION: true, FINDING: true, CONDITION: true }, "suppression is not a failure");
  assert.equal(f.all_answered, true);
  // a cut at the limit does not make a class look clear
  const many = setup([...Array(3)].map((_, i) => ({ id: `FINDING::source-modified::${i}`, ...SRC, subject: { kind: "bundle", id: "DOC-1" }, subjects: [] })));
  many.bundle("DOC-1");
  const cut = many.feed("alice", undefined, 1);
  assert.deepEqual([cut.item_count, cut.truncated, clear(cut).FINDING], [1, true, false]);
});

test("R60: a feed no provider is composed for (facts.absent), a failed notice-producers read and a feed the table does not know are each not answered, never read as none", () => {
  const absent = setup([], { absent: ["places", "wizards"] }).feed("alice");
  assert.deepEqual([feedRow(absent, "places").answered, feedRow(absent, "wizards").answered, feedRow(absent, "sources").answered], [false, false, true]);
  assert.deepEqual(clear(absent), { OBLIGATION: false, FINDING: false, CONDITION: false });
  const notices = setup([], {}, { notices: { noticeItems: () => ({ items: [], facts: { failed: ["interest-check"] } }) } }).feed("alice");
  assert.deepEqual(feedRow(notices, "notice-producers"), { feed: "notice-producers", classes: ["OBLIGATION", "FINDING"], answered: false, failed: ["interest-check"] });
  assert.deepEqual([clear(notices).OBLIGATION, clear(notices).FINDING, clear(notices).CONDITION], [false, false, true]);
  const threw = setup([], {}, { notices: { noticeItems: () => { throw new Error("boom"); } } }).feed("alice");
  assert.equal(feedRow(threw, "notice-producers").answered, false);
  const other = setup([], { failed: [{ feed: "a-new-feed", reason: "refused" }, "legacy"] }).feed("alice");
  assert.deepEqual(other.feeds.slice(-2).map((x) => [x.feed, x.answered, x.failed]), [["a-new-feed", false, ["refused"]], ["legacy", false, ["failed"]]]);
  assert.deepEqual(clear(other), { OBLIGATION: false, FINDING: false, CONDITION: false }, "a feed we cannot place may raise any class");
  assert.deepEqual(Queue.QUEUE_FEEDS.find(([id]) => id === "sources"), ["sources", ["FINDING"]]);
});

/* ------------------------------------------------------------------------------------------------------------- R61 */

const decide = (w, project, finding, at, state = "dismissed", by = "alice") =>
  w.run(`INSERT INTO finding_dispositions (project_id, finding_id, kind, state, reason, decided_by, at) VALUES (?,?,?,?,?,?,?)`,
    project, finding, "source-modified", state, "why", by, at);
const aside = (w, extra = {}, who = asAlice) => w.q.queueFeed({ ...who, aside: true, ...extra });
function walk(w, limit, who = asAlice) {
  const out = []; let after = null; let pages = 0;
  do { const p = aside(w, { limit, ...(after ? { after } : {}) }, who); out.push(...p.aside); after = p.next; pages += 1; assert.ok(pages < 40); } while (after);
  return out;
}

test("R61: seventy decisions are listed whole in pages, where `disposed` still stops at 64; an instance decision answers the version it judged and a project decision null", () => {
  const items = [...Array(70)].map((_, i) => ({ id: `FINDING::source-modified::${String(i).padStart(2, "0")}`, ...SRC,
    subject: { kind: "bundle", id: "DOC-1" }, subjects: ["DOC-1"] }));
  const instance = [{ key: "p1::s1", progression_key: "p1", stage_key: "s1", state: "deferred", reason: "wait", decided_by: "bob", at: iso(NOW - 500),
                      definition_version: 4, definition_version_state: "current", applies: true }];
  const w = setup(items, { dispositions: instance }, { progressions: { proposalsFeed: () => ({ instances: [], proposals: [], dispositions: instance }) } });
  w.bundle("DOC-1"); w.cite("PRJ-1", "DOC-1");
  items.forEach((it, i) => decide(w, "PRJ-1", it.id, iso(NOW - 1000 * (i + 1))));
  const f = w.feed("alice");
  assert.equal(f.disposed.count, 64);
  assert.deepEqual([f.disposed.recorded, f.disposed.bound, f.disposed.truncated], [71, 64, true]);
  assert.equal(f.items.length, 0, "every project home decided: the items left the open list");
  const all = walk(w, 25);
  assert.equal(all.length, 71);
  assert.equal(new Set(all.map((r) => `${r.scope}|${r.project}|${r.finding}`)).size, 71, "every row once");
  const instRow = all.find((r) => r.scope === "instance");
  assert.deepEqual(instRow, { scope: "instance", finding: "FINDING::p1::s1", project: null, key: "p1::s1", state: "deferred", reason: "wait",
    decided_by: "bob", at: iso(NOW - 500), definition_version: 4, title: null });
  const projRow = all.find((r) => r.scope === "project");
  assert.deepEqual(Object.keys(projRow), ["scope", "finding", "project", "key", "state", "reason", "decided_by", "at", "definition_version", "title"]);
  assert.deepEqual([projRow.definition_version, projRow.key, projRow.project], [null, `PRJ-1::${projRow.finding}`, "PRJ-1"]);
  const ats = all.map((r) => Date.parse(r.at));
  assert.deepEqual(ats, [...ats].sort((x, y) => y - x), "newest first");
  // one page: the default 200 holds all, with no cursor; the pages agree with the whole
  const whole = aside(w);
  assert.deepEqual([whole.count, whole.truncated, whole.next, whole.aside.length], [71, false, null, 71]);
  assert.deepEqual(all, whole.aside);
  assert.deepEqual(Object.keys(whole), ["ok", "aside", "count", "next", "truncated"]);
  for (const k of ["queue.aside.dismissed", "queue.aside.deferred", "queue.aside.help"]) assert.ok(hasWord(k), k);
});

test("R61 (control): a decision on a project the viewer cannot see, or on a bundle they may not see, is in no page and no count; a bad cursor starts again", () => {
  const w = setup();
  w.bundle("DOC-T", "information", { title: "The roofing report" });
  w.bundle("PRJ-X", "project", { title: "Secret roof team" });
  decide(w, "PRJ-1", "FINDING::source-modified::DOC-T", iso(NOW - 4000));
  decide(w, "PRJ-H", "FINDING::source-modified::x", iso(NOW - 3000));
  decide(w, "PRJ-1", "FINDING::source-modified::PRJ-H", iso(NOW - 2000));
  decide(w, "PRJ-1", "FINDING::source-modified::plain", iso(NOW - 1000));
  const a = aside(w);
  assert.deepEqual(a.aside.map((r) => [r.project, r.finding, r.title]),
    [["PRJ-1", "FINDING::source-modified::plain", null], ["PRJ-1", "FINDING::source-modified::DOC-T", "The roofing report"]]);
  assert.equal(a.count, 2);
  assert.ok(!JSON.stringify(a).includes("Hidden project") && !JSON.stringify(a).includes("PRJ-H"));
  assert.deepEqual(aside(w, {}, asBob).aside.map((r) => [r.project, r.finding]), [["PRJ-H", "FINDING::source-modified::x"]], "bob sees only the project he may");
  assert.deepEqual(aside(w, { after: "not a cursor" }).aside, a.aside);
  assert.equal(aside(w, { limit: 1 }).truncated, true);
  assert.deepEqual(aside(w, { limit: 0 }).count, 1, "a limit is clamped to at least one");
});

test("R61: a decision names the same row whoever decided it; the route and the door pass `aside` and `after`; queueAnswer passes the list through", () => {
  const w = setup();
  decide(w, "PRJ-1", "FINDING::source-modified::one", iso(NOW - 1000), "deferred", "bob");
  decide(w, "PRJ-1", "FINDING::source-modified::two", iso(NOW - 2000));
  const first = aside(w, { limit: 1 });
  const op = queueOps(w.q, new URL(`http://do/queue?member=alice&viewer=member%3Aalice&aside=true&limit=1&after=${first.next}`), null).queue();
  assert.deepEqual(op.aside.map((r) => r.finding), ["FINDING::source-modified::two"]);
  assert.deepEqual([first.aside[0].decided_by, first.aside[0].state], ["bob", "deferred"], "the decider is whoever decided, not the asker");
  assert.deepEqual(queueAnswer(op, { gate: {} }), { status: 200, result: op });
  // a project-scoped decision made by the act itself is a row with the instance's clock, and no definition version
  const r = w.q.proposeDispose({ project: "PRJ-1", finding: "FINDING::source-modified::three", to: "dismissed", reason: "no", decidedBy: "alice",
    viewer: "member:alice", identity: "member:alice" });
  assert.equal(r.ok, true);
  const all = aside(w).aside;
  assert.deepEqual([all[0].finding, all[0].at, all[0].definition_version], ["FINDING::source-modified::three", r.at, null]);
});

/* ------------------------------------------------------------------------------------------------------------- R95 */

/* project-roster's real answer to "the requests a member answered" (R44), taken from its published fixtures; a world answers it to
   the member the fixture was made for (owner "ann") and the real empty answer to anyone else. */
const rosterAnswering = async (answers) => {
  const full = await answeredRequests(answers ? { answers } : undefined), none = await answeredRequestsHidden();
  return { full, none, dep: { projectRequestsAnswered: ({ by }) => (by === "ann" ? full : none) } };
};
const answeredOf = (w, who) => w.q.queueFeed({ ...who, answered: true }).answered.filter((r) => r.act === "join_answer");
const asAnn = { member: "ann", viewer: "member:ann" };

test("R95: What you answered holds each join request the viewer answered: its project, the requester, the answer and the day", async () => {
  const { full, dep } = await rosterAnswering();
  const w = setup([], {}, { projectRoster: dep });
  w.member("ann"); w.bundle("PROJ-D", "project", { title: "Discoverable D" }); w.join("PROJ-D", "ann", { owner: true });
  const rows = answeredOf(w, asAnn);
  assert.equal(full.answered.length, 2, "the fixture is the real answer for two answered requests");
  /* answers made in the same millisecond tie: queue orders ties by requester, so compare by requester */
  const byHandle = (a, b) => (a[3].handle < b[3].handle ? -1 : 1);
  assert.deepEqual(rows.map((r) => [r.act, r.project, r.title, r.requester, r.answer, r.at]).sort(byHandle),
    full.answered.map((x) => ["join_answer", x.projectId, "Discoverable D", x.requester, x.answer, x.closed]).sort(byHandle));
  assert.deepEqual(rows.map((r) => r.answer).sort(), ["declined", "granted"], "both answers, Decline and Grant");
  const all = w.q.queueFeed({ ...asAnn, answered: true });
  assert.equal(all.ok, true);
  assert.equal(all.count, all.answered.length, "the count includes them");
});

test("R95: another owner's answer is not hers, and a project she can no longer see names nothing (R33)", async () => {
  const { dep } = await rosterAnswering();
  const w = setup([], {}, { projectRoster: dep });
  w.member("ann"); w.bundle("PROJ-D", "project", { title: "Hidden Discoverable D" });
  assert.deepEqual(answeredOf(w, asAlice), [], "control: alice answered none");
  assert.deepEqual(answeredOf(w, asAnn), [], "ann is no longer a participant of PROJ-D: the project names nothing");
  assert.ok(!JSON.stringify(w.q.queueFeed({ ...asAnn, answered: true })).includes("Hidden Discoverable D"));
  w.join("PROJ-D", "ann", { owner: true });
  assert.equal(answeredOf(w, asAnn).length, 2, "control: seen again, it is named");
});

/* ----------------------------------------------------------------------------------------------- R57, queue-producers R54 */

/* An item of the shape queue-producers R54 mints for a participant's request to leave: keyed by project and handle, the owners its
   recipients, `projectremove` its act. */
const LEAVE = { id: "OBLIGATION::project-leave::PRJ-1::dee", class: "OBLIGATION", kind: "project-leave",
  subject: { kind: "project", id: "PRJ-1", name: "Roof project", participant: "dee" }, assignee: null, assignee_role: null, subjects: ["PRJ-1"] };

test("R57: project-leave is an OBLIGATION with its one sentence, passes the mint, and is answered by the owners' projectremove; it is never muted", () => {
  assert.equal(classOfKind("project-leave"), "OBLIGATION");
  assert.ok(typeof QUEUE_OBLIGATION_KINDS["project-leave"] === "string" && QUEUE_OBLIGATION_KINDS["project-leave"].length > 20);
  const w = setup([LEAVE]);
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const it = byId(f)[LEAVE.id];
  assert.deepEqual([it.kind, it.class], ["project-leave", "OBLIGATION"]);
  assert.deepEqual([it.disposition.available, it.disposition.instead], [false, "projectremove"]);
  assert.match(it.disposition.detail, /op=projectremove/);
  // control: the near miss is still refused whole; under another class it is misclassed; muted it is not personal
  assert.deepEqual([w.feed("alice").ok, withItems([{ id: "FINDING::x::1", class: "FINDING", kind: "project-leaves" }]).feed(null, "class:admin").reason],
    [true, "NO_SUCH_KIND"]);
  assert.equal(withItems([{ ...LEAVE, id: "FINDING::project-leave::1", class: "FINDING" }]).feed(null, "class:admin").reason, "KIND_MISCLASSED");
  const m = mute(w, { item: LEAVE.id });
  assert.deepEqual([m.ok, m.reason, m.kind_class], [false, "KIND_NOT_PERSONAL", "OBLIGATION"]);
});
