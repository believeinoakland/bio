# Plan: tranche T10

**Status** · OPEN · BOB #58 · session_01PDr5BqtdMLRym3JZR8m44n · depth 1

Opened by BOB #57, 2026-09-28 (PROCESS-MECHANICS §5), from `draft-T10.md` (BOB #56, K274; cut by BOB #57, K305, K317, K320) at once after T9 closed (K282: no pacing). Branch `tranche/T10` starts at `main` @ ac699662aa (T9 closed, K320). The provider sides were worded on T9's tranche before it closed (K304, K306, K303) and re-read against T9's close: layers 1–4 and 10–11 changed nothing they word. Bob's weekly meter at the opening: asked.

**Jobs** · jurisdictions: JURISDICTIONS #3 session_01SU8wk5poE2iWXhvwJ4DL2R; membership: MEMBERSHIP #4 session_01DFpd1E91TLimBv3dJ5zL7N; capture-sources: CAPTURE-SOURCES #4 session_01M69ZsrZCDXrw2gwihj7LxK; provenance: PROVENANCE #5 session_01U1hr3TuE7sjb7d1PSfBTtt; content: CONTENT #4 session_01YbRZULyy1GXdngu8HQHJc2; entities: ENTITIES #2 session_01Spi2rw7fqrSoC1eWoQVSEo; connections: CONNECTIONS #3 session_01AVYPLgv86VRTDdHGQmuQVk; progressions: PROGRESSIONS #2 session_01AUvfDhJvdEvaWM3SYVnhr6; bias: BIAS #2 session_01UtHLMrHZ2X8UVfhfaiTKsg; observation-log: OBSERVATION-LOG #2 session_017qTNuu87xeFVykeCg51XB3; query-language: QUERY-LANGUAGE #2 session_018E96qPj3eH3p3P8yKxFQuJ; retrieval: RETRIEVAL #2 session_01CbPDfJwtC7DfaJUPFLHp6F; inquiry: INQUIRY #2 session_01HRS6LAssjHFRPkTUcmR4Aq

**Rules at the opening (K315).** T6's to T9's rules hold, as T9's plan states them: the registration rule (K206), one code one site (K231), a user builds against its provider's Provides and BOB merges a provider early (§4), each job writes requirement-named tests for every live id (P7) and applies only the share this plan gives it; an `N` entry's text is in `next.md`. Every provider side this plan needs is worded before its layer opens (K277, K304; marks `not yet met: T10`). SQL a module runs on the plane keeps each LIKE/GLOB pattern within workerd's 50 bytes, tested under a workerd-like cap where the module builds a pattern (K313). Each layer is re-read at its start for what the layers below it changed (K170).

### Layer 5

- **entities** · N110; N126; N135; N208 (its share: the one helper and row for `NO_SUCH_ENTITY`, which progressions and intent call); N202 (its share).
- **connections** · N125; N131; N213 (its share: a read contract on `refs` `target_id`, `kind`); N202 (its share).
- **progressions** · N118 (its share); N63 (its share, if its mark still holds); N208 (calls entities' helper); N242 (C-100's regions marked, conscripted calls); N202 (its share).
- **bias** · N171 (its share); N143; N118 (its share); N63 (its share, if its mark holds); N207 (`record-core.textAtSha`); N224 (its share: R33's tick takes the scheduler's rank); N242 (`#promotionCheck`); N202 (its share).
- **observation-log** · N174; N113 (K306); N118 (its share); N134; N139 (its share); N202 (its share).
- **query-language** · N104 (its share); N106 (its share, with retrieval).
- **retrieval** · N171 (its share); N106 (its share); N142 (its share: `answerChanged`); N202 (its share).

### Layer 6

- **inquiry** · N142, N99 (its share), N149, N151 (its share), N160, each if T7 left it; N183; N202 (its share).
- **citation** · N165 (its share); N146 and N208 (adopt membership's helper, delete its copy); N196; N203.
- **basis-versions** · N99; N185; N186 (imports inquiry's `actNoBasis`, deletes its own); N204; N202 (its share).
- **strength** · N152 (its share); N184; N218; N208 (its site calls membership's helper; `BAD_GRADE` its own row).
- **ai-runs** · N138 (its share: delete `airun.mjs`' copy, case-authoring now holding it); N190; N276; N191 (keeps the one D-486 predicate and exports it; legacy-store reads it); N223 (its share).
- **run-productions** · N165 (its share); N194; N201.
- **capture-requests** · N169; N141; N188; N262; N223 (its share); N224 (its share).
- **skills** · N156.
- **agent-worker** · N153 (its share).

- **jurisdictions** (layer 1) · N258 (K303).
- **membership** (layer 2) · N280.
- **capture-sources** (layer 3) · N273.
- **provenance** (layer 3) · N263. **content** (layer 4) · N264; N201 (its share: a member's leg on a machine-minted content row).
- **legacy-store** (layer 10) · N265 (its share); N268; N270; N191 (reads ai-runs' predicate, R42).
- **legacy-index** (layer 11) · N265 (its share).
- **legacy-tests** (layer 11) · re-anchor or retire what T10's layers break; the reds T9 leaves, re-measured.

**Size (K305, K317, K320).** 24 jobs: layer 1 1, layer 2 1, layer 3 2, layer 4 1, layer 5 7, layer 6 9, layer 10 1, layer 11 2. Layers 7–9, monitoring and scheduler, the layer-11 extractions, legacy-checks' convergence rows, and N157/N245 are `draft-T11.md`.
