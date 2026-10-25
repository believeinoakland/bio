# Audit of fix round 10 of T51 (build/plan/fix-round-10-T51.md), against origin/tranche/T51

Audited tip: `0ec7b6e5da` (origin/tranche/T51 at the audit; the tranche and job branches kept moving while I read: the last rulings line read is K5176, job records read from origin/job/T51/* at the same moment). Plan read whole (45,560 bytes); every ruling line cited was read whole. `checks/fixtures.mjs` was run read-only on an export of the tranche (commit a1780f5c6b, one design-merge commit older than the tip): 2,038 failing lines. Read-only audit: nothing in /home/user/bio was changed.

States: DONE (evidence cited), RUNNING (a running or completed-but-unmerged job carries it; job records named), NOT DONE (nothing shows it done or carried; includes 'placed in the handoff but no START written'), WITHDRAWN (closed by the plan or a ruling without work). A requirement mark left on a met requirement is not an owed item; those are listed in the not-yet-met table as 'mark looks stale'.

Running sessions on the tranche (plan `**Jobs**` line, compared with each job record's Status session): CASE-AUTHORING #44, CONTENT #23, CONTROL-PLANE #62, SCREENS-ACTION #19, SCREENS-DAILY #22, SCREENS-INVESTIGATE #16, SCREENS-PUBLISH #22, SCREENS-SETTINGS #19, ADMISSION #19 (new, no record yet), STORE-REQUEST #3, SCREENS-INQUIRY #30 (new, no record yet). Complete but not merged: STORE-ASSEMBLY #3 (J8-J9). INVESTIGATION #4 is NEEDS BOB on the secondary account (not part of this plan).

## Counts

Numbered items 1-86 split into sub-rows where an item has independent parts: 152 rows: DONE 83, RUNNING 32, NOT DONE 30, WITHDRAWN 7, UNKNOWN 0.
Section 2 (the fixture round, Wave A/B, no numbered items): 20 rows: DONE 5, RUNNING 7, NOT DONE 8.
`not yet met: T51` marks: 148 lines in build/requirements/*.md: NO JOB; code/test exists, mark looks stale 59, CARRIED: RUNNING 22, NO JOB; met-state UNKNOWN 46, NOT PLACED 21.

## Table of items (section "Entries found so far", section 3, items 1-86)

| Item | State | Evidence |
|---|---|---|
| 1a site deploy carries INSTALLER_ADDRESS | NOT DONE | site/wrangler.jsonc `vars` holds only LISTED_GROUPS and its comment says INSTALLER_ADDRESS stays unset until release; no release/deploy file passes it (git grep: only site/src, site/build.mjs, journey-check/local.mjs and tests name it); K5039 records only BOB's one-time `--var` deploy 97a23ece. No job or ruling places it. |
| 1b /start with no installer address draws the step without a dead link (test) | DONE | site/test/site.test.mjs:265-275 asserts the 'Create your team' step is drawn with no `href` when INSTALLER_ADDRESS is unset (pre-existing test; passes on the shape the plan asks). |
| 2 site fourth 'What you need' bullet / places-ready wording | WITHDRAWN | K5043: drawing at SITE_COMMIT has neither; 'Oakland, Alameda County and California' is the design gap table, not the site: no defect; bullet deferred to next.md N1275 (build/plan/next.md:50; reason: design branch not on main). Closed by ruling, not by work. |
| 3 installer 'Questions people ask' block | WITHDRAWN | K5043 as item 2: next.md N1275. |
| 4 LOAD-RED 5 (1): study reproduces, names the cause; deployed-plane alarm-sweep check | NOT DONE | PLANE #61 J62 (K5081, K5121): not reproduced in 9 whole-file L-PIN runs, 'no cause established', deployed check 'rides biosmoke8's redeploy' (not made). K4966 says a pass does not clear it. No job open for it. |
| 5 relative product root (checks/fixtures.mjs) | WITHDRAWN | K5078: closed, no defect (zeros came from running `.` inside the process repo). |
| 6 test-support generators.test.mjs:114 passes when pdf.js throws | NOT DONE | bio-plane/test/m/test-support/generators.test.mjs:114 is still `if (o.skip // o.error) return;`. Owed to the §5.10 pass, which has not run (handoff 'Owed still: 13, 15 and 33'; no ruling records the pass). |
| 7 conformance fixture.mjs:178 to concludeAct; t45 to caseCheckOfNoSuchCase | DONE | K5116; conformance/fixture.mjs:40,188 import concludeAct; t45.test.mjs:403 caseCheckOfNoSuchCase().refusal; conformance record J8 COMPLETE. |
| 8a control-plane r72-parted: founder's parted upload | RUNNING | CONTROL-PLANE #62 (WORKING): test at r72-parted.test.mjs:203 exists on job/T51/control-plane only; START B89 entry 4. |
| 8b fold session+reauthdue; r10-caseratify-chain.test.mjs (door chain <= 10) | RUNNING | r10-caseratify-chain.test.mjs on job/T51/control-plane only, red by name; the fold is admission R33 = ADMISSION #19 (new session, START B-k5170, no record yet); public-read's 4-hop assembly DONE (K5094, R44 struck). ratification R60 still marked. |
| 8c selftest arm reads extractionOf(ctx).migrationCounts() | DONE | instance-setup R105, K5174 (struck); setup.mjs:2708 `selftestMigrations() { return extractionOf(this.#ctx).migrationCounts(); }`. Driving it through the door is item 85 (1). |
| 8d statementack.test.mjs takes real statementAck().ok shape | RUNNING | job/T51/control-plane statementack.test.mjs:12-26 uses `statementAck()` from case-inputs/fixtures (`REAL.ok`, `acknowledgement:`); tranche copy still returns `acknowledged: true`. Not merged. |
| 9 inquiry R85 struck after inquiry, basis-version-grammar R3, basis-versions | DONE | K5113 'R85 struck'; build/requirements/inquiry.md R85 carries no mark; basis-versions own-reading test 'R51, R3 (K5077)' (K5109); basis-version-grammar merged (K5090). (inquiry R8's mark is a different line, see table.) |
| 10 wizard-scripts r51.test.mjs derives the 45 acts | DONE | K5080 (follow-up 10 merged; 'R51's test reads R51's own list from its requirement line and a control act'); r51.test.mjs:20. |
| 11 csv-reader one-line CSV of 16,385 columns refused | DONE | K5082; csv-reader/index.mjs:815-816 (`Math.max(info.cols, info.wide)` > CSV_COLUMNS_MAX); text.test.mjs:216; R26 (K5157) merged K5161. |
| 12 plane r9-jobs.test.mjs:318 takes extraction's readHeld failure | NOT DONE | plane Wave B has not started (plane #61 merged K5121; no later START); `checks/fixtures.mjs` lists 19 lines in plane/r9-jobs.test.mjs. Handoff: starts after STORE-ASSEMBLY #3 merges. |
| 13a extraction: its remaining fixture lines | NOT DONE | extraction fixtures --list: 2 left (t44.test.mjs:93 waits on plane's run; t48.test.mjs:30 transcribe `contract-no-run`); both wait on plane's CHANGE (items 12, 23). |
| 13b plane r10-land-yields platform check of R111 (P) at the redeploy | NOT DONE | test exists (plane/r10-land-yields.test.mjs); redeploy of biosmoke8 not yet made (handoff 'After the round'). |
| 14 case-carriage native SHA-256 over 1 MiB; plane r10-filing-stall under L-PIN | DONE | K5085; case-carriage/index.mjs:163 `crypto.subtle.digest`; plane/r10-filing-stall.test.mjs exists. |
| 15 test-support registrar stub re-pointed to plane's real job-registrar | NOT DONE | §5.10 pass not run; fixtures --list still lists test-support job-registrar-stub.mjs:23,35,38,56 and plane r10-fixtures-run.test.mjs:17 orphan-run. |
| 16a ratification lines to public-read's assembleCaseContainerRefusal; g54-entry FIX-E | DONE | K5097; ratification/g54-paths.test.mjs:19,23 and g57-heal.test.mjs:22 import it. |
| 16b ratification R60 struck when door chain <= 11 | RUNNING | R60 still marked; waits on admission R33 (ADMISSION #19 running) and control-plane #62's r10-caseratify-chain (K5170). |
| 17 escalation draft.test.mjs:113 to consequencesOfRefusal | DONE | K5085; escalation/draft.test.mjs:7,113. |
| 18 publication R15 built:true; public-read chain to 4 | DONE | K5088 (R15 struck), K5094 (public-read R44 struck); public-read/chain.test.mjs:68. |
| 19 op-grades owners.test.mjs:195 moneyingestread graded | DONE | K5097 merged (follow-up 19); K5138 'op-grades owners.test.mjs 13 of 13 with ruleservicesstate'. |
| 20 case-authoring R31 chain test (two grounded legs, one severed, conclude, prepare) | RUNNING | CASE-AUTHORING #44 WORKING 'handled B33' (B33 = this test); not on the tranche (no such test under test/m/case-authoring; only fixture.mjs mentions C-2.8). case-catalogue's side DONE (K5084). |
| 21 ai-runs plan.test.mjs:95 PLAN_CLOSED | DONE | K5097; ai-runs/plan.test.mjs:93-95 `code: "PLAN_CLOSED", check: "C-124.10"`. |
| 22 retrieval-browse publishes findin-term-part run | DONE | K5095; retrieval-browse/findin.test.mjs:425 `fixtures-run: screens-daily findin-term-part` matched by screens-daily/find-in.test.mjs:278. |
| 23 transcribe-answer contract is plane's: markers re-pointed; plane adds fixtures-run | NOT DONE | markers still read `content transcribe-answer` (reading-pipeline text-units.test.mjs:531,537, transcribe.test.mjs:323; extraction t48.test.mjs:29); no `plane transcribe-answer` run exists; §5.10 pass and plane Wave B both unstarted. (extraction t44:92 already `plane transcribe-not-sent`, K5147.) |
| 24 inquiry-grammar golden follows the real grammar | DONE | K5097 (follow-up 24 merged). |
| 25 case-inputs DEAD stand-in takes real noReviewCopy shape | DONE | K5095; case-inputs/fixture.mjs:63 `DEAD` is the real shape. Residual: fixtures check lists case-inputs/fixtures.mjs:41 `fixtures-contract: review no-review-copy` as `idle`. |
| 26 following monitor line to monitoring's fixture | DONE | K5099. |
| 27 intent, publication, then monitoring fixtures | DONE | K5097 (intent, publication), K5103 (monitoring CHANGE B12). |
| 28 extraction six-codes tables; transcribe-not-sent/refusal/declined | DONE | K5147; no TRANSCRIBE_NEEDS_API_KEY under test/m/extraction; t44:92 `plane transcribe-not-sent`, t46:123 `agent-worker transcribe-refusal`, t50:68 `transcribe-declined`. |
| 29 public-read NO_SLUG takes real shape | DONE | K5099; public-read/group-fields.test.mjs:19 (`logo: false`, no copied detail). Residual: fixtures check lists group-fields.test.mjs:18 marker as `idle`. |
| 30 provenance project-homing fixture, then tasks | DONE | K5115 (provenance), K5117 (tasks); tasks/world.mjs:11 imports homeOfProject. |
| 31 capture-sources browserrender load-dependent red | DONE | K5108 (red 1 in 40 under 8 busy loops, green 20 in a row). |
| 32 promotion's stamp: CATALOG_VERSION, ROW_CENSUS (round's last merge in its layer) | NOT DONE | Placed 'last'; no job, not yet due (strength's BAR_STALE row keeps row-census red until the stamp, K5161). Nothing built. |
| 33 reword the 24 'group' stand-in rows (§5.10 pass) | NOT DONE | capture/index.mjs:1224 still `localize(... "your group's Civicsmith ...")`; journey-check group.test.mjs:22 rowsSayingGroup unmet; §5.10 pass not run. |
| 34a screens-settings R39's 70 keys; screens-publish parts.mjs double escape, R24 keys | RUNNING | SCREENS-SETTINGS #19 and SCREENS-PUBLISH #22 running; screens-publish J41 Cause 4 (double escape, R24 keys) is COMPLETE on job/T51/screens-publish, unmerged. |
| 34b journey-check B1 fake-account prefix, B3 guide click, live.test.mjs alone | NOT DONE | No journey-check START since #13 (fix round 9): jt/journey-check.bob.md last START is #13; batch-7 job for journey-check not started (waves.md batch 7 lists it). |
| 34c machinery-producers whole-rows; installer wizard.test.mjs; bundler deploybindings | DONE | K5109 (machinery-producers), K5115 (installer CHANGE B33), K5101 (bundler by BOB, 37 of 37). |
| 34d 0.87.0 cut (G90): installer built-in arms, journey-check B2 | NOT DONE | waits on the 0.87.0 cut; not made (handoff 'After the round'). |
| 35 screens-inquiry dead repair control (document.mjs:601-603) | DONE | screens-inquiry/document.mjs has no citeRepair/inquiryground; record J-section 'Item 35: repair control ... removed'; K5175 merged. |
| 36 instance-setup bootstrapFacts fixture, then installer re-point | DONE | K5110, K5115. |
| 37 docket/reevaluation fixtures, then queue-producers re-point | DONE | K5111, K5116, K5119. |
| 38 duties/answers/inquiry fixtures, then queue re-point | DONE | K5110, K5111, K5113, K5116 (queue noticed.test.mjs:294,302). |
| 39 publication case-cited-parts run | DONE | K5115. |
| 40 basis-versions concludeAct kinds, then contradiction | DONE | K5116, K5118. |
| 41 reevaluation case-cited-parts value shape | DONE | K5118. |
| 42 control-plane r9-seam-reading heap and 'alarm_at was null' | RUNNING | CONTROL-PLANE #62 WORKING, START B89 entry 5. |
| 43 reevaluation/docket controls, then queue-producers restores them | DONE | K5118, K5119, K5125 (R30 no-project control: no real answer, recorded). |
| 44 tasks suite drops tests | DONE | K5124 (cause: --test-force-exit loses reports; fixed, 20 runs idle, 15 under load). |
| 45 K5120 in civicos-process JOB.md | DONE | K5137; /home/user/civicos-process roles/JOB.md:16 names K5120; main e54912f (PR #7). |
| 46 final pass offline phase: 13 walkers, every defect placed | DONE | 13 records under build/plan/walk-T51-final and archive/walk-T51-final (01, 02, 03, 04a, 04b, 05, 06, 07, 08, 09, 10a, 10b, 11); diagnoses diag2-* placed K5148, K5155, K5157. (Its targeted re-walk asks are in 70 and 75.) |
| 47 size gate scoped to reading sets | DONE | K5137 (PR #7 merged); tools/mail.mjs:32-38 'a job is measured only against its reading set'. |
| 48 doorbell envelope bound; live fixture lines | DONE | K5135 (R1, R6 met, struck); doorbell absent from fixtures --list. |
| 49 store-door holder and title | DONE | K5138 (R7 struck). |
| 50 final pass rows placed without a job (04A R30 (d), 04B R39 profile words) | WITHDRAWN | K5129: specified / G76 (later-ux.md), no job. |
| 51 promotion gate: bytes held in the image are present | DONE | K5133 (R28 struck). |
| 52 ratification seam test through the door | DONE | K5133, K5140; the test moved to control-plane and was adopted K5147. |
| 53 review draftIdentity for a new-case draft | DONE | K5135 (R16 struck); review/index.mjs:923-930. |
| 54 screens-publish editor `attribute` send for a prepared new-case draft | RUNNING | screens-publish J41 'Cause 3 (follow-up 54)' COMPLETE on job/T51/screens-publish; SCREENS-PUBLISH #22 running; not merged. |
| 55 inquiry questionwaits set-aside; screens-inquiry draw re-points | DONE | K5135 (inquiry R55 struck); screens-inquiry fr4-question.test.mjs and t51-final.test.mjs use questionWaitsSetAside(); screens-inquiry record 'Item 55: the question screen draws document_waits ... history'; merged K5175. |
| 56 10A R90 (b), R93 (6) admin-two answer | WITHDRAWN | K5130: specified, no job. |
| 57 answers state read; screens-daily search and draw | DONE | K5138, K5143 (R6, R7 struck). |
| 58 calculations default recipes; own-testimony visit | DONE | K5138 (R4, R41 met). |
| 59 screens-investigate form asks the column the kind needs | RUNNING | SCREENS-INVESTIGATE #16 WORKING (START k5169 'item 59'); J27 QUESTION about 22 keys answered K5173. |
| 60a control-plane phase clock calls stub methods on the stub | DONE | K5147 (R128 met; r128-rpc-stub.test.mjs). (R128's mark is a mid-line mark left unstruck; see table.) |
| 60b control-plane Wave B (items 8, 42) | RUNNING | CONTROL-PLANE #62. |
| 61 action-plans concluded matter reads 'still open' | DONE | K5142. |
| 62 citation imported ops declare author stamp | DONE | K5142 (R18 struck). |
| 63 final pass rows placed without a job (09 D10, D9, D7, D5) | WITHDRAWN | K5131: specified. |
| 64 ratification start (follow-up 52) | DONE | K5133, K5140. |
| 65 provenance homeOf fixture; doorbell 13 lines; two orphan runs | DONE | provenance K5153; doorbell #10 K5159 merged; doorbell's `fixtures-contract: answer-envelope door-helpers` / `store-door store-replies` markers exist (doorbell/ops.test.mjs:13, invariants.test.mjs:132...) and match door-helpers.test.mjs:11, store-door/fixtures.test.mjs:28. Remaining orphans there belong to affordances (door-helpers:16) and host-governor (store-replies:26): §5.10 pass. |
| 66 control-plane adopts citation's and ratification's door tests | DONE | K5147. |
| 67 UX design #40 (U472), B517 | DONE | K5141 (started by Bob on his primary account); K5169 ACK B519 for U473, U474; tranche tip commit Merge UX design 982e277b9 (DEC-434, U475). |
| 68a extraction publishes four readHeld answers | DONE | K5147 (`windowed()`, `scanOwed()`, `killedWindow()`, `finished()`). |
| 68b store-assembly re-points its 11 ledger-test lines | RUNNING | STORE-ASSEMBLY #3 COMPLETE (J6, J8, J9) on job/T51/store-assembly, fixtures 0 failures, NOT merged (BOB's K5176 handoff names 'STORE-ASSEMBLY #3 J8-J9' first). |
| 68c plane's same ledger lines (plane Wave B) | NOT DONE | plane Wave B not started; fixtures --list: plane 71 lines (r9-jobs 19, fix6-pending 12, fix4b-r77 7, ...). |
| 68d store-assembly's 15 unkeyed copied strings: round-end words regeneration | NOT DONE | round-end regeneration not run (handoff 'After the round'); words check lists them accepted by name (K5144). |
| 68e release.test.mjs R23 `screen.objective.purpose` to UX-DESIGN with B517 | DONE | row listed in fix-round-10-words.md ('plane R24' row); UX design U475 merged at the tranche tip (whether the red cleared is not established). |
| 69 control-plane's three accepted reds, Coverage R136, R137 | RUNNING | CONTROL-PLANE #62, START B89 entry 5. |
| 70a final pass cause jobs: jurisdictions, provenance, events, standards, money, people, retrieval-browse, contradiction, case-carriage, docket, public-read, case-import, case-disclosures, actions, monitoring, link-sweep, tasks, queue-producers, calculations, interface-shell | DONE | merges K5152 (events, standards, money, contradiction, case-carriage, docket, case-import, case-disclosures, actions, monitoring, link-sweep, tasks), K5153 (provenance, people, public-read), K5157 (jurisdictions, calculations), K5159/K5165 (retrieval-browse), K5163 (interface-shell), K5168 (queue-producers). |
| 70b screens jobs: screens-inquiry, screens-daily, screens-investigate, screens-publish (and screens-action, screens-settings) | RUNNING | SCREENS-INQUIRY #30 (new, no record), SCREENS-DAILY #22, SCREENS-INVESTIGATE #16, SCREENS-PUBLISH #22, SCREENS-ACTION #19 (J31 waiting on BOB for two `uses` edges), SCREENS-SETTINGS #19 all running; screens-inquiry #28/#29 merged K5175. |
| 70c 'placed without a job' re-walk asks: 07 §12 three unnamed buttons (print data-act), 10A R214, R171 (1), R90 (g) | NOT DONE | targeted re-walk not run (follows the redeploy, handoff 'After the round'). |
| 71.1 capture-requests routes the three platform ops | DONE | K5165 (already routed, B9 `82e135a332`); capture-requests/index.mjs ~1921 `capturerequestplatformmark/unmark/hosts`. |
| 71.2 store-assembly base gets INSTANCE_NAME | RUNNING | STORE-ASSEMBLY #3 J6 'the world binds INSTANCE_NAME' — COMPLETE on branch, unmerged. |
| 71.3 credentials, instance-setup read the shared clock | DONE | K5155 (credentials, instance-setup merged); store-assembly's hand of the clock is J8 (unmerged, see 82). |
| 71.4 control-plane Wave B: R137 parity, four door ops move; store-request R20 struck | RUNNING | CONTROL-PLANE #62 (CHANGE B92 innerRequest switch). store-request/door.mjs `WORLD_UNREACHED` is now empty, so R20 reads met but is unstruck. |
| 72.1 events `why` of the event view | DONE | K5154. |
| 72.2 capture publishes uploadProvenance; case-carriage re-points upload-photo | DONE | K5155 (capture), K5170 (CASE-CARRIAGE #21 J11, R1, R9, R13). |
| 72.3 nine through-the-door cases (people, money, contradiction, case-disclosures, tasks, link-sweep, standards, case-carriage, docket) | RUNNING | CONTROL-PLANE #62 START B89 entry 6. |
| 72.4a following checks.test.mjs R1 C-137 | DONE | K5164 (both walks skip store-assembly's second root; 85 of 85). |
| 72.4b screens-publish R24 and R22's G54 reds | RUNNING | screens-publish J41 causes 4-5 COMPLETE on branch, unmerged. |
| 72.4c setup-words build.mjs --check refused on plane.declared.readtranslate | NOT DONE | round-end regeneration; needs plane's Wave B to delete plane's copy (K5168). |
| 72.5 `standard.inforce.known` {author} | DONE | listed in fix-round-10-words.md (K5152 line). |
| 72.6 case-authoring carries.test.mjs:157 | DONE | K5152 (BOB, test only; 257 of 257). |
| 73.1 screens-inquiry draws authority via provenance `authority` | DONE | screens-inquiry/document.mjs:203-204 (merged K5175). |
| 73.2 affordances t33.test.mjs:189 | DONE | K5157 (op-grades row), K5159 (op-grades merged). |
| 73.3 doorbell's half of 65 | DONE | K5159. |
| 73.4 public-read document-level seal | DONE | K5157 (R28 struck). |
| 73.5 words PERSON_ITEM_NOT_HELD, NO_LINK_SUBJECT to UX-DESIGN | DONE | fix-round-10-words.md last bullets. |
| 73.6 door cases for control-plane (people, provenance) | RUNNING | CONTROL-PLANE #62 entry 6. |
| 74 placement of the last three diagnoses (screens causes, calculations 06 §8, UX questions) | DONE | K5157 (item 75); Calculations #16/#17 merged K5157/K5161; UX questions listed in fix-round-10-words.md. |
| 75a requirement lines + jobs: csv-reader, project-roster, acquisition, reading-pipeline, retrieval, calculations, citation, strength, intent, consequences, actions, monitoring, filings, escalation, action-producers, queue, queue-producers, interface-shell (R130-132), store-request R25 | DONE | K5161, K5163, K5168, K5171 (R26, R63, R98, R99, R51, R22, R45, R27, R110, R44, R79, R43/R44, R39, R37, R26, R95, R54, R129-R132, R25 struck). |
| 75b content R62 | RUNNING | CONTENT #23 WORKING (job branch has converts-extent test changes; R62 still marked). |
| 75c control-plane `publishcheck` stamp as `publish` via the innerRequest switch | RUNNING | store-request R25 DONE (K5171); control-plane switch is #62 (CHANGE B92). |
| 75d screens causes of items 70, 73, 74 (screens-inquiry, -daily, -action, -investigate, -publish, -settings) | RUNNING | see 70b. |
| 75e 06 §19 (e) the Queue's small targets (print each target's outerHTML) | NOT DONE | a targeted re-walk ask; not run. |
| 76 context figure in `mail check` | WITHDRAWN | K5167 withdrawn. |
| 77.1 op-grades `namedrequests` grade; ownerReads reads every owner | DONE | K5163 (OP-GRADES #28 merged); op-grades/k5159.test.mjs. |
| 77.2 affordances register-owners registers every DECLARED_OPS | DONE | K5168. |
| 77.3 store-request signIn administrators, password, recipes.queue | DONE | store-request J8 (administrators active by consensus, password returned, `recipes.queue({obligations})`), merged K5171. |
| 77.4 plane's Wave B: wizards.mjs imports ADMIN_ACTS/ADMIN_SCREENS from wizard-scripts | NOT DONE | plane Wave B not started (plane/wizards.mjs still its own copy). |
| 77.5 last batch-7 screens job deletes harness.mjs's four frame defaults | NOT DONE | interface-shell/harness.mjs:88,89,91,97 still present; batch 7 not complete (see section 2). |
| 77.6 plane.declared.readtranslate's two sentences (round-end regeneration) | NOT DONE | not run. |
| 78.1 queue-producers R54 with queue (project-leave) | DONE | K5168. |
| 78.2 connections NO_SUCH_DOCUMENT; screens-inquiry names it | DONE | K5163 (R72 struck); screens-inquiry/document.mjs:95. |
| 78.3 escalation R39 | DONE | K5163. |
| 78.4 content's side of reading-pipeline R63 | RUNNING | CONTENT #23 WORKING (CHANGE B22). |
| 78.5 SELECTION_NOT_YOURS stand-ins: intent, inquiry, retrieval-browse; review chunking | DONE | intent K5171 (INTENT #20), inquiry K5165, retrieval-browse K5165, review K5165 (review/index.mjs:1052-1056 CHUNK = 64). |
| 78.6 door cases for control-plane (csv-reader, calculations, consequences, monitoring, selection) | RUNNING | CONTROL-PLANE #62 entry 6. |
| 78.7 answer-envelope 16 reds (adminendorse second registration) | DONE | K5164 (test only, 85 of 85). |
| 78.8 calculations R51 mints row before bytes read (kept) | DONE | kept by BOB (recorded in item). |
| 78.9 monitoring job-registrar line in plane's r10-fixtures-run | DONE | K5161; plane/r10-fixtures-run.test.mjs holds `fixtures-run: monitoring job-registrar`. |
| 78.10 plane bundle stale (csv-reader): round-end regeneration | NOT DONE | not run. |
| 79.1 interface-shell R11 test returns from r10.test.mjs to fixround2 | DONE | interface-shell/fixround2.test.mjs:285 holds it; r10.test.mjs does not. |
| 79.2 locked session's 401 SESSION_LOCKED fix (interface-shell R33) | DONE | K5163 (INTERFACE-SHELL #22). |
| 79.3 screens-settings and screens-publish tip reds | RUNNING | their batch-7 jobs running. |
| 79.4 project-roster projectRequestsAnswered is a service | DONE | noted K5163. |
| 80.1 answer-envelope/following walks skip store-assembly's second root | DONE | K5164; point walks at the one root after plane Wave B: NOT DONE (plane Wave B). |
| 80.2 op-declarations three reds; ACT_HELP for authority, ruleservicesstate | DONE | K5171 (op-declarations merged), K5168 (affordances). |
| 81.1 link-sweep R14 | DONE | K5172. |
| 81.2 admission R33 (session and reauth in one hop) | RUNNING | ADMISSION #19 (new session; R33 still marked). |
| 81.3 instance-setup R105 | DONE | K5174. |
| 81.4 words for UX-DESIGN: screens-action legend, names_pending, own_doing, audience, causation states; screens-inquiry declined-request, leave, history labels, authority label, reviewed mark, goal row; intent's retired aspirations | NOT DONE | fix-round-10-words.md contains none of these (grep names_pending, own_doing, retired-aspirations = 0); the doc is written at round end. intent's retired aspirations readable by id: DONE K5168. |
| 81.5 door case: case-carriage upload marked a photo | RUNNING | CONTROL-PLANE #62 entry 6. |
| 81.6 store-request walker `held: true` case waits on a concluded-finding recipe | RUNNING | STORE-REQUEST #3 (START B6 'Also: recipes.finding'). |
| 82.1 control-plane innerRequest switch (R136, R137) | RUNNING | CONTROL-PLANE #62 (CHANGE B92). |
| 82.2a store-assembly hands the clock at assemble.mjs (credentials' line, instance-setup `now`) | RUNNING | STORE-ASSEMBLY #3 J8 (B9) COMPLETE, unmerged. |
| 82.2b plane's store.mjs:576, :185 hand both clocks | NOT DONE | plane Wave B not started. |
| 82.3 store-request sentence `the_pack_could_not_be_rendered` joins the words HANDOFF | NOT DONE | not in fix-round-10-words.md (grep = 0). |
| 83 civicos-process tools/mail.mjs check shows OPEN (unread B<n>) | NOT DONE | civicos-process main still e54912f; no open PR, no prep branch for it (gh api); tools/mail.mjs has no `OPEN (unread`. Never placed as a job. |
| 84 screens-investigate 22 new keys: on MERGE BOB merges the design commit; test.todos become tests | RUNNING | SCREENS-INVESTIGATE #16 running; B520 posted. |
| 85.1 plane door.test.mjs counts 36 routes; selftestmigrations driven (DRIVES) | NOT DONE | plane Wave B not started; red by name (K5174). |
| 85.2 op-declarations t47 internal list names selftestmigrations | NOT DONE | op-declarations/t47.test.mjs:368-371 INTERNAL lists `bootstrapfacts` but not `selftestmigrations`; no START since OP-DECLARATIONS #37 (K5164); never placed. |
| 86.1 STORE-REQUEST #3: storeWorld recipes (HTML/PDF hold, contradiction candidate, captured capture-request, n questions, concluded finding) | RUNNING | STORE-REQUEST #3 WORKING (START B6). |
| 86.2 SCREENS-INQUIRY #30: remaining op tables (455 lines), t51-project.test.mjs:105, phone.mjs | RUNNING | SCREENS-INQUIRY #30 (new session, no record yet); fixtures --list: screens-inquiry 447. |
| 86.3a round-end regeneration adds screens-inquiry's new keys to served words | NOT DONE | not run. |
| 86.3b last two keys and `screen.objective.retired*` to UX-DESIGN with the round's words | NOT DONE | not in fix-round-10-words.md (grep screen.objective.retired, unit.characters = 0). |
| 86.4 DEC-432 (b) Held list, (c) docpick: question to UX-DESIGN in the HANDOFF; screens-intake Held list job | NOT DONE | fix-round-10-words.md has no DEC-432 / docpick entry; no screens-intake START. |

## Section 2 (the fixture round)

| Part | State | Evidence |
|---|---|---|
| S2 Wave A: store-assembly (new module, storeWorld, measured time) | DONE | K5144 merged; K5139. |
| S2 Wave A: wizard-scripts receives ADMIN_ACTS/ADMIN_SCREENS | DONE | K5078, K5080; wizard-scripts/admin.mjs:6,10 (requirement R51 mark left unstruck). |
| S2 Wave A: translations and signin-door declare interfacewords, subscriptionsignin | DONE | translations/index.mjs:835; signin-door/index.mjs:48; K5121 removed the owner-ops row (marks translations R21, signin-door R6 left unstruck). |
| S2 Wave A: providers publish fixtures; FIX-L fixtures-run tests (plane, control-plane, store-door, answer-envelope ...) | DONE | plane/r10-fixtures-run.test.mjs, answer-envelope/door-helpers.test.mjs, store-door/fixtures.test.mjs exist; orphans left (below). |
| S2 Wave A orphan runs: test-support job-registrar, control-plane job-registrar, control-plane owed-ledger (plane r10-fixtures-run:17,23,29); affordances door-helpers; host-governor store-replies; law-relations host-refusals | NOT DONE | fixtures --list `orphan-run`: users' markers are the §5.10 pass (test-support, affordances, host-governor, law-relations) or control-plane's Wave B; not done. |
| S2 Wave B: plane (deletes its copy; Store calls assembleStore) | NOT DONE | not started; plane still holds pending.mjs, ask.mjs, wiring.mjs, owners.mjs, store.mjs; fixtures --list plane 71 lines. |
| S2 Wave B: control-plane (deletes owner-ops.mjs, calls the door function, own users' lines) | RUNNING | CONTROL-PLANE #62; owner-ops.mjs still present; fixtures --list control-plane 68 lines (57 non op-table). |
| S2 Wave B: interface-shell boot({door}) | DONE | K5163; 6 fixture lines left = harness frame defaults kept until the last batch-7 merge (K5159). |
| S2 Wave B user: screens-inquiry op tables | RUNNING | 447 lines left on the tranche; SCREENS-INQUIRY #30. |
| S2 Wave B user: screens-daily op tables | RUNNING | 249 left on tranche (235 on job branch); SCREENS-DAILY #22. |
| S2 Wave B user: screens-settings op tables | RUNNING | 247 left; SCREENS-SETTINGS #19. |
| S2 Wave B user: screens-investigate op tables | RUNNING | 166 left; SCREENS-INVESTIGATE #16. |
| S2 Wave B user: screens-publish op tables | RUNNING | 60 left on tranche (41 on job branch); SCREENS-PUBLISH #22. |
| S2 Wave B user: screens-action op tables | RUNNING | 54 left on tranche (7 on job branch per J31); SCREENS-ACTION #19 (waiting on BOB for `uses` edges publication, record-core). |
| S2 Wave B user: screens-intake op tables (353 lines) | NOT DONE | no job: screens-intake #25 merged K5095; the CHANGE after store-request was never started. |
| S2 Wave B user: screens-entry op tables (173 lines) | NOT DONE | no job: screens-entry #11 merged K5095; CHANGE never started. |
| S2 Wave B user: screens-wizards op tables (51 lines) | NOT DONE | no job: batch 7 'Wave B job' for screens-wizards never started (waves.md row 164). |
| S2 Wave B user: journey-check op tables / REPORT (17 lines) | NOT DONE | no job (see 34b). |
| S2 §5.10 pass modules: law-relations 10, bundler 7, host-governor 6, test-support 5, affordances 4, docprofile 3, skills 2, hypotheses 2, explore 2, signatures 1 fixture lines | NOT DONE | no job; pass 'when no job runs' (waves.md §4) has not run. |
| S2 other modules with lines left: reading-pipeline 5, actions 4, retrieval-browse 3, link-sweep 2, extraction 2, wizard-scripts 1, retrieval 1, public-read 1, credentials 1, case-inputs 1, case-import 1, acquisition 1 | NOT DONE | each ended its job with named residual lines (K5090-K5165: waiting on providers' runs, predating lines, or idle markers); no running job carries them except extraction's two via plane (13a). |


## NOT DONE or UNKNOWN

Each row: what is missing, and which module (job) owns it.

- **1a site deploy carries INSTALLER_ADDRESS**: site/wrangler.jsonc `vars` holds only LISTED_GROUPS and its comment says INSTALLER_ADDRESS stays unset until release; no release/deploy file passes it (git grep: only site/src, site/build.mjs, journey-check/local.mjs and tests name it); K5039 records only BOB's one-time `--var` deploy 97a23ece. No job or ruling places it. Owner: site (no job; BOB or the release's deploy step).
- **4 LOAD-RED 5 (1): study reproduces, names the cause; deployed-plane alarm-sweep check**: PLANE #61 J62 (K5081, K5121): not reproduced in 9 whole-file L-PIN runs, 'no cause established', deployed check 'rides biosmoke8's redeploy' (not made). K4966 says a pass does not clear it. No job open for it. Owner: plane (a study job; deployed check at biosmoke8's redeploy).
- **6 test-support generators.test.mjs:114 passes when pdf.js throws**: bio-plane/test/m/test-support/generators.test.mjs:114 is still `if (o.skip || o.error) return;`. Owed to the §5.10 pass, which has not run (handoff 'Owed still: 13, 15 and 33'; no ruling records the pass). Owner: test-support (§5.10 pass).
- **12 plane r9-jobs.test.mjs:318 takes extraction's readHeld failure**: plane Wave B has not started (plane #61 merged K5121; no later START); `checks/fixtures.mjs` lists 19 lines in plane/r9-jobs.test.mjs. Handoff: starts after STORE-ASSEMBLY #3 merges. Owner: plane (Wave B).
- **13a extraction: its remaining fixture lines**: extraction fixtures --list: 2 left (t44.test.mjs:93 waits on plane's run; t48.test.mjs:30 transcribe `contract-no-run`); both wait on plane's CHANGE (items 12, 23). Owner: extraction, via plane's CHANGE.
- **13b plane r10-land-yields platform check of R111 (P) at the redeploy**: test exists (plane/r10-land-yields.test.mjs); redeploy of biosmoke8 not yet made (handoff 'After the round'). Owner: plane (r10-land-yields) at the redeploy.
- **15 test-support registrar stub re-pointed to plane's real job-registrar**: §5.10 pass not run; fixtures --list still lists test-support job-registrar-stub.mjs:23,35,38,56 and plane r10-fixtures-run.test.mjs:17 orphan-run. Owner: test-support (§5.10 pass).
- **23 transcribe-answer contract is plane's: markers re-pointed; plane adds fixtures-run**: markers still read `content transcribe-answer` (reading-pipeline text-units.test.mjs:531,537, transcribe.test.mjs:323; extraction t48.test.mjs:29); no `plane transcribe-answer` run exists; §5.10 pass and plane Wave B both unstarted. (extraction t44:92 already `plane transcribe-not-sent`, K5147.) Owner: plane (CHANGE after Wave B) and the §5.10 pass for reading-pipeline/extraction markers.
- **32 promotion's stamp: CATALOG_VERSION, ROW_CENSUS (round's last merge in its layer)**: Placed 'last'; no job, not yet due (strength's BAR_STALE row keeps row-census red until the stamp, K5161). Nothing built. Owner: promotion (new session, last in its layer).
- **33 reword the 24 'group' stand-in rows (§5.10 pass)**: capture/index.mjs:1224 still `localize(... "your group's Civicsmith ...")`; journey-check group.test.mjs:22 rowsSayingGroup unmet; §5.10 pass not run. Owner: §5.10 pass (capture and the other modules' stand-in rows; setup-words build).
- **34b journey-check B1 fake-account prefix, B3 guide click, live.test.mjs alone**: No journey-check START since #13 (fix round 9): jt/journey-check.bob.md last START is #13; batch-7 job for journey-check not started (waves.md batch 7 lists it). Owner: journey-check (batch-7 job never started).
- **34d 0.87.0 cut (G90): installer built-in arms, journey-check B2**: waits on the 0.87.0 cut; not made (handoff 'After the round'). Owner: installer, journey-check (waits on the 0.87.0 cut, G90).
- **68c plane's same ledger lines (plane Wave B)**: plane Wave B not started; fixtures --list: plane 71 lines (r9-jobs 19, fix6-pending 12, fix4b-r77 7, ...). Owner: plane (Wave B).
- **68d store-assembly's 15 unkeyed copied strings: round-end words regeneration**: round-end regeneration not run (handoff 'After the round'); words check lists them accepted by name (K5144). Owner: round-end regeneration (BOB).
- **70c 'placed without a job' re-walk asks: 07 §12 three unnamed buttons (print data-act), 10A R214, R171 (1), R90 (g)**: targeted re-walk not run (follows the redeploy, handoff 'After the round'). Owner: the targeted re-walk (after the redeploy).
- **72.4c setup-words build.mjs --check refused on plane.declared.readtranslate**: round-end regeneration; needs plane's Wave B to delete plane's copy (K5168). Owner: round-end regeneration; needs plane Wave B first.
- **75e 06 §19 (e) the Queue's small targets (print each target's outerHTML)**: a targeted re-walk ask; not run. Owner: the targeted re-walk.
- **77.4 plane's Wave B: wizards.mjs imports ADMIN_ACTS/ADMIN_SCREENS from wizard-scripts**: plane Wave B not started (plane/wizards.mjs still its own copy). Owner: plane (Wave B).
- **77.5 last batch-7 screens job deletes harness.mjs's four frame defaults**: interface-shell/harness.mjs:88,89,91,97 still present; batch 7 not complete (see section 2). Owner: the last batch-7 screens job to merge (harness.mjs frame defaults).
- **77.6 plane.declared.readtranslate's two sentences (round-end regeneration)**: not run. Owner: round-end regeneration.
- **78.10 plane bundle stale (csv-reader): round-end regeneration**: not run. Owner: round-end regeneration.
- **81.4 words for UX-DESIGN: screens-action legend, names_pending, own_doing, audience, causation states; screens-inquiry declined-request, leave, history labels, authority label, reviewed mark, goal row; intent's retired aspirations**: fix-round-10-words.md contains none of these (grep names_pending, own_doing, retired-aspirations = 0); the doc is written at round end. intent's retired aspirations readable by id: DONE K5168. Owner: BOB: fix-round-10-words.md (UX-DESIGN HANDOFF).
- **82.2b plane's store.mjs:576, :185 hand both clocks**: plane Wave B not started. Owner: plane (Wave B).
- **82.3 store-request sentence `the_pack_could_not_be_rendered` joins the words HANDOFF**: not in fix-round-10-words.md (grep = 0). Owner: BOB: fix-round-10-words.md.
- **83 civicos-process tools/mail.mjs check shows OPEN (unread B<n>)**: civicos-process main still e54912f; no open PR, no prep branch for it (gh api); tools/mail.mjs has no `OPEN (unread`. Never placed as a job. Owner: civicos-process (tools/mail.mjs; no job, no PR).
- **85.1 plane door.test.mjs counts 36 routes; selftestmigrations driven (DRIVES)**: plane Wave B not started; red by name (K5174). Owner: plane (Wave B).
- **85.2 op-declarations t47 internal list names selftestmigrations**: op-declarations/t47.test.mjs:368-371 INTERNAL lists `bootstrapfacts` but not `selftestmigrations`; no START since OP-DECLARATIONS #37 (K5164); never placed. Owner: op-declarations (new session, haiku, never started).
- **86.3a round-end regeneration adds screens-inquiry's new keys to served words**: not run. Owner: round-end regeneration.
- **86.3b last two keys and `screen.objective.retired*` to UX-DESIGN with the round's words**: not in fix-round-10-words.md (grep screen.objective.retired, unit.characters = 0). Owner: BOB: fix-round-10-words.md.
- **86.4 DEC-432 (b) Held list, (c) docpick: question to UX-DESIGN in the HANDOFF; screens-intake Held list job**: fix-round-10-words.md has no DEC-432 / docpick entry; no screens-intake START. Owner: BOB (words doc question) and screens-intake (Held list job, not placed).
- **S2 Wave A orphan runs: test-support job-registrar, control-plane job-registrar, control-plane owed-ledger (plane r10-fixtures-run:17,23,29); affordances door-helpers; host-governor store-replies; law-relations host-refusals**: fixtures --list `orphan-run`: users' markers are the §5.10 pass (test-support, affordances, host-governor, law-relations) or control-plane's Wave B; not done. Owner: §5.10 pass modules and control-plane Wave B.
- **S2 Wave B: plane (deletes its copy; Store calls assembleStore)**: not started; plane still holds pending.mjs, ask.mjs, wiring.mjs, owners.mjs, store.mjs; fixtures --list plane 71 lines. Owner: plane (Wave B; starts after STORE-ASSEMBLY #3 merges).
- **S2 Wave B user: screens-intake op tables (353 lines)**: no job: screens-intake #25 merged K5095; the CHANGE after store-request was never started. Owner: screens-intake (new session; CHANGE after store-request).
- **S2 Wave B user: screens-entry op tables (173 lines)**: no job: screens-entry #11 merged K5095; CHANGE never started. Owner: screens-entry (new session).
- **S2 Wave B user: screens-wizards op tables (51 lines)**: no job: batch 7 'Wave B job' for screens-wizards never started (waves.md row 164). Owner: screens-wizards (batch-7 job).
- **S2 Wave B user: journey-check op tables / REPORT (17 lines)**: no job (see 34b). Owner: journey-check (batch-7 job).
- **S2 §5.10 pass modules: law-relations 10, bundler 7, host-governor 6, test-support 5, affordances 4, docprofile 3, skills 2, hypotheses 2, explore 2, signatures 1 fixture lines**: no job; pass 'when no job runs' (waves.md §4) has not run. Owner: §5.10 pass (BOB; its precondition is that no job runs).
- **S2 other modules with lines left: reading-pipeline 5, actions 4, retrieval-browse 3, link-sweep 2, extraction 2, wizard-scripts 1, retrieval 1, public-read 1, credentials 1, case-inputs 1, case-import 1, acquisition 1**: each ended its job with named residual lines (K5090-K5165: waiting on providers' runs, predating lines, or idle markers); no running job carries them except extraction's two via plane (13a). Owner: each named module (residual lines); plane Wave B for the transcribe lines.

UNKNOWN: none among the numbered items (each was established from a ruling line, a code line, or a job record). Unknown in the not-yet-met table: the lines marked 'met-state UNKNOWN' (older marks from fix rounds 2-9 and the T51 words rule: I read code only where cheap and did not run the module suites), and whether UX-DESIGN's merge at the tip cleared the inherited store-assembly `release.test.mjs` R23 red (item 68e).

Found outside the numbered items (not in the plan; each needs a placing decision):
- Six screen ops are undeclared (interface-shell `declared.test.mjs`: `declared 389 of 395 ops`): `linewithdraw` (lines; its R25 names only recordline), `capturerequests` (capture-requests), `translationdraft` (store-door's wave-2 entry, K4206), `publishat`, `publishatmove` (irreversible, by design), `publishedcase` (public-read, by design). Two are real gaps with no job: `linewithdraw`, `capturerequests`.
- store-assembly J8/J9 (unmerged): the ledger's answer-side `next_page` has no producer; two tests (`r9-jobs.test.mjs` ~:302, ~:333) still script it and plane's `pending.mjs:447` carries the same dead read: BOB's call, in plane's Wave B.
- BOB-owed edits waiting in running jobs: SCREENS-ACTION #19 J31 (architecture: add `publication`, `record-core` to screens-action `uses`, tests only; it posts COMPLETE after), SCREENS-PUBLISH #22 and SCREENS-DAILY #22 REPORTs (`uses` edges answer-envelope, case-inputs, store-request), and screens-publish REPORT 2 (public-read's `publishedcase` serves no basis-version name).
- screens-inquiry R23 and R50 (cause 30b screen half): inquiry R85 is struck and basis-versions merged, yet the CHANGE that K5090 promised was never written ('not in this START', screens-inquiry record, B62).
- The §5.10 pass has no way to start while jobs are always running (waves.md §4 and the handoff say it runs 'when no job runs'; K5171 removed the slot cap): items 6, 15, 23 (marker half), 33 and the ten §5.10 modules' fixture lines (about 40 lines) wait on it.
- Fixtures check at the tranche (before the tip's design merge): 2,038 failing lines: screens-inquiry 447, screens-intake 353, screens-daily 249, screens-settings 247, screens-entry 173, screens-investigate 166, plane 71, control-plane 68, screens-publish 60, screens-action 54, screens-wizards 51, journey-check 17, store-assembly 11, law-relations 10, bundler 7, interface-shell 6, host-governor 6, test-support 5, reading-pipeline 5, then 1-4 in 18 modules.


## `not yet met: T51` lines (build/requirements/*.md)

148 marked lines (a line is one requirement id unless noted). 'Carried' means a running or completed-unmerged job's START or record names it; `mark looks stale` means the requirement's code and test exist on the tranche and the mark was not struck at the merge (BOB strikes with `sed` on `- **R<n>** *(not yet met: T51)* `, which misses a mark that sits mid-line or after a sub-clause); the module suites were not run. Ids were read from the heading of the marked line; a mark inside a longer line can belong to an amendment clause.

| Module | Id | What | State | Carrier / evidence |
|---|---|---|---|---|
| action-clocks | R25 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| action-records | R20 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| actions | R109 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| admission | R21 | ; DEC-166) Who is calling is known only as a keyed fingerprint and a country. `s | NO JOB; code/test exists, mark looks stale | `sourceOf` exists (admission/index.mjs:988); older F4 mark; no START names it |
| admission | R33 | One hop for the session and the re-authentication due. | CARRIED: RUNNING | ADMISSION #19 (START `admission-k5170`, new session, no record yet) |
| ai-runs | R90 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| ai-use | R16 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| answer-envelope | R6 | The interface page (`interface-shell` R1) carries no inline script: its `script- | NO JOB; code/test exists, mark looks stale | `withPagePolicy({scriptHashes})` merged K4380; older mark; no START names it |
| answers | R36 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| attestation | R11 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| basis-versions | R57 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| bias | R50 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| bias | R51 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| calculations | R42 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| capture | R113 | Amended (fix round 9, G176; K5005): | CARRIED: RUNNING | founder's parted upload = CONTROL-PLANE #62 entry 4 (item 8a); K5013 struck an earlier R113 mark, this one is cause 29 |
| case-account | R17 | Its member-facing sentences are read by DEC-327's keys. | NO JOB; met-state UNKNOWN | older words-rule mark (K3947); words regeneration at round end |
| case-catalogue | R2 | `checkPublishedExtension` is C-2.8's case-member arm, asked only of bytes `isCas | NO JOB; code/test exists, mark looks stale | R31 fix done and tested as "R2, R31" (case-catalogue J5, K5084); mark not struck |
| case-checker | R27 | ; K3725; the words rule, K3930; amends R1, R16, R20, R22, R23, R24, R26) **The c | NO JOB; met-state UNKNOWN | older words-rule mark; case-checker program.mjs stale until round-end regeneration (K5084) |
| case-disclosures | R33 | A photo answers the day it was taken. | NO JOB; code/test exists, mark looks stale | `dated` in photosOf exists (case-disclosures/index.mjs:573); older mark |
| case-inputs | R19 | ; DEC-340, U366; K3935; P4's seam, BOB's shape; amends R8, R10; `case-authoring` | NO JOB; met-state UNKNOWN | older DEC-340 mark; no START names it |
| case-tensions | R12 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| conformance | R42 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| consequences | R26 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| content | R62 | An extent of a kind the capture's format cannot hold (a page of a Word file, a s | CARRIED: RUNNING | CONTENT #23 (WORKING; CHANGE B22 content side of reading-pipeline R63) |
| content | R56 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| control-plane | R16 | A promotion asserting `replay` keeps it only for the `admin` class without a ses | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R59 | The door reads every credential it uses through `admission.presentedCredential`  | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R64 | A secret's digest reaches the store only in the body of the store's internal req | CARRIED: RUNNING | CONTROL-PLANE #62: the innerRequest switch (CHANGE B92; R136/R137), door cases (entries 4-6); control-plane/index.mjs does not yet call innerRequest |
| control-plane | R71 | The door routes `op-declarations` R43's ops; a member's capture may carry `step` | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R72 | The door routes `captureupload` to the store, refused to any caller not arriving | CARRIED: RUNNING | CONTROL-PLANE #62: the innerRequest switch (CHANGE B92; R136/R137), door cases (entries 4-6); control-plane/index.mjs does not yet call innerRequest |
| control-plane | R74 | The door admits `pagetranscribe` only for a caller arriving by a member's sessio | CARRIED: RUNNING | CONTROL-PLANE #62: the innerRequest switch (CHANGE B92; R136/R137), door cases (entries 4-6); control-plane/index.mjs does not yet call innerRequest |
| control-plane | R100 |  | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R107 | The stamped viewer reaches `inboxpull` and `inboxresolve`. | CARRIED: RUNNING | CONTROL-PLANE #62: the innerRequest switch (CHANGE B92; R136/R137), door cases (entries 4-6); control-plane/index.mjs does not yet call innerRequest |
| control-plane | R116 | `interfacewords` is cached for the release and compressed. | NO JOB; code/test exists, mark looks stale | interfacewords cache exists (control-plane/index.mjs:913 interfaceWordsCache); K5070 removed the owner row |
| control-plane | R123 | (fix round 4b, F1, F2, F6; K4487, K4503; D3; `store-assembly` R64, capture R103, | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R124 | (fix round 4b, F5; K4492, K4493, K4503; acquisition R100, `store-assembly` R64) | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R125 | Large work is owed, never read inside the request. | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R120 | (fix round 4, C5a/P8; K4429, K4354's 15 s bar; amends R105, R117; `acquisition`  | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R128 | The door carries the timings a module states. | NO JOB; code/test exists, mark looks stale | K5147 "R128 met" (phase clock, r128-rpc-stub.test.mjs); the mid-line mark was not struck |
| control-plane | R130 | (fix round 9, G126a-c; K4811 (6), K4835 (2); `store-assembly` R74, R75; section  | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R133 | (fix round 9, G128f; X15; amends R123) | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R134 | (fix round 9, G129e; X20; K4831 (4); `acquisition` unpack, `store-assembly` R74; | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R135 | (fix round 9, G135f, G126; K4831 (5); `store-assembly` R74, R65; amends R100) | NO JOB; met-state UNKNOWN | older (fix rounds 2-9) amendment; no START names it; CONTROL-PLANE #62 is the module's only running job |
| control-plane | R136 | The door makes every request it sends to the store with `store-request`'s `inner | CARRIED: RUNNING | CONTROL-PLANE #62 START B89 entry 2 / CHANGE B92 |
| control-plane | R137 | ; `store-request` R15, R17) A parity test: for one op of each row of `store-requ | CARRIED: RUNNING | CONTROL-PLANE #62 START B89 entries 2, 5 |
| control-plane | R29 | No handler receives a caller-supplied value for any stamp (`store-request` R3, R | CARRIED: RUNNING | CONTROL-PLANE #62: the innerRequest switch (CHANGE B92; R136/R137), door cases (entries 4-6); control-plane/index.mjs does not yet call innerRequest |
| corpus-export | R11 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| corpus-export | R12 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| credentials | R9 | (was `membership` R89) | NO JOB; code/test exists, mark looks stale | `timings` exists (credentials/index.mjs:922); older C51 mark |
| docket | R30 | A pressure mark says who made it. | NO JOB; met-state UNKNOWN | older DEC-340 mark; docket #15 merged K5152 did not name it |
| duties | R34 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| escalation | R38 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| events | R55 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| extraction | R102 | Owed reading work is registered through the registrar. | NO JOB; code/test exists, mark looks stale | registerJob/owe exist (extraction/index.mjs:806-808); the registrar test run side is plane's (items 12, 13) |
| following | R36 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| hypotheses | R24 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| inquiry | R8 | Grounds (DEC-32): a leg may carry a ground label (`GROUND_LABEL_RE`) and a suppo | NOT PLACED | cause 30b screen half: inquiry R85 struck K5113 and basis-version-grammar/basis-versions merged, but SCREENS-INQUIRY #30 START says R23, R50 are "not in this START"; no CHANGE placed |
| installer-steps | R33 | Status | NO JOB; met-state UNKNOWN | Status line, not an id: "every requirement marked not yet met (module new in T51)", R43-R45 marked; installer #28 merged |
| installer-steps | R26 | ) The install and the update bind `agent-worker`'s `REMOTE` Durable Object (with | NOT PLACED | unbuilt remote-Worker proof; assistant work excluded (K3717), N1276 |
| installer-steps | R31 | ) The verdict (R28) names the remote Worker among the parts and says whether it  | NOT PLACED | as R26 (K3718 (2)) |
| installer | R2 | A sixth scope, once it is registered: | NOT PLACED | waits on Bob's registration of the sixth scope (K3818); not a job |
| intent | R34 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| intent | R35 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| interface-shell | R12 | An act is drawn only when the session may do it: `NEEDS[op]` is `null` or among  | NO JOB; met-state UNKNOWN | older marks (T47-T51); lists moved to wizard-scripts R51; INTERFACE-SHELL #22 merged K5163 struck R108, R129-R132 only |
| interface-shell | R47 | `cs.save(name, text, {label})`, `cs.copy(text, {label})` and `cs.signout({label} | NO JOB; met-state UNKNOWN | older marks (T47-T51); lists moved to wizard-scripts R51; INTERFACE-SHELL #22 merged K5163 struck R108, R129-R132 only |
| interface-shell | R50 | `wizard-scripts` R51's `ADMIN_ACTS` also names `passwordresetlink`, `signerset`, | NO JOB; met-state UNKNOWN | older marks (T47-T51); lists moved to wizard-scripts R51; INTERFACE-SHELL #22 merged K5163 struck R108, R129-R132 only |
| interface-shell | R101 | Paths, the admin gate and the registry for the new screens. | NO JOB; met-state UNKNOWN | older marks (T47-T51); lists moved to wizard-scripts R51; INTERFACE-SHELL #22 merged K5163 struck R108, R129-R132 only |
| interface-shell | R107 | An act marked Reasoned asks its reason. | NO JOB; met-state UNKNOWN | older marks (T47-T51); lists moved to wizard-scripts R51; INTERFACE-SHELL #22 merged K5163 struck R108, R129-R132 only |
| journey-check | R20 | asserts the not-ready state the screen it would have used declares | NOT PLACED | older T51-131 marks "read at the close audit" (K4495); no journey-check START since #13; batch-7 job not started (items 34b, section 2) |
| journey-check | R21 | R6's comparison covers the carried screens and the states the carried features a | NOT PLACED | older T51-131 marks "read at the close audit" (K4495); no journey-check START since #13; batch-7 job not started (items 34b, section 2) |
| journey-check | R23 | A document's first page reads "Page 1". | NOT PLACED | older T51-131 marks "read at the close audit" (K4495); no journey-check START since #13; batch-7 job not started (items 34b, section 2) |
| journey-check | R24 | The published frame is walked where a case is published. | NOT PLACED | older T51-131 marks "read at the close audit" (K4495); no journey-check START since #13; batch-7 job not started (items 34b, section 2) |
| journey-check | R25 | The old-page trip-wire stays after the old interface is deleted. | NOT PLACED | older T51-131 marks "read at the close audit" (K4495); no journey-check START since #13; batch-7 job not started (items 34b, section 2) |
| journey-check | R26 | R17's scan clears with the two words. | NOT PLACED | older T51-131 marks "read at the close audit" (K4495); no journey-check START since #13; batch-7 job not started (items 34b, section 2) |
| journey-check | R27 |  | NOT PLACED | older T51-131 marks "read at the close audit" (K4495); no journey-check START since #13; batch-7 job not started (items 34b, section 2) |
| journey-check | R28 | The walk covers DEC-340. | NOT PLACED | older T51-131 marks "read at the close audit" (K4495); no journey-check START since #13; batch-7 job not started (items 34b, section 2) |
| lines | R25 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list); `linewithdraw` (sent by screens-investigate) is NOT in its DECLARED_OPS and R25 names only recordline |
| local-facts | R20 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| member-roster | R71 | `memberList` (R14) is given the projects of a member by its caller, so this modu | NO JOB; met-state UNKNOWN | K624 split-by-copy lines marked at creation; member-roster #5 merged K5082 without strike; code exists (K3979 R74) |
| member-roster | R72 | `expertiseHolders(label)` answers who currently holds an expertise: every `activ | NO JOB; met-state UNKNOWN | K624 split-by-copy lines marked at creation; member-roster #5 merged K5082 without strike; code exists (K3979 R74) |
| member-roster | R73 | The spelling of a viewer is answered here as pure functions, with no table read; | NO JOB; met-state UNKNOWN | K624 split-by-copy lines marked at creation; member-roster #5 merged K5082 without strike; code exists (K3979 R74) |
| member-roster | R74 | `membersOf(ctx)` answers the one instance per storage, over `ctx.storage.sql`, o | NO JOB; met-state UNKNOWN | K624 split-by-copy lines marked at creation; member-roster #5 merged K5082 without strike; code exists (K3979 R74) |
| member-roster | R75 | The administrator removals under way, read. | NO JOB; met-state UNKNOWN | K624 split-by-copy lines marked at creation; member-roster #5 merged K5082 without strike; code exists (K3979 R74) |
| money | R27 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| network-notices | R31 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| notice-producers | R29 | (fix round 9, G135f; K4831 (5); `store-assembly` R74, R75; `control-plane` R135; | NO JOB; met-state UNKNOWN | waits on "control-plane seam section 11, job 43"; no START names it |
| op-grades | ? | `securitymap` (R22) is a read, not an absence: its `NON_ACTS` sentence stands an | NO JOB; code/test exists, mark looks stale | securitymap sub-line: graded Reversible in op-grades/marks.mjs:203, t48.mjs:18 explains; mark not struck |
| op-grades | R46 | (T50; DEC-295; K3250; amends R42; `marks.mjs` `MARKS_KIT_COMMIT`; re-taken T51,  | NO JOB; code/test exists, mark looks stale | `expertisewithdraw` Reasoned entry exists (marks.mjs:91); mark not struck |
| people | R42 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| plan-work | R19 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| plane | R1 | The Durable Object class the instance exports is this module's (`Store`, `extend | NOT PLACED | plane Wave B (Store calls assembleStore, ask/draft delegate): named in BOB's handoff (after STORE-ASSEMBLY #3 merges) but no START written; plane still holds pending.mjs, ask.mjs, store.mjs |
| plane | R6 | The Worker's module exports `default { fetch }`, `control-plane`'s `makeFetch` o | NO JOB; met-state UNKNOWN | older marks (fix rounds 2-7); no START names them; plane #61 merged K5121 |
| plane | R48 | The composed page's screens are the nine modules' (`screens-entry` among them).  | NO JOB; met-state UNKNOWN | older marks (fix rounds 2-7); no START names them; plane #61 merged K5121 |
| plane | R56 | Words by key. | NO JOB; met-state UNKNOWN | older marks (fix rounds 2-7); no START names them; plane #61 merged K5121 |
| plane | R95 | (fix round 7 G83; K4746, K4747, K4752; `runtime-limits` R28) | NO JOB; met-state UNKNOWN | older marks (fix rounds 2-7); no START names them; plane #61 merged K5121 |
| plane | R111 | ) The Store's RPC methods `ask(args)` and `draft(args)` answer `store-assembly`' | NOT PLACED | plane Wave B not started; also the R111 platform check (extraction) at redeploy (item 13b) |
| plane | R112 | The Worker's gated hook (`gatedOp`, R6) answers `op=pagetranscribe` through `ext | NOT PLACED | plane Wave B (Store calls assembleStore, ask/draft delegate): named in BOB's handoff (after STORE-ASSEMBLY #3 merges) but no START written; plane still holds pending.mjs, ask.mjs, store.mjs |
| plane | R113 | The Worker's public door answers `knock` through `doorbell`'s `doorbellPublicOp` | NOT PLACED | plane Wave B (Store calls assembleStore, ask/draft delegate): named in BOB's handoff (after STORE-ASSEMBLY #3 merges) but no START written; plane still holds pending.mjs, ask.mjs, store.mjs |
| plane | R114 | The Store has two RPC methods beside `ask` and `draft` (R111): `dispatchMemberRu | NOT PLACED | plane Wave B (Store calls assembleStore, ask/draft delegate): named in BOB's handoff (after STORE-ASSEMBLY #3 merges) but no START written; plane still holds pending.mjs, ask.mjs, store.mjs |
| plane | R9 | It writes no row (the owed-work ledger's tables are `store-assembly`'s, its R97) | NO JOB; met-state UNKNOWN | older marks (fix rounds 2-7); no START names them; plane #61 merged K5121 |
| plane | R55 | The plane's ask, run, draft and transcribe calls to `agent-worker` (`/ask`, `/ru | NO JOB; met-state UNKNOWN | older marks (fix rounds 2-7); no START names them; plane #61 merged K5121 |
| plane | R63 | The 503 answered under parallel reads is diagnosed and fixed, or its cause is re | NO JOB; met-state UNKNOWN | older marks (fix rounds 2-7); no START names them; plane #61 merged K5121 |
| plane | R76 | A reading the door defers. | NO JOB; met-state UNKNOWN | older marks (fix rounds 2-7); no START names them; plane #61 merged K5121 |
| plane | R85 | (fix round 6, G44; K4655; K4725) | NO JOB; met-state UNKNOWN | older marks (fix rounds 2-7); no START names them; plane #61 merged K5121 |
| progressions | R47 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| provenance-routes | R14 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| publish-schedule | R12 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| queue-producers | R43 | Every older producer's sentences are read by key. | NO JOB; code/test exists, mark looks stale | QUEUE-PRODUCERS J22 "Met: R43's sentence" (record); K5168 struck R54 only |
| ratification | R6 | After the commit every part's bytes are copied to the published store by hash, a | NO JOB; met-state UNKNOWN | older mark (K4727 amended); no START names it |
| ratification | R60 | The sign act's independent calls run together. | CARRIED: RUNNING | ADMISSION #19 (fold) + CONTROL-PLANE #62 (r10-caseratify-chain red by name); public-read 4-hop DONE |
| reading-guides | R16 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| reading-pipeline | R49 | Every text is decoded by one rule. | NO JOB; code/test exists, mark looks stale | implemented (reading-pipeline/index.mjs:24 decodeText; html.mjs "one streaming pass"); G131 marks left |
| reading-pipeline | R51 | HTML is read by one streaming pass, linear in its bytes. | NO JOB; code/test exists, mark looks stale | implemented (reading-pipeline/index.mjs:24 decodeText; html.mjs "one streaming pass"); G131 marks left |
| reevaluation | R39 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| reevaluation | R40 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| review | R19 | Each draft also carries `editions`, `{prepared, published}`, as `case-authoring` | NO JOB; code/test exists, mark looks stale | `editions` carried (review/index.mjs:923-930; K4467, review #26 K5135); mark not struck |
| screens-action | R9 | help-records | CARRIED: RUNNING | SCREENS-ACTION #19 (help-records draw; item 75 screen causes); mark position uncertain |
| screens-daily | R42 | A member who may not start projects. | CARRIED: RUNNING | SCREENS-DAILY #22 (K5148 listed R42 under 03 §1, §2) |
| screens-inquiry | R23 | state b | NOT PLACED | 30b screen half / R23 read-back: "not in this START" (screens-inquiry record, SCREENS-INQUIRY #30 START B62) |
| screens-inquiry | R50 | Conclude takes a member's own reading. | NOT PLACED | as R23 (K5090: waits on inquiry R85 and R30b screen half, a CHANGE; R85 struck K5113; CHANGE never written) |
| screens-inquiry | R20 | applies to each line below. | NO JOB; met-state UNKNOWN | header mark "applies to each line below"; see R123-R125 |
| screens-inquiry | R123 | A wrong held copy is set aside, not retired. | NO JOB; met-state UNKNOWN | older (fix rounds 2-4) marks; "not in this START" (screens-inquiry record); K5090 notes R129 case brought in line |
| screens-inquiry | R124 | A move of citations is offered only where it can be done. | NO JOB; met-state UNKNOWN | older (fix rounds 2-4) marks; "not in this START" (screens-inquiry record); K5090 notes R129 case brought in line |
| screens-inquiry | R125 | The cite act sends a body and marks the passage. | NO JOB; met-state UNKNOWN | older (fix rounds 2-4) marks; "not in this START" (screens-inquiry record); K5090 notes R129 case brought in line |
| screens-inquiry | R129 | (fix round 4, N5, cite-refusal; K4429; `extraction` R80, `citation` R21) | NO JOB; met-state UNKNOWN | older (fix rounds 2-4) marks; "not in this START" (screens-inquiry record); K5090 notes R129 case brought in line |
| screens-intake | R49 | A capture of bytes the store already holds files a document and sends the member | NO JOB; met-state UNKNOWN | older marks (L3; fix round 6 G43); screens-intake #25 merged; no job open for the module |
| screens-intake | R131 | Fix round 6, G43 (K4657): R61 | NO JOB; met-state UNKNOWN | older marks (L3; fix round 6 G43); screens-intake #25 merged; no job open for the module |
| screens-investigate | R1 | Reads `person` (positions with their dates and sources, career, credentials, mem | CARRIED: RUNNING | SCREENS-INVESTIGATE #16 (K5148 worded and marked; items 70, 84) |
| screens-investigate | R8 | Reads the standard (`standard`: its words as written, its source passage, its is | CARRIED: RUNNING | SCREENS-INVESTIGATE #16 (K5148 worded and marked; items 70, 84) |
| screens-investigate | R33 | Timeline: matters followed through a progression, and the dates the documents st | CARRIED: RUNNING | SCREENS-INVESTIGATE #16 (K5148 worded and marked; items 70, 84) |
| screens-investigate | R34 | Forms choose, they do not ask for a fingerprint. | CARRIED: RUNNING | SCREENS-INVESTIGATE #16 (K5148 worded and marked; items 70, 84) |
| screens-investigate | R51 | (T51 fix round; DEC-375, C40; `standards` `standardinforce`; amends R8) | NO JOB; met-state UNKNOWN | waits on op-declarations adding `standardinforce` to the member session set (OPS row exists, op-declarations/index.mjs:1215); OP-DECLARATIONS #37 merged K5171; not established |
| screens-publish | R6 | Drawn in the public frame with no session (`interface-shell` R30) at `/app/publi | CARRIED: RUNNING | SCREENS-PUBLISH #22 (K5148; J41 causes 2a-2c COMPLETE on branch, unmerged) |
| screens-publish | R104 | until a test names it. | CARRIED: RUNNING | header mark "until a test names it"; SCREENS-PUBLISH #22 op tables (60 lines left) |
| screens-publish | R44 | The case editor holds what a case states about itself. | CARRIED: RUNNING | SCREENS-PUBLISH #22 (K5148; J41 causes 2a-2c COMPLETE on branch, unmerged) |
| screens-settings | R80 | The roster names each member's projects the administrator sees in full. | CARRIED: RUNNING | SCREENS-SETTINGS #19 (K5172 written for the projects column) |
| signin-door | R6 | ; K4168; `op-declarations` R80, R81; `op-grades` R49, R50; was `control-plane` R | NO JOB; code/test exists, mark looks stale | DECLARED_OPS declares subscriptionsignin (signin-door/index.mjs:48); merged K5121; mark not struck (K5058 said accepted until the job names it) |
| sources | R21 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| standards | R61 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| standards | R62 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| store-assembly | R1 | `assembleStore(ctx, env, {deliver})` builds every module of the record store on  | NOT PLACED | class clause waits on plane's Wave B (K5125 (3)); `test.todo` named; not started |
| store-assembly | R98 | ) The split is by copy, then delete. When the job closes `plane` holds the `Stor | NOT PLACED | as R1 (plane Wave B) |
| store-request | R20 | Every declared op is reachable by the world's door. | NO JOB; code/test exists, mark looks stale | WORLD_UNREACHED is empty (store-request/door.mjs:57); STORE-REQUEST #3 running; BOB strikes at merge |
| store-request | R22 | The split is by copy, then delete: when the job closes `control-plane/index.mjs` | CARRIED: RUNNING | CONTROL-PLANE #62 (innerRequest switch) |
| translations | R21 | ; K4168; `op-declarations` R80, R81; `op-grades` R49, R50; was `control-plane` R | NO JOB; code/test exists, mark looks stale | `interfacewords` in DECLARED_OPS (translations/index.mjs:835); mark not struck |
| translations | R18 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
| wizard-scripts | R51 | ; P1; moved from `interface-shell` R12, R47, R50, R101, R107, whose lists it col | NO JOB; code/test exists, mark looks stale | ADMIN_ACTS/ADMIN_SCREENS exported (wizard-scripts/admin.mjs:6,10); K5078, K5080 merged; mark not struck |
| workbooks | R19 | declares the ops it serves that the screens send (declaration pass) | NO JOB; code/test exists, mark looks stale | module has DECLARED_OPS and declared-ops.test.mjs (the K4206 pass); no START in this round names the id; census `declared 389 of 395` (6 undeclared: see list) |
