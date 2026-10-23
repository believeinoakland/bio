/* E3, the platform-shape harness (K4597 E3; fix round 6 plan; K4426 (4)): the REAL plane `Store` (every module it composes real, as
 * `plane/fixture.mjs` builds it) in a CHILD node process whose old space is the object's 128 MB less what the file's bytes take, so
 * the plane's own idle heap (73-103 MB) is inside the cap and there is no "idle +" slack (as `reading-pipeline/pdf-pieces.test.mjs`).
 * A document is fed by the member's real path (`captureOf(ctx).uploadCapture`, then the capture screen's promotion, then the
 * door's `pendingadd`), and the ledger's alarm is driven tick by tick to the end. Per tick it reports wall ms, peak heap + array
 * buffers, the ledger's rows and the text rows written; whether the child died (heap out of memory, a signal) is the parent's answer.
 *
 * USE (from a probe or test; the parent never loads the plane):
 *   import { shapeRun, capFor, textDoc, csvDoc, pdfDoc } from "./harness.mjs";
 *   const r = await shapeRun({ doc: textDoc(12_000_060) }, { capMB: capFor(11.44) });      // capFor(MiB the bytes take in the object)
 *   r.died        // true: no `done` line (the child was killed: out of memory, or a throw); r.signal / r.code / r.stderr say how
 *   r.ticks[]     // { n, ms, peakMB, aboveBaseMB, rows:[{kind,attempts,interrupted,final_why,last_why,last_ms,last_mem}], units, left }
 *   r.done        // { ticks, totalMs, units, state, found:{term:fts rows}, search:{term:{total,hits}}, extents, last } (SQL only: no text is loaded to make it)
 *   r.reading     // then the member's own `op=reading` on the finished reading (extraction `readingFor`): { unitsInAnswer, answerBytes, ms, peakMB, more, read_through, total, completeness, basis };
 *                 // r.readingDied: the child died asking it (spec `readingFor: false` skips it)
 *   r.pages       // then every later page by `next`: { pages, units, largestBytes, peakMB }; r.pagingDied: the child died paging (spec `pageAll: false` skips it)
 *   report(label, r)  the run as text, one line a tick
 *   r.fed         // { sha, bytes, parts, keep_pending, uploadMs, idleMB, ... } (the feed, before the first tick)
 * SPEC (G41 adds `readingEachTick: true` (the member's `readingFor` stated at every tick), `cellsOf: true` (extraction's `cellsOf` of the last row, the generator's cells expected); the child runs under TEST-SUPPORT #9's
 *        preload (`SHIM`, env BIO_PLATFORM_SHIM overrides), so a bound value over 2,098,176 B throws as on the platform, and `r.largestStored` / `r.overBound` say the largest stored value against 1 MiB; `xlsxDoc(rows)` is a streamed workbook):
 *        { doc, feed: "upload" (default; uploadCapture) | "held" (bytes put directly, as l77-size-child), fault: null | {remote:true},
 *         keepLater: "ledger" (the whole is not made inside the request, so a file over 32 MiB leaves a `keep` row for the ledger), maxTicks: 120, search: ["term", ...], marks: ["term", ...] (fts terms to count at the end) }.
 *   textDoc(bytes)   a no-blank-line text of 100-byte lines ending ENDMARKER, exactly `bytes` long (12,000,060 is the walker's)
 *   csvDoc(bytes)    a CSV of about `bytes` whose last row carries LASTROWMARK
 *   pdfDoc(path)     a PDF file on disk, streamed in
 * FAULT: `{remote:true}` makes the door's FIRST call on the first stub throw an error carrying `remote: true`, and that stub stays
 * broken (it throws on every later call), as a reset object's stub does (capture `g27-reset.probe.mjs`); the door's reader then takes a
 * fresh stub and tries once more (G27). `r.fed.door` says how many stubs were made and how many calls threw.
 * LIMITS, said once: old space is capped, the semi-space is 2 MB (as pdf-pieces) and array buffers are outside old space, so the
 * harness reports `peakMB` = heap + array buffers less the stand-in bucket's own bytes (R2 holds those, not the object), sampled every
 * 2 ms: a synchronous stretch longer than that is not sampled, but a child that outgrows its cap dies, which is the check. node:sqlite's
 * own memory is native and in neither figure (`peakRssMB` is reported beside, whole process, for scale). Node has no CPU limit and
 * workerd freezes `Date.now()` in the object (R-CLOCK): `ms` here is node's wall time, the compute cost, not the platform's.
 * Run: node harness.mjs --child '<spec json>'   (the parent does this; one JSON line per event on stdout). */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { statSync, existsSync } from "node:fs";
import { xlsxChunks, xlsxFileBytes, xlsxInfo, XLSX_SHEET } from "./xlsx-gen.mjs";

const SELF = fileURLToPath(import.meta.url);
export const OBJECT_MB = 128;
/** the old-space cap for a file whose bytes the object holds, `heldMiB` of them: the object's 128 less them, no "idle +" */
export const capFor = (heldMiB) => Math.floor(OBJECT_MB - heldMiB);
export const textDoc = (bytes) => ({ kind: "text", bytes, name: "log.txt", type: "text/plain", marks: ["ENDMARKER"] });
export const csvDoc = (bytes) => ({ kind: "csv", bytes, name: "table.csv", type: "text/csv", marks: ["FIRSTROWMARK", "MIDROWMARK", "LASTROWMARK"] });
/** a one-sheet workbook of `rows` rows of 3 short cells, streamed (xlsx-gen.mjs); `bytes` is the file's (deflated) length, counted by a pass here */
export const xlsxDoc = async (rows) => ({ kind: "xlsx", rows, bytes: await xlsxFileBytes(rows), name: "table.xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", marks: ["FIRSTROWMARK", "MIDROWMARK", "LASTROWMARK"], info: xlsxInfo(rows) });
/** the platform's bound for one stored value (G41, K4639): 1 MiB, under the 2,098,176 B the object's SQLite takes; a run with one over it fails */
export const STORED_VALUE_BOUND = 1048576;
/** TEST-SUPPORT #9's preload, the platform's single-value limit (2,098,176 B) in the child as it is in the object */
export const SHIM = process.env.BIO_PLATFORM_SHIM || fileURLToPath(new URL("../../../platform-sqlite.mjs", import.meta.url));
export const pdfDoc = (path) => ({ kind: "pdf", path, bytes: statSync(path).size, name: "doc.pdf", type: "application/pdf", marks: [] });

/** Run one document through the real plane in a child capped at `capMB` (null: uncapped). Never throws; `died` says what happened. */
export function shapeRun(spec, { capMB = null, semiMB = 2, timeoutMs = 1_800_000 } = {}) {
  const args = ["--import", SHIM, "--expose-gc", ...(capMB ? [`--max-old-space-size=${capMB}`] : []), `--max-semi-space-size=${semiMB}`, SELF, "--child", JSON.stringify(spec)];
  return new Promise((resolve) => {
    const p = spawn(process.execPath, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "", killed = false;
    const timer = setTimeout(() => { killed = true; p.kill("SIGKILL"); }, timeoutMs);
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code, signal) => {
      clearTimeout(timer);
      const ev = out.split("\n").filter((l) => l.startsWith("{")).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
      const done = ev.find((e) => e.ev === "done") || null, reading = ev.find((e) => e.ev === "reading") || null, staged = ev.some((e) => e.ev === "stage");
      const fatal = err.split("\n").find((l) => /FATAL|heap out of memory|Allocation failed/.test(l)) || err.split("\n").filter(Boolean).slice(0, 2).join(" | ");
      const stored = [done && done.largest, ...ev.filter((e) => e.ev === "tick").map((t) => t.largest)].filter(Boolean);
      const largestStored = stored.length ? Math.max(...stored.flatMap((l) => [l.readings, l.history, l.text].map((n) => n || 0))) : null;
      resolve({ capMB, shim: SHIM, largestStored, overBound: largestStored != null && largestStored > STORED_VALUE_BOUND, cells: ev.find((e) => e.ev === "cells") || null,
                died: !done, readingDied: !!done && staged && !reading, reading, code, signal, timedOut: killed, stderr: fatal.slice(0, 300), fed: ev.find((e) => e.ev === "fed") || null,
                ticks: ev.filter((e) => e.ev === "tick"), done, pages: ev.find((e) => e.ev === "pages") || null,
                pagingDied: !!reading && reading.next != null && !ev.some((e) => e.ev === "pages"), error: (ev.find((e) => e.ev === "error") || {}).message || null });
    });
  });
}

/** One run as text: the cap, whether the child died, then a line per tick (ms, peak MB, rows, units) and the end state. */
export function report(label, r) {
  const L = [`${label}: cap ${r.capMB ?? "none"} MB, ${r.died ? `CHILD DIED (${r.signal || "exit " + r.code}${r.timedOut ? ", timed out" : ""}): ${r.error || r.stderr}` : "child survived"}`];
  if (r.fed && r.fed.format) L.push(`  upload profile format: ${JSON.stringify(r.fed.format)}`);
  if (r.fed && r.fed.held) L.push(`  held in the stand-in bucket (key tail, real bytes, stated length): ${JSON.stringify(r.fed.held)}`);
  if (r.fed) L.push(`  fed: ${r.fed.bytes} B in ${r.fed.parts} part(s), upload ${r.fed.uploadMs} ms, keep_pending ${r.fed.keep_pending}, idle heap ${r.fed.idleMB} MB, ledger [${r.fed.ledger}], stubs ${r.fed.door.stubs}, stub faults ${r.fed.door.threw}`);
  for (const t of r.ticks) L.push(`  tick ${t.n}: ${t.ms} ms, peak heap+buffers ${t.peakMB} MB (${t.aboveBaseMB} above base), rows [${t.rows.map((x) => `${x.kind} att ${x.attempts} int ${x.interrupted}${x.final_why ? " final: " + x.final_why : ""}`)}], units ${t.units}${t.readingFor ? `, readingFor ${JSON.stringify(t.readingFor)}` : ""}`);
  if (r.done) { const d = r.done; L.push(`  done: ${d.ticks} ticks, ${d.totalMs} ms, max tick ${Math.max(0, ...r.ticks.map((t) => t.ms))} ms, peak ${d.peakMB} MB, units ${d.units}, state ${JSON.stringify(d.state)}, found ${JSON.stringify(d.found)}, search ${JSON.stringify(d.search)}, extents ${JSON.stringify(d.extents)}, left [${d.left}]`); }
  if (r.done && r.done.largest) L.push(`  largest stored value: ${r.largestStored} B (readings ${r.done.largest.readings}, reading_history ${r.done.largest.history}, capture_text ${r.done.largest.text}); bound ${STORED_VALUE_BOUND} B: ${r.overBound ? "OVER" : "within"}; shim ${r.shim}`);
  if (r.cells) L.push(`  cellsOf last row ${r.cells.lastRow}: ${r.cells.error ? "ERROR " + r.cells.error : `${r.cells.values.length} cells in ${r.cells.ms} ms, peak ${r.cells.peakMB} MB, equal to the generator's ${JSON.stringify(r.cells.values) === JSON.stringify(r.cells.expected)}, interpreted ${JSON.stringify(r.cells.interpreted)}, next_row ${r.cells.next_row}${r.cells.answer ? ", answer " + r.cells.answer : ""}`}`);
  if (r.reading) { const g = r.reading; L.push(`  op=reading answer: ${g.unitsInAnswer} units, ${g.answerBytes} B, ${g.ms} ms, peak ${g.peakMB} MB, next ${g.next}, more ${g.more}, read_through ${g.read_through}/${g.total}, unread_pages ${g.unread_pages ? g.unread_pages.length : "absent"}, completeness ${JSON.stringify(g.completeness && { state: g.completeness.state, why: g.completeness.why })}, basis \"${String(g.basis || "").slice(0, 170)}\"`); }
  { const p = r.pages; if (p) L.push(`  op=reading paged by next: ${p.pages} pages, ${p.units} units, largest answer ${p.largestBytes} B, peak ${p.peakMB} MB`); }
  if (r.pagingDied) L.push("  op=reading paged by next: THE CHILD DIED PAGING");
  if (r.readingDied) L.push("  op=reading (extraction readingFor) on the finished reading: THE CHILD DIED ASKING IT");
  return L.join("\n");
}

/* ------------------------------------------------------------------ the child ------------------------------------------------ */
async function child(spec) {
  const emit = (o) => process.stdout.write(JSON.stringify(o) + "\n");
  process.on("uncaughtException", (e) => { emit({ ev: "error", message: String(e && e.stack || e).slice(0, 600) }); process.exit(3); });
  process.on("unhandledRejection", (e) => { emit({ ev: "error", message: String(e && e.stack || e).slice(0, 600) }); process.exit(3); });
  const { createHash } = await import("node:crypto");
  const { createReadStream } = await import("node:fs");
  const v8 = await import("node:v8");
  await import("../../../../src/plane/register.mjs");
  const { store } = await import("../fixture.mjs");
  const { multipartBucket } = await import("../../record-core/storage.mjs");
  const { recordOf } = await import("../../../../src/record-core/index.mjs");
  const { captureOf } = await import("../../../../src/capture/index.mjs");
  const { promotionOf } = await import("../../../../src/promotion/index.mjs");
  const { extractionOf } = await import("../../../../src/extraction/index.mjs");

  const hex = (b) => createHash("sha256").update(b).digest("hex");
  const len = (t) => Buffer.byteLength(t);
  const doc = spec.doc;

  /* the stand-in bucket, with the bytes it holds counted: R2 holds them, not the object */
  const bucket = multipartBucket();
  const gate = { refuse: spec.keepLater === "ledger" };   /* the store's whole-making does not end inside the request: the keep is the ledger's */
  /* R2's multipart upload, as the store does it and the object's memory sees it: a part handed over is the store's (no copy kept here), and the
     whole it completes is a stand-in of its stated length (its bytes are R2's; a reader that loads it is not served here, and none under test does) */
  bucket.createMultipartUpload = async (k) => {
    let size = 0, over = false;
    return { uploadPart: async (n, b) => { if (over) throw new Error("upload is over"); size += b.length; return { partNumber: n, etag: `e${n}` }; },
             complete: async () => { if (gate.refuse) throw new Error("the store did not answer in time"); over = true;
                                     const whole = new Uint8Array(0); Object.defineProperty(whole, "length", { value: size }); bucket.held.set(k, whole); return { key: k, size }; },
             abort: async () => { over = true; } };
  };
  const external = () => { let n = 0; for (const b of bucket.held.values()) n += b.byteLength; return n; };
  const used = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers - external(); };
  const mb = (n) => +(n / 1048576).toFixed(1);

  const x = await store({ env: { CAPTURES: bucket, INSTANCE_NAME: "town" } });
  const ctx = x.ctx;
  const rows = () => [...ctx.storage.sql.exec(`SELECT kind, attempts, interrupted, final_why, last_why, last_ms, last_mem, started_at FROM keeps_pending`)];
  const open = () => rows().filter((r) => r.final_why == null);

  /* the member's bytes, as a stream (lazy: no whole copy in the child) */
  const LINE = (i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".") + "\n";
  async function* textChunks(total) {
    const n = Math.floor((total - 60) / 100); let buf = [];
    for (let i = 0; i < n; i++) { buf.push(LINE(i)); if (buf.length === 5000) { yield Buffer.from(buf.join("")); buf = []; } }
    if (buf.length) yield Buffer.from(buf.join(""));
    yield Buffer.from("ENDMARKER" + " ".repeat(total - n * 100 - 9));
  }
  /* the CSV's first data row (row 2) carries FIRSTROWMARK, the row at half the bytes MIDROWMARK, the last LASTROWMARK; `gen` says the last row's number and cells */
  const gen = { sheet: null, lastRow: null, lastCells: null };
  async function* csvChunks(total) {
    yield Buffer.from("id,name,amount,note\n");
    let n = 20, i = 0, buf = [], mid = false;
    for (; n < total; i++) {
      const note = i === 0 ? "FIRSTROWMARK" : !mid && n >= total / 2 ? (mid = true, "MIDROWMARK") : `council note ${i} budget line`;
      const r = `${i},"name ${i}",${(i * 37) % 9973}.${i % 100},"${note}"\n`; buf.push(r); n += r.length;
      if (buf.length === 2000) { yield Buffer.from(buf.join("")); buf = []; }
    }
    buf.push(`LASTROWMARK,"last name",1.00,"the final row of the sheet"\n`);
    gen.lastRow = i + 2; gen.lastCells = ["LASTROWMARK", "last name", "1.00", "the final row of the sheet"];
    yield Buffer.from(buf.join(""));
  }
  const source = doc.kind === "text" ? textChunks(doc.bytes) : doc.kind === "csv" ? csvChunks(doc.bytes) : doc.kind === "xlsx" ? xlsxChunks(doc.rows) : createReadStream(doc.path, { highWaterMark: 1 << 20 });
  if (doc.kind === "xlsx") Object.assign(gen, doc.info);

  /* the door's stub, with the fault: the first call on the first stub throws `{remote:true}` and that stub stays broken */
  const door = { stubs: 0, threw: 0 };
  const newStub = () => { const id = ++door.stubs; let broken = false;
    return { fetch: async (path, init) => { if ((spec.fault && id === 1) || broken) { broken = true; door.threw++; throw Object.assign(new Error("the object's stub is broken (the object was reset)"), { remote: true }); }
                                            return x.s.fetch(new Request(String(path), init)); } }; };
  let stub = newStub();
  const call = async (path, init) => { try { return await stub.fetch(path, init); } catch (e) { if (!(e && e.remote)) throw e; stub = newStub(); return stub.fetch(path, init); } };

  /* FEED: upload as the member does, then file it as the capture screen does */
  let sha, bytes, document, keepPending = false, uploadMs = 0, parts = 1;
  const t0 = Date.now();
  if (spec.feed === "held") {
    const { readFileSync } = await import("node:fs");
    const b = new Uint8Array(readFileSync(doc.path)); sha = hex(b); bytes = b.length; bucket.held.set(`bio/captures/${sha}`, b);
    document = { file: "big.pdf", locator: "https://example.org/big.pdf", retrieved: "2026-10-22T00:00:00Z", profile: { format: { format: "pdf", confidence: "certain", signals: [] } },
      authority_state: "undetermined", authority_basis: "held", origin: { kind: "named_request" },
      capture: { sha256: sha, bytes, content_type: "application/pdf", method: "upload", grade: "C", actor_class: "member", encoding: "binary" } };
  } else {
    const up = await captureOf(ctx).uploadCapture({ bytes: source, statement: "the shape harness's file", name: doc.name, type: doc.type, by: "member:ann", boundMs: 1 });
    if (!up || up.ok !== true) { emit({ ev: "error", message: "the upload was refused: " + JSON.stringify(up).slice(0, 300) }); process.exit(4); }
    sha = up.capture.sha256; bytes = up.capture.bytes; document = up.document; keepPending = up.keep_pending === true; parts = (document.parts || []).length || 1;
  }
  uploadMs = Date.now() - t0; gate.refuse = false;
  const now = "2026-10-22T00:00:00Z", id = recordOf(ctx).allocId("INFO", "2026").id, title = doc.name;
  const wholeFirst = document.parts && !document.parts.some((p) => p.sha256 === sha) ? [{ sha256: sha, path: document.file, encoding: "binary", bytes }] : [];
  const text = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null", "created: " + now, "last_updated: " + now,
    "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
    "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(title), "source:", "  locator: " + JSON.stringify(document.locator), "  authority: member-entered", "  retrieved: " + now,
    "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  const prov = JSON.stringify({ documents: [document] }, null, 1);
  const dataset = JSON.stringify({ documents: [{ bytes, locator: document.locator, sha256: sha }] });
  const files = [{ path: "bundle.md", text, bytes: len(text), sha256: hex(text) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
    { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) },
    ...(document.parts ? document.parts.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes })) : [{ path: document.file, blobSha: sha, sha256: sha, bytes }])];
  const register = [...wholeFirst, ...(document.parts ? document.parts.map((p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes }))
                                                      : [{ sha256: sha, path: document.file, encoding: "binary", bytes }])];
  promotionOf(ctx).promote({ bundleId: id, base: null, snapKey: "20261022T000000_" + hex(id).slice(0, 8),
    meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now }, files, register,
    author: "ann", actorMemberId: "ann", actorIdentity: "member:ann", actorViewer: "member:ann" });
  /* the door's owed reading (a keep's own owner enters the reading it owes), through the door's stub */
  if (!open().some((r) => r.kind === "keep")) { const r = await call(`http://do/pendingadd?kind=reading&sha=${sha}&store=bio`, { method: "POST" }); if (r.status !== 200) { emit({ ev: "error", message: "pendingadd " + r.status }); process.exit(4); } }
  global.gc(); global.gc();
  const base = used(), idle = v8.getHeapStatistics().used_heap_size;
  emit({ ev: "fed", sha, bytes, parts, keep_pending: keepPending, uploadMs, baseMB: mb(base), idleMB: mb(idle), ledger: rows().map((r) => r.kind), door, fault: !!spec.fault, format: document.profile && document.profile.format, held: [...bucket.held].map(([k, v]) => [k.slice(-12), v.byteLength, v.length]) });

  /* THE TICKS: one alarm each, as the platform fires them, until nothing is owed */
  const sql = (q, ...a) => [...ctx.storage.sql.exec(q, ...a)];
  const count = (q, ...a) => Number(Object.values(sql(q, ...a)[0] || { n: 0 })[0]);
  const units = () => count(`SELECT count(*) FROM capture_text WHERE capture_sha=?`, sha);
  /* the largest value stored (bytes) across the ledger-adjacent tables a reading reaches: G41's bound is 1 MiB for one stored value */
  const largest = (withText) => { const one = (q) => { try { return Number(sql(q)[0].n || 0); } catch { return null; } };
    return { readings: one(`SELECT max(length(CAST(reading AS BLOB))) AS n FROM readings`), history: one(`SELECT max(length(CAST(reading AS BLOB))) AS n FROM reading_history`),
             text: withText ? one(`SELECT max(length(CAST(text AS BLOB))) AS n FROM capture_text`) : null }; };
  let peak = base, peakRss = 0, peakAll = base;
  const sample = () => { const u = used(); if (u > peak) peak = u; if (u > peakAll) peakAll = u; const r = process.memoryUsage().rss; if (r > peakRss) peakRss = r; };
  const timer = setInterval(sample, 2);
  const T0 = Date.now(); let at = Date.now() + 1000, n = 0;
  while (open().length && n < (spec.maxTicks || 120)) {
    peak = used(); const t = Date.now();
    await x.s.onAlarm(at); at += 3_600_000; n++;
    sample();
    const ms = Date.now() - t;
    /* the member's own read, stating its state at this tick (K4426 (3)): what `op=reading` would answer between two alarms */
    let rd = null;
    if (spec.readingEachTick) { const tr = Date.now();
      try { const g = extractionOf(ctx).readingFor(sha, "class:admin"); rd = { ms: Date.now() - tr, state: g.completeness && g.completeness.state, read_through: g.read_through, total: g.total, more: g.more, units: (g.text_units || []).length, failure: g.reading && g.reading.failure }; }
      catch (e) { rd = { error: String(e && e.message || e).slice(0, 200) }; }
      sample(); }
    emit({ ev: "tick", n, ms, readingFor: rd, largest: largest(false), peakMB: mb(peak), aboveBaseMB: mb(peak - base), peakRssMB: mb(peakRss), rows: rows(), units: units(), left: open().map((r) => r.kind) });
  }
  clearInterval(timer);
  const found = {}; for (const term of [...(doc.marks || []), ...(spec.marks || [])]) found[term] = count(`SELECT count(*) FROM capture_text_fts WHERE capture_text_fts MATCH ?`, term);
  const state = sql(`SELECT state, offered, written, over_bound FROM capture_text_state WHERE capture_sha=?`, sha)[0] || null;
  const extents = sql(`SELECT extent_kind, count(*) AS n, sum(truncated) AS cut, max(length(text)) AS longest FROM capture_text WHERE capture_sha=? GROUP BY extent_kind`, sha);
  const last = sql(`SELECT seq, ref, extent, substr(text,1,60) AS text FROM capture_text WHERE capture_sha=? ORDER BY seq DESC LIMIT 1`, sha)[0] || null;
  const search = {};
  for (const term of spec.search || []) {
    try { const r = await call(`http://do/search?q=${encodeURIComponent("passage:" + term)}&viewer=${encodeURIComponent("class:admin")}&limit=5`, { method: "POST", body: "null" });
          const j = await r.json(); const res = j.result || {}; search[term] = { status: r.status, total: res.total ?? null, hits: Array.isArray(res.hits) ? res.hits.length : null, first: res.hits && res.hits[0] ? { bundle: res.hits[0].bundle_id, snippet: JSON.stringify(res.hits[0]).match(/ENDMARKER|FIRSTROWMARK|MIDROWMARK|LASTROWMARK/)?.[0] ?? null } : null }; }
    catch (e) { search[term] = { error: String(e.message || e).slice(0, 200) }; }
  }
  emit({ ev: "done", ticks: n, totalMs: Date.now() - T0, left: open().map((r) => r.kind), rows: rows(), units: units(), state, extents, last, found, search, largest: largest(true), gen,
         baseMB: mb(base), peakMB: mb(peakAll), peakRssMB: mb(peakRss), door });
  /* then the typed cells of the last row, made from the held file (extraction `cellsOf`, G41 D4): the same cap, the generator's cells expected */
  if (spec.cellsOf && gen.lastRow) {
    const tc = Date.now(); peak = used();
    try {
      const ex = extractionOf(ctx);
      if (typeof ex.cellsOf !== "function") throw new Error("extraction.cellsOf is not provided");
      const sheet = gen.sheet || (await import("../../../../src/csv-reader/index.mjs")).CSV_SHEET_NAME;
      const got = await ex.cellsOf(sha, sheet, { fromRow: gen.lastRow, toRow: gen.lastRow }); sample();
      let direct = null;   /* when the cells are not made: the reading-pipeline's own answer for the same range, to say why (the extraction answer states only its reason) */
      if (!(got.cells || []).length) try {
        const fmt = (sql(`SELECT capture_format AS f FROM readings WHERE capture_sha=?`, sha)[0] || {}).f;
        const d = await (await import("../../../../src/reading-pipeline/index.mjs")).cellsInRange(ex.core.evidenceStore(), document, { format: fmt, sheet, fromRow: gen.lastRow, toRow: gen.lastRow, maxCells: 100 });
        direct = JSON.stringify({ format: fmt, ok: d.ok, reason: d.reason, why: d.why, cells: (d.cells || []).length }).slice(0, 300);
      } catch (e) { direct = "threw " + String(e && e.message || e).slice(0, 200); }
      emit({ ev: "cells", ms: Date.now() - tc, peakMB: mb(peak), lastRow: gen.lastRow, expected: gen.lastCells, values: (got.cells || []).map((c) => String(c.value)), interpreted: got.interpreted ?? null, next_row: got.next_row ?? null,
             answer: (got.cells || []).length ? undefined : JSON.stringify(got).slice(0, 400) + (direct ? " | direct: " + direct : "") });
    } catch (e) { emit({ ev: "cells", ms: Date.now() - tc, lastRow: gen.lastRow, expected: gen.lastCells, error: String(e && e.message || e).slice(0, 300) }); }
  }
  /* then the member's own read of the finished reading (`op=reading`, extraction's `readingFor`): up to 4,096 units in one answer */
  if (spec.readingFor !== false) {
    emit({ ev: "stage", name: "readingFor" });
    const tr = Date.now(); peak = used();
    const got = extractionOf(ctx).readingFor(sha, "class:admin");
    const answerBytes = JSON.stringify(got).length; sample();
    emit({ ev: "reading", ms: Date.now() - tr, peakMB: mb(peak), answerBytes, unitsInAnswer: (got.text_units || []).length, next: got.next ?? null, more: got.more, read_through: got.read_through, total: got.total,
           completeness: got.completeness, basis: got.reading && got.reading.basis, unread_pages: got.unread_pages ?? null });
    /* then the rest of the reading, page by page by `next`, as the Document screen reads it (G38, EXTRACTION #36 J22; K4617):
       pass = every unit seen, every page under 2 MB, the child alive */
    if (spec.pageAll !== false && got.next != null) {
      let pages = 1, units = (got.text_units || []).length, largest = answerBytes, after = got.next;
      while (after != null) {
        const pg = extractionOf(ctx).readingFor(sha, "class:admin", { after });
        const b = JSON.stringify(pg).length; sample();
        pages++; units += (pg.text_units || []).length; largest = Math.max(largest, b);
        after = pg.next ?? null;
      }
      emit({ ev: "pages", pages, units, largestBytes: largest, peakMB: mb(peak) });
    }
  }
  process.exit(0);
}

if (process.argv[2] === "--child") await child(JSON.parse(process.argv[3]));
