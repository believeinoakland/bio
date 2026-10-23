/* G26 assembled (K4426 (4); plan G26 (3)): BUDGET-2024-APP, the 1,354-page, 15.2 MiB text-layer volume (the cache and SHA-256 pin of
 * reading-pipeline's pdf-pieces.test.mjs), uploaded by the member's path and read by the real plane's ledger, a piece a tick, in a child whose
 * old space is 128 MB less the file's bytes (floor(128 - 15.2) = 112; no "idle +"). Pass: every tick under 10 s, every page once, a row that ends.
 *   node g26.probe.mjs [capMB ...]       extra caps after the real one */
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { shapeRun, capFor, pdfDoc, report } from "./harness.mjs";
const SHA = "6e0b3dc5f2f3f5bbab8ae5032bbc29207a8dbb290ba25ebafe3feb20dfe13c1e";
const path = join(process.env.BIO_FIXTURE_CACHE || join(tmpdir(), "bio-test-fixtures"), "BUDGET-2024-APP.pdf");
if (!existsSync(path) || createHash("sha256").update(readFileSync(path)).digest("hex") !== SHA) { console.log(`G26: ${path} is not the pinned file (run reading-pipeline/pdf-pieces.test.mjs once to fetch it)`); process.exit(2); }
const doc = pdfDoc(path);
for (const cap of [capFor(doc.bytes / 1048576), ...process.argv.slice(2).map(Number).filter(Boolean)]) {
  const r = await shapeRun({ doc }, { capMB: cap });
  console.log(report("G26 BUDGET-2024-APP", r));
  /* G41 1A: a blank page (22) or one whose glyphs cannot be decoded (4) has no unit and is NAMED in `unread_pages`: units plus unread pages are the pages (1,328 + 26 = 1,354) */
  if (r.done) { const un = r.reading && r.reading.unread_pages ? r.reading.unread_pages.length : null;
    console.log(`  pages in text_units: ${r.done.units} + unread_pages ${un} = ${un == null ? "?" : r.done.units + un} of 1354 (every page once, none dropped silently: ${un != null && r.done.units + un === 1354}); slowest tick ${Math.max(...r.ticks.map((t) => t.ms))} ms, over 10 s: ${r.ticks.filter((t) => t.ms > 10_000).length}`); }
}
process.exit(0);
