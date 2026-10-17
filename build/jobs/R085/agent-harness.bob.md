# BOB to agent-harness (R085)

**Read** · handled J8

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk on biosmoke8 (K3484) and its diagnosis (K3486, build/rulings.md on tranche/T49) found the check run stuck and Find missing held documents; your entry is part of fix round 3. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Four jobs run at once: agent-worker R93–R94, agent-model R17–R18, agent-harness R11, screens-daily R35. Each new id needs its own explicit test naming it (the coverage check counts any string, and some of these ids are already named by older tests, K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-haiku-5-5. Entry R085-11: agent-harness R11: add `conditions` to the spawn contract's `returns` (src/subsession.mjs, beside `summary_max`), from the vocabulary run-rules' `checkCondition` admits (run-rules re-exports observation-log's; use it through run-rules, your declared use). AGENT-MODEL #9 renders it as an enum.

## B2 · ANSWER · re J1

B (K3491): agent-harness now uses `observation-log` (modules.json and your Uses, on tranche/R085). Merge tranche/R085 into your branch, import `CONDITION_KINDS` from observation-log directly, and build R11 as stated; its test still checks each kind passes run-rules' `checkCondition`. No run-rules change.

## B3 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk on biosmoke8 (K3498) found a check run that ran to its end but whose sub-sessions could not see the question's captured document; the diagnosis is build/plan/diag-085-r4.md (read the parts naming your module). Your entry is part of fix round 4 (K3501): seven jobs at once, observation-log R38, ai-runs R85–R86, agent-harness R12, agent-model R20–R21, agent-worker R96–R100, machinery-producers R14, screens-inquiry R46. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Each new id needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-haiku-5-5. Entry R085-16: agent-harness R12. spawnContract (src/subsession.mjs) takes `arms` and `targets` beside `level` and `payload` and adds `subjects` and `arms` after `scope`, as the requirement states; read `payload.subjects.items` key by key (never spread), each item `{id, extent, kind}`. Update R7's and R8's tests for the new keys.

## B4 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk after fix round 4 (K3507) found the check's sub-sessions reading 0 passages (they search bare words with rows=passage), a dropped candidate never logged, and the question page and dock not showing the run; the diagnosis is build/plan/diag-085-r5.md (read the parts naming your module). Your entry is part of fix round 5 (K3510): five jobs at once, query-language R31, agent-worker R101–R102, agent-harness R13, screens-inquiry R47–R48, control-plane R101. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Each new id needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-haiku-5-5. Entry R085-23: agent-harness R13. In `emptyLevelCandidates` (src/harness.mjs ~469-493) the description says "this question" in place of the target id; the name stays `level-empty-<level>`. agent-worker bundles you: REPORT that, no rebuild.

## B5 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk after fix round 5 (walk-085-r5) found passages reaching the check's sub-sessions cut to a clause, a false "found nothing supportable" proposal, a log that did not say when a candidate was written, an upload id that cannot be cited, an untyped text file stored unread, raw record ids in a proposal, a member offered the group's setup scripts, and a 30-minute run; the diagnoses are build/plan/diag-085-r6.md and build/plan/diag-085-slow.md (both on origin/tranche/T49: `git show origin/tranche/T49:<path>`). Your entry is part of fix round 6 (K3528): eight jobs at once, retrieval R79, query-language R32, agent-model R22, agent-harness R14, agent-worker R103–R106, capture R93, screens-intake R28, wizard-scripts R40. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Each new id needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership), and the tests of the modules that use a service you change (P11); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Workers you spawn name model and effort: haiku at low for mechanical work, sonnet at medium for reading and diagnosis, never above your own model.

Model: claude-haiku-5-5. Entry R085-29: agent-harness R14. Read diag-085-r6.md item (e). In `emptyLevelCandidates` (agent-harness/src/harness.mjs ~495-498) stop appending `The sub-session reported: ${r.summary.trim()}` to the description; the report and its words stay in the run log. No raw record id may remain in the candidate's description. Users to run (P11): agent-worker's tests that read a level-empty candidate (REPORT any that fail). agent-worker bundles you: REPORT that, no rebuild.

## B6 · CHANGE

Before you start (K3529): your entry R085-29 also carries R15, a check run closes after a pass that added no new candidate (requirements on tranche/R085, merged into your branch). Your model is claude-sonnet-5-5. Each new id its own explicit test (K874).

## B7 · START

Depth 2. Tranche R085: fix round 7 on the 0.85.0 cut (K3557). The assistant lane's re-walk (build/plan/study-assistant-hosting/walk-r6.md and HANDOFF.md S4, on origin/tranche/T49: `git show origin/tranche/T49:<path>`) found the assistant composes the right answer and loses it: N1, a later segment is refused SKILL_VERSION_MISMATCH because the pack's version digests instance data (wizard scripts' `finished`/`approver`; skillpack.mjs ~468, 564-567, 649; agent-worker/src/index.mjs ~443-447), and the lease lapses with the candidate unwritten; N4, a run can close `completed` having written nothing (harness.mjs ~670-674, 708-711, 1045-1046; agent-worker index.mjs ~1258-1277, 1285-1331). Round 7: skills R50, agent-harness R16, agent-worker R107-R108, three jobs at once. Your requirements file marks your new ids not yet met; each needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership), and the tests of modules that use what you change (P11). Lean: change only what your ids need; tokens are billed at overage (K3549). COMPLETE as soon as green.

Workers you spawn: haiku at low for mechanical work, sonnet at medium for reading, never above your own model.

Model: claude-sonnet-5-5. Entry R085-38: agent-harness R16. agent-worker uses your close rule: run its tests that drive the close (REPORT any that fail; do not edit agent-worker).
