/* extraction, diagnosis S25 (fix round 9, G128; SCAN E3, SI10): the OCR text of a scan read in pieces equals the whole read's, and each piece's
   units sit under a chain that names their pages. A real scan PDF (test-support's pdfgen, every page a scan) is read by the ledger's ticks
   (`readHeld` handed the registrar, the real reading-pipeline reader in page ranges of 2) and, as the control, in one piece; the OCR member is a
   scripted stand-in answering each asked page. `build/plan/diagnosis-R9-pieces-chain.md` records the reproduction. (K4911) The fix's interface: a later
   PDF range's answer carries `reading.piece_chain`, the chain of its own pages; this module indexes the piece under it and folds its pages into the stored
   chain. Until reading-pipeline's half merges, a stand-in of that contract (the real reader, its later pieces given `piece_chain` as the whole read's chain
   restricted to their pages) proves this module's half; the real reader's mixed case stays red by name until then. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, hold, doc, member, ocrAnswer, homesOver } from "./fixture.mjs";
import { generate } from "../../pdfgen.mjs";
// fixtures-contract: plane job-registrar
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";
import { read as readDocument } from "../../../src/reading-pipeline/index.mjs";
import { chainKindFor, mergedChain } from "../../../src/textchain.mjs";

const PAGES = 6;
const ocr = () => member((body) => ocrAnswer(Array.isArray(body.pages) ? body.pages : [], { text: (p) => `scanned words of page ${p} marker${p}` }));

/* a chain restricted to `pages` (the contract's `piece_chain`): its page-scoped parts, each cut to those pages */
function restricted(chain, pages, all) {
  const scoped = chain.some((x) => x && x.extent != null);
  const parts = new Map();
  if (!scoped) parts.set("all", { pages: all, chain });
  else for (const step of chain) { const { extent, ...bare } = step; const k = extent.pages.join(","); if (!parts.has(k)) parts.set(k, { pages: extent.pages, chain: [] }); parts.get(k).chain.push(bare); }
  const cut = [...parts.values()].map((x) => ({ ...x, pages: x.pages.filter((p) => pages.includes(p)) })).filter((x) => x.pages.length);
  return cut.length ? mergedChain(cut) : null;
}

async function scanStore({ rangePages, kinds = ["scan"], pieceChainOf = null }) {
  const reader = async (d, o) => {
    const out = await readDocument(d, rangePages && o.cursor !== undefined ? { ...o, rangePages } : o);
    /* the stand-in of reading-pipeline's half (K4911): a later range's answer carries the chain of its own pages */
    if (pieceChainOf && typeof o.cursor === "string" && out && out.piece && Array.isArray(out.piece.pages)) {
      const [from, to] = out.piece.pages;
      const pc = pieceChainOf(Array.from({ length: to - from }, (_, i) => from + i));
      if (pc) out.reading = { ...(out.reading || {}), piece_chain: pc };
    }
    return out;
  };
  const rows = new Map();
  const w = fresh({ reader, provenance: homesOver(rows) });
  bundle(w.s, "B-1");
  const g = generate({ kind: "pdf", seed: "s25", size: { pages: PAGES, lines: 2 }, kinds, fonts: ["type0"] });
  const bytes = await g.bytes();
  w.d = await hold(w.evidence, bytes); rows.set(w.d, { bundleId: "B-1", bytes: bytes.length });
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

const MIXED = ["text", "text", "scan", "scan", "scan", "scan"];
const chainOf = (w) => JSON.parse(w.one(`SELECT reading FROM readings WHERE capture_sha=?`, w.d).reading).text_source;

async function compare(kinds, { pieceChain = false } = {}) {
  const whole = await scanStore({ rangePages: null, kinds });
  await ticks(whole, { OCR_WORKER: ocr() });
  const wchain = chainOf(whole);
  const all = Array.from({ length: PAGES }, (_, i) => i);
  const pieces = await scanStore({ rangePages: 2, kinds, pieceChainOf: pieceChain ? (pages) => restricted(wchain, pages, all) : null });
  await ticks(pieces, { OCR_WORKER: ocr() });
  const W = unitsOf(whole), P = unitsOf(pieces);
  assert.deepEqual(P.map((u) => [u.page, u.text]), W.map((u) => [u.page, u.text]), "the OCR text in pieces equals the whole read's (SI10)");
  assert.deepEqual(P.map((u) => [u.page, u.chain_kind]), W.map((u) => [u.page, u.chain_kind]), "each unit's chain kind is the whole read's");
  const chain = chainOf(pieces);
  assert.deepEqual(all.map((p) => chainKindFor(chain, p)), all.map((p) => chainKindFor(wchain, p)), "the stored reading's chain names each page as the whole read's does");
  const row = pieces.one(`SELECT chain FROM reading_text_source WHERE capture_sha=?`, pieces.d);
  assert.deepEqual(JSON.parse(row.chain), chain, "its text-source row follows the stored chain");
}

const SCANS_FIRST = ["scan", "scan", "text", "text", "text", "text"];

test("S25 (G128; SCAN E3, SI10; control): a scan of one kind of page read in pieces by the real reader holds the whole read's OCR text, each unit under a chain that names its page", () => compare(["scan"]));

for (const [name, kinds] of [["two typed pages, then scans", MIXED], ["two scans, then typed pages", SCANS_FIRST]]) {
  test(`S25 (G128; SCAN E3, SI10; K4911): a mixed PDF (${name}) read in pieces against the \`piece_chain\` contract: each later piece's units are indexed under its own pages' chain and its pages are folded into the stored chain, so the units and the chain name every page as the whole read does`, () => compare(kinds, { pieceChain: true }));
  test(`S25 (G128; SCAN E3, SI10; K4911): the same mixed PDF (${name}) through the real reader, red by name until reading-pipeline's half (a later range answers \`piece_chain\`) merges`, () => compare(kinds));
}
