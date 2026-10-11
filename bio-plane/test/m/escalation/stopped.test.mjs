/* escalation, T45: stopped pursuing (R31) and what follows it (R1's ALREADY_OPEN, R2's read, R16's list, R25's arms),
   each driven at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, toStage, V, MACHINE, ms } from "./fixture.mjs";
import { ESCALATION_CHECKS } from "../../../src/escalation/index.mjs";

const by = (who) => ({ author: V(who), viewer: V(who) });
const stop = (w, extra = {}) => w.esc.escalationStopPursuing({ id: w.E, reason: "The group has stopped pursuing it.", ...by("bob"), ...extra });
const reopen = (w, extra = {}) => w.esc.escalationReopen({ id: w.E, reason: "New evidence; we pick it up again.", ...by("bob"), ...extra });
const read = (w, nowMs) => w.esc.escalationRead({ id: w.E, viewer: V("bob"), ...(nowMs ? { nowMs } : {}) });

test("R31 escalationStopPursuing refuses in order MACHINE_CANNOT_STOP, NO_SUCH_ESCALATION, NOT_OPEN (ended or already stopped), ESCALATION_NO_REASON; otherwise the state is stopped_pursuing at the stage, with the reason, who and when; a suspended one may be stopped; nothing refused is written", () => {
  const w = seeded();
  toStage(w, 3);
  const before = w.snapshot();
  for (const author of [MACHINE, "", undefined])
    assert.equal(stop(w, { author, id: "ESC-none" }).reason, "MACHINE_CANNOT_STOP", String(author));
  assert.equal(stop(w, { id: "ESC-2026-0999-escalation" }).reason, "NO_SUCH_ESCALATION");
  assert.equal(stop(w, by("carol")).reason, "NO_SUCH_ESCALATION", "unseen is absent");
  for (const reason of [undefined, "", "  ", "x".repeat(2001)]) assert.equal(stop(w, { reason }).reason, "ESCALATION_NO_REASON");
  assert.deepEqual(w.snapshot(), before, "no refusal writes anything");
  /* a suspended one may be stopped */
  assert.equal(w.esc.escalationSuspend({ id: w.E, reason: "Hold.", ...by("bob") }).ok, true);
  w.clock.now = "2026-09-29T00:00:00Z";
  const r = stop(w);
  assert.deepEqual([r.ok, r.state, r.stage, r.reason, r.author, r.at],
    [true, "stopped_pursuing", 3, "The group has stopped pursuing it.", V("bob"), "2026-09-29T00:00:00Z"]);
  assert.match(r.says, /not ended and not a success/);
  const h = read(w).history.at(-1);
  assert.deepEqual([h.kind, h.from, h.reason, h.author, h.at], ["stopped_pursuing", 3, r.reason, V("bob"), r.at]);
  assert.equal(w.fm(w.E).current_state, "stopped_pursuing");
  assert.equal(w.record.head(w.E).currentState, "stopped_pursuing");
  /* already stopped: NOT_OPEN, naming the state; the widened translation */
  const again = stop(w);
  assert.deepEqual([again.reason, again.state, again.check], ["NOT_OPEN", "stopped_pursuing", "C-116.27"]);
  assert.match(again.translation, /stopped pursuing is reopened first/);
  /* the rows: their own codes and C-116 rows */
  assert.deepEqual([ESCALATION_CHECKS.MACHINE_CANNOT_STOP.check, ESCALATION_CHECKS.NOT_STOPPED.check], ["C-116.47", "C-116.48"]);
  /* an ended escalation is NOT_OPEN */
  const x = seeded();
  x.clock.now = "2026-09-20T00:00:00Z";
  opened(x);
  x.determine({ project: x.P, act: x.determinations.get(x.D).act.id, at: "2026-09-21T00:00:00Z",
                outcomes: [{ standard: "STD-2026-0001-a", outcome: "compliant" }, { standard: "STD-2026-0002-b", outcome: "compliant" }] });
  x.addressedBy.set(x.D, { state: "addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  assert.equal(x.esc.escalationEnd({ id: x.E, ...by("bob") }).ok, true);
  assert.deepEqual([stop(x).reason, stop(x).state], ["NOT_OPEN", "ended"]);
});

test("R31 a stopped escalation proposes nothing (proposed [], its triggers answered as facts), is never ended and never answered as success, cannot be suspended, and R1 answers ALREADY_OPEN for its determination, naming it; control: an open escalation at the same stage still proposes its met edges", () => {
  const ctl = seeded();
  opened(ctl);
  const open = read(ctl);
  assert.deepEqual(open.proposed.map((p) => [p.from, p.to]), [[1, 2]], "control: open at stage 1 proposes 1→2");
  const w = seeded();
  opened(w);
  assert.equal(stop(w).ok, true);
  const r = read(w);
  assert.deepEqual([r.state, r.stage, r.proposed], ["stopped_pursuing", 1, []]);
  assert.deepEqual(r.triggers.map((t) => [t.to, t.met]), [[2, true]], "the trigger is a fact of the record still");
  assert.equal(r.stopped.stage, 1);
  assert.match(r.stopped.says, /not ended and it is not a success/);
  assert.equal(r.ended, undefined);
  /* the edges and the end are refused, nothing written */
  const before = w.snapshot();
  assert.equal(w.esc.escalationAdvance({ id: w.E, to: 2, reason: "Go.", ...by("bob") }).reason, "NOT_OPEN");
  assert.equal(w.esc.escalationDecline({ id: w.E, to: 2, reason: "No.", ...by("bob") }).reason, "NOT_OPEN");
  w.addressedBy.set(w.D, { state: "addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  assert.equal(w.esc.escalationEnd({ id: w.E, ...by("bob") }).reason, "NOT_OPEN");
  assert.equal(w.esc.escalationSuspend({ id: w.E, reason: "Hold.", ...by("bob") }).reason, "NOT_OPEN");
  assert.equal(w.esc.escalationResume({ id: w.E, ...by("bob") }).reason, "NOT_SUSPENDED");
  /* R1, R27: the determination's escalation still stands */
  const o = w.esc.escalationOpen({ reason: "Again.", determination: w.D, ...by("alice") });
  assert.deepEqual([o.reason, o.escalation], ["ALREADY_OPEN", w.E]);
  assert.equal(w.esc.declineToEscalate({ reason: "Not now.", determination: w.D, ...by("alice") }).reason, "ALREADY_OPEN");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* R22 answers it with its state */
  assert.deepEqual(w.esc.escalationsFor({ determination: w.D, viewer: V("bob") }).items.map((x) => x.state), ["stopped_pursuing"]);
});

test("R31 escalationReopen returns a stopped escalation to open at the stage where it stopped; MACHINE_CANNOT_STOP first, NO_SUCH_ESCALATION, NOT_STOPPED (open, suspended or ended), ESCALATION_NO_REASON; both acts append-only (R18); reopened, it proposes again", () => {
  const w = seeded();
  toStage(w, 2);
  const before = w.snapshot();
  assert.equal(reopen(w, { author: MACHINE, id: "ESC-none" }).reason, "MACHINE_CANNOT_STOP");
  assert.equal(reopen(w, { id: "ESC-2026-0999-escalation" }).reason, "NO_SUCH_ESCALATION");
  const ns = reopen(w);
  assert.deepEqual([ns.reason, ns.state, ns.check], ["NOT_STOPPED", "open", "C-116.48"]);
  assert.equal(w.esc.escalationSuspend({ id: w.E, reason: "Hold.", ...by("bob") }).ok, true);
  assert.equal(reopen(w).reason, "NOT_STOPPED", "suspended is not stopped");
  w.esc.escalationResume({ id: w.E, ...by("bob") });
  const texts = [w.text(w.E)];
  w.clock.now = "2026-09-29T00:00:00Z";
  assert.equal(stop(w).ok, true);
  texts.push(w.text(w.E));
  const mid = w.snapshot();
  assert.equal(reopen(w, { reason: " " }).reason, "ESCALATION_NO_REASON");
  assert.deepEqual(w.snapshot(), mid);
  w.clock.now = "2026-09-30T00:00:00Z";
  const r = reopen(w, by("alice"));
  assert.deepEqual([r.ok, r.state, r.stage, r.author, r.at], [true, "open", 2, V("alice"), "2026-09-30T00:00:00Z"]);
  texts.push(w.text(w.E));
  const logOf = (t) => t.slice(t.indexOf("## Escalation Log"), t.indexOf("## Session Log")).trimEnd();
  for (let i = 1; i < texts.length; i++) assert.ok(logOf(texts[i]).startsWith(logOf(texts[i - 1])), `act ${i}`);
  assert.deepEqual(read(w).history.slice(-2).map((h) => [h.kind, h.from, h.author]),
    [["stopped_pursuing", 2, V("bob")], ["reopened", 2, V("alice")]]);
  assert.deepEqual(w.rows(`SELECT kind FROM escalation_moves WHERE kind IN ('stopped_pursuing','reopened') ORDER BY seq`).map((x) => x.kind),
    ["stopped_pursuing", "reopened"]);
  assert.deepEqual(w.fm(w.E).state_history.slice(-2).map((h) => [h.from_state, h.to_state]),
    [["open", "stopped_pursuing"], ["stopped_pursuing", "open"]]);
  /* reopened, its met edge is proposed again */
  w.correspond(w.N, "sent", "2026-09-02");
  assert.deepEqual(read(w).proposed.map((p) => p.to), [3]);
  void before;
});

test("R16 escalationsDue never lists an escalation stopped_pursuing; control: the same escalation open with its edge met is listed, and again once reopened", () => {
  const w = seeded();
  opened(w);
  const at = ms("2026-10-01T00:00:00Z");
  const due = () => w.esc.escalationsDue({ nowMs: at, viewer: V("bob") }).items.map((x) => [x.id, x.to]);
  assert.deepEqual(due(), [[w.E, 2]], "control: open with 1→2 met is listed");
  assert.equal(stop(w).ok, true);
  assert.deepEqual(due(), []);
  assert.equal(reopen(w).ok, true);
  assert.deepEqual(due(), [[w.E, 2]]);
});

test("R25 the ops map's escalationstoppursuing and escalationreopen arms answer what escalationStopPursuing and escalationReopen answer, with the body's fields and the query's author and viewer set after them", async () => {
  const { escalationOps } = await import("../../../src/escalation/index.mjs");
  const w = seeded();
  opened(w);
  const url = (q) => new URL(`https://plane.test/op?${new URLSearchParams(q)}`);
  const q = url({ author: V("bob"), viewer: V("bob") });
  const s = escalationOps(w.esc, q, { id: w.E, reason: "Stopped.", author: V("mallory") }).escalationstoppursuing();
  assert.deepEqual([s.ok, s.state, s.author], [true, "stopped_pursuing", V("bob")], JSON.stringify(s).slice(0, 300));
  const machine = escalationOps(w.esc, url({ author: "class:ai", viewer: V("bob") }), { id: w.E, reason: "Go." }).escalationreopen();
  assert.equal(machine.reason, "MACHINE_CANNOT_STOP");
  const r = escalationOps(w.esc, q, { id: w.E, reason: "Again." }).escalationreopen();
  assert.deepEqual([r.ok, r.state, r.author], [true, "open", V("bob")]);
});
