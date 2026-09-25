#!/usr/bin/env node
/* M-157 (D-504) item (6): read the scanned `0201-cafr-2002` (CAFR-2002.pdf, sha256 3c358ed7…) with an OCR
 * instrument OUTSIDE the record, because the record's own route cannot reach 161 of its 175 pages (see
 * M-157 (6): tier 1 marks only the 14 pages that declare no font; the renderer refuses the rest
 * PAGE_HAS_TEXT_LAYER on an EMPTY `BT … ET`).
 *
 *   node tools/m157-ocr-cafr2002.mjs <pdf> <outdir>
 *
 * Pixels come from the PROJECT'S renderer (`pdf-worker/src/pagepixels.mjs`, `allowTextPage: true` — the
 * option the renderer itself offers), so the image is the one the OCR member would be handed; the
 * transcription is the local `tesseract` binary (5.3.4, eng, default psm) — NOT the member's
 * tesseract-wasm, so no fidelity letter or calibration of the member's applies to this text. It is a
 * machine transcription nobody has checked: a figure read from it is an OCR reading, labelled as such.
 * Writes <outdir>/p<NNN>.<ext>, <outdir>/p<NNN>.txt, and <outdir>/ocr.txt (pages joined, each headed
 * `=== PAGE n ===`). Prints per-page route or refusal; a page that fails is NAMED, never skipped silently.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { renderPageToPixels } from "../pdf-worker/src/pagepixels.mjs";

const [pdf, out] = process.argv.slice(2);
if (!pdf || !out) { console.error("usage: m157-ocr-cafr2002.mjs <pdf> <outdir>"); process.exit(2); }
mkdirSync(out, { recursive: true });
const bytes = new Uint8Array(readFileSync(pdf));
const joined = [];
const tally = {};
let chars = 0;
for (let i = 0; ; i++) {
  const r = await renderPageToPixels(bytes, i, { allowTextPage: true });
  if (!r.ok && r.reason === "NO_SUCH_PAGE") break;
  const n = String(i).padStart(3, "0");
  if (!r.ok) { tally[r.reason] = (tally[r.reason] || 0) + 1; console.log(`p${n} REFUSED ${r.reason}`); joined.push(`=== PAGE ${i} === UNREAD ${r.reason}`); continue; }
  const ext = /png/.test(r.mediaType) ? "png" : /jpe?g/.test(r.mediaType) ? "jpg" : "bin";
  const img = `${out}/p${n}.${ext}`;
  writeFileSync(img, r.bytes);
  let text = "";
  try { text = execFileSync("tesseract", [img, "stdout", "-l", "eng"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); }
  catch (e) { tally.TESSERACT_FAILED = (tally.TESSERACT_FAILED || 0) + 1; console.log(`p${n} TESSERACT_FAILED`); joined.push(`=== PAGE ${i} === UNREAD TESSERACT_FAILED`); continue; }
  writeFileSync(`${out}/p${n}.txt`, text);
  chars += text.length;
  tally[`ok:${r.route}`] = (tally[`ok:${r.route}`] || 0) + 1;
  console.log(`p${n} ${r.route} ${r.width}x${r.height} chars=${text.length}`);
  joined.push(`=== PAGE ${i} ===\n${text}`);
}
writeFileSync(`${out}/ocr.txt`, joined.join("\n"));
console.log(`OCR DONE ${JSON.stringify(tally)} chars=${chars}`);
