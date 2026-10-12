/* action-holds R4 and R10 at their interface (moved from `actions` R55, T22/T42, and R69, T34; T45, K2781 (1)): the
   litigation-hold reader registered once at start with the real `doorbell` (its R3; DEC-108, K1023), proved through
   doorbell's own `mayClearDiscarded`; the reader of holds over a project registered with `ratification` (its R45), proved
   against the real ratification's `op=publishat` and scheduled publisher (M-T45-7: S1 §D 11, a hold stops a scheduled
   publication); and the copy window's end (reconciliation R19; B5): these are the only registrations. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP, received } from "./fixture.mjs";
import { actionHoldsOf } from "../../../src/action-holds/index.mjs";
import { doorbellOf } from "../../../src/doorbell/index.mjs";
import * as rat from "../ratification/fixture.mjs";
import { caseConclusionRowLines } from "../../../src/ratification/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", C = "ACTN-2026-0003-c";
const M = V("alice"), ALICE = V("alice"), BOB = V("bob"), CAROL = V("carol");
const D = "CONF-2026-0001-determination";

/* A world whose action A is in a project and B in none; each holds two received entries, A's both marked legal
   pressure and B's first. */
function ground() {
  const w = world();
  const P = w.project("alice");
  w.action(A, [`project: ${P}`, ...received(2)]);
  w.action(B, received(2));
  for (const [id, ord, kind] of [[A, 0, "legal"], [A, 1, "legal"], [B, 0, "legal"], [B, 1, "retaliation"]]) w.mark(id, ord, kind);
  return { w, P, doorbell: doorbellOf(w.host) };
}
const hold = (w, target, ord, h, author = M) => assert.equal((h === "released"
  ? w.h.actionHoldRelease({ target, ord, reason: `stated ${h}`, viewer: author, author })
  : w.h.actionHold({ target, ord, hold: h, reason: `stated ${h}`, viewer: author, author })).ok, true);
/* Everything the reader could write: the hold table, the marks, every action's bytes, and the record's manifest. */
const state = (w) => JSON.stringify([
  ...["action_holds", "action_pressure", "manifest", "bundles"].map((t) => w.rows(`SELECT * FROM ${t} ORDER BY rowid`)),
  w.text(A), w.text(B)]);

test("R4 doorbell asks this module's reader: no hold, may clear; a place whose latest statement is in_place, may not, whatever the viewer or project; released, may again", () => {
  const { w, doorbell } = ground();
  const ask = () => doorbell.mayClearDiscarded();
  /* before any hold: a legal mark alone is no hold */
  const none = ask();
  assert.equal(none.may, true);
  assert.match(none.basis, /^action-holds reports no litigation hold in place/, "the reader is action-holds'");
  assert.equal(w.h.holdInPlace(), false);
  /* a hold in place on A's entry 0: A is in a project, and no viewer is asked (one who sees nothing still holds it) */
  hold(w, A, 0, "in_place");
  assert.equal(w.a.actionRead({ id: A, viewer: "nobody" }).reason, "NO_SUCH_BUNDLE", "invisible to this viewer");
  const held = ask();
  assert.deepEqual([held.may, held.basis], [false, "action-holds reports a litigation hold in place"]);
  assert.equal(w.h.holdInPlace(), true);
  /* a second entry in place, then the first released: the other still in place keeps it held */
  hold(w, A, 1, "in_place", ALICE);
  hold(w, A, 0, "released");
  assert.equal(ask().may, false, "A's entry 1 is still in place");
  hold(w, A, 1, "released", ALICE);
  assert.equal(ask().may, true, "every entry's latest statement is released");
  /* B, in no project, stated by another member: held, then released; an earlier in_place never outweighs a later released */
  hold(w, B, 0, "in_place", CAROL);
  assert.equal(ask().may, false, "an action in no project holds as well");
  hold(w, B, 0, "released", CAROL);
  assert.equal(ask().may, true);
  /* released then in place again: the latest statement decides */
  hold(w, A, 0, "in_place");
  assert.deepEqual([ask().may, w.h.holdInPlace()], [false, true]);
  hold(w, A, 0, "released");
  /* (T45) a whole action's place and a project's place answer as an entry's */
  assert.equal(w.h.actionHold({ target: B, hold: "in_place", reason: "r", viewer: M, author: M }).ok, true);
  assert.equal(ask().may, false, "a whole-action hold");
  assert.equal(w.h.actionHoldRelease({ target: B, reason: "r", viewer: M, author: M }).ok, true);
  const P2 = w.project("alice");
  assert.equal(w.h.actionHold({ project: P2, hold: "in_place", reason: "r", viewer: M, author: M }).ok, true);
  assert.equal(ask().may, false, "a project hold");
  assert.equal(w.h.actionHoldRelease({ project: P2, reason: "r", viewer: M, author: M }).ok, true);
  assert.equal(ask().may, true);
});

test("R4 a reader whose read fails answers true, so doorbell may not clear; the reader writes nothing and never throws", () => {
  const { w, doorbell } = ground();
  assert.equal(doorbell.mayClearDiscarded().may, true);
  w.st.db.exec(`ALTER TABLE action_holds RENAME TO action_holds_away`);
  assert.doesNotThrow(() => w.h.holdInPlace());
  assert.equal(w.h.holdInPlace(), true);
  const failed = doorbell.mayClearDiscarded();
  assert.deepEqual([failed.may, failed.basis], [false, "action-holds reports a litigation hold in place"]);
  w.st.db.exec(`ALTER TABLE action_holds_away RENAME TO action_holds`);
  assert.equal(doorbell.mayClearDiscarded().may, true, "readable again: no hold");
  const before = state(w);
  for (let i = 0; i < 3; i++) { doorbell.mayClearDiscarded(); w.h.holdInPlace(); }
  assert.equal(state(w), before);
  hold(w, A, 0, "in_place");
  const held = state(w);
  for (let i = 0; i < 3; i++) assert.equal(doorbell.mayClearDiscarded().may, false);
  assert.equal(state(w), held, "the hold table and every action unchanged");
});

test("R4 registered once per host: a second actionHoldsOf registers nothing, and doorbell holds the one reader, this module's; a doorbell given none holds none", () => {
  const { w, doorbell } = ground();
  const calls = [];
  const register = doorbell.registerReader.bind(doorbell);
  doorbell.registerReader = (...x) => { calls.push(x); return register(...x); };
  try {
    assert.equal(actionHoldsOf(w.host), w.h, "the one instance per host");
    assert.equal(actionHoldsOf(w.host, { doorbell }), w.h);
    assert.deepEqual(calls, [], "a second actionHoldsOf registers nothing");
  } finally { doorbell.registerReader = register; }
  const other = doorbell.registerReader("litigation-hold", "monitoring", () => false);
  assert.deepEqual([other.ok, other.reason, other.module], [false, "LISTENER_DECLARED", "action-holds"]);
  hold(w, A, 0, "in_place");
  assert.equal(doorbell.mayClearDiscarded().may, false, "still this module's reader that answers");
  /* negative control: told `doorbell: null` (and actions none), a fresh world's doorbell holds none, fail-closed */
  const bare = world({ holds: { doorbell: null } });
  const empty = doorbellOf(bare.host).mayClearDiscarded();
  assert.deepEqual([empty.may, empty.basis], [false, "no reader of litigation holds is registered, so a hold cannot be ruled out"]);
  /* a reader held by another module is a defect of the wiring: thrown at start */
  const held = (module) => ({ registerReader: () => ({ ok: false, reason: "LISTENER_DECLARED", module }) });
  for (const module of ["action-holds"])
    assert.ok(actionHoldsOf({ storage: w.st }, { record: w.record, membership: w.membership, doorbell: held(module), ratification: null }),
      `a reader held by ${module} stands`);
  assert.throws(() => actionHoldsOf({ storage: w.st }, { record: w.record, membership: w.membership, doorbell: held("monitoring"),
    ratification: null }), /doorbell refused the litigation-hold reader: LISTENER_DECLARED \(held by monitoring\)/);
});

test("R4 R10 R13 the copy window has ended (reconciliation R19; B5): actions registers neither reader and declares none of the hold tables; this module holds both registrations and all five declarations, and one held by actions is now a fault of the wiring", () => {
  const { w, doorbell } = ground();
  assert.match(doorbell.mayClearDiscarded().basis, /^action-holds reports/, "the doorbell reader is this module's");
  assert.equal(w.holdReaders.length, 1, "the ratification reader is this module's");
  assert.equal((w.reg.holdReaders ?? []).length, 0, "actions registered none");
  assert.equal(typeof w.a.holdInPlace, "undefined", "actions holds no hold reader any more");
  const declared = Object.fromEntries(w.record.declaredTables().map((d) => [d.name, d.module]));
  assert.deepEqual(["action_pressure", "action_holds", "action_hold_projects", "hold_notices", "pressure_records"].map((t) => declared[t]),
    Array(5).fill("action-holds"));
  hold(w, A, 0, "in_place");
  assert.deepEqual([doorbell.mayClearDiscarded().may, w.holdReaders[0].holdsOn({ project: w.h.holdsOf({ target: A, ord: 0, viewer: M }).holds[0].projects[0] }).held],
    [false, true]);
  const held = (module) => ({ registerReader: () => ({ ok: false, reason: "LISTENER_DECLARED", module }) });
  assert.throws(() => actionHoldsOf({ storage: w.st }, { record: w.record, membership: w.membership, doorbell: held("actions"),
    ratification: null }), /held by actions/, "a reader held by actions is no longer the copy window");
});

test("R4 R9 the whole-store purge answers exactly as the litigation-hold reader, in every hold state and when the holds cannot be read", () => {
  const { w, doorbell } = ground();
  const agree = (want, why) => {
    assert.equal(w.h.holdInPlace(), want, why);
    assert.equal(w.h.purgeHeld(), want, why);
    assert.equal(w.h.purgeHeld({ bundleId: "" }), want, why);
    assert.equal(doorbell.mayClearDiscarded().may, !want, why);
  };
  agree(false, "no hold");
  hold(w, A, 0, "in_place");
  agree(true, "one in place");
  hold(w, B, 0, "in_place", CAROL);
  hold(w, A, 0, "released");
  agree(true, "B still in place");
  hold(w, B, 0, "released", CAROL);
  agree(false, "every hold released");
  w.st.db.exec(`ALTER TABLE action_holds RENAME TO action_holds_away`);
  agree(true, "unreadable");
  w.st.db.exec(`ALTER TABLE action_holds_away RENAME TO action_holds`);
  agree(false, "readable again");
});

/* ---------------------------------------------------------------- R10 */

function projects() {
  const w = world();
  const P1 = w.project("alice"), P2 = w.project("alice", "discoverable"), P3 = w.project("carol");
  w.action(A, [`project: ${P1}`, ...received(1)]);
  w.action(B, received(1));
  w.action(C, [`project: ${P3}`, ...received(1)], { author: CAROL });
  for (const [id, who] of [[A, ALICE], [B, ALICE], [C, CAROL]]) w.mark(id, 0, "legal", who);
  const h = (target, who, extra = {}) =>
    assert.equal(w.h.actionHold({ target, ord: 0, hold: "in_place", reason: "preserving", viewer: who, author: who, ...extra }).ok, true);
  const release = (target, who) =>
    assert.equal(w.h.actionHoldRelease({ target, ord: 0, reason: "the matter closed", viewer: who, author: who }).ok, true);
  return { w, P1, P2, P3, hold: h, release };
}

test("R10 at start this module registers once with ratification.registerHoldReader a reader holdsOn({project}); a second actionHoldsOf registers nothing", () => {
  const w = world();
  assert.equal(w.holdReaders.length, 1, "registered once");
  assert.equal(typeof w.holdReaders[0].holdsOn, "function");
  assert.equal(actionHoldsOf(w.host), w.h, "the one instance per host");
  assert.equal(w.holdReaders.length, 1, "a second actionHoldsOf registers nothing");
  assert.deepEqual(w.holdReaders[0].holdsOn({ project: "PROJ-2026-0001-x" }), { held: false });
  assert.doesNotThrow(() => world({ holds: { ratification: null } }));
});

test("R10 holdsOn answers R7's answer for one project read as the plane, whatever the viewer: held with since and recorded_by, or false after reading every hold; it names no action, entry or reason", () => {
  const { w, P1, P2, P3, hold, release } = projects();
  const on = (project) => w.holdReaders[0].holdsOn({ project });
  assert.deepEqual([P1, P2, P3].map(on), [{ held: false }, { held: false }, { held: false }], "no hold in place");
  hold(A, ALICE, { projects: [P2] });
  w.clock.ms += 60000;
  hold(C, CAROL);
  hold(B, ALICE, { projects: [P1] });
  assert.deepEqual(on(P1), { held: true, since: "2026-09-28T12:00:00Z", recorded_by: ALICE }, "the earliest statement still in place");
  assert.deepEqual(on(P2), { held: true, since: "2026-09-28T12:00:00Z", recorded_by: ALICE });
  assert.deepEqual(on(P3), { held: true, since: "2026-09-28T12:01:00Z", recorded_by: CAROL }, "read as the plane, whatever the viewer");
  assert.deepEqual(w.h.projectHolds({ projects: [P3], viewer: ALICE }).projects[0].held, null, "where a viewer's read says nothing");
  for (const p of [P1, P2]) {
    const { project, ...r7 } = w.h.projectHolds({ projects: [p], viewer: ALICE }).projects[0];
    assert.deepEqual(on(p), r7, project);
  }
  assert.deepEqual(Object.keys(on(P1)).sort(), ["held", "recorded_by", "since"]);
  const all = JSON.stringify([P1, P2, P3].map(on));
  for (const named of [A, B, C, "preserving", "a suit", "#0"]) assert.ok(!all.includes(named), `names no ${named}`);
  release(A, ALICE);
  assert.deepEqual([on(P1), on(P2)], [{ held: true, since: "2026-09-28T12:01:00Z", recorded_by: ALICE }, { held: false }]);
  release(B, BOB);
  release(C, CAROL);
  assert.deepEqual([P1, P2, P3, "PROJ-2026-0404-absent", "not a project"].map(on), Array(5).fill({ held: false }));
  /* (T45) a project place holds its project */
  assert.equal(w.h.actionHold({ project: P2, hold: "in_place", reason: "r", viewer: ALICE, author: ALICE }).ok, true);
  assert.equal(on(P2).held, true);
});

test("R10 holdsOn answers null when it cannot complete the read (no project named, the holds unreadable), never false; it writes nothing and never throws", () => {
  const { w, P1, hold } = projects();
  const reader = w.holdReaders[0];
  hold(A, ALICE);
  for (const args of [undefined, null, {}, { project: "" }, { project: "  " }, { project: 7 }, { project: null }, "PROJ"])
    assert.equal(reader.holdsOn(args), null, JSON.stringify(args) ?? "undefined");
  const hostile = new Proxy({}, { get() { throw new Error("no"); } });
  assert.doesNotThrow(() => reader.holdsOn(hostile));
  assert.equal(reader.holdsOn(hostile), null);
  const before = JSON.stringify(["action_holds", "action_hold_projects"].map((t) => w.rows(`SELECT * FROM ${t}`)));
  for (let i = 0; i < 3; i++) reader.holdsOn({ project: P1 });
  assert.equal(JSON.stringify(["action_holds", "action_hold_projects"].map((t) => w.rows(`SELECT * FROM ${t}`))), before);
  for (const table of ["action_holds", "action_hold_projects"]) {
    w.st.db.exec(`ALTER TABLE ${table} RENAME TO away`);
    assert.doesNotThrow(() => reader.holdsOn({ project: P1 }));
    assert.equal(reader.holdsOn({ project: P1 }), null, `${table} unreadable: null, never false`);
    w.st.db.exec(`ALTER TABLE away RENAME TO ${table}`);
  }
  assert.equal(reader.holdsOn({ project: P1 }).held, true, "readable again");
});

/* The real ratification (its R40–R45) on its own fixture's host, as `actions`' T34 test set it: `withHolds` starts
   actions (registering none) and this module on that host, registering R10's reader. */
const Q1 = "INQ-2026-0001-first", CASE = "CASE-2026-0001";
const OWN = { version: "first", claim: "the council approved it", falsifier: "f", falsifier_override: null,
              by: "member:alice", at: "2026-09-01T00:00:00Z" };
async function signing({ withHolds }) {
  const w = rat.world();
  const key = await rat.newKey();
  w.member("alice", { signer: key });
  const P = w.project("Team", "alice");
  w.inquiry(Q1);
  w.bv.conc.set(w.key(P, Q1), OWN);
  const conc = w.r.caseConclusionFor(P, Q1, V("alice"), "open");
  const doc = rat.cleanCase({ caseId: CASE, edition: 1, project: P, members: [{ id: Q1, pin: w.sha(Q1) }] });
  const text = rat.fmText(doc, { raw: ["case_conclusions:", ...caseConclusionRowLines(Q1, conc)], body: rat.CASE_BODY });
  const docSha = w.caseDoc(CASE, 1, text);
  w.pub.facts.set(`${CASE}#1`, { ok: true, doc: { case_id: CASE, edition: 1, doc_sha: docSha, text },
                                 attribution: { reached: [], legacy: [], stated: [], current: [] },
                                 signers: w.credentials.attestingKeys(), memberBasis: null, priorCase: null });
  const sig = await rat.signCase(key, CASE, 1, docSha);
  const scheduled = [];
  w.schedule.scheduleEdition = (a) => (scheduled.push(a), { ok: true, case: a.case, edition: a.edition, state: "waiting",
    at: { ...a.at, zone: "America/Halifax" }, publish_at: "2026-10-09T12:30:00.000Z" });
  w.publication.stampsOf = () => ({ ok: true, stamps: [] });
  const at = { date: "2026-10-09", time: "09:30" };
  const body = { caseId: CASE, edition: 1, docSha, sigArmored: sig, attestorKey: key.keyB64, attestorMember: "alice",
                 gateVersion: "g1", deliveredBy: "member:alice", at };
  const now = () => Date.parse("2026-10-06T12:00:00Z");
  let a = null, h = null;
  if (withHolds) {
    const { actionsOf } = await import("../../../src/actions/index.mjs");
    a = actionsOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion,
      ratification: null, retrieval: null, conformance: {}, doorbell: null, events: null, duties: null,
      content: { captureFor: () => null }, now });
    h = actionHoldsOf(w.host, { record: w.record, membership: w.membership, ratification: w.r, doorbell: null, now });
  }
  const entry = (checked) => ({ case: CASE, edition: 1, doc_sha: docSha, signature: sig, signer: "alice",
    delivered_by: "member:alice", at: { ...at, zone: "America/Halifax" }, publish_at: "2026-10-09T12:30:00.000Z",
    state: "waiting", checked });
  return { w, a, h, P, body, scheduled, entry };
}

test("R10 against ratification R45 (M-T45-7, S1 §D 11): with no reader op=publishat answers SCHEDULE_UNCHECKABLE; with this module's reader registered it no longer does, checked records the holds it answers, and a hold placed since signing stops the scheduled publication", async () => {
  const none = await signing({ withHolds: false });
  const refused = none.w.op("publishat", {}, none.body);
  assert.equal(refused.reason, "SCHEDULE_UNCHECKABLE");
  assert.match(refused.unreadable.map((u) => u.what).join(), /no hold reader is registered/);
  assert.deepEqual(none.scheduled, []);
  const s = await signing({ withHolds: true });
  assert.equal(s.w.r.registerHoldReader({ holdsOn: () => ({ held: false }) }).reason, "HOLD_READER_DECLARED", "this module's is held");
  const ok = s.w.op("publishat", {}, s.body);
  assert.deepEqual([ok.ok, ok.state], [true, "waiting"], JSON.stringify(ok));
  assert.equal(s.scheduled.length, 1);
  assert.deepEqual(JSON.parse(s.scheduled[0].checked.holds).project, { held: false }, "no hold over the case's project");
  /* a litigation hold over the case's project, through this module: signing records it, as R7 answers it */
  const md = actionMd(A, [...CP, "action_kind: other", `project: ${s.P}`, ...received(1)]);
  assert.equal(s.w.promotion.promote({ bundleId: A, base: null, snapKey: "a1", author: ALICE,
    files: [{ path: "bundle.md", text: md }], meta: { object_type: "action" } }).ok, true);
  assert.equal(s.h.actionPressure({ target: A, ord: 0, pressure: { kind: "legal", note: "a suit" }, viewer: ALICE, author: ALICE }).ok, true);
  const checkedBefore = s.scheduled[0].checked;
  assert.equal(s.h.actionHold({ target: A, ord: 0, hold: "in_place", reason: "preserving", viewer: ALICE, author: ALICE }).ok, true);
  assert.equal(s.w.op("publishat", {}, s.body).ok, true);
  assert.deepEqual(JSON.parse(s.scheduled[1].checked.holds).project,
    { held: true, recorded_by: ALICE, since: "2026-10-06T12:00:00Z" });
  /* the scheduled publisher (its R42) reads the hold again at its time: one placed since signing stops it */
  const out = await s.w.r.publishScheduled(s.entry(checkedBefore), "2026-10-09T12:30:00.000Z");
  assert.deepEqual(out.stopped.map((x) => x.code), ["SCHEDULED_HOLD_CHANGED"]);
  assert.equal(s.h.actionHoldRelease({ target: A, ord: 0, reason: "the matter closed", viewer: ALICE, author: ALICE }).ok, true);
  assert.deepEqual(s.h.holdsOn({ project: s.P }), { held: false });
  /* (T45) a hold placed at the project itself stops it as well */
  assert.equal(s.h.actionHold({ project: s.P, hold: "in_place", reason: "a letter came", viewer: ALICE, author: ALICE }).ok, true);
  const again = await s.w.r.publishScheduled(s.entry(checkedBefore), "2026-10-09T12:30:00.000Z");
  assert.deepEqual(again.stopped.map((x) => x.code), ["SCHEDULED_HOLD_CHANGED"]);
});
