# inquiry (T18)

**Status** · session_016DJXNscE3zEJMBXUbRNAPx · depth 2 · WORKING · handled B2

## J1 · QUESTION

N405, the migrated surfaced_in arm: as registered it cannot reach the answer. retrieval R56 applies decorations in the modules' total order and merges them later-over-earlier (`{...acc, ...v}`, retrieval/index.mjs:449). ai-runs (after inquiry in MODULE_ORDER) answers `surfaced_in` for EVERY inquiry: `{recorded:false, stated:"not recorded", ...}` when it holds no surfacing row (its R27). legacy-store's arm worked only because legacy-store is last. So an inquiry registration's `surfaced_in: {migrated...}` is always overwritten, and the migrated question would read "not recorded" (the rec173-migration-replay convert's arm fails).

ai-runs' own requirements already name the seam the other way: its Uses (ai-runs.md:98) "inquiry: the migration-replay arm of surfaced_in (R27; map §5.8)", and R27's code comment says the arm is inquiry's.

My best reading, which I am building: inquiry offers the arm as a read, `migratedSurfacing(id)` (the object legacy-store's #surfacedIn answers, or null; never throws; not gated, for in-process callers), AND registers its R56 decoration as N405 says (so it holds when nothing later answers the key); legacy-store's registration and #surfacedIn go (§12.2). For the answer to be right end to end, ai-runs' `surfacedIn` answers inquiry's `migratedSurfacing(id)` when it holds no surfacing row, else "not recorded" (its R27, ai-runs' job this layer: a CHANGE to AI-RUNS #5). Alternative: retrieval's merge keeps an earlier module's key (retrieval is closed). Also: inquiry.md has no R for the arm; I propose a new R49 (the read and the decoration), BOB's wording. Say if you want it otherwise.

## J2 · QUESTION

R49 as written (K674): two points, neither blocking.
(1) The answer's shape. R49 says `{migrated: true, …}`. The surfacing the migration replay records, as legacy-store's #surfacedIn answered it and the rec173-migration-replay convert reads it, is `{recorded: false, stated: "not recorded (migrated from the Drive era)", run: null, lens: null, migrated: {capture, promotion, at}}`: `migrated` is the replay's record (truthy), not the literal true. My best reading, built and tested: that shape, unchanged ("as the migration replay recorded it"). If `migrated: true` is meant literally, say so and where the capture/promotion/at go.
(2) Placement: R49 was inserted between R48's line and R48's own two bullets (contradictionLink, inquiryOfCandidate) and its closing sentence, so in inquiry.md those now read as R49's. R49 belongs after them (or under its own heading).
Carrying on with the converts.
