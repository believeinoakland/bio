#!/usr/bin/env node
// tier1-coverage-tier2-oracle.mjs — CPDF-5, the Tier-2 half of the coverage
// measurement.
//
// NOT part of the test battery (deliberately not named *.test.mjs): it npm-installs
// `unpdf` into an OS temp dir and reads real Oakland PDFs, so it touches the network
// and the disk and must never run in `npm test`. It changes NOTHING in this repo:
// no dependency is added to package.json, no bundle is written.
//
// WHY IT EXISTS. tier1-coverage-probe.mjs measures what the in-plane pure-JS Tier-1
// extractor (CPDF-4) decodes. This script runs the SAME documents through `unpdf`
// (the serverless pdf.js the CPDF-6 pdf-worker will hold) as a Tier-2 ORACLE, so the
// claim "the Tier-1 residue is recoverable by the pdf-worker" is MEASURED, not
// assumed. It distinguishes the two residue dispositions that matter for sizing
// CPDF-6:
//   - RECOVERABLE by Tier 2 — encryption (pdf.js decrypts permission-only PDFs) and
//     fonts carrying no /ToUnicode (pdf.js maps glyphs by embedded encoding). unpdf
//     returns real text where Tier 1 returned an `undetermined` residue.
//   - NEEDS OCR — a scanned/image-only page has no text layer at all; unpdf returns
//     zero characters, exactly as Tier 1 does. Neither tier helps; that is a Tier-3
//     (OCR) problem this project does not have.
//
//     node test/tier1-coverage-tier2-oracle.mjs
//
// Reads the same cache tier1-coverage-probe.mjs populates (CPDF5_CACHE, default the
// OS temp dir). Run the Tier-1 probe first so the bytes are present, or set
// CPDF5_CACHE to a directory of <id>.pdf files.

import { readFileSync, existsSync } from "node:fs";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const CACHE = process.env.CPDF5_CACHE || join(tmpdir(), "cpdf5-oakland-pdfs");

// The residue documents from the Tier-1 run, tagged with the Tier-1 finding so the
// oracle's answer can be read against it. (Fully-decoded controls are included so
// the oracle's own numbers can be sanity-checked against Tier 1's.)
const DOCS = [
  ["acfr-2024", "ACFR", "Tier1 FULLY (control)"],
  ["acfr-2025", "ACFR", "Tier1 nil — ENCRYPTED"],
  ["cafr-2003", "ACFR (old)", "Tier1 nil — fonts w/o ToUnicode + undecodable streams"],
  ["budget-adopted-book-full", "Budget book", "Tier1 PARTIAL 88%"],
  ["budget-proposed-book", "Budget book", "Tier1 PARTIAL 88%"],
  ["budget-transmittal", "Budget exhibit", "Tier1 PARTIAL 41% — code_width_misaligned"],
  ["budget-2pager", "Budget exhibit", "Tier1 nil — image-only?"],
  ["budget-deepdive-presentation", "Budget exhibit", "Tier1 FULLY (control)"],
  ["budget-council-amendments", "Budget exhibit", "Tier1 nil — fonts w/o ToUnicode"],
  ["legistar-agenda-1425405", "Agenda packet", "Tier1 FULLY (control)"],
  ["legistar-agenda-1425401", "Agenda packet", "Tier1 FULLY (control)"],
  ["legistar-staffrep-15579526", "Staff report", "Tier1 nil — ENCRYPTED"],
  ["legistar-attach-15579527", "Staff report", "Tier1 nil — fonts w/o ToUnicode + images"],
  ["legistar-attach-15721260", "Staff report", "Tier1 nil — SCANNED (CCITT)"],
];

// pdf.js is chatty on stderr (font-substitution warnings, a Math.sumPrecise notice on
// some node builds). Silence the warning callback so the table is readable; the
// warnings themselves are not the measurement.
const origWarn = console.warn;

const work = mkdtempSync(join(tmpdir(), "cpdf5-oracle-"));
try {
  writeFileSync(join(work, "package.json"), JSON.stringify({ name: "cpdf5-oracle", private: true, type: "module" }));
  console.log("installing unpdf into", work, "(does not touch the repo)…");
  execFileSync("npm", ["install", "--no-audit", "--no-fund", "unpdf"], { cwd: work, stdio: "inherit" });
  const u = await import("file://" + join(work, "node_modules/unpdf/dist/index.mjs"));

  console.log("\n=== CPDF-5 · Tier-2 (unpdf/pdf.js) oracle on the same Oakland corpus ===");
  console.log("date:", new Date().toISOString().slice(0, 10), "· node", process.version, "· unpdf serverless pdf.js\n");
  const w = (s, n) => String(s).padEnd(n).slice(0, n);
  console.log(w("document", 30), w("class", 15), w("tier1 finding", 42), w("t2 pages", 9), w("t2 chars", 10), "disposition");
  console.log("-".repeat(130));

  for (const [id, cls, finding] of DOCS) {
    const path = join(CACHE, id + ".pdf");
    if (!existsSync(path)) { console.log(w(id, 30), w(cls, 15), w(finding, 42), "  MISSING (run tier1-coverage-probe.mjs first)"); continue; }
    let pages = "?", chars = "?", disp = "?";
    try {
      console.warn = () => {};
      const bytes = new Uint8Array(readFileSync(path));
      const pdf = await u.getDocumentProxy(bytes);
      const r = await u.extractText(pdf, { mergePages: true });
      console.warn = origWarn;
      pages = r.totalPages;
      chars = r.text.replace(/\s+/g, "").length; // non-whitespace chars, comparable across extractors
      if (chars === 0) disp = "NEEDS OCR (no text layer — neither tier)";
      else if (/nil/.test(finding)) disp = "RECOVERED by Tier 2";
      else disp = "(also decoded by Tier 1)";
    } catch (e) {
      console.warn = origWarn;
      disp = "unpdf ERROR: " + e.message.slice(0, 48);
    }
    console.log(w(id, 30), w(cls, 15), w(finding, 42), w(pages, 9), w(chars, 10), disp);
  }
} finally {
  console.warn = origWarn;
  rmSync(work, { recursive: true, force: true });
}
