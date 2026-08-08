/* CPDF-10: the Tier-3 OCR path — the PROVENANCE CHAIN, the confidence
 * contract, the image-region anchor, and member attestation.
 *
 * WHAT THIS SUITE PROVES AND WHAT IT CANNOT, said first because the honest
 * boundary is this item's deliverable:
 *
 *   IT PROVES the consumer side end to end — a chain that cannot collapse to a
 *   label, a derivation that cannot claim to have improved what it received, a
 *   confidence that cannot be self-reported, a region below the floor that
 *   becomes `undetermined` with its text DISCARDED, an anchor that must exist,
 *   an attestation refused to a machine credential and scoped to what was
 *   checked, and an OCR'd document distinguishable from a text-layer one in the
 *   projection, in the index and in an export.
 *
 *   IT DOES NOT PROVE ANY ENGINE, AND IT MEASURES NO ACCURACY. There is no OCR
 *   engine in this repository and no page renderer; both are CPDF-12's, running
 *   in parallel. The Tier-3 arms below drive a STUB `OCR_WORKER` that answers
 *   the declared contract (`ocrTextFromMember` in index.mjs). That is evidence
 *   about THE WIRE AND THE RULES, not about transcription quality, and it is
 *   named that way at each arm so no later reader mistakes a green here for a
 *   measured engine. The floor every real engine is scored against stays
 *   CPDF-9's (99.96% char, 90/90 digits, zero minted) and lives in
 *   MEASUREMENTS.md, not here.
 *
 * THE ONE THING THE STUB CANNOT FAKE, and it is why the stub is worth having:
 * every refusal below is driven by giving the stub something WRONG to say —
 * a pseudo-confidence, a missing anchor, an unnamed engine, a step claiming a
 * stronger cap — and watching the plane refuse it. A conforming stub proves the
 * happy path; the eight non-conforming ones prove the fences, and those fences
 * are what CPDF-12's member will actually meet.
 *
 * A MEASURED FINDING THIS SUITE PINS, because it was the surprise of the item:
 * before CPDF-10, an image-only PDF — the entire class OCR exists for — reached
 * NO escalation at all. `needsTier2` fires when undetermined regions outnumber
 * decoded characters, and a scanned page produces zero of each (no font ever
 * reaches the decode path, so nothing fails), so the test was `0 > 0`. Arm
 * "TIER 1 NAMES THE SCAN" below is the standing assertion for that; it failed
 * before `pageDrawsImage` existed and is not a hypothetical.
 *
 * NEGATIVE CONTROL: see the `NEGATIVE CONTROL:` line below — five arms, each
 * armed ALONE with the others held open, and every one RUN with its result
 * recorded (including the two that came back other than declared).
 */
/* NEGATIVE CONTROL: RUN IT WITH `node test/nc-cpdf10.mjs` — the driver is committed beside this suite, it arms each arm ALONE with the others held open, it declares before each what MUST and MUST NOT fail, and it verifies every restore by sha256 AND by byte comparison against a per-arm pristine copy with the byte count printed and a minimum guarded. SIX ARMS, ALL RUN 2026-08-08 against a BASELINE row of 136/0/foot-reached: (a) `appendStep`'s monotone comparison -> `if (false)` = 2 fail. (b) `undeterminedRegion` keeps the text = 2 fail. (c) `checkConfidence`'s basis test -> `if (false)` = 4 fail. (d) `checkAttestation`'s `isMachineIdentity` arm -> `if (false)` = 7 fail. (e) `extentCovers` returns TRUE for an unknown extent kind = 1 fail. (f) `pdfstructure.mjs` stops naming the image-only page -> `if (false)` = 27 fail (every Tier-3 arm, which is the state this item found the plane in). Each restored byte-identical, sha256 verified, 0 surprises on the final run. **AND THE FIRST RUN OF ARM (f) FOUND A DEFECT IN THIS SUITE RATHER THAN IN ITS SUBJECT**: it reported `pass=-1 fail=-1 foot=false` — a TypeError on `text_source[1].engine` ENDED THE MODULE through no assertion at all. That is fixed by the null-tolerant `steps`/`step` readers below, and it is the reason the driver reports a missing tally as -1 and reads the FOOT line rather than trusting a count. */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import {
  layerChain, appendStep, checkChain, derivationCap, describeChain, isTranscribed,
  terminalStep, checkConfidence, applyConfidenceFloor, checkAnchor, checkAttestation,
  extentCovers, gradeCeiling, captureBound, weaker, STEP_KINDS, CONFIDENCE_BASES,
} from "../src/textchain.mjs";
import { TEXT_CHAIN_CHECKS, BASIS_GRADES, EARNED_CAPTURE_CEILING } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0, reachedFoot = false;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ---- a tiny PDF assembler (the pdfstructure.test.mjs / reading-wire pattern) ---- */
function pdf(objs, trailer = "") {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"));
      chunks.push(o.stream);
      chunks.push(Buffer.from("\nendstream\n", "latin1"));
    } else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from(trailer + "%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}

/* A one-page PDF whose Tier-1 text decodes byte-for-byte (identity CMap). */
function textPdf(lines) {
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
  return pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${cbuf.length} >>`, stream: cbuf },
    { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>" },
    { num: 6, head: `<< /Length ${mbuf.length} >>`, stream: mbuf },
  ]);
}

/* THE IMAGE-ONLY PDF — the class OCR exists for, in the shape CPDF-9 measured
   its real Oakland exhibit to have: no font resource anywhere, one full-page
   DCTDecode image per page. Not a real scan (there is no way to put a real
   scan's pixels through a test that runs no engine) and it does not need to be:
   what is being tested is the plane's ROUTING and REFUSALS, and those turn on
   the file's structure, which this reproduces exactly. */
function scanPdf(pages = 1) {
  const img = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  const content = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: `<< /Type /Pages /Kids [${Array.from({ length: pages }, (_, i) => `${3 + i * 2} 0 R`).join(" ")}] /Count ${pages} >>` },
  ];
  for (let i = 0; i < pages; i++) {
    objs.push({ num: 3 + i * 2, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 ${100 + i} 0 R >> >> /Contents ${4 + i * 2} 0 R >>` });
    objs.push({ num: 4 + i * 2, head: `<< /Length ${content.length} >>`, stream: content });
  }
  for (let i = 0; i < pages; i++)
    objs.push({ num: 100 + i, head: `<< /Type /XObject /Subtype /Image /Width 2550 /Height 3300 /Filter /DCTDecode /Length ${img.length} >>`, stream: img });
  return pdf(objs);
}

/* A BLANK page: no font AND no image. The over-strictness control — it must NOT
   be routed to OCR, because sending an engine over a blank sheet is exactly the
   invitation to invention CPDF-9's own blank-page control was written for. */
const BLANK = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
]);

const SCAN = scanPdf(2);
const agendaLines = (n1, n2, n3) => [
  "Thursday, July 16, 2026", "City of Oakland", "Office of the City Clerk",
  "*Rules & Legislation Committee", " Agenda - SUPPLEMENTAL", "Roll Call /  Call To Order",
  "Subject: ", "Grand Performance Mural", "From: ", "Councilmember Wang",
  "Recommendation: Adopt A Resolution On Consent", "3.1", n1,
  "Subject: ", "Coliseum Payment Allocation", "From: ", "Finance Department",
  "Recommendation: Receive An Informational Report", "3.2", n2,
  "Determination Of Schedule Of Outstanding Committee Items", "2", n3,
  "Open Forum", "Adjournment",
];
const LAYER = textPdf(agendaLines("26-7701", "26-7702", "26-7703"));

/* ===================================================================== *
 * THE STUB OCR MEMBER. It is CPDF-12's contract and nothing more: it answers
 * `POST /transcribe` in the declared shape. `SCRIPT` is what it will say next,
 * so the non-conforming arms below are one assignment each.
 * ===================================================================== */
const OCR_TEXT = agendaLines("26-7801", "26-7802", "26-7803");
const region = (text, page, rect, confidence) => ({ text, confidence,
  source: { kind: "pdf-page", ref: `p${page}`, page, rect } });
const goodAnswer = () => ({
  ok: true, engine: "tesseract", version: "5.3.4-fast", cap: "C",
  measured_by: "MEASUREMENTS.md 2026-08-03 (CPDF-9)", confidence_floor: 0.6,
  pages: [{ page: 0, regions: OCR_TEXT.map((line, i) =>
    region(line, 0, [72, 700 - i * 12, 540, 712 - i * 12], { value: 0.97, basis: "engine" })) }],
});
let SCRIPT = goodAnswer();

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  serviceBindings: {
    OCR_WORKER(request) {
      if (new URL(request.url).pathname !== "/transcribe")
        return new Response("no", { status: 404 });
      if (SCRIPT === "http-500") return new Response("boom", { status: 500 });
      return Response.json(SCRIPT);
    },
  },
  bindings: { ADMIN_TOKEN: "adm-cpdf10", MEMBER_TOKEN: "mem-cpdf10", PROBE_TOKEN: "prb-cpdf10",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b) => new Response(b, { headers: { "content-type": "application/pdf" } });
    if (u.pathname === "/scan.pdf") return bin(SCAN);
    if (u.pathname === "/layer.pdf") return bin(LAYER);
    if (u.pathname === "/blank.pdf") return bin(BLANK);
    return new Response("unscripted", { status: 500 });
  },
});

/* The SAME plane with no OCR member bound. Two instances rather than one with a
   toggle, because "the binding is absent" is a different fact from "the binding
   answered badly" and a test that reached both through one switch could not tell
   the reader which it had proved. */
const mfBare = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-cpdf10", MEMBER_TOKEN: "mem-cpdf10", PROBE_TOKEN: "prb-cpdf10",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b) => new Response(b, { headers: { "content-type": "application/pdf" } });
    if (u.pathname === "/scan.pdf") return bin(SCAN);
    if (u.pathname === "/layer.pdf") return bin(LAYER);
    if (u.pathname === "/blank.pdf") return bin(BLANK);
    return new Response("unscripted", { status: 500 });
  },
});

/* NULL-TOLERANT CHAIN READERS, and they exist because a CONTROL FOUND A DEFECT
   IN THIS SUITE rather than in its subject. Negative-control arm (f) — Tier 1
   stops NAMING the image-only page — leaves `reading.text_source` a one-step
   chain, and `text_source[1].engine` then threw a TypeError that ENDED THE
   MODULE while the tally still read clean. That is this repository's most
   expensive control defect (WORKER.md's first receipt), met here in this item's
   own instrument: the arm reported `pass=-1 fail=-1 foot=false` and would have
   reported a beautiful zero to a harness that trusted a count. Every indexed
   read now goes through these, so a missing chain FAILS LOUDLY and names what
   it wanted. */
const steps = (r) => (Array.isArray(r?.text_source) ? r.text_source : []).map((x) => x.step);
const step = (r, i) => (Array.isArray(r?.text_source) ? r.text_source[i] : null) || {};

const sha = (v) => createHash("sha256").update(v).digest("hex");
const api = async (q, init) => (await (await mf.dispatchFetch(`http://x/api/?${q}`, init)).json());
const acquire = async (path) => (await api("op=acquire&token=mem-cpdf10", { method: "POST",
  body: JSON.stringify({ locator: "https://oakland.legistar.com" + path, authority: "City Clerk" }) })).document;
const acquireBare = async (path) => (await (await mfBare.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-cpdf10", { method: "POST",
  body: JSON.stringify({ locator: "https://oakland.legistar.com" + path, authority: "City Clerk" }) })).json()).document;

let bseq = 0;
const NOW = "2026-08-08T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Chain ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Chain bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const promoteDoc = async (doc) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-chain`;
  const md = bundleMd(id);
  const prov = JSON.stringify({ documents: [doc] });
  const r = await api("op=promote&token=mem-cpdf10", { method: "POST", body: JSON.stringify({
    bundleId: id, base: null, snapKey: "20260808T010000Z_aaaa1111", author: "cpdf10",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Chain ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  }) });
  return { id, promoted: r.ok !== false };
};

/* ===================================================================== */
console.log("\n--- RULE 1: A CHAIN, NEVER A TOKEN ---");
t("a bare label is REFUSED by name", checkChain("layer")?.code, "TEXT_CHAIN_COLLAPSED");
t("and the label it was given is named in the detail",
  /text_source is 'layer'/.test(checkChain("layer").detail), true);
t("an empty chain is refused too — text with no stated origin",
  checkChain([])?.code, "TEXT_CHAIN_EMPTY");
t("so is a null one", checkChain(null)?.code, "TEXT_CHAIN_EMPTY");
t("a step of an unknown kind is neither derivation nor verification, and is refused",
  checkChain([{ step: "guessed" }])?.code, "TEXT_CHAIN_STEP_UNKNOWN");
t("an ocr step that does not NAME its engine is the same collapse one level down",
  checkChain([{ step: "ocr", cap: "C" }])?.code, "TEXT_CHAIN_STEP_UNNAMED");
t("an ai step is held to it identically",
  checkChain([{ step: "ai", cap: "D" }])?.code, "TEXT_CHAIN_STEP_UNNAMED");
t("a well-formed layer chain passes", checkChain(layerChain({ tier: 1, container: "pdf" })), null);
/* OVER-STRICTNESS: a correct chain in a spelling this item did not write. */
t("OVER-STRICTNESS: a chain assembled by hand, with extra fields and no caps, PASSES",
  checkChain([{ step: "pixels", dpi: 300 }, { step: "ocr", engine: "e", version: "1", note: "x" }]), null);

console.log("\n--- RULE 2: EVERY DERIVATION STEP WEAKENS, NEVER STRENGTHENS ---");
const base = appendStep(layerChain({ tier: 1, container: "pdf", cap: "C" }),
                        { step: "ai", engine: "cleanup", version: "1", cap: "D" });
t("a weaker step is accepted and appended", Array.isArray(base) && base.length, 2);
t("and the chain's cap follows the WEAKEST link, computed not declared", derivationCap(base), "D");
const up = appendStep(base, { step: "ai", engine: "polish", version: "2", cap: "B" });
t("a step claiming a STRONGER cap is REFUSED", up.code, "TEXT_CHAIN_STRENGTHENS");
t("and the refusal says why — readable is not reliable",
  /more READABLE, not more RELIABLE/.test(up.detail), true);
t("the refused append did not mutate the chain it was given", base.length, 2);
t("an EQUAL cap is fine (a step may repeat the bound, it just may not raise it)",
  Array.isArray(appendStep(base, { step: "ai", engine: "same", version: "3", cap: "D" })), true);
t("a step with NO cap neither raises nor lowers — undetermined does not overwrite a measurement",
  derivationCap(appendStep(base, { step: "ai", engine: "unmeasured", version: "1" })), "D");

console.log("\n--- ATTESTATION IS NOT A DERIVATION, AND THAT IS THE SUBTLE PART ---");
const ocrChain = appendStep([{ step: "pixels", cap: "C" }],
  { step: "ocr", engine: "tesseract", version: "5.3.4-fast", cap: "C" });
const attested = [...ocrChain, { step: "attested", member: "bob", at: NOW }];
t("appending an attestation does NOT raise the derivation cap", derivationCap(attested), "C");
t("but the chain still RECORDS it — record and grade determinant are different questions",
  terminalStep(attested), "attested");
t("and the sentence names the member",
  /a member checked it against the image \(bob/.test(describeChain(attested)), true);
const tgt = { page: 0, rect: [72, 700, 540, 712] };
const covered = gradeCeiling(attested, tgt,
  [{ member: "bob", at: NOW, extent: { kind: "document" } }]);
t("a covering attestation SUPERSEDES the cap as grade determinant",
  [covered.ceiling, covered.determinant], [EARNED_CAPTURE_CEILING, "attestation"]);
const uncovered = gradeCeiling(attested, { page: 4, rect: [0, 0, 10, 10] },
  [{ member: "bob", at: NOW, extent: { kind: "page", page: 0 } }]);
t("a leg citing OUTSIDE the attested extent does NOT inherit it",
  [uncovered.ceiling, uncovered.determinant], ["C", "derivation"]);

console.log("\n--- SCOPING: THE DEFAULT IS NOT COVERED ---");
t("a document extent covers any target", extentCovers({ kind: "document" }, tgt), true);
t("a page extent covers its own page", extentCovers({ kind: "page", page: 0 }, tgt), true);
t("and NOT another page", extentCovers({ kind: "page", page: 1 }, tgt), false);
const rgn = { kind: "region", source: { kind: "pdf-page", ref: "p0", page: 0, rect: [0, 600, 612, 792] } };
t("a region extent covers a target inside it", extentCovers(rgn, tgt), true);
t("and NOT one outside it", extentCovers(rgn, { page: 0, rect: [0, 0, 100, 100] }), false);
t("an extent of an unknown kind covers NOTHING (the default is no)",
  extentCovers({ kind: "everything" }, tgt), false);
t("a malformed extent covers NOTHING", extentCovers(null, tgt), false);
t("a target with no rect is not covered by a REGION — 'somewhere on that page' is not what was checked",
  extentCovers(rgn, { page: 0 }), false);
t("an INVERTED attested rect still covers what is plainly inside it (a silent fail-safe is still a failure)",
  extentCovers({ kind: "region", source: { kind: "pdf-page", ref: "p0", page: 0, rect: [612, 792, 0, 600] } }, tgt), true);

console.log("\n--- RULE 3: CONFIDENCE WHERE SUPPLIED, none STATED, PSEUDO FORBIDDEN ---");
t("the stated string 'none' is first-class and passes", checkConfidence("none"), null);
t("an engine-computed value passes", checkConfidence({ value: 0.9, basis: "engine" }), null);
t("a SELF-REPORTED confidence is refused BY BASIS, not by value",
  checkConfidence({ value: 0.99, basis: "self_reported" })?.code, "TEXT_CONFIDENCE_PSEUDO");
t("the same number with an engine behind it is fine — only who produced it tells them apart",
  checkConfidence({ value: 0.99, basis: "engine" }), null);
t("a basis-less number is refused", checkConfidence({ value: 0.99 })?.code, "TEXT_CONFIDENCE_PSEUDO");
t("an ABSENT confidence is refused — it is not the same claim as a stated absent one",
  checkConfidence(undefined)?.code, "TEXT_CONFIDENCE_SHAPE");
t("and the vocabulary has exactly two members, by construction",
  Object.keys(CONFIDENCE_BASES), ["engine", "none"]);

console.log("\n--- RULE 4: BELOW THE FLOOR READS undetermined, AND THE TEXT IS DISCARDED ---");
const floored = applyConfidenceFloor([
  region("$26,181,434", 0, [1, 2, 3, 4], { value: 0.98, basis: "engine" }),
  region("$526,181,434", 0, [5, 6, 7, 8], { value: 0.31, basis: "engine" }),
  region("illegible", 0, [9, 10, 11, 12], "none"),
], 0.6);
t("the confident region survives with its text", floored.regions[0].text, "$26,181,434");
t("the sub-floor region's TEXT IS GONE, not flagged beside its own warning", floored.regions[1].text, null);
t("and it is marked undetermined", floored.regions[1].undetermined, true);
t("with a stated why naming both numbers", /decoded at 0.31 against a floor of 0.6/.test(floored.regions[1].why), true);
t("ITS ANCHOR IS KEPT — an unreadable region a reader can still be pointed at",
  floored.regions[1].source.rect, [5, 6, 7, 8]);
t("a stated `none` is NOT floored out — there is no number to compare and inventing a judgement is worse",
  floored.regions[2].text, "illegible");
t("the shortfall is COUNTED so a caller can state it rather than imply a clean read", floored.floored, 1);
const pseudoFloored = applyConfidenceFloor([region("x", 0, [1, 2, 3, 4], { value: 0.99, basis: "vibes" })], 0.6);
t("a pseudo-confidence region becomes undetermined rather than being silently kept OR silently dropped",
  [pseudoFloored.regions[0].text, pseudoFloored.regions[0].undetermined], [null, true]);
t("and the refusal's own detail rides it", /not engine or none/.test(pseudoFloored.regions[0].why), true);

console.log("\n--- THE IMAGE-REGION ANCHOR ---");
t("a well-formed pdf-page anchor passes",
  checkAnchor({ kind: "pdf-page", ref: "p0", page: 0, rect: [1, 2, 3, 4] }), null);
t("no anchor at all is refused", checkAnchor(null)?.code, "TEXT_ANCHOR_MISSING");
t("a page with no rect is refused — a page is not a region a reader can be pointed at",
  checkAnchor({ kind: "pdf-page", page: 0 })?.code, "TEXT_ANCHOR_MISSING");
t("a rect with no page is refused",
  checkAnchor({ kind: "pdf-page", rect: [1, 2, 3, 4] })?.code, "TEXT_ANCHOR_MISSING");
t("a non-pdf-page kind is refused — I2's IC-1 arm carrying page+rect is the one",
  checkAnchor({ kind: "dom", ref: "#x" })?.code, "TEXT_ANCHOR_MISSING");

console.log("\n--- THE CAPTURE-AXIS BOUND: NO THIRD SCALE, AND OCR NEVER RAISES ---");
t("untranscribed text passes the byte grade through untouched", captureBound(null, "B"), "B");
t("a transcription bounds it by the weakest link", captureBound(ocrChain, "B"), "C");
t("OCR NEVER RAISES: a weak byte grade is not improved by a strong transcription",
  captureBound([{ step: "pixels", cap: "A" }, { step: "ocr", engine: "e", version: "1", cap: "A" }], "D"), "D");
t("an UNMEASURED transcription bounds to undetermined, never silently to the byte grade",
  captureBound([{ step: "pixels" }, { step: "ocr", engine: "e", version: "1" }], "B"), null);
t("the letters are BASIS_GRADES', imported not invented", weaker("B", "C"), BASIS_GRADES[2]);
t("and an unknown letter yields undetermined rather than the other one", weaker("B", "Z"), null);

console.log("\n--- DEC-49: EVERY REFUSAL CARRIES A CODE AND A CANNED TRANSLATION ---");
const codesUsed = ["TEXT_CHAIN_COLLAPSED", "TEXT_CHAIN_EMPTY", "TEXT_CHAIN_STEP_SHAPE",
  "TEXT_CHAIN_STEP_UNKNOWN", "TEXT_CHAIN_STEP_UNNAMED", "TEXT_CHAIN_STRENGTHENS",
  "TEXT_CONFIDENCE_PSEUDO", "TEXT_CONFIDENCE_SHAPE", "TEXT_ANCHOR_MISSING",
  "TEXT_ATTEST_MACHINE", "TEXT_ATTEST_EXTENT"];
t("every code this module can mint has a row", codesUsed.filter((c) => !TEXT_CHAIN_CHECKS[c]), []);
t("every row carries a C-number", Object.values(TEXT_CHAIN_CHECKS).filter((r) => !/^C-35\.\d+$/.test(r.check)).length, 0);
t("every row carries a member-facing translation",
  Object.values(TEXT_CHAIN_CHECKS).filter((r) => typeof r.translation !== "string" || r.translation.length < 40).length, 0);
t("every row names the SMALLEST SPAN — a REGION, never a whole file",
  Object.values(TEXT_CHAIN_CHECKS).filter((r) => !/ > is-text-/.test(r.where)).length, 0);
t("the family is exactly the codes the module uses — no orphan rows",
  Object.keys(TEXT_CHAIN_CHECKS).sort(), [...codesUsed].sort());

/* EACH C-NUMBER NAMED ON A REFUSAL THE MODULE ACTUALLY PRODUCED, never read off
   the table beside it. A hand copy of a catalogue agrees with the catalogue for
   free — this repository has measured that five times, including a complete hand
   copy of 131 op names that passed — so every row below DRIVES the condition and
   reads the C-number off the refusal that came back. `coverage.mjs` counts a
   check as NAMED when an assertion names it; these assertions name it because
   the CODE PATH put it there. */
const CHECK_ARMS = [
  ["C-35.1",  () => checkChain("ocr")],
  ["C-35.2",  () => checkChain([])],
  ["C-35.3",  () => checkChain([["not", "an", "object"]])],
  ["C-35.4",  () => checkChain([{ step: "transcribed-somehow" }])],
  ["C-35.5",  () => checkChain([{ step: "ocr", cap: "C" }])],
  ["C-35.6",  () => appendStep([{ step: "ocr", engine: "e", version: "1", cap: "D" }],
                               { step: "ai", engine: "f", version: "1", cap: "A" })],
  ["C-35.7",  () => checkConfidence({ value: 0.99, basis: "how sure I feel" })],
  ["C-35.8",  () => checkConfidence({ basis: "engine" })],
  ["C-35.9",  () => checkAnchor({ kind: "pdf-page", page: 0 })],
  ["C-35.10", () => checkAttestation({ member: "token:member", at: NOW, extent: { kind: "document" } })],
  ["C-35.11", () => checkAttestation({ member: "bob", at: NOW, extent: { kind: "the whole thing" } })],
];
for (const [number, drive] of CHECK_ARMS) {
  const r = drive();
  t(`${number} is carried by the refusal the code path produced, not read off the table`,
    [r?.check, typeof r?.translation === "string" && r.translation.length > 40], [number, true]);
}
/* AND THE REACH ARM: every row in the family was driven above. A per-code loop
   that silently skipped one would look identical to one that covered them all,
   which is how a walk over a short corpus reports clean. */
t("REACH: every row in the family was DRIVEN by the arms above, none skipped",
  Object.values(TEXT_CHAIN_CHECKS).map((r) => r.check).sort()
    .filter((c) => !CHECK_ARMS.map(([n]) => n).includes(c)), []);

/* ===================================================================== *
 * THROUGH THE OP. A store-level pass is not evidence a caller can reach it.
 * ===================================================================== */
console.log("\n--- AN UN-FLEETED INSTANCE: TIER 1 NAMES THE SCAN AND SAYS IT CANNOT READ IT ---");
/* THE DEFAULT INSTANCE, and it is the arm that matters most today: no OCR
   member is installed anywhere, because none exists (CPDF-12 is building it).
   `mfBare` is the plane with NO `OCR_WORKER` binding at all — D-115's
   un-fleeted instance, one tier on from the pdf-worker's own degradation. */
const scan = await acquireBare("/scan.pdf");
t("the image-only PDF was captured and profiled as a pdf", scan.profile.format.format, "pdf");
t("its reading is a FAILED one — nothing was read, and nothing was invented", scan.reading.found, false);
t("it is NAMED a Tier-3 candidate rather than filed as an empty document",
  scan.reading.tier3_candidate, true);
t("and the basis says plainly that no engine is installed, rather than implying an empty document",
  /no OCR engine is installed/.test(scan.reading.basis), true);
t("no chain claims an engine that never ran", steps(scan.reading), ["layer"]);

console.log("\n--- OVER-STRICTNESS: A BLANK PAGE IS NOT A SCAN ---");
const blank = await acquireBare("/blank.pdf");
t("a blank page is NOT routed to OCR — sending an engine over a blank sheet invites invention",
  blank.reading.tier3_candidate, undefined);

console.log("\n--- THE TEXT-LAYER DOCUMENT YIELDS ITS OWN HONEST CHAIN ---");
const layer = await acquire("/layer.pdf");
t("the wire read it and the reader found its legislation", layer.reading.found, true);
t("text_source is a CHAIN, not the token it used to be", Array.isArray(layer.reading.text_source), true);
t("naming one step: the document's own text layer", steps(layer.reading), ["layer"]);
t("with the tier and container it came through", [layer.reading.text_tier, layer.reading.text_container], [1, "pdf"]);
t("and its fidelity is UNDETERMINED, stated — a text layer is itself an unverified transcription",
  step(layer.reading, 0).cap, null);
t("with WHY it is undetermined carried at the step, not left to be inferred",
  /unverified transcription/.test(step(layer.reading, 0).measured_by ?? ""), true);
t("the reading's basis composes the chain's own sentence",
  /the document's own text layer/.test(layer.reading.basis), true);

console.log("\n--- TIER 3 THROUGH THE SEAM (a STUB member: this proves the WIRE, not an engine) ---");
SCRIPT = goodAnswer();
const ocr = await acquire("/scan.pdf?v=2");
t("with a conforming member the scan is READ", ocr.reading.found, true);
t("by the meeting_agenda reader, over OCR'd text", ocr.reading.content_type, "meeting_agenda");
t("and it reached tier 3", ocr.reading.text_tier, 3);
t("the chain names BOTH derivations, in the order they happened",
  steps(ocr.reading), ["pixels", "ocr"]);
t("the ocr step names the engine AND its version",
  [step(ocr.reading, 1).engine, step(ocr.reading, 1).version], ["tesseract", "5.3.4-fast"]);
t("carrying the MEASURED fidelity and where it was measured",
  [step(ocr.reading, 1).cap, /MEASUREMENTS/.test(step(ocr.reading, 1).measured_by ?? "")], ["C", true]);
t("and the two chains are DISTINGUISHABLE at a glance",
  [describeChain(layer.reading.text_source) === describeChain(ocr.reading.text_source)], [false]);

console.log("\n--- ACCEPTS-WHEN: OCR'd TEXT REACHES reading_refs ---");
const bOcr = await promoteDoc(ocr);
t("the OCR'd document promoted", bOcr.promoted, true);
const refOcr = (await api(`op=readingref&token=mem-cpdf10&ref=${encodeURIComponent("legislation:26-7801")}`)).result;
t("op=readingref finds it BY LEGISLATION REFERENCE — the L2->L3 wire carried OCR'd text",
  refOcr.count, 1);
t("naming the bundle", refOcr.documents[0]?.bundle_id, bOcr.id);
const bLayer = await promoteDoc(layer);
const refLayer = (await api(`op=readingref&token=mem-cpdf10&ref=${encodeURIComponent("legislation:26-7701")}`)).result;
t("and the text-layer document is found the same way", refLayer.count, 1);

console.log("\n--- DISTINGUISHABLE IN THE PROJECTION ---");
const projOcr = (await api(`op=reading&token=mem-cpdf10&sha256=${ocr.capture.sha256}`)).result;
t("op=reading spells the provenance out", projOcr.text_provenance?.transcribed, true);
t("naming the last thing that touched the text", projOcr.text_provenance?.terminal_step, "ocr");
t("and the engines it ran through", projOcr.text_provenance?.engines, ["tesseract"]);
t("and the weakest link", projOcr.text_provenance?.derivation_cap, "C");
const projLayer = (await api(`op=reading&token=mem-cpdf10&sha256=${layer.capture.sha256}`)).result;
t("a TEXT LAYER is also `transcribed` — it is somebody else's transcription we decode faithfully",
  projLayer.text_provenance?.transcribed, true);
t("but its terminal step is different, which is what distinguishes them",
  projLayer.text_provenance?.terminal_step, "layer");
t("it ran through NO engine we can name", projLayer.text_provenance?.engines, []);
t("and its fidelity is undetermined, stated", projLayer.text_provenance?.derivation_cap, null);

console.log("\n--- DISTINGUISHABLE IN THE INDEX (a QUERY, not a blob a reader must parse) ---");
const allDocs = (await api("op=textprovenance&token=mem-cpdf10")).result;
t("both documents are in the index", allDocs.count >= 2, true);
const onlyOcr = (await api("op=textprovenance&token=mem-cpdf10&step=ocr")).result;
t("asking for OCR'd documents returns the scan", onlyOcr.count, 1);
t("and it is the scan", onlyOcr.documents[0]?.capture_sha, ocr.capture.sha256);
const onlyLayer = (await api("op=textprovenance&token=mem-cpdf10&step=layer")).result;
t("asking for text-layer documents does NOT return the scan",
  (onlyLayer.documents || []).some((d) => d.capture_sha === ocr.capture.sha256), false);

console.log("\n--- DISTINGUISHABLE IN AN EXPORT ---");
const img = (await api(`op=image&token=adm-cpdf10&id=${encodeURIComponent(bOcr.id)}`)).result || {};
const exported = (JSON.parse(img["data/provenance.json"] || "{}").documents || [{}])[0];
t("the exported bundle carries the chain, step for step", steps(exported.reading), ["pixels", "ocr"]);
t("with the engine named, so a reader OUTSIDE this instance can tell what produced the text",
  step(exported.reading, 1).engine, "tesseract");
t("and it did NOT collapse to a label on the way out",
  typeof exported.reading.text_source, "object");

console.log("\n--- THE MEMBER MUST NOT: eight ways the seam refuses a bad answer ---");
const refuseArm = async (label, script, wants) => {
  SCRIPT = script;
  const d = await acquire(`/scan.pdf?v=${encodeURIComponent(label)}`);
  t(label, [d.reading?.found, wants.test(d.reading?.basis ?? "")], [false, true]);
};
await refuseArm("an unnamed engine leaves the document HONESTLY UNREAD",
  { ...goodAnswer(), engine: "" }, /did not name its engine and version/);
await refuseArm("an unnamed version too", { ...goodAnswer(), version: "" }, /did not name its engine and version/);
await refuseArm("a fidelity it did not measure is refused",
  { ...goodAnswer(), measured_by: "" }, /no MEASURED fidelity/);
await refuseArm("an ok:false answer is carried as a reason, never as silence",
  { ok: false, reason: "PAGE_TOO_LARGE" }, /declined to transcribe/);
await refuseArm("an HTTP failure leaves it unread rather than half-transcribed", "http-500", /answered 500/);
SCRIPT = { ...goodAnswer(), pages: [{ page: 0, regions: [{ text: "invented", confidence: "none" }] }] };
const anchorless = await acquire("/scan.pdf?v=anchorless");
t("EVERY region without an anchor is dropped, so the document reads as unanchored and unread",
  anchorless.reading.found, false);
SCRIPT = { ...goodAnswer(), pages: [{ page: 0, regions: [
  region("$50,000", 0, [1, 2, 3, 4], { value: 0.99, basis: "self_reported" })] }] };
const pseudo = await acquire("/scan.pdf?v=pseudo");
t("a SELF-REPORTED confidence does not put its text in the record", pseudo.reading.found, false);
SCRIPT = { ...goodAnswer(), pages: [{ page: 0, regions: [
  region("$10,000", 0, [1, 2, 3, 4], { value: 0.12, basis: "engine" })] }] };
const belowFloor = await acquire("/scan.pdf?v=floor");
t("a region the engine itself could barely read yields no text — never a plausible number",
  belowFloor.reading.found, false);

console.log("\n--- ATTESTATION: A MEMBER ACT, REFUSED TO A MACHINE CREDENTIAL ---");
const attestBody = (extent, member) => ({ method: "POST",
  body: JSON.stringify({ captureSha: ocr.capture.sha256, member, at: NOW, extent }) });
const machine = await api("op=attesttext&token=mem-cpdf10",
  attestBody({ kind: "document" }, "token:member"));
t("a machine stamp is REFUSED at the store", machine.result?.code ?? machine.reason, "TEXT_ATTEST_MACHINE");
t("naming the credential", /token:member/.test(machine.result?.detail ?? ""), true);
const classy = await api("op=attesttext&token=mem-cpdf10", attestBody({ kind: "document" }, "class:ai"));
t("and so is an organisation class stamp", classy.result?.code, "TEXT_ATTEST_MACHINE");
const nobody = await api("op=attesttext&token=mem-cpdf10", attestBody({ kind: "document" }, ""));
t("an unattributed attestation is refused — unattributed is not attested", nobody.result?.code, "TEXT_ATTEST_MACHINE");
const unscoped = await api("op=attesttext&token=mem-cpdf10", attestBody(null, "bob"));
t("an UNSCOPED attestation is refused rather than read as covering everything",
  unscoped.result?.code, "TEXT_ATTEST_EXTENT");
const badRegion = await api("op=attesttext&token=mem-cpdf10",
  attestBody({ kind: "region", source: { kind: "pdf-page", page: 0 } }, "bob"));
t("a region extent with no rect is refused", badRegion.result?.code, "TEXT_ATTEST_EXTENT");
const noReading = await api("op=attesttext&token=mem-cpdf10", { method: "POST",
  body: JSON.stringify({ captureSha: "0".repeat(64), member: "bob", at: NOW, extent: { kind: "document" } }) });
t("attesting to a document nobody has read is refused", noReading.result?.reason, "NO_READING");

console.log("\n--- ATTESTATION IS SCOPED TO WHAT WAS ACTUALLY CHECKED ---");
const ok1 = await api("op=attesttext&token=mem-cpdf10",
  attestBody({ kind: "region", source: { kind: "pdf-page", ref: "p0", page: 0, rect: [72, 600, 540, 720] } }, "bob"));
t("a scoped attestation lands", ok1.result?.ok, true);
t("and says what it does NOT cover", /does not inherit it/.test(ok1.result?.why ?? ""), true);
const inside = (await api(`op=textattest&token=mem-cpdf10&sha256=${ocr.capture.sha256}&page=0&rect=${encodeURIComponent("[100,650,200,700]")}`)).result;
t("a leg INSIDE the attested region takes the attested ceiling",
  [inside.ceiling?.ceiling, inside.ceiling?.determinant], [EARNED_CAPTURE_CEILING, "attestation"]);
t("naming who checked it", inside.ceiling?.by, ["bob"]);
const outside = (await api(`op=textattest&token=mem-cpdf10&sha256=${ocr.capture.sha256}&page=0&rect=${encodeURIComponent("[0,0,50,50]")}`)).result;
t("a leg OUTSIDE it does not inherit the attestation",
  [outside.ceiling?.ceiling, outside.ceiling?.determinant], ["C", "derivation"]);
t("and says the cap is what bounds it, composed from the chain",
  /bounded by the weakest step/.test(outside.ceiling?.why ?? ""), true);
t("the attestation is listed with its extent", inside.attestations[0]?.extent?.kind, "region");
t("and is not stale — the chain has not moved under it", inside.attestations[0]?.stale, false);
t("op=textattest also reports what the chain SAYS, in words",
  /optical character recognition \(tesseract/.test(inside.chain_says ?? ""), true);

console.log("\n--- THE BOUNDS: BOTH READS PUBLISH `limit` AND `truncated` (REC-60's pair) ---");
/* DRIVEN HERE rather than in `bounds.test.mjs`'s loop, and registered in its
   DRIVEN_ELSEWHERE so its totality pin still covers them: both bounds need a
   CORPUS — two promoted readings, two attestations on one capture — and that
   corpus is built here for the item's own arms. Rebuilding it there would be a
   second fixture for one fact.
   THE BITE IS 1 AND THERE ARE 2 OF EACH, so `truncated` is a MEASUREMENT of
   something the walk actually cut, not a flag read off an empty list. */
const ok2 = await api("op=attesttext&token=mem-cpdf10",
  attestBody({ kind: "page", page: 0 }, "carla"));
t("FIXTURE ARMS THE TRAP: a second attestation exists, so a bite of 1 has something to cut",
  ok2.result?.ok, true);
const attBite = (await api(`op=textattest&token=mem-cpdf10&sha256=${ocr.capture.sha256}&limit=1`)).result;
t("op=textattest: a bite of 1 returns 1", attBite.attestations?.length, 1);
t("and PUBLISHES the bound it was answered at", attBite.limit, 1);
t("and says there is more — the caller is never left guessing whether it saw everything",
  attBite.truncated, true);
const attWhole = (await api(`op=textattest&token=mem-cpdf10&sha256=${ocr.capture.sha256}`)).result;
t("at the default bound it is NOT truncated, so the flag tracks the corpus and not the code path",
  [attWhole.attestations?.length, attWhole.truncated], [2, false]);
const provBite = (await api("op=textprovenance&token=mem-cpdf10&limit=1")).result;
t("op=textprovenance: a bite of 1 returns 1", provBite.documents?.length, 1);
t("publishing its bound", provBite.limit, 1);
t("and saying there is more", provBite.truncated, true);
const provWhole = (await api("op=textprovenance&token=mem-cpdf10")).result;
t("and at the default bound it is not truncated", provWhole.truncated, false);

console.log("\n--- A PURGE TAKES BOTH TABLES (D-113) ---");
await api(`op=purge&token=adm-cpdf10&confirm=bio&bundleId=${encodeURIComponent(bOcr.id)}`, { method: "POST" });
const afterPurge = (await api("op=textprovenance&token=mem-cpdf10&step=ocr")).result;
t("the transcription projection went with the bundle", afterPurge.count, 0);
const attAfter = (await api(`op=textattest&token=mem-cpdf10&sha256=${ocr.capture.sha256}`)).result;
t("and so did the attestation — a member's name must not stand behind text nobody holds",
  attAfter.count, 0);

reachedFoot = true;
await mf.dispose();
await mfBare.dispose();
/* THE FOOT IS PRINTED, not inferred from a tally. A TypeError inside an
   assertion goes through no assertion at all — it ends the module while the
   count still reads clean — so this suite states whether it got here, and the
   battery reads a count that a dead module could not have produced. */
console.log(`\ntextchain: ${pass} passed, ${fail} failed${reachedFoot ? "" : " — NEVER REACHED ITS FOOT"}`);
process.exit(fail ? 1 : 0);
