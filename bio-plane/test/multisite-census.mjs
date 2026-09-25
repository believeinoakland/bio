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
 * DEC-49's floor's business), in EVERY `bio-plane/src` file but the ones
 * `MULTI_SITE_EXCLUDED` names with the reason each cannot mint (D-574: D-550 walked
 * store.mjs and index.mjs only, so AI_RUN_BOUND_UNKNOWN's four sites in airun.mjs
 * and TEXT_ATTEST_EXTENT's four in textchain.mjs went unwatched), and a
 * multi-site code is a CANDIDATE, never a verdict: whether two sites are one
 * condition is a judgement this walk prints the evidence for and does not make.
 */
/* THE FILES THAT NAME CODES AND CANNOT MINT ONE (D-574). Excluded BY NAME, with the
   reason, and INVERTED rather than listed: the walk reads every `src/*.mjs` except
   these, so a new plane file is walked the day it is written. Each reason is a claim
   about what the file IS, checked at the file (none calls `refusal(`, measured
   2026-09-25) — a file that starts minting refusals leaves this map, it does not
   hide behind it. A name here that is not among the files handed in is stale and THROWS (below). */
export const MULTI_SITE_EXCLUDED = new Map([
  ["affordances.mjs", "PUBLISHES codes as data (op=affordances, REC-19/DEC-8): its tables name the code each act "
    + "would be refused with, so a surface can render it; it mints none. Walked, it added 16 false candidates, every "
    + "one a code minted once in store.mjs and PUBLISHED once here (D-550 measured the class, D-574 the figure)"],
  ["setup.mjs", "the instance's own setup PAGE, served as a string to a browser: its script READS a refusal code it "
    + "received to choose the words it shows (`why === \"FILES_DROPPED\"`), and DEC-8 forbids a surface computing "
    + "one. Walked, it made CAS_STALE and FILES_DROPPED false candidates (D-574)"],
  ["livefire.mjs", "the live-fire BATTERY: it ASSERTS the codes a deployed plane answers (`… .reason, \"CAS_STALE\"`), "
    + "the READ shape RATE_IP is closed for, never a mint. Walked, it made CAS_STALE a false candidate (D-574)"],
]);

/* The plane files the census reads: every `.mjs` name in `names`, less the declared
   exclusions, sorted so the order is the tree's and not the disk's. PURE — the CALLER
   lists the directory, through its own provenance check (`scripts/provenance.mjs`,
   D-238), so a file another worktree deposited is never counted here; this module
   walks nothing and exports nothing a walk derived. */
export function multiSiteFiles(names) {
  const present = names.filter((f) => f.endsWith(".mjs"));
  const stale = [...MULTI_SITE_EXCLUDED.keys()].filter((f) => !present.includes(f));
  if (stale.length)
    throw new Error(`multisite-census: MULTI_SITE_EXCLUDED names ${stale.join(", ")}, which ${stale.length > 1 ? "are" : "is"} `
      + `not among the src files handed in. A stale exclusion is an exemption nobody needs; remove it (D-574).`);
  return present.filter((f) => !MULTI_SITE_EXCLUDED.has(f)).sort();
}

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
