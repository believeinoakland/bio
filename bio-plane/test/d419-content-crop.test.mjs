/* NEGATIVE CONTROL: (declared before arming; run on land/worker/D-419, figures filled in from the run)
   (a) BASELINE — nothing armed. MUST be green.
   (b) THE ROW'S NAMED ARM — "route to the whole page": the member's `handleCrop` answers the PAGE the extent names
       (`renderPageToPixels(bytes, extent.page, { allowTextPage: true })`) in place of `cropImage(bytes, extent)`,
       bundle rebuilt. MUST FAIL on `D-419 crop dimensions` BY NAME (and on the arms that read the same answer: the
       derived-crop arm, the bytes arm and the JPEG arm). MUST NOT move: the five C-99 refusal arms driven through
       stubs or with no member, the store's own refusals (NO_SUCH_CONTENT, NO_ID, FIXED_KEY_ONLY), the not-a-page-
       image arm, or the writes-nothing arm.
   Restore verified by sha256 AND `cmp` against a per-arm pristine copy of `pdf-worker/src/index.mjs` and of both
   bundle files.
   CONTROL RUN 2026-09-25 (figures as the suite printed them): (a) GREEN 18/0 · (b) RED 11/7, exit 1:
   `D-419 crop dimensions` FAILED BY NAME (want [2,2], got [null,null] — the whole-page route refused
   MULTIPLE_IMAGES_ON_PAGE, the page painting two images), with the derived-crop, bytes, JPEG and `why` arms, which
   read the same answer. TWO FAILS BEYOND THE DECLARATION, both reading the member's answer and so the declaration's
   error rather than the arm's, recorded rather than smoothed: the `store=bio` over-strictness arm (it compares the
   same crop) and the NO-RECTANGLE arm, whose code held (CROP_NOT_DERIVABLE, C-99.3) while the member's reason beside
   it moved from RECT_REQUIRED to MULTIPLE_IMAGES_ON_PAGE — the arm grades the member's reason, which is what a
   whole-page route changes. Every declared must-not HELD: the no-member, not-a-page-image, silent and mismatch
   arms, the three store refusals and both writes-nothing arms. Restored: `pdf-worker/src/index.mjs` 16,135 B,
   the bundle 2,470,797 B (sha256 bdb27670…) and its manifest 2,111 B, each `cmp`-identical to its pristine copy and
   sha256-verified; re-run GREEN 18/0.
 * =========================================================================
 * d419-content-crop.test.mjs — D-419. THE CROP OF A CITED PDF IMAGE, ASKED FOR.
 *
 * `EXTRACTION-BREADTH-DESIGN.md` §3.4: "The capture's bytes and the extent, verified as the capture is. The viewer
 * shows the crop; the crop is not the evidence." CPDF-18 built the crop (`pdf-worker/src/imagecrop.mjs`) and drove it
 * by name; nothing could ASK for it — no member route, no plane op. This suite drives the whole path a caller takes:
 * op=acquire -> op=pdfstructure -> op=promote (a leg citing an image `{page, rect}`) -> op=contentcrop, with the REAL
 * pdf-worker bundle bound as PDF_WORKER beside the plane (tier2-wire's two-worker shape), so the crop a caller reads
 * is the one the member cut from the bytes R2 holds.
 *
 * WHAT IT GRADES, each a different defect:
 *   1. the crop: derived, of the row's own extent, from the row's own capture, at the IMAGE's dimensions (the
 *      row's accepts-when), bytes that hash to what the answer says;
 *   2. every C-99 refusal by code, check and translation against the IMPORTED row, each reached the way a caller
 *      reaches it — no member bound, a row that is not a page image, a member that cannot crop the extent, a member
 *      that gives no answer, a member that answers a crop of other bytes;
 *   3. the content read's own grammar answering unchanged through this door (NO_SUCH_CONTENT, NO_ID,
 *      FIXED_KEY_ONLY), because the op reuses op=content's store route rather than a copy of it;
 *   4. writes nothing: the CAPTURES key set and the row itself are unchanged across every call.
 *
 * WHAT IT CANNOT SEE: it runs on Miniflare, not a deployed build (D-108). The D-15 gate (a row in a project the
 * caller cannot see answering exactly as an absent one) is op=content's store route, driven by `gate-reads.test.mjs`
 * and `content-reads.test.mjs`; this suite asserts only that the op goes through that route with the stamped
 * viewer, not the gate's behaviour again.
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { CONTENT_CROP_CHECKS } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const BUNDLE = fileURLToPath(new URL("../../pdf-worker/dist/pdf-worker.bundled.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const row = (code) => [code, CONTENT_CROP_CHECKS[code]?.check, CONTENT_CROP_CHECKS[code]?.translation];
const graded = (r) => [r.reason, r.check, r.translation];

/* ---- the fixture: ONE page painting TWO images, so a whole-page answer cannot pass for either crop ---- */
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
const plane = (member) => ({
  name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
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
  ...(member ? { serviceBindings: { PDF_WORKER: "pdf-worker" } } : {}),
});
const realMember = () => ({
  name: "pdf-worker", modules: true, modulesRoot: "/", scriptPath: BUNDLE, script: readFileSync(BUNDLE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  r2Buckets: ["CAPTURES"], bindings: { VERSION: "test" },
});
/* A stand-in member for the two C-99 conditions a correct member never produces. */
const stubMember = (script) => ({ name: "pdf-worker", modules: true, script, compatibilityDate: "2026-07-01" });
const SILENT = `export default { async fetch() { return new Response("<html>upstream error</html>", { status: 500 }); } };`;
const MISMATCH = `export default { async fetch() { return Response.json({ ok: true, derived: true, rendition: "crop",
  capture_sha256: "${"0".repeat(64)}", width: 2, height: 2, bytes_base64: "AECA/w==" }); } };`;

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

/* Builds the record every arm reads: the capture acquired, filed, and cited four ways. Returns the four row ids. */
async function seed(mf) {
  const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
  const post = async (op, body) => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}&token=${MEM}`, { method: "POST", body: JSON.stringify(body) })).json());
  let snap = 0;
  const promote = (id, text, type, reading) => {
    const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
    if (reading) {
      const prov = JSON.stringify({ documents: [reading] });
      files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
    }
    return post("promote", { bundleId: id, base: null,
      snapKey: `20260925T${String(100000 + (++snap)).slice(-6)}Z_${sha(id).slice(0, 8)}`,
      meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
              current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
      files, register: [] });
  };
  const acq = await (await mf.dispatchFetch(`http://x/api/?op=acquire&token=${MEM}`,
    { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov/d419.pdf", authority: "City of Oakland" }) })).json();
  const DOC = "INFO-2026-9419-crop";
  const pr = await promote(DOC, infoMd(DOC), "information", acq.document);
  const ids = {};
  let n = 0;
  for (const [key, leg] of [["grey", { kind: "image", page: 0, rect: GREY_RECT }],
                            ["jpeg", { kind: "image", page: 0, rect: JPG_RECT }],
                            ["pageImage", { kind: "image", page: 0 }],
                            ["document", {}]]) {
    const id = `INQ-2026-9419-l${++n}`;
    const r = await promote(id, inquiryMd(id, DOC, leg), "inquiry");
    ids[key] = r.content?.[0]?.content_id ?? null;
  }
  return { acquired: acq.document?.capture?.sha256 ?? null, promoted: pr.ok !== false, ids };
}
const crop = async (mf, qs, status = false) => {
  const res = await mf.dispatchFetch(`http://x/api/?op=contentcrop&token=${MEM}&${qs}`);
  const body = await res.json();
  return status ? [res.status, body] : body;
};

/* ===================== 1. THE CROP, THROUGH THE OP ======================= */
console.log("\n--- 1. op=contentcrop: a cited image extent returns its crop ---");
const mf = withSurfacingRun(new Miniflare({ workers: [plane(true), realMember()] }), [MEM]);
const S = await seed(mf);
t("the fixture was acquired as these bytes and filed", [S.acquired, S.promoted], [CAP, true]);
t("four content rows were minted (two image rects, a page-form image, a whole document)",
  Object.values(S.ids).every((x) => typeof x === "string" && /^[0-9a-f]{64}$/.test(x)), true);
const bucket = await mf.getR2Bucket("CAPTURES", "plane");
const keysBefore = (await bucket.list()).objects.map((o) => o.key).sort();
const rowBefore = await (await mf.dispatchFetch(`http://x/api/?op=content&token=${MEM}&id=${S.ids.grey}`)).json();

const [gStatus, g] = await crop(mf, `id=${S.ids.grey}`, true);
t("the grey image's row returns 200, a DERIVED crop of the row's own extent, from the row's own capture",
  [gStatus, g.ok, g.derived, g.rendition, g.of, g.content_id, g.capture_sha, g.capture_sha256],
  [200, true, true, "crop", { kind: "image", page: 0, rect: GREY_RECT }, S.ids.grey, CAP, CAP]);
t("D-419 crop dimensions: the cited image's own 2x2 — not the page, not the other image on it",
  [g.width, g.height], [2, 2]);
const gBytes = Buffer.from(g.bytes_base64 || "", "base64");
t("  the bytes handed back hash to the file_sha256 the answer states", [gBytes.length > 0, sha(gBytes)], [true, g.file_sha256]);
t("  and the answer says what it is not: the evidence is the capture plus the extent (§3.4)",
  /DERIVED rendition/.test(g.why || ""), true);
const j = await crop(mf, `id=${S.ids.jpeg}`);
t("the JPEG's row returns the publisher's own bytes, untouched, at its declared 40x30",
  [j.ok, j.route, j.mediaType, Buffer.from(j.bytes_base64 || "", "base64").equals(JPG), j.width, j.height],
  [true, "passthrough-dct", "image/jpeg", true, 40, 30]);
/* OVER-STRICTNESS: the plane's own namespace parameter, named as CLAUDE.md asks every call to name it, is the
   plane's and not the content read's grammar — it must not be refused as a predicate. */
const named = await crop(mf, `id=${S.ids.grey}&store=bio`);
t("naming the namespace explicitly (store=bio) is not a predicate: the same crop comes back",
  [named.ok, named.file_sha256, named.store], [true, g.file_sha256, "bio"]);

/* ===================== 2. C-99, BY NAME ================================== */
console.log("\n--- 2. every C-99 refusal, reached the way a caller reaches it ---");
const [dStatus, d] = await crop(mf, `id=${S.ids.document}`, true);
t("a WHOLE-DOCUMENT row -> 422 CROP_NOT_A_PAGE_IMAGE, graded against the catalogue row",
  [dStatus, ...graded(d), d.extent_kind], [422, ...row("CROP_NOT_A_PAGE_IMAGE"), "document"]);
const [pStatus, p] = await crop(mf, `id=${S.ids.pageImage}`, true);
t("an image row with NO rectangle -> 422 CROP_NOT_DERIVABLE, the member's own RECT_REQUIRED beside it",
  [pStatus, ...graded(p), p.member_reason], [422, ...row("CROP_NOT_DERIVABLE"), "RECT_REQUIRED"]);
{
  const bare = withSurfacingRun(new Miniflare({ workers: [plane(false)] }), [MEM]);
  const [s, r] = await crop(bare, `id=${"a".repeat(64)}`, true);
  t("no PDF member bound -> 501 CROP_NO_PDF_MEMBER, before any row is read", [s, ...graded(r)], [501, ...row("CROP_NO_PDF_MEMBER")]);
  await bare.dispose();
}
for (const [label, script, code, status] of [
  ["a member that gives no readable answer -> 502 CROP_MEMBER_SILENT", SILENT, "CROP_MEMBER_SILENT", 502],
  ["a member that answers a crop of OTHER bytes -> 502 CROP_CAPTURE_MISMATCH, and no picture is handed back",
   MISMATCH, "CROP_CAPTURE_MISMATCH", 502],
]) {
  const m = withSurfacingRun(new Miniflare({ workers: [plane(true), stubMember(script)] }), [MEM]);
  const s2 = await seed(m);
  const [s, r] = await crop(m, `id=${s2.ids.grey}`, true);
  t(label, [s, ...graded(r), "bytes_base64" in r], [status, ...row(code), false]);
  await m.dispose();
}

t("the five refusals above are C-99's five rows, in order, each with a sentence behind it",
  ["CROP_NO_PDF_MEMBER", "CROP_NOT_A_PAGE_IMAGE", "CROP_NOT_DERIVABLE", "CROP_MEMBER_SILENT", "CROP_CAPTURE_MISMATCH"]
    .map((c) => [CONTENT_CROP_CHECKS[c]?.check, (CONTENT_CROP_CHECKS[c]?.translation || "").length > 40]),
  [["C-99.1", true], ["C-99.2", true], ["C-99.3", true], ["C-99.4", true], ["C-99.5", true]]);

/* ===================== 3. THE CONTENT READ'S GRAMMAR, UNCHANGED ========== */
console.log("\n--- 3. the fixed-key read answers through this door in its own words ---");
const [nStatus, nx] = await crop(mf, `id=${sha("nothing-cites-this")}`, true);
t("an id nothing has cited -> 404 NO_SUCH_CONTENT", [nStatus, nx.ok, nx.reason], [404, false, "NO_SUCH_CONTENT"]);
const [iStatus, ni] = await crop(mf, "", true);
t("no id -> 400 NO_ID", [iStatus, ni.reason], [400, "NO_ID"]);
const [wStatus, w] = await crop(mf, `id=${S.ids.grey}&where=x`, true);
t("a predicate -> 400 FIXED_KEY_ONLY naming it, never ignored", [wStatus, w.reason, w.rejected], [400, "FIXED_KEY_ONLY", ["where"]]);

/* ===================== 4. WRITES NOTHING ================================= */
console.log("\n--- 4. writes nothing ---");
t("the CAPTURES key set is unchanged across every call above", (await bucket.list()).objects.map((o) => o.key).sort(), keysBefore);
const rowAfter = await (await mf.dispatchFetch(`http://x/api/?op=content&token=${MEM}&id=${S.ids.grey}`)).json();
t("the cited row reads byte-identically through op=content before and after", JSON.stringify(rowAfter), JSON.stringify(rowBefore));
await mf.dispose();

console.log(`\nd419-content-crop: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
