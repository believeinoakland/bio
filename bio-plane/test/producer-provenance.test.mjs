/* D-251: WHO MADE THIS TEXT LAYER — the `/Info` read, and the one direction the
 * answer is allowed to travel.
 *
 * WHY THIS IS NOT THEORY. CPDF-9 MEASURED that 3 of 14 recent Legistar
 * attachments name `Creator: ABBYY FineReader Engine 11`, and those three are
 * exactly the City Clerk's ENACTED CERTIFIED RESOLUTIONS (89484, 89498, 89518
 * CMS): 300-dpi JBIG2 scans under a machine OCR overlay whose garbage —
 * `2022 NOV 23 AM 9* 59 p|{ £0OFFICE OF THE CITY CLERK` where the stamp is —
 * the record has been reading as authored text (MEASUREMENTS.md 2026-08-03 §5).
 * The fixtures below carry THAT EXACT PRODUCER STRING.
 *
 * WHY IT IS DRIVEN THROUGH `op=acquire` AND NOT ASSERTED AT THE PARSER. A
 * store-level or parser-level pass is not evidence a caller can reach the
 * feature — `op=invitelook` shipped with a ReferenceError while 1276 assertions
 * passed (CLAUDE.md). Every accepts-when arm below acquires a document over the
 * wire and reads `reading.text_source`, the chain a member actually sees, or
 * reads I2's own field back through `op=pdfstructure`. The parser-level arms in
 * `pdfstructure.test.mjs` are the unit half and are deliberately not this
 * evidence.
 *
 * THE RULE THIS SUITE EXISTS TO PIN: the classification may only ever make the
 * claim WEAKER. A layer whose producer names OCR software becomes
 * `layer -> ocr(<product>)` WITH THE PRODUCT NAMED FROM THE FILE'S OWN BYTES; a
 * layer with no such marker stays `undetermined` and NEVER "authored", because
 * an absent marker is an absent marker. Every arm is one half of that sentence.
 *
 * NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/producer-provenance.control.mjs`
 * — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs
 * and neither the battery nor the fleet walk must discover it (the
 * `owed-controls.control.mjs` precedent). Three arms, each armed ALONE and each
 * restored by sha256: (1) REMOVE THE `/Info` READ (`readProducer` returns the
 * no-metadata answer) -> the named-engine arms must FAIL; (2) THE ARM THIS ITEM
 * EXISTS FOR — make the classification able to STRENGTHEN, by letting an absent
 * marker read as "authored" -> an assertion must FAIL NAMING IT; (3) an
 * OVER-STRICTNESS arm — a producer string in a spelling nobody anticipated must
 * leave the layer `undetermined` rather than crash or guess. RUN 2026-08-10;
 * the figures are in the control file's header.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { PRODUCER_DETERMINATIONS, OCR_PRODUCER_MARKERS, classifyProducer }
  from "../src/pdfstructure.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* ---- the tiny PDF assembler (the `pdfstructure.test.mjs` / `reading-wire.test.mjs`
   pattern, kept local to this suite exactly as that one keeps it local) ---- */
function pdf(objs, trailer = "") {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"));
      chunks.push(o.stream);
      chunks.push(Buffer.from("\nendstream\n", "latin1"));
    } else {
      chunks.push(Buffer.from(o.body + "\n", "latin1"));
    }
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from(trailer + "%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}

/* A one-page PDF whose Tier-1 text decodes to `lines` (ASCII identity CMap, so
   the decoded text is known byte-for-byte), carrying `infoBody` as its document
   information dictionary — or NO /Info at all when `infoBody` is null, which is
   the absent-marker case and is not a special one. */
function textPdf(lines, infoBody = null) {
  const content = "BT /F1 10 Tf " + lines.map((l, i) =>
    (i ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET";
  const cbuf = Buffer.from(content, "latin1");
  const cmap = `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`;
  const mbuf = Buffer.from(cmap, "latin1");
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${cbuf.length} >>`, stream: cbuf },
    { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>" },
    { num: 6, head: `<< /Length ${mbuf.length} >>`, stream: mbuf },
  ];
  if (infoBody) objs.push({ num: 7, body: infoBody });
  return pdf(objs, `trailer\n<< /Root 1 0 R${infoBody ? " /Info 7 0 R" : ""} >>\n`);
}

/* The measured Legistar agenda text shape (docprofile/doctypes/meeting-agenda.mjs)
   so each fixture READS and its basis carries the composed chain sentence a
   member sees. File numbers are local to this suite (26-95xx). */
const agendaLines = (n1, n2, n3) => [
  "Thursday, July 16, 2026",
  "City of Oakland",
  "Office of the City Clerk",
  "*Rules & Legislation Committee",
  " Agenda - SUPPLEMENTAL",
  "Roll Call /  Call To Order",
  "Subject: ",
  "Certified Enacted Resolution",
  "From: ",
  "Office Of The City Clerk",
  "Recommendation: Adopt A Resolution On Consent",
  "3.1",
  n1,
  "Subject: ",
  "Coliseum Payment Allocation",
  "From: ",
  "Finance Department",
  "Recommendation: Receive An Informational Report",
  "3.2",
  n2,
  "Determination Of Schedule Of Outstanding Committee Items",
  "2",
  n3,
  "Open Forum",
  "Adjournment",
];

/* THE LIVE STRING, character for character as CPDF-9 read it off the Clerk's
   certified enacted resolutions. It sits in /Creator there and not /Producer,
   which is why BOTH fields are read and why this fixture puts it where the
   measurement actually found it. */
const ABBYY = "ABBYY FineReader Engine 11";

const F = {
  /* the measured case: the marker in /Creator */
  abbyyCreator: textPdf(agendaLines("26-9501", "26-9502", "26-9503"),
    `<< /Producer (PDFWriter) /Creator (${ABBYY}) >>`),
  /* the OTHER field, and a DIFFERENT engine, so neither the field nor the
     product is wired in */
  tesseractProducer: textPdf(agendaLines("26-9511", "26-9512", "26-9513"),
    "<< /Producer (Tesseract 5.3.4) >>"),
  /* a UTF-16BE hex producer string naming ABBYY, with a BOM. The string decoder
     is on this path and a marker must not be missed because a producer chose to
     write its metadata in UTF-16. */
  abbyyUtf16: textPdf(agendaLines("26-9521", "26-9522", "26-9523"),
    "<< /Producer <FEFF0041004200420059005900200046 0069006E0065005200650061006400650072> >>"),
  /* NO /Info at all — the absent-marker case */
  noInfo: textPdf(agendaLines("26-9531", "26-9532", "26-9533"), null),
  /* AUTHORED-LOOKING metadata. THE ARM THIS ITEM EXISTS FOR: it must read
     `undetermined`, never "authored". */
  word: textPdf(agendaLines("26-9541", "26-9542", "26-9543"),
    "<< /Producer (Microsoft: Word 2016) /Creator (Microsoft Word) >>"),
  /* AN UNANTICIPATED SPELLING — a real scanning suite nobody wired in. It must
     leave the layer `undetermined` rather than crash or guess. */
  unanticipated: textPdf(agendaLines("26-9551", "26-9552", "26-9553"),
    "<< /Producer (Scanbot Document Recognition Suite 9.2) >>"),
  /* MALFORMED metadata: /Producer is a NUMBER and /Creator a dangling
     reference. Absent, not guessed at, and no throw. */
  malformed: textPdf(agendaLines("26-9561", "26-9562", "26-9563"),
    "<< /Producer 42 /Creator 99 0 R >>"),
};

/* An ENCRYPTED PDF whose /Info NAMES ABBYY in plaintext. In a real encrypted
   document /Info's strings are ciphertext under the Standard Security Handler,
   so a detector that read them would be matching a marker against noise — this
   fixture is the case where the bytes happen to LOOK matchable and must still
   not be classified. */
const ENC = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
  { num: 4, body: "<< /Filter /Standard /V 2 /R 3 /O (0000000000000000) /U (0000000000000000) /P -44 >>" },
  { num: 5, body: `<< /Producer (${ABBYY}) >>` },
], "trailer\n<< /Root 1 0 R /Encrypt 4 0 R /Info 5 0 R >>\n");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d251", MEMBER_TOKEN: "mem-d251", PROBE_TOKEN: "prb-d251", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b) => new Response(b, { headers: { "content-type": "application/pdf" } });
    const key = u.pathname.replace(/^\//, "").replace(/\.pdf$/, "");
    if (key === "enc") return bin(ENC);
    if (F[key]) return bin(F[key]);
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const acquire = async (key) => (await (await mf.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-d251",
  { method: "POST", body: JSON.stringify({ locator: `https://oakland.legistar.com/${key}.pdf`,
                                           authority: "City Clerk" }) })).json());
const structureOf = async (sha256) => (await (await mf.dispatchFetch(
  `http://x/api/?op=pdfstructure&token=mem-d251&sha256=${encodeURIComponent(sha256)}`)).json());
/* The chain's SECOND step, read defensively ON PURPOSE. When the marker is not
   found at all there is no second step, and an assertion that THROWS reading it
   would take the whole suite down with a stack trace — which reports "the suite
   crashed" where the finding is "no engine was named". The negative control's
   first arm removes exactly that read, and it must come back as a want/got the
   next session can read in one line. */
const step1 = (r) => (Array.isArray(r.text_source) && r.text_source[1]) || {};

const docs = {};
for (const key of [...Object.keys(F), "enc"]) docs[key] = (await acquire(key)).document;

console.log("\n--- ACCEPTS-WHEN: a PDF whose /Info NAMES an OCR product reads layer -> ocr(<product>), THROUGH op=acquire ---");
{
  const r = docs.abbyyCreator.reading;
  t("the chain has TWO steps, and the layer step SURVIVED — the classification APPENDED, it did not replace",
    r.text_source.map((s) => s.step), ["layer", "ocr"]);
  t("THE PRODUCT IS NAMED, and named from the FILE'S OWN BYTES rather than from any table",
    step1(r).engine, ABBYY);
  t("recording WHICH /Info field said so", step1(r).field, "creator");
  t("and WHICH marker row fired, so a false positive is traceable to a row",
    step1(r).marker, "abbyy");
  t("the named engine claims NO fidelity: cap null, UNDETERMINED and STATED (no calibration of it exists)",
    step1(r).cap, null);
  t("and says WHERE that null came from rather than leaving it bare",
    /NAMED by the document's own \/Info/.test(step1(r).measured_by || ""), true);
  t("no version is invented, because /Info gave none", step1(r).version, null);
  t("A MEMBER READING THE BASIS SEES THE PRODUCT NAMED", new RegExp(ABBYY).test(r.basis), true);
  t("and sees it as a DERIVATION SEQUENCE, not a label",
    /text layer -> optical character recognition/.test(r.basis), true);
  t("the document still READ — this weakens a provenance claim, it does not refuse the document",
    [r.found, r.content_type], [true, "meeting_agenda"]);
  t("IC-39's untouched fields are still untouched (tier)", r.text_tier, 1);
  t("IC-39's untouched fields are still untouched (container)", r.text_container, "pdf");
}
{
  const r = docs.tesseractProducer.reading;
  t("/Producer is read too, not only /Creator", r.text_source.map((s) => s.step), ["layer", "ocr"]);
  t("naming THAT document's own engine string", step1(r).engine, "Tesseract 5.3.4");
  t("from the producer field", step1(r).field, "producer");
}
{
  const r = docs.abbyyUtf16.reading;
  t("a UTF-16BE hex-encoded producer string is decoded before it is read, so the marker is not missed",
    r.text_source.map((s) => s.step), ["layer", "ocr"]);
  t("and the product is named as the file spelled it", step1(r).engine, "ABBYY FineReader");
}

console.log("\n--- ACCEPTS-WHEN: a fixture with NO marker reads `undetermined` and NEVER \"authored\" ---");
for (const [key, why] of [["noInfo", "no_producer_metadata"],
                          ["word", "no_ocr_marker_in_producer_metadata"],
                          ["unanticipated", "no_ocr_marker_in_producer_metadata"],
                          ["malformed", "no_producer_metadata"]]) {
  const r = docs[key].reading;
  t(`${key}: the chain is the layer step and NOTHING ELSE`, r.text_source.map((s) => s.step), ["layer"]);
  t(`${key}: the word "authored" appears NOWHERE in the provenance a member reads`,
    /authored/i.test(JSON.stringify(r.text_source)), false);
  const st = await structureOf(docs[key].capture.sha256);
  t(`${key}: I2's own field says undetermined — first-class, and STATED`,
    st.text.producer.determination, "undetermined");
  t(`${key}: and NAMES which absence it is`, st.text.producer.why, why);
}
{
  /* THE ARM THIS ITEM EXISTS FOR, stated as its own assertion so a classification
     that learned to STRENGTHEN fails here with the word in the label. */
  const st = await structureOf(docs.word.capture.sha256);
  t("AUTHORING SOFTWARE IN /Info IS NOT EVIDENCE OF AUTHORSHIP: Microsoft Word reads `undetermined`, NEVER \"authored\"",
    st.text.producer.determination, "undetermined");
  t("and the record still CARRIES what the file said, rather than dropping it",
    [st.text.producer.producer, st.text.producer.creator], ["Microsoft: Word 2016", "Microsoft Word"]);
  t("while inventing no ocr block for it", st.text.producer.ocr, null);
}
{
  /* THE OVER-STRICTNESS ARM's subject: a spelling nobody anticipated. */
  const st = await structureOf(docs.unanticipated.capture.sha256);
  t("an unanticipated producer spelling leaves the layer undetermined — it does not crash",
    [st.ok, st.text.producer.determination], [true, "undetermined"]);
  t("and it does not GUESS an engine either", st.text.producer.ocr, null);
  t("while carrying the string verbatim, so a later row can be added ON EVIDENCE",
    st.text.producer.producer, "Scanbot Document Recognition Suite 9.2");
}
{
  const st = await structureOf(docs.malformed.capture.sha256);
  t("a /Producer that is not a string, and a dangling /Creator reference, are ABSENT rather than guessed",
    [st.ok, st.text.producer.producer, st.text.producer.creator], [true, null, null]);
}

console.log("\n--- metadata that exists and CANNOT BE TRUSTED is named, never matched against ---");
{
  const st = await structureOf(docs.enc.capture.sha256);
  t("an encrypted document's /Info is ciphertext: the detector classifies NOTHING and NAMES why",
    [st.text.producer.determination, st.text.producer.why], ["undetermined", "encrypted"]);
  t("and publishes no producer string it could not actually read",
    [st.text.producer.producer, st.text.producer.creator], [null, null]);
  t("even though this fixture's plaintext bytes DO name an OCR product — an outcome that costs nothing to produce is not evidence",
    st.text.producer.ocr, null);
}

console.log("\n--- the VOCABULARY itself: there is no value in it that can strengthen a claim ---");
t("the determinations are exactly these two", PRODUCER_DETERMINATIONS, ["ocr", "undetermined"]);
t("\"authored\" IS NOT A MEMBER, and this assertion is what fails if it ever becomes one",
  PRODUCER_DETERMINATIONS.includes("authored"), false);
t("the vocabulary is frozen, so it cannot acquire one at runtime",
  Object.isFrozen(PRODUCER_DETERMINATIONS), true);
t("every marker row NAMES the pattern that fired", OCR_PRODUCER_MARKERS.every(
  (m) => typeof m.marker === "string" && m.marker && m.re instanceof RegExp), true);

/* One sample per marker row, so a row that stopped firing is caught rather than
   sitting dead — and the key set is asserted against the rows, so a NEW row
   arriving without a sample fails here instead of going unexercised. */
const MARKER_SAMPLES = {
  abbyy: ABBYY,
  finereader: "FineReader Server 14",
  tesseract: "Tesseract 5.3.4",
  omnipage: "OmniPage Ultimate 19",
  readiris: "Readiris Pro 17",
  ocrmypdf: "ocrmypdf 15.4.0",
  "acrobat-capture": "Adobe Acrobat Capture 3.0",
  ocr: "PaperStream OCR 2.5",
};
t("every marker row has a sample — a new row cannot arrive unexercised",
  Object.keys(MARKER_SAMPLES).sort(), OCR_PRODUCER_MARKERS.map((m) => m.marker).sort());
t("and every row DOES fire, naming its own row",
  OCR_PRODUCER_MARKERS.map((m) => classifyProducer({ producer: MARKER_SAMPLES[m.marker] }).ocr?.marker),
  OCR_PRODUCER_MARKERS.map((m) => m.marker));

/* The corpus CPDF-9 actually measured on the authoring side — "the remaining 11
   name authoring software (Word, Acrobat Distiller/PDFMaker/Sign, Quartz,
   Crystal Reports for Legistar agendas) — no false positives for the
   scanner/OCR pattern" (MEASUREMENTS.md 2026-08-03 §5). The same must hold
   here, and `Powered By Crystal` is the producer string of this repository's
   own real Legistar fixture. */
const AUTHORING = ["Microsoft: Word 2016", "Microsoft Word", "Adobe PDF Library 15.0",
  "Acrobat Distiller 11.0 (Windows)", "Adobe PDF Library 20.1 / Acrobat PDFMaker 21",
  "Adobe Acrobat Sign", "Quartz PDFContext", "Powered By Crystal", "Crystal Reports",
  "Scanbot Document Recognition Suite 9.2", "", "   "];
t(`no false positive over ${AUTHORING.length} authoring / unanticipated producer strings`,
  AUTHORING.map((s) => classifyProducer({ producer: s }).determination),
  AUTHORING.map(() => "undetermined"));
t("and the detector answers ONLY inside the vocabulary, over markers and non-markers alike",
  [...Object.values(MARKER_SAMPLES), ...AUTHORING]
    .map((s) => classifyProducer({ producer: s }).determination)
    .every((d) => PRODUCER_DETERMINATIONS.includes(d)), true);

console.log("\n--- THE CONSUMER IMPACT, MEASURED THROUGH THE OP RATHER THAN ARGUED: op=textprovenance ---");
/* CPDF-10 built `reading_text_source` with an `engines` column and an index on
   `(transcribed, terminal_step)` — the INDEX half of "distinguishable in the
   projection, the index and an export". Until this item it had nothing to
   distinguish: every PDF's terminal step was `layer` and every `engines` array
   was empty, so `op=textprovenance&step=ocr` answered NOTHING for a store full
   of machine-transcribed certified resolutions. This arm is that claim tested
   rather than asserted in a document. */
{
  const NOW = "2026-08-10T00:00:00Z";
  let bseq = 0;
  const sha = (v) => createHash("sha256").update(v).digest("hex");
  const bundleMd = (id) => [
    "---", `id: ${id}`, "object_type: information", "schema: information@1",
    `title: "D251 ${id}"`, "current_state: collected", "prior_state: null",
    `created: ${NOW}`, `last_updated: ${NOW}`,
    "produced_by:", "  mode: assisted", "  capability_tier: session",
    "group: believe-in-oakland", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
    "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
    "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
    "monitoring:", "  enabled: false", "  frequency: none", "---", "",
    "## Summary", "", "D-251 bundle.", "", "## Provenance Notes", "",
    "## Session Log", "", "## Review Notes", "",
  ].join("\n");
  const promoteDoc = async (doc) => {
    const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-d251`;
    const md = bundleMd(id);
    const prov = JSON.stringify({ documents: [doc] });
    const r = await (await mf.dispatchFetch("http://x/api/?op=promote&token=mem-d251", { method: "POST", body: JSON.stringify({
      bundleId: id, base: null, snapKey: `20260810T01000${bseq}Z_aaaa1111`, author: "d251",
      meta: { object_type: "information", group: "believe-in-oakland", title: `D251 ${id}`,
              current_state: "collected", created: NOW, last_updated: NOW },
      files: [
        { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
        { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
      ],
      register: [],
    }) })).json();
    return r.ok !== false;
  };
  const provenance = async (step) => (await (await mf.dispatchFetch(
    `http://x/api/?op=textprovenance&token=mem-d251&step=${step}&limit=50`)).json()).result;

  t("the ABBYY-named document promoted", await promoteDoc(docs.abbyyCreator), true);
  t("and the no-marker document promoted beside it", await promoteDoc(docs.noInfo), true);

  const ocr = await provenance("ocr");
  const shas = (r) => (r.documents || []).map((d) => d.capture_sha);
  t("op=textprovenance&step=ocr NOW FINDS the machine-transcribed document — before this item it found nothing",
    shas(ocr).includes(docs.abbyyCreator.capture.sha256), true);
  t("and the index names the ENGINE, which is what a re-run or a calibration would need",
    (ocr.documents || []).find((d) => d.capture_sha === docs.abbyyCreator.capture.sha256)?.engines,
    [ABBYY]);
  t("THE NO-MARKER DOCUMENT IS NOT IN IT — an absent marker does not put a document in the OCR index",
    shas(ocr).includes(docs.noInfo.capture.sha256), false);
  const layer = await provenance("layer");
  t("it is in the layer index instead, where it always was",
    shas(layer).includes(docs.noInfo.capture.sha256), true);
  t("and the ABBYY document is NO LONGER filed there as if it were the same thing",
    shas(layer).includes(docs.abbyyCreator.capture.sha256), false);
}

console.log(`\nproducer-provenance: ${pass} pass, ${fail} fail`);
await mf.dispose();
/* `hygiene.test.mjs` requires the tail to end on the suite's OWN result rather
   than on a bare `exit(1)` — a suite that only exits non-zero cannot be told
   apart from one that never reached its end. */
process.exit(fail ? 1 : 0);
