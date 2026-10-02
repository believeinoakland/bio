/* queue-producers' R26 and R27 signals in the feed (T23, K1099): the five `sweep-*` and three `notice-*` CONDITIONs,
   produced by the real `queue-producers` over link-sweep's and network-notices' reads (link-sweep R11, network-notices
   R22; fakes in their published shapes), pass the mint as CONDITIONs (R1, R5, R11), take the CONDITION disposition
   (R12), and are quieted only personally (R14, R19, R30). The sweep conditions are offered under `monitoring` too,
   whose read queue-producers asked until its re-point to link-sweep (N506), so the test holds on either side of it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, iso, NOW } from "./world.mjs";
import { classOfKind, QUEUE_CONDITION_KINDS } from "../../../src/queuestate.mjs";
import { CONDITION_KINDS } from "../../../src/observation-log/vocabulary.mjs";
import { Queue } from "../../../src/queue/index.mjs";

const SWEEP_KINDS = ["sweep-held-backlog", "sweep-yield-anomaly", "sweep-seed-unreachable", "sweep-redirect-out-of-scope",
  "sweep-silent"];
const NOTICE_KINDS = ["notice-attestation-missed", "notice-lapse-near", "notice-project-closed"];
const DETAIL = { "sweep-held-backlog": { backlog: 40, limit: 40 }, "sweep-yield-anomaly": { filed: 90, median: 4 },
  "sweep-seed-unreachable": { seeds: [{ seed: "https://a.example/agendas" }] },
  "sweep-redirect-out-of-scope": { redirects: [{ address: "https://a.example/x", target: "https://b.example/y" }] },
  "sweep-silent": { runs: 4 } };
const notice = (id, status, extra = {}) => ({ notice: id, status, opened_at: "2026-05-01T10:00:00Z", revisions: [],
  attestations: [{ kind: "posted", as_of: "2026-05-01", published_at: "2026-05-01T10:00:00Z" }], level: null,
  next_monthly: status === "open" ? "2026-10-01" : null, lapse_date: null, missed_monthlies: [], ...extra });

/* PRJ-1 holds a sweep with all five conditions and three notices, one per notice kind. alice and bob are owners of it;
   carl is a member of no project. */
function setup() {
  const sweepConditions = () => ({ ok: true, conditions: SWEEP_KINDS.map((kind) =>
    ({ sweep: "PRJ-1#agendas", kind, since: iso(NOW - 3600000), detail: DETAIL[kind] })) });
  const w = world({
    linkSweep: { sweepConditions },
    monitoring: { sweepConditions },
    networkNotices: { noticesOf: ({ project }) => (project !== "PRJ-1" ? { ok: true, notices: [] } : { ok: true, notices: [
      notice("WO-1", "open", { missed_monthlies: [{ month: "2026-08", at: "2026-08-01T00:00:00Z" }] }),
      notice("WO-2", "open", { lapse_date: "2026-09-05" }),
      notice("WO-3", "closed", { attestations: [{ kind: "closed", as_of: "2026-08-25", published_at: "2026-08-25T12:00:00Z" }] }),
    ] }) },
  });
  for (const m of ["alice", "bob", "carl"]) w.member(m);
  w.bundle("PRJ-1", "project", { title: "Budget watch" });
  w.join("PRJ-1", "alice", { owner: true }); w.join("PRJ-1", "bob", { owner: true });
  return w;
}
const SWEEP_IDS = SWEEP_KINDS.map((k) => `CONDITION::${k}::PRJ-1#agendas`);
const NOTICE_IDS = ["CONDITION::notice-attestation-missed::WO-1", "CONDITION::notice-lapse-near::WO-2",
  "CONDITION::notice-project-closed::WO-3"];
const signals = (f) => f.items.filter((i) => /^(sweep|notice)-/.test(i.kind)).map((i) => i.id).sort();

test("R1, R5, R11, R12: each sweep-* and notice-* signal is minted as a CONDITION with its sentence, homed under its project, quieted only by a mute", () => {
  const w = setup();
  const f = w.feed("alice");
  assert.notEqual(f.ok, false, "the mint accepts every one");
  assert.deepEqual(signals(f), [...SWEEP_IDS, ...NOTICE_IDS].sort(), "all eight kinds reach the feed");
  const items = byId(f);
  for (const id of [...SWEEP_IDS, ...NOTICE_IDS]) {
    const it = items[id];
    assert.equal(it.class, "CONDITION", id);
    assert.equal(classOfKind(it.kind), "CONDITION", id);
    assert.equal(QUEUE_CONDITION_KINDS[it.kind], CONDITION_KINDS[it.kind], `${id}: observation-log's sentence`);
    assert.ok(it.case.ancestors.some((a) => a.id === "PRJ-1"), `${id}: homed under its project`);
    assert.equal(it.disposition.available, false, id);
    assert.equal(it.disposition.instead, "queuemute", id);
    assert.ok(Array.isArray(it.options), id);
  }
  assert.equal(f.class_labels.CONDITION, "Signal");
  assert.ok(f.classes.includes("CONDITION"));
  // the notices go to the owners: bob sees the same three; a member of no project, and a machine reader, see none
  assert.deepEqual(signals(w.feed("bob")), [...SWEEP_IDS, ...NOTICE_IDS].sort());
  assert.deepEqual(signals(w.feed("carl")), [], "a member of no project is told nothing");
  assert.deepEqual(signals(w.feed(null, "class:admin")), [], "no member, no signal");
});

test("R11: negative control: a producer minting a sweep or notice kind outside the vocabulary, or one misclassed, refuses the feed", () => {
  const facts = { objective_gap: { bound: 0, truncated: false }, contradiction: { bound: 0, truncated: false }, dispositions: [] };
  const stub = (cls, kind) => world({ producers: { feedItems: () => ({ facts, items: [{ id: `${cls}::${kind}::PRJ-1#agendas`,
    class: cls, kind, case: { state: "ungrouped", ungrouped: true, reasons: [], depth_bound: 6, ancestors: [] },
    subject: { kind: "bundle", id: "PRJ-1" }, summary: "s", detail: "d", basis: {}, age: { state: "undetermined" },
    assignee: null, assignee_role: null, options: [] }] }) } });
  for (const kind of ["sweep-unknown", "notice-posted", "sweep-held"]) {
    const w = stub("CONDITION", kind); w.member("alice");
    const r = w.feed("alice");
    assert.equal(r.ok, false, kind); assert.equal(r.reason, "NO_SUCH_KIND", kind); assert.equal(r.check, "C-31.2", kind);
  }
  for (const kind of ["sweep-silent", "notice-lapse-near"]) {
    const w = stub("FINDING", kind); w.member("alice");
    const r = w.feed("alice");
    assert.equal(r.reason, "KIND_MISCLASSED", kind); assert.equal(r.catalogued_as, "CONDITION", kind);
  }
  // and the same kinds as CONDITIONs pass
  const w = stub("CONDITION", "sweep-silent"); w.member("alice");
  assert.notEqual(w.feed("alice").ok, false);
});

test("R14, R19, R30: a member mutes a sweep or notice kind on its project, or one signal by id, for themselves only", () => {
  const w = setup();
  const m = w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: ["sweep-silent", "notice-lapse-near"] });
  assert.equal(m.ok, true); assert.deepEqual(m.muted_kinds, ["notice-lapse-near", "sweep-silent"]);
  const i = w.q.queueMute({ member: "alice", viewer: "member:alice", item: "CONDITION::notice-project-closed::WO-3" });
  assert.equal(i.ok, true); assert.equal(i.item_class, "CONDITION");
  const f = w.feed("alice");
  const quiet = ["CONDITION::sweep-silent::PRJ-1#agendas", "CONDITION::notice-lapse-near::WO-2",
    "CONDITION::notice-project-closed::WO-3"];
  assert.deepEqual(signals(f), [...SWEEP_IDS, ...NOTICE_IDS].filter((id) => !quiet.includes(id)).sort());
  assert.deepEqual(f.mute.suppressed.map((s) => [s.id, s.scope]).sort(), [
    ["CONDITION::notice-lapse-near::WO-2", "case"], ["CONDITION::notice-project-closed::WO-3", "item"],
    ["CONDITION::sweep-silent::PRJ-1#agendas", "case"]]);
  // personal: bob, an owner of the same project, still sees all eight
  assert.deepEqual(signals(w.feed("bob")), [...SWEEP_IDS, ...NOTICE_IDS].sort());
  // a kind outside the vocabulary is refused by name
  assert.equal(w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-1", kinds: ["sweep-unknown"] }).reason, "UNKNOWN_KIND");
});

test("R8 (N506): linkSweep is among the providers queue hands queue-producers, and queue itself calls none of its reads", () => {
  assert.ok(Queue.PRODUCER_DEPS.includes("linkSweep"));
  assert.ok(Queue.PRODUCER_DEPS.includes("monitoring"), "monitoring stays: its other reads feed queue-producers R2, R3");
  assert.ok(Object.isFrozen(Queue.PRODUCER_DEPS));
  // with the producers stubbed, a link-sweep whose every read throws is never reached: queue reads it for nobody
  const facts = { objective_gap: { bound: 0, truncated: false }, contradiction: { bound: 0, truncated: false }, dispositions: [] };
  const w = world({ linkSweep: { sweepConditions: () => { throw new Error("queue called linkSweep.sweepConditions"); } },
                    producers: { feedItems: () => ({ facts, items: [] }) } });
  w.member("alice");
  assert.throws(() => w.fakes.linkSweep.sweepConditions(), /queue called/, "the throwing fake is the one queue holds");
  assert.equal(w.feed("alice").ok, true);
  // negative control: a provider name outside the list is not one queue hands on
  assert.ok(!Queue.PRODUCER_DEPS.includes("linksweep") && !Queue.PRODUCER_DEPS.includes("sweeps"));
});
