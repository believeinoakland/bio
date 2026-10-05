/* record-grammar at its interface: the id grammar and the type vocabulary (R1–R5), and T33's one id table (R46–R48). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUNDLE_ID_RE, ANN_ID_RE, FILENAME_RE, ISO_TS_RE, OBJECT_TYPES, LEGACY_TYPE_ALIASES, normalizeType, ID_TABLE,
  idPattern, isHypothesisId } from "../../../src/record-grammar/index.mjs";

const PREFIXES = ["INFO", "PROB", "FOCUS", "INQ", "PROJ", "ACTN", "BIAS", "STD", "CONF", "CONS", "ESC", "ASP", "GOAL", "PLN"];
const SLUGS_OK = ["a", "a1", "abc-def", "a-b-c", "0-9", "x2-y3-z4"];
const SLUGS_BAD = ["", "-a", "a-", "a--b", "A", "a_b", "a.b", "a b", "é"];
const ANN = ".ann-20260930T120000Z-note";

/* The counter is ID_TABLE's sequential form (R46): four or more digits, no ceiling. */
const COUNTERS_OK = ["0001", "9999", "10000", "00011", "123456789"];
const COUNTERS_BAD = ["", "1", "001", "999", "0a01", "１２３４"];

test("R1 BUNDLE_ID_RE: exactly <PREFIX>-<4 digits>-<4 or more digits>-<slug>, over the whole prefix set", () => {
  for (const p of PREFIXES) {
    for (const s of SLUGS_OK) assert.ok(BUNDLE_ID_RE.test(`${p}-2026-0001-${s}`), `${p} ${s}`);
    for (const s of SLUGS_BAD) assert.ok(!BUNDLE_ID_RE.test(`${p}-2026-0001-${s}`), `${p} bad slug '${s}'`);
    for (const c of COUNTERS_OK) assert.ok(BUNDLE_ID_RE.test(`${p}-2026-${c}-a`), `${p} counter ${c}`);
    for (const c of COUNTERS_BAD) assert.ok(!BUNDLE_ID_RE.test(`${p}-2026-${c}-a`), `${p} bad counter '${c}'`);
    /* The 10,000th id of a year is accepted (R46). */
    assert.ok(BUNDLE_ID_RE.test(`${p}-2026-10000-x`), `${p} 10,000th`);
    for (const bad of [`${p}-26-0001-a`, `${p}-2026-001-a`, `${p}-20266-0001-a`, `${p}-2026-0001`, `${p}-2026-10000`,
      `${p}-2026-0001-`, `${p.toLowerCase()}-2026-0001-a`, ` ${p}-2026-0001-a`, `${p}-2026-0001-a `, `${p}-2026-0001-a\n`,
      `${p}-2026-0001-a${ANN}`, `${p}-2026-abcdefghijklmnop-a`])
      assert.ok(!BUNDLE_ID_RE.test(bad), bad);
  }
  for (const p of ["ENT", "CASE", "PLAN", "PL", "INFOS", "XINFO", "RUN", "", "EVT", "HYP", "CALC", "STQ"])
    assert.ok(!BUNDLE_ID_RE.test(`${p}-2026-0001-a`), p);
});

test("R1 ANN_ID_RE: exactly a bundle id and .ann-<8 digits>T<6 digits>Z-<slug>, with the same prefix set", () => {
  for (const p of PREFIXES) {
    for (const s of SLUGS_OK) assert.ok(ANN_ID_RE.test(`${p}-2026-0001-a.ann-20260930T120000Z-${s}`), `${p} ${s}`);
    for (const s of SLUGS_BAD) assert.ok(!ANN_ID_RE.test(`${p}-2026-0001-a.ann-20260930T120000Z-${s}`), `${p} '${s}'`);
    for (const bad of [`${p}-2026-0001-a`, `${p}-2026-0001-a.ann-2026093T120000Z-x`, `${p}-2026-0001-a.ann-20260930T12000Z-x`,
      `${p}-2026-0001-a.ann-20260930T120000-x`, `${p}-2026-0001-a.ann-20260930120000Z-x`, `${p}-2026-0001-a.note-20260930T120000Z-x`,
      `${p}-2026-0001-A${ANN}`, `${p}-2026-0001-a${ANN}\n`])
      assert.ok(!ANN_ID_RE.test(bad), bad);
  }
  for (const p of PREFIXES) for (const c of COUNTERS_OK) assert.ok(ANN_ID_RE.test(`${p}-2026-${c}-a${ANN}`), `${p} ${c}`);
  for (const p of PREFIXES) for (const c of COUNTERS_BAD) assert.ok(!ANN_ID_RE.test(`${p}-2026-${c}-a${ANN}`), `${p} '${c}'`);
  for (const p of ["ENT", "PLAN", "X", "EVT", "HYP"]) assert.ok(!ANN_ID_RE.test(`${p}-2026-0001-a${ANN}`), p);
});

test("R1 both patterns carry the same prefix set, each a sequential prefix of ID_TABLE, built from idPattern", () => {
  const form = new Map(ID_TABLE.map((e) => [e.prefix, e.form]));
  for (const p of PREFIXES) {
    assert.equal(form.get(p), "sequential", p);
    assert.ok(BUNDLE_ID_RE.source.includes(idPattern(p).source.slice(1, -1)), p);
    assert.ok(ANN_ID_RE.source.includes(idPattern(p).source.slice(1, -1)), p);
  }
  /* No prefix of the table outside R1's set reaches either pattern, in either form. */
  for (const { prefix, form: f } of ID_TABLE) {
    if (PREFIXES.includes(prefix)) continue;
    const core = f === "opaque" ? `${prefix}-2026-abcdefghij012345` : `${prefix}-2026-0001`;
    assert.ok(!BUNDLE_ID_RE.test(`${core}-a`) && !ANN_ID_RE.test(`${core}-a${ANN}`), prefix);
  }
});

test("R2 FILENAME_RE: a non-empty string of [A-Za-z0-9._-] only", () => {
  const allowed = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-");
  for (let c = 0; c < 0x250; c++) {
    const ch = String.fromCharCode(c);
    assert.equal(FILENAME_RE.test(`a${ch}b`), allowed.has(ch), `char ${c}`);
    assert.equal(FILENAME_RE.test(ch), allowed.has(ch), `alone ${c}`);
  }
  assert.ok(!FILENAME_RE.test(""));
  assert.ok(FILENAME_RE.test("bundle.md") && FILENAME_RE.test("..") && FILENAME_RE.test("a_b-c.d"));
  assert.ok(!FILENAME_RE.test("a/b") && !FILENAME_RE.test("a\n") && !FILENAME_RE.test("a\nb"));
});

test("R2 ISO_TS_RE: exactly YYYY-MM-DDTHH:MM:SSZ, no fraction, no offset", () => {
  assert.ok(ISO_TS_RE.test("2026-09-30T12:00:00Z"));
  assert.ok(ISO_TS_RE.test("0000-00-00T00:00:00Z"));
  for (const bad of ["2026-09-30T12:00:00.000Z", "2026-09-30T12:00:00+00:00", "2026-09-30T12:00:00", "2026-09-30 12:00:00Z",
    "2026-09-30t12:00:00Z", "2026-09-30T12:00:00z", "26-09-30T12:00:00Z", "2026-9-30T12:00:00Z", "2026-09-30T12:00Z",
    " 2026-09-30T12:00:00Z", "2026-09-30T12:00:00Z ", "2026-09-30T12:00:00Z\n", "2026-09-30"])
    assert.ok(!ISO_TS_RE.test(bad), bad);
});

const NEW_TYPES = { CALC: "calculation", EVT: "event", LIN: "line", MNY: "money_fact", MSR: "money_set", PFA: "person_fact",
  IDC: "identity_claim", MTI: "member_tie", CHK: "interest_check", HYP: "hypothesis", DUT: "duty", STQ: "standing_question" };

test("R3 OBJECT_TYPES: every prefix of R1 and of T33's new objects to its type, and its keys exactly those", () => {
  assert.deepEqual({ ...OBJECT_TYPES }, { INFO: "information", PROB: "inquiry", FOCUS: "inquiry", INQ: "inquiry", PROJ: "project",
    ACTN: "action", BIAS: "bias", STD: "standard", CONF: "determination", CONS: "consequence", ESC: "escalation",
    ASP: "aspiration", GOAL: "goal", PLN: "action_plan", ...NEW_TYPES });
  assert.deepEqual(Object.keys(OBJECT_TYPES).sort(), [...PREFIXES, ...Object.keys(NEW_TYPES)].sort());
  /* R1's keys are exactly the prefixes both patterns carry. */
  for (const k of PREFIXES) {
    assert.ok(BUNDLE_ID_RE.test(`${k}-2026-0001-a`), k);
    assert.ok(ANN_ID_RE.test(`${k}-2026-0001-a${ANN}`), k);
  }
  /* The new objects' prefixes are all ID_TABLE's, and none is a bundle prefix. */
  const table = new Set(ID_TABLE.map((e) => e.prefix));
  for (const k of Object.keys(NEW_TYPES)) {
    assert.ok(table.has(k), k);
    assert.ok(!BUNDLE_ID_RE.test(`${k}-2026-0001-a`), k);
  }
});

test("R4 LEGACY_TYPE_ALIASES: {problem, focus} -> inquiry, flat", () => {
  assert.deepEqual(LEGACY_TYPE_ALIASES, { problem: "inquiry", focus: "inquiry" });
  for (const v of Object.values(LEGACY_TYPE_ALIASES)) assert.ok(!Object.hasOwn(LEGACY_TYPE_ALIASES, v), `${v} is an alias`);
});

test("R5 normalizeType: an own alias key to its target, anything else unchanged, never throws", () => {
  assert.equal(normalizeType("problem"), "inquiry");
  assert.equal(normalizeType("focus"), "inquiry");
  for (const t of [...new Set(Object.values(OBJECT_TYPES)), "Problem", "FOCUS", "", " problem", "unknown"])
    assert.equal(normalizeType(t), t);
  for (const t of Object.getOwnPropertyNames(Object.prototype)) assert.equal(normalizeType(t), t, t);
  const odd = [undefined, null, 0, 1, NaN, true, false, Symbol("s"), [], ["problem"], {}, Object.create(null),
    { toString() { throw new Error("x"); } }, () => "problem", 10n];
  for (const t of odd) assert.ok(Object.is(normalizeType(t), t), String(typeof t));
});

/* ID_TABLE as T33 holds it (R46): the census of every prefix minted or validated at T33's opening, with T33's new objects
   and the reserved prefixes. Pinned whole. */
const TABLE = [
  ["INFO", "capture"], ["PROB", "inquiry"], ["FOCUS", "inquiry"], ["INQ", "inquiry"], ["PROJ", "promotion"],
  ["ACTN", "actions"], ["BIAS", "bias"], ["STD", "standards"], ["CONF", "conformance"], ["CONS", "consequences"],
  ["ESC", "escalation"], ["ASP", "intent"], ["GOAL", "intent"], ["PLN", "action-plans"],
  ["ENT", "entities"], ["REL", "entities"], ["STDP", "standards"], ["ACT", "conformance"], ["CMP", "conformance"],
  ["FIL", "filings"], ["CPK", "filings"], ["THY", "filings"], ["GATH", "monitoring"], ["THEME", "connections"],
  ["LEAD", "observation-log"], ["TASK", "tasks"],
  ["CASE", "case-authoring"], ["WCD", "case-authoring"], ["DRAFT", "review"], ["RVG", "review"], ["SRC", "sources"],
  ["NOTE", "network-notices"], ["DKT", "docket"], ["TPL", "filing-templates"], ["TPP", "filing-templates"],
  ["TRG", "filing-templates"], ["WIZ", "wizard-scripts"], ["WZP", "wizard-scripts"], ["WEG", "wizard-scripts"],
  ["EVT", "events", "opaque"], ["LIN", "lines", "opaque"], ["MNY", "money", "opaque"], ["PFA", "people", "opaque"],
  ["IDC", "people", "opaque"],
  ["MTI", "people"], ["CHK", "people"], ["MSR", "money"], ["HYP", "hypotheses"], ["DUT", "duties"],
  ["CALC", "calculations"], ["STQ", "answers"],
].map(([prefix, owner, form = "sequential"]) => ({ prefix, owner, form }));
const SEQUENTIAL = TABLE.filter((e) => e.form === "sequential").map((e) => e.prefix);
const OPAQUE = TABLE.filter((e) => e.form === "opaque").map((e) => e.prefix);
const TAIL = "a1b2c3d4e5f6g7h8";

test("R46 ID_TABLE: frozen, one {prefix, owner, form} per prefix, no prefix twice, holding exactly T33's census", () => {
  assert.ok(Object.isFrozen(ID_TABLE));
  for (const e of ID_TABLE) {
    assert.ok(Object.isFrozen(e), e.prefix);
    assert.deepEqual(Object.keys(e).sort(), ["form", "owner", "prefix"], e.prefix);
    assert.match(e.prefix, /^[A-Z]+$/);
    assert.ok(typeof e.owner === "string" && /^[a-z][a-z-]*$/.test(e.owner), e.prefix);
    assert.ok(["sequential", "opaque"].includes(e.form), e.prefix);
  }
  assert.equal(new Set(ID_TABLE.map((e) => e.prefix)).size, ID_TABLE.length);
  assert.deepEqual(ID_TABLE.map((e) => ({ ...e })), TABLE);
  /* R1's prefixes sequential; ENT widened; the five new objects opaque; the reserved seven sequential, with STQ answers'. */
  for (const p of PREFIXES) assert.equal(ID_TABLE.find((e) => e.prefix === p).form, "sequential", p);
  assert.deepEqual(OPAQUE, ["EVT", "LIN", "MNY", "PFA", "IDC"]);
  for (const p of ["MTI", "CHK", "MSR", "HYP", "DUT", "CALC", "STQ", "ENT"]) assert.ok(SEQUENTIAL.includes(p), p);
});

test("R46 every id valid before T33 stays valid; the 10,000th id of every sequential prefix is accepted; the controls refused", () => {
  for (const p of SEQUENTIAL) {
    const re = idPattern(p);
    /* Before T33 every validator read <P>-<4 digits>-<4 digits>: all of those stay valid. */
    for (const n of ["0000", "0001", "0420", "9999"]) assert.ok(re.test(`${p}-2026-${n}`), `${p} ${n}`);
    for (let n = 1; n <= 10000; n += 1111) assert.ok(re.test(`${p}-2026-${String(n).padStart(4, "0")}`), `${p} ${n}`);
    assert.ok(re.test(`${p}-2026-10000`), `${p} 10,000th`);
    assert.ok(re.test(`${p}-1999-123456`), p);
    for (const bad of [`${p}-2026-999`, `${p}-2026-`, `${p}-26-0001`, `${p}-20266-0001`, `${p}-2026-0001-a`, `${p}-2026-${TAIL}`,
      `${p.toLowerCase()}-2026-0001`, ` ${p}-2026-0001`, `${p}-2026-0001\n`])
      assert.ok(!re.test(bad), bad);
  }
  assert.ok(!idPattern("ENT").test("ENT-2026-999"));
  assert.ok(idPattern("ENT").test("ENT-2026-10000"));
  for (const p of OPAQUE) {
    const re = idPattern(p);
    assert.ok(re.test(`${p}-2026-${TAIL}`) && re.test(`${p}-2026-0000000000000000`) && re.test(`${p}-2026-zzzzzzzzzzzzzzzz`), p);
    for (const bad of [`${p}-2026-${TAIL.slice(1)}`, `${p}-2026-${TAIL}x`, `${p}-2026-A1b2c3d4e5f6g7h8`, `${p}-2026-a1b2c3d4e5f6g7H8`,
      `${p}-2026-a1b2c3d4e5f6g7_8`, `${p}-2026-0001`, `${p}-2026-10000`, `${p}-26-${TAIL}`, `${p}-2026-${TAIL}-a`])
      assert.ok(!re.test(bad), bad);
  }
});

/* An independent reading of R47's two forms, against which every prefix's pattern is driven over a grid of candidates. */
const reference = (prefix, form, s) => {
  const head = `${prefix}-`;
  if (!s.startsWith(head)) return false;
  const rest = s.slice(head.length);
  const year = rest.slice(0, 4), dash = rest[4], tail = rest.slice(5);
  if (!/^[0-9]{4}$/.test(year) || dash !== "-") return false;
  return form === "opaque" ? tail.length === 16 && [...tail].every((c) => "abcdefghijklmnopqrstuvwxyz0123456789".includes(c))
    : tail.length >= 4 && [...tail].every((c) => "0123456789".includes(c));
};

test("R47 idPattern: the anchored RegExp of exactly that prefix's id core in its ID_TABLE form; null for any other prefix; never throws", () => {
  const tails = ["0001", "9999", "10000", "999", "", TAIL, TAIL.slice(1), TAIL + "0", TAIL.toUpperCase(), "0000000000000000",
    "00000000000000000", "a", "1234a", "x".repeat(16), "-0001", "0001-a"];
  const years = ["2026", "0000", "202", "20260", "abcd"];
  for (const { prefix, form } of ID_TABLE) {
    const re = idPattern(prefix);
    assert.ok(re instanceof RegExp, prefix);
    assert.equal(re.flags, "", prefix);
    assert.ok(re.source.startsWith(`^${prefix}-`) && re.source.endsWith("$"), prefix);
    assert.notEqual(idPattern(prefix), re, "a new RegExp each call");
    for (const other of ID_TABLE.map((e) => e.prefix).concat(["", prefix.toLowerCase(), `X${prefix}`, `${prefix}X`]))
      for (const y of years) for (const t of tails) {
        const s = `${other}-${y}-${t}`;
        assert.equal(re.test(s), other === prefix && reference(prefix, form, s), `${prefix} on '${s}'`);
      }
    /* A validator whose ids carry a slug composes it after the core, keeping its own slug rule. */
    const withSlug = new RegExp(`^${re.source.slice(1, -1)}-[a-z0-9]+(-[a-z0-9]+)*$`);
    const core = form === "opaque" ? `${prefix}-2026-${TAIL}` : `${prefix}-2026-10000`;
    assert.ok(withSlug.test(`${core}-a-b`) && !withSlug.test(core) && !withSlug.test(`${core}-A`), prefix);
  }
  const odd = [undefined, null, 0, 1, NaN, true, {}, [], ["HYP"], "", "hyp", "HYP ", " HYP", "HYP-", "X", "constructor", "__proto__",
    "toString", "hasOwnProperty", Symbol("HYP"), 10n, () => "HYP", { toString() { throw new Error("x"); } }, new String("HYP")];
  for (const v of odd) assert.equal(idPattern(v), null, String(typeof v));
});

test("R48 isHypothesisId: true exactly for a string matching idPattern('HYP'); never throws", () => {
  const re = idPattern("HYP");
  const cands = ["HYP-2026-0001", "HYP-2026-10000", "HYP-2026-999", "HYP-2026-0001-a", "HYP-2026-" + TAIL, "hyp-2026-0001",
    " HYP-2026-0001", "HYP-2026-0001\n", "INQ-2026-0001", "INQ-2026-0001-hyp", "HYP-26-0001", ""];
  for (const { prefix } of ID_TABLE) cands.push(`${prefix}-2026-0001`, `${prefix}-2026-${TAIL}`);
  for (const c of cands) assert.equal(isHypothesisId(c), re.test(c), c);
  assert.equal(isHypothesisId("HYP-2026-0001"), true);
  assert.equal(isHypothesisId("HYP-2026-10000"), true);
  for (const v of [undefined, null, 0, 20260001, NaN, true, {}, [], ["HYP-2026-0001"], Symbol("HYP-2026-0001"), 10n,
    () => "HYP-2026-0001", { toString() { throw new Error("x"); } }, new String("HYP-2026-0001"), Object.create(null)])
    assert.equal(isHypothesisId(v), false, String(typeof v));
});
