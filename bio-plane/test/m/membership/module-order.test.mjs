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

/* T36-6 (N723; K1961, K2008, K2084): the modules added since T33, each held in the file's place: `file-scanner` last in
   layer 1, `file-safety` after `capture` in layer 3, `law-relations` before `standards` in layer 5, and L11's split
   (`op-grades` before `affordances`, `answer-envelope` and `store-door` after `admission`). Each pair is `[before, id,
   after]`, so the place is pinned by both neighbours. */
const SINCE_T33 = [["sheet-worker", "file-scanner", "record-core"], ["capture", "file-safety", "sources"],
                   ["observation-log", "law-relations", "standards"], ["wizard-scripts", "op-grades", "affordances"],
                   ["admission", "answer-envelope", "store-door"], ["answer-envelope", "store-door", "control-plane"],
                   /* T37-44 (K1185, K2171): `image-cover` after `pdf-pixels` in layer 1 (`doc-clean` after it since T39). */
                   ["pdf-pixels", "image-cover", "doc-clean"],
                   /* T38-4 (N783; K657, K1185, K2270): `project-roster` directly after `membership` in layer 2. */
                   ["membership", "project-roster", "credentials"],
                   /* T39-M (N806, N807; K657, K2333, K2343): `doc-clean` directly after `image-cover` in layer 1,
                      `setup-words` directly before `instance-setup` in layer 11. */
                   ["image-cover", "doc-clean", "pdf-worker"], ["setup-page", "setup-words", "instance-setup"],
                   /* T40-M (N812 B10; K657, K2373, K2389): `ai-use` directly after `run-rules` in layer 6. */
                   ["run-rules", "ai-use", "ai-runs"],
                   /* T41-3 (N820, N823; K657, K2431): the five modules T41's opening adds, each between the two
                      neighbours `build/modules.json` places it between. */
                   ["hypotheses", "steps", "citation"], ["capture-requests", "reading-guides", "skills"],
                   ["skills", "question-explorer", "answers"], ["intent", "investigation", "reevaluation"],
                   ["publication", "publish-schedule", "docket"]];
/* Listed in the file before its job builds it (K1043's form: empty `paths`), tolerated by name until that merge
   (T33-19a's rule). The T33, T36 and T38 modules so tolerated have all merged (T38's `file-safety` and
   `project-roster` among them), so none is tolerated any longer; T39-M (K2343): `setup-words`, until its L11 job;
   T40-M (K2373): `ai-use`, until its L6 job (T40-7). T41-3 (K657, K2431): `setup-words` has merged and is held to
   its paths; the five T41's opening adds are tolerated until each one's job merges. */
const NOT_YET_BUILT = ["ai-use", "steps", "reading-guides", "question-explorer", "investigation", "publish-schedule"];

test("R83 T36-6 T37-44 T38-4 T39-M T40-M T41-3 MODULE_ORDER holds the modules added since T33 in the file's places: file-scanner, file-safety, law-relations, op-grades, answer-envelope, store-door, image-cover, project-roster, doc-clean, setup-words, ai-use, steps, reading-guides, question-explorer, investigation, publish-schedule", async () => {
  const modules = await modulesJson();
  const layerOf = new Map(modules.map((m) => [m.id, m.layer]));
  for (const [before, id, after] of SINCE_T33) {
    const at = MODULE_ORDER.indexOf(id);
    assert.ok(at > 0, `${id} is held`);
    assert.deepEqual(MODULE_ORDER.slice(at - 1, at + 2), [before, id, after], `${before} → ${id} → ${after}`);
  }
  assert.deepEqual(SINCE_T33.map(([, id]) => layerOf.get(id)), [1, 3, 5, 11, 11, 11, 1, 2, 1, 11, 6, 6, 6, 6, 7, 8],
    "each in its layer");
});

test("R83 T33-19a MODULE_ORDER holds plan T33's order: the new modules in their places, local-facts and standards in layer 5, observation-log after connections", async () => {
  const modules = await modulesJson();
  const layerOf = new Map(modules.map((m) => [m.id, m.layer]));
  /* T33's layers as T33 left them: a module added since (T36-6's) sits between them and moves none of them. */
  const since = new Set(SINCE_T33.map(([, id]) => id));
  for (const [layer, ids] of Object.entries(T33_LAYERS))
    assert.deepEqual(MODULE_ORDER.filter((id) => layerOf.get(id) === Number(layer) && !since.has(id)), ids, `layer ${layer}`);
  /* T41-3: a run as T33 left it, read past the modules added since (`publish-schedule` now sits inside the first). */
  const t33Order = MODULE_ORDER.filter((id) => !since.has(id));
  for (const run of T33_RUNS) {
    const at = t33Order.indexOf(run[0]);
    assert.ok(at >= 0, run[0]);
    assert.deepEqual(t33Order.slice(at, at + run.length), run, run.join(" → "));
  }
  for (const id of ["local-facts", "standards"]) assert.equal(layerOf.get(id), 5, `${id} is in layer 5`);
  assert.equal(MODULE_ORDER.indexOf("observation-log"), MODULE_ORDER.indexOf("connections") + 1);
  for (const id of T33_NEW) assert.ok(MODULE_ORDER.includes(id), `${id} is held in its place`);
});

test("R83 T33-19a T39-M T40-M T41-3 every module MODULE_ORDER holds is built, its paths on disk; a module listed before its job merges (ai-use, steps, reading-guides, question-explorer, investigation, publish-schedule) is named as not yet built, by name, and fails nothing", async (t) => {
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
  /* Its merge gives a module its paths, and from then on it is held to them like any other. */
  if (notYet.length) t.diagnostic(`not yet built (tolerated until its job merges): ${notYet.join(", ")}`);
});

/* K874's negative control for T41-3's re-pin: the checks above fail a list that leaves out one of the five, and a list
   that holds it in another place, so they test the place and not merely the presence. */
test("R83 T41-3 negative control: a list missing steps, or holding investigation out of its place, is refused by the file and by the neighbour pins", async () => {
  const ids = (await modulesJson()).map((m) => m.id);
  const missing = MODULE_ORDER.filter((id) => id !== "steps");
  assert.notDeepEqual(missing, ids, "a list without steps is not the file's");
  const moved = MODULE_ORDER.filter((id) => id !== "investigation");
  moved.splice(moved.indexOf("reevaluation") + 1, 0, "investigation");
  assert.notDeepEqual(moved, ids, "investigation after reevaluation is not the file's order");
  const at = moved.indexOf("investigation");
  assert.notDeepEqual(moved.slice(at - 1, at + 2), ["intent", "investigation", "reevaluation"], "the pin refuses it");
  for (const [before, id, after] of SINCE_T33.slice(-5)) {
    const i = MODULE_ORDER.indexOf(id);
    assert.deepEqual(MODULE_ORDER.slice(i - 1, i + 2), [before, id, after], `${id} in its place in the real list`);
  }
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
