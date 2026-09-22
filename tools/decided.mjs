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
 * count was wrong FOUR times).
 *
 * AND NEVER COMMITTED (M0-99, 2026-09-22).  Until then the file was committed and
 * `--check` failed when it differed from a fresh generation, which made a file
 * nobody writes the estate's most-merged path: 88 commits touched it on 2026-09-21,
 * every lane's landing re-merged it, and a rebase staled it under a correct index
 * (`ORCHESTRATION.md` §"THE RECORD IS PARTITIONED BY WRITER", rule 2).  Now
 * `.gitignore` names it and it is produced where it is read: a reader calls
 * `fresh()`, the ONE freshness call, and gets the index of the corpus as it stands
 * in that working tree, the file rewritten only when it is absent or differs.
 * Nothing a commit carries can be stale, so nothing refuses one; what is checked
 * instead is that the file stays OUT of the committed tree (`indexTracking()`,
 * `plancheck` arm 2b), because `.gitignore` does not apply to a tracked file.
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
 *
 *     ONE INSTANCE OF IT WAS NOT DELIBERATE, AND IT IS CLOSED (D-367, M0-34,
 *     2026-09-15).  `.` is a word boundary, so this file's OWN OUTPUT NAME —
 *     `DECIDED.md` — satisfied the marker, and prose that merely NAMED the index
 *     minted a ruling row attributed to whatever id it mentioned.  49 of 951 rows
 *     were that.  The distinction a future reader needs is the one this bullet
 *     draws: over-collecting a SENTENCE that uses a marker word loosely is the safe
 *     direction and stays; collecting a FILENAME is not over-collection at all, it
 *     is the index answering about ITSELF — the class named at `corpus()` below,
 *     which is why the fix is one lookahead at `MARKER` and nothing wider.
 *   - A RULING WITH NO MARKER is invisible here.  The index is a floor on what
 *     has been settled, never a ceiling, and it says so in its own header so no
 *     reader mistakes silence for absence.  Same discipline as CLAIMS: absence at
 *     one level is not evidence of absence at the next.
 *
 *     ONE CLASS OF IT WAS THE REGISTER ITSELF, AND IT IS CLOSED (M0-97, 2026-09-21).
 *     Bob's decision register records an answer in a LOWERCASE field — `response:`
 *     under a `### DEC-n · answered` heading, dated by `decided:` — and `MARKER` is
 *     an uppercase word list, so the one document whose whole job is holding his
 *     rulings was the document this index read worst.  MEASURED on `86523052`: 0 of
 *     the 72 answered or enacted entries (17 in `DECISIONS.md`, 55 in its August
 *     archive) had a row under their own id pointing into the entry itself, and
 *     `decided.mjs "severance"` returned DEC-29 and DEC-72 but never DEC-70, which
 *     rules it.  That cost a real re-ask (M-85): D-280's site (c) went back to BOB
 *     eleven days after Bob had answered it.  So `scan()` runs a SECOND pass beside
 *     the marker scan, never replacing it: an entry of the register's own shape
 *     (`registerEntries()`) that carries a `decided:` field is ONE ruling under its
 *     own id, quoting its LAST `response:` and dated from its LAST `decided:` — the
 *     register is append-only, and DEC-31 was deferred, then answered.  An `open` or
 *     `deferred` entry is not a ruling and is not filed; an entry whose status this
 *     tool does not know is NAMED in the index's head and never scored either way.
 *     The pass is keyed on the SHAPE, not on a filename, for the reason the archive
 *     is scanned at all: rolling a register to `docs/archive/` must not hide it.
 *     Its cost is D-367's: a line-start specimen of an entry heading written into
 *     any corpus file would be filed, so `bio-plane/test/decided.test.mjs` fails on
 *     an entry row outside a register file, by name.
 *   - A WRAPPED RULING IS QUOTED FROM A JOINED WINDOW, AND THE WINDOW HAD NO EDGE
 *     (D-341, 2026-09-21).  The joiner took the next three lines whatever they were,
 *     so a ruling on the LAST line of a block absorbed the block appended after it:
 *     the index carried an IC-82 ruling ending in another area's `## CLAIM` header,
 *     and a UI-61 ruling ending in a `### DELEGATION` header.  The window now stops
 *     at a heading line or a blank line — the two edges of a paragraph — and a
 *     hand-wrapped ruling inside one paragraph still quotes whole.  The heading is
 *     markdown's, not a bare `^#`, and a TITLE (a heading, or a line ending in a
 *     colon) keeps the paragraph beneath it: see `HEADING` for the measurements.
 *   - THE SEARCH CONTEXT COULD MISS THE LINE IT SURROUNDS (found by M0-97's class
 *     sweep, 2026-09-21).  The context was the nine surrounding lines CUT AT 4,000
 *     characters from their start, so in a ledger of long rows the cut fell before
 *     the ruling's own line: 130 of 1,383 rows could not be found by any word of
 *     their own ruling — among them the D-280 closure quoting DEC-70's severance
 *     ruling.  The matched line is now always in its own context; the cut window is
 *     otherwise unchanged, so no query loses a hit it had.
 *   - AN ID QUERY WITH NOTHING FILED UNDER IT MATCHED OTHER IDS BY PREFIX (the same
 *     sweep): `decided.mjs "DEC-2"` fell back to a substring search and returned 63
 *     rulings about DEC-20 to DEC-29.  An id-shaped query now matches the id as a
 *     whole token, says first that nothing is filed under it, and, when the id is a
 *     register entry that is not a ruling, says which entry and in what state.
 *
 * NEGATIVE CONTROL: `node tools/decided.mjs --control` mutates a known ruling
 * line in memory and asserts the index NOTICES — a scan that cannot fail is not
 * a scan.  Run it after changing any pattern below.  The battery's suite is
 * `bio-plane/test/decided.test.mjs`; its driver, which breaks THIS file one arm at
 * a time, is `node bio-plane/test/decided.control.mjs`.
 *
 * ------------------------------------------------------------------ usage
 *
 *   node tools/decided.mjs                    bring docs/DECIDED.md to the corpus (`fresh()`)
 *   node tools/decided.mjs "bias debt"        every ruling touching a phrase
 *   node tools/decided.mjs DEC-32             one id, and where it lives
 *   node tools/decided.mjs --control          the negative control
 *   node tools/decided.mjs --check            RETIRED by M0-99, and says so (exit 2)
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, realpathSync, renameSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..");
/* The index's path, repo-relative, exported so a caller names it from here rather than
   spelling it (M0-99: the readers of the file now ask this module for it). */
export const INDEX_PATH = "docs/DECIDED.md";
const OUT = join(REPO, INDEX_PATH);

/* The roots scanned. `docs/archive` is listed explicitly rather than inherited
   from `docs`, so that a reader of this line knows the archive is in scope on
   purpose and does not "tidy" it out. */
const ROOTS = ["docs", "CLAUDE.md"];

/* A ruling MARKER. Deliberately generous — see the over-collection note above.
   `\b` on both sides so `SUPERSEDED` matches and `SUPERSEDES` does not: the
   past tense is a record of a decision, the present tense is usually a rule
   describing how supersession works.

   `(?!\.md\b)` IS NOT TIDYING AND IT IS THE NARROWEST CLAUSE THAT CLOSES D-367.
   **`.` IS A WORD BOUNDARY**, so `DECIDED.md` — THIS TOOL'S OWN OUTPUT FILE, named
   56 times in the corpus this tool actually scans — satisfied the marker, and a
   sentence that merely NAMED the index minted a ruling row attributed to whatever id
   the sentence happened to mention.  MEASURED 2026-09-15 (M0-34) by diffing the index
   against itself, never by counting: 951 rulings became 902, and every one of the 49
   pointers that disappeared was a filename match — 0 were not.  Eight are the rows
   D-367 names (D-293, D-311, IC-82, C-7.1, REC-85, UI-31, UI-58, UI-59) and three more
   carry ids (D-354, CAP-7, M0-29).  It is worth one clause because the direction
   is OVERCLAIMING — a phantom row hands a session a ruling that was never made, inside
   the instrument `CLAUDE.md` tells every session to run BEFORE it raises a question —
   and it is worth ONLY one clause because the over-collection above is DELIBERATE and
   this index is a FLOOR: a marker narrowed past this defect would drop real rulings,
   which is worse than the defect.  Two properties keep it narrow, both measured rather
   than reasoned: `DECIDED.md` is the ONLY marker-plus-extension string anywhere in the
   scanned corpus — one distinct string, every occurrence — so this closes the class and
   not one instance; and because `exec` scans FORWARD, a line that names the file AND carries a
   real marker keeps its ruling, now quoted at the real marker instead of at the
   filename.  `--control` drives all four directions; `bio-plane/test/nc-m034.mjs`
   drives them on disk through the CLI. */
const MARKER = /\b(RULED|DECIDED|AMENDED|CORRECTED|OVERTURNED|SETTLED|SUPERSEDED|WITHDRAWN|CONCEDED)\b(?!\.md\b)/;

/* An id in any of this project's namespaces, in the order a reader ranks them.
   DEC is the architect's own decision register and sorts first. */
const NS = ["DEC", "D", "IC", "C", "REC", "UI", "FW", "CAP", "CPDF", "COFF", "PL", "IS", "M0"];
const ID = new RegExp(`\\b(${NS.join("|")})-(\\d+(?:\\.\\d+)?)\\b`);
const DATE = /\b(20\d\d-\d\d-\d\d)\b/;
/* A query that IS an id and nothing else — the case the CLI answers by id. */
const ID_ONLY = new RegExp(`^(?:${NS.join("|")})-\\d+(?:\\.\\d+)?$`, "i");

/* D-341 — WHERE A JOINED WINDOW ENDS.  A heading line or a blank line is the edge
   of a paragraph, and a ruling never continues across one; everything else in a
   hand-wrapped paragraph is joined.
   THE HEADING IS MARKDOWN'S — one to six `#` and then a space or the line's end —
   AND NOT THE ROW'S LITERAL `^#`, WHICH WAS MEASURED TOO WIDE: on `86523052` ten
   prose lines in the scanned corpus open on `#` because a session number wrapped
   to the line start (`ORCHESTRATION.md`: one line ends `And to BOB` and the next
   opens `#23 directly:`), and a bare `^#` would cut a wrapped ruling there, which
   is the liar the row itself names — stopping where a paragraph does not end.
   A LINE THAT TITLES WHAT FOLLOWS IS THE ONE EXCEPTION TO THE BLANK-LINE EDGE, AND
   IT IS MEASURED, NOT PREFERRED: a heading, or a line ending in a colon, has its
   content in the block beneath it, past the blank line markdown puts there.  On
   `86523052` the row's two stops, applied to every line alike, changed 63 quotes of
   such titles that had never crossed into another block — dropping six rows whole
   (four IC status headings like `### 6 · SETTLED` fell under the 25-character floor
   alone, and two titles that repeat word for word elsewhere fell to the text dedup
   once nothing beneath told them apart) and stripping the id from heading rulings
   whose id opens the section (SOURCE-ACCESS's `## RULED … allowlist …`, answered
   as DEC-1).  So a title's window skips the blank lines directly beneath it and
   ends at the first paragraph's edge; nothing's window ever crosses a heading.
   Each edge is ONE test in ONE place, so `decided.control.mjs` can break each alone. */
const HEADING = /^#{1,6}(?:\s|$)/;
const BLANK = /^\s*$/;
const TITLES = (line) => HEADING.test(line) || /:[*_`]*\s*$/.test(line);

/* M0-97 — THE DECISION REGISTER'S OWN ENTRY SHAPE (`DECISIONS.md` § Entry format):
   `### DEC-<n> · <open | answered | deferred | enacted>`, then `name:` fields whose
   values continue on lines indented two or more spaces — the reading `plancheck`
   already applies to the same file, so the two instruments agree on what a field
   is.  The status vocabulary is closed on BOTH sides and anything else is NAMED:
   `answered` and `enacted` are rulings; `open` and `deferred` are not, and win
   over a ruling word if an entry somehow carries both, because filing an unsettled
   question as settled is the overclaiming direction. */
const ENTRY = /^#{1,6}\s+(DEC-(\d+))\s+·\s+(.+?)\s*$/;
const RULING_STATE = ["answered", "enacted"];
const NOT_A_RULING = ["open", "deferred"];

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

/* M0-97 — every entry of the decision register's own shape in one file, CLASSIFIED.
   Pure over the file's lines, so the suite can drive it on a fixture and `scan()`
   and the CLI read the same answer.  An entry runs from its heading to the next
   heading line of any level (a register entry holds no sub-heading; measured, all
   74 on `86523052` end at the next entry or the file's end).  A field is a `name:`
   line inside the entry and its continuation lines indented two or more spaces —
   `plancheck`'s own reading of a value.
   BUT THE ANSWER IN FORCE IS THE LAST ONE, NOT THE FIRST, and that is where this
   parts from `plancheck` (which only asks whether a field EXISTS): the register is
   append-only, so an entry answered twice carries both answers, oldest first.
   MEASURED on `86523052`: DEC-31 carries `response: DEFERRED …` / `decided:
   2026-08-03` and then `response: ANSWERED 2026-09-17 …` / `decided: 2026-09-17`;
   quoting the first would file an answered ruling as a deferral with a stale date.
   It is still ONE ruling — the entry — never one per answer. */
function fieldIn(lines, from, to, name) {
  const re = new RegExp(`^${name}:[^\\S\\n]*(.*)$`);
  let last = null;
  for (let k = from; k < to; k++) {
    const m = re.exec(lines[k]);
    if (!m) continue;
    const parts = [m[1].trim()];
    for (let j = k + 1; j < to && /^\s{2,}\S/.test(lines[j]); j++) parts.push(lines[j].trim());
    last = { line: k + 1, value: parts.join(" ").trim() };
  }
  return last;
}

/** @returns {{id:string, num:number, status:string, line:number, end:number, verdict:"ruling"|"not-a-ruling"|"unclassified",
 *            why:string, response:{line:number,value:string}|null, decided:{line:number,value:string}|null, ctx:string}[]} */
export function registerEntries(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const h = ENTRY.exec(lines[i]);
    if (!h) continue;
    let end = lines.length;
    for (let j = i + 1; j < lines.length; j++) if (/^#{1,6}(?:\s|$)/.test(lines[j])) { end = j; break; }
    const words = h[3].split("·").map((s) => (/^[a-z]+/i.exec(s.trim()) || [""])[0].toLowerCase());
    const response = fieldIn(lines, i + 1, end, "response");
    const decided = fieldIn(lines, i + 1, end, "decided");
    let verdict, why;
    if (words.some((w) => NOT_A_RULING.includes(w))) { verdict = "not-a-ruling"; why = "an open or deferred entry is not a ruling"; }
    else if (!words.some((w) => RULING_STATE.includes(w))) { verdict = "unclassified"; why = `status \`${h[3]}\` is not in the register's vocabulary`; }
    else if (!decided) { verdict = "unclassified"; why = `\`${h[3]}\`, but it carries no \`decided:\` field`; }
    else { verdict = "ruling"; why = "answered or enacted, and decided"; }
    out.push({ id: h[1], num: Number(h[2]), status: h[3], line: i + 1, end, verdict, why, response, decided,
               ctx: lines.slice(i, end).join(" ").toLowerCase() });
    i = end - 1;
  }
  return out;
}

/** @returns {{id:string|null, ns:string|null, num:number, date:string|null, text:string, file:string, line:number,
 *             ctx:string, via:"marker"|"entry", status?:string}[]}
 *  `opts.entries: false` runs the prose marker scan ALONE — the index as it stood
 *  before M0-97, which is what `decided.test.mjs` measures the entry pass against.
 *  `opts.sink`, when given, receives EVERY register entry seen, whatever its verdict,
 *  so a caller can name what was not filed rather than infer it from silence. */
export function scan(files = corpus(), reader = (f) => readFileSync(f, "utf8"), opts = {}) {
  const { entries = true, sink = null } = opts;
  const out = [];
  const seen = new Set();
  for (const f of files) {
    const rel = relative(REPO, f).split(sep).join("/");
    const lines = reader(f).split("\n");
    const filedHere = new Set();          /* `${line}|${id}` of this file's marker rows */
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = MARKER.exec(line);
      if (!m) continue;
      /* A ruling wrapped across prose lines is quoted from the JOINED window, or
         every entry from a hand-wrapped document ends mid-sentence. Long lines
         (the ledger rows) are already self-contained and are quoted alone.
         D-341: the window ends at its paragraph's edge — a HEADING, never crossed,
         or a BLANK line — and a title's paragraph is the one beneath it (`TITLES`).
         The horizon is still the next three lines, so a window is only ever the
         old one cut shorter: every quote this changes is a prefix of what it was. */
      const tail = [];
      for (let k = i + 1, title = TITLES(line); k < lines.length && k < i + 4; k++) {
        if (HEADING.test(lines[k])) break;
        if (BLANK.test(lines[k])) { if (title && !tail.length) continue; break; }
        tail.push(lines[k]);
      }
      const unit = line.length < 200 ? [line, ...tail].join(" ") : line;
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
         A query is answered from context; a reader is shown a quote.
         THE WINDOW IS CUT AT 4,000 CHARACTERS FROM ITS START, AND IN A LEDGER OF
         LONG ROWS THE CUT FELL BEFORE THE LINE IT SURROUNDS (M0-97's sweep, 130 of
         1,383 rows on `86523052`): so when the cut bites, the matched line is added
         back whole.  Additive by construction — every hit the old window gave, the
         new one gives — because the fix is a floor's, not a redesign. */
      const win = lines.slice(Math.max(0, i - 4), i + 5).join(" ");
      const idOf = idm ? `${idm[1]}-${idm[2]}` : null;
      filedHere.add(`${i + 1}|${idOf}`);
      out.push({
        id: idOf,
        ns: idm ? idm[1] : null,
        num: idm ? parseFloat(idm[2]) : 0,
        date: (DATE.exec(text) || DATE.exec(line) || [])[1] || null,
        text, file: rel, line: i + 1,
        ctx: (win.length <= 4000 ? win : `${win.slice(0, 4000)} ${line}`).toLowerCase(),
        via: "marker",
      });
    }
    /* M0-97 — THE REGISTER'S OWN ENTRIES, BESIDE THE MARKER SCAN AND NEVER REPLACING
       IT.  One row per ruling entry, under the entry's OWN id, at its `response:`
       line (the quote starts there), dated from `decided:` and nowhere else — an
       undated `decided:` stays undated rather than borrowing `raised:`.  The whole
       entry is its search context: the question, the answer and the enactment are
       what a session will ask about.  Never filed twice: a marker row already at the
       same line under the same id IS this ruling, filed, and the entry adds nothing.
       Entry rows bypass the marker scan's text dedup on purpose — DEC-71's answer
       opens *"SUPERSEDED BY DEC-72"*, the marker scan files that sentence under
       DEC-72 (its first id), and a dedup on the quote would let that mention erase
       DEC-71's own filing. */
    if (entries || sink) for (const e of registerEntries(lines)) {
      if (sink) sink.push({ ...e, file: rel });
      if (!entries || e.verdict !== "ruling") continue;
      /* The answer is quoted from `response:`; an entry answered only in its
         `decided:` line is quoted from that; the heading is the last resort, so a
         ruling entry is never dropped for want of a sentence. */
      const src = e.response && e.response.value ? e.response : e.decided;
      if (filedHere.has(`${src.line}|${e.id}`)) continue;
      out.push({
        id: e.id, ns: "DEC", num: e.num,
        date: (DATE.exec(e.decided.value) || [])[1] || null,
        text: statementAround(src.value, 0) || lines[e.line - 1].replace(/^#+\s*/, ""),
        file: rel, line: src.line, ctx: e.ctx, via: "entry", status: e.status,
      });
    }
  }
  out.sort((a, b) => {
    const ai = a.ns ? NS.indexOf(a.ns) : 99, bi = b.ns ? NS.indexOf(b.ns) : 99;
    return ai - bi || a.num - b.num || a.file.localeCompare(b.file) || a.line - b.line;
  });
  return out;
}

/* `register` is every decision-register entry `scan()` saw (its `sink`), so the head
   can NAME an entry this tool could not classify instead of letting it fall silent. */
export function render(rows, register = []) {
  const withId = rows.filter((r) => r.id), without = rows.filter((r) => !r.id);
  const fromEntries = rows.filter((r) => r.via === "entry").length;
  const unclassified = register.filter((e) => e.verdict === "unclassified");
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
  L.push("**GENERATED ON DEMAND BY `node tools/decided.mjs`, AND NEVER COMMITTED (M0-99).** A reader asks");
  L.push("the tool, which rewrites this file whenever the corpus has moved; an edit here is overwritten,");
  L.push("and a copy of this file in a commit is refused by `plancheck`.");
  L.push("");
  L.push("**Read this before raising a question or writing a decision item**, and query it");
  L.push("rather than reading it whole:");
  L.push("");
  L.push("    node tools/decided.mjs \"bias debt\"        every ruling touching a phrase");
  L.push("    node tools/decided.mjs DEC-32             one id, and where it lives");
  L.push("");
  L.push("**THIS IS A FLOOR ON WHAT HAS BEEN SETTLED, NEVER A CEILING.** It finds rulings that");
  L.push("carry a marker word, and every answered or enacted entry of the decision register");
  L.push("(`DECISIONS.md` and its archive) through that entry's `decided:` field. A decision");
  L.push("recorded with neither is invisible here, so silence in this file is not evidence that");
  L.push("nothing was decided — the same rule the record applies to sparse levels everywhere");
  L.push("else. Each entry QUOTES its source and points at it; the authority is the file named,");
  L.push("never this one.");
  L.push("");
  L.push(`${rows.length} rulings across ${new Set(rows.map((r) => r.file)).size} documents.`);
  L.push(`${fromEntries} of them are decision-register entries, each filed under its own id from its`);
  L.push("`decided:` field and quoting its `response:`; a row showing the entry's status is one of them.");
  if (unclassified.length) {
    L.push("");
    L.push(`**${unclassified.length} decision-register entr${unclassified.length === 1 ? "y" : "ies"} this index could NOT`);
    L.push("classify, and did not file** — read each at its source:");
    for (const e of unclassified) L.push(`- ${e.id} — ${e.why} — \`${e.file}:${e.line}\``);
  }
  L.push("");
  let ns = null;
  for (const r of withId) {
    if (r.ns !== ns) { ns = r.ns; L.push(`## ${ns}-`); L.push(""); }
    L.push(`- **${r.id}**${r.date ? ` · ${r.date}` : ""}${r.status ? ` · ${r.status}` : ""} — ${r.text}  \n  \`${r.file}:${r.line}\``);
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

/* ------------------------------------------------------------------ the query
   The CLI's answer, lifted out of the CLI so `decided.test.mjs` drives the SAME code a
   session runs.  An exact id answers from the rows FILED under it.  Anything else is
   answered from each row's search context — and an id-shaped query is matched as a
   WHOLE TOKEN there (not followed by a digit or by `.` and a digit, not preceded by a
   letter or digit): as a bare substring `dec-2` matched DEC-20 to DEC-29, and `d-2`
   matched the filename `DEBT-closed-2026-08.md`, so a session asking about one id was
   answered with rulings about others. */
export function query(q, rows = scan()) {
  const needle = String(q).toLowerCase();
  const exact = rows.filter((r) => r.id && r.id.toLowerCase() === needle);
  if (exact.length) return { filed: true, byId: true, hits: exact };
  const bare = needle.trim();
  if (ID_ONLY.test(bare)) {
    const tok = new RegExp(`(?<![a-z0-9])${bare.replace(/\./g, "\\.")}(?![0-9]|\\.[0-9])`);
    return { filed: false, byId: true, hits: rows.filter((r) => tok.test(r.ctx) || tok.test(r.file.toLowerCase())) };
  }
  return { filed: false, byId: false, hits: rows.filter((r) => r.ctx.includes(needle) || r.file.toLowerCase().includes(needle)) };
}

/* ------------------------------------------------------------------ the freshness call (M0-99)
   THE ONE WAY TO READ THE INDEX.  `docs/DECIDED.md` is not committed, so what a working tree holds
   is whatever the last caller there produced: absent in a fresh checkout, stale after any prose
   edit, merge or rebase.  A reader never opens the file bare; it calls this, and gets the index
   of the corpus AS IT STANDS NOW, with the file brought to match it:
     - absent, or differing -> written BY RENAME, so a reader in another process sees the whole
       old file or the whole new one and never a torn one (`pushguard.mjs`'s `writeAtomic`, for
       the same reason: suites read this file while other processes refresh it);
     - current              -> NOT written, so its bytes and its mtime stay and a tree that has
       not moved is not touched.
   `write: false` answers the same question without touching the disk.  The body is returned, so
   a reader that wants the text takes it from here rather than opening the file after the call. */
export function fresh({ write = true } = {}) {
  const register = [];
  const rows = scan(undefined, undefined, { sink: register });   /* ONE scan — see the corpus() note */
  const body = render(rows, register);
  const have = existsSync(OUT) ? readFileSync(OUT, "utf8") : null;
  const state = have === null ? "absent" : have === body ? "current" : "stale";
  let wrote = false;
  if (write && state !== "current") {
    const tmp = `${OUT}.tmp-${process.pid}`;
    try { writeFileSync(tmp, body); renameSync(tmp, OUT); wrote = true; }
    catch (e) { try { if (existsSync(tmp)) unlinkSync(tmp); } catch { /* best effort */ } throw e; }
  }
  return { path: OUT, body, rows, register, state, wrote };
}

/* ------------------------------------------------------------------ out of the committed tree (M0-99)
   HOW A LIAR PASSES M0-99, STATED BEFORE WHAT IT CHECKS: by keeping the index COMMITTED under
   `merge=ours`.  The merges stop conflicting, and the committed copy is stale the moment a branch
   that did not regenerate lands, with nothing left that says so.  So "it merges without a
   conflict" is not the property; "it is not in the committed tree" is.  Two facts, each asked of git:
     tracked — `git ls-files` lists it, so the next commit carries it.  `.gitignore` DOES NOT APPLY
       TO A TRACKED FILE, and that is how it comes back: a modify/delete conflict with a pre-M0-99
       branch resolved by keeping the branch's copy, or `git add -A` over that conflict (`CLAUDE.md`
       §7's trap), re-tracks it with no warning from git.
     ignored — by a rule the REPOSITORY carries: a TRACKED `.gitignore` inside it, at the root or
       nested (`check-ignore -v --no-index` names the rule's source), never a global excludes file or
       `.git/info/exclude`, which bind one clone and travel to nobody; and never a negated (`!`) rule,
       which git reports as the matching rule of a path it does NOT ignore (measured: exit 0, `!` kept).
   A git call that fails is UNDETERMINED, and says so; it is never read as either answer. */
export function indexTracking({ repo = REPO } = {}) {
  const git = (args) => spawnSync("git", args, { cwd: repo, encoding: "utf8" });
  const ls = git(["ls-files", "--", INDEX_PATH]);
  const ci = git(["check-ignore", "-v", "--no-index", "--", INDEX_PATH]);
  const rule = ci.status === 0 ? /^(.*?):(\d+):(.*)\t/.exec(ci.stdout || "") : null;
  const carried = !!rule && !rule[1].startsWith("/") && /(^|\/)\.gitignore$/.test(rule[1])
    && git(["ls-files", "--", rule[1]]).stdout.trim() === rule[1];
  const undetermined = ls.status !== 0 || (ci.status !== 0 && ci.status !== 1) || (ci.status === 0 && !rule);
  return {
    path: INDEX_PATH,
    tracked: ls.status === 0 && (ls.stdout || "").trim() !== "",
    ignored: carried && !rule[3].startsWith("!"),
    rule: rule ? `${rule[1]}:${rule[2]}: ${rule[3]}` : null,
    undetermined,
    why: undetermined ? `${ls.stderr || ""}${ci.stderr || ""}`.trim() || "git answered in a shape this reader does not know" : null,
  };
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

  /* D-367's four arms, added 2026-09-15 by M0-34 and driven in BOTH directions.  They
     run the real `scan` over a synthetic reader, so nothing on disk moves and they cost
     milliseconds; `bio-plane/test/nc-m034.mjs` is the same four planted on disk and read
     back out of the GENERATED index, because what the defect produced was a row in a file
     a session reads, and a store-level check is not evidence a reader was served.
     THE FIRST ARM IS THE ONE THAT MATTERS: before the `(?!\.md\b)` clause it returned 1,
     attributed to REC-85 — an id the sentence merely MENTIONS. */
  const arm = (want, label, text, also = () => true) => {
    const rows = scan([probe], () => text + "\n");
    const good = rows.length === want && also(rows);
    console.log(`  ${good ? "PASS" : "FAIL"}  ${label} (${rows.length}, want ${want})`);
    return good;
  };
  const d367 = [
    arm(0, "D-367: prose NAMING `DECIDED.md` beside an id is NOT a ruling",
        "REC-85's claim added one path, `docs/DECIDED.md`, regenerated and never hand-edited."),
    arm(1, "over-strictness: a ruling whose sentence carries a `.md` filename ELSEWHERE is still indexed",
        "DEC-32 was RULED on 2026-08-01 and it lives in `docs/development/DECISIONS.md` today."),
    arm(1, "over-strictness: a marker ENDING its sentence still counts",
        "The scope of the archive scan was SETTLED. Nothing has reopened it since."),
    arm(1, "over-strictness: a line that names the file AND rules keeps its ruling, quoted at the REAL marker",
        "`docs/DECIDED.md` is generated, and CONDUCT RULED that the index is a floor and never a ceiling.",
        (rows) => rows[0].text.includes("RULED")),
  ].every(Boolean);

  /* M0-97's and D-341's arms, added 2026-09-21, in the same in-memory discipline: one
     per new pattern, so a session that edits either and runs `--control` sees it.
     `bio-plane/test/decided.test.mjs` drives both over the REAL corpus and the CLI. */
  const register = [
    "### DEC-901 · answered",
    "question: may the index file an answered entry?",
    "response: **YES — AN ANSWERED ENTRY IS ONE RULING UNDER ITS OWN ID.** The fixture's answer.",
    "decided: 2026-09-21 · the fixture",
    "",
    "### DEC-902 · deferred",
    "response: not yet; the fixture defers it.",
    "decided: 2026-09-21 · the fixture",
    "trigger: never",
  ].join("\n");
  const m097 = arm(1, "M0-97: an answered register entry is ONE ruling under its OWN id; the deferred one is not filed",
    register, (rows) => rows[0].id === "DEC-901" && rows[0].via === "entry" && rows[0].date === "2026-09-21");
  const d341 = arm(1, "D-341: a ruling on a block's last line does not absorb the CLAIM header appended after it",
    "released: 2026-09-14 by the fixture — its paths are free, and the index was SETTLED as a floor\n\n"
      + "## CLAIM 2026-09-14 FIXTURE (the next area's block)\nsession: somebody else",
    (rows) => !/CLAIM|somebody/.test(rows[0].text));

  return ok && empty.length === 0 && d367 && m097 && d341 ? 0 : 1;
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
} else if (arg === "--check") {
  /* RETIRED BY M0-99, LOUDLY RATHER THAN SILENTLY.  Its only callers were the staleness arms of
     `plancheck` and the push guard, and both retired with it: a file no commit carries cannot be
     stale in anything that is published.  Exit 2, never 0 — a retired check that exited 0 would
     read as a pass to anything still calling it — and never a fall-through to the query below,
     which would answer "--check" as a phrase and exit 0 having checked nothing (the argv
     accident the entry-guard note records). */
  console.error("decided.mjs --check is RETIRED (M0-99, 2026-09-22): docs/DECIDED.md is not committed, so nothing a commit carries can be stale.");
  console.error("`node tools/decided.mjs` brings this working tree's copy to the corpus; `node tools/decided.mjs \"<subject>\"` answers from the corpus itself.");
  process.exit(2);
} else if (!arg || arg === "--write") {
  const f = fresh();
  const unclassified = f.register.filter((e) => e.verdict === "unclassified");
  console.log(`docs/DECIDED.md — ${f.rows.length} rulings, ${(f.body.length / 1024).toFixed(1)} KB`
    + ` · ${f.rows.filter((r) => r.via === "entry").length} from decision-register entries`
    + ` · ${unclassified.length} register entr${unclassified.length === 1 ? "y" : "ies"} UNCLASSIFIED`
    + (unclassified.length ? `: ${unclassified.map((e) => e.id).join(", ")}` : "")
    + ` · ${f.wrote ? `${f.state}, written` : "already current, not rewritten"}`);
} else {
  const q = process.argv.slice(2).join(" ").toLowerCase();
  const register = [];
  const all = scan(undefined, undefined, { sink: register });
  const { filed, byId, hits } = query(q, all);
  if (byId && !filed) {
    /* Not found is not absent: say what the register holds under the id, if anything,
       before anything that merely mentions it. */
    const id = q.trim().toUpperCase();
    for (const e of register.filter((x) => x.id === id))
      console.log(`${e.id} is a decision-register entry, status \`${e.status}\`, at ${e.file}:${e.line} — ${e.why}; nothing is filed under it.`);
    console.log(`No ruling is FILED under ${id}.${hits.length ? ` ${hits.length} ruling(s) MENTION it:` : ""}`);
  }
  if (!hits.length) {
    console.log(`No RULING — a marker sentence or a decision-register entry — mentions "${q}".`);
    console.log("That is a FLOOR, not a ceiling — a decision recorded with neither is invisible");
    console.log("here. Grep the corpus before concluding nothing was decided.");
    process.exit(0);
  }
  for (const r of hits) {
    console.log(`\n${r.id ? r.id + " " : ""}${r.date ? "· " + r.date + " " : ""}${r.status ? "· " + r.status + " " : ""}\n  ${r.text}\n  ${r.file}:${r.line}`);
  }
  console.log(`\n${hits.length} ruling(s).`);
}
