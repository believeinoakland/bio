/* The query language, S-10 step 3.
 *
 * This suite needs no runtime, no store and no corpus, because query.mjs holds
 * no database handle: it turns a typed string into SQL and hands it back. That
 * is what makes the whole language assertable at this speed, and it is why the
 * module is pure.
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
import { compile, viewerPredicate, GATE_MARK, FIELDS, SORTABLE } from "../src/query.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const M = "class:member";
const all = (p) => [p.statements.page(), p.statements.count(), p.statements.ids(),
                    ...p.facetFields.map((f) => p.statements.facet(f))];

console.log("\n--- the viewer gate is the single compilation point (D-15) ---");
{
  t("a member compiles to a true predicate", viewerPredicate(M).scope, "member");
  t("a session member compiles to a true predicate", viewerPredicate("member:M-0007").scope, "member");
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
  t("and there are four kinds of statement plus a facet each", stmts.length, 3 + p.facetFields.length);
  t("the gate appears exactly once per statement",
    stmts.every((s) => s.sql.split(GATE_MARK).length - 1 === 1), true);
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
     FTS5 string literal and turn the rest of the term into syntax. */
  {
    const e = compile({ q: 'say"NEAR(a b, 2)', viewer: M }).statements.page().args.find((a) => typeof a === "string" && a.includes("say"));
    t("an embedded quote is escaped rather than ending the literal", e.includes('say""NEAR'), true);
    t("so nothing the member typed becomes FTS5 syntax", /NEAR\(/.test(e), false);
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

console.log(`\nquery: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
