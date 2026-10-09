/* R61 (D59; inquiry-grammar R18's store-side share; K2448, K2472): a leg's `bias_applied` statement is asked of the real
   bias module's `statementInForce` (its R49) at the inquiry's project scope (or the instance), the acting member as
   viewer; one not in force, or undetermined, is refused `BIAS_APPLICATION_NOT_IN_FORCE` (C-2.19) through
   `biasNotInForce`, its one spelling, naming the leg and the statement. Driven at the interface: `biasAppliedFindings`
   (the act's check, over legs in inquiry-grammar R18's encoding, read through its `readBiasApplied`), the promotion,
   and the exported pure `biasNotInForce`. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, inquiryMd } from "./fixture.mjs";
import { biasNotInForce, INQUIRY_BIAS_CHECKS } from "../../../src/inquiry/index.mjs";
import { flattenBiasApplied } from "../../../src/inquiry-grammar/index.mjs";

const LENS = "BIAS-2026-6101-lens";
const lensMd = (state, prior) => ["---", `id: ${LENS}`, "object_type: bias", `title: "Project lens"`,
  `current_state: ${state}`, `prior_state: ${prior}`, `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  "group: test-group", "statements:", `  - id: "s1"`, `    kind: "scrutiny"`, `    subject: "ENT-2026-0007"`,
  `    text: "Claims from this office need a second, independent record."`,
  `    justification: "The office is a party to matters this group examines."`,
  "    citations: []", "    locked: false", "---", "", "## Statements", "", "The lens.", "", "## Adoption", "", "Adopted.", "",
  "## What This Does Not Enforce", "", "It does not check independence.", "", "## Session Log", "", "## Review Notes", ""].join("\n");

function lensWorld() {
  const w = world({ bias: true });
  w.member("ruth"); w.member("sam");
  const P = w.project("Sewer fund", "ruth");
  for (const [s, p] of [["draft", "null"], ["proposed", "draft"], ["adopted", "proposed"]])
    assert.equal(w.promote(LENS, lensMd(s, p), undefined, { author: "member:ruth", meta: { object_type: "bias" } }).ok, true);
  const a = w.bias.biasAdopt({ reason: "We adopt this lens because the office is a party to our matters.", bundleId: LENS,
    scope: "project", scopeId: P, author: "ruth", identity: "member:ruth", viewer: "member:ruth" });
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  w.P = P;
  return w;
}
/* a leg in front matter's one encoding (inquiry-grammar R18's `flattenBiasApplied`) */
const leg = (statements, extra = {}) => ({ target: "INFO-2026-6101-doc", role: "supports",
  ...flattenBiasApplied(statements.map((statement) => ({ statement, effect: "leg_excluded" }))), ...extra });
const ROW = INQUIRY_BIAS_CHECKS.BIAS_APPLICATION_NOT_IN_FORCE;

test("R61 a statement in force for the inquiry's project passes; one not in force is refused BIAS_APPLICATION_NOT_IN_FORCE naming the leg and the statement", () => {
  const w = lensWorld();
  assert.equal(w.bias.statementInForce({ statement: "s1", scope: { type: "project", id: w.P }, viewer: "member:ruth" }).in_force, true);
  /* in force: nothing found (the negative control) */
  assert.deepEqual(w.k.biasAppliedFindings({ legs: [leg(["s1"])], project: w.P, viewer: "member:ruth" }), []);
  /* not in force: each offending application named, in leg order, and only those */
  const f = w.k.biasAppliedFindings({ legs: [leg(["s1"]), { target: "INFO-x", role: "supports" }, leg(["s1", "s9"])],
                                      project: w.P, viewer: "member:ruth" });
  assert.deepEqual(f, [biasNotInForce({ statement: "s9", where: "basis[2].bias_applied[1]", inForce: false,
                                        scope: { type: "project", id: w.P } })]);
  assert.deepEqual([f[0].check, f[0].code, f[0].translation, f[0].statement, f[0].where, f[0].in_force],
                   ["C-2.19", "BIAS_APPLICATION_NOT_IN_FORCE", ROW.translation, "s9", "basis[2].bias_applied[1]", false]);
  assert.match(f[0].detail, /basis\[2\]\.bias_applied\[1\] names the bias statement 's9'/);
});

test("R61 the scope is the inquiry's project, else the instance; the acting member is the viewer: a member who may not see the project's lens is refused", () => {
  const w = lensWorld();
  /* the instance holds no lens: s1, a project statement, is not in force there */
  const inst = w.k.biasAppliedFindings({ legs: [leg(["s1"])], project: null, viewer: "member:ruth" });
  assert.deepEqual(inst.map((x) => [x.code, x.statement, x.where]), [["BIAS_APPLICATION_NOT_IN_FORCE", "s1", "basis[0].bias_applied[0]"]]);
  assert.match(inst[0].detail, /group's lens in force/);
  /* sam is no participant of ruth's hidden project: the lens is not his to read (bias R13), so not in force for him */
  const sam = w.k.biasAppliedFindings({ legs: [leg(["s1"])], project: w.P, viewer: "member:sam" });
  assert.deepEqual(sam.map((x) => x.code), ["BIAS_APPLICATION_NOT_IN_FORCE"]);
  /* negative control: the same leg by ruth passes */
  assert.deepEqual(w.k.biasAppliedFindings({ legs: [leg(["s1"])], project: ` ${w.P} `, viewer: "member:ruth" }), []);
});

test("R61 fail closed: an undetermined answer, a read that throws or answers another shape, and no bias module each refuse; a leg with no bias_applied asks nothing", () => {
  const answers = { undetermined: { ok: true, in_force: null }, shape: { nope: 1 }, nothing: null };
  for (const [name, answer] of [...Object.entries(answers), ["throws", "throw"]]) {
    const w = world();
    const asked = [];
    w.k.bindBias({ biasManifest: () => null,
      statementInForce: (q) => { asked.push(q); if (answer === "throw") throw new Error("boom"); return answer; } });
    const f = w.k.biasAppliedFindings({ legs: [leg(["s1"])], project: "PROJ-x", viewer: "member:ruth" });
    assert.deepEqual(f.map((x) => [x.code, x.in_force]), [["BIAS_APPLICATION_NOT_IN_FORCE", null]], name);
    assert.match(f[0].detail, /could not be read/, name);
    assert.deepEqual(asked, [{ statement: "s1", scope: { type: "project", id: "PROJ-x" }, viewer: "member:ruth" }], name);
    /* negative control: legs with no application, an entry with no statement, or a key outside the encoding (each the grammar's to refuse) ask nothing */
    asked.length = 0;
    assert.deepEqual(w.k.biasAppliedFindings({ legs: [{ target: "INFO-x" }, { target: "INFO-y", bias_1_effect: "leg_excluded" },
      { target: "INFO-z", bias_1_statement: "", bias_applied: [{ statement: "s1" }] }], project: null, viewer: "member:ruth" }), []);
    assert.deepEqual(asked, [], name);
  }
  /* no bias module bound to the host: refused, never passed */
  const bare = world();
  assert.deepEqual(bare.k.biasAppliedFindings({ legs: [leg(["s1"])], viewer: "member:ruth" }).map((x) => x.code),
                   ["BIAS_APPLICATION_NOT_IN_FORCE"]);
  /* a call with no legs, or not a list, finds nothing and never throws */
  assert.deepEqual(bare.k.biasAppliedFindings(), []);
  assert.deepEqual(bare.k.biasAppliedFindings({ legs: "x" }), []);
});

test("R61 K231: biasNotInForce is the refusal's one spelling, pure, its row this module's, for basis-versions R48 and case-disclosures R31 to answer through", () => {
  assert.equal(ROW.check, "C-2.19");
  assert.match(ROW.where, /^src\/inquiry\/index\.mjs biasNotInForce > is-bias-application-in-force/);
  const a = biasNotInForce({ statement: "s9", where: "conclusion", inForce: false, scope: { type: "project", id: "PROJ-1" } });
  assert.deepEqual(a, biasNotInForce({ statement: "s9", where: "conclusion", inForce: false, scope: { type: "project", id: "PROJ-1" } }), "pure");
  assert.deepEqual(Object.keys(a).sort(), ["check", "code", "detail", "in_force", "statement", "translation", "where"]);
  assert.deepEqual([a.code, a.check, a.translation, a.statement, a.where, a.in_force],
                   ["BIAS_APPLICATION_NOT_IN_FORCE", "C-2.19", ROW.translation, "s9", "conclusion", false]);
  assert.match(a.detail, /not in the lens in force for PROJ-1/);
  const u = biasNotInForce({ statement: "s9", inForce: null });
  assert.deepEqual([u.in_force, u.where], [null, null]);
  assert.match(u.detail, /could not be read/);
  assert.doesNotThrow(() => biasNotInForce());
  assert.doesNotThrow(() => biasNotInForce(null));
  assert.equal(biasNotInForce({ statement: 7 }).statement, null);
});

test("R61 at the promotion: a leg's statement written in front matter's encoding (bias_<n>_statement, inquiry-grammar R18) is asked as the author sees it; one not in force refuses BASIS_REFUSED and nothing is written", () => {
  const w = lensWorld();
  const DOC = "INFO-2026-6102-doc";
  w.doc(DOC);
  const md = (id, statements) => inquiryMd(id, { legs: [{ target: DOC }], extra: [`project: ${w.P}`] })
    .replace("    role: supports", ["    role: supports", ...statements.flatMap((st, i) =>
      [`    bias_${i + 1}_statement: ${st}`, `    bias_${i + 1}_effect: leg_excluded`])].join("\n"));
  /* in force: lands (the negative control) */
  const ok = w.promote("INQ-2026-6101-in", md("INQ-2026-6101-in", ["s1"]), undefined, { author: "member:ruth" });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 400));
  /* not in force: refused, the leg and the statement named, nothing written */
  const r = w.promote("INQ-2026-6102-out", md("INQ-2026-6102-out", ["s1", "s9"]), undefined, { author: "member:ruth" });
  assert.deepEqual([r.ok, r.reason], [false, "BASIS_REFUSED"]);
  assert.deepEqual(r.findings.map((f) => [f.code, f.check, f.statement, f.where]),
                   [["BIAS_APPLICATION_NOT_IN_FORCE", "C-2.19", "s9", "basis[0].bias_applied[1]"]]);
  assert.equal(w.record.head("INQ-2026-6102-out"), null, "nothing was written");
  /* the author is the viewer: sam, outside the project, is refused the statement ruth may apply */
  const sam = w.promote("INQ-2026-6103-sam", md("INQ-2026-6103-sam", ["s1"]), undefined, { author: "member:sam" });
  assert.deepEqual(sam.findings?.map((f) => f.code), ["BIAS_APPLICATION_NOT_IN_FORCE"], JSON.stringify(sam).slice(0, 300));
  /* a leg with no application asks nothing and lands */
  assert.equal(w.promote("INQ-2026-6104-none", inquiryMd("INQ-2026-6104-none", { legs: [{ target: DOC }] })).ok, true);
});
