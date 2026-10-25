# affordances (T51)

**Status** · session_015sXYDym4apQ4UugkRYpfcT · depth 2 · COMPLETE · handled B24

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

## J14 · COMPLETE · re B11

COMPLETE (re B11, K4250). Commit b42e5414d9 on job/T51/affordances, pushed; tranche/T51 merged first (no conflicts).

Entries applied: (1) noted, no change needed (my J9 reading was wrong; the start-up refusal was link-sweep's `sweeps` row, now fixed). (2) R2/R41: no change in `unaccounted`. The twenty ops are accounted once the owners' declarations register, and they do not register while `groupkeynoticeseen`'s description disagrees between op-declarations and op-grades (REPORT J13). My R2/R41 tests pass. The t34 test follows groupdescriptiondraft's read status (K4247).

Deferred: none. Found in other modules: the registration refusal above (op-declarations and op-grades); control-plane's totality test runs without its owners' registration.

Tests and checks:
- node --test test/m/affordances/t34.test.mjs: 9 pass, 0 fail
- node --test test/m/affordances/*.test.mjs: 281 tests, 249 pass, 32 fail (all the plane-runtime registration refusal)
- checks/architecture.mjs affordances: 34 product files, 384 relative imports; 0 failures
- checks/words.mjs affordances: 6791 string literals read; 0 failures
- checks/ownership.mjs affordances tranche/T51 job/T51/affordances: 5 files changed by affordances; 0 failures

Size (session_018BZD69KvUNUDfmGiun3BEb): test runs 7, module lines 2775

## J15 · REPORT

REPORT (re B12 · CHANGE K4258), for BOB. Applied in this job; one change is op-declarations' (not mine), named below.

Applied (affordances, commit 47a6215e96):
- `strengthbarset` is held under its own text, `act.strengthbarset.does` (read through `word`, R62), and is added to `T51_DESIGN_OPS` (K4248). The reads list gives that key; `strengthbarset` is the op strength declares and screens-settings sends (`screens-settings/group.mjs`).
- `strengthbar` is held none. The design's reads list gives no `act.strengthbar.does`; the only text it had was `strengthbarset`'s, held under `strengthbar` by the `KEY_EXCEPTIONS` alias line, which is removed. No screen sends the op `strengthbar`: the screens send `strengthbarset` (screens-settings) and `projectbarset` (screens-inquiry, which asserts it never sends `strengthbarset`). So I kept `strengthbar` nowhere; no test of mine shows a screen sending it.
- Requirement lines: none names the key `strengthbar` (checked in build/requirements/affordances.md), so no requirement line changed.
- Test: `B12 (T51, K4258; R48, R62)` in t36.test.mjs, seen failing first; controls: `strengthbar` holding strengthbarset's text departs from R48, and so does the table without `strengthbarset`.
- The R48 test `R48 R53 R54 R56 R57 R61 R62` (red at the tip, J18) is green again.

Consequence for op-declarations (its ACT_HELP_ABSENT; NOT changed by this job, it is op-declarations' table): with this merge, four of its tests go red until its ACT_HELP_ABSENT changes (run: `node --test test/m/op-declarations/*.test.mjs`, 246 tests, 4 fail, all four are this):
1. R34 (K4254, affordances R48, T51_DESIGN_OPS): `strengthbarset` is explained by affordances and so must leave the unexplained group (the one near op-declarations index.mjs:2726).
2. R75 (T50): "an op both explained and named": `strengthbarset`, the same change.
3. R34 partition (SESSION_OPS.member): `strengthbar` is neither explained nor named, so it needs a ground in ACT_HELP_ABSENT (the design gives it no text; "no design text" is the ground the other undesigned ops use).
4. R47, R34 (N862): `strengthbar`, the same as 3.
Its other tests pass. Those four are the consequence BOB foresaw in J18; I have not edited op-declarations.

Other reds on the tranche, not this module (already at the tip before this job, not caused by it): the affordances suite shows 32 failing tests (33 at the start of this job; the R48 test now passes). The failures are the module-load `DECLARED_OP_DISAGREES: groupdescriptiondraft description` from op-grades/declared.mjs (words-unreviewed.json is stale: `setup-words/build.mjs --check` says so), and the miniflare/workerd startup failures in plane.test.mjs and its neighbours. None names affordances' ACT_HELP.
`node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage's six failures name agent-harness, agent-runner, installer-steps, journey-check, screens-inquiry, screens-intake, none affordances; words: one testcopy failure in op-grades (t37.test.mjs:32), none affordances.

## J16 · COMPLETE

COMPLETE (re B12 · CHANGE K4258), affordances, commit 47a6215e96 on job/T51/affordances (merged tranche/T51 first, ddce873865).

Entries applied: B12 · `strengthbarset` held under `act.strengthbarset.does` (added to `T51_DESIGN_OPS`); `strengthbar` held none, its key and its alias line removed. Test first, seen failing, then green (`B12 (T51, K4258; R48, R62)`, t36.test.mjs), controls seen: a text under `strengthbar` and a table without `strengthbarset` each depart from R48.
Requirement lines: none names `strengthbar`, so none changed.
Deferred: none in this module.
Found in another module: op-declarations' ACT_HELP_ABSENT (REPORT J15): four of its tests go red until it moves `strengthbarset` out and grounds `strengthbar`; not edited here.

Tests and checks:
- `node --test test/m/affordances/*.test.mjs`: 282 tests, 250 pass, 32 fail. At the start of this job 33 failed; the R48 `ACT_HELP` test is now green. The 32 are the same as before (the groupdescriptiondraft DECLARED_OP_DISAGREES at load, and the workerd startup failures), none about affordances' table.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage has no affordances failure; words has no affordances finding (its one failure is op-grades' t37.test.mjs:32).
- `node bio-plane/src/setup-words/build.mjs --check`: words-unreviewed.json stale (the expected note); no refusal naming affordances.
- `node checks/ownership.mjs /home/user/bio affordances tranche/T51 job/T51/affordances`: 3 files (act-help.mjs, t36.test.mjs, this record), 0 failures.

Size (session_01Wou66QFMgiLpLmx2dvGc3B): test runs 6, module lines 2777

## J17 · BLOCKED

Cause 1 (every op this round adds is accounted for) is not met from this module's paths, and I have not changed code to fake it. I made no edit in this round; the branch carries only the merge of `origin/tranche/T51` (dcba1b0ad7).

**Measured on the tranche tip:** `node --test bio-plane/test/m/affordances/*.test.mjs`: 274 tests, 273 pass, 1 fail: `t33.test.mjs:189` (R12, R24). The 32 plane-runtime reds of J9 are gone on this tip. A direct call of `unaccounted` with the five ops (`moneysets` read, `remindersfor` read, `scanmirror`, `officeconfirm`, `captureseenin` mutating) answers: unpublished `captureseenin, moneysets, officeconfirm, remindersfor, scanmirror`; unranked `captureseenin, officeconfirm, scanmirror`. The test's failing assertion is the first (`moneysets`).

**Why this is not affordances' to publish:**
- `moneysets` (money R28) and `remindersfor` (action-clocks R26) are reads. A read is accounted for only by a `NON_ACTS` row, which `op-grades` owns (R4, K1974). No row in `op-grades` names either op. The pattern is `op-grades` R48 (`holdsdue` and two others).
- `scanmirror` (file-safety R49, an administrator act), `officeconfirm` (entities R64) and `captureseenin` (capture R101) are mutating. Each needs a rung or a stated absence in `op-grades` (unranked), and publication: a `NON_ACTS` row, or an `ACTS` / `CAPTURE_ACTS` row here. An act row here needs a requirement line naming its facts and predicate, which BOB writes. Entities R64 and capture R101 are not yet met, so their ops are not on the tranche table.
- Naming the ops in a list here would be the hand-list K3268 forbids and the copy R4 forbids. I wrote no new test: the only honest one would fail on the owners' rows.

**Requested of BOB (owners, not this job):**
1. `op-grades`: `NON_ACTS` rows with a "read: …" reason for `moneysets` and `remindersfor`.
2. `op-grades`: a `NON_ACTS` row (or rung and absence, as BOB rules) for `scanmirror` now. For `officeconfirm` and `captureseenin`, the same when their jobs merge. Whether `captureseenin` is a `CAPTURE_ACTS` row instead is BOB's call, with a requirement line for it.
3. Once those land on the tranche, `t33.test.mjs:189` should go green with no change here. Send a CHANGE and I will add a control for the five (the existing "one left out is seen" control already holds).

**Entries not applied:** cause 1 (blocked, owners' rows). **Checks:** not re-run; no affordances file changed this round, so format, architecture, coverage, words and ownership stand as at J16.

## J18 · QUESTION

QUESTION (re B14, K4376). Nine ops have no sentence in the word list, so I hold each under its own key with a plain `localize` default (stand-ins, R62): `act.origins.does`, `act.inboxlist.does`, `act.transcriptions.does`, `act.progressions.does`, `act.remindersfor.does`, `act.moneysets.does`, `act.scanmirror.does`, `act.officeconfirm.does`, `act.captureseenin.does`. The defaults are in `bio-plane/src/affordances/act-help.mjs` (`T51_STANDIN_HELP`); the design's rows should replace them. Test t36 names them and asserts `hasWord` is false for each, so the test fails when a row lands and that test is then updated.

One reads-list gap, for the design's decision: `act.contradictionflag.does` is in `words.json` but not in `words-reads.json` for this module. I hold it under the word-list key (`T51_LIST_ONLY_OPS`). If the design means it not to be held, I drop it and its test line.

## J19 · COMPLETE

COMPLETE (re B14, K4376). Commit a3afb574d4 on job/T51/affordances, pushed; merged origin/job/T51/affordances first (no conflicts).

Entries applied: B14's list. All 28 names (the message says 22 + 3; the list has 25 + 3) are held in `ACT_HELP`: 18 under their owed texts (`T51_OWED_OPS`, read from `act.owed_<op>.does`, which the reads list gives), `contradictionflag` (`T51_LIST_ONLY_OPS`, see the QUESTION), and nine stand-ins (`T51_STANDIN_HELP`, `localize` defaults, see the QUESTION). t36 gained one test naming the set and its controls; the existing t36 expectations name the stand-ins and the list-only key. No requirement line changes.

Not met, from B13 (J17, still open): the t33 R12 red for `moneysets`, `remindersfor`, `scanmirror`, `officeconfirm` and `captureseenin` is op-grades' rows (NON_ACTS and RUNGS/RUNG_ABSENT), as J17 said. The stand-ins here do not change that: `unaccounted` reads those rows, not `ACT_HELP`.

Deferred: none in my module. Found in other modules: the op-grades rows of J17 (owner: op-grades, via BOB).

Tests and checks:
- node --test bio-plane/test/m/affordances/*.test.mjs: 282 tests, 280 pass, 2 fail. The two: t33.test.mjs:189 (R12 R24, J17) and t36's R48 R53 R54 R56 R57 R61 R62 test, fixed by the count (452 = 442 + 10) before the final run; the final run of t36 alone is 14 of 14 green. (The run before the last t36 fix showed 2 fails: the t33 line and that count, so the full suite after the fix is 281 pass, 1 fail: t33.)
- checks/format.mjs: 175 modules; 0 failures
- checks/architecture.mjs affordances: 34 product files, 385 relative imports; 0 failures
- checks/coverage.mjs affordances: 54 of 54 live ids named; 0 failures
- checks/words.mjs affordances: 6835 literals read, 18163 words; 0 failures (missingkey 0, testcopy 0; the nine stand-ins are `localize` calls, so the words check reads them as dev, 1)
- checks/ownership.mjs affordances tranche/T51 job/T51/affordances: 0 failures
- setup-words build --check: expected to report stale rows for the new `localize` ids (the nine `act.<op>.does` stand-ins), as J6/J9 did; I did not regenerate it (a generated artifact, manifest §14).

Size (session_018BsD9g3GXwi6e8g4cAa1QE): test runs 8, module lines 2775

## J20 · QUESTION

QUESTION (re B16 cause 2, K4437; no change made to modules.json).

Cause 2 asked for affordances' own test to read every owner's declared member op (from the owners' declarations, K3268) and to fail by name for any with no entry. I built it and it was seen red (naming capturecredentiallist and readheld, before the fix), then `checks/architecture.mjs` refused it: the test imported test-support's `declaredOpsOf` and `op-declarations`, and affordances does not declare test-support in `uses`, and op-declarations is not earlier in the order. I removed the file (commit after d2678dd585). Reading every owner's rows without importing a later module is not possible from this module as `uses` stands.

My reading: the only module that holds both the member set and the explanations is op-declarations, which is later in the order. Its own R34 test (`bio-plane/test/m/op-declarations/t36.test.mjs`) already fails by name for any member op with neither a text nor a ground, and it found these two.

Options, my recommendation first:
1. Recommended: accept op-declarations' R34 as the net. Rule for the plan: a round that adds a member op runs op-declarations' t36 in the owner's own round, and the explanation job takes its name from that failure. No change to modules or order.
2. Add test-support to affordances' test `uses` in build/modules.json. This still does not give the member set (op-declarations is later), so it does not close the gap alone.
3. Move op-declarations before affordances in the order. Largest change; it changes layer boundaries, so it is yours.

Which do you choose? I will write cause 2 to your answer and COMPLETE after it.

Cause 1 is met and committed (d2678dd585): capturecredentiallist is held under act.owed_capturecredentiallist.does (the reads list gives it); readheld is a stand-in, key act.readheld.does (text in act-help.mjs), for your word batch.

## J21 · COMPLETE

COMPLETE (re B16 and B18, K4437, K4464; fix round 4). Merged tranche/T51 at 003bae9390 (op-grades). Pushed.

Cause 1 (met): `capturecredentiallist` is held under its owed act, `act.owed_capturecredentiallist.does` (the reads list gives it; T51_OWED_OPS). `readheld` is a stand-in with key `act.readheld.does` (T51_STANDIN_HELP), for BOB's word batch. Red-then-green: before the change, op-declarations' R34 named both ops as neither explained nor grounded; after, its t36 passes 14 of 14.

Cause 2 (per B18, option 1): no own test. Affordances' test could not read the owners' declared member set: test-support and op-declarations are not in affordances' uses, and op-declarations is later in the order (architecture check refused the test; I removed it in commit 2be49424c2). op-declarations' R34 test is the net that names any member op with no text and no ground. No change to modules.json or the order.

B17 (met): origins, inboxlist, transcriptions, progressions, remindersfor, moneysets, captureseenin, scanmirror, officeconfirm read their act.<op>.does rows (DEC-412), held as list-only ops with contradictionflag. The design's words-reads.json does not yet give affordances these keys; the reads list needs regenerating.

Checks: format 0 failures; architecture (affordances) 0; words (affordances) 0; coverage 54 of 54; ownership 2 files, 0 failures. Suites: affordances 268 pass, 0 fail; op-declarations t36 14 pass, 0 fail.

Reported to BOB: nothing further in other modules beyond the words-reads gap above. Earlier reds (op-grades words, coverage in other modules, case-authoring reload architecture) are not in this module.

Size (session_01Di1UCztSNBX62o6BkJqmb3): test runs 9, module lines 2806

## J22 · COMPLETE

COMPLETE (E14 · T51 fix round 5, affordances #43). Commits 3e229c1c8a and the one after it on job/T51/affordances.

Cause (proven): `events` registers as a connection owner in `events.start()` (events/index.mjs:229-233), which runs in the Durable Object; the Worker isolate that composes the door's answer never starts it, so `composedVocabularies()` (affordances/words.mjs, the `composed.has("events")` gate) left out the five events vocabularies. Lines, money and people register at load, so theirs appeared. Nothing in `events` is at fault; no QUESTION needed.

Changed: affordances/facts.mjs `profileVocabularies` (store route `affordancevocab`) now also answers `events_vocabularies`, the five as the Durable Object composes them (the owner's registered words); affordances.mjs `vocabulariesFor` fills in, from a well-formed store answer, only the five keys the local isolate lacks; words.mjs exports `EVENTS_VOCABULARY_KEYS`. Both door arms use `vocabulariesFor`. New data only: nothing stored.

Why missed: the Miniflare plane runs Worker and Durable Object in one isolate, so events is always started there (the same test through the Miniflare door was green); no test composed the door's answer in an isolate without events. Test gap fix: bio-plane/test/m/affordances/door-events.test.mjs composes `affordancesOp` in a Node process where events is imported and never started (asserted), over the real store (Durable Object in Miniflare).

Failing-first: before the fix "AssertionError: event_kinds is in the door's answer" (red); after, 4 pass 0 fail. The Timeline screen over that answer: it reads exactly `vocabularies.event_kinds`, now present; a screen test is screens-investigate's (not my paths); I propose none further.

Measurements: store answer carries 5 small vocabularies (no platform limit touched); no deploy.

Suites: affordances 273 pass 0 fail; users: queue 210/0, screens-investigate 236/0 (impact lists 20 modules, I ran these two as the readers of the vocabularies; the others are untouched readers of the same unchanged keys). Checks: format 0 failures; architecture (affordances) 0; coverage 0 failures; words 0 (count unchanged); ownership 5 files, 0 failures.

Requirement lines proposed (BOB writes): R39: "A vocabulary whose owner registers only in the Durable Object (events) is composed there and carried to the door by the store's `affordancevocab` answer (`events_vocabularies`), so the door's answer holds it whichever isolate composes it. Test: the door's answer, composed where events has not started, holds the five."

Size (session_017j6mNDmHH2Noig5Jps6KXP): test runs 8, module lines 2828

## J8 · COMPLETE

COMPLETE (G49, re B20 · START, fix round 6). Merged tranche/T51 first (no conflicts).

What changed (`bio-plane/src/affordances/act-help.mjs`): `capturerequests` and `casedrafts` added to `T51_DESIGN_OPS` in the reads list's order, each read by `word("act.<op>.does")`; `readheld` moved from `T51_STANDIN_*` to `T51_DESIGN_OPS` (carried once in `ACT_HELP_OPS` and `HELD`); `T51_STANDIN_HELP` / `T51_STANDIN_OPS` kept exported as empty frozen `{}` / `[]`; the unused `localize` import dropped; header and docblocks updated. The reads list now also gives all ten `T51_LIST_ONLY_OPS` ops (contradictionflag, origins, inboxlist, transcriptions, progressions, remindersfor, moneysets, captureseenin, scanmirror, officeconfirm): t36's arithmetic (456 held keys vs 466 expected) was red until they were held as design ops, so they moved into `T51_DESIGN_OPS` (same keys, same texts) and `T51_LIST_ONLY_OPS` is an empty frozen `[]`. `T51_DESIGN_OPS` is in the reads list's order (81 ops).

Failing-first: t36 "R48 R53 … ACT_HELP", "R62 R65 keys" and "B12 strengthbarset" were red on the tranche (seen at the START; after the first edit the arithmetic test was still red, 456 vs 466, until the ten moved); all green now. Control: ACT_HELP dumped before and after: no key's text changed, two keys added (capturerequests, casedrafts), none removed.

Tests/checks: bio-plane `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/affordances/`: 280 pass, 0 fail. Users (impact set): op-declarations 245/0, control-plane 447/0, store-door 56/0, tasks 128/0, admission 58/0, queue 210/0, interface-shell 348/0 (fail count 0 each). checks/run.mjs: format, architecture, coverage (6686 of 6686), channels, words all 0 failures. ownership affordances tranche/T51 job/T51/affordances: 2 files changed by affordances; 0 failures.

Proposed R48 line: no change (its text holds: exactly the ops the reads list explains). Deferred: none. Found in other modules: none.

Size (session_015vmccEdn9WywiaxqonRTPj): test runs 8, module lines 2721

## J23 · COMPLETE

COMPLETE (G49, B20). act-help.mjs holds capturerequests, casedrafts and readheld as design ops, plus the ten list-only ops the reads list now gives (t36 arithmetic); no existing text changed. Affordances 280/0; users op-declarations, control-plane, store-door, tasks, admission, queue, interface-shell 0 fail; checks/run.mjs and ownership 0 failures. See record J8.

## J24 · COMPLETE

COMPLETE (job 53, K4900, re B21 · START). Merged tranche/T51 first (no conflicts).

Decision (R48): the four ops are explained in `ACT_HELP`, not named in `ACT_HELP_ABSENT`. `ACT_HELP_ABSENT` is op-declarations' file, not mine; its `nocontrol` ground would also fit ("a step another act takes, which no control offers"), but taking it needs a CHANGE to op-declarations. Holding them here turns both tests green inside my module and costs one sentence each. If BOB prefers the ground, say so and I drop them (T51_STANDIN_HELP is then empty again).

Change (`bio-plane/src/affordances/act-help.mjs`): `captureuploadbegin`, `captureuploadpart`, `captureuploadcomplete`, `captureuploadabort` held in `T51_STANDIN_HELP` / `T51_STANDIN_OPS` as stand-ins keyed `act.<op>.does` through `localize` (R-WORDS; capture R113 read for what each does). Header and docblock updated.

Rows owed to the design stream (the stand-in yields to the design row when it lands, as `readheld` did): `act.captureuploadbegin.does`, `act.captureuploadpart.does`, `act.captureuploadcomplete.does`, `act.captureuploadabort.does`.

Failing-first: op-declarations on the tranche, 246 pass 2 fail: "R34 (affordances R48): every op in SESSION_OPS.member has an explanation in affordances' ACT_HELP under its own name or is named in ACT_HELP_ABSENT, and no op is both" and "R47, R34 (N862; T43 ...)" (red); after the change 248 pass 0 fail (green). New test in t36.test.mjs, "R48 R62 (T51, K4900; capture R113): the four steps of a file sent in parts ...", with controls (a table without any one of the four, or giving two one sentence, is seen by meetsR48); green.

Tests: affordances 277 pass 0 fail (incl. the new one); op-declarations 248/0; control-plane affordances-pack 4/0 (the only other test reading ACT_HELP). impact.mjs names 20 modules because act-help is widely imported; the change only adds four entries, no existing key or text moves.
Checks (civicos-process): format 0 failures; architecture (affordances) 0; coverage 54 of 54, 0 failures; words 0 failures (dev 1, unchanged); ownership affordances tranche/T51 job/T51/affordances 0 failures.

Requirement lines: none changed (R48/R62 hold as written). Deferred: none. Found in other modules: none. Files created outside my paths: none. Generated artifacts made stale: none (setup-words rows.mjs is regenerated by BOB; the four localize ids are new to it).

Size (session_016DkYJHkWSBa6JwFbQqXe5S): test runs 6, module lines 1127

## Job 80 (re B22 · START, K4968)

Merged tranche/T51 (no conflicts). Cause: job 57 held the four parted-upload ops in a stand-in table; DEC-431 then gave their `act.captureupload{begin,part,complete,abort}.does` rows, so the reads list counted them and t36's arithmetic counted them twice (460 vs 464). Why missed: the reads list could not count them until their rows existed. Platform check: N.

Change (`bio-plane/src/affordances/act-help.mjs`): the four ops moved to `T51_DESIGN_OPS`, read by key as `word(key)`; `T51_STANDIN_HELP` is an empty frozen value (kept for imports); unused `localize` import removed. No sentence added; `captureuploadbegin` now answers the design row (no "to the group's store", DEC-281). Test: the "four steps" test in t36.test.mjs now checks the design rows (reads-list key, `word(key)`, controls kept).

Red first: t36 "R48 R53 R54 R56 R57 R61 R62" (actual 460, expected 464) on the tranche tip; green after.

Tests: affordances 287 pass, 0 fail. Users: op-declarations 248/0, control-plane affordances-pack 4/0, store-door 57/0, admission 73/0. tasks (1 fail: R25 K4488 three-part capture) and queue (1 fail: R55 queue.kind.<kind>) fail identically with my change reverted: inherited, not mine. interface-shell and the rest of control-plane not completed (control-plane's full run hangs at t51-round8-seam); the only tests outside affordances and op-declarations that read ACT_HELP are control-plane's affordances-pack.
Checks: architecture, channels, words 0 failures; ownership 0 failures. Not mine: format 1 failure (build/rulings.md:4959, K4964); coverage fails for control-plane R131-R135, runtime-limits R36, screens-inquiry R130-R132.
Deferred: none. Found in other modules: the tasks and queue reds above.

Size (session_01F6cD98xuTLXGhudyFtHWu4): test runs 7, module lines 2726

## J25 · COMPLETE

COMPLETE (job 80, re B22 · K4968). The four parted-upload ops moved to T51_DESIGN_OPS and read by their DEC-431 rows; t36 R48 green; affordances 287/0; op-declarations 248/0, affordances-pack 4/0, store-door 57/0, admission 73/0; architecture, channels, words, ownership 0 failures. Inherited reds, identical without my change: tasks R25 (K4488), queue R55. Not run to the end: control-plane whole (hangs at t51-round8-seam), interface-shell. See record, job 80.

## J26 · REPORT

## Fix round 10, item 73 (2): `t33.test.mjs:189` (R12 R24) red on the tranche

**Cause.** The catalogue is right to refuse; the grade is missing. `ruleservicesstate` is an answers read (K5138; declared in `src/answers/ops.mjs:47`, served at `:24`). The R12 totality counts every gated read that is neither published nor named in op-grades' `NON_ACTS`; this read is named in neither, so `unaccounted` reports it as `unpublished`. `ruleanswer` passes only because op-declarations' `OP_ALIASES` (`src/op-declarations/index.mjs:99`) files it under `rule`, which op-grades grades in `T33_NON_ACTS` (`src/op-grades/t33.mjs`, answers block, around line 316). Nothing in that table grades `ruleservicesstate`. The catalogue does learn the owner-declared read (the test's table takes answers' op map), so no kind of declaration is missing from affordances: the row is missing from op-grades.

**Why missed.** The read was added by K5138 with its handler and its declaration, but not its grade row in op-grades' table. The totality is checked only by affordances' `t33` (R12 R24), which runs on the merged tranche and not on answers' own tests.

**Red first.** `t33.test.mjs:189` on the tranche as merged (K5153): `unpublished: ["ruleservicesstate"]`, `unranked: []`. Still red after my checks: the affordances suite is 287 tests, 286 pass, 1 fail, and the one fail is this test. No change made by me.

**Platform check.** N.

**Change needed (outside my paths; op-grades, for BOB to route).** In `src/op-grades/t33.mjs`, answers block of `T33_NON_ACTS`, add one row beside `rule` and `asktallies`:
`ruleservicesstate: R("whether the rule services are switched on, so a screen draws their control only while on"),`
By reading, that row removes the `unpublished` entry: the read is then named in `NON_ACTS` and no longer counted by the R12 totality. I have not run it, since the file is outside my paths. Please check also `src/op-declarations/index.mjs:318` (the class table lists `rule: "read"` and `asktallies`/`standing`/`standinganswers` as `ownread`, and has no `ruleservicesstate`); if the door needs its class there too, that is the same change. Once it lands I re-run the suite and COMPLETE.

**Checks** (ABSOLUTE root `/home/user/bio`): format 0 failures; architecture 0; coverage 54 of 54, 0 failures; words 0 failures (dev 1, unchanged); ownership 0 failures. Fixtures: 4 failures (`door.test.mjs:154` and `:234` code; `answer-envelope/door-helpers.test.mjs:16` contract fixtures-run `affordances door-helpers`). I added no marker and changed no file, so none is new; `--list` shows the tranche's state.

**Deferred:** none. **Found in other modules:** the op-grades row above (and the op-declarations class line to check).

## J27 · BLOCKED

BLOCKED (cause: needs Bob). The one red left in my suite, `t33.test.mjs:189` (R12 R24), is caused by a grade row missing in op-grades (J26), outside my paths. I changed nothing in my paths: affordances tests 286 pass, 1 fail (287 total); my checks are at 0 failures. The "module tests green" line of the Done list is not met until that row lands.

NEEDS BOB: one row in `src/op-grades/t33.mjs`, answers block of `T33_NON_ACTS`: `ruleservicesstate: R("whether the rule services are switched on, so a screen draws their control only while on")`, and check the class line in `src/op-declarations/index.mjs:318` (J26).

When it lands on the tranche, I merge it, re-run the suite and the checks, then COMPLETE with the four fields.

Size (session_01DY2KdCQs7GqoGoDGHPGsK3): test runs 2, module lines 2845
