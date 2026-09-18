#!/usr/bin/env node
/* corpuscheck — every design document says what it is, where it sits, what it lacks,
   and what it contains, and says so CURRENTLY.

   Bob, 2026-09-14: the design corpus describes the system across levels; every design
   document — high-level or below — carries front matter that self-describes its
   completeness, a table of contents, and an explicit list of the sections still being
   developed. "Incompleteness should be explicit, not assumed as derivable. All of this
   front matter should always be up to date." The receipt is the Content Framework: written
   and approved 2026-07-30, then 46 days unreferenced by the orientation set and never
   saying what it lacked, while the content construct it owned went undesigned.

   The standard is docs/architecture/CORPUS-STANDARD.md. This tool is its enforcement, run by
   plancheck, so drift FAILS the gate the way a stale DECIDED index does.

   THE FRONT MATTER GRAMMAR (checked, not described):

     # <first heading of the file>            front matter begins on the line after it

     **Status** · <prose ... as of YYYY-MM-DD ...>
     **Place in the system** · <prose>
     **Incomplete sections** · None — <why>        OR a bulleted list follows, every
     - §<number or heading text> — <what is missing>   bullet naming a real section
     **Contents**                                   OR **Contents** (depth N), N in 1..3
     - [<heading text>](#<slug>)                    generated; must equal the body's headings
       - [<subheading>](#<slug>)
     ---                                            end of front matter

   `as of YYYY-MM-DD` must be no earlier than the file's last commit day: a body edit
   that leaves the front matter's date behind is exactly the staleness this exists to catch.
   It appears EXACTLY ONCE, the latest date, at the END of the Status (M0-28): the date
   check reads the FIRST match, so a second `as of` earlier in the prose is the date that
   gets judged while the trailing one a reader bumps is read by nothing. A date written any
   other way ("measured 2026-08-01") is not an `as of` and is left alone.

   USAGE
     node tools/corpuscheck.mjs                 check every governed document; exit 1 on fail
     node tools/corpuscheck.mjs --write [files]  regenerate the Contents block in place
     node tools/corpuscheck.mjs --list           print the governed set
     node tools/corpuscheck.mjs --coverage       print the docs/development/ classification
   Governed: docs/architecture/*.md plus the files listed in CORPUS-STANDARD.md's
   "Governed documents outside docs/architecture" table (one backticked path per row).

   COVERAGE — WHY THIS TOOL WALKS docs/development/ AS WELL AS READING §5 (M0-43).

   The §5 table is HAND-KEPT, and a hand-kept list has the failure mode M0-41's instrument
   census named: not absence but OPTIONAL-AND-UNAUDITED. The tool is right about every
   document it is told about, which is exactly why nobody notices the ones it is not. A
   governed design added under `docs/development/` is checked by NOTHING until somebody
   remembers to add the row.

   THE FIX IS AUDIT, NOT REPLACEMENT, and the distinction is the whole design.
   `docs/architecture/` is a SINGLE-PURPOSE directory, so there the path implies the class
   and a walk can decide governance on its own. `docs/development/` is MIXED — ledgers,
   kickoffs, process documents and designs share it — so a walk there cannot decide
   governance without making a decision that belongs to CORPUS-STANDARD (and to Bob, who
   owns it). What a walk CAN decide is COVERAGE. So:

     discovery establishes the POPULATION      (every .md under docs/development/, recursive)
     the standard's tables decide the CLASS    (§5 governed · §6 excluded · §6 undecided)
     this tool FAILS on any member of the population carrying NO class, BY NAME

   That is the two-way requirement: a file there is GOVERNED or it is EXPLICITLY EXCLUDED
   WITH A REASON, and a new file satisfying neither cannot pass quietly. §6 already excluded
   the ledgers and the process documents by class in prose; this makes that same exclusion
   MACHINE-READABLE so the tool can tell "excluded on purpose" from "nobody looked".

   HOW A LIAR WOULD SATISFY THIS, STATED SO THE TEST CAN REFUSE IT. The cheap defeat is a
   check that walks §5 and reports every entry healthy — congratulating itself over exactly
   the set that was never the problem. Two guards, both driven from OUTSIDE the tables:
     - the suite PLANTS an unclassified .md (and one in a SUBDIRECTORY, because a
       non-recursive walk passes every table-driven arm) and requires a named failure;
     - an EXCLUSION row is a literal path or a single-directory glob, never a `**`, and the
       tool refuses an exclusion that shadows a governed document. A broad pattern is the
       other way to make the population look classified without classifying it.
   The UNDECIDED table is literal paths ONLY and every row must EXIST: it is a CLOSED,
   ENUMERATED hole that somebody drains, not an open bucket that swallows new files. Each
   run PRINTS the per-class counts, because a statement of what was CLASSIFIED beats an
   absence of complaint (CLAUDE.md, `50 governed documents` over `0 fail`). */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STANDARD = "docs/architecture/CORPUS-STANDARD.md";
const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const FENCE = /^(```|~~~)/;

export function governed() {
  const out = new Set();
  const dir = join(ROOT, "docs/architecture");
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).sort()) if (f.endsWith(".md")) out.add(`docs/architecture/${f}`);
  }
  const std = existsSync(join(ROOT, STANDARD)) ? readFileSync(join(ROOT, STANDARD), "utf8") : "";
  // the governed table is the part of §5 BEFORE its first sub-heading; "Not yet governed" rows are not governed
  const sect = (std.split(/^## /m).find((s) => /^(\d+\.\s*)?Governed documents outside/i.test(s)) || "").split(/^### /m)[0];
  for (const m of sect.matchAll(/^\|\s*`([^`]+\.md)`/gm)) out.add(m[1]);
  return [...out];
}

/* ---------------------------------------------------------------- COVERAGE (M0-43)

   The population: every `.md` under docs/development/, RECURSIVELY — `research/` holds
   three governed documents, so a flat `readdirSync` would leave a real subdirectory of the
   design corpus outside the audit while passing every table-driven arm. */
export const DEVDIR = "docs/development";

export function population(dir = DEVDIR) {
  const out = [];
  const walk = (rel) => {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) return;
    for (const e of readdirSync(abs).sort()) {
      const r = `${rel}/${e}`;
      if (statSync(join(ROOT, r)).isDirectory()) walk(r);
      else if (e.endsWith(".md")) out.push(r);
    }
  };
  walk(dir);
  return out;
}

function standardText() {
  return existsSync(join(ROOT, STANDARD)) ? readFileSync(join(ROOT, STANDARD), "utf8") : "";
}

/* The body of a `## <n>. <title>` section, up to its first `### ` sub-heading. */
function section(std, re) {
  return (std.split(/^## /m).find((s) => re.test(s)) || "").split(/^### /m)[0];
}
/* The body of a `### <title>` sub-section, up to the next `## ` or `### `. */
function subsection(std, re) {
  const parts = std.split(/^### /m);
  const hit = parts.find((s) => re.test(s));
  return hit ? hit.split(/^## /m)[0] : "";
}

/* A row's pattern cell. Literal path, or ONE `dir/*.md` glob — never `**`, and never a
   pattern with no `.md` suffix, because both are ways to classify the population without
   classifying anything. `bad` is returned rather than thrown so the CLI can name the row. */
export function matchPattern(pat, path) {
  if (pat === path) return true;
  const g = /^(.+)\/\*\.md$/.exec(pat);
  return !!g && path.startsWith(`${g[1]}/`) && path.slice(g[1].length + 1).endsWith(".md")
    && !path.slice(g[1].length + 1).includes("/");
}

export function excluded() {
  const sect = section(standardText(), /^(\d+\.\s*)?What this standard does not govern/i);
  const rows = [];
  for (const m of sect.matchAll(/^\|\s*`([^`]+)`\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|/gm)) {
    rows.push({ pattern: m[1].trim(), klass: m[2].trim(), why: m[3].trim() });
  }
  return rows;
}

export function undecided() {
  const sect = subsection(standardText(), /^Undecided —/i);
  const rows = [];
  for (const m of sect.matchAll(/^\|\s*`([^`]+\.md)`\s*\|\s*([^|]*?)\s*\|/gm)) {
    rows.push({ path: m[1].trim(), question: m[2].trim() });
  }
  return rows;
}

/* The audit. Returns every class plus the failures, so plancheck, the CLI and the suite
   all read ONE computation rather than three that can disagree.

   `pop` is injectable for ONE reason and it is stated so the next reader does not mistake
   it for a seam that weakens the check: the suite must PLANT an unclassified file to prove
   the walk looks OUTSIDE the tables, and writing a fixture into `docs/development/` while a
   concurrent battery reads that directory is the contamination class this project has
   already paid for. The walk itself is asserted separately and directly against the REAL
   tree, including a file in a SUBDIRECTORY, so an injected plant cannot hide a
   non-recursive `population()`. */
export function coverage({ pop = population() } = {}) {
  const gov = new Set(governed().filter((p) => p.startsWith(`${DEVDIR}/`)));
  const exc = excluded();
  const und = undecided();
  const undPaths = new Set(und.map((r) => r.path));
  const fails = [];

  for (const r of exc) {
    if (/\*\*/.test(r.pattern) || !r.pattern.endsWith(".md")) {
      fails.push(`${STANDARD} §6: exclusion pattern \`${r.pattern}\` is too broad — a row is a literal `
        + `\`path.md\` or one \`dir/*.md\`, never a \`**\`, because a pattern that swallows the directory `
        + `classifies the population without classifying anything`);
      continue;
    }
    if (!r.why || r.why.length < 12) {
      fails.push(`${STANDARD} §6: exclusion \`${r.pattern}\` carries no reason — §6's model is excluded WITH A REASON, not merely absent`);
    }
    const shadowed = [...gov].filter((p) => matchPattern(r.pattern, p));
    if (shadowed.length) {
      fails.push(`${STANDARD} §6: exclusion \`${r.pattern}\` shadows governed document(s) ${shadowed.join(", ")} — a file cannot be both governed and excluded`);
    }
  }
  for (const r of und) {
    if (!existsSync(join(ROOT, r.path))) {
      fails.push(`${STANDARD} §6: UNDECIDED row \`${r.path}\` names a file that does not exist — the undecided list is drained, not left to rot`);
    }
    if (gov.has(r.path)) {
      fails.push(`${STANDARD} §6: UNDECIDED row \`${r.path}\` is also in §5's governed table — it is decided; drop the row`);
    }
  }

  const classOf = (p) => {
    if (gov.has(p)) return "governed";
    const e = exc.find((r) => matchPattern(r.pattern, p));
    if (e) return "excluded";
    if (undPaths.has(p)) return "undecided";
    return null;
  };
  const by = { governed: [], excluded: [], undecided: [], unclassified: [] };
  for (const p of pop) by[classOf(p) ?? "unclassified"].push(p);

  for (const p of by.unclassified) {
    fails.push(`UNCLASSIFIED — ${p} is under ${DEVDIR}/ and the standard does not say what it is. `
      + `Add it to CORPUS-STANDARD.md §5 (governed, and give it front matter), to §6's exclusions `
      + `WITH A REASON, or to §6's UNDECIDED table and route it. A design document nobody classified `
      + `is checked by nothing.`);
  }
  return { ...by, population: pop, exclusions: exc, undecidedRows: und, fails };
}

/* ====================================================== THE SECOND AUTHORITY ON DESIGN STATUS (M0-57)

   BOB, 2026-09-17, ruled `BIO_System_Design.md` §3 — the construct map — the SINGLE AUTHORITY on
   design status, and asked "that there aren't multiple sources of truth elsewhere in the record".

   THE RECEIPT IS A SESSION'S OWN ERROR, which is why this is an instrument rather than a
   correction. BOB #12 told Bob the claim class was UNDESIGNED, because the Content Framework's
   §18 table lists "the claim object" among the pieces still to be designed — while the design had
   existed in `BIO_Case_Making_v0_1.md` since 2026-08-03. Nobody was careless. A to-do list that
   RESTATES a status is a SECOND AUTHORITY, and this project's standing finding is that restated
   content is a copy that starts rotting the moment it is written. Care does not catch that class;
   an instrument does.

   ---------------------------------------------------------------- THE MATCH IS THE HARD PART

   Deciding that a §18 table row and a §3 construct-map row are ABOUT THE SAME CONSTRUCT is a
   JUDGEMENT. An arm that guesses it fires on healthy pairs, and **an arm that fires on a healthy
   state is worse than no arm** — it is switched off inside a week and takes its true positives
   with it. So the match was MEASURED before it was chosen:

     PROSE SIMILARITY IS NOT AVAILABLE HERE, and that is a measurement, not an opinion. §3 names
     construct 8 "Intent and inquiry — from goal to case"; §18 names the piece "the claim object".
     The two vocabularies share NOT ONE content word. Any similarity threshold loose enough to
     pair them would pair most of the corpus with most of the corpus.

   What IS available is an EXPLICIT KEY that the authority itself wrote: §3's construct-8 row
   carries the citation `(Part II §18 item 6)`. That is the construct map — the single authority —
   declaring which §18 item belongs to which construct. The tool does not infer the pairing; it
   READS one the map's author stated. **Narrow beats general here, and the coverage not obtained
   is stated rather than implied closed** (see `--authority` and the suite).

   HOW A LIAR WOULD SATISFY THIS, STATED BEFORE WHAT IT CHECKS. The cheapest green is an arm
   matching on a HAND-WRITTEN PAIR LIST inside this file containing exactly the one known receipt:
   it fails the receipt, passes everything else, and detects nothing that was not already found by
   hand. **The criterion that excludes it: a NEW instance must be caught with NO EDIT TO THIS
   FILE.** The pair list lives in the CORPUS, written by the authority in its ordinary voice, so
   any future construct row that cites `§N item M` into a to-design list is judged on sight. The
   suite drives that claim directly — a SECOND, synthetic construct/document/item triple fires the
   arm with the tool untouched — because an arm that only ever evaluates one pair is the liar's
   arm whatever its author intended.

   THE FOUR SIGNALS, ALL AUTHORED BY THE CORPUS, ALL REQUIRED TOGETHER. A conjunction is chosen
   deliberately over a disjunction: it narrows, and under-reach here is a stated bound while
   over-reach is a dead instrument.
     1. §3's row for construct N carries a resolvable item citation `§<sec> item <n>`.
     2. The cited SECTION asserts its items are still to be designed (its heading or its preamble
        speaks the undesignedness vocabulary below).
     3. The cited ITEM does not itself say where its design lives. A row that names a design
        document, or says DESIGNED, is POINTING rather than restating and is healthy — which is
        why §18's items 1–4, which do exactly that, are silent here.
     4. Another document named in that construct row's HOME cell both (a) declares construct N in
        its own `Place in the system` line and (b) carries a BODY HEADING containing EVERY content
        word of the cited item's own bold key. Two independent statements, neither guessed.

   THE CORPUS PROPERTY THAT DECIDES THIS, MEASURED BY THE NEIGHBOURING INSTRUMENT RATHER THAN
   ASSUMED HERE. `tools/rowsubstrate.mjs` asks whether a cited design SECTION mentions a ROW's
   backticked code identifiers, and its precision is now 1 TRUE OF 3 VERIFIED (CONDUCT #3,
   2026-09-17). **Both false positives share one mechanism: THE DESIGN NAMES THE RULE, NOT THE
   IDENTIFIER** — one section was topically right and never wrote the op's name, another stated the
   rule in prose and never wrote the marker's name. That is a fact about how this corpus is
   WRITTEN, and any matcher here must survive it.

   **THIS ARM INHERITS THE SAME PROPERTY AND FAILS IN THE OPPOSITE DIRECTION, WHICH IS THE WHOLE
   REASON IT CAN AFFORD TO FAIL RATHER THAN WARN.** A home document that designs a piece while
   naming only the rule — no heading carrying the piece's own words — reads to signal 4 as ABSENT,
   so the arm STAYS SILENT. rowsubstrate's miss produces a WARN nobody owed (a false alarm, which
   is how an instrument gets switched off); this arm's miss produces UNDER-REACH (a stated bound,
   which M0-58's sweep exists to measure). Given a corpus that names rules rather than identifiers,
   under-reach is the survivable failure and over-reach is not — so signal 4 was kept at HEADING
   grain rather than widened to the body, and the control's arm 5 drives exactly that widening to
   show it breaks the healthy state.

   WHAT IT DELIBERATELY DOES NOT DO. It does not read prose bodies for design; a heading is the
   narrowest honest evidence that a document has a section ABOUT the piece. It does not judge
   whether that section's design is ADEQUATE — `rowsubstrate.mjs` asks a neighbouring question
   about ROWS and WARNS; this asks about DOCUMENTS and FAILS, because a contradiction between two
   governed documents is a defect rather than a question. And it says UNRESOLVED out loud when a
   citation names a section or item it cannot find, because a citation silently skipped is the
   unearned-absence class this whole family belongs to.

   THE COVERAGE NOT OBTAINED, STATED PLAINLY BECAUSE M0-58's SWEEP TAKES IT AS INPUT: an
   undesignedness claim that no §3 row cites is INVISIBLE to this arm; a citation of any other
   shape (`Part II §18` with no item, `§14.2–14.3`, a bare document reference) is NOT resolved; a
   bold key of fewer than two content words is SKIPPED rather than matched on one generic noun;
   and a home document that designs a piece without a heading naming it reads as absent. */

export const MAP_DOC = "docs/architecture/BIO_System_Design.md";
export const MAP_SECTION = /^(\d+\.\s*)?The major constructs/i;

/* The vocabulary in which this corpus says a thing is not designed. Kept literal and short:
   every alternative below is lifted from a governed document's own words.

   WHAT THE GAP BETWEEN TWO WORDS MAY SPAN — M0-61, argued here rather than assumed, because the
   row that cut it named the symptom as "`\s` matches a NEWLINE" and the obvious fix (a literal
   space) was measured to be WRONG.

   **IT SPANS ONE SOFT LINE BREAK, DELIBERATELY.** This corpus is hard-wrapped prose, and in
   Markdown a single newline inside a paragraph is a SOFT BREAK that renders as a space: the
   editor's wrap column decides where it falls, not the author. So "to be\ndesigned" is the same
   phrase as "to be designed", and a predicate that refused it would make a claim's visibility
   depend on the wrap column. Measured 2026-09-18 over the 50 governed documents: 50 matches, 3
   of them across a line break, and **2 of those 3 are GENUINE claims** —
   `BIO_Content_Framework_v0_10.md` Part II's "what remains to be\ndesigned" and
   `BIO_Functional_Architecture_v3.md`'s "the UI, which still needs to be\ndesigned". A literal
   space would have lost both.

   **AND THE THIRD, THE ONE THAT FOUND THIS, IS NOT A WHITESPACE DEFECT AT ALL.**
   `research/RECONCILED.md` §2.2's "...designed wrongly once and not\ndesigned once." would trip
   IDENTICALLY had the editor wrapped two words earlier; the newline is a CORRELATE of that false
   trip, not its cause. Its cause is that `statussweep` attributed a sentence 187 lines above a
   table to that table — see the remote-trip classifier there, which is where it is now handled.
   Excluding the newline would have "fixed" that one receipt by accident of the wrap position and
   left every other misattributed trip in place: the cheapest green, which the row named first.

   **WHAT IT DOES NOT SPAN, AND THAT IS THE NARROWING:** a PARAGRAPH BREAK — a blank line, or any
   run of two or more newlines. Words either side of one belong to different statements (a
   heading's last word and the next paragraph's first, a table row and the prose under it), and
   `\s+` joined them. A break into another block (a line opening `|`, `#`, `>`, a list marker)
   was never spanned by either form, because the marker is not whitespace. The narrowing
   moved NO live result on 2026-09-18 — no match in the governed set crossed either — so
   `corpuscheck` and `statussweep` output is byte-identical; it is a fuse removed before a caller
   reaches it, not a correction of a figure. Tabs and runs of spaces remain legitimate.

   Bound, stated: a soft break inside a BLOCKQUOTE ("not\n> designed") is not spanned — the old
   `\s+` did not span it either, since `>` is not whitespace, so this is inherited, not new. */
const GAP = String.raw`(?:[ \t]+(?:\r?\n)?|\r?\n)[ \t]*`;
export const UNDESIGNED = new RegExp(
  [String.raw`\bundesigned\b`, String.raw`\bnot${GAP}(?:yet${GAP})?designed\b`, String.raw`\bto${GAP}be${GAP}designed\b`,
    String.raw`\bpieces?${GAP}to${GAP}design\b`, String.raw`\bdesigned${GAP}nowhere\b`, String.raw`\bDOCTRINE${GAP}still\b`].join("|"),
  "i");

/* An item that NAMES where its design lives is pointing, not restating — signal 3. */
export const POINTS_AT_A_DESIGN = (cell) => /\bDESIGNED\b/.test(cell) || /`[^`]+\.md`/.test(cell);

const KEY_STOPWORDS = new Set(["the", "a", "an", "and", "or", "of", "its", "it", "for", "to", "in",
  "on", "as", "is", "are", "that", "this", "with", "by", "from", "at", "be"]);

/* A row's bold key reduced to its content words. Two or more, or the pair is SKIPPED. */
export function keyWords(bold) {
  return (bold || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/)
    .filter((w) => w.length > 2 && !KEY_STOPWORDS.has(w));
}

/* A home cell names documents by bare filename — level 1 lives in `docs/architecture/`, but a
   level-2 design is named the same way (`INVESTIGATIVE-SESSION.md`) and lives under
   `docs/development/`. Both are tried; a name that resolves to neither is left as written so the
   caller reports it UNRESOLVED rather than silently dropping it. */
function resolveDoc(name) {
  if (name.includes("/")) return name;
  for (const d of ["docs/architecture", "docs/development"]) {
    if (existsSync(join(ROOT, `${d}/${name}`))) return `${d}/${name}`;
  }
  return `docs/architecture/${name}`;
}

function readDoc(path) {
  const abs = join(ROOT, path);
  return existsSync(abs) ? readFileSync(abs, "utf8") : null;
}

/* The body of the section whose heading begins `<sec>.` — up to the next heading of the same or
   a higher level, so a `## 18.` section keeps its `###` children and stops at `## 19.`. */
export function numberedSection(text, sec) {
  const lines = text.split("\n");
  const esc = sec.replace(/\./g, "\\.");
  const re = new RegExp(`^(#{2,6})\\s+${esc}[.·:\\s]`);
  let start = -1, level = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = re.exec(lines[i]);
    if (m) { start = i; level = m[1].length; break; }
  }
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const h = HEADING.exec(lines[i]);
    if (h && h[1].length <= level) { end = i; break; }
  }
  return { heading: lines[start], body: lines.slice(start, end).join("\n") };
}

/* The first table in a section, as rows of cells. The preamble is everything before it — where a
   list states, in prose, that what follows is still to be designed. */
export function firstTable(body) {
  const lines = body.split("\n");
  const at = lines.findIndex((l) => /^\|/.test(l));
  if (at < 0) return { preamble: body, rows: [] };
  const rows = [];
  for (let i = at; i < lines.length && /^\|/.test(lines[i]); i++) {
    rows.push({ raw: lines[i], cells: lines[i].split("|").slice(1, -1).map((c) => c.trim()) });
  }
  return { preamble: lines.slice(0, at).join("\n"), rows };
}

/* §3's construct map, as rows keyed by the header cells the document itself writes. */
export function constructMap(text = readDoc(MAP_DOC)) {
  if (!text) return [];
  const sect = section(text, MAP_SECTION);
  if (!sect) return [];
  const { rows } = firstTable(sect);
  if (!rows.length) return [];
  const head = rows[0].cells.map((c) => c.toLowerCase().replace(/[^a-z]/g, ""));
  const col = (name) => head.indexOf(name);
  const iN = col(""), iHome = col("home"), iState = col("state"), iName = col("construct");
  const out = [];
  for (const r of rows.slice(1)) {
    if (/^[-: ]+$/.test(r.cells[0] ?? "")) continue;          /* the |---| separator */
    const n = Number(r.cells[iN < 0 ? 0 : iN]);
    if (!Number.isInteger(n)) continue;
    out.push({
      n,
      construct: (r.cells[iName] || "").replace(/\*\*/g, ""),
      home: r.cells[iHome] ?? "",
      state: r.cells[iState] ?? "",
      raw: r.raw,
    });
  }
  return out;
}

/* THE AUDIT. Returns every pair it could evaluate, every citation it could NOT resolve, and the
   failures — one computation read by the CLI, plancheck and the suite alike. `mapText` is
   injectable for exactly one reason, stated so it is not mistaken for a seam: the suite must
   drive a SECOND, synthetic triple to prove the pairing comes from the corpus rather than from a
   list in this file, and writing a fixture construct row into the real map during a concurrent
   battery is the contamination class this project has already paid for. The REAL map is asserted
   separately and directly. */
export function statusAuthority({ mapText = readDoc(MAP_DOC), docs = null } = {}) {
  const read = (p) => (docs && p in docs ? docs[p] : readDoc(p));
  const rows = constructMap(mapText);
  const pairs = [], unresolved = [], fails = [];
  const CITE = /§\s*(\d+(?:\.\d+)*)\s+item\s+(\d+)/gi;

  for (const row of rows) {
    const named = [...row.raw.matchAll(/`([^`]+\.md)`/g)].map((m) => resolveDoc(m[1]));
    for (const c of row.raw.matchAll(CITE)) {
      const [, sec, itemNo] = c;
      const where = `${MAP_DOC} §3 construct ${row.n} cites §${sec} item ${itemNo}`;

      /* Signal 1 — the citation must resolve to a section of a document the row itself names. */
      const citing = named.map((p) => ({ path: p, text: read(p) }))
        .find((d) => d.text && numberedSection(d.text, sec));
      if (!citing) { unresolved.push(`${where} — no document named in that row has a §${sec}`); continue; }
      const sect = numberedSection(citing.text, sec);

      /* Every RESOLVED citation is recorded with the verdict it earned — never skipped silently.
         `0 fail` cannot tell a corpus with one authority from an arm that evaluated nothing, and
         this instrument's whole family is *a reader concluding a value from an absence*. */
      const item0 = firstTable(sect.body).rows.find((r) => r.cells[0] === itemNo);
      const bold = item0 ? (/\*\*([^*]+)\*\*/.exec(item0.raw) || [])[1] : undefined;
      const pair = { construct: row.n, citing: citing.path, sec, item: itemNo, key: bold ?? null, covering: null, verdict: null };
      pairs.push(pair);
      const verdict = (v) => { pair.verdict = v; return null; };

      /* Signal 2 — the cited list asserts its items are still to be designed. */
      const { preamble, rows: items } = firstTable(sect.body);
      if (!UNDESIGNED.test(sect.heading) && !UNDESIGNED.test(preamble)) { verdict("list-claims-no-undesignedness"); continue; }

      /* Signal 3 — and the cited item does not say where its own design lives. */
      const item = items.find((r) => r.cells[0] === itemNo);
      if (!item) { pairs.pop(); unresolved.push(`${where} — §${sec} of ${citing.path} has no item ${itemNo}`); continue; }
      if (POINTS_AT_A_DESIGN(item.raw)) { verdict("points-at-its-design"); continue; }
      const words = keyWords(bold);
      if (words.length < 2) {
        pairs.pop();
        unresolved.push(`${where} — item ${itemNo}'s key ${JSON.stringify(bold ?? null)} has fewer than two content words, `
          + `and one generic noun is not a match this arm will make`);
        continue;
      }

      /* Signal 4 — another home document declares this construct AND has a heading for the piece. */
      let hit = null;
      for (const p of named) {
        if (p === citing.path) continue;
        const text = read(p);
        if (!text) continue;
        const fm = parseFront(text.split("\n"));
        if (fm.error || !new RegExp(`construct\\s+${row.n}\\b`, "i").test(fm.place)) continue;
        const heading = bodyHeadings(text.split("\n"), fm.blockEnd, 6)
          .find((h) => words.every((w) => new RegExp(`\\b${w}\\b`, "i").test(h.text)));
        if (heading) { hit = { path: p, heading: heading.text }; break; }
      }
      if (!hit) { verdict("honestly-undesigned — no home document this map names covers it"); continue; }
      pair.covering = hit.path;
      verdict("RESTATED");

      fails.push(`DESIGN STATUS RESTATED — construct ${row.n} (${row.construct}): `
        + `${citing.path} §${sec} item ${itemNo} — "${bold}" — lists it among the pieces still TO BE DESIGNED, `
        + `while ${hit.path}, which ${MAP_DOC} §3 names as that construct's home and which declares construct ${row.n} `
        + `in its own Place line, carries the section "${hit.heading}". ${MAP_DOC} §3 is the SINGLE AUTHORITY on design `
        + `status (Bob, 2026-09-17): a to-do list that RESTATES status is a second authority and rots. `
        + `Correct it AT ITS SOURCE — have §${sec} item ${itemNo} POINT at ${hit.path} the way its neighbours do — `
        + `and, where the map's own state cell repeats the stale status, correct that too. Never exempt it.`
        + (UNDESIGNED.test(row.state) ? ` (${MAP_DOC} §3's own state cell for construct ${row.n} repeats it.)` : ""));
    }
  }
  return { rows: rows.length, pairs, unresolved, fails };
}

/* GitHub-style slug, the one most viewers resolve. Duplicate headings get -1, -2 … */
export function slugger() {
  const seen = new Map();
  return (text) => {
    let s = text.toLowerCase().replace(/<[^>]+>/g, "").replace(/`/g, "")
      .replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s+/g, "-");
    const n = seen.get(s) ?? 0; seen.set(s, n + 1);
    return n ? `${s}-${n}` : s;
  };
}

/* Headings of the BODY (after the front matter), fences skipped, levels 1..depth. */
export function bodyHeadings(lines, from, depth) {
  const out = []; let fenced = false;
  for (let i = from; i < lines.length; i++) {
    const l = lines[i];
    if (FENCE.test(l)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const m = HEADING.exec(l);
    if (m && m[1].length <= depth) out.push({ level: m[1].length, text: m[2].trim(), line: i + 1 });
  }
  return out;
}

export function renderContents(heads) {
  const slug = slugger();
  const min = Math.min(...heads.map((h) => h.level));
  return heads.map((h) => `${"  ".repeat(h.level - min)}- [${h.text}](#${slug(h.text)})`);
}

/* Locate the front matter block. Returns {start, end, fields, depth} or {error}. */
export function parseFront(lines) {
  const first = lines.findIndex((l) => HEADING.test(l));
  if (first < 0) return { error: "no heading at all — a document needs a title line" };
  let i = first + 1;
  // the block ends at a `---` line or at the next heading, whichever comes first
  let end = -1;
  for (let j = i; j < lines.length; j++) {
    if (/^---\s*$/.test(lines[j])) { end = j; break; }
    if (HEADING.test(lines[j])) { end = j; break; }
  }
  if (end < 0) end = lines.length;
  const block = lines.slice(i, end);
  const idx = (label) => block.findIndex((l) => l.startsWith(`**${label}**`));
  const fields = {
    status: idx("Status"), place: idx("Place in the system"),
    incomplete: idx("Incomplete sections"), contents: idx("Contents"),
  };
  const missing = Object.entries(fields).filter(([, v]) => v < 0).map(([k]) => k);
  if (missing.length) return { error: `front matter lacks ${missing.join(", ")} (block is lines ${i + 1}-${end})`, start: i, end };
  const order = ["status", "place", "incomplete", "contents"];
  for (let k = 1; k < order.length; k++) {
    if (fields[order[k]] < fields[order[k - 1]]) return { error: `front matter fields out of order — Status, Place in the system, Incomplete sections, Contents`, start: i, end };
  }
  const dm = /^\*\*Contents\*\*\s*(?:\(depth\s*([1-3])\))?/.exec(block[fields.contents]);
  const depth = dm && dm[1] ? Number(dm[1]) : 3;
  const seg = (k) => {
    const from = fields[k]; const next = order[order.indexOf(k) + 1];
    const to = next ? fields[next] : block.length;
    return block.slice(from, to);
  };
  return {
    start: i, end, depth, blockEnd: end,
    status: seg("status").join("\n"),
    place: seg("place").join("\n"),
    incomplete: seg("incomplete"),
    contents: seg("contents").slice(1).filter((l) => l.trim() !== ""),
    contentsLine: i + fields.contents,
    contentsEnd: i + block.length,
  };
}

function lastCommitDay(path) {
  try {
    const out = execSync(`git log -1 --format=%as -- ${JSON.stringify(path)}`, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return out || null;
  } catch { return null; }
}

/* Refs that name the document's own matter rather than a section — always resolvable. */
const POSITIONAL = new Set(["whole document", "header", "preamble", "footer", "title", "front matter",
  "banner", "changelog", "references", "revision history", "status line"]);

function sectionIds(heads) {
  return heads.map((h) => {
    const num = /^(\d+(?:\.\d+)*[a-z]?|[A-Z]\d*)[.·:\s]/.exec(h.text);
    return { num: num ? num[1] : null, text: h.text.toLowerCase() };
  });
}

export function checkFile(path, { git = true } = {}) {
  const abs = isAbsolute(path) ? path : join(ROOT, path);
  if (!existsSync(abs)) return { path, fails: [`MISSING — ${path} is governed and does not exist`], notes: [] };
  const text = readFileSync(abs, "utf8");
  const lines = text.split("\n");
  const fails = [], notes = [];
  const fm = parseFront(lines);
  if (fm.error) return { path, fails: [`NO FRONT MATTER — ${path}: ${fm.error}`], notes };

  // Status: an `as of YYYY-MM-DD` and it is not behind the file's last commit
  const asOf = /as of (\d{4}-\d{2}-\d{2})/.exec(fm.status);
  if (!asOf) fails.push(`${path}: Status carries no \`as of YYYY-MM-DD\` — a completeness statement with no date cannot be judged current`);
  else if (git) {
    const last = lastCommitDay(path);
    if (last && last > asOf[1]) fails.push(`${path}: Status says \`as of ${asOf[1]}\` but the file last changed ${last} — the body moved and the front matter did not`);
  }
  /* ONE `as of`, the LATEST, at the END of the Status — CORPUS-STANDARD.md §3 (M0-28).
     The check above `exec`s the FIRST match, so a Status carrying a second, earlier `as of`
     in its prose is judged on a date no editor would think to bump, and bumping the trailing
     date a reader can see changes nothing the checker reads. SK-6 swept the governed set and
     found three documents carrying two dates — benign only because the two were EQUAL, live
     the next time one of them was edited. A date in any OTHER form ("measured 2026-08-01") is
     not matched, so a Status may still say when a measurement was taken. */
  const asOfAll = [...fm.status.matchAll(/as of (\d{4}-\d{2}-\d{2})/g)].map((m) => m[1]);
  if (asOfAll.length > 1) fails.push(`${path}: Status carries ${asOfAll.length} \`as of\` dates — ${asOfAll.join(" then ")} — and only the first (${asOfAll[0]}) is judged; keep ONE, the latest, at the END of the Status (CORPUS-STANDARD.md §3)`);
  if (fm.status.replace(/^\*\*Status\*\*\s*·?\s*/, "").trim().length < 40) fails.push(`${path}: Status is too short to describe completeness`);
  if (fm.place.replace(/^\*\*Place in the system\*\*\s*·?\s*/, "").trim().length < 40) fails.push(`${path}: Place in the system is too short to place the construct`);

  // Body headings and Contents
  const heads = bodyHeadings(lines, fm.blockEnd, fm.depth);
  if (!heads.length) fails.push(`${path}: no headings after the front matter — nothing for a Contents to index`);
  const want = renderContents(heads);
  const have = fm.contents;
  if (want.join("\n") !== have.join("\n")) {
    const firstDiff = want.findIndex((l, k) => l !== have[k]);
    const k = firstDiff < 0 ? Math.min(want.length, have.length) : firstDiff;
    fails.push(`${path}: Contents does not match the headings (first difference at entry ${k + 1}:\n`
      + `          have ${JSON.stringify(have[k] ?? "<end>")}\n          want ${JSON.stringify(want[k] ?? "<end>")})\n`
      + `        Run \`node tools/corpuscheck.mjs --write ${path}\`.`);
  }

  // Incomplete sections: `None — ...` or bullets naming real sections
  const inc = fm.incomplete;
  const head = inc[0].replace(/^\*\*Incomplete sections\*\*\s*·?\s*/, "").trim();
  const bullets = inc.slice(1).filter((l) => /^\s*[-*]\s+/.test(l));
  if (/^None\b/.test(head)) {
    if (!/—|-/.test(head) || head.length < 12) fails.push(`${path}: Incomplete sections says None without saying how that was established`);
    if (bullets.length) fails.push(`${path}: Incomplete sections says None and then lists ${bullets.length} bullet(s)`);
  } else {
    if (!bullets.length) fails.push(`${path}: Incomplete sections is neither \`None — <how checked>\` nor a bulleted list`);
    const ids = sectionIds(bodyHeadings(lines, fm.blockEnd, 6));
    for (const b of bullets) {
      const m = /^\s*[-*]\s+§\s*([^—]+?)\s+—\s+\S/.exec(b);
      if (!m) { fails.push(`${path}: Incomplete bullet is not \`- §<section> — <what is missing>\`: ${b.trim().slice(0, 80)}`); continue; }
      const ref = m[1].trim();
      const refs = ref.split(/\s*[,/]\s*|\s+and\s+/).map((r) => r.trim()).filter(Boolean);
      for (const r of refs) {
        const rl = r.toLowerCase().replace(/^§\s*/, "");
        const hit = POSITIONAL.has(rl) || ids.some((s) => (s.num && s.num.toLowerCase() === rl) || s.text.includes(rl) || (s.num && rl.startsWith(s.num.toLowerCase() + " ")));
        if (!hit) fails.push(`${path}: Incomplete sections names §${r}, which is not a section of the document`);
      }
    }
    notes.push(`${path}: ${bullets.length} incomplete section(s) declared`);
  }
  return { path, fails, notes, heads: heads.length };
}

export function writeContents(path) {
  const abs = isAbsolute(path) ? path : join(ROOT, path);
  const lines = readFileSync(abs, "utf8").split("\n");
  const fm = parseFront(lines);
  if (fm.error) throw new Error(`${path}: ${fm.error} — write the Status, Place, and Incomplete sections first; only Contents is generated`);
  const heads = bodyHeadings(lines, fm.blockEnd, fm.depth);
  const rendered = renderContents(heads);
  const header = lines[fm.contentsLine];
  const out = [...lines.slice(0, fm.contentsLine), header, ...rendered, "", ...lines.slice(fm.contentsEnd)];
  // collapse a doubled blank before the closing ---
  const text = out.join("\n").replace(/\n\n\n(---\s*\n)/, "\n\n$1");
  writeFileSync(abs, text);
  return rendered.length;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  if (args.includes("--list")) { for (const p of governed()) console.log(p); process.exit(0); }
  if (args.includes("--coverage")) {
    const c = coverage();
    for (const k of ["governed", "excluded", "undecided", "unclassified"]) {
      console.log(`  ${k.padEnd(13)} ${String(c[k].length).padStart(3)}`);
      if (k === "undecided" || k === "unclassified") for (const p of c[k]) console.log(`      ${p}`);
    }
    for (const f of c.fails) console.log(`  FAIL  ${f}`);
    console.log(`\ncorpuscheck --coverage: ${c.population.length} document(s) under ${DEVDIR}/, ${c.fails.length} fail`);
    process.exit(c.fails.length ? 1 : 0);
  }
  if (args.includes("--authority")) {
    const a = statusAuthority();
    console.log(`  construct map rows   ${a.rows}`);
    for (const p of a.pairs) {
      console.log(`  pair    construct ${p.construct} · ${p.citing} §${p.sec} item ${p.item} "${p.key}" `
        + `→ ${p.verdict}${p.covering ? ` (covered by ${p.covering})` : ""}`);
    }
    for (const u of a.unresolved) console.log(`  UNRESOLVED  ${u}`);
    for (const f of a.fails) console.log(`  FAIL  ${f}`);
    console.log(`\ncorpuscheck --authority: ${a.pairs.length} cited pair(s) evaluated, `
      + `${a.unresolved.length} citation(s) unresolved, ${a.fails.length} fail`);
    process.exit(a.fails.length ? 1 : 0);
  }
  if (args.includes("--write")) {
    const files = args.filter((a) => !a.startsWith("--")).map((a) => relative(ROOT, join(process.cwd(), a)).replace(/\\/g, "/"));
    const set = files.length ? files : governed();
    for (const p of set) { const n = writeContents(p); console.log(`  wrote ${n} Contents entries into ${p}`); }
    process.exit(0);
  }
  const noGit = args.includes("--no-git");
  let fails = 0, docs = 0;
  for (const p of governed()) {
    const r = checkFile(p, { git: !noGit }); docs++;
    for (const n of r.notes) console.log(`  note  ${n}`);
    for (const f of r.fails) { console.log(`  FAIL  ${f}`); fails++; }
  }
  /* M0-43: the coverage audit runs in the same pass, so the DEFAULT invocation — the one
     plancheck and every session actually runs — is the one that notices a design document
     nobody classified. A flag nobody passes is not a mechanism. */
  const cov = coverage();
  for (const f of cov.fails) { console.log(`  FAIL  ${f}`); fails++; }
  /* M0-57: and in the same pass, the SECOND-AUTHORITY arm — a flag nobody passes is not a
     mechanism, so it runs by default the way the coverage audit does. The note states what was
     EVALUATED and what could not be RESOLVED, because `0 fail` cannot tell a corpus with one
     authority from a corpus nobody asked. */
  const auth = statusAuthority();
  for (const f of auth.fails) { console.log(`  FAIL  ${f}`); fails++; }
  for (const u of auth.unresolved) console.log(`  note  authority: UNRESOLVED citation — ${u}`);
  console.log(`  note  design status: ${MAP_DOC} §3 is the single authority; ${auth.rows} construct row(s), `
    + `${auth.pairs.length} cited pair(s) evaluated, ${auth.unresolved.length} unresolved`);
  console.log(`\ncorpuscheck: ${docs} governed document(s); under ${DEVDIR}/ ${cov.population.length} document(s) `
    + `— ${cov.governed.length} governed, ${cov.excluded.length} excluded, ${cov.undecided.length} undecided, `
    + `${cov.unclassified.length} unclassified; ${fails} fail`);
  process.exit(fails ? 1 : 0);
}
