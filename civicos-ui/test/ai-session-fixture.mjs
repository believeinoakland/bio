/* ai-session-fixture.mjs — D-286, 2026-09-23. The budget draw of `ai-session-context.test.mjs`, lifted out of the
 * suite so a harness can run THE DRAW ALONE (no plane, no window) and so the suite and the harness draw by ONE rule.
 *
 * WHY THIS EXISTS. The suite drew its budgets with an unseeded `Math.random()` from ranges that OVERLAPPED once a
 * derivation was taken: the inquiry's remainder (INQ_ALLOWED - INQ_CONSUMED, 1502..2992) contained the project's
 * consumption (PROJ_CONSUMED, 2003..2499), and the project's remainder (2502..3996) contained the inquiry's allowance
 * (3001..3999). ARM D0b — correctly — refuses a fixture in which a derivation ARM D1 looks for equals a published
 * figure, so the suite went RED BY THE DRAW, never by the code (measured: 3354, 1278, 2076 -> the inquiry's remainder
 * 2076 IS the project's consumption). Under `TREE-SHARING.md` §3 (*a gate test depends only on the code*) that is a
 * defect in the TEST, and the fix is here, in the ranges — never in D0b.
 *
 * THE RANGES, AND THE PROOF THAT THEY ARE DISJOINT (interval arithmetic; `rangeProof()` computes it on every run):
 *
 *   published by the record (each run's budget row)         derived by ARM D (what D1 looks for)
 *   INQ_ALLOWED    3001..3999                               inquiry remainder  3001-1499 .. 3999-1007 = 1502..2992
 *   INQ_CONSUMED   1007..1499                               project remainder  9001-4499 .. 9999-4003 = 4502..5996
 *   PROJ_CONSUMED  4003..4499                               percents           25..50 (inquiry), 40..50 (project)
 *   PROJ_ALLOWED   9001..9999                               1dp percents       always carry a ".", so never equal an integer
 *   OTHER_ALLOWED  8001..8999 (another run; X1b reads it)
 *
 *   1502..2992 and 4502..5996 each fall in a GAP between the published intervals (1499 < 1502, 2992 < 3001;
 *   4499 < 4502, 5996 < 8001), and every percent (<= 50) sits below every published figure (>= 1007). So NO draw from
 *   these ranges can produce a collision among the values the draw controls: the property is PROVEN, not sampled.
 *   Consumption stays below allowance in both runs (1499 < 3001, 4499 < 9001), so both runs are still RUNNING.
 *
 * WHAT THE PROOF DOES NOT REACH, stated rather than implied closed: the plane's OWN scalars in the same wire (`ticks`,
 * timestamps, booleans, the prefixed labels and tags). None is drawn here, so none can make the result move with the
 * draw except by equalling a percent in 25..50 — `ticks` is a small count (2 on a run opened and ticked once), and every
 * other plane scalar is a non-numeric string. ARM D0b still reads the REAL wire on every run, unchanged, and is what
 * catches a plane scalar that ever lands in that interval.
 *
 * THE DRAW STAYS RANDOM on every run — that is the suite's defence against a hand copy in `app.html` (its header) — and
 * its values are PRINTED by the suite, so any failure is reproducible by pinning the four printed figures. */

export const RANGES = Object.freeze({
  INQ_ALLOWED:   [3001, 3999],
  INQ_CONSUMED:  [1007, 1499],
  PROJ_ALLOWED:  [9001, 9999],
  PROJ_CONSUMED: [4003, 4499],
  OTHER_ALLOWED: [8001, 8999],
});

/* The derivations ARM D computes from a budget row, in the SAME forms (a mirror of the suite's ARM D, which is left
   untouched; if ARM D ever looks for a new derivation, add it here too, or `rangeProof` proves less than D checks). */
export function derivations({ INQ_ALLOWED, INQ_CONSUMED, PROJ_ALLOWED, PROJ_CONSUMED }){
  const out = [];
  for(const [where, a, c] of [["inquiry", INQ_ALLOWED, INQ_CONSUMED], ["project", PROJ_ALLOWED, PROJ_CONSUMED]]){
    out.push([`${where} fetches percent`, String(Math.round((c / a) * 100))]);
    out.push([`${where} fetches percent (1dp)`, (Math.round((c / a) * 1000) / 10).toFixed(1)]);
    out.push([`${where} fetches remainder`, String(a - c)]);
  }
  return out;
}

/* THE COLLISION PREDICATE over the values the draw controls: every derivation against every drawn figure the record
   publishes (both wires carry all four budget figures; OTHER_ALLOWED is included because X1b reads it too). */
export function collisions(f){
  const published = new Set([f.INQ_ALLOWED, f.INQ_CONSUMED, f.PROJ_ALLOWED, f.PROJ_CONSUMED, f.OTHER_ALLOWED].map(String));
  return derivations(f).filter(([, v]) => published.has(v)).map(([what, v]) => `${what} = ${v}`);
}

/* THE PROOF, computed rather than trusted: each derived interval against each published interval. An empty answer
   means no draw from RANGES can collide; a non-empty one names the overlap. */
export function rangeProof(ranges = RANGES){
  const [ia, ic, pa, pc] = [ranges.INQ_ALLOWED, ranges.INQ_CONSUMED, ranges.PROJ_ALLOWED, ranges.PROJ_CONSUMED];
  const derived = {
    "inquiry remainder": [ia[0] - ic[1], ia[1] - ic[0]],
    "project remainder": [pa[0] - pc[1], pa[1] - pc[0]],
    "inquiry percent":   [Math.round(ic[0] / ia[1] * 100), Math.round(ic[1] / ia[0] * 100)],
    "project percent":   [Math.round(pc[0] / pa[1] * 100), Math.round(pc[1] / pa[0] * 100)],
  };
  const faults = [];
  for(const [d, [dlo, dhi]] of Object.entries(derived))
    for(const [p, [plo, phi]] of Object.entries(ranges))
      if(dlo <= phi && plo <= dhi) faults.push(`${d} ${dlo}..${dhi} overlaps ${p} ${plo}..${phi}`);
  if(!(ic[1] < ia[0])) faults.push(`INQ_CONSUMED can reach INQ_ALLOWED (${ic[1]} >= ${ia[0]})`);
  if(!(pc[1] < pa[0])) faults.push(`PROJ_CONSUMED can reach PROJ_ALLOWED (${pc[1]} >= ${pa[0]})`);
  return { derived, faults };
}

/* THE DRAW. `rand` is Math.random in the suite (the fixture MUST move run to run); a harness may pass its own. It
   neither redraws nor throws on a collision: under RANGES none can occur (`rangeProof`), and if the ranges are ever
   edited so one can, the suite's ARM D0c fails on the PROOF, deterministically, and ARM D0b — unchanged — names the
   colliding derivation on the run that draws one. A silent redraw would hide exactly that. */
export function drawBudgets(rand = Math.random, ranges = RANGES){
  const R = ([lo, hi]) => lo + Math.floor(rand() * (hi - lo + 1));
  const f = {};
  for(const k of Object.keys(ranges)) f[k] = R(ranges[k]);
  return f;
}
