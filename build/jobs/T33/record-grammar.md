# record-grammar (T33)

**Status** · session_013Mm1CuEimicgaJCPS4wXSM · depth 2 · COMPLETE · handled B1

## Completion (RECORD-GRAMMAR #8)

**Entry applied: T33-1** (B0.1, S0-1, C:A-6; K1467, K1470; R1, R3 amended; R46–R48 new).
- `ID_TABLE` (`ids.mjs`, R46): frozen, 51 frozen `{prefix, owner, form}` rows, no prefix twice. Sequential `<P>-<yyyy>-\d{4,}`, opaque `<P>-<yyyy>-[a-z0-9]{16}` (`measures-T33/assistant-substrate.md` §5). Rows: R1's 14 bundle prefixes; the census below; `EVT LIN MNY PFA IDC` opaque; `MTI CHK MSR HYP DUT CALC STQ` reserved, sequential.
- `idPattern(prefix)` (R47): a new anchored `RegExp` every call, source `^<core>$` (a slug composes after `source.slice(1, -1)`); `null` for a prefix not in the table or a non-string; never throws.
- `isHypothesisId(v)` (R48): a string matching `idPattern('HYP')`; never throws.
- R1: `BUNDLE_ID_RE` and `ANN_ID_RE` are built from `idPattern` over the 14 bundle prefixes. Every id valid before stays valid; `…-10000-…` is accepted.
- R3: `OBJECT_TYPES` gains the twelve new prefixes. `checkBundle` judges C-2.5 against the bundle prefixes' types only (`bundle.mjs`, `BUNDLE_TYPES`), so `object_type: event` is still unknown there and no new prefix implies a type. Its findings over the fixtures are unchanged (R40 test green).

**The census (R46: "the job's START lists them from the code"; START did not list them, so it was taken from the code at `tranche/T33` @ a5abf18fa6).** Minted by `record-core.allocId`: INFO, INQ, ACTN, STD, STDP, CONF, ACT, CMP, CONS, ESC, ASP, GOAL, PLN, ENT, REL, FIL, CPK, THY. Drawn at random by `mintOpaqueId` (record-core R6): PROJ, CASE, WCD, TASK, DRAFT, RVG, SRC, NOTE, DKT, TPL, TPP, TRG, WIZ, WZP, WEG. Minted by the module itself in the `<P>-<yyyy>-<4>-…` shape: THEME (connections), LEAD (observation-log). Validated by a module's own `\d{4}-\d{4}` copy: ENT (inquiry-grammar, bias, action-grammar), GATH (monitoring), THEME, LEAD, TASK, PLN (actions). Left out because they are not this grammar's shape: `CALSIG-<ts>` (calibration), `CR-<ts>` (capture-requests), `KNOCK-<date>` (capture). Owner is the module whose object the id names and that asks for the mint. Where several modules mint one prefix (INFO from monitoring, capture-requests, provenance and control-plane; INQ from intent, conformance and contradiction), the owner is the module that owns the type: INFO is capture's, INQ inquiry's. PROJ is promotion's (its one minter). The reading is QUESTION J1.

**Deferred:** none.

**Found in other modules** (REPORT J2; COMPLETE J3 calls it J3 in error):
1. Stale generated artifacts, as expected from a record-grammar change: `bio-plane/dist/bio-plane.bundled.mjs` (fleetbundles D-298 arm: four record-grammar sources changed) and `bio-plane/src/case-checker/program.mjs` (case-checker R13, accepted red 3). Both are BOB's to regenerate at the layer close.
2. The `OBJECT_TYPES[id.split('-')[0]]` readers (strength `typeOfId`, basis-versions' `target_type`, actions, inquiry, citation, content, case-authoring, ai-runs, run-productions, action-grammar, inquiry-grammar) now answer a type such as `event` for an `EVT-` target where they answered `undefined`/`''` before. No such target exists at T32's close, and every equality those sites test (`information`, `inquiry`, `action`) is unchanged. Each new owner should confirm that a leg or reference to its rows reads as it intends.
3. `skills` (`test/m/skills/planning.test.mjs`, "R28 the action_planning layer") is red on `tranche/T33` before this change. It is not on the plan's accepted-red list.
4. The callers' `\d{4}-\d{4}` copies (inquiry-grammar, bias, action-grammar `ENT`; monitoring `GATH`; connections `THEME`; observation-log `LEAD`; tasks `TASK`; actions `PLN`; case-grammar `NOTICE_REFERENCE_PATTERN`; signatures `sshsig.mjs:357`, `sign-release.html:466`) still refuse `…-10000`. Their own T33 entries move them to `idPattern`/`ID_TABLE`.

**Tests and checks**
- `node --test bio-plane/test/m/record-grammar/*.test.mjs`: 71 pass, 0 fail.
- Every module that uses record-grammar (the whole `test/m` suite, `npm test` in `bio-plane`): 5977 tests, 5960 pass, 6 fail. On `tranche/T33` without this change, the same files fail 5: membership's order tests (R83, R79), plane's store R2/R10, promotion's registry R39/R45/R46 (all accepted red 2) and skills R28 (item 3 above). The sixth failure is case-checker R13 (accepted red 3, item 1).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … record-grammar`: 0 failures. `checks/coverage.mjs … record-grammar`: 46 of 46 live ids named, 0 failures. `checks/ownership.mjs … record-grammar tranche/T33`: 8 files, 0 failures.
- Final `uses`: none (unchanged).

Size (session_013Mm1CuEimicgaJCPS4wXSM): test runs 7, module lines 2368

## J1 · QUESTION

R46 says "the job's START lists them from the code"; B1 does not list them. My reading, built on in the code: the census in my record (Completion, "The census"), 37 prefixes beyond the new 12, all sequential. Owner = the module whose object the id names and that asks for the mint. Where several modules mint one prefix, it is the type's owner: INFO capture, INQ/PROB/FOCUS inquiry, PROJ promotion. `CALSIG-<ts>`, `CR-<ts>` and `KNOCK-<date>` are left out (not `<P>-<yyyy>-<counter>`). If you want other owners or a different set, answer with the rows to change. Each one is a one-line edit to `ID_TABLE` and its pinned test.

## J2 · REPORT

Found while doing T33-1 (details in my record, "Found in other modules"):
(1) I staled `bio-plane/dist/bio-plane.bundled.mjs` (fleetbundles D-298) and `case-checker/program.mjs` (R13, accepted red 3). Both are yours to regenerate at the layer close.
(2) The readers of `OBJECT_TYPES[id.split('-')[0]]` (strength, basis-versions, actions, inquiry, citation, content, case-authoring, ai-runs, run-productions, action-grammar, inquiry-grammar) now type an `EVT-`/`HYP-`/… target as its new type, where they had none before. Their equality tests are unchanged. Worth a line in the new owners' STARTs.
(3) `skills`' planning test "R28 the action_planning layer" is red on tranche/T33 without my change. It is not on the accepted-red list.
(4) The callers' `\d{4}-\d{4}` copies still refuse `…-10000` until their own T33 entries.

## J3 · COMPLETE

T33-1 applied. `ID_TABLE` (51 rows), `idPattern`, `isHypothesisId`; R1 built from `idPattern` (counters `\d{4,}`); R3's twelve new types, with `checkBundle` admitting bundle types only. Module tests: 71 pass. Every user's tests (whole `test/m`): 5960 pass, 6 fail. Five are reds already on the tranche (four accepted red 2, plus skills R28, REPORT J3); the sixth is case-checker R13 (accepted red 3). Checks format, architecture, coverage (46/46) and ownership: 0 failures. Final uses: none. Commit 95325e10cc on job/T33/record-grammar; record updated.
