/* plane R19 (N528; DEC-120, DEC-121 (1), (5); K1363 B11, K1396): the composition of `wizard-scripts`. It is built on the
   object's storage first in layer 11, its migration runs in R3's pass, its tables are declared to purge, its ops map is
   routed through control-plane's door, and before the first request it is registered (its R13) with the screen registry
   and the Civicsmith library the bundle carries, the member op table (`op-declarations`' `OPS`), the acts a machine is
   refused (`affordances`' `MACHINE_REFUSALS`) and the labelled machine drafts (`case-authoring` R39's). The release
   suite, holding `requiredFailures` empty for that registration, is `release.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { store } from "./fixture.mjs";
import { MACHINE_DRAFTS, wizardRegistration } from "../../../src/plane/wizards.mjs";
import { SCREENS } from "../../../src/plane/screens.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { reviewOf, reviewOps } from "../../../src/review/index.mjs";
import { wizardScriptsOf, wizardScriptsOps, WIZARD_SCRIPTS_TABLES, CIVICSMITH_LIBRARY } from "../../../src/wizard-scripts/index.mjs";
import { MACHINE_REFUSALS } from "../../../src/affordances.mjs";
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

test("R19: before the first request it is registered once with the bundle's screens and library, the member op table, the acts a machine is refused and the labelled machine drafts", async () => {
  const x = await store();
  const w = wizardScriptsOf(x.ctx);
  /* once: a second registration is refused, so the plane's stands */
  const again = w.wizardRegister(wizardRegistration());
  assert.equal(again.ok, false);
  assert.equal(again.reason, "WIZARD_ALREADY_REGISTERED");
  /* the registration is exactly R19's parts */
  assert.deepEqual(wizardRegistration(), { screens: SCREENS, ops: OPS, machineRefused: Object.keys(MACHINE_REFUSALS),
                                           machineDrafts: ["whatchangedpropose", "escalationreasondraft"], library: CIVICSMITH_LIBRARY });
  assert.deepEqual(MACHINE_DRAFTS, ["whatchangedpropose", "escalationreasondraft"]);
  assert.deepEqual(w.registeredScreens(), SCREENS.map((s) => ({ id: s.id, acts: [...s.acts] })), "the bundle's screens");
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
  /* the labelled machine drafts: each registered one is allowed, even on a refused act; any other is refused */
  for (const op of MACHINE_DRAFTS) {
    const c = await check([step({ act: refused, draft: { machine: op } })]);
    assert.ok(!c.includes("WIZARD_DRAFT_REFUSED") && !c.includes("WIZARD_STEP_CONCLUDES"), `${op}: ${c}`);
  }
  assert.ok((await check([step({ draft: { machine: "zz-not-a-draft" } })])).includes("WIZARD_DRAFT_REFUSED"));
  /* the screens: none registered until the interface ships one, so every screen is unknown */
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
