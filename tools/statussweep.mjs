#!/usr/bin/env node
/* statussweep — M0-58. THE SWEEP FOR A SECOND STATEMENT OF DESIGN STATUS, AND THE MEASUREMENT
   OF WHAT M0-57's ARM CANNOT REACH.

   Bob, 2026-09-17: *"other areas to confirm that there aren't multiple sources of truth
   elsewhere in the record."* M0-57 built the arm; this is the sweep it was built for.

   IT REPORTS. IT DOES NOT FIX, AND IT DOES NOT GATE — it exits 0 with findings on stdout.
   That is a decision rather than an omission. Which of two copies is the authority is a
   judgement per case, so a sweep that picked one would be the second-authority defect
   arriving dressed as a remedy, and a checker that FAILED here would force that choice on
   whoever was unlucky enough to be pushing. `corpuscheck --authority` fails on the one
   shape the corpus has already adjudicated; this reports the shapes nobody has.

   WHAT IT IS, IN ONE LINE: M0-57's signals 2, 3 and 4 run WITHOUT signal 1.

   `corpuscheck`'s `statusAuthority()` requires FOUR signals to coincide, and the first is
   that `BIO_System_Design.md` §3 CITED the claim by `§N item M`. That citation is what makes
   the arm safe enough to FAIL — it reads a pairing the map's own author stated rather than
   inferring one. It is also what makes it NARROW: an undesignedness claim no §3 row cites is
   invisible to it, and M0-57 published that bound as this row's input. Live reach on
   2026-09-17 is ONE pair over the whole governed set.

   So this tool drops signal 1 and keeps 2, 3 and 4:
     2 — a section says its listed pieces are still to be designed;
     3 — the listed item does not itself name where its design lives;
     4 — ANOTHER governed document carries a body heading naming that same piece.
   Signal 4 here is WEAKER than the arm's, deliberately and in the reporting direction: the
   arm also requires the covering document to declare the construct in its own Place line,
   which is only knowable when a §3 row named the construct. With no citation there is no
   construct number, so that leg cannot be applied. A candidate from this tool is therefore a
   PAIR FOR A READER TO ADJUDICATE, never a defect the tool has established.

   WHAT IT CANNOT SEE, STATED RATHER THAN IMPLIED CLOSED — the same discipline §7 of
   `CORPUS-STANDARD.md` applies to the arm, applied to the sweep that measures the arm:

   - A claim made in PROSE OR A BULLET rather than in a table is invisible. The walk reads the
     FIRST TABLE of a section that trips the undesignedness test; a paragraph saying "the
     ledger object is undesigned" is not reached. This is the sweep's own largest bound and
     it is measured below as `prosey` — sections that trip the test and have NO table.
   - A piece whose two documents call it by DIFFERENT NAMES is invisible. This is measured,
     not assumed: §3 calls construct 8 *Intent and inquiry* while §18 calls the piece *the
     claim object*, sharing ZERO content words. Signal 4 is a heading-word match, so it
     inherits exactly that blindness. AN IDENTIFIER-SHAPED SEARCH OVER A PROSE CORPUS
     PRODUCES CONFIDENT FALSE ABSENCES — three were measured on 2026-09-17 alone, every one
     of them *the design names the RULE, not the IDENTIFIER*. A clean run of this tool is
     therefore evidence about THIS MATCHER and never about the corpus.
   - A key of fewer than two content words is skipped and SAID, per the arm.
   - A document's own `Incomplete sections` front matter is NOT swept, and that is correct
     rather than an oversight: §4.8 says a document may SAY WHAT IT LACKS — that is the whole
     purpose of the field. What it may not do is restate another construct's status.
   - ADEQUACY is never judged. A heading hit is evidence a section EXISTS about the piece.

   Usage:
     node tools/statussweep.mjs              the sweep, with its coverage figures
     node tools/statussweep.mjs --verbose    every claim examined, with its verdict
     node tools/statussweep.mjs --json       the whole result as JSON                     */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  ROOT, governed, keyWords, parseFront, bodyHeadings, constructMap,
  UNDESIGNED, POINTS_AT_A_DESIGN, firstTable,
} from "./corpuscheck.mjs";

const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const FENCE = /^(```|~~~)/;

/* The default reader. `sweep` takes an injectable one for exactly one reason, stated so it is
   not mistaken for a seam: the negative control must plant a KNOWN duplicate and confirm the
   sweep both FINDS it and READ it, and writing a fixture into the live corpus during a
   concurrent battery is the contamination class this project has already paid for. The
   injected reader also records which paths were asked for, which is what turns
   "the sweep found it" into "the sweep found it AND had read the document it was planted in"
   — an arm that did not arm reports a clean result identical to success. */
export function diskRead(path) {
  const abs = join(ROOT, path);
  return existsSync(abs) ? readFileSync(abs, "utf8") : null;
}

/* Every heading-delimited span of a document's BODY, each with the text under it up to the
   next heading of the same or a higher level — so a `## 18.` span keeps its `###` children. */
export function spans(text) {
  const lines = text.split("\n");
  const fm = parseFront(lines);
  const from = fm.error ? 0 : fm.blockEnd;
  const heads = [];
  let fenced = false;
  for (let i = from; i < lines.length; i++) {
    if (FENCE.test(lines[i])) { fenced = !fenced; continue; }
    if (fenced) continue;
    const m = HEADING.exec(lines[i]);
    if (m) heads.push({ level: m[1].length, text: m[2].trim(), at: i });
  }
  return heads.map((h, k) => {
    let end = lines.length;
    for (let j = k + 1; j < heads.length; j++) {
      if (heads[j].level <= h.level) { end = heads[j].at; break; }
    }
    /* `body` is the whole span, children included — signal 4's heading index wants that.
       `own` STOPS AT THE FIRST SUB-HEADING, and the table walk uses it. Without that, a
       parent span and the child span beneath it BOTH find the same table and the same item
       is examined twice — measured on `research/RECONCILED.md`, which double-counted ten
       items into a corpus figure of 26 that should have read 16. A tally inflated by its own
       walk is this project's costs-nothing rule arriving inside the instrument. */
    let own = end;
    for (let j = k + 1; j < heads.length; j++) { own = heads[j].at; break; }
    return {
      heading: h.text, level: h.level, line: h.at + 1,
      body: lines.slice(h.at, end).join("\n"),
      own: lines.slice(h.at, Math.min(own, end)).join("\n"),
    };
  });
}

/* The `§N item M` pairings BIO_System_Design.md §3 states — the exact set M0-57's arm can
   reach. Held as `<doc-basename>::<section>::<item>` so a claim can be marked VISIBLE or
   INVISIBLE to that arm, which is this row's headline measurement. */
export function citedByTheMap(mapText) {
  const set = new Set();
  const CITE = /§\s*(\d+(?:\.\d+)*)\s+item\s+(\d+)/gi;
  for (const row of constructMap(mapText)) {
    const named = [...row.raw.matchAll(/`([^`]+\.md)`/g)].map((m) => m[1]);
    for (const c of row.raw.matchAll(CITE)) {
      for (const n of named) set.add(`${n}::${c[1]}::${c[2]}`);
    }
  }
  return set;
}

/* A table row that is a header or the |---| separator, not an item. */
const isItemRow = (cells) => /^\d+$/.test((cells[0] ?? "").trim());

/* The block that INTRODUCES a table: the last paragraph of the text above it, with a horizontal
   rule (`---`, `***`, `___`) skipped because a rule separates rather than introduces. When the
   heading sits directly over the table, the heading line is that block. (M0-61) */
export function introducingBlock(preamble) {
  const blocks = preamble.split(/\n[ \t]*\n/).map((b) => b.trim())
    .filter((b) => b && !/^([-*_])(?:[ \t]*\1){2,}$/.test(b));
  return blocks.length ? blocks[blocks.length - 1] : "";
}

export function sweep({ set = governed(), read = diskRead } = {}) {
  const texts = new Map();
  const unreadable = [];
  for (const p of set) {
    const t = read(p);
    if (t == null) { unreadable.push(p); continue; }
    texts.set(p, t);
  }

  /* One index of every body heading in the governed set — signal 4's haystack. */
  const headings = [];
  for (const [p, t] of texts) {
    for (const s of spans(t)) headings.push({ path: p, text: s.heading, line: s.line });
  }

  const mapText = texts.get("docs/architecture/BIO_System_Design.md") ?? null;
  const cited = mapText ? citedByTheMap(mapText) : new Set();

  const claims = [];      /* every table item under an undesignedness heading */
  const candidates = [];  /* those with a covering heading in ANOTHER governed document */
  const prosey = [];      /* sections that CLAIM undesignedness and carry no table at all */
  const remoteTrips = [];  /* the predicate matched prose that does NOT introduce the table */
  let sectionsTripped = 0;

  for (const [p, t] of texts) {
    const base = p.split("/").pop();
    for (const s of spans(t)) {
      const { preamble, rows } = firstTable(s.own);
      const mm = UNDESIGNED.exec(s.heading) || UNDESIGNED.exec(preamble);
      if (!mm) continue;
      sectionsTripped++;
      /* WHAT THE PREDICATE ACTUALLY MATCHED, CARRIED RATHER THAN DISCARDED. `UNDESIGNED` is
         `corpuscheck`'s and is imported rather than copied — copying it would be this sweep's
         own subject arriving in its instrument.

         THE REMOTE TRIP — M0-61, and it replaces a CROSS-LINE flag that measured a CORRELATE.
         Here the predicate runs UNGATED (`corpuscheck` has signal 1, a §3 citation, in front
         of it), so a trip anywhere in a section's prose drags that section's first table into
         the population. Measured on `research/RECONCILED.md` §2.2: one sentence about a UI
         case, 187 lines above a table of ten CONSTRAINTS, swept all ten in. M0-58 found it and
         flagged it by the one thing it could see — the matched text spanned a newline. **That
         was the symptom, not the cause:** the same sentence wrapped two words earlier trips
         identically on one line, and 2 of the 3 cross-line trips in the governed set are
         GENUINE claims whose wrap merely fell mid-phrase (see `UNDESIGNED`'s own comment). A
         classifier keyed on the wrap column is one an editor's reflow can switch off.

         The cause is DISTANCE: the claim was not ABOUT the table. So a trip is REMOTE when the
         predicate matches neither the section's HEADING nor the block that INTRODUCES the
         table — its last paragraph above it, a horizontal rule skipped. Items under a remote
         trip are still examined and counted, but APART, as probable false population; nothing
         is dropped silently. Bound, stated: a genuine list whose undesignedness is said two
         paragraphs above its table reads as remote — under-reach into the flagged column, which
         a reader sees, rather than over-reach into the headline, which nobody questions. */
      /* Judged only where the trip would PUT ITEMS INTO THE POPULATION; a section with no item
         rows is already named apart as prose, below, and flagging it twice would say nothing. */
      const remote = rows.some((r) => isItemRow(r.cells)) && !UNDESIGNED.test(s.heading) && !UNDESIGNED.test(introducingBlock(preamble));
      if (remote) {
        remoteTrips.push({
          path: p, heading: s.heading, line: s.line, matched: mm[0],
          matchLine: s.line + (preamble.slice(0, mm.index).match(/\n/g) || []).length,
        });
      }
      const items = rows.filter((r) => isItemRow(r.cells));
      if (!items.length) {
        prosey.push({ path: p, heading: s.heading, line: s.line });
        continue;
      }
      /* the section number, when the heading carries one — `## 18. ...` */
      const secNo = (/^(\d+(?:\.\d+)*)[.·:\s]/.exec(s.heading) || [])[1] ?? null;
      for (const r of items) {
        const itemNo = r.cells[0].trim();
        const bold = (/\*\*([^*]+)\*\*/.exec(r.raw) || [])[1] ?? null;
        const visible = secNo != null && cited.has(`${base}::${secNo}::${itemNo}`);
        const claim = {
          path: p, heading: s.heading, line: s.line, sec: secNo, item: itemNo,
          key: bold, visibleToTheArm: visible, verdict: null, covering: [],
          claimText: r.cells.slice(1).join(" | ").slice(0, 400),
          remoteTrip: remote,
        };
        claims.push(claim);

        if (POINTS_AT_A_DESIGN(r.raw)) { claim.verdict = "points-at-its-design"; continue; }
        /* NO BOLD KEY AT ALL is a DIFFERENT blindness from a key too short to match, and
           conflating them hides a structural one behind a deliberate one. A table that names
           its pieces in plain cells rather than in a bold key is unreachable by this matcher
           however long its words are; a short key is a match the arm declines to make. Both
           are named. */
        if (bold == null) {
          claim.verdict = "no-bold-key — UNREACHABLE by this matcher, which keys on a row's bold span";
          continue;
        }
        const words = keyWords(bold);
        if (words.length < 2) {
          claim.verdict = "key-under-two-content-words — SKIPPED, and one generic noun is not a match this sweep will make";
          continue;
        }
        const res = words.map((w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"));
        const hits = headings.filter((h) => h.path !== p && res.every((re) => re.test(h.text)));
        if (!hits.length) { claim.verdict = "no-covering-heading-elsewhere"; continue; }
        claim.covering = hits;
        claim.verdict = "CANDIDATE — a second document carries a heading for this piece";
        candidates.push(claim);
      }
    }
  }

  return {
    governed: set.length, read: texts.size, unreadable,
    headings: headings.length, sectionsTripped, prosey, claims, candidates, remoteTrips,
    citedPairs: cited.size,
  };
}

/* ------------------------------------------------------------------------------ the CLI */
function main(argv) {
  const json = argv.includes("--json");
  const verbose = argv.includes("--verbose");
  const r = sweep();

  if (json) { console.log(JSON.stringify(r, null, 2)); return 0; }

  console.log("statussweep — a SECOND statement of design status, over the governed set (M0-58)\n");
  console.log(`  governed documents read      ${r.read} of ${r.governed}`);
  console.log(`  body headings indexed        ${r.headings}`);
  console.log(`  sections claiming pieces undesigned  ${r.sectionsTripped}`);
  console.log(`  table items examined         ${r.claims.length}`);
  console.log(`    of those, under a REMOTE trip      ${r.claims.filter((c) => c.remoteTrip).length}`
    + `   — the claim is in prose that does not introduce the table; treat as PROBABLE FALSE POPULATION`);
  console.log(`    under a heading or intro trip      ${r.claims.filter((c) => !c.remoteTrip).length}`
    + `   — this is the sweep's REAL population`);
  console.log("");
  console.log(`  visible to corpuscheck --authority   ${r.claims.filter((c) => c.visibleToTheArm).length}`
    + `   (a §3 row cites it by \`§N item M\`)`);
  console.log(`  INVISIBLE to it                      ${r.claims.filter((c) => !c.visibleToTheArm).length}`
    + `   — no §3 row cites these, and that is the bound M0-57 published`);
  if (r.unreadable.length) console.log(`  UNREADABLE                   ${r.unreadable.join(", ")}`);

  const by = (v) => r.claims.filter((c) => (c.verdict || "").startsWith(v)).length;
  console.log(`\n  verdicts — a clean run must say what it EVALUATED, never only that nothing failed:`);
  console.log(`    points-at-its-design              ${by("points-at")}`);
  console.log(`    no bold key at all                ${by("no-bold-key")}   (UNREACHABLE, and SAID)`);
  console.log(`    key under two content words       ${by("key-under")}   (skipped, and SAID)`);
  console.log(`    no covering heading elsewhere     ${by("no-covering")}`);
  console.log(`    CANDIDATE                         ${r.candidates.length}`);

  if (r.remoteTrips.length) {
    console.log(`\n  ${r.remoteTrips.length} section(s) tripped the undesignedness predicate REMOTELY — in prose that is neither`);
    console.log(`  the heading nor the paragraph introducing the table. Harmless inside corpuscheck, where a §3`);
    console.log(`  citation gates every proposal; NOT harmless in an ungated sweep, where one sentence would drag`);
    console.log(`  a whole unrelated table in. Their items are counted APART, above:`);
    for (const t of r.remoteTrips) {
      console.log(`    ${t.path}:${t.line}  ${t.heading}`);
      console.log(`      matched at line ${t.matchLine}: ${JSON.stringify(t.matched)}`);
    }
  }

  if (r.prosey.length) {
    console.log(`\n  ${r.prosey.length} section(s) claim undesignedness IN PROSE with no table — THIS SWEEP DID NOT`);
    console.log(`  EXAMINE THEM, and they are named rather than counted silently:`);
    for (const s of r.prosey) console.log(`    ${s.path}:${s.line}  ${s.heading}`);
  }

  if (verbose) {
    console.log(`\n  every claim examined:`);
    for (const c of r.claims) {
      console.log(`    ${c.path} §${c.sec ?? "?"} item ${c.item} ${JSON.stringify(c.key)}`
        + `${c.visibleToTheArm ? " [cited by §3]" : ""} -> ${c.verdict}`);
    }
  }

  console.log(`\n${"=".repeat(78)}`);
  if (!r.candidates.length) {
    console.log(`NO CANDIDATE PAIR FOUND over ${r.read} governed documents and ${r.claims.length} table items.`);
    console.log(`\nAND THAT IS A STATEMENT ABOUT THIS MATCHER, NOT A CERTIFICATE FOR THE CORPUS.`);
    console.log(`This sweep sees a table item whose key shares every content word with a heading`);
    console.log(`somewhere else. It does NOT see a claim made in prose (${r.prosey.length} such section(s) named`);
    console.log(`above), and it does NOT see a piece two documents call by different names — which is`);
    console.log(`the corpus's OWN habit, measured: §3 calls construct 8 "Intent and inquiry" while §18`);
    console.log(`calls the piece "the claim object", sharing zero content words. Absence at one level`);
    console.log(`is not evidence of absence at the next.`);
  } else {
    console.log(`${r.candidates.length} CANDIDATE PAIR(S) — REPORTED, NOT FIXED. Which copy is the authority is a`);
    console.log(`judgement per case; both sites and both claims are given so a reader can adjudicate`);
    console.log(`without re-deriving the pair.\n`);
    for (const c of r.candidates) {
      console.log(`--- construct piece: ${JSON.stringify(c.key)}`);
      console.log(`  SITE A (claims it is still to be designed):`);
      console.log(`    ${c.path}:${c.line}  "${c.heading}"  item ${c.item}`);
      console.log(`    claims: ${c.claimText}`);
      console.log(`  SITE B (carries a heading for that same piece):`);
      for (const h of c.covering) console.log(`    ${h.path}:${h.line}  "${h.text}"`);
      console.log(`  visible to corpuscheck --authority: ${c.visibleToTheArm ? "YES" : "NO — no §3 row cites it"}`);
      console.log("");
    }
  }
  return 0;
}

if (process.argv[1] && process.argv[1].endsWith("statussweep.mjs")) {
  process.exit(main(process.argv.slice(2)));
}
