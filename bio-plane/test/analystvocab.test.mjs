/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/analystvocab.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (strengthpair/PL-2/PL-3's shape). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad.
   SIX ARMS, each armed ALONE with the others held open, each restored against a UNIQUELY-NAMED pristine copy verified by sha256 AND by `cmp`, with a byte count printed and floored. Figures live in the control file.
   (1) THE SUBJECT — restore D-269's landed wording (`independently sufficient grounds`) in `#axisResult`. MUST FAIL.
   (2) THE CONCATENATION TRAP, and it is the arm this item exists for — plant a forbidden phrase SPLIT ACROSS A `+` BOUNDARY (`... independently ` + `sufficient sets ...`), the exact shape that made UI-43's first matcher read 2 of 3. MUST FAIL. A source-text grep for the joined phrase would read clean here.
   (3) THE CORPUS — empty the fixture matrix. MUST FAIL on the floor, because a sweep over nothing reports clean (three headline totality assertions have passed over an empty corpus in this project).
   (4) THE LEXICON — empty the derived machine-side lexicon. MUST FAIL on its floor, because a derived ban family that derives nothing bans nothing.
   (5) THE SURFACE — make `axisPanel` in `civicos-ui/app.html` stop rendering `detail` verbatim. MUST FAIL, because the whole transfer of this suite's verdict to the member rests on the surface adding and removing nothing.
   (6) OVER-STRICTNESS, and it MUST NOT FAIL — a legitimate, non-member-facing use of the very words: a block COMMENT reading "the OR part over the grounds partition" and a `const groundPartition` identifier planted INSIDE `#axisResult`, plus a banned word in this suite's own fixture ids and in a test fixture file. The ban is on what a member READS, not on what the engine is called; a harness that goes red here is a fence tighter than its rule.
 */
/* D-269 — THE ANALYST'S VOCABULARY IN THE PLANE'S SUCCESS PROSE, AND WHY THIS
 * SUITE IS NOT A LIST OF BANNED WORDS.
 *
 * ============================================================================
 * WHAT IS BEING ASSERTED
 * ============================================================================
 * DEC-32 clause 1: *"NEVER show AND / OR / disjunction / grounds — not even as
 * tooltips."* The ban exists because that vocabulary is the machine's language
 * for a structure members are asked about in CONSEQUENCES (*"if this turned out
 * to be wrong, would your answer still hold?"*, clause 2). Rendering the machine
 * word puts back on the surface the construct the decision removed from it.
 *
 * The REFUSAL side of this was already held: PL-14's canned translations are
 * swept and its suite asserts the ban of every one. THE SUCCESS SIDE WAS NOT.
 * `Store.#axisResult` composes the `detail` sentence every strength surface
 * prints, and ALL THREE of its states carried the vocabulary — measured by
 * UI-43, re-measured here, and rendered to members at four sites in
 * `civicos-ui/app.html` off `op=inquirystrength`.
 *
 * ============================================================================
 * WHY THIS IS NOT A LIST OF SPELLINGS, AND WHAT IT IS INSTEAD
 * ============================================================================
 * There were FOUR separate hand-written BANNED lists in this repository and NO
 * TWO OF THEM AGREED. That is the failure mode WORKER.md names: *a list of
 * spellings goes stale the moment a fourth is written*. None of them would have
 * caught `independently sufficient`.
 *
 * CORRECTED 2026-08-09 (UI-53): this paragraph said THREE
 * (`civicos-ui/test/elicitation.test.mjs`, `notifications.test.mjs`,
 * `version-review.test.mjs`). There was a FOURTH in `connections-sidebar.test.mjs`
 * — whose own comment claimed the ban had "ONE spelling in this directory",
 * already false, because `notifications.test.mjs` disagreed with the list it was
 * copied from. **This item's census was keyed on the phrase its own delegation
 * used and so under-reported by one**, which is the receipt for *a grep over
 * prose is a hint, not a consumer census*.
 *
 * ALL FOUR ARE NOW CONSUMERS of one derived family
 * (`civicos-ui/test/analyst-vocabulary.mjs`, UI-53 — derived from DEC-32 clause
 * 1's own sentence). ARM L below drives the cross-check both ways.
 *
 * SO THE FAMILY IS DERIVED, NOT LISTED. The question asked is not *"is this
 * word on a list?"* but *"is this a word the MACHINE uses to explain itself,
 * which the MEMBER'S OWN FLOW never uses?"* — and both sides of that are
 * harvested from real files at run time:
 *
 *   MACHINE-SIDE LEXICON — every word appearing in the COMMENTS and IDENTIFIERS
 *     of the strength derivation in `bio-plane/src/store.mjs`. That is the
 *     analyst explaining the mechanism to another engineer, which is by
 *     definition the register the ban is about.
 *   MEMBER-SIDE LEXICON — the words the product ALREADY ships to members for
 *     this construct, from two sources and neither of them hand-typed:
 *       (i)  the STRING LITERALS ONLY of `civicos-ui/app.html`'s marked
 *            member-facing blocks — UI-27's elicitation (DEC-32 clause 2/3's
 *            own rendering, the words the decision sanctions) and UI-42's
 *            version review. LITERALS ONLY IS LOAD-BEARING AND WAS MEASURED:
 *            harvesting the whole block made `ground` member-side, because the
 *            block's own COMMENTS explain the mechanism. A block may not
 *            sanction a word it never renders.
 *       (ii) THE FLAT (UNSTRUCTURED) SENTENCES, DRIVEN FROM THE PRODUCT ITSELF
 *            in §3. These are the SANCTIONED BASELINE: they predate DEC-32,
 *            three UI suites pin them verbatim, and DEC-32's own anti-gaming
 *            keystone requires the unstructured answer to be unchanged TO THE
 *            BYTE. Taking them as the baseline turns §4 into the assertion the
 *            defect actually needs — *the STRUCTURED sentences REC-42 added
 *            introduce no vocabulary the flat baseline did not already ship* —
 *            and it self-updates instead of going stale.
 *
 * A token in a member-facing sentence is a HIT iff it is MACHINE-SIDE and NOT
 * MEMBER-SIDE. The property that matters: when an engineer invents a FOURTH
 * spelling, they will write it in the comment or the identifier that explains
 * it — so it joins the machine-side lexicon in the same commit, and this suite
 * catches it without anybody adding it to a list. A list cannot do that.
 *
 * A SEED FLOOR sits under the derived family so it can never be WEAKER than
 * what the three existing hand lists already enforce (their union, ARM L). THE
 * SEEDS ARE CHECKED BEFORE THE MEMBER-SIDE SKIP AND ARE NEVER ELIGIBLE FOR IT,
 * which is what stops the self-updating baseline from eroding: if the FLAT
 * sentence ever grew `ground`, the baseline would sanction it and the seed
 * would still fire. The derived family is the ceiling; the seeds are the
 * floor; neither alone is the instrument.
 *
 * ADJUDICATED — words the derivation genuinely uses that ARE the member's too,
 * printed on every run with the reason and the sanctioning site. This list is
 * the honest cost of an inverted matcher: it produces false positives, and
 * false positives are the safe direction because they are ADJUDICATED IN
 * DAYLIGHT rather than silently missed.
 *
 * ============================================================================
 * THE CORPUS IS DRIVEN, NOT GREPPED, AND THAT IS THE POINT
 * ============================================================================
 * UI-43's first matcher read 2 OF 3 and missed the GRADED branch — the one that
 * actually renders to members — because the source splits `independently ` from
 * `sufficient grounds` across a `+`. ANY matcher that reads SOURCE TEXT is
 * defeated by concatenation and will under-report, telling the next reader the
 * problem is smaller than it is.
 *
 * So `#axisResult` is LIFTED FROM `store.mjs` BY ITS REAL BYTES and EXECUTED,
 * and the classifier reads the RENDERED sentence. Concatenation cannot hide
 * anything from a string that has already been built. ARM 2 of the control
 * plants a split phrase and proves it.
 *
 * WHAT THE LIFT IS AND IS NOT: it is the product's own bytes, span-extracted
 * and evaluated — NOT a hand copy. This project has measured five times that a
 * hand copy agrees for free, including a complete hand copy of 131 op names
 * that passed. ARM S asserts every extracted span is non-trivial AND runs the
 * SAME extractor over subjects that must trip it.
 *
 * ============================================================================
 * WHAT THIS SUITE CANNOT SEE — load-bearing, and the reason the next reader can
 * tell a clean result from a walk looking in the wrong place.
 * ============================================================================
 *  (a) PER-SITE REFUSAL `detail` STRINGS. There are far more of them than the
 *      163 canned translations and they are NOT in this corpus. PL-14 owns the
 *      refusals' wording and this item did not widen into it; the MEASURED
 *      count and the hits are in this item's report and in a delegation.
 *  (b) A WORD IN BOTH LEXICONS. If a member-facing block itself leaked the
 *      vocabulary, this classifier would take it as sanctioned. The three
 *      per-surface sweeps named above are the independent instrument for that,
 *      and they are the reason this one is allowed to trust `app.html`.
 *  (c) THE RECORD'S OWN VALUES. A member who NAMES a set of reasons
 *      "ground 1" has that label rendered back verbatim, and this suite treats
 *      every interpolated record value as opaque (the fixtures feed neutral
 *      placeholders, so a hit can only come from the COMPOSER'S OWN WORDS).
 *      Rendering a member's own word is DEC-8 and is not this defect; whether
 *      the elicitation should refuse such a label is a separate, unruled
 *      question and is delegated rather than decided here.
 *  (d) VOCABULARY IN A NON-WORD CHANNEL — a CSS class, a `data-` attribute, an
 *      image, an aria-label. Only prose is classified.
 *  (e) `#strengthWalk`'s four `why:` sentences are read from FLATTENED SOURCE
 *      (§4), not driven, so this suite can see THAT they are clean but cannot
 *      prove which branch renders each. The one that matters is driven anyway,
 *      because it EMBEDS `detail` verbatim (§4b) — a fifth channel UI-43's
 *      four-site count did not include.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
/* UI-53: the UI estate's ONE derived ban family, imported so ARM L can DRIVE the
   cross-check rather than compare regex source text. */
import { analystHits as uiAnalystHits } from "../../civicos-ui/test/analyst-vocabulary.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const STORE = ROOT + "src/store.mjs";
const APP = ROOT + "../civicos-ui/app.html";
const UITEST = ROOT + "../civicos-ui/test/";

let pass = 0, fail = 0;
const fails = [];
function ok(what, cond) {
  if (cond) { pass++; return true; }
  fail++; fails.push(what); console.log(`  FAIL  ${what}`);
  return false;
}
/* Firebreak: a TypeError inside an assertion goes through NO assertion at all
   and ends the module while the tally reads clean (D-93, six sightings). Each
   section runs inside one of these so a throw is recorded as a failure NAMING
   ITS SECTION. */
function section(name, fn) {
  try { fn(); } catch (e) {
    fail++; fails.push(`${name} THREW`);
    console.log(`  FAIL  ${name} THREW: ${e && e.stack ? e.stack : e}`);
  }
}

const storeSrc = readFileSync(STORE, "utf8");
const appSrc = readFileSync(APP, "utf8");

/* ==================================================================== *
 * §1 · THE LIFT — the product's own bytes, extracted and executed.
 * ==================================================================== */

/* Balanced-brace extraction from an anchor. Returns null rather than a
   plausible-but-wrong span when the anchor is absent, so ARM S can tell
   "found nothing" from "found the wrong thing". */
/* A REAL SCANNER, and the reason it is one rather than a brace count is
   MEASURED: the first version toggled "in a template literal" on every
   backtick INCLUDING the ones inside BLOCK COMMENTS, and store.mjs's
   comments are full of them. The span ran to the end of the file and §4a
   reported 1,704 string literals for a 90-line function — a runaway span
   answering loudly, which is the failure this project has sighted twice this
   week. ARM S now asserts a span swallows no OTHER anchor. */
function liftMethod(src, anchor) {
  const i = src.indexOf(anchor);
  if (i < 0) return null;
  const open = src.indexOf("{", i + anchor.length - 1);
  if (open < 0) return null;
  let depth = 0, mode = "code";
  const tplStack = [];      /* brace depths at which a `${` was opened */
  for (let j = open; j < src.length; j++) {
    const c = src[j], d = src[j + 1];
    if (mode === "code") {
      if (c === "/" && d === "*") { mode = "block"; j++; continue; }
      if (c === "/" && d === "/") { mode = "line"; j++; continue; }
      if (c === '"') { mode = "dq"; continue; }
      if (c === "'") { mode = "sq"; continue; }
      if (c === "`") { mode = "tpl"; continue; }
      if (c === "{") { depth++; continue; }
      if (c === "}") {
        if (tplStack.length && depth === tplStack[tplStack.length - 1]) { tplStack.pop(); mode = "tpl"; continue; }
        depth--; if (!depth) return src.slice(i, j + 1);
        continue;
      }
      continue;
    }
    if (mode === "block") { if (c === "*" && d === "/") { mode = "code"; j++; } continue; }
    if (mode === "line") { if (c === "\n") mode = "code"; continue; }
    if (mode === "dq" || mode === "sq") {
      if (c === "\\") { j++; continue; }
      if (c === (mode === "dq" ? '"' : "'")) mode = "code";
      continue;
    }
    /* tpl */
    if (c === "\\") { j++; continue; }
    if (c === "`") { mode = "code"; continue; }
    if (c === "$" && d === "{") { tplStack.push(depth); mode = "code"; j++; continue; }
  }
  return null;
}
function liftField(src, anchor, end = ";") {
  const i = src.indexOf(anchor);
  if (i < 0) return null;
  const e = src.indexOf(end, i);
  return e < 0 ? null : src.slice(i, e + 1);
}

const SPANS = {
  axisResult:   liftMethod(storeSrc, "static #axisResult(axis, members, exhausted)"),
  groundResult: liftMethod(storeSrc, "static #groundResult(ground, members, exhausted)"),
  namedMember:  liftMethod(storeSrc, "static #namedMember(m)"),
  weakestOf:    liftMethod(storeSrc, "static #weakestOf(members)"),
  strengthWalk: liftMethod(storeSrc, "#strengthWalk(bundleId, depth, bound, legsOverride = null)"),
  gradeRank:    liftField(storeSrc, "static #GRADE_RANK = Object.fromEntries("),
  depthBound:   liftField(storeSrc, "static QUEUE_ANCESTOR_DEPTH ="),
};

/* ---- ARM S · THE INSTRUMENT IS THE MOST LIKELY THING TO BE WRONG ---- */
section("ARM S", () => {
  const REQUIRED = {
    axisResult: ["detail:", "state: \"unrated\"", "state: \"undetermined\"", "state: \"graded\""],
    groundResult: ["load_bearing", "not_load_bearing"],
    namedMember: ["bundle_id", "target_id"],
    weakestOf: ["GRADE_RANK"],
    strengthWalk: ["why:", "STRENGTH_AXES"],
    gradeRank: ["BASIS_GRADES"],
    depthBound: ["6"],
  };
  const FLOOR = { axisResult: 2000, groundResult: 400, namedMember: 300, weakestOf: 200,
                  strengthWalk: 1500, gradeRank: 40, depthBound: 20 };
  for (const [k, span] of Object.entries(SPANS)) {
    ok(`ARM S: the span for ${k} was found at all`, typeof span === "string" && span.length > 0);
    if (typeof span !== "string") continue;
    ok(`ARM S: ${k}'s span is NON-TRIVIAL (${span.length} bytes, floor ${FLOOR[k]})`, span.length >= FLOOR[k]);
    for (const tok of REQUIRED[k])
      ok(`ARM S: ${k}'s span really contains ${JSON.stringify(tok)} — a span that cannot carry what is sought is the wrong span`,
         span.includes(tok));
  }
  /* A RUNAWAY SPAN IS THE FAILURE THIS INSTRUMENT ACTUALLY MET (see the
     scanner's comment). A span that swallowed a NEIGHBOURING anchor is wrong
     however plausible its bytes look, and this is the cheap check that sees it
     where a length floor cannot. */
  const ANCHORS = ["static #axisResult(", "static #groundResult(", "static #namedMember(",
                   "static #weakestOf(", "#strengthWalk(bundleId"];
  for (const [k, span] of Object.entries(SPANS)) {
    if (typeof span !== "string") continue;
    const swallowed = ANCHORS.filter((a) => span.indexOf(a) > 0);
    ok(`ARM S: ${k}'s span swallowed no OTHER function's anchor — found [${swallowed.join(", ")}]`,
       swallowed.length === 0);
  }
  /* The SAME extractor over subjects that MUST trip it. A reader that returns
     a clean span over either of these is broken. */
  ok("ARM S: the extractor returns null on a source with no anchor, rather than a plausible span",
     liftMethod("const x = 1;\nfunction other(){ return 2; }", "static #axisResult(axis, members, exhausted)") === null);
  ok("ARM S: the extractor returns null when the anchor survives but the body never closes",
     liftMethod("static #axisResult(axis, members, exhausted) { if (a) { ", "static #axisResult(axis, members, exhausted)") === null);
  ok("ARM S: and it does not mistake a brace inside a template literal for the body's end",
     String(liftMethod("static #t(){ const s = `a ${ {x:1} } b`; return s; }", "static #t()")).endsWith("return s; }"));
});

/* Rewrite the lifted spans into a runnable module. `Store.#x` -> `S_x`, and
   the static declarations into plain functions/consts. Nothing is re-typed:
   every byte of every BODY is the product's. */
function runnable() {
  const rw = (s) => String(s)
    .replace(/Store\.#/g, "S_")
    .replace(/Store\./g, "S_");
  const src =
    `const BASIS_GRADES = ${JSON.stringify(["A", "B", "C", "D"])};\n` +
    rw(SPANS.gradeRank).replace(/^static #GRADE_RANK =/, "const S_GRADE_RANK =") + "\n" +
    rw(SPANS.depthBound).replace(/^static QUEUE_ANCESTOR_DEPTH =/, "const S_QUEUE_ANCESTOR_DEPTH =") + "\n" +
    rw(SPANS.weakestOf).replace(/^static #weakestOf/, "function S_weakestOf") + "\n" +
    rw(SPANS.namedMember).replace(/^static #namedMember/, "function S_namedMember") + "\n" +
    rw(SPANS.groundResult).replace(/^static #groundResult/, "function S_groundResult") + "\n" +
    rw(SPANS.axisResult).replace(/^static #axisResult/, "function S_axisResult") + "\n" +
    `export { S_axisResult as axisResult };\n`;
  return src;
}

/* BASIS_GRADES is the catalog's and is IMPORTED rather than trusted from the
   line above: if the catalog's grade vocabulary ever moves, this suite must
   move with it rather than quietly composing over a stale ladder. */
const { BASIS_GRADES } = await import("../checks/bio-checks.mjs");

let axisResult = null;
section("§1 LOAD", async () => {});
try {
  const src = runnable().replace(
    /const BASIS_GRADES = \[[^\]]*\];/,
    `const BASIS_GRADES = ${JSON.stringify(BASIS_GRADES)};`);
  const mod = await import("data:text/javascript;base64," + Buffer.from(src, "utf8").toString("base64"));
  axisResult = mod.axisResult;
} catch (e) {
  fail++; fails.push("§1 the lifted derivation would not load");
  console.log(`  FAIL  §1 the lifted derivation would not load: ${e && e.stack ? e.stack : e}`);
}
ok("§1: the lifted `#axisResult` is a callable function built from store.mjs's own bytes",
   typeof axisResult === "function");
ok("§1: and the grade ladder came from the catalog, not from this file",
   Array.isArray(BASIS_GRADES) && BASIS_GRADES.length >= 4);

/* ==================================================================== *
 * §2 · THE LEXICONS — derived, printed, floored.
 * ==================================================================== */

const WORD = /[A-Za-z][A-Za-z-]*/g;
const words = (t) => (String(t).toLowerCase().match(WORD) || []);

/* MACHINE SIDE: the comments and identifiers of the derivation. Strings are
   REMOVED first — a string in this region is (or becomes) member-facing prose
   and must never be allowed to sanction its own vocabulary. */
function machineLexicon() {
  const region = [SPANS.axisResult, SPANS.groundResult, SPANS.namedMember,
                  SPANS.weakestOf, SPANS.strengthWalk].join("\n");
  const noStrings = region
    .replace(/`(?:[^`\\]|\\.)*`/g, " ")
    .replace(/"(?:[^"\\]|\\.)*"/g, " ")
    .replace(/'(?:[^'\\]|\\.)*'/g, " ");
  /* identifiers split on camelCase and _ so `groundResult` yields `ground`. */
  const out = new Set();
  for (const w of noStrings.match(/[A-Za-z_#][A-Za-z0-9_#]*/g) || [])
    for (const part of w.replace(/[#_]/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/\s+/))
      if (part.length > 2) out.add(part);
  for (const c of noStrings.match(/\/\*[\s\S]*?\*\//g) || []) for (const w of words(c)) if (w.length > 2) out.add(w);
  return out;
}

/* MEMBER SIDE: the words `civicos-ui/app.html` already ships to members for
   this construct. Harvested from the two marked blocks the record sanctions,
   plus the flat strength sentences the UI fixtures pin. */
function block(src, start, end) {
  const a = src.indexOf(start), b = src.indexOf(end);
  return (a >= 0 && b > a) ? src.slice(a, b) : "";
}
/* STRING LITERALS ONLY, AND TWO THINGS HERE WERE MEASURED RATHER THAN
   REASONED. (i) Harvesting a whole block made `ground` member-side off the
   block's own explanatory COMMENTS — a file may not sanction a word it never
   renders — so comments are stripped first. (ii) SINGLE-QUOTED LITERALS ARE
   NOT HARVESTED AT ALL: an apostrophe in ordinary prose ("IS-3's table")
   opened a phantom string that ran through the surrounding CODE, and the
   phantom spans were what made `ground` look member-facing a second time. The
   product writes member prose in double quotes and backticks; dropping single
   quotes costs nothing here and removes the whole failure. */
function literalsOf(src) {
  const noComments = String(src).replace(/\/\*[\s\S]*?\*\//g, " ");
  return (noComments.match(/`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*"/g) || [])
    .map((s) => s.slice(1, -1).replace(/\$\{[^}]*\}/g, " "));
}
function memberLexicon() {
  const elic = block(appSrc, "__ELICITATION_START__", "__ELICITATION_END__");
  const vrev = block(appSrc, "__VERSION_REVIEW_START__", "__VERSION_REVIEW_END__");
  const out = new Set();
  for (const t of [elic, vrev]) for (const lit of literalsOf(t)) for (const w of words(lit)) out.add(w);
  return { set: out, elicBytes: elic.length, vrevBytes: vrev.length };
}

/* THE SEED FLOOR — the union of the three hand lists already in this repo, so
   the derived family can never be weaker than what is already enforced. These
   are a FLOOR and never the instrument: none of the three would have caught
   `independently sufficient`, which is exactly why the derived family exists. */
const SEEDS = [
  [/\bground/i, "the analyst's noun for a set of reasons (elicitation.test.mjs)"],
  [/\bdisjunct/i, "the analyst's word for the relationship (elicitation.test.mjs)"],
  [/\bconjunct/i, "its dual"],
  [/\bpartition/i, "the analyst's word for the split (notifications.test.mjs)"],
  [/\bbranch/i, "the analyst's word for one of them (elicitation.test.mjs)"],
  [/\bindependently sufficient/i, "D-269's own phrase, which NO hand list carried"],
  [/(^|[^A-Za-z])AND\/OR([^A-Za-z]|$)/, "the connective as vocabulary (notifications.test.mjs)"],
  [/\b(and|or)-related\b/i, "the relationship, named (elicitation.test.mjs)"],
  [/\bOR-branch\b/, "notifications.test.mjs"],
];

/* ADJUDICATED — machine-side words that are legitimately the member's too.
   Each carries its reason and the site that sanctions it, and the whole list
   is PRINTED on every run. An inverted matcher earns its keep by producing
   false positives that get argued with in daylight. */
const ADJUDICATED = new Map([
  ["axis", "the record's own published field name and the surface's heading (app.html AXIS_SHORT)"],
  ["capture", "one of the two axes; DEC-21's own word and the member's"],
  ["connection", "the other axis; same"],
  ["grade", "the member-facing letter, published and rendered everywhere"],
  ["leg", "app.html prints 'N of M legs on this axis are load-bearing' — sanctioned member word"],
  ["legs", "app.html prints the plural in the same load-bearing count line"],
  ["bearing", "'load-bearing' is the surface's own phrase"],
  ["load", "half of load-bearing, the surface own phrase for an inert leg"],
  ["undetermined", "D-160's ruled state word, rendered as a state"],
  ["unrated", "D-160's ruled boundary word, rendered as a state"],
  ["graded", "the third state word"],
  ["weakest", "the flat sentence has said this since REC-12 and DEC-32 requires it unchanged"],
  ["stronger", "the flat sentence has rendered no-stronger-than since REC-12"],
  /* ADJUDICATED 2026-08-09 AT D-269, and named as such because adding a word to
     this list to silence a hit is how such a list rots. `strongest` is
     machine-side (the derivation's comment says "the STRONGEST of them") and
     was the LAST hit standing after the correction. It is kept because it is
     the superlative of a word the FLAT baseline has rendered to members since
     REC-12 ("no stronger than the weakest ..."), and because DEC-32 clause 7
     requires a reader to be told WHICH set carried the conclusion — a sentence
     that cannot say "the strongest" cannot say that. ARM A below makes the
     judgement checkable rather than asserted: this entry is STEM-BACKED. */
  ["strongest", "superlative of `stronger`, which the flat baseline has rendered since REC-12; STEM-BACKED"],
  /* ADJUDICATED 2026-08-09 AT D-269, same judgement as `strongest` and named
     for the same reason. `within` is machine-side (the derivation's comment
     says "the MIN WITHIN a branch") and is also ordinary English. It is kept
     because D-269's correction was deliberately MINIMAL — it moved the nouns
     DEC-32 forbids and nothing else, so the sentence's two emphasis capitals
     (`STRONGEST`, `WITHIN`) stay exactly where REC-42 put them. Widening the
     edit to words the decision does not ban would have been the fence tighter
     than its rule that this item's control ARM 6 exists to refuse, and it
     would have broken a consumer for nothing. */
  ["within", "ordinary English, and D-269's correction moved only the nouns DEC-32 bans"],
  ["strength", "the surface's own heading"],
  ["conclusion", "the member's own noun for what they wrote"],
  ["record", "the product's name for itself"],
  ["reason", "UI-27's member-facing noun for a leg"],
  ["reasons", "UI-27 renders the plural throughout the elicitation read-back"],
  ["set", "UI-27's member-facing noun for one of them ('reasons set N', 'sets of reasons')"],
  ["sets", "UI-27 renders sets of reasons in its own read-back"],
  ["walk", "the flat undetermined sentence has said 'the basis walk' since R3"],
  ["basis", "published field name, rendered"],
  ["depth", "the flat undetermined sentence names the depth bound"],
  ["bound", "the flat undetermined sentence renders depth bound of N verbatim"],
  ["established", "DEC-18's own word for the boundary case, rendered"],
  ["computed", "the flat undetermined sentence"],
  ["rests", "the flat sentence"],
  ["carries", "UI-27's 'Carries it on its own'"],
  ["carry", "UI-27 Carries it on its own, the same verb one inflection over"],
  ["needed", "plain English in the flat sentence"],
  ["present", "the inert tail: 'Present and not yet load-bearing'"],
  ["further", "the open-set tail"],
  ["score", "'not a low score' — the surface's own"],
  ["low", "app.html renders not a low score on the UNRATED panel itself"],
  ["inquiry", "published type name, rendered"],
  ["document", "published type name, rendered"],
  ["member", "the product's word for the person"],
  ["target", "published field name"],
  ["through", "the flat sentence's own '(through X)'"],
]);

let MACHINE = new Set(), MEMBER = { set: new Set(), elicBytes: 0, vrevBytes: 0 };
section("§2 LEXICONS", () => {
  MACHINE = machineLexicon();
  MEMBER = memberLexicon();
  ok(`§2 FLOOR: the MACHINE-side lexicon derived ${MACHINE.size} words from the derivation's own comments and identifiers (floor 150) — a derived family that derives nothing bans nothing`,
     MACHINE.size >= 150);
  ok(`§2 FLOOR: the MEMBER-side lexicon derived ${MEMBER.set.size} words from app.html's sanctioned blocks (floor 120; elicitation ${MEMBER.elicBytes} bytes, version review ${MEMBER.vrevBytes} bytes)`,
     MEMBER.set.size >= 120 && MEMBER.elicBytes > 2000 && MEMBER.vrevBytes > 2000);
  ok("§2: the derived family really does contain the word D-269 is about — if `ground` is not machine-side, the derivation is not the subject",
     MACHINE.has("ground") || MACHINE.has("grounds"));
  ok("§2: and `ground` is NOT member-side, so the classifier will fire on it",
     !MEMBER.set.has("ground") && !MEMBER.set.has("grounds"));
  console.log(`  ADJUDICATED (${ADJUDICATED.size}), printed because an inverted matcher's cost is its false positives:`);
  for (const [w, why] of ADJUDICATED) console.log(`    ${w} — ${why}`);
});

/* THE CLASSIFIER. ONE function. Every arm and every control goes through it,
   so a control cannot pass by validating a path the product does not use. */
function analystHits(text) {
  const t = String(text || "");
  const hits = [];
  for (const [re, why] of SEEDS) { const m = re.exec(t); if (m) hits.push({ token: m[0].trim(), why: `SEED · ${why}` }); }
  for (const w of words(t)) {
    if (MEMBER.set.has(w)) continue;
    if (ADJUDICATED.has(w)) continue;
    if (!MACHINE.has(w)) continue;
    if (hits.some((h) => h.token.toLowerCase().includes(w))) continue;
    hits.push({ token: w, why: "DERIVED · machine-side and not member-side" });
  }
  return hits;
}

/* ==================================================================== *
 * §3 · THE CORPUS — every branch of `#axisResult`, DRIVEN.
 * ==================================================================== */

/* Record values are OPAQUE: every interpolated id and label is a neutral
   placeholder, so a hit can only ever come from the COMPOSER'S OWN WORDS and
   never from something a member typed. */
const P = (n) => `PLACEHOLDER-${n}`;
const leg = (o) => ({ bundle_id: P("B"), ord: 1, target_id: P("T"), role: "supports",
                      grade: null, grade_source: null, via: "leg", ...o });

/* The matrix is enumerated so COVERAGE can be asserted rather than hoped: each
   row names the branch of `#axisResult` it exists to reach. */
const MATRIX = [
  ["flat/graded", () => [[leg({ grade: "B" }), leg({ grade: "C", ord: 2 })], []]],
  ["flat/graded+inert", () => [[leg({ grade: "B" }), leg({ ord: 2, why: "the leg carries no grade" })], []]],
  ["flat/unrated", () => [[leg({}), leg({ ord: 2 })], []]],
  ["flat/unrated/empty", () => [[], []]],
  ["flat/undetermined", () => [[leg({ grade: "B" })], [leg({ ord: 9, why: "the walk reached its depth bound" })]]],
  ["structured/graded/orSets", () => [[leg({ grade: "B", ground: P("G1") }), leg({ grade: "C", ord: 2, ground: P("G2") })], []]],
  ["structured/graded/implicit-sets", () => [[leg({ grade: "D", ord: 3 }), leg({ grade: "B", ground: P("G1") })], []]],
  ["structured/graded/open-set-beside", () => [[leg({ grade: "B", ground: P("G1") })], [leg({ ord: 9, ground: P("G2") })]]],
  ["structured/graded/orSets+inert", () => [[leg({ grade: "B", ground: P("G1") }), leg({ ord: 2, ground: P("G1") })], []]],
  ["structured/unrated", () => [[leg({ ground: P("G1") }), leg({ ord: 2, ground: P("G2") })], []]],
  ["structured/undetermined/every-set", () => [[], [leg({ ord: 9, ground: P("G1") }), leg({ ord: 8, ground: P("G2") })]]],
  ["structured/undetermined/implicit-leg", () => [[leg({ grade: "B", ground: P("G1") })], [leg({ ord: 9 })]]],
];

const CORPUS = [];      /* [where, sentence] */
const SEEN_STATES = new Set();
section("§3 CORPUS", () => {
  if (typeof axisResult !== "function") throw new Error("no lifted derivation to drive");
  for (const [name, mk] of MATRIX) {
    for (const axis of ["capture", "connection"]) {
      const [members, exhausted] = mk();
      const r = axisResult(axis, members, exhausted);
      SEEN_STATES.add(r.state);
      CORPUS.push([`${name} · ${axis}`, r.detail]);
      /* §4b — THE FIFTH CHANNEL. `#strengthWalk` embeds a sub-inquiry's whole
         `detail` into a LEG'S `why`, and app.html renders that `why` at a
         fifth site. The embedding is the product's own shape, driven here over
         the product's own sentence. */
      if (r.state === "undetermined")
        CORPUS.push([`${name} · ${axis} · embedded in a leg's why`,
                     `${P("T")} is undetermined on ${axis}: ${r.detail}`]);
    }
  }
  ok(`§3 REACH: the corpus is ${CORPUS.length} composed sentences over ${MATRIX.length} fixtures and 2 axes (floor 24) — a sweep over nothing reports clean, and three headline totality assertions in this project have passed over an empty corpus`,
     CORPUS.length >= 24);
  ok("§3 REACH: every sentence is non-empty", CORPUS.every(([, s]) => typeof s === "string" && s.length > 20));
  ok(`§3 TOTALITY: all three of \`#axisResult\`'s states were reached — [${[...SEEN_STATES].sort().join(", ")}]`,
     SEEN_STATES.has("graded") && SEEN_STATES.has("unrated") && SEEN_STATES.has("undetermined"));
  ok("§3 TOTALITY: the structured branch of EACH state was reached, which is where D-269 lived — the flat sentences carried nothing",
     CORPUS.some(([w]) => w.startsWith("structured/graded/orSets"))
     && CORPUS.some(([w]) => w.startsWith("structured/unrated"))
     && CORPUS.some(([w]) => w.startsWith("structured/undetermined/every-set")));
  console.log(`  CORPUS (${CORPUS.length}), printed in full:`);
  for (const [where, s] of CORPUS) console.log(`    [${where}] ${s}`);
});

/* §3b · THE SANCTIONED BASELINE. The FLAT sentences the product itself just
   composed are the words a member already saw before DEC-32 and before REC-42's
   structured extension, pinned verbatim by three UI suites and required by
   DEC-32's anti-gaming keystone to stay unchanged. They join the member side,
   so §4 asserts exactly the thing D-269 is about: the STRUCTURED sentences add
   no vocabulary the flat baseline did not already ship. The SEEDS are not
   eligible for this skip, so the baseline cannot erode the floor. */
let BASELINE_WORDS = 0;
section("§3b BASELINE", () => {
  const flat = CORPUS.filter(([w]) => w.startsWith("flat/"));
  ok(`§3b: the flat baseline is ${flat.length} sentences (floor 10) — an empty baseline would sanction nothing and quietly make §4 stricter than its rule`,
     flat.length >= 10);
  let added = 0;
  for (const [, s] of flat) for (const w of words(s)) if (!MEMBER.set.has(w)) { MEMBER.set.add(w); added++; }
  BASELINE_WORDS = added;
  ok(`§3b: it contributed ${added} words the app.html blocks did not already carry (floor 5), and NONE of them trips a seed — if the flat sentence ever grew one, this is where it would be caught`,
     added >= 5 && flat.every(([, s]) => !SEEDS.some(([re]) => re.test(s))));
});

/* ARM A · THE ADJUDICATION LIST IS ITSELF CHECKED, because an allowlist nobody
   audits is how an inverted matcher decays into the hand list it replaced.
   Every entry must carry a substantive reason, and the run PRINTS how many are
   STEM-BACKED — the word shares a stem with something the member side already
   renders — versus how many rest on a named site alone. The second kind is the
   kind to be suspicious of, so it is counted out loud. */
section("ARM A", () => {
  const stemOf = (w) => w.slice(0, 5);
  const memberStems = new Set([...MEMBER.set].map(stemOf));
  let backed = 0;
  const unbacked = [];
  for (const [w, why] of ADJUDICATED) {
    ok(`ARM A: adjudicated \`${w}\` carries a substantive reason`, typeof why === "string" && why.length >= 12);
    if (memberStems.has(stemOf(w))) backed++; else unbacked.push(w);
  }
  console.log(`  ARM A: ${backed} of ${ADJUDICATED.size} adjudicated words are STEM-BACKED by the member side; `
            + `${unbacked.length} rest on a named site alone: [${unbacked.join(", ")}]`);
  ok(`ARM A CEILING: the adjudication list is ${ADJUDICATED.size} words (ceiling 60) — a list that grows without bound has become the thing it replaced`,
     ADJUDICATED.size <= 60);
});


/* ==================================================================== *
 * §4 · THE VERDICT
 * ==================================================================== */
section("§4 VERDICT", () => {
  const hits = [];
  for (const [where, s] of CORPUS)
    for (const h of analystHits(s)) hits.push(`${where}: ${h.token} (${h.why})`);
  ok(`§4 NOT ONE ANALYST WORD REACHES A MEMBER through any sentence \`#axisResult\` composes, across all ${CORPUS.length} — found [${hits.join(" | ")}]`,
     hits.length === 0);
  /* The instrument must fire on a subject that carries the vocabulary, or a
     clean verdict means nothing. This is the landed sentence D-269 removed. */
  const LANDED = "capture B — the STRONGEST of the 2 independently sufficient grounds this "
               + "conclusion rests on, which is \"G1\", and no stronger than the weakest capture "
               + "WITHIN that ground, which is T.";
  ok("§4 INSTRUMENT: the classifier DOES fire on D-269's landed sentence, so the clean verdict above is not free",
     analystHits(LANDED).length > 0);
  ok("§4 INSTRUMENT: and it fires on the SPLIT form too — the exact shape that made UI-43's first matcher read 2 of 3",
     analystHits("… independently " + "sufficient grounds this conclusion rests on …").length > 0);
});

/* §4a — `#strengthWalk`'s OWN `why` sentences, read from FLATTENED SOURCE.
   Stated as such: this can see the words but cannot prove which branch renders
   each. The one that carries `detail` is driven in §3 instead. */
section("§4a WHY SENTENCES", () => {
  const span = SPANS.strengthWalk || "";
  /* Flatten: strip interpolations, then join every template literal so no `+`
     boundary can hide a phrase. Over-joining is the SAFE direction here — it
     can only add a false positive, which gets printed and argued with. */
  const lits = (span.match(/`(?:[^`\\]|\\.)*`/g) || []).map((s) => s.slice(1, -1).replace(/\$\{[^}]*\}/g, " "));
  ok(`§4a REACH: ${lits.length} template literals lifted from \`#strengthWalk\` (floor 4)`, lits.length >= 4);
  const joined = lits.join("");
  const hits = analystHits(joined);
  ok(`§4a: the leg-level \`why\` prose carries no analyst word either — found [${hits.map((h) => h.token).join(", ")}]`,
     hits.length === 0);
  console.log(`  §4a WHY CORPUS (${lits.length}): ${lits.map((s) => JSON.stringify(s)).join(" ")}`);
});

/* ==================================================================== *
 * §5 · THE SURFACE — the verdict only reaches a member if the surface
 * renders the plane's sentence and adds nothing to it.
 * ==================================================================== */
section("§5 SURFACE", () => {
  /* The four sites UI-43 measured, plus the fifth channel. Asserted by the
     PROPERTY (the sentence is escaped and printed whole) rather than by line
     number, because line numbers in app.html move every wave. */
  const VERBATIM = [
    ["axisPanel · graded", /\$\{a\.detail\?`<div class="subj-how">\$\{esc\(a\.detail\)\}<\/div>`:""\}/],
    ["axisPanel · undetermined", /a\.detail \|\| `the walk over what this rests on did not finish/],
    ["legConsequence · the weakest leg", /esc\(axisRaw\.detail\|\|""\)/],
    ["legConsequence · an inert leg's why", /esc\(inert\.why \|\| ""\)/],
    ["legConsequence · an undetermined leg's why", /esc\(un\.why \|\| ""\)/],
  ];
  for (const [what, re] of VERBATIM)
    ok(`§5: \`${what}\` still renders the plane's own sentence VERBATIM — if this moves, the verdict above stops transferring to the member`,
       re.test(appSrc));
  const graded = (appSrc.match(/\$\{a\.detail\?`<div class="subj-how">\$\{esc\(a\.detail\)\}<\/div>`:""\}/g) || []).length;
  ok(`§5 REACH: the graded/unrated verbatim render appears ${graded} times (floor 2) — one panel serves BOTH the inquiry page and the PUBLISHED, SIGNED case, so a leak here would be frozen into published bytes`,
     graded >= 2);
  ok("§5: and `axisPanel` is reached from the published case's own pages, which is what makes that last sentence a measurement rather than a worry",
     /axisPanel\(ax, pair\[ax\]/.test(appSrc));
});

/* ==================================================================== *
 * §6 · THE HAND LISTS — the seeds really are the union already enforced.
 * ==================================================================== */
/* CORRECTED 2026-08-09 (UI-53), NEVER EXEMPTED, AND THE OLD ARM WAS RIGHT — IT
   CAUGHT ITS OWN SUPERSESSION. It read: *"all 3 hand-written BANNED lists are
   still where this suite says they are … if one moves, the seed floor's
   provenance is stale."* UI-53 moved all of them, so it went RED exactly as
   designed, and that is the pin working rather than failing.

   TWO THINGS IT SAID WERE ALREADY WRONG WHEN IT WAS WRITTEN, both measured at
   UI-53 and both recorded here rather than quietly fixed:
     (1) THERE WERE FOUR HAND LISTS, NOT THREE. `connections-sidebar.test.mjs`
         (UI-44) carried a fourth. D-269's census was keyed on the phrase its own
         delegation used, so it under-reported — *a grep over prose is a hint, not
         a consumer census*, which is the trap this item's brief named and which
         bit here inside the item written to fix it.
     (2) THE SEED FLOOR WAS NOT THE UNION IT CLAIMED TO BE. Three of the four
         lists carried a standalone `/\b(AND|OR)\b/` that no SEED carries, and no
         list carried `conjunct`. "The union of all three" was a description of
         intent, not of the array.

   WHAT IT ASSERTS NOW: the four sites are CONSUMERS of the one derived family in
   `civicos-ui/test/analyst-vocabulary.mjs`, they keep no private list beside it,
   and — the part that makes the two families allies rather than rivals — THE UI
   FAMILY CATCHES EVERY SEED THIS SUITE ENFORCES, driven by witnesses rather than
   by comparing regex source. The seeds stay: they are checked BEFORE the
   member-side skip and the UI family has no member-side skip at all, so the two
   guard different corpora and neither subsumes the other. */
section("ARM L", () => {
  const files = ["elicitation.test.mjs", "notifications.test.mjs",
                 "version-review.test.mjs", "connections-sidebar.test.mjs"];
  let consumes = 0, privateList = [];
  for (const f of files) {
    let t = "";
    try { t = readFileSync(UITEST + f, "utf8"); } catch (_) { }
    if (/from "\.\/analyst-vocabulary\.mjs"/.test(t)) consumes++;
    if (/const BANNED = \[/.test(t.replace(/\/\*[\s\S]*?\*\//g, " "))) privateList.push(f);
  }
  ok(`ARM L: all ${files.length} former hand-list sites are CONSUMERS of the one derived family (found ${consumes}) — including \`connections-sidebar.test.mjs\`, the FOURTH list this arm used to say did not exist`,
     consumes === files.length);
  ok(`ARM L: and none of them keeps a private BANNED list beside it — found [${privateList.join(", ")}]`,
     privateList.length === 0);
  /* THE ANTI-RIVALRY CHECK, DRIVEN. Comparing regex source would be a
     spelling-keyed check of a spelling-keyed problem and would agree for free. */
  const SEED_WITNESSES = [
    "the ground this rests on", "a disjunct basis", "the conjunctive reading",
    "a labelled partition of the legs", "the OR branch",
    "the 2 independently sufficient sets", "the AND/OR relationship",
    "these are and-related legs", "the OR-branch beside it",
  ];
  const missed = [];
  for (const w of SEED_WITNESSES) {
    const mineFires = SEEDS.some(([re]) => re.test(w));
    const uiFires = uiAnalystHits(w).length > 0;
    if (mineFires && !uiFires) missed.push(w);
  }
  ok(`ARM L: the UI family catches every SEED this suite enforces, over ${SEED_WITNESSES.length} driven witnesses — the two guards are allies, not rivals. MISSED [${missed.join(" | ")}]`,
     missed.length === 0);
  ok("ARM L: and the UI family catches D-269's phrase, which is what the seed floor was standing in for until UI-53 landed",
     uiAnalystHits("the 2 independently sufficient sets").length > 0);
});

/* ============================== FOOT ==============================
   THE REACH FIGURES ARE PRINTED ON A GREEN RUN TOO. An `ok()` only speaks when
   it fails, so a suite whose corpus quietly shrank would go on reading clean
   and loud — and a floor is only a ratchet if somebody can see the number it
   is holding. These are the figures the next session moves the floors from. */
console.log(`\nanalystvocab REACH: corpus ${CORPUS.length} composed sentences over ${MATRIX.length} fixtures x 2 axes`
          + ` · states reached [${[...SEEN_STATES].sort().join(", ")}]`
          + ` · machine lexicon ${MACHINE.size} · member lexicon ${MEMBER.set.size}`
          + ` (${BASELINE_WORDS} of them from the driven flat baseline)`
          + ` · adjudicated ${ADJUDICATED.size} · seeds ${SEEDS.length}`);
console.log(`analystvocab: ${pass} pass, ${fail} fail`);
if (fails.length) { for (const f of fails) console.log(`  - ${f}`); }
process.exit(fail ? 1 : 0);
