# Plan: tranche T3

**Status** · OPEN. Opened by BOB #42, 2026-09-26 ~18:25 UTC (PROCESS-MECHANICS §5), from the plan BOB #40 and BOB #41 prepared. Branch `tranche/T3` starts at the commit that opened this plan. Bob's meter at the opening: the weekly quota 0% used at 18:13 UTC (a $250 credit drained by 2026-09-26's earlier work). BOB's session: `session_01LM8ikCqJDLwMhvuHS6F78s`

Layer 2: the first extractions from `legacy-store`, each by its target module's job (mechanics §12.2), bottom-up within the layer's order: `record-core`, then `membership`, then `promotion`, which use each other in that order. All three jobs run concurrently (P10); a user builds against its provider's Provides and merges the tranche branch when BOB sends a CHANGE. Each job writes requirement-named tests for every live id at its interface (P7). Bob approved the three modules' requirements on 2026-09-26 (K56). The extraction rule was fixed and certified before T3 opened (mechanics §12.2, D4, civicos-process `0a0e513`): a job may rewire the legacy code that called what it moves, and BOB reads every `ADDED` line the ownership check lists at the layer close.

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
- T3-4 · Bring the old battery green on the tranche: N32 first (39 harnesses red since T2), then N14, N15, N20, N23, N24, N29, N31 (its share), N33; each red test is fixed, re-anchored, or retired with the code it anchors on, never skipped.

## Job sessions (layer 2, started 2026-09-26 18:16 UTC)

| module | session | title |
| --- | --- | --- |
| record-core | `session_0128RDfHecKMSruEijV3kfAe` | RECORD-CORE #1 |
| membership | `session_01LSy7nZpkVyvEV81G4a5SYA` | MEMBERSHIP #1 |
| promotion | `session_01LPQSJzgT8fbw2kcionFsh3` | PROMOTION #1 |

## The entries named above

- N8 · 2026-09-25 · **promotion**: BOB #37 ruled that check C-18.8 (release-signature primitives, a second hand-written SSHSIG verifier in `bio-checks.mjs`, kept only for the Apps Script gate, which `gate.mjs` records as decommissioned) moves to `promotion`, which checks release records in bundles, and verifies through `signatures` instead. The duplicate verifier is retired.
- N14 · 2026-09-26 · **legacy-tests**: 60 imports by the old battery of the old process's tooling (`tools/`, 28 files), and `civicos-ui/check-semantics.mjs`'s import of `tools/bundle-docprofile.mjs`. Those tests and that check retire with the tooling they test, or take what they need into product. Found by the architecture check.
- N15 · 2026-09-26 · **legacy-tests**: `bio-plane/test/subresources.test.mjs` fails 2 of 357 by design since T1's `subresources` job met R17 (D-603): line ~330 asserts `fetched_at` on every record (the defect; check `considered_at`, or `fetched_at` only on issued fetches), and line ~487 expects 21 outstanding where a refused reference now makes 22. Update or retire the two assertions. Reported by SUBRESOURCES #1, confirmed by BOB #40.
- N17 · 2026-09-26 · **promotion**: the refusals `CAS_STALE`, `EXISTS` and `ABSENT` carry no check id or translation, though the catalogue has a row for `CAS_STALE`. Found by the promotion review.
- N18 · 2026-09-26 · **membership**: build the canon rules the review found unbuilt (requirements R10 resignation §4.5, R11 hosting-access record §4.8, R18 roster projects §7.8, R19 pairing publication §3) and fix the defects it found (R29 a member credential's principal is its minter; R39 an owner added only when joined; R42 carried owner votes kept and read, §7.10, §7.13).
- N20 · 2026-09-26 · **legacy-tests**: `bio-plane/test/textshown.test.mjs` reads `PdfDoc._pageOrder`, now private (pdf-reader K28); use `pageCount`/`pageDict`. Reported by PDF-READER #1.
- N23 · 2026-09-26 · **legacy-tests**: `nc-rec203.mjs`'s negative-control anchors no longer match the rewritten `idspaces.mjs` (N2), so its arms do not arm; re-anchor or retire it with the old interface (N6). Reported by ID-SPACES #1.
- N24 · 2026-09-26 · **legacy-tests**: `bio-plane/test/signpage.test.mjs` (line ~38) and `fleetbundles.control.mjs` arm (7) read `tools/sign-release.html`; point them at `bio-plane/src/sign-release.html` (K33), after which BOB removes `tools/sign-release.html` (K46). Reported by SIGNATURES #1.
- N29 · 2026-09-26 · **legacy-tests**: `bio-plane/test/formats-odf.test.mjs` asserts the D-346 defect (13 assertions: the two `outside_content_xml_not_read` markers, no `core-properties`, the "no intra" note) and fails them since T2's `odf-reader` met R29; the snapshot's version at `96eeb2d5` passes 171/0. Take it, and re-baseline `nc-coff11.mjs`. Known red on `main` until then, as N15. Reported by ODF-READER #1.
- N32 · 2026-09-26 · **legacy-tests**: 39 harnesses copy a fixed directory list (or `git archive` those paths) into a sandbox without `jurisdictions/`, so loading `docprofile` fails ENOENT; add the directory to each (the script is in `build/jobs/T2/docprofile.md`, "Found in other modules"; applied there, all 39 pass). `civicos-ui/check-semantics.mjs`'s flattened copy is stale (with N14). Reported by DOCPROFILE #1.
- N33 · 2026-09-26 · **legacy-tests**: `fleetbundles.test.mjs` line ~182 pins ocr-worker's build inputs to the pre-D-622 list; the build now also reads `pdf-worker/src/jbig2decode.mjs`, `jpxdecode.mjs` and `mq.mjs`. Update the pinned list (every verifying arm passes: 95/1 at T2's close). Found by BOB #41 at the close.
- N10 · 2026-09-25 · **record-core**, **installer**, **instance-setup**: the instance holds the list of its active jurisdiction profiles as a setting, and the installer offers the choice. Rule 2 of "No jurisdiction in the product".
- N16 · 2026-09-26 · **promotion**, **publication**: `forkProject` and project name uniqueness (C-77, with canon §7.1's NFC normalisation) move from the store to `promotion`; `exportManifest`, `exportLog` and `export_log` move to `publication` (K31). BOB writes their requirements before each module's first job.
- N31 · 2026-09-26 · **bundler**, **legacy-tests**: `fleet-bundle.mjs`'s remedy text names `node tools/bundles.mjs`, and `fleetbundles.test.mjs` arm (j) asserts it; change both together when `tools/` retires (N14). Also red before T2 and unchanged by it, found by BUNDLER #1: `owed-controls.test` (2 fail), `provenance-floor.control`, `walkfloor.control`, `d301-census.control`; root-caused by the `legacy-tests` job.

(N10, N16 and N31 are shared with later modules: only the share of a T3 module applies here; each stays in `next.md` for the rest.)
