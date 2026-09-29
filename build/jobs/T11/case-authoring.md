# case-authoring (T11)

**Status** · session_015k1nax4hEesSV8iyG1Ve91 · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1; plan layer 8, `case-authoring` bullet).
- **N259, N275 (its share).** C-32.6's region `is-machine-publish` in `#publishCase` (R1) now returns through a named helper, `fenceRefusal("MACHINE_CANNOT_PUBLISH", {detail})`, not a spread `{...refusal(…), detail}`: the region holds the refusal's verdict and the guard's arm C judges it (1 judged, 1 code checked). The module's rows are built through one helper per family with the code its literal first argument (`derivationRefusal`, `fenceRefusal`, over the one `refusal(family, key, extra)`), because arm C reads a helper call only in that shape.
- **N297 / N242 (its share, 5 guard failures, R29).** The four `where`s of C-44.1, C-44.3–C-44.5 named `publishCase`, the transaction wrapper; the regions are in `#publishCase`, so each now names `src/case-authoring/index.mjs #publishCase > <region>` and resolves, each judging its refusal. The fifth is N259's above. `NO_STATEMENT`'s and `MACHINE_CANNOT_PUBLISH`'s catalogue `where`s already name `src/case-authoring/index.mjs #publishCase > …` on `tranche/T11` (changed in an earlier layer); both regions resolve and are judged (`is-publish-statement` 1 judged).
- **B1's R15 note.** `reevaluation.raise`'s answer is carried whole as the finding's `reevaluation`, `listeners_failed` included, never refused on: already so in the code; now tested (a new R15 test).

**Improvement in my own module.** R2's unseen-or-absent `NO_SUCH_PROJECT` was a literal minted here (arm G: the code at 3 sites). It now answers through membership's `noSuchProject(proj)` (membership R78: every module answering that condition answers through it; K231), so it carries the code with C-70.5's check and translation and membership's fixed detail, byte for byte the same for a hidden and an absent project. Arm G: `NO_SUCH_PROJECT` now at 2 sites (conformance's and membership's). `noSuchProject` is a membership service outside the Uses line's list (`viewerPredicate`, `isProjectOwner`, `isJoinedParticipant`, `existenceAct`); the edge is declared (`membership`), so only the requirements' Uses line wants the name added (BOB's).

**Deferred.** None.

**Marks.** R21's `not yet met` (its named-draft half) is met: T8's job built it (the named draft's stamp decides; no other draft consulted) and the R21 test proves each arm; the mark was never struck. R12's mark stays: `UNCLEARED_HUNCH` is refused at `op=publish`, but the mark names REC-15's ceremony screens, deferred on DEC-33. Striking R21's is BOB's (requirements file).

**Found for other modules / legacy-tests.**
- **legacy-tests (the DEC-49 guard's ratchets), from this job alone** (guard on my branch vs `tranche/T11` @ merge, 73 → 69 FAIL lines): gone — the 4 region-drift failures, arm C `is-machine-publish`, `regions resolved` below floor (433 → 437 vs floor 434) and `region lines` below floor; the SPREAD ceiling count falls 8 → 7 (ceiling 4); arm G `NO_SUCH_PROJECT` 3 → 2 sites. New or moved, each the sweep and not a walk going blind: `return-position outcomes` 261 → 260 (below floor 261: the spread object literal became a helper call, which is N259's allowed shape); floor slack `regions` 437 (floor 434), `regionLines` 5378 (5338), `codesChecked` 872 (866), `refusalsJudged` 851 (842). Re-pinning them is legacy-tests'.
- **conformance**: its `NO_SUCH_PROJECT` literal (conformance/index.mjs, arm G's remaining second site; also the identical-translation failure against MEMBERSHIP_CHECKS) should answer through membership's `noSuchProject` (R78), as this module now does.
- **promotion R34**: no catalogue row was added or changed by this job (only this module's own `where`s in `checks.mjs`), so `CATALOG_VERSION` is not moved; if BOB reads a `where` change as a row change, it is promotion R34's to stamp.
- No generated artifact is made stale by this job that is not the plane's own bundle (`bio-plane/dist`, `not_product`, rebuilt at layer close).

**Tests and checks run.**
- `node --test bio-plane/test/m/case-authoring/`: tests 39, pass 39, fail 0 (two tests strengthened or added: R2 answers `noSuchProject` byte for byte with its code and row; R15 carries `listeners_failed` from a throwing listener, the act lands, a working listener is told once).
- Users' suites (review, and publication and ratification beside it): `node --test bio-plane/test/m/review/ bio-plane/test/m/publication/ bio-plane/test/m/ratification/`: tests 150, pass 147, fail 0 (3 todo).
- Legacy suites touching these acts: `node --test bio-plane/test/publishedcase.test.mjs bio-plane/test/d150-statement-acknowledgement.test.mjs`: pass 2, fail 0, before and after.
- `node civicos-ui/check-refusal-codes.mjs`: exit 1 (69 FAIL lines, none naming case-authoring; see above).
- `node checks/format.mjs`: format: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … case-authoring`: architecture: 12 product files, 57 relative imports (0 naming no tracked file, not judged); 0 failures.
- `node checks/coverage.mjs … case-authoring`: coverage: 1 modules, 30 of 30 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … case-authoring tranche/T11` (after the commit): ownership: 5 files changed by case-authoring between tranche/T11 and HEAD; legacy-store: 0 line(s) added, 0 removed; legacy-checks: 0 line(s) added, 0 removed; 0 failures.

Size (session_015k1nax4hEesSV8iyG1Ve91): test runs 6, module lines 2258
