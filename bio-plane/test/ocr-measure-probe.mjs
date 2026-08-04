/* CPDF-9 instrument: is OCR reachable at all? (MEASUREMENTS.md 2026-08-03)
 *
 * A PROBE, not in the battery. It:
 *   1. npm-installs tesseract.js@7.0.0 and tesseract-wasm@0.11.0 into an OS
 *      temp dir (nothing is added to the repo or any package.json), and
 *      downloads eng traineddata variants; measures every artifact raw+gzip-9;
 *   2. fetches the REAL scanned Oakland exhibit (Legistar attachment 15721260,
 *      a 4-page image-only scanned City Council resolution — CPDF-5's doc 14),
 *      extracts its page images via python3+pypdf+Pillow (prerequisite: both
 *      importable; the probe says so and stops if not);
 *   3. runs tesseract.js OCR per page (5-run warm medians + init cost) — a
 *      NODE PROXY, not Worker CPU (a Worker cannot time itself, D-56) — and
 *      calibrates against the plane's own reference iteration (cpu.mjs burn())
 *      run on the same machine, so the cost is expressible in the enforced
 *      ceiling's own currency (op=cpuprobe measured 40M iterations fit on Free);
 *   4. scores page 2 against the embedded human-verified ground truth
 *      (transcribed 2026-08-03 from the 300-dpi scan, digits adjudicated by
 *      zooming the image), characters and DIGITS separately;
 *   5. NEGATIVE CONTROL: OCRs a blank white page of the same dimensions and
 *      requires empty output — an engine that hallucinates on a blank page is
 *      the failure mode that would put invented text in the record;
 *   6. with --provenance, samples recent Oakland Legistar attachments via the
 *      Legistar web API and reports how often /Producer //Creator names
 *      scanner or OCR software (the text-layer-provenance detection).
 *
 * Run:  node test/ocr-measure-probe.mjs [--provenance]
 */
import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, statSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { burn } from "../src/cpu.mjs";

const UA = "CivicOS/0.55.0 (+https://github.com/believeinoakland/bio; instance biosmoke7; acquire)";
const DOC_URL = "https://oakland.legistar.com/View.ashx?M=F&ID=15721260&GUID=8F04A287-4A49-44DC-83B7-29FAD97140C2";
const median = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];

// Ground truth for PDF page 2 (0-based image index 1; CCITT G4, 300 dpi),
// human-transcribed from the scan itself, digit strings verified at 2x zoom.
const GT_PAGE2 = `any one transaction which exceeds $50,000, and the award to the lowest responsible and responsive bidder of award is made; and
WHEREAS, on March 20, 2026, the City issued an advertisement inviting construction bids for the Project on iSupplier, the Bids/Contracts webpage of the City's website, and in various local newspapers; and
WHEREAS, on April 30, 2026, after a competitive bidding process, the City Clerk received three bids for the Project; and
WHEREAS, the bids remain valid for award at the time of Council action pursuant to the bid documents on file with the Capital Contracts Division of Oakland Public Works; and
WHEREAS, the bids were as follows: Bay Cities Paving and Grading, Inc. ($21,180,436.10); McGuire and Hester ($20,881,650.00); and A&B Construction ($26,181,434.00); and
WHEREAS, McGuire and Hester is deemed the lowest responsible and responsive bidder for the Project with a bid of $20,881,650.00, and said bid is compliant with the City's Equal Benefits Ordinance (EBO) and meets the Federal Disadvantaged Business Enterprise (DBE) participation requirements; and
WHEREAS, the City received a bid protest from Bay Cities Paving and Grading, Inc. concerning the identification of local trucking and suppliers, and after review by the Oakland Public Works Capital Contracts Division, the protest was denied and the bid evaluation upheld; and
WHEREAS, the City Council finds and determines based on the representations set forth in the City Administrator's report accompanying this Resolution that the construction contract approved hereunder is temporary in nature; and
WHEREAS, the City Council finds and determines that the performance of this contract shall not result in the loss of employment or salary by any person having permanent status in the competitive service; and
WHEREAS, the City Council finds and determines that the City lacks the equipment and qualified personnel to perform the necessary work, that the performance of this contract is in the public interest because of economy or better performance and that this contract is of a professional, scientific or technical nature; and
WHEREAS, the Project is exempt from California Environmental Quality Act (CEQA) pursuant to CEQA Guidelines Sections 21080.25(b) (Pedestrian and Bicycle), 15301(c) (Existing Facilities, Highways and Streets), 15302(c) (Replacement or Reconstruction), 15303(d) (Small Structures), and 15304(h) (minor alterations to land); each of the above exemptions provides a separate and independent basis for CEQA compliance, and the City filed a Notice of Exemption with Alameda County and the Office of Planning and Research's State Clearing House on March 8, 2024; and
2`;

const norm = (s) =>
  s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim();

function levenshteinPairs(a, b) {
  const n = a.length, m = b.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0));
  const pairs = [];
  let i = n, j = m;
  while (i || j) {
    if (i && j && dp[i][j] === dp[i - 1][j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)) { pairs.push([a[--i], b[--j]]); }
    else if (i && dp[i][j] === dp[i - 1][j] + 1) { pairs.push([a[--i], null]); }
    else { pairs.push([null, b[--j]]); }
  }
  return { dist: dp[n][m], pairs: pairs.reverse() };
}

function score(label, gtRaw, ocrRaw) {
  const gt = norm(gtRaw), ocr = norm(ocrRaw);
  const { dist, pairs } = levenshteinPairs(gt, ocr);
  const errs = pairs.filter(([g, o]) => g !== o);
  const digTotal = pairs.filter(([g]) => g && /[0-9]/.test(g)).length;
  const digErr = pairs.filter(([g, o]) => g && /[0-9]/.test(g) && g !== o).length;
  const minted = pairs.filter(([g, o]) => o && /[0-9]/.test(o) && (!g || !/[0-9]/.test(g))).length;
  console.log(`  [${label}] GT ${gt.length} chars; edits ${dist}; char accuracy ${((1 - dist / gt.length) * 100).toFixed(2)}%`);
  console.log(`  [${label}] GT digit chars ${digTotal}; digit errors ${digErr} (${((1 - digErr / digTotal) * 100).toFixed(2)}%); digits MINTED by OCR ${minted}`);
  console.log(`  [${label}] all char errors (gt->ocr): ${JSON.stringify(errs)}`);
}

const work = mkdtempSync(join(tmpdir(), "cpdf9-ocr-"));
console.log("workdir:", work);

// -- prerequisites ----------------------------------------------------------
try {
  execFileSync("python3", ["-c", "import pypdf, PIL"], { stdio: "pipe" });
} catch {
  console.error("PREREQUISITE MISSING: python3 with pypdf and Pillow (used only to extract+rotate the scanned page images). Install and re-run.");
  process.exit(1);
}

// -- 1. engines + artifact sizes -------------------------------------------
execSync("npm init -y >/dev/null 2>&1 && npm install --no-audit --no-fund tesseract.js@7.0.0 tesseract-wasm@0.11.0 >/dev/null 2>&1", { cwd: work, shell: "/bin/sh" });
const fetchTo = async (url, out) => {
  const r = await fetch(url, { headers: { "user-agent": UA } });
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  writeFileSync(out, Buffer.from(await r.arrayBuffer()));
};
await fetchTo("https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/eng.traineddata", join(work, "eng-fast.traineddata"));
const sz = (p) => {
  const raw = statSync(p).size;
  return { raw, gz: gzipSync(readFileSync(p), { level: 9 }).length };
};
console.log("\nARTIFACT SIZES (raw / gzip-9 bytes):");
for (const f of [
  "node_modules/tesseract-wasm/dist/tesseract-core.wasm",
  "node_modules/tesseract-wasm/dist/tesseract-core-fallback.wasm",
  "node_modules/tesseract-wasm/dist/lib.js",
  "node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm",
  "eng-fast.traineddata",
]) {
  const { raw, gz } = sz(join(work, f));
  console.log(`  ${f}: ${raw.toLocaleString()} / ${gz.toLocaleString()}`);
}

// -- 2. the named document --------------------------------------------------
const pdf = join(work, "legistar-attach-15721260.pdf");
await fetchTo(DOC_URL, pdf);
console.log(`\nfetched legistar-attach-15721260.pdf: ${statSync(pdf).size.toLocaleString()} B`);
execFileSync("python3", ["-c", `
import sys
from pypdf import PdfReader
from PIL import Image
r = PdfReader(sys.argv[1]); out = sys.argv[2]
assert all((p.extract_text() or "").strip()=="" and not (p.get("/Resources",{}) or {}).get("/Font") for p in r.pages), "not image-only any more"
for i,p in enumerate(r.pages):
    for img in p.images:
        im = img.image
        im = im.convert("L" if im.mode=="1" else im.mode)
        im.rotate(90, expand=True).save(f"{out}/page{i}.png")  # /Rotate 270
Image.new("L",(3300,2550),255).save(f"{out}/blank.png")
`, pdf, work]);
console.log("pages extracted (image-only re-verified: 0 fonts, no text layer), upright, + blank control page");

// -- 3. calibration + OCR ---------------------------------------------------
burn(2_000_000);
const cal = [];
for (let r = 0; r < 5; r++) { const t = performance.now(); burn(40_000_000); cal.push(performance.now() - t); }
const calMs = median(cal);
const iterPerMs = 40_000_000 / calMs;
console.log(`\nCALIBRATION: 40,000,000 reference iterations (cpu.mjs burn) = ${calMs.toFixed(0)} ms on this machine (${Math.round(iterPerMs).toLocaleString()} iter/ms)`);

const { createWorker } = await import(join(work, "node_modules/tesseract.js/src/index.js"));
// cachePath keeps tesseract.js's traineddata cache in the temp dir — without it
// the library writes eng.traineddata into the CWD (found the hard way). Each
// model gets its OWN cache dir: the cache key is just "eng.traineddata", so a
// shared dir silently serves model A's bytes to model B's run (also found the
// hard way — the two models reported identical output).
for (const [label, opts] of [
  ["eng 4.0.0_best_int (tesseract.js default, oem=LSTM_ONLY)", { cachePath: join(work, "cache-best") }],
  ["eng tessdata_fast (the only Worker-shippable variant)", { langPath: join(work, "fastdir"), gzip: false, cachePath: join(work, "cache-fast") }],
]) {
  execSync(`mkdir -p '${opts.cachePath}'`, { shell: "/bin/sh" });
  if (opts.langPath) {
    execSync(`mkdir -p '${opts.langPath}' && cp '${work}/eng-fast.traineddata' '${opts.langPath}/eng.traineddata'`, { shell: "/bin/sh" });
  }
  const t0 = performance.now();
  const worker = await createWorker("eng", 1, opts);
  console.log(`\nMODEL ${label}: init ${(performance.now() - t0).toFixed(0)} ms`);
  for (let i = 0; i < 4; i++) {
    const times = []; let text = "", conf = 0;
    for (let r = 0; r < 5; r++) {
      const s = performance.now();
      const { data } = await worker.recognize(join(work, `page${i}.png`));
      times.push(performance.now() - s); text = data.text; conf = data.confidence;
    }
    const ms = median(times);
    console.log(`  page${i + 1}: median ${ms.toFixed(0)} ms warm (~${(ms * iterPerMs / 1e6).toFixed(1)}M ref-iter equivalent), chars=${text.length}, tesseract-confidence=${conf}`);
    if (i === 1) score(label, GT_PAGE2, text);
  }
  const { data: blank } = await worker.recognize(join(work, "blank.png"));
  const ok = norm(blank.text) === "";
  console.log(`  NEGATIVE CONTROL blank 3300x2550: text=${JSON.stringify(blank.text)} confidence=${blank.confidence} -> ${ok ? "PASS (yields nothing)" : "FAIL (invented text on a blank page)"}`);
  if (!ok) process.exitCode = 1;
  await worker.terminate();
}

// -- 4. provenance sampling (--provenance) ----------------------------------
if (process.argv.includes("--provenance")) {
  console.log("\nTEXT-LAYER PROVENANCE over recent Legistar attachments:");
  const scanner = /(scan|ocr|paper\s*capture|abbyy|finereader|omnipage|readiris|kofax|xerox|workcentre|ricoh|canon|konica|minolta|bizhub|sharp|toshiba|e-?studio|kyocera|taskalfa|lexmark|imagerunner|scansnap|fujitsu|epson|naps2|tesseract)/i;
  const matters = await (await fetch("https://webapi.legistar.com/v1/oakland/matters?%24top=12&%24orderby=MatterLastModifiedUtc%20desc", { headers: { "user-agent": UA } })).json();
  let total = 0, named = 0;
  for (const m of matters) {
    if (total >= 14) break;
    const atts = await (await fetch(`https://webapi.legistar.com/v1/oakland/matters/${m.MatterId}/attachments`, { headers: { "user-agent": UA } })).json();
    for (const a of atts) {
      if (total >= 14) break;
      const link = a.MatterAttachmentHyperlink || "";
      if (!/^http/i.test(link)) continue;
      const out = join(work, `att-${total}.pdf`);
      try { await fetchTo(link, out); } catch { continue; }
      if (!readFileSync(out).subarray(0, 4).equals(Buffer.from("%PDF"))) continue;
      const meta = execFileSync("python3", ["-c", `
import sys, json
from pypdf import PdfReader
r = PdfReader(sys.argv[1])
if r.is_encrypted:
    try: r.decrypt("")
    except Exception: pass
md = r.metadata or {}
print(json.dumps({"p": str(md.get("/Producer","")), "c": str(md.get("/Creator",""))}))
`, out]).toString();
      const { p, c } = JSON.parse(meta);
      const hit = scanner.test(p + " " + c);
      total++; if (hit) named++;
      console.log(`  ${m.MatterFile} ${a.MatterAttachmentName}: producer=${JSON.stringify(p)} creator=${JSON.stringify(c)} -> ${hit ? "SCANNER/OCR NAMED" : "-"}`);
    }
  }
  console.log(`  TOTAL ${total}; scanner/OCR software named: ${named}`);
}
console.log("\ndone. workdir left for inspection:", work);
