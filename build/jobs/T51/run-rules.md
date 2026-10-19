# run-rules (T51)

**Status** · session_011shDuDPXYSkeRNrLGrn4xW · depth 2 · WORKING · handled B1

## J1 · REPORT

Stale references outside run-rules, found while doing B1's note (not changed here; not this module's files):

- `bio-plane/src/provenance-routes/checks.mjs`:36 names `legacy check-refusal-codes.mjs` (deleted at T20).
- `bio-plane/src/review/checks.mjs`:23 names `check-refusal-codes.mjs` as a guard that did not see a refusal.
- `bio-plane/src/queue/index.mjs`:1210 names `civicos-ui/check-refusal-codes.mjs` (the DEC-49 guard's arm C).
- `bio-plane/src/queuestate.mjs`:410 names `civicos-ui/check-refusal-codes.mjs` (deleted in T20).
- `bio-plane/src/ai-runs/index.mjs`:1026 and :1269 name `check-refusal-codes.mjs` (deleted in T20).
- `agent-worker/src/index.mjs`:287 names `civicos-ui/check-refusal-codes.mjs` (T51-65 already lists this comment).
- `bio-plane/src/run-rules/checks.mjs` and `rules.mjs` are done (this job).
- Generated, not edited by any job: `bio-plane/dist/bio-plane.bundled.mjs` (lines 171206, 171277) and `release/bio-plane.bundled.mjs` (line 123352) carry the same stale text; they change only when the bundle is regenerated.
Sites in `agent-worker/dist/agent-worker.bundled.mjs` (lines 14926, 14997) are generated too.

## J2 · COMPLETE

COMPLETE for T51-56 · run-rules (stale comments). Branch job/T51/run-rules, commit 2daacafdda.

Entries applied: T51-56, the stale comments restated for the code as it is, no behaviour change.
- `checks.mjs`: the four lines naming `civicos-ui/check-refusal-codes.mjs` (401, 480, 528–529, 549) now name the refusal-code guard as deleted in T20. B1 listed 401, 528, 549; line 480 had the same reference, so I restated it too.
- `rules.mjs`: 329, 861, 897 and 955 restated the same way.
- A note on the commit message: its second sentence says the table test "holds each refusal's row where it is held now". The diff does not say that; it only restates the guard references. I did not force-push to fix the message.

Deferred: none.

Found in other modules (not changed here; listed in the REPORT entry above): the same stale guard reference in `provenance-routes`, `review`, `queue`, `queuestate`, `ai-runs` (two sites), `agent-worker/src/index.mjs` (already in T51-65), and generated bundles.

Tests and checks:
- `node --test test/m/run-rules/*.test.mjs` in bio-plane: 73 pass, 0 fail.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 24 modules fail with live ids named by no test, none of them run-rules (run-rules alone: 35 of 35 named, 0 failures); channels 0 failures.
- `node checks/architecture.mjs /home/user/bio run-rules`: 0 failures.
- `node checks/ownership.mjs /home/user/bio run-rules tranche/T51 job/T51/run-rules`: 1 file changed by run-rules, 0 failures.
- `node checks/coverage.mjs /home/user/bio run-rules`: 35 of 35 live ids named, 0 failures.
- `node --check` on both files: OK.

Size (session_01JK3uw1JJkjBgojR6Ty8YBQ): test runs 1, module lines 2574
