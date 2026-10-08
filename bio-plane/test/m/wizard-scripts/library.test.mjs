/* wizard-scripts: the carried data, the screen registry (R13) and the first Civicsmith library (R22), the required flows'
   release check over them (R14) and the home's "Start from…" (R23), at the module's interface. The design files are
   vendored under `source/` as they stand at the commit the job's START names; the tests hold the carried data equal
   to them, screen by screen, act by act, script by script and step by step. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { seeded, approved, draft, world, registration, V, MACHINE, STEPS, step, SCREENS, OPS, MACHINE_REFUSED, MACHINE_DRAFTS, LIBRARY } from "./fixture.mjs";
import * as wz from "../../../src/wizard-scripts/index.mjs";

const A = V("alice"), F = V("frank"), E = V("erin"), D = V("dave");
const src = (f) => readFileSync(new URL(`./source/${f}`, import.meta.url), "utf8");
const REG_FILE = JSON.parse(src("registry.json")), LIB_FILE = JSON.parse(src("library.json"));
/* PR #14's library, from which BOB adopted version 2 of four scripts (R22; K2241). */
const LIB_NEW = JSON.parse(src("library-e08cd35ecb.json"));
const ADOPTED = ["Set up and claim", "Publication ceremony", "Check a claim", "Follow a proceeding"];
const OWED = /^owed:([a-z][a-z0-9]*)(?:\s+(DEC-\d+|K\d+))?$/;   /* a ruling owes it: a DEC or a K (PR #13) */
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
  assert.deepEqual(wz.SCREEN_REGISTRY_SOURCE, { commit: "e08cd35ecb", path: "docs/development/ux-substrate/screens/registry.json", sha256: sha });
  assert.equal(wz.SCREEN_REGISTRY.length, REG_FILE.screens.length);
  assert.equal(wz.SCREEN_REGISTRY.length, 47);
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

test("R13 (T37; K2171) the registry is re-taken from PR #14's merge to main (e08cd35ecb), its commit named as the source: connect is still \"The assistant\", setup no longer offers assistantset, and the library keeps its own commit (R22): each file names its own", () => {
  assert.equal(wz.SCREEN_REGISTRY_SOURCE.commit, "e08cd35ecb");
  assert.deepEqual(REG_FILE.screens.find((f) => f.id === "connect").name, "The assistant", "the vendored file is PR #14's");
  const setup = wz.SCREEN_REGISTRY.find((s) => s.id === "setup");
  assert.ok(!setup.acts.includes("assistantset") && !REG_FILE.screens.find((f) => f.id === "setup").acts.some((a) => a.op === "assistantset"),
            "PR #14 drops assistantset (DEC-182 (3))");
  assert.deepEqual(wz.SCREEN_REGISTRY.find((s) => s.id === "proceeding").acts[0], "entitycreate", "DEC-182 (1): registerproceeding re-pointed");
  const connect = wz.SCREEN_REGISTRY.find((s) => s.id === "connect");
  assert.equal(connect.name, "The assistant");
  const w = seeded({ register: false });
  w.wz.wizardRegister({ library: [] });
  assert.deepEqual(w.wz.registeredScreens().find((s) => s.id === "connect").acts, [...connect.acts], "registered by default");
  assert.ok(!JSON.stringify(wz.SCREEN_REGISTRY).includes("The assistant and your account"), "the old name is gone");
  assert.equal(wz.CIVICSMITH_LIBRARY_SOURCE.commit, "d129238bf3", "the library is not re-taken (R22)");
});

test("R13 a registration without screens registers SCREEN_REGISTRY; an owed act is registered as its op, in the file's order, only once the member op table declares it; with no op table none is", () => {
  const w = seeded({ register: false });
  const r = w.wz.wizardRegister({ ops: ALL_OPS.filter((o) => o !== "memberlanguageset"), library: [] });
  assert.deepEqual([r.ok, r.screens], [true, 47]);
  const by = Object.fromEntries(w.wz.registeredScreens().map((s) => [s.id, s.acts]));
  assert.deepEqual(by.join, ["invitelook", "enroll"], "memberlanguageset undeclared: not registered");
  assert.deepEqual(by.home, ["promote", "startfrom"], "startfrom declared: registered at its place");
  assert.deepEqual(by.ceremony, ["publishpreflight", "publishtensions", "caseratify", "publish", "publishat", "obscuremark"]);
  assert.deepEqual(by.setup.slice(5, 9), ["entitycreate", "placewanted", "aikeepaway", "groupkeyset"], "an owed act between two declared ones keeps its place");
  assert.deepEqual(by.security, ["securitymap", "securitytooladd", "securitytooltest", "securitytoolremove"], "an act a K ruling owes, as one a DEC owes");
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
  assert.deepEqual([by2.home, by2.translations], [["promote"], []]);
  assert.deepEqual(w2.wz.registeredScreens().map((s) => s.acts), wz.SCREEN_REGISTRY.map((s) => [...s.acts]));
  /* and a registered owed act is checked as any act is */
  assert.deepEqual(wz.checkScript([step("home", "startfrom")], real()).refusals, []);
  assert.deepEqual(wz.checkScript([step("home", "startfrom")], real({ ops: ALL_OPS.filter((o) => o !== "startfrom") })).refusals.map((x) => x.code),
                   ["WIZARD_ACT_UNKNOWN"]);
});

test("R13 (T37; N776) with an op table registered, a declared or function act whose op the table lacks is not registered, as an owed act whose op is undeclared is not: registeredScreens, the registry form, wizardsAt and op=wizardcheck answer one registry, every listed act passing R12 and every unlisted one refused; with no op table every declared and function act stays registered", () => {
  const lacking = ["groupkeyswitch", "knock", "calculationcreate"];   /* declared on setup, function on doorbell, declared on finder */
  const ops = ALL_OPS.filter((o) => !lacking.includes(o));
  const w = world({ register: false });
  w.member("frank");
  w.wz.wizardRegister({ ops, library: [] });
  const by = Object.fromEntries(w.wz.registeredScreens().map((s) => [s.id, s.acts]));
  assert.ok(!by.setup.includes("groupkeyswitch") && by.setup.includes("groupkeyset"), "the declared act the table lacks, gone; its neighbour kept");
  assert.deepEqual(by.doorbell, [], "a function act the table lacks");
  assert.ok(!by.finder.includes("calculationcreate"));
  for (const f of REG_FILE.screens) {
    const want = f.acts.map((a) => (a.status === "owed" ? OWED.exec(a.op)[1] : a.op)).filter((op) => ops.includes(op));
    assert.deepEqual(by[f.id], want, `${f.id}: the file's acts the table holds, in the file's order`);
  }
  assert.deepEqual(w.wz.wizardRegistry({ viewer: F }).screens.map((s) => [s.id, s.acts]), w.wz.registeredScreens().map((s) => [s.id, s.acts]));
  /* one registry: every registered act passes R12 through op=wizardcheck, every act the file lists and the table lacks is refused */
  const check = (screen, act) => wz.wizardScriptsOps(w.wz, new URL(`https://x/?viewer=${encodeURIComponent(F)}`), { steps: [step(screen, act), step(screen, null)] })
    .wizardcheck().refusals.map((x) => x.code);
  for (const sc of w.wz.registeredScreens()) for (const act of sc.acts) assert.deepEqual(check(sc.id, act), [], `${sc.id}/${act}`);
  for (const [screen, act] of [["setup", "groupkeyswitch"], ["doorbell", "knock"], ["finder", "calculationcreate"]])
    assert.deepEqual(check(screen, act), ["WIZARD_ACT_UNKNOWN"], `${screen}/${act}`);
  /* wizardsAt offers no script on an act the registry does not list: a group's draft naming one is refused at submit */
  assert.deepEqual(w.wz.wizardsAt({ screen: "doorbell", viewer: F }).scripts, []);
  /* negative control: with no op table every declared and function act is registered */
  const w0 = world({ register: false });
  w0.wz.wizardRegister({ library: [] });
  const by0 = Object.fromEntries(w0.wz.registeredScreens().map((s) => [s.id, s.acts]));
  assert.ok(by0.setup.includes("groupkeyswitch") && by0.doorbell.includes("knock") && by0.finder.includes("calculationcreate"));
  /* the test registry too: an op table lacking an act a screen lists */
  const t = seeded({ register: false });
  t.wz.wizardRegister(registration({ ops: OPS.filter((o) => o !== "casejoin") }));
  assert.deepEqual(t.wz.registeredScreens().find((s) => s.id === "case-home").acts, ["casenote"]);
  assert.deepEqual(t.wz.wizardCheck({ steps: [step("case-home", "casejoin"), STEPS[0]], viewer: F }).refusals.map((x) => [x.code, x.step]), [["WIZARD_ACT_UNKNOWN", 1]]);
});

test("R22 CIVICSMITH_LIBRARY is the seventeen scripts of library.json, in its order, each with the file's id, name, start and steps (screen, act, what, why, draft), a side trip as the named script's id and an owed act as its op: version 1 from d129238bf3, and for the four scripts BOB adopted (K2241) version 2 from e08cd35ecb, version 1 kept in earlier; the file's notes not carried", () => {
  const sha = (f) => createHash("sha256").update(src(f), "utf8").digest("hex");
  assert.deepEqual(wz.CIVICSMITH_LIBRARY_SOURCE, { commit: "d129238bf3", path: "docs/development/ux-substrate/screens/library.json", sha256: sha("library.json") });
  assert.deepEqual(wz.CIVICSMITH_LIBRARY_ADOPTED_SOURCE, { commit: "e08cd35ecb", path: "docs/development/ux-substrate/screens/library.json", sha256: sha("library-e08cd35ecb.json") });
  const lib = wz.CIVICSMITH_LIBRARY;
  assert.equal(lib.length, 17);
  assert.deepEqual(lib.map((e) => e.id), LIB_FILE.scripts.map((s) => s.id));
  const carried = (file, f) => {
    const idOf = Object.fromEntries(file.scripts.map((s) => [s.name, s.id]));
    const v = f.versions[f.versions.length - 1].steps;
    return v.map((t) => {
      const m = typeof t.act === "string" ? OWED.exec(t.act) : null;
      return { screen: t.screen, act: m ? m[1] : t.act, what: t.what, why: t.why, ...(t.draft ? { draft: t.draft } : {}), ...(t.via ? { via: idOf[t.via] } : {}) };
    });
  };
  LIB_FILE.scripts.forEach((f, i) => {
    const e = lib[i];
    const g = LIB_NEW.scripts.find((x) => x.id === f.id);
    assert.deepEqual([e.id, e.name, e.start], [g.id, g.name, g.start], f.name);
    if (ADOPTED.includes(f.name)) {
      assert.deepEqual([e.version, e.source], [2, "e08cd35ecb"], f.name);
      assert.deepEqual(e.steps, carried(LIB_NEW, g), `${f.name}: version 2 is e08cd35ecb's steps, step by step`);
      assert.deepEqual(e.earlier, [{ version: 1, steps: carried(LIB_FILE, f), author: "civicsmith", approved: { by: "Bob", at: "2026-10-06" }, source: "d129238bf3" }],
                       `${f.name}: version 1 kept whole`);
      assert.notDeepEqual(e.steps, e.earlier[0].steps, `${f.name}: the versions differ`);
    } else {
      assert.deepEqual([e.version, e.source, "earlier" in e], [1, "d129238bf3", false], f.name);
      assert.deepEqual(e.steps, carried(LIB_FILE, f), `${f.name}: version 1, step by step`);
      assert.deepEqual(carried(LIB_NEW, g), e.steps, `${f.name}: the same at e08cd35ecb, so nothing newer is left out`);
    }
    for (const k of ["note", "journeys", "versions"]) assert.equal(k in e, false, `${f.name}: ${k} not carried`);
  });
  /* the side trips and the owed acts, named */
  const vias = lib.flatMap((e) => e.steps.filter((s) => s.via).map((s) => [e.name, lib.find((x) => x.id === s.via).name]));
  assert.deepEqual(vias, [["Set up and claim", "Say who your group is"], ["Welcome a new member", "Connect your Claude account"],
                          ["Welcome a new member", "Your ties"], ["Check a claim", "Get a record"]]);
  const owed = lib.flatMap((e) => e.steps.map((s) => s.act)).filter((a) => OWED_OPS.includes(a));
  assert.deepEqual([...new Set(owed)].sort(), ["aikeepaway", "memberlanguageset", "obscuremark", "publishat", "startfrom", "subscriptionsignin",
                                               "translationadopt", "translationconfirm", "translationdraft"]);
  assert.ok(!JSON.stringify(lib).includes("owed:"), "no owed: prefix is carried");
  assert.ok(Object.isFrozen(lib) && Object.isFrozen(lib[0]) && Object.isFrozen(lib[0].steps[0]));
});

test("R22 each library script is origin civicsmith, scope group, authored by the Civicsmith library: version 1 approved by Bob on 2026-10-06, and for the four K2241 names version 2 approved, adopted by BOB on 2026-10-08 under K2241; exactly the three DEC-148 names are required; read so by every member", () => {
  const lib = wz.CIVICSMITH_LIBRARY;
  for (const e of lib) {
    const want = ADOPTED.includes(e.name) ? [2, { by: "BOB", at: "2026-10-08", ruling: "K2241" }] : [1, { by: "Bob", at: "2026-10-06" }];
    assert.deepEqual([e.origin, e.scope, e.author, e.version, e.approved], ["civicsmith", "group", "civicsmith", ...want], e.name);
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

test("R22 every write on a library script, either version, is refused WIZARD_NOT_THE_GROUPS (R9), and R14 is run on them: with every op the registry names declared, no required flow fails and every script passes R12", () => {
  const w = seeded({ register: false });
  w.wz.wizardRegister({ ops: ALL_OPS });
  for (const e of [wz.CIVICSMITH_LIBRARY[1], wz.CIVICSMITH_LIBRARY.find((x) => x.name === "Set up and claim")])
    for (const v of [`${e.id}@1`, `${e.id}@${e.version}`]) {
      refused(w.wz.wizardDraft({ from: v, author: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
      refused(w.wz.wizardRevise({ version: v, steps: STEPS, author: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
      refused(w.wz.wizardSubmit({ version: v, author: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
      refused(w.wz.wizardApprove({ version: v, by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
      refused(w.wz.wizardApprove({ version: v, widen: true, by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
      refused(w.wz.wizardRetire({ version: v, reason: "r", by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
    }
  const e = wz.CIVICSMITH_LIBRARY[1];
  refused(w.wz.wizardPropose({ script: e.id, steps: STEPS, why: "w", proposer: F, viewer: F }), "WIZARD_NOT_THE_GROUPS");
  refused(w.wz.wizardRetire({ script: e.id, reason: "r", by: E, viewer: E }), "WIZARD_NOT_THE_GROUPS");
  assert.deepEqual(wz.requiredFailures(real()), [], "red 7 clears: Set up and claim's version 2 walks aikeepaway and groupkeyset");
  const offered = wz.CIVICSMITH_LIBRARY.map((x) => ({ id: x.id, steps: x.steps }));
  for (const x of wz.CIVICSMITH_LIBRARY) assert.deepEqual(wz.checkScript(x.steps, { ...real(), offered, self: x.id }).refusals, [], x.name);
  /* version 1 of Set up and claim would fail (negative control): R14 is judged on the version offered */
  const setup = wz.CIVICSMITH_LIBRARY.find((x) => x.name === "Set up and claim");
  assert.deepEqual(wz.checkScript(setup.earlier[0].steps, { ...real(), offered, self: setup.id }).refusals.map((f) => [f.code, f.step]), [["WIZARD_ACT_UNKNOWN", 11]]);
});

test("R22 (T37; K2241) the four adopted scripts carry version 2 in place of version 1: \"Set up and claim\" on aikeepaway then groupkeyset, no assistantset; \"Publication ceremony\" with its Photos step on obscuremark; \"Check a claim\" with DEC-178's wording; \"Follow a proceeding\" on entitycreate; each keeps its id, name, required and start, its version 1 updated, naming version 2, readable and not offered", () => {
  const by = (n) => wz.CIVICSMITH_LIBRARY.find((e) => e.name === n);
  const acts = (n) => by(n).steps.map((t) => t.act);
  const setup = acts("Set up and claim");
  assert.ok(!setup.includes("assistantset") && setup.indexOf("aikeepaway") >= 0 && setup.indexOf("groupkeyset") === setup.indexOf("aikeepaway") + 1, setup.join());
  assert.ok(acts("Publication ceremony").includes("obscuremark"));
  assert.ok(acts("Follow a proceeding").includes("entitycreate") && !acts("Follow a proceeding").includes("registerproceeding"));
  assert.notDeepEqual(by("Check a claim").steps.map((t) => [t.what, t.why]), by("Check a claim").earlier[0].steps.map((t) => [t.what, t.why]), "the wording changed");
  for (const n of ADOPTED) {
    const f = LIB_FILE.scripts.find((x) => x.name === n);
    assert.deepEqual([by(n).id, by(n).required, by(n).start], [f.id, ["Set up and claim", "Publication ceremony"].includes(n), f.start], n);
  }
  const w = world({ register: false });
  w.member("frank");
  w.member("erin", { role: "admin" });
  w.wz.wizardRegister({ ops: ALL_OPS });
  for (const e of wz.CIVICSMITH_LIBRARY) {
    const r = w.wz.wizardRead({ script: e.id, viewer: F });
    assert.deepEqual([r.version.id, r.version.state, r.version.updated_by, r.offered], [`${e.id}@${e.version}`, "approved", null, true], e.name);
    if (!e.earlier) { assert.equal(w.wz.wizardRead({ script: e.id, version: `${e.id}@2`, viewer: F }).reason, "NO_SUCH_WIZARD", e.name); continue; }
    const one = w.wz.wizardRead({ script: e.id, version: `${e.id}@1`, viewer: F });
    assert.deepEqual([one.ok, one.version.state, one.version.updated_by, one.offered, one.version.approved],
                     [true, "updated", `${e.id}@2`, false, { by: { name: "Bob" }, at: "2026-10-06" }], `${e.name}: version 1 readable, updated`);
    assert.deepEqual(one.version.steps, e.earlier[0].steps);
    assert.deepEqual(r.version.approved, { by: { name: "BOB" }, at: "2026-10-08", ruling: "K2241" });
    const at = w.wz.wizardsAt({ screen: e.start, viewer: F }).scripts.filter((s) => s.id === e.id).map((s) => s.version);
    assert.deepEqual(at, [`${e.id}@2`], `${e.name}: only version 2 offered`);
    const listed = w.wz.wizards({ viewer: V("erin") }).scripts.find((s) => s.id === e.id);
    assert.deepEqual(listed.versions.map((v) => [v.id, v.state]), [[`${e.id}@2`, "approved"]], `${e.name}: the offered version listed (R10)`);
  }
});

test("R14 over the real library: while an owed act its required flows walk is undeclared, requiredFailures names the flow with its first refusal; an optional flow is never named", () => {
  const without = (ops) => wz.requiredFailures(real({ ops: ALL_OPS.filter((o) => !ops.includes(o)) }))
    .map((f) => [f.name, f.refusal.code, f.refusal.step, f.version]);
  const id = (name) => wz.CIVICSMITH_LIBRARY.find((e) => e.name === name).id;
  assert.deepEqual(without(["memberlanguageset", "publishat"]), [
    ["Welcome a new member", "WIZARD_ACT_UNKNOWN", 1, `${id("Welcome a new member")}@1`],
    ["Publication ceremony", "WIZARD_ACT_UNKNOWN", 11, `${id("Publication ceremony")}@2`]], "version 2, the one offered (K2241)");
  assert.deepEqual(without(["startfrom"]), [["Welcome a new member", "WIZARD_ACT_UNKNOWN", 7, `${id("Welcome a new member")}@1`]]);
  assert.deepEqual(without(["translationdraft", "translationadopt", "translationconfirm", "subscriptionsignin"]), [], "owed acts of optional flows block nothing");
  assert.deepEqual(wz.requiredFailures(real({ ops: ALL_OPS.filter((o) => o !== "claim") })).map((f) => [f.name, f.refusal.step]), [["Set up and claim", 5]],
                   "its first refusal named: step 5's claim, before step 11");
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
  assert.deepEqual(w2.wz.startFrom({ viewer: F }).scripts.map((s) => s.name),
                   wz.CIVICSMITH_LIBRARY.filter((e) => !e.required).map((e) => e.name), "every optional script, Follow a proceeding's version 2 included");
});

test("R11 (K1883) a library script that fails R12 against the registration is not offered until it passes, as R13 withholds a group's: absent from wizardsAt, the registry form, startFrom and the offered reads; a passing one offered; the library data unchanged", () => {
  const name = (n) => wz.CIVICSMITH_LIBRARY.find((e) => e.name === n);
  const reg = (ops) => { const w = world({ register: false }); w.member("frank"); w.member("erin", { role: "admin" }); w.wz.wizardRegister({ ops }); return w; };
  const missing = ["subscriptionsignin", "translationdraft", "translationadopt", "translationconfirm"];
  const w = reg(ALL_OPS.filter((o) => !missing.includes(o)));
  const connect = name("Connect your Claude account"), translate = name("Translate the interface"), ties = name("Your ties");
  for (const [e, screen] of [[connect, "connect"], [translate, "translations"]]) {
    assert.ok(!w.wz.wizardsAt({ screen, viewer: F }).scripts.some((s) => s.id === e.id), `${e.name} withheld`);
    assert.equal(w.wz.wizardRead({ script: e.id, viewer: F }).offered, false, "still readable, not offered");
    assert.ok(!w.wz.wizardRegistry({ viewer: F }).screens.some((sc) => sc.scripts.some((x) => x.id === e.id)), "not in the registry form");
    assert.ok(!w.wz.startFrom({ viewer: F }).scripts.some((s) => s.id === e.id));
    assert.ok(!w.wz.wizards({ viewer: E }).scripts.some((s) => s.id === e.id), "not among the offered versions");
  }
  assert.ok(w.wz.wizardsAt({ screen: "ties", viewer: F }).scripts.some((s) => s.id === ties.id), "a passing one is offered");
  /* a required flow is judged on its own steps: the welcome wizard stays offered though a script it visits is withheld */
  assert.ok(w.wz.wizardsAt({ screen: "join", viewer: F }).scripts.some((s) => s.name === "Welcome a new member"));
  /* the published scripts name only registered screens and acts (what skills R10 checks) */
  const screens = new Map(w.wz.registeredScreens().map((s) => [s.id, new Set(s.acts)]));
  for (const sc of w.wz.wizardRegistry({ viewer: F }).screens)
    for (const x of sc.scripts) for (const t of x.steps) assert.ok(screens.has(t.screen) && (t.act === null || screens.get(t.screen).has(t.act)), `${x.name}: ${t.screen}/${t.act}`);
  /* once the ops are declared, both are offered */
  const all = reg(ALL_OPS);
  assert.ok(all.wz.wizardsAt({ screen: "connect", viewer: F }).scripts.some((s) => s.id === connect.id));
  assert.ok(all.wz.wizardsAt({ screen: "translations", viewer: F }).scripts.some((s) => s.id === translate.id));
  /* a required flow failing on its own act is withheld too, and R14 names it */
  const nol = reg(ALL_OPS.filter((o) => o !== "memberlanguageset"));
  assert.ok(!nol.wz.wizardsAt({ screen: "join", viewer: F }).scripts.some((s) => s.name === "Welcome a new member"));
  assert.equal(wz.CIVICSMITH_LIBRARY.length, 17, "the data is untouched");
});
