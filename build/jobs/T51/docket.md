# docket (T51)

**Status** · session_01CnYEEbvuMRb9yWAomBsnUW · depth 2 · WORKING · handled B3

## Completion (T51-162, R8)

**Entries applied**
- R30: `docketOf` answers each record entry's pressure mark as `{kind, note, at, by}`, `by` the marking member as `{member, handle}` (handle from `membership.memberFacts`, null when she holds none), null when the mark has no author. R27's `docketPressureMarks` and `docketPressureOf` are unchanged and name no member. Test and controls under `R30` in `reads.test.mjs`; `file.test.mjs` R2 and the R3 test updated to the new shape.
- Words (K3949): the three literal sentences in `checks.mjs` (`DOCKET_WITHDRAWAL_FINAL`, `DOCKET_TAKE_BACK_FINAL`, `DOCKET_ORDER_UNREADABLE`) are `localize` calls (`docket.checks.withdrawal_final`, `.take_back_final`, `.order_unreadable`), single string literals as the build requires. The plain finding at `index.mjs:575` is `localize("docket.index.no_team_slug_recorded", …)`. `words.test.mjs` compares with `word("refusal.DOCKET_NO_GROUP_SLUG")` and `word("refusal.DOCKET_STALE")` instead of copies. The hand-list in `reads.test.mjs` is the ops map's own keys (a count and a handler each), not a literal list.

**Deferred:** none.

**Found in other modules:** `action-holds` tests `R2 an administrator neither invited nor joined may name a hidden project in a hold (D54)` and `R4 doorbell asks this module's reader…` fail on `tranche/T51` with and without my change (inherited, not docket's).

**Ran:** `node --test bio-plane/test/m/docket/`: 80 pass, 0 fail. Users' tests (`public-read/docket-real`, `plane/docket`, `network-notices`, `action-holds`): 120 pass, 2 fail (the inherited two). Checks: format 0 failures; architecture 14 files, 0 failures; coverage 30 of 30 ids, 0 failures; ownership 0 failures; words (docket) 0 failures, inline 0, plain 0, testcopy 0, handlist 0; `setup-words/build.mjs --check`: only the expected stale-rows note, no refusal naming docket. (`checks/run.mjs` over the whole product shows other modules' words findings, none docket's.)

Size (session_01LB8wrfssMdqb1sPQdkkUPT): test runs 8, module lines 1635

## J1 · COMPLETE

T51-162 applied: R30 (docketOf's pressure mark carries by {member, handle}; R27 reads unchanged), 4 words findings localized, test copies and the hand-list removed. Docket tests 80 pass; format, architecture, coverage, ownership, words 0 failures. Two action-holds tests fail with and without my change (inherited). Details in the record.

## Completion (fix round 5, E9, K4557, K4558: DOCKET #11, session_01SMUewbpPXf2emYuG2aQvxY)

**Root cause.** `docketPressure` (`docket/index.mjs:525`) asked sight only (`membership.sight(...) === "full"`, :535) and no participation: an invited member, who sees the project in full, marked a record entry freely. `docketFile` asked participation (:386 before) but answered the module's own `DOCKET_NOT_A_PARTICIPANT`, a second code for the condition membership's `PROJECT_ACT_NOT_A_PARTICIPANT` already states (K231), whose held words say to join.

**Why the tests missed it.** No docket test acted as an invited member on `docketpressure`: the R2 tests mark as `bob` (joined) and the refusals tested were the machine, an unseen entry and the form. `docketfile`'s R1 test did act as the invited `carol`, but pinned the module's own code, so the wrong code was asserted as right. **Gap fixed:** new tests act as the invited member through the real entry path (`docketOps`, the control plane's stamps), for both ops.

**What changed (file:line).**
- `docket/index.mjs:538` `docketPressure`: after sight (and the machine and absent-entry answers), before `DOCKET_PRESSURE_MARKED` and the form checks, `membership.projectAuthority(project, author, "joined", "docketpressure")`; its refusal is relayed as it answers (code, check, translation, `act`). Nothing written.
- `docket/index.mjs:387` `#filerRefusal` (docketfile): the own-code refusal is replaced by `membership.projectAuthority(project, author, "joined", "docketfile")`, relayed. Position in R1's order unchanged (after sight, before R28's counsel-matter check and the form checks).
- `docket/checks.mjs`: row C-129.2 `DOCKET_NOT_A_PARTICIPANT` stays (no longer answered; its number keeps the family contiguous; R22's test lists it): BOB retires it with the requirements.
- `docket/index.mjs:748` `docketPrepare` (own-module flaw, found by declaring it, see below): a prepare naming no shelf is answered the kind's own shelf (`reactions` for a `reaction`, else `listed`); a named wrong shelf is still `DOCKET_WRONG_SHELF`. Before: the screens' own call (`screens-publish/docket.mjs:44,185`: case, entry, kind, no shelf) was refused `DOCKET_WRONG_SHELF` ("a response goes on listed"), seen by a probe on the real module; the screens' tests stub the plane, so it never showed.
- `docket/index.mjs:1333` `DECLARED_OPS` (K4208, "declare every census op you own"): `docketpressure` and `docketprepare` added (`docketfile`, `docketpost` already declared); each agrees with its hand rows (weight `undetermined` with the hand `case-directed:` sentence; `read` with its `read:` sentence).

**Failing-first, red then green.** Red (before the change, `file.test.mjs`): `R2 K4557 an invited member who has not joined cannot mark…` (`actual: true, expected: false`: carol's mark was accepted), `R1 K4557 docketfile by an invited member answers membership's code…` (`actual: 'DOCKET_NOT_A_PARTICIPANT', expected: 'PROJECT_ACT_NOT_A_PARTICIPANT'`), and the existing R1/R11 assertions re-pointed to membership's code (same actual/expected). Green after: docket suite 87 pass, 0 fail. The shelf test (`place.test.mjs`, `R4 K4557 a prepare that names no shelf…`) was red by the probe above (`DOCKET_WRONG_SHELF`), green after. Controls: a joined member marks and files; an invited member who then joins (and one `leaving`) marks and files; an unseen member is answered `NO_SUCH_*` before the join test (sight first); an absent entry is answered before it; nothing is written by any refusal (`w.snapshot()` identical). New declared-ops tests: `docketpressure`, `docketprepare` (`declared-ops.test.mjs`).

**Readers of the old code.** `grep -rn DOCKET_NOT_A_PARTICIPANT bio-plane`: no screen or other module reads it (only the generated `rows.mjs`, the bundles, the words rows, and docket's own tests, re-pointed). Nothing for BOB to place in a screen on this account. `screens-publish/docket.mjs` draws refusals by their translation; membership's held sentence, `refusal.PROJECT_ACT_NOT_A_PARTICIPANT`, says to join. No new word row, no `localize`.

**Requirement lines I propose (BOB writes `build/requirements/`).**
- R1, third refusal: "`author` not a joined participant of the project (`membership.projectAuthority`'s "joined", its R55) is `PROJECT_ACT_NOT_A_PARTICIPANT`, membership's row and words, relayed (K4557, K231); `DOCKET_NOT_A_PARTICIPANT` (C-129.2) is no longer answered". R28's "after R1's `DOCKET_NOT_A_PARTICIPANT`" reads "after R1's not-joined refusal".
- R2: refusals in order, after `NO_SUCH_DOCKET_ENTRY`: "a member who has not joined the entry's project is `PROJECT_ACT_NOT_A_PARTICIPANT` (membership's, relayed; K4557: a mark is a weighty act of the project), before `DOCKET_PRESSURE_MARKED`". R27's plane reads still name no member.
- R4: "`shelf` may be omitted: the kind's own (`reactions` for a `reaction`, else `listed`) is then used; naming any other is `DOCKET_WRONG_SHELF`".
- R31: "`docketfile`, `docketpost`, `docketpressure`, `docketprepare`".
- Uses, `membership`: add `projectAuthority` (its R55).

**Deferred:** none. **Found in other modules (REPORT):** none caused by this job. Inherited, failing with and without my change on `tranche/T51` @ 7b31d212c2: `plane/release.test.mjs` R24 (screen title/purpose words). Flaky, passing alone on and off my branch: `control-plane/r117-held.test.mjs` R117 (acquire) (timing: the held read's call count) and `screens-intake/t51-fix5.test.mjs` R31 (E8) under parallel load.

**Ran.** `node --test --test-force-exit bio-plane/test/m/docket/`: 87 tests, 87 pass, 0 fail. Users, as `build/plan/impact.mjs origin/tranche/T51 HEAD` names them (DECLARED_OPS is a shared table, so 53 modules, 931 test files, run in two streams): 7,598 tests, 7,593 pass, 3 fail (the three above; none touches docket). Checks from the process repository: format 0 failures; architecture 15 files, 0 failures; coverage 31 of 31 ids, 0 failures; ownership 0 failures (8 files); `checks/run.mjs` over the product: format, architecture, coverage 0 failures, words `inline 0, plain 0, testcopy 0, missingkey 0, handlist 0; 0 failures`; `setup-words/build.mjs --check`: only the expected stale-rows note (docket.declared.docketpressure, .docketprepare are new keys; BOB regenerates), no refusal naming docket. Merged `tranche/T51` @ 7e8b1457a8 (no change to docket, membership or my requirements).

Size (session_01SMUewbpPXf2emYuG2aQvxY): test runs 9, module lines 1657

## J2 · COMPLETE

K4557 (E9) applied in docket: docketpressure asks membership.projectAuthority 'joined' after sight, before any write (docket/index.mjs:538); docketfile answers membership's PROJECT_ACT_NOT_A_PARTICIPANT (:387), one condition one code (K231). Failing-first through the ops map as the invited member: red (mark accepted; old code answered), green after; controls: joined, joining, leaving, unseen, absent entry, nothing written. Also: declared docketpressure and docketprepare (K4208); docketprepare now answers the kind's shelf when none is named (the screens' own call, screens-publish/docket.mjs:44,185, was refused DOCKET_WRONG_SHELF; own-module flaw, requirement line proposed in my record). Docket suite 87/87; users (53 modules, 931 files): 7593/7598, the 3 failures not docket's (R24 plane/release inherited; two flaky, pass alone). Checks 0 failures. No screen reads the old code. Requirement lines to write (R1, R2, R4, R28 wording, R31, Uses) and Size line are in build/jobs/T51/docket.md.
