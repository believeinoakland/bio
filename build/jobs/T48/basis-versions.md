# basis-versions (T48)

**Status** · session_01KjNrjv7CqBp7Kcsh6vw11D · depth 2 · WORKING · handled B1

## Completion

**Read.** Requirements `build/requirements/basis-versions.md` whole (public and private); the module's code whole (`index.mjs`, `grammar.mjs`, `checks.mjs`, `text.mjs`, `schema.mjs`), P20; my entry in `build/plan/current.md` (T48-27). The reading set was over the 600 KB limit (B1), so per K2032 two helpers in this session, given my entry, read in full and digested with section citations: (1) every file under `bio-plane/test/m/basis-versions/` (22 test files and `fixture.mjs`); (2) the Public part of each module in my Uses, the layer-6 contract in `build/layers.md`, and `run-productions` R4/R25, `ai-runs`' `op=suggest` mentions and `inquiry` R62, plus the code of every `appendVersion` caller. The sources stay binding; I read `machine-passage.test.mjs` whole myself, since the new test sits beside it.

**Entry applied.** T48-27 (N1013, K3099): R28's documented call names `version.author`.
- Behaviour: `appendVersion` already writes every field of `version` onto the version row in the caller's order, `author` included, and R49's accept arm (R6's check, and the preview at `versionAccept`) already keys on the row's `author`. So no behaviour changed. `run-productions` R4 already passes `version.author` (`run-productions/index.mjs` `appendVersion` call).
- Documentation: `appendVersion`'s comment now gives the documented call with `version.author`, and says the outer `author` is only who promotes. The module header's stale "through `ai-runs`" now reads "through `run-productions`' `op=suggest`".
- Test: new `bio-plane/test/m/basis-versions/append-author.test.mjs`, which names R28. It has three tests: the row holds `version.author` as given, in the caller's order; a machine `version.author`, then a member's `versionAccept`, calls the registered `onMachinePassage` read exactly once, with the version's legs and the accepting member; the control, a member's `version.author`, is not asked. The outer `author` is the same machine in both arms, so only `version.author` differs.

**Deferred.**
- R28's `NO_DOCUMENT` and `UNSPLICEABLE_BASIS` refusals, and "nothing written" on them, are not driven by a test (helper digest, flaw 2). These need a bundle with no `bundle.md`, or a version block whose inline value the grammar would refuse on the promotion before it. The fixture can build neither without reaching past the interface. Left for a later job on this module, which would extend the fixture.
- The other test-depth gaps the digest lists (R35/R36 checked against the tables, R37's 256-candidate cap, R39's bounds, R42's no-host arm, R50 named in `acts.test.mjs` by an op key only) predate this job and are outside T48-27's entry. I note them here for a later job and did not widen this one.

**Found in other modules / requirements (REPORT).**
- `build/requirements/basis-versions.md` (BOB's text): R28's header still says "For `ai-runs`' `op=suggest`", and R30 says a machine appends "through `ai-runs`". Since K82, `op=suggest` is `run-productions`' (its R4).
- `reevaluation` (layer 7, `reevaluation/index.mjs` adoptVersion) calls `appendVersion` with no `version.author`, only the outer member `author`. Its versions' rows hold no author. That is correct for R49, which only exempts machine authors, but the record does not name who authored the adopted version. Whether it should is for `reevaluation`'s requirements.
- No generated artifact made stale beyond the plane bundle's normal regeneration at layer close (`bio-plane/src/basis-versions/index.mjs` changed in comments only).

**Tests and checks.**
- `node --test bio-plane/test/m/basis-versions/`: baseline 152 pass, 0 fail; after the change, 155 pass, 0 fail. No layer tests are named in the manifest. No service changed (comments only), so no user module's tests were owed.
- `checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
- `checks/architecture.mjs … basis-versions`: 28 product files, 98 relative imports; 0 failures.
- `checks/coverage.mjs … basis-versions`: 47 of 47 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … basis-versions tranche/T48`: 0 failures.
- `checks/run.mjs` over the product: format 0, architecture 0 (3286 files), channels 0. Coverage shows 37 failures, all other modules' (plane, queue, review, run-rules, screens-*, setup-words, skills, wizard-scripts, …); none is basis-versions'.

Size (session_01KjNrjv7CqBp7Kcsh6vw11D): test runs 2, module lines 3782

## J1 · COMPLETE

T48-27 complete. R28's documented `appendVersion` call now names `version.author`. The code already wrote it on the row, and R49's accept arm already keyed on it, so there was no behaviour change: the doc comment was updated, and a stale "through ai-runs" in the module header was fixed. New test `append-author.test.mjs` (R28): a machine `version.author` accepted by a member asks onMachinePassage exactly once with its legs; control: a member's is not asked. Module tests: 155 pass, 0 fail (baseline 152). format, architecture, coverage (47/47) and ownership: 0 failures. run.mjs: architecture 0; coverage's 37 failures are all other modules'.
REPORT items (detail in my record): (1) requirements R28 header and R30 still name `ai-runs` for op=suggest (run-productions' since K82), which is BOB's text; (2) reevaluation's adoptVersion appends with no `version.author`. Deferred: tests for R28's NO_DOCUMENT and UNSPLICEABLE_BASIS (needs fixture work).

## J2 · REPORT

(1) build/requirements/basis-versions.md R28's header ('For ai-runs' op=suggest') and R30 ('through ai-runs') are stale: op=suggest is run-productions' (its R4, since K82). This is BOB's text. (2) reevaluation (layer 7, adoptVersion) calls basis-versions appendVersion with no version.author, so its versions' rows name no author. That is harmless for R49, which exempts only machine authors, but the record does not hold who authored the adopted version: a question for reevaluation's requirements.

## B2 · CHANGE (K3257), processed

Merged `tranche/T48`. R25's extract arm now reads "the candidate source `run-productions` registers, R40": a wording change only. The module's own comment on that arm (`#narrowCandidateList`, `index.mjs`) said "ai-runs"; it now names `run-productions` and R40, matching. No behaviour changed. Re-run: module tests 155 pass, 0 fail; format, architecture (29 files, 99 imports), coverage (47 of 47) and ownership: 0 failures each.

Size (session_01KjNrjv7CqBp7Kcsh6vw11D): test runs 3, module lines 3782
