/* legacy-checks: the catalogue's own tests (K631). The module has no requirements file (a legacy module, P7), so each
   test names the plan entry it proves (`build/plan/current.md` T18 layer 1): N-A1's share (the `PLN-` type's states
   and `proposalLabel`'s two subjects, `action-fold/deltas/legacy-checks.md`), §1b's `checkBundle` grammars seam, and
   the deletions. Every test reads the catalogue's exports; none reads its source text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as CAT from "../../../checks/bio-checks.mjs";

const { STATES, OBJECT_TYPES, BUNDLE_ID_RE, ANN_ID_RE, normalizeType, PROPOSAL_STATES, proposalLabel, checkBundle,
        EXTENSION_ARMS } = CAT;

/* ---- N-A1: the `PLN-` record type ---- */

test("N-A1 a PLN- id parses and types as action_plan, through the catalogue's grammar", () => {
  assert.match("PLN-2026-0001-river-plan", BUNDLE_ID_RE);
  assert.match("PLN-2026-0001-river-plan.ann-20260930T120000Z-a-note", ANN_ID_RE);
  assert.equal(OBJECT_TYPES.PLN, "action_plan");
  assert.equal(normalizeType("action_plan"), "action_plan");
});

test("N-A1 action_plan's machine: open and closed are legal, open → closed is the one edge, nothing leaves closed", () => {
  const m = STATES.action_plan;
  assert.deepEqual(m.legal, ["open", "closed"]);
  assert.deepEqual(m.edges, { open: ["closed"], closed: [] });
  const edges = Object.entries(m.edges).flatMap(([from, tos]) => tos.map((to) => `${from}>${to}`));
  assert.deepEqual(edges, ["open>closed"]);
  for (const s of Object.keys(m.edges)) assert.ok(m.legal.includes(s), s);
});

test("N-A1 checkBundle admits the action_plan@1 schema stamp, as every Action-layer type at schema 1", async () => {
  const md = "---\nid: PLN-2026-0001-p\nobject_type: action_plan\nschema: action_plan@1\ncurrent_state: open\n---\n\n## x\n";
  const { findings } = await checkBundle({ folderName: "PLN-2026-0001-p", files: new Map([["bundle.md", md]]),
    sha256: async () => "0".repeat(64) });
  assert.deepEqual(findings.filter((f) => f.check === "C-2.5"), []);
  const unknown = md.replace("action_plan@1", "action_plan@9");
  const r = await checkBundle({ folderName: "PLN-2026-0001-p", files: new Map([["bundle.md", unknown]]),
    sha256: async () => "0".repeat(64) });
  assert.ok(r.findings.some((f) => f.check === "C-2.5"), "an unknown stamp is still refused");
});

/* ---- N-A1: proposalLabel's two subjects ---- */

const MACHINE = "token:ai";
const SUBJECTS = {
  plan_option: { noun: /option/, not: /not an option until a member adopts it/ },
  communication: { noun: /communication|draft/, not: /nobody has approved or sent it/i },
};

test("N-A1 proposalLabel answers plan_option and communication in each of the three states, each saying what the proposal is not", () => {
  for (const [subject, want] of Object.entries(SUBJECTS)) {
    const table = PROPOSAL_STATES[subject];
    assert.ok(Object.isFrozen(table), subject);
    assert.deepEqual(Object.keys(table).sort(), ["machine_proposed", "member_proposed", "unstated"], subject);
    const cases = [[MACHINE, "machine_proposed", true], ["ada", "member_proposed", false], ["", "unstated", false],
                   [null, "unstated", false], [undefined, "unstated", false]];
    for (const [by, state, machine] of cases) {
      const l = proposalLabel(by, subject);
      assert.deepEqual(l, { by: by ?? null, state, machine_work: machine, says: table[state] }, `${subject} ${by}`);
      assert.match(l.says, want.noun, `${subject} ${state}`);
      assert.match(l.says, want.not, `${subject} ${state}`);
    }
    assert.match(table.machine_proposed, /machine work, labelled as machine work/, subject);
    assert.match(table.member_proposed, /the record holds who/, subject);
    assert.match(table.unstated, /^the record does not say who/, subject);
  }
});

test("N-A1 proposalLabel's table is closed: the subjects are exactly the seven, and an unknown subject throws", () => {
  assert.deepEqual(Object.keys(PROPOSAL_STATES).sort(),
    ["communication", "comparison", "filing_draft", "governing_laws", "plan_option", "standard", "theory"]);
  assert.ok(Object.isFrozen(PROPOSAL_STATES));
  for (const bad of ["plan", "option", "", null, undefined, 3, "__proto__", "toString"])
    assert.throws(() => proposalLabel("ada", bad), RangeError, String(bad));
});

/* ---- §1b: the checkBundle grammars seam ---- */

/* An information bundle at `verified` with no information extension: the built-in C-2.7 arm raises several findings,
   and the other arms raise theirs, so the tests below can see what a claim removes and where a registered arm runs. */
const INFO = "INFO-2026-0001-doc";
const infoMd = `---
id: ${INFO}
object_type: information
schema: information@2
title: A document
current_state: verified
---

## Summary

text
`;
const run = (opts) => checkBundle({ folderName: INFO, files: new Map([["bundle.md", infoMd]]),
  sha256: async () => "0".repeat(64), nowMs: Date.parse("2026-09-30T00:00:00Z") }, opts);
const key = (f) => `${f.check}|${f.severity}|${f.message}`;

test("§1b no grammars, an empty list and an absent opts answer the same findings", async () => {
  const base = (await run()).findings.map(key);
  assert.ok(base.some((k) => k.startsWith("C-2.7|")), "the fixture raises C-2.7");
  assert.deepEqual((await run({})).findings.map(key), base);
  assert.deepEqual((await run({ grammars: [] })).findings.map(key), base);
});

test("§1b a registered grammar claiming a built-in arm's ids replaces that arm: the arm is skipped, the grammar runs in its place over the same ctx", async () => {
  const base = (await run()).findings;
  const first = base.findIndex((f) => f.check === "C-2.7");
  const seen = [];
  const stub = { module: "stub", ids: ["C-2.7"], arm(ctx, findings) {
    seen.push([ctx.folderName, ctx.fm?.object_type, typeof ctx.body]);
    findings.push({ check: "C-2.7", severity: "error", message: "stub arm ran" });
  } };
  const r = await run({ grammars: [stub] });
  assert.deepEqual(seen, [[INFO, "information", "string"]], "run once, over the parsed bundle");
  const without = base.filter((f) => f.check !== "C-2.7").map(key);
  assert.deepEqual(r.findings.filter((f) => f.message !== "stub arm ran").map(key), without,
    "the built-in C-2.7 arm never ran, every other finding is unchanged");
  assert.equal(r.findings.findIndex((f) => f.message === "stub arm ran"), first, "in the built-in arm's place");
  assert.equal(r.pass, false);
});

test("§1b a grammar whose arm re-raises the built-in findings leaves the answer identical (a moved arm runs once)", async () => {
  const base = await run();
  const moved = base.findings.filter((f) => f.check === "C-2.7");
  const r = await run({ grammars: [{ module: "stub", ids: ["C-2.7"], arm: (ctx, findings) => { findings.push(...moved); } }] });
  assert.deepEqual(r.findings.map(key), base.findings.map(key));
  assert.equal(r.pass, base.pass);
});

test("§1b an async arm is awaited, and a grammar claiming no built-in arm's ids runs after the built-in type arms, in list order", async () => {
  const order = [];
  const g = (module, ids) => ({ module, ids, async arm(ctx, findings) {
    await null; order.push(module); findings.push({ check: ids[0], severity: "warning", message: module });
  } });
  const base = (await run()).findings;
  const r = await run({ grammars: [g("a", ["C-900.1"]), g("b", ["C-901.1"])] });
  assert.deepEqual(order, ["a", "b"]);
  const at = (m) => r.findings.findIndex((f) => f.message === m);
  assert.equal(at("b"), at("a") + 1);
  assert.deepEqual(r.findings.filter((f) => f.message !== "a" && f.message !== "b").map(key), base.map(key),
    "no built-in arm is skipped");
  const lastC27 = r.findings.map((f) => f.check).lastIndexOf("C-2.7");
  assert.ok(at("a") > lastC27, "after the type arms");
});

test("§1b every built-in type arm's claim is its whole id list; a grammar claiming part of one is a caller's defect and throws", async () => {
  assert.ok(Array.isArray(EXTENSION_ARMS) && EXTENSION_ARMS.length > 0);
  assert.ok(Object.isFrozen(EXTENSION_ARMS));
  const all = EXTENSION_ARMS.flatMap((a) => a.ids);
  assert.equal(new Set(all).size, all.length, "no id is claimed by two built-in arms");
  for (const a of EXTENSION_ARMS) {
    assert.equal(typeof a.name, "string");
    assert.ok(a.ids.length > 0 && a.ids.every((id) => /^C-\d+(\.\d+)?$/.test(id)), a.name);
  }
  const multi = EXTENSION_ARMS.find((a) => a.ids.length > 1);
  if (multi) await assert.rejects(run({ grammars: [{ module: "stub", ids: [multi.ids[0]], arm() {} }] }), RangeError);
});

test("§1b a malformed grammars list throws before any arm runs, naming what is wrong", async () => {
  const bad = [
    "no", [null], [{ module: "", ids: ["C-2.7"], arm() {} }], [{ module: "m", ids: [], arm() {} }],
    [{ module: "m", ids: "C-2.7", arm() {} }], [{ module: "m", ids: ["C-2.7"] }], [{ module: "m", ids: [7], arm() {} }],
    [{ module: "m", ids: ["C-2.7"], arm() {} }, { module: "n", ids: ["C-2.7"], arm() {} }],
  ];
  for (const grammars of bad) {
    let ran = false;
    const guard = Array.isArray(grammars)
      ? grammars.map((g) => (g && typeof g.arm === "function" ? { ...g, arm: () => { ran = true; } } : g)) : grammars;
    await assert.rejects(run({ grammars: guard }), (e) => e instanceof TypeError || e instanceof RangeError,
      JSON.stringify(grammars));
    assert.equal(ran, false);
  }
});

/* ---- the deletions ---- */

test("deletions: LAW_LEVELS and CASE_MEMBER_ROLES are no longer the catalogue's (jurisdictions and ratification hold them)", () => {
  assert.equal("LAW_LEVELS" in CAT, false);
  assert.equal("CASE_MEMBER_ROLES" in CAT, false);
});

/* ---- record-grammar R26's cross-module half (B3, K638) ---- */

const REEXPORTED = ["BUNDLE_ID_RE", "ANN_ID_RE", "FILENAME_RE", "ISO_TS_RE", "OBJECT_TYPES", "LEGACY_TYPE_ALIASES",
  "normalizeType", "CORE_FIELDS", "FORBIDDEN_ALIASES", "parseFrontmatter", "canonicalJson", "NON_MEMBER_AUTHORS",
  "ACTOR_CLASSES", "MACHINE_AUTHOR_PREFIX", "MACHINE_CLASS_PREFIX", "MACHINE_STAMP_PREFIXES", "isMachineStamp",
  "isMachineIdentity", "BASIS_ROLES", "BASIS_GRADES", "GRADE_AXES", "TESTIMONY_GRADE", "GRADE_SOURCES",
  "EARNED_GRADE_SOURCES", "EARNED_CAPTURE_CEILING", "UNREACHABLE_CAPTURE_GRADE", "isPublicHttpsLocator",
  "createSha256", "sha256HexSync"];

test("R26 every one of the 29 names the catalogue re-exports is record-grammar's own binding, and b64ToBytes is not re-exported", async () => {
  const RG = await import("../../../src/record-grammar/index.mjs");
  assert.equal(REEXPORTED.length, 29);
  for (const name of REEXPORTED) {
    assert.ok(name in RG, `record-grammar provides ${name}`);
    assert.ok(name in CAT, `the catalogue re-exports ${name}`);
    assert.equal(CAT[name], RG[name], name);
  }
  const shared = Object.keys(RG).filter((n) => n in CAT).sort();
  assert.deepEqual(shared, [...REEXPORTED].sort(), "no other record-grammar name is exported by the catalogue");
  assert.ok("b64ToBytes" in RG);
  assert.equal("b64ToBytes" in CAT, false);
});

test("N-A1 C-2.5's schema stamp admits a type name holding '_' and still refuses a stamp of another type", async () => {
  const md = (stamp) => `---\nid: PLN-2026-0001-p\nobject_type: action_plan\nschema: ${stamp}\ncurrent_state: open\n---\n`;
  const c25 = async (stamp) => (await checkBundle({ folderName: "PLN-2026-0001-p", files: new Map([["bundle.md", md(stamp)]]),
    sha256: async () => "0".repeat(64) })).findings.filter((f) => f.check === "C-2.5").map((f) => f.message);
  assert.deepEqual(await c25("action_plan@1"), []);
  assert.match((await c25("goal@1")).join(), /does not match object_type/);
  assert.match((await c25("_plan@1")).join(), /is not of the form/);
  assert.match((await c25("action-plan@1")).join(), /is not of the form/);
});

test("§1b one grammar replaces one arm: a claim spanning two built-in arms throws", async () => {
  const [a, b] = EXTENSION_ARMS;
  await assert.rejects(run({ grammars: [{ module: "m", ids: [...a.ids, ...b.ids], arm() {} }] }), RangeError);
});
