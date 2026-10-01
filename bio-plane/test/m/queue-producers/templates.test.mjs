/* Filing templates and local facts (R20, R21; K921) at feedItems' interface. Each provider is a fake answering in the shape
   its requirements publish (filing-templates R20; local-facts R4; action-clocks R11), filled per test; membership is real,
   so R21's recipients (the author, else the project's owners, else the administrators: membership R65, R86) are its own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const DAY = 86400000;
const page = (items, extra = {}) => ({ ok: true, items, limit: 500, truncated: false, cursor: null, ...extra });
const ofKind = (r, kind) => r.items.filter((i) => i.kind === kind);

/* Three members and an administrator; PRJ-1 owned by olga. */
function people(fakes) {
  const w = world(fakes);
  w.member("ada", { role: "admin" }); w.member("alice"); w.member("bob"); w.member("olga");
  w.bundle("PRJ-1", "project"); w.bundle("ACT-1", "action"); w.bundle("ACT-2", "action"); w.bundle("ACT-3", "action");
  w.join("PRJ-1", "olga", { owner: true }); w.join("PRJ-1", "alice"); w.join("PRJ-1", "bob");
  return w;
}

test("R20: one OBLIGATION per (version, member) reviewsRequested answers the viewer, keyed OBLIGATION::template-review-requested::<template>@<version>::<member>, to that member and nobody else, until reviewed or out of review", () => {
  const asked = [];
  const pairs = [
    { template: "TPL-a", version: "TPL-a@2", name: "Records request", kind: "records_request", member: "alice", member_name: "Alice",
      asked_by: { id: "olga", name: "Olga" }, asked_at: iso(NOW - 2 * DAY) },
    { template: "TPL-a", version: "TPL-a@2", name: "Records request", kind: "records_request", member: "bob", member_name: "Bob",
      asked_by: { id: "olga", name: "Olga" }, asked_at: iso(NOW - 2 * DAY) },
    { template: "TPL-b", version: "TPL-b@1", name: "Comment letter", kind: "public_comment", member: "alice", member_name: "Alice",
      asked_by: { id: "bob", name: "Bob" }, asked_at: "not an instant" }];
  let answered = pairs;
  const w = people({ filingTemplates: { reviewsRequested: (a) => { asked.push(a);
    /* two pages: the first truncated with a cursor, the second the rest */
    return a.after ? page(answered.slice(2)) : page(answered.slice(0, 2), { truncated: answered.length > 2, cursor: answered.length > 2 ? "TPL-a@2#bob" : null }); } } });
  const ids = (r) => ofKind(r, "template-review-requested").map((i) => i.id).sort();
  const alice = w.read("alice");
  assert.deepEqual(asked.slice(0, 2).map((a) => [a.after, a.viewer]), [[null, "member:alice"], ["TPL-a@2#bob", "member:alice"]],
    "the viewer is filing-templates' to read by, and its cursor is followed");
  assert.deepEqual(ids(alice), ["OBLIGATION::template-review-requested::TPL-a@2::alice", "OBLIGATION::template-review-requested::TPL-b@1::alice"]);
  assert.deepEqual(ids(w.read("bob")), ["OBLIGATION::template-review-requested::TPL-a@2::bob"]);
  assert.deepEqual(ids(w.read("olga")), [], "never to the member who asked, nor the project's owner");
  assert.deepEqual(ids(w.read("ada")), [], "nor an administrator");
  assert.deepEqual(ids(w.read(null, "class:admin")), [], "nor a caller with no member");
  const it = byId(alice)["OBLIGATION::template-review-requested::TPL-a@2::alice"];
  assert.deepEqual([it.class, it.kind], ["OBLIGATION", "template-review-requested"]);
  assert.deepEqual(it.subject, { kind: "template_version", id: "TPL-a@2", template: "TPL-a", name: "Records request",
    template_kind: "records_request", asked_by: { id: "olga", name: "Olga" } }, "its subject the version, naming its name, kind and asker");
  assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 2 * DAY), ms: 2 * DAY }, "aged from the instant asked");
  assert.equal(byId(alice)["OBLIGATION::template-review-requested::TPL-b@1::alice"].age.state, "undetermined");
  assert.deepEqual(it.recipients, ["alice"]);
  assert.deepEqual(it.options, [{ id: "templatereview", label: "Review this template version", weight: "single" }]);
  assert.equal(it.basis.source, "filing-templates.reviewsRequested"); assert.equal(it.basis.bound.truncated, false);
  assert.ok(it.summary.includes("Olga") && it.summary.includes("Records request"));
  // raised once: the same read twice is the same items
  assert.deepEqual(ids(w.read("alice")), ids(alice));
  // it leaves when she reviews the present text, or the version leaves in_review (the read no longer answers it)
  answered = pairs.filter((p) => !(p.member === "alice" && p.version === "TPL-a@2"));
  assert.deepEqual(ids(w.read("alice")), ["OBLIGATION::template-review-requested::TPL-b@1::alice"]);
  answered = [];
  assert.deepEqual(ids(w.read("alice")), []);
});

test("R21: one OBLIGATION per fact factsDue answers over the paths calendarFactsRead answers the viewer, keyed OBLIGATION::local-fact-due::<path>, to R15's recipients of the actions that read it", () => {
  const H25 = "profile:p/holidays/2025/*", H26 = "profile:p/holidays/2026/*", HRS = "profile:p/hours/clerk", TZ = "profile:p/time_zone";
  const reads = [];
  const facts = [];
  let paths = [
    { path: H25, actions: [{ action: "ACT-1", project: "PRJ-1", created_by: "alice" }, { action: "ACT-2", project: "PRJ-1", created_by: "token:member" }] },
    { path: H26, actions: [{ action: "ACT-1", project: "PRJ-1", created_by: "alice" }] },
    { path: HRS, actions: [{ action: "ACT-3", project: null, created_by: null }] },
    { path: TZ, actions: ["ACT-3"] }];
  const status = {
    [H25]: { path: H25, fact: { profile: "p", fact: "holidays", year: 2025 }, status: "unconfirmed", due: true,
             why: "no member has confirmed it; the year is due from 2024-11-01", latest: null, due_from: "2024-11-01" },
    [H26]: { path: H26, fact: { profile: "p", fact: "holidays", year: 2026 }, status: "disputed", due: true,
             why: "disputed by bob, 2026-08-30", latest: { act: "dispute", by: "bob", at: iso(NOW - 2 * DAY), how: "called" } },
    [HRS]: { path: HRS, fact: { profile: "p", fact: "hours" }, status: "unconfirmed", due: true, why: "the confirmation lapsed",
             latest: { act: "confirm", by: "alice", at: "2025-01-02T00:00:00Z", how: "page" },
             lapsed: { act: "confirm", by: "alice", at: "2025-01-02T00:00:00Z", how: "page" }, lapses_on: "2026-08-29" },
    [TZ]: { path: TZ, fact: { profile: "p", fact: "time_zone" }, status: "unconfirmed", due: true, why: "no member has confirmed it",
            latest: null } };
  const w = people({
    actionClocks: { calendarFactsRead: (a) => { reads.push(["calendar", a]); return { ok: true, as_of: "2026-09-01", paths, actions_limit: 500, truncated: false }; } },
    localFacts: { factsDue: (a) => { reads.push(["facts", a]); facts.push(a.paths);
      return { ok: true, due: a.paths.map((p) => status[p]).filter(Boolean), unknown: [], absent: [] }; } } });
  const ids = (r) => ofKind(r, "local-fact-due").map((i) => i.id).sort();
  const alice = w.read("alice");
  assert.deepEqual(reads.slice(0, 2), [["calendar", { viewer: "member:alice", now: NOW }], ["facts", { paths: [H25, H26, HRS, TZ], viewer: "member:alice" }]],
    "the paths are those calendarFactsRead answers the viewer, passed to factsDue");
  assert.deepEqual(ids(alice), [`OBLIGATION::local-fact-due::${H25}`, `OBLIGATION::local-fact-due::${H26}`],
    "the member who created an action that reads it");
  assert.deepEqual(ids(w.read("olga")), [`OBLIGATION::local-fact-due::${H25}`], "an action a machine created: its project's owners");
  assert.deepEqual(ids(w.read("ada")), [`OBLIGATION::local-fact-due::${HRS}`, `OBLIGATION::local-fact-due::${TZ}`],
    "no member author and no project (or an action named by id alone): the administrators");
  assert.deepEqual(ids(w.read("bob")), [], "a member who created no reading action, though he disputed one");
  assert.deepEqual(ids(w.read(null, "class:admin")), [], "a caller with no member is none of the members it goes to");
  const it = byId(alice)[`OBLIGATION::local-fact-due::${H25}`];
  assert.deepEqual([it.class, it.kind], ["OBLIGATION", "local-fact-due"]);
  assert.deepEqual(it.subject, { kind: "action", id: "ACT-1", project: "PRJ-1", path: H25, fact: status[H25].fact,
    status: "unconfirmed", why: status[H25].why }, "its subject the first reading action, naming the fact, its status and why it is due");
  assert.deepEqual(it.recipients, ["alice", "olga"], "R15's recipients of each reading action, together");
  assert.equal(it.basis.recipients_rule, "author+project_owners");
  assert.deepEqual(it.basis.actions, ["ACT-1", "ACT-2"]);
  assert.deepEqual(it.age, { state: "determined", since: "2024-11-01", ms: NOW - Date.parse("2024-11-01T00:00:00Z") }, "aged from the day it fell due");
  const disputed = byId(alice)[`OBLIGATION::local-fact-due::${H26}`];
  assert.equal(disputed.subject.status, "disputed");
  assert.deepEqual(disputed.age, { state: "determined", since: iso(NOW - 2 * DAY), ms: 2 * DAY }, "a dispute ages from the dispute");
  const ada = byId(w.read("ada"));
  assert.deepEqual(ada[`OBLIGATION::local-fact-due::${HRS}`].age, { state: "determined", since: "2026-08-29", ms: 3 * DAY },
    "a lapsed confirmation ages from the day it lapsed");
  assert.equal(ada[`OBLIGATION::local-fact-due::${TZ}`].age.state, "undetermined");
  assert.equal(ada[`OBLIGATION::local-fact-due::${HRS}`].basis.recipients_rule, "administrators");
  assert.deepEqual(it.options, [{ id: "factconfirm", label: "Confirm, correct or dispute this local fact", weight: "single" },
    { id: "opt", on: ["ACT-1"] }], "its door, the confirmation, beside the acts on the action");
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]], "homed under the action's project");
  assert.equal(it.basis.source, "local-facts.factsDue + action-clocks.calendarFactsRead");
  // raised once per fact and status: the same read twice is the same items, the status on each
  assert.deepEqual(ids(w.read("alice")), ids(alice));
  // it leaves when a member confirms or corrects the fact (factsDue no longer answers it) ...
  delete status[H25];
  assert.deepEqual(ids(w.read("alice")), [`OBLIGATION::local-fact-due::${H26}`]);
  // ... or no live action reads it (calendarFactsRead no longer lists it), and nothing is asked of local-facts then
  paths = [];
  const n = facts.length;
  assert.deepEqual(ids(w.read("alice")), []);
  assert.equal(facts.length, n, "with no path read, factsDue is not asked");
});
