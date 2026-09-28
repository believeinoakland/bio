# Plan: tranche T9

**Status** · OPEN · BOB #56 · session_01VU9rtJrxixUgABcg5fucAq · depth 1

**Jobs** · legacy-checks: LEGACY-CHECKS #4 session_01362JGtE3gn5X3QqZps3xue; subresources: SUBRESOURCES #2 session_01PwqLa1NvQSNYxStbJ9R5ds; office-readers: OFFICE-READERS #2 session_01US5MKSyeetAVCERbaBowrE

Opened by BOB #56, 2026-09-28 (PROCESS-MECHANICS §5), from `draft-T9.md` (BOB #52, K201) re-read for what T8 changed (K170's rule) and cut by K274. Branch `tranche/T9` starts at `main` @ 7b535cf70c (T8 closed, K272). T9 carries layers 1–4, legacy-store's own job (layer 10) and layer 11's affordances, legacy-index and legacy-tests: the draft's first items (N240, N216 with K263/K264's held routes and rows), the provider-side services later layers read (N202's and N208's helpers, N213's and N219's contracts, N215's `passageText`), and each T8 entry against a module of these layers. Layers 5–6 and the layer 7–11 entries go to `draft-T10.md` (K274). T6's to T8's rules hold, as T8's plan states them: the registration rule (K206), one code one site (K231), a user builds against its provider's Provides and BOB merges a provider early (§4), each job writes requirement-named tests for every live id (P7) and applies only the share this plan gives it; an `N` entry's text is in `next.md`. Each layer is re-read at its start for what the layers below it changed (K170).

### Layer 1 (order: `legacy-checks`, `subresources`, `office-readers`, `odf-reader`, `pdf-reader`, `text-chain`, `image-codecs`)

- **legacy-checks** · N206 (rows for `CASE_CATALOGUE_FAILED` and `STEP_DECLARED`, now at one site); N212 (C-32.6's and C-33.14's `where`s to `src/case-authoring/index.mjs`; `CASE_DERIVATION_CHECKS` goes with its header once nothing reads it); N214 (rows for `MINT_EXHAUSTED`, `CASE_MEMBER_REFUSED`; the stale headers above `INSTALLATION_CHECKS` and `ATTRIBUTION_CHECKS`, the emptied `ATTRIBUTION_CHECKS` going); N226 (C-48.8's and C-48.9's `where`s to `src/monitoring/index.mjs`). `LISTENER_DECLARED`'s and `LISTENER_MALFORMED`'s rows wait on N202's convergence (T10).
- **subresources** · N79 (each link carries its chrome containment; capture R28 follows in layer 3).
- **office-readers** · N27 (its share: `rangeUnitFor`, `a1Corner` named in Provides).
- **odf-reader** · N27 (the `.ods` half of D-415: named ranges and tables as `sheet-range` units; built work in `odf.mjs` on the snapshot).
- **pdf-reader** · N100 (its share: each page's box, the producer half of D-374, built on `land/worker/D-374`); N101 (`image_unread` per image, D-665's producer half; REC-206's link anchors).
- **text-chain** · N98 (D-670's space rule for `extentCovers`, `readingPositionInExtent`, `readingSource`'s `space`; built on the D-670 branch); N102 (`mergeTier2Text` carries `image_unread`); N104 (its share: states which step kinds are machine readings).
- **image-codecs** · N75 (the low-memory line-based 9/7 wavelet only; its measurement on a deployed plane waits).

### Layer 2 (order: `record-core`, `membership`, `promotion`)

- **record-core** · N213 (its share: R37's read contract states `files.bytes`, `files.blob_sha`, `bundles.bundle_sha`, `row_version`, `created`, `last_updated`, the `manifest` table and `history.created`, as BOB words them before layer 2 opens); N219 (`releaseLease(bundleId, actor)`, as BOB words it).
- **membership** · N208 with N146 (one helper for the one condition "no such project, or unseen", answered as absent: `#noSuchProject` in Provides, its row membership's; K231, K238); N123 (its share: a revocation notice, K31's pattern; K159); N142 (its share: `inSight` into Provides; `bundleGate`/`bundleRedactor` stated or struck); N70 (its share: bounds on the deciders of `hostingaccess`, `memberpairings`, `projectowneradd`); N195 (region `is-hosting-access-holders` widened to the whole refusal).
- **promotion** · N240 first (a MINOR `CATALOG_VERSION` stamp: monitoring moved C-18.5's emission site; with layer 1's departures, d470's row from the print); N202 (its share: the one helper every listener registration calls, minting `LISTENER_DECLARED` and `LISTENER_MALFORMED` at one site, K231, as BOB words it); N208 (its share: its `NO_SUCH_PROJECT` site calls membership's helper). Re-opened after layer 4 for the stamp of T9's later departures (K233's pattern).

### Layer 3 (order: `host-governor`, `provenance`, `capture-sources`, `capture`)

- **host-governor** · N132 (`governorOf` adopts a later caller's defaulted option and refuses a differing one).
- **provenance** · N133 (its share: R48 states the whole-second spelling of `first_retrieved`/`last_retrieved`); N145 (a test naming R48's `authored` column); N213 (its share: R48 names `register.bytes`, `register.author`); N227 (R48 names `captured_locators.via`, which monitoring R26 reads; K276); N202 (its share: its listener registration calls promotion's helper).
- **capture-sources** · N123 (its share: registers membership's notice, so a revoked member's `member` credentials are destroyed at once); N189 (C-105's `where`s; `NO_SUCH`'s translation; `NO_KEY` and `NO_SUCH` each split to one condition per code; `credentialList` and `credentialsForFetch` bounded).
- **capture** · N79 (its share: R28 records containment on live captures, D-340's `furnitureLinks`); N133 (its share: bound `resolveLinks`' per-link read, bracket in SQL); N140 (the in-process `captureRequest` arm takes `{credential, heldSha, origin}`: capture-requests R38, R39, R41); N228 (judges whether `driveRow`'s export stays, now monitoring reads `DRIVE_CAPTURE_CHECKS` itself); N247 (its share: `capture/doorbell.mjs` opens durable-object envelopes through `doAnswer`); N202 (its share); R45–R46 (N63's tasks-inbox owner, N64's event-queue read and live sessions) if still marked not yet met.

### Layer 4 (order: `calibration`, `extraction`, `content`)

- **calibration** · N202 (its share).
- **extraction** · N100 (its share: R13/R30 carry `page_boxes` under `page_count`'s three-state rule); N139 (its share: D-375's reading character count, built on `land/worker/D-375` @ 9a5df6e6); N151 (its share: `reading_text_source.chain` joins R58's read contract); N202 (its share).
- **content** · N161 (`noticeForRow` in Provides, with its test); N215 (`passageText(contentId)`: the typed text for a typed row, else extraction's units at the row's extent, as BOB words it; consequences R2 reads it); N202 (its share).

### Layer 10 (order: `legacy-store`)

- **legacy-store** · its own job, which may add to `store.mjs` (an extracting job may only remove, §12.2): N216 first (the durable object constructs the layer-9 modules built with no `from`, `consequencesModule`, `escalationOf(ctx)`, `filingsOf(ctx, deps)` and any other, and spreads their ops into its op map, as it does reevaluation's); N28 (a page's kind reads `chainKindFor`); N89 and N193 with N243 (every id-naming read classified in `PROJECT_NAMING_READS` or `_NOT`, the five of project-sight 248/1 and N216's routes among them); N205 (the dead `#groupUndetermined` deleted); N186 (its share: the dead `actNoBasis` deleted); N208 (its share: its `NO_SUCH_PROJECT` sites call membership's helper); N112's remainder (the thin delegates `#frontierLatest`, `#frontierVerification`, `#frontierDocumentVisible` deleted); the stale comments at the bias construction and above `captureOf` about arming the scheduler (K260); `op=stats` reads monitoring's tables through monitoring, not by name (K261).

### Layer 11 (order: `affordances`, `legacy-index`, `legacy-tests`)

- **affordances** · K264's share of N216: the 22 layer-9 `NON_ACTS` rows and rungs exactly as AFFORDANCES #2's record states them, now the durable object dispatches their ops; N45 and N176 with the extraction of `affordanceFacts` from legacy-store per its map (K225).
- **legacy-index** · K263's share of N216: the 34 layer-9 routes exactly as LEGACY-INDEX #5's record states them (names, classes, stamps, `NEEDS`).
- **legacy-tests** · re-anchor or retire what T9's layers break; N240's and promotion's re-opening's census re-pins (d470, A5's literal, pinned `gateVersion`s) from the suite's print; N248 (the seven dead anchors, N57's remainder, refusal-wire 41/1 after N212); the reds T9's earlier layers own, re-measured after their fixes.

**Size.** 22 jobs: layer 1 7, layer 2 3, layer 3 4, layer 4 3, layer 10 1, layer 11 3 (K274). T8 had 23.

## Not in T9, and why (K274)

- **Layers 5–6** (entities, connections, progressions, bias, observation-log, query-language, retrieval; inquiry, citation, basis-versions, strength, ai-runs, run-productions, capture-requests, skills, agent-worker) and **the layer 7–11 entries** (intent, reevaluation, publication, conformance, actions, standards, monitoring, the queue, instance-setup and control-plane extractions): `draft-T10.md`. They read the helpers and contracts T9 builds.
- **Still waiting**, as T8's plan says: N22, N26, N30, N31 (N14: `tools/` has not retired), N34's remainder, N75's deployed measurement, DIST-14, N137, N136.
- **N211, N221, N249's catalogue share:** the copies of `checkCaseDocument` and `checkPublishedExtension` retire only once promotion, affordances and ai-runs stop importing them; promotion cannot import ratification (it is earlier), so this needs its design first (T10).
- **N217:** ruled (K275); its sites are in layers 7–9 (T10).
- **N241:** Bob's (legacy-ui and the six new types).
