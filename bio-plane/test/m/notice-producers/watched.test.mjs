/* R24 (T50; N1204; DEC-238 (S23 "A"); K3635): a watched item that changed is told to its watcher. The world is money-checks' test
   world (real record-core and membership); `retrieval.browse` and `following.watchedBy` are stand-ins answering in their requirements'
   shape (retrieval R85, following R35). Each test drives `noticeItems` at its interface, with its control (K874). */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "../money-checks/fixture.mjs";
import { browseViewerMissing } from "../retrieval-browse/fixtures.mjs";
import { watchedByRefusal } from "../following/fixtures.mjs";
import { fresh, reader, ofKind, snapshot, texts } from "./fixture.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { NOTICE_KINDS, WATCHED_ITEMS_MAX, WATCHED_PAGE } from "../../../src/notice-producers/index.mjs";

const NOW = "2026-10-06T12:00:00Z";
const DOC = "INFO-2026-0001-minutes", HIDDEN = "INFO-2026-0002-hidden", PERSON = "ENT-2026-0001";
const MARK = "2026-10-01T09:00:00Z";

/* A browse answering the asking viewer's own watches (R85), and a watchedBy answering whose marks are set (R35). */
function stand({ watches = {}, marks = {}, items = {} } = {}) {
  const asked = [];
  return {
    asked,
    retrieval: { browse: (a) => {
      asked.push(a);
      const mine = (watches[a.viewer] || []).map((id) => items[id]).filter(Boolean);
      const start = a.after ? Number(a.after) : 0, page = mine.slice(start, start + (a.limit ?? 50));
      const more = start + page.length < mine.length;
      return { ok: true, kinds: [], only: a.only, items: page, count: page.length, limit: a.limit ?? 50, truncated: more, next: more ? String(start + page.length) : null };
    } },
    following: { policyChanges: () => ({ ok: true, changes: [], cursor: null }), dutyWatchEndAt: () => null,
      watchedBy: (id) => ({ ok: true, watchers: Object.entries(marks[id] || {}).map(([member, at]) => ({ member, at })) }) },
  };
}
const doc = (last_changed, title = "Minutes of the 1 October meeting") => ({ kind: "document", id: DOC, title, last_changed, new: false, watched: true, flagged: null });

function setup(spec, over = {}) {
  const w = world();
  w.project("PROJ-2026-0001-alpha", ["alice"]);
  w.st.sql.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);
  const s = stand(spec);
  const n = fresh(w.host, { membership: w.membership, retrieval: s.retrieval, following: s.following, ...over });
  return { w, n, s, ...reader(n) };
}
const told = (r) => ofKind(r, "watched-changed");

test("R24 a member watches a document; it changes after her mark: one item with the document's title; read again: no second item; a second change: one more", () => {
  const items = { [DOC]: doc("2026-10-05T10:00:00Z") };
  const { read, s } = setup({ watches: { "member:alice": [DOC] }, marks: { [DOC]: { alice: MARK } }, items });
  const first = told(read("alice", { now: NOW }));
  assert.equal(first.length, 1);
  const it = first[0];
  assert.equal(it.id, `FINDING::watched-changed::${DOC}::2026-10-05T10:00:00Z`);
  assert.equal(it.class, "FINDING");
  assert.equal(NOTICE_KINDS["watched-changed"], "FINDING");
  assert.equal(it.label, "noticed");
  assert.deepEqual(it.recipients, ["alice"]);
  assert.equal(it.subject.id, DOC);
  assert.equal(it.summary_key, "queue.watched-changed.summary");
  assert.equal(it.detail_key, "queue.watched-changed.detail");
  assert.equal(it.summary, word("queue.watched-changed.summary", { what: "Minutes of the 1 October meeting" }));
  assert.equal(it.detail, word("queue.watched-changed.detail", { date: word("date.daymonth", { day: "5", month: word("date.month.october") }) }));
  assert.deepEqual(s.asked[0], { only: "watched", viewer: "member:alice", limit: WATCHED_PAGE });
  /* read again: the same change is the same item, never a second */
  const again = told(read("alice", { now: "2026-10-06T13:00:00Z" }));
  assert.deepEqual(again.map((i) => i.id), [it.id]);
  /* a second change: a different key, one more item once the first is a different change (queue mints each once) */
  items[DOC] = doc("2026-10-06T08:00:00Z");
  const second = told(read("alice", { now: NOW }));
  assert.deepEqual(second.map((i) => i.id), [`FINDING::watched-changed::${DOC}::2026-10-06T08:00:00Z`]);
  assert.notEqual(second[0].id, it.id);
});

test("R24 control: a change before her mark, or at it, makes none; an item another member watches and she does not makes none for her; a hidden document is never listed", () => {
  const before = setup({ watches: { "member:alice": [DOC] }, marks: { [DOC]: { alice: MARK } }, items: { [DOC]: doc("2026-09-30T10:00:00Z") } });
  assert.deepEqual(told(before.read("alice", { now: NOW })), [], "before the mark");
  const at = setup({ watches: { "member:alice": [DOC] }, marks: { [DOC]: { alice: MARK } }, items: { [DOC]: doc(MARK) } });
  assert.deepEqual(told(at.read("alice", { now: NOW })), [], "at the mark, not later");
  /* bob watches and the document changed; alice does not watch it */
  const other = setup({ watches: { "member:bob": [DOC] }, marks: { [DOC]: { bob: MARK } }, items: { [DOC]: doc("2026-10-05T10:00:00Z") } });
  assert.deepEqual(told(other.read("alice", { now: NOW })), [], "alice's own watches do not list it");
  assert.equal(told(other.read("bob", { now: NOW })).length, 1, "control: bob, who watches it, is told");
  /* a mark of another member's on a document alice's list holds is not read for her: no mark of hers, no item */
  const unmarked = setup({ watches: { "member:alice": [DOC] }, marks: { [DOC]: { bob: MARK } }, items: { [DOC]: doc("2026-10-05T10:00:00Z") } });
  assert.deepEqual(told(unmarked.read("alice", { now: NOW })), [], "bob's mark is not alice's");
  /* a hidden document: retrieval does not list it to her, so it is no item and nothing names it */
  const hidden = setup({ watches: { "member:alice": [] }, marks: { [HIDDEN]: { alice: MARK } }, items: { [HIDDEN]: { ...doc("2026-10-05T10:00:00Z"), id: HIDDEN } } });
  const r = hidden.read("alice", { now: NOW });
  assert.deepEqual(told(r), []);
  assert.ok(!texts(r).some((t) => t.includes(HIDDEN)));
});

test("R24 goes to that member alone: two watchers with different marks are each told by their own mark; the viewer asked is the member's own", () => {
  const items = { [DOC]: doc("2026-10-05T10:00:00Z") };
  const { read, s } = setup({ watches: { "member:alice": [DOC], "member:bob": [DOC] }, marks: { [DOC]: { alice: MARK, bob: "2026-10-06T00:00:00Z" } }, items });
  assert.equal(told(read("alice", { now: NOW })).length, 1, "alice marked before the change");
  assert.deepEqual(told(read("bob", { now: NOW })), [], "bob marked after it");
  assert.deepEqual(s.asked.map((a) => a.viewer), ["member:alice", "member:bob"]);
  for (const it of told(read("alice", { now: NOW }))) assert.deepEqual(it.recipients, ["alice"]);
});

test("R24 an entity's last_changed is its creation instant, never later than a mark set on it: none is told", () => {
  const person = { kind: "person", id: PERSON, title: "A. Person", last_changed: "2026-09-01T00:00:00Z", new: false, watched: true, flagged: null };
  const { read } = setup({ watches: { "member:alice": [PERSON] }, marks: { [PERSON]: { alice: MARK } }, items: { [PERSON]: person } });
  assert.deepEqual(told(read("alice", { now: NOW })), []);
});

test("R24 says nothing of what changed or what it means; its sentences are the words.json keys filled, and a year not the current one is named", () => {
  const { read } = setup({ watches: { "member:alice": [DOC] }, marks: { [DOC]: { alice: "2025-01-01T00:00:00Z" } }, items: { [DOC]: doc("2025-12-31T10:00:00Z") } });
  const [it] = told(read("alice", { now: NOW }));
  assert.equal(it.detail, word("queue.watched-changed.detail", { date: word("date.daymonthyear", { day: "31", month: word("date.month.december"), year: "2025" }) }));
  assert.doesNotMatch(it.summary + it.detail, /\b(edited|deleted|added|removed|violat\w*|overdue)\b/i);
});

test("R24 follows next to at most 1,000 watched items, the bound and truncated stated; the cut is stated, never silent", () => {
  const ids = Array.from({ length: WATCHED_ITEMS_MAX + 1 }, (_, i) => `INFO-2026-${String(i).padStart(4, "0")}-d`);
  const items = Object.fromEntries(ids.map((id) => [id, { ...doc("2026-10-05T10:00:00Z"), id }]));
  const marks = Object.fromEntries(ids.map((id) => [id, { alice: MARK }]));
  const { read, s } = setup({ watches: { "member:alice": ids }, marks, items });
  const r = read("alice", { now: NOW });
  assert.equal(told(r).length, WATCHED_ITEMS_MAX);
  assert.deepEqual(r.facts.watched_changed, { bound: WATCHED_ITEMS_MAX, truncated: true });
  assert.equal(s.asked.length, WATCHED_ITEMS_MAX / WATCHED_PAGE, "five pages of 200, following next");
  /* control: exactly the bound is not truncated... and fewer is not */
  const few = setup({ watches: { "member:alice": [DOC] }, marks: { [DOC]: { alice: MARK } }, items: { [DOC]: doc("2026-10-05T10:00:00Z") } });
  assert.deepEqual(few.read("alice", { now: NOW }).facts.watched_changed, { bound: WATCHED_ITEMS_MAX, truncated: false });
});

test("R24 R1 a browse or watchedBy that throws, or answers undetermined, contributes no item and is named in facts.failed; the read writes nothing", () => {
  const spec = { watches: { "member:alice": [DOC] }, marks: { [DOC]: { alice: MARK } }, items: { [DOC]: doc("2026-10-05T10:00:00Z") } };
  const boom = () => { throw new Error("down"); };
  const base = stand(spec);
  const cases = [
    ["retrieval", { retrieval: { browse: boom } }],
    ["retrieval", { retrieval: { browse: ({ only }) => ({ ok: true, only, items: [], undetermined: { why: "no module registered" }, truncated: false, next: null }) } }],
    ["retrieval", { retrieval: { browse: () => browseViewerMissing() } }],
    ["following", { following: { ...base.following, watchedBy: boom } }],
    ["following", { following: { ...base.following, watchedBy: () => watchedByRefusal() } }],
  ];
  for (const [who, over] of cases) {
    const { w, read } = setup(spec, over);
    const before = snapshot((q) => w.st.sql.exec(q));
    const r = read("alice", { now: NOW });
    assert.deepEqual(told(r), [], who);
    assert.deepEqual(r.facts.failed, [who], who);
    assert.deepEqual(snapshot((q) => w.st.sql.exec(q)), before);
  }
  /* control: with both answering, nothing fails */
  assert.deepEqual(setup(spec).read("alice", { now: NOW }).facts.failed, []);
});
