# op-declarations (T31)

**Status** · session_01WV8MW7765m14i8DS4LJJx5 · depth 2 · WORKING · handled B2


## Completion

**Entries applied** · N528: R15 (`wizard-scripts`' fifteen ops: specs, both session sets, `NEEDS` rows, and seven act lists `WIZARD_SCRIPTS_ACTIONS`, `_AUTHOR`, `_BY`, `WIZARD_PROPOSAL_ACTIONS`, `WIZARD_PROGRESS_ACTIONS`, `WIZARD_SCRIPTS_READS`, `WIZARD_CHECK_READS`, on the readings of J1, confirmed by B2/K1396). N534: R16 (`importwatch`, `importunwatch` in `CASE_IMPORT_ACTIONS` and `CASE_IMPORT_BY`, `contribute`, a member session's only). K1396: `wizardrefusaltally` is store-internal (R6), in `tables.test.mjs`' `STORE_INTERNAL`. Turned green: `t28.test.mjs` R14/R6 (the case-import map pin, K1383), now naming R16's two ops.

**Tests** · new `t31.test.mjs` (R15, R16: spec whole, bearers and agent reach, session sets, `NEEDS`, stamps by list, the map totality for case-import, the wizard op set exact). `node --test test/m/op-declarations/`: tests 58, pass 58, fail 0. No layer tests in `build/manifest.md`.

**Deferred** · R15's R6 arm against `wizard-scripts`' own ops map (as `t28.test.mjs` reads `caseImportOps`): the map does not exist on `tranche/T31` until wizard-scripts merges; on the `CHANGE` after it, I add that test.

**Found in other modules (REPORT)** · Users' tests run with this change: admission 19/19, public-read 110/110, skills 54/54 (unchanged). affordances 155 pass, 1 fail (its R35 test, red before this change too: its R38 rows). control-plane 145 pass, 2 fail: `r49-routes.test.mjs` R49 (pins case-import's map at eight ops; red on the tranche before this change, control-plane R52's to update), and one new, its R2/R41 "unaccounted" test, which now sees the seventeen new ops as unpublished until affordances' R37/R38 `NON_ACTS` rows land (affordances merges before op-declarations in L11, so green after the merge order). Conversely affordances' R12 totality will read its new `NON_ACTS` keys as stale until this module merges.

**Checks** · format: 0 failures; architecture: 0 failures; coverage: 16 of 16 live ids named, 0 failures; ownership vs tranche/T31: 0 failures.

Size (session_01WV8MW7765m14i8DS4LJJx5): test runs 8, module lines 2683

## J1 · QUESTION

R15 states `NEEDS` for the five member acts (`contribute`) and the six reads (`null`), and is silent on three ops. Every one needs a row: R3 asks one for each mutating op a session reaches, and affordances R37 names all fifteen in `NON_ACTS` (its R12 reads a missing key as stale). My reading, which I am building on:
1. `wizardpropose`: `contribute`, as `templatepropose` (R8) and `whatchangedpropose` (R10): proposing is contributing, never publishing.
2. `wizardeditorgrant`, `wizardeditorrevoke`: `null`, D-136's reasoning for the governance acts (`membercaps`, `groupnameset`): an administrator's act, bounded by the roster (`NOT_AN_ADMIN`), not a working capability. Spec `classes: ["admin","member"]`, `machineClasses: []`, both session sets (an enrolled administrator's session is a `member` kind).
3. `wizardprogress`: `null`, `queuemute`'s reasoning: an unattributed tally writes nothing in a member's name, and a view-only member runs wizards too (DEC-120 (1)).
Also my reading of "the reads ..., `viewer` stamped, and `wizardcheck`, reached also by an `ai` credential": the five reads are a member session's only (`machineClasses: []`), and `wizardcheck` is `classes: ["admin","member","probe"]` with no `machineClasses`, stamped with nothing (checkScript is pure and takes the registration, not a viewer).
The act lists I add, for control-plane R50's stamps: `WIZARD_SCRIPTS_ACTIONS` (viewer: draft, revise, submit, approve, retire, propose), `WIZARD_SCRIPTS_AUTHOR` (author: draft, revise, submit), `WIZARD_SCRIPTS_BY` (by: approve, retire, editorgrant, editorrevoke), `WIZARD_PROPOSAL_ACTIONS` (proposer: propose), `WIZARD_PROGRESS_ACTIONS` (nothing: progress), `WIZARD_SCRIPTS_READS` (viewer: the five reads), `WIZARD_CHECK_READS` (nothing: wizardcheck). R16: `importwatch`, `importunwatch` join `CASE_IMPORT_ACTIONS` and `CASE_IMPORT_BY`.

## J2 · COMPLETE

R15 and R16 applied, K1396's wizardrefusaltally store-internal added; t28's case-import pin green. op-declarations 58/58; format, architecture, coverage (16/16), ownership 0 failures. Deferred: R15's R6 test against wizard-scripts' ops map, on the CHANGE after it merges. Reported in the record: control-plane's R2/R41 unaccounted test is red until affordances' R37/R38 rows merge (and affordances' R12 sees my rows' absence until I merge); r49-routes is control-plane R52's.
