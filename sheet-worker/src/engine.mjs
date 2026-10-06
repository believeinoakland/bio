/* The one place the real engine is wired in: the wasm arrives as a module part the platform compiled at upload
 * (`CompiledWasm`), which only workerd resolves, so nothing a node-side suite imports reaches this file. */
import wasmModule from "../assets/sheet-engine.wasm";
import { makeEngine } from "./enginecore.mjs";

export const SHEET_ENGINE = makeEngine(wasmModule);
