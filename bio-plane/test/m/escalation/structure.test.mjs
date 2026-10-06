/* escalation over the record's structure (T33-76; K1442, K1494): the actor resolved to its office entity (R4), stage 7's
   oversight and audit requests read through the `oversees`, `appoints` and `part_of` lines with the profile's flag as
   the fallback, and the targets the record supports offered at stage 7 (R12), and the "what we did" lane of the
   timeline (R30). The real entities, events and lines run on the escalation's own storage (`structure`); the layer-9
   providers are the fixture's stand-ins. Every test drives escalation at its interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, toStage, V, OFFICE, DAY, ms } from "./fixture.mjs";
import { ESCALATION_CHECKS, TIMELINE_KINDS } from "../../../src/escalation/index.mjs";

const read = (w, nowMs) => w.esc.escalationRead({ id: w.E, viewer: V("bob"), ...(nowMs ? { nowMs } : {}) });
const attach = (w, action, extra = {}) => w.esc.escalationAttach({ reason: "This act serves the stage.", id: w.E, action,
  author: V("bob"), viewer: V("bob"), ...extra });
const std = ["STD-2026-0001-a"];
const twoStandards = [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }, { standard: "STD-2026-0002-b", outcome: "noncompliant" }];

/* A structure world whose determination's actor (the clerk's office) carries its office entity. */
function structured({ actorEntity = true } = {}) {
  const w = seeded({ structure: true });
  w.clerk = w.ent("office", "Town Clerk");
  w.D = w.determine({ project: w.P, outcomes: twoStandards,
                      actor: { ...OFFICE.clerk, ...(actorEntity ? { entity_id: w.clerk } : {}) } });
  return w;
}

test("R4 the act's actor is resolved to its office entity (conformance R25's entity_id, read through entities); an actor with no entity, one the registry does not hold, or one not of kind office is stated unresolved with why, and still triggers 1→2", () => {
  const w = structured();
  opened(w);
  let r = read(w);
  assert.deepEqual([r.actor.state, r.actor.entity_id, r.actor.role, r.actor.body, r.actor.label],
                   ["resolved", w.clerk, OFFICE.clerk.role, OFFICE.clerk.body, "Town Clerk"]);
  assert.deepEqual(r.proposed.map((p) => [p.from, p.to]), [[1, 2]]);
  const body = w.ent("body", "Port Ellery Council");
  const cases = [[undefined, /names no office entity/], ["ENT-2026-0999-nothing", /not held/], [body, /of kind body, not an office/]];
  for (const [entity_id, why] of cases) {
    const D = w.determine({ project: w.P, outcomes: twoStandards, actor: { ...OFFICE.clerk, ...(entity_id ? { entity_id } : {}) } });
    const o = w.esc.escalationOpen({ reason: "Worth pursuing.", determination: D, author: V("bob"), viewer: V("bob") });
    assert.equal(o.ok, true, JSON.stringify(o).slice(0, 300));
    r = w.esc.escalationRead({ id: o.id, viewer: V("bob") });
    assert.equal(r.actor.state, "unresolved", String(entity_id));
    assert.match(r.actor.why, why);
    assert.equal(r.actor.entity_id, entity_id ?? null);
    assert.deepEqual(r.proposed.map((p) => [p.from, p.to]), [[1, 2]], "an unresolved actor still triggers");
    assert.equal(r.targets, undefined, "targets are offered at stage 7 only");
  }
  /* the actor is stated at every stage (stage 2's notice reads it) */
  const x = structured();
  toStage(x, 2);
  assert.equal(read(x).actor.entity_id, x.clerk);
});

test("R12 an oversight or audit request lands on a line held on the attachment's day (oversees or appoints, to the actor's office or to an organisation it is part_of), over the profile's oversight: false; with no line held the flag refuses COUNTERPARTY_NOT_OVERSIGHT, naming lines undetermined that day, never read as held; a line out of its dates, reversed or to another office does not count", () => {
  const w = structured();
  toStage(w, 7);
  const harbour = w.ent("office", "Harbour District Board");      // the profile marks it oversight: false
  const council = w.ent("body", "Port Ellery Council");
  const elsewhere = w.ent("office", "Water Board");
  const act = (entity_id, office = OFFICE.harbour) => w.action({ project: w.P, restsOn: [w.D],
    counterparty: { state: "named", ...office, ...(entity_id ? { entity_id } : {}) } });
  const refusedFor = (a, purpose, why) => {
    const before = w.snapshot();
    const r = attach(w, a, { purpose, standards: std });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation],
      [false, "COUNTERPARTY_NOT_OVERSIGHT", "COUNTERPARTY_NOT_OVERSIGHT", "C-116.18", ESCALATION_CHECKS.COUNTERPARTY_NOT_OVERSIGHT.translation], why);
    assert.deepEqual(w.snapshot(), before, `${why}: nothing written`);
    return r;
  };
  /* no line at all: the profile's flag refuses, for both purposes */
  for (const purpose of ["oversight_request", "audit_request"]) refusedFor(act(harbour), purpose, `no line, ${purpose}`);
  /* lines that do not count: out of their dates, reversed, to another office, of another kind */
  w.say("oversees", harbour, w.clerk, { from: "2000-01-01", to: "2010-12-31" });
  w.say("oversees", w.clerk, harbour);
  w.say("oversees", harbour, elsewhere);
  w.say("reports_to", w.clerk, harbour);
  const plain = refusedFor(act(harbour), "audit_request", "no line held on the day");
  assert.equal(plain.undetermined, undefined, "nothing undetermined to name");
  /* a line with no stated end is undetermined on the day: named, never read as held */
  const open = w.say("appoints", harbour, w.clerk, { from: "2015-01-01" });
  const doubt = refusedFor(act(harbour), "oversight_request", "an undetermined line");
  assert.deepEqual(doubt.undetermined.map((u) => [u.line.line_id, u.line.kind]), [[open, "appoints"]]);
  assert.match(doubt.undetermined[0].why, /no end is stated/);
  /* a held line, direct: it lands, over the flag, and the read names the line with both grade axes apart */
  const direct = w.say("oversees", harbour, w.clerk);
  const a1 = act(harbour);
  const r1 = attach(w, a1, { purpose: "oversight_request", standards: std });
  assert.equal(r1.ok, true, JSON.stringify(r1).slice(0, 300));
  /* through an organisation the actor's office is part_of: a second harbour-board entity, the same profile entry */
  const harbour2 = w.ent("office", "Harbour District Board, its audit committee");
  const a2 = act(harbour2);
  refusedFor(a2, "audit_request", "before the part_of route is held");
  const partOf = w.say("part_of", w.clerk, council);
  const appoints = w.say("appoints", harbour2, council);
  assert.equal(attach(w, a2, { purpose: "audit_request", standards: std }).ok, true);
  const items = read(w).actions;
  const it = (a) => items.find((x) => x.action === a);
  assert.equal(it(a1).oversight.state, "held");
  assert.deepEqual(it(a1).oversight.lines.map((l) => [l.line.line_id, l.line.kind, l.line.from, l.line.to, l.line.assertion, l.line.ends.from, l.line.ends.to]),
                   [[direct, "oversees", harbour, w.clerk, "D", "D", "D"]]);
  assert.equal(it(a1).oversight.lines[0].via, undefined);
  assert.deepEqual(it(a2).oversight.lines.map((l) => [l.line.line_id, l.via.line_id, l.via.kind]), [[appoints, partOf, "part_of"]]);
  assert.equal(Object.keys(it(a1).oversight.lines[0].line).includes("grade"), false, "the axes are never composed");
  /* an official request reads the election only, never the lines */
  assert.equal(attach(w, act(harbour), { purpose: "official_request", standards: std }).ok, true);
});

test("R12 the line is judged on the attachment's day: one ending after it lands and is still named held when read later; the profile silent with no line held lands and reads undetermined, listing a line undetermined that day; a flag of true with no line reads as before; an office or actor with no entity cannot be read, so the flag alone speaks", () => {
  const w = structured();
  toStage(w, 7);
  const harbour = w.ent("office", "Harbour District Board");
  const unlisted = w.ent("office", "Water Board");
  const examiner = w.ent("office", "Examiner of Accounts");
  const act = (office, entity_id) => w.action({ project: w.P, restsOn: [w.D],
    counterparty: { state: "named", ...office, ...(entity_id ? { entity_id } : {}) } });
  /* the line ends 2026-09-30; the attachment is on 2026-09-28 */
  const until = w.say("oversees", harbour, w.clerk, { from: "2020-01-01", to: "2026-09-30" });
  const a = act(OFFICE.harbour, harbour);
  assert.equal(attach(w, a, { purpose: "oversight_request", standards: std }).ok, true);
  const later = read(w, ms("2026-12-01T00:00:00Z"));
  assert.deepEqual(later.actions.find((x) => x.action === a).oversight.lines.map((l) => l.line.line_id), [until]);
  /* the same line no longer holds on a later attachment's day */
  w.clock.now = "2026-10-05T00:00:00Z";
  assert.equal(attach(w, act(OFFICE.harbour, harbour), { purpose: "oversight_request", standards: std }).reason, "COUNTERPARTY_NOT_OVERSIGHT");
  /* the profile silent: lands; undetermined, with the line undetermined that day */
  const vague = w.say("oversees", unlisted, w.clerk, { from: "2025-01-01" });
  const u = act(OFFICE.unlisted, unlisted);
  assert.equal(attach(w, u, { purpose: "audit_request", standards: std }).ok, true);
  /* the profile marks the examiner an oversight body: no line, no key, as before */
  const ex = act(OFFICE.examiner, examiner);
  assert.equal(attach(w, ex, { purpose: "audit_request", standards: std }).ok, true);
  /* no entity on the office: no line can be read */
  const noEnt = act(OFFICE.unlisted);
  assert.equal(attach(w, noEnt, { purpose: "oversight_request", standards: std }).ok, true);
  const items = read(w).actions;
  const it = (x) => items.find((y) => y.action === x);
  assert.equal(it(u).oversight.state, "undetermined");
  assert.deepEqual(it(u).oversight.undetermined.map((x) => x.line.line_id), [vague]);
  assert.equal(it(ex).oversight, undefined);
  assert.equal(it(noEnt).oversight.state, "undetermined");
  assert.match(it(noEnt).oversight.lines_unread, /names no entity/);
  /* the actor unresolved: a line to nothing the record resolves is not read, and the flag refuses */
  const y = structured({ actorEntity: false });
  toStage(y, 7);
  const h = y.ent("office", "Harbour District Board");
  const clerk2 = y.ent("office", "Town Clerk");
  y.say("oversees", h, clerk2);
  const ya = y.action({ project: y.P, restsOn: [y.D], counterparty: { state: "named", ...OFFICE.harbour, entity_id: h } });
  assert.equal(attach(y, ya, { purpose: "oversight_request", standards: std }).reason, "COUNTERPARTY_NOT_OVERSIGHT");
});

test("R12 at stage 7 the read offers the offices holding an oversees or appoints line to the actor's office, or to an organisation it is part_of, on the read's day, each with its line; lines undetermined that day apart with why; never chosen; undetermined when the actor is unresolved", () => {
  const w = structured();
  toStage(w, 4);
  const harbour = w.ent("office", "Harbour District Board");
  const auditor = w.ent("office", "City Auditor");
  const council = w.ent("body", "Port Ellery Council");
  const mayor = w.ent("office", "Mayor");
  const direct = w.say("oversees", harbour, w.clerk);
  const partOf = w.say("part_of", w.clerk, council);
  const viaCouncil = w.say("appoints", mayor, council);
  const doubtful = w.say("oversees", auditor, w.clerk, { from: "2026-01-01" });
  w.say("oversees", auditor, w.clerk, { from: "2000-01-01", to: "2005-12-31" });        /* out: not offered */
  assert.equal(read(w).targets, undefined, "not at stage 4");
  w.esc.escalationEvaluate({ id: w.E, response: { action: w.N, ord: w.R }, reading: "denied", reason: "No.", author: V("bob"), viewer: V("bob") });
  assert.equal(w.esc.escalationAdvance({ id: w.E, to: 7, reason: "Go.", author: V("bob"), viewer: V("bob") }).ok, true);
  const t = read(w, ms("2026-10-01T12:00:00Z")).targets;
  assert.deepEqual([t.state, t.on], ["held", "2026-10-01"]);
  assert.deepEqual(t.offices.map((o) => [o.entity, o.line.line_id, o.via ? o.via.line_id : null]),
                   [[harbour, direct, null], [mayor, viaCouncil, partOf]]);
  assert.deepEqual(t.undetermined.map((o) => [o.entity, o.line.line_id]), [[auditor, doubtful]]);
  assert.match(t.says, /offered/);
  assert.equal("chosen" in t, false);
  /* a part_of line undetermined on the day: what it leads to is undetermined too */
  const fuzzy = w.ent("body", "Harbour Trust");
  w.say("part_of", w.clerk, fuzzy, { from: "2026-01-01" });
  const trustee = w.ent("office", "Trust Chair");
  w.say("oversees", trustee, fuzzy);
  const t2 = read(w, ms("2026-10-01T12:00:00Z")).targets;
  const ofTrust = t2.undetermined.find((o) => o.entity === trustee);
  assert.match(ofTrust.why, /part_of line is undetermined/);
  assert.equal(t2.offices.some((o) => o.entity === trustee), false);
  /* the actor unresolved */
  const y = structured({ actorEntity: false });
  toStage(y, 7);
  const ty = read(y).targets;
  assert.deepEqual([ty.state, ty.offices, ty.undetermined], ["undetermined", [], []]);
  assert.match(ty.why, /unresolved/);
});

test("R30 escalation registers once with events.registerEventSource at start; for an explicit set, its source answers each act on the escalations the viewer may see whose determination's act event or actor office entity is in the set, as {at, label, ref, kind}, oldest first, within from–to, bounded by limit; an attachment the viewer may not see is withheld; no viewer, no item; writes nothing", () => {
  const w = structured();
  assert.deepEqual([w.source.module, w.source.registrations], ["escalation", 1]);
  const evt = "EVT-2026-0001-meeting";
  w.D = w.determine({ project: w.P, outcomes: twoStandards, event: evt, actor: { ...OFFICE.clerk, entity_id: w.clerk } });
  toStage(w, 5);
  const a5 = w.action({ project: w.P, restsOn: [w.D] });
  w.clock.now = "2026-09-29T00:00:00Z";
  assert.equal(attach(w, a5).ok, true);
  w.clock.now = "2026-09-30T00:00:00Z";
  assert.equal(w.esc.escalationDecline({ id: w.E, to: 7, reason: "Not yet.", author: V("bob"), viewer: V("bob") }).ok, true);
  w.clock.now = "2026-10-01T00:00:00Z";
  assert.equal(w.esc.escalationSuspend({ id: w.E, reason: "Hold.", author: V("bob"), viewer: V("bob") }).ok, true);
  w.clock.now = "2026-10-02T00:00:00Z";
  assert.equal(w.esc.escalationResume({ id: w.E, author: V("bob"), viewer: V("bob") }).ok, true);
  /* the end: compliance restored and the consequences addressed */
  w.clock.now = "2026-10-03T00:00:00Z";
  w.determine({ project: w.P, act: w.determinations.get(w.D).act.id, outcomes: twoStandards.map((o) => ({ ...o, outcome: "compliant" })) });
  w.addressedBy.set(w.D, { state: "addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  assert.equal(w.esc.escalationEnd({ id: w.E, author: V("bob"), viewer: V("bob") }).ok, true);
  /* another escalation, of an act by another office, is not in the set */
  const other = w.determine({ project: w.P, outcomes: twoStandards, actor: { ...OFFICE.board, entity_id: w.ent("office", "Selectboard") } });
  w.esc.escalationOpen({ reason: "Also.", determination: other, author: V("bob"), viewer: V("bob") });
  const before = w.snapshot();
  const src = (q) => w.source.fn({ viewer: V("bob"), ...q });
  const all = src({ set: [w.clerk] });
  const history = read(w).history;
  assert.deepEqual(all.items.map((x) => x.kind), history.map((h) => h.kind));
  assert.deepEqual(all.items.map((x) => x.at), history.map((h) => h.at));
  assert.ok(all.items.every((x) => x.ref === w.E && Object.keys(x).sort().join() === "at,kind,label,ref"));
  assert.deepEqual([...new Set(all.items.map((x) => x.kind))].sort(), [...TIMELINE_KINDS].sort());
  const label = (k) => all.items.find((x) => x.kind === k).label;
  assert.equal(label("open"), `Escalation ${w.E} opened at stage 1 (documentation)`);
  assert.equal(all.items.filter((x) => x.kind === "advance")[0].label, `Escalation ${w.E} advanced from stage 1 (documentation) to stage 2 (notification)`);
  assert.equal(label("evaluate"), `A response evaluated in escalation ${w.E}: denied`);
  assert.equal(label("decline"), `Escalation ${w.E}: the move from stage 5 (legal_tools) to stage 7 (political_accountability) declined for now`);
  assert.equal(label("end"), `Escalation ${w.E} ended`);
  assert.ok(all.items.some((x) => x.label === `Action ${a5} attached to escalation ${w.E} at stage 5 (legal_tools)`));
  assert.equal(all.truncated, false);
  /* the act's event names it too; an id of neither, or an empty set, names nothing */
  assert.deepEqual(src({ set: [evt] }).items, all.items);
  assert.deepEqual(src({ set: "ENT-2026-0999-other," + w.clerk }).items, all.items, "a comma list, as events passes its set");
  assert.deepEqual(src({ set: ["ENT-2026-0999-other"] }).items, []);
  assert.deepEqual(src({ set: [] }).items, []);
  /* from–to: a day bound covers its day; an instant bound is exact */
  const days = (q) => src({ set: [w.clerk], ...q }).items.map((x) => x.at);
  assert.deepEqual(days({ from: "2026-09-30", to: "2026-10-01" }), ["2026-09-30T00:00:00Z", "2026-10-01T00:00:00Z"]);
  assert.deepEqual(days({ from: "2026-10-01T00:00:01Z" }), ["2026-10-02T00:00:00Z", "2026-10-03T00:00:00Z"]);
  /* limit: oldest first, the rest truncated; clamped to 1–500 */
  const two = src({ set: [w.clerk], limit: 2 });
  assert.deepEqual([two.items, two.truncated, two.limit], [all.items.slice(0, 2), true, 2]);
  assert.equal(src({ set: [w.clerk], limit: 9999 }).limit, 500);
  assert.equal(src({ set: [w.clerk], limit: 0 }).limit, 100);
  /* sight: carol, outside the project, and no viewer at all, see nothing; an action the viewer may not see is withheld */
  assert.deepEqual(src({ set: [w.clerk], viewer: V("carol") }).items, []);
  assert.deepEqual(w.source.fn({ set: [w.clerk] }).items, [], "no viewer named, no item (R20)");
  w.actionHidden.add(a5);
  const seenByBob = src({ set: [w.clerk] }).items;
  assert.equal(seenByBob.some((x) => x.label.includes(a5)), false);
  assert.equal(seenByBob.length, all.items.length - 1);
  assert.deepEqual(src({ set: [w.clerk], viewer: V("alice") }).items, all.items, "alice may see it");
  assert.deepEqual(w.snapshot(), before, "the source writes nothing");
});

test("R30 over the real events: escalation is registered in the timeline's \"what we did\" lane, apart from \"what they did\"; a second registration is refused by events (membership's listener rule)", () => {
  const w = structured();
  opened(w);
  const t = w.ev.timeline({ set: [w.clerk], viewer: V("bob") });
  assert.equal(t.ok, true, JSON.stringify(t).slice(0, 300));
  assert.equal(t.ours.label, "what we did");
  const mine = t.ours.sources.find((s) => s.source === "escalation");
  assert.ok(mine, JSON.stringify(t.ours).slice(0, 300));
  assert.equal(mine.error, undefined);
  assert.ok(Array.isArray(mine.items));
  assert.equal(t.world.label, "what they did");
  const again = w.ev.registerEventSource("escalation", () => []);
  assert.deepEqual([again.ok, again.reason], [false, "LISTENER_DECLARED"]);
  void DAY;
});

test("R29 a T33 act (conformance R25) is worded from its event: its kind and its when as events holds it (a day, a span with precision and zone, on or before, placed nowhere, undetermined with why), never a guessed date or an invented description; a pre-T33 act keeps its description and date", () => {
  const w = seeded();
  const cases = [
    [{ start: "2026-03-02T00:00:00Z", end: "2026-03-03T00:00:00Z", precision: "day", zone: "UTC" }, null, "on 2026-03-02 (to the day, UTC)"],
    [{ start: "2026-03-01T00:00:00Z", end: "2026-04-01T00:00:00Z", precision: "month", zone: "America/Halifax" }, null,
     "between 2026-03-01T00:00:00Z and 2026-04-01T00:00:00Z (to the month, America/Halifax)"],
    [{ start: null, end: "2026-03-05T12:00:00Z", precision: "minute" }, null, "on or before 2026-03-05T12:00:00Z (to the minute)"],
    [null, null, "at no date the record holds (placed nowhere; undetermined)"],
    ["undetermined", "cache stale", "at a date that is undetermined (cache stale)"],
  ];
  for (const [when, why, words] of cases) {
    const D = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
    const d = w.determinations.get(D);
    d.act = { id: "EVT-2026-0001-order", event: "EVT-2026-0001-order", actor: OFFICE.clerk, evidence: ["c1"], when };
    d.event = { id: "EVT-2026-0001-order", kind: "order", when, ...(why ? { why } : {}) };
    const r = w.esc.escalationReasonDraft({ determination: D, viewer: V("bob") });
    assert.equal(r.parts[1].text, `The act determined (EVT-2026-0001-order): the event EVT-2026-0001-order (order), by `
      + `${OFFICE.clerk.role}, ${OFFICE.clerk.body}, ${words}.`, JSON.stringify(when));
  }
  /* pre-T33: the description and date as recorded */
  const old = w.determine({ project: w.P, outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  const r = w.esc.escalationReasonDraft({ determination: old, viewer: V("bob") });
  assert.match(r.parts[1].text, /: "the act", by Town Clerk, City of Port Ellery, on 2026-09-01\.$/);
});
