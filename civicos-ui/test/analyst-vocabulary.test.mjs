/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/analyst-vocabulary.control.mjs` —
   deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and
   `run.mjs` discovers by filename. THE PEN LIVES INSIDE THIS WORKTREE
   (`.ui53-harness/`), never in the shared scratchpad, which is not isolated
   between sessions. EIGHT ARMS — four RED subjects, three GREEN over-strictness
   arms and a BASELINE — each armed ALONE with the others held open, each restored
   against a UNIQUELY-NAMED pristine copy verified by sha256 AND by `cmp`, with a
   byte count printed and floored. Figures live in the control file.
   RUN 2026-08-09 in worktree `agent-a5a6c1d8ff9f6c282`: 8 arms, 8 AS DECLARED, 0
   not; all five watched files restored byte-identical.
   (1) THE RULING — rewrite DEC-32 clause 1 so it enumerates nothing. MUST FAIL:
       a family derived from an authority it can no longer read must not quietly
       fall back to a short list, which is how a derivation rots into the thing it
       replaced.
   (2) THE CONSUMER — restore ONE suite's hand-written `BANNED` list. MUST FAIL on
       the census, because the whole item is that there is one definition; a
       fourth list must not be able to come back silently. This is the arm that
       proves the census is a CONSUMER CENSUS rather than a grep.
   (3) THE RESIDUE — unanchor one residue term (rename it to something DEC-32
       never says). MUST FAIL, because a residue that is not in the ruling is a
       maintainer's recollection wearing the ruling's authority.
   (4) THE SUBJECT — plant D-269's exact retired sentence into a rendered
       member-facing surface. MUST FAIL at the consuming sweep, which is what
       proves this family still defends the thing D-269 found.
   (5) OVER-STRICTNESS, and it MUST NOT FAIL — the banned words planted in a code
       COMMENT, in an internal IDENTIFIER, and in a FIXTURE ID. The ban is on what
       a member READS. A harness that goes red here is a fence tighter than its
       rule, and this project has measured that as the worse defect.
 */
/* UI-53 — THE ONE DERIVED BAN FAMILY, PROVEN RATHER THAN DESCRIBED.
 *
 * `analyst-vocabulary.mjs` carries the reasoning and the limits. This suite is
 * the part that can go RED, and it asserts four things a comment cannot:
 *   · the family really is read from DEC-32's own ruling (ARM D);
 *   · it really is a SUPERSET of every term the four hand lists enforced, DRIVEN
 *     by witnesses rather than by comparing regex source text (ARM U);
 *   · the four consumers really consume it and no fifth list has come back, by a
 *     census that is NOT keyed on the spelling `const BANNED` (ARM C);
 *   · it does NOT fire on correct member-facing prose (ARM O).
 */
import { readFileSync, readdirSync } from "node:fs";
/* THE CENSUS BELOW WALKS A DIRECTORY THIS SUITE DOES NOT CONTROL AND FLOORS THE
   FIGURE IT FINDS — exactly the shape `hygiene.test.mjs`'s class census requires
   to be GUARDED rather than merely named, and the shape that let M0-15's phantom
   (`machinefences-dec49.test.mjs`, 57 assertions, in no commit, gone by the next
   run) into a baseline. `refs/stash` is repository-wide across every worktree of
   this clone and `git stash push -u` carries UNTRACKED files, so another
   worker's suite CAN land in `civicos-ui/test/` and be counted here. Every file
   this census admits is therefore classified against `git ls-tree HEAD` and the
   reproducible total is printed beside the contaminated one. */
import { readGitProvenance, repoPath, reportProvenance } from "../../bio-plane/scripts/provenance.mjs";
import {
  ATOMS, NOUNS, CONNECTIVES, RESIDUE, BANNED, CLAUSE_1, DEC32_ENTRY,
  analystHits, reachLine, residueIsAnchored, machineSpellings, stemPrefix,
} from "./analyst-vocabulary.mjs";

const HERE = new URL("./", import.meta.url);
const UITEST = HERE.pathname;

let pass = 0, fail = 0;
const fails = [];
function ok(what, cond) {
  if (cond) { pass++; return true; }
  fail++; fails.push(what); console.log(`  FAIL  ${what}`);
  return false;
}
/* Firebreak: a TypeError inside an assertion goes through NO assertion at all and
   ends the module while the tally reads clean (D-93, six sightings in this
   project). Each section runs inside one of these so a throw is recorded as a
   failure NAMING ITS SECTION, and the FOOT below proves the module got there. */
function section(name, fn) {
  try { fn(); } catch (e) {
    fail++; fails.push(`${name} THREW`);
    console.log(`  FAIL  ${name} THREW: ${e && e.stack ? e.stack : e}`);
  }
}

console.log("--- analyst vocabulary (UI-53 / DEC-32 clause 1 / D-269's delegation) ---");
console.log("  " + reachLine());

/* ==================================================================== *
 * ARM D · THE DERIVATION — the family is read from the RULING.
 * ==================================================================== */
section("ARM D", () => {
  ok(`ARM D: DEC-32's entry was found in DECISIONS.md (${DEC32_ENTRY.length} bytes, floor 5000) — a family derived from an authority it cannot read is not derived`,
     DEC32_ENTRY.length >= 5000);
  ok(`ARM D: clause 1's own sentence was found — ${JSON.stringify(CLAUSE_1)}`,
     /NEVER show/.test(CLAUSE_1) && CLAUSE_1.length >= 40);
  ok(`ARM D: the ruling enumerated ${ATOMS.length} atoms [${ATOMS.join(", ")}] (floor 4) — this is the vocabulary the DECISION names, not a list somebody typed`,
     ATOMS.length >= 4);
  ok("ARM D: and the atoms are the ones DEC-32 actually names, so a parser that silently produced a plausible-but-wrong set is caught",
     ATOMS.includes("and") && ATOMS.includes("or") && ATOMS.includes("disjunction") && ATOMS.includes("grounds"));
  ok(`ARM D: the atoms split into ${NOUNS.length} noun(s) and ${CONNECTIVES.length} connective(s) — they are matched by DIFFERENT rules and conflating them is the measured defect this family inherits`,
     NOUNS.length >= 2 && CONNECTIVES.length >= 2);
  /* THE PARSER IS THE MOST LIKELY THING TO BE WRONG. Drive it over a subject
     that MUST trip it, the way ARM S does in `analystvocab.test.mjs`. */
  ok("ARM D: the stem of a noun is a genuine PREFIX of it, so the closure can only ever be wider than the atom, never narrower",
     NOUNS.every((n) => n.toLowerCase().startsWith(stemPrefix(n))));
  ok("ARM D: `grounds` stems to `ground` and `disjunction` to `disjun`, which is what makes every spelling reachable without listing one",
     stemPrefix("grounds") === "ground" && stemPrefix("disjunction") === "disjun");
});

/* ==================================================================== *
 * ARM S · THE SPELLINGS — the closure reaches real words, driven.
 * ==================================================================== */
section("ARM S", () => {
  const spellings = machineSpellings();
  ok(`ARM S REACH: the stem closure matches ${spellings.length} distinct spellings actually present in the derivation and the ruling (floor 6) — a closure that closes over nothing bans nothing`,
     spellings.length >= 6);
  console.log(`  ARM S SPELLINGS (${spellings.length}): ${spellings.join(" ")}`);
  /* The property that matters, stated as an assertion rather than a comment: a
     spelling NOBODY LISTED is caught, because the stem reached it. */
  for (const w of ["grounds", "grounding", "disjunctive", "disjunctively"])
    ok(`ARM S: \`${w}\` is caught although no hand list ever carried it — that is the tier that does not go stale`,
       analystHits(`the ${w} of this`).length > 0);
});

/* ==================================================================== *
 * ARM R · THE RESIDUE — anchored to the ruling, named, ceilinged.
 * ==================================================================== */
section("ARM R", () => {
  const anchored = residueIsAnchored();
  console.log(`  ARM R RESIDUE (${RESIDUE.length}), printed because a term no closure can reach must be NAMED and never silently scored zero:`);
  for (const [term, , why] of RESIDUE) console.log(`    ${term} — ${why}`);
  for (const [term, isIn] of anchored)
    ok(`ARM R: residue term \`${term}\` OCCURS IN DEC-32's OWN ENTRY — it is the decision's vocabulary, not a maintainer's recollection of it`, isIn);
  ok(`ARM R CEILING: the residue is ${RESIDUE.length} terms (ceiling 8) — a residue that grows without bound has become the hand list this file replaced`,
     RESIDUE.length <= 8);
  ok("ARM R: every residue term carries a substantive reason naming why no closure reaches it",
     RESIDUE.every(([, , why]) => typeof why === "string" && why.length >= 40));
});

/* ==================================================================== *
 * ARM U · THE UNION — THIS IS THE ITEM. The one family is a SUPERSET of
 * every term the four hand lists enforced, DRIVEN by witnesses.
 *
 * NOT by comparing regex source text: that is a spelling-keyed check of a
 * spelling-keyed problem, and it would agree for free. Each row below is a
 * STRING a hand list caught; the family must catch it too.
 * ==================================================================== */
const HAND_LIST_WITNESSES = [
  ["ground",                   "elicitation, version-review, connections-sidebar", "the ground this rests on"],
  ["disjunct",                 "elicitation, version-review, connections-sidebar", "a disjunct basis"],
  ["disjunction",              "notifications",                                    "the disjunction of these"],
  ["branch",                   "elicitation, version-review, connections-sidebar", "the OR branch"],
  ["OR-branch",                "notifications",                                    "the OR-branch beside it"],
  ["AND (as vocabulary)",      "elicitation, version-review, connections-sidebar", "these legs are AND-related"],
  ["OR (as vocabulary)",       "elicitation, version-review, connections-sidebar", "take the OR of them"],
  ["and-related",              "elicitation, version-review, connections-sidebar", "these are and-related legs"],
  ["or-related",               "elicitation, version-review, connections-sidebar", "the or-related branches"],
  ["partition",                "notifications, version-review, connections-sidebar", "a labelled partition of the legs"],
  ["ground partition",         "notifications",                                    "the ground partition of this set"],
  ["AND/OR",                   "notifications",                                    "the AND/OR relationship"],
  /* THE TWO NO HAND LIST CARRIED — the reason the family is derived at all. */
  ["independently sufficient", "NOT ONE of the four",                              "the 2 independently sufficient sets"],
  ["conjunct",                 "NOT ONE of the four",                              "the conjunctive reading"],
];
section("ARM U", () => {
  const missed = [];
  for (const [term, who, witness] of HAND_LIST_WITNESSES) {
    const h = analystHits(witness);
    if (!h.length) missed.push(`${term} (was enforced by: ${who})`);
  }
  ok(`ARM U: the ONE derived family catches every term the four hand lists enforced, over ${HAND_LIST_WITNESSES.length} driven witnesses — MISSED [${missed.join(" | ")}]`,
     missed.length === 0);
  /* AND THE HEADLINE, WHICH IS THE DEFECT D-269 REPORTED. */
  ok("ARM U: `independently sufficient` is caught — NOT ONE of the four hand lists carried it, and it is the phrase that was rendered to members and frozen into signed `bundle.md` frontmatter",
     analystHits("the 2 independently sufficient sets").length > 0);
  ok("ARM U: and it is caught in the SPLIT form too, the exact shape that made UI-43's first matcher read 2 of 3 — this family classifies a string that has already been built, so concatenation hides nothing",
     analystHits("… independently " + "sufficient grounds this rests on …").length > 0);
  ok("ARM U: D-269's landed sentence is caught in full, so a clean verdict at any consumer is not free",
     analystHits('capture B — the STRONGEST of the 2 independently sufficient grounds this conclusion rests on, which is "G1".').length > 0);
});

/* ==================================================================== *
 * ARM C · THE CONSUMER CENSUS — and it is NOT keyed on `const BANNED`.
 *
 * D-269's delegation said THREE hand lists. THERE WERE FOUR. The fourth
 * (`connections-sidebar.test.mjs`) was missed because the census was keyed on the
 * phrase the delegation used, and a grep over prose is a hint rather than a
 * census. So this arm finds candidates by TWO INDEPENDENT DETECTORS and requires
 * every candidate to either CONSUME the family or be NAMED with a reason.
 * ==================================================================== */

/* NAMED, and each carries why it is not a rival. A file here is a FINDING that
   was kept deliberately, never an exemption — WORKER.md: *distinguish a defect
   from a deliberate closure*. THE LAST TWO WERE FOUND BY THIS ARM ITSELF, on its
   first run, and neither was in D-269's delegation or in this item's brief. */
const DIFFERENT_QUESTION = new Map([
  ["capture-honesty.test.mjs",
   "asks a DIFFERENT QUESTION and is deliberately NOT folded in: its `JARGON` list holds capture prose to Bob's plain-language ruling (`subrequest`, `runtime`, `manifest`, `sha256`, `Durable`, `op=`, `content_hash`). None of those is DEC-32 vocabulary and none of DEC-32's vocabulary is jargon in that sense — one instrument answering two questions would answer neither well"],
  ["publishedcase.test.mjs",
   "cites a DIFFERENT CLAUSE of the same ruling and holds no ban list at all: DEC-32's falsifier-count test (*one proposition, one falsifier, never merged*), which is about what a finding IS rather than about the words a surface may print. Detector 1 is keyed on the RULING, so a suite citing any clause of it surfaces here — that is the detector being honest, not a miss"],
  ["version-review.control.mjs",
   "is the NEGATIVE-CONTROL DRIVER for a consumer, not a rival to it: its arm `2-leak-a-banned-word` PLANTS the record's own set labels into the rendered surface and requires `version-review.test.mjs` to go RED, keyed on that suite's assertion text *\"not one analyst word\"*. It is the instrument that proves a consumer's sweep can fail, so it must keep naming the ban rather than importing it"],
]);
const SELF = new Set(["analyst-vocabulary.test.mjs", "analyst-vocabulary.mjs", "analyst-vocabulary.control.mjs"]);

section("ARM C", () => {
  const files = readdirSync(UITEST).filter((f) => f.endsWith(".mjs") && !SELF.has(f));
  /* DETECTOR 1 — the AUTHORITY. Any suite enforcing this ban cites the ruling. */
  /* DETECTOR 2 — the SHAPE. A hand-rolled ban pattern is a REGEX LITERAL over one
     of the construct's own terms, whatever the variable holding it is called.
     Two independent detectors, because one matcher is a hint. */
  /* D2's SHAPE WAS CORRECTED BEFORE IT SHIPPED, and the correction is the point.
     Written as `/\/\\b…/` it required the pattern to open on a word boundary —
     which is how THREE of the four hand lists were written, so it looked right —
     and it would have MISSED `notifications.test.mjs` entirely, whose patterns
     open `/(^|[^A-Za-z])AND\/OR…/`. A detector shaped like the examples in front
     of it is the same defect as a list of spellings. It now keys on a regex
     literal MENTIONING the construct, whatever it opens with. */
  const D2 = /\/[^/\n]{0,60}(ground|disjunc|partition|branch|AND\\?\/OR|\(AND\|OR\)|\(and\|or\))[^/\n]{0,60}\/[gimsuy]*\s*,/;
  const census = [];
  for (const f of files) {
    let t = "";
    try { t = readFileSync(UITEST + f, "utf8"); } catch (_) { continue; }
    const d1 = /DEC-32/.test(t);
    const d2 = D2.test(t);
    if (!d1 && !d2) continue;
    census.push({ f, d1, d2, consumes: /from "\.\/analyst-vocabulary\.mjs"/.test(t) });
  }
  console.log(`  ARM C CENSUS — ${files.length} file(s) walked in civicos-ui/test/, ${census.length} candidate ban site(s) found by TWO detectors:`);
  for (const c of census)
    console.log(`    ${c.consumes ? "CONSUMES" : (DIFFERENT_QUESTION.has(c.f) ? "NAMED   " : "RIVAL   ")}  ${c.f}  [cites DEC-32: ${c.d1 ? "y" : "n"} · carries a ban regex: ${c.d2 ? "y" : "n"}]`);

  ok(`ARM C REACH: the census walked ${files.length} files and found ${census.length} candidate site(s) (floor 4) — a census over nothing reports clean, and three headline totality assertions in this project have passed over an empty corpus`,
     files.length >= 20 && census.length >= 4);

  /* BOTH DETECTORS' POLARITY, DRIVEN — because on a clean tree D2 matches NOTHING
     (every hand list is gone), and a detector that has never fired is
     indistinguishable from a detector that cannot. The four samples below are the
     four hand lists' ACTUAL opening patterns as they stood on `main` at
     19745ad, so this pins the detector against the real thing rather than an
     idea of it. */
  const REAL_HAND_LIST_OPENERS = [
    ["elicitation / version-review / connections-sidebar", `    [/\\bground/i,          "the analyst's noun for a set of reasons"],`],
    ["version-review, connections-sidebar", `    [/\\bpartition/i,          "the analyst's noun for how they are divided"],`],
    ["notifications — the one a boundary-anchored detector would have missed", `    [/(^|[^A-Za-z])AND\\/OR([^A-Za-z]|$)/, "AND/OR"],`],
    ["notifications", `    [/\\bOR-branch\\b/, "OR-branch"],`],
  ];
  for (const [who, sample] of REAL_HAND_LIST_OPENERS)
    ok(`ARM C POLARITY: detector 2 FIRES on a real hand-list pattern (${who}) — otherwise its silence on this tree would prove nothing`,
       D2.test(sample));
  ok("ARM C POLARITY: detector 2 does NOT fire on ordinary code — a detector that matches everything names nothing",
     !D2.test(`const url = "https://example.org/a/b"; const re = /\\bfoo\\b/;`));
  ok("ARM C POLARITY: detector 1 fires on a suite citing the ruling, and not on one that does not",
     /DEC-32/.test("this sweep enforces DEC-32 clause 1") && !/DEC-32/.test("this sweep enforces DEC-49"));

  /* THE GUARD. This census floors a figure derived from an uncontrolled
     directory, so what it admitted is classified against the commit at HEAD and
     the reproducible total printed beside the contaminated one. A census a
     phantom can inflate is a census somebody will quote. */
  const REPO = new URL("../../", HERE).pathname;
  const prov = readGitProvenance(REPO);
  const items = files.map((f) => ({ path: repoPath(REPO, UITEST + f), what: f,
    counted: "walked by UI-53's ban-site census, and floored" }));
  const repro = prov.inHead === null ? files.length
    : items.filter((i) => prov.inHead.has(i.path)).length;
  reportProvenance({
    prov, items, instrument: "UI-53's ban-site census",
    corpus: `civicos-ui/test/: ${files.length} module(s) walked, ${census.length} candidate ban site(s)`,
    totals: prov.inHead === null ? []
      : [{ label: "modules walked", contaminated: files.length, reproducible: repro, source: "files" }],
  });
  ok(`ARM C PROVENANCE: the census says which of its ${files.length} walked module(s) another checkout at this HEAD reproduces (${prov.inHead === null ? "UNVERIFIED — git could not answer" : repro}) — a phantom suite deposited here would otherwise inflate a floored figure silently`,
     prov.inHead === null || repro > 0);

  const rivals = census.filter((c) => !c.consumes && !DIFFERENT_QUESTION.has(c.f));
  ok(`ARM C: EVERY ban site in this directory either CONSUMES the one derived family or is NAMED as asking a different question — rivals found [${rivals.map((c) => c.f).join(", ")}]`,
     rivals.length === 0);

  const consuming = census.filter((c) => c.consumes).map((c) => c.f).sort();
  ok(`ARM C: all four of D-269's hand-list sites are consumers — [${consuming.join(", ")}]`,
     ["connections-sidebar.test.mjs", "elicitation.test.mjs", "notifications.test.mjs", "version-review.test.mjs"]
       .every((f) => consuming.includes(f)));

  /* THE FOURTH LIST IS PINNED AS A FINDING, so the record cannot quietly go back
     to saying there were three. */
  ok("ARM C: `connections-sidebar.test.mjs` is one of them — D-269's delegation said THREE hand lists and there were FOUR, and it was missed because the census was keyed on the phrase the delegation used",
     consuming.includes("connections-sidebar.test.mjs"));

  /* AND NO CONSUMER MAY KEEP A PRIVATE LIST BESIDE THE SHARED ONE. Checked by
     SHAPE (a regex-literal ban pattern), not by the spelling `const BANNED`. */
  for (const c of census.filter((x) => x.consumes)) {
    const t = readFileSync(UITEST + c.f, "utf8");
    /* strip block comments: the corrections written at each site QUOTE the old
       patterns on purpose, and a check that caught its own correction is a
       failure this project has already measured. */
    const code = t.replace(/\/\*[\s\S]*?\*\//g, " ");
    ok(`ARM C: \`${c.f}\` keeps NO private ban pattern beside the shared family — a consumer that also hand-rolls one is a rival wearing a consumer's import`,
       !D2.test(code));
  }

  for (const [f, why] of DIFFERENT_QUESTION)
    ok(`ARM C: \`${f}\` is kept and NAMED rather than folded in — ${why.slice(0, 60)}…`,
       files.includes(f) && why.length >= 80);
  /* THE CONTROL DRIVER MUST STILL BE ABLE TO SEE ITS SUBJECT. UI-42's arm is
     keyed on the ASSERTION TEXT of the suite this item edited, so a rename there
     would silently disarm somebody else's negative control — the "arm that never
     armed" this project has sighted repeatedly. Pinned rather than trusted. */
  const vrevSays = readFileSync(UITEST + "version-review.control.mjs", "utf8")
    .match(/says:\s*"not one analyst word"/);
  ok("ARM C: UI-42's control driver keys on `not one analyst word`, and `version-review.test.mjs` STILL CARRIES that exact assertion text after this item's edit — an arm that cannot find its subject never arms",
     !!vrevSays && /not one analyst word reaches the member/.test(readFileSync(UITEST + "version-review.test.mjs", "utf8")));
});

/* ==================================================================== *
 * ARM O · OVER-STRICTNESS. Correct work in a spelling nobody anticipated
 * must PASS. This project treats an over-strict guard as the worse defect,
 * because a guard that refuses correct work gets switched off.
 * ==================================================================== */
const CORRECT_PROSE = [
  ["UI-27's member vocabulary, which DEC-32 clause 3 sanctions", "2 sets of reasons that each carry this conclusion on their own"],
  ["the flat baseline DEC-32's anti-gaming keystone freezes", "capture B — no stronger than the weakest capture it rests on, which is T."],
  ["the UNRATED sentence", "UNRATED on capture: no leg on this axis carries an established grade."],
  ["the UNDETERMINED sentence", "this capture axis has NO computed strength: the basis walk reached its depth bound of 6."],
  ["the load-bearing count the surface prints", "3 of 5 legs on this axis are load-bearing"],
  ["ordinary lower-case English", "a member said so, and the record holds their name"],
  ["an inquiry or a document", "search an inquiry or a document"],
  ["what the surfaces render INSTEAD of the connective", "ALL of these must hold / ANY one of these is enough"],
  /* UI-53'S OWN FINDING, kept as a standing arm because it is the one that
     nearly shipped an over-strict fence. */
  ["CAPITALISED ORDINARY ENGLISH — UI-53's own finding, and the reason the bare connective token is not banned",
   "LOOKED FOR AND NOT THERE, which is the point of this item rather than an omission"],
  ["the same, with OR", "DISPOSED OR RESOLVED, either way it leaves the queue"],
];
section("ARM O", () => {
  for (const [what, s] of CORRECT_PROSE) {
    const h = analystHits(s);
    ok(`ARM O: ${what} — stays CLEAN; found [${h.map((x) => x.token).join(", ")}]`, h.length === 0);
  }
  ok(`ARM O REACH: ${CORRECT_PROSE.length} correct sentences were swept (floor 8) — an over-strictness arm over nothing proves nothing`,
     CORRECT_PROSE.length >= 8);
});

/* ==================================================================== *
 * ARM P · POLARITY. The family must FIRE, or every clean verdict above
 * and at all four consumers is free.
 * ==================================================================== */
section("ARM P", () => {
  ok(`ARM P: the family has ${BANNED.length} patterns (floor 8) — a family that derives nothing bans nothing`,
     BANNED.length >= 8);
  ok("ARM P: every pattern is a RegExp with a substantive reason attached, so a hit tells the next reader WHY rather than only THAT",
     BANNED.every(([re, why]) => re instanceof RegExp && typeof why === "string" && why.length >= 20));
  ok("ARM P: the classifier fires on a sentence carrying the whole construct",
     analystHits("the ground partition of this OR-related set is independently sufficient").length >= 3);
  ok("ARM P: and returns [] rather than throwing on empty, null and non-string input",
     analystHits("").length === 0 && analystHits(null).length === 0 && analystHits(undefined).length === 0);
});

/* ============================== FOOT ==============================
   THE REACH FIGURES PRINT ON A GREEN RUN TOO. An `ok()` only speaks when it
   fails, so a suite whose corpus quietly shrank would go on reading clean and
   loud — and a floor is only a ratchet if somebody can see the number it holds.
   REACHING THIS LINE IS ITSELF THE EVIDENCE the module did not die mid-way: a
   TypeError inside an assertion ends the module while the tally reads clean. */
console.log(`\nanalyst-vocabulary REACH: ${BANNED.length} patterns · ${ATOMS.length} atoms read from DEC-32 clause 1`
          + ` · ${machineSpellings().length} spellings reached by stem closure · residue ${RESIDUE.length}`
          + ` · ${HAND_LIST_WITNESSES.length} hand-list witnesses driven · ${CORRECT_PROSE.length} over-strictness sentences`);
console.log(`analyst-vocabulary: ${pass} pass, ${fail} fail`);
if (fails.length) { for (const f of fails) console.log(`  - ${f}`); }
process.exit(fail ? 1 : 0);
