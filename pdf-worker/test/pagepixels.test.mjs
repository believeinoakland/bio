/* pagepixels.test.mjs — CPDF-12's battery-resident half. HERMETIC: no network,
 * no OCR engine, no python. The measurement lives in
 * `pagepixels-corpus.probe.mjs`; what is pinned here is the behaviour a
 * regression would break.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE ONE THING THAT MAKES THIS SUITE WORTH HAVING
 * ─────────────────────────────────────────────────────────────────────────────
 * The expected pixel digests below were NOT produced by the subject. They come
 * from an INDEPENDENT decoder — Pillow (libtiff's CCITT G4) reached through
 * pypdf 6.14.2 / Pillow 11.3.0, run 2026-08-08 — which shares no line of source
 * with `pagepixels.mjs`. A decoder pinned against its own output agrees for
 * free, and an outcome that costs nothing to produce is not evidence. The
 * command that reproduces the expected values is in the probe; the values are
 * COPIED here so the battery stays hermetic, and if the fixture ever changes
 * they must be RE-DERIVED from the independent decoder rather than from a
 * failing run's "got".
 *
 * FIXTURE PROVENANCE: `fixtures/scan-ccitt-g4-page.pdf` wraps the EXACT
 * CCITTFaxDecode stream (84,797 bytes, copied byte for byte, K=-1, 3300x2550)
 * of page 2 of Oakland Legistar attachment 15721260 — the scanned City Council
 * resolution CPDF-9 ground-truthed — in a minimal one-page document with a real
 * xref table, `/Rotate 270` preserved from the original. The xref matters: a
 * fixture only OUR reader can open cannot be independently checked, which is
 * the whole point of it.
 *
 * NEGATIVE CONTROL: SEVEN arms, each run ALONE by
 * `node pdf-worker/test/pagepixels.control.mjs`, which re-runs them in one step
 * and verifies every restore by sha256 AND by byte comparison against a
 * per-arm pristine copy whose byte count it prints and floors. RUN 2026-08-08
 * against a baseline of 63 pass / 0 fail; all seven agreed on the final run.
 *   (a) neuter the CCITT 2D VERTICAL-MODE branch in `ccittDecode` (V0 falls
 *       through to the unknown-code path) -> 59 pass, 4 fail, naming the
 *       independent pixel digests and the decoded row count.
 *   (b) invert the padding mask in `normalisePacked` -> 59 pass, 4 fail. The arm
 *       that proves the DIGESTS are doing the work: every dimension, byte count
 *       and row count still agrees and only the digests move.
 *   (c) make `refuse()` return `{ ok: true, bytes: new Uint8Array(0) }` -> 52
 *       pass, 11 fail. The blank-frame hazard the queue row names, caught here
 *       rather than downstream where a blank page and a page with no text on it
 *       are indistinguishable.
 *   (d) drop the `/Rotate` application -> 57 pass, 6 fail. MEASURED COST of not
 *       catching it: the OCR arm scored 8.67% characters with 355 MINTED digits
 *       on a sideways page, and the engine announced nothing (probe, 2026-08-08).
 *   (e) drop the string/inline-image masking so a naive scan reads the whole
 *       content stream -> 61 pass, 2 fail. **THIS ARM CAME BACK A SURPRISING
 *       GREEN THE FIRST TIME (63 pass, 0 fail) AND THAT WAS A FINDING ABOUT
 *       THIS SUITE, NOT ABOUT THE SUBJECT:** the real scanned page's content
 *       stream is `q … cm /Im0 Do Q` and contains no strings at all, so the
 *       masking pass changed nothing and the arm tested nothing. It is recorded
 *       rather than smoothed, and the fixture with a marked-content string
 *       carrying the letters `Tj` was added to un-absorb it.
 *   (f) let `decodeImage` accept JPXDecode -> 62 pass, 1 fail.
 *   (g) OVER-STRICTNESS ARM: add a real but irrelevant field to `analyzePage`'s
 *       return -> 63 pass, 0 fail, as declared. A suite that fails on any change
 *       at all is a suite nobody can edit.
 * ONE MORE THING THE CONTROLS FOUND, kept because it is the instrument working:
 * arm (e)'s first hardened run ended through a TypeError rather than through an
 * assertion, and the FOOT SENTINEL printed `53 pass, 2 fail — SUITE ENDED
 * BEFORE ITS OWN FOOT` instead of the module dying silently with a clean tally.
 */
import "../../bio-plane/test/sandbox.mjs";

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import {
  renderPageToPixels, loadPdf, analyzePage, ccittDecode, normalisePacked,
  rotateBilevel, REFUSALS,
} from "../src/pagepixels.mjs";

const { Miniflare } = await (async () => {
  try { return await import("miniflare"); } catch { /* fall through */ }
  const planePkg = fileURLToPath(new URL("../../bio-plane/package.json", import.meta.url));
  return await import(pathToFileURL(createRequire(planePkg).resolve("miniflare")).href);
})();

const hex = (b) => createHash("sha256").update(b).digest("hex");
const F = (p) => new Uint8Array(readFileSync(fileURLToPath(new URL(p, import.meta.url))));

let pass = 0, fail = 0, footReached = false;
/* THE FOOT SENTINEL. A TypeError inside an assertion goes through no assertion
 * at all: the module ends and the tally line never prints, which a runner can
 * read as "unknown" rather than as red. This prints a tally WITH A FAILURE in
 * that case, so an early death is a red rather than a silence. */
process.on("exit", () => {
  if (!footReached) console.log(`\npagepixels: ${pass} passed, ${fail + 1} failed — SUITE ENDED BEFORE ITS OWN FOOT`);
});
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* Expected values with INDEPENDENT provenance (pypdf 6.14.2 + Pillow 11.3.0). */
const IND_UNROTATED_SHA = "e54f07066bcf32a7b105cf43bb331e29c95dafa05e1cf0176c2164811f3417ef";
const IND_UPRIGHT_SHA   = "ac4eb57f0f966f5d5b07eca8c97b065ab56746f32cfe33f3ba8b31cd1579efbc";
const IND_WHITE_BITS    = 7915462;

const SCAN = F("fixtures/scan-ccitt-g4-page.pdf");
const TEXT_PDF = F("../../bio-plane/test/fixtures/legistar-agenda-1425405.pdf");

/* ---- the decode, checked against a decoder that shares no code with it ---- */
console.log("\n--- CCITT G4: the picture, not the shape ---");
{
  const doc = await loadPdf(SCAN);
  t("the fixture opens", !!doc, true);
  const a = await analyzePage(doc, 0);
  t("one image on the page", a.imageCount, 1);
  t("no text operators", a.hasTextOps, false);
  t("no vector marks", a.hasVectorOps, false);
  t("the page declares its rotation", a.rotate, 270);
  t("filter chain", a.images[0].filters, ["CCITTFaxDecode"]);

  const raw = doc.streamRawBytes(a._images[0].obj);
  t("the CCITT stream is the original 84,797 bytes", raw.length, 84797);
  const d = ccittDecode(raw, { K: -1, columns: 3300, rows: 2550, byteAlign: false });
  t("every declared row decoded", d.rowsDecoded, 2550);
  const norm = normalisePacked(d.packed, 3300, 2550);
  t("UNROTATED pixels match the independent decoder", hex(norm), IND_UNROTATED_SHA);
  let white = 0;
  for (const b of norm) { let v = b; while (v) { white += v & 1; v >>= 1; } }
  t("white-bit count matches the independent decoder", white, IND_WHITE_BITS);
}

/* ---- the whole route, and the page a reader actually sees ---- */
console.log("\n--- the render: upright, digested, and self-describing ---");
{
  const r = await renderPageToPixels(SCAN, 0);
  t("it renders", r.ok, true);
  t("route", r.route, "decoded-ccitt-g4");
  t("media type", r.mediaType, "image/png");
  t("the page's own /Rotate is applied", [r.width, r.height], [2550, 3300]);
  t("and it says the pixels are upright", r.upright, true);
  t("and it states the rotation it applied", r.rotate_deg, 270);
  t("UPRIGHT pixels match the independent decoder", r.pixels_sha256, IND_UPRIGHT_SHA);
  t("300 dpi against the page box", r.page_geometry.dpi, { x: 300, y: 300 });
  t("the source is described, not summarised away",
    [r.source.filters, r.source.bitsPerComponent, r.source.colorSpace],
    [["CCITTFaxDecode"], 1, "DeviceGray"]);
  t("every declared row survived into the render", r.ccitt.rowsDecoded, 2550);

  // A real PNG, checked structurally rather than by "it has some bytes".
  const png = r.bytes;
  t("PNG signature", [...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  const dv = new DataView(png.buffer, png.byteOffset);
  t("IHDR width", dv.getUint32(16), 2550);
  t("IHDR height", dv.getUint32(20), 3300);
  t("IHDR bit depth 1, colour type 0 (grey)", [png[24], png[25]], [1, 0]);
  t("IEND terminates it", String.fromCharCode(...png.subarray(png.length - 8, png.length - 4)), "IEND");
  t("a decoded page is smaller than the RGBA frame a canvas would need",
    png.length < 2550 * 3300 * 4, true);
}

/* ---- rotation is exact, and reversible ---- */
console.log("\n--- rotation lands a bit on a bit ---");
{
  const w = 24, h = 16, rowBytes = 3;
  const src = new Uint8Array(rowBytes * h);
  for (let i = 0; i < src.length; i++) src[i] = (i * 37) & 0xff;
  const r90 = rotateBilevel(src, w, h, 90);
  t("90 turns the box", [r90.width, r90.height], [16, 24]);
  const back = rotateBilevel(rotateBilevel(rotateBilevel(r90.packed, 16, 24, 90).packed, 24, 16, 90).packed, 16, 24, 90);
  t("four quarter turns are the identity", hex(back.packed), hex(src));
  t("180 twice is the identity",
    hex(rotateBilevel(rotateBilevel(src, w, h, 180).packed, w, h, 180).packed), hex(src));
  t("0 is a no-op", hex(rotateBilevel(src, w, h, 0).packed), hex(src));
  let threw = null;
  try { rotateBilevel(src, w, h, 45); } catch (e) { threw = e.message; }
  t("an angle that cannot land a bit on a bit THROWS", /unsupported rotation/.test(threw || ""), true);
}

/* ---- refusals: stated, declared, and never an image ---- */
console.log("\n--- a refusal is a refusal, not a blank page ---");
{
  const cases = [
    ["not a PDF", await renderPageToPixels(new Uint8Array([1, 2, 3, 4]), 0), "NOT_A_PDF"],
    ["a page past the end", await renderPageToPixels(SCAN, 9), "NO_SUCH_PAGE"],
    ["a text-layer page", await renderPageToPixels(TEXT_PDF, 0), "PAGE_HAS_TEXT_LAYER"],
  ];
  for (const [label, r, reason] of cases) {
    t(`${label} is refused`, r.ok, false);
    t(`${label} names ${reason}`, r.reason, reason);
    t(`${label} carries the reason in words`, typeof r.why === "string" && r.why.length > 10, true);
    t(`${label} hands back NO bytes`, r.bytes, undefined);
  }
  t("a real page count is reported with NO_SUCH_PAGE", (await renderPageToPixels(SCAN, 9)).pageCount, 1);
  t("every reason the module can emit is DECLARED",
    cases.every(([, r]) => r.reason in REFUSALS), true);
  t("the declared set has not silently shrunk", Object.keys(REFUSALS).length >= 13, true);
}

/* ---- the synthetic pages: one image, several images, a filter with no decoder ---- */
console.log("\n--- what the renderer will not pretend to do ---");
{
  const mk = (objs) => {
    let pdf = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
    const off = [];
    objs.forEach((b, i) => { off[i] = pdf.length; pdf += `${i + 1} 0 obj\n${b}\nendobj\n`; });
    const x = pdf.length;
    let xr = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
    for (let i = 0; i < objs.length; i++) xr += `${String(off[i]).padStart(10, "0")} 00000 n \n`;
    pdf += xr + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;
    return new Uint8Array(Buffer.from(pdf, "latin1"));
  };
  const img = (n, extra, len) =>
    `<< /Type /XObject /Subtype /Image /Width 8 /Height 8 /ColorSpace /DeviceGray /BitsPerComponent 1 ${extra} /Length ${len} >>\nstream\n${"\x00".repeat(len)}\nendstream`;
  const page = (xobjs, content) =>
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 8 8] /Resources << /XObject << ${xobjs} >> >> /Contents 3 0 R >>`;

  const two = mk([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [4 0 R] /Count 1 >>",
    "<< /Length 34 >>\nstream\nq 8 0 0 8 0 0 cm /A Do /B Do Q\nendstream",
    page("/A 5 0 R /B 6 0 R"),
    img("A", "", 8), img("B", "", 8),
  ]);
  const r2 = await renderPageToPixels(two, 0);
  t("a page composed of several images is refused by name", r2.reason, "MULTIPLE_IMAGES_ON_PAGE");
  t("and it says how many", r2.imageCount, 2);

  const jpx = mk([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [4 0 R] /Count 1 >>",
    "<< /Length 26 >>\nstream\nq 8 0 0 8 0 0 cm /A Do Q\nendstream",
    page("/A 5 0 R"),
    img("A", "/Filter /JPXDecode", 8),
  ]);
  const rj = await renderPageToPixels(jpx, 0);
  t("a filter with no decoder is refused by name", rj.reason, "UNSUPPORTED_FILTER");
  t("and the filter is named", rj.filter, "JPXDecode");

  const short = mk([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [4 0 R] /Count 1 >>",
    "<< /Length 26 >>\nstream\nq 8 0 0 8 0 0 cm /A Do Q\nendstream",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 64 64] /Resources << /XObject << /A 5 0 R >> >> /Contents 3 0 R >>`,
    `<< /Type /XObject /Subtype /Image /Width 64 /Height 64 /ColorSpace /DeviceGray /BitsPerComponent 1 /Length 8 >>\nstream\n${"\x00".repeat(8)}\nendstream`,
  ]);
  const rs = await renderPageToPixels(short, 0);
  t("data short of the declared height is refused, NOT padded", rs.reason, "TRUNCATED_IMAGE_DATA");
  t("and it says how short", [rs.declaredHeight, rs.needBytes, rs.haveBytes], [64, 512, 8]);
  t("a truncated page yields no image at all", rs.bytes, undefined);

  /* Ink and no ink must be DISTINGUISHABLE — the blank-frame hazard, asserted
   * rather than assumed. Two 64x64 bilevel pages differing only in samples. */
  const raw = (fill) => {
    const s = new Uint8Array(64 * 8);
    if (fill) s.fill(0xff, 0, 64);
    return String.fromCharCode(...s);
  };
  const mkRaw = (fill) => mk([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [4 0 R] /Count 1 >>",
    "<< /Length 26 >>\nstream\nq 8 0 0 8 0 0 cm /A Do Q\nendstream",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 64 64] /Resources << /XObject << /A 5 0 R >> >> /Contents 3 0 R >>`,
    `<< /Type /XObject /Subtype /Image /Width 64 /Height 64 /ColorSpace /DeviceGray /BitsPerComponent 1 /Length 512 >>\nstream\n${raw(fill)}\nendstream`,
  ]);
  /* THE ARM THAT WAS ABSORBED, AND THE FIXTURE THAT UN-ABSORBS IT. Control arm
   * (e) — drop the string/inline-image masking so a naive scan for `Tj` reads
   * the whole content stream — came back a SURPRISING GREEN the first time it
   * ran: 61 pass, 0 fail. The cause was the fixture, not the subject. The real
   * scanned page's content stream is `q … cm /Im0 Do Q` and contains no strings
   * at all, so masking changed nothing and the arm tested nothing. This page
   * carries a marked-content string with the letters `Tj` inside it, which is
   * what a real `/ActualText` or `/Alt` entry looks like, and it is the only
   * assertion in the suite that can tell the two readings apart. */
  const stringy = mk([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [4 0 R] /Count 1 >>",
    "<< /Length 78 >>\nstream\n/Span << /ActualText (a note Tj about the scan) >> BDC q 8 0 0 8 0 0 cm /A Do Q EMC\nendstream",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 64 64] /Resources << /XObject << /A 5 0 R >> >> /Contents 3 0 R >>`,
    `<< /Type /XObject /Subtype /Image /Width 64 /Height 64 /ColorSpace /DeviceGray /BitsPerComponent 1 /Length 512 >>\nstream\n${"\x00".repeat(512)}\nendstream`,
  ]);
  const rst = await renderPageToPixels(stringy, 0);
  t("an operator-shaped token INSIDE a string is not a text layer", rst.ok, true);
  /* `?.` deliberately: when arm (e) is armed this is a REFUSAL with no
   * `page_marks`, and a TypeError here would end the module through no
   * assertion at all. The foot sentinel caught exactly that on the first run
   * (it printed `53 pass, 2 fail — SUITE ENDED BEFORE ITS OWN FOOT`), which is
   * the sentinel working; the assertion is still hardened so the arm fails as
   * an ASSERTION rather than as a crash. */
  t("and the page is still reported as carrying no text", rst.page_marks?.hasTextOps ?? "REFUSED", false);

  const blank = await renderPageToPixels(mkRaw(false), 0);
  const inked = await renderPageToPixels(mkRaw(true), 0);
  t("a uniform page renders", blank.ok, true);
  t("a page with ink renders", inked.ok, true);
  t("and the two are NOT the same picture", blank.pixels_sha256 === inked.pixels_sha256, false);
}

/* ---- workerd: the runtime the placement question is actually about ---- */
console.log("\n--- it runs in workerd, and the DECODE is runtime-independent ---");
{
  /* BUNDLED, not concatenated. `pagepixels.mjs` and `pdfstructure.mjs` each have
   * a private `nameOf` and a private `LATIN1`; pasting the two together produces
   * a module that either throws on a duplicate declaration or — worse — silently
   * resolves to the wrong one. esbuild is resolved the same two ways the suite
   * resolves miniflare, and if neither answers this arm SKIPS LOUDLY WITH A
   * NAMED REASON rather than quietly not running (D-93's rule). */
  let bundled = null, skipWhy = null;
  try {
    const esbuild = await (async () => {
      try { return await import("esbuild"); } catch { /* fall through */ }
      const planePkg = fileURLToPath(new URL("../../bio-plane/package.json", import.meta.url));
      return await import(pathToFileURL(createRequire(planePkg).resolve("esbuild")).href);
    })();
    const r = await esbuild.build({
      stdin: {
        contents: `import { renderPageToPixels } from ${JSON.stringify(fileURLToPath(new URL("../src/pagepixels.mjs", import.meta.url)))};
export default {
  async fetch(req) {
    const bytes = new Uint8Array(await req.arrayBuffer());
    const r = await renderPageToPixels(bytes, 0);
    if (!r.ok) return Response.json(r);
    const d = await crypto.subtle.digest("SHA-256", r.bytes);
    return Response.json({ ok: true, route: r.route, width: r.width, height: r.height,
      upright: r.upright, bytes: r.bytes.length, pixels_sha256: r.pixels_sha256,
      file_sha256: [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("") });
  },
};`,
        resolveDir: fileURLToPath(new URL(".", import.meta.url)),
        sourcefile: "pagepixels-under-test.mjs",
      },
      bundle: true, write: false, format: "esm", platform: "neutral",
      external: ["cloudflare:workers", "node:*"],
    });
    bundled = r.outputFiles[0].text;
  } catch (e) {
    skipWhy = String(e && e.message || e).split("\n")[0];
  }
  if (!bundled) {
    console.log(`  SKIPPED — the workerd arm could not bundle: ${skipWhy}`);
    console.log(`  (the node-side assertions above still ran; this arm is an ADDITIONAL claim)`);
  } else {
  const mf = new Miniflare({
    modules: true, modulesRoot: "/", script: bundled, scriptPath: "/pagepixels-under-test.mjs",
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  });
  try {
    const res = await mf.dispatchFetch("http://x/", { method: "POST", body: SCAN });
    const j = await res.json();
    t("workerd renders the scanned page", j.ok, true);
    t("workerd applies the rotation too", [j.width, j.height, j.upright], [2550, 3300, true]);
    t("workerd's PIXELS match the independent decoder", j.pixels_sha256, IND_UPRIGHT_SHA);
    const local = await renderPageToPixels(SCAN, 0);
    t("node and workerd agree on the PICTURE", j.pixels_sha256, local.pixels_sha256);
    /* AND THE CLAIM THAT IS DELIBERATELY NOT MADE. The FILE digests do NOT have
     * to agree: `CompressionStream("deflate")` is a platform service and the two
     * runtimes emit different valid deflate streams for identical input (the
     * same page came out 147,251 B on workerd and 152,499 B on node). That is
     * why `pixels_sha256` exists and why nothing here pins the file digest. */
    t("the FILE digest is NOT asserted to be portable",
      typeof j.file_sha256 === "string" && j.file_sha256.length === 64, true);
  } finally { await mf.dispose(); }
  }
}

footReached = true;
console.log(`\npagepixels: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
