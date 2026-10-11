/* escalation, T45 (N855 6a, N884; Actions D3, D5, D6a; v0.2 rules 2, 6, 15, 17): no reply owed (R6), compliance
   restored by a curing act (R14), an overridden action joining once it rests on the determination (R23), the timeline's
   stop and its confidential acts (R30) and the evidence-seeking context (R32), each driven at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, toStage, V, OFFICE, ms } from "./fixture.mjs";

const by = (who) => ({ author: V(who), viewer: V(who) });
const read = (w, nowMs) => w.esc.escalationRead({ id: w.E, viewer: V("bob"), ...(nowMs ? { nowMs } : {}) });
const edge = (r, to) => r.triggers.find((t) => t.to === to);
const adv = (w, to) => w.esc.escalationAdvance({ id: w.E, to, reason: `to ${to}`, ...by("bob") });
const attach = (w, action, extra = {}) => w.esc.escalationAttach({ reason: "This act serves the stage.", id: w.E, action, ...by("bob"), ...extra });
const bothCompliant = [{ standard: "STD-2026-0001-a", outcome: "compliant" }, { standard: "STD-2026-0002-b", outcome: "compliant" }];

/* Stage 3 with one notification action carrying a clock entry dated 2026-09-20 and `replyOwed` as stated. */
function atClock(replyOwed, { fromDoc = false } = {}) {
  const w = seeded();
  w.replyFromDoc(fromDoc);
  opened(w); adv(w, 2);
  const n = w.action({ project: w.P, restsOn: [w.D], clock: [{ date: "2026-09-20" }], ...(replyOwed !== undefined ? { replyOwed } : {}) });
  attach(w, n);
  w.correspond(n, "sent", "2026-09-02");
  adv(w, 3);
  w.N = n;
  return w;
}

test("R6 a stage-3 action stating reply_owed: false never triggers by time or by the lack of a reply (a no_response entry), and the read says no reply owed; a reply that comes still triggers; control: the same action with reply_owed absent triggers when its clock passes", () => {
  const late = ms("2026-12-01T00:00:00Z");
  /* control: reply_owed absent, and true, trigger by the clock */
  for (const owed of [undefined, true]) {
    const c = atClock(owed);
    assert.equal(edge(read(c, late), 4).met, true, String(owed));
    assert.deepEqual(read(c, late).notes, []);
  }
  /* reply_owed: false, as actions' read answers it and, before actions carries it, as the document states it */
  for (const fromDoc of [false, true]) {
    const w = atClock(false, { fromDoc });
    let r = read(w, late);
    assert.equal(edge(r, 4).met, false, `fromDoc ${fromDoc}`);
    assert.deepEqual(r.proposed, []);
    assert.deepEqual(r.notes.map((x) => [x.action, x.reply_owed]), [[w.N, false]]);
    assert.match(r.notes[0].says, /no reply owed/);
    /* the lack of a reply recorded does not trigger either */
    w.correspond(w.N, "no_response", "2026-09-25");
    assert.equal(edge(read(w, late), 4).met, false);
    assert.equal(adv(w, 4).reason, "TRIGGER_NOT_MET");
    /* a reply that does come triggers */
    w.correspond(w.N, "received", "2026-09-26");
    r = read(w, late);
    assert.deepEqual([edge(r, 4).met, edge(r, 4).instant], [true, "2026-09-26T00:00:00Z"]);
  }
  /* a no_response entry on an action owing a reply triggers, as before (control) */
  const c = atClock(undefined);
  c.correspond(c.N, "no_response", "2026-09-10");
  assert.equal(edge(read(c, ms("2026-09-11T00:00:00Z")), 4).instant, "2026-09-10T00:00:00Z");
});

test("R14 compliance is restored, per standard, by a live compliant determination recorded after the escalation opened of a curing act: a later act of the same office linked as the cure (conformance.curesOf, cure_standing: true); COMPLIANCE_NOT_RESTORED names per standard what is missing; control: another office's act, or one not linked, or a link no longer standing, does not restore it", () => {
  const w = seeded();
  w.clock.now = "2026-09-20T00:00:00Z";
  opened(w);
  w.addressedBy.set(w.D, { state: "addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  const end = () => w.esc.escalationEnd({ id: w.E, ...by("bob") });
  const missing = (r) => r.standards.filter((s) => !s.met).map((s) => [s.standard, typeof s.missing]);
  /* a later act of the same office, compliant, not linked: not restored */
  const cure = w.determine({ project: w.P, act: "ACT-2026-0700", actor: OFFICE.clerk, outcomes: bothCompliant, at: "2026-09-21T00:00:00Z" });
  let r = end();
  assert.equal(r.reason, "COMPLIANCE_NOT_RESTORED");
  assert.deepEqual(missing(r), [["STD-2026-0001-a", "string"], ["STD-2026-0002-b", "string"]]);
  assert.match(r.detail, /curing act/);
  /* another office's later act, even linked: not restored */
  const elsewhere = w.determine({ project: w.P, act: "ACT-2026-0701", actor: OFFICE.board, outcomes: bothCompliant, at: "2026-09-21T00:00:00Z" });
  w.linkCure(w.D, "STD-2026-0001-a", elsewhere);
  assert.deepEqual(missing(end()).map(([s]) => s), ["STD-2026-0001-a", "STD-2026-0002-b"], "another office's act does not cure");
  /* the same office's act linked for one standard: that one restored, the other named */
  w.cureLinks.length = 0;
  w.linkCure(w.D, "STD-2026-0001-a", cure);
  r = end();
  assert.deepEqual(missing(r).map(([s]) => s), ["STD-2026-0002-b"]);
  assert.deepEqual(r.standards[0].cured_by.map((c) => c.cure), [cure]);
  /* the read's exit says the same */
  assert.equal(read(w).exit.compliance.state, "not_met");
  /* a cure determination recorded before the escalation opened does not restore */
  const early = w.determine({ project: w.P, act: "ACT-2026-0702", actor: OFFICE.clerk, outcomes: bothCompliant, at: "2026-09-19T00:00:00Z" });
  w.linkCure(w.D, "STD-2026-0002-b", early);
  assert.deepEqual(missing(end()).map(([s]) => s), ["STD-2026-0002-b"]);
  /* a link whose cure was superseded no longer stands */
  w.linkCure(w.D, "STD-2026-0002-b", cure);
  w.supersede(cure, "CONF-2026-0888-next");
  assert.equal(end().reason, "COMPLIANCE_NOT_RESTORED");
  w.determinations.get(cure).superseded_by = null;
  /* both standards cured: compliance met through the cure; harm read through consequences.addressed unchanged */
  assert.equal(read(w).exit.compliance.state, "met");
  w.addressedBy.set(w.D, { state: "not_addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  assert.equal(end().reason, "CONSEQUENCES_NOT_ADDRESSED");
  w.addressedBy.set(w.D, { state: "addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  w.clock.now = "2026-09-25T00:00:00Z";
  r = end();
  assert.deepEqual([r.ok, r.state, r.compliance], [true, "ended", [cure, cure]]);
  /* a conformance holding no curesOf yet: only the same act restores; never read as restored */
  const x = seeded();
  x.clock.now = "2026-09-20T00:00:00Z";
  opened(x);
  delete x.stand.conformance.curesOf;
  x.addressedBy.set(x.D, { state: "addressed", parts: [{ id: "CONS-2026-0001-p" }] });
  const c2 = x.determine({ project: x.P, act: "ACT-2026-0700", outcomes: bothCompliant, at: "2026-09-21T00:00:00Z" });
  x.linkCure(x.D, "STD-2026-0001-a", c2);
  assert.equal(x.esc.escalationEnd({ id: x.E, ...by("bob") }).reason, "COMPLIANCE_NOT_RESTORED");
});

test("R23 an overridden action with no rests_on leg naming this escalation's determination is refused ACTION_PREMISE_OVERRIDDEN; once a member's revision adds the leg it attaches, and the attachment and the read's history show the override (its ground, reason, who and when); control: the same overridden action without the leg is still refused", () => {
  const w = seeded();
  opened(w); adv(w, 2);
  const a = w.action({ project: w.P, restsOn: [], override: "A legal deadline would pass first." });
  const control = w.action({ project: w.P, restsOn: [], override: "A legal deadline would pass first." });
  assert.equal(attach(w, a).reason, "ACTION_PREMISE_OVERRIDDEN");
  /* the member's revision adds the leg on this determination (actions R8 (d)); the override stays */
  w.revise(a, { restsOn: [w.D] });
  assert.equal(w.fm(a).premise_override.reason, "A legal deadline would pass first.");
  w.clock.now = "2026-09-29T00:00:00Z";
  const r = attach(w, a);
  assert.deepEqual([r.ok, r.stage, r.action], [true, 2, a], JSON.stringify(r).slice(0, 300));
  assert.deepEqual(r.premise_override, { ground: null, reason: "A legal deadline would pass first.", by: V("alice"),
                                         at: w.fm(a).premise_override.at });
  const h = read(w).history.find((x) => x.kind === "attach" && x.action === a);
  assert.deepEqual(h.premise_override, r.premise_override);
  /* a ground, as actions R74 shapes it, is shown as the read answers it */
  const g = w.action({ project: w.P, restsOn: [w.D], override: "Irreversible." });
  const ground = { kind: "irreversible_act", what: "the demolition", when: "2026-10-05" };
  const orig = w.stand.actions.actionRead;
  w.stand.actions.actionRead = (q) => { const x = orig(q); return x.ok && x.id === g ? { ...x, premise_override: { ...x.premise_override, ground } } : x; };
  assert.deepEqual(attach(w, g).premise_override.ground, ground);
  w.stand.actions.actionRead = orig;
  /* control */
  assert.equal(attach(w, control).reason, "ACTION_PREMISE_OVERRIDDEN");
  /* a plain action's attachment carries no override */
  const plain = w.action({ project: w.P, restsOn: [w.D] });
  assert.equal("premise_override" in attach(w, plain), false);
});

test("R30 every item the timeline source answers carries public: true (case-authoring R57), and its labels carry no member's reason; the stop and reopening wait on R31 (T46)", () => {
  const w = seeded({ structure: true });
  w.clerk = w.ent("office", "Town Clerk");
  w.D = w.determine({ project: w.P, actor: { ...OFFICE.clerk, entity_id: w.clerk },
                      outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  w.clock.now = "2026-09-28T01:00:00Z";
  w.esc.escalationOpen({ reason: "SECRET-OPENING", determination: w.D, ...by("bob") });
  w.E = w.esc.escalationsFor({ determination: w.D, viewer: V("bob") }).items[0].id;
  w.esc.escalationDecline({ id: w.E, to: 2, reason: "SECRET-DECLINE", ...by("bob") });
  w.esc.escalationSuspend({ id: w.E, reason: "SECRET-SUSPEND", ...by("bob") });
  const items = w.source.fn({ set: [w.clerk], viewer: V("bob") }).items;
  assert.deepEqual(items.map((x) => [x.kind, x.public]), [["open", true], ["decline", true], ["suspend", true]]);
  assert.ok(!JSON.stringify(items).includes("SECRET"), "no reason in any item");
});

test("R30 confidential acts: every attached action confidential, the escalation is not answered; one of two confidential, its attachment alone is left out; none attached, it is answered", () => {
  const w = seeded({ structure: true });
  w.clerk = w.ent("office", "Town Clerk");
  w.D = w.determine({ project: w.P, actor: { ...OFFICE.clerk, entity_id: w.clerk },
                      outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  opened(w);
  const src = () => w.source.fn({ set: [w.clerk], viewer: V("bob") }).items;
  assert.deepEqual(src().map((x) => x.kind), ["open"], "none attached: answered");
  adv(w, 2);
  const c = w.action({ project: w.P, restsOn: [w.D] });
  const open = w.action({ project: w.P, restsOn: [w.D] });
  w.confidential.add(c);
  attach(w, c);
  assert.deepEqual(src(), [], "its one attached action confidential: not answered at all");
  attach(w, open);
  const items = src();
  assert.deepEqual(items.map((x) => x.kind), ["open", "advance", "attach"]);
  assert.ok(!JSON.stringify(items).includes(c), "the confidential attachment is never answered");
  assert.ok(items.some((x) => x.label.includes(open)));
  /* control: not confidential, both attachments answered */
  w.confidential.delete(c);
  assert.equal(src().filter((x) => x.kind === "attach").length, 2);
});

test("R32 the read answers context: the actions the viewer may see resting on the determination or its findings that are not breach actions, each with kind, first sent date and resolution; never attachments, never a trigger; control: an attached breach action is in actions, never in context", () => {
  const w = seeded();
  w.D = w.determine({ project: w.P, findings: ["FND-2026-0001-f"],
                      outcomes: [{ standard: "STD-2026-0001-a", outcome: "noncompliant" }] });
  opened(w); adv(w, 2);
  const breach = w.action({ project: w.P, restsOn: [w.D] });
  attach(w, breach);
  w.correspond(breach, "sent", "2026-09-02");
  const rfc = w.action({ project: w.P, breach: false, restsOn: [w.D], kind: "request_for_comment" });
  const rr = w.action({ project: w.P, breach: false, restsOn: ["FND-2026-0001-f"], kind: "records_request", resolution: "produced" });
  const hidden = w.action({ project: w.P, breach: false, restsOn: [w.D] });
  const unrelated = w.action({ project: w.P, breach: false, restsOn: ["CONF-2026-0777-other"] });
  w.actionHidden.add(hidden);
  w.correspond(rr, "received", "2026-09-01");
  w.correspond(rr, "sent", "2026-09-03");
  const r = read(w);
  assert.deepEqual(r.context.items.map((x) => [x.action, x.kind, x.sent_at, x.resolution]),
    [[rfc, "request_for_comment", null, null], [rr, "records_request", "2026-09-03", "produced"]].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
  assert.deepEqual(r.actions.map((x) => x.action), [breach]);
  const ctx = JSON.stringify(r.context);
  for (const x of [breach, hidden, unrelated]) assert.ok(!ctx.includes(x), x);
  /* never a trigger: the trigger to 3 names the breach action only */
  assert.deepEqual(edge(r, 3).ids, [breach, `${breach}#0`]);
  /* nothing attaches as context: a non-breach action is refused NOT_A_BREACH_ACTION */
  assert.equal(attach(w, rfc).reason, "NOT_A_BREACH_ACTION");
});
