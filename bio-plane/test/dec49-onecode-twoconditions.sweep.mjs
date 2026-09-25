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
 * site of those codes in EVERY `src/*.mjs` but the files `MULTI_SITE_EXCLUDED`
 * (multisite-census.mjs) names with the reason each cannot mint — D-574 widened
 * it from `src/store.mjs` and `src/index.mjs` alone — matched as
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
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readGitProvenance, repoPath, classifyDiscovered } from "../scripts/provenance.mjs";
import * as CATALOG from "../checks/bio-checks.mjs";
import { stripComments, dec49Codes, literalSites, multiSiteFiles, MULTI_SITE_EXCLUDED } from "./multisite-census.mjs";

const src = (p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), "utf8");
/* Comment-stripped, so a code NAMED in a comment is not counted as a site. The
   stripper is guarded both ways below: a stripper that ate everything would
   report zero sites triumphantly. */
/* D-550: the walk moved to `multisite-census.mjs`, its ONE home, because
   `civicos-ui/check-refusal-codes.mjs` arm G now GATES the figure this sweep only
   printed — and two copies of one matcher are two figures. */
const strip = stripComments;

/* D-574: the files are arm G's — every src file IN THE COMMIT AT HEAD (D-238's provenance check: a file another
   worktree deposited is named and never counted) but the census's declared exclusions. */
const REPO = fileURLToPath(new URL("../../", import.meta.url));
const SRC_DIR = fileURLToPath(new URL("../src/", import.meta.url));
const PROV = readGitProvenance(REPO);
const { verified, rows } = classifyDiscovered(PROV, readdirSync(SRC_DIR).filter((f) => f.endsWith(".mjs"))
  .map((f) => ({ path: repoPath(REPO, SRC_DIR + f), what: f })));
const notCommitted = rows.filter((r) => r.state !== "in the commit");
if (!verified) console.log(`provenance: UNVERIFIED — git could not answer, so every src file is walked (D-233: never "clean")`);
for (const r of notCommitted) console.log(`provenance: src/${r.what} is ${r.state} — NOT walked`);
const FILES = Object.fromEntries(multiSiteFiles(rows.filter((r) => !verified || r.state === "in the commit").map((r) => r.what))
  .map((f) => ["src/" + f, strip(src("../src/" + f))]));
console.log(`walked: ${Object.keys(FILES).length} src files at ${PROV.headSha || "(no HEAD)"} · excluded by stated reason: `
          + [...MULTI_SITE_EXCLUDED.keys()].join(", "));
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
  /* D-574: guarded as arm G guards it, now that the walk reaches files with no block comment at all
     (schema.mjs strips to itself, legitimately) and small ones (deliverer.mjs strips to ~1,000 bytes). */
  if (raw.includes("/*") && t.length >= raw.length) { console.log(`FATAL: stripper matched nothing in ${f}`); process.exit(2); }
  if (t.length * 10 < raw.length) { console.log(`FATAL: stripper ate ${f}`); process.exit(2); }
}
if (FILES["src/store.mjs"].includes("THE SIXTH STATE MACHINE'S SIX MEMBER OPS")) {
  console.log("FATAL: stripper left a block comment behind"); process.exit(2); }
if (!FILES["src/store.mjs"].includes('refuse("MACHINE_CANNOT_MOVE_VERSION"')) {
  console.log("FATAL: stripper removed a real return site"); process.exit(2); }

/* THE RESERVED SUFFIX, harvested in `multisite-census.mjs` (D-550). */
const { families, codes } = dec49Codes(CATALOG);

if (codes.size === 0) { console.log("FATAL: empty corpus — no DEC-49 codes harvested"); process.exit(2); }
if (families.length < 3) { console.log(`FATAL: only ${families.length} families harvested`); process.exit(2); }

/* ANY QUOTED OCCURRENCE, deduped by (file, line) — the reasoning (the spelling
   list that scored 94 codes siteless; the `reason:`+`code:` double count) moved
   with the walk to `multisite-census.mjs` (D-550). */
const sitesFor = (code) => literalSites(code, FILES);

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
console.log(`CODES WITH NO LITERAL SITE IN THE WALKED FILES: ${zero}`
          + ` — NAMED, never silently scored zero: ${unreachable.join(", ") || "(none)"}`);
console.log(`\nTHE CORRECT CONSTRUCT, for comparison — the older non-DEC-49 shape already splits`
          + ` absent from malformed:\n  reason:"NO_REASON" sites  = `
          + `${(FILES["src/store.mjs"].match(/reason:\s*"NO_REASON"/g) || []).length}`
          + `\n  reason:"BAD_REASON" sites = `
          + `${(FILES["src/store.mjs"].match(/reason:\s*"BAD_REASON"/g) || []).length}`);
