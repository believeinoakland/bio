# inquiry (T28)

**Status** · session_01QNQaUggEEA2eXfwiByRD2P · depth 2 · COMPLETE · handled B3

## Entries applied

- **L6, inquiry R4 and R12 (N522; DEC-112 (6)):** a leg on an imported finding reference. The check (R11) and the projection (R12) already handled it: the grammar's arm (`inquiry-grammar` R11, C-21.3) replaces C-6.3's target arm for the ref, `content.citationRefusals` passes it, the cycle guard skips it, and the projection stores the ref as `target_id` as spelled with `target_type` '' and no content row, so `restingOn`, `restsOnLive` and R40's columns name it. No code change was needed there beyond the projection's comment; the new tests pin it.
- **R24 (found while confirming the projection):** `divide` wrote every apportioned leg's target into the child's `references[]` as `cites`. A ref there is refused by `inquiry-grammar` R11, so a question with a ref leg could not be divided (CHILD_REFUSED). Now the ref stays on the child's leg verbatim, its `target_edition` among its fields, and is never cited.
- **R15 (K1304, answering J1):** `earnedBasis` asked `membership.inSight` of a ref, which is no bundle, so the leg was dropped and the answer said `out_of_view`/`legs_out_of_view`; `ensureLegContent` named its null case `INQUIRY_TARGET`. A ref leg is now listed as part of the question's own document, earns nothing here, and states the null case `IMPORTED_TARGET`. No new use: the ref predicate is `inquiry-grammar.parseImportedFindingRef`.
- **R38 test (B3, from inquiry-grammar J2):** the pin of `INQUIRY_GRAMMAR_CHECKS` widened to seven rows, with C-21.3 `IMPORTED_LEG_MALFORMED`.
- **Catalogue rows:** none added by this module (no `awaiting stamp` rows).
- **Size (K617):** module lines 3,897 after the job (3,888 at B1), under the ~4,000 mark.
- Read whole for the job: `build/requirements/inquiry.md`, `build/plan/draft-T28-n522.md`, `bio-plane/src/inquiry/index.mjs`, `test/m/inquiry/fixture.mjs`, `test/m/inquiry/divide.test.mjs`. The other source files (`checks.mjs`, `contradiction.mjs`, `grammar.mjs`, `schema.mjs`, `text.mjs`), the other test files and the Uses' public parts were run or relied on, not re-read: the entry is wording plus the two fixes above, none touching them. `draft-T28-dec112.md` was searched for this module (it names it only in item 13, now superseded by N522), not read whole.

## Deferred

- None.

## Found in other modules

- None. The acceptance check of a ref leg is `accepted-work` R4's registration, which this module's world does not create; its tests are that module's.

## Tests and checks

- New: `bio-plane/test/m/inquiry/imported-legs.test.mjs` (R4, R12, R24, R15). Widened: `grammar.test.mjs` R38 (also names R4).
- `node --test bio-plane/test/m/inquiry/`: tests 171, pass 170, fail 0, todo 1 (R31, MK-5, as before).
- Tests of every module that uses `inquiry` (R15 changed): citation 55, basis-versions 118, strength 87, contradiction 101, ai-runs 56, run-productions 39, capture-requests 72, intent 65, reevaluation 101, publication 98, docket 37, project-stage 23, ratification 199, case-authoring 100, conformance 54, consequences 30, actions 74, action-plans 53, affordances 153, queue-producers 73, queue 105, control-plane 139, plane 65 pass; 0 fail in each.
- No layer tests (`build/manifest.md`).
- `checks/format.mjs`: 95 modules, 94 requirements files; 0 failures. `checks/architecture.mjs inquiry`: 0 failures. `checks/coverage.mjs inquiry`: 49 of 49 live requirement ids named by a test; 0 failures. `checks/ownership.mjs inquiry tranche/T28`: 3 files changed; 0 failures.
- Merge: `tranche/T28` merged with inquiry-grammar in (K1306); accepted-work not yet merged at completion, so this branch merges third once BOB says it is in.

Size (session_01QNQaUggEEA2eXfwiByRD2P): test runs 4, module lines 3897

## J1 · QUESTION

Confirmation asked at START (draft §3): the projection (R12) already keeps a non-bundle `target_id` as spelled and resolves no content row for it (`content.citationPlan` marks it not a document; `target_type` is ''); `content.citationRefusals` passes it; the cycle guard skips it. No code change is needed there.

Two places in my module would mishandle a ref leg, which I am fixing within R4/R12/R15/R24 (no new use):
1. `divide` (R24) copies every apportioned leg's target into the child's `references[]` as `cites`; a ref there is refused by inquiry-grammar R11, so dividing an inquiry with a ref leg would fail CHILD_REFUSED. Fix: a ref is carried on the child's leg verbatim and is not written to `references[]`.
2. `earnedBasis` (R15) asks `membership.inSight` of each target and leg; a ref is no bundle, so a ref leg is dropped and the answer says `legs_out_of_view` / `out_of_view`, and `ensureLegContent` would call its null case `INQUIRY_TARGET`.

QUESTION (R15's reading). My best reading, which I am building unless you answer otherwise: a ref leg is a part of the inquiry's own document, which the viewer already sees, so `earnedBasis` lists it (sight of the ref is the inquiry's sight; inquiry reads no accepted-work, per N522's "no new use"), earns nothing for it (its grades are the edition's, strength R33), and states its null case as a new `IMPORTED_TARGET` ("another group's finding, graded by the edition it names; this record holds no part of it"), never `INQUIRY_TARGET` and never out of view. The alternative is to keep it left out as out of view (fail closed), which misreports a visible leg as hidden.

## J2 · COMPLETE

Complete: N522 applied (R4, R12 confirmed and pinned; R24 divide keeps a ref out of references[]; R15 per K1304, IMPORTED_TARGET; R38 pin widened to C-21.3 per B3). inquiry 170 pass/0 fail; every user of inquiry green; format, architecture, coverage (49/49), ownership 0 failures. No catalogue rows added. 3,897 module lines. tranche/T28 merged with inquiry-grammar in; I merge again when you say accepted-work is in. Record has the detail.
