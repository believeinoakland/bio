# affordances (T51)

**Status** · session_018BZD69KvUNUDfmGiun3BEb · depth 2 · WORKING · handled B8

## J1 · QUESTION

QUESTION (R62, R70 · ACT_HELP). My best reading, carried on with: the design's reads list for `affordances` (words-reads.json) now gives `does` words for six declared ops the requirements do not name: counselpacket and holdnoticeprepare (R70 names these two), and noticeprepare, noticepost, signeradd, versionnotice (not named anywhere). R62 says this module's keys are the reads list, so I hold all six under their own ops (`act.<op>.does`), beside R69's seven browser acts under `BROWSER_ACTS` (op-declarations is later in the order, so the seven names are held here). Consequence for BOB/T51-107: op-declarations' `ACT_HELP_ABSENT` must stop naming these six (counselpacket, holdnoticeprepare, noticepost, signeradd in `unexplained`; noticeprepare, versionnotice in `read`), or its R34 partition test (t36.test.mjs:298) goes red when this merges; and its partition must run over ops only, since the seven browser acts are in ACT_HELP and are no ops (R69). If you would rather hold only R70's two, say so and I drop the other four (and name them in the test's NOT_HELD_READS).

## J2 · REPORT

REPORT (T51-99, for BOB; none blocks this job).
1. op-declarations (T51-107), by CHANGE as B2 says: with the six ops held in ACT_HELP, four op-declarations tests go red until its ACT_HELP_ABSENT stops naming counselpacket, holdnoticeprepare, noticepost, signeradd (unexplained) and noticeprepare, versionnotice (read): t36.test.mjs R34, t45.test.mjs R34/R49, t43-era R47/R34, t50.test.mjs R75. Its partition must run over ops only: ACT_HELP now also holds R69's seven browser acts (`BROWSER_ACTS`, exported here), which are no ops. Its other 9 reds are as at the tranche tip.
2. Strings no member reads, left in source for the design stream (K3944): `CATALOGUE_DETAIL` (door.mjs: how to read the catalogue answer, names `target=<record id>`, `vocabularies.rung_ladder`, wire fields; read by the assistant pack) and the NO_TARGET refusal `detail` in facts.mjs ("pass target=<record id>"). door.test.mjs still asserts K899's "record, not bundle" on the first.
3. answer-envelope's `page-policy.test.mjs` imports `signpage.mjs` of control-plane: the one architecture failure of checks/architecture.mjs over the whole tree, not mine (rule 1, K3835).
4. Whole-tree words check: 0 lines name affordances.

## J3 · COMPLETE

COMPLETE (T51-99, affordances).
Entries applied: R67 `proceeding_kinds` and R68 `action_kind_labels` (new store route `affordancevocab` in this module's `affordancesOps`, asked by the door beside the kinds on both arms, handed to `vocabulariesFor(kinds, profile)`; a key the store does not answer is left out; test seam `deps.combine`); R69 the seven browser acts in ACT_HELP (`BROWSER_ACTS`); R70 and R62: counselpacket, holdnoticeprepare, noticeprepare, noticepost, signeradd, versionnotice held (B2/K4070); stale comments (civicos-ui/app.html) removed; t36 reds cleared; catalogue :473 and :679 and t45-backing:145 (effective_from) cleared; N1073: every hand-list of another module's ops/codes (40 findings) derived from owners' op maps, check tables and the grading tables.
Deferred: none. Dropped assertions (pins op-grades' own tests hold: test/m/op-grades/pins.test.mjs, t41.test.mjs): the JUSTIFICATION_REFUSALS code lists, T41_OPS membership; N364's signerregister/signerrevoke totality (membership has no op map to derive from).
Found in other modules: see REPORT (op-declarations).
Tests/checks: node --test test/m/affordances/: 280 pass, 0 fail. format 0 failures; architecture (affordances) 0 failures; coverage 54 of 54 ids; ownership 21 files, 0 failures; words check (affordances and whole tree) 0 lines naming affordances; setup-words build --check: rows match. Regenerations stale: none made.
Size (session_0184gxzpn1s2EDqr1qacRUZ3): test runs 14, module lines 2699

## J4 · REPORT

REPORT (re B3 · CHANGE K4073). Nothing in affordances' paths can name them. `unaccounted` (R12) is correct: it reports a gated op "unpublished" when it is in none of ACTS, CAPTURE_ACTS, PER_ITEM_ACTS or NON_ACTS, and NON_ACTS (like RUNGS and RUNG_ABSENT) is op-grades' table, read here by reference (R4, K1974); these are reads, so they are no ACTS rows, and adding a copy here would break R4's "no copy" rule. I checked on the merged tranche tip: none of the 14 is in NON_ACTS, RUNGS or RUNG_ABSENT. op-grades R48 covers three (holdsdue, templatebyhandle, rulefields); the other eleven (adminremovalsopen, approvedunsent, bundlehistory, checkpointsdue, clocksrunning, entityidonly, entitysimilar, heldat, projectinvitations, subjectsnamed, versioncompare) need an op-grades requirement and job (each with a "read: …" NON_ACTS reason), after which control-plane's totality goes green with no change here. Affordances' own tests derive their op sets from the owners' maps, so they need no list updated. Job stays COMPLETE; no change made.

## J5 · COMPLETE

COMPLETE (re B4 · CHANGE K4093). Merged tranche/T51; ACT_HELP re-taken at the design now on the tranche (2a64c5ae77): `actionholdrelease` (DEC-359, `act.actionholdrelease.does`) is held; t36.test.mjs :89 and :191 are green. Suite whole: 280 pass, 0 fail; words check 0 failures; coverage 54 of 54; format and architecture unchanged. Consequence for op-declarations: `actionholdrelease` is in its `unexplained` ACT_HELP_ABSENT group and must leave it (R34 partition), as for the six of J1.
Size (session_0184gxzpn1s2EDqr1qacRUZ3): test runs 18, module lines 2700

## J6 · REPORT

REPORT (re B5, FR-40 · K4190), for BOB. Nothing here blocks this job.

The K4190 red is `t36.test.mjs` :321, not a `meetsR48` control: `hasWord("act.selftest.does")` was true. The design's word list gained that key (DEC-376, the updates screen's check, `mock-acts.js`:64), and the test still asserted the word was absent. `selftest` is instance-setup's probe: affordances draws no act for it (not in ACTS, CAPTURE_ACTS, PER_ITEM_ACTS or unaccounted), and `words-reads.json` does not give `act.selftest.does` to this module, so R62 holds it none. ACT_HELP is right; the test's premise was stale. Fixed in my module: the assertion now checks the reads list, and a new control shows that holding the word departs from R48.

Design-side gap, for the design stream (K3944) and your decision: 64 declared ops (`op-declarations` OPS) have an `act.<op>.does` word in words.json that affordances' reads list in words-reads.json does not give, so ACT_HELP does not hold them. They include selftest, export, exportlog, memberpairingset and runtime (declared, with design text in mock-acts.js), and contradiction*, bias*, goal*, aspiration*, lead*, escalation*, reevaluation*, sweeps, triage and others. Their words are newer than the reads list. If the design regenerates words-reads.json, R48's reading would hold them and ACT_HELP would need their texts. The test would then start failing on the new keys, and its `selftest` assertion would have to change again. I have not made that change, since the list is the design's and R62 names it as the source.

## J7 · COMPLETE

COMPLETE (re B5, FR-40 · K4190). Commit d8bbc42cc3 on job/T51/affordances, pushed; merged tranche/T51 first (no conflicts).

Entries applied: K4190 (t36.test.mjs :317). Cause: :321 asserted `hasWord("act.selftest.does")` false; the word exists now (DEC-376), and the module's reads list does not give it (R62). The test now asserts the reads-list fact plus `selftest` not held, and a new control `meetsR48({...ACT_HELP, selftest: word("act.selftest.does")})` is false. The other controls (labelled, updateskip, a stale selftest entry) were run and each returns false. ACT_HELP is unchanged; the header of act-help.mjs notes selftest.

Deferred: none. Found in other modules: see REPORT (the 64-op reads-list gap; design stream).

Tests and checks:
- node --test test/m/affordances/*.test.mjs: 280 pass, 0 fail (t36: 0 fail).
- checks/format.mjs /home/user/bio: format: 175 modules, 175 requirements files; 0 failures
- checks/architecture.mjs (affordances): architecture: 33 product files, 379 relative imports; 0 failures
- checks/coverage.mjs (affordances): coverage: 1 modules, 54 of 54 live requirement ids named by a test; 0 failures
- checks/words.mjs (affordances): words: 1 modules, 6732 string literals read; 0 failures
- setup-words/build.mjs --check: rows.mjs and words-unreviewed.json match words.json and the source
- checks/ownership.mjs affordances tranche/T51 job/T51/affordances: 3 files changed by affordances; 0 failures
- checks/run.mjs /home/user/bio: format and architecture 0 failures, words 0 failures; coverage has 7 failures, all in other modules (agent-harness R17, agent-runner R36–R40, citation R16–R18, installer-steps R26 R31, journey-check R19, link-sweep R13–R15, monitoring R75–R77); none in affordances.

Size (session_015oCsKY91WYHFpiM6Ej1HTG): test runs 5, module lines 2702

## J8 · COMPLETE · re B8

COMPLETE (re B8 · CHANGE K4225). Merged tranche/T51 first (no conflicts); pushed on job/T51/affordances.

Entries applied: the two red tests, "R1 R12 R19 R24: case-inputs' ops" and "R1 R4 R12 R19 R24: case-import's ops" (catalogue.test.mjs), no longer hand-list another module's ops (K3268). Cause: the new ops (case-inputs `casedetailsset`, `casedetails`, `casedetailspublic`; case-import `importregrade`, `rerunstart`, `rerunpair`, `rerunread`) have no hand row, so `affordances` grades them only once op-grades has registered the owners' `DECLARED_OPS` (R49).
- New test support `test/m/affordances/register-owners.mjs`, imported first in catalogue.test.mjs, registers the two owners' `DECLARED_OPS` with op-grades before any table is read (as op-declarations' own register-owners does); the rows are read from the owners.
- Both tests now take the op set from the owner's ops map and its `DECLARED_OPS`. case-inputs: a declared op the map lacks must be a read (`casedetailspublic`, served by public-read's door); a map op the owner does not declare must have a hand grade. case-import: acts are told by being published, not by name; every declared non-act op must be in the map; the refusal codes are read from the declared `refusal` fields, each a row of case-import's checks and in the justification family, and no other code of its checks is. Kept: the checks' families, a rung or stated absence for every write (now also equal to the declared `weight`), no op an act, the totality with the control plane's rows, and the controls (stale when ungated or carried by no row, an unnamed op unpublished and unranked).
- Limit, stated: for an op the owner does not declare (`whatchangeddrafts`, `caseimportdocument`, `importedcase(s)`, `importflagclear`), mutating is read from the hand tables (RUNGS/RUNG_ABSENT), so the totality check over those is not independent of the tables; the declared ops' check is (grade against declared weight). `casechecker` and `casefilespec` (case-checker's, not in my uses) stay named as before.
- No requirement's meaning changed; no requirement line written (K4210). Found in other modules: none. Deferred: none.

Tests and checks:
- node --test bio-plane/test/m/affordances/*.test.mjs: 280 pass, 0 fail
- checks/format.mjs: 175 modules, 175 requirements files; 0 failures
- checks/architecture.mjs affordances: 34 product files, 383 relative imports; 0 failures
- checks/coverage.mjs affordances: 54 of 54 live requirement ids named by a test; 0 failures
- checks/words.mjs affordances: 6719 string literals read; 0 failures (testcopy 0, handlist 0)
- checks/ownership.mjs affordances tranche/T51: 3 files changed by affordances; 0 failures

Size (session_01VxbGzLyFxoWVwut9wPwFpo): test runs 7, module lines 2702

## J9 · REPORT · re B9

REPORT (re B9, K4247). For BOB; none blocks this job.

1. t48.test.mjs:181 (R12 R39) is fixed in my module (commit 8e65393d3f). Cause: the test hand-listed `groupdescriptiondraft` and `securitymap` as caller-owned absences. `securitymap` is a read now (op-grades R39 as amended, K4210), so `RUNG_ABSENT.securitymap` is undefined and the test threw. The test now reads every `caller-owned` absence from op-grades' `RUNG_ABSENT` (K3268). `groupdescriptiondraft` is read the same way and leaves the set when OP-GRADES #20 merges, with no edit here. The test's controls are unchanged. t48 is 6 of 6 green.

2. Other affordances reds on the tranche tip: 32 tests, none in my code. Every one fails at Workers runtime start (`MiniflareCoreError ERR_RUNTIME_FAILURE`, `plane.test.mjs:176` and the other suites that start the plane runtime). The cause, from the runtime's stderr: `DECLARED_OP_BAD_WEIGHT: sweeps rung-on-read`, raised at `bio-plane/src/op-grades/declared.mjs:45` while `bio-plane/src/plane/declarations.mjs:182` registers the owners' declared ops. The two owners disagree on `sweeps`. op-declarations (`src/op-declarations/index.mjs:1375`) declares it a read (`mutating: false`), while op-grades `src/op-grades/marks.mjs:214` gives it the rung `Reversible`. The registry refuses a rung on a read, so the plane runtime cannot start. Owners: op-grades (marks.mjs) and op-declarations. Affordances' own code is not involved. Until that is fixed, these 32 stay red; the 249 non-runtime affordances tests pass.

3. Whole-tree checks, read-only: coverage has 4 failures in agent-harness, agent-runner, installer-steps and journey-check, none in affordances. Words has 31 failures in strength, screens-intake and op-grades, none in affordances (no line names affordances). setup-words `--check` reports rows.mjs stale at word 20774 (entities), the expected stale-rows note, not a refusal of mine.

Checks for affordances: format 0 failures (whole tree 175 modules); architecture 0 failures (34 product files, 383 relative imports); coverage 54 of 54 live ids named; ownership 1 file changed by affordances, 0 failures.
