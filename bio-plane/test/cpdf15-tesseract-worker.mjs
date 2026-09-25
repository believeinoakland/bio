/* CPDF-15 — the SCRATCH WORKER SOURCE. Uploaded under this item's own scratch
 * slug (`bio-ocrtess`), used, DELETED and verified gone by
 * `cpdf15-tesseract-runtime.probe.mjs`. Reachable from nothing in the plane; it
 * is not a plane source, it is not bundled, and no real slug ever carries it.
 *
 * WHAT IT IS. wasm tesseract (`tesseract-wasm`) running IN workerd, so DEC-42's
 * CPU question and the memory question nobody has taken (33.6 MB per RGBA frame:
 * which frame size completes) can be read off the PLATFORM's billing surface —
 * never off this Worker's own clock, which is a fabrication (D-56,
 * `src/cpu.mjs`). Nothing here times itself and nothing here reports a
 * millisecond about its own compute.
 *
 * THE THREE THINGS THAT MADE IT RUN AT ALL, each measured by being refused:
 *   1. WASM IS AN IMPORTED MODULE, NEVER A COMPILED BUFFER. Workers forbid
 *      runtime wasm compilation, and emscripten's default path is
 *      `WebAssembly.instantiate(bytes)`. The core is uploaded as a module part
 *      of type `application/wasm` — so it arrives as a `WebAssembly.Module` —
 *      and is handed to emscripten through its `instantiateWasm` hook, which
 *      only `new WebAssembly.Instance(module, imports)` ever touches.
 *   2. `locateFile` MUST BE SUPPLIED. Without it emscripten evaluates
 *      `new URL("tesseract-core.wasm", import.meta.url)`, and in workerd that
 *      throws `TypeError: Invalid URL string.` — MEASURED 2026-09-10, the first
 *      spike's exact failure. Supplying `locateFile` takes the other branch.
 *   3. THE ENGINE WANTS RGBA. `OCREngine.loadImage` refuses anything shorter
 *      than `width * height * 4`, so the 33.6 MB frame DEC-42 flagged is not
 *      avoidable by sending less — the client sends one byte per pixel and this
 *      Worker expands it here, inside the isolate, which is where the ceiling
 *      is. `mode=ingest` does exactly that and stops, so the frame's cost can
 *      be subtracted from the OCR arms rather than guessed at.
 *
 * The `lib.js` it imports is the vendor's own `tesseract-wasm/dist/lib.js` with
 * TWO anchored substitutions applied by the probe (which asserts both anchors
 * present, refuses to proceed if either is gone, and pins the vendor file by
 * digest): `createOCREngine` gains `instantiateWasm` and `locateFile`
 * parameters and passes them through to the emscripten factory. No other line
 * of the vendor's code is touched.
 */
import wasmModule from "./tesseract-core.wasm";
import MODEL from "./eng.traineddata";
import { createOCREngine } from "./lib.js";

/** The ONLY wasm entry point: instantiate the module the platform compiled at
 *  upload time. Nothing here compiles bytes. */
const instantiateWasm = (info, receive) => {
  const instance = new WebAssembly.Instance(wasmModule, info);
  receive(instance, wasmModule);
  return instance.exports;
};
const locateFile = (path) => path;

const json = (o, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });

export default {
  async fetch(request, env) {
    /* The gate is a per-run random token, so a stale route cannot answer this
       run's questions and nobody else can spend this account's CPU. */
    if (request.headers.get("x-probe") !== env.PROBE) return new Response("no", { status: 404 });
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") || "ocr";

    /* PING proves the ROUTE serves without spending an arm's CPU on the
       account and diluting that arm's own mean (FL-1's lesson). */
    if (mode === "ping") {
      return json({ ok: true, ping: true, mode,
        wasm_is_module: wasmModule instanceof WebAssembly.Module,
        model_bytes: MODEL.byteLength });
    }

    const w = Number(url.searchParams.get("w")), h = Number(url.searchParams.get("h"));
    const psm = url.searchParams.get("psm");

    /* INIT: create the engine and load the model, and touch no image. This is
       the per-invocation cost a cold fleet member pays before it has read a
       single pixel, and without it every OCR figure below is init + work. */
    if (mode === "init") {
      let engine = null;
      try {
        engine = await createOCREngine({ instantiateWasm, locateFile });
        engine.loadModel(new Uint8Array(MODEL));
        return json({ ok: true, mode, model_bytes: MODEL.byteLength });
      } catch (e) {
        return json({ ok: false, mode, stage: "init", error: String((e && e.message) || e) });
      } finally { try { if (engine) engine.destroy(); } catch { /* the isolate is going anyway */ } }
    }

    let gray;
    try { gray = new Uint8Array(await request.arrayBuffer()); }
    catch (e) { return json({ ok: false, mode, stage: "body", error: String((e && e.message) || e) }); }
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0 || gray.length !== w * h) {
      return json({ ok: false, mode, error: "BYTES_DO_NOT_MATCH_DIMENSIONS",
        got: gray.length, want: w * h });
    }

    /* THE FRAME. One byte per pixel arrives; four bytes per pixel are what the
       engine will accept. This allocation IS the 33.6 MB DEC-42 named. */
    let rgba;
    try {
      rgba = new Uint8Array(w * h * 4);
      for (let i = 0, j = 0; i < gray.length; i++, j += 4) {
        const v = gray[i]; rgba[j] = v; rgba[j + 1] = v; rgba[j + 2] = v; rgba[j + 3] = 255;
      }
    } catch (e) {
      return json({ ok: false, mode, stage: "rgba", error: String((e && e.message) || e),
        name: e && e.name, frame_bytes: w * h * 4 });
    }

    if (mode === "ingest") {
      /* Read every byte so the arm cannot be optimised into nothing, and return
         a checksum so the harness can prove the bytes arrived whole. */
      let sum = 0;
      for (let i = 0; i < gray.length; i++) sum = (sum + gray[i] * (i % 7 + 1)) % 2147483647;
      return json({ ok: true, mode, bytes_in: gray.length, frame_bytes: rgba.length, checksum: sum });
    }

    let engine = null;
    try {
      engine = await createOCREngine({ instantiateWasm, locateFile });
      engine.loadModel(new Uint8Array(MODEL));
      if (psm) engine.setVariable("tessedit_pageseg_mode", psm);
      engine.loadImage({ data: rgba, width: w, height: h });
      const text = engine.getText();
      let boxes = null;
      if (mode === "boxes") {
        /* The anchor question CPDF-14 died on, asked of THIS engine: does the
           same region come back over identical bytes? Reported as geometry, not
           as a claim — the harness compares, this Worker only observes. */
        /* `getTextBoxes`, NOT `getTextItems` — the first run of this probe asked
           for the latter and the arm DID NOT ARM (`TypeError: engine.getTextItems
           is not a function`, 3/3 runs, recorded rather than smoothed). The
           worker-thread client API and the low-level engine API do not share
           method names, and only the low-level one exists inside an isolate. */
        boxes = engine.getTextBoxes("word").map((t) => ({
          l: t.rect.left, t: t.rect.top, r: t.rect.right, b: t.rect.bottom,
          c: Math.round(t.confidence * 1000) / 1000, x: t.text,
        }));
      }
      return json({ ok: true, mode, text, chars: text.length,
        words: boxes ? boxes.length : null,
        box_geometry: boxes ? boxes.map((b) => `${b.l},${b.t},${b.r},${b.b}`).join(";") : null,
        box_confidences: boxes ? boxes.map((b) => b.c) : null,
        box_sample: boxes ? boxes.slice(0, 6) : null });
    } catch (e) {
      /* A refusal is a measurement. It is returned as one, with the frame size
         beside it, rather than thrown into an opaque 500. */
      return json({ ok: false, mode, stage: "ocr", error: String((e && e.message) || e),
        name: e && e.name, frame_bytes: w * h * 4,
        stack: String((e && e.stack) || "").slice(0, 900) });
    } finally { try { if (engine) engine.destroy(); } catch { /* likewise */ } }
  },
};
