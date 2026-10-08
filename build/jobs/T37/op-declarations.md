# op-declarations (T37)

**Status** · session_01SsLYQXDrWuDz7QtHaT5dnd · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings, each my best, applied now; the job carries on.
(1) R21 (T37) "its `function` acts are the functions it then names": PR #14's registry also no longer names `claimidentity` (DEC-182 (2): "The same-person claim is one op, `identityclaim`"; the person screen's button points at `identityclaim`, declared). An alias exists only for a registry function its owner serves under another op, so I read the withdrawn alias as gone too: `OP_ALIASES` drops `claimidentity` (21 aliases; `OPS`, both session sets, `NEEDS`, `OP_STAMPS` lose it; `ACT_HELP_ABSENT`'s alias ground drops it). Consequence for later modules: `op-grades`' `t34.mjs`:83 copy of the alias table still names `claimidentity` (op-grades merges before me; its tests may compare against my table), and control-plane R55 routes no `claimidentity`. If you read R21 as keeping it, I restore it in one line.
(2) R27: the library file at `e08cd35ecb` marks nine acts owed, not seven: also `aikeepaway` (DEC-172) and `obscuremark` (DEC-180). Both are declared under their own names (R33, R38). I read R27's "all seven ... declared" as met with the two later marks declared too, and the test states the nine.

## Completion (T37-31)

**Reading.** Read whole myself: `build/requirements/op-declarations.md`; `bio-plane/src/op-declarations/index.mjs` lines 1–1050 (families, kinds, stamps, aliases, `OPS` through the T21 rows) and the sections this entry changes (`SESSION_OPS`, `NEEDS` construction, `ACT_GATE`, `UNATTENDED_BY_DECISION`'s head, `ACT_HELP_ABSENT`, exports); `t34.test.mjs` whole, the R34/R27 parts of `t36.test.mjs`, the totality and family parts of `t33.test.mjs`, `t35.test.mjs`:190–230; the registry, `library.json` and `mock-acts.js` at `e08cd35ecb` (byte-identical in the tree); `instance-setup` R67–R74, `case-carriage` Purpose, R9–R11, R13 and its `caseCarriageOps`, `credentials` R3, R43 and its `setpassword` arm, `affordances` R48 and `act-help.mjs`'s head; DEC-182; K2134, K2159, K2171, K2175, K2200, K2201. The rest of `index.mjs` (the T22–T31 rows and act lists, lines 1050–1900 and the `NEEDS` rows) I did not change and did not read line by line; no worker summary was made. Nothing my change relies on lies there: every new op is a family op, and the families feed `OPS`, both session sets, `NEEDS` and `OP_STAMPS` at the four spread sites (lines 1276, 2090, 2160, 3042), which I read.

**Entries applied.** T37-31 (N708; N701, its share; N669; N757; N776, DEC-182 (4), (5)):
- R35, R37: `instance-setup`'s family gains `translationdraft`, `translationadopt`, `translationconfirm`, `translationmark` (`own`), `translationgrant`, `translationrevert` (`admin`), `translations`, `interfacewords` (`ownread`): session only, `NEEDS` null, `by` (query) and `viewer` stamped. `translationdraftrecord` has no spec (R6).
- R36, R39: `credentials`' family gains `subscriptionsignin` and `setpassword` (`own`); `setpassword` also stamps `session`, `source`, `country`. The comment naming `setpassword` a function served in process is gone.
- R38: a new `case-carriage` family: `obscuremark` (`member`, `contribute`), `photomarks` (`ownread`), `by` from the query, as `caseCarriageOps` reads it.
- R21: registry read at PR #14; the five T34 unserved functions are no longer functions; `claimidentity` leaves `OP_ALIASES` (J1 (1), K2239); 21 aliases.
- R27: all seven library owed acts declared; the library at `e08cd35ecb` marks nine (with `aikeepaway`, `obscuremark`), all declared (J1 (2), K2239).
- R34: `ACT_HELP_ABSENT` adds `photomarks`, `translations`, `interfacewords` (read) and `translationmark` (unexplained), and drops `clockpropose` (B2) and `claimidentity`.
- Tests: new `t37.test.mjs` (R35–R39 each named in a title, R21, R27, R34 for T37); `t33`, `t34`, `t35`, `t36` brought to the amended R21/R27 (their T35/T36 "no spec" assertions retired), `case-carriage` read for R6's totality, `setpassword` out of credentials' in-process list, the T37 ops another job serves named in `SERVED_ELSEWHERE`.

**For BOB's one QUESTION to UX-DESIGN (R34, DEC-182 (5)).** No op that a registry screen offers is without a text: none of the 232 ops in `ACT_HELP_ABSENT.unexplained` is an act on any screen of the PR #14 registry. Eleven of them are named in `mock-kit.js`'s `WRITE_REFUSED` weight set, which is not a screen control: `actionrisktier`, `contradictionresolve`, `inquirydivide`, `inquiryground`, `reopen`, `versionaccept`, `versionconsider`, `versioncurrent`, `versionhide`, `versionreject`, `versionrevert`. `translationmark` (instance-setup R73) is on no registry screen and has no design text. The full list is `ACT_HELP_ABSENT.unexplained`.

**Reds, each named, none mine to clear.**
- Mine, `t36.test.mjs` R34 partition: red until `affordances` re-generates `ACT_HELP` with the eight T37 owed texts under their op names (B2: after my merge). A simulated re-generation (R48's T37 reading over the current `ACT_HELP`) leaves the partition exact both ways: no op with neither, none with both, nothing absent outside the member set.
- `control-plane` `r53-routes.test.mjs` R53: `setpassword for founder: source`. The control plane stamps `source` and `country` on `setpassword` in T37-33.
- `control-plane` `totality.test.mjs` R2/R41: `stale: ['claimidentity']`. Clears when op-grades drops `claimidentity` from its alias copy (B3).
- R6 against the door's route map: `subscriptionsignin`, `setpassword` (stamps) and the translation ops are routed by T37-33. `instance-setup` has no ops map; the eight translation ops are named in `t33`'s `SERVED_ELSEWHERE` (`instance-setup (T37-30)`).
- Other users of this module: `admission` 34/0; `op-grades` 0 fail; `plane` 6 fail and `affordances` 29 fail, each the same tests by name before and after my change (inherited).

**Found in other modules.** `affordances`' `ACT_HELP` must hold the eight T37 owed texts under their op names (B2 says it will). `op-grades`' `t34.mjs`:83 alias copy names `claimidentity` (B3). `wizard-scripts`' `screen-registry.mjs`:34 still carries PR #13's person screen with `claimidentity` (its T37 re-generation, if owed, is that job's).

**Deferred.** None.

**P6.** `index.mjs` 3,275 lines (3,246 at START).

**Tests and checks.**
- `node --test bio-plane/test/m/op-declarations/*.test.mjs`: 113 pass, 1 fail (the R34 partition above).
- `format`: 136 modules, 0 failures. `architecture`: 0 failures. `coverage`: 39 of 39 live requirement ids named by a test, 0 failures. `ownership`: 7 files changed by op-declarations between tranche/T37 and HEAD; 0 failures.

Size (session_01SsLYQXDrWuDz7QtHaT5dnd): test runs 14, module lines 3275
