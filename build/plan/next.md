# Plan: next tranche

**Status** · Entries that arose after the T5 triage, and those left when T2 opened, awaiting the tranche they join (PROCESS-MECHANICS §5). The carried rows of the old plan are listed in `docs/development/transition/old-plan/index.csv` and join T8's first plan there. Grouped by module, modules by layer.

## Later layers

- N12 · 2026-09-26 · **legacy-index**: `bio-plane/scripts/deploy.mjs` and `resolve-version.mjs` read JSONC through `tools/jsonc.mjs`, which is not product: the reader they need comes into the product (its own small helper, or inside `legacy-index`). `bio-plane/scripts/op-claims.mjs` serves the old process's claims ledger and is removed. Found by the architecture check, 2026-09-26.
- N13 · 2026-09-26 · **affordances**, **queue**: `store.mjs` imports `affordances.mjs` and `queuestate.mjs`, both later in the order. What the store needs from them moves to the module that owns it, earlier in the order, when each is extracted. Found by the architecture check.
- N14 · 2026-09-26 · **legacy-tests**: 60 imports by the old battery of the old process's tooling (`tools/`, 28 files), and `civicos-ui/check-semantics.mjs`'s import of `tools/bundle-docprofile.mjs`. Those tests and that check retire with the tooling they test, or take what they need into product. Found by the architecture check.
- N15 · 2026-09-26 · **legacy-tests**: `bio-plane/test/subresources.test.mjs` fails 2 of 357 by design since T1's `subresources` job met R17 (D-603): line ~330 asserts `fetched_at` on every record (the defect; check `considered_at`, or `fetched_at` only on issued fetches), and line ~487 expects 21 outstanding where a refused reference now makes 22. Update or retire the two assertions. Reported by SUBRESOURCES #1, confirmed by BOB #40.
- N16 · 2026-09-26 · **promotion**, **publication**: `forkProject` and project name uniqueness (C-77, with canon §7.1's NFC normalisation) move from the store to `promotion`; `exportManifest`, `exportLog` and `export_log` move to `publication` (K31). BOB writes their requirements before each module's first job.
- N17 · 2026-09-26 · **promotion**: the refusals `CAS_STALE`, `EXISTS` and `ABSENT` carry no check id or translation, though the catalogue has a row for `CAS_STALE`. Found by the promotion review.
- N18 · 2026-09-26 · **membership**: build the canon rules the review found unbuilt (requirements R10 resignation §4.5, R11 hosting-access record §4.8, R18 roster projects §7.8, R19 pairing publication §3) and fix the defects it found (R29 a member credential's principal is its minter; R39 an owner added only when joined; R42 carried owner votes kept and read, §7.10, §7.13).
- N19 · 2026-09-26 · **legacy-index**: `needsTier3` and `tier3Pages` route a page marked `image_content_unread` (pdf-reader R26) to OCR as they route `no_text_layer`, and `needsTier2` counts it as a scan marker. Built work: `index.mjs` at `land/worker/D-627` @ 056d3092 (14 lines). Reported by PDF-READER #1.
- N20 · 2026-09-26 · **legacy-tests**: `bio-plane/test/textshown.test.mjs` reads `PdfDoc._pageOrder`, now private (pdf-reader K28); use `pageCount`/`pageDict`. Reported by PDF-READER #1.
- N21 · 2026-09-26 · **legacy-index**: pass `ctx.view` (`jurisdictions.combine` of the instance's active profiles) to `docprofile`'s `doctypeFor`, `assess` and `readText`; `docprofile` then drops its no-view fallback (R6, K39). Reported by DOCPROFILE #1.
- N22 · 2026-09-26 · **test-support**: under a non-root user a read-only subdirectory a test leaves makes the sweep's `rmSync` fail (EACCES) and the sandbox leaks (R2); make the tree writable and retry, tested where the job can run as a non-root user. Deferred by TEST-SUPPORT #1: its container runs as root.
- N23 · 2026-09-26 · **legacy-tests**: `nc-rec203.mjs`'s negative-control anchors no longer match the rewritten `idspaces.mjs` (N2), so its arms do not arm; re-anchor or retire it with the old interface (N6). Reported by ID-SPACES #1.
- N24 · 2026-09-26 · **legacy-tests**: `bio-plane/test/signpage.test.mjs` (line ~38) and `fleetbundles.control.mjs` arm (7) read `tools/sign-release.html`; point them at `bio-plane/src/sign-release.html` (K33), after which BOB removes `tools/sign-release.html` (K46). Reported by SIGNATURES #1.
- N25 · 2026-09-26 · **legacy-index**, **host-governor**: `governedFetch` and the ops `governorstate` and `governorconfig` move from `index.mjs` into `host-governor` (K47), the fetch and user agent passed in by the caller.
- N26 · 2026-09-26 · **office-readers**: `.docx` `mc:AlternateContent` fallbacks are read twice; the fix renumbers ¶ references in stored readings, so it lands with a migration of those references. Deferred by OFFICE-READERS #1.
- N27 · 2026-09-26 · **odf-reader**, **office-readers**: the `.ods` half of D-415 (named ranges and tables as `sheet-range` units, as `.xlsx` has by R9/K36); built work on the snapshot (`odf.mjs`); `office-readers` names `rangeUnitFor` and `a1Corner` in its Provides for it. Reported by OFFICE-READERS #1.
- N28 · 2026-09-26 · **legacy-store** (at the extraction of its reader): a page's kind reads `chainKindFor` (text-chain R81), not `terminalStep(chain) || "layer"`. Reported by TEXT-CHAIN #1.
- N29 · 2026-09-26 · **legacy-tests**: `bio-plane/test/formats-odf.test.mjs` asserts the D-346 defect (13 assertions: the two `outside_content_xml_not_read` markers, no `core-properties`, the "no intra" note) and fails them since T2's `odf-reader` met R29; the snapshot's version at `96eeb2d5` passes 171/0. Take it, and re-baseline `nc-coff11.mjs`. Known red on `main` until then, as N15. Reported by ODF-READER #1.
- N30 · 2026-09-26 · **odf-reader**: repeats (`number-rows-repeated`, `number-columns-repeated`, `text:s`, `text:c`) are expanded without a bound, so hostile bytes can hang the reader or end in `reader_failed` instead of a stated undetermined. BOB adds a bounded-expansion requirement (a measured cap, answering undetermined past it) before the job. Deferred by ODF-READER #1.
- N31 · 2026-09-26 · **bundler**, **legacy-tests**: `fleet-bundle.mjs`'s remedy text names `node tools/bundles.mjs`, and `fleetbundles.test.mjs` arm (j) asserts it; change both together when `tools/` retires (N14). Also red before T2 and unchanged by it, found by BUNDLER #1: `owed-controls.test` (2 fail), `provenance-floor.control`, `walkfloor.control`, `d301-census.control`; root-caused by the `legacy-tests` job.
- N32 · 2026-09-26 · **legacy-tests**: 39 harnesses copy a fixed directory list (or `git archive` those paths) into a sandbox without `jurisdictions/`, so loading `docprofile` fails ENOENT; add the directory to each (the script is in `build/jobs/T2/docprofile.md`, "Found in other modules"; applied there, all 39 pass). `civicos-ui/check-semantics.mjs`'s flattened copy is stale (with N14). Reported by DOCPROFILE #1.
- N33 · 2026-09-26 · **legacy-tests**: `fleetbundles.test.mjs` line ~182 pins ocr-worker's build inputs to the pre-D-622 list; the build now also reads `pdf-worker/src/jbig2decode.mjs`, `jpxdecode.mjs` and `mq.mjs`. Update the pinned list (every verifying arm passes: 95/1 at T2's close). Found by BOB #41 at the close.
- N34 · 2026-09-26 · **pdf-worker**: a declared refusal for a JPX image whose decode would exceed the isolate's memory (a single-tile 2550×3300 colour 9/7 image peaks near 130 MB against 128 MB), with the bound measured; then the low-memory wavelet it defers. PPM/PPT JBIG2 decoding waits on an encoder that makes a checkable fixture. `pdf-worker` is 4,075 lines, past the 4,000-line mark (`layers.md`): BOB reviews a split before its next job. Reported by PDF-WORKER #2.
- DIST-14 · **office-readers**: the CSV size bound (20 MiB) is unsettled until measured on a deployed plane (old-plan row DIST-14). Deferred by OFFICE-READERS #1 in T2: it needs a deployment.
- Local facts still in code, reported by JURISDICTIONS #1: `readingNamePlan`'s "oakland" (N4) and `legacy-checks`' `cpra_request` and `governingLawsOf`'s CPRA sentence (REC-201): each extraction reads them from the view.

- N8 · 2026-09-25 · **promotion**: BOB #37 ruled that check C-18.8 (release-signature primitives, a second hand-written SSHSIG verifier in `bio-checks.mjs`, kept only for the Apps Script gate, which `gate.mjs` records as decommissioned) moves to `promotion`, which checks release records in bundles, and verifies through `signatures` instead. The duplicate verifier is retired.

- N4 · 2026-09-25 · `store.mjs` `readingNamePlan` defaults its search terms to "oakland": take them from the active profiles. The owning module is confirmed at extraction.
- N5 · 2026-09-25 · **installer**: the outward text names CivicOS and the installing group. Believe in Oakland appears only as the release's publisher and signer. The example group name is not a place.
- N6 · 2026-09-25 · **entities**: `op=idmatch` takes the renamed spaces (N2) and the view-first services, and `id-spaces` retires its legacy adapter (R26, K35) in the same tranche; `bio-plane/test/rec203-idspaces.test.mjs` moves to the new names, passes the combined profile view, and passes each end's addresses from the record. **affordances**: `idmatch`'s outward text names no local system (it says "C.M.S.", "APN" and "Legistar's floor" today).
- N10 · 2026-09-25 · **record-core**, **installer**, **instance-setup**: the instance holds the list of its active jurisdiction profiles as a setting, and the installer offers the choice. Rule 2 of "No jurisdiction in the product".
- California's records law as a kind name (`cpra_request`) and in outward text is carried as old-plan row REC-201 against `actions`; the profile's `records_laws` section is where the law's name comes from.

## Tranche T3, prepared (P18): ready to open when T2 closes

Layer 2: the first extractions from `legacy-store`, each by its target module's job (mechanics §12.2), bottom-up within the layer's order: `record-core`, then `membership`, then `promotion`, which use each other in that order. All three jobs run concurrently (P10); a user builds against its provider's Provides and merges the tranche branch when BOB sends a CHANGE. Each job writes requirement-named tests for every live id at its interface (P7). Bob approved the three modules' requirements on 2026-09-26 (K56). **T3 opens only after the extraction fix is certified** (handoff §6 step 1, P3).

**record-core** (map: `build/extraction/record-core.md`)
- T3-1 · Extract the module from `legacy-store` per its map and requirements (K23, K31); requirement-named tests for every live id.
- K57 · `listByType` (R36), the `bundles` read contract (R37), `evidenceStore()` (R38).
- D-674 · R16, not yet met (see the requirement).
- N10 · The instance's active jurisdiction profiles as a setting (R26); the installer's and instance-setup's shares stay with those modules.

**membership** (map: `build/extraction/membership.md`, in preparation)
- T3-2 · Extract the module from `legacy-store` per its map and requirements; requirement-named tests for every live id.
- N18 · (above) the canon rules found unbuilt and the defects found.
- R62, R63 · Bob's rulings (K56): organisation-wide AI keys by administrators only; an owner's removal reason kept and readable.
- K57 · the map's settled points: R2's check moves into `login()`; R15 returns `expertise`, the `members.expertise` column dropped; R64–R73 stated; `viewerPredicate` takes `GATE_MARK`.
- REC-224, REC-226 · the carried rows its requirements mark not yet met.

**promotion** (map: `build/extraction/promotion.md`)
- T3-3 · Extract `promote` and `reopen` from `legacy-store` per its map and requirements (K31: later modules register checks, projections and facts); requirement-named tests for every live id.
- N8, N16 (promotion's share), N17 · (above).
- R11–R15, R17, R18 · the carried rows its requirements mark not yet met.

**Layer 11, after layer 2 (K53):**

**legacy-tests**
- T3-4 · Bring the old battery green on the tranche: N32 first (39 harnesses red since T2), then N14, N15, N20, N23, N24, N29, N31; each red test is fixed, re-anchored, or retired with the code it anchors on, never skipped.
