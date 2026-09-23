/* BIO retrieval: the query language, S-10 step 3.
 *
 * Probe 2 (docs/development/RETRIEVAL-SUBSTRATE.md) established that the engine
 * already has everything the surface needs, so this is a PARSER AND A COMPILER,
 * not a search engine. Nothing here scores, tokenizes text, or walks a corpus.
 * It turns a member's typed string into SQL and hands it back.
 *
 * The module is deliberately pure and holds no database handle, for two reasons.
 * It makes the whole language testable without a runtime, and it makes the
 * viewer gate below unavoidable: store.mjs contains no search SQL at all, so
 * there is no second place a query could be assembled from.
 *
 * SETTLED, NOT OPTIONS. These come from Bob's decisions recorded in the
 * substrate document and must not drift:
 *   - A bare multi-word string means AND, ranked by relevance.
 *   - When an AND query returns nothing, the caller is offered the OR reading.
 *   - Default order is relevance, which is bm25 — computed over what the VIEWER can
 *     see and never over the whole index, and published as an ORDER, never as a
 *     score (D-447: `visibleBm25` below says why).
 *   - Every sort compiles to ORDER BY <field> <dir>, bundle_id ASC. Without the
 *     stable tiebreak, paging is WRONG on any field with ties, not merely
 *     inconsistent: a row can appear on two pages or on none.
 *   - Select-all is a distinct request from a page.
 *   - source.locator and source.authority are searchable.
 *
 * Two things this file decides, because requirements plus the measurements left
 * one answer:
 *   1. With no text arm there is no relevance, so a metadata-only query orders
 *      by last_updated DESC with the same id tiebreak. Relevance remains the
 *      default wherever relevance exists.
 *   2. NULLs sort last on every field, in both directions. A sparse column
 *      sorted ascending would otherwise open with a page of rows that have no
 *      value at all, which reads as a broken control. The stable tiebreak is
 *      untouched by this.
 */

/* The field registry: the whole vocabulary of the language in one place.
 *
 *   col   the projected column the field filters on
 *   type  text | time | number | bool, which decides what comparisons mean
 *   fts   set when the field is FREE TEXT rather than an enumeration, in which
 *         case `field:value` is a column-scoped MATCH instead of equality
 *   lower set when corpus values are lowercase tokens, so a member typing
 *         Collected still matches. Done by normalising the ARGUMENT rather than
 *         with COLLATE NOCASE, because a NOCASE comparison cannot use the
 *         column's index and probe 2 recorded that losing the index turns a
 *         seek into a scan.
 */
export const FIELDS = {
  id:             { col: "bundle_id",       type: "text" },
  type:           { col: "object_type",     type: "text", lower: true },
  group:          { col: "group_id",        type: "text", lower: true },
  title:          { col: "title",           type: "text", fts: "title" },
  state:          { col: "current_state",   type: "text", lower: true },
  prior:          { col: "prior_state",     type: "text", lower: true },
  created:        { col: "created",         type: "time" },
  updated:        { col: "last_updated",    type: "time" },
  criticality:    { col: "criticality",     type: "text", lower: true },
  sha:            { col: "bundle_sha",      type: "text", lower: true },
  schema:         { col: "schema_id",       type: "text", lower: true },
  mode:           { col: "produced_mode",   type: "text", lower: true },
  tier:           { col: "capability_tier", type: "text", lower: true },
  locator:        { col: "source_locator",  type: "text", fts: "locator" },
  authority:      { col: "source_authority", type: "text", fts: "authority" },
  retrieved:      { col: "source_retrieved", type: "time" },
  status:         { col: "source_status",   type: "text", lower: true },
  hash:           { col: "content_hash",    type: "text", lower: true },
  monitored:      { col: "monitor_enabled", type: "bool" },
  frequency:      { col: "monitor_frequency", type: "text", lower: true },
  checked:        { col: "monitor_last_checked", type: "time" },
  annotations:    { col: "annotations_open", type: "number" },
  reeval:         { col: "reeval_flag",     type: "bool" },
  since:          { col: "reeval_since",    type: "time" },
  reevalsource:   { col: "reeval_source",   type: "text", lower: true },
  /* REC-12: the derived strength PAIR, filterable per axis over the projection
     CACHE (store.mjs #writeStrengthProjection). TWO fields and never one — a
     single `strength:` selector would be the composed scalar DEC-21 forbids,
     and a query language is where a reader would learn the wrong shape first.
     `upper` because grades are recorded A..D and a member types `capture:b`.
     "B or better" is `capture:<=B`: the letters sort the way the grades rank,
     so an ordering that reads oddly in prose is one indexed seek in SQLite.

     REC-108 / D-379 adds `asOf` to BOTH AXES, and it is a marker on the FIELD
     rather than a sentence in this comment BECAUSE A COMMENT IS NOT IN THE LOOP
     THE MEMBER RUNS. See `CACHED_FIELDS` below for what it buys and why this
     item did not instead make the cache correct. `legs` deliberately carries no
     marker: `inquiry_basis_count` is written from `inquiry_basis` inside the
     SAME transaction that writes the legs, and nothing but a re-promotion can
     change either, so it is EXACT rather than stale — marking it would be a
     statement of doubt the record does not hold, which is its own overclaim. */
  capture:        { col: "inquiry_capture_strength",    type: "text", upper: true,
                    asOf: "each question's LAST PROMOTION",
                    authority: "op=inquirystrength",
                    why: "a capture letter is bounded by the fidelity of the text the leg rests on"
                       + " (DEC-4, framework Appendix A.1), and a DOCUMENT being re-read moves that"
                       + " bound without re-promoting the question — so this column can name a letter"
                       + " STRONGER than the record now earns, and never a weaker one" },
  connection:     { col: "inquiry_connection_strength", type: "text", upper: true,
                    asOf: "each question's LAST PROMOTION",
                    authority: "op=inquirystrength",
                    why: "a leg raised anywhere BENEATH this question does not re-promote it,"
                       + " so this column can name a letter the walk no longer derives" },
  legs:           { col: "inquiry_basis_count",         type: "number" },
  /* REC-24 (e): the ACTION's six, and they are what makes the Actions rail
     (P-52) a filter rather than a list. `overdue:true` is the one to be careful
     about and the comment is here rather than on the column: it filters the
     CACHED flag, computed when the document was last promoted, so a corpus-wide
     query answers "what was late as of each action's last write" and NOT "what
     is late now". The action page's own read derives the answer against the
     injectable clock (store.mjs #actionDerived), which is the authority — the
     same relationship REC-12's cached strength has with strengthOf(). A filter
     that is a little behind is a filter; an ANSWER that is behind is a record
     saying nothing is late when something is. */
  actionkind:     { col: "action_kind",                 type: "text", lower: true },
  risk:           { col: "action_risk_tier",            type: "number" },
  addressee:      { col: "action_counterparty_state",   type: "text", lower: true },
  resolution:     { col: "action_resolution",           type: "text", lower: true },
  due:            { col: "action_clock_next",           type: "time" },
  overdue:        { col: "action_clock_overdue",        type: "bool" },
};

/* ---------------------------------------------------------------------------
 * REC-108 / D-379: EVERY ROUTE INTO A CACHED COLUMN STATES WHAT THE VALUE IS
 * A VALUE *OF* — IN THE ANSWER, NOT IN A COMMENT.
 *
 * WHAT THIS IS AND IS NOT. It is D-379 option (b), taken on REC-105's own
 * recommendation, and the reason it is not option (a) — re-walking a document's
 * dependents when its text provenance is written — is recorded here rather than
 * only in the debt row, because the next reader's first instinct will be (a).
 *
 *   (a) MAKES THE CACHE CORRECT FOR ONE OF ITS TWO STALENESS PATHS AND LEAVES
 *   THE OTHER EXACTLY AS IT WAS. REC-12 built this column stale by design in
 *   the LEG-RE-GRADED direction: an inquiry beneath this one can be re-promoted
 *   without touching this row, and nothing re-projects an ancestor. REC-105
 *   opened a SECOND path — a document re-read moves the registry's ceiling —
 *   and (a) closes only the second. A cache that is fresh along one path and
 *   stale along another is WORSE THAN ONE THAT IS FRANKLY STALE, because the
 *   single honest sentence below can no longer be said about it, and a reader
 *   who learns the filter is trustworthy will trust it along the path where it
 *   is not. That is this project's *believed on the strength of its EXISTENCE
 *   rather than its behaviour* failure, manufactured on purpose.
 *
 *   AND ITS COST IS REAL AND WAS VERIFIED RATHER THAN INHERITED FROM THE ROW.
 *   `#writeTextSource` runs inside `#writeReadings` inside `op=promote`'s ONE
 *   transaction. The dependents of a re-read document are `inquiry_basis`
 *   rows keyed by `target_id` — indexed, but UNBOUNDED IN CARDINALITY — and
 *   each one needs a full `strengthOf()` recursion with a registry call, plus
 *   its own ancestors. So promoting a widely-cited document would pay
 *   O(dependent questions x walk) inside a Durable Object transaction.
 *
 *   (b) COSTS ONE DERIVED SENTENCE PER CONSULTED FIELD and leaves every letter
 *   exactly where it was. `query.mjs`'s own ruling one selector over governs:
 *   *a filter that is a little behind is a filter; an ANSWER that is behind is
 *   a record saying nothing is late when something is.* This column is a
 *   filter, a facet and a sort key. It is not an answer — `op=inquirystrength`
 *   is, it calls `strengthOf()`, and it touches no column.
 *
 * WHAT THE CENSUS CORRECTED IN D-379'S OWN STATEMENT OF THE PROBLEM, and it is
 * why this is a mechanism rather than one line of prose on one selector. D-379
 * says the exposure is *the `capture:` selector* and rests option (b) on
 * `overdue:`'s precedent. Measured against the artifact, THE CACHED COLUMN HAS
 * THREE ROUTES, NOT ONE:
 *
 *   1. the SELECTOR — `capture:<=B`, which a member typed;
 *   2. the DEFAULT FACET — `capture` is in `DEFAULT_FACETS`, so EVERY page-mode
 *      search counts the corpus per cached letter and publishes it to a member
 *      WHO NEVER ASKED FOR IT;
 *   3. the SORT KEY — `SORTABLE` is derived from `FIELDS`, so `sort=capture`
 *      orders a page by the cached letter.
 *
 * **AND THE PRECEDENT DOES NOT EXTEND ON ITS OWN, which is why it was checked
 * rather than cited.** `overdue` is NOT in `DEFAULT_FACETS`; it is a filter a
 * member OPTS INTO by typing it. `capture` is counted for everyone by default.
 * A sentence attached to the selector alone would have reached exactly the
 * route a member chose and missed the one that answers unasked.
 *
 * SO THE MARKER IS ON THE FIELD AND THE MATCH IS ON THE COLUMN. `CACHED_FIELDS`
 * is DERIVED from `FIELDS` rather than listed beside it, and the AST walk below
 * matches `meta` nodes by `col`, not by selector name — so a second selector
 * spelled over the same cached column, or a field renamed, is caught without
 * anyone remembering to add a spelling. A list of names goes stale the moment a
 * fourth is written; this is the inversion.
 * ------------------------------------------------------------------------- */

/** column -> { field, asOf, authority, why }, derived from FIELDS and never listed. */
export const CACHED_FIELDS = Object.fromEntries(
  Object.entries(FIELDS).filter(([, f]) => f.asOf)
    .map(([name, f]) => [f.col, { field: name, asOf: f.asOf, authority: f.authority, why: f.why }]));

/* Every `meta` leaf's column, wherever it sits in the tree — under NOT, inside a
   range's two halves, at any depth. A meaning arm carries no cached column (its
   sub-fields are live meaning-table columns), so it contributes nothing here,
   and saying that is what keeps a later reader from assuming it was missed. */
function metaColumnsOf(node, into = new Set()) {
  if (!node || typeof node !== "object") return into;
  if (node.op === "meta" && node.col) into.add(node.col);
  if (node.kid) metaColumnsOf(node.kid, into);
  if (Array.isArray(node.kids)) for (const k of node.kids) metaColumnsOf(k, into);
  return into;
}

/** The three routes a compiled plan reached a cached column by. Route membership
 *  is a fact about the PLAN; whether the facets and the page actually RAN is a
 *  fact about the call, which is why `cachedNotes` takes it as an argument
 *  instead of this guessing. */
function cachedRoutes(ast, facetList, sortField) {
  const cols = metaColumnsOf(ast);
  const routes = {};
  const mark = (col, route) => {
    if (!(col in CACHED_FIELDS)) return;
    (routes[col] ||= new Set()).add(route);
  };
  for (const c of cols) mark(c, "filter");
  for (const f of facetList) mark(FIELDS[f]?.col, "facet");
  if (sortField && sortField in FIELDS) mark(FIELDS[sortField].col, "sort");
  return routes;
}

/** The published block. One entry per cached column this answer actually
 *  consulted, in `FIELDS` order so two identical queries answer identically.
 *  EMPTY IS A STATEMENT AND IS PUBLISHED AS ONE: `[]` says this answer consulted
 *  no cached column, which is a different fact from a column being fresh. */
export function cachedNotes(routes, { facets = true, ordered = true } = {}) {
  const order = Object.values(FIELDS).map((f) => f.col);
  return Object.entries(routes)
    .map(([col, set]) => {
      const via = ["filter", "facet", "sort"].filter((r) =>
        set.has(r) && (r !== "facet" || facets) && (r !== "sort" || ordered));
      return { col, via };
    })
    .filter((e) => e.via.length)
    .sort((a, b) => order.indexOf(a.col) - order.indexOf(b.col))
    .map(({ col, via }) => ({
      field: CACHED_FIELDS[col].field, column: col, via,
      as_of: CACHED_FIELDS[col].asOf,
      authority: CACHED_FIELDS[col].authority,
      detail: `${CACHED_FIELDS[col].field}: this is the value computed at `
            + `${CACHED_FIELDS[col].asOf}, not at this query — `
            + `${CACHED_FIELDS[col].why}. `
            + `${CACHED_FIELDS[col].authority} derives the current answer and reads no column; `
            + `this ${via.join(" and ")} ${via.length > 1 ? "are" : "is"} a projection and not the authority.`,
    }));
}

/* ---------------------------------------------------------------------------
 * THE MEANING ARM — D-222 option A, and it is the answer to a hole rather than
 * a widening of the vocabulary.
 *
 * THE MEASUREMENT (STORE-AS-CACHE.md, re-verified by the 2026-08-06 research
 * pass): BIO has two retrieval routes. Route 1 is this compiler, which projects
 * 34 filterable fields onto the bundle row. Route 2 is the meaning layer —
 * `inquiry_basis`, `resolutions`, `connections`, `readings`, `reading_refs` —
 * and it was NOT REACHABLE FROM HERE AT ALL. Every one of the ~24 ops that read
 * it is a fixed-shape lookup on exactly one key.
 *
 * WHY THE HOLE WAS INVISIBLE, WHICH IS WORSE THAN THE HOLE. Route 1 already
 * carries SCALAR SUMMARIES of the meaning layer onto the bundle row —
 * `capture:`, `connection:`, `legs:`, `resolution:` above — so a caller could
 * filter by a finding's STRENGTH and never reach the legs that produced it.
 * STORE-AS-CACHE.md's own words: *the projection creates a false sense of
 * coverage — the meaning layer is visible as a number and unreachable as a
 * structure.* `legs:>2` and `leg:hunch` are not two spellings of one question:
 * the first asks how many legs a claim has, the second asks what they REST ON.
 *
 * D-223 IS THE ACCEPTANCE, and it is the sharpest instance there is.
 * `schema.mjs` names a `hunch` leg as the one declared bias that DISQUALIFIES
 * publication, and the rule was enforced ONE DOCUMENT AT A TIME at the two
 * gates: a group could be refused at the moment it tried to publish and could
 * not see its own exposure before it got there. `leg:hunch` is that question,
 * asked once, over the whole corpus or over any subset the rest of the language
 * can describe. Hunch debt becomes a QUANTITY, which is what D-188's vocabulary
 * correction ("say HUNCH DEBT") presumed all along and the record could not
 * supply.
 *
 * WHY AN ARM AND NOT A SECOND SURFACE, and this was not a free choice. The
 * comment at the `ids` arm below states that a set resolved by another route
 * "would be the second query path this design exists to prevent", and D-15
 * gives visibility exactly ONE compilation point, enforced by a throw in
 * `Store#runQuery` rather than by a convention. So option B was closed by a
 * standing ruling. Being an ARM is what buys the rest for nothing: these
 * selectors compose with every existing operator, with NOT, with parentheses,
 * with the sort, the paging, the facets and the id restriction, and they pass
 * the viewer gate because every statement below takes its WHERE from
 * `viewerPredicate` and no arm carries a gate of its own.
 *
 * WHAT AN ARM CANNOT DO, said here rather than left to be discovered. It
 * selects BUNDLES. `leg:hunch` answers WHICH INQUIRIES carry a hunch leg, never
 * WHICH LEG — the grain collapses on the way out, because `scope` is
 * bundle-shaped and that is precisely what keeps the gate correct. The
 * meaning-GRAIN answer is a seventh statement shape on this same compiler
 * (D-222 option C), and it is a separate item that depends on this one. An arm
 * is also not a facet and not a sort key: both would have to count or order a
 * one-to-many join, which double-counts a bundle carrying four hunch legs. So
 * `SORTABLE` and `DEFAULT_FACETS` are built from `FIELDS` alone, deliberately.
 *
 *   table  the meaning table the arm reads
 *   key    the column that names the BUNDLE. Every arm joins back through
 *          `bundles.fts_id` on it, because a bundle that is not text-indexed is
 *          invisible to every other arm and a new one that did not would fail
 *          to compose with them.
 *   bare   the sub-field an unqualified value falls to when it is not one of
 *          the enumerated words below
 *   sub    the filterable columns, each with the vocabulary that lets a bare
 *          word find its own column. `case` normalises the ARGUMENT for the
 *          same reason `lower`/`upper` do above: a NOCASE comparison cannot use
 *          an index.
 *
 * A GRADE COMPARISON READS THE WAY `capture:` ALREADY READS, and that is a
 * consistency decision, not an oversight. Grades are stored A..D and the
 * letters sort the way the grades rank, so `resolves:>=B` is "B or WEAKER" and
 * "B or better" is `resolves:<=B`. It reads oddly in prose and it is one
 * indexed seek in SQLite; more to the point, `capture:<=B` has meant exactly
 * this since REC-12, and a query language is where a reader would learn the
 * wrong shape first.
 * ------------------------------------------------------------------------- */

/* `resolutions` carries BOTH questions a member asks of the reverse index, so
   it is defined ONCE and spelled twice, differing only in what a bare value
   means. `concerns:ENT-1` is op=concerns' own relation in op=concerns' own
   words — a reference in the document resolved to that subject, joined on
   entity_id only, never through a declared relation (D-83). `resolves:C` is the
   grade question, and it is the one `schema.mjs` made urgent: the C tier is
   "FLAGGED for a member to confirm" and nothing could enumerate the flagged
   set. Two names over one table rather than two tables, because the reverse
   index is one fact and D-21 forbids a second place to state it. */
const RESOLUTION_SUB = {
  grade:  { col: "grade",     case: "upper", vocab: [] },
  entity: { col: "entity_id", vocab: [] },
};

/* ---------------------------------------------------------------------------
 * PL-9 / D-222 OPTION C: THE ROW DESCRIPTOR, which is what turns an arm that
 * SELECTS BUNDLES into a shape that RETURNS THE MEANING ROWS THEMSELVES.
 *
 * PL-8's arms and this are two halves of §14c's option D and they must COMPOSE
 * rather than duplicate: the arm chooses the SET (`leg:hunch` -> which
 * inquiries), the statement shape returns the GRAIN (the legs of those
 * inquiries, each with its role, its ground and its grade_source). There is no
 * second selector vocabulary here and no second gate; `q` is the arm language
 * verbatim, and the rows are projected out of the bundles it already selected.
 *
 *   row       the columns projected at meaning grain, in the order a reader
 *             wants them. Named rather than `SELECT *` so a column added to the
 *             table is a DECISION to publish rather than an accident.
 *   identity  WHAT MAKES TWO ROWS DISTINCT, and it is the table's own PRIMARY
 *             KEY. This is the grain, written down: one row of `inquiry_basis`
 *             is one LEG, addressed by (bundle_id, ord); one row of
 *             `resolutions` is one RESOLUTION, addressed by
 *             (capture_sha, ref, entity_id). It is also the ORDER BY tail, so
 *             paging over the answer is total rather than merely tidy — the
 *             same property the bundle page's id tiebreak buys.
 *   refs      columns that NAME ANOTHER BUNDLE. Each one takes REC-36's
 *             stricter rule below.
 *   rowGrain  the grain in words, published, because a surface that presented
 *             these rows as bundles would recreate exactly the false sense of
 *             coverage `STORE-AS-CACHE.md` describes.
 *
 * THE GRAIN INVERTS PL-8'S, DELIBERATELY. An arm is an `IN` subquery precisely
 * so that an inquiry with four hunch legs appears ONCE. This shape is a JOIN and
 * that same inquiry appears FOUR TIMES — once per leg — because the legs are the
 * answer. Both are correct at their own grain and neither is a spelling of the
 * other, which is why the two are separate statements on one compiler rather
 * than one statement with a flag.
 *
 * AND THE WHOLE MEANING SET OF EACH BUNDLE IN SCOPE IS RETURNED, not the subset
 * the arm matched. `leg:hunch` + `rows=leg` answers "every leg of every inquiry
 * carrying hunch debt", not "every hunch leg", and the difference is doctrine
 * rather than convenience: A BASIS RETURNED IN PART READS AS A BASIS. Filtering
 * the rows down to the arm's own predicate would hand a caller two supporting
 * legs out of five and let it conclude things about a basis it has not seen —
 * the record claiming more than it can support, which CLAUDE.md ranks worse than
 * a missing feature. Every row carries the columns the arm filters on, so a
 * caller that genuinely wants only the hunch legs can take them and still knows
 * what it did not take.
 * ------------------------------------------------------------------------- */
const RESOLUTION_ROW = {
  row: ["capture_sha", "ref", "entity_id", "grade", "method", "basis",
        "established", "raised_from", "resolved_by", "at"],
  identity: ["capture_sha", "ref", "entity_id"],
  refs: [],
  rowGrain: "one RESOLUTION of one reference in one capture to one registered subject, "
          + "addressed by (capture_sha, ref, entity_id)",
};

/* REC-90 — "IS THIS PASSAGE CITED", ONE DEFINITION WITH TWO CONSUMERS: the
   `content:cited` FILTER and the `cited` COLUMN on `rows=content`. It is a
   function of the table's ALIAS rather than two strings, because the arm's
   subquery selects from `content` unaliased while the row projection aliases it
   `m` — and a filter and a column that disagreed about what "cited" means would
   show up as a row the filter returned with the column reading false, which is
   the drift this repository has measured five times.

   BOTH LEG TABLES, and that is not belt-and-braces. `store.mjs`'s own
   minted-to-cited ratio asks both: a version leg (`inquiry_basis_version_legs`,
   REC-82's version arm) cites content exactly as a live leg does, so asking only
   the live table would report a passage as UNCITED while a recorded version of a
   basis rests on it — the answer overclaiming what is unused, which is the
   direction that makes a member delete something a finding needs. */
const citedExists = (alias) =>
  `(EXISTS (SELECT 1 FROM inquiry_basis ib WHERE ib.content_id = ${alias}.content_id)`
  + ` OR EXISTS (SELECT 1 FROM inquiry_basis_version_legs vl WHERE vl.content_id = ${alias}.content_id))`;

/* REC-121: the `cited_as` value of an image cited AS ITSELF, READ OFF THE CHECKER'S
   OWN DEFAULT for an image rather than typed — `contentCitedAs` is the function the
   mint path writes the column through, so the filter and the writer cannot spell
   it two ways. And the word the `chain` filter and `chain_last` both answer for
   such a row (IC-131), exported so a suite and a surface read ONE spelling.
   DECLARED ABOVE `MEANING` because `chain_last` below interpolates both while the
   registry is being built, and a `const` below it would be in its dead zone. */
const CONTENT_CITED_AS_BYTES = contentCitedAs({ kind: "image" });
export const CHAIN_DOES_NOT_APPLY = "does-not-apply";
/* REC-127 / IC-138: the SAME WORD on the cap axis, bound to the chain's constant
   rather than typed a second time — a bytes row's cap is null for the reason its
   chain is (nothing was transcribed, so no derivation step caps anything), and a
   member reading both columns of one row must read one word for one fact. */
export const CAP_DOES_NOT_APPLY = CHAIN_DOES_NOT_APPLY;

export const MEANING = {
  /* The basis of an inquiry, one row per LEG. D-223's table.
     EVERY VOCABULARY HERE IS IMPORTED FROM THE CHECK CATALOG, never listed. The
     first version of this registry typed the three grade sources the SCHEMA
     COMMENT names, and the live vocabulary has FIVE — `inherited` and `capture`
     were added by REC-31 and DEC-21 and that comment was never corrected. A hand
     copy would have made two of a member's legitimate questions unanswerable
     while every test passed, because the tests would have been written from the
     same copy. The catalog IS the vocabulary; this is a view of it. */
  leg: {
    table: "inquiry_basis", key: "bundle_id", bare: "grade",
    grain: "the inquiry whose basis carries such a leg",
    sub: {
      /* DEC-15's `hunch` is the one that disqualifies publication — D-223. */
      source: { col: "grade_source", case: "lower", vocab: GRADE_SOURCES },
      /* Invariant 7: a leg that argues the other way is a ROW, so it is askable. */
      role:   { col: "role",         case: "lower", vocab: BASIS_ROLES },
      /* R2: the axis is NOT derivable from target_type, so it is its own column. */
      axis:   { col: "grade_axis",   case: "lower", vocab: GRADE_AXES,
                /* REC-114: see `grade` below — `leg:axis=capture` reaches the
                   same rows by the same column and is the second of the three
                   routes D-383 named. */
                selects: "the axis the leg's grade was RECORDED on. Selecting "
                       + "`capture` here selects on what was authored; the rows "
                       + "answer with `grade` resolved against the registry" },
      /* REC-114 / D-383 — THE SELECTOR SELECTS ON THE AUTHORED COLUMN AND THE
         ROW PUBLISHES THE EARNED LETTER, AND A MEMBER IS TOLD SO HERE.
         This is a real disagreement and it is stated rather than smoothed. The
         filter is SQL over `inquiry_basis.grade`; the published `grade` is that
         letter capped by `earnedBasisRegistry`, which is a derivation over
         `register`, `readings` and each capture's transcription chain and has
         no column to select on. The two CANNOT be made one the way REC-90 made
         `content:cited` one — so the honest move is to say which is which at
         the place a member learns what the selector means, rather than to let
         `leg:grade=B` quietly return a row reading `C` with nothing explaining
         it. `grade_authored` on every row carries the same fact at row grain.
         `op=searchfields` is the vocabulary route a surface actually composes
         from, which is why this note lives here and not in the answer
         envelope — a second spelling in the envelope would reach no consumer
         that exists and would be the twelfth way of saying one thing. */
      grade:  { col: "grade",        case: "upper", vocab: [],
                selects: "the grade letter as AUTHORED on the leg. The rows this "
                       + "selects answer with `grade` = what the record can "
                       + "support and `grade_authored` = what was authored, so a "
                       + "leg selected at B can answer at C when the capture it "
                       + "rests on cannot support B" },
      /* REC-42's OR branch. `has:leg` plus `leg:ground=*` is "a multi-ground
         basis", the second question D-223 named as equally unaskable. */
      ground: { col: "ground",  vocab: [] },
      target: { col: "target_id", vocab: [] },
    },
    /* PL-9: the grain. `note` is a member's own prose about the leg and is
       published because this op is gated exactly as the bundle page is — the
       whole point of staying on this compiler. `target_id` is the one column
       that names another bundle. */
    level: "meaning",
    /* REC-90 / §4.2's last table row — THE THREE COLUMNS THAT MAKE *every leg
       citing page 14 of this document* ASKABLE. `content_id` is
       `inquiry_basis`'s own column (REC-82); `extent_kind` and `ref` are the
       content row's, reached by the LEFT JOIN below. Together they are what
       turns a basis listing from "this leg rests on that DOCUMENT" into "this
       leg rests on PAGE 14 of that document" — DEC-23's whole point arriving at
       the surface a member actually reads a basis on, and the question §1 names
       as unanswerable today.

       ADDITIVE, AND THE GRAIN DOES NOT MOVE. `content_id` is the PRIMARY KEY of
       `content`, so the join matches at most one row and a leg still answers
       with exactly one row — asserted rather than reasoned about, because a
       join that fanned out would silently multiply `total` and turn a basis of
       five legs into a basis of eleven. A leg with no content row (an inquiry
       target, or a document this record holds no bytes of — IC-83's two
       legitimate nulls) answers with all three NULL, which is the same
       undetermined the leg already carried and not a new one. */
    row: ["ord", "target_id", "target_type", "role", "grade", "grade_axis",
          "grade_source", "ground", "note", "at", "content_id"],
    rowJoin: { table: "content", alias: "xc", on: "xc.content_id = m.content_id",
               cols: ["extent_kind", "ref"] },
    /* REC-114 / D-383 — THE TWO FIELDS THIS ARM DERIVES *AFTER* THE PROJECTION,
       DECLARED HERE SO `op=searchfields` AND THE ROWS CANNOT DISAGREE ABOUT WHAT
       A LEG ROW CARRIES. They are NOT `rowComputed`: that key generates SQL, and
       these two cannot be SQL. The capture ceiling lives in `earnedBasisRegistry`
       — a JS derivation over `register`, `readings` and each capture's
       transcription chain — so there is no column to select and no expression to
       compute. `store.mjs`'s `meaningRows` fills them from the SAME
       `Store.#capturedAt` the strength walk applies, which is the whole point:
       one arithmetic, two readers, never two implementations.

       WHY `grade` MOVED RATHER THAN GAINING A SIBLING, and it is the ruling
       rather than a preference. Before this item `grade` published the letter a
       member AUTHORED, straight off `inquiry_basis.grade`, uncapped — so every
       consumer that read the obvious field published a claim the record could
       not support. Adding an `earned` field beside an uncorrected `grade` would
       have left that consumer publishing the overclaim and called the item done.
       So `grade` is the EARNED letter, which is what the record can support, and
       the authored letter is published BESIDE it rather than erased: a member's
       own act stays legible, and `grade_why` says in words why the two differ.
       `CLAUDE.md` weighs an overclaim heaviest; DEC-4 bounds the capture axis by
       fidelity; REC-88 corrected the registry and REC-105 corrected the walk.
       This is the fourth reader of one rule, swept to it.

       BOTH ARE ALWAYS PRESENT ON EVERY LEG ROW, NEVER SOMETIMES. That is this
       compiler's own convention (`snippet` is `NULL AS snippet` rather than
       absent, `target_present` is always projected) and it is what keeps
       `columns` honest: a field a row carries only when something went wrong
       makes a surface test for presence, and a surface testing for presence
       reads absence as *nothing was capped* when it may mean *nobody looked*.
       On a connection-axis leg, and on a capture leg at or under its ceiling,
       `grade_authored` simply equals `grade` and `grade_why` is null — which is
       a statement that the member's letter STANDS, not a filler. */
    rowDerived: {
      grade_authored: "the grade letter the member actually authored on this leg, "
                    + "verbatim from `inquiry_basis.grade` and never capped — equal to "
                    + "`grade` unless the record cannot support what was authored",
      grade_why: "why `grade` differs from `grade_authored`, in words, or null when "
               + "the authored letter stands unchanged",
    },
    identity: ["bundle_id", "ord"],
    refs: ["target_id"],
    rowGrain: "one LEG of one inquiry's basis, addressed by (bundle_id, ord) — "
            + "an inquiry resting on four legs answers with four rows",
  },
  /* REC-90: `level` on both, and it is `meaning` rather than `content` for a
     reason worth one line. A resolution is a REFERENCE IN A DOCUMENT RESOLVED TO
     A REGISTERED SUBJECT — it is derived meaning ABOUT content, not the content
     itself, and Part II §14.3's levels are distinguished by what an absence
     means: no resolution may mean nothing was extracted, which is a statement
     about a level BELOW this one. Calling it `content` would make the answer's
     own four-level statement say the level below had been searched when it had
     not. */
  resolves: { table: "resolutions", key: "bundle_id", bare: "grade", level: "meaning",
              grain: "the bundle carrying a capture whose reference resolved so",
              sub: RESOLUTION_SUB, ...RESOLUTION_ROW },
  concerns: { table: "resolutions", key: "bundle_id", bare: "entity", level: "meaning",
              grain: "the bundle carrying a capture that concerns the subject",
              sub: RESOLUTION_SUB, ...RESOLUTION_ROW },
  /* ---------------------------------------------------------------------
   * REC-90 / CONTENT-SEARCH-DESIGN.md §4.2 — THE `content:` ARM, and it is
   * question (b) of that document's §1 table: ROWS at content grain.
   *
   * IT IS NOT QUESTION (a). `passage:` — which passages MENTION X — searches
   * the TEXT the extractors produced and needs an index that does not exist
   * yet (§4.1's `capture_text`, item 4). This arm searches the `content`
   * TABLE: the extents somebody has already cited or marked citable. The two
   * are different questions over different sets and §3 says why building them
   * as one is how a search that returns documents gets called finished. Saying
   * so here matters because an empty `content:` answer is the EASIEST false
   * absence in this system to produce — a corpus of five hundred captured
   * agenda packets nobody has cited holds ZERO content rows, and that is a
   * fact about citation, never about what the documents say. The `levels`
   * block on the answer is where that is made mechanical rather than hoped
   * for; this comment is why it is not optional.
   *
   * FOUR OF THE SIX SUB-FIELDS ARE NOT `column <cmp> ?`, WHICH IS NEW HERE.
   * `leg:`, `resolves:` and `concerns:` all filter a column against a bound
   * value, so the registry needed nothing else. The questions §4.2 names for
   * this arm are not all of that shape: two of them ask about a CLASS over a
   * column (`minted`), one asks about the LAST ELEMENT of a stored chain
   * (`chain`), one asks whether any EDGE points here (`cited`), and one has a
   * first-class UNDETERMINED that is `IS NULL` rather than a value (`cap`).
   * `sub.pred` is the one extension that admits all four: it returns a
   * PARAMETERISED fragment or null to fall through to the ordinary path, so
   * the three existing arms compile through exactly the code they compiled
   * through before. THE COLUMN NAMES COME FROM THIS REGISTRY AND THE MEMBER'S
   * STRING IS ALWAYS AN ARGUMENT — the property the whole compiler has, kept
   * rather than re-argued, and `content-arm.test.mjs` pins it by compiling a
   * battery of hostile values and asserting the SQL is byte-identical across
   * all of them while only `args` moves.
   * ------------------------------------------------------------------- */
  content: {
    table: "content", key: "bundle_id", bare: "kind",
    /* The LEVEL this arm answers at, declared rather than inferred from the
       table name, because the four-level statement on the answer is composed
       from it (CLAUDE.md: saying WHICH level is empty is a first-class
       obligation, and a level nobody declared cannot be named). */
    level: "content",
    grain: "the document holding such a content row",
    sub: {
      /* IC-1's extent grammar, DRIVEN off the checker's own map. All five arms
         are landed (REC-82 for `document`/`pdf-page`, REC-85 for the other
         three), and `dom` is absent from that map ON PURPOSE — it is refused
         by name until CONTENT-HTML produces one, so it is not a word here
         either, and that falls out rather than being restated. */
      kind:   { col: "extent_kind", case: "lower", vocab: Object.keys(CONTENT_EXTENT_KINDS) },
      /* REC-82's stale rule as a QUESTION. A content row is never rewritten and
         never deleted: when the capture is re-read the chain moves and the row
         becomes a reference to a transcription that no longer stands, recorded
         as `stale=1` with the row and its edges still resolving. `content:stale`
         is therefore "which of my documents carry citations made under a
         transcription the record has since replaced", which is a debt question
         of exactly `leg:hunch`'s kind and was unaskable before this arm. */
      stale:  { col: "stale", vocab: ["stale", "current"],
                pred: (cmp, v) => (v === "stale" || v === "current")
                  ? { sql: `stale = ?`, args: [v === "stale" ? 1 : 0] } : null },
      /* DEC-24 rule 3 / Bob's 5.7 — WHO marked the passage citable, as a CLASS.
         The column holds a member id, the literal `plane`, or a machine
         credential, and the class is the question the record actually has:
         SK-8's minted-to-cited ratio exists because a store of correctly
         labelled machine proposals nobody cited is the failure mode that role
         can produce. The three class words compile to the class predicate; ANY
         OTHER VALUE falls through to equality on the column, so "which rows did
         MEM-1 mint" stays askable and neither question is spent on the other.
         THE TWO LITERALS ARE IMPORTED, never typed: `store.mjs`'s own ratio
         reads `minted_by LIKE 'class:%'` off the same constant. */
      minted: { col: "minted_by", vocab: ["member", "plane", "machine"],
                pred: (cmp, v) => {
                  if (v === "plane") return { sql: `minted_by = ?`, args: [CONTENT_MINTED_BY_PLANE] };
                  if (v === "machine") return { sql: `minted_by LIKE ?`, args: [`${MACHINE_CLASS_PREFIX}%`] };
                  /* A MEMBER IS WHAT IS LEFT, and it is spelled as the negation
                     of the two the plane can produce rather than as a pattern
                     for a member id — there is no member-id shape to match, and
                     inventing one would refuse the next id format silently. */
                  if (v === "member")
                    return { sql: `minted_by <> ? AND minted_by NOT LIKE ?`,
                             args: [CONTENT_MINTED_BY_PLANE, `${MACHINE_CLASS_PREFIX}%`] };
                  return null;
                } },
      /* D-252's derivation cap OVER THIS EXTENT — the letter a leg citing this
         passage cannot beat. `cap:undetermined` IS ITS OWN VALUE and compiles to
         `IS NULL`, which is §4.2's explicit instruction ("never folded into a
         letter") and CLAUDE.md's undetermined-is-first-class rule arriving in a
         query language. THE CONSEQUENCE IS STATED RATHER THAN LEFT TO BE
         DISCOVERED: `cap:<=B` does NOT match an undetermined row, because NULL
         compares to nothing — so "B or better" and "not worse than B" are
         different questions here, and a caller that wants both asks
         `content:cap<=B OR content:cap=undetermined`. Folding NULL into the
         comparison in either direction would be the record answering about
         rows whose cap it does not know.
         REC-127 / IC-138 — THE CHAIN'S TWO-CAUSES NULL, ON THE CAP AXIS. A
         `cited_as = 'bytes'` row (FW-19) is an image cited AS ITSELF: no
         transcription stands between the citation and its target, so there is
         no derivation step for a cap to be the weakest of — its
         `derivation_cap` is NULL BY MEANING, exactly as its chain is
         (EXTRACTION-BREADTH §3.1). `cap:undetermined` is therefore
         `derivation_cap IS NULL` over TEXT rows only, and the bytes rows answer
         under their own stated value `cap:does-not-apply` (`cited_as = 'bytes'`)
         — REC-121's decision for `chain`, taken for the same reason and not
         re-argued: reachable by NO cap value would leave the cap question with
         rows it answers nothing about, the silent drop one layer up. The value
         arrives UPPER-CASED (`case: "upper"`, as `UNDETERMINED` does), so it is
         compared to the constant's upper form; the literal travels as an
         ARGUMENT. A comparison (`cap<=B`) is untouched: a bytes row's NULL
         already compared to nothing, and it still does. */
      cap:    { col: "derivation_cap", case: "upper", vocab: [],
                pred: (cmp, v) => v === "UNDETERMINED"
                    ? { sql: `derivation_cap IS NULL AND cited_as <> ?`, args: [CONTENT_CITED_AS_BYTES] }
                  : v === CAP_DOES_NOT_APPLY.toUpperCase() ? { sql: `cited_as = ?`, args: [CONTENT_CITED_AS_BYTES] }
                  : null },
      /* THE LAST STEP OF THE CHAIN — "every OCR'd region below cap C" is §1's
         own example and this is its first half. REC-104: IT READS THE
         `chain_kind` COLUMN, and the read-time JSON parse it replaced is RETIRED
         rather than kept beside it. Until REC-104 this compiled to a parse of the
         whole chain per row — unindexable, the slowest filter on the table
         (M-23), and REC-90's stated DESIGN GAP against §4.2, since §4.1 gives
         `capture_text` a `chain_kind` column for the identical question.
         `chain_kind` is a GENERATED column over `chain` (schema.mjs says why), so
         it cannot disagree with the chain it describes.
         ONLY TWO VALUES KEEP A PREDICATE OF THEIR OWN, each for a reason:
         `chain:undetermined` is `chain IS NULL` — the record holds NO chain, a
         different fact from a chain with no last step, so it stays on the
         question it always asked (and `cap`'s reason: say so, never guess a
         step); and presence is `chain_kind IS NOT NULL`, exactly the pre-item
         meaning, where the ordinary arm would add `<> ''`. Every comparison
         falls to the ordinary `chain_kind <cmp> ?`.
         REC-121 / IC-131 — A NULL CHAIN HAS TWO CAUSES AND THEY ARE TWO ANSWERS.
         FW-19's `cited_as = 'bytes'` row is an image cited AS ITSELF: its chain
         is NULL BY MEANING (EXTRACTION-BREADTH §3.1 — the null "must not be read
         as undetermined"), so `chain:undetermined` is `chain IS NULL` over TEXT
         rows only and never reaches it. DECIDED AT THIS SITE: A BYTES ROW IS
         REACHABLE BY THE `chain` FILTER, under its own stated value
         `chain:does-not-apply` (`cited_as = 'bytes'`). The alternative — reachable
         by no chain value at all — was refused because it leaves the chain
         question with rows it answers NOTHING about: a member walking the answers
         (each step, undetermined, present) would never meet the images, which is
         the silent drop the row forbids, one layer up. With the third value every
         row answers exactly one chain question (`rec121-chain-bytes.test.mjs`
         drives that partition), and `chain_last` below says the same word, so the
         filter and the row label are one definition read twice. `does-not-apply`
         is NOT in `vocab`, exactly as `undetermined` is not: both are statements
         about the chain rather than step kinds, so neither becomes a bare word
         (`content:does-not-apply` would read as a kind of content). The literal
         travels as an ARGUMENT, as every value here does. */
      chain:  { col: "chain_kind", case: "lower", vocab: Object.keys(STEP_KINDS),
                pred: (cmp, v) => v === "undetermined"
                    ? { sql: `chain IS NULL AND cited_as <> ?`, args: [CONTENT_CITED_AS_BYTES] }
                  : v === CHAIN_DOES_NOT_APPLY ? { sql: `cited_as = ?`, args: [CONTENT_CITED_AS_BYTES] }
                  : cmp === "present" ? { sql: `chain_kind IS NOT NULL`, args: [] } : null },
      /* DEC-24 — THE MACHINE DOES THE LOOKING, THE MEMBER DOES THE CONCLUDING.
         A content row is an ADDRESS; it becomes part of a finding only when a
         member's basis leg names it. `content:cited` is "passages some claim
         actually rests on" and `content:uncited` is "passages marked citable
         that no finding has used" — SK-8 §7.3 (6)'s ratio as a SET a member can
         open rather than a number they can only read. BOTH LEG TABLES ARE
         ASKED, because `store.mjs`'s own ratio asks both: a version leg
         (`inquiry_basis_version_legs`) cites content exactly as a live leg
         does, and counting only the live table would report a passage as
         uncited while a recorded version of a basis rests on it. */
      cited:  { col: "content_id", vocab: ["cited", "uncited"],
                pred: (cmp, v) => (v === "cited" || v === "uncited")
                  ? { sql: `${v === "uncited" ? "NOT " : ""}${citedExists("content")}`, args: [] } : null },
    },
    /* PL-9's grain for this table. `chain` is NOT in this list and that is a
       decision rather than an omission: the column holds the whole chain as
       JSON and a row list is not where a reader consumes one — `op=content`
       answers it per row, through `describeChain`, in the sentence a member can
       read. What a reader of a LIST needs from the chain is the one fact this
       arm filters on, so it is published as the computed `chain_last` below and
       the blob stays where it is already answered. */
    row: ["content_id", "capture_sha", "extent_kind", "extent", "ref",
          "derivation_cap", "page_count", "minted_by", "at", "stale"],
    /* REC-127 / IC-138 — A STORED COLUMN PROJECTED THROUGH AN EXPRESSION, IN ITS
       OWN SLOT. `derivation_cap` on a bytes row says `does-not-apply` instead of
       the NULL a list reader takes for undetermined — the word the `cap` filter
       answers it under, so label and filter are one definition, as `chain_last`
       and `chain` are. It is a LABEL ON THE EXISTING COLUMN and not a new
       computed column ON PURPOSE: a new column would move the shape of EVERY
       `rows=content` row, where this moves only a bytes row's value and leaves
       every text row's key order and value byte-identical (a text row reads
       `m.derivation_cap` exactly as before). Only columns named here are
       projected through an expression; the SQL is the registry's and carries no
       member input. */
    rowLabel: {
      derivation_cap: `CASE WHEN m.cited_as = '${CONTENT_CITED_AS_BYTES}' THEN '${CAP_DOES_NOT_APPLY}' `
                    + `ELSE m.derivation_cap END`,
    },
    /* Facts a row cannot state about itself, computed in the projection for
       `target_present`'s reason exactly: existence is REPORTED, never inferred
       from a null. `cited` is what makes the published grain below honest — it
       says "cited or citable, and it says which", and without this column a
       reader would have to ask a second op per row to tell which. */
    rowComputed: {
      /* REC-104: off the same column the filter reads — one answer, not two.
         REC-121 / IC-131: and a `bytes` row says `does-not-apply` rather than a
         NULL a list reader takes for undetermined — the SAME word the `chain`
         filter answers it under, so label and filter are one definition. Only a
         bytes row's value moves; every text row reads `chain_kind` exactly as
         before. The two constants are the module's own, never a member's string. */
      chain_last: `CASE WHEN m.cited_as = '${CONTENT_CITED_AS_BYTES}' THEN '${CHAIN_DOES_NOT_APPLY}' `
                + `ELSE m.chain_kind END`,
      cited: citedExists("m"),
    },
    identity: ["content_id"],
    /* NO REF COLUMN. `bundle_id` is the OWNER and is already gated by clause 1
       of REC-36's rule, and `capture_sha` names a capture rather than a bundle —
       it is not a bundle reference and treating it as one would apply a bundle
       predicate to a thing that is not a bundle. Stated because an empty `refs`
       list reads like nobody looked. */
    refs: [],
    rowGrain: "one content row — one addressable extent of one capture under one chain; "
            + "cited or citable, and it says which",
  },
  /* ---------------------------------------------------------------------
   * REC-92 / CONTENT-SEARCH-DESIGN.md §4.2 — THE `passage:` ARM, and it is
   * question (a) of that document's §1 table: TEXT at content grain.
   *
   * IT IS THE SIBLING OF `content:` AND NOT ITS REPLACEMENT, and the pair is
   * the whole point. `content:` searches the extents somebody has ALREADY
   * cited or marked citable; `passage:` searches what the documents SAY. §3:
   * *the whole point of (a) is to find what nobody has cited yet.* A corpus of
   * five hundred captured agenda packets that nobody has cited holds ZERO
   * content rows and may hold half a million indexed passages, so an empty
   * `content:` answer and an empty `passage:` answer over the same corpus are
   * different facts with different next moves — which is why both arms declare
   * `level: "content"` and the answer's own statement distinguishes them by
   * ARM rather than by level alone (`Store.#meaningLevels`).
   *
   * `text:` IS UNTOUCHED AND STILL MEANS THE GROUP'S OWN NOTES. §4.2: *the
   * surface labels the two; the vocabulary does not rename a settled arm.*
   * `text:` compiles over `bundles_fts` (title/body/meta/locator/authority,
   * projected from `bundle.md`'s frontmatter); `passage:` compiles over
   * `capture_text_fts`, which REC-91 fills at promote from the extractors'
   * own units. The two are different questions over different sets.
   *
   * THE MEMBER'S STRING BECOMES AN FTS5 EXPRESSION THROUGH THE ONE HELPER
   * THAT ALREADY DOES THAT — `textAtom` then `ftsAtom`, the same two functions
   * `text:` uses — so quoted phrases and trailing-`*` prefixes mean here
   * exactly what they mean there, and there is ONE place in this compiler
   * where a member's text becomes a MATCH argument. A second spelling would
   * be a second grammar to learn and a second place to get the escaping
   * wrong; `ftsLiteral` doubles an embedded `"` and the expression is always a
   * BOUND ARGUMENT, never interpolated, which `passage-arm.test.mjs` pins by
   * compiling hostile values and asserting the SQL is byte-identical while
   * only `args` moves.
   * ------------------------------------------------------------------- */
  passage: {
    table: "capture_text", key: "bundle_id", bare: "text",
    /* The FTS side of this arm, named on the descriptor rather than known by
       `meaning()`, so the row projection's `snippet()` and the arm's own MATCH
       read ONE declaration. `column: 0` because `capture_text_fts` indexes
       exactly one column (`text`) — `snippet(pf, 0, …)` names it by position,
       as FTS5 requires, and `-1` (best-matching column) would be a claim about
       a table with more than one. */
    ftsTable: "capture_text_fts", ftsColumn: 0,
    /* THE LEVEL, and it is the same one `content:` declares. Part II §14.3's
       content level is *what has been extracted from the documents*, which is
       precisely what this table holds. Declaring anything else would make the
       answer's four-level statement name a level this arm does not answer. */
    level: "content",
    grain: "the document holding an indexed unit whose text matches",
    sub: {
      /* THE ONLY SUB-FIELD, and the absence of the other five is a decision
         rather than an omission. §4.2 gives this arm ONE question — *which
         BUNDLES hold an indexed unit whose text matches* — and gives the five
         row-shaped questions (`kind`, `stale`, `minted`, `cap`, `chain`,
         `cited`) to `content:`, over the `content` table, where they already
         landed at REC-90. An arm that grew a `chain` filter here because the
         column happens to exist would be building a reader to justify an
         index; see the note on `chain_kind` in `schema.mjs`, and this item's
         report, which declines that index for exactly that reason. */
      text: { col: "text", fts: true },
    },
    /* §4.2's row: the unit's extent and `ref`, its `chain_kind`, its
       `truncated` flag. `seq` rides with them because a PARTIAL index is a
       PREFIX in reading order (`schema.mjs`) — without it a member cannot tell
       whether the passage they are reading sits before or after the point the
       per-capture bound stopped at, which is the one thing `truncated` at the
       CAPTURE level cannot say per unit. `text` is NOT projected: the whole
       unit can be 128 KB and a row list is not where a member reads a
       document — `snippet` below is what a list wants, and UI-61's viewer is
       where the unit itself is read. */
    row: ["capture_sha", "extent_kind", "extent", "ref", "seq", "truncated", "chain_kind"],
    rowComputed: {
      /* §4.2: *where a content row already exists for that extent under the
         current chain — its `content_id`*. A SCALAR SUBQUERY AND NOT A JOIN,
         and that is the load-bearing choice. `content` is minted lazily and is
         never rewritten: when a capture is re-read the chain moves, the old
         row is marked `stale = 1` and a NEW row is minted over the same
         extent — so (capture_sha, extent_kind, extent) can name SEVERAL rows,
         and a LEFT JOIN would emit one passage row per content row. That
         duplicates the grain, makes `total` and the page describe different
         relations, and breaks paging, all silently. A scalar subquery can
         return at most one value by construction, so the grain is
         unrepresentably wrong rather than remembered.
         `stale = 0` IS THE "under the current chain" CLAUSE, read off the
         column REC-82's stale rule maintains rather than by re-parsing the
         chain JSON — and NULL when no row exists is the honest answer §4.5
         requires: a hit is an ADDRESS, and nothing is minted by searching. */
      content_id: `(SELECT xc.content_id FROM content xc`
                + ` WHERE xc.capture_sha = m.capture_sha AND xc.extent_kind = m.extent_kind`
                + ` AND xc.extent = m.extent AND xc.stale = 0`
                + ` ORDER BY xc.at DESC LIMIT 1)`,
    },
    /* §4.2's identity exactly, and it is `capture_text`'s own PRIMARY KEY, so
       the ORDER BY this generates is TOTAL and a unit cannot appear on two
       pages or on none. */
    identity: ["capture_sha", "extent_kind", "extent"],
    /* NO REF COLUMN, for `content:`'s reason unchanged: `bundle_id` is the
       OWNER and clause 1 of REC-36's rule already gates it, and `capture_sha`
       names a capture rather than a bundle. Stated because an empty `refs`
       list reads like nobody looked. */
    refs: [],
    rowGrain: "one indexed unit of one capture's text under its current chain — an ADDRESS, "
            + "not a content row until a member cites it or the assistant proposes it",
  },
};

/* The bare-word index, PRODUCED BY DRIVING the registry above rather than
   typed beside it. A hand-written copy is the failure this project has already
   paid for twice: a sourcing arm went green over a complete hand copy of 131 op
   names because it validated the copy rather than the set in use. Built once
   per arm and memoised; `meaningVocabulary` below hands the same map to the
   suite, so the assertion and the compiler cannot disagree about what a bare
   word means.

   A WORD MAY BE CLAIMED BY TWO SUB-FIELDS, and `capture` is — it is a
   `grade_axis` and, since DEC-21, also a `grade_source`, so `leg:capture` has
   two honest readings. That is REFUSED WITH A WARNING NAMING BOTH rather than
   resolved by declaration order: picking one silently would answer a question
   the member did not ask, and on this surface a confidently wrong answer is the
   failure mode the whole item exists to remove. It is a warning and not a
   load-time throw because the vocabularies come from the CATALOG, and a doctrine
   change that introduces a collision must not brick the plane at import.
   `ambiguousBareWords()` publishes the set instead, so a NEW collision fails a
   suite rather than arriving as a surprise in front of a member. */
const BARE_INDEX = new Map();
function bareIndex(arm) {
  let idx = BARE_INDEX.get(arm);
  if (idx) return idx;
  idx = new Map();
  for (const [subName, sub] of Object.entries(MEANING[arm].sub))
    for (const word of (sub.vocab || [])) {
      const w = String(word).toLowerCase();
      idx.set(w, [...(idx.get(w) || []), subName]);
    }
  BARE_INDEX.set(arm, idx);
  return idx;
}
/* Every bare word claimed by more than one sub-field, per arm. */
export function ambiguousBareWords() {
  return Object.fromEntries(Object.keys(MEANING).map((arm) =>
    [arm, [...bareIndex(arm)].filter(([, subs]) => subs.length > 1).map(([w]) => w).sort()]));
}
/* Every arm's vocabulary, derived, for the surface and for the suite. */
export function meaningVocabulary() {
  return Object.fromEntries(Object.entries(MEANING).map(([arm, m]) => [arm, {
    table: m.table, key: m.key, grain: m.grain, bare: m.bare,
    /* REC-114: `selects` when a sub-field HAS one, and absent when it does not
       — an empty string on every other field would be eleven statements that a
       selector has nothing unusual to say, which is noise a surface has to
       filter. It is published because the fact it carries (this selector reads
       a column the row no longer publishes verbatim) is one a member cannot
       recover from the vocabulary any other way. */
    fields: Object.fromEntries(Object.entries(m.sub).map(([n, s]) => [n, {
      column: s.col, values: s.vocab || [],
      ...(s.selects ? { selects: s.selects } : {}) }])),
    words: Object.fromEntries([...bareIndex(arm)].filter(([, subs]) => subs.length === 1).map(([w, subs]) => [w, subs[0]])),
    ambiguous: ambiguousBareWords()[arm],
    /* PL-9: the MEANING-GRAIN half of the same arm, published beside the
       bundle-grain half so a caller can see that one selector name answers at
       two grains and which is which. `grain` above is what `leg:hunch` selects;
       `rows.grain` is what `op=meaningrows&rows=leg` returns. */
    /* REC-90: the LEVEL this arm answers at, published beside the grain because
       the answer's four-level statement is composed from it and a surface that
       renders that statement must be able to say which level it is rendering.
       Part II §14.3's vocabulary, not a new one. */
    level: m.level,
    /* REC-90: `columns` IS NOW THE COLUMNS A ROW ACTUALLY CARRIES, which it was
       not. It published `m.row` alone, so the `target_present` column every
       `rows=leg` row has ALREADY carried since PL-9 was missing from the
       vocabulary a surface builds its table from — the "visible as a number,
       unreachable as a structure" failure in miniature, one layer up. Corrected
       rather than exempted, and DERIVED here so a descriptor that gains a
       reached or computed column cannot forget to publish it. */
    rows: { grain: m.rowGrain, identity: m.identity, columns: rowColumns(m), refs: m.refs },
  }]));
}

/* Every column one row of an arm actually carries, in projection order: its own
   table's, the ones reached through `rowJoin`, the `_present` flags `refs`
   generate, and the computed ones. ONE function, driven off the descriptor, so
   `op=searchfields` and the rows themselves cannot disagree about what a row
   holds — a hand-maintained second list is precisely how `columns` came to be
   missing `target_present` for five weeks. */
function rowColumns(m) {
  return [...m.row,
          ...(m.rowJoin ? m.rowJoin.cols : []),
          ...m.refs.map((c) => `${c}_present`),
          ...Object.keys(m.rowComputed || {}),
          /* REC-114: the fields the STORE derives after this compiler has run.
             They are columns of a row exactly as `target_present` is, and the
             only thing that distinguishes them is which layer fills them — so
             leaving them out here would re-create, for a capped grade, the
             five-week hole this function was written to close. */
          ...Object.keys(m.rowDerived || {}),
          /* REC-92: an FTS-backed arm always projects `snippet` — NULL when the
             query carried no term to centre one on, never absent. Published
             here for the same reason `target_present` had to be: a column a row
             carries and the vocabulary does not name is a column a surface
             cannot build a table from, which is how `columns` came to be
             missing `target_present` for five weeks. */
          ...(m.ftsTable ? ["snippet"] : [])];
}

/* The text columns of the FTS5 table, in table order. `meta` carries the
   flattened frontmatter so a bare term finds a value no column projects, which
   is what makes the per-schema tail searchable without a schema per version. */
/* REC-46 (2026-08-04): the machine-credential prefix `viewerPredicate` below
   recognises is the one the control plane STAMPS, imported rather than typed a
   third time. This function is NOT one of the eleven refusal sites that item
   rewired and is deliberately left asking its own question — see the note at
   `viewerPredicate` — but the SPELLING is the same spelling, and a viewer
   parser that stopped recognising what index.mjs mints would fail closed on
   every machine read at once. So the string moves in one place. */
import { parseFrontmatter, normalizeType, MACHINE_CLASS_PREFIX,
         BASIS_ROLES, GRADE_AXES, GRADE_SOURCES,
         /* REC-90: the `content:` arm's two vocabularies, IMPORTED for the same
            reason every other one here is. `CONTENT_EXTENT_KINDS` is the extent
            grammar's own map (REC-82/REC-85 landed all five arms into it) and
            `CONTENT_MINTED_BY_PLANE` is the literal the mint path writes — a
            hand copy of either would let `content:pdf-page` or `content:plane`
            go quietly unanswerable while every test written from the same copy
            passed, which is exactly how the `leg:` arm's first version lost two
            of five grade sources. */
         CONTENT_EXTENT_KINDS, CONTENT_MINTED_BY_PLANE, contentCitedAs } from "../checks/bio-checks.mjs";
/* REC-90: the chain's step kinds, from the module that CLASSIFIES them. Nothing
   here tests a step name against a literal — `content:chain=ocr` reads its
   vocabulary out of `STEP_KINDS` so a step kind added there is askable the same
   day, and one nobody classified is not a word this arm accepts. */
import { STEP_KINDS } from "./textchain.mjs";

export const FTS_COLUMNS = ["title", "body", "meta", "locator", "authority"];

/* Sorting is offered on every projected field plus relevance. Naming them
   explicitly is what stops a caller putting arbitrary SQL in an ORDER BY. */
export const SORTABLE = { relevance: null, ...Object.fromEntries(
  Object.entries(FIELDS).map(([k, f]) => [k, f.col])) };

/* Facets the sidebar counts unless the caller names others. Every one is an
   indexed enumeration, which is why the count is an aggregate the measurements
   showed costs 5ms over 20,000 rows. */
/* REC-12 adds the two AXES, side by side and never summed: a sidebar that
   counted one "strength" would be composing them for the reader before they
   asked. A non-inquiry row projects neither column, and a facet arm already
   skips NULLs, so the two arms cost nothing on a corpus with no inquiries. */
export const DEFAULT_FACETS = ["type", "state", "criticality", "schema", "status",
                               "capture", "connection"];

/* The marker every generated statement carries. The runtime test asserts that
   each statement the store executes contains it, so a query path that skipped
   the gate would be caught by its absence rather than by an audit of the code.
   It is a SQL comment, so it changes nothing about what runs. */
export const GATE_MARK = "/*viewer-gate*/";

/* REC-92 / CONTENT-SEARCH-DESIGN.md §4.4 — HOW MANY CAPTURES THE CONTENT-AXIS
   TALLY ON A `rows=passage` ANSWER IS TAKEN OVER, AND IT IS PUBLISHED RATHER
   THAN ASSUMED.
   §4.4 describes the tally as if it ranged over the whole scope ("0 hits over
   412 indexed captures; 38 in scope are unindexed…") and a scope has no bound.
   An unbounded read on the one surface a member reads ABSENCE from is the wrong
   trade twice over: it is the slowest statement in the answer, and it is the
   one whose cost grows with the corpus the instance is trying to grow.
   SO IT IS BOUNDED AND THE ANSWER SAYS SO — `captures_counted` beside
   `captures_in_scope`, with `truncated` when the bound bit, which is REC-57's
   envelope rule applied to a TALLY rather than to a list. A tally that silently
   covered the first N would be a number that looks like a census and is a
   sample, which is worse than a smaller number that says what it is.
   THE FIGURE IS MEASURED, NOT CHOSEN — see `MEASUREMENTS.md` M-40 and this
   item's report. It is deliberately NOT expressed as an `IN (?)` list of
   subjects: D-36's measured workerd ceiling is about 100 BOUND VARIABLES, and
   `#frontierContent` was over it at its default cap until D-390 chunked it. This read
   joins instead, so its cost is rows and not bound variables, and raising this
   number cannot walk into that ceiling. */
export const MEANING_AXIS_CAP = 500;

/* ---------------------------------------------------------------------------
 * The viewer gate: D-15, designed in from the first commit.
 *
 * Search ships at flat member scope ahead of the membership model, which is
 * safe only because visibility filtering has exactly ONE compilation point.
 * Today, for a member, the predicate is true. When projects and positions land
 * this function returns a real predicate over project participation and every
 * query shape inherits it, which is a change in one function instead of an
 * audit of every query path.
 *
 * FAIL CLOSED. An unrecognised or absent viewer gets `0=1`, so a caller that
 * reaches the compiler without an identity sees nothing rather than everything.
 * That is not a test convenience: when the membership model arrives, the
 * dangerous default is the permissive one, and this makes the permissive answer
 * something a viewer must earn.
 * ------------------------------------------------------------------------- */
/* The predicate is written over the alias `b`, which every statement binds to
   `bundles`. It is a WHERE clause and NOT a set intersected into the scope CTE:
   the first shipped version made it a CTE and paid a full table scan plus an
   INTERSECT in every statement, which measured 283ms for a facet sidebar at
   20,000 bundles against the probe's 5ms. A predicate on rows already selected
   is the same guarantee at a fraction of the cost, and it is still exactly one
   compilation point because every statement below takes its WHERE from here. */
/* REC-33 / DEC-37: `class:daemon` is RECOGNISED here, and the alternative was
   not "narrower" — it was INERT. op=monitor reads the bundle image it must diff
   against by stamping `class:${cls}` on its own inner request, and this function
   fails closed on anything it does not recognise, so leaving `daemon` out would
   have made every tick answer ABSENT for every bundle: a class that authenticates
   and can do nothing, which is worse than the ADMIN_TOKEN fallback it replaces
   and is exactly DIST-1's armed-alarm trap arriving by a different door.
   It joins the machine classes rather than getting a predicate of its own for
   the reason stated below — a machine credential has no person behind it and so
   no participation to check — and what actually bounds it is the op table, which
   admits it to two verbs. Recognising it here grants it nothing it cannot reach.
   Stamping some OTHER class's name on the daemon's inner read was considered and
   refused: an inner URL that lies about who is asking is the impostor hole
   REC-29 closed, and it would have put a second, disagreeing answer to "who is
   this" one function away from the only one that is allowed to exist. */
/* REC-46 AND WHAT IT DELIBERATELY DID NOT DO HERE. That item put ONE
   machine-identity predicate in the catalog and rewired eleven refusal sites to
   it. This function is NOT one of them and was left alone with its difference
   stated, which is the finding rather than an omission: every one of those
   eleven answers "is this a machine, and therefore REFUSED"; this one answers
   "whose view does this credential compile for", and its answer for a machine
   is a PERMISSION — scope `member`, unfiltered — not a refusal. Rewiring it to
   `isMachineIdentity` would widen what compiles unfiltered from the four
   TOKEN CLASSES to every bare class word and every surface/AI name in
   `NON_MEMBER_AUTHORS`, which is a ruling about who may see the group's
   thinking and is not a sweep. The vocabulary below is the token classes and is
   a different set from `ACTOR_CLASSES` for the same reason.
   What IS shared is the SPELLING, imported above, because index.mjs mints it
   and a parser reading a different literal would fail closed on every machine
   read at once. */
/* PL-11 / IS-5 / D-199 (4): `class:ai` IS RECOGNISED, AND IT IS THE
   ORGANISATION-SCOPED PRINCIPAL AND ONLY THAT.
   The `ai` class does not stamp its class here the way the four binding classes
   do. It stamps THE PRINCIPAL THE RECORD DECLARES, so a MEMBER-scoped
   credential arrives as `member:<id>` and falls into the participation filter
   below — it sees exactly what that member sees, and cannot read a project its
   principal was never invited to. Only an ORGANISATION-scoped credential
   reaches this alternation, and it belongs here for the reason `class:member`
   does: it acts for the group, there is no individual behind it whose
   participation could be checked, and anybody holding one already has
   instance-level access. Both arms are DRIVEN in test/aicredential.test.mjs and
   they answer differently, which is what makes D-199 (4)'s distinction a
   measurement rather than a label.
   LEAVING IT OUT WAS CONSIDERED AND IS THE WRONG KIND OF NARROW — REC-33's arm
   (b) exactly. This function fails closed on anything it does not recognise, so
   an organisation-scoped credential would authenticate, pass its task scope,
   and then read ABSENT for every bundle in the store: a class that can do
   nothing while reporting that the record is empty, which is worse than a
   refusal because it looks like an answer. */
export function viewerPredicate(viewer) {
  const v = typeof viewer === "string" ? viewer : "";
  const CLS = MACHINE_CLASS_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(`^(${CLS}(admin|member|probe|daemon|ai)|member:([A-Za-z0-9._:-]{1,128})|admin)$`).exec(v);
  if (!m) return { sql: `${GATE_MARK} 0=1`, args: [], viewer: null, scope: "DENY", member: null };

  /* D-15 SATISFIED HERE, and nowhere else. Membership Architecture 7.9.
   *
   * THE EVIDENCE CORPUS STAYS SHARED. Information, Problems and Actions remain
   * visible to the group generally, because compartmenting evidence would
   * fracture the thing the record exists to be and would mean a member on one
   * project could not see material another had already gathered. What
   * participation scopes is the group's THINKING: where an argument has got to,
   * what has been ruled out, what is being prepared.
   *
   * So the filter applies to PROJECT bundles and to nothing else. An uninvited
   * member does not see a project at all: not its existence, not its name, not
   * its references, not its participants. Invited-not-joined and joined differ
   * in how much of the project they see, which is a per-FIELD distinction the
   * reader applies; both can see that the project exists, so both pass here.
   *
   * This also closes the leak 7.9 names. `cites` lives on the citing object, so
   * a Project's interest in a piece of Information is a property of the Project
   * and the Information carries no record of who cites it. The one place the
   * graph could escape is the derived reverse-edge index, and because every
   * statement in this compiler takes its WHERE from this function, filtering
   * the project rows out here filters them out of every shape that could
   * reveal them.
   *
   * MACHINE CREDENTIALS ARE NOT FILTERED, deliberately. `class:member` is a
   * shared instance-level token with no person behind it and therefore no
   * participation to check; anyone holding one already has instance-level
   * access to the record, so filtering it would buy nothing while breaking the
   * operator path the token exists for. Only an identified session, which is
   * the only thing that CAN be a participant, gets the participation filter. */
  /* D-310, 2026-09-10: `member` IS RETURNED, AND IT IS THE ID THIS FUNCTION
     ALREADY COMPUTED rather than a new question. It is here because a POSITIONAL
     fact — does this viewer hold the owner position on any project (DEC-72
     clause 5) — has to be asked of the viewer, and the store's alternative was
     to parse the viewer string a SECOND time. A second parser is this
     repository's most-repeated defect class, and here it fails in the direction
     that reopens a DEC-8 disagreement: a spelling this function recognises and
     the copy does not reads as "no member", the positional fact goes
     undetermined, and the act it gates is offered again. So the parse stays in
     the one place that does it, exactly as the machine-credential PREFIX does
     (REC-46's note above).
     IT IS null FOR EVERY ARM THAT IS NOT AN IDENTIFIED SESSION, and that is the
     honest answer rather than a default: a `class:` credential has no person
     behind it and therefore no participation to hold, which is the same sentence
     the paragraph above gives for not filtering it. The bare `admin` spelling
     takes this arm too — it is the operator-internal viewer, and the control
     plane stamps the root administrator as `member:admin`, which reaches the
     branch below and is answered positionally like any other member.
     NOTHING ELSE MOVES: not the regex, not a `scope` value, not a gate
     predicate. A consumer reading `sql`/`args`/`viewer`/`scope` is untouched. */
  const memberId = m[3] || null;
  if (!memberId) return { sql: `${GATE_MARK} 1=1`, args: [], viewer: v, scope: "member", member: null };

  return {
    member: memberId,
    sql: `${GATE_MARK} (b.object_type <> 'project' OR EXISTS (
             SELECT 1 FROM project_participants pp
             WHERE pp.project_id = b.bundle_id AND pp.member_id = ?)
           OR EXISTS (
             SELECT 1 FROM members am
             WHERE am.member_id = ? AND am.role = 'admin' AND am.status = 'active'))`,
    args: [memberId, memberId],
    viewer: v, scope: "participant",
  };
}

/* ---- S-10 step 2: the text surface ----
 *
 * What is indexed is what the group WROTE and what the frontmatter SAYS:
 *
 *   title      the frontmatter title, so `title:sewer` can scope to it
 *   locator    source.locator, searchable by Bob's decision. Searching is
 *   authority  source.authority, likewise. The citation surface is part of
 *              what a researcher mines, not a field held back from them.
 *   meta       every frontmatter key and scalar value, flattened. This is how
 *              the per-schema tail becomes searchable free text without a
 *              column per schema version.
 *   body       the prose of bundle.md plus every other INLINE text document in
 *              the bundle.
 *
 * Registered captures are deliberately absent. They live in R2 as bytes the
 * Durable Object never holds, so there is nothing here to index; indexing
 * capture text is its own question with its own cost curve and is not this.
 *
 * JSON data files are excluded from `body` on purpose. They are machine
 * records whose keys would flood the term statistics bm25 depends on, and a
 * gathering queue carries member-typed URLs that belong to intake rather than
 * to the searchable document. Their frontmatter-facing values still reach the
 * index through `meta` where they are part of the bundle's metadata.
 */
const TEXT_PATHS = /\.(md|txt)$/i;
const TEXT_CAP = 128 * 1024;   // per column, so one large bundle cannot make a write unbounded

export function textOf(bundleId, files) {
  const list = (files || []).map((f) => ({ path: f.path, text: typeof f.text === "string" ? f.text : (typeof f.content === "string" ? f.content : null) }));
  const md = list.find((f) => f.path === "bundle.md");
  let fm = null, prose = "";
  if (md && md.text !== null) {
    let p = null;
    try { p = parseFrontmatter(md.text); } catch { p = null; }
    fm = p?.data ?? null;
    prose = typeof p?.body === "string" ? p.body : md.text;
  }
  const bits = [];
  const walk = (v) => {
    if (v === null || v === undefined) return;
    if (Array.isArray(v)) { for (const x of v) walk(x); return; }
    if (typeof v === "object") { for (const [k, val] of Object.entries(v)) { bits.push(k); walk(val); } return; }
    bits.push(String(v));
  };
  walk(fm);
  const others = list
    .filter((f) => f.path !== "bundle.md" && f.text !== null && TEXT_PATHS.test(f.path))
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const cap = (s) => String(s ?? "").slice(0, TEXT_CAP);
  const nested = (block, key) => {
    const b = fm && typeof fm === "object" ? fm[block] : null;
    return b && typeof b === "object" && !Array.isArray(b) && b[key] != null ? String(b[key]) : "";
  };
  return {
    title: cap(fm && fm.title != null ? String(fm.title) : ""),
    body: cap([prose, ...others.map((f) => f.path + "\n" + f.text)].join("\n\n")),
    /* The identifier is folded into `meta` so pasting a bundle id into the
       search bar finds the bundle, which is the first thing anyone tries. */
    meta: cap([String(bundleId), ...bits].join(" ")),
    locator: cap(nested("source", "locator")),
    authority: cap(nested("source", "authority")),
  };
}

/* ---------------------------------------------------------------------------
 * Tokenizer
 * ------------------------------------------------------------------------- */

const OPERATORS = { AND: "and", OR: "or", NOT: "not" };

function tokenize(input) {
  const src = String(input ?? "");
  const out = [];
  let i = 0;
  const isSpace = (c) => c === " " || c === "\t" || c === "\n" || c === "\r";
  /* Read a value: a quoted run, or a bare run ended by whitespace, a paren, or
     A QUOTE.

     D-228 / REC-68, 2026-08-08, and the quote in that terminator set is the
     whole fix. It used to read `!isSpace && "(" && ")"`, which meant the bare
     reader SWALLOWED an opening quote instead of stopping in front of it — so
     `state:"open"` came back as the single bare run `state:"open"` and the
     value kept its quote characters all the way into the bound argument. Every
     consequence below follows from this one line, which is why the defect was
     language-wide rather than a property of any field. */
  const readValue = () => {
    if (src[i] === '"') {
      i++;
      let s = "";
      while (i < src.length && src[i] !== '"') s += src[i++];
      i++; // closing quote, or end of input, which is tolerated rather than refused
      return { text: s, quoted: true };
    }
    let s = "";
    while (i < src.length && !isSpace(src[i]) && src[i] !== "(" && src[i] !== ")" && src[i] !== '"') s += src[i++];
    return { text: s, quoted: false };
  };
  while (i < src.length) {
    const c = src[i];
    if (isSpace(c)) { i++; continue; }
    if (c === "(") { out.push({ k: "(" }); i++; continue; }
    if (c === ")") { out.push({ k: ")" }); i++; continue; }
    /* A leading minus is negation, the shorthand every search box has. `-` on
       its own is not negation of nothing; it is discarded. */
    if (c === "-" && i + 1 < src.length && !isSpace(src[i + 1])) { out.push({ k: "not" }); i++; continue; }
    const first = readValue();
    /* field:value, where the value may itself be quoted or carry a comparison. */
    if (!first.quoted && first.text.includes(":")) {
      const at = first.text.indexOf(":");
      const field = first.text.slice(0, at);
      let rest = first.text.slice(at + 1);
      /* `field:"two words"` splits at the quote, so read the rest of the value
         properly rather than truncating it at the space.

         WHY THIS BRANCH HAD NEVER RUN, because the mechanism is the finding
         (D-228, REC-68). It used to be guarded by `rest === "" && src[i] === '"'`,
         and that conjunction is UNSATISFIABLE against the reader that produces
         its inputs. The bare reader stopped only at whitespace or a paren, so
         after it returns, `src[i]` is whitespace, a paren, or undefined — never
         a quote. And a quote right after the colon was CONSUMED rather than
         stopped at, so `rest` began with `"` and was never empty. The two halves
         each falsified the other. The rewind the old line performed
         (`i = start + at + 1`) existed to undo that over-consumption; now that
         the reader stops in front of the quote there is nothing to undo, and its
         absence is what makes the branch reachable at all.

         GENERALISED past the shape the old comment named, because a comparison
         lead is the spelling a member reaches for next: `created:>"2026-01-01"`
         and `fm:a.b="c"` leave a non-empty `rest` in front of the quoted run,
         and refusing them would have fixed the documented case while leaving its
         nearest neighbours broken. `quoted` stays true only when the quoted run
         IS the whole value — a value with an operator glued to its front was
         not typed as one quoted string, and `textAtom` reads that flag to
         decide whether a trailing `*` is the prefix operator or a literal star
         the member put inside their quotes. *(It also used to drive a `phrase`
         field on the atom; that field was computed for no reader at all and is
         gone — D-255. `quoted` still has this job, which is why it stays.)*

         A VALUE IS READ TO ITS END, in as many pieces as it takes, rather than
         in a fixed two or three. The first draft of this fix took one bare
         piece plus one quoted run and documented the remainder as a known
         limit — `fm:"a.b"="c"` kept `a.b=` and let `c` fall out as a separate
         free-text term, which is a value SILENTLY TRUNCATED into a query that
         still matches things. That is the shape this whole item exists to
         remove, so a stated limit was the wrong answer to it: the loop below
         costs one line more and leaves nothing to state. It terminates because
         every branch of `readValue` advances `i` by at least one character,
         and the cursor is re-tested against the same terminators the bare
         reader uses.

         IT TERMINATES, AND THE ARGUMENT IS WRITTEN DOWN RATHER THAN GUARDED.
         The first draft carried an `if (i === before) break;` as a belt against
         a non-advancing read. THAT GUARD WAS UNREACHABLE — measured, by the
         same coverage sweep that measured D-228 — and shipping a new
         unreachable defence inside the fix for an unreachable defence is the
         one thing this item may not do. So it is gone, and the proof is here
         instead. On entry to the body: `i < src.length`, and `src[i]` is not
         whitespace and not a paren. If it is a quote, `readValue` consumes the
         opening quote and advances at least one. If it is not, the bare
         reader's own condition holds for that character, so it consumes at
         least one. Every iteration advances `i`. */
      if (src[i] === '"') {
        let pieces = 0, onlyQuoted = rest === "";
        while (i < src.length && !isSpace(src[i]) && src[i] !== "(" && src[i] !== ")") {
          const piece = readValue();
          rest += piece.text;
          pieces++;
          if (!piece.quoted) onlyQuoted = false;
        }
        /* `quoted` says the value IS one quoted run and nothing else, which is
           what `textAtom` reads to decide whether a trailing `*` is the prefix
           operator or a literal star. A value with a comparison lead or a
           second piece glued on was not typed as one quoted string. */
        out.push({ k: "sel", field, value: rest, quoted: onlyQuoted && pieces === 1 });
        continue;
      }
      out.push({ k: "sel", field, value: rest, quoted: false });
      continue;
    }
    if (!first.quoted && OPERATORS[first.text.toUpperCase()] && first.text === first.text.toUpperCase()) {
      out.push({ k: OPERATORS[first.text.toUpperCase()] });
      continue;
    }
    if (first.text !== "") out.push({ k: "term", value: first.text, quoted: first.quoted });
  }
  return out;
}

/* ---------------------------------------------------------------------------
 * Parser: OR binds loosest, then AND, then unary NOT, then a primary.
 * Adjacent atoms with no operator between them take `implicitOp`, which is AND
 * for a member's query and OR only when the surface re-runs a zero-result query
 * to offer the wider reading.
 * ------------------------------------------------------------------------- */

function parseTokens(tokens, implicitOp, ctx) {
  let p = 0;
  const peek = () => tokens[p];
  const eat = () => tokens[p++];

  const primary = () => {
    const t = peek();
    if (!t) return null;
    if (t.k === "(") {
      eat();
      const e = orExpr();
      if (peek()?.k === ")") eat();
      else ctx.warnings.push("unclosed parenthesis; read to the end of the query");
      return e;
    }
    if (t.k === ")") return null;
    if (t.k === "and" || t.k === "or") { eat(); return primary(); } // a dangling operator is noise
    if (t.k === "not") { eat(); const k = unary(); return k ? { op: "not", kid: k } : null; }
    if (t.k === "term") { eat(); return textAtom(null, t.value, t.quoted, ctx); }
    if (t.k === "sel") { eat(); return selector(t, ctx); }
    eat();
    return null;
  };
  const unary = () => primary();
  const andExpr = () => {
    const kids = [];
    for (;;) {
      const t = peek();
      if (!t || t.k === ")") break;
      if (t.k === "or") break;
      if (t.k === "and") { eat(); continue; }
      const k = unary();
      if (k) kids.push(k);
      else if (!peek() || peek()?.k === ")") break;
    }
    if (!kids.length) return null;
    if (kids.length === 1) return kids[0];
    return { op: implicitOp, kids };
  };
  const orExpr = () => {
    const kids = [];
    for (;;) {
      const k = andExpr();
      if (k) kids.push(k);
      if (peek()?.k === "or") { eat(); continue; }
      break;
    }
    if (!kids.length) return null;
    if (kids.length === 1) return kids[0];
    return { op: "or", kids };
  };
  const ast = orExpr();
  return ast;
}

/* A free-text atom. `column` restricts it to one FTS column; null matches every
   column, which is what a bare word should do. A trailing star is a prefix
   match, the affordance that stands in for a stemmer.

   THERE IS NO `phrase` FIELD, AND ITS ABSENCE IS THE POINT (D-255). This atom
   used to carry `phrase: quoted && /\s/.test(v)`, and NOTHING EVER READ IT —
   one write site, zero read sites, measured twice: textually across the whole
   repository, and behaviourally by `test/fieldread.control.mjs`, which wraps
   every object this module builds in a recording Proxy and reports the fields
   nothing ever asks for. A name that tells a reader something is handled, with
   nothing behind it, is the same family as D-228 one layer along.

   WHAT ACTUALLY PERFORMS PHRASE MATCHING, since the name was the only thing
   claiming otherwise: FTS5 itself. `ftsAtom` compiles every text atom to the
   string literal `ftsLiteral(value)`, and FTS5 treats a multi-word string
   literal AS a phrase. A flag on the atom could only have changed that by
   changing what `ftsAtom` emits, and nothing asked it to. If a surface ever
   needs to tell a phrase from a conjunction in an envelope it publishes, the
   answer is to give that distinction a READER — not to re-add a field that
   computes it for nobody. */
function textAtom(column, value, quoted, ctx) {
  let v = value;
  let prefix = false;
  if (!quoted && v.endsWith("*") && v.length > 1) { prefix = true; v = v.slice(0, -1); }
  if (v === "") return null;
  /* Punctuation on its own indexes to nothing, so an FTS5 literal built from it
     matches no row and would silently empty the result of an otherwise good
     query. A stray dash or bracket is noise the member did not mean as a term. */
  if (!/[\p{L}\p{N}]/u.test(v)) return null;
  const atom = { op: "text", column, value: v, prefix };
  ctx.textAtoms.push(atom);
  return atom;
}

const CMP = [[">=", ">="], ["<=", "<="], [">", ">"], ["<", "<"]];

function selector(tok, ctx) {
  const name = tok.field.toLowerCase();
  /* `has:field` asks whether a field carries any value at all, which is the
     question a member actually has about a sparse column. */
  if (name === "has") {
    const v = String(tok.value).toLowerCase();
    /* `has:leg` asks whether the bundle carries ANY row in the meaning table —
       "every inquiry that rests on anything", which is a different question
       from `legs:>0` on the projected count and is the one that survives a
       projection that has not been rewritten. */
    if (v in MEANING) return { op: "meaning", arm: v, col: null, cmp: "present", value: null };
    const f = FIELDS[v];
    if (!f) { ctx.warnings.push(`has: unknown field ${JSON.stringify(tok.value)}`); return null; }
    return { op: "meta", col: f.col, cmp: "present", value: null };
  }
  /* `sort:` is a directive, not a predicate. Consumed here so it never becomes
     part of the boolean and never reaches a WHERE clause. */
  if (name === "sort") { applySort(tok.value, ctx); return null; }
  /* `text:` forces free text even where a field of the same name exists. */
  if (name === "text") return textAtom(null, tok.value, tok.quoted, ctx);
  /* `fm:<path>` reaches the per-schema tail through json_extract. The path is
     bounded to identifier characters so it cannot carry SQL, and it is passed
     as an ARGUMENT rather than interpolated. */
  if (name === "fm") {
    const at = tok.value.indexOf("=");
    const path = at < 0 ? tok.value : tok.value.slice(0, at);
    const val = at < 0 ? null : tok.value.slice(at + 1);
    if (!/^[A-Za-z0-9_.[\]]{1,120}$/.test(path)) {
      ctx.warnings.push(`fm: path ${JSON.stringify(path)} is not a frontmatter path`);
      return null;
    }
    return val === null
      ? { op: "meta", json: "$." + path, cmp: "present", value: null }
      : { op: "meta", json: "$." + path, cmp: "=", value: val };
  }
  /* The meaning arms. Placed BEFORE the field registry lookup so an arm name can
     never be shadowed by a projected column, and after the directives so `sort:`
     and `text:` keep their meaning. */
  if (name in MEANING) return meaningAtom(name, tok, ctx);
  const f = FIELDS[name];
  if (!f) {
    /* An unknown selector is treated as free text rather than refused. A member
       typing `sewer:fund` meant to search, and answering "no such field" for a
       string that is obviously a search is the control feeling broken. The
       warning still says what happened. */
    ctx.warnings.push(`unknown field ${JSON.stringify(tok.field)}; read as free text`);
    return textAtom(null, `${tok.field} ${tok.value}`.trim(), true, ctx);
  }
  let raw = String(tok.value);
  /* The type renames (normalisation site 4 of 4, REC-10): the projection
     stores canonical types only, so the legacy spellings `problem` and
     `focus` are honoured as filter values THROUGH THE CATALOG'S OWN MAP
     rather than restated here or answered with an empty page. The deliberate
     carve-out stands: schema stamps are document truth and are NOT mapped. */
  if (f.col === "object_type") raw = normalizeType(raw.toLowerCase());
  /* Comparisons and ranges are metadata predicates on every field, including the
     free-text ones: `created:>2026-01-01` is an ordering question and MATCH
     cannot answer it. */
  const range = raw.split("..");
  if (range.length === 2 && range[0] !== "" && range[1] !== "" && (f.type === "time" || f.type === "number")) {
    return { op: "and", kids: [
      { op: "meta", col: f.col, cmp: ">=", value: coerce(f, range[0]) },
      { op: "meta", col: f.col, cmp: "<=", value: coerce(f, range[1]) },
    ] };
  }
  for (const [lead, cmp] of CMP)
    if (raw.startsWith(lead)) return { op: "meta", col: f.col, cmp, value: coerce(f, raw.slice(lead.length)) };
  if (raw === "" || raw === "*") return { op: "meta", col: f.col, cmp: "present", value: null };
  /* A free-text field is column-scoped MATCH, not equality. Nobody types a whole
     title, so equality on a title is a control that never answers. An
     enumeration is equality, which is what keeps it an indexed seek. */
  if (f.fts) return textAtom(f.fts, raw, tok.quoted, ctx);
  return { op: "meta", col: f.col, cmp: "=", value: coerce(f, raw) };
}

/* One meaning selector into one node. `field:value` where the value may be a
   bare vocabulary word (`leg:hunch`), a qualified sub-field (`leg:role=cuts_against`),
   a comparison (`resolves:>=B`), or a presence test (`leg:ground=*`).
   THE COLUMN NEVER COMES FROM THE MEMBER'S STRING — it is read out of the
   registry above by name, and the VALUE is bound as an argument, so the same
   two properties the rest of this compiler has are the ones this arm has. */
function meaningAtom(arm, tok, ctx) {
  const m = MEANING[arm];
  let raw = String(tok.value);
  let subName = null;
  /* ---------------------------------------------------------------------
   * REC-90 — A NAMED SUB-FIELD COMPARED, `leg:grade>=B`, WHICH HAS NEVER
   * COMPILED AND HAS NEVER SAID SO.
   *
   * MEASURED ON `origin/main` AT 6e88e35, BEFORE THIS ITEM CHANGED ANYTHING:
   * `leg:grade>=B` compiles to `grade = 'GRADE>=B'`, `resolves:grade<=B` to
   * `grade = 'GRADE<=B'` — equality against a string no row can hold, with NO
   * warning. The cause is one line: the sub-field split was `indexOf("=")`, and
   * `>=` CONTAINS an `=`, so the left side came out as `grade>` — not a
   * sub-field, and not an identifier either, so it fell past the warning arm
   * that exists for exactly this, and the whole string went to the bare-word
   * index and then to the arm's default sub-field. The unqualified spellings
   * (`resolves:>=B`) always worked, which is why this survived: the comparison
   * reads as supported because it IS, on the bare field only.
   *
   * IT IS A DEFECT OF THE WORST DIRECTION THIS SURFACE HAS. `meaningAtom`'s own
   * comments twice choose to DROP an arm with a warning rather than compile one
   * that matches nothing, because "a dropped arm WIDENS the answer, which a
   * member sees; an arm that matches nothing NARROWS it, and on the question
   * this surface exists for — outstanding hunch debt — narrowing silently is the
   * answer 'you have none'." This path did the forbidden thing, silently, for
   * every named sub-field on every arm.
   *
   * REC-90 MET IT BECAUSE THE DESIGN'S OWN WORKED EXAMPLE NEEDS IT:
   * `CONTENT-SEARCH-DESIGN.md` §4.2 spells *every OCR'd region below cap C* as
   * `content:chain=ocr content:cap<C`, and `cap<C` is a named sub-field with a
   * comparison. So this is corrected rather than routed — the arm this item
   * builds cannot answer its own design without it.
   *
   * CONSERVATIVE BY CONSTRUCTION: the qualified form is taken ONLY when the
   * name on the left IS a sub-field of this arm. Anything else falls through to
   * the untouched `=` logic below, so no spelling that compiled before compiles
   * differently now — `concerns:ENT<1` is still a bare entity value and not a
   * refusal, which is the over-strictness arm of this item's control.
   * ------------------------------------------------------------------- */
  let subCmp = null;
  const qual = /^([A-Za-z_]{1,32})(>=|<=|>|<)([\s\S]*)$/.exec(raw);
  if (qual && Object.prototype.hasOwnProperty.call(m.sub, qual[1].toLowerCase())) {
    subName = qual[1].toLowerCase(); subCmp = qual[2]; raw = qual[3];
    if (raw === "") {
      /* A comparison against nothing. DROPPED WITH A WARNING, in the visible
         direction this function already chose twice: compiling it would be a
         predicate no row satisfies, which is the silent narrowing above. */
      ctx.warnings.push(`${arm}: ${JSON.stringify(String(tok.value))} compares ${subName} against nothing`);
      return null;
    }
  }
  const eq = subName ? -1 : raw.indexOf("=");
  if (eq > 0) {
    const lhs = raw.slice(0, eq).toLowerCase();
    if (lhs in m.sub) { subName = lhs; raw = raw.slice(eq + 1); }
    else if (/^[a-z_]{1,32}$/.test(lhs)) {
      /* DROPPED with a warning rather than compiled to a predicate that matches
         nothing, and the direction is chosen rather than inherited. A dropped
         arm WIDENS the answer, which a member sees; an arm that matches nothing
         NARROWS it, and on the question this surface exists for — outstanding
         hunch debt — narrowing silently is the answer "you have none". The
         failure that overclaims coverage is the one this item was raised to
         close, so the arm fails in the visible direction. Same shape as `has:`
         above, for the same reason. */
      ctx.warnings.push(`${arm}: unknown sub-field ${JSON.stringify(lhs)}; known: ${Object.keys(m.sub).join(", ")}`);
      return null;
    }
  }
  /* A bare word finds its own column through the DRIVEN index; anything the
     vocabulary does not claim falls to the arm's declared bare sub-field, which
     is what makes `leg:hunch`, `leg:A` and `concerns:ENT-1` all read naturally
     without a member learning three spellings. */
  if (!subName) {
    const claims = bareIndex(arm).get(raw.toLowerCase());
    if (claims && claims.length > 1) {
      /* Two honest readings, so the member is told rather than guessed at. Same
         visible direction as the unknown sub-field above: the arm is dropped,
         which widens, rather than compiled to one reading, which would answer
         confidently and wrongly. */
      ctx.warnings.push(`${arm}: ${JSON.stringify(raw)} is both ${claims.join(" and ")}; `
        + `say ${claims.map((c) => `${arm}:${c}=${raw}`).join(" or ")}`);
      return null;
    }
    subName = (claims && claims[0]) || m.bare;
  }
  const sub = m.sub[subName];
  /* ---------------------------------------------------------------------
   * REC-92 — AN FTS SUB-FIELD IS NOT A COLUMN COMPARISON, and it returns here
   * rather than falling through the four arms below, every one of which
   * assumes the member's string is a VALUE to bind against a column.
   *
   * IT REUSES `textAtom` AND `ftsAtom` RATHER THAN RE-IMPLEMENTING THEM. That
   * is what makes `passage:"budget shortfall"` a phrase and `passage:water*` a
   * prefix without a member learning a second grammar, and it is the only
   * place escaping could have been got wrong twice.
   *
   * THE THROWAWAY `textAtoms` SINK IS DELIBERATE AND IS NOT A LEAK. `textAtom`
   * pushes onto `ctx.textAtoms`, which feeds `rankExpr` — the BUNDLE-level
   * bm25 score and the BUNDLE-level `snippet` over `bundles_fts`. A passage
   * term must not reach either: it is a term over a DIFFERENT FTS table, and
   * scoring a bundle by it would rank the group's notes by words that appear
   * only inside a captured PDF. So the atom is built into a sink that is
   * discarded and the expression is recorded on `ctx.passageTerms` instead,
   * which is the row projection's input and nothing else's.
   * ------------------------------------------------------------------- */
  if (sub && sub.fts) {
    /* A COMPARISON AGAINST A TEXT INDEX HAS NO MEANING, and the arm is DROPPED
       WITH A WARNING rather than compiled — the visible direction this function
       chooses everywhere else. `passage:foo>=bar` cannot be answered by an FTS5
       MATCH, and compiling it to one anyway would answer a question the member
       did not ask. */
    if (subCmp) {
      ctx.warnings.push(`${arm}: ${JSON.stringify(String(tok.value))} compares a full-text field; `
        + `${arm}: matches text and does not order it`);
      return null;
    }
    /* `passage:*` — HAS THIS DOCUMENT ANY INDEXED TEXT AT ALL. It falls to the
       ordinary presence arm on purpose: it is a real member question ("which
       documents in scope are searchable at passage grain"), it needs no MATCH,
       and answering it through the same path every other arm's presence test
       uses means it cannot drift. There is no term, so there is no snippet and
       the answer says so rather than publishing an empty one. */
    if (raw === "" || raw === "*") {
      ctx.meaningArms.push({ arm, field: subName, column: sub.col });
      return { op: "meaning", arm, field: subName, col: sub.col, cmp: "present", value: null };
    }
    /* THE ARM IS RECORDED ONLY IF IT COMPILES, AND THE SUITE FOUND THIS.
       `ctx.meaningArms` is *which meaning arms this query COMPILED* — the list
       that lets a caller tell an arm that compiled from a string that quietly
       degraded to free text. The first draft of this branch pushed before
       checking the term, so a DROPPED `passage:---` was reported as a compiled
       arm: the record claiming it had answered a question it had in fact
       widened past, which is the wrong direction for exactly the list that
       exists to catch that. */
    const atom = textAtom(null, raw, !!tok.quoted, { textAtoms: [] });
    if (!atom) {
      /* `textAtom` refuses a term with no letter or digit in it, because an
         FTS5 literal built from punctuation matches no row and would silently
         empty an otherwise good query. Dropped and SAID, which widens. */
      ctx.warnings.push(`${arm}: ${JSON.stringify(raw)} has no word in it to match`);
      return null;
    }
    ctx.meaningArms.push({ arm, field: subName, column: sub.col });
    const expr = ftsAtom(atom);
    ctx.passageTerms.push(expr);
    return { op: "meaning", arm, field: subName, col: sub.col, cmp: "match", value: atom.value,
             fts: expr };
  }
  /* RECORDED, so the caller and the suite can tell an arm that COMPILED from a
     string that quietly degraded to free text. `unknown field "leg"` and a set
     arm over inquiry_basis produce very different answers and looked identical
     from outside until this list existed. */
  ctx.meaningArms.push({ arm, field: subName, column: sub.col });
  const norm = (x) => sub.case === "upper" ? String(x).toUpperCase()
                    : sub.case === "lower" ? String(x).toLowerCase() : String(x);
  /* REC-90: the node carries the SUB-FIELD's NAME as well as its column, because
     a sub-field that owns its own predicate (`sub.pred`) has to be found again
     at SQL time and a column name does not identify one — `content:cited` and a
     hypothetical second sub-field over `content_id` would be the same column and
     different questions. The column stays on the node because the ordinary path
     and the `present` arm still read it. */
  /* REC-90: the qualified comparison resolved at the head of this function. It
     returns BEFORE the presence and bare-comparison arms because its operator is
     already known — re-deriving it from a string whose operator has been sliced
     off is how the split above went wrong in the first place. */
  if (subCmp) return { op: "meaning", arm, field: subName, col: sub.col, cmp: subCmp, value: norm(raw) };
  if (raw === "" || raw === "*")
    return { op: "meaning", arm, field: subName, col: sub.col, cmp: "present", value: null };
  for (const [lead, cmp] of CMP)
    if (raw.startsWith(lead))
      return { op: "meaning", arm, field: subName, col: sub.col, cmp, value: norm(raw.slice(lead.length)) };
  return { op: "meaning", arm, field: subName, col: sub.col, cmp: "=", value: norm(raw) };
}

function coerce(f, v) {
  if (f.type === "number") { const n = Number(v); return Number.isFinite(n) ? n : v; }
  if (f.type === "bool") return /^(1|true|yes|y|on)$/i.test(v) ? 1 : /^(0|false|no|n|off)$/i.test(v) ? 0 : v;
  /* `upper` is `lower`'s twin and exists for the same reason: normalise the
     ARGUMENT so the column's index survives the comparison. Grades are stored
     as the record writes them (A..D), so a member typing `capture:b` must be
     answered rather than told nothing matched (REC-12). */
  return f.lower ? String(v).toLowerCase() : f.upper ? String(v).toUpperCase() : String(v);
}

function applySort(spec, ctx) {
  let s = String(spec || "");
  let dir = null;
  if (s.startsWith("-")) { dir = "DESC"; s = s.slice(1); }
  const [name, tail] = s.split(":");
  if (tail) dir = /^d/i.test(tail) ? "DESC" : "ASC";
  const key = String(name || "").toLowerCase();
  if (!(key in SORTABLE)) { ctx.warnings.push(`sort: unknown field ${JSON.stringify(name)}`); return; }
  ctx.sort = { field: key, dir: dir || (key === "relevance" ? "ASC" : "DESC") };
}

/* ---------------------------------------------------------------------------
 * FTS5 expression building.
 *
 * A subtree made entirely of text atoms compiles to ONE MATCH rather than a set
 * intersection per word, because that is the case FTS5 is built for and it is
 * the commonest query there is: a bare multi-word string. Set algebra is used
 * only where the tree genuinely mixes text with metadata, which MATCH cannot
 * express because it only knows the text table.
 * ------------------------------------------------------------------------- */

const ftsLiteral = (s) => `"${String(s).replace(/"/g, '""')}"`;

function ftsAtom(a) {
  const lit = ftsLiteral(a.value) + (a.prefix ? "*" : "");
  return a.column ? `{${a.column}} : ${lit}` : lit;
}

/* Returns an FTS5 expression for a subtree that is pure text, or null. */
function ftsExpr(node) {
  if (!node) return null;
  if (node.op === "text") return ftsAtom(node);
  if (node.op === "not") return null; // a bare negation has no positive set to subtract from
  if (node.op === "or") {
    const parts = node.kids.map(ftsExpr);
    if (parts.some((x) => x === null)) return null;
    return "(" + parts.join(" OR ") + ")";
  }
  if (node.op === "and") {
    const pos = [], neg = [];
    for (const k of node.kids) {
      if (k.op === "not") { const e = ftsExpr(k.kid); if (e === null) return null; neg.push(e); }
      else { const e = ftsExpr(k); if (e === null) return null; pos.push(e); }
    }
    if (!pos.length) return null;
    /* FTS5's NOT is binary: `a NOT b` is "a and not b". Parenthesised on both
       sides so the compiled expression does not depend on FTS5's precedence. */
    let e = "(" + pos.join(" AND ") + ")";
    for (const n of neg) e = `(${e} NOT ${n})`;
    return e;
  }
  return null;
}

/* Every positive text atom in the tree, OR'd, is the expression relevance is
   computed from: bm25 should score the words the member asked for, and a
   negation contributes nothing to how well a row matches. */
function rankExpr(atoms) {
  const parts = rankAtomList(atoms);
  if (!parts.length) return null;
  return parts.length === 1 ? parts[0] : "(" + parts.join(" OR ") + ")";
}
/* The distinct positive atoms, each an FTS5 expression — the TERMS relevance weighs one by one. */
function rankAtomList(atoms) {
  const seen = new Set(), parts = [];
  for (const a of atoms) { const e = ftsAtom(a); if (!seen.has(e)) { seen.add(e); parts.push(e); } }
  return parts;
}

/* ---------------------------------------------------------------------------
 * D-447 — RELEVANCE IS COMPUTED OVER WHAT THE VIEWER CAN SEE, AND ONLY ITS ORDER IS PUBLISHED.
 *
 * WHAT WAS WRONG, measured at the op before this changed (`project-sight.test.mjs` §7, MEASUREMENTS M-for D-447):
 * the rank was `bm25(bundles_fts)`, and FTS5's bm25 reads the WHOLE index — its IDF counts every row holding a
 * term and its length norm averages every row, hidden projects' rows included. So a member watching their own results
 * could watch a project they were never invited to change (Membership v2 §7.9: *"Not its existence"*). Every visible
 * hit's published `score` moved when a hidden project was revised, and so did the ORDER — of the page, of select-all
 * `ids` (which carries no number at all) and of a query selection's members. Dropping the score alone would have left
 * the order leaking, so the order is what this computes over the viewer's set.
 *
 * THE FORMULA, every input one the viewer can see: for each distinct positive atom t,
 *   idf(t) = ln(1 + (N - n(t) + 0.5) / (n(t) + 0.5))   N, n(t) counted over `vis` — the rows THIS viewer's gate passes
 *   tf(t, d) = the phrase instances of t that FTS5's own `highlight()` marks in d, over every indexed column
 *   score(d) = -Σ_t idf(t) · tf·(k1+1) / (tf + k1),   k1 = 1.2 (FTS5's own)
 * Negated so ascending is best-first, the order `bm25()` had. TWO DEPARTURES FROM bm25, stated rather than hidden:
 *   - NO LENGTH NORMALISATION (b = 0). bm25's needs the average row length, which is a corpus statistic, and FTS5
 *     exposes no per-row token count to SQL; a length averaged over the viewer's rows would mean reading every
 *     visible row's text on every search. Saturation (k1) still stops a long row winning by repetition alone.
 *   - `ln(1 + …)` rather than FTS5's clamped `ln(…)`, so a term in most of the viewer's rows weighs little rather
 *     than a constant 1e-6 that erases the difference between terms.
 * MORE THAN `RANK_ATOMS_MAX` DISTINCT TERMS are weighed as ONE term (the OR of them all) — each term costs a MATCH
 * and a bound argument, and the statement's variable ceiling (D-36) is shared with the set and the gate. Said in
 * the answer's `warnings`, never silently.
 * NO SCORE IS PUBLISHED, EVEN THIS ONE (IC for D-447): a hit's place in `hits` IS the order, and it carries its snippet.
 * `snippet()` needs no statistics — FTS5 picks the fragment by the row's own phrase hits — and the §7 digest over
 * the whole answer is what says so, not this comment.
 * ------------------------------------------------------------------------- */
export const RANK_ATOMS_MAX = 8;
const K1 = 1.2;
function visibleBm25({ terms, gate }) {
  const parts = [], args = [];
  /* `vis` is the viewer's own index: every indexed row the gate passes. The gate is the ONE compiled predicate,
     interpolated (a use, not a mint — the mint-site count stays at three). */
  parts.push(`vis(fid) AS MATERIALIZED (SELECT b.fts_id FROM bundles b WHERE (${gate.sql}) AND b.fts_id IS NOT NULL)`);
  args.push(...gate.args);
  parts.push(`nvis(n) AS (SELECT count(*) FROM vis)`);
  const marks = (h) => `(length(${h}) - length(replace(${h}, char(1), '')))`;
  terms.forEach((e, i) => {
    parts.push(`df${i}(idf) AS (SELECT ln(1 + ((SELECT n FROM nvis) - count(*) + 0.5) / (count(*) + 0.5)) `
             + `FROM bundles_fts WHERE bundles_fts MATCH ? AND rowid IN (SELECT fid FROM vis))`);
    args.push(e);
    const hs = FTS_COLUMNS.map((_, c) => `highlight(bundles_fts, ${c}, char(1), '') AS h${c}`).join(", ");
    parts.push(`tf${i}(fid, tf) AS (SELECT fid, ${FTS_COLUMNS.map((_, c) => marks(`h${c}`)).join(" + ")} `
             + `FROM (SELECT rowid AS fid, ${hs} FROM bundles_fts WHERE bundles_fts MATCH ? AND rowid IN (SELECT fid FROM scope)))`);
    args.push(e);
  });
  const sum = terms.map((_, i) => `COALESCE((SELECT idf FROM df${i}) * tf${i}.tf * ${K1 + 1} / (tf${i}.tf + ${K1}), 0)`).join(" + ");
  const joins = terms.map((_, i) => ` LEFT JOIN tf${i} ON tf${i}.fid = s.fid`).join("");
  parts.push(`ranked(fid, score) AS (SELECT s.fid, -(${sum}) FROM scope s${joins})`);
  return { parts, args };
}

/* ---------------------------------------------------------------------------
 * Set compilation: text arms and metadata arms into one row-id set.
 *
 * SQLite's compound operators are all one precedence and associate left, so a
 * mixed INTERSECT/UNION/EXCEPT chain without parentheses means something other
 * than the tree. A compound operand is therefore always wrapped as
 * `SELECT fid FROM (...)`, which is the parenthesis SQLite does allow.
 * ------------------------------------------------------------------------- */

const ALL = `SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL`;

/* MEASURED: workerd refuses a compound SELECT of more than five terms
   ("too many terms in compound SELECT"), which is far below SQLite's documented
   default of 500. Six metadata filters, which is one ordinary pass over a filter
   sidebar, is enough to reach it. Found by the scale bench on 2026-07-25 while
   folding the facet counts into one statement, and it turned out to threaten the
   COMPILER rather than only the facets. Four per compound leaves headroom, and
   longer chains nest through a subquery, which is its own compound and starts the
   count again. */
const MAX_COMPOUND = 4;

function chain(op, parts) {
  if (!parts.length) return { sql: ALL, args: [], compound: false };
  if (parts.length === 1) return { sql: parts[0].sql, args: parts[0].args, compound: !!parts[0].compound };
  if (parts.length <= MAX_COMPOUND)
    return { sql: parts.map((p) => p.sql).join(` ${op} `), args: parts.flatMap((p) => p.args), compound: true };
  /* Grouped left to right, which preserves meaning for all three operators:
     INTERSECT and UNION are associative, and EXCEPT is left-associative, so
     (a EXCEPT b EXCEPT c) EXCEPT d is what an unwrapped chain would have meant. */
  const groups = [];
  for (let i = 0; i < parts.length; i += MAX_COMPOUND) groups.push(parts.slice(i, i + MAX_COMPOUND));
  return chain(op, groups.map((g) => {
    const c = chain(op, g);
    return { sql: c.compound ? `SELECT fid FROM (${c.sql})` : c.sql, args: c.args, compound: false };
  }));
}

function metaSql(node) {
  const lhs = node.json ? `json_extract(fm_json, ?)` : node.col;
  const args = node.json ? [node.json] : [];
  if (node.cmp === "present")
    return { sql: `SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL AND ${lhs} IS NOT NULL AND ${lhs} <> ''`,
             args: node.json ? [node.json, node.json] : [] };
  return { sql: `SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL AND ${lhs} ${node.cmp} ?`,
           args: [...args, node.value] };
}

/* A meaning arm, compiled to the SAME SHAPE every other leaf has: a set of
   `fts_id`. Three properties, and each one is load-bearing.
   1. IT KEYS ON `fts_id` THROUGH `bundles`, exactly as `ALL` and `metaSql` do.
      An arm that returned the meaning table's own key would not compose with
      any other arm, and a bundle with no text-index row would leak into a set
      that no other arm can produce.
   2. IT IS AN `IN` SUBQUERY, NOT A JOIN. A join emits one row per LEG, so an
      inquiry with four hunch legs would appear four times — harmless inside an
      INTERSECT, which dedupes, and WRONG as the only arm, where `hits` becomes
      `scope` and the page repeats the row. The set shape makes that
      unrepresentable rather than remembered.
   3. IT CARRIES NO GATE, deliberately. Every statement takes its WHERE from
      `viewerPredicate` and there is exactly one of those (D-15); an arm that
      filtered visibility itself would be the second compilation point the
      throw in `Store#runQuery` exists to make impossible. */
/* REC-90: 4. A SUB-FIELD MAY OWN ITS OWN PREDICATE, and only the shape changes —
   not the two properties above it. `sub.pred(cmp, value)` returns a
   PARAMETERISED fragment, or null to fall through to `column <cmp> ?`. The three
   arms that existed before this declare no `pred` and therefore compile through
   exactly the path they always did, which is what makes this additive rather
   than a rewrite of a surface other items build on.
   WHY IT IS NEEDED AT ALL: §4.2's `content:` questions are not all column
   comparisons — `minted` asks about a CLASS over a column, `chain` about the
   LAST ELEMENT of a stored chain, `cited` about whether any EDGE points here,
   and `cap` has a first-class UNDETERMINED that is `IS NULL` rather than a
   value. Each is written at its own sub-field with its own reason; none of them
   interpolates the member's string, which `content-arm.test.mjs` pins by
   compiling hostile values and asserting the SQL does not move. */
function meaningWhere(node) {
  const m = MEANING[node.arm];
  const sub = node.field ? m.sub[node.field] : null;
  /* REC-92 — THE FTS MATCH, and it is a `rowid IN (…)` rather than a join for
     `meaningSql`'s property 2 exactly: this fragment lands inside a subquery
     that must select a SET of `bundle_id`, and a join to the FTS table would
     emit one row per matching UNIT, so a document with forty matching pages
     would appear forty times. Harmless inside an INTERSECT, which dedupes, and
     wrong as the only arm. The set shape makes that unrepresentable.
     THE EXPRESSION IS A BOUND ARGUMENT. `node.fts` was built by `ftsAtom` from
     an escaped literal; it is never interpolated into the SQL, so the statement
     text is identical for every value a member can type. */
  if (node.cmp === "match" && typeof node.fts === "string")
    return { sql: `rowid IN (SELECT rowid FROM ${m.ftsTable} WHERE ${m.ftsTable} MATCH ?)`,
             args: [node.fts] };
  if (sub && typeof sub.pred === "function") {
    const p = sub.pred(node.cmp, node.value);
    if (p) return p;
  }
  if (node.cmp === "present")
    return node.col
      ? { sql: `${node.col} IS NOT NULL AND ${node.col} <> ''`, args: [] }
      : { sql: null, args: [] };
  return { sql: `${node.col} ${node.cmp} ?`, args: [node.value] };
}

function meaningSql(node) {
  const m = MEANING[node.arm];
  const w = meaningWhere(node);
  const inner = w.sql === null
    ? `SELECT ${m.key} FROM ${m.table}`
    : `SELECT ${m.key} FROM ${m.table} WHERE ${w.sql}`;
  return { sql: `SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL AND bundle_id IN (${inner})`,
           args: w.args, compound: false };
}

function setSql(node) {
  if (!node) return { sql: ALL, args: [], compound: false };
  /* Whole subtree expressible as text: one MATCH. */
  const fe = ftsExpr(node);
  if (fe !== null)
    return { sql: `SELECT rowid AS fid FROM bundles_fts WHERE bundles_fts MATCH ?`, args: [fe], compound: false };
  if (node.op === "meta") return { ...metaSql(node), compound: false };
  if (node.op === "meaning") return meaningSql(node);
  if (node.op === "text")
    return { sql: `SELECT rowid AS fid FROM bundles_fts WHERE bundles_fts MATCH ?`, args: [ftsAtom(node)], compound: false };
  if (node.op === "not") {
    /* Negation with nothing to subtract from is the complement of the corpus. */
    const inner = operand(setSql(node.kid));
    return { sql: `${ALL} EXCEPT ${inner.sql}`, args: inner.args, compound: true };
  }
  if (node.op === "or")
    return chain("UNION", node.kids.map((k) => operand(setSql(k))));
  if (node.op === "and") {
    const pos = node.kids.filter((k) => k.op !== "not");
    const neg = node.kids.filter((k) => k.op === "not").map((k) => k.kid);
    const posChain = chain("INTERSECT", (pos.length ? pos : [null]).map((k) => operand(setSql(k))));
    if (!neg.length) return posChain;
    /* The positive side is a compound in its own right when it had more than one
       arm, so it is wrapped before EXCEPT is applied to it. */
    const head = { sql: posChain.compound ? `SELECT fid FROM (${posChain.sql})` : posChain.sql,
                   args: posChain.args, compound: false };
    return chain("EXCEPT", [head, ...neg.map((n) => operand(setSql(n)))]);
  }
  return { sql: ALL, args: [], compound: false };
}

const operand = (s) => (s.compound ? { sql: `SELECT fid FROM (${s.sql})`, args: s.args } : { sql: s.sql, args: s.args });

/* ---------------------------------------------------------------------------
 * compile: the only entry point. Returns the parsed query plus the four
 * statements the surface runs, every one of which carries the viewer gate.
 * ------------------------------------------------------------------------- */

export const PROVENANCE_COLS = [
  "bundle_id", "object_type", "group_id", "title", "current_state", "prior_state",
  "created", "last_updated", "criticality", "bundle_sha",
  "schema_id", "produced_mode", "capability_tier", "source_locator",
  "source_authority", "source_retrieved", "source_status", "content_hash",
  "monitor_enabled", "monitor_frequency", "monitor_last_checked",
  "annotations_open", "reeval_flag", "reeval_since", "reeval_source",
];

export const LIMIT_DEFAULT = 50, LIMIT_MAX = 500, IDS_MAX = 50000;

/* PL-9: the meaning-grain shape's OWN bound, and it is a different number from
   the page's because it answers at a different grain. A page is one row per
   BUNDLE; this is one row per LEG or per RESOLUTION, so the same corpus produces
   several times the rows and a caller reading a whole project's bases would page
   the bundle ceiling many times over. 1000 keeps a project-sized basis reachable
   in a handful of requests while staying well inside the Durable Object's
   response budget. Named constants rather than literals so `bounds.test.mjs`'s
   roster walk finds this op the way it finds the others. */
export const MEANING_LIMIT_DEFAULT = 200, MEANING_LIMIT_MAX = 1000;

export function compile({ q = "", viewer = null, sort = null, dir = null,
                          limit = LIMIT_DEFAULT, offset = 0, ids = null,
                          facets = null, implicitOp = "and", snippetChars = 12,
                          rows = null, rowLimit = MEANING_LIMIT_DEFAULT, rowOffset = 0 } = {}) {
  /* REC-92: `passageTerms` is the FTS5 expression of every `passage:` selector
     this query compiled, kept APART from `textAtoms` because the two are terms
     over different FTS tables — see the note in `meaningAtom`. It is the input
     to the row projection's MATCH and `snippet()`, and to nothing else. */
  const ctx = { warnings: [], textAtoms: [], sort: null, meaningArms: [], passageTerms: [] };
  const ast = parseTokens(tokenize(q), implicitOp === "or" ? "or" : "and", ctx);
  /* An explicit sort parameter outranks a `sort:` token in the query string:
     the parameter is a header the member just clicked, the token is what they
     typed earlier. */
  if (sort && sort in SORTABLE) ctx.sort = { field: sort, dir: /^d/i.test(dir || "") ? "DESC" : dir ? "ASC" : (sort === "relevance" ? "ASC" : "DESC") };

  const gate = viewerPredicate(viewer);
  const rank = rankExpr(ctx.textAtoms);
  /* D-447: the terms relevance weighs, each over the viewer's own rows (`visibleBm25`). */
  const allTerms = rankAtomList(ctx.textAtoms);
  const rankTerms = allTerms.length <= RANK_ATOMS_MAX ? allTerms : (rank ? [rank] : []);
  if (allTerms.length > RANK_ATOMS_MAX)
    ctx.warnings.push(`relevance weighs these ${allTerms.length} terms as one: more than ${RANK_ATOMS_MAX} are not weighed separately`);
  /* REC-92 — the ONE expression the `rows=passage` projection matches and
     snippets on, OR'd over every `passage:` selector this query compiled.
     OR AND NOT AND, and that is a decision about what a member means rather
     than about SQL. The ARMS already intersected: `passage:water passage:main`
     selected the documents holding a unit matching EACH, which is the question
     the member asked at document grain. At UNIT grain, requiring one unit to
     match both would hide the case the pair was asked about — a document where
     one page says "water" and another says "main" would answer zero rows while
     the bundle-level answer said it matched, which is the two halves of one
     answer disagreeing in the direction that under-reports. OR lists the units
     that matched ANY of the terms, `snippet` centres on what that unit hit, and
     the arm's own INTERSECT has already done the narrowing at the grain where
     narrowing was asked for.
     NULL WHEN EMPTY, never an empty string: `""` is a valid FTS5 expression
     that matches nothing, and it would turn "no term to centre on" into "no
     passage matches" — the false absence this whole construct exists to
     refuse. */
  const passageMatch = ctx.passageTerms.length
    ? [...new Set(ctx.passageTerms)].join(" OR ") : null;
  /* ONE SPELLING OF *THIS PLAN MATCHES ON A PASSAGE TERM*, AND THE NEGATIVE
     CONTROL IS WHY IT EXISTS. `matched` on the published descriptor and the row
     builder's own `fts` are two readers of one fact, and the first draft wrote
     the expression twice. The `nomatch` arm then disabled the builder's copy and
     the answer went on publishing `matched: true` over rows that had NOT been
     matched — the envelope telling a member these are the passages that hit
     their term while the statement had returned every unit in scope. In the
     shipped code the two agreed, so nothing could have caught it except an arm
     that pulled them apart. One predicate, two callers. */
  const passageOn = (armName) =>
    !!(armName && MEANING[armName] && MEANING[armName].ftsTable && passageMatch);
  const set = setSql(ast);
  /* ---------------------------------------------------------------------
   * REC-92 / §4.4 — THE TALLY IS TAKEN OVER THE QUERY'S *OTHER* ARMS, AND
   * THAT PHRASE IN §4.4 IS LOAD-BEARING RATHER THAN INCIDENTAL.
   *
   * *…read off the observation log for the bundles the query's OTHER arms put
   * in scope.* The first draft of this item took the tally over the WHOLE
   * scope, which is the obvious reading and is useless in exactly the case the
   * tally exists for: the passage arm is itself part of the scope, so a query
   * that matched nothing had an EMPTY scope and therefore an empty tally — and
   * the answer said *0 hits over 0 captures*, which is the false absence this
   * mechanism was built to refuse, produced by the mechanism itself. §4.4's own
   * worked example is impossible under that reading: *0 hits over 412 indexed
   * captures* requires 412 captures to still be in scope AFTER the text arm
   * found nothing in them.
   *
   * CAUGHT BY THE SUITE AND NOT BY REVIEW. The tally was structurally correct,
   * gated correctly, summed correctly, and answered zero over a corpus the same
   * suite had just proved non-empty.
   *
   * SO THE TEXT ARM IS STRIPPED FROM THE TREE and the remaining arms are
   * re-compiled into a second `hits` set. Everything else is identical — same
   * gate, same `scope` shape, same bound — so the tally still cannot range
   * wider than a viewer may see. A query with NO other arms yields the whole
   * corpus, which is the honest denominator for *we searched everything and
   * found nothing*. */
  const stripMeaningArm = (node, arm) => {
    if (!node) return null;
    if (node.op === "meaning") return node.arm === arm ? null : node;
    if (node.op === "not") {
      const k = stripMeaningArm(node.kid, arm);
      return k ? { ...node, kid: k } : null;
    }
    if (Array.isArray(node.kids)) {
      const kids = node.kids.map((k) => stripMeaningArm(k, arm)).filter(Boolean);
      if (!kids.length) return null;
      return kids.length === 1 ? kids[0] : { ...node, kids };
    }
    return node;
  };
  const armSet = (arm) => setSql(stripMeaningArm(ast, arm));

  /* Whether the query is a bare implicit conjunction of more than one atom,
     which is the only case where offering the OR reading makes sense. */
  const widenable = implicitOp !== "or" && ast?.op === "and"
                 && Array.isArray(ast.kids) && ast.kids.length > 1;

  const lim = Math.max(1, Math.min(LIMIT_MAX, Math.floor(Number(limit) || LIMIT_DEFAULT)));
  const off = Math.max(0, Math.floor(Number(offset) || 0));
  /* The meaning shape's OWN bound, from its OWN input against its own ceiling —
     deliberately not the page's `limit` clamped a second way, because one number
     clamped against two ceilings is one number a caller cannot reason about. The
     cap PUBLISHED by the op is this one, after clamping and never the number
     asked for (REC-57). */
  const rowArm = typeof rows === "string" && rows.toLowerCase() in MEANING ? rows.toLowerCase() : null;
  const mLim = Math.max(1, Math.min(MEANING_LIMIT_MAX, Math.floor(Number(rowLimit) || MEANING_LIMIT_DEFAULT)));
  const mOff = Math.max(0, Math.floor(Number(rowOffset) || 0));

  /* One CTE prefix, shared by every statement. `scope` is the query intersected
     with what the viewer may see, so the gate bounds the page, the count, the
     facets, and select-all identically. There is no path to `hits` that does
     not go through `scope`. */
  const cte = (withRanked, overrideSet = null) => {
    /* An explicit id list is an ARM of the query, not a filter applied after it.
       Compiling it here is what keeps a stored selection on the same path as
       everything else: it passes the viewer gate, it obeys the sort, and it is
       executed by the one guarded executor. A selection resolved by any other
       route would be the second query path this design exists to prevent.
       The caller chunks the list; SQLite bounds how many variables one statement
       may bind, and a 10,000-item selection would exceed it. */
    const idArm = Array.isArray(ids) && ids.length
      ? { sql: `SELECT fts_id AS fid FROM bundles WHERE bundle_id IN (${ids.map(() => "?").join(",")})`, args: ids }
      : null;
    /* `picked` exists only when there IS an id restriction. The first version
       emitted a match-all CTE and intersected it unconditionally, which is a
       second full table scan buying nothing. */
    const use = overrideSet || set;
    const parts = [`hits(fid) AS (${use.sql})`];
    if (idArm) {
      parts.push(`picked(fid) AS (${idArm.sql})`);
      parts.push(`scope(fid) AS (SELECT fid FROM hits INTERSECT SELECT fid FROM picked)`);
    } else {
      parts.push(`scope(fid) AS (SELECT fid FROM hits)`);
    }
    const args = [...use.args, ...(idArm ? idArm.args : [])];
    if (withRanked && rank) {
      const r = visibleBm25({ terms: rankTerms, gate });
      parts.push(...r.parts);
      args.push(...r.args);
    }
    return { sql: "WITH " + parts.join(",\n     "), args };
  };

  /* ORDER BY. Relevance where relevance exists, last_updated otherwise, and in
     every case the declared id tiebreak, without which paging is wrong rather
     than untidy. NULLs last in both directions so a sparse column does not open
     on rows that have no value. */
  const sortField = ctx.sort?.field || (rank ? "relevance" : "updated");
  const sortDir = ctx.sort?.dir || (sortField === "relevance" ? "ASC" : "DESC");
  let order;
  if (sortField === "relevance" && rank) order = `COALESCE(r.score, 0) ${sortDir}, b.bundle_id ASC`;
  else if (sortField === "relevance") order = `b.last_updated DESC, b.bundle_id ASC`;
  else {
    const col = `b.${SORTABLE[sortField]}`;
    order = `(${col} IS NULL) ASC, ${col} ${sortDir}, b.bundle_id ASC`;
  }

  const cols = PROVENANCE_COLS.map((c) => `b.${c}`).join(", ");
  const joinRanked = rank ? ` LEFT JOIN ranked r ON r.fid = s.fid` : "";
  const page = () => {
    const c = cte(true);
    if (!rank)
      return { sql: `${c.sql}\nSELECT ${cols}, NULL AS snippet FROM scope s JOIN bundles b ON b.fts_id = s.fid${joinRanked}\n`
                  + `WHERE ${gate.sql}\nORDER BY ${order} LIMIT ? OFFSET ?`, args: [...c.args, ...gate.args, lim, off] };
    /* D-447: the snippet and NOT the score — the answer publishes the ORDER relevance produced, never its number.
       The snippet is cut for the PAGE's rows only, after the order and the LIMIT: `snippet()` re-reads a row's text,
       and cutting one for every match measured ~65 ms of a 2,000-match search (MEASUREMENTS M-121). It needs no
       statistics, so where it is cut changes nothing a viewer can compare. */
    const pcols = PROVENANCE_COLS.map((c2) => `p.${c2}`).join(", ");
    return { sql: `${c.sql}\nSELECT ${pcols}, (SELECT snippet(bundles_fts, -1, '[', ']', '\u2026', ?) FROM bundles_fts `
                + `WHERE bundles_fts MATCH ? AND rowid = p._fid) AS snippet\n`
                + `FROM (SELECT ${cols}, s.fid AS _fid, ROW_NUMBER() OVER (ORDER BY ${order}) AS _pos `
                + `FROM scope s JOIN bundles b ON b.fts_id = s.fid${joinRanked}\n`
                + `WHERE ${gate.sql}\nORDER BY ${order} LIMIT ? OFFSET ?) p\nORDER BY p._pos`,
             args: [...c.args, Math.max(4, Math.min(64, Math.floor(snippetChars))), rank, ...gate.args, lim, off] };
  };
  const count = () => {
    const c = cte(false);
    return { sql: `${c.sql}\nSELECT count(*) AS n FROM scope s JOIN bundles b ON b.fts_id = s.fid WHERE ${gate.sql}`,
             args: [...c.args, ...gate.args] };
  };
  /* Select-all: every id in the set in the presentation order, which is a
     different request from a page and is treated as one. Ordered identically so
     the set an operator selected is the set they were looking at. */
  const idsStmt = () => {
    const c = cte(true);
    return { sql: `${c.sql}\nSELECT b.bundle_id FROM scope s JOIN bundles b ON b.fts_id = s.fid${joinRanked}\n`
                + `WHERE ${gate.sql}\nORDER BY ${order} LIMIT ?`, args: [...c.args, ...gate.args, IDS_MAX] };
  };
  /* A selection snapshot needs the sha each item carried WHEN IT WAS SELECTED,
     because that is what makes revision drift detectable later as a comparison
     rather than a guess. Same order as the page, so the set an operator selected
     is the set they were looking at. */
  const snapshot = () => {
    const c = cte(true);
    return { sql: `${c.sql}\nSELECT b.bundle_id, b.bundle_sha FROM scope s JOIN bundles b ON b.fts_id = s.fid${joinRanked}\n`
                + `WHERE ${gate.sql}\nORDER BY ${order} LIMIT ?`, args: [...c.args, ...gate.args, IDS_MAX] };
  };
  const facetList = (Array.isArray(facets) && facets.length ? facets : DEFAULT_FACETS)
    .map((f) => String(f).toLowerCase()).filter((f) => f in FIELDS);
  /* ALL the facets in ONE statement. The first version ran one statement per
     field, so a six-facet sidebar rebuilt the scope six times and measured 283ms
     at 20,000 bundles. MATERIALIZED tells SQLite to compute the scope once and
     reuse it across the arms rather than inlining it into each. */
  /* Facet counts batched into as few statements as the compound limit allows,
     rather than one statement per field. One per field meant a six-facet sidebar
     rebuilt the same scope six times and measured 283ms at 20,000 bundles.
     MATERIALIZED tells SQLite to compute the scope once and reuse it across the
     arms instead of inlining it into each. */
  const facets_ = () => {
    if (!facetList.length) return [];
    const out = [];
    for (let i = 0; i < facetList.length; i += MAX_COMPOUND) {
      const group = facetList.slice(i, i + MAX_COMPOUND);
      const c = cte(false);
      const arms = group.map((name) => {
        const f = FIELDS[name];
        return `SELECT '${name}' AS field, b.${f.col} AS value, count(*) AS n\n`
             + `  FROM scope s JOIN bundles b ON b.fts_id = s.fid\n`
             + `  WHERE ${gate.sql} AND b.${f.col} IS NOT NULL GROUP BY b.${f.col}`;
      });
      out.push({ sql: `${c.sql.replace("hits(fid) AS (", "hits(fid) AS MATERIALIZED (")}\n`
                    + arms.join("\nUNION ALL\n") + `\nORDER BY field ASC, n DESC, value ASC`,
                 args: [...c.args, ...group.flatMap(() => gate.args)] });
    }
    return out;
  };

  /* -------------------------------------------------------------------------
   * THE SEVENTH STATEMENT SHAPE — D-222 option C, PL-9.
   *
   * Six shapes above answer at BUNDLE grain: `page`, `count`, `ids`, `snapshot`,
   * `facets`, `facetScan`. This one answers at MEANING grain, off the SAME
   * `scope` CTE, with the SAME gate, executed by the SAME guarded executor. It
   * is one shape with two projections — rows and their count — exactly as the
   * bundle grain is `page` and `count`, so `mode` selects the projection rather
   * than a second shape being registered beside this one.
   *
   * WHY THIS IS NOT A SECOND QUERY PATH, and it was not a free choice. The
   * comment at the `ids` arm above says a selection resolved by another route
   * "would be the second query path this design exists to prevent", and D-15
   * gives visibility exactly ONE compilation point enforced by the throw in
   * `Store#runQuery`. So option B was closed by a standing ruling. Everything
   * that makes this safe is inherited rather than rebuilt: `scope` is the same
   * set the page would have shown, `gate.sql` is the same predicate from the
   * same call to `viewerPredicate`, and NOTHING HERE MINTS A GATE — the count of
   * gate-marker mint sites in this module is pinned at three, all three inside
   * `viewerPredicate`, and this shape does not add a fourth. It INTERPOLATES the
   * compiled predicate, twice, which is a use and not a mint.
   *
   * AND THE PIN IS TEXT-ANCHORED, WHICH THIS COMMENT FOUND THE HARD WAY. Writing
   * the marker's template literal in prose here took the count to FOUR and made
   * both suites red against an explanatory comment — D-160's shape, met inside
   * the thing it guards. The prose says "gate-marker" instead; `meaningread`'s
   * own pin additionally counts over COMMENT-STRIPPED source, so the next reader
   * who writes it in a sentence gets a passing suite rather than a puzzle.
   *
   * REC-36'S STRICTER RULE, WHICH IS THE ONE THING THIS SHAPE ADDS.
   * §14c: a meaning-layer answer is a CANDIDATE LIST, and most reads redact a
   * back-reference while a candidate list WITHHOLDS THE WHOLE ROW — because even
   * a nameless candidate discloses that something bearing on the subject sits in
   * a project the viewer was not invited to. Two clauses carry it:
   *
   *   1. THE OWNING BUNDLE. The row reaches the answer only through `scope`
   *      JOINed to a `bundles` row that passes the gate. A row whose bundle the
   *      viewer may not see is ABSENT, never present with its `bundle_id`
   *      nulled. And `total` is counted through the same joins and the same
   *      predicate, so a total larger than the rows cannot arise: hidden and
   *      absent answer identically, and NO count of what was withheld is
   *      published, because that count is the leak.
   *
   *   2. A COLUMN NAMING ANOTHER BUNDLE (`inquiry_basis.target_id`). If that
   *      bundle EXISTS and the viewer may not see it, the whole row is withheld.
   *      A REDACTED target would say "this basis rests on something you may not
   *      know about", which is the disclosure the rule refuses.
   *
   * AND THE DELIBERATE DEPARTURE FROM `#bundleGate`, stated because it is a
   * departure rather than an oversight. That helper is fail-closed on a DANGLING
   * reference: a row naming a bundle that is GONE is withheld. Here a leg whose
   * target does not exist is RETURNED, with `target_present` saying so. On a
   * candidate list a dangling pointer is nothing to act on, so withholding costs
   * nothing; on a BASIS a leg pointing at a document the record no longer holds
   * IS THE DEBT, and hiding it would make the answer under-report — the silently
   * narrowed answer this whole item exists to remove. Visibility and existence
   * are different questions and only the first is a disclosure.
   * ---------------------------------------------------------------------- */
  const meaning = ({ mode = "rows" } = {}) => {
    if (!rowArm) return null;
    const m = MEANING[rowArm];
    const c = cte(false);
    const args = [...c.args, ...gate.args];
    /* Clause 2, one per column that names another bundle. `bundles b` inside the
       subquery is not a slip: `viewerPredicate` compiles over the alias `b`, and
       shadowing the outer alias is what binds the predicate to the REFERENCED
       bundle — the same construction `Store#bundleGate` uses and for the same
       reason. */
    /* REC-92: the ref clauses' arguments are collected SEPARATELY as well as
       pushed onto `args`, because the row projection now splices the snippet
       budget in ahead of the gate and can no longer reuse `args` wholesale.
       `args` itself is left exactly as it was so `count` and `levels` — and the
       three arms that predate this item — bind byte-identically. */
    let refSql = "";
    const refArgs = [];
    for (const col of m.refs) {
      refSql += `\n   AND (NOT EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = m.${col})`
              + `\n        OR EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = m.${col} AND (${gate.sql})))`;
      args.push(...gate.args);
      refArgs.push(...gate.args);
    }
    /* REC-90 — THE FOUR-LEVEL STATEMENT'S OWN PROJECTION, and it is a third mode
       on this one shape rather than a second read, for `count`'s reason exactly.
       CLAUDE.md: *absence at one level is not evidence of absence at the next —
       no meaning derived may mean nothing was extracted; nothing extracted may
       mean the document was never read; no document may mean nobody looked.
       Saying which of those is true is a first-class obligation.* An empty
       meaning-grain answer is the place that obligation bites hardest, because
       `content:` over a corpus of five hundred captured packets NOBODY HAS CITED
       returns zero rows and reads exactly like "these documents say nothing
       about it". Two counts are what separate the readings: how many documents
       the query's other arms put in scope at all, and how many of those hold ANY
       row of this arm's table. Both are taken through the SAME scope CTE and the
       SAME gate as the rows, so neither can report a document the viewer may not
       see — a tally that ranged wider than the answer would be REC-36's leak
       arriving as an instrument, which is the shape `store.mjs`'s own mint ratio
       was caught in and corrected to `#viewerSees`. */
    /* REC-115 / IC-115 — AND *THE QUERY'S OTHER ARMS* IN THE PARAGRAPH ABOVE IS
       LOAD-BEARING RATHER THAN DESCRIPTIVE, which is what this statement got
       wrong for the whole of its life. It built its scope from `c` — the FULL
       query, THIS ARM INCLUDED — while its own comment promised the other arms
       alone, so the comment described a constraint nothing enforced. The cost
       was not a wrong number in a corner: the arm SELECTS the documents that
       hold a matching row, so on a MISS the scope is empty by construction and
       `documents` collapses to 0 — and because `Store.#meaningLevels` tests
       `documents === 0` BEFORE `searchable === 0`, the two honest branches of
       `says` were UNREACHABLE BY ANY PASSAGE MISS AT ALL. A member who had
       searched two documents, one of them fully indexed, was told NO DOCUMENT
       WAS IN SCOPE and sent off to capture more material when what the record
       needed was for somebody to READ the capture nobody had read. That is the
       false absence this whole construct exists to refuse, produced by the
       construct itself for the second time and through the second statement —
       REC-92 found the first instance in the `axis` tally below, corrected THAT
       statement, and did not move this one with it (UI-62 measured it against
       the live plane at `MEASUREMENTS.md` M-43 and DELEGATED it rather than
       papering over it at the surface, which DEC-8 forbids).

       So the scope here is `armSet(rowArm)` — the query with this arm STRIPPED
       and the remaining arms re-compiled — EXACTLY as `mode:"axis"` builds its
       own thirty lines down. Both halves of one envelope now mean the same
       thing by *in scope*, which is the property that was actually missing; the
       two statements are deliberately not merged, because they count different
       things (documents here, captures there) over that one shared scope.

       TWO CONSEQUENCES WORTH STATING RATHER THAN LEAVING TO BE REDISCOVERED.
       (1) `documents_with_rows` only becomes a MEASUREMENT here: against the
       unstripped scope every document in scope held a matching row by
       construction, so `documents_with_rows === documents` cost nothing to
       produce and was evidence of nothing — CLAUDE.md's rule about an equality
       that costs nothing, sitting inside the honesty instrument itself.
       (2) THE TRUE ZERO SURVIVES AND MUST. A query whose OTHER arms select no
       document at all still reports `documents: 0` and still publishes the
       empty-DOCUMENT-level sentence; this narrows a FALSE zero and does not
       remove the true one. Driven both ways in `passage-arm.test.mjs` S10.

       NOT FIXED BY REORDERING `#meaningLevels`'s branch tests, deliberately:
       `documents === 0` winning first is how the defect SURFACED, not what
       caused it, and a reorder would have left every other reader of the
       envelope — the surface's own denominator among them — holding a scope
       figure that was still wrong and now harder to see. */
    if (mode === "levels") {
      const lc = cte(false, armSet(rowArm));
      return { sql: `${lc.sql}\nSELECT count(*) AS documents,`
                  + `\n       sum(CASE WHEN EXISTS (SELECT 1 FROM ${m.table} mx`
                  + ` WHERE mx.${m.key} = b.bundle_id) THEN 1 ELSE 0 END) AS documents_with_rows`
                  + `\nFROM scope s JOIN bundles b ON b.fts_id = s.fid\nWHERE ${gate.sql}`,
               args: [...lc.args, ...gate.args] };
    }
    /* ------------------------------------------------------------------
     * REC-92 / §4.4 — THE CONTENT-AXIS TALLY'S RAW INPUTS, and the point of
     * this mode is what it does NOT do: it does not decide anything.
     *
     * The four states are ONE VOCABULARY IN ONE PLACE (`CONTENT_AXIS_STATES`,
     * REC-94's export) and the branch logic that picks between them is
     * `contentAxisFor`, which is PURE and lives beside the observation writer.
     * Re-deriving that logic in SQL — `CASE WHEN ex.state = 'PRESENT' AND …` —
     * would be a SECOND SPELLING of the decision, in a language where the
     * suites cannot pin it against the constant, which is exactly the failure
     * the shared-vocabulary ruling was made to prevent. REC-94 says so in its
     * own words: *the aggregate over a bundle set that §4.4's envelope carries
     * is REC-92's, and it composes FROM this rather than re-deriving it.*
     * So this statement returns the RAW COLUMNS `contentAxisFor` takes as
     * arguments, and the store calls it once per capture.
     *
     * IT IS A JOIN AND NOT AN `IN (?)` LIST, deliberately — see
     * `MEANING_AXIS_CAP`. D-36's ceiling is about bound VARIABLES, and this
     * statement binds exactly two whatever the scope's size.
     *
     * THE SET IS THE CAPTURES OF THE DOCUMENTS IN SCOPE, NOT THE CAPTURES WITH
     * INDEXED TEXT, and that distinction is the whole tally. Taking it from
     * `capture_text` would have made the NEVER-EXTRACTED member of the
     * content-axis vocabulary unreachable by construction — the captures nobody has read hold no rows there — so the
     * one bucket that says NOBODY LOOKED would have read zero on every
     * instance, forever, and the answer would have claimed a complete index
     * over a corpus it had never opened. It comes from `register`, which holds
     * every capture the record has, and `registered` rides with it because
     * `#missingContentCause` needs it to tell cause (3) from cause (1).
     *
     * SAME SCOPE AND SAME GATE AS THE ROWS, on REC-90's rule: a tally that
     * ranged wider than the answer would be REC-36's leak arriving as an
     * instrument. `LIMIT ? + 1` over-fetches by one so truncation is OBSERVED
     * rather than inferred from equality with the cap. */
    if (mode === "axis") {
      /* The scope WITHOUT this arm's own text filter — §4.4's *other arms*. */
      const ac = cte(false, armSet(rowArm));
      return { sql: `${ac.sql}\nSELECT r.capture_sha AS capture_sha, r.registered AS registered,`
                  + `\n       ex.state AS extract_state, ex.condition AS extract_condition,`
                  + `\n       ex.detail AS extract_detail,`
                  + `\n       ix.state AS index_state, ix.bound AS index_bound,`
                  + `\n       ix.detail AS index_detail,`
                  + `\n       EXISTS (SELECT 1 FROM readings rd WHERE rd.capture_sha = r.capture_sha)`
                  + ` AS has_reading`
                  + `\nFROM scope s JOIN bundles b ON b.fts_id = s.fid`
                  + `\n JOIN register r ON r.bundle_id = b.bundle_id`
                  + `\n LEFT JOIN observation_log ex ON ex.seq = (SELECT MAX(seq) FROM observation_log`
                  + `\n      WHERE level = 'content' AND subject_kind = 'capture'`
                  + `\n        AND authority_kind = 'extract' AND subject = r.capture_sha)`
                  + `\n LEFT JOIN observation_log ix ON ix.seq = (SELECT MAX(seq) FROM observation_log`
                  + `\n      WHERE level = 'content' AND subject_kind = 'capture'`
                  + `\n        AND authority_kind = 'derive' AND subject = r.capture_sha)`
                  + `\nWHERE ${gate.sql}\nORDER BY r.capture_sha ASC LIMIT ?`,
               args: [...ac.args, ...gate.args, MEANING_AXIS_CAP + 1] };
    }
    /* REC-90: a descriptor may reach ONE more table for columns the grain needs
       and its own table does not hold — `rows=leg`'s `extent_kind` and `ref`,
       which live on the content row the leg cites. LEFT, because a leg with no
       content row is the ordinary case and an inner join would silently DELETE
       every leg that has not been backfilled yet — the answer under-reporting a
       basis, which §14c's whole-basis rule forbids. It is in the `count`
       statement as well as the rows: a join present in one and not the other is
       how `total` and the page come to describe different relations, and the
       join cannot change either count because it is on the other table's PRIMARY
       KEY (asserted in `content-arm.test.mjs`, not reasoned about here). */
    const joined = m.rowJoin
      ? `\n LEFT JOIN ${m.rowJoin.table} ${m.rowJoin.alias} ON ${m.rowJoin.on}` : "";
    /* REC-92 — THE MATCH ON THE ROW SHAPE, AND IT IS A CORRECTNESS REQUIREMENT
       BEFORE IT IS A SNIPPET REQUIREMENT. The ARM selects BUNDLES that hold a
       matching unit; without this the row shape would then return EVERY indexed
       unit of those bundles — a four-hundred-page packet answering four hundred
       rows because one page matched, with `total` agreeing. §4.2 says
       `rows=passage` returns *the indexed units MATCHED*, so the match has to be
       applied a second time, at the grain the rows are actually cut to.
       IT IS AN INNER JOIN ON `rowid`, which is what `content_rowid='rowid'` on
       the external-content table makes exact, and `snippet()` then reads the
       base row rather than a second copy of the text.
       NULL WHEN THERE IS NO TERM. `rows=passage` with no `passage:` selector
       (or with `passage:*`, which has no term by construction) is ANSWERED and
       not refused — it lists every indexed unit in scope, which is the
       `rows=content`-without-`content:` precedent — and its `snippet` is NULL
       rather than an invented excerpt. A `snippet()` call with no MATCH in the
       statement is an FTS5 error, not an empty string, so the two shapes are
       genuinely different statements and the answer STATES which one it is
       (`Store.#meaningLevels`), rather than leaving a member to read the null. */
    /* THE FTS TABLE IS JOINED UNDER ITS OWN NAME AND NEVER UNDER AN ALIAS, and
       that is a property of FTS5 rather than a style choice. `alias MATCH ?`
       does not compile: SQLite resolves the left operand of MATCH as a COLUMN
       unless it is the table's own name, and the first draft of this statement
       answered `no such column: pf` from inside the count. Measured, not
       recalled — the arm existed and the row shape did not, which is exactly the
       shape `op=invitelook` shipped in with 1,276 assertions passing. */
    const fts = passageOn(rowArm)
      ? { name: m.ftsTable, expr: passageMatch, col: m.ftsColumn } : null;
    const ftsJoin = fts ? `\n JOIN ${fts.name} ON ${fts.name}.rowid = m.rowid` : "";
    /* The MATCH goes AFTER the gate and after `refSql` so the argument order is
       the TEXT order of the statement and stays readable as the shape grows —
       the one place an off-by-one in `args` would bind a member's search term
       to a viewer predicate. */
    const ftsWhere = fts ? ` AND ${fts.name} MATCH ?` : "";
    const ftsArgs = fts ? [fts.expr] : [];
    const from = `FROM scope s JOIN bundles b ON b.fts_id = s.fid`
               + `\n JOIN ${m.table} m ON m.${m.key} = b.bundle_id${ftsJoin}${joined}`
               + `\nWHERE ${gate.sql}${refSql}${ftsWhere}`;
    /* THE COUNT CARRIES THE SAME MATCH AS THE PAGE, for the reason the `rowJoin`
       note above gives one relation over: a filter present in one statement and
       not the other is how `total` and the page come to describe different
       things, and here it would be the difference between "units that match"
       and "units of documents that match". */
    if (mode === "count") return { sql: `${c.sql}\nSELECT count(*) AS n ${from}`,
                                   args: [...args, ...ftsArgs] };
    /* Existence is REPORTED, never inferred from a null: `target_present` is the
       fact the departure above turns on, so it is a column and not a silence. */
    const present = m.refs.map((col) =>
      `, EXISTS (SELECT 1 FROM bundles tb WHERE tb.bundle_id = m.${col}) AS ${col}_present`).join("");
    /* REC-90: columns a row cannot state about itself, on `target_present`'s own
       precedent — `rows=content`'s `cited` (the grain's published words are
       "cited or citable, AND IT SAYS WHICH", which is a promise only a column
       can keep) and `chain_last` (the one fact of the chain this arm filters on,
       published so a reader can see what they filtered by). The SQL is the
       REGISTRY's and carries no member input. */
    const computed = Object.entries(m.rowComputed || {})
      .map(([name, expr]) => `, (${expr}) AS ${name}`).join("");
    const reached = m.rowJoin
      ? m.rowJoin.cols.map((c2) => `, ${m.rowJoin.alias}.${c2} AS ${c2}`).join("") : "";
    /* REC-92 — `snippet` IS ALWAYS A COLUMN AND NEVER A MISSING KEY, on the
       precedent this compiler already set for the bundle page (`, NULL AS
       snippet` when nothing was ranked). A column that appears only sometimes
       makes a surface test for its presence, and a surface testing for presence
       is a surface that will read its absence as "no passage" rather than as
       "nothing to centre a passage on".
       THE DELIMITERS ARE LITERALS AND THE BUDGET IS BOUND, exactly as the
       `bundles_fts` snippet does — same brackets, same ellipsis, same clamp —
       so a member reading a passage hit and a bundle hit reads one convention. */
    const snip = m.ftsTable
      ? (fts
          ? `, snippet(${fts.name}, ${fts.col}, '[', ']', '…', ?) AS snippet`
          : `, NULL AS snippet`)
      : "";
    const snipArgs = m.ftsTable && fts ? [Math.max(4, Math.min(64, Math.floor(snippetChars)))] : [];
    const sel = `b.bundle_id AS bundle_id, b.object_type AS bundle_type, `
              + m.row.map((c2) => m.rowLabel?.[c2] ? `(${m.rowLabel[c2]}) AS ${c2}` : `m.${c2} AS ${c2}`).join(", ")
              + reached + present + computed + snip;
    /* The ORDER BY is the GRAIN's own identity, which is what makes paging over
       meaning rows total rather than merely tidy — without it a leg can appear on
       two pages or on none, exactly as the bundle page's id tiebreak prevents. */
    const order = ["b.bundle_id ASC",
                   ...m.identity.filter((c2) => c2 !== m.key).map((c2) => `m.${c2} ASC`)].join(", ");
    /* ARGUMENT ORDER IS STATEMENT-TEXT ORDER: the CTE's, then the SELECT list's
       (`snippet`'s budget), then the WHERE's gate and refs, then the MATCH,
       then the page. `args` above already carries the CTE's and the gate's in
       that order, so the snippet budget has to be SPLICED between them rather
       than appended — which is why this is written out rather than reusing
       `args`, and why the suite pins a compiled statement's `args` positionally
       instead of by length. */
    return { sql: `${c.sql}\nSELECT ${sel} ${from}\nORDER BY ${order} LIMIT ? OFFSET ?`,
             args: [...c.args, ...snipArgs, ...gate.args, ...refArgs, ...ftsArgs, mLim, mOff] };
  };

  /* D-32, the remaining option named in the debt register: count the facets from
     ONE scan in JS instead of a GROUP BY per field. One statement, no aggregation
     and no sort in SQLite, returning the facet columns of every row in scope; the
     tallying is a hash map per field in store.mjs.
     Kept ALONGSIDE the compound-GROUP BY form rather than replacing it sight
     unseen, because which one wins is a measurement and not an argument: the
     GROUP BY form returns O(distinct values) rows and makes SQLite sort, the scan
     form returns O(rows in scope) and makes JS count. `npm run bench:facets`
     drives both over the same corpus and prints the comparison. */
  const facetScan = () => {
    if (!facetList.length) return null;
    const c = cte(false);
    const sel = facetList.map((n) => `b.${FIELDS[n].col}`).join(", ");
    return { sql: `${c.sql}\nSELECT ${sel} FROM scope s JOIN bundles b ON b.fts_id = s.fid\nWHERE ${gate.sql}`,
             args: [...c.args, ...gate.args] };
  };

  return {
    ast, warnings: ctx.warnings, gate: gate.scope, viewer: gate.viewer,
    sort: { field: sortField, dir: sortDir }, limit: lim, offset: off,
    match: rank, terms: ctx.textAtoms.map((a) => a.value), widenable,
    /* D-222 option A: which meaning arms this query compiled, in order. */
    meaningArms: ctx.meaningArms,
    /* D-222 option C: the meaning-GRAIN shape's own plan, null when the caller
       asked for no rows. `limit` here is the cap this shape APPLIED after
       clamping, which is what the op publishes — never the number asked for.
       ------------------------------------------------------------------------
       D-258: THESE SIX FIELDS ARE THE SIX `op=meaningrows` READS, AND THAT IS
       NOW THE WHOLE LIST. `columns: MEANING[rowArm].row` and
       `refs: MEANING[rowArm].refs` stood here until 2026-08-09 and NOTHING EVER
       READ EITHER — D-255's class, one field along. The decision D-255 left open
       was DELETE rather than give-them-a-reader, and the reason is a measurement
       rather than a preference, so it is recorded here and not only in the row.

       WHAT MADE IT A REAL CHOICE. Unlike `atom.phrase`, every sibling on this
       descriptor IS published, so "add them to the op's envelope" was live —
       a surface building a table over meaning rows genuinely wants to know which
       columns a row carries and which of them name another bundle.

       WHAT DECIDED IT. **That fact is ALREADY PUBLISHED, per arm, by
       `op=searchfields`** — `meaningVocabulary()` above emits
       `rows: { grain, identity, columns, refs }` from this same registry, and
       `op=searchfields` is the vocabulary route a surface already composes from
       (`civicos-ui` calls it; it calls `op=meaningrows` nowhere — measured
       2026-08-09, zero non-test consumers). So publishing these two again in the
       answer envelope would have added a SECOND spelling of a fact the plane
       already answers, on behalf of a consumer that does not exist, and it would
       have been worse than redundant: `columns` restates the keys the returned
       rows already carry, whereas `grain` and `identity` say what a row MEANS
       and how it is ADDRESSED — things the rows cannot say about themselves.
       That is the line between a field a member can act on and a value published
       because it had already been computed.

       WHAT IT COSTS TO REVERSE, if a surface ever wants them in the answer
       rather than in the vocabulary: these two lines back, and an IC row —
       adding to a published envelope is an interface change. Deleting them
       forecloses nothing, because the alternative's whole benefit is already
       delivered by a different op that surfaces already use.

       HOW IT WAS ESTABLISHED, because "nothing reads it" is the claim this
       project has most often got wrong: NOT by grep. `test/fieldread.control.mjs
       --tripwire-sweep` makes each field throw on any read in any spelling and
       runs the WHOLE battery, which is what reaches `store.mjs` inside workerd
       where a node sweep cannot see. Five of these fields' siblings read as
       never-read in node and are LIVE. The pin that stops the two coming back is
       structural (`Object.keys`) in `query.test.mjs`, because a field with no
       consumer is invisible to every behavioural assertion there is.

       REC-90 ADDS A SEVENTH, `level`, AND IT HAS A READER BEFORE IT IS WRITTEN —
       which is the test D-258 above set for a field on this descriptor.
       `store.mjs`'s `meaningRows` composes the answer's four-level statement from
       it, so it is not a value published because it had already been computed. */
    /* REC-92 ADDS AN EIGHTH, `matched`, AND IT HAS A READER BEFORE IT IS
       WRITTEN — D-258's own test for a field on this descriptor.
       `Store.#meaningLevels` composes the sentence that tells a member whether
       they are reading the units that MATCHED a term or every indexed unit in
       scope. Those two answers have the same shape, the same columns and very
       different meanings, and without this field the only thing distinguishing
       them on the wire is a NULL in `snippet` — which is a member inferring a
       fact from an absence, the exact move this whole arm exists to stop. It is
       a BOOLEAN about the plan and not a copy of the member's terms: the terms
       are already published on `query.meaningArms`. */
    meaning: rowArm ? {
      arm: rowArm, table: MEANING[rowArm].table, level: MEANING[rowArm].level,
      grain: MEANING[rowArm].rowGrain, identity: MEANING[rowArm].identity,
      limit: mLim, offset: mOff,
      matched: passageOn(rowArm),
      fts: !!MEANING[rowArm].ftsTable,
    } : null,
    facetFields: facetList,
    facetCols: facetList.map((n) => FIELDS[n].col),
    /* REC-108 / D-379: which CACHED columns this plan reaches, and by which of
       the three routes. The PLAN states the routes; only the caller knows which
       of them it will actually execute (a `count` runs no facets and no page),
       so `cachedNotes` takes that as an argument rather than this guessing — a
       block naming a facet the answer does not carry would be the honesty
       mechanism itself overclaiming. */
    cached: cachedRoutes(ast, facetList, ctx.sort ? ctx.sort.field : null),
    restricted: Array.isArray(ids) && ids.length > 0,
    statements: { page, count, ids: idsStmt, snapshot, facets: facets_, facetScan, meaning },
  };
}
