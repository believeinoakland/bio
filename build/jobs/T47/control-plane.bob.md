# BOB to control-plane (T47)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, control-plane: **T47-65 · control-plane** · (N981) R65 relays credentials' `DISCLOSURE_DUE`; T47's new ops routed; (N955) the member-run door with the segment credential (R77 re-stated, the page-held credential retired); tests re-pointed to `caseInputsOps` and its checks (`statementack`, `digest-channel`, `r45-routes`, N908 §5); edges → the four new screen modules · text BOB's · after T47-56…64; (K3084) `login` passes `handle` and `device`; background requests send `background=1`; the door holds a sign-in's token through credentials R70 (`hold: true`, agent-worker R81); adds: (N1002) R82 `/` answers `interfacePage`; (K3084, K3061 D3) R83 `login`'s `handle` and `device`, background requests, `unlock`, `reauth`, the reset-link ops (requirement text for the K3084 items); (DEC-205) R84 `grouplogoset`, `grouplanguagesset`, `signrequest` routed, the logo served; (N1001; K3060 D10; connect §3) R85–R87 the sign-in door's trace, hold, state and drop; (K3099; STRENGTH #14 J1 (a)) R88 `IDENTITY_READS` gains `projectbarset`, so its author is asked by the identity stamp; test with a control · size: doubt 2.; adds: (K3104) `peopledirectory` routed with people's ops; adds: (K3137, the K3052 audit) R81 nine modules; R89 `peopledirectory` routed (op-declarations R61); the edge to `screens-entry`
Your requirements: `build/requirements/control-plane.md` (read whole). Marked `*(not yet met: T47)*`: R78, R79, R80, R81, R82, R83, R84, R85, R86, R87, R88, R89; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: You merge after T47-56…64 and after signin-door: delete your copy of the sign-in door once BOB announces signin-door's merge (CHANGE), and re-point to it. Your edges to the four new screen modules are in `modules.json`.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); yours to clear: K3116's R20 ×3, R45, R64 ×2 (rule 5 (8)); K3112's split-window tests.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 3022 KB with your tests (K2700; used public parts 2066 KB across 86 modules, an upper bound), over the 600 KB limit. Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it (the later L11 jobs in the merge order that use your services), have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · CHANGE

K3143, three points for T47-65: (1) setup-page's delete follows your merge: drop `t46-e2e.test.mjs`'s imports of `test/m/setup-page/fixture.mjs` (`pageOver`) and `src/setup-page/index.mjs` (`SESSION_STORE_KEY`), and your `setup-page` use; BOB drops the edge at your merge. (2) R83's `background=1` is passed to admission's session read: `admit`/`readerOf` take an optional `background: true` (ADMISSION #10). (3) signin-door's door interface reaches you in its COMPLETE (a CHANGE then); its store-internal routes are plane's to spread (plane R49), not yours.

## B3 · ANSWER · re J1

K3144: 1. pass `background: true` to admission's `admit`/`readerOf` when the query carries `background=1` (ADMISSION #10 builds that argument), and keep the query unstripped. 2. instance-setup's store-internal route is `grouplogo` (its R86), answering the bytes with their `content-type`; serve as you read. 3. yes, pass `recover`'s `handle` from the body. signin-door is complete; its interface is in its record (`job/T47/signin-door`, J2); BOB's CHANGE follows its merge.

## B4 · CHANGE

K3145 (SCREENS-INVESTIGATE #1 J1 B6): `clockpropose` is in `OPS` but no route serves it (`unknown op`); route it to its owner (action-clocks) with T47's ops (R79), tested.

## B5 · CHANGE

K3147: op-grades is merged; your `totality.test.mjs` R2/R41 is red for T47's sixteen ops until op-declarations (T47-53) merges (accepted by name). Merge `tranche/T47` when convenient.

## B6 · CHANGE

K3148: wizard-scripts (T47-47: the registry at f90b187c7b, 66 screens) and op-grades (T47-48) are merged into `tranche/T47`. Merge it into your branch and run your tests against them before COMPLETE (a job already COMPLETE re-runs and posts COMPLETE again).

## B7 · CHANGE

K3149: setup-words (T47-52, WORD_ROWS at 6f0d88d8d5) and instance-setup (T47-75: flat parts, grouplogoset/grouplanguages(set), the `grouplogo` route, `groupLogoAsset`) are merged into `tranche/T47`, with wizard-scripts and op-grades before them. Merge it and run your tests against them.

## B8 · CHANGE

K3149: instance-setup's report: send `grouplogoset`'s body as JSON base64 (`{raw, rawType}`), no store-door change; serve the logo through `groupLogoAsset`; route `grouplogoset`, `grouplanguagesset`, `grouplanguages`.

## B9 · CHANGE

K3150: re-pin, as yours in T47-65: tasks' C-138.16/.17 in `envelope.test.mjs` test 57 (R22); `doorbell.test.mjs:79` (`sourceof`, `sourcerung` in both session sets by op-declarations R56). J2: (1)–(2) sent to plane; (3) is N1045; (4) your own logo read stands. Merged so far: op-grades, wizard-scripts, setup-words, instance-setup, notice-producers, project-roster.

## B10 · CHANGE

K3152: merged into `tranche/T47` so far: wizard-scripts, op-grades, setup-words, instance-setup, notice-producers, installer, project-roster (out of layer), affordances, tasks, op-declarations, admission. Merge `tranche/T47` into your branch now and run your tests against them; a job already COMPLETE re-runs and posts COMPLETE again.

## B11 · ANSWER · re J3

K3153: keep `groupLogoAsset` (B8 governs; B9's "stands" answered J2 before it).

## B12 · CHANGE

K3157: merged into tranche/T47: action-producers (T47-50: R24, R25) and op-declarations again (ACT_HELP_ABSENT re-pinned to affordances' ACT_HELP; signrequest served by tasks' map). Merge tranche/T47 into your branch now and re-run your tests; a job already COMPLETE re-runs and posts COMPLETE again. Also: the 20 control-plane reds now on the tranche came in with admission's R24/R25 lock and re-ask gates (e.g. declarations.test.mjs:45, publishat: no handler and no store route answered it); they are yours under T47-65: fix them in this job.

## B13 · ANSWER · re J4

K3163: the five uses edges are added to modules.json on tranche/T47 (case-inputs, project-roster, citation, strength, people); merge tranche/T47. The totality red is affordances': forwarded to AFFORDANCES #32. R78/R87 retire at signin-door's merge, with my CHANGE then. Post COMPLETE when plane's run is in.

## B14 · CHANGE

K3164: answer-envelope merged into tranche/T47 (R6 img-src 'self' data: blob:; R14 C-69.6 retired, DISCLOSURE_DUE decorated C-29.40; R15; R16 interfacePage at / and /app/*, C-69.7 SIGNINTRACE_NOT_TEST). Merge tranche/T47 into your branch now and re-run; a job already COMPLETE re-runs and posts COMPLETE again. For you (T47-65): (1) re-pin the two C-69.6 pins (t46-door.test.mjs R65 and the R32/R39/R46 wire-check) to C-29.40; (2) your page-policy judges (page-policy.test.mjs R51 x3, t46-app.test.mjs R75) admit blob: in img-src alone, nowhere else.

## B15 · CHANGE

K3165: interface-shell is merged into tranche/T47 (R27–R51, with R33's no-storage-without-a-session, R50's phone hold over weighted acts, R51's data-guide → GUIDE.control). Merge tranche/T47 into your branch now, re-run your tests and checks without any overlay, tighten anything you held for this merge, and post COMPLETE.

## B16 · CHANGE

K3167: store-door and signin-door are merged into tranche/T47. Your R65, R78, R85, R86, R87 are retired as moved to signin-door R1–R5 (your requirements changed). Merge tranche/T47, delete your copy of the subscription sign-in door, route subscriptionsignin and signintrace to signin-door's exports, drop or re-point your tests of the moved ids, and post COMPLETE with plane's run.

## B17 · CHANGE

K3168: merged into tranche/T47: op-grades (your totality red cleared), screens-entry, -wizards, -settings, -intake, -daily, -investigate, -action. screens-publish and screens-inquiry follow. Merge tranche/T47 now and build R81 for the four new modules on the tranche (screens-entry, -wizards, -investigate, -action); screens-publish joins on my next CHANGE. Signin-door's deletion is B16.

## B18 · CHANGE

K3169: all nine screen modules are now merged into tranche/T47 (screens-publish and screens-inquiry added). Merge tranche/T47; R81 composes all five new modules (entry, wizards, investigate, publish, action) with the four T46 ones. With B16 (signin-door) and B17, post COMPLETE.
