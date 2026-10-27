/* register-readers R10: a piece's row count estimated from a sample of it, always stated as an estimate. */

const isObj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const positive = (n) => typeof n === "number" && Number.isFinite(n) && n > 0;
const NOT_STATED = Object.freeze({ value: null, basis: "not_stated" });

/** R10. `estimate(sample, totals)`: `sample` `{bytes, rows, spread}` (`spread` the sampled windows, each `{bytes, rows}`),
 *  `totals` `{bytes}`. Answers `{rows: {value, low, high, basis: "estimated"}, bytes_per_row}`, `low` and `high` from the
 *  windows' least and greatest bytes per row; `{rows: {value: null, basis: "not_stated"}, bytes_per_row: null}` with no
 *  sample or no total. Never a count. Pure; never throws. */
export function estimate(sample, totals) {
  try {
    if (!isObj(sample) || !positive(sample.bytes) || !positive(sample.rows) || !isObj(totals) || !positive(totals.bytes)) {
      return { rows: { ...NOT_STATED }, bytes_per_row: null };
    }
    const perRow = sample.bytes / sample.rows;
    if (sample.bytes >= totals.bytes) {
      const v = Math.round(sample.rows * (totals.bytes / sample.bytes));
      return { rows: { value: v, low: v, high: v, basis: "estimated" }, bytes_per_row: perRow };
    }
    const windows = (Array.isArray(sample.spread) ? sample.spread : []).filter((w) => isObj(w) && positive(w.bytes) && positive(w.rows));
    const rates = windows.length ? windows.map((w) => w.bytes / w.rows) : [perRow];
    const least = Math.min(...rates), most = Math.max(...rates);
    return {
      rows: { value: Math.round(totals.bytes / perRow), low: Math.floor(totals.bytes / most), high: Math.ceil(totals.bytes / least), basis: "estimated" },
      bytes_per_row: perRow,
    };
  } catch {
    return { rows: { ...NOT_STATED }, bytes_per_row: null };
  }
}
