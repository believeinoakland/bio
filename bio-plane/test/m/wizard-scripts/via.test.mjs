/* wizard-scripts: a step's side trip into another wizard (R2's `via`), its check (R12's WIZARD_VIA_REFUSED) and its answer
   (R11, R21), at the module's interface (T34-52; DEC-139 (4)). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, draft, approved, V, STEPS, step, SCREENS, OPS, MACHINE_REFUSED, MACHINE_DRAFTS, LIBRARY } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";

const A = V("alice"), F = V("frank"), E = V("erin"), D = V("dave");
const REG = { screens: SCREENS, ops: OPS, machineRefused: MACHINE_REFUSED, machineDrafts: MACHINE_DRAFTS };
const codes = (r) => r.refusals.map((x) => [x.code, x.step]);
const row = (c) => wz.WIZARD_SCRIPTS_CHECKS[c];
const refused = (r, c, why = "") => {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, c, c, row(c).check, row(c).translation], `${why} ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};

test("R2 a step may carry via, the id of another script: kept in canonical form and answered with the step; a via that is not an id is WIZARD_STEP_REFUSED naming the step; a step without via hashes as before", () => {
  const w = seeded();
  const d = w.wz.wizardDraft({ project: w.P, name: "N", recorded: [{ screen: "case-home", act: "casenote" }, { screen: "case-home", act: null }],
                               author: F, viewer: F });
  const rev = (steps) => w.wz.wizardRevise({ version: d.version, steps, author: F, viewer: F });
  const trip = step("case-home", null, { via: LIBRARY[1].id });
  assert.equal(rev([step("case-home", "casenote"), trip]).ok, true);
  assert.deepEqual(w.wz.wizardRead({ version: d.version, viewer: F }).version.steps[1], trip);
  for (const via of [7, "", "a\nb", "x".repeat(201), {}]) {
    const r = rev([step("case-home", "casenote"), step("case-home", null, { via })]);
    if (via === "") assert.equal(r.ok, true, "an empty via is none");
    else assert.equal(refused(r, "WIZARD_STEP_REFUSED", JSON.stringify(via)).step, 2);
  }
  assert.deepEqual(wz.STEP_KEYS, ["screen", "act", "what", "why", "draft", "via"]);
  assert.equal(wz.stepsSha(STEPS), wz.stepsSha(STEPS.map((s) => ({ ...s, via: null }))), "no via, the same sha");
  assert.notEqual(wz.stepsSha(STEPS), wz.stepsSha([STEPS[0], { ...STEPS[1], via: LIBRARY[1].id }]));
  /* R11 answers the step with its via; the side trip is no step of this script, so its use is the other script's (R15) */
  assert.equal(rev([step("case-home", "casenote"), trip]).ok, true);
  w.wz.wizardSubmit({ version: d.version, author: F, viewer: F });
  w.wz.wizardApprove({ version: d.version, by: A, viewer: A });
  const at = w.wz.wizardsAt({ screen: "case-home", viewer: F }).scripts.find((s) => s.version === d.version);
  assert.equal(at.steps[1].via, LIBRARY[1].id);
  assert.equal(w.wz.wizardProgress({ script: d.script, version: d.version, event: "step", step: 3 }).reason, "WIZARD_PROGRESS_REFUSED");
  assert.equal(w.wz.wizardProgress({ script: LIBRARY[1].id, version: `${LIBRARY[1].id}@1`, event: "start" }).ok, true);
  assert.equal(w.wz.wizardUse({ script: LIBRARY[1].id, viewer: E }).use[0].start, 1);
});

test("R12 WIZARD_VIA_REFUSED: a via naming the script itself, a script not offered, or one whose own steps lead back to this one through via (however far); a side trip that returns passes", () => {
  const offered = [{ id: "WIZ-b", steps: [step("case-home", "casenote")] }, { id: "WIZ-c", steps: [step("case-home", null, { via: "WIZ-b" })] },
                   { id: "WIZ-back", steps: [step("case-home", null, { via: "WIZ-a" })] }, { id: "WIZ-far", steps: [step("case-home", null, { via: "WIZ-back" })] }];
  const check = (via, self = "WIZ-a", extra = {}) => codes(wz.checkScript([step("case-home", "casenote"), step("case-home", null, { via })], { ...REG, offered, self, ...extra }));
  assert.deepEqual(check("WIZ-b"), [], "negative control: an offered script that does not lead back");
  assert.deepEqual(check("WIZ-c"), [], "through another that returns");
  assert.deepEqual(check("WIZ-a"), [["WIZARD_VIA_REFUSED", 2]], "the script itself");
  assert.deepEqual(check("WIZ-none"), [["WIZARD_VIA_REFUSED", 2]], "not offered");
  assert.deepEqual(check("WIZ-back"), [["WIZARD_VIA_REFUSED", 2]], "leads straight back");
  assert.deepEqual(check("WIZ-far"), [["WIZARD_VIA_REFUSED", 2]], "leads back two trips on");
  assert.deepEqual(check("WIZ-back", null), [], "an unnamed list has no self to return to");
  assert.deepEqual(check("WIZ-b", "WIZ-a", { offered: [] }), [["WIZARD_VIA_REFUSED", 2]], "nothing offered");
  const r = wz.checkScript([step("case-home", null, { via: "WIZ-a" })], { ...REG, offered, self: "WIZ-a" }).refusals[0];
  assert.deepEqual([r.check, r.translation, typeof r.detail], [row("WIZARD_VIA_REFUSED").check, row("WIZARD_VIA_REFUSED").translation, "string"]);
  /* the offered set is the viewer's: a script of a project the author cannot see is not offered to them */
  const w = seeded();
  const q = draft(w, { who: "dave", name: "Q's", project: w.Q });
  const p = approved(w, { name: "P's" });
  const d = w.wz.wizardDraft({ project: w.P, name: "Trips", recorded: [{ screen: "case-home", act: "casenote" }, { screen: "case-home", act: null }], author: F, viewer: F });
  const go = (via) => {
    w.wz.wizardRevise({ version: d.version, steps: [step("case-home", "casenote"), step("case-home", null, { via })], author: F, viewer: F });
    return w.wz.wizardCheck({ steps: w.wz.wizardRead({ version: d.version, viewer: F }).version.steps, viewer: F });
  };
  assert.deepEqual(codes(go(p.script)), []);
  assert.deepEqual(codes(go(LIBRARY[1].id)), [], "a library script");
  assert.deepEqual(codes(go(q.script)), [["WIZARD_VIA_REFUSED", 2]], "a script frank cannot see, and not offered");
  refused(w.wz.wizardSubmit({ version: d.version, author: F, viewer: F }), "WIZARD_VIA_REFUSED");
});

test("R12 WIZARD_VIA_REFUSED at approval and at registration: a group script whose side trip's target stops being offered is refused again and broken until it returns", () => {
  const w = seeded();
  const target = approved(w, { name: "Target" });
  const d = w.wz.wizardDraft({ project: w.P, name: "With a trip", recorded: [{ screen: "case-home", act: "casenote" }, { screen: "case-home", act: null }],
                               author: F, viewer: F });
  w.wz.wizardRevise({ version: d.version, steps: [step("case-home", "casenote"), step("case-home", null, { via: target.script })], author: F, viewer: F });
  assert.equal(w.wz.wizardSubmit({ version: d.version, author: F, viewer: F }).ok, true);
  w.wz.wizardRetire({ script: target.script, reason: "gone", by: A, viewer: A });
  assert.equal(refused(w.wz.wizardApprove({ version: d.version, by: A, viewer: A }), "WIZARD_VIA_REFUSED").step, 2);
});

test("R21 the registry form answers each step's via, the side trip's script id, or null when it has none", () => {
  const w = seeded();
  const d = w.wz.wizardDraft({ project: w.P, name: "Trip", recorded: [{ screen: "publish", act: "publish" }, { screen: "case-home", act: null }],
                               author: F, viewer: F });
  w.wz.wizardRevise({ version: d.version, steps: [step("publish", "publish"), step("case-home", null, { via: LIBRARY[0].id })], author: F, viewer: F });
  const e = w.wz.wizardRegistry({ viewer: F }).screens.find((s) => s.id === "publish").scripts.find((s) => s.version === d.version);
  assert.deepEqual(e.steps.map((s) => s.via), [null, LIBRARY[0].id]);
  assert.deepEqual(Object.keys(e.steps[0]).sort(), ["act", "screen", "via", "what", "why"]);
});
