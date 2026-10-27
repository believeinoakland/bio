/* The measurements of doctypes R40 that need a process of their own, so their memory is theirs alone. Run by
 * g140.test.mjs as
 *   node [--expose-gc --max-old-space-size=N --max-semi-space-size=2] g140-child.mjs <mode> <case>
 *   base <case>   the heap with the text of <case> held (what the caller holds): {baseMB}
 *   run <case>    the case, through the types' own `detect` and `parse`: a summary of the answer
 * Cases: dash (400,000 characters of `a-a-a-`), oneline (16,000 addresses on one line), csv (a 17 MB spreadsheet of
 * distinct addresses), cites_staff_report and cites_regulation (400,000 citations of fifty instruments). `ctx.locate`
 * answers an object for every offset, as docprofile's does. */
import { DOCTYPES } from "../index.mjs";
import { HELD } from "./fixtures.mjs";
import { addresses, csvOfAddresses, citations, repeated } from "./r40-texts.mjs";

const [mode, name] = process.argv.slice(2);
const mb = () => process.memoryUsage().heapUsed / 1048576;
const settle = () => { if (global.gc) { global.gc(); global.gc(); } };
const type = (key) => DOCTYPES.find((t) => t.key === key);

const CASES = {
  dash: () => repeated("a-", 400_000),
  oneline: () => addresses(16_000, ", "),
  csv: () => csvOfAddresses(17_000_000),
  cites_staff_report: () => citations(400_000),
  cites_regulation: () => citations(400_000),
};
if (!CASES[name]) throw new Error(`case: ${name}`);
const text = CASES[name]();
text.indexOf("\u0000");   // a joined string is one flat string before anything is measured
settle();

if (mode === "base") {
  console.log(JSON.stringify({ baseMB: mb(), chars: text.length }));
} else if (mode === "run") {
  const locate = (o) => ({ arm: "pdf-page", page: 1 + (o >> 12), at: o });
  const ctx = (extra) => ({ view: HELD, text, locate, alsoSatisfies: () => [], ...extra });
  if (name === "dash" || name === "oneline" || name === "csv") {
    const dir = type("staff_directory");
    const work = { chars: 0 };
    const t0 = Date.now();
    const d = dir.detect(ctx({ work }));
    const detectMs = Date.now() - t0;
    const parsed = dir.parse(ctx({ work: { chars: 0 } }));
    const longest = parsed.entities.reduce((n, e) => Math.max(n, e.facts.line.length), 0);
    console.log(JSON.stringify({ chars: text.length, match: d.match, detectMs, work: work.chars, entities: parsed.entities.length, entries: parsed.entries,
                                 cut: parsed.entries_cut === true, limit: parsed.entries_limit || null, readTo: parsed.read_to || null,
                                 longestLine: longest, lineCut: parsed.entities.filter((e) => e.facts.line_cut).length, why: parsed.entries_why || null,
                                 first: parsed.entities.length ? parsed.entities[0].key : null }));
  } else {
    const key = name === "cites_staff_report" ? "staff_report" : "regulation";
    const work = { chars: 0 };
    const parsed = type(key).parse(ctx({ work }));
    console.log(JSON.stringify({ chars: text.length, entities: parsed.entities.length, cut: parsed.references_cut === true, skipped: parsed.references_skipped || 0,
                                 limit: parsed.references_limit || null, sightingsLimit: parsed.sightings_limit || null, work: work.chars,
                                 occurrences: parsed.entities[0].occurrences ? parsed.entities[0].occurrences.length : 0 }));
  }
}
