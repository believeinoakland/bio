/* NEGATIVE CONTROL: (run 2026-07-31) change the positive-FTS-term join in compile() from " AND " to " OR " (query.mjs) -> the AND-semantics assertions fail (86 pass, 2 fail); restored, 88 pass.
   D-228 / REC-68, SEVEN ARMS RUN 2026-08-08, each armed ALONE with the others held open, each DECLARING before it ran what must fail AND what must not, every restore verified against a UNIQUE pre-arm snapshot by sha256 AND by `cmp`. Baseline at the moment they ran: 123/123 suites green, 7,805 assertions, this suite 117 pass. The harness lives in the worker's own worktree, not a shared scratchpad.
   (b) RESTORE THE DEFECT — drop `&& src[i] !== '"'` from the BARE reader's terminator set in `tokenize` (query.mjs) -> this suite 95 pass, 22 FAIL and `search.test.mjs` 170 pass, 12 FAIL. The search failures ARE the measurement this item needed and they separate the two failure modes: `state:"collected"` got 0 where it should get 1 (MATCHED NOTHING — honest), while `title:"Fund general"` got 1 where it should get 0 and `title:"billing Water"` got 1 where it should get 0 (MATCHED THE WRONG THING — a phrase that is in no title returned a real row). And `-state:"collected"` got 3 against 2: a selector that matches nothing, NEGATED, returns THE WHOLE CORPUS, which turns an honest empty answer into a confident complete one. `meaningquery.test.mjs` 100 pass, 5 FAIL.
   (c) MAKE THE BRANCH UNREACHABLE AGAIN — re-guard it with the original unsatisfiable conjunction while LEAVING the reader's quote terminator in place -> 100 pass, 17 FAIL. DECLARED as "the reachability block"; ACTUAL is wider and the correction is recorded rather than smoothed: with the reader stopping at the quote and the branch skipped, the value is not merely mis-read, it is LOST (`state:"open"` compiles to a presence test plus a stray term), so the value assertions fail too. This arm proves the branch is load-bearing; arm (d) is the one that isolates reachability.
   (d) AN EQUIVALENT-MECHANISM REVERT, which is the arm that matters for a fix a later author could call a harmless refactor — restore the swallowing bare reader AND strip the quotes downstream in `selector()`/`meaningAtom()` instead -> 100 pass, 17 FAIL, and WHICH ones is the finding: every SINGLE-WORD projected-field equality PASSES (the value round-trips perfectly), and what catches it is the STRUCTURAL pin ("the bare value reader STOPS at a quote"), the PHRASE assertions, and the four directives the downstream strip cannot reach (`has:`, `text:`, `fm:`, `sort:`) — the corpus sweep's residue is exactly `["has:state","text:sewer","fm:a.b=c","sort:created"]`. A behavioural value arm alone would have called this revert green.
   (d0) THE ARM THAT COULD NOT FIRE, kept as a result rather than deleted — set `quoted: false` on the token the branch emits, expecting phrase detection to die -> 117 pass, 0 FAIL. CAUSE, measured: `textAtom` writes `phrase` onto the atom and NOTHING in `src/` or `civicos-ui/` EVER READS IT (one write site, zero read sites), and the compiled literal is the same either way because FTS5 treats a multi-word string literal as a phrase on its own. The arm was armed against a DEAD FIELD and could never have been honoured. `atom.phrase` is reported to CONDUCT as a second instance of this item's own class, one layer along.
   (e) OVER-STRICTNESS — thirteen legitimate spellings nobody anticipated (`created:>"2026-01-01"`, `created:>="2026-01-01"`, `fm:a.b="c"`, `has:"state"`, `sort:"created"`, a bare `"two words"` term, `-state:"open"`, `state:"open"` inside parens, an unclosed `state:"open`, a quoted value containing a paren, a stray trailing quote, `fm:"a.b"="c"` quoted on BOTH sides, `fm:"a.b"=c` quoted on one) must all still compile to what their unquoted twins compile to; all thirteen PASS. The last two of those REMOVED A STATED LIMIT rather than documenting one: the first draft read a value as one bare piece plus one quoted run and let the tail fall out as a separate free-text term, which is a value silently TRUNCATED into a query that still matches things — the exact shape this item exists to remove, so the reader now consumes a value to its end. THAT REDRAFT ALSO PRODUCED, AND THEN REMOVED, A NEW UNREACHABLE BRANCH: its `if (i === before) break;` no-progress guard could not be entered, measured by the same sweep that measured D-228, and shipping a fresh unreachable defence inside the fix for an unreachable defence is the one thing this item may not do. It is deleted and the termination argument is written into the comment instead. `tokenize` now has ZERO never-entered ranges.
   TWO HARNESS DEFECTS FOUND BEFORE ANY SUBJECT DEFECT, both recorded because the instrument was wrong before the subject was: (i) the first driver passed the OBJECT viewer shape where `viewerPredicate` takes a STRING, so 43,400 compilations ran against the DENY gate and the participant branch could not have been entered; (ii) arms (b) and (d) first armed BLIND — the anchor ` && src[i] !== '"') s += src[i++];` occurs TWICE in `tokenize`, in the QUOTED reader and in the BARE one, and `String.replace` silently took the first, so both arms patched the wrong loop, failed 16 assertions and looked convincing while measuring something else. The harness now COUNTS every anchor and refuses a non-unique one — which immediately caught a THIRD ambiguity, `let raw = String(tok.value);` in both `selector()` and `meaningAtom()`. */
/* The query language, S-10 step 3.
 *
 * This suite needs no runtime, no store and no corpus, because query.mjs holds
 * no database handle: it turns a typed string into SQL and hands it back. That
 * is what makes the whole language assertable at this speed, and it is why the
 * module is pure.
 *
 * Negative-control detail: change the positive-FTS-term join in compile() from " AND " to " OR " (query.mjs) -> the AND-semantics assertions fail (86 pass, 2 fail); restored, 88 pass.
 *
 * What is being held to a contract here:
 *   - A bare multi-word string is AND. Bob's decision, recorded in
 *     RETRIEVAL-SUBSTRATE.md, on the grounds that every search box a member has
 *     ever used narrows as they type.
 *   - Every sort compiles to ORDER BY <field> <dir>, bundle_id ASC. Probe 2
 *     found the ground truth disagreeing with both indexed paths at 20,000 rows
 *     on the sorted shape alone, because ties were broken inconsistently.
 *     Without the tiebreak, paging is WRONG, not untidy: a row can appear on two
 *     pages or on none.
 *   - The D-15 viewer gate is present in EVERY statement, and an unrecognised
 *     viewer denies rather than permits.
 *   - A member's words never reach SQL or an FTS5 expression as syntax. Terms
 *     are bound as arguments and quoted as FTS5 string literals.
 */
import { compile, viewerPredicate, GATE_MARK, FIELDS, SORTABLE, MEANING } from "../src/query.mjs";
import { readFileSync } from "node:fs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const M = "class:member";
const all = (p) => [p.statements.page(), p.statements.count(), p.statements.ids(),
                    p.statements.snapshot(), ...p.statements.facets()];

console.log("\n--- the viewer gate is the single compilation point (D-15) ---");
{
  t("a member compiles to a true predicate", viewerPredicate(M).scope, "member");
  t("a session member compiles to a true predicate", viewerPredicate("member:M-0007").scope, "participant");
  t("an admin credential compiles", viewerPredicate("class:admin").scope, "member");
  /* Fail closed. When the membership model lands the dangerous default is the
     permissive one, so a viewer the compiler does not recognise must see
     nothing rather than everything. */
  t("no viewer denies", viewerPredicate(null).sql.includes("0=1"), true);
  t("an unrecognised viewer denies", viewerPredicate("whoever").sql.includes("0=1"), true);
  t("a fabricated viewer string cannot smuggle SQL", viewerPredicate("class:member OR 1=1").sql.includes("0=1"), true);

  const p = compile({ q: "sewer state:collected", viewer: M });
  const stmts = all(p);
  t("every statement carries the gate", stmts.every((s) => s.sql.includes(GATE_MARK)), true);
  t("there are four single statements plus the batched facet statements",
    stmts.length, 4 + p.statements.facets().length);
  /* The facet statement counts every field in ONE statement, so it carries the
     gate once per arm. Every other statement carries it exactly once. What
     matters is that none carries it zero times. */
  t("the gate appears at least once in every statement",
    stmts.every((s) => s.sql.split(GATE_MARK).length - 1 >= 1), true);
  t("and once per arm across the facet statements",
    p.statements.facets().reduce((n, st) => n + st.sql.split(GATE_MARK).length - 1, 0), p.facetFields.length);
  t("a denied viewer still produces statements, all of them empty by predicate",
    all(compile({ q: "sewer", viewer: null })).every((s) => s.sql.includes("0=1")), true);
}

console.log("\n--- a bare multi-word string is AND ---");
{
  const p = compile({ q: "sewer fund transfer", viewer: M });
  t("the tree is a conjunction", p.ast.op, "and");
  t("of three text atoms", p.ast.kids.length, 3);
  /* A pure-text conjunction is ONE MATCH rather than three intersections,
     because that is the case FTS5 is built for and it is the commonest query
     there is. */
  /* The count statement is the honest place to count MATCHes: a page also
     carries the ranking CTE, whose MATCH is a second, deliberate one. */
  const page = p.statements.page();
  t("compiled to a single MATCH for the set", (p.statements.count().sql.match(/bundles_fts MATCH/g) || []).length, 1);
  t("plus one for the ranking", (page.sql.match(/bundles_fts MATCH/g) || []).length, 2);
  t("with no set intersection", page.sql.includes("INTERSECT SELECT rowid"), false);
  t("the FTS expression conjoins the terms",
    page.args.find((a) => typeof a === "string" && a.includes("sewer")),
    '("sewer" AND "fund" AND "transfer")');
  t("and the query is offered the OR reading if it finds nothing", p.widenable, true);

  const one = compile({ q: "sewer", viewer: M });
  t("a single term is not widenable, because AND of one is OR of one", one.widenable, false);
}

console.log("\n--- explicit boolean structure ---");
{
  const or = compile({ q: "sewer OR water", viewer: M });
  t("OR is honoured", or.statements.page().args.find((a) => typeof a === "string" && a.includes("sewer")),
    '("sewer" OR "water")');
  const nest = compile({ q: "(sewer OR water) fund", viewer: M });
  t("parentheses nest", nest.statements.page().args.find((a) => typeof a === "string" && a.includes("sewer")),
    '(("sewer" OR "water") AND "fund")');
  const neg = compile({ q: "sewer -auditor", viewer: M });
  t("a minus is FTS5's binary NOT, parenthesised so precedence cannot bite",
    neg.statements.page().args.find((a) => typeof a === "string" && a.includes("sewer")),
    '(("sewer") NOT "auditor")');
  const bare = compile({ q: "-auditor", viewer: M });
  t("a negation with nothing to subtract from is the complement of the corpus",
    bare.statements.count().sql.includes("EXCEPT"), true);
  const word = compile({ q: "sewer NOT auditor", viewer: M });
  t("the word NOT reads as the minus does",
    word.statements.page().args.find((a) => typeof a === "string" && a.includes("sewer")),
    '(("sewer") NOT "auditor")');
  t("lowercase 'or' is a search term, not an operator",
    compile({ q: "sewer or water", viewer: M }).terms, ["sewer", "or", "water"]);
}

console.log("\n--- phrases, prefixes, and what a member types that is not syntax ---");
{
  t('a quoted phrase is one unit',
    compile({ q: '"service fund"', viewer: M }).statements.page().args.find((a) => typeof a === "string" && a.includes("service")),
    '"service fund"');
  t("a trailing star is a prefix match",
    compile({ q: "audit*", viewer: M }).statements.page().args.find((a) => typeof a === "string" && a.includes("audit")),
    '"audit"*');
  /* A member's words are DATA. An embedded quote must not be able to end the
     FTS5 string literal and turn the rest of the term into syntax.
     ------------------------------------------------------------------------
     CORRECTED 2026-08-08 (D-228 / REC-68), NOT EXEMPTED, and the reason matters
     because this is a SAFETY assertion and it moved.

     The property has not changed and still holds. What changed is the READING
     of `say"NEAR(a b, 2)`. The old tokenizer's bare reader did not stop at a
     quote, so the whole thing arrived as ONE term `say"NEAR` whose embedded
     quote `ftsLiteral` then doubled — and the two old assertions checked for
     that doubling (`say""NEAR`) and for the absence of the substring `NEAR(`.
     Both were PROXIES for "nothing became syntax", and both were reading the
     accident of where the token boundary fell.

     The bare reader now stops at a quote, so the same string reads as the term
     `say` followed by an unclosed quoted phrase — which is exactly the rule
     this same block asserts four lines below ("an unclosed quote is read to the
     end rather than refused"), applied consistently instead of only when the
     quote happened to open a token. It compiles to `("say" AND "NEAR(a b, 2)")`.
     `NEAR(` is now PRESENT as a substring and is INSIDE a string literal, so
     the old proxy reports danger where there is none: inside an FTS5 literal
     the only special character is `"`, and it is doubled.

     MEASURED CONSEQUENCE, stated because it is the kind of thing this project
     treats as a finding rather than a detail: no token value can contain a
     quote character at all any more — a bare run stops at one and a quoted run
     ends at one — so `ftsLiteral`'s doubling is no longer reachable FROM THE
     TOKENIZER. It is deliberately kept: it is a serialisation-boundary defence,
     and unreachable-because-the-input-cannot-contain-it is a stronger
     guarantee than unreachable-because-the-guard-is-unsatisfiable, which is
     what D-228 was. The assertion below is therefore written against the
     PROPERTY — no member-typed character escapes a literal — over an
     adversarial corpus, so it holds whichever layer is doing the work. */
  {
    const argOf = (q) => compile({ q, viewer: M }).statements.page().args
      .filter((a) => typeof a === "string" && (a.includes('"') || a.includes("{")));
    /* Strip every well-formed FTS5 string literal, doubled quotes and all.
       What is left is the syntax the COMPILER emitted, and a member's
       characters must never appear in it. */
    const skeleton = (e) => e.replace(/"(?:[^"]|"")*"/g, "@");
    const HOSTILE = ['say"NEAR(a b, 2)', 'a" OR "b', 'x"" NEAR(p q)', '"a""b"',
                     'title:"x" OR "y', 'a*"b', '{title}:z', 'x AND "y'];
    const leaks = [];
    for (const q of HOSTILE)
      for (const e of argOf(q)) {
        const s = skeleton(e);
        /* Only these may survive: the operators, the column filters, the
           parentheses, the prefix star and whitespace. Anything else is a
           member's character reaching FTS5 as syntax. */
        if (!/^[@\s()*]*(?:(?:AND|OR|NOT|\{[a-z]+\}|:)[@\s()*]*)*$/.test(s)) leaks.push([q, e, s]);
        if (s.includes('"')) leaks.push([q, e, "unbalanced literal"]);
      }
    t("no member-typed character reaches FTS5 as syntax, over an adversarial corpus", leaks, []);
    t("and the sweep actually looked at something — REACH, not a vacuous pass",
      HOSTILE.every((q) => argOf(q).length > 0), true);
    /* The specific string the old assertions used, kept so the change is
       legible rather than merely replaced. */
    const e = compile({ q: 'say"NEAR(a b, 2)', viewer: M }).statements.page().args
      .find((a) => typeof a === "string" && a.includes("say"));
    t("the old fixture now reads as a term and an unclosed phrase, both as data",
      e, '("say" AND "NEAR(a b, 2)")');
    t("and its NEAR( sits INSIDE a literal rather than beside one",
      skeleton(e), "(@ AND @)");
  }
  t("a lone minus is discarded rather than negating nothing",
    compile({ q: "- sewer", viewer: M }).terms, ["sewer"]);
  t("an empty query matches everything", compile({ q: "", viewer: M }).statements.count().sql.includes("fts_id IS NOT NULL"), true);
  t("an unclosed quote is read to the end rather than refused",
    compile({ q: '"service fund', viewer: M }).terms, ["service fund"]);
  t("an unclosed parenthesis warns and is read to the end",
    compile({ q: "(sewer fund", viewer: M }).warnings.length, 1);
}

console.log("\n--- selectors: enumerations match exactly, free text matches text ---");
{
  const st = compile({ q: "state:collected", viewer: M });
  const c = st.statements.count();
  t("an enumeration compiles to an indexed equality", c.sql.includes("current_state = ?"), true);
  t("with the value bound as an argument", c.args.includes("collected"), true);
  t("and no MATCH at all", c.sql.includes("MATCH"), false);
  t("a value typed in the wrong case still matches an enumeration",
    compile({ q: "state:Collected", viewer: M }).statements.count().args.includes("collected"), true);
  /* Nobody types a whole title, so equality on a title is a control that never
     answers. Title, locator and authority are text. */
  const ti = compile({ q: "title:sewer", viewer: M });
  t("title is column-scoped text, not equality",
    ti.statements.page().args.find((a) => typeof a === "string" && a.includes("sewer")), '{title} : "sewer"');
  t("locator is searchable, per Bob's decision",
    compile({ q: "locator:opengov", viewer: M }).statements.page().args.find((a) => typeof a === "string" && a.includes("opengov")),
    '{locator} : "opengov"');
  t("authority is searchable too",
    compile({ q: "authority:auditor", viewer: M }).statements.page().args.find((a) => typeof a === "string" && a.includes("auditor")),
    '{authority} : "auditor"');
  t("an unknown field is read as free text with a warning, not refused",
    compile({ q: "sewer:fund", viewer: M }).warnings.length, 1);
  t("and it still searches", compile({ q: "sewer:fund", viewer: M }).terms, ["sewer fund"]);
}

console.log("\n--- comparisons, ranges, presence, and the per-schema tail ---");
{
  const gt = compile({ q: "created:>2026-07-01", viewer: M }).statements.count();
  t("a comparison compiles to an ordered predicate", gt.sql.includes("created > ?"), true);
  t("with the bound as an argument", gt.args.includes("2026-07-01"), true);
  const rg = compile({ q: "updated:2026-07-01..2026-07-31", viewer: M }).statements.count();
  t("a range compiles to both bounds",
    [rg.sql.includes("last_updated >= ?"), rg.sql.includes("last_updated <= ?")], [true, true]);
  t("with both bounds", [rg.args.includes("2026-07-01"), rg.args.includes("2026-07-31")], [true, true]);
  const num = compile({ q: "annotations:>2", viewer: M }).statements.count();
  t("a numeric field binds a number, not a string", num.args.includes(2), true);
  const bool = compile({ q: "monitored:true", viewer: M }).statements.count();
  t("a boolean binds 1", bool.args.includes(1), true);
  const has = compile({ q: "has:locator", viewer: M }).statements.count();
  t("has: asks whether the field carries any value", has.sql.includes("source_locator IS NOT NULL"), true);
  const fm = compile({ q: "fm:workproduct_state=drafting", viewer: M }).statements.count();
  t("the per-schema tail is reached through json_extract", fm.sql.includes("json_extract(fm_json, ?)"), true);
  t("with the path bound as an argument, never interpolated", fm.args.includes("$.workproduct_state"), true);
  t("a frontmatter path that is not a path is refused with a warning",
    compile({ q: "fm:a';DROP TABLE bundles;--=x", viewer: M }).warnings.length, 1);
  t("and contributes no predicate",
    compile({ q: "fm:a';DROP TABLE bundles;--=x", viewer: M }).statements.count().sql.includes("json_extract"), false);
}

console.log("\n--- sort: the stable tiebreak is not optional ---");
{
  for (const [q, want] of [
    ["sort:updated", "DESC"], ["sort:-updated", "DESC"], ["sort:updated:asc", "ASC"],
  ]) {
    const p = compile({ q, viewer: M });
    t(`${q} sorts ${want}`, p.sort.dir, want);
  }
  /* Every sort, on every field, in both directions, ends with the id tiebreak.
     Asserted over the WHOLE vocabulary rather than a sample, because the field
     that ties heavily is exactly the one a sample misses. */
  let missing = [];
  for (const f of Object.keys(SORTABLE))
    for (const d of ["asc", "desc"]) {
      const sql = compile({ q: "sewer", viewer: M, sort: f, dir: d }).statements.page().sql;
      if (!/ORDER BY [^\n]*b\.bundle_id ASC/.test(sql)) missing.push(`${f}:${d}`);
    }
  t("every sortable field in both directions ends with bundle_id ASC", missing, []);
  const ord = (s) => s.slice(s.indexOf("ORDER BY"), s.indexOf(" LIMIT"));
  t("select-all is ordered identically to a page",
    ord(compile({ q: "sewer", viewer: M, sort: "criticality" }).statements.ids().sql),
    ord(compile({ q: "sewer", viewer: M, sort: "criticality" }).statements.page().sql));
  /* Nulls last in both directions. A sparse column sorted ascending would
     otherwise open on a page of rows that have no value at all. */
  t("nulls sort last whichever way the column goes",
    compile({ q: "", viewer: M, sort: "locator", dir: "asc" }).statements.page().sql.includes("(b.source_locator IS NULL) ASC"), true);
  t("an unknown sort field warns and falls back rather than reaching ORDER BY",
    compile({ q: "sort:whatever", viewer: M }).warnings.length, 1);
  t("a sort token cannot inject SQL",
    compile({ q: "sort:bundle_id;DROP", viewer: M }).statements.page().sql.includes("DROP"), false);
  t("sort: is a directive and never becomes a predicate",
    compile({ q: "sewer sort:updated", viewer: M }).terms, ["sewer"]);
}

console.log("\n--- default order is relevance where relevance exists ---");
{
  const text = compile({ q: "sewer", viewer: M });
  t("a text query defaults to relevance", text.sort, { field: "relevance", dir: "ASC" });
  t("and computes bm25", text.statements.page().sql.includes("bm25(bundles_fts)"), true);
  t("with a snippet, so a hit arrives in context", text.statements.page().sql.includes("snippet(bundles_fts"), true);
  /* With no text arm there is no relevance to order by, so the fallback is the
     most recently updated first, with the same tiebreak. */
  const meta = compile({ q: "state:collected", viewer: M });
  t("a metadata-only query falls back to last updated", meta.sort, { field: "updated", dir: "DESC" });
  t("and does not compute bm25 at all", meta.statements.page().sql.includes("bm25("), false);
  t("an explicit sort parameter outranks a sort: token in the string",
    compile({ q: "sewer sort:created", viewer: M, sort: "criticality" }).sort.field, "criticality");
}

console.log("\n--- text mixed with metadata is set algebra, because MATCH only knows the text table ---");
{
  const mix = compile({ q: "sewer state:collected", viewer: M }).statements.count();
  t("the two arms intersect", (mix.sql.match(/INTERSECT/g) || []).length >= 1, true);
  t("the text arm is a MATCH", mix.sql.includes("bundles_fts MATCH ?"), true);
  t("the metadata arm is an indexed predicate", mix.sql.includes("current_state = ?"), true);
  /* A compound operand must be parenthesised as a subquery: SQLite's compound
     operators are one precedence and associate left, so an unwrapped mixed chain
     means something other than the tree. */
  const hard = compile({ q: "(sewer OR state:collected) type:information", viewer: M }).statements.count();
  t("a compound operand is wrapped as a subquery", hard.sql.includes("SELECT fid FROM (SELECT"), true);
  const ex = compile({ q: "type:information -state:collected", viewer: M }).statements.count();
  t("a negated metadata arm is EXCEPT", ex.sql.includes("EXCEPT"), true);
}

console.log("\n--- workerd's compound SELECT limit, which is five and not five hundred ---");
{
  /* MEASURED, 2026-07-25: workerd refuses a compound of more than five terms.
     Six metadata filters is one ordinary pass over a filter sidebar, so this is
     reachable by a member rather than by a stress test. Longer chains nest
     through a subquery, which starts the count again. */
  const deepest = (sql) => {
    let best = 0;
    for (const seg of sql.split(/SELECT fid FROM \(|\)/)) {
      const n = (seg.match(/ UNION | INTERSECT | EXCEPT /g) || []).length + 1;
      if (n > best) best = n;
    }
    return best;
  };
  for (const [label, q] of [
    ["a seven-arm OR", "state:a OR state:b OR state:c OR state:d OR state:e OR state:f OR state:g"],
    ["seven metadata filters", "type:a state:b criticality:c schema:d status:e mode:f tier:g"],
    ["a twelve-arm OR", Array.from({ length: 12 }, (_, i) => `state:s${i}`).join(" OR ")],
    ["seven negations", "type:a -state:b -state:c -state:d -state:e -state:f -state:g"],
  ]) {
    const p = compile({ q, viewer: M });
    t(`${label} nests within the limit`, deepest(p.statements.count().sql) <= 5, true);
  }
  t("the facet pass is batched rather than one statement per field",
    compile({ q: "", viewer: M }).statements.facets().length, 2);
  t("and a single facet is a single statement",
    compile({ q: "", viewer: M, facets: ["state"] }).statements.facets().length, 1);
}

console.log("\n--- paging bounds ---");
{
  t("the default page is 50", compile({ q: "", viewer: M }).limit, 50);
  t("a caller cannot ask for an unbounded page", compile({ q: "", viewer: M, limit: 99999 }).limit, 500);
  t("nor a negative one", compile({ q: "", viewer: M, limit: -3 }).limit, 1);
  t("nor a negative offset", compile({ q: "", viewer: M, offset: -3 }).offset, 0);
  t("a page binds its limit and offset as arguments",
    compile({ q: "", viewer: M, limit: 10, offset: 20 }).statements.page().args.slice(-2), [10, 20]);
}

console.log("\n--- the vocabulary is a closed list ---");
{
  t("every FIELDS entry names a column", Object.values(FIELDS).every((f) => typeof f.col === "string"), true);
  t("every sortable field but relevance maps to a column",
    Object.entries(SORTABLE).filter(([k]) => k !== "relevance").every(([, v]) => typeof v === "string"), true);
  t("source.locator and source.authority are in the vocabulary",
    [FIELDS.locator.col, FIELDS.authority.col], ["source_locator", "source_authority"]);
  const cols = new Set(Object.values(FIELDS).map((f) => f.col));
  t("no field name reaches SQL except through the registry",
    /^[a-z_]+$/.test([...cols].join("")), true);
}

/* ====================================================================
 * D-228 / REC-68: A QUOTED FIELD VALUE, AND THE BRANCH THAT NEVER RAN.
 *
 * Until 2026-08-08 `state:"open"` bound the literal `"open"` WITH its quote
 * characters, so it matched nothing; `title:"two words"` compiled to a mangled
 * FTS5 expression. The tokenizer carried a branch written for exactly this,
 * with a comment describing what it does, AND THAT BRANCH COULD NOT BE REACHED
 * — which is a worse thing than a missing defence, because the comment tells
 * every later reader it is handled. PL-8 found it, deliberately did not fix it
 * (it changes what every selector matches and must not ride another item's
 * battery) and PINNED THE WRONG BEHAVIOUR so the fix would flip something
 * visible. Those pins are in `meaningquery.test.mjs` and are CORRECTED there.
 *
 * THE MECHANISM, because the symptom is not the finding: the guard was
 * `rest === "" && src[i] === '"'`, and the two halves each falsified the other
 * against the reader that produced their inputs. The bare reader stopped only
 * at whitespace or a paren, so `src[i]` after it was whitespace, a paren or
 * undefined — never a quote; and a quote after the colon was CONSUMED, so
 * `rest` began with `"` and was never empty. Unsatisfiable, not merely unusual.
 * ================================================================== */
console.log("\n--- D-228: a quoted field value means the value, not the quotes ---");
{
  const argsOf = (q) => compile({ q, viewer: M }).statements.page().args;
  const sqlOf = (q) => compile({ q, viewer: M }).statements.page().sql;
  const same = (a, b) => sqlOf(a) === sqlOf(b) && JSON.stringify(argsOf(a)) === JSON.stringify(argsOf(b));

  /* THE CORPUS IS PRINTED AND ITS REACH IS ASSERTED AS A DELTA. A sweep that
     narrowed to nothing would report a beautiful 100% over an empty set, which
     is the failure this file's own register section exists to catch. */
  const sample = (f) => f.type === "number" ? "3" : f.type === "bool" ? "true"
                      : f.type === "time" ? "2026-01-01" : "open";
  const corpus = [
    ...Object.entries(FIELDS).map(([n, f]) => [`${n}:${sample(f)}`, `${n}:"${sample(f)}"`]),
    ...Object.keys(MEANING).map((n) => [`${n}:hunch`, `${n}:"hunch"`]),
    ["has:state", 'has:"state"'], ["text:sewer", 'text:"sewer"'],
    ["fm:a.b=c", 'fm:a.b="c"'], ["sort:created", 'sort:"created"'],
  ];
  const disagree = corpus.filter(([a, b]) => !same(a, b)).map(([a]) => a);
  console.log(`      corpus: ${Object.keys(FIELDS).length} projected fields · `
    + `${Object.keys(MEANING).length} meaning arms · 4 directives = ${corpus.length} selectors driven`);
  t("the sweep reaches the whole language, not a sample of it — REACH, as a delta",
    corpus.length >= Object.keys(FIELDS).length + Object.keys(MEANING).length + 4, true);
  t("quoting a field value changes NOTHING it compiles to, across every selector there is",
    disagree, []);

  /* The two shapes D-228 names, spelled out rather than left to the sweep. */
  t('`state:"open"` binds the value and not the quote characters', argsOf('state:"open"')[0], "open");
  t("and it is the same query as the unquoted spelling", same('state:"open"', "state:open"), true);
  t('`leg:"hunch"` reaches the arm rather than falling to the bare sub-field',
    compile({ q: 'leg:"hunch"', viewer: M }).meaningArms,
    compile({ q: "leg:hunch", viewer: M }).meaningArms);

  /* THE PHRASE IS THE HALF THAT CHANGES WHAT MATCHES. `title:"two words"` used
     to compile to `({title} : """two" AND "words""")` — the column filter binds
     to the FIRST phrase only in FTS5, so the second word was searched over
     EVERY column. That is not a query that matched nothing; it is a query that
     matched the WRONG ROWS, and it is the case worth driving. */
  t("a quoted multi-word value compiles to one FTS5 PHRASE scoped to its column",
    argsOf('title:"two words"')[0], '{title} : "two words"');
  t("which is a DIFFERENT query from the unquoted spelling — the phrase is the point",
    same('title:"two words"', "title:two words"), false);
  t("the unquoted spelling still means AND, unchanged by this item",
    argsOf("title:two words")[0], '({title} : "two" AND "words")');
  t("and no mangled literal survives anywhere in the expression",
    /"""/.test(argsOf('title:"two words"')[0]), false);
}

console.log("\n--- D-228: the branch is REACHABLE, which is the actual subject ---");
{
  const argsOf = (q) => compile({ q, viewer: M }).statements.page().args;
  /* STRUCTURAL, because a behavioural arm alone cannot see this revert. If the
     branch were re-guarded by the unsatisfiable conjunction while the reader
     kept its quote terminator, `state:"open"` would still bind `open` — the
     value round-trips through the OTHER path — and every equality assertion
     above would stay green over a defence that had stopped running. A revert
     that is behaviourally invisible needs a structural pin; that lesson is
     recorded in the register and this is the arm that applies it. */
  const src = readFileSync(new URL("../src/query.mjs", import.meta.url), "utf8");
  const bare = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  t("the bare value reader STOPS at a quote — the one line the whole fix is",
    /while \(i < src\.length && !isSpace\(src\[i\]\)[^\n]*src\[i\] !== '"'\)/.test(bare), true);
  t("and the unsatisfiable guard that made the branch unreachable is GONE from executable source",
    /rest === ""\s*&&\s*src\[i\] === '"'/.test(bare), false);
  t("the guard that replaced it tests only the cursor, which the reader can now leave on a quote",
    /if \(src\[i\] === '"'\) \{/.test(bare), true);

  /* BEHAVIOURAL, over the compiler's answer rather than the tokenizer's
     internals: `quoted: true` on a selector token has exactly ONE producer in
     the whole tokenizer — this branch — and its only observable consequence is
     phrase detection in `textAtom`. So a compiled PHRASE is proof the branch
     ran, and it is proof no other path can forge. */
  t("a phrase can only exist if the branch ran, and it does",
    argsOf('title:"two words"')[0].includes('"two words"'), true);
  t("the same string unquoted cannot produce it, so the arm is not passing for free",
    argsOf("title:two words")[0].includes('"two words"'), false);
}

console.log("\n--- D-228: over-strictness — spellings this item did not anticipate ---");
{
  const argsOf = (q) => compile({ q, viewer: M }).statements.page().args;
  const sqlOf = (q) => compile({ q, viewer: M }).statements.page().sql;
  const same = (a, b) => sqlOf(a) === sqlOf(b) && JSON.stringify(argsOf(a)) === JSON.stringify(argsOf(b));
  /* Every one of these is a genuinely correct way to ask its question. A fix
     that only understood the shape its own comment named would pass everything
     above and still fail a member. */
  t("a comparison with a quoted operand", same('created:>"2026-01-01"', "created:>2026-01-01"), true);
  t("a range lead with a quoted operand", same('created:>="2026-01-01"', "created:>=2026-01-01"), true);
  t("the frontmatter tail, where the quote sits after an `=` rather than the colon",
    same('fm:a.b="c"', "fm:a.b=c"), true);
  t("`has:` — a directive, not a predicate", same('has:"state"', "has:state"), true);
  t("`sort:` — likewise, and it must still be consumed rather than become a term",
    same('sort:"created"', "sort:created"), true);
  t("a bare quoted phrase with no field at all still means a phrase",
    argsOf('"two words"')[0], '"two words"');
  t("a negated quoted selector", same('-state:"open"', "-state:open"), true);
  t("a quoted selector inside parentheses", same('(state:"open" OR state:reviewed)', "(state:open OR state:reviewed)"), true);
  t("an UNCLOSED quote is tolerated rather than refused, as it always was",
    argsOf('state:"open')[0], "open");
  t("a quoted value containing a parenthesis is a value, not a grouping",
    argsOf('title:"a (b)"')[0], '{title} : "a (b)"');
  t("a stray trailing quote no longer poisons the value",
    same('state:open"', "state:open"), true);
  /* THE ARM THAT REMOVED A STATED LIMIT. The first draft of the fix read a
     value as one bare piece plus one quoted run, and documented `fm:"a.b"="c"`
     — quotes on BOTH sides — as a known limit: it kept `a.b=` and let `c` fall
     out as a separate free-text term, which is a value silently TRUNCATED into
     a query that still matches things. A stated limit was the wrong answer to
     the shape this item exists to remove, so the reader now consumes a value to
     its end in as many pieces as it takes. */
  t("a value quoted on BOTH sides of its `=` is one value, not a value and a stray term",
    same('fm:"a.b"="c"', "fm:a.b=c"), true);
  t("and the same holds when only the left side is quoted",
    same('fm:"a.b"=c', "fm:a.b=c"), true);
}

console.log(`\nquery: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
