/* R83 (K289, N280): `MODULE_ORDER`, the frozen list of build/modules.json's module ids in its total order, the one list
   the modules order their listeners by (this module's R79 among them). T49-1 (N1073, K3268): the test reads the order and
   every module's place from the file, the owner's declaration, and hand-lists no other module's ids; only the names it
   tolerates as not yet built are its own (R83's rule, R145). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { world } from "./fixture.mjs";
import { MODULE_ORDER } from "../../../src/membership/index.mjs";

const modulesJson = async () =>
  JSON.parse(await readFile(new URL("../../../../build/modules.json", import.meta.url), "utf8")).modules;

/* The names tolerated as not yet built, each only while the file gives it no paths (R83's T33-19a rule; its merge gives it
   them, and from then on it is held to them on disk). T49-1 (R145; K657, K3328): `op-capabilities` and `site`, which T49's
   opening adds, join `ai-accounts` (T48's), until each one's job merges. */
const NOT_YET_BUILT = ["ai-accounts", "op-capabilities", "site"];

/* A module's place: the module before it, itself, the module after it (undefined past either end). */
const pin = (list, id) => { const i = list.indexOf(id); return [list[i - 1], id, list[i + 1]]; };
const without = (list, id) => list.filter((x) => x !== id);
/* The list with `id` moved one place earlier: never the file's order. */
const earlier = (list, id) => { const i = list.indexOf(id); const out = [...list]; [out[i - 1], out[i]] = [out[i], out[i - 1]]; return out; };

test("R83 MODULE_ORDER is build/modules.json's module ids in its total order, each once and nothing else", async () => {
  const modules = await modulesJson();
  assert.ok(Array.isArray(MODULE_ORDER));
  assert.deepEqual([...MODULE_ORDER], modules.map((m) => m.id), "the file's ids, in the file's order");
  /* The file's order is the total order (P4): layer by layer, never back to an earlier layer. */
  const layers = modules.map((m) => m.layer);
  assert.deepEqual(layers, [...layers].sort((a, b) => a - b), "modules.json is in layer order");
  assert.equal(new Set(MODULE_ORDER).size, MODULE_ORDER.length, "no id twice");
  for (const id of MODULE_ORDER) assert.equal(typeof id, "string");
});

test("R83 every module the file names is in MODULE_ORDER in the file's place, and a list without it, or holding it one place early, is not the file's (negative control for every module, the last one included)", async () => {
  const modules = await modulesJson();
  const ids = modules.map((m) => m.id);
  for (const id of ids) {
    assert.deepEqual(pin(MODULE_ORDER, id), pin(ids, id), `${id}: its neighbours in the list are the file's`);
    assert.notDeepEqual(without(MODULE_ORDER, id), ids, `a list without ${id} is not the file's`);
    if (MODULE_ORDER.indexOf(id) > 0) {
      assert.notDeepEqual(earlier(MODULE_ORDER, id), ids, `${id} one place early is not the file's order`);
      assert.notDeepEqual(pin(earlier(MODULE_ORDER, id), id), pin(ids, id), `the pin refuses ${id} one place early`);
    }
  }
  assert.equal(MODULE_ORDER.at(-1), ids.at(-1), "the last module is held");
  assert.notDeepEqual(MODULE_ORDER.slice(0, -1), ids, "a list stopping before the last module is not the file's");
});

test("R83 T33-19a every module MODULE_ORDER holds is built, its paths on disk; a module listed before its job merges is named as not yet built, by name, and fails nothing; the tolerated names are exactly those still without paths", async (t) => {
  const modules = await modulesJson();
  const notYet = [];
  for (const m of modules) {
    assert.ok(MODULE_ORDER.includes(m.id), m.id);
    if (!m.paths.length) {
      assert.ok(NOT_YET_BUILT.includes(m.id), `${m.id} has no code and is not a module the plan tolerates by name`);
      notYet.push(m.id);
      continue;
    }
    for (const p of m.paths)
      assert.ok(existsSync(new URL(`../../../../${p}`, import.meta.url)), `${m.id}: ${p} is on disk`);
  }
  /* A tolerated name that has merged is held to its paths like any other (the loop above), never tolerated twice. */
  for (const id of NOT_YET_BUILT) assert.ok(modules.some((m) => m.id === id), `${id} is a module the file names`);
  /* control of the tolerance: a built module that lost its paths is not tolerated */
  const built = modules.find((m) => m.paths.length && !NOT_YET_BUILT.includes(m.id));
  const forged = modules.map((m) => (m.id === built.id ? { ...m, paths: [] } : m));
  assert.deepEqual(forged.filter((m) => !m.paths.length).map((m) => m.id).filter((id) => !NOT_YET_BUILT.includes(id)),
    [built.id], `${built.id} without paths is not tolerated`);
  if (notYet.length) t.diagnostic(`not yet built (tolerated until its job merges): ${notYet.join(", ")}`);
});

/* T47-82 (R140; K3064, K3069; amends R83): `screens-entry` in layer 11, directly after `interface-shell` and before
   `screens-wizards`, in the list and in the file. Control: a list without it, or holding it out of its place, fails. */
test("R140 T47-82 MODULE_ORDER equals modules.json's order with screens-entry directly after interface-shell in layer 11; control: a list missing it, or holding it out of its place, fails", async () => {
  const modules = await modulesJson();
  const ids = modules.map((m) => m.id);
  const entry = modules.find((m) => m.id === "screens-entry");
  const want = ["interface-shell", "screens-entry", "screens-wizards"];
  assert.deepEqual([...MODULE_ORDER], ids, "the list is the file's order");
  assert.equal(entry.layer, 11, "screens-entry is in layer 11");
  assert.deepEqual(pin(MODULE_ORDER, "screens-entry"), want, "interface-shell → screens-entry → screens-wizards in the list");
  assert.deepEqual(pin(ids, "screens-entry"), want, "and in the file");
  assert.notDeepEqual(without(MODULE_ORDER, "screens-entry"), ids, "a list without screens-entry is not the file's");
  assert.notDeepEqual(pin(earlier(MODULE_ORDER, "screens-entry"), "screens-entry"), want, "the pin refuses it one place early");
  /* `setup-page` and `legacy-ui` are in the list exactly while the file names them */
  for (const id of ["setup-page", "legacy-ui"])
    assert.equal(MODULE_ORDER.includes(id), ids.includes(id), `${id} is in the list exactly while the file names it`);
});

/* T48-9 (K657, K3100; N1014): `ai-accounts` between `project-roster` and `credentials` in layer 2, `signin-door` after
   `store-door`, `setup-page` gone and `legacy-ui` kept; T49-1 moves "last" to `journey-check` still: nothing follows it. */
test("R83 T48-9 MODULE_ORDER equals modules.json's order with ai-accounts between project-roster and credentials, signin-door after store-door, journey-check last, setup-page gone and legacy-ui kept; control: a list without journey-check, or holding one of them out of its place, fails", async () => {
  const modules = await modulesJson();
  const ids = modules.map((m) => m.id);
  const layerOf = new Map(modules.map((m) => [m.id, m.layer]));
  const pins = [["project-roster", "ai-accounts", "credentials", 2], ["store-door", "signin-door", "interface-assets", 11],
                ["stewards", "journey-check", undefined, 11]];
  assert.deepEqual([...MODULE_ORDER], ids, "the list is the file's order");
  for (const [before, id, after, layer] of pins) {
    assert.equal(layerOf.get(id), layer, `${id} is in layer ${layer}`);
    assert.deepEqual(pin(MODULE_ORDER, id), [before, id, after], `${before} → ${id} → ${after} in the list`);
    assert.deepEqual(pin(ids, id), [before, id, after], `${before} → ${id} → ${after} in the file`);
    assert.notDeepEqual(without(MODULE_ORDER, id), ids, `a list without ${id} is not the file's`);
    assert.notDeepEqual(pin(earlier(MODULE_ORDER, id), id), [before, id, after], `the pin refuses ${id} out of its place`);
  }
  assert.ok(!MODULE_ORDER.includes("setup-page") && !ids.includes("setup-page"), "setup-page gone from both");
  assert.ok(MODULE_ORDER.includes("legacy-ui") && ids.includes("legacy-ui"), "legacy-ui kept in both");
  assert.notDeepEqual([...MODULE_ORDER, "setup-page"], ids, "a list still holding setup-page is not the file's");
});

/* T49-1 (R145; K657, K3328; amends R140): the two modules T49's opening adds, in layer 11: `op-capabilities` directly
   before `op-declarations`, `site` directly after `installer`; each tolerated by name as not yet built until its job merges
   with its paths. Test: the list equals the file's order with both in place. Control: a list missing either, or holding
   either out of its place, fails; and a module that is not one of the tolerated names is not tolerated. */
test("R145 T49-1 MODULE_ORDER equals modules.json's order with op-capabilities directly before op-declarations and site directly after installer, both in layer 11 and tolerated by name while pathless; control: a list missing either, or holding either out of its place, fails", async () => {
  const modules = await modulesJson();
  const ids = modules.map((m) => m.id);
  const layerOf = new Map(modules.map((m) => [m.id, m.layer]));
  const pins = [["instance-setup", "op-capabilities", "op-declarations"], ["installer", "site", "stewards"]];
  assert.deepEqual([...MODULE_ORDER], ids, "the list is the file's order");
  for (const [before, id, after] of pins) {
    assert.equal(layerOf.get(id), 11, `${id} is in layer 11`);
    assert.deepEqual(pin(MODULE_ORDER, id), [before, id, after], `${before} → ${id} → ${after} in the list`);
    assert.deepEqual(pin(ids, id), [before, id, after], `${before} → ${id} → ${after} in the file`);
    /* control: without it, or one place early, the list is not the file's and the pin refuses it */
    assert.notDeepEqual(without(MODULE_ORDER, id), ids, `a list without ${id} is not the file's`);
    assert.notDeepEqual(earlier(MODULE_ORDER, id), ids, `${id} one place early is not the file's order`);
    assert.notDeepEqual(pin(earlier(MODULE_ORDER, id), id), [before, id, after], `the pin refuses ${id} out of its place`);
    /* one place late, after its right neighbour */
    const i = MODULE_ORDER.indexOf(id), late = [...MODULE_ORDER];
    [late[i], late[i + 1]] = [late[i + 1], late[i]];
    assert.notDeepEqual(late, ids, `${id} one place late is not the file's order`);
    assert.notDeepEqual(pin(late, id), [before, id, after], `the pin refuses ${id} one place late`);
    /* tolerated by name while the file gives it no paths; held to its paths on disk from its merge */
    const m = modules.find((x) => x.id === id);
    assert.ok(NOT_YET_BUILT.includes(id), `${id} is a tolerated name`);
    for (const p of m.paths) assert.ok(existsSync(new URL(`../../../../${p}`, import.meta.url)), `${id}: ${p} is on disk`);
  }
  /* the tolerated names are exactly those still without paths, and no other module is tolerated */
  const unbuilt = modules.filter((m) => !m.paths.length).map((m) => m.id);
  assert.deepEqual(unbuilt.filter((id) => !NOT_YET_BUILT.includes(id)), [], "every module without paths is a tolerated name");
  assert.deepEqual(NOT_YET_BUILT.filter((id) => !pins.some(([, p]) => p === id)), ["ai-accounts"],
    "besides the two, ai-accounts alone is tolerated");
});

test("R83 MODULE_ORDER is frozen: no write changes it", () => {
  const before = JSON.stringify(MODULE_ORDER);
  assert.ok(Object.isFrozen(MODULE_ORDER));
  const writes = [
    () => MODULE_ORDER.push("x"), () => MODULE_ORDER.pop(), () => MODULE_ORDER.reverse(), () => MODULE_ORDER.sort(),
    () => MODULE_ORDER.splice(0, 1), () => { MODULE_ORDER[0] = "x"; }, () => { MODULE_ORDER.length = 0; },
    () => { delete MODULE_ORDER[1]; },
  ];
  for (const w of writes) assert.throws(w, TypeError, String(w));
  assert.equal(JSON.stringify(MODULE_ORDER), before);
});

test("R83 R79 the revocation notice runs its listeners in MODULE_ORDER, whatever order they registered in, an unknown module last", async () => {
  const w = await world({ omit: ["revoked"] }).group("ann");
  const heard = [];
  const registered = [...MODULE_ORDER].reverse();
  registered.splice(7, 0, "unknown-b");
  registered.push("unknown-a");
  for (const m of registered) assert.equal(w.m.onRevoked(m, () => heard.push(m)).ok, true, m);
  assert.equal(w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" }).ok, true);
  assert.deepEqual(heard, [...MODULE_ORDER, "unknown-b", "unknown-a"]);
});
