# content — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `bde7923` (after record-core's early merge) by a drafting worker for BOB #42 (P18). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (53,685 lines), `schema.mjs` (4,180), `checks/bio-checks.mjs` (16,591) and `index.mjs` (13,438) at that date; the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/content.md` (R1–R40); K23, K31, K49, K61 and K70 apply. The module exports `contentOf(ctx)`, its one instance per Durable Object `ctx`, reaching `record-core`, `membership`, `provenance` and `extraction` through their factories on the same `ctx` (K61); `legacy-store` delegates to it. `from` should read `["legacy-store", "legacy-checks"]` (K64's pattern): the extent grammar and the C-45, C-52 and C-80 rows are in the catalogue. Nothing moves from `index.mjs` (§2). Written beside the parallel `extraction` drafts (uncommitted, same date); §5.1 reconciles them.

## 1. What moves to `content`

All in `store.mjs` unless named otherwise.

| what | where today | lines | moves |
| --- | --- | --- | --- |
| REC-82 writer header, `#captureForContent` | store.mjs | 20836–20918 | yes, as `captureFor` (R11); its "earliest" becomes `provenance.capturesOf` (D-580, K49) |
| `#contentPlanFor`, `#contentRowFor`, `#contentLegRefusals` | | 21269–21439 | yes, as `citationRefusals` (R27), taking citations rather than legs |
| `mintContent`, `contentMint` | | 21441–21594 | yes (R12–R16) |
| REC-87 header, `#transcriptionAttestExtent`, `#transcriptionsOver`, `#transcriptionCovering`, `#transcriptionStanding` | | 21596–21699 | yes (R21) |
| `TRANSCRIPTION_MAX_BYTES`, `transcribe`, `#transcriptionOf`, `transcriptionAttest`, `transcriptionRead` | | 22476–22699 | yes (R23–R26). `CAPTURE_TEXT_UNIT_CAP` (779) is shared with the unit index and testimony: `extraction` exports it, or a copy |
| `#contentStandings`, `#markContentStale`, `#mintLabel`, `contentRow`, `#contentTarget`, `#attestationsOver`, `#attestationShape`, `#contentStanding`, `#contentEarned` | | 23909–24327 | yes (R16, R19–R22); `#contentEarned` becomes `standings` without the connection axis (R20); `#attestationsOver` reads `text_attestations`, `extraction`'s (§5.1) |
| `contentRead` | | 24378–24479 | yes (R17–R19) |
| `VERSION_NOTICE_ADDRESSES_MAX`, `VERSION_NOTICE_STATES`, `#extentBoundUnheld`, `#extentTestAcross`, `VERSION_NOTICE_GRADES`, `VERSION_NOTICE_SIMILAR`, `#indexStateOf`, `#unitsOf`, `#bagOf`, `#dice`, `#gradeAcross`, `#capturedAddresses`, `#versionNoticeFor` | | 40324–40682 | yes, as `passageNotice` (R29–R31). `#indexStateOf` reads `observation_log` and `#unitsOf` `capture_text`, both through `extraction`. `#capturedAddresses` reads `captured_locators` (provenance's, K49) and is shared with IS-6's `#independenceOf`, which `independence.test.mjs` pins to one walk: it becomes a `provenance` read both call |
| `TEXT_SOURCE_LIMIT_DEFAULT/MAX`, `CONTENT_READ_PARAMS`, `CONTENT_EARNED_MAX` | | 45032–45067 | yes; `extraction` keeps its own text-source pair. `LEG_BACKFILL_MAX` (45068) goes with the backfill (§2) |
| dispatch: `content`, `contentmint` | | 52332–52359 | yes (K3) |
| dispatch: `transcribe`, `transcriptionattest`, `transcription` | | 52830–52846 | yes |
| migration: `content.cited_as` | | 1278 | yes, with the table |
| `CONTENT_MINTED_BY_PLANE`, `CONTENT_MINT_STATES`, `contentMintState`, `isMachineMinted` | bio-checks.mjs | 1966–2029 | yes (R16). `isMachineIdentity` stays in `legacy-checks` |
| `CONTENT_EXTENT_KINDS`, range helpers, `contentCitedAs`, `CONTENT_EXTENT_CHECKS` (C-45), `legExtent`, `legHasAuthoredExtent`, `legContentId`, `canonicalExtent`, `describeExtent`, `extentRelation` | bio-checks.mjs | 12963–13686 | yes (R1–R7, R38); `legExtent`/`legContentId` become `citationExtent`/`citationContentId`. C-45.7–C-45.10 (the cite act's rows) go to `inquiry` with `cite` (§2) |
| `TRANSCRIBE_CHECKS` (C-52) | bio-checks.mjs | 13768–13850 | yes (R23–R26, R38) |
| `VERSION_NOTICE_CHECKS` (C-80) | bio-checks.mjs | 14948–15004 | C-80.3 here (R29); C-80.1 and C-80.2 with the op to `reevaluation` (§2) |
| `checkContentExtent`, `imagePartUndetermined`, `imagePageUndetermined`, `mintUndetermined` | bio-checks.mjs | 15440–16009 | yes (R7, R8) |
| `contentIdFor` | bio-checks.mjs | 16567–16591 | yes (R3); `sha256HexSync` and `canonicalJson` stay shared in `legacy-checks` |

**Schema (K4).** `content` with its seven indexes (schema.mjs 3184–3320), `transcriptions` and `transcription_attestations` (3559–3602). All carry `bundle_id`; today they are in `legacy-store`'s `declarePurge` list (store.mjs 866–871), from which the job removes them when `content` declares its own (R39, K23).

**Checks it needs and does not take:** C-35.10 and C-35.11 (`text-chain`'s, through `checkAttestation`), `isMachineIdentity`, `canonicalJson`, `sha256HexSync`.

**Measured size:** store.mjs 1,710 (895 code), bio-checks.mjs 1,523 (745), schema.mjs 183 (43): about 3,420 lines, about 1,680 of code.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | lines | goes to | why |
| --- | --- | --- | --- | --- |
| `attestText`, `attestationsFor`, `text_attestations`; the context readers `#persistedReading` … `#containerKindOf` with `contentContextFor`; dispatch `textattest`, `attesttext` | store.mjs 20745–20835, 20919–21268, 52415–52431; schema.mjs 2858–2894 | 429 + 38 | `extraction` (its draft's R30, R36–R38) | they read the reading; `content` calls them (§5.1) |
| the D-394 header, `VERSION_NOTICE_LEGS_MAX`, `versionNotice` (the op, both subjects, and the question arm over `inquiry_basis`); dispatch `versionnotice`; C-80.1, C-80.2 | store.mjs 40266–40323, 40683–40750, 52648–52655 | 134 | `reevaluation` | the question arm reads `inquiry_basis` (layer 6), which `content` may not; REC-222 and REC-223 (push, adopt, keep) are already carried there. It calls R29 per passage |
| `ensureLegContent`, `#backfillLegContent`, `LEG_BACKFILL_MAX` | 23849–23907, 24329–24376, 45068 | 107 | `inquiry` | they read and write `inquiry_basis`; they call R28 |
| the leg loops in `promote`: the leg-content refusals (18567–18568, 18918–18919), the basis projection that mints or carries a row per leg (19337–19459), the version-leg projection (19494–19566) | inside `promote` | — | `inquiry`, `basis-versions` | registered with promotion as checks and projections (K31), calling R27–R28. The carry-forward of a prior row (`priorContent`) is how a re-promotion keeps a member's reference, and belongs with the edge |
| `cite` (from 13914; its REC-220 pin at 14381, 14412) and C-45.7–C-45.10 | store.mjs; bio-checks.mjs inside 13098–13310 | — | `inquiry` | the act that writes a leg |
| `#narrowSource` (14664), `narrowCandidates` (14827), `narrow` (15623); `NARROW_CHECKS` (C-50) | store.mjs; bio-checks.mjs 13687–13766 | — | `basis-versions` | a narrow writes a new basis version |
| the stale mark's call beside the reading rebuild in `promote` | 20056 | 1 | `extraction` calls `markStale` through its `onReading` (its R24) | `extraction` is earlier, so it offers the notice and `content` registers (K31's pattern, as provenance's `onReceipt`) |
| testify's content mint | inside `testify` (22401, 22424) | — | a projection `content` registers for an authored register row | provenance's Suggestion ("Testify's later work") |
| `#mintsBound`, `extractPropose` (23557), `extractProposals` (23767); `proposed_readings` | 23518–23848 | 331 | `ai-runs` | they read `ai_runs` and `ai_run_bounds` (layer 6); they call R11 and R12. The `extraction` draft agrees |
| `#missingCauseFrom` (45355), `#missingContentCause` (45396), `contentAxis` (45456), `#frontierContent` (45942) | store.mjs | — | `observation-log` or `retrieval` (the `extraction` map says `retrieval`) | they read `observation_log`, layer 5 |
| `idMatch` (REC-203) | 23393–23517 | — | `entities` | an identifier judged under Framework §8.3; the only use of `id-spaces` near this code |
| `connectionGradeForContent` (26800), `connectionsFor` with `contentId` (26688) | store.mjs | — | `connections` | a portion's connection grade (C-49, C-74) |
| `index.mjs`: the OPS lists (2076–2212), `READING_READS` (1690), the viewer gates (11932, 11996, 12052, 12128, 12166) and author stamps (12357–12383, 12471) of these ops | index.mjs | — | `control-plane` | routing, authentication and stamps stay there (K3); nothing moves from `legacy-index` |

## 3. Callers to rewire

Each calls a moved method or reads a content table today, and calls `contentOf(ctx)` after.

- `contentRow`: `#narrowSource` (14711), `narrow` (15680, 15848).
- `mintContent`: `promote` (19409, 19566), `testify` (22424), `extractPropose` (23699, 23900).
- `#captureForContent`: `cite` (14381, 14412), `transcribe` (22516), `extractPropose`; becomes `captureFor`.
- `#contentEarned`: `earnedBasisRegistry` (27893) → `standings`, plus `connections`' portion grade.
- `#contentStandings`: `promote`'s projection (19459).
- Direct SQL on `content`: `#searchedForCase` (10223), `#contradictionExtent` (15126, 15168), `#contradictionLadder` (15297–15303), `#candidateSide` (15490), `#leadReferentVisible` (23003), `#themeTarget` (23169), `extractProposals` (23830, 23834), `connectionGradeForContent` (26813), `#legVersions` (39112), the stats counts (32186, 32193). Each takes `contentRow`/`standings`, or a read `content` adds for it (a stale count per bundle, the rows of a capture), or a stated read contract on `content.content_id`/`bundle_id` (as record-core R37 does for `bundles`); the job proposes which, through BOB.
- `transcriptions` is read only inside the moved code.

## 4. Old-battery tests that anchor on the moved source

Negative controls that patch the text of moved code, so they move or re-anchor with it (a `legacy-tests` entry, K53): `nc-rec83.mjs`, `nc-rec84.mjs` (`#contentLegRefusals`, `#contentRowFor`, C-45 rows), `nc-rec85.mjs`, `nc-fw19.mjs`, `rec85-arm-digest.mjs`, `fw19-rec85-digest.mjs` (the extent grammar in bio-checks), `nc-rec87.mjs` (transcribe), `nc-sk7.mjs` (`contentMint`, `#contentStanding`; also `attestText`, extraction's), `nc-rec97.mjs` (`#contentLegRefusals`, `legExtent` beside `cite`), `nc-rec104.mjs` (`chain_kind` in schema.mjs), `nc-d394.mjs` (the notice, split with `reevaluation`), `nc-d420.mjs`, `nc-mk2.mjs`; `nc-cap9.mjs` and `nc-cap12.mjs` patch the context readers and follow `extraction`. `hygiene.test.mjs` (purge tables, D-113) and `identity-claims.test.mjs` with `scripts/identity-claims.mjs` (the stamped authorship of `contentmint` and `transcribe`). Suites that drive the behaviour through the plane and follow the module as its tests: `content-arm`, `content-chain-kind`, `content-extent`, `content-extent-arms`, `content-extent-leg`, `content-machine-mint`, `content-reads`, `cite-extent`, `cpdf18-pdf-images`, `d420-image-page`, `d440-image-part`, `fw19-extent-arms`, `transcribe`, `versiongrade`, `versionnotice` (with `reevaluation`), `rec121-chain-bytes`, `rec127-cap-bytes`, `rec220-version-pin`, `bounds`, `project-sight`. `content-index-probe.mjs` is a measurement instrument (D-699, dropped).

## 5. Undetermined, conflicts, and code others could claim

1. **Overlap with the `extraction` drafts, resolved in their favour.** They claim `attestText`, `attestationsFor`, `text_attestations` and `contentContextFor` with its readers (requirements R30, R36–R38, including R37, the viewer fix this reading found too: `attestText` takes no viewer); this draft's first version claimed them as well and now uses them instead, since they read the reading and `content` is later in the order. `content` needs from `extraction`: `contentContextFor`; the attestations over a set of captures (for `standings`: `#attestationsOver`, placed here by the extraction map, reads `text_attestations` in SQL, which wants either an `extraction` service or a stated read contract); a capture's text units and unit-index state (R31); `onReading` (R22); and `CAPTURE_TEXT_UNIT_CAP`. BOB settles the attestation read.
2. **Uses.** `modules.json` gives `content` `id-spaces`, `pdf-worker` and `capture`, and omits `text-chain`. The moved code calls `text-chain` (R12, R14, R21, R25) and neither `id-spaces` (only `idMatch`, §2) nor `capture`; `format-registry` leaves with the context readers. `pdf-worker` becomes `pdf-pixels` (K70) for the crop (R32). Proposed: add `text-chain`, drop `id-spaces` and `capture` unless BOB places `idMatch` here.
3. **D-580 and REC-220 together.** Since REC-220 a new leg is pinned at the act, so D-580's order (R11) matters for older legs and for `contentMint`, `transcribe` and `extractPropose`, which pass no capture.
4. **Shared catalogue objects.** C-45 is shared with the cite act (`inquiry`) and C-80 with `reevaluation`'s op; each is one object in `bio-checks.mjs` today and is split by the first job to move, numbers unchanged.
5. **Standing text.** `#contentStanding`'s portion connection says `READING_POSITION_ABSENT` (readings carry no position), stale since FW-17; it leaves with the connection axis (R20).
6. **Branches.** D-374, D-419, D-670, D-675, D-686, D-710 and REC-204 are built on `land/worker/*` at the tips `index.csv` names; `text-chain.chainKindFor` (D-723) is already on this branch and unused by the store.
7. **Other claimants.** `extraction`: `capture_text` and the unit reads R31 uses, the context and the attestations (item 1). `provenance`: the first-held order R11 uses (K49) and `#capturedAddresses`. `reevaluation`: the notice op. `inquiry`/`basis-versions`: the leg-side resolve and carry-forward. `ai-runs`: `extractPropose`. `observation-log`/`retrieval`: `contentAxis`. `connections`: the portion connection grade. `capture`: nothing; the container extent persisted at acquire reaches `content` through `extraction`'s reading (K49).
