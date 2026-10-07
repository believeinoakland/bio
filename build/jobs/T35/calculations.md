# calculations (T35)

**Status** · session_01R2CzzJxS8M5bLSwSsNm9sy · depth 2 · COMPLETE · handled B2

## Completion (CALCULATIONS #3)

**Entries applied.** T35-38 whole, on the readings BOB accepted in B2 (K1967):
- **R9 (N676, K1799)** every input `gradeFactsOf` and `read` answer carries `engine` and `engine_measured`: a table declared from a sheet range holding any formula cell (recorded at declaration in its source, read from `content.cellsAt` for a table declared before T35) and a figure citing a formula cell carry `engine: "the file's spreadsheet program"`, `engine_measured: false`, grade `undetermined` with why and `derivation_step: "third-party engine"`, so the capture axis is undetermined and strength stops on it; every other input `engine: null`, `engine_measured: null`. No engine's agreement is recorded as measured (`MEASURED_ENGINES` is empty).
- **R32** `freezeUses` (`op=usesfreeze`): pages `events.usesOf` for the member (500 a page, bounded by R1's cell bound over 16 columns), one canonical CSV row per act with R32's columns (`when` as the local first and last day of its band, precision kept; placed nowhere: empty; `reason_fold` per reading 4, the passage text read through content's read contract (R45) and `passageText`; `relationships` per reading 3), keyed by its sha256, bytes in the evidence store, held as a `calc_tables` row (source `{kind: "uses", filter, frozen_by, frozen_at}`) and a new `calc_uses` row (export yes, keyed to its project). Withheld whole from a viewer who may not see every event (R10); its grade the weakest governing attestation's. One change to reading 3, made after J1: a donation is dated, so one made before the act counts as `donation` (as an employment ended before it counts as `former_employment`); a tie whose validity at the act's date cannot be decided is listed with "(validity at the act's date undetermined)".
- **R33–R36** eight recipes of application in `application.mjs` (data, `applicationRecipes()`, `op=applicationrecipes`), each composed into a `bio-calc/1` recipe over the input table and evaluated only by calc-grammar; every answer states its denominator, population (the frozen filter and sha) and derivation, with rows not counted stated apart (undetermined cells by calc-grammar; outcomes not named, acts across a change, groups of one by their own count steps). `consistency` picks each group's most frequent outcome from calc-grammar's own counts (ties named). `before_after` reads a standard version's period `from` or a date. `target_met` reads the target (`standardRead().target`), the version in force at each period's `to` (`THRESHOLD_NOT_IN_FORCE`), and `bindsAt` there: `met`/`not met` only on `binds`; on `benchmark` "below", "at or above", "faster than", "slower than" (time units) with "Benchmark · not binding on <body>". `policy_against_practice` asks `isMeasure` first (`PROVISION_NOT_A_MEASURE` naming the held state), the version in force and the confirmed force, and answers the divergence beside it. New refusal codes (no catalogue rows yet, as T33's): `RECIPE_NOT_TEMPLATE`, `NOT_A_USES_TABLE`, `NO_USES_INPUT`, `BAD_TERMS`, `NO_CHANGE`, `CHANGE_DATE_UNDETERMINED`, `NO_TARGET`, `NO_MEASURE_INPUT`, `BAD_MEASURE`, `NO_PROVISION`, `NO_PRACTICE_INPUT`, `EVENTS_NOT_REACHABLE`, `NO_USES`.
- **R37** no served string says "nonconforming", "violated", "breach" or "not met" against a standard that does not bind; R27's test gains "nonconforming". No pattern of application is in `PATTERNS`; none is "Noticed".
- **CONTENT #14 J2 (DEC-149)** `NO_EVIDENCE_STORE` says "has no evidence store set up"; its test names the string.

**Interfaces read before their modules merge (built against their requirements, tested through providers in `fixture.mjs`):** `events.usesOf` (R46) and the R45 event view (`provision`, `stated_reason`, `outcome`, `participants`, `when`, `attestations`, `governing`); `standards.standardRead` (`period`, `held`, `target`), `inForceAt`, `isMeasure({standard, viewer})`, `bindsAt({standard, body, date, viewer})` read as `{state, why}`, `forcesOf({standard, viewer})` read as `{forces: [{portion, force, …}]}`. When events and standards merge, the providers give way to the real modules (P10); the call shapes are worth checking against their code then.

**Deferred.** None in this module.

**Found in other modules** (sent to BOB as a REPORT):
- `affordances` `t33.test.mjs`:136 R40/R12 and `op-declarations` `t33.test.mjs`:180 R19/R6 now also fail on calculations' two new ops, `usesfreeze` and `applicationrecipes` (no grade, no spec): their T35 jobs (T35-66, T35-70) declare them. The new member acts need affordances grading.
- The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, §14) is stale from this module's source; regenerated at the layer close.

**Tests and checks.**
- `node --test bio-plane/test/m/calculations/`: 46 pass, 0 fail (38 before; 8 new in `application.test.mjs`).
- Users of calculations: workbooks 25/1 (red 8, R15), inquiry 175/0, hypotheses 21/1 (red 20), strength 143/0, answers 34/0, reevaluation 140/0, case-authoring 145/0, consequences 41/0, affordances 202/1 (new: the two ops, above), op-declarations 81/3 (reds 9 ×2, 23, which now also names `usesfreeze`), plane 109/6 (red 22, `ask.test.mjs` ×6; `sweep.test.mjs`:82 failed once under parallel load and passes alone, 5/5), `system/migrate-released.test.mjs` 1/0.
- `format`: 2 failures, both red 24 (law-relations' paths and tests). `architecture calculations`: 14 files, 60 imports, 0 failures. `coverage calculations`: 37 of 37 live ids, 0 failures. `ownership calculations tranche/T35`: 8 files, 0 failures.

Size (session_01R2CzzJxS8M5bLSwSsNm9sy): test runs 9, module lines 3155

## J1 · QUESTION

Seven readings I am building on (carrying on meanwhile; none blocks):
1. R33–R36's recipes are instantiated through `create` with `kind` = the recipe's name (`outcome_rate_by`, `reasons_missing`, `reasons_repeated`, `waiver_share`, `consistency`, `before_after`, `target_met`, `policy_against_practice`) and `terms` its parameters; the module composes the calc-grammar recipe from the template over the input table, as `budget_against_actuals` composes its per-period steps today; a `recipe` given that differs from the composed one is refused `RECIPE_NOT_TEMPLATE` (a new code, no catalogue row yet, like T33's).
2. Op names as the Suggestion: `usesfreeze` (R32) and `applicationrecipes` (R33).
3. R32 `relationships`, from the registered owners' `neighbours` of the decider at one hop, items whose other end is the subject: `post` = lines `line:holds:*` (not employee, not contractor), `line:seat_on`, `line:post_in`; `employment` = `line:holds:employee` valid at the act's `when`; `former_employment` = `line:holds:employee` whose validity ended before it; `contract` = `line:contracts_with`, `line:holds:contractor`; `donation` = money's `money_flow` of kind `contribution`, `gift` or `behested`; `declared` = any kind of class `declared`. The cell lists them sorted, `;`-joined; empty is read "none held".
4. R32 `reason_fold`: extraction's fold (`normAlias`'s case and spacing, its split on non-letter, non-digit runs), every term kept in order: `labelTerms`' de-duplication and 24-term cap would fold two different long reasons equal.
5. R35's measure: a figure (a `CALC-` or cited figure) for one period, the calculation's own; or a table with `from`, `to` (dates) and `value` columns, one row per period; `bindsAt` and the version in force are read at each period's `to`.
6. R9's engine: office-readers records no application, so `engine` is "the file's spreadsheet program" and `engine_measured` false for every such input (no agreement of that engine is recorded as measured); marked on a table from a sheet range holding any formula cell, and on a figure citing a formula cell.
7. R32's frozen uses table is withheld whole (R10) from a viewer who may not see every event in it (`events.readEvent`), and keyed to its `project` for purge.

## J2 · REPORT

Found while testing calculations' users (details in my record's Completion):
1. `affordances` `t33.test.mjs`:136 (R40/R12) and `op-declarations` `t33.test.mjs`:180 (R19/R6, red 23) now also fail on calculations' two new ops, `usesfreeze` (R32, a member's act) and `applicationrecipes` (R33, a read): no grade and no spec yet. Owed by their T35 jobs (T35-66, T35-70).
2. The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, §14) is stale from calculations' source; for the layer close.
3. Built against events' and standards' T35 interfaces before they merge, through test providers: `events.usesOf` and R45's event view; `standards.standardRead` (`period`, `held`, `target`), `inForceAt`, `isMeasure({standard, viewer})`, `bindsAt({standard, body, date, viewer})` read as `{state, why}`, `forcesOf({standard, viewer})` read as `{forces}`. Worth checking against their code at their merges; a different shape is a CHANGE to me.
4. One refinement of reading 3 (K1967), made after J1: a donation is dated, so one made before the act counts as `donation`, as an employment ended before it counts as `former_employment`; a tie whose validity at the act's date cannot be decided is listed with that said.

## J3 · COMPLETE

T35-38 applied whole (R9, R32–R37, CONTENT #14 J2's 'set up'); 46/46 calculations tests; coverage 37/37, architecture and ownership 0 failures, format only red 24. My record's Completion section has the detail; J2 the findings.
