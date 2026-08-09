/* SWEEP INSTRUMENT — NOT a suite, and deliberately not a `.test.mjs`: it is a
 * census the battery must not discover, on `check-refusal-codes.mjs`'s precedent.
 *
 * THE CLASS. PL-19 corrected a live defect where an endpoint guard cited the
 * WRONG C-number in a refusal a caller actually reads. This sweep looks for the
 * SAME defect one shape out: a DEC-49 code returned from MORE THAN ONE distinct
 * condition, where the row's canned translation can only be true of one of them.
 * A surface may RENDER a refusal and may never compute one (DEC-8), so the
 * canned translation is what the member sees — a translation that misdescribes
 * the condition that fired is the record telling a member something untrue about
 * their own input.
 *
 * WHAT IT CAN SEE: every `*_CHECKS` family exported by the catalog (the RESERVED
 * SUFFIX the DEC-49 guard already harvests), and every literal-string return
 * site of those codes in `src/store.mjs` and `src/index.mjs` — matched as
 * `refuse("CODE"`, `reason: "CODE"`, `code: "CODE"` and their single-quoted
 * twins, over COMMENT-STRIPPED source so a code named in prose is not counted as
 * a site.
 *
 * WHAT IT CANNOT SEE, stated plainly because the sentence is load-bearing:
 *   - a code returned through a VARIABLE rather than a string literal. DEC-49's
 *     own floor already refuses that shape ("a code in a variable is invisible to
 *     the guard"), so the guard covers it and this walk does not.
 *   - whether two sites are the same CONDITION or two. That is a JUDGEMENT and
 *     this instrument does not make it: it prints the sites and their guard
 *     expressions so a reader makes it. A multi-site code is a CANDIDATE, never
 *     a verdict — `VERSION_ACT_UNWRITABLE` is returned from three sites that are
 *     one condition ("the file could not be rewritten") and is correct.
 *   - refusals composed outside a `*_CHECKS` family (the older `reason:`/`detail:`
 *     shape, e.g. `NO_REASON`/`BAD_REASON` in `#moveAction`). Those carry no
 *     canned translation to be wrong, so they are outside the class BY SHAPE —
 *     and they are printed separately as the population this class is measured
 *     AGAINST, because they are where the correct construct already lives.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as CATALOG from "../checks/bio-checks.mjs";

const src = (p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), "utf8");
/* Comment-stripped, so a code NAMED in a comment is not counted as a site. The
   stripper is guarded both ways below: a stripper that ate everything would
   report zero sites triumphantly. */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

const FILES = { "src/store.mjs": strip(src("../src/store.mjs")),
                "src/index.mjs": strip(src("../src/index.mjs")) };
/* THE STRIPPER IS GUARDED BOTH WAYS, and by CONTENT rather than by a ratio —
   these two sources are more comment than code (measured: store.mjs and
   index.mjs each strip to roughly a third), so a ratio floor would either be
   meaningless or would refuse the real file. A stripper that ate everything
   reports zero sites triumphantly; one that matched nothing counts prose as
   code. So: a string that exists ONLY in a comment must be GONE, and a real
   return site must SURVIVE. */
for (const [f, t] of Object.entries(FILES)) {
  const raw = src("../" + f);
  console.log(`stripper: ${f} ${raw.length} -> ${t.length} bytes`);
  if (t.length >= raw.length) { console.log(`FATAL: stripper matched nothing in ${f}`); process.exit(2); }
  if (t.length < 1000)        { console.log(`FATAL: stripper ate ${f}`); process.exit(2); }
}
if (FILES["src/store.mjs"].includes("THE SIXTH STATE MACHINE'S SIX MEMBER OPS")) {
  console.log("FATAL: stripper left a block comment behind"); process.exit(2); }
if (!FILES["src/store.mjs"].includes('refuse("MACHINE_CANNOT_MOVE_VERSION"')) {
  console.log("FATAL: stripper removed a real return site"); process.exit(2); }

/* THE RESERVED SUFFIX. Harvested rather than listed: a list of family names goes
   stale the moment a seventh is written, which is the failure this repository
   names as "invert, do not lengthen a list". */
const families = Object.entries(CATALOG)
  .filter(([k, v]) => /_CHECKS$/.test(k) && v && typeof v === "object" && !Array.isArray(v));
const codes = new Map();   // code -> family
for (const [fam, table] of families)
  for (const [code, row] of Object.entries(table))
    if (row && typeof row === "object" && typeof row.translation === "string") codes.set(code, { fam, row });

if (codes.size === 0) { console.log("FATAL: empty corpus — no DEC-49 codes harvested"); process.exit(2); }
if (families.length < 3) { console.log(`FATAL: only ${families.length} families harvested`); process.exit(2); }

const lineOf = (text, i) => text.slice(0, i).split("\n").length;
const sitesFor = (code) => {
  const out = [];
  for (const [file, text] of Object.entries(FILES)) {
    /* ANY QUOTED OCCURRENCE, not a list of the three spellings the first draft
       matched (`refuse(`, `reason:`, `code:`). THAT LIST WAS THE DEFECT THIS
       REPOSITORY NAMES AS "invert, do not lengthen a list": measured, it scored
       NINETY-FOUR codes as having no site at all, including the whole of
       SUGGEST_CHECKS and VERSION_STRENGTH_CHECKS, which reach their rows through
       locally-named helpers. Generous by design and deduped by line below; the
       guard expression is printed so a reader can discard a non-site. */
    const re = new RegExp(`["']${code}["']`, "g");
    let m;
    while ((m = re.exec(text)) !== null) {
      /* The 320 characters IN FRONT of the site, which is where the guard
         expression that reached it lives. Printed, never classified. */
      const before = text.slice(Math.max(0, m.index - 320), m.index);
      const guard = (before.match(/if\s*\([\s\S]*$/) || [""])[0].replace(/\s+/g, " ").trim().slice(0, 200);
      out.push({ file, line: lineOf(text, m.index), guard: guard || "(no `if` within 320 chars)" });
    }
  }
  /* DEDUPE BY (file, line). One refusal object commonly names its code TWICE —
     once as `reason:` and once as `code:` — and counting that as two sites would
     manufacture candidates out of the correct shape. Measured: it did, on
     `CAPTURE_NOT_DRAINING`, `SET_MOVED`, `VERSION_FROZEN` and
     `VERSION_LEG_UNRESOLVED`, before this was added. */
  const seen = new Set();
  return out.filter((x) => { const k = `${x.file}:${x.line}`; return seen.has(k) ? false : (seen.add(k), true); });
};

console.log(`CORPUS: ${families.length} *_CHECKS families · ${codes.size} DEC-49 codes ·`
          + ` ${Object.values(FILES).reduce((a, t) => a + t.split("\n").length, 0)} comment-stripped lines walked`);

let multi = 0, zero = 0;
const unreachable = [];
for (const [code, { fam }] of [...codes].sort()) {
  const s = sitesFor(code);
  if (s.length === 0) { zero++; unreachable.push(`${fam}.${code}`); continue; }
  if (s.length > 1) {
    multi++;
    console.log(`\nCANDIDATE  ${fam}.${code}  — ${s.length} literal return sites`);
    /* THE LINE NUMBER IS IN THE COMMENT-STRIPPED SOURCE AND SAYS SO. These two
       files are more comment than code, so a stripped line number is nowhere
       near the real one and quoting it as though it were would send the next
       reader to the wrong function — the wrong-citation class this whole sweep
       is looking for, committed by the instrument. The REAL lines are printed
       beside it, taken from the raw file. */
    for (const x of s) console.log(`    ${x.file} stripped-line ${x.line}  guard: ${x.guard}`);
    for (const [file] of Object.entries(FILES)) {
      const raw = src("../" + file).split("\n");
      const hits = raw.map((l, i) => (new RegExp(`["']${code}["']`).test(l) ? i + 1 : 0)).filter(Boolean);
      if (hits.length) console.log(`    ${file} REAL lines (code or comment): ${hits.join(", ")}`);
    }
  }
}
console.log(`\nMULTI-SITE CANDIDATES: ${multi}`);
console.log(`CODES WITH NO LITERAL SITE IN store/index: ${zero}`
          + ` — NAMED, never silently scored zero: ${unreachable.join(", ") || "(none)"}`);
console.log(`\nTHE CORRECT CONSTRUCT, for comparison — the older non-DEC-49 shape already splits`
          + ` absent from malformed:\n  reason:"NO_REASON" sites  = `
          + `${(FILES["src/store.mjs"].match(/reason:\s*"NO_REASON"/g) || []).length}`
          + `\n  reason:"BAD_REASON" sites = `
          + `${(FILES["src/store.mjs"].match(/reason:\s*"BAD_REASON"/g) || []).length}`);
