import fs from "node:fs";
import { execFileSync } from "node:child_process";
const O = "/home/user/bio/ocr-worker";
const { createOCREngine } = await import(O + "/node_modules/tesseract-wasm/dist/lib.js");
const rss = () => Math.round(process.memoryUsage().rss / 1048576);
const wasmBinary = fs.readFileSync(O + "/assets/tesseract-core.wasm");
const model = fs.readFileSync(O + "/assets/eng.traineddata");
let t = performance.now();
const eng = await createOCREngine({ wasmBinary });
eng.loadModel(model);
console.log("init ms", Math.round(performance.now() - t), "rss", rss());
for (const f of process.argv.slice(2)) {
  const dim = execFileSync("identify", ["-format", "%w %h", f]).toString().split(" ").map(Number); const data = execFileSync("convert", [f, "-depth", "8", "rgba:-"], { maxBuffer: 1<<30 }); const info = { width: dim[0], height: dim[1] };
  for (let r = 0; r < 2; r++) {
    t = performance.now();
    eng.loadImage({ data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.length), width: info.width, height: info.height });
    const text = eng.getText();
    console.log(f.split("/").pop(), info.width + "x" + info.height, "run", r, "sec", ((performance.now() - t) / 1000).toFixed(2), "chars", text.length, "rss MB", rss());
    if (r === 0) fs.writeFileSync(f + ".wasm.txt", text);
  }
}
eng.destroy?.();
