# Plan: tranche T11

**Status** · OPEN · BOB #61 · session_01NdEozCriVs1kqon1xwEhJ2 · depth 1

Opened by BOB #59, 2026-09-28 (PROCESS-MECHANICS §5), from `draft-T11.md` (BOB #57, K305; arising entries BOB #58 and #59) at once after T10 closed (K346; K340: no pacing). Branch `tranche/T11` starts at `main` @ 8cf1ffb937. Cut to 28 jobs (K347): the N285 shared-code cluster and the queue, instance-setup and control-plane extractions go to `draft-T12.md`. Every provider side this plan needs was worded on T10's tranche before it closed (K338, K343, K344) and re-read against T10's close (K170): layers 1–6 and 10–11 of T10 changed nothing they word. Bob's weekly meter at the opening: asked.

**Jobs** · record-core: RECORD-CORE #6 session_01F4Zw6fHHxLm7fXnQfo4nc5; promotion: PROMOTION #11 session_01ASTMYa8KNLdKEKcGwkyoBG; legacy-checks: LEGACY-CHECKS #6 session_01X21rA21HbLKssMYh2XjGmk; extraction: EXTRACTION #4 session_01C1JzBJzAyWM9NPi1FuZxsZ; calibration: CALIBRATION #3 session_014Qef6d2cmQSeamSR91bGRi; connections: CONNECTIONS #4 session_01KBB1VTU4oE4epgti9kRRV5; observation-log: OBSERVATION-LOG #3 session_01TigRGSFxE29ocquNjATfru; retrieval: RETRIEVAL #3 session_019kYAkjqGuHEuapPatRmNFW; ai-runs: AI-RUNS #4 session_01Fj3xWyfWu9ZrTwzLXShJSv; capture-requests: CAPTURE-REQUESTS #3 session_0112zqCL2hpYuLBaQUhUSgZL; agent-worker: AGENT-WORKER #3 session_01YCWGKaZA5crqGysYYhfm9j; skills: SKILLS #3 session_01WHkeSYJXikezjTzJkizuXW; citation: CITATION #3 session_01PWEz1riZjrFQ4eskisubQr; intent: INTENT #3 session_01WZrsBqtbtRoDpA36xiDFhT; reevaluation: REEVALUATION #3 session_01HnoN5aneqU2Z7HVyorPUBY

**Rules at the opening.** T6's to T10's rules hold: the registration rule (K206), one code one site (K231, K275), a user builds against its provider's Provides and BOB merges a provider early (§4), each job writes requirement-named tests for every live id (P7) and applies only the share this plan gives it; an `N` entry's text is in `next.md`. SQL a module runs on the plane keeps each LIKE/GLOB pattern within workerd's 50 bytes, tested under a workerd-like cap (K313), over a cursor-returning fixture (K316). A job strikes each `not yet met` mark its work meets. Each layer is re-read at its start for what the layers below it changed (K170).

### Layer 1

- **legacy-checks** · N282 (C-53's header); N286 (C-22.17's comment); N289 (C-22.7's row leaves the catalogue for ai-runs, K343: ai-runs R35).

### Layer 2

- **record-core** · N287 (R37 states `group_id`, `prior_state`; tests at the contract).
- **promotion** · N281 (C-53.14's re-stamp, R34); N275 (its share: C-102.9's `where` names a region holding the verdict).

### Layer 4

- **extraction** · N294 (R61 `indexTestimony`, R62 `onIndexed`).
- **calibration** · N223 (its share: R18, R19, the two post-write notices).

### Layer 5

- **connections** · N288 (R59, the `entity_id` read contract).
- **observation-log** · N294 (its share: R7 listens to extraction R62).
- **retrieval** · N283 (the column move, R61, with its readers in this tranche, K327).

### Layer 6

- **ai-runs** · N284 (R30 `registered`); N289 (R35 holds C-22.7); N293 (R45, the `state` ceiling, C-22.18).
- **capture-requests** · N295 (R14 reads inquiry R44).
- **agent-worker** · N293 (its share: R49, its published state stays under ai-runs R45).
- **citation** · N283's reader (K354: `invariants.test` R6 pins the tables a cite moves; the projection's row now moves in retrieval's `bundle_projection`; R6 itself is unchanged; P10's provided-service exception).
- **skills** · N289 (its share, K349: R25's test reads C-22.7's row through ai-runs, never the catalogue; P10's provided-service exception).

### Layer 7

- **intent** · N209 (R12–R13's bounds, K338); N236; N208 (its site); N277 (its share); N291 (`requestById`).
- **reevaluation** · N239; N292 (`listeners_failed`, R7–R8); N210 (its share: R26 `registerCaseParts`).

### Layer 8

- **publication** · N210 (R41 `caseCitedParts`, registered with reevaluation R26); N230 (R42); N256; N260; N277, N237 (their shares; N238 has no share here, K351); N297 (its share).
- **ratification** · N256 (its share).
- **case-authoring** · N259; N275 (its share); N297 (its share).
- **review** · N297 (its share).

### Layer 9

- **standards** · N220; N267; N269; N296.
- **conformance** · N233; N274; N296; N297 (its share).
- **consequences** · N257; N296; N297 (its share).
- **actions** · N283 (its read); N231 (R42 `kinds()`); N237 (R31's bound and cursor); N246; N261; N271; N277 (its share); N217's layer-9 sites (K275); N297 (its share).
- **filings** · N296; N217 (its sites call actions R43 `noSuchAction`, keeping `#noAction`'s second sentence through `extra`, K351).
- **escalation** · N296; N297 (its share); N217 (R9 calls actions R43 `noSuchAction`, K351).

### Layer 10

- **monitoring** · N283 (its reads); N222; N278; N266 (R46 `counts()`); N224 (R19, R20); N230 (its share); N247 (its share); N297 (its share).
- **scheduler** · N223's and N224's consumers (calibration R18–R19, ai-runs R43, capture-requests R44; monitoring's rank; K351).
- **legacy-store** · N266 and N267 (their shares); N294 (its share: `#testimonyWithin` calls extraction's `indexTestimony`).

### Layer 11

- **legacy-index** · N231 (its share); N247 (its share); N272.
- **legacy-tests** · re-anchor or retire what T11's layers break; N279; N298.
