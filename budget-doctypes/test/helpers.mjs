/* Test support: the two views, the supplied texts and the contexts a content
 * type is handed.
 *
 * The views are `jurisdictions.combine` of the first profile and of the test
 * profile. The keys this module reads (QUESTION J1: `vocabulary`'s
 * `financial_report_titles`, `budget_book_titles`, `financial_headings`,
 * `fiscal_year_forms`, `budget_headers`, and `classification_schemes` with code
 * forms) are added here only where the profile does not yet hold them, so once
 * the jurisdictions job adds them the profile's own data is what is tested. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { combine } from "../../jurisdictions/index.mjs";
import { flattenText, makeLocator } from "../../docprofile/registry.mjs";
import { csvEntry } from "../../bio-plane/src/csv.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const fixture = (name) => join(here, "fixtures", name);

const P = (re, basis) => ({ pattern: { re, flags: "i" }, basis });
const H = (column, re, basis) => ({ column, pattern: { re, flags: "i" }, basis });

/* The first profile's words, from the measured documents (money-people §1c, §2,
   §3, §4, §7; legistar-events §3). */
const M = "measures-T33/money-people.md";
const FIRST = {
  vocabulary: {
    financial_report_titles: [P(String.raw`(?:annual\s+)?comprehensive\s+(?:annual\s+)?financial\s+report`, `${M} §1c`)],
    budget_book_titles: [P(String.raw`(?:adopted|proposed|midcycle)\s+policy\s+budget`, `${M} §4`)],
    financial_headings: [
      P(String.raw`^statement\s+of\s+(?:net\s+position|activities|cash\s+flows|revenues)`, `${M} §4, §7`),
      P(String.raw`^balance\s+sheet`, `${M} §7`),
      P(String.raw`budget\s+and\s+actual`, `${M} §7`),
      P(String.raw`^schedule\s+\d+$`, `${M} §7`),
      P(String.raw`^summary\s+table\s+by\s+fund`, `${M} §7`),
      P(String.raw`^citywide\s+classi(?:fi|.)?cation\s+summary`, `${M} §7`),
      P(String.raw`^expenditures\s+by\s+fund$`, `${M} §7`),
      P(String.raw`^general\s+purpose\s+fund\s+revenue$`, `${M} §4`),
      P(String.raw`^significant\s+(?:budgetary\s+)?changes`, `${M} §4`),
    ],
    fiscal_year_forms: [
      P(String.raw`\bFY\s?\d{2,4}(?:-\d{2,4})?(?:-[A-Za-z]+)?\b`, `${M} §4`),
      P(String.raw`\bjune\s+30,\s+\d{4}\b`, `${M} §1a`),
    ],
    budget_headers: [
      H("fund", String.raw`^fund(?:_code)?$`, `${M} §2`),
      H("org", String.raw`^org(?:_code)?$`, `${M} §2`),
      H("department", String.raw`^department$`, "measures-T33/legistar-events.md §3"),
      H("program", String.raw`^(?:prog|program(?:_code)?)$`, `${M} §2`),
      H("project", String.raw`^project(?:_code)?$`, `${M} §2`),
      H("account", String.raw`^(?:acct|account(?:_code)?)$`, `${M} §2`),
      H("amount", String.raw`^(?:amount|amt|fy\d{2}_\d{2}_[a-z_0-9]+)$`, `${M} §2`),
      H("period", String.raw`^(?:budget|budget_year_name)$`, `${M} §2`),
    ],
  },
  classification_schemes: [
    { scheme: "fund", label: "fund", kind: "fund", forms: [{ re: String.raw`FD_\d{4}|\d{4}` }], basis: `${M} §3` },
    { scheme: "org", label: "organisation", kind: "organisation", forms: [{ re: String.raw`OR_\d{5}|\d{2,5}` }], basis: `${M} §3` },
    { scheme: "program", label: "program", kind: "program", forms: [{ re: String.raw`PG_[A-Z]{2}\d{2}|[A-Z]{2}\d{2}` }], basis: `${M} §3` },
    { scheme: "project", label: "project", kind: "project", forms: [{ re: String.raw`PJ_\d{7}|\d{7}` }], basis: `${M} §3` },
    { scheme: "account", label: "account", kind: "account", forms: [{ re: String.raw`\d{5}` }], basis: `${M} §3` },
  ],
};

/* The test profile's words: a fictional jurisdiction's, as every test-profile
   fact is (jurisdictions R45). */
const TEST = {
  vocabulary: {
    financial_report_titles: [P(String.raw`annual\s+financial\s+statements`, "TEST")],
    budget_book_titles: [P(String.raw`(?:approved|recommended)\s+operating\s+budget`, "TEST")],
    financial_headings: [P(String.raw`^exhibit\s+[A-Z]\b`, "TEST"), P(String.raw`^fund\s+position$`, "TEST")],
    fiscal_year_forms: [P(String.raw`\bYE\s?\d{4}\b`, "TEST")],
    budget_headers: [
      H("fund", String.raw`^fund$`, "TEST"), H("org", String.raw`^cost centre$`, "TEST"),
      H("department", String.raw`^division$`, "TEST"), H("department_code", String.raw`^division code$`, "TEST"),
      H("program", String.raw`^programme$`, "TEST"), H("account", String.raw`^object$`, "TEST"),
      H("amount", String.raw`^amount$`, "TEST"), H("period", String.raw`^year$`, "TEST"), H("phase", String.raw`^stage$`, "TEST"),
    ],
  },
  classification_schemes: [
    { scheme: "fund", label: "fund", kind: "fund", forms: [{ re: String.raw`F-\d{3}` }], basis: "TEST" },
    { scheme: "cc", label: "cost centre", kind: "organisation", forms: [{ re: String.raw`CC\d{4}` }], basis: "TEST" },
    { scheme: "div", label: "division", kind: "department", forms: [{ re: String.raw`DV\d{2}` }], basis: "TEST" },
    { scheme: "obj", label: "object", kind: "account", forms: [{ re: String.raw`\d{4}` }], basis: "TEST" },
  ],
};

function withKeys(id, extra) {
  const r = combine([id]);
  if (!r.ok) throw new Error(`combine(${id}) failed: ${JSON.stringify(r)}`);
  const view = { ...r.view, vocabulary: { ...(r.view.vocabulary || {}) } };
  for (const [k, v] of Object.entries(extra.vocabulary)) if (!Array.isArray(view.vocabulary[k]) || !view.vocabulary[k].length) view.vocabulary[k] = v;
  if (!Array.isArray(view.classification_schemes) || !view.classification_schemes.some((s) => Array.isArray(s.forms)))
    view.classification_schemes = extra.classification_schemes;
  return view;
}

export const firstView = () => withKeys("oakland-alameda", FIRST);
export const testView = () => withKeys("test-port-ellery", TEST);

/** A measured PDF fixture, as the supplied text (I2) of the pages chosen. */
export function pdfFixture(key, { tier1 = false, pages = null } = {}) {
  const f = JSON.parse(readFileSync(fixture(`${key}.json`), "utf8"));
  let list = tier1 ? f.tier1.pages : f.pages;
  if (pages) list = list.filter((p) => pages.includes(p.page + 1));
  const want = new Set(list.map((p) => p.page));
  const supplied = {
    container: "pdf",
    pages: list.map((p) => ({ ...p, undetermined: p.undetermined || [] })),
    undetermined: list.flatMap((p) => p.undetermined || []),
    images: (f.images || []).filter((im) => want.has(im.page)),
  };
  supplied.document = supplied.pages.map((p) => p.text).filter((t) => t.length).join("\n");
  return { fixture: f, supplied };
}

/** The context `readText` hands a content type: the flattened text, the
 *  locator over its pages, the view, and the supplied text itself. */
export function ctxFor(supplied, view, extra = {}) {
  const flat = flattenText(supplied);
  return { text: flat.text, locate: makeLocator(flat.segments), view, supplied, ...extra };
}

/** A CSV as `office-readers` supplies it: `csvEntry.text()`, its sheet with
 *  its typed cells (R30); `cells: false` takes them away, as a supplied text
 *  without cells would come. */
export async function csvSupplied(textOrPath, { cells = true } = {}) {
  const text = textOrPath.includes("\n") ? textOrPath : readFileSync(textOrPath, "utf8");
  const r = await csvEntry.text(new TextEncoder().encode(text));
  const sheet = { ...r.sheets[0] };
  if (!cells) delete sheet.cells;
  return { ...r, sheets: [sheet] };
}
