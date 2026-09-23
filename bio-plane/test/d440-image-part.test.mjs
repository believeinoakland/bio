/* NEGATIVE CONTROL: RUN 2026-09-23 by the D-440 worker, two arms, each editing ONE line of `checks/bio-checks.mjs` ALONE, declared before running, restored from a uniquely-named pristine copy verified by sha256 AND cmp (836,175 B, sha256 01a45ac60c58…, byte-identical after each). BASELINE 19 pass / 0 fail. (A) the row's arm — delete `if (notContainer) return refusal("CONTENT_EXTENT_NOT_A_CONTAINER", notContainer);`: DECLARED 6 must fail (section 1's four, section 5's op=cite refusal, section 6's first PURE row), 13 must hold — RAN 13 pass / 6 fail, exactly those six, the HTML arm failing BY NAME ("the image served BESIDE the page ... is REFUSED C-45.11"). (B) the liar's arm, refusing EVERY `{part}` — `partOutsideAnyContainer`'s guard reduced to `if (!container) return null;`: DECLARED 8 must fail (section 2's two, section 3's two, section 4's two, section 5's DOCX cite, section 6's first PURE row), 11 must hold — RAN 11 pass / 8 fail, exactly those eight, so a fence that refuses every part cannot pass this suite. */
/* D-440 — THE IMAGE ARM'S `{part}` IS A MEMBER OF A CONTAINER'S OWN BYTES, AND NOTHING ELSE
 * (EXTRACTION-BREADTH-DESIGN.md §3.2; CLIENT-RENDERED.md "DESIGNED 2026-09-21": an image served
 * beside a page is its own document).
 *
 * THE DEFECT: `checkContentExtent`'s image arm admitted a `{part}` whenever `coversImage` found no
 * image list — true of EVERY web page, PDF, text and data capture — and `mintContent` wrote the row
 * stating nothing, so a citation could claim an image "in" a page for bytes the page does not hold:
 * a subresource the page merely pointed at (which CAP-4 may even have REUSED from another fetch),
 * or any 64-hex string at all.
 *
 * WHAT IS DRIVEN, all through the op (miniflare, `op=acquire` -> `op=promote` / `op=cite`):
 *   1. an HTML capture whose `<img>` names an image served beside it: a `{part}` naming THAT image's
 *      own hash is REFUSED BY NAME (C-45.11, CONTENT_EXTENT_NOT_A_CONTAINER), the sentence pointing
 *      at acquiring the image as its own document — at promote AND through `op=cite`;
 *   2. HOW A LIAR PASSES: refusing every `{part}`. So a DOCX capture's own embedded image STILL MINTS,
 *      and a part the DOCX does not hold is still refused C-45.1 (the list bound is untouched);
 *   3. an office capture with NO persisted image list is ADMITTED, and the answer STATES it
 *      (`undetermined.level: image_list`) rather than returning a bare success;
 *   4. a capture whose kind the record does not hold (no format was projected — every capture promoted
 *      before this landing whose reading names no container) is admitted and STATED the same way
 *      (`container_kind`) — the undetermined arm skipped, never guessed in either direction.
 *
 * WHAT THIS CANNOT SEE, stated: the format is the provenance document's (`profile.format`), which is
 * the caller's, exactly as the reading and its image list are; this suite does not claim the store
 * re-sniffs bytes. A PDF capture is driven only PURE (section 6), because the wire's PDF path needs
 * the pdf fixture and the refusal is the same line with a different format key.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { checkContentExtent, imagePartUndetermined, CONTENT_EXTENT_CHECKS } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ---- a minimal zip assembler (fw19-extent-arms' own, trimmed) ----------- */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
const u16le = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]);
const u32le = (n) => Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameB = Buffer.from(f.name, "utf-8");
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, "utf-8");
    const comp = deflateRawSync(data);
    const crc = crc32(data);
    locals.push(Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(8), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length), u16le(nameB.length), u16le(0), nameB, comp]));
    centrals.push(Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(8), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), u16le(0), u16le(0), u16le(0), u32le(0), u32le(offset), nameB]));
    offset += locals[locals.length - 1].length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.concat([u32le(0x06054b50), u16le(0), u16le(0), u16le(files.length),
    u16le(files.length), u32le(cd.length), u32le(offset), u16le(0)]);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

/* ================= THE GROUND TRUTH ======================================= */
const PNG = Buffer.from("\x89PNG\r\n\x1a\nD-440 fixture: the map embedded IN the report", "latin1");
const SUB = Buffer.from("\x89PNG\r\n\x1a\nD-440 fixture: the map served BESIDE the web page", "latin1");
const PNG_SHA = sha(PNG), SUB_SHA = sha(SUB);
const ABSENT_SHA = sha("an image no container in this suite holds");

const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const para = (s) => `<w:p><w:r><w:t>${s}</w:t></w:r></w:p>`;
const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const docx = (words) => zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="${DOCX_CT}.main+xml"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
  { name: "word/document.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${W}><w:body>`
      + para("AGENDA REPORT") + para(words) + `</w:body></w:document>` },
  { name: "word/_rels/document.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>` },
  { name: "word/media/image1.png", data: PNG },
]);
const DOCX = docx("The map is attached.");
const DOCX_OLD = docx("A report acquired before the wire carried its image list.");
const HTML = `<!doctype html><html><head><title>District 3 budget</title></head><body>`
  + `<h1>District 3 budget</h1><p>The map below shows the transfers.</p>`
  + `<img src="/map.png" alt="map"></body></html>`;
const HTML2 = `<!doctype html><html><head><title>Notice</title></head><body><p>A notice.</p></body></html>`;

/* ===================== THE PLANE ======================================== */
const fetched = [];   /* every path the plane fetched, so the subresource walk is witnessed */
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d440", MEMBER_TOKEN: "mem-d440", PROBE_TOKEN: "prb-d440",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    fetched.push(u.pathname);
    const bin = (b, ct) => new Response(b, { headers: { "content-type": ct } });
    if (u.pathname === "/report.docx") return bin(DOCX, DOCX_CT);
    if (u.pathname === "/old-report.docx") return bin(DOCX_OLD, DOCX_CT);
    if (u.pathname === "/budget.html") return bin(HTML, "text/html");
    if (u.pathname === "/notice.html") return bin(HTML2, "text/html");
    if (u.pathname === "/map.png") return bin(SUB, "image/png");
    return new Response("unscripted", { status: 404 });
  },
}));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-d440") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-d440") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const acquire = async (path) => (await (await mf.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-d440",
  { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov" + path,
                                           authority: "City of Oakland" }) })).json());

const NOW = "2026-09-23T00:00:00Z";
const LATER = "2026-09-23T01:00:00Z";
const checks = (r) => (r.findings || []).map((f) => f.check).sort();
const fcodes = (r) => (r.findings || []).map((f) => f.code).sort();
const detail = (r) => (r.findings || []).map((f) => f.detail).join(" || ");
const inquiryMd = (id, { target = null, part = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(target ? ["references:", `  - target: ${target}`, "    rel: cites", "    status: confirmed"] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(target ? ["basis:", `  - target: ${target}`, "    role: supports",
                "    extent_kind: image", `    extent_part: ${part}`] : []),
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
let snapSeq = 0;
const promote = async (id, text, type, { document = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (document) {
    const prov = JSON.stringify({ documents: [document] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    bundleId: id, base: null,
    snapKey: `20260923T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files, register: [] });
};
const mustPromote = async (id, text, type, opts = {}) => {
  const r = await promote(id, text, type, opts);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};
let legSeq = 0;
const citePart = (target, part) => {
  const id = `INQ-2026-9440-l${++legSeq}`;
  return promote(id, inquiryMd(id, { target, part }), "inquiry");
};

/* ===================== 0. THE CAPTURES ================================== */
console.log("\n--- 0. four captures through op=acquire: a web page with an image beside it, a DOCX with one inside ---");
const pageAcq = await acquire("/budget.html");
const page = pageAcq.document;
const report = (await acquire("/report.docx")).document;
const old = structuredClone((await acquire("/old-report.docx")).document);
const notice = structuredClone((await acquire("/notice.html")).document);
t("the web page's profile records its FORMAT as html, and the DOCX's as docx (the fact the store projects)",
  [page?.profile?.format?.format, report?.profile?.format?.format], ["html", "docx"]);
/* The part cited below is the hash of the image the page's own `<img>` names, served at its own address.
   Whether this acquire's subresource walk fetched it is NOT asserted: measured on this fixture, the walk did
   not request `/map.png` inside the acquire call (`fetched` is printed), and nothing here rests on it — the
   refusal is about the PAGE's kind, which is why section 1 also refuses an arbitrary hash. */
console.log(`  (paths the plane fetched during the four acquires: ${JSON.stringify(fetched)})`);
t("the page was captured and its own bytes name the image beside it, which is served at its own address",
  [pageAcq.ok, HTML.includes('src="/map.png"')], [true, true]);
t("the DOCX's container extent lists its ONE embedded image by the fixture's own hash",
  (report?.reading?.container_extent?.images || []).map((x) => x.part), [PNG_SHA]);
/* The capture an office entry itemised BEFORE the wire carried images: its `images` level is taken
   out of the document exactly as a pre-FW-19 acquire wrote it (no `images` key, no `images` level). */
if (old?.reading?.container_extent) {
  delete old.reading.container_extent.images;
  old.reading.container_extent.levels = (old.reading.container_extent.levels || []).filter((l) => l !== "images");
}
/* A capture promoted before `capture_format` existed: its provenance document carried no profile the
   store read, and its reading (a page read as text) names no container. */
delete notice.profile;
t("the four fixtures are what they claim: the old DOCX has NO image list, the notice has NO profile and NO text_container",
  [Array.isArray(old?.reading?.container_extent?.images), "profile" in notice,
   typeof notice?.reading?.text_container], [false, false, "undefined"]);

const PAGE = "INFO-2026-9440-page", REPORT = "INFO-2026-9440-report";
const OLD = "INFO-2026-9440-old", NOTICE = "INFO-2026-9440-notice";
await mustPromote(PAGE, infoMd(PAGE), "information", { document: page });
await mustPromote(REPORT, infoMd(REPORT), "information", { document: report });
await mustPromote(OLD, infoMd(OLD), "information", { document: old });
await mustPromote(NOTICE, infoMd(NOTICE), "information", { document: notice });

/* ===================== 1. THE WEB PAGE ================================== */
console.log("\n--- 1. a {part} on a web page is REFUSED BY NAME, pointing at acquiring the image ---");
const onPage = await citePart(PAGE, SUB_SHA);
t("the image served BESIDE the page, cited as a {part} of the page, is REFUSED C-45.11 "
  + "CONTENT_EXTENT_NOT_A_CONTAINER — nothing minted",
  [onPage.ok, checks(onPage), fcodes(onPage), onPage.content ?? null],
  [false, ["C-45.11"], ["CONTENT_EXTENT_NOT_A_CONTAINER"], null]);
t("    and the sentence names the page's format and says the image is its own document to acquire and cite whole",
  [/this capture is a html document, not an office container/.test(detail(onPage)),
   /An image served beside a page is its OWN document: acquire it at its own address and cite that document whole/
     .test(detail(onPage))],
  [true, true]);
const onPageAny = await citePart(PAGE, ABSENT_SHA);
t("ANY 64-hex part on the page is refused the same way — the fence is the document's kind, not the hash",
  [onPageAny.ok, checks(onPageAny)], [false, ["C-45.11"]]);
t("    and the refusal's canned translation is the family row's, telling a member to capture the image itself",
  (onPage.findings || [])[0]?.translation === CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_NOT_A_CONTAINER.translation
    && /capture it at its own address as its own document/.test(CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_NOT_A_CONTAINER.translation),
  true);

/* ===================== 2. THE CONTAINER STILL MINTS ===================== */
console.log("\n--- 2. HOW A LIAR PASSES is refusing every {part}: the DOCX's own image must still mint ---");
const onDoc = await citePart(REPORT, PNG_SHA);
t("the image the DOCX HOLDS mints as an image row, and the answer carries NO undetermined statement (it was checked)",
  [onDoc.ok, onDoc.content?.[0]?.extent_kind, onDoc.content?.[0]?.minted, "undetermined" in (onDoc.content?.[0] || {})],
  [true, "image", true, false]);
const onDocAbsent = await citePart(REPORT, ABSENT_SHA);
t("a part the DOCX does NOT hold is still refused C-45.1 by the list bound — D-440 did not move it",
  [onDocAbsent.ok, checks(onDocAbsent), /holds 1 image\(s\) and none of them has the content hash/.test(detail(onDocAbsent))],
  [false, ["C-45.1"], true]);

/* ===================== 3. OFFICE, NO LIST: ADMITTED, STATED ============= */
console.log("\n--- 3. an office capture with no persisted image list is ADMITTED as undetermined, STATED ---");
const onOld = await citePart(OLD, ABSENT_SHA);
t("a part on the DOCX whose image list was never recorded MINTS, and says `undetermined.level: image_list`",
  [onOld.ok, onOld.content?.[0]?.extent_kind, onOld.content?.[0]?.minted, onOld.content?.[0]?.undetermined?.level],
  [true, "image", true, "image_list"]);
t("    and its sentence says the part could not be checked and was admitted rather than guessed",
  /office container and this record holds no list of its embedded images.*UNDETERMINED, admitted and stated/
    .test(onOld.content?.[0]?.undetermined?.why || ""), true);

/* ===================== 4. KIND NOT HELD: ADMITTED, STATED =============== */
console.log("\n--- 4. a capture whose kind the record does not hold is admitted, and says so ---");
const onNotice = await citePart(NOTICE, ABSENT_SHA);
t("a part on a capture with no projected format and no container in its reading MINTS with "
  + "`undetermined.level: container_kind` — skipped, never guessed either way",
  [onNotice.ok, onNotice.content?.[0]?.minted, onNotice.content?.[0]?.undetermined?.level],
  [true, true, "container_kind"]);
t("    and the sentence says WHICH absence it is (no format recorded), not merely that something is missing",
  /does not hold this capture's format/.test(onNotice.content?.[0]?.undetermined?.why || ""), true);

/* ===================== 5. THROUGH op=cite =============================== */
console.log("\n--- 5. op=cite carries the same refusal at the act ---");
const select = async (ids) => (await post("select", { ids }, "mem-d440")).handle;
const CITER = "INQ-2026-9440-citer";
await mustPromote(CITER, inquiryMd(CITER), "inquiry");
const viaCite = await get("cite", `project=${CITER}&handle=${await select([PAGE])}&role=supports`
  + `&extent_kind=image&extent_part=${SUB_SHA}&extent_cited_as=bytes`);
t("citing the page's served image as a {part} through op=cite is REFUSED, naming the code",
  [viaCite.ok, JSON.stringify(viaCite).includes("CONTENT_EXTENT_NOT_A_CONTAINER")], [false, true]);
const CITER2 = "INQ-2026-9440-citer2";
await mustPromote(CITER2, inquiryMd(CITER2), "inquiry");
const viaCiteDoc = await get("cite", `project=${CITER2}&handle=${await select([REPORT])}&role=supports`
  + `&extent_kind=image&extent_part=${PNG_SHA}`);
t("    while the DOCX's own image is cited through the act and accepted",
  [viaCiteDoc.ok, viaCiteDoc.reason ?? null], [true, null]);

await mf.dispose();

/* ===================== 6. PURE ========================================== */
console.log("\n--- 6. the checker's three values, pure ---");
const img = { kind: "image", part: PNG_SHA };
t("PURE: office:false (pdf) refuses C-45.11 and points at page+rect; office:true with a list defers to it; "
  + "office:null admits; the document-only pass (known:false) admits",
  [checkContentExtent(img, { container: { office: false, format: "pdf" } })?.check,
   /addressed by its page and rect/.test(checkContentExtent(img, { container: { office: false, format: "pdf" } })?.detail || ""),
   checkContentExtent(img, { chain: null, container: { office: true, images: [{ part: PNG_SHA }] } }),
   checkContentExtent(img, { chain: null, container: { office: null } }),
   checkContentExtent(img, { known: false, container: { office: false } })],
  ["C-45.11", true, null, null, null]);
t("PURE: a {page} image is untouched by the container fence on a non-container capture",
  checkContentExtent({ kind: "image", page: 0 }, { chain: null, pageCount: 2, container: { office: false, format: "pdf" } }),
  null);
t("PURE: imagePartUndetermined states image_list, container_kind, and nothing when the list bound was checked",
  [imagePartUndetermined(img, { container: { office: true, images: null } })?.level,
   imagePartUndetermined(img, { container: { office: null } })?.level,
   imagePartUndetermined(img, { container: null })?.level,
   imagePartUndetermined(img, { container: { office: true, images: [] } }),
   imagePartUndetermined({ kind: "image", page: 0 }, { container: { office: null } })],
  ["image_list", "container_kind", "container_kind", null, null]);

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
