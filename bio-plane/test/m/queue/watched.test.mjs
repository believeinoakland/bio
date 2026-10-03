/* T31's kinds at queue's interface (N528, DEC-121; N534, DEC-101 (3), DEC-116 item 8), through the REAL
   `queue-producers.feedItems` over faked providers (wizard-scripts R13, R17; reevaluation R33; case-import R20), which
   queue hands it (N545: `Queue.PRODUCER_DEPS`). Each of R1's seven T31 kinds answers its class with its sentence, and a
   feed carrying each is minted rather than refused NO_SUCH_KIND (R11, C-31.2): wizard-approval-requested an OBLIGATION
   whose door is the approval (R12; J1's reading) and which no mute reaches (R19, R31); wizard-withdrawn,
   wizard-restored, cited-newer-edition, cited-edition-withdrawn, followed-case-entry and cited-docket-entry-refused
   FINDINGs taking R12's disposition, the two cited-edition kinds with a recorded re-evaluation as their act (R50, N547,
   as `edition-withdrawn`), aged per project (R13); cited-docket-unreadable a CONDITION quieted only personally (R12,
   R19). Negative
   controls: each kind minted under another class is KIND_MISCLASSED (C-31.3), a near-miss of its name NO_SUCH_KIND. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { Queue, QUEUE_MINT_CHECKS } from "../../../src/queue/index.mjs";
import { classOfKind, QUEUE_OBLIGATION_KINDS, QUEUE_FINDING_KINDS, QUEUE_CONDITION_KINDS } from "../../../src/queuestate.mjs";

const T31 = {
  "wizard-approval-requested": ["OBLIGATION", /a member submitted a wizard script's version that you may approve; approve it or leave it/],
  "wizard-withdrawn": ["FINDING", /a wizard script you own or wrote no longer matches the screens and is withheld until fixed; its first refusal named/],
  "wizard-restored": ["FINDING", /a withheld wizard script matches the screens again and is offered again/],
  "cited-newer-edition": ["FINDING", /a case your group cites has a newer edition/],
  "cited-edition-withdrawn": ["FINDING", /a case edition your group cites has been withdrawn/],
  "followed-case-entry": ["FINDING", /a docket you follow gained an entry/],
  "cited-docket-entry-refused": ["FINDING", /an entry of a docket you follow failed its checks and was not taken in/],
  "cited-docket-unreadable": ["CONDITION", /a docket you follow could not be read/],
};
const VOCAB = { OBLIGATION: QUEUE_OBLIGATION_KINDS, FINDING: QUEUE_FINDING_KINDS, CONDITION: QUEUE_CONDITION_KINDS };
const page = (entries) => () => ({ ok: true, entries, cursor: null, truncated: false });

/** A world whose providers answer one of each T31 item for alice, through the real producers. */
function withT31(fakes = {}) {
  const w = world({
    wizardScripts: {
      submittedFor: page([{ script: "WIZ-1", version: 2, name: "File a records request", author: "bob", owner: "alice",
                            project: "PRJ-A", submitted_at: iso(NOW - 5000) }]),
      brokenScripts: page([
        { kind: "withdrawn", script: "WIZ-1", version: 1, name: "File a records request", author: "alice", project: "PRJ-A",
          at: iso(NOW - 4000), refusal: { code: "STEP_GONE", check: "C-131.1", translation: "a screen it reads is gone" } },
        { kind: "restored", script: "WIZ-1", version: 1, name: "File a records request", author: "alice", project: "PRJ-A",
          at: iso(NOW - 3000) }]),
    },
    reevaluation: {
      citedCaseDependents: () => ({ ok: true, count: 2, limit: 200, truncated: false, cursor: null, wrote: false, entries: [
        { kind: "edition", dependent: "INQ-D", import: "IMP-1", seq: 4, group: "Other group", case: "Their case",
          edition: 3, what_changed: "a new count", since: iso(NOW - 2000), legs: [{ cited_edition: 2 }] },
        { kind: "withdrawal", dependent: "INQ-D", import: "IMP-1", seq: 5, group: "Other group", case: "Their case",
          edition: 2, reason: "an error", since: iso(NOW - 1000), legs: [{ cited_edition: 2 }] }] }),
    },
    caseImport: {
      watchItems: () => ({ ok: true,
        entries: [{ import: "IMP-1", seq: 6, kind: "response", set_by: "alice", group: "Other group", case: "Their case" }],
        refused: [{ import: "IMP-1", seq: 7, failed: "C-140.2", set_by: "alice" }],
        unreadable: [{ import: "IMP-2", set_by: "alice", reason: "timeout", at: iso(NOW - 600000) }] }),
    },
    ...fakes,
  });
  for (const m of ["alice", "bob"]) w.member(m);
  w.bundle("PRJ-A", "project"); w.join("PRJ-A", "alice", { owner: true }); w.join("PRJ-A", "bob");
  w.bundle("INQ-D", "inquiry"); w.cite("PRJ-A", "INQ-D");
  return w;
}
const ofKind = (feed, kind) => feed.items.filter((i) => i.kind === kind);

test("R1: each of the seven T31 kinds answers its class, with its one sentence", () => {
  for (const [kind, [cls, says]] of Object.entries(T31)) {
    assert.equal(classOfKind(kind), cls, kind);
    assert.match(VOCAB[cls][kind], says, kind);
    for (const other of Object.keys(VOCAB).filter((c) => c !== cls)) assert.ok(!(kind in VOCAB[other]), `${kind} in ${other}`);
  }
  for (const v of ["wizard-approval", "wizard-withdrawal", "wizard-restore", "cited-new-edition", "cited-edition-withdrawal",
                   "followed-case", "cited-docket-refused", "docket-unreadable", "CITED-DOCKET-UNREADABLE", " wizard-restored"])
    assert.equal(classOfKind(v), null, v);
});

test("R1, R8, R11 (N545): a feed carrying every T31 kind from the real producers is minted, not refused, and queue hands them caseImport and wizardScripts", () => {
  assert.ok(Queue.PRODUCER_DEPS.includes("caseImport"));
  assert.ok(Queue.PRODUCER_DEPS.includes("wizardScripts"));
  assert.ok(Object.isFrozen(Queue.PRODUCER_DEPS));
  const w = withT31();
  const f = w.feed("alice");
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 400));
  for (const [kind, [cls]] of Object.entries(T31)) {
    const got = ofKind(f, kind);
    assert.equal(got.length, 1, kind);
    assert.equal(got[0].class, cls, kind);
  }
  // the providers were reached only through the producers, with the fakes queue was given
  const ids = Object.keys(byId(f));
  assert.ok(ids.includes("OBLIGATION::wizard-approval-requested::WIZ-1@2::alice"));
  assert.ok(ids.includes("CONDITION::cited-docket-unreadable::IMP-2"));
  // nobody else's: bob is told none of the watch's or the approval's items
  const b = w.feed("bob");
  assert.equal(b.ok, true);
  for (const k of ["wizard-approval-requested", "followed-case-entry", "cited-docket-entry-refused", "cited-docket-unreadable"])
    assert.equal(ofKind(b, k).length, 0, k);
});

test("R12, R19, R31: wizard-approval-requested is a to-do whose door is wizardapprove, never taskresolve, and no mute reaches it", () => {
  const w = withT31();
  const it = ofKind(w.feed("alice"), "wizard-approval-requested")[0];
  assert.equal(it.disposition.available, false);
  assert.equal(it.disposition.reason, "an_obligation_is_resolved_not_disposed");
  assert.equal(it.disposition.instead, "wizardapprove");
  assert.match(it.disposition.detail, /op=wizardapprove/);
  assert.equal(Queue.doorOf("wizard-approval-requested"), "wizardapprove");
  const byItem = w.q.queueMute({ member: "alice", viewer: "member:alice", item: it.id });
  assert.deepEqual([byItem.ok, byItem.reason, byItem.check], [false, "KIND_NOT_PERSONAL", "C-33.27"]);
  const byKind = w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-A", kinds: ["wizard-approval-requested"] });
  assert.deepEqual([byKind.ok, byKind.reason], [false, "KIND_NOT_PERSONAL"]);
  // R28: the bridge names the same door
  const bridged = w.q.proposeDispose({ key: it.id, to: "dismissed", reason: "no", decidedBy: "alice", viewer: "member:alice" });
  assert.deepEqual([bridged.ok, bridged.reason, bridged.instead], [false, "CLASS_NOT_DISPOSED", "wizardapprove"]);
  assert.equal(ofKind(w.feed("alice"), "wizard-approval-requested").length, 1);
});

test("R12, R19: cited-docket-unreadable is a signal quieted only for its member; the six findings take R12's disposition and may be quieted personally", () => {
  const w = withT31();
  const f = w.feed("alice");
  const sig = ofKind(f, "cited-docket-unreadable")[0];
  assert.deepEqual([sig.disposition.available, sig.disposition.instead], [false, "queuemute"]);
  for (const kind of Object.keys(T31).filter((k) => T31[k][0] === "FINDING")) {
    const it = ofKind(f, kind)[0];
    assert.equal(it.disposition.scope, "project", kind);
    assert.ok(Array.isArray(it.disposition.projects), kind);
  }
  // the cited findings rest on INQ-D, filed under PRJ-A: available for that project; the watch's have no project home
  for (const k of ["cited-newer-edition", "cited-edition-withdrawn"])
    assert.deepEqual([ofKind(f, k)[0].disposition.available, ofKind(f, k)[0].disposition.projects], [true, ["PRJ-A"]], k);
  for (const k of ["followed-case-entry", "cited-docket-entry-refused"])
    assert.deepEqual([ofKind(f, k)[0].disposition.available, ofKind(f, k)[0].disposition.reason], [false, "no_project_scope"], k);
  const m = w.q.queueMute({ member: "alice", viewer: "member:alice", item: sig.id });
  assert.equal(m.ok, true);
  const after = w.feed("alice");
  assert.equal(ofKind(after, "cited-docket-unreadable").length, 0);
  assert.deepEqual(after.mute.suppressed.map((s) => [s.id, s.scope]), [[sig.id, "item"]]);
  const k = w.q.queueMute({ member: "alice", viewer: "member:alice", case: "PRJ-A", kinds: ["wizard-withdrawn", "cited-newer-edition"] });
  assert.equal(k.ok, true);
});

test("R12, R50 (N547): cited-newer-edition and cited-edition-withdrawn take R12's project-scoped disposition with reevaluationrecord; with no project home, no scope; the other T31 findings name no act", () => {
  const w = withT31();
  const f = w.feed("alice");
  for (const k of ["cited-newer-edition", "cited-edition-withdrawn"]) {
    const it = ofKind(f, k)[0];
    const d = it.disposition;
    assert.deepEqual([d.available, d.op, d.scope, d.key, d.finding, d.projects, d.requires, d.acts, d.keyed_on],
      [true, "proposedispose", "project", null, it.id, ["PRJ-A"], ["project", "finding"], ["reevaluationrecord"],
       ["project", "finding"]], k);
    // each item's acts are its own list: changing one answer's changes neither the next feed's nor the catalogue's
    d.acts.push("tampered");
    assert.deepEqual(ofKind(w.feed("alice"), k)[0].disposition.acts, ["reevaluationrecord"], k);
    assert.ok(Object.isFrozen(Queue.FINDING_ACTS[k]), k);
  }
  // negative control: the other T31 findings, with no progression stage either, name no act
  for (const k of ["wizard-withdrawn", "wizard-restored", "followed-case-entry", "cited-docket-entry-refused"])
    assert.equal(ofKind(f, k)[0].disposition.acts, undefined, k);
  // filed under no project the viewer can see: no scope, the act still named (as edition-withdrawn, R50)
  const lone = world({ producers: { feedItems: (a) => ({ facts: {}, items: ["cited-newer-edition", "cited-edition-withdrawn"]
    .map((kind) => ({ id: `FINDING::${kind}::INQ-L::IMP-1#4`, class: "FINDING", kind, case: a.homesOf(["INQ-L"]),
      subject: { kind: "bundle", id: "INQ-L" }, summary: kind, detail: null, basis: { source: "stub" },
      age: { state: "undetermined" }, assignee: null, assignee_role: null, options: [] })) }) } });
  lone.bundle("INQ-L", "inquiry");
  for (const it of lone.feed(null, "class:admin").items)
    assert.deepEqual([it.disposition.available, it.disposition.reason, it.disposition.projects, it.disposition.acts],
      [false, "no_project_scope", [], ["reevaluationrecord"]], it.kind);
});

test("R13, R27, R50 (N547): a project's set-aside of cited-edition-withdrawn ages it for that project, keeping its act; the newer-edition item is untouched", () => {
  const w = withT31();
  w.bundle("PRJ-B", "project"); w.join("PRJ-B", "alice"); w.cite("PRJ-B", "INQ-D");
  const it = ofKind(w.feed("alice"), "cited-edition-withdrawn")[0];
  assert.deepEqual(it.disposition.projects, ["PRJ-A", "PRJ-B"]);
  const pd = (project) => w.q.proposeDispose({ project, finding: it.id, kind: it.kind, to: "deferred",
    reason: "after re-reading", decidedBy: "alice", viewer: "member:alice", identity: "member:alice" });
  assert.equal(pd("PRJ-A").ok, true);
  let f = w.feed("alice");
  const kept = byId(f)[it.id];
  assert.deepEqual([kept.disposition.projects, kept.disposition.disposed_by, kept.disposition.acts],
    [["PRJ-B"], ["PRJ-A"], ["reevaluationrecord"]]);
  assert.deepEqual(ofKind(f, "cited-newer-edition")[0].disposition.projects, ["PRJ-A", "PRJ-B"]);
  assert.equal(pd("PRJ-B").ok, true);
  f = w.feed("alice");
  assert.equal(byId(f)[it.id], undefined);
  assert.equal(f.disposed.findings.filter((d) => d.finding === it.id).length, 2);
});

test("R11 (negative controls): each T31 kind minted under another class is KIND_MISCLASSED, a near-miss of its name NO_SUCH_KIND", () => {
  const mint = (kind, cls) => world({ producers: { feedItems: (a) => ({ facts: {}, items: [{
    id: `${cls}::${kind}::X`, class: cls, kind, case: a.homesOf([]), subject: { kind: "import", id: "X" }, summary: kind,
    detail: null, basis: { source: "stub" }, age: { state: "undetermined" }, assignee: null, assignee_role: null,
    options: [] }] }) } }).feed(null);
  for (const [kind, [cls]] of Object.entries(T31)) {
    for (const other of ["OBLIGATION", "FINDING", "CONDITION"].filter((c) => c !== cls)) {
      const r = mint(kind, other);
      assert.deepEqual([r.ok, r.reason, r.check, r.catalogued_as, r.minted_as], [false, "KIND_MISCLASSED", "C-31.3", cls, other], kind);
    }
    const r = mint(`${kind}-x`, cls);
    assert.deepEqual([r.ok, r.reason, r.check, r.translation], [false, "NO_SUCH_KIND", "C-31.2", QUEUE_MINT_CHECKS.NO_SUCH_KIND.translation], kind);
    assert.equal(mint(kind, cls).ok, true, kind);
  }
});
