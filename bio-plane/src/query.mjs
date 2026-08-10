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
 *   - Default order is relevance, which is bm25.
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
     so an ordering that reads oddly in prose is one indexed seek in SQLite. */
  capture:        { col: "inquiry_capture_strength",    type: "text", upper: true },
  connection:     { col: "inquiry_connection_strength", type: "text", upper: true },
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
      axis:   { col: "grade_axis",   case: "lower", vocab: GRADE_AXES },
      grade:  { col: "grade",        case: "upper", vocab: [] },
      /* REC-42's OR branch. `has:leg` plus `leg:ground=*` is "a multi-ground
         basis", the second question D-223 named as equally unaskable. */
      ground: { col: "ground",  vocab: [] },
      target: { col: "target_id", vocab: [] },
    },
    /* PL-9: the grain. `note` is a member's own prose about the leg and is
       published because this op is gated exactly as the bundle page is — the
       whole point of staying on this compiler. `target_id` is the one column
       that names another bundle. */
    row: ["ord", "target_id", "target_type", "role", "grade", "grade_axis",
          "grade_source", "ground", "note", "at"],
    identity: ["bundle_id", "ord"],
    refs: ["target_id"],
    rowGrain: "one LEG of one inquiry's basis, addressed by (bundle_id, ord) — "
            + "an inquiry resting on four legs answers with four rows",
  },
  resolves: { table: "resolutions", key: "bundle_id", bare: "grade",
              grain: "the bundle carrying a capture whose reference resolved so",
              sub: RESOLUTION_SUB, ...RESOLUTION_ROW },
  concerns: { table: "resolutions", key: "bundle_id", bare: "entity",
              grain: "the bundle carrying a capture that concerns the subject",
              sub: RESOLUTION_SUB, ...RESOLUTION_ROW },
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
    fields: Object.fromEntries(Object.entries(m.sub).map(([n, s]) => [n, { column: s.col, values: s.vocab || [] }])),
    words: Object.fromEntries([...bareIndex(arm)].filter(([, subs]) => subs.length === 1).map(([w, subs]) => [w, subs[0]])),
    ambiguous: ambiguousBareWords()[arm],
    /* PL-9: the MEANING-GRAIN half of the same arm, published beside the
       bundle-grain half so a caller can see that one selector name answers at
       two grains and which is which. `grain` above is what `leg:hunch` selects;
       `rows.grain` is what `op=meaningrows&rows=leg` returns. */
    rows: { grain: m.rowGrain, identity: m.identity, columns: m.row, refs: m.refs },
  }]));
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
         BASIS_ROLES, GRADE_AXES, GRADE_SOURCES } from "../checks/bio-checks.mjs";

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
  if (!m) return { sql: `${GATE_MARK} 0=1`, args: [], viewer: null, scope: "DENY" };

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
  const memberId = m[3] || null;
  if (!memberId) return { sql: `${GATE_MARK} 1=1`, args: [], viewer: v, scope: "member" };

  return {
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
  const eq = raw.indexOf("=");
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
  /* RECORDED, so the caller and the suite can tell an arm that COMPILED from a
     string that quietly degraded to free text. `unknown field "leg"` and a set
     arm over inquiry_basis produce very different answers and looked identical
     from outside until this list existed. */
  ctx.meaningArms.push({ arm, field: subName, column: sub.col });
  const norm = (x) => sub.case === "upper" ? String(x).toUpperCase()
                    : sub.case === "lower" ? String(x).toLowerCase() : String(x);
  if (raw === "" || raw === "*") return { op: "meaning", arm, col: sub.col, cmp: "present", value: null };
  for (const [lead, cmp] of CMP)
    if (raw.startsWith(lead)) return { op: "meaning", arm, col: sub.col, cmp, value: norm(raw.slice(lead.length)) };
  return { op: "meaning", arm, col: sub.col, cmp: "=", value: norm(raw) };
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
  if (!atoms.length) return null;
  const seen = new Set(), parts = [];
  for (const a of atoms) { const e = ftsAtom(a); if (!seen.has(e)) { seen.add(e); parts.push(e); } }
  return parts.length === 1 ? parts[0] : "(" + parts.join(" OR ") + ")";
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
function meaningSql(node) {
  const m = MEANING[node.arm];
  const inner = node.cmp === "present"
    ? (node.col
        ? `SELECT ${m.key} FROM ${m.table} WHERE ${node.col} IS NOT NULL AND ${node.col} <> ''`
        : `SELECT ${m.key} FROM ${m.table}`)
    : `SELECT ${m.key} FROM ${m.table} WHERE ${node.col} ${node.cmp} ?`;
  return { sql: `SELECT fts_id AS fid FROM bundles WHERE fts_id IS NOT NULL AND bundle_id IN (${inner})`,
           args: node.cmp === "present" ? [] : [node.value], compound: false };
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
  const ctx = { warnings: [], textAtoms: [], sort: null, meaningArms: [] };
  const ast = parseTokens(tokenize(q), implicitOp === "or" ? "or" : "and", ctx);
  /* An explicit sort parameter outranks a `sort:` token in the query string:
     the parameter is a header the member just clicked, the token is what they
     typed earlier. */
  if (sort && sort in SORTABLE) ctx.sort = { field: sort, dir: /^d/i.test(dir || "") ? "DESC" : dir ? "ASC" : (sort === "relevance" ? "ASC" : "DESC") };

  const gate = viewerPredicate(viewer);
  const rank = rankExpr(ctx.textAtoms);
  const set = setSql(ast);

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
  const cte = (withRanked) => {
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
    const parts = [`hits(fid) AS (${set.sql})`];
    if (idArm) {
      parts.push(`picked(fid) AS (${idArm.sql})`);
      parts.push(`scope(fid) AS (SELECT fid FROM hits INTERSECT SELECT fid FROM picked)`);
    } else {
      parts.push(`scope(fid) AS (SELECT fid FROM hits)`);
    }
    const args = [...set.args, ...(idArm ? idArm.args : [])];
    if (withRanked && rank) {
      parts.push(`ranked(fid, score, snip) AS (SELECT rowid AS fid, bm25(bundles_fts) AS score, `
               + `snippet(bundles_fts, -1, '[', ']', '\u2026', ?) AS snip FROM bundles_fts WHERE bundles_fts MATCH ?)`);
      args.push(Math.max(4, Math.min(64, Math.floor(snippetChars))), rank);
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
  const scored = rank ? `, r.score AS score, r.snip AS snippet` : `, NULL AS score, NULL AS snippet`;

  const page = () => {
    const c = cte(true);
    return { sql: `${c.sql}\nSELECT ${cols}${scored} FROM scope s JOIN bundles b ON b.fts_id = s.fid${joinRanked}\n`
                + `WHERE ${gate.sql}\nORDER BY ${order} LIMIT ? OFFSET ?`, args: [...c.args, ...gate.args, lim, off] };
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
    let refSql = "";
    for (const col of m.refs) {
      refSql += `\n   AND (NOT EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = m.${col})`
              + `\n        OR EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = m.${col} AND (${gate.sql})))`;
      args.push(...gate.args);
    }
    const from = `FROM scope s JOIN bundles b ON b.fts_id = s.fid`
               + `\n JOIN ${m.table} m ON m.${m.key} = b.bundle_id`
               + `\nWHERE ${gate.sql}${refSql}`;
    if (mode === "count") return { sql: `${c.sql}\nSELECT count(*) AS n ${from}`, args };
    /* Existence is REPORTED, never inferred from a null: `target_present` is the
       fact the departure above turns on, so it is a column and not a silence. */
    const present = m.refs.map((col) =>
      `, EXISTS (SELECT 1 FROM bundles tb WHERE tb.bundle_id = m.${col}) AS ${col}_present`).join("");
    const sel = `b.bundle_id AS bundle_id, b.object_type AS bundle_type, `
              + m.row.map((c2) => `m.${c2} AS ${c2}`).join(", ") + present;
    /* The ORDER BY is the GRAIN's own identity, which is what makes paging over
       meaning rows total rather than merely tidy — without it a leg can appear on
       two pages or on none, exactly as the bundle page's id tiebreak prevents. */
    const order = ["b.bundle_id ASC",
                   ...m.identity.filter((c2) => c2 !== m.key).map((c2) => `m.${c2} ASC`)].join(", ");
    return { sql: `${c.sql}\nSELECT ${sel} ${from}\nORDER BY ${order} LIMIT ? OFFSET ?`,
             args: [...args, mLim, mOff] };
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
       consumer is invisible to every behavioural assertion there is. */
    meaning: rowArm ? {
      arm: rowArm, table: MEANING[rowArm].table,
      grain: MEANING[rowArm].rowGrain, identity: MEANING[rowArm].identity,
      limit: mLim, offset: mOff,
    } : null,
    facetFields: facetList,
    facetCols: facetList.map((n) => FIELDS[n].col),
    restricted: Array.isArray(ids) && ids.length > 0,
    statements: { page, count, ids: idsStmt, snapshot, facets: facets_, facetScan, meaning },
  };
}
