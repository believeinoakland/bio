# inquiry (T18)

**Status** · session_016DJXNscE3zEJMBXUbRNAPx · depth 2 · RUNNING until 2026-09-30T22:45:19Z (four convert agents (16 old suites) and the module tests of inquiry's users) · handled B3

## J1 · QUESTION

N405, the migrated surfaced_in arm: as registered it cannot reach the answer. retrieval R56 applies decorations in the modules' total order and merges them later-over-earlier (`{...acc, ...v}`, retrieval/index.mjs:449). ai-runs (after inquiry in MODULE_ORDER) answers `surfaced_in` for EVERY inquiry: `{recorded:false, stated:"not recorded", ...}` when it holds no surfacing row (its R27). legacy-store's arm worked only because legacy-store is last. So an inquiry registration's `surfaced_in: {migrated...}` is always overwritten, and the migrated question would read "not recorded" (the rec173-migration-replay convert's arm fails).

ai-runs' own requirements already name the seam the other way: its Uses (ai-runs.md:98) "inquiry: the migration-replay arm of surfaced_in (R27; map §5.8)", and R27's code comment says the arm is inquiry's.

My best reading, which I am building: inquiry offers the arm as a read, `migratedSurfacing(id)` (the object legacy-store's #surfacedIn answers, or null; never throws; not gated, for in-process callers), AND registers its R56 decoration as N405 says (so it holds when nothing later answers the key); legacy-store's registration and #surfacedIn go (§12.2). For the answer to be right end to end, ai-runs' `surfacedIn` answers inquiry's `migratedSurfacing(id)` when it holds no surfacing row, else "not recorded" (its R27, ai-runs' job this layer: a CHANGE to AI-RUNS #5). Alternative: retrieval's merge keeps an earlier module's key (retrieval is closed). Also: inquiry.md has no R for the arm; I propose a new R49 (the read and the decoration), BOB's wording. Say if you want it otherwise.

## J2 · QUESTION

R49 as written (K674): two points, neither blocking.
(1) The answer's shape. R49 says `{migrated: true, …}`. The surfacing the migration replay records, as legacy-store's #surfacedIn answered it and the rec173-migration-replay convert reads it, is `{recorded: false, stated: "not recorded (migrated from the Drive era)", run: null, lens: null, migrated: {capture, promotion, at}}`: `migrated` is the replay's record (truthy), not the literal true. My best reading, built and tested: that shape, unchanged ("as the migration replay recorded it"). If `migrated: true` is meant literally, say so and where the capture/promotion/at go.
(2) Placement: R49 was inserted between R48's line and R48's own two bullets (contradictionLink, inquiryOfCandidate) and its closing sentence, so in inquiry.md those now read as R49's. R49 belongs after them (or under its own heading).
Carrying on with the converts.

## J3 · REPORT

Another module's test goes red with N136 (R36 as worded): conformance's `test/m/conformance/reads.test.mjs`:109 simulates "a finding superseded" by writing `UPDATE bundles SET inquiry_superseded_by=...` directly. That column is now inquiry's own table's (`inquiry_bundle_facts`, R36; the store no longer adds it to `bundles`), so conformance R10's arm misses the cause `finding:INQ-2026-0300-deferred:superseded` (1 fail; conformance's product code is unaffected: it reads the index through `inquiry.supersededBy`, via consequences). Fix, conformance's (layer 9): supersede through a real division (`inquiry.divide`), or write the owner's table `inquiry_bundle_facts(bundle_id, inquiry_superseded_by)` in place of the bundles column. Every other module test of inquiry's users passes: test/m less inquiry 3540 pass, 2 fail (this one and capture R36, K658, as at layer 5's close).
Also, for the close: my src changes stale the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, not_product's, §14); I do not regenerate it.

## J4 · REPORT

A flaw in my own module I cannot fix in this job, for a ruling or a `not yet met` mark: R11 says the write's check applies "R2–R9 over the document", but `check()` judges R4–R9 only (checkInquiryBasis, the supersession and division arms, the cycle guard, R47). R2 and R3, the entry requirements (C-2.8's inquiry extension: surfaced_by, a disposition's reason, a conclusion's leg and falsifier, a finding's bytes naming no case (CASE-5b), divided's block), are never judged at the write: a promotion of an inquiry carrying `case_id`/`case_project`/`bias_acknowledgement`, or `surfaced_by: robot`, lands ok. The old suites pinned that acceptance as known (caseproduction 1026–1028, 1044–1045, 1064–1067 "op=promote ACCEPTS … reported rather than fixed"; multifinding 824, 1024). They are judged by the case gate at op=ratify (ratification's) and by `checkInquiryEntry`/`checkEntry` (tested, R2, R3). Why not fixed here: the entry arm is the catalogue's `checkInquiryExtension` (bio-checks.mjs:1884), not exported, and reachable only through async `checkBundle`, while a promotion step's check is synchronous in the promotion's transaction; exporting it is a legacy-checks addition §12.2 does not allow, and moving it is inquiry's catalogue share (the deferral table: "b, c", T19). Proposed: mark R11's R2/R3 arm `not yet met` until that share moves (T19), when the arm is inquiry's own and sync. Enforcing it at the write will refuse any existing store document or caller that today lands non-conformant bytes; that is worth a sweep at that time.
