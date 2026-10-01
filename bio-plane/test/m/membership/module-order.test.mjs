/* R83 (K289, N280): `MODULE_ORDER`, the frozen list of build/modules.json's module ids in its total order, the one list
   the modules order their listeners by (this module's R79 among them). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { world } from "./fixture.mjs";
import { MODULE_ORDER } from "../../../src/membership/index.mjs";

const modulesJson = async () =>
  JSON.parse(await readFile(new URL("../../../../build/modules.json", import.meta.url), "utf8")).modules;

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
