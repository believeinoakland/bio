# affordances (T51)

**Status** · session_018BZD69KvUNUDfmGiun3BEb · depth 2 · WORKING · handled B10

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

## J10 · COMPLETE · re B9

COMPLETE (re B9, K4247). Commit 8e65393d3f on job/T51/affordances, pushed.

Entries applied: t48.test.mjs:181 (R12 R39). Reads op-grades' caller-owned absences from RUNG_ABSENT, never a hand list; no requirement line changes (none needed). Deferred: none. Other reds: see REPORT J9 (32 plane-runtime reds, cause in op-grades and op-declarations, not this module).

Tests and checks:
- node --test test/m/affordances/t48.test.mjs: 6 pass, 0 fail
- node --test test/m/affordances/*.test.mjs: 281 tests, 249 pass, 32 fail (all 32 ERR_RUNTIME_FAILURE from DECLARED_OP_BAD_WEIGHT sweeps rung-on-read, see REPORT)
- checks/run.mjs /home/user/bio: format 0 failures; architecture 0 failures; words: no finding names affordances (31 in other modules); coverage: 4 failures, none in affordances
- setup-words build.mjs --check: stale-rows note only (expected)
- checks/ownership.mjs affordances tranche/T51 job/T51/affordances: 1 file changed by affordances; 0 failures

Size (session_018BZD69KvUNUDfmGiun3BEb): test runs 9, module lines 2702

## J11 · REPORT · re B10

REPORT (re B10, K4248 · U421). For BOB; two consequences for other modules, neither blocks this job's COMPLETE.

1. op-declarations (its R34 partition, ACT_HELP_ABSENT): this module now holds the 67 declared ops (the list is `T51_DESIGN_OPS` in src/affordances/act-help.mjs, exported) plus `accountdrafts` and `accountpropose`. op-declarations' ACT_HELP_ABSENT still names all 69 (in `read`, `unexplained` or `alias`), so its partition check goes red until it drops them. That check belongs in op-declarations: this module comes earlier in the order, so its tests may not import op-declarations (checks/architecture.mjs flags it), and I removed my copy of the partition test for that reason. Its own test must read affordances' ACT_HELP (K3268).
2. Owed words not held: the design's reads list gives 24 `act.owed_<op>.does` keys for ops no declaration names yet: capturecredentiallist, capturecredentialsupply, capturecredentialwithdraw, casedetails, casedetailspublic, casedetailsset, citeimported, declareorigin, expertisewithdraw, importregrade, installalongside, installremove, installremoveconfirm, installupdate, namedrequests, namedrequestset, projectclose, rerunpair, rerunread, rerunstart, sweepratify, sweepset, taskdecide, withdrawimported. R61 holds an owed text only under a declared op, so these wait. The test's owed list (`OWED_HELD` in t36) names the ones held; when a declaration arrives, its op joins ACT_HELP through a CHANGE to this module. The four `installremove`-family and `installalongside`/`installupdate` keys are the installer's, and no plane op carries them.
3. Test-side limit (stated, K3268): t36 cannot read op-declarations' declared ops (order), so the held-op grading check treats `T51_DESIGN_OPS` as graded by op-grades' registration at the plane's start (R49), and says so in its comment.

Other reds, unchanged from B9: 32 plane-runtime tests fail at Workers start, `DECLARED_OP_BAD_WEIGHT: sweeps rung-on-read` (op-grades marks.mjs:214 vs op-declarations index.mjs:1375). Not affordances' code. Now that `sweeps` is held by this module, it also has a word entry; the runtime red is unchanged.

Checks for affordances: t36 12 of 12 green (was 8 red then in this file); whole suite 281 tests, 249 pass, 32 fail (all the runtime reds above); architecture 0 failures (34 product files, 384 relative imports); coverage 54 of 54; words 0 failures (6790 literals); ownership 0 failures (2 files changed by affordances since tranche/T51); setup-words --check rows match. Whole-tree run.mjs: format 0; architecture 0; coverage 4 (other modules); words 24 testcopy (other modules); nothing names affordances.

## J12 · COMPLETE · re B10

COMPLETE (re B10, K4248 · U421). Commit 223e2de923 on job/T51/affordances, pushed; merged tranche/T51 first (no conflicts).

Entries applied: U421 (K4248): the design's reads list gives this module the `act.<op>.does` words of 67 declared ops; they are held under their own names in ACT_HELP, read by key through word() (R62), in `T51_DESIGN_OPS`. handlechange stays on membership's refusal (R53). The owed_ keys whose op no declaration names are not held (R61; see REPORT J11). Deferred: none. Found in other modules: see REPORT J11 (op-declarations' partition, the owed ops waiting on declarations, and the 32 runtime reds from B9, unchanged).

Requirement lines: none change; the T51 change is ACT_HELP's reads (R62) and the held set.

Tests and checks:
- node --test test/m/affordances/t36.test.mjs: 12 pass, 0 fail
- node --test test/m/affordances/*.test.mjs: 281 tests, 249 pass, 32 fail (all 32 ERR_RUNTIME_FAILURE, DECLARED_OP_BAD_WEIGHT sweeps rung-on-read, as in B9)
- checks/run.mjs /home/user/bio: format 0; architecture 0; coverage 4 failures in other modules; words 24 failures in other modules; none names affordances
- checks/architecture.mjs affordances: 34 product files, 384 relative imports; 0 failures
- checks/coverage.mjs affordances: 54 of 54 live ids named; 0 failures
- checks/words.mjs affordances: 6790 string literals read; 0 failures
- setup-words build.mjs --check: rows match
- checks/ownership.mjs affordances tranche/T51 job/T51/affordances: 2 files changed by affordances; 0 failures

Size (session_018BZD69KvUNUDfmGiun3BEb): test runs 10, module lines 2775

## J13 · REPORT · re B11

REPORT (re B11, K4250). For BOB. Your item (1) corrects my J9: I was wrong that `marks.mjs` caused the `sweeps` refusal. Noted; nothing in my records relies on it.

Item (2), R2 and R41 (`unaccounted`): the failing test is control-plane's `totality.test.mjs` (R2, R41), which calls my `unaccounted` over the door's op table. Its 20 names are unpublished and unranked there because their owners' declarations are not in op-grades' tables in that test process. Registration is what puts them there (op-grades R49). It refuses at the plane's start, so they never arrive:

  `DECLARED_OP_DISAGREES: groupkeynoticeseen description`

I checked it directly: `assembleDeclaredOps()` in src/plane/declarations.mjs throws that refusal on the tranche tip. op-declarations and op-grades disagree on `groupkeynoticeseen`'s description. That is the blocker for all twenty, and it is an owner's row, not `unaccounted`. Owners: op-declarations (its declaration) and op-grades (its row). Once they agree, the registration completes and the twenty are accounted.

I did not change `unaccounted`. It already reads op-grades' tables, the registered declarations included, so a rank or absence for each owner op comes from its owner through the registration. There is no hand list in it. If a rank must come from op-grades rather than the owner, BOB routes that, and I will not add one here. The totality test is control-plane's to register its owners in, as affordances' catalogue test does with register-owners.mjs (K3268).

My own suite: the R2/R41 tests in t41, t31, services, catalogue and backing all pass. The only affordances failures left are the 32 plane-runtime tests, which fail at that same registration refusal.

Change in my module this round: t34 "R1 R12" (commit b42e5414d9). groupdescriptiondraft is a read now (K4247; store-door declares it, op-grades R39 gives it no row), so the test carries it as a gated read. Carried as a write it reads unranked. The test had carried it as a write.

Checks: t34 9 of 9; whole suite 281 tests, 249 pass, 32 fail (all the runtime registration refusal); architecture 0 failures; words 0 failures; ownership 5 files changed by affordances, 0 failures.
