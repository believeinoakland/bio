/* calculations, fix round 9 (T51): R48 (G182; S-28, S-29) a table is read in bounded memory. The raw-document fallback judges the size before it
   loads and decodes by the document's own encoding; a declaration of the bytes bound survives the object's cap at 85 % of `capFor`; one act reads each
   bound table's bytes once and a plain read none. Reproduced on the tip first: a windows-1252 file read its accents as U+FFFD, and the whole capture
   was loaded before the size gate. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { seeded, V, R } from "./fixture.mjs";
import { TABLE_MAX_BYTES } from "../../../src/calculations/index.mjs";
import { capFor } from "../../../src/byte-ledger.mjs";

const F = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const HEADER = F.map((f) => f.name);
const code = (r) => (r && r.ok === false ? r.reason : "ok");
const latin1 = (s) => Uint8Array.from([...s].map((c) => c.charCodeAt(0)));
const declare = (w, source) => w.c.declareTable({ source, schema: { fields: F }, header: HEADER, by: V("bob") });

test("R48 (G182; S-29) a windows-1252 raw document is decoded by its own encoding: its accents are read, not replacement characters; UTF-8 and UTF-16 files are read as before", async () => {
  const w = seeded();
  const rows = [["Café", "Ñandú", "5"], ["Señor", "Ángel", "6"]];
  const text = `${[HEADER, ...rows].map((r) => r.join(",")).join("\n")}\n`;
  const id = w.csv(text);
  w.ev.m.set(w.content.contentRow(id).capture_sha, latin1(text));
  const t = await declare(w, id);
  assert.equal(code(t), "ok", JSON.stringify(t).slice(0, 300));
  assert.deepEqual((await w.c.readTable({ sha: t.sha, viewer: V("bob"), limit: 10 })).page.rows, rows);
  /* controls: the same text as UTF-8 (a different capture) and as UTF-16LE with its BOM make the same table */
  const utf8 = await declare(w, w.csv(text, { project: null, title: "utf8" }));
  assert.equal(utf8.sha, t.sha);
  const id16 = w.csv(`${text}\n`);
  w.ev.m.set(w.content.contentRow(id16).capture_sha, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, "utf16le")]));
  assert.equal((await declare(w, id16)).sha, t.sha, "a UTF-16 file with its BOM");
});

test("R48 (G182; S-29) the size is judged before the capture is loaded: a file whose head states a size over twice the bytes bound is refused TABLE_TOO_LARGE with the size and the bound, its body never read; so is one whose object states it", async () => {
  const w = seeded();
  const id = w.csv("payer,payee,amount\nP1,P2,5\n");
  const cap = w.content.contentRow(id).capture_sha;
  const real = w.ev.get.bind(w.ev), head = w.ev.head.bind(w.ev);
  let reads = 0;
  w.ev.head = async (k) => (k === cap ? { key: k, size: TABLE_MAX_BYTES * 3 } : head(k));
  w.ev.get = async (k) => { if (k === cap) reads++; return real(k); };
  const byHead = await declare(w, id);
  assert.equal(code(byHead), "TABLE_TOO_LARGE");
  assert.equal(byHead.bound, "bytes");
  assert.equal(byHead.size, TABLE_MAX_BYTES * 3);
  assert.equal(reads, 0, "the body was never asked for");
  w.ev.head = head;
  w.ev.get = async (k) => (k === cap ? { size: TABLE_MAX_BYTES * 3, text: async () => { reads++; return ""; }, arrayBuffer: async () => { reads++; return new ArrayBuffer(0); } } : real(k));
  const byObject = await declare(w, id);
  assert.equal(code(byObject), "TABLE_TOO_LARGE");
  assert.equal(byObject.size, TABLE_MAX_BYTES * 3);
  assert.equal(reads, 0, "the object's body was never read");
  assert.equal(w.count("calc_tables"), 0, "nothing written");
  w.ev.get = real;
  assert.equal(code(await declare(w, id)), "ok", "control: the same file, its size within the bound, is declared");
});

test("R48 (G182; S-28) a declaration of a table at the bytes bound survives the object's cap at 85 % of runtime-limits' capFor, and a page of it reads", () => {
  const mib = 20;
  const cap = Math.floor(0.85 * capFor(mib));
  const run = execFileSync(process.execPath, ["--import", fileURLToPath(new URL("../../platform-sqlite.mjs", import.meta.url)), "--expose-gc", `--max-old-space-size=${cap}`,
    fileURLToPath(new URL("./fixtures/declare-big.mjs", import.meta.url))], { encoding: "utf8", maxBuffer: 1 << 24, env: { ...process.env, CALC_BIG_CHILD: "1", CALC_BIG_MIB: "19.5" } });
  const out = JSON.parse(run.trim().split("\n").at(-1));
  assert.equal(out.ok, true, out.reason);
  assert.ok(out.source_mib > 19, "a table of about the bytes bound");
  assert.equal(out.page.length, 1);
});

test("R48 (G182; S-28) one act reads each bound table's bytes once, and the sight checks (read, gradeFactsOf, calcStatusOf) read none: with two tables the held-table cache cannot keep together, create loads each once", async () => {
  const w = seeded();
  const one = [{ name: "v", type: "number" }];
  const big = (tag) => `v\n${Array.from({ length: 130000 }, (_, i) => `${tag}${i % 10}`.padEnd(98, "0")).join("\n")}\n`;
  const mk = async (tag) => { const r = await w.c.declareTable({ source: w.csv(big(tag)), schema: { fields: [{ name: "v", type: "string" }] }, header: ["v"], by: V("bob") }); assert.equal(r.ok, true, JSON.stringify(r).slice(0, 200)); return r.sha; };
  void one;
  const a = await mk("a"), b = await mk("b");
  let chunkReads = 0, storeReads = 0;
  const exec = w.st.sql.exec.bind(w.st.sql);
  w.st.sql.exec = (q, ...args) => { if (/FROM calc_table_bytes/.test(q)) chunkReads++; return exec(q, ...args); };
  const get = w.ev.get.bind(w.ev);
  w.ev.get = async (k) => { storeReads++; return get(k); };
  const recipe = R([{ op: "count", from: "ta", as: "na" }, { op: "count", from: "tb", as: "nb" }, { op: "difference", a: "na", b: "nb", as: "d" }], "d",
    [{ name: "ta", kind: "table" }, { name: "tb", kind: "table" }]);
  const c = await w.c.create({ question: "How many more?", period: { from: "2025-07-01", to: "2026-06-30" }, kind: "difference", inputs: [{ name: "ta", table: a }, { name: "tb", table: b }], recipe, by: V("bob") });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  const during = chunkReads + storeReads;
  assert.ok(during <= 2, `create read the bytes of two tables ${during} times`);
  chunkReads = 0; storeReads = 0;
  await w.c.read({ calcId: c.calc_id, viewer: V("bob") });
  w.c.gradeFactsOf({ calcId: c.calc_id, viewer: V("bob") });
  w.c.calcStatusOf({ calcId: c.calc_id, viewer: V("bob") });
  assert.equal(chunkReads + storeReads, 0, "the sight checks read no table's bytes");
});

test("R48 (G182; S-28) readTable reads only the page asked: limit 1 over a 150,000-row table answers one row in table.rows and in the page, the next page continues, rows: all answers every row, and the cap holds", async () => {
  const w = seeded();
  const n = 150000;
  const text = `payer,payee,amount\n${Array.from({ length: n }, (_, i) => `P${i},Q${i},${i}`).join("\n")}\n`;
  const t = await declare(w, w.csv(text));
  assert.equal(t.rows, n);
  const one = await w.c.readTable({ sha: t.sha, viewer: V("bob"), limit: 1 });
  assert.equal(one.table.rows.length, 1);
  assert.deepEqual(one.table.rows[0], { payer: "P0", payee: "Q0", amount: "0" });
  assert.deepEqual(one.page.rows, [["P0", "Q0", "0"]]);
  assert.equal(one.page.truncated, true);
  const deep = await w.c.readTable({ sha: t.sha, viewer: V("bob"), limit: 2, after: n - 2 });
  assert.deepEqual(deep.page.rows, [[`P${n - 2}`, `Q${n - 2}`, String(n - 2)], [`P${n - 1}`, `Q${n - 1}`, String(n - 1)]]);
  assert.equal(deep.page.truncated, false);
  assert.equal((await w.c.readTable({ sha: t.sha, viewer: V("bob"), limit: 1, rows: "all" })).table.rows.length, n, "control: every row when asked for");
  assert.equal((await w.c.readTable({ sha: t.sha, viewer: V("bob"), limit: 5000 })).page.rows.length, 1000, "the page bound holds");
});
