/* NEGATIVE CONTROL: `node test/multicase.control.mjs` runs three arms plus a
   baseline, each ARMED ALONE over a per-arm uniquely-named pristine copy taken
   inside this worktree, each restore verified by CONTENT (`cmp`) and by sha256;
   `node test/multicase.control.mjs a` runs one.
   (a) RE-SCALAR ONE FORMER SITE — `#casesOfSha`'s pinned read goes back to a
   LIMIT 1 over the set; this census must FAIL naming the site. MEASURED: census
   18/2, and caseflip 58/0 — the behaviour suite CANNOT see it, which is the
   argument for this census existing.
   (b) THE AMBIGUOUS DERIVATION DEFAULTS INTO CASE A — the refusal is neutered
   and the publish must SUCCEED into a case nobody named. MEASURED: caseflip
   56/2, `got [true, null]`.
   (c) OVER-STRICTNESS — the rejected reading armed (refuse on ANY membership);
   correct second-edition publishes must break. MEASURED: caselifecycle 58/9,
   casepin and publish both killed at their fixtures.
   The full declarations and every measured figure, including the one that came
   back not as declared, are in that file's header. */

/* =============================================================================
 * D-309 — DEC-72 CLAUSE 6 IN THE PLANE: A FINDING MAY SERVE MANY CASES.
 * THIS SUITE IS THE **CENSUS**, AND IT IS DELIBERATELY NOT THE BEHAVIOUR SUITE.
 *
 * WHERE THE BEHAVIOUR IS DRIVEN, said first so nobody looks for it here and
 * concludes it is missing: `caseflip.test.mjs`. That suite already owned the pin
 * recording what the plane does about multi-case membership — it asserted STILL
 * REFUSED, on CASE-6's deliberate KEEP — and D-309 CORRECTED that pin rather than
 * adding a second one beside it. It now drives, end to end through the ops: a
 * finding published into a second case; both memberships read back; a stranger
 * holding only the finding id refused `FINDING_IN_SEVERAL_CASES` naming both; the
 * same stranger served when they name one; and `CASE_IDENTITY_AMBIGUOUS` driven
 * ALONE and named EXACTLY. **Five copies of a question is five chances to answer
 * it differently**, which is this plane's own sentence, so the behaviour lives in
 * one place and this suite does the thing that place cannot.
 *
 * WHAT THIS SUITE IS FOR. D-309's acceptance is not only "it works" — it is that
 * **the nine scalar readers CASE-6 counted are all corrected, named one by one
 * against that count**. That is a claim about the SOURCE, not about a response,
 * and no amount of driving can establish it: a tenth reader nobody thought of
 * would go on silently guessing while every behavioural arm stayed green. So this
 * suite re-runs CASE-6's census against today's source and asserts the class has
 * **ZERO scalar members left**.
 *
 * THE CLASS, IN CASE-6'S OWN WORDS, so the two counts are of the same thing:
 * *"a SELECT over `published_case_members` whose WHERE keys on `bundle_id` — that
 * is, a query asking which case a FINDING is in."* Counted 2026-09-10 by CASE-6:
 * **11 sites · 9 SCALAR (`#one`) · 2 PLURAL (`#rows`) · 0 unclassified.**
 *
 * WHAT THIS MATCHER CAN AND CANNOT SEE — load-bearing, and it is CASE-6's own
 * limitation restated rather than a new one, because the two counts must be
 * comparable or the comparison is theatre:
 *   - IT SEES: SQL string literals in `src/store.mjs`, inside a backtick template,
 *     reached through `this.#one(` or `this.#rows(`.
 *   - IT CANNOT SEE: a query assembled by concatenation; a reader that pulls the
 *     whole roster and filters it in JS; any consumer outside this repository;
 *     and any site in another file. (`index.mjs` names the table once, in prose,
 *     and builds no such query; no other `src/` file mentions it. Asserted below
 *     rather than claimed, so the day that changes this suite says so.)
 * **So ZERO SCALAR is a floor on the correction, not a proof of totality**, in
 * exactly the way CASE-6's NINE was a floor on the scalar readers. Stated plainly
 * because that sentence is what lets the next reader tell a clean result from a
 * walk looking in the wrong place.
 * ========================================================================== */

import "./stdio.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CASE_DERIVATION_CHECKS } from "../checks/bio-checks.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const store = readFileSync(SRC, "utf8");

/* ===================================================================== 1
 * THE CENSUS — THE CLASS, CLASSIFIED, AND ITS CORPUS PRINTED.
 * =================================================================== */
console.log("\n--- 1. the class CASE-6 counted, recounted: 'a SELECT over published_case_members keyed on bundle_id' ---");

/* THE WALK. Every backtick template literal in the file is taken, then the ones
   mentioning the table are kept, then the ones whose WHERE keys on `bundle_id`.
   Each survivor is classified by the CALL that receives it, found by looking
   backwards from the literal's opening backtick.

   IT IS A TEMPLATE WALK RATHER THAN A LINE GREP ON PURPOSE. These queries are
   multi-line, so a line-oriented matcher sees `WHERE bundle_id=?` and the table
   name on different lines and cannot tell which query either belongs to — which
   is how a census silently drops the multi-line members of its own class. */
const literals = [];
for (let i = 0; i < store.length; i++) {
  if (store[i] !== "`") continue;
  if (i > 0 && store[i - 1] === "\\") continue;
  let j = i + 1;
  while (j < store.length && !(store[j] === "`" && store[j - 1] !== "\\")) j++;
  literals.push({ start: i, end: j, text: store.slice(i + 1, j) });
  i = j;
}

const TABLE = "published_case_members";
/* `bundle_id=?` with any whitespace, and `m.bundle_id=?` for the aliased join —
   the class is about what the WHERE keys on, not about how the query spells its
   table alias. A site keyed only on `case_id` is a DIFFERENT question ("who is in
   this case") and is correctly outside the class. */
const KEYED = /\bWHERE\b[\s\S]*?(?:\w+\.)?bundle_id\s*=\s*\?/i;

const sites = [];
for (const lit of literals) {
  if (!lit.text.includes(TABLE)) continue;
  if (!KEYED.test(lit.text)) continue;
  /* THE RECEIVING CALL. A 220-character window back from the opening backtick,
     which comfortably covers `const x = this.#rows(\n` and the ternary spellings
     in this file, and is short enough that it cannot reach the previous
     statement's call. Anything not matched is UNCLASSIFIED and is NAMED — never
     scored zero, because a thing the matcher does not understand is the one thing
     a census must not swallow. */
  const back = store.slice(Math.max(0, lit.start - 220), lit.start);
  const one = /this\.#one\(\s*$/.test(back), rows = /this\.#rows\(\s*$/.test(back);
  const line = store.slice(0, lit.start).split("\n").length;
  sites.push({ line, kind: one ? "SCALAR" : rows ? "PLURAL" : "UNCLASSIFIED",
               sql: lit.text.replace(/\s+/g, " ").trim().slice(0, 70) });
}

const scalar = sites.filter((s) => s.kind === "SCALAR");
const plural = sites.filter((s) => s.kind === "PLURAL");
const unclassified = sites.filter((s) => s.kind === "UNCLASSIFIED");

console.log(`  CORPUS: ${literals.length} template literals in src/store.mjs (${store.length} bytes), `
  + `${sites.length} in the class`);
for (const s of sites) console.log(`    ${String(s.line).padStart(6)}  ${s.kind.padEnd(12)} ${s.sql}`);
console.log(`  CENSUS: ${sites.length} sites · ${scalar.length} SCALAR · ${plural.length} PLURAL · `
  + `${unclassified.length} unclassified   (CASE-6, 2026-09-10: 11 · 9 · 2 · 0)`);

/* THE CORPUS IS FLOORED BEFORE ANYTHING IS CONCLUDED FROM IT. A headline totality
   assertion that passed over an EMPTY corpus has been measured in this repository
   THREE times, and "zero scalar readers" is exactly the shape that passes for
   free when the walk found nothing at all. */
t("the walk REACHED the class — a non-empty corpus, floored, so 'zero scalar' cannot pass by the "
  + "matcher having found nothing (three headline assertions in this repository have passed over an "
  + "empty corpus)",
  [literals.length > 200, sites.length >= 11], [true, true]);

t("NOTHING IN THE CLASS IS UNCLASSIFIED — a site this matcher does not understand is NAMED rather "
  + "than silently scored zero, which is the difference between a census and a guess",
  [unclassified.length, unclassified.map((s) => s.line)], [0, []]);

/* THE HEADLINE. */
t("**ZERO SCALAR READERS REMAIN.** CASE-6 counted 9 and kept the fence because every one of them was "
  + "correct only while it held; D-309 corrected all nine, so the class that used to be 9 scalar and "
  + "2 plural is now entirely set-valued and the fence's reason is DISCHARGED rather than overruled",
  [scalar.length, scalar.map((s) => `${s.line}: ${s.sql}`)], [0, []]);

t("and the class did not SHRINK to reach zero — the plural count grew by at least the nine that "
  + "moved, so 'no scalar readers' is nine corrections and not nine deletions (a revert that is "
  + "behaviourally invisible is a defect this repository has already paid for)",
  [plural.length >= 11, sites.length >= 11], [true, true]);

/* ===================================================================== 2
 * THE NINE, NAMED ONE BY ONE.
 * =================================================================== */
console.log("\n--- 2. CASE-6's nine named one by one, each against the decision recorded at its site ---");

/* CASE-6 named the nine by their SIX CALLERS. Each is checked by the presence of
   the corrected reader and the ABSENCE of the scalar one it replaced. The absent
   half is what makes this an assertion rather than a description: a helper that
   was copied instead of corrected would leave both. */
const NINE = [
  { n: 1, site: "publishCase()'s `belongs` derivation", decision: "ALL cases per member",
    present: /SELECT DISTINCT case_id FROM published_case_members WHERE bundle_id=\? ORDER BY case_id/,
    absent: /const row = this\.#one\(\s*`SELECT case_id FROM published_case_members WHERE bundle_id=\? ORDER BY edition DESC LIMIT 1`/ },
  { n: 2, site: "the container's `rel` lookup in the ratify path", decision: "ALL, and it is a LOOP",
    present: /const rels = this\.#rows\(/, absent: /const rel = this\.#one\(\s*`SELECT m\.case_id/ },
  { n: 3, site: "publishedCase() by finding id AT AN EDITION", decision: "REFUSES, naming them",
    present: /#resolveOneCase\(id, ms, caseId\)/,
    absent: /this\.#one\(`SELECT case_id FROM published_case_members WHERE bundle_id=\? AND edition=\?`, id, want\)/ },
  { n: 4, site: "publishedCase() by finding id, LATEST", decision: "REFUSES, naming them",
    present: /WHERE bundle_id=\? ORDER BY case_id, edition`, id\)/,
    absent: /this\.#one\(`SELECT case_id FROM published_case_members WHERE bundle_id=\? ORDER BY edition DESC LIMIT 1`, id\)/ },
  { n: 5, site: "#caseClaimsOf (was #caseClaimOf)", decision: "ALL; the caller already wanted an array",
    present: /#caseClaimsOf\(bundleId\) \{/, absent: /#caseClaimOf\(bundleId\) \{/ },
  { n: 6, site: "#casesOf AT AN EDITION", decision: "ALL, DISTINCT by case",
    present: /SELECT DISTINCT case_id FROM published_case_members WHERE bundle_id=\? AND edition=\?/,
    absent: /#caseOf\(bundleId, edition = null\) \{/ },
  { n: 7, site: "#casesOf LATEST", decision: "ALL, DISTINCT by case",
    present: /#casesOf\(bundleId, edition = null\) \{/, absent: /const r = edition != null\s*\n\s*\? this\.#one\(`SELECT case_id FROM published_case_members/ },
  { n: 8, site: "#casesOfSha PINNED", decision: "ALL; three callers, three questions",
    present: /#casesOfSha\(bundleId, bundleSha, fallbackEdition = null\) \{/, absent: /#caseOfSha\(bundleId, bundleSha/ },
  { n: 9, site: "#casesOfSha LEGACY FALLBACK", decision: "ALL, the same",
    present: /WHERE bundle_id=\? AND edition=\? AND version_sha IS NULL ORDER BY case_id/,
    absent: /WHERE bundle_id=\? AND edition=\? AND version_sha IS NULL`\s*,\s*\n?\s*bundleId, fallbackEdition\)\s*:\s*null;/ },
];
for (const s of NINE)
  t(`site ${s.n} of 9 — ${s.site}: ${s.decision}; the corrected reader is present AND the scalar one `
    + `it replaced is GONE (a helper copied rather than corrected would leave both)`,
    [s.present.test(store), s.absent.test(store)], [true, false]);

/* THE TWO PLURAL SITES CASE-6 MEASURED AS ALREADY CORRECT — asserted STILL
   untouched, because "we did not need to change it" is a claim that goes stale
   silently, and a sweep earns its trust by naming what it deliberately left. */
t("and the TWO PLURAL sites CASE-6 measured as already correct for any n are STILL plural and were "
  + "not touched — #caseRelationOf and #flagCasesOnRevision, a deliberate closure named rather than "
  + "an omission",
  [/#caseRelationOf\(bundleId\) \{[\s\S]{0,400}?this\.#rows\(/.test(store),
   /#flagCasesOnRevision\(bundleId, replacedSha, when\) \{[\s\S]{0,400}?this\.#rows\(/.test(store)],
  [true, true]);

/* ===================================================================== 3
 * THE DELETED FENCE, AND THE REFUSAL THAT REPLACED THE REAL PART OF ITS JOB.
 * =================================================================== */
console.log("\n--- 3. the fence is gone, the new refusal is a DEC-49 row, and the region resolves ---");

/* A `reason:` or `code:` LITERAL is what a caller can actually receive. The names
   survive in PROSE at the removal site on purpose — the next reader of that line
   needs to know what stood there — so the assertion is about the code path and
   says so, rather than about the string appearing in the file. */
const emitted = (name) =>
  new RegExp(`(?:reason|code)\\s*:\\s*["']${name}["']`).test(store);
t("neither deleted refusal can be EMITTED any more — `FINDING_IN_ANOTHER_CASE` and "
  + "`FINDINGS_IN_DIFFERENT_CASES` appear only in the prose that records their removal, never as a "
  + "`reason:` or `code:` a caller could receive",
  [emitted("FINDING_IN_ANOTHER_CASE"), emitted("FINDINGS_IN_DIFFERENT_CASES"),
   store.includes("FINDING_IN_ANOTHER_CASE")],
  [false, false, true]);

const row = CASE_DERIVATION_CHECKS.CASE_IDENTITY_AMBIGUOUS;
t("the new refusal is a DEC-49 ROW carrying its C-number and a canned translation, in ONE place — "
  + "the catalogue holds the member-facing words and store.mjs holds no second copy, because a hand "
  + "copy agrees at zero cost and that has been measured five times",
  [row.check, typeof row.translation === "string" && row.translation.length > 120,
   row.where, store.includes(row.translation)],
  ["C-44.1", true, "src/store.mjs publishCase > case-identity-derivation", false]);

/* THE REGION MARKERS. The guard FAILS if a `where`'s markers are missing,
   unclosed, duplicated, outside the named function or trivially short — a `where`
   that quietly stops resolving is an arm that stopped running while still
   reporting green. Asserted here too so this suite fails at the site rather than
   only in the UI harness, which is a different repository's gate. */
/* THE GUARD'S OWN MATCHERS, COPIED DELIBERATELY AND SAID SO. `civicos-ui/
   check-refusal-codes.mjs` uses `/\*[\s*]*(END )?DEC-49 REGION\s+<name>\b` —
   only whitespace or `*` may sit between the comment opener and the words. A
   LOOSER matcher here would be worse than no assertion: the first draft of this
   arm searched for the bare phrase, counted 2 opens and 1 close, PASSED, and the
   UI guard then failed with "found 0 opening marker(s)" because the marker was
   written as a decorated banner (`/* ===== DEC-49 REGION …`). An assertion that
   agrees with a guard only by being weaker than it is not a second check, it is
   a first check that lies. */
const opens = [...store.matchAll(/\/\*[\s*]*DEC-49 REGION\s+case-identity-derivation\b/g)];
const closes = [...store.matchAll(/\/\*[\s*]*END DEC-49 REGION\s+case-identity-derivation\b/g)];
t("and its `where` names a REGION rather than the FUNCTION, with exactly one opening marker and one "
  + "closing one, MATCHED THE WAY THE UI GUARD MATCHES THEM — naming `publishCase` would conscript "
  + "every unrelated refusal in it, which is how PL-1's two rows put 32 refusals in scope and turned "
  + "`main`'s UI harness red",
  [opens.length, closes.length, opens[0] ? closes[0].index > opens[0].index : false,
   row.where.includes(" > ")],
  [1, 1, true, true]);

/* THE CODE IS A STRING LITERAL AT ITS SITE, through the helper. A code in a
   variable is invisible to the guard and one shipped `translation: undefined` to
   a member that way. */
t("and the code reaches the wire as a STRING LITERAL through a helper named `refusal` — a code held "
  + "in a variable is invisible to the DEC-49 guard, and one shipped `translation: undefined` to a "
  + "member exactly that way",
  [/refusal\("CASE_IDENTITY_AMBIGUOUS"/.test(store), /function refusal\(key, extra = \{\}\)/.test(store)],
  [true, true]);

/* ===================================================================== 4
 * WHAT THE MATCHER CANNOT SEE, ASSERTED RATHER THAN CLAIMED.
 * =================================================================== */
console.log("\n--- 4. the census's own stated limit, asserted so it cannot go stale silently ---");

/* CASE-6's count was over `store.mjs` ALONE and said so, resting on the fact that
   no other `src/` file builds such a query. That fact is what makes both counts
   comparable, so it is re-measured rather than inherited. */
const SRC_DIR = new URL("../src/", import.meta.url);
const others = ["index.mjs", "schema.mjs", "cdx.mjs", "subresources.mjs", "affordances.mjs", "airun.mjs"];
const builders = [];
for (const f of others) {
  let text; try { text = readFileSync(fileURLToPath(new URL(f, SRC_DIR)), "utf8"); } catch { continue; }
  for (const lit of text.split("`")) if (lit.includes(TABLE) && KEYED.test(lit)) builders.push(f);
}
t("NO OTHER `src/` FILE BUILDS A QUERY IN THIS CLASS — the premise that makes a count over store.mjs "
  + "comparable with CASE-6's, re-measured here rather than inherited, so the day it stops being "
  + "true this suite says so instead of the number quietly meaning something else",
  [builders], [[]]);

/* `affordances.mjs` is D-310's file and this item did not touch it. The check
   above reads it — reading is not editing — and its emptiness is also the
   measurement that justified filing NO delegation in CLAIMS.md. */
t("and that includes `affordances.mjs`, which D-310 holds and this item did not touch: it builds no "
  + "such query, which is the measurement behind this item filing NO delegation rather than an "
  + "assumption that none was needed",
  [builders.includes("affordances.mjs")], [false]);

console.log(`\nmulticase: ${pass} passed, ${fail} failed`);
/* `process.exit(fail ? 1 : 0)` and not `process.exitCode` — `hygiene.test.mjs`
   requires every suite to exit DETERMINISTICALLY, matched in the last 400 bytes
   of the file, and it caught this suite's first draft doing it the other way. */
process.exit(fail ? 1 : 0);
