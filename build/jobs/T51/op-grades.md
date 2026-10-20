# op-grades (T51)

**Status** · session_01EDK63b7XiZcZsCWWCnFvsT · depth 2 · COMPLETE · handled B7

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
