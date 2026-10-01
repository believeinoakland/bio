/* record-grammar at its interface: the id grammar and the type vocabulary (R1–R5). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { BUNDLE_ID_RE, ANN_ID_RE, FILENAME_RE, ISO_TS_RE, OBJECT_TYPES, LEGACY_TYPE_ALIASES, normalizeType }
  from "../../../src/record-grammar/index.mjs";

const PREFIXES = ["INFO", "PROB", "FOCUS", "INQ", "PROJ", "ACTN", "BIAS", "STD", "CONF", "CONS", "ESC", "ASP", "GOAL", "PLN"];
const SLUGS_OK = ["a", "a1", "abc-def", "a-b-c", "0-9", "x2-y3-z4"];
const SLUGS_BAD = ["", "-a", "a-", "a--b", "A", "a_b", "a.b", "a b", "é"];
const ANN = ".ann-20260930T120000Z-note";

test("R1 BUNDLE_ID_RE: exactly <PREFIX>-<4 digits>-<4 digits>-<slug>, over the whole prefix set", () => {
  for (const p of PREFIXES) {
    for (const s of SLUGS_OK) assert.ok(BUNDLE_ID_RE.test(`${p}-2026-0001-${s}`), `${p} ${s}`);
    for (const s of SLUGS_BAD) assert.ok(!BUNDLE_ID_RE.test(`${p}-2026-0001-${s}`), `${p} bad slug '${s}'`);
    for (const bad of [`${p}-26-0001-a`, `${p}-2026-001-a`, `${p}-20266-0001-a`, `${p}-2026-00011-a`, `${p}-2026-0001`,
      `${p.toLowerCase()}-2026-0001-a`, ` ${p}-2026-0001-a`, `${p}-2026-0001-a `, `${p}-2026-0001-a\n`, `${p}-2026-0001-a${ANN}`])
      assert.ok(!BUNDLE_ID_RE.test(bad), bad);
  }
  for (const p of ["ENT", "CASE", "PLAN", "PL", "INFOS", "XINFO", "RUN", ""]) assert.ok(!BUNDLE_ID_RE.test(`${p}-2026-0001-a`), p);
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
  for (const p of ["ENT", "PLAN", "X"]) assert.ok(!ANN_ID_RE.test(`${p}-2026-0001-a${ANN}`), p);
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

test("R3 OBJECT_TYPES: every prefix of R1 to its canonical type, and its keys exactly R1's prefix set", () => {
  assert.deepEqual(OBJECT_TYPES, { INFO: "information", PROB: "inquiry", FOCUS: "inquiry", INQ: "inquiry", PROJ: "project",
    ACTN: "action", BIAS: "bias", STD: "standard", CONF: "determination", CONS: "consequence", ESC: "escalation",
    ASP: "aspiration", GOAL: "goal", PLN: "action_plan" });
  assert.deepEqual(Object.keys(OBJECT_TYPES).sort(), [...PREFIXES].sort());
  /* The same set both patterns carry: every key is an id prefix, and a prefix outside the keys is not. */
  for (const k of Object.keys(OBJECT_TYPES)) {
    assert.ok(BUNDLE_ID_RE.test(`${k}-2026-0001-a`), k);
    assert.ok(ANN_ID_RE.test(`${k}-2026-0001-a${ANN}`), k);
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
