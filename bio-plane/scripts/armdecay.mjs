/* armdecay.mjs — THE THREE DRIVER-ESTATE DECAY SHAPES M0-25's CENSUS COULD NOT
 * SEE, in a module of its own so the battery can TEST the instrument instead of
 * trusting it. `control-register.mjs`'s own header states that reason and this
 * file is built on its precedent (D-329 + D-331 + D-333, 2026-09-14).
 *
 * M0-25 closed ONE decay shape: an arm's ANCHOR — a literal the driver will
 * search for in a source file — going to zero matches. Its battery-side witness
 * reads anchors that are LITERAL and looks for them in FILES. Three shapes sat
 * outside that, each filed as its own debt row, and this module is what the two
 * instruments now share to see them.
 *
 * =========================================================================
 * (1) D-329 — THE COMPOSED LABEL, AND WHY THE ROW WAS WRONG THAT NOTHING
 *     STATIC COULD SEE IT.
 * =========================================================================
 *
 * A control driver does not only quote SOURCE. It also quotes the SUITE'S OWN
 * ASSERTION NAMES — a `mustFail` / `mustNotFail` fragment it expects to find, or
 * not to find, among the suite's failing assertions. `aicredential.control.mjs`
 * held two arms against a fragment reading "every one of the 26" + " ops no
 * member reaches is refused at the mint, by name", while the suite COMPOSES that
 * name from the same words with a substitution where the count sits — see
 * `aicredential.test.mjs`, the `t(...)` whose label interpolates beyond.length.
 *
 * **TWO THINGS ARE DELIBERATELY NOT WRITTEN HERE, AND NEITHER IS FASTIDIOUSNESS.
 * BOTH WERE MEASURED, ON THIS ITEM'S OWN NEGATIVE CONTROLS.**
 *
 *   1. The stale fragment is never written as ONE string. This module sits in
 *      `bio-plane/scripts/`, inside the very corpus the live check searches, so
 *      quoting the defect whole would make it "literally present" and this
 *      instrument would go green over its own control. That is the estate's "a
 *      check that caught its own correction because the correction quoted the
 *      token it was correcting" receipt, met head-on while writing the fix.
 *   2. **The composed template is never written in BACKTICKS here either**, and
 *      that one cost a control run to find. Spelled as a real template literal,
 *      this comment entered the template index — and arm L1 then reported the
 *      defect as "composed in armdecay.mjs" rather than in the suite that
 *      actually composes it. A finding that names the INSTRUMENT instead of the
 *      subject points the next reader at the wrong file, which is the record
 *      overclaiming in miniature.
 *
 * The text moves whenever the plane gains an op no member reaches. It moved
 * 26 -> 28 and the two sites failed in OPPOSITE DIRECTIONS: the `mustFail` use
 * was loud, the `mustNotFail` use went SILENTLY VACUOUS — a fragment that can
 * never match can never be violated, so that guard proved nothing and said
 * nothing for a month.
 *
 * **D-329 concluded that no static instrument could see this, because "an
 * assertion label composed at run time exists in no file". THAT IS TRUE OF THE
 * RENDERED LABEL AND FALSE OF THE TEMPLATE.** The template is right there in the
 * suite, and the defect has an exact static signature: the driver's fragment
 * RESOLVES AGAINST THE TEMPLATE ONLY BY CONSUMING AN INTERPOLATION SLOT. Match a
 * tail of one literal segment, then a head of the NEXT literal segment, with a
 * short gap between them where `${…}` sat, and the gap is the rendered value the
 * fragment should never have carried. `composedSpan()` below is that predicate.
 *
 * It is deliberately NARROW, and the narrowness is the point: a fragment that
 * quotes only the INVARIANT part of a composed name matches one segment and
 * spans nothing, which is exactly the repair D-329 made by hand and exactly what
 * must keep passing. Measured on the estate the day this was written: 2,640
 * label quotes from 87 of 88 drivers, 6 span candidates, ALL SIX literally
 * present in a file and therefore not scored — 0 findings, while the historical
 * 26-ops fragment is caught by name with `gap: "26"`. The live check is not
 * decoration; it is what makes those six a pass.
 *
 * **THE LIVE CORPUS FOR A LABEL EXCLUDES `docs/`, AND THAT IS A FINDING RATHER
 * THAN A TIDY-UP.** An assertion's NAME lives in a suite. The RECORD, however,
 * quotes the defects it records — `DEBT.md`'s own D-329 row carries the stale
 * 26-ops fragment verbatim, because that is what a debt row is for. With `docs/`
 * in the live corpus this instrument reads that row and scores the defect
 * "present", so the negative control for the whole check goes green over a fully
 * armed subject. Measured, not reasoned about: it is how the first draft of the
 * control failed. The ANCHOR half keeps `docs/` in, and must — two of
 * `register-grammar.control.mjs`'s arms quote `VERIFICATION.md`, and a corpus
 * that assumed a subject is always code reported both as stale.
 *
 * WHAT IT CANNOT SEE, stated rather than left to be discovered:
 *   - A label composed by `+` CONCATENATION or by `String.prototype.replace`
 *     rather than by a template literal. Only `${…}` inside backticks is read.
 *   - A composed label whose rendered form ALSO happens to sit verbatim in some
 *     file in the corpus: the live check then (correctly, for the D-276 class)
 *     scores it present, and this predicate stays silent.
 *   - A gap longer than MAX_GAP, or a shoulder shorter than MIN_SIDE on either
 *     side. Both are floors against noise and both are stated as figures here
 *     rather than tuned in silence.
 *   - It says nothing about whether a LIVE label is the RIGHT one. That is a
 *     claim about a run, and it belongs to the census.
 *
 * =========================================================================
 * (2) D-333 — THE DECLARED TALLY, WHICH DECAYS WHILE EVERY ANCHOR STAYS LIVE.
 * =========================================================================
 *
 * A driver states how many arms it has, in its own head comment, in prose:
 * *"five arms plus a baseline"*, *"THE SEVENTEEN ARMS"*, *"Twelve arms"*. That
 * number is a CLAIM ABOUT A RUN, so no anchor check can falsify it — D-330 found
 * two drivers whose anchors were all perfectly live and whose expectations were
 * false. `readDeclaredArms()` reads the claim; the CENSUS, which runs the
 * drivers, is the only instrument that can hold it against what the driver
 * actually announced, and that is where the comparison lives.
 *
 * WHY THE HEAD COMMENT AND NOT `control-register.mjs`'s GRAMMAR. Measured, not
 * assumed: `readControl` yields a tally for **2 of 88** drivers, because a
 * control driver carries no `NEGATIVE CONTROL:` marker — it IS the control. The
 * worded head tally yields **46 of 88**, and the other 42 are NAMED as unreadable
 * rather than scored zero, which is `control-register.mjs`'s own null-never-zero
 * rule one level out.
 *
 * `plusBaseline` is carried beside the number because a baseline row is an
 * announcement the driver makes and not an arm it declares — "five arms plus a
 * baseline" announces six. Handling it structurally rather than by naming the
 * drivers is this estate's "invert, do not lengthen a list" rule: the phrase is
 * read, not the file name.
 *
 * =========================================================================
 * (3) D-331 — THE PREFLIGHT, so one dead anchor cannot blind the arms behind it.
 * =========================================================================
 *
 * Half this estate's drivers THROW on a zero-match anchor. `casepin` had FOUR
 * stale anchors and reported ONE, because the throw happened at arm (a) and arms
 * (c), (d), (e) were never reached. The other half RECORD and continue and report
 * every dead anchor in one run. **Both shapes are defensible and the difference
 * was never a decision**, which is why D-331 was a `design` row.
 *
 * THE RULING TAKEN HERE IS D-331'S OWN RECOMMENDATION, and it declines both
 * halves of the false choice: a throwing driver VALIDATES EVERY ANCHOR BEFORE IT
 * ARMS ANYTHING. `preflight()` below is the shared dry pass — it counts every
 * arm's quote in the file that arm will write, prints the WHOLE table, and only
 * then does the driver arm. The THROW IS KEPT: a half-armed tree is still never
 * measured, which is the property the throwing shape exists for and which
 * record-and-continue gives up. What changes is that the report is complete
 * before anything is armed.
 *
 * WHAT ADOPTING RECORD-AND-CONTINUE WOULD HAVE COST, priced rather than waved at:
 * it is the option that needs no new code — `harness.control.mjs`'s `arm()`
 * already does it — but it buys the complete report by MEASURING A TREE PATCHED
 * BY AN ARM THAT DID NOT ARM. In `casepin` arm (a) and arm (b) both write
 * `src/store.mjs`; with (a) recorded-and-skipped, (b) runs against a store whose
 * pin write is whatever (a)'s failed patch left, and the suite tally it produces
 * is a measurement of a tree nobody meant to hand it. That is the exact defect
 * the census's own dirty-tree stop exists to refuse, one level down. The
 * preflight gets the complete report WITHOUT it.
 *
 * The lines `preflight()` prints are deliberately spelled so the census's
 * EXISTING `DID_NOT_ARM` union reads them (`occurs 0 times`, `REFUSED TO ARM`)
 * — a new instrument that needed a new matcher entry would be the same staleness
 * one level up.                                                               */

import { readFileSync } from "node:fs";

/* ------------------------------------------------------------------ SHOULDERS
   Both figures are FLOORS AGAINST NOISE and both were measured rather than
   chosen: at a 14-character shoulder the estate yields 1,727 distinct
   interpolation shoulders and SIX span candidates, all six of them literally
   present. A shorter shoulder starts matching ordinary English; a longer one
   stops seeing a template whose literal half is short. MAX_GAP is what a
   RENDERED VALUE looks like — a count, an id, a short name — and a gap longer
   than this is a different sentence rather than a filled slot. */
export const MIN_SIDE = 14;
export const MAX_GAP = 48;

/* ------------------------------------------------------------ COMMENT STRIPPING
   A DRIVER IS HALF COMMENTARY, AND ITS COMMENTARY QUOTES THE DEFECT IT FIXED.
   `aicredential.control.mjs`'s own re-anchoring note quotes the stale 26-ops
   fragment verbatim, in the paragraph explaining that the fragment was wrong. A
   matcher that read comments would score that note as the defect it describes —
   the "a sweep that failed by citing itself" receipt WORKER.md records, and
   M0-25's own class sweep hit it. Whitespace is substituted for comment bytes
   rather than deleting them, so every offset and line number is preserved. */
export function stripComments(src) {
  let out = "", i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "*") {
      const e = src.indexOf("*" + "/", i + 2);
      const end = e < 0 ? src.length : e + 2;
      out += src.slice(i, end).replace(/[^\n]/g, " ");
      i = end; continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      const e = src.indexOf("\n", i);
      const end = e < 0 ? src.length : e;
      out += " ".repeat(end - i);
      i = end; continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const q = c; let j = i + 1;
      while (j < src.length) { if (src[j] === "\\") { j += 2; continue; } if (src[j] === q) break; j++; }
      out += src.slice(i, Math.min(j + 1, src.length));
      i = j + 1; continue;
    }
    out += c; i++;
  }
  return out;
}

/* ------------------------------------------------------- TEMPLATE SEGMENT PAIRS
   Every ADJACENT pair of literal segments either side of one `${…}`. Nested
   braces inside the substitution are counted so `${a ? {x:1} : 2}` does not end
   the slot early. A template with no interpolation yields nothing: it has no
   slot to span, and a fragment quoting it is an ordinary literal. */
export function templatePairs(src, path = null, into = []) {
  for (let i = 0; i < src.length; i++) {
    if (src[i] !== "`") continue;
    if (i > 0 && src[i - 1] === "\\") continue;
    let j = i + 1; const segs = []; let cur = ""; let interp = false, closed = false;
    while (j < src.length) {
      const c = src[j];
      if (c === "\\") { cur += src[j + 1] ?? ""; j += 2; continue; }
      if (c === "`") { closed = true; break; }
      if (c === "$" && src[j + 1] === "{") {
        interp = true; segs.push(cur); cur = "";
        let depth = 1; j += 2;
        while (j < src.length && depth > 0) { if (src[j] === "{") depth++; else if (src[j] === "}") depth--; j++; }
        continue;
      }
      cur += c; j++;
    }
    if (closed) {
      segs.push(cur);
      if (interp) for (let k = 0; k + 1 < segs.length; k++) into.push({ L: segs[k], R: segs[k + 1], path });
      i = j;
    }
  }
  return into;
}

/* The index the span check runs against: one entry per DISTINCT pair of
   shoulders, which is what makes the check ~0.3s over the whole estate instead
   of minutes. The full segments are kept on the exemplar so a finding can print
   the real template rather than the truncated shoulders. */
export function indexPairs(pairs) {
  const keyed = new Map();
  for (const p of pairs) {
    if (p.L.length < MIN_SIDE || p.R.length < MIN_SIDE) continue;
    const lt = p.L.slice(-MIN_SIDE), rh = p.R.slice(0, MIN_SIDE);
    const k = lt + " " + rh;
    if (!keyed.has(k)) keyed.set(k, { lt, rh, ex: p });
  }
  return [...keyed.values()];
}

/* THE PREDICATE. A label that resolves only by eating an interpolation slot is a
   label quoting a RENDERED VALUE, and it will go stale the moment the value
   moves. Returns the exemplar template and the rendered gap, so the finding
   NAMES the value rather than merely reporting a mismatch. */
export function composedSpan(lit, index) {
  for (const { lt, rh, ex } of index) {
    const p = lit.indexOf(lt);
    if (p < 0) continue;
    const after = p + lt.length;
    const q = lit.indexOf(rh, after);
    if (q < 0 || q - after > MAX_GAP) continue;
    return { L: ex.L, R: ex.R, path: ex.path, gap: lit.slice(after, q) };
  }
  return null;
}

/* ---------------------------------------------------------------- LABEL QUOTES
   A LABEL IS PROSE AND AN ANCHOR IS CODE, and the two are separated
   STRUCTURALLY rather than by a list of key names. That inversion is forced by
   measurement: D-329's own exhibit passes its fragments as POSITIONAL ARGUMENTS
   (`arm(title, edits, mustFail, mustNotFail)`), so a matcher keyed on a
   `mustFail:` property name reads 140 quotes from 9 drivers and CANNOT SEE THE
   DRIVER THE ROW WAS WRITTEN ABOUT. Asking instead what a label IS reads 2,640
   from 87 of 88.

   An assertion's name has words, sits on one line, and carries no statement
   punctuation; a source anchor carries `{`, `}`, `;`, `=>` or a leading indent.
   The `>= 3 whitespace` floor is the over-strictness direction: it keeps a short
   identifier-with-a-space out of the label set rather than letting the span
   check argue with it. */
export function isLabelQuote(s) {
  return typeof s === "string" && s.length >= 20 && !s.includes("${") && !s.includes("\n")
    && !/[{};]|=>|^\s/.test(s) && (s.match(/\s/g) || []).length >= 3;
}

const LIT_RE = new RegExp(
  String.raw`(?:"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\`(?:[^\\\`]|\\.)*\`)`, "g");

export function unquoteLiteral(s) {
  const q = s[0], body = s.slice(1, -1);
  if (q === "`") return body.replace(/\\`/g, "`").replace(/\\\\/g, "\\").replace(/\\n/g, "\n");
  try { return JSON.parse(q === "'" ? `"${body.replace(/\\'/g, "'").replace(/"/g, '\\"')}"` : s); }
  catch { return null; }
}

/* Every distinct label-shaped literal in a driver, comments removed. */
export function readLabelQuotes(driverSrc) {
  const src = stripComments(driverSrc);
  const out = [], seen = new Set();
  LIT_RE.lastIndex = 0;
  let m;
  while ((m = LIT_RE.exec(src))) {
    const lit = unquoteLiteral(m[0]);
    if (lit === null || !isLabelQuote(lit) || seen.has(lit)) continue;
    seen.add(lit); out.push(lit);
  }
  return out;
}

/* ------------------------------------------------------------ DECLARED TALLIES
   The number the driver states about ITSELF, in its own head comment. NULL when
   nothing states one — never zero, because "this driver declares no arms" and
   "this matcher cannot read this driver's declaration" are different claims and
   folding them cost four consecutive re-measurements of VERIFICATION.md's own
   row (D-233). */
const WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20 };
const TALLY_RE = new RegExp(String.raw`\b(\d{1,2}|${Object.keys(WORDS).join("|")})\s+arms?\b`, "i");

/* THE HEAD IS WHERE A DRIVER DESCRIBES ITSELF, and the window ends at the first
   `import` rather than at a line count — D-233's measured defect was a FIXED
   60-LINE WINDOW that truncated a declaration straddling it. A driver's prose
   about ANOTHER driver's arm count would be a false read, so only the head is
   consulted and the matched phrase is carried back for the reader to judge. */
export function readDeclaredArms(driverSrc) {
  const at = driverSrc.indexOf("\nimport ");
  const head = driverSrc.slice(0, at > 0 ? at : Math.min(driverSrc.length, 6000));
  const m = TALLY_RE.exec(head);
  if (!m) return null;
  const n = WORDS[m[1].toLowerCase()] ?? Number(m[1]);
  if (!Number.isFinite(n)) return null;
  return { n, phrase: m[0], plusBaseline: /plus a baseline|and a baseline|baseline first/i.test(head) };
}

/* Does a MEASURED announcement count honour a DECLARED tally? A baseline row is
   an announcement and not a declared arm, so a driver that says it runs a
   baseline may announce one more than it declares. Anything else is decay. */
export function tallyHonoured(declared, measured) {
  if (!declared || measured == null) return null;
  return measured === declared.n || (declared.plusBaseline && measured === declared.n + 1);
}

/* ------------------------------------------------------------------- PREFLIGHT
   D-331's ruling, shared by the three throwing drivers. `arms` is
   `[{ id, anchors: [{ file, needle }] }]`; every anchor is counted in the file
   that arm will write, the WHOLE table is printed, and the caller throws only
   after the complete report exists.

   `want` is 1 by default because every one of these arms patches a unique site.
   An arm that deliberately patches a repeated line declares its own count, the
   same way `query.control.mjs`'s `count(s, x, 2)` guard does. */
/* `fatalFor` is the arm ids this invocation will actually RUN. The REPORT always
   covers every arm — that is the whole point — but a driver invoked for ONE arm
   must not be refused because a DIFFERENT arm's anchor is stale: that would make
   the complete report cost the ability to run the healthy half, which is the
   trade this pass exists to avoid. Omit it and every arm is fatal. */
export function preflight(label, arms, { log = console.log, fatalFor = null } = {}) {
  const rows = [];
  for (const arm of arms) {
    for (const a of arm.anchors) {
      let n = -1, err = null;
      try { n = readFileSync(a.file, "utf8").split(a.needle).length - 1; }
      catch (e) { err = String(e.message); }
      rows.push({ id: arm.id, file: a.file, needle: a.needle, want: a.want ?? 1, n, err });
    }
  }
  const bad = rows.filter((r) => r.err !== null || r.n !== r.want);
  log(`\n--- ARM PREFLIGHT · ${label} · ${rows.length} anchor(s) over ${arms.length} arm(s) ---`);
  log(`    D-331: every anchor is counted BEFORE anything is armed, so one dead anchor`);
  log(`    cannot hide the arms behind it. The throw is kept: nothing arms if any is wrong.`);
  for (const r of rows) {
    const short = r.needle.replace(/\n/g, "\\n").slice(0, 78);
    log(`    ARM PREFLIGHT ${String(r.id).padEnd(10)} ${r.n === r.want ? "ok  " : "<<< "}`
      + `occurs ${r.err !== null ? "UNREADABLE" : r.n} time${r.n === 1 ? "" : "s"} (want ${r.want}) in ${r.file}`);
    if (r.n !== r.want || r.err) log(`        ${short}`);
    if (r.err) log(`        UNREADABLE: ${r.err}`);
  }
  if (!bad.length) { log(`    ALL ${rows.length} ANCHORS LIVE.`); return rows; }
  log(`\n    *** ${bad.length} of ${rows.length} ARM ANCHORS ARE NOT LIVE — REFUSED TO ARM BLIND.`);
  for (const r of bad) log(`        arm ${r.id}: occurs ${r.err !== null ? "UNREADABLE" : r.n} times in ${r.file}`);
  log(`    Every arm above is reported, including the ones a throw at the first would`);
  log(`    have hidden. THAT IS THE WHOLE POINT OF THIS PASS (D-331).`);
  const fatal = fatalFor === null ? bad : bad.filter((r) => fatalFor.includes(r.id));
  if (!fatal.length) {
    log(`    NONE of them belongs to an arm THIS invocation runs (${fatalFor.join(", ")}), so the run`);
    log(`    continues — the findings above stand and are the report this pass exists for.`);
    return rows;
  }
  const e = new Error(`ARM PREFLIGHT FAILED for ${label}: ${fatal.length} of ${rows.length} anchors occur 0 times `
    + `or the wrong number of times — ${fatal.map((r) => `${r.id}:${r.n}`).join(", ")}`);
  e.preflight = rows;
  throw e;
}
