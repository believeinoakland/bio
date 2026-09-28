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
/* T3 (legacy-tests), 2026-09-26: the store's corpus with the extracted modules, for ARM D's `where` resolution. */
import { storeCorpus } from "./extracted-sources.mjs";
/* RE-ANCHORED 2026-09-28 (AI-RUNS #2 J6.1): §14a's capability row lives in ai-runs' own table now. */
import { AI_RUN_ACT_SHAPE_CHECKS } from "../src/ai-runs/checks.mjs";

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
  /* RE-ANCHORED 2026-09-28 (T8, legacy-tests): the plane's source is no longer one flat directory — T3–T8 moved the
     acts, and the fences they mint, into `src/<module>/` (T8 alone: actions, case-authoring, review, ratification) — so
     the harvest reads every `.mjs` under `src/` except a module's `test/` or `dist/`, each named by its path under
     `src/`. Read flat, it saw the fences only where a top-level file happened to spell them. */
  const walkSrc = (rel = "") => fs.readdirSync(path.join(SRC, rel), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (["test", "dist"].includes(e.name) ? [] : walkSrc(rel ? `${rel}/${e.name}` : e.name))
      : e.name.endsWith(".mjs") ? [rel ? `${rel}/${e.name}` : e.name] : []);
  const srcFiles = walkSrc().sort();
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

  /* RE-ANCHORED 2026-09-28 (T8, legacy-tests): a fence's row is the catalogue's OR its module's — T8's modules took
     fence rows with them (actions' ACTION_FENCE_CHECKS and RECORDS_LAW_FENCE_CHECKS, review's C-32.16, ratification's
     RATIFY_MACHINE_FENCE_CHECKS, and the layer-9 families) — so the rows are harvested from the catalogue AND every
     `src/<module>/checks.mjs`, by the same `_CHECKS` suffix, discovered and never listed. A row object met twice (a
     module re-exporting a family, a view whose rows are another family's) is ONE row: dedupe by identity, as the DEC-49
     guard's harvest does, so A3's "exactly one place" still means one home. */
  const FAMILY_SOURCES = [["checks/bio-checks.mjs", CATALOGUE]];
  for (const d of fs.readdirSync(SRC, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort())
    if (fs.existsSync(path.join(SRC, d, "checks.mjs")))
      FAMILY_SOURCES.push([`src/${d}/checks.mjs`, await import(`../src/${d}/checks.mjs`)]);
  const rows = new Map();          // code -> [family, ...]
  const rowText = new Map();       // code -> its canned translation (the first home's)
  const seenRow = new Set();
  for (const [, mod] of FAMILY_SOURCES)
  for (const [fam, table] of Object.entries(mod)) {
    if (!/_CHECKS$/.test(fam) || !table || typeof table !== "object") continue;
    for (const [code, row] of Object.entries(table)) {
      if (!code.startsWith(FENCE_PREFIX)) continue;
      if (typeof row?.translation !== "string" || !row.translation.trim()) continue;
      if (seenRow.has(row)) continue;
      seenRow.add(row);
      rows.set(code, [...(rows.get(code) || []), fam]);
      if (!rowText.has(code)) rowText.set(code, row.translation);
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
      const txt = rowText.get(c);   /* T8: the row's own home, the catalogue's or its module's */
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

  /* RE-ANCHORED 2026-09-28 (T7 layer 6): four fences left store.mjs WITH their regions — MACHINE_CANNOT_CONCLUDE
     (`conclude > is-machine-conclude`) to basis-versions (BASIS-VERSIONS #1 J4.1), MACHINE_CANNOT_DIVIDE and
     MACHINE_CANNOT_GROUND (`#divide`, `#ground`) to inquiry (INQUIRY #1 J2.2), MACHINE_CANNOT_DECLARE
     (`strengthBarSet > is-machine-strength-bar`) to strength (STRENGTH #1 J5) — as MACHINE_CANNOT_REOPEN went to
     promotion at T3. The walk reads the store's corpus with the modules extracted from it. */
  /* RE-ANCHORED 2026-09-28 (T8, legacy-tests): and six more left the store WITH their regions in T8 —
     MACHINE_CANNOT_MOVE_ACTION, _CORRESPOND, _SET_LAWS and _SET_RISK_TIER to actions (ACTIONS #1 J2.4, with T8's
     MACHINE_CANNOT_STATE_RECORDS_LAW), MACHINE_CANNOT_PUBLISH to case-authoring (CASE-AUTHORING #1 J5) and
     MACHINE_CANNOT_REVIEW to review (REVIEW #1 J4). */
  const store_src = [storeCorpus(["record-core", "membership", "promotion"]),
    ...["inquiry", "basis-versions", "strength", "actions", "case-authoring", "review"]
      .map((m) => fs.readFileSync(path.join(SRC, m, "index.mjs"), "utf8"))]
    .join("\n");   /* each module's minting code (index.mjs); its checks.mjs holds the rows, and their prose */
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
  console.log(`  corpus: ${hits.length} fence literal(s) in store.mjs and its extracted modules across `
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
  /* RE-ANCHORED 2026-09-28 (AI-RUNS #2 J6.1, its R35): the run-open door and its row moved out of store.mjs and the
     catalogue into ai-runs — `open` in src/ai-runs/index.mjs mints it from `AI_RUN_ACT_SHAPE_CHECKS`
     (src/ai-runs/checks.mjs), C-33.29 and the sentence unchanged. */
  const store_src = fs.readFileSync(path.join(SRC, "ai-runs", "index.mjs"), "utf8");
  const row = AI_RUN_ACT_SHAPE_CHECKS.AI_RUN_CAPABILITY_UNAVAILABLE;

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
     /check:\s*AI_RUN_ACT_SHAPE_CHECKS\.AI_RUN_CAPABILITY_UNAVAILABLE\.check/.test(site),
     /translation:\s*AI_RUN_ACT_SHAPE_CHECKS\.AI_RUN_CAPABILITY_UNAVAILABLE\.translation/.test(site)],
    [true, true, true]);

  /* READ FROM ONE PLACE. The site must not spell the sentence itself: a hand
     copy agrees at zero cost, and PL-3's `promote` shipped `translation:
     undefined` from exactly this shape gone wrong. */
  t("ARM C3: and the minting module (ai-runs, formerly store.mjs) holds NO second copy of the sentence — the map is read from the "
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
    /* C-32.3: moved to PINNED_MOVED below (T8) */
    /* C-32.4: moved to PINNED_MOVED below (T8) */
    ["C-32.5", "MACHINE_CANNOT_REOPEN"],
    ["C-32.6", "MACHINE_CANNOT_PUBLISH"],
    ["C-32.7", "MACHINE_CANNOT_DIVIDE"],
    ["C-32.8", "MACHINE_CANNOT_GROUND"],
    /* C-32.9: moved to PINNED_MOVED below (T7) */
    ["C-32.10", "MACHINE_CANNOT_FORWARD"],
    ["C-32.11", "MACHINE_CANNOT_RESOLVE"],
    /* REC-123 / IC-132, 2026-09-18 — the two ratification fences, the first of
       this family whose region lives in the CONTROL PLANE (`src/index.mjs fetch`)
       rather than at the top of a store method. D-PIN-B failed until they were
       written here, which is the pair of arms doing its job. */
    /* C-32.12: moved to PINNED_MOVED below (T8) */
    /* C-32.13: moved to PINNED_MOVED below (T8) */
    /* REC-125 / IC-137, 2026-09-18 — D-421 DECIDED: the operator's BEARER tokens
       may not deliver either ratification. Same family, same control-plane home,
       and D-PIN-B failed naming exactly these two until they were written here. */
    /* C-32.14: moved to PINNED_MOVED below (T8) */
    /* C-32.15: moved to PINNED_MOVED below (T8) */
    /* REC-126 / IC-145, 2026-09-18 — the review copy's authoring acts (draft,
       grant, revoke) share one fence at the store's `#reviewAuthor`. D-PIN-B
       failed naming exactly this row until it was written here. */
    /* C-32.16: moved to PINNED_MOVED below (T8) */
    /* D-136, 2026-09-19 — D-421's ruling applied to SECTION 4 GOVERNANCE: an
       operator's bearer token delivers no §4.7 vote and no §4.9 capability edit.
       Same family, same control-plane home as C-32.14/C-32.15, and ONE row for
       the three ops because they enter through one region and are refused by one
       predicate. D-PIN-B failed naming exactly this row until it was written
       here, and D0 read 54 against a pinned 53 — the pair of arms doing its job
       on the first battery of the item that added it. */
    ["C-32.17", "OPERATOR_TOKEN_CANNOT_GOVERN"],
    /* D-149, 2026-09-23 — a machine credential may not state the laws that govern an action's request
       (BIO_Case_Making_v0_1.md §2). D-PIN-B failed naming exactly this row until it was written here. */
    /* C-32.18: moved to PINNED_MOVED below (T8) */
    /* REC-189, 2026-09-24 (minted C-32.18; renumbered C-32.19 at c19-batch10, D-149 holding C-32.18) — D-182's ruling on the write side: a machine credential may not set or change an
       action's risk tier. Inside `promote`'s action block, a region and not a method. D-PIN-B failed naming
       exactly this row until it was written here. */
    /* C-32.19: moved to PINNED_MOVED below (T8) */
    /* ACT_SHAPE_CHECKS — the single-homed tail, plus §14a's capability sentence */
    ["C-33.1", "NO_CONCLUSION"],
    ["C-33.2", "NO_FALSIFIER"],
    /* C-33.3: moved to PINNED_MOVED below (T8) */
    /* C-33.4: moved to PINNED_MOVED below (T8) */
    /* C-33.5: moved to PINNED_MOVED below (T8) */
    /* C-33.6: moved to PINNED_MOVED below (T8) */
    /* C-33.7: moved to PINNED_MOVED below (T8) */
    /* C-33.8: moved to PINNED_MOVED below (T8) */
    /* C-33.9: moved to PINNED_MOVED below (T8) */
    ["C-33.10", "NO_ACKNOWLEDGMENT"],
    ["C-33.11", "NO_MITIGATION"],
    ["C-33.12", "ENTRY_REQUIREMENTS"],
    ["C-33.13", "NOT_INQUIRIES"],
    ["C-33.14", "NO_STATEMENT"],
    /* C-33.15, C-33.16, C-33.17, C-33.18, C-33.19: moved to PINNED_MOVED below (T7) */
    /* C-33.20: moved to PINNED_MOVED below (T5-12) */
    ["C-33.21", "CAS_STALE"],
    /* REC-176 (State Rules §2.4, 2026-09-23): op=promote refuses a snap key the bundle already holds, where the write
       REPLACED the recorded promotion. C-67 minted by mintid. D-PIN-B failed on it when it landed — the arm doing its job. */
    ["C-67.1", "SNAP_KEY_TAKEN"],
    ["C-33.22", "SELF_BASIS"],
    ["C-33.23", "BASIS_CYCLE"],
    ["C-33.24", "FILES_DROPPED"],
    ["C-33.25", "NO_ALIAS"],
    /* C-33.26: moved to PINNED_MOVED below (T5-12) */
    ["C-33.27", "KIND_NOT_PERSONAL"],
    ["C-33.28", "LAST_OWNER"],
    /* C-33.29: moved to PINNED_MOVED below (T7) */
    /* REC-76 / D-236 — CORRECTED HERE RATHER THAN EXEMPTED. Three rows landed in
       ACT_SHAPE_CHECKS when the DEC-49 guard's arm C stopped grading a refusal by
       the single literal `ok: false`: the two CODELESS refusals the widened
       classifier found at `aiRunOpen` (a governed site that had read `0 judged, 0
       code(s) checked` for as long as its row had existed), and `SET_MOVED`,
       whose region `where` could not be written at all while a computed verdict
       `ok: !stopped` was invisible. **THE PIN GOING RED IS THIS ARM WORKING** —
       a copy that could absorb three new rows in silence would be the drift the
       block above says it exists to stop. */
    /* C-33.30, C-33.31: moved to PINNED_MOVED below (T7) */
    /* C-33.32: moved to PINNED_MOVED below (T5-12) */
    /* REC-117, 2026-09-17. `op=conclude` refuses a caller who states a falsifier
       AND asks to record that none was stated — two contradictory claims about
       one finding, which the plane will not choose between. Pinned here in BOTH
       directions, which is the point of this pair of arms: D-PIN-A caught
       nothing when this row was added and D-PIN-B FAILED, because a copy that
       silently shrinks against a growing catalogue is exactly the drift the
       one-directional check cannot see. */
    ["C-33.33", "FALSIFIER_AND_NONE_STATED"],
    /* REC-124 / INVESTIGATIVE-SESSION.md §7.1, 2026-09-18: a conclusion ADOPTS
       the claim of the reading a project stands on. NO_CLAIM is every door to
       "nothing to adopt"; CONCLUSION_IS_THE_CLAIM refuses a free conclusion
       text beside a project; UNSPLICEABLE_CONCLUSIONS is the project row's
       writer failing in place. D-PIN-B failed on all three when they landed,
       which is this pair of arms doing its job. */
    ["C-33.34", "NO_CLAIM"],
    ["C-33.35", "CONCLUSION_IS_THE_CLAIM"],
    ["C-33.36", "UNSPLICEABLE_CONCLUSIONS"],
    /* REC-136 / §7.1 item 7, 2026-09-18: a project withdraws only a conclusion
       it stands on. D-PIN-B failed on it when it landed — the arm doing its job. */
    ["C-33.37", "NOTHING_TO_WITHDRAW"],
    /* REC-175 (State Rules §8, 2026-09-23): op=promote refuses a supplied sha256 that is not the digest of the
       file's own bytes. D-PIN-B failed on it when it landed — the arm doing its job. */
    ["C-33.38", "FILE_DIGEST_MISMATCH"],
    /* D-168 / BOB #30, 2026-09-23: a retired item is not citable (`cite > is-cite-retired`).
       D-PIN-B failed naming exactly this row when it landed — the arm doing its job. C-33.38 was
       REC-175's (FILE_DIGEST_MISMATCH), on its own branch when this was written; both are pinned since CONDUCT #16's merge. */
    /* C-33.39: moved to PINNED_MOVED below (T7) */
    /* D-484, 2026-09-24: the first two rows ACT_SHAPE_CHECKS's own header said it could not hold —
       `NO_BASIS` (four sites) and `NO_CITATION` (three) each consolidated behind one governed
       helper, so each `where` names one real span. D-PIN-B failed naming exactly these two when
       they landed, which is this pair of arms doing its job. */
    ["C-33.40", "NO_BASIS"],
    ["C-33.41", "NO_CITATION"],
    /* REC-211 / IC-273, 2026-09-24: `op=proposedispose`'s instance-keyed shape binds the definition
       version the MEMBER SAW (framework §8.2, BOB #32). Two rows because they are two facts about the
       request and DEC-49 gives one code one sentence — the act names no version the record can read,
       and the act names one that is not the version standing. D-PIN-B failed naming exactly these two
       when they landed, which is this pair of arms doing its job. */
    /* C-33.42: moved to PINNED_MOVED below (T5-12) */
    /* C-33.43: moved to PINNED_MOVED below (T5-12) */
    /* REC-205, 2026-09-24: `op=proposedispose` refuses a CONDITION or an OBLIGATION BY ITS CLASS, naming
       the act that does reach it (`op=queuemute`, `op=taskresolve`), where it used to answer
       NO_SUCH_PROGRESSION and tell a member to define a progression — true of the key it read and useless
       about what they selected. It is member-facing the day the queue lets a selection carry one, so it was
       translated at the mint rather than added to the untranslated census. D-PIN-B failed naming exactly
       this row when it landed, which is this pair of arms doing its job. */
    ["C-33.44", "CLASS_NOT_DISPOSED"],
    /* REC-207 / BOB #32's ruling of 2026-09-23 23:42Z, 2026-09-24: `op=airunopen` takes the authored
       link saying which run this one RE-RUNS, and `aiRunClose` settles a bias debt on the strength of
       it — so the link is judged at the door in one region (`aiRunOpen > is-airun-rerun-link`). Three
       rows because they are three different facts about the request with three different remedies: the
       run named itself, it named nothing this caller holds, or it named work in another context whose
       lens is a different lens. D-PIN-B failed naming exactly these three when they landed, which is
       this pair of arms doing its job. */
    /* C-33.45, C-33.46, C-33.47: moved to PINNED_MOVED below (T7) */
    /* REC-186, 2026-09-25 (BOB #31's ruling): op=projectleave refuses a project's ONLY owner. C-33.48, not
       .44, because REC-205/REC-207's unmerged branches hold .44-.46. D-PIN-B failed naming exactly this
       row when it landed — the arm doing its job. */
    /* RE-PINNED 2026-09-27 (T4, legacy-tests; LEGACY-CHECKS #1, N44): C-33.48 is the same check (the leave floor,
       `is-leave-owner-floor`) under the code its site now mints, LAST_COMMITTED_OWNER (membership R35, R40);
       LAST_OWNER_CANNOT_LEAVE is minted nowhere since REC-224. */
    ["C-33.48", "LAST_COMMITTED_OWNER"],
    /* N36 (LEGACY-CHECKS #1, T4): promotion's ABSENT, R1's third answer, beside CAS_STALE in ACT_SHAPE_CHECKS; its
       region is `#promote > is-promote-absent` (PROMOTION #2, T4-2c). */
    ["C-33.49", "ABSENT"],
  ];
  /* RE-PINNED 2026-09-27 (T5-12, legacy-tests; retrieval R31 and progressions R28, K6): five act-shape rows LEFT the
     catalogue with their ids, codes and translations unchanged — C-33.20 NO_SUCH_SELECTION and C-33.32 SET_MOVED to
     retrieval's `SELECTION_CHECKS` (src/retrieval/checks.mjs), C-33.26 UNKNOWN_AFTER, C-33.42 NO_DEFINITION_VERSION
     and C-33.43 DEFINITION_MOVED to progressions' `PROGRESSION_CHECKS` (src/progressions/checks.mjs). They are
     pinned HERE, where they now live, as literals for `coverage.mjs`, and each is resolved below against the span its
     own `where` claims exactly as the catalogue's rows are. D-PIN-B still fails if any of them comes back into the
     catalogue's two families unannounced. */
  /* RE-PINNED 2026-09-28 (T7 layer 6, legacy-tests): THIRTEEN more rows left the catalogue's two families with their
     ids, codes and translations unchanged — C-32.9 MACHINE_CANNOT_DECLARE to strength's `STRENGTH_BAR_CHECKS`
     (STRENGTH #1 J5, R24); C-33.15 BAD_NOTE, C-33.16 NO_ROLE, C-33.17 BAD_ROLE, C-33.18 ROLE_NOT_APPLICABLE, C-33.19
     SEVERED_EDGE and C-33.39 RETIRED_NOT_CITABLE to citation's `CITE_CHECKS` (CITATION #1 J1.5); C-33.29
     AI_RUN_CAPABILITY_UNAVAILABLE, C-33.30 AI_RUN_NO_CONTEXT, C-33.31 AI_RUN_ALREADY_OPEN, C-33.45 AI_RUN_RERUN_SELF,
     C-33.46 AI_RUN_RERUN_UNKNOWN and C-33.47 AI_RUN_RERUN_OTHER_CONTEXT to ai-runs' `AI_RUN_ACT_SHAPE_CHECKS`
     (AI-RUNS #2 J6.1, R35). Pinned and resolved here, where they now live, exactly as T5-12's five are. */
  const MODULE_TABLES = {
    "retrieval SELECTION_CHECKS": (await import("../src/retrieval/checks.mjs")).SELECTION_CHECKS,
    "progressions PROGRESSION_CHECKS": (await import("../src/progressions/checks.mjs")).PROGRESSION_CHECKS,
    "strength STRENGTH_BAR_CHECKS": (await import("../src/strength/checks.mjs")).STRENGTH_BAR_CHECKS,
    "citation CITE_CHECKS": (await import("../src/citation/checks.mjs")).CITE_CHECKS,
    "ai-runs AI_RUN_ACT_SHAPE_CHECKS": (await import("../src/ai-runs/checks.mjs")).AI_RUN_ACT_SHAPE_CHECKS,
    /* T8 (legacy-tests, 2026-09-28): see the RE-PINNED note below. */
    "actions ACTION_FENCE_CHECKS": (await import("../src/actions/checks.mjs")).ACTION_FENCE_CHECKS,
    "actions ACTION_ACT_CHECKS": (await import("../src/actions/checks.mjs")).ACTION_ACT_CHECKS,
    "ratification RATIFY_MACHINE_FENCE_CHECKS": (await import("../src/ratification/checks.mjs")).RATIFY_MACHINE_FENCE_CHECKS,
    "review REVIEW_COPY_CHECKS": (await import("../src/review/checks.mjs")).REVIEW_COPY_CHECKS,
  };
  /* RE-PINNED 2026-09-28 (T8, legacy-tests): SIXTEEN more rows left the catalogue's two families with their ids, codes
     and translations unchanged, each `where` re-pointed at the region its module mints in — C-32.3
     MACHINE_CANNOT_MOVE_ACTION, C-32.4 MACHINE_CANNOT_CORRESPOND, C-32.18 MACHINE_CANNOT_SET_LAWS and C-32.19
     MACHINE_CANNOT_SET_RISK_TIER to actions' `ACTION_FENCE_CHECKS`, and C-33.3–C-33.9 (the action moves' and
     correspondence's act-shape rows) to its `ACTION_ACT_CHECKS` (ACTIONS #1); C-32.12–C-32.15, the four ratification
     fences, to ratification's `RATIFY_MACHINE_FENCE_CHECKS` (RATIFICATION #2); C-32.16 MACHINE_CANNOT_REVIEW to
     review's `REVIEW_COPY_CHECKS` (REVIEW #1, split from the family by number). Pinned and resolved here, where they
     now live, exactly as T5-12's five and T7's thirteen are. */
  const PINNED_MOVED = [
    ["C-33.20", "NO_SUCH_SELECTION", "retrieval SELECTION_CHECKS"],
    ["C-33.32", "SET_MOVED", "retrieval SELECTION_CHECKS"],
    ["C-33.26", "UNKNOWN_AFTER", "progressions PROGRESSION_CHECKS"],
    ["C-33.42", "NO_DEFINITION_VERSION", "progressions PROGRESSION_CHECKS"],
    ["C-33.43", "DEFINITION_MOVED", "progressions PROGRESSION_CHECKS"],
    ["C-32.9", "MACHINE_CANNOT_DECLARE", "strength STRENGTH_BAR_CHECKS"],
    ["C-33.15", "BAD_NOTE", "citation CITE_CHECKS"],
    ["C-33.16", "NO_ROLE", "citation CITE_CHECKS"],
    ["C-33.17", "BAD_ROLE", "citation CITE_CHECKS"],
    ["C-33.18", "ROLE_NOT_APPLICABLE", "citation CITE_CHECKS"],
    ["C-33.19", "SEVERED_EDGE", "citation CITE_CHECKS"],
    ["C-33.39", "RETIRED_NOT_CITABLE", "citation CITE_CHECKS"],
    ["C-33.29", "AI_RUN_CAPABILITY_UNAVAILABLE", "ai-runs AI_RUN_ACT_SHAPE_CHECKS"],
    ["C-33.30", "AI_RUN_NO_CONTEXT", "ai-runs AI_RUN_ACT_SHAPE_CHECKS"],
    ["C-33.31", "AI_RUN_ALREADY_OPEN", "ai-runs AI_RUN_ACT_SHAPE_CHECKS"],
    ["C-33.45", "AI_RUN_RERUN_SELF", "ai-runs AI_RUN_ACT_SHAPE_CHECKS"],
    ["C-33.46", "AI_RUN_RERUN_UNKNOWN", "ai-runs AI_RUN_ACT_SHAPE_CHECKS"],
    ["C-33.47", "AI_RUN_RERUN_OTHER_CONTEXT", "ai-runs AI_RUN_ACT_SHAPE_CHECKS"],
    ["C-32.3", "MACHINE_CANNOT_MOVE_ACTION", "actions ACTION_FENCE_CHECKS"],
    ["C-32.4", "MACHINE_CANNOT_CORRESPOND", "actions ACTION_FENCE_CHECKS"],
    ["C-32.18", "MACHINE_CANNOT_SET_LAWS", "actions ACTION_FENCE_CHECKS"],
    ["C-32.19", "MACHINE_CANNOT_SET_RISK_TIER", "actions ACTION_FENCE_CHECKS"],
    ["C-33.3", "NO_RESOLUTION", "actions ACTION_ACT_CHECKS"],
    ["C-33.4", "RESOLUTION_WITHOUT_RESOLVING", "actions ACTION_ACT_CHECKS"],
    ["C-33.5", "BAD_DIRECTION", "actions ACTION_ACT_CHECKS"],
    ["C-33.6", "BAD_DATE", "actions ACTION_ACT_CHECKS"],
    ["C-33.7", "CAPTURE_AND_TESTIMONY", "actions ACTION_ACT_CHECKS"],
    ["C-33.8", "NEITHER_CAPTURE_NOR_TESTIMONY", "actions ACTION_ACT_CHECKS"],
    ["C-33.9", "UNREGISTERED_ARTIFACT", "actions ACTION_ACT_CHECKS"],
    ["C-32.12", "MACHINE_CANNOT_RATIFY", "ratification RATIFY_MACHINE_FENCE_CHECKS"],
    ["C-32.13", "MACHINE_CANNOT_RATIFY_CASE", "ratification RATIFY_MACHINE_FENCE_CHECKS"],
    ["C-32.14", "OPERATOR_TOKEN_CANNOT_RATIFY", "ratification RATIFY_MACHINE_FENCE_CHECKS"],
    ["C-32.15", "OPERATOR_TOKEN_CANNOT_RATIFY_CASE", "ratification RATIFY_MACHINE_FENCE_CHECKS"],
    ["C-32.16", "MACHINE_CANNOT_REVIEW", "review REVIEW_COPY_CHECKS"],
  ];
  t("ARM D-PIN-M: each of the thirty-four moved rows (T5-12's five, T7's thirteen, T8's sixteen) is in its module's table under the SAME C-number and code, with a "
    + "translation — the catalogue's number did not change owner silently",
    PINNED_MOVED.filter(([n, c, tbl]) => !(MODULE_TABLES[tbl]?.[c]?.check === n
      && typeof MODULE_TABLES[tbl][c].translation === "string" && MODULE_TABLES[tbl][c].translation.trim()))
      .map(([n, c]) => `${n}=${c}`), []);
  const live = FAMILIES.flatMap((f) => Object.entries(CATALOGUE[f]).map(([c, r]) => `${r.check}=${c}`)).sort();
  const pinned = PINNED.map(([n, c]) => `${n}=${c}`).sort();

  t("ARM D-PIN-A: every C-number written literally above is one the catalogue really allocates to "
    + "that code — the copy cannot be right about a row the catalogue does not have",
    pinned.filter((p) => !live.includes(p)), []);
  t("ARM D-PIN-B: and the catalogue holds NOTHING these two families allocate that the list above "
    + "misses — the other direction, without which a shrinking copy would pass",
    live.filter((l) => !pinned.includes(l)), []);
  const srcCache = new Map();
  /* RE-ANCHORED 2026-09-26 (T3, legacy-tests): layer 2 of T3 extracted `record-core`, `membership` and `promotion`
     from store.mjs, and the catalogue's `where` still names `src/store.mjs` for the fences that went with them. A
     `where` naming `src/store.mjs` is resolved against the STORE'S CORPUS as it stood before the extraction —
     store.mjs first, then the extracted modules' files — so a region that moved WITH ITS MARKERS is found where it
     now lives. A span that resolves in store.mjs resolves exactly as before. What this does NOT do is invent a
     region: a fence whose markers did not move, or a row naming a code the plane no longer mints, stays red. */
  const read = (rel) => {
    /* RE-ANCHORED 2026-09-28 (T7 layer 6): and the modules extracted from it at T7 whose regions still sit under a
       `where` naming `src/store.mjs` (the catalogue's rows to re-point, reported to legacy-checks): `conclude`,
       `#withdrawConclusion`, `#setProjectConclusion` to basis-versions; `divide`, `groundInquiry`, `dispose`,
       `#promoteChecks > is-basis-acyclic` to inquiry. Each region moved WITH its markers. */
    /* RE-ANCHORED 2026-09-28 (T8, legacy-tests): + case-authoring, whose `#publishCase` took the regions of the two
       catalogue rows that still name `src/store.mjs publishCase` (C-32.6 MACHINE_CANNOT_PUBLISH, C-33.14 NO_STATEMENT)
       — moved WITH their markers; the stale `where`s are the catalogue's to re-point (the DEC-49 guard names both). */
    if (!srcCache.has(rel)) srcCache.set(rel, rel === "src/store.mjs"
      ? storeCorpus(["record-core", "membership", "promotion", "inquiry", "basis-versions", "case-authoring"])
      : fs.readFileSync(path.join(HERE, "..", rel), "utf8"));
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
    /* CORRECTED 2026-09-23 BY D-85: both patterns now admit an `async ` prefix. D-85 made `aiRunOpen` async (it
       computes the lens in force at the open, which is hashed through `crypto.subtle`), and this reader, which
       spelled a declaration as `  name(` only, stopped finding the function at all — C-33.29..31 failed as
       "not minted inside the span" while the codes sat where they always had. The old pattern was right only
       while no governed whole-function span was async; being async does not move a refusal. */
    const decl = new RegExp(`\\n  (?:async\\s+)?${m[2].replace(/[$#]/g, "\\$&")}\\s*\\(`).exec(src);
    if (!decl) return null;
    const rest = src.slice(decl.index + 1);
    const next = /\n  (?:async\s+)?[#\w$]+\s*\([^\n]*\)\s*\{/.exec(rest.slice(10));
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
  /* RE-PINNED 2026-09-27 (T5-12): the five moved rows, each resolved where it now lives (see PINNED_MOVED). */
  let movedSeen = 0;
  for (const [n, code, tbl] of PINNED_MOVED) {
    const row = MODULE_TABLES[tbl]?.[code];
    if (!row) continue;
    movedSeen++;
    const span = spanFor(row.where);
    t(`ARM D/${n}: ${code} is minted inside the span its \`where\` claims, in ${tbl} `
      + `(${String(row.where).split(",")[0]})`,
      [span !== null, span !== null && span.includes(`"${code}"`)], [true, true]);
  }
  t("ARM D0-M: all thirty-four moved rows were resolved (a table that stopped loading would run none of them)", movedSeen, 34);
  console.log(`  corpus: ${rowsSeen} rows across ${FAMILIES.length} families, each resolved against `
            + `the plane's source and each naming its own C-number`);
  /* THE CORPUS FLOOR. Without it a families list that stopped resolving would
     run zero arms and report green — the "passes while asserting nothing" shape
     this whole block is written against. */
  /* MOVED 43 -> 44 on 2026-09-17 (REC-117), FROM THE FIGURE THIS INSTRUMENT
     PRINTED on the line above and never by adding one to the number in the
     file. The row added is FALSIFIER_AND_NONE_STATED (C-33.33), which
     `op=conclude` mints when a caller states a falsifier AND asks to record
     that none was stated. A floor that RISES needs no excuse; this note exists
     because the next reader should be able to attribute the rise to an act
     rather than to drift. */
  /* MOVED 44 -> 46 on 2026-09-18 (REC-123), FROM THE FIGURE THIS INSTRUMENT PRINTED
     on its corpus line and not by adding to the number in the file: C-32.12
     MACHINE_CANNOT_RATIFY and C-32.13 MACHINE_CANNOT_RATIFY_CASE. */
  /* MOVED 46 -> 48 on 2026-09-18 (REC-125), FROM THE FIGURE THIS INSTRUMENT PRINTED
     ("corpus: 48 rows across 2 families") and not by adding to the number in the
     file: C-32.14 OPERATOR_TOKEN_CANNOT_RATIFY and C-32.15
     OPERATOR_TOKEN_CANNOT_RATIFY_CASE. */
  /* MOVED 48 -> 49 on 2026-09-18 (REC-126), FROM THE FIGURE THIS INSTRUMENT PRINTED
     ("corpus: 49 rows across 2 families") and not by adding to the number in the
     file: C-32.16 MACHINE_CANNOT_REVIEW. */
  /* MOVED 49 -> 52 on 2026-09-18 (REC-124), FROM THE FIGURE THIS INSTRUMENT PRINTED
     ("corpus: 52 rows across 2 families") and not by adding to the number in the
     file: C-33.34 NO_CLAIM, C-33.35 CONCLUSION_IS_THE_CLAIM and C-33.36
     UNSPLICEABLE_CONCLUSIONS. */
  /* MOVED 52 -> 53 on 2026-09-18 (REC-136), FROM THE FIGURE THIS INSTRUMENT PRINTED
     ("got 53" on the item's tree) and not by adding to the number in the file:
     C-33.37 NOTHING_TO_WITHDRAW. */
  /* MOVED 53 -> 54 on 2026-09-19 (D-136), FROM THE FIGURE THIS INSTRUMENT PRINTED
     ("corpus: 54 rows across 2 families" on the item's tree) and not by adding to
     the number in the file: C-32.17 OPERATOR_TOKEN_CANNOT_GOVERN. */
  /* MOVED 54 -> 55 on 2026-09-23 (D-168), FROM THE FIGURE THIS INSTRUMENT PRINTED ("got 55" on the
     item's tree) and not by adding to the number in the file: C-33.39 RETIRED_NOT_CITABLE. */
  /* MOVED 54 -> 55 on 2026-09-23 (REC-175), FROM THE FIGURE THIS INSTRUMENT PRINTED ("corpus: 55 rows across 2 families" on the item's tree
     over origin/main 14faa089) and not by adding to the number in the file: C-33.38 FILE_DIGEST_MISMATCH. */
  t("ARM D0: the row corpus is the size REC-64 landed, plus REC-117's one row, REC-123's two, REC-125's two, "
    + "REC-126's one, REC-124's three, REC-136's one, D-136's one, REC-175's one, REC-176's one, D-168's one, D-149's one and REC-189's one — a walk that lost a "
    + "family would run fewer arms and every one of them would still pass",
    /* MOVED 54 -> 55 on 2026-09-23 (REC-176), FROM THE FIGURE THIS INSTRUMENT PRINTED on the item's tree over
       origin/main 0e7cc03e and not by adding to the number in the file: C-67.1 SNAP_KEY_TAKEN. */
    /* MOVED 55 -> 56 by CONDUCT #16 at REC-176's merge onto REC-175 (each moved 54 -> 55 from the same base): the figure this
       instrument PRINTED on the merged tree — C-33.38 FILE_DIGEST_MISMATCH and C-67.1 SNAP_KEY_TAKEN together. */
    /* MOVED 56 -> 57 by CONDUCT #16 at D-168's merge (D-168 moved 54 -> 55 on its own base: C-33.39 RETIRED_NOT_CITABLE); the figure below is the one PRINTED on the merged tree. */
    /* MOVED 57 -> 58 on 2026-09-23 (D-149), FROM THE FIGURE THIS INSTRUMENT PRINTED ("corpus: 58 rows across 2 families")
       on the item's tree over origin/main 02603e88: C-32.18 MACHINE_CANNOT_SET_LAWS. */
    /* MOVED 58 -> 59 at c19-batch10 (REC-189 merged over D-149; each moved 57 -> 58 from its own base): C-32.19
       MACHINE_CANNOT_SET_RISK_TIER (minted C-32.18). The figure is re-read from this instrument's print on the merged tree. */
    /* MOVED 58 -> 60 on 2026-09-24 (D-484), FROM THE FIGURE THIS INSTRUMENT PRINTED on the item's tree over
       origin/main 16fe1e7f and not by adding to the number in the file: C-33.40 NO_BASIS and C-33.41 NO_CITATION. */
    /* RE-READ AT THIS UNION (c20-batch14, 2026-09-24): both moves above are in this tree and neither figure is
       the union's. The number below is what this instrument PRINTED here, never 59 + 2 and never 60 + 1. */
    /* MOVED 63 -> 64 on 2026-09-24 (REC-205), FROM THE FIGURE THIS INSTRUMENT PRINTED ("got 64") on the
       item's tree over origin/main 1a7f0bcc0: ONE arrival, C-33.44 CLASS_NOT_DISPOSED in ACT_SHAPE_CHECKS,
       and no departure. */
    /* MOVED 61 -> 63 on 2026-09-24 (REC-211), FROM THE FIGURE THIS INSTRUMENT PRINTED ("got 63") on the
       item's tree over origin/main 58293bf31, and never 61 + 2: C-33.42 NO_DEFINITION_VERSION and
       C-33.43 DEFINITION_MOVED. */
    /* MOVED 63 -> 66 on 2026-09-24 (REC-207), FROM THE FIGURE THIS INSTRUMENT PRINTED ("corpus: 66 rows
       across 2 families", "got 66") on the item's tree over origin/main 1a7f0bcc0, and never 63 + 3:
       C-33.45 AI_RUN_RERUN_SELF, C-33.46 AI_RUN_RERUN_UNKNOWN and C-33.47 AI_RUN_RERUN_OTHER_CONTEXT,
       the re-run link's three refusals at `aiRunOpen > is-airun-rerun-link`. */
    /* CONDUCT #21 at c21-batch28: 67 at the union — REC-205's C-33.44 (64 on its branch) and REC-207's three,
       renumbered C-33.45..C-33.47 off that collision; RE-READ from this suite's print on the merged tree. */
    /* REC-186 side, kept as history: MOVED 63 -> 64 on 2026-09-25 (REC-186), FROM THE FIGURE THIS INSTRUMENT PRINTED
       ("corpus: 64 rows across 2 families") on the item's tree over origin/main 8bdf20e6, never 63 + 1: C-33.48
       LAST_OWNER_CANNOT_LEAVE — `rowsSeen, 64` on its branch. Ours' figure is kept at c22-batch29; NUMBER TO RE-READ
       from this suite's print on the union (REC-186's row arrives over ours' 67). */
    /* CONDUCT #22 at the c22-batch29 union: 67 -> 68, RE-READ from this suite's print on the merged tree ("corpus: 68
       rows across 2 families", "got 68"), never 67 + 1: REC-186's C-33.48 LAST_OWNER_CANNOT_LEAVE, renumbered off
       REC-207's C-33.47 at c22-rec186-renumber, the batch's one arrival in these two families. */
    /* MOVED 68 -> 69 on 2026-09-27 (T4, legacy-tests), FROM THE FIGURE THIS INSTRUMENT PRINTED ("corpus: 69 rows across
       2 families", "got 69") on `tranche/T4` @ c03f169901: C-33.49 ABSENT (LEGACY-CHECKS #1, N36), the one arrival in
       these two families; C-33.48 renamed in place. */
    /* MOVED 69 -> 64 on 2026-09-27 (T5-12, legacy-tests), FROM THE FIGURE THIS INSTRUMENT PRINTED ("corpus: 64
       rows across 2 families", "got 64") on the T5 tranche tip, never 69 - 5: FIVE departures and no arrival, each
       named — C-33.20 NO_SUCH_SELECTION and C-33.32 SET_MOVED (to retrieval, R31), C-33.26 UNKNOWN_AFTER, C-33.42
       NO_DEFINITION_VERSION and C-33.43 DEFINITION_MOVED (to progressions, R28). The five are resolved above where
       they now live (ARM D0-M counts them), so the arms this suite runs did not shrink. */
    /* MOVED 64 -> 51 on 2026-09-28 (T7, legacy-tests), FROM THE FIGURE THIS INSTRUMENT PRINTED ("corpus: 51 rows
       across 2 families") on `job/T7/legacy-tests` over the merged tranche, never 64 - 13: THIRTEEN departures and no
       arrival, each named at MODULE_TABLES above (strength one, citation six, ai-runs six). The thirteen are resolved
       where they now live (ARM D0-M counts them), so the arms this suite runs did not shrink. */
    /* MOVED 51 -> 35 on 2026-09-28 (T8, legacy-tests), FROM THE FIGURE THIS INSTRUMENT PRINTED ("corpus: 35 rows
       across 2 families") on `job/T8/legacy-tests` over the merged tranche, never 51 - 16: SIXTEEN departures and no
       arrival, each named at MODULE_TABLES above (actions eleven, ratification four, review one). The sixteen are
       resolved where they now live (ARM D0-M counts them), so the arms this suite runs did not shrink. */
    rowsSeen, 35);
}

/* THE TAIL LINE IS THE BATTERY'S CONTRACT, not decoration: `scripts/battery.mjs`
   reads `N pass, M fail` off it, and a suite whose count cannot be read is
   reported as UNKNOWN rather than as zero (D-93's `sshsig` 16-vs-18 case). */
console.log(`\nmachinefences-dec49: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
