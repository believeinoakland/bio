# connections (T51)

**Status** · session_01B18LY8jj8WugArr9aZjMRC · depth 2 · COMPLETE · handled B2

## J1 · REPORT

B2 handled: both reasons are keyed on the job branch already (mentioned.mjs MENTIONED_UNDATED, stepsources.mjs STEP_SOURCE_UNDATED, commits d3d66eed13 and e34b6eb307). explore test/m/explore/real-connections.test.mjs: 1 pass, 0 fail on this branch. Connections: 129 tests pass; words check 0 failures on the committed tree. Still open on my side: the sentence fragments held in test regular expressions (a sub-agent is converting them), then the final checks, the Size line and COMPLETE.

## Completion record (T51-193, the words pass for connections)

**Applied.** T51-193: the 14 findings of `build/plan/words-pass/connections.md` (the inline and test copies) and its 11 plain findings, each read through `localize` (ids `connections.<file>.<slug>`, fixed once) or `word` (existing words.json keys, for sentences equal to a row: `connections.target_bytes_seen`, `connections.version_target_source`, `connections.says.longer_member`, `connections.says.longer_proposed`, `duties.why.read_names_member` for the viewer refusal, which also sits under the same sentence in hypotheses). The undetermined reasons of `mentioned_together` and `step_source` answer `{key, vars}` (`MENTIONED_UNDATED`, `STEP_SOURCE_UNDATED`), so the owner-conformance battery passes and explore's real-connections test is green (BOB's CHANGE B2).

**Beyond the checker (R13, K3964, K3974).** Refusal details, composed `why` and `says` sentences, the kind words, the `choose` label fragments ("recorded: ", "already the choice, so nothing was written: ") and the NEED_CAPTURE detail in `ops.mjs` are keyed too, each rendering the same text. Test regular expressions and substring checks on those sentences are now equality or `includes` against the same `localize`/`word` call; a test never repeats a sentence it did not get from a key.

**Deferred.** None. Two judgements for BOB: (1) the viewer refusal reuses `duties.why.read_names_member`, because connections cannot add a row to `words.json`; (2) a few test checks take a reference (`ref`) or a count out of the output they check, to build the expected `localize` call (read, converts-reads, read's R10/R11 test). Those tests fix the template and the other vars, but the reference itself is read from the answer, not from the fixture. The checks are weaker than full equality there; a fixture-level expected value would close it.

**Tests and checks run** (on the pushed tree, job branch at `984a22b6b1` plus the record):
- `node --test test/m/connections/*.test.mjs`: 129 tests, 129 pass, 0 fail.
- `node test/m/explore/real-connections.test.mjs`: 1 pass, 0 fail.
- `checks/words.mjs /home/user/bio connections`: 0 failures; inline 0, plain 0, testcopy 0, missingkey 0, marker 0.
- `checks/format.mjs /home/user/bio`: 175 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio connections`: 25 product files, 112 relative imports, 0 failures.
- `checks/coverage.mjs /home/user/bio connections`: 69 of 69 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio connections tranche/T51 job/T51/connections`: 20 files, 0 failures.
- `bio-plane/src/setup-words/build.mjs --check`: the stale-rows note for `rows.mjs` (expected), no refusal naming connections.
- `checks/run.mjs /home/user/bio`: format and architecture 0 failures; the words check reports the other 173 modules' findings, none in connections; coverage shows 30 failures across the tree, none in connections (the accepted reds of rule 5, not this module's).

**Size (session_01B18LY8jj8WugArr9aZjMRC): test runs 20, module lines 2347.** The module-lines count is the non-blank, non-comment lines of `bio-plane/src/connections/*.mjs`; the test-run count is approximate, from the runs of this session.

## J2 · COMPLETE

T51-193 done on job/T51/connections (head b2b0bd99cf). 129 connections tests pass; explore real-connections passes; words check 0 failures for connections; format, architecture, coverage (69 of 69) and ownership pass; setup-words check shows only the expected stale-rows note. Refusal details, composed sentences and test sentence checks are keyed (R13). Two judgements for BOB: the viewer refusal reuses duties.why.read_names_member; some test checks take a reference from the output they check, weaker than full equality. Full record and Size line in build/jobs/T51/connections.md.
