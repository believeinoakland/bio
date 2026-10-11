# op-declarations (T43)

**Status** · session_0126JHqriJqLtHSVj8Cj7oxW · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Affordances' T43-17 (merging before me in L11) adds `ACT_HELP` texts for `pagetranscribe` and `transcribe`. My `ACT_HELP_ABSENT` names both under the last ground (R47: "until affordances' `ACT_HELP` holds its text"), so once T43-17 merges, R34's partition (`t36.test.mjs`:292, "no op is both") and `t42.test.mjs`:128 ("pagetranscribe has no text in ACT_HELP") go red.

Best reading (I proceed on it unless you say otherwise): R34 and R47 already require the move, so when affordances is merged into `tranche/T43` I merge the tranche into my branch, take `pagetranscribe` and `transcribe` out of `ACT_HELP_ABSENT` (a two-name data change in my own `index.mjs`, beyond "tests only" but required by R34/R47 as written), and re-pin `t42`:128 to "explained, named under no ground". Until then I do the entry's re-pin of `t34`, `t37`, `t38` against the tranche as it stands, and COMPLETE only after affordances has merged so my checks run against its `ACT_HELP`. If you would rather I COMPLETE now and take this by a later `CHANGE`, say so.

## J2 · COMPLETE

**Entries applied.**
- T43-18 (K2704; DEC-189): I re-pinned `t34`, `t37` and `t38` to the registry, library and `mock-acts.js` under `docs/development/ux-substrate/screens/` as they stand on `tranche/T43`. The tests read those files directly; nothing is copied by hand. All eight of rule 4 (10)'s reds pass: `t34`:68, 145, 307; `t37`:105, 177, 218; `t38`:76, 87.
- No test lost an assertion. Each "owed" check became a stricter "re-pointed" check: the registry or library names the served op as `declared` or `function`, it is no longer owed, and the op is declared with no alias. Each `owed_<op>` text check became an `<op>` check (`t38` also checks that `owed_obscuremarkwithdraw` is gone). Every former set-equality check stands: the owed set is {subscriptionsignin, projectaikeepaway, pagetranscribe, infolevelset}, the library's owed set is {subscriptionsignin}, and the count of re-pointed acts is 37.
- K2725, by B3's CHANGE: I merged `tranche/T43` (affordances' T43-17 is in it). `pagetranscribe` and `transcribe` are out of `ACT_HELP_ABSENT`'s last ground, and `t42`:128 is re-pinned: both are explained in `ACT_HELP` and named under no ground. This is a two-name data change in `index.mjs`, which R34 and R47 require.

**R6.** No re-pin shows an op the registry names that no spec declares. Every `declared` and `function` act has a spec, and none is an alias. Of the owed acts, three are declared ops read as served (R21): `subscriptionsignin` (R36), `projectaikeepaway` (R41) and `pagetranscribe` (R47). `infolevelset` alone has no spec, as before.

**Deferred.** None.

**Found in other modules.** None. The helper digests found nothing in the used modules' Public parts that bears on the entry beyond what is above.

**Reading set (mechanics §17).** I read my requirements, my code (`index.mjs`, 3,428 lines) and all 16 test files whole. Three helper agents in my session read the 51 used modules' Public parts in full (1,096 KB, every line) and gave me digests citing file and requirement, with my entry and affordances' T43-17 and plane's T43-15 as context.

**Tests.**
- op-declarations: 133 tests, 133 pass, 0 fail (after the merge).
- My users, run after B3's merge:
  - admission: 43 of 43 pass.
  - control-plane: 222 of 223 pass. The one red is `envelope.test.mjs`:391, which rule 4 (12) already accepts (until T43-23).
  - plane, `test/m/plane/`: 184 of 184 pass.
  - plane, `test/system/migrate-released.test.mjs`: 1 of 1 pass. It ran on the pre-merge head (bc2f6638d3); the only change since is the two names removed from `ACT_HELP_ABSENT`, which no migration reads.
- Before the merge, admission had 5 reds at `harness.mjs`:189/190, which rule 4 (12) accepts. The merged tranche clears them.

**Checks** (from civicos-process, after the last commit): format, 147 modules, 0 failures; architecture, 0 failures; coverage, 47 of 47 live ids named, 0 failures; ownership, 6 files, 0 failures.

Size (session_0126JHqriJqLtHSVj8Cj7oxW): test runs 10, module lines 3428
