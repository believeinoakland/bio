/* G26 assembled (K4426 (4); plan G26 (3)): BUDGET-2024-APP, the 1,354-page, 15.2 MiB text-layer volume (the cache and SHA-256 pin of
 * reading-pipeline's pdf-pieces.test.mjs), uploaded by the member's path and read by the real plane's ledger, a piece a tick, in a child whose
 * old space is 128 MB less the file's bytes (floor(128 - 15.2) = 112; no "idle +"). Pass: every tick under 10 s, every page once, a row that ends.
 *   node g26.probe.mjs [capMB ...]       extra caps after the real one */
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { shapeRun, capFor, pdfDoc, synthPdfDoc, report } from "./harness.mjs";
/* G56 (K4693, K4705): the pass is, in each run, the first tick at most 8 s (the target), every tick at most 10 s (the bar), no `interrupted`, the state whole and every page once (`units === 1328`;
   the 26 pages with no glyph are named in `unread_pages`); G26 in 14 ticks or more; and a HEAVY synthetic PDF (450 pages of about 53 KB, 4.5 times G26's bytes a page) read to the end with no
   piece above 100 pages (the units a tick adds are its pages). A first tick over 8 s and under 10 s is reported with its figure, not sized down. */
export const FIRST_TICK_MS = 8_000, TICK_MS = 10_000;
export function g26Failures(r, { units, minTicks = 1, maxPages = null }) {
  if (r.died) return [`the child died: ${r.error || r.stderr}`];
  const f = [], t = r.ticks, d = r.done;
  if (t.some((x) => x.rows.some((y) => y.interrupted))) f.push("a row was interrupted");
  if (t.length < minTicks) f.push(`${t.length} ticks, fewer than ${minTicks}`);
  const over = t.filter((x) => x.ms > TICK_MS); if (over.length) f.push(`${over.length} tick(s) over 10 s (max ${Math.max(...over.map((x) => x.ms))} ms)`);
  if (t[0] && t[0].ms > FIRST_TICK_MS) f.push(`the first tick took ${t[0].ms} ms, over the 8 s target`);
  if (d.units !== units) f.push(`${d.units} units, not ${units}`);
  if (!d.state || d.state.state !== "whole") f.push(`state ${JSON.stringify(d.state)}`);
  if (d.left.length) f.push(`the ledger still owes ${d.left}`);
  if (maxPages != null) { let prev = 0; for (const x of t) { if (x.units - prev > maxPages) f.push(`tick ${x.n} added ${x.units - prev} pages, over ${maxPages}`); prev = x.units; } }
  return f;
}
const SHA = "6e0b3dc5f2f3f5bbab8ae5032bbc29207a8dbb290ba25ebafe3feb20dfe13c1e";
const path = join(process.env.BIO_FIXTURE_CACHE || join(tmpdir(), "bio-test-fixtures"), "BUDGET-2024-APP.pdf");
if (!existsSync(path) || createHash("sha256").update(readFileSync(path)).digest("hex") !== SHA) { console.log(`G26: ${path} is not the pinned file (run reading-pipeline/pdf-pieces.test.mjs once to fetch it)`); process.exit(2); }
const doc = pdfDoc(path);
const heavyOnly = process.argv.includes("heavy-only");
for (const cap of heavyOnly ? [] : [capFor(doc.bytes / 1048576), ...process.argv.slice(2).map(Number).filter(Boolean)]) {
  const r = await shapeRun({ doc }, { capMB: cap });
  console.log(report("G26 BUDGET-2024-APP", r));
  /* G41 1A: a blank page (22) or one whose glyphs cannot be decoded (4) has no unit and is NAMED in `unread_pages`: units plus unread pages are the pages (1,328 + 26 = 1,354) */
  if (r.done) { const un = r.reading && r.reading.unread_pages ? r.reading.unread_pages.length : null;
    console.log(`  pages in text_units: ${r.done.units} + unread_pages ${un} = ${un == null ? "?" : r.done.units + un} of 1354 (every page once, none dropped silently: ${un != null && r.done.units + un === 1354}); slowest tick ${Math.max(...r.ticks.map((t) => t.ms))} ms, over 10 s: ${r.ticks.filter((t) => t.ms > 10_000).length}`); }
  { const f = g26Failures(r, { units: 1328, minTicks: 14 }); console.log(`  ${f.length ? "FAIL: " + f.join("; ") : "PASS"} (cap ${cap} MB; first tick ${r.ticks[0] ? r.ticks[0].ms : "-"} ms)`); }
}

if (process.argv.includes("heavy") || heavyOnly) {
  const doc = await synthPdfDoc({ pages: 450, linesPerPage: 30, targetBytes: 24_000_000 });
  const cap = capFor(doc.bytes / 1048576);
  const r = await shapeRun({ doc }, { capMB: cap });
  console.log(report(`G56 heavy synthetic PDF (${doc.pages} pages, ${doc.bytes} B, ${Math.round(doc.bytes / doc.pages)} B a page)`, r));
  const f = g26Failures(r, { units: 450, maxPages: 100 });
  console.log(`  ${f.length ? "FAIL: " + f.join("; ") : "PASS"} (cap ${cap} MB; slowest tick ${r.ticks.length ? Math.max(...r.ticks.map((x) => x.ms)) : "-"} ms, first ${r.ticks[0] ? r.ticks[0].ms : "-"} ms)`);
}
process.exit(0);
