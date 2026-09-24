/* THE MEMBER'S CONTRACT AND ITS THREE MEASURED NUMBERS, in a module that
 * imports NO ENGINE — and that is the point of the file rather than tidiness.
 *
 * `tessengine.mjs` imports the wasm core and the language model as WORKERS
 * MODULE TYPES (`CompiledWasm` and `Data`). Node cannot resolve either, so any
 * module that reaches the engine is a module a node-side suite cannot import at
 * all. Putting the constants and the chunk rule here means the SUITE DRIVES THE
 * SAME EXPRESSION THE WORKER RUNS, rather than a copy of it written out again in
 * a test — which is the shape that eventually disagrees, measured six times in
 * this estate (`coverage.mjs`'s own note on the fleet `control` flag, where the
 * arm written to prove a fix came back GREEN because nothing read the flag any
 * more).
 */

/* ===================================================================== *
 * THE MEASURED NUMBERS. There are three and that is all; every other
 * figure this member reports is observed at run time. A measured number
 * with no pointer to its measurement is the failure CLAUDE.md records as
 * this project's most-repeated, so none is written here without one.
 * ===================================================================== */

/** The transcription-fidelity letter this member's answer may support, and the
 *  ONE thing the plane will not accept a default for.
 *
 *  `C`, and the reasoning is the record's own rather than a preference: the
 *  strongest capture grade this system earns without a member's attestation is
 *  `B` (`EARNED_CAPTURE_CEILING`), an OCR pass is a machine transcription of a
 *  picture of text with nobody having looked, and CPDF-10's doctrine is that OCR
 *  NEVER RAISES A CAPTURE GRADE. `C` is the letter `textchain.mjs`'s own D-252
 *  note already uses for an OCR pass, so this member reports the letter this
 *  estate already means rather than minting a second convention. */
export const CAP = "C";

/** Where that letter's measurement lives. A free string a HUMAN follows — the
 *  machine-followable half is CPDF-13's calibration reference, which the PLANE
 *  joins on `engine`+`version` and this member deliberately does not hold (a
 *  measurement must not acquire a second home; `index.mjs` says so at the join). */
export const MEASURED_BY =
  "MEASUREMENTS.md 2026-09-10 (CPDF-15) — tesseract-wasm@0.11.0 SIMD + tessdata_fast eng on the "
  + "deployed Workers runtime: 99.89% characters and 89/90 digits with ZERO minted on the one "
  + "human-ground-truthed page (Oakland Legistar attachment 15721260 p2, 300 dpi), reproducible "
  + "over identical bytes (9 images x 3 runs, no image gave more than one distinct text), the "
  + "invention band EMPTY at every rung of CPDF-11's ladder. REACH, STATED: ONE ground-truthed "
  + "page, ONE engine version, ONE model. Every other corpus figure in that row is "
  + "agreement-with-the-local-floor and NOT accuracy — and D-314/CPDF-16 measured that NEITHER "
  + "local model passes the noise control, so no agreement figure may be read as accuracy at all.";

/** The largest RGBA frame CPDF-15 measured COMPLETING on the deployed runtime,
 *  in bytes. **A WORKLOAD SIZE, NEVER A SHARE OF 128 MB** — D-312 exists because
 *  the platform's `memoryUsageBytes` reads 132–240 MB on invocations the platform
 *  itself marks `success`, so any percentage computed from it is a wrong answer
 *  carrying full confidence. The ceiling was located the way this project locates
 *  every ceiling, BY BEING REFUSED: 33.7 / 48.5 / 61.3 MB frames complete, a
 *  75.7 MB frame is KILLED (`exceededMemory`, reproduced), and 134.6 MB is
 *  refused in-isolate as a catchable `RangeError`. */
export const MAX_FRAME_BYTES = 61_300_000;

/** The frame a page of these pixel dimensions costs. `loadImage` refuses
 *  anything shorter than width*height*4, so this is not avoidable by sending
 *  less (CPDF-15 measured that refusal). */
export const frameBytesOf = (w, h) => w * h * 4;

/* ===================================================================== *
 * Refusals. Every one is STATED, carries what it saw, and leaves the
 * document HONESTLY UNREAD rather than half-transcribed.
 * ===================================================================== */
export const REFUSALS = {
  R2_NOT_CONFIGURED: "this member holds no CAPTURES binding, so it cannot read the bytes",
  BAD_SHA: "capture_sha must be 64 lowercase hex",
  BAD_STORE: "store must be named: this member reads a capture from one namespace and guesses none",
  /* D-478. Deliberately says what it is NOT as well as what it is: the answer this replaces was NOT_FOUND, and a
     reader who cannot tell the two apart reads "there is no such capture" where the truth is "there is no such
     namespace" (CLAUDE.md §1 — *not found* is not *absent*). */
  NAMESPACE_UNKNOWN: "no namespace by that name exists on any instance this member can be bound to, so nothing "
                   + "was read; the two that exist are listed beside this message. This is not NOT_FOUND, which "
                   + "says the namespace exists and holds no such capture",
  BAD_PAGES: "pages must be a non-empty array of 0-based page numbers",
  NOT_FOUND: "no capture with that sha in that store",
  ENGINE_ABSENT: "the OCR engine did not load; this member cannot transcribe anything",
  PAGE_NOT_RENDERABLE: "the page could not be turned into pixels, and the renderer says why",
  FRAME_OVER_MEASURED_BOUND: "this page's frame is larger than the largest frame measured to complete",
  PIXELS_UNREADABLE: "the rendered container could not be read back to samples",
  ENGINE_FAILED: "the engine refused or failed on this frame",
  NOTHING_TRANSCRIBED: "the engine returned no anchorable word for this page",
};

/** ONE PAGE PER INVOCATION. The page this call will do, and the ones it will not.
 *
 *  It TAKES THE LOWEST and DEFERS the rest rather than looping, and the bound is
 *  MEMORY: whole-document invocation is UNMEASURED (CPDF-15 says so in its own
 *  row) and an unmeasured loop inside a memory ceiling is how a member starts
 *  returning half a document with no way to tell. The plane already carries the
 *  honest reading of a partial answer — a selected page nobody answered for
 *  KEEPS ITS MARKER and stays unread (`mergeTier3Text`) — so chunking costs
 *  another invocation while assuming costs a document that is silently partial. */
export function chooseChunk(pages) {
  const clean = [];
  for (const p of Array.isArray(pages) ? pages : [])
    if (Number.isInteger(p) && p >= 0 && !clean.includes(p)) clean.push(p);
  clean.sort((a, b) => a - b);
  return { take: clean.length ? clean[0] : null, deferred: clean.slice(1) };
}
