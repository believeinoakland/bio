/* NEGATIVE CONTROL (M0-18, run 2026-08-09, worktree agent-a62aec7acd493144e): the
   provenance floor added to this file is armed by `test/provenance-floor.control.mjs`
   — COMMITTED, so it re-runs in one step. 58 of 58 checks as declared over eight arms,
   each armed ALONE with every other defence held open, every restore verified by sha256
   AND by a full byte comparison against a UNIQUELY-NAMED per-arm pristine copy with the
   byte count printed and floored. ARM 1 and ARM 4 are armed on this file's harvest: a phantom is NAMED and does
   not move the reproducible figure, and an uncommitted edit to a TRACKED file still counts.
   TWO ARMS CAME BACK WRONG FIRST AND BOTH FOUND DEFECTS IN THE HARNESS RATHER THAN IN
   THE SUBJECT — the harness pinned the very refusal codes its arm was about to test, and
   spelled an `op=` token that op-claims then read as a real claim. Recorded at their
   sites in the control, not smoothed. */
/* machinefences-dec49.test.mjs — REC-64 / DEC-49's ENACTMENT, pinned.
 *
 * WHAT THIS SUITE IS FOR, AND IT IS NOT "THE ROWS EXIST".
 *
 * REC-64 gave 40 refusable conditions a code with a canned translation. The
 * cheap suite for that reads the catalogue back and asserts the rows are there,
 * and it would be worth nothing: a registry row is not a refusal, and PL-3's own
 * control **passed while asserting nothing** by checking that a registry ROW
 * existed rather than driving the refusal — correcting it immediately exposed a
 * real defect (`promote` looked its translation up in ONE registry and a new
 * code went out with `translation: undefined`). So this suite DRIVES the plane.
 *
 * Three things are held:
 *
 *   BLOCK A — THE ELEVEN MACHINE FENCES ARE REACHED AND ARE EXPLAINED. Each of
 *     the twelve `MACHINE_CANNOT_*` codes the plane mints resolves to exactly one
 *     canned translation, from exactly one family, and the DOCTRINE PACK renders
 *     all twelve. The pack is the CONSUMER, which is the point: SK-1 measured
 *     that it could render ONE of twelve, and a translation with no renderer is
 *     the hand-copy shape REC-64 forbids. This block is what turns that
 *     measurement from 1/12 to 12/12 and pins it there.
 *
 *   BLOCK B — EVERY FENCE SITS INSIDE A GOVERNED SPAN, so the guard COMPARES its
 *     code rather than reading past it.
 *
 *     **THIS BLOCK DELIBERATELY DOES NOT DRIVE THE TWELVE ACTS, and the reason is
 *     that REC-73 already does — completely, and better than a second attempt
 *     would.** `test/machine-fences.test.mjs` drives all twelve under payloads
 *     that would otherwise SUCCEED, each refused by name, each followed by the
 *     same payload accepted from a signed-in member. Re-driving them here would
 *     be a second instrument agreeing with the first at zero cost, which is the
 *     equality this project refuses everywhere else. What REC-73 does NOT assert
 *     is the thing REC-64 changed: that each fence is inside a `DEC-49 REGION`,
 *     which is what makes the guard's arm C compare its code against a row. A
 *     marker that drifted off the arm it was put around would leave a
 *     well-formed, correctly nested, non-trivial span containing a DIFFERENT
 *     refusal — and REC-73's suite would stay green through it. So this block
 *     reads the SOURCE, and it says so rather than implying it drove anything.
 *
 *   BLOCK C — §14a's CAPABILITY SENTENCE IS RECEIVED, NEVER COMPUTED (DEC-8).
 *     The run-open door hands the surface a code, a C-number and the catalogue's
 *     own sentence, and the sentence is IDENTICAL to the row's — so a surface
 *     renders what it received. DEC-8's protection is that the surface may not
 *     COMPUTE a refusal; this asserts the plane sends everything needed so it
 *     never has to.
 *
 * NEGATIVE CONTROL: `test/nc-rec64.mjs`, four arms, each armed ALONE with the
 * others held open, run and recorded in REC-64's report:
 *   (1) add a refusable condition with NO translation at a governed site ->
 *       `node civicos-ui/test/run.mjs` exits NON-ZERO naming file, line,
 *       function and the offending code. (DEC-49's guard, the one the ruling
 *       calls not optional.)
 *   (2) let a surface COMPUTE the refusal — blank the catalogue's translation so
 *       the plane sends none and the renderer must invent one -> BLOCK C fails
 *       naming DEC-8.
 *   (3) neuter the walk that enumerates refusable conditions (matcher M2) ->
 *       the REACH fails as a DELTA with the corpus size printed.
 *   (4) OVER-STRICTNESS: a correctly coded-and-translated refusal phrased
 *       unlike anything REC-64 wrote — VF-2's Spanish-row standard — must PASS.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as CATALOGUE from "../checks/bio-checks.mjs";
import { machineFences } from "../src/skillpack.mjs";
/* M0-18 — ONE mechanism, imported. The reason ARM A1 needed it is at the walk. */
import { readGitProvenance, repoPath, reportProvenance } from "../scripts/provenance.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(HERE, "..", "src");
const REPO = path.join(HERE, "..", "..");            // bio-plane/test -> repo root

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}\n          got  ${JSON.stringify(got)}\n          want ${JSON.stringify(want)}`); }
};

/* THE PREFIX IS BUILT, not written whole, for `skillpack.mjs`'s own reason: a
   suite whose subject is a prefix must not be the place the prefix is typed. */
const FENCE_PREFIX = "MACHINE" + "_CANNOT_";

/* ========================================================================= *
 *  BLOCK A — THE TWELVE FENCES, EXPLAINED, AND THE PACK RENDERS THEM
 * ========================================================================= */
console.log("\nBLOCK A — the machine/member boundary, in words a member can read");
{
  /* HARVESTED FROM THE PLANE'S SOURCE, never listed here. A hand list agrees
     with its author at zero cost and this project has measured that five times
     — including a complete hand copy of 131 op names that PASSED. */
  const minted = new Set();
  /* M0-18: the walk keeps reading the WHOLE working tree, because a fence minted
     in a file nobody has committed yet is a real fence and ARM A2 must still
     demand a translation for it — that is the direction this suite must not
     lose. `mintedRepro` is the same harvest over `git ls-tree HEAD` alone, and
     it is what ARM A1's FLOOR is computed on: `refs/stash` is repository-wide
     across all sixty worktrees, so an untracked `.mjs` beside `store.mjs` can
     arrive from a tree that never wrote it (D-238), and an arrival can only push
     a floor UP. */
  const mintedRepro = new Set();
  const srcFiles = fs.readdirSync(SRC).filter((f) => f.endsWith(".mjs"));
  const PROV = readGitProvenance(REPO);
  const inCommit = (f) => PROV.inHead === null ? true : PROV.inHead.has(repoPath(REPO, path.join(SRC, f)));
  const perFile = {};
  for (const f of srcFiles) {
    const codes = [...fs.readFileSync(path.join(SRC, f), "utf8")
      .matchAll(/["'`](MACHINE_CANNOT_[A-Z0-9_]+)["'`]/g)].map((m) => m[1]);
    perFile[f] = codes.length;
    for (const c of codes) { minted.add(c); if (inCommit(f)) mintedRepro.add(c); }
  }
  /* SAY UNVERIFIED, NEVER CLEAN (D-233) — in the assertion's prose, not only in
     the report. */
  const HEAD_SAYS = PROV.inHead === null
    ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so this is the whole working-tree harvest and is NOT a claim about any commit"
    : `in the commit at HEAD (${PROV.headSha})`;
  reportProvenance({
    prov: PROV,
    items: srcFiles.map((f) => ({ path: repoPath(REPO, path.join(SRC, f)), what: f,
      counted: `${perFile[f]} fence literal(s)` })),
    instrument: "ARM A1's fence harvest",
    corpus: `${srcFiles.length} source file(s) in src/`,
    totals: PROV.inHead === null ? [] : [
      { label: "distinct fence codes", contaminated: minted.size, reproducible: mintedRepro.size, source: "source files" },
    ],
  });

  const rows = new Map();          // code -> [family, ...]
  for (const [fam, table] of Object.entries(CATALOGUE)) {
    if (!/_CHECKS$/.test(fam) || !table || typeof table !== "object") continue;
    for (const [code, row] of Object.entries(table)) {
      if (!code.startsWith(FENCE_PREFIX)) continue;
      if (typeof row?.translation !== "string" || !row.translation.trim()) continue;
      rows.set(code, [...(rows.get(code) || []), fam]);
    }
  }
  console.log(`  corpus: ${minted.size} fence code(s) minted in the plane; ${rows.size} carry a canned `
            + `translation across ${new Set([...rows.values()].flat()).size} family(ies)`);
  console.log(`  corpus, REPRODUCIBLE: ${mintedRepro.size} of ${minted.size} fence code(s) are minted in files `
            + `${HEAD_SAYS} — ARM A1's floor of 12 applies to THESE`);

  /* CORRECTED 2026-08-09 BY M0-18, NEVER EXEMPTED. The old arm floored
     `minted.size` off a working-tree walk, so an untracked arrival raised the
     number the floor is compared against — M0-15's phantom class, and the arm
     whose whole subject is "a walk that lost sight would report a smaller set"
     was the one that could be handed a LARGER one for free. ARM A2 below is
     deliberately left over the CONTAMINATED `minted`, because a fence minted in
     an uncommitted file still has to carry a translation and narrowing THAT
     would be the hiding direction. */
  t(`ARM A1: the corpus is the TWELVE the plane actually mints — a walk that lost sight would `
    + `report a smaller set and pass every arm below it, floored over the codes another checkout `
    + `REPRODUCES (${mintedRepro.size} of ${minted.size}, ${HEAD_SAYS})`, mintedRepro.size >= 12, true);

  t("ARM A1b: the provenance check either verified against `git ls-tree HEAD` or reported UNVERIFIED — never "
    + "a silent third state, and under UNVERIFIED the two harvests COLLAPSE rather than the reproducible one "
    + "quietly reading zero",
    [PROV.inHead instanceof Set || PROV.inHead === null,
     mintedRepro.size <= minted.size,
     PROV.inHead === null ? mintedRepro.size === minted.size : true],
    [true, true, true]);

  t("ARM A2: EVERY fence the plane can mint carries a canned translation. SK-1 measured eleven of "
    + "twelve carrying NONE; this is that measurement inverted and pinned",
    [...minted].filter((c) => !rows.has(c)).sort(), []);

  t("ARM A3: and each is translated in exactly ONE place — two homes for one code is two wordings "
    + "that will drift, which is the whole reason the guard is not optional",
    [...rows.entries()].filter(([, fams]) => fams.length !== 1).map(([c]) => c).sort(), []);

  /* THE CONSUMER. A translation with no renderer is the hand-copy shape this
     item forbids, so the pack is driven rather than trusted. */
  const fences = machineFences(CATALOGUE);
  t("ARM A4: THE DOCTRINE PACK RENDERS ALL TWELVE. SK-1's headline was that the artifact whose "
    + "entire job is telling an agent what it may not do could state ONE TWELFTH of it in words",
    [fences.length >= 12, new Set(fences.map((f) => f.code)).size === fences.length], [true, true]);

  t("ARM A5: and it renders the CATALOGUE's own sentence verbatim — the pack paraphrases no "
    + "refusal, so there is no second wording to drift from",
    fences.filter((f) => {
      for (const [fam, table] of Object.entries(CATALOGUE))
        if (/_CHECKS$/.test(fam) && table?.[f.code]) return table[f.code].translation !== f.says;
      return true;
    }).map((f) => f.code), []);

  t("ARM A6: no fence's translation restates the machine word a member is being spared — a code "
    + "inside the sentence is the member decoding it anyway",
    [...rows.keys()].filter((c) => {
      const txt = [...Object.values(CATALOGUE)].find((x) => x?.[c])[c].translation;
      return /\b[A-Z][A-Z0-9]*_[A-Z0-9_]+\b/.test(txt);
    }).sort(), []);
}

/* ========================================================================= *
 *  BLOCK B — DRIVEN. THE REFUSAL A MEMBER MEETS CARRIES THE ROW'S CODE
 * ========================================================================= */
console.log("\nBLOCK B — every fence sits inside a GOVERNED span (source; REC-73 drives the acts)");
{
  /* WHERE THE DRIVING LIVES, asserted rather than mentioned, so this block's own
     limit cannot be read as completeness. */
  t("ARM B0: the suite that DRIVES all twelve under complete payloads exists — this block asserts "
    + "the structural half only, and names the other half rather than implying it",
    fs.existsSync(path.join(HERE, "machine-fences.test.mjs")), true);

  const store_src = fs.readFileSync(path.join(SRC, "store.mjs"), "utf8");
  const regionSpans = [];
  for (const m of store_src.matchAll(/\/\*[\s*]*DEC-49 REGION\s+(is-machine-[\w-]+)/g)) {
    const end = store_src.indexOf(`END DEC-49 REGION ${m[1]}`, m.index);
    if (end > m.index) regionSpans.push([m.index, end, m[1]]);
  }
  const hits = [...store_src.matchAll(/["'`](MACHINE_CANNOT_[A-Z0-9_]+)["'`]/g)];
  const inside = (idx) => regionSpans.some(([a, b]) => idx > a && idx < b);
  /* The move-version fence is excluded BY NAME and with its reason: it is
     VERSION_ACT_CHECKS' row and carries its own enforcement site, which is why
     it was the one fence the pack could already render. */
  const outside = hits.filter((m) => !inside(m.index) && m[1] !== "MACHINE_CANNOT_MOVE_VERSION")
                      .map((m) => m[1]).sort();
  console.log(`  corpus: ${hits.length} fence literal(s) in store.mjs across `
            + `${regionSpans.length} machine-fence region(s)`);

  t("ARM B1: the corpus is non-empty in BOTH directions — a walk that found no literals, or no "
    + "regions, would report an empty `outside` and pass while measuring nothing",
    [hits.length >= 12, regionSpans.length >= 11], [true, true]);

  t("ARM B2: every machine fence in the store sits INSIDE a DEC-49 region, so the guard's arm C "
    + "COMPARES its code against a row rather than reading past it", outside, []);

  t("ARM B3: and no region is a pair of markers that collapsed onto each other — a span that small "
    + "would judge nothing while passing every other check here",
    regionSpans.filter(([a, b]) => b - a < 120).map((r) => r[2]), []);
}

/* ========================================================================= *
 *  BLOCK C — §14a's CAPABILITY SENTENCE IS RECEIVED, NOT COMPUTED
 * ========================================================================= */
console.log("\nBLOCK C — §14a: the capability sentence is one the surface RECEIVED (DEC-8)");
{
  const store_src = fs.readFileSync(path.join(SRC, "store.mjs"), "utf8");
  const row = CATALOGUE.ACT_SHAPE_CHECKS.AI_RUN_CAPABILITY_UNAVAILABLE;

  t("ARM C1: the condition §14a promises the surface will SAY has a code and a canned translation, "
    + "so UI-38 was right to leave the sentence rather than author it",
    [typeof row?.check, typeof row?.translation, row.translation.trim().split(/\s+/).length >= 6],
    ["string", "string", true]);

  /* DEC-8, AND THIS IS THE ARM THAT HOLDS IT. The plane must SEND the sentence.
     A surface that had to look one up, or compose one, would be computing a
     refusal, which DEC-49 did not license and DEC-8 still forbids. */
  const site = store_src.slice(store_src.indexOf("AI_RUN_CAPABILITY_UNAVAILABLE") - 400,
                               store_src.indexOf("AI_RUN_CAPABILITY_UNAVAILABLE") + 400);
  t("ARM C2: the run-open door SENDS the code, the C-number AND the sentence — a surface renders "
    + "what it received and computes nothing (DEC-8 as amended by DEC-49)",
    [/code:\s*"AI_RUN_CAPABILITY_UNAVAILABLE"/.test(site),
     /check:\s*ACT_SHAPE_CHECKS\.AI_RUN_CAPABILITY_UNAVAILABLE\.check/.test(site),
     /translation:\s*ACT_SHAPE_CHECKS\.AI_RUN_CAPABILITY_UNAVAILABLE\.translation/.test(site)],
    [true, true, true]);

  /* READ FROM ONE PLACE. The site must not spell the sentence itself: a hand
     copy agrees at zero cost, and PL-3's `promote` shipped `translation:
     undefined` from exactly this shape gone wrong. */
  t("ARM C3: and store.mjs holds NO second copy of the sentence — the map is read from the "
    + "catalogue at the moment of refusal, which is REC-64's stated runtime-lookup choice",
    store_src.includes(row.translation.slice(0, 40)), false);

  /* THE HONEST-ABSENCE HALF, which is why §14a asked for the sentence at all. */
  t("ARM C4: the sentence distinguishes an unavailable capability from a run that looked and found "
    + "nothing — the silent no-op FL-6 names is what it exists to prevent",
    /nothing (was run|here should be read)/i.test(row.translation), true);
}

/* ========================================================================= *
 *  BLOCK D — EVERY ROW'S CODE IS MINTED INSIDE THE SPAN ITS `where` CLAIMS
 * ========================================================================= *
 *
 * **THIS IS THE INVERSE OF THE DEC-49 GUARD'S ARM C, AND THE TWO DIRECTIONS ARE
 * NOT THE SAME CLAIM.** Arm C reads a governed span and asks *does every code
 * minted here have a row?* This asks the other one: *does every row's code
 * actually get minted in the span the row points at?* A row can pass arm C
 * forever while pointing at a span that mints nothing of the kind — PL-4
 * measured exactly that shape, a `where` naming `src/index.mjs acquire`, a
 * function that does not exist, so nothing had been checking that site.
 *
 * **AND IT IS WHY THIS BLOCK EXISTS RATHER THAN A LIST OF C-NUMBERS.**
 * `scripts/coverage.mjs --strict` requires every catalogue check to be NAMED by
 * an assertion, and it decides that by matching the C-number against the suites'
 * text. Forty C-numbers in a comment would satisfy it exactly as well as forty
 * real arms — a hand copy agreeing with its author at zero cost, which this
 * project has measured five times, most recently as a complete hand copy of 131
 * op names that PASSED. So each C-number below is named by an arm that RESOLVES
 * the row's own `where` against the plane's source and can fail. Rename a code,
 * move a marker off its guard, or invent a row for a condition the plane does
 * not have, and the arm naming that C-number goes red.
 */
console.log("\nBLOCK D — every row points at a span that really mints its code");
{
  const FAMILIES = ["MACHINE_FENCE_CHECKS", "ACT_SHAPE_CHECKS"];

  /* ------------------------------------------------------------------ THE PIN
   *
   * **A HAND COPY THAT CANNOT AGREE AT ZERO COST, and it is written this way
   * BECAUSE the instrument forced a hand copy and this project has been burned
   * by one five times.** `scripts/coverage.mjs` decides a check is NAMED by
   * regex-matching its C-number against the SUITES' SOURCE TEXT. A number built
   * at runtime from `row.check` — which is what the arms below do — is invisible
   * to it, measured rather than assumed: the arms named every C-number in their
   * output and `--strict` still reported all forty NEVER NAMED. So the numbers
   * have to be literals here.
   *
   * A bare list of forty literals would then be the exact failure this project
   * keeps measuring: a copy that satisfies the instrument and asserts nothing.
   * **So the list is PINNED IN BOTH DIRECTIONS against the catalogue.** A row
   * renumbered, a code renamed, a row added, or a row deleted breaks one of the
   * two arms below. The copy cannot drift silently, which is the only condition
   * under which a copy is honest.
   * ------------------------------------------------------------------------- */
  const PINNED = [
    /* MACHINE_FENCE_CHECKS — SK-1's eleven, D-229's eleven, REC-73's ten */
    ["C-32.1", "MACHINE_CANNOT_RELEASE"],
    ["C-32.2", "MACHINE_CANNOT_CONCLUDE"],
    ["C-32.3", "MACHINE_CANNOT_MOVE_ACTION"],
    ["C-32.4", "MACHINE_CANNOT_CORRESPOND"],
    ["C-32.5", "MACHINE_CANNOT_REOPEN"],
    ["C-32.6", "MACHINE_CANNOT_PUBLISH"],
    ["C-32.7", "MACHINE_CANNOT_DIVIDE"],
    ["C-32.8", "MACHINE_CANNOT_GROUND"],
    ["C-32.9", "MACHINE_CANNOT_DECLARE"],
    ["C-32.10", "MACHINE_CANNOT_FORWARD"],
    ["C-32.11", "MACHINE_CANNOT_RESOLVE"],
    /* ACT_SHAPE_CHECKS — the single-homed tail, plus §14a's capability sentence */
    ["C-33.1", "NO_CONCLUSION"],
    ["C-33.2", "NO_FALSIFIER"],
    ["C-33.3", "NO_RESOLUTION"],
    ["C-33.4", "RESOLUTION_WITHOUT_RESOLVING"],
    ["C-33.5", "BAD_DIRECTION"],
    ["C-33.6", "BAD_DATE"],
    ["C-33.7", "CAPTURE_AND_TESTIMONY"],
    ["C-33.8", "NEITHER_CAPTURE_NOR_TESTIMONY"],
    ["C-33.9", "UNREGISTERED_ARTIFACT"],
    ["C-33.10", "NO_ACKNOWLEDGMENT"],
    ["C-33.11", "NO_MITIGATION"],
    ["C-33.12", "ENTRY_REQUIREMENTS"],
    ["C-33.13", "NOT_INQUIRIES"],
    ["C-33.14", "NO_STATEMENT"],
    ["C-33.15", "BAD_NOTE"],
    ["C-33.16", "NO_ROLE"],
    ["C-33.17", "BAD_ROLE"],
    ["C-33.18", "ROLE_NOT_APPLICABLE"],
    ["C-33.19", "SEVERED_EDGE"],
    ["C-33.20", "NO_SUCH_SELECTION"],
    ["C-33.21", "CAS_STALE"],
    ["C-33.22", "SELF_BASIS"],
    ["C-33.23", "BASIS_CYCLE"],
    ["C-33.24", "FILES_DROPPED"],
    ["C-33.25", "NO_ALIAS"],
    ["C-33.26", "UNKNOWN_AFTER"],
    ["C-33.27", "KIND_NOT_PERSONAL"],
    ["C-33.28", "LAST_OWNER"],
    ["C-33.29", "AI_RUN_CAPABILITY_UNAVAILABLE"],
    /* REC-76 / D-236 — CORRECTED HERE RATHER THAN EXEMPTED. Three rows landed in
       ACT_SHAPE_CHECKS when the DEC-49 guard's arm C stopped grading a refusal by
       the single literal `ok: false`: the two CODELESS refusals the widened
       classifier found at `aiRunOpen` (a governed site that had read `0 judged, 0
       code(s) checked` for as long as its row had existed), and `SET_MOVED`,
       whose region `where` could not be written at all while a computed verdict
       `ok: !stopped` was invisible. **THE PIN GOING RED IS THIS ARM WORKING** —
       a copy that could absorb three new rows in silence would be the drift the
       block above says it exists to stop. */
    ["C-33.30", "AI_RUN_NO_CONTEXT"],
    ["C-33.31", "AI_RUN_ALREADY_OPEN"],
    ["C-33.32", "SET_MOVED"],
  ];
  const live = FAMILIES.flatMap((f) => Object.entries(CATALOGUE[f]).map(([c, r]) => `${r.check}=${c}`)).sort();
  const pinned = PINNED.map(([n, c]) => `${n}=${c}`).sort();

  t("ARM D-PIN-A: every C-number written literally above is one the catalogue really allocates to "
    + "that code — the copy cannot be right about a row the catalogue does not have",
    pinned.filter((p) => !live.includes(p)), []);
  t("ARM D-PIN-B: and the catalogue holds NOTHING these two families allocate that the list above "
    + "misses — the other direction, without which a shrinking copy would pass",
    live.filter((l) => !pinned.includes(l)), []);
  const srcCache = new Map();
  const read = (rel) => {
    if (!srcCache.has(rel)) srcCache.set(rel, fs.readFileSync(path.join(HERE, "..", rel), "utf8"));
    return srcCache.get(rel);
  };

  /* The span a `where` claims. Region form takes the marker pair; whole-function
     form takes from the declaration to the next same-indent method. Deliberately
     simpler than the guard's own resolver — an independent reading is the point,
     and a second copy of the guard's parser would agree with it for free. */
  const spanFor = (where) => {
    const m = /^([\w./-]+\.mjs)\s+([#\w$]+)(?:\s*>\s*([\w-]+))?/.exec(String(where || ""));
    if (!m) return null;
    const src = read(m[1]);
    if (m[3]) {
      const open = src.indexOf(`DEC-49 REGION ${m[3]}`);
      const close = src.indexOf(`END DEC-49 REGION ${m[3]}`);
      return open >= 0 && close > open ? src.slice(open, close) : null;
    }
    const decl = new RegExp(`\\n  ${m[2].replace(/[$#]/g, "\\$&")}\\s*\\(`).exec(src);
    if (!decl) return null;
    const rest = src.slice(decl.index + 1);
    const next = /\n  [#\w$]+\s*\([^\n]*\)\s*\{/.exec(rest.slice(10));
    return next ? rest.slice(0, next.index + 10) : rest.slice(0, 8000);
  };

  let rowsSeen = 0;
  for (const fam of FAMILIES) {
    const table = CATALOGUE[fam];
    for (const [code, row] of Object.entries(table)) {
      rowsSeen++;
      const span = spanFor(row.where);
      /* THE C-NUMBER IS IN THE LABEL, which is what `coverage.mjs --strict`
         reads — and the arm under it is a real measurement, so the naming is
         earned rather than declared. */
      t(`ARM D/${row.check}: ${code} is minted inside the span its \`where\` claims `
        + `(${row.where.split(",")[0]})`,
        [span !== null, span !== null && span.includes(`"${code}"`)], [true, true]);
    }
  }
  console.log(`  corpus: ${rowsSeen} rows across ${FAMILIES.length} families, each resolved against `
            + `the plane's source and each naming its own C-number`);
  /* THE CORPUS FLOOR. Without it a families list that stopped resolving would
     run zero arms and report green — the "passes while asserting nothing" shape
     this whole block is written against. */
  t("ARM D0: the row corpus is the size REC-64 landed — a walk that lost a family would run fewer "
    + "arms and every one of them would still pass", rowsSeen, 43);
}

/* THE TAIL LINE IS THE BATTERY'S CONTRACT, not decoration: `scripts/battery.mjs`
   reads `N pass, M fail` off it, and a suite whose count cannot be read is
   reported as UNKNOWN rather than as zero (D-93's `sshsig` 16-vs-18 case). */
console.log(`\nmachinefences-dec49: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
