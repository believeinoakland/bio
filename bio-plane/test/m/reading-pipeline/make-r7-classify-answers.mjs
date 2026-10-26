/* Records the first tick's answer of each case in `r7-classify-cases.mjs` into fixtures/r7-classify-answers.json. Run on the code before a
   change to the classification's call site (G88), so the test's "same answer" is the answer the code gave, never a hand-written one:
   node bio-plane/test/m/reading-pipeline/make-r7-classify-answers.mjs */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CASES, firstTick } from "./r7-classify-cases.mjs";

const out = {};
for (const [name, make] of Object.entries(CASES)) out[name] = JSON.parse(JSON.stringify(await firstTick(make())));
writeFileSync(fileURLToPath(new URL("./fixtures/r7-classify-answers.json", import.meta.url)), JSON.stringify(out, null, 1) + "\n");
console.log(Object.entries(out).map(([k, v]) => `${k}: ${v.reading ? v.reading.content_type : "?"} ${JSON.stringify(v).length} bytes`).join("\n"));
