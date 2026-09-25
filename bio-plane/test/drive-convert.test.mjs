/* NEGATIVE CONTROL: re-run in one step from `bio-plane/` with `node test/drive-convert.control.mjs` (or one arm, `node test/drive-convert.control.mjs letter`). FIVE rows — FOUR ARMS PLUS A BASELINE — run 2026-09-18, each armed ALONE, each file snapshotted to a per-arm pristine copy inside the worktree and every restore verified by sha256 AND by content with the byte count floored (4 of 4 restores MATCH/IDENTICAL/ok). BASELINE 43 pass 0 fail. (1) LETTER — the convert step emitted with cap "B" in src/drive.mjs: DECLARED refused by name; ACTUAL 17/26 — the capture keeps NO chain and a FAILED reading whose basis names "C-35.13 TEXT_CHAIN_LETTER_UNCALIBRATED" (read off the per-format refusal assertion), never a chain that silently lost its conversion. (2) OMIT — the prepend guard in src/index.mjs disarmed, so the Drive chain reads `[layer]` like a direct capture of original bytes: DECLARED red by name; ACTUAL 27/16, the first naming "the chain is TWO steps, the conversion AHEAD of the text layer". (3) SEQUENCE — `derivationCap`'s head-conversion rule disarmed in src/textchain.mjs so an unmeasured conversion "neither raises nor lowers": DECLARED red in block 4 only; ACTUAL 41/2, both doctrine assertions — and NOTHING at the op level moves, which is the measurement behind the header's claim that today's null layer cap makes an op-level test of this rule cost nothing. (4) OVERSTRICT — the step keyed on ANY capture rather than on the Drive recogniser: DECLARED the pins fire; ACTUAL 39/4 — the city .odt, the city PDF and the archive replay each named by its pristine digest pin. */
/* CAP-10 — DEC-75 ENACTED, ACT 1: A GOOGLE DRIVE EXPORT'S TEXT CHAIN CARRIES
 * `convert(google-export, <format>)` AHEAD OF `layer`, WITH CAP UNDETERMINED.
 *
 * THE RULING (DEC-75, BOB #11 at Bob's delegation, 2026-09-14): capture grade is
 * about the FETCH PATH, so a Drive export stays `direct`/B on the capture axis;
 * what Google did to the document is a TRANSFORMATION OF THE TEXT, so it is a
 * derivation step in the chain and the chain rules already say what it is worth
 * — every derivation weakens, and a step nobody measured has cap UNDETERMINED,
 * stated, never a letter. This claims LESS than CAP-8's provisional did, and a
 * calibration row raises it later without a migration (CAP-11 measures).
 *
 * WHAT THIS SUITE DRIVES, AND THROUGH WHAT. Every claim about the step is made
 * about what `op=acquire` answers and what `op=reading` / `op=textprovenance`
 * read back after `op=promote` persisted it — never about a module call alone,
 * because `op=invitelook` shipped with a ReferenceError while 1,276 assertions
 * passed. The module is read directly in exactly one block (4), for the one
 * claim no op can currently distinguish: that an UNMEASURED conversion keeps the
 * document UNDETERMINED even once a later step is measured. Today the `layer`
 * step's own cap is null too, so every chain in the record is already
 * undetermined and an op-level assertion would pass whether or not the rule
 * existed — an equality that costs nothing.
 *
 * THE OVER-STRICTNESS HALF IS A DIGEST PIN, NOT A DESCRIPTION. Every non-Drive
 * chain must be byte-identical to what the tree answered BEFORE this item. The
 * pins below were MEASURED on the pristine tree (92f4c64e, 2026-09-18) by this
 * very file run with `CAP10_MEASURE=1`, which prints the digests instead of
 * asserting them. A pin typed from reading the code would agree with the code
 * for free.
 *
 * WHAT THIS SUITE CANNOT SEE: Google. Every byte here is written by this file.
 * Whether a real export's TEXT is stable across fetches is CAP-11's measurement,
 * and it is what would let a calibration row raise the step.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { ODT_CONTENT_TYPE, ODS_CONTENT_TYPE, ODP_CONTENT_TYPE } from "../src/odf.mjs";
import { derivationCap, captureBound, describeChain } from "../src/textchain.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const MEASURE = process.env.CAP10_MEASURE === "1";

/* ---- independent crc32 + zip assembler (drive.test.mjs's, itself ooxml.test.mjs's) ---- */
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
].join(" ");
const BODY = {
  odt: `<office:text><text:p>Oakland Police Commission, agenda of 14 September 2026.</text:p></office:text>`,
  ods: `<office:spreadsheet><table:table table:name="Budget"><table:table-row>`
     + `<table:table-cell office:value-type="string"><text:p>General Fund</text:p></table:table-cell>`
     + `</table:table-row></table:table></office:spreadsheet>`,
  odp: `<office:presentation><draw:page draw:name="page1"><draw:frame><draw:text-box>`
     + `<text:p>Capital plan</text:p></draw:text-box></draw:frame></draw:page></office:presentation>`,
};
const MIME = { odt: ODT_CONTENT_TYPE, ods: ODS_CONTENT_TYPE, odp: ODP_CONTENT_TYPE };
const odf = (flavour, body = BODY[flavour]) => zip([
  { name: "mimetype", data: MIME[flavour], store: true },
  { name: "META-INF/manifest.xml", data: `<?xml version="1.0" encoding="UTF-8"?>`
    + `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">`
    + `<manifest:file-entry manifest:full-path="/" manifest:media-type="${MIME[flavour]}"/>`
    + `</manifest:manifest>` },
  { name: "content.xml", data: `<?xml version="1.0" encoding="UTF-8"?>`
    + `<office:document-content ${NS} office:version="1.3"><office:body>${body}</office:body>`
    + `</office:document-content>` },
]);

/* ---- a tiny PDF assembler (capture-pagecount.test.mjs's) ---- */
function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"), o.stream, Buffer.from("\nendstream\n", "latin1"));
    } else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const CMAP = `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`;
function textPdf(pages) {
  const mbuf = Buffer.from(CMAP, "latin1");
  const kid = (i) => 5 + 2 * i;
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${pages.map((_, i) => `${kid(i)} 0 R`).join(" ")}] /Count ${pages.length} >>` },
    { num: 3, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 4 0 R >>" },
    { num: 4, head: `<< /Length ${mbuf.length} >>`, stream: mbuf },
  ];
  pages.forEach((lines, i) => {
    const content = "BT /F1 10 Tf " + lines.map((l, j) => (j ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET";
    const cbuf = Buffer.from(content, "latin1");
    objs.push({ num: kid(i), body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] `
      + `/Resources << /Font << /F1 3 0 R >> >> /Contents ${kid(i) + 1} 0 R >>` });
    objs.push({ num: kid(i) + 1, head: `<< /Length ${cbuf.length} >>`, stream: cbuf });
  });
  return pdf(objs);
}

/* ---- the fixtures ---- */
const EXPORT_BYTES = { odt: odf("odt"), ods: odf("ods"), odp: odf("odp") };
/* An ORDINARY OpenDocument file on a city host — the same container as a Drive
   export, and NOT a Drive export. The over-strictness arm's sharpest case: if
   the step were keyed on the FORMAT rather than on the Drive recogniser, this is
   the capture that would wrongly gain it. Its body differs from the export's so
   the two captures cannot share a capture_sha. */
const CITY_ODT = odf("odt", `<office:text><text:p>City Clerk, notice of public hearing.</text:p></office:text>`);
const CITY_PDF = textPdf([["City of Oakland", "Fiscal Year 2026 Budget"], ["Appendix A", "Schedule of transfers"]]);
/* THE ARCHIVE-SOURCED CAPTURE: a two-hop chain (ours, then the Archive's) and a
   replayed OpenDocument file. The row's over-strictness arm names it, because it
   is the OTHER capture whose bytes reached us through a second party — and a
   replay is not a conversion. */
const ARCHIVED_ODT = odf("odt", `<office:text><text:p>Archived minutes of the Finance Committee.</text:p></office:text>`);
const ARC_ADDR = "https://www.oaklandca.gov/minutes.odt";
const TS = "20240115120000";

const ID = {
  doc:    "1AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTt",
  sheet:  "1BbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUu",
  slides: "1CcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVv",
};
const A = {
  doc:    `https://docs.google.com/document/d/${ID.doc}/edit`,
  sheet:  `https://docs.google.com/spreadsheets/d/${ID.sheet}/edit#gid=0`,
  slides: `https://docs.google.com/presentation/d/${ID.slides}/edit`,
};

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-cap10", MEMBER_TOKEN: "mem-cap10", PROBE_TOKEN: "prb-cap10",
              VERSION: "test", INSTANCE_NAME: "cap10test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const p = u.pathname, fmt = u.searchParams.get("format");
    const bin = (b, ct) => new Response(b, { headers: { "content-type": ct } });
    if (u.hostname === "docs.google.com") {
      if (p === `/document/d/${ID.doc}/export` && fmt === "odt") return bin(EXPORT_BYTES.odt, ODT_CONTENT_TYPE);
      if (p === `/spreadsheets/d/${ID.sheet}/export` && fmt === "ods") return bin(EXPORT_BYTES.ods, ODS_CONTENT_TYPE);
      if (p === `/presentation/d/${ID.slides}/export` && fmt === "odp") return bin(EXPORT_BYTES.odp, ODP_CONTENT_TYPE);
      return new Response("unscripted Google address", { status: 500 });
    }
    if (u.hostname === "web.archive.org" && p === "/cdx/search/cdx")
      return bin(JSON.stringify([
        ["urlkey", "timestamp", "original", "mimetype", "statuscode", "digest", "length"],
        ["gov,oaklandca)/minutes.odt", TS, ARC_ADDR, ODT_CONTENT_TYPE, "200",
         "MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MFCJ5MF", String(ARCHIVED_ODT.length)],
      ]), "application/json");
    if (u.hostname === "web.archive.org" && p.includes("id_/")) return bin(ARCHIVED_ODT, ODT_CONTENT_TYPE);
    /* The document's own address is DOWN — the only condition under which the
       archive fallback is eligible at all (RULED: a backup source). */
    if (u.hostname === "www.oaklandca.gov" && p === "/minutes.odt") return new Response("down", { status: 503 });
    if (u.hostname === "www.oaklandca.gov" && p === "/notice.odt") return bin(CITY_ODT, ODT_CONTENT_TYPE);
    if (u.hostname === "www.oaklandca.gov" && p === "/budget.pdf") return bin(CITY_PDF, "application/pdf");
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
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-cap10") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-cap10") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const acquire = (body, tok = "mem-cap10") => post("acquire", body, tok);
/* NULL-TOLERANT READERS. A control arm that drops the step must produce a COUNT,
   not a TypeError that ends the module through no assertion at all (the -1 that
   drive.test.mjs's arm (6) and textchain.test.mjs's arm (f) both paid for). */
const chainOf = (r) => (Array.isArray(r?.document?.reading?.text_source) ? r.document.reading.text_source : null);
const steps = (c) => (Array.isArray(c) ? c.map((s) => s && s.step) : null);
const digest = (c) => sha(JSON.stringify(c ?? null));

/* ====================================================================== */
/* THE PRISTINE PINS — measured on 92f4c64e with CAP10_MEASURE=1, before this
   item's source existed. See the header for why these are not typed by hand. */
/* CORRECTED by D-535 (2026-09-25), not exempted. Every pin digests a chain whose layer step carries index.mjs'
   LAYER_FIDELITY_SOURCE as its `measured_by` text, and D-535 rewrote that text's citation from the file name
   "MEASUREMENTS.md" to prose ("the MEASUREMENTS ledger", so a MEASUREMENTS-only diff stops selecting the suites that
   import the plane). The old pins were right about the old sentence and wrong about nothing else: MEASURED by the
   D-535 worker, with ONLY that one string reverted in index.mjs this suite passed all four old pins 43/0; with it
   restored the four new digests below were read from `CAP10_MEASURE=1` on the D-535 tree (driveOdtPre is the layer
   step ALONE, `slice(1)`, which is cityOdt's chain — as it was on 92f4c64e). Old: 6778f0e3… (odt), c65ae27c… (pdf). */
const PRISTINE = {
  cityOdt:     "7aa7a9a9804fcfb7134eb8fb0b0991787e9be5895a6f9c3d0d76ad196ec29665",
  cityPdf:     "eeb2db5a85c7a8ab35f3751a57ecd5c5082000cd51d27cad030cab651e0ce34f",
  archivedOdt: "7aa7a9a9804fcfb7134eb8fb0b0991787e9be5895a6f9c3d0d76ad196ec29665",
  driveOdtPre: "7aa7a9a9804fcfb7134eb8fb0b0991787e9be5895a6f9c3d0d76ad196ec29665",
};

const NOW = "2026-09-18T00:00:00Z";
const LATER = "2026-09-18T01:00:00Z";
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
const promote = async (id, reading) => {
  const text = infoMd(id);
  const prov = JSON.stringify({ documents: [reading] });
  return post("promote", {
    bundleId: id, base: null,
    snapKey: `20260918T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: "collected", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [] });
};

/* ====================================================================== 0 */
console.log("\n--- 0. the non-Drive captures, acquired first so the pins are about THEM ---");
const cityOdt = await acquire({ locator: "https://www.oaklandca.gov/notice.odt", authority: "City of Oakland" });
const cityPdf = await acquire({ locator: "https://www.oaklandca.gov/budget.pdf", authority: "City of Oakland" });
/* Three recorded failures make the address eligible for the archive fallback —
   `daemon-token.test.mjs`'s route to the same state. A direct attempt through
   the op records ONE failure and the governor then backs the address off, so
   driving three through `op=acquire` measures the governor, not this item. */
{
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  for (const b of [{ outcome: "source_refused", status: 503 }, { outcome: "fetch_failed" },
                   { outcome: "source_refused", status: 404 }])
    await obj.fetch("http://x/recordsourceoutcome",
      { method: "POST", body: JSON.stringify({ addressNorm: ARC_ADDR, ...b }) });
}
const archived = await acquire({ via: "archive.org", address: ARC_ADDR }, "adm-cap10");
const driveDoc = await acquire({ locator: A.doc, authority: "City of Oakland" });

if (MEASURE) {
  /* THE MEASUREMENT MODE. Prints the digests the pins above hold, and the chains
     themselves so the person pinning can see WHAT is being pinned. Asserts
     nothing and exits 0 only when every capture actually produced a chain —
     a digest of `null` would pin the absence of a reading, which is not the
     claim. */
  const rows = { cityOdt: chainOf(cityOdt), cityPdf: chainOf(cityPdf),
                 archivedOdt: chainOf(archived), driveOdtPre: chainOf(driveDoc) };
  for (const [k, c] of Object.entries(rows)) console.log(`PIN ${k} ${digest(c)} ${JSON.stringify(c)}`);
  console.log(`HOPS archivedOdt ${JSON.stringify((archived.document?.provenance_chain || []).map((h) => h.via))}`);
  if (!archived.ok) console.log(`ARCHIVE ${JSON.stringify(archived).slice(0, 800)}`);
  await mf.dispose();
  process.exit(Object.values(rows).every(Array.isArray) ? 0 : 1);
}

t("the three non-Drive captures and the Drive capture all acquired",
  [cityOdt.ok, cityPdf.ok, archived.ok, driveDoc.ok], [true, true, true, true]);
t("every one of them carries a text chain — the pins below are about chains, not about absences",
  [cityOdt, cityPdf, archived, driveDoc].map((r) => Array.isArray(chainOf(r))), [true, true, true, true]);

/* ====================================================================== 1 */
console.log("\n--- 1. THE ITEM: a Drive export's chain is convert(google-export, <format>) -> layer ---");
const drive = { odt: driveDoc };
drive.ods = await acquire({ locator: A.sheet, authority: "City of Oakland" });
drive.odp = await acquire({ locator: A.slides, authority: "City of Oakland" });
for (const fmt of ["odt", "ods", "odp"]) {
  const c = chainOf(drive[fmt]);
  const head = (c && c[0]) || {};
  t(`${fmt}: the chain is TWO steps, the conversion AHEAD of the text layer`, steps(c), ["convert", "layer"]);
  t(`${fmt}: the conversion names its producer and the format it produced`,
    [head.engine, head.format], ["google-export", fmt]);
  /* THE LOAD-BEARING ASSERTION. Not "falsy", not absent: the key is present and
     its value is null, which is how this grammar says UNDETERMINED. */
  t(`${fmt}: its cap is UNDETERMINED — the key present and null, never a letter`,
    [Object.prototype.hasOwnProperty.call(head, "cap"), head.cap], [true, null]);
  t(`${fmt}: and it says in words why it is undetermined, naming what would raise it`,
    /unmeasured/.test(head.measured_by || "") && /CAP-11/.test(head.measured_by || ""), true);
  t(`${fmt}: it names no calibration — none exists, and a pointer to nothing is worse than none`,
    head.calibration ?? null, null);
  /* THE REFUSAL, NAMED WHEN IT FIRES. A step that could not be stated honestly
     (a letter with no calibration, C-35.13) leaves NO chain and a failed reading
     whose basis names the check — never the chain without its conversion. This
     assertion reads that name, so the control's `letter` arm fails here SAYING
     which check refused rather than only that the chain went missing. */
  t(`${fmt}: no chain refusal is named on the reading — the step was stated, not refused`,
    ((drive[fmt].document?.reading?.basis || "").match(/C-35\.\d+ [A-Z_]+/) || [null])[0], null);
  t(`${fmt}: the capture grade is untouched — DEC-75 put the conversion on the TEXT, not the fetch`,
    drive[fmt].document?.capture?.grade, "B");
}
/* THE STEP'S FACTS ARE THE HOP'S FACTS. Both are derived by the plane from the
   recognised address; if the chain and the hop disagreed about the format, one
   of them would be a second opinion about the same fetch. */
{
  const hop = (driveDoc.document?.provenance_chain || [])[1] || {};
  t("the step's format IS the hop's export_format — one derivation, two records of it",
    [(chainOf(driveDoc) || [])[0]?.format, hop.export_format], ["odt", "odt"]);
}
/* THE LAYER STEP AFTER IT IS THE LAYER STEP THAT WAS ALWAYS THERE. The pristine
   Drive chain was `[layer]`; the item PREPENDS and must not touch what follows. */
t("the layer step behind the conversion is BYTE-IDENTICAL to the pre-item Drive chain",
  digest((chainOf(driveDoc) || []).slice(1)), PRISTINE.driveOdtPre);
/* NOT ASSERTED HERE, AND WHY: the reading's `basis` sentence composes
   `describeChain` only when the reader FOUND entities, and this fixture's one
   paragraph yields none — so a basis assertion here would be about the fixture,
   not the step. The sentence is asserted from the acquired chain in block 4. */
t("the reading is a DETERMINED one over the export's text — the step did not cost the reading",
  [driveDoc.document?.reading?.read_from_text, driveDoc.document?.reading?.text_container], [true, "odt"]);

/* ====================================================================== 2 */
console.log("\n--- 2. READ BACK: op=promote persists it, op=reading and op=textprovenance answer it ---");
{
  const r = await promote("INFO-2026-9180-drive", driveDoc.document);
  t("the Drive capture's reading promotes", r.ok, true);
  const read = await get("reading", `sha256=${encodeURIComponent(driveDoc.document?.capture?.sha256)}`);
  t("op=reading finds it", read.found, true);
  t("and the persisted chain is the acquired chain, step for step, byte for byte",
    digest(read.reading?.text_source), digest(chainOf(driveDoc)));
  t("    — the conversion still at its head, cap still null",
    [steps(read.reading?.text_source), read.reading?.text_source?.[0]?.cap], [["convert", "layer"], null]);
  const tp = await get("textprovenance", "limit=50");
  const row = (tp.documents || []).find((d) => d.capture_sha === driveDoc.document?.capture?.sha256) || {};
  t("op=textprovenance publishes `convert` in its step vocabulary", (tp.kinds || []).includes("convert"), true);
  t("its projection counts two steps, and the text was TRANSCRIBED (the conversion is a derivation)",
    [row.steps, row.transcribed, row.terminal_step], [2, true, "layer"]);
  t("it names google-export among the engines — the producer rides `engine`, so the join a calibration needs is there",
    row.engines, ["google-export"]);
  t("and its derivation cap is UNDETERMINED, stated as null — the column present, its value null",
    Object.prototype.hasOwnProperty.call(row, "derivation_cap") ? row.derivation_cap : "absent", null);
}

/* ====================================================================== 3 */
console.log("\n--- 3. OVER-STRICTNESS: every non-Drive chain is byte-identical to the pre-item answer ---");
t("a city OpenDocument file — SAME container, not a Drive export — carries no conversion",
  steps(chainOf(cityOdt)).includes("convert"), false);
t("    and its chain is byte-identical to the pristine tree's", digest(chainOf(cityOdt)), PRISTINE.cityOdt);
t("a city PDF's chain is byte-identical to the pristine tree's", digest(chainOf(cityPdf)), PRISTINE.cityPdf);
/* The two `via` values are the PRISTINE tree's answer, measured with
   CAP10_MEASURE=1 (both hops of an archive capture carry `archive.org`), not
   what this file's author expected — the first draft said ["direct",
   "archive.org"] and the measurement corrected it before any assertion ran. */
t("an ARCHIVE-sourced capture keeps its two-hop provenance chain, as the pristine tree recorded it",
  (archived.document?.provenance_chain || []).map((h) => h.via), ["archive.org", "archive.org"]);
t("    and a replay is not a conversion: its text chain is byte-identical to the pristine tree's",
  digest(chainOf(archived)), PRISTINE.archivedOdt);

/* ====================================================================== 4 */
console.log("\n--- 4. THE DOCTRINE, where no op can see it yet: an unmeasured conversion stays UNDETERMINED ---");
{
  /* Today every `layer` step is null, so every chain is undetermined and blocks
     1-3 would pass whether or not the rule below existed. This block gives the
     layer step a LETTER — the day a text layer is calibrated — and asks what the
     Drive chain then claims. Built from the ACQUIRED chain, so it is the plane's
     step under test, not one this file composed. */
  const acquired = chainOf(driveDoc) || [];
  const calibratedLayer = acquired.slice(1).map((s) => ({ ...s, cap: "C", calibration: "CAL-9001" }));
  const withConvert = [...acquired.slice(0, 1), ...calibratedLayer];
  t("control: the same layer step WITHOUT the conversion reads its letter", derivationCap(calibratedLayer), "C");
  t("WITH the unmeasured conversion ahead of it, the document is UNDETERMINED — no downstream "
    + "measurement saw the original, so none bounds what the conversion lost",
    derivationCap(withConvert), null);
  t("and the capture axis is bounded to UNDETERMINED, stated — never the byte grade passed through",
    captureBound(withConvert, "B"), null);
  t("describeChain states both steps in the order they happened",
    describeChain(acquired), "the document as converted by the host that served it (google-export to odt) "
      + "-> the document's own text layer");
}

await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
