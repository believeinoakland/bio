/* rowsubstrate — does the design a row NAMES actually COVER the construct the row builds?
 *
 * RULED BY BOB 2026-09-17: *"BOB must be responsible for the design being complete and the
 * underlying substrate built before those elements that rely on substrate being built."*
 * D-404 is the gap; this is its instrument.
 *
 * ------------------------------------------------- WHAT `rowdesign.mjs` ALREADY DOES, AND CANNOT DO
 *
 * `rowdesign.mjs` enforces CORPUS-STANDARD.md §4.7: a row must NAME a governed design document
 * and section. **It asks whether a pointer EXISTS. It cannot ask whether the pointer POINTS AT
 * THE RIGHT THING**, and a pointer at the wrong thing passes it silently — which is exactly how
 * this defect survived.
 *
 * **THE RECEIPT IS CONDUCT #2's OWN ROW, and it is why this file exists rather than a rule.**
 * REC-116 named `BIO_Content_Framework_v0_10.md` Part II §17 as its authority. Measured by
 * CONDUCT #3 at the artifact: **§17 contains the construct's own marker ZERO times** — it is
 * about content organization and says nothing about the route marker the row would have built.
 * `BIO_System_Design.md`, which is supposed to place every major construct and name its home
 * document, never mentions it either. **So the construct had NO HOME DOCUMENT, a worker would
 * have been briefed against a delegation sentence, and the row PASSED the §4.7 arm.** The gap
 * survived 39 days because nothing could ask the second question.
 *
 * ------------------------------------------------------------------ WHAT IT ASKS, AND WHY THAT
 *
 * A row's SYMBOLS — the backticked code identifiers in its scope: op names, markers, table and
 * function names — are the most reliable machine-readable statement of *what this row builds*.
 * The check is then: **does the cited design SECTION mention at least one of them?**
 *
 * **SECTION-LEVEL WHERE A `§` IS NAMED, document-level otherwise**, because the section is where
 * the signal lives: REC-116's document mentions plenty, its named SECTION mentions nothing. A
 * document-level check would have passed it — the same defect one altitude up, and the reason
 * this file resolves the anchor rather than taking the easy read.
 *
 * ------------------------------------------------ WHAT IT DELIBERATELY DOES NOT CLAIM
 *
 * **MEASURED PRECISION: 1 GENUINE OF 3 VERIFIED (2026-09-17), and both false ones share a
 * mechanism — the design names the RULE in prose, not the IDENTIFIER in code.** REC-115's cited
 * section was topically exactly right; REC-117's design says *"the falsifier is REQUIRED"* while
 * never writing `NO_FALSIFIER`, and this note would have held a runnable row. **So a note from
 * this arm that disagrees with a row someone has checked at the artifact is the thing that is
 * wrong.** The figure is recorded downward on purpose: a precision number that only improves in
 * the telling is worthless.
 *
 * **A HIT IS NOT PROOF THE DESIGN IS ADEQUATE. A MISS IS NOT PROOF IT IS ABSENT.** A section may
 * describe a construct in prose without ever writing its identifier, and that is legitimate
 * design writing rather than a defect. So a miss is a QUESTION PUT TO A HUMAN, never a verdict,
 * and this arm WARNS — it never fails a run. A gate that goes red on inherited state gets
 * switched off (`CLAUDE.md`), and 20 open rows written before the rule existed are exactly that
 * state. **Its job is to make an unanswerable question visible, not to answer it.**
 *
 * **AND IT ONLY JUDGES ROWS WHERE THE QUESTION IS ANSWERABLE**: a row with no symbols is
 * UNJUDGED and counted as such, never scored as a pass. Scoring an unaskable question as clean
 * is the unearned-absence class, which is the defect this whole family belongs to.
 *
 * ---------------------------------------------------------------- THE CLASS THIS SERVES
 *
 * 2026-09-17 produced five instances of ONE shape and this is its sixth door: **a claim that is
 * TRUE IN EVERY PARTICULAR and is about the WRONG UNIT.** A branch's NAME asked where
 * REACHABILITY was meant; a LOCAL-HEAD check read as ESTATE-WIDE; a MACHINE-wide process grep
 * read as a fact about one session; a task run judged by a tree it did not own; `5:15` read as
 * hours because `ps -o etime` puts the unit in the FIELD COUNT. **None was a logic error. Every
 * one was a correct answer to a question nobody had asked.** A design pointer naming a real
 * document, a real section, and the wrong subject is the same shape pointed at the record.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/rowsubstrate.control.mjs` from the repo root.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, QUEUE, openRows, judgedText, JUDGED, citations, governedIndex } from "./rowdesign.mjs";
import { governed } from "./corpuscheck.mjs";

/* A SYMBOL is a backticked token that looks like a code identifier rather than prose: an op
   name, a MARKER such as `LOOKED_INDETERMINATE`, a snake/camel name, a dotted file.
   Deliberately narrow — a false symbol produces a false question, and this arm's whole value is
   that its questions are worth a human's time. */
/* NARROWED AFTER MEASURING, AND THE NARROWING COST REAL RECALL — stated because a limit
   nobody names is a limit the next reader re-derives. The first version matched any backticked
   identifier and produced 7 questions over 16 rows, of which AT LEAST ONE WAS FALSE: DIST-5's
   `ListAgents` is the tool a row was VERIFIED WITH, not a construct it builds. A second
   hypothesis — that a real construct is mentioned more than once — was MEASURED AND KILLED:
   every symbol in all seven rows occurred exactly once.

   So the discriminator is CONVENTION, not frequency. In this repository an op name and a
   SCREAMING_SNAKE marker ARE construct identifiers; a bare lowercase or camelCase word in
   backticks is as often prose emphasis. **THE COST: `readText` (FW-20) is a genuine function
   name and this narrowing drops it.** That trade is deliberate — this arm WARNS, so a missed
   question is caught next pass while a noisy one gets the whole arm ignored, which is this
   estate's own recorded failure mode for alarms. */
export const SYMBOL_RE = /`(op=[A-Za-z0-9_.]+|[A-Z][A-Z0-9_]{3,})`/g;

/* Prose words that arrive in backticks and carry no construct identity. A symbol set that is
   mostly these produces questions nobody can act on. */
export const NOISE = new Set(["done", "queued", "running", "blocked", "true", "false", "null",
  "main", "origin", "open", "closed", "yes", "no", "TODO", "NOTE", "and", "or", "not"]);

export function symbolsOf(text) {
  const out = new Set();
  for (const m of text.matchAll(SYMBOL_RE)) {
    const s = m[1];
    if (NOISE.has(s) || s.length < 4) continue;
    out.add(s);
  }
  return [...out];
}

/* ANCHORS BIND TO THE DOCUMENT THEY FOLLOW, AND THE FIRST VERSION OF THIS FILE GOT THAT WRONG
   IN THE MOST INSTRUCTIVE POSSIBLE WAY. It collected every `§N` in a row and every document in a
   row and took the CROSS PRODUCT — then reported, as its STRONGEST and supposedly
   judgement-free signal, that two rows cited sections that do not exist.

   **BOTH WERE FALSE AND I MANUFACTURED THEM.** VF-7 writes ``SCHEDULER.md` §"The mechanism, and
   how the next consumer joins"` and, separately, ``CORPUS-STANDARD.md` §6`; the cross product
   demanded a §6 inside SCHEDULER.md, which has no numbered sections at all. REC-87 writes
   ``CONTENT-EXTENT-DESIGN-SPACE.md` §5` and ``BIO_Content_Framework_v0_10.md` Part II §14.4`;
   the cross product demanded §14.4 in the first document, whose last section is 6.

   **THE LESSON IS BIGGER THAN THE BUG: A NEW INSTRUMENT'S FIRST FINDINGS MUST THEMSELVES BE
   VERIFIED AT THE ARTIFACT BEFORE THE INSTRUMENT IS BELIEVED**, because output looks like
   evidence and a false positive from a fresh tool is indistinguishable from a real one. These
   were caught only by re-reading the two rows by hand — the instrument was confidently,
   objectively, and entirely wrong, in the arm labelled *not a judgement*.

   So: scan in ORDER and attach each `§N` to the nearest preceding document mention. A NAMED
   anchor — `§"The mechanism…"` — is a legitimate citation this file cannot resolve numerically,
   so it yields NO numeric anchor and the document is judged whole rather than being scored as a
   broken pointer. Unresolvable is not wrong. */
export function anchorPairs(text) {
  const out = new Map();
  const tok = /(`?)([A-Za-z0-9._-]+\.md)\1|§\s*(?:"[^"]*"|(\d+(?:\.\d+)*))/g;
  let current = null;
  for (const m of text.matchAll(tok)) {
    if (m[2]) { current = m[2]; if (!out.has(current)) out.set(current, new Set()); }
    else if (m[3] && current) out.get(current).add(m[3]);
  }
  return new Map([...out].map(([k, v]) => [k, [...v]]));
}

/* The text of one numbered section of a design document, from its heading to the next heading
   at the same or a shallower level. Returns null when the anchor is not found — which is itself
   a finding and must not be confused with "found and empty". */
/* DOES THIS DOCUMENT NUMBER ITS HEADINGS AT THIS DEPTH AT ALL? An anchor is only judgeable
   against a document that uses the scheme it is written in. `SCHEDULER.md` numbers nothing —
   its headings are prose titles — so `§6` there is unresolvable, NOT wrong.
   `BIO_Content_Framework_v0_10.md` numbers to `## 5.` but has no `5.2` heading, so a `§5.2`
   may name a part of §5 that simply has no heading of its own. **Both were reported as broken
   pointers by the first version, and both were false.** */
export function numbersAtDepth(doc, anchor) {
  const depth = anchor.split(".").length;
  const re = new RegExp(`^#{1,6}\\s+§?\\d+${"(?:\\.\\d+)".repeat(depth - 1)}[.)\\s]`, "m");
  return re.test(doc);
}

export function sectionText(doc, anchor) {
  const lines = doc.split("\n");
  const esc = anchor.replace(/\./g, "\\.");
  const head = new RegExp(`^(#{1,6})\\s.*?(?:§\\s*)?\\b${esc}[.\\s)]`);
  let start = -1, depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(head);
    if (m) { start = i; depth = m[1].length; break; }
  }
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s/);
    if (m && m[1].length <= depth) { end = i; break; }
  }
  return lines.slice(start, end).join("\n");
}

/* `docReader` is injectable for the same reason `queue` and `governedSet` are: the suite must be
   able to drive the JUDGEMENT over fixtures without writing a design document into the estate.
   The default reads the tree. Found by the suite's own precision arm, which could not otherwise
   be written at all — a predicate that can only be tested against the real corpus is one whose
   precision nobody will ever measure, which is exactly the defect that withdrew the anchor arm. */
export function substrateAudit({ repo = ROOT, queue = null, governedSet = null,
                                 docReader = null } = {}) {
  const readDoc = docReader || ((path) => {
    const full = join(repo, path);
    return existsSync(full) ? readFileSync(full, "utf8") : null;
  });
  const text = queue ?? readFileSync(join(repo, QUEUE), "utf8");
  const index = governedIndex(governedSet ?? governed());
  const rows = openRows(text);
  const judged = [], unjudged = [], findings = [], broken = [];

  for (const row of rows) {
    if (!JUDGED.has(row.state)) continue;
    const body = judgedText(row);
    const milestone = (row.body.find((l) => /^milestone:/.test(l)) || "");
    const cited = citations(body, index, { milestone }).paths;
    const syms = symbolsOf(body);
    const pairs = anchorPairs(body);
    const anchorsFor = (path) => pairs.get(path.slice(path.lastIndexOf("/") + 1)) || [];
    const anchors = [...new Set(cited.flatMap(anchorsFor))];

    /* UNJUDGED is a real state and is counted, never folded into a pass. A row citing no
       governed document is `rowdesign.mjs`'s business, not this arm's. */
    if (!cited.length || !syms.length) {
      unjudged.push({ id: row.id, line: row.line, why: !cited.length ? "no governed design cited"
                                                                    : "no machine-readable symbol in scope" });
      continue;
    }

    const probes = [];
    let covered = false, anchorMissing = [], unresolvable = [];
    for (const path of cited) {
      const doc = readDoc(path);
      if (doc === null) { probes.push({ path, read: false }); continue; }
      /* Section-level where the row names one, document-level otherwise. */
      const own = anchorsFor(path);
      const scopes = own.length
        ? own.map((a) => ({ a, t: sectionText(doc, a) }))
        : [{ a: null, t: doc }];
      for (const s of scopes) {
        if (s.t === null) {
          /* Only a document that USES this numbering depth can have a missing anchor at it.
             Anything else is UNRESOLVABLE, which is a third state and not a defect. */
          /* WITHDRAWN AS A FINDING — see THE ARM THAT NEVER ONCE FIRED CORRECTLY. Counted so
             the walk still says what it could not resolve, never reported as a defect. */
          unresolvable.push(`${path} §${s.a}`);
          continue;
        }
        const hits = syms.filter((y) => s.t.includes(y));
        probes.push({ path, anchor: s.a, hits });
        if (hits.length) covered = true;
      }
    }
    const r = { id: row.id, state: row.state, line: row.line, cited, symbols: syms,
                anchors, probes, anchorMissing, unresolvable, covered };
    judged.push(r);
    /* TWO SIGNALS OF DIFFERENT STRENGTH, KEPT APART BECAUSE THE READER'S NEXT ACT DIFFERS.
       A MISSING ANCHOR IS OBJECTIVE: the row cites §N of a document that HAS no §N, so the
       pointer is wrong whatever anyone thinks about the design — no judgement, no reading, and
       it cannot be explained away by prose. AN UNMENTIONED SYMBOL IS A JUDGEMENT CALL. Folding
       them together would bury the certain finding inside the arguable one, which is how a
       reader learns to skim both. */
    if (!covered) findings.push(r);
  }
  return { rows, judged, unjudged, findings, broken,
           counts: { judged: judged.length, unjudged: unjudged.length,
                     uncovered: findings.length, brokenAnchors: broken.length,
                     governed: index.paths.size } };
}

export function substrateMessage(findings, { cap = 8 } = {}) {
  let out = `SUBSTRATE NOT EVIDENT — ${findings.length} open row(s) name a governed design whose\n`
    + `        cited section mentions NONE of the row's own symbols. A pointer can name a real\n`
    + `        document, a real section, and the wrong subject; §4.7's arm cannot see that.\n`;
  for (const f of findings.slice(0, cap)) {
    const where = f.anchors.length ? f.cited.map((p) => `${p} §${f.anchors.join("/§")}`).join(", ")
                                   : f.cited.join(", ");
    out += `\n          ${f.id} — cites ${where}\n`
         + `            row symbols: ${f.symbols.slice(0, 6).join(", ")}`
         + `${f.symbols.length > 6 ? ` (+${f.symbols.length - 6})` : ""}\n`;
    if (f.anchorMissing.length)
      out += `            ANCHOR NOT FOUND: ${f.anchorMissing.join(", ")}\n`;
  }
  if (findings.length > cap) out += `\n          … and ${findings.length - cap} more\n`;
  out += `\n        A MISS IS A QUESTION, NOT A VERDICT: a section may describe a construct in\n`
    + `        prose without writing its identifier, and that is legitimate design writing.\n`
    + `        This NEVER fails a run. Answer it by reading the section, then either correct the\n`
    + `        pointer, write the design, or route the gap — REC-116's receipt is that the\n`
    + `        construct had no home document at all and the row passed §4.7 regardless.`;
  return out;
}

/* WITHDRAWN 2026-09-17, THE SAME HOUR IT WAS WRITTEN, AND THE RECORD IS KEPT BECAUSE IT IS
   WORTH MORE THAN THE ARM WAS. This file shipped a second signal — *the row cites a section the
   document does not have* — advertised as the STRONG one: objective, no reading required, "not
   a judgement". **It fired four times and was WRONG four times, by four DIFFERENT mechanisms,
   and it never once produced a true positive:**

     1. CROSS PRODUCT — every `§N` in a row demanded of every document in it, so
        `CORPUS-STANDARD.md §6` was demanded of `SCHEDULER.md`.
     2. NAMED ANCHORS — `§"The mechanism, and how the next consumer joins"` is a real citation
        that yields no number, and its document was then judged against someone else's number.
     3. NUMBERING DEPTH — a document numbering only to `## 5.` cannot answer `§5.2`; the anchor
        may name a part of §5 that has no heading. Unresolvable is not wrong.
     4. PROSE SUBJECTS — `the study §5.2` names its document in words, so the anchor bound to
        whichever filename happened to appear last.

   Each fix revealed the next mechanism. A fifth was not worth waiting for: an arm with a
   measured precision of ZERO does not ship, however good its idea is, and patching toward a
   first true positive is how a bad instrument acquires the appearance of a good one.

   **THE DOCTRINE THIS PRODUCED, which the estate did not have: A NEGATIVE CONTROL TESTS
   SENSITIVITY — that the arm CAN fail when its subject breaks. NOTHING HERE TESTED PRECISION —
   that it does NOT fire when the subject is fine.** This arm would have passed a negative
   control easily: plant a row citing a missing section and it fires. It was its POSITIVE
   findings, on a healthy corpus, that were worthless. So a new instrument's first findings are
   the least trustworthy output in the estate **and they are formatted exactly like the most
   trustworthy** — verify them by hand at the artifact before the instrument is allowed to be
   evidence, and if it cannot reach one true positive, withdraw it. */

if (process.argv[1] && process.argv[1].endsWith("rowsubstrate.mjs")) {
  const a = substrateAudit();
  console.log(`rowsubstrate: ${a.counts.judged} row(s) judged, ${a.counts.brokenAnchors} citing a `
    + `NON-EXISTENT section, ${a.counts.uncovered} with no evident substrate, `
    + `${a.counts.unjudged} unjudged (question not askable)`);
  if (a.broken.length) console.log(`\n${brokenAnchorMessage(a.broken)}`);
  for (const u of a.unjudged) console.log(`  unjudged  ${u.id} — ${u.why}`);
  if (a.findings.length) console.log(`\n${substrateMessage(a.findings, { cap: 20 })}`);
}
