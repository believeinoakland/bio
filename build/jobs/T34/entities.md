# entities (T34)

**Status** · session_01SnQPPnjMsxKG92GWzPZpV8 · depth 2 · WORKING · handled B0

## Completion

**Entries applied** (on `job/T34/entities`, from `tranche/T34` @ 7a1036236e).
- **T34-16** (N560, K1563 (2)): the module states its declaration to connection-grammar's battery, `CONNECTION_DECLARES` `{undated: true, group_wide: true}` (a relation holds no dates; the registry is the group's, C6, K1489). Its battery test (R47, R9) now runs `ownerConformance` with that declaration over a fixture naming no in, out, undetermined or fenced item, plus a hub node, and asserts `ok: true` and `failures: []` whole, `at` and `sight` answered `inapplicable`. Negative controls: without the declaration exactly `at` and `sight` fail and no `inapplicable` key is answered; a declaration the answers belie (an item stating a date; the other viewer short an item) is caught as `declares`. R6 and R7 are tested directly beside it (every date the same set, each marked undetermined; every member viewer the same set; a missing viewer refused).
- **T34-78, entities' share** (DEC-149, K1784, K1785): every member-facing string that said "this instance" / "the instance" now says "your group's": C-91.1 and C-91.2's translations (`checks.mjs`:13, :18), and the details at `index.mjs`:174 (IDENTIFIER_NOT_IN_SPACE with no form held), :679 (UNKNOWN_SCHEME), plus three the plan's list did not name, same pattern: :813 (PROCEEDING_KIND_UNKNOWN), :1458 (R19's `why`), :1538 (C-91.2's detail with no form held). Comments and identifiers unchanged. `dec149.test.mjs` names each changed string by its requirement (R19, R20, R21, R25, R43, R45) and sweeps over 60 answers that no translation, detail or `why` says the instance, a copy, the plane or a server. :174's no-form arm is reachable only through a profile no held profile is (kinds without a `proceeding` space), so that arm's test hands entities a record stand-in whose active profiles name such a profile; every other act is the real record's.
- **The two reds BOB named** (K1738): `idmatch.test.mjs` R20 no longer pins id-spaces' list as literal names, it compares with `spaces()` over the view; `t33.test.mjs` R43 compares UNKNOWN_SCHEME's `schemes` with `jurisdictions.combine`'s own `identifier_schemes` for the test profile, not a literal list. Both green.

**Improvements made in my module.** Only the three extra strings above (DEC-149's rule, beyond the plan's four lines).

**Deferred.** None.

**Found in other modules** (REPORT J1).
- **promotion** (row census, plan Rules (5) item 4): C-91.1 IDSPACE_UNKNOWN and C-91.2 IDSPACE_VALUE_NOT_IN_SPACE translations changed (DEC-149), `awaiting stamp` until T35's promotion job. `bio-plane/test/system/row-census.test.mjs` is red naming exactly these two (green before this job).
- **control-plane**: `bio-plane/test/m/control-plane/catalogue-end.test.mjs` pins C-91.1's and C-91.2's translation digests in `rows-before-r43.json`; they need re-pinning as K1572's C-91.1 was by CONTROL-PLANE #22. The test is already red on `tranche/T34` before this job (it stops at `ADMINS_FIRST lost its row`), so it fails the same way with or without this change.
- **Generated artifact made stale** (§14): `bio-plane/dist/bio-plane.bundled.mjs` bundles `src/entities/`.

**Uses** (unchanged): record-grammar, jurisdictions, civil-time, connection-grammar, id-spaces, record-core, membership, provenance, extraction, content.

**Tests and checks run** (HEAD abd4638627):
- `node --test bio-plane/test/m/entities/`: tests 88, pass 88, fail 0 (was 81 pass, 2 fail at the start: R20, R43).
- No layer tests (manifest). No provided service changed (`CONNECTION_DECLARES` is a new constant; the changed strings are refusal wording); no other module's test pins the old wording (grep), save the two suites above.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture entities`: 15 product files, 45 relative imports; 0 failures. `coverage entities`: 49 of 49 live requirement ids named by a test; 0 failures. `ownership entities tranche/T34`: 6 files changed; 0 failures.

Size (session_01SnQPPnjMsxKG92GWzPZpV8): test runs 5, module lines 1878

## J1 · REPORT

Three findings outside entities, from T34-78 (DEC-149): (1) promotion: C-91.1 IDSPACE_UNKNOWN and C-91.2 IDSPACE_VALUE_NOT_IN_SPACE translations changed to say "your group's jurisdiction profiles"; row-census.test.mjs is red naming exactly these two (green before), awaiting stamp until T35's promotion job (plan Rules (5) item 4). (2) control-plane: catalogue-end.test.mjs pins C-91.1's and C-91.2's translation digests (rows-before-r43.json) and needs a re-pin as K1572's C-91.1 had (CONTROL-PLANE #22); it is already red on tranche/T34 before this job (ADMINS_FIRST lost its row). (3) Generated artifact stale (§14): bio-plane/dist/bio-plane.bundled.mjs bundles src/entities/.
