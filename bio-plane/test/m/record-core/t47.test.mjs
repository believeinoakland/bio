/* record-core T47 (T47-6; N939; K3030; DEC-49, DEC-149): requirement-named tests at the module's interface for R84,
   `setSetting`'s refusal of a value that does not round-trip through JSON, `SETTING_NOT_JSON` under its own row C-102.33,
   asked after `SETTING_VALUE_REQUIRED` and before `SETTING_INVALID` (R25's order otherwise unchanged), and a value that
   round-trips stored and read back equal. Over `storage.mjs`, a fresh storage per test. No network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { recordOf, RECORD_CORE_CHECKS, SETTING_UNREADABLE } from "../../../src/record-core/index.mjs";
import { storage } from "./storage.mjs";

const fresh = () => { const s = storage(); const rc = recordOf({ storage: s }); rc.migrate(); return { s, rc }; };
const rows = (s, q, ...a) => [...s.sql.exec(q, ...a)];
const dump = (s) => Object.fromEntries(
  rows(s, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
    .map((r) => [r.name, JSON.stringify(rows(s, `SELECT * FROM ${r.name} ORDER BY rowid`))]));

const BUILD_FAULT = "This is a fault in how your group's Civicsmith was built, not in the record, and nothing in the record changed.";
const NEVER = /\b(copy|instance|plane|server)\b/i;
const AT = (fn, region) => `src/record-core/index.mjs ${fn} > ${region}`;
const TRANSLATION = "A part of your group's Civicsmith tried to record a setting with a value that cannot be stored as it was given, so "
  + "nothing was recorded. " + BUILD_FAULT;
const DETAIL = "a setting's value is stored as JSON, and this value cannot be stored as written; nothing was recorded.";
const notJson = (name) => ({ name, ok: false, reason: "SETTING_NOT_JSON", code: "SETTING_NOT_JSON", check: "C-102.33",
                             translation: TRANSLATION, detail: DETAIL });

/* Every kind R84 names, and each part JSON would drop or flatten, at the top and nested, each with what it is. */
function cyclic() { const o = { a: 1 }; o.self = o; return o; }
function cyclicList() { const l = [1]; l.push([l]); return l; }
const holey = () => { const l = [1, , 3]; return l; };                 // eslint-disable-line no-sparse-arrays
const named = () => Object.assign([1, 2], { extra: "x" });
const hidden = () => Object.defineProperty({ a: 1 }, "b", { value: 2, enumerable: false });
const getter = () => Object.defineProperty({}, "a", { get: () => 1, enumerable: true });
const symbolKey = () => ({ a: 1, [Symbol("k")]: 2 });
class Point { constructor() { this.x = 1; } }
const NOT_JSON = [
  ["a function", () => function named() { return 1; }], ["an arrow function", () => () => 1],
  ["a symbol", () => Symbol("s")], ["a BigInt", () => 5n],
  ["NaN", () => NaN], ["Infinity", () => Infinity], ["-Infinity", () => -Infinity],
  ["a Date", () => new Date(0)], ["a RegExp", () => /x/], ["a Map", () => new Map()], ["a Set", () => new Set([1])],
  ["a boxed string", () => new String("x")], ["a boxed number", () => new Number(1)], ["a typed array", () => new Uint8Array(2)],
  ["a class instance", () => new Point()], ["a null-prototype object", () => Object.assign(Object.create(null), { a: 1 })],
  ["an object with its own toJSON", () => ({ a: 1, toJSON: () => "x" })],
  ["undefined inside an array", () => [1, undefined]], ["undefined inside an object", () => ({ a: undefined })],
  ["an array with a hole", holey], ["an array with a named property", named],
  ["a cycle through an object", cyclic], ["a cycle through an array", cyclicList],
  ["a symbol key", symbolKey], ["a non-enumerable property", hidden], ["a getter", getter],
  ["a function inside an array", () => ["a", () => 1]], ["NaN nested deep", () => ({ a: [{ b: [1, { c: NaN }] }] })],
  ["a BigInt nested", () => ({ n: [1n] })], ["a Date nested", () => ({ when: new Date(0) })],
  ["Infinity in jurisdiction_profiles' shape", () => ["us-ca-oakland", Infinity]],
];
/* Every shape that round-trips, each read back equal to what was set. */
const SHARED = { k: 1 };
const JSON_VALUES = [
  ["null", null], ["true", true], ["false", false], ["zero", 0], ["a negative fraction", -1.5], ["the largest finite", Number.MAX_VALUE],
  ["the empty string", ""], ["text with quotes and a newline", "a \"b\"\n\tc é 中文 🐘"], ["a lone surrogate", "\ud800x"],
  ["an empty list", []], ["a mixed list", [1, "a", null, true, [], {}]], ["an empty object", {}],
  ["a nested object", { a: { b: [1, { c: "d" }] }, "": 0, "key with spaces": [null] }],
  ["an object named like Object's members", { constructor: 1, toString: "x", hasOwnProperty: [] }],
  ["one object reached twice, no cycle", { left: SHARED, right: [SHARED, SHARED] }],
  ["a profile list", ["us-ca-oakland", "test-elsewhere"]],
];

test("R84 R81: SETTING_NOT_JSON is this module's row C-102.33, beside the settings' rows, its where setSetting's refusal region, a build fault ending with BUILD_FAULT", () => {
  const row = RECORD_CORE_CHECKS.SETTING_NOT_JSON;
  assert.deepEqual({ ...row }, { check: "C-102.33", where: AT("setSetting", "is-setting-refused"), translation: TRANSLATION });
  assert.ok(Object.isFrozen(row) && Object.isFrozen(RECORD_CORE_CHECKS));
  assert.ok(row.translation.endsWith(` ${BUILD_FAULT}`), "a build fault, as R82 words it");
  assert.ok(!/SETTING_|C-102|JSON/.test(row.translation) && !NEVER.test(row.translation), "a member's sentence, R82's words");
  for (const m of row.translation.matchAll(/Civicsmith/g)) assert.match(row.translation.slice(m.index - 13, m.index), /^[Yy]our group's $/);
  /* beside the four settings rows, each where the same region; the next free number of C-102, held once */
  const settings = ["SETTING_NAME_REQUIRED", "SETTING_BY_REQUIRED", "SETTING_VALUE_REQUIRED", "SETTING_NOT_JSON", "SETTING_INVALID"];
  assert.deepEqual(settings.map((c) => RECORD_CORE_CHECKS[c].check), ["C-102.29", "C-102.30", "C-102.31", "C-102.33", "C-102.32"]);
  assert.ok(settings.every((c) => RECORD_CORE_CHECKS[c].where === row.where));
  const c102 = Object.values(RECORD_CORE_CHECKS).map((r) => r.check).filter((c) => c.startsWith("C-102.")).map((c) => Number(c.slice(6)));
  assert.equal(Math.max(...c102), 33, "C-102.33 is the last held number");
  const checks = Object.values(RECORD_CORE_CHECKS).map((r) => r.check);
  assert.equal(new Set(checks).size, checks.length, "no number is held twice");
  /* SETTING_INVALID keeps its row and meaning: R26's setting alone, not a build fault */
  assert.equal(RECORD_CORE_CHECKS.SETTING_INVALID.check, "C-102.32");
  assert.match(RECORD_CORE_CHECKS.SETTING_INVALID.translation, /^The setting was not changed/);
  assert.ok(!RECORD_CORE_CHECKS.SETTING_INVALID.translation.includes(BUILD_FAULT));
});

test("R84 R25: setSetting refuses every value that does not round-trip through JSON, at every depth, with {name, ok, reason, code, check, translation, detail}, recording nothing", () => {
  const { s, rc } = fresh();
  rc.setSetting("limits", { a: 1 }, "admin");
  const before = dump(s);
  for (const name of ["limits", "fresh_name", "jurisdiction_profiles"])
    for (const [what, make] of NOT_JSON) {
      const r = rc.setSetting(name, make(), "admin");
      assert.deepEqual(r, notJson(name), `${name}: ${what}`);
      assert.deepEqual(Object.keys(r), ["name", "ok", "reason", "code", "check", "translation", "detail"], `${what}: no other field`);
    }
  assert.deepEqual(dump(s), before, "every refusal recorded nothing");
  assert.deepEqual(rc.getSetting("limits"), { a: 1 }, "the value set before stands");
  assert.equal(rc.getSetting("fresh_name"), null);
  /* the detail is one fixed sentence: the value cannot be stored as written, nothing was recorded */
  assert.match(DETAIL, /cannot be stored as written; nothing was recorded\.$/);
  assert.equal(DETAIL.split(". ").length, 1);
  assert.doesNotMatch(DETAIL, NEVER);
});

test("R84: a value whose inspection throws, a Proxy among them, or one nested too deep to walk, is refused SETTING_NOT_JSON; setSetting does not throw for it", () => {
  const { s, rc } = fresh();
  const before = dump(s);
  const hostile = [
    new Proxy({}, { getPrototypeOf() { throw new Error("proto"); } }),
    new Proxy({}, { ownKeys() { throw new Error("keys"); } }),
    new Proxy({ a: 1 }, { getOwnPropertyDescriptor() { throw new Error("descriptor"); } }),
    [new Proxy([], { ownKeys() { throw new Error("nested keys"); } })],
    Object.defineProperty({}, "a", { get() { throw new Error("get"); }, enumerable: true }),
  ];
  let deep = [];
  for (let i = 0; i < 200000; i++) deep = [deep];
  for (const v of [...hostile, deep]) {
    let r;
    assert.doesNotThrow(() => { r = rc.setSetting("x", v, "admin"); });
    assert.deepEqual(r, notJson("x"));
  }
  assert.deepEqual(dump(s), before);
  /* a Proxy that reads as a plain object of JSON values throughout is a value like any other */
  assert.deepEqual(rc.setSetting("p", new Proxy({ a: [1] }, {}), "admin"), { ok: true });
  assert.deepEqual(rc.getSetting("p"), { a: [1] });
});

test("R84 R25 R26: SETTING_NOT_JSON is asked after SETTING_NAME_REQUIRED, SETTING_BY_REQUIRED and SETTING_VALUE_REQUIRED and before SETTING_INVALID", () => {
  const { s, rc } = fresh();
  const before = dump(s);
  /* earlier refusals win over a value that is not JSON */
  assert.equal(rc.setSetting("", NaN, "admin").code, "SETTING_NAME_REQUIRED");
  assert.equal(rc.setSetting("x", () => 1, "").code, "SETTING_BY_REQUIRED");
  assert.equal(rc.setSetting("", 5n, "").code, "SETTING_NAME_REQUIRED");
  assert.equal(rc.setSetting("x", undefined, "admin").code, "SETTING_VALUE_REQUIRED", "an absent value is required, not not-JSON");
  /* it is asked before R26's setting: a profile list that is both not JSON and not distinct ids is not JSON */
  for (const v of [[NaN], ["a", () => 1], ["a", "a", Infinity], [undefined], Symbol("p"), new Date(0), { a: 1n }])
    assert.equal(rc.setSetting("jurisdiction_profiles", v, "installer").code, "SETTING_NOT_JSON", String(typeof v));
  /* the control: a JSON value R26 does not take is still SETTING_INVALID, with its row and name */
  for (const v of ["us-ca-oakland", [""], ["a", "a"], [1], null, {}, [null]]) {
    const r = rc.setSetting("jurisdiction_profiles", v, "installer");
    assert.deepEqual([r.code, r.check, r.name], ["SETTING_INVALID", "C-102.32", "jurisdiction_profiles"], JSON.stringify(v));
  }
  assert.deepEqual(dump(s), before, "nothing recorded by any of them");
});

test("R84 R25 R83: a value that round-trips is stored and read back by getSetting equal to the value set, in both forms, recorded once with who set it", () => {
  const { s, rc } = fresh();
  for (const [i, [what, v]] of JSON_VALUES.entries()) {
    assert.deepEqual(rc.setSetting(`v${i}`, v, "admin"), { ok: true }, what);
    assert.deepEqual(rc.getSetting(`v${i}`), v, `${what}: read back equal`);
    assert.deepEqual(rc.getSetting(`v${i}`, { strict: true }), v, `${what}: and in the strict form`);
    assert.notEqual(rc.getSetting(`v${i}`, { strict: true }), SETTING_UNREADABLE);
  }
  assert.equal(rows(s, `SELECT COUNT(*) AS n FROM settings`)[0].n, JSON_VALUES.length, "one row per act of setting");
  assert.ok(rows(s, `SELECT set_by FROM settings`).every((r) => r.set_by === "admin"));
  /* the stored text is the value's JSON */
  assert.equal(rows(s, `SELECT value FROM settings WHERE name='v12'`)[0].value, JSON.stringify(JSON_VALUES[12][1]));
  /* -0 is a finite number: taken, and stored as JSON writes it */
  assert.deepEqual(rc.setSetting("neg0", -0, "admin"), { ok: true });
  assert.equal(rc.getSetting("neg0"), 0);
  /* R26's setting still takes its list, and keeps its order */
  assert.deepEqual(rc.setSetting("jurisdiction_profiles", ["us-ca-oakland", "test-elsewhere"], "installer"), { ok: true });
  assert.deepEqual(rc.getSetting("jurisdiction_profiles"), ["us-ca-oakland", "test-elsewhere"]);
});

test("R84 R32: answered inside a transact, SETTING_NOT_JSON rolls the caller back, as every refusal does; the control commits", () => {
  const { s, rc } = fresh();
  const before = dump(s);
  const r = rc.transact(() => { rc.setSetting("y", 1, "admin"); return rc.setSetting("z", { when: new Date(0) }, "admin"); });
  assert.deepEqual(r, notJson("z"));
  assert.deepEqual(dump(s), before, "the caller's own setting rolled back with it");
  assert.equal(rc.getSetting("y"), null);
  assert.deepEqual(rc.transact(() => { rc.setSetting("y", 1, "admin"); return rc.setSetting("z", { when: "1970-01-01T00:00:00.000Z" }, "admin"); }), { ok: true });
  assert.deepEqual([rc.getSetting("y"), rc.getSetting("z")], [1, { when: "1970-01-01T00:00:00.000Z" }]);
});
