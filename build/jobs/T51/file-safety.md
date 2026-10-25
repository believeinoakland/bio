# file-safety (T51)

**Status** · session_01YBRdy1ssgabFSCE7bRoS1Y · depth 2 · WORKING · handled B21

## Completion (T51-183, words)

**Entries applied.** T51-183 (W): the words check's findings for this module, fixed by the words rule.
- `index.mjs` `#refusalFor`, `WARNING_NOT_CONFIRMED` detail (was :742): `localize("file-safety.index.warned_must_be_exactly", …)`, wording unchanged. The braces are not a placeholder under setup-words' `{name}` rule (`[A-Za-z0-9_]+` only).
- `index.mjs` `securityTools` (was :1075, the plain finding): the act passed to `notAnAdmin` is `localize("file-safety.index.reading_teams_security_tools", …)`. It reaches membership's refusal text, so it is read by key.
- `index.mjs` `scanStatus` (was :974) and `securityToolCatalogue` (was :1059): the same kind of act, read through `localize` ("file-safety.index.reading_scanners_state", "file-safety.index.reading_security_tools_offered"). The checker did not flag them; converted for consistency with the one beside them.

**Test copies (K3962), the nine named in the words-pass.** The checker at civicos-process `4ec1c4c` reads `testcopy 0` for this module, so none is a finding now. The lines (`deeper.test.mjs` :96, :104; `tools.test.mjs` :231, :237, :243, :273, :274, :432, :433) are unchanged. If a later checker run reports any of them, this job reopens them.

**Deferred.** None.

**Found in another module.** The whole-product words check (`checks/run.mjs /home/user/bio`) reports 4,125 failures across other modules, for example `wizard-scripts` test copies (inline 3,060; plain 1,341; testcopy 887; handlist 178). None is in file-safety. Not touched; for BOB's routing.

**Setup-words.** `build.mjs --check` reports `rows.mjs` stale, naming `file-safety.index.reading_scanners_state`, the new id. Expected until BOB regenerates at the layer close. No refusal naming this module.

**Tests and checks run (summary lines).**
- `node checks/words.mjs /home/user/bio file-safety`: before: "inline 2, plain 1, testcopy 0 … 2 failures"; after: "inline 0, plain 0, testcopy 0, missingkey 0, handlist 0 … 0 failures".
- `node --test test/m/file-safety/*.test.mjs` (bio-plane): "tests 64, pass 64, fail 0".
- `node checks/format.mjs /home/user/bio`: "format: 175 modules, 174 requirements files; 0 failures".
- `node checks/architecture.mjs /home/user/bio file-safety`: "architecture: 18 product files, 82 relative imports …; 0 failures".
- `node checks/coverage.mjs /home/user/bio file-safety`: "coverage: 1 modules, 45 of 45 live requirement ids named by a test; 0 failures".
- `node checks/run.mjs /home/user/bio`: its output is dominated by other modules' words failures (above); format and architecture were run separately (0 failures each).
- `node checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: "1 files changed by file-safety …; 0 failures".

**Size (session_01RtxREU1gSDn7LBTiB6kt4R):** test runs 1, module lines 2346

## J1 · COMPLETE

T51-183 (words) done at commit 6e2c16a8e2 with the record at ed716213a4. Three member sentences in index.mjs now read through localize: the WARNING_NOT_CONFIRMED detail (the check's inline finding), the act of securityTools (the plain finding) and, for consistency, the acts of scanStatus and securityToolCatalogue. The nine test copies named in the words-pass read 0 on the current checker, so they are unchanged. Module tests 64/64; format, architecture, coverage, ownership all 0 failures; words check reads 0 for file-safety. Whole-product words check still reports other modules' findings (4,125), not touched. Details and Size line are in build/jobs/T51/file-safety.md. Ready to merge.

## CHANGE B2 (K3985): the test copies

Merged `tranche/T51` (1b44464d70) into the job branch; no rebase. Four test copies at `tools.test.mjs` :273, :274, :432, :433 (the owner's sentences: file-scanner's catalogue rows) changed to neutral fixture strings with the same shape: "the organization's own Acme appliance", "Microsoft (the organization's own Azure bucket)". Reading the owner's row with `word(key)` was tried first and failed the checker (missingkey: those keys are code rows, absent from words.json), so the neutral form is the one that holds.

- `node checks/words.mjs /home/user/bio file-safety`: "inline 0, plain 0, testcopy 0, missingkey 0 … 0 failures".
- `node --test test/m/file-safety/*.test.mjs`: "tests 64, pass 64, fail 0".
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs file-safety`: 0 failures. `checks/coverage.mjs file-safety`: 45 of 45 live ids named, 0 failures.
- `checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: "1 files changed by file-safety …; 0 failures".
- `build.mjs --check`: "rows.mjs and words-unreviewed.json match words.json and the source".

Commit `8db31889dd`. Module lines unchanged (2346).

**Size (session_01RtxREU1gSDn7LBTiB6kt4R), cumulative:** test runs 3, module lines 2346

## J2 · COMPLETE

CHANGE B2 done at commit 8db31889dd (record at the next commit). Merged tranche/T51 at 1b44464d70, then fixed the four test copies in tools.test.mjs (273, 274, 432, 433) with neutral fixture strings of the same shape. Reading the owner's file-scanner rows with word() was tried first and failed the checker (missingkey), so the neutral form holds. Words check reads 0 for file-safety; module tests 64/64; format, architecture, coverage 0 failures; ownership 1 file, 0 failures. Record section appended. Ready for your merge.

## Completion (RW words round, B3, K4015)

RW words round (B3, K4015) done at commit 1ae346f0cb. Merged tranche/T51 (no rebase); the job branch was already at origin.

Entry applied: the one finding `checks/words.mjs /home/user/bio file-safety` listed, `bio-plane/src/file-safety/kinds.mjs`:25, the trojan kind's sentence. It is now `word('file-safety.kind.trojan')`; its row exists in `docs/development/ux-substrate/screens/words.json` with the same text, so the bytes members read do not change. Nothing else changed.

Deferred: none.

Found in another module (not touched; for BOB's routing): the whole-product check `checks/words.mjs` reports 1,629 failures across 175 modules, among them `scheduler` `index.mjs`:636 (plain, "the file-safety owner offers no onFileWork", a sentence that names file-safety; scheduler's job) and `wizard-scripts` `writing-help.test.mjs`:204, :205 (test copies). None is in file-safety.

Not converted, not findings: the `potentially_unwanted` and `test` kind sentences in `kinds.mjs` stay inline (the check counts them unkeyed, 53 unkeyed for this module). Their rows exist in words.json too: `file-safety.kind.potentially_unwanted` reads "showing ads", the inline reads "showing adverts". For BOB: converting them would change what members read, so I left them for BOB to settle.

Tests and checks run (summary lines):
- `node checks/words.mjs /home/user/bio file-safety`: "inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0, dev 0, unkeyed 53; 0 failures" (before: "inline 1 … 1 failure").
- `node --test test/m/file-safety/*.test.mjs` (bio-plane): "tests 64, pass 64, fail 0".
- `checks/format.mjs /home/user/bio`: "format: 176 modules, 175 requirements files; 0 failures".
- `checks/architecture.mjs /home/user/bio file-safety`: "architecture: 18 product files, 82 relative imports …; 0 failures".
- `checks/coverage.mjs /home/user/bio file-safety`: "coverage: 1 modules, 45 of 45 live requirement ids named by a test; 0 failures".
- `checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: "1 files changed by file-safety …; 0 failures".
- `checks/run.mjs /home/user/bio`: "words: 175 modules … 1629 failures" (all in other modules, none in file-safety); format and architecture 0 failures.
- `bio-plane/src/setup-words/build.mjs --check`: "rows.mjs and words-unreviewed.json match words.json and the source" (no refusal naming file-safety).

**Size (session_01FZWRQ2Kz7BQHTbB7ocRjzr):** test runs 1, module lines 2344

## J3 · COMPLETE

RW words round (B3, K4015) done at commit 1ae346f0cb. Merged tranche/T51 (no rebase); the job branch was already at origin.

Entry applied: the one finding `checks/words.mjs /home/user/bio file-safety` listed, `bio-plane/src/file-safety/kinds.mjs`:25, the trojan kind's sentence. It is now `word('file-safety.kind.trojan')`; its row exists in `docs/development/ux-substrate/screens/words.json` with the same text, so the bytes members read do not change. Nothing else changed.

Deferred: none.

Found in another module (not touched; for BOB's routing): the whole-product check `checks/words.mjs` reports 1,629 failures across 175 modules, among them `scheduler` `index.mjs`:636 (plain, "the file-safety owner offers no onFileWork", a sentence that names file-safety; scheduler's job) and `wizard-scripts` `writing-help.test.mjs`:204, :205 (test copies). None is in file-safety.

Not converted, not findings: the `potentially_unwanted` and `test` kind sentences in `kinds.mjs` stay inline (the check counts them unkeyed, 53 unkeyed for this module). Their rows exist in words.json too: `file-safety.kind.potentially_unwanted` reads "showing ads", the inline reads "showing adverts". For BOB: converting them would change what members read, so I left them for BOB to settle.

Tests and checks run (summary lines):
- `node checks/words.mjs /home/user/bio file-safety`: "inline 0, plain 0, testcopy 0, missingkey 0, handlist 0, marker 0, dev 0, unkeyed 53; 0 failures" (before: "inline 1 … 1 failure").
- `node --test test/m/file-safety/*.test.mjs` (bio-plane): "tests 64, pass 64, fail 0".
- `checks/format.mjs /home/user/bio`: "format: 176 modules, 175 requirements files; 0 failures".
- `checks/architecture.mjs /home/user/bio file-safety`: "architecture: 18 product files, 82 relative imports …; 0 failures".
- `checks/coverage.mjs /home/user/bio file-safety`: "coverage: 1 modules, 45 of 45 live requirement ids named by a test; 0 failures".
- `checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: "1 files changed by file-safety …; 0 failures".
- `checks/run.mjs /home/user/bio`: "words: 175 modules … 1629 failures" (all in other modules, none in file-safety); format and architecture 0 failures.
- `bio-plane/src/setup-words/build.mjs --check`: "rows.mjs and words-unreviewed.json match words.json and the source" (no refusal naming file-safety).

## Completion (CHANGE B4, K4036: the kind sentences)

Entries applied: on J3's open question, the two kind sentences still inline in `bio-plane/src/file-safety/kinds.mjs` now read through their words rows, as the trojan kind did: `potentially_unwanted` through `word('file-safety.kind.potentially_unwanted')` (the row's "showing ads" now shows, against the old "adverts"; members read the design's words, as B4 intends) and `test` through `word('file-safety.kind.test')` (its row exists in words.json). The rows test compares each kind's `words` with `of(kind)` by equality and holds no text, so no test changed.

Deferred: none. Found in other modules: unchanged from J3 (scheduler `index.mjs`:636 names file-safety in a plain sentence; wizard-scripts test copies); not touched.

Tests and checks run (summary lines):
- `node checks/words.mjs /home/user/bio file-safety`: "inline 0, plain 0, testcopy 0, missingkey 0 … unkeyed 51; 0 failures".
- `node --test test/m/file-safety/*.test.mjs` (bio-plane): "tests 64, pass 64, fail 0".
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs file-safety`: 0 failures. `checks/coverage.mjs file-safety`: 45 of 45, 0 failures.
- `checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: "2 files changed by file-safety …; 0 failures".
- `checks/run.mjs /home/user/bio`: 1,629 failures, none in file-safety (the one file-safety mention is scheduler's sentence).
- `bio-plane/src/setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match; no refusal naming file-safety.

**Size (session_01FZWRQ2Kz7BQHTbB7ocRjzr), cumulative:** test runs 3, module lines 2342

## J4 · COMPLETE

CHANGE B4 done at commit b7de3d9d1b; record at 69ff9ec4f7. The `potentially_unwanted` and `test` kind sentences in `kinds.mjs` now read through `word(key)` with their words.json rows, as the trojan kind did. The row for `potentially_unwanted` reads "showing ads" (was "adverts"); members read the design's words. No test held the text; the rows test compares by equality. Words check: 0 failures for file-safety (unkeyed 51). Module tests 64/64; format, architecture, coverage, ownership 0 failures; setup-words --check clean. The whole-product run still shows 1,629 failures in other modules, none in file-safety. Details: build/jobs/T51/file-safety.md, Completion (CHANGE B4).

## J5 · BLOCKED

Cause: needs Bob.

CR-21 is applied in part. Pushed `job/T51/file-safety` @ 8f006e8f62 (test files only: `bio-plane/test/m/file-safety/fixture.mjs`, `tools.test.mjs`).

Done:
- The five copied sentences that file-scanner keys are now read from file-scanner's own export: the `cloudflare-intel` account label, the `scanii` and `opswat-deep-cdr` recipients (in the `onOwnServers` checks), and the EICAR "did not answer found" detail (`EICAR_NOT_FOUND`, exported by `file-scanner/src/providers/routes.mjs`).
- Behaviour unchanged: `node --test test/m/file-safety/*.test.mjs` = tests 64, pass 64, fail 0.
- `checks/architecture.mjs` 0 failures; `checks/coverage.mjs` 45 of 45 ids named, 0 failures; `checks/format.mjs` 0 failures; `checks/ownership.mjs` 0 failures.

Not done: `checks/words.mjs /home/user/bio file-safety` reads missingkey 2, not 0:
- `fixture.mjs:127` and `tools.test.mjs:193` read `word("file-scanner.routes.the_eicar_test_file_answered")` (the "EICAR test file answered found" detail for a positive probe).
- That key is not in `docs/development/ux-substrate/screens/words.json`, and file-scanner exports only the "did not answer" sentence, not the "answered" one. I did not copy the sentence back in, and I did not change file-scanner (another module).

The one act for Bob, one of two:
1. Regenerate the word table so `words.json` carries file-scanner's CR-17 keys (the key is listed in `bio-plane/src/setup-words/words-unreviewed.json`). Recommended: it is the same route the rest of file-scanner's keys take. Then this job re-runs words, and posts COMPLETE.
2. Or have file-scanner export `EICAR_FOUND` (a file-scanner change, so a job of its own), and this job imports it.

Also for routing: at the process checkout I cloned (a4c42ff), `checks/words.mjs` reported testcopy 0 for file-safety both before and after my edits, so I could not reproduce the seven testcopy findings in CR-21. If your checker run shows them, tell me which checker version to use.

Test-only; nothing outside `bio-plane/test/m/file-safety/` changed. Ready to finish as soon as the key is in the table.

## J6 · COMPLETE

## CR-21 · file-safety · complete (B7 CHANGE, K4128)

**Entries applied.** CR-21 (test-only): the seven copied sentences are now read from file-scanner's export or the word table.
- `fixture.mjs`: the positive EICAR detail is `EICAR_FOUND` from file-scanner's `routes.mjs` (was `word(...)` on the code-keyed id, now the export as B7 asked). The `setup-words` import is gone.
- `tools.test.mjs`: the Cloudflare label is read from file-scanner's `cloudflare-intel` config; the negative EICAR detail is `EICAR_NOT_FOUND`; the positive is `EICAR_FOUND` at :193; the two `onOwnServers` "not on own servers" cases use the `scanii` and `opswat-deep-cdr` recipients from `PROVIDERS`. The `setup-words` import is gone.
- Behaviour unchanged. Tranche `tranche/T51` merged into the job branch (f0343ed4bc).

**Deferred.** None.

**Found in another module (REPORT, not touched).** The full `checks/run.mjs /home/user/bio` on this tranche shows reds outside file-safety: coverage (8 modules, e.g. agent-harness R17, agent-runner R36 to R38 and R40, installer R81, instance-setup R98 and R99) and words (12 inline findings in `instance-setup`, `bio-plane/src/setup-fleet.mjs`:30 to :67). None is in file-safety. Not touched; for BOB's routing.

**Tests and checks run (summary lines).**
- `node --test test/m/file-safety/*.test.mjs` (bio-plane): "tests 64, pass 64, fail 0".
- `node checks/words.mjs /home/user/bio file-safety`: "inline 0, plain 0, testcopy 0, missingkey 0, handlist 0 … 0 failures".
- `node checks/architecture.mjs /home/user/bio file-safety`: "18 product files … 0 failures".
- `node checks/coverage.mjs /home/user/bio file-safety`: "45 of 45 live requirement ids named by a test; 0 failures".
- `node checks/format.mjs /home/user/bio`: "175 modules, 175 requirements files; 0 failures".
- `node checks/run.mjs /home/user/bio`: file-safety clean in every section; the reds listed above are other modules.
- `node checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: "3 files changed by file-safety … 0 failures".

**Size (session_01CjpPbnVFWqVsrNKA5TJg3t):** test runs 3, module lines 2342

## J7 · QUESTION

QUESTION (replaces none). Entry 3, `securitytooladd`'s `fields.requires`.

The arm refuses without `providerId` (PROVIDER_UNKNOWN) and without `handlingDigest` (HANDLING_NOT_SHOWN) for every service. It refuses without `credentials` (CREDENTIALS_MISSING) and without `config` fields (CONFIG_MISSING) only for the services whose catalogue entry names them: `icap` and `syslog-tls` name no credentials, `joe-sandbox` and `metadefender-cloud` name no config, and a `host` or `region` comes from `config` or the template. A declaration cannot state a condition that depends on the chosen service.

My best reading, which I am building on: `accepts` = providerId, template, config, credentials, handlingDigest, confirmRetention, use, monthlyLimit; `requires` = providerId, handlingDigest only (what is refused for every service). The test for the requires supplies `credentials` through its call adapter for a service that names them, so the success path is reached. The guard then counts a screen that sends `credentials` or `config` as declared, and never flags one that omits them for a service that does not name them.

If you want `credentials` and `config` in `requires` (the screens always send them), say so; it is a one-line change. Everything else in entry 3 is copied from the op rows with no judgment.

Also, for your note: the requirement lines for R46 to R48 go in my job record for you, not in `build/requirements/file-safety.md` (JOB.md: I write only my paths, tests and record; the ownership check enforces it). Tests carry the ids R46, R47 and R48 in their titles.

## Completion (FR-12: B8, T51)

**Entries applied.**

1. **FR-SCAN (R46).** `scanStatus` (`index.mjs`, `#noSignatures`): when the scanner answers `/version` and holds no signatures (no published set), the answer carries `no_signatures: {since, reason, key, words, reason_key, reason_words}`. `since` is the instant of this module's first `not_scanned` note for want of signatures (`SIGNATURES_ABSENT`), else the scanner's last attempt, else null; `reason` is the scanner's own `last_error` (for example `REFUSED:main.cvd:403`), else `SIGNATURES_ABSENT`; the sentences are `localize` ids `file-safety.index.no_signatures_since` (`no_signatures` when no date is known), and `signatures_refused` (with the status), `signatures_failed` or `signatures_not_fetched`, each answered with its key. With signatures obtained, a scanner that did not answer, or no scanner bound, the answer has no `no_signatures` key, so R5's keys are unchanged in those cases. Test: `signatures.test.mjs`.
2. **L25 (R47).** `#writeNote` (`#sameNotScanned`): a `not_scanned` verdict of kind `scan`, `sandbox` or `copy` is not written again when the newest note of that file, kind, tool and engine is the same `not_scanned` for the same reason; the earlier note's id answers (a safe copy keeps pointing at it). Another reason, or a real verdict between, writes a new note. The files stay due (`#due` is unchanged) and every answer (`scanBatch`'s `not_scanned` count, an opening's `NOT_SCANNED` with its reason) is as before. Rows already written stay (R3). Test: `signatures.test.mjs`.
3. **K4202 (R48).** `DECLARED_OPS` exported beside the ops map, the eight ops: `deepercheck`, `openoriginal`, `openwithwarning`, `releasescanhold`, `safeview`, `securitytooladd`, `securitytoolremove`, `securitytooltest`. Classes, machine classes, mutating, weight and description copied from `op-declarations` and `op-grades`; `registerDeclaredOps` of `op-grades` answers all eight as `agreed` with the hand rows. Fields read from the arms: `capture` or `captureSha` (alternatives) for the file ops, `override` / `warned` / `reason` where the arm reads its own, `providerId`, `template`, `config`, `credentials`, `handlingDigest`, `confirmRetention`, `use`, `monthlyLimit` for the add (requires `providerId`, `handlingDigest` only: the QUESTION J7), `toolId` or `tool` for the test and the removal. Test: `declared-ops.test.mjs`.

**Requirement lines for BOB** (not written in `build/requirements/file-safety.md`: JOB.md allows a job only its paths, tests and record; ids as the START gave them).

- **R46** *(not yet met: T51)* (T51; K4182; FR-12; amends R5) **The safety state says what is true of a scanner with no signatures.** When `file-scanner` answers its state and holds no signatures (no set published), `scanStatus` carries `no_signatures: {since, reason, key, words, reason_key, reason_words}`: `since` the instant of this module's first `not_scanned` note for want of signatures (`SIGNATURES_ABSENT`), else the scanner's last attempt, else null; `reason` the scanner's own last error (`REFUSED:main.cvd:403`), else `SIGNATURES_ABSENT`; `words` and `reason_words` members' words read by `key` and `reason_key` (never "waiting"). Where signatures are obtained, the scanner did not answer or none is bound, the answer carries no `no_signatures`. Test: a stub reporting no signatures, a refusal and a date: both are carried by key; control: with signatures obtained, an unreachable and an unbound scanner, neither is carried.
- **R47** *(not yet met: T51)* (T51; L25, K4194; amends R46 and R3) **A `not_scanned` verdict is recorded once for a file and reason.** A `scan`, `sandbox` or `copy` verdict `not_scanned` writes no note when the newest note of that file, kind, tool and engine is a `not_scanned` for the same reason (`scanBatch`, the scan before first opening, a deeper check and a safe copy alike); another reason, or a real verdict, writes a note. The file stays due (R4) and every answer is as before. Test: a stub answering `not_scanned` for one reason on three passes and two openings leaves one note per file, one for a safe copy asked again; control: a changed reason, or a real verdict, writes a new note.
- **R48** *(not yet met: T51)* (T51; K4168, K4202; op-declarations R80, op-grades R49; test-support R15) **The module declares the ops it serves that the screens send.** `DECLARED_OPS` is exported beside the ops map: `deepercheck`, `openoriginal`, `openwithwarning`, `releasescanhold`, `safeview`, `securitytooladd`, `securitytoolremove`, `securitytooltest`, each row's class, weight and description copied from the op's existing rows and its fields read from the arm. Test: `declaredOpHolds` for each (`declared-ops.test.mjs`).

**Deferred.** None.

**Found in another module (REPORT to BOB).**
- `screens-settings` (`security.mjs`, the `scan` read): the Security screen draws only `queued` and `held` from `scanstatus`; to say "no signatures since <date>" and the reason it must draw `scan.no_signatures` (`words` and `reason_words`, or its own words by `key` and `reason_key`). Its entry would be added.
- `screens-intake` (Opening a file): draws the raw word `not_scanned` (UX-DESIGN's, as the START says); this job leaves the answer's `not_scanned` field as it was.
- Inherited reds, not caused here (the same three fail on the tranche before this job's changes): `op-grades` R42, R46 and `op-declarations` R73/R21 (MARKS and the registry-act gap).
- `file-scanner` (FR-06, not merged when this job ran): `/version`'s `signatures` has no "no signatures since" instant of its own, only `last_attempt` and `last_error`; R46 takes the date from this module's notes first. If FR-06 adds one, `#noSignatures` reads it with a one-line change.
- Whole-product `checks/run.mjs`: architecture, coverage and words reds are other modules' (words testcopy 6; coverage 7 ids); none names file-safety.

**Tests and checks run (summary lines).**
- `node --test test/m/file-safety/*.test.mjs` (bio-plane): "tests 75, pass 75, fail 0" (before the new tests: 64; new: `signatures.test.mjs` 3 — seen failing first — and `declared-ops.test.mjs` 8, a mutated declaration seen refused).
- `node checks/format.mjs /home/user/bio`: "175 modules, 175 requirements files; 0 failures".
- `node checks/architecture.mjs /home/user/bio file-safety`: "20 product files, 88 relative imports …; 0 failures".
- `node checks/coverage.mjs /home/user/bio file-safety`: "45 of 45 live requirement ids named by a test; 0 failures".
- `node checks/words.mjs /home/user/bio file-safety`: "inline 0, plain 0, testcopy 0, missingkey 0, handlist 0 … 0 failures".
- `node bio-plane/src/setup-words/build.mjs --check`: rows.mjs stale, naming the new ids (`file-safety.index.no_signatures_since` and the other `file-safety.index.*` and `file-safety.declared.*` ids); expected until BOB regenerates; no refusal naming this module.
- `node checks/ownership.mjs /home/user/bio file-safety tranche/T51 job/T51/file-safety`: see the closing line of this job's COMPLETE.

**Size (session_01T8Ec2n7sMP4hLAcphL7HNL):** test runs 9, module lines 2405

## J8 · COMPLETE

FR-12 (B8) done; your B9 answer applied (requires providerId, handlingDigest only). Details and Size line: build/jobs/T51/file-safety.md, "Completion (FR-12: B8, T51)". The requirement lines R46, R47, R48 are in my record, not in build/requirements/file-safety.md (either is fine, B9); each is marked not yet met: T51 and named by tests.

- R46: `scanStatus` carries `no_signatures: {since, reason, key, words, reason_key, reason_words}` when the scanner holds none, by key, never "waiting"; absent (control) with signatures, an unreachable scanner or none bound.
- R47: a `not_scanned` verdict (scan, sandbox, copy) is recorded once per file, tool, engine and reason until the reason changes; the files stay due, every answer is as before.
- R48: `DECLARED_OPS` for the eight ops; `op-grades` registerDeclaredOps answers all eight agreed.

REPORT for you: `screens-settings`' `security` screen must change to draw it. It reads `scanstatus` for `queued` and `held` only; it must draw `scan.no_signatures` (its entry would be added). The three reds in op-grades (R42, R46) and op-declarations (R73/R21) fail on the tranche without my changes too. `rows.mjs` is stale for the new ids (expected; yours to regenerate).

Merged tranche/T51 (437339a938). Module tests 75/75 (new: signatures 3, declared-ops 8); words, architecture, coverage (45 of 45) and ownership 0 failures for file-safety; format 0.

## Completion (fix round 3, wave 1: C84 your part, C83; session_013rwPMgEDrWmt84TRnUfgec)

**Entries applied.**
- **C84 (door and self-start), file-safety R49, R50, amending R4, R5.** `scanMirror({viewer, at})` (`op=scanmirror`, administrators) asks `file-scanner` for `POST /mirror?async=1` through the binding and answers `{ok: true, state: "started"}`. It refuses a member or machine (`NOT_AN_ADMIN`), no scanner (`SCANNER_ABSENT`), a scanner that does not answer 202 (`SCANNER_UNREACHABLE`), and an attempt under 15 minutes old with the new row `SIGNATURES_RUN_RECENT` (C-140.44, `attempted_at` says when). An "attempt" is the later of `/version` `signatures.last_attempt` and the run this module last started (kept in `fs_wakes` key `mirror`), because a started run has not yet written its own attempt. `scanBatch` reads `/version` once per batch and, when no set is published and the newest attempt is null or over 6 hours old, starts one run the same way. It never changes the batch's answer, and a state it cannot read or a start the scanner refuses starts nothing. `scanStatus` starts nothing. `scanmirror` is declared in `DECLARED_OPS` (classes admin and member, viewer stamp, no capability, weight substrate).
- **C83, R46 amended.** `#noSignatures` parses `MIRROR_REFUSED:exit N: …` as well as `REFUSED:<db>:<status>`. A status is named only when the text holds one as an HTTP answer ("error code 403", "status 403", "HTTP 403", "(403)"), never the exit code, a version or a count; an error with none is worded as the service having refused (stand-in key below); an unknown text still answers the generic unfinished-download words.

**Tests (each seen failing first on the code before the change, passing after; controls named in each).** `mirror.test.mjs` (R49: started once with `?async=1`, 14 minutes refused with the scanner not asked, 16 minutes starts, double press, member, machine, unbound, scanner not accepting; R50: one run for no set and no attempt, none an hour later, one at 7 hours, an administrator's run counts, controls: published set, attempt under 6 hours, unbound, state unreadable, `scanStatus` starts nothing), `signatures.test.mjs` (R46 both forms), `declared-ops.test.mjs` (`scanmirror`), `fixture.mjs` (the scripted scanner answers `/mirror`, default 202), `rows.test.mjs` (a row without a word row must be a named stand-in).

**Stand-ins (no word row yet; the design stream writes them).** `refusal.SIGNATURES_RUN_RECENT` (the new row's translation); `file-safety.index.signatures_refused_unnumbered` (the reason line for a refusal with no status); the acts and details `file-safety.index.checking_for_new_signatures`, `file-safety.index.no_scanner_so_no_run_started`, `file-safety.index.a_run_was_started_lately`, `file-safety.index.the_scanner_did_not_start`. `WORD_KEYS` lists only rows that hold a word, so the row joins it when its word lands.

**Provider merged.** file-scanner R6's `mirrorAsync` (`POST /mirror?async=1` → 202 `{ok, started: true}`) was merged to `tranche/T51` while I worked; I merged it into the branch before COMPLETE and the fixture's default answer is exactly its shape. The suite was re-run after the merge (tests 80, pass 80).

**Deferred.** None in this module.

**Found in other modules (REPORT).**
1. A new op in the route map breaks four tests of other modules that count file-safety's ops (23 expected, 24 now): `op-declarations/t36.test.mjs` (R32, R6: OPS holds a spec for each op), `control-plane/t36-door.test.mjs` (R61, R29), `plane/t36.test.mjs` (two: the door has no store route for `scanmirror`, "Cannot read properties of null (reading 'store')"). `op-declarations` needs `scanmirror` in the file-safety family (`ops`: administrator kind, like `securitytooladd`) and the plane its store route; those tests' count becomes 24.
2. Generated artifacts made stale by this change: `bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs`, `agent-worker/dist/agent-worker.bundled.mjs`, `release/agent-worker.bundled.mjs`, `setup-words/rows.mjs`, `words-reads.json` (stand-ins above).
3. screens-settings (wave 2) draws the button and calls `op=scanmirror` (answers `state: "started"`, or the row `SIGNATURES_RUN_RECENT` with `attempted_at`).
4. Reds also on the tranche tip, named and not fixed: format (build/rulings.md:4346), coverage of other modules, and in the suites run for impact the same ten failures with and without this change (op-grades R17, screens words R24 and R29).

**Tests and checks run.**
- `node --test --test-force-exit bio-plane/test/m/file-safety/`: tests 80, pass 80, fail 0.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: 12 modules, 171 test files; 4 new failures, all item 1 above; the rest equal the tranche tip's.
- `checks/run.mjs`: words 0 failures; architecture 0; coverage: file-safety 50 of 50 (the 15 failures are other modules'); format 1 failure, `build/rulings.md`, not mine.
- `checks/ownership.mjs … file-safety tranche/T51 job/T51/file-safety`: 8 files changed by file-safety; 0 failures.

Size (session_013rwPMgEDrWmt84TRnUfgec): test runs 9, module lines 2474

## J9 · QUESTION

Words needed (K3810; I used stand-ins with plain localize defaults, named in my record): refusal.SIGNATURES_RUN_RECENT (new row C-140.44: a check for signatures was made under 15 minutes ago, no run started; the answer also carries attempted_at), file-safety.index.signatures_refused_unnumbered (the reason line when the scanner states MIRROR_REFUSED with no status number), file-safety.index.checking_for_new_signatures, file-safety.index.no_scanner_so_no_run_started, file-safety.index.a_run_was_started_lately, file-safety.index.the_scanner_did_not_start. Please have the design stream write the first two; the other four are acts and details. Nothing waits on this.

## J10 · COMPLETE

Fix round 3 wave 1, file-safety: C84 my part (R49 scanMirror, op=scanmirror, declared; R50 the scan batch's self-start once in 6 h) and C83 (R46: MIRROR_REFUSED:exit N: … parsed beside REFUSED:<db>:<status>). Merged tranche/T51 incl. file-scanner R6 mirrorAsync. Suite 80/80. Checks: words 0, architecture 0, ownership 0, coverage file-safety 50/50 (format red is rulings.md:4346, on the tip). REPORT: adding the op breaks four other-module tests that count file-safety's ops (23, now 24): op-declarations/t36.test.mjs, control-plane/t36-door.test.mjs, plane/t36.test.mjs (two; the plane has no store route for scanmirror). op-declarations needs scanmirror in the file-safety family (administrator kind like securitytooladd) and the plane its route. Stale generated: both plane and agent-worker bundles, setup-words rows.mjs, words-reads.json. screens-settings (wave 2) draws the button and sends op=scanmirror. Words stand-ins in my QUESTION. Details and Size line in build/jobs/T51/file-safety.md.

## J11 · QUESTION

QUESTION (C84, R46/R50 amendments; step 3). I carry on with the best readings below; please confirm or correct.

1. Fields. file-scanner R6 (RC-R6) names `signatures.last_error = RUN_STARTED` and `signatures.stage` (`seed|download|stage|verify`) but not the instant of the stage, nor how `/version` shows an open request. I read `signatures.stage_at` (ISO instant of the latest stage write; where it is absent I use `last_attempt`) and `signatures.request` (truthy while `clamav/request.json` is open; I also accept `requested_at`). Please have file-scanner's R8/R6 state both fields by those names, or give me the real ones; my tests script the scanner with exactly these until its job merges.
2. Contradiction in R50's amendment. Its rule says a run is dead when older than 15 minutes with no later stage, alive (second press refused as under way) when its stage is under 15 minutes old; its test says "a press 14 minutes after a run that shows RUN_STARTED and no later stage is allowed". 14 minutes is under 15, so the rule refuses it. I follow the rule: alive < 15 min (refused as under way), dead >= 15 min (allowed), and write the test with 16 minutes allowed and 14 minutes refused as under way. Reply only if you want the other reading.
3. Own note. I remove this module's `mirror.started` note altogether (the guard and the six-hour self-start read only the scanner's state, per R50). The cost: two presses within the few milliseconds before the scanner writes its run's start both reach `POST /mirror?async=1`; file-scanner's request file is what absorbs that.
4. Words. Two new refusal/word stand-ins (`refusal.SIGNATURES_RUN_UNDER_WAY`, row C-140.45, and `file-safety.index.*` sentences for the stages and the stopped run) are read by `localize`; the design stream's rows are owed.

## Fix round 4, wave 1 (FILE-SAFETY #15; C84; RC-R7; B11)

BOB's answer B12 (K4438): `signatures.stage_at` and `signatures.request` (an instant) are file-scanner R6's; R50's test line corrected (16 minutes allowed, 14 refused as under way); the `mirror.started` note removed; stand-in keys named below for the word batch.

**Entries applied.** RC-R7: R46 (an unfinished run is worded as one) and R50 (the guard and the six-hour self-start read the scanner's state). Plus K4435's `WORD_KEYS` fix.

**C84.**
1. Root cause: `scanMirror` (old `index.mjs:1008-1022`) and `#lastAttempt` read this module's own `mirror.started` note, so a run the scanner never wrote still blocked the next press ("checked a few minutes ago"), and `#noSignatures` drew the stale stored refusal. Now `#runOf` reads the scanner's `RUN_STARTED`/`stage`/`stage_at`; the note is gone; an unfinished run is worded by stage, or as stopped.
2. Why the tests missed it: the double wrote nothing at a run's start, so the note was all a second press could see. Test-gap fix merged: `fixture.mjs` `runTrace` (the scanner's start trace, then cancelled: only `binding.stage`/`end` move it) and four new tests; the R49/R50 tests now run on that trace.
3. Failing-first test on the walker's row, through the route map (`fileSafetyOps` `scanmirror`, `scanstatus`): "R46, R50 (C84, the walker's row)" in `mirror.test.mjs`. Red against the previous source (all four new tests failed; the walker's row failed at `scanstatus` after the press: the stale `REFUSED` still drawn), green after. Controls in the same file: a run that ended (`REFUSED:main.cvd:403`, `MIRROR_REFUSED:exit 1: … 403`) worded as before, 14 minutes after its end refused as R49 says, 16 allowed; a quiet scanner blocks nothing; a batch leaves a live run and an open request to the cron, starts a stopped one after 6 hours.
4. Platform check: N for this module (pure plane code). The scanner's own L and P checks (cancel after the response, cron, 200 MB) are file-scanner's. LIVE-CHECK of the smoke copy not run: it needs the redeploy's scanner to show anything new, and the stored 04:17 string is the old one (new data only: the first new run overwrites it). The interface test against the real merged handler is not possible yet: file-scanner's job is not merged (its branch holds its start commit), so the scanner is the scripted double above, reading file-scanner R6's stated fields. The seam test (press to words, real scanner and file-safety) is screens-settings' (S, wave 2).

**K4435's red.** `rows.test.mjs` R24 was red (the stand-in `refusal.SIGNATURES_RUN_RECENT` counted as read); `WORD_KEYS` now filters by the row's design source. Red first, green after; its (1) and (2) as BOB wrote them.

**Stand-in keys for the word batch (design rows owed):** `refusal.SIGNATURES_RUN_UNDER_WAY` (row C-140.45, new; promotion stamps it); `file-safety.index.a_run_is_under_way`, `signatures_run_seed`, `signatures_run_download`, `signatures_run_stage`, `signatures_run_verify`, `signatures_run_under_way`, `signatures_run_stopped`.

**Requirement ids met.** R46, R50 (the amendments), R49 (guard now by the scanner's state); coverage 50 of 50.

**Found in another module.** None.

**Tests and checks.** `node --test --test-force-exit bio-plane/test/m/file-safety/`: 84 tests, 84 pass, 0 fail. Users: notice-producers and scheduler 265 pass; op-declarations and affordances 527 of 528 (R34 `capturecredentiallist`, on the tranche tip, accepted); queue and screens-settings 452 of 453 (R15 C84, the stale test of suite-reds-753ea4db8a, screens-settings'); control-plane 355 of 356 (t47-e2e R81, on the tranche tip, a stale test). Checks: format 0 failures; architecture 0; coverage 0 (50 of 50); words for file-safety 0 (testcopy 0); ownership 0 (6 files); `setup-words/build.mjs --check`: stale-rows note only (the new stand-ins), as expected.

Size (session_01Puie49xQXkuYPiR7ZSPHMk): test runs 12, module lines 2515

## J12 · COMPLETE

COMPLETE: C84 (RC-R7: R46, R50) and K4435's WORD_KEYS red, in build/jobs/T51/file-safety.md. Suite 84/84; checks 0 failures for file-safety; users' reds are the tranche tip's named ones. The scanner is the scripted double (file-scanner not yet merged); the real-handler seam test is screens-settings'. Stand-in keys listed in the record. Re-merge after file-scanner merges on request.

## Completion (fix round 4b, entry 5: R51; D6, F3a, F3b, F10; FILE-SAFETY #17, session_01Bx8AYz89obuQALgywrmCmP)

**Root cause (1).** `index.mjs` `#held` (was :266-274): `if (home && gate.scope !== "member" && …)` skipped the sight check when `provenance.homeOf` was null, and a multipart capture is registered by its parts alone, so its whole digest has no home: any non-denied member was served it (`openoriginal`, safe view). F3a's scan side: `#target` has no parts without a home, so the scanner answered `not_scanned: NOT_FOUND` and `#due` re-sent the file at every batch. F3b: `#render` set `failed/NOT_FOUND` for good when the keep had not landed. F10: `#lookAt`/`#bytes` loaded any whole (up to 256 MiB) for a PDF/container.

**Why the tests missed it (2).** Suites registered one row per capture, filed or not, and none built the parts-only register; scan/render tests ran one batch. Test-gap fix: `fail-closed.test.mjs` builds the 16+16+4 MiB capture as the screen leaves it (parts in the store, bundle naming them, register of parts only, and with provenance D1's whole row), and drives the ops and batches over time. file-safety's tests now run in `filedWorld` (captures filed, as the screen files them); the plain `world` keeps unfiled captures for other modules' tests.

**Changes.** `index.mjs`: `#held(…, {serves})` refuses a member viewer for a capture with no home in `openOriginal`, `originalState`, `safeView`, `requestSafeCopy`, `safeCopy` (not in notes/grade/findings/deeper: those serve no bytes); `#noteScanWait`, `#due`, `scanBatch` (scan waits, checked hourly by heads, sent when whole or all parts are held); `#render` (`waiting`), `#releaseRenderWaits`, `renderWake`, `safeView` (`SAFE_VIEW_PENDING` while queued/waiting); `#wholeHeld`, `#sizeOf`, `#bytes`, `#lookAt`, `#grade`, `#structureCheck` (GRADE_READ_MAX gate); `#repairWaits` in `migrate` (R-OLD: files whose newest ClamAV note is NOT_FOUND, views failed NOT_FOUND). `schema.mjs`: columns `scan_wait_at`, `render_wait_at` (additive). B13: `checks.mjs` SIGNATURES_RUN_RECENT by `rowWord`; dropped from STAND_INS.

**Failing-first (3).** `fail-closed.test.mjs` test 1, through the `openoriginal`/`safeview`/`openwithwarning` ops: on the tranche code (src stashed) red: "FILE_NOT_HELD: it was served"; green now. Tests 2-6 cover the D1 shape and parts target, the NOT_FOUND wait, R-OLD, the render wait, the grade gate.

**Measurement (4).** Local workerd does not enforce 128 MB (a 110 MB PDF read there), so it proves nothing; measured as extraction's c5b does, a node child with `--expose-gc` and a constrained heap, `readActive("pdf")` on page-heavy synthetic PDFs: 19.1 MB: +38 MB work above its bytes (57 MB with bytes; unconstrained +87); 27.7 MB: +49 (77 with bytes; fails at a 48 MB heap). Within K4478's 64/96 bounds at 20 MiB, so GRADE_READ_MAX = 20 MiB (= reading-pipeline's MULTIPART_READ_MAX). If cause-reading-4's step 0 sets another ceiling, change the constant.

**Wording.** No new `localize`. New details are plain English stand-ins of nearest held sentences ("The safe view is queued."); nothing owed beyond T52's pass.

**Tests and checks.**
- `node --test --test-force-exit test/m/file-safety/*.test.mjs`: all pass but R24 (`rows.test.mjs`): the design's `words-reads.json` lacks `refusal.SIGNATURES_RUN_RECENT` (B13's note): the design's, not weakened.
- Users (`impact.mjs origin/tranche/T51 HEAD`, 11 modules, 114 files) plus file-safety: 919 pass, 21 fail, all baseline on the tranche tip (journey-check/pseudo, plane/release, store-door/declared-ops) or the R24 above.
- format 0 failures; architecture 0; coverage 51 of 51 ids named, 0; ownership 0; words (file-safety) 0.

**Proposed requirement lines (BOB writes).** R51 (met): "`openOriginal`, `originalState`, `safeView`, `requestSafeCopy` and `safeCopy` refuse a member viewer, as `FILE_NOT_HELD`, for a capture whose home is not found. The scan target is the parts the home names. A ClamAV `not_scanned: NOT_FOUND` writes one note (R47) and the file waits: it is looked at again once an hour (`WAITING_RECHECK_MS` 3,600,000) and sent when its whole or all its parts are held; a safe view whose render finds no bytes waits likewise, answering `SAFE_VIEW_PENDING`, and is queued again when they are held. The grade, structure check and spreadsheet cells load no capture above `GRADE_READ_MAX` (20 MiB): it is graded by its start, high, `unread`; its structure check is `not_scanned TOO_LARGE`; its cells are `SAFE_VIEW_FAILED TOO_LARGE`." R21: add both constants. R39: a waiting file is due at its wait instant; `renderWake` includes waiting views' earliest instant.

**Found in another module.** `acquisition/unpack.mjs:833` has F3a's shape (audit). Decision for BOB, made on my best reading: fail closed applies only where bytes are served; `threatOf`, `verdictNotes`, `scanFindings`, deeper check still answer a homeless capture to a non-denied member (metadata only), because notice-producers/scheduler tests rely on it. Until provenance D1 merges, the owner is also refused a multipart capture's bytes.

**Deferred.** None.

**Size (session_01Bx8AYz89obuQALgywrmCmP):** test runs 16, module lines 2642

## J13 · COMPLETE

COMPLETE (B14, entry 5, R51). Fail closed where bytes are served; scan and safe view wait for unheld bytes (hourly heads); grade never loads over 20 MiB (measured). Failing-first red on tranche code ('it was served'), green now. File-safety suite green except R24 (design's words-reads.json lacks refusal.SIGNATURES_RUN_RECENT, B13 applied); users 919 pass, 21 baseline fails; checks 0 failures. Details, proposed R51/R21/R39 lines and the choice to limit fail-closed to byte-serving services: record build/jobs/T51/file-safety.md.

## Completion (fix round 6, G44, first owner: the safe view of a large spreadsheet; FILE-SAFETY #18, session_016eGP24TnGhJiYfns4RdWuR)

**Providers' state.** Merged on `tranche/T51` and read from it: office-readers (`xlsxEntry.text(parts, {inlineCellsMax})` with `cells_held`, `xlsxEntry.cellsIn`, R36 R37) and csv-reader (`csvEntry.cellsIn`, R17-R19, reached as `csvEntry` from `csv.mjs`). The ODS entry has neither slot (odf-reader is not an owner). No scripted double of a provider was used. Seam reds by name: none.

**Root cause (1), certain, measured by the diagnosis and reproduced here.** `formats.mjs` `sheetsOf` called `entry.text(bytes)` uncapped (old :112) and `index.mjs` returned every cell of every sheet (old :922-928): the 10 MiB-declared workbook (1.44 MB file) and a 4 MB CSV died at the platform object's old space in this job's red run (`heap out of memory`, child cap 105 and 102 MB). Above the entries' whole-read bounds `sheetsOf` answered `ok: true` with `cells: null` or no sheets (K4571), and a zip above `GRADE_READ_MAX` was `NO_SAFE_VIEW` (`index.mjs:924` gave no size).

**Why the tests missed it (2).** `view.test.mjs` previewed a 3-cell workbook and a 2-row CSV; the only large safe-view tests were PDFs; no suite ran the safe view under a heap cap. Gap fixed: `g44-large.test.mjs` runs the real op (`fileSafetyOps(...).safeview` over `filedWorld()`) in a child whose old space is the object's (`capFor`: 128 + 39 - file MB - 87.7 + the child's own idle, 27.2 MB; `g44-child.mjs`, `g44-fixtures.mjs`).

**What changed.**
- `formats.mjs:108-190`: `sheetsOf(format, bytes, entries)` reads `parts` once, states a size guard (`parts.guard`), an xlsx read in pieces (`parts.piecewise`) and an ODS over its declared bound (`readContainer` + `declaredTextBytes` of `content.xml`, before any inflation) as `{ok:false, why:"PREVIEW_NOT_DRAWN", size, bound}`; calls `text(parts, {inlineCellsMax: SAFE_VIEW_INLINE_CELLS_MAX_BYTES})` for names, extents (`usedRows`) and listed cells, then per sheet takes the first whole rows (listed cells sliced by `firstRows`; held cells through `entry.cellsIn` with `maxCells` and `toCol`); answers `rows`, `total_rows`, `truncated`, `next_row`, `reason` on a sheet that could not be shown (`sheet_unreadable`, `cells_unreadable`; no cells, no size), `sheets_total`, `sheets_truncated`. A row wider than `SAFE_VIEW_CELLS_MAX` is cut to that many cells and the sheet says `truncated` (found on the way: a two-row CSV of 200,000 fields answered 8.4 MB before the cut). An entry that answers no sheet, with its own marker (an ODS repeat bound), is stated with the marker's figures, never empty. Constants exported with R21's list: `SAFE_VIEW_CELLS_MAX` 1,000, `SAFE_VIEW_SHEETS_MAX` 20, `SAFE_VIEW_TOTAL_CELLS_MAX` 5,000, `SAFE_VIEW_INLINE_CELLS_MAX_BYTES` 524,288 (reading-pipeline's figure, held here because file-safety has no edge to it), `SAFE_VIEW_ODS_DECLARED_MAX` 8 MiB.
- `index.mjs:39-46, 910-935`: the data route answers `sheets_total` and `sheets_truncated` beside `sheets`; a file above `GRADE_READ_MAX` (the CSV head-judged, the zip or unknown) is `SAFE_VIEW_FAILED` `renderer_reason` `TOO_LARGE` with `size`, `bound`, `format`; the entry's own refusals are `PREVIEW_NOT_DRAWN` with `size`, `bound`, `format`; never `ok: true` without cells.
- `screen-words.mjs` (new): the five words as `localize(id, en, vars)` stand-ins in functions taking vars (`SCREEN_WORDS`, keys in `SCREEN_WORD_KEYS`, exported from `index.mjs`).
- Tests: `g44-large.test.mjs` (11 tests), `view.test.mjs` `:49`/`:53` updated to the new keys, `rows.test.mjs` R26's file list gains `screen-words.mjs`.

**Failing-first (3).** Seen red before any source change (all 10 then-written tests failed; the child died of `heap out of memory` for the 10 MiB workbook and the 4 MB CSV; the others on the missing keys and exports), green now (11 of 11). Negative controls run: with the zip `TOO_LARGE` branch off the case answers `NO_SAFE_VIEW` (red); with the column cut off the 200,000-field row answers 8.4 MB (red). Tests name R11, R51, R21.

**Platform check (4): L, node children at the real shape** (workerd does not enforce 128 MB, as the R51 record says); numbers below; P is the re-walk's.

**Measures.** Answer sizes: 10 MiB workbook 45,737 B (999 cells, 333 whole rows, `next_row` 334 of 73,792); 19.9 MiB workbook (just under the whole-read bound) 45,738 B; CSV 4 MB, 8 MB, 17.7 MB 48,961 B each (999 cells); ODS 8 MiB 45,366 B. Real-shape cap (128 + 39 - N - 87.7 + idle 27.2) against the lowest cap each survives (bisect), peak above idle sampled at 2 ms: 10 MiB xlsx 105 vs 44 (+27.7 MB); 19.9 MiB xlsx 104 vs 60 (+104 uncollected garbage); CSV 4 MB 102 vs 34; 8 MB 98 vs 46; 17.7 MB 89 vs 50; ODS 8 MiB 106 vs 60, dense (131,580 cells in 8 MiB) 106 vs 75. ODS uncapped entry read at the real cap 106: 10 MiB declared survives to 69, 12 MiB 78, 14 MiB 90, 16 MiB 94, 19 MiB 116 (dies), the diagnosis's 19.8 MiB death confirmed. **The ODS bound 8 MiB** keeps a margin of 1.4x (dense) to 1.8x (the diagnosis's shape).

**Protective bounds for BOB to report to Bob (K1881).** (a) `SAFE_VIEW_CELLS_MAX` 1,000 cells a sheet, whole rows, a row cut at 1,000 columns; (b) `SAFE_VIEW_SHEETS_MAX` 20 sheets, `SAFE_VIEW_TOTAL_CELLS_MAX` 5,000 cells a workbook; (c) `SAFE_VIEW_ODS_DECLARED_MAX` 8 MiB of declared `content.xml`: a larger ODS is not previewed, stated with its size; (d) a preview is not drawn for an xlsx over 20 MiB declared text (read in pieces today), a CSV over 17 MiB, any file over 20 MiB (`GRADE_READ_MAX`); the original is unchanged and holds every cell.

**Proposed requirement lines (BOB writes).** R11 (amended): spreadsheets answer `{kind:"data", derived:true, of, sheets:[{name, cells:[{ref, value, type}], rows:{from,to}|null, total_rows|null, truncated, next_row|null, reason?}], sheets_total, sheets_truncated, original}`: each sheet's first whole rows from row 1 to `SAFE_VIEW_CELLS_MAX` cells (a row wider than that cut to it, `truncated` true), at most `SAFE_VIEW_SHEETS_MAX` sheets and `SAFE_VIEW_TOTAL_CELLS_MAX` cells together, `reason` (`sheet_unreadable`, `cells_unreadable`) on a sheet that could not be shown (no cells, no size); a small workbook answers every cell with `truncated:false`. R51 (amended): a spreadsheet above what a preview can show (an xlsx or CSV above its entry's whole-read bound, an ODS whose `content.xml` declares more than `SAFE_VIEW_ODS_DECLARED_MAX`) or any file above `GRADE_READ_MAX` answers `SAFE_VIEW_FAILED` with `renderer_reason` `PREVIEW_NOT_DRAWN` or `TOO_LARGE`, `size`, `bound` (bytes) and `format`, never `ok:true` without cells. R21: `SAFE_VIEW_CELLS_MAX`, `SAFE_VIEW_SHEETS_MAX`, `SAFE_VIEW_TOTAL_CELLS_MAX`, `SAFE_VIEW_INLINE_CELLS_MAX_BYTES`, `SAFE_VIEW_ODS_DECLARED_MAX` exported by name. Words: the five keys of the contract.

**Rows owed to UX-DESIGN / BOB's regeneration.** `screen.open-file.safe.cut` {from, to, total}, `.cut.more` {from, to}, `.sheetscut` {shown, total}, `.notdrawn` {size, bound in MB, one decimal}, `.sheet.unreadable` {name}: code-origin stand-ins in `screen-words.mjs` (B491 pattern); also `file-safety.index.the_file_is_above_what_a_safe_view_reads` (a refusal `detail`, code-origin). `rows.mjs` is BOB's to regenerate at this merge; `refusal.SAFE_VIEW_FAILED`'s row is unchanged. `notDrawn` is told `size` and `bound` in MB by the caller (screens-intake formats the answer's bytes).

**Census ops (K4208).** `safeview`'s accepted keys are unchanged (`capture`, `captureSha`); only its answer gained keys. `DECLARED_OPS` unchanged.

**Tests and checks.** `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/file-safety/` from `bio-plane/`: 101 tests, 100 pass, 1 fail (R24, accepted red by name: the design's `words-reads.json` lacks a row; unchanged by this job, red on the tranche tip). Users (`impact.mjs origin/tranche/T51 HEAD`, 10 modules besides file-safety, 126 files): 910 tests, 902 pass, 8 fail, all on the tranche tip: plane `release` R24 (accepted by name) and journey-check `pseudo` R29 (a-c, 7 tests; `playwright-core` is missing in `src/journey-check`, and with `npm ci` run there the module still fails 23 of 128 on the tip's browser tests). `checks/run.mjs`: format 0, architecture 0, coverage 0 (6685 of 6685), channels 0, words: no failure in file-safety's files (the one remaining, `test-support` `platform-sqlite.mjs:44`, is the tranche's); `ownership.mjs file-safety origin/tranche/T51 job/T51/file-safety`: 0 failures.

**Found in another module.** None. (`odf-reader` has no `cellsIn`/`inlineCellsMax` slot: the ODS bound above is the stated meanwhile, as ruled; a later job may remove it.)

**Deferred.** None.

Size (session_016eGP24TnGhJiYfns4RdWuR): test runs 12, module lines 2738

## J14 · COMPLETE

COMPLETE (B15, G44, first owner): safe view of a spreadsheet = names + first whole rows by range, cut stated (rows/total_rows/truncated/next_row/reason, sheets_total/sheets_truncated); never a silent empty view: xlsx>20MiB declared, CSV>17MiB, ODS>8MiB declared, any file>20MiB answer SAFE_VIEW_FAILED PREVIEW_NOT_DRAWN|TOO_LARGE with size, bound, format. Failing-first red (heap OOM at the object's cap for the 10 MiB xlsx and 4 MB CSV) then green; module suite 100/101 (R24 accepted); users 902/910 (plane release R24 + journey-check pseudo, tranche-tip). Bounds for Bob (K1881): 1,000 cells/sheet (row cut at 1,000 columns), 20 sheets, 5,000 cells total, ODS 8 MiB declared (margin 1.4-1.8x measured). Answers 45-49 KB. Words: 5 stand-ins in screen-words.mjs + 1 detail; regenerate rows.mjs. No seam reds. Record: build/jobs/T51/file-safety.md. Size (session_016eGP24TnGhJiYfns4RdWuR): test runs 12, module lines 2738.

## J15 · COMPLETE

R52 (fix round 7 G84) done at commit b3364426e0 (pushed to job/T51/file-safety; no rebase, no PR).

**Entries applied.** START B16 (R52, cause G84): `index.mjs` `designRow` (was :56-57, one `WORD_ROWS.some` per key, 45 keys) is replaced by one pass: `DESIGN_KEYS`, a Set of the keys whose row has origin "design" (`r[5] === "design"`), gathered by one `WORD_ROWS.filter`; `WORD_KEYS` filters by it. Content and order unchanged (the test below holds it against the old recipe over the real table).

**Tests (new, `test/m/file-safety/`).** `r52-one-pass.test.mjs` (two tests, both named R52) and its child `r52-child.mjs`.
- Passes over `WORD_ROWS` while the module loads, counted in a child process with the array methods and the iterator wrapped: **red before** ("46 passes over WORD_ROWS … at most one is allowed"), **green after** (1).
- `WORD_KEYS` deep-equal to the per-key reference over the real table: green before and after.

**One point for BOB (technical, recorded here).** The first lookup of setup-words builds its key table in one pass of its own (`setup-words/index.mjs:9`, `rowsByKey`). It is triggered at load by `record-grammar/document.mjs:22`, so a cold process makes two passes over `WORD_ROWS`: setup-words' one and file-safety's one. The child primes that build before it starts counting, so the counted passes are file-safety's load alone. R52's wording ("passes over WORD_ROWS at most once") does not say whether setup-words' build counts. Its cost is setup-words' and would be changed there (not this module, not touched here). BOB to rule whether R52 means the module's own passes; the job's reading is yes.

**Deferred.** None in this module.

**Found in another module or outside this job.**
- `test/m/file-safety/rows.test.mjs` R24 (the rows census) is **red on the code before this change too** (checked: the pre-change `index.mjs` fails it the same way). The diff: `refusal.SIGNATURES_RUN_RECENT` (row C-140.44, fix round 3, its words the design's) is in the census but not in the test's expected list. Not weakened, not changed here: BOB to say whether the row or the expected list is right.
- `journey-check/pseudo.test.mjs` (7 failures) and `plane/release.test.mjs` (1) fail on the pre-change code too. Not this module's.
- `plane/g41-shape.test.mjs` failed once in a parallel run and passes alone (7 of 7, twice): a timing test under load, not this change.
- `checks/words.mjs /home/user/bio`: 13 failures, none in file-safety: case-checker `spec.mjs` (6 inline), installer-steps (`installer.fleet.logsunconfirmed`, 5), screens-intake `r7-project-picker.test.mjs` (`refusal.PROMOTE_NOT_A_PARTICIPANT`, 2).

**Generated artifacts.** None made stale (no word row or op changed).

**Ops (K4208).** No op declared, added or changed.

**Platform (L).** Not built here. The bundle's start figure (`measureStart`) is BOB's at the round end, per the START's item (3). The local measure I have: passes over `WORD_ROWS` at load 46 → 1; the diagnosis's 21 ms for this pass is not re-measured.

**No requirement wording change proposed.**

**Tests and checks (summary lines).**
- `node --test test/m/file-safety/r52-one-pass.test.mjs`: before "1 fail, 1 pass" (46 passes); after "tests 2, pass 2, fail 0".
- `node --test test/m/file-safety/*.test.mjs` (17 files), after: "tests 103, pass 102, fail 1" (the one is the pre-existing R24 above).
- Impact (`build/plan/impact.mjs origin/tranche/T51 HEAD`, committed): "affected modules: 11 of 176; affected test files: 147 of 2496". Only file-safety's own `rows.test.mjs` consumes this module's `WORD_KEYS`; the other ten are named because the module's file is shared. Their 130 `bio-plane` test files run together: "tests 938, pass 929, fail 9": 8 fail the same way on the pre-change code (journey-check `pseudo` ×7, plane `release` ×1), and 1 is the timing flake above.
- `checks/format.mjs /home/user/bio`: "format: 176 modules, 176 requirements files; 0 failures".
- `checks/architecture.mjs /home/user/bio file-safety`: "architecture: 26 product files, 103 relative imports …; 0 failures".
- `checks/coverage.mjs /home/user/bio file-safety`: "coverage: 1 modules, 52 of 52 live requirement ids named by a test; 0 failures".
- `checks/ownership.mjs /home/user/bio file-safety origin/tranche/T51`: "1 files changed by file-safety … ; 0 failures".
- `checks/words.mjs /home/user/bio`: 13 failures, none in file-safety (above).

**Size (session_01FFRPRUV4obmxBQTQJntsxb): test runs 10, module lines 2739** (`bio-plane/src/file-safety/*.mjs`, all files, at commit b3364426e0).

## J16 · REPORT

REPORT (ruling 1, READ_BOUNDS): a ceiling file-safety keeps that has no row.
kind `file_safety`, name `ods_declared` (the declared size of an OpenDocument sheet's content.xml above which no preview is drawn; today `SAFE_VIEW_ODS_DECLARED_MAX`, formats.mjs). Proposed figures: standard 8 MiB (8,388,608), alpha 8 MiB, protective 8 MiB (`same(8 * MiB, k("file_safety","ods_declared"))`, as the file_safety row beside `grade_read`). My code quotes `boundOf("file_safety", "ods_declared")` (R21, R57), which throws at import until the row exists, so every test that imports file-safety is red on my branch until runtime-limits' file carries it. I run locally with an uncommitted copy of that one row and do not commit it (ownership). Please carry the row to runtime-limits' file on tranche/T51.

## Completion (fix round 9, B17: R1, R3, R4, R6, R11, R12, R16, R21, R51, R53-R57; FILE-SAFETY #20, session_015kbzetYAMCNEmG4ma5vT3W)

Causes, each seen RED on the pre-change code (worktree at 254bc3365c with the new tests overlaid), then green:
- **G92 / R55 / R4 / R12 / R21** (unbounded scanner and renderer awaits): `r55-bounded.test.mjs`, red: "does not provide an export named 'SCANNER_CALL_BOUND_MS'", green 6/6. Fix: `#bounded`/`#clamavOnce` share one in-flight call per file, return at `callBoundMs`, record on arrival, per-call start/end log lines; one render per tick with a `rendering` mark (stale after 20 min); L/P are BOB's.
- **G136a, G136d / R3, R54** (encrypted, unscannable never clean; due rule per signature set): `r54-encrypted.test.mjs`, red "zip: archive_entry_not_filed,archive_not_opened,archive_waiting" and "nor does it want a wake", green 4/4.
- **G130c, G130d, G136d, G127d / R56, R6, R51** (structure, any size, by `readRange`/`partsOf`): `r56-structure.test.mjs`, red "1048577 B", "20971521", green 7/7 (zipdir.mjs is new, inside my paths).
- **G136b / R12 (classes, stream bound), X19**: `r12-render-classes.test.mjs` red (no `RENDER_RETRY_MS`), green 3/3; the X19 peak test (byte ledger) is in r56.
- **G137a, G137b / R11**: `r11-paging.test.mjs` red (no `SAFE_VIEW_PAGES_MAX` export), green 2/2 (12,000 rows here; the corpus takes 100,000).
- **G136e / R16, R53**: `r53-reading.test.mjs` red (no `READING_KEY`), green 2/2.
- **G124 / R57, R21**: `r57-bounds.test.mjs` red, green 2/2. Row `file_safety.ods_declared` came from runtime-limits (B18/B19).
- **Registrar / R1**: `r1-registrar.test.mjs` red, green 2/2.

Existing tests updated to the new rules (one render per tick, ranged store reads, new register shape, `reading`, `statement`, wide-CSV and CSV bounds lifted, g44-large uses `capFor`).

**Decisions of mine, for the record.** A receipt cannot read bytes in its synchronous act, so `safe_view` is registered unless the address names a picture, page, archive or text. Oversize office files: grade from the directory by range; structure check of anything above GRADE_READ_MAX stays `not_scanned TOO_LARGE` (R51). A latin-1 or UTF-16 file is `text`; the safe view still draws UTF-8 only.
**Proposal (not a deferral):** R39's render wake is last batch + 5 min, so one render per tick is about 12 renders an hour; BOB may want R39 to say `now` while views remain queued.
**New words, rows owed (stand-ins keyed through localize):** file-safety.index.reading_is_not_gated, .safe_view_first_pages, .safe_view_is_a_view, .the_file_is_encrypted_so_no_safe_view, file-safety.checks.the_file_scanner_could_not_read.
**Ops (K4208):** safeview now accepts `sheet`, `fromRow` (DECLARED_OPS updated). **Stale generated artifacts:** setup-words rows (new keys), fleet bundles.
**Found elsewhere, same on the base code:** plane `release` R24, plane `g41-shape` ×2 and control-plane `t51-visitor-copy` fail identically at 254bc3365c.

**Tests and checks.** Module: tests 130+, one fail = inherited rows.test R24 (words). Impact set (141 files): tests 1005, pass 1001, fail 4, all four fail on the base code too. format 0 failures; architecture 0; coverage 57 of 57; words 0 failures; ownership 0 failures.

**Size (session_015kbzetYAMCNEmG4ma5vT3W): test runs 20, module lines 3369**

## J17 · COMPLETE

COMPLETE: fix round 9 applied (see the completion section of my record); checks clean; impact set has only failures that also fail on the base.

## Completion (fix round 9, job 54: R39's render wake, K4900; FILE-SAFETY #21, session_015APyFqZNBSsmXdhzGxAkgD)

1. **The line.** `renderBatch` keeps `left` (views due now, plus safe copies beyond those it looked at, when a routine tool exists) in its `render` wake row (`index.mjs`, the `#keep("render", …)` before its answer); `renderWake` (`index.mjs`, after the unreadable case) answers `now` while `left` is above 0 and no file is marked `rendering`. The unreadable-queue case, the null cases, the back-off and waiting cases and the in-flight hold are unchanged: a view in its back-off is not counted, so no spin.
2. **Why missed.** R39's test (`wakes.test.mjs`) asserted `last renderBatch + FILE_SAFETY_POLL_MS` with a queue left behind; with one render a tick (#20, R12) that fixed the pace at about 12 an hour.
3. **Red first, then green.** `r39-render-wake.test.mjs`, three files queued: RED on the pre-change code, `actual: 1791461103000, expected: 1791460803000` (now + 300,000); and the in-flight case red too. Green 3/3 with the change. `wakes.test.mjs` R39 updated to the new rule (a view left queued: `now`, kept across a restart).
4. **Platform check:** N.

Module tests: pass 132, fail 2 (`rows.test.mjs` R24 words, inherited, named in the START; the run before it also showed `r56-structure` X19 red once, green on the second run, inherited). Impact set (`impact.mjs origin/tranche/T51 HEAD`): plane `t36`, op-declarations `t33`, notice-producers `files`, store-door `dispatch`, control-plane `t51-routes` all green. format 0, architecture 0, coverage 57 of 57, words 0, ownership 0.

**For BOB (scheduler's job 33).** `bio-plane/test/m/scheduler/files.test.mjs:279` ("R24, R9 … never the firing instant") assumes the old wake: with three files queued, `onAlarm` renders one, and `r.nextAt` is now `at` (R39 as amended says so), so `assert.ok(r.nextAt === null || r.nextAt > at, "no spin")` fails: `1791460803000 after 1791460803000`. It passes on `origin/tranche/T51` without my change. The scheduler's firing loop spinning at `now` is the intended cadence while views are queued; scheduler should assert it ends (null after the last view) rather than `> at`. Also red on the base, not mine: op-declarations `t36` R34.

No new files outside my paths; no generated artifact made stale beyond the member's bundle (`file-safety` is inside the plane's bundle; BOB regenerates). No new words.

Size (session_015APyFqZNBSsmXdhzGxAkgD): test runs 9, module lines 3374

## J18 · COMPLETE

COMPLETE: job 54 applied (R39 render wake is now while renderBatch left a view or safe copy queued; completion section of my record). Red/green shown; module tests 132 pass, 2 fail (rows.test R24 inherited, X19 flaked once). checks: format, architecture, coverage, words, ownership 0. FOR SCHEDULER (job 33): scheduler files.test.mjs:279 assumes the old wake (nextAt > at) and now fails; passes on the tranche base. Details in my record.

## Completion (job 99, fix round 9 batch D: R39, R12 amended, G171; K4998; B21)

**Entries applied.** (A) R39: `renderWake` answers `now` while a view is queued with no back-off (`render_wait_at` NULL), so a view queued after a batch that left nothing is drawn at the next wake, not 300 s after the last batch; a view in back-off keeps its instant. (B) R12: `#renderCall` classes a renderer answer of 5xx with no classed refusal as `SCANNER_UNREACHABLE` (transient, back-off retry); a 5xx that carries its own `code` keeps its class, a 4xx with none stays `RENDER_FAILED`, final. (C) R4/R39 sibling (R-PATH): `fs_files.queued_at` was cut to the second, so a file queued within the second of a `scanBatch` read as "sent by that batch" and waited a poll (300 s) against R4's "a newly queued file at once". It is now written to the millisecond (`#onReceipt`, `#ensureQueued`); the unused `second` helper is removed. The fix is mine, not the diagnosis's diff: that diff covered A and B only.

**Four fields.**
- Cause: A, `renderWake` fell to the last batch plus the poll for a view whose `render_wait_at` is NULL. B, a 5xx with no class fell to `RENDER_FAILED`. C, the second-truncated `queued_at` compared `<=` the batch instant.
- Why missed: `wakes.test.mjs` and `r39-render-wake` queued a view before any batch or after a batch that left work; `r12-render-classes` made "unreachable" a rejected fetch, never a 5xx. No test queued a file after a batch that left nothing, in either queue.
- Red first (`r39-after-batch.test.mjs`, before the fix): `now, not now + 299000 (the last batch plus the poll)`, actual 1791461100000, expected 1791460801000; `[ 'failed', 'RENDER_FAILED' ]` expected `[ 'queued', 'SCANNER_UNREACHABLE' ]`; scan: actual 1791461100000, expected 1791460800001. Green after: 3 pass, 0 fail.
- Platform check: **L** (the seam in Miniflare, the real alarm) is BOB's; I did not run it.

**Seam §16.** `--test-name-pattern="R9 seam §16"` on `control-plane/t51-round9-seam.test.mjs`, alone: 5 tests, 5 pass, 0 fail, including G137a (safe view, 205 ms) and G136b (OVER_BOUND 3.1 s; S5 42.6 s).

**Scheduler.** Its tests assume no old wake: the scheduler, notice-producers, queue, plane, store-door, op-declarations and affordances tests that name file-safety all pass (the three failures `node --test` lists are `fixtures/registry-*.json` and `plane/r8-headofline-entry.mjs`, helper files my grep handed it, not tests).

**Deferred.** None. **Found in another module.** None. **Rows owed.** None (no sentence added). **Generated artifacts staled.** The plane bundle (`bio-plane.bundled.mjs`) takes file-safety's source; BOB regenerates it at the round end. **New files outside `paths`.** None. **Requirement wording.** R12 and R39 already carry the amendments; the scan clause (C) needs none (R4 already says "at once").

**Tests and checks.** `test/m/file-safety/*.test.mjs`: tests 137, pass 137, fail 0 (R24 and X19 now green). `impact.mjs origin/tranche/T51 HEAD`: affected modules 11 of 176. format 176 modules, 0 failures; architecture 0 failures; coverage 57 of 57 ids named, 0 failures; ownership 3 files, 0 failures; words 0 failures.

Size (session_01DQq5SUCuskyyd5iwgeuLR7): test runs 8, module lines 3376

## J19 · COMPLETE

COMPLETE · FILE-SAFETY #22 · job 99, batch D (G171): R39 renderWake now for a view queued with no back-off; R12 5xx with no class is SCANNER_UNREACHABLE; R4 sibling fixed (queued_at to the millisecond). Red first seen for all three; file-safety 137/137; control-plane seam §16 5/5 alone; format, architecture, coverage, words, ownership 0 failures. Platform check L is yours. Plane bundle stale (regenerate). Details in my record.
