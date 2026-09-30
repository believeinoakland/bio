/* record-grammar's invariants at its interface: pure (R24), the catalogue's re-exports the same bindings (R26), no
   place named (R27). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";
import * as RG from "../../../src/record-grammar/index.mjs";
import * as CATALOGUE from "../../../checks/bio-checks.mjs";

const MODULE = new URL("../../../src/record-grammar/index.mjs", import.meta.url).href;

/* One battery over every function the module provides, its answers as one JSON string. */
const BATTERY = `async (RG) => {
  const out = [];
  const fm = "---\\nid: INFO-2026-0001-a\\nlist:\\n  - k: v\\n    j: 1\\n  status: x\\n  - bad\\n---\\nbody";
  out.push(RG.parseFrontmatter(fm), RG.parseFrontmatter("no fence"));
  out.push(RG.canonicalJson({ b: [1, { d: undefined, c: 2 }], a: "x" }));
  for (const w of ["token:x", "Alice", "daemon", "", null]) out.push(RG.isMachineStamp(w), RG.isMachineIdentity(w));
  for (const t of ["problem", "constructor", "information"]) out.push(RG.normalizeType(t));
  for (const u of ["https://example.org", "https://localhost."]) out.push(RG.isPublicHttpsLocator(u));
  out.push(RG.sha256HexSync("abc"), RG.createSha256().update(new Uint8Array(200).fill(7)).hex());
  out.push(Array.from(RG.b64ToBytes("AQID")));
  out.push(RG.BUNDLE_ID_RE.test("PLN-2026-0001-a"), RG.ANN_ID_RE.source, RG.UNREACHABLE_CAPTURE_GRADE);
  return JSON.stringify(out);
}`;
const battery = (0, eval)(BATTERY);

test("R24 pure: the same answers every time, with the clock, randomness and the network taken away, and in a Worker", async () => {
  const first = await battery(RG);
  assert.equal(await battery(RG), first);
  const saved = { now: Date.now, random: Math.random, fetch: globalThis.fetch, DateC: globalThis.Date };
  const boom = () => { throw new Error("record-grammar reached for the clock, randomness or the network"); };
  try {
    Date.now = boom; Math.random = boom; globalThis.fetch = boom;
    globalThis.Date = new Proxy(saved.DateC, { construct: boom, apply: boom });
    assert.equal(await battery(RG), first);
  } finally {
    Date.now = saved.now; Math.random = saved.random; globalThis.fetch = saved.fetch; globalThis.Date = saved.DateC;
  }
  const inWorker = await new Promise((resolve, reject) => {
    const w = new Worker(`import(${JSON.stringify(MODULE)}).then(async (RG) => {
        const { parentPort } = await import("node:worker_threads");
        parentPort.postMessage(await (${BATTERY})(RG)); });`, { eval: true, type: "module" });
    w.once("message", (m) => { resolve(m); w.terminate(); });
    w.once("error", reject);
  });
  assert.equal(inWorker, first);
});

const MOVED = ["BUNDLE_ID_RE", "ANN_ID_RE", "FILENAME_RE", "ISO_TS_RE", "OBJECT_TYPES", "LEGACY_TYPE_ALIASES",
  "normalizeType", "CORE_FIELDS", "FORBIDDEN_ALIASES", "parseFrontmatter", "canonicalJson", "NON_MEMBER_AUTHORS",
  "ACTOR_CLASSES", "MACHINE_AUTHOR_PREFIX", "MACHINE_CLASS_PREFIX", "MACHINE_STAMP_PREFIXES", "isMachineStamp",
  "isMachineIdentity", "BASIS_ROLES", "BASIS_GRADES", "GRADE_AXES", "TESTIMONY_GRADE", "GRADE_SOURCES",
  "EARNED_GRADE_SOURCES", "EARNED_CAPTURE_CEILING", "UNREACHABLE_CAPTURE_GRADE", "isPublicHttpsLocator", "createSha256",
  "sha256HexSync"];

test("R26 every name the catalogue re-exports is the same binding as record-grammar's", () => {
  assert.deepEqual(Object.keys(RG).sort(), [...MOVED, "b64ToBytes"].sort());
  for (const n of MOVED) {
    assert.ok(n in CATALOGUE, `${n} re-exported`);
    assert.ok(CATALOGUE[n] === RG[n], `${n} is one binding`);
  }
  /* b64ToBytes is read only inside the catalogue, so it is not re-exported. */
  assert.ok(!("b64ToBytes" in CATALOGUE));
});

test("R27 no place is named in anything the module provides", () => {
  const strings = [];
  const walk = (v) => {
    if (typeof v === "string") strings.push(v);
    else if (v instanceof RegExp) strings.push(v.source);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") { for (const [k, x] of Object.entries(v)) { strings.push(k); walk(x); } }
  };
  Object.values(RG).forEach(walk);
  const r = RG.parseFrontmatter("---\n  status: x\na: 1\na: 2\n- z\n?\n---");
  for (const x of r.findings) strings.push(x.message, ...(x.repairs || []));
  for (const bad of [undefined, "x", {}]) { try { RG.createSha256().update(bad); } catch (e) { strings.push(e.message); } }
  try { RG.b64ToBytes("*"); } catch (e) { strings.push(e.message); }
  assert.ok(strings.length > 100);
  const PLACES = /oakland|alameda|california|berkeley|san francisco|county|city of/i;
  for (const s of strings) assert.ok(!PLACES.test(s), s);
});
