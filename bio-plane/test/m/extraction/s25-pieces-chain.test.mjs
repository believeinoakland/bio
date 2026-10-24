/* extraction, diagnosis S25 (fix round 9, G128; SCAN E3, SI10): the OCR text of a scan read in pieces equals the whole read's, and each piece's
   units sit under a chain that names their pages. A real scan PDF (test-support's pdfgen, every page a scan) is read by the ledger's ticks
   (`readHeld` handed the registrar, the real reading-pipeline reader in page ranges of 2) and, as the control, in one piece; the OCR member is a
   scripted stand-in answering each asked page. `build/plan/diagnosis-R9-pieces-chain.md` records the reproduction. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, doc, member, ocrAnswer } from "./fixture.mjs";
import { generate } from "../../pdfgen.mjs";
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";
import { read as readDocument } from "../../../src/reading-pipeline/index.mjs";
import { chainKindFor } from "../../../src/textchain.mjs";

const PAGES = 6;
const ocr = () => member((body) => ocrAnswer(Array.isArray(body.pages) ? body.pages : [], { text: (p) => `scanned words of page ${p} marker${p}` }));

async function scanStore({ rangePages, kinds = ["scan"] }) {
  const reader = (d, o) => readDocument(d, rangePages && o.cursor !== undefined ? { ...o, rangePages } : o);
  const box = {};
  const w = fresh({ reader, provenance: () => ({ homeOf: (s) => (s === box.d ? { bundleId: "B-1", bytes: box.size } : null), partsOf: () => null }) });
  bundle(w.s, "B-1");
  const g = generate({ kind: "pdf", seed: "s25", size: { pages: PAGES, lines: 2 }, kinds });
  const bytes = await g.bytes();
  w.d = box.d = await hold(w.evidence, bytes); box.size = bytes.length;
  const document = doc({ digest: w.d, bytes: bytes.length, ct: "application/pdf", format: "pdf" });
  w.s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?,?,?,?,?,?)`,
    "B-1", "data/provenance.json", JSON.stringify({ documents: [document] }), null, 1, "x");
  return w;
}

/* the ledger's ticks until nothing more follows (reading jobs, then the ocr job a piece left), at most 40 */
async function ticks(w, env) {
  const jobs = jobRegistrarStub();
  for (let n = 0; n < 40; n++) {
    const kind = jobs.rows().some((r) => r.kind === "ocr" && r.sha === w.d) && n > 0 && !w.one(`SELECT 1 AS x FROM capture_text_state WHERE capture_sha=? AND more=1`, w.d) ? "ocr" : "reading";
    const r = await w.x.readHeld({ sha: w.d, kind, env, registerJob: jobs.registerJob, armJobs: jobs.armJobs });
    if (!r.more && !(kind === "ocr" && r.owed) && !(kind === "reading" && jobs.rows().some((x) => x.kind === "ocr"))) break;
    if (kind === "ocr" && !r.owed) break;
  }
  return jobs;
}

const unitsOf = (w) => w.rows(`SELECT extent, text, chain_kind FROM capture_text WHERE capture_sha=? ORDER BY seq`, w.d)
  .map((u) => ({ page: JSON.parse(u.extent).page, text: u.text, chain_kind: u.chain_kind }));

for (const [name, kinds] of [["every page a scan", ["scan"]], ["two typed pages, then scans", ["text", "text", "scan", "scan", "scan", "scan"]],
                             ["two scans, then typed pages", ["scan", "scan", "text", "text", "text", "text"]]])
test(`S25 (G128; SCAN E3, SI10): a scan read in pieces holds the whole read's OCR text, each unit under a chain that names its page (${name})`, async () => {
  const env = { OCR_WORKER: ocr() };
  const whole = await scanStore({ rangePages: null, kinds });
  await ticks(whole, env);
  const pieces = await scanStore({ rangePages: 2, kinds });
  await ticks(pieces, { OCR_WORKER: ocr() });
  const W = unitsOf(whole), P = unitsOf(pieces);
  assert.deepEqual(P.map((u) => [u.page, u.text]), W.map((u) => [u.page, u.text]), "the OCR text in pieces equals the whole read's (SI10)");
  const chain = JSON.parse(pieces.one(`SELECT reading FROM readings WHERE capture_sha=?`, pieces.d).reading).text_source;
  assert.deepEqual(P.map((u) => [u.page, u.chain_kind]), W.map((u) => [u.page, u.chain_kind]), "each unit's chain kind is the whole read's");
  const wchain = JSON.parse(whole.one(`SELECT reading FROM readings WHERE capture_sha=?`, whole.d).reading).text_source;
  assert.deepEqual(P.map((u) => chainKindFor(chain, u.page)), W.map((u) => chainKindFor(wchain, u.page)), "the stored reading's chain names each page as the whole read's does");
});
