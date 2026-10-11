# retrieval (T42)

**Status** · session_019vnhhXM8NuoLEZ5m4aXXJA · depth 2 · RUNNING until 2026-10-11T02:20:54Z (users' suites (21 modules)) · handled B1

## Reading (mechanics §17, K2304)

The reading set measured 845 KB, which is over 300 KB. I read these whole myself: `build/requirements/retrieval.md`; layer 5's row of `build/layers.md`; the plan's entry T42-11, Rules at the opening (rule 4 included) and `draft-T42-reqs.md` N830; K2480 and K2608; `bio-plane/src/retrieval/index.mjs` (the code the entry changes); `decoration.test.mjs`, `search.test.mjs` and `fixture.mjs` (the tests it changes and their fixture); and membership R81 and R83 with `MODULE_ORDER` (the used service R78 names). A worker of mine read the rest of the module whole: `checks.mjs`, `fields.mjs`, `findin.mjs`, `frontier.mjs`, `levels.mjs`, `projection.mjs`, `schema.mjs` and the other 19 test files. It wrote a summary of about 4 KB, each statement citing a file and line. It found nothing in those files that calls `search`'s page, and no test that pins a hit's key set; whole-answer comparisons (fields.test:44–67, 105–139, 153; legs.test:153–162; passage-arm.test:179–188) hold, since nothing is registered there. It also found projection.test:250's R58 title stale.

## Entries applied

- **T42-11 (N830, K2480): R78 `registerSearchDecoration(module, fn)`.** It is a slot of its own beside R56's, with R56's refusals (`DECORATION_MALFORMED`, `DECORATION_DECLARED`). Decorations apply in `MODULE_ORDER` (R83). `search` in `page` mode calls each `fn(hits, {viewer})` once per page; an empty page and the `ids` and `count` modes call none. Each `fn` is handed frozen copies of the hits, so it cannot change one.
  - An answer counts only as an array of exactly one plain object or null per hit. Anything else adds nothing: a throw, a promise (its rejection handled, never awaited), a thenable, or a wrong length or element.
  - A key a hit already answers (R6) is never replaced.
  - A later module's value of a key two decorations share wins, as in R56's merge.
  - With nothing registered, or nothing added, the hits are the very rows the query answered, so the answer is R6's, byte for byte. `search` stays synchronous. `total`, `facets`, `widen`, `query`, `gate` and `cached` are computed outside the decoration and unchanged.
- **R58 (wording only):** the `retrievalRoutes` comment and the R58 test title (projection.test:250) say that R78 adds no op, and the title now names R73's `findin`.

## Deferred

None.

## Found in other modules

None. inquiry's T42-12 registers through R78. Its `fn` must answer synchronously, with one entry per hit (null for a non-question), and must not answer a key R6 already has (`bundle_id`, `title`, `snippet`, the provenance columns): `projects` and `projects_undetermined` are free.

## Tests and checks

- `decoration.test.mjs`: 7 new tests, R78 (and R58 through `retrievalRoutes`). They cover:
  - the refusals, with the refused `fn` never called;
  - keys on page hits only, in order, with null adding nothing; `ids`, `count`, `widen` and an empty page byte-identical;
  - the hidden project never handed to a decoration (ann's page as the negative control);
  - R6's keys never replaced, the decoration's own added;
  - 14 malformed answers (throw, async, rejecting, thenable, object, undefined, null, short, long, strings, arrays, mixed, Date, a mutating `fn`) each byte-identical to nothing registered, with a well-formed one as the negative control;
  - `MODULE_ORDER` applied regardless of registration order, with one failing decoration leaving the others.
  
  A mutation run (the key guard and the shape check removed) turned 2 of them red, as it should.
- retrieval: 175/175 pass.
