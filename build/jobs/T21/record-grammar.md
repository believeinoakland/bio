# record-grammar (T21)

**Status** · session_011zouWbsKdokGSgTHZdNzmM · depth 2 · COMPLETE · handled B0

## Completion

**Entries applied** (B1, `build/plan/current.md` T21 layer 1):
- **N456, form (b) (K904).** `bundle.mjs`: C-6.3's `workproduct_state` arm and the comment with it deleted (replaced by a two-line note that C-6.3 raises nothing here and its basis arm is inquiry-grammar's); the header's "C-6.1–.3's core" now ".2"; `EXTENSION_ARMS`' `checkProjectExtension` ids are `['C-2.9']`, with a note that a grammar claiming C-9.1 beside it still fills the slot whole. `document.mjs`: `STATES.project` is legal `forming closed`, legacy `investigating matured`, edges `forming`, `investigating`, `matured` → `closed`, `closed` → `forming`, with a comment giving K904's reason. Fixtures re-keyed: the project stub claims and marks `C-2.9`; C-6.3's two fixtures became one (`C-6.3 retired: a distributed project with no distributions is no finding`); four project-machine fixtures added (`clean closed project`, legacy `investigating` and `matured` readable, `published` refused C-4.1). `expected.json` changed only by name: the C-6.3 findings gone, the stub's marker, the two N458 messages, and the C-4.1 message listing the project's legal states.
- **N458.** C-13.2's message is `record has been updated but carries no Session Log entry`; C-16.1's is `manifest target '…' does not match record '…'`. Re-scanned every string in my paths: the rest name `bundle.md` (a file name) or interface identifiers, which stay (N71).
- **K921, R42.** `PROPOSAL_STATES.template`, last and frozen, with its three sentences; the `RangeError` names the eight subjects (it reads the table's keys).
- **N469.** Listed notes: `bundle.mjs`:52 (repair-reachability) re-worded: the property is the minting arm's, and no structural arm here passes a code; `grades.mjs`:31 (hygiene detector (C), a store claim) dropped; `labels.mjs`:197 (skillpack ARM B2a) kept as provenance, made past tense ("found by it; deleted at T20"); `labels.mjs`:228 (sufficiency-state control, and the m025 witness) cut to a two-line provenance note. Found on re-scan: `sha256.mjs`:49–51 ("battery-cross-validated … the battery is load-bearing") now names `digests.test.mjs` (R20–R22), which does it; `grades.mjs`:27 (skilldoctrine.test.mjs as a live positional reader) dropped; `grades.mjs`:86 (earnedbasis.test.mjs measured, "in the battery") kept as provenance, made past tense; `acts.mjs`:27 (a d484 suite "asserts exactly that" over `store.mjs`) made past tense and pointed at R29's `where`. `labels.mjs`:222's "the suite pins" now says "the module's tests pin … (R37)", which `labels.test.mjs` does. `document.mjs`:14 (focus.test.mjs's words) is a quotation, left.

**`not yet met: T21` marks met:** R28 (slot ids `['C-2.9']`: `bundle.test.mjs` R28), R35 (`STATES.project`: `document.test.mjs` R35, and at `checkBundle` R35 R40), R40 (C-6.3's arm retired: `bundle.test.mjs` R40 C-6.3), R42 (`labels.test.mjs` R42). Merge early: the change is in, at this record's commit.

**Deferred:** none.

**Found in other modules (REPORT J1):** nine tests of other modules go red with this change, each because it encodes the slot or the project ladder N456 removes; none is fixed here (P7).
- intent `test/m/intent/grammar.test.mjs`:47 (R29): expects the slot's ids `C-2.9, C-9.1`. Intent's L7 share (drops C-9.1).
- record-core `test/m/record-core/record-core.test.mjs`:1717 (R67): expects `ids: ['C-9.1']` alone to be GRAMMAR_MALFORMED (part of a slot); C-9.1 is in no slot now, so it registers. And :1984 (R67, K766, "a slot several registrations"): `a` and `b` both claim `C-2.9, C-9.1`; C-9.1 is now an ordinary id, so `b` is GRAMMAR_DECLARED. Record-core's code is right under R67; its tests need re-keying to C-2.9 alone.
- promotion `test/m/promotion/promote.test.mjs`:340 (R19): revises a project `forming` → `investigating`, now STATE_MOVE_UNDECLARED (C-86.6) through promotion's R15 fence.
- project-stage `test/m/project-stage/stage.test.mjs`:62, :100, :293, :385, :467 (R1, R2, R4): each writes a project's `investigating`/`matured` move, now STATE_MOVE_UNDECLARED. Rule 3 names only C-4.2 as accepted red; these are not named.
- Already red on `tranche/T21` before this change (not mine): membership `module-order.test.mjs`:12 (R83), `t9-notice-sight-bounds.test.mjs`:185 (R79), promotion `registry.test.mjs`:58 (R39, R45, R46), all on `build/modules.json`'s order after the fold.

**Generated artifacts staled (REPORT J1):** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`; six record-grammar files changed, `fleetbundles.test.mjs` names them); `newgroup/dist/newgroup.bundled.mjs` (`installer`; `newgroup-bundle-fresh.test.mjs` (C) fails with my change, passes on the tranche). Not regenerated (B1).

**Process note:** a mistyped re-run (an empty file list, so `node --test` ran the repository's whole default suite) was stopped mid-run; its control tests had mutated `agent-worker/src/harness.mjs`, `index.mjs`, `agent-worker/dist/*` and `bio-plane/dist/*`. None had local changes before; all were restored to HEAD and nothing of it was committed.

**Tests and checks:**
- `node --test bio-plane/test/m/record-grammar/`: tests 62, pass 62, fail 0
- every module using record-grammar (512 test files under the 62 `tests` paths of `modules.json`): tests 4018, pass 3988, fail 12 (the 9 above and the 3 pre-existing; re-run of those files with the tranche's record-grammar: 3 fail)
- `node checks/format.mjs`: 86 modules, 84 requirements files; 0 failures
- `node checks/architecture.mjs … record-grammar`: 25 product files, 45 relative imports; 0 failures
- `node checks/coverage.mjs … record-grammar`: 40 of 40 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … record-grammar tranche/T21`: 12 files changed; 0 failures

Size (session_011zouWbsKdokGSgTHZdNzmM): test runs 8, module lines 2259

## J1 · REPORT

Generated artifacts staled by this change (not regenerated, B1): `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (not_product; fleetbundles.test.mjs names the six record-grammar files), and `newgroup/dist/newgroup.bundled.mjs` (installer; newgroup-bundle-fresh (C) fails with this change and passes on tranche/T21).

Other modules' tests that go red with N456 (not fixed here, P7; each encodes the old slot or project ladder):
- intent grammar.test.mjs:47 (R29): expects slot ids C-2.9, C-9.1 (intent's L7 share).
- record-core record-core.test.mjs:1717 (R67): `['C-9.1']` alone no longer GRAMMAR_MALFORMED; :1984 (R67, K766): a second claim of C-9.1 is now GRAMMAR_DECLARED. The code is right under R67; the tests need re-keying.
- promotion promote.test.mjs:340 (R19): revises a project forming → investigating, now STATE_MOVE_UNDECLARED (C-86.6).
- project-stage stage.test.mjs:62, :100, :293, :385, :467 (R1, R2, R4): write investigating/matured moves, now STATE_MOVE_UNDECLARED.
Rule 3 names only C-4.2 as accepted red; these nine are not named, so they are yours to place.
Already red on tranche/T21 before this change: membership module-order.test.mjs:12 (R83), t9-notice-sight-bounds.test.mjs:185 (R79), promotion registry.test.mjs:58 (R39, R45, R46), all on modules.json's order after the fold.
