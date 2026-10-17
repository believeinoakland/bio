# interface-assets (T50)

**Status** · session_016MSD5KGRrpy5SUDewydm1b · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Found while running `checks/run.mjs` over the product (interface-assets' own checks pass; these are in other modules, not changed by this job):

- coverage: 25 modules with live requirement ids named by no test (5,702 of 5,853 named). Modules and ids: admission R29–R31; affordances R63–R64; agent-harness R17; agent-runner R36–R38, R40; control-plane R102, R103, R105, R107, R108; installer R56–R73 (18 ids); instance-setup R92–R94; interface-shell 16 ids (R73–R84, R86–R89); journey-check R15, R16, R18, R19; machinery-producers R15; op-declarations R73, R75; op-grades R46; queue-producers R41, R42; queue R55–R57; screens-action R20; screens-daily 11 ids; screens-entry R23, R24; screens-inquiry 13 ids; screens-intake 6 ids; screens-investigate 9 ids; screens-publish 10 ids; screens-settings 10 ids; screens-wizards R13, R14, R16, R17; site R13–R16; translations R1–R16 (all 16).
- format: 0 failures. architecture: 0 failures. channels: 0 failures.
- run.mjs exits 1 because of the coverage list above only.

Not mine to change; reported for the owners' jobs and for the stamp that rule 5 names.

## J2 · COMPLETE

T50-26 · interface-assets, complete. Commit 4585636d2b on job/T50/interface-assets.

Applied
- R9: ASSETS_COMMIT is 7be06eb4cb, the design commit the START names (the same commit as site's SITE_COMMIT). Its visual files and page are byte-identical to e5fd78226f, which the START named; the START's commit is the one the generator reads.
- generate.mjs: COMMIT re-pointed; index.mjs regenerated. Four lines changed (ASSETS_COMMIT, civicsmith.css, shell.css, icons.svg); the 15 faces and three licences are unchanged.
- civicsmith.css at the new commit carries .cs-btn:active, .cs-btn[aria-busy="true"] (the stylesheet's own spelling), .cs-btn[data-done], .cs-testband, .cs-part and .cs-choice, each named by a rule (R9 test). R8's band is kept.
- Test file: R1/R5/R8 titles and COMMIT re-pointed; R8's commit assertion moved to R9; new R9 test and R9 control (wrong commit, a hand edit of a served file, a missing named class refused).

Deferred: none.

Found in other modules: see J1 (REPORT), coverage gaps in 25 modules, none in interface-assets.

Checks (from civicos-process, product /home/user/bio)
- node --test bio-plane/test/m/interface-assets/assets.test.mjs: 18 tests, 18 pass, 0 fail.
- node checks/architecture.mjs /home/user/bio interface-assets: 3 product files, 0 failures.
- node checks/coverage.mjs /home/user/bio interface-assets: 9 of 9 live requirement ids named by a test, 0 failures.
- node checks/run.mjs /home/user/bio: format 0 failures; architecture 0 failures; channels 0 failures; coverage 25 failures, all in other modules (J1); exit 1 for those alone.

Size (session_016MSD5KGRrpy5SUDewydm1b): test runs 1, module lines 192 (generate.mjs 160 lines; index.mjs 32 lines, generated, 1,157,322 bytes).
