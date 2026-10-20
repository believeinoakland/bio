# contradiction (T51)

**Status** · session_01T62aFG5soSvnzwrENfMxyz · depth 2 · WORKING · handled B3

## J1 · COMPLETE

T51-134 applied (K3820, K3803 (3)): the judgement prompt says "team" where it said "group" (four places: a member of the team; our team HOLDS, twice; our team HOLDS). Commit 5a4d9f68f3 on job/T51/contradiction.

Digest: JUDGEMENT_PROMPT_SHA256 moved to aad3ac9e557fba904331c788a946d42e7b5c59b3d13e17972f4b45422716d08c (was 79ea662a…). Re-measured: three blind runs of the job's model family (one subagent each, input read from a file with no gold label, 26 formed pairs), answers recorded in gate-recorded.mjs with the same run ids R1–R3. The gate passes all three (R57): zero false conflicts. Run R1 now proposes 8 conflicts where the old recording proposed 9; the pair-count assertion in gate.test.mjs follows it (9 → 8).

Decisions made here, for BOB to see (K-numbers are yours to assign): (1) RECOMMEND_PROMPT (unpinned, R41) takes the same "group" → "team" in its member line; it is not measured, so no digest moved. (2) The three runs are the job's own model family, not the "second, smaller family" M-162 used for R3, since no other family is reachable from this job; the gate-recorded header says so. (3) No model identifiers written into the repository.

Deferred: nothing.

Found in other modules (not changed): checks/run.mjs coverage reports 24 modules with live ids named by no test (e.g. agent-steps 49 of 49, interface-shell 12). Not contradiction's; reported for BOB's tranche view.

Checks, from the process repository:
- node checks/run.mjs /home/user/bio: format 0 failures; architecture 0 failures; coverage has 24 failing modules, none is contradiction (above); channels 0 failures.
- node checks/ownership.mjs /home/user/bio contradiction tranche/T51 job/T51/contradiction: 0 failures.
Tests: node --test bio-plane/test/m/contradiction/: 120 pass, 0 fail, 8 todo (baseline before the change: 120 pass, 0 fail, 8 todo; after the change the one R13/R15/R16 count assertion failed at 8 ≠ 9, fixed as above).

Reading note: I read contradiction.mjs and requirements/contradiction.md whole, and the gate tests and recording in full where they name R2 and R57. I did not read bio-plane/src/contradiction/index.mjs (3,049 lines) whole: the entry changes only the prompt constants in contradiction.mjs, and index.mjs holds no prompt text (grep: the prompt is imported, not copied). Say if you want it read before COMPLETE is accepted.

Size (session_017ET2SSU7JxkBc5hxVCEU44): test runs 5, module lines 3698 (bio-plane/src/contradiction.mjs and bio-plane/src/contradiction/, all files).

## J2 · COMPLETE

T51-214 applied (B2: the words pass, K3949, K3957, K3958). Commit e85baf96e4 on job/T51/contradiction (tranche/T51 merged in first, bdf353eb61).

What changed
- Every sentence a member reads in `contradiction/index.mjs` and `contradiction/checks.mjs` is read through `word(key[, vars])` where `words.json` holds a row (113 rows the design already wrote: the keys' names and whys, the absence ladder, the notes, every `says`, the notice sentences, the K4/K5/K6 notes, the `row {} of the table {}` reference), else through `localize('contradiction.index.<slug>' | 'contradiction.checks.<slug>', en, vars)` (55 new ids: every refusal `detail`, the judgement's `by`, the acts' session-log line, the VIEWER_MISSING reason). The 41 refusal translations read `word('refusal.<CODE>')`. DISCLOSURE_MALFORMED is a localize id of its own (`contradiction.checks.disclosure_malformed`): `words.json` already holds `refusal.DISCLOSURE_MALFORMED` for another module's different refusal (`setup.mjs`), so reading it would have given a member the wrong sentence. Two modules mint one code: BOB's to settle with the design stream.
- The 52 plain findings: each judged; all but the run-gate pair below are member-read and now keyed.
- K3958: a candidate's undated reason is `{key: 'contradiction.undated_why', vars: {}}` (connection-grammar R6 / civil-time R30); the two red R58 owner tests are green. `neighbours`' hub reason and its `OWNER_HOST_AMBIGUOUS` reason read their rows.
- Tests: no sentence copied; they compare with `word` (owner, pairs R12, k5, k6, projects); the hand-list of 14 ops in measures.test.mjs is gone (it checks the module's own route map: 14 contradiction ops, each a function).
- The list wins, so some English changes where the design's row differs from the old code string (US spelling: recognizes, judgment, labeled; "This key" for "K5"; candidate_pair_over ends "read separately"). Stored candidate rows keep the `why` they were written with.

Not converted, listed for BOB to settle with the design stream (K3944): strings no member reads
1. `contradiction.mjs:31` JUDGEMENT_PROMPT and `:99` RECOMMEND_PROMPT, `:84` the pair line of `renderJudgementInput`: the model's input, pinned by digest (R2, R41, R57); a list row could override the measured text. 
2. `index.mjs:2001` `contradiction {key}: candidate {id}`: the derived-id method string of a connection (hashed into the id; an identifier).
3. `index.mjs:361`, `:364` registerRunGate's `detail`s (a module name and function expected; already registered by X): wiring `ai-runs` meets at load, never a member.
4. `text.mjs:43` the `## Session Log` heading splice: document grammar.
Left as they are, not sentences: the `join` descriptions in CONTRADICTION_KEYS (a developer's description of the join, uppercase so not counted by the check), `side A:` / `side B:` labels, `(no key)`.
After this the words check shows 7 inline findings in my module, exactly 1-4 above.

NEEDS BOB, one line in `build/modules.json`: contradiction's `uses` does not list `setup-words` (every other layer-6 module does). Until it does, checks/architecture.mjs fails 9 times on my files, all the one cause: 2 product files and 6 test files import `setup-words` ("which contradiction does not declare in uses"). Add `"setup-words"` to contradiction's `uses`, then the architecture check is at 0; I changed nothing else for it. (The 9th failure was my test importing op-declarations; removed.)

Stale generated artifacts my change made (manifest §14): `bio-plane/dist/bio-plane.bundled.mjs` and its manifest (the plane's source includes contradiction), and `setup-words/rows.mjs` / `words-unreviewed.json` (55 new localize ids; `build.mjs --check` reports the stale rows, the expected note, no refusal naming my module).

Checks (process repo 4ec1c4c)
- node checks/run.mjs /home/user/bio: format 0 failures; architecture 9 failures, all the uses line above (0 once it is added); coverage: contradiction 59 of 59 ids named, 0 failures (28 failures are other modules'); channels 0; words: contradiction 7 findings, listed above.
- node checks/ownership.mjs /home/user/bio contradiction tranche/T51 job/T51/contradiction: 9 files changed by contradiction, 0 failures.
- node bio-plane/src/setup-words/build.mjs --check: stale rows only.
Tests: node --test bio-plane/test/m/contradiction/: 120 pass, 0 fail, 8 todo (baseline at START: 118 pass, 2 fail, the two R58 owner tests). Users of contradiction run: ai-runs 132, skills 130, reevaluation 145, case-tensions 23, ratification 246, case-disclosures 99, case-authoring 190, conformance 119; all pass, 0 fail.

Reading note: I read the requirements, the words-pass file, contradiction.mjs, checks.mjs, text.mjs, derive.mjs and index.mjs whole (all 3,049 lines), and the tests that held a finding (by their lines).

Size (session_01Sh7KmqBakPppJ1owzmtxQf): test runs 6 (+8 dependents'), module lines 3641 (bio-plane/src/contradiction.mjs and bio-plane/src/contradiction/, all files).

## J3 · COMPLETE

CHANGE B3 handled. Pulled civicos-process d424c32, merged tranche/T51 (no conflict), ran node checks/words.mjs /home/user/bio contradiction: 7 findings, the same seven as J2, none new from the chained-literal rule; no member-read sentence among them. For the design's unkeyed list: contradiction.mjs:31 JUDGEMENT_PROMPT, :99 RECOMMEND_PROMPT, :84 pair line (model input pinned by digest, R2/R41/R57); index.mjs:2001 derived-id method string (hashed identifier); index.mjs:361 and :364 registerRunGate details (module wiring); text.mjs:43 the '## Session Log' heading splice. Other open item unchanged: modules.json contradiction uses needs setup-words (9 architecture failures until added). Tests: node --test bio-plane/test/m/contradiction/: 120 pass, 0 fail, 8 todo. Size (session_01Sh7KmqBakPppJ1owzmtxQf): test runs 7, module lines 3641.

## J4 · REPORT

NEEDS BOB, one line in build/modules.json: contradiction's uses does not list member-roster. index.mjs now imports viewerMember, baseViewer and ROOT_ADMIN from member-roster, as BOB's B4 prescribes; until member-roster is added to contradiction's uses, checks/architecture.mjs shows 1 failure on that import (0 otherwise).
