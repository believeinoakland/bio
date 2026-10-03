/* The docket's items (R30, R31; N520, DEC-116 items 2, 3, 7) at feedItems' interface. `docket.coreDue` (its R9) and
   `reevaluation.docketDependents` (its R30) are fakes answering in the shape their requirements publish, filled per test;
   membership is real, so a case's managers are its project's owners (membership R65), and a case's project is publication's
   `cases` row (its R40). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

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

test("R30 (docket R9; DEC-116 item 2): one OBLIGATION docket-core-due per core item docket.coreDue answers the viewer, keyed OBLIGATION::docket-core-due::<case>::<kind>::<ref>, to the case's manager and nobody else, offering placement and, for a submission, the decline", () => {
  const asked = [];
  const due = [
    { case: "CASE-1", kind: "response", ref: "DKT-2026-0001", edition: 1, since: iso(NOW - 3 * DAY) },
    { case: "CASE-1", kind: "statement", ref: "DKT-2026-0002", edition: 2, since: iso(NOW - 2 * DAY) },
    { case: "CASE-1", kind: "edition", ref: "2", edition: 2, since: iso(NOW - DAY), what_changed: "a finding was added" },
    { case: "CASE-1", kind: "tension", ref: "CC-9", edition: 2, since: "not an instant", member: "INF-1", state: "open" },
    { case: "CASE-2", kind: "response", ref: "DKT-2026-0003", edition: 1, since: iso(NOW) },
    { case: "CASE-H", kind: "response", ref: "DKT-2026-0004", edition: 1, since: iso(NOW) },
    { case: "CASE-X", kind: "response", ref: "DKT-2026-0005", edition: 1, since: iso(NOW) }];
  /* the fake answers every case whatever the viewer, so this module's own recipient rule is what is measured */
  const w = docketWorld({ docket: { coreDue: (a) => { asked.push(a); return { ok: true, items: due, count: due.length, wrote: false }; } } });
  const ids = (r) => ofKind(r, "docket-core-due").map((i) => i.id).sort();
  const olga = w.read("olga");
  assert.deepEqual(asked, [{ viewer: "member:olga" }], "docket's read, under the viewer: it answers the cases the viewer manages");
  assert.deepEqual(ids(olga), ["OBLIGATION::docket-core-due::CASE-1::edition::2", "OBLIGATION::docket-core-due::CASE-1::response::DKT-2026-0001",
    "OBLIGATION::docket-core-due::CASE-1::statement::DKT-2026-0002", "OBLIGATION::docket-core-due::CASE-1::tension::CC-9"],
    "the case's manager: one item per core item of the cases she manages, and none of a case she does not");
  assert.deepEqual(ids(w.read("alice")), ["OBLIGATION::docket-core-due::CASE-2::response::DKT-2026-0003"],
    "a member of the project who is no owner is told nothing of its case; the owner of another is told of hers");
  assert.ok(!JSON.stringify(w.read("alice")).includes("CASE-H"), "R11: a case of a project she may not see is named nowhere");
  assert.deepEqual(ids(w.read("ada")), [], "nor an administrator who manages no case");
  asked.length = 0;
  assert.deepEqual(ids(w.read(null, "class:admin")), [], "a caller with no member is no case's manager");
  assert.deepEqual(asked, [], "and docket is not asked for it");
  const m = byId(olga);
  const sub = m["OBLIGATION::docket-core-due::CASE-1::response::DKT-2026-0001"];
  assert.deepEqual([sub.class, sub.kind], ["OBLIGATION", "docket-core-due"]);
  assert.deepEqual(sub.subject, { kind: "case", id: "CASE-1", project: "PRJ-1", item: "response", ref: "DKT-2026-0001", edition: 1 },
    "its subject the case, naming the item and its edition");
  assert.deepEqual(sub.options.map((o) => o.id), ["docketprepare", "docketdecline"], "a submission: placement or the decline");
  assert.deepEqual(m["OBLIGATION::docket-core-due::CASE-1::statement::DKT-2026-0002"].options.map((o) => o.id), ["docketprepare", "docketdecline"]);
  assert.deepEqual(m["OBLIGATION::docket-core-due::CASE-1::edition::2"].options.map((o) => o.id), ["docketprepare"], "a newer edition: placement only");
  assert.deepEqual(m["OBLIGATION::docket-core-due::CASE-1::tension::CC-9"].options.map((o) => o.id), ["docketprepare"], "an undisclosed tension: placement only");
  assert.match(sub.summary, /a response/); assert.match(m["OBLIGATION::docket-core-due::CASE-1::statement::DKT-2026-0002"].summary, /a statement/);
  assert.match(m["OBLIGATION::docket-core-due::CASE-1::edition::2"].summary, /a newer edition on edition 2/);
  assert.match(m["OBLIGATION::docket-core-due::CASE-1::tension::CC-9"].summary, /an undisclosed tension/);
  assert.deepEqual(sub.age, { state: "determined", since: iso(NOW - 3 * DAY), ms: 3 * DAY }, "aged from the item's since");
  assert.equal(m["OBLIGATION::docket-core-due::CASE-1::tension::CC-9"].age.state, "undetermined");
  assert.deepEqual(sub.recipients, ["olga"], "the case's managers, its project's owners");
  assert.deepEqual(sub.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]], "homed under the case's project");
  assert.equal(sub.basis.source, "docket.coreDue");
  assert.equal(m["OBLIGATION::docket-core-due::CASE-1::edition::2"].basis.what_changed, "a finding was added");
  for (const it of ofKind(olga, "docket-core-due"))
    for (const s of [it.summary, it.detail, it.basis.detail, ...it.options.map((o) => o.label)])
      assert.doesNotMatch(s, /\b(obligation|condition|subject)s?\b/i, `${it.id}: "${s}"`);
  // raised once: the same read twice is the same items; it leaves when the item is placed, declined, receipted or disclosed
  assert.deepEqual(ids(w.read("olga")), ids(olga));
  w.fakes.docket.coreDue = () => ({ ok: true, items: due.slice(1), count: due.length - 1, wrote: false });
  assert.ok(!ids(w.read("olga")).includes("OBLIGATION::docket-core-due::CASE-1::response::DKT-2026-0001"), "done, it leaves");
  // hank owns the project: he is told of its case
  w.fakes.docket.coreDue = () => ({ ok: true, items: due, count: due.length, wrote: false });
  assert.deepEqual(ids(w.read("hank")), ["OBLIGATION::docket-core-due::CASE-H::response::DKT-2026-0004"]);
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
  assert.match(wd.summary, /Was the contract bid\?/); assert.match(wd.detail, /editions 1, 2/); assert.match(ct.detail, /edition 2/);
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
