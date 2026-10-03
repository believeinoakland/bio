/* Watched cases at their publishers (R34, R35; N534, DEC-101 (3), DEC-116 item 8) at feedItems' interface.
   `reevaluation.citedCaseDependents` (its R33) and `case-import.watchItems` (its R20) are fakes answering in the shapes
   their requirements and code publish, filled per test; membership is real, so whether the watch's setter is still an
   active member (membership R68) and who the administrators are (its R86) are its own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { DOCKET_UNREADABLE } from "../../../src/docket/index.mjs";

const DAY = 86400000;
const ofKind = (r, re) => r.items.filter((i) => re.test(i.kind));
const ids = (r, re) => ofKind(r, re).map((i) => i.id).sort();
const FORBIDDEN = /\b(obligation|condition|subject|bundle)s?\b/i;

/* R34's world: alice joins PRJ-1, which cites INQ-1; INQ-2 is cited by PRJ-2. */
function citedWorld(entries) {
  const asked = [];
  const w = world({ reevaluation: { citedCaseDependents: (a) => { asked.push(a); return entries(a); } } });
  w.member("alice");
  w.bundle("PRJ-1", "project"); w.bundle("PRJ-2", "project");
  w.bundle("INQ-1", "inquiry", { title: "Was the contract bid?" }); w.bundle("INQ-2", "inquiry");
  w.join("PRJ-1", "alice"); w.join("PRJ-2", "alice"); w.cite("PRJ-1", "INQ-1"); w.cite("PRJ-2", "INQ-2");
  return { w, asked };
}
const IMP = "a".repeat(64);
const move = (dependent, kind, seq, extra = {}) => ({ dependent, move: `IMM-${seq}`, import: IMP, group: "eastbay-watch",
  case: "CASE-7", kind, edition: kind === "edition" ? 3 : 2, seq, date: "2026-08-20", since: iso(NOW - 2 * DAY),
  ...(kind === "edition" ? { what_changed: "a finding was corrected" } : { reason: "a source was retracted" }),
  key_listed: true, taken_back: null, legs: [{ target: `imported:${IMP}:F-1@2`, ord: 0, cited_edition: 2 }],
  detail: "the publisher moved", ...extra });

test("R34 (reevaluation R33; DEC-101 (3)): FINDINGs cited-newer-edition and cited-edition-withdrawn, one per (dependent, move) citedCaseDependents answers, keyed FINDING::<kind>::<dependent>::<import>#<seq>, homed under the dependent's ancestors, naming group, case, cited edition, edition named and the quoted words", () => {
  const all = [
    move("INQ-1", "edition", 4),
    move("INQ-1", "withdrawal", 6, { key_listed: false, taken_back: { seq: 9, date: "2026-08-25" } }),
    move("INQ-2", "withdrawal", 5, { edition: "all", group: null, case: null, since: "not an instant" }),
    { ...move("INQ-2", "edition", 8), kind: "take-back" }];
  const { w, asked } = citedWorld((a) => a.after ? { ok: true, entries: all.slice(2), truncated: false, cursor: null }
    : { ok: true, entries: all.slice(0, 2), truncated: true, cursor: "INQ-1#IMM-6" });
  const r = w.read("alice");
  assert.deepEqual(asked.slice(0, 2), [{ after: null, limit: 200, viewer: "member:alice" }, { after: "INQ-1#IMM-6", limit: 200, viewer: "member:alice" }],
    "reevaluation's read, under the viewer (it withholds a hidden dependent and counts none), its cursor followed");
  assert.deepEqual(ids(r, /^cited-(newer-edition|edition-withdrawn)$/), [
    `FINDING::cited-edition-withdrawn::INQ-1::${IMP}#6`, `FINDING::cited-edition-withdrawn::INQ-2::${IMP}#5`,
    `FINDING::cited-newer-edition::INQ-1::${IMP}#4`], "by the move's kind; an entry that is no move is no item");
  const m = byId(r);
  const ne = m[`FINDING::cited-newer-edition::INQ-1::${IMP}#4`], wd = m[`FINDING::cited-edition-withdrawn::INQ-1::${IMP}#6`];
  const all2 = m[`FINDING::cited-edition-withdrawn::INQ-2::${IMP}#5`];
  assert.deepEqual([ne.class, wd.class, all2.class], ["FINDING", "FINDING", "FINDING"]);
  assert.deepEqual(ne.subject, { kind: "bundle", id: "INQ-1", import: IMP, group: "eastbay-watch", case: "CASE-7", move: "IMM-4",
    seq: 4, cited_editions: [2], edition: 3 });
  assert.deepEqual(ne.case.ancestors.map((a) => [a.id, a.depth]), [["INQ-1", 0], ["PRJ-1", 1]], "homed under the dependent and its ancestors");
  assert.deepEqual(all2.case.ancestors.map((a) => a.id), ["INQ-2", "PRJ-2"]);
  assert.deepEqual(ne.options, [{ id: "opt", on: ["INQ-1"] }]);
  assert.deepEqual(ne.age, { state: "determined", since: iso(NOW - 2 * DAY), ms: 2 * DAY }, "aged from the cause's since");
  assert.equal(all2.age.state, "undetermined");
  // the detail: group, case, cited edition, edition named, the quoted words
  for (const [it, words] of [[ne, [/eastbay-watch/, /case CASE-7/, /cites edition 2/, /edition 3/, /"a finding was corrected"/]],
                             [wd, [/eastbay-watch/, /case CASE-7/, /edition 2/, /withdrew edition 2/, /"a source was retracted"/]]])
    for (const re of words) assert.match(`${it.summary} ${it.detail}`, re, `${it.id}: ${re}`);
  assert.doesNotMatch(ne.detail, /signing key/, "a listed key is not remarked on");
  assert.match(wd.detail, /signing key is not among the keys the imported case file lists/, "key_listed false is said");
  assert.match(wd.detail, /taken this entry back \(entry 9, dated 2026-08-25\)/, "a move taken back is said");
  assert.doesNotMatch(ne.detail, /taken this entry back/);
  assert.match(all2.detail, /withdrew every edition/); assert.match(all2.summary, /another group/, "group withheld: unnamed");
  assert.equal(ne.basis.source, "reevaluation.citedCaseDependents"); assert.equal(ne.basis.what_changed, "a finding was corrected");
  assert.equal(wd.basis.reason, "a source was retracted"); assert.equal(wd.basis.key_listed, false);
  for (const it of [ne, wd, all2]) for (const s of [it.summary, it.detail, it.basis.detail]) assert.doesNotMatch(s, FORBIDDEN, s);
  // raised once: the same read twice is the same items; it leaves when the cause closes (the read no longer answers it)
  assert.deepEqual(ids(w.read("alice"), /^cited-/), ids(r, /^cited-/));
  w.fakes.reevaluation.citedCaseDependents = () => ({ ok: true, entries: all.slice(1, 2), truncated: false, cursor: null });
  assert.deepEqual(ids(w.read("alice"), /^cited-/), [`FINDING::cited-edition-withdrawn::INQ-1::${IMP}#6`]);
  // accepted work absent: nothing answered, nothing minted
  w.fakes.reevaluation.citedCaseDependents = () => ({ ok: true, entries: [], truncated: false, cursor: null, accepted_work_absent: true });
  assert.deepEqual(ids(w.read("alice"), /^cited-/), []);
  // at most 20 pages are followed, and a cut is stated on every item
  let n = 0;
  w.fakes.reevaluation.citedCaseDependents = () => { n += 1;
    return { ok: true, entries: [move("INQ-1", "edition", n)], truncated: true, cursor: `INQ-1#IMM-${n}` }; };
  const cut = ofKind(w.read("alice"), /^cited-/);
  assert.equal(n, 20); assert.equal(cut.length, 20); assert.ok(cut.every((i) => i.basis.bound.truncated === true));
});

/* R35's world: alice set the watch on IMP; ruth set one on IMP2 and was then revoked; ada the administrator; bob a member. */
function watchWorld(answer) {
  const asked = [];
  const w = world({ caseImport: { watchItems: (a) => { asked.push(a); return answer(a); } } });
  w.member("ada", { role: "admin" }); w.member("alice"); w.member("bob"); w.member("ruth", { status: "revoked" });
  return { w, asked };
}
const IMP2 = "b".repeat(64);
const head = (imp, set_by, seq, seen_at = iso(NOW - 5 * DAY)) => ({ import: imp, group: "eastbay-watch", case: imp === IMP ? "CASE-7" : "CASE-8",
  set_by, seq, seen_at });

test("R35 (case-import R20): the watch's items go to the member who set the watch, else (no longer active) the administrators, and nobody else; each item's subject the import, with no project home", () => {
  const answer = {
    entries: [
      { ...head(IMP, "alice", 1), kind: "edition", edition: 3, date: "2026-08-20", key_listed: true, move: true, what_changed: "a finding was corrected", taken_back: null },
      { ...head(IMP, "alice", 2), kind: "response", edition: 3, date: "2026-08-21", key_listed: false, move: false, taken_back: null },
      { ...head(IMP, "alice", 3), kind: "withdrawal", edition: "all", date: "2026-08-22", key_listed: true, move: true, reason: "retracted", taken_back: { seq: 4, date: "2026-08-23" } },
      { ...head(IMP2, "ruth", 1), kind: "reaction", edition: 1, date: "2026-08-24", key_listed: true, move: false, taken_back: null }],
    refused: [
      { ...head(IMP, "alice", 5, iso(NOW - 4 * DAY)), failed: "C-130.15", detail: "the signature does not verify" },
      { ...head(IMP, "alice", 5, iso(NOW - 6 * DAY)), failed: "C-130.16", detail: "a second copy" },
      { ...head(IMP, "alice", null), failed: "C-130.14", detail: "no seq" }],
    unreadable: [{ import: IMP, group: "eastbay-watch", case: "CASE-7", set_by: "alice", docket: "https://x.example/?op=docketpublic",
                   sentence: DOCKET_UNREADABLE, reason: "not_json", at: iso(NOW - 3 * DAY) }] };
  const { w, asked } = watchWorld(() => answer);
  const KINDS = /^(followed-case-entry|cited-docket-entry-refused|cited-docket-unreadable)$/;
  const alice = w.read("alice");
  assert.deepEqual(asked.at(-1), { viewer: "member:alice" }, "case-import's read, under the viewer");
  assert.deepEqual(ids(alice, KINDS), [`CONDITION::cited-docket-unreadable::${IMP}`, `FINDING::cited-docket-entry-refused::${IMP}#5`,
    `FINDING::cited-docket-entry-refused::${IMP}#unnumbered`, `FINDING::followed-case-entry::${IMP}#1`,
    `FINDING::followed-case-entry::${IMP}#2`, `FINDING::followed-case-entry::${IMP}#3`],
    "every verified entry seen, a move or not; each refused entry; the unreadable watch");
  assert.deepEqual(ids(w.read("ada"), KINDS), [`FINDING::followed-case-entry::${IMP2}#1`], "a setter no longer active: the administrators");
  assert.deepEqual(ids(w.read("bob"), KINDS), [], "nobody else");
  assert.deepEqual(ids(w.read(null, "class:admin"), KINDS), [], "a caller with no member is none of them");
  const m = byId(alice);
  const e1 = m[`FINDING::followed-case-entry::${IMP}#1`], e2 = m[`FINDING::followed-case-entry::${IMP}#2`], e3 = m[`FINDING::followed-case-entry::${IMP}#3`];
  for (const it of [e1, e2, e3, m[`FINDING::cited-docket-entry-refused::${IMP}#5`], m[`CONDITION::cited-docket-unreadable::${IMP}`]]) {
    assert.deepEqual(it.subject, { kind: "import", id: IMP, group: "eastbay-watch", case: "CASE-7" }, it.id);
    assert.deepEqual(it.case.ancestors, [], `${it.id}: no project home`); assert.equal(it.case.ungrouped, true);
    assert.deepEqual(it.recipients, ["alice"]); assert.equal(it.basis.recipients_rule, "watch_setter");
    assert.equal(it.basis.source, "case-import.watchItems");
    for (const s of [it.summary, it.detail, it.basis.detail, ...it.options.map((o) => o.label)]) assert.doesNotMatch(s, FORBIDDEN, `${it.id}: "${s}"`);
  }
  assert.equal(byId(w.read("ada"))[`FINDING::followed-case-entry::${IMP2}#1`].basis.recipients_rule, "administrators");
  // followed-case-entry: kind, edition, date, key_listed; a move's words quoted
  assert.equal(e1.class, "FINDING");
  for (const re of [/edition 3/, /2026-08-20/, /signing key is among the keys/, /"a finding was corrected"/]) assert.match(e1.detail, re);
  for (const re of [/kind response/, /edition 3/, /2026-08-21/, /signing key is not among the keys/, /nothing resting on the case is re-evaluated/]) assert.match(e2.detail, re);
  for (const re of [/withdrawal of every edition/, /"retracted"/, /taken this entry back \(entry 4/]) assert.match(e3.detail, re);
  assert.deepEqual([e2.basis.entry_kind, e2.basis.move, e2.basis.key_listed], ["response", false, false]);
  // refused: the check failed named, the copies of one seq one item
  const rf = m[`FINDING::cited-docket-entry-refused::${IMP}#5`];
  assert.equal(rf.class, "FINDING");
  assert.deepEqual(rf.basis.failed, ["C-130.15", "C-130.16"]); assert.match(rf.detail, /C-130\.15, C-130\.16/);
  assert.match(m[`FINDING::cited-docket-entry-refused::${IMP}#unnumbered`].detail, /C-130\.14/);
  // unreadable: a CONDITION opening with docket's sentence, its reason and instant, aged from the read
  const un = m[`CONDITION::cited-docket-unreadable::${IMP}`];
  assert.equal(un.class, "CONDITION");
  assert.ok(un.detail.startsWith(DOCKET_UNREADABLE), "its detail opens with DOCKET_UNREADABLE's sentence");
  assert.equal(DOCKET_UNREADABLE, "Could not read the publisher's docket");
  assert.match(un.detail, /not_json/); assert.ok(un.detail.includes(iso(NOW - 3 * DAY)));
  assert.match(un.detail, /never that nothing changed/);
  assert.deepEqual(un.age, { state: "determined", since: iso(NOW - 3 * DAY), ms: 3 * DAY });
  assert.deepEqual(un.options.map((o) => o.id), ["importwatch", "importunwatch"], "R12: a member's act changes it");
  assert.deepEqual(e1.options.map((o) => o.id), ["importedcase"]);
  // raised once: the same read twice is the same items; the unreadable leaves when a read succeeds or the watch ends
  assert.deepEqual(ids(w.read("alice"), KINDS), ids(alice, KINDS));
  answer.unreadable = [];
  assert.ok(!ids(w.read("alice"), KINDS).some((id) => id.startsWith("CONDITION::")));
  // a viewer case-import answers empty yields nothing
  w.fakes.caseImport.watchItems = () => ({ entries: [], refused: [], unreadable: [] });
  assert.deepEqual(ids(w.read("alice"), KINDS), []);
});

test("R35, R34 (K1339, K1366 F1): a verified entry that is not a publisher move reaches only the watch's setter, never as a cause of re-evaluation", () => {
  const { w } = watchWorld(() => ({ entries: [{ ...head(IMP, "alice", 2), kind: "response", edition: 3, date: "2026-08-21",
    key_listed: true, move: false, taken_back: null }], refused: [], unreadable: [] }));
  w.bundle("INQ-1", "inquiry"); w.bundle("PRJ-1", "project"); w.join("PRJ-1", "bob"); w.cite("PRJ-1", "INQ-1");
  /* reevaluation answers no move for a response: R34 mints nothing; only R35's item, alice's alone */
  for (const who of ["alice", "bob", "ada"]) {
    const r = w.read(who);
    assert.deepEqual(ids(r, /^cited-(newer-edition|edition-withdrawn)$/), [], `${who}: no re-evaluation item`);
  }
  assert.deepEqual(ids(w.read("alice"), /^followed-case-entry$/), [`FINDING::followed-case-entry::${IMP}#2`]);
  assert.deepEqual(ids(w.read("bob"), /^followed-case-entry$/), []);
});

test("R35 (N546; case-import R20's seen_at, K1419): each entry's item ages from the instant this copy read it, never the publisher's date nor this read's clock; a refused entry's copies age from the first read; unreadable seen_at is undetermined", () => {
  const answer = {
    entries: [
      { ...head(IMP, "alice", 1, iso(NOW - 2 * DAY)), kind: "edition", edition: 3, date: "2026-08-20", key_listed: true, move: true, what_changed: "w", taken_back: null },
      { ...head(IMP, "alice", 2, iso(NOW - 7 * DAY)), kind: "response", edition: 3, date: "2026-08-21", key_listed: true, move: false, taken_back: null },
      /* a later read seeing seq 2 again under a replaced watch: one item, aged from the first read */
      { ...head(IMP, "alice", 2, iso(NOW - DAY)), kind: "response", edition: 3, date: "2026-08-21", key_listed: true, move: false, taken_back: null },
      { ...head(IMP, "alice", 3, null), kind: "reaction", edition: 3, date: "2026-08-22", key_listed: true, move: false, taken_back: null },
      { ...head(IMP, "alice", 4, "not an instant"), kind: "disclosure", edition: 3, date: "2026-08-23", key_listed: true, move: false, taken_back: null }],
    refused: [
      { ...head(IMP, "alice", 5, iso(NOW - 3 * DAY)), failed: "C-130.15", detail: "a" },
      { ...head(IMP, "alice", 5, iso(NOW - 9 * DAY)), failed: "C-130.16", detail: "b" },
      { ...head(IMP, "alice", 5, null), failed: "C-130.17", detail: "c" },
      { ...head(IMP, "alice", 6, null), failed: "C-130.15", detail: "d" },
      { ...head(IMP, "alice", 7, null), failed: "C-130.15", detail: "e" },
      { ...head(IMP, "alice", 7, iso(NOW - 8 * DAY)), failed: "C-130.16", detail: "f" }],
    unreadable: [] };
  const { w } = watchWorld(() => answer);
  const m = byId(w.read("alice"));
  const f = (seq) => m[`FINDING::followed-case-entry::${IMP}#${seq}`], rf = (seq) => m[`FINDING::cited-docket-entry-refused::${IMP}#${seq}`];
  assert.deepEqual(f(1).age, { state: "determined", since: iso(NOW - 2 * DAY), ms: 2 * DAY }, "from seen_at, not the publisher's date 2026-08-20");
  assert.equal(f(1).basis.seen_at, iso(NOW - 2 * DAY));
  assert.deepEqual(f(2).age, { state: "determined", since: iso(NOW - 7 * DAY), ms: 7 * DAY }, "the first read that saw it");
  for (const seq of [3, 4]) {
    assert.deepEqual([f(seq).age.state, f(seq).age.reason], ["undetermined", "no_seen_instant"], `seq ${seq}: never this read's clock`);
    assert.ok(!("since" in f(seq).age) && !("ms" in f(seq).age));
  }
  assert.deepEqual(rf(5).age, { state: "determined", since: iso(NOW - 9 * DAY), ms: 9 * DAY }, "a refused entry's copies: from the first read");
  assert.equal(rf(5).basis.seen_at, iso(NOW - 9 * DAY));
  assert.deepEqual(rf(5).basis.failed, ["C-130.15", "C-130.16", "C-130.17"]);
  assert.deepEqual([rf(6).age.state, rf(6).age.reason], ["undetermined", "no_seen_instant"]);
  assert.deepEqual(rf(7).age, { state: "determined", since: iso(NOW - 8 * DAY), ms: 8 * DAY }, "an undated copy first, a dated one later: the dated one");
  /* the age is the read's instant less seen_at, so a later read is older by exactly the interval, and the item the same */
  const later = byId(w.read("alice", "member:alice", { now: NOW + DAY }));
  assert.equal(later[`FINDING::followed-case-entry::${IMP}#1`].age.ms, 3 * DAY);
  assert.equal(later[`FINDING::cited-docket-entry-refused::${IMP}#5`].age.ms, 10 * DAY);
  for (const it of [f(1), f(3), rf(5), rf(6)]) assert.doesNotMatch(it.age.detail || "", /\b(obligation|condition|subject|bundle)s?\b/i);
});
