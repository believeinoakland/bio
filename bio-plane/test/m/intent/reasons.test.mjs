/* intent's reasons (DEC-88; K1025): R2 (a condition set, changed or removed with the author's words on why progress is
   measured this way) and R18 (a run on an objective opened with the member's words on why), each refused
   `INTENT_NO_REASON` (R30, C-111.13) when the reason is absent, not a string, blank or only whitespace, with nothing
   written and no run opened. R18's read-back runs over the real ai-runs (its R9, R10, R19, R22), built on ai-runs' own
   test world, so the reason is shown with the run's budget and scope as ai-runs answers them. */
import test from "node:test";
import assert from "node:assert/strict";
import { INTENT_CHECKS, intentOf } from "../../../src/intent/index.mjs";
import { entitiesOf } from "../../../src/entities/index.mjs";
import { progressionsOf } from "../../../src/progressions/index.mjs";
import { seeded, V, MACHINE, COND } from "./fixture.mjs";
import { world as runsWorld, PROJ, ORG, T0 } from "../ai-runs/world.mjs";

const ROW = INTENT_CHECKS.INTENT_NO_REASON;
/* every reason that is not one: absent, not a string, blank or only whitespace */
const NOT_REASONS = [undefined, null, 0, 7, true, {}, ["why"], { text: "why" }, "", " ", "   \n\t  "];

function noReason(r, label) {
  assert.equal(r.ok, false, label);
  assert.equal(r.reason, "INTENT_NO_REASON", label);
  assert.equal(r.code, "INTENT_NO_REASON", label);
  assert.equal(r.check, ROW.check, label);
  assert.equal(r.check, "C-111.13", label);
  assert.equal(r.translation, ROW.translation, label);
}

async function measured() {
  const w = seeded();
  w.entity("ENT-1"); w.entity("ENT-2");
  w.relate("ENT-2", "ENT-1", "member_of");
  w.define();
  await w.thread("ENT-1", { need: "A", award: "B" });
  await w.thread("ENT-2", { award: "C" });
  return w;
}

test("R2 R30 setCondition requires a reason: absent, not a string, blank or only whitespace is INTENT_NO_REASON (C-111.13) with nothing written, the project's document and its bundleSha unchanged; a removal is refused the same way", async () => {
  const w = await measured();
  const P = w.P;
  const first = w.i.setCondition({ project: P, condition: COND, reason: "Awards are what we are checking.", author: V("bob"),
                                   viewer: V("bob") });
  assert.equal(first.ok, true);
  const changed = { ...COND, satisfied: { share: 75 } };
  for (const reason of NOT_REASONS) {
    for (const [what, condition] of [["a change", changed], ["a removal", null], ["an unreadable one", {}]]) {
      const label = `${what}, reason ${JSON.stringify(reason)}`;
      const head = w.record.head(P), text = w.text(P), snap = w.snapshot();
      const args = { project: P, condition, author: V("bob"), viewer: V("bob") };
      if (reason !== undefined) args.reason = reason;
      noReason(w.i.setCondition(args), label);
      assert.deepEqual(w.snapshot(), snap, `${label}: nothing was written`);
      assert.equal(w.text(P), text, `${label}: the project's document is unchanged`);
      assert.equal(w.record.head(P).bundleSha, head.bundleSha, `${label}: its bundleSha is unchanged`);
    }
  }
  assert.equal(w.fm(P).objective_condition.share, 50, "the condition first set stands");
});

test("R2 the reason is asked after the machine, the project and the participant, and before the condition's shape: a machine, an absent or unseen project and a member not joined are still refused first", async () => {
  const w = await measured();
  const hidden = w.project("Hidden", "carol");
  for (const who of ["", null, MACHINE, "class:daemon"])
    assert.equal(w.i.setCondition({ project: w.P, condition: COND, author: who }).reason, "MACHINE_CANNOT_SET_OBJECTIVE");
  for (const p of [hidden, "PROJ-2026-9999-nothing"])
    assert.equal(w.i.setCondition({ project: p, condition: COND, author: V("bob"), viewer: V("bob") }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.i.setCondition({ project: w.P, condition: COND, author: V("carol"), viewer: V("carol") }).reason,
               "PROJECT_ACT_NOT_A_PARTICIPANT", "an invited member has not joined");
  noReason(w.i.setCondition({ project: w.P, condition: { progression: "nope" }, author: V("bob"), viewer: V("bob") }),
           "before CONDITION_UNREADABLE and the progression");
  assert.equal(w.i.setCondition({ project: w.P, condition: {}, reason: "Why.", author: V("bob"), viewer: V("bob") }).reason,
               "CONDITION_UNREADABLE", "with a reason, the shape is asked next");
});

test("R2 a reasoned condition is carried on the revision with it, in the author's words: the revision's log entry holds the condition and the reason, the answer reads it back trimmed, the earlier revision stays in history, and a removal carries its own reason", async () => {
  const w = await measured();
  const P = w.P;
  const before = w.record.head(P);
  const why = "Most awards should carry a need on record\n## not a heading\nbefore we call the objective met.";
  const r = w.i.setCondition({ project: P, condition: COND, reason: `  ${why}  `, author: V("bob"), viewer: V("bob") });
  assert.equal(r.ok, true);
  assert.equal(r.reason, why, "answered trimmed, as the author wrote it");
  assert.equal(w.record.head(P).rowVersion, before.rowVersion + 1);
  assert.equal(r.bundleSha, w.record.head(P).bundleSha);
  const log = w.text(P).split("## Session Log")[1];
  const entry = log.split("### Session ").at(-1);
  assert.match(entry, /Objective condition set \| member:bob/);
  assert.match(entry, /satisfaction condition is \{"progression":"proc"/, "the condition is on the entry");
  assert.ok(entry.includes("Reason: Most awards should carry a need on record\n ## not a heading\nbefore we call the objective met."),
            "the reason is on the same entry, a heading-like line set in so the document's sections hold");
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM history WHERE bundle_id=? AND path='bundle.md'`, P)[0].n, 1,
               "the earlier revision is held in history");
  /* the reason is the author's own text, kept whole: a long one is not cut (unbounded, as R8's is; K1030) */
  const long = "x".repeat(5000);
  assert.equal(w.i.setCondition({ project: P, condition: { ...COND, satisfied: { share: 60 } }, reason: long, author: V("bob"),
                                  viewer: V("bob") }).reason, long);
  assert.ok(w.text(P).includes(`Reason: ${long}`));
  const off = w.i.setCondition({ project: P, condition: null, reason: "We measure this a different way now.", author: V("bob"),
                                 viewer: V("bob") });
  assert.equal(off.ok, true);
  assert.equal(off.condition, null);
  assert.equal(off.reason, "We measure this a different way now.");
  assert.equal(w.fm(P).objective_condition, undefined);
  const last = w.text(P).split("### Session ").at(-1);
  assert.match(last, /Objective condition removed/);
  assert.match(last, /Reason: We measure this a different way now\./);
});

test("R18 R30 workObjective requires a reason: absent, not a string, blank or only whitespace is INTENT_NO_REASON (C-111.13) and no run is opened; a machine is still refused first, and the reason is asked before the project is read", async () => {
  const w = await measured();
  const hidden = w.project("Hidden", "carol");
  for (const reason of NOT_REASONS) {
    for (const project of [w.P, hidden, "PROJ-2026-9999-nothing"]) {
      const label = `${project}, reason ${JSON.stringify(reason)}`;
      const snap = w.snapshot();
      const args = { project, author: V("bob"), viewer: V("bob"), run: { run: "R-1" } };
      if (reason !== undefined) args.reason = reason;
      noReason(await w.i.workObjective(args), label);
      assert.deepEqual(w.snapshot(), snap, `${label}: nothing was written`);
    }
    for (const who of [MACHINE, "", null]) {
      const args = { project: w.P, author: who, run: { run: "R-1" } };
      if (reason !== undefined) args.reason = reason;
      assert.equal((await w.i.workObjective(args)).reason, "MACHINE_CANNOT_CHOOSE_THE_QUESTION", "a machine first");
    }
  }
  assert.equal(w.calls.open.length, 0, "no run was opened");
  assert.equal((await w.i.workObjective({ project: hidden, reason: "Why.", author: V("bob"), viewer: V("bob") })).reason,
               "NO_SUCH_PROJECT", "with a reason, the project is read next");
  assert.equal(w.calls.open.length, 0);
});

test("R18 a reasoned run is opened through ai-runs with the reason recorded on its opening: carried in its instructions and as the run's label, which ai-runs' read and context list answer with the run's budget and scope (real ai-runs)", async () => {
  /* ai-runs as its own test world builds it, and intent over the same storage */
  const r = runsWorld();
  await r.group("ann", "bob", "cat");
  const proj = r.project(PROJ, "ann", { joined: ["bob"] });
  const i = intentOf(r.ctx, { record: r.record, membership: r.membership, promotion: r.promotion, aiRuns: r.runs,
    entities: entitiesOf(r.ctx, { record: r.record, membership: r.membership, provenance: {} }),
    progressions: progressionsOf(r.ctx, { record: r.record, provenance: { homeOf: () => null } }), now: () => T0 });
  i.migrate();
  const why = "  The contracts list is the gap; find who holds the award records.  ";
  const opened = await i.workObjective({ project: proj, reason: why, author: "member:bob", viewer: "member:bob",
    run: { run: "R-OBJ", label: "a caller's own label", principalPlane: "member:bob/t1", principalClaude: "member",
           skillVersion: "bio@1", bounds: [{ bound: "fetches", allowed: 10 }, { bound: "wallclock", allowed: 600000 }],
           at: T0 } });
  assert.equal(opened.started, true, JSON.stringify(opened));
  assert.equal(opened.reason, why.trim());
  assert.equal(opened.instructions.reason, why.trim(), "the reason is carried in the run's instructions");
  const read = await r.runs.read({ run: "R-OBJ", viewer: "member:bob" });
  assert.equal(read.found, true);
  const s = read.session;
  assert.equal(s.label, why.trim(), "recorded on the run's opening, the member's words, not the caller's label");
  assert.deepEqual(s.context, { type: "project", id: proj, questions: s.context.questions }, "the run's scope, the project");
  assert.deepEqual(s.budget.map((b) => [b.bound, b.allowed]), [["fetches", 10], ["wallclock", 600000]], "its budget");
  assert.equal(s.state.instructions.reason, why.trim());
  assert.deepEqual(s.state.instructions.authority, { kind: "objective", ref: proj });
  /* a tick that replaces the scratch leaves the opening's record standing */
  await r.runs.tick({ run: "R-OBJ", state: { note: "midway" }, caller: "member:bob/t1", actor: "bob", viewer: "member:bob", at: T0 });
  const later = (await r.runs.read({ run: "R-OBJ", viewer: "member:bob" })).session;
  assert.equal(later.label, why.trim(), "the reason outlives the run's scratch");
  const listed = await r.runs.listInContext({ contextType: "project", contextId: proj, viewer: "member:bob" });
  const row = (listed.runs || listed.sessions || []).find((x) => (x.id ?? x.run) === "R-OBJ");
  assert.ok(row, JSON.stringify(listed).slice(0, 300));
  assert.equal(row.label, why.trim());
  assert.ok(Array.isArray(row.budget) && row.budget.length === 2);
});
