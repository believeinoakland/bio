/* NEGATIVE CONTROL: re-run in one step with `node test/drive.control.mjs` (or one arm, `node test/drive.control.mjs six`). SEVEN rows — SIX ARMS PLUS A BASELINE — run 2026-09-14, each armed ALONE with every other defence held open, each file snapshotted to a UNIQUELY-NAMED per-arm pristine copy inside this worktree and every restore verified by sha256 AND by content with the byte count printed and FLOORED at 1000 (7 of 7 restores MATCH/IDENTICAL/ok, 0 MISMATCH). BASELINE (nothing armed) 160 pass 0 fail — the row that distinguishes six-arms-working from six-arms-broken. (1) THE EXPORT FETCH FAILING loses its name — disarm the Drive refusal so a 404/403 at the export address falls through to the generic SOURCE_REFUSED: DECLARED red on the NAMING; ACTUAL 154/6, the six naming the code, the catalogue sentence and the two addresses, and the shell is still not filed (the ordinary path refuses too, which is exactly why the arm is about the NAME). (2) A HOP FACT SUPPLIED BY THE CALLER is accepted silently — `callerSuppliedHopFacts` returns [] always: DECLARED red; ACTUAL 156/4. THE FINDING, recorded rather than smoothed: with the fence disarmed the capture SUCCEEDS CARRYING THE PLANE'S OWN CORRECT HOP, because nothing ever reads a hop fact off a body — so a SILENT drop would be behaviourally invisible and only the fence SPEAKING can be observed at all. (3) OVER-STRICTNESS — widen the host fence from an exact set to `host.endsWith("google.com")`, the tidy-up that looks equivalent: DECLARED red; ACTUAL 151/9, naming maps and search being diverted off the ordinary path. The corpus is printed and floored at 4 addresses, because an over-strictness arm over an empty corpus passes over anything. (4a) THE SHELL, DECLARED-TYPE SITE — disarm the `text/html` check in is-drive-export: DECLARED red; ACTUAL 156/4, and the BYTES arm catches the same shell one refusal later under its own code. That is a finding about the DEFENCE's depth and it is why C-48.7 exists separately from C-48.5 (PL-4: one predicate at two points leaves one undrivable). (4b) THE SHELL, BYTES SITE — disarm the bytes-first check in is-drive-bytes so a shell under a LYING content type is not recognised: DECLARED red WITH THE SHELL FILED; ACTUAL 151/9, and the shell's bytes are in the store and on the document. That is the defect this whole item exists to prevent, and this arm is the only place it is ever seen. (5) A FOLDER ADDRESS silently skipped — the folder branch never matches: DECLARED red WITH THE FOLDER CAPTURED; ACTUAL 155/5, and Google's listing page is filed as though it were a document — the silent skip inverted, which is a success-shaped absence and the worst outcome available here. (6) THE ARM'S OWN ARM — NEUTER THE SHAPE RECOGNISER (`readDriveAddress` returns null for everything) so the fixture's Drive addresses take the ordinary path: DECLARED the suite FAILS BY NAME across every block; ACTUAL **55 pass, 105 fail**, the first naming "THE RECOGNISER IS LIVE" and the rest running through every block, with the captured document showing `format: html, certain` and `content_type: text/html` — the shell captured in place of the document. ITS OWN SECOND FINDING: on its first run this arm produced NO TALLY AT ALL (reported as -1, never 0) because the suite dereferenced `readDriveAddress(x).exportAddress` and a TypeError inside an assertion goes through no assertion at all. The suite was corrected — one null-tolerant `exp()` reader, a null-tolerant `h0`/`h1`, and a LIVENESS assertion before anything is claimed over the recogniser — so the arm now returns a COUNT instead of a death. The instrument was wrong and the arm was right, which is what a control is for. */
/* CAP-8 — THE GOOGLE DRIVE HOST STACK, driven THROUGH `op=acquire`.
 *
 * BOB RULED IT, 2026-09-14: *"A link to a Google Drive file should keep the link
 * and export an OpenDocument version that the content is extracted from."*
 * (`BIO_Content_Framework_v0_10.md` Part II §16, the Google Drive paragraphs.)
 *
 * WHAT THIS SUITE IS FOR, AND WHY IT DRIVES THE OP. A store-level test and a
 * passing battery are not evidence that a caller can reach a feature —
 * `op=invitelook` shipped with a ReferenceError while 1,276 assertions passed. So
 * every claim below is made about what a POST to `?op=acquire` actually answers,
 * with the fixture serving BOTH the application shell (at the document's own
 * address, the way Google does) and the OpenDocument export (at the address the
 * plane composes). The only things read directly from a module are the
 * recogniser's own verdicts, and those are read so that the plane and the suite
 * cannot hold two definitions of what a Drive address is.
 *
 * THE FIXTURE PACKAGES ARE BUILT HERE, hermetically, by the same byte-by-byte ZIP
 * assembler `ooxml.test.mjs` and `formats-odf.test.mjs` use — the fixture builder
 * must not inherit a defect from the module under test. No binary is committed
 * and the suite passes on a machine with no office suite and no network, which is
 * every machine the plane runs on.
 *
 * WHAT THIS SUITE CANNOT SEE, STATED PLAINLY BECAUSE THE SENTENCE IS LOAD-BEARING:
 * it cannot see GOOGLE. Every byte it reads was written by this file. It proves
 * the plane recognises the address, composes the export address, fetches it under
 * the governor, refuses the shell by name and files the capture under the Drive
 * link — and it proves NOTHING about whether Google's real export endpoint
 * answers that composed address, in that format, with bytes these entries read.
 * That is a live measurement and it is reported separately, in MEASUREMENTS.md
 * under 2026-09-14 CAP-8.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
/* THE RECOGNISER ITSELF — read so the suite composes the export address the way
   the plane does rather than typing a second copy that agrees today at zero cost
   (WORKER.md: an equality that costs nothing to produce is not evidence). What is
   NOT taken from here is the EXPECTED shape of each address: those are written
   out as literals below, because a suite that asks the recogniser what it thinks
   and then agrees with the answer has asserted nothing. */
import { readDriveAddress, DRIVE_KINDS, DRIVE_HOSTS, DRIVE_PRODUCER,
         DRIVE_HOP_FACT_KEYS } from "../src/drive.mjs";
/* COFF-10's three media types. The DRIFT PIN: `drive.mjs` states the three
   OpenDocument media types so it can stay pure, and this import is what makes
   that a checked agreement rather than a second copy nobody compares. */
import { ODT_CONTENT_TYPE, ODS_CONTENT_TYPE, ODP_CONTENT_TYPE } from "../src/odf.mjs";
/* The catalogue rows, so the wire's `check` and `translation` are compared
   against the ONE place they live rather than retyped here (DEC-49). */
import { DRIVE_CAPTURE_CHECKS } from "../checks/bio-checks.mjs";
/* THE PLANE'S OWN NORMALISER, imported rather than re-spelled. `captured_locators`
   is keyed on `address_norm`, and a hand copy of the normalisation would look up
   a key the plane never wrote and report a MISSING ROW as a failed capture -- the
   instrument being wrong while claiming a finding about the subject. */
import { normalizeAddress } from "../src/subresources.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* ---- independent crc32 + zip assembler (the ooxml.test.mjs pattern) ---- */
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

const NS = [
  'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"',
  'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
  'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"',
  'xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"',
  'xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0"',
  'xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"',
].join(" ");
const BODY = {
  odt: `<office:text><text:p>Oakland Police Commission, agenda of 14 September 2026.</text:p></office:text>`,
  ods: `<office:spreadsheet><table:table table:name="Budget"><table:table-row>`
     + `<table:table-cell office:value-type="string"><text:p>General Fund</text:p></table:table-cell>`
     + `</table:table-row></table:table></office:spreadsheet>`,
  odp: `<office:presentation><draw:page draw:name="page1"><draw:frame><draw:text-box>`
     + `<text:p>Capital plan</text:p></draw:text-box></draw:frame></draw:page></office:presentation>`,
};
/* The media types are taken from COFF-10's exports, so a fixture cannot be built
   under a type the registry does not answer on. */
const MIME = { odt: ODT_CONTENT_TYPE, ods: ODS_CONTENT_TYPE, odp: ODP_CONTENT_TYPE };
const odf = (flavour) => zip([
  /* FIRST AND STORED — the property COFF-9's discriminator reads. A fixture that
     got this wrong would detect as a plain ZIP and every assertion below would be
     measuring the wrong thing. */
  { name: "mimetype", data: MIME[flavour], store: true },
  { name: "META-INF/manifest.xml", data: `<?xml version="1.0" encoding="UTF-8"?>`
    + `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">`
    + `<manifest:file-entry manifest:full-path="/" manifest:media-type="${MIME[flavour]}"/>`
    + `</manifest:manifest>` },
  { name: "content.xml", data: `<?xml version="1.0" encoding="UTF-8"?>`
    + `<office:document-content ${NS} office:version="1.3"><office:body>${BODY[flavour]}</office:body>`
    + `</office:document-content>` },
]);

const EXPORT_BYTES = { odt: odf("odt"), ods: odf("ods"), odp: odf("odp") };
const EXPORT_SHA = Object.fromEntries(Object.entries(EXPORT_BYTES)
  .map(([k, v]) => [k, createHash("sha256").update(v).digest("hex")]));

/* GOOGLE'S APPLICATION SHELL, in the shape it actually arrives in: a client-
   rendered page whose bytes carry no document (framework Part I §6's UNWATCHABLE
   case). It is served at the document's own address the way Google serves it,
   and — in two arms — at the EXPORT address, which is what Google does when the
   file is not shared with anyone who has the link. */
const SHELL = Buffer.from(
  `<!DOCTYPE html><html><head><title>Oakland Police Commission agenda - Google Docs</title>`
  + `<script>var DOCS_timing={};</script></head><body><div id="docs-editor-container">`
  + `<div id="docs-editor"></div></div></body></html>`, "utf-8");
const SHELL_SHA = createHash("sha256").update(SHELL).digest("hex");

/* Ids, one per case. Long enough to be real Drive ids and distinct so a fixture
   answer can never be mistaken for another case's. */
const ID = {
  doc:       "1AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTt",
  sheet:     "1BbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUu",
  slides:    "1CcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVv",
  gone:      "1DdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWw",
  forbidden: "1EeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXx",
  shellCt:   "1FfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYy",
  lyingCt:   "1GgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz",
  folder:    "1HhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz00",
  file:      "1IiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0011",
};
const A = {
  doc:    `https://docs.google.com/document/d/${ID.doc}/edit`,
  sheet:  `https://docs.google.com/spreadsheets/d/${ID.sheet}/edit#gid=0`,
  slides: `https://docs.google.com/presentation/d/${ID.slides}/edit`,
  gone:      `https://docs.google.com/document/d/${ID.gone}/edit`,
  forbidden: `https://docs.google.com/document/d/${ID.forbidden}/edit`,
  shellCt:   `https://docs.google.com/document/d/${ID.shellCt}/edit`,
  lyingCt:   `https://docs.google.com/document/d/${ID.lyingCt}/edit`,
  folder: `https://drive.google.com/drive/folders/${ID.folder}`,
  file:   `https://drive.google.com/file/d/${ID.file}/view`,
  weird:  `https://docs.google.com/forms/d/e/1FAIpQLSfakefakefake/viewform`,
  /* THE OVER-STRICTNESS CORPUS: Google addresses that are NOT Drive, plus an
     ordinary city address beside them so the arm is not only about Google. */
  ordinary: [
    "https://www.google.com/maps/place/Oakland+City+Hall",
    "https://fonts.googleapis.com/css2?family=Inter",
    "https://www.google.com/search?q=oakland+budget",
    "https://www.oaklandca.gov/report.pdf",
  ],
};
const ORDINARY_DOC = new Uint8Array(4096).map((_, i) => (i * 11) % 256);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-drv", MEMBER_TOKEN: "mem-drv", PROBE_TOKEN: "prb-drv",
              VERSION: "test", INSTANCE_NAME: "drvtest",
              /* This suite is about recognition, not pacing; the governor stays IN
                 the path (every export fetch goes through it) and never gates. */
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const p = u.pathname, fmt = u.searchParams.get("format");
    /* THE EXPORT ADDRESSES — served ONLY at the exact shape the plane composes.
       A mis-composed address falls through to the 500 below, so a composition
       bug is a loud failure rather than a quietly different capture. */
    if (p === `/document/d/${ID.doc}/export` && fmt === "odt")
      return new Response(EXPORT_BYTES.odt, { headers: { "content-type": ODT_CONTENT_TYPE } });
    if (p === `/spreadsheets/d/${ID.sheet}/export` && fmt === "ods")
      return new Response(EXPORT_BYTES.ods, { headers: { "content-type": ODS_CONTENT_TYPE } });
    if (p === `/presentation/d/${ID.slides}/export` && fmt === "odp")
      return new Response(EXPORT_BYTES.odp, { headers: { "content-type": ODP_CONTENT_TYPE } });
    /* The two failure shapes at the export address. */
    if (p === `/document/d/${ID.gone}/export`) return new Response("Not Found", { status: 404 });
    if (p === `/document/d/${ID.forbidden}/export`)
      return new Response("Sorry, unable to open the file at this time.", { status: 403 });
    /* THE SHELL AT THE EXPORT ADDRESS, declared honestly as text/html — what
       Google serves when the file is not shared with anyone who has the link. */
    if (p === `/document/d/${ID.shellCt}/export`)
      return new Response(SHELL, { headers: { "content-type": "text/html; charset=utf-8" } });
    /* THE SAME SHELL, DECLARED AS A DOCUMENT. Detection is bytes-first and
       certain, so the declared type is not what this arm rests on. */
    if (p === `/document/d/${ID.lyingCt}/export`)
      return new Response(SHELL, { headers: { "content-type": "application/octet-stream" } });
    /* THE APPLICATION SHELL at every document's OWN address, the way Drive
       serves it. Reached only when the handler fails to divert — which is
       exactly what control arm (6) measures. */
    if (/^\/(document|spreadsheets|presentation)\/d\//.test(p) || /^\/(file|drive|folderview)\//.test(p))
      return new Response(SHELL, { headers: { "content-type": "text/html; charset=utf-8" } });
    /* The ordinary corpus: every non-Drive address answers the same bytes, so a
       byte-for-byte comparison across them is about the PATH and not the body. */
    return new Response(ORDINARY_DOC, { headers: { "content-type": "application/pdf" } });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const acquire = async (body, token = "mem-drv") =>
  (await mf.dispatchFetch("http://x/api/?op=acquire&token=" + token,
    { method: "POST", body: JSON.stringify(body) })).json();

/* ====================================================================== 0
 * THE RECOGNISER AND THE CATALOGUE AGREE WITH THE MODULES THEY MUST NOT COPY
 * ==================================================================== */
console.log("\n--- 0. the drift pins: one definition of an ODF media type, one of a C-number ---");
{
  /* `drive.mjs` is PURE and states the three media types so it can stay that
     way. That is a second spelling, and a second spelling is only safe when
     something compares it. This is that something. */
  t("drive.mjs's three media types ARE COFF-10's, not a copy that agrees today",
    DRIVE_KINDS.map((k) => k.mimetype),
    [ODT_CONTENT_TYPE, ODS_CONTENT_TYPE, ODP_CONTENT_TYPE]);
  t("and the three export formats are the three Bob's ruling names",
    DRIVE_KINDS.map((k) => k.format), ["odt", "ods", "odp"]);
  t("the four hosts the item names, and no fifth",
    [...DRIVE_HOSTS].sort(),
    ["docs.google.com", "drive.google.com", "sheets.google.com", "slides.google.com"]);
  /* THE FAMILY'S OWN FLOOR, before anything is claimed over it. A catalogue walk
     that went blind would make every `check`/`translation` comparison below
     vacuous — the zero-cost-equality failure arriving in the INSTRUMENT. */
  const codes = Object.keys(DRIVE_CAPTURE_CHECKS).sort();
  console.log(`    CORPUS: ${codes.length} DRIVE_CAPTURE_CHECKS rows · ${codes.join(", ")}`);
  /* CORRECTED 2026-09-24 BY D-472, never exempted: this read SEVEN, which was true
     of a family whose only consumer was `op=acquire`. D-472 gave `op=monitor`'s own
     two shell arms their own rows (C-48.8, C-48.9) because a tick that meets the
     shell has lost the CHECK rather than a capture, and DEC-49's canned translation
     is the sentence a member reads — one sentence cannot be true of both. The floor
     moves to the measured NINE rather than the assertion being loosened. */
  t("the family carries nine rows and the walk can see them", codes.length, 9);
  t("every row carries a C-48 number and a non-empty canned translation",
    Object.values(DRIVE_CAPTURE_CHECKS)
      .filter((r) => !/^C-48\.\d+$/.test(r.check || "") || !(r.translation || "").trim()).length, 0);
  t("every row's `where` names a DEC-49 REGION rather than a whole function",
    Object.values(DRIVE_CAPTURE_CHECKS).filter((r) => !/ > is-drive-/.test(r.where || "")).length, 0);
}

/* NULL-TOLERANT, AND THE REASON IS A MEASUREMENT RATHER THAN CAUTION. Control
   arm (6) neuters `readDriveAddress` so it answers null for everything — the
   arm that proves this suite is testing its subject. On its first run every
   `readDriveAddress(x).exportAddress` in this file threw a TypeError, the module
   ENDED at the first one, and the harness reported NO TALLY: an assertion that
   throws goes through no assertion at all, which is the exact failure WORKER.md
   names. So the composed address is read through a helper that answers null, the
   suite reaches its own foot under every arm, and arm (6)'s result is a COUNT
   instead of a death. Recorded here because the fix belongs beside the reason. */
const exp = (a) => { const r = readDriveAddress(a); return r ? r.exportAddress ?? null : null; };

/* ====================================================================== 1
 * SHAPE RECOGNITION — read from the recogniser, compared against literals
 * ==================================================================== */
console.log("\n--- 1. every address shape is NAMED, and the three editor kinds compose an export ---");
{
  const shapeOf = (a) => { const r = readDriveAddress(a); return r ? r.shape : null; };
  /* THE LIVENESS ASSERTION, BEFORE ANYTHING IS CLAIMED OVER THE RECOGNISER. A
     recogniser answering null everywhere would make every shape assertion below
     read `null` against a literal and fail — but it would also make the whole
     file's reach a question, so the reach is asserted first and by name. */
  t("THE RECOGNISER IS LIVE — it answers for a Drive address at all, which is the "
    + "floor every assertion in this file stands on",
    readDriveAddress(A.doc) !== null, true);
  t("a Google Doc is a document", shapeOf(A.doc), "document");
  t("a Sheet is a spreadsheet", shapeOf(A.sheet), "spreadsheet");
  t("a Slides deck is a presentation", shapeOf(A.slides), "presentation");
  t("a Drive FOLDER is named a folder, not skipped", shapeOf(A.folder), "folder");
  t("a Drive FILE is named a file, not skipped", shapeOf(A.file), "file");
  t("a Drive host with a path nobody reads is named UNKNOWN, not skipped", shapeOf(A.weird), "unknown");
  t("and every non-Drive address is not a Drive address at all — null, the ordinary path",
    A.ordinary.map(shapeOf), [null, null, null, null]);
  /* THE COMPOSED ADDRESS, WRITTEN OUT. Composing it with the module's own
     composer here would agree for free; the point of this block is that the
     plane composes the form the item and the framework both name. */
  t("the export address is composed from the file id and the kind — document",
    exp(A.doc),
    `https://docs.google.com/document/d/${ID.doc}/export?format=odt`);
  t("— spreadsheet", exp(A.sheet),
    `https://docs.google.com/spreadsheets/d/${ID.sheet}/export?format=ods`);
  t("— presentation", exp(A.slides),
    `https://docs.google.com/presentation/d/${ID.slides}/export?format=odp`);
  /* OVER-STRICTNESS, in the direction that actually bites: real spellings this
     item did not invent. The `/u/<n>/` selector appears in three positions and
     the first draft of the recogniser read only one of them, which named an
     ordinary signed-in Sheets link UNKNOWN. */
  t("a signed-in account selector after the product segment is still a Sheet",
    shapeOf(`https://docs.google.com/spreadsheets/u/0/d/${ID.sheet}/edit`), "spreadsheet");
  t("— and before it", shapeOf(`https://docs.google.com/u/1/document/d/${ID.doc}/edit`), "document");
  t("a Workspace-hosted document is still a document",
    shapeOf(`https://docs.google.com/a/oaklandca.gov/document/d/${ID.doc}/edit`), "document");
  t("a folder under an account selector is still a folder",
    shapeOf(`https://drive.google.com/drive/u/0/folders/${ID.folder}`), "folder");
  t("the sheets. and slides. aliases compose the export on the canonical host",
    [exp(`https://sheets.google.com/spreadsheets/d/${ID.sheet}/edit`),
     exp(`https://slides.google.com/presentation/d/${ID.slides}/edit`)],
    [`https://docs.google.com/spreadsheets/d/${ID.sheet}/export?format=ods`,
     `https://docs.google.com/presentation/d/${ID.slides}/export?format=odp`]);
  /* THE PUBLISH-TO-WEB SHAPE IS RECOGNISED IN ORDER TO BE LEFT ALONE. Diverting
     it would break a path that works today — the over-strictness direction. */
  t("Google's publish-to-web address is named `published` and is NOT harvestable-as-export",
    [shapeOf(`https://docs.google.com/document/d/e/2PACX-1vFakePublishedId/pub`),
     (readDriveAddress(`https://docs.google.com/document/d/e/2PACX-1vFakePublishedId/pub`) || {}).harvestable ?? null],
    ["published", false]);
  t("an http:// Drive address is not recognised here at all — the ordinary "
    + "public-https fence refuses it, and this handler does not get a second opinion",
    readDriveAddress(`http://docs.google.com/document/d/${ID.doc}/edit`), null);
}

/* ====================================================================== 2
 * THE CAPTURE — the export bytes are the capture, and the link is kept
 * ==================================================================== */
console.log("\n--- 2. THE ITEM: the export is the capture, the link is kept, the hop carries three facts ---");
const cap = {};
for (const [name, flavour, addr] of [["doc", "odt", A.doc], ["sheet", "ods", A.sheet],
                                     ["slides", "odp", A.slides]]) {
  const r = await acquire({ locator: addr, authority: "City of Oakland" });
  cap[name] = r;
  t(`${name}: the acquisition succeeds`, r.ok, true);
  /* THE LOAD-BEARING ASSERTION OF THE WHOLE ITEM. If this is the shell's hash
     the record holds Google's application in place of a city document. */
  t(`${name}: the EXPORT bytes are the capture — not the application shell`,
    r.document?.capture?.sha256, EXPORT_SHA[flavour]);
  t(`${name}: and the shell's hash appears nowhere on the document`,
    JSON.stringify(r.document).includes(SHELL_SHA), false);
  t(`${name}: the content type recorded is the OpenDocument one Google served`,
    r.document?.capture?.content_type, MIME[flavour]);
  t(`${name}: the FORMAT axis reads the bytes as ${flavour} from the bytes, certainly`,
    [r.document?.profile?.format?.format, r.document?.profile?.format?.confidence],
    [flavour, "certain"]);
  t(`${name}: the locator is the composed export address — what was actually fetched`,
    r.document?.locator, exp(addr));
  t(`${name}: the transport record's `
    + `\`requested\` is the export address, so the WARC-style record is honest about the fetch`,
    r.document?.capture?.transport?.requested, exp(addr));
}

console.log("\n--- 2a. THE HOP'S THREE FACTS, derived by the plane and recorded ---");
{
  const chain = cap.doc.document?.provenance_chain || [];
  t("a Drive capture is TWO hops: ours, and Google's", chain.length, 2);
  /* NULL-TOLERANT for control arm (6)'s sake, and the empty object is NOT a
     softening: every assertion below reads a named key off it and gets
     `undefined`, which fails against the literal it is compared with. What it
     buys is that the suite reaches its own FOOT with a real tally instead of
     dying at the first dereference and reporting -1 — the difference between a
     control that measures and a control that merely crashes. */
  const h0 = chain[0] || {}, h1 = chain[1] || {};
  t("hop 0 is unchanged — this instance, direct, unbound",
    [h0.who, h0.via, h0.bound],
    ["instance drvtest (CivicOS/test)", "direct", false]);
  /* THE THREE FACTS THE ITEM OWES. */
  t("FACT 1 — the export address, as the plane composed it",
    h1.export_address, `https://docs.google.com/document/d/${ID.doc}/export?format=odt`);
  t("FACT 2 — the export format", h1.export_format, "odt");
  t("FACT 3 — the producer, and it is GOOGLE and not this instance",
    h1.producer, DRIVE_PRODUCER);
  t("the hop names the file and the kind, so the three facts are re-derivable by anyone holding the chain",
    [h1.drive_file_id, h1.drive_kind], [ID.doc, "document"]);
  t("the hop keeps the DOCUMENT address beside them", h1.document_address, A.doc);
  t("the hop is UNBOUND and says why in words, never by omission",
    [h1.bound, /conversion performed at fetch time/.test(h1.unsigned_reason || "")],
    [false, true]);
  t("the hop's own `via` is `direct`, because the FETCH was direct — grade tracks "
    + "directness, and the conversion is technique", h1.via, "direct");
  t("the hop states that the export address was COMPOSED here and read from no request (D-112)",
    /COMPOSED BY THIS INSTANCE/.test(h1.evidence), true);
  t("and the format was CONFIRMED from the bytes rather than taken from Google's label",
    [h1.export_format_confirmed, /confirmed from the bytes: odt \(certain\)/.test(h1.evidence)],
    [true, true]);
  /* CORRECTED WHILE BUILDING, and stated rather than quietly reworded: this read
     `cap.doc.document.via` and asserted `"direct"`. I1 §4 lists `via` as a
     top-level field of the acquire document, and THE PLANE DOES NOT EMIT ONE --
     `via` reaches the record on the HOPS and through `captured_locators`. The
     assertion was measuring a field that does not exist and would have passed the
     moment anybody wrote one with any value. What it MEANT to claim is that the
     closed two-term set did not gain a third for this item, and that claim is made
     where the value actually lives. DESIGN GAP, reported: I1 §4's `via` row
     describes a field the acquire document has never carried. */
  t("`via` does not gain a term for this — the closed set holds, on both hops",
    cap.doc.document.provenance_chain.map((h) => h.via), ["direct", "direct"]);
  t("and the acquire document itself carries no top-level `via` — I1 §4 says it does, "
    + "and the plane has never emitted one (reported as a DESIGN GAP, not corrected here)",
    Object.prototype.hasOwnProperty.call(cap.doc.document, "via"), false);
  t("the grade is untouched: a Drive export is a DIRECT capture of Google's answer",
    cap.doc.document.capture.grade, "B");
}

console.log("\n--- 2b. KEEPING THE LINK: the capture answers to the Drive address ---");
{
  /* This is what "keep the link" MEANS in the store: a page that links to the Doc
     resolves against `captured_locators` and finds these bytes. The row is read
     over the Durable Object the way REC-26's reader is reached. */
  const st = await mf.getDurableObjectNamespace("STORE");
  const id = st.idFromName("bio");
  const stub = st.get(id);
  for (const [name, addr, flavour] of [["doc", A.doc, "odt"], ["sheet", A.sheet, "ods"],
                                       ["slides", A.slides, "odp"]]) {
    const out = await stub.capturedLocators({ addressNorm: normalizeAddress(addr) });
    const row = (out.rows || [])[0] || null;
    t(`${name}: the capture is FILED UNDER THE DRIVE ADDRESS, not under the export address`,
      row ? row.address : null, addr);
    t(`${name}: the link is kept EXACTLY as it was captured — the fragment and all`,
      row ? row.address === addr : false, true);
    t(`${name}: the retrieval locator beside it is the export address`,
      row ? row.retrieval_locator : null, exp(addr));
    t(`${name}: and it is the EXPORT bytes the Drive address answers to`,
      row ? row.capture_sha : null, EXPORT_SHA[flavour]);
    t(`${name}: via stays \`direct\` — the identity/bracket arm reads direct rows and must keep seeing these`,
      row ? row.via : null, "direct");
  }
  /* AND THE EXPORT ADDRESS IS NOT ALSO FILED AS A DOCUMENT ADDRESS. If it were,
     the record would hold two documents where there is one, and C-18.3's
     corroboration fold would read them as a missed corroboration. */
  const atExport = await stub.capturedLocators(
    { addressNorm: normalizeAddress(exp(A.doc) || A.doc) });
  t("the EXPORT address is not itself filed as a document address — one document, one row",
    (atExport.rows || []).length, 0);
}

/* ====================================================================== 3
 * THE REFUSALS — every one NAMED, none a silent skip
 * ==================================================================== */
console.log("\n--- 3. folders, files and unread shapes are NAMED as not harvestable ---");
{
  const row = (code) => DRIVE_CAPTURE_CHECKS[code];
  /* THE C-NUMBER IS A LITERAL AT ITS OWN DRIVEN REFUSAL, beside the catalogue
     comparison rather than instead of it. The two claims are different and both
     are owed: the catalogue comparison says "the wire carries whatever the
     catalogue says", which stays true if the catalogue is wrong; the literal says
     "this condition is C-48.2", which is what `coverage.mjs` counts as the check
     being NAMED BY AN ASSERTION. A check never named is exercised only in the
     direction that passes — the C-20.1 defect class, where the audit was clean
     because it was not looking. */
  for (const [label, addr, code, cnum, status] of [
    ["a folder", A.folder, "DRIVE_FOLDER_NOT_A_DOCUMENT", "C-48.2", 422],
    ["a file with no kind", A.file, "DRIVE_KIND_UNDETERMINED", "C-48.3", 422],
    ["an unread Drive shape", A.weird, "DRIVE_SHAPE_UNRECOGNISED", "C-48.4", 422],
  ]) {
    const res = await mf.dispatchFetch("http://x/api/?op=acquire&token=mem-drv",
      { method: "POST", body: JSON.stringify({ locator: addr }) });
    const r = await res.json();
    t(`${label}: refused, never captured`, r.ok, false);
    t(`${label}: BY NAME — ${code}`, r.reason, code);
    t(`${label}: carrying the catalogue's C-number and its canned sentence, from the ONE place they live`,
      [r.check, r.translation], [row(code).check, row(code).translation]);
    t(`${label}: and the check it fires is ${cnum}, named here as a literal so the condition is "named by an assertion"`,
      r.check, cnum);
    t(`${label}: and it answers ${status}, not a 200 with nothing in it`, res.status, status);
    t(`${label}: the shape is NAMED on the answer, so an operator learns which kind of absence this is`,
      typeof r.drive?.shape === "string" && r.drive.harvestable === false, true);
    t(`${label}: nothing was captured — no sha, no document`,
      [r.document, r.existed], [undefined, undefined]);
  }
}

console.log("\n--- 3a. the export fetch failing REFUSES, and the shell is NOT filed as a fallback ---");
/* THE 403 ARM IS NOT HERE. It is the last block in this file, and that is a
   FINDING about the subject rather than a convenience: a 403 makes the per-host
   governor escalate and hold `docs.google.com` for 30 s, so running it here made
   every later Drive block answer `HOST_COOLING_OFF`. That is the governor
   applying UNCHANGED to the export fetch -- item requirement (5) -- arriving as a
   measurement instead of as a claim, and it is recorded rather than smoothed. */
{
  const r = await acquire({ locator: A.gone });
  t("404: the capture is REFUSED", r.ok, false);
  t("404: by name, with the failure named",
    [r.reason, r.status], ["DRIVE_EXPORT_UNREACHABLE", 404]);
  t("404: the catalogue's sentence reaches the caller",
    r.translation, DRIVE_CAPTURE_CHECKS.DRIVE_EXPORT_UNREACHABLE.translation);
  t("404: and the check it fires is C-48.6", r.check, "C-48.6");
  t("404: THE SHELL IS NOT FILED AS A FALLBACK -- no capture at all", r.document, undefined);
  t("404: and the answer names the document address, not only the export address",
    [r.locator, r.export_address], [A.gone, exp(A.gone)]);
  const st = await mf.getDurableObjectNamespace("STORE");
  const stub = st.get(st.idFromName("bio"));
  const out = await stub.capturedLocators({ addressNorm: normalizeAddress(A.gone) });
  t("404: nothing is filed under the document address -- the refusal left no residue",
    (out.rows || []).length, 0);
}

console.log("\n--- 3b. the application shell at the export address is REFUSED BY NAME, never parsed ---");
{
  /* ARM ONE: Google declares text/html. Refused on the header, before the body
     is read at all. */
  const r1 = await acquire({ locator: A.shellCt });
  t("declared text/html: refused", r1.ok, false);
  t("— BY NAME", r1.reason, "DRIVE_EXPORT_IS_THE_SHELL");
  t("— naming WHAT it was refused on, so the two arms are distinguishable in the record",
    [r1.refused_on, r1.declared_content_type], ["the declared content type", "text/html"]);
  t("— the catalogue's sentence reaches the caller",
    r1.translation, DRIVE_CAPTURE_CHECKS.DRIVE_EXPORT_IS_THE_SHELL.translation);
  t("— and the check it fires is C-48.5", r1.check, "C-48.5");
  t("— and NOTHING was filed: the shell is never the document", r1.document, undefined);

  /* ARM TWO: Google declares a document and sends the shell. Detection is
     bytes-first and CERTAIN, which is the whole reason this arm exists. */
  const r2 = await acquire({ locator: A.lyingCt });
  t("declared application/octet-stream, bytes are HTML: refused", r2.ok, false);
  t("— BY ITS OWN NAME, because it is a different finding about Google",
    r2.reason, "DRIVE_EXPORT_BYTES_ARE_THE_SHELL");
  t("— refused on THE BYTES, with the label it disbelieved recorded beside them",
    [r2.refused_on, r2.declared_content_type], ["the bytes", "application/octet-stream"]);
  t("— and the detection that caught it is the registry's own, certain",
    [r2.detected?.format, r2.detected?.confidence], ["html", "certain"]);
  t("— the catalogue's sentence reaches the caller",
    r2.translation, DRIVE_CAPTURE_CHECKS.DRIVE_EXPORT_BYTES_ARE_THE_SHELL.translation);
  t("— and the check it fires is C-48.7, its OWN number and not C-48.5's — two predicates, "
    + "two codes, both drivable (PL-4)", r2.check, "C-48.7");
  t("— and NOTHING was filed", r2.document, undefined);

  const st = await mf.getDurableObjectNamespace("STORE");
  const stub = st.get(st.idFromName("bio"));
  for (const addr of [A.shellCt, A.lyingCt]) {
    const out = await stub.capturedLocators({ addressNorm: normalizeAddress(addr) });
    t(`the shell left no row under ${addr.slice(-9)}`, (out.rows || []).length, 0);
  }
  /* THE STRONGEST FORM OF THE CLAIM: the shell's bytes are nowhere in R2 under
     this store. A refusal that stored the bytes anyway would satisfy every
     assertion above and still have put Google's application into the corpus. */
  const bucket = await mf.getR2Bucket("CAPTURES");
  const held = (await bucket.list()).objects.map((o) => o.key);
  t("THE SHELL'S BYTES ARE NOT IN THE STORE AT ALL — not stored-then-unreferenced, absent",
    held.some((k) => k.endsWith(SHELL_SHA)), false);
  console.log(`    corpus: ${held.length} object(s) in CAPTURES; the three exports and the ordinary captures`);
  t("and the corpus is non-empty, so the assertion above is over something", held.length > 0, true);
}

console.log("\n--- 3c. D-112: a hop fact supplied by the caller is REFUSED, not dropped ---");
{
  /* EVERY KEY, DRIVEN. A list of spellings goes stale the moment a fourth is
     written, so the suite walks the module's own list rather than retyping three
     of them — and floors it, because a walk over an empty list passes. */
  console.log(`    corpus: ${DRIVE_HOP_FACT_KEYS.length} refused keys · ${DRIVE_HOP_FACT_KEYS.join(", ")}`);
  t("the refused-key list is non-empty and covers the three facts the hop carries",
    [DRIVE_HOP_FACT_KEYS.length >= 8,
     ["export_address", "export_format", "producer"].every((k) => DRIVE_HOP_FACT_KEYS.includes(k))],
    [true, true]);
  const outcomes = [];
  for (const key of DRIVE_HOP_FACT_KEYS) {
    const r = await acquire({ locator: A.doc, [key]: "anything at all" });
    outcomes.push([key, r.ok, r.reason, r.check]);
  }
  t("EVERY hop-fact key is refused, by the same name, carrying the same C-number",
    outcomes.map(([k, ok, reason, check]) => `${k}:${ok}:${reason}:${check}`),
    DRIVE_HOP_FACT_KEYS.map((k) => `${k}:false:DRIVE_HOP_FACT_SUPPLIED:C-48.1`));
  /* THE FENCE IS NOT SCOPED TO DRIVE ADDRESSES. A caller inventing an export
     format for a document on any host is performing the same act, and a fence
     that only fires where we already look is one anybody steps around by
     changing the address. */
  const off = await acquire({ locator: "https://www.oaklandca.gov/report.pdf", producer: "City Auditor" });
  t("and it fires on a NON-Drive address too — the act is the invention, not the host",
    [off.ok, off.reason, off.check], [false, "DRIVE_HOP_FACT_SUPPLIED", "C-48.1"]);
  /* THE REFUSAL IS LOUD RATHER THAN SILENT, and this assertion is the one the
     control arm proved necessary: neutering the fence leaves the capture
     SUCCEEDING with the plane's own correct hop, so a silent drop would be
     behaviourally invisible and nothing would ever notice the fence had gone. */
  const r = await acquire({ locator: A.doc, export_format: "pdf" });
  t("the caller is TOLD which keys were refused — a caller told nothing learns nothing",
    r.supplied, ["export_format"]);
  t("and no capture happened under it", r.document, undefined);
}

/* ====================================================================== 4
 * OVER-STRICTNESS — the ordinary path is untouched
 * ==================================================================== */
console.log("\n--- 4. a google.com address that is not Drive takes the ORDINARY path ---");
{
  console.log(`    corpus: ${A.ordinary.length} non-Drive addresses · ${A.ordinary.join(" · ")}`);
  t("the over-strictness corpus is floored — an arm over an empty corpus passes over anything",
    A.ordinary.length >= 4, true);
  const ordSha = createHash("sha256").update(ORDINARY_DOC).digest("hex");
  for (const addr of A.ordinary) {
    const r = await acquire({ locator: addr, authority: "City Auditor" });
    t(`${addr.slice(8, 40)}…: captured, ordinarily`, r.ok, true);
    t(`… the bytes are the source's, hashed at receipt`, r.document?.capture?.sha256, ordSha);
    t(`… ONE hop: no Drive hop was appended`, r.document?.provenance_chain?.length, 1);
    t(`… the locator is the address the caller gave, unrewritten`, r.document?.locator, addr);
    t(`… and nothing on the document mentions an export`,
      /export_address|export_format|Google Drive/.test(JSON.stringify(r.document)), false);
  }
  /* AND THE PUBLISH-TO-WEB ADDRESS, which is a DRIVE HOST and still takes the
     ordinary path. This is the over-strictness case inside the handler's own
     territory, and it is the one a careless recogniser breaks. */
  const pub = await acquire({ locator: `https://docs.google.com/document/d/e/2PACX-1vFakePublishedId/pub` });
  t("Google's publish-to-web page is captured ORDINARILY — recognised in order to be left alone",
    [pub.ok, pub.document?.provenance_chain?.length], [true, 1]);
  t("and it is captured at its own address, not diverted to an export",
    pub.document?.locator, `https://docs.google.com/document/d/e/2PACX-1vFakePublishedId/pub`);
}

/* ====================================================================== 5
 * THE RECORD THE CAPTURE LEAVES — C-18.9's chain walk, and the task subject
 * ==================================================================== */
console.log("\n--- 5. the record a Drive capture leaves is one C-18.9 can read ---");
{
  const d = cap.doc.document;
  t("every hop names an attestor, which is all C-18.9 requires of a hop",
    d.provenance_chain.filter((h) => typeof h.who !== "string" || !h.who.trim()).length, 0);
  t("authority is what the caller asserted, recorded as an assertion",
    [d.authority, d.authority_state], ["City of Oakland", "determined"]);

  /* AN UNDETERMINED DRIVE CAPTURE IS HELD, NEVER REFUSED AT INTAKE, and it
     enqueues exactly ONE event -- the producer half of D-98, unchanged by this
     item. Read through `stats()` over the Durable Object because `task_queue`
     has no read route of its own (`taskDrain` is its only reader, and it cannot
     run until the capture is promoted into a bundle, which no intake path does
     here). The DEPTH is what this can drive; the SUBJECT is pinned structurally
     below, and the split is stated rather than papered over. */
  const st = await mf.getDurableObjectNamespace("STORE");
  const stub = st.get(st.idFromName("bio"));
  const before = (await stub.stats()).taskQueue ?? -1;
  const und = await acquire({ locator: A.slides });
  t("an undetermined Drive capture still SUCCEEDS and is held, never refused at intake",
    [und.ok === true, und.document ? und.document.authority_state : null],
    [true, "undetermined"]);
  const after = (await stub.stats()).taskQueue ?? -1;
  t("and it enqueued exactly one event -- the depth measured on both sides, never assumed",
    [before >= 0, after - before], [true, 1]);

  /* THE TASK SUBJECT, PINNED AT THE SOURCE, and the pin is here because the
     BEHAVIOURAL reach stops at the depth. Without this one line in the enqueue,
     the item would have made the record WORSE at the one place a person reads
     it: a member asked "who issued this?" about an undetermined Drive capture
     would have been shown the export address instead of the document. The
     assertion reads the plane's own source at the site, which is the only way to
     see a value that never reaches a caller. */
  const indexSrc = readFileSync(SRC, "utf8");
  const ENQ = /subject:\s*driveCapture \? documentAddress : locator,\s*locator,/;
  t("the inbox event's SUBJECT is the DOCUMENT address for a Drive capture and the "
    + "locator for every other -- one expression, so no existing capture changes by a byte",
    ENQ.test(indexSrc), true);
  /* ITS OWN REACH FIRST: a pattern that matched nothing would make the claim
     above vacuous -- the zero-cost-equality failure arriving in the instrument. */
  t("and the enqueue site this pin reads really is in the source it read",
    indexSrc.includes('kind: "authority-undetermined"'), true);
}

/* ====================================================================== 6
 * THE 403 ARM, LAST, BECAUSE IT LEGITIMATELY COOLS THE HOST
 * ==================================================================== */
console.log("\n--- 6. a 403 at the export address refuses AND the governor holds the host ---");
{
  const r = await acquire({ locator: A.forbidden });
  t("403: the capture is REFUSED", r.ok, false);
  t("403: by name, with the failure named",
    [r.reason, r.status, r.check], ["DRIVE_EXPORT_UNREACHABLE", 403, "C-48.6"]);
  t("403: THE SHELL IS NOT FILED AS A FALLBACK", r.document, undefined);
  t("403: the answer names both addresses",
    [r.locator, r.export_address], [A.forbidden, exp(A.forbidden)]);
  /* ITEM REQUIREMENT (5), DRIVEN RATHER THAN CLAIMED: the governor applies to
     the export fetch exactly as it applies to any other. A 403 escalates the
     host, and the NEXT Drive export -- a document that would otherwise succeed --
     is held by our own politeness rather than attempted. That refusal is OURS
     and is not the source failing (D-104), which is why it has its own code. */
  const next = await acquire({ locator: A.doc });
  t("the governor now holds docs.google.com for the export fetch, unchanged and unbypassed",
    [next.ok, next.reason], [false, "HOST_COOLING_OFF"]);
  t("and it is named as OUR pacing, with a retry interval, never as the source refusing",
    typeof next.retry_in_ms === "number" && next.retry_in_ms > 0, true);
}

await mf.dispose();
console.log(`\ndrive: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
