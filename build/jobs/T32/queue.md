# queue (T32)

**Status** · session_01LniC4TbnKF6muwuHuXpuiY · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Completion record** (on `tranche/T32` as of B1).

Entries applied:
- N547 (R50): `cited-newer-edition` and `cited-edition-withdrawn` take R12's project-scoped disposition with `acts: [reevaluationrecord]`, as `edition-withdrawn` does: both added to `Queue.FINDING_ACTS` (each list frozen, copied onto the item). With no project home they answer `no_project_scope` and still name the act; a project's set-aside narrows their homes and keeps the act (R13).

Tests: `test/m/queue/watched.test.mjs` gains two tests through the REAL `queue-producers.feedItems`: R12/R50 (both kinds' full disposition; per-item copies; no-project-scope arm; negative control: the other four T31 findings name no act) and R13/R27/R50 (per-project ageing of `cited-edition-withdrawn`, the newer-edition item untouched). `docket.test.mjs`' FINDING_ACTS key list is now five kinds. Measured: with the source change stashed, 3 tests fail; with it, all pass.

Deferred: none.

Found in other modules / for BOB:
- Requirements text: R50's `*(not yet met: T32)*` mark on the cited kinds is now met.
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` stale by this job's source change; for the layer close (§14).

Tests and checks:
- `node --test test/m/queue/ test/conclude-project.test.mjs`: tests 114, pass 114, fail 0.
- users: `test/m/queue-producers/`: tests 79, pass 79, fail 0.
- format: 98 modules, 97 requirements files; 0 failures. architecture: 26 product files, 72 relative imports; 0 failures. coverage: 40 of 40 live requirement ids named by a test; 0 failures. ownership: 4 files changed by queue between tranche/T32 and HEAD; 0 failures.

Size (session_01LniC4TbnKF6muwuHuXpuiY): test runs 5, module lines 2815
