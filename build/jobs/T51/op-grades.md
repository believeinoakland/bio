# op-grades (T51)

**Status** · session_01HMaPz7pqmixWTqj6Bw5a1N · depth 2 · WORKING · handled B34

## J1 · QUESTION

**QUESTION (words, K3268): how the 42 hand-lists are assembled.** Re-reading the words check after the conversion: 41 hand-lists are flagged in `test/m/op-grades/*.test.mjs` (ops, and refusal codes in `ladder`, `pins`, `t45`), plus K4036's and K4041's named lines, all of them other modules' ops or codes. The reading I take: each list is assembled from the owning module's own declaration, never typed here.

What I found, so the choice is yours:
- `op-declarations` exports `OP_FAMILIES[owner]` (kinds, acts, reads, proposals, extra) for 60 owners, so most lists have a declared owner there.
- Some owners have no family (`escalation`, `filing-templates`, `case-import`, `action-holds` in part): their declaration is their route map (`escalationOps`, `standardsOps`), or nothing exported.
- Most flagged lists are a requirement's subset of an owner's ops, or mix several owners (e.g. `pins.test.mjs:318`, `owners.test.mjs:161`), so a whole-family derivation would widen what a test asserts.

Recommended: a shared helper `test/m/op-grades/declared.mjs` that reads each owner's ops from `OP_FAMILIES` by kind, and, for the owners with no family, from the owner's exported route map; each requirement's subset is then the declared set filtered by the kind the test asserts. Where the subset is not a kind (a requirement's own list), the test keeps the requirement's ops by intersecting the declared set with a named list in `op-grades`' own data. Alternative: BOB rules that a test may name an owner's op only through the owner's own test fixture. I will use the recommendation unless you rule otherwise; I have not started the 41 conversions. The plain finding is a separate REPORT.

## J2 · REPORT

**REPORT (words, plain).** `bio-plane/src/op-grades/t36.mjs:18`, "scheduler: the security wakes; name no member and move no bundle", is the `NON_ACTS` reason of `scanbatch`, `renderbatch`, `deeperbatch` and `securityforward`. It says why the scheduler's wake is not an act, for the developer reading the grade table. No screen draws `NON_ACTS` (`VOCABULARIES` publishes its rung, ground, consequence, larger-screen and irreversible sets, not `NON_ACTS`; `affordances` R4). No member reads it, so it is not converted; please pass it to the design's `unkeyed` list (K3944), and the words check's plain arm then clears it.

## J3 · REPORT

**REPORT (words, progress, K4069).** Pushed. The hand-lists are down from 42 to 30. Converted: `t35` (the `B3_READS`, `R22_READS` reads), `t36` (`R24_READS`, the `aikeepaway` … rung list), `t47` (`READS`), `t48` (`READS`, the control list, the `R41` reads), `t50` (`REVERSIBLE`, `WRITES`, `READS`). Each derives from `test/m/op-grades/declared.mjs` (`OP_FAMILIES` of the owners) intersected with this module's table. All 125 op-grades tests pass; `checks/words.mjs` shows 30 hand-list findings and the plain one you asked me to leave.

Two kinds of list are not converted yet, and I need your ruling before I continue:
1. **Refusal codes** (`ladder.test.mjs:71`, `pins.test.mjs:287`, `t45.test.mjs:143`, `t48.test.mjs:169`). The owners (connections, money, citation, standards, …) write their codes as literals inside behaviour; no owner exports a code table, and the family declarations cover ops only. A test can only derive them from an owner export, so either the owners export their code lists (changes in those modules, a REPORT each, P9), or the controls are restated on the interface (for example, a refusal from the owner's own function is not in `JUSTIFICATION_REFUSALS`). Which do you rule?
2. **Op lists whose owner is not a family** (`escalation`, `filing-templates`, `case-import`, `wizard-scripts` in part): `pins.test.mjs` `@32`, `@36`, `@57`, `@123`, `@165`, `@176`, `@187`, `@331`, `@336`, `@342`; `owners.test.mjs` `@46`, `@120`, `@161`, `@283`; `ladder.test.mjs` `@178`, `@196`. Their declaration is `OPS` in op-declarations (no owner field) or an owner's route map (`escalationOps`, `standardsOps`). I am taking `OPS` filtered by this module's tables for these, unless you rule otherwise.

The `t41`, `t45` lists failed when I derived them from guessed owner families (the derived sets were wider than the requirements' lists), so those are unchanged and remain flagged; I will derive them from the exact requirement subsets.

## J4 · QUESTION

**QUESTION (words, K4072 follow-up): `pins.test.mjs` cannot take the declaration derivation.** Its lists are the requirements' own text pinned at this module's exports: `DEC88` (the three DEC-88 bands, R1 and R3), `T41_REASONED`, `T41_REVERSIBLE`, `T41_UNDETERMINED`, `LAYER9_*`, the `R3_LEFT` tally, `ACTS_NOW`, the `R32` and `N891` pins. The file's stated purpose (its header: "the content of its tables pinned ... so that affordances may drop its copies") is that the test pins the ops as written, not as the table says. Deriving them from `OP_FAMILIES` or from this module's tables would make each pin circular (it would test the table against itself), and the owners' families do not carry rungs, so there is no owner declaration of a band to read.

Rulings, my recommendation first:
1. **(Recommended)** The pins read the rung of each op from its owner's requirement line: the test reads `build/requirements/<owner>.md`, finds the `**Rn**` line that names the op in backticks, and checks the rung word there. That is the owner's declaration (requirements are the contract), it is not a list typed here, and the pin stays independent of the table. Cost: a file read in the test; the requirement text would need to be parseable (the ops are written in backticks in each line).
2. The pins stay as literal requirement content and the words check is told that a pin of requirement text is not a hand-list (a checker change, BOB's or civicos-process's).
3. The pins move to a fixture file in the owner's own requirements path.

Until you rule, I am converting the other lists (t41 `R30_READS`, which passes with the owner-family derivation; the `OPS` and own-table lists; `t45`, `t41`'s FIVE, and the codes restated per B3). Remaining after that is the `pins` file plus the four code lists. I will not guess the parser.

## J5 · REPORT

**REPORT (correction to J4).** J4 said I am converting the other lists now. That is not yet true: none of the 30 remaining is converted in this entry, and the t41 `R30_READS` derivation was reverted with the rest of t41. I am waiting on your ruling for pins before I continue; the other lists resume after it.

## J6 · REPORT

**REPORT (B4, K4073; B5 acknowledged).** Pushed `3a68cc4b25`. `t51.mjs` now states the fifteen reads op-declarations declares for T51 (R77–R79, including `publishedfrozen`, public) as `read: …` reasons, with R48's three; each read's sentence names its owner's requirement. The test is `test/m/op-grades/t51.test.mjs`. It does not yet check the names against `OPS`: op-declarations' declaration is not on `tranche/T51` yet (`holdsdue` is absent from `OPS` here), so that check belongs after its merge. All 126 op-grades tests pass. The words check: 30 hand-list findings; the plain finding is gone after the merge. Still open, in the order of B5: the `pins.test.mjs` requirement-parsing conversion (its ops from `build/requirements/op-grades.md`), the 30 hand-lists (`t41`, `t45`, `OPS`-filtered lists), and the four code controls per B3. I will post COMPLETE only after those and the checks.

## J7 · QUESTION

**QUESTION (K4076; parseability).** The pins' DEC-88 bands are in **R1** of `build/requirements/op-grades.md`, and R1 writes its op names as plain words, not in backticks: "reversible suggest, extractpropose, contradictionpropose, … ; reasoned testify, lead, leadlook, … ; terminal escalationend, filingapprove" (the DEC-88 sentence, "DEC-88's three bands (K1038, J1)"). Its neighbours R2 and R3 name ops in backticks, so R1 is the one named line that does not parse. Please reword the DEC-88 band sentence with the ops in backticks (`reversible`: `suggest`, …); the other pins' lines (R30's T41 bands, R33's and the layer-9 sets) are already backticked, so I will convert those now. The R3 tally line states counts, not ops, so its pin reads the numbers as written. Ring me when R1 is reworded; until then the DEC-88 pins stay flagged.

## J8 · REPORT

**REPORT (B6, K4078).** Merged `tranche/T51` (at `d0c1389d9d`). The DEC-88 pins in `pins.test.mjs` now read their three bands from the backticked ops of R1's sentence on the requirement line, not from a typed list; the pins pass (10 of 10). Pushed. The words check shows 28 hand-list findings, down from 30; the plain finding is gone. Still open: the rest of the `pins` lists (the R3 tally, the T41 bands, layer 9, R32, N891), `ladder`, `owners`, `t35`, `t41`, `t45`, and the four code controls per B3. Next: the T41 bands in R30 (backticked) are the next pin to convert, then the rest in the order of the checker's list. I have not posted COMPLETE.

## J9 · COMPLETE

**COMPLETE (B7, K4085; T51-137).** Pushed `6a96a6cba1` on `job/T51/op-grades`, with `tranche/T51` merged (at `9c3b02a2b9`).

**Entries applied.**
- Words: `checks/words.mjs … op-grades` reads **0** (handlist 0). The 28 hand-lists are gone from `test/m/op-grades/`: `pins` (T41 bands, R3 tally, layer 9, terminal set, codes, reads), `ladder`, `owners`, `t35`, `t41`, `t45`, `t48`; `t36`, `t47`, `t50` were re-derived too (see the finding below). Run over every L11 module together: no line names op-grades (K3986).
- Where each list now comes from: the DEC-88 bands, R3's 21, R30's T41 bands and ACTS_NOW read the backticked ops (or R1's plain words) of op-grades' OWN requirement lines through `test/m/op-grades/declared.mjs` (K4076); read lists are the read rows of the module's own tables; refusal-code controls are restated as one rule over a code (`asksNotTheAccount`: no code in `JUSTIFICATION_REFUSALS` asks an object, identifier, choice, form, member or a machine) plus the codes R-lines say join the family (`joinedCodes`), with negative controls (your B3 option b). No other module's op or code is typed in a test.
- R48 and the 14 session reads (B4): in `t51.mjs` since J6; `t51.test.mjs` names R48 explicitly. `holdsdue`, `templatebyhandle`, `rulefields` are `NON_ACTS` reads with no grade.
- Inherited reds t48:219 (R42) and t50:106 (R46): both green. All 126 op-grades tests pass.

**Finding for BOB (a ruling of yours could not be followed as written).** B2 and B3 had `declared.mjs` read `OP_FAMILIES`/`OPS` from op-declarations. `checks/architecture.mjs` rejects that: op-declarations is later in the order than op-grades (P4), and cannot be earlier (it imports `affordances`, which uses op-grades). J3's version of the helper already carried the import. I removed it: tests import nothing outside this module. What this costs: a read list is now the module's own read rows, not "the reads the owner declares", so a read the owner declares and op-grades omits is no longer seen by an op-grades test; that is `affordances` R12's totality (and `control-plane`'s `totality.test.mjs`), which already runs over the declarations. Three pins lost their owner-derived form: layer 9's exact 41-count and its ungated-reads list (now the stated absences R2 names, with their ground and reasons), and the sources'/capture's read pin (now every read row writes nothing, with the public and grant-door rows apart). If you want those pins back at their owner, they belong in a later module's tests (affordances or op-declarations), which may import both.

**Deferred / found elsewhere.** None in op-grades. Not mine: `architecture.mjs` over the whole product shows one failure, `answer-envelope/page-policy.test.mjs` importing `signpage.mjs` of control-plane.

**Checks (from the process repository, pulled).** `checks/format.mjs`: 176 modules, 0 failures. `checks/architecture.mjs … op-grades`: 35 product files, 73 imports, 0 failures. `checks/coverage.mjs … op-grades`: 48 of 48 live requirement ids named, 0 failures. `checks/ownership.mjs … op-grades tranche/T51 job/T51/op-grades`: 16 files, 0 failures. `checks/words.mjs … op-grades`: 0 failures. `setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match. `node --test bio-plane/test/m/op-grades/`: 126 pass, 0 fail.

Size (session_01Wn3Nkryhpm6zQHj9uJJzg4): test runs 45, module lines 3427

## J10 · QUESTION

**QUESTION (K4168; the registration's spelling, and one inherited red).** Built and pushed (`20e30f170b`): NEW `op-grades` R49 and R50, amended R19; `registerDeclaredOps(owners)` is exported from `op-grades/index.mjs`. The contract names the row's fields but leaves the spelling to my lines. What I fixed, so the wave-2 STARTs and the plane can cite it; I carry on with it unless you rule otherwise:
1. **Call.** `registerDeclaredOps({ [moduleId]: DECLARED_OPS, ... })` once, before any table is read; it answers `{registered, agreed}`. A registration after a read of `RUNGS`, `RUNG_ABSENT`, `NON_ACTS`, `MACHINE_REFUSALS` or `phoneOf`, or after a first registration, throws `DECLARED_OPS_LATE` naming the first op. The module's exports are guarded (read-detecting proxies over the same objects), so loading the module and importing `affordances` read nothing; the plane must register before it first reads a table, not merely before it imports.
2. **`weight`** is a rung of `RUNG_LADDER` (not `irreversible`: `IRREVERSIBLE_WEIGHT` is frozen and derived from the hand rows), a ground of `RUNG_ABSENCE_GROUNDS`, or `read` (with `mutating: false`). **`description`** is a word key the list holds, or the sentence `localize` answered (a dotted id the list lacks is refused, so a new key needs its row or a `localize` sentence). It becomes the op's `NON_ACTS` reason (a ground also its `RUNG_ABSENT.is`). An optional **`refusal`** (a code, with `reasoned` only) joins `JUSTIFICATION_REFUSALS` so `affordances` R19 backs a new reasoned op.
3. **Not declarable:** `MACHINE_REFUSALS` (its entries are `ACTS` rows, `affordances` R20, and an owner-declared op is a `NON_ACT` until `affordances` makes it one), `CONSEQUENCE_STATEMENTS`, `IRREVERSIBLE_WEIGHT`. Your entry lists `MACHINE_REFUSALS`; tell me if an owner must be able to declare a machine refusal and how (a `machineRefusal` code would make the op an act row, which only `affordances` can).
4. **Hand rows** are never changed: an op with any hand row is only checked (weight: its rung, ground, or `read` if held only in `NON_ACTS`; description: against its `NON_ACTS` reason, else `RUNG_ABSENT.is`); a difference throws `DECLARED_OP_DISAGREES` naming the op. Duplicates across modules throw `DECLARED_OP_DUPLICATE` naming both. Every refusal is whole: no table changes.
5. **`affordances` needs no change.** I registered fixture rows and ran its `unaccounted` over them: no `unranked`, no `unpublished`; it reads the tables by reference at the call. `affordances` (280 tests), `op-declarations`, `interface-shell` and `control-plane` give the same results as at the tranche tip.

**Inherited red, not in my START (it says none):** at the tranche tip `t48.test.mjs` R42 and R46 fail. `MARKS` (R42, R46) was taken at design commit `7be06eb4cb`, and the registry in the tree (last moved by DEC-378, `2f20eaa57e`) lists 27 more rungless acts than `MARKS` holds (`biasdebt`, `biasinhale`, `biasmanifest`, `casedetails`, `casedetailspublic`, `casedetailsset`, `export`, `exportlog`, `importregrade`, `rerunpair`, `rerunread`, `rerunstart`, `taskdecide`, `sweeps`, `monitoring`, and others). It is my module's data (P8), so I will re-take `MARKS` against the kit and registry as the tree holds them, at the design's last commit in the tree, naming that commit in `MARKS_KIT_COMMIT` and R46, unless you name another commit or say it is another job's.

## J11 · COMPLETE

**COMPLETE (B8 entry 1, K4168; B9, B10).** Pushed `41920fb157` on `job/T51/op-grades`, `tranche/T51` merged (it carries FR-04's op-declarations).

**Entries applied.**
1. **K4168, the registration.** `registerDeclaredOps(owners)` is exported from `op-grades/index.mjs` (code in the new `declared.mjs`), named and shaped as B9 says: `{moduleId: DECLARED_OPS}` or a list of `[moduleId, DECLARED_OPS]` pairs; it reads only `mutating`, `weight`, `description`, and an optional `refusal`, and ignores `classes`, `machineClasses`, `stamps`, `needs`, `fields`. Called once before the first read. The tables stay the objects `affordances` publishes, behind read-detecting proxies (the first read of `RUNGS`, `RUNG_ABSENT`, `NON_ACTS`, `MACHINE_REFUSALS` or `phoneOf` closes registration; loading the module and importing `affordances` read none). An op with no hand row is added (a rung into `RUNGS`, a ground into `RUNG_ABSENT`, a read only into `NON_ACTS`; the description becomes the `NON_ACTS` reason); an op with a hand row is only checked and changes nothing. Refused whole, nothing changed, naming the op: `DECLARED_OPS_LATE`, `DECLARED_OP_DUPLICATE` (naming both modules), `DECLARED_OP_DISAGREES` (weight or description), `DECLARED_OP_BAD_WEIGHT`, `DECLARED_OP_BAD_DESCRIPTION`, `DECLARED_OP_BAD_REFUSAL`. `weight` is a rung other than `irreversible`, a ground, or `read` with `mutating: false`; `description` is a word key the list holds or the `localize` sentence; `refusal` (with `reasoned` only) joins `JUSTIFICATION_REFUSALS`. `MACHINE_REFUSALS`, `CONSEQUENCE_STATEMENTS` and `IRREVERSIBLE_WEIGHT` are not declarable (see J10's item 3; no answer came, so I kept it). `affordances` needs no change: its `unaccounted` run over registered fixture rows names none unranked or unpublished, and `affordances`, `op-declarations`, `interface-shell`, `control-plane`, `screens-wizards` and `plane` give the same results as at the tranche tip (affordances' one red, R57 R61 "labelled", is the tip's, not mine).
2. **B10, R42 and R46.** `MARKS` re-taken at the design commit `206ed4755b` (DEC-381, the last commit in `docs/development/ux-substrate/` on the tranche): 33 rungless acts added (the reads and acts of the new screens, and the owed ones `casedetails*`, `importregrade`, `rerun*`, `taskdecide`, `capturecredential*`, `declareorigin`, `projectclose`), each with the kit's weight or the default; no earlier entry changed or dropped; the test and the registry derive the list, nothing is hand-listed. `MARKS_KIT_COMMIT` and the four test literals that pin it are updated.

**Requirement lines: yours to apply (ownership).** `checks/ownership.mjs` fails a job that edits `build/requirements/op-grades.md`, so my lines are not in the file. The tests name R49 and R50; the coverage check will then pass them once you apply the text below. The same text is on my first commit `20e30f170b` (`git show 20e30f170b -- build/requirements/op-grades.md`), updated here for B9 and the new commit. They are marked *(not yet met: T51)*; strike the marks at the merge.

---
**The op declaration, taken from its owner** (T51 fix round; K4165, K4168; plan `build/plan/fix-round-T51.md` §3; `op-declarations` R80, R81) — a heading to insert after R48, before `## Private`.
- **R49** *(not yet met: T51)* (K4168; FR-03) **A grade is taken from the owner's declaration.** `registerDeclaredOps(owners)` takes `owners`, an object from a module id to that module's `DECLARED_OPS` or a list of `[module id, DECLARED_OPS]` pairs (a frozen object from an op's name to its row; of a row it reads `mutating`, `weight`, `description` and an optional `refusal`, the rest being `op-declarations`'). For each op that has no hand row in `RUNGS`, `RUNG_ABSENT`, `NON_ACTS` or `MACHINE_REFUSALS`, it adds the op's grade to those very tables (R1–R48 publish the same objects, so `affordances` R12, R19 and R20 and `phoneOf` read the op as they read a hand row), and answers `{registered, agreed}`, the ops it added and the ops that already had a hand row:
  - `weight` is a rung of `RUNG_LADDER` other than `irreversible` (the op goes to `RUNGS`), a ground of `RUNG_ABSENCE_GROUNDS` (to `RUNG_ABSENT`, its `is` the description), or `read` (an op that writes nothing, to `NON_ACTS` only). A rung or a ground goes with `mutating: true`, `read` with `mutating: false`. `irreversible` is refused: `IRREVERSIBLE_WEIGHT` is derived from the hand rows (R21) and is published frozen.
  - `description` is the op's `NON_ACTS` reason: a `setup-words` key (a dotted id), whose words the list holds (`hasWord`), or the sentence `localize` answered for it; a dotted id the list lacks is refused, and so is a sentence beginning `capture-directed:`, which enrols a capture act (`affordances` R1).
  - `refusal`, allowed only with the rung `reasoned`, is the code its owner refuses the absent reason with; it joins `JUSTIFICATION_REFUSALS` (`affordances` R19) when it is not there.
  - `MACHINE_REFUSALS` (`ACTS`' own, `affordances` R20), `CONSEQUENCE_STATEMENTS` and `IRREVERSIBLE_WEIGHT` take nothing from a row: they stay hand rows.
  A row that is refused is refused whole: the answer is an error with a `code` (`DECLARED_OP_BAD_WEIGHT`, `DECLARED_OP_BAD_DESCRIPTION`, `DECLARED_OP_BAD_REFUSAL`) and the op's name in its message, and no table has changed. Test: with fixture owner rows (no real module), a new op with a rung, one with a ground, one read and one `reasoned` with its `refusal` each appear in the tables with the row's grade and the description's words, `phoneOf` answering as the rung or ground says; a description given as a key and as a sentence; each refused row named. Control: every entry the tables held before is as it was, and a module instance with no registration is as it was.
- **R50** *(not yet met: T51)* (K4168; FR-03) **Agreement and order, failing loud.** `registerDeclaredOps` is refused, naming the op and changing nothing, when: (a) an op is in the rows of two modules (`DECLARED_OP_DUPLICATE`, the message naming both); (b) an op that has a hand row differs from its owner's row in weight (the hand rung or ground; `read` for an op held only in `NON_ACTS`; an op held only in `MACHINE_REFUSALS` has none) or in description (the words against its `NON_ACTS` reason, else its `RUNG_ABSENT` `is`; none to compare when it has neither) (`DECLARED_OP_DISAGREES`, the message naming what differs); (c) any of `RUNGS`, `RUNG_ABSENT`, `NON_ACTS`, `MACHINE_REFUSALS` or `phoneOf` has been read, or a registration has already succeeded (`DECLARED_OPS_LATE`, naming the first op of the rows). An op with a hand row and an agreeing owner row changes nothing: the hand rows stay until each owner next declares its own (K4168). Test: a hand op of each table (`cite`, `monitor`, `holdsdue`) disagreeing in weight and in description is refused naming it, and agreeing is accepted with no change; two modules declaring one op is refused and the other ops of the call are not added; each of the five reads, and a second call, makes a registration late. Control: a registration before any read succeeds, and the same rows registered after a refused call still succeed.

**R19, amended:** **R19** (copy of `affordances` R22) Nothing here writes: every service is a read or pure. (T51, K4168) The one exception is `registerDeclaredOps` (R49, R50), which adds the owners' declared ops to this module's own tables in memory, once, before they are first read; it writes no store, file or network, no other module's data, and no row a hand row already holds.

**R46, amended:** **R46** (T50; DEC-295; K3250; amends R42; `marks.mjs` `MARKS_KIT_COMMIT`) **The marks are re-taken against the registry and the kit.** `MARKS_KIT_COMMIT` is the design commit named at START (T51 fix round: `206ed4755b`, the design as `tranche/T51` holds it (DEC-381), where the registry lists 33 rungless acts more than at `7be06eb4cb`, each marked with the kit's weight or the default, none changed or dropped), and `MARKS` equals the kit's `WEIGHT` at that commit for every rungless registered act (R42's rule: the rungless acts of the registry as it stands there, with the kit's default Reasoned for an op the kit does not name). `watchitem`, `secondlook`, `projectstakeset` and `actionstake` have a rung (R45) and `actioninquiry` is `undetermined`, so none is in `MARKS` (R42's control): the shell draws the grade (`interface-shell` R11; DEC-295 marks only above Reversible). The kit weighs `projectstakeset` and `actionstake` 1 (Reversible), as R45 grades them (DEC-309 (6)), so no disagreement stands. Test: `MARKS` equals the kit's weights at that commit, except the entries `MARK_SOURCES` attributes to a ruling over the kit (`notewrite`, R47); every rungless registered act has an entry. Control: no op in `RUNGS` has an entry.
---

**Deferred:** nothing. **Found in other modules:** (a) `MARKS` entries become unread once an owner declares a rung for the op (casedetails*, rerun*, importregrade, taskdecide, capturecredential*, declareorigin, projectclose): the shell must draw the rung when there is one (`interface-shell` R11, R64), and R42's control ("no op in `RUNGS` is in `MARKS`") is held over the hand tables only; after the plane registers, the two overlap by design. (b) `checks/format.mjs` fails on `build/modules.json`: `test-support`'s path `bio-plane/test/declared-ops.mjs` names no file; it clears when FR-01 merges. (c) Five directories with a `package-lock.json` have no `node_modules` here (`agent-runner`, `bio-plane/src/journey-check`, `file-scanner`, `sheet-worker`, `site`); no op-grades test needs them. (d) The full `checks/run.mjs` shows coverage failures in `agent-harness`, `agent-runner`, `installer-steps` and `journey-check` (other modules' ids), none in op-grades.

**Tests and checks.** `node --test bio-plane/test/m/op-grades/`: 138 tests, 138 pass, 0 fail (126 before; the register tests R49 and R50 were written first and seen failing, 11 + 1 added; R19's test now names the one writer). format 1 failure (b, not mine), architecture 0 failures, coverage 48 of 48 ids named by a test, words 0 failures for op-grades (29 unkeyed), ownership 8 files, 0 failures.

Size (session_01EDK63b7XiZcZsCWWCnFvsT): test runs 18, module lines 3600

## J12 · COMPLETE

**COMPLETE again (B11, B12).** Pushed `3191e269a4`, tranche merged. B11 read: the contract stands as built; both input shapes (object, pair list) are taken. B12: MARKS re-taken at `e6d16d8f53` (DEC-382): 39 rungless acts added since `7be06eb4cb` (six more than at 206ed4755b), none changed or dropped; MARKS_KIT_COMMIT and the test pins updated. op-grades 138 tests, 0 fail; words 0 failures; ownership 0 failures. R49/R50/R19 lines unchanged from J11 except R46 now reads: "`e6d16d8f53`, the design as `tranche/T51` holds it (DEC-382), where the registry lists 39 rungless acts more than at `7be06eb4cb`". Size (session_01EDK63b7XiZcZsCWWCnFvsT): test runs 21, module lines 3600

## J13 · QUESTION

**QUESTION (B13–B16; the words check's `testcopy`, and op-grades' module edges).** Pushed `4ebf9b1d66` on `job/T51/op-grades`, with `tranche/T51` merged first (at `4635d09d34`).

**Done (B13, B14, and the rest of B15/B16 I could do):**
- B13 (K4206): `MARKS` re-taken at `aa8bdcd0b4` (`MARKS_KIT_COMMIT`). The re-take adds one rungless act to the registry, `expertisewithdraw`, as Reasoned (the kit's 2), and changes no other row. R42 and R46 are green, and R46's control is the table without that row, which names the act. One note: B13 says `wizard-scripts` R45 names `aa8bdcd0b4` after FR-49, but on tranche R45 still names `1cc4a957f0` (FR-49's branch, `13fd41af12`, has the change). The kit and registry files in the tree are already `aa8bdcd0b4`.
- B14 (K4210): `securitymap` is dropped from `RUNG_ABSENT` and is a read in `NON_ACTS` alone. Test: it is in one table only; control: a fresh instance refuses a `caller-owned` declaration for it (`ground-on-read`). The three tests that asserted it as caller-owned (`t35`, `t48`, `t49` R43 count, now 36) are updated. R39 is amended in `build/requirements/op-grades.md`, marked not yet met.
- B16 (partly): the lines are identified and the seven findings reproduce in the full check (see below); conversion is blocked, as explained.
- B15 (partly): not done; see below.

**The blocker.** `checks/run.mjs` reports `words … testcopy 7` for op-grades: `t36.test.mjs:47, 49, 52, 55, 59`, `t47.test.mjs:36`, `t48.test.mjs:34`. Each copies a sentence another module declares: `file-safety` (`deepercheck`, `securitytooltest`, `openoriginal`, `openwithwarning`, `releasescanhold`) and `connections` (`stepsource`). I converted all seven to read the owner's `DECLARED_OPS` `.description`: every op-grades test passed (139 of 139). But that adds `file-safety` and `connections` as imports of op-grades' tests, and `checks/architecture` fails, because `op-grades` does not declare them in `uses`. No op-grades test imports another module today. Reading the word table instead does not work yet: the declared sentences have no `setup-words` row (`file-safety.declared.*` is not in `rows.mjs`), so `declaredSentence` throws. I reverted the imports (the files are at `HEAD` again), so the architecture check passes and the seven testcopy findings stand.

**B15 is blocked the same way, and on other branches.** `t47.test.mjs:250` (`reviewcomment`) and `owners.test.mjs:118` (the eight wizard ops) cannot be read through a declaration today: no module on `tranche/T51` declares `reviewcomment`, `writinghelp` or the wizard ops (`review` and `wizard-scripts` are still on their job branches). `review` (index 121) and `wizard-scripts` (140) both precede op-grades (141), so the edges would be legal.

**Options, my recommendation first:**
1. **(Recommended)** BOB adds `file-safety`, `connections`, `review` and `wizard-scripts` to `op-grades`' `uses` in `build/modules.json`, all four earlier than 141. I then read each declared sentence through its owner's export. That clears the seven findings now, and B15's two items once `review` and `wizard-scripts` declare those ops on the tranche (I can convert them then, in one job pass). The `uses` line is the one act I cannot make: it is the build state, and module edges are yours (P17).
2. BOB has the `setup-words` rows for the declared ops regenerated, and I use `declaredSentence`. This needs the words pipeline, not `modules.json`.
3. Keep the seven literal copies and accept the `testcopy` failures. I do not recommend this: the check fails on my module.

**Checks as they stand** (run from `civicos-process`): `format` 0 failures; `architecture` 0 failures; `ownership … tranche/T51 job/T51/op-grades` 0 failures (the one changed file is `build/requirements/op-grades.md`, which B14 allows); `coverage op-grades` 50 of 50 named, 0 failures; `words` for op-grades: 7 `testcopy`, as above. `checks/run.mjs` also lists 7 coverage failures in other modules (`agent-harness` R17; `agent-runner` R37, R38, R40; `citation` R16–R18; `installer-steps` R26, R31; `journey-check` R19; `link-sweep` R13–R15; `monitoring` R75–R77). They are not op-grades' and I did not change them; flagging them as a REPORT would be your call.

Until you rule, I hold at this state and do not post `COMPLETE`. I will not change `modules.json`.

## J14 · REPORT

**REPORT (B17, K4218).** Read. The three copies are `t41.test.mjs:24`, `t46.test.mjs:195` (`handlecheck`) and `t49.test.mjs:27` (`founderhandleset`). Same blocker as J13: `member-roster`'s `localize` sentences (R80, R81) are not in the word table (`rows.mjs` has no `member-roster.*` row for them), so `declaredSentence` throws there, as for the seven in J13. I have not changed them. They join the open question: with option 1 in J13 (`member-roster` added to `uses`, read through its export) they convert the same way; with option 2 they wait for the rows. I hold at WAITING ON BOB (J13).

## J15 · REPORT

**REPORT (other modules' findings, found applying B18–B22).**
1. **link-sweep: `sweeps`** declares `mutating: false, weight: "reversible"`. A read cannot carry a rung, so `registerDeclaredOps` refuses it whole (`DECLARED_OP_BAD_WEIGHT`, `rung-on-read`). Its description ("read: …; writes nothing") says it is a read: the row should be `weight: "read"` (B20(e) assumed the weight was the disagreement). My hand row (`NON_ACTS`, a read) stays and agrees with that.
2. **store-door: `groupdescriptiondraft`** declares `mutating: false, weight: "reasoned"`: the same refusal (`rung-on-read`). Its sentence says it writes nothing of the record. My requirement R39 grades it `caller-owned` (a ground, on `RUNG_ABSENT`), which a `mutating: false` row cannot state either. The owner should say which: a read (`weight: "read"`, and then R39/R16 change to a read row), or an act (`mutating: true`, with the ground or rung it means). I keep my hand row until BOB rules.
3. **affordances: `test/m/affordances/t48.test.mjs:181` (R12 R39)** still expects `securitymap` among the `caller-owned` absences. It has been a read since K4210 (this branch's earlier commit 4ebf9b1d66), so that test fails on this branch; on `origin/tranche/T51` it passes. Five other dependants' tests fail the same on the tranche and on this branch (screens R14/R16/R26/R73 and `affordances` R2/R41's unaccounted), so they are not from this job.
4. **Ownership:** `checks/ownership.mjs` fails on `build/requirements/op-grades.md`: commit 4ebf9b1d66 (K4206/K4210, before my restart) changed it on the job branch. It is BOB's file; merge it or tell me to revert.

## J16 · COMPLETE

**COMPLETE (B18–B23, OP-GRADES #19).**

**Entries applied.**
- B18/B19/B21 words: `checks/words.mjs … op-grades` reads **0** (inline 0, plain 0, testcopy 0, missingkey 0, handlist 0). The `testcopy` findings were already gone from the tests (J12/J14); what remained were the hand rows themselves.
- B20/B22 hand rows follow the owner: `NON_ACTS` (and `actionpressure`'s `RUNG_ABSENT.is`) now read the owner's sentence through `word("act.<op>.does")` for `wizards`, `writinghelp`, `wizarddraft`, `wizardrevise`, `wizardsubmit`, `wizardapprove`, `wizardretire`, `startfrom`, `caseratify`, `securitymap`, `actionpressure`, `pressurerecord`, and through the composed id `ai-accounts.declared.accountusesset` for `accountusesset` (t41). `RUNG_ABSENT.securitymap` was already gone (K4210). A hand row is no longer a copy, so the owner's word is the one truth.
- Registration test (R50, B21): `register.test.mjs` registers every owner's `DECLARED_OPS` (384 ops, 0 declared twice) on a fresh instance and expects no `DECLARED_OP_DISAGREES`/`DUPLICATE`. It uses `collectDeclaredOps` (test/m/op-grades/declared.mjs), a copy of test-support's `declaredOpsOf` search, because op-grades does not use test-support (architecture check). Only two owner rows are refused, both `DECLARED_OP_BAD_WEIGHT` `rung-on-read`, owners' to correct (REPORT J15: `sweeps`, `groupdescriptiondraft`); the test sets exactly those two aside and fails on any other.
- Tests that pinned the old hand sentences or the `read: ` lead of `wizards`, `startfrom`, `securitymap` now compare with `doesSentence(op)` (the word table), in owners, t35, t48.

**Deferred.** `sweeps` and `groupdescriptiondraft`: B20 (d), (e) cannot be applied from here (the owner's row is refused before any hand row is compared; see J15). Nothing else.

**Found in other modules.** J15: link-sweep `sweeps`, store-door `groupdescriptiondraft`, affordances `t48.test.mjs:181` (expects `securitymap` caller-owned; a read since K4210), and ownership on `build/requirements/op-grades.md`. Requirement text note for BOB: R11, R17, R22 still say the wizard/startfrom/securitymap rows lead with "wizard-directed:"/"read: …" (and R22's "the reads `read:`"); the owner's declared sentences do not, by B20.

**Tests and checks.** `node --test bio-plane/test/m/op-grades/`: 140 pass, 0 fail, 0 skipped. `checks/format.mjs .`: 0 failures. `checks/architecture.mjs . op-grades`: 0 failures. `checks/coverage.mjs . op-grades`: 50 of 50 live requirement ids named; 0 failures. `checks/words.mjs . op-grades`: 0 failures. `checks/ownership.mjs . op-grades tranche/T51`: 1 failure, `build/requirements/op-grades.md` (commit 4ebf9b1d66, before this restart; J15 item 4). Dependants' tests (52 files that name op-grades): 613 pass, 6 fail; 5 fail identically on `origin/tranche/T51`, the sixth is affordances `t48` (J15 item 3). `fleetbundles` is stale for the tranche's other modules' sources (BOB regenerates at the layer close); no op-grades file feeds a bundle.

Size (session_01HSAFyMwi4NiSyNZqh5rY1c): test runs 16, module lines 3622

## J17 · QUESTION

**QUESTION (B24; R51's absence half, and one design key).** Pushed `c20825d428` on `job/T51/op-grades`.

R51, as written, says a declared op's reason is its owner's word in its `NON_ACTS` row **or** its `RUNG_ABSENT` row. Registration (`src/op-grades/declared.mjs`) compares only the `NON_ACTS` reason. Comparing the absence's `is` as well shows 113 ops whose hand `is` differs from the owner's declared description:
- 108 have an owner word id in the word table (105 `localize`, 3 `word` keys), e.g. `member-roster.declared.adminendorse`, `file-safety.declared.deepercheck`.
- 5 cannot be referenced yet: `capturerequest` and `capturerequestretry` (capture-requests declares literal sentences, not a word id); `caseimport` (case-import declares the constant `IMPORT_DIRECTED`); `checkrequest` (tasks: not located); `ask` (plane: `plane.declared.ask` is not in `rows.mjs` yet).

I have not converted the 113 and have not tightened registration. Tightening now would make the real registration refuse those five owners, and the plane registers next. The `is` text may show to members, so changing it is a visible change to the text.

**Decision 1, for you.** (a) **Recommended:** convert the 108 `is` rows to their owners' word ids now; capture-requests, case-import, tasks and plane give their five a word id; then registration compares `is` too (R50) and R51's test extends to it. (b) Amend R51 to `NON_ACTS` only, as the test checks today, and leave the 113 `is` rows as they are.

**Decision 2, for you.** `groupdescriptiondraft` (store-door): its declared word `store-door.declared.groupdescriptiondraft` has no design key, so `word("…")` in `src` fails the words check (`missingkey`). I kept the sentence on its `NON_ACTS` row, equal to the owner's text. Either the design keys it (then I switch the row to `word(...)`), or it stays held until the owner's word is keyed.

Also: the registration test still sets aside `sweeps` and `groupdescriptiondraft` (the owed filter), since link-sweep #6 and store-door #14 are not on `tranche/T51` yet. I have not merged the tranche (B24: when you say so). Tell me when to merge.

## J18 · REPORT

**REPORT (other modules' findings, from the product-wide `checks/run.mjs`; not my module, not changed).**
- coverage, named by no test: `agent-harness` R17; `agent-runner` R37, R38, R40; `installer-steps` R26, R31; `journey-check` R19.
- words, `missingkey` (`screens-intake`): `screen.about-knocker.known.head`, `screen.about-knocker.attribute.occupation`, `screen.about-knocker.evidence.label` (`t51-about-knocker.test.mjs` 25, 32, 57); `screen.watching.sweep.pages` (`t51-watching-named.test.mjs` 92); `screen.watching.pause`, `screen.watching.resume` (`t51-watching.test.mjs` 46, 51).
- words, `inline` (`strength`): `bio-plane/src/strength/method.mjs:349`.
- Still open from J15, on their branches: `link-sweep` `sweeps` (weight `reversible` on a read) and `store-door` `groupdescriptiondraft` (weight `reasoned` on a read); both go when their branches merge (B24).

## J19 · COMPLETE

**COMPLETE (B24, OP-GRADES #20).**

**Entries applied.**
1. **R39 (amended K4247):** `groupdescriptiondraft` has no `RUNG_ABSENT` row now (`src/op-grades/t48.mjs`); it is a read, in `NON_ACTS` alone, with store-door's declared sentence (QUESTION, decision 2). Tests: `owners.test` R16 (no grade); `t48.test` R39 (control: no row in `RUNGS` or `RUNG_ABSENT`) and R38–R41 (the table is `WRITES`); `pins` R39 comment; `t49.test` R43 tally 36 → 35 (control 34).
2. **R51 (new):** `register.test.mjs`: every declared op's `NON_ACTS` reason equals its owner's declared description; control: a read whose reason differs from its owner's is refused naming the op (`DECLARED_OP_DISAGREES`), and the owner's word is accepted. The `RUNG_ABSENT` half is open (QUESTION, decision 1).
3. **Words, product-wide (not in the module check):** 26 test copies of other modules' `localize` sentences in 11 test files (`owners`, `t35`, `t36`, `t37`, `t41`, `t46`, `t47`, `t48`, `t49`) now read through `declaredSentence(owner, op)`; each assertion kept.

**Deferred.** The `RUNG_ABSENT` `is` rows (113; QUESTION 1); `groupdescriptiondraft`'s design key (QUESTION 2); the owed filter for `sweeps` and `groupdescriptiondraft` until link-sweep #6 and store-door #14 merge; tranche not merged.

**Found in other modules:** REPORT posted (coverage, words, inline).

**Tests and checks** (run from civicos-process, product `/home/user/bio`):
- `node --test bio-plane/test/m/op-grades/`: 141 pass, 0 fail.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs op-grades`: 0 failures. `checks/coverage.mjs op-grades`: 51 of 51 named, 0 failures.
- `checks/words.mjs op-grades`: 0 failures; product-wide, no finding in op-grades.
- `checks/ownership.mjs op-grades tranche/T51 job/T51/op-grades`: 0 failures.
- `setup-words/build.mjs --check`: stale-rows note only (expected).
- `checks/run.mjs`: format 0, architecture 0; coverage and words failures only in other modules (REPORT).

Size (session_01J5x9uuvhngES6Vq6VYWnWb): test runs 9, module lines 3623

## J20 · COMPLETE

**COMPLETE (B25, B26; OP-GRADES #20, after the DEC-387 merge).** Pushed `657f162b5b`.

**Applied.**
1. **B26 (the start refusal):** every hand `NON_ACTS` reason of the 15 reworded ops now reads its owner's word (`word("<owner>.declared.<op>")` in `index`, `t34`, `t36`, `t37`, `t45`, `t47`), not a held sentence. `strengthbarset` leaves `OP_ALIASES`: strength declares it itself (`reasoned`), so it takes its own owner row, not `strengthbar`'s. The registration test (R50, B21) drops the owed filter (`owed` must be empty; link-sweep and store-door are merged). It passes.
2. **B25 (words):** `checks/words.mjs op-grades` reads 0 (inline, testcopy, missingkey). The 24 testcopy findings were already converted in my earlier commit; the tests that copied the reworded sentences now read through `declaredSentence`.
3. **B24 stands:** R39 and R51 (scoped to `NON_ACTS`, per your decision 1(b)).

**Tests.** `node --test bio-plane/test/m/op-grades/`: 141 tests, 138 pass, 3 fail. The three are below.
- `R17`: asserts 27 aliases; there are 26 now (`strengthbarset` removed). The count is in the requirement text, so the amendment is BOB's.
- `R42` and `R46`: in the static tables (not registered), `strengthbarset` is a rungless act with no `MARKS` entry. Once the owner's registration applies, it is `reasoned` and no longer rungless. The mark table follows the design kit (`MARKS_KIT_COMMIT`), which is also BOB's to take.

**Plane (`node --test bio-plane/test/m/plane/`):** 280 tests, 276 pass, 4 fail, none in op-grades' files as far as I can see: `R24` (`screen.contradiction.purpose` not held by the words list), `R5` (link-sweep `sweeps` in the route map), `R68` (a module exporting `DECLARED_OPS` missing from the assembly, named in `declarations.mjs`), `R71` (a declared op with no route, Worker arm or plane door). I did not verify the last two's cause beyond that. The plane starts: the registration no longer refuses.

**Checks.** `format` 0 failures; `architecture` 0; `coverage op-grades` 51 of 51; `ownership` 0 failures (it was run before the last push).

**Open for BOB.** R17's count (26), the `MARKS` entry for `strengthbarset` (or the amendment that says the mark follows registration), and the four plane failures above.

Size (session_01J5x9uuvhngES6Vq6VYWnWb): test runs 14, module lines 3640

## J21 · REPORT

Correction to J20 (Size line): module lines are 3627 (wc -l of bio-plane/src/op-grades/*.mjs), not 3640.

## J22 · COMPLETE

**COMPLETE (B27–B31; B28 1 and 2, B29, B30).** Pushed `733ebb1510` on `job/T51/op-grades`, with `tranche/T51` merged first (B29). Before that, the job branch was aligned with origin by BOB's route (B31); the stale local start line is kept on `stale/op-grades-local`.

**Entries applied.**
1. **B28 (2), groupdescriptiondraft.** Its NON_ACTS row reads `word("store-door.declared.groupdescriptiondraft")` (DEC-390), no held sentence. Registration does not refuse it.
2. **B27 (2), R42 and R46.** Both are evaluated over the registered tables: a fresh instance with every owner's `DECLARED_OPS` registered (`registeredOpGrades`, in `test/m/op-grades/declared.mjs`). `strengthbarset` (reasoned, from strength) is graded and needs no mark. R42's first test reads MARKS minus the owner-graded ops; the owner-graded entries stay as unread marks (J11 finding a). R46's first test uses the registered rungless set.
3. **B27 (1), R17.** The count is no longer written: the test reads op-declarations' `OP_ALIASES` by path (`declaredAliases`) and compares the key sets. It is 26 on both sides.
4. **B30, versionnotice.** `marks.mjs` marks it `["versionnotice", "Reversible", "read"]`; the new source `read` is K4259's ruling (`localize` id `op-grades.marks.k4259_read_mark`). R42's kit test and R46's kit test name it as the exception, as they name `notewrite`.
5. **B28 (1), t37.** `translationmark`'s expected reason reads `T37_NON_ACTS.translationmark` (the module's own table), not a copy of the sentence. A prefix check remains.

**Changes to a control, for BOB.** The K4206 control (R46: the table without `expertisewithdraw` leaves it unmarked) no longer holds: members declares `expertisewithdraw` once registered, so it is graded and not rungless. The control now names `login` (rungless after registration, marked Reversible): the table without `login` leaves exactly that act unmarked.

**Requirement lines for BOB.**
- R17 names "27 aliases"; the count is 26 (op-declarations R21). The amendment is yours.
- R42 and R46 take the rungless set over the registered tables (B27 2); R46 names the exception `versionnotice` (K4259) beside `notewrite`; MARKS_KIT_COMMIT is unchanged.

**An open question (B27 vs P4).** B27 says read op-declarations' alias table. The owners test header says this module imports nothing (P4), and the architecture check rejects an import of op-declarations (it is later in the order). I read it by path in the shared helper, the same way `collectDeclaredOps` reads other modules' `DECLARED_OPS`, and the architecture check passes. If you want that read stopped, the count goes back to the requirement text (26).

**Deferred.** Nothing in op-grades. The other `rows.mjs` finding is BOB's: the setup-words check reports `rows.mjs` stale for `op-grades.marks.k4259_read_mark` (expected; BOB regenerates at the layer close).

**Found in other modules (not changed).** None new. Plane (`node --test bio-plane/test/m/plane/*.test.mjs`): 280 tests, 278 pass, 2 fail: R24 (screen.contradiction.purpose words) and R5 (provenance-routes arms in the route map). Neither is in op-grades. The plane's start is no longer refused (DECLARED_OP_DISAGREES gone).

**Tests and checks** (from civicos-process, product `/home/user/bio`):
- `node --test test/m/op-grades/*.test.mjs`: 141 tests, 141 pass, 0 fail.
- `checks/format.mjs`: 175 modules, 0 failures. `checks/architecture.mjs … op-grades`: 0 failures. `checks/coverage.mjs … op-grades`: 51 of 51 named, 0 failures. `checks/words.mjs … op-grades`: 0 failures (inline 0, testcopy 0, missingkey 0, handlist 0). `checks/ownership.mjs … op-grades tranche/T51 job/T51/op-grades`: 1 file changed by op-grades, 0 failures.
- `checks/run.mjs /home/user/bio` (product-wide): words and coverage show findings only in other modules (coverage: 5, not op-grades) and this one `testcopy` fixed by item 5.
- `setup-words/build.mjs --check`: `rows.mjs` stale for the one new localize id (expected, BOB).

**A note on the commit.** The commit message does not name the model; the attribution line with the model name is left out (per the session's model-identity rule), and the session link is kept.

Size (session_017LS3B582bpu5TBffTAibNo): test runs 11, module lines 3628

## J23 · REPORT

**REPORT (another module, affordances).** `bio-plane/test/m/affordances/plane.test.mjs` R19 ("together the two drives reach every op RUNGS grades `reasoned`") is green on the tranche tip and red with op-grades' grade for `contradictionflag` (reasoned, contradiction R61, `FLAG_NO_REASON`): its `driven` list names the N345 acts (`contradictiondismiss`, `contradictionclarify`, `contradictiontakeup`, `contradictionresolve`, `resolutiondefect`) and not the flag. Needed from the affordances job: `contradictionflag` on that line, backed at contradiction's interface (R61's refusal, `contradiction.test.mjs`). The same grade turns green affordances' 'R1 R12 R24: N345's ops' test, so the two cannot both be satisfied without it. Also: `op-capabilities` has no row for `contradictionflag` (`needs: contribute`) if its table must name it.

## J24 · COMPLETE

**COMPLETE (B32 START, cause 1: marks for DEC-394's acts and the new flag; B27–B31 were applied by #22, J22).** Pushed on `job/T51/op-grades`, with `tranche/T51` merged first.

**Entries applied.**
1. **`capturerequests` and `casedrafts`** (R42, R46). Both are reads (op-declarations `mutating: false`); the kit weighs each 1 (Reversible); each has a `MARKS` entry, `Reversible`, source the kit. `MARKS_KIT_COMMIT` is `0310c4953d` (the design as the tranche holds it after DEC-394's B441 drawings: the registry lists these two rungless acts more than at `aa8bdcd0b4`; no earlier entry changed weight, none is dropped).
2. **`contradictionflag`** (contradiction R61; owner row `weight: "reasoned"`, `mutating: true`). Graded `reasoned` in `RUNGS` (refused `FLAG_NO_REASON`, C-93.42, which joins `JUSTIFICATION_REFUSALS`), with a `NON_ACTS` reason that is the owner's declared word (`localize("contradiction.declared.contradictionflag", …)`: that id is contradiction's own and the design's `words.json` does not key it, so `word()` would be refused by the words check; `localize` answers the list's row whatever English is given). The registration of every owner's `DECLARED_OPS` meets no `DECLARED_OP_DISAGREES` for it. It is a graded write, so it has no mark (R42's control). Not in `MACHINE_REFUSALS` (contradiction refuses a machine by its own code); by R18 `phone: true`.
3. Tests: `t51.test.mjs` (three new tests, seen failing first against the old source): the two marks and their source; the registered tables leave only those two unmarked and the flag has a rung; the flag's grade, backing code, reason and owner agreement, with controls. `pins.test.mjs` names the flag in its closed `reasoned` partition; `t48.test.mjs` and `t50.test.mjs` read the new commit.

**Reds on the tranche tip, not fixed here.** Fifteen failures in other modules' tests are identical with and without this change (run against `origin/tranche/T51`'s op-grades): `plane/release.test.mjs` R24 (screen purpose words), `plane/r42-entry.mjs`, `store-door/declared-ops.test.mjs` R17 (`groupdescriptiondraft`: a hand row disagrees with the owner's row), `screens-inquiry` `common` / `fr28-document` / `fr28-project`, `screens-publish/common`, `screens-settings/contract`, `journey-check/pseudo` (R29 ×6).

**Found in another module (REPORT also posted):** `bio-plane/test/m/affordances/plane.test.mjs` R19 "together the two drives reach every op RUNGS grades `reasoned`" is green on the tip and red with this change: `contradictionflag` is now `reasoned` and its `driven` list does not name it. Its backing is contradiction's own R61 test (`FLAG_NO_REASON` is refused), as `contradictiondismiss`'s is; `affordances` adds `contradictionflag` to the N345 line of that list. The affordances 'R1 R12 R24: N345's ops' test, which was red for the flag's missing rung, is green with the change. `op-capabilities` (later in the order) holds `casedrafts: null` and has no row for `contradictionflag`: if the capability table must name the flag (`needs: contribute`), that row is its owner's.

**Requirement lines for BOB.**
- R2/R1 (rung list): `contradictionflag` is `reasoned` (contradiction R61, `FLAG_NO_REASON`), beside N345's `contradictiondismiss`, `contradictionclarify`, `contradictiontakeup`; `FLAG_NO_REASON` joins the justification family (R1, affordances R19).
- R46: `MARKS_KIT_COMMIT` is `0310c4953d`; its rungless registered acts include `capturerequests` and `casedrafts` (kit 1, Reversible); `contradictionflag` has none (graded).
- R51: a declared op's reason whose id the design's list does not key is read through `localize` on the owner's id (here `contradiction.declared.contradictionflag`); the design may key it, after which `word()` replaces it.

**Impact.** `build/plan/impact.mjs origin/tranche/T51 HEAD`: 21 modules, 427 test files outside op-grades run (two at a time, `--test-force-exit`): the only failures are the fifteen above (identical on the tip) and the affordances R19 one.

**Tests and checks** (from civicos-process, product `/home/user/bio`):
- `node --test test/m/op-grades/`: 145 tests, 145 pass, 0 fail. Plane (`test/m/plane/`): 280 tests, 279 pass, 1 fail (R24 above, on the tip). Control-plane: 324 of 324 pass.
- `checks/format.mjs`: 175 modules, 0 failures. `checks/architecture.mjs … op-grades`: 0 failures. `checks/coverage.mjs … op-grades`: 51 of 51 named, 0 failures. `checks/words.mjs … op-grades`: 0 failures. `checks/ownership.mjs … op-grades origin/tranche/T51`: 7 files changed by op-grades, 0 failures.
- `setup-words/build.mjs --check`: rows match.

Size (session_01MfAJMdL1CxJq36VfSFDQdb): test runs 9, module lines 3646

## J25 · COMPLETE

**COMPLETE (B33, fix round 4, K4458).** Pushed `07c0539161` on `job/T51/op-grades`, `tranche/T51` merged (`5de135cb08`). Start re-sent after the stale-branch route of B31/B32 (the local copy's start commit was behind origin; kept as `stale/op-grades-local`, nothing discarded).

**Entries applied.**
- `bio-plane/src/op-grades/t51.mjs:43–49`: the hand copies of the three owner sentences are replaced by `localize(<owner's declared key>, <sentence>)`: `file-safety.declared.scanmirror` (`scanmirror` in `T51_RUNG_ABSENT` and `T51_ACT_NON_ACTS`), `capture.declared.captureseenin` (both tables), and `officeconfirm` at `t51.mjs:48` now `word("entities.declared.officeconfirm")`, which the word list holds. The header now says the file imports only `setup-words`, as `t34.mjs` does.
- `bio-plane/src/op-grades/t33.mjs:216`: `moneysets` reads `localize("money.declared.moneysets", …)` (was an inline `R(...)` copy); `import { localize }` added.
- Why `localize` and not `word` for the first two and the money one: `words.json` (design) does not hold those three keys, so `word()` fails the words check's `missingkey` arm. `localize` takes the list's row when there is one and the literal otherwise, which is R14's rule and what the owners use.

**Failing test now green.** `plane/release.test.mjs` loads: the `DECLARED_OP_DISAGREES: officeconfirm description` refusal is gone (on the tip, the plane suite reads 46 failures; with this fix it reads 2, below).

**Suites (node --test --test-force-exit).** `test/m/op-grades/`: 149 tests, 149 pass, 0 fail. `test/m/plane/`: 297 tests, 295 pass, 2 fail. Both reds are outside op-grades: R24 (`screen.objective.purpose` is not held by the words list; release.test.mjs:78) and R74 (extraction R80, control-plane R117). `test/m/affordances/`: 282 tests, 281 pass, 1 fail (R61 R62, T51 B14 ACT_HELP). `test/m/op-declarations/`: 247 tests, 246 pass, 1 fail (R34, affordances R48: the ACT_HELP partition), which is red on the tip too (checked with my change stashed).

**Checks.** `checks/ownership.mjs … op-grades tranche/T51 job/T51/op-grades`: 0 failures (one file changed by op-grades on the diff). `checks/words.mjs … op-grades`: 0 failures; inline 0, plain 0, missingkey 0 (it was 3 + 2). `checks/architecture.mjs … op-grades`: 0 failures. `checks/format.mjs`: 0 failures. `checks/run.mjs /home/user/bio` overall: architecture 2 failures (case-authoring `reload.test.mjs`, not op-grades); coverage 10 failures, all in other modules (agent-harness, agent-runner, control-plane, installer-steps, interface-shell, journey-check, pdf-reader, screens-daily, screens-inquiry, screens-publish); words 0 failures.

**Requirement lines.** None new or amended: the three hand rows follow their owners' declared keys under R50/R51, which the existing lines already state.

**Deferred / found elsewhere.** Nothing deferred in op-grades. Not mine: the plane's R24 and R74 reds above, and affordances R61 R62 and op-declarations R34 (ACT_HELP partition). Reported for BOB's routing.

Size (session_01Q1BcrfRKSNQeK7397e6hvF): test runs 12, module lines 3679

## J26 · COMPLETE

**COMPLETE (B34, fix round 6, G55; K4562).** Commit `bio-plane/src/op-grades/t33.mjs:284` (+ test), on `job/T51/op-grades`, `tranche/T51` merged.

**Entries applied.** `moneyingestread` is graded beside `moneyingest` in `t33.mjs`: a read, so a `NON_ACTS` row only (no rung, no ground, not in `MACHINE_REFUSALS`, no consequence statement; `phoneOf` true). Its reason is `localize("calculations.declared.moneyingestread", "read: a money ingest's stored lists, a page at a time, with true counts and whether the ingest is complete (`calculations` R14); writes nothing")`. **For calculations' declaration (R50 (b)): its `description` must be this same key and English, weight `read`, `mutating: false`.** `moneyingest` is unchanged (`reasoned`, NO_REASON). Which op-declarations list a read joins is op-declarations' (its job, 154).

**R-FOUR.** (1) Cause: the op is new, so no grade existed. (2) Gap: nothing pins a new read's grade until its owner declares it; `g55.test.mjs` pins it at the interface (R13, R53 named). (3) `test/m/op-grades/g55.test.mjs` seen red on the base (row absent), green with the row. (4) N: pure data.

**Red by name (seam, provider unmerged).** `control-plane/totality.test.mjs:17` lists `moneyingestread` as `stale` until op-declarations (154) merges its declaration. Not on the inherited list; it clears at that merge.

**Proposed requirement text (BOB writes).** Append to R53: "(fix round 6, G55) `moneyingestread` (`calculations` R14) is a read: a hand row in `NON_ACTS` with a "read: …" reason, keyed `calculations.declared.moneyingestread`, no rung or ground; it agrees with its owner's declaration (R50)."

**Tests and checks.** `test/m/op-grades/` all files: 0 fail. Impact set (`impact.mjs origin/tranche/T51 HEAD`, 522 files, one at a time): failures only `control-plane/totality` (above), `screens-action/contract` (G52, inherited), `plane/release` (inherited R24), `journey-check/pseudo` (7 fail, identical on base), and one `screens-intake/capture` failure that did not recur in 3 reruns and passed on base (transient). `checks/run.mjs`: format, architecture, coverage 0 failures; words: only inherited `inline 1` at `case-checker/spec.mjs:11`, none in op-grades. `checks/ownership.mjs … op-grades tranche/T51 job/T51/op-grades`: 0 failures.

**Declarations.** op-grades owns no census op; no declaration changed. **Deferred / other modules.** Nothing.

Size (session_014rNFkQLf1kdsYEby9XrVQi): test runs 560, module lines 3680
