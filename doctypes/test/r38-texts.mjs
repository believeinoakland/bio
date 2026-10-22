/* The texts R38's tests read: a fixture document that the type recognises, followed by prose until the text is 13.6
 * million characters long (the length of the govinfo budget volume BUDGET-2024-APP). The prose says a few things a
 * parse reads (a defined term, a period of time, an exception) a few thousand lines apart, so the answers are small and
 * the memory a parse needs is what it needs for the text, not for its answer. Nothing here is the module under test. */
import fs from "node:fs";
import { flattenText } from "../../docprofile/readtext.mjs";
import { POLICIES } from "./policies.mjs";
import { servedDocuments, textOf } from "./codifier.mjs";

export const KINDS = ["policy", "regulation", "code"];
export const TYPE_OF = { policy: "policy", regulation: "regulation", code: "regulation" };
export const LARGE_CHARS = 13_600_000;

const json = (f) => JSON.parse(fs.readFileSync(new URL(`./fixtures/${f}`, import.meta.url), "utf8"));

/** About `LARGE_CHARS` characters of prose lines, a few of them with something to read: a block of 4000 lines
 *  repeated, built so that no list of lines or joined copy stands beside it. */
function prose() {
  const block = [];
  for (let i = 0; i < 4000; i++)
    block.push(i === 1000 ? '"Record" means a document kept by the office for the matter before it, in the file kept for it.'
      : i === 2000 ? "The office shall answer the request within 30 days, notwithstanding the load of the matters before it."
      : i === 3000 ? "This policy shall apply to every matter the office takes up, in the file kept for each of them."
      : "The office keeps the papers of each matter in the file kept for it, and the file is kept as long as the matter is open");
  const unit = block.join("\n") + "\n";
  return unit.repeat(Math.ceil(LARGE_CHARS / unit.length));
}

/** The large text of a kind: a fixture document the type recognises, with the prose put inside it where a section runs
 *  on past it: `policy`, a captured policy (a header, an outline, a table), the prose before its last section;
 *  `regulation`, the ordinance of fw18-doctypes.json, the prose in its first section; `code`, six of the codifier's
 *  served code sections (a text the regulation type reads as a code), the prose in the second. */
export function largeText(kind) {
  let head, before;
  if (kind === "policy") { head = POLICIES.documents.find((d) => d.id === "ai-594").text; before = /^XI\. PROCEDURES$/m; }
  else if (kind === "regulation") { head = json("fw18-doctypes.json").documents.regulation.text; before = /^8\.28\.005 /m; }
  else if (kind === "code") { head = servedDocuments().slice(0, 6).map((s) => textOf(s.doc).document).join("\n"); before = /^2\.20\.030 - /m; }
  else throw new Error(`kind: ${kind}`);
  const doc = flattenText(head).text;
  const at = before.exec(doc);
  if (!at) throw new Error(`${kind}: no place for the prose`);
  const text = doc.slice(0, at.index) + prose() + doc.slice(at.index);
  text.indexOf("\u0000");   // a joined string is one flat string before anything is measured
  return text;
}
