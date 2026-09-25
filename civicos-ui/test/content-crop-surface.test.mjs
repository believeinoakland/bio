/* NEGATIVE CONTROL: RAN 2026-09-25 by the UI-120 worker, driver `test/content-crop-surface.control.mjs`, SEVEN ARMS INCLUDING A BASELINE, each ONE splice of the extracted script (anchor matched exactly once), handed to this suite through UI120_APP_SRC so app.html is never edited and nothing needs restoring. EVERY ARM AS DECLARED GREEN/RED. baseline 31/0. stub (THE ROW'S NAMED CONTROL: the content-crop read stubbed to `{ok:false}`) 17/14, failing BY NAME at "UI-120 the crop renders: a member viewing a cited image extent sees its crop", with the arms that read the same answer (one read per leg, the JPEG bytes, LABELLED DERIVED, LABELLED WITH ITS CAPTURE, the page, TWO CROPS, and the six C-99 arms); every section 1 and section 4 arm HELD. onload 29/2, failing at "NOTHING IS ASKED ON LOAD" and "NOTHING PREFETCHED FOR A STRANGER". everyleg 29/2, failing at "a non-image extent shows no control" and the `{part}` arm. unlabelled 29/2, failing at "LABELLED DERIVED" — and ALSO at section 4's media-type arm, beyond the declaration and recorded rather than smoothed: that arm asserts the `why` label survives when the picture is withheld, so it reads the same line; the declaration's must-nots (the render arm, section 3) held. reworded 26/5, failing at the five C-99 translation arms. overstrict (the control's label respelled) 31/0, as it must.
 * THE FIRST CUT OF THE ORIENTATION ARM PASSED VACUOUSLY and is recorded: it was conditional on the plane's `upright`, which the fixture answers `true` for both crops, so it asserted the no-note branch only. It is now a ground-truth guard (both true) plus a section 4 arm driving `upright: null` on the plane's own answer.
 *
 * UI-120 / D-419 — THE CROP OF A CITED IMAGE, WHERE A MEMBER MEETS THE CITATION
 * (`docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4; the plane half is `op=contentcrop`, C-99).
 *
 * "The viewer shows the crop; the crop is not the evidence." D-419 built the read and no page asked
 * for it. This suite drives the inquiry page's leg row — `basisLegRow` over the plane's own
 * `earnedbasis` referents — and the one control it now offers on a leg citing an image on a PDF
 * page, against the REAL plane with the REAL pdf-worker bundle bound as its PDF member
 * (d419-content-crop's two-worker shape), so the picture this page draws is the one the member
 * cut from the bytes R2 holds.
 *
 * HOW A LIAR PASSES A WEAKER VERSION OF THIS SUITE, and the arm that catches each:
 *   (a) it offers the control everywhere, or nowhere — section 1: the control is on EXACTLY the two
 *       legs citing an image with a rectangle, and on none of a page-form image, a PDF page passage,
 *       a whole document, or another question;
 *   (b) it asks on load, cutting every picture for whoever opens the page — section 1: drawing every
 *       leg made ZERO contentcrop reads, with a member AND with no credential at all;
 *   (c) it draws a picture of its own — section 2: the image's bytes are the plane's own answer to the
 *       same question, asked by this suite directly, byte for byte, in the media type it named;
 *   (d) it draws the crop as if it were the evidence — section 2: the plane's own `why` (DERIVED, the
 *       evidence is the capture plus the extent) is rendered verbatim beside the capture it names;
 *   (e) it composes friendlier refusals — section 3: every C-99 refusal reached is rendered in the
 *       catalogue's translation, IMPORTED, with its code, and C-99.3's "reason beside" is there.
 *
 * WHAT THIS SUITE CANNOT SEE, stated: it drives the leg row and the ask through their own functions,
 * not the whole `openInquiry` page (whose other reads are other suites'); it runs on Miniflare, not a
 * deployed build; and it does not drive a container `{part}` image leg (the plane's C-99.2 answer for
 * one is driven by d419-content-crop; here only the no-control half is asserted, on a synthetic
 * referent, because minting a `{part}` row needs an office capture this fixture does not hold).
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a suite's own exit must not discard its own output */
import fs from "fs";
import vm from "vm";
import { createHash, webcrypto } from "crypto";
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";
import { appScript } from "./extract.mjs";
import { withSurfacingRun } from "../../bio-plane/test/surfacing-run.mjs";   /* REC-171 */
import { CONTENT_CROP_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
const eq = (label, got, want) => ok(label, JSON.stringify(got) === JSON.stringify(want),
  `want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`);

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try {
  ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href));
} catch (e) {
  console.error("content-crop-surface: the real plane could not be started — run `npm ci` in bio-plane/.");
  console.error("  " + String(e && e.message || e));
  process.exit(1);
}
const SRC_PLANE = fileURLToPath(new URL("../../bio-plane/src/index.mjs", import.meta.url));
const BUNDLE = fileURLToPath(new URL("../../pdf-worker/dist/pdf-worker.bundled.mjs", import.meta.url));
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ---- the fixture: d419-content-crop's — ONE page painting TWO images ---- */
function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(`<< ${o.dict} /Length ${o.stream.length} >>\nstream\n`, "latin1"), o.stream,
                  Buffer.from("\nendstream\n", "latin1"));
    } else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const JPG = Buffer.from("\xff\xd8\xff\xe0UI-120 fixture: a parcel map\xff\xd9", "latin1");
const GREY = Buffer.from([0x00, 0x40, 0x80, 0xff]);
const IMAGES_PDF = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im1 4 0 R /Im2 5 0 R >> >> /Contents 6 0 R >>" },
  { num: 4, dict: "/Type /XObject /Subtype /Image /Width 40 /Height 30 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode", stream: JPG },
  { num: 5, dict: "/Type /XObject /Subtype /Image /Width 2 /Height 2 /ColorSpace /DeviceGray /BitsPerComponent 8", stream: GREY },
  { num: 6, dict: "", stream: Buffer.from("q 200 0 0 100 50 600 cm /Im1 Do Q\nq 100 0 0 100 300 100 cm /Im2 Do Q", "latin1") },
]);
const CAP = sha(IMAGES_PDF);
const JPG_RECT = [50, 600, 250, 700], GREY_RECT = [300, 100, 400, 200];

const MEM = "mem-ui120";
const plane = (member) => ({
  name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC_PLANE, script: fs.readFileSync(SRC_PLANE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "test", ADMIN_TOKEN: "adm-ui120", MEMBER_TOKEN: MEM, PROBE_TOKEN: "prb-ui120",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    if (new URL(request.url).pathname === "/ui120.pdf")
      return new Response(IMAGES_PDF, { headers: { "content-type": "application/pdf" } });
    return new Response("unscripted", { status: 500 });
  },
  ...(member ? { serviceBindings: { PDF_WORKER: "pdf-worker" } } : {}),
});
const realMember = () => ({
  name: "pdf-worker", modules: true, modulesRoot: "/", scriptPath: BUNDLE, script: fs.readFileSync(BUNDLE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  r2Buckets: ["CAPTURES"], bindings: { VERSION: "test" },
});
/* Stand-in members for the two C-99 conditions a correct member never produces (d419's stubs). */
const stubMember = (script) => ({ name: "pdf-worker", modules: true, script, compatibilityDate: "2026-07-01" });
const SILENT = `export default { async fetch() { return new Response("<html>upstream error</html>", { status: 500 }); } };`;
const MISMATCH = `export default { async fetch() { return Response.json({ ok: true, derived: true, rendition: "crop",
  capture_sha256: "${"0".repeat(64)}", width: 2, height: 2, mediaType: "image/png", bytes_base64: "AECA/w==" }); } };`;

const NOW = "2026-09-25T00:00:00Z", LATER = "2026-09-25T01:00:00Z";
const LEG_KEYS = { kind: "extent_kind", page: "extent_page", rect: "extent_rect" };
const inquiryMd = (id, legs) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(legs.length ? ["references:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    rel: cites",
                                                            "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(legs.length ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
    ...Object.entries(LEG_KEYS).filter(([k]) => l[k] !== undefined)
      .map(([k, f]) => `    ${f}: ${Array.isArray(l[k]) ? `[${l[k].join(", ")}]` : l[k]}`)])] : []),
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const DOC = "INFO-2026-9120-crop", SUB = "INQ-2026-9120-sub", INQ = "INQ-2026-9120-main";
const LEGS = [
  { target: DOC, kind: "image", page: 0, rect: GREY_RECT },   // 0 an image with a rectangle: the grey 2x2
  { target: DOC, kind: "image", page: 0, rect: JPG_RECT },    // 1 an image with a rectangle: the publisher's JPEG
  { target: DOC, kind: "image", page: 0 },                    // 2 an image named by its page alone: no rectangle
  { target: DOC, kind: "pdf-page", page: 0 },                 // 3 a page of the PDF: a passage, not an image
  { target: DOC },                                            // 4 the whole document
  { target: SUB },                                            // 5 another question: no content at all
];

/* Builds the record every arm reads. Returns the promoted inquiry's answer and the capture sha. */
async function seed(mf) {
  const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
  const post = async (op, body) => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${MEM}`, { method: "POST", body: JSON.stringify(body) })).json());
  let snap = 0;
  const promote = async (id, text, type, reading) => {
    const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
    if (reading) {
      const prov = JSON.stringify({ documents: [reading] });
      files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
    }
    /* CORRECTED 2026-09-25 at the c22-batch30 union (CONDUCT #22), never exempted: this item was cut before D-563,
       whose C-86.3 refuses an envelope title the held document contradicts (`Bundle <id>` against the document's own
       `title:`). The envelope now carries the document's OWN title, read from its front matter; its dates were
       already the document's own (NOW / LATER). */
    const ownTitle = (/^title: "(.*)"$/m.exec(text) || [])[1];
    const r = await post("promote", { bundleId: id, base: null,
      snapKey: `20260925T${String(100000 + (++snap)).slice(-6)}Z_${sha(id).slice(0, 8)}`,
      meta: { object_type: type, group: "believe-in-oakland", title: ownTitle ?? `Bundle ${id}`,
              current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
      files, register: [] });
    if (r?.ok === false) throw new Error(`promote ${id} REFUSED: ${JSON.stringify(r).slice(0, 900)}`);
    return r;
  };
  const acq = await (await mf.dispatchFetch(`http://x/api/?op=acquire&token=${MEM}`,
    { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov/ui120.pdf", authority: "City of Oakland" }) })).json();
  await promote(DOC, infoMd(DOC), "information", acq.document);
  await promote(SUB, inquiryMd(SUB, []), "inquiry");
  const inq = await promote(INQ, inquiryMd(INQ, LEGS), "inquiry");
  return { acquired: acq.document?.capture?.sha256 ?? null, inq };
}

/* ---- the surface, loaded into a vm, its own fetch bridged to whichever plane is current ---- */
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", addEventListener(){}, querySelector:()=>el(), querySelectorAll:()=>[],
    insertAdjacentHTML(){}, focus(){}, click(){}, remove(){} };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const els = new Map();
const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
const CALLED = [];
let CURRENT = null;
async function bridgeFetch(u, opts){
  const url = new URL(u, "http://x");
  CALLED.push({ op: url.searchParams.get("op"), url });
  return CURRENT.dispatchFetch(url.toString(), opts);
}
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch: bridgeFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
/* The control driver hands a spliced script through UI120_APP_SRC; nothing in the tree is edited. */
const SRC = process.env.UI120_APP_SRC ? fs.readFileSync(process.env.UI120_APP_SRC, "utf8") : appScript();
vm.runInContext(SRC + ";globalThis.__U = {" + [
  "PLANE", "esc", "recR", "legReferent", "basisLegRow", "contentCropAskHtml", "askContentCrop", "contentCropHtml",
].join(",") + "};", ctx);
const U = ctx.__U;
const asMember = () => {
  U.PLANE.token = MEM; U.PLANE.session = true;
  U.PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };
};
const asStranger = () => { U.PLANE.token = null; U.PLANE.session = false; U.PLANE.me = null; };
const has = (html, sentence) => String(html).includes(U.esc(String(sentence)));
const img = (html) => (/<img [^>]*src="data:([^;"]+);base64,([^"]*)"/.exec(String(html)) || []).slice(1);
const crops = () => CALLED.filter((c) => c.op === "contentcrop");

const opened = [];
const open = (member) => { const m = withSurfacingRun(new Miniflare({ workers: [plane(!!member), ...(member ? [member] : [])] }), [MEM]); opened.push(m); return m; };
try {
/* ============================================================
   0. THE GROUND — one question citing the capture six ways
   ============================================================ */
console.log("\n--- 0. the ground: a PDF painting two images, and a question citing it six ways ---");
const mf = open(realMember());
CURRENT = mf;
const S = await seed(mf);
eq("the fixture was acquired as these bytes", S.acquired, CAP);
const cidAt = (ord) => (S.inq.content || []).find((c) => c.ord === ord)?.content_id ?? null;
eq("the ground: every leg citing the document resolves to a content row, and the sub-question's does not",
  LEGS.map((_, o) => !!cidAt(o)), [true, true, true, true, true, false]);
const get = async (op, qs) => (await mf.dispatchFetch(`http://x/api/?op=${op}&token=${MEM}&${qs}`)).json();
/* THE PLANE'S OWN ANSWER, asked directly — the ground truth every rendering is held to. */
const TRUTH = [];
for (let o = 0; o < 5; o++) TRUTH[o] = await get("contentcrop", `id=${cidAt(o)}`);
eq("GROUND TRUTH GUARD: the plane crops legs 0 and 1 and refuses 2, 3 and 4 by the C-99 codes this suite depends on",
  TRUTH.map((t) => t.ok ? [t.rendition, t.mediaType, t.width, t.height] : [t.reason, t.member_reason ?? null]),
  [["crop", "image/png", 2, 2], ["crop", "image/jpeg", 40, 30],
   ["CROP_NOT_DERIVABLE", "RECT_REQUIRED"], ["CROP_NOT_A_PAGE_IMAGE", null], ["CROP_NOT_A_PAGE_IMAGE", null]]);
ok("GROUND TRUTH GUARD: the plane's crops say DERIVED and carry bytes", [TRUTH[0], TRUTH[1]].every((t) =>
  t.derived === true && /DERIVED/.test(t.why || "") && typeof t.bytes_base64 === "string" && t.bytes_base64.length > 0));

/* ============================================================
   1. THE CONTROL, AT THE CITATION, AND NO READ UNTIL IT IS USED
   ============================================================ */
console.log("\n--- 1. the control sits on a leg citing an image with a rectangle, and nothing is asked on load ---");
asMember();
const REF = await U.recR("earnedbasis", { id: INQ });
const before = crops().length;
const rows = LEGS.map((l, o) => U.basisLegRow(l, o, U.legReferent(REF, o)));
eq("a non-image extent shows no control: ONLY the two legs citing an image with a rectangle carry it",
  rows.map((h) => /askContentCrop\(/.test(h)), [true, true, false, false, false, false]);
ok("...and each control asks about ITS OWN leg's row, named by the record's content id",
  [0, 1].every((o) => rows[o].includes(U.esc(JSON.stringify(cidAt(o)))) && rows[o].includes(`id="crop-${o}"`)));
eq("NOTHING IS ASKED ON LOAD: drawing every leg made zero contentcrop reads", crops().length - before, 0);
eq("a container image ({part}) is not a rectangle of a page: no control (a synthetic referent — see the header)",
  U.contentCropAskHtml({ content_id: "c".repeat(64), standing: { extent_kind: "image",
    extent: { kind: "image", part: "d".repeat(64), mime: "image/png" } } }, 7), "");
eq("OVER-STRICTNESS: a leg with no referent read renders no control rather than a broken one",
  /crop-/.test(U.basisLegRow(LEGS[0], 0, null)), false);
{
  asStranger();
  const b = crops().length;
  LEGS.map((l, o) => U.basisLegRow(l, o, U.legReferent(REF, o)));
  eq("NOTHING PREFETCHED FOR A STRANGER: drawing the legs with no credential made zero contentcrop reads", crops().length - b, 0);
  asMember();
}

/* ============================================================
   2. THE CROP, RENDERED FROM THE PLANE'S OWN ANSWER
   ============================================================ */
console.log("\n--- 2. the crop a member sees is the plane's, labelled derived from the capture it names ---");
const OUT = [];
for (const o of [0, 1]) {
  const b = crops().length;
  await U.askContentCrop(cidAt(o), o);
  const asked = crops().slice(b);
  ok(`leg ${o}: using the control made ONE contentcrop read, for this leg's row and no other`,
    asked.length === 1 && asked[0].url.searchParams.get("id") === cidAt(o));
  OUT[o] = $$(`#crop-${o}`).innerHTML;
}
eq("UI-120 the crop renders: a member viewing a cited image extent sees its crop, the plane's own bytes in its own media type",
  [img(OUT[0]), img(OUT[1])], [[TRUTH[0].mediaType, TRUTH[0].bytes_base64], [TRUTH[1].mediaType, TRUTH[1].bytes_base64]]);
ok("  and the JPEG is the publisher's own bytes, untouched", Buffer.from(img(OUT[1])[1] || "", "base64").equals(JPG));
ok("LABELLED DERIVED: the answer's own `why` is rendered verbatim beside each picture",
  [0, 1].every((o) => has(OUT[o], TRUTH[o].why)));
ok("LABELLED WITH ITS CAPTURE: each picture names the capture the plane checked it against",
  [0, 1].every((o) => OUT[o].includes(`data-capture="${CAP}"`) && OUT[o].includes(CAP.slice(0, 12))));
ok("the page is given as a reader counts it (the record's 0 is page 1)", [0, 1].every((o) => /page 1\b/.test(OUT[o])));
/* Both fixture placements are plain positive scales, so the plane says upright:true for both and the page
   adds nothing; the null case (a flipped or rotated placement) is driven on the plane's own answer with that
   one field changed, in section 4 — the fixture holds no flipped image. */
eq("GROUND TRUTH GUARD: the plane says both fixture crops are the right way up",
  [TRUTH[0].upright, TRUTH[1].upright], [true, true]);
ok("...and where it says so, the page adds no orientation note", [0, 1].every((o) => !/data-crop-upright/.test(OUT[o])));
eq("TWO CROPS, TWO RENDERINGS: no one generic picture passes", OUT[0] !== OUT[1], true);

/* ============================================================
   3. C-99, IN THE PLANE'S WORDS
   ============================================================ */
console.log("\n--- 3. every C-99 refusal renders in the catalogue's translation, with its code ---");
const row = (code) => CONTENT_CROP_CHECKS[code];
const refused = (h, code) => has(h, row(code).translation) && h.includes(code) && img(h).length === 0;
{
  await U.askContentCrop(cidAt(2), 2);
  const h = $$("#crop-2").innerHTML;
  ok("C-99.3 CROP_NOT_DERIVABLE (asked directly of a page-form image): its translation and code, no picture", refused(h, "CROP_NOT_DERIVABLE"));
  ok("  and the PDF reader's own reason is BESIDE it, as the translation says it is", has(h, TRUTH[2].member_why) && h.includes("RECT_REQUIRED"));
  await U.askContentCrop(cidAt(4), 4);
  ok("C-99.2 CROP_NOT_A_PAGE_IMAGE (asked directly of a whole-document row): its translation and code, no picture",
    refused($$("#crop-4").innerHTML, "CROP_NOT_A_PAGE_IMAGE"));
}
for (const [label, member, code] of [
  ["C-99.1 CROP_NO_PDF_MEMBER (an instance with no PDF reader)", null, "CROP_NO_PDF_MEMBER"],
  ["C-99.4 CROP_MEMBER_SILENT (a PDF reader that gives no answer)", stubMember(SILENT), "CROP_MEMBER_SILENT"],
  ["C-99.5 CROP_CAPTURE_MISMATCH (a crop of other bytes: never shown)", stubMember(MISMATCH), "CROP_CAPTURE_MISMATCH"],
]) {
  const m = open(member);
  CURRENT = m;
  const s2 = await seed(m);
  const cid = (s2.inq.content || []).find((c) => c.ord === 0)?.content_id;
  await U.askContentCrop(cid, 20);
  ok(`${label}: its translation and code, no picture`, refused($$("#crop-20").innerHTML, code),
    $$("#crop-20").innerHTML.slice(0, 300));
}
CURRENT = mf;
{
  asStranger();
  await U.askContentCrop(cidAt(0), 21);
  const h = $$("#crop-21").innerHTML;
  ok("A STRANGER who uses the control gets the plane's refusal and no picture", img(h).length === 0 && /intent-ref/.test(h), h.slice(0, 300));
  asMember();
}

/* ============================================================
   4. WHAT THIS PAGE WILL NOT DRAW
   ============================================================ */
console.log("\n--- 4. an answer this page cannot draw safely is stated, not drawn ---");
const good = { ...TRUTH[0] };
ok("a media type the page does not draw (not PNG or JPEG) gets no picture and says so",
  (() => { const h = U.contentCropHtml({ ...good, mediaType: "image/jp2" }); return img(h).length === 0 && /data-crop-unshown/.test(h) && has(h, good.why); })());
ok("bytes that are not base64 are never put into the page", img(U.contentCropHtml({ ...good, bytes_base64: '"><script>x</script>' })).length === 0);
ok("ORIENTATION STATED: an answer that does not say upright (null) is drawn with the orientation UNDETERMINED",
  (() => { const h = U.contentCropHtml({ ...good, upright: null }); return img(h).length === 2 && /data-crop-upright="undetermined"/.test(h) && /g-unconf/.test(h); })());
ok("an answer that is not DERIVED is not drawn as a crop", img(U.contentCropHtml({ ...good, derived: false })).length === 0);

} catch (e) {
  /* A throw goes through no assertion; it is counted, so the tally never reads clean over a crash. */
  console.log(`  FAIL  the suite did not reach its foot: ${String(e && e.stack || e).slice(0, 600)}`); fail++;
} finally {
  console.log(`\ncontent-crop-surface: ${pass} pass, ${fail} fail`);
  for (const m of opened) await m.dispose();
}
if (fail) process.exit(1);
