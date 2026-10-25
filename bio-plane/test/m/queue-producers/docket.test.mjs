/* The docket's items (R30, R31; N520, DEC-116 items 2, 3, 7) at feedItems' interface. `docket.coreDue` (its R9) is docket's published
   fixture, the real answer over real acts; `reevaluation.docketDependents` (its R30) is a fake answering in the shape its requirement
   publishes, filled per test. Membership is real, so a case's managers are its project's owners (membership R65), and a case's
   project is publication's `cases` row (its R40). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { coreDueKinds } from "../docket/fixtures.mjs";

const DAY = 86400000;
const ofKind = (r, kind) => r.items.filter((i) => i.kind === kind);

/* olga owns PRJ-1 (CASE-1's project), alice is a member of it; PRJ-H is a project alice may not see, owned by alice's
   co-owner hank and holding CASE-H; CASE-X names no project. */
function docketWorld(fakes) {
  const w = world(fakes);
  w.member("ada", { role: "admin" }); w.member("alice"); w.member("olga"); w.member("hank");
  w.bundle("PRJ-1", "project"); w.bundle("PRJ-2", "project"); w.bundle("PRJ-H", "project");
  w.join("PRJ-1", "olga", { owner: true }); w.join("PRJ-1", "alice"); w.join("PRJ-2", "alice", { owner: true });
  w.join("PRJ-H", "hank", { owner: true });
  w.run(`INSERT INTO cases (case_id, project_id) VALUES ('CASE-1','PRJ-1'), ('CASE-2','PRJ-2'), ('CASE-H','PRJ-H'), ('CASE-X', NULL)`);
  return w;
}

test("R30 (docket R9; DEC-116 item 2): one OBLIGATION docket-core-due per core item docket.coreDue answers, keyed OBLIGATION::docket-core-due::<case>::<kind>::<ref>, to the case's managers and nobody else, offering placement and, for a submission, the decline", () => {
  /* docket's real core items (its published fixture): alice manages CASE-2026-0101 of project P, dave manages CASE-2026-0202 of
     project Q. The fake answers both cases whatever the viewer, so this module's own recipient rule is what is measured. */
  const fx = coreDueKinds();
  const real = [...fx.due.items, ...fx.otherDue.items];
  const asked = [];
  const answer = { ok: true, items: real, count: real.length, wrote: false };
  const w = world({ docket: { coreDue: (a) => { asked.push(a); return answer; } } });
  w.member("ada", { role: "admin" }); w.member("alice"); w.member("dave"); w.member("olga");
  w.bundle("PRJ-P", "project"); w.bundle("PRJ-Q", "project");
  w.join("PRJ-P", "alice", { owner: true }); w.join("PRJ-P", "olga"); w.join("PRJ-Q", "dave", { owner: true });
  w.run(`INSERT INTO cases (case_id, project_id) VALUES (?, 'PRJ-P'), (?, 'PRJ-Q')`, fx.case, fx.caseQ);
  /* the items are three days old at this read (their `since` is 2026-10-01 in the fixture) */
  const LATER = Date.parse("2026-10-04T12:00:00Z");
  const read = (m) => w.read(m, undefined, { now: LATER });
  const key = (i) => `OBLIGATION::docket-core-due::${i.case}::${i.kind}::${i.ref}`;
  const ids = (r) => ofKind(r, "docket-core-due").map((i) => i.id).sort();
  const item = (kind) => fx.due.items.find((i) => i.kind === kind);
  const alice = read("alice");
  assert.deepEqual(asked.at(-1), { viewer: "member:alice" }, "docket's read, under the viewer");
  assert.deepEqual(ids(alice), fx.due.items.map(key).sort(), "the case's manager: one item per core item of the case she manages");
  assert.deepEqual(ids(read("dave")), fx.otherDue.items.map(key).sort(), "the manager of the other project is told of its case only");
  assert.deepEqual(ids(read("olga")), [], "a member of the project who is no owner is told nothing of its case");
  assert.deepEqual(ids(read("ada")), [], "nor an administrator who manages no case");
  asked.length = 0;
  assert.deepEqual(ids(w.read(null, "class:admin")), [], "a caller with no member is no case's manager");
  assert.deepEqual(asked, [], "and docket is not asked for it");
  const m = byId(alice);
  const resp = item("response"), stmt = item("statement"), ed = item("edition"), te = item("tension");
  const sub = m[key(resp)], st = m[key(stmt)], e = m[key(ed)], t = m[key(te)];
  assert.deepEqual([sub.class, sub.kind], ["OBLIGATION", "docket-core-due"]);
  assert.deepEqual(sub.subject, { kind: "case", id: fx.case, project: "PRJ-P", item: "response", ref: resp.ref, edition: 1 },
    "its subject the case, naming the item and its edition");
  assert.deepEqual(sub.options.map((o) => o.id), ["docketprepare", "docketdecline"], "a submission: placement or the decline");
  assert.deepEqual(st.options.map((o) => o.id), ["docketprepare", "docketdecline"]);
  assert.deepEqual(e.options.map((o) => o.id), ["docketprepare"], "a newer edition: placement only");
  assert.deepEqual(t.options.map((o) => o.id), ["docketprepare"], "an undisclosed tension: placement only");
  /* R43: the sentences by key, the item named by `what` and the edition where one is stated */
  const what = (k) => word(`queue.docket-core-due.what.${k}`), tail = word("queue.docket-core-due.detail.tail");
  assert.equal(sub.summary, word("queue.docket-core-due.summary.edition", { case: fx.case, what: what("response"), edition: 1 }));
  assert.equal(sub.detail, `${word("queue.docket-core-due.detail.response")} ${tail}`);
  assert.deepEqual([sub.summary_key, sub.detail_key], ["queue.docket-core-due.summary.edition", "queue.docket-core-due.detail.response"]);
  assert.equal(st.summary, word("queue.docket-core-due.summary.edition", { case: fx.case, what: what("statement"), edition: 1 }));
  assert.equal(e.summary, word("queue.docket-core-due.summary.edition", { case: fx.case, what: what("edition"), edition: 2 }));
  assert.equal(e.detail, `${word("queue.docket-core-due.detail.edition", { edition: 2 })} ${tail}`);
  assert.equal(t.summary, word("queue.docket-core-due.summary.edition", { case: fx.case, what: what("tension"), edition: 2 }));
  assert.equal(t.detail, `${word("queue.docket-core-due.detail.tension")} ${tail}`);
  assert.deepEqual(sub.age, { state: "determined", since: resp.since, ms: 3 * DAY }, "aged from the item's since");
  assert.deepEqual(sub.recipients, ["alice"], "the case's managers, its project's owners");
  assert.deepEqual(sub.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-P", 0]], "homed under the case's project");
  assert.equal(sub.basis.source, "docket.coreDue");
  assert.equal(e.basis.what_changed, ed.what_changed, "a newer edition says what changed");
  for (const it of ofKind(alice, "docket-core-due"))
    for (const s of [it.summary, it.detail, it.basis.detail, ...it.options.map((o) => o.label)])
      assert.doesNotMatch(s, /\b(obligation|condition|subject)s?\b/i, `${it.id}: "${s}"`);
  // raised once: the same read twice is the same items; it leaves when the item is placed, declined, receipted or disclosed
  assert.deepEqual(ids(read("alice")), ids(alice));
  w.fakes.docket.coreDue = () => ({ ok: true, items: real.filter((i) => i !== resp), count: real.length - 1, wrote: false });
  assert.ok(!ids(read("alice")).includes(key(resp)), "done, it leaves");
});

test("R31 (reevaluation R30; DEC-116 items 3, 7): FINDINGs edition-withdrawn and edition-contested, one per (dependent, entry) reevaluation.docketDependents answers, keyed FINDING::<kind>::<dependent>::<entry>, homed under the dependent's ancestors; leaving when the cause closes", () => {
  const asked = [];
  const entries = [
    { dependent: "INQ-1", entry: "CASE-1#4", kind: "withdrawal", case: "CASE-1", since: iso(NOW - 3 * DAY), withdrawn_editions: [1, 2],
      legs: [{ target: "INF-9", ord: 0, edition: 1, sha: "abc" }], detail: "this leg rests on INF-9" },
    { dependent: "INQ-1", entry: "DKT-2026-0007", kind: "contested", case: "CASE-1", since: iso(NOW - DAY), edition: 2, legs: [],
      detail: "a response contests edition 2" },
    { dependent: "INQ-2", entry: "CASE-2#1", kind: "withdrawal", case: "CASE-2", since: "not an instant", withdrawn_editions: [1], legs: [] },
    { dependent: "INQ-2", entry: "CASE-2#9", kind: "wp_retraction", case: "CASE-2", since: iso(NOW), legs: [] }];
  const w = docketWorld({ reevaluation: { docketDependents: (a) => { asked.push(a);
    return a.after ? { ok: true, entries: entries.slice(2), truncated: false, cursor: null }
                   : { ok: true, entries: entries.slice(0, 2), truncated: true, cursor: "INQ-1#DKT-2026-0007" }; } } });
  w.bundle("INQ-1", "inquiry", { title: "Was the contract bid?" }); w.bundle("INQ-2", "inquiry");
  w.cite("PRJ-1", "INQ-1"); w.cite("PRJ-2", "INQ-2");
  const r = w.read("alice");
  assert.deepEqual(asked.slice(0, 2), [{ after: null, limit: 200, viewer: "member:alice" }, { after: "INQ-1#DKT-2026-0007", limit: 200, viewer: "member:alice" }],
    "reevaluation's read, under the viewer (it withholds a hidden dependent and counts none), its cursor followed");
  const ids = [...ofKind(r, "edition-withdrawn"), ...ofKind(r, "edition-contested")].map((i) => i.id).sort();
  assert.deepEqual(ids, ["FINDING::edition-contested::INQ-1::DKT-2026-0007", "FINDING::edition-withdrawn::INQ-1::CASE-1#4",
    "FINDING::edition-withdrawn::INQ-2::CASE-2#1"], "one per (dependent, entry); a cause of another kind is no item here");
  const m = byId(r);
  const wd = m["FINDING::edition-withdrawn::INQ-1::CASE-1#4"], ct = m["FINDING::edition-contested::INQ-1::DKT-2026-0007"];
  assert.deepEqual([wd.class, wd.kind, ct.class, ct.kind], ["FINDING", "edition-withdrawn", "FINDING", "edition-contested"]);
  assert.deepEqual(wd.subject, { kind: "bundle", id: "INQ-1", case: "CASE-1", entry: "CASE-1#4", editions: [1, 2] });
  assert.deepEqual(ct.subject, { kind: "bundle", id: "INQ-1", case: "CASE-1", entry: "DKT-2026-0007", editions: [2] });
  assert.deepEqual(wd.case.ancestors.map((a) => a.id), ["INQ-1", "PRJ-1"], "homed under the dependent and its ancestors");
  assert.deepEqual(m["FINDING::edition-withdrawn::INQ-2::CASE-2#1"].case.ancestors.map((a) => a.id), ["INQ-2", "PRJ-2"]);
  assert.deepEqual(wd.age, { state: "determined", since: iso(NOW - 3 * DAY), ms: 3 * DAY }, "aged from the cause's since");
  assert.equal(m["FINDING::edition-withdrawn::INQ-2::CASE-2#1"].age.state, "undetermined");
  assert.deepEqual(wd.options, [{ id: "opt", on: ["INQ-1"] }]);
  const named = word("queue.docket-case.named", { case: "CASE-1" });
  assert.equal(wd.summary, word("queue.edition-withdrawn.summary", { name: "Was the contract bid?" }));
  assert.equal(wd.detail, word("queue.edition-withdrawn.detail.other", { case: named, editions: "1, 2" }));
  assert.equal(ct.summary, word("queue.edition-contested.summary", { case: named, name: "Was the contract bid?" }));
  assert.equal(ct.detail, word("queue.edition-contested.detail.numbered", { case: named, edition: 2 }));
  assert.equal(m["FINDING::edition-withdrawn::INQ-2::CASE-2#1"].detail,
    word("queue.edition-withdrawn.detail.one", { case: word("queue.docket-case.named", { case: "CASE-2" }), editions: "1" }), "one edition reads .one");
  assert.deepEqual([wd.detail_key, ct.detail_key], ["queue.edition-withdrawn.detail.other", "queue.edition-contested.detail.numbered"]);
  assert.equal(wd.basis.source, "reevaluation.docketDependents"); assert.deepEqual(wd.basis.legs, entries[0].legs);
  for (const it of [wd, ct]) for (const s of [it.summary, it.detail, it.basis.detail])
    assert.doesNotMatch(s, /\b(obligation|condition|subject)s?\b/i, s);
  // it leaves when the cause closes (the read no longer answers it)
  w.fakes.reevaluation.docketDependents = () => ({ ok: true, entries: entries.slice(1, 2), truncated: false, cursor: null });
  assert.deepEqual(ofKind(w.read("alice"), "edition-withdrawn"), []);
  // with no docket registered, the read answers nothing and says so: no item
  w.fakes.reevaluation.docketDependents = () => ({ ok: true, entries: [], truncated: false, cursor: null, docket_absent: true });
  assert.deepEqual([...ofKind(w.read("alice"), "edition-withdrawn"), ...ofKind(w.read("alice"), "edition-contested")], []);
  // at most 20 pages are followed, and a cut is stated
  let n = 0;
  w.fakes.reevaluation.docketDependents = () => { n += 1;
    return { ok: true, entries: [{ ...entries[0], entry: `CASE-1#${n}` }], truncated: true, cursor: `INQ-1#CASE-1#${n}` }; };
  const cut = ofKind(w.read("alice"), "edition-withdrawn");
  assert.equal(n, 20); assert.equal(cut.length, 20); assert.ok(cut.every((i) => i.basis.bound.truncated === true));
});
