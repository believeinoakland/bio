# query-language — requirements

**Status** · DRAFT by a drafting worker for BOB #42, 2026-09-26 (P18), from a reading of the code; for Bob's approval (a product module, P17). Layer 5. Code today (measured on `tranche/T3` @ `7d915799`; unchanged by membership's early merge): its own file `bio-plane/src/query.mjs`, 1–2665 whole (the field registry 37–243, the meaning arms 245–971, the imports 973–995, the constants and the gate 997–1182, `textOf` 1184–1246, the tokenizer and parser 1248–1432, the atoms and selectors 1434–1744, the FTS5 expressions and viewer-scoped relevance 1746–1855, the set compiler 1857–1999, `compile` and its statement shapes 2001–2665). Nothing of it sits in a legacy file, so it has no extraction map; its only executor is `retrieval` (today `store.mjs`, `build/extraction/retrieval.md`). No old-plan row targets it. Not yet met: R9 (N37, K63). Plan entry: N37.

**Size (P6).** 2,665 lines (922 without comment-only and blank lines). N37 removes about 150 (`viewerPredicate` and its comments, 1041–1182, becoming a re-export of `membership`'s, which since the merge exports its own `viewerPredicate` and `GATE_MARK`, `bio-plane/src/membership/index.mjs` 23–31). Well under the 4,000 at which BOB reports a module.

## Public

### Purpose

The query language: the one grammar a member types to search the record, and the one compiler that turns it into the statements `retrieval` runs. It parses a string into a tree, resolves fields and meaning arms from registries driven off the catalogue, and compiles every statement shape (page, count, select-all, snapshot, facets, meaning-grain rows, the level counts and the content-axis inputs) with the viewer's visibility predicate as the only gate. It is pure: it holds no database handle, no clock and no network, and it builds SQL without running it.

### Provides

Terms. A **query** `q` is a string. A **plan** is `compile`'s answer: `{ast, warnings, gate, viewer, sort, limit, offset, match, terms, widenable, meaningArms, meaning, facetFields, facetCols, cached, restricted, statements}`. A **statement** is `{sql, args}`. The **gate** is `viewerPredicate(viewer)` (`membership` R43). A **meaning arm** is one of `leg`, `resolves`, `concerns`, `content`, `passage` (`MEANING`); a **field** is a key of `FIELDS`. A warning is a sentence in `plan.warnings`; nothing here throws.

**compile({q, viewer, sort, dir, limit, offset, ids, facets, implicitOp, snippetChars, rows, rowLimit, rowOffset}) → plan** Never throws, for any input.
- **R1** The grammar: bare words join by AND (`implicitOp: "or"` joins them by OR); `OR`, `AND` and `NOT` are operators only in capitals; a leading `-` negates; parentheses nest, and an unclosed one is read to the end with a warning; `"a b"` is one phrase; `term*` is a prefix; `field:value`, with a quoted value read to its end in as many pieces as it takes (`state:"open"`, `fm:"a.b"="c"`); `field:>v`, `>=`, `<`, `<=`, and `field:a..b` on a time or number field; `field:` or `field:*` asks presence; `has:field` and `has:<arm>` ask presence; `fm:path` and `fm:path=value` reach frontmatter, the path bounded to `[A-Za-z0-9_.[\]]{1,120}` or dropped with a warning; `text:` forces free text; `sort:field`, `sort:-field`, `sort:field:asc|desc`. A term with no letter or digit is dropped.
- **R2** An unknown field is read as free text with the warning `unknown field "<f>"; read as free text`; an unknown `has:` field or `sort:` field is dropped with a warning.
- **R3** `FIELDS` is the vocabulary of the bundle projection (`retrieval` R2): `id type group title state prior created updated criticality sha schema mode tier locator authority retrieved status hash monitored frequency checked annotations reeval since reevalsource capture connection legs actionkind risk addressee resolution due overdue`. `title`, `locator` and `authority` are free text (a column-scoped match); every other field is equality, its argument lower- or upper-cased where the field says so, and `type:` normalised through the catalogue's type map (a legacy spelling finds the canonical type).
- **R4** `capture:` and `connection:` are two fields over two columns, never one composed strength (DEC-21); both are marked cached (R17).
- **R5** A meaning selector takes a bare vocabulary word (`leg:hunch`), a qualified sub-field (`leg:role=cuts_against`, `leg:ground=*`), a comparison on the bare field (`resolves:>=B`) or on a named sub-field (`leg:grade>=B`, `content:cap<C`). Bare words are indexed from the catalogue's own vocabularies, never a copy. A bare word two sub-fields claim, an unknown sub-field, a comparison against nothing, a comparison on `passage:`, and a `passage:` term with no word are each DROPPED with a warning naming why (and, for an ambiguous word, both spellings to use): a dropped arm widens the answer; no spelling compiles to a predicate that matches nothing. `meaningArms` lists exactly the arms that compiled.
- **R6** The `content:` arm's sub-fields: `kind` (the content extent kinds, `content` R1; `dom` is not a word), `stale`/`current`, `minted` (`member`, `plane`, `machine` as classes; any other value is equality on the minter), `cap` (a letter; `undetermined` is a null cap over text rows; `does-not-apply` is the rows cited as bytes; a comparison never matches either), `chain` (the last step kinds of `text-chain`; `undetermined` a null chain over text rows; `does-not-apply` the bytes rows; presence), `cited`/`uncited` (whether any live or version leg names the row). The `passage:` arm matches the indexed text of captures (`extraction`'s units); `text:` keeps meaning the group's own notes.
- **R7** No member input enters a statement's text: for every value a member can type, the SQL is byte-identical and only `args` move. Column names come from the registries, and an ORDER BY only from `SORTABLE`.
- **R8** Every statement every shape returns carries the gate's mark and takes its visibility from one call of the gate; none mints a second gate. An absent or unrecognised viewer compiles to the deny predicate, so the answer is empty, never unfiltered.
- **R9** `viewerPredicate` and `GATE_MARK` are `membership`'s (R43), re-exported unchanged. *(not yet met: N37, K63 — `query.mjs` holds its own copy)*
- **R10** Order: relevance when the query has a positive text term, else `updated` descending; every order ends `bundle_id` ascending; a field sort puts nulls last in both directions; an explicit `sort` parameter outranks a `sort:` token.
- **R11** Relevance is computed over the rows the viewer may see, and only the order is published, never a score: revising or creating a bundle the viewer cannot see changes neither the order nor the snippets of the viewer's answer (D-447). More than `RANK_ATOMS_MAX` (8) distinct terms are weighed as one, with a warning. *(Open for Bob 1)*
- **R12** Bounds, each published as applied after clamping: `limit` 50 by default, 1–500; `offset` at least 0; select-all at most `IDS_MAX` (50,000) ids; meaning rows 200 by default, 1–1,000; snippet length 4–64 tokens, 12 by default.
- **R13** `widenable` is true only for an implicit conjunction of more than one atom; the same query compiled with `implicitOp: "or"` is its wider reading.
- **R14** The bundle-grain shapes: `page` (the provenance columns `PROVENANCE_COLS` and a `snippet`, null when there is no term), `count`, `ids`, `snapshot` (id and sha), `facets` and `facetScan` (the requested facets or `DEFAULT_FACETS`, fields only, nulls excluded; both forms count alike). An `ids` list is an arm intersected with the query, never a filter after it. A query with any number of arms compiles. *(Open for Bob 3)*
- **R15** `rows=<arm>` (`meaning`): every meaning row of every bundle in scope, the whole set of each bundle and not only the rows the arm matched; a row whose bundle the viewer cannot see is absent (never redacted), and so is a row naming another bundle the viewer cannot see; a row naming a bundle that does not exist is returned with `<col>_present` false; the count is over the same joins, so it never exceeds what paging reaches; the order is the bundle, then the arm's identity. `rows=passage` returns only the units matching the query's `passage:` terms (their OR), each with the `content_id` of the current row at that extent or null; with no term it returns every unit in scope, `snippet` null, and `meaning.matched` false.
- **R16** `meaning({mode: "levels"})` counts the documents in scope and those holding any row of the arm's table; `mode: "axis"` lists, per capture of the documents in scope, the raw extraction and index observations and whether a reading exists, at most `MEANING_AXIS_CAP` (500) plus one. Both take their scope from the query's OTHER arms (the row arm stripped), so a miss never empties its own denominator.
- **R17** `plan.cached` names each cached column (a field marked `asOf`) the plan reaches, and by which route: a filter anywhere in the tree, a default facet, or the sort. `cachedNotes(routes, {facets, ordered})` publishes only the routes that ran, in `FIELDS` order, each with `as_of`, the authority that derives the current value and a sentence; `[]` when none.
- **R18** `meaningVocabulary()` answers, per arm: `table`, `key`, `grain`, `bare`, `fields` (column, values, `selects` where a selector reads a column the row does not publish verbatim), `words`, `ambiguous`, `level`, and `rows` `{grain, identity, columns, refs}`, where `columns` is exactly what a row carries. `ambiguousBareWords()` lists each arm's contested words.

**textOf(bundleId, files) → `{title, body, meta, locator, authority}`** What the text index holds for a bundle.
- **R19** `title` from the frontmatter; `body` the prose after the frontmatter, then every other `.md` and `.txt` file by path (JSON files never); `meta` the bundle id and every frontmatter key and scalar value; `locator` and `authority` from `source`. Each is cut at 128 KiB. Frontmatter that does not parse leaves `body` the whole text and the rest empty; never throws.

## Private

### Uses

- `membership`: `viewerPredicate`, `GATE_MARK` (R9).
- `text-chain`: `STEP_KINDS` (R6).
- `legacy-checks`: `parseFrontmatter`, `normalizeType`, `MACHINE_CLASS_PREFIX`, `BASIS_ROLES`, `GRADE_AXES`, `GRADE_SOURCES`; and `CONTENT_EXTENT_KINDS`, `CONTENT_MINTED_BY_PLANE`, `contentCitedAs` until `content` takes them (its map §1), then from `content`. *(`content` is not declared in `modules.json` today)*
- The statements name tables other modules own, as read contracts: `bundles` and the projection columns (`record-core` R37, `retrieval`), `content` (`content`), `capture_text`, `capture_text_fts` and `readings` (`extraction`), `resolutions` (`entities`), `register` (`provenance` R48), `observation_log` (`observation-log`), and `inquiry_basis`, `inquiry_basis_version_legs` (`inquiry`, `basis-versions`, layer 6; see Suggestions).

### Invariants

- **R20** Pure: no store, no clock, no network, no mutable module state but the memoised bare-word index.
- **R21** One compilation point for visibility (D-15): no statement reaches `retrieval` without the gate (R8), and the gate is minted only inside `viewerPredicate`.
- **R22** A vocabulary is read from its owner, never restated: field words from `FIELDS`, arm words from the catalogue and `text-chain`, cached columns derived from `FIELDS`.
- **R23** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/development/RETRIEVAL-SUBSTRATE.md`, the settled design (Bob, 2026-07-25): 1 (`locator`, `authority` searchable), 2 (a hit carries full provenance), 3 (relevance by default, every header a sort), 4 (selections, through `retrieval`), 6 (a bare string is AND), and the two obligations (the id tiebreak; select-all distinct from a page); "Why a bare string is AND" (the widening affordance).
- `docs/development/CONTENT-SEARCH-DESIGN.md` §2 (the constraints), §4.2 (the two arms and row shapes), §4.4 (the level counts and the axis inputs), §4.5 (nothing minted), §8.
- `docs/development/INVESTIGATIVE-SESSION.md` §14c (the meaning arms and grain; a basis returned whole; a candidate list withholds the whole row).
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.3 (the four levels).
- `docs/architecture/BIO_Membership_Architecture_v2.md` §7.9 (sight, through `membership`).
- `docs/architecture/BIO_System_Design.md` §3, construct 9 (the query compiler with one compilation point).
- DEC-21 (two axes, never composed), DEC-24 (the machine looks, the member concludes).

### Suggestions

- **N37.** `query.mjs` re-exports `viewerPredicate` and `GATE_MARK` from `membership` once that module is extracted; `meaningread.test.mjs` and `meaningquery.test.mjs` pin the gate's three mint sites inside `query.mjs`'s own text, so N37 needs a `legacy-tests` entry beside it (K53).
- **Later layers' vocabulary.** `leg:` and `content:cited` read layer-6 tables, and the fields `capture`, `connection`, `legs`, `actionkind` … `overdue` read projection columns written by `strength`, `inquiry` and `actions`. A registry this module offers (the K31 pattern: an arm, a sub-field predicate or a field registered by its owner, `legacy-store` registering them until each extraction) would keep the grammar unchanged and the order intact. BOB decides (P17); see `build/extraction/retrieval.md` §5.
- **The `axis` statement** joins `register`, `readings` and `observation_log`; it could move to `retrieval`, which already reads them, leaving the compiler only the shapes of the query itself.
- Tests: R7 by compiling hostile values; R8 by walking every shape of a plan; R11 by revising a bundle the viewer cannot see; R15 by a basis of five legs of which one matches; R16 by a miss over a partly indexed scope.

## Open for Bob

1. **Is relevance "bm25"?** Your settled design (2026-07-25, item 3) says the default order is relevance, "which is bm25". Since D-447 the order is computed only over what the viewer may see, because bm25's corpus statistics let a member watch a hidden project change their results; the formula keeps bm25's term weighting and saturation but drops its length normalisation, and no score is published. *Recommendation:* rule that relevance means this viewer-scoped ordering: the privacy rule (Membership §7.9) outranks the exact formula.
2. **NEAR.** `CONTENT-SEARCH-DESIGN.md` §4.2 says `passage:` takes "quoted phrases, prefix, `NEAR`, the FTS5 grammar `text:` already compiles". Neither `text:` nor `passage:` compiles `NEAR`: every term is quoted as a literal. *Recommendation:* strike `NEAR` from the design; add it only when a member asks for proximity search.

(Its third draft point, a query with more than four arms, is technical and ruled by BOB: K75 (5).)