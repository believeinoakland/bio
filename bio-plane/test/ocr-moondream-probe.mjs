#!/usr/bin/env node
/* CPDF-11 instrument, half 2 of 2: is Moondream 3.1 on Workers AI a usable
 * IN-ACCOUNT OCR path? (MEASUREMENTS.md 2026-08-04, DEC-35)
 *
 * A PROBE, not in the battery — it is deliberately NOT named `*.test.mjs`, which
 * is the battery runner's whole discovery rule (`scripts/battery.mjs`: readdir
 * + endsWith(".test.mjs")), so it is not discovered and needs no skip marker.
 * It commits no product code and it changes nothing in the repo.
 *
 * IT MEASURES THE SAME PAGE, WITH THE SAME GROUND TRUTH, THROUGH THE SAME
 * ARITHMETIC as the local-tesseract floor in CPDF-9 — and it does not COPY any
 * of that, it READS it out of `ocr-measure-probe.mjs` at run time. A copied
 * ground truth is a ground truth that drifts, and two OCR numbers derived from
 * drifted machinery are not comparable no matter how alike they look. If that
 * file's scoring expressions ever change, this probe STOPS instead of quietly
 * reporting a number nobody can line up against the floor.
 *
 * The floor it is measured against (MEASUREMENTS.md 2026-08-03, local
 * tesseract, eng tessdata_fast): 99.96% character accuracy, 90/90 ground-truth
 * digits, ZERO minted digits, blank page yields "".
 *
 * WHAT IT RUNS, in the item's own order:
 *   (a) ACCURACY — page 2 of the ground-truthed exhibit transcribed N times
 *       (default 3: a generative model is not deterministic and the run-to-run
 *       spread is itself a property of the path), scored for character
 *       accuracy, ground-truth digits and MINTED digits.
 *   (b) COORDINATES, VERIFIED — not "the model returns boxes", but "the boxes
 *       land on the text they were returned for". Each returned box is CROPPED
 *       out of the page and read by the LOCAL TESSERACT the floor was measured
 *       with; that referee, not the model, says whether the box aligns. Two
 *       target classes (a literal text string, and layout blocks) plus a target
 *       that IS NOT ON THE PAGE, because a localiser that always answers has
 *       told you nothing. The referee check carries its own negative control:
 *       the same boxes displaced down the page must FAIL it.
 *   (c) THE BLANK AND NOISE CONTROLS, weighted heavily. Any non-empty
 *       transcription of a page with no text on it is a FAILURE OF THE PATH,
 *       and this probe EXITS NON-ZERO on one.
 *   (d) THE SIX-RUNG LEGIBILITY LADDER — the same page at 300, 150, 75, 75+blur,
 *       37.5+blur dpi-equivalent and finally with its contrast collapsed into a
 *       16-level band around mid-grey. Every rung is asked with the SAME prompt,
 *       which offers a one-word refusal, and every rung is run N times, because
 *       "it refused" and "it refuses reliably" are different claims and only the
 *       second one can license structured self-refusal (DEC-35).
 *
 * FORBIDDEN AND NOT DONE (DEC-35): the model is never asked how confident it
 * is, and no self-reported number is thresholded anywhere. The refusal the
 * ladder scores is a REFUSAL — a stated inability to read — not a score.
 *
 * HOW IT REACHES THE MODEL. Through a scratch Worker carrying the `AI` binding
 * (see `ocr-moondream-worker.mjs` for why the REST route is not usable with the
 * project token, and why the binding is the production shape anyway). The
 * worker is uploaded under a scratch slug, used, and DELETED — pass --keep to
 * leave it up. Nothing else in the account is touched.
 *
 * PREREQUISITES: python3 with pypdf and Pillow (page images, the ladder and the
 * crops — a probe is not product code and may use whatever renders locally);
 * network; and `.env` carrying CF_TOKEN/CF_ACCT for the pinned project account,
 * which is asserted before anything is uploaded.
 *
 * Run:  node test/ocr-moondream-probe.mjs [--runs N] [--keep]
 */
import { execFileSync, execSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, statSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const argv = process.argv.slice(2);
const RUNS = Number((argv[argv.indexOf("--runs") + 1] && argv.includes("--runs")) ? argv[argv.indexOf("--runs") + 1] : 3);
const KEEP = argv.includes("--keep");

const MODEL = "@cf/moondream/moondream3.1-9B-A2B";
const PINNED_ACCOUNT = "20b533579290b9b93168345edd3b7f72";
const SLUG = "bio-ocrprobe";
const UA = "CivicOS/0.55.0 (+https://github.com/believeinoakland/bio; instance biosmoke7; acquire)";
const DOC_URL = "https://oakland.legistar.com/View.ashx?M=F&ID=15721260&GUID=8F04A287-4A49-44DC-83B7-29FAD97140C2";

/* The one prompt, used at EVERY rung and on both controls. It offers a refusal
   and asks for nothing else. Changing it changes every number below, so it is
   named once and interpolated nowhere else. */
const OCR_PROMPT =
  "Transcribe every word of text in this image exactly as printed, preserving the original " +
  "wording, spelling, punctuation and numbers. Output only the transcription and nothing else. " +
  "If the image contains no legible text, output exactly: ILLEGIBLE";
const REFUSAL = "ILLEGIBLE";

const median = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const pct = (x) => (x * 100).toFixed(2) + "%";

/* ---------------------------------------------------------------------------
 * 0. THE ACCOUNT. Asserted before a byte is uploaded (CLAUDE.md: a deploy to
 *    the wrong account SUCCEEDS and nobody notices).
 * ------------------------------------------------------------------------ */
if (!existsSync(join(REPO, ".env"))) { console.error("no .env at the repo root"); process.exit(2); }
const ENV = Object.fromEntries(readFileSync(join(REPO, ".env"), "utf8")
  .split("\n").filter((l) => l.includes("=") && !l.trimStart().startsWith("#"))
  .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]));
const ACCT = ENV.CF_ACCT, TOKEN = ENV.CF_TOKEN;
if (!ACCT || !TOKEN) { console.error("CF_ACCT / CF_TOKEN not in .env"); process.exit(2); }
if (ACCT !== PINNED_ACCOUNT) {
  console.error(`STOP: CF_ACCT is not the pinned project account. Refusing to upload anything.`);
  process.exit(3);
}
console.log(`account: pinned project account confirmed (${PINNED_ACCOUNT})`);

/* ---------------------------------------------------------------------------
 * 1. THE GROUND TRUTH AND THE ARITHMETIC, READ OUT OF THE CPDF-9 INSTRUMENT.
 *    Not copied. If the shapes below are no longer found there, the two
 *    measurements are no longer comparable and this stops rather than guessing.
 * ------------------------------------------------------------------------ */
const FLOOR_SRC = readFileSync(join(HERE, "ocr-measure-probe.mjs"), "utf8");
const grab = (re, what) => {
  const m = re.exec(FLOOR_SRC);
  if (!m) {
    console.error(`STOP: ocr-measure-probe.mjs no longer contains ${what}.`);
    console.error("The floor and this probe would stop being comparable, which is the only");
    console.error("reason this probe reads that file instead of holding its own copy.");
    process.exit(4);
  }
  return m[1];
};
const GT_PAGE2 = grab(/const GT_PAGE2 = `([\s\S]*?)`;/, "the GT_PAGE2 ground truth");
const NORM_SRC = grab(/(const norm = \(s\) =>[\s\S]*?;\n)/, "the norm() normaliser");
const LEV_SRC = grab(/(function levenshteinPairs\(a, b\) \{[\s\S]*?\n\})/, "levenshteinPairs()");
/* The four metric expressions, asserted LITERALLY present in the floor's own
   score() before they are used here. This is the line-for-line guarantee. */
const METRIC_EXPRS = [
  "(1 - dist / gt.length) * 100",
  "pairs.filter(([g]) => g && /[0-9]/.test(g)).length",
  "pairs.filter(([g, o]) => g && /[0-9]/.test(g) && g !== o).length",
  "pairs.filter(([g, o]) => o && /[0-9]/.test(o) && (!g || !/[0-9]/.test(g))).length",
];
for (const e of METRIC_EXPRS) {
  if (!FLOOR_SRC.includes(e)) {
    console.error(`STOP: the floor's scoring expression ${JSON.stringify(e)} is gone from ocr-measure-probe.mjs.`);
    process.exit(4);
  }
}
const { norm, levenshteinPairs } = await import(
  "data:text/javascript," + encodeURIComponent(`${NORM_SRC}\n${LEV_SRC}\nexport { norm, levenshteinPairs };`));
console.log(`ground truth: read from ocr-measure-probe.mjs — ${norm(GT_PAGE2).length} normalised chars, ` +
  `all four floor metric expressions present`);

/** The floor's four numbers, computed with the floor's own expressions. */
function stats(gtRaw, ocrRaw) {
  const gt = norm(gtRaw), ocr = norm(ocrRaw);
  const { dist, pairs } = levenshteinPairs(gt, ocr);
  const digTotal = pairs.filter(([g]) => g && /[0-9]/.test(g)).length;
  const digErr = pairs.filter(([g, o]) => g && /[0-9]/.test(g) && g !== o).length;
  const minted = pairs.filter(([g, o]) => o && /[0-9]/.test(o) && (!g || !/[0-9]/.test(g))).length;
  const errs = pairs.filter(([g, o]) => g !== o);
  return {
    gtLen: gt.length, ocrLen: ocr.length, dist,
    charAcc: (1 - dist / gt.length) * 100,
    digTotal, digErr, digAcc: digTotal ? (1 - digErr / digTotal) * 100 : 0, minted,
    errs,
  };
}

/* ---------------------------------------------------------------------------
 * 2. PREREQUISITES AND THE IMAGES.
 * ------------------------------------------------------------------------ */
try { execFileSync("python3", ["-c", "import pypdf, PIL"], { stdio: "pipe" }); }
catch {
  console.error("PREREQUISITE MISSING: python3 with pypdf and Pillow (page images, the ladder, the crops).");
  process.exit(2);
}

const work = mkdtempSync(join(tmpdir(), "cpdf11-moondream-"));
console.log("workdir:", work);

const pdf = join(work, "legistar-attach-15721260.pdf");
{
  const r = await fetch(DOC_URL, { headers: { "user-agent": UA } });
  if (!r.ok) { console.error(`exhibit fetch: HTTP ${r.status}`); process.exit(1); }
  writeFileSync(pdf, Buffer.from(await r.arrayBuffer()));
}
console.log(`exhibit: legistar-attach-15721260.pdf ${statSync(pdf).size.toLocaleString()} B`);

/* Page extraction is CPDF-9's recipe unchanged (including the /Rotate 270
   correction), so the pixels this model sees are the pixels tesseract saw.
   Everything after `# --- CPDF-11 additions` is this item's: the two controls
   and the six ladder rungs. A rung degrades and then RESTORES the original
   pixel dimensions, so every rung is the same number of pixels and only the
   information content changes — otherwise "smaller image" and "less legible"
   would be confounded. */
execFileSync("python3", ["-c", `
import sys
from pypdf import PdfReader
from PIL import Image, ImageFilter
import random
r = PdfReader(sys.argv[1]); out = sys.argv[2]
assert all((p.extract_text() or "").strip()=="" and not (p.get("/Resources",{}) or {}).get("/Font") for p in r.pages), "not image-only any more"
for i,p in enumerate(r.pages):
    for img in p.images:
        im = img.image
        im = im.convert("L" if im.mode=="1" else im.mode)
        im.rotate(90, expand=True).save(f"{out}/page{i}.png")  # /Rotate 270

# --- CPDF-11 additions ---------------------------------------------------
page = Image.open(f"{out}/page1.png")          # PDF page 2 = the ground-truthed page
W,H = page.size
print("PAGESIZE", W, H)

# the two controls, at the ground-truthed page's own dimensions
Image.new("L",(W,H),255).save(f"{out}/control-blank.png")
random.seed(11)
noise = Image.new("L",(W,H))
noise.putdata([random.randint(0,255) for _ in range(W*H)])
noise.save(f"{out}/control-noise.png")

def rung(name, scale, blur=0.0, band=None):
    im = page.resize((max(1,int(W*scale)), max(1,int(H*scale))), Image.LANCZOS)
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    im = im.resize((W,H), Image.BICUBIC)
    if band:
        lo,hi = band
        im = im.point(lambda v: lo + (v*(hi-lo))//255)
    im.save(f"{out}/{name}.png")

rung("rung0", 1.0)                       # 300 dpi, the original
rung("rung1", 0.5)                       # 150 dpi equivalent
rung("rung2", 0.25)                      # 75 dpi equivalent
rung("rung3", 0.25, blur=2.0)            # 75 dpi + gaussian blur 2.0
rung("rung4", 0.125, blur=3.0)           # 37.5 dpi + gaussian blur 3.0
# A SECOND AXIS, deliberately not a rung: ink and paper pushed into 16 adjacent
# grey levels. It is off the ladder because it is not MORE degraded than R4 —
# it is degraded DIFFERENTLY, and the first run of this probe showed why that
# distinction has to be in the instrument rather than in the reading: numbering
# it R5 implied a monotone ordering the measurement then contradicted.
rung("contrast", 0.25, band=(120,136))
`, pdf, work], { stdio: ["ignore", "inherit", "inherit"] });

const PAGE = join(work, "page1.png");
const dataUri = (p) => "data:image/png;base64," + readFileSync(p).toString("base64");
console.log(`page images extracted (image-only re-verified: 0 fonts, no text layer); ` +
  `ground-truthed page ${statSync(PAGE).size.toLocaleString()} B PNG`);

/* ---------------------------------------------------------------------------
 * 3. THE SCRATCH WORKER.
 * ------------------------------------------------------------------------ */
const api = `https://api.cloudflare.com/client/v4/accounts/${ACCT}/workers/scripts/${SLUG}`;
const H = { authorization: `Bearer ${TOKEN}` };
const PROBE_TOKEN = randomBytes(16).toString("hex");
{
  const meta = {
    main_module: "index.mjs",
    compatibility_date: "2026-07-01",
    bindings: [
      { type: "ai", name: "AI" },
      { type: "plain_text", name: "PROBE_TOKEN", text: PROBE_TOKEN },
    ],
  };
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", new Blob([readFileSync(join(HERE, "ocr-moondream-worker.mjs"), "utf8")],
    { type: "application/javascript+module" }), "index.mjs");
  const r = await fetch(api, { method: "PUT", headers: H, body: fd });
  const j = await r.json().catch(() => null);
  console.log(`scratch worker upload: HTTP ${r.status} success=${j && j.success}` +
    (j && !j.success ? " " + JSON.stringify(j.errors).slice(0, 300) : ""));
  if (!j || !j.success) process.exit(1);
  await fetch(api + "/subdomain", {
    method: "POST", headers: { ...H, "content-type": "application/json" },
    body: JSON.stringify({ enabled: true, previews_enabled: false }),
  });
}
const sub = await (async () => {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCT}/workers/subdomain`, { headers: H });
  const j = await r.json();
  return j && j.result && j.result.subdomain;
})();
const URLBASE = `https://${SLUG}.${sub}.workers.dev`;
console.log("scratch worker:", URLBASE);

async function teardown() {
  if (KEEP) { console.log(`\nscratch worker LEFT UP at ${URLBASE} (--keep)`); return; }
  const r = await fetch(api, { method: "DELETE", headers: H });
  console.log(`\nscratch worker deleted: HTTP ${r.status}`);
}

/* D-108's lesson at a smaller scale: the upload landing is not the new build
   serving. The first run of this probe died with "rejected the probe token"
   because the PREVIOUS isolate — carrying the previous run's random gate — was
   still answering seconds after a successful PUT. So nothing is measured until
   an isolate carrying THIS run's gate has answered a ping. */
async function waitReady() {
  const t0 = Date.now();
  for (let i = 1; i <= 30; i++) {
    try {
      const res = await fetch(URLBASE, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: PROBE_TOKEN, ping: true }),
      });
      const j = JSON.parse(await res.text());
      if (j && j.ok && j.run === "function") {
        console.log(`scratch worker ready after ${Math.round((Date.now() - t0) / 1000)}s ` +
          `(${i} ping${i === 1 ? "" : "s"}); env.AI binding present`);
        return;
      }
    } catch { /* mid-rollout a request can simply fail; that is not an answer either */ }
    await new Promise((s) => setTimeout(s, 3000));
  }
  console.error("scratch worker never answered a ping with this run's gate — refusing to measure.");
  await teardown();
  process.exit(1);
}
await waitReady();

let NEURONS = 0, IN_TOK = 0, OUT_TOK = 0, CALLS = 0;
async function ai(input, { tries = 4 } = {}) {
  for (let i = 1; i <= tries; i++) {
    let res;
    try {
      res = await fetch(URLBASE, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: PROBE_TOKEN, model: MODEL, input }),
      });
    } catch { await new Promise((s) => setTimeout(s, 4000)); continue; }
    const text = await res.text();
    let j = null; try { j = JSON.parse(text); } catch { /* mid-rollout HTML */ }
    if (!j) { await new Promise((s) => setTimeout(s, 4000)); continue; }
    if (j.ok === false && /unauthorized/.test(j.error || "")) { console.error("scratch worker rejected the probe token"); await teardown(); process.exit(1); }
    if (j.ok && j.out && j.out.usage) {
      CALLS++; NEURONS += j.out.usage.neurons || 0;
      IN_TOK += j.out.usage.prompt_tokens || 0; OUT_TOK += j.out.usage.completion_tokens || 0;
    }
    if (j.ok || i === tries) return j;
    await new Promise((s) => setTimeout(s, 3000 * i));
  }
  return { ok: false, error: "no answer" };
}

/* Every OCR ask goes through here, so the parameters cannot drift between a
   rung and a control. `stream:false` is not optional: the default is true and a
   streamed answer is a ReadableStream (and `detect` rejects streaming outright
   — the error only becomes visible once the stream is drained). `reasoning` is
   off because the reasoning trace is not the transcription and DEC-35 forbids
   treating the model's account of itself as evidence. */
const transcribe = (imgPath) => ai({
  task: "query", image: dataUri(imgPath), question: OCR_PROMPT,
  stream: false, reasoning: false, max_tokens: 8192,
});
const answerOf = (j) => (j && j.ok && j.out && j.out.result && typeof j.out.result.answer === "string") ? j.out.result.answer : null;

const detect = (imgPath, target) => ai({
  task: "detect", image: dataUri(imgPath), target, stream: false, max_objects: 50,
});
const objectsOf = (j) => (j && j.ok && j.out && j.out.result && Array.isArray(j.out.result.objects)) ? j.out.result.objects : null;

/* ---------------------------------------------------------------------------
 * 4. THE REFEREE — the local tesseract the floor was measured with. It is what
 *    says whether a box aligns; the model does not get to grade its own boxes.
 * ------------------------------------------------------------------------ */
console.log("\ninstalling the referee (tesseract.js 7.0.0, into the temp dir — nothing is added to the repo)…");
execSync("npm init -y >/dev/null 2>&1 && npm install --no-audit --no-fund tesseract.js@7.0.0 >/dev/null 2>&1",
  { cwd: work, shell: "/bin/sh" });
const { createWorker } = await import(join(work, "node_modules/tesseract.js/src/index.js"));
execSync(`mkdir -p '${join(work, "cache")}'`, { shell: "/bin/sh" });
const referee = await createWorker("eng", 1, { cachePath: join(work, "cache") });
const refereeRead = async (p) => norm((await referee.recognize(p)).data.text);

/** Crop a normalised box out of the page, with a little padding. */
function crop(box, name, pad = 0.004) {
  const out = join(work, `crop-${name}.png`);
  execFileSync("python3", ["-c", `
from PIL import Image
import sys
im = Image.open(sys.argv[1]); W,H = im.size
x0,y0,x1,y1,pad = [float(v) for v in sys.argv[3:8]]
b = (max(0,int((x0-pad)*W)), max(0,int((y0-pad)*H)), min(W,int((x1+pad)*W)), min(H,int((y1+pad)*H)))
if b[2]<=b[0] or b[3]<=b[1]: raise SystemExit("degenerate box")
im.crop(b).save(sys.argv[2])
print(*b)
`, PAGE, out, String(box.x_min), String(box.y_min), String(box.x_max), String(box.y_max), String(pad)],
    { stdio: ["ignore", "pipe", "pipe"] });
  return out;
}

/** Longest common substring length and its offset in `a`. */
function lcs(a, b) {
  const n = a.length, m = b.length;
  let prev = new Int32Array(m + 1), cur = new Int32Array(m + 1), best = 0, at = -1;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : 0;
      if (cur[j] > best) { best = cur[j]; at = i - best; }
    }
    [prev, cur] = [cur, prev]; cur.fill(0);
  }
  return { len: best, at };
}

/* ---------------------------------------------------------------------------
 * (a) ACCURACY on the ground-truthed page.
 * ------------------------------------------------------------------------ */
console.log(`\n=== (a) ACCURACY — PDF page 2, ${RUNS} runs, scored against CPDF-9's ground truth ===`);
const accRuns = [];
for (let r = 0; r < RUNS; r++) {
  const j = await transcribe(PAGE);
  const a = answerOf(j);
  if (a === null) { console.log(`  run ${r + 1}: NO ANSWER ${JSON.stringify(j).slice(0, 300)}`); continue; }
  const s = stats(GT_PAGE2, a);
  accRuns.push({ ms: j.ms, text: a, ...s });
  console.log(`  run ${r + 1}: ${j.ms} ms; ${s.ocrLen} chars out; edits ${s.dist}; ` +
    `char accuracy ${s.charAcc.toFixed(2)}%; GT digits ${s.digTotal - s.digErr}/${s.digTotal} (${s.digAcc.toFixed(2)}%); ` +
    `digits MINTED ${s.minted}`);
}
if (accRuns.length) {
  const uniq = new Set(accRuns.map((r) => norm(r.text))).size;
  console.log(`  median char accuracy ${median(accRuns.map((r) => r.charAcc)).toFixed(2)}%; ` +
    `median latency ${median(accRuns.map((r) => r.ms))} ms; ` +
    `DISTINCT transcriptions across ${accRuns.length} runs: ${uniq}` +
    (uniq > 1 ? "  <-- the same page does not transcribe to the same text twice" : ""));
  const worst = accRuns.reduce((a, b) => (a.charAcc <= b.charAcc ? a : b));
  console.log(`  worst run's char errors (gt->ocr): ${JSON.stringify(worst.errs).slice(0, 1200)}`);
  const mintedRuns = accRuns.filter((r) => r.minted > 0);
  console.log(`  runs minting at least one digit: ${mintedRuns.length}/${accRuns.length}`);
}

/* ---------------------------------------------------------------------------
 * (b) COORDINATES — verified by the referee, never assumed.
 * ------------------------------------------------------------------------ */
console.log(`\n=== (b) COORDINATES — every box cropped and read by the local tesseract referee ===`);
const coordRows = [];
/* Three strings that ARE on the page and one that is NOT. The absent one is the
   whole point: a localiser that answers regardless has localised nothing. */
const TEXT_TARGETS = [
  { t: "$21,180,436.10", present: true },
  { t: "$26,181,434.00", present: true },
  { t: "Notice of Exemption", present: true },
  { t: "$99,999,999.99", present: false },
];
/* Each target is asked RUNS times, because the first run of this probe returned
   1 box for a target and the second returned 4, and one of the four checks
   flipped from "no" to "ALIGNS" between runs. A localiser measured once has not
   been measured. */
for (const { t, present } of TEXT_TARGETS) {
  let boxes = 0, checked = 0, aligned = 0, empty = 0; const seen = [];
  for (let r = 0; r < RUNS; r++) {
    const objs = objectsOf(await detect(PAGE, t));
    if (!objs) { seen.push(`run ${r + 1}: NO OBJECTS FIELD`); continue; }
    boxes += objs.length;
    if (objs.length === 0) { seen.push(`run ${r + 1}: 0 boxes`); continue; }
    for (let i = 0; i < Math.min(objs.length, 8); i++) {
      let read; try { read = await refereeRead(crop(objs[i], `t${coordRows.length}-${r}-${i}`)); } catch { read = ""; }
      checked++;
      if (read === "") empty++;
      const hit = read.toLowerCase().includes(t.toLowerCase());
      if (hit) aligned++;
      seen.push(`run ${r + 1} box ${i}: ${hit ? "ALIGNS" : "no"} ${JSON.stringify(read.slice(0, 70))}`);
    }
  }
  console.log(`  target ${JSON.stringify(t)} (${present ? "on the page" : "NOT on the page"}): ` +
    `${boxes} box(es) over ${RUNS} runs; referee finds the target in ${aligned}/${checked} checked` +
    (empty ? `; ${empty} box(es) too small to contain any readable text` : "") +
    (!present && boxes > 0 ? "  <-- LOCALISED TEXT THAT IS NOT ON THE PAGE" : ""));
  for (const s of seen) console.log(`      ${s}`);
  coordRows.push({ t, present, boxes, checked, aligned });
}

/* Layout blocks: a weaker but fairer ask than a literal string — does the model
   at least box the PARAGRAPHS in the right places? Scored by how much of the
   ground truth the referee recovers from inside each box. */
console.log(`  --- layout blocks, target "paragraph of text" ---`);
const GTN = norm(GT_PAGE2);
/* THE ALIGNMENT CRITERION, and the first run of this probe is why it is not
   just "the referee recovered some ground truth". A box displaced a quarter of
   a page down a page that is dense text top to bottom STILL lands on text, and
   still recovers 40+ characters of the ground truth — 7 of 10 displaced boxes
   "aligned" under that criterion, which means the criterion was measuring the
   page's density and not the box's position. So a box aligns only if the text
   the referee reads out of it is found WHERE THE BOX SAYS IT IS: the recovered
   ground-truth offset must sit within a tolerance of the offset the box's own
   vertical midpoint predicts. That criterion is what the displaced control has
   to fail, and the failure is what licenses believing the aligned count. */
const POS_TOL = 0.10;
function blockCheck(box, read) {
  const { len, at } = lcs(GTN, read);
  const mid = (box.y_min + box.y_max) / 2;
  const want = mid * GTN.length;
  const off = Math.abs(at - want) / GTN.length;
  return { len, at, want: Math.round(want), off, ok: len >= 40 && off <= POS_TOL };
}
let blockAligned = 0, blockObjs = [], offsets = [];
{
  const j = await detect(PAGE, "paragraph of text");
  const objs = objectsOf(j) || [];
  blockObjs = objs;
  for (let i = 0; i < objs.length; i++) {
    let read; try { read = await refereeRead(crop(objs[i], `b${i}`)); } catch { read = ""; }
    const c = blockCheck(objs[i], read);
    if (c.ok) { blockAligned++; offsets.push(c.at); }
    console.log(`      box ${i} y=${objs[i].y_min.toFixed(3)}..${objs[i].y_max.toFixed(3)}: ` +
      `referee ${read.length} chars; longest ground-truth run ${c.len} found @${c.at}, ` +
      `box position predicts @${c.want} (off by ${(c.off * 100).toFixed(1)}% of the page) -> ${c.ok ? "ALIGNS" : "no"}`);
  }
  const monotone = offsets.every((v, i) => i === 0 || v >= offsets[i - 1]);
  console.log(`  layout blocks: ${blockAligned}/${objs.length} align ` +
    `(>=40 chars recovered AND found within ${POS_TOL * 100}% of where the box says); reading order monotone: ${monotone}`);

  /* NEGATIVE CONTROL FOR THE CHECK ITSELF. Displace every box a quarter of a
     page down and re-run the identical criterion. If displaced boxes still
     "align", the criterion is measuring nothing and the count above is worth
     nothing either. */
  let shiftedAligned = 0, shiftedChecked = 0;
  for (let i = 0; i < objs.length; i++) {
    const b = objs[i];
    const y0 = b.y_min + 0.25, y1 = b.y_max + 0.25;
    if (y1 >= 1) continue;
    shiftedChecked++;
    let read; try { read = await refereeRead(crop({ ...b, y_min: y0, y_max: y1 }, `s${i}`)); } catch { read = ""; }
    /* checked against the ORIGINAL box's predicted position — the question is
       whether a wrong crop can pass a check made for the right one */
    if (blockCheck(b, read).ok) shiftedAligned++;
  }
  console.log(`  NEGATIVE CONTROL (the same boxes displaced +0.25 page down, same criterion): ` +
    `${shiftedAligned}/${shiftedChecked} "align" — ${shiftedAligned === 0 ? "the criterion discriminates" : "THE CRITERION DOES NOT DISCRIMINATE; the count above is not evidence"}`);
}

/* --- (b3) THE COMPOSED SHAPE ------------------------------------------------
 * The transcription task returns NO coordinates and the detection task returns
 * NO text, so the only in-account shape that could carry an image-region anchor
 * at all is DETECT-THEN-TRANSCRIBE-THE-CROP. Whether that composition holds up
 * is not answerable from the two halves, so it is probed: the three largest
 * detected blocks are cropped and transcribed, and each is scored against the
 * ground-truth window the referee independently says that crop contains.
 */
console.log(`  --- (b3) composed shape: detect the block, transcribe the crop ---`);
const composed = [];
{
  const byArea = blockObjs
    .map((b, i) => ({ b, i, area: (b.x_max - b.x_min) * (b.y_max - b.y_min) }))
    .sort((p, q) => q.area - p.area).slice(0, 3);
  for (const { b, i } of byArea) {
    const file = crop(b, `c${i}`);
    let read; try { read = await refereeRead(file); } catch { read = ""; }
    const { len, at } = lcs(GTN, read);
    /* The region's ground truth is a WINDOW of the page's ground truth, and the
       referee is what says which window. If the referee's own read of the crop
       is only partly placeable in the ground truth, the window is a guess and a
       score against it would be a number about the window, not about the model.
       The second run of this probe scored a region at 1.58% on a window derived
       from a referee read that was only 47% placeable — unscoreable, not a
       failure, and the difference has to live in the instrument. */
    const placeable = read.length ? len / read.length : 0;
    if (len < 40 || placeable < 0.8) {
      console.log(`      block ${i}: NOT SCORED — the referee's own read of this crop is only ` +
        `${(placeable * 100).toFixed(0)}% placeable in the ground truth, so no trustworthy region ground truth exists`);
      continue;
    }
    const window = GTN.slice(at, at + read.length);
    const a = answerOf(await transcribe(file));
    if (a === null) { console.log(`      block ${i}: no answer`); continue; }
    const s = stats(window, a);
    composed.push({ i, ...s });
    console.log(`      block ${i}: region ground truth ${window.length} chars @${at} ` +
      `(${(placeable * 100).toFixed(0)}% placeable); char accuracy ${s.charAcc.toFixed(2)}%; ` +
      `GT digits ${s.digTotal - s.digErr}/${s.digTotal}; digits MINTED ${s.minted}`);
    console.log(`          model said: ${JSON.stringify(norm(a).slice(0, 120))}`);
  }
}

/* ---------------------------------------------------------------------------
 * (c) THE CONTROLS. Weighted heavily: any text at all is a path failure.
 * ------------------------------------------------------------------------ */
console.log(`\n=== (c) NEGATIVE CONTROLS — blank and noise, ${RUNS} runs each ===`);
let controlFailures = 0;
for (const [name, file] of [["blank white page", "control-blank.png"], ["uniform noise page", "control-noise.png"]]) {
  for (let r = 0; r < RUNS; r++) {
    const j = await transcribe(join(work, file));
    const a = answerOf(j);
    const n = a === null ? null : norm(a);
    const refused = n === "" || n === REFUSAL || n.startsWith(REFUSAL);
    if (!refused) controlFailures++;
    console.log(`  ${name} run ${r + 1}: ${refused ? "PASS (nothing / refusal)" : "FAIL — INVENTED TEXT"} ` +
      `${JSON.stringify((n || "(no answer)").slice(0, 220))}`);
  }
}

/* ---------------------------------------------------------------------------
 * (d) THE SIX-RUNG LEGIBILITY LADDER.
 * ------------------------------------------------------------------------ */
console.log(`\n=== (d) THE SIX-RUNG LEGIBILITY LADDER — ${RUNS} runs per rung, same prompt, refusal offered ===`);
const RUNGS = [
  ["R0", "rung0", "300 dpi, the original page"],
  ["R1", "rung1", "150 dpi equivalent"],
  ["R2", "rung2", "75 dpi equivalent"],
  ["R3", "rung3", "75 dpi + gaussian blur 2.0"],
  ["R4", "rung4", "37.5 dpi + gaussian blur 3.0"],
  ["C1", "contrast", "OFF-LADDER: contrast collapsed to 16 greys"],
];
const ladder = [];
for (const [id, file, desc] of RUNGS) {
  const rows = [];
  for (let r = 0; r < RUNS; r++) {
    const j = await transcribe(join(work, `${file}.png`));
    const a = answerOf(j);
    const n = a === null ? "" : norm(a);
    const refused = n === "" || n === REFUSAL || n.startsWith(REFUSAL);
    const s = refused ? null : stats(GT_PAGE2, a);
    /* The verdict vocabulary is fixed here so nobody has to eyeball it:
       REFUSED  — said it could not read the image, or said nothing
       FAITHFUL — >=95% of the ground truth's characters
       PARTIAL  — 50..95%: degraded, still recognisably the page
       INVENTED — <50% and still produced >=100 characters of confident text */
    const verdict = refused ? "REFUSED"
      : s.charAcc >= 95 ? "FAITHFUL"
        : s.charAcc >= 50 ? "PARTIAL"
          : (s.ocrLen >= 100 ? "INVENTED" : "TRACE");
    rows.push({ verdict, s, text: n });
    console.log(`  ${id} run ${r + 1}: ${verdict}` +
      (s ? ` char ${s.charAcc.toFixed(2)}% digits ${s.digTotal - s.digErr}/${s.digTotal} minted ${s.minted} out ${s.ocrLen} chars` : "") +
      `  ${JSON.stringify(n.slice(0, 110))}`);
  }
  ladder.push({ id, desc, rows });
}

console.log(`\n  RUNG | what it is                                  | REFUSED | verdicts            | median char | GT digits | MINTED`);
for (const { id, desc, rows } of ladder) {
  const refused = rows.filter((r) => r.verdict === "REFUSED").length;
  const scored = rows.filter((r) => r.s);
  const medChar = scored.length ? median(scored.map((r) => r.s.charAcc)).toFixed(2) + "%" : "—";
  const digits = scored.length ? `${median(scored.map((r) => r.s.digTotal - r.s.digErr))}/${scored[0].s.digTotal}` : "—";
  const minted = scored.length ? Math.max(...scored.map((r) => r.s.minted)) : "—";
  console.log(`  ${id.padEnd(4)} | ${desc.padEnd(43)} | ${String(refused + "/" + rows.length).padEnd(7)} | ` +
    `${rows.map((r) => r.verdict).join(",").padEnd(19)} | ${medChar.padEnd(11)} | ${String(digits).padEnd(9)} | ${minted}`);
}

/* ---------------------------------------------------------------------------
 * SUMMARY.
 * ------------------------------------------------------------------------ */
console.log(`\n=== COST (in the account, no credential, no signup) ===`);
console.log(`  ${CALLS} model calls; ${IN_TOK.toLocaleString()} input tokens, ${OUT_TOK.toLocaleString()} output tokens; ` +
  `${NEURONS.toFixed(0)} neurons`);
console.log(`  vendor-stated price for this model: $0.30 / M input tokens, $1.00 / M output tokens ` +
  `(retrieved 2026-08-04) -> this whole run ~$${((IN_TOK * 0.30 + OUT_TOK * 1.00) / 1e6).toFixed(4)}`);

await referee.terminate();
await teardown();

if (controlFailures > 0) {
  console.error(`\nPATH FAILURE: ${controlFailures} blank/noise control run(s) produced text. ` +
    `An engine that transcribes a page with no text on it is the failure mode that puts invented text in the record.`);
  process.exitCode = 1;
}
console.log("\ndone. workdir left for inspection:", work);
