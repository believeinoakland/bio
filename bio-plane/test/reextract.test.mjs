/* NEGATIVE CONTROL: RUN 2026-09-18 — 8 arms, 0 not as declared (RESULTS in `nc-cpdf19.mjs`'s header) — re-run in one step with `node test/nc-cpdf19.mjs` from `bio-plane/`. every arm EDITS A REAL SOURCE, is armed ALONE, and is restored by `cp` from a UNIQUELY-NAMED per-arm pristine copy inside this worktree, verified by sha256 AND by `cmp` with the byte count printed and floored (never `git checkout --`). DECLARED BEFORE ARMING, per `EXTRACTION-BREADTH-DESIGN.md` §8 and the CPDF-19 row: (a) `baseline` — nothing armed; MUST be green, and it is the row that tells all-arms-broken from all-arms-working. (b) `staling` — in src/store.mjs `#writeOneReading`, the REC-82 stale mark's result is replaced by 0 WITHOUT calling it, so a re-read leaves the capture's content rows FRESH; the section-4 stale arms MUST FAIL BY NAME and the opt-out digest arms MUST NOT. (c) `flagignored` — in src/index.mjs the re-read is made unconditional (`ocrAsked` true whatever the request says); the section-1 OPT-OUT arms (the pre-item digest and the engine-not-called count) MUST FAIL. (d) `nomember` — the `REEXTRACT_NO_OCR_MEMBER` refusal is removed, so an instance with no OCR member answers the flag with a 200; the section-2 no-member arm MUST FAIL by its code. (e) `actor` — the store's `reextract` path drops the control plane's author stamp, so the observation is written as the PLANE's rather than the member's; the section-5 actor arms MUST FAIL. (g) `cal` — D-417 reverted (the calibration join addresses the Durable Object by query again); the section-7 arms MUST FAIL. (h) `candidate` — D-418 reverted (`tier3_candidate` decided by the tier-3 note's truthiness, the pre-fix rule); the section-5 AFTER arm and both section-8 arms MUST FAIL. (f) `overstrict` — THE OVER-STRICTNESS DIRECTION: the plain read gains one extra key; the pre-item DIGEST arm MUST FAIL while every re-read arm stays green, proving the digest watches the default path and nothing else. RESULTS are written into `nc-cpdf19.mjs`'s header by the run that produced them.
 *
 * reextract.test.mjs — CPDF-19 / D-319. READ-TIME RE-EXTRACTION TO TIER 3, OPT-IN.
 * `docs/development/EXTRACTION-BREADTH-DESIGN.md` §5.1 and §7 row 5; the row is the
 * authority for scope.
 *
 * THE GAP, as CPDF-10 measured and `ocr-member-e2e.test.mjs` pinned it: `op=acquire`
 * reaches tier 3, `op=pdfstructure` stopped at tier 2, so an instance that installs the
 * OCR member later had no route to the text of what it captured before. This suite
 * drives the seam through the OP, never at the store:
 *
 *   1. WITHOUT THE FLAG the read is byte-identical to the pre-item answer and the engine
 *      is never called (the design's over-strictness control).
 *   2. EVERY REFUSAL BY NAME (C-51): no OCR member bound; a malformed flag; an agent
 *      credential; a member without `contribute`; a capture the record never read.
 *      Each carries its catalogue row, equal to the row, and none of them wrote anything.
 *   3. A DOCUMENT THAT IS NOT A TIER-3 CANDIDATE answers `performed: false`, the engine
 *      is not called, and the reading is untouched.
 *   4. THE RE-READ: tier 3, the chain names each step, the text units REPLACED, the
 *      content row minted under the old chain STALE and still resolving, the reading
 *      re-read through the content-type registry so its references reach the index.
 *   5. THE OBSERVATION: exactly the rows promote's own writer writes, the member as
 *      `actor`, `authority_kind = extract`, `re-extraction` stated — and the capture
 *      leaves the content-axis frontier's candidate list.
 *   6. A RE-PROMOTION OF THE BUNDLE carrying the acquire-time copy does NOT undo it.
 *   7. D-417: the calibration join the acquire path always meant to make now fires.
 *
 * WHAT IT CANNOT SEE, and the sentence is load-bearing: the ENGINE is a stub answering
 * CPDF-12's declared contract (`textchain.test.mjs`'s own, for its own reason — this
 * suite tests routing, writing and refusing, not transcription quality; the real engine
 * over a real scanned page is `ocr-member-e2e.test.mjs`, whose D-319 pin is corrected in
 * the same commit). D-15's hidden-project arm of `REEXTRACT_NOT_READ` is asserted by the
 * store method's use of `#viewerSees` and is NOT driven here with a real hidden project.
 */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { REEXTRACT_CHECKS } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0, footReached = false;
process.on("exit", () => {
  if (!footReached) console.log(`\nreextract: ${pass} passed, ${fail + 1} failed — SUITE ENDED BEFORE ITS OWN FOOT`);
});
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const steps = (chain) => (Array.isArray(chain) ? chain : []).map((x) => x && x.step);

/* ---- fixtures (textchain.test.mjs's assembler and shapes) ------------------ */
function pdf(objs) {
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
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
function textPdf(lines) {
  const content = "BT /F1 10 Tf " + lines.map((l, i) => (i ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET";
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
/* The image-only page: no font, one full-page DCTDecode image. Two variants that
   differ only in the image's declared width, so their bytes — and therefore their
   capture hashes — differ while their structure is identical. */
function scanPdf(width = 2550) {
  const img = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  const content = Buffer.from("q 612 0 0 792 0 0 cm /Im0 Do Q", "latin1");
  return pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im0 100 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${content.length} >>`, stream: content },
    { num: 100, head: `<< /Type /XObject /Subtype /Image /Width ${width} /Height 3300 /Filter /DCTDecode /Length ${img.length} >>`, stream: img },
  ]);
}
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
const SCAN = scanPdf(2550);            /* re-read in section 4 */
const SCAN_UNFILED = scanPdf(2551);    /* acquired, never promoted: section 2 */
const SCAN_CAL = scanPdf(2552);        /* section 7 */
const SCAN_OK = scanPdf(2553);         /* section 8 */
const LAYER = textPdf(agendaLines("26-7701", "26-7702", "26-7703"));
const OCR_LINES = agendaLines("26-8801", "26-8802", "26-8803");
const OCR_REF = "legislation:26-8801";

/* ---- the stub OCR member: CPDF-12's declared contract and nothing more ------ */
const region = (text, page, i) => ({ text, confidence: { value: 0.97, basis: "engine" },
  source: { kind: "pdf-page", ref: `p${page}`, page, rect: [72, 700 - i * 12, 540, 712 - i * 12] } });
/* THE `.md` IS OFF THESE PROVENANCE LABELS ON PURPOSE (M0-165, 2026-09-24). `measured_by` is a FREE STRING
   (index.mjs' chain contract) naming WHERE a fidelity grade was measured; it is not a path and nothing opens
   it. But `tools/gates.mjs` reads a unit's code with the estate's one lexer, which KEEPS strings on purpose
   (D-301: a path is a string), so its basename probe read `"MEASUREMENTS.md …"` here as a read of the ledger
   and made this suite a MEASUREMENTS reader — selected, and run, for every measurement anyone appends.
   Do not put it back: `bio-plane/test/statepaths.test.mjs` pins the property and names the file that breaks it. */
const goodAnswer = (page = 0) => ({
  ok: true, engine: "tesseract", version: "5.3.4-fast", cap: "C",
  measured_by: "MEASUREMENTS 2026-08-03 (CPDF-9)", confidence_floor: 0.6,
  pages: [{ page, regions: OCR_LINES.map((l, i) => region(l, page, i)) }],
});
let SCRIPT = "http-500";
let CALLS = 0;
const planeOpts = (withMember) => ({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  ...(withMember ? { serviceBindings: {
    async OCR_WORKER(request) {
      if (new URL(request.url).pathname !== "/transcribe") return new Response("no", { status: 404 });
      CALLS++;
      if (SCRIPT === "http-500") return new Response("boom", { status: 500 });
      return Response.json(SCRIPT);
    } } } : {}),
  bindings: { ADMIN_TOKEN: "adm-cpdf19", MEMBER_TOKEN: "mem-cpdf19", PROBE_TOKEN: "prb-cpdf19",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b) => new Response(b, { headers: { "content-type": "application/pdf" } });
    if (u.pathname === "/scan.pdf") return bin(SCAN);
    if (u.pathname === "/unfiled.pdf") return bin(SCAN_UNFILED);
    if (u.pathname === "/cal.pdf") return bin(SCAN_CAL);
    if (u.pathname === "/ok.pdf") return bin(SCAN_OK);
    if (u.pathname === "/layer.pdf") return bin(LAYER);
    return new Response("unscripted", { status: 500 });
  },
});
const mf = new Miniflare(planeOpts(true));
/* THE SAME PLANE WITH NO MEMBER BOUND — two instances rather than a toggle, because
   "the binding is absent" is a different fact from "the member answered badly". */
const mfBare = new Miniflare(planeOpts(false));

const raw = async (inst, q, init) => {
  const res = await inst.dispatchFetch(`http://x/api/?${q}`, init);
  const text = await res.text();
  let body = null; try { body = JSON.parse(text); } catch { body = null; }
  return { status: res.status, text, body };
};
const api = async (inst, q, init) => (await raw(inst, q, init)).body;
const post = (inst, q, body) => api(inst, q, { method: "POST", body: JSON.stringify(body) });
const acquire = async (inst, path) => (await post(inst, "op=acquire&token=mem-cpdf19",
  { locator: "https://oakland.legistar.com" + path, authority: "City Clerk" })).document;

const NOW = "2026-09-18T00:00:00Z";
const bundleMd = (id, summary = "Member bundle.") => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Member ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", summary, "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
let bseq = 0;
const promoteDoc = async (inst, doc, { id = null, base = null, summary } = {}) => {
  const bid = id || `INFO-2026-${String(++bseq).padStart(4, "0")}-cpdf19`;
  const md = bundleMd(bid, summary);
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post(inst, "op=promote&token=mem-cpdf19", {
    /* CORRECTED 2026-09-23 (REC-176, IC-193), never exempted: ONE literal key served the creation AND the revision, so
       the revision REPLACED the creation's manifest row — silently, until op=promote refused a held snap key
       (SNAP_KEY_TAKEN, C-67.1). A revision's key now carries its base, which is unique along the chain. */
    bundleId: bid, base, snapKey: base ? `20260918T020000Z_${String(base).slice(0, 8)}` : "20260918T010000Z_aaaa1111", author: "cpdf19",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Member ${bid}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [{ path: doc.file, sha256: doc.capture.sha256, bytes: doc.capture.bytes ?? 1, encoding: "binary" }],
  });
  return { id: bid, ok: r?.result?.ok === true, sha: r?.result?.bundleSha ?? null, raw: r };
};
const session = async (inst, memberId, role, capabilities) => {
  const add = (await post(inst, "op=memberadd&token=adm-cpdf19",
    { memberId, cover: `cover for ${memberId}`, role, capabilities })).result;
  const en = (await post(inst, "op=enroll", { invite: add.invite, handle: memberId,
                                              password: `${memberId}-passphrase-1` })).result;
  if (!en?.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en).slice(0, 300)}`);
  const lg = (await post(inst, "op=login", { role: `member:${memberId}`,
                                             password: `${memberId}-passphrase-1` })).result;
  if (!lg?.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg).slice(0, 300)}`);
  return lg.token;
};
/* CORRECTED 2026-09-18 BY REC-131 (IC-148), NEVER EXEMPTED: op=stats' log count is published as `observationsNonLead` (the log WITHOUT lead looks) and the wire carries no `observations` key — one key never carries two meanings (BOB.md rule 7), and purge's `observations` keeps the whole log. This suite writes no lead, so the figure it reads is unchanged; only the name moved. */
const obsCount = async (inst) => (await api(inst, "op=stats&token=adm-cpdf19"))?.result?.observationsNonLead ?? -1;
const reading = async (inst, s) => (await api(inst, `op=reading&token=mem-cpdf19&sha256=${s}`))?.result ?? null;
/* a refusal envelope graded AGAINST THE CATALOGUE ROW, never against a copy of it */
const row = (code) => ({ code, check: REEXTRACT_CHECKS[code]?.check, translation: REEXTRACT_CHECKS[code]?.translation });
const graded = (b) => ({ code: b?.code, check: b?.check, translation: b?.translation });

/* THE PRE-ITEM ANSWER'S DIGEST — a PRINTOUT, not a hand copy. Taken 2026-09-18 by
   running the PRE-ITEM `src/index.mjs` (origin/main 92f4c64e) over these exact
   fixture bytes with no flag (the one-off harness is quoted in `nc-cpdf19.mjs`'s
   header), and it is the design's over-strictness control: the default path must be
   byte-identical to what it was before the seam existed. If a later item moves the
   plain read ON PURPOSE, this literal is re-taken from a printout and the reason
   written here — never edited to match. */
/* RE-TAKEN 2026-09-18 by CONDUCT #4 at the merge of CPDF-18 onto CPDF-19, AS THIS COMMENT
   PRESCRIBES — a later item moved the plain read ON PURPOSE: CPDF-18 (IC-124's addendum) added
   a top-level `images` list to `op=pdfstructure`. PROVED rather than assumed before re-pinning:
   the merged tree's plain answer with ONLY its `"images": …` member removed from the RAW TEXT
   hashes to EXACTLY the two literals it replaces (scan afc32aa9…98bd, layer f0124107…ead9), so
   CPDF-18's key is the whole difference and CPDF-19's default path is still untouched. The new
   literals are the printout on the merged tree (`printout:` line above the assertions). */
/* RE-TAKEN 2026-09-24 by D-536, AS THIS COMMENT PRESCRIBES — a later item moved the plain read ON
   PURPOSE: `op=pdfstructure` now serves `provenance` (Part II §16, "Reading provenance"), the tier,
   member and SHA-256 of the text it answers with, as its LAST key. PROVED rather than assumed before
   re-pinning: the new plain answer with ONLY its `,\n "provenance": …` member cut from the RAW TEXT
   hashes to EXACTLY the two literals it replaces (scan 335b802e…ecc3a, layer 26c35ac5…e176b7), so
   D-536's key is the whole difference and CPDF-19's default path is still untouched. The new literals
   are the printout on D-536's tree. */
/* RE-TAKEN 2026-09-25 by D-665 (scan only), AS THIS COMMENT PRESCRIBES — the scan's page paints an image, and
   tier 1 now states it with a per-image `image_unread` marker (BOB #35 06:25Z; M-182). PROVED rather than
   assumed, and kept as an assertion below: the new plain answer with those markers taken out and its count
   lowered by as many hashes to EXACTLY the literal it replaces (c5d019ae…61ad8), so D-665's markers are the
   whole difference and CPDF-19's default path is still untouched. The layer document paints no image and is
   unchanged. The new literal is the printout on D-665's tree. */
/* RE-TAKEN 2026-09-25 by D-374, AS THIS COMMENT PRESCRIBES — a later item moved the plain read ON
   PURPOSE: `op=pdfstructure` now serves `pageBoxes` (each page's MediaBox, the bound a `pdf-page` rect
   is checked against). PROVED rather than assumed before re-pinning: the new plain answer with ONLY its
   `,\n "pageBoxes": …` member cut from the RAW TEXT hashes to EXACTLY the two literals it replaces
   (scan c5d019ae…61ad8, layer 2a04e765…d64b1), so D-374's key is the whole difference and CPDF-19's
   default path is still untouched. The new literals are the printout on D-374's tree. */
/* RE-TAKEN 2026-09-25 by CONDUCT #22 at the c22-batch30 union of D-665 and D-374, AS THIS COMMENT PRESCRIBES —
   both notes above moved the plain read on purpose, each on its own base. PROVED by name on the merged tree before
   re-pinning: the merged scan answer with ONLY `pageBoxes` removed hashes to D-665's literal (88497d1a…f4ba), and
   with the `image_unread` markers also removed to D-536's (c5d019ae…61ad8) — the assertion below keeps that; the
   merged layer answer equals D-374's literal (d167a73e…4abb) byte for byte, so D-374's own proof for it (without
   `pageBoxes` it is 2a04e765…d64b1) holds unchanged; D-665 did not move the layer document.
   The new literals are the printout on the merged tree. */
const PRE_ITEM_DIGEST = {
  scan: "1e4cbd3831b83aa9ffa74db37c0cc7aad90b4a35a4791fe805d3d200a16f2d8d",
  layer: "d167a73e91f333b56e84f968c01da4a5ebe76e1711e1f0c44cf9ba0362d65abb",
};

try {

const RUTH = await session(mf, "ruth", "admin", ["contribute", "publish", "create_projects"]);
await session(mf, "gus", "admin", ["contribute", "publish"]);
const NORA = await session(mf, "nora", "member", []);     /* no `contribute` */

console.log("\n--- 0 · the capture a member installed OCR too late for ---");
/* The member FAILS at capture time (HTTP 500), which is the acquire path's own honest
   branch: the document stays unread and is flagged as wanting OCR. That is the state an
   instance that installs (or repairs) its member later holds, reached here without
   swapping bindings under a running store. */
SCRIPT = "http-500";
const doc = await acquire(mf, "/scan.pdf");
const S = doc?.capture?.sha256;
t("the scan was captured", typeof S === "string" && S.length === 64, true);
t("and was left unread, flagged as a tier-3 candidate", [doc?.reading?.read_from_text, doc?.reading?.tier3_candidate], [false, true]);
t("its chain at capture is the text LAYER's (nothing transcribed it)", steps(doc?.reading?.text_source), ["layer"]);
const filed = await promoteDoc(mf, doc);
t("filed into the record", filed.ok, true);
const minted = await post(mf, "op=contentmint&token=mem-cpdf19",
  { bundleId: filed.id, extent: { kind: "pdf-page", page: 0 } });
const CONTENT_ID = minted?.result?.content_id ?? null;
t("a passage of it was marked citable under the OLD chain", [minted?.result?.ok, typeof CONTENT_ID], [true, "string"]);
const layerDoc = await acquire(mf, "/layer.pdf");
const L = layerDoc?.capture?.sha256;
const layerFiled = await promoteDoc(mf, layerDoc);
t("a text-layer document is filed beside it", [layerFiled.ok, layerDoc?.reading?.text_tier], [true, 1]);

console.log("\n--- 1 · WITHOUT THE FLAG: byte-identical to the pre-item read, and the engine is never called ---");
{
  const callsBefore = CALLS;
  const plainScan = await raw(mf, `op=pdfstructure&token=${RUTH}&sha256=${S}`);
  const plainLayer = await raw(mf, `op=pdfstructure&token=${RUTH}&sha256=${L}`);
  console.log(`  printout: scan digest ${sha(plainScan.text)} · layer digest ${sha(plainLayer.text)}`);
  t("the plain read of the scan is BYTE-IDENTICAL to the pre-item answer (digest)", sha(plainScan.text), PRE_ITEM_DIGEST.scan);
  /* D-665's proof that its markers are the WHOLE difference, kept as an assertion (the pattern of the RE-TAKEN
     notes above): the scan's plain answer with every `image_unread` marker taken out, and its count lowered by
     as many, re-serialised as `json()` does, hashes to the literal D-536 pinned. */
  {
    const o = JSON.parse(plainScan.text);
    /* c22-batch30: D-374's `pageBoxes` key is the other whole difference (its RE-TAKEN note above), so it is
       taken out too before comparing with D-536's answer. */
    delete o.pageBoxes;
    t("  and D-374's `pageBoxes` is the whole difference from D-665's answer: without it the scan is D-665's literal",
      sha(JSON.stringify(o, null, 1)), "88497d1a949a6152f1fe0b5a4afb7b19be15cbb90624d647b907a787d07ff4ba");
    const keep = (arr) => (Array.isArray(arr) ? arr.filter((m) => !(m && m.reason === "image_unread")) : arr);
    const had = o.text.undetermined.length;
    o.text.pages = o.text.pages.map((pg) => ({ ...pg, undetermined: keep(pg.undetermined) }));
    o.text.undetermined = keep(o.text.undetermined);
    o.text.counts = { ...o.text.counts, undetermined: o.text.counts.undetermined - (had - o.text.undetermined.length) };
    t("  and D-665's per-image markers are the whole difference: without them it is D-536's answer exactly",
      [had > o.text.undetermined.length, sha(JSON.stringify(o, null, 1))],
      [true, "c5d019aedaa9afc682fdd20cc82054b7bee493a7955e09490e170bfea3861ad8"]);
  }
  t("the plain read of the text-layer document is BYTE-IDENTICAL to the pre-item answer (digest)",
    sha(plainLayer.text), PRE_ITEM_DIGEST.layer);
  t("the plain read of the scan does NOT reach tier 3 — the seam is opt-in, never automatic",
    plainScan.body?.tier !== 3, true);
  t("and it carries no re-extraction key at all", "reextraction" in (plainScan.body || {}), false);
  t("the OCR member was NOT called by either plain read (the read's cost is the control)", CALLS - callsBefore, 0);
}

console.log("\n--- 2 · every way the flag can be wrong, refused BY NAME (C-51), and nothing written ---");
{
  /* The never-filed capture is ACQUIRED FIRST, outside the window below: an acquire
     calls the member (it is a scan) and writes its own document-level observation,
     and counting those against the refusals would be this suite measuring itself. */
  const unfiled = await acquire(mf, "/unfiled.pdf");
  const before = { calls: CALLS, obs: await obsCount(mf), reading: JSON.stringify((await reading(mf, S))?.reading) };

  const bareDoc = await acquire(mfBare, "/scan.pdf");
  const bareFiled = await promoteDoc(mfBare, bareDoc);
  t("the member-less instance captured and filed the same scan", [bareFiled.ok, bareDoc?.reading?.tier3_candidate], [true, true]);
  const noMember = await raw(mfBare, `op=pdfstructure&token=mem-cpdf19&sha256=${bareDoc.capture.sha256}&ocr=1`);
  t("NO OCR MEMBER BOUND: refused by name, 501, with its catalogue row",
    [noMember.status, noMember.body?.reason, graded(noMember.body)], [501, "REEXTRACT_NO_OCR_MEMBER", row("REEXTRACT_NO_OCR_MEMBER")]);
  t("...and the row is C-51.4", noMember.body?.check, "C-51.4");
  t("...and the member-less reading is untouched", (await reading(mfBare, bareDoc.capture.sha256))?.reading?.text_tier, 1);

  const malformed = await raw(mf, `op=pdfstructure&token=${RUTH}&sha256=${S}&ocr=yes`);
  t("A MALFORMED FLAG is refused rather than read as absent (C-51.1)",
    [malformed.status, malformed.body?.check, graded(malformed.body)], [400, "C-51.1", row("REEXTRACT_FLAG_MALFORMED")]);

  const ai = (await post(mf, `op=aicredentialmint&token=${RUTH}`, {
    tokenId: "cpdf19-agent", principalKind: "member", principalMember: "ruth",
    taskScope: "CPDF-19's own: an agent asking for a re-read", writes: ["promote"],
    note: "CPDF-19: a declared writer, so what refuses the re-read is the re-read's own fence" }))?.result;
  t("an agent credential was minted with a declared write", ai?.ok, true);
  const agent = await raw(mf, `op=pdfstructure&token=${ai?.token}&sha256=${S}&ocr=1`);
  t("AN AGENT CREDENTIAL cannot ask for the re-read — it is a member's write (C-51.2)",
    [agent.status, agent.body?.check, graded(agent.body)], [403, "C-51.2", row("REEXTRACT_AGENT_REFUSED")]);
  const agentPlain = await raw(mf, `op=pdfstructure&token=${ai?.token}&sha256=${S}`);
  t("...while the same agent's PLAIN read still answers (the fence is the flag, not the op)",
    [agentPlain.status, agentPlain.body?.ok], [200, true]);

  const incapable = await raw(mf, `op=pdfstructure&token=${NORA}&sha256=${S}&ocr=1`);
  t("A MEMBER WITHOUT `contribute` is refused, naming the capability (C-51.3)",
    [incapable.status, incapable.body?.check, incapable.body?.needs, graded(incapable.body)],
    [403, "C-51.3", "contribute", row("REEXTRACT_NOT_CAPABLE")]);

  const notRead = await raw(mf, `op=pdfstructure&token=${RUTH}&sha256=${unfiled?.capture?.sha256}&ocr=1`);
  t("A CAPTURE THE RECORD NEVER READ has no reading to replace (C-51.5)",
    [notRead.status, notRead.body?.check, graded(notRead.body)], [409, "C-51.5", row("REEXTRACT_NOT_READ")]);

  t("NONE of the five called the engine", CALLS - before.calls, 0);
  t("NONE of the five wrote an observation", await obsCount(mf), before.obs);
  t("NONE of the five touched the reading", JSON.stringify((await reading(mf, S))?.reading), before.reading);
}

console.log("\n--- 3 · a document with a text layer on every page is not a candidate ---");
{
  const before = { calls: CALLS, obs: await obsCount(mf), reading: JSON.stringify((await reading(mf, L))?.reading) };
  const r = await raw(mf, `op=pdfstructure&token=${RUTH}&sha256=${L}&ocr=1`);
  t("it answers, and says nothing was performed", [r.status, r.body?.reextraction?.performed, r.body?.reextraction?.written],
    [200, false, false]);
  t("with the REASON, never an empty field", /nothing for OCR to read/.test(r.body?.reextraction?.why || ""), true);
  t("and states the cost the affordance would have spent", /10 s per image-only page/.test(r.body?.reextraction?.cost || ""), true);
  t("the engine was not called", CALLS - before.calls, 0);
  t("nothing was written", [await obsCount(mf), JSON.stringify((await reading(mf, L))?.reading)], [before.obs, before.reading]);
}

console.log("\n--- 4 · THE RE-READ: tier 3, a new chain, the units replaced, the old citation STALE ---");
SCRIPT = goodAnswer(0);
const obsBefore = await obsCount(mf);
const frontierBefore = (await api(mf, "op=frontier&level=content&token=mem-cpdf19"))?.result;
const re = await raw(mf, `op=pdfstructure&token=${RUTH}&sha256=${S}&ocr=1`);
const R = re.body || {};
{
  t("the re-read answers 200", re.status, 200);
  t("it REACHED TIER 3", R.tier, 3);
  t("it was performed AND written", [R.reextraction?.performed, R.reextraction?.written], [true, true]);
  t("the answer's own text is the OCR'd text", /Grand Performance Mural/.test(R.text?.document || ""), true);
  t("the chain names EACH step, in order", steps(R.reextraction?.text_source), ["pixels", "ocr"]);
  t("and names the engine and version", [R.reextraction?.engine?.engine, R.reextraction?.engine?.version],
    ["tesseract", "5.3.4-fast"]);
  t("the page the member transcribed is named", R.reextraction?.pages, [0]);
  t("the reading it wrote was re-read through the content-type registry",
    [R.reextraction?.reading?.read_from_text, R.reextraction?.reading?.found, R.reextraction?.reading?.text_tier],
    [true, true, 3]);

  const stored = await reading(mf, S);
  t("THE RECORD NOW HOLDS the tier-3 reading", [stored?.reading?.text_tier, steps(stored?.reading?.text_source)], [3, ["pixels", "ocr"]]);
  t("the projection says OCR touched it last", stored?.text_provenance?.terminal_step, "ocr");
  t("the reading says it was RE-extracted, when, by whom and by what",
    [stored?.reading?.reextracted?.by, stored?.reading?.reextracted?.engine, stored?.reading?.reextracted?.via],
    ["ruth", "tesseract", "op=pdfstructure&ocr=1"]);
  t("its capture instant is UNCHANGED — the bytes were retrieved when they were retrieved",
    stored?.reading?.at, doc?.reading?.at);

  const refs = (await api(mf, `op=readingref&token=mem-cpdf19&ref=${encodeURIComponent(OCR_REF)}`))?.result;
  t("the OCR'd references REACHED the index — the document is findable by what it says",
    [refs?.count, refs?.documents?.[0]?.bundle_id], [1, filed.id]);

  t("EXACTLY ONE content row went stale — the one minted under the old chain", R.reextraction?.staled, 1);
  const content = (await api(mf, `op=content&token=mem-cpdf19&id=${CONTENT_ID}`))?.result;
  t("that row is MARKED stale and still RESOLVES (Bob's 5.8: nothing moves under a member)",
    [content?.ok, content?.stale], [true, true]);
  t("the text units were REPLACED: the scan now has an indexed unit", (R.reextraction?.units?.written ?? 0) >= 1, true);
  const hits = (await api(mf, `op=meaningrows&token=mem-cpdf19&rows=passage&q=${encodeURIComponent("passage:Coliseum")}`))?.result;
  t("and that unit is searchable at content grain (REC-92's passage arm)",
    Array.isArray(hits?.rows) && hits.rows.some((h) => h && (h.capture_sha === S || h.bundle_id === filed.id)), true);
}

console.log("\n--- 5 · the observation: the member as actor, and the capture leaves the candidate list ---");
{
  const wasCandidate = (frontierBefore?.recandidates || []).some((c) => c.subject === S && c.tier3_candidate);
  t("BEFORE: the capture was on the content-axis frontier's candidate list (the list a re-read is chosen from)",
    wasCandidate, true);
  const obsAfter = await obsCount(mf);
  /* WHAT PROMOTE'S OWN WRITER WRITES FOR ONE CAPTURE, and the re-read writes no more
     and no less because it IS that writer: the content-level extraction row(s)
     (REC-94), the index's `derive` row (REC-91) and the meaning-level reader-run row
     (REC-95). Read off the TABLE's count, never the writer's own return. §8's
     "exactly one observation" predates the second and third and is reported as a
     design gap rather than bent to fit. */
  t("the re-read wrote exactly promote's rows for one capture (extraction + index + reader run), by the TABLE's count",
    obsAfter - obsBefore, (R.reextraction?.observed?.written ?? -99) + 2);
  t("of which exactly ONE is the extraction row (one tier evidenced: the engine)", R.reextraction?.observed?.written, 1);
  t("and the writer called it a RE-extraction without being told", R.reextraction?.observed?.reextraction, true);
  const fAfter = (await api(mf, "op=frontier&level=content&token=mem-cpdf19"))?.result;
  const latest = (fAfter?.looked || []).find((r) => r.subject === S);
  t("the latest content-level row is the member's, under authority_kind = extract",
    [latest?.actor_class, latest?.authority_kind], ["member", "extract"]);
  t("its detail says re-extraction", /^re-extraction;/.test(latest?.detail || ""), true);
  t("AFTER: the capture is no longer a tier-3 candidate",
    (fAfter?.recandidates || []).some((c) => c.subject === S && c.tier3_candidate), false);
}

console.log("\n--- 6 · an ordinary revision of the bundle does not quietly undo the re-read ---");
{
  const rev = await promoteDoc(mf, doc, { id: filed.id, base: filed.sha, summary: "Edited summary." });
  t("the member revised the bundle, re-submitting the acquire-time provenance", rev.ok, true);
  const stored = await reading(mf, S);
  t("the record STILL holds the tier-3 reading", [stored?.reading?.text_tier, steps(stored?.reading?.text_source)], [3, ["pixels", "ocr"]]);
  const content = (await api(mf, `op=content&token=mem-cpdf19&id=${CONTENT_ID}`))?.result;
  t("and the stale mark stands (one-way, REC-82)", content?.stale, true);
}

console.log("\n--- 7 · D-417: the calibration the engine's fidelity rests on is now JOINED ---");
{
  const cal = (await post(mf, "op=calibrate&token=adm-cpdf19", {
    engine: "tesseract", version: "5.3.4-fast", at: "2026-09-01T00:00:00Z", cap: "C", probe_id: "cpdf19-probe",
    probe_inputs: { corpus: "cpdf19-synthetic", pages: 1, ground_truth_sha: "0".repeat(64) },
    scores: { char_error_rate: 0.02, minted_digits: 0, pages_scored: 1 },
    measured_by: "test/reextract.test.mjs (synthetic — measures no engine)",
  }))?.result;
  t("a calibration of the engine is recorded", /^CAL-\d+$/.test(cal?.calibration_id || ""), true);
  SCRIPT = "http-500";
  const cdoc = await acquire(mf, "/cal.pdf");
  const cfiled = await promoteDoc(mf, cdoc);
  SCRIPT = goodAnswer(0);
  const cre = (await raw(mf, `op=pdfstructure&token=${RUTH}&sha256=${cdoc?.capture?.sha256}&ocr=1`)).body;
  t("the re-read of a second scan is performed", [cfiled.ok, cre?.reextraction?.performed], [true, true]);
  const ocrStep = (cre?.reextraction?.text_source || []).find((s) => s && s.step === "ocr") || {};
  t("its ocr step NAMES the calibration — before D-417 this join never fired and every chain named none",
    ocrStep.calibration, cal?.calibration_id);
  t("and the reading stamps it too", cre?.reextraction?.engine?.calibration, cal?.calibration_id);
}

console.log("\n--- 8 · D-418: a document the member TRANSCRIBED is not filed as still wanting OCR ---");
{
  /* The acquire path, the same seam: a scan the member reads in full at capture. Before
     D-418 the success sentence rode `ocrNote` and `ocrNote` alone decided the flag, so
     this document was stamped `tier3_candidate` — REC-94 recorded it `partial` and the
     frontier offered it for re-extraction for ever. */
  SCRIPT = goodAnswer(0);
  const okDoc = await acquire(mf, "/ok.pdf");
  t("the member transcribed it at capture", [okDoc?.reading?.text_tier, okDoc?.reading?.read_from_text], [3, true]);
  t("and it is NOT flagged as still wanting OCR", okDoc?.reading?.tier3_candidate, undefined);
  const okFiled = await promoteDoc(mf, okDoc);
  const f = (await api(mf, "op=frontier&level=content&token=mem-cpdf19"))?.result;
  const latest = (f?.looked || []).find((r) => r.subject === okDoc?.capture?.sha256);
  t("so its content-level row is PRESENT and it is not a re-extraction candidate",
    [okFiled.ok, latest?.state, latest?.tier3_candidate], [true, "PRESENT", false]);
}

} finally {
  await mf.dispose();
  await mfBare.dispose();
}
footReached = true;
console.log(`\nreextract: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
