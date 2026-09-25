#!/usr/bin/env node
/* anchordrift.mjs — M0-197: NO NEGATIVE-CONTROL ARM MAY SIT UNARMED BECAUSE ITS PATCH ANCHOR DRIFTED.
 *
 * THE DEFECT. A control driver arms by quoting a line of its subject. Reword the line and the arm matches 0 times
 * and never arms; nothing sees it until a worker happens to run that driver. Four were found that way in one hour
 * on 2026-09-25 — D-535's statepaths arm b, D-600's nc-cap12 dropslides, D-601's default-discoverable, D-235's
 * suggest.control arms. BOB #35 (2026-09-25 04:25Z) RULED this standalone instrument, not part of M0-188's family.
 *
 * WHAT IT DOES. A PURE READER: it finds every driver (`*.control.mjs`, `*-controls.mjs`, and the `nc-*.mjs` class,
 * which shares the shape — arms that patch a quoted anchor), loads each one's arm table AS DATA through
 * `bio-plane/scripts/anchortable.mjs` (the driver runs only to its `anchorTable()` call, under the
 * `anchordry.mjs` tripwire that traps every write and spawn), and dry-applies each anchor by COUNTING its matches
 * in the named file — in memory, never editing. It FAILS naming driver and arm when an anchor matches 0 times, or
 * a number of times other than the arm's declared `sites` (1 by default: the arm edits one site).
 *
 * A DRIVER WHOSE ARMS CANNOT BE LOADED AS DATA IS NAMED UNREADABLE, NEVER SKIPPED — with the reason (it exposes no
 * table; a side effect ran before its table; it exited without one; its table is empty or malformed).
 *
 * THE ALLOWANCES (`tools/anchordrift.json`), and why each is a NAMED, DATED debt and not a silence:
 *   `allowances`  a drift already rowed — driver, arm, the HEAD OF ITS ANCHOR, row id, date. It prints ALLOWED
 *                 every run. It forgives only that anchor, so a NEW drift — of another arm, or of the same arm
 *                 re-anchored — FAILS. When the drift is gone (its row landed) the allowance prints STALE, to be
 *                 dropped; it does not fail, because the fixing landing is often another lane's and a stale entry
 *                 keyed on a dead anchor can forgive nothing.
 *   `unreadable`  the drivers that did not expose a table the day this landed, tied to the row that converts them.
 *                 Every one is NAMED every run. A driver NOT on the list that is unreadable FAILS (a new driver must
 *                 expose its table); one on the list that became readable, or was deleted, is STALE and FAILS, so
 *                 the list only shrinks. `inflight` names drivers an UNLANDED branch adds (written before the
 *                 convention); absent they are a note, landed and unreadable they are forgiven like the list.
 *
 * WHAT IT CANNOT SEE: an arm the driver's table does not list (a hand-written table can omit one — a table MAPPED
 * from the driver's own arm table cannot); an arm that arms and then asserts the wrong thing (the census,
 * `bio-plane/test/m025-arm-census.mjs`, runs arms); a `--controls` mode inside a probe (not in the class).
 *
 *   node tools/anchordrift.mjs            the estate; exit 0 green, 1 on any failure
 *   node tools/anchordrift.mjs --root D   another tree (the suite's fixtures, the control's pen copy)
 *   node tools/anchordrift.mjs --json     one JSON document on stdout
 *   node tools/anchordrift.mjs --only <driver>   one driver (repeatable), for the worker converting it
 */
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, relative, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { cpus, tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
export const DIRS = ["agent-worker", "bio-plane", "civicos-ui", "newgroup", "ocr-worker", "pdf-worker", "tools"];
export const isDriver = (rel) => /(^|\/)nc-[^/]*\.mjs$/.test(rel) && !/\.probe\.mjs$/.test(rel)
  || /\.control\.mjs$/.test(rel) || /-controls\.mjs$/.test(rel);
/* The table call a readable driver makes. Read in the source first, so a driver that never calls it is named
   without being spawned at all. */
const CALLS = /\banchor(Table|Each)\s*\(/;

export function drivers(root) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(d)) {
      if (e === "node_modules" || e.startsWith(".")) continue;
      const p = join(d, e);
      const s = statSync(p);
      if (s.isDirectory()) walk(p);
      else if (isDriver(relative(root, p))) out.push(relative(root, p));
    }
  };
  for (const d of DIRS) if (existsSync(join(root, d))) walk(join(root, d));
  return out.sort();
}

export function count(src, find) {
  if (typeof find === "string") return find.length ? src.split(find).length - 1 : -1;
  if (find && typeof find.re === "string") {
    const flags = find.flags.includes("g") ? find.flags : `${find.flags}g`;
    return [...src.matchAll(new RegExp(find.re, flags))].length;
  }
  return -1;
}

/* Judge one driver's rows. Rows of one arm are applied IN ORDER to an in-memory copy of each file when they carry
   `put`, so a later anchor is counted against the text the arm really patches. Nothing is written. */
export function judge(root, driver, rows) {
  const out = [];
  const byArm = new Map();
  for (const r of rows) { if (!byArm.has(r.arm)) byArm.set(r.arm, []); byArm.get(r.arm).push(r); }
  for (const [arm, rs] of byArm) {
    const mem = new Map();
    for (const r of rs) {
      if (r.none) { out.push({ driver, arm, state: "NO-TREE-ANCHOR", why: String(r.none) }); continue; }
      const file = typeof r.file === "string" ? r.file : "";
      const rel = file ? relative(root, file) : "(no file)";
      let src = mem.get(file);
      if (src === undefined) src = file && existsSync(file) ? readFileSync(file, "utf8") : null;
      const where = rel.startsWith("..") ? file : rel;
      const q = typeof r.find === "string" ? r.find : `/${r.find && r.find.re}/`;
      const shown = JSON.stringify(q.length > 90 ? `${q.slice(0, 87)}...` : q);
      if (src === null) { out.push({ driver, arm, state: "DRIFT", file: where, find: shown, raw: q, n: 0, why: "the file it patches is ABSENT" }); continue; }
      const n = count(src, r.find);
      const sites = r.sites === undefined ? 1 : r.sites;
      const ok = n > 0 && (sites === "any" || n === sites);
      if (n < 0) out.push({ driver, arm, state: "DRIFT", file: where, find: shown, raw: q, n, why: "the anchor is not a string or RegExp" });
      else if (!ok) out.push({ driver, arm, state: "DRIFT", file: where, find: shown, raw: q, n,
        why: n === 0 ? "matches 0 times" : `matches ${n} times where the arm edits ${sites === 1 ? "ONE site" : `${sites} sites`}` });
      else out.push({ driver, arm, state: "LIVE", file: where, n });
      if (ok && typeof r.put === "string") mem.set(file, typeof r.find === "string"
        ? (sites === 1 ? src.replace(r.find, () => r.put) : src.split(r.find).join(r.put))
        : src.replace(new RegExp(r.find.re, sites === 1 ? r.find.flags.replace("g", "") : (r.find.flags.includes("g") ? r.find.flags : `${r.find.flags}g`)), () => r.put));
      else mem.set(file, src);
    }
  }
  return out;
}

function load(root, driver, timeoutMs) {
  return new Promise((resolve) => {
    const abs = join(root, driver);
    const src = readFileSync(abs, "utf8");
    if (!CALLS.test(src)) return resolve({ driver, unreadable: "exposes no anchor table (no anchorTable() or anchorEach() call)" });
    const dry = pathToFileURL(join(root, "bio-plane/scripts/anchordry.mjs")).href;
    /* The driver's own $TMPDIR is a throwaway of this read's: a pen it makes before its table lands there and is
       removed with it (`anchordry.mjs` passes writes inside it and trips every other). */
    const box = mkdtempSync(join(tmpdir(), "anchordrift-"));
    const env = { ...process.env, BIO_ANCHOR_TABLE: "1", TMPDIR: box, BIO_ANCHOR_SANDBOX: box };
    delete env.NODE_OPTIONS;                     /* a gate's tracer is not this read's business */
    const c = spawn(process.execPath, [`--import=${dry}`, abs], { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
    let so = "", se = "";
    c.stdout.on("data", (b) => { so += b; });
    c.stderr.on("data", (b) => { se += b; });
    const timer = setTimeout(() => { c.kill("SIGKILL"); }, timeoutMs);
    c.on("close", (code, sig) => {
      clearTimeout(timer);
      try { rmSync(box, { recursive: true, force: true }); } catch { /* the OS temp sweep */ }
      const side = /^ANCHOR-DRY-SIDE-EFFECT (.+)$/m.exec(se);
      if (side) return resolve({ driver, unreadable: `a side effect (${side[1]}) runs BEFORE its anchorTable() call` });
      const line = so.split("\n").find((l) => l.startsWith("ANCHOR-TABLE "));
      if (!line) {
        const err = se.split("\n").find((l) => /Error|error:/.test(l)) || "";
        return resolve({ driver, unreadable: sig ? `killed (${sig}) after ${timeoutMs} ms without a table`
          : `exited ${code} without printing its table${err ? ` — ${err.trim().slice(0, 140)}` : ""}` });
      }
      if (code !== 0) return resolve({ driver, unreadable: `printed a table but exited ${code ?? sig} — it ran past anchorTable()` });
      let rows;
      try { rows = JSON.parse(line.slice("ANCHOR-TABLE ".length)); } catch (e) { return resolve({ driver, unreadable: `its table is not JSON (${e.message})` }); }
      if (!Array.isArray(rows) || !rows.length) return resolve({ driver, unreadable: "its anchor table is EMPTY" });
      resolve({ driver, rows });
    });
  });
}

export async function run({ root, allowFile = join(root, "tools/anchordrift.json"), jobs = Math.max(2, cpus().length), timeoutMs = 20000, only = null } = {}) {
  const list = drivers(root).filter((d) => !only || only.includes(d));
  const cfg = existsSync(allowFile) ? JSON.parse(readFileSync(allowFile, "utf8")) : {};
  const allowances = cfg.allowances || [];
  const knownUnreadable = new Set(((cfg.unreadable && cfg.unreadable.drivers) || []).filter((d) => !only || only.includes(d)));
  /* A driver an UNLANDED branch adds: not on this tree yet, named so its landing is not refused for a convention
     it was written before. Absent, it is a note; present and unreadable, it is forgiven like a listed one. */
  const inflight = new Map(((cfg.unreadable && cfg.unreadable.inflight) || []).filter((x) => !only || only.includes(x.driver)).map((x) => [x.driver, x.branch]));
  const loaded = new Array(list.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(jobs, list.length) }, async () => {
    while (next < list.length) { const i = next++; loaded[i] = await load(root, list[i], timeoutMs); }
  }));
  const rows = [], unreadable = [], failures = [];
  for (const d of loaded) {
    if (d.unreadable) { unreadable.push(d); continue; }
    rows.push(...judge(root, d.driver, d.rows));
  }
  const drift = rows.filter((r) => r.state === "DRIFT");
  /* An allowance names driver, arm AND the head of the anchor it forgives, so it can never cover a NEW drift of the
     same arm: re-anchor the arm and let it drift again, and the allowance no longer matches. */
  const allowed = [], used = new Set(), stale = [];
  for (const r of drift) {
    const a = allowances.find((x) => x.driver === r.driver && x.arm === r.arm && typeof x.anchor === "string"
      && x.anchor.length && r.raw.startsWith(x.anchor));
    if (a) { allowed.push({ ...r, row: a.row, since: a.since }); used.add(a); }
    else failures.push(`DRIFT       ${r.driver} · arm ${r.arm} · ${r.file}: ${r.find} ${r.why}`);
  }
  /* A STALE allowance (its drift is gone: the row landed, or the anchor moved) is SAID, never failed — the landing
     that fixes an arm is often another lane's, and the anchor key above means a stale entry can forgive nothing. */
  for (const a of allowances) if (!used.has(a) && (!only || only.includes(a.driver))) stale.push(a);
  const present = new Set(list);
  for (const u of unreadable) if (!knownUnreadable.has(u.driver) && !inflight.has(u.driver))
    failures.push(`UNREADABLE  ${u.driver}: ${u.unreadable} — a driver not on the dated list must expose its arms (bio-plane/scripts/anchortable.mjs)`);
  const unreadableSet = new Set(unreadable.map((u) => u.driver));
  for (const k of knownUnreadable) {
    if (!present.has(k)) failures.push(`STALE UNREADABLE ${k}: the driver is gone — drop it from tools/anchordrift.json`);
    else if (!unreadableSet.has(k)) failures.push(`STALE UNREADABLE ${k}: it now exposes its table — drop it from tools/anchordrift.json`);
  }
  const pending = [];
  for (const [d, b] of inflight) {
    if (!present.has(d)) pending.push({ driver: d, branch: b });
    else if (!unreadableSet.has(d)) failures.push(`STALE IN-FLIGHT ${d}: it is on this tree and exposes its table — drop it from tools/anchordrift.json`);
  }
  const readable = loaded.filter((d) => !d.unreadable);
  return { root, drivers: list.length, readable: readable.length, rows, live: rows.filter((r) => r.state === "LIVE").length,
           noTree: rows.filter((r) => r.state === "NO-TREE-ANCHOR"), drift, allowed, stale, unreadable, pending, failures,
           unreadableRow: cfg.unreadable ? cfg.unreadable.row : null };
}

export function report(res, log = console.log) {
  log(`anchordrift (M0-197): ${res.drivers} driver(s) · ${res.readable} READABLE · ${res.unreadable.length} UNREADABLE · `
    + `${res.rows.length} anchor row(s): ${res.live} LIVE, ${res.drift.length} DRIFT (${res.allowed.length} allowed), ${res.noTree.length} anchored in no tree file`);
  for (const a of res.allowed) log(`  ALLOWED     ${a.driver} · arm ${a.arm} · ${a.file}: ${a.find} ${a.why} — ${a.row}, since ${a.since}`);
  for (const a of res.stale) log(`  STALE ALLOWANCE ${a.driver} · arm ${a.arm} (${a.row}, since ${a.since}): no such drift now — its row landed; drop it from tools/anchordrift.json`);
  for (const n of res.noTree) log(`  NO TREE ANCHOR ${n.driver} · arm ${n.arm}: ${n.why}`);
  if (res.unreadable.length) {
    log(`  UNREADABLE (named, never skipped${res.unreadableRow ? `; converting them is ${res.unreadableRow}` : ""}):`);
    for (const u of res.unreadable) log(`    ${u.driver}: ${u.unreadable}`);
  }
  for (const p of res.pending) log(`  IN FLIGHT   ${p.driver} (${p.branch}): not on this tree; forgiven UNREADABLE when it lands`);
  for (const f of res.failures) log(`  FAIL  ${f}`);
  log(`anchordrift: ${res.failures.length ? `RED — ${res.failures.length} failure(s)` : "GREEN"}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const argv = process.argv.slice(2);
  const at = argv.indexOf("--root");
  const root = at >= 0 ? argv[at + 1] : join(HERE, "..");
  const only = argv.filter((a, i) => argv[i - 1] === "--only");
  const res = await run({ root, only: only.length ? only : null });
  if (argv.includes("--json")) process.stdout.write(`${JSON.stringify(res, null, 1)}\n`);
  else report(res);
  process.exit(res.failures.length ? 1 : 0);
}
