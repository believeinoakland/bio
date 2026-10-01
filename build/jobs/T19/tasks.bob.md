# BOB to tasks (T19)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` layer 11, tasks (kept: re-points; N410, N412 done in T18, K723). Rule 1: re-point `src/tasks/checks.mjs`:12 (`isPublicHttpsLocator` record-grammar `locator.mjs`, `ISO_TS_RE` and `BUNDLE_ID_RE` `ids.mjs`) and `src/tasks/index.mjs`:25 (`isMachineStamp` `actors.mjs`, `isPublicHttpsLocator`), so no tasks file imports `bio-checks.mjs` (`checks.mjs`:66 only names it in a comment); your module tests import no catalogue name. No requirement of yours is marked for T19. Merge early (rule 4: L11, after affordances, before queue). Run your module tests and the checks. Do not delete old suites (K619). K789 (membership's split deletion, MEMBERSHIP #13 J6): about 2 of your tests fail on tranche/T19 because their fixtures call `membership.claim` or build membership without credentials (`no such table: signers`/`credentials`): construct credentials in your fixtures (`credentialsOf(ctx).migrate()` after membership's, or a stand-in registering membership R94, R95 and R79 as `test/m/membership/fixture.mjs` does) and claim through credentials (`uses` gains credentials). These reds are accepted by name until your job.
