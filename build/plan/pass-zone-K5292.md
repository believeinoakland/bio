# The team-zone pass (plan item 144 (1); K5292; mechanics §5.10)

**Status** · Ready; runs once no job is running. Written by BOB #311.

## The rule
Every product site that takes the team's time zone from the profiles alone (`combine(<profiles>).time_zone`, the active view's `time_zone`, or `zoneOf(actions.place())`) takes it instead as
`governingZone(getSetting("jurisdiction_profiles"), getSetting("team_time_zone"))`
(`jurisdictions` R98, exported; `team_time_zone` written by `local-facts` R22), through the module's own settings read and its own import of `jurisdictions` (add `jurisdictions` to its `uses` in `build/modules.json` where absent; the module must come after `jurisdictions` in the order, else it is a judgment). A site that already reads `@team/time_zone` through `local-facts` is left alone.

## The sites (from `build/plan/walk-T51-alpha/causes-rewalk.md` §3, re-listed by grep before the pass)
`actions/index.mjs:252`, `:462` (`place()`'s zone), `:2995`; `action-plans/index.mjs:1708`; `action-producers/index.mjs:181`; `machinery-producers/index.mjs:131`; `events/index.mjs:249`; `duties/index.mjs:212`; `following/index.mjs:218`; `investigation/index.mjs:240`; `steps/index.mjs:339`; `inquiry/index.mjs:1317`; `standards/index.mjs:266`; `money/index.mjs:276`; `entities/index.mjs:276`; `monitoring/index.mjs:668`; `lines/index.mjs:194`; `scheduler/index.mjs:196`; `setup.mjs:853`, `:1822`, `:2123`, `:2892`; `screens-investigate/timeline.mjs:116` (a screen: it reads `factstatus @team/time_zone` as `find-in.mjs:18` does; a judgment if it has no settings read).

## Tests (in the pass)
- `action-plans`: the red test of causes-rewalk §3 and §4 at the walker's case (no profile, the team zone stated through `local-facts.factConfirm`): `date_past` determined, `date_before_phase` with `start` set; seen red before the re-point, green after.
- Every touched module's suite, then `module-tests.mjs` whole, `checks/run.mjs`, the artifacts regenerated (manifest order). No red accepted.
