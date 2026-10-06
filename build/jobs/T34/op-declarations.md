# op-declarations (T34)

**Status** · session_01VhQZpv5UDgJCR2CivgwuJZ · depth 2 · WORKING · handled B5

## J1 · QUESTION

My readings, on which I am building now (answer only where one is wrong):
1. **The `reasoned` table (K1792) is not in op-declarations.** It is affordances' `src/affordances/t33.mjs` (`dutyrevise: "reasoned"`, ...), with its codes in affordances' `t33.test.mjs`:123 and `t33-backing.test.mjs`:122. op-declarations holds no reason codes. I change nothing for it; it is affordances' (T34-75).
2. **`publishat` (R25) "in caseratify's act list":** `caseratify` is in no act list here, only both `SESSION_OPS` sets with `NEEDS` `publish`. So `publishat` sits beside it: spec `{classes: admin, member, probe; machineClasses: []; mutating}`, `NEEDS` `publish`, both sets, no `OP_STAMPS` entry. The control plane stamps it as it stamps `caseratify` (ratification reads its body).
3. **T34's other new ops are declared through `OP_FAMILIES`,** so `OP_STAMPS` (control-plane R53's one stamp interface) carries their stamps: `hypotheses` (+`notewrite`, `noteturn` member; `notes` read; `by` from the body); a `membership` family (R22: new kind `roster` = `hostingaccessset`'s spec, `NEEDS` null, `by` from the query; `door` and `public` kinds `classes: null`, in no session set, stamped nothing but `groupdescription`'s `viewer`; `courtnotice` stamped nothing); a `tasks` family (R23; `by` from the query); `credentials` (+R24's seven, `by` from the query); a `publication` family (R25's move, cancel and schedule; new kinds for `classes: admin, member, probe` with `machineClasses: []`); `instance-setup` (+R26, R28, R29); a `wizard-scripts` family (`startfrom`, `writinghelp`, `baseupdates`). Where the owner's map is not merged yet (tasks, instance-setup, wizard-scripts), I read the stamps from the query, as their existing ops do. A family stamps `viewer` on every session op, as R19 does, beside the `by` R22 and R24 name.
4. **R21:** the registry on `tranche/T34` marks 65 acts `function` (the plan says 69). 31 are already ops. 29 become aliases in one frozen table, `OP_ALIASES`, each with its op's spec, sets, `NEEDS` row, act lists and stamps: signerregisterown→signerregister, signerrevokeown→signerrevoke, declaretie→membertie, withdrawtie→membertiewithdraw, adoptversion→versionadopt, keepversion→versionkeep, strengthbarset→strengthbar, ruleanswer→rule, standingquestionset→standingset, standingquestionend→standingend, recordpersonfact→personfact, claimidentity→identityclaim, withdrawidentityclaim→identitywithdraw, expunge→personexpunge, createevent→eventcreate, addparticipant→participantadd, relate→eventrelate, recorddatedfact→datedfact, recordfact→moneyrecord, createset→moneysetcreate, include→moneysetinclude, exclude→moneysetexclude, reconcile→moneyreconcile, addworkbook→workbookadd, bind→workbookbind, recordcheck→workbooksecondcheck, recordline→linerecord, declare→dutydeclare, filingrecordsent→filingsent. **No op serves 5, so they get no spec (named back for the design stream):** `projectcreated` (membership's `projectCreated`, called in-process by promotion), `setpassword` (credentials, in-process only), `countask` (answers' internal count inside `ask`), `registerproceeding` (entities' `registerProceeding`, in no ops map) and `deadlinecompute` (an answers rule service, reached only as `op=rule` with `service=deadlinecompute`).

## J2 · REPORT

Findings in other modules (affordances), against their requirements:
1. **affordances R12 totality vs T34's new `NEEDS` rows.** The requirements give present-null or `contribute` `NEEDS` rows to ops affordances' R40–R44 do not grade. R22 gives them to membership's 10 administrator acts. R23 gives them to tasks' 5. R24 gives them to credentials' 7 group-key ops. R26, R28 and R15 give them to `placewanted`, `placewantedstate`, `memberlanguageset`, `memberlanguage`, `startfrom` and `baseupdates`. R21's 29 aliases carry their ops' rows. Once op-declarations merges, affordances' `unpublished` lists each gated op it does not name. Its `unranked` lists each new mutating op with no rung or absence ground. Unless T34-75 grades them, that totality goes red from my merge. affordances R42–R44 cover only `publishat`/`publishatmove`/`publishatcancel`/`publishschedule`, the notes and the two drafts.
2. The `reasoned` table (K1792) is affordances' (`src/affordances/t33.mjs`), not op-declarations'; see my QUESTION J2 (1).

## J3 · QUESTION

**Edges (your START's "add one only if your code imports that module"):** my tests import the ops maps of `membership`, `tasks`, `publication` and `ratification`. That is R6's totality test: every op the owner serves has a spec, and each stamp reaches the owner where it reads it. My requirements' Uses already name all four. Please add them to op-declarations' `uses` in `modules.json`. Until then `checks/architecture.mjs` reports 3 failures (4 once ratification's import lands). Each module is earlier than mine; `instance-setup` is not needed, because its ops are checked by name until its merge. If you would rather not add the edges, say so and I will drop those imports and check the four by the tables alone.
Also found (R6, membership's): `membershipOps` serves `projectclaimowner` (membership calls it inside `projectCreated`), which has no spec and is not in R6's store-internal list. My test names it as in-process. R6's list could name it, or membership could drop the arm.

## Completion (T34-58, T34-83, T34-90–T34-92)

**Entries applied.**
- **T34-58.** `hypotheses` gains `notewrite`/`noteturn` (member) and `notes` (read), with `by` from the body (K1807). `askusage`'s recorded decision names `calls` beside `usage` (K1805). R21: 29 aliases in the frozen exported `OP_ALIASES`, each its op in every table: the spec, both sets, the `NEEDS` row, every act list (`listed`) and `OP_STAMPS`. R22 adds a `membership` family with new kinds `roster`, `door`, `public` and `plainread`; `checkaddressees` and `projectclaimowner` get no spec (R6, K1864). R23 adds a `tasks` family. R24 adds the seven group-key ops to `credentials`. R20 and R6 now hold as amended. K1764's red (`t33.test.mjs` R19/R6) is cleared.
- **T34-83.** R25: `publishat` sits beside `caseratify` (`NEEDS` `publish`, both sets, no `OP_STAMPS` entry), and a `publication` family holds the move, the cancel and the schedule (new kinds `publishact` and `sessionread`). R26 and R28 extend `instance-setup` (new kind `sessionact`) and add a `wizard-scripts` family (`startfrom`). R27: `translationdraft` and `translationadopt` have no spec.
- **T34-90, T34-91.** R29: `groupdescriptiondraft` (instance-setup) and `writinghelp` (wizard-scripts) are `ownread` ops with `by` stamped too.
- **T34-92.** R15: `baseupdates` is declared.
- T34 ops of a public kind are in no session set, stamped nothing but their family's extras, with no `NEEDS` row.

**Not applied here.** K1792's `reasoned` table is affordances' (`src/affordances/t33.mjs`), not this module's (J1 (1), accepted K1863).

**For the design stream (R21; B2):** five registry functions have no op serving them, so they get no spec:
- `projectcreated`: membership, in process from promotion.
- `setpassword`: credentials, in process.
- `countask`: answers' count inside `ask`.
- `registerproceeding`: entities' method, in no ops map.
- `deadlinecompute`: an answers rule service, reached as `op=rule`.

The registry on the tranche marks 65 functions, not the plan's 69.

**Found in other modules.**
- **affordances (R12 totality; J2, forwarded to T34-75).** From my merge, control-plane's `affordances` totality test (`R2, R41`) lists as `unpublished` every new gated op affordances does not grade: R22's acts, R23, R24, `placewanted`, `placewantedstate`, `memberlanguage*`, `startfrom`, `baseupdates` and the 29 aliases. The ops R42–R44 grade drop out once affordances merges.
- **control-plane (T34-60, its R53–R57).** `r53-routes.test.mjs`:58, already red (K1807), now also drives T34's `OP_STAMPS` ops, such as `websiteinvite`, which control-plane does not route yet.
- **Unchanged reds.** `catalogue-end` R43 and `families` R22 (accepted red 9); affordances `t33-backing` ×2 and `t33`:135 (K1805, K1807); plane `store.test.mjs`:85 (accepted red 8).
- **Generated artifacts.** The plane bundle is stale (`src/op-declarations/index.mjs` changed).

**Edges added by BOB (K1864):** membership, tasks, publication, ratification (test imports).

**Deferred:** none.

**Tests and checks.**
- op-declarations: `ℹ pass 84`, `ℹ fail 0`.
- Users of op-declarations, mine against the tranche:
  - admission 19/0 (same).
  - control-plane 164/4 (tranche 165/3; the one new red is affordances' totality above).
  - affordances 189/3 (same).
  - plane 109/1 (same).
- `format: 129 modules, 128 requirements files; 0 failures`.
- `architecture: 11 product files, 57 relative imports (1 naming no tracked file, not judged); 0 failures`.
- `coverage: 1 modules, 29 of 29 live requirement ids named by a test; 0 failures`.
- `ownership: 5 files changed by op-declarations between tranche/T34 and HEAD; 0 failures`.

Size (session_01VhQZpv5UDgJCR2CivgwuJZ): test runs 16, module lines 3024

## J4 · COMPLETE

T34-58, T34-83, T34-90–T34-92 applied; R6, R15, R20–R29 met; K1764's red cleared. op-declarations 84/0; format, architecture, coverage (29/29), ownership 0 failures. One new red outside my module: control-plane's affordances totality (R2, R41), the gap J2 reported (affordances T34-75; control-plane T34-60 routes the new OP_STAMPS ops). Edges: membership, tasks, publication, ratification (K1864). The five unserved registry functions and every finding are in my record's Completion. Plane bundle stale.

## Completion after B5 (CHANGE, K1869 (2))

- Merged `tranche/T34` (wizard-scripts and tasks merged).
- **R15's test** (`t31.test.mjs`) now checks wizard-scripts' map: R15's fifteen beside its T34 family (`startfrom`, `baseupdates`), each specced and stamped. R15's requirement text names its ops and states no count, so it needs no re-wording.
- **R6's test** (`t33.test.mjs`) no longer lists the tasks ops or `startfrom`/`baseupdates` as served elsewhere; their owners serve them now. `writinghelp` stays named as served elsewhere: the door routes it itself and calls wizard-scripts' `writingHelp` (K1863 (7)), so it is control-plane's (T34-60). `groupdescriptiondraft` stays named as instance-setup's until that merge.

**Tests.**
- op-declarations: `ℹ pass 84`, `ℹ fail 0`.
- Users of op-declarations, mine against the current tranche:
  - admission 19/0 (same); wizard-scripts 62/0; tasks 95/0.
  - control-plane 162/6. `r53-routes.test.mjs`:58 (K1807) goes green. Two new reds:
    - `r53-routes.test.mjs`:75 drives the T34 `OP_STAMPS` ops, such as `websiteinvite`, which control-plane routes in T34-60.
    - `totality.test.mjs`:13 is the affordances totality, accepted by name at my merge (B4).
  - affordances 187/5 and plane 107/3, the tranche's own reds, unchanged.

**Checks.**
- `format: 129 modules, 128 requirements files; 0 failures`.
- `architecture: 11 product files, 57 relative imports (1 naming no tracked file, not judged); 0 failures`.
- `coverage: 1 modules, 29 of 29 live requirement ids named by a test; 0 failures`.
- `ownership: 6 files changed by op-declarations between tranche/T34 and HEAD; 0 failures`.

Size (session_01VhQZpv5UDgJCR2CivgwuJZ): test runs 22, module lines 3024

## J5 · COMPLETE

B5 done: merged tranche/T34; R15's and R6's tests read wizard-scripts' and tasks' merged maps (R15's text names its ops and states no count, so no re-wording). op-declarations 84/0; format, architecture, coverage 29/29, ownership 0 failures. Against the tranche: control-plane r53-routes:58 (K1807) green; new reds r53-routes:75 (T34 OP_STAMPS ops, control-plane T34-60) and totality:13 (accepted in B4). writinghelp is named as the door's own route (K1863 (7)). Details in my record.
