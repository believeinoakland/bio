#!/usr/bin/env node
/* check-refusal-codes.mjs — THE DEC-49 GUARD (VF-2).
 *
 * DEC-49 (Bob, 2026-08-06): *"I have no problem with those messages being
 * translated, whether at development time or at runtime. These conditions
 * should include an error code that there's a canned translation for."* That
 * ruling AMENDS DEC-8 — a surface may now render an AUTHORED translation keyed
 * on a code the plane SENT, and may still never COMPUTE a refusal.
 *
 * THE RULING IS ONLY SAFE BECAUSE OF THE GUARD, and the ruling says so:
 * **every code a surface can receive has a translation, and an untranslated
 * code FAILS THE HARNESS rather than reaching a member.** Without it, (b)
 * degrades into thirteen surfaces each inventing wording — the drift REC-43
 * closed on the co-attestation fence. This file is that guard. It is an
 * INSTRUMENT, so it lands BEFORE the ops that must pass it (VF-2 is W0);
 * REC-64 is the sweep that gives every remaining condition a code, and it is
 * this guard that will tell REC-64 when it is finished.
 *
 * ---------------------------------------------------------------- THE REACH
 *
 * "Every code A SURFACE CAN RECEIVE" is the ruling's own scope, and it is
 * SMALLER than "every refusal code in the plane". So the reach is a
 * MEASUREMENT, printed every run, ratcheted with a FLOOR as well as a ceiling,
 * and DRIVEN from files rather than typed here — a hand-written set agrees with
 * its author at zero cost, which this project has measured five times.
 *
 * A code is IN REACH when any of these is true:
 *
 *   (R1) it is a row in a DEC-49 family (`*_CHECKS` in `bio-checks.mjs`).
 *        Definitionally receivable: the refusal is built FROM the row and
 *        carries `code` on the wire.
 *   (R2) the SURFACE names it — a code literal in `civicos-ui/app.html` that
 *        the plane also mints. If app.html can key on it, a member can meet it.
 *   (R3) a HARNESS MOCK sends it — a code literal in `civicos-ui/test/*.test.mjs`
 *        that the plane also mints. A code the harness hands the surface is a
 *        code the surface receives.
 *
 * Every code in reach must resolve to a canned translation, from ONE of:
 *   (T1) a DEC-49 family row's `translation` (the plane's, one place); or
 *   (T2) a surface translation table this guard proves TOTAL against its
 *        plane-side producer (arm D) — `PART_REASON` is the one that exists.
 *
 * A code in reach with neither is the DEC-49 failure and this guard exits 1
 * naming it. THAT IS THE WHOLE POINT: the harness fails instead of the member
 * meeting machine vocabulary.
 *
 * THE FLOOR IS THE MORE IMPORTANT HALF, and REC-70 is why it is stated twice.
 * Neutering a walk there left it green at 0 of 40 — so a ceiling could only ever
 * have failed from a reader that GAINED sight, never one that LOST it. Every
 * count below therefore carries a FLOOR, and the corpus size is PRINTED on
 * every run so a walk that has gone blind is visible rather than merely green.
 *
 * THE CENSUS IS REPORTED AND NOT GATED, and the distinction is deliberate.
 * The plane mints far more refusal codes than any surface can receive; the
 * whole-plane figure is REC-64's remaining sweep, not this guard's gate.
 * Gating it would fail on internal refusals no member can ever meet, and a gate
 * set above the current state gets switched off (VERIFICATION.md's own reason
 * for not making `--strict` the gate before its three items land). So the
 * census is printed with its exact gap and the gate stands on the reach.
 *
 * ------------------------------------------------------- ONE-VOCABULARY TRAP
 *
 * This guard is a VOCABULARY MATCHER, which is exactly what went wrong in
 * REC-70 the day before it was written: a walk graded 55 of 156 dispatched ops
 * and READ AS A COMPLETE SWEEP, because its classifier admitted ONE spelling of
 * success — four lines after that same file's other matchers were written as
 * SETS precisely because the plane spells things several ways.
 *
 * So the code walk is a SET of matchers and **each matcher's own yield is
 * printed every run**, not just the union. It is not a hypothetical: the first
 * draft of this walk used `reason: "CODE"` alone and was blind to
 *
 *     r = { ok: false, status: 0, reason: platform ? "PLATFORM_LIMIT" : "FETCH_FAILED", … }
 *
 * in `subresources.mjs` — two codes `PART_REASON` translates, invisible to the
 * narrow matcher. Both are in the union now, and M2 is the matcher that sees
 * them. If a matcher's yield ever collapses, the printed per-matcher line is
 * where that shows.
 *
 * ------------------------------------------------------------- WHAT IT IS NOT
 *
 *   - It does not decide WORDING. DEC-49 licensed translation; whether a given
 *     sentence is good prose is not mechanically checkable and this guard makes
 *     no attempt. It checks that a translation EXISTS, is not a restatement of
 *     the machine code, and is not a copy of another code's translation.
 *   - It does not gate the whole plane's 294-code census (above).
 *   - Arm C is textual over a function body. A refusal built by a helper this
 *     guard cannot see would not be judged; arm A's row completeness and arm B's
 *     reach are what cover the ground arm C cannot.
 *   - It says nothing about a LIVE plane. A green harness is not a serving
 *     build (D-108).
 *
 * Run from civicos-ui/ (test/run.mjs runs it):
 *
 *     node check-refusal-codes.mjs
 *
 * NEGATIVE CONTROL: recorded in test/refusal-codes.test.mjs's own
 * `NEGATIVE CONTROL:` header, with every arm RUN and what it broke.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PLANE = path.join(HERE, "..", "bio-plane");
const PLANE_SRC = path.join(PLANE, "src");
const CATALOG = path.join(PLANE, "checks", "bio-checks.mjs");
const APP = path.join(HERE, "app.html");
const TESTDIR = path.join(HERE, "test");

const fails = [];
const notes = [];
const FAIL = m => fails.push(m);
const NOTE = m => notes.push(m);

/* ============================================================
   THE RATCHET — measured 2026-08-07 in worktree agent-a12a5d578497244e9,
   by this file. Every one is a FLOOR: the guard fails when its reach
   SHRINKS, which is the half a ceiling alone cannot see (REC-70).
   A figure that GROWS is fine and the delta is named in the output; the
   grown rows still have to pass every arm, so growth cannot arrive
   unguarded.
   ============================================================ */
/* REMEASURED 2026-08-08 (REC-71), AND THE STALENESS WAS A MEASURED DEFECT
   RATHER THAN AN UNTIDY NUMBER. PL-1 landed a fourth family and 18 rows, so the
   census grew 311 -> 330 and the reach 98 -> 116 while these floors stayed where
   VF-2 set them. **That left 19 codes of SLACK, and slack in a floor is not
   harmless: it is the floor not being a ratchet.** Arm (e) of
   `test/refusal-codes.control.mjs` — neuter the widest matcher, M2 — went from
   RED to GREEN on it: the walk lost an entire spelling, the census fell to 325,
   and 325 is still above 311, so the guard passed a reader that had gone
   partially blind. That is REC-70's own lesson arriving on the FLOOR side, and
   it is why every figure below is now the MEASURED one. Move them WITH the
   corpus, in the same turn, or they stop meaning anything. */
const FLOOR = {
  /* REMEASURED AGAIN 2026-08-08, at REC-71's re-integration onto a tree carrying
     PL-12 and UI-51. **The slack had already come back: census 330 -> 341, reach
     116 -> 127, 11 codes in each within hours.** That is the point of the block
     above rather than a contradiction of it — these figures track a growing plane
     and must be moved WITH it, in the turn that grows it, or the ratchet quietly
     stops being one. A family added without moving them is a family whose codes
     buy slack for everybody else's walk. */
  /* REMEASURED 2026-08-08 at PL-3's landing, in worktree agent-acad3e0b337d0848f,
     BY THIS FILE — every figure below is the number it PRINTED on a green run and
     not one this item added up. Moved IN THE SAME TURN that grew the plane,
     which is REC-71's rule and the reason it exists: its census floor sat 19
     codes low, had already turned a control from RED to GREEN, and went stale
     AGAIN within hours.

     AND THE FAMILY FLOOR WAS ALREADY STALE WHEN THIS ITEM ARRIVED. It read 5;
     the tree carried SIX families before PL-3 added a seventh (VERSION_CHAIN_CHECKS
     landed with PL-10 and nobody moved it). One of slack, found the only way slack
     is ever found — by measuring rather than by adding one to the number in the
     file. */
  /* REMEASURED 2026-08-08 AT PL-4's LANDING, in worktree agent-ad191a5dd58a9327f,
     BY THIS FILE — every figure below is the number it PRINTED on a green run and
     not one this item added up, which is the rule PL-3 restated and the reason
     PL-12's and PL-1's collision on `bounds`' roster could not be resolved by
     arithmetic. Moved IN THE SAME TURN that grew the plane.

     AND THE GUARD EARNED ITS KEEP TWICE ON THIS ITEM BEFORE ANY FLOOR MOVED.
     It failed the first run naming (a) a region marker that had drifted OUT of
     the function its `where` named — the conduct region lives in
     `#captureRequestConduct`, not in `captureRequestDrain` — which is precisely
     the wrong-span-clean-verdict class, caught rather than assumed; and (b) a
     `where` pointing at `src/index.mjs acquire`, a name that does not exist
     because the op lives inside the fetch handler, so nothing would have been
     checking that site at all. The arm is now its own named function. */
  /* REMEASURED 2026-08-08 AT PL-11's LANDING, in worktree agent-a6feaaff20bdaf423,
     BY THIS FILE — every figure below is the number it PRINTED on a green run of
     `node civicos-ui/test/run.mjs`, not one this item added up. Moved IN THE SAME
     TURN that grew the plane, which is now the fourth consecutive item to have to
     say so.

     AND `vocabularyTerms` WAS ALREADY STALE WHEN THIS ITEM ARRIVED — it read 40
     over a tree carrying 50, TEN of slack, and PL-11 added no vocabulary at all.
     Found the only way slack is ever found: by measuring rather than by adding to
     the number in the file. That is the same finding PL-3 recorded on `families`
     and PL-4 on the census, three items running, which is why the instruction in
     the block above is now the COMMAND rather than the answer. */
  families:      9,    // + AI_CREDENTIAL_CHECKS (was 8 at PL-4, 7 at PL-3, 6 pre-PL-3 while the floor said 5)
  rows:         90,    // + C-29.1..9, all nine DRIVEN (was 81 at PL-4, 70 at PL-3)
  census:      392,    // distinct refusal codes the plane can mint, UNION of the matcher set.
                       // A plain `reason: "CODE"` grep answers fewer; the set finds the rest.
                       // (was 383 at PL-4, 371 at PL-3, 341 at PL-12, 330, 311 pre-PL-1)
  reach:       177,    // codes a surface can receive (R1 + R2 + R3) (was 168, 157, 127, 116, 98)
  governedSites: 24,   // spans named by a row's `where` — a function, or a region inside one
                       // (was 20, 17, 13, 9, 5; 11 whole functions + 13 regions, four of them PL-11's)
  /* REMEASURED 2026-08-08 AT SK-1's LANDING, in worktree agent-a1f06561dfc61e51c,
     BY THIS FILE — every figure below is the number it PRINTED on a green run and
     not one this item added up. SK-1 adds ONE row (C-22.7,
     `AI_RUN_SKILL_VERSION_UNNAMED`) to the EXISTING `AI_RUN_CHECKS` family and
     one governed site (`src/skillpack.mjs checkSkillVersion`, a whole function —
     small, single-purpose, and every refusal in it is an AI_RUN row, which is
     the case this file's own convention blesses). No new family: a family is a
     floor here, and a code that buys slack for everybody else's walk is the
     defect REC-71 measured. */
                       // A plain `reason: "CODE"` grep answers fewer; the set finds the rest.
                       // (was 383 at PL-4, 371 at PL-3, 341 at PL-12, 330, 311 pre-PL-1)
                       // (was 20, 17, 13, 9, 5; 12 whole functions + 9 regions, three of them PL-4's)
  surfaceTables: 1,    // PART_REASON
  bodyLines:    60,    // total lines of governed span arm C actually reads. MEASURED 546, and
                       // DELIBERATELY NOT RATCHETED TO IT — the one figure here that is not.
                       // Every other floor above only ever moves UP as the plane grows, so
                       // ratcheting them costs nothing. This one FALLS whenever a `where` is
                       // correctly narrowed from a function to a region, which is exactly the
                       // work REC-71 licensed and REC-64 will keep doing. A gate set above the
                       // current state gets switched off (VERIFICATION.md's own reason for not
                       // making `--strict` the gate yet), so this stays a COLLAPSE DETECTOR —
                       // its stated purpose, a parameter list read as a body — and
                       // `codesChecked` below carries the ratchet instead.
  /* REC-71's three, measured 2026-08-08 in worktree agent-ab9e84c9e27f4eff7 by
     this file, on the tree carrying PL-1. */
  /* MOVED 2026-08-08 BY PL-4, MEASURED. 6 -> 9 regions and 483 -> 632 region
     lines: PL-4's three (is-capture-request, is-capture-conduct,
     is-capture-request-arm) all resolved, all non-trivial. `codesChecked` 30 ->
     46, and 16 of the 16 are this item's — every refusal it mints names its code
     as a STRING LITERAL through a helper called `refusal`, which is REC-71's
     delegated fix applied at allocation time rather than paid for later. */
  regions:      13,    // was 9 — PL-11's four (is-ai-credential-mint, is-ai-credential-revoke,
                       // is-ai-task-scope, is-ai-scope-declaration) all resolved, all non-trivial,
                       // and every one of them COMPARES every code it judges (3/3, 2/2, 3/3, 2/2).
                       // region `where`s resolved — basis-version-freeze, basis-version-resolve,
                       // bias-set-refusal, and PL-3's three (is-suggest-shape, is-suggest-checks,
                       // is-suggest-write). Was 3; PL-3 gave EVERY row it minted a region rather
                       // than a whole function, which is REC-71's rule applied at allocation time
                       // instead of paid for at integration.
  regionLines:  724,  // was 632, was 45 — PL-3's three regions are 425 lines of the 483    // lines inside them. MEASURED 58 (19 + 16 + 23); floored BELOW the
                       // figure on purpose, so an ordinary edit inside a governed arm does
                       // not fail the guard while a COLLAPSE still does. The per-region
                       // trivial-span arm (REGION_MIN_LINES) is the tight half and this is
                       // the aggregate one; they fail for different reasons.
  codesChecked: 56,  // was 46, was 11. PL-3 nearly TRIPLED it, and deliberately: a local
                       // one helper named `refusal`, a STRING LITERAL at each site, which is the
                       // shape that makes arm C able to COMPARE a code rather than read past it.
                       // was 11. PL-3 nearly TRIPLED it, and deliberately: a local
                       // `refuse(key, …)` passes the code as a VARIABLE and arm C compares NOTHING,
                       // which is why seven of thirteen governed sites read 776 lines and checked zero.
                       // PL-3's three regions name their helper `refusal` and pass a string LITERAL at
                       // every site, so 19 of its 19 refusals are actually COMPARED against a row.    // refusal codes actually COMPARED against a family row. MEASURED 11.
                       // NOT the same as refusals judged (12) and NOT the same as lines
                       // read: **SEVEN of the thirteen governed sites read 776 lines and
                       // compare NOTHING AT ALL** — they refuse through a local
                       // `refuse(key, …)` helper (the code is a variable) or by pushing
                       // findings rather than returning `ok:false`. PL-12 added three more
                       // of them. See arm C's NOTE and REC-71's delegation to REC-64:
                       // arm C's teeth reach 5 of 13 sites, and that is a measurement.
  vocabularies:  8,    // the plane's own code->text maps a surface renders verbatim (arm E)
  vocabularyTerms: 50, // terms across them. WAS 40 OVER A TREE CARRYING 50 when PL-11
                       // arrived, and PL-11 added no vocabulary: ten of pre-existing slack,
                       // found by measuring rather than by adding one to the number here.
                       // this item grew the corpus — it grew none of it. The floor was printing 50
                       // against a floor of 40, and TEN of slack is the floor not being a ratchet:
                       // a walk that lost a whole vocabulary would still have cleared 40. Found the
                       // only way slack is ever found, by reading what the instrument printed
                       // rather than by adding to the number in the file (PL-3's finding, and
                       // REC-71's before it, arriving on a different row of the same block).
};

/* THE OTHER HALF OF THE RATCHET. A floor catches an instrument going blind; a
   ceiling catches the SUBJECT getting worse. REC-64 is the sweep that lowers
   this to zero, one family at a time, and until then no new receivable code may
   arrive without a translation. Measured 2026-08-07 by this file. */
const CEILING = {
  reachGap:     74,    // codes in reach with no canned translation — may only FALL
};

/* A REGION'S MINIMUM SPAN. Not a style rule: it is the cheap arm against the
   failure this whole item is about, a walk taking the WRONG SPAN and reporting a
   clean verdict over bytes that could not have carried what it sought. The two
   live regions MEASURE 19 and 16 lines; a real governed arm is not three lines,
   and a pair of markers that have collapsed onto each other is. */
const REGION_MIN_LINES = 4;
const REGION_MIN_CHARS = 120;
/* Built rather than written, because the literal two-character sequence closes
   THIS comment and every other one in this file — the same trap as the backticks
   in `schema.mjs`'s template literals (CLAUDE.md), and it cost a parse error here
   before it was noticed. */
const CLOSE_COMMENT = "*" + "/";

/* ============================================================
   THE CODE WALK — a SET of matchers, each yield printed
   ============================================================ */

/* A refusal code is SCREAMING_SNAKE. Three characters minimum, so `OK` and a
   stray `R2` in prose are not codes; the plane has none that short. */
const CODE_RE = /^[A-Z][A-Z0-9_]{2,}$/;

/* Each matcher says what SPELLING of a refusal it can see. They overlap on
   purpose — the union is the corpus and the per-matcher yields are how a
   matcher that has gone blind becomes visible. */
const MATCHERS = {
  /* The plain object-literal refusal, the commonest spelling. */
  'M1 reason:"CODE"':  src => harvest(src, /\breason\s*[:=]\s*"([A-Z][A-Z0-9_]{2,})"/g),
  /* THE ONE THAT EARNED THE SET. `reason` bound to an EXPRESSION rather than a
     literal — a ternary, a `||` default, a lookup with a fallback. Every code
     literal in the expression is a code the plane can mint. Bounded to the line
     so it cannot run away into the next statement. */
  'M2 reason:<expr>':  src => {
    const out = new Set();
    for (const m of src.matchAll(/\breason\s*[:=]\s*([^\n]*)/g))
      for (const q of m[1].slice(0, 240).matchAll(/"([A-Z][A-Z0-9_]{2,})"/g)) out.add(q[1]);
    return out;
  },
  /* DEC-49's own shape: the wire field is `code`, not `reason`. */
  'M3 code:"CODE"':    src => harvest(src, /\bcode\s*[:=]\s*"([A-Z][A-Z0-9_]{2,})"/g),
  /* A COMPARISON site. The plane and the surface both branch on a code they did
     not mint on that line; the code is still one the wire carries. */
  'M4 reason==="CODE"':src => harvest(src, /\breason\s*[!=]==\s*"([A-Z][A-Z0-9_]{2,})"/g),
  /* The family helper. `refusal("CODE", detail)` in airun.mjs builds the whole
     refusal from a row, so the code never appears beside the word `reason`. */
  'M5 refusal("CODE"': src => harvest(src, /\brefusal\s*\(\s*"([A-Z][A-Z0-9_]{2,})"/g),
};

function harvest(src, re) {
  const out = new Set();
  for (const m of src.matchAll(re)) out.add(m[1]);
  return out;
}

/* Every SCREAMING_SNAKE literal in a file, used to ask what a SURFACE names —
   intersected with the plane census, never trusted on its own. */
function screamingLiterals(src) {
  const out = new Set();
  for (const m of src.matchAll(/["'`]([A-Z][A-Z0-9_]{2,})["'`]/g)) if (CODE_RE.test(m[1])) out.add(m[1]);
  for (const m of src.matchAll(/^\s*([A-Z][A-Z0-9_]{2,})\s*:/gm)) if (CODE_RE.test(m[1])) out.add(m[1]);
  return out;
}

/* THE SIXTH MATCHER IS NOT A REGEX, AND THAT IS THE POINT. `meaningRows` and
   `versionChain` build their refusals as `MEANING_READ_CHECKS[key]` — the code
   is a VARIABLE at the mint site, so no source-text matcher can see it, and the
   first five between them missed all five of those codes while reporting a
   confident 306. A DEC-49 row is by construction a code the plane can send, so
   the family tables ARE a matcher: the one that reads the declaration instead
   of the call. Measured on the first green run of this file — the census went
   306 -> 311 and the five were exactly the two families that use a lookup. */
let FAMILY_CODES = new Set();

function planeCensus() {
  const files = fs.readdirSync(PLANE_SRC).filter(f => f.endsWith(".mjs"));
  const yields = {}, union = new Set();
  for (const name of Object.keys(MATCHERS)) yields[name] = new Set();
  for (const f of files) {
    const src = fs.readFileSync(path.join(PLANE_SRC, f), "utf8");
    for (const [name, fn] of Object.entries(MATCHERS))
      for (const c of fn(src)) { yields[name].add(c); union.add(c); }
  }
  yields["M6 a DEC-49 row"] = new Set(FAMILY_CODES);
  for (const c of FAMILY_CODES) union.add(c);
  return { files: files.length, yields, union };
}

/* ============================================================
   ARM A — the DEC-49 families, harvested, and every row complete
   ============================================================ */

/* Harvested by export name matching /_CHECKS$/, never listed here — a family
   added by PL-1 or PL-12 must be guarded the moment it lands, not the release
   after somebody remembers to add it to a list. */
async function dec49Families() {
  const mod = await import("file://" + CATALOG);
  return Object.entries(mod)
    .filter(([k, v]) => /_CHECKS$/.test(k) && v && typeof v === "object" && !Array.isArray(v));
}

function armA(families) {
  if (families.length < FLOOR.families)
    FAIL(`only ${families.length} DEC-49 check families found in checks/bio-checks.mjs, floor is `
       + `${FLOOR.families}. A family that vanished took its codes' translations with it, and the `
       + `codes did not vanish with it. Harvested by export name matching /_CHECKS$/ — a family `
       + `RENAMED out of that shape is invisible to this guard and reads exactly like a deletion.`);

  const rows = [];            // {family, code, check, where, translation}
  const byCheck = new Map(), byTranslation = new Map();

  for (const [fam, table] of families) {
    for (const [code, row] of Object.entries(table)) {
      rows.push({ fam, code, ...row });

      if (!CODE_RE.test(code))
        FAIL(`${fam}.${code} is not the shape a wire code has (SCREAMING_SNAKE, 3+ chars). `
           + `A surface keys on this string; a code it cannot recognise is a code with no translation.`);

      /* THE TRANSLATION — the whole subject of the ruling. */
      const t = row.translation;
      if (typeof t !== "string" || !t.trim())
        FAIL(`${fam}.${code} has NO CANNED TRANSLATION. DEC-49: every code a surface can receive has `
           + `a translation, and an untranslated code FAILS THE HARNESS rather than reaching a member. `
           + `Add a \`translation\` to this row in checks/bio-checks.mjs.`);
      else {
        /* 40 characters is THIS REPOSITORY'S OWN BAR, not one invented here:
           `airun.test.mjs` and `meaningread.test.mjs` both already assert a
           translation is a string longer than 40. Adopting it keeps the guard
           consistent with the suites it generalises rather than quietly raising
           the floor under three families that already pass. */
        if (t.trim().length < 40 || t.trim().split(/\s+/).length < 6)
          FAIL(`${fam}.${code}'s translation is ${t.trim().length} characters — too short to be the `
             + `sentence a member reads instead of the code. DEC-49's translations explain what `
             + `happened and, where there is one, the remedy. Got: ${JSON.stringify(t)}`);
        /* A "translation" that prints the machine vocabulary back is not one.
           This is the exact failure the ruling names: a member being made to
           decode SCREAMING_SNAKE at a screen. */
        const shouty = [...t.matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)].map(m => m[1]).filter(c => c.includes("_"));
        if (shouty.length)
          FAIL(`${fam}.${code}'s translation restates machine vocabulary (${shouty.join(", ")}). `
             + `The translation is what a member reads INSTEAD of the code; a code inside it is the `
             + `member decoding it anyway.`);
      }

      /* THE C-NUMBER — the row is a check as well as a translation, and a check
         number claimed twice is two conditions the audit reports as one. */
      if (!/^C-\d+\.\d+$/.test(String(row.check || "")))
        FAIL(`${fam}.${code} carries check=${JSON.stringify(row.check)}, which is not a C-number. `
           + `DEC-49's row is one place holding the C-number, the wire code and the translation; a row `
           + `without its C-number is not in the catalog the gate runs.`);
      else {
        const prior = byCheck.get(row.check);
        if (prior) FAIL(`${row.check} is claimed by BOTH ${prior} and ${fam}.${code}. Two conditions `
                      + `behind one C-number are one condition as far as op=audit can see.`);
        else byCheck.set(row.check, `${fam}.${code}`);
      }

      /* A TRANSLATION COPIED between two codes says the same thing about two
         different facts, which is the drift the guard exists to stop arriving
         from inside. */
      if (typeof t === "string" && t.trim()) {
        const key = t.trim();
        const prior = byTranslation.get(key);
        if (prior) FAIL(`${fam}.${code} and ${prior} carry the IDENTICAL translation. Two different `
                      + `refusals that read the same are two refusals a member cannot tell apart.`);
        else byTranslation.set(key, `${fam}.${code}`);
      }

      /* `where` IS LOAD-BEARING — arm C goes and reads it. A `where` naming no
         real file is a row whose enforcement site nobody can check. */
      const site = parseWhere(row.where);
      if (!site) FAIL(`${fam}.${code}'s \`where\` (${JSON.stringify(row.where)}) does not begin with a `
                    + `path this guard can open. Arm C reads that function looking for a codeless `
                    + `refusal beside this one; a \`where\` it cannot resolve disables that arm silently.`);
      else if (!fs.existsSync(path.join(PLANE, site.file)))
        FAIL(`${fam}.${code}'s \`where\` names ${site.file}, which does not exist under bio-plane/.`);
    }
  }

  if (rows.length < FLOOR.rows)
    FAIL(`${rows.length} DEC-49 rows across ${families.length} families, floor is ${FLOOR.rows}. `
       + `The reach SHRANK. A ceiling would not have seen this (REC-70: a neutered walk sat green at `
       + `0 of 40) — say which rows went and why, then move the floor with a dated reason.`);

  NOTE(`arm A: ${families.length} DEC-49 families (${families.map(([k]) => k).join(", ")}), `
     + `${rows.length} rows — floor ${FLOOR.families}/${FLOOR.rows}`
     + `${rows.length > FLOOR.rows ? ` · GREW by ${rows.length - FLOOR.rows} row(s) since the floor was set` : ""}`);
  return rows;
}

/* WHAT A `where` MEANS, and REC-71 is the whole reason this has a second form.
 *
 * A `where` names THE SMALLEST SPAN IN WHICH THE ROW'S REFUSAL IS ENFORCED, and
 * arm C judges exactly that span and nothing else. Two spellings:
 *
 *   "src/airun.mjs checkObservation, called from …"
 *       the WHOLE FUNCTION BODY is the governed site. Correct only when every
 *       refusal that function makes is the family's business.
 *
 *   "src/store.mjs promote > basis-version-freeze, NOT reachable from …"
 *       a NAMED REGION inside that function is the governed site, delimited in
 *       the source by `DEC-49 REGION <name>` / `END DEC-49 REGION <name>` block
 *       comments.
 *
 * A GOVERNED SITE AND A GOVERNED FUNCTION ARE DIFFERENT CLAIMS. Before REC-71
 * only the first form existed, so PL-1's two rows — whose own prose said *"(the
 * basis-version freeze arm)"* — were read as governing the whole of `promote`:
 * 870 lines, the plane's largest function, 34 refusals. **32 long-standing
 * refusals that pre-dated the rows instantly owed canned translations they were
 * never in scope for, and `main`'s UI harness went red.** The rows meant a
 * region and there was no way to say so. Now there is.
 *
 * WHY A SOURCE MARKER RATHER THAN A LINE RANGE OR AN ANCHOR SIGNATURE. Both of
 * the alternatives go stale SILENTLY, and this repository has now been bitten
 * twice in one week by a source walk anchored on a signature taking the wrong
 * span and reporting a clean verdict over bytes that could not have carried what
 * it sought — including by this very file, whose first draft read
 * `versionChain`'s PARAMETER LIST as its body and passed. A marker cannot go
 * stale quietly: it sits in front of the person moving the code, and every way
 * it can be wrong FAILS below rather than narrowing the span to nothing. */
const REGION_START = name => new RegExp(`/\\*[\\s*]*DEC-49 REGION\\s+(${name})\\b`, "g");
const REGION_END   = name => new RegExp(`/\\*[\\s*]*END DEC-49 REGION\\s+(${name})\\b`, "g");
/* Any marker at all, used to find ORPHANS — a region declared in the source that
   no `where` claims. Region names are `[\w-]+`, which is deliberately narrower
   than prose: the `<region>` placeholders in bio-checks.mjs's own explanatory
   block are not markers and must not be harvested as one. */
const ANY_REGION_MARKER = /\/\*[\s*]*(END )?DEC-49 REGION\s+([\w-]+)/g;

function parseWhere(where) {
  const m = /^([\w./-]+\.mjs)\s+([#\w$]+)(?:\s*>\s*([\w-]+))?/.exec(String(where || ""));
  return m ? { file: m[1], fn: m[2], region: m[3] || null } : null;
}

/* ============================================================
   ARM B — THE REACH, and every code in it translated
   ============================================================ */

function armB(rows, census, surfaceTables) {
  const app = fs.readFileSync(APP, "utf8");
  const suites = fs.readdirSync(TESTDIR).filter(f => f.endsWith(".test.mjs")).sort();

  const R1 = new Set(rows.map(r => r.code));
  /* R2/R3 are INTERSECTED with the plane census on purpose: a SCREAMING_SNAKE
     literal in a surface or a suite is only a receivable code if the plane
     mints it. Without the intersection this would harvest every constant name
     in two large files and call the noise "reach". */
  const R2 = new Set([...screamingLiterals(app)].filter(c => census.union.has(c)));
  const R3 = new Set();
  for (const s of suites)
    for (const c of screamingLiterals(fs.readFileSync(path.join(TESTDIR, s), "utf8")))
      if (census.union.has(c)) R3.add(c);

  const reach = new Set([...R1, ...R2, ...R3]);

  /* THE TRANSLATIONS AVAILABLE, from the two licensed places and no third.
     DEC-49 licenses BOTH — Bob left build-time and runtime lookup open — but it
     licenses ONE PLACE PER CODE. A code translated by a plane row AND by a
     surface table is two wordings for one condition that will drift apart, and
     drift is the entire reason the guard is not optional (REC-43's fence).
     Gated at zero: there is no overlap today and there must not be a first one. */
  const translated = new Map();       // code -> where its translation lives
  for (const r of rows) translated.set(r.code, `${r.fam}.${r.code} (checks/bio-checks.mjs)`);
  for (const t of surfaceTables)
    for (const c of t.codes) {
      if (translated.has(c))
        FAIL(`${c} is translated TWICE — by ${translated.get(c)} and by \`${t.name}\` in app.html. DEC-49 `
           + `licenses either home and one wording: two are two sentences for one condition, and they will `
           + `drift. Keep the PLANE's row (one wording for every surface, every instance and every export) `
           + `and delete the surface entry, or the reverse — but not both.`);
      else translated.set(c, `${t.name} (app.html)`);
    }

  /* ---- THE ENACTED PERIMETER: gated at ZERO, and this is the guard's floor
     of correctness rather than of size. A code inside DEC-49's enactment —
     a family row, or a code its producer mints into a surface table — that has
     no translation is the failure the ruling calls not optional. There is no
     ratchet here and there must not be: zero is the only defensible number. */
  const perimeter = new Set([...R1]);
  for (const t of surfaceTables) for (const c of t.producerMints) perimeter.add(c);
  const perimeterGaps = [...perimeter].filter(c => !translated.has(c)).sort();
  if (perimeterGaps.length)
    FAIL(`${perimeterGaps.length} code(s) INSIDE DEC-49's enacted perimeter have NO CANNED TRANSLATION: `
       + `${perimeterGaps.join(", ")}. DEC-49 is not optional about this — an untranslated code FAILS THE `
       + `HARNESS rather than reaching a member. Give each one a row in a \`*_CHECKS\` family in `
       + `bio-plane/checks/bio-checks.mjs (the plane's translation, one place, every surface), or an entry `
       + `in the surface table its producer feeds. Do NOT write the wording at a call site: thirteen `
       + `surfaces each inventing wording is the drift REC-43 closed.`);

  /* ---- THE MEASURED REACH: floored on SIZE, ceilinged on the GAP.
     R2 and R3 reach past the enacted perimeter — a code app.html branches on,
     or a harness mock sends, is a code a member can meet whether or not REC-64
     has got to it yet. Gating that at zero today would fail on the day it
     landed and be switched off, which VERIFICATION.md gives as the reason
     `--strict` is not yet the gate. So it is a RATCHET instead, and it has both
     halves:
       FLOOR on the reach — the walk may not lose sight (REC-70's neutered walk
         sat green at 0 of 40, which a ceiling alone cannot see);
       CEILING on the gap — REC-64 may only ever shrink it. A new refusal code
         that a surface names or a mock sends, with no translation, pushes the
         gap up by one and FAILS HERE.
     Both figures are printed every run and the gap is named code by code, so
     the answer to "how many conditions lack a translation" is a measurement
     rather than an impression. */
  const gap = [...reach].filter(c => !translated.has(c)).sort();

  if (reach.size < FLOOR.reach)
    FAIL(`the reach is ${reach.size} codes, floor is ${FLOOR.reach}. THE WALK LOST SIGHT — this is the `
       + `failure a ceiling cannot see. Establish which of R1/R2/R3 stopped yielding before moving the floor.`);

  if (gap.length > CEILING.reachGap)
    FAIL(`${gap.length} code(s) a surface CAN RECEIVE have no canned translation; the ratchet's ceiling is `
       + `${CEILING.reachGap} and REC-64 may only ever move it DOWN. The ${gap.length - CEILING.reachGap} `
       + `beyond it are new: ${gap.join(", ")}. A refusal a surface can meet owes a code with a canned `
       + `translation (DEC-49, and every IS fence inherits it) — add a row in a \`*_CHECKS\` family rather `
       + `than wording at the call site, then lower this ceiling in the same turn.`);

  NOTE(`arm B: REACH ${reach.size} codes — R1 family rows ${R1.size}, R2 named by app.html ${R2.size}, `
     + `R3 sent by a harness mock ${R3.size} (R2/R3 intersected with the plane census) · floor ${FLOOR.reach}`
     + `${reach.size > FLOOR.reach ? ` · GREW by ${reach.size - FLOOR.reach}` : ""}`);
  NOTE(`arm B: enacted perimeter ${perimeter.size} codes, ALL translated, gated at zero — `
     + `${R1.size} plane rows + ${perimeter.size - R1.size} minted into a surface table proved total`);
  NOTE(`arm B: RATCHET — ${gap.length} of ${reach.size} codes in reach still have no canned translation `
     + `(ceiling ${CEILING.reachGap}, may only fall). THAT IS REC-64'S REMAINING WORK INSIDE THE REACH, `
     + `named: ${gap.join(", ")}`);
  return { reach, translated, gap, perimeter };
}

/* ============================================================
   ARM C — NO CODELESS REFUSAL AT A GOVERNED SITE (the teeth)
   ============================================================ */

/* A function named by a row's `where` is a site DEC-49 governs. Every refusal
   it returns must carry a code the family holds. A refusal added there with no
   code — or with a code nobody translated — is precisely the thing that must
   fail the harness rather than reach a member, and this is the arm that fails.
   Read as text over the function's body because the plane runs in workerd and
   cannot be exercised from this harness at all. */
function armC(rows) {
  const sites = new Map();          // "file::fn::region" -> {file, fn, region, codes:Set}
  const claimedRegions = new Set(); // "file::region" — used to find ORPHAN markers below
  for (const r of rows) {
    const w = parseWhere(r.where);
    if (!w) continue;
    const key = `${w.file}::${w.fn}::${w.region || ""}`;
    if (!sites.has(key)) sites.set(key, { ...w, codes: new Set(), fams: new Set() });
    sites.get(key).codes.add(r.code);
    sites.get(key).fams.add(r.fam);
    if (w.region) claimedRegions.add(`${w.file}::${w.region}`);
  }

  if (sites.size < FLOOR.governedSites)
    FAIL(`${sites.size} governed sites derived from the rows' \`where\` fields, floor is `
       + `${FLOOR.governedSites}. Arm C only judges what \`where\` points it at, so a site that stopped `
       + `resolving is an arm that stopped running while still reporting green.`);

  let bodiesRead = 0, refusalsJudged = 0, bodyLines = 0;
  let regionsResolved = 0, regionLines = 0, codesChecked = 0;
  const perSite = [];
  for (const [key, site] of sites) {
    const full = path.join(PLANE, site.file);
    let src;
    try { src = fs.readFileSync(full, "utf8"); }
    catch (_) { FAIL(`arm C cannot read ${site.file} for ${key} — the site named by \`where\` is unreadable`); continue; }
    const fnBody = functionBody(src, site.fn);
    if (!fnBody) {
      FAIL(`arm C could not find function ${site.fn} in ${site.file} (named by \`where\` on `
         + `${[...site.codes].join(", ")}). The row points at a site that is not there under that name, `
         + `so nothing is checking that site for a codeless refusal.`);
      continue;
    }
    /* THE NARROWING (REC-71). A region `where` reduces the judged span from the
       whole function to the marked arm. EVERY way that can go wrong FAILS —
       narrowing a span is exactly how a walk goes quietly blind, so none of it
       is inferred from a green run. */
    let body = fnBody;
    if (site.region) {
      body = regionSpan(src, fnBody, site.region, key, site);
      if (!body) continue;
      regionsResolved++;
      regionLines += body.text.split("\n").length;
    }
    bodiesRead++;
    const nLines = body.text.split("\n").length;
    bodyLines += nLines;
    perSite.push(`${site.fn}${site.region ? ` > ${site.region}` : ""} ${nLines}L`);
    const judgedHereStart = refusalsJudged;
    let checkedHere = 0;

    /* Every refusal the body states. `ok: false` is the plane's one spelling of
       a refusal object; the family helper is the other way one is built. Both
       are collected, and a refusal object that carries neither a `code` in the
       family nor a `reason` naming one FAILS. */
    const at_ = site.region ? ` > ${site.region}` : "";
    for (const m of body.text.matchAll(/\bok\s*:\s*false\b/g)) {
      const at = m.index;
      const stmt = objectLiteralAround(body.text, at);
      const line = body.startLine + body.text.slice(0, at).split("\n").length - 1;
      refusalsJudged++;
      const named = [...stmt.matchAll(/\b(?:code|reason)\s*:\s*"([A-Z][A-Z0-9_]{2,})"/g)].map(x => x[1]);
      const viaVar = /\b(?:code|reason)\s*:\s*(?!["'])[\w.[\]]+/.test(stmt);
      if (!named.length && !viaVar)
        FAIL(`${site.file}:${line} (in ${site.fn}${at_}) returns a CODELESS REFUSAL — an \`ok:false\` with no `
           + `\`code\` and no \`reason\`. This site is governed by DEC-49 (${[...site.fams].join(", ")}), `
           + `so every refusal it makes owes a code with a canned translation. A refusal with no code is `
           + `a sentence a surface can only render verbatim or blank, which is the state DEC-49 ended. `
           + `Offending text: ${JSON.stringify(stmt.split("\n")[0].trim().slice(0, 120))}`);
      for (const c of named) {
        codesChecked++; checkedHere++;
        if (!site.codes.has(c))
          FAIL(`${site.file}:${line} (in ${site.fn}${at_}) refuses with code ${c}, which is NOT a row in `
             + `${[...site.fams].join("/")}. A code minted at a governed site with no row has no canned `
             + `translation, so it reaches a member as machine vocabulary — the exact failure DEC-49's `
             + `guard exists to prevent. Add the row, or refuse with one of: ${[...site.codes].sort().join(", ")}.`
             + (site.region ? "" : ` (This \`where\` names a WHOLE FUNCTION. If the row governs only an arm `
                                 + `of it, the fix is a REGION \`where\` and not a translation for this code — `
                                 + `see bio-checks.mjs's "WHAT A \`where\` MEANS" block, REC-71.)`));
      }
    }
    /* The family helper's own call sites, judged the same way. */
    for (const m of body.text.matchAll(/\brefusal\s*\(\s*"([A-Z][A-Z0-9_]{2,})"/g)) {
      refusalsJudged++; codesChecked++; checkedHere++;
      if (!site.codes.has(m[1])) {
        const line = body.startLine + body.text.slice(0, m.index).split("\n").length - 1;
        FAIL(`${site.file}:${line} (in ${site.fn}${at_}) calls refusal("${m[1]}"), which is NOT a row in `
           + `${[...site.fams].join("/")} — the helper would read \`undefined.translation\` and the code `
           + `would go out with no canned translation behind it.`);
      }
    }
    /* A REGION THAT JUDGES NOTHING IS A WRONG SPAN, and this is the arm that says
       so. A `where` names where the refusal FIRES; markers that have drifted off
       the arm they were put around leave a well-formed, non-trivial, correctly
       nested span containing no refusal at all — and every other check above
       would pass over it. Gated at zero for regions and NOT for functions: a
       function `where` may legitimately point at a site whose refusals arm C's
       matchers cannot see (four of them do today — see the arm's own NOTE), and
       failing on that would be doing REC-64's and REC-70's work here. */
    const judgedHere = refusalsJudged - judgedHereStart;
    if (site.region && !judgedHere)
      FAIL(`arm C judged NO refusal inside the region \`${site.region}\` of ${site.fn} in ${site.file}, `
         + `named by ${[...site.codes].sort().join(", ")}. A region \`where\` says THIS is where the refusal `
         + `fires; a span containing none is a marker that has drifted off the arm it was put around. The `
         + `span resolved, was non-trivial and was correctly nested, so nothing else here would have caught `
         + `it. Move the markers back around the refusal, or point the \`where\` somewhere true.`);
    perSite[perSite.length - 1] += ` (${judgedHere} judged, ${checkedHere} code(s) checked)`;
  }
  if (!refusalsJudged)
    FAIL(`arm C judged NO refusals across ${sites.size} governed sites. A guard that passes on nothing `
       + `observed is not a guard — establish whether the sites moved or the matcher went blind.`);
  /* THE BODY-LINE FLOOR IS THE FIX FOR THIS ARM'S OWN MEASURED DEFECT: it read
     `versionChain`'s PARAMETER LIST as a body, found no refusals in it, and
     reported green. A parameter list is a handful of lines; a governed function
     is not. Both the total and the per-site counts are printed, so a body that
     collapses is visible rather than inferred from a green run. */
  if (bodyLines < FLOOR.bodyLines)
    FAIL(`arm C read only ${bodyLines} lines of governed span across ${bodiesRead} site(s), floor `
       + `is ${FLOOR.bodyLines} (${perSite.join(", ")}). A body that shrinks to a handful of lines is this `
       + `walk matching a PARAMETER LIST rather than a body — the defect this arm was measured to have and `
       + `the reason the count is printed. Establish which site collapsed before moving the floor.`);

  /* THE REGION FLOORS (REC-71). Narrowing a span is the single most likely way
     this arm goes blind, so the narrowed spans carry their own floors on BOTH
     the number of regions resolved and the lines inside them. A region that
     silently stopped resolving would otherwise just remove itself from the
     judged set — green, and asserting nothing. */
  if (regionsResolved < FLOOR.regions)
    FAIL(`arm C resolved ${regionsResolved} region \`where\`(s), floor is ${FLOOR.regions}. A region that `
       + `stopped resolving takes its refusals out of the judged set and leaves this arm green over them.`);
  if (regionsResolved && regionLines < FLOOR.regionLines)
    FAIL(`arm C read ${regionLines} lines inside ${regionsResolved} governed region(s), floor is `
       + `${FLOOR.regionLines}. A region that has SHRUNK is a narrowing that went too far — the guard would `
       + `stop seeing refusals the row governs, which is the failure the narrowing must not buy.`);

  /* THE TEETH FLOOR, and it is the answer to "a control can pass while asserting
     nothing". Body lines measure what was READ; this measures what was actually
     COMPARED against a row. They come apart badly: four governed sites today read
     449 lines and check ZERO codes, because they refuse through a local
     `refuse(key, …)` helper (the code is a variable) or by pushing findings
     rather than returning `ok:false`. Those sites are neither passing nor failing
     on merit and this figure is how that stays visible. */
  if (codesChecked < FLOOR.codesChecked)
    FAIL(`arm C compared only ${codesChecked} refusal code(s) against a family row, floor is `
       + `${FLOOR.codesChecked}. Lines read is not the measure — a site can be read in full and assert `
       + `nothing. Establish which site stopped yielding a literal code before moving the floor.`);

  /* AN ORPHAN MARKER — a `DEC-49 REGION` declared in the plane that no `where`
     claims. It reads at the site as if that span were governed, and nothing is
     governing it: a comment asserting a guarantee nobody enforces, which is the
     "unreachable defence" class (REC-68) one file over. Gated at zero. */
  const marked = new Map();          // "file::region" -> file
  for (const rel of markerFiles()) {
    const src = fs.readFileSync(path.join(PLANE, rel), "utf8");
    for (const m of src.matchAll(ANY_REGION_MARKER)) marked.set(`${rel}::${m[2]}`, rel);
  }
  const orphans = [...marked.keys()].filter(k => !claimedRegions.has(k)).sort();
  if (orphans.length)
    FAIL(`${orphans.length} \`DEC-49 REGION\` marker(s) in the plane that NO row's \`where\` claims: `
       + `${orphans.join(", ")}. The marker tells the next reader that span is a governed site and nothing `
       + `is governing it. Point a \`where\` at it with the \`<file> <fn> > <region>\` spelling, or remove `
       + `the marker — a defence that is documented and not wired is worse than a missing one.`);

  NOTE(`arm C: ${sites.size} governed sites from the rows' \`where\` — ${sites.size - regionsResolved} whole `
     + `function(s), ${regionsResolved} narrowed REGION(s) (${regionLines} lines inside them, ${marked.size} `
     + `marker pair(s) in the plane, all claimed); ${bodiesRead} spans read, ${bodyLines} lines total; `
     + `${refusalsJudged} refusals judged and ${codesChecked} code(s) actually COMPARED against a row `
     + `· ${perSite.join(" · ")} · floors ${FLOOR.governedSites} sites / ${FLOOR.bodyLines} lines / `
     + `${FLOOR.regions} regions / ${FLOOR.regionLines} region lines / ${FLOOR.codesChecked} codes checked`);
}

/* WHICH FILES CAN HOLD A REGION MARKER. The plane's sources and its check
   catalog — the two places a `where` can name. Read from the directory rather
   than listed, so a new source file cannot hide an orphan marker. */
function markerFiles() {
  const out = fs.readdirSync(PLANE_SRC).filter(f => f.endsWith(".mjs")).map(f => path.join("src", f));
  out.push(path.join("checks", "bio-checks.mjs"));
  return out;
}

/* THE REGION SPAN (REC-71) — resolved from the source's own markers, and every
 * way it can be wrong FAILS rather than narrowing the judged span to nothing.
 *
 * The span is taken from the END of the opening marker's comment to the START of
 * the closing marker's, so the marker prose itself is never judged: a marker that
 * mentions a code in its explanation must not be read as a refusal.
 *
 * It returns null on every failure, and the caller skips the site. That is
 * deliberate: a site whose span could not be established must not be judged as
 * though it were empty — an empty span passes everything. */
function regionSpan(src, fnBody, region, key, site) {
  const esc = region.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const label = `region \`${region}\` for ${key} (${[...site.codes].sort().join(", ")})`;

  const starts = [...src.matchAll(REGION_START(esc))];
  const ends   = [...src.matchAll(REGION_END(esc))];
  /* An END marker also matches the START pattern's prefix in some spellings; the
     patterns are anchored on the literal words, so subtract any overlap by
     position rather than trusting the two counts independently. */
  const endAt = new Set(ends.map(m => m.index));
  const pureStarts = starts.filter(m => !endAt.has(m.index) && !/END\s+DEC-49/.test(src.slice(Math.max(0, m.index), m.index + m[0].length + 4)));

  if (pureStarts.length !== 1) {
    FAIL(`${label}: found ${pureStarts.length} \`DEC-49 REGION ${region}\` opening marker(s) in ${site.file}, `
       + `expected exactly 1. ${pureStarts.length ? "A duplicated marker makes the span ambiguous and the guard "
       + "would silently pick one." : "A `where` naming a region the source does not declare is an arm that "
       + "stopped running while still reporting green — this is the failure the marker exists to make loud."}`);
    return null;
  }
  if (ends.length !== 1) {
    FAIL(`${label}: found ${ends.length} \`END DEC-49 REGION ${region}\` marker(s) in ${site.file}, expected `
       + `exactly 1. An unclosed region has no end, and a doubled one has two — either way the judged span `
       + `is not the one the row claims.`);
    return null;
  }

  const openTag = pureStarts[0];
  /* The span starts where the opening marker's own block comment CLOSES, so the
     marker's prose is never judged: it explains the region and mentions codes. */
  const afterOpen = src.indexOf(CLOSE_COMMENT, openTag.index);
  const start = afterOpen < 0 ? openTag.index + openTag[0].length : afterOpen + 2;
  const end = ends[0].index;
  if (end <= start) {
    FAIL(`${label}: the END marker at offset ${end} comes BEFORE the opening marker's span start (${start}) `
       + `in ${site.file}. The region is inside out, so there is no span to judge.`);
    return null;
  }

  /* THE SPAN MUST BE INSIDE THE FUNCTION THE `where` NAMES. A marker pair that
     drifted out of `promote` into a neighbouring method would resolve cleanly
     and judge somebody else's refusals under this family's rows. */
  const fnStart = src.indexOf(fnBody.text);
  const fnEnd = fnStart + fnBody.text.length;
  if (fnStart < 0 || start < fnStart || end > fnEnd) {
    FAIL(`${label}: the marked region is NOT inside ${site.fn}'s body in ${site.file} (region ${start}..${end}, `
       + `function ${fnStart}..${fnEnd}). A \`where\` claims a span inside the function it names; a region that `
       + `has drifted out of it would have this family's rows judging another function's refusals.`);
    return null;
  }

  const text = src.slice(start, end);
  const nLines = text.split("\n").length;
  /* THE NON-TRIVIAL-SPAN ARM. A source walk that takes the WRONG SPAN and
     reports a clean verdict over bytes that could not have carried what it
     sought has now been sighted twice in a week in this repository, including
     inside this very file (a parameter list read as a body). A span of a line or
     two is that failure, and it is cheap to refuse. */
  if (nLines < REGION_MIN_LINES || text.trim().length < REGION_MIN_CHARS) {
    FAIL(`${label}: the marked span is ${nLines} line(s) / ${text.trim().length} characters, below the `
       + `${REGION_MIN_LINES}-line / ${REGION_MIN_CHARS}-character floor. A span that small is markers that `
       + `have collapsed onto each other, and it would pass every other arm here while judging nothing. `
       + `This is the same defect class as this file's own parameter-list-read-as-a-body, recorded in `
       + `\`functionBody\`'s header.`);
    return null;
  }
  return { text, startLine: src.slice(0, start).split("\n").length };
}

/* THE REFUSAL OBJECT AROUND AN `ok: false`, by brace balance in both
 * directions.
 *
 * THIS REPLACED A FIXED 400-CHARACTER WINDOW, and the fixed window is recorded
 * rather than quietly dropped because it FAILED IN THE GENEROUS DIRECTION —
 * the one failure mode `VERIFICATION.md` exists to prevent. A codeless refusal
 * followed within 400 characters by a properly coded one read as coded: the
 * window ran past the end of its own statement and found the NEXT refusal's
 * code. Arm 3 of `test/refusal-codes.test.mjs` is that fixture, and it was RED
 * on the first run of this file's own suite. A refusal is an object literal;
 * its bounds are its braces and nothing else. */
function objectLiteralAround(text, at) {
  let start = at, depth = 0;
  for (; start >= 0; start--) {
    if (text[start] === "}") depth++;
    else if (text[start] === "{") { if (!depth) break; depth--; }
  }
  if (start < 0) return text.slice(at, at + 200);
  let end = start, d = 0;
  for (; end < text.length; end++) {
    if (text[end] === "{") d++;
    else if (text[end] === "}") { d--; if (!d) break; }
  }
  return text.slice(start, Math.min(end + 1, text.length));
}

/* The body of a top-level `function NAME(` / `NAME(` method.
 *
 * THE PARAMETER LIST HAS BRACES TOO, and the first draft of this walked to the
 * first `{` after the name — which for `meaningRows(input = {}) {` is the
 * DEFAULT VALUE and for `versionChain({ addressNorm = null, … }) {` is the
 * DESTRUCTURING PATTERN. `meaningRows` failed loudly (its `{}` balances in two
 * characters, under the length guard); `versionChain` did NOT — its pattern is
 * long enough to look like a body, so arm C judged a parameter list, found no
 * refusals in it, and reported green. **That is this guard's own version of the
 * defect it was written to catch**, and it is recorded rather than quietly
 * fixed: an instrument is the most likely thing to be wrong.
 *
 * So: balance the PARENS from the declaration's `(` to its match, and only then
 * take the body's `{`. Arm C prints the line count of every body it read, so a
 * body that collapses to a parameter list is visible in the output instead of
 * being inferred from a green run. */
function functionBody(src, fn) {
  const esc = fn.replace(/[$]/g, "\\$");
  const re = new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?(?:async\\s+)?(?:function\\s+)?${esc}\\s*\\(`, "g");
  for (const m of src.matchAll(re)) {
    const lparen = src.indexOf("(", m.index + m[0].length - 2);
    if (lparen < 0) continue;
    let pd = 0, j = lparen;
    for (; j < src.length; j++) {
      if (src[j] === "(") pd++;
      else if (src[j] === ")") { pd--; if (!pd) break; }
    }
    if (pd) continue;
    /* Only whitespace may sit between `)` and the body's `{`. Anything else —
       `=>`, a `;`, an argument — means this match was a CALL, not a
       declaration, and the next match is the one wanted. */
    let open = j + 1;
    while (open < src.length && /\s/.test(src[open])) open++;
    if (src[open] !== "{") continue;
    let depth = 0, i = open;
    for (; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") { depth--; if (!depth) break; }
    }
    if (depth) continue;
    const text = src.slice(open, i + 1);
    return { text, startLine: src.slice(0, open).split("\n").length };
  }
  return null;
}

/* ============================================================
   ARM D — the SURFACE's translation tables, proved TOTAL
   ============================================================ */

/* A surface table is licensed by DEC-49 only while it is TOTAL over what its
   producer can mint: the render site falls back to printing the raw code, so a
   table with a hole IS an untranslated code reaching a member.

   THE TABLE→PRODUCER PAIRING, on `check-mock-envelope.mjs`'s FLAT_OPS
   precedent: each line is the EVIDENCE, so the pairing can be re-checked
   without re-deriving it. It lives here rather than as a marker in `app.html`
   because this guard is VF-2's and `app.html` is UI's — VF-2 opened no line of
   it. A table found in `app.html` with no line here FAILS rather than being
   skipped, so the list cannot become a place to make an inconvenient table
   disappear: the only way past this arm is to pair the table with a producer
   and be total over it. */
const TABLE_PRODUCERS = new Map(Object.entries({
  /* `man.subresources[].reason` — every row the surface lists under "Still to be
     collected" is minted in `subresources.mjs`'s record builder, including the
     two the narrow matcher could not see:
       r = { ok:false, status:0, reason: platform ? "PLATFORM_LIMIT" : "FETCH_FAILED", … }
     `cdx.mjs` mints four codes of its own (CDX_*) and NONE of them rides on a
     subresource record, so it is deliberately not this table's producer. */
  PART_REASON: "src/subresources.mjs",
}));

function armD() {
  const app = fs.readFileSync(APP, "utf8");
  const tables = [];

  /* Every code->wording map the surface holds, found by SHAPE rather than by
     name, so a second table cannot arrive unnoticed: a top-level `const NAME =
     {` whose keys are two or more SCREAMING_SNAKE codes the plane mints. */
  const census = planeCensus();
  const found = [];
  for (const m of app.matchAll(/\bconst\s+([A-Z_][A-Z0-9_]*)\s*=\s*\{/g)) {
    const open = app.indexOf("{", m.index);
    let depth = 0, i = open;
    for (; i < app.length; i++) { if (app[i] === "{") depth++; else if (app[i] === "}") { depth--; if (!depth) break; } }
    const bodyText = app.slice(open, i + 1);
    const keys = [...bodyText.matchAll(/(?:^|[{,\s])([A-Z][A-Z0-9_]{2,})\s*:/g)].map(x => x[1]);
    const minted = keys.filter(k => census.union.has(k));
    if (minted.length >= 2) found.push({ name: m[1], keys: new Set(keys), minted: new Set(minted) });
  }

  for (const t of found) {
    const producer = TABLE_PRODUCERS.get(t.name);
    if (!producer) {
      FAIL(`app.html holds a code-to-wording table \`${t.name}\` (${t.minted.size} of its ${t.keys.size} keys `
         + `are codes the plane mints) that TABLE_PRODUCERS does not pair with a producer. Pair it here, `
         + `with the evidence, so this guard can prove the table TOTAL against what that file can send. `
         + `A surface table that cannot be proved total is a table with a hole nobody is watching, and the `
         + `render site prints the raw code through the hole.`);
      continue;
    }
    const d = [null, t.name, producer];
    const prod = path.join(PLANE, producer);
    if (!fs.existsSync(prod)) { FAIL(`\`${t.name}\` is paired with producer ${producer}, which does not exist under bio-plane/.`); continue; }
    const psrc = fs.readFileSync(prod, "utf8");
    const mints = new Set();
    for (const fn of Object.values(MATCHERS)) for (const c of fn(psrc)) mints.add(c);

    const holes = [...mints].filter(c => !t.keys.has(c)).sort();
    if (holes.length)
      FAIL(`app.html's \`${t.name}\` has NO WORDING for ${holes.length} code(s) its producer ${d[2]} can `
         + `mint: ${holes.join(", ")}. The render site falls back to printing the code, so each of these `
         + `reaches a member as machine vocabulary. DEC-49: an untranslated code fails the harness instead.`);

    const dead = [...t.minted].filter(c => !mints.has(c)).sort();
    if (dead.length)
      NOTE(`arm D: \`${t.name}\` translates ${dead.length} code(s) ${d[2]} no longer mints (${dead.join(", ")}) — `
         + `wording with no producer. Not a failure: a code retired from the plane is exactly when the surface `
         + `should still know the word, because an older instance can still send it.`);

    tables.push({ name: t.name, producer: d[2], codes: t.keys, producerMints: mints });
    if (!mints.size)
      FAIL(`\`${t.name}\`'s producer ${d[2]} mints NO codes at all, so "total" is a claim about an empty `
         + `set — the walk over the producer went blind and the table would pass however many holes it had.`);
    NOTE(`arm D: \`${t.name}\` is TOTAL over ${d[2]} — ${mints.size} codes minted, ${t.keys.size} translated, `
       + `${holes.length} hole(s)`);
  }

  if (tables.length < FLOOR.surfaceTables)
    FAIL(`${tables.length} surface translation table(s) proved total, floor is ${FLOOR.surfaceTables}. `
       + `A table that stopped being FOUND is an arm that stopped running: this walk finds tables by `
       + `SHAPE (a const whose keys are codes the plane mints), so a table refactored out of that shape `
       + `disappears from the guard while its holes stay in front of members.`);
  return tables;
}

/* ============================================================
   ARM E — THE PLANE'S OWN VOCABULARY TEXTS
   ============================================================ */

/* DEC-49's SECOND CONDUCT INPUT (2026-08-07, from UI-47): **`src/airun.mjs`
   composes condition sentences and the running-session surface renders them
   VERBATIM**, so those strings are read by MEMBERS — *"when this entry's
   code-and-canned-translation rule is enacted it must cover `src/airun.mjs`'s
   vocabulary texts, not only `civicos-ui`."*
 *
 * A vocabulary here is already DEC-49's shape and nobody called it that: the KEY
 * is the machine word the record stores (`fetches`, `client-rendered-shell`,
 * `LOOKED_INDETERMINATE`) and the VALUE is the canned sentence a member reads
 * instead of it. So the same rule applies — a term with no text is a machine
 * word reaching a member — and the same guard can carry it.
 *
 * THE MODULES, with the evidence, on `check-mock-envelope.mjs`'s FLAT_OPS
 * precedent. Harvested BY SHAPE inside them (an exported plain object whose
 * values are ALL strings), never by name, so a vocabulary added to one of these
 * files is guarded the moment it lands. `RUN_STATUS = { running: 1, … }` is
 * excluded by that shape rather than by an exception: its values are not text,
 * so it is not a vocabulary a member reads. */
const VOCABULARY_MODULES = new Map(Object.entries({
  "src/airun.mjs":     "DEC-49's UI-47 input names this file: it composes the condition sentences the "
                     + "running-session surface renders VERBATIM (OBSERVATION_LEVELS, OBSERVATION_STATES, "
                     + "RUN_BOUNDS, RUN_ENDINGS)",
  "src/queuestate.mjs": "airun.mjs's checkCondition takes the condition vocabulary LIVE from here rather "
                     + "than copying it (C-22.4), so these texts are the ones a stopped run explains "
                     + "itself with — QUEUE_CONDITION_KINDS and its siblings, plus MUTE_REFUSAL_DETAIL, "
                     + "which is a member-facing refusal sentence already",
}));

async function armE() {
  let vocabularies = 0, terms = 0;
  const seen = [];
  for (const [rel, why] of VOCABULARY_MODULES) {
    const full = path.join(PLANE, rel);
    if (!fs.existsSync(full)) { FAIL(`arm E: ${rel} does not exist under bio-plane/ — a vocabulary module named with the evidence "${why}" that is not there is an arm that stopped running.`); continue; }
    const mod = await import("file://" + full);
    for (const [name, v] of Object.entries(mod)) {
      if (!v || typeof v !== "object" || Array.isArray(v)) continue;
      const entries = Object.entries(v);
      if (!entries.length) continue;
      if (!entries.every(([, x]) => typeof x === "string")) continue;   // not a TEXT vocabulary
      if (/_CHECKS$/.test(name)) continue;                              // arm A's, judged there
      vocabularies++;
      for (const [term, text] of entries) {
        terms++;
        if (!text.trim())
          FAIL(`${rel}'s \`${name}.${term}\` has NO TEXT. This vocabulary's values are what a surface `
             + `renders VERBATIM in place of the machine word (DEC-49's UI-47 input), so an empty one `
             + `puts \`${term}\` itself in front of a member.`);
        /* A WORD COUNT, NOT A CHARACTER COUNT, and the difference was measured
           rather than reasoned about: the first draft of this arm used 20
           characters and failed `RUN_ENDINGS.cancelled` — *"a member stopped
           it"*, 19 characters, which is a complete, accurate, member-readable
           sentence and exactly the kind of good short wording an over-strict
           guard gets switched off for. What actually distinguishes a text from
           a placeholder is that it is a PHRASE rather than a token. */
        else if (text.trim().split(/\s+/).length < 3)
          FAIL(`${rel}'s \`${name}.${term}\` reads ${JSON.stringify(text)} — that is a token, not the `
             + `phrase a member reads instead of the term. DEC-49's rule reaches these texts too.`);
        else if (text.trim() === term)
          FAIL(`${rel}'s \`${name}.${term}\` restates its own key. A vocabulary whose text is the machine `
             + `word is the member decoding it anyway.`);
      }
      seen.push(`${name}(${entries.length})`);
    }
  }
  if (vocabularies < FLOOR.vocabularies || terms < FLOOR.vocabularyTerms)
    FAIL(`arm E found ${vocabularies} vocabularies / ${terms} terms, floors are ${FLOOR.vocabularies}/`
       + `${FLOOR.vocabularyTerms}. THE WALK LOST SIGHT: it finds vocabularies by SHAPE (an exported plain `
       + `object whose values are all strings), so one refactored out of that shape leaves the guard `
       + `silently while its texts stay in front of members.`);
  NOTE(`arm E: the PLANE's own vocabulary texts — ${vocabularies} vocabularies, ${terms} terms across `
     + `${VOCABULARY_MODULES.size} modules, every term carrying the sentence a member reads instead of it `
     + `· ${seen.join(" ")} · floors ${FLOOR.vocabularies}/${FLOOR.vocabularyTerms}`);
}

/* ============================================================ */

const families = await dec49Families();
for (const [, table] of families) for (const c of Object.keys(table)) FAMILY_CODES.add(c);

const census = planeCensus();
for (const [name, set] of Object.entries(census.yields))
  NOTE(`walk: ${name.padEnd(20)} ${String(set.size).padStart(4)} codes`);
NOTE(`walk: ${"UNION (the census)".padEnd(20)} ${String(census.union.size).padStart(4)} codes over ${census.files} files in bio-plane/src · floor ${FLOOR.census}`);
if (census.union.size < FLOOR.census)
  FAIL(`the plane census is ${census.union.size} refusal codes, floor is ${FLOOR.census}. The WALK lost `
     + `sight — read the per-matcher line above to see which spelling stopped yielding. This is REC-70's `
     + `failure exactly, and a ceiling alone would have stayed green through it.`);

const surfaceTables = armD();
const rows = armA(families);
const { reach, translated, gap } = armB(rows, census, surfaceTables);
armC(rows);
await armE();

/* THE CENSUS GAP — reported, not gated, and the reason is in the header. This
   is the number REC-64's sweep closes, and it is stated exactly rather than
   estimated, because an unmeasured answer is not a result. */
const ungoverned = [...census.union].filter(c => !translated.has(c)).sort();
NOTE(`census gap (REPORTED, not gated — see header): ${ungoverned.length} of ${census.union.size} refusal codes `
   + `the plane can mint have NO canned translation and are NOT in reach of a surface today. That is REC-64's `
   + `remaining sweep. ${census.union.size - ungoverned.length} are translated.`);

for (const n of notes) console.log("  " + n);
if (fails.length) {
  for (const f of fails) console.error("FAIL: " + f);
  console.error(`check-refusal-codes: ${fails.length} failure${fails.length === 1 ? "" : "s"} — DEC-49's guard is `
    + `not optional: an untranslated code must FAIL THE HARNESS rather than reach a member.`);
  process.exit(1);
}
console.log(`check-refusal-codes: every code a surface can receive carries a canned translation `
  + `(${reach.size} in reach, ${rows.length} plane rows, ${surfaceTables.length} surface table(s) proved total)`);
