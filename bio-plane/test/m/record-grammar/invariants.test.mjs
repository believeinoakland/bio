/* record-grammar's invariants at its interface: pure (R24), one binding per name, no place named (R27). R26 and R41,
   the catalogue's re-exports, retired with the catalogue at T19's close (K855, K863). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";
import * as RG from "../../../src/record-grammar/index.mjs";
import * as IDS from "../../../src/record-grammar/ids.mjs";
import * as TYPES from "../../../src/record-grammar/types.mjs";
import * as FRONTMATTER from "../../../src/record-grammar/frontmatter.mjs";
import * as JSON_ from "../../../src/record-grammar/json.mjs";
import * as ACTORS from "../../../src/record-grammar/actors.mjs";
import * as GRADES from "../../../src/record-grammar/grades.mjs";
import * as LOCATOR from "../../../src/record-grammar/locator.mjs";
import * as SHA256 from "../../../src/record-grammar/sha256.mjs";
import * as TITLES from "../../../src/record-grammar/titles.mjs";
import * as DOCUMENT from "../../../src/record-grammar/document.mjs";
import * as LABELS from "../../../src/record-grammar/labels.mjs";
import * as ACTS from "../../../src/record-grammar/acts.mjs";
import * as BUNDLE from "../../../src/record-grammar/bundle.mjs";

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
  out.push(RG.ID_TABLE, String(RG.idPattern("EVT")), RG.isHypothesisId("HYP-2026-10000"));
  out.push(RG.deriveInquiryTitle("  a   question\\nmore"), RG.inquiryQuestionOf("x\\n## Question\\nq\\n## B"), RG.vocabFor(RG.STATES, "problem"));
  out.push(RG.sectionText("## A\\na\\n## B", "## A"), RG.isCaseMemberBytes({ published_strength: [{ axis: "a" }, { axis: "b" }] }));
  for (const w of ["token:x", "alice", "", "plane"]) out.push(RG.proposalLabel(w, "standard"), RG.contentMintState(w));
  const sha = async (v) => RG.createSha256().update(typeof v === "string" ? new TextEncoder().encode(v) : v).hex();
  const files = new Map([["bundle.md", "---\\nid: INFO-2026-0001-a\\nobject_type: information\\n---\\n## Summary\\n## Odd"],
    ["PROMOTING-x.json", "{}"], ["PENDING_PROMOTION.json", JSON.stringify({ created: "2026-01-01T00:00:00Z" })]]);
  out.push(await RG.checkBundle({ folderName: "INFO-2026-0001-a", files, sha256: sha, nowMs: 1780000000000 }));
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
  "sha256HexSync", "INQUIRY_TITLE_MAX", "deriveInquiryTitle", "inquiryQuestionOf", "HEADINGS", "HEADINGS_WHEN",
  "isCaseMemberBytes", "vocabFor", "STATES", "sectionText", "LAW_PROPOSAL_STATES", "lawProposalState", "PROPOSAL_STATES",
  "proposalLabel", "CONTENT_MINTED_BY_PLANE", "CONTENT_MINT_STATES", "contentMintState"];
/* Provided here from the first without a catalogue twin: `checkBundle`, `EXTENSION_ARMS`, the shared act rows (R29) and
   T33's id table (R46–R48). */
const OWN = ["b64ToBytes", "SHARED_ACT_CHECKS", "EXTENSION_ARMS", "checkBundle", "ID_TABLE", "idPattern", "isHypothesisId"];

test("one binding per name: the module's entry answers each provided name with the one binding its part holds", () => {
  assert.deepEqual(Object.keys(RG).sort(), [...MOVED, ...OWN].sort());
  const parts = [IDS, TYPES, FRONTMATTER, JSON_, ACTORS, GRADES, LOCATOR, SHA256, TITLES, DOCUMENT, LABELS, ACTS, BUNDLE];
  for (const n of Object.keys(RG)) {
    const holders = parts.filter((p) => n in p);
    assert.equal(holders.length, 1, `${n} is held once`);
    assert.ok(holders[0][n] === RG[n], `${n} is one binding`);
  }
  /* A second import of the entry is the same module instance, so every reader gets the same objects. */
  return import("../../../src/record-grammar/index.mjs").then((again) => {
    for (const n of Object.keys(RG)) assert.ok(again[n] === RG[n], n);
  });
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
