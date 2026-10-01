# Plan: tranche T20

**Status** · OPEN · BOB #85 · session_01YQtb9XDsYeg4ihVV7VEGfP · depth 1

**Jobs** · signatures: SIGNATURES #3 session_01ML4Fo3S55aQzLtgsN7sP6F; pdf-worker: PDF-WORKER #4 session_01517coXM6VXW6mGeq6J943P; ocr-worker: OCR-WORKER #4 session_011c8rK8CoDV7XQj17vpk2hx; bundler: BUNDLER #3 session_01Bn7W4BUTLpR4VJ7vgYfCWR; record-grammar: RECORD-GRAMMAR #3 session_01Dr61eQgdPoB6sfPdCc6qXC; text-chain: TEXT-CHAIN #5 session_01DmBUmF4hco6t1MeYZwfZeR; office-readers: OFFICE-READERS #4 session_01T9LFGqSu4UfTE1DhyznDUz; record-core: RECORD-CORE #12 session_01NEdggWzA6wen9mWzAPWE6z; membership: MEMBERSHIP #14 session_01Hm4zb2v2byBSPbjJcCmpoE; promotion: PROMOTION #21 session_01R5CtkLhV9ed4MorNzoqonq; host-governor: HOST-GOVERNOR #5 session_01E5goMGoeD1gWF6MCUYPYx4; capture-sources: CAPTURE-SOURCES #7 session_01E7bTM3MKu3LsrvRVRuAXcf; acquisition: ACQUISITION #3 session_0168H7EAyX21CBeSgd7swg8h; capture: CAPTURE #12 session_015soMeRVHoEuTpMbyTVTmi8; extraction: EXTRACTION #10 session_013omNPjSMS2KenNBwKpnvvD; connections: CONNECTIONS #8 session_01Df1N2wW2RVBh2dLYgPDzeM; bias: BIAS #6 session_019fYYaznWEvSJmjoUKHDhz9; observation-log: OBSERVATION-LOG #6 session_01UacP3DwJUSWFBSvrTh4tEa; skills: SKILLS #8 session_01GnYeqvTWL2RPqooQrRRMCS; inquiry-grammar: INQUIRY-GRAMMAR #2 session_01FE7geAT18GTqA8kB2o6acr; run-rules: RUN-RULES #2 session_0112QZ3U15TqSZXGMXDLiA7V; ai-runs: AI-RUNS #7 session_01KBFUpcYZcLfhNibsYY5TgB; inquiry: INQUIRY #9 session_01Ay9rNAXKhf7SAcWnuRr9tY; basis-versions: BASIS-VERSIONS #7 session_01Toek8Uvzob3AX7e5gE9fct

Opened by BOB #84, 2026-10-01 ~12:40 UTC (PROCESS-MECHANICS §5), on `tranche/T20` from `main` @ c1a27e41a5, T19 closed (K859). The plan is `draft-T20.md` (K795) with its later additions, below unchanged in its entries; the folds before each layer (rule 1, ⚑BOB-7) are done on this branch before that layer's jobs start (K860).

**Drafted as** · · DRAFT for T20, written by a worker for BOB #81, 2026-10-01. Read on `tranche/T19` @ 439261ca37, `next.md` re-read @ 3b4dd66250 (N449) (layer 2 closed, K792; layer 3 running, K793). Assumes T19 completes as `current.md` plans it: `bio-checks.mjs`, `store.mjs`, `schema.mjs` and `src/index.mjs` deleted; `tools/` deleted whole (bundler and signatures took the release files, K754, K762); `legacy-checks`, `legacy-store` and `legacy-index` out of `modules.json`. Nothing T19 places is repeated here. **Re-read against T19's close before opening (K424's practice):** each T19 job's own deferrals (P8), the residue control-plane's catalogue-deleting act names (K786), PLANE's REPORT on bundler's files (K787 (10)) and EXTRACTION's answer on K763's chain mark fold in then; a line marked *conditional* below is dropped if T19 met it.

Cut from: `next.md`'s open entries; `current.md` "The final sweep", "What T19 removes", "next.md: every entry", "For BOB and for Bob"; rulings K740–K794; `build/jobs/T19/*.md` (layers 1–2's records); `modules.json`, `layers.md`. An `N` entry's text is in `next.md`.

**T20's priorities:** none set by Bob yet (⚑Bob-1). This draft carries every entry that can safely be done (P19) and names each one that cannot.

**What T20 finishes (P19's report).** (1) Every named copy and legacy shim T19 left in a closed layer is deleted: membership's five credential copies (N445, K791), actions' `RISK_TIERS` export (N447), record-core's `registerLegacyGrammars`, text-chain's catalogue parity test (N446); `MODULE_ORDER` follows `modules.json` again. (2) Promotion stamps every row change since 1.49.0 (K792). (3) The old process's last live references in product code go (N437's rest, N443). (4) N439, the pptx form of N26. What stays is the release (Bob's), the UI (Bob's), Bob's open questions and the deployments (table).

## Rules at the opening

T19's rules hold where they still apply (no legacy-tests stage, K619; merge early, §4; one file, one editor, §12.2; a job names each `not yet met` mark it meets, BOB strikes it at the merge, K775 (6); no layer closes red except a red accepted by name). Rules 1, 2, 5 and 8 of T19 are spent: there is no catalogue, store or legacy root left. Added:

1. **Before L1 (BOB, at T19's close or the opening; P18, no change of meaning):** `modules.json`: the three legacy ids gone, and with them every `from` and `uses` naming them (46 modules use `legacy-checks`, K780; `queue` and `control-plane` use `legacy-store`; `plane`'s `from`); `layers.md`: the legacy rows, rules and the "until the catalogue goes" sentences. **Wordings** of requirement clauses that name the deleted files as present: record-grammar R28 (`LEGACY_GRAMMARS`' slots), R41 (the catalogue's re-exports); text-chain R92–R98 (the catalogue's copy, "byte-identical while it holds it"); record-core R67 (`legacy-checks`' slot until moved) and the `registerLegacyGrammars` clause (K775 (3)); promotion R50 ("or in `legacy-checks`"); every Uses section naming `legacy-checks`. New wordings: office-readers' pptx read and its renumbering helper (N439, before L1); extraction's pptx migration (before L4); membership R83 unchanged (it already says "`modules.json`'s ids").
2. **Accepted red by name from T19's close:** `module-order.test.mjs` (membership R83: `MODULE_ORDER` still lists `legacy-checks`, `legacy-store`, `legacy-index`, `index.mjs`:168, :181, :183) until membership's L2 job (⚑BOB-1); text-chain's `extent.test.mjs` (N446, K786) until text-chain's L1 job; any other residue control-plane's last act names (K786), until its module's job here.
3. **Merge early:** L2 record-core, then membership, before promotion's stamp (last in L2).
4. **Stamp.** Promotion (L2) stamps T19's layers 3–11 and T20's layers 1–2. No row change is expected in T20's layers 3–11; one that arises is `awaiting stamp` for T21 (P8).

**Roster (12 jobs; by layer 6, 3, 0, 1, 0, 0, 0, 0, 1, 0, 1):** L1 record-grammar, signatures, office-readers, text-chain, pdf-worker, ocr-worker · L2 record-core, membership, promotion · L4 extraction · L9 actions · L11 installer. *Conditional:* bundler (L1) if PLANE's REPORT needs a `build-plane.mjs` edit T19 did not make (K787 (10)); docprofile (L1), acquisition (L3), monitoring (L10) if Bob rules N21 the other way (⚑Bob-3); legacy-tests (L11) if Bob rules the old suites go in T20 (⚑Bob-2); a module named by T19's late deferrals or K786's re-scan. No new module; none past the 4,000-line mark grows.

## Layer 1

- **record-grammar** · N437's kind (found by LEGACY-CHECKS #13, `build/jobs/T19/legacy-checks.md`:93): `bundle.mjs`:767, :779, :793 name "the migrate tool" (retired, K739) as a live caller; re-word to the callers that exist. **N449** (K794): R19's `not yet met` mark looks stale (`isPublicHttpsLocator` accepts `HTTPS://`, refuses `localhost.` and `.local` at HEAD): confirm with R19-named tests, then BOB strikes it at the merge. **Size:** ~3 comment lines, tests.
- **signatures** · N443's share: `bio-plane/src/sshsig.mjs`:229 names `tools/release-assemble.mjs` as the producer, now `bio-plane/scripts/release-assemble.mjs` (K754); with it the header's list of where signing happens (SIGNATURES #2's own deferral, `signatures.md`:17, made only to spare a bundle regeneration, which the close does anyway, §14). The plane and installer bundles go stale: regenerated at the L1 close. **Size:** ~5 comment lines.
- **office-readers** · N439 (K747): `pptx.mjs`' `walkSlide` reads the first `mc:Choice`, else `mc:Fallback`, never both (as R11/R16 now say for docx), so slide text is not doubled and the `slide-shape` `shape` index does not advance for a branch not read; plus a renumbering helper for extraction's L4 migration, `pptxRenumbering` (old → new `shape` index per slide, `null` for a shape inside a branch not read), the pptx form of R28 (worded before L1, rule 1). Slide numbers and the slide-grain unit do not move. **Size:** ~30 fix, ~50 helper, tests. *Conditional* on T19's extraction job having migrated docx (N26): if it did not, N26's rest joins here and in extraction below.
- **text-chain** · N446 (K786): drop `test/m/text-chain/extent.test.mjs`' parity sweep against the deleted catalogue (its `import * as catalogue`, 13 uses in 196 lines); each of R92–R98 stays named by the module's own tests. *Conditional* (K763): if EXTRACTION's T19 L4 job reports that text-chain must accept the reader-version mark on the docx layer step and cannot without a change, that change is here (worded before L1), and extraction's re-read is below. **Size:** ~−40 test lines (+ the mark, if K763 applies).
- **pdf-worker** · N437's share (K739; no T19 job carried it): `src/index.mjs`:55, :61 and `fleet-member.json`:13 name the retired `scripts/coverage.mjs` and its gate as live; re-word (provenance of a measurement may stay, `layers.md` rule 6). The pdf-worker bundle is regenerated at the close. ⚑BOB-5 on N34's split review. **Size:** ~4 lines, no growth.
- **ocr-worker** · Its own deferral (OCR-WORKER #3, `ocr-worker.md`:21): `scripts/embed-tesslib.mjs`' generated `HEADER` (and so `src/tesslib.mjs`' first lines) names `bio-plane/test/fleetbundles.test.mjs`, now under `test/system/`; fix and re-render (⚑BOB-4). **Size:** 1 line and a re-render.
- *Conditional* **bundler** · what PLANE's T19 REPORT routes for R7 (`build-plane.mjs` and the fleet bundle taking plane's entry), if BOB did not make it in T19.

## Layer 2

- **record-core** · `registerLegacyGrammars(record, grammars)` (`index.mjs`:1343; K775 (3), K785) has no caller once legacy-store's L10 job removes `store.mjs`' call and plane deletes `store.mjs`; it was to go "with the catalogue", and record-core's layer had closed. Delete it and its 7 test uses in `record-core.test.mjs`; R67 re-worded at rule 1's fold. **Size:** ~−30 code, ~−60 test. Merge early.
- **membership** · N445 with K791's whole list: delete the named copies `attestingKeys` (`index.mjs`:419), `signerRegisterOwn`, `signerRevokeOwn`, `signerList` (:2671–:2800), `aiCredentialLook` (:2818), with `#signerMemberBar`, `#keyShaped`, `SIGNER_ATTESTS`, the `BAD_KEY` answer, rows C-96.15–.17 and its `SIGNER_ENROLMENT_CHECKS` copy (`checks.mjs`:426–), and the tests of them; their callers re-pointed to credentials in T19 (capture L3, ai-runs L6, publication and ratification L8, queue-producers, admission, control-plane L11; K784, K791). The job re-scans first: a caller left on a copy names itself and the copy waits (order, P4). **Rule 2:** `MODULE_ORDER` drops `legacy-checks`, `legacy-store`, `legacy-index` (R83; `module-order.test.mjs` green again). Rows departing from membership's table are promotion's stamp. **Size:** ~−300 code, ~−60 rows, tests. Merge early.
- **promotion** · After membership merges. **The stamp** (K792; T19's deferral row "rows changed at T19 L3–11", P8): `CATALOG_VERSION` over every row change since 1.49.0: T19's layers 3–11 as their records name them (the held catalogue copies deleted in L5–L11, capture's C-68.1, public-read's C-44.2/C-68.5/C-98.1–.9, ratification's `op=retire`, action-grammar's moved rows, conformance's and escalation's own codes (N433), intent's three, the catalogue file's end; T19's layer-2 rows, C-96.18 and C-102.19/.20 among them, are in 1.49.0) and T20's layers 1–2 (membership's departures); `ROW_CENSUS` (R50) counted over module tables only, the catalogue being gone. R50's "or in `legacy-checks`" re-worded at the fold; `GATE_VERSION`'s literal `bio-checks` kept (⚑BOB-3). N448's promotion share is moot once `tools/` is gone (⚑BOB-3). **Size:** the stamp, a whole job (PROMOTION #18, #20).

## Layer 4

- **extraction** · N439's migration (K747), as N26's (R66) and K763's ruling: a pptx reading made before N439 whose slides hold an `mc:AlternateContent` with a branch now not read is re-read through the R19 writer (never rewriting `capture_text` in place), with a reader-version mark on the pptx layer step only for captures `pptxRenumbering` moves; stored `slide-shape` `shape` references (the reading's own, `reading_refs` positions and occurrences, the text units' extents) moved by the helper; content R22 marks affected rows stale and R41 grades and notifies. Worded before L4 (rule 1). *Conditional* (K763): if T19's job deferred N26's re-read for text-chain's mark, it is done here too, and `main`'s first deploy of N26 waits for it. **Size:** ~120 and tests (N26's was the model).

## Layer 9

- **actions** · N447 (K787 (8)): drop `actions/checks.mjs`' re-export of `RISK_TIERS` and `riskTierState` (kept through T19 for affordances and instance-setup, re-pointed to action-grammar in T19 L11, K768); if `checks.mjs` then holds nothing of its own, delete it and import action-grammar directly. Re-scan first. **Size:** ~2–30.

## Layer 11

- **installer** · N443's share (K762; installer had no T19 job, P10): `newgroup/scripts/embed-release.mjs`:100's operator text names `tools/release-assemble.mjs --sign`, now `node bio-plane/scripts/release-assemble.mjs --sign`; comments `newgroup/src/index.mjs`:303 and `test/wizard.test.mjs`:1314 name `tools/deploy-fleet.mjs`, now `bio-plane/scripts/deploy-fleet.mjs`. The newgroup bundle is regenerated at the close. **Size:** 3 lines.

## Deferred beyond T20

Hard reasons only (P19): order (P4), size before a split (P6), a dependency not yet built, one job per module (P8), Bob's (P17), deploy (a deployment or a measurement).

| entry | reason | evidence |
|---|---|---|
| rows changed at T20's layers 3–11, if any | P8 | promotion's one job is L2 and stamps last; none expected |
| office-readers R28 `docxRenumbering` and the new pptx helper, retired | deploy | each is "retired once that migration has run" (R28, K747); a migration runs at each instance's deploy |
| the release: the old battery and its instruments, the DEC-49 guard's floors, the `system` suites, legacy-tests' deletion; N31's rest, N57, N68 and N70's legacy-tests, legacy-index (`pensweep.mjs`, now legacy-tests') and affordances (N45, d311) shares, N248, N279, N431, N434, N436, N438, N441, N442, N448's legacy-tests share | Bob's (K619, K633, K635) | ⚑Bob-2 |
| legacy-ui, N70's and N68's legacy-ui shares, N241, N371, N389, N-A13, N437's `app.html` share, N444 | Bob's: UX (K633) | untouched until the new interface replaces it |
| `cpra_request` identifier (REC-201's rest, now in action-grammar's vocabularies), N71 | Bob's: UX; an interface name changes with a migration his question sets | N71 |
| N303's rest, N317, N320, N144, N232 | Bob's: doctrine, requirement meaning, UX | T19's table |
| N70's skills share | Bob's: skills question 1 | T19's table |
| N-A14 | Bob's (legal text) and deploy (a source for holidays and offices) | T19's table |
| N-A19 | Bob's: doctrine (K624 (5), DEC-61) | T19's table |
| `PLN-` affordances, the plan-page surface; joint action | Bob's (K608 (4), K600 (c)) | T19's table |
| `MODES.plan` deployed (N420's rest) | deploy (K660 (5), run-rules R14) | T19's table |
| the newgroup installer deployed with N336 | deploy: a signed release, Bob's act | K723, K724 |
| contradiction R41 and the K5 arms, DIST-14, N75, N34 | deploy; N34 also size (pdf-worker 4,075, P6) | measured on a deployed plane |

**14 rows**, none for the tranche's size or a job's smallness.

## next.md: every entry

- **Placed in T20:** N437's rest (pdf-worker L1; record-grammar L1 by kind), N449 (record-grammar L1), N439 (office-readers L1, extraction L4), N443 (signatures L1, installer L11), N445 with K791's two further copies (membership L2), N446 (text-chain L1), N447 (actions L9). Not in `next.md` but placed: T19's stamp deferral (promotion L2), `registerLegacyGrammars` (record-core L2), `MODULE_ORDER`'s legacy ids (membership L2), OCR-WORKER #3's header (ocr-worker L1).
- **Deferred:** the table.
- **Carried by T19, to `archive/next-applied.md` at T20's opening if T19 completes as planned:** N22 (K753), N26 (L1 K755; L4 migration), N31's bundler share (K762), N70's legacy-checks, promotion, membership shares (met, `promotion.md`:89, `membership.md`:68) and legacy-store's (`auditPass` leaves the store, record-core R18 bounds it), N136, N155, N175 (K745), N221 (K792), N404 (K758), N416 (K747, K752), N420 but `MODES.plan` (instance-setup L11), N421, N422, N423, N424, N425, N426 (K792), N427, N428, N429, N430 (K766), N432, N433, N435, N437's other shares, REC-201's outward share and the "Local facts" line's `governingLawsOf` (K768). N440 (K759) was never written to `next.md`.
- **Moot at T19's close:** N21's legacy-index share (legacy-index retired; ⚑Bob-3 for the rest); N448's promotion share (`tools/` deleted whole).

## For BOB (P17) and for Bob

- **⚑BOB-1 · `MODULE_ORDER` red at T19's close.** Membership R83's test compares `MODULE_ORDER` with `modules.json`; the three legacy ids leave the file at T19's close, and membership's layer is closed. Recommended: accept the red by name from the close until membership's T20 job (rule 8's pattern, K657, K746), and say so in T19's close ruling. The other readers of `modules.json` (promotion `registry.test.mjs`, control-plane `families.test.mjs`) read it at run time and stay green.
- **⚑BOB-2 · `registerLegacyGrammars`** stays in record-core after T19 with no caller. Recommended: record-core's T20 job deletes it (above), not a T19 CHANGE to a closed layer.
- **⚑BOB-3 · promotion's wording after the catalogue.** Recommended: R50 drops "or in `legacy-checks`" (wording); `GATE_VERSION`'s literal `plane-gate/1.0 (bio-checks <CATALOG_VERSION>)` (R34) is kept, an interface value recorded with every ratification; N448's promotion share struck as moot (no `tools/` to read).
- **⚑BOB-4 · ocr-worker's header.** OCR-WORKER #3 left it "for the next vendor bump" to spare a regeneration; that is not a hard reason (P19). Recommended: carry it (a job for one line is allowed, P19).
- **⚑BOB-5 · pdf-worker at 4,075 lines** (N34: "BOB reviews a split before its next job"). Recommended: no split now; this job changes comments only, and the split is reviewed when N34's code (deferred, deploy) or another entry grows it.
- **⚑BOB-6 · N439's helper:** recommended a separate `pptxRenumbering` (R29), retired like R28 once the migration has run everywhere (deferred, deploy).
- **⚑BOB-7 · before each layer (P18):** rule 1's fold and wordings; the conditional lines once T19 closes (PLANE's REPORT, K763's answer, K786's residue, every T19 job's deferrals).
- **⚑Bob-1 · T20's priorities.** Recommended: this plan whole (it finishes the legacy removal's leftovers in about a dozen small jobs), with the release (⚑Bob-2) as its main decision.
- **⚑Bob-2 · The release (K619, K633, K635).** After T19 the old suites cannot load: what they import (`bio-checks.mjs`, `store.mjs`, `src/index.mjs`, `tools/`) is gone, so running the old battery "at the release" is no longer possible. Recommended: Bob rules that legacy-tests' old suites and instruments are deleted in T20 by a legacy-tests job (L11, last), keeping and re-pointing the `system` suites that still run against the new tree (fleetbundles, with N441 and N442); the entries in the table's release row are then met or moot with it. The release's deployment (a signed release, the installer with N336, `MODES.plan`) stays deferred (deploy). Without his ruling the row stays deferred.
- **⚑Bob-3 · N21: what an instance with no jurisdiction profile does.** acquisition and monitoring pass no view when no profile is set, by their stated design, so docprofile's no-view fallback (R6, "until N21", K39) is that instance's behaviour (K758). Recommended: keep the fallback as permanent behaviour; BOB re-words R6 without "until N21" and N21 is struck. The alternative (every caller passes an empty or default view, the fallback dropped) changes three modules' behaviour for such an instance and adds docprofile, acquisition and monitoring jobs to T20.

## Added at T19 layer 10's close (K842, BOB #83)

Plane's held code (plane R10): each owner registers its own share and deletes it from `src/plane/held.mjs` (P19: order is the hard reason it is not T19's; the owners' layers closed before plane's).
- **membership** (L2, already in T20) · registers `projectParticipants`, `projectOwnerVotes` through record-core R63; deletes plane's copy.
- **run-productions** (L6, new to T20) · `proposedReadings`, `suggestRefusals` (called by name in `#counts`) through R63.
- **inquiry** (L6, new to T20) · `inquiryMigrationReplays` through R63; the leg-grade registration (its R13/R14) under its own name through `retrieval.registerLegGrades`.
- **basis-versions** (L6, new to T20) · `basisVersions`, `basisVersionLegs` through R63.
- **observation-log** (L5, new to T20) · `observations`/`observationsNonLead`, `leads` through R63.
- **provenance** (L3, new to T20) · registers `testimonySlot()`'s check in its own promotion step; the sight index's projection to its owner (membership or retrieval, as plane's job names it), with that owner's job.
- **record-core** (L2, already in T20) · the bundle, file, history, ref and text-index counts through R63.
- **plane** (L11, new to T20) · deletes `src/plane/held.mjs` once empty; R10 retired, R8's "save the held code" struck.
- **bundler** (L1, now unconditional; K846) · `fleet-bundle.mjs`:196, :198 `planeMember`'s `entry` → `src/plane/index.mjs`; then plane's T20 job deletes the one-line `src/index.mjs`.
- **control-plane** (L11, new to T20; K846) · R42: register provenance's testimony slot at the `plane-held` step's rank (after provenance's T20 job), and plane's held step drops it.
- **host-governor** (L?), **capture** (L3), **agent-worker** (L6) (K846) · re-point any module test PLANE #1 names red at T19's close (`ops.test.mjs`:192, `plane.test.mjs`:13, agent-worker's `PLANE_ENTRY`/`PLANE_IDX_PATH`) to `src/plane/`.

## Added during T19 layer 11 (BOB #84, K850)

- **inquiry-grammar** (L6, new to T20) · rename `INQUIRY_GRAMMAR_ROWS` to the reserved `*_CHECKS` suffix (`INQUIRY_GRAMMAR_CHECKS`) so DEC-49 composition finds it without control-plane's alias (CONTROL-PLANE #10 J3 (1)); then control-plane's `families.mjs` drops the alias, with its T20 job.
- **acquisition** (L3) and **control-plane** · C-68.1 is minted at two `is-storage-absent` regions (acquisition's site and the door's `storageAbsent`): the door raises through acquisition's export, so one site remains (CONTROL-PLANE #10 J3 (2)).
- **legacy-tests** (with ⚑Bob-2) · LEGACY-INDEX #12 deleted `tools/` and the walk scripts (K787): the old suites and scripts it lists in `build/jobs/T19/legacy-index.md` (For BOB 1) now fail at load, accepted red by name with the old suites (K619).
- **capture-sources** (L3, new to T20; K853) · R55, R57, R63's test (`test/m/capture-sources/credentials.test.mjs`:557) runs legacy-tests' `civicos-ui/check-refusal-codes.mjs`, which reads the deleted catalogue: re-state the proof at the module's interface without the guard. Accepted red by name from T19's close until then.

## Roster after K861 (BOB #84)

K861 re-cut the held-code entries above (K842's "registers its own share and deletes it from `held.mjs`" no longer holds): no owner edits plane's files or registers its share; each exports it, proven by its own tests, and plane's T20 job (last in L11) switches its composition to the exports, re-keys `held.test.mjs` and deletes what moved. Plane keeps its stats source, `textIndexOk` and `observationsNonLead` under a name of its own. Provenance has no T20 job. The STARTs in `starts-T20/` are cut to this roster, with lines read on `tranche/T20` at its opening.

**25 jobs, by layer (`build/modules.json`) 7, 3, 4, 1, 1, 5, 0, 0, 1, 0, 3.** *Added since K795* in italics, with the ruling that added it.
- **L1** record-grammar, signatures, *bundler* (K846; was conditional), office-readers, text-chain, pdf-worker, ocr-worker
- **L2** record-core (with its K861 export), membership (with its K861 export), promotion
- **L3** *host-governor* (K846, K861 (6)), *capture-sources* (K853), *acquisition* (K850), *capture* (K846, K861 (6)). **provenance removed** (K861 (3): its R52 already keeps the slot out of its own step; `provenance.txt` deleted).
- **L4** extraction
- **L5** *connections* (K882: N454, `refs` exported), *bias* (K881: R23's order test off `legacy-store`), *observation-log* (K842, K861: `observations` and `leads` only)
- **L6** *skills* (K882: N452's re-point), *run-rules* (K882: K820's comments), *ai-runs* (K881: R43's order test off `legacy-store`), *inquiry-grammar* (K850), *inquiry* (K842, K861; with K850's re-point), *basis-versions* (K842, K861), *run-productions* (K842, K861), *agent-worker* (K846, K861 (6))
- **L8** *ratification* (K875: re-point `preflight.test.mjs` from membership's signer copies to credentials)
- **L9** actions
- **L11** *control-plane* (K846, K850, K861 (4): R42's step exported, the alias dropped, C-68.1 at one site), installer, *plane* (K842, K861), *legacy-tests* (K879: Bob ruled the old suites deleted; last)

docprofile, monitoring: not in T20 (⚑Bob-3 answered: the fallback is kept, K880). legacy-tests joined L11 (K879, ⚑Bob-2 answered).

**Found at the re-cut, for BOB.** (1) Besides host-governor, capture and agent-worker (K861 (6)), four instance-setup tests (`test/m/instance-setup/{worker-page,profiles,reports,worker-reports}.test.mjs`:19, :158, :132, :17) and promotion's write-path probe (`test/m/promotion/write-path.test.mjs`:18, `./index.mjs`) read `bio-plane/src/index.mjs`; neither module has a START that re-points them, so plane's deletion of the re-export waits on them (plane's START names them). (2) `INQUIRY_GRAMMAR_ROWS` is read by skills (`src/skilldoctrine.mjs`:90, :253; `test/m/skills/fixture.mjs`:12, :21), which has no T20 job: inquiry-grammar keeps the old name as a one-line alias until its last reader re-points.

**Proposed wording before L11 (P18, no behaviour moves), for BOB to fold:**

plane **R10**:
> **R10** (K842, K861) Until this module's T20 job, `src/plane/held.mjs` holds, moved whole from `store.mjs` with their behaviour unchanged and each headed with its owner: the stats figures `store.mjs` registered as `legacy-store`, the leg-grade registration (`inquiry` R13, R14) and the promotion step `legacy-store` registered, all registered as `plane-held`. No owner edits this module's files and none registers its share itself: each exports it, proven by its own tests (a figure source shaped as `record-core` R63's `counts(hid)` from `record-core`, `membership`, `run-productions`, `inquiry`, `basis-versions` and `observation-log`; `inquiry`'s leg-grade resolver; `control-plane`'s promotion step, its R42). This module's T20 job registers each export under its owner's name where the held share stands in R2's order (the step at the rank `STEP_ORDER` gives the held step today, before `affordances`), so no figure, resolver or step is registered twice; every `op=stats` and purge-proof value is unchanged (the order of the keys may change); and every step's checks, projections and refusals run in today's order. The stats source itself (the caller's sight over hidden bundles and hidden runs, and the spread of the registered figures, `record-core` R63, R64), `textIndexOk` (`extraction`'s boolean) and `observationsNonLead` are this module's own stats sight, kept outside `held.mjs` under a name of its own. `held.mjs` is deleted once the last share has been switched.

control-plane **R42**:
> **R42** (K764, K861; provenance R52) This module holds the promotion step `legacy-store` registered and `plane` holds as `plane-held` (plane R10). It exports the step whole for `plane` to register under this module's name, and registers nothing itself and edits no file of `plane`'s. The step is `provenance`'s `testimonySlot()` (its `check`; its `project`, whose refusal rolls the promotion back and whose `testimony` joins the answer on the testimony path only) and `membership`'s sight index (`reindexProjectSight` on every promotion, D-497), which `membership` cannot register because it does not use `promotion`. It runs at the rank the held step has today, whatever this module's own place in the order: its `check` after the checks of every module before `legacy-store`'s old place in the order (`monitoring`'s included) and before `tasks`', and its `project` after those modules' projections and before any later module's. So every step's checks and projections, every answer's keys and values, and the order of refusals are those of today. *(not yet met: T20, K861: exported in control-plane's L11 job, met once plane's T20 job registers it)*

With them: plane R2's "the testimony slot held inside the `plane-held` step (R10) until `control-plane` holds it (its R42, T20; K846)" becomes "the held promotion step (`control-plane` R42) at the held step's rank (R10)"; plane's Uses line for `control-plane` reads "the promotion step it exports (its R42)". Each owner's export is a new clause in its own requirements, worded before its layer (rule 1).
