/* consequences' figures (requirements: `build/requirements/consequences.md`, R2, R4, R7; Suggestions: "A parser of
 * figures is this module's"). Pure; nothing here throws or reads the record.
 *
 * A FIGURE is a number as a member or a machine read it in a passage: `1,234,567`, `$4.2 million`, `(3,400)`, `12.5`.
 * It is parsed exactly (its digits and a decimal exponent, never a float of the author's), so `1.2 million` is
 * 1200000 and not 1199999.9999. The passage must hold it (`passageHolds`), compared with white space folded: the
 * value of a computed part rests on what the record holds, never on the author's arithmetic or the author's word. */

/** R2: the operations a computation may name. */
export const OPS = Object.freeze(["sum", "difference", "count", "product", "ratio"]);

const SCALES = Object.freeze({ thousand: 3, k: 3, million: 6, m: 6, mm: 6, mn: 6, billion: 9, bn: 9, b: 9, trillion: 12,
  tn: 12 });
const FIGURE = /^(-|\()?\s*([$€£¥])?\s*(-)?\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?|\.\d+)\s*([a-z]+)?\s*(\))?$/i;

const fold = (s) => String(s).replace(/[   \s]+/g, " ").replace(/[−–]/g, "-").trim();

/** Parse one figure as read: `{ok: true, number, decimals}` or `{ok: false, why}`. */
export function parseFigure(figure) {
  if (typeof figure !== "string" || !fold(figure)) return { ok: false, why: "no figure was stated as read" };
  const m = FIGURE.exec(fold(figure));
  if (!m) return { ok: false, why: `"${fold(figure).slice(0, 80)}" is not a figure this module reads (digits, with `
                                     + "thousands separators, a decimal point, a currency sign or a scale word)" };
  const [, lead, , minus, digits, word, close] = m;
  if ((lead === "(") !== (close === ")")) return { ok: false, why: "an opening parenthesis is not closed, or the reverse" };
  if (lead === "-" && minus) return { ok: false, why: "the figure carries two minus signs" };
  let exp = 0;
  if (word) {
    const w = word.toLowerCase();
    if (!(w in SCALES)) return { ok: false, why: `"${word}" is not a scale word this module reads` };
    exp = SCALES[w];
  }
  const plain = digits.replace(/,/g, "");
  const decimals = Math.max(0, (plain.split(".")[1] || "").length - exp);
  const number = Number(`${plain}e${exp}`) * (lead || minus ? -1 : 1);
  if (!Number.isFinite(number)) return { ok: false, why: "the figure is not a finite number" };
  return { ok: true, number: Object.is(number, -0) ? 0 : number, decimals };
}

/** Whether a passage's text holds the figure as read, white space folded on both sides. */
export function passageHolds(text, figure) {
  if (typeof text !== "string" || typeof figure !== "string") return false;
  const f = fold(figure);
  return f !== "" && fold(text).includes(f);
}

/* A sum or difference to the decimals its operands carry, so 0.1 + 0.2 is 0.3; a product or ratio to fifteen
   significant digits, which is what a double holds. */
const toDecimals = (x, d) => Number(x.toFixed(Math.min(20, d)));
const toPrecision = (x) => Number(x.toPrecision(15));

/** R2: the module's own arithmetic over parsed operands (`[{number, decimals}]`). `{ok: true, value}` or
 *  `{ok: false, code, why}`, where the code is R4's: `operand_missing` when the computation lacks an operand. */
export function compute(op, operands) {
  const n = operands.length;
  const need = { difference: 2, ratio: 2 }[op];
  if (!OPS.includes(op)) return { ok: false, code: "op_unknown", why: `"${String(op)}" is not one of ${OPS.join(", ")}` };
  if (n === 0 || (need && n < need))
    return { ok: false, code: "operand_missing", why: `a ${op} needs ${need ? `exactly ${need}` : "at least one"} `
                                                    + `operand${need ? "s" : ""}, and ${n} ${n === 1 ? "was" : "were"} given` };
  if (need && n > need)
    return { ok: false, code: "operands_extra", why: `a ${op} takes exactly ${need} operands, and ${n} were given` };
  if (op === "count") return { ok: true, value: n };
  const nums = operands.map((o) => o.number);
  const dec = Math.max(0, ...operands.map((o) => o.decimals || 0));
  if (op === "sum") return { ok: true, value: toDecimals(nums.reduce((a, b) => a + b, 0), dec) };
  if (op === "difference") return { ok: true, value: toDecimals(nums[0] - nums[1], dec) };
  if (op === "product") return { ok: true, value: toPrecision(nums.reduce((a, b) => a * b, 1)) };
  if (nums[1] === 0) return { ok: false, code: "division_by_zero", why: "a ratio's second operand is zero" };
  return { ok: true, value: toPrecision(nums[0] / nums[1]) };
}

/** R7: add measures of one state, unit and currency. A value is the range [value, value]; the total is a value when
 *  every part gave one, else a range. `null` for an empty list. */
export function addMeasures(measures) {
  if (!measures.length) return null;
  let low = 0; let high = 0; let dec = 0; let ranged = false;
  for (const m of measures) {
    const lo = m.range ? m.range.low : m.value;
    const hi = m.range ? m.range.high : m.value;
    if (m.range) ranged = true;
    dec = Math.max(dec, decimalsOf(lo), decimalsOf(hi));
    low += lo; high += hi;
  }
  low = toDecimals(low, dec); high = toDecimals(high, dec);
  return ranged ? { range: { low, high } } : { value: low };
}

function decimalsOf(x) {
  const s = String(x);
  if (/e/i.test(s)) return 0;
  return (s.split(".")[1] || "").length;
}
