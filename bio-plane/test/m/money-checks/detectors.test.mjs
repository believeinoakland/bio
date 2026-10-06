/* money-checks R4, R5, R11, R12: detectors as data, versioned, switched per project; the ops map. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, shareDetector, SHARE_RECIPE, ALICE, ADMIN_BOB, MACHINE } from "./fixture.mjs";
import { moneyChecksOps, SHIPPED } from "../../../src/money-checks/index.mjs";

test("R4: defineDetector's refusals, each writing nothing", () => {
  const w = world();
  const before = w.snapshot();
  const cases = [
    [{ label: "" }, "NO_LABEL"],
    [{ population: null }, "NO_POPULATION"],
    [{ population: { per: "person" } }, "BAD_POPULATION"],
    [{ population: { per: "fact", kinds: [] } }, "BAD_POPULATION"],
    [{ population: { per: "fact", wards: ["x"] } }, "BAD_POPULATION"],
    [{ condition: { ...SHARE_RECIPE, method: "bio-calc/9" } }, "BAD_RECIPE"],
    [{ condition: { ...SHARE_RECIPE, steps: [...SHARE_RECIPE.steps.slice(0, 3), { op: "eval", as: "x", code: "1" }], output: "x" } }, "BAD_RECIPE"],
    [{ condition: { ...SHARE_RECIPE, output: "portion" } }, "BAD_RECIPE"],
    [{ condition: { ...SHARE_RECIPE, inputs: [...SHARE_RECIPE.inputs, { name: "other", kind: "table" }] } }, "BAD_RECIPE"],
    [{ parameters: [] }, "BAD_RECIPE"],
    [{ parameters: [{ name: "share", value: "0.5", citation: "" }] }, "NO_CITATION"],
    [{ parameters: [{ name: "share", value: "half", citation: "x" }] }, "BAD_VALUE"],
    [{ denominator: " " }, "NO_DENOMINATOR"],
    [{ derivation: "" }, "NO_DERIVATION"],
    [{ by: MACHINE }, "MEMBER_ACT_ONLY"],
    [{ detectorId: "md-none" }, "NO_SUCH_DETECTOR"],
  ];
  for (const [over, code] of cases) assert.equal(w.c.defineDetector(shareDetector(over)).reason, code, code);
  assert.deepEqual(w.snapshot(), before);
  /* calc-grammar's refusal is carried with its step */
  const r = w.c.defineDetector(shareDetector({ condition: { ...SHARE_RECIPE, method: "bio-calc/9" } }));
  assert.equal(r.errors[0].code, "METHOD_UNKNOWN");
});

test("R4: a condition or population naming a person entity is refused SUBJECT_IS_PERSON", () => {
  const w = world();
  w.entityAs("ENT-2026-0300", "person");
  w.entityAs("ENT-2026-0301", "institution");
  const naming = (ent) => ({ ...SHARE_RECIPE, steps: [{ op: "select", as: "mine", from: "facts", where: [{ field: "to_entity", test: "eq", value: ent }] },
    { op: "share", as: "portion", part: "mine", whole: "facts", field: "amount" }, { op: "compare", as: "past", a: "portion", b: "share" }] });
  const r = w.c.defineDetector(shareDetector({ condition: naming(w.id("ENT-2026-0300")) }));
  assert.equal(r.reason, "SUBJECT_IS_PERSON");
  assert.equal(r.entity, w.id("ENT-2026-0300"));
  assert.equal(w.c.defineDetector(shareDetector({ condition: naming(w.id("ENT-2026-0301")) })).ok, true);
});

test("R12: no HYP- id is an input, subject or parameter of a check or detector", () => {
  const w = world();
  const hyp = "HYP-2026-0001";
  const cond = { ...SHARE_RECIPE, steps: [{ op: "select", as: "mine", from: "facts", where: [{ field: "to_entity", test: "eq", value: hyp }] },
    { op: "share", as: "portion", part: "mine", whole: "facts", field: "amount" }, { op: "compare", as: "past", a: "portion", b: "share" }] };
  assert.equal(w.c.defineDetector(shareDetector({ condition: cond })).reason, "HYPOTHESIS_NOT_INPUT");
  assert.equal(w.c.defineDetector(shareDetector({ parameters: [{ name: "share", value: "0.5", citation: hyp }] })).reason, "HYPOTHESIS_NOT_INPUT");
  assert.equal(w.c.stateParameter({ check: "junction_stages", name: "award_stage", value: hyp, citation: "x", by: ALICE }).reason, "HYPOTHESIS_NOT_INPUT");
  assert.equal(w.c.stateParameter({ check: "change_orders_past_share", name: "share", value: "0.1", citation: "x", contract: hyp, by: ALICE }).reason,
               "HYPOTHESIS_NOT_INPUT");
  assert.equal(w.count("money_detector_versions"), SHIPPED.length);
});

test("R4: a member's definition is theirs; a change is a new version, earlier versions kept; shipped ones are data", () => {
  const w = world();
  const d = w.c.defineDetector(shareDetector());
  assert.equal(d.ok, true);
  assert.equal(d.origin, "member");
  assert.equal(d.version, 1);
  const d2 = w.c.defineDetector(shareDetector({ detectorId: d.detector_id, label: "payee share, revised", by: ADMIN_BOB }));
  assert.equal(d2.version, 2);
  const listed = w.c.detectors({ viewer: ALICE }).detectors;
  const mine = listed.find((x) => x.detector_id === d.detector_id);
  assert.deepEqual(mine.versions.map((v) => [v.version, v.label, v.by]), [[1, "payee share", ALICE], [2, "payee share, revised", ADMIN_BOB]]);
  assert.equal(mine.by, ALICE);
  const shipped = listed.find((x) => x.detector_id === SHIPPED[0].detectorId);
  assert.equal(shipped.origin, "shipped");
  assert.equal(shipped.versions[0].parameters[0].value, null);
  /* a member states the shipped detector's threshold by a new version; it stays shipped in origin */
  const s2 = w.c.defineDetector({ ...SHIPPED[0], parameters: [{ name: "share", value: "0.4", citation: "our own word" }], by: ALICE });
  assert.equal(s2.version, 2);
  assert.equal(s2.origin, "shipped");
});

test("R5: switchDetector is a member's act per project; off raises nothing for it; detectors answers the switch", () => {
  const w = world();
  w.project("PROJ-2026-0001-a", ["alice"]);
  w.project("PROJ-2026-0002-b", ["bob"]);
  const d = w.c.defineDetector(shareDetector());
  const base = { detectorId: d.detector_id, project: "PROJ-2026-0001-a", on: false, by: ALICE };
  assert.equal(w.c.switchDetector({ ...base, by: MACHINE }).reason, "MEMBER_ACT_ONLY");
  assert.equal(w.c.switchDetector({ ...base, detectorId: "md-x" }).reason, "NO_SUCH_DETECTOR");
  assert.equal(w.c.switchDetector({ ...base, project: "" }).reason, "NO_PROJECT");
  assert.equal(w.c.switchDetector({ ...base, project: "PROJ-2026-0002-b" }).reason, "NO_SUCH_PROJECT");
  assert.equal(w.c.switchDetector({ ...base, on: "no" }).reason, "NO_SWITCH");
  assert.equal(w.c.switchDetector(base).ok, true);
  const sw = (viewer) => w.c.detectors({ viewer }).detectors.find((x) => x.detector_id === d.detector_id).switches;
  assert.deepEqual(sw(ALICE), [{ project: "PROJ-2026-0001-a", on: false }]);
  assert.equal(w.c.switchDetector({ ...base, on: true }).ok, true);
  assert.deepEqual(sw(ALICE), [{ project: "PROJ-2026-0001-a", on: true }]);
  assert.equal(w.count("money_detector_switches"), 2);
  /* a project the viewer cannot see is not listed */
  w.c.switchDetector({ ...base, project: "PROJ-2026-0002-b", by: ADMIN_BOB });
  assert.deepEqual(sw(ALICE).map((s) => s.project), ["PROJ-2026-0001-a"]);
  /* each detector answers its gate (none yet) */
  assert.equal(w.c.detectors({ viewer: ALICE }).detectors[0].versions[0].gate, null);
});

test("R11: the ops map has one arm per act and read, reading the stamps the control plane sets", () => {
  const w = world();
  const url = new URL("https://x/?viewer=member%3Aalice&project=PROJ-2026-0001-a&contract=&check=junction_stages");
  const ops = moneyChecksOps(w.c, url, shareDetector());
  assert.deepEqual(Object.keys(ops).sort(), ["moneyamountchecks", "moneycheckparam", "moneycheckparams", "moneydetectordefine",
    "moneydetectorgate", "moneydetectors", "moneydetectorsrun", "moneydetectorswitch", "moneyjunction", "moneynoticed"]);
  assert.equal(ops.moneydetectordefine().ok, true);
  assert.equal(ops.moneyamountchecks().reason, "NO_CONTRACT");
  assert.equal(ops.moneycheckparams().ok, true);
  assert.equal(ops.moneydetectors().ok, true);
  assert.equal(ops.moneynoticed().reason, "NO_SUCH_PROJECT");
  /* the body cannot set the viewer: a read takes it from the URL */
  const ops2 = moneyChecksOps(w.c, new URL("https://x/?project=PROJ-2026-0001-a"), { viewer: "admin" });
  w.project("PROJ-2026-0001-a", ["bob"]);
  assert.equal(ops2.moneynoticed().reason, "NO_SUCH_PROJECT");
});
