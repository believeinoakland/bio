/* Writes `fixtures/g48-plane-answers.json`: `doctypeFor` over every reading of ./g48-corpus.mjs, all 17 real types registered, taken on the tranche tip BEFORE G48 changed
 * `doctypeFor` and `readText` (713e63be2e). Run once, on that tip, from the repository root:
 *   node bio-plane/test/m/plane/make-g48-plane-answers.mjs
 * The file is the record the change must reproduce; it is not regenerated afterwards. */
import fs from "node:fs";
import { corpus } from "./g48-corpus.mjs";
import { flattenText, identify, doctypeFor, readText } from "../../../../docprofile/registry.mjs";

/* `--update <reason>` (fix round 7, B69): re-records, from the real classifier, only the readings whose answer now differs from the file, and names them and the reason in
 * `rerecorded`; nothing is hand-written. Without it the whole file is taken afresh, as on 713e63be2e. */
const update = process.argv[2] === "--update" ? process.argv[3] || "unstated" : null;
const file = new URL("./fixtures/g48-plane-answers.json", import.meta.url);
const out = update ? JSON.parse(fs.readFileSync(file, "utf8")) : { note: "doctypeFor and readText over each reading of g48-corpus.mjs, all 17 types registered, before G48 (docprofile R5, R19, R38)", taken_on: "713e63be2e", readings: {} };
for (const [id, supplied, ctx] of corpus()) {
  const flat = flattenText(supplied);
  const pages = supplied && typeof supplied === "object" && Array.isArray(supplied.pages) ? supplied.pages : [];
  const dctx = { ...ctx, text: flat.text, pages };
  const stack = identify(dctx);
  const d = doctypeFor({ ...dctx, handler: stack.handler, kind: stack.kind });
  const rt = readText(supplied, ctx);
  const now = JSON.parse(JSON.stringify({ chars: flat.text.length, type: d.type.key, confidence: d.confidence, signals: d.signals, considered: d.considered, also: d.also, why: d.why ?? null,
    read: { determined: rt.determined, type: rt.doctype && rt.doctype.type.key, confidence: rt.doctype && rt.doctype.confidence, also: rt.doctype && rt.doctype.also, parse_error: rt.parse_error, stack: rt.stack && { handler: rt.stack.handler && rt.stack.handler.key, kind: rt.stack.kind } } }));
  if (!update) out.readings[id] = now;
  else if (JSON.stringify(out.readings[id]) !== JSON.stringify(now)) { out.readings[id] = now; (out.rerecorded ||= []).push({ id, why: update }); }
}
fs.writeFileSync(file, JSON.stringify(out, null, 1) + "\n");
console.log(Object.keys(out.readings).length, "readings");
