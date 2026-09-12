/* CPDF-10's ACCEPTANCE ARM: the plane, the THIRD FLEET MEMBER, and a REAL
 * scanned Oakland page — no stub anywhere in the path.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS SUITE EXISTS BESIDE `textchain.test.mjs` RATHER THAN INSIDE IT
 * ─────────────────────────────────────────────────────────────────────────────
 * `textchain.test.mjs` proves the CONSUMER — the chain, the confidence contract,
 * the anchor, attestation, the merge — against a STUB `OCR_WORKER` that answers
 * the declared contract, and it says so in its own header. That suite is left
 * BYTE-UNCHANGED by this item, deliberately: it is this item's OVER-STRICTNESS
 * ARM. If building a real member had required editing the suite that describes
 * what a member must do, the contract would have moved, and a contract that
 * moves to fit its first implementation is not a contract.
 *
 * What is new here is the half a stub cannot give: **a real engine, over real
 * pixels, from a real scanned City Council resolution, reached through the real
 * service binding.** The member boots from its COMMITTED bundle plus its two
 * upload parts, exactly as `newgroup` would install it.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE TWO DOCUMENTS, AND WHY ONE OF THEM HAS SYNTHETIC PIXELS
 * ─────────────────────────────────────────────────────────────────────────────
 * (1) THE REAL PAGE. `pdf-worker/test/fixtures/scan-ccitt-g4-page.pdf` wraps the
 *     exact CCITTFaxDecode stream of page 2 of Oakland Legistar attachment
 *     15721260 — the scanned resolution CPDF-9 ground-truthed and CPDF-15
 *     measured this engine on. Every arm about the ENGINE and the CHAIN runs on
 *     it.
 *
 * (2) A PAGE WITH SYNTHETIC PIXELS, and it is here because of a MEASUREMENT
 *     rather than convenience. The accepts-when asks that OCR'd text reach
 *     `reading_refs`, and a reference only enters that index when a docprofile
 *     recogniser mints an entity from the text. The only recogniser in this
 *     estate that mints one is `meeting-agenda`, which needs line-anchored file
 *     numbers, `Subject:`/`Recommendation:` blocks and an agenda heading —
 *     **and the real page is a RESOLUTION, not an agenda, so it yields none.
 *     That is asserted below rather than worked around, and the gap is filed as
 *     D-321.** D-313 measured why there is no second real page to reach for: the
 *     image-only class is rare and clumped, and two harvests of 1,377 pages
 *     hours apart returned ZERO of it. So the
 *     `reading_refs` arm draws agenda text as PIXELS and sends them through the
 *     SAME real engine over the SAME real wire. **What is synthetic is the ink,
 *     never the engine, the renderer, the binding or the chain** — and the arm
 *     says so at its own site rather than in a footnote.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS SUITE DOES NOT MEASURE
 * ─────────────────────────────────────────────────────────────────────────────
 * ACCURACY. The fidelity the member reports is CPDF-15's measurement and its
 * reach is ONE human-ground-truthed page, ONE engine version, ONE model. The
 * text arms below are PINS on a known page, not a score. **And D-314 travels
 * with every one of them: agreement with the local floor is NOT accuracy, and
 * CPDF-16 measured that NEITHER local model passes the noise control, so no
 * agreement figure may be read as accuracy at all. This suite quotes none.**
 *
 * NEGATIVE CONTROL: RUN 2026-09-12 by `node test/ocr-member-e2e.control.mjs`. THREE ARMS — the three the QUEUE ROW names — each armed ALONE on the REAL path (real plane, real binding, real engine, real scanned page), each rebuilding the member's committed artifact, each declared before arming, each restored by `cp` from a per-arm pristine copy verified by sha256 AND by `cmp` with byte counts printed and floored — never by `git checkout --`, which restores to HEAD and would silently discard uncommitted work (CLAUDE.md, measured twice in two days). BASELINE 63 pass / 0 fail / exit 0 / foot reached. (1) STRIP THE `text_source` MARKER — the member stops naming what performed the derivation, so the plane has nothing to compose a chain from -> **35/28**: the chain arms, the PROJECTION, the INDEX and the EXPORT distinguishability arms all red, and the MUST-NOT held (the text-layer document's own arms never touch the member and stayed green); (2) DROP THE CONFIDENCE FLOOR — the member stops reporting the floor its instance is configured with, so a region the engine could barely read reaches the record as a best guess -> **62/1**, the section-9 floor arm, and only it; (3) COLLAPSE THE CHAIN TO ONE LABEL — the wire records a single `ocr` step with no `pixels` before it (deliberately NOT a literal string: `checkChain` refuses that outright and the arm would then prove the type check rather than the rule) -> **55/8**, every arm asserting the chain names EACH step, in the acquire path AND in the export, **while the index and the terminal-step projection stayed GREEN as declared — they read only the LAST step and structurally cannot see this collapse, which is worth knowing about what those two surfaces can and cannot tell you**. 3 arms run, 0 not as declared, every restore byte-identical, tree re-green at 63/0. Arm (3) mutates `bio-plane/src/index.mjs`, which this item does not own; it is copied aside and restored under verification, on `nc-cpdf10.mjs`'s precedent. The fleet gates' own arms are declared in `fleetbundles.test.mjs`, and the member's six in `ocr-worker/test/ocr-worker.test.mjs`.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { describeChain } from "../src/textchain.mjs";
import { EARNED_CAPTURE_CEILING } from "../checks/bio-checks.mjs";
import { ocrWorkerDef } from "../../ocr-worker/test/memberworker.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const SCAN = new Uint8Array(readFileSync(fileURLToPath(
  new URL("../../pdf-worker/test/fixtures/scan-ccitt-g4-page.pdf", import.meta.url))));

let pass = 0, fail = 0, footReached = false;
process.on("exit", () => {
  if (!footReached) console.log(`\nocr-member-e2e: ${pass} passed, ${fail + 1} failed — SUITE ENDED BEFORE ITS OWN FOOT`);
});
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
/* NULL-TOLERANT CHAIN READERS — `textchain.test.mjs`'s, and for its reason: a
   `TypeError` on `text_source[1].engine` ENDS THE MODULE through no assertion at
   all and the tally still reads clean. That is this repository's most expensive
   control defect and it was met in this item's own instrument. */
const steps = (r) => (Array.isArray(r?.text_source) ? r.text_source : []).map((x) => x.step);
const step = (r, i) => (Array.isArray(r?.text_source) ? r.text_source[i] : null) || {};

/* ---- fixtures ------------------------------------------------------------- */
function pdf(objs) {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"));
      chunks.push(Buffer.from(o.stream));
      chunks.push(Buffer.from("\nendstream\n", "latin1"));
    } else chunks.push(Buffer.from(o.body + "\n", "latin1"));
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}

/* A 5x7 stroke font, and the ONLY thing in this suite that is synthetic. It
   exists to put agenda-shaped INK on a page; everything downstream of the ink —
   the renderer, the engine, the binding, the wire and the chain — is real. The
   scale is 6, MEASURED: at 14 the blocks are read as other letters, at 6 the
   five lines below come back exactly, three runs out of three. */
const FONT = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11], B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e], D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f], G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e], J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f], M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11], O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10], R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e], T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e], V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  1: [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e], 2: [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  4: [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02], 6: [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  7: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08], 9: [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  "-": [0, 0, 0, 0x1f, 0, 0, 0], ":": [0, 0x04, 0, 0, 0, 0x04, 0], " ": [0, 0, 0, 0, 0, 0, 0],
};
/* The file number carries NO ZERO, and that is a measurement rather than a
   flourish: the slashed `0` of a 5x7 font is read as `8`, measured, so the
   fixture uses digits this font renders unambiguously instead of an arm that
   sometimes passes. What the recogniser needs is FOUR digits, not these four. */
const AGENDA_LINES = ["AGENDA", "ROLL CALL", "26-7941", "SUBJECT: PAVING", "RECOMMENDATION: ADOPT"];
const AGENDA_REF = "legislation:26-7941";

function inkPagePdf(lines) {
  const S = 6, GW = 6, GH = 8, PAD = 40;
  const cols = Math.max(...lines.map((l) => l.length));
  const W = PAD * 2 + cols * GW * S, H = PAD * 2 + lines.length * GH * S;
  const rowBytes = Math.ceil(W / 8);
  const buf = Buffer.alloc(rowBytes * H, 0xff);
  const black = (x, y) => { if (x >= 0 && x < W && y >= 0 && y < H) buf[y * rowBytes + (x >> 3)] &= ~(0x80 >> (x & 7)); };
  lines.forEach((line, li) => [...line].forEach((ch, ci) => {
    const g = FONT[ch] || FONT[" "];
    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) {
      if (!((g[r] >> (4 - c)) & 1)) continue;
      for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++)
        black(PAD + (ci * GW + c) * S + dx, PAD + (li * GH + r) * S + dy);
    }
  }));
  const data = deflateSync(buf);
  const content = Buffer.from(`q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`, "latin1");
  return pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] `
                  + `/Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>` },
    { num: 4, head: `<< /Length ${content.length} >>`, stream: content },
    { num: 5, head: `<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceGray `
                  + `/BitsPerComponent 1 /Filter /FlateDecode /Length ${data.length} >>`, stream: data },
  ]);
}
const AGENDA_SCAN = inkPagePdf(AGENDA_LINES);

/** The SAME agenda, as a text LAYER — the document the OCR'd one must be
 *  distinguishable from. Identity CMap, so Tier 1 decodes it byte for byte and
 *  never reaches the member. */
function layerPdf(lines) {
  const content = "BT /F1 10 Tf 72 700 Td " + lines.map((l, i) =>
    (i ? "0 -14 Td " : "") + `(${l}) Tj `).join("") + "ET";
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
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
                  + "/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${cbuf.length} >>`, stream: cbuf },
    { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>" },
    { num: 6, head: `<< /Length ${mbuf.length} >>`, stream: mbuf },
  ]);
}
const LAYER = layerPdf(["AGENDA", "Roll Call", "26-7942", "Subject: Paving", "Recommendation: Adopt"]);
const LAYER_REF = "legislation:26-7942";

/* ---- the plane, with and without the member ------------------------------- */
const serve = (request) => {
  const u = new URL(request.url);
  const bin = (b) => new Response(b, { headers: { "content-type": "application/pdf" } });
  if (u.pathname === "/scan.pdf") return bin(SCAN);
  if (u.pathname === "/agenda-scan.pdf") return bin(AGENDA_SCAN);
  if (u.pathname === "/layer.pdf") return bin(LAYER);
  return new Response("unscripted", { status: 500 });
};
const planeDef = (withMember) => ({
  name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  ...(withMember ? { serviceBindings: { OCR_WORKER: "ocr-worker" } } : {}),
  bindings: { ADMIN_TOKEN: "adm-e2e", MEMBER_TOKEN: "mem-e2e", PROBE_TOKEN: "prb-e2e",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: serve,
});

const mf = new Miniflare({ workers: [planeDef(true), ocrWorkerDef()] });
/* THE SAME PLANE WITH NO MEMBER BOUND. Two instances rather than one with a
   toggle: "the binding is absent" is a different fact from "the member answered
   badly", and a test reaching both through one switch could not tell a reader
   which it had proved (`textchain.test.mjs`'s own reasoning, kept). */
const mfBare = new Miniflare({ workers: [planeDef(false)] });
/* AND A THIRD: the same plane and the same member, with the member configured
   with a CONFIDENCE FLOOR so high that nothing this engine reads clears it. The
   member's default is a stated `null` — no threshold on this engine's confidence
   has been MEASURED, and inventing one would be a number the engine did not
   produce being used to discard text — so a group that HAS measured one sets it,
   and this instance is that group. It exists to drive rule 4 on the real path:
   a region below the floor must yield NO TEXT, never a best guess. */
const mfFloored = new Miniflare({ workers: [
  planeDef(true), ocrWorkerDef({ bindings: { OCR_CONFIDENCE_FLOOR: "0.999999" } })] });

const sha = (v) => createHash("sha256").update(v).digest("hex");
const api = async (q, init) => (await (await mf.dispatchFetch(`http://x/api/?${q}`, init)).json());
const acquire = async (path) => (await api("op=acquire&token=mem-e2e", { method: "POST",
  body: JSON.stringify({ locator: "https://oakland.legistar.com" + path, authority: "City Clerk" }) })).document;

let bseq = 0;
const NOW = "2026-09-12T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Member ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Member bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const promoteDoc = async (doc) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-member`;
  const md = bundleMd(id);
  const prov = JSON.stringify({ documents: [doc] });
  const r = await api("op=promote&token=mem-e2e", { method: "POST", body: JSON.stringify({
    bundleId: id, base: null, snapKey: "20260912T010000Z_aaaa1111", author: "cpdf10",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Member ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  }) });
  return { id, promoted: r.result?.ok === true };
};

try {

console.log("\n--- 1 · A REAL SCANNED OAKLAND PAGE, THROUGH A REAL ENGINE, OVER A REAL BINDING ---");
const real = await acquire("/scan.pdf");
{
  t("the capture landed and the document was read", [!!real, real.reading?.text_tier], [true, 3]);
  t("TIER 3 — and the only way to reach it is a member that actually answered",
    real.reading.text_tier, 3);
  t("the chain names EACH step, in the order it happened", steps(real.reading), ["pixels", "ocr"]);
  t("the ocr step names the ENGINE and its VERSION — what a calibration is OF and what a re-run needs",
    [step(real.reading, 1).engine, step(real.reading, 1).version], ["tesseract-wasm", "0.11.0"]);
  t("both derivation steps carry the same MEASURED cap, because the member measured its pipeline end to end",
    [step(real.reading, 0).cap, step(real.reading, 1).cap], ["C", "C"]);
  t("and each points at the measurement rather than asserting the letter",
    [/MEASUREMENTS\.md/.test(step(real.reading, 0).measured_by ?? ""),
     /CPDF-15/.test(step(real.reading, 1).measured_by ?? "")], [true, true]);
  /* CPDF-13 / IC-73. `null` is the HONEST answer in an instance holding no
     calibration of this engine — the pre-CPDF-13 shape — and it is asserted so
     the absence is a measured fact rather than an unexamined one. A store that
     HAS one joins it here; this store has none and says so by naming none. */
  t("the calibration reference is a stated `null` in a store that holds no calibration of this engine",
    [step(real.reading, 0).calibration, step(real.reading, 1).calibration], [null, null]);
  t("the chain describes itself in one sentence, composed FROM the chain",
    /the page as pixels -> optical character recognition \(tesseract-wasm 0\.11\.0\)/
      .test(describeChain(real.reading.text_source)), true);
}

console.log("\n--- 2 · what the ACQUIRE path records about the transcription, and what the READ path does NOT ---");
{
  t("the reading says what happened to the pages, in the record's own sentence",
    /transcribed by the OCR member/.test(real.reading.basis || ""), true);
  t("and it is a TIER-3 reading read from text, so the member's text reached the reader",
    [real.reading.read_from_text, real.reading.text_tier], [true, 3]);

  /* A MEASURED GAP, ASSERTED SO IT CANNOT QUIETLY CLOSE OR QUIETLY WIDEN.
     `op=pdfstructure` is the READ-time structure/text op and it escalates to
     Tier 2 (`PDF_WORKER`) only — the Tier-3 seam lives on the ACQUIRE path
     alone. So a scan captured BEFORE an instance installs this member can never
     be re-read as text through an op; it must be re-acquired. That is D-115's
     class one tier further on, it is filed as **D-319** rather than fixed here
     (this item's claim excludes `bio-plane/src/**`, and whether that op gains
     the seam automatically or opt-in is a decision, not a patch), and it is
     PINNED here because a gap nothing asserts is a gap the next reader has to
     re-discover. The text pins on this page live in the MEMBER's own suite,
     where the engine's output is read directly. */
  const st = await api(`op=pdfstructure&token=mem-e2e&sha256=${real.capture.sha256}`);
  t("op=pdfstructure answers for this capture", st.ok, true);
  t("it does NOT reach Tier 3 — the read-time op has no OCR seam (a stated gap, not a silent one)",
    st.tier !== 3, true);
  t("and it says what it could not do, per page, rather than returning an empty document",
    (st.text?.undetermined || [])[0]?.reason, "no_text_layer");
}

console.log("\n--- 3 · WITHOUT THE MEMBER the SAME page stays honestly unread (D-115) ---");
{
  const bare = (await (await mfBare.dispatchFetch("http://x/api/?op=acquire&token=mem-e2e",
    { method: "POST", body: JSON.stringify({ locator: "https://oakland.legistar.com/scan.pdf",
                                             authority: "City Clerk" }) })).json()).document;
  t("no crash — an instance that has not installed the fleet still acquires", !!bare, true);
  t("it is NOT tier 3", bare.reading.text_tier !== 3, true);
  t("nothing is claimed about what the page says", bare.reading.found, false);
  t("and the record NAMES the reason rather than filing an empty document",
    /no OCR engine is installed/.test(bare.reading.basis || ""), true);
  t("it is flagged as wanting OCR, so a later install can find it", bare.reading.tier3_candidate, true);
  /* THE ARM THAT MAKES THE THREE ABOVE MEAN SOMETHING: the difference between
     the two instances is the MEMBER and nothing else, so the text in arm 2 came
     from the member and could have come from nowhere else. */
  t("so the transcription in arm 2 is the MEMBER's — the two instances differ by the binding alone",
    [real.reading.text_tier, bare.reading.text_tier === 3], [3, false]);
}

console.log("\n--- 4 · THE CHAIN REACHES reading_refs — through the real engine ---");
{
  /* THE REAL PAGE FIRST, AND ITS HONEST ANSWER. A scanned RESOLUTION page mints
     no entity: the only recogniser here that mints one needs agenda-shaped text.
     Asserted rather than skipped, because "no rows" for the right reason and
     "no rows" because the wire is broken look identical from outside. */
  t("the real page's reading is recorded and read from text", real.reading.read_from_text, true);
  t("and it mints NO reference, because a scanned RESOLUTION is not an agenda — the corpus's answer, not the wire's",
    [real.reading.content_type, real.reading.entities.length], ["generic", 0]);

  /* NOW THE JOIN ITSELF, over agenda-shaped INK through the SAME real engine. */
  const ocrDoc = await acquire("/agenda-scan.pdf");
  t("the ink page went through the member too — tier 3, same chain shape",
    [ocrDoc.reading.text_tier, steps(ocrDoc.reading)], [3, ["pixels", "ocr"]]);
  t("and the engine read it well enough for the recogniser to see an agenda",
    ocrDoc.reading.content_type, "meeting_agenda");
  const bOcr = await promoteDoc(ocrDoc);
  t("the OCR'd document promoted", bOcr.promoted, true);
  const refOcr = (await api(`op=readingref&token=mem-e2e&ref=${encodeURIComponent(AGENDA_REF)}`)).result;
  t("op=readingref finds it BY LEGISLATION REFERENCE — OCR'd text reached the index",
    refOcr.count, 1);
  t("naming the bundle", refOcr.documents[0]?.bundle_id, bOcr.id);

  const layerDoc = await acquire("/layer.pdf");
  t("the text-layer document read WITHOUT the member — it never needed one",
    [layerDoc.reading.text_tier, steps(layerDoc.reading)], [1, ["layer"]]);
  const bLayer = await promoteDoc(layerDoc);
  t("and it reaches the index the same way",
    (await api(`op=readingref&token=mem-e2e&ref=${encodeURIComponent(LAYER_REF)}`)).result.count, 1);

  /* AND THE REAL PAGE IS PROMOTED TOO, so the projection and the index below
     answer about IT and not only about the ink page. The index is written at
     PROMOTE (`reading_text_source` is derived in the same transaction as the
     reading it projects), so a document nobody promoted is honestly absent from
     it rather than missing. */
  const bReal = await promoteDoc(real);
  t("the REAL Oakland scan is promoted, so the index below is about it too", bReal.promoted, true);

  globalThis.__E2E = { ocrDoc, layerDoc, bOcr, bLayer, bReal };
}

console.log("\n--- 5 · DISTINGUISHABLE IN THE PROJECTION ---");
{
  const { ocrDoc, layerDoc } = globalThis.__E2E;
  const projOcr = (await api(`op=reading&token=mem-e2e&sha256=${ocrDoc.capture.sha256}`)).result;
  t("op=reading spells the provenance out in columns", projOcr.text_provenance?.transcribed, true);
  t("naming the last thing that touched the text", projOcr.text_provenance?.terminal_step, "ocr");
  t("and the ENGINE it ran through — the real one", projOcr.text_provenance?.engines, ["tesseract-wasm"]);
  t("and the weakest link over its derivation steps", projOcr.text_provenance?.derivation_cap, "C");
  const projLayer = (await api(`op=reading&token=mem-e2e&sha256=${layerDoc.capture.sha256}`)).result;
  t("a TEXT LAYER is `transcribed` too — it is somebody else's transcription we decode faithfully",
    projLayer.text_provenance?.transcribed, true);
  t("but its terminal step is DIFFERENT, which is what distinguishes them",
    projLayer.text_provenance?.terminal_step, "layer");
  t("it ran through no engine this record can name", projLayer.text_provenance?.engines, []);
  t("and its fidelity is undetermined, STATED", projLayer.text_provenance?.derivation_cap, null);
  /* THE HEADLINE, and it is the one the negative control is pointed at. */
  t("THE TWO ARE NOT THE SAME ROW: an OCR'd document is distinguishable from a published text layer",
    projOcr.text_provenance?.terminal_step === projLayer.text_provenance?.terminal_step, false);
}

console.log("\n--- 6 · DISTINGUISHABLE IN THE INDEX (a QUERY, not a blob a reader must parse) ---");
{
  const { ocrDoc, layerDoc } = globalThis.__E2E;
  const all = (await api("op=textprovenance&token=mem-e2e")).result;
  t("every read document is in the index", all.count >= 3, true);
  const onlyOcr = (await api("op=textprovenance&token=mem-e2e&step=ocr")).result;
  t("asking for OCR'd documents returns the scanned ones and not the layer",
    [(onlyOcr.documents || []).some((d) => d.capture_sha === ocrDoc.capture.sha256),
     (onlyOcr.documents || []).some((d) => d.capture_sha === layerDoc.capture.sha256)],
    [true, false]);
  t("and the REAL Oakland scan is in that same answer",
    (onlyOcr.documents || []).some((d) => d.capture_sha === real.capture.sha256), true);
  const onlyLayer = (await api("op=textprovenance&token=mem-e2e&step=layer")).result;
  t("asking for text-layer documents does NOT return either scan",
    (onlyLayer.documents || []).some((d) => d.capture_sha === ocrDoc.capture.sha256
                                         || d.capture_sha === real.capture.sha256), false);
  t("but it does return the layer", (onlyLayer.documents || []).some((d) => d.capture_sha === layerDoc.capture.sha256), true);
}

console.log("\n--- 7 · DISTINGUISHABLE IN AN EXPORT — outside this instance, where only the bytes speak ---");
{
  const { bOcr, bLayer } = globalThis.__E2E;
  const readExport = async (id) => {
    const img = (await api(`op=image&token=adm-e2e&id=${encodeURIComponent(id)}`)).result || {};
    return (JSON.parse(img["data/provenance.json"] || "{}").documents || [{}])[0];
  };
  const eOcr = await readExport(bOcr.id);
  const eLayer = await readExport(bLayer.id);
  t("the exported OCR'd bundle carries the chain, step for step", steps(eOcr.reading), ["pixels", "ocr"]);
  t("with the REAL engine named, so a reader outside this instance can tell what produced the text",
    [step(eOcr.reading, 1).engine, step(eOcr.reading, 1).version], ["tesseract-wasm", "0.11.0"]);
  t("it did NOT collapse to a label on the way out", typeof eOcr.reading.text_source, "object");
  t("the exported text-layer bundle carries its own honest chain, one step",
    steps(eLayer.reading), ["layer"]);
  t("THE EXPORTS DIFFER, which is the property that survives leaving this instance",
    JSON.stringify(eOcr.reading.text_source) === JSON.stringify(eLayer.reading.text_source), false);
}

console.log("\n--- 8 · ATTESTATION: A MEMBER ACT, REFUSED TO A MACHINE CREDENTIAL, SCOPED TO ITS EXTENT ---");
{
  const attest = (extent, member) => api("op=attesttext&token=mem-e2e", { method: "POST",
    body: JSON.stringify({ captureSha: real.capture.sha256, member, at: NOW, extent }) });
  t("a MINTED machine credential cannot attest — nobody would hold the claim",
    (await attest({ kind: "document" }, "token:member")).result?.code, "TEXT_ATTEST_MACHINE");
  t("nor a bare class word", (await attest({ kind: "document" }, "class:ai")).result?.code, "TEXT_ATTEST_MACHINE");
  t("nor nobody at all — unattributed is not attested",
    (await attest({ kind: "document" }, "")).result?.code, "TEXT_ATTEST_MACHINE");
  t("an UNSCOPED attestation is refused rather than read as covering the whole document",
    (await attest(null, "bob")).result?.code, "TEXT_ATTEST_EXTENT");

  /* SCOPED, and scoped IN THE MEMBER'S OWN COORDINATE SPACE. The regions this
     member returns are anchored in the pixels of the frame that was OCR'd, so an
     attestation over a region is too — and the containment test below is the
     reason the member STATES its space rather than leaving it to be inferred. */
  /* THE RECT A LEG CITES IS ONE THIS MEMBER ACTUALLY RETURNED, taken from the
     member's own answer rather than typed into the arm — because an attestation
     arm over a rectangle no region occupies proves the geometry test and nothing
     about this path. The member is asked directly here, through the SAME
     miniflare that serves it to the plane. */
  const member = await mf.getWorker("ocr-worker");
  const answer = await (await member.fetch("http://ocr-worker/transcribe", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ capture_sha: real.capture.sha256, store: "bio", pages: [0] }),
  })).json();
  t("the member answers for the same capture the plane stored", answer.ok, true);
  const cited = answer.pages[0].regions[0].source.rect;
  const [cx0, cy0, cx1, cy1] = cited;
  const attestedRect = [cx0 - 20, cy0 - 20, cx1 + 20, cy1 + 20];
  const ok = await attest({ kind: "region", source: { kind: "pdf-page", ref: "p0", page: 0,
                                                      rect: attestedRect } }, "bob");
  t("a scoped attestation from a person lands", ok.result?.ok, true);
  const inside = (await api(`op=textattest&token=mem-e2e&sha256=${real.capture.sha256}`
    + `&page=0&rect=${encodeURIComponent(JSON.stringify(cited))}`)).result;
  t("a leg citing a region INSIDE it takes the attested ceiling, superseding the derivation cap",
    [inside.ceiling?.ceiling, inside.ceiling?.determinant], [EARNED_CAPTURE_CEILING, "attestation"]);
  t("and the cited rect is a REAL region this member returned, not one invented for the arm",
    [cited.length, cited.every((n) => Number.isFinite(n)), cx1 > cx0 && cy1 > cy0], [4, true, true]);
  const outside = (await api(`op=textattest&token=mem-e2e&sha256=${real.capture.sha256}`
    + `&page=0&rect=${encodeURIComponent("[2000,3000,2100,3100]")}`)).result;
  t("a leg citing OUTSIDE the attested extent does NOT inherit it — it falls back to the engine's cap",
    [outside.ceiling?.ceiling, outside.ceiling?.determinant], ["C", "derivation"]);
  t("the attestation is listed with the extent it was scoped to",
    inside.attestations[0]?.extent?.kind, "region");
  t("and OCR never raised the capture grade: the derivation cap is still the engine's letter",
    outside.ceiling?.ceiling, "C");
}

console.log("\n--- 9 · THE FLOOR: a region the engine itself could barely read yields NO TEXT, never a best guess ---");
{
  /* RULE 4, driven on the real path rather than on a stub. The member reports
     the floor its instance is configured with; the discard is `textchain.mjs`'s
     `applyConfidenceFloor`, which DELETES the text rather than flagging it —
     "a best guess sitting in a field beside its own warning is one careless join
     away from being read as content".
     THE FLOOR HERE IS 0.999999, which no line of a real scan clears, so the
     whole page is floored and the document comes back UNREAD. That is the point
     and not an edge case: the record's answer to "we could not read this" is
     silence with a reason, never the engine's best attempt. */
  const floored = (await (await mfFloored.dispatchFetch("http://x/api/?op=acquire&token=mem-e2e",
    { method: "POST", body: JSON.stringify({ locator: "https://oakland.legistar.com/scan.pdf",
                                             authority: "City Clerk" }) })).json()).document;
  t("the member ran — the floored instance still reached the engine", !!floored, true);
  t("NOTHING was claimed about what the page says", floored.reading.found, false);
  t("and it is not filed as a read document: no text survived the floor",
    floored.reading.read_from_text, false);
  t("while the SAME page through the SAME member with no measured floor DID read — so the difference is the floor and nothing else",
    [real.reading.read_from_text, real.reading.text_tier], [true, 3]);
}

footReached = true;
} finally {
  await mf.dispose();
  await mfBare.dispose();
  await mfFloored.dispose();
}

console.log(`\nocr-member-e2e: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
