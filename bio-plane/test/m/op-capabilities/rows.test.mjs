/* op-capabilities: the hand-written rows (R1). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { needsRows } from "../../../src/op-capabilities/index.mjs";

const golden = JSON.parse(readFileSync(new URL("./golden-rows.json", import.meta.url), "utf8"));
const CAPS = ["contribute", "publish", "create_projects", null];

test("R1: needsRows answers the 323 hand-written rows exactly as op-declarations held them at T49's opening — the same names and values, no more and no fewer, each value a capability or a present null", () => {
  const rows = needsRows();
  assert.deepEqual(Object.keys(rows).sort(), Object.keys(golden).sort());
  for (const [op, cap] of Object.entries(golden)) assert.equal(rows[op], cap, op);
  assert.equal(Object.keys(rows).length, 323);
  for (const [op, cap] of Object.entries(rows)) assert.ok(CAPS.includes(cap), `${op}: ${cap}`);
  assert.deepEqual(Object.keys(rows).sort(), Object.keys(rows).filter((k, i, a) => a.indexOf(k) === i).sort());
});

test("R1: the count by value — contribute 185, publish 7 (ratify, caseratify, publishat, publish, reviewgrant, reviewrevoke, strengthbar), create_projects 1 (projectfork), a present null 130", () => {
  const by = {};
  for (const v of Object.values(needsRows())) by[String(v)] = (by[String(v)] ?? 0) + 1;
  assert.deepEqual(by, { contribute: 185, publish: 7, create_projects: 1, null: 130 });
  const pub = Object.keys(needsRows()).filter((k) => needsRows()[k] === "publish").sort();
  assert.deepEqual(pub, ["caseratify", "publish", "publishat", "ratify", "reviewgrant", "reviewrevoke", "strengthbar"]);
  assert.deepEqual(Object.keys(needsRows()).filter((k) => needsRows()[k] === "create_projects"), ["projectfork"]);
});

test("R1 (control): an op with no row answers undefined, not null; a stated null is present", () => {
  const rows = needsRows();
  assert.equal(rows.nosuchop, undefined);
  assert.equal(Object.hasOwn(rows, "nosuchop"), false);
  assert.equal(rows.moneydetectorsrun, null);
  assert.equal(Object.hasOwn(rows, "moneydetectorsrun"), true);
  /* no alias or family row is held here: the names equal the golden copy of the pre-split hand rows (the first test),
     and that the hand rows share no key with the family rows or the aliases is op-declarations' composition test */
});
