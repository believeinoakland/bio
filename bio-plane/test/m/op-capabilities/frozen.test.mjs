/* op-capabilities: frozen data, no import, no I/O, no place (R2). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { needsRows } from "../../../src/op-capabilities/index.mjs";

const SRC = new URL("../../../src/op-capabilities/index.mjs", import.meta.url);

test("R2: the answer is frozen data — frozen, a plain object, refusing a write, and a second independent load answers byte-identical rows", async () => {
  const rows = needsRows();
  assert.ok(Object.isFrozen(rows));
  assert.equal(Object.getPrototypeOf(rows), Object.prototype);
  assert.throws(() => { "use strict"; rows.promote = null; }, TypeError);
  assert.throws(() => { "use strict"; rows.newop = "contribute"; }, TypeError);
  const again = await import(`../../../src/op-capabilities/index.mjs?second=${performance.now()}`);
  assert.notEqual(again.needsRows(), rows);
  assert.equal(JSON.stringify(again.needsRows()), JSON.stringify(rows));
});

test("R2: the module imports nothing", () => {
  const text = readFileSync(SRC, "utf8");
  assert.doesNotMatch(text, /^\s*import\b/m);
  assert.doesNotMatch(text, /\bimport\s*\(/);
  assert.doesNotMatch(text, /\brequire\s*\(/);
});

test("R2: importing it and calling needsRows touches no network, clock, randomness, timer or environment", async () => {
  const touched = [];
  const saved = { fetch: globalThis.fetch, now: Date.now, random: Math.random, setTimeout: globalThis.setTimeout,
                  setInterval: globalThis.setInterval, getRandomValues: crypto.getRandomValues, env: process.env };
  const trap = (name) => () => { touched.push(name); throw new Error(`R2: ${name}`); };
  const RealDate = Date;
  try {
    globalThis.fetch = trap("fetch");
    globalThis.setTimeout = trap("setTimeout");
    globalThis.setInterval = trap("setInterval");
    Math.random = trap("Math.random");
    crypto.getRandomValues = trap("getRandomValues");
    globalThis.Date = new Proxy(RealDate, { construct() { touched.push("new Date"); throw new Error("R2"); },
                                            apply() { touched.push("Date()"); throw new Error("R2"); },
                                            get(t, k) { return k === "now" ? trap("Date.now") : Reflect.get(t, k); } });
    const runtimeOwn = (k) => k === "WATCH_REPORT_DEPENDENCIES" || k.startsWith("NODE_");
    process.env = new Proxy({}, { get(_, k) { if (typeof k === "string" && !runtimeOwn(k)) touched.push(`env.${k}`); return undefined; } });
    const m = await import("../../../src/op-capabilities/index.mjs?r2");
    m.needsRows(); m.needsRows();
  } finally {
    globalThis.fetch = saved.fetch; Math.random = saved.random; globalThis.setTimeout = saved.setTimeout;
    globalThis.setInterval = saved.setInterval; crypto.getRandomValues = saved.getRandomValues;
    process.env = saved.env; globalThis.Date = RealDate;
  }
  assert.deepEqual(touched, []);
});

test("R2: no place is named in a row or a comment", () => {
  const PLACE = /\b(oakland|alameda|california|berkeley|san francisco|bay area|city of|county of|state of)\b/i;
  for (const [op, cap] of Object.entries(needsRows())) assert.doesNotMatch(`${op} ${cap}`, PLACE);
  const text = readFileSync(SRC, "utf8");
  for (const line of text.split("\n")) assert.doesNotMatch(line, PLACE, line.slice(0, 120));
});
