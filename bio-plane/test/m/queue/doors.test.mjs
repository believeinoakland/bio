/* queue R12 and R28 amended (T51-C62; K4171, K4168): an OBLIGATION's door is the one its producer declared on the item (`door`, an
   op name or a list of op names, the first the one the screen leads with), else the kind's hand list, else `taskresolve`; and
   R39, R59 (K4213): a task put aside before anyone decided it ends with `resolved_undecided`, which resolves it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { Queue } from "../../../src/queue/index.mjs";

const FACTS = { dispositions: [], unattributed: { count: 0, inquiries: [] } };
/* a world whose producers mint `make()`'s OBLIGATIONs (with their own `door` where the test gives one), counting each read */
function produced(make) {
  const reads = { n: 0 };
  const w = world({ producers: { feedItems: (a) => { reads.n += 1; return { facts: FACTS,
    items: make().map(({ subjects = [], ...it }) => ({ subject: { kind: "bundle", id: subjects[0] ?? null }, summary: it.kind, detail: null,
      basis: { source: "stub", detail: "stubbed" }, age: { state: "undetermined", reason: "derived_on_read" },
      assignee: "alice", assignee_role: "group-admin", options: a.optionsOf(subjects), ...it, case: a.homesOf(subjects) })) }; } } });
  w.member("alice"); w.bundle("DOC-1");
  w.reads = reads;
  return w;
}
const obl = (kind, rest, extra = {}) => ({ id: `OBLIGATION::${kind}::${rest}`, class: "OBLIGATION", kind, subjects: ["DOC-1"], ...extra });
const pd = (w, a) => w.q.proposeDispose({ to: "deferred", reason: "r", decidedBy: "alice", viewer: "member:alice", identity: "member:alice", ...a });

test("R12 (C62): `tasks` declares the door of authority-undetermined (its R24); the item carries it and its disposition leads with it; a task of another kind declaring none keeps taskresolve (control)", () => {
  const w = world();
  w.member("alice"); w.bundle("DOC-1"); w.bundle("DOC-2");
  w.task("TASK-2026-0001-a", "DOC-1", { assignee: "alice" });
  w.task("TASK-2026-0002-a", "DOC-2", { assignee: "alice", kind: "check-requested" });
  const m = byId(w.feed("alice"));
  assert.deepEqual(m["TASK-2026-0001-a"].door, ["taskdecide", "taskforward", "taskresolve"]);
  assert.deepEqual(m["TASK-2026-0001-a"].disposition.instead, ["taskdecide", "taskforward", "taskresolve"]);
  assert.equal(m["TASK-2026-0002-a"].disposition.instead, "taskresolve");
  assert.equal("door" in m["TASK-2026-0002-a"], false, "an item whose producer declared none carries none");
});

test("R12 (C62): queue-producers' items declare their doors: endorsement-owed and expertise-confirmation-owed each lead with the op its producer names, an owner vote with the change's own op", () => {
  const w = produced(() => [
    obl("endorsement-owed", "E1", { door: "adminendorse" }), obl("endorsement-owed", "E2", { door: ["projectowneradd"] }),
    obl("expertise-confirmation-owed", "X1", { door: "expertiseconfirm" }),
    obl("endorsement-owed", "E3")]);
  const m = byId(w.feed("alice"));
  assert.equal(m["OBLIGATION::endorsement-owed::E1"].disposition.instead, "adminendorse");
  assert.deepEqual(m["OBLIGATION::endorsement-owed::E2"].disposition.instead, ["projectowneradd"]);
  assert.equal(m["OBLIGATION::expertise-confirmation-owed::X1"].disposition.instead, "expertiseconfirm");
  /* control: a producer that declares none is read as before, by the hand list's default */
  assert.equal(m["OBLIGATION::endorsement-owed::E3"].disposition.instead, "taskresolve");
  for (const it of Object.values(m)) assert.equal(it.disposition.available, false);
});

test("R12 (C62): a door that is not a name or a non-empty list of names declares nothing; every existing kind's door is unchanged (control)", () => {
  for (const bad of ["", "  ", [], [""], [1], ["ok", 2], 5, null, undefined, {}]) {
    assert.equal(Queue.declaredDoor(bad), null, JSON.stringify(bad));
    assert.equal(Queue.doorOf("endorsement-owed", bad), "taskresolve", JSON.stringify(bad));
    assert.equal(Queue.doorOf("bias-debt", bad), "biasdebtresolve", JSON.stringify(bad));
  }
  assert.equal(Queue.doorOf("bias-debt", "other"), "other", "a declared door leads");
  const list = ["a", "b"];
  const got = Queue.doorOf("bias-debt", list);
  assert.deepEqual(got, list);
  got.push("c");
  assert.deepEqual(list, ["a", "b"], "a declared list is copied out");
  for (const [kind, door] of Object.entries(Queue.OBLIGATION_DOORS)) {
    assert.deepEqual(Queue.doorOf(kind), Array.isArray(door) ? [...door] : door, kind);
    if (Array.isArray(door)) assert.notEqual(Queue.doorOf(kind), door, `${kind}: a list is copied`);
  }
  assert.equal(Queue.doorOf("check-requested"), "taskresolve");
});

test("R28 (C62): the bridge names the door the caller's live item declares, else the hand list, else taskresolve; nothing is written", () => {
  const w = produced(() => [obl("endorsement-owed", "E1", { door: "adminendorse" }), obl("bias-debt", "r1", { door: "declared-for-bias" }),
                            obl("expertise-confirmation-owed", "X1")]);
  const r = pd(w, { key: "OBLIGATION::endorsement-owed::E1" });
  assert.deepEqual([r.ok, r.reason, r.class, r.kind, r.instead], [false, "CLASS_NOT_DISPOSED", "OBLIGATION", "endorsement-owed", "adminendorse"]);
  assert.equal(pd(w, { key: "OBLIGATION::endorsement-owed::GONE" }).instead, "taskresolve", "no live item with that id: the hand list");
  assert.equal(pd(w, { key: "OBLIGATION::expertise-confirmation-owed::X1" }).instead, "taskresolve", "a live item declaring none: the hand list");
  assert.equal(pd(w, { key: "OBLIGATION::bias-debt::r1" }).instead, "declared-for-bias", "a declared door leads over the hand list's");
  assert.equal(pd(w, { key: "OBLIGATION::bias-debt::r9" }).instead, "biasdebtresolve", "control: the hand door of an existing kind is unchanged");
  /* another member's live item does not name the door (the item is read in this caller's feed) */
  w.member("bob");
  const other = w.q.proposeDispose({ to: "deferred", reason: "r", decidedBy: "bob", viewer: "member:bob", identity: "member:bob",
                                     key: "OBLIGATION::endorsement-owed::E1" });
  assert.equal(other.reason, "CLASS_NOT_DISPOSED");
  assert.equal(w.all(`SELECT count(*) c FROM finding_dispositions`)[0].c, 0);
});

test("R28 (C62): a set reads the caller's feed once for all its refusals", () => {
  const w = produced(() => [obl("endorsement-owed", "E1", { door: "adminendorse" }), obl("expertise-confirmation-owed", "X1", { door: "expertiseconfirm" })]);
  const before = w.reads.n;
  const r = pd(w, { items: [{ key: "OBLIGATION::endorsement-owed::E1" }, { key: "OBLIGATION::expertise-confirmation-owed::X1" },
                            { key: "OBLIGATION::endorsement-owed::E1" }] });
  assert.equal(w.reads.n - before, 1, "one read of the feed for three refusals");
  assert.deepEqual(r.items.map((o) => [o.reason, o.instead]),
    [["CLASS_NOT_DISPOSED", "adminendorse"], ["CLASS_NOT_DISPOSED", "expertiseconfirm"], ["CLASS_NOT_DISPOSED", "adminendorse"]]);
  const alone = pd(w, { key: "OBLIGATION::endorsement-owed::E1" });
  assert.equal(alone.instead, "adminendorse");
  assert.equal(w.reads.n - before, 2, "a single refusal reads it once");
});

test("R39, R59 (K4213): a task put aside by taskresolve carries resolved_undecided; it is a resolving event, so resolved_by is not null (control: a decided one carries decided then resolved)", () => {
  const w = world();
  w.member("alice"); w.member("bob"); w.bundle("DOC-1");
  const at = iso(NOW - 60000);
  w.task("TASK-2026-0001-a", "DOC-1", { assignee: "alice", status: "resolved", resolvedAt: at,
    history: [{ at: iso(NOW - 7200000), event: "created", actor: "alarm" }, { at, event: "resolved_undecided", actor: "bob" }] });
  w.task("TASK-2026-0002-a", "DOC-1", { assignee: "alice", status: "resolved", resolvedAt: at,
    history: [{ at: iso(NOW - 7200000), event: "created", actor: "alarm" }, { at, event: "decided", actor: "alice" }, { at, event: "resolved", actor: "alice" }] });
  const f = w.feed("alice");
  const by = Object.fromEntries(f.resolved.obligations.map((o) => [o.id, o.resolved_by]));
  assert.deepEqual(by, { "TASK-2026-0001-a": "bob", "TASK-2026-0002-a": "alice" });
  const ans = w.q.queueFeed({ member: "alice", viewer: "member:alice", answered: true });
  const rows = Object.fromEntries(ans.answered.filter((r) => r.act === "resolved").map((r) => [r.id, [r.by, r.by_you]]));
  assert.deepEqual(rows, { "TASK-2026-0001-a": ["bob", false], "TASK-2026-0002-a": ["alice", true] });
  /* a history with neither event names nobody, as before */
  assert.equal(Queue.resolvingEntry([{ event: "created" }]), null);
  assert.equal(Queue.resolvingEntry(undefined), null);
});
