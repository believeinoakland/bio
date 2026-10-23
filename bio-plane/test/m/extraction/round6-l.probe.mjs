/* extraction R90 (fix round 6, G13; plan rule 4), platform check L: what one tick of the ledger costs the object when a large text is read in
 * pieces, on workerd, with the real Durable Object storage (SQLite, the text index and its triggers), the real R2 binding and the real
 * reader. A probe, not a test (no `.test.mjs`: it boots workerd under Miniflare and takes minutes):
 *   node round6-l.probe.mjs <dir> <mebibytes>...        (24 is the ceiling a text is read below; sizes may be fractional)
 * It writes <dir>/probe.mjs (a Durable Object that composes record-core, membership, calibration and this module over its storage, with a
 * register stand-in and a held text), serves it from Miniflare, holds a text of lines of exactly 100 bytes with a last line "ENDMARKER",
 * then makes the ledger's call, `readHeld({sha, kind: "reading"})`, until the answer has no `more`, timing each tick on the wall clock
 * outside the isolate (workerd freezes the clock during synchronous work, so inside it reads as nothing) and sampling the resident set
 * of workerd every 25 ms. The object's limit is 128 MB: the increase of the resident set over the idle object is printed with the
 * heap the isolate reports. Prints one line per size. Recorded in build/jobs/T51/extraction.md.
 *
 * (fix round 6, G41; R96, R98) Platform check L of the row guard and `cellsOf`: a size is `<mebibytes>` (the text above), or `text:<mebibytes>`,
 * `csv:<mebibytes>` (the harness's CSV, a last row `LASTROWMARK`), or `xlsx:<rows>` (rows of 4 cells, the last `LASTROWMARK`). Sheets are
 * made here in node and posted to the object. Each ends read, indexed (the marker found), the largest value stored under 1 MiB, and, for a
 * sheet, `cellsOf` of its last row answered with the marker; then Miniflare is stopped and started again over the same storage and
 * `readingOf`, `readingFor` and `cellsOf` answer the same. `limit` as a size also INSERTs 2,098,176 and 2,252,800 bytes of text into the
 * object's SQLite, the limit the guard is set from (record-core/schema.mjs:30-35).
 *
 * (fix round 6, G41 follow-up; R98, K4664, K4669) A size `ucsv:<mebibytes>` or `uxlsx:<rows>` is the same sheet held with a capture format of
 * `undetermined` (as an upload over one part is stored); `cellsOf` of its last row is answered through the reading's own container. A size
 * `dxlsx:<rows>` is the workbook with the reading's container set to `text` (a container with no cell-making entry), so only the format detected again
 * from the held head and the declared type can name it. */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtempSync } from "node:fs";
import { Miniflare } from "miniflare";
import * as F from "../office-readers/fixtures.mjs";

const [dir, ...sizes] = process.argv.slice(2);
if (!dir || !sizes.length) { console.error("usage: round6-l.probe.mjs <dir> <size>...   (<mebibytes> | text:<mib> | csv:<mib> | xlsx:<rows> | limit)"); process.exit(2); }
mkdirSync(dir, { recursive: true });
const src = (p) => JSON.stringify(fileURLToPath(new URL(`../../../src/${p}`, import.meta.url)));
const outer = (p) => JSON.stringify(fileURLToPath(new URL(`../../../../${p}`, import.meta.url)));
const ENTRY = join(dir, "probe.mjs");
writeFileSync(ENTRY, `
import { DurableObject } from "cloudflare:workers";
import { recordOf } from ${src("record-core/index.mjs")};
import { membershipOf } from ${src("membership/index.mjs")};
import { Extraction } from ${src("extraction/index.mjs")};
import { registerDoctype } from ${outer("docprofile/registry.mjs")};
import { registerDoctypes } from ${outer("doctypes/index.mjs")};
registerDoctypes(registerDoctype);
const sha = async (b) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", b))].map((x) => x.toString(16).padStart(2, "0")).join("");
export class Probe extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    /* the register stand-in and the provenance documents are kept in the object's storage, so a restart (a new isolate over the same storage) finds them as the real register does */
    const kept = ctx.storage.kv.get("held");
    this.rows = new Map(kept ? kept.rows : []);
    this.docs = new Map(kept ? kept.docs : []);
    this.core = recordOf(ctx, { evidence: env.CAPTURES, evidencePrefix: "bio/captures/" });
    this.core.migrate();
    const membership = membershipOf(ctx, { record: this.core });
    membership.migrate();
    const provenance = { homeOf: (s) => this.rows.get(s) ?? null, onTestimony: () => ({ ok: true }) };
    this.x = new Extraction(ctx.storage, { record: this.core, membership, env, provenance });
    this.x.migrate();
    this.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [...this.docs.values()] }) } : null);
  }
  async fetch(req) {
    const u = new URL(req.url), q = (k) => u.searchParams.get(k);
    if (u.pathname === "/idle") return Response.json({ ok: true, mem: this.mem() });
    if (u.pathname === "/hold") {
      const total = Math.round(Number(q("mib")) * 1048576), n = Math.floor(total / 100);
      let bytes = new Uint8Array(total), at = 0;
      const enc = new TextEncoder();
      for (let i = 0; i < n - 1; i++) { const line = "line " + String(i).padStart(6, "0") + " " + "council-minutes ".repeat(5).padEnd(87, ".") + "\\n"; at += enc.encodeInto(line, bytes.subarray(at)).written; }
      at += enc.encodeInto("ENDMARKER".padEnd(total - at, " "), bytes.subarray(at)).written;
      const out = await this.hold(bytes, "text/plain", "undetermined", "log.txt");
      return Response.json({ ...out, mem: this.mem() });
    }
    if (u.pathname === "/post") {
      const bytes = new Uint8Array(await req.arrayBuffer());
      return Response.json({ ...(await this.hold(bytes, q("ct"), q("format"), q("name"), q("text") === "1")), mem: this.mem() });
    }
    if (u.pathname === "/container") {
      this.ctx.storage.sql.exec("UPDATE readings SET reading=json_set(reading, '$.text_container', ?) WHERE capture_sha=?", q("c"), q("sha"));
      return Response.json({ ok: true, format: this.ctx.storage.sql.exec("SELECT capture_format f FROM readings WHERE capture_sha=?", q("sha")).toArray()[0].f });
    }
    if (u.pathname === "/tick") {
      const r = await this.x.readHeld({ sha: q("sha"), kind: "reading", storeName: "bio", env: this.env });
      return Response.json({ r, mem: this.mem() });
    }
    if (u.pathname === "/state") {
      const got = this.x.readingFor(q("sha"), "class:admin");
      const st = this.x.unitsOf(q("sha"));
      const mark = q("mark") || "ENDMARKER";
      const end = this.ctx.storage.sql.exec("SELECT count(*) c FROM capture_text_fts WHERE capture_text_fts MATCH ?", mark).toArray()[0].c;
      const big = this.ctx.storage.sql.exec("SELECT max(n) m FROM (SELECT length(CAST(reading AS BLOB)) n FROM readings UNION ALL SELECT length(CAST(reading AS BLOB)) FROM reading_history UNION ALL SELECT length(CAST(provenance AS BLOB)) FROM reading_history)").toArray()[0].m;
      return Response.json({ more: got.more, read_through: got.read_through, total: got.total, state: st.state, counts: st.counts, end, largest: big,
        found: got.found, reader_found: got.reader_found, completeness: got.completeness && got.completeness.state, cells_held: got.reading && got.reading.cells_held, failure: got.reading && got.reading.failure,
        basis: got.reading && got.reading.basis });
    }
    if (u.pathname === "/cells") {
      const num = (k) => (q(k) === null ? null : Number(q(k)));
      const t0 = Date.now();
      const c = await this.x.cellsOf(q("sha"), q("sheet"), { fromRow: num("from"), toRow: num("to") });
      return Response.json({ ms: Date.now() - t0, n: c.cells ? c.cells.length : null, reason: c.reason, interpreted: c.interpreted, next_row: c.next_row,
        last: c.cells && c.cells.length ? c.cells.slice(-4).map((x) => [x.source.cell, x.value]) : null });
    }
    if (u.pathname === "/readingof") {
      const r = this.x.readingOf(q("sha"));
      const j = JSON.stringify(r);
      return Response.json({ length: j.length, digest: await sha(new TextEncoder().encode(j)) });
    }
    if (u.pathname === "/insert") {
      const n = Number(q("n"));
      const sql = this.ctx.storage.sql;
      sql.exec("CREATE TABLE IF NOT EXISTS limit_probe (id INTEGER PRIMARY KEY, v TEXT)");
      try { sql.exec("INSERT INTO limit_probe (v) VALUES (?)", "a".repeat(n)); return Response.json({ n, ok: true }); }
      catch (e) { return Response.json({ n, ok: false, error: String(e && e.message) }); }
    }
    return new Response("?", { status: 404 });
  }
  async hold(bytes, ct, format, name, text) {
    const total = bytes.length;
    const d = await sha(bytes);
    await this.core.evidenceStore().put(d, bytes);
    this.ctx.storage.sql.exec("INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('INFO-1','information','g','t','collected','2026-01-01','2026-01-01','x',1)");
    this.rows.set(d, { bundleId: "INFO-1", path: name, encoding: "binary", bytes: total, registered: "t", authored: false });
    this.docs.set(d, { file: name, locator: "https://a.example/" + name, retrieved: "2026-10-22T00:00:00Z",
      profile: { profiled_from_text: text !== false, format: { format, confidence: "none", signals: [] }, jurisdiction_view: null },
      provenance_chain: [{ who: "t", asserts: "served", via: "direct", bound: false }],
      capture: { sha256: d, bytes: total, content_type: ct, transport: { http_headers: [] } } });
    this.ctx.storage.kv.put("held", { rows: [...this.rows], docs: [...this.docs] });
    return { sha: d, bytes: total };
  }
  mem() { try { const m = globalThis.process.memoryUsage(); return { rss: m.rss, heapUsed: m.heapUsed, external: m.external, arrayBuffers: m.arrayBuffers }; } catch { return null; } }
}
export default { async fetch(req, env) { return env.PROBE.get(env.PROBE.idFromName("p")).fetch(req); } };
`);

const rssOfWorkerd = () => {
  try { return Math.max(0, ...execFileSync("ps", ["-C", "workerd", "-o", "rss="], { encoding: "utf8" }).split("\n").map((x) => Number(x.trim()) || 0)) * 1024; }
  catch { return 0; }
};

/* the sheets this probe posts: the harness's CSV (header, rows of about 55 bytes, a last row LASTROWMARK) and a workbook of 4-cell rows */
const csvBytes = (mib) => {
  const rows = ["id,name,amount,note"];
  for (let n = 20, i = 0; n < mib * 1048576; i++) { const r = `${i},"name ${i}",${(i * 37) % 9973}.${i % 100},"council note ${i} budget line"`; rows.push(r); n += r.length + 1; }
  rows.push(`LASTROWMARK,"last name",1.00,"the final row of the sheet"`);
  return { bytes: new TextEncoder().encode(rows.join("\n") + "\n"), rows: rows.length };
};
const xlsxBytes = (n) => ({ bytes: F.xlsx({ sheets: [{ name: "Budget", data: { rows: Array.from({ length: n }, (_, i) => ({ r: i + 1,
  cells: ["A", "B", "C", "D"].map((c, k) => ({ r: `${c}${i + 1}`, t: "inlineStr", is: i === n - 1 && k === 0 ? "LASTROWMARK" : `value ${i} ${k}` })) })) } }] }), rows: n });

const newMiniflare = (persist) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { PROBE: { className: "Probe", useSQLite: true } }, r2Buckets: ["CAPTURES"],
  bindings: { VERSION: "probe" }, durableObjectsPersist: join(persist, "do"), r2Persist: join(persist, "r2"),
});

for (const size of sizes) {
  const [kind0, amount] = size.includes(":") ? size.split(":") : size === "limit" ? ["limit", ""] : ["text", size];
  /* u: held with the capture format `undetermined`; d: also with the container taken from the reading (detection alone can name the format) */
  const kind = { ucsv: "csv", uxlsx: "xlsx", dxlsx: "xlsx" }[kind0] || kind0, undet = kind0 in { ucsv: 1, uxlsx: 1, dxlsx: 1 }, detectOnly = kind0 === "dxlsx";
  const persist = mkdtempSync(join(tmpdir(), "extraction-r6-l-"));
  let mf = newMiniflare(persist);
  try {
    const call = async (path, init) => (await mf.dispatchFetch(`http://probe${path}`, init)).json();
    if (kind === "limit") {
      for (const n of [2098176, 2252800]) console.log(`INSERT of ${n} bytes of text: ${JSON.stringify(await call(`/insert?n=${n}`))}`);
      continue;
    }
    const idle = await call("/idle");
    const idleRss = rssOfWorkerd();
    let held, mark = "ENDMARKER", sheet = null, lastRow = null;
    if (kind === "text") held = await call(`/hold?mib=${amount}`);
    else {
      const made = kind === "csv" ? csvBytes(Number(amount)) : xlsxBytes(Number(amount));
      mark = "LASTROWMARK"; sheet = kind === "csv" ? "csv" : "Budget"; lastRow = made.rows;
      const [ct, format0, name] = kind === "csv" ? ["text/csv", "csv", "table.csv"] : ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx", "table.xlsx"];
      const format = undet ? "undetermined" : format0;
      held = await call(`/post?ct=${encodeURIComponent(ct)}&format=${format}&name=${name}&text=${kind === "csv" ? 1 : 0}`, { method: "POST", body: made.bytes });
    }
    await new Promise((r) => setTimeout(r, 500));
    await new Promise((r) => setTimeout(r, 1500));
    const heldRss = rssOfWorkerd();   /* the file held, the harness's own spike let go */
    let peak = heldRss, heapPeak = 0;
    const sampler = setInterval(() => { peak = Math.max(peak, rssOfWorkerd()); }, 25);
    const ticks = [];
    let out;
    try {
      do {
        const t0 = Date.now();
        out = await call(`/tick?sha=${held.sha}`);
        ticks.push(Date.now() - t0);
        heapPeak = Math.max(heapPeak, out.mem ? out.mem.heapUsed + (out.mem.external || 0) : 0);
      } while (out.r && out.r.more === true && ticks.length < 400);
    } finally { clearInterval(sampler); }
    if (detectOnly) await call(`/container?sha=${held.sha}&c=text`);
    const state = await call(`/state?sha=${held.sha}&mark=${mark}`);
    const mb = (n) => (n / 1048576).toFixed(0);
    const under = state.largest < 1048576;
    let cells = null, again = null;
    if (sheet) {
      cells = await call(`/cells?sha=${held.sha}&sheet=${sheet}&from=${lastRow}&to=${lastRow}`);
      const before = await call(`/readingof?sha=${held.sha}`);
      const forBefore = state;
      /* Miniflare stopped and started over the same storage: the object is a new isolate with the same SQLite and R2 */
      await mf.dispose(); mf = newMiniflare(persist);
      const after = await call(`/readingof?sha=${held.sha}`);
      const stateAfter = await call(`/state?sha=${held.sha}&mark=${mark}`);
      const cellsAfter = await call(`/cells?sha=${held.sha}&sheet=${sheet}&from=${lastRow}&to=${lastRow}`);
      again = { readingOfSame: before.digest === after.digest && before.length === after.length, stateSame: JSON.stringify(forBefore) === JSON.stringify(stateAfter), cellsSame: JSON.stringify({ ...cells, ms: 0 }) === JSON.stringify({ ...cellsAfter, ms: 0 }) };
    }
    const ok = out.r && out.r.read === true && !out.r.more && state.more !== true && state.end === 1 && under
      && (!sheet || (cells && cells.last && cells.last.some((c) => c[1] === "LASTROWMARK") && again.readingOfSame && again.stateSame && again.cellsSame));
    console.log(`${size} (${held.bytes} B): ${ok ? `read, ${mark} found, largest stored value ${state.largest} B (under 1 MiB)` : "NOT AS REQUIRED " + JSON.stringify({ out: out.r, state, cells, again })} in ${ticks.length} ticks; `
      + (sheet ? `cellsOf of the last row ${cells.ms} ms (${cells.n} cells, last ${JSON.stringify(cells.last)}); after a restart ${JSON.stringify(again)}; ` : "")
      + `wall per tick max ${Math.max(...ticks)} ms, mean ${Math.round(ticks.reduce((a, b) => a + b, 0) / ticks.length)} ms; `
      + `workerd resident set idle ${mb(idleRss)} MB, with the file held ${mb(heldRss)} MB, peak over the ticks ${mb(peak)} MB (+${mb(peak - heldRss)} MB over the held file); heap + external the isolate reports, peak ${mb(heapPeak)} MB (object limit 128)`);
  } finally { await mf.dispose(); }
}
