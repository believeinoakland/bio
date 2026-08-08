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
const FLOOR = {
  families:      3,    // AI_RUN_CHECKS, MEANING_READ_CHECKS, VERSION_CHAIN_CHECKS
  rows:         11,    // C-22.1..6, C-23.1..2, C-24.1..3
  census:      311,    // distinct refusal codes the plane can mint, UNION of the matcher set.
                       // A plain `reason: "CODE"` grep answers 294; the set finds 17 more.
  reach:        98,    // codes a surface can receive (R1 + R2 + R3)
  governedSites: 5,    // (file, function) pairs named by a row's `where`
  surfaceTables: 1,    // PART_REASON
  bodyLines:    60,    // total lines of governed function body arm C actually reads
  vocabularies:  8,    // the plane's own code->text maps a surface renders verbatim (arm E)
  vocabularyTerms: 40, // terms across them
};

/* THE OTHER HALF OF THE RATCHET. A floor catches an instrument going blind; a
   ceiling catches the SUBJECT getting worse. REC-64 is the sweep that lowers
   this to zero, one family at a time, and until then no new receivable code may
   arrive without a translation. Measured 2026-08-07 by this file. */
const CEILING = {
  reachGap:     74,    // codes in reach with no canned translation — may only FALL
};

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

/* `where` reads "src/airun.mjs checkObservation, called from …" — the path, then
   the function this guard must open. Tolerant of the trailing prose. */
function parseWhere(where) {
  const m = /^([\w./-]+\.mjs)\s+([#\w$]+)/.exec(String(where || ""));
  return m ? { file: m[1], fn: m[2] } : null;
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
  const sites = new Map();          // "file::fn" -> {file, fn, codes:Set}
  for (const r of rows) {
    const w = parseWhere(r.where);
    if (!w) continue;
    const key = `${w.file}::${w.fn}`;
    if (!sites.has(key)) sites.set(key, { ...w, codes: new Set(), fams: new Set() });
    sites.get(key).codes.add(r.code);
    sites.get(key).fams.add(r.fam);
  }

  if (sites.size < FLOOR.governedSites)
    FAIL(`${sites.size} governed (file, function) sites derived from the rows' \`where\` fields, floor is `
       + `${FLOOR.governedSites}. Arm C only judges what \`where\` points it at, so a site that stopped `
       + `resolving is an arm that stopped running while still reporting green.`);

  let bodiesRead = 0, refusalsJudged = 0, bodyLines = 0;
  const perSite = [];
  for (const [key, site] of sites) {
    const full = path.join(PLANE, site.file);
    let src;
    try { src = fs.readFileSync(full, "utf8"); }
    catch (_) { FAIL(`arm C cannot read ${site.file} for ${key} — the site named by \`where\` is unreadable`); continue; }
    const body = functionBody(src, site.fn);
    if (!body) {
      FAIL(`arm C could not find function ${site.fn} in ${site.file} (named by \`where\` on `
         + `${[...site.codes].join(", ")}). The row points at a site that is not there under that name, `
         + `so nothing is checking that site for a codeless refusal.`);
      continue;
    }
    bodiesRead++;
    const nLines = body.text.split("\n").length;
    bodyLines += nLines;
    perSite.push(`${site.fn} ${nLines}L`);

    /* Every refusal the body states. `ok: false` is the plane's one spelling of
       a refusal object; the family helper is the other way one is built. Both
       are collected, and a refusal object that carries neither a `code` in the
       family nor a `reason` naming one FAILS. */
    for (const m of body.text.matchAll(/\bok\s*:\s*false\b/g)) {
      const at = m.index;
      const stmt = objectLiteralAround(body.text, at);
      const line = body.startLine + body.text.slice(0, at).split("\n").length - 1;
      refusalsJudged++;
      const named = [...stmt.matchAll(/\b(?:code|reason)\s*:\s*"([A-Z][A-Z0-9_]{2,})"/g)].map(x => x[1]);
      const viaVar = /\b(?:code|reason)\s*:\s*(?!["'])[\w.[\]]+/.test(stmt);
      if (!named.length && !viaVar)
        FAIL(`${site.file}:${line} (in ${site.fn}) returns a CODELESS REFUSAL — an \`ok:false\` with no `
           + `\`code\` and no \`reason\`. This site is governed by DEC-49 (${[...site.fams].join(", ")}), `
           + `so every refusal it makes owes a code with a canned translation. A refusal with no code is `
           + `a sentence a surface can only render verbatim or blank, which is the state DEC-49 ended. `
           + `Offending text: ${JSON.stringify(stmt.split("\n")[0].trim().slice(0, 120))}`);
      for (const c of named)
        if (!site.codes.has(c))
          FAIL(`${site.file}:${line} (in ${site.fn}) refuses with code ${c}, which is NOT a row in `
             + `${[...site.fams].join("/")}. A code minted at a governed site with no row has no canned `
             + `translation, so it reaches a member as machine vocabulary — the exact failure DEC-49's `
             + `guard exists to prevent. Add the row, or refuse with one of: ${[...site.codes].sort().join(", ")}.`);
    }
    /* The family helper's own call sites, judged the same way. */
    for (const m of body.text.matchAll(/\brefusal\s*\(\s*"([A-Z][A-Z0-9_]{2,})"/g)) {
      refusalsJudged++;
      if (!site.codes.has(m[1])) {
        const line = body.startLine + body.text.slice(0, m.index).split("\n").length - 1;
        FAIL(`${site.file}:${line} (in ${site.fn}) calls refusal("${m[1]}"), which is NOT a row in `
           + `${[...site.fams].join("/")} — the helper would read \`undefined.translation\` and the code `
           + `would go out with no canned translation behind it.`);
      }
    }
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
    FAIL(`arm C read only ${bodyLines} lines of governed function body across ${bodiesRead} site(s), floor `
       + `is ${FLOOR.bodyLines} (${perSite.join(", ")}). A body that shrinks to a handful of lines is this `
       + `walk matching a PARAMETER LIST rather than a body — the defect this arm was measured to have and `
       + `the reason the count is printed. Establish which site collapsed before moving the floor.`);
  NOTE(`arm C: ${sites.size} governed (file, function) sites from the rows' \`where\`; ${bodiesRead} bodies `
     + `read, ${bodyLines} lines total (${perSite.join(", ")}); ${refusalsJudged} refusals judged, every one `
     + `carrying a code with a row · floors ${FLOOR.governedSites} sites / ${FLOOR.bodyLines} lines`);
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
