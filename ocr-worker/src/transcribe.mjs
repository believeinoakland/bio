/* CPDF-10 — TIER 3, THE PRODUCER SIDE. One page, to pixels, to text, with the
 * provenance the plane will refuse it without.
 *
 * ===================================================================== *
 * THE CONTRACT IS NOT INVENTED HERE. It is stated, in full, in
 * `bio-plane/src/index.mjs` at `ocrTextFromMember` — the CONSUMER was built
 * complete (CPDF-10, D-251, D-252) and CPDF-13 added the calibration join,
 * against a STUB, precisely so the day a member arrived the only new code would
 * be the member. This file is that member. It CONSUMES the contract and reshapes
 * nothing: every field below is a field the plane already refuses on.
 * ===================================================================== *
 *
 * ---- ONE PAGE PER INVOCATION, AND IT IS MEMORY THAT SAYS SO ----------------
 *
 * CPDF-15 located this member's ceiling the way this project locates every
 * ceiling — BY BEING REFUSED (MEASUREMENTS.md, 2026-09-10, on the deployed
 * runtime): RGBA frames of 33.7 MB, 48.5 MB and 61.3 MB complete; a 75.7 MB
 * frame is KILLED (`exceededMemory`, reproduced); a 134.6 MB allocation is
 * refused in-isolate as a catchable `RangeError`.
 *
 * **THE BOUND IS THEREFORE EXPRESSED AS THE WORKLOAD SIZE THAT SURVIVES AND
 * NEVER AS A SHARE OF 128 MB** — D-312, which exists because the platform's
 * `memoryUsageBytes` reads 132–240 MB on invocations the platform itself marks
 * `success`, so any percentage computed from it is a wrong answer carrying full
 * confidence.
 *
 * Two consequences, and both are refusals rather than hopes:
 *   - A page whose frame would exceed the largest MEASURED-PASSING size is
 *     REFUSED BY NAME before anything is allocated. Being killed produces no
 *     answer and no reason; refusing produces both.
 *   - A request naming SEVERAL pages is CHUNKED, never looped. This member
 *     transcribes the first page it can and NAMES the rest as not transcribed.
 *     Whole-document invocation is UNMEASURED (CPDF-15 says so in its own row)
 *     and an unmeasured loop inside a memory ceiling is how a member starts
 *     returning half a document with no way to tell. The plane already carries
 *     the honest reading of that answer: a selected page nobody answered for
 *     KEEPS ITS MARKER and stays unread (`mergeTier3Text`), and `tier3Note`
 *     says so in the record's own sentence. Chunking costs another invocation;
 *     assuming costs a document that is silently partial.
 *
 * ---- WHAT THIS MEMBER MAY NOT DO (fleet rules 2/3, I6 and I8, now I9) -------
 *
 * It writes NOTHING. It holds `CAPTURES` READ and no other binding: no STORE
 * (Durable Object), no PUBLISHED, no credential of its own. It never calls
 * `.put`/`.delete`/`.createMultipartUpload` on R2 — asserted behaviourally (the
 * bucket is byte-identical after a call) and by a source scan, as `pdf-worker`'s
 * are. It has no member-facing surface: the plane's op layer is the
 * authorisation boundary.
 *
 * ---- AND IT MAY NOT MAKE THE TEXT LOOK BETTER THAN IT IS --------------------
 *
 * No spell-correction, no dictionary pass, no joining of hyphenated lines, no
 * model cleaning anything up. Those would all produce more READABLE text and
 * exactly as RELIABLE text, which is the hazard `textchain.mjs`'s rule 2 is
 * pointed at. The member returns what the decoder decoded.
 */
import { renderPageToPixels, REFUSALS as RENDER_REFUSALS } from "../../pdf-worker/src/pagepixels.mjs";
import { pngToSamples, samplesToRgba } from "./pngsamples.mjs";
import {
  transcribeFrame, engineCheck, ENGINE_NAME, ENGINE_VERSION, MODEL_NAME,
} from "./tessengine.mjs";


/* THE CONTRACT AND ITS THREE MEASURED NUMBERS live in `contract.mjs`, which
 * imports NO ENGINE — read its header for why that split is load-bearing rather
 * than cosmetic: the wasm core and the language model arrive as WORKERS MODULE
 * TYPES, so any module that reaches the engine is one a node-side suite cannot
 * import at all, and the suite must drive the SAME expression the worker runs
 * rather than a copy of it. Re-exported here so the member reads as one thing. */
export {
  CAP, MEASURED_BY, MAX_FRAME_BYTES, REFUSALS, chooseChunk, frameBytesOf,
} from "./contract.mjs";
import {
  CAP, MEASURED_BY, MAX_FRAME_BYTES, REFUSALS, chooseChunk, frameBytesOf,
} from "./contract.mjs";

/**
 * Transcribe ONE page of one capture.
 *
 * `bytes` is the captured document; the CALLER read it from R2, so this function
 * is a pure function of bytes and a page number and the suite can drive it with
 * no bucket at all.
 *
 * Returns the member's wire answer — the shape `ocrTextFromMember` refuses on.
 */
export async function transcribeOnePage(bytes, page, { psm = null, confidenceFloor = null } = {}) {
  const engineWhy = engineCheck();
  if (engineWhy)
    return { ok: false, reason: "ENGINE_ABSENT", detail: REFUSALS.ENGINE_ABSENT, why: engineWhy };

  /* PIXELS. CPDF-12's renderer, imported rather than re-implemented — it is the
     one place that knows which pages are image-only, which routes are decodable
     and which are REFUSED BY NAME, and it never returns a blank frame. Its
     refusals are passed through verbatim: a page with a text layer, a vector
     page, a mosaic and a JBIG2 stream are four different findings and this
     member collapses none of them. */
  const rendered = await renderPageToPixels(bytes, page, { });
  if (!rendered || !rendered.ok)
    return { ok: false, reason: "PAGE_NOT_RENDERABLE", detail: REFUSALS.PAGE_NOT_RENDERABLE,
             page, render: rendered ? { reason: rendered.reason, why: RENDER_REFUSALS[rendered.reason] || null,
                                        detail: rendered } : null };

  /* THE PASS-THROUGH ROUTE IS NAMED, NOT ATTEMPTED. `passthrough-dct` hands back
     the publisher's own JPEG, which is the strongest provenance position there
     is and which nothing in this isolate can decode: workerd has no canvas and
     no `createImageBitmap`, and a JPEG decoder is a real capability that is NOT
     built here. Saying so is the whole treatment — CPDF-15's own row records
     "no in-isolate PDF decode" as what it could not see, and this is that gap
     arriving where it actually bites. A page in this class stays honestly
     unread. */
  if (rendered.mediaType !== "image/png")
    return { ok: false, reason: "PIXELS_UNREADABLE", detail: REFUSALS.PIXELS_UNREADABLE, page,
             route: rendered.route, mediaType: rendered.mediaType,
             why: `the ${rendered.route} route hands back the publisher's own ${rendered.mediaType} `
                + `bytes, and no decoder for that container is built into this member — workerd has `
                + `neither a canvas nor createImageBitmap. This page is not transcribed and is not `
                + `guessed at; the capability is NAMED so the corpus can decide whether it is worth `
                + `building rather than being discovered as a silent blank` };

  const frame = frameBytesOf(rendered.width, rendered.height);
  if (frame > MAX_FRAME_BYTES)
    return { ok: false, reason: "FRAME_OVER_MEASURED_BOUND", detail: REFUSALS.FRAME_OVER_MEASURED_BOUND,
             page, width: rendered.width, height: rendered.height, frame_bytes: frame,
             bound_bytes: MAX_FRAME_BYTES,
             why: `a ${rendered.width}x${rendered.height} page needs a ${frame} B RGBA frame; the `
                + `largest frame MEASURED to complete on this runtime is ${MAX_FRAME_BYTES} B and a `
                + `75,700,000 B frame was KILLED (CPDF-15, reproduced). This is a workload size and `
                + `NOT a share of any ceiling — the platform's memory figure is not the isolate's `
                + `budget (D-312). Refused rather than attempted: being killed returns no answer and `
                + `no reason.` };

  const samples = await pngToSamples(rendered.bytes);
  if (!samples.ok)
    return { ok: false, reason: "PIXELS_UNREADABLE", detail: REFUSALS.PIXELS_UNREADABLE, page,
             route: rendered.route, png: samples };

  const rgba = samplesToRgba(samples);
  const out = await transcribeFrame(rgba, samples.width, samples.height, { psm });
  if (!out.ok)
    return { ok: false, reason: "ENGINE_FAILED", detail: REFUSALS.ENGINE_FAILED, page,
             frame_bytes: frame, engine_error: out.error, engine_error_name: out.name };

  /* THE REGIONS. One per LINE the engine boxed — read `REGION_GRAIN`'s note in
     `tessengine.mjs` for why the grain is a measured decision and not a default
     — each carrying the image region a reader can be pointed at, which is
     CPDF-10's non-negotiable and the exact thing CPDF-14's composed shape could
     not deliver (a rectangle that comes back about half the time cannot anchor a
     claim; this engine answered 406/406/406 word boxes at ONE distinct geometry
     over identical bytes).
     THE RECT'S SPACE IS STATED. It is PIXELS of the frame that was OCR'd, which
     is the space the anchor is verifiable in: re-render the page by the same
     route, index those pixels, and `pixels_sha256` says whether they are the
     same pixels. Converting to PDF user space would need the page's own /Rotate
     unwound — this route rotated the page to make it upright — and a rect that
     points at the wrong place is worse than one that says which space it is in. */
  const ref = `p${page}`;
  const regions = [];
  let unanchored = 0, blank = 0, unrated = 0;
  for (const w of out.regions) {
    const text = w.text;
    if (!(typeof text === "string" && text.trim().length)) { blank++; continue; }
    const [l, t0, r, b] = w.rect;
    if (![l, t0, r, b].every((n) => Number.isFinite(n))) { unanchored++; continue; }
    /* CONFIDENCE, AND THE FENCE IS ON THE BASIS RATHER THAN ON THE NUMBER.
       `basis:"engine"` is truthful here and only here: a classic decoder
       computed this from its own character-level decode. A region the engine
       rated with something outside 0..1, or did not rate at all, gets the
       STATED string "none" — never a substituted number, and never a rescaled
       one, because a rescaling this member invented would be a number about
       the engine that the engine did not produce. */
    const c = w.confidence;
    const rated = typeof c === "number" && c >= 0 && c <= 1;
    if (!rated) unrated++;
    regions.push({
      text,
      source: { kind: "pdf-page", ref, page, rect: [l, t0, r, b], space: "image-px",
                image: { width: samples.width, height: samples.height, route: rendered.route,
                         upright: rendered.upright, rotate_deg: rendered.rotate_deg,
                         pixels_sha256: rendered.pixels_sha256 || null } },
      confidence: rated ? { value: c, basis: "engine" } : "none",
    });
  }
  if (!regions.length)
    return { ok: false, reason: "NOTHING_TRANSCRIBED", detail: REFUSALS.NOTHING_TRANSCRIBED, page,
             boxes: out.boxCount, blank, unanchored,
             why: `the engine boxed ${out.boxCount} region(s) and none of them carried both text and a `
                + `usable rectangle, so there is nothing this record could anchor. An engine that `
                + `answers nothing on a page is a FINDING and not an error: CPDF-15 measured this `
                + `engine returning the empty string on noise and at CPDF-11's R3 rung, which is the `
                + `self-refusal that makes its clean-run figures worth anything.` };

  return {
    ok: true, page,
    regions, unanchored, blank, unrated, grain: out.grain,
    image: { width: samples.width, height: samples.height, frame_bytes: frame,
             route: rendered.route, upright: rendered.upright, rotate_deg: rendered.rotate_deg,
             dpi: rendered.page_geometry ? rendered.page_geometry.dpi : null,
             pixels_sha256: rendered.pixels_sha256 || null },
    confidence_floor: confidenceFloor,
  };
}

/** The whole wire answer for one request. `read(page)` is unused — the bytes are
 *  read once by the caller — but the CHUNK RULE lives here so it is one thing
 *  the suite can drive and the handler cannot get subtly different. */
export async function transcribeRequest(bytes, pages, opts = {}) {
  const { take, deferred } = chooseChunk(pages);
  if (take == null)
    return { ok: false, reason: "BAD_PAGES", detail: REFUSALS.BAD_PAGES };

  const one = await transcribeOnePage(bytes, take, opts);
  const notes = [];
  if (deferred.length)
    notes.push(`this member transcribes ONE PAGE PER INVOCATION and ${deferred.length} further `
      + `page(s) (${deferred.join(", ")}) were NOT transcribed by this call. The bound is MEMORY and `
      + `it was measured by refusal: a 61.3 MB RGBA frame completes and a 75.7 MB frame is killed `
      + `(CPDF-15). Whole-document invocation is UNMEASURED, so it is refused rather than assumed — `
      + `call again per page. Those pages keep their markers and stay honestly unread.`);

  if (!one.ok)
    return { ok: false, reason: one.reason, detail: one.detail, page: take,
             deferred, notes: notes.concat(one.why ? [one.why] : []), refusal: one };

  if (one.unanchored)
    notes.push(`${one.unanchored} region(s) the engine returned carried no usable rectangle and were `
      + `dropped rather than recorded — text nobody can point at a page to verify is exactly what `
      + `this path refuses to put in the record.`);
  if (one.unrated)
    notes.push(`${one.unrated} region(s) came back with no engine-computed confidence and are stated `
      + `as 'none' rather than given a number this member would have had to invent.`);

  return {
    ok: true,
    engine: ENGINE_NAME,
    version: ENGINE_VERSION,
    model: MODEL_NAME,
    cap: CAP,
    measured_by: MEASURED_BY,
    confidence_floor: one.confidence_floor,
    pages: [{ page: one.page, regions: one.regions }],
    /* The GRAIN is on the wire because it is the grain of a LINE in the record's
       text — the plane joins region texts with a newline — and a consumer that
       cannot tell word grain from line grain cannot tell whether a line-anchored
       read of the result means anything. Measured, not guessed: see
       `REGION_GRAIN` in `tessengine.mjs`. */
    grain: one.grain,
    deferred,
    image: one.image,
    notes,
  };
}
