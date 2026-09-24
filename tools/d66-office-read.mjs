/* D-66 (2026-09-24) — IS A SPREADSHEET ALREADY READ BY THE OFFICE ENTRIES?
 *
 * One file through the plane's OWN format registry (`bio-plane/src/formats.mjs`):
 * `detectFormat(bytes, contentType)` — bytes first, the declared type second, the
 * registry's own order — and, when an entry answers and has a `text` slot, that
 * entry's `text()` over the same bytes. Prints ONE JSON line. Nothing here
 * classifies or reads a document itself; it reports what the plane's entries do.
 *
 * usage: node tools/d66-office-read.mjs <file> [declared-content-type]
 * Called by `tools/m032-class-census.py readsample` once per sampled spreadsheet.
 *
 * WHAT IT CANNOT SEE: the acquire path's own content-type handling before the
 * registry is consulted — this drives the registry seam, not `op=acquire`.
 */
import { readFileSync } from "node:fs";
import { detectFormat, getFormat } from "../bio-plane/src/formats.mjs";

const [path, ct] = process.argv.slice(2);
if (!path) { console.error("usage: d66-office-read.mjs <file> [content-type]"); process.exit(2); }
const bytes = new Uint8Array(readFileSync(path));
const out = { bytes: bytes.length };
try {
  const d = detectFormat(bytes, ct || null);
  out.format = d.format;
  out.confidence = d.confidence;
  out.signals = d.signals;
  const entry = d.format === "undetermined" ? null : getFormat(d.format);
  out.has_text_entry = Boolean(entry && typeof entry.text === "function");
  if (out.has_text_entry) {
    const t = await entry.text(bytes);
    out.ok = t && t.ok !== false;
    out.container = t && t.container;
    out.sheets = Array.isArray(t && t.sheets) ? t.sheets.length : null;
    out.cells = t && t.counts ? t.counts.cells ?? null : null;
    out.chars = t && t.counts ? t.counts.chars ?? null : (t && typeof t.document === "string" ? t.document.length : null);
    out.undetermined = t && t.counts ? t.counts.undetermined ?? null : null;
    const u = Array.isArray(t && t.undetermined) ? t.undetermined : [];
    if (u.length) out.undetermined_why = [...new Set(u.map((x) => x.why).filter(Boolean))].join(", ");
    if (t && t.ok === false) out.refusal = t.reason || t.code || JSON.stringify(t).slice(0, 200);
  }
} catch (e) {
  out.error = String((e && e.message) || e).slice(0, 300);
}
console.log(JSON.stringify(out));
