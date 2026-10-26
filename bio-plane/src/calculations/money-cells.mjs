/* calculations' reading of a money cell (requirements: `build/requirements/calculations.md`, R49; fix round 9, G182; S-30). A cell is read as it
 * says, never guessed: a percentage is not an amount; a dash states none; a fiscal-year label names a year and is no amount; a cell's own
 * currency mark is its own; separators follow the source's stated locale, else the team's, and with neither a figure the two conventions would
 * read differently is stated undetermined. The figure itself is `calc-grammar`'s: this file only turns the cell's digits into the plain form
 * `parseFigure` reads, so the arithmetic and the exactness stay there. Pure: it reads no record and no clock. */

import { parseFigure } from "../calc-grammar/index.mjs";
import { localize } from "../setup-words/index.mjs";

const SPACES = /[    ]/;
const TOKEN = /\d[\d.,'’    ]*\d|\d/g;
const DASHES = /^[-‐-―−]+$/;
const FISCAL_YEAR = /^FY\s*(\d{4})(?:\s*[-–/]\s*(\d{2}|\d{4}))?$/i;

/** R49: the fiscal key a fiscal-year label names (`FY2025`, `FY 2025-26`), else null. */
export function fiscalKeyOf(text) {
  const m = FISCAL_YEAR.exec(typeof text === "string" ? text.trim() : "");
  return m ? { key: `FY${m[1]}${m[2] ? `-${m[2]}` : ""}`, year: Number(m[1]) } : null;
}

/** R49: the group and decimal characters of a BCP 47 locale (`Intl`'s, no table of places here), or null when the tag is not one. */
export function separatorsOf(tag) {
  try {
    const parts = new Intl.NumberFormat(Intl.getCanonicalLocales(tag)[0]).formatToParts(1234567.89);
    const group = (parts.find((p) => p.type === "group") || {}).value || "";
    const decimal = (parts.find((p) => p.type === "decimal") || {}).value || ".";
    return { group: SPACES.test(group) ? " " : group, decimal };
  } catch { return null; }
}

const grouped = (digits) => /^\d{1,3}(?: \d{3})+$/.test(digits) || /^\d+$/.test(digits);

/* One number token to `{plain}` (digits and an optional point), `{ambiguous: [a, b]}` or `{invalid}`. `seps` is the locale's, or null. */
function plainNumber(token, seps) {
  const t = token.replace(/['’]/g, " ").replace(/[   ]/g, " ");
  const kinds = [...new Set(t.replace(/[\d ]/g, ""))];
  const hasSpace = t.includes(" ");
  if (kinds.length > 1) {
    /* both a point and a comma: the last is the decimal, the other the group */
    if (kinds.length > 2) return { invalid: true };
    const dec = t[Math.max(t.lastIndexOf("."), t.lastIndexOf(","))];
    const grp = dec === "." ? "," : ".";
    if (t.split(dec).length !== 2) return { invalid: true };
    const [i, f] = t.split(dec);
    if (seps && (seps.decimal !== dec || (seps.group !== grp && seps.group !== " "))) return { invalid: true };
    const ip = i.replace(/ /g, "");
    if (!/^\d{1,3}(?:[. ,]\d{3})+$/.test(i.replace(/[.,]/g, grp)) && ip.length > 3 && !/^\d+$/.test(i)) return { invalid: true };
    if (i.split(grp).some((g, k) => (k === 0 ? g.length < 1 || g.length > 3 : g.length !== 3))) return { invalid: true };
    if (!/^\d+$/.test(f)) return { invalid: true };
    return { plain: `${i.split(grp).join("").replace(/ /g, "")}.${f}` };
  }
  const c = kinds[0] || null;
  if (c === null) {
    if (!hasSpace) return { plain: t };
    return grouped(t) && /^\d{1,3}(?: \d{3})+$/.test(t) ? { plain: t.replace(/ /g, "") } : { invalid: true };
  }
  /* one kind of mark, possibly with spaces: spaces are groups, so a space with a point or comma means the mark is the decimal */
  const parts = t.split(c);
  if (hasSpace) {
    if (parts.length !== 2 || !/^\d{1,3}(?: \d{3})*$/.test(parts[0]) || !/^\d+$/.test(parts[1])) return { invalid: true };
    if (seps && seps.decimal !== c) return { invalid: true };
    return { plain: `${parts[0].replace(/ /g, "")}.${parts[1]}` };
  }
  if (parts.length > 2) {
    if (seps && seps.group !== c) return { invalid: true };
    return parts.every((g, k) => (k === 0 ? g.length >= 1 && g.length <= 3 && g[0] !== "0" : g.length === 3)) ? { plain: parts.join("") } : { invalid: true };
  }
  const [before, after] = parts;
  if (after === "" || before === "") return before === "" && /^\d+$/.test(after) && c === "." ? { plain: `0.${after}` } : { invalid: true };
  const asGroup = after.length === 3 && before.length <= 3 && before[0] !== "0";
  if (seps) {
    if (c === seps.group) return asGroup ? { plain: before + after } : { invalid: true };
    if (c === seps.decimal) return { plain: `${before}.${after}` };
    return { invalid: true };
  }
  if (!asGroup) return { plain: `${before}.${after}` };
  return { ambiguous: [`${before}${after}`, `${before}.${after}`] };
}

/** R49: one cell read as an amount. `{figure, as_read}` (the figure as `parseFigure` states it, without `as_read`), or `{refused, detail}`
 *  with `refused` one of AMOUNT_NOT_READ, AMOUNT_IS_A_PERCENTAGE, AMOUNT_NONE_STATED, AMOUNT_IS_A_YEAR_LABEL, AMOUNT_LOCALE_UNDETERMINED.
 *  `locale` is a BCP 47 tag (the source's stated one, else the team's) or null. */
export function readAmount(raw, { locale = null } = {}) {
  const asRead = String(raw ?? "");
  const t = asRead.replace(/[   ]/g, " ").trim();
  if (DASHES.test(t))
    return { refused: "AMOUNT_NONE_STATED", detail: localize("calculations.money_cells.cell_states_none", "the cell states none (a dash), which is not an amount; no money fact is written for it") };
  const fy = fiscalKeyOf(t);
  if (fy) return { refused: "AMOUNT_IS_A_YEAR_LABEL", detail: localize("calculations.money_cells.cell_names_year", "the cell names the fiscal year {key}, which is not an amount", { key: fy.key }), year: fy.year };
  const seps = locale ? separatorsOf(locale) : null;
  const tokens = t.match(TOKEN) || [];
  let text = t;
  if (tokens.length === 1) {
    const n = plainNumber(tokens[0], seps);
    if (n.invalid)
      return { refused: "AMOUNT_NOT_READ", detail: locale
        ? localize("calculations.money_cells.not_read_in_locale", "\"{text}\" is not a figure this module reads in the locale {locale}", { text: t.slice(0, 80), locale })
        : localize("calculations.money_cells.not_read", "\"{text}\" is not a figure this module reads", { text: t.slice(0, 80) }) };
    if (n.ambiguous)
      return { refused: "AMOUNT_LOCALE_UNDETERMINED", readings: n.ambiguous, detail: localize("calculations.money_cells.locale_undetermined",
        "\"{text}\" reads as {a} or as {b} by the separators of the two conventions, and neither the source nor the team states a locale, so it is not guessed", { text: t.slice(0, 80), a: n.ambiguous[0], b: n.ambiguous[1] }) };
    text = t.replace(tokens[0], n.plain);
  }
  const f = parseFigure(text);
  if (f.refused) return { refused: "AMOUNT_NOT_READ", detail: f.why };
  if (f.unit === "percent")
    return { refused: "AMOUNT_IS_A_PERCENTAGE", detail: localize("calculations.money_cells.cell_is_percentage", "\"{text}\" is a percentage, not an amount of money", { text: t.slice(0, 80) }) };
  const { as_read: _a, ...figure } = f;
  return { figure, as_read: asRead };
}
