#!/usr/bin/env node
/* M-160 (D-585): what the record's two text-layer askers say about each page of one PDF.
 *
 *   node tools/m160-textshown.mjs <pdf> [--repo <checkout>]
 *
 * `--repo` names the checkout whose modules are measured (default: this one), so the SAME instrument reads
 * the tree before and after a change. Per page it prints: Tier 1's decoded character count and its marker
 * reasons (`bio-plane/src/pdfstructure.mjs`, `extractPdfStructure`), and the OCR member's renderer outcome
 * (`pdf-worker/src/pagepixels.mjs`, `renderPageToPixels`: its route, or its stated refusal). Then totals, and
 * the document-level routing answers computed by the plane's own rules, restated here because `index.mjs`
 * does not export them: needsTier3 = some `no_text_layer` marker and no `encrypted` one; needsTier2's scan
 * guard = every marker is `no_text_layer` (so a scan alone does not escalate to tier 2).
 * A page the renderer threw on is NAMED (`THREW`), never skipped.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const pdf = args[0];
const ri = args.indexOf("--repo");
const repo = resolve(ri >= 0 ? args[ri + 1] : new URL("..", import.meta.url).pathname);
if (!pdf) { console.error("usage: m160-textshown.mjs <pdf> [--repo <checkout>]"); process.exit(2); }

const { extractPdfStructure } = await import(pathToFileURL(`${repo}/bio-plane/src/pdfstructure.mjs`).href);
const { renderPageToPixels } = await import(pathToFileURL(`${repo}/pdf-worker/src/pagepixels.mjs`).href);

const bytes = new Uint8Array(readFileSync(pdf));
const s = await extractPdfStructure(bytes);
const t = s.text || {};
const pages = Array.isArray(t.pages) ? t.pages : [];
const marks = Array.isArray(t.undetermined) ? t.undetermined : [];
const tally = { pages: pages.length, chars: 0, no_text_layer: 0, other_markers: 0, zero_char_unmarked: 0 };
const render = {};
for (const p of pages) {
  const i = p.page;
  const chars = (p.text || "").length;
  const reasons = (p.undetermined || []).map((m) => m.reason);
  tally.chars += chars;
  if (reasons.includes("no_text_layer")) tally.no_text_layer++;
  tally.other_markers += reasons.filter((r) => r !== "no_text_layer").length;
  if (chars === 0 && reasons.length === 0) tally.zero_char_unmarked++;
  let out;
  try {
    const r = await renderPageToPixels(bytes, i);
    out = r.ok ? `ok:${r.route}` : r.reason;
  } catch (e) { out = `THREW:${e.message}`; }
  render[out] = (render[out] || 0) + 1;
  console.log(`p${String(i).padStart(3, "0")} chars=${chars} markers=[${reasons.join(",")}] render=${out}`);
}
const needsTier3 = !marks.some((m) => m && m.reason === "encrypted") && marks.some((m) => m && m.reason === "no_text_layer");
const scanOnly = marks.length > 0 && marks.every((m) => m && m.reason === "no_text_layer");
console.log(`TIER1 ${JSON.stringify(tally)}`);
console.log(`RENDER ${JSON.stringify(render)}`);
console.log(`ROUTING needsTier3=${needsTier3} everyMarkerIsScan=${scanOnly}`);
