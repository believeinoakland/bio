/* case-checker at its interface: `checkCaseFile`'s `lens` (R23; D59), over real case files (`./fixture.mjs`) carrying a
   `bias_applications:` block (`case-grammar` R24), each lens with its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as CC from "../../../src/case-checker/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { caseFile, gradingFacts, byId, rows, A, B, C, MINUTES, MEMO } from "./fixture.mjs";

const G = (grade) => ({ state: "graded", grade });
const UNRATED = { state: "unrated", grade: null };
const results = (answer) => Object.fromEntries(answer.findings.map((f) => [f.finding, f.result]));
const ALL_RECREATED = { [A]: "recreated", [C]: "recreated", [B]: "recreated" };

/* As published: the memo's leg of B was lowered from A to B by statement S1 (the facts carry the lowered grade). */
const PUBLISHED = { finding: B, ord: 1, target: MEMO, statement: "S1", effect: "grade_lowered", from: "A", to: "B" };
const applicationsLines = (list) => rows("bias_applications", list);
const withApplications = (list = [PUBLISHED]) => caseFile({ docLines: applicationsLines(list) });
const run = (cf, lens) => CC.checkCaseFile({ parts: cf.parts, ...(lens === undefined ? {} : { lens }) });

test("R23: as_published (the default) answers each pair as published, R5's, with no lens fields on a finding, and states the limit; the applications change nothing", async () => {
  const cf = withApplications();
  const plain = await run(caseFile());
  for (const lens of [undefined, "as_published"]) {
    const r = await run(cf, lens);
    assert.deepEqual(results(r), ALL_RECREATED);
    assert.deepEqual(r.lens, { name: "as_published", statements: null, departure: null, not_applied: [] });
    assert.equal(r.lens_statement, CC.LENS_LIMIT_STATEMENT);
    assert.equal(r.lens_statement, "A re-check re-weighs the analysis that exists; it cannot write what another lens would have written.");
    for (const f of r.findings) {
      assert.deepEqual(Object.keys(f), ["finding", "role", "result", "missing", "differs", "pair", "bar_met"]);
      assert.deepEqual(f.pair, byId(plain)[f.finding].pair, f.finding);
    }
    assert.deepEqual(byId(r)[B].pair.connection, G("B"));
  }
});

test("R23: removed reverses every published application: a lowered grade restored to from, each finding's pair recomputed, a finding resting on it re-weighed through it, the changes named; the check's result is unchanged", async () => {
  const r = await run(withApplications(), "removed");
  assert.equal(r.lens.name, "removed");
  assert.equal(r.lens_statement, CC.LENS_LIMIT_STATEMENT);
  assert.deepEqual(results(r), ALL_RECREATED);          /* a lens re-weighs; it adds no differs entry */
  /* B's memo leg restored to A: its connection rises, and A, resting on B, takes B's pair under the lens */
  assert.deepEqual(byId(r)[B].pair.connection, G("A"));
  assert.deepEqual(byId(r)[B].as_published.pair.connection, G("B"));
  assert.deepEqual(byId(r)[B].lens_changes, [{ ...PUBLISHED, how: "reversed" }]);
  assert.deepEqual(byId(r)[A].pair.connection, G("A"));
  assert.deepEqual(byId(r)[A].lens_changes, [{ ...PUBLISHED, how: "reversed", through: B }]);
  assert.equal(byId(r)[A].bar_met, true);
  assert.deepEqual(byId(r)[C].lens_changes, []);
  assert.deepEqual(byId(r)[C].pair, byId(r)[C].as_published.pair);
  for (const f of r.findings) assert.deepEqual(Object.keys(f), ["finding", "role", "result", "missing", "differs", "pair", "bar_met", "as_published", "lens_changes"]);
  /* negative control: with no application published, removed answers the pairs as published */
  const none = await run(caseFile(), "removed");
  for (const f of none.findings) { assert.deepEqual(f.pair, f.as_published.pair, f.finding); assert.deepEqual(f.lens_changes, []); }
  /* an excluded leg is carried in the facts: restored, it counts as carried, and the reversal is named */
  const excluded = await run(withApplications([{ finding: A, ord: 0, target: MINUTES, statement: "S2", effect: "leg_excluded", from: null, to: null }]), "removed");
  assert.deepEqual(byId(excluded)[A].pair, byId(excluded)[A].as_published.pair);
  assert.deepEqual(byId(excluded)[A].lens_changes.map((x) => [x.effect, x.how]), [["leg_excluded", "reversed"]]);
});

test("R23: a reader's own lens applies its applications (a grade lowered to to; a leg excluded or an inference refused left out) and keeps the published ones whose statement it holds; bar_met is answered under it, with the statements that changed it", async () => {
  const cf = withApplications();
  /* the reader holds S1 (so the published lowering stands) and lowers A's minutes leg to D by S9 */
  const lower = { finding: A, ord: 0, target: MINUTES, statement: "S9", effect: "grade_lowered", from: "B", to: "D" };
  const r = await run(cf, { statements: ["S1", "S9"], applications: [lower] });
  assert.equal(r.lens.name, "reader");
  assert.deepEqual(r.lens.statements, ["S1", "S9"]);
  assert.deepEqual(results(r), ALL_RECREATED);
  assert.deepEqual(byId(r)[B].pair.connection, G("B"));           /* S1 held: the published lowering stands */
  assert.deepEqual(byId(r)[B].lens_changes, []);
  assert.deepEqual(byId(r)[A].pair.capture, G("D"));
  assert.equal(byId(r)[A].bar_met, false);                         /* short of the bar's capture B under this lens */
  assert.equal(byId(r)[A].as_published.bar_met, true);
  assert.deepEqual(byId(r)[A].lens_changes, [{ ...lower, how: "applied" }]);
  assert.equal(byId(r)[C].bar_met, "not_asked");
  assert.equal(byId(r)[B].bar_met, "not_asked");
  /* a reader not holding S1: the published lowering is reversed, as under removed */
  const without = await run(cf, { statements: ["S9"], applications: [lower] });
  assert.deepEqual(byId(without)[B].pair.connection, G("A"));
  assert.deepEqual(byId(without)[B].lens_changes, [{ ...PUBLISHED, how: "reversed" }]);
  /* a refused inference: A's leg on B left out, so A's connection rests on nothing and the bar is not met */
  const refuse = { finding: A, ord: 1, target: B, statement: "S9", effect: "inference_refused", from: null, to: null };
  const refused = await run(cf, { statements: ["S1", "S9"], applications: [refuse] });
  assert.deepEqual(byId(refused)[A].pair.connection, UNRATED);
  assert.equal(byId(refused)[A].bar_met, false);
  assert.deepEqual(byId(refused)[A].lens_changes, [{ ...refuse, how: "applied" }]);
  /* an excluded leg left out: A's minutes leg; A's capture now rests on B's alone */
  const exclude = { finding: A, ord: 0, target: MINUTES, statement: "S9", effect: "leg_excluded", from: null, to: null };
  const excluded = await run(cf, { statements: ["S1", "S9"], applications: [exclude] });
  assert.deepEqual(byId(excluded)[A].lens_changes, [{ ...exclude, how: "applied" }]);
  assert.deepEqual(byId(excluded)[A].pair.capture, byId(excluded)[B].pair.capture);
  /* negative controls: an application whose statement the lens does not hold, or naming no leg the case file carries,
     is not applied and is named with why */
  const stray = { ...lower, statement: "S7" };
  const ghost = { finding: A, ord: 9, target: "INFO-2026-0099-none", statement: "S9", effect: "grade_lowered", from: "B", to: "D" };
  const scrutiny = { finding: A, ord: null, target: A, statement: "S9", effect: "scrutiny_raised", from: null, to: null };
  const n = await run(cf, { statements: ["S1", "S9"], applications: [stray, ghost, scrutiny] });
  assert.deepEqual(n.lens.not_applied.map((x) => [x.statement, x.target, x.why]), [
    ["S7", MINUTES, "its statement is not among the lens's statements"],
    ["S9", "INFO-2026-0099-none", "it names no leg this case file carries, so it moves no grade here"],
    ["S9", A, "it raises scrutiny of a claim and moves no grade"]]);
  for (const f of n.findings) assert.deepEqual(f.pair, f.as_published.pair, f.finding);
});

test("R23 R16: a lens that is none of the three is answered as published with the departure named; the same lens always gives the same answer; the program takes --lens", async () => {
  const cf = withApplications();
  for (const bad of ["sideways", 7, { statements: "S1" }, { statements: ["S1"], applications: [{ effect: "grade_lowered" }] }]) {
    const r = await run(cf, bad);
    assert.equal(r.lens.name, "as_published");
    assert.match(r.lens.departure, /not as_published, removed, or a reader's own/);
    assert.equal(r.lens_statement, CC.LENS_LIMIT_STATEMENT);
    assert.deepEqual(results(r), ALL_RECREATED);
  }
  const lens = { statements: ["S9"], applications: [{ finding: A, ord: 0, target: MINUTES, statement: "S9", effect: "grade_lowered", from: "B", to: "C" }] };
  assert.equal(canonicalJson(await run(cf, lens)), canonicalJson(await run(cf, lens)));
  /* R13: the program's --lens gives checkCaseFile's answer under that lens */
  const files = new Map([["case.zip", cf.parts[0]], ["lens.json", new TextEncoder().encode(JSON.stringify(lens))]]);
  const read = async (p) => { if (!files.has(p)) throw new Error("no such file"); return files.get(p); };
  for (const [arg, given] of [["removed", "removed"], ["lens.json", lens]]) {
    const out = await CC.runProgram(["case.zip", "--lens", arg], read);
    assert.equal(out.status, 0);
    const json = JSON.parse(out.text.slice(out.text.indexOf("\n{") + 1));
    assert.equal(canonicalJson(json), canonicalJson(await run(cf, given)), arg);
  }
  assert.equal((await CC.runProgram(["case.zip", "--lens"], read)).status, 2);
  assert.equal((await CC.runProgram(["case.zip", "--lens", "gone.json"], read)).status, 2);
});

test("R23 R12: no lens composes a case-level strength: pairs stay per finding and per axis under every lens", async () => {
  const r = await run(withApplications(), "removed");
  for (const k of ["strength", "pair", "verdict", "score"]) assert.equal(Object.keys(r).includes(k), false, k);
  for (const f of r.findings) if (f.pair) assert.deepEqual(Object.keys(f.pair), ["capture", "connection", "testimony"]);
  assert.deepEqual(Object.keys(gradingFacts()).sort(), [A, B, C].sort());
});
