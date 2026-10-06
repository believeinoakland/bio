/* consequences' measures as exact decimals (requirements: `build/requirements/consequences.md`, Terms, R1, R2, R5,
 * R7; C:A-11). This module holds no figure parser and no arithmetic of its own: a value is read by `calc-grammar`'s
 * figure reader and every sum, difference, product and ratio is `calc-grammar`'s exact arithmetic. What is here is the
 * spelling between the two: a measure's value is a signed decimal string ("-1200.50"), never a floating-point number,
 * and a calc-grammar figure (`{value, sign, precision, currency?}` or a range) is written back as one. Pure; nothing
 * here throws or reads the record. */

import { parseFigure, add, subtract, multiply, divide, RATIO_DEFAULT } from "../calc-grammar/index.mjs";

/** R2: the operations a computation may name. */
export const OPS = Object.freeze(["sum", "difference", "count", "product", "ratio"]);
/** R2: a ratio's stated rounding (calc-grammar R4 refuses a division without one): its default ratio rounding. */
export const RATIO_ROUNDING = RATIO_DEFAULT;

const SIGNED = /^-?\d+(?:\.\d+)?$/;
const fold = (s) => String(s).replace(/[   \s]+/g, " ").replace(/[−–]/g, "-").trim();

/** Terms, R1: a value as an exact decimal string, read through calc-grammar's figure reader, or null when it does not
 *  read as one. A string is read as printed ("1,200.50", "-3", "(40)"); a JavaScript number by its shortest decimal
 *  form (`0.1` is "0.1"), and one whose form is an exponent, or not finite, does not read. A currency mark, a percent,
 *  a qualifier or a range is not a measure's value. Stored values recorded as numbers before T33 are read the same way
 *  (R6: the row is never rewritten). */
export function exactOf(v) {
  let text;
  if (typeof v === "number") {
    if (!Number.isFinite(v)) return null;
    text = String(v);
    if (/e/i.test(text)) return null;
  } else if (typeof v === "string") {
    text = v.trim();
    if (!text) return null;
  } else return null;
  const f = parseFigure(text);
  if (!f || f.refused || f.precision === "range" || f.precision === "approximate" || f.unit !== undefined
      || f.currency !== undefined || f.approximate) return null;
  return signed(f.value, f.sign);
}

/* A value and a sign to a signed decimal string; zero carries no sign. */
function signed(value, sign) {
  const v = String(value);
  return sign === "-" && !/^0(?:\.0+)?$/.test(v) ? `-${v}` : v;
}

/** R5: whether an exact decimal string is zero. */
export const isZero = (d) => typeof d === "string" && /^-?0(?:\.0+)?$/.test(d);

/** A signed decimal string as a calc-grammar figure, with the dimensions given. */
export function figureOf(d, dims = {}) {
  const neg = d.startsWith("-");
  return { value: neg ? d.slice(1) : d, sign: neg && !isZero(d) ? "-" : "+", precision: "exact",
           ...(dims.currency ? { currency: dims.currency } : {}), ...(dims.unit ? { unit: dims.unit } : {}) };
}

/** A calc-grammar figure written back as `{value}` or `{range: {low, high}}`, signed decimal strings, with its
 *  precision, currency and unit as calc-grammar states them. */
export function measureOfFigure(f) {
  const out = f.precision === "range" ? { range: { low: f.low, high: f.high } } : { value: signed(f.value, f.sign) };
  return { ...out, precision: f.precision, ...(f.approximate ? { approximate: true } : {}),
           ...(f.currency !== undefined ? { currency: f.currency } : {}), ...(f.unit !== undefined ? { unit: f.unit } : {}) };
}

/** R1: a signed decimal's order against another, through calc-grammar's own subtraction: -1, 0 or 1. */
export function order(a, b) {
  const d = subtract(figureOf(a), figureOf(b));
  return isZero(d.value) ? 0 : d.sign === "-" ? -1 : 1;
}

/** R2: read one figure as printed in a passage, through calc-grammar's figure reader (its R1–R3). `{ok: true, figure}`
 *  or `{ok: false, why}`. */
export function readFigure(text) {
  if (typeof text !== "string" || !fold(text)) return { ok: false, why: "no figure was stated as read" };
  const f = parseFigure(text);
  if (f.refused) return { ok: false, why: f.why };
  return { ok: true, figure: f };
}

/** R2: whether a passage's text holds the figure as read, white space folded on both sides. Not a parser: the figure's
 *  value is calc-grammar's; this checks only that the record holds what the author says it holds. */
export function passageHolds(text, figure) {
  if (typeof text !== "string" || typeof figure !== "string") return false;
  const f = fold(figure);
  return f !== "" && fold(text).includes(f);
}

/** R2: calc-grammar's exact arithmetic over the operands' figures (`product` is its `multiply`; `ratio` its `divide`
 *  at the stated rounding). `{ok: true, figure}`; `{ok: false, refused, why}` for calc-grammar's refusal (its
 *  `UNIT_MISMATCH`); `{ok: false, code, why}` where the computation lacks an operand (`operand_missing`), takes too
 *  many (`operands_extra`) or cannot be carried out (`not_computable`: a division by zero, which calc-grammar answers
 *  undetermined). `count` counts the operands and needs no figure. */
export function compute(op, figures) {
  const n = figures.length;
  const need = { difference: 2, ratio: 2 }[op];
  if (!OPS.includes(op)) return { ok: false, code: "op_unknown", why: `"${String(op)}" is not one of ${OPS.join(", ")}` };
  if (n === 0 || (need && n < need))
    return { ok: false, code: "operand_missing", why: `a ${op} needs ${need ? `exactly ${need}` : "at least one"} `
                                                    + `operand${need ? "s" : ""}, and ${n} ${n === 1 ? "was" : "were"} given` };
  if (need && n > need)
    return { ok: false, code: "operands_extra", why: `a ${op} takes exactly ${need} operands, and ${n} were given` };
  if (op === "count") return { ok: true, figure: { value: String(n), sign: "+", precision: "exact" } };
  let r;
  if (op === "sum") r = figures.slice(1).reduce((acc, f) => (acc.refused ? acc : add(acc, f)), figures[0]);
  else if (op === "product") r = figures.slice(1).reduce((acc, f) => (acc.refused ? acc : multiply(acc, f)), figures[0]);
  else if (op === "difference") r = subtract(figures[0], figures[1]);
  else r = divide(figures[0], figures[1], RATIO_ROUNDING);
  if (r.refused) return { ok: false, refused: r.refused, why: r.why };
  if (r.undetermined) return { ok: false, code: "not_computable", why: `calc-grammar answers it undetermined: ${r.why}` };
  return { ok: true, figure: r };
}

/** R7: add measures of one state, unit and currency through calc-grammar's `add`. A value is the range [value, value];
 *  the total is a value when every part gave one, else a range. `null` for an empty list. */
export function addMeasures(measures) {
  if (!measures.length) return null;
  const lows = []; const highs = []; let ranged = false;
  for (const m of measures) {
    if (m.range) ranged = true;
    lows.push(m.range ? m.range.low : m.value);
    highs.push(m.range ? m.range.high : m.value);
  }
  const total = (xs) => {
    let acc = figureOf(xs[0]);
    for (const x of xs.slice(1)) acc = add(acc, figureOf(x));
    return signed(acc.value, acc.sign);
  };
  const low = total(lows); const high = total(highs);
  return ranged ? { range: { low, high } } : { value: low };
}
