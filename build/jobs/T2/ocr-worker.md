# Job record · T2 · ocr-worker

Session: `session_01LumujCtUSN1WBLyoke2Hz2` (OCR-WORKER #1)

## Questions and reports for BOB

- **Q1 · open.** R19 says the wasm and model byte sizes (`WASM_BYTES`, `MODEL_BYTES`) are "checked against what actually loaded before any page is processed". The model's size can be checked at run time (it arrives as bytes). The wasm core cannot: it arrives as a compiled `WebAssembly.Module`, which carries no byte length, and `WASM_BYTES` is read by nothing today. **My best reading, which I am building on:** at run time the member checks what it can observe (the core arrived as a compiled module; the model's byte length equals `MODEL_BYTES`) and refuses `ENGINE_ABSENT` otherwise; the core's exact bytes are pinned before deploy by the bundle manifest, which hashes `assets/tesseract-core.wasm` (bundler R4/R6). My R19 test checks both halves, plus that the committed asset files are `WASM_BYTES` and `MODEL_BYTES` long. **Recommendation:** reword R19 to say so, keeping its meaning (a member serving other engine bytes than the measured ones refuses or is caught as stale).

## Status

**Working.** Entry T2-12 in progress.
