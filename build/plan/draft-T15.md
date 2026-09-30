# Plan: tranche T15

**Status** · CUT into `current.md` by BOB #68 at T15's opening, 2026-09-30 (K481); kept for its points. Was: DRAFT · a worker for BOB #67, 2026-09-29, read on `tranche/T14` @ 7f0026f27f (layers 1–2 closed, K458, K460; layers 3–11 and legacy-tests still to run); reviewed by BOB #67 (its points below). Re-read against T14's close before opening (K424's and K451's practice).

Cut from T14's "Not in T14" (`current.md`, with K464's reading), `next.md`'s open entries (T13's waiting list, less what T14 carries), N345's contradiction part (`draft-N345-contradiction.md`, approved by Bob: K455, DEC-85, K456; amended K459), rulings K440–K464, the `not yet met` marks in `build/requirements/`, and the T14 job records. An `N` entry's text is in `build/plan/next.md`. N345's contradiction part folds at the opening; its ids were counted after T14's fold (K454), so they are **re-counted against T14's close** before the fold, with its six new `uses` edges (contradiction → promotion; reevaluation, publication, case-authoring, conformance and queue → contradiction). Bob's weekly meter at the opening: asked.

**Rules at the opening.** T14's rules hold (`archive/T14.md`): long batteries in the foreground, in chunks under ten minutes, the record pushed after each; a provider a later job of its layer needs merges early (§4, K425); promotion stamps at layer 2, last in it, every row change from T14's layers 3+ and T15's layers 1–2 (N318, K425), and rows added at T15's layers 3+ are named `awaiting stamp` for T16; legacy-tests runs alone, last (K420, K427), retiring a covered extracted suite before re-anchoring anything (K457); a job names each `not yet met` mark its work meets and BOB strikes it (K460); after each extraction merge BOB runs `test/m/` whole on the tranche.

## Layer 1

- **legacy-checks** · N325's remainder: the `checkInboxGrammar` export goes (`bio-checks.mjs`:4453; queue holds its own since T14's layer 11); the old battery's `test/inbox.test.mjs`:27 import is red from this merge until legacy-tests retires it, accepted by name at the layer's close; C-19.1's catalogue copy goes too: QUEUE #4 holds `checkInboxGrammar` whole in `src/queue/checks.mjs`, registered with promotion (its record; K476). N327's remainder: C-29.12 `AI_CREDENTIAL_ORG_NOT_ADMIN` retires (nothing mints it since MEMBERSHIP #7), with its family header (:6860–6867). PROMOTION #15's report: the stale comment at `bio-checks.mjs`:2168 (`REOPENABLE_FROM` is promotion R51's frozen `["deferred", "dismissed"]`). Optional, N128's header share: `REGISTRATION_CHECKS`' header (:11200–11205) names membership's C-102.11 and C-102.12.

## Layer 2

- **membership** · N352's provider, if BOB words it before the opening: `hiddenBundles(viewer)` beside `viewerPredicate` (`membership/index.mjs`:35), the complement of the viewer's gate that store `#hiddenBundles`, queue's copy and retrieval `hiddenSet` each spell today (R88). Merged early for promotion (K425).
- **promotion** · The stamp, last (K425): `CATALOG_VERSION` 1.44.0 → 1.45.0 over every row change since 1.44.0: T14's layers 3+ (capture's C-118.1 re-keyed `EVIDENCE_NOT_HELD`, N347; bias's C-26.20 and intent's C-111.16 retired, N327; queue's C-19.2 `INBOX_REFUSED` and the gate's composition changed by queue's `registerStep` registration, N325, K462, K464; any other row a T14 record names `awaiting stamp`); T15's layer 1 (C-29.12's retirement; C-19.1's catalogue copy if it goes); T15's layer 2, if any. `ROW_CENSUS` (R50) re-pinned.

## Layer 5

- **entities** · N345: R38 `reportResolutionDefect` (`op=resolutiondefect`), the `resolution_defects` table, row C-91.7 `NO_SUCH_RESOLUTION`; R14, R15, R29, R30 reworded. N351, once BOB words the bound (R39): `op=aliaswithdraw`'s `resolutions_resting`, and `op=entity`'s aliases and relations, bounded with a stated limit and `truncated` (meaning-bounds' BARE ceiling).
- **retrieval** · N352: `hiddenSet` (`retrieval/index.mjs`:73) reads membership's helper, only if membership provides it at layer 2.

## Layer 6

- **inquiry** · N345: R46 (frozen vocabularies, `resolutionFamily`, `resolutionLines`), R47 (the contradiction inquiry's grammar arm), R48 (`contradictionLink`, `inquiryOfCandidate`); R11 gains C-2.17 `CANDIDATE_ALREADY_TAKEN_UP`; R12, R36, R38 reworded; the module's first `checks.mjs` holds C-2.11–C-2.17.
- **contradiction** · N345 with DEC-85 (K455, K456, K459): R24–R55 (with K5's pairing of two projects' conclusions); R5, R7, R8, R10, R11, R14, R19, R20, R25, R27, R29, R42, R47 amended; tables `contradiction_acts`, `contradiction_recommendations`, `contradiction_optins`, `contradiction_responses`; promotion check R38; rows C-60.2, C-60.3, C-93.8–C-93.39; DEC-85's notice, opt-in, reveal, responses and relay (R49–R55) with the two-hidden-projects fixture; the K5 gate arm and the recommender's blind fixture, measured in `MEASUREMENTS.md` (R41). `uses` gains promotion.
- **skills** · N345: `RECOMMEND_PROMPT` packaged into the skill pack (agent-worker's bundle regenerated at the close).

## Layer 7

- **reevaluation** · N345: R27 (the `corrected` cause, derived on read; `correctedDependents`); R2 and Terms reworded. `uses` gains contradiction (`tensionsOn`).

## Layer 8

- **publication** · N345: R20 (`bio-case-document/5`; `/4` accepted as written; `caseDocumentRequiresTensionSection`), R10 (`tensions`, with DEC-85's highlight), R50. `uses` gains contradiction.
- **case-authoring** · N345: R14 (`/5`), R31 (disclosure, with the highlight), R32 (`tensionsToDisclose`, `op=publishtensions`), R33; family C-120.1–C-120.3 (K343's pattern). `uses` gains contradiction.

## Layer 9

- **conformance** · N345: R1, R9, R12 amended; R21, R22 (a comparison started from a contradiction; a cause only when evidenced; no recommendation in a determination); rows C-113.24–C-113.27. `uses` gains contradiction.

## Layer 9 (T14's reports)

- **filings** · N355: the no-promotion fallback (`src/filings/index.mjs`:138) carries no code for its internal `FACT_UNAVAILABLE`.

## Layer 10

- **legacy-store** · N342's drop (K445): its four reads of queue's tables go (now through record-core R63's spread), and `#MINT_LEDGER_LIVE`'s `TASK` row with its seed. N352's share: `#hiddenBundles` (`store.mjs`:2052) reads membership's helper, if provided.

## Layer 11

- **affordances** · N345's rungs (wording, K447): R1–R4, R7, R8, R14 (the opt-in; the response graded `RUNG_ABSENT`; "resolve" for "conclude" on a contradiction inquiry). MEMBERSHIP #7's report: `affordances.mjs`:1834 names `ADMIN_ONLY`, now `NOT_AN_ADMIN`. Any code T14's layers 3+ retire or rename that their records find in affordances' lists.
- **queue** · N345: R1 amended; R43–R47 (the conflict duty, not mutable; leads; two-project marks; "something you rest on was corrected"; "a conflict found since publishing"; "in conflict with a record you cannot see"; the opt-in and relayed responses). `uses` gains contradiction. N352's share: `#hiddenBundles` (`queue/index.mjs`:167) reads membership's helper, if provided.
- **instance-setup** · N348's remainder (K445): `instanceSetupStore` and `instanceSetupRoute` (`setup.mjs`:2439, :2420) go, with the fixture's frame (`test/m/instance-setup/fixture.mjs`:9, :137).
- **control-plane** · N345: routes, `NEEDS` rows and stamps (`author`, `viewer`, `proposedBy`, `caller`) for the fifteen new ops (contradiction's thirteen, entities' `resolutiondefect`, case-authoring's `publishtensions`). N356: comments still naming `ADMIN_ONLY` (`ops.mjs`:824; `index.mjs`:3057, :3069).

## Last: legacy-tests (K420, K427, K457)

- **legacy-tests** · K457 first. Then: `test/inbox.test.mjs` retired (queue's `test/m/queue/inbox.test.mjs` covers it); C-29.12's acceptance by name in `check-refusal-codes` and the census suite retires; `mint-ledger.test.mjs` S8 (N342); `identity-claims.test.mjs`:183 and `bounds.test.mjs`:175–192 (N348); `d470-catalog-census` A1, A3, A9 and the R50 census suite over 1.45.0, declaring N345's rows `awaiting stamp` by name; meaning-bounds' BARE ceiling 40 → 38 after N351; project-sight's `stats-whole-store` arm widened after N352; N347's `civicos-ui` fixtures imitating `NOT_FOUND` (`test/snapshot-render.test.mjs`:93, :168; `test/artifact-fetch.test.mjs`:21, :44; `civicos-ui/test/` is legacy-tests', K458); N345's re-anchors (suites reading `bio-case-document/4` as current; the affordances totality); whatever T14's layers 3–11 and T15's layers break, each named with its owner.

## Not in T15

**Bob's first:** N345's DEC-78 part (capture's doorbell provenance; a source's disclosure-history home), DEC-80 part (the ceremony) and DEC-81 part (grade disclosure): BOB drafts, Bob approves; the contradiction part's ids re-count when they fold (K454), and its `/5` format move is shared with DEC-81's. N317, N303's remainder, N320.

**T16 owes:** promotion's stamp of T15's layers 3+ rows (N345's: C-91.7, C-2.11–C-2.17, C-60.2–C-60.3, C-93.8–C-93.39, C-120.1–C-120.3, C-113.24–C-113.27) and anything else those layers add.

**Waiting,** as in T13's list less what T14 and T15 carry: N13, N21, N22, N26, N31, N34, N57, N68, N70, N71, N75, N136, N137, N144, N155, N157, N175, N211, N221, N225, N232, N241, N245, N248, N249, N272, N279, N336, N337, DIST-14; and, marks still standing, N65 (3) (actions R40, tangled with REC-201 and N61) and N79 (capture R28: `subresources.mjs` has no containment).

## BOB's points before opening

1. N345's rows are stamped in T16, not at T15's layer 2 (the rule, N318/K425); the N345 draft's "promotion stamps at layer 2" is read so.
2. DONE: C-19.1's catalogue copy goes at layer 1 (QUEUE #4's record).
3. DONE (K477). N352: BOB words membership's provider (R88) before opening, else N352 drops from every layer.
4. DONE (K477). N351: BOB words the bound (entities R39) before opening.
5. Contradiction R41 and the K5 arm need a measured recommender run; if the job lacks model access they are `test.todo` and K5 candidates stay unshown.
6. Measured by BOB #68's worker: queue's code is 5,145 lines (about 6,870 with tests and requirements; queue.md's Size line is stale); the named inbox split (~750 lines of code) is concrete in its functions, not its seams (module name, queue's read of tasks, who registers `task-drain` and C-19.1, which ids move), and leaves queue ~4,400, so the feed producers (~1,500) are a second cut. A new product module is Bob's (P17): brought to him with the recommendation to cut both. Was: queue is 4,162 lines and N345 adds R43–R47; review queue.md's named split of the obligation inbox before its job (P6). Publication (3,613) and inquiry (2,680) also grow.
7. DONE (K478): the marks struck; basis-versions R41 (N300) looks met too, checked at the re-read.
8. DONE (BOB #68, 16 entries moved). `next.md` housekeeping: entries carried in full (N10, N93, N112, N129, N130, N150, N154, N167, N170, N171, N192, N323; N202, N128, N344 met) move to `archive/next-applied.md`.
9. DONE by BOB #68 at T14's close: N355, N356 placed; capture R32 (K383) and basis-versions R41 marks are checked by their next jobs. Was: everything T14's layers 3–11 record (rows, reports, deferrals) is folded at the re-read.

## Wordings to fold into the requirements when T15 opens (K477)

New ids wait here, not in the requirements files, until their job's tranche opens (coverage: a live id is named by a test).

- membership: **R88** (N352, K477) `hiddenBundles(viewer)` is the one spelling of the complement of R43's rule: `null` when R43 lets the viewer see every bundle (its machine and founder arms), otherwise `{sql, args}`, a subquery over record-core's `bundles` naming every bundle R43 does not pass for that viewer (every bundle, for a viewer R43 refuses). Every module that subtracts the bundles a viewer may not see reads it (`legacy-store`'s count subtraction, `queue`, `retrieval`); what an absent viewer means stays the caller's (the store's internal call reads whole and does not ask). It writes nothing and never throws. *(not yet met)*
- entities: **R39** (N351, K477) Every collection keyed on one entity that R5 and R8's alias withdrawal answer (the entity's aliases, its relations, and the resolutions resting on a withdrawn name, `resolutions_resting`) is bounded: at most 500 each, in its stated order, with `truncated` per collection by reading one past; a truncated collection never answers a count as whole. *(not yet met)*
