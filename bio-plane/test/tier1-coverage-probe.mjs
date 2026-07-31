#!/usr/bin/env node
// tier1-coverage-probe.mjs — CPDF-5: MEASURE Tier-1 text extraction coverage on
// REAL Oakland PDFs.
//
// NOT part of the test battery (deliberately not named *.test.mjs): it fetches
// real documents from oaklandca.gov and oakland.legistar.com over the network,
// so it must never run in `npm test`. It changes NOTHING in this repo: no
// dependency, no bundle, no shipped-code edit. It imports the in-plane Tier-1
// extractor (`src/pdfstructure.mjs`, CPDF-4, extractPdfStructure -> .text) and
// runs it against a fixed manifest of real Oakland documents.
//
//     node test/tier1-coverage-probe.mjs
//
// It caches fetched bytes into an OS temp dir so re-runs are cheap and offline.
// Point it at an already-populated cache with CPDF5_CACHE=/path/to/dir.
//
// WHAT IT MEASURES, per document
//   - decode outcome: FULLY / PARTIALLY / FAILED / NO-TEXT-LAYER
//   - decoded characters (text.counts.chars) vs undetermined code-points
//     (sum of every undetermined marker's `count`) -> a coverage fraction
//   - the residue broken down BY CAUSE, read straight off the per-region
//     `text.undetermined[].reason` the extractor emits (never inferred):
//       cid_font_no_tounicode / no_tounicode / unmapped_code /
//       code_width_misaligned / font_not_in_resources / no_current_font /
//       text_extraction_error
//   - link-graph counts (the CPDF-4 phase-1 structure) for context
//
// The point of the measurement is to SIZE Tier 2 (the unpdf pdf-worker, CPDF-6):
// how much of Oakland's real corpus Tier 1 already decodes in-plane for free,
// versus how much genuinely needs the library.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extractPdfStructure } from "../src/pdfstructure.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CACHE = process.env.CPDF5_CACHE || join(tmpdir(), "cpdf5-oakland-pdfs");
// The honest CivicOS contact-URL agent measured admissible at oaklandca.gov
// (MEASUREMENTS.md, the user-agent ladder). Legistar needs the per-file GUID.
const UA = "CivicOS/0.55.0 (+https://github.com/believeinoakland/bio; instance biosmoke7; acquire)";

// The manifest: a representative spread across Oakland's real document classes,
// each with its SOURCE URL. class labels group the coverage table.
const OAK = "https://www.oaklandca.gov/files/assets/city/v/1/finance/documents";
const LEG = "https://oakland.legistar.com/View.ashx";
const DOCS = [
  // ---- ACFR / budget book (the big financial books) ----
  { id: "acfr-2024", cls: "ACFR", src: `${OAK}/financial-reporting/annual-comprehensive-financial-reports/2024-city-of-oakland-acfr_final-121324.pdf` },
  { id: "acfr-2025", cls: "ACFR", src: `${OAK}/financial-reporting/annual-comprehensive-financial-reports/2025-city-of-oakland-acfr_final-123025.pdf` },
  { id: "cafr-2003", cls: "ACFR (old)", src: `${OAK}/financial-reporting/annual-comprehensive-financial-reports/2003-comprehensive-annual-financial-report-cafr-audit-pdf.pdf` },
  { id: "budget-adopted-book-full", cls: "Budget book", src: `${OAK}/fiscal-years/2025-2027-budget/fy25-27-adopted-budget-book-full-10.10.25-reduced-size.pdf` },
  { id: "budget-proposed-book", cls: "Budget book", src: `${OAK}/fiscal-years/2025-2027-budget/fy25-27-proposed-budget-book-final-revised-5.8.25-reduce-size.pdf` },
  // ---- Budget exhibits ----
  { id: "budget-transmittal", cls: "Budget exhibit", src: `${OAK}/fiscal-years/2025-2027-budget/2025-2027-transmittal-letter-final.pdf` },
  { id: "budget-2pager", cls: "Budget exhibit", src: `${OAK}/fiscal-years/2025-2027-budget/v1-fy25-27-2-pager-oakland-budget-basics-fy-3.pdf` },
  { id: "budget-deepdive-presentation", cls: "Budget exhibit", src: `${OAK}/fiscal-years/2025-2027-budget/finance-2025-deep-dive-presentation.pdf` },
  { id: "budget-council-amendments", cls: "Budget exhibit", src: `${OAK}/fiscal-years/2025-2027-budget/city-council-budget-team-amendments.pdf` },
  // ---- Agenda packets (Legistar) ----
  { id: "legistar-agenda-1425405", cls: "Agenda packet", src: `${LEG}?M=A&ID=1425405&GUID=86B6D25C-4D38-4101-BD37-13DF930A7950` },
  { id: "legistar-agenda-1425401", cls: "Agenda packet", src: `${LEG}?M=A&ID=1425401&GUID=4CF4BEBA-4730-4C80-A345-71519C867CAD` },
  // ---- Staff reports / legislation attachments (Legistar) ----
  { id: "legistar-staffrep-15579526", cls: "Staff report", src: `${LEG}?M=F&ID=15579526&GUID=E64EA1B6-5B55-448B-BCF3-95AFF05135C4` },
  { id: "legistar-attach-15579527", cls: "Staff report", src: `${LEG}?M=F&ID=15579527&GUID=3C720652-552C-459C-8D56-9C7B740F86B3` },
  { id: "legistar-attach-15721260", cls: "Staff report", src: `${LEG}?M=F&ID=15721260&GUID=8F04A287-4A49-44DC-83B7-29FAD97140C2` },
];

async function bytesOf(doc) {
  const path = join(CACHE, doc.id + ".pdf");
  if (existsSync(path)) return new Uint8Array(readFileSync(path));
  if (!existsSync(CACHE)) mkdirSync(CACHE, { recursive: true });
  const res = await fetch(doc.src, { headers: { "user-agent": UA }, redirect: "follow" });
  const buf = new Uint8Array(await res.arrayBuffer());
  const ct = res.headers.get("content-type") || "";
  if (!res.ok || !ct.includes("pdf")) throw new Error(`${doc.id}: http ${res.status} ${ct} (${buf.length}B) — not a PDF`);
  writeFileSync(path, buf);
  return buf;
}

// Sum the undecodable code-points across every undetermined marker, and group
// the marker COUNT by reason. `count` is the extractor's own per-region tally.
function residue(text) {
  const byReason = new Map(); // reason -> { regions, codepoints }
  let codepoints = 0;
  for (const u of text.undetermined) {
    const e = byReason.get(u.reason) || { regions: 0, codepoints: 0 };
    e.regions += 1;
    e.codepoints += u.count || 0;
    codepoints += u.count || 0;
    byReason.set(u.reason, e);
  }
  return { codepoints, byReason };
}

// Classify a decode outcome from the measured numbers alone.
function classify(r) {
  if (!r.ok) return "FAILED";
  const chars = r.chars, undet = r.undetCodepoints, pages = r.pages;
  // A document with pages but essentially NO text operators and NO undetermined
  // markers has no text layer at all — a scanned image. Tier 2 (unpdf) will not
  // help either; that needs OCR, which is neither tier.
  if (pages > 0 && chars < pages * 2 && undet === 0) return "NO-TEXT-LAYER";
  const denom = chars + undet;
  if (denom === 0) return "NO-TEXT-LAYER";
  const cov = chars / denom;
  if (cov >= 0.98) return "FULLY";
  if (cov >= 0.05) return "PARTIALLY";
  return "FAILED";
}

const rows = [];
for (const doc of DOCS) {
  const row = { id: doc.id, cls: doc.cls, src: doc.src };
  try {
    const bytes = await bytesOf(doc);
    row.bytes = bytes.length;
    const t0 = Date.now();
    const out = await extractPdfStructure(bytes);
    row.ms = Date.now() - t0;
    row.ok = out.ok !== false;
    if (!row.ok) { row.reason = out.reason; rows.push(row); continue; }
    row.pages = out.pages;
    row.chars = out.text.counts.chars;
    row.undetRegions = out.text.counts.undetermined;
    const res = residue(out.text);
    row.undetCodepoints = res.codepoints;
    row.byReason = res.byReason;
    row.coverage = row.chars + row.undetCodepoints === 0 ? 0 : row.chars / (row.chars + row.undetCodepoints);
    row.links = out.counts;
    row.notes = out.notes || [];
    row.sample = out.text.document.slice(0, 120).replace(/\s+/g, " ").trim();
  } catch (e) {
    row.ok = false;
    row.reason = "PROBE_ERROR: " + e.message;
  }
  row.outcome = row.ok ? classify(row) : "FAILED";
  rows.push(row);
}

// ---- report ----
const pct = (x) => (x * 100).toFixed(1) + "%";
const kb = (n) => (n / 1024).toFixed(0) + "KB";
console.log("\n=== CPDF-5 · Tier-1 text-extraction coverage on real Oakland PDFs ===");
console.log("date:", new Date().toISOString().slice(0, 10), "· node", process.version, "· extractor: bio-plane/src/pdfstructure.mjs (CPDF-4)\n");

const w = (s, n) => String(s).padEnd(n).slice(0, n);
console.log(w("document", 30), w("class", 15), w("size", 8), w("pages", 6), w("chars", 9), w("undet", 7), w("cover", 7), w("ms", 6), "outcome");
console.log("-".repeat(110));
for (const r of rows) {
  if (!r.ok) { console.log(w(r.id, 30), w(r.cls, 15), w(r.bytes ? kb(r.bytes) : "-", 8), w("", 6), w("", 9), w("", 7), w("", 7), w(r.ms ?? "", 6), r.outcome, r.reason || ""); continue; }
  console.log(
    w(r.id, 30), w(r.cls, 15), w(kb(r.bytes), 8), w(r.pages, 6),
    w(r.chars, 9), w(r.undetCodepoints, 7), w(pct(r.coverage), 7), w(r.ms, 6), r.outcome,
  );
}

console.log("\n--- residue by cause (undecodable code-points, and the regions that named each) ---");
const totalByReason = new Map();
for (const r of rows) {
  if (!r.byReason) continue;
  for (const [reason, e] of r.byReason) {
    const t = totalByReason.get(reason) || { regions: 0, codepoints: 0, docs: new Set() };
    t.regions += e.regions; t.codepoints += e.codepoints; t.docs.add(r.id);
    totalByReason.set(reason, t);
  }
}
for (const [reason, t] of [...totalByReason].sort((a, b) => b[1].codepoints - a[1].codepoints)) {
  console.log(`  ${w(reason, 26)} codepoints=${w(t.codepoints, 9)} regions=${w(t.regions, 8)} in ${t.docs.size} docs`);
}

console.log("\n--- per-document residue detail + notes + text sample ---");
for (const r of rows) {
  if (!r.ok) { console.log(`\n${r.id}: FAILED — ${r.reason}`); continue; }
  const reasons = r.byReason && r.byReason.size
    ? [...r.byReason].map(([k, e]) => `${k}=${e.codepoints}`).join(" ")
    : "(none)";
  console.log(`\n${r.id} [${r.outcome}] pages=${r.pages} chars=${r.chars} cover=${pct(r.coverage)}`);
  console.log(`  residue: ${reasons}`);
  console.log(`  links: ${JSON.stringify(r.links)}${r.notes.length ? " notes=" + JSON.stringify(r.notes) : ""}`);
  console.log(`  sample: ${JSON.stringify(r.sample)}`);
}

// ---- rollup: the Tier-2 sizing headline ----
const cnt = (o) => rows.filter((r) => r.outcome === o).length;
console.log("\n--- Tier-2 sizing rollup ---");
console.log(`  documents:      ${rows.length}`);
console.log(`  FULLY:          ${cnt("FULLY")}`);
console.log(`  PARTIALLY:      ${cnt("PARTIALLY")}`);
console.log(`  NO-TEXT-LAYER:  ${cnt("NO-TEXT-LAYER")}`);
console.log(`  FAILED:         ${cnt("FAILED")}`);
const decoded = rows.filter((r) => r.ok).reduce((a, r) => a + r.chars, 0);
const undet = rows.filter((r) => r.ok).reduce((a, r) => a + r.undetCodepoints, 0);
console.log(`  corpus-wide coverage: ${pct(decoded / (decoded + undet))} of code-points decoded in-plane by Tier 1`);
