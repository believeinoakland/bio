# doctypes (T51)

**Status** · session_01JKKYXh9GYPEvo5f4RVmsfZ · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Other-module finding from T51-8 (doctypes). Not changed by this job; for the module owners or the T51-126 sweep.

Comments that still name `civicos-ui/app.html` or `civicos-ui/` as a live file, found while reading `build/requirements` and code for the stale-comment check. Several are historical ("deleted in T20") and need no change; the rest describe the old UI as if it were still there:

- bio-plane/src/affordances.mjs:336, :469, :509, :527, :605
- bio-plane/src/provenance-routes/index.mjs:256
- bio-plane/src/review/checks.mjs:25
- bio-plane/src/retrieval/checks.mjs:73
- bio-plane/src/queue/index.mjs:1210, :1443, :1518
- bio-plane/src/public-read/index.mjs:1159
- bio-plane/src/publication/worker.mjs:322
- bio-plane/src/queuestate.mjs:408
- bio-plane/src/gate.mjs:342
- bio-plane/src/bias/checks.mjs:473
- bio-plane/src/content/extent-core.mjs:38, :606
- agent-worker/src/index.mjs:287

Reported only; these are other modules' code. T51-126 deletes `civicos-ui/`, so BOB may want these swept in the same act.

Also observed in a full `checks/run.mjs` run on the tranche's job branch (not doctypes): coverage 3 failures, agent-harness R17, agent-runner R36 R38 R37 R40, journey-check R19. Outside this job; noted for BOB.
