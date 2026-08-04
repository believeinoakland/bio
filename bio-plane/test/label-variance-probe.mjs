/* REC-36's MEASUREMENT INSTRUMENT: how does `reading_refs.label` actually vary
 * against the names a subject registry would hold?
 *
 * Run it:  node test/label-variance-probe.mjs
 *
 * WHY IT EXISTS. REC-36's queue item says MEASURE FIRST, and the choice it feeds
 * is a real fork: a normalised-label INDEX (key the whole label, look a name up)
 * against an alias-JOINed read (walk the registry's names into the corpus). The
 * two are not interchangeable, and guessing between them is how a lookup ships
 * that answers nothing on a real document while passing every synthetic test.
 *
 * WHAT IT RUNS OVER, and this is the honest limit stated up front: the ONE real
 * captured document this repository holds — `test/fixtures/legistar-agenda-1425405.pdf`,
 * oakland.legistar.com View.ashx?M=A&ID=1425405, the *Rules & Legislation
 * Committee supplemental agenda for 2026-07-16, fetched 2026-08-03, 276,421
 * bytes, 33 pages. It is read through the PLANE'S OWN Tier-1 extraction
 * (`src/pdfstructure.mjs`) and the REAL reader (`docprofile`'s meeting_agenda
 * doctype, itself written from this document), so the labels below are the exact
 * strings `#writeReadings` would persist — not a fixture written to agree.
 *
 * ONE DOCUMENT, ONE DOCTYPE, ONE INSTITUTION IS TOO THIN TO CHARACTERISE A
 * DISTRIBUTION of name-spelling variance, and this probe does not pretend
 * otherwise: it reports counts out of 41 labels and names its corpus. What n=41
 * DOES settle is the SHAPE question, because "0 of 41" there is not a sampling
 * artefact — it is a fact about what a label IS in this corpus.
 *
 * THE PROBE NAMES ARE TAKEN FROM THE DOCUMENT, never invented: the body name,
 * the source's own `From:` offices, and the counterparties and places the item
 * titles name. A probe set written by hand would measure the author's
 * imagination.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { extractPdfStructure } from "../src/pdfstructure.mjs";
import { readText } from "../../docprofile/registry.mjs";

/* The store's own alias normaliser, copied here DELIBERATELY and for one reason:
   this probe must be able to measure a normalisation the store does not yet have.
   The shipped code has exactly one copy (Store.#normAlias); this is an
   instrument, and readingname.test.mjs is what holds the shipped pair equal. */
const norm = (s) => String(s ?? "").trim().replace(/\s+/g, " ").toLowerCase().slice(0, 200);
const terms = (s) => [...new Set(norm(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean))];

const FIX = fileURLToPath(new URL("./fixtures/legistar-agenda-1425405.pdf", import.meta.url));
const st = await extractPdfStructure(new Uint8Array(readFileSync(FIX)));
const r = readText(st.text, { at: "2026-08-04" });
if (!r.determined || !r.parsed) { console.error("the fixture did not read; nothing measured"); process.exit(1); }

const ents = r.parsed.entities;
const labels = ents.map((e) => e.label);
const froms = [...new Set(ents.map((e) => e.facts && e.facts.from).filter(Boolean))];
const raw = st.text.document;

const line = (s) => console.log(s);
line(`# REC-36 label-variance probe`);
line(`corpus: 1 real captured document; doctype ${r.doctype.type.key} at ${r.doctype.confidence}; `
   + `${st.text.counts.chars} chars decoded, ${st.text.counts.undetermined} undetermined`);
line(`labels: ${labels.length}; body: ${JSON.stringify(r.parsed.body)}; date: ${r.parsed.date}`);

/* --- A. is a subject name ever the WHOLE label? (the normalised-label index) --- */
const PROBES = [
  r.parsed.body, ...froms,
  "City of Oakland", "Alameda County", "California Highway Patrol", "James Beere",
  "Weaver and Tidwell, LLP", "Alta Planning and Design", "Barretto, Co.",
  "Bright Research Group", "AC Transit", "Bay Area Air Quality Management District",
  "Construction Resource Center", "Oakland Fund", "Seminary Point",
];
let eq = 0, sub = 0, conj = 0;
const rows = [];
for (const p of PROBES) {
  const nn = norm(p), nt = terms(p);
  let e = 0, s = 0, c = 0;
  for (const l of labels) {
    const ln = norm(l), lt = terms(l);
    if (ln === nn) e++;
    if (ln.includes(nn)) s++;
    if (nt.every((x) => lt.includes(x))) c++;
  }
  eq += e; sub += s; conj += c;
  if (e || s || c) rows.push([p, e, s, c]);
}
line(`\n## A. whole-label equality vs containment (${PROBES.length} names x ${labels.length} labels)`);
line(`whole-label equal after case-fold + whitespace-collapse: ${eq}`);
line(`name EMBEDDED in a longer label (substring):            ${sub}`);
line(`every term of the name present in the label (indexable): ${conj}`);
for (const [p, e, s, c] of rows) line(`  ${String(p).padEnd(46)} eq=${e} substr=${s} all-terms=${c}`);

/* --- B. case variance for one string, inside one document --- */
line(`\n## B. case variance, measured inside this one document`);
for (const probe of ["city of oakland", "rules . legislation committee"]) {
  const re = new RegExp(probe.replace(/ /g, "\\s+"), "gi");
  const forms = {};
  for (const m of raw.match(re) || []) forms[m.replace(/\s+/g, " ")] = (forms[m.replace(/\s+/g, " ")] || 0) + 1;
  line(`  /${probe}/i -> ${JSON.stringify(forms)}`);
}

/* --- C. the ABBREVIATION class: reachable by NO normalisation of spelling --- */
line(`\n## C. abbreviations — a registered full name against the label's short form`);
for (const [full, abbr] of [["Oakland Police Department", "OPD"],
                            ["Housing and Urban Development", "HUD"],
                            ["Regional Early Action Planning", "REAP"],
                            ["Community Services Block Grant", "CSBG"],
                            ["Memorandum of Understanding", "MOU"],
                            ["Oakland Paratransit for the Elderly and Disabled", "OPED"]]) {
  const byFull = labels.filter((l) => terms(full).every((x) => terms(l).includes(x))).length;
  const byAbbr = labels.filter((l) => terms(l).includes(norm(abbr))).length;
  line(`  ${full.padEnd(50)} by full name: ${byFull}   as ${abbr}: ${byAbbr}`);
}

/* --- D. punctuation and character classes actually present --- */
line(`\n## D. character classes present in the ${labels.length} labels`);
for (const [k, re] of Object.entries({
  comma: /,/, period: /\./, ampersand: /&/, hyphen: /-/, paren: /[()]/, bracket: /[[\]]/,
  dollar: /\$/, plus: /\+/, digit: /\d/, apostrophe: /['’]/, slash: /\//, colon: /:/,
  "non-ASCII": /[^\x20-\x7e]/, "ALLCAPS token": /\b[A-Z]{2,}\b/,
})) line(`  ${k.padEnd(15)} ${labels.filter((l) => re.test(l)).length}/${labels.length}`);
line(`  the non-ASCII label(s): ${JSON.stringify(labels.filter((l) => /[^\x20-\x7e]/.test(l)))}`);

/* --- E. truncation: a label cut at the source's own line wrap --- */
const CUT = /(?:\b(?:for|and|with|of|the|to|between|from|in|on|at|a|an)|,)$/i;
const cut = labels.filter((l) => CUT.test(l.trim()));
line(`\n## E. truncation — labels ending mid-phrase (a source line wrap): ${cut.length}/${labels.length}`);
for (const c of cut) line(`  ${JSON.stringify(c)}`);

/* --- F. the honorific / role-prefix class, on the source's own strings --- */
line(`\n## F. honorific and role prefixes, in the source's own From: values`);
for (const f of froms.filter((x) => /^(Councilmember|Council President|Mayor|Office of)/i.test(x)))
  line(`  ${JSON.stringify(f)}`);
line(`  the SAME office, three spellings in ONE document: `
   + JSON.stringify(froms.filter((f) => /City Administrator/i.test(f))));

/* --- G. what the term projection would cost --- */
const toks = labels.map((l) => terms(l));
const tl = toks.map((t) => t.length).sort((a, b) => a - b);
line(`\n## G. cost of a normalised-term projection of the label`);
line(`  terms per label: min ${tl[0]}, median ${tl[Math.floor(tl.length / 2)]}, max ${tl[tl.length - 1]}`);
line(`  rows for this document: ${toks.reduce((n, t) => n + t.length, 0)} (one per distinct term per reference)`);
