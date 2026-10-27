/* THE ENGINE-FREE CORE OF READING ONE FRAME (R26, R8, R9), in a module that imports no wasm and no model.
 *
 * `tessengine.mjs` imports the wasm core and the language model as WORKERS MODULE TYPES, which node cannot resolve, so
 * the code that actually asks the engine its orientation and reads its text lived where no node-side suite could drive it.
 * It lives here now, handed the engine's constructor and the model: the worker passes `createOCREngine` over the compiled
 * core, a suite passes the same constructor over a core it compiled itself, and both run THIS code.
 */
import { QUARTER_TURNS } from "./contract.mjs";

/** THE REGION GRAIN, AND IT IS `line` FOR A MEASURED REASON RATHER THAN A
 *  PREFERENCE — the one design decision in this member that a reader would
 *  otherwise have to guess at.
 *
 *  The plane composes a page's text from the member's regions by JOINING THEIR
 *  TEXT WITH A NEWLINE (`ocrTextFromMember`, `bio-plane/src/extraction/pipeline.mjs`). So the
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
export async function readFrame(makeEngine, model, rgba, width, height, { psm = null } = {}) {
  let engine = null;
  try {
    engine = await makeEngine();
    engine.loadModel(new Uint8Array(model));
    if (psm) engine.setVariable("tessedit_pageseg_mode", String(psm));
    engine.loadImage({ data: rgba, width, height });
    /* R26: the engine's orientation is asked of every frame BEFORE its text is read, in this same session (the image is
       loaded once). `rotation` is the degrees clockwise the frame lies turned from upright; anything that is not a
       quarter turn, or a throw, is `null`: the engine could not tell, and the member states it. MEASURED, STATED: the
       answer is dependable on a full 300-dpi page and often wrong on a smaller frame, and its `confidence` is 1 whatever it
       saw, so only the rotation is passed on, never a confidence; the member turns a page only when reading it turned
       reads better than reading it as it lies. */
    let orientation = null;
    try {
      const o = engine.getOrientation();
      if (o && QUARTER_TURNS.includes(o.rotation)) orientation = { rotation: o.rotation };
    } catch { /* an engine that cannot tell is a finding, not a failure */ }
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
    /* R25: the engine's own rating of each word, for the legibility a picture states. A line's rating is the mean of its
       words', so one bad word hides its good ones; the word boxes are read from the same recognition (no second pass). */
    const words = (engine.getTextBoxes("word") || [])
      .filter((b) => typeof b.text === "string" && b.text.trim().length)
      .map((b) => ({ confidence: typeof b.confidence === "number" && Number.isFinite(b.confidence) ? b.confidence : null }));
    return { ok: true, regions, grain: REGION_GRAIN, boxCount: boxes.length, words, orientation };
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

