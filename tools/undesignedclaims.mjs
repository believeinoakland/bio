/* undesignedclaims — the corpus asserts that constructs are UNDESIGNED, and nothing audits it.
 *
 * RULED BY BOB 2026-09-17: *"BOB must be responsible for the design being complete and the
 * underlying substrate built before those elements that rely on substrate being built."*
 * `rowsubstrate.mjs` closed the half that asks whether a QUEUE ROW's design covers its construct.
 * **This is the other half, and it runs the opposite way: it audits the corpus's own statements
 * that something is NOT designed.**
 *
 * --------------------------------------------------------------- WHY THIS IS THE DANGEROUS HALF
 *
 * `CLAUDE.md`: **A BLOCKER IS A CLAIM, AND NOTHING HERE AUDITS ONE.** Every instrument in this
 * estate is pointed at the record claiming MORE than it can support. **A sentence saying *X is
 * undesigned* claims LESS, so it passes every one of them untouched** — and it costs real work in
 * the direction that leaves no trace, because the work simply never happens.
 *
 * THREE RECEIPTS, ALL MEASURED, TWO OF THEM MINE:
 *   - BOB #12 told Bob the claim class was undesigned because the content framework's pieces
 *     table said so. The design had been in `BIO_Case_Making_v0_1.md` since 2026-08-03.
 *   - Q14's contradiction sat undesigned for six weeks on the stated ground that *the
 *     contradiction shape has no consumer*. The premise was never re-checked; Bob inverted it in
 *     one sentence on 2026-09-17.
 *   - REC-117 was held as REC-116's shape because `NO_FALSIFIER` appears in zero design
 *     documents. **The RULE is designed under another name** — `BIO_Case_Making_v0_1.md` says
 *     *the falsifier is REQUIRED* — and the row was runnable the whole time.
 *
 * **A STALE *UNDESIGNED* IS WORSE THAN A STALE DEBT ROW, because a debt row invites someone to
 * close it while an *undesigned* invites everyone to stay away.** It is self-preserving: the
 * sentence discourages the reading that would falsify it.
 *
 * ------------------------------------------------------------------ WHAT IT DOES, AND DOES NOT
 *
 * It ENUMERATES the claims and makes them re-checkable. **It does NOT adjudicate them**, and
 * after `rowsubstrate`'s withdrawn arm — four firings, four mechanisms, zero true positives — the
 * reason is stated rather than assumed: deciding whether a construct is designed requires reading
 * the design, and a regex that tried would manufacture confident wrong answers in an arm labelled
 * objective. **Every claim it prints is a QUESTION for a human, and the sweep's product is a
 * VERDICT PER CLAIM recorded in the corpus, not a count.**
 *
 * So the output is a WORKLIST with a date. Its value is that the list EXISTS and can be re-run:
 * an *undesigned* nobody re-reads is a claim about the day it was written, and 21 of them were
 * sitting unaudited across 9 governed documents when this was built.
 *
 * NEGATIVE CONTROL: (all five RUN 2026-09-17 by BOB #13, exit 0, 28 pass / 0 fail, both
 * baselines green) `node bio-plane/test/undesignedclaims.control.mjs` from the repo root.
 *   (A1) the AUDITED test made to ignore the date -> the raw count can never go down again,
 *        which is this instrument's own measured first defect.
 *   (A2) the audited test widened from the LINE to the WHOLE DOCUMENT -> a verdict anywhere
 *        silences a claim everywhere, which is how *undesigned* propagates.
 *   (A3) an unreadable document scored as CLEAN -> the unearned-absence rule, inside the
 *        instrument whose entire subject is unearned absence.
 *   (A4) one claim shape dropped -> a whole class goes silent.
 *   (A5) THE PRECISION ARM — every line reported as a claim. A sensitivity control does not
 *        notice a sweep that finds everything; only this does.
 *
 * **THE HEADER FIRST CITED THIS FILE BEFORE IT EXISTED** — corrected to say so, then built.
 * A declared control is a CLAIM; the artifact is the only witness. **And arming A2 and A3
 * crashed the suite rather than failing it, on two unguarded dereferences — a TypeError ends
 * the module with the tally reading clean. The control found both.**
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { governed } from "./corpuscheck.mjs";

export const ROOT = join(new URL("..", import.meta.url).pathname);

/* The shapes an undesigned-claim takes in THIS corpus, derived by reading the 21 that existed on
   2026-09-17 rather than guessed. Each is a statement that no design covers something. */
export const CLAIM_RE = new RegExp([
  String.raw`\b(?:is|are|remains?|stays?|sits?)\s+(?:still\s+)?(?:currently\s+)?UNDESIGNED\b`,
  String.raw`\bundesigned\b`,
  String.raw`\bhas no (?:governed )?(?:home|design)\b`,
  String.raw`\bnothing (?:answers|covers|governs)\b`,
  String.raw`\bno governed design\b`,
  String.raw`\bis not (?:yet )?designed\b`,
].join("|"), "gi");

/* AN AUDITED CLAIM CARRIES A DATED VERDICT BESIDE IT, AND THE RAW COUNT IS THE WRONG METRIC —
   which this file learned by being driven against its own first sweep. Correcting a stale
   *undesigned* IN PLACE is the right move: the sentence is the receipt, and deleting it destroys
   the evidence of what was believed and for how long. **But that leaves the phrase in the file,
   so the count did not move at all after eight claims were resolved.** A number that cannot go
   down is not a signal.

   So a claim is AUDITED when its own line carries a dated verdict — an ISO date, or one of the
   verdict words this corpus already uses. UNAUDITED is the worklist, and it is the only figure
   worth reading. **Deliberately line-local: a verdict three paragraphs away is one a reader of
   THIS sentence will not see, which is how *undesigned* propagates in the first place.** */
export const AUDITED_RE = /\b20\d\d-\d\d-\d\d\b|\bSUPERSEDED\b|\bANSWERED\b|\bframing of\b|\bno longer true\b|\bis history\b/;

export function claimsIn(text) {
  const out = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const audited = AUDITED_RE.test(lines[i]);
    for (const m of lines[i].matchAll(CLAIM_RE)) {
      const s = Math.max(0, m.index - 140), e = Math.min(lines[i].length, m.index + 140);
      out.push({ line: i + 1, phrase: m[0], audited, context: lines[i].slice(s, e).trim() });
    }
  }
  return out;
}

export function sweep({ repo = ROOT, governedSet = null, reader = null } = {}) {
  const read = reader || ((p) => { try { return readFileSync(join(repo, p), "utf8"); } catch { return null; } });
  const docs = [...(governedSet ?? governed())];
  const byDoc = [];
  let total = 0, unreadable = 0;
  for (const p of docs.sort()) {
    const t = read(p);
    /* A document that could not be READ is its own state and is never scored as clean — the
       unearned-absence rule, which is this whole family's subject. */
    if (t === null) { unreadable++; byDoc.push({ path: p, unreadable: true, claims: [] }); continue; }
    const claims = claimsIn(t);
    if (claims.length) { byDoc.push({ path: p, unreadable: false, claims }); total += claims.length; }
  }
  const unaudited = byDoc.flatMap((d) => (d.claims || []).filter((c) => !c.audited));
  return { byDoc: byDoc.filter((d) => d.unreadable || d.claims.some((c) => !c.audited)),
           counts: { documents: byDoc.filter((d) => d.claims.some((c) => !c.audited)).length,
                     claims: total, unaudited: unaudited.length,
                     audited: total - unaudited.length, governed: docs.length, unreadable } };
}

export function sweepMessage(s, { cap = 40 } = {}) {
  let out = `UNDESIGNED CLAIMS, UNAUDITED — ${s.counts.unaudited} statement(s) across `
    + `${s.counts.documents} governed document(s) assert that something is NOT designed and carry\n        no dated verdict beside them. ${s.counts.audited} more are audited and not listed.\n`
    + `        Nothing audits a claim of this shape: it claims LESS than the evidence supports,\n`
    + `        so every instrument pointed at overclaiming passes it (CLAUDE.md).\n`
    + `        A stale one is worse than a stale debt row — a row invites you to close it,\n`
    + `        an *undesigned* invites everyone to stay away, so it preserves itself.\n`;
  let n = 0;
  for (const d of s.byDoc) {
    if (d.unreadable) { out += `\n          ${d.path} — COULD NOT BE READ (not scored clean)\n`; continue; }
    out += `\n          ${d.path}\n`;
    for (const c of d.claims.filter((x) => !x.audited)) {
      if (n++ >= cap) { out += `            … capped\n`; break; }
      out += `            :${c.line}  ${c.context.slice(0, 150)}\n`;
    }
  }
  out += `\n        EACH IS A QUESTION, NOT A DEFECT. Read the construct map and the home document\n`
    + `        before believing any of them; record a VERDICT per claim, not a count.`;
  return out;
}

if (process.argv[1] && process.argv[1].endsWith("undesignedclaims.mjs")) {
  const s = sweep();
  console.log(`undesignedclaims: ${s.counts.unaudited} UNAUDITED claim(s) in ${s.counts.documents} `
    + `document(s), ${s.counts.audited} already carrying a dated verdict, of ${s.counts.claims} total `
    + `across ${s.counts.governed} governed document(s); ${s.counts.unreadable} unreadable`);
  if (s.counts.unaudited) console.log(`\n${sweepMessage(s)}`);
}
