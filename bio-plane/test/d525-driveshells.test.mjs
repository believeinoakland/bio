/* NEGATIVE CONTROL: re-run in one step with `node test/d525-driveshells.control.mjs` (or one arm, `... e`). SEVEN rows — SIX ARMS PLUS A BASELINE — run 2026-09-24 on land/worker/D-525 over origin/main 9f8b69e6, each armed ALONE with every other defence held open, each patch required to match EXACTLY ONCE, pristine copies in a fresh `d525-control-*` directory OUTSIDE the worktree and every restore verified by sha256 AND by content with the byte count printed and floored (drive.mjs 29125 B f68ef67c…, index.mjs 834309 B 642b902f…, all MATCH/IDENTICAL; `sha256sum -c` over both after the run: OK). Declared before arming. (a) BASELINE, nothing armed: MUST pass — 38/0. (b) THE ROW'S OWN CONTROL, THE RE-ACQUIRE SKIPPED (D525_SKIP_REACQUIRE=1, no source edit): DECLARED red at ACCEPTS-WHEN (2); ACTUAL 32/4, the two-tick arm reading **["modified","modified"]** compared **["raw","raw"]** — the permanent cry-wolf, by name — with the sweep still naming A and the pin reading the shell's sha. (c) THE CLASSIFIER BLIND TO THE PLANE'S RETRIEVAL RECORD (`fromPage` never true): DECLARED red at "A rests on the plane's own record"; ACTUAL 36/2 — and A is STILL FOUND, on the register alone, which is why that arm asserts WHICH fact a verdict rests on; D's contradiction loses its second fact with it. (d) A RECORDED SHELL SCORED AS AN EXPORT: DECLARED red at ACCEPTS-WHEN (1); first run 32/6, and THE FINDING ABOUT THE INSTRUMENT, recorded rather than smoothed: the C pin read `export[0]` BY POSITION, so with A mis-scored as an export it compared C's monitor baseline with A's and failed for a reason not its own. Corrected to find C by bundle id; re-run 33/5, every failure the arm's own. (e) THE BASELINE-ROW RULE DRIFTS FROM op=monitor's (document-address row preferred): DECLARED red at THE PIN after the remedy; ACTUAL 36/2 — the behavioural pin that stands in for shared code (drive.mjs says why) is load-bearing. (f) THE D-15 STAMP DROPPED from op=driveshells in index.mjs: DECLARED red at ACCEPTS-WHEN (1); ACTUAL 23/15 — the store, handed no viewer, fails closed and the sweep names nothing. (g) OVER-STRICTNESS, the declared-type test respelled (split/trim/lowercase against a list): MUST PASS — 38/0. RE-RUN 2026-09-25 after the sweep was PAGED (LIMIT cap+1, keyset cursor, `truncated`) and its accumulators named, which changed the subject and so re-arms every control (CLAUDE.md §5): the suite is 41 assertions (the paging arm adds 3); (a) 41/0, (b) 35/4 reading ["modified","modified"], (c) 39/2, (d) 36/5, (e) 39/2, (f) 25/16, (g) 41/0 — 7 of 7 AS DECLARED, every restore MATCH/IDENTICAL (drive.mjs 29125 B f68ef67c…, index.mjs 834309 B 642b902f…). The over-ask ceiling arm, added afterwards for `bounds.test.mjs`'s DRIVEN_ELSEWHERE bar with no change to the subject, makes the clean suite 42/0. */
/* D-525 — WHICH DRIVE-LINKED BUNDLES HOLD A BASELINE OF GOOGLE'S SHELL, AND THE RE-ACQUIRE THAT FIXES ONE.
 *
 * THE DEFECT (found by D-472's worker, F3). Before CAP-8 (2026-09-14) `op=acquire`
 * fetched a Drive link ITSELF and filed Google's client-rendered application page
 * as the capture. D-472 made `op=monitor` fetch the OpenDocument export; against a
 * shell baseline those bytes can never agree, so such a bundle reads `modified` on
 * EVERY tick, permanently — and nothing listed which bundles carry one.
 *
 * WHAT THIS SUITE DRIVES, all through the ops (a store-level test is not evidence
 * a caller can reach the feature):
 *   1. `op=driveshells` names EVERY shell baseline in a corpus built to contain
 *      each shape the classifier must tell apart — a shell the plane RECORDED
 *      fetching from the document address, a shell known from the register alone,
 *      a CAP-8 export, a contradiction, a folder, an unbaselined Drive document and
 *      a document that is not on Drive at all — and scores each one exactly once.
 *   2. THE PIN THAT KEEPS THE SWEEP HONEST: for every bundle it judges, the sha the
 *      sweep calls the baseline is the sha `op=monitor` itself compares against.
 *      The sweep does not share the monitor's lookup code (D-524 is changing it in
 *      the same hour; `drive.mjs` says why), so this is what fails if they drift.
 *   3. THE DEFECT, WITNESSED: a shell baseline left alone reads `modified` on two
 *      ticks of an unchanged document.
 *   4. THE REMEDY, DRIVEN (the accepts-when): `op=acquire` on the document address
 *      fetches the export and files a NEW capture; the old capture, its register
 *      row and the plane's retrieval record of it are all still there afterwards;
 *      the sweep no longer names the bundle; and two ticks read `unchanged`.
 *
 * HOW THE PRE-CAP-8 BASELINE IS MADE, since the plane can no longer make one. The
 * shell's bytes go in through `op=capture` (bytes only, no retrieval record). The
 * plane's RETRIEVAL RECORD is written through the store's own
 * `recordcapturedlocator` route with exactly the arguments the pre-CAP-8 acquire
 * passed — `git show e310c51d4^:bio-plane/src/index.mjs`: `address: res.url ||
 * locator`, `retrievalLocator: locator`, `via: "direct"` — the document address in
 * both. The register row is a real acquire answer for the same shell served from a
 * non-Drive fixture address, re-pointed at the Drive document and at the uploaded
 * bytes, so its profile is the one the plane's own profiler writes for that shell.
 *
 * WHAT THIS SUITE CANNOT SEE, STATED: it cannot see GOOGLE, nor the real record.
 * Every byte is this file's. How many bundles on a live instance carry a shell
 * baseline is a live read of `op=driveshells`, reported by the item, never here.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
/* The recogniser, read so the suite drives the export address the plane composes.
   The EXPECTED export address is still written out once as a literal below, so the
   suite is not asking the recogniser and agreeing with it. */
import { readDriveAddress } from "../src/drive.mjs";
import { ODS_CONTENT_TYPE } from "../src/odf.mjs";
/* The plane's own normaliser: `captured_locators` is keyed on it, and a hand copy
   would write a key the plane never reads. */
import { normalizeAddress } from "../src/subresources.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* ---- independent crc32 + zip assembler (the monitor-assess.test.mjs pattern) ---- */
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
    const method = f.store ? 0 : 8;
    const comp = method === 8 ? deflateRawSync(data) : data;
    const crc = crc32(data);
    locals.push(Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length), u16le(nameB.length), u16le(0), nameB, comp]));
    centrals.push(Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), u16le(0), u16le(0), u16le(0), u32le(0), u32le(offset), nameB]));
    offset += locals[locals.length - 1].length;
  }
  const cd = Buffer.concat(centrals);
  return new Uint8Array(Buffer.concat([...locals, cd, Buffer.concat([
    u32le(0x06054b50), u16le(0), u16le(0), u16le(files.length), u16le(files.length),
    u32le(cd.length), u32le(offset), u16le(0)])]));
}
const ODS_NS = 'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" '
  + 'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" '
  + 'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"';
/* One substance per sheet, and a conversion stamp (meta.xml) that moves on every
   export — Google's measured behaviour, and what makes `unchanged` cost something. */
const sheetExport = (label, n) => zip([
  { name: "mimetype", data: ODS_CONTENT_TYPE, store: true },
  { name: "META-INF/manifest.xml", data: `<?xml version="1.0" encoding="UTF-8"?>`
    + `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">`
    + `<manifest:file-entry manifest:full-path="/" manifest:media-type="${ODS_CONTENT_TYPE}"/></manifest:manifest>` },
  { name: "content.xml", data: `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${ODS_NS} `
    + `office:version="1.3"><office:body><office:spreadsheet><table:table table:name="${label}"><table:table-row>`
    + `<table:table-cell office:value-type="string"><text:p>${label} budget line</text:p></table:table-cell>`
    + `</table:table-row></table:table></office:spreadsheet></office:body></office:document-content>` },
  { name: "meta.xml", data: `<?xml version="1.0" encoding="UTF-8"?><office:document-meta `
    + `xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/">`
    + `<office:meta><dc:date>2026-09-24T0${n % 10}:00:00</dc:date></office:meta></office:document-meta>` },
]);
/* GOOGLE'S APPLICATION SHELL, rebuilt per render. */
const shellBody = (label, n) => '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + label
  + '</title></head><body><div id="docs-editor"></div><script>window.DOCS_timing={sid:"render-' + n
  + '"};</script></body></html>';

const ids = { A: "1d525ShellRecordedAAAAAAAAAAAAAAAAAA", B: "1d525ShellRegisterOnlyBBBBBBBBBBBBBBB",
              C: "1d525ExportCaptureCCCCCCCCCCCCCCCCCC", D: "1d525ContradictionDDDDDDDDDDDDDDDDDD",
              G: "1d525NoBaselineGGGGGGGGGGGGGGGGGGGGGG" };
const docOf = (k) => `https://docs.google.com/spreadsheets/d/${ids[k]}/edit`;
const exportOf = (k) => (readDriveAddress(docOf(k)) || {}).exportAddress || null;
const FOLDER = "https://drive.google.com/drive/folders/1d525FolderAAAAAAAAAAAAAAAAAAAAA";
const LEGISTAR = "https://oakland.legistar.com/d525/NotDrive.aspx";
const LEGACY = "https://legacy-fixture.example/d525/shell";   // a NON-Drive address serving the shell

const asked = [];
let seq = 0;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-525", MEMBER_TOKEN: "mem-525", PROBE_TOKEN: "prb-525", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    asked.push(u.host + u.pathname + u.search);
    if (u.hostname === "docs.google.com" || u.hostname === "drive.google.com") {
      const m = /^\/spreadsheets\/d\/([^/]+)\/export$/.exec(u.pathname);
      if (m && u.searchParams.get("format") === "ods")
        return new Response(sheetExport(m[1], ++seq), { headers: { "content-type": ODS_CONTENT_TYPE } });
      return new Response(shellBody(u.pathname, ++seq), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (u.href === LEGACY) return new Response(shellBody("legacy", ++seq), { headers: { "content-type": "text/html; charset=utf-8" } });
    if (u.href === LEGISTAR) return new Response("<html><body><p>a Legistar page</p><a href=\"/x\">x</a></body></html>",
      { headers: { "content-type": "text/html; charset=utf-8" } });
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const P = async (op, b) => (await mf.dispatchFetch(`http://x/api/?op=${op}&token=mem-525&store=scratch`,
  { method: "POST", body: JSON.stringify(b) })).json();
const G = async (q, tok = "mem-525") => (await mf.dispatchFetch(`http://x/api/?token=${tok}&store=scratch&${q}`)).json();
const upload = async (bytes) => {
  const s = sha(bytes);
  const r = await (await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-525&store=scratch&sha256=${s}`,
    { method: "POST", body: bytes })).json();
  return { sha: s, ok: r.ok === true, bytes: bytes.length };
};
const ns = await mf.getDurableObjectNamespace("STORE");
const store = ns.get(ns.idFromName("scratch"));
/* The pre-CAP-8 acquire's retrieval record, exactly as that code wrote it. */
const recordPreCap8 = async (address, captureSha, retrieved) => (await store.fetch("http://x/recordcapturedlocator", {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ address, addressNorm: normalizeAddress(address), captureSha, retrieved,
                         via: "direct", retrievalLocator: address }) })).json();

const NOW = "2026-09-24T00:00:00Z";
const bundleMd = (id, locator) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@2",
  `title: "Drive ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", `  locator: ${locator}`, "  authority: City Clerk", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: true", "  frequency: weekly", "  last_checked: null", "---", "",
  "## Summary", "", "A Drive-linked document.", "", "## Provenance Notes", "",
  "## Session Log", "", "### Session 1", "", "Captured.", "", "## Review Notes", "",
].join("\n");
let bseq = 0;
/* Promote a bundle holding `docs` (register rows) and their capture files. */
const promote = async (id, locator, docs, base = null) => {
  const md = base ? base.md : bundleMd(id, locator);
  const prov = JSON.stringify({ documents: docs });
  const files = [{ path: "bundle.md", text: md, bytes: Buffer.byteLength(md), sha256: sha(md) },
                 { path: "data/provenance.json", text: prov, bytes: Buffer.byteLength(prov), sha256: sha(prov) }];
  const register = [];
  for (const d of docs) {
    files.push({ path: d.file, blobSha: d.capture.sha256, sha256: d.capture.sha256, bytes: d.capture.bytes });
    register.push({ sha256: d.capture.sha256, path: d.file, encoding: "binary", bytes: d.capture.bytes });
  }
  const r = await P("promote", {
    bundleId: id, base: base ? base.sha : null, snapKey: `20260924T000000Z_d525${String(++bseq).padStart(4, "0")}`,
    author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Drive ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files, register });
  const ok = r.ok !== false && (r.result ? r.result.ok !== false : true);
  if (!ok) console.log(`    PROMOTE REFUSED ${id}: ${JSON.stringify(r).slice(0, 400)}`);
  return ok;
};
const idOf = (k) => `INFO-2026-95${String(Object.keys(ids).indexOf(k) + 10)}-d525-${k.toLowerCase()}`;
const sweep = async () => (await G("op=driveshells")).result || {};
const names = (list) => (list || []).map((e) => e.bundle).sort();

console.log("\n--- the recogniser is live, and the fixture is what it says ---");
t("THE RECOGNISER IS LIVE — sheet A composes its export address",
  exportOf("A"), `https://docs.google.com/spreadsheets/d/${ids.A}/export?format=ods`);
{
  const a = sheetExport("x", 1), b = sheetExport("x", 2);
  t("two exports of one sheet are two raw shas (the envelope moves, the substance does not)", sha(a) === sha(b), false);
}

console.log("\n--- building the corpus: one bundle per shape the sweep must tell apart ---");
/* A template register row: a REAL acquire answer for the shell, from a non-Drive address. */
const tpl = (await P("acquire", { locator: LEGACY, authority: "City Clerk" })).document;
t("the shell template acquired (a real profile of Google's page, from the plane's own profiler)",
  [!!tpl, tpl?.profile?.format?.format, tpl?.capture?.content_type?.split(";")[0]], [true, "html", "text/html"]);
const shellRow = async (k, n) => {
  const bytes = Buffer.from(shellBody(`/spreadsheets/d/${ids[k]}/edit`, 900 + n));
  const up = await upload(bytes);
  return { ...tpl, locator: docOf(k), file: `sources/d525-${k.toLowerCase()}-shell.html`,
           capture: { ...tpl.capture, sha256: up.sha, bytes: up.bytes }, retrieved: "2026-09-01T00:00:00Z" };
};
/* A — the plane RECORDED fetching the document address (pre-CAP-8). */
const rowA = await shellRow("A", 1);
t("A: the pre-CAP-8 retrieval record was written by the store's own route",
  (await recordPreCap8(docOf("A"), rowA.capture.sha256, rowA.retrieved)).recorded !== false, true);
t("A promoted", await promote(idOf("A"), docOf("A"), [rowA]), true);
/* B — a shell known from the register alone (no retrieval record survives). */
const rowB = await shellRow("B", 2);
t("B promoted", await promote(idOf("B"), docOf("B"), [rowB]), true);
/* C — a CAP-8 capture: the export, through op=acquire. */
const rowC = (await P("acquire", { locator: docOf("C"), authority: "City Clerk" })).document;
t("C: acquire captured the EXPORT (CAP-8)", [rowC?.locator, rowC?.profile?.format?.format], [exportOf("C"), "ods"]);
console.log(`    (the handler docprofile recorded for the ODS export: ${rowC?.profile?.handler}; for the shell: ${tpl?.profile?.handler})`);
t("C promoted", await promote(idOf("C"), docOf("C"), [rowC]), true);
/* D — a contradiction: the plane recorded the document address, the register says ODS. */
const odsD = sheetExport("contradiction", 77);
const upD = await upload(Buffer.from(odsD));
const rowD = { ...rowC, locator: docOf("D"), file: "sources/d525-d.ods",
               capture: { ...rowC.capture, sha256: upD.sha, bytes: upD.bytes } };
await recordPreCap8(docOf("D"), upD.sha, NOW);
t("D promoted", await promote(idOf("D"), docOf("D"), [rowD]), true);
/* E — a Drive FOLDER; F — a document not on Drive; G — a Drive document with no register. */
t("E promoted (a folder, no capture)", await promote("INFO-2026-9591-d525-e", FOLDER, []), true);
const rowF = (await P("acquire", { locator: LEGISTAR, authority: "City Clerk" })).document;
t("F promoted (not on Drive)", await promote("INFO-2026-9592-d525-f", LEGISTAR, [rowF]), true);
t("G promoted (a Drive document with no baseline)", await promote(idOf("G"), docOf("G"), []), true);

console.log("\n--- the SWEEP names every shell baseline, and scores every Drive bundle once ---");
const s1 = await sweep();
t("the sweep answered", s1.ok, true);
t("ACCEPTS-WHEN (1): the sweep names EXACTLY the two shell baselines", names(s1.shells), [idOf("A"), idOf("B")].sort());
t("the CAP-8 export is not a shell", names(s1.export), [idOf("C")]);
t("the contradiction is UNDETERMINED, never scored either way", names(s1.undetermined), [idOf("D")]);
t("the unbaselined Drive document is named as such", names(s1.no_baseline), [idOf("G")]);
t("the folder is counted by shape, not judged", s1.not_documents, { folder: 1 });
t("every Drive bundle is scored exactly once (6 Drive, the Legistar page is not one)",
  [s1.counts?.drive, s1.counts?.shells + s1.counts?.export + s1.counts?.undetermined + s1.counts?.no_baseline
    + s1.counts?.unreadable + Object.values(s1.not_documents || {}).reduce((a, b) => a + b, 0)], [6, 6]);
const eA = (s1.shells || []).find((e) => e.bundle === idOf("A")) || {};
const eB = (s1.shells || []).find((e) => e.bundle === idOf("B")) || {};
t("A rests on the plane's own record: it fetched the document address, not the export",
  [eA.fetched_record, eA.fetched_address, eA.format], ["page", docOf("A"), "html"]);
t("B rests on the register alone, and says so", [eB.fetched_record, /register alone/.test(eB.basis || "")], ["none", true]);
t("each names its handler, the recorded stack", [typeof eA.handler, eA.handler], ["string", tpl.profile.handler]);
t("each names the remedy: acquire the DOCUMENT address, which fetches the export",
  [eA.reacquire?.op, eA.reacquire?.locator, eA.reacquire?.fetches], ["acquire", docOf("A"), exportOf("A")]);
const eD = (s1.undetermined || [])[0] || {};
t("D's basis states both facts that disagree", /disagree/.test(eD.basis || ""), true);

console.log("\n--- THE PIN: the sweep's baseline is the one op=monitor compares against ---");
/* Ticks write a revision, so each is taken on a bundle whose later arms tolerate it. */
const tickB1 = await P("monitor", { bundleId: idOf("B") });
const tickC1 = await P("monitor", { bundleId: idOf("C") });
t("B: op=monitor's baseline IS the sweep's", tickB1.baseline, eB.baseline?.sha256);
/* BY BUNDLE ID, never by position: control arm (d) found this read `export[0]`, which is whichever
   bundle sorts first once a shell is mis-scored as an export — the assertion then failed for a reason
   that was not its own. */
t("C: op=monitor's baseline IS the sweep's", tickC1.baseline,
  ((s1.export || []).find((e) => e.bundle === idOf("C")) || {}).baseline?.sha256);

console.log("\n--- THE DEFECT, WITNESSED: a shell baseline left alone reads `modified` on every tick ---");
const tickB2 = await P("monitor", { bundleId: idOf("B") });
t("B, never re-acquired: two ticks of an UNCHANGED document read `modified`, `modified`",
  [tickB1.status, tickB2.status], ["modified", "modified"]);
t("…both on the raw comparison, because nothing comparable was captured", [tickB1.compared, tickB2.compared], ["raw", "raw"]);

console.log("\n--- THE REMEDY on A: re-acquire through the export, a NEW capture beside the old ---");
const oldA = rowA.capture.sha256;
let reA = null;
if (process.env.D525_SKIP_REACQUIRE !== "1") {
  const acqA = await P("acquire", { locator: docOf("A"), authority: "City Clerk" });
  reA = acqA.document || null;
  t("the re-acquire fetched the EXPORT and answered a new capture",
    [reA?.locator, reA?.profile?.format?.format, !!reA && reA.capture.sha256 !== oldA], [exportOf("A"), "ods", true]);
  const idx = (await G("op=index")).result?.bundles || [];
  const cur = idx.find((b) => b.id === idOf("A"));
  const img = (await G(`op=image&id=${encodeURIComponent(idOf("A"))}`)).result || {};
  t("A: the re-acquired row APPENDED to the register (old row kept, first)",
    await promote(idOf("A"), docOf("A"), [rowA, reA], { sha: cur?.sha256, md: img["bundle.md"] }), true);
} else console.log("    D525_SKIP_REACQUIRE=1 — the control arm: A is ticked with its shell baseline");
const imgA = (await G(`op=image&id=${encodeURIComponent(idOf("A"))}`)).result || {};
const regA = JSON.parse(imgA["data/provenance.json"] || "{}").documents || [];
t("NOTHING OVERWRITTEN: the shell's register row is still there", regA.some((d) => d.capture?.sha256 === oldA), true);
const oldBytes = await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-525&store=scratch&sha256=${oldA}`);
t("NOTHING OVERWRITTEN: the shell's bytes are still held under their sha", oldBytes.status, 200);
await oldBytes.arrayBuffer();
const s2 = await sweep();
t("the sweep no longer names A; it reads as an export baseline",
  [names(s2.shells), names(s2.export).includes(idOf("A"))], [[idOf("B")], true]);
const tickA1 = await P("monitor", { bundleId: idOf("A") });
const tickA2 = await P("monitor", { bundleId: idOf("A") });
t("THE PIN, after the remedy: op=monitor compares against the NEW capture the sweep names",
  tickA1.baseline, ((s2.export || []).find((e) => e.bundle === idOf("A")) || {}).baseline?.sha256);
t("ACCEPTS-WHEN (2): the re-acquired document reads `unchanged` across two ticks",
  [tickA1.status, tickA2.status], ["unchanged", "unchanged"]);
t("…on the EVIDENTIARY comparison, while the raw bytes moved both times",
  [tickA1.compared, tickA2.compared, tickA1.seen === tickA1.baseline, tickA2.seen === tickA1.seen],
  ["evidentiary", "evidentiary", false, false]);

console.log("\n--- the sweep is PAGED: a bound at the source, and the pages add up to the whole ---");
{
  const whole = await sweep();
  const all = (r) => [...(r.shells || []), ...(r.export || []), ...(r.undetermined || []), ...(r.no_baseline || [])]
    .map((e) => e.bundle);
  const seen = [];
  let after = null, pages = 0, firstPage = null;
  for (; pages < 20; pages++) {
    const r = (await G(`op=driveshells&limit=2${after ? `&after=${encodeURIComponent(after)}` : ""}`)).result || {};
    if (!firstPage) firstPage = r;
    seen.push(...all(r));
    if (!r.truncated) break;
    after = r.cursor;
  }
  t("a page of 2 says it was cut, and names where to continue",
    [firstPage.limit, firstPage.truncated, typeof firstPage.cursor], [2, true, "string"]);
  t("the pages together name exactly what one page names", seen.sort(), all(whole).sort());
  t("…and the whole answer was NOT cut", [whole.truncated, whole.cursor], [false, null]);
  const over = (await G("op=driveshells&limit=999999")).result || {};
  t("an over-ask is answered at the CEILING, and `limit` reads back the bound applied, not the one asked",
    [over.limit, over.truncated], [1000, false]);
}

console.log("\n--- the sweep is a READ under op=index's fence ---");
const pub = await G("op=driveshells", "nobody");
t("an unknown credential is refused", pub.ok === true, false);
const probe = await G("op=driveshells", "prb-525");
t("the probe class may read it", probe.ok !== false && Array.isArray(probe.result?.shells), true);

console.log(`\n${pass} passed, ${fail} failed`);
await mf.dispose();
process.exit(fail ? 1 : 0);
