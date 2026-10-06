/* calculations: declared tables (R1–R3). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, sha } from "./fixture.mjs";
import { canonicalCsv, parseCsv, ROLES, MONEY_ROLES, KEY_ROLES, ROSTER_ROLES, TABLE_MAX_BYTES, TABLE_MAX_CELLS }
  from "../../../src/calculations/index.mjs";

const code = (r) => (r && r.ok === false ? r.reason : "ok");
const F = [{ name: "vendor", type: "string" }, { name: "amount", type: "number", currency: "USD" }, { name: "paid", type: "date" }];
const HEADER = F.map((f) => f.name);
const CSV = "vendor,amount,paid\r\nAcme,\"1,200.50\",2025-08-01\nBeta,n/a,2025-09-31\n\"Gamma, Inc.\",300,2025-10-02\n";

test("R1 declareTable's refusals in order, each with a negative control: NO_SOURCE, the extent's refusal (NO_SUCH_CONTENT, a hidden source answered alike), NO_HEADER, BAD_SCHEMA naming the field, TABLE_TOO_LARGE naming the bound; a refusal writes nothing", async () => {
  const w = seeded();
  const source = w.csv(CSV);
  const good = { source, schema: { fields: F }, header: HEADER, by: V("bob") };
  const before = w.snapshot();
  assert.equal(code(await w.c.declareTable({ ...good, source: null })), "NO_SOURCE");
  assert.equal(code(await w.c.declareTable({ ...good, source: " " })), "NO_SOURCE");
  assert.equal(code(await w.c.declareTable({ ...good, source: "f".repeat(64) })), "NO_SUCH_CONTENT", "a content id the record does not hold");
  const P = w.project("Private", "alice");
  const hidden = w.csv(`${CSV}\r\n`, { project: P });
  const h = await w.c.declareTable({ ...good, source: hidden, by: V("carol") });
  const absent = await w.c.declareTable({ ...good, source: "e".repeat(64), by: V("carol") });
  assert.equal(code(h), "NO_SUCH_CONTENT", "a source the declarer may not see answers as an absent one");
  assert.deepEqual({ ...h, content_id: null }, { ...absent, content_id: null });
  for (const header of [undefined, null, [], ["a", "a"], ["a", ""], [1, 2]])
    assert.equal(code(await w.c.declareTable({ ...good, header })), "NO_HEADER", JSON.stringify(header));
  const badSchemas = [
    [{ fields: [] }, null], [{ fields: F.slice(0, 2) }, null],
    [{ fields: [F[0], { name: "amount", type: "money" }, F[2]] }, "amount"],
    [{ fields: [F[0], { name: "amt", type: "number" }, F[2]] }, "amt"],
    [{ fields: [F[0], { name: "amount", type: "number", currency: "dollars" }, F[2]] }, "amount"],
    [{ fields: F, primaryKey: "vendor" }, "primaryKey"],
  ];
  for (const [schema, field] of badSchemas) {
    const r = await w.c.declareTable({ ...good, schema });
    assert.equal(code(r), "BAD_SCHEMA", JSON.stringify(schema));
    assert.equal(r.field, field, "the refusal names the field");
  }
  const ragged = w.csv("vendor,amount,paid\nAcme,1,2025-01-01,extra\n");
  assert.equal(code(await w.c.declareTable({ ...good, source: ragged })), "BAD_SCHEMA", "a row wider than the header");
  assert.deepEqual(w.snapshot(), { ...before, ...pick(w.snapshot(), before) }, "no calculations table gained a row");
  assert.equal(w.count("calc_tables"), 0);
  /* the bounds: cells, then bytes */
  const wide = Array.from({ length: 1000 }, (_, i) => `c${i}`);
  const many = w.csv(`${wide.join(",")}\n${Array.from({ length: 501 }, () => wide.map(() => "1").join(",")).join("\n")}\n`);
  const tooMany = await w.c.declareTable({ source: many, schema: { fields: wide.map((name) => ({ name, type: "integer" })) }, header: wide, by: V("bob") });
  assert.equal(code(tooMany), "TABLE_TOO_LARGE");
  assert.equal(tooMany.bound, "cells");
  assert.equal(tooMany.max, TABLE_MAX_CELLS);
  const big = w.csv(`a\n${"x".repeat(1024 * 1024)}\n`.repeat(1) + `${"y".repeat(1024 * 1024)}\n`.repeat(20));
  const tooBig = await w.c.declareTable({ source: big, schema: { fields: [{ name: "a", type: "string" }] }, header: ["a"], by: V("bob") });
  assert.equal(code(tooBig), "TABLE_TOO_LARGE");
  assert.equal(tooBig.bound, "bytes");
  assert.equal(tooBig.max, TABLE_MAX_BYTES);
  assert.equal(w.count("calc_tables"), 0, "nothing written by any refusal");
  /* negative controls: under the cell bound, and the good declaration */
  const under = w.csv(`${wide.join(",")}\n${Array.from({ length: 500 }, () => wide.map(() => "2").join(",")).join("\n")}\n`);
  assert.equal(TABLE_MAX_CELLS, 500000, "K1576");
  assert.equal((await w.c.declareTable({ source: under, schema: { fields: wide.map((name) => ({ name, type: "integer" })) }, header: wide, by: V("bob") })).ok, true, "500,000 cells, the bound itself, is admitted");
  assert.equal((await w.c.declareTable(good)).ok, true);
});

function pick(now, before) {
  const out = {};
  for (const k of Object.keys(now)) if (!k.startsWith("calc_") && k !== "calculations") out[k] = now[k];
  for (const k of Object.keys(before)) if (k.startsWith("calc_") || k === "calculations") out[k] = before[k];
  return out;
}

test("R1 a table is held as canonical RFC 4180 UTF-8 CSV plus its schema, keyed by the canonical bytes' sha256, its bytes in the evidence store; a value that does not parse as its column's type is held undetermined, never coerced", async () => {
  const w = seeded();
  const r = await w.c.declareTable({ source: w.csv(CSV), schema: { fields: F }, header: HEADER, by: V("bob") });
  assert.equal(r.ok, true);
  const rows = parseCsv(CSV).rows.slice(1);
  const canonical = canonicalCsv(HEADER, rows);
  assert.equal(canonical, "vendor,amount,paid\r\nAcme,\"1,200.50\",2025-08-01\r\nBeta,n/a,2025-09-31\r\n\"Gamma, Inc.\",300,2025-10-02\r\n");
  assert.equal(r.sha, sha(canonical), "keyed by the sha256 of the canonical bytes");
  assert.equal(new TextDecoder().decode(w.ev.m.get(r.sha)), canonical, "the bytes are in the evidence store, as written");
  assert.deepEqual(r.schema, { fields: F });
  assert.equal(r.rows, 3);
  assert.equal(r.undetermined.count, 2);
  assert.deepEqual(r.undetermined.cells.map((c) => [c.row, c.column]), [[1, "amount"], [1, "paid"]]);
  const read = await w.c.readTable({ sha: r.sha, viewer: V("carol") });
  assert.equal(read.found, true);
  assert.deepEqual(read.page.rows, [["Acme", "1,200.50", "2025-08-01"], ["Beta", "n/a", "2025-09-31"], ["Gamma, Inc.", "300", "2025-10-02"]], "held as written: n/a is not zero and the impossible date is not moved");
  assert.deepEqual(read.table.fields, F, "the shape workbooks reads (K1563 (6))");
  assert.deepEqual(read.table.rows[0], { vendor: "Acme", amount: "1,200.50", paid: "2025-08-01" });
  assert.equal(read.table.grade_facts.capture_grade, "B");
  assert.equal(read.table.grade_facts.grade, "B");
  const absentTable = await w.c.readTable({ sha: "0".repeat(64), viewer: V("carol") });
  assert.equal(absentTable.found, false);
  /* the same table from a source with a different line ending and no header row is the same table */
  const again = await w.c.declareTable({ source: w.csv("Acme,\"1,200.50\",2025-08-01\r\nBeta,n/a,2025-09-31\r\n\"Gamma, Inc.\",300,2025-10-02"), schema: { fields: F }, header: HEADER, by: V("bob") });
  assert.equal(again.sha, r.sha);
  assert.equal(again.already, true);
  assert.equal(w.count("calc_tables"), 1);
  /* a workbook range is a source too: its typed cells, in row then column order */
  const cells = [["A1", "vendor"], ["B1", "amount"], ["C1", "paid"], ["A2", "Acme"], ["B2", "1,200.50"], ["C2", "2025-08-01"]]
    .map(([cell, value]) => ({ source: { cell }, value, type: "s" }));
  const range = await w.c.declareTable({ source: w.sheet(cells, "A1:C2"), schema: { fields: F }, header: HEADER, by: V("bob") });
  assert.equal(range.ok, true);
  assert.equal(range.rows, 1);
  assert.equal(new TextDecoder().decode(w.ev.m.get(range.sha)), "vendor,amount,paid\r\nAcme,\"1,200.50\",2025-08-01\r\n");
  /* no evidence store bound: refused, nothing written */
  const bare = seeded({ evidence: false });
  const src = bare.csv(CSV);
  assert.equal(code(await bare.c.declareTable({ source: src, schema: { fields: F }, header: HEADER, by: V("bob") })), "SOURCE_NOT_READ");
});

test("R2 a column may carry a role from the closed lists (money roles, person and entity keys naming how they resolve, roster roles); a declaration is the member's and a machine may not declare one (K1468)", async () => {
  const w = seeded();
  assert.deepEqual(MONEY_ROLES, ["amount", "payer", "payee", "fund", "account", "period", "kind", "phase", "stage", "basis", "currency"]);
  assert.deepEqual(KEY_ROLES, ["person_key", "entity_key"]);
  assert.deepEqual(ROSTER_ROLES, ["roster_person", "roster_organisation", "roster_post", "roster_period"]);
  for (const r of [...MONEY_ROLES, ...KEY_ROLES, ...ROSTER_ROLES]) assert.ok(ROLES.includes(r));
  const fields = [{ name: "who", type: "string" }, { name: "amount", type: "number" }];
  const source = w.csv("who,amount\nS-00012,10\n");
  const declare = (roles, by = V("bob")) => w.c.declareTable({ source, schema: { fields }, header: ["who", "amount"], roles, by });
  assert.equal(code(await declare({ who: { role: "payee", scheme: "vendor" } }, MACHINE)), "MEMBER_ACT_ONLY", "a machine may not declare a table");
  assert.equal(code(await declare({ who: { role: "payee", scheme: "vendor" } }, "")), "MEMBER_ACT_ONLY");
  const bad = [
    { who: { role: "importance" } },                              // not in the closed lists
    { who: { role: "payee" } },                                   // names no way it resolves
    { who: { role: "payee", scheme: "vendor", space: "vendor" } }, // names two
    { amount: { role: "amount", scheme: "x" } },                  // a value role names no resolver
    { nobody: { role: "amount" } },                               // not a column
    { who: { role: "person_key", crosswalk: { table: "x", from: "a", to: "b" } } }, // a crosswalk is a declared table's sha
    { who: { role: "crosswalk_from" } },                          // one end of a crosswalk
  ];
  for (const roles of bad) assert.equal(code(await declare(roles)), "BAD_SCHEMA", JSON.stringify(roles));
  assert.equal(w.count("calc_tables"), 0);
  const ok = await declare({ who: { role: "payee", scheme: "vendor" }, amount: { role: "amount" } });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.roles, { who: { role: "payee", scheme: "vendor" }, amount: { role: "amount" } });
  /* a crosswalk names a table declared with both crosswalk ends */
  const cw = await w.c.declareTable({ source: w.csv("vendor_no,entity\nS-00012,ENT-2026-0007\n"), schema: { fields: [{ name: "vendor_no", type: "string" }, { name: "entity", type: "string" }] },
    header: ["vendor_no", "entity"], roles: { vendor_no: { role: "crosswalk_from" }, entity: { role: "crosswalk_to" } }, by: V("bob") });
  assert.equal(cw.ok, true);
  const via = await w.c.declareTable({ source: w.csv("who,amount\nS-00012,11\n"), schema: { fields }, header: ["who", "amount"],
    roles: { who: { role: "person_key", crosswalk: { table: cw.sha, from: "vendor_no", to: "entity" } } }, by: V("bob") });
  assert.equal(via.ok, true);
  const notCw = await w.c.declareTable({ source: w.csv("who,amount\nS-00012,12\n"), schema: { fields }, header: ["who", "amount"],
    roles: { who: { role: "person_key", crosswalk: { table: ok.sha, from: "who", to: "amount" } } }, by: V("bob") });
  assert.equal(code(notCw), "BAD_SCHEMA", "a table not declared as a crosswalk is not one");
});

test("R3 a table may carry a vintage under a key the member names; tablesAt answers the vintage valid at the date through civil-time.validAt, or undetermined with the reason, never the latest by default", async () => {
  const w = seeded();
  const fields = [{ name: "x", type: "integer" }];
  const vint = (n, valid, extra = {}) => w.table(`x\n${n}\n`, fields, { vintage: { key: "rates", valid, basis: "the schedule's own dates", ...extra } });
  const a = await vint(1, { from: "2023-01-01", to: "2023-12-31" });
  const b = await vint(2, { from: "2024-01-01", to: "2024-12-31" });
  const at = (date, viewer = V("carol")) => w.c.tablesAt({ key: "rates", at: date, viewer });
  assert.equal((await at("2023-06-01")).table, a.sha, "the vintage valid at the date, though a later one is held");
  assert.equal((await at("2023-06-01")).state, "determined");
  assert.equal((await at("2024-02-29")).table, b.sha);
  const none = await at("2025-03-01");
  assert.equal(none.state, "undetermined");
  assert.equal(none.table, null, "never the latest by default");
  assert.match(none.why, /no vintage/);
  const c = await vint(3, { from: "2024-06-01", to: null });
  const two = await at("2024-07-01");
  assert.equal(two.state, "undetermined");
  assert.match(two.why, /undetermined|valid on/);
  const open = await at("2026-01-01");
  assert.equal(open.state, "undetermined", "a null bound is not stated, never always");
  assert.match(open.why, /no end is stated/);
  assert.equal(open.vintages.find((v) => v.sha === c.sha).at, "undetermined");
  const d = await vint(4, { from: "2022-01-01", to: "2022-12-31" });
  const e = await vint(5, { from: "2022-06-01", to: "2022-12-31" });
  const both = await at("2022-07-01");
  assert.equal(both.state, "undetermined");
  assert.match(both.why, /2 vintages are each valid/);
  assert.ok([d.sha, e.sha].every((s) => both.vintages.some((v) => v.sha === s)));
  assert.equal(code(w.c.tablesAt({ key: "", at: "2023-01-01", viewer: V("bob") })), "NO_KEY");
  assert.equal(code(w.c.tablesAt({ key: "rates", at: "2023-02-30", viewer: V("bob") })), "NO_DATE");
  assert.equal(code(await w.c.declareTable({ source: w.csv("x\n9\n"), schema: { fields }, header: ["x"], vintage: { key: "rates", valid: { from: "2023-13-01" } }, by: V("bob") })), "BAD_SCHEMA");
  assert.equal(code(await w.c.declareTable({ source: w.csv("x\n9\n"), schema: { fields }, header: ["x"], vintage: { key: "rates", valid: { from: null, to: null }, supersedes: "0".repeat(64) }, by: V("bob") })), "BAD_SCHEMA", "it supersedes a held table");
});
