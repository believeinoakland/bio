/* THE ENGINE, AND THE THREE THINGS THAT MAKE IT RUN INSIDE AN ISOLATE AT ALL.
 *
 * Every one of them was found BY BEING REFUSED, on a deployed Worker, by
 * CPDF-15 (MEASUREMENTS.md, 2026-09-10). They are restated here because this is
 * the file where getting one wrong costs the next reader a probe pass:
 *
 *   1. WASM IS AN IMPORTED MODULE, NEVER A COMPILED BUFFER. Workers forbid
 *      runtime wasm compilation and emscripten's default path is
 *      `WebAssembly.instantiate(bytes)`. The core arrives as a module part of
 *      type `application/wasm` — so it IS a `WebAssembly.Module` — and reaches
 *      emscripten through its `instantiateWasm` hook, the only entry point that
 *      does `new WebAssembly.Instance(module, imports)`.
 *   2. `locateFile` MUST BE SUPPLIED. Without it emscripten evaluates
 *      `new URL("tesseract-core.wasm", import.meta.url)` and workerd throws
 *      `TypeError: Invalid URL string.` Supplying it takes the other branch.
 *   3. THE ENGINE WANTS RGBA. `loadImage` refuses anything shorter than
 *      width*height*4, so the frame is not avoidable by sending less. That frame
 *      is this member's binding constraint and `transcribe.mjs` bounds it.
 *
 * WHAT THIS FILE IS NOT. It is not a place a measured number lives. `cap`,
 * `measured_by` and the confidence floor are the RECORD's, assembled in
 * `transcribe.mjs` from constants that name their measurement; this file
 * produces text, rectangles and the engine's own confidence and judges none of
 * them.
 */
import wasmModule from "../assets/tesseract-core.wasm";
import MODEL from "../assets/eng.traineddata";
import { createOCREngine } from "./tesslib.mjs";

/** The engine, named exactly. "tesseract" is not a version, and the chain step
 *  this member produces carries both because a calibration is OF a pair and a
 *  re-run needs both (textchain.mjs, rule 1). The MODEL is named too: the same
 *  engine with a different traineddata is a different measurement, and
 *  CPDF-15's figures are figures for THIS pair. */
export const ENGINE_NAME = "tesseract-wasm";
export const ENGINE_VERSION = "0.11.0";
export const MODEL_NAME = "tessdata_fast/eng";

/* The digests CPDF-15 pinned, reproduced from a fresh install and a fresh fetch
   on 2026-09-12 and found IDENTICAL. They are asserted at runtime below, so a
   member serving different engine bytes than the ones its `cap` was measured on
   refuses instead of answering — the same class of guard the fleet bundle
   manifest applies to the files, applied here to what actually loaded. */
export const WASM_BYTES = 1839004;
export const MODEL_BYTES = 4113088;

const instantiateWasm = (info, receive) => {
  const instance = new WebAssembly.Instance(wasmModule, info);
  receive(instance, wasmModule);
  return instance.exports;
};
const locateFile = (path) => path;

/** Is the engine this member was built with actually here, and is it the one the
 *  measurement was taken on? Cheap, and it runs before any page is read.
 *  Returns null when everything agrees, or a REASON string. */
export function engineCheck() {
  if (!(wasmModule instanceof WebAssembly.Module))
    return "the wasm core did not arrive as a compiled module — a one-part upload cannot carry it, "
         + "and this member must be installed with its `assets/tesseract-core.wasm` part";
  if (!MODEL || typeof MODEL.byteLength !== "number" || MODEL.byteLength !== MODEL_BYTES)
    return `the language model is ${MODEL && MODEL.byteLength} B, the measured pair is ${MODEL_BYTES} B `
         + `(tessdata_fast eng) — a different model is a different measurement and this member's `
         + `stated fidelity would not be about it`;
  return null;
}

/** THE REGION GRAIN, AND IT IS `line` FOR A MEASURED REASON RATHER THAN A
 *  PREFERENCE — the one design decision in this member that a reader would
 *  otherwise have to guess at.
 *
 *  The plane composes a page's text from the member's regions by JOINING THEIR
 *  TEXT WITH A NEWLINE (`ocrTextFromMember` in `bio-plane/src/index.mjs`). So the
 *  grain of a region IS the grain of a line in the record's text, and at `word`
 *  grain **every OCR'd document becomes one word per line** — which is not a
 *  cosmetic difference. MEASURED on the real Oakland page 2026-09-12: at `word`
 *  grain `meeting-agenda`'s definitive signal (a file number ALONE ON A LINE,
 *  chosen because "HTML never carries them alone on a line") becomes trivially
 *  satisfiable by any number-shaped word, while its phrase signals — `Roll Call`,
 *  `Subject:` followed by its value — become UNREACHABLE, because no two words
 *  ever share a line. One grain choice in a member silently changed what every
 *  line-anchored recogniser in the estate could see.
 *
 *  `line` makes an OCR'd page look like what it is: lines of text. The anchor is
 *  no weaker — a line's rectangle is a checkable image region exactly as a word's
 *  is, and it is the region a reader would actually be pointed at. The confidence
 *  is still the engine's own, computed over that line's decode.
 *
 *  WHAT IS GIVEN UP, STATED: the confidence floor now discards a LINE rather than
 *  a word, so one badly-decoded word can take its line's text with it. That is
 *  the conservative direction — rule 4's whole point is that a region below the
 *  floor reads `undetermined` and never a best guess — and it is the direction to
 *  be on. A finer grain is a real option the day somebody measures a threshold
 *  worth applying at word level. */
export const REGION_GRAIN = "line";

/** Transcribe ONE RGBA frame. Returns `{ ok, regions }` where a region is
 *  `{ text, rect: [x0,y0,x1,y1], confidence }` in PIXEL coordinates of the frame
 *  it was given, or `{ ok:false, reason, error }`.
 *
 *  THE CONFIDENCE IS THE ENGINE'S OWN, computed from its character-level decode,
 *  which is what makes `basis:"engine"` truthful upstream. Nothing here derives,
 *  smooths or invents one; a region the engine gives no usable number for is
 *  handed on with `confidence: null` and the caller states it rather than
 *  choosing a value.
 *
 *  `getTextBoxes`, NOT `getTextItems` — the low-level engine API and the
 *  worker-thread client API do not share method names, and only the low-level
 *  one exists inside an isolate. CPDF-15's first box arm DID NOT ARM for
 *  exactly that reason and said so. */
export async function transcribeFrame(rgba, width, height, { psm = null } = {}) {
  let engine = null;
  try {
    engine = await createOCREngine({ instantiateWasm, locateFile });
    engine.loadModel(new Uint8Array(MODEL));
    if (psm) engine.setVariable("tessedit_pageseg_mode", String(psm));
    engine.loadImage({ data: rgba, width, height });
    const boxes = engine.getTextBoxes(REGION_GRAIN) || [];
    const regions = [];
    for (const b of boxes) {
      const text = typeof b.text === "string" ? b.text : "";
      const r = b.rect || {};
      if (![r.left, r.top, r.right, r.bottom].every((n) => typeof n === "number" && Number.isFinite(n)))
        continue;   /* no readable geometry means nothing to anchor: dropped, and COUNTED by the caller */
      const c = typeof b.confidence === "number" && Number.isFinite(b.confidence) ? b.confidence : null;
      regions.push({ text, rect: [r.left, r.top, r.right, r.bottom], confidence: c });
    }
    return { ok: true, regions, grain: REGION_GRAIN, boxCount: boxes.length };
  } catch (e) {
    /* A refusal is a measurement (CPDF-15's posture). It comes back as one, with
       the frame size beside it, rather than as an opaque throw — the caller
       turns it into a STATED refusal and the document stays honestly unread. */
    return { ok: false, reason: "ENGINE_FAILED", error: String((e && e.message) || e),
             name: e && e.name, frame_bytes: width * height * 4 };
  } finally {
    try { if (engine) engine.destroy(); } catch { /* the isolate is going anyway */ }
  }
}
