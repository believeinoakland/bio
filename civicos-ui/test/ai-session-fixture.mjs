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
  const faults = overlapFaults(derived, ranges);
  if(!(ic[1] < ia[0])) faults.push(`INQ_CONSUMED can reach INQ_ALLOWED (${ic[1]} >= ${ia[0]})`);
  if(!(pc[1] < pa[0])) faults.push(`PROJ_CONSUMED can reach PROJ_ALLOWED (${pc[1]} >= ${pa[0]})`);
  return { derived, faults };
}

/* THE DRAW. `rand` is Math.random in the suite (the fixture MUST move run to run); a harness may pass its own. It
   neither redraws nor throws on a collision: under RANGES none can occur (`rangeProof`), and if the ranges are ever
   edited so one can, the suite's ARM D0c fails on the PROOF, deterministically, and ARM D0b — unchanged — names the
   colliding derivation on the run that draws one. A silent redraw would hide exactly that. */
export function drawBudgets(rand = Math.random, ranges = RANGES){
  return drawFrom(ranges, rand);
}

/* ======================================================================================================================
   THE GENERIC HALF — M0-132, 2026-09-23. Extracted from D-286's draw and proof above (which now call it, unchanged in
   behaviour) so a second suite REUSES the interval proof instead of copying it: `ai-session-wire.test.mjs` had the same
   defect (its ranges overlapped once a derivation was taken; measured 1 in 2,155 in M-114) and its ranges, derivations,
   collision predicate and proof are the WIRE block below.
   ====================================================================================================================== */

/* One draw per named range, uniform over the closed interval. `rand` is Math.random in a suite. */
export function drawFrom(ranges, rand = Math.random){
  const R = ([lo, hi]) => lo + Math.floor(rand() * (hi - lo + 1));
  const f = {};
  for(const k of Object.keys(ranges)) f[k] = R(ranges[k]);
  return f;
}

/* Every derived interval against every published interval; each overlap named. Empty means no draw can collide. */
export function overlapFaults(derived, published){
  const faults = [];
  for(const [d, [dlo, dhi]] of Object.entries(derived))
    for(const [p, [plo, phi]] of Object.entries(published))
      if(dlo <= phi && plo <= dhi) faults.push(`${d} ${dlo}..${dhi} overlaps ${p} ${plo}..${phi}`);
  return faults;
}

/* A tag drawn from LETTERS ONLY, so no digit run in a label, ref or skill on a panel can contain a drawn figure (the wire
   suite's ARMs W7b/W7c test figures by raw substring over the whole panel). */
export const TAG_ALPHABET = "abcdefghijklmnopqrstuvwxyz";
export const letterTag = (rand = Math.random, n = 8) =>
  Array.from({ length: n }, () => TAG_ALPHABET[Math.floor(rand() * TAG_ALPHABET.length)]).join("");

/* ======================================================================================================================
   THE WIRE SUITE'S DRAW — M0-132, 2026-09-23 (`ai-session-wire.test.mjs`).

   WHY. The suite drew FETCH_ALLOWED 3001..6999, FETCH_CONSUMED 1007..1499, SUBS_ALLOWED 7001..9973, SUBS_CONSUMED
   2003..2999, then OTHER_ALLOWED = FETCH_ALLOWED + 1000..2000 and OTHER_CONSUMED = FETCH_CONSUMED + 1000..2000. The fetches
   remainder (1502..5992) contained SUBS_CONSUMED and the subsessions remainder (4002..7970) contained FETCH_ALLOWED, so
   ARM D0b went RED BY THE DRAW (M-114: 1 in 2,155). And two more collisions nobody had measured, both on arms that test by
   RAW SUBSTRING: OTHER_CONSUMED (2007..3499) could EQUAL FETCH_ALLOWED, which ARM W7b requires ABSENT from the other
   run's panel; and OTHER_ALLOWED (4001..8999) could EQUAL SUBS_ALLOWED (they share 7001..8999), which ARM W7c
   requires ABSENT from the first run's panel. The rates are measured in M-115.

   THE RANGES, ON ONE LINE, EVERY BAND DISJOINT FROM EVERY OTHER (`wireRangeProof()` computes it on every run):

     ticks (the plane's; not drawn; 3 in this fixture)       0..9        RUNTIME_ALLOWED (the stopped run)  2..5
     FETCH_CONSUMED   1007..1499   fetches remainder (derived)   1502..2992   FETCH_ALLOWED   3001..3999
     SUBS_CONSUMED    4003..4499   subsessions remainder (derived) 4502..5970 OTHER_CONSUMED  6001..6999
     OTHER_ALLOWED    7001..8999   SUBS_ALLOWED    9001..9973     percents (derived) 25..50 (fetches), 40..50 (subsessions)

   So: (a) ARM D0b — no remainder or percent ARM D derives can equal ANY figure the draw publishes, on any run's panel
   (OTHER_ALLOWED and OTHER_CONSUMED included, though only the live wire is D0b's); 1dp percents always carry a ".".
   (b) ARM W7b/W7c — FETCH_ALLOWED and OTHER_ALLOWED are exactly four digits and every figure beside them on a panel has
   at most four, so a substring hit is an EQUALITY, and the bands exclude it; the panels' other digit runs are the
   clock's year (a 2000..2999 band, which both avoid), the context id's "2026"/"0807" and 2-digit time fields, and the
   tags, now drawn from letters only. (c) Consumption stays below allowance on every run, so each run stays RUNNING.

   WHAT THE PROOF DOES NOT REACH, stated rather than implied closed: the plane's own scalars (`ticks`, timestamps,
   labels). None is drawn; ticks is a small count and ARM D0b still reads the REAL wire on every run. */

export const WIRE_RANGES = Object.freeze({
  FETCH_CONSUMED:  [1007, 1499],
  FETCH_ALLOWED:   [3001, 3999],
  SUBS_CONSUMED:   [4003, 4499],
  OTHER_CONSUMED:  [6001, 6999],
  OTHER_ALLOWED:   [7001, 8999],
  SUBS_ALLOWED:    [9001, 9973],
  RUNTIME_ALLOWED: [2, 5],
});
export const WIRE_TICKS = [0, 9];            /* the plane's `ticks` (3 here: opened, ticked twice) — published, NOT drawn */
export const WIRE_CLOCK_YEARS = [2000, 2999]; /* the 4-digit year in every timestamp the panels render */

/* ARM D's derivations over the live wire, in ITS forms and names (a mirror of the suite's ARM D, left untouched; if D
   ever looks for a new derivation, add it here too, or `wireRangeProof` proves less than D checks). */
export function wireDerivations({ FETCH_ALLOWED, FETCH_CONSUMED, SUBS_ALLOWED, SUBS_CONSUMED }){
  const out = [];
  for(const [bound, a, c] of [["fetches", FETCH_ALLOWED, FETCH_CONSUMED], ["subsessions", SUBS_ALLOWED, SUBS_CONSUMED]]){
    out.push([`${bound} percent`, String(Math.round((c / a) * 100))]);
    out.push([`${bound} percent (1dp)`, (Math.round((c / a) * 1000) / 10).toFixed(1)]);
    out.push([`${bound} remainder`, String(a - c)]);
  }
  return out;
}

/* THE COLLISION PREDICATE over one draw, every arm the draw can move: D0b (a derivation equals a published figure),
   W7b (the first run's allowance inside a figure on the other run's panel), W7c (the other run's allowance inside a
   figure on the first run's panel), and a run whose consumption reached its allowance. */
export function wireCollisions(f){
  const small = Array.from({ length: WIRE_TICKS[1] - WIRE_TICKS[0] + 1 }, (_, i) => WIRE_TICKS[0] + i);
  const published = new Set([f.FETCH_ALLOWED, f.FETCH_CONSUMED, f.SUBS_ALLOWED, f.SUBS_CONSUMED, f.OTHER_ALLOWED,
                              f.OTHER_CONSUMED, f.RUNTIME_ALLOWED, ...small].map(String));
  const out = wireDerivations(f).filter(([, v]) => published.has(v)).map(([what, v]) => `D0b: ${what} = ${v}`);
  for(const x of [f.OTHER_ALLOWED, f.OTHER_CONSUMED, ...small])
    if(String(x).includes(String(f.FETCH_ALLOWED))) out.push(`W7b: FETCH_ALLOWED ${f.FETCH_ALLOWED} inside ${x}`);
  for(const x of [f.FETCH_ALLOWED, f.FETCH_CONSUMED, f.SUBS_ALLOWED, f.SUBS_CONSUMED, ...small])
    if(String(x).includes(String(f.OTHER_ALLOWED))) out.push(`W7c: OTHER_ALLOWED ${f.OTHER_ALLOWED} inside ${x}`);
  for(const [c, a] of [["FETCH_CONSUMED", "FETCH_ALLOWED"], ["SUBS_CONSUMED", "SUBS_ALLOWED"], ["OTHER_CONSUMED", "OTHER_ALLOWED"]])
    if(!(f[c] < f[a])) out.push(`running: ${c} ${f[c]} >= ${a} ${f[a]}`);
  return out;
}

/* THE PROOF, computed rather than trusted. Empty `faults` means no draw from the ranges can collide on any arm above. */
export function wireRangeProof(ranges = WIRE_RANGES){
  const { FETCH_ALLOWED: fa, FETCH_CONSUMED: fc, SUBS_ALLOWED: sa, SUBS_CONSUMED: sc,
          OTHER_ALLOWED: oa, OTHER_CONSUMED: oc } = ranges;
  const derived = {
    "fetches remainder":     [fa[0] - fc[1], fa[1] - fc[0]],
    "subsessions remainder": [sa[0] - sc[1], sa[1] - sc[0]],
    "fetches percent":       [Math.round(fc[0] / fa[1] * 100), Math.round(fc[1] / fa[0] * 100)],
    "subsessions percent":   [Math.round(sc[0] / sa[1] * 100), Math.round(sc[1] / sa[0] * 100)],
  };
  const published = { ...ranges, ticks: WIRE_TICKS };
  const faults = overlapFaults(derived, published);                                            /* (a) ARM D0b */
  const panelLive  = { FETCH_ALLOWED: fa, FETCH_CONSUMED: fc, SUBS_ALLOWED: sa, SUBS_CONSUMED: sc, ticks: WIRE_TICKS };
  const panelOther = { OTHER_ALLOWED: oa, OTHER_CONSUMED: oc, ticks: WIRE_TICKS };
  const four = ([lo, hi]) => lo >= 1000 && hi <= 9999;
  const atMostFour = ([, hi]) => hi <= 9999;
  for(const [arm, name, r, panel] of [["W7b", "FETCH_ALLOWED", fa, panelOther], ["W7c", "OTHER_ALLOWED", oa, panelLive]]){
    if(!four(r)) faults.push(`${arm}: ${name} ${r[0]}..${r[1]} is not exactly four digits, so a substring is not an equality`);
    for(const [p, pr] of Object.entries(panel)){
      if(!atMostFour(pr)) faults.push(`${arm}: ${p} ${pr[0]}..${pr[1]} can exceed four digits and contain ${name}`);
      if(p !== name && r[0] <= pr[1] && pr[0] <= r[1]) faults.push(`${arm}: ${name} ${r[0]}..${r[1]} overlaps ${p} ${pr[0]}..${pr[1]}`);
    }
    if(r[0] <= WIRE_CLOCK_YEARS[1] && WIRE_CLOCK_YEARS[0] <= r[1])
      faults.push(`${arm}: ${name} ${r[0]}..${r[1]} overlaps the clock's year band ${WIRE_CLOCK_YEARS.join("..")}`);
  }                                                                                             /* (b) ARMs W7b, W7c */
  for(const [c, a, cn, an] of [[fc, fa, "FETCH_CONSUMED", "FETCH_ALLOWED"], [sc, sa, "SUBS_CONSUMED", "SUBS_ALLOWED"],
                               [oc, oa, "OTHER_CONSUMED", "OTHER_ALLOWED"]])
    if(!(c[1] < a[0])) faults.push(`running: ${cn} can reach ${an} (${c[1]} >= ${a[0]})`);    /* (c) */
  if(/[0-9]/.test(TAG_ALPHABET)) faults.push(`tags: the tag alphabet carries a digit`);
  return { derived, published, faults };
}

export function drawWire(rand = Math.random, ranges = WIRE_RANGES){
  return drawFrom(ranges, rand);
}
