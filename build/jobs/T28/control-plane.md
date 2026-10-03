# control-plane (T28)

**Status** · session_01NE62TdrMXNdMYfJdn16std · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R43 as amended asks two things that cannot both hold today: docket's family read at its module-order place (directly after publication), and every code keeping the row it had. Docket's own code `MACHINE_CANNOT_MARK_DOCKET_PRESSURE` is merged (N526), but docket's family still shares two more codes with action-grammar: `PRESSURE_MARKED` (docket C-129.12, action-grammar C-117.17) and `PRESSURE_REFUSED` (C-129.13, C-117.15). The composition gives a code to the first source that holds it. So moving docket before action-grammar re-rows both codes from C-117.17/.15 to C-129.12/.13. I measured this: `catalogue-end.test.mjs` (R43) reports exactly those two codes changed, beside the expected C-92.4, C-92.5 and C-92.10 re-words.

Best reading (applied, so my work goes on): R43's invariant wins. Docket stays read after action-grammar, the comment at `families.mjs` now names the two shared codes instead of the stale K1280 one, and R43's docket clause stays not met, carried with N526. The move is a one-line change once docket has its own codes for the two (a docket CHANGE, not mine). Alternative: move docket now and re-pin the two codes to docket's rows. That changes what `actionpressure`'s two refusals are decorated with and what `dec49Row` answers, which R43's last sentence forbids, so it needs your word.

Not affected: accepted-work's C-21.4/.5 and case-import's C-130 are added at their module-order places (no shared codes); case-checker holds no family, so it has no entry and no edge.

## Completion (CONTROL-PLANE #18)

**Entries applied** (`build/plan/current.md` T28 L11; B1):
- R49: `index.mjs` routes `case-import`'s eight ops by the general forward to its own map: the six acts stamped `by` (positional identity) and `viewer`, the two reads `viewer`, every caller copy deleted. Admission keeps them to a member's session through op-declarations R14's rows (`machineClasses: []`). `casechecker` and `casefilespec` are served credential-free by public-read's door read (its R18), by their own names and as `op=publicread&name=`, as R45's are, with no store route of this module's. `dispatch.mjs`: `importedcases` and `importedcase` are in `PROJECT_NAMING_READS_NOT`, each with its reason. The store's door already awaits a route's answer, so `caseimport`'s and `caseimportdocument`'s promises are enveloped settled and a rejection is `STORE_INTERNAL_ERROR` (K1324; tested).
- R43: `CHECK_FAMILY_FILES` gains `accepted-work`'s C-21.4/.5 (after inquiry-grammar) and `case-import`'s C-130 (after ratification), each at its module-order place. `case-checker` holds no family, so it has no entry and no edge. Docket stays read after action-grammar (J1, B2, K1331): `PRESSURE_MARKED` and `PRESSURE_REFUSED` are still in both families. The stale K1280 comment is replaced by one naming the two codes. R43's docket clause stays not met (BOB re-marks it T29; N533).
- `catalogue-end.test.mjs`: C-92.4 and C-92.5 (publication R60, K1321) and C-92.10 (ratification R14, N519) are re-pinned in `rows-before-r43.json`, with a note.

**Routing lists held here, for now.** op-declarations had not merged when I built, so the door names the eight ops and the two public reads in three local frozen lists (`CASE_IMPORT_ACTIONS`, `CASE_IMPORT_READS`, `CASE_CHECKER_PUBLIC_READS`), taken from R49's own text. If OP-DECLARATIONS #8 exports lists for these, reading them from there is a small follow-up. It is not deferred for a reason of mine; it waits only on op-declarations' export names.

**Deferred:** none of mine.

**Found in another module:** docket's family shares `PRESSURE_MARKED` and `PRESSURE_REFUSED` with action-grammar (J1; answered B2, N533).

**Catalogue rows added:** none. This module adds no row. Rows it now reads that are `awaiting stamp` are their owners': accepted-work C-21.4, C-21.5; case-import C-130.1–.14.

**Tests and checks:**
- `node --test bio-plane/test/m/control-plane/`: tests 146, pass 142, fail 4. The four are `r49-routes.test.mjs`'s route, stamp, admission and public-read arms, which need op-declarations R14's specs (UNKNOWN_OP without them). op-declarations merges before me in L11. With R14's specs applied locally (then reverted, never committed), the same run was tests 145, pass 144, fail 1. The one failure was `totality.test.mjs` R2/R41 (accepted red 4, affordances' grades, cleared at affordances' merge). `families.test.mjs` and `catalogue-end.test.mjs` pass (accepted reds 6 and 7 cleared).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio control-plane`: 0 failures (after the R49 test stopped importing case-checker's file). `checks/coverage.mjs bio control-plane`: 33 of 33 live ids named, 0 failures. `checks/ownership.mjs bio control-plane tranche/T28`: 0 failures.
- Size: module 3,649 lines by its paths (code); tests 5,959.

Size (session_01NE62TdrMXNdMYfJdn16std): test runs 9, module lines 3649

## J2 · COMPLETE

Complete; record on job/T28/control-plane. R49 routed (case-import's eight ops by the general forward, by/viewer stamped; casechecker and casefilespec by public-read's door read; importedcases and importedcase in PROJECT_NAMING_READS_NOT; promises enveloped settled). R43: accepted-work's and case-import's families at their places; docket unmoved per B2. C-92.4/.5/.10 re-pinned. Four r49 arms are red until op-declarations' R14 specs merge (all pass with them applied locally); totality stays accepted red 4 until affordances. Checks: format, architecture, coverage (33/33), ownership: 0 failures.
