/* calculations, fix round 9 (T51): the source read of a table. (1) A file that IS held is never stated absent because one read of it failed (K4850:
   `tabledeclare` answered SOURCE_NOT_READ in 2 of 6 calls on a CSV already read): a thrown read, and an empty answer for a file whose head says it is
   held, are a stated transient refusal (try again), distinct from a file that is not held; the outcome is logged (R-LOG: the sha, which it was, the
   error's name, written before the slow await as well as after, never the bytes). (2) R46: the table's bytes and cells bounds are the ones `READ_BOUNDS`
   quotes, and the refusal states the size and the bound. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { seeded, V } from "./fixture.mjs";
import { TABLE_MAX_BYTES, TABLE_MAX_CELLS } from "../../../src/calculations/index.mjs";
import { boundOf, statement } from "../../../src/read-bounds.mjs";

const F = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const HEADER = F.map((f) => f.name);
const code = (r) => (r && r.ok === false ? r.reason : "ok");
const declare = (w, id) => w.c.declareTable({ source: id, schema: { fields: F }, header: HEADER, by: V("bob") });
const data = (n) => Array.from({ length: n }, (_, i) => [`PBs${String(i).padStart(6, "0")}`, "P002", String(1 + (i % 97))]);
const csvText = (rows) => `${rows.map((r) => r.join(",")).join("\n")}\n`;

/* a CSV the evidence store holds, its reading recorded as a csv (R44's path) */
function held(w, rows) {
  const id = w.csv(csvText([HEADER, ...rows]));
  const cap = w.content.contentRow(id).capture_sha;
  w.ex.readings[cap] = { pageCount: 1, captureFormat: "csv" };
  w.ex.units[cap] = { units: [], state: "whole" };
  return { id, cap };
}

/* the module's log lines while `fn` runs */
async function logged(fn) {
  const lines = [], was = console.log;
  console.log = (...a) => { lines.push(a.map(String).join(" ")); };
  try { return { value: await fn(lines), lines }; } finally { console.log = was; }
}
const events = (lines) => lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter((e) => e && e.event === "table_source_read");

test("R1 R44 (K4850): a read of a held CSV that throws once is a stated transient refusal, not 'not held': nothing written, and the next call declares the table", async () => {
  const w = seeded();
  const { id, cap } = held(w, data(40));
  const real = w.ev.get.bind(w.ev);
  let n = 0;
  w.ev.get = async (k) => { if (k === cap && n++ === 0) throw new RangeError("the store hiccuped"); return real(k); };
  const before = w.count("calc_tables");
  const first = await declare(w, id);
  assert.equal(code(first), "SOURCE_NOT_READ");
  assert.equal(first.transient, true, "told as a failure to try again");
  assert.equal(w.count("calc_tables"), before, "nothing written");
  const second = await declare(w, id);
  assert.equal(code(second), "ok", "the file is held: the next call reads it");
  assert.equal(second.rows, 40);
  /* a file that is not held is refused as before, and says so differently */
  const w2 = seeded();
  const gone = held(w2, data(40));
  w2.ev.m.delete(gone.cap);
  const absent = await declare(w2, gone.id);
  assert.equal(code(absent), "SOURCE_NOT_READ");
  assert.notEqual(absent.transient, true, "absence is not transient");
  assert.notEqual(absent.detail, first.detail, "the two refusals do not say the same");
});

test("R1 R44 (K4850): a store that answers nothing once for a file its head says is held is transient; one that answers nothing and holds no head is not held", async () => {
  const w = seeded();
  const { id, cap } = held(w, data(40));
  const real = w.ev.get.bind(w.ev);
  let n = 0;
  w.ev.get = async (k) => (k === cap && n++ === 0 ? null : real(k));
  const first = await declare(w, id);
  assert.equal(code(first), "SOURCE_NOT_READ");
  assert.equal(first.transient, true, "the head names the file: an empty answer is a failed read");
  assert.equal(code(await declare(w, id)), "ok");
  const w2 = seeded();
  const gone = held(w2, data(40));
  const realGet = w2.ev.get.bind(w2.ev);
  w2.ev.get = async (k) => (k === gone.cap ? null : realGet(k));
  w2.ev.head = async () => null;
  const r = await declare(w2, gone.id);
  assert.equal(code(r), "SOURCE_NOT_READ");
  assert.notEqual(r.transient, true, "null from get and from head: not held");
});

test("R-LOG (K4850): the source read logs the sha, which outcome it was and the error's name, once before the read and once after, and never the bytes", async () => {
  const w = seeded();
  const { id, cap } = held(w, data(40));
  const real = w.ev.get.bind(w.ev);
  let seenAtGet = null, n = 0;
  w.ev.get = async (k, o) => { if (k !== cap) return real(k, o); if (seenAtGet === null) seenAtGet = events(currentLines).length; if (n++ === 0) throw new TypeError("secret-looking failure text"); return real(k, o); };
  let currentLines = [];
  const { lines } = await logged(async (l) => {
    currentLines = l;
    await declare(w, id);
    await declare(w, id);
  });
  const ev = events(lines);
  assert.equal(seenAtGet, 1, "the line for the first read was written before its slow await");
  assert.deepEqual(ev.map((e) => e.phase), ["start", "end", "start", "end"]);
  assert.ok(ev.every((e) => e.sha === cap && e.module === "calculations"));
  assert.deepEqual(ev.map((e) => e.outcome ?? null), [null, "thrown", null, "read"]);
  assert.equal(ev[1].error, "TypeError", "the error's name");
  const all = lines.join("\n");
  assert.ok(!all.includes("secret-looking"), "never the failure's text");
  assert.ok(!all.includes("PBs000001"), "never the bytes");
  /* the head names the file though the store answers none: its own outcome */
  const w2 = seeded();
  const h = held(w2, data(10));
  const realGet = w2.ev.get.bind(w2.ev);
  w2.ev.get = async (k) => (k === h.cap ? null : realGet(k));
  const out = await logged(() => declare(w2, h.id));
  assert.equal(events(out.lines).at(-1).outcome, "null_but_held");
});

/* ---- R46: the bounds are READ_BOUNDS' ---- */

test("R46 (G124): the table's bytes and cells bounds are the ones READ_BOUNDS quotes through boundOf, and src/calculations holds no numeric literal for either", () => {
  assert.equal(TABLE_MAX_BYTES, boundOf("table", "bytes"));
  assert.equal(TABLE_MAX_CELLS, boundOf("table", "cells"));
  const dir = fileURLToPath(new URL("../../../src/calculations/", import.meta.url));
  for (const f of ["tables.mjs", "index.mjs", "application.mjs", "patterns.mjs", "schema.mjs"]) {
    const src = readFileSync(`${dir}${f}`, "utf8");
    assert.ok(!/\b(?:20\s*\*\s*1024\s*\*\s*1024|20_?971_?520|1_?000_?000)\b/.test(src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")), `${f}: a table bound typed as a number`);
  }
  const tables = readFileSync(`${dir}tables.mjs`, "utf8");
  assert.match(tables, /TABLE_MAX_BYTES\s*=\s*boundOf\(\s*"table"\s*,\s*"bytes"\s*\)/);
  assert.match(tables, /TABLE_MAX_CELLS\s*=\s*boundOf\(\s*"table"\s*,\s*"cells"\s*\)/);
});

/* a one-column table of whole `lines` bytes: the header `v` and one cell a line, every line ended CRLF as the canonical bytes are */
function oneColumn(total) {
  const head = 3, cell = 1000000;
  const lines = [];
  let left = total - head;
  while (left > cell + 2) { lines.push("a".repeat(cell)); left -= cell + 2; }
  lines.push("a".repeat(left - 2));
  return `v\n${lines.join("\n")}\n`;
}

test("R46 (G124): a table of the bytes bound is declared, one byte over is refused TABLE_TOO_LARGE stating the size and the bound, nothing written; the cells bound's refusal names the cells", async () => {
  const bound = boundOf("table", "bytes");
  const w = seeded();
  const sch = { fields: [{ name: "v", type: "string" }] };
  const at = await w.c.declareTable({ source: w.csv(oneColumn(bound)), schema: sch, header: ["v"], by: V("bob") });
  assert.equal(code(at), "ok", JSON.stringify(at).slice(0, 300));
  assert.equal(at.bytes, bound, "the canonical table is exactly the bound");
  const w2 = seeded();
  const before = w2.count("calc_tables");
  const over = await w2.c.declareTable({ source: w2.csv(oneColumn(bound + 1)), schema: sch, header: ["v"], by: V("bob") });
  assert.equal(code(over), "TABLE_TOO_LARGE");
  assert.equal(over.bound, "bytes");
  assert.equal(over.max, bound);
  assert.equal(over.size, bound + 1, "the size measured");
  assert.equal(over.bound_key, statement("table", "bytes", 0).key);
  assert.ok(over.detail.includes(String(bound)) && over.detail.includes(String(bound + 1)), "the sentence says the size and the bound");
  assert.equal(w2.count("calc_tables"), before, "nothing written");
  /* control: the cells bound */
  const cells = boundOf("table", "cells");
  const wide = Array.from({ length: 10 }, (_, i) => `c${i}`);
  const w3 = seeded();
  const row = Array.from({ length: 10 }, () => "1").join(",");
  const text = `${wide.join(",")}\n${Array.from({ length: cells / 10 + 1 }, () => row).join("\n")}\n`;
  const tooMany = await w3.c.declareTable({ source: w3.csv(text), schema: { fields: wide.map((name) => ({ name, type: "integer" })) }, header: wide, by: V("bob") });
  assert.equal(code(tooMany), "TABLE_TOO_LARGE");
  assert.equal(tooMany.bound, "cells", "names the cells bound, not the bytes");
  assert.equal(tooMany.max, cells);
  assert.equal(tooMany.size, cells + 10);
  assert.equal(tooMany.bound_key, statement("table", "cells", 0).key);
});
