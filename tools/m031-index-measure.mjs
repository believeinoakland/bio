#!/usr/bin/env node
/* m031-index-measure.mjs — SEARCH §5's four numbers, taken rather than assumed.
 *
 * `CONTENT-SEARCH-DESIGN.md` §5 names four things that must be measured before
 * the content-grain text index is built, and §4.3's per-capture bound is
 * PROVISIONAL until they are. This is the instrument. It commits no product
 * code, moves no plane file, and builds nothing: it measures.
 *
 *   1. text bytes per captured PAGE and per DOCUMENT   (mode `text` + `derive`)
 *   2. index bytes per text byte on workerd's SQLite    (mode `index`)
 *   3. the storage curve that falls out of 1 and 2      (mode `derive`, from 1+2)
 *   4. promote-time CPU per indexed unit                (mode `cpu`)
 *
 * WHAT IT DRIVES, and this is the whole argument for trusting the figures. The
 * text is produced by THE PLANE'S OWN EXTRACTORS, reached the way `index.mjs`
 * reaches them (`detectFormat` -> `getFormat(fmt)` -> `entry.parts()` ->
 * `entry.text()`, and for a PDF `entry.structure()` then the pdf-worker's own
 * `fetch` handler when `needsTier2` says so). Nothing here reimplements an
 * extractor. A measurement over a parallel copy of the subject is the instrument
 * defect this project has already paid for twice (`meaning-index-probe.mjs`'s
 * own header records one), and the cheapest way to avoid it is to import the
 * thing.
 *
 * THE ONE PLACE A TABLE IS TYPED HERE IS THE ONE PLACE IT CANNOT BE IMPORTED:
 * `capture_text` and `capture_text_fts` DO NOT EXIST IN THE PRODUCT. They are
 * SEARCH §4.1's decided shape and item 4 of §7 is the row that will build them.
 * So the DDL below is quoted from the design, which is the authority for a thing
 * not yet built, and it is marked at its site. When item 4 lands, this probe's
 * DDL must be re-pointed at `schema.mjs` or the figure re-taken; that act is in
 * this item's report.
 *
 * THE CORPUS is COFF-6's census corpus — `s3://cao-94612`, the asset store every
 * `oaklandca.gov/files/assets/...` URL serves from, which answers public
 * anonymous `ListObjectsV2` and needs no credential of ours (CAP-7 established
 * that at M-13 and it is re-established on every run by the listing itself).
 * The OOXML half is a CENSUS; the PDF half is a fixed-seed SAMPLE, because the
 * PDF half is 133.6 GB.
 *
 * AN EMPTY CORPUS MUST REFUSE. A headline figure that passed over an empty
 * corpus is this project's three-times failure (WORKER.md, "Negative controls"),
 * so every derived figure here is guarded by `floorOrRefuse()`, which exits
 * non-zero naming what was empty. The `control` mode arms that refusal and its
 * over-strictness twin (a corpus of ONE measures and says n=1) and prints both.
 *
 * Usage
 *   node tools/m031-index-measure.mjs text [--pdf N] [--budget-min M]
 *        [--no-ooxml] [--no-pdf] [--append] [--no-sample]
 *   node tools/m031-index-measure.mjs derive [--log PATH]
 *   node tools/m031-index-measure.mjs index  [--log PATH] [--units N]
 *   node tools/m031-index-measure.mjs cpu    [--log PATH] [--units N]
 *   node tools/m031-index-measure.mjs control
 *
 * Exit: 0 the mode completed and printed its FOOT · 1 a figure was refused, or
 * a control arm came back other than declared. A run that prints no FOOT line
 * did not reach its own end and its numbers are void (WORKER.md: a TypeError
 * inside an assertion goes through no assertion at all).
 *
 * NEGATIVE CONTROL: run `control` — hand `deriveFigures` an EMPTY corpus -> every
 *   headline figure REFUSES rather than printing zeros (the three-times failure)
 *   (b) a corpus of three documents that all failed to fetch -> REFUSED, because
 *   documents that produced no unit are an empty corpus wearing a count
 *   (c) OVER-STRICTNESS: a corpus of ONE document with one page -> MEASURES and
 *   says n=1, never refused for being small
 *   (d) OVER-STRICTNESS: one 0-byte page among three real ones -> measured at
 *   n=4; a scanned page that recovered nothing is a DATUM, not an empty corpus
 *   (e) three pages, all 0 bytes -> the all-pages figure measures and the
 *   pages-with-text figure REFUSES, so a scanned corpus cannot produce a
 *   bytes-per-page headline
 *   (f) the `needsTier2` copy below is diffed against `index.mjs`'s shipped one,
 *   comment-stripped -> MATCH, or the tier split here is measuring a predicate
 *   the plane does not have
 *   (g) BASELINE: a real three-document corpus prints its figures, which is the
 *   row that distinguishes six-arms-broken from six-arms-working.
 *
 * NOT a member of hygiene.test.mjs's discovery-walk census (M0-18's narrowed
 * unknown, "`tools/` was hand-read and holds no member of the class"): this file
 * performs NO directory walk — it reads a bucket listing over the network and two
 * files by name — and floors on a CORPUS rather than on a directory's contents.
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const PEN = join(REPO, ".m031-pen");
const LOG = join(PEN, "text-units.jsonl");
const KEYS = join(PEN, "keys.json");
const BUCKET = "cao-94612";

/* The units SEARCH §4.1 names, and the one it names that I2 cannot yet answer.
   Read the `slide-shape` row with §4.1 open: the design's deck unit is the
   SHAPE, and the I2 text shape emits per-SLIDE text. See DESIGN GAP in this
   item's report. */
const UNIT_KIND = {
  pdf: "pdf-page",
  docx: "doc-para",
  pptx: "slide-slide",          // §4.1 asks for `slide-shape`; I2 answers per slide
  xlsx: null,                   // §4.1: no unit arm until EXTRACTION-BREADTH §3.2's `sheet-range`
};

const arg = (name, dflt = null) => {
  const i = process.argv.indexOf(name);
  return i > 0 && process.argv[i + 1] != null ? process.argv[i + 1] : dflt;
};
const has = (name) => process.argv.includes(name);
const n = (v) => Number(v).toLocaleString("en-US");
const B = (s) => Buffer.byteLength(s ?? "", "utf8");

/** WHAT AN `undetermined` MARKER CALLS ITSELF, and the first version of this file
 *  got it wrong in exactly the direction WORKER.md warns about. The PDF markers
 *  carry `reason` (`no_text_layer`, `over_envelope`); `ooxml.mjs`'s `sizeGuard`
 *  carries `why` (`over_size_bound`) and no `reason` at all. Reading only
 *  `reason` scored EIGHTEEN over-the-bound workbooks as an undetermined with a
 *  NULL name — a thing the matcher did not understand, silently unnamed, which
 *  is the defect the sweep rule exists to catch. It was found by reading the
 *  corpus's own output rather than by reasoning, and it is named here so the
 *  next marker shape is added to this one function. */
const markerName = (u) => (u && (u.reason ?? u.why)) || "UNNAMED_MARKER";

/* ------------------------------------------------------------------ *
 * The refusal. Every headline figure passes through this.
 * ------------------------------------------------------------------ */
let REFUSALS = 0;
class EmptyCorpus extends Error {}

/** A figure over fewer than `floor` observations is NOT reported. It is refused,
 *  by name, with the corpus size printed — because the failure this guards is
 *  not a wrong number, it is a ZERO that reads like a number. `floor` is 1 by
 *  default and never 0: a corpus of ONE is a measurement (it says n=1); a corpus
 *  of NONE is not. */
function floorOrRefuse(label, arr, floor = 1) {
  const len = Array.isArray(arr) ? arr.length : 0;
  if (len < floor) {
    REFUSALS++;
    const e = new EmptyCorpus(
      `REFUSED — "${label}" has n=${len}, below the floor of ${floor}. ` +
      `No figure is printed for it. An empty corpus does not measure zero; it measures NOTHING.`);
    e.label = label; e.n = len; e.floor = floor;
    throw e;
  }
  return arr;
}

const stats = (label, xs, floor = 1) => {
  floorOrRefuse(label, xs, floor);
  const s = [...xs].sort((a, b) => a - b);
  const p = (q) => s[Math.min(s.length - 1, Math.floor(q * s.length))];
  const sum = s.reduce((a, b) => a + b, 0);
  return { label, n: s.length, sum, mean: sum / s.length, p50: p(0.5), p75: p(0.75),
           p90: p(0.9), p95: p(0.95), p99: p(0.99), max: s[s.length - 1], min: s[0] };
};
const row = (t) => `| ${t.label} | ${n(t.n)} | ${n(Math.round(t.mean))} | ${n(t.p50)} | ` +
  `${n(t.p75)} | ${n(t.p90)} | ${n(t.p95)} | ${n(t.p99)} | ${n(t.max)} |`;
const HEAD = "| what | n | mean | p50 | p75 | p90 | p95 | p99 | max |\n" +
             "| --- | --- | --- | --- | --- | --- | --- | --- | --- |";

/* ------------------------------------------------------------------ *
 * The corpus — listed, never inherited
 * ------------------------------------------------------------------ */
async function bucketKeys() {
  let token = null, keys = [], reqs = 0;
  for (;;) {
    const q = new URLSearchParams({ "list-type": "2", "max-keys": "1000" });
    if (token) q.set("continuation-token", token);
    const xml = await (await fetch(`https://${BUCKET}.s3.amazonaws.com/?${q}`)).text();
    reqs++;
    for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const k = /<Key>([\s\S]*?)<\/Key>/.exec(m[1]);
      const s = /<Size>(\d+)<\/Size>/.exec(m[1]);
      if (k && s) keys.push({ key: k[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'"), size: Number(s[1]) });
    }
    const tok = /<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/.exec(xml);
    if (!/<IsTruncated>true<\/IsTruncated>/.test(xml) || !tok) break;
    token = tok[1];
    await new Promise((r) => setTimeout(r, 250));
  }
  return { keys, reqs };
}

const extOf = (key) => {
  const name = key.split("/").pop();
  return name.includes(".") ? name.split(".").pop().toLowerCase() : "";
};

/** THE PDF DRAW IS M-13's OWN DRAW, not a second one beside it.
 *
 *  CAP-7 drew its 1,000 with python's `random.sample` under seed 20260914
 *  (`tools/measure-office-corpus.py`, `cmd_drivelinks`). Python's Mersenne
 *  Twister cannot be reproduced in node, and a DIFFERENT sample of the same
 *  population would have been a perfectly honest sample that could not be
 *  compared document-for-document with M-13's. So the draw is delegated to
 *  python3 with the same two lines, which makes this corpus literally the one
 *  M-13 measured. `random.sample` selects by INDEX, so feeding it the key
 *  strings rather than CAP-7's dicts selects the same positions.
 *
 *  A PREFIX OF THE RESULT IS ITSELF A UNIFORM SAMPLE — `random.sample` returns
 *  its picks in selection order — which is what lets this walk run to a declared
 *  wall-clock budget and stop, reporting the N it reached rather than the N it
 *  wanted. The stop is a budget, never a filter: nothing about a document
 *  decides whether it is reached. */
function pdfDraw(pdfKeys, want) {
  const inPath = join(PEN, "pdf-population.json");
  writeFileSync(inPath, JSON.stringify(pdfKeys.map((k) => k.key)));
  const code =
    "import sys,json,random\n" +
    "pop=json.load(open(sys.argv[1]))\n" +
    "random.seed(20260914)\n" +                       // CAP-7's seed, M-13's draw
    "k=int(sys.argv[2])\n" +
    "print(json.dumps(pop if len(pop)<=k else random.sample(pop,k)))\n";
  const out = execFileSync("python3", ["-c", code, inPath, String(want)],
                           { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const picked = JSON.parse(out);
  const byKey = new Map(pdfKeys.map((k) => [k.key, k]));
  return picked.map((k) => byKey.get(k)).filter(Boolean);
}

async function body(key) {
  /* Per SEGMENT, so `?`, `&`, `#`, `+` and a space inside a key name cannot be
     read as URL syntax. `encodeURI` leaves every one of those alone and
     python's `urllib.parse.quote` (CAP-7's encoder) does not — this is the node
     equivalent of what M-13's run sent. */
  const url = `https://${BUCKET}.s3.amazonaws.com/` +
    key.split("/").map(encodeURIComponent).join("/");
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url);
      if (!r.ok) { if (r.status === 404) return null; throw new Error(`HTTP ${r.status}`); }
      return new Uint8Array(await r.arrayBuffer());
    } catch (e) {
      if (attempt === 2) { process.stderr.write(`    fetch failed ${key}: ${e.message}\n`); return null; }
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * mode `text` — the corpus walk
 * ------------------------------------------------------------------ */

/* `index.mjs`'s own escalation predicate, quoted at its site rather than
   imported, because importing it would mean importing 8,000 lines of Worker
   module into node. IT IS A COPY AND IT IS MARKED AS ONE: if it drifts from
   `index.mjs:2545` the tier split below is wrong, so the `control` mode asserts
   the two agree on four shapes. */
function needsTier2(text) {
  const c = text && text.counts;
  if (!c || typeof c.chars !== "number" || typeof c.undetermined !== "number") return false;
  if (!(c.undetermined > c.chars)) return false;
  const marks = Array.isArray(text.undetermined) ? text.undetermined : [];
  if (marks.length && marks.every((m) => m && m.reason === "no_text_layer")) return false;
  return true;
}

async function extractDoc(bytes, key, { detectFormat, getFormat, pdfWorker }) {
  const ext = extOf(key);
  const fmt = detectFormat(bytes, null);
  const base = { key, ext, container_bytes: bytes.length, format: fmt.format,
                 confidence: fmt.confidence };
  if (fmt.format === "undetermined") return { ...base, unit_kind: null, units: [],
    doc_bytes: 0, note: "format undetermined by the registry — nothing extracted, nothing indexed" };

  const entry = getFormat(fmt.format);
  if (fmt.format === "pdf") {
    const st = await entry.structure(bytes);
    if (!st || !st.ok) return { ...base, unit_kind: "pdf-page", units: [], doc_bytes: 0,
      tier: 0, note: `tier-1 structure refused: ${st?.reason ?? "unknown"}` };
    let text = st.text || null, tier = 1, note = null;
    if (text && needsTier2(text)) {
      /* The REAL pdf-worker handler, driven through its own `fetch` with an R2
         stub that hands it these bytes — so the 16 MB envelope, the honest
         `over_envelope` decline and the tier-2 error path are all the shipped
         ones. It runs on node rather than workerd; what is being measured is
         the BYTES pdf.js recovers, which is not a runtime property. */
      const env = { CAPTURES: { get: async () => ({ arrayBuffer: async () =>
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) }) } };
      try {
        const res = await pdfWorker.fetch(new Request("https://pdf-worker/structure", {
          method: "POST", headers: { "content-type": "application/json" },
          /* D-478: WAS `store: "m031"`, a namespace no instance holds. The member now refuses such a name
             NAMESPACE_UNKNOWN, and this driver reads the refusal as "no tier-2 text" and silently keeps Tier 1 —
             an instrument degrading without saying so. The R2 stub below ignores the key entirely, so the name
             was always arbitrary; it is now one that exists. */
          body: JSON.stringify({ capture_sha: "0".repeat(64), store: "scratch" }) }), env);
        const j = await res.json();
        if (j && j.text) { text = j.text; tier = j.tier ?? 2; note = (j.notes || []).join(";") || null; }
      } catch (e) { note = `tier2_driver_error:${String(e.message).slice(0, 80)}`; }
    }
    const pages = Array.isArray(text?.pages) ? text.pages : [];
    return { ...base, unit_kind: "pdf-page", tier,
             units: pages.map((p) => B(p.text)),
             _texts: pages.map((p) => p.text || ""),
             pages_declared: Number.isInteger(st.pages) ? st.pages : null,
             doc_bytes: B(text?.document ?? ""),
             undetermined: (text?.undetermined || []).length,
             undetermined_reasons: [...new Set((text?.undetermined || []).map(markerName))],
             note };
  }

  /* The office shape, reached exactly as `index.mjs:5407` reaches it. */
  if (typeof entry.text !== "function")
    return { ...base, unit_kind: null, units: [], doc_bytes: 0,
             note: "the registry entry has no text() surface" };
  const parts = typeof entry.parts === "function" ? await entry.parts(bytes) : bytes;
  const t = await entry.text(parts);
  if (!t || t.ok === false)
    return { ...base, unit_kind: UNIT_KIND[fmt.format] ?? null, units: [], doc_bytes: 0,
             note: `text() refused: ${t?.reason ?? "unknown"}` };
  const kind = UNIT_KIND[fmt.format] ?? null;
  const arr = t.paragraphs || t.slides || t.sheets || [];
  const guard = (t.undetermined || []).find((u) => u && /bound|guard|declared/i.test(
    `${u.reason ?? ""}${u.why ?? ""}`));
  return { ...base, unit_kind: kind,
           units: kind ? arr.map((u) => B(u.text)) : [],
           _texts: kind ? arr.map((u) => u.text || "") : [],
           unindexable_units: kind ? 0 : arr.length,
           doc_bytes: B(t.document ?? ""),
           undetermined: (t.undetermined || []).length,
           undetermined_reasons: [...new Set((t.undetermined || []).map(markerName))],
           /* BOTH facts, never the first one that fits. An over-the-bound
              workbook is over the bound AND has no unit arm, and reporting only
              the arm would hide the bound from the §4.3 table that needs it. */
           note: [guard ? "over the COFF-2 bound: text-undetermined" : null,
                  kind ? null : "no unit arm for this container (SEARCH §4.1: sheet-range is piece 4)"]
                 .filter(Boolean).join(" · ") || null };
}

async function modeText() {
  mkdirSync(PEN, { recursive: true });
  const { detectFormat, getFormat } = await import("../bio-plane/src/formats.mjs");
  const pdfWorker = (await import("../pdf-worker/src/index.mjs")).default;
  const drivers = { detectFormat, getFormat, pdfWorker };

  const wantPdf = Number(arg("--pdf", "1000"));
  const budgetMin = Number(arg("--budget-min", "90"));
  const t0 = Date.now();
  const overBudget = () => (Date.now() - t0) / 60000 >= budgetMin;

  process.stdout.write(`corpus: s3://${BUCKET} — listing (COFF-6 read 43,282 keys on 2026-08-03; ` +
    `CAP-7 read 43,283 on 2026-09-14)\n`);
  const { keys, reqs } = await bucketKeys();
  writeFileSync(KEYS, JSON.stringify(keys));
  if (keys.length === 0) {
    process.stderr.write("REFUSED — the bucket listing returned ZERO keys. " +
      "Nothing is measured over an empty corpus.\n");
    process.exit(1);
  }
  const byExt = new Map();
  for (const k of keys) {
    const e = extOf(k.key);
    if (!byExt.has(e)) byExt.set(e, []);
    byExt.get(e).push(k);
  }
  const pick = (...es) => es.flatMap((e) => byExt.get(e) || []);
  const ooxml = pick("docx", "xlsx", "pptx", "pptm", "docm", "xlsm");
  const pdfs = pick("pdf");
  const legacy = pick("doc", "xls", "ppt");
  process.stdout.write(
    `population: ${n(keys.length)} keys, ${reqs} list requests — ` +
    `${n(pdfs.length)} pdf (${(pdfs.reduce((a, k) => a + k.size, 0) / 1e9).toFixed(1)} GB), ` +
    `${n(ooxml.length)} OOXML (${(ooxml.reduce((a, k) => a + k.size, 0) / 1e6).toFixed(0)} MB), ` +
    `${n(legacy.length)} legacy OLE2 (NOT EXTRACTED — no OLE2 reader exists here, ` +
    `COFF-6's recorded deferral)\n`);

  /* `--append` re-walks one half into the SAME log without discarding the other.
     It exists because this item's instrument was corrected mid-walk (the
     `markerName` note above) and the OOXML half had to be re-read while the PDF
     half was still running — `derive` keeps the LAST record per key, so a
     re-walk supersedes rather than double-counts. */
  const out = createWriteStream(LOG, { flags: has("--append") ? "a" : "w" });
  const write = (o) => out.write(JSON.stringify(o) + "\n");
  /* THE SECOND LOG, and why there are two. The main log keeps unit BYTE LENGTHS
     (a log holding every unit's text would be gigabytes and helps nobody), but
     the index-ratio and promote-cost arms need REAL TEXT: an FTS5 index's size
     and a tokeniser's cost are functions of the token distribution, and
     generated text has the wrong one. So a bounded sample of actual unit text
     is written beside it — the FIRST `UNIT_SAMPLE_PER_DOC` units of every
     document that has any, which is reading order and therefore the order a
     promote writes them in. */
  const UNIT_SAMPLE_PER_DOC = 12;
  const sample = createWriteStream(join(PEN, "unit-text-sample.jsonl"),
                                   { flags: has("--append") ? "a" : "w" });
  let done = 0, bytes = 0, stopped = null, sampled = 0;

  const walk = async (label, pool, half) => {
    process.stdout.write(`\n${label}: ${n(pool.length)} documents\n`);
    let i = 0;
    for (const k of pool) {
      if (overBudget()) { stopped = `${label} stopped at ${i}/${pool.length} on the ` +
        `${budgetMin}-minute wall-clock budget`; break; }
      i++;
      const b = await body(k.key);
      if (!b) { write({ key: k.key, ext: extOf(k.key), half, error: "FETCH_FAILED" }); continue; }
      bytes += b.length;
      let rec;
      try { rec = await extractDoc(b, k.key, drivers); }
      catch (e) { rec = { key: k.key, ext: extOf(k.key), container_bytes: b.length,
                          error: `EXTRACT_THREW:${String(e.message).slice(0, 120)}` }; }
      const texts = rec._texts || [];
      delete rec._texts;
      write({ ...rec, half });
      for (const t of has("--no-sample") ? [] : texts.slice(0, UNIT_SAMPLE_PER_DOC)) {
        if (!t) continue;
        sample.write(JSON.stringify({ key: k.key, kind: rec.unit_kind, text: t }) + "\n");
        sampled++;
      }
      done++;
      await new Promise((r) => setTimeout(r, 250));
      if (i % 25 === 0)
        process.stdout.write(`    ${i}/${pool.length} (${(bytes / 1e6).toFixed(0)} MB, ` +
          `${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
    }
    return i;
  };

  const reach = {};
  if (!has("--no-ooxml")) reach.ooxml = `${await walk("OOXML CENSUS", ooxml, "ooxml")}/${ooxml.length}`;
  else reach.ooxml = "SKIPPED (--no-ooxml)";

  if (!has("--no-pdf")) {
    const draw = pdfDraw(pdfs, Math.min(wantPdf, pdfs.length));
    const readPdf = await walk(
      `PDF SAMPLE (M-13's own draw, seed 20260914; a PREFIX of it is itself uniform)`, draw, "pdf");
    reach.pdf = `${readPdf}/${draw.length} of ${pdfs.length} — SAMPLE ` +
      `${(100 * readPdf / pdfs.length).toFixed(2)}% of the PDF population by count`;
  } else reach.pdf = "SKIPPED (--no-pdf)";
  reach.legacy = `0/${legacy.length} — legacy OLE2 NOT READ (no reader; COFF-6's deferral)`;
  reach.other = `0/${keys.length - pdfs.length - ooxml.length - legacy.length} keys of other ` +
    `types not walked (images, csv, html, zip, …) — they are not captured documents with ` +
    `an indexable unit arm`;

  await new Promise((r) => out.end(r));
  await new Promise((r) => sample.end(r));
  reach.unitTextSample = `${n(sampled)} real units kept verbatim (first ` +
    `${UNIT_SAMPLE_PER_DOC}/document) for the index-ratio and promote-cost arms`;
  writeFileSync(join(PEN, "reach.json"), JSON.stringify({ reach, stopped, sampled,
    keys: keys.length, listRequests: reqs, elapsed_s: Math.round((Date.now() - t0) / 1000),
    bytes_streamed: bytes, documents_extracted: done }, null, 2));
  process.stdout.write(`\nreach: ${JSON.stringify(reach, null, 2)}\n`);
  if (stopped) process.stdout.write(`\nBUDGET: ${stopped}\n`);
  process.stdout.write(`\n${n(done)} documents extracted, ${(bytes / 1e9).toFixed(2)} GB streamed, ` +
    `${Math.round((Date.now() - t0) / 1000)}s\nFOOT text\n`);
}

/* ------------------------------------------------------------------ *
 * mode `derive` — every figure, from the log, with no network
 * ------------------------------------------------------------------ */
async function readLog(path) {
  if (!existsSync(path)) {
    process.stderr.write(`REFUSED — no log at ${path}. Run \`text\` first. ` +
      `Nothing is derived from an absent corpus.\n`);
    process.exit(1);
  }
  /* LAST record per key wins, so a re-walk of one half (`text --append`)
     supersedes the earlier pass rather than being counted twice. The dedupe is
     reported, never silent: a corpus that shrank between the file and the
     figures is exactly the thing a reader must be told about. */
  const seen = new Map();
  let lines = 0;
  const rl = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    lines++;
    const r = JSON.parse(line);
    seen.set(r.key, r);
  }
  if (lines !== seen.size)
    process.stdout.write(`log: ${n(lines)} records, ${n(seen.size)} distinct documents ` +
      `(${n(lines - seen.size)} superseded by a later re-walk of the same key)\n`);
  return [...seen.values()];
}

function deriveFigures(rows, { quiet = false } = {}) {
  const say = (s) => { if (!quiet) process.stdout.write(s + "\n"); };
  const ok = rows.filter((r) => !r.error);
  const failed = rows.filter((r) => r.error);

  /* THE CORPUS IS PRINTED BEFORE ANY FIGURE, always. */
  say(`corpus read: ${n(rows.length)} documents (${n(ok.length)} extracted, ` +
      `${n(failed.length)} failed/unreadable)`);
  const byExt = new Map();
  for (const r of ok) byExt.set(r.ext, (byExt.get(r.ext) || 0) + 1);
  say(`by extension: ${[...byExt].sort((a, b) => b[1] - a[1])
      .map(([e, c]) => `${e || "(none)"}=${n(c)}`).join(", ")}`);

  const pdf = ok.filter((r) => r.format === "pdf");
  const docx = ok.filter((r) => r.format === "docx");
  const pptx = ok.filter((r) => r.format === "pptx");
  const xlsx = ok.filter((r) => r.format === "xlsx");

  const out = { corpus: { rows: rows.length, ok: ok.length, failed: failed.length } };

  /* --- 1a · text bytes per captured PAGE ------------------------------- */
  const pageBytes = pdf.flatMap((r) => r.units || []);
  const pagesWithText = pageBytes.filter((b) => b > 0);
  out.perPage = stats("pdf-page unit (every page, blank included)", pageBytes);
  out.perPageNonEmpty = stats("pdf-page unit (pages that recovered any text)", pagesWithText);
  say("\n### text bytes per captured PAGE (UTF-8 bytes of the unit's text)\n");
  say(HEAD);
  say(row(out.perPage));
  say(row(out.perPageNonEmpty));
  say(`\npages that recovered NO text at all: ${n(pageBytes.length - pagesWithText.length)} of ` +
      `${n(pageBytes.length)} (${(100 * (pageBytes.length - pagesWithText.length) /
        Math.max(1, pageBytes.length)).toFixed(1)}%) — scans and image-only pages, ` +
      `OCR territory, indexed as nothing rather than as empty`);

  /* --- 1a′ · text bytes per UNIT, EVERY unit kind ----------------------
     §4.3's PER-UNIT bound binds every kind, not only the page, so a table that
     measured only `pdf-page` would set a cap from a third of the evidence. */
  say("\n### text bytes per INDEXED UNIT, by kind — what §4.3's per-unit bound has to cover\n");
  say(HEAD);
  const perUnitBytes = {};
  for (const [label, set] of [["pdf-page", pdf], ["doc-para", docx],
                              ["slide (§4.1 asks slide-shape)", pptx]]) {
    try {
      perUnitBytes[label] = stats(`${label} unit bytes`, set.flatMap((r) => r.units || []));
      say(row(perUnitBytes[label]));
    } catch (e) { say(`| ${label} unit bytes | ${e.message} |`); }
  }
  out.perUnitBytes = perUnitBytes;
  const allUnits = [...pdf, ...docx, ...pptx].flatMap((r) => r.units || []);
  const maxUnit = floorOrRefuse("every indexed unit in the corpus", allUnits)
    .reduce((a, b) => Math.max(a, b), 0);
  out.maxUnitBytes = maxUnit;
  out.allUnitCount = allUnits.length;
  say(`\nlargest single unit anywhere in ${n(allUnits.length)} units: **${n(maxUnit)} B** ` +
      `(${(maxUnit / 1024).toFixed(1)} KiB). The provisional per-unit cap is \`TEXT_CAP\` = ` +
      `131,072 B, which is ${(131072 / Math.max(1, maxUnit)).toFixed(1)}x the largest unit ` +
      `this corpus produced.`);

  /* --- 1b · text bytes per DOCUMENT ------------------------------------ */
  say("\n### text bytes per DOCUMENT, by container\n");
  say(HEAD);
  const perDoc = {};
  for (const [label, set] of [["pdf", pdf], ["docx", docx], ["pptx", pptx], ["xlsx", xlsx]]) {
    try {
      perDoc[label] = stats(`${label} document`, set.map((r) => r.doc_bytes || 0));
      say(row(perDoc[label]));
    } catch (e) { say(`| ${label} document | ${e.message} |`); }
  }
  out.perDoc = perDoc;

  /* --- 1c · units per document, the promote's own N --------------------- */
  say("\n### indexed UNITS per document — the N a promote writes\n");
  say(HEAD);
  const perUnits = {};
  for (const [label, set] of [["pdf-page", pdf], ["doc-para", docx], ["slide (§4.1 asks slide-shape)", pptx]]) {
    try {
      perUnits[label] = stats(`${label} units/document`, set.map((r) => (r.units || []).length));
      say(row(perUnits[label]));
    } catch (e) { say(`| ${label} | ${e.message} |`); }
  }
  out.perUnits = perUnits;
  if (xlsx.length === 0) {
    say(`\nxlsx: NO workbook reached this walk, so this corpus says NOTHING about the ` +
        `workbook gap — it does not say the gap is zero.`);
  } else {
    say(`\nxlsx: ${n(xlsx.length)} workbooks in the corpus and NOT ONE indexable unit between ` +
        `them — SEARCH §4.1 gives a workbook no unit arm until EXTRACTION-BREADTH §3.2's ` +
        `\`sheet-range\` lands. Their text is real ` +
        `(${n(xlsx.reduce((a, r) => a + (r.doc_bytes || 0), 0))} bytes of it, over ` +
        `${n(xlsx.reduce((a, r) => a + (r.unindexable_units || 0), 0))} sheets) and unreachable ` +
        `at content grain. STATED, never scored zero.`);
  }

  /* --- the tier split, because it decides what the index can hold ------- */
  const tiers = new Map();
  for (const r of pdf) tiers.set(r.tier ?? "?", (tiers.get(r.tier ?? "?") || 0) + 1);
  say(`\npdf tier split: ${[...tiers].map(([t, c]) => `tier ${t}: ${n(c)}`).join(", ")}`);
  const reasons = new Map();
  for (const r of ok) for (const u of r.undetermined_reasons || [])
    reasons.set(u, (reasons.get(u) || 0) + 1);
  say(`undetermined reasons across the corpus: ${[...reasons].sort((a, b) => b[1] - a[1])
      .map(([k, c]) => `${k}=${n(c)}`).join(", ") || "(none)"}`);
  const notes = new Map();
  for (const r of ok) if (r.note) notes.set(r.note.slice(0, 60), (notes.get(r.note.slice(0, 60)) || 0) + 1);
  say(`notes: ${[...notes].sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([k, c]) => `"${k}"=${n(c)}`).join(", ") || "(none)"}`);
  out.tiers = Object.fromEntries(tiers);
  out.reasons = Object.fromEntries(reasons);

  /* --- §4.3's per-capture bound: the sensitivity table ------------------ */
  say("\n### §4.3's per-capture bound — what each candidate admits (PDF, the half with no bound)\n");
  const docBytes = floorOrRefuse("pdf document text bytes", pdf.map((r) => r.doc_bytes || 0));
  const sorted = [...docBytes].sort((a, b) => a - b);
  say("| candidate bound | PDFs fully indexed | PDFs indexed to the bound (`partial`) | text bytes admitted |");
  say("| --- | --- | --- | --- |");
  const total = sorted.reduce((a, b) => a + b, 0);
  const cands = [256 * 1024, 512 * 1024, 1024 * 1024, 2 * 1024 * 1024, 4 * 1024 * 1024,
                 8 * 1024 * 1024, 20 * 1024 * 1024];
  out.bound = [];
  for (const c of cands) {
    const full = sorted.filter((b) => b <= c).length;
    const admitted = sorted.reduce((a, b) => a + Math.min(b, c), 0);
    out.bound.push({ bound: c, full, partial: sorted.length - full, admitted, total });
    say(`| ${n(c)} B (${(c / 1024 / 1024).toFixed(2)} MiB) | ${n(full)} / ${n(sorted.length)} ` +
        `(${(100 * full / sorted.length).toFixed(2)}%) | ${n(sorted.length - full)} | ` +
        `${n(admitted)} of ${n(total)} (${(100 * admitted / Math.max(1, total)).toFixed(2)}%) |`);
  }
  out.docTotalBytes = total;
  return out;
}

async function modeDerive() {
  const rows = await readLog(arg("--log", LOG));
  const out = deriveFigures(rows);
  const idx = existsSync(join(PEN, "index.json")) ? JSON.parse(readFileSync(join(PEN, "index.json"), "utf8")) : null;
  if (idx) {
    /* --- 3 · the storage curve, from 1 and 2 -------------------------- */
    const r = idx.totalRatio;
    process.stdout.write(`\n### the storage curve (§5 item 3) — 1 x 2\n\n`);
    const perDocPdf = out.perDoc.pdf?.mean ?? 0;
    process.stdout.write(
      `marginal cost today (D-190, \`op=stats\` -> dbBytes): 176,657 B per bundle, which puts ` +
      `the vendor's 10 GB per object at ~60,800 bundles.\n` +
      `the content index adds text x (1 + index ratio) per document: ` +
      `${n(Math.round(perDocPdf))} B mean PDF text x ${r.toFixed(3)} = ` +
      `**${n(Math.round(perDocPdf * r))} B per indexed PDF**, ` +
      `${(100 * perDocPdf * r / 176657).toFixed(1)}% on top of the existing per-bundle cost.\n` +
      `at that rate 10 GB holds ~${n(Math.round(10e9 / (176657 + perDocPdf * r)))} indexed bundles ` +
      `against ~60,800 unindexed — the numerator is ours, the 10 GB is the vendor's.\n`);
  } else {
    process.stdout.write(`\n(the storage curve needs mode \`index\` to have run — no index.json in the pen)\n`);
  }
  writeFileSync(join(PEN, "derive.json"), JSON.stringify(out, null, 2));
  process.stdout.write("\nFOOT derive\n");
}

/* ------------------------------------------------------------------ *
 * The probe Worker — §4.1's DDL, on workerd, through miniflare
 * ------------------------------------------------------------------ */

/* THE DDL IS QUOTED FROM `CONTENT-SEARCH-DESIGN.md` §4.1 AND THAT IS MARKED
   HERE BECAUSE IT IS THE ONE THING IN THIS FILE THAT IS NOT IMPORTED FROM THE
   PRODUCT. `capture_text` does not exist yet — SEARCH §7 item 4 is the row that
   builds it — so the design is the authority, and when item 4 lands this probe
   must be re-pointed at `schema.mjs` or the figure re-taken. */
const PROBE_WORKER = `
export class Probe {
  constructor(ctx) { this.ctx = ctx; this.sql = ctx.storage.sql; }
  #schema(withFts) {
    // CONTENT-SEARCH-DESIGN.md §4.1, verbatim in shape.
    this.sql.exec(\`CREATE TABLE IF NOT EXISTS capture_text (
      capture_sha TEXT NOT NULL, bundle_id TEXT NOT NULL, extent_kind TEXT NOT NULL,
      extent TEXT NOT NULL, ref TEXT NOT NULL, seq INTEGER NOT NULL, text TEXT NOT NULL,
      truncated INTEGER NOT NULL DEFAULT 0, chain_kind TEXT NOT NULL,
      PRIMARY KEY (capture_sha, extent_kind, extent))\`);
    this.sql.exec("CREATE INDEX IF NOT EXISTS capture_text_bundle ON capture_text(bundle_id)");
    if (withFts) {
      this.sql.exec("CREATE VIRTUAL TABLE IF NOT EXISTS capture_text_fts USING fts5(" +
        "text, content='capture_text', content_rowid='rowid', tokenize='unicode61')");
    }
  }
  async fetch(req) {
    const body = await req.json();
    const op = body.op;
    if (op === "schema") { this.#schema(body.withFts !== false); return json({ ok: true, size: Number(this.sql.databaseSize) }); }
    if (op === "size") return json({ size: Number(this.sql.databaseSize) });
    if (op === "burn") {
      let x = 1; const it = body.iterations;
      for (let i = 0; i < it; i++) x = (x * 1103515245 + 12345) % 2147483647;
      return json({ x });
    }
    if (op === "insert") {
      // The PROMOTE shape: the capture's previous units are deleted first (§4.1),
      // then every unit is written inside ONE transaction, then the FTS rows.
      const units = body.units, sha = body.sha, withFts = body.withFts !== false;
      /* ONE transaction, the way a promote writes — and through
         \`transactionSync\`, not a typed BEGIN/COMMIT: workerd's
         \`storage.sql.exec\` refuses transaction-control statements, and
         \`store.mjs\` uses \`transactionSync\` at every one of its own write
         seams. */
      this.ctx.storage.transactionSync(() => {
        this.sql.exec("DELETE FROM capture_text WHERE capture_sha = ?", sha);
        for (let i = 0; i < units.length; i++) {
          this.sql.exec(
            "INSERT INTO capture_text (capture_sha, bundle_id, extent_kind, extent, ref, seq, text, truncated, chain_kind)" +
            " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            sha, body.bundle, body.kind, JSON.stringify({ page: i }), "p." + i, i, units[i], 0, "layer");
        }
        if (withFts) {
          this.sql.exec("INSERT INTO capture_text_fts(rowid, text) " +
            "SELECT rowid, text FROM capture_text WHERE capture_sha = ?", sha);
        }
      });
      return json({ ok: true, size: Number(this.sql.databaseSize), n: units.length });
    }
    if (op === "noop") return json({ ok: true });
    return json({ ok: false, op });
  }
}
const json = (o) => new Response(JSON.stringify(o), { headers: { "content-type": "application/json" } });
export default {
  async fetch(req, env) {
    const id = env.PROBE.idFromName(new URL(req.url).searchParams.get("id") || "a");
    return env.PROBE.get(id).fetch(req);
  },
};
`;

async function withProbe(fn) {
  mkdirSync(PEN, { recursive: true });
  const scriptPath = join(PEN, "probe-worker.mjs");
  writeFileSync(scriptPath, PROBE_WORKER);
  const { Miniflare } = await import(join(REPO, "bio-plane", "node_modules", "miniflare", "dist", "src", "index.js"));
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath, script: PROBE_WORKER,
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { PROBE: { className: "Probe", useSQLite: true } },
  });
  const call = async (id, body) => (await mf.dispatchFetch(`http://x/?id=${id}`,
    { method: "POST", body: JSON.stringify(body) })).json();
  try { return await fn(call); }
  finally { await mf.dispose(); await new Promise((r) => setTimeout(r, 300)); }
}

/* ------------------------------------------------------------------ *
 * mode `index` — index bytes per text byte, on workerd's SQLite
 * ------------------------------------------------------------------ */
async function modeIndex() {
  /* The text is the CORPUS's text, never generated: an FTS5 index's size is a
     function of the token distribution, and synthetic text has the wrong one.
     Every unit below came out of a real Oakland document through the plane's
     own extractor, and `text` mode kept it verbatim in the sample log. */
  const want = Number(arg("--units", "4000"));
  const units = [];
  const samplePath = join(PEN, "unit-text-sample.jsonl");
  if (!existsSync(samplePath)) {
    process.stderr.write(`REFUSED — no unit-text sample at ${samplePath}. ` +
      `The index ratio is measured over REAL corpus text or not at all: an FTS5 ` +
      `index's size is a function of the token distribution, and generated text ` +
      `has the wrong one.\n`);
    process.exit(1);
  }
  const rl = createInterface({ input: createReadStream(samplePath), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const u = JSON.parse(line);
    if (typeof u.text === "string" && u.text.length) units.push(u);
    if (units.length >= want) break;
  }
  floorOrRefuse("indexable units with real text", units, 1);

  const textBytes = units.reduce((a, u) => a + B(u.text), 0);
  process.stdout.write(`corpus for the ratio: ${n(units.length)} real units, ` +
    `${n(textBytes)} UTF-8 text bytes, from ${n(new Set(units.map((u) => u.key)).size)} documents\n`);

  /* THE SAME TEXT AT A COARSER GRAIN, so the per-ROW fixed cost is visible rather
     than folded into a ratio that would then read as scale-free. `capture_text`
     carries a 64-char sha, a canonical-JSON extent, a ref and a chain kind on
     EVERY row, so a ratio taken over 55-byte units and a ratio taken over 2 KB
     units are different numbers about the same table. The third arm indexes the
     identical bytes as ONE unit per document — the grain SEARCH §3 option (ii)
     would have had — and the difference between arms 2 and 3 is what the unit
     grain costs. */
  const coarseMap = new Map();
  for (const u of units) coarseMap.set(u.key, (coarseMap.get(u.key) ?? "") + (coarseMap.has(u.key) ? "\n" : "") + u.text);
  const coarse = [...coarseMap].map(([key, text]) => ({ key, text }));

  const out = await withProbe(async (call) => {
    const res = {};
    /* Three objects, so each cost is ISOLATED rather than inferred: one holds
       `capture_text` alone, one holds it plus the external-content FTS5 index,
       and the third holds both at document grain. All are fed the same bytes. */
    for (const [label, withFts, set] of [["base", false, units], ["fts", true, units],
                                         ["coarse", true, coarse]]) {
      const id = `m031-${label}`;
      const empty = (await call(id, { op: "schema", withFts })).size;
      let i = 0;
      const batch = 50;
      for (let s = 0; s < set.length; s += batch) {
        const chunk = set.slice(s, s + batch);
        await call(id, { op: "insert", sha: `sha${(i++).toString().padStart(60, "0")}`,
          bundle: `b${i}`, kind: "pdf-page", withFts, units: chunk.map((u) => u.text) });
      }
      /* `databaseSize` as workerd reports it, with NO compaction step before the
         read — a DO cannot run one. `PRAGMA wal_checkpoint` and `PRAGMA
         page_size` are both refused inside a Durable Object (`not authorized:
         SQLITE_AUTH`, measured by this item), so the figure is the object's
         size as the runtime states it, free pages included. That is the same
         surface D-190's 176,657 B/bundle was read off, which is what makes the
         two comparable. */
      const after = (await call(id, { op: "size" })).size;
      res[label] = { empty, after, delta: after - empty };
      process.stdout.write(`  ${label}: empty=${n(empty)} B, after=${n(after)} B, ` +
        `delta=${n(after - empty)} B\n`);
    }
    return res;
  });

  const baseDelta = out.base.delta, ftsDelta = out.fts.delta, coarseDelta = out.coarse.delta;
  const indexOnly = ftsDelta - baseDelta;
  const figures = {
    units: units.length, textBytes, documents: coarse.length,
    meanUnitBytes: textBytes / units.length,
    emptySchemaBytes: out.base.empty, emptySchemaWithFtsBytes: out.fts.empty,
    baseTableDelta: baseDelta, bothDelta: ftsDelta, ftsIndexOnly: indexOnly,
    coarseDelta,
    baseRatio: baseDelta / textBytes,
    ftsRatio: indexOnly / textBytes,
    totalRatio: ftsDelta / textBytes,
    coarseRatio: coarseDelta / textBytes,
    grainCost: (ftsDelta - coarseDelta) / units.length,
    bytesPerUnit: ftsDelta / units.length,
  };
  process.stdout.write(
    `\n### index bytes per text byte, workerd SQLite (miniflare ^4.20260722.0), FTS5 external-content\n\n` +
    `| what | bytes | per text byte |\n| --- | --- | --- |\n` +
    `| the units' own text (UTF-8) | ${n(textBytes)} | 1.000 |\n` +
    `| \`capture_text\` base table alone, unit grain | ${n(baseDelta)} | ${figures.baseRatio.toFixed(3)} |\n` +
    `| \`capture_text_fts\` index ALONE (the difference) | ${n(indexOnly)} | ${figures.ftsRatio.toFixed(3)} |\n` +
    `| **both, unit grain — the stored cost of indexing a text byte** | **${n(ftsDelta)}** | ` +
    `**${figures.totalRatio.toFixed(3)}** |\n` +
    `| both, DOCUMENT grain (same bytes, ${n(coarse.length)} rows) | ${n(coarseDelta)} | ` +
    `${figures.coarseRatio.toFixed(3)} |\n\n` +
    `empty schema on a fresh object: ${n(out.base.empty)} B (base only), ` +
    `${n(out.fts.empty)} B (with the FTS index)\n` +
    `mean unit: ${n(Math.round(figures.meanUnitBytes))} text bytes; stored cost ` +
    `${n(Math.round(figures.bytesPerUnit))} B/unit\n` +
    `WHAT THE UNIT GRAIN COSTS: ${n(Math.round(figures.grainCost))} B per unit over indexing ` +
    `the same bytes at document grain — the per-row price of a hit being an ADDRESS (§4.5) ` +
    `rather than a document.\n` +
    `THE RATIO IS NOT SCALE-FREE and must not be read as if it were: every row carries a ` +
    `64-char sha, a canonical-JSON extent, a ref and a chain kind whatever its text weighs, ` +
    `so a corpus of smaller units has a larger ratio. The mean unit above is the handle.\n`);
  writeFileSync(join(PEN, "index.json"), JSON.stringify(figures, null, 2));
  process.stdout.write("\nFOOT index\n");
}

/* ------------------------------------------------------------------ *
 * mode `cpu` — promote-time cost per indexed unit
 * ------------------------------------------------------------------ */
async function modeCpu() {
  const samplePath = join(PEN, "unit-text-sample.jsonl");
  if (!existsSync(samplePath)) {
    process.stderr.write(`REFUSED — no unit-text sample at ${samplePath}; ` +
      `promote cost is measured over real units or not at all.\n`);
    process.exit(1);
  }
  const want = Number(arg("--units", "2000"));
  const units = [];
  const rl = createInterface({ input: createReadStream(samplePath), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line.trim()) continue;
    const u = JSON.parse(line);
    if (typeof u.text === "string" && u.text.length) units.push(u);
    if (units.length >= want) break;
  }
  floorOrRefuse("units for the promote-cost arm", units, 1);

  const out = await withProbe(async (call) => {
    /* THE CLOCK IS THE HOST'S, NEVER THE WORKER'S. A Worker cannot time its own
       compute (`cpu.mjs`'s header; the FL-1 fabrication gate refuses a self-timed
       reading), so every millisecond below is measured OUTSIDE workerd around a
       dispatch, and the round-trip floor is measured and subtracted. */
    const id = "m031-cpu";
    await call(id, { op: "schema", withFts: true });

    const timed = async (body, reps) => {
      const ts = [];
      for (let i = 0; i < reps; i++) {
        const t = process.hrtime.bigint();
        await call(id, body);
        ts.push(Number(process.hrtime.bigint() - t) / 1e6);
      }
      ts.sort((a, b) => a - b);
      return ts[Math.floor(ts.length / 2)];
    };

    const noop = await timed({ op: "noop" }, 25);

    /* CALIBRATION into the ceiling's own currency. `cpu.mjs`'s `burn()` is the
       reference iteration `op=cpuprobe` walked the enforced ceiling in (40M fit,
       killed during the next 2M, 2026-07-29), so the promote's cost is reported
       in those iterations as well as in milliseconds. The burn runs INSIDE
       workerd here, which is one better than CONTENT-PDF's node proxy. */
    const cal = [];
    for (const it of [5e6, 10e6, 20e6]) {
      const ms = await timed({ op: "burn", iterations: it }, 5) - noop;
      cal.push({ iterations: it, ms, iterPerMs: it / ms });
    }
    const iterPerMs = cal.reduce((a, c) => a + c.iterPerMs, 0) / cal.length;

    /* THE SAME BURN IN NODE, on this machine, right now — because the only
       published calibration of this currency (CONTENT-PDF, 2026-08-03:
       26,036 iter/ms) was a NODE proxy, and quoting a workerd figure against it
       without measuring both would be comparing two runtimes through one number.
       `burn()` is imported from `cpu.mjs`, never retyped. */
    const { burn } = await import("../bio-plane/src/cpu.mjs");
    burn(5e6);                                   // warm the JIT, as the workerd side is warmed
    const nodeCal = [];
    for (const it of [5e6, 10e6, 20e6]) {
      const ms = [];
      for (let r = 0; r < 5; r++) {
        const t = process.hrtime.bigint();
        burn(it);
        ms.push(Number(process.hrtime.bigint() - t) / 1e6);
      }
      ms.sort((a, b) => a - b);
      nodeCal.push({ iterations: it, ms: ms[2] });
    }
    const nodeIterPerMs = nodeCal.reduce((a, c) => a + c.iterations / c.ms, 0) / nodeCal.length;

    /* THE LADDER GOES PAST §4.1's WORKED EXAMPLE ON PURPOSE. §4.1 reasons about
       "a promote that writes four hundred units"; the corpus's own worst docx
       carries 20,571 paragraphs, so 400 is not the case that decides whether the
       write must be chunked across ticks (§5 item 4's actual question). The
       ladder runs to the largest N the sample can fill. */
    const perN = [];
    for (const N of [10, 50, 100, 400, 2000, 8000, 20000]) {
      if (units.length < N) continue;
      const chunk = units.slice(0, N).map((u) => u.text);
      const bytes = chunk.reduce((a, t) => a + B(t), 0);
      const ms = await timed({ op: "insert", sha: "c".repeat(64), bundle: "b1",
        kind: "pdf-page", withFts: true, units: chunk }, N >= 8000 ? 3 : 7) - noop;
      perN.push({ N, bytes, ms, msPerUnit: ms / N, iterPerUnit: (ms / N) * iterPerMs });
    }
    /* THE COST IS NOT ONE NUMBER PER UNIT AND THE LADDER ABOVE SAYS SO OUT LOUD:
       ms/unit FALLS from 10 units to 2,000 and then RISES at 8,000 — not because
       a row got dearer but because the sample's later units are PDF pages
       (~1 KB) where its early ones are OOXML first-paragraphs (~90 B). So the
       two components are separated by a two-point fit over the two LARGEST
       rungs, where the fixed cost is smallest relative to the total and the
       measurement is least noisy. A two-point fit is stated as one: it is a
       decomposition of three measurements, not a regression over many. */
    let fit = null;
    if (perN.length >= 2) {
      const [p, q] = perN.slice(-2);
      const det = p.N * q.bytes - q.N * p.bytes;
      if (det !== 0) {
        const perByte = (p.N * q.ms - q.N * p.ms) / det;
        const perRow = (p.ms - perByte * p.bytes) / p.N;
        fit = { from: [p.N, q.N], msPerRow: perRow, msPerByte: perByte,
                ceilingMs: 40e6 / iterPerMs };
      }
    }
    return { noop, cal, iterPerMs, nodeCal, nodeIterPerMs, perN, fit };
  });

  process.stdout.write(
    `\n### promote-time cost per indexed unit — host clock, workerd execution\n\n` +
    `dispatch round-trip floor (subtracted from every figure below): ` +
    `${out.noop.toFixed(3)} ms\n` +
    `calibration, \`burn()\` run INSIDE workerd: ` +
    `${out.cal.map((c) => `${n(c.iterations)} iter = ${c.ms.toFixed(1)} ms`).join("; ")} ` +
    `— **${n(Math.round(out.iterPerMs))} reference iterations/ms**\n\n` +
    `| units in one promote | text bytes | ms | ms/unit | ref-iter/unit | % of the measured ` +
    `per-invocation ceiling (40M iter) |\n| --- | --- | --- | --- | --- | --- |\n` +
    out.perN.map((p) => `| ${n(p.N)} | ${n(p.bytes)} | ${p.ms.toFixed(1)} | ` +
      `${p.msPerUnit.toFixed(3)} | ${n(Math.round(p.iterPerUnit))} | ` +
      `${(100 * p.iterPerUnit / 40e6).toFixed(4)}% |`).join("\n") + "\n");
  const biggest = out.perN[out.perN.length - 1];
  const at400 = out.perN.find((p) => p.N === 400) ?? biggest;
  process.stdout.write(
    `\na 400-unit promote — SEARCH §4.1's own worked example — costs ` +
    `${(400 * at400.iterPerUnit / 1e6).toFixed(2)}M reference iterations, ` +
    `${(100 * 400 * at400.iterPerUnit / 40e6).toFixed(2)}% of the measured ` +
    `per-invocation kill window (40M iterations fit, killed during the next 2M, ` +
    `op=cpuprobe 2026-07-29).\n` +
    `the LARGEST promote measured here — ${n(biggest.N)} units — costs ` +
    `${(biggest.N * biggest.iterPerUnit / 1e6).toFixed(2)}M, ` +
    `${(100 * biggest.N * biggest.iterPerUnit / 40e6).toFixed(2)}% of that window. ` +
    `The corpus's worst single document carries far more units than §4.1's example, ` +
    `so this row and not the 400 row is the one §5 item 4's chunking question turns on.\n`);
  if (out.fit) {
    const f = out.fit, worst = (rows, bytes) => f.msPerRow * rows + f.msPerByte * bytes;
    const pct = (rows, bytes) => (100 * worst(rows, bytes) / f.ceilingMs).toFixed(1);
    process.stdout.write(
      `\n### the two components, separated — what §5 item 4 actually asks\n\n` +
      `A promote's cost is a FIXED per-row part plus a per-BYTE part, and the ladder ` +
      `above conflates them because the sample's later units are larger. Two-point fit ` +
      `over the ${n(f.from[0])} and ${n(f.from[1])} rungs:\n\n` +
      `    ms = ${f.msPerRow.toFixed(5)} x units  +  ${(f.msPerByte * 1024).toFixed(4)} x KiB of text\n\n` +
      `The measured per-invocation window is 40M reference iterations, which at this ` +
      `run's workerd rate is **${f.ceilingMs.toFixed(0)} ms** of single-thread work. ` +
      `Against it, the corpus's own worst promotes:\n\n` +
      `| the promote | units | text bytes | predicted ms | % of the window |\n` +
      `| --- | --- | --- | --- | --- |\n` +
      `| §4.1's worked example | 400 | 400 KB | ${worst(400, 400e3).toFixed(0)} | ${pct(400, 400e3)}% |\n` +
      `| the corpus's worst docx (\`doc-para\`) | 20,571 | 1,187,253 | ` +
      `${worst(20571, 1187253).toFixed(0)} | ${pct(20571, 1187253)}% |\n` +
      `| the corpus's worst PDF (\`pdf-page\`) | 1,181 | 1,354,686 | ` +
      `${worst(1181, 1354686).toFixed(0)} | ${pct(1181, 1354686)}% |\n` +
      `| a document at a 2 MiB per-capture bound, page grain | 1,000 | 2,097,152 | ` +
      `${worst(1000, 2097152).toFixed(0)} | ${pct(1000, 2097152)}% |\n\n` +
      `THE LARGEST PROMOTE THAT FITS, at this corpus's mean unit size: ` +
      `**${n(Math.floor(f.ceilingMs / (f.msPerRow + f.msPerByte * 1123)))} units** ` +
      `(1,123 B mean). Beyond it §4.1's own remedy applies — the write is chunked ` +
      `across ticks the way \`capture_sessions\` already resumes.\n`);
  }
  process.stdout.write(
    `\nTHE CALIBRATION DISAGREES WITH THE ONLY PUBLISHED ONE AND THAT IS REPORTED, NOT ` +
    `SMOOTHED. \`burn()\` on THIS machine, same process, same minute: ` +
    `**${n(Math.round(out.nodeIterPerMs))} iter/ms in node**, ` +
    `**${n(Math.round(out.iterPerMs))} iter/ms inside workerd** ` +
    `(${(out.iterPerMs / out.nodeIterPerMs).toFixed(2)}x). CONTENT-PDF recorded 26,036 ` +
    `iter/ms as a node proxy on 2026-08-03. The conversion is therefore a CPU-ORDER figure, ` +
    `and the workerd rate is the one used above because the work being converted runs in ` +
    `workerd. It is also the CONSERVATIVE choice: the faster the reference loop is judged to ` +
    `be, the MORE reference iterations a given millisecond of promote is scored as costing. ` +
    `At CONTENT-PDF's 26,036 the same 400-unit promote reads ` +
    `${(100 * 400 * biggest.msPerUnit * 26036 / 40e6).toFixed(3)}% of the ceiling instead.\n`);
  writeFileSync(join(PEN, "cpu.json"), JSON.stringify(out, null, 2));
  process.stdout.write("\nFOOT cpu\n");
}

/* ------------------------------------------------------------------ *
 * mode `control` — the NEGATIVE CONTROL, every arm declared before it arms
 * ------------------------------------------------------------------ */
async function modeControl() {
  let pass = 0, fail = 0;
  const arm = (name, declared, fn) => {
    let actual;
    try { actual = fn(); } catch (e) { actual = e instanceof EmptyCorpus ? "REFUSED" : `THREW:${e.message}`; }
    const okk = actual === declared;
    process.stdout.write(`| ${name} | ${declared} | ${actual} | ${okk ? "PASS" : "**FAIL**"} |\n`);
    okk ? pass++ : fail++;
    return okk;
  };
  process.stdout.write("### NEGATIVE CONTROL — `m031-index-measure.mjs control`\n\n" +
    "| arm | declared | actual | |\n| --- | --- | --- | --- |\n");

  const realRow = (bytes) => ({ key: "k", ext: "pdf", format: "pdf", tier: 1,
    unit_kind: "pdf-page", units: bytes, doc_bytes: bytes.reduce((a, b) => a + b, 0) });

  /* 1 · THE EMPTY-CORPUS REFUSAL, the arm this item exists to prove. */
  arm("EMPTY corpus (0 documents) -> every headline figure", "REFUSED",
      () => { deriveFigures([], { quiet: true }); return "PRINTED A FIGURE"; });

  /* 2 · A corpus of documents that all failed to extract is still EMPTY of
         units, and a bytes-per-page figure over it would be zeros. */
  arm("corpus of 3 documents, all FETCH_FAILED -> per-page figure", "REFUSED",
      () => { deriveFigures([{ key: "a", error: "FETCH_FAILED" }, { key: "b", error: "FETCH_FAILED" },
        { key: "c", error: "FETCH_FAILED" }], { quiet: true }); return "PRINTED A FIGURE"; });

  /* 3 · OVER-STRICTNESS: a corpus of ONE measures, and says n=1. The refusal
         must not be a blanket "small is suspicious". */
  arm("corpus of ONE document with one page -> measures and says n=1", "n=1",
      () => { const o = deriveFigures([realRow([1234])], { quiet: true });
              return `n=${o.perPage.n}`; });

  /* 4 · OVER-STRICTNESS: a legitimately EMPTY page among real ones is a DATUM
         (a scanned page recovered no text), not an empty corpus. */
  arm("one 0-byte page among 3 real ones -> measured, n=4, not refused", "n=4",
      () => { const o = deriveFigures([realRow([900, 0, 1200, 850])], { quiet: true });
              return `n=${o.perPage.n}`; });

  /* 5 · The floor is on the UNIT count, not on the byte total: a corpus whose
         every page is empty has units and measures 0 mean, which is a true
         statement about a scanned corpus rather than a false headline. */
  arm("3 pages, ALL 0 bytes -> measures, mean 0, and the non-empty arm REFUSES", "REFUSED",
      () => { const o = deriveFigures([realRow([0, 0, 0])], { quiet: true }); return `mean=${o.perPage.mean}`; });

  /* 6 · `needsTier2` here is a COPY of `index.mjs:2545` and this arm is the only
         thing standing between that copy and silent drift. */
  const src = readFileSync(join(REPO, "bio-plane", "src", "index.mjs"), "utf8");
  const shipped = /function needsTier2\(text\) \{([\s\S]*?)\n\}/.exec(src);
  const norm = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim();
  arm("the copied `needsTier2` still matches `index.mjs`'s, comment-stripped", "MATCH",
      () => norm(shipped[1]) === norm(/function needsTier2\(text\) \{([\s\S]*?)\n\}/
        .exec(readFileSync(fileURLToPath(import.meta.url), "utf8"))[1]) ? "MATCH" : "DRIFTED");

  /* 7 · BASELINE. Without it, six-arms-broken and six-arms-working read alike. */
  arm("BASELINE: a real 3-document corpus prints its figures", "n=3",
      () => { const o = deriveFigures([realRow([900, 800]), realRow([1200]), realRow([400, 500, 600])],
                { quiet: true }); return `n=${o.perDoc.pdf.n}`; });

  process.stdout.write(`\n${pass} pass, ${fail} fail, ${REFUSALS} refusals fired\n`);
  process.stdout.write("FOOT control\n");
  process.exit(fail ? 1 : 0);
}

/* ------------------------------------------------------------------ */
const MODE = process.argv[2];
try {
  if (MODE === "text") await modeText();
  else if (MODE === "derive") await modeDerive();
  else if (MODE === "index") await modeIndex();
  else if (MODE === "cpu") await modeCpu();
  else if (MODE === "control") await modeControl();
  else {
    process.stderr.write(readFileSync(fileURLToPath(import.meta.url), "utf8")
      .split("\n").slice(0, 56).join("\n") + "\n");
    process.exit(1);
  }
} catch (e) {
  if (e instanceof EmptyCorpus) { process.stderr.write(e.message + "\n"); process.exit(1); }
  throw e;
}
