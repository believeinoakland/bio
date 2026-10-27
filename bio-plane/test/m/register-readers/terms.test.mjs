/* register-readers R5–R8: a row's search terms, the closed filter, whether a filter may be watched unattended, and a
 * filter offered from a project's facts. Ids are recognised in id-spaces' own test view. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { indexTerms, validateFilter, matches, filterFingerprint, autoWatchable, prefillFrom, NAMES_MAX, IDS_MAX } from "../../../src/register-readers/index.mjs";
import { viewOf, LAKESHORE, withNewSpaces } from "../id-spaces/fixtures.mjs";
import { CONTRIB, LICENCES } from "./fixtures.mjs";

const VIEW = withNewSpaces(viewOf(LAKESHORE));
const row = (over = {}) => ({ Tran_ID: "T1", Filer_ID: "FILER0000001", Contributor: "Rosa Martinez", Employer: "Harbor Bakery", City: "Riverbend",
  State: "XS", Zip: "94612", Amount: "100.00", Date: "01/15/2025", Memo: "", Form: "460", ...over });
const terms = (over) => indexTerms(row(over), CONTRIB);
const refused = (filter, code, field, def = CONTRIB) => assert.deepEqual(validateFilter(filter, def, VIEW), { ok: false, code, field }, JSON.stringify(filter));

/* ------------------------------------------------------------------ R5 */

test("R5 \"MARTINEZ, ROSA M\" and \"Rosa Martinez\" give equal token sets; diacritics, case and punctuation fold; suffixes and honorifics stay", () => {
  assert.deepEqual(terms({ Contributor: "MARTINEZ, ROSA M" }).name_tokens, terms().name_tokens);
  assert.deepEqual(terms().name_tokens, ["martinez", "rosa"]);
  assert.deepEqual(terms({ Contributor: "Peña-Núñez, José" }).name_tokens, ["jose", "penanunez"]);
  assert.deepEqual(terms({ Contributor: "Dr. Robert Smith, Jr." }).name_tokens, ["dr", "jr", "robert", "smith"]);
  assert.deepEqual(terms({ Contributor: "Smith III, Mrs Ann" }).name_tokens, ["ann", "iii", "mrs", "smith"]);
  assert.deepEqual(terms({ Employer: "Ridge Co, Inc." }).org_tokens, ["co", "inc", "ridge"]);
});

test("R5 an amount is an exact decimal in the column's currency; parentheses or a leading minus are negative", () => {
  assert.deepEqual(terms({ Amount: "(1,000.00)" }).amount, { units: -100000, scale: 2, currency: "USD" });
  assert.deepEqual(terms({ Amount: "-75" }).amount, { units: -75, scale: 0, currency: "USD" });
  assert.deepEqual(terms({ Amount: "$1,234.5" }).amount, { units: 12345, scale: 1, currency: "USD" });
  for (const bad of ["12,34", "1.2.3", "ten", "(5", "--5", "1,0000"]) {
    const t = terms({ Amount: bad });
    assert.equal(t.amount, null, bad);
    assert.deepEqual(t.undetermined, ["Amount"], bad);
  }
});

test("R5 a date is a civil date by the column's date_format; \"13/45/2026\" is undetermined", () => {
  assert.equal(terms().date, "2025-01-15");
  const t = terms({ Date: "13/45/2026" });
  assert.equal(t.date, null);
  assert.deepEqual(t.undetermined, ["Date"]);
  assert.equal(terms({ Date: "02/30/2025" }).date, null);
  const iso = { ...CONTRIB, columns: CONTRIB.columns.map((c) => (c.role === "date" ? { ...c, date_format: "YYYY-MM-DD*" } : c)) };
  assert.equal(indexTerms(row({ Date: "2025-03-04T00:00:00.000" }), iso).date, "2025-03-04");
  const loose = { ...CONTRIB, columns: CONTRIB.columns.map((c) => (c.role === "date" ? { ...c, date_format: "M/D/YYYY" } : c)) };
  assert.equal(indexTerms(row({ Date: "3/4/2025" }), loose).date, "2025-03-04");
});

test("R5 filer id and form are trimmed exact; the place is case-folded with zip5 the ZIP's first five digits", () => {
  const t = terms({ Filer_ID: "  FILER0000001 ", Form: " 460 ", City: "RIVERBEND", State: "xs", Zip: "94612-1234" });
  assert.equal(t.filer_id, "FILER0000001");
  assert.equal(t.form, "460");
  assert.deepEqual(t.place, { city: "riverbend", state: "xs", zip5: "94612" });
  assert.equal(terms({ Zip: "946121234" }).place.zip5, "94612");
  assert.deepEqual(terms({ Zip: "9461" }).undetermined, ["Zip"]);
});

test("R5 no phonetic, nickname or fuzzy matching: \"Bob\" does not match \"Robert\"", () => {
  assert.equal(matches(row({ Contributor: "Robert Smith" }), { names: ["Bob Smith"] }, CONTRIB), false);
  assert.equal(matches(row({ Contributor: "Robert Smith" }), { names: ["Robert Smith"] }, CONTRIB), true);
});

test("R5 control: a clean row has no undetermined", () => {
  assert.deepEqual(terms().undetermined, []);
});

/* ------------------------------------------------------------------ R6 */

test("R6 each refusal by name", () => {
  refused({ everyone: true }, "FILTER_CRITERION_UNKNOWN", "everyone");
  refused({ licence_numbers: ["LICA123456"] }, "FILTER_ROLE_ABSENT", "licence_numbers");
  refused({ amount: { min: "5" } }, "FILTER_ROLE_ABSENT", "amount", LICENCES);
  refused({ date: { from: "2025-01-01" } }, "FILTER_ROLE_ABSENT", "date", LICENCES);
  refused({ names: ["Ann"] }, "FILTER_ROLE_ABSENT", "names", LICENCES);
  refused({ names: ["R"] }, "FILTER_VALUE_INVALID", "names");
  refused({ names: "Rosa" }, "FILTER_VALUE_INVALID", "names");
  refused({ amount: { min: "ten" } }, "FILTER_VALUE_INVALID", "amount");
  refused({ amount: { min: "500", max: "5" } }, "FILTER_VALUE_INVALID", "amount");
  refused({ date: { from: "2025-02-30" } }, "FILTER_VALUE_INVALID", "date");
  refused({ date: { from: "2025-06-01", to: "2025-01-01" } }, "FILTER_VALUE_INVALID", "date");
  refused({ filer_ids: ["12345"] }, "FILTER_VALUE_INVALID", "filer_ids");
  refused({ places: [{ zip5: "9461" }] }, "FILTER_VALUE_INVALID", "places");
  for (const p of ["Mart*", "Ros?", "^Rosa.*$", "R[oa]sa", "Rosa|Wei", "%Rosa%"]) refused({ names: [p] }, "FILTER_PATTERN_REFUSED", "names");
  refused({ filer_ids: ["FILER*"] }, "FILTER_PATTERN_REFUSED", "filer_ids");
  refused({ names: Array.from({ length: NAMES_MAX + 1 }, (_, i) => `Name ${i}`) }, "FILTER_TOO_LARGE", "names");
  refused({ organizations: Array.from({ length: NAMES_MAX + 1 }, (_, i) => `Org ${i}`) }, "FILTER_TOO_LARGE", "organizations");
  refused({ filer_ids: Array.from({ length: IDS_MAX + 1 }, (_, i) => `FILER${String(i).padStart(7, "0")}`) }, "FILTER_TOO_LARGE", "filer_ids");
  assert.equal(validateFilter({ names: Array.from({ length: NAMES_MAX }, (_, i) => `Name ${i}`) }, CONTRIB, VIEW).ok, true, "1,000 names is the most, not over");
});

test("R6 \"MARTINEZ ROSA\" matches \"Rosa Martinez\" and not \"Rosa Martin\"; a list of two names holds on either", () => {
  const f = { names: ["MARTINEZ ROSA"] };
  assert.equal(matches(row(), f, CONTRIB), true);
  assert.equal(matches(row({ Contributor: "Rosa Martin" }), f, CONTRIB), false);
  const two = { names: ["Wei Chen", "Rosa Martinez"] };
  assert.equal(matches(row(), two, CONTRIB), true);
  assert.equal(matches(row({ Contributor: "Chen, Wei" }), two, CONTRIB), true);
  assert.equal(matches(row({ Contributor: "Ada Okafor" }), two, CONTRIB), false);
});

test("R6 every present criterion must hold; amounts and dates by their exact values; places by any item", () => {
  const f = { names: ["Rosa Martinez"], amount: { min: "100", max: "100.00" }, date: { from: "2025-01-15", to: "2025-01-15" }, filer_ids: ["FILER0000001"],
    forms: ["460"], places: [{ zip5: "00000" }, { city: "riverbend", state: "XS" }], organizations: ["harbor bakery"] };
  assert.equal(validateFilter(f, CONTRIB, VIEW).ok, true);
  assert.equal(matches(row(), f, CONTRIB), true);
  assert.equal(matches(row({ Amount: "100.01" }), f, CONTRIB), false);
  assert.equal(matches(row({ Date: "01/16/2025" }), f, CONTRIB), false);
  assert.equal(matches(row({ Filer_ID: "FILER0000002" }), f, CONTRIB), false);
  assert.equal(matches(row({ City: "Lowfield" }), f, CONTRIB), false);
  assert.equal(matches(row({ Amount: "n/a" }), { amount: { min: "1" } }, CONTRIB), false, "an undetermined amount does not hold");
});

test("R6 one filter in two orders has one fingerprint; a different filter another", () => {
  const a = filterFingerprint({ names: ["Rosa Martinez", "Wei Chen"], amount: { min: "5", max: "10" }, forms: ["460", "497"] });
  const b = filterFingerprint({ forms: ["497", "460", "460"], amount: { max: "10", min: "5" }, names: ["CHEN, WEI", "martinez rosa"] });
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.equal(a, b);
  assert.notEqual(a, filterFingerprint({ names: ["Rosa Martinez"] }));
  assert.equal(filterFingerprint(null), null);
});

test("R6 the empty filter is the whole register and matches every row", () => {
  assert.deepEqual(validateFilter({}, CONTRIB, VIEW), { ok: true, filter: {} });
  for (const over of [{}, { Amount: "junk" }, { Contributor: "" }]) assert.equal(matches(row(over), {}, CONTRIB), true);
});

test("R6 validateFilter, matches and filterFingerprint never throw", () => {
  for (const x of [null, undefined, 5, "x", [], new Uint8Array(0), { names: [null] }, { amount: null }, { places: [null] }]) {
    assert.equal(typeof validateFilter(x, CONTRIB, VIEW).ok, "boolean");
    assert.equal(typeof matches(x, x, x), "boolean");
    filterFingerprint(x);
  }
});

test("R6 control: a filter naming an id in its scheme's form validates", () => {
  assert.deepEqual(validateFilter({ filer_ids: ["FILER0000001"] }, CONTRIB, VIEW), { ok: true, filter: { filer_ids: ["FILER0000001"] } });
  assert.equal(validateFilter({ docket_numbers: ["HC24-000123"], licence_numbers: ["LICA123456"] }, LICENCES, VIEW).ok, true);
});

/* ------------------------------------------------------------------ R7 */

test("R7 autoWatchable: true with no name or organization and another criterion; false otherwise", () => {
  assert.equal(autoWatchable({ filer_ids: ["FILER0000001"] }), true);
  assert.equal(autoWatchable({ amount: { min: 500 }, places: [{ zip5: "94612" }] }), true);
  assert.equal(autoWatchable({ names: ["Rosa Martinez"] }), false);
  assert.equal(autoWatchable({ organizations: ["Harbor Bakery"], amount: { min: 500 } }), false);
  assert.equal(autoWatchable({}), false);
  for (const x of [null, undefined, 3, "names"]) assert.equal(autoWatchable(x), false);
});

test("R7 control: without the name it is true", () => {
  assert.equal(autoWatchable({ names: ["Rosa Martinez"], forms: ["460"] }), false);
  assert.equal(autoWatchable({ forms: ["460"] }), true);
});

/* ------------------------------------------------------------------ R8 */

const FACTS = {
  subjects: [{ kind: "person", label: "Rosa Martinez" }, { kind: "organization", label: "Harbor Bakery" }],
  identifiers: [{ scheme: "filer", value: "FILER0000001" }, { scheme: "docket", value: "HC24-000123" }],
  period: { from: "2025-01-01", to: "2025-12-31" },
};

test("R8 two subjects, a filer id of the register's scheme and a period prefill those four, each with its basis", () => {
  const p = prefillFrom(FACTS, CONTRIB);
  assert.deepEqual(p.filter, { names: ["Rosa Martinez"], organizations: ["Harbor Bakery"], filer_ids: ["FILER0000001"], date: { from: "2025-01-01", to: "2025-12-31" } });
  assert.deepEqual(p.basis.map((b) => b.criterion), ["names", "organizations", "filer_ids", "date"]);
  assert.deepEqual(p.basis[2].fact, { identifier: { scheme: "filer", value: "FILER0000001" } });
  assert.deepEqual(p.left_out, [{ criterion: "docket_numbers", fact: { identifier: { scheme: "docket", value: "HC24-000123" } }, why: "scheme_not_issued" }]);
  assert.equal(validateFilter(p.filter, CONTRIB, VIEW).ok, true);
});

test("R8 an address fact and a note's text prefill nothing; a register with no amount role never receives an amount", () => {
  const noise = { subjects: [{ kind: "address", label: "4012 Sentinel Ave" }, { kind: "note", label: "met Rosa Martinez at the hearing" }],
    addresses: ["4012 Sentinel Ave"], notes: ["Rosa Martinez"], amount: { min: 5 } };
  assert.deepEqual(prefillFrom(noise, CONTRIB), { filter: {}, basis: [], left_out: [] });
  const lic = prefillFrom({ ...FACTS, amount: { min: 5 } }, LICENCES);
  assert.ok(!("amount" in lic.filter));
  assert.deepEqual(lic.filter, { organizations: ["Harbor Bakery"], docket_numbers: ["HC24-000123"] });
  assert.deepEqual(lic.left_out.map((x) => [x.criterion, x.why]), [["names", "role_absent"], ["filer_ids", "scheme_not_issued"], ["date", "role_absent"]]);
});

test("R8 control: no facts give {}", () => {
  assert.deepEqual(prefillFrom({}, CONTRIB).filter, {});
  assert.deepEqual(prefillFrom(undefined, CONTRIB).filter, {});
});
