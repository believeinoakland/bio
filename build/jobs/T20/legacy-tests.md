# legacy-tests (T20)

**Status** · session_01Pz7VnRaMdnBMJGLR951Cnt · depth 2 · COMPLETE · handled B1

## Completion (LEGACY-TESTS #18)

B1 applied (K879: the old suites deleted; K884; K890). Merged `tranche/T20` first; plane's T20 job had not yet merged, so `bio-plane/src/index.mjs` still exists as a one-line re-export. Every kept file that booted it now boots `src/plane/index.mjs` directly, so plane's deletion stales nothing of mine. No product code changed.

**Method.** Every one of the 244 `*.test.mjs` in my `tests` was run (`node --test`, one at a time): 187 failed at load, 6 loaded and were red, 51 were green. Each suite that loaded (55, not counting the 2 named in B1 (2)) was read whole and judged against the module tests under `test/m/` and the fleet members' test dirs. A suite was deleted when module tests give its whole proof (each such test is named below). It was kept when it proves something no module test does (that proof is named below). Every non-test file (control, `nc-*` driver, probe, preload, helper, fixture) was kept only if a kept file or a file outside my paths uses it. The one exception is `fleetbundles.control.mjs` (my ruling below).

**Deleted: 461 files.** Under `bio-plane/test/` (outside `m/`) and `civicos-ui/test/`, 451 files:
- 197 suites: 187 failed at load (157 of them on the deleted `checks/bio-checks.mjs`; the rest on `scripts/walkfloor.mjs`, `walkfigure.mjs`, `migrate/migrate.mjs`, `src/airun.mjs`, `src/actions/checks.mjs`, `ADMISSION_CHECKS`, `Store` from `store.mjs`, and others); 10 green or red whose whole proof module tests give (below).
- 130 `*.control.*` and 86 `nc-*` drivers.
- 7 probes, 28 helpers and preloads, and 3 fixtures (`fixtures/d608/*`, `fixtures/do-fail-worker.mjs`, read by nothing kept).
- The 1.43.0–1.47.0 row-census snapshots, which no stamp reads.

From my `paths`, 10 files: `bio-plane/scripts/battery.mjs`, `armdecay.mjs`, `budgetsweep.mjs`, `control-register.mjs`, `finallyexit.mjs`, `identity-claims.mjs`, `pensweep.mjs`, `residue.mjs` (the old battery and its instruments; three failed at load on `walkfloor.mjs`), and `civicos-ui/check-refusal-codes.mjs` and `check-semantics.mjs` (both failed at load on `walkfloor.mjs`). `tools/fw21-onpoint-probe.mjs` was already gone (`tools/` deleted in T19, K787).

Green or red suites deleted because module tests give their whole proof:
- `livefire.test.mjs`: `m/instance-setup/worker-reports.test.mjs` R19, `m/control-plane/gates.test.mjs`:136, `m/admission/namespaces.test.mjs` R4.
- `purge.test.mjs`: `m/control-plane/purge.test.mjs` R28, R39; `m/record-core/record-core.test.mjs` R22/R24/R46, R72, R1, R8; `m/plane/store.test.mjs` R5.
- `profile.test.mjs`: `m/acquisition/profile.test.mjs`:167, :206; `m/instance-setup/worker-reports.test.mjs` R42.
- `installer.test.mjs`: `m/instance-setup/worker-reports.test.mjs`, `m/admission/authentication.test.mjs` R5, `m/control-plane/gates.test.mjs` R15, `m/instance-setup/reports.test.mjs` R17, `m/control-plane/doors.test.mjs` R1 R2, `m/instance-setup/page.test.mjs` R21, `m/plane/worker.test.mjs` R6.
- `browse.test.mjs`: `m/credentials/signin.test.mjs` R4 R5, `m/admission/authentication.test.mjs` R6 R7, `m/admission/admission.test.mjs` R8, `m/op-declarations/tables.test.mjs` R3, `m/control-plane/purge.test.mjs` R28, `m/control-plane/lease.test.mjs` R38, `m/capture/ops.test.mjs`:48, `m/instance-setup/worker-page.test.mjs` (K102).
- `tier3-layer-parts.test.mjs`: `m/extraction/convert-tiers.test.mjs` (its four tier3-layer-parts tests), `m/text-chain/chain.test.mjs`, `m/pdf-reader/text.test.mjs` R13 R14, `m/pdf-reader/images.test.mjs` R34.
- `cap14-reused-from.test.mjs`: `m/acquisition/subresources-walk.test.mjs` R19 (three tests), `m/capture/converts.test.mjs` R25 (CAP-14), `m/capture/services.test.mjs` R24 R25.
- `peritem.test.mjs` (red only on C-76.1's re-key to `TASK_NOT_YOURS`, K606): `m/record-core/record-core.test.mjs` R49–R55, `m/tasks/inbox.test.mjs` R3 R7, `m/queue/converts.test.mjs` R27 R8, `m/queue/dispose.test.mjs` R28 R29, `m/progressions/dispose.test.mjs` R22, `m/affordances/catalogue.test.mjs` R1, `plane.test.mjs` R17.
- `partitionindependence.test.mjs`: `m/strength/version.test.mjs` R11 R12 R24 R27, `m/strength/converts.test.mjs`, `m/strength/reads.test.mjs`.
- `citeproject-inquiry.test.mjs`: `m/citation/cite-write.test.mjs` R2 R3, `sever.test.mjs` R4, `cite-refusals.test.mjs` R1 R11, `audit.test.mjs` R2 R4; `m/affordances/plane.test.mjs` R14 R9 R18, `catalogue.test.mjs` R9 R17; `m/connections/converts-reads.test.mjs`:238.

**Ruling (recorded here; BOB may CHANGE it): negative-control drivers retire with N57, except `fleetbundles.control.mjs`.** A control proves once that its suite can fail; that result is recorded in the suite's own header, and the regression does not run a control. So the `*.control.mjs` and `nc-*` drivers of the kept suites are deleted with the rest (P11): `d526-refusal-order`, `conclude-project`, `d442-publish-writes-nothing`, `nc-pl18`, `nc-rec98`, `nc-rec102`, `nc-rec129`, `producer-provenance`, `migrate-released`, and the civicos-ui controls. `fleetbundles.control.mjs` is kept, because B1 (2) names it and `build/manifest.md`'s verify step rests on its suite. It was re-anchored and run as declared, and every arm held (below).

**Kept: 47 suites, 1 control, 2 probes, 12 helpers, fixtures.** What each proves that no module test does:

bio-plane (18):
- `test/system/fleetbundles.test.mjs` (manifest verify step): every fleet bundle and the plane's is stale-checked by input hash and byte identity, with self-tests that the guard fails. K641: agent-worker's inputs re-pinned 153 → 13 from the committed manifest. N441: docprofile's moved files dropped, site-profiles' 8 plane inputs pinned, the moved names asserted absent. N442/N31: arm (j) reads `verifyStatic`'s findings for `node bio-plane/scripts/bundles.mjs` (positive ≥ 4, TOTAL every finding, none naming `tools/bundles.mjs`) and no longer reads `fleet-bundle.mjs`' source.
- `test/fleetbundles.control.mjs`: the suite's 16 arms plus a baseline.
  - Re-pointed: the suite moved to `test/system/` (K612), so every arm had read no tally. Arm 6b now arms `src/plane/index.mjs`; arms 10, 10b and 10c arm the `REBUILD` constant.
  - Retired: arms 5(b) and 5(c), and `5b-comment`/`5b-code`, whose subjects (`tools/gates.mjs`, `scripts/coverage.mjs`) are deleted.
  - Run 2026-10-01: baseline 98/0. Every arm held as declared: 1 97/1, 1b 94/4, 2 94/4, 2-noinstall 91/1 (byte arm skipped by name), 2b 95/3, 3 95/3, 4 84/5, 5 98/0 (tree unchanged), 6 95/3, 6b 94/4, 7 97/1, 8 98/0 (tree unchanged), 9 91/7, 10 95/3 (all three (j) arms by name, (b) held), 10b 98/0, 10c 98/0. Every restore was verified by content and sha256.
- `test/system/row-census.test.mjs` with `row-census.mjs` (promotion R50): the census held against promotion's 1.50.0 pin.
  - K884: `fixtures/row-census-1.50.0.jsonl` is added, reproduced at stamp commit 49c6e2762a (986 rows, dd61926a…, the pin).
  - The negative control drives `compare` against a stamp made from the tree's own lines, so it holds at every stamp.
  - 1.47.0's declarations are retired. T20's L3+ changes are declared for T21's stamp: C-68.1's `where` (K887) and C-117.20–.22 (K899 (7), K912).
- `test/system/newgroup-bundle-fresh.test.mjs` (manifest verify step): the committed newgroup bundle is byte-identical to a fresh build.
- `test/system/bundle.test.mjs`: the shipped `dist/bio-plane.bundled.mjs` boots under workerd and passes `op=livefire`. No module test boots the bundle.
- `test/system/pdf-worker-binding.test.mjs`: the plane reaches the committed pdf-worker bundle over a real `PDF_WORKER` service binding, over HTTP.
- `test/system/resolveversion.test.mjs`: the live tree's 8 version sites agree, and the plane's own `wrangler.jsonc` disagreeing with its `package.json` is caught.
- `test/system/deploybindings.test.mjs`: bindings and limits derived from the real `wrangler.jsonc` (SELF slug, four services, one BROWSER, subrequests 10000 with its reason, `SUBRESOURCE_CAP` 400).
- `test/system/migrate-released.test.mjs`: every signed released plane's store (0.58.0–0.78.0, read from git) boots on today's plane with a fresh store's shape. Rows and `op=file` bytes survive, a second boot is clean, and the D-436 rule holds. Module tests synthesise one old shape only.
- `test/d57selflink.test.mjs`: the receipt `op=acquire` writes is the one `op=links` reads as a self-reference, with its detail and tally.
- `test/d606-perpage-ocr.test.mjs`: `op=acquire` through the whole plane hands its real `OCR_WORKER` binding to the read (module tests call `Extraction#read` directly).
- `test/cap13-reuse-pages.test.mjs`: the caller's manifest under reuse: the `not_reused` why codes, `reused_seen_in_documents` as a page count, the detail sentences, and fetch vs reuse end to end.
- `test/mk6-bundle-names-no-author.test.mjs`: after ratifying an observation, no object in the published R2 bucket, nor `publishedmanifest`/`publishedcase`, holds the observer's id, handle or cover.
- `test/stats-disclosure.test.mjs`: no class's whole `op=stats` moves across a real lead and look. It also proves livefire's `storeState` per class, the count on `op=connect`, and purge with real leads.
- `test/tier2-wire.test.mjs`: through `op=pdfstructure`/`op=acquire` with the built pdf-worker bundle. It proves the decline note reaching the caller, the degradation class through the op, and the 73618 merge.
- `test/conclude-project.test.mjs`: through the ops: the withdrawal's Session Log entry, a `conclusions` rewrite through `op=promote` named by `op=audit`, and the strength pair unchanged around a conclusion.
- `test/members.test.mjs`: the sign-in refusal sentence's content (no second person; names never-registered and no-longer-active; never echoes the role).
- `test/pdfstructure.test.mjs`: the tier-1 reader's width sources, Tw, the pen across BT/ET/Q/cm, D-517's separator withdrawal, and every real-document figure.
- `test/d526-refusal-order.test.mjs`: control-plane's `promotedTypeOf` with no envelope type (NOT_CAPABLE at the door, the OWNER stamp, D-78's restamp). Re-anchored: section 2's document states `surfaced_by` (inquiry R11, K681).

civicos-ui (29; legacy-ui is live and Bob's, K633; every one green against today's `app.html`):
- `act-ballot`, `act-dispose`, `analyst-vocabulary` (arm S re-pointed from the deleted `store.mjs` to `basis-versions/grammar.mjs`; arm C re-stated over the directory as it is), `artifact-fetch`, `cite-act`, `conclude-act`, `document-page`, `elicitation`, `finder`, `glossary-nav`, `group-identity-surface`, `group-surface`, `header-facts`, `inquiry-page`, `meaning-arms`, `members-roster`, `notifications`, `progression-revision`, `project-workspace`, `publication-entry`, `queue-allclear-limit`, `queue-recipients`, `record-list`, `release-flow`, `review-copy`.
- `seals-backrestore`, `several-cases-choice` (C-44.2 re-anchored at `public-read/checks.mjs`), `statement-ack`, and `stdio-census` (floors lowered to the printed 23 and 29; `check-semantics.mjs` left its residual list).
- Each holds one member-facing behaviour of `app.html` (its header says which), against a mock or the real plane.

Helpers kept: `bio-plane/test/adoptable-reading.mjs`, `budget.mjs`, `caseceremony.mjs`, `docdates.mjs`, `jsonc.mjs`, `publishingproject.mjs`, `system/row-census.mjs`, `civicos-ui/test/extract.mjs`, `analyst-vocabulary.mjs` (also read by `m/strength/vocabulary.mjs`), `run.mjs` (read by stdio-census). `stdio.mjs` and `sandbox.mjs` are test-support's.

Probes kept, each read by something else:
- `ocr-measure-probe.mjs`: read as text by `pdf-worker/test/pagepixels-corpus.probe.mjs`.
- `tier-pagewise.probe.mjs`: `fixtures/cpdf20/PROVENANCE.md`'s recipe for `tier2-recorded.json`.

Fixtures kept:
- `cpdf20/*`: read by `m/extraction/convert-tiers.test.mjs`.
- `d460/*`: read by `convert-ocr.test.mjs` and `ocr-worker`.
- `fw20/*`: read by `staffdirectory.test.mjs`.
- `legistar-agenda-1425405.pdf`: read by `convert-chain` and `naming-convert`.
- `row-census-1.50.0.jsonl`.
- `civicos-ui/test/fixtures/*.json`: read by docprofile's tests.

**The release row (B1 (3)) and the three extra items (N444, N450, K641):**
- **N31's rest**:
  - Met: fleetbundles arm (j) and its control read the one remedy.
  - Moot: `owed-controls`, `provenance-floor.control`, `walkfloor.control` and `d301-census.control` are deleted (all failed at load).
- **N57**: met and moot. Every control and `nc-*` driver is retired (my ruling above), except `fleetbundles.control.mjs`, which was re-anchored and run as declared.
- **N68**:
  - legacy-tests' share is moot: `check-semantics.mjs` is deleted (it failed at load).
  - legacy-index's share (`op-claims`) is moot: the suite is deleted (it failed at load).
- **N70**: legacy-tests' share (`owed-controls`), legacy-index's (`pensweep.mjs`) and affordances' (N45, `d311-roster-affordances`, which failed at load) are all moot, deleted.
- **N248**: moot. `case-project-conclusion`, `casesearched`, `conclude-project`'s and d526's controls, `refusal-codes.control`, `several-cases-choice.control`, operator-attest, caseobject and `refusal-wire` are deleted. d526's suite is kept and green without its control.
- **N279**: moot. `refusal-codes.control`, `verdict-excluder.control`, d444's arms and caseobject's control are deleted.
- **N431**: moot, `observation-log.test.mjs` is deleted (it failed at load).
- **N434**: moot, `plane-refusal-wire.mjs` is deleted.
- **N436**: moot. `daemon-token`, `aicredential`, `fence` and `system/d270-refusal-truth` are deleted (all failed at load).
- **N438**: moot. `migrate.test`, `system/hygiene`, `instrument-deps.mjs` and the drivers spawning `coverage.mjs` are deleted.
- **N441**: met (above).
- **N442**: met (suite and control).
- **N448's legacy-tests share**:
  - Moot: `tools/` is deleted, so `row-census.mjs` reads nothing there to execute.
  - Met: the re-pin moved on to 1.50.0 (K884).
- **N444**: `civicos-ui/check-refusal-codes.mjs` is deleted. It failed at load (`:139`, `walkfloor.mjs`), so it proved nothing at HEAD. The DEC-49 totality it guarded is control-plane's `test/m/control-plane/families.test.mjs` R22 (:47, :65). No proof of its own is left without a module test.
- **N450**: moot. `test/capturerequests.control.mjs` and `test/system/fence-e2e.control.mjs` are deleted with their suites (`capturerequests.test`, `fence-e2e.test` failed at load).
- **K641**: met. fleetbundles is 98/0 with no SKIP.

**For BOB:**
1. *`modules.json`*: every path in legacy-tests' `paths` is deleted (`civicos-ui/check-refusal-codes.mjs`, `check-semantics.mjs`, `bio-plane/scripts/battery.mjs`, `armdecay.mjs`, `budgetsweep.mjs`, `control-register.mjs`, `finallyexit.mjs`, `identity-claims.mjs`, `pensweep.mjs`, `residue.mjs`, `tools/fw21-onpoint-probe.mjs`). The `tests` (`bio-plane/test/` outside `m/`, `civicos-ui/test/`) still hold the kept files above.
2. *`regression.yml`* should run, beside each package's `npm test`:
   - `node --test` over the 47 kept suites: `bio-plane/test/*.test.mjs`, `bio-plane/test/system/*.test.mjs` and `civicos-ui/test/*.test.mjs`, from the repository root, after `npm ci` in `bio-plane`, `pdf-worker`, `ocr-worker` and `newgroup`. `ssh-keygen` is needed on PATH for several-cases-choice.
   - bio-plane's `npm run test:system` already globs `test/system/**/*.test.mjs`.
3. *Generated artifacts*: none staled (no product file changed).
4. *Seen in other modules (REPORT)*:
   - `agent-worker/test/agent-worker.control.mjs`:534 spawns the deleted `bio-plane/scripts/battery.mjs`.
   - `agent-worker/test/harness.control.mjs`:247–248 runs `airun.test.mjs` and `skillsequencing.test.mjs`, which failed at load before this job and are now deleted.
   - `civicos-ui/check-mock-envelope.mjs` (legacy-ui) names `preauth-vocabulary.test.mjs` (deleted) in its arm C's control notes.
   - `checks/run.mjs`' coverage reports control-plane R42 and queue-producers R19 named by no test. The same holds on `tranche/T20`, so it is not from this job.
5. *Notes outside my paths that name a deleted file (K890)*: the list follows, as `file`: name :lines. It omits `build/` and `docs/` records, generated bundles (`dist/`, `newgroup/src/release.mjs`' embedded source), and names a kept file also carries.
- `agent-worker/fleet-member.json`: battery.mjs :13
- `agent-worker/src/index.mjs`: check-refusal-codes.mjs :230
- `agent-worker/src/subsession.mjs`: check-refusal-codes.mjs :87
- `agent-worker/test/agent-worker.control.mjs`: battery.mjs :4, :528, :534
- `agent-worker/test/agent-worker.test.mjs`: battery.mjs :40; airun.test.mjs :696
- `agent-worker/test/fanout.control.mjs`: battery.mjs :4
- `agent-worker/test/harness.control.mjs`: battery.mjs :4; airun.test.mjs :120, :154, :247, :651; skillsequencing.test.mjs :120, :248
- `agent-worker/test/harness.test.mjs`: airun.test.mjs :43, :1226, :1232; nc-rec100.mjs :1628
- `agent-worker/test/requirements.test.mjs`: skillsequencing.test.mjs :1311
- `agent-worker/test/versions.test.mjs`: aicredential.test.mjs :33
- `agent-worker/test/wire-vocabulary.control.mjs`: battery.mjs :5
- `bio-plane/scripts/fleet-bundle.mjs`: battery.mjs :68, :109, :134, :183; hygiene.test.mjs :98
- `bio-plane/scripts/provenance.mjs`: battery.mjs :5, :16; hygiene.test.mjs :7
- `bio-plane/src/actions/index.mjs`: check-refusal-codes.mjs :1550
- `bio-plane/src/actions/schema.mjs`: hygiene.test.mjs :35, :159
- `bio-plane/src/affordances.mjs`: d311-roster-affordances.test.mjs :2065, :2084; caseproduction.test.mjs :2372; surface-registry.test.mjs :2534
- `bio-plane/src/ai-runs/index.mjs`: run-conditions.test.mjs :322; severedhomes.test.mjs :583; check-refusal-codes.mjs :760, :936; airun.test.mjs :1208; derivation-bounds.test.mjs :1337; d260-resume.test.mjs :1519; gate-reads.test.mjs :1890; meaning-bounds.test.mjs :1984, :2161, :2242, :2269, :2277; provenance-marker.test.mjs :2056
- `bio-plane/src/basis-versions/checks.mjs`: check-refusal-codes.mjs :665
- `bio-plane/src/basis-versions/grammar.mjs`: hygiene.test.mjs :288
- `bio-plane/src/bias/checks.mjs`: repair-reachability.test.mjs :202; check-refusal-codes.mjs :470
- `bio-plane/src/bias/schema.mjs`: hygiene.test.mjs :34
- `bio-plane/src/calibration/schema.mjs`: versionchain.test.mjs :44
- `bio-plane/src/citation/index.mjs`: scale.mjs :51
- `bio-plane/src/connections/pair.mjs`: check-refusal-codes.mjs :10
- `bio-plane/src/connections/schema.mjs`: hygiene.test.mjs :170
- `bio-plane/src/content/extent-core.mjs`: check-refusal-codes.mjs :33, :590; capture-container-extent.test.mjs :377; nc-rec85.mjs :663
- `bio-plane/src/control-plane/checks.mjs`: risk-tier.test.mjs :101; refusal-wire.test.mjs :130
- `bio-plane/src/control-plane/dispatch.mjs`: project-sight.test.mjs :35
- `bio-plane/src/control-plane/index.mjs`: refusal-wire.test.mjs :147; plane-envelope.test.mjs :236; preauth-vocabulary.test.mjs :660; content-extent.test.mjs :1390; identity-claims.mjs :1431, :1496; identity-claims.test.mjs :1650, :2432; risk-tier.test.mjs :2039, :2052; aicredential.test.mjs :2553
- `bio-plane/src/drive.mjs`: hygiene.test.mjs :338
- `bio-plane/src/extractrun.mjs`: skillsequencing.test.mjs :92; nc-sk8.mjs :194
- `bio-plane/src/gate.mjs`: d470-catalog-census.test.mjs :58, :67, :77, :84, :130, :493, :517, :558; ratify.test.mjs :132
- `bio-plane/src/inquiry-grammar/grammar.mjs`: nc-mk2.mjs :998
- `bio-plane/src/inquiry/index.mjs`: hygiene.test.mjs :2337, :2622; derivation-bounds.test.mjs :2389, :2837; content-extent.test.mjs :2875
- `bio-plane/src/inquiry/schema.mjs`: hygiene.test.mjs :51, :87, :92
- `bio-plane/src/livefire.mjs`: refusal-wire.test.mjs :210
- `bio-plane/src/membership/index.mjs`: versionnotice.test.mjs :902; derivation-bounds.test.mjs :916
- `bio-plane/src/membership/schema.mjs`: versionnotice.test.mjs :76
- `bio-plane/src/observation-log/checks.mjs`: check-refusal-codes.mjs :172
- `bio-plane/src/observation-log/vocabulary.mjs`: check-semantics.mjs :57; check-refusal-codes.mjs :1439
- `bio-plane/src/op-declarations/index.mjs`: versionstate.control.mjs :850; d270-refusal-truth.test.mjs :1267
- `bio-plane/src/pdfstructure.mjs`: producer-provenance.test.mjs :709; cpdf18-pdf-images.test.mjs :2356
- `bio-plane/src/plane/held.mjs`: project-sight.test.mjs :37
- `bio-plane/src/progressions/schema.mjs`: hygiene.test.mjs :243
- `bio-plane/src/provenance/index.mjs`: versionchain.test.mjs :1626; meaning-bounds.test.mjs :2250; provenance-marker.test.mjs :2351
- `bio-plane/src/provenance/register-checks.mjs`: provenance-chain.test.mjs :109; repair-reachability.test.mjs :268
- `bio-plane/src/provenance/schema.mjs`: airuns.test.mjs :171; nc-rec69-selects.mjs :174
- `bio-plane/src/public-read/door.mjs`: preauth-vocabulary.test.mjs :40; auth-surface.test.mjs :73
- `bio-plane/src/public-read/index.mjs`: deliverer.control.mjs :726; meaning-bounds.test.mjs :874
- `bio-plane/src/publication/index.mjs`: meaning-bounds.test.mjs :655, :683, :1408, :2487; deliverer.control.mjs :2336; frontier-chunk.test.mjs :2600; derivation-bounds.test.mjs :2602
- `bio-plane/src/publication/schema.mjs`: hygiene.test.mjs :526
- `bio-plane/src/publication/worker.mjs`: preauth-vocabulary.test.mjs :546
- `bio-plane/src/query.mjs`: fieldread.control.mjs :1379, :2691; project-sight.test.mjs :1776
- `bio-plane/src/queue-producers/index.mjs`: derivation-bounds.test.mjs :915; run-conditions.test.mjs :1194
- `bio-plane/src/queue/schema.mjs`: hygiene.test.mjs :40, :100; airuns.test.mjs :113
- `bio-plane/src/queuestate.mjs`: check-refusal-codes.mjs :237
- `bio-plane/src/ratification/checks.mjs`: repair-reachability.test.mjs :208; ratify-authority.test.mjs :1089
- `bio-plane/src/ratification/ops.mjs`: hygiene.test.mjs :64; plane-envelope.test.mjs :845
- `bio-plane/src/record-core/schema.mjs`: hygiene.test.mjs :101
- `bio-plane/src/record-grammar/bundle.mjs`: repair-reachability.test.mjs :52
- `bio-plane/src/record-grammar/grades.mjs`: hygiene.test.mjs :31
- `bio-plane/src/record-grammar/labels.mjs`: skillpack.test.mjs :197; sufficiency-state.control.mjs :228
- `bio-plane/src/retrieval/index.mjs`: meaning-bounds.test.mjs :849
- `bio-plane/src/review/checks.mjs`: check-refusal-codes.mjs :23
- `bio-plane/src/run-rules/checks.mjs`: airun.test.mjs :221; check-refusal-codes.mjs :326, :393
- `bio-plane/src/run-rules/rules.mjs`: skillsequencing.test.mjs :241; airun.test.mjs :309; check-refusal-codes.mjs :312, :393, :423, :677, :713, :767
- `bio-plane/src/setup.mjs`: add-surface.test.mjs :346; conformance.test.mjs :966, :973
- `bio-plane/src/skillpack.mjs`: check-refusal-codes.mjs :258
- `bio-plane/src/strength/checks.mjs`: strengthpair.control.mjs :31
- `bio-plane/src/strength/schema.mjs`: hygiene.test.mjs :20
- `bio-plane/src/tokens.mjs`: d260-resume.test.mjs :128
- `bio-plane/test/m/acquisition/grades.test.mjs`: drive-convert.control.mjs :2; drive-convert.test.mjs :2; daemon-token.test.mjs :4
- `bio-plane/test/m/acquisition/profile.test.mjs`: framework-digest-audit.test.mjs :4, :19; capture-container-extent.test.mjs :5, :63, :92, :143
- `bio-plane/test/m/acquisition/selflink-render.test.mjs`: d522-unattended-render.test.mjs :2
- `bio-plane/test/m/acquisition/subresources-walk.test.mjs`: cap14-reused-from.test.mjs :3
- `bio-plane/test/m/basis-versions/d216-sharing.test.mjs`: d216-sharing.probe.mjs :2
- `bio-plane/test/m/case-grammar/citations.test.mjs`: ratify-authority.test.mjs :2
- `bio-plane/test/m/connections/converts-derivation.test.mjs`: d241-derivation-stated.test.mjs :2; connection-derive-sweep.test.mjs :4
- `bio-plane/test/m/connections/converts-reads.test.mjs`: content-reads.test.mjs :2; d280-strengthbar.test.mjs :5; d216-sharing.probe.mjs :7
- `bio-plane/test/m/content/converts-notice.test.mjs`: versiongrade.test.mjs :1; versionnotice.test.mjs :2
- `bio-plane/test/m/content/converts-reads.test.mjs`: content-reads.test.mjs :1; textchain.test.mjs :5
- `bio-plane/test/m/credentials/ai.test.mjs`: aicredential.test.mjs :2, :21
- `bio-plane/test/m/credentials/converts.test.mjs`: signer-enrolment.test.mjs :1; aicredential.test.mjs :4
- `bio-plane/test/m/entities/naming-convert.test.mjs`: readingname.test.mjs :2, :18, :32, :61, :71, :106, :123, :139, :170; meaningquery.test.mjs :5, :180
- `bio-plane/test/m/extraction/convert-chain.test.mjs`: drive-convert.test.mjs :4, :27, :154; producer-provenance.test.mjs :8; reading-wire.test.mjs :10
- `bio-plane/test/m/extraction/convert-extent.test.mjs`: fw19-extent-arms.test.mjs :4; capture-container-extent.test.mjs :5
- `bio-plane/test/m/extraction/convert-names.test.mjs`: calibration.test.mjs :2, :17, :23; readingname.test.mjs :4, :53, :60; extractrun.test.mjs :5, :104, :105, :120, :136
- `bio-plane/test/m/extraction/convert-ocr.test.mjs`: textchain.test.mjs :2, :213
- `bio-plane/test/m/extraction/convert-record.test.mjs`: reading-position-occurrences.test.mjs :2, :26, :54
- `bio-plane/test/m/extraction/convert-tiers.test.mjs`: tier3-layer-parts.test.mjs :2, :179
- `bio-plane/test/m/host-governor/holding.test.mjs`: queue-conditions.test.mjs :1
- `bio-plane/test/m/inquiry/capture-bound.test.mjs`: nc-rec88.mjs :6
- `bio-plane/test/m/inquiry/case-grammar.test.mjs`: publish.test.mjs :2; multifinding.test.mjs :5; caseproduction.test.mjs :8; grounds.test.mjs :10
- `bio-plane/test/m/inquiry/content-legs.test.mjs`: content-extent-arms.test.mjs :3; content-extent.test.mjs :6; content-reads.test.mjs :9; rec220-version-pin.test.mjs :11
- `bio-plane/test/m/inquiry/lifecycle-reads.test.mjs`: inquiry.test.mjs :2; rec173-migration-replay.test.mjs :7; meaningquery.test.mjs :10; reevaluation.test.mjs :13
- `bio-plane/test/m/inquiry/testimony-inherited.test.mjs`: testimonyaxis.test.mjs :7; audit-inheritance.test.mjs :11
- `bio-plane/test/m/instance-setup/worker-page.test.mjs`: group-public.test.mjs :4; browse.test.mjs :5; inquiry.test.mjs :5; risk-tier.test.mjs :5
- `bio-plane/test/m/instance-setup/worker-reports.test.mjs`: installer.test.mjs :5; livefire.test.mjs :5; d334-monitor-credential.test.mjs :6
- `bio-plane/test/m/progressions/feeds.test.mjs`: d266scope.test.mjs :90; queue.test.mjs :133
- `bio-plane/test/m/provenance/convert-chain-marker.test.mjs`: provenance-chain.test.mjs :1; provenance-marker.test.mjs :1
- `bio-plane/test/m/provenance/convert-testimony-digest.test.mjs`: framework-digest-audit.test.mjs :5, :188
- `bio-plane/test/m/provenance/convert-versionchain.test.mjs`: versionchain.test.mjs :1
- `bio-plane/test/m/public-read/convert-caseflip.test.mjs`: caseflip.test.mjs :1
- `bio-plane/test/m/public-read/convert-caseobject.test.mjs`: caseobject.test.mjs :1
- `bio-plane/test/m/public-read/convert-casesign.test.mjs`: casesign.test.mjs :1
- `bio-plane/test/m/public-read/convert-d442-publish-writes-nothing.test.mjs`: d442-publish-writes-nothing.test.mjs :1
- `bio-plane/test/m/public-read/convert-deliverer.test.mjs`: deliverer.test.mjs :1
- `bio-plane/test/m/public-read/convert-multifinding.test.mjs`: multifinding.test.mjs :1
- `bio-plane/test/m/public-read/convert-publish.test.mjs`: publish.test.mjs :1
- `bio-plane/test/m/public-read/convert-publishedcase.test.mjs`: publishedcase.test.mjs :1
- `bio-plane/test/m/public-read/convert-ratify.test.mjs`: ratify.test.mjs :1
- `bio-plane/test/m/publication/convert-casesign.test.mjs`: casesign.test.mjs :1
- `bio-plane/test/m/publication/convert-d442-publish-writes-nothing.test.mjs`: d442-publish-writes-nothing.test.mjs :1
- `bio-plane/test/m/publication/convert-deliverer.test.mjs`: deliverer.test.mjs :1
- `bio-plane/test/m/publication/convert-ratify-authority.test.mjs`: ratify-authority.test.mjs :1
- `bio-plane/test/m/publication/convert-ratify-envelope.test.mjs`: ratify-envelope.test.mjs :1
- `bio-plane/test/m/queue-producers/conditions.test.mjs`: queue-conditions.test.mjs :1
- `bio-plane/test/m/queue-producers/lead.test.mjs`: leadslug.test.mjs :1
- `bio-plane/test/m/queue-producers/shared.test.mjs`: project-sight.test.mjs :5
- `bio-plane/test/m/ratification/converted-a.test.mjs`: caseproduction.test.mjs :2, :53; d84-case-manifest.test.mjs :2, :177; signer-enrolment.test.mjs :3, :280
- `bio-plane/test/m/ratification/converted-b.test.mjs`: publish.test.mjs :2, :31; operator-attest.test.mjs :3, :293; testimonyaxis.test.mjs :3, :189
- `bio-plane/test/m/ratification/converted-c.test.mjs`: casesign.test.mjs :3; d442-publish-writes-nothing.test.mjs :4; ratify-authority.test.mjs :5; ratify-envelope.test.mjs :6
- `bio-plane/test/m/ratification/converted-d.test.mjs`: deliverer.test.mjs :2, :241; grounds.test.mjs :2, :339; multifinding.test.mjs :2, :417; ratify.test.mjs :2, :69
- `bio-plane/test/m/retrieval/legs.test.mjs`: meaningquery.test.mjs :4; rec108-cache-asof.test.mjs :4
- `bio-plane/test/m/skills/doctrine.test.mjs`: skillsequencing.test.mjs :169
- `bio-plane/test/m/strength/cache.test.mjs`: rec108-cache-asof.test.mjs :3
- `bio-plane/test/m/strength/vocabulary.test.mjs`: analystvocab.test.mjs :5
- `civicos-ui/README.md`: check-semantics.mjs :32, :35; link-surface.test.mjs :38; capture-honesty.test.mjs :40; add-surface.test.mjs :41
- `civicos-ui/app.html`: ai-session-wire.test.mjs :78, :22858, :23038, :23094; ai-session-context.test.mjs :80, :22816, :23215; publishedcase.test.mjs :815, :1904, :20461, :21340, :21601; auth-surface.test.mjs :1112; question-npc.test.mjs :1271; intent-write.test.mjs :1361, :16906, :17493; identifier-vocabulary.test.mjs :1384, :22567; check-semantics.mjs :1750, :1782, :1885, :1932, :1967, :1994, :2125, :3244, :12019, :12587, :12599, :14012, :23573; bias-vocabulary.test.mjs :1784; surface-registry.test.mjs :2145, :22935; custodial-acts.test.mjs :2261; recipe-drive.test.mjs :2524; conformance.test.mjs :3341; admission-translation.test.mjs :7814; refusal-translation-surface.test.mjs :7815; check-refusal-codes.mjs :7966, :21846; content-extent.test.mjs :8240; ui102-laws-proposals.test.mjs :9681; bound-sweep.test.mjs :10999, :16664, :26296, :26302; meaning-arms.walks.mjs :12682; passage-surface.test.mjs :13375; onpoint-choice.test.mjs :18230; add-surface.test.mjs :19831, :19846, :20368; add-surface.control.mjs :19833; preauth-vocabulary.test.mjs :21635, :22533, :25518, :26175, :26525; caseflip.test.mjs :21855; connections-sidebar.test.mjs :23212; version-review.test.mjs :23497, :23571, :24044
- `civicos-ui/check-mock-envelope.mjs`: envelope-probe.mjs :29, :314, :315; preauth-vocabulary.test.mjs :114, :116, :383; act-attest.test.mjs :292; act-proposal.test.mjs :292; document-structure.test.mjs :293; intent-write.test.mjs :300; publishedcase.test.mjs :304, :382; queue.test.mjs :305; subject-view.test.mjs :306
- `docprofile/test/reading-position.test.mjs`: reading-position-occurrences.test.mjs :6; reading-wire.test.mjs :8
- `ocr-worker/fleet-member.json`: battery.mjs :14
- `ocr-worker/scripts/embed-tesslib.mjs`: battery.mjs :23
- `pdf-worker/fleet-member.json`: battery.mjs :13
- `pdf-worker/test/agenda-scan-census.probe.mjs`: battery.mjs :4; ocr-member-e2e.test.mjs :8, :32
- `pdf-worker/test/pagepixels-corpus.probe.mjs`: battery.mjs :4

**Tests and checks run** (2026-10-01, at 6280db0024 plus the two re-statements):
- Each kept suite with `node --test`: 47 of 47 pass, 0 fail, no SKIP (analyst-vocabulary on its re-run after the arm C re-statement).
  - fleetbundles: 98 pass, 0 fail.
  - row-census: 8 pass, 0 fail.
  - d526: 31 passed, 0 failed.
  - migrate-released: exit 0, 200 s.
- `fleetbundles.control.mjs`: every arm held (above).
- Module tests that read kept fixtures and helpers (`test/m/extraction`, `strength`, `test-support`, `entities`, `docprofile/test`): 380 pass, 0 fail.
- `node checks/format.mjs`: 0 failures. `architecture.mjs bio legacy-tests`: 0 failures. `coverage.mjs bio legacy-tests`: 0 of 0, 0 failures. `ownership.mjs bio legacy-tests tranche/T20`: 491 files, 0 failures.
- `checks/run.mjs`: architecture 0 failures (format 0; coverage's 2 failures are other modules', item 4).

Size (session_01Pz7VnRaMdnBMJGLR951Cnt): test runs 310, module lines 20629

## J1 · COMPLETE

B1 applied; record's "Completion" section has the detail.

Deleted 461 files: 197 old suites (187 failed at load, 10 whose whole proof named module tests give), 130 controls, 86 nc-* drivers, 7 probes, 28 helpers/preloads, 3 unused fixtures, the 1.43.0–1.47.0 census snapshots, and all 10 scripts in my paths (battery and instruments, check-refusal-codes, check-semantics). tools/fw21-onpoint-probe.mjs was already gone.

Kept 47 suites (18 bio-plane incl. fleetbundles, newgroup-bundle-fresh, row-census; 29 civicos-ui), fleetbundles.control.mjs, 2 probes other files read, helpers and fixtures; each kept file's proof is in the record. All re-pointed to src/plane/index.mjs, so plane's deletion of src/index.mjs stales nothing of mine.

Proof: 47/47 kept suites pass, 0 fail, no SKIP (fleetbundles 98/0, row-census 8/0); fleetbundles.control run, every arm held; format, architecture, coverage (0/0), ownership 0 failures; checks/run.mjs architecture green (coverage's 2 failures, control-plane R42 and queue-producers R19, are on tranche/T20 too).

Release row: met N31 (arm j), N441, N442, N448 (1.50.0 re-pin), K641, K884. Moot (file deleted): N31's controls, N57, N68, N70's three shares, N248, N279, N431, N434, N436, N438, N448's tools/ half, N450. N444: deleted (failed at load); its DEC-49 totality is control-plane families.test.mjs R22, no proof left without a module test.

Ruling for you to confirm or CHANGE: negative-control drivers retire with N57, except fleetbundles.control.mjs (the kept suites' controls are deleted; their results stay in the suites' headers).

For BOB: modules.json, every legacy-tests path is deleted (tests still hold the kept files); regression.yml should add node --test over bio-plane/test/*.test.mjs, test/system/*.test.mjs, civicos-ui/test/*.test.mjs (ssh-keygen needed); no generated artifact staled; REPORT: agent-worker/test/agent-worker.control.mjs:534 spawns the deleted battery.mjs, harness.control.mjs:247-248 runs deleted plane suites, civicos-ui/check-mock-envelope.mjs names a deleted suite; K890's note list (136 files) is in the record.
