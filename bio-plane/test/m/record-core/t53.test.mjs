/* record-core T53 (N1257; K5458, K5462, C10): requirement-named tests at the module's interface for R92, `getSettingAt`,
   a setting as of an instant, read from the rows `settings` already keeps. Over `storage.mjs`, a fresh storage per test.
   No network. The cost bar (R92 test (h)) is asserted as work, never as wall-clock time (K4787): the read is one
   statement over the `settings_name` index, and 1,000 reads at spread instants each answer the row in force. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { recordOf, RECORD_CORE_CHECKS, SETTING_UNDETERMINED, SETTING_UNDETERMINED_UNREADABLE } from "../../../src/record-core/index.mjs";
import { storage } from "./storage.mjs";
import { localize } from "../../../src/setup-words/index.mjs";

const fresh = () => { const s = storage(); const rc = recordOf({ storage: s }); rc.migrate(); return { s, rc }; };
const rows = (s, q, ...a) => [...s.sql.exec(q, ...a)];
const dump = (s) => Object.fromEntries(
  rows(s, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
    .map((r) => [r.name, JSON.stringify(rows(s, `SELECT * FROM ${r.name} ORDER BY rowid`))]));
/* A settings row as `setSetting` writes it but at a stated instant (`setSetting` stamps now, and never takes `set_at` from a caller). */
const put = (s, name, value, setAt, by = "admin") => s.sql.exec(`INSERT INTO settings (name,value,set_by,set_at) VALUES (?,?,?,?)`, name, JSON.stringify(value), by, setAt);
const JP = "jurisdiction_profiles";
const NEVER = /\b(copy|instance|plane|server)\b/i;

test("R92 (a): the value in force at an instant; a whole-second instant is the last millisecond of its second; later instants equal getSetting", () => {
  const { s, rc } = fresh();
  put(s, JP, ["a"], "2026-10-01T09:00:00.500Z");
  put(s, JP, ["a", "b"], "2026-10-10T09:00:00.500Z");
  assert.deepEqual(rc.getSettingAt(JP, "2026-10-05T00:00:00Z"), ["a"]);
  assert.deepEqual(rc.getSettingAt(JP, "2026-10-10T09:00:00Z"), ["a", "b"], "the set at .500 is held to have come first in the same second");
  assert.deepEqual(rc.getSettingAt(JP, "2026-10-10T09:00:00.499Z"), ["a"], "a millisecond instant is compared as an instant");
  assert.deepEqual(rc.getSettingAt(JP, "2026-10-10T09:00:00.500Z"), ["a", "b"]);
  for (const at of ["2026-10-11T00:00:00Z", "2030-01-01T00:00:00.000Z"]) assert.deepEqual(rc.getSettingAt(JP, at), rc.getSetting(JP));
  /* through setSetting: a set stamped now is in force at any later instant */
  assert.deepEqual(rc.setSetting("x", { n: 1 }, "admin"), { ok: true });
  assert.deepEqual(rc.getSettingAt("x", "2999-01-01T00:00:00Z"), { n: 1 });
});

test("R92 (b): a name never set, and an instant before the first set, answer SETTING_UNDETERMINED; a setting set to null answers null", () => {
  assert.deepEqual(SETTING_UNDETERMINED, { undetermined: true, why: "NOT_YET_SET" });
  assert.ok(Object.isFrozen(SETTING_UNDETERMINED));
  const { s, rc } = fresh();
  assert.equal(rc.getSettingAt("never", "2026-10-05T00:00:00Z"), SETTING_UNDETERMINED, "the same object, by identity");
  put(s, JP, ["a"], "2026-10-01T09:00:00.500Z");
  assert.equal(rc.getSettingAt(JP, "2026-09-30T23:59:59Z"), SETTING_UNDETERMINED);
  assert.equal(rc.getSettingAt(JP, "2026-10-01T09:00:00.499Z"), SETTING_UNDETERMINED);
  put(s, "off", null, "2026-10-02T00:00:00.000Z");
  assert.equal(rc.getSettingAt("off", "2026-10-02T00:00:00Z"), null);
  assert.equal(rc.getSettingAt("off", "2027-01-01T00:00:00Z"), null);
  assert.equal(rc.getSettingAt("off", "2026-10-01T00:00:00Z"), SETTING_UNDETERMINED);
  assert.equal(rc.getSetting("never"), null, "getSetting keeps answering null for a name never set");
});

test("R92 (c): a row that is not valid JSON answers SETTING_UNDETERMINED_UNREADABLE at its instant, and earlier answers stand", () => {
  assert.deepEqual(SETTING_UNDETERMINED_UNREADABLE, { undetermined: true, why: "VALUE_UNREADABLE" });
  assert.ok(Object.isFrozen(SETTING_UNDETERMINED_UNREADABLE));
  const { s, rc } = fresh();
  put(s, "k", 1, "2026-10-01T00:00:00.000Z");
  s.sql.exec(`INSERT INTO settings (name,value,set_by,set_at) VALUES (?,?,?,?)`, "k", "{", "hand", "2026-10-03T00:00:00.000Z");
  assert.equal(rc.getSettingAt("k", "2026-10-02T00:00:00Z"), 1);
  assert.equal(rc.getSettingAt("k", "2026-10-03T00:00:00Z"), SETTING_UNDETERMINED_UNREADABLE);
  assert.equal(rc.getSettingAt("k", "2026-12-01T00:00:00Z"), SETTING_UNDETERMINED_UNREADABLE, "never null for an unreadable value");
  /* a name that cannot be spelled is the closed answer, not "not yet set" and not a throw */
  const hostile = { toString() { throw new Error("no"); } };
  assert.doesNotThrow(() => rc.getSettingAt(hostile, "2026-10-02T00:00:00Z"));
  assert.equal(rc.getSettingAt(hostile, "2026-10-02T00:00:00Z"), SETTING_UNDETERMINED_UNREADABLE);
});

test("R92 (d): two rows whose set_at run backwards (the clock stepped back) answer by rowid", () => {
  const { s, rc } = fresh();
  put(s, "k", "first", "2026-10-05T00:00:00.000Z");
  put(s, "k", "second", "2026-10-04T00:00:00.000Z");
  assert.equal(rc.getSettingAt("k", "2026-10-06T00:00:00Z"), "second", "the later act, though stamped earlier");
  assert.equal(rc.getSettingAt("k", "2026-10-04T12:00:00Z"), "second", "only the second is at or before this instant");
  assert.equal(rc.getSettingAt("k", "2026-10-03T00:00:00Z"), SETTING_UNDETERMINED);
  put(s, "j", "x", "2026-10-05T00:00:00.000Z"); put(s, "j", "y", "2026-10-05T00:00:00.000Z");
  assert.equal(rc.getSettingAt("j", "2026-10-05T00:00:00.000Z"), "y", "two sets in one millisecond answer the later row");
});

test("R92 (e): an at that is not an instant is refused SETTING_AT_INVALID under C-102.40, answered as R81 states, and nothing throws", () => {
  const { s, rc } = fresh();
  put(s, JP, ["a"], "2026-10-01T09:00:00.500Z");
  const row = RECORD_CORE_CHECKS.SETTING_AT_INVALID;
  assert.equal(row.check, "C-102.40");
  assert.equal(row.where, "src/record-core/index.mjs getSettingAt > is-setting-at-refused");
  assert.ok(Object.isFrozen(row));
  assert.ok(row.translation.includes("Civicsmith") && !NEVER.test(row.translation), "R82: the group's own Civicsmith is never a copy, instance, plane or server");
  const BAD = ["2026-10-05", "", null, undefined, 20261005, {}, [], "2026-13-40T00:00:00Z", "2026-02-30T00:00:00Z", "2026-10-05T24:00:00Z",
               "2026-10-05T00:00:00", "2026-10-05T00:00:00.5Z", "2026-10-05T00:00:00+00:00", " 2026-10-05T00:00:00Z", "2026-10-05T00:00:00Z\n"];
  let detail = null;
  for (const at of BAD) {
    let r;
    assert.doesNotThrow(() => { r = rc.getSettingAt(JP, at); }, String(at));
    assert.deepEqual(Object.keys(r).sort(), ["check", "code", "detail", "name", "ok", "reason", "translation"], String(at));
    assert.deepEqual({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation, name: r.name },
                     { ok: false, reason: "SETTING_AT_INVALID", code: "SETTING_AT_INVALID", check: "C-102.40", translation: row.translation, name: JP }, String(at));
    detail ??= r.detail;
    assert.equal(r.detail, detail, "one fixed sentence for every caller");
  }
  assert.equal(typeof detail, "string");
  assert.equal(detail.split(". ").length, 1, "one sentence");
  assert.equal(detail, localize("record-core.index.the_instant_given_is_not", "the instant given is not one the setting can be read at; nothing was read."));
});

test("R92 (f): purge in both forms leaves every settings row and the read answers as before; expunge naming settings is refused", () => {
  const { s, rc } = fresh();
  put(s, JP, ["a"], "2026-10-01T09:00:00.500Z"); put(s, JP, ["a", "b"], "2026-10-10T09:00:00.500Z");
  const answers = () => ["2026-09-01T00:00:00Z", "2026-10-05T00:00:00Z", "2026-11-01T00:00:00Z"].map((at) => rc.getSettingAt(JP, at));
  const before = answers();
  const held = rows(s, `SELECT * FROM settings ORDER BY rowid`);
  rc.purge({}); rc.purge({ bundleId: "INFO-2026-0001-a" });
  assert.deepEqual(rows(s, `SELECT * FROM settings ORDER BY rowid`), held);
  assert.deepEqual(answers(), before);
  const r = rc.expunge({ module: "record-core", table: "settings", key: { name: JP }, ground: "unlawful", by: "member:iris" });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "EXPUNGE_NOT_DECLARED");
  assert.deepEqual(rows(s, `SELECT * FROM settings ORDER BY rowid`), held, "the refused expunge removed nothing");
});

test("R92 (g): settings keeps export admin-only, purge exempt, expunge none and version_chain true", () => {
  const { rc } = fresh();
  const t = rc.declaredTables().find((d) => d.name === "settings");
  assert.ok(t, "settings is declared");
  assert.deepEqual({ purge: t.purge, expunge: t.expunge, export: t.export, version_chain: t.version_chain },
                   { purge: "exempt", expunge: "none", export: "admin-only", version_chain: true });
});

test("R92 (h): 200 rows under one name and 1,000 reads at spread instants each answer the row in force, by one indexed statement", () => {
  const { s, rc } = fresh();
  const day = (i) => new Date(Date.UTC(2026, 0, 1) + i * 86400000).toISOString();
  for (let i = 0; i < 200; i++) put(s, "many", i, day(i));
  for (let i = 0; i < 20; i++) put(s, `other${i}`, i, day(i));
  for (let k = 0; k < 1000; k++) {
    const ms = Date.UTC(2025, 11, 1) + Math.floor((k / 1000) * 230 * 86400000);
    const at = new Date(ms).toISOString();
    const want = ms < Date.UTC(2026, 0, 1) ? SETTING_UNDETERMINED : Math.min(199, Math.floor((ms - Date.UTC(2026, 0, 1)) / 86400000));
    assert.equal(rc.getSettingAt("many", at), want, at);
  }
  const plan = rows(s, `EXPLAIN QUERY PLAN SELECT value FROM settings WHERE name=? AND set_at<=? ORDER BY rowid DESC LIMIT 1`, "many", "2026-06-01T00:00:00.999Z")
    .map((r) => r.detail).join(" | ");
  assert.match(plan, /settings_name/, "the read walks the name's index, not the table");
});

test("R92 control: getSetting and its strict form answer as R25, R83 and R84 state; setSetting writes the one row; getSettingAt is repeatable and writes nothing", () => {
  const { s, rc } = fresh();
  assert.equal(rc.getSetting("never"), null);
  assert.equal(rc.getSetting("never", { strict: true }), null);
  const tables = rows(s, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`).map((r) => r.name);
  const cols = rows(s, `PRAGMA table_info(settings)`).map((c) => c.name);
  assert.deepEqual(cols, ["name", "value", "set_by", "set_at"], "no column is added");
  const n0 = rows(s, `SELECT COUNT(*) AS n FROM settings`)[0].n;
  assert.deepEqual(rc.setSetting("z", [1], "admin"), { ok: true });
  assert.equal(rows(s, `SELECT COUNT(*) AS n FROM settings`)[0].n, n0 + 1, "a set writes the same single row");
  const before = dump(s); const writes = rc.writeCount();
  const a = rc.getSettingAt("z", "2999-01-01T00:00:00Z"); const b = rc.getSettingAt("z", "2999-01-01T00:00:00Z");
  rc.getSettingAt("z", "not an instant"); rc.getSettingAt("never", "2026-10-05T00:00:00Z");
  assert.deepEqual([a, b], [[1], [1]]);
  assert.deepEqual(dump(s), before, "the row counts of every table are equal before and after");
  assert.equal(rc.writeCount(), writes);
  assert.deepEqual(rows(s, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`).map((r) => r.name), tables, "no table is added");
});
