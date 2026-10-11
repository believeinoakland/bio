/* capture, T44 (T44-4; N870, K2708) at the module's interface: R87's T44 clause. This module answers no source
   fingerprint and creates, declares and reads no table of `doorbell`'s, `knock_key` included: the key and the digest are
   `doorbell` R12's alone. `doorbell`'s tables are named as its R25 names them; `doorbell` is later in the modules' order
   than capture, so this suite cannot build it, and the control that a storage can hold `knock_key` is made here with
   that table's own shape, standing in for doorbell's migrate. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storage, provenance, fresh, bucket, H } from "./fixture.mjs";
import { Capture, captureOf, captureOps } from "../../../src/capture/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";

/* doorbell R25: the tables doorbell creates and declares. */
const DOORBELL_TABLES = ["inbox", "knock_rate", "knock_key", "knocker_key", "doorbell_tally", "doorbell_limit_last"];
const tablesOf = (s) => s.sql.exec(`SELECT name FROM sqlite_master WHERE type = 'table'`).map((r) => r.name);
/* Every method of the instance whose name speaks of a fingerprint or a knock, called as the door window would call one. */
const askEveryFingerprint = async (c) => {
  for (let o = c; o && o !== Object.prototype; o = Object.getPrototypeOf(o))
    for (const k of Object.getOwnPropertyNames(o))
      if (/fingerprint|knock/i.test(k) && typeof c[k] === "function") await c[k]("198.51.100.4");
};
const doorbells = (text) => DOORBELL_TABLES.filter((t) => new RegExp(`\\b${t}\\b`, "i").test(text));

test("R87 (T44, N870): capture answers no source fingerprint: neither the instance captureOf answers, nor any Capture, nor its routes carry one", () => {
  const s = storage();
  const ctx = { storage: s };
  const record = recordOf(ctx, {});
  record.migrate();
  const c = captureOf(ctx, { record, governor: {}, provenance: provenance(s), env: { KNOCK_FINGERPRINT_KEY: "bound" } });
  c.migrate();
  assert.equal(c.sourceFingerprint, undefined, "captureOf(ctx).sourceFingerprint is undefined");
  assert.equal("sourceFingerprint" in c, false);
  assert.equal(captureOf(ctx).sourceFingerprint, undefined, "the one instance, reached again");
  assert.equal(Capture.prototype.sourceFingerprint, undefined);
  const named = (o) => Object.getOwnPropertyNames(o).filter((k) => /fingerprint|knock/i.test(k));
  assert.deepEqual([...named(Capture.prototype), ...named(c)], [], "no fingerprint or knock key under any name");
  const routes = Object.keys(captureOps(c, new URL("http://x/"), null, c.env));
  assert.deepEqual(routes.filter((k) => /fingerprint|knock|doorwindow/i.test(k)), [], "no route answers one");
});

test("R87 (T44, N870): a fresh storage after capture's migrate holds no knock_key and none of doorbell's tables, and capture declares none of them; control: the same probe finds knock_key once the storage holds it", async () => {
  const { s, c, core } = fresh();
  c.migrate();
  await askEveryFingerprint(c);
  assert.deepEqual(DOORBELL_TABLES.filter((t) => tablesOf(s).includes(t)), [], "no doorbell table after capture's migrate");
  assert.equal(tablesOf(s).includes("knock_key"), false);
  assert.deepEqual(core.declaredTables().filter((d) => d.module === "capture" && DOORBELL_TABLES.includes(d.name)), [],
                   "none declared as capture's");
  /* control: the probe sees knock_key when the storage holds it (doorbell's migrate makes it; its shape here) */
  s.db.exec(`CREATE TABLE knock_key (id INTEGER PRIMARY KEY CHECK (id = 1), key_hex TEXT NOT NULL, created TEXT NOT NULL)`);
  assert.equal(tablesOf(s).includes("knock_key"), true);
  /* and capture's declaration is unchanged by it: still none of doorbell's */
  assert.deepEqual(c.declareTables(), { ok: true, module: "capture", declared: true });
  assert.deepEqual(core.declaredTables().filter((d) => d.module === "capture" && DOORBELL_TABLES.includes(d.name)), []);
});

test("R87 (T44, N870): capture's acts read and write no table of doorbell's, even on a storage that holds them all with a key in knock_key", async () => {
  const b = bucket();
  const { s, c } = fresh({ evidence: b, env: { INSTANCE_NAME: "i" } });
  for (const t of DOORBELL_TABLES) s.db.exec(`CREATE TABLE ${t} (id INTEGER PRIMARY KEY, v TEXT)`);
  s.db.exec(`INSERT INTO knock_key (id, v) VALUES (1, 'held')`);
  const seen = [];
  const exec = s.sql.exec;
  s.sql.exec = (q, ...a) => { seen.push(String(q)); return exec.call(s.sql, q, ...a); };
  try {
    c.migrate();
    c.declareTables();
    assert.equal((await c.uploadCapture({ bytes: new TextEncoder().encode("held bytes"), statement: "mine", by: "m1" })).ok, true);
    await c.taskEnqueue({ captureSha: H("a"), subject: "s" });
    await c.recordSourceOutcome({ addressNorm: "https://x.example/", outcome: "fetch_failed" });
    c.recordLinks({ sourceCapture: H("a"), capturedAt: "2026-01-01T00:00:00Z", links: [{ ref: "u", address: "https://t.example/u", address_norm: "https://t.example/u" }] });
    c.resolveLinks({ sourceCapture: H("a") });
    c.renderAdmit({ allowanceMs: 1000, reserveMs: 10 });
    await c.heldCaptures({ viewer: "class:admin" });
    await c.gradeNoteOf({ captureSha: H("a") });
    c.counts();
    await askEveryFingerprint(c);
  } finally { s.sql.exec = exec; }
  assert.ok(seen.length > 20, `capture's acts ran (${seen.length} statements)`);
  assert.deepEqual(seen.filter((q) => doorbells(q).length), [], "no statement names a doorbell table");
  assert.deepEqual(s.sql.exec(`SELECT id, v FROM knock_key`).map((r) => ({ ...r })), [{ id: 1, v: "held" }], "knock_key untouched");
});
