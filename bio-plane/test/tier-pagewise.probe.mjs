#!/usr/bin/env node
/* CPDF-20 / D-283 — TWO DECODES OF ONE LAYER, MEASURED PAGE BY PAGE.
 *
 * NOT part of the battery. A `.probe.mjs` is not discovered by `battery.mjs` or
 * `coverage.mjs`, and this one must not be: it imports `unpdf` out of the
 * pdf-worker's install (the plane does not and must not depend on it — that is
 * the whole reason Tier 2 is a fleet member, CPDF-6), and with `--census` it
 * reaches the network. The battery-resident half is `tier-pagewise.test.mjs`,
 * which is hermetic: it runs Tier 1 for real over the committed fixture and
 * reads Tier 2's decode from `tier2-recorded.json`, which THIS probe writes.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS MEASURES, AND WHY THE ANSWER WAS NOT THE ONE THE DESIGN PREDICTED
 * ─────────────────────────────────────────────────────────────────────────────
 * `EXTRACTION-BREADTH-DESIGN.md` §5.2 states the rule as: per page, the decode
 * with FEWER UNDETERMINED CHARACTERS wins; a tie keeps Tier 1. D-283 asks for
 * the measurement first, and the measurement falsifies the rule as stated:
 *
 *   TIER 2 REPORTS ZERO UNDETERMINED CHARACTERS ON EVERY PAGE IT HAS EVER BEEN
 *   RUN ON — 203 of 203 in the census sample, 15 of 15 in the committed fixture.
 *
 * It is not that Tier 2 decodes perfectly. It is that Tier 2 HAS NO
 * UNDETERMINED-CHARACTER VOCABULARY: `pdf-worker/src/index.mjs` marks a page
 * `no_text_layer` (`count: 0`) when pdf.js returned nothing at all, and is
 * silent about every character pdf.js dropped inside a page it did return text
 * for. Tier 1 counts every code its `/ToUnicode` cannot map. So the two numbers
 * are NOT COMMENSURABLE, and "fewer undetermined characters" is not a
 * comparison at all — it reduces to "did Tier 1 flag this page", which hands
 * Tier 2 every flagged page no matter how little it actually recovered.
 *
 * Measured consequence over the census sample: the rule as stated awards 145 of
 * 203 pages to Tier 2, and 23 of those 145 are pages where TIER 1 HAD DECODED
 * MORE CHARACTERS — 692 characters of real text lost to recover a handful of
 * unmapped glyphs. That is precisely the page `EXTRACTION-BREADTH-DESIGN.md` §8
 * requires the rule to KEEP from Tier 1, so the rule as written fails its own
 * negative control on real documents.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE CORRECTION THE MEASUREMENT SUPPLIES, AND WHY IT IS NOT A CHARACTER COUNT
 * ─────────────────────────────────────────────────────────────────────────────
 * D-283's own row warns that "character count is exactly the instrument CPDF-9
 * argued against", and it is right. The corrected rule does NOT award a page on
 * character count. It keeps §5.2's award axis exactly as designed and adds a
 * ONE-DIRECTIONAL guard that can only ever WITHHOLD an award:
 *
 *   Tier 2 takes a page only if (1) it has strictly fewer undetermined
 *   characters than Tier 1 — Tier 1's own admission that it failed on that page
 *   — AND (2) it decoded strictly more characters than Tier 1. Anything else
 *   keeps Tier 1.
 *
 * Condition (1) is a claim by a producer about its own output; condition (2) is
 * a fact about the text in hand. That is deliberately the SAME two-condition
 * shape `mergeTier3Text` already uses one tier up (D-252, `index.mjs`), and the
 * same one-directional discipline `OCR_PRODUCER_MARKERS` uses (D-251): a
 * detector whose miss is the status quo ante. Character count never promotes a
 * page; it only ever refuses to demote one. Measured: 0 pages degraded, the
 * same 122 pages recovered, +186,242 characters, nothing left behind.
 *
 * ARMS
 *   (default)     the hermetic measurement over the committed fixture
 *   --census      rebuild the live Legistar sample and measure the wide corpus
 *                 (NETWORK; caches under /var/tmp/cpdf20-corpus)
 *   --record      rewrite `tier2-recorded.json` from a live Tier-2 decode
 *   --verify      re-derive Tier 2 and diff against the recorded JSON (drift)
 *
 * usage: node bio-plane/test/tier-pagewise.probe.mjs [--census|--record|--verify]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { extractPdfStructure } from "../src/pdfstructure.mjs";
import { perPageTierWinner, mergeTier2Text, TIER_RULE } from "../src/textchain.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "fixtures", "cpdf20");
const RECORDED = join(FIXTURES, "tier2-recorded.json");
const argv = new Set(process.argv.slice(2));
const sha = (b) => createHash("sha256").update(b).digest("hex");

/* THE FIXTURE FLOOR. A totality assertion over an empty corpus passes for free —
   three times in this repository (CLAUDE.md). This probe prints its corpus and
   refuses to report anything over less than the fixture it was written for. */
const FIXTURE_FLOOR = 4;

/* Tier 2 lives in the fleet member and its dependency is the member's, never the
   plane's. Resolved through the member's own package the way `pdf-worker`'s suite
   resolves miniflare through the plane's — the mechanism COPIED, not a second one
   invented (CPDF-9). Absent install is NAMED, never silently skipped. */
async function loadUnpdf() {
  try {
    const req = createRequire(join(HERE, "..", "..", "pdf-worker", "package.json"));
    return await import(req.resolve("unpdf"));
  } catch (e) {
    return null;
  }
}

/* Tier 2, reshaped exactly as `pdf-worker/src/index.mjs` reshapes it. Copied
   deliberately rather than imported: importing the member's handler would drag
   its Workers runtime surface into a node probe, and the thing being measured is
   the TEXT SHAPE, which is I2's and is what both tiers agree on. */
async function tier2Text(unpdf, bytes) {
  const pdf = await unpdf.getDocumentProxy(bytes);
  const { text } = await unpdf.extractText(pdf, { mergePages: false });
  const perPage = Array.isArray(text) ? text : [text];
  const pages = [], undetermined = [];
  for (let i = 0; i < perPage.length; i++) {
    const pageText = perPage[i] || "";
    const u = [];
    if (pageText.trim().length === 0) {
      const m = { page: i, reason: "no_text_layer", font: null, codes: "", count: 0 };
      u.push(m); undetermined.push(m);
    }
    pages.push({ page: i, text: pageText, undetermined: u });
  }
  const document = pages.map((p) => p.text).filter((t) => t.length).join("\n");
  return { document, pages, undetermined,
           counts: { chars: document.length, undetermined: undetermined.length } };
}

const undetChars = (p) => (p.undetermined || []).reduce((n, m) => n + (m.count || 0), 0);

/* The two candidate rules, side by side, so the report is a comparison rather
   than an assertion. C1 is the design as written; C2 is what ships. */
const C1 = (u1, u2) => (u2 < u1 ? "tier2" : "tier1");
const C2 = (u1, u2, c1, c2) => (u2 < u1 && c2 > c1 ? "tier2" : "tier1");

/* NAMED, NOT WALKED — the same manifest `tier-pagewise.test.mjs` carries, and for
   the same reason: a corpus defined as "whatever is in the directory" shrinks in
   silence, and a measurement over a silently smaller corpus is the failure this
   probe's own floor exists to catch. It also keeps both files out of the estate's
   walk census, which is for walks over ground the walker does not control. */
const FIXTURE_MANIFEST = ["legistar-73450.pdf", "legistar-73545.pdf",
                          "legistar-73550.pdf", "legistar-73618.pdf"];
function fixtureDocs() {
  const out = [];
  for (const f of FIXTURE_MANIFEST) {
    const path = join(FIXTURES, f);
    if (!existsSync(path)) { console.log(`  MISSING FIXTURE: ${f} — named in the manifest, not on disk`); continue; }
    const bytes = new Uint8Array(readFileSync(path));
    out.push({ id: f.replace(/\.pdf$/, ""), bytes, size: bytes.length, sha: sha(bytes) });
  }
  return out;
}

async function measure(docs, unpdf, recorded) {
  const out = [];
  for (const d of docs) {
    let s;
    try { s = await extractPdfStructure(d.bytes); } catch (e) { out.push({ id: d.id, error: String(e.message) }); continue; }
    if (!s.ok) { out.push({ id: d.id, error: s.reason }); continue; }
    const t1 = s.text;
    let t2 = null;
    if (unpdf) { try { t2 = await tier2Text(unpdf, d.bytes); } catch (e) { t2 = { error: String(e.message) }; } }
    else if (recorded && recorded[d.id]) t2 = recorded[d.id];
    if (!t2 || t2.error) { out.push({ id: d.id, error: `tier2: ${t2 ? t2.error : "unavailable"}` }); continue; }
    const p1 = t1.pages || [], p2 = t2.pages || [];
    const n = Math.max(p1.length, p2.length);
    const rows = [];
    for (let i = 0; i < n; i++) {
      const a = p1.find((p) => p.page === i) || { page: i, text: "", undetermined: [] };
      const b = p2.find((p) => p.page === i) || { page: i, text: "", undetermined: [] };
      rows.push({ page: i, u1: undetChars(a), u2: undetChars(b),
                  c1: (a.text || "").length, c2: (b.text || "").length });
    }
    out.push({ id: d.id, sha: d.sha, size: d.size, rows, t1, t2 });
  }
  return out;
}

function report(measured, label) {
  let pages = 0, c1t2 = 0, c2t2 = 0, degraded = 0, lost = 0, gained = 0, missed = 0;
  let t2ReportedUndetChars = 0;
  for (const m of measured) {
    if (m.error) { console.log(`  ${m.id.padEnd(22)} SKIP ${m.error}`); continue; }
    for (const r of m.rows) {
      pages++;
      if (r.u2 > 0) t2ReportedUndetChars++;
      const a = C1(r.u1, r.u2), b = C2(r.u1, r.u2, r.c1, r.c2);
      if (a === "tier2") c1t2++;
      if (b === "tier2") { c2t2++; gained += r.c2 - r.c1; }
      if (a === "tier2" && r.c1 > r.c2) { degraded++; lost += r.c1 - r.c2; }
      if (b === "tier1" && r.c2 > r.c1) missed++;
    }
  }
  console.log(`\n${label}`);
  console.log(`  documents: ${measured.filter((m) => !m.error).length}   pages: ${pages}`);
  console.log(`  COMMENSURABILITY — pages on which TIER 2 reported ANY undetermined character: ${t2ReportedUndetChars} of ${pages}`);
  console.log(`  C1 (design §5.2 as written): ${c1t2} page(s) to tier 2; ${degraded} DEGRADED (-${lost} chars)`);
  console.log(`  C2 (the rule that ships):    ${c2t2} page(s) to tier 2; 0 degraded by construction (+${gained} chars)`);
  console.log(`  pages C2 leaves with tier 1 where tier 2 had more text: ${missed}`);
  return { pages, c1t2, c2t2, degraded, lost, gained, missed, t2ReportedUndetChars };
}

/* ── the live census arm (network) ───────────────────────────────────────── */
const UA = "CivicOS/0.58.0 (+https://github.com/believeinoakland/bio; instance biosmoke7; acquire)";
const CACHE = "/var/tmp/cpdf20-corpus/docs";
async function censusDocs(limit = 60) {
  mkdirSync(CACHE, { recursive: true });
  const wanted = [], seen = new Set();
  try {
    const matters = await (await fetch(
      "https://webapi.legistar.com/v1/oakland/matters?%24top=60&%24orderby=MatterLastModifiedUtc%20desc",
      { headers: { "user-agent": UA } })).json();
    for (const m of matters) {
      if (wanted.length >= limit) break;
      let atts = [];
      try {
        atts = await (await fetch(`https://webapi.legistar.com/v1/oakland/matters/${m.MatterId}/attachments`,
          { headers: { "user-agent": UA } })).json();
      } catch { continue; }
      for (const a of atts) {
        if (wanted.length >= limit) break;
        if (!a.MatterAttachmentHyperlink || seen.has(a.MatterAttachmentId)) continue;
        seen.add(a.MatterAttachmentId);
        wanted.push({ id: `legistar-${a.MatterAttachmentId}`, url: a.MatterAttachmentHyperlink });
      }
    }
  } catch (e) { console.log(`  ! Legistar listing unavailable (${e.message})`); }
  const docs = [];
  for (const w of wanted) {
    const path = join(CACHE, `${w.id}.pdf`);
    try {
      if (!existsSync(path)) {
        const r = await fetch(w.url, { headers: { "user-agent": UA }, redirect: "follow" });
        if (!r.ok) continue;
        writeFileSync(path, new Uint8Array(await r.arrayBuffer()));
      }
      const bytes = new Uint8Array(readFileSync(path));
      if (bytes[0] !== 0x25 || bytes[1] !== 0x50) continue;
      docs.push({ id: w.id, bytes, size: bytes.length, sha: sha(bytes) });
    } catch { /* a document that will not fetch is not a finding about pages */ }
  }
  return docs;
}

/* ── main ────────────────────────────────────────────────────────────────── */
console.log(`CPDF-20 / D-283 — two decodes of one layer, page by page`);
console.log(`rule that ships: ${TIER_RULE}`);

const unpdf = await loadUnpdf();
console.log(`tier 2 (unpdf, via pdf-worker's install): ${unpdf ? "AVAILABLE" : "NOT INSTALLED — the recorded decode is used instead, and this is SAID rather than skipped"}`);

const docs = fixtureDocs();
console.log(`\nfixture corpus: ${docs.length} PDF(s), ${(docs.reduce((n, d) => n + d.size, 0) / 1e3).toFixed(0)} KB, in ${FIXTURES}`);
for (const d of docs) console.log(`  ${d.id.padEnd(20)} ${String(d.size).padStart(8)} B  ${d.sha.slice(0, 16)}`);
if (docs.length < FIXTURE_FLOOR) {
  console.error(`\nFIXTURE FLOOR: ${docs.length} document(s) is below the floor of ${FIXTURE_FLOOR}. `
              + `A measurement over a truncated corpus reports clean and means nothing. REFUSED.`);
  process.exit(2);
}

const recorded = existsSync(RECORDED) ? JSON.parse(readFileSync(RECORDED, "utf8")) : null;

if (argv.has("--census")) {
  if (!unpdf) { console.error("--census needs unpdf: run `npm ci` in pdf-worker/."); process.exit(2); }
  const cd = await censusDocs();
  console.log(`\nlive census sample: ${cd.length} PDF(s), ${(cd.reduce((n, d) => n + d.size, 0) / 1e6).toFixed(1)} MB`);
  const m = await measure(cd, unpdf, null);
  report(m, `── THE LIVE CENSUS SAMPLE ──`);
  process.exit(0);
}

const measured = await measure(docs, unpdf, recorded);

console.log(`\n── PER PAGE, BOTH DECODES ──`);
console.log(`doc                  page   t1 chars  t1 undet   t2 chars  t2 undet   C1        C2`);
for (const m of measured) {
  if (m.error) { console.log(`${m.id.padEnd(20)} SKIP ${m.error}`); continue; }
  for (const r of m.rows) {
    const a = C1(r.u1, r.u2), b = C2(r.u1, r.u2, r.c1, r.c2);
    console.log(
      `${m.id.padEnd(20)}${String(r.page).padStart(5)}${String(r.c1).padStart(11)}${String(r.u1).padStart(10)}` +
      `${String(r.c2).padStart(11)}${String(r.u2).padStart(10)}   ${a.padEnd(9)} ${b}${a !== b ? "   <- C1 would DEGRADE this page" : ""}`);
  }
}

const fig = report(measured, `── THE COMMITTED FIXTURE ──`);

/* THE BASELINE ROW. A harness whose every arm reads the same thing cannot tell
   six-arms-broken from six-arms-working (CLAUDE.md). This is the row that
   distinguishes them: the rule run against a decode that IS Tier 1 must award
   nothing, whatever the rest of the report says. */
{
  let awarded = 0;
  for (const m of measured) {
    if (m.error) continue;
    for (const r of m.rows) if (C2(r.u1, r.u1, r.c1, r.c1) === "tier2") awarded++;
  }
  console.log(`\n  BASELINE (tier 2's decode replaced by tier 1's own): ${awarded} page(s) awarded — MUST be 0`);
  if (awarded !== 0) { console.error("  BASELINE FAILED: the rule awards a page to a decode identical to tier 1."); process.exit(1); }
}

if (argv.has("--record")) {
  if (!unpdf) { console.error("--record needs unpdf: run `npm ci` in pdf-worker/."); process.exit(2); }
  const rec = {};
  for (const m of measured) if (!m.error) rec[m.id] = { pages: m.t2.pages, undetermined: m.t2.undetermined, counts: m.t2.counts };
  writeFileSync(RECORDED, JSON.stringify(rec, null, 1));
  console.log(`\nrecorded tier-2 decode for ${Object.keys(rec).length} document(s) -> ${RECORDED}`);
}

if (argv.has("--verify")) {
  if (!unpdf) { console.error("--verify needs unpdf."); process.exit(2); }
  if (!recorded) { console.error("--verify: nothing recorded yet."); process.exit(2); }
  let drift = 0;
  for (const m of measured) {
    if (m.error) continue;
    const was = recorded[m.id];
    if (!was) { console.log(`  DRIFT ${m.id}: not in the recorded decode`); drift++; continue; }
    for (const r of m.rows) {
      const p = (was.pages || []).find((x) => x.page === r.page);
      const cWas = p ? (p.text || "").length : 0;
      if (cWas !== r.c2) { console.log(`  DRIFT ${m.id} p${r.page}: recorded ${cWas} chars, live ${r.c2}`); drift++; }
    }
  }
  console.log(`\nverify: ${drift} drift(s) between the recorded tier-2 decode and a live one`);
  process.exit(drift ? 1 : 0);
}
