/* reevaluation: a held event moved or a participant of it re-resolved (R34, heard from the real `events`), and a
   calculation's input changed (R35, heard from the real `calculations`); each a cause derived on read, told to R8's
   listeners, answered by R9, closed by R16, writing only R18's rows and moving nothing (R19). The legs on an event, an
   act and a calculation are laid down by a replayed promotion, as no checked leg admits an event in T33 (K1624). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, realUpstreams, V } from "./fixture.mjs";
import { CAUSE_SOURCES, EVENT_CHANGED, EVENT_CHANGES, CALCULATION_INPUT_CHANGED } from "../../../src/reevaluation/index.mjs";

const ADMIN = "class:admin";
const Q = "INQ-2026-0001-q", QA = "INQ-2026-0002-act", QO = "INQ-2026-0003-other", UP = "INQ-2026-0004-up";
const ACT = "ACT-2026-0001";
const LATER = "2026-10-01T00:00:00Z", LATER2 = "2026-10-02T00:00:00Z";

/** The real events, calculations and standards; one event held (attested by alice's testimony), a question resting on
 *  it, one resting on an act aliasing it, one on another event, and one resting on the first question only. */
function eventWorld() {
  const w = world({ upstreams: realUpstreams });
  w.member("alice"); w.member("bob");
  const ev = w.up.events;
  const made = (statement, value) => ev.createEvent({ kind: "meeting", attestations: [{ testimony: statement, value }], by: V("alice") });
  const e = made("I sat through the meeting", "2026-03-01");
  const other = made("A second meeting", "2026-04-01");
  assert.equal(e.ok, true, JSON.stringify(e));
  assert.equal(ev.aliasAct({ actId: ACT, eventId: e.event_id, by: V("alice") }).ok, true);
  w.replayed(Q, [{ target: e.event_id }]);
  w.replayed(QA, [{ target: ACT }]);
  w.replayed(QO, [{ target: other.event_id }]);
  w.inquiry(UP, { legs: [{ target: Q }] });
  const told = [];
  w.r.onBasisChanged("listener", (x) => told.push(x));
  return { w, ev, E: e.event_id, O: other.event_id, told };
}

/** The event's `when` moved by a member choosing a later attestation (events R8, R9), at `at`. */
function moveWhen(w, ev, E, at = LATER, value = "2026-03-05", { project = undefined, by = V("alice") } = {}) {
  w.clock.now = at;
  const a = ev.attest({ eventId: E, attestation: { testimony: "it was the following week", value, ...(project ? { project } : {}) }, by });
  const g = ev.chooseGoverning({ eventId: E, attestationId: a.attestation_id, reason: "the later notice corrects it", by });
  assert.equal(g.ok, true, JSON.stringify(g));
}

test("R34 R8: a held event's when moved is told by events (R16) after commit; the module keeps one row and tells R8's listeners once as event_changed, with the live legs resting on the event or on an ACT- id aliasing it: direct dependents only", () => {
  const { w, ev, E, told } = eventWorld();
  assert.equal(w.count("reevaluation_event_changes"), 0);
  moveWhen(w, ev, E);
  const rows = w.rows(`SELECT * FROM reevaluation_event_changes`);
  assert.deepEqual(rows.map((r) => [r.event_id, r.change, r.at]), [[E, "when_moved", LATER]]);
  assert.deepEqual(Object.keys(rows[0]).sort(), ["at", "change", "change_id", "event_id"], "R18: no value is held");
  const mine = told.filter((t) => t.kind === EVENT_CHANGED);
  assert.equal(mine.length, 1, "told once");
  const [t] = mine;
  assert.deepEqual([t.subject, t.source, t.since, t.change], [E, EVENT_CHANGED, LATER, "when_moved"]);
  assert.deepEqual(t.dependents.map((d) => [d.bundle_id, d.ord, d.target]), [[Q, 0, E], [QA, 0, ACT]],
    "the event's own leg and the act's; never UP, which rests on Q and re-evaluates on its own (one level)");
});

test("R34: a participant re-resolved (events R13) raises event_changed with change participant_re_resolved; R2's cause on read names the event, which of the two changed and since, and the act where the leg names one", () => {
  const { w, ev, E, told } = eventWorld();
  const p1 = w.entities.createEntity({ kind: "person", label: "A. Clerk", note: "n", declaredBy: V("alice") }).entity_id;
  const p2 = w.entities.createEntity({ kind: "person", label: "B. Clerk", note: "n", declaredBy: V("alice") }).entity_id;
  const add = ev.addParticipant({ eventId: E, entityId: p1, role: "present", attestation: { testimony: "the clerk was there" }, by: V("alice") });
  assert.equal(add.ok, true, JSON.stringify(add));
  w.clock.now = LATER;
  const fix = ev.correctParticipant({ participantId: add.participant_id, entityId: p2, reason: "it was the other clerk", by: V("alice") });
  assert.equal(fix.ok, true, JSON.stringify(fix));
  assert.deepEqual(told.filter((x) => x.kind === EVENT_CHANGED).map((x) => x.change), ["participant_re_resolved"]);
  const all = w.r.reevaluations({ viewer: ADMIN });
  const byDep = Object.fromEntries(all.obligations.map((o) => [o.bundle_id, o]));
  assert.deepEqual(Object.keys(byDep).sort(), [Q, QA]);
  const c = byDep[Q].causes[0];
  assert.deepEqual([c.source, c.event, c.change, c.since, c.ord, "act" in c], [EVENT_CHANGED, E, "participant_re_resolved", LATER, 0, false]);
  assert.match(c.detail, /participant re-resolved/);
  const a = byDep[QA].causes[0];
  assert.deepEqual([byDep[QA].target, a.event, a.act], [ACT, E, ACT]);
  assert.equal(byDep[Q].target_state, null, "an event is no bundle: its state reads null, never a deletion");
  assert.ok(!all.obligations.some((o) => o.causes.some((x) => x.source === "deletion")));
});

test("R34 R18: a telling of a change events does not name (merged, split), or about an event no basis leg names, writes nothing; a telling earlier than the dependent's last write raises no cause (only a later one does)", () => {
  const { w, ev, E, O, told } = eventWorld();
  for (const change of ["merged", "split", "", null]) assert.deepEqual(w.r.eventChanged({ eventId: E, change }), { ok: true, kept: false });
  const lone = ev.createEvent({ kind: "vote", attestations: [{ testimony: "a vote nobody cites", value: "2026-05-01" }], by: V("alice") });
  moveWhen(w, ev, lone.event_id);
  assert.equal(w.count("reevaluation_event_changes"), 0, "nothing rests on it: no row");
  assert.deepEqual(EVENT_CHANGES, ["when_moved", "participant_re_resolved"]);
  /* the other event's dependent is written after the telling: no cause */
  moveWhen(w, ev, O, LATER);
  w.replayed(QO, [{ target: O }], { updated: LATER2 });
  const q = w.r.reevaluations({ target: O, viewer: ADMIN });
  assert.equal(q.count, 0, "the telling is not later than QO's last write");
  assert.equal(told.filter((t) => t.kind === EVENT_CHANGED).length, 1);
});

test("R34 N591: since is the instant events' telling states (its R16 at, the write that made the change), never this module's clock at the telling: kept on the row and compared with the dependent's last write", () => {
  const { w, ev, E, told } = eventWorld();
  const CHANGED = "2026-10-01T00:00:00Z", BETWEEN = "2026-10-01T12:00:00Z", HEARD = "2026-10-02T00:00:00Z";
  /* events states its own instant: the one its write stamped, the same for every listener */
  moveWhen(w, ev, E, CHANGED);
  const real = told.filter((t) => t.kind === EVENT_CHANGED);
  assert.deepEqual(real.map((t) => t.since), [CHANGED]);
  assert.deepEqual(w.rows(`SELECT at FROM reevaluation_event_changes`).map((r) => r.at), [CHANGED]);
  /* a telling heard later than the change it states: QA is written between the two, so it already saw the change */
  w.replayed(QA, [{ target: ACT }], { updated: BETWEEN });
  w.clock.now = HEARD;
  const e = w.r.eventChanged({ eventId: E, change: "participant_re_resolved", at: CHANGED });
  assert.deepEqual([e.kept, e.at], [true, CHANGED]);
  assert.deepEqual(w.rows(`SELECT change, at FROM reevaluation_event_changes ORDER BY change_id`).map((r) => [r.change, r.at]),
                   [["when_moved", CHANGED], ["participant_re_resolved", CHANGED]], "never the clock at the telling");
  assert.equal(told.filter((t) => t.kind === EVENT_CHANGED).at(-1).since, CHANGED);
  const byDep = Object.fromEntries(w.r.reevaluations({ viewer: ADMIN }).obligations.map((o) => [o.bundle_id, o]));
  assert.deepEqual(byDep[Q].causes.map((c) => c.since), [CHANGED, CHANGED], "Q was written before the change");
  assert.equal(byDep[QA], undefined, "QA was written after the change, though before it was heard: no cause");
});

test("R34 R21: a telling that states no instant it can order (events R16 states one) is not kept and says why; nothing is told", () => {
  const { w, E, told } = eventWorld();
  for (const at of [undefined, null, "", "not a time"]) {
    const e = w.r.eventChanged({ eventId: E, change: "when_moved", at });
    assert.deepEqual([e.ok, e.kept, typeof e.why], [true, false, "string"]);
  }
  assert.equal(w.count("reevaluation_event_changes"), 0);
  assert.equal(told.filter((t) => t.kind === EVENT_CHANGED).length, 0);
});

test("R34 R9 R16: changesOf answers the cause on the finding; a member's recorded re-evaluation closes it until the event changes again", () => {
  const { w, ev, E } = eventWorld();
  moveWhen(w, ev, E);
  const ch = w.r.changesOf({ findings: [Q, UP], viewer: ADMIN });
  const q = ch.findings.find((f) => f.id === Q);
  assert.deepEqual(q.causes.map((c) => [c.source, c.target, c.event]), [[EVENT_CHANGED, E, E]]);
  assert.deepEqual(ch.findings.find((f) => f.id === UP).causes, [], "one level: UP is not told by this cause");
  const rec = w.r.recordReevaluation({ dependent: Q, target: E, source: EVENT_CHANGED, note: "the meeting was a week later; the finding stands",
                                       author: V("bob"), viewer: ADMIN });
  assert.equal(rec.ok, true, JSON.stringify(rec));
  assert.ok(CAUSE_SOURCES.includes(EVENT_CHANGED) && CAUSE_SOURCES.includes(CALCULATION_INPUT_CHANGED));
  const after = w.r.reevaluations({ target: E, viewer: ADMIN });
  assert.equal(after.count, 0);
  assert.deepEqual(after.closed.map((c) => [c.bundle_id, c.causes[0].source, c.causes[0].closed_by]), [[Q, EVENT_CHANGED, V("bob")]]);
  moveWhen(w, ev, E, LATER2, "2026-03-09");
  assert.equal(w.r.reevaluations({ target: E, viewer: ADMIN }).count, 1, "owed again when the event moves again");
});

test("R34 R20: an event a viewer may not see (events answers it not found to them) is refused as a target, NO_SUCH_BUNDLE, and its obligation is withheld whole from the untargeted listing", () => {
  const { w, ev, E } = eventWorld();
  moveWhen(w, ev, E);
  w.member("carol");
  assert.equal(ev.readEvent({ eventId: E, viewer: V("carol") }).found, true, "a group-wide event every member sees");
  assert.equal(w.r.reevaluations({ target: E, viewer: V("carol") }).ok, true);
  const P = w.project("Hidden work", "bob");
  const hid = ev.createEvent({ kind: "meeting", attestations: [{ testimony: "a closed meeting", value: "2026-06-01", project: P }], by: V("bob") });
  assert.equal(hid.ok, true, JSON.stringify(hid));
  assert.equal(ev.readEvent({ eventId: hid.event_id, viewer: V("carol") }).found, false);
  w.replayed("INQ-2026-0005-h", [{ target: hid.event_id }]);
  moveWhen(w, ev, hid.event_id, LATER2, "2026-06-02", { project: P, by: V("bob") });
  assert.equal(ev.readEvent({ eventId: hid.event_id, viewer: V("carol") }).found, false, "still the project's alone");
  assert.deepEqual(w.r.reevaluations({ target: hid.event_id, viewer: V("carol") }), { ok: false, reason: "NO_SUCH_BUNDLE", target: hid.event_id });
  assert.ok(!w.r.reevaluations({ viewer: V("carol") }).obligations.some((o) => o.target === hid.event_id));
  assert.ok(w.r.reevaluations({ viewer: ADMIN }).obligations.some((o) => o.target === hid.event_id), "a machine credential is not filtered");
});

test("R35 R8 R18: a calculation's input changed is told by calculations (R11) after commit; the module keeps one row (calculation, input, instant; no value) and tells R8's listeners once as calculation_input_changed with the live legs on it; nothing is recomputed here", () => {
  const w = world({ upstreams: realUpstreams });
  w.member("alice"); w.member("bob");
  const told = [];
  w.r.onBasisChanged("listener", (x) => told.push(x));
  w.calculation("CALC-2026-0001", "MNY-2026-0001-fact");
  w.calculation("CALC-2026-0002", "MNY-2026-0001-fact");
  w.replayed(Q, [{ target: "CALC-2026-0001" }]);
  w.inquiry(UP, { legs: [{ target: Q }] });
  const results = w.rows(`SELECT results_json, recompute_status FROM calculations ORDER BY calc_id`);
  w.clock.now = LATER;
  w.up.calculations.moneyChanged({ factId: "MNY-2026-0001-fact", change: "withdrawn" });
  assert.deepEqual(w.rows(`SELECT calc_id, input, at FROM reevaluation_input_changes`).map((r) => [r.calc_id, r.input, r.at]),
                   [["CALC-2026-0001", "MNY-2026-0001-fact", LATER]], "CALC-2026-0002 has no leg on it: no row");
  assert.deepEqual(Object.keys(w.row(`SELECT * FROM reevaluation_input_changes`)).sort(), ["at", "calc_id", "change_id", "input"]);
  const mine = told.filter((t) => t.kind === CALCULATION_INPUT_CHANGED);
  assert.deepEqual(mine.map((t) => [t.subject, t.input, t.since, t.dependents.map((d) => d.bundle_id)]),
                   [["CALC-2026-0001", "MNY-2026-0001-fact", LATER, [Q]]]);
  assert.deepEqual(w.rows(`SELECT results_json FROM calculations ORDER BY calc_id`).map((r) => r.results_json), results.map((r) => r.results_json),
                   "nothing recomputed here");
  const [o] = w.r.reevaluations({ viewer: ADMIN }).obligations;
  assert.deepEqual([o.bundle_id, o.target, o.causes.map((c) => [c.source, c.calculation, c.input, c.since])],
                   [Q, "CALC-2026-0001", [[CALCULATION_INPUT_CHANGED, "CALC-2026-0001", "MNY-2026-0001-fact", LATER]]]);
  assert.ok(!o.causes.some((c) => c.source === "deletion"), "a calculation absent from bundles is not a deletion");
  assert.deepEqual(w.r.changesOf({ findings: [Q, UP], viewer: V("alice") }).findings.map((f) => f.causes.map((c) => c.source)),
                   [[CALCULATION_INPUT_CHANGED], []], "R9 on the finding; one level: UP is not told");
  assert.equal(w.r.inputChanged({ calcId: "" }).kept, false);
});

test("R35 R20: no read here can say whether a member may see a calculation, so its obligation is withheld from a member's listing and refused as their target (fail closed), never shown on a guess; the finding's own causes (R9) still carry it", () => {
  const w = world({ upstreams: realUpstreams });
  w.member("alice");
  w.calculation("CALC-2026-0001", "MNY-2026-0001-fact");
  w.replayed(Q, [{ target: "CALC-2026-0001" }]);
  w.clock.now = LATER;
  w.up.calculations.moneyChanged({ factId: "MNY-2026-0001-fact" });
  assert.equal(w.r.reevaluations({ viewer: V("alice") }).count, 0);
  assert.equal(w.r.reevaluations({ target: "CALC-2026-0001", viewer: V("alice") }).reason, "NO_SUCH_BUNDLE");
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 1);
  assert.equal(w.r.changesOf({ findings: [Q], viewer: V("alice") }).findings[0].causes[0].source, CALCULATION_INPUT_CHANGED);
});

test("R34 R35 R8: the factory registers once on events.onEventChanged and calculations.onInputChanged; a listener that throws on an event_changed or calculation_input_changed telling is named under listeners_failed, and the row stands", () => {
  const w = world();
  assert.deepEqual([w.quiet.reg.events.map((x) => x.m), w.quiet.reg.calculations.map((x) => x.m)], [["reevaluation"], ["reevaluation"]]);
  w.r.onBasisChanged("broken", () => { throw new Error("listener down"); });
  w.replayed(Q, [{ target: "EVT-2026-aaaaaaaaaaaaaaaa" }, { target: "CALC-2026-0009" }]);
  w.clock.now = LATER;
  w.quiet.reg.events[0].fn({ eventId: "EVT-2026-aaaaaaaaaaaaaaaa", change: "when_moved", at: LATER });
  const e = w.r.eventChanged({ eventId: "EVT-2026-aaaaaaaaaaaaaaaa", change: "when_moved", at: LATER });
  assert.deepEqual([e.kept, e.dependents, e.listeners_failed], [true, 1, ["broken"]]);
  const c = w.r.inputChanged({ calcId: "CALC-2026-0009", input: "MNY-2026-0002-x", cause: "calculation_input_changed" });
  assert.deepEqual([c.kept, c.dependents, c.listeners_failed], [true, 1, ["broken"]]);
  assert.equal(w.count("reevaluation_event_changes"), 2);
  assert.equal(w.count("reevaluation_input_changes"), 1);
});

test("R19 (R34, R35): hearing a change and reading its cause move nothing: no leg, basis, strength or document changes", () => {
  const { w, ev, E } = eventWorld();
  const legs = JSON.stringify(w.rows(`SELECT * FROM inquiry_basis ORDER BY bundle_id, ord`));
  const heads = [Q, QA, UP].map((id) => w.record.head(id).bundleSha);
  const strength = JSON.stringify(w.strength.strengthOf(Q));
  moveWhen(w, ev, E);
  w.r.reevaluations({ viewer: ADMIN });
  w.r.changesOf({ findings: [Q], viewer: ADMIN });
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM inquiry_basis ORDER BY bundle_id, ord`)), legs);
  assert.deepEqual([Q, QA, UP].map((id) => w.record.head(id).bundleSha), heads);
  assert.equal(JSON.stringify(w.strength.strengthOf(Q)), strength);
});
