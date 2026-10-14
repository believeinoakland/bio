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
/* PR #14's library, from which BOB adopted version 2 of four scripts (T37), and PR #19's, of two more (T41) (R22; K2241). */
const LIB_NEW = JSON.parse(src("library-e08cd35ecb.json"));
const LIB_T41 = JSON.parse(src("library-3660c18803.json"));
/* PR #28's library (`3f40899950`, on main at T46's L11 START), from which BOB adopted Start and send's version 2 and
   added DEC-194 (5)'s five scripts (R30; K2241). */
const LIB_T46 = JSON.parse(src("library-3f40899950.json"));
/* T47: PR #31's library (`a0fab7abf0`, DEC-198, DEC-199), from which BOB adopted Connect's version 3 (R32) and whose doors
   are the front doors (R33); and PR #33's head as merged into tranche/T47 at L11's START (`f90b187c7b`), from which BOB
   adopted the newest Set up and claim and Publication ceremony (R36), its registry the snapshot's source (R35). */
const LIB_T47A = JSON.parse(src("library-a0fab7abf0.json"));
const LIB_T47 = JSON.parse(src("library-f90b187c7b.json"));
const ADOPTED_T37 = ["Set up and claim", "Publication ceremony", "Check a claim", "Follow a proceeding"];
const ADOPTED_T41 = ["Connect your Claude account", "Invite a member"];
const ADOPTED_T46 = ["Start and send"];
const ADOPTED = [...ADOPTED_T37, ...ADOPTED_T41, ...ADOPTED_T46];
const ADDED_T46 = ["Comment for the group", "Demand a correction", "Take an escalation to its next stage", "Refer it to an oversight body", "Pick up a plan"];
const T37 = { by: "BOB", at: "2026-10-08", ruling: "K2241" }, T41 = { by: "BOB", at: "2026-10-10", ruling: "K2241" };
const T46 = { by: "BOB", at: "2026-10-12", ruling: "K2241" }, T47 = { by: "BOB", at: "2026-10-14", ruling: "K2241" };
const V1 = { by: "Bob", at: "2026-10-06" };
/* each adopted script's versions after its version 1, oldest first: the version, the file and commit it comes from, and
   its adoption (R22, R30, R32, R36; K2241) */
const CHAINS = {
  "Set up and claim": [[2, LIB_NEW, "e08cd35ecb", T37], [3, LIB_T47, "f90b187c7b", T47]],
  "Publication ceremony": [[2, LIB_NEW, "e08cd35ecb", T37], [3, LIB_T47, "f90b187c7b", T47]],
  "Check a claim": [[2, LIB_NEW, "e08cd35ecb", T37]],
  "Follow a proceeding": [[2, LIB_NEW, "e08cd35ecb", T37]],
  "Connect your Claude account": [[2, LIB_T41, "3660c18803", T41], [3, LIB_T47A, "a0fab7abf0", T47]],
  "Invite a member": [[2, LIB_T41, "3660c18803", T41]],
  "Start and send": [[2, LIB_T46, "3f40899950", T46]],
};
/* each adopted script: the version it offers, the file and commit that version comes from, and its adoption */
const adoption = (name) => { const [version, file, commit, approved] = CHAINS[name][CHAINS[name].length - 1]; return { version, file, commit, approved }; };
/* DEC-188 (8): the acts PR #19 removed from the registry */
const RETIRED_ACTS = ["aiceilingset", "aicopyceilingset", "accountswitchset", "groupswitchset"];
const OWED = /^owed:([a-z][a-z0-9]*)(?:\s+(DEC-\d+|K\d+))?$/;   /* a ruling owes it: a DEC or a K (PR #13) */
/* Every op the registry names, owed ones as their op: the member op table once each owed op is declared. */
const ALL_OPS = [...new Set(REG_FILE.screens.flatMap((s) => s.acts.map((a) => (a.status === "owed" ? OWED.exec(a.op)[1] : a.op))))];
const OWED_OPS = [...new Set(REG_FILE.screens.flatMap((s) => s.acts.filter((a) => a.status === "owed").map((a) => OWED.exec(a.op)[1])))];
const REFUSED = ["release", "conclude", "withdrawconclusion", "reopen", "publish"];
/* R30: the acts PR #28 owes (K2780) that the added scripts walk, and the script walking each */
const OWED_T46 = { escalationstoppursuing: "Take an escalation to its next stage", actionscope: "Refer it to an oversight body", itemtakeup: "Pick up a plan" };
const real = (x = {}) => ({ screens: wz.SCREEN_REGISTRY, ops: ALL_OPS, machineRefused: REFUSED, machineDrafts: [...MACHINE_DRAFTS, "writinghelp", "groupdescriptiondraft"],
                            irreversible: ["publish", "publishat", "publishatmove"], library: wz.CIVICSMITH_LIBRARY, ...x });
const row = (c) => wz.WIZARD_SCRIPTS_CHECKS[c];
const refused = (r, c, why = "") => {
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, c, c, row(c).check, row(c).translation], `${why} ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};

test("R13 SCREEN_REGISTRY is DEC-139's registry as the file holds it, screen by screen and act by act: [{id, name, purpose, acts}], acts the declared and function ops in the file's order, owed acts apart; frozen; its source the vendored file", () => {
  const sha = createHash("sha256").update(src("registry.json"), "utf8").digest("hex");
  assert.deepEqual(wz.SCREEN_REGISTRY_SOURCE, { commit: "f90b187c7b", path: "docs/development/ux-substrate/screens/registry.json", sha256: sha });
  assert.equal(wz.SCREEN_REGISTRY.length, REG_FILE.screens.length);
  assert.equal(wz.SCREEN_REGISTRY.length, 66);
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

test("R13 (T41; DEC-188; K2484) the registry keeps PR #19's screen projectai (re-taken since, R29, R31, R35); aiceilingset, aicopyceilingset, accountswitchset and groupswitchset appear nowhere in it; ailimitset, accountusesset, projectkeyset, projectsigninset and (DEC-217) projectaikeepaway, owed at PR #19 and declared or function acts since, are registered as their ops once the op table holds them and not before", () => {
  const projectai = wz.SCREEN_REGISTRY.find((s) => s.id === "projectai");
  assert.deepEqual([projectai.name, projectai.acts], ["AI for this project", ["projectkeyset", "projectsigninset", "projectaccountswitch", "projectaccountremove",
    "projectkeynoticeseen", "accountusesset", "ailimitset", "projectaikeepaway"]]);
  assert.deepEqual(projectai.owed, [], "DEC-217: the owed mark off projectaikeepaway, a declared act");
  const text = JSON.stringify(wz.SCREEN_REGISTRY);
  for (const op of RETIRED_ACTS) assert.ok(!text.includes(`"${op}"`), `${op} gone`);
  for (const op of ["aiceilingset", "accountswitchset"]) assert.ok(src("library-e08cd35ecb.json").includes(`"${op}"`), `control: ${op} was named before PR #19`);
  /* registered once declared (op-declarations R41), at the file's place; undeclared, not registered */
  const DEC188 = ["ailimitset", "accountusesset", "projectkeyset", "projectsigninset", "projectaccountswitch", "projectaccountremove",
                  "projectkeynoticeseen", "projectaikeepaway", "exploreapprove"];
  const declared = seeded({ register: false });
  declared.wz.wizardRegister({ ops: ALL_OPS, library: [] });
  const by = Object.fromEntries(declared.wz.registeredScreens().map((s) => [s.id, s.acts]));
  assert.deepEqual(by.projectai, [...projectai.acts]);
  assert.deepEqual(by.connect, ["groupkeynoticeseen", "disclosureshown", "subscriptionsignin", "accountreferenceset", "subscriptiondisconnect", "accountusesset",
                                "ailimitset", "accountreferenceremove"]);
  assert.deepEqual(by.setup.slice(8, 11), ["groupkeyset", "groupkeyswitch", "ailimitset"], "in aicopyceilingset's old place");
  assert.ok(by.members.includes("accountusesset") && by.members.includes("ailimitset"));
  for (const op of RETIRED_ACTS) assert.ok(!Object.values(by).some((acts) => acts.includes(op)), op);
  const undeclared = seeded({ register: false });
  undeclared.wz.wizardRegister({ ops: ALL_OPS.filter((o) => !DEC188.includes(o)), library: [] });
  const un = Object.fromEntries(undeclared.wz.registeredScreens().map((s) => [s.id, s.acts]));
  assert.deepEqual(un.projectai, [], "negative control: none declared, none registered");
  for (const op of DEC188) assert.ok(!Object.values(un).some((acts) => acts.includes(op)), `${op} undeclared`);
  assert.deepEqual(wz.checkScript([step("connect", "ailimitset"), step("connect", null)], real()).refusals, []);
  assert.deepEqual(wz.checkScript([step("connect", "ailimitset"), step("connect", null)], real({ ops: ALL_OPS.filter((o) => o !== "ailimitset") })).refusals.map((x) => x.code),
                   ["WIZARD_ACT_UNKNOWN"]);
  assert.deepEqual(wz.checkScript([step("connect", "aiceilingset"), step("connect", null)], real({ ops: [...ALL_OPS, "aiceilingset"] })).refusals.map((x) => x.code),
                   ["WIZARD_ACT_UNKNOWN"], "a retired act is no act of its screen, declared or not");
});

test("R13 (T37; K2171) the registry is re-taken from PR #14's merge onward: connect is still \"The assistant\", setup no longer offers assistantset, and the library keeps its own commit (R22): each file names its own", () => {
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
  assert.equal(wz.CIVICSMITH_LIBRARY_SOURCE.commit, "d129238bf3", "the library's version 1 is not re-taken (R22)");
});

test("R13 a registration without screens registers SCREEN_REGISTRY; an owed act is registered as its op, in the file's order, only once the member op table declares it; with no op table none is", () => {
  /* the one act the file still owes (R35): members' passwordresetlink, after memberadd */
  assert.deepEqual(OWED_OPS, ["passwordresetlink"]);
  const w = seeded({ register: false });
  const r = w.wz.wizardRegister({ ops: ALL_OPS.filter((o) => o !== "passwordresetlink"), library: [] });
  assert.deepEqual([r.ok, r.screens], [true, 66]);
  const by = Object.fromEntries(w.wz.registeredScreens().map((s) => [s.id, s.acts]));
  assert.deepEqual(by.members.slice(0, 3), ["memberadd", "signerset", "membercaps"], "passwordresetlink undeclared: not registered");
  const all = seeded({ register: false });
  all.wz.wizardRegister({ ops: ALL_OPS, library: [] });
  const byAll = Object.fromEntries(all.wz.registeredScreens().map((s) => [s.id, s.acts]));
  assert.deepEqual(byAll.members.slice(0, 3), ["memberadd", "passwordresetlink", "signerset"], "declared: registered at its place, between two declared acts");
  /* every registered act is the file's, in the file's order */
  for (const f of REG_FILE.screens) {
    const want = f.acts.map((a) => (a.status === "owed" ? OWED.exec(a.op)[1] : a.op));
    assert.deepEqual(byAll[f.id], want, f.id);
    assert.deepEqual(by[f.id], want.filter((op) => op !== "passwordresetlink"), f.id);
  }
  /* acts the file owed before and serves by name since (R31, R35) are declared acts now */
  assert.deepEqual(["plan/itemtakeup", "start-send/filingsecondapprove", "connect/subscriptionsignin", "account/infolevelset", "matter/escalationstoppursuing",
                    "group/grouplogoset", "group/grouplanguagesset", "reset/passwordreset", "ceremony/signrequest", "projectai/projectaikeepaway"]
    .filter((x) => { const [sc, op] = x.split("/"); return REG_FILE.screens.find((f) => f.id === sc).acts.find((a) => a.op === op)?.status !== "declared"; }), []);
  /* no op table: owed acts stay unregistered (negative control) */
  const w2 = seeded({ register: false });
  w2.wz.wizardRegister({ library: [] });
  const by2 = Object.fromEntries(w2.wz.registeredScreens().map((s) => [s.id, s.acts]));
  assert.deepEqual([by2.members.includes("passwordresetlink"), by2.plan.includes("itemtakeup")], [false, true]);
  assert.deepEqual(w2.wz.registeredScreens().map((s) => s.acts), wz.SCREEN_REGISTRY.map((s) => [...s.acts]));
  /* and a registered owed act is checked as any act is */
  assert.deepEqual(wz.checkScript([step("members", "passwordresetlink"), step("members", null)], real()).refusals, []);
  assert.deepEqual(wz.checkScript([step("members", "passwordresetlink")], real({ ops: ALL_OPS.filter((o) => o !== "passwordresetlink") })).refusals.map((x) => x.code),
                   ["WIZARD_ACT_UNKNOWN"]);
});

test("R29 (T46; N897 (1); DEC-139 (5), DEC-197) Your account (account) lists no handlechange, its setpassword and memberlanguageset are declared (and, since R31, infolevelset, registered only while the op table holds it); control: wizardsAt(\"account\") offers no script walking handlechange and op=wizardcheck refuses it (WIZARD_ACT_UNKNOWN), a declared act passing", () => {
  const account = wz.SCREEN_REGISTRY.find((s) => s.id === "account");
  assert.deepEqual([account.name, account.acts, account.owed],
                   ["Your account", ["expertisedeclare", "signout", "signouteverywhere", "setpassword", "signerregisterown", "signerrevokeown", "memberlanguageset",
                                     "infolevelset"], []]);
  assert.deepEqual(["setpassword", "memberlanguageset", "infolevelset"].map((op) => REG_FILE.screens.find((f) => f.id === "account").acts.find((a) => a.op === op).status),
                   ["declared", "declared", "declared"]);
  assert.ok(!JSON.stringify(wz.SCREEN_REGISTRY).includes("handlechange"), "handlechange is no act of any screen (DEC-197)");
  /* an op table lacking infolevelset does not register it (R13, T37) */
  const reg = (ops, library = []) => { const w = world({ register: false }); w.member("frank"); w.wz.wizardRegister({ ops, library }); return w; };
  const acts = (w) => w.wz.registeredScreens().find((s) => s.id === "account").acts;
  assert.deepEqual(acts(reg(ALL_OPS)), [...account.acts]);
  assert.deepEqual(acts(reg(ALL_OPS.filter((o) => o !== "infolevelset"))), account.acts.filter((a) => a !== "infolevelset"));
  assert.deepEqual(acts(reg(null)), account.acts, "with no op table, the declared acts, setpassword and memberlanguageset among them");
  /* control: one registry for wizardsAt and op=wizardcheck, even with handlechange in the op table */
  const ops = [...ALL_OPS, "handlechange"];
  const entry = (id, act) => ({ id, name: id, required: false, version: 1, author: "civicsmith", approved: { by: "Bob", at: "2026-10-06" },
                                steps: [step("account", act), step("account", null)] });
  const w = reg(ops, [entry("WIZ-t46-handle", "handlechange"), entry("WIZ-t46-password", "setpassword")]);
  assert.deepEqual(w.wz.wizardsAt({ screen: "account", viewer: F }).scripts.map((x) => x.id), ["WIZ-t46-password"], "a script walking handlechange is withheld");
  const check = (act) => wz.wizardScriptsOps(w.wz, new URL(`https://x/?viewer=${encodeURIComponent(F)}`), { steps: [step("account", act), step("account", null)] })
    .wizardcheck().refusals.map((x) => [x.code, x.step]);
  assert.deepEqual(check("handlechange"), [["WIZARD_ACT_UNKNOWN", 1]]);
  assert.deepEqual(check("setpassword"), [], "negative control: a declared act of account passes");
  assert.deepEqual(check("memberlanguageset"), []);
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

test("R22, R30, R32, R36 CIVICSMITH_LIBRARY is the seventeen scripts of library.json and the five DEC-194 (5) added, in the order of PR #28's library (PR #33's head the same), each with the file's id, name, start and steps (screen, act, what, why, draft), a side trip as the named script's id and an owed act as its op: version 1 from d129238bf3; for the four scripts BOB adopted at T37 (K2241) version 2 from e08cd35ecb, and for Set up and claim and Publication ceremony version 3 from f90b187c7b (R36); for the two adopted at T41 version 2 from 3660c18803, and for Connect version 3 from a0fab7abf0 (R32); for Start and send version 2 from 3f40899950; every earlier version kept in earlier, oldest first; the five added at version 1 from 3f40899950; every other script keeps its version, the newer files changing them only by owed marks; the file's notes not carried", () => {
  const sha = (f) => createHash("sha256").update(src(f), "utf8").digest("hex");
  assert.deepEqual(wz.CIVICSMITH_LIBRARY_SOURCE, { commit: "d129238bf3", path: "docs/development/ux-substrate/screens/library.json", sha256: sha("library.json") });
  assert.deepEqual(wz.CIVICSMITH_LIBRARY_ADOPTED_SOURCES, [
    { commit: "e08cd35ecb", path: "docs/development/ux-substrate/screens/library.json", sha256: sha("library-e08cd35ecb.json") },
    { commit: "3660c18803", path: "docs/development/ux-substrate/screens/library.json", sha256: sha("library-3660c18803.json") },
    { commit: "3f40899950", path: "docs/development/ux-substrate/screens/library.json", sha256: sha("library-3f40899950.json") },
    { commit: "a0fab7abf0", path: "docs/development/ux-substrate/screens/library.json", sha256: sha("library-a0fab7abf0.json") },
    { commit: "f90b187c7b", path: "docs/development/ux-substrate/screens/library.json", sha256: sha("library-f90b187c7b.json") }]);
  const lib = wz.CIVICSMITH_LIBRARY;
  assert.equal(lib.length, 22);
  assert.deepEqual(lib.map((e) => e.id), LIB_T46.scripts.map((s) => s.id), "PR #28's order");
  assert.deepEqual(LIB_T47.scripts.map((s) => s.id), LIB_T46.scripts.map((s) => s.id), "PR #33's head adds and moves no script");
  assert.deepEqual(lib.filter((e) => !ADDED_T46.includes(e.name)).map((e) => e.id), LIB_FILE.scripts.map((s) => s.id), "the seventeen keep their order");
  const carried = (file, f) => {
    const idOf = Object.fromEntries(file.scripts.map((s) => [s.name, s.id]));
    const v = f.versions[f.versions.length - 1].steps;
    return v.map((t) => {
      const m = typeof t.act === "string" ? OWED.exec(t.act) : null;
      return { screen: t.screen, act: m ? m[1] : t.act, what: t.what, why: t.why, ...(t.draft ? { draft: t.draft } : {}), ...(t.via ? { via: idOf[t.via] } : {}) };
    });
  };
  const renewed = [];
  LIB_T46.scripts.forEach((k, i) => {
    const e = lib[i];
    assert.deepEqual([e.id, e.name, e.start], [k.id, k.name, k.start], k.name);
    for (const key of ["note", "journeys", "versions"]) assert.equal(key in e, false, `${k.name}: ${key} not carried`);
    if (ADDED_T46.includes(k.name)) {
      assert.deepEqual([e.version, e.source, e.required, "earlier" in e], [1, "3f40899950", false, false], k.name);
      assert.deepEqual(e.steps, carried(LIB_T46, k), `${k.name}: version 1 is 3f40899950's steps, step by step`);
      assert.ok(!LIB_FILE.scripts.some((x) => x.id === k.id || x.name === k.name), `${k.name}: new at PR #28`);
      return;
    }
    const f = LIB_FILE.scripts.find((x) => x.id === k.id);
    const g = LIB_NEW.scripts.find((x) => x.id === f.id);
    const h = LIB_T41.scripts.find((x) => x.id === f.id);
    assert.deepEqual([e.id, e.name, e.start], [g.id, g.name, g.start], f.name);
    assert.deepEqual([e.id, e.name, e.start], [h.id, h.name, h.start], f.name);
    if (ADOPTED.includes(f.name)) {
      const chain = CHAINS[f.name];
      const { version, file, commit } = adoption(f.name);
      const n = file.scripts.find((x) => x.id === f.id);
      assert.deepEqual([e.version, e.source], [version, commit], f.name);
      assert.deepEqual(e.steps, carried(file, n), `${f.name}: version ${version} is ${commit}'s steps, step by step`);
      const earlier = [{ version: 1, steps: carried(LIB_FILE, f), author: "civicsmith", approved: V1, source: "d129238bf3" },
        ...chain.slice(0, -1).map(([v, fl, c, approved]) => ({ version: v, steps: carried(fl, fl.scripts.find((x) => x.id === f.id)), author: "civicsmith", approved, source: c }))];
      assert.deepEqual(e.earlier, earlier, `${f.name}: every earlier version kept whole, oldest first`);
      const all = [...e.earlier.map((x) => x.steps), e.steps].map((x) => JSON.stringify(x));
      assert.equal(new Set(all).size, all.length, `${f.name}: each version differs from the others`);
    } else {
      assert.deepEqual([e.version, e.source, "earlier" in e], [1, "d129238bf3", false], f.name);
      assert.deepEqual(e.steps, carried(LIB_FILE, f), `${f.name}: version 1, step by step`);
      assert.deepEqual(carried(LIB_NEW, g), e.steps, `${f.name}: the same at e08cd35ecb, so nothing newer is left out`);
      assert.deepEqual(carried(LIB_T41, h), e.steps, `${f.name}: the same at 3660c18803`);
    }
    const t47 = LIB_T47.scripts.find((x) => x.id === k.id);
    if (JSON.stringify(carried(LIB_T47, t47)) !== JSON.stringify(e.steps)) renewed.push(k.name);
  });
  /* R30, R32, R36: every other script keeps the version R22 names; the newer files change them only by acts no longer
     marked owed, which are carried as their ops already, so every carried script's steps are PR #33's head's and nothing
     newer is left out */
  assert.deepEqual(renewed, []);
  const conn = (file) => carried(file, file.scripts.find((x) => x.name === "Connect your Claude account"));
  assert.deepEqual(conn(LIB_T47), conn(LIB_T47A), "R32: Connect is the same at a0fab7abf0 and at PR #33's head");
  const marks = (file, n) => file.scripts.find((x) => x.name === n).versions[0].steps.filter((t) => typeof t.act === "string" && t.act.startsWith("owed:")).length;
  assert.deepEqual(["Welcome a new member", "Translate the interface"].map((n) => [marks(LIB_T41, n) > 0, marks(LIB_T46, n)]), [[true, 0], [true, 0]],
                   "control: the file did change them, by their owed marks");
  /* the side trips and the owed acts, named */
  const vias = lib.flatMap((e) => e.steps.filter((s) => s.via).map((s) => [e.name, lib.find((x) => x.id === s.via).name]));
  assert.deepEqual(vias, [["Set up and claim", "Say who your group is"], ["Welcome a new member", "Connect your Claude account"],
                          ["Welcome a new member", "Your ties"], ["Check a claim", "Get a record"]]);
  /* the acts a ruling owed when each version was written, carried as their ops; PR #33's head serves each by name */
  const OWED_ONCE = ["actionscope", "escalationstoppursuing", "itemtakeup", "subscriptionsignin"];
  assert.deepEqual([...new Set(lib.flatMap((e) => e.steps.map((s) => s.act)).filter((a) => OWED_ONCE.includes(a)))].sort(), OWED_ONCE);
  assert.deepEqual(lib.flatMap((e) => e.steps.map((s) => s.act)).filter((a) => OWED_OPS.includes(a)), [], "no offered version walks the one act still owed");
  /* the offered versions name no act PR #19 removed (DEC-188 (8)); Connect's version 1, kept readable, still does */
  for (const op of RETIRED_ACTS) assert.ok(!lib.some((e) => e.steps.some((s) => s.act === op)), `${op}: no offered version`);
  const connect = lib.find((e) => e.name === "Connect your Claude account");
  assert.deepEqual(connect.earlier[0].steps.map((s) => s.act).filter((a) => RETIRED_ACTS.includes(a)), ["aiceilingset", "accountswitchset"]);
  assert.ok(!JSON.stringify(lib).includes("owed:"), "no owed: prefix is carried");
  assert.ok(Object.isFrozen(lib) && Object.isFrozen(lib[0]) && Object.isFrozen(lib[0].steps[0]));
});

test("R30 (T46; DEC-194 (4), (5); N913; K2241) the five scripts DEC-194 (5) wrote are adopted, each required: false at version 1, approved by BOB on the date of the adoption and authored by the Civicsmith library, none placing a template, each preparing step saying to start from the group's own template; a step on an act PR #28 owes (escalationstoppursuing, actionscope, itemtakeup, K2780) passes R12 only once its op is declared, the script withheld until then and blocking no release; Start and send's version 2 names no template on communicationprepare and is offered with no filing template offered, its version 1 updated and withheld (control)", () => {
  const by = (n) => wz.CIVICSMITH_LIBRARY.find((e) => e.name === n);
  for (const n of ADDED_T46) {
    const e = by(n);
    assert.deepEqual([e.origin, e.scope, e.required, e.version, e.author, e.approved], ["civicsmith", "group", false, 1, "civicsmith", T46], n);
    assert.ok(!e.steps.some((t) => t.draft), `${n}: no step places a draft`);
  }
  const preparing = [...ADDED_T46, "Start and send"].flatMap((n) => by(n).steps.filter((t) => t.act === "communicationprepare").map((t) => [n, t]));
  assert.deepEqual(preparing.map(([n]) => n), ["Comment for the group", "Demand a correction", "Refer it to an oversight body", "Start and send"]);
  for (const [n, t] of preparing) {
    assert.match(t.what, /[Ss]tart from your group's (\w+ )*template/, n);
    assert.equal(t.draft, undefined, `${n}: no {template} draft`);
  }
  const send = by("Start and send");
  assert.deepEqual([send.version, send.approved, send.required], [2, T46, false]);
  const step4 = (steps) => steps.find((t) => t.act === "communicationprepare");
  assert.deepEqual(step4(send.earlier[0].steps).draft, { template: "@communication" }, "version 1 named @communication");
  assert.deepEqual(send.steps.map((t) => t.act), send.earlier[0].steps.map((t) => t.act), "only step 4's words and draft changed");
  assert.ok(!JSON.stringify(wz.CIVICSMITH_LIBRARY.map((e) => e.steps)).includes("@communication"), "no offered version names @communication");
  /* owed acts: withheld until declared; none required, so R14 is unmoved */
  const reg = (ops, x = {}) => { const w = world({ register: false, ...x }); w.member("frank"); w.wz.wizardRegister({ ops }); return w; };
  const all = reg(ALL_OPS);
  for (const [op, n] of Object.entries(OWED_T46)) {
    assert.ok(by(n).steps.some((t) => t.act === op), `${n} walks ${op}`);
    const w = reg(ALL_OPS.filter((o) => o !== op));
    assert.ok(!w.wz.wizardsAt({ screen: by(n).start, viewer: F }).scripts.some((x) => x.id === by(n).id), `${n} withheld while ${op} is undeclared`);
    assert.deepEqual(wz.requiredFailures(real({ ops: ALL_OPS.filter((o) => o !== op) })), [], `${op}: no release blocked`);
    assert.ok(all.wz.wizardsAt({ screen: by(n).start, viewer: F }).scripts.some((x) => x.id === by(n).id), `${n} offered once ${op} is declared`);
  }
  /* control: with no filing template offered at all, Start and send's version 2 is offered on plan; version 1 was withheld */
  const bare = reg(ALL_OPS, { templates: "unreviewed" });
  const onPlan = bare.wz.wizardsAt({ screen: "plan", viewer: F }).scripts;
  assert.deepEqual(onPlan.filter((x) => x.id === send.id).map((x) => x.version), [`${send.id}@2`]);
  for (const n of ["Comment for the group", "Demand a correction", "Refer it to an oversight body", "Pick up a plan"])
    assert.ok(onPlan.some((x) => x.id === by(n).id), `${n} on plan`);
  assert.ok(bare.wz.wizardsAt({ screen: "matter", viewer: F }).scripts.some((x) => x.id === by("Take an escalation to its next stage").id));
  const one = bare.wz.wizardRead({ script: send.id, version: `${send.id}@1`, viewer: F });
  assert.deepEqual([one.version.state, one.version.updated_by, one.offered], ["updated", `${send.id}@2`, false]);
  const v1 = world({ register: false, templates: "unreviewed" });
  v1.member("frank");
  v1.wz.wizardRegister({ ops: ALL_OPS, library: [{ id: send.id, name: send.name, required: false, ...send.earlier[0] }] });
  assert.deepEqual(v1.wz.wizardsAt({ screen: "plan", viewer: F }).scripts.filter((x) => x.id === send.id), [], "version 1 alone: withheld for want of @communication");
});

test("R22 each library script is origin civicsmith, scope group, authored by the Civicsmith library: version 1 approved by Bob on 2026-10-06, for the four T37 names version 2 adopted by BOB on 2026-10-08 under K2241, for the two T41 names (Connect, Invite) on 2026-10-10 under K2241, (R30) for Start and send version 2 and the five added scripts' version 1 on 2026-10-12 under K2241, (R32, R36) for Connect, Set up and claim and Publication ceremony version 3 on 2026-10-14 under K2241; exactly the three DEC-148 names are required; read so by every member", () => {
  const lib = wz.CIVICSMITH_LIBRARY;
  for (const e of lib) {
    const want = ADOPTED.includes(e.name) ? [adoption(e.name).version, adoption(e.name).approved] : ADDED_T46.includes(e.name) ? [1, T46] : [1, V1];
    assert.deepEqual([e.origin, e.scope, e.author, e.version, e.approved], ["civicsmith", "group", "civicsmith", ...want], e.name);
  }
  assert.deepEqual(lib.filter((e) => e.required).map((e) => e.name), ["Set up and claim", "Welcome a new member", "Publication ceremony"]);
  assert.equal(lib.filter((e) => !e.required).length, 19);
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
  assert.deepEqual(wz.requiredFailures(real()), [], "Set up and claim's version 3 walks hostingaccessset (R36)");
  const offered = wz.CIVICSMITH_LIBRARY.map((x) => ({ id: x.id, steps: x.steps }));
  for (const x of wz.CIVICSMITH_LIBRARY) assert.deepEqual(wz.checkScript(x.steps, { ...real(), offered, self: x.id }).refusals, [], x.name);
  /* the earlier versions of Set up and claim would fail (negative controls): R14 is judged on the version offered */
  const setup = wz.CIVICSMITH_LIBRARY.find((x) => x.name === "Set up and claim");
  assert.deepEqual(setup.earlier.map((v) => wz.checkScript(v.steps, { ...real(), offered, self: setup.id }).refusals.map((f) => [f.code, f.step])),
                   [[["WIZARD_ACT_UNKNOWN", 11], ["WIZARD_ACT_UNKNOWN", 14]], [["WIZARD_ACT_UNKNOWN", 14]]],
                   "version 1 on assistantset and hostingaccess, version 2 on hostingaccess, which setup no longer lists (R35)");
});

test("R22 (T37, T41; K2241), R30 the seven adopted scripts carry version 2 in place of version 1: \"Set up and claim\" on aikeepaway then groupkeyset, no assistantset; \"Publication ceremony\" with its Photos step on obscuremark; \"Check a claim\" with DEC-178's wording; \"Follow a proceeding\" on entitycreate; (T41; DEC-188 (8), DEC-184) \"Connect your Claude account\" on ailimitset and accountusesset in place of aiceilingset and accountswitchset; \"Invite a member\" as PR #19 words it (an invitation's short id; the member chooses her handle); (T46) \"Start and send\" with no template on communicationprepare; each keeps its id, name, required and start, its version 1 updated, naming version 2, readable and not offered", () => {
  const by = (n) => wz.CIVICSMITH_LIBRARY.find((e) => e.name === n);
  const acts = (n) => by(n).steps.map((t) => t.act);
  /* Connect's version 2 (T41), kept readable under version 3 (R32) */
  const connect = by("Connect your Claude account").earlier[1].steps.map((t) => t.act), connect1 = by("Connect your Claude account").earlier[0].steps.map((t) => t.act);
  assert.deepEqual([connect[4], connect[5]], ["ailimitset", "accountusesset"]);
  assert.deepEqual([connect1[4], connect1[5]], ["aiceilingset", "accountswitchset"], "version 1 as it was");
  assert.deepEqual(connect.filter((_, i) => i !== 4 && i !== 5), connect1.filter((_, i) => i !== 4 && i !== 5), "no other act changed");
  const invite = by("Invite a member");
  assert.match(invite.steps[0].what, /a short id for the invitation/);
  assert.match(invite.steps[0].why, /choose their own handle/);
  assert.match(invite.earlier[0].steps[0].what, /their handle/);
  assert.deepEqual(invite.steps.map((t) => t.act), invite.earlier[0].steps.map((t) => t.act), "Invite's acts unchanged: its words only");
  for (const steps of [by("Set up and claim").steps, by("Set up and claim").earlier[1].steps]) {   /* version 2's change, kept in version 3 */
    const setup = steps.map((t) => t.act);
    assert.ok(!setup.includes("assistantset") && setup.indexOf("aikeepaway") >= 0 && setup.indexOf("groupkeyset") === setup.indexOf("aikeepaway") + 1, setup.join());
  }
  assert.ok(acts("Publication ceremony").includes("obscuremark") && by("Publication ceremony").earlier[1].steps.some((t) => t.act === "obscuremark"));
  assert.ok(acts("Follow a proceeding").includes("entitycreate") && !acts("Follow a proceeding").includes("registerproceeding"));
  assert.notDeepEqual(by("Check a claim").steps.map((t) => [t.what, t.why]), by("Check a claim").earlier[0].steps.map((t) => [t.what, t.why]), "the wording changed");
  for (const n of ADOPTED) {
    const f = LIB_FILE.scripts.find((x) => x.name === n);
    assert.deepEqual([by(n).id, by(n).name, by(n).required, by(n).start], [f.id, f.name, ["Set up and claim", "Publication ceremony"].includes(n), f.start], n);
  }
  const w = world({ register: false });
  w.member("frank");
  w.member("erin", { role: "admin" });
  w.wz.wizardRegister({ ops: ALL_OPS });
  for (const e of wz.CIVICSMITH_LIBRARY) {
    const r = w.wz.wizardRead({ script: e.id, viewer: F });
    assert.deepEqual([r.version.id, r.version.state, r.version.updated_by, r.offered],
                     [`${e.id}@${e.version}`, "approved", null, true], e.name);
    if (!e.earlier) { assert.equal(w.wz.wizardRead({ script: e.id, version: `${e.id}@2`, viewer: F }).reason, "NO_SUCH_WIZARD", e.name); continue; }
    e.earlier.forEach((v, i) => {
      const next = i + 1 < e.earlier.length ? e.earlier[i + 1].version : e.version;
      const one = w.wz.wizardRead({ script: e.id, version: `${e.id}@${v.version}`, viewer: F });
      assert.deepEqual([one.ok, one.version.state, one.version.updated_by, one.offered, one.version.approved],
                       [true, "updated", `${e.id}@${next}`, false, i === 0 ? { by: { name: "Bob" }, at: "2026-10-06" } : { by: { name: "BOB" }, at: v.approved.at, ruling: "K2241" }],
                       `${e.name}: version ${v.version} readable, updated, naming its successor`);
      assert.deepEqual(one.version.steps, v.steps);
    });
    assert.deepEqual(r.version.approved, { by: { name: "BOB" }, at: adoption(e.name).approved.at, ruling: "K2241" });
    const at = w.wz.wizardsAt({ screen: e.start, viewer: F }).scripts.filter((s) => s.id === e.id).map((s) => s.version);
    assert.deepEqual(at, [`${e.id}@${e.version}`], `${e.name}: only the latest version offered`);
    const listed = w.wz.wizards({ viewer: V("erin") }).scripts.find((s) => s.id === e.id);
    assert.deepEqual(listed.versions.map((v) => [v.id, v.state]), [[`${e.id}@${e.version}`, "approved"]], `${e.name}: the offered version listed (R10)`);
  }
});

test("R14 over the real library: while an owed act its required flows walk is undeclared, requiredFailures names the flow with its first refusal; an optional flow is never named", () => {
  const without = (ops) => wz.requiredFailures(real({ ops: ALL_OPS.filter((o) => !ops.includes(o)) }))
    .map((f) => [f.name, f.refusal.code, f.refusal.step, f.version]);
  const id = (name) => wz.CIVICSMITH_LIBRARY.find((e) => e.name === name).id;
  assert.deepEqual(without(["memberlanguageset", "publishat"]), [
    ["Welcome a new member", "WIZARD_ACT_UNKNOWN", 1, `${id("Welcome a new member")}@1`],
    ["Publication ceremony", "WIZARD_ACT_UNKNOWN", 11, `${id("Publication ceremony")}@3`]], "version 3, the one offered (R36)");
  assert.deepEqual(without(["startfrom"]), [["Welcome a new member", "WIZARD_ACT_UNKNOWN", 7, `${id("Welcome a new member")}@1`]]);
  assert.deepEqual(without(["translationdraft", "translationadopt", "translationconfirm", "subscriptionsignin"]), [], "owed acts of optional flows block nothing");
  assert.deepEqual(wz.requiredFailures(real({ ops: ALL_OPS.filter((o) => o !== "claim") })).map((f) => [f.name, f.refusal.step]), [["Set up and claim", 5]],
                   "its first refusal named: step 5's claim, before step 11");
  /* the registration plane makes today (no screens of the new interface): every required flow is named */
  assert.deepEqual(wz.requiredFailures(real({ screens: [] })).map((f) => f.name), ["Set up and claim", "Welcome a new member", "Publication ceremony"]);
});

test("R23 startFrom answers the offered scripts this viewer may start, the library's that are not required and the group's own, each {id, version, name, start}, with doors naming offered scripts only (a door none of whose scripts is offered left out: none, with the test library); no AI and no key; starts nothing, writes nothing", () => {
  const w = seeded({ register: false });
  w.wz.wizardRegister({ screens: SCREENS, ops: OPS, machineRefused: MACHINE_REFUSED, machineDrafts: MACHINE_DRAFTS, library: LIBRARY });
  const a = approved(w, { name: "Ours" });
  const d = draft(w, { name: "A draft" });
  const before = w.snapshot();
  const r = w.wz.startFrom({ viewer: F });
  assert.deepEqual([r.ok, r.doors, r.scripts], [true, [], [
    { id: LIBRARY[1].id, version: `${LIBRARY[1].id}@1`, name: "Publish", start: "publish" },
    { id: a.script, version: a.version, name: "Ours", start: "case-home" }]]);
  assert.ok(!r.scripts.some((s) => s.id === LIBRARY[0].id), "a required library script is not a first step");
  assert.ok(!r.scripts.some((s) => s.id === d.script), "a draft is not offered");
  assert.deepEqual(w.wz.startFrom({ viewer: D }).scripts.map((s) => s.id), [LIBRARY[1].id], "dave cannot see P");
  assert.deepEqual(w.wz.startFrom({ viewer: "nobody" }).scripts, []);
  assert.ok(wz.FRONT_DOORS.length > 0 && !wz.FRONT_DOORS.some((d) => d.scripts.some((id) => LIBRARY.some((l) => l.id === id))),
            "control: the doors are given, and name none of the test library's scripts");
  /* through the op table, from a member's session alone */
  assert.deepEqual(wz.wizardScriptsOps(w.wz, new URL("https://x/?op=startfrom&viewer=member%3Afrank"), null).startfrom(), r);
  assert.deepEqual(w.snapshot(), before, "writes nothing, records no use");
  /* the real library: the nineteen optional scripts */
  const w2 = world({ register: false });
  w2.member("frank");
  w2.wz.wizardRegister({ ops: ALL_OPS });
  assert.deepEqual(w2.wz.startFrom({ viewer: F }).scripts.map((s) => s.name),
                   wz.CIVICSMITH_LIBRARY.filter((e) => !e.required).map((e) => e.name),
                   "every optional script, Follow a proceeding's version 2, Get a record, Start and send's version 2 and the five added (R30) included");
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
  assert.equal(wz.CIVICSMITH_LIBRARY.length, 22, "the data is untouched");
});
