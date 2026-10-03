/* wizard-scripts: the checks every script passes (R12), registration and breaks (R13) and the required flows' release
   check (R14), at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, draft, approved, restart, registration, V, MACHINE, STEPS, step, SCREENS, OPS, MACHINE_REFUSED, MACHINE_DRAFTS,
         LIBRARY, OFFERED_TEMPLATE } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";

const A = V("alice"), F = V("frank"), E = V("erin"), D = V("dave");
const row = (c) => wz.WIZARD_SCRIPTS_CHECKS[c];
const refused = (r, c, why = "") => {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, c, c, row(c).check, row(c).translation], `${why} ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};
const REG = { screens: SCREENS, ops: OPS, machineRefused: MACHINE_REFUSED, machineDrafts: MACHINE_DRAFTS };
const codes = (r) => r.refusals.map((x) => [x.code, x.step]);
const warns = (r) => r.warnings.map((x) => [x.code, x.step]);

test("R12 checkScript answers {refusals, warnings}, each naming its step and carrying its row: WIZARD_NO_STEPS, WIZARD_SCREEN_UNKNOWN, WIZARD_ACT_UNKNOWN, WIZARD_STEP_NO_WHY, WIZARD_DRAFT_REFUSED, WIZARD_STEP_CONCLUDES; a passing list answers none", () => {
  assert.deepEqual(wz.checkScript(STEPS, REG), { refusals: [], warnings: [] }, "negative control");
  assert.deepEqual(codes(wz.checkScript([], REG)), [["WIZARD_NO_STEPS", null]]);
  assert.deepEqual(codes(wz.checkScript([step("case-home", "casenote"), step("nowhere", null)], REG)), [["WIZARD_SCREEN_UNKNOWN", 2]]);
  assert.deepEqual(codes(wz.checkScript([step("case-home", "publish"), step("case-home", "nope")], REG)), [["WIZARD_ACT_UNKNOWN", 1], ["WIZARD_ACT_UNKNOWN", 2]],
                   "an op another screen lists is unknown on this one");
  assert.deepEqual(codes(wz.checkScript([step("case-home", "casenote")], { ...REG, ops: ["casejoin"] })), [["WIZARD_ACT_UNKNOWN", 1]], "not in the member op table");
  assert.deepEqual(codes(wz.checkScript([step("case-home", null), step("case-home", "casenote")], REG)), [], "no act is allowed");
  assert.deepEqual(codes(wz.checkScript([step("case-home", "casenote", { why: "" }), step("case-home", "casenote", { what: " " })], REG)),
                   [["WIZARD_STEP_NO_WHY", 1], ["WIZARD_STEP_NO_WHY", 2]]);
  const drafts = [{ text: "" }, { file: "x" }, { machine: "notregistered" }, { template: "TPL-2026-0000" }, { text: "a", template: "b" }, "words"];
  for (const d of drafts)
    assert.deepEqual(codes(wz.checkScript([step("case-home", "casenote", { draft: d }), STEPS[1]], { ...REG, templateOffered: (t) => t === OFFERED_TEMPLATE })),
                     [["WIZARD_DRAFT_REFUSED", 1]], JSON.stringify(d));
  for (const d of [{ text: "Our words" }, { template: OFFERED_TEMPLATE }, { machine: "whatchangedpropose" }])
    assert.deepEqual(codes(wz.checkScript([step("case-home", "casenote", { draft: d }), STEPS[1]], { ...REG, templateOffered: (t) => t === OFFERED_TEMPLATE })), [], JSON.stringify(d));
  const r = wz.checkScript([step("case-home", "casenote"), step("nowhere", null)], REG).refusals[0];
  assert.deepEqual([r.check, r.translation, typeof r.detail], [row("WIZARD_SCREEN_UNKNOWN").check, row("WIZARD_SCREEN_UNKNOWN").translation, "string"]);
  /* never throws on a list, whatever it holds; never writes (it is pure) */
  for (const odd of [[null], [1, "x"], [{}], [{ screen: 3, act: {}, what: 5 }], "x", null, undefined, {}])
    assert.doesNotThrow(() => wz.checkScript(odd, REG));
  assert.deepEqual(codes(wz.checkScript(null, REG)), [["WIZARD_NO_STEPS", null]]);
  /* with nothing registered every screen is unknown */
  assert.deepEqual(codes(wz.checkScript(STEPS, {})), [["WIZARD_SCREEN_UNKNOWN", 1], ["WIZARD_SCREEN_UNKNOWN", 2]]);
});

test("R12 WIZARD_STEP_CONCLUDES: a draft of the script's own words or a template on an act a machine is refused is refused; a registered labelled machine draft (DEC-101's what changed) is allowed; an act no machine is refused takes any draft", () => {
  const on = (act, d, screen = "publish") => codes(wz.checkScript([step(screen, act, { draft: d }), STEPS[0]], { ...REG, templateOffered: () => true }));
  assert.deepEqual(on("publish", { text: "We find the council in breach" }), [["WIZARD_STEP_CONCLUDES", 1]]);
  assert.deepEqual(on("publish", { template: OFFERED_TEMPLATE }), [["WIZARD_STEP_CONCLUDES", 1]]);
  assert.deepEqual(on("filingapprove", { text: "x" }, "filing-draft"), [["WIZARD_STEP_CONCLUDES", 1]]);
  assert.deepEqual(on("publish", { machine: "whatchangedpropose" }), []);
  assert.deepEqual(on("publish", { machine: "notregistered" }), [["WIZARD_DRAFT_REFUSED", 1], ["WIZARD_STEP_CONCLUDES", 1]]);
  assert.deepEqual(on("filingsave", { text: "x" }, "filing-draft"), [], "an act no machine is refused");
  assert.deepEqual(on("publish", undefined), [], "no draft, no conclusion");
});

test("R12 warnings: WIZARD_TRIVIAL (one step) and WIZARD_DUPLICATE (the same (screen, act) list as an offered script), which refuse nothing", () => {
  const one = wz.checkScript([STEPS[0]], REG);
  assert.deepEqual([codes(one), warns(one)], [[], [["WIZARD_TRIVIAL", null]]]);
  const dup = wz.checkScript(STEPS.map((s) => ({ ...s, what: "Other words" })), { ...REG, offered: [{ id: "WIZ-x", steps: STEPS }] });
  assert.deepEqual([codes(dup), warns(dup), dup.warnings[0].script], [[], [["WIZARD_DUPLICATE", null]], "WIZ-x"]);
  assert.deepEqual(warns(wz.checkScript([STEPS[1], STEPS[0]], { ...REG, offered: [{ id: "WIZ-x", steps: STEPS }] })), [], "order matters");
  /* submit carries the warnings and passes */
  const w = seeded();
  const a = approved(w);
  const d = w.wz.wizardDraft({ project: w.P, name: "Copy", recorded: STEPS.map((s) => ({ screen: s.screen, act: s.act })), author: A, viewer: A });
  w.wz.wizardRevise({ version: d.version, steps: STEPS, author: A, viewer: A });
  const s = w.wz.wizardSubmit({ version: d.version, author: A, viewer: A });
  assert.deepEqual([s.ok, s.warnings.map((x) => [x.code, x.script])], [true, [["WIZARD_DUPLICATE", a.script]]]);
});

test("R12 op=wizardcheck serves checkScript to any credential, ai included, against the registration (a {template} as filing-templates offers it to the caller); never writes", () => {
  const w = seeded();
  const before = w.snapshot();
  const steps = [step("case-home", "casenote", { draft: { template: OFFERED_TEMPLATE } }), step("publish", "publish", { draft: { text: "x" } })];
  for (const viewer of [MACHINE, F, "admin"]) {
    const url = new URL(`https://x/?op=wizardcheck&viewer=${encodeURIComponent(viewer)}`);
    const r = wz.wizardScriptsOps(w.wz, url, { steps }).wizardcheck();
    assert.deepEqual([r.ok, codes(r)], [true, [["WIZARD_STEP_CONCLUDES", 2]]], viewer);
  }
  assert.deepEqual(codes(w.wz.wizardCheck({ steps: [step("case-home", "casenote", { draft: { template: "TPL-2026-0000" } })], viewer: F })),
                   [["WIZARD_DRAFT_REFUSED", 1]], "a template filing-templates does not offer");
  assert.deepEqual(w.snapshot(), before);
});

test("R13 wizardRegister once per construction; a second is WIZARD_ALREADY_REGISTERED; registeredScreens answers the registry ([] before)", () => {
  const w = seeded({ register: false });
  assert.deepEqual(w.wz.registeredScreens(), []);
  assert.deepEqual(w.wz.wizardsAt({ screen: "case-home", viewer: F }).scripts, [], "with none made every screen is unknown");
  const r = w.wz.wizardRegister(registration());
  assert.deepEqual([r.ok, r.screens, r.library, r.broken, r.returned], [true, 3, 2, [], []]);
  assert.deepEqual(w.wz.registeredScreens(), SCREENS.map((s) => ({ id: s.id, acts: [...s.acts] })));
  refused(w.wz.wizardRegister(registration({ screens: [] })), "WIZARD_ALREADY_REGISTERED");
  assert.equal(w.wz.registeredScreens().length, 3, "the first stands");
});

test("R13 a group script that stops matching the screens is broken at registration: withheld from wizardsAt, recorded with its first refusal and instant; it returns when the screen comes back; brokenScripts lists each break and return", () => {
  const w = seeded();
  const a = approved(w);
  const b = approved(w, { name: "Only case home", steps: [step("case-home", "casenote"), step("case-home", "casejoin")] });
  w.clock.now = "2026-10-05T00:00:00Z";
  const gone = restart(w, { screens: SCREENS.filter((s) => s.id !== "filing-draft") });
  assert.deepEqual([gone.registered.broken, gone.registered.returned], [[a.version], []]);
  assert.ok(!gone.wizardsAt({ screen: "case-home", viewer: F }).scripts.some((s) => s.id === a.script), "withheld");
  assert.ok(gone.wizardsAt({ screen: "case-home", viewer: F }).scripts.some((s) => s.id === b.script), "another still offered");
  assert.equal(gone.wizardRead({ version: a.version, viewer: A }).version.broken, true);
  assert.deepEqual(gone.wizards({ state: "broken", viewer: A }).scripts.map((s) => s.id), [a.script]);
  /* still broken at the next start: not recorded twice */
  w.clock.now = "2026-10-06T00:00:00Z";
  assert.deepEqual(restart(w, { screens: SCREENS.filter((s) => s.id !== "filing-draft") }).registered.broken, []);
  /* the screen comes back */
  w.clock.now = "2026-10-07T00:00:00Z";
  const back = restart(w);
  assert.deepEqual(back.registered.returned, [a.version]);
  assert.ok(back.wizardsAt({ screen: "case-home", viewer: F }).scripts.some((s) => s.id === a.script));
  const l = back.brokenScripts({ viewer: MACHINE });
  assert.deepEqual(l.entries, [
    { script: a.script, version: 1, kind: "withdrawn", at: "2026-10-05T00:00:00Z", name: "Note and save", project: w.P, author: "frank",
      refusal: { code: "WIZARD_SCREEN_UNKNOWN", check: row("WIZARD_SCREEN_UNKNOWN").check, translation: row("WIZARD_SCREEN_UNKNOWN").translation } },
    { script: a.script, version: 1, kind: "restored", at: "2026-10-07T00:00:00Z", name: "Note and save", project: w.P, author: "frank", refusal: null }]);
  assert.deepEqual([l.ok, l.truncated, l.cursor], [true, false, null]);
  const p1 = back.brokenScripts({ limit: 1, viewer: MACHINE });
  assert.deepEqual([p1.entries.map((e) => e.kind), p1.truncated], [["withdrawn"], true]);
  assert.deepEqual(back.brokenScripts({ after: p1.cursor, viewer: MACHINE }).entries.map((e) => e.kind), ["restored"]);
  assert.deepEqual(back.brokenScripts({ viewer: D }).entries, [], "a viewer who cannot see P sees none");
  /* writes nothing but the break log */
  const tables = ["wiz_scripts", "wiz_versions", "wiz_revisions", "wiz_events", "wiz_proposals", "wiz_tallies"];
  const before = Object.fromEntries(tables.map((t) => [t, w.count(t)]));
  restart(w, { screens: [] });
  assert.deepEqual(Object.fromEntries(tables.map((t) => [t, w.count(t)])), before);
  /* a script whose template is no longer offered breaks too (filing-templates' R25 as its author sees it) */
  const w2 = seeded();
  const t = approved(w2, { name: "Template", steps: [step("case-home", "casenote", { draft: { template: OFFERED_TEMPLATE } }), STEPS[1]] });
  w2.record.setSetting("jurisdiction_profiles", ["none-held"], "test");
  assert.deepEqual(restart(w2).registered.broken, [t.version]);
  assert.deepEqual(w2.wz.brokenScripts({ viewer: MACHINE }).entries[0].refusal.code, "WIZARD_DRAFT_REFUSED");
});

test("R14 requiredFailures answers each required Civicsmith script R12 refuses, with its first refusal; [] when every one passes; an optional one is not named", () => {
  assert.deepEqual(wz.requiredFailures(registration()), []);
  const lib = [...LIBRARY, { id: "WIZ-2026-9003", name: "Broken optional", required: false, version: 1, steps: [step("nowhere", null)] },
               { id: "WIZ-2026-9004", name: "Broken required", required: true, version: 3, steps: [step("case-home", "casenote"), step("nowhere", null)] }];
  const f = wz.requiredFailures(registration({ library: lib }));
  assert.deepEqual(f.map((x) => [x.id, x.version, x.refusal.code, x.refusal.step]), [["WIZ-2026-9004", "WIZ-2026-9004@3", "WIZARD_SCREEN_UNKNOWN", 2]]);
  /* a required flow fails when its screen leaves the registry */
  const r = wz.requiredFailures(registration({ screens: SCREENS.filter((s) => s.id !== "case-home") }));
  assert.deepEqual(r.map((x) => [x.id, x.refusal.code, x.refusal.step]), [[LIBRARY[0].id, "WIZARD_SCREEN_UNKNOWN", 1]]);
  assert.deepEqual(wz.CIVICSMITH_LIBRARY, []);
  assert.ok(Object.isFrozen(wz.CIVICSMITH_LIBRARY));
  assert.deepEqual(wz.requiredFailures(registration({ library: wz.CIVICSMITH_LIBRARY })), []);
});
