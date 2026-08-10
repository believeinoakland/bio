#!/usr/bin/env node
/**
 * decided.mjs — the index of what this project has already settled.
 *
 * ------------------------------------------------------------------ why
 *
 * MEASURED 2026-08-10, and the two figures are the whole justification:
 *
 *   - The files `CLAUDE.md` and the kickoffs instruct a session to read before it
 *     may work total ~565,000 TOKENS.  A session cannot read its own required
 *     reading list.  It reads some of it, and the rest of the record is invisible
 *     to it.
 *   - 598 statements in the corpus carry a RULED / DECIDED / AMENDED / CORRECTED /
 *     OVERTURNED marker.  **ONLY 12% ARE IN `DECISIONS.md`** — the rest were
 *     scattered across fifty documents, 154 of them inside `CLAIMS.md`, which was
 *     1.7 MB and did not fit in a context window at all.
 *
 * So a session re-asks a settled question not because it is careless but because
 * the answer is in a file it cannot afford to open.  Making the corpus SMALLER
 * does not fix that: after every archive move those rulings are still spread
 * across fifty documents.  What fixes it is being able to ASK.
 *
 * This emits 598 rulings as 167 KB and answers a phrase query in one call.  The
 * consolidation of 2026-08-10 that followed took the live corpus from 7.35 MB to
 * 3.56 MB — but note which of the two actually fixes the complaint: SHRINKING the
 * corpus does not make a ruling findable, because the rulings that remain are
 * still spread over fifty documents.  Only asking does.
 *
 * ------------------------------------------------------------------ the rules
 *
 * GENERATED, NEVER AUTHORED.  A hand-maintained index is the next document
 * nobody reads, and this project's most-repeated finding is that a hand-carried
 * fact in a document nobody re-measures goes stale silently (the store.mjs line
 * count was wrong FOUR times).  `--check` fails when the committed file differs
 * from a fresh generation, the same discipline `check-versions` applies to
 * version stamps.
 *
 * IT QUOTES, IT DOES NOT SUMMARISE.  A summarised ruling is a SECOND STATEMENT
 * of the fact, which is exactly the defect class D-21/DEC-8 names and which this
 * index would otherwise industrialise 350 times over.  Every entry carries the
 * sentence as it was written and a `file:line` pointer.  The authority never
 * moves; only the pointer to it is cheap.
 *
 * IT SCANS THE ARCHIVE.  `docs/archive/**` is in scope by construction, so
 * moving a closed pass out of the working tree does not hide the rulings inside
 * it.  This is the property that makes archiving safe rather than lossy, and it
 * is why this tool lands BEFORE any document moves.
 *
 * ------------------------------------------------------------------ weighed and rejected
 *
 *   - A CURATED `DECIDED.md` a session maintains by hand.  Rejected on this
 *     project's own receipts: the purge table fell three releases behind, the
 *     npm test chain listed 38 files against a directory of 41, and a memory
 *     existed in the right place with no index line.  Convention does not hold
 *     here and never has.
 *   - EXTRACTING ONLY `DECISIONS.md`.  It is 12% of the rulings.  The complaint
 *     is about the other 88%.
 *   - SEMANTIC SEARCH / EMBEDDINGS.  A dependency, a build step, and a second
 *     artifact that can disagree with the corpus.  Substring over 350 quoted
 *     sentences answers the question a session actually asks ("has anybody ruled
 *     on bias debt?") and has no failure mode that invents an answer.
 *   - PARSING EVERY DOC INTO STRUCTURED RULINGS.  The corpus does not have one
 *     shape: `DECISIONS.md` has entries, the architecture docs have `**Decision.**`
 *     paragraphs, and most rulings are a marker mid-prose.  A parser demanding one
 *     shape would silently drop the 88% that is the point.  The marker scan
 *     over-collects instead, which is the safe direction.
 *
 * ------------------------------------------------------------------ failure modes
 *
 *   - OVER-COLLECTION.  A line saying "this SUPERSEDED an earlier draft" is
 *     indexed as a ruling.  Deliberate and the safe direction: a spurious entry
 *     costs one line of reading, a missed one costs a re-litigated decision.
 *   - A RULING WITH NO MARKER is invisible here.  The index is a floor on what
 *     has been settled, never a ceiling, and it says so in its own header so no
 *     reader mistakes silence for absence.  Same discipline as CLAIMS: absence at
 *     one level is not evidence of absence at the next.
 *
 * NEGATIVE CONTROL: `node tools/decided.mjs --control` mutates a known ruling
 * line in memory and asserts the index NOTICES — a scan that cannot fail is not
 * a scan.  Run it after changing any pattern below.
 *
 * ------------------------------------------------------------------ usage
 *
 *   node tools/decided.mjs                    write docs/DECIDED.md
 *   node tools/decided.mjs --check            fail if the committed file is stale
 *   node tools/decided.mjs "bias debt"        every ruling touching a phrase
 *   node tools/decided.mjs DEC-32             one id, and where it lives
 *   node tools/decided.mjs --control          the negative control
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, realpathSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const OUT = join(REPO, "docs/DECIDED.md");

/* The roots scanned. `docs/archive` is listed explicitly rather than inherited
   from `docs`, so that a reader of this line knows the archive is in scope on
   purpose and does not "tidy" it out. */
const ROOTS = ["docs", "CLAUDE.md"];

/* A ruling MARKER. Deliberately generous — see the over-collection note above.
   `\b` on both sides so `SUPERSEDED` matches and `SUPERSEDES` does not: the
   past tense is a record of a decision, the present tense is usually a rule
   describing how supersession works. */
const MARKER = /\b(RULED|DECIDED|AMENDED|CORRECTED|OVERTURNED|SETTLED|SUPERSEDED|WITHDRAWN|CONCEDED)\b/;

/* An id in any of this project's namespaces, in the order a reader ranks them.
   DEC is the architect's own decision register and sorts first. */
const NS = ["DEC", "D", "IC", "C", "REC", "UI", "FW", "CAP", "CPDF", "COFF", "PL", "IS", "M0"];
const ID = new RegExp(`\\b(${NS.join("|")})-(\\d+(?:\\.\\d+)?)\\b`);
const DATE = /\b(20\d\d-\d\d-\d\d)\b/;

/** Every .md and .html under the roots, EXCEPT this tool's own output.
 *
 *  THE EXCLUSION IS LOAD-BEARING, and it was found by measurement rather than
 *  foresight: the first run wrote 568 rulings and then reported 997, because the
 *  second scan read the file the first had just written and indexed the index.
 *  Left in, every run would inflate the corpus with its own previous output and
 *  the count would climb forever while looking like discovery.  That is exactly
 *  the class the outgoing CONDUCT named on 2026-08-09 — AN INSTRUMENT THAT
 *  ANSWERS ABOUT ITSELF READS AS A MEASUREMENT OF SOMETHING ELSE — arriving in a
 *  tool written to relieve it.  `--check` is what would have caught it later; the
 *  double-scan caught it in the first minute.
 */
function corpus() {
  const out = [];
  const walk = (p) => {
    const st = statSync(p);
    if (st.isDirectory()) { for (const n of readdirSync(p).sort()) walk(join(p, n)); return; }
    if (/\.(md|html)$/.test(p) && p !== OUT) out.push(p);
  };
  for (const r of ROOTS) { const p = join(REPO, r); if (existsSync(p)) walk(p); }
  return out;
}

/* A ruling's TEXT. The marker sits mid-prose far more often than at a line
   start, so the unit is the SENTENCE containing it rather than the line — a
   line of DEBT.md is up to 9,408 characters and quoting it whole would defeat
   the point of the index. */
function statementAround(line, markerIdx) {
  const before = line.slice(0, markerIdx);
  const start = Math.max(before.lastIndexOf(". "), before.lastIndexOf("**"), before.lastIndexOf("| "));
  const from = start > 0 && markerIdx - start < 240 ? start + 1 : Math.max(0, markerIdx - 120);
  const rest = line.slice(from);
  const stop = rest.search(/(?<=[.!?])\s(?=[A-Z(*`])/);
  let s = (stop > 40 ? rest.slice(0, stop + 1) : rest).trim();
  s = s.replace(/\s+/g, " ").replace(/^[|>*_#\s-]+/, "").trim();
  return s.length > 320 ? s.slice(0, 317).replace(/\s\S*$/, "") + "…" : s;
}

/** @returns {{id:string|null, ns:string|null, num:number, date:string|null, text:string, file:string, line:number}[]} */
export function scan(files = corpus(), reader = (f) => readFileSync(f, "utf8")) {
  const out = [];
  const seen = new Set();
  for (const f of files) {
    const rel = relative(REPO, f).split(sep).join("/");
    const lines = reader(f).split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = MARKER.exec(line);
      if (!m) continue;
      /* A ruling wrapped across prose lines is quoted from the JOINED window, or
         every entry from a hand-wrapped document ends mid-sentence. Long lines
         (the ledger rows) are already self-contained and are quoted alone. */
      const unit = line.length < 200 ? [line, ...lines.slice(i + 1, i + 4)].join(" ") : line;
      const text = statementAround(unit, m.index);
      if (text.length < 25) continue;
      const idm = ID.exec(text) || ID.exec(line);
      const key = text.toLowerCase().slice(0, 110);
      if (seen.has(key)) continue;
      seen.add(key);
      /* THE SEARCH CONTEXT IS WIDER THAN THE QUOTE, and this is the difference
         between a usable index and a decorative one.  Measured on the first
         build: `decided.mjs "bias debt"` returned NOTHING while three rulings
         about bias debt existed, because in `DEBT.md` the marker sits 1,400
         characters from the subject inside a single 1,604-character row, and in
         `BIO_Design_Requirements_v2` the marker is on one line and the
         substance on the next four.  So the QUOTE stays a sentence — short
         enough to read 568 of — and the MATCH runs over the surrounding lines.
         A query is answered from context; a reader is shown a quote. */
      out.push({
        id: idm ? `${idm[1]}-${idm[2]}` : null,
        ns: idm ? idm[1] : null,
        num: idm ? parseFloat(idm[2]) : 0,
        date: (DATE.exec(text) || DATE.exec(line) || [])[1] || null,
        text, file: rel, line: i + 1,
        ctx: lines.slice(Math.max(0, i - 4), i + 5).join(" ").slice(0, 4000).toLowerCase(),
      });
    }
  }
  out.sort((a, b) => {
    const ai = a.ns ? NS.indexOf(a.ns) : 99, bi = b.ns ? NS.indexOf(b.ns) : 99;
    return ai - bi || a.num - b.num || a.file.localeCompare(b.file) || a.line - b.line;
  });
  return out;
}

function render(rows) {
  const withId = rows.filter((r) => r.id), without = rows.filter((r) => !r.id);
  const L = [];
  /* AT BYTE 0, AND IT IS LOAD-BEARING RATHER THAN DECORATIVE. This file QUOTES the
     corpus, so every prose checker that sweeps the tree sees each quoted claim a
     second time and attributes it here — `op-claims` found a DO-path name in a
     quoted ruling and reported the INDEX as making a wrong-level op claim. The
     finding belongs against the source line, where it is already checked; against
     a derived view it is the same fact counted twice. `op-claims.generatedReason()`
     is the repository's existing answer for exactly this and keys on byte 0. */
  L.push("<!-- GENERATED by tools/decided.mjs. Do not edit; run the tool. -->");
  L.push("# DECIDED — the index of what has already been settled");
  L.push("");
  L.push("**GENERATED BY `node tools/decided.mjs`. Do not edit — your edit is overwritten and");
  L.push("`plancheck` fails on the drift.** Regenerate after any turn that rules on anything.");
  L.push("");
  L.push("**Read this before raising a question or writing a decision item**, and query it");
  L.push("rather than reading it whole:");
  L.push("");
  L.push("    node tools/decided.mjs \"bias debt\"        every ruling touching a phrase");
  L.push("    node tools/decided.mjs DEC-32             one id, and where it lives");
  L.push("");
  L.push("**THIS IS A FLOOR ON WHAT HAS BEEN SETTLED, NEVER A CEILING.** It finds rulings that");
  L.push("carry a marker word. A decision recorded without one is invisible here, so silence in");
  L.push("this file is not evidence that nothing was decided — the same rule the record applies");
  L.push("to sparse levels everywhere else. Each entry QUOTES its source and points at it; the");
  L.push("authority is the file named, never this one.");
  L.push("");
  L.push(`${rows.length} rulings across ${new Set(rows.map((r) => r.file)).size} documents.`);
  L.push("");
  let ns = null;
  for (const r of withId) {
    if (r.ns !== ns) { ns = r.ns; L.push(`## ${ns}-`); L.push(""); }
    L.push(`- **${r.id}**${r.date ? ` · ${r.date}` : ""} — ${r.text}  \n  \`${r.file}:${r.line}\``);
  }
  L.push("");
  L.push("## Rulings carrying no id");
  L.push("");
  L.push("Settled in prose without an id allocated. Cite them by file and line.");
  L.push("");
  for (const r of without) L.push(`- ${r.date ? `**${r.date}** — ` : ""}${r.text}  \n  \`${r.file}:${r.line}\``);
  L.push("");
  return L.join("\n");
}

/* ------------------------------------------------------------------ negative control */
function control() {
  const probe = join(REPO, "docs/development/DECISIONS.md");
  if (!existsSync(probe)) { console.log("CONTROL SKIPPED — DECISIONS.md absent"); return 0; }
  const real = scan([probe]);
  const neutered = scan([probe], () =>
    readFileSync(probe, "utf8").replace(MARKER, (w) => w.toLowerCase()));
  const ok = real.length > 0 && neutered.length < real.length;
  console.log(`  ${ok ? "PASS" : "FAIL"}  removing one marker lowers the count (${real.length} -> ${neutered.length})`);
  const empty = scan([probe], () => "nothing here at all\n");
  console.log(`  ${empty.length === 0 ? "PASS" : "FAIL"}  a corpus with no rulings yields none (${empty.length})`);
  return ok && empty.length === 0 ? 0 : 1;
}

/* ------------------------------------------------------------------ main
 *
 * THE ENTRY GUARD IS NOT CEREMONY — it was paid for within the hour.  `plancheck`
 * imported `scan` from this file to check the index is current, and the import
 * RAN the CLI below against PLANCHECK'S OWN argv: `plancheck --local` became
 * `decided.mjs --local`, which is a query, so plancheck printed "no ruling
 * mentions --local" and exited 0 having checked nothing.  A module that acts on
 * import turns every consumer into an accidental caller, and the failure is
 * silent and green — the shape this project keeps paying for.
 */
const IS_CLI = process.argv[1] && fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
const arg = IS_CLI ? process.argv[2] : "--module";

if (!IS_CLI) {
  /* imported for `scan` — do nothing */
} else if (arg === "--control") {
  process.exit(control());
} else if (!arg || arg === "--check" || arg === "--write") {
  const rows = scan();                       /* ONE scan — see the corpus() note */
  const body = render(rows);
  if (arg === "--check") {
    const have = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
    if (have === body) { console.log("DECIDED.md is current"); process.exit(0); }
    console.error("FAIL  docs/DECIDED.md is STALE — run `node tools/decided.mjs`");
    process.exit(1);
  }
  writeFileSync(OUT, body);
  console.log(`docs/DECIDED.md — ${rows.length} rulings, ${(body.length / 1024).toFixed(1)} KB`);
} else {
  const q = process.argv.slice(2).join(" ").toLowerCase();
  const all = scan();
  const exact = all.filter((r) => r.id && r.id.toLowerCase() === q);
  const hits = exact.length ? exact
    : all.filter((r) => r.ctx.includes(q) || r.file.toLowerCase().includes(q));
  if (!hits.length) {
    console.log(`No RULING carrying a marker mentions "${q}".`);
    console.log("That is a FLOOR, not a ceiling — a decision recorded without a marker word is");
    console.log("invisible here. Grep the corpus before concluding nothing was decided.");
    process.exit(0);
  }
  for (const r of hits) {
    console.log(`\n${r.id ? r.id + " " : ""}${r.date ? "· " + r.date + " " : ""}\n  ${r.text}\n  ${r.file}:${r.line}`);
  }
  console.log(`\n${hits.length} ruling(s).`);
}
