/* conformance: the Purpose as re-worded at T41 (D55; K2418, K2451): a determination is a member's, resting on published
   findings, that a named act is compliant, noncompliant or unclear against named standards, per standard; a machine may
   prepare the structured comparison and never determines; a compliant determination is recorded with the same care as
   a noncompliant one; an unclear one names its open questions and sends each back to an inquiry. Each test names the
   Purpose and the requirements that carry it, and holds a negative control. Every test drives `conformance` at its
   interface over the real modules it uses (./fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, V, MACHINE, F, DOC } from "./fixture.mjs";
import { OUTCOMES } from "../../../src/conformance/index.mjs";

const refused = (r, code) => {
  assert.equal(r.ok, false, `expected ${code}, got ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code, JSON.stringify(r).slice(0, 300));
};
const nothing = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "nothing written"); return r; };

test("Purpose (D55) R1 R12 R13 R18: a machine may prepare the structured comparison and never determines: its comparison carries no outcome, and a determination drawing on it is a member's, with the member's own outcome for each standard", () => {
  const { w, proj, std, input } = scene();
  /* the machine prepares the comparison: stored, labelled machine work, with rows and questions and no outcome */
  const p = w.c.comparisonPropose({ project: proj, act: input().act, standards: [std], rows: input().rows,
                                    questions: [{ question: "Was notice posted elsewhere?" }], proposer: MACHINE, viewer: MACHINE });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  assert.deepEqual([p.proposal.proposer, p.proposal.label.machine_work], [MACHINE, true]);
  const walk = (v) => Array.isArray(v) ? v.forEach(walk) : v && typeof v === "object"
    ? Object.entries(v).forEach(([k, x]) => { assert.equal(["outcome", "outcomes"].includes(k), false, k); walk(x); }) : null;
  walk(p);
  walk(w.c.comparisonRead({ id: p.proposal.id, viewer: V("olive") }).proposal);
  /* a machine's comparison naming an outcome is refused, for each outcome, and writes nothing */
  for (const outcome of OUTCOMES)
    refused(nothing(w, () => w.c.comparisonPropose({ project: proj, act: input().act, standards: [{ standard: std, outcome }],
      rows: input().rows, proposer: MACHINE, viewer: MACHINE })), "PROPOSAL_CANNOT_DETERMINE");
  /* the machine cannot determine, even from its own comparison; through the op, the stamped author decides */
  for (const author of [MACHINE, "class:ai"])
    refused(nothing(w, () => w.c.determine(input({ author, viewer: author, proposal: p.proposal.id }))), "MACHINE_CANNOT_DETERMINE");
  refused(nothing(w, () => w.op("determine", { author: MACHINE, viewer: MACHINE }, { ...input(), proposal: p.proposal.id })),
          "MACHINE_CANNOT_DETERMINE");
  /* the comparison never supplies the outcome: a member naming it without an outcome of their own is refused */
  refused(nothing(w, () => w.c.determine(input({ proposal: p.proposal.id, standards: [{ standard: std }] }))), "OUTCOME_UNKNOWN");
  refused(nothing(w, () => w.c.determine(input({ proposal: p.proposal.id, standards: [std] }))), "OUTCOME_UNKNOWN");
  /* the negative control: a member who has joined determines, drawing on it, with an outcome the rows do not dictate */
  const d = w.c.determine(input({ proposal: p.proposal.id, standards: [{ standard: std, outcome: "compliant" }] }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  assert.deepEqual([d.author, d.proposal, d.outcomes], [V("olive"), p.proposal.id, [{ standard: std, outcome: "compliant" }]]);
  assert.deepEqual(w.c.comparisonRead({ id: p.proposal.id, viewer: V("olive") }).proposal.drawn_on_by.map((x) => x.determination), [d.id]);
  /* nothing in the record of determinations was written by a machine */
  assert.deepEqual(w.rows(`SELECT author FROM determinations`).map((r) => r.author), [V("olive")]);
});

test("Purpose (D55) R4 R9 R11: the outcome is answered per standard, each its own, never composed into one verdict, and each is found by its own outcome", () => {
  const { w, std, input } = scene();
  const s2 = w.standard("Parks Code 12.08.040", { period: { from: "2020-01-01", to: "2030-12-31" } });
  const s3 = w.standard("Parks Code 12.08.050", { period: { from: "2020-01-01", to: "2030-12-31" } });
  const three = w.c.determine(input({
    standards: [{ standard: std, outcome: "noncompliant" }, { standard: s2, outcome: "compliant" }, { standard: s3, outcome: "unclear" }],
    rows: [input().rows[0], { standard: s2, requires: "a sign", did: "a sign was posted", reading: "aligns" },
           { standard: s3, requires: "a hearing", did: "unknown", reading: "open" }],
    questions: [{ question: "Was a hearing held?" }] }));
  assert.equal(three.ok, true, JSON.stringify(three).slice(0, 300));
  const per = [{ standard: std, outcome: "noncompliant" }, { standard: s2, outcome: "compliant" }, { standard: s3, outcome: "unclear" }];
  const r = w.c.determinationRead({ id: three.id, viewer: V("pat") });
  for (const a of [three, r]) {
    assert.deepEqual(a.outcomes, per);
    assert.deepEqual(a.standards.map((s) => [s.standard, s.outcome]), per.map((x) => [x.standard, x.outcome]));
    for (const k of ["outcome", "verdict", "overall", "compliance", "result", "compliant"]) assert.equal(k in a, false, k);
    assert.equal(a.outcomes_differ, true);
  }
  /* each outcome finds it, as each of its standards holds it */
  for (const outcome of OUTCOMES)
    assert.deepEqual(w.c.determinationsFor({ outcome, viewer: V("pat") }).items.map((i) => i.id), [three.id], outcome);
  /* the negative control: one outcome across its standards is still given per standard, and does not differ */
  const same = w.c.determine(input({ standards: [{ standard: std, outcome: "noncompliant" }, { standard: s2, outcome: "noncompliant" }],
    rows: [input().rows[0], { standard: s2, requires: "a sign", did: "none", reading: "diverges" }] }));
  const rs = w.c.determinationRead({ id: same.id, viewer: V("pat") });
  assert.deepEqual([rs.outcomes.length, rs.outcomes_differ, "outcome" in rs], [2, false, false]);
});

test("Purpose (D55) R6 R9: an unclear determination names its open questions and sends each back to an inquiry: every question, named or new, carries an inquiry in the project, each new one open and titled from its question", () => {
  const { w, proj, std, input } = scene();
  const s2 = w.standard("Parks Code 12.08.040", { period: { from: "2020-01-01", to: "2030-12-31" } });
  const E = "INQ-2026-0005-existing";
  w.inquiry(E);
  const questions = [{ question: "Was notice posted on the city's site instead?", inquiry: E },
                     { question: "Did the emergency exception apply?" }, { question: "Was a hearing held?" }];
  const d = w.c.determine(input({ standards: [{ standard: std, outcome: "unclear" }, { standard: s2, outcome: "unclear" }],
    rows: [{ ...input().rows[0], reading: "open" }, { standard: s2, requires: "a hearing", did: "unknown", reading: "open" }],
    questions }));
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const read = w.c.determinationRead({ id: d.id, viewer: V("pat") });
  for (const a of [d, read]) {
    assert.deepEqual(a.questions.map((q) => q.question), questions.map((q) => q.question));
    assert.ok(a.questions.every((q) => typeof q.inquiry === "string" && q.inquiry), "each question is sent to an inquiry");
  }
  assert.equal(read.questions[0].inquiry, E);
  for (const q of read.questions.slice(1)) {
    const fm = w.fm(q.inquiry);
    assert.deepEqual([fm.object_type, fm.current_state, fm.title, fm.project, q.opened], ["inquiry", "open", q.question, proj, true]);
    /* the inquiry it opens is the project's (R6, R15): the record holds it in the project, so who cannot see the project
       cannot see the question (an outsider, and under D54 an administrator or the founder neither invited nor joined);
       a participant and a machine credential see it (negative control) */
    assert.equal(w.record.bundleInfo(q.inquiry).project, proj);
    for (const viewer of [V("quinn"), V("ron"), "admin"]) assert.equal(w.membership.inSight(q.inquiry, viewer), false, viewer);
    for (const viewer of [V("pat"), V("olive"), MACHINE]) assert.equal(w.membership.inSight(q.inquiry, viewer), true, viewer);
  }
  /* every question's inquiry is held in the project, distinct, one per question */
  const held = w.rows(`SELECT inquiry_id, project_id FROM determination_questions WHERE determination_id=? ORDER BY ord`, d.id);
  assert.deepEqual(held.map((h) => [h.inquiry_id, h.project_id]), read.questions.map((q) => [q.inquiry, proj]));
  assert.equal(new Set(held.map((h) => h.inquiry_id)).size, questions.length);
  /* the negative control: an unclear outcome naming no open question is refused, and opens no inquiry */
  const unclear = { standards: [{ standard: std, outcome: "unclear" }], rows: [{ ...input().rows[0], reading: "open" }] };
  for (const qs of [undefined, [], [{ question: "   " }]])
    refused(nothing(w, () => w.c.determine(input({ ...unclear, questions: qs }))), "UNCLEAR_NO_QUESTION");
  assert.equal(w.c.determine(input({ ...unclear, questions: [{ question: "Open?" }] })).ok, true);
});

test("Purpose (D55) R2 R5 R9 R10 R11 R17: a compliant determination is recorded with the same care as a noncompliant one: the same record object with history, the same pins, the same reads, the same notice when its basis changes, and the same rule of supersession", () => {
  const { w, proj, std, input } = scene();
  const nc = w.c.determine(input());
  const c = w.c.determine(input({ standards: [{ standard: std, outcome: "compliant" }], rows: [{ ...input().rows[0], reading: "aligns" }] }));
  assert.deepEqual([nc.ok, c.ok], [true, true]);
  /* the same record object: a promoted determination bundle with its history, one version each */
  for (const d of [nc, c]) {
    const fm = w.fm(d.id);
    assert.deepEqual([fm.object_type, fm.current_state, w.record.head(d.id).rowVersion], ["determination", "recorded", 1]);
  }
  /* the same rows held, column for column: only the outcome and the row's reading differ */
  const strip = (r) => { const o = { ...r }; for (const k of ["determination_id", "outcome", "reading", "rows", "at", "ord", "disagreement"]) delete o[k]; return o; };
  for (const t of ["determinations", "determination_standards", "determination_findings"]) {
    const [a, b] = [nc, c].map((d) => w.rows(`SELECT * FROM ${t} WHERE determination_id=?`, d.id));
    assert.equal(a.length, b.length, t);
    assert.deepEqual(Object.keys(a[0]).sort(), Object.keys(b[0]).sort(), t);
    assert.deepEqual(b.map((r) => Object.keys(r).filter((k) => r[k] === null).sort()),
                     a.map((r) => Object.keys(r).filter((k) => r[k] === null).sort()), `${t}: nothing left unrecorded`);
    if (t !== "determination_standards") assert.deepEqual(b.map(strip), a.map(strip), t);
  }
  /* the same pins and the same reads */
  const [rn, rc] = [nc, c].map((d) => w.c.determinationRead({ id: d.id, viewer: V("pat") }));
  assert.deepEqual(rc.findings, rn.findings);
  assert.deepEqual(rc.act, rn.act);
  assert.deepEqual(Object.keys(rc).sort(), Object.keys(rn).sort());
  assert.deepEqual(w.c.determinationsFor({ project: proj, viewer: V("pat") }).items.map((i) => i.id), [nc.id, c.id]);
  /* the same notice when the basis changes: a later edition of the pinned finding flags both alike */
  w.inquiry(F, { legs: [{ target: DOC }], question: "Revised?" });
  w.publish(F, proj, { edition: 2 });
  const causes = (d) => w.c.determinationRead({ id: d.id, viewer: V("pat") }).basis_changed.causes
    .map((x) => `${x.kind}:${x.subject}:${x.source}`);
  assert.deepEqual(causes(c), causes(nc));
  assert.deepEqual(causes(c), [`finding:${F}:edition`]);
  /* the same rule of supersession: a reason, once, both reads naming the link */
  refused(nothing(w, () => w.c.determine(input({ supersedes: c.id }))), "CONFORMANCE_NO_REASON");
  const next = w.c.determine(input({ supersedes: c.id, reason: "the sign was posted late" }));
  assert.equal(next.ok, true, JSON.stringify(next).slice(0, 300));
  assert.deepEqual(w.c.determinationRead({ id: c.id, viewer: V("pat") }).superseded_by, next.id);
  refused(nothing(w, () => w.c.determine(input({ supersedes: c.id, reason: "again" }))), "DETERMINATION_SUPERSEDED");
  /* the negative control: the two do differ in the member's outcome, and only there */
  assert.deepEqual([rn.outcomes[0].outcome, rc.outcomes[0].outcome], ["noncompliant", "compliant"]);
});
