# connections — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `7d915799` (after membership's early merge) by a drafting worker for BOB #42 (P18). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (51,006 lines), `schema.mjs` (3,964), `checks/bio-checks.mjs` (16,591) and `index.mjs` (13,438) at that commit; the extraction job confirms them. A method's range runs from the comment block above it to its closing brace. The contract is `build/requirements/connections.md` (R1–R48; themes R39–R48 and parts of R35, R36, R38, added under K77); K3, K6, K23, K31, K61, K64 and K72 (9) apply. The module exports `connectionsOf(ctx)`, its one instance per Durable Object `ctx`, reaching `record-core`, `membership`, `entities` and `content` through their factories on the same `ctx` (K61); `legacy-store` delegates to it. `from` should read `["legacy-store", "legacy-checks"]` (K64's pattern: C-49, C-74, C-81 and the two pair predicates are in the catalogue), with `legacy-index` added only if D-706's viewer stamp lands with this job (§5.3).

## 1. What moves to `connections`

All in `store.mjs` unless named otherwise.

| what | where today | lines | moves |
| --- | --- | --- | --- |
| migrations: `connections.a_ref` … `pair_rule`, `connection_pair_choices.occurrence` | store.mjs | 1255–1282 | yes, with the tables |
| `CONNECTION_DERIVE_DELAY_MS`, `CONNECTION_DERIVE_BATCH`, `#connectionDeriveDelayMs`, `#connectionDeriveBatch`, `#stampConnectionDirty`, `#deriveConnectionsSweep`, `#armConnectionDerive` | | 3258–3335 | yes, as `markDirty`, `wake`, `sweep` (R17, R18). `#armConnectionDerive` does not move: arming is the scheduler's, registered on `entities`' R13 by `legacy-store` until `scheduler` is extracted (K72 (9)) |
| the `connection-derive` consumer entry | | 3457–3471 | no: `scheduler`'s table, calling R18 (§2) |
| `#refEdgeSevered`, `#citesInto` | | 4796–4857 | yes, as `edgeSevered`, `citesInto` (R22) |
| `backlinks`, `danglingRefs` | | 17278–17345 | yes (R20, R21) |
| FW-8 header, `#weakerGrade`, `#PAIR_RULE`, `#pairSelection`, `#connectionView`, `#maxEndsForPairs`, `deriveConnections`, `connectionsFor`, the FW-17 header, `connectionGradeForContent`, the REC-122 header, `#currentPairChoices`, `chooseConnectionPair` | | 26180–27034 | yes (R1–R16). `connectionsFor`'s derivation statement (26577–26587) reads `observation_log` and becomes R5's registered provider (`observation-log`); `deriveConnections`' `#observeConnectionDerivation` call becomes R3's listener |
| `projectLinks` | | 42334–42387 | yes (R24–R29, K23) |
| dispatch: `connect`, `connections`, `connectionchoose` | | 49991–50033 | yes (K3). `meaning-bounds.test.mjs` reads this table positionally: keep the `op: () => this.method(` shape |
| dispatch: `backlinks`, `projectlinks`, `dangling` | | 49756–49759, 50122–50123, 50732 | yes |
| `CONNECTION_PAIR_CHECKS` (C-49), `CONNECTION_CHOICE_CHECKS` (C-74) | bio-checks.mjs | 16077–16225 | yes (R35) |
| `checkConnectionPairCovers`, `checkConnectionMentionUnchosen` | bio-checks.mjs | 16367–16478 | yes (R8). The `refusal` helper they share with C-45 (bio-checks 13284, `CONTENT_EXTENT_CHECKS[key] \|\| CONNECTION_PAIR_CHECKS[key]`) is split at the first of the two jobs to move |
| themes (K77): the D-162 header, `#themeRefusal`, `#themePerson`, `#themeName`, `#themeFor`, `#themeTarget`, `themeDeclare`, `themePlace`, `themePropose`, `#placementView`, `themeRead`, `THEME_READ_LIMIT_DEFAULT` | store.mjs | 22903–23210 | yes (R39–R45, R47, R48). `#themePerson`'s read of `members` becomes a `membership` service (membership map §2); `#themeTarget`'s read of `content` a `content` one (content map §3) |
| `THEME_READ_LIMIT_MAX` | store.mjs | 23214 | yes (R42, R44). 23211–23213 (`LAW_PROPOSALS_READ_MAX`, REC-195) sit between the two limits and do not move |
| the `THEME_CHECKS` import | store.mjs | 525–526 | goes with the methods |
| dispatch: `themedeclare`, `themeplace`, `themepropose` | store.mjs | 50366–50388 | yes (K3) |
| dispatch: `themeread` | store.mjs | 50397–50401 | yes (K3). `idmatch` (50389–50396) sits between and does not move |
| the C-81 header, `THEME_ID_RE`, `THEME_REF_RE`, `THEME_LEG_KEYS` | bio-checks.mjs | 15106–15139 | yes (R46, R47) |
| `THEME_CHECKS` (C-81.1–C-81.10) | bio-checks.mjs | 15331–15397 | yes (R35) |
| `themeLegFindings` (C-81.1) | bio-checks.mjs | 15399–15438 | yes, exported (R46); its three callers stay (§3) |

**Schema (K4).** `refs` (schema.mjs 8–15), `connections` with five indexes (902–992), `connection_pair_choices` (993–1027), `connection_dirty` (1188–1215), `themes` and `theme_placements` with its index (3693–3742). Today `legacy-store` declares them to purge (store.mjs 869, 877, 879, 891; `theme_placements` 873, `themes` 892). The job removes them there when `connections` declares its own (R36, K23).

**Projections and facts registered with `promotion` (K31, its R39–R40).** The `refs` rewrite inside `promote` (store.mjs 19110–19134) becomes R19's projection. `#writeSupersededBy`'s loop (19131–19137) stays with `inquiry`, reading the edges after R19. `#retirementCitedBy` (5256–5258) becomes the fact `citedBy` (R23), which promotion's R16 `CITED` reads.

**Checks it needs and does not take:** C-6.2's row (the catalogue's reference checks), `isMachineIdentity`, `BUNDLE_ID_RE`, `describeExtent` (content's, through `legacy-checks` until content moves it). Themes also read `CAPTURE_TEXT_UNIT_CAP` (store.mjs 780) and `stampInstant` (820), both `legacy-store`'s until their owners move them.

**Measured size:** store.mjs 1,547 (840 code), bio-checks.mjs 402 (225), schema.mjs 212 (79): about 2,160 lines, about 1,140 of code. Themes are 528 of them (about 350 of code): store.mjs 337 (230), bio-checks.mjs 141 (98), schema.mjs 50 (23); "code" excludes blank and comment-only lines.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | lines | goes to | why |
| --- | --- | --- | --- | --- |
| the `connection-derive` entry in the alarm table | store.mjs 3457–3471 | 15 | `scheduler` | the alarm is the scheduler's; it calls `wake` and `sweep` (R18). `scheduler`'s `uses` lacks `connections` (§5.1) |
| `#observeConnectionDerivation` (43865), `#missingMeaningCause`'s entity arm (43935) | store.mjs | — | `observation-log` | they write and read `observation_log`, later in the order; R3 and R5 are its hooks |
| `resolveLinks`, `recordLinks`, `linksTo`, `recordLinkVerdict`, `op=links` | store.mjs 42181–42333, from 42389; index.mjs 7552–7572 | — | `capture` (its R27) | the link index and verdicts; `projectLinks` calls `resolveLinks` |
| `sever`, `reinstate`, `#edgeTransition`; `cite` | store.mjs 4324 (`#edgeTransition`), 4534–4541, from 13774 (`cite`) | — | `inquiry` | acts that rewrite a document's `references[]`; the edges follow through R19 |
| `#writeSupersededBy` | from 1880 | — | `inquiry` | the inquiry's `supersedes` reverse index, over R19's edges |
| `#contentEarned`'s connection axis | 24146 | — | `connections` through `content` (content map §2) | content R20 hands the axis here; R13 is the set-based service it calls |
| `index.mjs`, themes: op classes (1316–1327), session ops (2169–2172, 2218–2221), capabilities (2347–2354), the viewer gate (12172–12176), the `administer` stamp (12299–12303), the declarer, placer and proposer stamps (12409–12428) | index.mjs | — | `control-plane` | routing, authentication and stamps (K3); `nc-d162.mjs` patches two of them (§4) |
| themes in `#counts` (32099–32101) and purge's report (33549–33550); `themeread`'s id hint (34277) | store.mjs | — | `record-core` (purge, counts) | they count or name the tables; they call `connectionsOf(ctx)` or the purge declaration after (§3) |
| `index.mjs`: op classes (739, 866, 885, 993, 1404–1405), `EDGE_ACTIONS` (1699), the viewer gates (11976, 12145), the `assertedBy: "system"` force (13202–13208), `op=linkproject`'s handler (7493–7508) | index.mjs | — | `control-plane` | routing, authentication and stamps (K3) |

## 3. Callers to rewire

Each calls a moved method or reads a connections table today, and calls `connectionsOf(ctx)` after.

- `citesInto`: `affordanceFacts` (2927), `#retirementCitedBy` (5257; as the fact R23), `#joinedCitingProjectOf`, `#concludedForJoinedProjectOf`, `#editionWarrantedForJoinedProjectOf` (34158, 34188, 34215), `suggestVersion` (40358), `#runContextProjects` (44880), `#runContextQuestions` (44905).
- `edgeSevered`: `#restsOnLive` (5226), `#queueAncestorEdges` (28670), `restingOn` (32208), `reevaluations` (32323), `#routeTask` (47655).
- Direct SQL on `refs`: `#migrate` (1719), `#writeSupersededBy` (1883), `#actionDerived` (2149), `#queueAncestorEdges` (28675), `#projectsDrawingOn` (29494), `#queueSharedInquiryCandidates` (29581), `exportManifest` (34750), `gateFacts` (35048), `#runContextQuestions` (44902), `#routeTask` (47648), `#counts` (31914). Each takes a service or the stated read contract (requirements, Suggestions); BOB decides which.
- Direct SQL on `connections`: `#missingMeaningCause` (43935), `#counts` (31974), `purge`'s report.
- `markDirty`: `#upsertResolution` (25874, 25886), through `entities`' R13 once `entities` is extracted.
- `themeLegFindings` (R46): `checkInquiryBasis` (bio-checks 3585), `actionBasisFindings` (4609), the version legs (8501). They import it from `connections` once their owners move; `basis-versions` and `actions` then need `connections` in `uses` (§5.1).
- Direct SQL on `themes`, `theme_placements`: `#counts` (32099–32101) and purge's report (33549–33550).
- `index.mjs` is unchanged: its ops route to the store, which delegates.

## 4. Old-battery tests that anchor on the moved source

Negative controls and pins that read the text of moved code move or re-anchor with it (a `legacy-tests` entry, K53): `nc-fw17.mjs` (`connectionGradeForContent`), `nc-m063.mjs`, `severedhomes.test.mjs`, `severedhomes.control.mjs`, `d280-strengthbar.control.mjs` and `affordances.test.mjs` (`#citesInto`, `#refEdgeSevered`), `nc-rec72.mjs`, `founder-sight.control.mjs`, `project-sight.control.mjs` and `gate-reads.test.mjs` (`backlinks`, `danglingRefs`), `bounds.test.mjs`, `derivation-bounds.test.mjs` (`#maxEndsForPairs`, `deriveConnections`, `danglingRefs`) and `meaning-bounds.test.mjs` (`deriveConnections`, `chooseConnectionPair`, the dispatch table), `connection-derive-sweep.test.mjs` (`#deriveConnectionsSweep`, `connection_dirty`), `reading-position.test.mjs`, `reading-position-occurrences.test.mjs`, `rec120-onpoint-undetermined.test.mjs` and `rec122-onpoint-choice.test.mjs` (C-49, C-74 and the two predicates), `d470-catalog-census.test.mjs` (C-74), `hygiene.test.mjs` (purge lists), and `civicos-ui/check-refusal-codes.mjs` (the region `is-connection-choice`). Themes: `nc-d162.mjs` (eleven arms that patch exact text in `themeDeclare`, `themePlace`, `themePropose`, `themeRead`, `#themePerson`, `themeLegFindings`, and also `index.mjs`'s stamps and `affordances.mjs`' `ENTITY_KINDS`, which do not move), `theme.test.mjs` (imports `themeLegFindings` and the leg grammars from `bio-checks.mjs`), `bounds.test.mjs` (`THEME_READ_LIMIT_*`, `themeread`), `gate-reads.test.mjs` (`themeread`), `civicos-ui/check-refusal-codes.mjs` (the regions `is-theme-*`, C-81's census). Suites that drive the behaviour through the plane and follow the module as its tests: `connection`, `connection-derive-sweep`, `reading-position*`, `rec120-*`, `rec122-*`, `subresources` (its `projectlinks` arms), `severedhomes`, `d241-derivation-stated`, and `d575-pair-choice-state`, `d706-linkproject` and `rec206-positional-membership` from the built branches, and `theme`. `civicos-ui/test/themes.test.mjs` is the surface's and stays there.

## 5. Undetermined, conflicts, and code others could claim

1. **Uses.** `modules.json` gives `connections` `legacy-checks`, `record-core`, `content` and `entities`. The moved code also calls `membership` (every gate), `text-chain` (positions and `readingPositionInExtent`), `extraction` (the `reading_refs` positions and occurrences, its read contract), `promotion` (R19, R23), `capture` (`resolveLinks`) and `provenance` (the register's capture-to-bundle read, its R48 contract). Proposed: add all six. Elsewhere, `scheduler` needs a use of `connections` (R18), and `observation-log` needs one to register R3 and R5. Both are later in the order, so the edges are legal.
2. **D-701 belongs to `capture`.** The row is about `op=links` and D-340's `op=navchanges`. Both are capture's reads (capture R27, its map §1). Proposed: re-target D-701 to `capture`. D-706 and D-722 (`op=linkproject`) stay here, and so do D-701's `#captureGate`, which they reuse.
3. **D-706's index half.** Its fix stamps a server-decided viewer on `op=linkproject` in `index.mjs`. A job may remove code only from its `from` modules (K47). So either `from` gains `legacy-index` for that line, or a `legacy-index` entry carries it, as N43 does for membership. BOB decides.
4. **REC-206's placement.** Its derivation (`bio-plane/src/membership.mjs` on `land/worker/REC-206`, 173 lines) runs over `op=pdfstructure`'s answer and is served there, which is `extraction`'s op. The address shapes are one system's, written in code (K1). Proposed: the derivation lands in `extraction` (or `docprofile`), taking the shapes from the profile, and `connections` holds the stored membership once Bob answers requirements Open for Bob 3. The file name also collides in meaning with the `membership` module (`bio-plane/src/membership/`), so it is renamed at landing.
5. **R28 is a found defect.** `projectLinks` writes `links_to` edges into `refs` only, and the next promotion of the source bundle deletes them, because R19 replaces its edges from the document (store.mjs 19116–19124). Nothing rows this yet: BOB rows it.
6. **The sight question** (requirements Open for Bob 2) decides what R4, R8 and R20 keep. Until Bob rules, the answers stay as built.
7. **Other claimants.** `capture`: the link index and verdicts. `inquiry`: `cite`, `sever`, `reinstate`, `#writeSupersededBy`, and the inquiry's use of `citesInto`. `promotion`: `CITED`, which reads the fact R23. `progressions`: the progression table that §8.2 generalises from the connection table, and the instance's weakest-link grade, which reuses `#weakerGrade` (export it). `observation-log` / `retrieval`: the derivation statement and `#frontierMeaning`. `content`: the `refusal` helper shared with C-45. Themes are placed here by K77 (§1). `leads` (C-54, the lead's `leadLegFindings`) is the pattern C-81 copies and is not claimed by this map.
8. **Theme uses.** Themes add no new module to `uses`: `membership` (the gate and R45's person projection), `content` (a content id's document) and `legacy-checks` are already there. Removing a placement (requirements R43) is unbuilt and waits on requirements Open for Bob 4; its refusal codes are minted by the job (C-81.11 on).
