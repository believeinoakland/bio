# legacy-index — T4 job record (second job, K125)

**Job** · LEGACY-INDEX #2, session `session_01587zDEWW3E6JZJLW7E3kK9`, branch `job/T4/legacy-index-2` (from `tranche/T4` @ `b4fbb0b9b5`). Entries T4-7 and T4-8 (`build/plan/current.md`, "Layer 11 re-opened"). A legacy module: no requirements file, no `tests` path; its contract is the entries and the modules it serves (here `pdf-reader` R14, R26 and `capture`).

## Status

WAITING on BOB: the ANSWER to QUESTION 1 (T4-8), and the CHANGE that `capture` exports `driveRow` (T4-7). Nothing else open.

## QUESTION 1 (T4-8): the routing already holds the rule; the red arm is the test's fixture

**Measured.** `index.mjs` routes to OCR exactly the pages marked `no_text_layer` or `image_content_unread` (`TIER3_REASONS`, used by `needsTier3` and `tier3Pages`; `encrypted` wins; `image_content_undetermined` is not routed). `tier3_candidate` is set from `needsTier3` and nothing else widens it. The `textshown` arm that fails ("OVER-STRICTNESS: the text-showing page is not a Tier-3 candidate", 33/1) serves `F.tj`: a 64×64 page whose image covers the whole page box and which shows ONE glyph (`(x) Tj`). `extractPdfStructure` marks that page `image_content_unread` (`image_share` 1, `glyphs` 1), which is exactly pdf-reader R26's rule (at most 4 glyphs, share at least 0.18; R26 applies only to a page that shows text). So the plane routes it because pdf-reader marks it, as R26 and N19 intend: the fixture, written for D-585 before D-627, is now an image-content page.

**My reading (built on it):** no change to `index.mjs`; the rule T4-8 names is in place and is proven below. The red is `textshown.test.mjs`'s fixture (`legacy-tests`' file, not mine): its text-shape page wants a text page by R26, e.g. `image: false`, or 22 or more glyphs, or an image share under 0.18 with 22 or more glyphs. The arm then tests what its label says. Alternatively, if BOB reads R26's thresholds as wrong for this page, that is `pdf-reader`'s requirement (Bob's), not the router.

**Proof, through the whole plane** (a scratch Miniflare driver, not committed: no path of mine holds tests; its text is below): seven one-page PDFs, each first checked to carry the R14/R26 mark it is built for, then acquired on an un-fleeted instance. `no_text_layer` (a scan) and `image_content_unread` (1 glyph, and 4 glyphs, over a full-page image) are `tier3_candidate: true`; `image_content_undetermined` (5 glyphs at share 1; 1 glyph at share 0.0625), 22 glyphs over a full-page image, and a text page with no image carry no `tier3_candidate`. **14 pass, 0 fail.**

## T4-7 (waiting on the CHANGE)

`op=monitor`'s Drive tick calls `driveRow` at five sites (the folder, file and unknown-shape refusals, and C-48.8/C-48.9's shell arms); `index.mjs` no longer defines it and `capture/acquire.mjs` holds it privately. Both tick codes (`DRIVE_TICK_EXPORT_IS_THE_SHELL`, `DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL`) have `DRIVE_CAPTURE_CHECKS` rows, so capture's reader serves them unchanged. Once `capture` exports it, the change here is one name added to the existing `import { … } from "./capture/acquire.mjs"`. `monitor-assess` (legacy-tests' suite) ticks every Drive arm through the plane: the folder, file and unknown-shape refusals (C-48.2–C-48.4) and both shell arms (C-48.8, C-48.9, with the record unmoved), so it is the end-to-end test.

**Pre-measured, not committed:** with `export` added to capture's `driveRow` in the working tree only (capture's file, restored after) and the import added here: `monitor-assess` 91 pass, 0 fail (base on this branch: 8 fail, then `ReferenceError: driveRow is not defined`, no foot); `drive` green.

## Tests and checks

- `textshown.test.mjs` on this branch at the start: 33/1 (the arm above).
- The T4-8 driver: 14/0.

<details><summary>The T4-8 driver (scratch)</summary>

```js
/* T4-8 scratch driver (legacy-index has no tests path): N19's routing through the whole plane. */
import { Miniflare } from "/home/user/bio/bio-plane/node_modules/miniflare/dist/src/index.js";
import { readFileSync } from "node:fs";
import { extractPdfStructure } from "/home/user/bio/bio-plane/src/pdfstructure.mjs";
const SRC = process.env.SRC || "/home/user/bio/bio-plane/src/index.mjs";
let pass = 0, fail = 0;
const t = (l, got, want) => { const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${ok ? "" : ` want ${JSON.stringify(want)} got ${JSON.stringify(got)}`}`); ok ? pass++ : fail++; };
function mk(objs){let pdf="%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";const off=[];objs.forEach((b,i)=>{off[i]=pdf.length;pdf+=`${i+1} 0 obj\n${b}\nendobj\n`;});const x=pdf.length;let xr=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;for(let i=0;i<objs.length;i++)xr+=`${String(off[i]).padStart(10,"0")} 00000 n \n`;pdf+=xr+`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;return new Uint8Array(Buffer.from(pdf,"latin1"));}
const stream=(s)=>`<< /Length ${Buffer.byteLength(s,"latin1")} >>\nstream\n${s}\nendstream`;
const IMAGE=`<< /Type /XObject /Subtype /Image /Width 64 /Height 64 /ColorSpace /DeviceGray /BitsPerComponent 1 /Length 512 >>\nstream\n${"\x00".repeat(512)}\nendstream`;
/* size = the image's side in a 64x64 page (share = (size/64)^2); text = the string shown, or null for none */
function page({ size = 64, text = null, image = true }) {
  const paint = image ? `q\n${size} 0 0 ${size} 0 0 cm\n/Im24 Do\nQ\n` : "q Q\n";
  const second = text === null ? "BT\n\nET\n" : `BT /F1 4 Tf 1 1 Td (${text}) Tj ET`;
  return mk(["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 64 64] /Resources << /Font << /F1 7 0 R >> ${image ? "/XObject << /Im24 6 0 R >>" : ""} >> /Contents [4 0 R 5 0 R] >>`,
    stream(paint), stream(second), IMAGE, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"]);
}
const F = {
  scan:        page({ text: null }),                       // no_text_layer
  folio:       page({ text: "7" }),                        // image_content_unread (share 1, 1 glyph)
  fourGlyphs:  page({ text: "abcd" }),                     // image_content_unread (4 glyphs)
  fiveGlyphs:  page({ text: "abcde" }),                    // image_content_undetermined (5 glyphs)
  smallImage:  page({ size: 16, text: "7" }),              // image_content_undetermined (share 0.0625)
  textOver:    page({ text: "a".repeat(22) }),             // neither (22 glyphs)
  textOnly:    page({ text: "x", image: false }),          // neither (no image)
};
const WANT_MARK = { scan: "no_text_layer", folio: "image_content_unread", fourGlyphs: "image_content_unread",
  fiveGlyphs: "image_content_undetermined", smallImage: "image_content_undetermined", textOver: null, textOnly: null };
const ROUTED = new Set(["no_text_layer", "image_content_unread"]);
console.log("--- the fixtures carry the pdf-reader R14/R26 marks they are built for ---");
for (const [k, b] of Object.entries(F)) {
  const s = await extractPdfStructure(b);
  const r = (s.text.undetermined || []).map((m) => m.reason).filter((x) => x === "no_text_layer" || x.startsWith("image_content"));
  t(`${k}: ${WANT_MARK[k] ?? "no image/scan mark"}`, r, WANT_MARK[k] ? [WANT_MARK[k]] : []);
}
const mf = new Miniflare({ modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "a-t48", MEMBER_TOKEN: "m-t48", PROBE_TOKEN: "p-t48", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(req) { const k = new URL(req.url).pathname.slice(1).replace(/\.pdf$/, "");
    return F[k] ? new Response(F[k], { headers: { "content-type": "application/pdf" } }) : new Response("no", { status: 500 }); } });
console.log("--- through op=acquire on an un-fleeted instance: only the two marks route to OCR ---");
try {
  for (const k of Object.keys(F)) {
    const d = (await (await mf.dispatchFetch("http://x/api/?op=acquire&token=m-t48", { method: "POST",
      body: JSON.stringify({ locator: `https://example.gov/${k}.pdf`, authority: "Clerk" }) })).json()).document;
    t(`${k}: tier3_candidate ${ROUTED.has(WANT_MARK[k]) ? "true" : "absent"}`, d?.reading?.tier3_candidate, ROUTED.has(WANT_MARK[k]) ? true : undefined);
  }
} finally { await mf.dispose(); }
console.log(`\nt48: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
```

</details>
