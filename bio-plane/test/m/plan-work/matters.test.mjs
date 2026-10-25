/* plan-work R1, R2: each matter's intended outcome, its revisions kept, and its state derived on read. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, code, by, V, MACHINE, OFFICE, option, choose } from "./fixture.mjs";
import { noSuchPlan, refusePlanClosed, ACTION_PLAN_CHECKS } from "../../../src/action-plans/index.mjs";
import { PLAN_WORK_CHECKS, MATTER_STATES } from "../../../src/plan-work/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { escalationRead } from "../escalation/fixtures.mjs";

const set = (w, extra = {}) => w.pw.matterOutcomeSet({ plan: w.PL, subject: w.S1, text: "The lights work again", ...by("bob"), ...extra });

test("R1: matterOutcomeSet's refusals in order: MACHINE_CANNOT_PLAN, NO_SUCH_PLAN, PLAN_CLOSED, MATTER_NOT_OF_PLAN, PLAN_NO_REASON", () => {
  const w = world();
  /* each condition, and the order when several hold at once */
  const machine = set(w, { author: MACHINE, viewer: MACHINE, plan: "PLN-2026-0999-plan", subject: w.S2, text: "" });
  assert.equal(code(machine), "MACHINE_CANNOT_PLAN");
  assert.equal(machine.check, ACTION_PLAN_CHECKS.MACHINE_CANNOT_PLAN.check, "action-plans' row, never minted here");
  assert.equal(code(set(w, { author: "" })), "MACHINE_CANNOT_PLAN", "an unstamped author is refused as a machine");
  assert.deepEqual(set(w, { plan: "PLN-2026-0999-plan", subject: w.S2, text: "" }), noSuchPlan("PLN-2026-0999-plan"));
  assert.deepEqual(set(w, { ...by("dave") }), noSuchPlan(w.PL), "a plan the author may not see is answered as absent");
  const bad = set(w, { subject: w.S2, text: "" });
  assert.equal(code(bad), "MATTER_NOT_OF_PLAN"); assert.equal(bad.check, PLAN_WORK_CHECKS.MATTER_NOT_OF_PLAN.check);
  assert.equal(code(set(w, { subject: "outcome:nothing#here" })), "MATTER_NOT_OF_PLAN");
  for (const text of ["", "   ", "x".repeat(1001), "say \"no\"", "a\\b", "two\nlines", 7, null]) {
    const r = set(w, { text });
    assert.equal(code(r), "PLAN_NO_REASON", JSON.stringify(text));
    assert.equal(r.check, ACTION_PLAN_CHECKS.PLAN_NO_REASON.check); assert.equal(r.max, 1000);
  }
  assert.equal(w.count("pw_outcomes"), 0, "no refusal wrote anything");
  /* controls: 1 and 1,000 characters land; a matter named by its key lands */
  assert.equal(set(w, { text: "x" }).ok, true);
  assert.equal(set(w, { text: "y".repeat(1000) }).ok, true);
  assert.equal(set(w, { subject: `outcome:${w.D}#STD-2026-0003-c` }).ok, true);
  w.ap.planClose({ id: w.PL, reason: "done with it", ...by("bob") });
  assert.deepEqual(set(w, { subject: w.S2 }), refusePlanClosed(w.PL), "closed is asked before the matter");
});

test("R1: a second statement keeps the first in history, each with who and when", () => {
  const w = world();
  const a = set(w);
  w.clock.now = "2026-10-05T09:00:00Z";
  const b = set(w, { text: "The lights work and the yard is safe", ...by("alice") });
  assert.deepEqual([a.revision, b.revision], [1, 2]);
  const m = w.pw.matters({ plan: w.PL, viewer: V("bob") }).matters.find((x) => x.key === `outcome:${w.D}#STD-2026-0001-a`);
  assert.deepEqual(m.outcome, { text: "The lights work and the yard is safe", revision: 2, by: V("alice"), at: "2026-10-05T09:00:00Z" });
  assert.deepEqual(m.history.map((h) => [h.text, h.by, h.at]),
    [["The lights work again", V("bob"), "2026-10-01T12:00:00Z"], ["The lights work and the yard is safe", V("alice"), "2026-10-05T09:00:00Z"]]);
  assert.equal(w.count("pw_outcomes"), 2, "appended, never rewritten");
  assert.deepEqual(w.pw.matters({ plan: w.PL, viewer: V("dave") }), noSuchPlan(w.PL), "an outsider reads the plan as absent");
});

/* R2's fixtures: each state from the record the module reads */
const ESC = (w, state) => w.escalations.set(w.D, [{ id: "ESC-2026-0001-e", state, stage: 3, history: [] }]);
const CURE = (w) => w.cures.set(`${w.D}#STD-2026-0001-a`, { link: "CURE-2026-0001", cure: "CONF-2026-0009-determination",
  standard: "STD-2026-0001-a", by: V("bob"), at: "2026-10-01T00:00:00Z", reason: null, cure_standing: true });
const stateOf = (w, key = `outcome:${w.D}#STD-2026-0001-a`) =>
  w.pw.matters({ plan: w.PL, viewer: V("bob") }).matters.find((x) => x.key === key);

test("R2: each state from a fixture: ended, fixed, stopped, acting, fix_offered, documented, none; never a percentage or score", () => {
  assert.deepEqual(MATTER_STATES, ["ended", "fixed", "stopped", "acting", "fix_offered", "documented", "none"]);
  const cases = {
    none: () => {},
    ended: (w) => ESC(w, "ended"),
    fixed: (w) => CURE(w),
    stopped: (w) => ESC(w, "stopped_pursuing"),
    acting: (w) => { const s = w.started({ subjects: [w.S1] }); w.correspond(s.action, "sent"); },
    fix_offered: (w) => { const s = w.started({ subjects: [w.S1] }); w.correspond(s.action, "sent");
      w.drafts.set(s.action, [{ filing: "COM-1", purpose: "chance_to_fix", approval: { approved_by: V("bob") }, sending: { ord: 0 } }]); },
    documented: (w) => { const s = w.started({ subjects: [w.S1] });
      w.drafts.set(s.action, [{ filing: "COM-2", purpose: "document_infraction", approval: { approved_by: V("bob") }, sending: null }]); },
  };
  for (const [want, make] of Object.entries(cases)) {
    const w = world();
    make(w);
    const m = stateOf(w);
    assert.equal(m.state, want, `${want}: ${JSON.stringify(m)}`);
    assert.doesNotMatch(JSON.stringify(m), /percent|score|progress/i);
  }
  /* controls: an open escalation, a cure not standing, an unsent outward action, an unapproved documentation and an
     unsent chance to fix each leave the matter none */
  const w = world();
  ESC(w, "open");
  w.cures.set(`${w.D}#STD-2026-0001-a`, { link: "CURE-2026-0001", cure: "CONF-2026-0009-determination", standard: "STD-2026-0001-a",
    by: V("bob"), at: "2026-10-01T00:00:00Z", reason: null, cure_standing: false, cure_why: word("conformance.curing_determination_superseded") });
  const s = w.started({ subjects: [w.S1] });
  w.drafts.set(s.action, [{ filing: "COM-3", purpose: "document_infraction", approval: null, sending: null },
                          { filing: "COM-4", purpose: "chance_to_fix", approval: { approved_by: V("bob") }, sending: null }]);
  assert.equal(stateOf(w).state, "none");
  /* a suspected matter holds no escalation or cure: it reads by its actions alone */
  assert.equal(stateOf(w, `inquiry:${w.I}`).state, "none");
});

test("R2: the order when two hold: the first of ended, fixed, stopped, acting, fix_offered, documented answers", () => {
  const pairs = [
    ["ended", (w) => { ESC(w, "ended"); CURE(w); }],
    ["fixed", (w) => { CURE(w); ESC(w, "stopped_pursuing"); }],
    ["stopped", (w) => { ESC(w, "stopped_pursuing"); const s = w.started({ subjects: [w.S1] }); w.correspond(s.action, "sent"); }],
    ["acting", (w) => { const s = w.started({ subjects: [w.S1] }); w.correspond(s.action, "sent");
      const t = w.started({ subjects: [w.S1], summary: word("action-plans.summary.offer_chance_fix") }); w.correspond(t.action, "sent");
      w.drafts.set(t.action, [{ filing: "COM-5", purpose: "chance_to_fix", approval: {}, sending: { ord: 0 } }]); }],
    ["fix_offered", (w) => { const t = w.started({ subjects: [w.S1] }); w.correspond(t.action, "sent");
      w.drafts.set(t.action, [{ filing: "COM-6", purpose: "chance_to_fix", approval: {}, sending: { ord: 0 } },
                              { filing: "COM-7", purpose: "document_infraction", approval: {}, sending: null }]); }],
  ];
  for (const [want, make] of pairs) {
    const w = world();
    make(w);
    assert.equal(stateOf(w).state, want, want);
  }
});

test("R2: a matter whose escalations cannot be read is undetermined with why, never a guessed state", () => {
  const w = world();
  const refused = escalationRead().unknownDeterminationAnswer;
  w.stand.escalation.escalationsFor = () => refused;
  const m = stateOf(w);
  assert.equal(m.state, "undetermined"); assert.match(m.why, /escalations/);
  assert.equal(MATTER_STATES.includes(m.state), false);
});

test("R2: fixed read through the real conformance (its R37, K2852): a standing link is fixed; its cure superseded, or the link ended, is not", async () => {
  const { scene, V: CV } = await import("../conformance/fixture.mjs");
  const s = scene();
  const { w: cw, std, ev, input } = s;
  const target = cw.c.determine(input());
  const later = cw.event(ev, { date: "2026-04-01" });
  const compliant = (over = {}) => input({ act: { ...input().act, event: later }, standards: [{ standard: std, outcome: "compliant" }],
                                           rows: [{ ...input().rows[0], reading: "aligns" }], ...over });
  const cure = cw.c.determine(compliant());
  assert.deepEqual([target.ok, cure.ok], [true, true]);
  /* the plan's matter S1 stands for the conformance world's target and standard: asked and answered in its names */
  const w = world({ deps: { conformance: { curesOf: ({ standard }) => {
    const r = cw.c.curesOf({ determination: target.id, standard: standard === "STD-2026-0001-a" ? std : standard, viewer: CV("pat") });
    return r.ok ? { ...r, standards: r.standards.map((x) => (x.standard === std ? { ...x, standard: "STD-2026-0001-a" } : x)) } : r;
  } } } });
  const read = () => stateOf(w).state;
  assert.equal(read(), "none", "no link");
  const l = cw.c.cureLink({ determination: target.id, standard: std, cure: cure.id, author: CV("olive"), viewer: CV("olive") });
  assert.equal(l.ok, true, JSON.stringify(l).slice(0, 300));
  assert.equal(read(), "fixed");
  assert.equal(stateOf(w).cure.link, l.link);
  cw.c.determine(compliant({ supersedes: cure.id, reason: "restated" }));
  assert.equal(read(), "none", "the curing determination superseded: cure_standing false");
  cw.c.cureUnlink({ link: l.link, reason: "the cure was restated", author: CV("olive"), viewer: CV("olive") });
  assert.equal(read(), "none", "an ended link is no cure");
});

test("R2: the fixture's starts say why they go before the infraction is documented (action-plans R42); without it the start is refused", () => {
  const w = world();
  const o = option(w, { addressee: OFFICE, subjects: [w.S1] });
  choose(w, [o]);
  const r = w.ap.optionStart({ plan: w.PL, option: o, kind: "other", ...by("bob") });
  assert.equal(code(r), "DOCUMENT_FIRST_NO_REASON");
  assert.equal(stateOf(w).state, "none", "no action was started, so the matter has gone nowhere");
  const s = w.started({ subjects: [w.S1] });
  w.correspond(s.action, "sent");
  assert.equal(stateOf(w).state, "acting");
});
