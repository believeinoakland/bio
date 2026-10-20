/* T51 fix round, B7 (K4233): queue R12 (the members feed's items carry the door their producer declared, and their words' keys),
   R60 (a failed feed's row names the read that refused and its code) and R91 (the members feed is a row with its time). The
   producers are stubbed, so every answer here is this module's; the door is read from the item, never from a hand list. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { Queue } from "../../../src/queue/index.mjs";

const FACTS = { objective_gap: { bound: 50, truncated: false }, contradiction: { bound: 50, truncated: false }, dispositions: [] };
const stub = (a, it) => ({ summary: "an item", detail: "about it", basis: { source: "members", detail: "stubbed" },
  age: { state: "determined", since: iso(NOW - 1000), ms: 1000 }, assignee: null, assignee_role: null,
  options: [], case: a.homesOf(it.subjects || []), ...it, subjects: undefined });
/** A world whose producers answer `items` and `facts`, with alice a member of one project. */
function setup({ facts = {}, items = [] } = {}) {
  const w = world({ producers: { feedItems: (a) => ({ facts: { ...FACTS, ...facts }, items: items.map((it) => stub(a, it)) }) } });
  w.member("alice");
  w.bundle("PRJ-1", "project", { title: "Roof project" });
  w.join("PRJ-1", "alice");
  return w;
}
const row = (f, id) => f.feeds.find((x) => x.feed === id);
const itemOf = (f, id) => f.items.find((x) => x.id === id);

/* the members feed's items as queue-producers R46–R48 mint them: a door declared on the item, and the keys of its words */
const ENDORSE = { id: "OBLIGATION::endorsement-owed::admin::carol::alice", class: "OBLIGATION", kind: "endorsement-owed",
  door: "adminendorse", summary_key: "queue.endorsement-owed.summary", detail_key: "queue.endorsement-owed.detail" };
const OWNER_VOTE = { id: "OBLIGATION::endorsement-owed::owner::PRJ-1::add:carol::alice", class: "OBLIGATION", kind: "endorsement-owed",
  door: ["projectowneradd", "projectownerremove"], summary_key: "queue.endorsement-owed.owner.summary.add",
  detail_key: "queue.endorsement-owed.owner.detail" };
const EXPERTISE = { id: "OBLIGATION::expertise-confirmation-owed::bob::Rust", class: "OBLIGATION", kind: "expertise-confirmation-owed",
  door: "expertiseconfirm", summary_key: "queue.expertise-confirmation-owed.summary", detail_key: "queue.expertise-confirmation-owed.detail" };

test("R12: a members-feed item carries the door its producer declared, and its summary and detail keys, as minted (the door is read from the item, never a hand list)", () => {
  const f = setup({ items: [ENDORSE, OWNER_VOTE, EXPERTISE] }).feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  const e = itemOf(f, ENDORSE.id);
  assert.equal(e.door, "adminendorse");
  assert.deepEqual([e.summary_key, e.detail_key], [ENDORSE.summary_key, ENDORSE.detail_key]);
  assert.equal(e.disposition.instead, "adminendorse", "the disposition's door is the producer's, not the kind's hand list");
  assert.deepEqual(itemOf(f, OWNER_VOTE.id).disposition.instead, ["projectowneradd", "projectownerremove"], "a list is led by its first name");
  assert.deepEqual([itemOf(f, OWNER_VOTE.id).door, itemOf(f, OWNER_VOTE.id).summary_key], [OWNER_VOTE.door, OWNER_VOTE.summary_key]);
  assert.equal(itemOf(f, EXPERTISE.id).disposition.instead, "expertiseconfirm");
});

test("R12 (control): a members-feed item that declares no door takes the door the kind's rule gives, and a declared door is never read from another item", () => {
  const { door: _, ...bare } = ENDORSE;
  const bareId = "OBLIGATION::endorsement-owed::admin::dan::alice";
  const f = setup({ items: [{ ...bare, id: bareId }, ENDORSE] }).feed("alice");
  assert.equal(itemOf(f, bareId).door, undefined, "an item the producer did not declare carries no door");
  assert.equal(itemOf(f, bareId).disposition.instead, Queue.doorOf("endorsement-owed"));
  assert.equal(itemOf(f, ENDORSE.id).disposition.instead, "adminendorse");
});

test("R60: a failed feed's row names the read that refused and its code; a failure that names neither carries neither key (control)", () => {
  const f = setup({ facts: { failed: [
    { feed: "contradictions", reason: "undetermined", read: "contradiction.conflictNotices", code: "NOT_A_PARTICIPANT" },
    { feed: "sources", reason: "threw" },
    { feed: "members", reason: "threw", read: "member-roster.endorsementsOwed" },
  ] } }).feed("alice");
  assert.deepEqual(row(f, "contradictions"), { feed: "contradictions", classes: ["OBLIGATION", "FINDING"], answered: false,
    failed: ["undetermined"], ms: null, read: "contradiction.conflictNotices", code: "NOT_A_PARTICIPANT" });
  assert.deepEqual(Object.keys(row(f, "sources")), ["feed", "classes", "answered", "failed", "ms"]);
  assert.deepEqual([row(f, "members").read, row(f, "members").code, "code" in row(f, "members")], ["member-roster.endorsementsOwed", undefined, false]);
});

test("R60: the first failure that names a read is the one the row carries; the same feed's later entries add codes only", () => {
  const f = setup({ facts: { failed: [
    { feed: "contradictions", reason: "undetermined", read: "contradiction.candidatesFor", code: "BAD" },
    { feed: "contradictions", reason: "threw", read: "case-tensions.caseTensions" },
  ] } }).feed("alice");
  assert.deepEqual([row(f, "contradictions").read, row(f, "contradictions").code, row(f, "contradictions").failed],
    ["contradiction.candidatesFor", "BAD", ["undetermined", "threw"]]);
});

test("R60: the members feed is a row for the answer, classed OBLIGATION, answered unless it failed or was not composed", () => {
  const f = setup().feed("alice");
  assert.deepEqual(row(f, "members"), { feed: "members", classes: ["OBLIGATION"], answered: true, failed: [], ms: null });
  const g = setup({ facts: { absent: ["members"] } }).feed("alice");
  assert.equal(row(g, "members").answered, false);
});

test("R91: the members feed's row states the time its read took, as queue-producers publishes it in facts.ms (null where none is stated)", () => {
  const f = setup({ facts: { ms: { members: 9.5 } } }).feed("alice");
  assert.equal(row(f, "members").ms, 9.5);
  const g = setup({ facts: { ms: { members: -4 } } }).feed("alice");
  assert.equal(row(g, "members").ms, null, "a figure below zero is never stated");
});
