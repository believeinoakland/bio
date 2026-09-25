/* THE ONE-CODE-ONE-SITE CENSUS — one home, two instruments (D-550, 2026-09-24).
 *
 * `dec49-onecode-twoconditions.sweep.mjs` MEASURED the class (a DEC-49 code named
 * at more than one literal site in `store.mjs`/`index.mjs`) and gated nothing, so
 * a new second site passed silently. `civicos-ui/check-refusal-codes.mjs` arm G
 * now GATES the same figure. Both import THIS walk, so the figure the sweep prints
 * and the figure the gate holds are one reading and cannot drift into two — the
 * shape `verdict-reader.mjs` set (D-254). No side effects: nothing here prints,
 * reads a path it was not handed, or exits.
 *
 * WHAT IT CAN SEE and CANNOT SEE is stated in the sweep's header and restated on
 * arm G's line every run: literal quoted occurrences only (a code in a variable is
 * DEC-49's floor's business), store.mjs and index.mjs only (widening to every
 * `src` file was MEASURED by D-550 at 93 against 62, the 31 extra being mostly
 * `affordances.mjs` PUBLISHING codes as data rather than minting them), and a
 * multi-site code is a CANDIDATE, never a verdict: whether two sites are one
 * condition is a judgement this walk prints the evidence for and does not make.
 */

/* Comment-stripped, so a code NAMED in a comment is not counted as a site. The
   callers guard the stripper both ways (see the sweep): a stripper that ate
   everything would report zero sites triumphantly. */
export const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

/* THE RESERVED SUFFIX. Harvested rather than listed: a list of family names goes
   stale the moment a seventh is written ("invert, do not lengthen a list"). */
export function dec49Codes(catalog) {
  const families = Object.entries(catalog)
    .filter(([k, v]) => /_CHECKS$/.test(k) && v && typeof v === "object" && !Array.isArray(v));
  const codes = new Map();   // code -> { fam, row }
  for (const [fam, table] of families)
    for (const [code, row] of Object.entries(table))
      if (row && typeof row === "object" && typeof row.translation === "string") codes.set(code, { fam, row });
  return { families, codes };
}

const lineOf = (text, i) => text.slice(0, i).split("\n").length;

/* ANY QUOTED OCCURRENCE in the comment-stripped files, deduped by (file, line).
   `files` maps a label to STRIPPED source. The guard expression in front of each
   site is returned for a reader to judge, never classified here. */
export function literalSites(code, files) {
  const out = [];
  for (const [file, text] of Object.entries(files)) {
    /* Not a list of the three spellings the sweep's first draft matched — that
       list scored NINETY-FOUR codes as having no site at all (the sweep says how). */
    const re = new RegExp(`["']${code}["']`, "g");
    let m;
    while ((m = re.exec(text)) !== null) {
      const before = text.slice(Math.max(0, m.index - 320), m.index);
      const guard = (before.match(/if\s*\([\s\S]*$/) || [""])[0].replace(/\s+/g, " ").trim().slice(0, 200);
      out.push({ file, line: lineOf(text, m.index), guard: guard || "(no `if` within 320 chars)" });
    }
  }
  /* DEDUPE BY (file, line). One refusal object commonly names its code TWICE —
     `reason:` and `code:` — and counting that as two sites manufactured candidates
     out of the correct shape (CAPTURE_NOT_DRAINING, SET_MOVED, VERSION_FROZEN and
     VERSION_LEG_UNRESOLVED, measured before the dedupe). */
  const seen = new Set();
  return out.filter((x) => { const k = `${x.file}:${x.line}`; return seen.has(k) ? false : (seen.add(k), true); });
}

/* The census: every DEC-49 code, its literal sites, and the partition the sweep
   prints and arm G gates — `multi` (2+ sites), `zero` (none in these files). */
export function multiSiteCensus(catalog, files) {
  const { families, codes } = dec49Codes(catalog);
  const multi = new Map();   // code -> { fam, sites }
  const zero = [];
  for (const [code, { fam }] of [...codes].sort()) {
    const sites = literalSites(code, files);
    if (sites.length === 0) zero.push(`${fam}.${code}`);
    else if (sites.length > 1) multi.set(code, { fam, sites });
  }
  return { families, codes, multi, zero };
}
