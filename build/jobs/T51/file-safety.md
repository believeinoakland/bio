# file-safety (T51)

**Status** · session_01Puie49xQXkuYPiR7ZSPHMk · depth 2 · WORKING · handled B10

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
