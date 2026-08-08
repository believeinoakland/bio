/* M-4's MEASUREMENT INSTRUMENT: do REFERENCE STRINGS vary the way LABELS do?
 *
 * Run it:  node test/ref-variance-probe.mjs        (exit 0 = every gate held)
 *
 * WHY IT EXISTS. REC-40 widened the name index from the label alone to all THREE
 * strings a reading reference carries, and gave the two PARTIAL correspondences
 * -- a registered name sitting INSIDE a longer string -- their own ranks below
 * every whole match, with no grade. That posture is honest. The NUMBER behind it
 * did not exist: REC-36's n=41 variance probe (`test/label-variance-probe.mjs`,
 * MEASUREMENTS.md 2026-08-04) was run over LABELS, and its findings were quoted
 * for the reference tiers without anybody establishing that reference strings
 * vary the same way. A number taken over one population and quoted about another
 * is not a measurement of the second. That is M-4.
 *
 * WHAT IT MEASURES, and it is deliberately BOTH populations in ONE run: the same
 * matcher, over the same document, over labels AND over reference strings, so
 * the comparison is between two measurements rather than between a measurement
 * and a figure carried in a document. REC-36's label findings are RE-MEASURED
 * here rather than cited.
 *
 * POPULATION. The ONE real captured document this repository holds --
 * `test/fixtures/legistar-agenda-1425405.pdf`, oakland.legistar.com
 * `View.ashx?M=A&ID=1425405`, the *Rules & Legislation Committee supplemental
 * agenda for 2026-07-16, fetched 2026-08-03, 276,421 bytes, 33 pages -- read
 * through the PLANE'S OWN Tier-1 extraction (`src/pdfstructure.mjs`) and the
 * REAL reader (`docprofile`'s `meeting_agenda` doctype). The strings measured
 * are the exact ones `#writeReadings` persists into `reading_refs`, including
 * the `ref` it COMPOSES (`kind:key`) -- not a fixture written to agree.
 *
 * ONE DOCUMENT, ONE DOCTYPE, ONE INSTITUTION, ONE READER. Too thin to
 * characterise a DISTRIBUTION, and this probe claims none. What it can settle is
 * the SHAPE question, and for reference strings the shape is not a sampling
 * artefact at all: see the STRUCTURAL section, which reads the tree rather than
 * the corpus and is labelled as a different kind of evidence.
 *
 * THE PROBE NAMES ARE TAKEN FROM THE DOCUMENT, never invented -- REC-36's own
 * rule and its exact construction (the body name, the source's `From:` offices,
 * and the counterparties and places the item titles name). The alias strings
 * used to probe the REFERENCE population are taken from the reference population
 * itself, for the same reason: a hand-written probe set measures the author's
 * imagination.
 *
 * THE GATES, RUN BEFORE ANY NUMBER IS PRINTED, because this probe's most likely
 * lie is a triumphant row of zeroes:
 *   G1  the corpus is non-empty and the reader determined -- and every reported
 *       ratio REFUSES to print over an empty denominator rather than reporting a
 *       triumphant 0/0 (`ratio()`, exercised on every run as gate (f)).
 *   G2  the fold this probe measures is the fold the PLANE performs: the
 *       tokeniser bodies and the correspondence vocabulary are read OUT OF
 *       `src/store.mjs` and checked, and the correspondence names and ranks are
 *       USED from there rather than copied. A drift throws instead of silently
 *       measuring a normalisation nothing ships.
 *   G3  a positive control with FIVE arms whose answers are known by
 *       construction, including one that must be non-zero at the partial-
 *       reference tier. Without it, a broken matcher and a clean finding are the
 *       same printout.
 *
 * THE GATES ARE ONLY EVIDENCE IF THEY FIRE, so each one's subject is broken and
 * the refusal required by `test/ref-variance.control.mjs` (four arms, RUN
 * 2026-08-08, every edited file restored and the restore asserted by sha256).
 * Run it with `node test/ref-variance.control.mjs`.
 *
 * WHAT THIS DOES NOT ESTABLISH is stated in MEASUREMENTS.md beside the numbers,
 * not left to a reader to infer.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { extractPdfStructure } from "../src/pdfstructure.mjs";
import { readText } from "../../docprofile/registry.mjs";

const line = (s = "") => console.log(s);
/* TRAP exists for ONE reason and it is gate (f) below: the empty-population
   guard has to be RUN, not asserted, and running it must not print a failure
   that never happened. With a trap set, `die` records and throws instead of
   killing the process, so the control can catch its own refusal. */
let TRAP = null;
const die = (why) => {
  if (TRAP) { TRAP.push(why); throw new Error("trapped by the instrument's own control"); }
  console.error(`\nGATE FAILED: ${why}`); process.exit(1);
};

/* ------------------------------------------------------------------ G2, part 1
   THE FOLD IS THE STORE'S OWN SOURCE TEXT, EXECUTED — not a copy of it.
   REC-36's probe copied `#normAlias` deliberately (an instrument must be able to
   measure a fold the store does not have) and relied on a suite elsewhere to
   hold the two equal. That is one copy too many for an item whose whole subject
   is a number carried across populations, so this probe does it the other way:
   it reads the two bodies out of `src/store.mjs`, REFUSES to run unless they are
   the text this instrument was written against, and then executes THAT text. A
   silent drift is impossible in either direction — a changed store fails the
   gate, and there is no second implementation to drift. */
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SRC = readFileSync(STORE, "utf8");
const pick = (re, what) => { const m = SRC.match(re); if (!m) die(`could not find ${what} in src/store.mjs — the gate cannot vouch for the fold, so nothing is measured`); return m[1].trim(); };

const shippedNorm = pick(/static #normAlias\(s\) \{\s*return ([\s\S]*?);\s*\n\s*\}/, "Store.#normAlias");
const shippedTerms = pick(/static #labelTerms\(s\) \{\s*return ([\s\S]*?);\s*\n\s*\}/, "Store.#labelTerms");
const EXPECT_NORM = `String(s ?? "").trim().replace(/\\s+/g, " ").toLowerCase().slice(0, 200)`;
const EXPECT_TERMS = `[...new Set(Store.#normAlias(s).split(/[^\\p{L}\\p{N}]+/u).filter(Boolean))].slice(0, 24)`;
if (shippedNorm !== EXPECT_NORM)
  die(`Store.#normAlias has changed.\n  shipped:  ${shippedNorm}\n  probe:    ${EXPECT_NORM}\n  This probe would be measuring a fold the plane does not perform.`);
if (shippedTerms !== EXPECT_TERMS)
  die(`Store.#labelTerms has changed.\n  shipped:  ${shippedTerms}\n  probe:    ${EXPECT_TERMS}\n  This probe would be measuring a tokenisation the plane does not perform.`);
/* Gated, therefore safe to run: the ONE fold in this file is the plane's. */
const norm = new Function("s", `return ${shippedNorm};`);
const terms = new Function("norm", "s", `return ${shippedTerms.replace("Store.#normAlias(s)", "norm(s)")};`).bind(null, norm);
if (norm("  Foo   BAR ") !== "foo bar" || terms("A-b, a").join("|") !== "a|b")
  die("the fold read out of src/store.mjs does not behave as this instrument expects; nothing measured");

/* G2, part 2: the correspondence vocabulary and its RANK are USED from the
   shipped source, not restated. If REC-40's five names or their order move, this
   probe moves with them or fails to parse them. */
const corrSrc = pick(/static #CORRESPONDENCE = \{([\s\S]*?)\n {2}\};/, "Store.#CORRESPONDENCE");
const CORR = {};
for (const m of corrSrc.matchAll(/(\w+):\s*\{\s*whole:\s*\["([^"]+)"\],\s*part:\s*\["([^"]+)"\]\s*\}/g))
  CORR[m[1]] = { whole: m[2], part: m[3] };
if (Object.keys(CORR).length !== 3 || !CORR.ref || !CORR.key || !CORR.label)
  die(`Store.#CORRESPONDENCE did not parse into the three sources this probe measures; read: ${JSON.stringify(CORR)}`);
const RANK = JSON.parse(pick(/static #CORRESPONDENCE_RANK = (\[[\s\S]*?\]);/, "Store.#CORRESPONDENCE_RANK"));
if (!Array.isArray(RANK) || RANK.length !== 5) die(`Store.#CORRESPONDENCE_RANK is not the five-value order this probe ranks by; read: ${JSON.stringify(RANK)}`);
for (const s of Object.values(CORR)) for (const v of [s.whole, s.part])
  if (!RANK.includes(v)) die(`the correspondence '${v}' is not in the shipped rank`);

/* G2, part 3: the three term SOURCES, and the guard that decides whether a `key`
   source exists at all. Re-implemented (three lines), gated on the shipped
   guard's own text so the index this probe models cannot drift from the one the
   plane writes. */
const refSourcesSrc = pick(/static #refTermSources\(rr\) \{([\s\S]*?)\n {2}\}/, "Store.#refTermSources");
if (!/Store\.#normAlias\(key\) !== Store\.#normAlias\(ref\)/.test(refSourcesSrc))
  die("Store.#refTermSources no longer guards the key source on 'key normalises differently from ref'; the probe's model of the index is stale");
const refTermSources = (rr) => {
  const ref = rr.ref == null ? "" : String(rr.ref);
  const key = rr.ref_key == null ? "" : String(rr.ref_key);
  const label = rr.label == null ? "" : String(rr.label);
  const out = [];
  if (ref) out.push(["ref", ref]);
  if (key && norm(key) !== norm(ref)) out.push(["key", key]);
  if (label) out.push(["label", label]);
  return out;
};

/* ------------------------------------------------------------------ G1
   The corpus, through the real extraction and the real reader. */
const FIX = fileURLToPath(new URL(process.env.M4_FIXTURE || "./fixtures/legistar-agenda-1425405.pdf", import.meta.url));
let bytes;
try { bytes = readFileSync(FIX); } catch (e) { die(`the corpus could not be read (${FIX}): ${e.message}`); }
const st = await extractPdfStructure(new Uint8Array(bytes));
const r = readText(st.text, { at: "2026-08-04" });
if (!r.determined || !r.parsed) die("the fixture did not read; nothing measured");
const ents = r.parsed.entities;
if (!ents.length) die("the reader found no entities; every ratio below would be over an empty corpus");

/* The rows `#writeReadings` would persist, composed the way it composes them. */
const REFS = ents
  .filter((e) => e && (e.key != null || e.kind != null))
  .map((e) => ({
    ref: typeof e.ref === "string" && e.ref ? e.ref : `${e.kind == null ? "" : e.kind}:${e.key == null ? "" : e.key}`,
    ref_kind: e.kind == null ? null : String(e.kind),
    ref_key: e.key == null ? null : String(e.key),
    label: e.label == null ? null : String(e.label),
  }));
if (!REFS.length) die("no reading reference survived the write-path filter; nothing to measure");

/* Every ratio in this report goes through here. A denominator of zero is a
   REFUSAL, never a triumphant 0/0 -- the failure this project has already paid
   for in a control that passed while asserting nothing. */
const ratio = (n, d, what) => {
  if (!Number.isInteger(d) || d <= 0) die(`refusing to report '${what}' over an empty population (denominator ${d})`);
  return `${n}/${d} (${(100 * n / d).toFixed(1)}%)`;
};

/* The three populations, each the strings of ONE source across the corpus. */
const POP = {
  ref: REFS.map((x) => x.ref).filter(Boolean),
  key: REFS.filter((x) => x.ref_key && norm(x.ref_key) !== norm(x.ref)).map((x) => x.ref_key),
  label: REFS.map((x) => x.label).filter(Boolean),
};
for (const [k, v] of Object.entries(POP)) if (!v.length) die(`the '${k}' population is empty; a comparison against it would measure nothing`);

/* The matcher, modelling `documentsNamingEntity`: for one alias, every reference
   it reaches through any source, keeping the STRONGEST correspondence per
   reference exactly as the read does. */
const rank = (c) => RANK.indexOf(c);
function candidates(alias) {
  const at = terms(alias), an = norm(alias);
  if (!at.length) return [];
  const best = new Map();
  for (const rr of REFS) {
    for (const [src, text] of refTermSources(rr)) {
      const tt = terms(text);
      if (!at.every((t) => tt.includes(t))) continue;
      const whole = norm(text) === an;
      const c = whole ? CORR[src].whole : CORR[src].part;
      const prev = best.get(rr.ref);
      if (!prev || rank(c) < rank(prev.correspondence)) best.set(rr.ref, { ref: rr.ref, correspondence: c, matched_on: src });
    }
  }
  return [...best.values()];
}
/* Substring containment, the scan the term index replaced -- REC-36's finding 2
   was that the two agree over labels, and that equality is the licence for the
   index. It is re-measured here per population rather than assumed to carry. */
const substr = (alias, pop) => pop.filter((s) => norm(s).includes(norm(alias))).length;
const wholeEq = (alias, pop) => pop.filter((s) => norm(s) === norm(alias)).length;
const allTerms = (alias, pop) => { const at = terms(alias); return at.length ? pop.filter((s) => { const tt = terms(s); return at.every((t) => tt.includes(t)); }).length : 0; };

/* ------------------------------------------------------------------ G3
   THE POSITIVE CONTROL. Five arms whose answers are known BY CONSTRUCTION. The
   measurement below is mostly a set of ZEROES, and a zero from a broken matcher
   and a zero from a real absence print identically -- so the instrument proves
   it can produce a non-zero, at the exact tier the item is about, before it is
   allowed to report an absence. */
const one = REFS[0];
const GATE_ARMS = [
  ["(a) the corpus's own first reference, verbatim, must match it WHOLE",
    one.ref, (c) => c.filter((x) => x.correspondence === CORR.ref.whole).length === 1],
  ["(b) that reference's KEY, verbatim, must match at the key tier",
    one.ref_key, (c) => c.some((x) => x.correspondence === CORR.key.whole)],
  ["(c) THE ARM THIS ITEM TURNS ON — the same reference respelled with a space for its colon must reach the PARTIAL-REFERENCE tier",
    `${one.ref_kind} ${one.ref_key}`, (c) => c.some((x) => x.correspondence === CORR.ref.part)],
  ["(d) a string this corpus cannot contain must reach NOTHING",
    "zzq nonexistent subject", (c) => c.length === 0],
  ["(e) a name that normalises to no terms at all must reach NOTHING (never everything)",
    " ,.;:—— ", (c) => c.length === 0],
];
line(`# M-4 reference-string variance probe`);
line(`# instrument: bio-plane/test/ref-variance-probe.mjs · run ${new Date().toISOString().slice(0, 10)}`);
line(`\n## G. gates`);
line(`  G1 corpus: ${REFS.length} reading references from 1 real captured document; reader ${r.doctype.type.key} @ ${r.doctype.confidence}`);
line(`  G2 fold:   Store.#normAlias and Store.#labelTerms byte-checked against src/store.mjs; the ${RANK.length} correspondence names and their order READ from it`);
for (const [what, alias, ok] of GATE_ARMS) {
  const c = candidates(alias);
  if (!ok(c)) die(`positive control ${what}\n  alias ${JSON.stringify(alias)} produced ${JSON.stringify(c.map((x) => x.correspondence))}\n  Every zero printed below would be an artefact of this, not a finding.`);
  line(`  G3 ${what} — OK (${c.length} candidate(s))`);
}
/* The empty-corpus arm, RUN rather than asserted. A walk over an empty corpus
   reports its verdict triumphantly; this instrument's answer is mostly zeroes,
   so the guard that distinguishes "measured, and it is zero" from "there was
   nothing to measure" is the one that has to be exercised. */
{
  TRAP = [];
  try { ratio(0, 0, "gate (f)'s own subject"); } catch { /* the refusal is the pass */ }
  const refused = TRAP.length === 1;
  TRAP = null;
  if (!refused) die("the empty-population guard did NOT refuse a 0/0 ratio — every ratio in this report could be over nothing at all");
  line(`  G3 (f) a ratio over an empty population is REFUSED rather than printed as 0/0 — OK (the guard fired)`);
}

/* ------------------------------------------------------------------ 1
   What the two populations ARE. */
line(`\n## 1. the populations, from the one real captured document`);
const dist = (a) => new Set(a.map(norm)).size;
for (const k of ["ref", "key", "label"])
  line(`  ${k.padEnd(6)} n=${String(POP[k].length).padEnd(3)} distinct=${String(dist(POP[k])).padEnd(3)} example ${JSON.stringify(POP[k][0])}`);
line(`  distinct ref_kind values across the corpus: ${JSON.stringify([...new Set(REFS.map((x) => x.ref_kind))])}`);

/* ------------------------------------------------------------------ 2
   REC-36's question, re-measured, and asked of the reference populations for the
   first time: is a subject's NAME ever the whole string, and does every-term
   containment find what a substring scan finds? */
const froms = [...new Set(ents.map((e) => e.facts && e.facts.from).filter(Boolean))];
const PROBES = [...new Set([
  r.parsed.body, ...froms,
  "City of Oakland", "Alameda County", "California Highway Patrol", "James Beere",
  "Weaver and Tidwell, LLP", "Alta Planning and Design", "Barretto, Co.",
  "Bright Research Group", "AC Transit", "Bay Area Air Quality Management District",
  "Construction Resource Center", "Oakland Fund", "Seminary Point",
].filter(Boolean))];
line(`\n## 2. a subject NAME against each population (${PROBES.length} names taken from the document)`);
line(`  ${"population".padEnd(8)} ${"whole".padEnd(8)} ${"substring".padEnd(10)} all-terms`);
for (const k of ["ref", "key", "label"]) {
  let e = 0, s = 0, c = 0;
  for (const p of PROBES) { e += wholeEq(p, POP[k]); s += substr(p, POP[k]); c += allTerms(p, POP[k]); }
  line(`  ${k.padEnd(8)} ${String(e).padEnd(8)} ${String(s).padEnd(10)} ${c}   (over ${PROBES.length} names x ${POP[k].length} strings)`);
}

/* ------------------------------------------------------------------ 3
   SELECTIVITY — the measurement the label probe never had to take, because it is
   what decides whether a PARTIAL match is evidence. A term shared by the whole
   corpus carries no information: an alias made only of such terms reaches every
   document and corresponds to nothing. */
line(`\n## 3. term selectivity per population — how much of the corpus one term reaches`);
line(`  ${"population".padEnd(8)} ${"rows".padEnd(6)} ${"distinct".padEnd(9)} ${"max reach".padEnd(11)} ${"terms reaching ALL".padEnd(19)} rows carried by corpus-wide terms`);
const SEL = {};
for (const k of ["ref", "key", "label"]) {
  const df = new Map();
  let rows = 0;
  for (const s of POP[k]) for (const t of terms(s)) { df.set(t, (df.get(t) || 0) + 1); rows++; }
  const n = POP[k].length;
  const all = [...df.entries()].filter(([, c]) => c === n);
  const carried = [...df.entries()].filter(([, c]) => c === n).reduce((a, [, c]) => a + c, 0);
  SEL[k] = { df, rows, n, all };
  line(`  ${k.padEnd(8)} ${String(rows).padEnd(6)} ${String(df.size).padEnd(9)} ${ratio(Math.max(...df.values()), n, `${k} max reach`).padEnd(11)} ${ratio(all.length, df.size, `${k} corpus-wide terms`).padEnd(19)} ${ratio(carried, rows, `${k} rows carried by corpus-wide terms`)}`);
}
for (const k of ["ref", "key", "label"])
  line(`  ${k}: the term(s) reaching EVERY string: ${JSON.stringify(SEL[k].all.map(([t]) => t))}`);
/* ONE alias-shape-neutral number, because the table above can be read as being
   about which particular words this institution uses. Draw a term at random from
   a random string of the population; how much of the corpus does it reach? This
   is the row-weighted mean document frequency, and it is the closest thing to a
   selectivity figure that does not depend on guessing what a member would
   register as a name. */
line(`  a term drawn at random from a string of the population reaches, on average:`);
for (const k of ["ref", "key", "label"]) {
  let sum = 0;
  for (const s of POP[k]) for (const t of terms(s)) sum += SEL[k].df.get(t);
  const mean = sum / SEL[k].rows;
  line(`    ${k.padEnd(6)} ${mean.toFixed(2)} of ${SEL[k].n} strings (${(100 * mean / SEL[k].n).toFixed(1)}% of the corpus)`);
}

/* ------------------------------------------------------------------ 4
   THE PARTIAL-REFERENCE TIER'S BLAST RADIUS. Every alias here is a string the
   corpus itself supplies -- a single term of a reference, or a reference
   respelled -- because those are the aliases that can fire this tier at all. */
line(`\n## 4. what fires the PARTIAL tiers, and how much of the corpus each one reaches`);
const fired = [];
for (const [t] of SEL.ref.df) fired.push(t);
for (const [t] of SEL.key.df) if (!fired.includes(t)) fired.push(t);
const blast = fired.map((t) => {
  const c = candidates(t);
  const part = c.filter((x) => x.correspondence === CORR.ref.part || x.correspondence === CORR.key.part);
  return [t, c.length, part.length, c.length ? c[0].correspondence : "-"];
}).sort((a, b) => b[2] - a[2]);
line(`  single-term aliases taken from the reference population (${fired.length}), by how many references they reach at a PARTIAL tier:`);
for (const [t, tot, part, top] of blast.slice(0, 6))
  line(`    ${JSON.stringify(t).padEnd(12)} partial ${ratio(part, REFS.length, `blast of ${t}`).padEnd(13)} total ${tot}, strongest correspondence ${top}`);
const worst = blast[0];
line(`  the WORST single-term alias reaches ${ratio(worst[2], REFS.length, "worst partial blast")} of the corpus at the partial-reference tier`);
/* The same alias against the LABEL population: the comparison M-4 exists to make. */
line(`  the SAME alias ${JSON.stringify(worst[0])} against the LABEL population: `
   + `all-terms ${ratio(allTerms(worst[0], POP.label), POP.label.length, "worst alias vs labels")}`);
/* And the label population's own worst single term, for the reverse direction. */
const labelBlast = [...SEL.label.df.entries()].sort((a, b) => b[1] - a[1])[0];
line(`  the label population's worst single term ${JSON.stringify(labelBlast[0])} reaches ${ratio(labelBlast[1], POP.label.length, "worst label term")} of the labels`);

/* ------------------------------------------------------------------ 5
   REC-36's findings 4-8, asked of the reference populations. Each of these was
   measured over labels and quoted afterwards; none had ever been taken here. */
line(`\n## 5. the variance classes REC-36 measured over labels, measured over each population`);
const CLASSES = {
  comma: /,/, period: /\./, colon: /:/, ampersand: /&/, hyphen: /-/, paren: /[()]/,
  dollar: /\$/, digit: /\d/, letter: /[A-Za-z]/, apostrophe: /['’]/, slash: /\//,
  "non-ASCII": /[^\x20-\x7e]/, "ALLCAPS token": /\b[A-Z]{2,}\b/, whitespace: /\s/,
};
line(`  ${"class".padEnd(15)} ${"ref".padEnd(12)} ${"key".padEnd(12)} label`);
for (const [k, re] of Object.entries(CLASSES))
  line(`  ${k.padEnd(15)} ${["ref", "key", "label"].map((p) => `${POP[p].filter((s) => re.test(s)).length}/${POP[p].length}`.padEnd(12)).join("")}`);
const CUT = /(?:\b(?:for|and|with|of|the|to|between|from|in|on|at|a|an)|,)$/i;
line(`  truncated at a source line wrap:`);
for (const p of ["ref", "key", "label"]) line(`    ${p.padEnd(6)} ${ratio(POP[p].filter((s) => CUT.test(s.trim())).length, POP[p].length, `${p} truncation`)}`);
line(`  two stored strings that normalise together but are spelled differently:`);
for (const p of ["ref", "key", "label"]) {
  const by = new Map();
  for (const s of POP[p]) { const n = norm(s); if (!by.has(n)) by.set(n, new Set()); by.get(n).add(s); }
  line(`    ${p.padEnd(6)} ${ratio([...by.values()].filter((v) => v.size > 1).length, by.size, `${p} stored-spelling variance`)}`);
}
/* REC-36's finding 4 was about the SOURCE's own spelling in the RAW TEXT
   ("City of Oakland" 36 times, "City Of Oakland" 14, in one document), not about
   the stored column, and the two are different questions. Asked here of the
   identifier population: does the source spell its OWN key consistently? This is
   the direct analogue and it is the one that says whether reference strings vary
   the way labels do at the place variance comes from. */
line(`  the SOURCE's own spelling in the raw text (REC-36 finding 4's question, asked per population):`);
const RAW = st.text.document;
for (const p of ["key", "label"]) {
  let present = 0, multi = 0, occurrences = 0;
  const examples = [];
  for (const s of new Set(POP[p])) {
    const esc = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    const hits = RAW.match(new RegExp(esc, "gi")) || [];
    if (!hits.length) continue;
    present++; occurrences += hits.length;
    const forms = new Set(hits.map((h) => h.replace(/\s+/g, " ")));
    if (forms.size > 1) { multi++; if (examples.length < 3) examples.push([...forms]); }
  }
  /* A string that occurs ONCE cannot be spelled two ways, so a zero here is an
     arithmetic certainty and not a finding. The instrument says which it is
     rather than letting the zero be read as evidence. */
  const per = occurrences / present;
  line(`    ${p.padEnd(6)} found in the raw text: ${present} of ${new Set(POP[p]).size} distinct, ${occurrences} occurrences `
     + `(${per.toFixed(1)} each); spelled MORE THAN ONE WAY: ${multi}`
     + (examples.length ? `  e.g. ${JSON.stringify(examples[0])}` : "")
     + (per < 2 ? `   <-- UNINFORMATIVE: at ${per.toFixed(1)} occurrences per string this zero is arithmetic, not evidence` : ""));
}
line(`    So THIS arm is answered by neither population here, and that is reported rather than counted:`);
line(`    a document that names each of its own identifiers once cannot say whether the SOURCE spells`);
line(`    them consistently. That question needs a second capture of the same body and is not settled here.`);
line(`  terms per string (min/median/max) and rows for this whole document:`);
for (const p of ["ref", "key", "label"]) {
  const tl = POP[p].map((s) => terms(s).length).sort((a, b) => a - b);
  line(`    ${p.padEnd(6)} ${tl[0]}/${tl[Math.floor(tl.length / 2)]}/${tl[tl.length - 1]}   rows ${SEL[p].rows}`);
}

/* ------------------------------------------------------------------ 6
   STRUCTURAL, and labelled as a DIFFERENT KIND OF EVIDENCE: this section reads
   the TREE, not the corpus. It bounds how far the corpus finding generalises,
   which n=41 over one document cannot do by itself. */
line(`\n## 6. structural — where a reference string comes from, read from the tree`);
const DT = fileURLToPath(new URL("../../docprofile/doctypes/", import.meta.url));
const HELPER = readFileSync(`${DT}index.mjs`, "utf8");
const helperBody = HELPER.slice(HELPER.indexOf("export function entity"), HELPER.indexOf("export function entity") + 400);
const emitsRef = /\bref\s*:/.test(helperBody);
line(`  docprofile's entity(key, kind, label, facts) helper emits a 'ref' of its own: ${emitsRef}`);
const writeRef = /typeof e\.ref === "string" && e\.ref[\s\S]{0,40}\$\{e\.kind/.test(SRC);
line(`  #writeReadings composes 'kind:key' when the reading carries no ref of its own: ${writeRef}`);
if (emitsRef || !writeRef) die("the reference-composition path has changed; section 6's conclusion about this tree is stale and must be re-derived rather than reprinted");
const { readdirSync } = await import("node:fs");
const emitters = [];
for (const f of readdirSync(DT).filter((x) => x.endsWith(".mjs"))) {
  const t = readFileSync(DT + f, "utf8");
  const kinds = [...t.matchAll(/entity\([^,]+,\s*"([a-z_]+)"/g)].map((m) => m[1]);
  if (kinds.length) emitters.push([f, [...new Set(kinds)]]);
}
line(`  doctypes in this tree that emit entities at all: ${emitters.length} of ${readdirSync(DT).filter((x) => x.endsWith(".mjs")).length} files`);
for (const [f, k] of emitters) line(`    ${f.padEnd(22)} kind(s) ${JSON.stringify(k)}`);
line(`  => in THIS tree every reference string is machine-composed from a CLOSED kind vocabulary`);
line(`     plus a source-assigned key. A label is transcribed prose; a reference is not.`);

line(`\n(every figure above is from this run of this file; nothing here is inherited)`);
