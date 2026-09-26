# Plan: next tranche

**Status** · Entries that arose after the T5 triage, awaiting the tranche they join (PROCESS-MECHANICS §5). The carried rows of the old plan are listed in `docs/development/transition/old-plan/index.csv` and join T8's first plan there. Grouped by module, modules by layer.

## Layer 1

**jurisdictions**
- N1 · 2026-09-25 · Create the module and its first profile, Oakland and Alameda County, holding every local fact now in code: identifier spaces and forms, publishing systems, coverage floors, recogniser vocabulary, default search terms, each with its measurement. Rule: `layers.md`, "No jurisdiction in the product".

**id-spaces**
- N2 · 2026-09-25 · Take identifier spaces, systems and floors from a profile. Rename the spaces for any jurisdiction (`enactment`, `project`, `fund`, `parcel`), per `requirements/id-spaces.md`.

**docprofile**
- N3 · 2026-09-25 · Move the Oakland council headers, municipal-code citation patterns and other local vocabulary (12 files) into the profile. The recognisers match whatever the active profiles supply.

**signatures**
- N7 · 2026-09-25 · BOB #37 ruled: the signing page's source (`tools/sign-release.html`) and its generator (`bio-plane/scripts/embed-signpage.mjs`) move into `signatures`, which serves the page, so the module's own tests can check that the page it serves is the current render. `modules.json` gains the two paths when the files move.

**pdf-worker**
- D-622 · 2026-09-26 · Decoders for JBIG2 and JPX image-only pages (old-plan row D-622), held out of T1 as too large for the certification run. (N9 moved to T1.)

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

- N8 · 2026-09-25 · **promotion**: BOB #37 ruled that check C-18.8 (release-signature primitives, a second hand-written SSHSIG verifier in `bio-checks.mjs`, kept only for the Apps Script gate, which `gate.mjs` records as decommissioned) moves to `promotion`, which checks release records in bundles, and verifies through `signatures` instead. The duplicate verifier is retired.

- N4 · 2026-09-25 · `store.mjs` `readingNamePlan` defaults its search terms to "oakland": take them from the active profiles. The owning module is confirmed at extraction.
- N5 · 2026-09-25 · **installer**: the outward text names CivicOS and the installing group. Believe in Oakland appears only as the release's publisher and signer. The example group name is not a place.
- N6 · 2026-09-25 · **entities**: `op=idmatch` takes the renamed spaces (N2), passes the combined profile view, and passes each end's addresses from the record. **affordances**: `idmatch`'s outward text names no local system (it says "C.M.S.", "APN" and "Legistar's floor" today).
- N10 · 2026-09-25 · **record-core**, **installer**, **instance-setup**: the instance holds the list of its active jurisdiction profiles as a setting, and the installer offers the choice. Rule 2 of "No jurisdiction in the product".
- California's records law as a kind name (`cpra_request`) and in outward text is carried as old-plan row REC-201 against `actions`; the profile's `records_laws` section is where the law's name comes from.

## Tranche T2, prepared (P18): ready to open when T1 closes

Every remaining layer-1 module. Each job also writes requirement-named tests for every live id, so the coverage check passes (P7). Within the layer, `jurisdictions` provides the profiles `id-spaces` and `docprofile` use (N1–N3, N11), so its branch merges into the tranche as soon as it completes (mechanics §4). Built work named in a row sits on the snapshot branch and is judged against the requirements at the job. The layer-1 entries listed above in this file (N1–N3, N7, N11, D-622) are T2's too.


**jurisdictions** (30 ids)
- T2-1 · Requirement-named tests for every live id.

**test-support** (9 ids)
- T2-2 · Requirement-named tests for every live id.

**bundler** (10 ids)
- T2-3 · Requirement-named tests for every live id.

**runtime-limits** (25 ids)
- T2-4 · Requirement-named tests for every live id.

**signatures** (29 ids)
- T2-5 · Requirement-named tests for every live id.

**id-spaces** (25 ids)
- T2-6 · Requirement-named tests for every live id.

**office-readers** (25 ids)
- T2-7 · Requirement-named tests for every live id.
- D-415 · A WORKBOOK'S `sheet-range` UNITS ARE WHOLE SHEETS ONLY: `formats-xlsx.mjs` turns `definedNames` into anchor links and emits one `usedSheetRange` per sheet; table parts and ODF named ranges are not read. — owner COFF. Built work: `land/worker/D-415` @ 48245247, judged at the job.
- DIST-14 · THE CSV SIZE BOUND (20 MiB, reused from COFF-6) IS NOT SETTLED: node measured 254.5 MiB of heap at the bound against Cloudflare's documented 128 MiB isolate (their claim), and local workerd walked a 73.6 MB body without the production cap a

**odf-reader** (43 ids)
- T2-8 · Requirement-named tests for every live id.
- D-612 · EVERY REAL GOOGLE DOC EXPORT EMBEDS `Fonts/fontN.ttf`, REFERENCED BY `svg:font-face-uri`, AND D-351's MEMBER RULE REFUSES THOSE REFERENCES, so the .odt digest reads UNDETERMINED on ALL 8 real Docs (M-167) and the monitor's false "changed" a Built work: `land/worker/D-612` @ f2dcbc6c, judged at the job.
- D-346 · THE THREE OPENDOCUMENT ENTRIES EMIT NO `core-properties` AND NO `intra` LINK: `odf.mjs` never reads `meta.xml` or the manifest and says so with `outside_content_xml_not_read` markers, while Content Framework §16 says the formats "preserve t Built work: `land/worker/D-346` @ 96eeb2d5, judged at the job.

**format-registry** (27 ids)
- T2-9 · Requirement-named tests for every live id.

**text-chain** (86 ids)
- T2-10 · Requirement-named tests for every live id.
- D-633 · WHEN TIER 2 WINS A PAGE, `mergeTier2Text` REPLACES ITS MARKERS, SO D-627's `image_content_unread` IS LOST AND THE PAGE ROUTES NOWHERE. Reproduced through op=acquire with an answering tier-2 stub (the held INFO-2026-0301 does not escalate, s Built work: `land/worker/D-633` @ cbc5ae9b, judged at the job.
- D-723 · A PAGE TWO PARTS SHARE (D-635: folio from the text layer, OCR transcription appended) READS `ocr` — the part appended last — though BOB #35's 09:35Z rule makes a unit covered by steps of different kinds `mixed`; the record calls the text-la Built work: `land/worker/D-723` @ fe2b9a6d, judged at the job.
- D-416 · A READING POSITION CANNOT FALL INSIDE A `sheet-range` EXTENT: `readingPositionInExtent` (`textchain.mjs`) returns false whenever the reading's arm and the extent's differ, so a cell reading never earns the connection its range should. The i

**docprofile** (35 ids)
- T2-11 · Requirement-named tests for every live id.

**ocr-worker** (21 ids)
- T2-12 · Requirement-named tests for every live id.
