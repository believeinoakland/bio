# BOB to op-declarations (T47)

**Read** · handled J5

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, op-declarations: **T47-53 · op-declarations** · (K3041) `statementack`, `reviewcomment`, `publishpreflight`, `publishtensions` join `SESSION_OPS.member` (each op's own gate and author stamping unchanged, tested), so the publish screens can draw them; (N992) R21, R27, R34, R52 re-taken from DEC-198/DEC-199's `registry.json`, clearing its eight reds; T47's new ops specified; (N980) a member-session read answering a knock's source id (`sourceof`, `sourcerung` in `SESSION_OPS.member`, or a new read) · text BOB's · doubt 7; (K3084) specs for credentials' `unlock`, `reauth`, `passwordresetlink`, `passwordresetlook`, `passwordreset`, clearing R19/R30's 2 reds; adds: (K3084, K3061 D3) R57 the specs of `unlock`, `reauth`, `passwordresetlink`, `passwordresetlook`, `passwordreset` (requirement text for the K3084 item); R58 `REAUTH_ACTS`; R59 specs of `grouplogoset`, `grouplanguagesset`, `signrequest`, `signintrace`; R60 R21/R27 read at PR #33's head (owed acts served by name) · doubt 10.; adds: (K3104) R61 the spec of `peopledirectory` (a member read, `viewer` stamped)
Your requirements: `build/requirements/op-declarations.md` (read whole). Marked `*(not yet met: T47)*`: R54, R55, R56, R57, R58, R59, R60, R61; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: none beyond your entry.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); yours to clear: your eight DEC-198/199 reds (rule 5 (7a)); R49/R6 (`projectlist`, 7c); R19/R30's 2 (K3084); K3112's affordances R12 with op-grades.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 2216 KB with your tests (K2700; used public parts 1497 KB across 61 modules, an upper bound), over the 600 KB limit. Read your requirements and code whole and, per mechanics §3, each used module's Purpose and only the services your Uses names; for what remains over the limit (your tests, used parts), give helpers in your session your entry and what follows it (the later L11 jobs in the merge order that use your services), have them read those parts in full and write you a digest citing each section (K2032, §17 (3)); the sources stay binding. State in your record how the set was read.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · CHANGE

K3143: new R62 on `tranche/T47`: `REAUTH_ACTS`' shape `op → null | {field, values}` (admission imports it; `memberset` `{field: "role", values: null}`), and R6's store-internal list gains `reauthdue` (store-door R15) and signin-door's five (`signintokenhold`, `signintokenrefused`, `signindisclosuredue`, `signintracekeep`, `signintraceread`; plane R49). Also: `peopledirectory` has no help text yet (affordances); name it in `ACT_HELP_ABSENT` as a read. Merge `tranche/T47`.

## B3 · ANSWER · re J1

K3144: (1)–(3) stand. (4): R62's shape governs (admission imports it): `op → null | {field, values}`; rows as R63 on `tranche/T47`: `memberset` `{field: "role", values: null}`, `memberadd` `{field: "role", values: ["admin"]}`, `subscriptionsignin` `{field: "step", values: ["start"]}`, others `null`. R63 also: `grouplogo` store-internal; `publishedlist` `classes: null` (the door serves it publicly; screens-entry reads it without a session). Merge `tranche/T47`.

## B4 · CHANGE

K3147: op-grades is merged into `tranche/T47`: every T47 op has its NON_ACTS row there; give each a NEEDS row (a present `null` for the public and session-own ones). Merge `tranche/T47`.

## B5 · CHANGE

K3148: wizard-scripts (T47-47: the registry at f90b187c7b, 66 screens) and op-grades (T47-48) are merged into `tranche/T47`. Merge it into your branch and run your tests against them before COMPLETE (a job already COMPLETE re-runs and posts COMPLETE again).

## B6 · CHANGE

K3149: setup-words (T47-52, WORD_ROWS at 6f0d88d8d5) and instance-setup (T47-75: flat parts, grouplogoset/grouplanguages(set), the `grouplogo` route, `groupLogoAsset`) are merged into `tranche/T47`, with wizard-scripts and op-grades before them. Merge it and run your tests against them.
