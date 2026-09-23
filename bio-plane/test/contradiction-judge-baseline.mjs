/* contradiction-judge-baseline.mjs — M0-71: the FIRST CANDIDATE JUDGEMENT the
 * over-strictness harness measures (CONTRADICTION-IDENTIFY-DESIGN.md §7, §9 item 2).
 *
 * WHAT THIS IS, AND WHAT IT IS NOT.
 *   - It is a DETERMINISTIC, LEXICAL candidate: no model, no network, no record.
 *     It exists so the harness has something real to measure and so the gate's
 *     threshold is set by a measurement (§7) rather than typed.
 *   - It is NOT §9 item 3's judgement. Item 3 is the machine's, inside a run, with
 *     a model and a prompt the build chooses (§5); it plugs into the SAME harness
 *     (`contradiction-gate.mjs` `measure(pairs, gold, judge)`) and must pass the
 *     SAME gate before anything reaches a member.
 *   - IT WAS WRITTEN BEFORE THE FIXTURE, and committed to in that order in the
 *     worktree, so that its rules are not a transcription of the fixture's labels.
 *     The same hand wrote both, so its figures are an UPPER bound on how well a
 *     lexical rule does on text it has never seen, and are reported as such.
 *
 * INPUT (§5: the two sides and their immediate context, nothing else):
 *   { key, question?, a: { text, doctype?, date?, role? }, b: { ... } }
 * OUTPUT: { label, reason } with label one of §5's five words.
 *
 * THE RULE, in order, and each step's reason:
 *   1. matter: share of content words the two sides have in common. Below the
 *      floor the key over-reached → `unrelated`.
 *   2. opposite direction (one side says up, the other down) → a conflict.
 *   3. opposite polarity (one side negated, the other not) → a conflict.
 *   4. numbers on both sides: hedged or rounding-compatible → `precision`;
 *      incompatible and neither hedged → a conflict.
 *   5. same direction, differing only in qualitative magnitude → `precision`.
 *   6. nothing differs that this rule can see → `undetermined` — never coerced.
 *   A conflict is `record` on K2/K3 (our claims) and `world` on K1/K4 (sources).
 */

const STOP = new Set(("a an the of to in on at by for from with and or but as is are was were be been being "
  + "that this these those it its their there here which who whom what when where how than then so such "
  + "has have had do does did will would shall should may might must can could also any all each every "
  + "into onto over under about approximately roughly nearly around some per our we they he she his her "
  + "not no never none without little lot").split(" "));
const NEG = /\b(not|no|never|none|without|neither|nor|waived|waive|declined|refused|failed|cancelled|rescinded|repealed|exempt(?:ed)?)\b|n't\b/gi;
const UP = /\b(increase[sd]?|increasing|rise|rises|rose|risen|grow|grew|grown|grows|up|higher|more|raised?|expand(?:ed|s)?|added)\b/i;
const DOWN = /\b(reduce[sd]?|reducing|reduction|decrease[sd]?|decreasing|drop(?:ped|s)?|fell|fall(?:en|s)?|decline[sd]?|cut|cuts|lower(?:ed)?|less|fewer|shrank|shrunk)\b/i;
const HEDGE = /\b(approximately|about|roughly|nearly|around|almost|some|more than|over|under|just under|just over|close to|an estimated|estimated)\b|~/i;
const MAG = /\b(a little|slightly|modestly|somewhat|marginally|a lot|sharply|significantly|dramatically|substantially|steeply|greatly)\b/gi;

const stem = (w) => w.replace(/(ing|ed|es|s)$/, "");
const words = (s) => (String(s).toLowerCase().match(/[a-z][a-z'-]+/g) || [])
  .filter((w) => !STOP.has(w) && w.length > 2).map(stem);
const MULT = { thousand: 1e3, million: 1e6, billion: 1e9, k: 1e3, m: 1e6, bn: 1e9 };
const numbers = (s) => {
  const out = [];
  const re = /\$?\s?(\d[\d,]*(?:\.\d+)?)\s*(%|percent|thousand|million|billion|bn|k|m)?\b/gi;
  let m;
  while ((m = re.exec(String(s)))) {
    const v = Number(m[1].replace(/,/g, ""));
    if (!Number.isFinite(v)) continue;
    const u = (m[2] || "").toLowerCase();
    if (/^(19|20)\d\d$/.test(m[1]) && !u) continue;           /* a year is a date, not a quantity */
    const unit = u === "%" || u === "percent" ? "%" : "";
    out.push({ v: v * (MULT[u] || 1), unit, raw: m[0].trim(), digits: m[1].replace(/[,.]/g, "").replace(/0+$/, "").length });
  }
  return out;
};
const negated = (s) => (String(s).match(NEG) || []).length % 2 === 1;
const dir = (s) => (UP.test(s) && !DOWN.test(s) ? "up" : DOWN.test(s) && !UP.test(s) ? "down" : null);
const hedged = (s) => HEDGE.test(String(s));
const roundOf = (x, sig) => { if (x === 0) return 0; const p = 10 ** (Math.floor(Math.log10(Math.abs(x))) - sig + 1); return Math.round(x / p) * p; };
/* Two figures are the same fact at different precision when the coarser one is
   the finer one ROUNDED at the coarser one's own significant digits. */
const roundingCompatible = (x, y) => {
  const [c, f] = x.digits <= y.digits ? [x, y] : [y, x];
  return Math.abs(roundOf(f.v, Math.max(1, c.digits)) - c.v) < 1e-9 * Math.max(1, Math.abs(c.v));
};

export const MATTER_FLOOR = 0.2;
export const TOLERANCE_HEDGED = 0.1;

export function judgeBaseline(pair) {
  const A = String(pair?.a?.text ?? ""), B = String(pair?.b?.text ?? "");
  if (!A || !B) return { label: "undetermined", reason: "a side carried no text to compare" };
  const conflict = pair.key === "K2" || pair.key === "K3" ? "record" : "world";

  const wa = new Set(words(A)), wb = new Set(words(B));
  const shared = [...wa].filter((w) => wb.has(w)).length;
  const overlap = shared / Math.max(1, Math.min(wa.size, wb.size));
  if (overlap < MATTER_FLOOR)
    return { label: "unrelated", reason: `the two sides share ${shared} content word(s) (${overlap.toFixed(2)} < ${MATTER_FLOOR}); not the same matter` };

  const da = dir(A), db = dir(B);
  if (da && db && da !== db)
    return { label: conflict, reason: `one side says ${da}, the other ${db}, about the same matter` };

  if (negated(A) !== negated(B))
    return { label: conflict, reason: "one side asserts what the other negates, about the same matter" };

  const na = numbers(A), nb = numbers(B);
  if (na.length && nb.length) {
    for (const x of na) for (const y of nb) {
      if (x.unit !== y.unit) continue;
      const rel = Math.abs(x.v - y.v) / Math.max(Math.abs(x.v), Math.abs(y.v), 1e-9);
      if (rel === 0) continue;
      if (roundingCompatible(x, y) || ((hedged(A) || hedged(B)) && rel <= TOLERANCE_HEDGED))
        return { label: "precision", reason: `${x.raw} and ${y.raw} are one figure at different precision` };
      if (!hedged(A) && !hedged(B))
        return { label: conflict, reason: `${x.raw} against ${y.raw}, neither hedged, beyond rounding` };
    }
  }

  const ma = (A.match(MAG) || []).map((s) => s.toLowerCase()), mb = (B.match(MAG) || []).map((s) => s.toLowerCase());
  if ((ma.length || mb.length) && String(ma) !== String(mb) && (da === db))
    return { label: "precision", reason: "the same direction of change, said at different magnitudes" };

  if ((na.length && nb.length) || (da && da === db))
    return { label: "precision", reason: "the same fact; nothing this rule reads differs between them" };
  return { label: "undetermined", reason: "nothing this rule can read distinguishes agreement from conflict" };
}
