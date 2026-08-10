/* UI-53 — THE ONE DERIVED BAN FAMILY FOR DEC-32 CLAUSE 1, AND WHY THIS FILE
 * EXISTS INSTEAD OF A FIFTH LIST.
 *
 * NOT A SUITE. This module asserts nothing and is deliberately not named
 * `*.test.mjs`, because `civicos-ui/test/run.mjs` DISCOVERS `.test.mjs` by
 * filename and would run it, count it, and report a suite that tests nothing.
 * Its own suite is `analyst-vocabulary.test.mjs`.
 *
 * ============================================================================
 * WHAT WAS WRONG, MEASURED
 * ============================================================================
 * D-269 found that `civicos-ui/test/` carried THREE hand-written `BANNED` lists
 * that did not agree with each other, and that NONE would have caught
 * `independently sufficient` — the phrase actually being rendered to members off
 * `Store.#axisResult` and FROZEN INTO SIGNED `bundle.md` FRONTMATTER.
 *
 * **THERE ARE FOUR, NOT THREE.** `connections-sidebar.test.mjs` (UI-44) carries a
 * fourth, and its own comment says the patterns are `elicitation.test.mjs`'s
 * *"so the ban has ONE spelling in this directory"* — which was already false
 * when it was written, because `notifications.test.mjs` disagreed with it. That
 * is the disease this file treats: **several lists are WORSE than one, because
 * each one reads as coverage.** Measured 2026-08-09 at UI-53, and the fourth was
 * found only because the census was NOT keyed on the phrase D-269's delegation
 * used — a grep over prose is a hint, not a consumer census.
 *
 * WHAT THE FOUR ACTUALLY ENFORCED, and no two rows are the same:
 *
 *   term                    elicitation  notifications  version-review  sidebar
 *   ground                       Y            n              Y             Y
 *   disjunct*                    Y            partial        Y             Y
 *   branch                       Y            partial        Y             Y
 *   AND / OR (standalone)        Y            n              Y             Y
 *   (and|or)-related             Y            n              Y             Y
 *   partition                    n            Y              Y             Y
 *   independently sufficient     n            n              n             n
 *
 * ============================================================================
 * WHY THIS IS DERIVED AND NOT LISTED
 * ============================================================================
 * WORKER.md: *invert, do not lengthen a list — a list of spellings goes stale the
 * moment a fourth is written.* So the family is built from the AUTHORITY rather
 * than from memory, in three NAMED tiers:
 *
 *   1. ATOMS — parsed at run time from DEC-32 CLAUSE 1'S OWN SENTENCE in
 *      `docs/development/DECISIONS.md`: *"NEVER show AND / OR / disjunction /
 *      grounds — not even as tooltips."* The ruling enumerates the vocabulary, so
 *      the ruling is read. If Bob ever amends clause 1, the family moves with the
 *      amendment instead of drifting from it.
 *
 *   2. SPELLINGS — the STEM-PREFIX closure of each atom, so every spelling of a
 *      NAMED construct is caught without anybody listing it: `ground` covers
 *      `grounds`, `grounding`, `groundResult`; `disjun` covers `disjunct`,
 *      `disjunctive`, `disjunction`, `disjunctively`. This is the tier that does
 *      not go stale, and it is why `notifications.test.mjs` asserting
 *      `disjunction` while three others assert `disjunct` stops being a
 *      difference anybody has to notice.
 *
 *   3. RESIDUE — the terms that name the SAME construct but share no stem with
 *      any clause-1 atom, so no closure can reach them: `partition`, `conjunct`,
 *      `branch`, `independently sufficient`. **EVERY ONE IS CHECKED AT RUN TIME
 *      TO OCCUR IN DEC-32'S OWN ENTRY** (`residueIsAnchored`), so it is anchored
 *      to the decision rather than typed from somebody's memory of it; it is
 *      PRINTED on every run; and it is CEILINGED, because a residue that grows
 *      without bound has become the hand list it replaced.
 *
 * THE CONNECTIVES ARE CASE-SENSITIVE AND THAT IS A MEASURED LESSON, NOT A STYLE.
 * `bio-plane/test/sufficiency-state.test.mjs` records paying for it: written as
 * one case-insensitive alternation, `\bAND\b` matched the ordinary English
 * conjunction "and" and the arm fired on CORRECT text. DEC-32 prohibits a
 * capitalised operator; ordinary English is not the analyst's vocabulary. So
 * atoms of three letters or fewer are matched as CAPITALISED standalone tokens
 * only, and the longer nouns are matched case-insensitively.
 *
 * ============================================================================
 * WHAT THIS FAMILY CANNOT SEE — load-bearing, and the reason the next reader can
 * tell a clean result from a walk looking in the wrong place.
 * ============================================================================
 *  (a) A GENUINELY NOVEL TERM for the construct that shares no stem with a
 *      clause-1 atom and is not in the RESIDUE. `independently sufficient` was
 *      exactly that, and it is why the residue exists and is printed.
 *
 *      **THERE IS NO AUTOMATIC TIER FOR IT HERE, AND THE REASON IS MEASURED
 *      RATHER THAN ASSUMED.** D-269's open family — *machine-side words MINUS
 *      member-side words* — is sound over ITS corpus: 30 sentences composed by
 *      one function, with every record value a neutral placeholder. Run over the
 *      corpus THESE sweeps use (whole rendered surfaces), the same derivation
 *      measures **208 words**, and a co-occurrence-filtered variant **243** —
 *      both containing `example`, `correct`, `present`, `share`, `safe`, `bob`,
 *      `berkeley` and `newsroom`. Banning those on a member-facing surface would
 *      be a fence far tighter than its rule, which is an undeclared interface
 *      change wearing the costume of caution. **So the open tier belongs to
 *      `analystvocab.test.mjs`'s NARROW corpus and this family belongs to the
 *      BROAD one — that boundary is a finding, not a gap**, and the residue is
 *      how a novel term crosses it: named, in daylight, in one place.
 *
 *  (b) A WORD IN BOTH REGISTERS. Nothing here consults a member-side lexicon, on
 *      purpose: these four sweeps exist to catch a LEAK IN `app.html`, and a
 *      family that subtracted `app.html`'s own prose would let a leak sanction
 *      itself. That is why the tiers above are a PROHIBITION rather than a
 *      difference of two lexicons.
 *
 *  (c) VOCABULARY IN A NON-WORD CHANNEL — a CSS class, a `data-` attribute, an
 *      image, an aria-label. Each consumer strips tags and classifies prose.
 *
 *  (d) THE RECORD'S OWN VALUES. A member who names their own set "ground 1" has
 *      it rendered back verbatim (DEC-8, and not this defect). Three of the four
 *      consumers deliberately plant exactly such a label as their polarity
 *      witness, so this family FIRING on it is the intended behaviour there.
 *
 * ============================================================================
 * WHAT IS DELIBERATELY NOT FOLDED IN — a different question, kept and named.
 * ============================================================================
 *  · `civicos-ui/test/capture-honesty.test.mjs`'s `JARGON` asks a DIFFERENT
 *    QUESTION and is NOT a rival to this family: it holds capture prose to Bob's
 *    plain-language ruling (`subrequest`, `runtime`, `manifest`, `sha256`,
 *    `Durable`, `op=`, `content_hash`). None of those is DEC-32 vocabulary and
 *    none of DEC-32's vocabulary is jargon in that sense. Folding it in for
 *    tidiness would have made one instrument answer two questions and neither
 *    well.
 *  · `bio-plane/test/sufficiency-state.test.mjs`'s `BANNED_OPERATOR`/`BANNED_TERM`
 *    ask THIS question but on the PLANE's ground, over published state text. It
 *    is not this item's to edit; it is the source of the case-sensitivity rule
 *    above and is named in UI-53's delegation.
 */
import { readFileSync } from "node:fs";

const HERE = new URL("./", import.meta.url);
const DECISIONS = new URL("../../docs/development/DECISIONS.md", HERE);
const STORE = new URL("../../bio-plane/src/store.mjs", HERE);

/* ------------------------------------------------------------------ *
 * TIER 1 · THE ATOMS, READ FROM THE RULING ITSELF.
 * ------------------------------------------------------------------ */

const decSrc = readFileSync(DECISIONS, "utf8");
const a = decSrc.indexOf("### DEC-32 · answered");
const b = decSrc.indexOf("### DEC-33 · answered");
/* Returns "" rather than a plausible-but-wrong slice when either anchor moves,
   so the suite's floor can tell "found nothing" from "found the wrong thing". */
export const DEC32_ENTRY = (a >= 0 && b > a) ? decSrc.slice(a, b) : "";

/* Clause 1's own sentence. The enumeration sits between "NEVER show" and the
   em-dash; the tokens are separated by " / " in the ruling's own punctuation. */
export const CLAUSE_1 = (DEC32_ENTRY.match(/NEVER show[^.]*\./) || [""])[0];
export const ATOMS = ((CLAUSE_1.match(/NEVER show\s+([^—.]*)/) || [, ""])[1])
  .split("/").map((s) => s.trim().toLowerCase()).filter(Boolean);

/* ------------------------------------------------------------------ *
 * TIER 2 · THE SPELLINGS — stem-prefix closure of each atom.
 * ------------------------------------------------------------------ */

/* The prefix a spelling of this construct must start with. Deliberately blunt:
   `grounds` -> `ground`, `disjunction` -> `disjun`. Blunt in the SAFE direction,
   because a prefix that is too short over-matches VISIBLY (a red suite naming
   the word) while one that is too long under-matches SILENTLY, and this project
   treats the silent direction as the worse one. */
export function stemPrefix(atom) {
  const w = String(atom).toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return w;                    /* a connective, not a noun */
  if (/^disjun/.test(w) || /^conjun/.test(w)) return w.slice(0, 6);
  return w.replace(/(ives|ing|ion|ed|es|s)$/, "");
}

export const CONNECTIVES = ATOMS.filter((x) => x.replace(/[^a-z]/gi, "").length <= 3);
export const NOUNS = ATOMS.filter((x) => x.replace(/[^a-z]/gi, "").length > 3);

/* Harvested from the machine side purely so the suite can PROVE the closure
   reaches real spellings the derivation actually uses, rather than asserting it.
   The MATCHER does not need this set — a prefix regex already covers every
   spelling — but a claim nobody drives is the defect this project meets most. */
export function machineSpellings() {
  let src = "";
  try { src = readFileSync(STORE, "utf8"); } catch (_) { return []; }
  const region = src + "\n" + DEC32_ENTRY;
  const out = new Set();
  const pre = NOUNS.map(stemPrefix).filter((p) => p.length > 2);
  for (const w of region.match(/[A-Za-z][A-Za-z-]*/g) || []) {
    const lw = w.toLowerCase();
    for (const p of pre) if (lw.startsWith(p) && lw !== p) out.add(lw);
  }
  return [...out].sort();
}

/* ------------------------------------------------------------------ *
 * TIER 3 · THE RESIDUE — same construct, no shared stem, so NAMED.
 * ------------------------------------------------------------------ */

/* EVERY ENTRY IS ANCHORED: `residueIsAnchored()` proves each one occurs in
   DEC-32's own entry, so this is the decision's vocabulary rather than a
   maintainer's recollection of it. CEILINGED by the suite — a residue that grows
   without bound has become the hand list this file replaced. */
export const RESIDUE = [
  ["partition", /\bpartition/i,
   "DEC-32's own noun for the split (`each ground a labelled partition of the basis legs`); shares no stem with any clause-1 atom. 3 of the 4 hand lists carried it"],
  ["conjunct", /\bconjunct/i,
   "the dual of `disjunction`, and DEC-32's own word for the other relationship (`the conjunctive/disjunctive distinction`). NO hand list carried it"],
  ["branch", /\bbranch/i,
   "DEC-32's own noun for one of them (`an OR branch`, `OR-related branches`). 3 of the 4 hand lists carried it"],
  ["independently sufficient", /\bindependently\s+sufficient/i,
   "DEC-32's own phrase for the member's authored judgement, and THE PHRASE THAT WAS REACHING MEMBERS (D-269). NOT ONE of the four hand lists carried it — this residue is the whole reason the family is derived in one place"],
];

/* Is every residue term really in the ruling? The suite asserts this; it is
   exported so the answer is computed from the decision, not declared here. */
export function residueIsAnchored() {
  return RESIDUE.map(([term]) => [term, new RegExp(term.replace(/\s+/g, "\\s+"), "i").test(DEC32_ENTRY)]);
}

/* ------------------------------------------------------------------ *
 * THE MATCHER — ONE definition, four consumers.
 * ------------------------------------------------------------------ */

/* `BANNED` is shaped `[RegExp, why]` deliberately: that is the shape the four
   hand lists already had, so each consumer replaces its literal with an import
   and NOTHING ELSE IN THE SUITE MOVES. A migration that also rewrites the corpus
   cannot be reviewed for what it changed. */
export const BANNED = [
  /* the NOUNS, case-insensitive, by stem prefix — every spelling, unlisted */
  ...NOUNS.map((n) => [
    new RegExp("\\b" + stemPrefix(n), "i"),
    `DEC-32 clause 1 names \`${n}\`; matched by stem so every spelling of it is covered without listing one`,
  ]),
  /* THE CONNECTIVES, AND THE SHAPE OF THIS RULE IS A MEASUREMENT RATHER THAN A
     PREFERENCE. TWO over-strictness findings are folded in here, one inherited
     and one this item made:
       (i)  written case-INsensitively, `\bAND\b` matches the ordinary English
            conjunction and the arm fires on CORRECT text — paid for once in
            `bio-plane/test/sufficiency-state.test.mjs`, whose comment records it.
       (ii) CASE-SENSITIVITY IS NOT ENOUGH, and that is UI-53's own finding. Three
            of the four hand lists carried a bare `/\b(AND|OR)\b/`, and the moment
            all four consumed one family it FIRED ON CORRECT MEMBER-FACING PROSE:
            `notifications.test.mjs` renders *"LOOKED FOR AND NOT THERE"*, an
            ordinary English conjunction capitalised for emphasis. The three lists
            had never fired only because their own corpora happened to contain no
            capitalised English — and `notifications.test.mjs` OMITTED the bare
            token, which now reads as the correct judgement rather than the gap
            D-269's delegation took it for.
     SO THE CONNECTIVE IS BANNED AS VOCABULARY, NOT AS A TOKEN: compounded onto
     the construct, paired with its dual, used as a NOUN behind a determiner, or
     naming the relationship. An ordinary capitalised conjunction between two
     clauses is correct work and must pass — a fence tighter than its rule is an
     undeclared interface change wearing the costume of caution. */
  [/(^|[^A-Za-z])(AND|OR)\s*\/\s*(AND|OR)([^A-Za-z]|$)/, "the connective pair as vocabulary (`AND/OR`)"],
  [/\b(and|or)-(related|branch|branches|composed|group|grouped|max|min|set|sets)\b/i,
   "the connective compounded onto the construct it relates"],
  [/\b(the|an|a|this|that|its|each|every|any|one)\s+(AND|OR)\b/,
   "the connective used as a NOUN behind a determiner (`the OR`, `an AND`) — the analyst's vocabulary, not English"],
  [/\b(AND|OR)\s+(of|branch|branches|relationship|related|composition|composed|leg|legs|set|sets)\b/i,
   "the connective naming the relationship or the thing it relates"],
  [/\b(is|are|were|was|becomes|composes?)\s+(AND|OR)\b/,
   "the connective as the predicate — `the relationship between legs is AND or OR`, DEC-32's own sentence"],
  /* the RESIDUE */
  ...RESIDUE.map(([term, re, why]) => [re, `${term} — ${why}`]),
];

/* The classifier every consumer calls. Returns [] for clean text. */
export function analystHits(text) {
  const t = String(text || "");
  const hits = [];
  for (const [re, why] of BANNED) {
    const m = re.exec(t);
    if (m) hits.push({ token: String(m[0]).trim(), why });
  }
  return hits;
}

/* One line every consumer prints, so a reader of ANY of the four sweeps is told
   which family judged it and how big that family was on this tree — a floor is
   only a ratchet if somebody can see the number it is holding. */
export function reachLine() {
  return `analyst-vocabulary (UI-53): ${BANNED.length} patterns · atoms [${ATOMS.join(", ")}] `
       + `from DEC-32 clause 1 · ${NOUNS.length} noun stem(s) [${NOUNS.map(stemPrefix).join(", ")}] `
       + `· ${CONNECTIVES.length} connective(s) · residue ${RESIDUE.length} [${RESIDUE.map(([t]) => t).join(", ")}]`;
}
