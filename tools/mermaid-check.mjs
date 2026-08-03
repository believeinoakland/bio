#!/usr/bin/env node
/* Parse every mermaid block in an HTML file with the REAL mermaid parser.
 *
 * Exists because a diagram was shipped to Bob twice with notation that was
 * confusing and, the second time, plainly wrong -- and because a mermaid block
 * that fails to parse renders as an error box on the published page, which is
 * discovered by the reader rather than by us. Guessing at syntax is what
 * produced both failures; this checks it instead.
 *
 * mermaid and jsdom are NOT repository dependencies -- nothing the plane ships
 * needs them, and adding them to bio-plane would put a browser-shaped library in
 * a Worker's tree for the sake of a document. Install them wherever you like and
 * point MERMAID_DIR at it:
 *
 *     mkdir -p /tmp/mmcheck && cd /tmp/mmcheck && npm i mermaid@11.15.0 jsdom
 *     MERMAID_DIR=/tmp/mmcheck node tools/mermaid-check.mjs docs/development/research/review-document.html
 *
 * 11.15.0 is the version the artifact runtime ships; pin to match it, because a
 * parser that is newer than the renderer will accept syntax the page cannot draw.
 *
 * NEGATIVE CONTROL: (run 2026-08-03) corrupt one relationship token in the class
 * diagram (`Target <|-- Document` -> `Target <|@@-- Document`) -> block #1 FAILS with a
 * caret pointing at the offending column and the run reports `1 FAILED`, exit 1;
 * restored, all 6 blocks PASS.
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const dir = process.env.MERMAID_DIR;
const file = process.argv[2];
if (!file) {
  console.error("usage: [MERMAID_DIR=<dir with mermaid+jsdom>] node tools/mermaid-check.mjs <file.html>");
  process.exit(2);
}

const req = createRequire(dir ? `${dir}/package.json` : import.meta.url);
let JSDOM;
try {
  ({ JSDOM } = req("jsdom"));
} catch (e) {
  console.error("jsdom not resolvable. Install mermaid+jsdom and set MERMAID_DIR -- see the header of this file.");
  console.error(String(e.message || e));
  process.exit(2);
}

/* THE DOM MUST EXIST BEFORE MERMAID IS IMPORTED, and the ordering is load-bearing
   rather than stylistic: mermaid pulls in DOMPurify, which binds to `window` AT
   IMPORT TIME and degrades to a no-op object if there is none. Import first and
   every block fails with `DOMPurify.sanitize is not a function`, which reads like
   a broken diagram and is a broken harness. This tool caught that in itself on
   2026-08-03, which is the argument for having it.

   A real DOM rather than a stub, too: a hand-rolled stub accepts what a browser
   refuses, and that is the same class of error this tool exists to catch. */
const dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true });
for (const k of ["window", "document", "navigator", "Element", "HTMLElement", "SVGElement",
                 "Node", "DOMParser", "MutationObserver", "requestAnimationFrame"])
  if (globalThis[k] === undefined) globalThis[k] = dom.window[k];
if (globalThis.getComputedStyle === undefined)
  globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);

let mermaid;
try {
  mermaid = (await import(pathToFileURL(req.resolve("mermaid")).href)).default;
} catch (e) {
  console.error("mermaid not resolvable. Install mermaid+jsdom and set MERMAID_DIR -- see the header of this file.");
  console.error(String(e.message || e));
  process.exit(2);
}

mermaid.initialize({ startOnLoad: false, securityLevel: "loose" });

const html = readFileSync(file, "utf8");
const blocks = [...html.matchAll(/<pre class="mermaid">([\s\S]*?)<\/pre>/g)].map((m) => m[1].trim());
console.log(`${file}: ${blocks.length} mermaid block(s)\n`);
if (!blocks.length) { console.log("  nothing to check"); process.exit(0); }

let bad = 0;
for (const [i, src] of blocks.entries()) {
  const kind = src.split("\n")[0].trim();
  try {
    await mermaid.parse(src);
    console.log(`  PASS  #${i + 1}  ${kind}`);
  } catch (e) {
    bad++;
    console.log(`  FAIL  #${i + 1}  ${kind}`);
    for (const line of String(e.message || e).split("\n").slice(0, 6)) console.log(`        ${line}`);
  }
}
console.log(`\n${bad === 0 ? "ALL PARSE" : `${bad} FAILED`}`);
process.exit(bad ? 1 : 0);
