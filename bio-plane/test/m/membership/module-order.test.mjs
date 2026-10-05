/* R83 (K289, N280): `MODULE_ORDER`, the frozen list of build/modules.json's module ids in its total order, the one list
   the modules order their listeners by (this module's R79 among them). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
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

/* T33-19a (K1438, K1504): the order of plan T33's Rules (2), pinned. Layers 1, 5, 6 and 10 whole; layers 8 and 11 by
   the run each new module sits in; layer 9 without local-facts and standards (moved to layer 5). */
const T33_LAYERS = {
  1: ["record-grammar", "jurisdictions", "civil-time", "calc-grammar", "connection-grammar", "test-support",
      "runtime-limits", "signatures", "bundler", "court-citations", "id-spaces", "subresources", "ooxml", "office-readers",
      "odf-reader", "pdf-reader", "format-registry", "text-chain", "site-profiles", "docprofile", "doctypes",
      "legistar-reader", "roster-reader", "court-doctypes", "budget-doctypes", "image-codecs", "pdf-pixels", "pdf-worker",
      "ocr-worker", "sheet-worker"],
  5: ["entities", "events", "lines", "local-facts", "connections", "observation-log", "standards", "progressions", "money",
      "money-checks", "duties", "people", "explore", "bias", "query-language", "retrieval", "calculations", "workbooks"],
  6: ["inquiry-grammar", "accepted-work", "leg-earning", "inquiry", "hypotheses", "citation", "basis-versions", "strength",
      "contradiction", "run-rules", "ai-runs", "run-productions", "capture-requests", "skills", "answers", "agent-harness",
      "agent-model", "agent-runner", "agent-worker"],
  10: ["monitoring", "following", "link-sweep", "scheduler"],
};
const T33_RUNS = [["case-carriage", "case-tensions", "publication", "docket"],
                  ["queue-producers", "notice-producers", "queue"]];
/* The modules T33 adds (R83's list, every conditional one read GO, K1506): until its job merges a module is registered
   with empty `paths` (K1336's pattern), and only these names are tolerated so (plan T33, Rules (9) item 2). */
const T33_NEW = ["civil-time", "calc-grammar", "connection-grammar", "court-citations", "doctypes", "legistar-reader",
  "roster-reader", "court-doctypes", "budget-doctypes", "sheet-worker", "events", "lines", "money", "money-checks", "duties",
  "people", "explore", "calculations", "workbooks", "leg-earning", "hypotheses", "answers", "agent-harness", "agent-model",
  "agent-runner", "case-tensions", "following", "notice-producers"];

test("R83 T33-19a MODULE_ORDER holds plan T33's order: the new modules in their places, local-facts and standards in layer 5, observation-log after connections", async () => {
  const modules = await modulesJson();
  const layerOf = new Map(modules.map((m) => [m.id, m.layer]));
  for (const [layer, ids] of Object.entries(T33_LAYERS))
    assert.deepEqual(MODULE_ORDER.filter((id) => layerOf.get(id) === Number(layer)), ids, `layer ${layer}`);
  for (const run of T33_RUNS) {
    const at = MODULE_ORDER.indexOf(run[0]);
    assert.ok(at >= 0, run[0]);
    assert.deepEqual(MODULE_ORDER.slice(at, at + run.length), run, run.join(" → "));
  }
  for (const id of ["local-facts", "standards"]) assert.equal(layerOf.get(id), 5, `${id} is in layer 5`);
  assert.equal(MODULE_ORDER.indexOf("observation-log"), MODULE_ORDER.indexOf("connections") + 1);
  for (const id of T33_NEW) assert.ok(MODULE_ORDER.includes(id), `${id} is held in its place`);
});

test("R83 T33-19a every module MODULE_ORDER holds is built, its paths on disk; a T33 module listed before its job merges is named as not yet built, by name, and fails nothing", async (t) => {
  const modules = await modulesJson();
  const notYet = [];
  for (const m of modules) {
    assert.ok(MODULE_ORDER.includes(m.id), m.id);
    if (!m.paths.length) {
      assert.ok(T33_NEW.includes(m.id), `${m.id} has no code and is not a T33 module the plan tolerates by name`);
      notYet.push(m.id);
      continue;
    }
    for (const p of m.paths)
      assert.ok(existsSync(new URL(`../../../../${p}`, import.meta.url)), `${m.id}: ${p} is on disk`);
  }
  /* Its merge gives a module its paths, and from then on it is held to them like any other. */
  if (notYet.length) t.diagnostic(`not yet built (tolerated until its job merges): ${notYet.join(", ")}`);
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
