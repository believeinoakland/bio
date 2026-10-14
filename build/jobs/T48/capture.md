# capture (T48)

**Status** · session_01LtRvmNXLopJbGvdXoMYZH8 · depth 2 · COMPLETE · handled B0

## Completion (CAPTURE #31, session_01LtRvmNXLopJbGvdXoMYZH8)

**Read (P20, mechanics §6 step 2; §17).** I read these whole myself: `build/requirements/capture.md` (public and private) and all of the module's code (`src/capture/index.mjs`, `ops.mjs`, `schema.mjs`, `grammar.mjs`, `checks.mjs`). The reading set measured 1,041 KB at START, over the limit. Two helpers in this session therefore read the rest whole and each wrote me a digest citing every section (K2032, mechanics §17 (3)):
- the first covered every file in `test/m/capture/`, plus `cap13-reuse-pages.test.mjs` and `d57selflink.test.mjs`;
- the second covered the public parts (Purpose and Provides) of all 16 used modules, layer 3's contract in `build/layers.md`, and their T48 entries.

The sources stayed binding: I re-read the three sign-ins, the t35, grammar and ops titles, and the two harness endings before changing them.

**Entry applied (T48-16, N1052, test only).** `cap13-reuse-pages.test.mjs`:109, `d57selflink.test.mjs`:93 and `m/capture/plane.test.mjs`:56 now sign in by `{handle: "m1"}` (credentials R67). Their K3192 reds clear: each was `SIGN_IN_REFUSED` at START, and all three pass now. No code change was needed.

**R77 and T48-14.** `REGISTER_FIRST` already orders the register by `julianday(registered)`, which is "first registered". No capture test pins the old moving value:
- `t47.test.mjs`:71–90 pins the first registration;
- the fixture's `register` keys on `capture_sha`, so a re-registration cannot be expressed in it.

Nothing follows from T48-14 here.

**Flaws in my own module, fixed (P8).**
- `grammar.test.mjs`'s four titles and header named R37 for the information grammar, which is R89 (R37 is the C-118 rows). They now name R89. The R89 comments in `index.mjs` (:17, :266) and `grammar.mjs`' header are corrected the same way. R37 stays named by `knocker.test.mjs`, `held.test.mjs` and `upload.test.mjs`.
- `t35.test.mjs`'s four DEC-149 titles cited stale line numbers (`index.mjs:1033`, `:1045`, `:1414`, `ops.mjs:150`) and named no id. They now name the function and the id each tests (R68 `#replayMatches`, R39 `renderAdmit`, R73 `acquireOp`).
- `d57selflink.test.mjs` had no guard against a run in which no assertion ran. It now has the one `cap13-reuse-pages` has.
- The negative-control notes in `cap13-reuse-pages` and `d57selflink` name `src/store.mjs`, which no longer exists. Each now also names where the code is now; the dated record stands as it is.
- `ops.test.mjs`' header named retired R42; it now names R73 (acquisition R8).

**Deferred, with why.** `evidence-absent.test.mjs`:77–100 scans `src/**/*.mjs` source text for `NOT_FOUND`, which breaks the rule that tests check behaviour at the interface. It carries R63's "the code is minted at one site", a property of the source that no interface test can show. Deleting it would weaken R63's test, so I left it and report it to BOB to rule.

**Found in other modules.** Nothing.

**Tests and checks.**
- `node --test test/m/capture/ test/cap13-reuse-pages.test.mjs test/d57selflink.test.mjs`: tests 144, pass 144, fail 0, after the last change. There are no layer tests (manifest), and no service I provide changed.
- `checks/format.mjs .`: 168 modules, 167 requirements files; 0 failures.
- `checks/architecture.mjs . capture`: 29 product files, 120 relative imports; 0 failures.
- `checks/coverage.mjs . capture`: 43 of 43 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs . capture tranche/T48`: 0 failures.
- `checks/run.mjs .` over the product:
  - architecture: 3276 product files; 0 failures;
  - format: 0 failures;
  - channels: 0 failures;
  - coverage: 46 failures, none of them capture's (other modules' ids, under rule 5 (1)).

Size (session_01LtRvmNXLopJbGvdXoMYZH8): test runs 9, module lines 3253

## J1 · COMPLETE

T48-16 complete on job/T48/capture. The three tests (cap13-reuse-pages, d57selflink, m/capture/plane) sign in by {handle}, and their K3192 reds clear. No code change: R77's REGISTER_FIRST already picks the first registration, and no capture test pins the moving value. Own flaws fixed (P8): grammar titles R37→R89; t35 titles name their ids, not line numbers; d57 gets the no-assertion guard; stale store.mjs and R42 notes. For your ruling: evidence-absent.test.mjs:77 scans src text for NOT_FOUND (R63's one-site property). It breaks the interface-only test rule, but deleting it would weaken R63's test, so I kept it. Tests 144/144; format, architecture, coverage (43/43) and ownership: 0 failures. run.mjs: architecture 0; coverage's 46 are other modules'. Record: build/jobs/T48/capture.md.
