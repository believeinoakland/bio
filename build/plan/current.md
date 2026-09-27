# Plan: tranche T4

**Status** · OPEN. Opened by BOB #44, 2026-09-27 ~01:55 UTC (PROCESS-MECHANICS §5), from the plan BOB #42 and BOB #43 prepared, after the K111 revision was certified (D6; K112–K113). Branch `tranche/T4` starts at the commit that opened this plan. Bob's meter at the opening: not given (asked). BOB's session: `session_01PcJjeNeDjQeced6Yphu5r9`

Three layers, lowest first (P10): layer 1 (the `pdf-worker` split, K70/K114, and `legacy-checks`' catalogue rows), then layer 3 (the capture layer's extractions), then layer 11 (`legacy-index`, `legacy-tests`). Each job writes requirement-named tests for every live id at its interface (P7).

## Layer 1

Four jobs, concurrently. The split's files all stay in `pdf-worker/`, owned file by file (K114): each job runs its own module's tests by file, never `npm test` there. **Sequencing inside the layer (BOB's, K115):** `image-codecs` creates `ccittdecode.mjs` (a copy of the CCITT block of `pagepixels.mjs`, which it may not edit) and adds the JPX memory refusal key, then records completion; BOB merges it early (mechanics §4) and sends `pdf-pixels` a CHANGE; `pdf-pixels` then removes its own CCITT block, imports `ccittDecode` from `image-codecs`, and maps the new JPX key.

**legacy-checks**
- N44 · catalogue rows for membership's new refusal codes (R10, R29, R62 and the others MEMBERSHIP #1's record lists), each with a check id and translation.
- N36 · promotion's `EXISTS` and `ABSENT` rows.

**image-codecs**
- T4-0a · Requirement-named tests at the interface for every live id (R1–R9), written from the fixtures' raw streams and reference hashes in `pdf-worker/test/codecs/`; `ccittdecode.mjs` created as K115 says.
- N34 · A declared refusal (a `JPX_REFUSES` key) for a JPX decode that would exceed the isolate's memory, with the bound measured; then the low-memory wavelet it defers, if it fits the job.

**pdf-pixels**
- T4-0b · Requirement-named tests for every live id, R41 included; after the CHANGE, the CCITT block removed and imported from `image-codecs` (K115); the JPX memory refusal mapped into `REFUSALS` (R25's mapping, total over both codecs' refusal sets).

**pdf-worker**
- T4-0c · Requirement-named tests for its live ids, R41 included; `structure.test.mjs` split so it reads only this module's files (R38 per module; the architecture check reads its imports of `pagepixels.mjs` and `imagecrop.mjs` as failures today); the bundle regenerated and verified by BOB at the layer's close.

## Layer 3

Layer 3: the capture layer, extracted from `legacy-store` and `legacy-index` (and `legacy-checks` where a map says so), each by its target module's job (mechanics §12.2), all four concurrently (P10), in the layer's order `host-governor`, `provenance`, `capture-sources`, `capture`; a user builds against its provider's Provides and merges the tranche branch when BOB sends a CHANGE after the provider's early merge. Bob approved the four requirement sets on 2026-09-26 (K67). Each job writes requirement-named tests for every live id at its interface (P7). Maps: `build/extraction/<module>.md` (in preparation, P18).

**host-governor**
- T4-1 · Extract the module per its map and requirements (K47); requirement-named tests for every live id.
- N25 · `governedFetch` and the ops `governorstate` and `governorconfig` move from `index.mjs` (the fetch and user agent passed in by the caller).
- R3, R12 · the negative-appetite and stored-appetite defects, fixed in the extraction (K47).

**provenance**
- T4-2 · Extract the module per its map and requirements (K49, K59); requirement-named tests for every live id.
- R12 (D-580, K49), R21–R22 (REC-158), R24 (D-177), R25 (D-693), R26 (D-709), R29–R30 (REC-225), R47 (K49): the carried rows its requirements mark not yet met; built work for D-177, D-693, D-709 on the snapshot (`land/worker/<row>`), judged against the requirements.
- R34 (K59): the instance signing key for its own receipts, held as a secret, replaceable by the operator.

**capture-sources**
- T4-3 · Requirement-named tests for every live id; R36 (the CDX `urlkey`, K48), R54 (the render locale from the profiles, K48), R26 (D-570's quiet-window class, K48). R37 (Memento) stays unscheduled (K48).

**capture**
- T4-4 · Extract the module per its map and requirements (K48, K49, K58); requirement-named tests for every live id. The capture requests stay in `legacy-store` for `capture-requests` (K58); `capture` keeps the trusted in-process arm.
- D-701 (K76): `op=links` and `navchanges`, as capture's map places them.
- R17 (N3, N10), R18 (D-698), R20 (K60, co-attestation at every capture), R28–R29 (D-340, D-702), R11 and R42 (K49: the reading block moves to `extraction`, not here), R41 (K48): the rows its requirements mark not yet met; built work for D-340, D-698, D-702 on the snapshot, judged against the requirements.
- K98, K99 · the doorbell: R47–R53 (tests), R54 (bytes before the row), R55 (the compute-measurement registration), R56 (a keyed source fingerprint); C-85 stays in `legacy-checks` (K72 (1)).

## Layer 11

**legacy-index** (layer 11, K53)
- N43 · route membership's five new ops. Also N12, N19, N21 where their modules have landed.


**legacy-tests** (layer 11, after layer 3, K53)
- T4-5 · Re-anchor or retire every old-battery test layer 3's extractions break (each job's REPORT), first the seven that read `host_governor`'s DDL in `schema.mjs` (K72 (3)).


**Not in T4:** D-593, D-694, D-724 go with `extraction` (K49, layer 4); D-581, D-582, D-584 with `capture-requests` (K58, layer 6).

## Job sessions
