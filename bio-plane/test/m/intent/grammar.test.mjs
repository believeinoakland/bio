/* intent's project grammar (R29: C-2.9's other arms and C-9.1, registered in record-grammar's `checkProjectExtension`
   slot through record-core's grammar seam) and its own codes (R30, with R2, R8, R10 and R22 answering them). Each arm is
   checked over every rung, shape and reason the requirement names, through record-grammar's `checkBundle` called with
   the grammars the record answers, and through record-core's audit. */
import test from "node:test";
import assert from "node:assert/strict";
import { checkBundle, EXTENSION_ARMS } from "../../../src/record-grammar/index.mjs";
import { recordOf, RECORD_SCHEMA } from "../../../src/record-core/index.mjs";
import { INTENT_CHECKS, PROJECT_GRAMMAR, WORKPRODUCT_STATES, CLOSED_REASONS, checkProjectExtension,
         registerProjectGrammar, intentOf } from "../../../src/intent/index.mjs";
import { PROGRESSION_CHECKS } from "../../../src/progressions/index.mjs";
import { world, seeded, storage, V, COND } from "./fixture.mjs";

const TS = "2026-09-01T00:00:00Z";
const ev = (kind, strictness, result, extra = {}) => ({ kind, strictness, result, timestamp: TS, ...extra });
/* A project's front matter in the record's grammar: scalars, and `evaluations` as a list of flat maps. */
function projectDoc(fields = {}, type = "project") {
  const lines = ["---", "id: PROJ-2026-0001-p", `object_type: ${type}`, `schema: ${type}@1`, 'title: "P"',
                 `current_state: ${fields.current_state ?? "forming"}`, 'objective: "Find out."'];
  for (const [k, v] of Object.entries(fields)) {
    if (k === "current_state") continue;
    if (Array.isArray(v)) {
      lines.push(v.length ? `${k}:` : `${k}: []`);
      for (const e of v) Object.entries(e).forEach(([ek, evv], i) => lines.push(`${i ? "    " : "  - "}${ek}: ${JSON.stringify(evv)}`));
    } else lines.push(`${k}: ${v === null ? "null" : JSON.stringify(v)}`);
  }
  return [...lines, "---", "", "## Objective", "", "Find out.", ""].join("\n");
}
const judge = async (w, text) => (await checkBundle({ folderName: "PROJ-2026-0001-p", files: new Map([["bundle.md", text]]),
                                                       sha256: async () => "0" }, { grammars: w.record.grammars() })).findings;
const ours = (findings) => findings.filter((f) => f.check === "C-2.9" || f.check === "C-9.1");
const e29 = (message) => ({ check: "C-2.9", severity: "error", message });
const REPAIRS = ["run the missing evaluation", "demote workproduct_state to the highest earned rung"];
const e91 = (message) => ({ check: "C-9.1", severity: "error", message, repairable: true, repairs: REPAIRS });

/* R29's ladder, as the requirement states it: at the top three rungs, each kind with no internal-or-external pass is
   one error; at the top two, each with no external pass is one more; compliance before argument within each. */
function ladder(ws, evals) {
  const passed = (kind, stricts) => evals.some((e) => e && e.kind === kind && e.result === "pass" && stricts.includes(e.strictness));
  const out = [];
  if (["internally_checked", "externally_compliant", "distributed"].includes(ws))
    for (const kind of ["compliance", "argument"])
      if (!passed(kind, ["internal", "external"]))
        out.push(e91(`workproduct_state '${ws}' requires a passing ${kind} evaluation (internal strictness or better)`));
  if (["externally_compliant", "distributed"].includes(ws))
    for (const kind of ["compliance", "argument"])
      if (!passed(kind, ["external"]))
        out.push(e91(`workproduct_state '${ws}' requires a passing external-strictness ${kind} evaluation`));
  return out;
}

test("R29 the project grammar is registered once at start through record-core's grammar seam, as intent, claiming record-grammar's checkProjectExtension slot (C-2.9, C-9.1) whole, its only claimant", () => {
  const w = world();
  const slot = EXTENSION_ARMS.find((a) => a.name === "checkProjectExtension");
  assert.deepEqual([...slot.ids].sort(), ["C-2.9", "C-9.1"]);
  assert.deepEqual([PROJECT_GRAMMAR.module, [...PROJECT_GRAMMAR.ids]], ["intent", ["C-2.9", "C-9.1"]]);
  assert.equal(PROJECT_GRAMMAR.arm, checkProjectExtension);
  const held = w.record.grammars().filter((g) => g.ids.some((id) => slot.ids.includes(id)));
  assert.deepEqual(held.map((g) => [g.module, [...g.ids]]), [["intent", ["C-2.9", "C-9.1"]]], "intent alone claims the slot, whole");
  /* once: a second construction on the host, or a second registration on the record, adds nothing */
  assert.equal(intentOf(w.host), w.i);
  assert.equal(registerProjectGrammar(w.record), null);
  assert.equal(w.record.grammars().filter((g) => g.module === "intent").length, 1);
  /* a record with no seam is left alone; a refused registration is a wiring defect and throws */
  assert.equal(registerProjectGrammar({}), null);
  assert.equal(registerProjectGrammar(null), null);
  const st = storage();
  for (const t of RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) st.db.exec(t);
  const other = recordOf({ storage: st }, { evidence: null, evidencePrefix: "bio/captures/" });
  assert.equal(other.registerGrammar("squatter", { ids: ["C-9.1", "C-2.9", "C-800.1"], arm: () => {} }).ok, true);
  assert.equal(other.registerGrammar("intent", { ids: ["C-800.2"], arm: () => {} }).ok, true);
  assert.throws(() => registerProjectGrammar(other), /intent: record-core refused the project grammar: GRAMMAR_DECLARED/);
});

test("R29 workproduct_state: absent or null is nothing; each of draft, internally_checked, externally_compliant, distributed is legal; any other value is one C-2.9 error; a document of any other type gets nothing", async () => {
  const w = world();
  assert.deepEqual([...WORKPRODUCT_STATES], ["draft", "internally_checked", "externally_compliant", "distributed"]);
  assert.deepEqual(ours(await judge(w, projectDoc())), []);
  assert.deepEqual(ours(await judge(w, projectDoc({ workproduct_state: null }))), []);
  const full = [ev("compliance", "external", "pass"), ev("argument", "external", "pass")];
  for (const ws of WORKPRODUCT_STATES)
    assert.deepEqual(ours(await judge(w, projectDoc({ workproduct_state: ws, evaluations: full }))), [], ws);
  for (const bad of ["bogus", "Draft", "closed", ""])
    assert.deepEqual(ours(await judge(w, projectDoc({ workproduct_state: bad }))),
                     [e29(`workproduct_state '${bad}' is not one of: draft, internally_checked, externally_compliant, distributed`)], bad);
  /* any other type: nothing, however wrong its fields */
  const wrong = { workproduct_state: "bogus", evaluations: [{ kind: "x" }], current_state: "closed" };
  for (const type of ["information", "inquiry", "goal", "aspiration"])
    assert.deepEqual(ours(await judge(w, projectDoc(wrong, type))), [], type);
  const direct = [];
  checkProjectExtension({ fm: { object_type: "inquiry", workproduct_state: "bogus" } }, direct);
  checkProjectExtension({}, direct);
  assert.deepEqual(direct, []);
});

test("R29 evaluations: each entry needs kind compliance or argument, strictness internal or external, result pass or findings and an ISO timestamp, else one C-2.9 error naming its index; a findings result with an empty findings_ref is one C-2.9 error naming its index; a non-list is not read", async () => {
  const w = world();
  const good = [ev("compliance", "internal", "pass"), ev("argument", "external", "findings", { findings_ref: "INQ-1" })];
  assert.deepEqual(ours(await judge(w, projectDoc({ evaluations: good }))), []);
  const shape = (i) => e29(`evaluations[${i}] lacks the required kind/strictness/result/timestamp shape`);
  const ref = (i) => e29(`evaluations[${i}] result is findings but findings_ref is empty`);
  const cases = [
    [{ ...ev("compliance", "internal", "pass"), kind: "style" }, shape],
    [{ ...ev("compliance", "internal", "pass"), strictness: "casual" }, shape],
    [{ ...ev("compliance", "internal", "pass"), result: "fail" }, shape],
    [{ ...ev("compliance", "internal", "pass"), timestamp: "2026-09-01" }, shape],
    [{ ...ev("compliance", "internal", "pass"), timestamp: "2026-09-01T00:00:00.000Z" }, shape],
    [{ kind: "compliance", strictness: "internal", result: "pass" }, shape],
    [ev("argument", "internal", "findings"), ref],
    [ev("argument", "internal", "findings", { findings_ref: "" }), ref],
  ];
  for (const [entry, want] of cases)
    assert.deepEqual(ours(await judge(w, projectDoc({ evaluations: [good[0], entry] }))), [want(1)], JSON.stringify(entry));
  /* every bad entry is its own error, in index order, and a null entry is a shape error */
  const all = cases.map(([e]) => e);
  assert.deepEqual(ours(await judge(w, projectDoc({ evaluations: all }))), cases.map(([, want], i) => want(i)));
  const direct = [];
  checkProjectExtension({ fm: { object_type: "project", evaluations: [null, good[0]] } }, direct);
  assert.deepEqual(direct, [shape(0)]);
  /* not a list: not read */
  for (const evaluations of ["none", 3, { kind: "compliance" }]) {
    const out = [];
    checkProjectExtension({ fm: { object_type: "project", evaluations } }, out);
    assert.deepEqual(out, [], JSON.stringify(evaluations));
  }
});

test("R29 at closed, a closed_reason not one of resolved, superseded, abandoned is one C-2.9 error; at any other state it is not asked", async () => {
  const w = world();
  assert.deepEqual([...CLOSED_REASONS], ["resolved", "superseded", "abandoned"]);
  const msg = e29("closed state requires closed_reason in: resolved, superseded, abandoned");
  for (const reason of CLOSED_REASONS)
    assert.deepEqual(ours(await judge(w, projectDoc({ current_state: "closed", closed_reason: reason }))), [], reason);
  assert.deepEqual(ours(await judge(w, projectDoc({ current_state: "closed" }))), [msg], "absent");
  for (const reason of ["done", "", null, "Resolved"])
    assert.deepEqual(ours(await judge(w, projectDoc({ current_state: "closed", closed_reason: reason }))), [msg], String(reason));
  for (const state of ["forming", "active", "paused"])
    assert.deepEqual(ours(await judge(w, projectDoc({ current_state: state, closed_reason: "whatever" }))), [], state);
});

test("R29 C-9.1, the readiness ladder: at internally_checked or above, each of compliance and argument with no internal-or-external pass is one error; at externally_compliant or distributed, each with no external pass is one more; over every rung and every combination of passes", async () => {
  const w = world();
  /* each kind may hold: nothing, a findings result, an internal pass, an external pass */
  const options = (kind) => [[], [ev(kind, "external", "findings", { findings_ref: "R" })], [ev(kind, "internal", "pass")],
                             [ev(kind, "external", "pass")]];
  let checked = 0;
  for (const ws of WORKPRODUCT_STATES)
    for (const c of options("compliance"))
      for (const a of options("argument")) {
        const evals = [...c, ...a];
        const want = ladder(ws, evals);
        assert.deepEqual(ours(await judge(w, projectDoc({ workproduct_state: ws, evaluations: evals }))), want,
                         `${ws} ${JSON.stringify(evals)}`);
        checked += 1;
      }
  assert.equal(checked, 64);
  /* the ladder's figures at the rungs, stated outright */
  const none = async (ws) => ours(await judge(w, projectDoc({ workproduct_state: ws }))).length;
  assert.deepEqual([await none("draft"), await none("internally_checked"), await none("externally_compliant"), await none("distributed")],
                   [0, 2, 4, 4]);
  /* a pass with no timestamp is one C-2.9 error, and is still a pass evaluation on the ladder, as the catalogue read it */
  const r = ours(await judge(w, projectDoc({ workproduct_state: "internally_checked", evaluations: [
    { kind: "compliance", strictness: "internal", result: "pass" }, ev("argument", "internal", "pass")] })));
  assert.deepEqual(r.map((f) => f.check), ["C-2.9"]);
});

test("R29 the findings and their order are the catalogue's: workproduct_state, then each evaluation by index, then closed_reason, then the ladder's internal and external errors, compliance before argument; run at the slot's place, in one contiguous run", async () => {
  const w = world();
  const evals = [{ kind: "x" }, ev("compliance", "internal", "findings")];
  const text = projectDoc({ current_state: "closed", workproduct_state: "distributed", evaluations: evals });
  const fs = await judge(w, text);
  const mine = ours(fs);
  /* distributed is legal, so no workproduct_state error: the shape and ref errors, the reason, the ladder */
  assert.deepEqual(mine, [
    e29("evaluations[0] lacks the required kind/strictness/result/timestamp shape"),
    e29("evaluations[1] result is findings but findings_ref is empty"),
    e29("closed state requires closed_reason in: resolved, superseded, abandoned"),
    ...ladder("distributed", evals),
  ]);
  const bad = ours(await judge(w, projectDoc({ current_state: "closed", workproduct_state: "bogus", evaluations: evals })));
  assert.deepEqual(bad.map((f) => f.message.split(" ")[0]), ["workproduct_state", "evaluations[0]", "evaluations[1]", "closed"],
                   "an illegal rung is first, and earns no ladder error");
  /* contiguous: the arm runs once, at its slot's place */
  const at = fs.map((f, i) => (f.check === "C-2.9" || f.check === "C-9.1" ? i : -1)).filter((i) => i >= 0);
  assert.deepEqual(at, Array.from({ length: at.length }, (_, k) => at[0] + k));
  /* the arm on its own answers what checkBundle runs */
  const direct = [];
  checkProjectExtension({ fm: { object_type: "project", current_state: "closed", workproduct_state: "distributed", evaluations: evals } }, direct);
  assert.deepEqual(direct, mine);
  /* with no grammar for the slot, the bundle grammar runs nothing there */
  const bare = await checkBundle({ folderName: "PROJ-2026-0001-p", files: new Map([["bundle.md", text]]), sha256: async () => "0" },
                                 { grammars: w.record.grammars().filter((g) => g.module !== "intent") });
  assert.deepEqual(ours(bare.findings), []);
});

test("R29 R22 the audit runs the grammar over every project held, beside R1's objective arm, through the registrations record-core holds", async () => {
  const w = world();
  w.member("alice");
  const P = w.project("Audited", "alice");
  const text = w.text(P).replace("references: []", "references: []\nworkproduct_state: externally_compliant\nevaluations:\n"
    + `  - kind: compliance\n    strictness: internal\n    result: pass\n    timestamp: "${TS}"`).replace(/^objective: .*\n/m, "");
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='bundle.md'`, text, P);
  const pass = await w.record.auditPass({ limit: 50 });
  /* C-9.1: argument has no pass at all (1), compliance and argument no external pass (2); C-2.9: the objective (R1) */
  assert.equal(pass.tally["C-9.1"], 3);
  assert.equal(pass.tally["C-2.9"], 1);
  assert.equal(pass.tallyDetail["C-2.9/NO_OBJECTIVE"], 1);
});

test("R30 R2 R8 R10 R22 intent's own codes: a progression the record has not declared is INTENT_NO_SUCH_PROGRESSION (C-111.4), a stage it does not declare INTENT_BAD_STAGE (C-111.6), a missing reason INTENT_NO_REASON (C-111.13), numbers and translations unchanged; never progressions' NO_SUCH_PROGRESSION, BAD_STAGE or NO_REASON", async () => {
  /* the rows: one per code, numbers and translations as before the rename; progressions' codes held by progressions alone */
  const rows = {
    INTENT_NO_SUCH_PROGRESSION: ["C-111.4", "The measure names a declared flow the record does not hold. Declare the flow first, "
      + "or name one that exists. Nothing was written."],
    INTENT_BAD_STAGE: ["C-111.6", "The measure requires a step the declared flow does not have. Name steps the flow declares. "
      + "Nothing was written."],
    INTENT_NO_REASON: ["C-111.13", "This act is recorded with a reason in your own words, and none was given. The record keeps "
      + "why, so the next reader is not left guessing. Nothing was written."],
  };
  for (const [code, [check, translation]] of Object.entries(rows))
    assert.deepEqual([INTENT_CHECKS[code].check, INTENT_CHECKS[code].translation], [check, translation], code);
  for (const [code, check] of [["NO_SUCH_PROGRESSION", "C-100.11"], ["BAD_STAGE", "C-100.14"], ["NO_REASON", "C-100.18"]]) {
    assert.equal(INTENT_CHECKS[code], undefined, `intent holds no ${code}`);
    assert.equal(PROGRESSION_CHECKS[code].check, check, `${code} is progressions' one row`);
  }
  const w = seeded();
  w.entity("ENT-1");
  w.define();
  const answered = (r, code, label) => {
    assert.equal(r.ok, false, label);
    assert.deepEqual([r.reason, r.code, r.check, r.translation], [code, code, ...rows[code]], label);
  };
  const snap = w.snapshot();
  /* R2: a condition naming an undeclared progression, or a stage its progression does not declare */
  answered(w.i.setCondition({ project: w.P, condition: { ...COND, progression: "nope" }, author: V("bob"), viewer: V("bob") }),
           "INTENT_NO_SUCH_PROGRESSION", "setCondition progression");
  answered(w.i.setCondition({ project: w.P, condition: { ...COND, required: { grade: "B", stages: ["signoff"] } }, author: V("bob"),
                              viewer: V("bob") }), "INTENT_BAD_STAGE", "setCondition stage");
  /* R30: declareAspiration naming an undeclared progression */
  answered(w.i.declareAspiration({ scope: "group", statement: "s", progressions: ["proc", "nope"], author: V("alice") }),
           "INTENT_NO_SUCH_PROGRESSION", "declareAspiration");
  /* R8: closeGoal with no reason; R10: departFrom with no reason; R16's defer and dismiss */
  const g = w.i.declareGoal({ statement: "s", bounds: "b", author: V("bob") }).goal;
  const a = w.i.declareAspiration({ scope: "group", statement: "s", author: V("alice") }).aspiration;
  w.i.registerSource("monitoring", () => [{ key: "c-1", kind: "k", basis: null }]);
  const snap2 = w.snapshot();
  for (const reason of [undefined, "", "   "]) {
    answered(w.i.closeGoal({ goal: g, reason, author: V("bob") }), "INTENT_NO_REASON", `closeGoal ${reason}`);
    answered(w.i.departFrom({ project: w.P, aspiration: a, reason, author: V("bob") }), "INTENT_NO_REASON", `departFrom ${reason}`);
    for (const act of ["defer", "dismiss"])
      answered(w.i.triage({ proposal: "monitoring::c-1", act, reason, author: V("bob") }), "INTENT_NO_REASON", `${act} ${reason}`);
  }
  /* R26's registered check: a goal closed through a raw promotion with no reason */
  const closed = w.text(g).replace("current_state: open", "current_state: closed");
  answered(w.revise(g, closed, V("bob")), "INTENT_NO_REASON", "a raw close");
  /* a raw promotion of a project carrying a condition naming what the record does not declare */
  const raw = (c) => w.revise(w.P, w.text(w.P).replace("references: []", `references: []\nobjective_condition:\n${c}`), V("bob"));
  answered(raw("  progression: nope\n  entity: ENT-1\n  required_grade: B\n  required_stages: []\n  share: 50"),
           "INTENT_NO_SUCH_PROGRESSION", "a raw condition's progression");
  answered(raw("  progression: proc\n  entity: ENT-1\n  required_grade: B\n  required_stages: [signoff]\n  share: 50"),
           "INTENT_BAD_STAGE", "a raw condition's stage");
  assert.deepEqual(w.snapshot(), snap2, "no refusal wrote anything");
  void snap;
});
