/* R8 (fix round 2, C69; walk CA60): one item per matter. A to do or a notice the feed answers is one item for the matter it is
   about: several facts of one action's deadline are one to do, and two equal notices are one. Each test names R8, whose answer it
   amends. The providers are the fakes `world` holds; `actionProducers.actionItems` and `machinery` are the feeds that gave the
   walk its repeats. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";

/* action-producers' local-fact-due item as it answers it (R7): one per fact and status, its subject the first action that reads the fact. */
const fact = (action, path, status) => ({
  id: `OBLIGATION::local-fact-due::${path}::${status}`, class: "OBLIGATION", kind: "local-fact-due",
  case: { state: "determined", ungrouped: true, reasons: [], depth_bound: null, ancestors: [] },
  subject: { kind: "action", id: action, project: null, path, fact: path.split("/").pop(), status, why: null },
  summary: `deadline on ${action} (${status})`, detail: "a deadline on this action", basis: { path, status, actions: [action] },
  age: { state: "undetermined" }, recipients: ["alice"], options: [] });
const notice = (id) => ({ id, class: "FINDING", kind: "interest-check-noticed", case: { state: "determined", ungrouped: true, reasons: [], depth_bound: null, ancestors: [] },
  subject: { kind: "information", id: "INF-1" }, summary: "the same thing was noticed", detail: "noticed", basis: { source: "x" }, age: { state: "undetermined" },
  recipients: ["alice"], options: [] });
const withAction = (items) => world({ actionProducers: { actionItems: () => ({ items, facts: {} }) } });
const idsOf = (r, kind) => r.items.filter((i) => i.kind === kind).map((i) => i.id);

test("R8, R52 (C69): one action's deadline whose facts stand in four statuses is one to do, not four", () => {
  const w = withAction([fact("ACT-1", "p/a/hours", "unconfirmed"), fact("ACT-1", "p/a/holidays", "disputed"),
    fact("ACT-1", "p/a/time_zone", "unconfirmed"), fact("ACT-1", "p/a/hours", "disputed")]);
  const r = w.read("alice");
  const got = r.items.filter((i) => i.kind === "local-fact-due");
  assert.equal(got.length, 1, "one item for the one matter");
  assert.equal(got[0].subject.id, "ACT-1");
  assert.deepEqual(got[0].basis.statuses.sort(), ["disputed", "unconfirmed"], "the statuses it stands for are kept on the basis");
  assert.deepEqual(got[0].basis.paths.sort(), ["p/a/holidays", "p/a/hours", "p/a/time_zone"], "so are the facts, once each");
});

test("R8, R52 (C69): which of the repeats stands is the same at every read, whatever order the provider answered them in", () => {
  const items = [fact("ACT-1", "p/a/hours", "unconfirmed"), fact("ACT-1", "p/a/holidays", "disputed")];
  const a = withAction(items).read("alice"), b = withAction([...items].reverse()).read("alice");
  assert.deepEqual(idsOf(a, "local-fact-due"), idsOf(b, "local-fact-due"));
});

test("R8, R52 (C69): two equal notices are one item; control: two different matters are two, and two items that differ only in their id but say the same thing about the same subject are one", () => {
  const same = withAction([notice("FINDING::interest-check-noticed::1"), notice("FINDING::interest-check-noticed::1")]).read("alice");
  assert.deepEqual(idsOf(same, "interest-check-noticed"), ["FINDING::interest-check-noticed::1"], "the same id twice");
  const twin = withAction([notice("FINDING::interest-check-noticed::1"), notice("FINDING::interest-check-noticed::2")]).read("alice");
  assert.equal(idsOf(twin, "interest-check-noticed").length, 1, "equal in everything a member reads and the subject: one");
  const other = { ...notice("FINDING::interest-check-noticed::3"), subject: { kind: "information", id: "INF-2" } };
  assert.equal(idsOf(withAction([notice("FINDING::interest-check-noticed::1"), other]).read("alice"), "interest-check-noticed").length, 2, "another subject is another matter");
});

test("R8, R52 (C69): control: two actions' deadlines are two matters, two items; a fact of one action never absorbs another's", () => {
  const w = withAction([fact("ACT-1", "p/a/hours", "unconfirmed"), fact("ACT-2", "p/b/hours", "unconfirmed"), fact("ACT-2", "p/b/holidays", "disputed")]);
  const got = w.read("alice").items.filter((i) => i.kind === "local-fact-due");
  assert.deepEqual(got.map((i) => i.subject.id).sort(), ["ACT-1", "ACT-2"]);
  assert.equal(got.find((i) => i.subject.id === "ACT-1").basis.statuses.length, 1);
});

test("R8, R52 (C69): a repeated item names each repeat only once in the answer, and the other items and their order are as before", () => {
  const w = withAction([fact("ACT-1", "p/a/hours", "unconfirmed"), notice("N-1"), fact("ACT-1", "p/a/holidays", "disputed"), notice("N-2")]);
  w.bundle("INF-1");
  const r = w.read("alice");
  assert.deepEqual(r.items.map((i) => i.kind), ["local-fact-due", "interest-check-noticed"], "first appearance keeps the place");
  assert.equal(new Set(r.items.map((i) => i.id)).size, r.items.length, "no id twice");
  void NOW; void iso;
});
