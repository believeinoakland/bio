# Plan: tranche T11

**Status** · CLOSING · BOB #61 · session_01NdEozCriVs1kqon1xwEhJ2 · <leave the main commit to BOB>

Opened by BOB #59, 2026-09-28 (PROCESS-MECHANICS §5), from `draft-T11.md` (BOB #57, K305; arising entries BOB #58 and #59) at once after T10 closed (K346; K340: no pacing). Branch `tranche/T11` starts at `main` @ 8cf1ffb937. Cut to 28 jobs (K347): the N285 shared-code cluster and the queue, instance-setup and control-plane extractions go to `draft-T12.md`. Every provider side this plan needs was worded on T10's tranche before it closed (K338, K343, K344) and re-read against T10's close (K170): layers 1–6 and 10–11 of T10 changed nothing they word. Run by BOB #60 (layers 1–6) and BOB #61 (layers 7–11). Bob's weekly meter at the opening: asked, not given.

**Jobs** · record-core: RECORD-CORE #6 session_01F4Zw6fHHxLm7fXnQfo4nc5; promotion: PROMOTION #11 session_01ASTMYa8KNLdKEKcGwkyoBG; legacy-checks: LEGACY-CHECKS #5 session_01EwVH7Frcm6uLT9v54Y4Xi3, LEGACY-CHECKS #6 session_01X21rA21HbLKssMYh2XjGmk; extraction: EXTRACTION #4 session_01C1JzBJzAyWM9NPi1FuZxsZ; calibration: CALIBRATION #3 session_014Qef6d2cmQSeamSR91bGRi; connections: CONNECTIONS #4 session_01KBB1VTU4oE4epgti9kRRV5; observation-log: OBSERVATION-LOG #3 session_01TigRGSFxE29ocquNjATfru; retrieval: RETRIEVAL #3 session_019kYAkjqGuHEuapPatRmNFW; ai-runs: AI-RUNS #4 session_01Fj3xWyfWu9ZrTwzLXShJSv; capture-requests: CAPTURE-REQUESTS #3 session_0112zqCL2hpYuLBaQUhUSgZL; agent-worker: AGENT-WORKER #3 session_01YCWGKaZA5crqGysYYhfm9j; skills: SKILLS #3 session_01WHkeSYJXikezjTzJkizuXW; citation: CITATION #3 session_01PWEz1riZjrFQ4eskisubQr; intent: INTENT #3 session_01WZrsBqtbtRoDpA36xiDFhT; publication: PUBLICATION #2 session_0158G6qbdCv2B4LMZMJ1KrSU; ratification: RATIFICATION #3 session_01TrJPeeGe3xdCv9sCLy1TBh; case-authoring: CASE-AUTHORING #2 session_015k1nax4hEesSV8iyG1Ve91; review: REVIEW #2 session_013upGxpTKBf57ky1i3TdZNR; reevaluation: REEVALUATION #3 session_01HnoN5aneqU2Z7HVyorPUBY, REEVALUATION #4 session_017vCzJ7Qy2uRJxaScJFZefA; standards: STANDARDS #2 session_01SXyQJAxnzwptrywGGyqWH7; conformance: CONFORMANCE #2 session_01NziJWiXTGxTMsUE4yfrfpB; consequences: CONSEQUENCES #2 session_014niSbgTxMSArkDJwhCLLE4; actions: ACTIONS #2 session_01QJraYCYw3CtTBeXsM2piAx; filings: FILINGS #3 session_01Bokq8y9ZX2oFtuYKbqK3YF; escalation: ESCALATION #4 session_01CE181yr6UPtvYZGABsN4KC; monitoring: MONITORING #3 session_01NE1TmJGxu5yVThzDzkCH6p; scheduler: SCHEDULER #2 session_01LjsX9MK5ewxBsUxpMLKmTd; legacy-store: LEGACY-STORE #3 session_01JVGpG2wpwFQ4tzDwuNQZaq; affordances: AFFORDANCES #4 session_01B7kiVs24JbVTE4P4CTC88x; legacy-index: LEGACY-INDEX #8 session_017wnYAQFtWif7k7G5n1MVfL; legacy-tests: LEGACY-TESTS #8 session_01YWmQZKPxE1pc82DkFtV5tS

**Rules at the opening.** T6's to T10's rules hold: the registration rule (K206), one code one site (K231, K275), a user builds against its provider's Provides and BOB merges a provider early (§4), each job writes requirement-named tests for every live id (P7) and applies only the share this plan gives it; an `N` entry's text is in `next.md`. SQL a module runs on the plane keeps each LIKE/GLOB pattern within workerd's 50 bytes, tested under a workerd-like cap (K313), over a cursor-returning fixture (K316). A job strikes each `not yet met` mark its work meets. Each layer is re-read at its start for what the layers below it changed (K170).

## Outcome by entry

### Layer 1 (K348, K350)

- **legacy-checks** · N282: met (K348). N286: met (K348). N289: met in part: the row left the catalogue (K348), then was restored by LEGACY-CHECKS #6 because the plane does not boot without it (K350); ai-runs now holds its own (K358), and the catalogue's copy leaves in T12 (N299).

### Layer 2 (K352)

- **record-core** · N287: met (K352; two flaws its tests found fixed).
- **promotion** · N281: met, `CATALOG_VERSION` 1.41.0 (K352). N275 (its share): met (K352). T11's later check changes are stamped in T12 (N302).

### Layer 4 (K353)

- **extraction** · N294: met, R61 `indexTestimony`, R62 `onIndexed` (K353).
- **calibration** · N223 (its share): met, R18, R19 (K353).

### Layer 5 (K354)

- **connections** · N288: met, R59 held already and tested (K354).
- **observation-log** · N294 (its share): met, R7 listens to R62 (K354).
- **retrieval** · N283: met, `bundle_projection` moved once by `migrate()` (K354).

### Layer 6 (K358)

- **ai-runs** · N284: met (K358). N289: met, C-22.7 in its own table; R35 narrowed to N299 (K358). N293: met, R45 `AI_RUN_STATE_MAX_BYTES` (K358).
- **capture-requests** · N295: met (K358).
- **agent-worker** · N293 (its share): met, R49 per K355 (K358); its control arms' re-anchor to T12 (N304).
- **citation** · N283's reader: met (K354, K358).
- **skills** · N289 (its share): met (K349, K358).

### Layer 7 (K361)

- **intent** · N209, N236, N208 (its site), N277 (its share), N291: met (K361); its unbounded reads routed to T12 (N305, worded K367).
- **reevaluation** · N239, N292: met (K361). N210 (its share): met (K359, K361), then re-opened (below).

### Layer 8 (K366)

- **publication** · N210 (R41, R43, as K359, K363, K365 word them), N230 (R42), N256, N260, N277 and N237 (R35 set-wise), N297: met (K366); R38's bound routed to T12 (N308).
- **ratification** · N256 (its share): met, R5 and R16's live arm after a CHANGE (K366).
- **case-authoring** · N259, N275 (its share), N297 (its share): met (K366).
- **review** · N297 (its share): met (K366); its `MINT_EXHAUSTED` rows routed to T12 (N306).

### Layer 9 (K371)

- **standards** · N220, N267, N269 (`STANDARD_NO_ID`, K369), N296: met (K371).
- **conformance** · N233, N274 (meets N307), N296, N297 (its share): met (K369, K371).
- **consequences** · N257 (R12 `not_applicable`, K370), N296, N297 (its share): met (K371).
- **actions** · N283 (its read), N231, N237, N246, N261, N271, N277 (its share), N217's layer-9 sites (R43 `noSuchAction`), N297: met, merged early (K368, K370); R31's cursor limit to T12 (N311).
- **filings** · N296; N217 through actions R43: met (K371).
- **escalation** · N296; N297 (its share); N217 through actions R43: met (K371).

### Layer 10 (K374)

- **monitoring** · N283 (its reads), N222, N278, N266 (R46 `counts()`), N224 (R19, R20), N230 (its share), N247 (its share, K372's fallback), N297 (its share): met (K372, K373); `openEnvelope`'s removal to T12 (N313).
- **scheduler** · N223's and N224's consumers: met (K373, K374).
- **legacy-store** · N266 and N267 (their shares), N294 (its share): met, with K365's constructor registration (K374).

### Layer 11

- **affordances** · N310: met (K375); re-opened for `monitorpause` in `NON_ACTS` and `RUNG_ABSENT` (K377), COMPLETE per its record (B3), merged.
- **legacy-index** · N231 (its share): met, `op=actionkinds` (K376). N247 (its share): met, the envelope half only (K376). N272: met in part, `dec49Row` reads module families; `MODULE_CHECK_FILES` stays hand-kept until N245 (K351, T12). `monitorpause` reaches the root of trust only; administrators in T12 (N314). Merged.
- **legacy-tests** · LEGACY-TESTS #8 — outcome pending

### Entries added during the tranche

- **skills** joined layer 6 for N289's share (K349); **citation** joined layer 6 for N283's reader (K354).
- **legacy-checks** re-opened in layer 2 (LEGACY-CHECKS #6, K350).
- **reevaluation** re-opened in layer 8 as REEVALUATION #4: case parts graded by `capture_sha` (K365): met (K366).
- **ratification** re-opened by a CHANGE: its fixture's reevaluation stub and R16's live arm (K366): met.
- **affordances** joined layer 11 for N310 (K370), re-opened by K377.
- **N entries raised in T11, routed to T12:** N305 (intent's bounds, K367), N306 (review's `MINT_EXHAUSTED` rows), N307 (met in T11 by conformance's N274, K369), N308 (publication R38's bound), N309 (shared codes, a standards `noSuchStandard` helper), N310 (met in T11, K375), N311 (actions R31's entry cursor), N312 (`DETERMINATION_SUPERSEDED` helper), N313 (monitoring's `openEnvelope`), N314 (`monitorpause` for every administrator). Also raised by BOB #60 during T11: N299–N304 (K350, K356, K357, K358).

## Outcome (BOB #61, 2026-09-29)

**CLOSING: layers 1–10 merged; layer 11's affordances and legacy-index merged, legacy-tests running.**
- **Layers 1–10** (K348, K350, K352–K354, K358, K361, K366, K371, K374): every planned entry met, N289 in part (N299); each layer closed with ownership 0 failures, `fleetbundles` 96/0 and newgroup fresh; architecture's 4 failures unchanged, coverage 9 → 5.
- **Deferred:** N272's remainder (waits on N245), N289's catalogue copy (N299) and N305–N314 to T12; nothing planned was left undone.
- **Usage:** 30 job sessions (LEGACY-CHECKS and REEVALUATION ran twice), 358.3M tokens processed; BOB rows 205.9M (BOB #59's final row 111.7M, BOB #60's 94.2M); 564.2M in all, cache reads 98%. Largest jobs: PUBLICATION #2 46.7M, MONITORING #3 32.6M, ACTIONS #2 27.3M, LEGACY-STORE #3 22.9M, LEGACY-CHECKS #5 20.5M. BOB #61's own row and legacy-tests', affordances' and legacy-index's rows are added at close. Bob's weekly meter: asked at the opening, not given.
