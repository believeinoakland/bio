# retrieval → retrieval-browse — split map (N1212)

**Status** · Draft by a planning worker for BOB, 2026-10-18; N1212, T51-29 (new module) and T51-42 (retrieval); K617, K624, K3809 (3), K3841. Read in full: `requirements/retrieval.md`, `requirements/README.md`, `retrieval/browse.mjs`, `retrieval/findin.mjs`, `retrieval/words.mjs`; in part: `retrieval/index.mjs` (the lines named), the test headers, `build/modules.json`, `plan/next.md` N1212 and N1238, rulings K3775, K624, K617, K3809, K1043, K3366, DEC-330 and the `finder` screen's drawing (`ux-substrate/screens/mock-screens.js`, `words-drawn.src.py`). `extraction/actions-split.md` gave the format.

**Why.** `retrieval` is 4,001 lines of source after T50-10 (K3681), the K617 mark. The seam is the last two things T35 to T50 added: "Find in this" (`findin.mjs`, the find's entry and its scope in `index.mjs`) and browse (`browse.mjs`).

## 0. The answer

**The cut is everything that answers `op=findin` and `op=browse`, with the two registrations those reads consume.** All of it reads other modules' tables and read contracts; none of it writes. What it needs from `retrieval` proper is five functions, which `retrieval` passes it when it builds the module (§3), so the moved code imports nothing of `retrieval` (P4).

| | lines (with comments) |
|---|---|
| `retrieval` before | **4,001**: `index.mjs` 1,849, `frontier.mjs` 549, `findin.mjs` 782, `browse.mjs` 185, `schema.mjs` 129, `levels.mjs` 130, `fields.mjs` 116, `projection.mjs` 87, `words.mjs` 90, `checks.mjs` 84 |
| `retrieval` after | about **2,870**: `index.mjs` about 1,705, `words.mjs` about 75, the other six unchanged (1,095); `findin.mjs` and `browse.mjs` gone. Margin to the mark about 1,130 |
| `retrieval-browse` | about **1,290** (about 1,350 with R12 and R13's code): `findin.mjs` 782, `browse.mjs` 185, `find.mjs` about 130, `marks.mjs` about 85, `words.mjs` about 35, `index.mjs` about 75 |

The 1,290 is not a second heap: nothing in it is held twice after T51-42 (K624). `retrieval` gains about 45 lines of delegation, already in the 2,870.

**Not moved** (and why):
- `selectionRead` and the selections (R18–R22, R51, R52, R59, R77): the find reads a selection through it, so it stays and is passed in.
- `searchFields`, `search`, `meaningRows`, `frontier`: the DEC-330 facts that are not browse's (§6) are `retrieval`'s own new requirements.
- the `findin` and `browse` arms of `retrievalRoutes`, and the stamps: `retrievalRoutes` stays the one router of the module's ops; the arms call the delegating methods. `op-declarations` and `control-plane` change nothing.
- `sight`, `planOf` and `runQuery` (R28's gate), `localeOf` (R69's source): each is `retrieval`'s own rule that other code of the module also uses; copying them would hold a rule twice.

## 1. The new module

| | `retrieval-browse` |
|---|---|
| layer | 5 |
| place in `modules.json` | already there (K1043): index 70, directly before `retrieval` (index 71), after `query-language`; its row is `"paths": [], "tests": [], "uses": []` and this map does not edit it |
| from | none (K624) |
| `paths` | `["bio-plane/src/retrieval-browse/"]`, set by T51-29 in the commit that creates the directory (a path naming nothing fails the format check, K1043) |
| `tests` | `["bio-plane/test/m/retrieval-browse/"]`, likewise |
| `uses` | `["setup-words", "civil-time", "calc-grammar", "record-grammar", "record-core", "membership", "provenance", "extraction", "content", "entities", "events", "standards", "money", "people"]`. Each index is below 70 (setup-words 0, record-grammar 1, civil-time 3, calc-grammar 4, record-core 34, membership 35, provenance 41, extraction 52, content 53, entities 54, events 55, standards 61, money 63, people 66), and every one is already in `retrieval`'s own `uses`, so no new edge is made |
| entry point | `retrievalBrowseOf(deps)` (K61); `retrieval`'s constructor creates it. `deps`: `sql`, `membership`, `host`, `order`, optional `entities` and `recorders` (as `retrieval` takes them today), and the five host reads (§3) |
| exports | `Finder`/`findIn`, `Browser`/`browse`, `scopeMembers` (new), `registerRecordedBy`, `registerBrowseMarks`; `FIND_KINDS`, `FIND_MATCHERS`, `FIND_CAPTURES_PER_CALL`, `FIND_IDS_MAX`, `FIND_ITEMS_DEFAULT`, `FIND_ITEMS_MAX`, `FIND_WORDS_MAX`, `FIND_TERM_MAX`, `FIND_EVENT_TYPES`, `FIND_PEOPLE_KINDS`, `FIND_ORIGIN`, `FIND_ROW_CELLS_MAX`, `RECORDED_BY_MODULES`, `RECORDED_BY_LIMIT`, `RECORDED_NONE_REGISTERED`, `matchMoney`, `matchDates`, `matchRequirements`, `cutWords`, `extentOfSource`; `BROWSE_KINDS`, `BROWSE_ONLY`, `BROWSE_SCOPES` (new), `BROWSE_LIMIT_DEFAULT`, `BROWSE_LIMIT_MAX`, `BROWSE_MARKS_MAX`; `BROWSE_ID_CHUNK` (§3) |
| files | `index.mjs` (factory, exports), `browse.mjs`, `findin.mjs` (both moved whole), `find.mjs` (`findIn`'s entry and `#findScope`, from `retrieval/index.mjs`), `marks.mjs` (`registerRecordedBy`, `registerBrowseMarks`, `browseMarks`, `recordedReads`, `entitiesFor`, from the same), `words.mjs` |

## 2. What moves (by copy, K624)

| moved | from | lines | requirement |
|---|---|---|---|
| the whole file: `Browser`, `BROWSE_*`, the cursor, `bundleRow`, `entityRow` | `retrieval/browse.mjs` 1–185 | 185 | R85, R86 → R10, R11 |
| the whole file: `Finder` (`find`, `recorded`, `annotate`, the matchers, the sheet rows), `FIND_*`, `FIND_MATCHERS`, `cutWords`, `matchMoney`, `matchDates`, `matchRequirements`, `extentOfSource`, `placed`, `rowOf`, `gridOf`, `callRead`, `relationOf`, `heldCells`, `paragraphsOf`, `phraseIn`, `hasPhrase` | `retrieval/findin.mjs` 1–782 | 782 | R73–R75, R80–R84 → R1–R3, R5–R9 |
| `findIn` (the refusals in order, the kinds, the term, the cap, the cursor) with its doc comment and `#findScope` (the four scope forms, the title) | `retrieval/index.mjs` 1557–1661 | 105 | R73 → R1 |
| `registerRecordedBy`, `registerBrowseMarks`, `browseMarks`, `recordedReads` | `retrieval/index.mjs` 399–448 | 50 | R76, R86 → R4, R11 |
| `entitiesFor` | `retrieval/index.mjs` 1666–1674 | 9 | R74's `people` |
| fields `#recordedBy`, `#browseMarks`, `#entities`, `#recorders`; their constructor lines; the `Finder` and `Browser` construction | `retrieval/index.mjs` 139–140, 152–157, 180–185 | about 14 | |
| imports `eventsOf`, `standardsOf`, `moneyOf`, `peopleOf`, `entitiesOf`, `Browser`, `Finder` and the `FIND_*` re-exports | `retrieval/index.mjs` 40–45, 52–58 | about 12 | |
| 15 word keys: `monitoring.reason_given`, `retrieval.column_why`, `retrieval.extent_why`, `retrieval.recorded_none_registered`, `retrieval.unread.read_followed_people`, `retrieval.unread.read_followed_people_offices`, `retrieval.why.names_day_calendar`, `retrieval.why.offers_recordedby_read`, `retrieval.why.reachable`, `retrieval.why.read_answered_promise`, `retrieval.why.read_refused`, `retrieval.why.read_threw`, `retrieval.why.words_name_month`, `retrieval.why.words_write_day`, `state.empty` | `retrieval/words.mjs` | 15 | |

The new module builds its own `words.mjs` (the same `say`, `keysRead`, its 15 keys); the key names do not change, so no word list entry changes. `retrieval`'s `words.mjs` drops them in T51-42.

## 3. Imports of the moved code, and the P4 seam

Every import of `browse.mjs`, `findin.mjs` and the code from `index.mjs`, with its place in the order (index in `modules.json`; `retrieval-browse` is 70):

| moved code imports | module (index) | earlier than 70? |
|---|---|---|
| `findin.mjs`: `isCalendarDate` | `civil-time` (3) | yes |
| `findin.mjs`: `parseFigure` | `calc-grammar` (4) | yes |
| `findin.mjs`: `extentRelation`, `canonicalExtent` | `content` (53) | yes |
| `findin.mjs`: `normAlias` | `extraction` (52) | yes |
| `findin.mjs`: `say` from `./words.mjs` | its own new `words.mjs` over `setup-words`' `word` (0) | yes |
| `browse.mjs`: `viewerPredicate` | `membership` (35) | yes |
| `marks.mjs`: `listenerRefusal`, `MODULE_ORDER` | `membership` (35) | yes |
| `marks.mjs`: `eventsOf`, `standardsOf`, `moneyOf`, `peopleOf`, `entitiesOf` | `events` (55), `standards` (61), `money` (63), `people` (66), `entities` (54) | yes |
| `find.mjs`: `normalizeType` | `record-grammar` (1) | yes |
| SQL read, no import: `bundles` (`record-core` R37), `readings`, `reading_refs`, `capture_text` (`extraction`'s read contracts), `register` (`provenance` R48), `content` (`content`), `entities` (`entities` R35) | `record-core` (34), `extraction` (52), `provenance` (41), `content` (53), `entities` (54) | yes |

**Four calls into `retrieval`'s own remaining code, a P4 problem if they were imports or method calls on a `Retrieval`.** Today `Finder` and `Browser` take the `Retrieval` instance `r` and call `r.rowsOf`, `r.oneOf`, `r.sight`, `r.planOf`, `r.runQuery`, `r.localeOf`, `r.entitiesFor`, `r.recordedReads`, `r.browseMarks`; `findIn` calls `this.selectionRead`, `this.sight`, `#one`, `#rows`; `browse.mjs` imports `SELECTION_ID_CHUNK` from `./schema.mjs`. The cut:

1. **`r.rowsOf` and `r.oneOf`** are two closures over the Durable Object's `sql`. The module is handed the same `sql` in `deps` and makes its own two (they read only the tables named above, which are other modules' read contracts).
2. **`r.entitiesFor`, `r.recordedReads`, `r.browseMarks`** are not `retrieval`'s at all: their only reader is the moved code. They and their slots move (R4, R11), so no call goes back.
3. **Five host reads stay `retrieval`'s because their rule is `retrieval`'s** (R28's gate, R69's zone and locale, R77's selection): `sight(viewer)`, `planOf(input)`, `runQuery(statement, tally)`, `localeOf()` and `selectionRead(args)`. `retrieval`'s constructor builds the module and hands it these five as functions (`deps`, R14). The edge is `retrieval` → `retrieval-browse` only; the moved code reads the functions it was given and imports nothing of `retrieval`. In a test the five are stand-ins (§8).
4. **`SELECTION_ID_CHUNK`** (64, the SQL variable bound) is an import of `retrieval`'s `schema.mjs`. The module holds its own `BROWSE_ID_CHUNK = 64`; `retrieval`'s tests assert the two are equal. (Passing it in `deps` is the alternative; a constant is smaller, and nothing varies it.)

No import in the other direction is added except `retrieval`'s own `import { retrievalBrowseOf, … } from "../retrieval-browse/index.mjs"`, which P4 allows (`retrieval` is later).

## 4. What stays in `retrieval`, and the delegating shim

Stays: everything but §2. The shim, about 45 lines in `index.mjs`:
- `import { retrievalBrowseOf, <the re-exported names> } from "../retrieval-browse/index.mjs"`, and the existing `export { … }` lines pointing at it instead of `./findin.mjs` and `./browse.mjs` (the names in §1's exports; `retrieval/index.mjs` re-exports so `citation`, `following`, `screens-daily` and the tests that import them from `retrieval` keep working);
- in the constructor, `this.browseModule = retrievalBrowseOf({ sql, membership, host, order, entities, recorders, sight, planOf, runQuery, localeOf, selectionRead })`, where the last five are bound arrows to `retrieval`'s own;
- `findIn(args)`, `browse(args)`, `registerRecordedBy(module, fn)`, `registerBrowseMarks(module, fn)` each one line calling the module's;
- the `findin` and `browse` arms of `retrievalRoutes` unchanged (they call `r.findIn` and `r.browse`);
- the `finder` and `browser` public fields go (nothing outside `index.mjs` reads them).

`searchFields` gains `scopes` and `search`/`meaningRows` gain `scope` (retrieval R87), a new `ROUTES_CROSSED` refusal (R88) and the existence-only projects (R89): about 70 lines more, bringing `retrieval` to about 2,940. Still about 1,060 under the mark.

## 5. Requirement ids

| `retrieval` | `retrieval-browse` | what |
|---|---|---|
| R73 | **R1** | `findIn` (scope, refusals, answer, recorded, `selectionRead`, `title` and the later amendments) |
| R74 | **R2** | the kinds, the matchers' shapes, the table result |
| R75 | **R3** | `FIND_MATCHERS`, language sets |
| R76 | **R4** | `registerRecordedBy` |
| R80 | **R5** | `title` |
| R81 | **R6** | `content_id` |
| R82 | **R7** | line breaks |
| R83 | **R8** | the sheet match, **with N1238's amendment: `row`** |
| R84 | **R9** | people by alias |
| R85 | **R10** | `browse` |
| R86 | **R11** | `registerBrowseMarks` |
| new | **R12** | `browse`: `state`, `total`, `awaiting_review` (DEC-330 A14) |
| new | **R13** | `awaiting_review` filter, `BROWSE_SCOPES`, `scopeMembers` (A15) |
| new | **R14** | `retrievalBrowseOf(deps)`, the seam |
| R29, R32, R34, R28 (copies) | **R15–R18** | hidden as absent; writes nothing; no place; the gate's mark |

**Retired in `retrieval` as "moved to `retrieval-browse` R<n> (T51, K3841)":** R73 → R1, R74 → R2, R75 → R3, R76 → R4, R80 → R5, R81 → R6, R82 → R7, R83 → R8, R84 → R9, R85 → R10, R86 → R11. Never reused.

**Added in `retrieval` (all unmet, T51):** R87 (the scope list and a search narrowed by it), R88 (a query crossing routes is refused), R89 (the projects known only to exist), R90 (the old exports delegate). R90's test is the one that holds T51-42: `op=findin` and `op=browse` through `retrievalRoutes` answer exactly what `retrievalBrowseOf` answers.

**Re-worded in `retrieval` (meaning unchanged):** Status, Size, Purpose (one sentence), Uses (the `retrieval-browse` line; the edges only the moved code used), Suggestions' T35 and T36 bullets (their `findIn` is now `retrieval-browse`'s, left as history).

**N1238's second half, and a deviation from the plan entry.** The plan puts "R83 names the field holding a sheet match's row" on T51-42 (retrieval). R83 is a moved requirement, so retired in `retrieval`; the amendment is therefore made in its copy, `retrieval-browse` R8, and built by T51-29 with the copy (the field is `row`; `screens-daily` reads `it.row` already). T51-42 then holds only R90, the deletion, the re-point and the stale comment `checks.mjs`:73. BOB's to confirm; the alternative, amending a retired id, breaks "ids never reused".

## 6. DEC-330 A14 and A15: which read answers each fact

The facts the `finder` screen's states g and h draw (`screen.finder.table.*`, `screen.finder.scope.*`, `screen.finder.route.*`, `screen.finder.covered.*`), against the reads that exist at T50's close.

| fact the screen needs | answered today by | owner and what is added |
|---|---|---|
| table, one row per item: its title | `browse` `title` (R85, now `retrieval-browse` R10) | nothing |
| its type (document, question, action, plan, person, organization) | `browse` `kind` (R10) | nothing; "Case" (the mock's row) is not a browse kind: doubt 2 |
| its state | none: browse items carry no state; `listBundles` (R63) has `current_state` for bundles | **`retrieval-browse` R12** (new): `state` on each item |
| updated | `browse` `last_changed` (R10) | nothing |
| the count "N items" | `browse` `count` is the page's, not the whole set's; `listBundles` uncapped is a bundle array without entities | **R12**: `total`, over the whole filtered set |
| "M awaiting review" | none | **R12**: `awaiting_review` (documents in state `collected`, doubt 3) |
| paging a record of more than 200 items | `browse` `limit` 200 with `next` (R10) | nothing; sorting is the screen's |
| the scopes (Look in) | none: `searchFields` (R16) publishes fields, columns, facets, the meaning arms and the syntax, no scope; the closed `kinds` and `only` lists are only named in a refusal | **`retrieval-browse` R13** (new): `awaiting_review` filter, `BROWSE_SCOPES`, `scopeMembers`; **`retrieval` R87** (new): `searchFields().scopes`, and `scope` on `search` and `meaningRows` |
| route 1 count, documents matched in titles, notes and details | `search` `total` (R6); `widen` (R9) | nothing |
| route 2 count, "N passages in M documents" | `meaningRows rows=passage` `total` and `scope.documents_with_rows` (R11, R13) | nothing |
| route 3 count, subjects named | none in `retrieval`: `entities` reads `entitybyalias` and `concerns` | `entities` (T51-30, which already names it; `entities.md` is not this map's to edit) |
| the three routes counted apart, never added | the screen draws `screen.finder.route.apart`; no read adds them | nothing |
| a cross-route search refused | none: `query-language` (R1) accepts `OR` across a field and `passage:` | **`retrieval` R88** (new): `ROUTES_CROSSED`; it may need `query-language` to name each term's route in its parse (doubt 7) |
| bounds (how much was searched) | `search` `limit`/`total`/`truncated` (R6); `meaningRows` `limit`/`offset`/`total` (R11); R14's `captures_bound`, `captures_truncated`; the frontier's `limit`/`truncated` (R35–R37) | nothing |
| overlap | not drawn: DEC-330 states the three counted apart and never added; the census listed it for the old interface | nothing; if the design later draws it, it is the documents in two routes' answers, and no read gives that |
| the four levels (R13 `levels`) | `meaningRows` `levels`, with `says` (R13) | nothing |
| level 1 "Findings and connections that match: n" | `meaningRows` `total` for the arm the screen names (`leg`, `connection`) | nothing; whether n is one arm or two is the screen job's (doubt 6) |
| level 2 "Passages were read from {read} of the {n} documents searched" | `scope.documents_with_rows`, `scope.documents`, `scope.documents_without_rows` of `rows=passage` (R13) | nothing |
| the tally | R14's content-axis tally over the captures in scope | nothing |
| level 3 "Searched {n} of the {all} documents your team holds; {hidden} are in projects where you can see only that they exist" | `scope.documents` gives {n}; {all} as the documents the viewer may read: `retrieval-browse` R12's `total` for `document`; {hidden} **none, and none may**: R29 says no answer states how much was withheld | **`retrieval` R89** (new): `scope.existence_only_projects` (the projects, not a document count); the wording is the design's: doubt 1 |
| level 4 "Nobody looked in {place} for this yet" | `frontier` `never_looked` (R36, R40) | nothing |
| "See where nobody looked" (the act) | `frontier` (R35) | nothing |

New requirements by module: `retrieval-browse` R12, R13; `retrieval` R87, R88, R89. None names English: the screen draws the keys (K3366).

## 7. Users and what they re-point

| user | uses today | re-points | by |
|---|---|---|---|
| `citation` `src/citation/index.mjs` | `retrieval.registerRecordedBy("citation", …)` | nothing: `retrieval` delegates (R90) | — |
| `citation` `test/m/citation/recorded.test.mjs` | `import { RECORDED_NONE_REGISTERED } from "../../../src/retrieval/findin.mjs"` | `…/src/retrieval/index.mjs` (the re-export) | T51-42, one line, in the commit that deletes `findin.mjs` |
| `following` `src/following/index.mjs` | `retrieval.registerBrowseMarks` | nothing: delegated | — |
| `plane` `src/plane/store.mjs` | the registration comment | nothing | — |
| `screens-daily` (`find-in.mjs`, `finder`) | `findIn`, `browse` ops, `it.row` | reads R12 and R13 and `row` (T51-118) | its own job |
| `answers` (`ops.mjs`, `standing.mjs`) | `retrieval.findIn` for the standing question (DEC-164 (6)) | nothing | — |
| `membership` `MODULE_ORDER`, its `module-order.test.mjs` | the ids | gains `retrieval-browse` before `retrieval` (the format check's "accepted red", as `corpus-export`'s, K1043) | `membership`'s L2 job (earlier; or the opening act, BOB's) |
| `docs/development/ux-substrate/screens/words-reads.json` (generated from `words-reads.src.mjs`), `modules.retrieval.reads` | the 64 keys | splits: the 15 keys to a `modules["retrieval-browse"].reads` | the design lane, before T51-29's words test (doubt 5) |
| `op-declarations`, `op-grades`, `control-plane`, `affordances` | `findin`, `browse`, their grades and stamps | none: the ops keep their names and specs | — |
| the bundled plane (`bio-plane/dist`, `release/`) | `src/retrieval/findin.mjs`, `browse.mjs` | regenerated at the layer close (generated artifact) | the layer's close, BOB's |

## 8. Tests

Today (`bio-plane/test/m/retrieval/`, 5,846 lines): `browse.test.mjs` 199, `findin.test.mjs` 401, `t50.test.mjs` 288, `t37.test.mjs` 202, `t36.test.mjs` 333, `words.test.mjs` 72, with `fixture.mjs` 243 building a whole `Retrieval`. A test cannot import a later module, so a moved test cannot use `fixture.mjs`'s `Retrieval`.

- **To `bio-plane/test/m/retrieval-browse/`** (about 1,300 lines), driven through `retrievalBrowseOf` with a fixture of its own (a store with `record-core`, `membership`, `extraction`, the tables the `bundles`, `readings`, `capture_text`, `register`, `content` and `entities` contracts name, and stand-in `sight`, `selectionRead` and `localeOf`; `planOf` and `runQuery` from `query-language`'s `compile` and a gated executor, which is earlier):
  - `browse.test.mjs` whole, less its last test (`op=browse` through `retrievalRoutes`);
  - `findin.test.mjs` whole, less its last test (`op=findin` through `retrievalRoutes`);
  - `t50.test.mjs` (R73 (d), R80–R84) and `t37.test.mjs` (the merged `.docx` table, the unnamed ordinal, a column's recorded fact, the no-matcher language, requirements) whole;
  - `t36.test.mjs`, the recorded arms: `recorded`, the four reads' call order, a table result's relation, `recorded_read` and `recorded_not_read`, `registerRecordedBy`'s refusals, the `.docx` table (about 190 lines);
  - `words.test.mjs`' arms that read the matchers and the recorded sentence, with the 15-key list.
  - New: R12 (counts, with a hidden document), R13 (`scopeMembers`, the `awaiting_review` filter), R14 (the stand-in `deps` test, a missing host read refused).
- **Stay in `retrieval`, re-tagged as R90's delegation tests:** the two `retrievalRoutes` tests above; `t36`'s `selectionRead` (R77, retrieval's) and `findIn` over a `{selection}` (needs real selections), and its test of the four real `recordedBy` reads; a test that `BROWSE_ID_CHUNK === SELECTION_ID_CHUNK`; a test of R87 to R89.
- **A doubt for the job:** the `term` kind needs `planOf` to compile a `passage:` statement. If `query-language`'s `compile` alone does not stand in for `retrieval`'s (it names `retrieval`'s projection relation to a field search, not to a passage), the `term` arms stay with the delegation tests rather than weaken them.

## 9. Risks

1. **No double holding across tranches (K624).** The copy and the deletion are in T51: T51-29 first in L5 (merges early), T51-42 after it deletes `findin.mjs`, `browse.mjs` and the moved methods in the same commit that adds the delegation. Between the two merges `findin.mjs` exists twice; nothing composes the new one until T51-42 builds it in `retrieval`'s constructor (only the new module's own tests run it).
2. **Registration slots.** `registerRecordedBy` and `registerBrowseMarks` hold their slot in the new module; a later module that registered on `retrieval` before T51-42 was built finds the slot in the module through the delegating method. The tests' world is built by `retrievalOf` after T51-42; before it, `retrievalBrowseOf` is not built in the plane. No registration is lost or doubled.
3. **The word list.** `words-reads.json` holds one `reads` list for `retrieval` (64 keys). Until the design lane splits it, the new module's words test cannot assert `WORD_KEYS` equals a list for `retrieval-browse`; the fallback in T51-29 is "every key is in the word list, and the two modules' lists together equal `retrieval`'s old one". The 15 key names do not change.
4. **`membership`'s `MODULE_ORDER` test.** The new id in the order is the same accepted red `corpus-export` had (K1043) until `membership`'s list gains it.
5. **Generated artifact.** The plane bundle regenerates with `src/retrieval-browse/*.mjs`.
6. **R12 and R13 are new code in a split job.** T51-29 builds the copy first and R12 to R14 after it, so a failure in the new code never hides a copy that changed meaning (K617: "no change to any requirement's meaning").

## 10. T51 job sequence

1. **T51-29 RETRIEVAL-BROWSE (new, L5, first):** create the directory, copy §2, build the five host reads' stand-ins and the fixture, move the tests (§8), write `requirements/retrieval-browse.md`'s R12 to R14, set `paths`, `tests`, `uses` (§1) in `modules.json` (its own entry, K1043). Merges early.
2. **T51-42 RETRIEVAL (L5, after):** delete the copies (§2), add the shim (§4), re-point (§7), retire the ids and add R87 to R90, drop `civil-time` and `calc-grammar` from its `uses` row if nothing else imports them (the job greps), the stale comment `checks.mjs`:73, and report the size.
3. **T51-118 SCREENS-DAILY (L11):** draws on R12, R13, `retrieval` R87 to R89 and `row` (R8).

## 11. Doubts for BOB (best reading in each)

1. **The honesty panel's "26 are in projects where you can see only that they exist" against `retrieval` R29** ("no answer states how much was withheld"). A count of documents in projects the viewer sees by existence only discloses a size the viewer may not know. Best reading: the plane answers the *projects* the viewer already knows exist (`membership` R44, EXISTENCE) and never a document count (`retrieval` R89), and "{all}" is the documents the viewer may read; the drawing's `screen.finder.covered.docs.says.*` text must then name projects, not count documents. This changes a drawn sentence and R29's reach, so it goes to Bob through BOB only if BOB reads R29 as doctrine and not detail; I read it as detail (the design's wording, not R29's meaning, gives way).
2. **"Case" in the table and as a scope.** The mock's table has a published Case row and the scope list has "Cases"; `browse`'s five kinds (DEC-238 F1) have none, and a case is not a bundle type. Best reading: no case kind or scope is added at T51-29; the screen job draws what `browse` lists, and a Cases scope waits on a read from `case-authoring` or `publication`. Reported, not built.
3. **"Awaiting review".** Read as an `information` bundle in state `collected` (the design's `state.item.review`), "reviewed" as `verified`. A different mapping (e.g. another type's state) changes R12 and R13 only.
4. **R83's amendment lives in `retrieval-browse` R8**, not `retrieval` (§5). The plan entry T51-42 says retrieval; the read moves with its id.
5. **`words-reads.json` is the design lane's.** Its `modules.retrieval.reads` splits in two; BOB asks the design channel (no ask of Bob).
6. **Level 1's "Findings and connections that match: n".** One count over two arms, or two counts? No new fact is needed; the screen job's detail.
7. **R88 may need `query-language` to state each term's route.** Not mine to edit here; BOB adds that requirement to `query-language`'s file or lets T51-42 read the parse it has.
8. **The subject route** (`entitybyalias`, `concerns`) is `entities`' (T51-30, whose file another worker edits); nothing added here.
9. **The `term` kind's tests** may not stand alone (§8): they stay with the delegation tests if so.
10. **K3841** is cited as BOB gave it; it is not yet in `rulings.md`.

## 12. Decided by BOB (for rulings)

The cut (§0 to §3: `findin`, `browse`, the find's entry and scope and the two registrations, with five host reads); the new module's `paths`, `tests` and `uses` (§1); the ids moved and retired (§5); R83's amendment in the new module's R8; A14 and A15's settlement (§6) with the new requirements R12 and R13 here and R87 to R90 in `retrieval`; the doubts' best readings (§11). To be recorded once in `build/rulings.md` and reported to Bob as done.
