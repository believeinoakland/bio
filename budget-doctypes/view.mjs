/* What this module reads from the jurisdiction view (R12): every title, heading,
 * header word and code form is the profile's, never this file's.
 *
 * The keys (QUESTION J1 to BOB; `jurisdictions` R6 and R52 as this job reads
 * them): `vocabulary.financial_report_titles`, `budget_book_titles`,
 * `financial_headings` and `fiscal_year_forms`, each `{pattern, basis}`;
 * `vocabulary.budget_headers`, each `{column, pattern, basis}`; and
 * `classification_schemes`, each `{scheme, kind, forms: [{re, flags}]}`, the
 * code forms of a budget's classification. A view without a key reads as an
 * empty list, and every reader then says it found nothing for want of it. */
import { readerView, vocabulary, vocabRegex } from "../docprofile/registry.mjs";

export const KEYS = Object.freeze({
  REPORT_TITLES: "financial_report_titles",
  BOOK_TITLES: "budget_book_titles",
  HEADINGS: "financial_headings",
  FISCAL_YEARS: "fiscal_year_forms",
  HEADERS: "budget_headers",
});

/** The columns a budget line-item table's header words may name (R7). */
export const COLUMNS = Object.freeze(["fund", "org", "department", "department_code", "program", "project",
                                      "account", "amount", "period", "phase"]);

/** Compiled patterns of one vocabulary key, case-insensitive as a heading is
 *  printed in any case, and white-space tolerant: a text layer that letter-spaces
 *  a heading ("Gove rnme nt", money-people §1c) still matches. */
export function patterns(ctx, key) {
  const out = [];
  for (const e of vocabulary(ctx, key)) {
    const re = vocabRegex(e.pattern, null, "i");
    if (re) out.push({ re, entry: e });
  }
  return out;
}

/** The first pattern of `key` matching `line`, as `{text, entry}`, or null. A
 *  line is tried as printed and with its spaces removed, so a letter-spaced
 *  heading matches a pattern written with or without spaces. */
export function matchIn(ctx, key, line) {
  const s = String(line);
  for (const p of patterns(ctx, key)) {
    const m = p.re.exec(s);
    if (m) return { text: m[0].trim(), entry: p.entry };
  }
  const squeezed = s.replace(/\s+/g, "");
  for (const p of patterns(ctx, key)) {
    let re;
    try { re = new RegExp(p.re.source.replace(/\\s[+*]?|\s+/g, ""), p.re.flags); } catch { continue; }
    if (re.test(squeezed)) return { text: s.trim(), entry: p.entry };
  }
  return null;
}

/** The view's budget header words, `[{column, re}]`, in the profile's order. */
export function headerWords(ctx) {
  const out = [];
  for (const e of vocabulary(ctx, KEYS.HEADERS)) {
    if (!COLUMNS.includes(e.column)) continue;
    const re = vocabRegex(e.pattern, null, "i");
    if (re) out.push({ column: e.column, re });
  }
  return out;
}

/* `jurisdictions` R52 names a classification's kind `organisation`; R7 calls
   the column `org`. */
const KIND_OF = { fund: "fund", org: "organisation", program: "program", project: "project", account: "account",
                  department_code: "department" };

/** The code forms of the view's classification scheme for one column, each
 *  `{scheme, re, label}`. */
export function codeForms(ctx, column) {
  const kind = KIND_OF[column];
  const schemes = readerView(ctx).classification_schemes;
  const out = [];
  if (!kind || !Array.isArray(schemes)) return out;
  for (const s of schemes) {
    if (!s || s.kind !== kind || !Array.isArray(s.forms)) continue;
    for (const f of s.forms) {
      const re = vocabRegex(f, (src) => `^(?:${src})$`, "");
      if (re) out.push({ scheme: s.scheme || null, re, label: f.re });
    }
  }
  return out;
}
