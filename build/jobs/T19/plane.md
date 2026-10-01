# plane (T19)

**Status** · session_01LyQdjVWwytEZ1iVYFQbzYm · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings I am working on; none stops me now (I build the class, `held.mjs` and the tests first).

1. **`publicOp` and `gatedOp`.** After the L11 owners take their arms (affordances, queue, instance-setup, control-plane's door share), what is left of the two hooks in `src/index.mjs` is dispatch lines to owners' handlers (`publicReadDoorOp`, `publicationDoorOp`, `capturePublicOp`, `bootstrapOp`; `registerAuditOp`, `connectionsOp`, `governorOpResponse`, `captureOp`, `extractionOp`, `attestOp`, `monitorOp`, `ratificationOp`) and the frames. My reading: those frames and dispatch lines are the composition root (legacy-index map §1a marks the frames "composition root"), so I move them whole into `src/plane/` (I am `from` legacy-index) once those jobs have merged, and R6's hooks are plane's compositions of the owners' handlers. The alternative (control-plane holds the two hooks and plane only calls `makeFetch` with them) I will follow if you say so.
2. **R6 "No other export."** `src/index.mjs` also re-exports `PUBLISHED_TOKEN_HASHES`, `liveToken`, `PLANE_LIMITS`, and `store.mjs` `stampInstant`, `instantOrder`. My entry drops all five; no product file imports them through these paths (I will re-check at the deletion).
3. **Files: my own call, recorded here.** `src/plane/index.mjs` the Worker entry (`default`, `Store`), `src/plane/store.mjs` the class, `src/plane/held.mjs` K842's held code; `wrangler.jsonc` `main` → `src/plane/index.mjs`.

For routing (REPORT-grade, listed now so the owners can plan): module tests outside my paths that read the three files and will break at my deletion unless re-pointed to `src/plane/index.mjs` / `src/plane/store.mjs`: `test/m/host-governor/ops.test.mjs`:192, `test/m/capture/plane.test.mjs`:13 (closed layers), `test/m/instance-setup/{worker-page,profiles,reports,worker-reports}.test.mjs` (SRC), `test/m/queue/world.mjs`:7 (`SCHEMA` from `schema.mjs`), `test/m/control-plane/{dispatch,store-class}.test.mjs` (`store.mjs`), `test/m/legacy-store/` (its fixture imports `store.mjs`; it goes with the legacy module?), and agent-worker's `requirements`, `harness`, `agent-worker`, `versions` tests (`PLANE_ENTRY`/`PLANE_IDX_PATH` = `bio-plane/src/index.mjs`). Old system suites reading them are accepted red (K619). `build-plane.mjs` / the fleet bundle input: bundler's, I will REPORT the exact edit when my entry exists.
