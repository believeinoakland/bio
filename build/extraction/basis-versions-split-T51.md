# basis-versions → basis-version-grammar — split map

**Status** · Draft by a planning worker for BOB #215, 2026-10-18; plan entries T51-148 (new module) and CR-9 (basis-versions); P6, K624, K657, K1043, K3268; N1251, N1215. Read in full: `requirements/basis-versions.md`, `extraction/retrieval-browse.md` (the format), every file of `bio-plane/src/basis-versions/` (`index.mjs`, `grammar.mjs`, `checks.mjs`, `conclude.mjs`, `text.mjs`, `schema.mjs`, `shared.mjs`), the `basis-versions` row of `build/modules.json` and the ids and uses of every module before it; in part: the test headers and titles, `answer-envelope/families.mjs`, `record-core`'s `registerGrammar`, `plan/current.md` T51-148, CR-9, M-T51-1. Users found by grep. The plan names this file `basis-versions-split.md`; it is written under the name BOB gave.

**Why.** `wc -l` over `bio-plane/src/basis-versions/` (the module's `paths`) today: `index.mjs` 1,725, `checks.mjs` 993, `grammar.mjs` 654, `conclude.mjs` 568, `text.mjs` 146, `schema.mjs` 88, `shared.mjs` 20 = **4,194** (the plan says 4,199; the five lines are the measure's). Over the 4,000 mark of P6 and K74's one-session read.

## 0. The answer

**The cut is the version grammar: all of `grammar.mjs` and the grammar half of `checks.mjs`.** It is the one seam in the module that is a true provider: pure code (no storage, no instance, no ops) that the rest of the module calls and that calls nothing of the rest, so the new module can sit before `basis-versions` (P4). The other seams fail P4 or are too small: `conclude.mjs`, the six acts, `narrow` and `appendVersion` need the instance's private `#repromote`, `#visible`, `#doc`, `#withVersion`; the read side (about 500 lines) would leave about 3,700, and the acts read `currentOf`.

| | lines (with comments) |
|---|---|
| `basis-versions` before | **4,194** |
| `basis-versions` after (CR-9) | about **3,080**: `index.mjs` about 1,730, `conclude.mjs` 568, `checks.mjs` about 535, `text.mjs` about 142, `schema.mjs` 88, `shared.mjs` 20; `grammar.mjs` gone. Margin to the mark about 920 |
| `basis-version-grammar` | about **1,185**: `grammar.mjs` about 659, `checks.mjs` about 485, `index.mjs` about 40. Margin about 2,800 |

Not moved: `schema.mjs` (the tables stay with their one writer, R7; K4), `text.mjs` (the document's line edits, read by `conclude.mjs` and `index.mjs`), `shared.mjs`, `conclude.mjs`, and everything of `index.mjs` but its import and re-export lines. The check (R6) and projection (R7) stay: they read SQL and call `content` and `accepted-work`; they call the grammar's functions, which is the allowed direction.

## 1. The new module

| | `basis-version-grammar` |
|---|---|
| name | not in `modules.json` (checked); parallels `record-grammar`, `inquiry-grammar`, `calc-grammar`, `connection-grammar` |
| purpose | The grammar of an inquiry's basis versions: the version block's findings (R1–R3), the four-state machine (R4), the composition a version freezes to and the normaliser a writer and a comparison both read (R5), the refusal rows and vocabularies those raise, its registration in record-core's C-2.8 slot (R6), the name code (R7). Pure; never throws |
| layer | 6 |
| place | index 81 in `modules.json`, directly before `basis-versions` (now 82), after `citation` (80); row empty (K1043) `"paths": [], "tests": [], "uses": []`, which this map does not edit |
| from | none (K624) |
| `paths` | `["bio-plane/src/basis-version-grammar/"]`, set by T51-148 when it creates the directory |
| `tests` | `["bio-plane/test/m/basis-version-grammar/"]`, likewise |
| `uses` | `["setup-words", "record-grammar", "text-chain", "content", "connections", "inquiry-grammar"]` (indexes 0, 1, 18, 53, 58, 74, each below 81; proof in §3). Every one is already in `basis-versions`' own `uses`, so no new edge is made except `basis-versions` → `basis-version-grammar` (CR-9 adds it) |
| entry | no factory: a library, as `inquiry-grammar` is. `index.mjs` re-exports `grammar.mjs` and `checks.mjs` |
| exports | `basisVersionFindings`, `versionsIn`, `versionAsWritten`, `compositionDiff`, `sameComposition`, `isImportedRef`, `isDerivedKindRef`, `fmSafe` (§2), `BASIS_VERSION_GRAMMAR`, `registerBasisVersionGrammar`; `BASIS_VERSION_GRAMMAR_CHECKS` (new name, §4), `VERSION_KIND_CHECKS`, `VERSION_STATES`, `VERSION_MACHINE`, `VERSION_REASON_REQUIRED`, `versionNeedsReason`, `VERSION_RELATIONSHIPS`, `VERSION_NAME_RE`, `SUGGEST_KINDS`, `SUFFICIENCY_UNCLAIMED`, `SUFFICIENCY_CLAIM_STATES`, `sufficiencyClaimState`, `isSufficiencyUnclaimed` |

## 2. What moves (by copy, K624)

| moved | from | lines | requirement |
|---|---|---|---|
| the whole file: `basisVersionFindings` and its arms, `isImportedRef`, `isDerivedKindRef`, `canon`, `legTargetType`, `versionsIn`, `sameComposition`, `versionAsWritten`, `compositionDiff`, `BASIS_VERSION_GRAMMAR`, `registerBasisVersionGrammar` | `grammar.mjs` 1–654 | 654 | R1–R5, R43, R54 |
| `fmSafe`, copied into the new `grammar.mjs` (`versionAsWritten` reads it; `text.mjs` keeps its own until CR-9, then imports it from here, so the rule is held once) | `text.mjs` 11–14 | 4 | R5 |
| imports, `GRAMMAR_WHERE`, the sufficiency block (`SUFFICIENCY_UNCLAIMED`, `SUFFICIENCY_CLAIM_STATES`, `sufficiencyClaimState`, `isSufficiencyUnclaimed`), and the block comment of the refusals | `checks.mjs` 15–16, 18–20, 22–147, 149–191 | 172 | R3, R35 |
| the rows the grammar raises, as `BASIS_VERSION_GRAMMAR_CHECKS`: C-25.1, .2, .36, .3, .4, .5, .6, .7, .8, .9, .10 (192–301); C-25.12, .13, .14, .15 (323–363); C-25.19 (418–437), with the closing brace (438) | `checks.mjs` 192–301, 323–363, 418–438 | 172 | R1–R3, R54 |
| `VERSION_STATES`, the machine and the reason predicate, `VERSION_RELATIONSHIPS`, `VERSION_NAME_RE`, `SUGGEST_KINDS`, `VERSION_KIND_CHECKS` (C-27.15) | `checks.mjs` 440–442, 444–516, 697–705, 707–731, 772–787 | 126 | R1, R4 |

Stays in `checks.mjs` (about 535 lines with the shim of §4): `VERSION_ACT_CHECKS` (518–696), `CONCLUDE_ACT_CHECKS` (789–888), `NARROW_CHECKS` (890–993), `BOILERPLATE_FORMS` and `isBoilerplate` (733–770; only `narrow` and `run-productions` read them), and the seven rows that only the store or a read can raise: C-25.11 `VERSION_FROZEN` (302–322), C-25.16 `VERSION_LEG_UNRESOLVED`, C-25.17, C-25.18, C-25.37–.39 (364–417).

Edits in the copy, and only these: `grammar.mjs` line 18 (`fmSafe` local); lines 114 and 383 and the import and re-export lists (19–25) name `BASIS_VERSION_GRAMMAR_CHECKS`, and re-export only what the new `checks.mjs` holds; the `where` of the moved rows that say `src/basis-versions/grammar.mjs` (`GRAMMAR_WHERE`) say `src/basis-version-grammar/grammar.mjs`. The moved code raises none of the seven rows that stay (checked key by key against every `push` site).

## 3. Imports of the moved code (P4 proof)

`grammar.mjs` and `checks.mjs` import only: `record-grammar` (1: ids, types, roles, grades, `isMachineIdentity`), `inquiry-grammar` (74: `GROUND_LABEL_RE`, `leadLegFindings`, `checkLegExtentGrammar`, `registerInquiryGrammar`, the imported, calculation, occurrence and derived-connection leg arms and their patterns, `DERIVATION_FIELDS`), `connections` (58: `themeLegFindings`), `content` (53: `legContentId`, `legExtent`), `text-chain` (18: `canonicalExtent`, from `../textchain.mjs`), `setup-words` (0: `word`). Each is below 81 and already in `basis-versions`' `uses`. No import of `basis-versions`, `inquiry`, `promotion`, `membership`, `retrieval`, `bias` or `accepted-work`. `record-core` is reached only as the `record` argument of `registerBasisVersionGrammar`, so it is not listed (a format check drops an unused edge). No cycle: no module before 81 imports `basis-versions` (grep).

## 4. How `basis-versions` delegates (CR-9; re-exports, no user re-points, K3268)

- `index.mjs`: lines 49–52 (the imports from `./grammar.mjs` and `./checks.mjs`) and 61 (`export * from "./grammar.mjs"`) become `import { … } from "../basis-version-grammar/index.mjs"` and `export * from "../basis-version-grammar/index.mjs"`, plus `export { VERSION_ACT_CHECKS, CONCLUDE_ACT_CHECKS, NARROW_CHECKS, BOILERPLATE_FORMS, isBoilerplate, BASIS_VERSION_CHECKS } from "./checks.mjs"`. `grammar.mjs` is deleted.
- `checks.mjs` keeps its public name and shape. It holds the stay-rows as `BASIS_VERSION_STORE_CHECKS` and exports `BASIS_VERSION_CHECKS = { ...BASIS_VERSION_GRAMMAR_CHECKS, ...BASIS_VERSION_STORE_CHECKS }`, so every reader of the one object (`index.mjs` 236–238, 276–283, 482; `skilldoctrine`) sees the same rows; it re-exports `VERSION_KIND_CHECKS` and `SUFFICIENCY_UNCLAIMED` from the new module (`conclude.mjs` reads the latter, unchanged). `answer-envelope/families.mjs` and `review`'s invariants test read the namespace of `src/basis-versions/checks.mjs`: it still holds every `_CHECKS` family and C-32.2, so neither re-points. The merge changes key order of the object; the job greps for a reader that depends on it.
- The factory (`basisVersionsOf`, line 1664) calls the new module's `registerBasisVersionGrammar(record)` unchanged. **The registrant stays `basis-versions`** (§11): `registerBasisVersionGrammar(record, module = "basis-versions")`, so record-core's `module`, `heldBy` and `grammars()` answers, the error text and the registration order are what they are today.
- `text.mjs` drops its `fmSafe` and imports the new module's.

## 5. Requirement ids

| `basis-versions` | `basis-version-grammar` | what |
|---|---|---|
| R1 | **R1** | description, name, state, hidden, kind, state-by (C-25.1, .2, .12, .13, .19, C-27.15) |
| R2 | **R2** | `derived_from` a tree; leg and ground rows name a version (C-25.7, .8, .15) |
| R3 | **R3** | each version's legs obey `inquiry`'s leg grammar; grounds, relationship, regroup; imported legs; every kind of leg (the standard half, not yet met) |
| R4 | **R4** | the machine and `versionNeedsReason` |
| R5 | **R5** | `versionsIn` (composition), `versionAsWritten` |
| R43 | **R6** | the registration in the C-2.8 slot; `registerBasisVersionGrammar`; the order of findings |
| R54 | **R7** | `VERSION_NAME_MALFORMED` (C-25.36) |
| R35 (grammar rows), copied | **R8** | each grammar row is held with its C-number and translation, with its test |
| R36, copied | **R9** | no place is named in the translations these rows carry |

**Retired in `basis-versions` as "moved to `basis-version-grammar` R<n> (T51, BOB's ruling at this map)":** R1 → R1, R2 → R2, R3 → R3, R4 → R4, R5 → R5, R43 → R6, R54 → R7. Never reused. R35 and R36 stay (they hold the rows that stay and the re-exported ones); R8 and R9 are their copies for the new module (the pattern of retrieval-browse R15–R18).

**Re-worded in `basis-versions` (meaning unchanged):** Status, Size, Purpose (one sentence), the heading of "The grammar", R6, R12, R14, R29, R51 (which cite R1–R5 by number: now "`basis-version-grammar` R<n>"), Uses (the new line; `record-grammar`'s sentence), Suggestions' Factory bullet. R3's standard sentence moves with R3 (§8).

## 6. Tests

Today `bio-plane/test/m/basis-versions/`: 29 files, 4,879 lines; `fixture.mjs` builds a `world()` with `promotion`, `retrieval` and `basisVersionsOf`, which a test of the new module cannot import (a later module).

- **Copied to `bio-plane/test/m/basis-version-grammar/`** (about 550 lines, the arms that need no `world()`): `grammar.test.mjs` R1–R5 (25–197, about 175), with R35's grammar-row share and R36 as R8 and R9 (about 20 more); `sufficiency-state.test.mjs`' first three tests (54–94); `registration.test.mjs`' four tests that need only a `record` (the corpus judged by inquiry-grammar's golden, the sub-slot; **`amended()` (line 22) is dropped in this copy: N1216**); `imported-legs.test.mjs`' first and third (38, 70); `legkinds-compare.test.mjs`' R3 findings halves (34, 45, 62); `name-form.test.mjs`' findings arm. A small helper of their own (`block`, `version`) replaces the fixture's, about 40 lines.
- **Stay in `basis-versions`** (they drive R6, R7, R29 and the acts through a real promotion and run unchanged against the delegation, which is the P11 proof): every test that calls `world()`, among them `versions`, `promote`, `versionstate`, `acts`, `narrow`, `own-reading`, `machine-passage`, `registration`'s factory test, `name-form`'s three promotion arms.
- CR-9 deletes the copied arms from `basis-versions`' tests in the commit that deletes `grammar.mjs` (about 450 lines).

## 7. Users and what they re-point

None re-points: `basis-versions` re-exports every name. Readers by grep: `affordances.mjs`, `strength`, `run-productions`, `reevaluation`, `contradiction`, `skilldoctrine.mjs` (names from `index.mjs`); `answer-envelope/families.mjs` and `test/m/review/invariants.test.mjs` (the namespace of `checks.mjs`); `plane/stats.mjs` (`BasisVersions`); `test/m/contradiction/fixture.mjs` (`schema.mjs`, which stays); the factory's callers are untouched. `membership/order.mjs` `MODULE_ORDER` gains `basis-version-grammar` before `basis-versions` (line 86): the accepted red of K1043 until BOB does it at R6's START. The bundled plane regenerates at the layer's close. BOB's P11 re-run after the merge: agent-steps' fixture (K3886; not in this checkout), `strength`, `contradiction`, `run-productions`, `reevaluation`, `affordances`, `skilldoctrine`, `answer-envelope`, `review`, `plane`.

## 8. Interplay with CR-9's other items

1. **Standard legs (N1251, K3873).** CR-9 names "`grammar.mjs`'s target arm", which is code this split takes (`grammar.mjs` 344–360: the arm after `derived`). Once CR-9 deletes `grammar.mjs`, a job of `basis-versions` cannot build the arm. Best reading: **T51-148 builds it in the new module, in a second commit after the copy** (the order of retrieval-browse's R12–R14; K617's "no change to meaning" holds: R3 already states the arm and marks it not yet met): `standardLegFindings` is exported by CR-8 (today `inquiry-grammar/grammar.mjs` 1468, not exported), which merges before this job; the arm is a `standardLegFindings(lbl, leg, findings)` call in the `imported`/`derived` chain, with the grade and extent arms skipped as for a derived leg. Its pure test (a standard leg raises no `VERSION_LEG_NOT_CITABLE`; a standard leg stating a part is refused by inquiry-grammar's own code; a lead leg is still refused by name) is in the new module's tests (the `test.todo` at `legkinds-compare.test.mjs` 143 and its control at 145). CR-9 keeps the half through a promotion: a member's own reading (R51) on a question with a passage, a standard and a calculation leg holds all three, which also proves R6's resolve and content plan and R7's `target_type` for a standard (code that stays in `basis-versions`). BOB amends the two plan lines; the second commit changes the new module's R3 from "not yet met" to met.
2. **`DIVIDED_CANNOT_RESTRUCTURE` (R52; N1070, K3264).** Untouched by the cut: `#dividedRefusal`, `narrow`, `appendVersion`, `#moveVersionState` and `conclude` stay, as does R52. CR-9 names it in R52 and writes its test in `basis-versions`.
3. **R55 refusals by key (DEC-337, U359).** The three rows `VERSION_COMPARE_*` (C-25.37–.39) are among the seven that stay (§2), so CR-9 changes their `translation` to `word("refusal.VERSION_COMPARE_…")` in its own `checks.mjs`. Had the whole `BASIS_VERSION_CHECKS` moved, a job of `basis-versions` could not make that edit. The keys are the design lane's (owed).
4. **`amended()` in R43's test (N1216).** The test is R6's copy in the new module (§6); the copy is built without `amended()`, and CR-8's golden must hold `VERSION_NAME_MALFORMED` first.

## 9. Risks

1. **No double holding across tranches (K624).** Copy and deletion are both in R6 (T51-148, then CR-9 after CR-8). Between the merges about 1,130 lines exist twice, nothing composes the new module, and `basis-versions` stays 4,194.
2. **Row object split.** `BASIS_VERSION_CHECKS` is read as one object (`skilldoctrine`, `answer-envelope`, tests); the merged export keeps names and rows, not key order. `answer-envelope`'s `compose` keeps each code once.
3. **`where` strings** of the moved rows change file; the job greps their readers (control-plane's region checks, `skills`) first.
4. **CR-9 and R3 in two modules** (§8.1) is a plan amendment; without it CR-9 cannot meet the standard half.
5. **`uses` after CR-9.** `basis-versions` keeps `inquiry-grammar`, `setup-words`, `text-chain`, `record-grammar` (imports) and `connections` (the `refs` read, no import); the job greps before dropping an edge and adds `basis-version-grammar`.

## 10. T51 job sequence

1. **T51-148 BASIS-VERSION-GRAMMAR (new, R6, directly before basis-versions):** create the directory; copy §2; build the copied tests (§6); set `paths`, `tests`, `uses` in its row (K1043); write `requirements/basis-version-grammar.md` (R1–R9); a second commit builds R3's standard arm and its test (§8.1). Merges after CR-8.
2. **CR-9 BASIS-VERSIONS (after T51-148, CR-8):** delete the copies (§2), add the re-exports (§4), retire R1–R5, R43, R54 and re-word (§5), delete the copied test arms, make R55's three rows read by key, relay and test R52, write the `test` of §8.1's promotion half, add the edge, report the size.
3. BOB: the `MODULE_ORDER` entry at R6's START; P11's re-run (§7).

## 11. Doubts for BOB (best reading in each)

1. **The name:** `basis-version-grammar`, as `inquiry-grammar` stands to `inquiry`; alternative `version-grammar`.
2. **The registrant of R6's grammar:** `basis-versions` (name unchanged), so nothing observable moves in a split. A new name changes `module` in record-core's answers, the audit's labels and `registration.test.mjs`.
3. **The standard arm in the new module** (§8.1), T51-148's second commit; the alternative is a job the plan has no entry for.
4. **The seven rows that stay** (§2): R55's words (CR-9) and the `where` regions stay with their sites, at the cost of one merged export; moving the whole object puts CR-9's R55 edit outside any job's paths.
5. **R35 and R36 stay with copies R8 and R9**: they hold rows on both sides.
6. **A library, not a provider of ops:** no factory, tables or ops, as `inquiry-grammar`; the relief is about 1,110 lines.

## 12. Decided by BOB (for rulings)

The cut (§0, §2); the name, layer, place, `paths`, `tests` and `uses` (§1); the ids moved, retired and copied (§5); the row object split and the merged export (§4); the registrant's name (§11.2); the standard arm in the new module and the amendment of T51-148's and CR-9's plan lines (§8.1); the doubts' best readings (§11). To be recorded once in `build/rulings.md` and reported to Bob as done.
