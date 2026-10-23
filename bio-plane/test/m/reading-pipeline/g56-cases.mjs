/* reading-pipeline G56 (fix round 6; K4693, K4700): the two synthetic PDFs the range-size tests read and a runner that reads one
   in pieces and summarises what must not change when the piece size does. Shared by `g56-range.test.mjs` and the one-off
   `fixtures/make-g56-answers.mjs`, so the recorded answers and the tests read the same documents the same way.
   The light synth is bound by pages (about 1.6 KB a page, under PDF_RANGE_BYTES / PDF_RANGE_PAGES = 13 KB); the heavy one is the same pages with
   image streams that bring the file to 12 MB, 26.7 KB of file a page (16.9 times the light's), bound by bytes, not by the 512 KiB units budget. */
import { createHash } from "node:crypto";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { bucket, evidenceStore, hold, doc } from "./fixture.mjs";
import { synthPdf } from "./bigpdf.mjs";

export const PAGES = 450;
export const BUDGET = 512 * 1024;
export const LIGHT = { pages: PAGES, linesPerPage: 30, targetBytes: 0 };
export const HEAVY = { pages: PAGES, linesPerPage: 30, targetBytes: 12_000_000 };

const sha = (s) => createHash("sha256").update(s).digest("hex");
export const unitDigest = (u) => sha(JSON.stringify([u.extent, u.seq, u.text]));
const cursorOf = (c) => (c ? JSON.parse(Buffer.from(c.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()) : null);

export async function worldOf(synth) {
  const b = bucket(), bytes = synthPdf(synth), d = await hold(b, bytes);
  return { b, bytes, document: doc({ digest: d, bytes: bytes.length, ct: "application/pdf", format: "pdf" }) };
}
export const readOf = (w, extra = {}) => read(w.document, { evidence: evidenceStore(w.b), env: {}, storeName: "bio", ...extra });

/* Reads `w` to its end in pieces, as the walker asks (`unitsBudget` 512 KiB; `rangePages` only when passed). */
export async function inPieces(w, extra = {}) {
  const pieces = [];
  let cursor = null;
  for (let g = 0; g < 1000; g++) {
    const out = await readOf(w, { unitsBudget: BUDGET, cursor, ...extra });
    pieces.push(out);
    if (out.more !== true) break;
    cursor = out.cursor;
  }
  return pieces;
}

/* What the piece size must not change (the units, the totals, the cursor's `n`) and what it may (the intermediate cursors, `piece.pages`,
   the piece count). */
export function summary(pieces) {
  const units = pieces.flatMap((p) => p.text_units || []);
  const first = pieces[0];
  return {
    units: units.length,
    units_sha256: sha(JSON.stringify(units.map(unitDigest))),
    unit_digests: units.map(unitDigest),
    total: pieces[pieces.length - 1].total,
    page_count: first.reading.page_count,
    words_total: first.reading.words_total,
    words_read_sum: pieces.reduce((n, p) => n + p.piece.words, 0),
    first_words_read: first.reading.words_read,
    cursor_n: first.cursor ? cursorOf(first.cursor).n : null,
    first_cursor: first.cursor ? cursorOf(first.cursor) : null,
    pieces: pieces.length,
    spans: pieces.map((p) => p.piece.pages),
  };
}
