/* NEGATIVE CONTROL: (RUN 2026-08-07, each arm broken ALONE via a scripted mutation, the suite run, then RESTORED FROM A PRISTINE COPY and the restore verified BY sha256 AND BY CONTENT (cmp) — an NC harness once reported a byte-identical restore over a file that had not been restored. Whole: 102 pass, 0 fail (the counts inside each arm below were taken at 96, before the op=searchfields section 11b was added; each arm was re-confirmed to fire after it). src/query.mjs sha256 3ec864c6bf0f1cba654d98a2fa59e9c68c21f64b0f2b501fb1ddb789c6e73259.) (a) THE ITEM’S OWN, D-223 — MAKE HUNCH DEBT UNENUMERABLE AGAIN: delete the `leg` entry from MEANING -> 57 pass, 37 FAIL, and the first is "D-223: the hunch question is ASKABLE AT ALL"; `leg:hunch` degrades to free text, the debt PARTITION collapses, and the driven vocabulary walk reports it now covers nothing. (b) A SECOND COMPILATION POINT (D-15): meaningSql emits `WHERE ${GATE_MARK} fts_id IS NOT NULL AND ...` -> 92 pass, 4 FAIL — "the gate is minted in exactly ONE function" (4 sites, not 3), "no meaning arm mints a gate of its own", "a meaning-arm statement carries the gate exactly as many times as one without", and the fts_id shape arm. THE POINT: the arm now LOOKS gated to Store#runQuery’s marker check while carrying NO PREDICATE — a second compilation point that the throw alone cannot see, which is why the pin is on the COUNT. (c) THE VIEWER DROPPED: viewerPredicate’s member branch returns `1=1` without GATE_MARK -> 72 pass, 24 FAIL, every runtime arm, each the store REFUSING with "REFUSED: a retrieval statement reached the store without the viewer visibility gate (D-15)" at store.mjs #runQuery. The arm never runs rather than running ungated. (d) MAX_COMPOUND EXCEEDED: MAX_COMPOUND 4 -> 8 -> 92 pass, 4 FAIL: three compile-time width arms, and the eight-arm LIVE query answers `Error: too many terms in compound SELECT: SQLITE_ERROR` from inside workerd — the MEASURED ceiling of five, refusing in the engine and not in a comment. (e) THE ARM STOPS KEYING ON fts_id: meaningSql -> `SELECT rowid AS fid FROM bundles WHERE bundle_id IN (...)` -> 95 pass, 1 FAIL, and THE RESULT CORRECTS A PREDICTION THIS HEADER FIRST MADE. Only the STRUCTURAL arm fires; every runtime arm still passes, because in a corpus promoted once in order `rowid` and `fts_id` happen to be equal. A behavioural test cannot tell them apart here at any corpus size this suite would build — the structural pin is the only thing standing between this arm and a divergence that appears the first time a bundle is purged and re-promoted. Recorded as measured rather than as intended.
   (D-228, run 2026-08-08 by REC-68, the item this suite's two pins were WRITTEN FOR) restore the quote-stripping defect in query.mjs's tokenizer — drop `&& src[i] !== '"'` from the BARE reader's terminator set -> 100 pass, 5 FAIL, and the five are exactly the corrected D-228 assertions, which is the flip PL-8 pinned them to produce. The sharpest of them is not the value: `leg:"hunch"` used to compile to `grade_source`'s SIBLING column, because `"hunch"` with quotes matched no vocabulary word and the arm fell through to its bare sub-field `grade` and upper-cased it — so the arm silently answered a DIFFERENT QUESTION rather than answering none, and only the `meaningArms` assertion can see that. Armed ALONE against a UNIQUE pre-arm snapshot, restored and verified by sha256 AND `cmp`. */
/* D-222 option A: THE MEANING ARM, and D-223 is what it is accepted against.
 *
 * WHAT WAS WRONG, in one sentence taken from the register: `schema.mjs` names a
 * `hunch` leg as the one declared bias that DISQUALIFIES publication, the rule
 * was enforced ONE DOCUMENT AT A TIME at the two gates, and NO OP COULD ANSWER
 * "every leg whose grade_source is hunch". A group could be refused at the
 * moment it tried to publish and could not see its own exposure before it got
 * there. D-188's vocabulary correction — *say HUNCH DEBT* — presumes the debt
 * is visible as a QUANTITY. It was not.
 *
 * So the acceptance in this file is not "the selector parses". It is: THE
 * QUESTION IS ANSWERED, IN ONE QUERY, AND THE ANSWER IS COMPLETE. That is
 * asserted as a PARTITION — the hunch-carrying inquiries plus the rest are
 * exactly every inquiry in the corpus, with the ground truth computed in
 * JavaScript from the fixture definitions rather than read back from the
 * compiler. An agreement between the compiler and itself would prove nothing,
 * which is the discipline both retrieval probes used.
 *
 * THE THREE THINGS THAT MUST HOLD OF EVERY ARM, and each is asserted by DRIVING
 * the registry rather than by listing what happens to be there today, so an arm
 * added later is covered the day it is added:
 *
 *   1. IT KEYS ON `fts_id`. A bundle with no text-index row is invisible to
 *      every other arm; an arm that keyed on anything else would not compose,
 *      and — measured in control (e) — would silently return the wrong rows.
 *   2. IT CARRIES NO GATE OF ITS OWN. D-15 gives visibility exactly ONE
 *      compilation point and `Store#runQuery` enforces it with a THROW rather
 *      than a convention. The pin below is on the COUNT of places that mint the
 *      marker, because "we were careful" is not an enforcement mechanism.
 *   3. IT OBEYS MAX_COMPOUND. workerd refuses a compound SELECT of more than
 *      FIVE terms — far below SQLite's documented 500 — and that is a MEASURED
 *      number, not a style rule. It is checked twice: structurally, that no
 *      compound is wider than four at any depth, and LIVE, by running an
 *      eight-arm query through the real engine.
 *
 * WHAT THIS SUITE DELIBERATELY DOES NOT CLAIM. The arm selects BUNDLES, so
 * `leg:hunch` answers WHICH INQUIRIES carry a hunch leg and never WHICH LEG.
 * The meaning-GRAIN answer is a seventh statement shape on this same compiler
 * (D-222 option C) and is a separate item. Nothing here should be read as
 * covering it.
 *
 * AND ONE HONEST GAP, STATED RATHER THAN PAPERED OVER. The viewer gate filters
 * PROJECT rows and nothing else (the evidence corpus stays shared, Membership
 * 7.9). Meaning rows attach to inquiries and to captures, and a project bundle
 * carries no LEG — `promote` writes `inquiry_basis` only when the document is
 * an inquiry, which is the arm asserted below. So "a member sees N and an
 * outsider sees zero" cannot be staged through THE `leg` ARM today, because
 * those two sets do not intersect by construction.
 *
 * CORRECTED 2026-08-07 by PL-9, and the correction is kept here because the
 * sentence it replaces was WRONG rather than merely narrow. This paragraph used
 * to read *"a project bundle can carry neither"*, generalising the leg rule to
 * captures. It does not hold: `#writeReadings` is called for EVERY promote with
 * no object_type test at all, so a PROJECT bundle carrying
 * `data/provenance.json` gets a reading, reference rows, and — after
 * `op=resolve` — `resolutions` rows keyed on the project.
 * `gate-reads.test.mjs` has been promoting exactly such a project since REC-30.
 * MEASURED by driving it: a grade-A resolution lands with `bundle_id` = the
 * project. So the participant half of the gate IS stageable through the
 * `resolves`/`concerns` arms, and `test/meaningread.test.mjs` stages it live.
 * The ASSERTIONS in this file were right and are unchanged; only this prose
 * over-reached, which is why it is corrected rather than exempted.
 *
 * What IS staged here, live, is the fail-closed half, which is the
 * stronger setting of the same gate: an unrecognised viewer gets `0=1` and must
 * see zero on EVERY statement — hits, total, select-all and facets together,
 * because a `total` larger than the pages is exactly how hidden stops being
 * identical to absent.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { compile, MEANING, meaningVocabulary, ambiguousBareWords,
         GATE_MARK, FIELDS, SORTABLE } from "../src/query.mjs";
/* The vocabularies are asserted against the CATALOG the compiler imports them
   from, so "the registry is a view of the catalog" is checked and not claimed. */
import { BASIS_ROLES, GRADE_AXES, GRADE_SOURCES } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const M = "class:member";
const QUERY_SRC = readFileSync(SRC("query.mjs"), "utf8");
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");

/* Pull one balanced parenthesised run out of a compiled statement. The set
   compilation is what is under test and it sits inside the `hits(fid) AS (...)`
   CTE, so it is extracted rather than re-derived — re-deriving it here would be
   the parallel copy this project has twice been burned by. */
const balanced = (sql, opener) => {
  const at = sql.indexOf(opener);
  if (at < 0) return null;
  let i = at + opener.length - 1, depth = 0;
  for (; i < sql.length; i++) {
    if (sql[i] === "(") depth++;
    else if (sql[i] === ")") { depth--; if (depth === 0) return sql.slice(at + opener.length, i); }
  }
  return null;
};
/* Returns a STRING, never null: every caller below reaches for `.includes`, and
   a null here would throw and take the arms after it down with it (D-93's class
   inside a control, five recorded times). An empty string fails its assertion
   loudly, which is what a control is for. */
const hitsOf = (plan) => String(balanced(plan.statements.page().sql, "hits(fid) AS (") ?? "");

/* Compound-operator widths at EVERY depth, which is the property MAX_COMPOUND
   is about: the ceiling is per compound SELECT, and nesting through a subquery
   starts the count again. Returns the widest run of operators found at any one
   nesting level. */
/* CORRECTED while writing this suite, and the first version is worth naming
   because it is the instrument defect this project keeps paying for: it tallied
   operators PER DEPTH, so four terms in one subquery and two in its sibling
   summed to six and reported a ceiling breach the compiler had not committed.
   A count can be right about the shape and wrong about the population. Each
   parenthesised group now gets its OWN counter, which is what "a compound" and
   "nesting starts the count again" actually mean. */
const widestCompound = (sql) => {
  const stack = [0];
  let widest = 0;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (c === "(") { stack.push(0); continue; }
    if (c === ")") { widest = Math.max(widest, (stack.pop() ?? 0) + 1); continue; }
    for (const op of ["INTERSECT", "UNION", "EXCEPT"])
      if (sql.startsWith(op, i)) { stack[stack.length - 1]++; i += op.length - 1; break; }
  }
  return Math.max(widest, stack[0] + 1);
};

/* ==================================================================== 1
 * THE REGISTRY, DRIVEN. Nothing below names an arm by hand.
 * ================================================================== */
console.log("\n--- 1. every arm, produced by driving the registry ---");
const ARMS = Object.keys(MEANING);
console.log(`  corpus of arms: ${ARMS.length} (${ARMS.join(", ")})`);

/* D-223 IS THE ACCEPTANCE, so the FIRST thing asserted is that the question can
   be ASKED. Everything after this is detail; this is the item. */
{
  const p = compile({ q: "leg:hunch", viewer: M });
  t("D-223: the hunch question is ASKABLE AT ALL — `leg:hunch` compiles to a meaning arm",
    (p.meaningArms ?? []).map((a) => `${a.arm}.${a.field}=${a.column}`), ["leg.source=grade_source"]);
  t("and it is NOT swallowed as free text (which is what it did before this arm existed)",
    [(p.warnings ?? []).length, (p.terms ?? []).length], [0, 0]);
}

t("the arm count is pinned, so an arm added or lost is visible", ARMS.length, 3);
t("the three the build plan names are the three that exist", ARMS.sort(), ["concerns", "leg", "resolves"]);

/* PIN THE COUNT OF IMPLEMENTATIONS. A rule with two implementations left its
   control green once already, because one absorbed the other. The published
   vocabulary and the compiler must be ONE registry, so this asserts the surface
   is DERIVED from it rather than agreeing with it by coincidence. */
{
  const pub = meaningVocabulary();
  t("the published vocabulary names exactly the compiled arms",
    Object.keys(pub).sort(), Object.keys(MEANING).sort());
  const mismatch = [];
  for (const [arm, m] of Object.entries(MEANING)) {
    if (pub[arm]?.table !== m.table || pub[arm]?.key !== m.key || pub[arm]?.bare !== m.bare) mismatch.push(arm + ":head");
    for (const [n, s] of Object.entries(m.sub))
      if (pub[arm]?.fields?.[n]?.column !== s.col) mismatch.push(`${arm}.${n}`);
  }
  t("and every column it publishes is the column the compiler filters on", mismatch, []);
  t("there is exactly ONE registry object in the module source",
    (QUERY_SRC.match(/^export const MEANING = \{/gm) || []).length, 1);
}

/* An arm name must never be shadowed by a projected field, and the two
   vocabularies must not collide — `legs:` (the projected count) and `leg:` (the
   meaning arm) are one letter apart and answer different questions. */
t("no arm name is also a projected field", ARMS.filter((a) => a in FIELDS), []);
t("no arm name is sortable (an arm is a one-to-many join and would double-count)",
  ARMS.filter((a) => a in SORTABLE), []);
t("`legs:` the projected count survives beside `leg:` the arm",
  compile({ q: "legs:>2", viewer: M }).meaningArms, []);

/* The bare-word index, DRIVEN. Ambiguity is refused at module load; this
   asserts the words actually route where the registry says. */
{
  const words = [];
  for (const [arm, m] of Object.entries(MEANING))
    for (const [subName, sub] of Object.entries(m.sub))
      for (const w of (sub.vocab || [])) words.push([arm, w, subName, sub.col]);
  console.log(`  vocabulary words driven: ${words.length}`);
  t("there IS a vocabulary to drive (a walk that covers nothing proves nothing)",
    words.length > 0, true);
  const AMB = ambiguousBareWords();
  const unambiguous = words.filter(([arm, w]) => !AMB[arm].includes(String(w).toLowerCase()));
  const wrong = unambiguous.filter(([arm, w, , col]) => {
    const got = compile({ q: `${arm}:${w}`, viewer: M }).meaningArms;
    return got.length !== 1 || got[0].arm !== arm || got[0].column !== col;
  }).map(([arm, w]) => `${arm}:${w}`);
  t("every unambiguous bare vocabulary word finds its own column", wrong, []);
  t("and there ARE unambiguous words to have found", unambiguous.length > 0, true);

  /* THE KNOWN COLLISION, PINNED. `capture` is a grade_axis AND (since DEC-21) a
     grade_source, so `leg:capture` has two honest readings and neither may be
     picked silently. Pinning the SET is what makes a NEW collision — introduced
     by a doctrine change to the catalog's vocabularies — fail here rather than
     surface as a warning in front of a member. */
  t("the ambiguous bare words are exactly the one known collision", AMB, { leg: ["capture"], resolves: [], concerns: [] });
  for (const [arm, ws] of Object.entries(AMB)) for (const w of ws) {
    const p = compile({ q: `${arm}:${w}`, viewer: M });
    t(`\`${arm}:${w}\` is refused with a warning naming BOTH readings, never guessed`,
      [(p.meaningArms ?? []).length,
       (p.warnings ?? []).some((x) => x.includes(`${arm}:source=${w}`) && x.includes(`${arm}:axis=${w}`))],
      [0, true]);
    t(`and both qualified spellings of \`${arm}:${w}\` DO compile, to different columns`,
      [compile({ q: `${arm}:source=${w}`, viewer: M }).meaningArms[0]?.column,
       compile({ q: `${arm}:axis=${w}`, viewer: M }).meaningArms[0]?.column],
      ["grade_source", "grade_axis"]);
  }
  /* THE VOCABULARY IS THE CATALOG'S, NOT A COPY OF IT. The registry that shipped
     first typed the three grade sources the schema COMMENT names; the catalog
     has five. This is the assertion that would have caught it. */
  /* Optional-chained THROUGHOUT, and that is not tidiness: control (a) removes
     the `leg` arm, and a bare `MEANING.leg.sub` threw there and took every arm
     after it with it — D-93's class, inside a control, for the sixth recorded
     time. A control must fail loudly and let its successors run. */
  t("the leg source vocabulary IS the catalog's GRADE_SOURCES, not a copy",
    MEANING.leg?.sub?.source?.vocab ?? null, GRADE_SOURCES);
  t("the role vocabulary IS the catalog's BASIS_ROLES", MEANING.leg?.sub?.role?.vocab ?? null, BASIS_ROLES);
  t("the axis vocabulary IS the catalog's GRADE_AXES", MEANING.leg?.sub?.axis?.vocab ?? null, GRADE_AXES);
}

/* ==================================================================== 2
 * EVERY ARM KEYS ON fts_id — the constraint that decides whether it composes.
 * ================================================================== */
console.log("\n--- 2. every arm keys on fts_id, and the join is back through bundles ---");
{
  const bad = [];
  for (const [arm, m] of Object.entries(MEANING)) {
    /* Driven per arm AND per sub-field, so a sub-field added later cannot skip
       the check. Presence, equality and comparison are three code paths. */
    const probes = [`${arm}:*`, ...Object.keys(m.sub).map((s) => `${arm}:${s}=x`),
                    `${arm}:>=B`, `has:${arm}`];
    for (const q of probes) {
      const hits = hitsOf(compile({ q, viewer: M }));
      if (!/^SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL/.test(String(hits).trim()))
        bad.push(`${q}: ${String(hits).slice(0, 60)}`);
      if (!String(hits).includes(` FROM ${m.table} `) && !String(hits).endsWith(` FROM ${m.table})`))
        bad.push(`${q}: does not read ${m.table}`);
    }
  }
  t("every arm and every sub-field compiles to a set of fts_id read from bundles", bad, []);
}
{
  /* An arm must be an `IN` subquery and NOT a join: a join emits one row per
     LEG, so an inquiry with four hunch legs would appear four times as soon as
     the arm is the only arm and `hits` becomes `scope`. Asserted on the shape,
     and again on real rows in part 5. */
  const hits = hitsOf(compile({ q: "leg:hunch", viewer: M }));
  t("the arm is an IN subquery, never a join that could repeat a bundle",
    [/bundle_id IN \(SELECT/.test(hits), /JOIN inquiry_basis/i.test(hits)], [true, false]);
}
{
  /* The column comes from the registry; the value is BOUND. A member's string
     never reaches SQL as syntax, which is the property the rest of this
     compiler already has and a new arm must not be the exception to. */
  const hostile = "ENT-1';DROP-TABLE-bundles;--";
  const p = compile({ q: `concerns:${hostile}`, viewer: M });
  const st = p.statements.page();
  t("the member's value is an argument, never syntax",
    [/DROP/.test(st.sql), st.args.includes(hostile)], [false, true]);
}

/* ==================================================================== 3
 * D-15: ONE COMPILATION POINT, ENFORCED BY A COUNT.
 * ================================================================== */
console.log("\n--- 3. the arm carries no gate, and there is still exactly one place that mints one ---");
{
  /* THE PIN THAT MAKES THE RULING SELF-ENFORCING. Every `${GATE_MARK}` in the
     module must fall inside `viewerPredicate`. Counting rather than eyeballing
     is the whole point: a second compilation point added by a future arm fails
     here rather than passing on somebody's care. */
  const fnStart = QUERY_SRC.indexOf("export function viewerPredicate(");
  const fnEnd = QUERY_SRC.indexOf("\n}", QUERY_SRC.indexOf("scope: \"participant\"", fnStart));
  const sites = [];
  for (let i = QUERY_SRC.indexOf("${GATE_MARK}"); i !== -1; i = QUERY_SRC.indexOf("${GATE_MARK}", i + 1)) sites.push(i);
  console.log(`  gate-mint sites found: ${sites.length}`);
  t("the gate is minted in exactly ONE function, at its three known branches (deny, member, participant)",
    [sites.length, sites.every((i) => i > fnStart && i < fnEnd)], [3, true]);
  t("and store.mjs still refuses any statement that arrives without the marker (D-15's throw)",
    /a retrieval statement reached the store without the viewer visibility gate \(D-15\)/.test(STORE_SRC), true);
}
{
  const bad = ARMS.filter((arm) => String(hitsOf(compile({ q: `${arm}:x`, viewer: M }))).includes(GATE_MARK));
  t("no meaning arm mints a gate of its own", bad, []);
  const armed = compile({ q: "leg:hunch state:open", viewer: M });
  const plain = compile({ q: "state:open", viewer: M });
  const n = (p) => [p.statements.page(), p.statements.count(), p.statements.ids(), p.statements.snapshot()]
    .map((s) => s.sql.split(GATE_MARK).length - 1);
  t("a meaning-arm statement carries the gate exactly as many times as one without",
    n(armed), n(plain));
  t("and the participant predicate reaches a meaning-arm query unchanged",
    compile({ q: "leg:hunch", viewer: "member:M-0007" }).statements.page().sql.includes("project_participants"), true);
  t("an unrecognised viewer denies a meaning-arm query at compile",
    compile({ q: "leg:hunch", viewer: "whoever" }).statements.count().sql.includes("0=1"), true);
}

/* ==================================================================== 4
 * MAX_COMPOUND — structurally, then live against the engine in part 6.
 * ================================================================== */
console.log("\n--- 4. the compound ceiling holds as arms are added ---");
{
  const arm = (i) => `leg:target=T-${i}`;
  const widths = [];
  for (let k = 1; k <= 8; k++) {
    const q = Array.from({ length: k }, (_, i) => arm(i)).join(" ");
    widths.push(widestCompound(hitsOf(compile({ q, viewer: M }))));
  }
  console.log(`  widest compound at 1..8 arms: ${widths.join(", ")}`);
  t("no compound is wider than 4 terms at any depth", widths.filter((w) => w > 4), []);
  /* The width HOLDS rather than merely staying under: four arms is a four-term
     compound, and the fifth nests instead of widening. Asserting only "never
     more than 4" would pass on a compiler that nested every single arm, which
     would be correct and needlessly slow — this says where the transition is. */
  t("the width holds as arms are added: 4 arms is a 4-term compound, 5 nests",
    [widths[3], widths[4] <= 4], [4, true]);
  t("and one arm is one term, so the walk above is measuring something", widths[0], 1);
  /* Mixed with ordinary metadata arms, which is the case that actually reaches
     the ceiling on a filter sidebar. */
  const mixed = compile({ q: "leg:hunch resolves:C concerns:ENT-1 state:open type:inquiry criticality:high", viewer: M });
  t("mixed meaning and metadata arms stay inside the ceiling",
    widestCompound(hitsOf(mixed)) <= 4, true);
}

/* ==================================================================== 5
 * THE GRAMMAR, including the alternative phrasings that must also work.
 * ================================================================== */
console.log("\n--- 5. the grammar, and an equally correct phrasing must PASS ---");
const same = (a, b) => {
  const x = compile({ q: a, viewer: M }).statements.page(), y = compile({ q: b, viewer: M }).statements.page();
  return [x.sql === y.sql, JSON.stringify(x.args) === JSON.stringify(y.args)];
};
/* THE OVER-STRICTNESS ARM. These are phrased nothing like the compact forms the
   implementation was written around, and every one is a genuinely correct way
   to ask the same question. A surface that only understood its author's habits
   would pass everything above and fail a member. */
t("`leg:source=hunch` is the same query as `leg:hunch`", same("leg:hunch", "leg:source=hunch"), [true, true]);
t("`concerns:entity=ENT-1` is the same query as `concerns:ENT-1`", same("concerns:ENT-1", "concerns:entity=ENT-1"), [true, true]);
t("`resolves:grade=C` is the same query as `resolves:C`", same("resolves:C", "resolves:grade=C"), [true, true]);
/* D-228 CLOSED 2026-08-08 by REC-68. THESE TWO ASSERTIONS ARE CORRECTED, NOT
   EXEMPTED, AND THE FLIP IS THE EVIDENCE THE FIX WORKED — which is exactly what
   PL-8 pinned them for.

   What they used to say, and it was TRUE when written: `leg:"hunch"` bound the
   value WITH ITS QUOTES (`"HUNCH"`), and so did `state:"open"` (`"open"`),
   because the tokenizer's quoted-field-value branch — guarded by
   `rest === "" && src[i] === '"'` — was UNREACHABLE. The bare reader stopped
   only at whitespace and parens, so it had already swallowed the opening quote
   by the time `rest` was tested, and `rest` was therefore never empty while
   `src[i]` was never a quote. PL-8 pinned the wrong behaviour deliberately so
   that fixing it would flip something visible instead of landing unnoticed.

   REC-68 made the branch reachable by stopping the bare reader at a quote. Both
   spellings now compile to exactly what their unquoted twins compile to, and
   the old `"HUNCH"` reading is worth reading twice: it was not merely the wrong
   VALUE, it was the wrong COLUMN — `"hunch"` with quotes matched no vocabulary
   word, so the arm fell through to its bare sub-field `grade` and upper-cased
   it. The arm silently answered a different question. The `meaningArms`
   assertion below is what pins that, because an args-only check could not see
   it. The whole-language sweep lives in `query.test.mjs`. */
t("D-228 CLOSED: a quoted value on the arm is the value, not the quotes",
  compile({ q: 'leg:"hunch"', viewer: M }).statements.page().args.includes("hunch"), true);
t("D-228 CLOSED: and it is the SAME QUERY as the unquoted spelling",
  compile({ q: 'leg:"hunch"', viewer: M }).statements.page().sql
    === compile({ q: "leg:hunch", viewer: M }).statements.page().sql, true);
t("D-228 CLOSED: the arm now reads the column it was asked for, not its bare fall-through",
  compile({ q: 'leg:"hunch"', viewer: M }).meaningArms,
  compile({ q: "leg:hunch", viewer: M }).meaningArms);
t("D-228 CLOSED: the same is true of an ordinary projected field, which is what made it pre-existing",
  compile({ q: 'state:"open"', viewer: M }).statements.page().args.includes("open"), true);
t("D-228 CLOSED: and no argument anywhere still carries a quote character",
  compile({ q: 'state:"open" leg:"hunch"', viewer: M }).statements.page().args
    .filter((a) => typeof a === "string" && a.includes('"')), []);
t("case does not matter on an enumerated word", same("leg:hunch", "leg:HUNCH"), [true, true]);
t("nor on a grade letter", same("resolves:c", "resolves:C"), [true, true]);
t("`LEG:hunch` — the selector name itself is case-folded", same("leg:hunch", "LEG:hunch"), [true, true]);
{
  const p = compile({ q: "resolves:>=B", viewer: M });
  t("`resolves:>=B` compiles to a comparison, not an equality",
    hitsOf(p).includes("grade >= ?"), true);
  t("and the letter is normalised upward, as `capture:` has since REC-12",
    p.statements.page().args.includes("B"), true);
}
t("`leg:ground=*` is a presence test — REC-42's multi-ground question",
  hitsOf(compile({ q: "leg:ground=*", viewer: M })).includes("ground IS NOT NULL"), true);
t("`has:leg` asks whether the bundle carries any leg at all",
  hitsOf(compile({ q: "has:leg", viewer: M })).includes("SELECT bundle_id FROM inquiry_basis)"), true);
{
  /* An unknown sub-field is DROPPED WITH A WARNING rather than compiled to a
     predicate that matches nothing. The direction is deliberate: a dropped arm
     WIDENS the answer, which a member sees, and on the hunch-debt question a
     silently narrowed answer is the sentence "you have none". */
  const p = compile({ q: "leg:sorce=hunch", viewer: M });
  t("a misspelt sub-field warns by name and does not silently narrow the answer",
    [(p.meaningArms ?? []).length, (p.warnings ?? []).some((w) => /leg: unknown sub-field "sorce"/.test(w))],
    [0, true]);
}
t("negation composes: `-leg:hunch` is EXCEPT, not a dropped arm",
  hitsOf(compile({ q: "type:inquiry -leg:hunch", viewer: M })).includes("EXCEPT"), true);
t("OR composes: `leg:hunch OR leg:testimony` is a UNION",
  hitsOf(compile({ q: "leg:hunch OR leg:testimony", viewer: M })).includes("UNION"), true);
t("an arm composes with free text without collapsing into the MATCH",
  compile({ q: "sewer leg:hunch", viewer: M }).match !== null, true);

/* ==================================================================== 6
 * THE RUNTIME. The corpus is promoted through op=promote and read through
 * op=search — a real caller's only route.
 * ================================================================== */
console.log("\n--- 6. the corpus, written through op=promote ---");
const IDX = SRC("index.mjs");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl8", MEMBER_TOKEN: "mem-pl8", PROBE_TOKEN: "prb-pl8", VERSION: "test" },
});
const post = async (op, body, tok = "mem-pl8") => (await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok = "mem-pl8") => (await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json());
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const ASSERTED_AT = "2026-08-01T00:00:00Z";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.grade_axis ? [`    grade_axis: ${l.grade_axis}`] : []),
      ...(l.grade_source ? [`    grade_source: ${l.grade_source}`] : []),
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : []),
      ...(l.ground ? [`    ground: ${l.ground}`] : [])])]
  : [];
const groundLines = (rows) => rows === null ? [] : rows.length
  ? ["grounds:", ...rows.flatMap((r) => [`  - ground: ${r.ground}`,
      `    asserted_by: ${r.by ?? "carol"}`, `    at: "${ASSERTED_AT}"`])]
  : ["grounds: []"];

const inquiryMd = (id, { question = `What does ${id} rest on?`, state = "open",
                         refs = [], legs = [], grounds = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs), ...groundLines(grounds),
  "---", "", "## Question", "", question, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

const infoMd = (id, prose = "A captured document about the sewer fund.") => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", prose, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const promote = async (id, text, type, extraFiles = []) => rP(await post("promote", {
  bundleId: id, base: null, snapKey: `${id}-new`, author: "pl8",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...extraFiles],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
  register: [],
}));

/* THE FIXTURE, DECLARED ONCE. Ground truth below is computed from THIS, never
   read back from the compiler — the two must be able to disagree. */
const DOC_A = "INFO-2026-0900-memo", DOC_B = "INFO-2026-0900-ledger";
const HUNCH_1 = "INQ-2026-0900-transfer", HUNCH_2 = "INQ-2026-0900-vendor";
const CLEAN_1 = "INQ-2026-0900-earned", CLEAN_2 = "INQ-2026-0900-testimony";
const LEGLESS = "INQ-2026-0900-legless";

/* CORRECTED, and the corrections are doctrine rather than typos — the first
   version of this fixture was REFUSED at op=promote by C-2.8 three times over,
   which is the gate doing its job on a suite that had assumed it knew the rules:
   a `resolution` source grades only the CONNECTION axis (a resolution IS §8.1's
   connection grade), and `testimony` and `hunch` are members' accounts of a
   connection and can never sit on the capture axis, because a capture grade says
   how the BYTES REACHED US and that is not a member's to assert. An honestly
   undetermined leg states NO grade and NO source, which is what the two
   grounded legs below do. Corrected rather than worked around — a fixture that
   bent the rule would have tested a corpus the record cannot hold. */
const FIXTURE = [
  { id: HUNCH_1, refs: [DOC_A, DOC_B], legs: [
      { target: DOC_A, role: "supports", grade: "B", grade_axis: "connection",
        grade_source: "hunch", author: "casey", date: "2026-08-03" },
      { target: DOC_B, role: "supports" }] },
  { id: HUNCH_2, refs: [DOC_A], legs: [
      { target: DOC_A, role: "cuts_against", grade: "C", grade_axis: "connection",
        grade_source: "hunch", author: "dana", date: "2026-08-04" }] },
  { id: CLEAN_1, refs: [DOC_A, DOC_B], legs: [
      { target: DOC_A, role: "supports", ground: "charter" },
      { target: DOC_B, role: "supports", ground: "code" }],
    grounds: [{ ground: "charter" }, { ground: "code" }] },
  { id: CLEAN_2, refs: [DOC_B], legs: [
      { target: DOC_B, role: "cuts_against", grade: "D", grade_axis: "connection",
        grade_source: "testimony" }] },
  { id: LEGLESS, refs: [], legs: [] },
];

await promote(DOC_A, infoMd(DOC_A), "information");
await promote(DOC_B, infoMd(DOC_B, "A ledger extract naming the transfer."), "information");
const promoted = [];
for (const f of FIXTURE) {
  const r = await promote(f.id, inquiryMd(f.id, { refs: f.refs, legs: f.legs, grounds: f.grounds ?? null }), "inquiry");
  promoted.push([f.id, r?.ok === true]);
  if (r?.ok !== true) console.log("    REFUSED " + f.id + ": " + JSON.stringify(r).slice(0, 900));
}
console.log(`  corpus: ${FIXTURE.length} inquiries + 2 information bundles`);
t("EVERY fixture inquiry promoted (a corpus that silently shrank would make every arm below look clean)",
  promoted.filter(([, ok]) => !ok).map(([id]) => id), []);
t("and the corpus is the size this suite believes it is", promoted.length, 5);

/* GROUND TRUTH, computed in JavaScript from the fixture definitions. */
const withLeg = (pred) => FIXTURE.filter((f) => f.legs.some(pred)).map((f) => f.id).sort();
const TRUTH = {
  hunch: withLeg((l) => l.grade_source === "hunch"),
  cutsAgainst: withLeg((l) => l.role === "cuts_against"),
  testimony: withLeg((l) => l.grade_source === "testimony"),
  grounded: withLeg((l) => !!l.ground),
  anyLeg: FIXTURE.filter((f) => f.legs.length).map((f) => f.id).sort(),
  allInquiries: FIXTURE.map((f) => f.id).sort(),
};
console.log(`  ground truth: ${TRUTH.hunch.length} of ${TRUTH.allInquiries.length} inquiries carry hunch debt`);

const idsFor = async (q, viewer = null) => {
  const r = rP(await get("search", `q=${encodeURIComponent(q)}&mode=ids` + (viewer ? `&viewer=${encodeURIComponent(viewer)}` : "")));
  return { ids: (r?.ids ?? []).sort(), total: r?.total ?? null, gate: r?.gate?.scope ?? null, applied: r?.gate?.applied ?? 0 };
};

console.log("\n--- 7. D-223 DISCHARGED: hunch debt is enumerable, in one query ---");
{
  const got = await idsFor("leg:hunch");
  t("`leg:hunch` returns exactly the inquiries carrying a hunch leg", got.ids, TRUTH.hunch);
  t("and the total agrees with the page (one query, no second pass)", got.total, TRUTH.hunch.length);
  t("the statements that ran all carried the gate", got.applied > 0, true);

  /* THE PARTITION, which is what makes this ENUMERABLE rather than merely
     ANSWERED. If the arm quietly missed rows, hunch + not-hunch would not add
     up to every inquiry, and that cannot be arranged by a compiler agreeing
     with itself. */
  const clean = await idsFor("type:inquiry -leg:hunch");
  t("`type:inquiry -leg:hunch` returns exactly the rest",
    clean.ids, TRUTH.allInquiries.filter((id) => !TRUTH.hunch.includes(id)));
  t("THE PARTITION: hunch debt plus the rest is EVERY inquiry, with nothing counted twice",
    [...got.ids, ...clean.ids].sort(), TRUTH.allInquiries);

  /* An inquiry with FOUR legs must appear ONCE. HUNCH_1 carries two legs, one
     of them a hunch; a join instead of a set would return it twice. */
  const dupes = got.ids.filter((id, i) => got.ids.indexOf(id) !== i);
  t("a bundle with several legs appears exactly ONCE (the set shape, not a join)", dupes, []);
}

console.log("\n--- 8. the other questions D-223 named as equally unaskable ---");
{
  t("`leg:cuts_against` — every inquiry carrying a leg that argues the other way",
    (await idsFor("leg:cuts_against")).ids, TRUTH.cutsAgainst);
  t("`leg:testimony` — the signed grade-D accounts", (await idsFor("leg:testimony")).ids, TRUTH.testimony);
  t("`leg:ground=*` — every multi-ground basis (REC-42's OR branches)",
    (await idsFor("leg:ground=*")).ids, TRUTH.grounded);
  t("`has:leg` — every inquiry that rests on anything at all", (await idsFor("has:leg")).ids, TRUTH.anyLeg);
  t("and the legless inquiry is NOT among them (absence is real, not assumed)",
    (await idsFor("has:leg")).ids.includes(LEGLESS), false);
  t("`leg:grade=B` reaches the grade ON THE LEG, which no projection carries",
    (await idsFor("leg:grade=B")).ids, withLeg((l) => l.grade === "B"));
  t("`leg:grade=D` likewise, and it is a different set",
    (await idsFor("leg:grade=D")).ids, withLeg((l) => l.grade === "D"));
  t("`leg:axis=connection` reaches the axis, which is NOT derivable from target_type (R2)",
    (await idsFor("leg:axis=connection")).ids, withLeg((l) => l.grade_axis === "connection"));
}

console.log("\n--- 9. it composes with everything the language already had ---");
{
  t("with a metadata filter", (await idsFor("leg:hunch state:open")).ids, TRUTH.hunch);
  t("with a filter that excludes it", (await idsFor("leg:hunch state:closed")).ids, []);
  t("with OR across two arms",
    (await idsFor("leg:hunch OR leg:testimony")).ids, [...new Set([...TRUTH.hunch, ...TRUTH.testimony])].sort());
  t("with parentheses and negation",
    (await idsFor("(leg:hunch OR leg:testimony) -leg:cuts_against")).ids,
    [...new Set([...TRUTH.hunch, ...TRUTH.testimony])].filter((id) => !TRUTH.cutsAgainst.includes(id)).sort());
  t("with free text, which is a MATCH and not a set arm",
    (await idsFor("leg:hunch transfer")).ids.every((id) => TRUTH.hunch.includes(id)), true);
  /* Sort and paging: the whole set must be reachable page by page with no row
     appearing twice or never — the property the id tiebreak exists for. */
  const page = async (limit, offset) => (rP(await get("search",
    `q=${encodeURIComponent("has:leg")}&sort=updated&limit=${limit}&offset=${offset}`))?.hits ?? []).map((h) => h.bundle_id);
  const paged = [...(await page(2, 0)), ...(await page(2, 2)), ...(await page(2, 4))];
  t("paging over an arm covers the set exactly once", paged.sort(), TRUTH.anyLeg);
  const facets = rP(await get("search", `q=${encodeURIComponent("leg:hunch")}`))?.facets ?? null;
  t("the facet sidebar counts the arm's scope, not the corpus",
    (facets?.type ?? []).filter((f) => f.value === "inquiry").map((f) => f.n), [TRUTH.hunch.length]);
  /* THE LIVE COMPOUND CEILING. Eight arms in one query: if the compiler emitted
     a flat compound, workerd refuses it with "too many terms in compound
     SELECT" and this returns an error rather than rows. Structure is checked in
     part 4; this is the engine's own answer. */
  const wide = rP(await get("search", "q=" + encodeURIComponent(
    "leg:hunch leg:role=supports leg:axis=capture leg:grade=B resolves:A resolves:C concerns:ENT-1 has:leg")));
  t("eight arms in one query RUN — the nesting is what keeps workerd's five-term ceiling",
    [typeof wide?.total, wide?.error ?? null], ["number", null]);
}

console.log("\n--- 10. the resolutions arms: the FLAGGED SET the record could not list ---");
{
  /* A capture with a reading, written the way promote really persists one:
     data/provenance.json carries the reading, #writeReadings projects it into
     reading_refs, and op=resolve runs the recogniser over those references. */
  const CAP = sha("capture-bytes-pl8");
  /* `kind` comes from a CLOSED vocabulary (D-83) — `vendor` was refused with
     UNKNOWN_KIND, which is the registry refusing a doctrine change disguised as
     a write. Corrected to the kinds the record actually admits. */
  const ent1 = rP(await post("entitycreate", { kind: "contract", label: "Cascade Waterworks Contract", aliases: ["vendor:77"] }));
  const ent2 = rP(await post("entitycreate", { kind: "office", label: "Bureau of Sanitation" }));
  if (!ent1?.entity_id) console.log("    ENT1 REFUSED: " + JSON.stringify(ent1).slice(0, 400));
  t("two subjects are registered", [!!ent1?.entity_id, !!ent2?.entity_id], [true, true]);
  const prov = JSON.stringify({ documents: [{ capture: { sha256: CAP }, reading: {
    content_type: "generic", reader_version: 1, found: true, at: NOW, entities: [
      { ref: "vendor:77", kind: "vendor", key: "77", label: "Cascade Waterworks" },
      { ref: "office:sanitation", kind: "office", key: "sanitation", label: "Bureau of Sanitation" },
    ] } }] });
  const DOC_R = "INFO-2026-0900-resolved";
  const md = infoMd(DOC_R, "A document naming two subjects.");
  const ok = await promote(DOC_R, md, "information",
    [{ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }]);
  t("the document promoted with its reading", ok?.ok, true);
  const res = rP(await post("resolve", { captureSha: CAP, resolvedBy: "pl8" }));
  const grades = (res?.resolved ?? []).flatMap((r) => (r.matches ?? [r]).map((m) => m.grade)).filter(Boolean).sort();
  console.log(`  resolutions written: ${grades.length} (${grades.join(", ") || "none"})`);
  t("the recogniser wrote resolutions (without them the two arms below prove nothing)",
    grades.length > 0, true);

  /* Ground truth from the STORE's own read (op=resolutions), not from the
     compiler — the two routes must agree about which grades exist. */
  const read = rP(await get("resolutions", `sha256=${CAP}`));
  const byGrade = new Map();
  for (const r of (read?.resolutions ?? [])) byGrade.set(r.grade, (byGrade.get(r.grade) || 0) + 1);
  /* THE WALK MUST COVER SOMETHING. The first run of this suite had zero
     resolutions written and this loop's body never executed — so `resolves:C`
     reported PASS while asserting nothing at all. Assume the walk covers
     nothing until a control proves otherwise. */
  t("the store's own read agrees resolutions exist, so the loop below asserts something",
    byGrade.size > 0, true);
  console.log(`  grades present: ${[...byGrade.keys()].sort().join(", ") || "NONE"}`);
  for (const [grade] of byGrade) {
    t(`\`resolves:${grade}\` finds the document carrying a grade-${grade} resolution`,
      (await idsFor(`resolves:${grade}`)).ids, [DOC_R]);
  }
  t("a grade nothing resolved at finds nothing, rather than everything",
    (await idsFor("resolves:grade=Z")).ids, []);
  t("`concerns:<id>` is op=concerns' relation, asked as a filter",
    (await idsFor(`concerns:${ent1?.entity_id}`)).ids, [DOC_R]);
  t("a subject nothing concerns finds nothing", (await idsFor("concerns:ENT-9999-9999")).ids, []);
  t("`concerns:` composes with an ordinary filter",
    (await idsFor(`concerns:${ent1?.entity_id} type:information`)).ids, [DOC_R]);
  t("and with the type that CANNOT carry it, which must be empty and not everything",
    (await idsFor(`concerns:${ent1?.entity_id} type:inquiry`)).ids, []);
  /* The claim the schema comment makes about why connections needs no index of
     its own: every connection endpoint has a resolution row for the shared
     entity, so `concerns:` over `resolutions` is the superset. DEMONSTRATED
     rather than asserted — if it were false, `concerns:` would be silently
     missing documents a member can see through op=connections. */
  const conn = rP(await get("connections", `id=${ent1?.entity_id}`));
  const ends = new Set();
  for (const c of (conn?.connections ?? [])) { if (c.a_bundle_id) ends.add(c.a_bundle_id); if (c.b_bundle_id) ends.add(c.b_bundle_id); }
  const concerned = new Set((await idsFor(`concerns:${ent1?.entity_id}`)).ids);
  t("every connection endpoint is inside `concerns:` — the superset claim, demonstrated",
    [...ends].filter((b) => !concerned.has(b)), []);
}

console.log("\n--- 11. hidden and absent answer identically ---");
{
  /* The fail-closed half, live. An unrecognised viewer must see zero on EVERY
     statement at once: a `total` larger than the pages is precisely how hidden
     stops being identical to absent. `viewer` is stamped server-side, so this
     goes through the door the same way a caller would. */
  const asMember = rP(await get("search", `q=${encodeURIComponent("leg:hunch")}`));
  const denied = await (await mf.dispatchFetch(`http://x/api/?op=search&q=${encodeURIComponent("leg:hunch")}`)).json();
  t("a member sees the hunch-carrying inquiries", asMember?.total, TRUTH.hunch.length);
  t("a caller with no recognised credential is REFUSED at the door, never answered ungated",
    [denied?.ok ?? false, typeof denied?.error === "string" || typeof denied?.reason === "string"], [false, true]);
  /* And the compile-time half of the same rule, since the door refuses before
     the compiler is reached: an unrecognised viewer denies on every statement. */
  const p = compile({ q: "leg:hunch", viewer: "not-a-viewer" });
  const stmts = [p.statements.page(), p.statements.count(), p.statements.ids(), p.statements.snapshot(),
                 ...p.statements.facets()];
  t("every statement of a meaning-arm query denies for an unrecognised viewer",
    stmts.every((s) => s.sql.includes("0=1")), true);
  t("including the facet statements, so a COUNT cannot leak what a page withheld",
    p.statements.facets().every((s) => s.sql.includes("0=1")), true);
  /* The gap this suite states rather than papers over: the gate filters PROJECT
     rows, and a project can carry no meaning row, so the participant half of
     the rule cannot be staged through an arm. It is asserted where it CAN be —
     on the predicate reaching the statement unchanged. */
  t("a participant viewer's predicate reaches every meaning-arm statement",
    compile({ q: "leg:hunch", viewer: "member:M-0007" }).statements.facets()
      .every((s) => s.sql.includes("project_participants")), true);
  /* LABEL CORRECTED 2026-08-07 (PL-9): the assertion is unchanged and was always
     true; its LABEL over-claimed. `promote` writing legs only for inquiries is
     why the project half cannot be staged THROUGH THE `leg` ARM — it says
     nothing about captures, and a project bundle does carry resolutions. See the
     header's correction and `test/meaningread.test.mjs`, which stages it. */
  t("promote writes legs only for inquiries, which is WHY the project half cannot be staged THROUGH `leg:`",
    /const isInquiry = normalizeType\(meta\.object_type\) === "inquiry"/.test(STORE_SRC), true);
}

console.log("\n--- 11b. the vocabulary is PUBLISHED, through the op a caller actually has ---");
{
  /* A store-level test and a passing battery are not evidence that a caller can
     reach the feature — op=invitelook shipped with a ReferenceError while 1276
     assertions passed. `op=searchfields` exists so a UI builds its controls from
     the plane's vocabulary rather than a copy that drifts, and the meaning arms
     are exactly the kind of thing a surface would otherwise hard-code. */
  const sf = rP(await get("searchfields"));
  t("op=searchfields answers and publishes the meaning arms", Object.keys(sf?.meaning ?? {}).sort(), ARMS.slice().sort());
  t("and it is the COMPILER's registry, not a copy — same columns, arm by arm",
    Object.fromEntries(Object.entries(sf?.meaning ?? {}).map(([a, v]) =>
      [a, Object.fromEntries(Object.entries(v.fields).map(([n, f]) => [n, f.column]))])),
    Object.fromEntries(Object.entries(MEANING).map(([a, m]) =>
      [a, Object.fromEntries(Object.entries(m.sub).map(([n, s]) => [n, s.col]))])));
  t("the GRAIN is published in words, so a surface cannot present an arm as a bundle field",
    Object.values(sf?.meaning ?? {}).every((v) => typeof v.grain === "string" && v.grain.length > 0), true);
  t("the known bare-word collision is published too, not left for a member to discover",
    sf?.meaning?.leg?.ambiguous, ["capture"]);
  t("the syntax help names the arms a member would type",
    (sf?.syntax ?? []).some((l) => l.includes("leg:hunch")), true);
  /* And the arms are NOT smuggled into `fields`, which would let a surface offer
     them as sortable, facetable bundle columns — which they are not. */
  t("no arm leaked into the projected-field list", ARMS.filter((a) => a in (sf?.fields ?? {})), []);
}

console.log("\n--- 12. the indexes, and the one that was not added ---");
{
  /* The measurement is recorded at the source (schema.mjs) and the decision is
     pinned here, so an index removed or added silently fails a suite rather
     than only changing a timing nobody runs. */
  t("the D-223 index exists, keyed so the seek is COVERING",
    /CREATE INDEX IF NOT EXISTS inquiry_basis_grade_source ON inquiry_basis\(grade_source, bundle_id\)/.test(SCHEMA_SRC), true);
  t("the flagged-set index exists on resolutions(grade, bundle_id)",
    /CREATE INDEX IF NOT EXISTS resolutions_grade ON resolutions\(grade, bundle_id\)/.test(SCHEMA_SRC), true);
  /* NOT ADDED BY THIS ITEM, AND THE STORY IS WORTH THE ASSERTION. The first
     version of the probe hand-wrote the indexes on `bundles`, missed
     `bundles_fts_id` because it is created in store.mjs's MIGRATION rather than
     in the schema text, and reported a 97% saving from an index the product has
     had for months. The probe now sweeps both sources; this pins the fact that
     made the sweep necessary, so a future reader does not re-derive the same
     wrong finding. */
  /* Anchored on CREATE, because the schema text now DISCUSSES bundles_fts_id in
     a comment and a bare substring test would have matched the prose — a check
     that passes on its own explanation is not a check. */
  const creates = (src, re) => (src.match(re) || []).length;
  t("the join every statement makes is ALREADY indexed — in store.mjs's migration, not the schema text",
    [creates(STORE_SRC, /CREATE UNIQUE INDEX IF NOT EXISTS bundles_fts_id ON bundles\(fts_id\)/g),
     creates(SCHEMA_SRC, /CREATE[^\n]*INDEX[^\n]*ON bundles\(fts_id\)/g)], [1, 0]);
  t("no index on inquiry_basis(role) — measured as a candidate at -9.1%, and the reason is recorded",
    [creates(SCHEMA_SRC, /CREATE[^\n]*INDEX[^\n]*ON inquiry_basis\(role/g),
     /NO INDEX ON role/.test(SCHEMA_SRC)], [0, true]);
  t("no index on connections(grade) — no arm reads it, and the reason is recorded",
    [creates(SCHEMA_SRC, /CREATE[^\n]*INDEX[^\n]*ON connections\(grade/g),
     /NO INDEX ON connections\(grade\)/.test(SCHEMA_SRC)], [0, true]);
  /* The indexes are LIVE, not merely written: a store that booted has them. */
  const audit = rP(await get("audit", "", "adm-pl8"));
  t("the store booted and answers, so the schema (with the new indexes) applied",
    typeof audit === "object" && audit !== null, true);
}

await mf.dispose();
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
