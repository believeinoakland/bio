# monitoring (T51)

**Status** · session_013HZfjoGu9DeeFtdAsv1UPN · depth 2 · COMPLETE · handled B9

## J1 · COMPLETE

COMPLETE for T51 monitoring (session session_01QHLkmebmN4o1yN2ZJJmKBE), head 18a9f3808d on job/T51/monitoring (tranche/T51 merged in as c95c43efd0; no rebase).

**Entry applied: T51-243 (words, K3949).** Every finding in build/plan/words-pass/monitoring.md is fixed (the list's line numbers had moved after the merge; the live check's list is the one I worked from).

- Copies of existing words.json rows now read through `word(key)`: `monitoring.content_type`, `monitoring.reason_given`, `monitoring.says.objective_published_finding`, `monitoring.says.published_finding`, `monitoring.time_zone_held`, `monitoring.says.recorded_frequency_governs`, `monitoring.document_served_gathered` (vars locator, id, bundle; the same en).
- Sentences held only in code now read through `localize`: `monitoring.index.fetched_the_opendocument_export` (the stitched Session Log fragment), and `monitoring.says.an_objective` (the fragment the project-rests sentence takes as its `has` var).
- Test copies fixed, each compared by key or by equality with `word`/`localize`, never held as text: voice.test.mjs (C-48.8 by `word("refusal.DRIVE_TICK_EXPORT_IS_THE_SHELL")`; C-48.9 and the shape suffix by `localize` with the product's id and en), watch.test.mjs (fixture why by `word("intent.objective_states_condition")`), docket.test.mjs (stub detail by `localize("case-import.index.no_watch_in_force", ...)`), fixture.mjs (link-sweep's uniqueness sentence by `localize("link-sweep.checks.id_is_not_unique_within", ...)`; the literal `id ` prefix stays so the seam test's expected text is unchanged).

**Deferred:** none. **Judged as no member reading:** none. **Found in another module:** none.

**Tests run**
- `node --test test/m/monitoring/` (bio-plane): tests 145, pass 145, fail 0 (run twice; the second after the last test edit).

**Checks run**
- `checks/words.mjs /home/user/bio monitoring`: inline 0, plain 0, testcopy 0, missingkey 0, handlist 0; 0 failures.
- `checks/words.mjs /home/user/bio monitoring following link-sweep scheduler`: no line naming monitoring.
- `checks/run.mjs /home/user/bio` (before my last test fix, then the words check on its own after it): format 176 modules, 0 failures; architecture 3648 files, 0 failures; coverage 175 modules, 5955 of 6092 live ids named, 24 failures (none names monitoring; the module's own coverage is 61 of 61, 0 failures); channels 2 participants, 0 failures; words 1163 failures, of which 1 named monitoring (docket.test.mjs:128), now fixed; the whole-repo words run after the fix shows 1162 and none names monitoring.
- `checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files, 0 failures.
- `checks/architecture.mjs /home/user/bio monitoring`: 20 product files, 100 relative imports, 0 failures.
- `checks/coverage.mjs /home/user/bio monitoring`: 61 of 61 live requirement ids named by a test, 0 failures.
- `bio-plane/src/setup-words/build.mjs --check`: stale-rows note only, as expected. The two new ids above (monitoring.index.fetched_the_opendocument_export, monitoring.says.an_objective) are not yet in rows.mjs; rows are regenerated at the layer close.
- `checks/ownership.mjs /home/user/bio monitoring tranche/T51 job/T51/monitoring`: 6 files changed by monitoring, 0 failures.

**Size (session_01QHLkmebmN4o1yN2ZJJmKBE):** test runs 2, module lines 2820 (an approximate count: non-blank, non-comment lines in src/monitoring/*.mjs; 3789 lines in all).

## J2 · COMPLETE

COMPLETE for T51 monitoring FR-36 (session session_019To67KKnDNVeKq651n8y2v), code at d77afcefff on job/T51/monitoring (tranche/T51 merged in, no rebase). Requirement lines: written by me in `build/requirements/monitoring.md` (B3, B4), not in this record.

**Entries applied (B2, B5).**
1. **R75** `namedRequestSet` (`op=namedrequestset`, a member session): new file `bio-plane/src/monitoring/named-requests.mjs` (see Size). Refusals in R75's order, each with a control: `MACHINE_CANNOT_SET_REQUEST` (C-18.22), R1's required-argument refusal naming `bundle`, `ABSENT` (absent and unseen identically), `NAMED_REQUEST_REFUSED` (C-18.23; `checkGatheringGrammar` called on the one request, each finding named in `detail` and in `findings`), `NO_SUCH_REQUEST`, then promotion's relayed. Planted and gathered by the next cadence tick (R28); a retired one is not due; two requests survive each other's revision byte for byte; the daemon block and the sweeps are carried; a machine credential and an `http` locator are refused with the file unchanged. Rows C-18.22 and C-18.23 are in `checks.mjs` (`NAMED_REQUEST_CHECKS`, in `MONITORING_CHECKS`), taken as B5 says (link-sweep took C-18.24), awaiting the stamp.
2. **R76** `namedRequests` (`op=namedrequests`, read): items `{bundle, request, target, locators, authority, criticality, cadence, status, planted, last_attempt, due, next, daemon}` plus `state`, and `unscheduled`/`disabled` reasons; `paused`, `counts`, `limit`, `truncated`. An unseen bundle's request is neither answered nor counted (control). Never throws (a store that cannot be read answers `ok: false` in words).
3. **R77** `sweepHost().write({bundle, mutate, author, viewer, log})`: the shape B5 asks for, exactly: `mutate` edits the parsed object in place and returns it, `log` is the Session Log sentence. One addition, stated in R77: `mutate` may instead return a refusal `{ok: false, reason, ...}`, which is relayed unchanged with nothing written (the call runs in one record transaction, so an id `mutate` minted is taken back); `link-sweep` can ignore it. The write is synchronous (`promotion.promote` is). Unchanged object: `{ok: true, existed: true}`, nothing written. Canonical form: two-space JSON and a newline.
4. **K4168 / K4202 `DECLARED_OPS`** in `index.mjs` beside `monitoringOps`: `monitor`, `monitoring`, `monitorpause`, `monitorset`, `monitorslate` (the census) and `namedrequestset`, `namedrequests`. The mechanical pass had NOT declared anything for this module on my branch (no `DECLARED_OPS` in `src/monitoring/` after merging `tranche/T51` at e67a3a1c3c), so I declared all seven; if the pass lands one later it is a duplicate (`declaredOpsOf` reports it): take mine. The first five copy the hand rows (classes, machineClasses, mutating from `op-declarations`; weight and description from `op-grades`: `monitor` observational, `monitorpause` credential, `monitorset` reversible, descriptions word for word; `monitoring`, `monitorslate` and `namedrequests` have no `op-grades` row and get weight `read` and a `read: ...` description). Fields: `monitor` {accepts/requires `bundleId`}; `monitoring` and `monitorslate` {accepts `now`, `limit`, requires none}; `monitorpause` {`paused`}; `monitorset` {accepts `bundleId`, `enabled`, `frequency`; requires `bundleId`, `enabled`}; `namedrequestset` and `namedrequests` as B2 gives them (`namedrequestset` also names `needs: "contribute"` and stamps `author`, `viewer`, which a mutating op with no hand row must). The control plane's `actor` and `actorClass` stamps are not accepted fields (the door composes them). New requirement line for the census: **R78**, written in the requirements file.

**Readings I settled (not blocking; BOB may CHANGE).** (a) A revision states the request whole in the five required fields; `cadence` absent means once (R28), `status` absent keeps the held status (a retired request is not reopened by an edit that does not say so; `open` on a new one), and the original `planted` instant is kept. (b) A minted id is `GATH-<year>-<counter>-<slug of target.text>` (record-core `allocId`, R69). (c) `NO_SUCH_REQUEST` and the unreadable-gathering-file refusal (a held file that is not inline, not JSON or not an object is refused `GATHERING_REFUSED`, never overwritten) carry no catalogue row of their own; `NO_SUCH_REQUEST` is plain like `NO_LOCATOR`.

**Deferred:** none. **Judged as no member reading:** none.

**Hand rows that can now go (other modules', BOB's to schedule).** `op-declarations`: the spec rows of `monitor`, `monitoring`, `monitorpause`, `monitorset`, `monitorslate` (their `needs` and stamps rows stay: I did not declare them for the hand ops). `op-grades`: `monitor` (RUNG_ABSENT, NON_ACTS), `monitorpause` (RUNG_ABSENT, NON_ACTS), `monitorset` (RUNGS, NON_ACTS). The agreement check of both modules passes with my declarations in the collection.

**Found in another module:** nothing in a module I read. Failures that exist without my change (same counts on `tranche/T51` as merged, stashed run): `op-declarations` 1 (R73 registry gaps, `expertisewithdraw` and others), `op-grades` 2 (R42, R46 MARKS, `expertisewithdraw`), `interface-shell` 27, and the whole-repo words check's 8 `testcopy` findings in `op-grades` tests (t36, t47, t48). None names monitoring or an op of mine.

**Tests run** (each new test written first and seen failing: `named-requests.test.mjs` fails to load against the code before this job)
- `node --test bio-plane/test/m/monitoring/`: tests 168, pass 168, fail 0 (new: `named-requests.test.mjs` 15, `declared-ops.test.mjs` 8; `seam.test.mjs` and `invariants.test.mjs` updated for `write` and the two rows).
- Users and neighbours: `following` 116/116, `link-sweep` 29/29, `scheduler` 135/135, `test-support` 61/61; `op-declarations`, `op-grades`, `interface-shell` as listed above, identical to baseline.

**Checks run** (from `/home/user/civicos-process`)
- `checks/run.mjs /home/user/bio`: format 175 modules, 175 requirements files, 0 failures; architecture 3782 product files, 12939 relative imports, 0 failures; coverage 175 modules, 6195 of 6208 live ids named, 6 failures (none names monitoring); channels 0 failures; words 8 failures (all `op-grades` testcopy), none in monitoring.
- `checks/coverage.mjs /home/user/bio monitoring`: 65 of 65 live requirement ids named by a test, 0 failures.
- `checks/words.mjs /home/user/bio monitoring monitoring following link-sweep scheduler`: inline 0, plain 0, testcopy 0, missingkey 0, handlist 0; 0 failures.
- `checks/ownership.mjs /home/user/bio monitoring tranche/T51 job/T51/monitoring`: 9 files changed by monitoring, 1 failure: `build/requirements/monitoring.md`, the one file B3 and B4 say is accepted at the merge.
- `bio-plane/src/setup-words/build.mjs --check`: stale-rows note only (first stale word `ai-accounts.declared.accountusesset`, another module's); the new ids (`monitoring.declared.*`, `monitoring.checks.only_a_member_plants`, `monitoring.checks.this_request_was_not`, `monitoring.named_requests.*`) are not in `rows.mjs` yet, regenerated at the layer close.

**Size (session_019To67KKnDNVeKq651n8y2v):** test runs 5, module lines 3078 (non-blank, non-comment lines in `src/monitoring/*.mjs`; 4114 lines in all, over the P6 mark of about 4,000 as the requirements file foresaw: `index.mjs` grew by 59 lines to 3429, `named-requests.mjs` is new at 251 lines (208 non-comment), `checks.mjs` grew by 18 to 265).

## J3 · QUESTION

QUESTION on C26 (my part): no requirement line is written for it, and the one that governs says the opposite.

What I found (read whole: monitoring R1–R10, R74, R38; code `index.mjs` tick comparison ~l.940–1010; capture R96 and `capture/index.mjs` heldAt):
- The tick's comparison (monitoring R5, `index.mjs` ~l.969–1010) already prefers the determined evidentiary digest. It falls to the raw SHA-256 whenever the baseline recorded none, or the handler/member differ, or the fresh bytes are undetermined, and says so in `compared: "raw"` + `compared_basis`. R5 *requires* that fallback ("else the raw SHA-256").
- The walk's "changed" for a static page is NOT produced by the tick: it is `heldAt` (capture R96, `capture/index.mjs` ~l.1130–1160), which compares the served bytes' raw SHA-256 with `copy.sha256` (no determined digest anywhere in that path), and `screens-intake/capture.mjs:366-376` which maps its `changed.state`. Both are capture's / screens-intake's, not monitoring's. I cannot find a plane line in monitoring that says "changed" for an unchanged static page except R5's raw fallback (an ASP.NET-style page with no determined baseline digest reads `modified` on every fetch, which is the same symptom).

Best reading of "monitoring's part" (what I will build unless you say otherwise):
1. The tick's status is judged only on the determined digest. When the baseline recorded no determined evidentiary digest (or it cannot be compared with the fetched side: different handler/version, different member, fresh side undetermined), the tick answers `compared: null`, `status: null`, `compared_basis` saying why (existing keys), the look is `LOOKED_INDETERMINATE`, nothing is captured (R9 does not fire), and no `modified`/`unchanged` is written. Raw bytes are compared only where the baseline is a shell/rendered frame (R5's `shell` arm is untouched) and the raw "same bytes" equality is no longer evidence of `unchanged` or of `modified`.
2. That amends R5, R9 (a `modified` capture), R11 (a look's outcome) and R38. I cannot edit the requirements file. If you agree, please write the amended R5 line (marked not yet met) and CHANGE me; I then test it: baseline with no determined digest → cannot-tell; same page re-fetched with unchanged substance → unchanged; control: changed substance → changed.

Questions:
(a) Is reading 1 right, i.e. does "cannot tell" for the tick mean `status: null` + an indeterminate look, replacing the raw fallback entirely (and so one more thing for `following`, `scheduler` and the screens that read `compared: "raw"` to meet)?
(b) The determined digest is recorded on the baseline by acquisition/capture's side (not mine). Is that half in the cause-capture job (its C26*), and does `heldAt` get the same rule there? I am not touching either.
(c) If instead you mean heldAt only, then monitoring has nothing to change for C26: say so and I will COMPLETE with that stated.

I carry on with nothing else (this is my only cause).

## J4 · COMPLETE

COMPLETE for T51 monitoring, fix round 2 (B6, answered by B7, K4305; session session_01PtKqTwtHQrKyKtULMgWvUo). tranche/T51 merged in, no rebase.

**C26: nothing to change in monitoring.** BOB's ANSWER (B7, option c): the walk's "changed" comes from `capture`'s `heldat` (R96), held by cause-capture-t51, and the determined digest on the baseline is capture's side too. Monitoring's R5 raw fallback stays as written. No code, test or requirement of monitoring changed in this job.

**Deferred:** none. **Found in another module:** nothing new (the heldAt raw comparison in `capture/index.mjs` is the cause BOB assigned to cause-capture-t51).

**Tests run:** `node --test --test-force-exit bio-plane/test/m/monitoring/`: tests 168, pass 168, fail 0 (after merging tranche/T51).
**Checks run:** `checks/ownership.mjs /home/user/bio monitoring tranche/T51 job/T51/monitoring`: 1 file changed by monitoring (this record), 0 failures. No other check was run: no module file changed.

Size (session_01PtKqTwtHQrKyKtULMgWvUo): test runs 1, module lines 0 changed (module unchanged at 3078 non-blank, non-comment lines in `src/monitoring/*.mjs`).

## J5 · COMPLETE

COMPLETE: C26 needs no change in monitoring (B7, option c). Suite 168/168 after merging tranche/T51; ownership 0 failures. Details in J4 of my record.

## J6 · COMPLETE

COMPLETE for T51 monitoring, batch C job 52, G140's consumer half (session session_01PCKo5gn3rH8ZDaWARPfr8H), code at the head of job/T51/monitoring (tranche/T51 merged in, no rebase).

**Entry applied (B8).** `monitoring/index.mjs` `#assess` now reads `id.shell` (site-profiles R2: a CERTAIN client-rendered match) where it read `id.handler.shell` (the handler's class flag, true of a POSSIBLE or LIKELY match too). A page matched only POSSIBLE gets its document type and contract; a CERTAIN shell stays `UNMONITORABLE`. No requirement line changes (R7 already says a shell captured as the document is unmonitorable; "shell" there is now read as site-profiles' R2 defines it).

**Tests.** New in `tick.test.mjs`, named R7: a POSSIBLE client-rendered page, a CSV and plain prose each hold a document type and a contract other than `unmonitorable` (written first, seen failing on the POSSIBLE page: no document type held). Tests that pinned a POSSIBLE match as unmonitorable and now use a CERTAIN shell fixture (control: R7 asserts `identify(...).shell === true` on it): `tick.test.mjs` R7 "a shell captured as the document grades no change", and `invariants.test.mjs` R38 "an equality that costs nothing is not evidence". For the CSV and plain prose shapes, `identify` already answers no handler (class flag false), so those two pass before and after; they are kept as the over-strictness controls. Nothing found in another module.

**Tests run.** `bio-plane/test/m/monitoring/`: tests 169, pass 169, fail 0. Users: following 127/127, link-sweep 41/41, scheduler 163/163. `impact.mjs origin/tranche/T51 HEAD` names 19 modules because `DECLARED_OPS` is a shared table; the three direct users above were run, not the rest.

**Checks.** `checks/coverage.mjs ... monitoring`: 65 of 65, 0 failures. `checks/ownership.mjs ... monitoring tranche/T51 job/T51/monitoring`: 4 files, 0 failures. `checks/run.mjs`: architecture 0 failures; format 1 failure (`office-readers` names `bio-plane/src/office-xml.mjs`, another module's); coverage 21 and words 19, none naming monitoring (words: 0 testcopy, 0 plain). `setup-words/build.mjs --check`: stale-rows note only (first stale word `doc-clean.index.the_package_holds_more_entries`, another module's).

**Deferred:** none. **Found in another module:** only the `office-readers` path above.

Size (session_01PCKo5gn3rH8ZDaWARPfr8H): test runs 9, module lines 3300 (non-blank, non-comment lines in src/monitoring/*.mjs; 4116 in all)

## J7 · QUESTION

QUESTION (J1) · monitoring · fix round 10 batch 5 · the four `intentWorld` / `publicationWorld` lines (fixture.mjs:210, :211; each a declaration and a use)

What stands: the other lines of the START are re-pointed or marked (see my record when I post COMPLETE); the three fixtures are published and tested; 172 module tests pass. These four findings remain.

The stand-ins are `stubIntent` (intent R7's `watchSet` and `registerSource`) and `stubPublication` (publication R42's `restingCapturesOf`). 14 tests use them, in `understanding.test.mjs` (R33) and `watch.test.mjs` (R70). Each test states, per project, which capture digests the project's objective or findings rest on, and the digests are the ones of documents that monitoring's own world holds (so `watched()` can map a digest to its bundle). Some tests set several projects, a watch set longer than two pages, a `watchSet` that throws for one project, and `gaps` / `progress` overrides for investigation.

Why the published fixtures do not fit: `intentWorld()` and `publicationWorld()` each build one project in their own database with digests of their own making (`ent-1-need` and the like, `sha("the text of <doc>")`), and the two worlds name different project ids. A test cannot say "project P1 rests on this document's capture" and "P2 on that one", and `watched({project})` asks both providers about one project id.

My best reading: re-pointing needs the providers to publish a fixture parameterised by what the user holds, for instance intent `watchSetOf({[projectKey]: [digest, ...]})` (a real intent whose projects' conditions read those digests, made by real acts) and publication `restingOf([{finding, projects, digests}])` over the same project ids. Then my `world()` takes those and the stubs go.

What I will do unless you say otherwise: leave these four lines at `stay` in my COMPLETE, named with this reason, and re-point on a CHANGE once intent and publication publish such fixtures. Alternative if you prefer it now: I re-point R33's objective half only onto `intentWorld()` (its three digests, documents made to hold them); that leaves the stub for the rest, so it does not clear the four findings.

## J8 · COMPLETE

COMPLETE for T51 monitoring, fix round 10, Wave A batch 5 (START B9), session session_013HZfjoGu9DeeFtdAsv1UPN, on job/T51/monitoring. All 36 own lines are done but four, and the one open QUESTION is J7 (named "J1" inside its own text, a slip).

**Fixtures published** in `bio-plane/test/m/monitoring/fixtures.mjs` (new), each made by the real code at test time and called by a test of mine in `fixtures.test.mjs` (names R48; R1 R8 R9 R10; R16 R19 R20 R32 R47 R48):
- `flaggedRefusal({limit})`: the real unread `flagged` answer `{ok:false, reason:null, items:[], limit, truncated:false, detail}` (the projection it reads is gone).
- `monitorAnswer({ticks, kind})`: the real `monitor({bundleId})` answer `{status, body}` per tick of the clock (`answers`, `answer` the last). A `modified` source gives a distinct `capture.sha256` per tick; an `unchanged` one gives `capture: null` (the START's shape `status:"unchanged", capture:{sha256}` is not what the real code answers; real unchanged carries no capture, so following's judgment re-point should use `kind: "modified"` where it needs a digest per tick).
- `monitoringReads()`: `{empty, seeded}`, each with the real `monitoring`, `archiveEligible`, `flagged`, `configured`, `archiveDue` reads; `seeded` has unscheduled, due, modified, removed, quiet monitors (ticked by the real tick), and two failing addresses (one fallback-eligible, one at the floor and not).

**Own lines re-pointed (FIX-E), tests green:**
- escalation/escalationsDue (12): `ends.test.mjs`, `understanding.test.mjs` take `escalationsDue().emptyWorld.esc` (real escalation, empty world).
- acquisition/acquireRefusals (5): `docket`, `invariants`, `understanding` take `acquireRefusals({kind: "source_refused" | "not_eligible"})`. A source refusal now carries status 410 where the hand-built one said 503; no test reads it.
- promotion/projectActNotParticipant (2) and action-clocks/pendingClocksRefusal (1): re-pointed.
- case-import/watchedImports (2): `stubCaseImport` and `watchOf` are deleted from `fixture.mjs`; `docket.test.mjs` runs over the real case-import (watches made by the member's own `watchImport` act, reads recorded by the real `recordDocketRead`) seen through a spy (pages of two so the cursor is followed, a `reads` log, `refuse` taking `notWatched.refusal`, `fail`). Expected numbers follow the real answers (a docket entry case-import cannot verify is `new_entries: 1, new_refused: 1`; another group's answer is recorded unreadable by the real module, where the old test forced it). The import order is now the real ids', so expected orders are derived from them.
- conformance/noDeterminations (1): `fixture.mjs` no longer builds a conformance. The published fixture would need a `conformance` edge in monitoring's `uses` (architecture check: monitoring does not declare it), so the world reaches the real conformance on the same host as production does (actions' own default); no determination is held there, which is what the fixture was. If you want the published fixture used, `modules.json` needs the edge (yours).

**Markers I added (K5060), file:line and why:**
- `docket.test.mjs:112` `fixtures-own: platform`: the docket host's own HTTP 404 answer served by the scripted network (a fake-network double), as your START named.
- `fixture.mjs:268` `fixtures-own: synthetic`: the calendar content type registered through docprofile's `registerDoctype` seam, as your START named.
- `fixture.mjs:310` `fixtures-contract: link-sweep sweep-fence` (the registered share's fence refusal), `named-requests.test.mjs:410` `fixtures-contract: link-sweep sweep-mutate` (covers 411, 416, 417), `relay.test.mjs:35` `fixtures-contract: store-door store-envelope`. These show `contract-no-run` until link-sweep's and store-door's own jobs merge a `// fixtures-run: monitoring <id>`: waiting on link-sweep and store-door.
No `fixtures-generic` marker.

**Left, named (stay):** 4 findings, `fixture.mjs:207` and `:208` (declaration and use of `stubIntent` and `stubPublication`; R33's and R70's 14 tests). Cause in QUESTION J7: the published `intentWorld()` and `publicationWorld()` are one project in their own database with their own digests, and a test must say per project which of monitoring's own documents' digests it rests on. They are the judgment lines for intent and publication; I re-point on a CHANGE once those providers publish fixtures parameterised by what the user holds, or on your other answer.

**List now** (`checks/fixtures.mjs . monitoring --list`): 11 lines: 2 accepted (own), 5 contract-no-run (waiting, above), 4 the stay lines above.

**Found in another module:** `build/plan/fixtures-T51/part-5.md` says `monitorAnswer` is `status:"unchanged"` with `capture:{sha256}`; the real tick answers `capture: null` when unchanged (R9 captures only a modified source). following's stand-in (`following/fixture.mjs:166`) is that unreal shape; its job re-points to `monitorAnswer({kind: "modified"})` or drops the capture. Not a defect of this module.

**Tests run.** `bio-plane/test/m/monitoring/`: tests 172, pass 172, fail 0 (169 before, plus 3 for the fixtures). Users of the files I changed (they import monitoring's `fixture.mjs`): following `watches.test.mjs`, scheduler `rank.test.mjs`, affordances `backing.test.mjs`: 49/49. `build/plan/impact.mjs origin/tranche/T51 HEAD` names 104 modules, 1814 test files, because the diff against `origin/tranche/T51` includes everything the tranche moved since the branch point; no source file of mine changed (tests only), so I ran the three importers, not the rest.

**Checks.** format 178 modules, 0 failures; architecture monitoring 25 files, 129 imports, 0 failures; coverage 65 of 65, 0 failures; words 0 failures; ownership 10 files changed by monitoring between tranche/T51 and HEAD, 0 failures.

**Deferred:** none in the module. Source unchanged.

Size (session_013HZfjoGu9DeeFtdAsv1UPN): test runs 11, module lines 3300
