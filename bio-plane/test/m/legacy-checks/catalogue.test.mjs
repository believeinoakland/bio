/* legacy-checks: the catalogue's own tests (K631). The module has no requirements file (a legacy module, P7), so each
   test names the plan entry it proves: T18 layer 1 (N-A1's share, the `PLN-` type's states and `proposalLabel`'s two
   subjects; §1b's grammars seam; the deletions) and T19 layer 1 (`build/plan/current.md`: rule 2's wrapper over
   record-grammar's `checkBundle` with `LEGACY_GRAMMARS`, the re-exports record-grammar R26/R41 pin, the deletions and
   the re-pointed `where`s). Every test reads the catalogue's exports; none reads its source text. */
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

/* T19 layer 1 (`build/plan/current.md`, legacy-checks): each name below has its one home in its owner, and the
   catalogue no longer exports it. The owner's own copy is tested by that owner. */
const T19_DELETED = {
  SUGGEST_LEVELS: "run-productions", CIVICOS_CONTACT_URL: "acquisition", civicosUserAgent: "acquisition",
  RENDER_CAPTURE_CHECKS: "acquisition", DRIVE_CAPTURE_CHECKS: "acquisition and monitoring",
  isSufficiencyClaimed: "nobody (no reader; sufficiencyClaimState is the one predicate)",
};

test("T19 deletions: SUGGEST_LEVELS, the CivicOS user agent, C-83, C-48 and isSufficiencyClaimed are no longer the catalogue's", () => {
  for (const [name, owner] of Object.entries(T19_DELETED)) assert.equal(name in CAT, false, `${name} (${owner})`);
});

test("T19 deletions: sufficiencyClaimState still answers 'claimed' for a named member and only for one", () => {
  const { sufficiencyClaimState, SUFFICIENCY_UNCLAIMED } = CAT;
  assert.equal(sufficiencyClaimState("ada"), "claimed");
  assert.equal(sufficiencyClaimState(SUFFICIENCY_UNCLAIMED), "unclaimed");
  assert.equal(sufficiencyClaimState(""), "unstated");
  assert.equal(sufficiencyClaimState("token:ai"), "machine_stamped");
});

/* The `where`s re-pointed in T19 to the file their code lives in now: each names a function and a DEC-49 region that
   exist there, and the region holds the row's code as a literal (the guard's own reading of a `where`). */
test("T19 wheres: C-28.13 and the release rows name a live region that mints their code", async () => {
  const { readFileSync } = await import("node:fs");
  const rows = [CAT.CAPTURE_REQUEST_CHECKS.CAPTURE_NOT_DRAINING, CAT.MACHINE_FENCE_CHECKS.MACHINE_CANNOT_RELEASE,
    CAT.ACT_SHAPE_CHECKS.NO_ACKNOWLEDGMENT, CAT.ACT_SHAPE_CHECKS.NO_MITIGATION, CAT.ACT_SHAPE_CHECKS.ENTRY_REQUIREMENTS];
  const codes = ["CAPTURE_NOT_DRAINING", "MACHINE_CANNOT_RELEASE", "NO_ACKNOWLEDGMENT", "NO_MITIGATION", "ENTRY_REQUIREMENTS"];
  rows.forEach((row, i) => {
    const m = /^(\S+) (\S+) > ([\w-]+)$/.exec(row.where);
    assert.ok(m, row.where);
    const src = readFileSync(new URL(`../../../${m[1]}`, import.meta.url), "utf8");
    assert.ok(src.includes(m[2]), `${m[1]} defines ${m[2]}`);
    const a = src.indexOf(`DEC-49 REGION ${m[3]}`), b = src.indexOf(`END DEC-49 REGION ${m[3]}`);
    assert.ok(a >= 0 && b > a, `${m[3]} is marked in ${m[1]}`);
    assert.ok(src.slice(a, b).includes(`"${codes[i]}"`), `${m[3]} mints ${codes[i]}`);
  });
});

/* ---- record-grammar R26's cross-module half (B3, K638) ---- */

const REEXPORTED = ["BUNDLE_ID_RE", "ANN_ID_RE", "FILENAME_RE", "ISO_TS_RE", "OBJECT_TYPES", "LEGACY_TYPE_ALIASES",
  "normalizeType", "CORE_FIELDS", "FORBIDDEN_ALIASES", "parseFrontmatter", "canonicalJson", "NON_MEMBER_AUTHORS",
  "ACTOR_CLASSES", "MACHINE_AUTHOR_PREFIX", "MACHINE_CLASS_PREFIX", "MACHINE_STAMP_PREFIXES", "isMachineStamp",
  "isMachineIdentity", "BASIS_ROLES", "BASIS_GRADES", "GRADE_AXES", "TESTIMONY_GRADE", "GRADE_SOURCES",
  "EARNED_GRADE_SOURCES", "EARNED_CAPTURE_CEILING", "UNREACHABLE_CAPTURE_GRADE", "isPublicHttpsLocator",
  "createSha256", "sha256HexSync"];

/* record-grammar R41 (T19, B4): the 17 names its R28 and R30–R38 move, re-exported the same way. `checkBundle` is the
   one record-grammar name the catalogue exports as its own binding: rule 2's wrapper (tested below). */
const REEXPORTED_T19 = ["INQUIRY_TITLE_MAX", "deriveInquiryTitle", "inquiryQuestionOf", "HEADINGS", "HEADINGS_WHEN",
  "isCaseMemberBytes", "vocabFor", "STATES", "sectionText", "LAW_PROPOSAL_STATES", "lawProposalState", "PROPOSAL_STATES",
  "proposalLabel", "CONTENT_MINTED_BY_PLANE", "CONTENT_MINT_STATES", "contentMintState", "EXTENSION_ARMS"];

test("R26 R41 every one of the 46 names the catalogue re-exports is record-grammar's own binding, checkBundle is the catalogue's own wrapper, and b64ToBytes is not re-exported", async () => {
  const RG = await import("../../../src/record-grammar/index.mjs");
  assert.equal(REEXPORTED.length, 29);
  assert.equal(REEXPORTED_T19.length, 17);
  for (const name of [...REEXPORTED, ...REEXPORTED_T19]) {
    assert.ok(name in RG, `record-grammar provides ${name}`);
    assert.ok(name in CAT, `the catalogue re-exports ${name}`);
    assert.equal(CAT[name], RG[name], name);
  }
  const shared = Object.keys(RG).filter((n) => n in CAT).sort();
  assert.deepEqual(shared, [...REEXPORTED, ...REEXPORTED_T19, "checkBundle"].sort(),
    "no other record-grammar name is exported by the catalogue");
  assert.notEqual(CAT.checkBundle, RG.checkBundle, "the catalogue's checkBundle is rule 2's wrapper");
  assert.equal("isMachineMinted" in CAT, false, "isMachineMinted is deleted, not re-exported (K750)");
  assert.equal("isMachineMinted" in RG, false, "and record-grammar does not hold it (R37)");
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

/* ---- rule 2's wrapper (T19, B4, J2): the catalogue's checkBundle is record-grammar's with LEGACY_GRAMMARS ---- */

const LEGACY_SLOTS = [["C-2.7"], ["C-18.6", "C-18.7"], ["C-6.1"], ["C-15.1"], ["C-2.8"], ["C-2.9", "C-9.1"]];

test("rule 2 LEGACY_GRAMMARS fills six of record-grammar's EXTENSION_ARMS slots, each claimed whole, frozen", async () => {
  const { LEGACY_GRAMMARS } = CAT;
  assert.ok(Object.isFrozen(LEGACY_GRAMMARS));
  assert.deepEqual(LEGACY_GRAMMARS.map((g) => [...g.ids]), LEGACY_SLOTS);
  for (const g of LEGACY_GRAMMARS) {
    assert.ok(Object.isFrozen(g) && Object.isFrozen(g.ids));
    assert.equal(g.module, "legacy-checks");
    assert.equal(typeof g.arm, "function");
    const slot = EXTENSION_ARMS.find((a) => a.ids.includes(g.ids[0]));
    assert.ok(slot, g.ids.join());
    assert.deepEqual([...slot.ids], [...g.ids], `${slot.name} is claimed whole`);
  }
  assert.equal(new Set(LEGACY_GRAMMARS.flatMap((g) => g.ids)).size, 8);
  assert.equal(LEGACY_GRAMMARS.length, EXTENSION_ARMS.length, "every slot is filled");
});

test("rule 2 the wrapper answers exactly record-grammar's checkBundle given LEGACY_GRAMMARS (no grammars, and a caller's grammar taking a slot)", async () => {
  const RG = await import("../../../src/record-grammar/index.mjs");
  const inq = "---\nid: INQ-2026-0001-q\nobject_type: inquiry\nschema: inquiry@1\ncurrent_state: concluded\nsurfaced_by: robot\n"
    + "references:\n  - rel: supersedes\n    target: INQ-2026-0002-p\n    status: confirmed\n---\n\n## Question\n\nq\n";
  const proj = "---\nid: PROJ-2026-0001-p\nobject_type: project\nschema: project@1\ncurrent_state: closed\nworkproduct_state: distributed\n---\n";
  for (const [folderName, md] of [[INFO, infoMd], ["INQ-2026-0001-q", inq], ["PROJ-2026-0001-p", proj]]) {
    const input = () => ({ folderName, files: new Map([["bundle.md", md]]), sha256: async () => "0".repeat(64), nowMs: 0 });
    const want = await RG.checkBundle(input(), { grammars: CAT.LEGACY_GRAMMARS });
    const got = await checkBundle(input());
    assert.deepEqual(got.findings.map(key), want.findings.map(key), folderName);
    assert.ok(got.findings.length > 0, folderName);
    const ids = new Set(got.findings.map((f) => f.check));
    if (folderName === "INQ-2026-0001-q") for (const id of ["C-2.8", "C-6.1", "C-15.1"]) assert.ok(ids.has(id), id);
    if (folderName === "PROJ-2026-0001-p") for (const id of ["C-2.9", "C-9.1"]) assert.ok(ids.has(id), id);
    const mine = { module: "capture", ids: ["C-2.7"], arm: (ctx, findings) => findings.push({ check: "C-2.7", severity: "warn", message: "caller's" }) };
    const rest = CAT.LEGACY_GRAMMARS.filter((g) => !g.ids.includes("C-2.7"));
    const want2 = await RG.checkBundle(input(), { grammars: [mine, ...rest] });
    const got2 = await checkBundle(input(), { grammars: [mine] });
    assert.deepEqual(got2.findings.map(key), want2.findings.map(key), `${folderName}, the caller's C-2.7 in its slot`);
  }
});

test("J2 the held C-2.7 copy runs only when the caller's grammars claim no C-2.7: a caller's C-2.7 grammar replaces it", async () => {
  const held = (await run()).findings.filter((f) => f.check === "C-2.7");
  assert.ok(held.length > 0, "with no grammars, the held copy judges the information extension");
  let ran = 0;
  const r = await run({ grammars: [{ module: "capture", ids: ["C-2.7"], arm: () => { ran++; } }] });
  assert.equal(ran, 1, "the caller's arm runs once");
  assert.deepEqual(r.findings.filter((f) => f.check === "C-2.7"), [], "and the held copy not at all");
});

test("rule 2 a refusal of the caller's grammars names the position in the caller's own list", async () => {
  await assert.rejects(run({ grammars: [{ module: "m", ids: ["C-2.7", "C-18.6", "C-18.7"], arm() {} }] }),
    (e) => e instanceof RangeError && /opts\.grammars\[0\]/.test(e.message));
});

test("T19 deletions: isMachineMinted is gone (K750), MONITOR_FREQ is no longer exported, and C-2.7 is not a catalogue export", () => {
  for (const name of ["isMachineMinted", "MONITOR_FREQ", "checkInformationExtension", "INFO_ENUMS"]) assert.equal(name in CAT, false, name);
});
