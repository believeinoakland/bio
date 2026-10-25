/* plane R77, L at the object's size (fix round 5, E2 (4); K4544): the child of `l77-size.test.mjs`. The real `Store`, its real ledger and alarm, extraction's real
   `readHeld` over the real readers, in a process whose old space is the object's share (`--max-old-space-size`, set by the test). One PDF is promoted as the capture
   screen files one, its reading is owed to the ledger, and the alarm is fired until the ledger holds nothing; the answer is one JSON line. */
import "../../../src/plane/register.mjs";
import { createHash, randomBytes } from "node:crypto";
import { deflateSync } from "node:zlib";
import { store } from "./fixture.mjs";
import { multipartBucket } from "../record-core/storage.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { synthPdf } from "../extraction/bigpdf.mjs";

const kind = process.argv[1];
const hex = (b) => createHash("sha256").update(b).digest("hex");
const len = (t) => new TextEncoder().encode(t).length;
/* as many small objects as fit in about `mb` MB beside two pages of real text (the object walk's worst case) */
function manyObjects(mb) {
  const head = Buffer.from("%PDF-1.7\n", "latin1"), objs = [];
  const add = (b) => { objs.push(Buffer.from(b, "latin1")); return objs.length; };
  const text = "BT /F1 9 Tf 40 760 Td 11 TL\n" + Array.from({ length: 60 }, (_, i) => `(budget department line ${i}) Tj T*`).join("\n") + "\nET";
  const z = deflateSync(Buffer.from(text, "latin1"));
  const cm = Buffer.from("/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CMapName /Adobe-Identity-UCS def /CMapType 2 def 1 begincodespacerange <00> <FF> endcodespacerange 1 beginbfrange <00> <FF> <0000> endbfrange endcmap CMapName currentdict /CMap defineresource pop end end", "latin1");
  const cmap = add(`<< /Length ${cm.length} >>\nstream\n${cm.toString("latin1")}\nendstream`);
  const font = add(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode ${cmap} 0 R >>`);
  const c = add(`<< /Filter /FlateDecode /Length ${z.length} >>\nstream\n${z.toString("latin1")}\nendstream`);
  const page = add(`<< /Type /Page /Parent 6 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${c} 0 R >>`);
  add("<< /K 0 >>");
  const tree = add(`<< /Type /Pages /Count 1 /Kids [${page} 0 R] >>`); if (tree !== 6) throw new Error("tree");
  const cat = add(`<< /Type /Catalog /Pages ${tree} 0 R >>`);
  let size = objs.reduce((n, b) => n + b.length + 30, 0);
  for (let i = 0; size < mb * 1048576; i++) { const o = `<< /K ${i} /V (${i}) >>`; add(o); size += o.length + 30; }
  const out = [head]; const offs = []; let off = head.length;
  objs.forEach((b, i) => { offs.push(off); const o = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`), b, Buffer.from("\nendobj\n")]); out.push(o); off += o.length; });
  let x = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`; for (const o of offs) x += String(o).padStart(10, "0") + " 00000 n \n";
  out.push(Buffer.from(x + `trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R >>\nstartxref\n${off}\n%%EOF\n`));
  return new Uint8Array(Buffer.concat(out));
}
const make = {
  synthetic: () => synthPdf({ pages: 1300, linesPerPage: 120, targetBytes: 21_000_000 }),
  manyobjects: () => manyObjects(15.9),
  pdf22: () => synthPdf({ pages: 600, linesPerPage: 60, targetBytes: 22 * 1048576 }),
}[kind];
/* the pages the file holds: a paged read (R97, R101) takes at most one tick for each page, so this bounds the ticks, and no clock does */
const PAGES = { synthetic: 1300, pdf22: 600, manyobjects: 1 }[kind];
const bytes = make();
const d = hex(bytes);
const bucket = multipartBucket();
bucket.held.set(`bio/captures/${d}`, bytes);
const x = await store({ env: { CAPTURES: bucket, INSTANCE_NAME: "town" } });
const WHO = { author: "ann", actorMemberId: "ann", actorIdentity: "member:ann", actorViewer: "member:ann" };
const id = recordOf(x.ctx).allocId("INFO", "2026").id, now = "2026-10-22T00:00:00Z", title = "big.pdf";
const doc = { file: "big.pdf", locator: "https://example.org/big.pdf", retrieved: now, profile: { format: { format: "pdf", confidence: "certain", signals: [] } },
  authority_state: "undetermined", authority_basis: "held", origin: { kind: "named_request" },
  capture: { sha256: d, bytes: bytes.length, content_type: "application/pdf", method: "upload", grade: "C", actor_class: "member", encoding: "binary" } };
const text = ["---", "id: " + id, "object_type: information", "schema: information@2", "title: " + JSON.stringify(title), "current_state: collected", "prior_state: null", "created: " + now, "last_updated: " + now,
  "produced_by:", "  mode: assisted", "  capability_tier: session", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
  "criticality: supporting", "source_status: unchanged", "content_hash: sha256:" + hex(title), "source:", "  locator: " + JSON.stringify(doc.locator), "  authority: member-entered", "  retrieved: " + now,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "", "## Summary", "", title, "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const prov = JSON.stringify({ documents: [doc] }, null, 1);
const dataset = JSON.stringify({ documents: [{ bytes: bytes.length, locator: doc.locator, sha256: d }] });
promotionOf(x.ctx).promote({ bundleId: id, base: null, snapKey: "20261022T000000_" + hex(id).slice(0, 8),
  meta: { object_type: "information", title, current_state: "collected", created: now, last_updated: now },
  files: [{ path: "bundle.md", text, bytes: len(text), sha256: hex(text) }, { path: "data/provenance.json", text: prov, bytes: len(prov), sha256: hex(prov) },
          { path: "data/dataset.json", text: dataset, bytes: len(dataset), sha256: hex(dataset) }, { path: doc.file, blobSha: d, sha256: d, bytes: bytes.length }],
  register: [{ sha256: d, path: doc.file, encoding: "binary", bytes: bytes.length }], ...WHO });
const direct = process.argv[2] === "direct";
if (!direct) await x.call(`/pendingadd?kind=reading&sha=${d}`);
const rows = () => [...x.ctx.storage.sql.exec(`SELECT kind, attempts, interrupted, final_why, last_why, last_ms FROM keeps_pending WHERE state <> 'finished'`)];
const v8 = await import("node:v8");
const heapMb = () => +(v8.getHeapStatistics().used_heap_size / 1048576).toFixed(1);
global.gc(); global.gc();
if (process.argv[2] === "idle") { console.log(JSON.stringify({ kind, idleHeapMb: heapMb() })); process.exit(0); }
const use = () => { const m = process.memoryUsage(); return m.heapUsed + m.arrayBuffers; };
global.gc(); global.gc();
const base = use(); let peak = base;
const tick = setInterval(() => { peak = Math.max(peak, use()); }, 5);
const t0 = Date.now(); let at = Date.now() + 1000, ticks = 0;
if (direct) { await extractionOf(x.ctx).readHeld({ sha: d, storeName: "bio", env: x.env }); }
/* R97/R101: a large reading goes by pieces, one heavy piece for each tick, the row `partial` with a cursor {read_through, total}. Each tick must move the cursor
   forward (a tick that moves it not at all is a stall, which R101 (1) ends stated, so the ledger must not hold it); the ticks are bounded by the file's pages. */
const cursorOf = () => { const r = [...x.ctx.storage.sql.exec(`SELECT cursor FROM keeps_pending WHERE kind = 'reading' AND state <> 'finished'`)][0];
  try { const c = JSON.parse((r && r.cursor) || "null"); return c && typeof c.read_through === "number" ? c : null; } catch { return null; } };
const maxTicks = PAGES + 2; let last = -1, stalled = 0, total = null, moves = 0;
while (!direct && rows().length && ticks < maxTicks) {
  await x.s.onAlarm(at); at += 3_600_000; ticks++;
  const c = cursorOf();
  if (c) { total = c.total ?? total; if (c.read_through > last) moves++; else stalled++; last = Math.max(last, c.read_through); }
}
clearInterval(tick); peak = Math.max(peak, use());
const got = extractionOf(x.ctx).readingFor(d, "class:admin");
const words = (got.text_units || []).map((u) => u.text).join(" ");
console.log(JSON.stringify({ kind, pages: PAGES, maxTicks, total, moves, stalled, lastReadThrough: last, fileMb: +(bytes.length / 1048576).toFixed(1), ticks, ms: Date.now() - t0, left: rows(), found: got.found, units: (got.text_units || []).length,
  words: /budget/.test(words), basis: (got.reading && got.reading.basis) || "", peakAboveIdleMb: +((peak - base) / 1048576).toFixed(0), idleMb: +(base / 1048576).toFixed(0), peakMb: +(peak / 1048576).toFixed(0) }));
process.exit(0);
