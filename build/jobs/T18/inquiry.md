# inquiry (T18)

**Status** · session_016DJXNscE3zEJMBXUbRNAPx · depth 2 · COMPLETE · handled B3

## Completion (INQUIRY #7)

**Entries applied.**
- **N405** (K593, K674, K677): R49. `migratedSurfacing(id)` answers the migration replay's surfacing (the shape R49 states) or null, never throws, ungated. It is registered as inquiry's R56 decoration of `surfaced_in` at creation. legacy-store's registration and `#surfacedIn` are deleted from `store.mjs` (§12.2, a pure removal). ai-runs R27 answering it is AI-RUNS #5's (J1, B2).
- **Grammar face with the registered grammars:** `checkInquiryEntry(md, {grammars})` passes `checkBundle`'s own option. The instance's `checkEntry(md, opts)` passes `record.grammars()` as promotion's gate does (its R27). A grammar that throws is one error naming its module. An unreadable registration list is an error, never read as none. After T19's layer 1, capture's C-2.7 catalogue copy can go.
- **N136** (R36, R40 as worded, K649 (6)):
  - `inquiry_basis_count` and `inquiry_superseded_by` are now held in inquiry's own table `inquiry_bundle_facts` (keyed by bundle_id, one row per bundle, declared to purge).
  - The migration moves a pre-T18 store's values once, idempotently. Later writes win, and the columns are left inert on such a store's `bundles` (dropping record-core's column is not this module's).
  - The count is registered with retrieval as `legs`' relation (R62). `store.mjs`'s two ADDITIVE_COLUMNS rows are gone.
  - `inquiry_subject_entity` stays on `bundles` (R40).
- **N242's share** (`dispose`/`#dispose`): already met by T10's N183 (C-106.1's `where` names `#dispose > is-dispose-shared`). The DEC-49 guard, run once on this job's tree, judges `#dispose > is-dispose-inquiries` and `is-dispose-shared` with no inquiry failure.
- **Converts** (16 suites, inquiry's shares by their `build/jobs/T17/legacy-tests.md` rows), as requirement-named module tests. No old suite was deleted (K619).
  - `content-legs.test.mjs` (content-extent-arms, content-extent, content-reads, rec220-version-pin, transcribe): R5, R11, R12, R13, R15.
  - `testimony-inherited.test.mjs` (testify, testimonyaxis, audit-inheritance): R4, R6, R7, R13.
  - `case-grammar.test.mjs` (publish, multifinding, caseproduction, grounds): R2, R7, R8, R27, R30, R38.
  - `lifecycle-reads.test.mjs` (inquiry, rec173-migration-replay, meaningquery, reevaluation): R1, R2, R10, R12, R16, R17, R20, R21, R23, R25, R40, R42, R49.
  - What each suite's share carried, and what it left to its owners, is in the converters' accounts. Everything left out is other modules' shares or source text; no inquiry behaviour failed.
- **Fixed in this job:**
  - R11: a sub-code of C-2.8 with no catalogue row (the testimony arms) carried `translation: undefined`. It now carries its code alone.
  - `grammar.test.mjs`' R7 arm built a registry shape the check does not read and passed only through a loose assertion. It now uses the edition's axes and asserts C-21.2 exactly.

**Deferred, with why.** R11's R2/R3 arm at the write (J4): `check()` does not judge the entry requirements. The catalogue's arm is not exported and is reachable only through async `checkBundle`, and moving it is inquiry's catalogue share (T19). Proposed: a `not yet met` mark.

**Found in other modules (REPORT J3, J4).**
- conformance's `reads.test.mjs`:109 writes `bundles.inquiry_superseded_by` directly, so conformance R10 has 1 fail after N136. That is conformance's (layer 9) to fix: supersede through `divide`, or write `inquiry_bundle_facts`.
- `src` changes stale the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (not_product's, §14).
- A converter observed that `onRaised`'s raised entries carry `target` through dispose, not through divide. R21 and R25 do not say; noted, not changed.

**Tests and checks.**
- `node --test test/m/inquiry/`: tests 145, pass 144, fail 0, todo 1 (R31, not yet met, K181).
- The module tests of every other module (test/m less inquiry): 3540 pass, 2 fail (capture R36, K658, as at layer 5's close; conformance R10, J3).
- The process checks:
  - format: 82 modules, 77 requirements files; 0 failures.
  - architecture: 23 product files, 73 relative imports; 0 failures.
  - coverage: 49 of 49 live requirement ids named by a test; 0 failures.
  - ownership (tranche/T18): 13 files; legacy-store 0 added, 30 removed; 0 failures.

Size (session_016DJXNscE3zEJMBXUbRNAPx): test runs 14, module lines 3649

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

## J5 · COMPLETE

Complete. N405 (R49, legacy-store's registration and #surfacedIn removed), the grammar face with record.grammars(), N136 (inquiry_bundle_facts, moved once, legs registered with retrieval R62; the two ADDITIVE_COLUMNS rows removed), N242's share already met, the 16 converts as requirement-named module tests. Fixed: R11's empty translation key on sub-codes; grammar.test R7's registry shape. Deferred: R11's R2/R3 arm at the write (J4). Found: conformance R10's test writes the moved column (J3); the plane bundle is stale. inquiry 144/0 (1 todo); other modules 3540 pass, 2 fail (capture R36 K658, conformance R10 J3); format, architecture, coverage 49/49, ownership: 0 failures. Record: Completion (INQUIRY #7).
