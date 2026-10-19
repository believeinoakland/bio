# agent-harness (T51)

**Status** · session_01LXuoKmQchoNDZXN6e4RHh5 · depth 2 · COMPLETE · handled B3

## J1 · COMPLETE

Job T51-63 · agent-harness: COMPLETE. Commit 2ef7b9c6e7 on job/T51/agent-harness.

**Entries applied**
- K3807: `agent-harness/src/subsession.mjs` line 89. The comment named `civicos-ui/check-refusal-codes.mjs`, which is absent from the tree and from tranche/T51. The path is removed; the sentence now says only that the DEC-49 guard was deleted with the old battery in T20.
- K3850 (BOB's note 1 on `harness.mjs`): the header at lines 4–6 now states where each constant is declared today. `PLANE_OPS`, `NAMESPACES` and `MEANING_ARM` are all declared in `agent-worker/src/ops.mjs`, so the comment says so, and adds that T51-65 moves `MEANING_ARM` to `agent-steps`.
- No code, requirement or test changed.

**Decision for BOB to confirm (P17, recorded here, not in rulings.md; rulings.md is not mine to write)**
- BOB's START said to name the declaring module "after the split" and to "restate for the code as it is". The split has not landed on tranche/T51 (no `agent-steps/`, and `MEANING_ARM` is still declared in `agent-worker/src/ops.mjs` at 386547acb7). I stated the present owner and flagged the move, so the comment is true at COMPLETE. If you want the post-split owner named now, that is a one-line change, and it belongs with the T51-65 job, which edits `agent-worker`.

**Deferred:** none.

**Found in other modules:** none new. `agent-steps.md` line 163 assigned this comment to "the next agent-harness job", which this job closes.

**Tests and checks**
- `node --test agent-harness/test/`: 55 pass, 0 fail, 0 skipped.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures (3,556 product files); channels 0 failures.
- Coverage: 5,860 of 5,991 live ids named by a test, 24 failures across 23 modules. For agent-harness it is 1 of 19 ids: **R17 is named by no test**. R17 is marked not yet met (T50) and conditional on agent-runner R38; `remoteBrief` does not exist in the tree. BOB's START says coverage on my own not-yet-met ids is expected, and this predates my change. The other 22 modules' failures are outside this job.
- `node checks/ownership.mjs /home/user/bio agent-harness origin/tranche/T51 job/T51/agent-harness`: 3 files changed (two source files and this record), 0 failures.

Size (session_015QhswVAs4DNWLV8CzQhqJP): test runs 1, module lines 1940

## J2 · REPORT

Fifteen words-check findings in agent-harness are left unkeyed on purpose. I judge that no member reads them, so the words rule does not convert them. BOB's decision on each (design `unkeyed` list, K3944). Commit 4196a36825 converts the other 24 of the 39 findings.

1. **Table rows, `harness.mjs`:320, 321, 329, 344, 349, 355** (CONTROL_FLOW `does`/`judged` for compose, dedup, adjust, next-pass, close) and **`harness.mjs`:1042, 1061, 1080, 1085** (PLAN_FLOW gate-mode, compose, adjust, close). Why unkeyed: these are not shown to any member. `agent-model/src/model.mjs`:353 composes them into the model's step prompt ("STEP {step}: {does}. You judge: {judged}"), and the tests read them. They are instructions to a model, not member text. Recommendation: unkeyed.
2. **`subsession.mjs`:116–119** (REPORT_STATES values: "nobody looked at this level…", "we looked and it is positively not there", "we looked and could not tell", "we looked and it is there"). Why unkeyed: the contract sends only the keys (`returns.states` is `Object.keys`), and nothing in the tree reads the values. Note for the decision: `REPORT_STATES.partial` already reads `word("observation-log.partial.looked_got_part")`, so the five values are inconsistent. Recommendation: unkeyed, or key all five together if the design wants them shown.
3. **`subsession.mjs`:581** (documentHoldings' `identity` field, "op=versionchain's address_norm … never a title, a text or a byte comparison"). Why unkeyed: a method description in the wire output. No member sentence is composed from it (holdingsNote does not read it). Recommendation: unkeyed.

Also noted, not changed: `"terminal"` (`harness.mjs` close rows) is a one-word log marker, not a sentence. Some test regular expressions still quote fragments of member sentences (R1 "is not a row in this table", R3 "the '…' budget is spent"). The checker does not count regular expressions, so I left them. Say if Bob wants them converted.

## J3 · COMPLETE

**Entries applied**
- T51-206 (words, K3949, K3957, K3962): all 39 findings the conversion left were judged. 24 are fixed in code: 21 member-visible sentences in `harness.mjs` and `subsession.mjs` now go through `localize` (run-log `why`s, basis strings, the gate's mode sentences in MODES `does`, the plane-refused and refused-return fragments, the holdings note, the PRESENT note), split so each `localize` call takes one whole-sentence literal. Test `handlist` (line 399) and both `testcopy` findings (lines 163, 500) are fixed. The R2 test now compares the gate's sentence with `localize` instead of a copied regex.
- The other 15 are left unkeyed and listed in my REPORT for Bob's decision (K3944): 10 model-facing table descriptions and 5 developer-only descriptions.
- Commit 4196a36825 on job/T51/agent-harness, merged with tranche/T51 first (no rebase).

**Decisions (mine, for Bob to see)**
- The R6 test no longer imports `bio-plane/src/op-declarations`. That module is layer 11, so the architecture check rejects the import from layer 6. The test now names the three ops R6's own text names (airunspawn, capturerequest, suggest); that is this module's requirement, not another module's list.
- The `does` of MODES is now localized (all four modes), because the gate's sentence for a not-deployed mode quotes it to members.

**Deferred:** none in my module's code. The 15 unkeyed findings wait on Bob (above).

**Found in other modules:** none new.

**Tests and checks**
- `node --test agent-harness/test/`: 55 pass, 0 fail, 0 skipped.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio agent-harness`: 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures (3,622 product files); channels 0 failures; coverage 28 failures across modules, agent-harness only R17 (pre-existing, not met T50, expected per START); words: whole tree 3,348 failures in other modules, agent-harness 15 (the unkeyed list above).
- `node bio-plane/src/setup-words/build.mjs --check`: stale-rows note only, naming my new ids (expected; BOB regenerates at layer close). No refusal.
- `node checks/ownership.mjs /home/user/bio agent-harness tranche/T51 job/T51/agent-harness`: 0 failures (the three files changed are in agent-harness's paths and tests).

**Words at COMPLETE:** the words check shows 15 findings in agent-harness, all in the REPORT. The COMPLETE condition "no finding in your module" therefore waits on Bob's decision on those 15.

Size (session_01LXuoKmQchoNDZXN6e4RHh5): test runs 2, module lines 1876
