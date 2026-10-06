/* plane R19 (N528; DEC-120, DEC-121 (1), (5); K1363 B11, K1396): the composition of `wizard-scripts`. It is built on the
   object's storage first in layer 11, its migration runs in R3's pass, its tables are declared to purge, its ops map is
   routed through control-plane's door, and before the first request it is registered (its R13) with the screen registry
   and the Civicsmith library the bundle carries, the member op table (`op-declarations`' `OPS`), the acts a machine is
   refused (`affordances`' `MACHINE_REFUSALS`), the labelled machine drafts (`case-authoring` R39's, and since T34
   `groupdescriptiondraft` and `writinghelp`, DEC-152, DEC-153) and the acts `affordances` grades `irreversible`. The release
   suite, holding `requiredFailures` empty for that registration, is `release.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { store } from "./fixture.mjs";
import { MACHINE_DRAFTS, wizardRegistration, irreversibleActs } from "../../../src/plane/wizards.mjs";
import { SCREENS } from "../../../src/plane/screens.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { reviewOf, reviewOps } from "../../../src/review/index.mjs";
import { wizardScriptsOf, wizardScriptsOps, WIZARD_SCRIPTS_TABLES, CIVICSMITH_LIBRARY, SCREEN_REGISTRY } from "../../../src/wizard-scripts/index.mjs";
import { MACHINE_REFUSALS, RUNGS } from "../../../src/affordances.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";

const WZ = [...WIZARD_SCRIPTS_TABLES];
const tableNames = (x) => [...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`)].map((r) => r.name);
const codes = (list) => list.map((f) => f.code);
const mask = (text) => text.replace(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z/g, "<instant>");

/* Every module that declared a table to purge, in declaration order (record-core R21), each named once. */
function declarers(x) {
  const rc = recordOf(x.ctx), out = [];
  for (const t of Object.keys(rc.purge().removed)) {
    const m = rc.declarePurge("zz-probe", [t]).declaredBy;
    if (!out.includes(m)) out.push(m);
  }
  return out;
}

test("R19: wizard-scripts is built first in layer 11, creating its tables and declaring them to purge under its own name", async () => {
  const x = await store();
  for (const t of WZ) assert.ok(tableNames(x).includes(t), `table ${t}`);
  const rc = recordOf(x.ctx);
  for (const t of WZ) assert.equal(rc.declarePurge("zz-probe", [t]).declaredBy, "wizard-scripts", t);
  const order = declarers(x);
  const at = (m) => { const i = order.indexOf(m); assert.notEqual(i, -1, `${m} declared: ${order.join()}`); return i; };
  assert.ok(at("filing-templates") < at("wizard-scripts") && at("monitoring") < at("wizard-scripts"), "after layers 9 and 10");
  /* negative control: a table no module declared is free to a probe */
  assert.equal(rc.declarePurge("zz-probe", ["zz_none"]).ok, true);
});

test("R19, R3: a store written before wizard-scripts opens with its tables, and a second construction changes nothing", async () => {
  const db = new DatabaseSync(":memory:");
  const first = await store({ db });
  for (const t of WZ) db.exec(`DROP TABLE IF EXISTS ${t}`);
  assert.equal(WZ.some((t) => tableNames(first).includes(t)), false);
  const old = await store({ db });
  for (const t of WZ) assert.ok(tableNames(old).includes(t), `table ${t}`);
  const shape = (x) => [...x.ctx.storage.sql.exec(`SELECT type, name, sql FROM sqlite_master WHERE name LIKE 'wiz_%' ORDER BY name`)].map((r) => ({ ...r }));
  const was = shape(old);
  assert.ok(was.length >= WZ.length);
  assert.deepEqual(shape(await store({ db })), was);
});

test("R19 (T34; DEC-152, DEC-153; K1818): before the first request it is registered once with the bundle's screens and library, the member op table, the acts a machine is refused, the labelled machine drafts (groupdescriptiondraft and writinghelp among them) and the irreversible acts", async () => {
  const x = await store();
  const w = wizardScriptsOf(x.ctx);
  /* once: a second registration is refused, so the plane's stands */
  const again = w.wizardRegister(wizardRegistration());
  assert.equal(again.ok, false);
  assert.equal(again.reason, "WIZARD_ALREADY_REGISTERED");
  /* the registration is exactly R19's parts */
  const drafts = ["whatchangedpropose", "escalationreasondraft", "groupdescriptiondraft", "writinghelp"];
  const graded = Object.keys(RUNGS).filter((op) => RUNGS[op] === "irreversible");
  assert.deepEqual(wizardRegistration(), { screens: SCREEN_REGISTRY, ops: OPS, machineRefused: Object.keys(MACHINE_REFUSALS),
                                           machineDrafts: drafts, irreversible: graded, library: CIVICSMITH_LIBRARY });
  assert.deepEqual(MACHINE_DRAFTS, drafts);
  /* the irreversible acts are affordances' grading, read whole (publish among them), never a copy of it */
  assert.ok(graded.includes("publish"), graded.join());
  assert.deepEqual(irreversibleActs(), graded);
  assert.deepEqual(irreversibleActs({ a: "irreversible", b: "reasoned", c: "irreversible" }), ["a", "c"], "follows the grading it is given");
  assert.deepEqual(w.registeredScreens(), SCREEN_REGISTRY.map((s) => ({ id: s.id, acts: [...s.acts] })), "the registry's screens (K1869 (2))");
  assert.deepEqual(new Set(w.reg.ops), new Set(Object.keys(OPS)), "the member op table");
  assert.deepEqual(w.reg.library.map((e) => e.id), CIVICSMITH_LIBRARY.map((e) => e.id), "the Civicsmith library");
  /* behaviour through the door (`op=wizardcheck`, wizard-scripts R12) over what was registered */
  const check = async (steps) => {
    const r = await (await x.fetch("/wizardcheck?viewer=member:ann", { method: "POST", body: JSON.stringify({ steps }) })).json();
    assert.equal(r.ok, true, JSON.stringify(r));
    return codes(r.result.refusals);
  };
  const refused = Object.keys(MACHINE_REFUSALS)[0];
  const step = (x) => ({ screen: "nowhere", act: null, what: "Read the page", why: "To see what is there", ...x });
  /* the acts a machine is refused: a draft from the script's own words is never placed on one */
  assert.ok((await check([step({ act: refused, draft: { text: "words" } })])).includes("WIZARD_STEP_CONCLUDES"));
  assert.ok(!(await check([step({ act: "zz-not-refused", draft: { text: "words" } })])).includes("WIZARD_STEP_CONCLUDES"));
  /* the labelled machine drafts: each registered one is allowed; case-authoring's even on a refused act, while the
     assistant's writing help (groupdescriptiondraft, writinghelp) is never placed on an act refused to a machine or
     graded irreversible (wizard-scripts R24, over what was registered); any other draft is refused */
  const help = ["groupdescriptiondraft", "writinghelp"];
  for (const op of MACHINE_DRAFTS) {
    const on = await check([step({ act: refused, draft: { machine: op } })]);
    const off = await check([step({ act: "zz-not-refused", draft: { machine: op } })]);
    assert.ok(!off.includes("WIZARD_DRAFT_REFUSED") && !off.includes("WIZARD_STEP_CONCLUDES"), `${op}: ${off}`);
    assert.equal(on.includes("WIZARD_STEP_CONCLUDES"), help.includes(op), `${op} on ${refused}: ${on}`);
    assert.ok(!on.includes("WIZARD_DRAFT_REFUSED"), `${op}: ${on}`);
  }
  for (const act of irreversibleActs())
    assert.ok((await check([step({ act, draft: { machine: "writinghelp" } })])).includes("WIZARD_STEP_CONCLUDES"), `irreversible ${act}`);
  assert.ok((await check([step({ draft: { machine: "zz-not-a-draft" } })])).includes("WIZARD_DRAFT_REFUSED"));
  /* the screens: one the registry does not hold is unknown, never guessed (R24) */
  assert.ok((await check([step({})])).includes("WIZARD_SCREEN_UNKNOWN"));
});

test("R19, R5: every op of wizard-scripts' map is in the route map, after review's, and answers through control-plane's door what its own map answers called directly", async () => {
  const u = new URL("http://do/");
  const ops = Object.keys(wizardScriptsOps(null, u, null));
  assert.ok(ops.length >= 15 && ops.includes("wizardsat") && ops.includes("wizardcheck"), ops.join());
  const x = await store(), twin = await store();
  const map = Object.keys(x.s.routes(u, null));
  const rev = Object.keys(reviewOps(reviewOf(x.ctx), u, null));
  assert.deepEqual(map.slice(map.indexOf(rev[rev.length - 1]) + 1).slice(0, ops.length), ops, "at its place, in its own order");
  for (const op of ops) {
    const path = `${op}?viewer=member:nobody&author=member:nobody&script=WIZ-none&version=WIZ-none@1&screen=nowhere`;
    const res = await x.fetch(`/${path}`, { method: "POST", body: "{}" });
    const direct = await wizardScriptsOps(wizardScriptsOf(twin.ctx), new URL(`http://do/${path}`), {})[op]();
    assert.equal(res.status, 200, op);
    assert.deepEqual(JSON.parse(mask(await res.text())), JSON.parse(mask(JSON.stringify({ ok: true, result: direct }))), op);
  }
  /* negative control: a machine's draft is wizard-scripts' own refusal, inside the door's envelope */
  const machine = await (await x.fetch("/wizarddraft?viewer=class:ai&author=class:ai", { method: "POST", body: "{}" })).json();
  assert.deepEqual([machine.ok, machine.result.ok, machine.result.reason], [true, false, "MACHINE_CANNOT_DRAFT_WIZARD"]);
});
