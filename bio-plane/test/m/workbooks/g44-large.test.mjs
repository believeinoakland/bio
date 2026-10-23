/* G44 (fix round 6; K4662, K4665, K4655): a large workbook is refused, stated, before it can kill the object, and the
   largest one the add holds survives the workbook's whole lifecycle. Each case goes through `workbooksOps(...)` over the
   fixture's `world()`, the real modules on a real database, in a child process whose old space is capped as the plane's
   object leaves it (the sheet-worker-free stub engine answers every formula cell). Ids: R1 (amended: the order of its
   refusals, WORKBOOK_FILE_TOO_LARGE and WORKBOOK_TOO_LARGE) and R2 (a read of a workbook stored over the bound). */
import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { world, V, BASIC } from "./fixture.mjs";
import * as S from "./g44-shapes.mjs";
import { xlsxEntry } from "../../../src/formats-xlsx.mjs";
import { WORKBOOK_FILE_MAX_BYTES, WORKBOOK_CELLS_MAX } from "../../../src/workbooks/index.mjs";

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const PRELOAD = join(HERE, "../../platform-sqlite.mjs");
const MB = 1e6;

/* The plane's object holds 128 MB of old space and its own state costs 87.7 above an idle of 39 on the platform
   (diagnosis-R6-g40, g44); this child's idle after gc is IDLE_MB, so a file of `bytes` leaves the work
   `128 + 39 - 87.7 + IDLE_MB - bytes/1e6` MB of old space: the real-shape cap. */
const IDLE_MB = 33.4;
const capFor = (bytes) => Math.floor(128 + 39 - 87.7 + IDLE_MB - bytes / MB);

/** One job in a capped child: the lines it printed, as an object; `alive` when it reached its last line. */
async function inChild(t, shape, job, extra = "") {
  const dir = mkdtempSync(join(tmpdir(), "g44-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, "book.xlsx");
  if (shape) writeFileSync(file, shape.bytes);
  const cap = capFor(shape ? shape.bytes.length : 20_000);
  let stdout = "";
  try {
    ({ stdout } = await run(process.execPath, ["--import", PRELOAD, "--expose-gc", `--max-old-space-size=${cap}`,
      join(HERE, "g44-child.mjs"), shape ? file : "-", job, String(extra)], { maxBuffer: 1 << 28 }));
  } catch (e) { stdout = e.stdout || ""; }
  const out = Object.assign({}, ...stdout.split("\n").filter(Boolean).map((l) => JSON.parse(l)));
  out.alive = "endMB" in out;
  out.cap = cap;
  t.diagnostic(`cap ${cap} MB, idle ${out.idleMB?.toFixed(1)}, end ${out.endMB?.toFixed(1)}, alive ${out.alive}`);
  assert.ok(out.idleMB < IDLE_MB + 0.7, `the child's idle ${out.idleMB} is above the figure the cap was set from; recalibrate IDLE_MB`);
  return out;
}
const lifecycleOk = (r, why) => {
  assert.equal(r.alive, true, `${why}: the child must survive`);
  assert.equal(r.add.ok, true, why);
  for (const k of ["read", "lint", "inputs", "recompute"]) assert.equal(r[k].ok, true, `${why}: ${k} ${JSON.stringify(r[k])}`);
  /* explainLint lints the whole workbook before it looks for the finding: a workbook with none answers NO_SUCH_FINDING, having done the work */
  assert.ok(r.explain.ok || r.explain.reason === "NO_SUCH_FINDING", `${why}: explain ${JSON.stringify(r.explain)}`);
};

test("R1 a workbook of 221,376 cells (10 MiB declared, a 1.4 MB file) at the real-shape cap is refused with its cell count and the bound, writes nothing, and the object lives", async (t) => {
  const f = S.constants(73792);
  assert.ok(f.declared > 10 * 1024 * 1024 - 1024 && f.declared < 10 * 1024 * 1024 + 1024, `declares ${f.declared}`);
  const r = await inChild(t, f, "add");
  assert.equal(r.alive, true, "the child must survive");
  assert.equal(r.add.reason, "WORKBOOK_TOO_LARGE");
  assert.equal(r.add.cells, 221376);
  assert.equal(r.add.bound_cells, WORKBOOK_CELLS_MAX);
  assert.equal(r.changed, false, "nothing is written");
  assert.equal(r.cells, 0);
});

test("R1 R2 control: a 23,103-cell workbook (1 MiB declared) adds, and readWorkbook, lint, inputsOf, explainLint and recompute answer in the same cap", async (t) => {
  const f = S.constants(7701);
  assert.equal(f.cells, 23103);
  const r = await inChild(t, f, "lifecycle");
  lifecycleOk(r, "23,103 cells");
  assert.equal(r.cells, 23103);
});

test("R1 R2 a workbook of the bound's cells adds and its whole lifecycle answers at the real-shape cap; one cell more is refused with its count", async (t) => {
  const under = S.constants(16666);
  assert.ok(under.cells <= WORKBOOK_CELLS_MAX && under.cells > WORKBOOK_CELLS_MAX - 3);
  const r = await inChild(t, under, "lifecycle");
  lifecycleOk(r, "constants at the bound");
  assert.equal(r.cells, under.cells);
  const exact = S.minimal(6250);
  assert.equal(exact.cells, WORKBOOK_CELLS_MAX, "exactly the bound is held");
  lifecycleOk(await inChild(t, exact, "lifecycle"), "minimal cells, exactly the bound");
  const over = S.constants(16667);
  assert.ok(over.cells > WORKBOOK_CELLS_MAX);
  const o = await inChild(t, over, "add");
  assert.equal(o.alive, true);
  assert.equal(o.add.reason, "WORKBOOK_TOO_LARGE");
  assert.equal(o.add.cells, over.cells);
  assert.equal(o.add.bound_cells, WORKBOOK_CELLS_MAX);
  assert.equal(o.changed, false);
});

test("R1 R2 formula-heavy workbooks at the bound (two and three formulas a row, and 50,000 cells of 185-byte formulas) survive every read and the recompute at the real-shape cap", async (t) => {
  for (const [label, f] of [["two formulas a row", S.formulas(16666, { perRow: 2 })], ["three formulas a row", S.formulas(12500, { perRow: 3 })],
                            ["three long formulas a row", S.formulas(12500, { perRow: 3, pad: 5 })]]) {
    assert.ok(f.cells <= WORKBOOK_CELLS_MAX, label);
    const r = await inChild(t, f, "lifecycle");
    lifecycleOk(r, label);
    assert.equal(r.cells, f.cells, label);
  }
});

test("R1 the count bound fires on a workbook of one-character cells that is far under the byte cap, and the byte cap fires on few, large cells; each refusal names the condition that fired", async (t) => {
  const many = S.minimal(6251);
  assert.ok(many.cells > WORKBOOK_CELLS_MAX && many.declared < 2 * 1024 * 1024);
  const a = await inChild(t, many, "add");
  assert.equal(a.alive, true);
  assert.equal(a.add.reason, "WORKBOOK_TOO_LARGE");
  assert.equal(a.add.condition, "cell_count");
  assert.equal(a.add.cells, many.cells);
  const large = S.wide(1100, 9000);
  assert.ok(large.cells < WORKBOOK_CELLS_MAX);
  const b = await inChild(t, large, "add");
  assert.equal(b.alive, true);
  assert.equal(b.add.reason, "WORKBOOK_TOO_LARGE");
  assert.equal(b.add.condition, "cell_bytes");
  assert.equal(b.changed, false);
  /* just under the byte cap: held, and every read answers */
  lifecycleOk(await inChild(t, S.wide(900, 9000), "lifecycle"), "900 cells of 9,000 characters");
});

test("R1 a file whose text is over the reader's whole-read bound (26.2 MB declared) is refused as WORKBOOK_FILE_TOO_LARGE with the declared size and the bound as MB, never NOT_A_WORKBOOK, and the object lives; a capture stored above the size gate is refused with its size", async (t) => {
  const f = S.constants(180300);
  assert.ok(f.declared > 26_000_000 && f.declared < 26_600_000, `declares ${f.declared}`);
  const r = await inChild(t, f, "add");
  assert.equal(r.alive, true, "the refusal must fit the real-shape cap");
  assert.equal(r.add.reason, "WORKBOOK_FILE_TOO_LARGE");
  assert.equal(r.add.size, (f.declared / MB).toFixed(1));
  assert.equal(r.add.bound, (20 * 1024 * 1024 / MB).toFixed(1));
  assert.equal(r.add.condition, "declared_text");
  assert.equal(r.changed, false);
  /* in this process: a 41 MB capture that is not a workbook is told "file", from the store's head, before any byte loads */
  const w = world();
  for (const m of ["alice", "bob"]) w.member(m, m === "alice" ? { role: "admin" } : {});
  const P = w.project("Rates", "bob");
  const big = new Uint8Array(41 * MB).fill(7);
  const cap = w.capture(big).capSha;
  const asked = [];
  const bytesOf = w.wb.bytesOf;
  w.wb.bytesOf = async (sha) => { asked.push(sha); return bytesOf.call(w.wb, sha); };
  const before = w.snapshot();
  const good = { captureSha: cap, question: "What does it cost?", period: "FY2025", project: P, by: V("bob") };
  const g = await w.wb.addWorkbook(good);
  assert.equal(g.reason, "WORKBOOK_FILE_TOO_LARGE");
  assert.equal(g.size, (big.length / MB).toFixed(1));
  assert.equal(g.bound, (WORKBOOK_FILE_MAX_BYTES / MB).toFixed(1));
  assert.equal(g.size_bytes, big.length);
  assert.equal(g.condition, "stored_size");
  assert.ok(g.detail && !/[{}]/.test(g.detail), "its words hold the figures");
  assert.deepEqual(asked, [], "the capture's bytes were not asked for");
  assert.deepEqual(w.snapshot(), before);
});

test("R1 the cheap refusals and a repeat read no cells, and a capture held in parts is gated by its total before its bytes are asked for", async () => {
  const w = world();
  for (const m of ["alice", "bob"]) w.member(m, m === "alice" ? { role: "admin" } : {});
  const P = w.project("Rates", "bob");
  const cap = w.capture(BASIC()).capSha;
  const reads = [];
  const text = xlsxEntry.text;
  xlsxEntry.text = async (...a) => { reads.push(a.length); return text.apply(xlsxEntry, a); };
  try {
    const good = { captureSha: cap, question: "What does it cost?", period: "FY2025", project: P, by: V("bob") };
    for (const [call, code] of [[{ ...good, question: "" }, "NO_QUESTION"], [{ ...good, period: "" }, "NO_PERIOD"], [{ ...good, project: "nope" }, "NO_PROJECT"]])
      assert.equal((await w.wb.addWorkbook(call)).reason, code);
    assert.deepEqual(reads, [], "a refused add reads no cells");
    assert.equal((await w.wb.addWorkbook(good)).already, false);
    assert.equal(reads.length, 1, "the first add reads once");
    assert.equal((await w.wb.addWorkbook(good)).already, true);
    assert.equal(reads.length, 1, "a repeat reads no cells");
    /* the read is given the cap, so the object holds no more than the bound */
    assert.equal(reads[0], 2);
  } finally { xlsxEntry.text = text; }
  /* a capture held in parts is stored only as its parts */
  const asked = [];
  const bytesOf = w.wb.bytesOf;
  w.wb.bytesOf = async (sha) => { asked.push(sha); return bytesOf.call(w.wb, sha); };
  const half = new Uint8Array(11 * 1024 * 1024).fill(1), other = new Uint8Array(11 * 1024 * 1024).fill(2);
  const whole = new Uint8Array(half.length + other.length); whole.set(half); whole.set(other, half.length);
  const held = w.capture(whole, { parts: [half, other] }).capSha;
  const r = await w.wb.addWorkbook({ captureSha: held, question: "q", period: "p", project: P, by: V("bob") });
  assert.equal(r.reason, "WORKBOOK_FILE_TOO_LARGE");
  assert.equal(r.size_bytes, whole.length, "gated by the parts' total");
  assert.deepEqual(asked, [], "before its bytes are asked for");
  const small = w.capture(new Uint8Array(3000).fill(3), { parts: [new Uint8Array(1500).fill(3), new Uint8Array(1500).fill(3)] }).capSha;
  const s = await w.wb.addWorkbook({ captureSha: small, question: "q", period: "p", project: P, by: V("bob") });
  assert.notEqual(s.reason, "WORKBOOK_FILE_TOO_LARGE", "under the bound it is read as before");
  assert.deepEqual(asked, [small]);
  /* a capture the store holds nowhere is still not held, even before the other arguments are judged */
  w.ev.m.delete(cap);
  assert.equal((await w.wb.addWorkbook({ captureSha: cap, question: "", period: "", project: "", by: V("bob") })).reason, "CAPTURE_NOT_HELD");
});

test("R2 R1 a workbook stored over the bound by the earlier add is never a crash: every read and act that loads its cells answers WORKBOOK_TOO_LARGE with the stored count, at the real-shape cap", async (t) => {
  const r = await inChild(t, null, "old", 120000);
  assert.equal(r.alive, true, "the child must survive");
  assert.equal(r.setup.ok, true);
  for (const k of ["read", "lint", "inputs", "explain", "recompute"]) {
    assert.equal(r[k].reason, "WORKBOOK_TOO_LARGE", k);
    assert.equal(r[k].cells, r.stored, k);
    assert.equal(r[k].bound_cells, WORKBOOK_CELLS_MAX, k);
  }
});
