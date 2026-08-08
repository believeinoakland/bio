/* REC-75 / D-234 — THE CLASS SWEEP, RUN AS A WALK RATHER THAN ASSERTED IN PROSE.
 *
 * THE CLASS: a comparison with CALLER-DERIVED bytes on one side and STORED bytes
 * on the other, where the stored side has been through a LOSSY WRITE TRANSFORM
 * the caller's side has not. In this plane the lossy transforms are `#fmSafe`
 * (what the restricted frontmatter grammar can carry — it rewrites `"` and `\`
 * to `'`, folds newlines to spaces and trims) and `#canon` (the canonical
 * composition's escaping, which is INJECTIVE and therefore not lossy). D-234 is
 * one instance of the class; this walk enumerates the candidates so the rest are
 * READ rather than assumed.
 *
 * THE FIRST SHAPE OF THIS WALK FOUND ZERO AND THAT WAS A FINDING ABOUT THE WALK.
 * It looked for a single LINE carrying a caller-shaped reference, a stored-shaped
 * reference and a comparison operator. It found nothing — including the defect
 * it was written for — because this codebase binds and validates its arguments
 * into LOCALS before comparing anything, so the two sides of every real
 * comparison are locals several lines apart. Recorded rather than smoothed: a
 * matcher that scores its own subject zero is the D-233 shape, and the guard at
 * the bottom of this file is what surfaced it.
 *
 * SO THE UNIT IS THE FUNCTION, NOT THE LINE. A function that both WRITES through
 * `#fmSafe` (or through a local `q()` that wraps it) and COMPARES something
 * against bytes it READS BACK is a function where the two sides can disagree.
 * That co-occurrence is what `suggestVersion` had, and it is the question worth
 * asking of every other writer.
 *
 * WHAT IT STILL CANNOT SEE, stated because a walk with unstated limits
 * overclaims:
 *   - anything outside `src/store.mjs` (`index.mjs`, `query.mjs`, `checks/`);
 *   - a write in one function compared in ANOTHER — the projection tables are
 *     exactly that shape, and the freeze at `promote` is the deliberate closure
 *     named in the report;
 *   - WHICH SIDE normalises: it reports co-occurrence, and a human reads each.
 * It is a NET FOR WHERE TO LOOK, not a verdict.
 *
 * DELIBERATELY NOT A `.test.mjs`: it is an inventory for a reader, not a pin.
 * Run it:  node test/rec75-sweep.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const FILE = join(DIR, "..", "src", "store.mjs");
const src = readFileSync(FILE, "utf8");
const lines = src.split("\n");

/* COMMENT-STRIPPED, LENGTH PRESERVING, and NOT the `//`-to-end-of-line idiom
   D-232 caught deleting `"http://…"` and the rest of its line: a `//` inside a
   string literal is left alone. The invariants below fail loudly if the stripper
   ever stops preserving offsets, and the probe under them is the stripper's own
   negative control, run on every invocation. */
const strip = (text) => {
  const noBlock = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  return noBlock.split("\n").map((ln) => {
    let inS = null;
    for (let i = 0; i < ln.length; i++) {
      const c = ln[i];
      if (inS) { if (c === "\\") i++; else if (c === inS) inS = null; continue; }
      if (c === '"' || c === "'" || c === "`") { inS = c; continue; }
      if (c === "/" && ln[i + 1] === "/") return ln.slice(0, i) + " ".repeat(ln.length - i);
    }
    return ln;
  }).join("\n");
};
const stripped = strip(src);
if (stripped.length !== src.length) throw new Error("STRIPPER IS NOT LENGTH PRESERVING");
if (stripped.split("\n").length !== lines.length) throw new Error("STRIPPER CHANGED THE LINE COUNT");
{
  const probe = `const u = "http://x/y"; // http://z\n`;
  const out = strip(probe);
  if (!out.includes(`"http://x/y"`)) throw new Error("STRIPPER ATE A STRING CONTAINING //");
  if (out.includes("http://z")) throw new Error("STRIPPER DID NOT STRIP THE COMMENT");
}
const sl = stripped.split("\n");

/* METHOD BOUNDARIES, by the two-space indent every method in this class body
   carries. Crude, and crude is stated: a nested function is attributed to its
   enclosing method, which is what we want here. */
const METHOD = /^  (?:static\s+)?(?:async\s+)?(?:\*\s*)?([#A-Za-z_][\w$]*)\s*\(/;
const starts = [];
for (let i = 0; i < sl.length; i++) {
  const m = METHOD.exec(sl[i]);
  if (m) starts.push([i, m[1]]);
}
if (starts.length < 50) { console.log("** method segmentation found implausibly few methods"); process.exit(1); }

const WRITES_FMSAFE = /#fmSafe\(/;
const READS_BACK = /this\.#one\(|this\.#rows\(|this\.sql\.exec\(\s*`?\s*SELECT|SELECT /;
const COMPARES = /===|!==|\.includes\(|\.some\(|\.find\(|\.has\(/;

const report = [];
for (let s = 0; s < starts.length; s++) {
  const from = starts[s][0], to = (s + 1 < starts.length ? starts[s + 1][0] : sl.length) - 1;
  const body = sl.slice(from, to + 1).join("\n");
  if (!WRITES_FMSAFE.test(body)) continue;
  /* the definition of `#fmSafe` itself is not a writer */
  if (starts[s][1] === "#fmSafe") continue;
  report.push({
    name: starts[s][1], line: from + 1, span: to - from + 1,
    readsBack: READS_BACK.test(body), compares: COMPARES.test(body),
  });
}

console.log(`REC-75 class sweep over ${FILE}`);
console.log(`CORPUS: ${lines.length} lines · ${stripped.replace(/\s/g, "").length} non-space characters after stripping · ${starts.length} methods segmented`);
console.log(`METHODS THAT WRITE THROUGH #fmSafe: ${report.length}`);
for (const r of report)
  console.log(`  ${r.readsBack && r.compares ? "READ-BACK+COMPARE" : "write only        "}  ${r.name} (line ${r.line}, ${r.span} lines)`);
const both = report.filter((r) => r.readsBack && r.compares);
console.log(`\nOF THOSE, ALSO READING STORED BYTES BACK AND COMPARING: ${both.length}`);
for (const r of both) console.log(`  ${r.name} — READ IT`);

if (lines.length < 1000) { console.log("** the corpus is implausibly small; this walk read the wrong file"); process.exit(1); }
if (!report.length) { console.log("** ZERO writers is a finding about the WALK, not about the plane."); process.exit(1); }
