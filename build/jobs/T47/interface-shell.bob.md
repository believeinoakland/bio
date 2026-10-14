# BOB to interface-shell (T47)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 11, interface-shell: **T47-56 · interface-shell** · (N985, N986, N987) the kit's gaps: a row whose name is also its reference link, the appearance control as a kit call, `cs.choice` over record data, a page-clock `cs.later(ms, fn)`, a redraw that lets a screen fill a field it drew, a `REF_SCREENS` kind for a knock; (N897 (1)) the People rail place; the shell's routes to the new screen modules; Settings › "Group settings" opens the redrawn sections, the setup page keeping only what stays undrawn · text BOB's; adds: (N999, K3052, K3061 D3, DEC-202 (2)) R32–R34 the session record across tabs, idle lock and sign-out, the password asked again; (DEC-201 (8)) R35 `unavailable`; (N1002) R36 old addresses forwarded, the test-instance band; (DEC-203, K3061 D8) R37 People opens the directory, R29 replaced, R25/R28's "Group settings" link retired; (DEC-200 (2), (4)) R38 R28's four re-points retired; (N1001; connect §3) R39 a refusal's `trace` drawn as a reference; (DEC-207, DEC-208, DEC-210; K3079 (a), K3080) R40–R42 the signer kit `cs.signer` (key made and kept on the device by choice, key file, one confirmation signs a listed set) · doubts 8, 11.; adds: (DEC-214 (1), (2); K3127) R43 the masthead's mark, R44 the at-a-glance elements; adds: (K3137, the K3052 audit) R45 the `setup` frame; R38's second re-point `unlock` on `front`; R9 maps `/app/review` to `review-outside`; R28 nine modules
Your requirements: `build/requirements/interface-shell.md` (read whole). Marked `*(not yet met: T47)*`: R27, R28, R29, R30, R31, R32, R33, R34, R35, R36, R37, R38, R39, R40, R41, R42, R43, R44, R45; folded at K3062, K3100, K3104, K3114, K3122, K3127.
Sources the entry names, read for the sections named: `registry.json`, `library.json`, `mock-acts.js` and `words.json` as on `tranche/T47` after PR #33's head was merged at this START (6f0d88d8d5; DEC-200–DEC-214, K3127); interface = `build/plan/draft-T47-interface.md`; way in = `build/plan/draft-T47-wayin.md`; B = `build/plan/draft-T47-L11-fold.md` §B; connect §3 = `build/plan/draft-T47-L6-connect.md` §3. The requirements bind; a draft only explains them.
BOB's notes for this job: Providers of the screen modules: merge early in the screen group; each screen job merges `tranche/T47` when BOB announces your merge.
Read your own code and tests whole where your reading set allows, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START, and those named in a merge ruling since (K3098–K3133); none is yours unless named in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 416 KB with your tests, within the 600 KB limit: read it all whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950). When you change a provided service, run the tests of the modules that use it (P11).
L11 merge order: wizard-scripts, op-grades, affordances, tasks, action-producers, notice-producers, queue, setup-words, instance-setup, op-declarations, admission, answer-envelope, store-door, signin-door, interface-shell, screens-entry, screens-wizards, screens-settings, screens-intake, screens-daily, screens-inquiry, screens-investigate, screens-publish, screens-action, control-plane, setup-page (its delete), installer, plane, journey-check last. A provider merges before its users; a job using an L11 job's new service merges `tranche/T47` into its branch when BOB announces that merge (a CHANGE); a job that uses no unmerged L11 job merges as soon as it is complete (K1965).

## B2 · CHANGE

K3143: the GUIDE contract you and screens-wizards meet at (your R31, its R2–R7), as SCREENS-WIZARDS #1 J2 states it and BOB rules: GUIDE `{words, parts?, ops, acts, render, marks, start, entered, pressed, ring}`; one guide instance for the page's life, `view = {ui, me, reachable, screen, subject}`; `render` → the dock panel (in place of the assistant's while non-empty, no close control); `marks` drawn under the path on every working screen each draw; `cs.wizard(script, version, o)` calls `start`; `entered` after each route change once the screen's reads settle; `pressed({op, screen})` on every act press, never a value; `ring` on Alt+Shift+W; `ops` and `acts` carried and checked as a screen's. Read its J2 on `job/T47/screens-wizards` (`build/jobs/T47/screens-wizards.md`) for the full text.

## B3 · ANSWER · re J1

K3144: 1. as read, and see R46's last sentence. 2. edge `interface-shell → signatures` added; drop the setup-page import (BOB drops the edge at your merge). 3. as read. Also new R46 on `tranche/T47`: the kit contract screens-entry and screens-settings need (`view.session`, `view.fragment`, `cs.signin`, `cs.signout`, `cs.signedOut`, `cs.save`, `cs.copy`, `cs.signer.publicLine`, public acts in the public and setup frames). Their J1s on `job/T47/screens-entry` and `job/T47/screens-settings` give the detail. Merge `tranche/T47`.

## B4 · CHANGE

K3145: new R47 on `tranche/T47`: `cs.save`, `cs.copy`, `cs.signout` each answer their own bound control (`{label}`); `cs.signer.sign([{label, bytes, namespace}])` → `{ok: true, signatures}` or `{ok: false, declined: true}`, `cs.signer.register({keep})` → `{ok: true, keyB64}`, the key-file control inside `sign`; `REF_SCREENS` gains `person`, `proceeding`, `standard` with cards; `ADMIN_ACTS` gains `personexpunge`. Merge `tranche/T47`.

## B5 · CHANGE

K3146: new R48 on `tranche/T47` (from JOURNEY-CHECK #1): the frame's root carries `data-screen="<id>"` of the registered screen drawn, none on the shell's own fallbacks; test with a control. Merge `tranche/T47`.

## B6 · CHANGE

K3147: new R49 on `tranche/T47`: `cs.image(op, params, {alt})` (fetched with the session's `Authorization`, drawn from a page-made object address), `cs.areas(image, {areas, label})` (rectangles drawn by pointer, touch and keyboard over it, answering pixel rectangles), and `cs.choice` driving the act it governs (one button following the choice). Also R46's `view.fragment` carries `grant` for `review-outside`. Merge `tranche/T47`.

## B7 · CHANGE

K3148: wizard-scripts (T47-47: the registry at f90b187c7b, 66 screens) and op-grades (T47-48) are merged into `tranche/T47`. Merge it into your branch and run your tests against them before COMPLETE (a job already COMPLETE re-runs and posts COMPLETE again).

## B8 · CHANGE

K3149: setup-words (T47-52, WORD_ROWS at 6f0d88d8d5) and instance-setup (T47-75: flat parts, grouplogoset/grouplanguages(set), the `grouplogo` route, `groupLogoAsset`) are merged into `tranche/T47`, with wizard-scripts and op-grades before them. Merge it and run your tests against them.

## B9 · CHANGE

K3149: new R50: `ADMIN_ACTS` completed (passwordresetlink, signerset, the group settings, profilesset, placewanted, officesseed, translationgrant/revert, securitytool*), and R11's phone hold covers every act `op-grades.phoneOf` answers false for. op-grades, wizard-scripts, setup-words and instance-setup are merged. Merge `tranche/T47`.

## B10 · CHANGE

K3150: R49's signatures, as SCREENS-PUBLISH #1 builds to them: `cs.image(op, params, {alt})` answers the image's HTML; `cs.areas(imageHtml, {id, areas, label})` answers the control's HTML, its rectangles read at the act by `cs.value(id)` as `[{left, top, width, height}]`; `cs.choice(id, labelKey, options, {acts: {<value>: op}})` makes one button follow the choice.
