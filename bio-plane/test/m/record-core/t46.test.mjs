/* record-core T46 (T46-3; N904; K2832, K2914, K2917): requirement-named tests at the module's interface for R83, the strict
   `getSetting` that tells a setting whose value last set cannot be read (held as text that is not valid JSON) from one
   never set, and R25's read left as it was for every caller that does not ask. Over `storage.mjs`, a fresh storage per
   test. No network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { recordOf, SETTING_UNREADABLE } from "../../../src/record-core/index.mjs";
import { storage } from "./storage.mjs";

const fresh = () => { const s = storage(); const rc = recordOf({ storage: s }); rc.migrate(); return { s, rc }; };
const rows = (s, q, ...a) => [...s.sql.exec(q, ...a)];
const dump = (s) => Object.fromEntries(
  rows(s, `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
    .map((r) => [r.name, JSON.stringify(rows(s, `SELECT * FROM ${r.name} ORDER BY rowid`))]));
/* A row as a store could hold it without `setSetting`: written before R25's writer, or by hand. */
const raw = (s, name, value) => s.sql.exec(`INSERT INTO settings (name,value,set_by,set_at) VALUES (?,?,?,?)`, name, value, "hand", "2026-01-01T00:00:00Z");
const STRICT = { strict: true };

/* Text that is not valid JSON, as a stored value may be. */
const UNREADABLE_TEXT = ["", "not json", "{", "[1,", "{'a':1}", "undefined", "NaN", "True", "'x'", "{\"a\":1}x", "0x10"];
/* Every JSON shape a value set through setSetting takes, each read back as set. */
const VALUES = [null, true, false, 0, -1.5, "", "text", [], [1, "a", null], {}, { a: { b: [1] } }, ["us-ca-oakland", "test-elsewhere"]];

test("R83: SETTING_UNREADABLE is one exported frozen object, {unreadable: true}, compared by identity", () => {
  assert.deepEqual(SETTING_UNREADABLE, { unreadable: true });
  assert.ok(Object.isFrozen(SETTING_UNREADABLE));
  assert.deepEqual(Object.keys(SETTING_UNREADABLE), ["unreadable"]);
  const { s, rc } = fresh();
  raw(s, "a", "nope"); raw(s, "b", "{");
  assert.equal(rc.getSetting("a", STRICT), SETTING_UNREADABLE, "the same object, by identity");
  assert.equal(rc.getSetting("b", STRICT), rc.getSetting("a", STRICT));
  /* a stored value whose JSON reads like it is a value, never the constant */
  rc.setSetting("c", { unreadable: true }, "admin");
  const looks = rc.getSetting("c", STRICT);
  assert.deepEqual(looks, { unreadable: true });
  assert.notEqual(looks, SETTING_UNREADABLE, "a value set to the same shape is a value, told apart by identity");
});

test("R83: getSetting(name, {strict: true}) answers null when no value was ever set, SETTING_UNREADABLE for a value last set that is not valid JSON, and the value otherwise", () => {
  const { s, rc } = fresh();
  assert.equal(rc.getSetting("declared_stake", STRICT), null, "never set: null");
  assert.equal(rc.getSetting("", STRICT), null);
  assert.equal(rc.getSetting(undefined, STRICT), null);
  for (const [i, text] of UNREADABLE_TEXT.entries()) {
    raw(s, `u${i}`, text);
    const got = rc.getSetting(`u${i}`, STRICT);
    assert.equal(got, SETTING_UNREADABLE, JSON.stringify(text));
    assert.notEqual(got, null, "never null for an unreadable value");
  }
  for (const [i, v] of VALUES.entries()) {
    assert.deepEqual(rc.setSetting(`v${i}`, v, "admin"), { ok: true });
    assert.deepEqual(rc.getSetting(`v${i}`, STRICT), v, JSON.stringify(v));
  }
  assert.equal(rc.getSetting(`v${VALUES.indexOf(null)}`, STRICT), null, "a value set as null reads null, as set");
  /* valid JSON written by hand, not by setSetting, is read as its value */
  raw(s, "h", "[\"a\",2]");
  assert.deepEqual(rc.getSetting("h", STRICT), ["a", 2]);
  /* a stored value not held as text: unreadable */
  s.db.prepare(`INSERT INTO settings (name,value,set_by,set_at) VALUES (?,?,?,?)`).run("blob", new Uint8Array([0x5b, 0x5d]), "hand", "t");
  assert.equal(rc.getSetting("blob", STRICT), SETTING_UNREADABLE);
});

test("R83 R25: the value LAST set decides: an unreadable row after a readable one is unreadable, and a readable one after an unreadable one is read", () => {
  const { s, rc } = fresh();
  rc.setSetting("declared_stake", { kind: "none" }, "admin");
  assert.deepEqual(rc.getSetting("declared_stake", STRICT), { kind: "none" });
  raw(s, "declared_stake", "{broken");
  assert.equal(rc.getSetting("declared_stake", STRICT), SETTING_UNREADABLE, "an earlier readable value is never answered for a later unreadable one");
  rc.setSetting("declared_stake", { kind: "tenant" }, "m2");
  assert.deepEqual(rc.getSetting("declared_stake", STRICT), { kind: "tenant" });
  rc.setSetting("declared_stake", null, "m3");
  assert.equal(rc.getSetting("declared_stake", STRICT), null, "set as null after it: null, as set");
  /* another name's unreadable row reaches no other name */
  raw(s, "other", "x");
  assert.equal(rc.getSetting("declared_stake", STRICT), null);
  assert.equal(rc.getSetting("other", STRICT), SETTING_UNREADABLE);
});

test("R83 R25: without {strict: true} getSetting answers as R25 states, an unreadable value reading null, for every caller that does not ask (negative control: only the strict form tells the two apart)", () => {
  const { s, rc } = fresh();
  raw(s, "bad", "not json");
  for (const [i, v] of VALUES.entries()) rc.setSetting(`v${i}`, v, "admin");
  const notStrict = [undefined, null, {}, { strict: false }, { strict: 1 }, { strict: "true" }, { strict: [true] }, true, "strict", 1];
  for (const o of notStrict) {
    assert.equal(rc.getSetting("bad", o), null, `options ${JSON.stringify(o)}: the unreadable value reads null, as today`);
    assert.equal(rc.getSetting("never", o), null);
    for (const [i, v] of VALUES.entries()) assert.deepEqual(rc.getSetting(`v${i}`, o), v);
  }
  assert.equal(rc.getSetting("bad"), null, "the one-argument call every caller makes today");
  /* the negative control: without the option an unreadable and an unset setting answer alike; with it, they differ */
  assert.equal(rc.getSetting("bad"), rc.getSetting("never"));
  assert.notEqual(rc.getSetting("bad", STRICT), rc.getSetting("never", STRICT));
  /* exactly `true`: a strict that is only truthy is the non-strict form */
  assert.equal(rc.getSetting("bad", { strict: 1 }), null);
});

test("R83: the strict form never throws and fails closed: options or a name that cannot be read, a store with no settings table, a storage whose reads fail", () => {
  const { s, rc } = fresh();
  raw(s, "bad", "{");
  const hostileOptions = [Object.defineProperty({}, "strict", { get() { throw new Error("get"); } }),
                          new Proxy({}, { get() { throw new Error("proxy"); } })];
  for (const o of hostileOptions) {
    let r;
    assert.doesNotThrow(() => { r = rc.getSetting("bad", o); });
    assert.equal(r, null, "options that cannot be read are not the strict form: R25's answer");
  }
  const hostileName = { toString() { throw new Error("name"); } };
  let r;
  assert.doesNotThrow(() => { r = rc.getSetting(hostileName, STRICT); });
  assert.equal(r, SETTING_UNREADABLE, "a name that cannot be spelled: never reported unset");
  assert.throws(() => rc.getSetting(hostileName), "the non-strict form is as today");
  /* no settings table */
  const bare = recordOf({ storage: storage({ schema: false }) });
  assert.doesNotThrow(() => { r = bare.getSetting("declared_stake", STRICT); });
  assert.equal(r, SETTING_UNREADABLE, "a read that fails is never answered as unset");
  assert.throws(() => bare.getSetting("declared_stake"), "the non-strict form's read failure is as today");
  /* a storage whose every read fails */
  const broken = recordOf({ storage: { sql: { exec() { throw new Error("no"); } }, transactionSync: (f) => f() } });
  assert.doesNotThrow(() => { r = broken.getSetting("x", STRICT); });
  assert.equal(r, SETTING_UNREADABLE);
  /* the control: the same calls on a readable store answer the rule */
  assert.equal(rc.getSetting("never", STRICT), null);
  assert.equal(rc.getSetting("bad", STRICT), SETTING_UNREADABLE);
});

test("R83 R31 R39: the strict read writes nothing, reads only this module's settings table, and is the same through every handle of one storage", () => {
  const { s, rc } = fresh();
  rc.setSetting("a", [1], "admin"); raw(s, "b", "x");
  s.db.exec(`CREATE TABLE decoy (name TEXT, value TEXT)`);
  s.sql.exec(`INSERT INTO decoy VALUES ('c', '[2]')`);
  const before = dump(s);
  for (const n of ["a", "b", "c", "none"]) { rc.getSetting(n, STRICT); rc.getSetting(n); }
  assert.deepEqual(dump(s), before, "it writes nothing");
  assert.equal(rc.getSetting("c", STRICT), null, "another table's row is never read");
  const other = recordOf({ storage: s });
  assert.equal(other, rc);
  assert.equal(other.getSetting("b", STRICT), SETTING_UNREADABLE);
  /* settings stay exempt from purge (R23), so an unreadable value outlives a purge, still told from unset */
  rc.purge({}); rc.purge({ bundleId: "INFO-2026-0001-a" });
  assert.equal(rc.getSetting("b", STRICT), SETTING_UNREADABLE);
  assert.deepEqual(rc.getSetting("a", STRICT), [1]);
});
