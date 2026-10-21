# cause-totality-T51 (T51)

**Status** · session_01S5Mdnf3wPrY9uHbTspL17G · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

K4282 (RESUME) answer: the suites are run and #324 is green. Posting the state as a QUESTION because the affordances suite still has red tests.

Applied (pushed on job/T51/cause-totality-T51, head 7574fb013e then the op-grades R5 test commit):
- affordances R12 (src/affordances.mjs `unaccounted`): stale for NON_ACTS is now the keys with no row in the table at all (`carried`), not "not carried as gated". unpublished and the RUNGS / RUNG_ABSENT arms unchanged. Doc comment updated.
- op-grades R5 (src/op-grades/index.mjs NON_ACTS_DATA): hand row `export: "writes an export manifest of what is already there"` (corpus-export's declared sentence). export keeps its substrate RUNG_ABSENT row.
- Tests: catalogue.test.mjs totality helper (a NON_ACTS key carried ungated is not stale); services.test.mjs R12 stale test rewritten to the new rule with a control (queue carried is not stale, dropped is stale); op-grades ladder.test.mjs new R5 (K4279) test, the sentence read via declaredSentence("corpus-export", "export") from the word table, with no literal copy.

Suites (summary lines):
- control-plane (test/m/control-plane/*.test.mjs): tests 324, pass 324, fail 0. #324 (totality.test.mjs) green.
- op-grades (test/m/op-grades/*.test.mjs): tests 142, pass 141, fail 1. The one red is words.test.mjs R44 (37 !== 11); it is red on the untouched baseline too (HEAD~1), so not caused by this change.
- op-grades ladder.test.mjs alone: pass 10, fail 0.
- affordances (test/m/affordances/*.test.mjs): tests 281, pass 272, fail 9. Baseline at HEAD~1: tests 281, pass 271, fail 10. So nothing new is red; my change fixes the services R12 stale test. The 9 red here, all also red on baseline: N345's ops; T23's ops; case-inputs' ops; case-import's ops; actionhold/actionholdrelease; wizard-scripts' ops; publishat / publishatmove / publishatcancel (R36); "R12 R24: with the control plane's rows for them" (op-declarations R17-R20); "R12: with the control plane's rows for T41's ops ... carried by no row each reads stale".

Checks (run against /home/user/bio):
- format: 175 modules, 175 requirements files; 0 failures.
- architecture (cause-totality-T51): 3917 product files; 0 failures.
- coverage affordances: 54 of 54 live ids named; op-grades: 51 of 51.
- ownership, multi-module form from the prep branch (affordances,op-grades tranche/T51 job/...): 6 files; 0 failures. The single-module form on main flags op-grades' files and the job record, as expected for a cause job holding both.
- checks/run.mjs: format 0, architecture 0, channels 0, words 0 (testcopy 0 after the fix). coverage: 4 failures in modules I do not hold (agent-harness R17, agent-runner R37 R38 R40, installer-steps R26 R31, journey-check R19), all red before this job.

Question for BOB: the 8 red affordances tests above that are not R12's own stale check (N345, T23, case-inputs, case-import, actionhold, wizard-scripts, publishat, op-declarations R12 R24) and the T41 R12 check. Several sit under R12 and may encode the old stale rule or the same root cause. Option (a): I fix those in this job within affordances' tests. Option (b): they are routed to BOB as a separate cause. Recommendation: (a) for the T41 R12 check and op-declarations R12 check, because they test the same rule I changed; (b) for the rest, which are red on baseline with other causes I have not traced.

Size (session_01S5Mdnf3wPrY9uHbTspL17G): test runs 14, module lines 6409 (affordances.mjs, affordances/, op-grades/ src).
