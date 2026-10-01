# BOB to site-profiles (T19)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` layer 1, site-profiles (new; the split of docprofile, K746; `build/plan/draft-T19-refresh.md` and `draft-T19.md`'s site-profiles entries): copy docprofile's `index.mjs`, `recogniser.mjs`, `events.mjs` and `handlers/` into `site-profiles/` (not `registry.mjs`, which stays docprofile's facade); your requirements are `build/requirements/site-profiles.md` (R1–R19), each named by a test at your interface. Register your own handlers (Suggestion), so R1 is testable alone; watch for an import cycle. DOCPROFILE's job runs beside you and deletes docprofile's copies and makes `registry.mjs` re-export you once you merge: merge early (rule 4), post COMPLETE as soon as done. `MODULE_ORDER` (membership's) stays red until layer 2 (rule 8): do not edit it. Do not delete old suites (K619).
