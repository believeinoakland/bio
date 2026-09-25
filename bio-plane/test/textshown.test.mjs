/* textshown.test.mjs — D-585: WHETHER A PAGE BEARS TEXT IS ONE QUESTION, ASKED ONE WAY, BY BOTH ITS ASKERS.
 *
 * THE DEFECT, MEASURED (M-157, then M-160). `0201-cafr-2002` is 175 scanned pages. 161 of them carry, beside
 * the scan image, a font dictionary and a second content stream that is exactly `BT\n\nET\n` — a text object
 * opened and closed with NOTHING SHOWN. Two predicates read that page, and both read it wrong, independently:
 *   - Tier 1's `no_text_layer` marker (`bio-plane/src/pdfstructure.mjs`) required "no font declared", so the
 *     page was not marked, and the record held it as ZERO CHARACTERS OF TEXT — read, and empty — not UNREAD;
 *   - the OCR member's renderer (`pdf-worker/src/pagepixels.mjs`, `analyzePage`) counted a bare `BT` as
 *     text, so even a marked page of this shape was refused `PAGE_HAS_TEXT_LAYER`.
 * The fix is one exported predicate, `pageShowsText`, over the four text-SHOWING operators (ISO 32000-1
 * §9.4.3: Tj, TJ, ', "), which BOTH now call. `pagepixels.mjs` already imported `pdfstructure.mjs` (both
 * bundles take it), so there is one spelling, not two pinned equal — and section 3 pins that anyway,
 * behaviourally, over every fixture here, so a second spelling growing back in either file goes red.
 *
 * THE FIXTURE IS THE REAL PAGE'S SHAPE, not its bytes: `/Resources << /Font … /XObject … >>`, `/Contents` an
 * ARRAY of two streams, `q … cm /Im Do Q` and `BT\n\nET\n`, read off CAFR-2002 page 0 (M-160). The image is a
 * 64x64 uncompressed bilevel frame so the renderer can admit it without a codec.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/nc-d585.mjs` — committed; each arm ALONE, declared before it is armed,
 * every restore verified by sha256 AND byte comparison against a per-arm pristine copy in the pen. RUN 2026-09-25
 * against a baseline of 34 pass / 0 fail / foot reached, 6/6 arms as declared: (A) THE ROW'S CONTROL — count a bare
 * `BT` as text again, by adding it to `TEXT_SHOWING_OPERATORS` — 21 pass, 13 fail, BOTH halves by name ("tier 1
 * MARKS the CAFR-shape page…" and "the OCR member's renderer ADMITS the CAFR-shape page…") and all three op arms.
 * (B) the renderer's old `SHOW_TEXT_BLOCK` test joins `hasTextOps` again, tier 1 untouched — 31/3, the renderer's
 * admission and the `shown === true` pin, and NOT tier 1's marker. (C) tier 1's condition back to "no font declared"
 * alone, the renderer untouched — 28/6, tier 1's marker and the op arms, and NOT the renderer. (D1) `null` read as
 * `false` on the form path — 31/3 at the unresolvable-form arms. (D2) the same on the page path — 31/3 at the
 * undecodable-stream arm and tier 1's "UNDETERMINED is not NO". (E) OVER-STRICTNESS: the operator list reordered —
 * 34/0, as declared. **D WAS ONE ARM ON THE FIRST RUN AND DISAGREED**: declared at the undecodable-stream assertion,
 * armed at `unread`, it failed at the FORM arms instead, because that fixture leaves by the early return — a finding
 * about the arm, recorded in the driver at its site and split into D1/D2 rather than smoothed.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { extractPdfStructure, pageShowsText, TEXT_SHOWING_OPERATORS } from "../src/pdfstructure.mjs";
import { loadPdf, analyzePage, renderPageToPixels } from "../../pdf-worker/src/pagepixels.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0, footReached = false;
process.on("exit", () => {
  if (!footReached) console.log(`\ntextshown: ${pass} passed, ${fail + 1} failed — SUITE ENDED BEFORE ITS OWN FOOT`);
});
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ---- fixtures: a real xref, so neither reader is being read by a parser only it could open ---- */
function mk(objs) {
  let pdf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const off = [];
  objs.forEach((b, i) => { off[i] = pdf.length; pdf += `${i + 1} 0 obj\n${b}\nendobj\n`; });
  const x = pdf.length;
  let xr = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < objs.length; i++) xr += `${String(off[i]).padStart(10, "0")} 00000 n \n`;
  pdf += xr + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(pdf, "latin1"));
}
const stream = (s, extra = "") => `<< /Length ${Buffer.byteLength(s, "latin1")}${extra} >>\nstream\n${s}\nendstream`;
const IMAGE = `<< /Type /XObject /Subtype /Image /Width 64 /Height 64 /ColorSpace /DeviceGray /BitsPerComponent 1 /Length 512 >>\nstream\n${"\x00".repeat(512)}\nendstream`;
const FONT = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
const PAINT = "q\n1 0 0 1 0 0 cm\n64 0 0 64 0 0 cm\n/Im24 Do\nQ\n";

/* One page. Objects: 1 catalog, 2 pages, 3 page, 4 paint stream, 5 second stream, 6 image, 7 font, 8+ extra. */
function page({ second, fonts = true, image = true, xobjExtra = "", extra = [], secondRaw = null }) {
  const res = [
    fonts ? "/Font << /F1 7 0 R /F2 7 0 R >>" : "",
    image || xobjExtra ? `/XObject << ${image ? "/Im24 6 0 R" : ""} ${xobjExtra} >>` : "",
  ].join(" ");
  return mk([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 64 64] /Resources << /ProcSet [/PDF /Text /ImageB] ${res} >> /Contents [4 0 R 5 0 R] >>`,
    stream(image ? PAINT : "q Q\n"),
    secondRaw ?? stream(second),
    IMAGE,
    FONT,
    ...extra,
  ]);
}

const F = {
  /* THE CAFR-2002 SHAPE: declared fonts, a scan, and an EMPTY text object. */
  cafr:        page({ second: "BT\n\nET\n" }),
  /* over-strictness: every text-showing operator, in a spelling the old regex did and did not anticipate */
  tj:          page({ second: "BT /F1 12 Tf 10 10 Td (x) Tj ET" }),
  tjTight:     page({ second: "BT /F1 12 Tf 10 10 Td(x)Tj ET" }),
  tjArray:     page({ second: "BT /F1 12 Tf [(a) -120 (b)] TJ ET" }),
  quote:       page({ second: "BT /F1 12 Tf 14 TL (x) ' ET" }),
  dquote:      page({ second: "BT /F1 12 Tf 1 0 (x) \" ET" }),
  /* text drawn through a Form XObject: the page's own streams show nothing, the form does */
  formText:    page({ second: "/Fm1 Do\n", xobjExtra: "/Fm1 8 0 R",
                      extra: [stream("BT /F1 12 Tf (x) Tj ET", " /Type /XObject /Subtype /Form /BBox [0 0 64 64] /Resources << /Font << /F1 7 0 R >> >>")] }),
  formEmpty:   page({ second: "/Fm1 Do\n", xobjExtra: "/Fm1 8 0 R",
                      extra: [stream("BT ET", " /Type /XObject /Subtype /Form /BBox [0 0 64 64]")] }),
  /* an operator-shaped word INSIDE a string is not an operator */
  stringTj:    page({ second: "/Span << /ActualText (a note Tj about the scan) >> BDC BT ET EMC\n" }),
  /* UNDETERMINED: the second stream claims Flate and is not — nobody can say what it shows */
  unreadable:  page({ secondRaw: "<< /Length 8 /Filter /FlateDecode >>\nstream\nnotflate\nendstream" }),
  /* a drawn form that does not resolve — also undetermined */
  formMissing: page({ second: "/Fm9 Do\n" }),
  /* a BLANK page with fonts and an empty text object is not a scan */
  blank:       page({ second: "BT\n\nET\n", image: false }),
  /* no font at all: the structural half, KEPT — marked before this item and still */
  noFont:      page({ second: "BT\n\nET\n", fonts: false }),
};
const firstPageMap = (doc) => doc.dictOf({ t: "ref", n: doc._pageOrder[0] });
const tier1 = async (bytes) => {
  const s = await extractPdfStructure(bytes);
  const p = (s.text?.pages || [])[0] || {};
  return { chars: (p.text || "").length, reasons: (p.undetermined || []).map((m) => m.reason) };
};

console.log("\n--- 1. THE PREDICATE: text is SHOWN, not declared and not opened ---");
t("the text-showing operators are the four ISO 32000-1 §9.4.3 names, and BT is not one of them",
  [...TEXT_SHOWING_OPERATORS].sort(), ["\"", "'", "TJ", "Tj"]);
const WANT = {
  cafr: false, tj: true, tjTight: true, tjArray: true, quote: true, dquote: true,
  formText: true, formEmpty: false, stringTj: false, unreadable: null, formMissing: null, blank: false, noFont: false,
};
const SHOWN = {};
for (const [k, bytes] of Object.entries(F)) {
  const doc = await loadPdf(bytes);
  SHOWN[k] = await pageShowsText(doc, firstPageMap(doc));
}
t("CORPUS: every fixture was read (a walk over nothing agrees with anything)", Object.keys(SHOWN).length, 13);
t("the CAFR-shape page — fonts declared, an empty BT…ET — SHOWS NO TEXT", SHOWN.cafr, false);
for (const k of ["tj", "tjTight", "tjArray", "quote", "dquote"])
  t(`OVER-STRICTNESS: ${k} SHOWS text`, SHOWN[k], true);
t("text shown only inside a drawn Form XObject IS shown", SHOWN.formText, true);
t("a drawn form that shows nothing shows nothing", SHOWN.formEmpty, false);
t("`Tj` inside a string is not an operator", SHOWN.stringTj, false);
t("UNDETERMINED: an undecodable content stream answers null, never false", SHOWN.unreadable, null);
t("UNDETERMINED: a Do naming nothing answers null, never false", SHOWN.formMissing, null);
t("every answer is the one declared", SHOWN, WANT);

console.log("\n--- 2. TIER 1: the CAFR-shape page is UNREAD, not read-and-empty ---");
const T1 = {};
for (const [k, bytes] of Object.entries(F)) T1[k] = await tier1(bytes);
t("tier 1 MARKS the CAFR-shape page no_text_layer (it read zero characters and says it could not read it)",
  T1.cafr, { chars: 0, reasons: ["no_text_layer"] });
t("the no-font page is marked, as it was before this item", T1.noFont.reasons, ["no_text_layer"]);
t("a drawn form that shows nothing: marked", T1.formEmpty.reasons, ["no_text_layer"]);
t("a string holding the letters Tj: marked", T1.stringTj.reasons, ["no_text_layer"]);
t("OVER-STRICTNESS: a page that shows text is NOT marked, whatever tier 1 could decode of it",
  ["tj", "tjTight", "tjArray", "quote", "dquote", "formText"].filter((k) => T1[k].reasons.includes("no_text_layer")), []);
t("UNDETERMINED is not NO: a page whose stream could not be read is NOT marked", T1.unreadable.reasons.includes("no_text_layer"), false);
t("nor one drawing a form that does not resolve", T1.formMissing.reasons.includes("no_text_layer"), false);
t("A BLANK PAGE IS NOT A SCAN: fonts, an empty BT…ET and no image — not marked", T1.blank.reasons, []);

console.log("\n--- 3. THE OCR MEMBER'S RENDERER asks the SAME question and gets the SAME answer ---");
const R = {};
for (const [k, bytes] of Object.entries(F)) {
  const doc = await loadPdf(bytes);
  const a = await analyzePage(doc, 0);
  const r = await renderPageToPixels(bytes, 0);
  R[k] = { hasTextOps: a.hasTextOps, textShown: a.textShown, outcome: r.ok ? "ok" : r.reason };
}
t("the OCR member's renderer ADMITS the CAFR-shape page — it renders, it is not refused PAGE_HAS_TEXT_LAYER",
  R.cafr.outcome, "ok");
t("and reports the page as carrying no text", R.cafr.hasTextOps, false);
t("a page that shows text is still refused by name", ["tj", "tjArray", "quote", "dquote"].map((k) => R[k].outcome),
  Array(4).fill("PAGE_HAS_TEXT_LAYER"));
t("including text shown only through a Form XObject, which the old regex never looked inside", R.formText.outcome, "PAGE_HAS_TEXT_LAYER");
t("ONE ANSWER: for every fixture the renderer's textShown IS the plane's pageShowsText",
  Object.keys(F).filter((k) => R[k].textShown !== SHOWN[k]), []);
t("and hasTextOps is exactly `shown === true` — the undetermined is recorded, not rounded to text",
  Object.keys(F).filter((k) => R[k].hasTextOps !== (SHOWN[k] === true)), []);
t("ONE SPELLING: the renderer imports the predicate and keeps no text-operator pattern of its own",
  (() => {
    const src = readFileSync(fileURLToPath(new URL("../../pdf-worker/src/pagepixels.mjs", import.meta.url)), "utf8");
    return [/import \{[^}]*\bpageShowsText\b[^}]*\} from "\.\.\/\.\.\/bio-plane\/src\/pdfstructure\.mjs"/.test(src),
            /\(Tj\|TJ/.test(src), /\bSHOW_TEXT_BLOCK\s*=/.test(src)];
  })(), [true, false, false]);

console.log("\n--- 4. THROUGH THE OP: the plane routes the CAFR-shape page to OCR ---");
let ASKED = null;
const base = {
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d585", MEMBER_TOKEN: "mem-d585", PROBE_TOKEN: "prb-d585",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b) => new Response(b, { headers: { "content-type": "application/pdf" } });
    if (u.pathname === "/cafr-shape.pdf") return bin(F.cafr);
    if (u.pathname === "/text-shape.pdf") return bin(F.tj);
    return new Response("unscripted", { status: 500 });
  },
};
const mfBare = new Miniflare(base);
const mf = new Miniflare({ ...base, serviceBindings: {
  async OCR_WORKER(request) {
    if (new URL(request.url).pathname !== "/transcribe") return new Response("no", { status: 404 });
    ASKED = await request.json().catch(() => null);
    return Response.json({ ok: true, engine: "tesseract", version: "5.3.4-fast", cap: "C",
      measured_by: "a stub: this proves the WIRE, not an engine", confidence_floor: 0.6,
      pages: [{ page: 0, regions: [{ text: "COMPREHENSIVE ANNUAL FINANCIAL REPORT", confidence: { value: 0.97, basis: "engine" },
        source: { kind: "pdf-page", ref: "p0", page: 0, rect: [0, 0, 64, 64] } }] }] });
  } } });
const acquireOn = async (m, path) => (await (await m.dispatchFetch("http://x/api/?op=acquire&token=mem-d585", {
  method: "POST", body: JSON.stringify({ locator: "https://oakland.legistar.com" + path, authority: "City Clerk" }) })).json()).document;
try {
  const bare = await acquireOn(mfBare, "/cafr-shape.pdf");
  t("an un-fleeted instance reads NOTHING from the CAFR-shape page and does not claim to", bare?.reading?.found, false);
  t("it NAMES it a Tier-3 candidate — unread, not empty", bare?.reading?.tier3_candidate, true);
  const bareText = await acquireOn(mfBare, "/text-shape.pdf");
  t("OVER-STRICTNESS: the text-showing page is not a Tier-3 candidate", bareText?.reading?.tier3_candidate, undefined);
  const ocr = await acquireOn(mf, "/cafr-shape.pdf?v=2");
  t("with a member bound, the plane ASKS it for the page", Array.isArray(ASKED?.pages) ? ASKED.pages : ASKED && "asked, no page list", [0]);
  t("and the reading comes from tier 3", ocr?.reading?.text_tier, 3);
} finally {
  await mf.dispose();
  await mfBare.dispose();
}

footReached = true;
console.log(`\ntextshown: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
