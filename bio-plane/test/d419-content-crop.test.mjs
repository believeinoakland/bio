/* d419-content-crop.test.mjs — D-419 / content R32. THE CROP OF A CITED PDF IMAGE, ASKED FOR THROUGH THE PLANE.
 *
 * REWRITTEN 2026-09-27 (T5-12, legacy-tests) from `land/worker/D-419` @ 914bb380fe, not landed as that branch wrote
 * it. The branch's suite drove an INDEX-SIDE crop: op=contentcrop resolved the row through op=content's store route
 * and then asked the PDF member (`PDF_WORKER`) to cut it, grading C-99's five refusals from `CONTENT_CROP_CHECKS`
 * (CROP_NO_PDF_MEMBER, CROP_MEMBER_SILENT among them) and op=content's query grammar (NO_ID, FIXED_KEY_ONLY). Content
 * replaced that design with `cropOf` (content R32, `src/content/index.mjs`): the store reads the row itself, reads the
 * capture's bytes from the evidence store (record-core R38) and cuts in-process through pdf-pixels
 * (`pdf-worker/src/imagecrop.mjs`), refusing CROP_NOT_A_PAGE_IMAGE, CROP_NO_EVIDENCE_STORE, CROP_CAPTURE_NOT_HELD,
 * CROP_NOT_DERIVABLE and CROP_CAPTURE_MISMATCH as `reason`s. There is no member, no `CONTENT_CROP_CHECKS` and no
 * op=content grammar at this door any more, so those arms have no subject and are RETIRED with the design. Every
 * refusal is driven at the module's interface by `test/m/content/crop.test.mjs` (R32), and is not repeated here.
 *
 * WHAT THIS SUITE ADDS, which the module test cannot see: the PLANE's half, now that T5-11 (LEGACY-INDEX #3) routes
 * op=contentcrop (OPS read on `content`'s cut, viewer-stamped beside op=content):
 *   1. the whole path a caller takes — op=acquire -> op=promote (legs citing image extents) -> op=contentcrop — cuts
 *      the cited image from the bytes op=acquire put in the evidence store, bound in the Durable Object: a derived
 *      rendition of the row's own extent from the row's own capture, at the IMAGE's dimensions (not the page's, not
 *      the other image the page paints), saying it is derived;
 *   2. the refusals a caller reaches through the plane (CROP_NOT_A_PAGE_IMAGE, CROP_NOT_DERIVABLE with pdf-pixels'
 *      RECT_REQUIRED beside it, NO_SUCH_CONTENT for an id nothing cites);
 *   3. THE STAMP (content R32's "invisible row is NO_SUCH_CONTENT", K102/R33): the caller's own `viewer=` is
 *      overwritten by the session's, and the store route with no viewer fails closed — NO_SUCH_CONTENT, byte for
 *      byte the answer for an id nothing cites. (viewerPredicate filters project bundles only and a content row is
 *      in an information bundle, so a recognised member sees every row: the gate the plane can show is the stamp
 *      and the fail-closed arm; `gate-reads.test.mjs` classifies the op GATED for op=content's reason.)
 *   4. writes nothing: the CAPTURES key set and the cited row are unchanged across every call.
 * The fixture is D-419's: ONE page painting TWO images, so a whole-page answer cannot pass for either crop.
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { registerFile } from "./register-doc.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ---- the fixture: ONE page painting TWO images (D-419's) ---- */
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
const JPG = Buffer.from("\xff\xd8\xff\xe0D-419 fixture: a parcel map\xff\xd9", "latin1");
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

const MEM = "mem-d419";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "test", ADMIN_TOKEN: "adm-d419", MEMBER_TOKEN: MEM, PROBE_TOKEN: "prb-d419",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    if (new URL(request.url).pathname === "/d419.pdf")
      return new Response(IMAGES_PDF, { headers: { "content-type": "application/pdf" } });
    return new Response("unscripted", { status: 500 });
  },
}), [MEM]);

const NOW = "2026-09-25T00:00:00Z", LATER = "2026-09-25T01:00:00Z";
const LEG_KEYS = { kind: "extent_kind", page: "extent_page", rect: "extent_rect" };
const inquiryMd = (id, target, leg) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", `  - target: ${target}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${target}`, "    role: supports",
  ...Object.entries(LEG_KEYS).filter(([k]) => leg[k] !== undefined)
    .map(([k, f]) => `    ${f}: ${Array.isArray(leg[k]) ? `[${leg[k].join(", ")}]` : leg[k]}`),
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

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${MEM}`, { method: "POST", body: JSON.stringify(body) })).json());

/* The record every arm reads: the capture acquired, filed, and cited four ways. */
let snap = 0;
const promote = (id, text, type, reading) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
    /* K121 (provenance at the write, T4): the register names the capture's file, so the bundle carries it. */
    files.push(registerFile(reading));
  }
  /* The meta names no title: the D-419 branch sent `Bundle <id>`, which promotion's C-86.3 (ENVELOPE_TITLE_DISAGREES,
     PROMOTION's check since T4) now refuses against the document's own title; the record goes by the document. */
  return post("promote", { bundleId: id, base: null,
    snapKey: `20260925T${String(100000 + (++snap)).slice(-6)}Z_${sha(id).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files, register: [] });
};
const acq = await (await mf.dispatchFetch(`http://x/api/?op=acquire&token=${MEM}`,
  { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov/d419.pdf", authority: "City of Oakland" }) })).json();
const DOC = "INFO-2026-9419-crop";
const pr = await promote(DOC, infoMd(DOC), "information", acq.document);
const ids = {};
{
  let n = 0;
  for (const [key, leg] of [["grey", { kind: "image", page: 0, rect: GREY_RECT }],
                            ["jpeg", { kind: "image", page: 0, rect: JPG_RECT }],
                            ["pageImage", { kind: "image", page: 0 }],
                            ["document", {}]]) {
    const id = `INQ-2026-9419-l${++n}`;
    const r = await promote(id, inquiryMd(id, DOC, leg), "inquiry");
    ids[key] = r?.content?.[0]?.content_id ?? null;
  }
}
const crop = async (qs, tok = MEM) => {
  const res = await mf.dispatchFetch(`http://x/api/?op=contentcrop&token=${tok}&${qs}`);
  const body = await res.json();
  return [res.status, rP(body)];
};
/* The crop's bytes as the answer carries them. MEASURED 2026-09-27: `cropOf` returns pdf-pixels' `bytes` as a
   Uint8Array and nothing on the way out encodes it, so the JSON answer carries an index-keyed object
   ({"0":137,"1":80,…}); D-419's member answered `bytes_base64`. Reported to content (R32) rather than pinned: this
   reads the octets from base64, an array or that object alike, so the suite grades the crop, not the encoding. */
const octets = (b) => typeof b === "string" ? Buffer.from(b, "base64")
  : Array.isArray(b) ? Buffer.from(b) : b && typeof b === "object" ? Buffer.from(Object.values(b)) : Buffer.alloc(0);

/* ===================== 1. THE CROP, THROUGH THE OP ======================= */
console.log("\n--- 1. op=contentcrop: a cited image extent returns its crop (R32) ---");
t("FIXTURE: the document was acquired as these bytes and filed", [acq.document?.capture?.sha256 ?? null, pr?.ok !== false],
  [CAP, true]);
t("FIXTURE: four content rows were minted (two image rects, a page-form image, a whole document)",
  Object.values(ids).every((x) => typeof x === "string" && /^[0-9a-f]{64}$/.test(x)), true);
const bucket = await mf.getR2Bucket("CAPTURES");
const keysBefore = (await bucket.list()).objects.map((o) => o.key).sort();
const rowBefore = await (await mf.dispatchFetch(`http://x/api/?op=content&token=${MEM}&id=${ids.grey}`)).json();

const [gStatus, g] = await crop(`id=${ids.grey}`);
t("the grey image's row: a DERIVED crop of the row's own extent, from the row's own capture",
  [gStatus, g.ok, g.derived, g.rendition, g.of, g.content_id, g.capture_sha, g.capture_sha256],
  [200, true, true, "crop", { kind: "image", page: 0, rect: GREY_RECT }, ids.grey, CAP, CAP]);
t("D-419 crop dimensions: the cited image's own 2x2 — not the page, not the other image on it",
  [g.width, g.height], [2, 2]);
const gBytes = octets(g.bytes);
t("  the bytes handed back hash to the file_sha256 the answer states", [gBytes.length > 0, sha(gBytes)], [true, g.file_sha256]);
t("  and the answer says what it is not: a derived rendition, not evidence (§3.4)",
  [/derived rendition/i.test(g.says || ""), /not itself evidence/.test(g.says || "")], [true, true]);
const [, j] = await crop(`id=${ids.jpeg}`);
t("the JPEG's row returns the publisher's own bytes, untouched, at its declared 40x30",
  [j.ok, j.route, j.mediaType, octets(j.bytes).equals(JPG), j.width, j.height],
  [true, "passthrough-dct", "image/jpeg", true, 40, 30]);

/* ===================== 2. THE REFUSALS A CALLER REACHES ================== */
console.log("\n--- 2. the refusals a caller reaches through the plane (R32) ---");
const [, d] = await crop(`id=${ids.document}`);
t("a WHOLE-DOCUMENT row -> CROP_NOT_A_PAGE_IMAGE, naming its extent kind",
  [d.ok, d.reason, d.content_id, d.extent_kind], [false, "CROP_NOT_A_PAGE_IMAGE", ids.document, "document"]);
const [, p] = await crop(`id=${ids.pageImage}`);
t("an image row with NO rectangle -> CROP_NOT_DERIVABLE, pdf-pixels' own RECT_REQUIRED beside it, derived",
  [p.ok, p.reason, p.pdf_pixels_reason, p.derived, "bytes" in p], [false, "CROP_NOT_DERIVABLE", "RECT_REQUIRED", true, false]);
const [, nx] = await crop(`id=${sha("nothing-cites-this")}`);
t("an id nothing has cited -> NO_SUCH_CONTENT", [nx.ok, nx.reason], [false, "NO_SUCH_CONTENT"]);

/* ===================== 3. THE STAMP ===================================== */
console.log("\n--- 3. the viewer is the plane's, and an absent one fails closed ---");
/* A caller-supplied viewer that compiles to DENY: honoured, it would answer NO_SUCH_CONTENT. The plane overwrites
   it with the credential's own, so the same crop comes back. */
const [, forged] = await crop(`id=${ids.grey}&viewer=${encodeURIComponent("member:no-such-person")}`);
t("a caller's own viewer= is overwritten by the plane's: the same crop comes back",
  [forged.ok, forged.file_sha256], [true, g.file_sha256]);
const ns = await mf.getDurableObjectNamespace("STORE");
const st = ns.get(ns.idFromName("bio"));
const storeCrop = async (qs) => (await (await st.fetch(`http://x/contentcrop?${qs}`)).json()) || {};
const unstamped = await storeCrop(`id=${ids.grey}`);
const absentAtStore = await storeCrop(`id=${sha("nothing-cites-this")}`);
t("the store route with NO viewer fails closed: NO_SUCH_CONTENT", [unstamped.result?.ok, unstamped.result?.reason],
  [false, "NO_SUCH_CONTENT"]);
t("  byte for byte as an id nothing cites (the id itself aside)",
  JSON.stringify({ ...unstamped.result, target: null }), JSON.stringify({ ...absentAtStore.result, target: null }));
const machineAtStore = await storeCrop(`id=${ids.grey}&viewer=${encodeURIComponent("class:member")}`);
t("  (the control: the same store call with a viewer is served)", [machineAtStore.result?.ok, machineAtStore.result?.file_sha256],
  [true, g.file_sha256]);

/* ===================== 4. WRITES NOTHING ================================= */
console.log("\n--- 4. writes nothing ---");
t("the CAPTURES key set is unchanged across every call above", (await bucket.list()).objects.map((o) => o.key).sort(), keysBefore);
const rowAfter = await (await mf.dispatchFetch(`http://x/api/?op=content&token=${MEM}&id=${ids.grey}`)).json();
t("the cited row reads byte-identically through op=content before and after", JSON.stringify(rowAfter), JSON.stringify(rowBefore));
await mf.dispose();

console.log(`\nd419-content-crop: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
