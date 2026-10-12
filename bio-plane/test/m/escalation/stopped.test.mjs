/* escalation, T46 (T46-38; N910, N913; K2844, K2953): stopped pursuing built whole (R31, R33), written as the document's
   state along record-grammar R57's edges, its two rows in words.json's words read by key, NOT_OPEN's translation kept
   (R35), and what follows it (R1's ALREADY_OPEN, R2's read, R16's list, R25's arms, R30's timeline), each driven at the
   module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, toStage, V, MACHINE, ms, OFFICE } from "./fixture.mjs";
import { readFileSync } from "node:fs";
import { ESCALATION_CHECKS, ESCALATION_WORDS } from "../../../src/escalation/index.mjs";
import { STATES } from "../../../src/record-grammar/index.mjs";

const LIST = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"));
const WORD = (key) => { const w = LIST.words.find((x) => x.key === key); if (!w) throw new Error(`words.json holds no ${key}`); return w.en; };
/* C-116.27's translation as it stands (R35: kept in T46) */
const NOT_OPEN_KEPT = "The escalation's stage moves only while it is open. A suspended one is resumed first; an ended one never "
  + "moves again. Nothing was written.";

const by = (who) => ({ author: V(who), viewer: V(who) });
const stop = (w, extra = {}) => w.esc.escalationStopPursuing({ id: w.E, reason: "The group has stopped pursuing it.", ...by("bob"), ...extra });
const reopen = (w, extra = {}) => w.esc.escalationReopen({ id: w.E, reason: "New evidence; we pick it up again.", ...by("bob"), ...extra });
const read = (w, nowMs) => w.esc.escalationRead({ id: w.E, viewer: V("bob"), ...(nowMs ? { nowMs } : {}) });

test("R31 R33 escalationStopPursuing refuses in order MACHINE_CANNOT_STOP, NO_SUCH_ESCALATION, NOT_OPEN (ended or already stopped), ESCALATION_NO_REASON; otherwise the state is stopped_pursuing at the stage, with the reason, who and when; a suspended one may be stopped; nothing refused is written", () => {
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
  const machine = stop(w, { author: MACHINE });
  assert.deepEqual([machine.code, machine.check, machine.translation],
    ["MACHINE_CANNOT_STOP", "C-116.47", WORD("refusal.MACHINE_CANNOT_STOP")]);
  assert.deepEqual([again.reason, again.code, again.state, again.check, again.translation],
    ["NOT_OPEN", "NOT_OPEN", "stopped_pursuing", "C-116.27", NOT_OPEN_KEPT]);
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

test("R31 R33 escalationReopen returns a stopped escalation to open at the stage where it stopped; MACHINE_CANNOT_STOP first, NO_SUCH_ESCALATION, NOT_STOPPED (open, suspended or ended), ESCALATION_NO_REASON; both acts append-only (R18); reopened, it proposes again", () => {
  const w = seeded();
  toStage(w, 2);
  const before = w.snapshot();
  assert.equal(reopen(w, { author: MACHINE, id: "ESC-none" }).reason, "MACHINE_CANNOT_STOP");
  assert.equal(reopen(w, { id: "ESC-2026-0999-escalation" }).reason, "NO_SUCH_ESCALATION");
  const ns = reopen(w);
  assert.deepEqual([ns.reason, ns.code, ns.state, ns.check, ns.translation], ["NOT_STOPPED", "NOT_STOPPED", "open", "C-116.48",
    WORD("refusal.NOT_STOPPED")]);
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

test("R33 R21 the stop and the reopening are the document's state: stopping writes stopped_pursuing along record-grammar R57's edge from open or suspended, with prior_state and a state_history entry, and the head, the escalation's row and every read answer the document's state; reopened, open at the stage where it stopped; record-grammar holds no edge from stopped_pursuing but to open (control: an open escalation's document reads open)", async () => {
  assert.deepEqual(STATES.escalation.edges.stopped_pursuing, ["open"]);
  assert.ok(STATES.escalation.edges.open.includes("stopped_pursuing") && STATES.escalation.edges.suspended.includes("stopped_pursuing"));
  const w = seeded();
  toStage(w, 4);
  assert.deepEqual([w.fm(w.E).current_state, w.record.head(w.E).currentState], ["open", "open"], "control");
  w.clock.now = "2026-09-29T00:00:00Z";
  assert.equal(stop(w).ok, true);
  const fm = w.fm(w.E);
  assert.deepEqual([fm.current_state, fm.prior_state, fm.stage], ["stopped_pursuing", "open", 4]);
  assert.deepEqual(fm.state_history.map((h) => [h.from_state, h.to_state]), [["open", "stopped_pursuing"]]);
  assert.equal(w.record.head(w.E).currentState, "stopped_pursuing");
  assert.deepEqual(w.rows(`SELECT state, stage, state_since FROM escalations WHERE escalation_id=?`, w.E),
    [{ state: "stopped_pursuing", stage: 4, state_since: "2026-09-29T00:00:00Z" }]);
  const r = read(w);
  assert.deepEqual([r.state, r.stopped.since, r.stopped.stage], ["stopped_pursuing", "2026-09-29T00:00:00Z", 4]);
  w.clock.now = "2026-09-30T00:00:00Z";
  assert.equal(reopen(w).ok, true);
  const back = w.fm(w.E);
  assert.deepEqual([back.current_state, back.prior_state, back.stage], ["open", "stopped_pursuing", 4]);
  assert.deepEqual([read(w).state, read(w).stage, read(w).stopped], ["open", 4, undefined]);
  /* a suspended one is stopped along suspended → stopped_pursuing */
  const x = seeded();
  opened(x);
  assert.equal(x.esc.escalationSuspend({ id: x.E, reason: "Hold.", ...by("bob") }).ok, true);
  assert.equal(stop(x).ok, true);
  assert.deepEqual(x.fm(x.E).state_history.map((h) => [h.from_state, h.to_state]),
    [["open", "suspended"], ["suspended", "stopped_pursuing"]]);
  /* the record's audit finds every move along a declared edge */
  for (const v of [w, x]) {
    const audit = await v.record.auditPass({ after: "", limit: 50, visible: () => true });
    const mine = (audit.offenders || []).find((o) => o.bundleId === v.E);
    assert.equal(mine, undefined, JSON.stringify(mine));
  }
});

test("R33 the two rows take C-116's next numbers, minted with their translations from words.json, read by key (ESCALATION_WORDS holds words.json's en verbatim, and each row's translation is that word): MACHINE_CANNOT_STOP C-116.47 (refusal.MACHINE_CANNOT_STOP), NOT_STOPPED C-116.48 (refusal.NOT_STOPPED); each number held by one code, each code minted at one site", () => {
  for (const [key, en] of Object.entries(ESCALATION_WORDS)) assert.equal(en, WORD(key), key);
  assert.deepEqual(Object.keys(ESCALATION_WORDS).sort(), ["refusal.MACHINE_CANNOT_STOP", "refusal.NOT_STOPPED"]);
  const rows = { MACHINE_CANNOT_STOP: "C-116.47", NOT_STOPPED: "C-116.48" };
  for (const [code, check] of Object.entries(rows)) {
    const row = ESCALATION_CHECKS[code];
    assert.deepEqual([row.check, row.translation], [check, ESCALATION_WORDS[`refusal.${code}`]], code);
    assert.equal(Object.values(ESCALATION_CHECKS).filter((r) => r.check === check).length, 1, check);
  }
  assert.equal(ESCALATION_CHECKS.MACHINE_CANNOT_STOP.where, "src/escalation/index.mjs #stopArgs > is-stop-member");
  assert.equal(ESCALATION_CHECKS.NOT_STOPPED.where, "src/escalation/index.mjs escalationReopen > is-reopen-stopped");
  /* C-116.46 was the highest before T46: the two follow it */
  const nums = Object.values(ESCALATION_CHECKS).map((r) => Number(r.check.split(".")[1]));
  assert.equal(Math.max(...nums), 48);
});

test("R35 C-116.27 NOT_OPEN keeps its present translation in T46 (words.json's refusal.NOT_OPEN, which says a suspended one is resumed first, is not adopted while R31 stops a suspended one directly), its number and code unchanged, answered alike by an edge on a suspended escalation, an edge on a stopped one and a second stop; the sentence differs from words.json's (control), and this module's other rows are not taken from words.json", () => {
  const row = ESCALATION_CHECKS.NOT_OPEN;
  assert.deepEqual([row.check, row.translation], ["C-116.27", NOT_OPEN_KEPT]);
  assert.notEqual(row.translation, WORD("refusal.NOT_OPEN"), "control: words.json's sentence is not taken");
  assert.equal(Object.values(ESCALATION_CHECKS).filter((r) => r.check === "C-116.27").length, 1);
  const w = seeded();
  opened(w);
  assert.equal(w.esc.escalationSuspend({ id: w.E, reason: "Hold.", ...by("bob") }).ok, true);
  const edge = w.esc.escalationAdvance({ id: w.E, to: 2, reason: "Go.", ...by("bob") });
  assert.deepEqual([edge.reason, edge.check, edge.translation, edge.state], ["NOT_OPEN", "C-116.27", NOT_OPEN_KEPT, "suspended"]);
  assert.equal(stop(w).ok, true, "a suspended one is stopped directly");
  for (const r of [w.esc.escalationAdvance({ id: w.E, to: 2, reason: "Go.", ...by("bob") }), stop(w)])
    assert.deepEqual([r.reason, r.check, r.translation, r.state], ["NOT_OPEN", "C-116.27", NOT_OPEN_KEPT, "stopped_pursuing"]);
});

test("R30 the timeline source answers the stop and the reopening, kind stopped_pursuing and reopened, dated, public, and never with their reasons; control: the opening is answered as before", () => {
  const w = seeded({ structure: true });
  w.clerk = w.ent("office", "Town Clerk");
  w.D = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }],
                      actor: { ...OFFICE.clerk, entity_id: w.clerk } });
  opened(w);
  w.clock.now = "2026-09-29T00:00:00Z";
  assert.equal(stop(w, { reason: "SECRET-stop-reason" }).ok, true);
  w.clock.now = "2026-09-30T00:00:00Z";
  assert.equal(reopen(w, { reason: "SECRET-reopen-reason" }).ok, true);
  const items = w.source.fn({ set: [w.clerk], viewer: V("bob") }).items;
  assert.deepEqual(items.map((x) => [x.kind, x.at, x.public]), [["open", "2026-09-28T01:00:00Z", true],
    ["stopped_pursuing", "2026-09-29T00:00:00Z", true], ["reopened", "2026-09-30T00:00:00Z", true]]);
  assert.equal(JSON.stringify(items).includes("SECRET"), false);
});
