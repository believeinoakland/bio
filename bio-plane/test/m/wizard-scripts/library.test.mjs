/* wizard-scripts: the carried data, the screen registry (R13) and the first Civicsmith library (R22), the required flows'
   release check over them (R14) and the home's "Start from…" (R23), at the module's interface. The design files are
   vendored under `source/` as they stand at the commit the job's START names; the tests hold the carried data equal
   to them, screen by screen, act by act, script by script and step by step. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { seeded, approved, draft, world, V, MACHINE, STEPS, step, SCREENS, OPS, MACHINE_REFUSED, MACHINE_DRAFTS, LIBRARY } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";

const A = V("alice"), F = V("frank"), E = V("erin"), D = V("dave");
const src = (f) => readFileSync(new URL(`./source/${f}`, import.meta.url), "utf8");
const REG_FILE = JSON.parse(src("registry.json")), LIB_FILE = JSON.parse(src("library.json"));
const OWED = /^owed:([a-z][a-z0-9]*)(?:\s+(DEC-\d+))?$/;
/* Every op the registry names, owed ones as their op: the member op table once each owed op is declared. */
const ALL_OPS = [...new Set(REG_FILE.screens.flatMap((s) => s.acts.map((a) => (a.status === "owed" ? OWED.exec(a.op)[1] : a.op))))];
const OWED_OPS = [...new Set(REG_FILE.screens.flatMap((s) => s.acts.filter((a) => a.status === "owed").map((a) => OWED.exec(a.op)[1])))];
const REFUSED = ["release", "conclude", "withdrawconclusion", "reopen", "publish"];
const real = (x = {}) => ({ screens: wz.SCREEN_REGISTRY, ops: ALL_OPS, machineRefused: REFUSED, machineDrafts: [...MACHINE_DRAFTS, "writinghelp", "groupdescriptiondraft"],
                            irreversible: ["publish", "publishat", "publishatmove"], library: wz.CIVICSMITH_LIBRARY, ...x });
const row = (c) => wz.WIZARD_SCRIPTS_CHECKS[c];
const refused = (r, c, why = "") => {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, c, c, row(c).check, row(c).translation], `${why} ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};

test("R13 SCREEN_REGISTRY is DEC-139's registry as the file holds it, screen by screen and act by act: [{id, name, purpose, acts}], acts the declared and function ops in the file's order, owed acts apart; frozen; its source the vendored file", () => {
  const sha = createHash("sha256").update(src("registry.json"), "utf8").digest("hex");
  assert.deepEqual(wz.SCREEN_REGISTRY_SOURCE, { commit: "d129238bf3", path: "docs/development/ux-substrate/screens/registry.json", sha256: sha });
  assert.equal(wz.SCREEN_REGISTRY.length, REG_FILE.screens.length);
  assert.equal(wz.SCREEN_REGISTRY.length, 42);
  REG_FILE.screens.forEach((f, i) => {
    const s = wz.SCREEN_REGISTRY[i];
    assert.deepEqual([s.id, s.name, s.purpose], [f.id, f.name, f.purpose], f.id);
    assert.deepEqual(s.acts, f.acts.filter((a) => a.status === "declared" || a.status === "function").map((a) => a.op), `${f.id} acts`);
    const owed = [];
    let before = 0;
    for (const a of f.acts) {
      if (a.status === "owed") { const m = OWED.exec(a.op); owed.push({ op: m[1], dec: m[2], at: before }); } else before++;
    }
    assert.deepEqual(s.owed, owed, `${f.id} owed`);
    for (const a of s.acts) assert.ok(!a.startsWith("owed:"), "an owed act names no op among acts");
  });
  assert.ok(Object.isFrozen(wz.SCREEN_REGISTRY) && Object.isFrozen(wz.SCREEN_REGISTRY[0]) && Object.isFrozen(wz.SCREEN_REGISTRY[0].acts));
});

test("R13 a registration without screens registers SCREEN_REGISTRY; an owed act is registered as its op, in the file's order, only once the member op table declares it; with no op table none is", () => {
  const w = seeded({ register: false });
  const r = w.wz.wizardRegister({ ops: ALL_OPS.filter((o) => o !== "memberlanguageset"), library: [] });
  assert.deepEqual([r.ok, r.screens], [true, 42]);
  const by = Object.fromEntries(w.wz.registeredScreens().map((s) => [s.id, s.acts]));
  assert.deepEqual(by.join, ["invitelook", "enroll"], "memberlanguageset undeclared: not registered");
  assert.deepEqual(by.home, ["projectcreated", "startfrom"], "startfrom declared: registered at its place");
  assert.deepEqual(by.ceremony, ["publishpreflight", "publishtensions", "caseratify", "publish", "publishat"]);
  assert.deepEqual(by.setup.slice(5, 8), ["entitycreate", "placewanted", "assistantset"], "an owed act between two declared ones keeps its place");
  assert.deepEqual(by.notes, ["notewrite", "noteturn", "noterevise", "notedelete", "writinghelp"]);
  assert.deepEqual(by.account, ["expertisedeclare", "setpassword", "signerregisterown", "signerrevokeown", "infolevelset"]);
  /* every registered act is the file's, in the file's order */
  for (const f of REG_FILE.screens) {
    const want = f.acts.map((a) => (a.status === "owed" ? OWED.exec(a.op)[1] : a.op)).filter((op) => op !== "memberlanguageset");
    assert.deepEqual(by[f.id], want, f.id);
  }
  /* no op table: owed acts stay unregistered (negative control) */
  const w2 = seeded({ register: false });
  w2.wz.wizardRegister({ library: [] });
  const by2 = Object.fromEntries(w2.wz.registeredScreens().map((s) => [s.id, s.acts]));
  assert.deepEqual([by2.home, by2.translations], [["projectcreated"], []]);
  assert.deepEqual(w2.wz.registeredScreens().map((s) => s.acts), wz.SCREEN_REGISTRY.map((s) => [...s.acts]));
  /* and a registered owed act is checked as any act is */
  assert.deepEqual(wz.checkScript([step("home", "startfrom")], real()).refusals, []);
  assert.deepEqual(wz.checkScript([step("home", "startfrom")], real({ ops: ALL_OPS.filter((o) => o !== "startfrom") })).refusals.map((x) => x.code),
                   ["WIZARD_ACT_UNKNOWN"]);
});

test("R22 CIVICSMITH_LIBRARY is the seventeen scripts of library.json at the named commit, in its order, each with the file's id, name, start and steps (screen, act, what, why, draft), a side trip as the named script's id and an owed act as its op; the file's notes not carried", () => {
  const sha = createHash("sha256").update(src("library.json"), "utf8").digest("hex");
  assert.deepEqual(wz.CIVICSMITH_LIBRARY_SOURCE, { commit: "d129238bf3", path: "docs/development/ux-substrate/screens/library.json", sha256: sha });
  const lib = wz.CIVICSMITH_LIBRARY;
  assert.equal(lib.length, 17);
  assert.deepEqual(lib.map((e) => e.id), LIB_FILE.scripts.map((s) => s.id));
  const idOf = Object.fromEntries(LIB_FILE.scripts.map((s) => [s.name, s.id]));
  LIB_FILE.scripts.forEach((f, i) => {
    const e = lib[i];
    assert.deepEqual([e.id, e.name, e.start], [f.id, f.name, f.start], f.name);
    const fs = f.versions.find((v) => v.version === 1).steps;
    assert.equal(e.steps.length, fs.length, `${f.name}: every step`);
    fs.forEach((t, k) => {
      const m = typeof t.act === "string" ? OWED.exec(t.act) : null;
      const want = { screen: t.screen, act: m ? m[1] : t.act, what: t.what, why: t.why, ...(t.draft ? { draft: t.draft } : {}), ...(t.via ? { via: idOf[t.via] } : {}) };
      assert.deepEqual(e.steps[k], want, `${f.name} step ${k + 1}`);
    });
    for (const k of ["note", "journeys", "versions"]) assert.equal(k in e, false, `${f.name}: ${k} not carried`);
  });
  /* the side trips and the owed acts, named */
  const vias = lib.flatMap((e) => e.steps.filter((s) => s.via).map((s) => [e.name, lib.find((x) => x.id === s.via).name]));
  assert.deepEqual(vias, [["Set up and claim", "Say who your group is"], ["Welcome a new member", "Connect your Claude account"],
                          ["Welcome a new member", "Your ties"], ["Check a claim", "Get a record"]]);
  const owed = lib.flatMap((e) => e.steps.map((s) => s.act)).filter((a) => OWED_OPS.includes(a));
  assert.deepEqual([...new Set(owed)].sort(), ["memberlanguageset", "publishat", "startfrom", "subscriptionsignin", "translationadopt",
                                               "translationconfirm", "translationdraft"]);
  assert.ok(!JSON.stringify(lib).includes("owed:"), "no owed: prefix is carried");
  assert.ok(Object.isFrozen(lib) && Object.isFrozen(lib[0]) && Object.isFrozen(lib[0].steps[0]));
});

test("R22 each library script is origin civicsmith, scope group, one version 1 approved by Bob on 2026-10-06 and authored by the Civicsmith library; exactly the three DEC-148 names are required; read so by every member", () => {
  const lib = wz.CIVICSMITH_LIBRARY;
  for (const e of lib) {
    assert.deepEqual([e.origin, e.scope, e.version, e.author, e.approved], ["civicsmith", "group", 1, "civicsmith", { by: "Bob", at: "2026-10-06" }], e.name);
  }
  assert.deepEqual(lib.filter((e) => e.required).map((e) => e.name), ["Set up and claim", "Welcome a new member", "Publication ceremony"]);
  assert.equal(lib.filter((e) => !e.required).length, 14);
  /* registered by default, read as R1 holds it */
  const w = seeded({ register: false });
  w.wz.wizardRegister({ ops: ALL_OPS });
  const welcome = lib.find((e) => e.name === "Welcome a new member");
  for (const viewer of [F, D, E]) {
    const r = w.wz.wizardRead({ script: welcome.id, viewer });
    assert.deepEqual([r.ok, r.script.origin, r.script.scope, r.script.required, r.script.based_on, r.script.start], [true, "civicsmith", "group", true, null, "join"]);
    assert.deepEqual([r.version.id, r.version.state, r.version.author, r.version.approved, r.offered],
                     [`${welcome.id}@1`, "approved", { name: "civicsmith" }, { by: { name: "Bob" }, at: "2026-10-06" }, true]);
    assert.deepEqual(r.version.steps, welcome.steps);
  }
  assert.equal(w.wz.wizardRead({ script: welcome.id, viewer: "nobody" }).reason, "NO_SUCH_WIZARD");
  /* the welcome wizard starts on join, the ceremony on ceremony (R11) */
  assert.ok(w.wz.wizardsAt({ screen: "join", viewer: F }).scripts.some((s) => s.id === welcome.id));
  assert.ok(w.wz.wizardsAt({ screen: "ceremony", viewer: D }).scripts.some((s) => s.name === "Publication ceremony"));
});

test("R22 every write on a library script is refused WIZARD_NOT_THE_GROUPS (R9), and R14 is run on them: with every op the registry names declared, no required flow fails and every script passes R12", () => {
  const w = seeded({ register: false });
  w.wz.wizardRegister({ ops: ALL_OPS });
  const e = wz.CIVICSMITH_LIBRARY[1], v = `${e.id}@1`;
  refused(w.wz.wizardDraft({ from: v, author: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardRevise({ version: v, steps: STEPS, author: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardPropose({ script: e.id, steps: STEPS, why: "w", proposer: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardSubmit({ version: v, author: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardApprove({ version: v, by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardApprove({ version: v, widen: true, by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardRetire({ script: e.id, reason: "r", by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardRetire({ version: v, reason: "r", by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
  assert.deepEqual(wz.requiredFailures(real()), []);
  const offered = wz.CIVICSMITH_LIBRARY.map((x) => ({ id: x.id, steps: x.steps }));
  for (const x of wz.CIVICSMITH_LIBRARY) assert.deepEqual(wz.checkScript(x.steps, { ...real(), offered, self: x.id }).refusals, [], x.name);
});

test("R14 over the real library: while an owed act its required flows walk is undeclared, requiredFailures names the flow with its first refusal; an optional flow is never named", () => {
  const without = (ops) => wz.requiredFailures(real({ ops: ALL_OPS.filter((o) => !ops.includes(o)) }))
    .map((f) => [f.name, f.refusal.code, f.refusal.step, f.version]);
  const id = (name) => wz.CIVICSMITH_LIBRARY.find((e) => e.name === name).id;
  assert.deepEqual(without(["memberlanguageset", "publishat"]), [
    ["Welcome a new member", "WIZARD_ACT_UNKNOWN", 1, `${id("Welcome a new member")}@1`],
    ["Publication ceremony", "WIZARD_ACT_UNKNOWN", 10, `${id("Publication ceremony")}@1`]]);
  assert.deepEqual(without(["startfrom"]), [["Welcome a new member", "WIZARD_ACT_UNKNOWN", 7, `${id("Welcome a new member")}@1`]]);
  assert.deepEqual(without(["translationdraft", "translationadopt", "translationconfirm", "subscriptionsignin"]), [], "owed acts of optional flows block nothing");
  assert.deepEqual(without(["claim"]).map((x) => x[0]), ["Set up and claim"]);
  /* the registration plane makes today (no screens of the new interface): every required flow is named */
  assert.deepEqual(wz.requiredFailures(real({ screens: [] })).map((f) => f.name), ["Set up and claim", "Welcome a new member", "Publication ceremony"]);
});

test("R23 startFrom answers the offered scripts this viewer may start, the library's that are not required and the group's own, each {id, version, name, start}, with doors [] until the design stream gives them; no AI and no key; starts nothing, writes nothing", () => {
  const w = seeded({ register: false });
  w.wz.wizardRegister({ screens: SCREENS, ops: OPS, machineRefused: MACHINE_REFUSED, machineDrafts: MACHINE_DRAFTS, library: LIBRARY });
  const a = approved(w, { name: "Ours" });
  const d = draft(w, { name: "A draft" });
  const before = w.snapshot();
  const r = w.wz.startFrom({ viewer: F });
  assert.deepEqual(r, { ok: true, doors: [], scripts: [
    { id: LIBRARY[1].id, version: `${LIBRARY[1].id}@1`, name: "Publish", start: "publish" },
    { id: a.script, version: a.version, name: "Ours", start: "case-home" }] });
  assert.ok(!r.scripts.some((s) => s.id === LIBRARY[0].id), "a required library script is not a first step");
  assert.ok(!r.scripts.some((s) => s.id === d.script), "a draft is not offered");
  assert.deepEqual(w.wz.startFrom({ viewer: D }).scripts.map((s) => s.id), [LIBRARY[1].id], "dave cannot see P");
  assert.deepEqual(w.wz.startFrom({ viewer: "nobody" }).scripts, []);
  assert.deepEqual(wz.FRONT_DOORS, []);
  assert.ok(Object.isFrozen(wz.FRONT_DOORS));
  /* through the op table, from a member's session alone */
  assert.deepEqual(wz.wizardScriptsOps(w.wz, new URL("https://x/?op=startfrom&viewer=member%3Afrank"), null).startfrom(), r);
  assert.deepEqual(w.snapshot(), before, "writes nothing, records no use");
  /* the real library: the fourteen optional scripts */
  const w2 = world({ register: false });
  w2.member("frank");
  w2.wz.wizardRegister({ ops: ALL_OPS });
  assert.deepEqual(w2.wz.startFrom({ viewer: F }).scripts.map((s) => s.name), wz.CIVICSMITH_LIBRARY.filter((e) => !e.required).map((e) => e.name));
});
