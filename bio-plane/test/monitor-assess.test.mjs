/* NEGATIVE CONTROL (D-455, run 2026-09-25 on land/worker/D-455 over land/worker/REC-191 cfcb33e3, FIVE ARMS PLUS A BASELINE, each armed ALONE by an anchor that must match EXACTLY ONCE, restored by cp from per-item pristine copies of `src/index.mjs` and `src/store.mjs` and every restore verified by sha256 AND `cmp` (10 of 10 IDENTICAL; index 846081 bytes 300653defb8be606…, store 3347983 bytes 0ad465309c3d6469…, floored at 100000). Declared before arming. BASELINE: 79 pass 0 fail. (A) THE ROW'S ARM — SKIP THE CAPTURE (`if (false && status === "modified" …)`): DECLARED red on "RESULT NAMES A HELD CAPTURE"; ACTUAL 65/14, that arm failing by name with every capture, version, image, Session Log, second-tick and D-179 arm. (B) FILE THE BLOB BUT NO REGISTER ROW (`register: []`), the store's register check intact: DECLARED red, and the look must NOT name the sha; ACTUAL 69/10 — "RESULT NAMES A HELD CAPTURE" fails with the ref at the BASELINE, and the answer's `registered` reads false (the OUTCOME, not the promotion's success). (C) THE LIAR — no register row AND the store's register check removed, so the look names a sha the register does not hold: DECLARED red; ACTUAL 75/4, "RESULT NAMES A HELD CAPTURE" failing on `result_purged: true` and the D-179 arm reading the other bundle's capture as this one's. (D) TWO ROWS — `recordCapturedLocator`'s own look re-enabled for the monitor's filing: DECLARED red on exactly "ONE LOOK, ONE ROW"; ACTUAL 78/1, that arm alone. (E) OVER-STRICTNESS — the capture filed under a spelling this suite was not written around (`snapshots/tick/<sha>.bin`): MUST PASS; ACTUAL 79/0. */
/* NEGATIVE CONTROL (D-472, run 2026-09-24 on branch land/worker/D-472 over origin/main e9b21be6, FIVE ARMS PLUS A BASELINE, each armed ALONE in `src/index.mjs` with every other defence held open, each restored from a UNIQUELY-NAMED per-arm pristine copy in the session scratchpad and every restore verified by sha256 AND by `cmp` with the byte count printed and FLOORED at 100000 (5 of 5 MATCH/IDENTICAL, 817928 bytes, pristine c34382f5e0b1f4d4…). Declared before arming. (a) BASELINE, nothing armed: MUST be green — 62 pass 0 fail, the row that distinguishes five-arms-broken from five-arms-working. (b) THE ITEM REMOVED — `tickAddress` back to the bundle's own locator AND both shell arms disarmed, which is the plane exactly as it stood before D-472: DECLARED red with the accepts-when arm reading `modified`; ACTUAL 45/17, and the accepts-when arm's `got` is **["modified","modified"]** compared **["raw","raw"]** — the cry-wolf itself, twice, on a document nobody touched. (c) THE ROUTING ALONE REVERTED, the shell arms held open: DECLARED red; ACTUAL 49/13, and THE FINDING recorded rather than smoothed — the accepts-when arm fails with `status: null` rather than `modified`, because C-48.8 catches the shell the document address served and refuses the tick. That is the defence's DEPTH, and it is why (b) must disarm all three to see the original defect at all. (d) OVER-STRICTNESS, on the real site: the routing rebuilt in a spelling this suite was not written around (an IIFE re-reading the address, naming `published` explicitly, testing `harvestable === true`). It MUST PASS — ACTUAL 62/0. A guard that only recognises one spelling is one the next author routes around. (e) THE BASELINE LOOKUP NARROWED back to `d.locator === locator`: DECLARED red; ACTUAL 58/4, the accepts-when arm reading `status: null` — a tick with NO baseline at all, which is the state a Drive bundle was really in (acquire answers `document.locator` as the address it FETCHED, so the register names the export). A suite that did not distinguish `null` from `unchanged` would have called that a pass. */
/* NEGATIVE CONTROL: (run 2026-09-23, D-65) ARM BYPASS: bypass `assess` (return no assessment ahead of the call in `monitorAssess`) -> 11 fail, among them "removed-meeting: the gone meeting reads delisted as an event"; the observation, cadence and no-bytes arms still PASS as declared; 16 pass, 11 fail. ARM LIAR: grade every change an event (`settledQuiet = false && ...`) -> exactly "moved-window: NO re-evaluation is raised" fails; 26 pass, 1 fail. Each restored from a per-arm copy, verified by sha256 (eafcf7e279d91745...) and cmp, 740571 bytes; restored 27 pass, 0 fail. */
/* D-65 — op=monitor asks `assess` (BIO_Content_Framework §6, "One public function")
 * through the capture's handler and content type, answers with its trail and graded
 * events, writes each look to the observation log (OBSERVATION-LOG-DESIGN.md §4.1), and
 * says which cadence governs the document: REC-26's authored `monitoring.frequency`, or,
 * for a document stating none, its content type's contract (§6: the contract *"sets the
 * expected check frequency"*).
 *
 * ACCEPTS-WHEN (the row): a calendar that lost a meeting inside its window reads
 * `delisted` as an `event` (the row writes "removed"; the shared catalogue's word for a
 * public record removed from a public list is `delisted`, and §6 says event types come
 * from that catalogue, never a string invented per site); a moved window reads `routine`;
 * an unchanged tick writes a dated `PRESENT unchanged` observation.
 *
 * HOW A LIAR PASSES IT: grade every change an `event`. The moved-window arm must read
 * `routine` and raise no re-evaluation.
 *
 * The baseline is a REAL acquire document over the same fixture the outbound service
 * serves, its bytes in R2 under the capture key acquire wrote — never a hand-built one.
 *
 * NEGATIVE CONTROL (the row's): bypass `assess`, and the removed-meeting arm fails by name.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
/* D-472 — THE RECOGNISER AND THE CATALOGUE, READ RATHER THAN RE-SPELLED. The
   export address is composed by the plane's own `readDriveAddress`, so this suite
   drives the address the plane actually builds instead of a second copy that
   agrees today at zero cost (WORKER.md); the media type comes from COFF-10's
   export so a fixture cannot be built under a type the registry does not answer
   on; and the two new rows' C-numbers and canned sentences are compared against
   the ONE place they live (DEC-49). */
import { readDriveAddress } from "../src/drive.mjs";
import { ODS_CONTENT_TYPE } from "../src/odf.mjs";
import { DRIVE_CAPTURE_CHECKS } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* A Legistar-shaped calendar (meeting-calendar.mjs's measured shape): the per-render
   __VIEWSTATE makes the aspnet stack CERTAIN, the named range "This Month" makes the
   window RELATIVE, and each meeting is keyed by its MeetingDetail.aspx?ID=. */
const row = (id, body, date) =>
  `<tr><td><a href="MeetingDetail.aspx?ID=${id}&GUID=x">${body}</a></td><td>${date}</td>`
  + `<td><a href="View.ashx?M=A&ID=${id}0">Agenda</a></td></tr>`;
const calendar = (vs, rows) => [
  '<!DOCTYPE html><html><head><title>Calendar</title></head><body>',
  '<div id="ctl00_divHeader">nav</div>',
  '<form id="aspnetForm" method="post">',
  `<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${vs}" />`,
  `<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="ev-${vs}" />`,
  '<main id="mainContent" role="main">',
  '<input id="ctl00_lstYears_Input" name="ctl00$lstYears" value="This Month" />',
  '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>',
  ...rows,
  '</table></main></form></body></html>',
].join("");
const M = {
  a: row(101, "City Council", "9/2/2026"),  b: row(102, "Rules Committee", "9/9/2026"),
  c: row(103, "Finance Committee", "9/16/2026"), d: row(104, "City Council", "9/23/2026"),
  e: row(105, "Rules Committee", "9/30/2026"), f: row(106, "Finance Committee", "10/7/2026"),
};
const BASE    = calendar("S1_" + "x".repeat(300), [M.a, M.b, M.c, M.d]);
/* A meeting dated INSIDE the window (9/2–9/23) is gone. */
const REMOVED = calendar("S2_" + "y".repeat(500), [M.a, M.b, M.d]);
/* The window moved a fortnight: 9/2 and 9/9 scrolled out, 9/30 and 10/7 arrived. */
const MOVED   = calendar("S3_" + "z".repeat(200), [M.c, M.d, M.e, M.f]);

const LOC = "/Calendar.aspx";
const serve = { [LOC]: BASE };
let status404 = false;

/* ====================================================================== *
 * D-472 — A GOOGLE SHEET, AND THE TWO ADDRESSES IT HAS
 * ====================================================================== *
 *
 * WHY A SHEET AND NOT A DOC. `odfEvidentiaryDigest` claims a container digest
 * for `.ods` ALONE — the only flavour whose content.xml was measured stable
 * across Google's exports (MEASUREMENTS.md 2026-09-14 §4; M-123's 18/18) — and
 * `.odt`/`.odp` are stated UNDETERMINED. A `.odt` fixture would compare RAW and
 * this suite would be measuring the conservative fallback rather than the thing
 * D-472 fixes.
 *
 * THE ENVELOPE MOVES AND THE SUBSTANCE DOES NOT, which is the whole condition
 * being watched: every export Google serves is a fresh conversion, so its ZIP
 * and its `meta.xml` generation stamp differ on every fetch while `content.xml`
 * is byte-identical. The fixture reproduces exactly that — a per-fetch meta.xml
 * — and the suite ASSERTS the raw shas differ before claiming anything about
 * `unchanged`, because two identical exports would make this arm pass for free.
 */
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
    const local = Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), nameB, comp,
    ]);
    const central = Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), u16le(0), u16le(0), u16le(0), u32le(0), u32le(offset), nameB,
    ]);
    locals.push(local); centrals.push(central); offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    u32le(0x06054b50), u16le(0), u16le(0), u16le(files.length), u16le(files.length),
    u32le(cd.length), u32le(offset), u16le(0),
  ]);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}
const ODS_NS = [
  'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"',
  'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
  'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"',
].join(" ");
/* The substance. It references no package member, so the container digest is
   DETERMINED rather than refused for a reference it cannot speak for. */
const SHEET_CONTENT = `<?xml version="1.0" encoding="UTF-8"?>`
  + `<office:document-content ${ODS_NS} office:version="1.3"><office:body>`
  + `<office:spreadsheet><table:table table:name="Grants"><table:table-row>`
  + `<table:table-cell office:value-type="string"><text:p>Police Commission budget</text:p></table:table-cell>`
  + `</table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`;
/* GOOGLE'S CONVERSION STAMP — the member that moves on every export. */
const sheetExport = (n) => zip([
  { name: "mimetype", data: ODS_CONTENT_TYPE, store: true },
  { name: "META-INF/manifest.xml", data: `<?xml version="1.0" encoding="UTF-8"?>`
    + `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">`
    + `<manifest:file-entry manifest:full-path="/" manifest:media-type="${ODS_CONTENT_TYPE}"/>`
    + `</manifest:manifest>` },
  { name: "content.xml", data: SHEET_CONTENT },
  { name: "meta.xml", data: `<?xml version="1.0" encoding="UTF-8"?><office:document-meta `
    + `xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" `
    + `xmlns:dc="http://purl.org/dc/elements/1.1/"><office:meta>`
    + `<dc:date>2026-09-24T0${n}:00:00</dc:date><meta:generator xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"`
    + ` >Google Sheets export ${n}</meta:generator></office:meta></office:document-meta>` },
]);
/* GOOGLE'S APPLICATION SHELL: the client-rendered page the document address
   serves, and the page the export address serves when the file stops being
   shared. Its bytes carry no document. */
const DRIVE_SHELL = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Grants</title></head>'
  + '<body><div id="docs-editor"></div><script>window.DOCS_timing={sid:"'
  + '__PER_RENDER__' + '"};</script></body></html>';
const shellBody = (n) => DRIVE_SHELL.replace("__PER_RENDER__", `render-${n}`);

const SHEET_ID = "1d472MonitorTickSheetIdAAAAAAAAAAAAA";
const SHEET_DOC = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;
/* Composed BY THE PLANE'S OWN RECOGNISER, never typed here. */
const SHEET_EXPORT = (readDriveAddress(SHEET_DOC) || {}).exportAddress || null;
const FOLDER_ADDR = "https://drive.google.com/drive/folders/1d472FolderIdAAAAAAAAAAAAAAAA";
const FILE_ADDR   = `https://drive.google.com/file/d/${SHEET_ID}/view`;
const WEIRD_ADDR  = "https://docs.google.com/forms/d/e/1FAIpQL472/viewform";

/* THE REQUEST LOG. What the plane asked Google for is the artifact this item
   turns on: the strongest form of "the tick watches the export" is that the
   document address was NEVER FETCHED, and only a log of the outbound calls can
   say so. */
const driveAsked = [];
let exportServed = [];       // the sha256 of every export body served, in order
let driveMode = "export";    // "export" | "shell-declared" | "shell-bytes" | "gone"
let exportSeq = 0;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ma", MEMBER_TOKEN: "mem-ma", PROBE_TOKEN: "prb-ma", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    /* D-472's Drive host. Keyed on the HOST as well as the path, so the calendar
       fixture above and the Sheet below cannot answer for one another. */
    if (u.hostname === "docs.google.com" || u.hostname === "drive.google.com") {
      driveAsked.push(u.pathname + u.search);
      if (u.pathname === `/spreadsheets/d/${SHEET_ID}/export` && u.searchParams.get("format") === "ods") {
        if (driveMode === "gone") return new Response("gone", { status: 404 });
        if (driveMode === "shell-declared")
          return new Response(shellBody(++exportSeq), { headers: { "content-type": "text/html; charset=utf-8" } });
        if (driveMode === "shell-bytes")
          /* THE LIE: the application page under the OpenDocument media type. */
          return new Response(shellBody(++exportSeq), { headers: { "content-type": ODS_CONTENT_TYPE } });
        const body = sheetExport(++exportSeq);
        exportServed.push(createHash("sha256").update(body).digest("hex"));
        return new Response(body, { headers: { "content-type": ODS_CONTENT_TYPE } });
      }
      /* THE DOCUMENT ADDRESS ITSELF — the shell. Nothing in this suite should
         ever reach it; `driveAsked` is what proves that rather than asserting it. */
      return new Response(shellBody(++exportSeq), { headers: { "content-type": "text/html; charset=utf-8" } });
    }
    if (status404 && u.pathname === LOC) return new Response("gone", { status: 404 });
    if (u.pathname in serve) return new Response(serve[u.pathname], { headers: {
      "content-type": "text/html; charset=utf-8", "x-powered-by": "ASP.NET", server: "Microsoft-IIS/10.0" } });
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const P = async (op, b) => (await mf.dispatchFetch(`http://x/api/?op=${op}&token=mem-ma&store=scratch`,
  { method: "POST", body: JSON.stringify(b) })).json();
const G = async (q) => (await mf.dispatchFetch(`http://x/api/?token=mem-ma&store=scratch&${q}`)).json();

const NOW = "2026-09-23T00:00:00Z";
const bundleMd = (id, locator, freqLine) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@2",
  `title: "Monitored ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", `  locator: ${locator}`, "  authority: City Clerk", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: true", ...(freqLine ? [freqLine] : []), "  last_checked: null", "---", "",
  "## Summary", "", "A monitored calendar.", "", "## Provenance Notes", "",
  "## Session Log", "", "### Session 1", "", "Captured.", "", "## Review Notes", "",
].join("\n");

let seq = 0;
const monitored = async (freqLine) => {
  const locator = "https://oakland.legistar.com" + LOC;
  const nbytes = Buffer.byteLength(serve[LOC], "utf8");
  const acq = await P("acquire", { locator, authority: "City Clerk" });
  const doc = acq.document;
  const cap = doc.capture.sha256;
  const id = `INFO-2026-${String(9700 + ++seq)}-monitor-assess`;
  const md = bundleMd(id, locator, freqLine);
  const prov = JSON.stringify({ documents: [doc] });
  const r = await P("promote", {
    bundleId: id, base: null, snapKey: `20260923T000000Z_d65${String(seq).padStart(5, "0")}`, author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Monitored ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
            { path: doc.file, blobSha: cap, sha256: cap, bytes: nbytes }],
    register: [{ sha256: cap, path: doc.file, encoding: "binary", bytes: nbytes }],
  });
  return { id, cap, locator, promoted: r.ok !== false && (r.result ? r.result.ok !== false : true) };
};
const frontierRow = async (locator) => {
  const f = await G("op=frontier&level=document");
  return ((f.result || {}).looked || []).find((r) => r.subject === locator) || null;
};

console.log("\n--- the baseline: a certain-stack calendar, acquired and promoted ---");
const B = await monitored("  frequency: daily");
t("the monitored bundle promoted", B.promoted, true);

console.log("\n--- an UNCHANGED tick: assess confirms, and the look is logged PRESENT unchanged ---");
const same = await P("monitor", { bundleId: B.id });
t("identical bytes read unchanged", same.status, "unchanged");
t("assess ran against the baseline's own bytes", typeof same.assessment_basis === "string"
  && same.assessment_basis.startsWith("assessed against the baseline's own bytes"), true);
t("assess's verdict is identical, stopped at L2", [same.assessment?.verdict, same.assessment?.stopped_at],
  ["identical", "L2_bytes"]);
t("the answer carries the trail (L1 stack then L2 bytes)", (same.assessment?.trail || []).map((x) => x.layer),
  ["L1_stack", "L2_bytes"]);
t("the confirmation is kept: identical_bytes", same.assessment?.confirmation?.kind, "identical_bytes");
t("the look was written", [same.observation?.written, same.observation?.state, same.observation?.detail],
  [true, "PRESENT", "unchanged"]);
t("…and is DATED", typeof same.observation?.at === "string" && /^\d{4}-\d\d-\d\dT/.test(same.observation.at), true);
const fr = await frontierRow(B.locator);
t("the log holds it: PRESENT, pointing at the baseline capture, under the sweep",
  fr && [fr.state, fr.result_kind, fr.result_ref, fr.authority_kind, fr.authority, fr.detail],
  ["PRESENT", "capture", B.cap, "sweep", B.id, "unchanged"]);
t("…dated at the tick, and the frontier derives last_verified from it",
  fr && [fr.at, fr.last_verified], [same.observation?.at, same.observation?.at]);
t("an authored frequency governs, and the answer says so",
  [same.cadence?.frequency, same.cadence?.source], ["daily", "authored"]);
t("the fetched calendar reads as a meeting calendar, contract membership",
  [same.cadence?.content_type, same.cadence?.contract], ["meeting_calendar", "membership"]);

console.log("\n--- a meeting INSIDE the window is gone: delisted, graded event ---");
/* D-455: the DOCUMENT level's row count, read before the changed tick, so "one look, one row" is
   counted rather than assumed. The frontier's `tally` counts every row at the level, not a page.
   The document level and not the whole log: filing the capture makes the promotion READ it, and
   the content- and meaning-level rows that reading writes are the record reading the new version. */
const docRows = async () => Object.values(((await G("op=frontier&level=document")).result || {}).tally || {})
  .reduce((a, b) => a + b, 0);
const obsBeforeRm = await docRows();
serve[LOC] = REMOVED;
const rm = await P("monitor", { bundleId: B.id });
t("removed-meeting: assess reached L5 on the calendar type", [rm.assessment?.verdict, rm.assessment?.content_type],
  ["changed", "meeting_calendar"]);
t("removed-meeting: the gone meeting reads delisted as an event",
  (rm.assessment?.events || []).map((e) => [e.type, e.significance, e.key]), [["delisted", "event", "103"]]);
t("removed-meeting: meaningful, and re-evaluation is raised", [rm.assessment?.meaningful, rm.reeval_raised], [true, true]);
t("removed-meeting: the look is logged as changed", [rm.observation?.state, (rm.observation?.detail || "").split(";")[0]],
  ["PRESENT", "changed"]);

/* ====================================================================== *
 * D-455 — A `changed` TICK CAPTURES THE BYTES IT FETCHED
 * ====================================================================== *
 * BOB #32's ruling of 2026-09-23 23:08Z: *a `changed` tick CAPTURES the new bytes (a monitor
 * capture with its own provenance, through the governor), and its result_ref points at the new
 * capture's sha.* Before it, the look pointed at the BASELINE and the served sha rode in `detail`,
 * because the bytes the tick had in hand were thrown away.
 *
 * WHAT MAKES THIS EVIDENCE: the sha is not taken from the answer and compared with the answer.
 * It is computed HERE from the fixture the stub served (`REMOVED`), and then asked of three
 * places the tick does not write its answer into — R2 through op=capture, the register through
 * op=versionchain (a version is listed only when `register` names its bundle), and the log
 * through op=frontier (`result_purged` is false only when `register` holds the ref).
 */
console.log("\n--- D-455: the changed tick captured what it fetched, and the look names that capture ---");
{
  const served = sha(REMOVED);
  t("the fixture is what it says: the served bytes are not the baseline's", served !== B.cap, true);
  t("the tick saw the bytes the stub served", rm.seen, served);
  t("the answer carries the capture: held, registered, and the served sha",
    [rm.capture?.sha256, rm.capture?.held, rm.capture?.registered, rm.capture?.why],
    [served, true, true, null]);
  t("…filed in the bundle's snapshots/, the mechanical envelope C-20.1 admits",
    typeof rm.capture?.file === "string" && rm.capture.file.startsWith("snapshots/"), true);
  t("…with its provenance: when, from which address, and by what act",
    [rm.capture?.retrieved === rm.checked, rm.capture?.fetched_address, typeof rm.capture?.taken_by],
    [true, B.locator, "string"]);
  const fr2 = await frontierRow(B.locator);
  t("RESULT NAMES A HELD CAPTURE: the look's result_ref is the NEW capture, and the register resolves it",
    fr2 && [fr2.state, fr2.result_kind, fr2.result_ref, fr2.result_purged, fr2.authority_kind, fr2.authority],
    ["PRESENT", "capture", served, false, "sweep", B.id]);
  t("…its detail still leads with `changed` and names the baseline it was compared against",
    fr2 && [fr2.detail.split(";")[0], fr2.detail.includes(B.cap)], ["changed", true]);
  t("ONE LOOK, ONE ROW: the changed tick wrote exactly one document-level observation, though it also "
    + "filed the capture's address", (await docRows()) - obsBeforeRm, 1);
  const bytes = new Uint8Array(await (await mf.dispatchFetch(
    `http://x/api/?op=capture&token=mem-ma&store=scratch&sha256=${served}`)).arrayBuffer());
  t("the bytes are HELD: op=capture answers them, and they hash to the sha the look names",
    createHash("sha256").update(bytes).digest("hex"), served);
  const vc = await G(`op=versionchain&address=${encodeURIComponent(B.locator)}`);
  const vers = ((vc.result || vc).versions || []);
  const mine = vers.find((v) => v.capture_sha === served);
  t("the capture is a VERSION at the address, registered to this bundle",
    mine ? [mine.bundle_id, mine.via] : null, [B.id, ["direct"]]);
  const img = (await G(`op=image&id=${encodeURIComponent(B.id)}`)).result || {};
  t("the bundle's image carries the capture as a blob at the file the answer names",
    img[rm.capture?.file]?.sha256 ?? img[rm.capture?.file]?.blobSha ?? null, served);
  t("the Session Log says the served bytes were captured",
    (img["bundle.md"] || "").includes(`the served bytes were captured as ${rm.capture?.file}`), true);
}

console.log("\n--- the window MOVED: routine, and no re-evaluation (the liar's arm) ---");
serve[LOC] = MOVED;
const mv = await P("monitor", { bundleId: B.id });
t("moved-window: the substance differs (status modified)", mv.status, "modified");
t("moved-window: assess reads routine", mv.assessment?.verdict, "routine");
t("moved-window: only routine events (two meetings scheduled)",
  (mv.assessment?.events || []).map((e) => [e.type, e.significance]), [["scheduled", "routine"], ["scheduled", "routine"]]);
t("moved-window: the scrolled-out meetings are confirmed, not delisted",
  mv.assessment?.confirmation?.scrolled_out, 2);
t("moved-window: NO re-evaluation is raised", mv.reeval_raised, false);

console.log("\n--- D-455: the SAME new bytes on a second tick are captured once, not twice ---");
{
  t("the moved-window tick captured its bytes too", [mv.capture?.sha256, mv.capture?.registered], [sha(MOVED), true]);
  const again = await P("monitor", { bundleId: B.id });
  t("a second tick over the same bytes: already held in R2, still registered, and the look names it",
    [again.status, again.capture?.existed, again.capture?.registered, (await frontierRow(B.locator))?.result_ref],
    ["modified", true, true, sha(MOVED)]);
  const img = (await G(`op=image&id=${encodeURIComponent(B.id)}`)).result || {};
  const holding = Object.entries(img).filter(([k, v]) => v && typeof v === "object"
    && (v.sha256 === sha(MOVED) || v.blobSha === sha(MOVED)) && !k.startsWith("_history/"));
  t("…and the bundle carries ONE file for those bytes, not one per tick", holding.length, 1);
}

console.log("\n--- a gone source: LOOKED_ABSENT ---");
status404 = true;
const gone = await P("monitor", { bundleId: B.id });
status404 = false;
t("404 reads removed and raises re-evaluation", [gone.status, gone.reeval_raised], ["removed", true]);
t("…and is logged LOOKED_ABSENT, with no assessment and the reason stated",
  [gone.observation?.state, gone.assessment, typeof gone.assessment_basis], ["LOOKED_ABSENT", null, "string"]);

console.log("\n--- a document stating NO frequency takes its type's contract ---");
/* CORRECTED 2026-09-24 at integration by c19-unionfix, never exempted: this served BASE again, so the second
   bundle registered the SAME capture bytes the baseline bundle already holds — which D-179 (on main, C-53.13,
   CAPTURE_HELD_BY_ANOTHER_BUNDLE: one capture, one home) now refuses, and the promote failed with every arm below
   reading a bundle that was never written. The fixture was wrong under the rule, not the rule: this bundle is a
   DIFFERENT document with the same meetings, so it gets bytes of its own (its own view state). What the section
   tests — the cadence taken from the type's contract — does not depend on the bytes. */
serve[LOC] = calendar("S4_" + "w".repeat(300), [M.a, M.b, M.c, M.d]);
const C = await monitored(null);
t("the contract bundle promoted", C.promoted, true);
const cc = await P("monitor", { bundleId: C.id });
t("its cadence comes from the contract, and the answer says which",
  [cc.cadence?.source, cc.cadence?.contract, cc.cadence?.frequency], ["contract", "membership", "daily"]);

console.log("\n--- no baseline bytes: STATED, never approximated ---");
const noBytes = await mf.getR2Bucket("CAPTURES");
await noBytes.delete(`scratch/captures/${C.cap}`);
serve[LOC] = REMOVED;
const nb = await P("monitor", { bundleId: C.id });
t("with the baseline's bytes absent, no assessment is made and the basis names why",
  [nb.assessment, nb.assessment_basis], [null, "the baseline's bytes are not held under its capture key"]);
t("…and D-60's flag stands (the conservative direction)", nb.reeval_raised, true);
/* D-455 — ONE CAPTURE, ONE HOME. The bytes this tick saw (`REMOVED`) are already bundle B's
   monitor capture, so D-179 (C-53.13) refuses filing them under this bundle too. The tick is
   still recorded; the look keeps D-65's form and says why nothing was filed. */
t("D-455: bytes already another bundle's capture are NOT filed here, and the answer says why",
  [nb.ok, nb.capture?.held, nb.capture?.registered, /CAPTURE_HELD_BY_ANOTHER_BUNDLE/.test(nb.capture?.why || "")],
  [true, true, false, true]);
{
  const frC = await frontierRow(C.locator);
  t("…the look points at the BASELINE, never at a capture this bundle does not hold, and states it",
    frC && [frC.authority, frC.result_ref, /; not captured: /.test(frC.detail)], [C.id, C.cap, true]);
}

/* ====================================================================== *
 * D-472 — MONITORING A DRIVE-LINKED DOCUMENT
 * ====================================================================== *
 *
 * THE DEFECT, IN ONE SENTENCE: `op=monitor` fetched `source.locator` itself, so
 * for a Drive document it fetched Google's APPLICATION SHELL — whose bytes are
 * rebuilt per render — and reported `modified` on every tick against a capture
 * of the OpenDocument export.
 *
 * WHAT MAKES THIS ARM EVIDENCE RATHER THAN AN EQUALITY THAT COSTS NOTHING: the
 * fixture serves a DIFFERENT export on every fetch (a per-export `meta.xml`), so
 * the raw shas differ and are asserted to differ BEFORE `unchanged` is claimed.
 * The strongest form of the claim is the REQUEST LOG: the document address is
 * never fetched at all.
 */
console.log("\n--- D-472: the recogniser composes the export address, and the fixture is what it says ---");
{
  /* THE LIVENESS ASSERTION, before anything is claimed over the recogniser: a
     `readDriveAddress` answering null would make every arm below fetch the
     document address and this file would be measuring the defect it is testing. */
  t("THE RECOGNISER IS LIVE — the Sheet address composes an `export?format=ods` address",
    SHEET_EXPORT, `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=ods`);
  t("…and the same Sheet with a `#gid=` fragment composes the SAME export address",
    (readDriveAddress(`${SHEET_DOC}#gid=0`) || {}).exportAddress, SHEET_EXPORT);
  const a = sheetExport(1), b = sheetExport(2);
  t("THE FIXTURE MOVES ITS ENVELOPE AND NOT ITS SUBSTANCE — two exports, two raw shas",
    createHash("sha256").update(a).digest("hex") === createHash("sha256").update(b).digest("hex"), false);
}

let dseq = 0;
const driveMonitored = async (locator, { capture = true } = {}) => {
  const id = `INFO-2026-${String(9800 + ++dseq)}-drive-tick`;
  const md = bundleMd(id, locator, "  frequency: weekly");
  const files = [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }];
  const register = [];
  let doc = null;
  if (capture) {
    const acq = await P("acquire", { locator, authority: "City Clerk" });
    doc = acq.document || null;
    if (!doc) console.log(`    ACQUIRE ANSWERED NO DOCUMENT: ${JSON.stringify(acq).slice(0, 300)}`);
    else {
      const prov = JSON.stringify({ documents: [doc] });
      files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
      files.push({ path: doc.file, blobSha: doc.capture.sha256, sha256: doc.capture.sha256, bytes: doc.capture.bytes });
      register.push({ sha256: doc.capture.sha256, path: doc.file, encoding: "binary", bytes: doc.capture.bytes });
    }
  }
  const r = await P("promote", {
    bundleId: id, base: null, snapKey: `20260924T000000Z_d472${String(dseq).padStart(4, "0")}`, author: "suite",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Monitored ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files, register,
  });
  return { id, doc, promoted: r.ok !== false && (r.result ? r.result.ok !== false : true) };
};
/* The bundle as the record actually holds it, so "nothing moved" is read off the
   document rather than off the answer that declined to move it. */
const bundleFacts = async (id) => {
  const img = await G(`op=image&id=${encodeURIComponent(id)}`);
  const md = (img.result || {})["bundle.md"] || "";
  return { status: (md.match(/^source_status: (.*)$/m) || [])[1] || null,
           lastChecked: (md.match(/^\s+last_checked: (.*)$/m) || [])[1] || null,
           ticks: (md.match(/Monitor tick:/g) || []).length };
};

console.log("\n--- D-472: the capture is of the EXPORT, and its container digest is determined ---");
const DR = await driveMonitored(SHEET_DOC);
t("the Drive-linked bundle promoted", DR.promoted, true);
t("acquire captured the export, not the shell",
  [DR.doc?.profile?.format?.format, DR.doc?.capture?.content_type], ["ods", ODS_CONTENT_TYPE]);
t("…and its evidentiary digest is the container's, taken over content.xml",
  [DR.doc?.profile?.digests?.determined, DR.doc?.profile?.digests?.over], [true, "content.xml"]);

console.log("\n--- D-472: TWO TICKS on an unchanged Drive document — `unchanged`, both times ---");
const askedBeforeTicks = driveAsked.length;
const d1 = await P("monitor", { bundleId: DR.id });
const d2 = await P("monitor", { bundleId: DR.id });
t("ACCEPTS-WHEN: an unchanged Drive document reads `unchanged` across two ticks",
  [d1.status, d2.status], ["unchanged", "unchanged"]);
t("…on the EVIDENTIARY comparison, both times", [d1.compared, d2.compared], ["evidentiary", "evidentiary"]);
/* THE ARM IS NOT FREE: the raw bytes moved under both ticks. */
t("…while the RAW bytes differed from the capture on both ticks (the envelope moved)",
  [d1.seen === d1.baseline, d2.seen === d2.baseline, d1.seen === d2.seen], [false, false, false]);
t("…and the three exports Google served were three different sets of bytes",
  new Set(exportServed).size, 3);
t("neither tick raised a re-evaluation", [d1.reeval_raised, d2.reeval_raised], [false, false]);
t("the answer names the export it watched and the document it answers for",
  [d1.fetched_address, d1.drive?.document_address, d1.drive?.export_format, d1.drive?.file_id],
  [SHEET_EXPORT, SHEET_DOC, "ods", SHEET_ID]);
t("the look is logged PRESENT unchanged against the capture",
  [d2.observation?.written, d2.observation?.state, d2.observation?.detail], [true, "PRESENT", "unchanged"]);
/* THE STRONGEST FORM OF THE CLAIM. Not "the comparison came out right" but "the
   application page was never asked for at all" — which only the request log can say. */
t("THE DOCUMENT ADDRESS WAS NEVER FETCHED: every outbound call went to the export address",
  driveAsked.filter((a) => a !== `/spreadsheets/d/${SHEET_ID}/export?format=ods`), []);
t("…and the two ticks made exactly two calls", driveAsked.length - askedBeforeTicks, 2);
t("the Session Log says which bytes were compared",
  ((await G(`op=image&id=${encodeURIComponent(DR.id)}`)).result["bundle.md"] || "").includes(
    `fetched ${SHEET_EXPORT}, the OpenDocument export this instance composed from the Drive spreadsheet`), true);

console.log("\n--- D-472: the export address answers with the SHELL (C-48.8, the declared type) ---");
const settled = await bundleFacts(DR.id);
driveMode = "shell-declared";
const sh1 = await P("monitor", { bundleId: DR.id });
t("the tick is refused BY NAME rather than reading the shell as a change",
  [sh1.ok, sh1.reason, sh1.check], [false, "DRIVE_TICK_EXPORT_IS_THE_SHELL", "C-48.8"]);
t("…carrying the catalogue's own canned translation (DEC-49)",
  sh1.translation, DRIVE_CAPTURE_CHECKS.DRIVE_TICK_EXPORT_IS_THE_SHELL.translation);
t("…naming both addresses and what it refused on",
  [sh1.locator, sh1.export_address, sh1.declared_content_type, sh1.refused_on],
  [SHEET_DOC, SHEET_EXPORT, "text/html", "the declared content type"]);
t("…the look is logged, INDETERMINATE, because a look did happen",
  [sh1.observation?.written, sh1.observation?.state], [true, "LOOKED_INDETERMINATE"]);
t("…AND THE RECORD DID NOT MOVE: no new tick, no new status, no new last_checked",
  await bundleFacts(DR.id), settled);

console.log("\n--- D-472: the shell under a LYING content type (C-48.9, the bytes) ---");
driveMode = "shell-bytes";
const sh2 = await P("monitor", { bundleId: DR.id });
t("bytes-first detection catches the shell the declared type hid",
  [sh2.ok, sh2.reason, sh2.check, sh2.detected?.format], [false, "DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL", "C-48.9", "html"]);
t("…carrying the catalogue's own canned translation, and NOT C-48.8's",
  [sh2.translation === DRIVE_CAPTURE_CHECKS.DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL.translation,
   sh2.translation === DRIVE_CAPTURE_CHECKS.DRIVE_TICK_EXPORT_IS_THE_SHELL.translation], [true, false]);
t("…and it says what Google DECLARED, which is the finding",
  [sh2.declared_content_type, sh2.refused_on], [ODS_CONTENT_TYPE, "the bytes"]);
t("…the look is logged INDETERMINATE and the record did not move",
  [sh2.observation?.state, JSON.stringify(await bundleFacts(DR.id)) === JSON.stringify(settled)],
  ["LOOKED_INDETERMINATE", true]);

console.log("\n--- D-472: the export comes back, and so does the tick ---");
driveMode = "export";
const d3 = await P("monitor", { bundleId: DR.id });
t("a refused tick left nothing behind: the next one reads unchanged on the evidentiary digest",
  [d3.status, d3.compared], ["unchanged", "evidentiary"]);

console.log("\n--- D-472: the shapes that are not documents are NAMED, and fetched never ---");
{
  const F = await driveMonitored(FOLDER_ADDR, { capture: false });
  const L = await driveMonitored(FILE_ADDR, { capture: false });
  const W = await driveMonitored(WEIRD_ADDR, { capture: false });
  t("the three unharvestable bundles promoted", [F.promoted, L.promoted, W.promoted], [true, true, true]);
  const asked = driveAsked.length;
  const fr = await P("monitor", { bundleId: F.id });
  const lr = await P("monitor", { bundleId: L.id });
  const wr = await P("monitor", { bundleId: W.id });
  t("a FOLDER address is refused by name — a listing is not a document to watch",
    [fr.ok, fr.reason, fr.check], [false, "DRIVE_FOLDER_NOT_A_DOCUMENT", "C-48.2"]);
  t("a FILE address with no kind is refused by name",
    [lr.ok, lr.reason, lr.check], [false, "DRIVE_KIND_UNDETERMINED", "C-48.3"]);
  t("a Drive shape nobody reads is refused by name",
    [wr.ok, wr.reason, wr.check], [false, "DRIVE_SHAPE_UNRECOGNISED", "C-48.4"]);
  t("each carries the catalogue's canned translation",
    [fr.translation === DRIVE_CAPTURE_CHECKS.DRIVE_FOLDER_NOT_A_DOCUMENT.translation,
     lr.translation === DRIVE_CAPTURE_CHECKS.DRIVE_KIND_UNDETERMINED.translation,
     wr.translation === DRIVE_CAPTURE_CHECKS.DRIVE_SHAPE_UNRECOGNISED.translation], [true, true, true]);
  t("AND NOTHING WAS FETCHED: the refusal is before the network, so Google's listing page is never read",
    driveAsked.length - asked, 0);
}

console.log("\n--- D-472 OVER-STRICTNESS: a PUBLISH-TO-WEB address is left alone, not diverted ---");
{
  /* The direction this project keeps measuring. `published` serves static HTML
     that is already an honest document; diverting it would break a path that
     works today, and its `e/…` id is not one the export endpoint accepts. */
  const PUB = `https://docs.google.com/spreadsheets/d/e/2PACX-1vD472Published/pubhtml`;
  t("the recogniser names it `published` and NOT harvestable",
    [(readDriveAddress(PUB) || {}).shape, (readDriveAddress(PUB) || {}).harvestable], ["published", false]);
  const B = await driveMonitored(PUB, { capture: false });
  const asked = driveAsked.length;
  const pr = await P("monitor", { bundleId: B.id });
  t("the tick RUNS — no refusal, no export address, the ordinary path",
    [pr.ok, pr.reason ?? null, pr.drive ?? null, pr.fetched_address ?? null], [true, null, null, null]);
  t("…and it fetched the published address itself",
    driveAsked.slice(asked), ["/spreadsheets/d/e/2PACX-1vD472Published/pubhtml"]);
}

console.log(`\n${pass} passed, ${fail} failed`);
await mf.dispose();
process.exit(fail ? 1 : 0);
