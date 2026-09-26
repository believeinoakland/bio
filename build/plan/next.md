# Plan: next tranche

**Status** · Entries that arose after the T5 triage, and those left when T3 opened, awaiting the tranche they join (PROCESS-MECHANICS §5). The carried rows of the old plan are listed in `docs/development/transition/old-plan/index.csv` and join T8's first plan there. Grouped by module, modules by layer.

## Later layers

- N12 · 2026-09-26 · **legacy-index**: `bio-plane/scripts/deploy.mjs` and `resolve-version.mjs` read JSONC through `tools/jsonc.mjs`, which is not product: the reader they need comes into the product (its own small helper, or inside `legacy-index`). `bio-plane/scripts/op-claims.mjs` serves the old process's claims ledger and is removed. Found by the architecture check, 2026-09-26.
- N13 · 2026-09-26 · **affordances**, **queue**: `store.mjs` imports `affordances.mjs` and `queuestate.mjs`, both later in the order. What the store needs from them moves to the module that owns it, earlier in the order, when each is extracted. Found by the architecture check.
- N16 · 2026-09-26 · **promotion**, **publication**: `forkProject` and project name uniqueness (C-77, with canon §7.1's NFC normalisation) move from the store to `promotion`; `exportManifest`, `exportLog` and `export_log` move to `publication` (K31). BOB writes their requirements before each module's first job. *(T3 carries its share for record-core, promotion or legacy-tests.)*
- N19 · 2026-09-26 · **legacy-index**: `needsTier3` and `tier3Pages` route a page marked `image_content_unread` (pdf-reader R26) to OCR as they route `no_text_layer`, and `needsTier2` counts it as a scan marker. Built work: `index.mjs` at `land/worker/D-627` @ 056d3092 (14 lines). Reported by PDF-READER #1.
- N21 · 2026-09-26 · **legacy-index**: pass `ctx.view` (`jurisdictions.combine` of the instance's active profiles) to `docprofile`'s `doctypeFor`, `assess` and `readText`; `docprofile` then drops its no-view fallback (R6, K39). Reported by DOCPROFILE #1.
- N22 · 2026-09-26 · **test-support**: under a non-root user a read-only subdirectory a test leaves makes the sweep's `rmSync` fail (EACCES) and the sandbox leaks (R2); make the tree writable and retry, tested where the job can run as a non-root user. Deferred by TEST-SUPPORT #1: its container runs as root.
- N25 · 2026-09-26 · **legacy-index**, **host-governor**: `governedFetch` and the ops `governorstate` and `governorconfig` move from `index.mjs` into `host-governor` (K47), the fetch and user agent passed in by the caller.
- N26 · 2026-09-26 · **office-readers**: `.docx` `mc:AlternateContent` fallbacks are read twice; the fix renumbers ¶ references in stored readings, so it lands with a migration of those references. Deferred by OFFICE-READERS #1.
- N27 · 2026-09-26 · **odf-reader**, **office-readers**: the `.ods` half of D-415 (named ranges and tables as `sheet-range` units, as `.xlsx` has by R9/K36); built work on the snapshot (`odf.mjs`); `office-readers` names `rangeUnitFor` and `a1Corner` in its Provides for it. Reported by OFFICE-READERS #1.
- N28 · 2026-09-26 · **legacy-store** (at the extraction of its reader): a page's kind reads `chainKindFor` (text-chain R81), not `terminalStep(chain) || "layer"`. Reported by TEXT-CHAIN #1.
- N30 · 2026-09-26 · **odf-reader**: repeats (`number-rows-repeated`, `number-columns-repeated`, `text:s`, `text:c`) are expanded without a bound, so hostile bytes can hang the reader or end in `reader_failed` instead of a stated undetermined. BOB adds a bounded-expansion requirement (a measured cap, answering undetermined past it) before the job. Deferred by ODF-READER #1.
- N31 · 2026-09-26 · **bundler**, **legacy-tests**: `fleet-bundle.mjs`'s remedy text names `node tools/bundles.mjs`, and `fleetbundles.test.mjs` arm (j) asserts it; change both together when `tools/` retires (N14). Also red before T2 and unchanged by it, found by BUNDLER #1: `owed-controls.test` (2 fail), `provenance-floor.control`, `walkfloor.control`, `d301-census.control`; root-caused by the `legacy-tests` job. *(T3 carries its share for record-core, promotion or legacy-tests.)*
- N34 · 2026-09-26 · **pdf-worker** (in T4 by K70): a declared refusal for a JPX image whose decode would exceed the isolate's memory (a single-tile 2550×3300 colour 9/7 image peaks near 130 MB against 128 MB), with the bound measured; then the low-memory wavelet it defers. PPM/PPT JBIG2 decoding waits on an encoder that makes a checkable fixture. `pdf-worker` is 4,075 lines, past the 4,000-line mark (`layers.md`): BOB reviews a split before its next job. Reported by PDF-WORKER #2.
- DIST-14 · **office-readers**: the CSV size bound (20 MiB) is unsettled until measured on a deployed plane (old-plan row DIST-14). Deferred by OFFICE-READERS #1 in T2: it needs a deployment.
- Local facts still in code, reported by JURISDICTIONS #1: `readingNamePlan`'s "oakland" (N4) and `legacy-checks`' `cpra_request` and `governingLawsOf`'s CPRA sentence (REC-201): each extraction reads them from the view.


- N4 · 2026-09-25 · `store.mjs` `readingNamePlan` defaults its search terms to "oakland": take them from the active profiles. The owning module is confirmed at extraction.
- N5 · 2026-09-25 · **installer**: the outward text names CivicOS and the installing group. Believe in Oakland appears only as the release's publisher and signer. The example group name is not a place.
- N6 · 2026-09-25 · **entities**: `op=idmatch` takes the renamed spaces (N2) and the view-first services, and `id-spaces` retires its legacy adapter (R26, K35) in the same tranche; `bio-plane/test/rec203-idspaces.test.mjs` moves to the new names, passes the combined profile view, and passes each end's addresses from the record. **affordances**: `idmatch`'s outward text names no local system (it says "C.M.S.", "APN" and "Legistar's floor" today).
- N10 · 2026-09-25 · **record-core**, **installer**, **instance-setup**: the instance holds the list of its active jurisdiction profiles as a setting, and the installer offers the choice. Rule 2 of "No jurisdiction in the product". *(T3 carries its share for record-core, promotion or legacy-tests.)*
- California's records law as a kind name (`cpra_request`) and in outward text is carried as old-plan row REC-201 against `actions`; the profile's `records_laws` section is where the law's name comes from.

- N35 · 2026-09-26 · **capture-requests** (K58): BOB drafts its requirements from the code (store.mjs ~44550–45440 and the `capturerequest*` ops) and brings them to Bob before its layer's tranche; `capture`'s job keeps only the trusted in-process arm.
- N36 · 2026-09-26 · **promotion** (from `legacy-checks`): catalogue rows for promotion's `EXISTS` and `ABSENT` refusals (N17). (C-18.8's removal moved into T3 by K64.)
- N37 · 2026-09-26 · **query-language**: `viewerPredicate` and `GATE_MARK` become re-exports of membership's (K63).
- N38 · 2026-09-26 · **instance-setup** (K69): the group-identity cluster (C-64) moves here from `legacy-store` at `instance-setup`'s extraction; BOB writes its requirements (the producing group, its history, the domain checks) and brings them to Bob before that tranche.
- N39 · 2026-09-26 · **observation-log**, **ai-runs** (K71): each stops reading `capture_requests` directly and offers a registration `capture-requests` fills (the K31 pattern), at their extractions.
- N40 · 2026-09-26 · **record-core** (K72): `digestCensus` and `snapKeyCensus` (store.mjs ~34223–34300) read only record-core's tables and move to it, with requirements BOB writes first.
- N41 · 2026-09-26 · DONE (K74) · **calibration**, **extraction** (K73): BOB splits `build/requirements/extraction.md` into `calibration.md` and `extraction.md` and adds `calibration` to `modules.json` (layer 4, before `extraction`), before Bob approves either.
- N42 · 2026-09-26 · **text-chain**, **pdf-reader**, **legacy-checks**, **retrieval** (K73): rows routed to extraction touch these first: D-697 and D-635 (text-chain), D-665 (pdf-reader), D-685 (legacy-checks), and D-672 (retrieval), on which D-684, D-685 and D-724 are stacked; each gets an entry against its own module in the tranche before extraction's.
- N43 · 2026-09-26 · **legacy-index**: `index.mjs`'s op table routes membership's five new ops (`adminresign`, `hostingaccessset`, `hostingaccess`, `memberpairingset`, `memberpairings`; N18) with their classes; until then they are unreachable from outside. Reported by MEMBERSHIP #1.
- N44 · 2026-09-26 · **legacy-checks**: catalogue rows for membership's new refusal codes (R10, R29, R62 and the others its record lists), so each carries a catalogue check id and translation instead of `membership.Rn`. Reported by MEMBERSHIP #1.
- N45 · 2026-09-26 · **affordances**: `projectleave` is offered where membership's REC-224 now refuses it (`d311-roster-affordances`). Reported by MEMBERSHIP #1.
- N46 · 2026-09-26 · **legacy-tests** (with N37): `meaningread` and `meaningquery` pin the gate's mint sites in `query.mjs`'s text; re-anchor them when `query.mjs` re-exports membership's `viewerPredicate` (K75).

## Tranche T4, prepared (P18): ready to open when T3 closes

**Layer 1, first (K53, K70): the `pdf-worker` split.** BOB applies K70 to `modules.json` and the requirement files at the opening.

**image-codecs**
- T4-0a · Requirement-named tests at the interface for every live id (the decoders against their fixtures); the CCITT decoder moved into its own file.
- N34 · A declared refusal for a JPX decode that would exceed the isolate's memory, with the bound measured; then the low-memory wavelet it defers.

**pdf-pixels**
- T4-0b · Requirement-named tests for every live id; map the JPX memory refusal into `REFUSALS`.

**pdf-worker**
- T4-0c · Requirement-named tests for its remaining ids; the bundle regenerated and verified at the layer's close.

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
- R17 (N3, N10), R18 (D-698), R20 (K60, co-attestation at every capture), R28–R29 (D-340, D-702), R11 and R42 (K49: the reading block moves to `extraction`, not here), R41 (K48): the rows its requirements mark not yet met; built work for D-340, D-698, D-702 on the snapshot, judged against the requirements.

**legacy-index** (layer 11, K53)
- N43 · route membership's five new ops. Also N12, N19, N21 where their modules have landed.

**legacy-checks** (layer 1, first, K53)
- N44 · catalogue rows for membership's new refusal codes; N36 · promotion's `EXISTS` and `ABSENT` rows.

**legacy-tests** (layer 11, after layer 3, K53)
- T4-5 · Re-anchor or retire every old-battery test layer 3's extractions break (each job's REPORT), first the seven that read `host_governor`'s DDL in `schema.mjs` (K72 (3)).

**Not in T4:** D-593, D-694, D-724 go with `extraction` (K49, layer 4); D-581, D-582, D-584 with `capture-requests` (K58, layer 6).
