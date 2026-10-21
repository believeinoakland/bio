# monitoring (T51)

**Status** · session_01PtKqTwtHQrKyKtULMgWvUo · depth 2 · WORKING · handled B5

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
