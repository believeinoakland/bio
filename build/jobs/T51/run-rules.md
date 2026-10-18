# run-rules (T51)

**Status** · session_01JK3uw1JJkjBgojR6Ty8YBQ · depth 2 · WORKING · handled B0

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
