/* duties, T35 (T35-34): a power held, linked to the events that use it (R27), over the real `events` (its R43–R46). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, E, BOB, CAROL, MACHINE, ZONE, evt } from "./fixture.mjs";
import { DUTIES_CHECKS, NEVER_SAID, noSuchDuty, dutiesOps } from "../../../src/duties/index.mjs";

const day = (value) => ({ value, precision: "day", zone: ZONE });
const AT = day("2026-03-01");
const row = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code);
  if (DUTIES_CHECKS[code]) assert.deepEqual([r.check, r.translation], [DUTIES_CHECKS[code].check, DUTIES_CHECKS[code].translation]);
};

/* The clerk's power under a charter section; uses linked by provision (the section, a part of it), one recorded with
   no provision, and uses that are not of this power. */
function powers() {
  const w = world();
  const charter = w.standard({ cite: "Test Code § 502", portion: "s502" });
  const power = w.declare({ modality: "power", obligee: null, performance: { act: "grant variances" },
                            source: { kind: "standard", standard: charter, portion: "s502" }, time: { basis: "window" } }).duty_id;
  const U = {
    byClerk: w.use({ provision: { standard: charter, portion: "s502" }, decider: E.clerk, subject: E.group, value: day("2026-02-02") }),
    waiver: w.use({ kind: "waiver", provision: { standard: charter, portion: "s502/b" }, decider: E.filer, value: day("2026-02-10") }),
    otherPart: w.use({ provision: { standard: charter, portion: "s9" }, decider: E.clerk, value: day("2026-02-12") }),
    unrecorded: w.use({ decider: E.council, value: day("2026-02-15") }),
    nowhere: w.use({ kind: "assessment", provision: { standard: charter, portion: "s502" }, decider: E.auditor }),
    otherLaw: w.use({ provision: { standard: "STD-2026-0099-other", portion: "s502" }, decider: E.clerk, value: day("2026-02-20") }),
  };
  return { w, charter, power, U };
}

test("R27 usesOfPower answers the uses linked by provision (the source's portion, or a part of it), each with the event as events answers it and whether its decider is the obligor, as a fact, never a judgment", () => {
  const { w, power, U } = powers();
  const r = w.duties.usesOfPower({ dutyId: power, viewer: BOB });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(r.items.map((x) => x.event_id), [U.byClerk, U.waiver]);
  assert.deepEqual(r.placed_nowhere.map((x) => x.event_id), [U.nowhere], "an undated use answered apart, never dropped");
  for (const x of [...r.items, ...r.placed_nowhere]) assert.deepEqual(x.linked, ["provision"]);
  const asEvents = w.ev.readEvent({ eventId: U.byClerk, viewer: BOB });
  assert.equal(r.items[0].event.event_id, U.byClerk);
  assert.deepEqual(r.items[0].event.use.provision, (asEvents.event || asEvents).use.provision);
  /* the decider: the office itself; a person with no holding of the office held; no decider */
  assert.equal(r.items[0].decider_is_obligor, true);
  assert.equal(r.items[1].decider_is_obligor, "undetermined");
  assert.match(r.items[1].decider_why, /^the decider is a person, and no holding of the office at the event's date is held/);
  assert.equal(r.placed_nowhere[0].decider_is_obligor, false, "the auditor's office is not the clerk's");
  assert.match(r.says, /a population, not a census/);
  const text = JSON.stringify(r).toLowerCase();
  for (const word of NEVER_SAID) assert.ok(!text.includes(word), word);
  /* a person decider is the obligor's holder where a holding of the office at the event's date is held (lines.holderAt) */
  assert.equal(w.lines.recordLine({ kind: "holds", from: E.filer, to: E.clerk, capacity: "appointed", basis: { statement: "appointed clerk" },
    valid: { from: "2026-01-01", to: "2026-12-31", precision: "day", zone: ZONE }, by: BOB }).ok, true);
  const held = w.duties.usesOfPower({ dutyId: power, viewer: BOB }).items[1];
  assert.deepEqual([held.event_id, held.decider_is_obligor, held.decider_why], [U.waiver, true, undefined]);
  /* paged as events pages: limit, after, truncated */
  const one = w.duties.usesOfPower({ dutyId: power, limit: 1, viewer: BOB });
  assert.deepEqual([one.items.map((x) => x.event_id), one.truncated, one.limit], [[U.byClerk], true, 1]);
  const two = w.duties.usesOfPower({ dutyId: power, limit: 1, after: U.byClerk, viewer: BOB });
  assert.deepEqual([two.items.map((x) => x.event_id), two.truncated], [[U.waiver], false]);
  /* from/to bound the placed uses, as events.usesOf bounds them */
  assert.deepEqual(w.duties.usesOfPower({ dutyId: power, from: "2026-02-05", to: "2026-02-28", viewer: BOB }).items.map((x) => x.event_id), [U.waiver]);
  /* a power whose source names no portion is used by every portion of its standard */
  const whole = w.declare({ modality: "power", obligee: null, performance: { act: "act under the charter" },
                            source: { kind: "standard", standard: w.duties.readDuty({ dutyId: power, viewer: BOB }).duty.source.standard }, time: { basis: "window" } });
  assert.deepEqual(w.duties.usesOfPower({ dutyId: whole.duty_id, viewer: BOB }).items.map((x) => x.event_id), [U.byClerk, U.waiver, U.otherPart]);
});

test("R27 usesOfPower refuses NO_SUCH_DUTY (absent or unseen, alike) and NOT_A_POWER", () => {
  const { w } = powers();
  assert.deepEqual(w.duties.usesOfPower({ dutyId: "DUT-2026-0099", viewer: BOB }), noSuchDuty("DUT-2026-0099"));
  const hidden = w.declare({ modality: "power", obligee: null, project: w.project("bob"), time: { basis: "window" } }).duty_id;
  assert.deepEqual(w.duties.usesOfPower({ dutyId: hidden, viewer: CAROL }), noSuchDuty(hidden));
  assert.equal(w.duties.usesOfPower({ dutyId: hidden, viewer: BOB }).ok, true);
  const obligation = w.declare().duty_id;
  const r = w.duties.usesOfPower({ dutyId: obligation, viewer: BOB });
  row(r, "NOT_A_POWER");
  assert.equal(r.modality, "duty");
});

test("R27 linkUse and unlinkUse are a member's acts: refusals in order, a repeat already, an unlink keeping the link shown unlinked; a member's link joins the uses", () => {
  const { w, power, U } = powers();
  const obligation = w.declare().duty_id;
  const comm = w.event({ concerns: [E.clerk] });
  const link = (over) => w.duties.linkUse({ dutyId: power, eventId: U.unrecorded, reason: "the minutes say it was under s502", by: BOB, ...over });
  const count = () => w.sqlRows(`SELECT COUNT(*) AS n FROM duty_use_links`)[0].n;
  row(link({ by: MACHINE }), "DUTY_MEMBER_ACT_ONLY");
  row(link({ by: "" }), "DUTY_MEMBER_ACT_ONLY");
  assert.deepEqual(link({ dutyId: "DUT-2026-0099" }), noSuchDuty("DUT-2026-0099"));
  row(link({ dutyId: obligation }), "NOT_A_POWER");
  assert.equal(link({ eventId: evt("nothing") }).reason, "NO_SUCH_EVENT");
  const notUse = link({ eventId: comm });
  assert.equal(notUse.reason, "NO_SUCH_EVENT");
  assert.match(notUse.why, /not one of discretion, waiver, assessment/);
  row(link({ reason: " " }), "DUTY_NO_REASON");
  assert.equal(count(), 0, "refusals write nothing");
  w.at("2026-03-03T12:00:00.000Z");
  const a = link();
  assert.deepEqual(a, { ok: true, duty_id: power, event_id: U.unrecorded, act: "link", by: BOB, at: "2026-03-03T12:00:00Z", reason: "the minutes say it was under s502" });
  assert.equal(link({ by: CAROL }).already, true);
  assert.equal(count(), 1);
  const uses = w.duties.usesOfPower({ dutyId: power, viewer: BOB });
  const linked = uses.items.find((x) => x.event_id === U.unrecorded);
  assert.deepEqual([linked.linked, linked.link.by, linked.decider_is_obligor], [["member"], BOB, false]);
  assert.deepEqual(uses.items.map((x) => x.event_id), [U.byClerk, U.waiver, U.unrecorded], "in events' own order");
  /* a member may also link a use the provision already links: both are said */
  w.duties.linkUse({ dutyId: power, eventId: U.byClerk, reason: "also named in the decision", by: BOB });
  assert.deepEqual(w.duties.usesOfPower({ dutyId: power, viewer: BOB }).items[0].linked, ["provision", "member"]);
  /* unlink: a member's act, kept beside the link */
  row(w.duties.unlinkUse({ dutyId: power, eventId: U.unrecorded, reason: "r", by: MACHINE }), "DUTY_MEMBER_ACT_ONLY");
  w.at("2026-03-04T12:00:00.000Z");
  const u = w.duties.unlinkUse({ dutyId: power, eventId: U.unrecorded, reason: "the minutes were misread", by: CAROL });
  assert.deepEqual([u.ok, u.act, u.by], [true, "unlink", CAROL]);
  assert.equal(w.duties.unlinkUse({ dutyId: power, eventId: U.unrecorded, reason: "again", by: BOB }).already, true);
  assert.ok(!w.duties.usesOfPower({ dutyId: power, viewer: BOB }).items.some((x) => x.event_id === U.unrecorded));
  const rows = w.sqlRows(`SELECT act, by_member, reason FROM duty_use_links WHERE event_id=? ORDER BY seq`, U.unrecorded);
  assert.deepEqual(rows.map((x) => [x.act, x.by_member]), [["link", BOB], ["unlink", CAROL]], "the link is kept, shown unlinked");
  row(w.record.storeGate("duties", "duty_use_links", { table: "duty_use_links" }, "update"), "APPEND_ONLY");
  /* a use events withdraws leaves the population (events R45) */
  w.duties.linkUse({ dutyId: power, eventId: U.unrecorded, reason: "relinked", by: BOB });
  assert.equal(w.ev.withdrawUse({ eventId: U.unrecorded, reason: "recorded wrongly", by: BOB }).ok, true);
  assert.ok(!w.duties.usesOfPower({ dutyId: power, viewer: BOB }).items.some((x) => x.event_id === U.unrecorded));
});

test("R27 readDuty and powersOf answer each power's count of uses; R18 'used in' connects a power to each use, derived with how it is linked", () => {
  const { w, power, U } = powers();
  w.duties.linkUse({ dutyId: power, eventId: U.unrecorded, reason: "the minutes", by: BOB });
  const expected = w.duties.usesOfPower({ dutyId: power, viewer: BOB });
  const n = expected.items.length + expected.placed_nowhere.length;
  assert.equal(n, 4);
  assert.equal(w.duties.readDuty({ dutyId: power, viewer: BOB }).duty.uses, n);
  assert.equal(w.duties.readDuty({ dutyId: w.declare().duty_id, viewer: BOB }).duty.uses, undefined, "an obligation has no uses");
  const p = w.duties.powersOf({ office: E.clerk, at: "2026-03-01", viewer: BOB });
  assert.equal(p.powers.find((x) => x.duty_id === power).uses, n);
  /* R18 */
  const fromPower = w.registry.neighbours({ owner: "duties", node: power, kinds: ["used_in"], at: AT, viewer: BOB, scope: null });
  assert.deepEqual(fromPower.items.map((i) => i.to).sort(), [U.byClerk, U.waiver, U.unrecorded, U.nowhere].sort());
  for (const i of fromPower.items) {
    assert.equal(i.kind, "used_in");
    assert.equal(i.from, power);
    assert.equal(w.registry.checkConnection(i).ok, true, JSON.stringify(i));
    assert.ok(i.evidence[0].linked.length >= 1);
  }
  const fromEvent = w.registry.neighbours({ owner: "duties", node: U.unrecorded, kinds: ["used_in"], at: AT, viewer: BOB, scope: null });
  assert.deepEqual(fromEvent.items.map((i) => [i.from, i.evidence[0].linked]), [[power, ["member"]]]);
  assert.equal(w.registry.neighbours({ owner: "duties", node: U.otherLaw, kinds: ["used_in"], at: AT, viewer: BOB, scope: null }).items.length, 0);
});

test("R19 the uses ops: poweruses, uselink, useunlink, with the control plane's stamps", () => {
  const { w, power, U } = powers();
  const ops = (q, body) => dutiesOps(w.duties, new URL(`http://x/?${q}`), body);
  assert.equal(ops(`id=${power}&limit=1&viewer=member:bob`).poweruses().items.length, 1);
  assert.equal(ops("by=member:bob&viewer=member:bob", { dutyId: power, eventId: U.unrecorded, reason: "r", by: "member:mallory" }).uselink().by, BOB);
  row(ops(`by=${MACHINE}&viewer=${MACHINE}`, { dutyId: power, eventId: U.unrecorded, reason: "r" }).useunlink(), "DUTY_MEMBER_ACT_ONLY");
  assert.equal(ops("by=member:bob&viewer=member:bob", { dutyId: power, eventId: U.unrecorded, reason: "r" }).useunlink().act, "unlink");
});
