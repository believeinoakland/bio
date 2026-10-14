/* T48-60 at queue's interface (R54; N1047, DEC-226 (1), K3189; N1036), over a stubbed `queue-producers.feedItems`
   (machinery-producers R11 is the producer of the item, tested there): the update to-do's kind is classed (R1), minted
   (R11), sorted among to-dos (R49), filed under "Your group's Civicsmith" by `sections`, given its door (R12, R28) and
   never muted (R19, R31); and N1036's re-test: the feed answers Home's "what needs the group", the items by kind and
   whose move (`assignee` and `assignee_role`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { QUEUE_SECTIONS } from "../../../src/queue/index.mjs";
import { classOfKind, QUEUE_OBLIGATION_KINDS } from "../../../src/queuestate.mjs";

const FACTS = { objective_gap: { bound: 50, truncated: false }, unattributed: { count: 0, inquiries: [] },
                contradiction: { bound: 50, truncated: false }, dispositions: [] };
const UPDATE_ID = "OBLIGATION::update-ready::1.76.0";
const update = (version = "1.76.0", over = {}) => ({ id: `OBLIGATION::update-ready::${version}`, class: "OBLIGATION", kind: "update-ready",
  subject: { kind: "release", id: version }, summary: "a release is ready", detail: { version, date: "2026-10-12", security: false },
  basis: { source: "machinery-producers", detail: "derived on read from the notice read" },
  age: { state: "determined", since: iso(NOW - 3600000), ms: 3600000 }, assignee: "alice", assignee_role: "admin",
  options: [{ id: "updatelater", label: "Put it aside", weight: "light" }], ...over });
const noticed = { id: "FINDING::source-modified::A", class: "FINDING", kind: "source-modified", subject: { kind: "bundle", id: "DOC-1" },
  summary: "changed", detail: null, basis: { source: "stub", detail: "s" }, age: { state: "determined", since: iso(NOW - 1000), ms: 1000 },
  assignee: null, assignee_role: null, options: [] };

function withUpdate(items = [update()]) {
  const w = world({ producers: { feedItems: (a) => ({ facts: FACTS, items: items.map((it) => ({ ...it, case: a.homesOf([]) })) }) } });
  w.member("alice", { role: "admin" }); w.bundle("DOC-1"); w.bundle("INQ-1", "inquiry");
  return w;
}

test("R54: update-ready is classed OBLIGATION with its one sentence, and an item of it passes the mint", () => {
  assert.equal(classOfKind("update-ready"), "OBLIGATION");
  assert.equal(QUEUE_OBLIGATION_KINDS["update-ready"].split(" — LIVE")[0],
    "a release of your group's Civicsmith is ready to install; read what changes, then update, put it aside, or skip it with a reason");
  const f = withUpdate().feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.deepEqual(f.items.map((i) => [i.id, i.class, i.kind]), [[UPDATE_ID, "OBLIGATION", "update-ready"]]);
  assert.equal(f.counts.obligation, 1);
  assert.equal(f.items[0].case.ungrouped, true);
});

test("R54: the answer publishes sections {civicsmith: [update-ready]}, frozen, so the item is filed there and not under no case", () => {
  const f = withUpdate().feed("alice");
  assert.deepEqual(f.sections, { civicsmith: ["update-ready"] });
  assert.deepEqual(QUEUE_SECTIONS, { civicsmith: ["update-ready"] });
  assert.ok(Object.isFrozen(QUEUE_SECTIONS) && Object.isFrozen(QUEUE_SECTIONS.civicsmith));
  assert.throws(() => { "use strict"; QUEUE_SECTIONS.civicsmith.push("x"); }, TypeError);
  // every kind a section names is a catalogued kind, and the item's kind is filed in exactly one section
  for (const kinds of Object.values(QUEUE_SECTIONS)) for (const k of kinds) assert.notEqual(classOfKind(k), null, k);
  const filed = Object.entries(f.sections).filter(([, kinds]) => kinds.includes(f.items[0].kind));
  assert.deepEqual(filed.map(([s]) => s), ["civicsmith"]);
});

test("R54, R12: the disposition is unavailable, instead updatelater, and no sentence calls the to-do an obligation (R48)", () => {
  const f = withUpdate().feed("alice");
  const d = byId(f)[UPDATE_ID].disposition;
  assert.deepEqual([d.available, d.op, d.scope, d.reason, d.instead],
    [false, null, null, "an_obligation_is_resolved_not_disposed", "updatelater"]);
  assert.match(d.detail, /op=updatelater/);
  assert.doesNotMatch(d.detail.replace(/\ba to-do is something[^.]*\./, ""), /\bobligations?\b/i);
});

test("R54, R11, R49: the update to-do sorts among to-dos, before a noticed item, by default and by kind", () => {
  const w = withUpdate([noticed, update("1.76.0")]);
  for (const sort of [undefined, "kind"]) {
    const f = w.q.queueFeed({ member: "alice", viewer: "member:alice", sort });
    assert.deepEqual(f.items.map((i) => i.class), ["OBLIGATION", "FINDING"], String(sort));
    assert.equal(f.items[0].id, UPDATE_ID);
  }
  // control: a kind nobody catalogued is still refused whole
  const bad = withUpdate([update("1.76.0", { kind: "update-readyy" })]);
  assert.equal(bad.feed("alice").reason, "NO_SUCH_KIND");
  // control: the same kind minted as a status item is refused as misclassed
  const mis = withUpdate([update("1.76.0", { class: "CONDITION" })]);
  assert.equal(mis.feed("alice").reason, "KIND_MISCLASSED");
});

test("R54, R19, R31: muting the update to-do, by kind or by id, is refused KIND_NOT_PERSONAL, and no row suppresses it", () => {
  const w = withUpdate();
  for (const r of [w.q.queueMute({ member: "alice", viewer: "member:alice", case: "INQ-1", kinds: ["update-ready"] }),
                   w.q.queueMute({ member: "alice", viewer: "member:alice", item: UPDATE_ID })])
    assert.deepEqual([r.reason, r.kind_class, r.check], ["KIND_NOT_PERSONAL", "OBLIGATION", "C-33.27"]);
  w.run(`INSERT INTO queue_item_mutes VALUES ('alice',?,'OBLIGATION',?)`, UPDATE_ID, iso(NOW));
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds, snoozed_until, last_seen) VALUES ('alice','INQ-1','update-ready',NULL,?)`, iso(NOW));
  const f = w.feed("alice");
  assert.deepEqual(f.items.map((i) => i.id), [UPDATE_ID]);
  assert.equal(f.mute.suppressed.length, 0);
});

test("R54, R28: the bridge refuses the update to-do CLASS_NOT_DISPOSED naming the same door, by id and by kind, writing nothing", () => {
  const w = withUpdate();
  for (const key of [UPDATE_ID, "update-ready::1.76.0"]) {
    const r = w.q.proposeDispose({ key, to: "dismissed", reason: "no", decidedBy: "alice", viewer: "member:alice" });
    assert.deepEqual([r.reason, r.class, r.kind, r.instead], ["CLASS_NOT_DISPOSED", "OBLIGATION", "update-ready", "updatelater"], key);
    assert.equal(r.check, "C-33.44");
  }
  assert.equal(w.all("SELECT * FROM finding_dispositions").length, 0);
  // R12 and R28 name one door
  assert.equal(byId(w.feed("alice"))[UPDATE_ID].disposition.instead, "updatelater");
});

test("R12, R8 (N1036): the feed answers Home's \"what needs the group\": each item's kind and whose move, by assignee and assignee_role", () => {
  const w = withUpdate([update("1.76.0", { assignee: "alice", assignee_role: "admin" }), update("1.77.0", { assignee: "bob", assignee_role: "admin" })]);
  w.bundle("INF-1");
  w.task("TASK-2026-0001-a", "INF-1", { assignee: "alice", role: "group-admin" });
  w.task("TASK-2026-0002-a", "INF-1", { kind: "membership-request", assignee: "unassigned", role: "admin" });
  const f = w.feed("alice");
  const rows = f.items.map((i) => [i.kind, i.assignee, i.assignee_role]).sort();
  assert.deepEqual(rows, [
    ["authority-undetermined", "alice", "group-admin"],
    ["membership-request", "unassigned", "admin"],
    ["update-ready", "alice", "admin"],
    ["update-ready", "bob", "admin"],
  ]);
  // every to-do names its kind, its class and whose move it is: nothing Home draws is missing from the answer
  for (const i of f.items) assert.ok(typeof i.kind === "string" && i.class === "OBLIGATION" && "assignee" in i && "assignee_role" in i, i.id);
});
