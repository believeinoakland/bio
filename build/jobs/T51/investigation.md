# investigation (T51)

**Status** · session_01BEnRuExNYqeZc3R4yJCB4s · depth 2 · NEEDS BOB · handled B2

## J1 · COMPLETE

T51-223 (investigation, R7 words pass) is done. Commit b1d2efc566 on job/T51/investigation, tranche/T51 merged in first (no conflict).

**Entries applied (the words check's three findings, build/plan/words-pass/investigation.md):**
- `bio-plane/src/investigation/checks.mjs` INVESTIGATION_MEMBER_ONLY (was :26): `word("refusal.INVESTIGATION_MEMBER_ONLY")`. The row exists and its text equals the sentence, so no new id.
- `bio-plane/src/investigation/checks.mjs` PLAN_DECIDED (was :56): `word("refusal.PLAN_DECIDED")`, the existing row (equal text).
- `bio-plane/src/investigation/index.mjs` the `claim` fallback (was :626): `word("investigation.claim_cannot_read")`, the existing row (`a claim that cannot be read`). The `investigation.project_concluded` call it sits in is unchanged.
- K4010's `checks.mjs`:26 note: read through the INVESTIGATION_MEMBER_ONLY row, as steps did.
- No test held any of the three sentences (grep of bio-plane/test found none), so no test changed. No new word ids were minted, and no test copies were found in the module.

**Deferred:** nothing.

**Found in another module:** nothing to report.

**Checks run:**
- `node bio-plane/test/m/investigation` (the module's suite, `node --test`): 32 tests, 32 pass, 0 fail.
- `checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; the words check reports 2310 failures across other modules and none in investigation (the 3 findings are closed; the other modules' findings are theirs).
- `checks/coverage.mjs /home/user/bio investigation`: 23 of 23 live requirement ids named by a test; 0 failures.
- `checks/architecture.mjs /home/user/bio investigation`: 0 failures.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `bio-plane/src/setup-words/build.mjs --check`: rows.mjs and words-unreviewed.json match words.json and the source (exit 0).
- `checks/ownership.mjs /home/user/bio investigation tranche/T51 job/T51/investigation`: 1 file changed by investigation between tranche/T51 and job/T51/investigation... (the two files above, both in the module's paths), 0 failures.

One note for the record: the commit trailer. The attribution reminder asks for a Co-Authored-By line naming the model, which the environment's rule against model identifiers in commits forbids; I committed with the Claude-Session trailer only.

Size (session_01YbXsrzc1B7WqsL8Px1SokZ): test runs 3, module lines 1529

## J2 · BLOCKED

BLOCKED (cause: needs BOB). The work of FR-15 is done and pushed (job/T51/investigation); two files that are BOB's, not mine, are all that stand between it and COMPLETE.

**Needs from BOB (both outside my write set; ownership.mjs refuses either from me):**
1. `build/modules.json`, row `investigation`: add `"test-support"` to `uses` (my new test imports `bio-plane/test/declared-ops.mjs`, as the START asks; `architecture.mjs investigation` fails on exactly that one line, and I confirmed with a local, reverted edit that with the edge it shows 0 failures, and coverage 25 of 25, 0 failures).
2. `build/requirements/investigation.md`: the two lines below (the START had me write them; the ownership check forbids it, so they are here). Tests name R24 and R25. Please also set the Status line's "Last changed" to T51.

```
- **R24** *(not yet met: T51)* (amends R18; C65; DEC-381; `project-stage` R2; State Rules v1.5, 'How a project's stage is shown', K356, K362) `projectClose({project, reason, note?, by})` closes a project at its owner's choice, whether or not its work has gone quiet: `closed_reason` one of `resolved`, `superseded`, `abandoned` (`intent` R29), the gaps read at the act kept beside it as R18's close keeps them, the close made through the same revision of the project's document (`promotion`). The close is the owner's recorded act, never a stage the record grows into, so `project-stage` R2 then reads the project `closed` with that reason. Refusals as R18's, none of them `QUIET_NOT_QUIET`: a machine (`INVESTIGATION_MEMBER_ONLY`), a project not seen or not joined (`membership` R44, R55), a reason outside the three (`CLOSE_BAD_REASON`), a note empty or too long (`INVESTIGATION_NO_REASON`), and a joined participant who does not own the project (`PROJECT_ACT_NOT_THE_OWNER`, `membership` R122's one answer for the owner-only condition); each writes nothing. `projectCloseWithGaps` (R18) is the quiet path and stays as it is.
- **R25** *(not yet met: T51)* (K4168; `op-declarations` R80, `op-grades` R49) The module states, as `DECLARED_OPS`, each op it serves that a screen sends or that this tranche adds, with the fields it accepts and requires: `projectclose` (R24). `investigationOps` serves it, answering as `projectClose` does; a test holds the declaration true by calling the op as the door does.
```

**Entries applied**
1. C65: `Investigation.projectClose({project, reason, note?, by})` (index.mjs), over the existing `#closeProject`, through the same close both doors now share (`#closeKept`). A joined participant is required (`#memberGate`), then an owner (`membership.projectAuthority(..., "owner")`); no quiet gate. `projectCloseWithGaps` is unchanged in behaviour (quiet-gated, any joined participant's door; its test passes untouched). The close act is kept beside the open quiet spell if one exists and opens none.
2. K4168: new `src/investigation/ops.mjs`: `investigationOps(investigation, url, body)` serving `projectclose` (fields body-first then address; `by` the query's stamp, the founder's `admin` handed as `member:admin`, as owner-ops hands it) and `DECLARED_OPS.projectclose`: classes admin, member; machineClasses []; mutating; stamps viewer, by; needs `contribute` (a new op with no hand row has to name one, op-declarations R80); weight `reasoned` with refusal `CLOSE_BAD_REASON`, as its sibling `projectclosewithgaps` is graded; fields accepts project, reason, note, requires project, reason.

**One reading to confirm (low-level, so I applied it):** the START names the non-owner refusal `NOT_THE_OWNER`. The only owner-only refusal this repo mints is membership R122's `PROJECT_ACT_NOT_THE_OWNER` (single mint site; the check family already relays membership's project refusals), so `projectClose` relays that. Promotion's own `NOT_THE_OWNER` guards only the abandoned close, so it would not have refused `resolved` or `superseded` by a non-owner; the explicit owner check does, all three, with nothing written. If BOB wants the literal `NOT_THE_OWNER`, it is a one-line change.

**Test deviation:** the START's "project-stage then reads closed" cannot be a test import (project-stage is layer 8, after this module: architecture refuses it). The test asserts what `project-stage` R2 rule 1 reads, the project's own document recording `current_state: closed` with a `closed_reason` of the three (parsed with record-grammar), and says so; project-stage's own R2 tests hold that such a document reads `closed`.

**Hand rows that can go / become unread:** none to remove for `projectclose` (no hand row in op-declarations or op-grades RUNGS/nonActs). `op-grades/marks.mjs` holds a kit mark `projectclose` (Reversible), now unread as the op has a declared rung (marks.mjs' own header says so); `wizard-scripts/screen-registry.mjs` lists `projectclose` in `owed` for the project screen (FR-28's, DEC-381). `plane` (FR-32) spreads `investigationOps`.

**Found in another module:** nothing new. Inherited and unchanged by me (same result with my changes stashed): `op-declarations` R73/R21 registry-gap test (1 fail) and `op-grades` R42 and R46 (2 fails).

**Checks / tests**
- `node --test bio-plane/test/m/investigation/`: 38 tests, 38 pass (6 new in close.test.mjs; first run with the service change stashed: 1 pass, 5 fail). `test-support`: 61 pass.
- `checks/run.mjs /home/user/bio`: format 0 failures; words 0 failures; architecture 3 failures before I fixed my test's imports, now the one `test-support` line above; coverage failures are other modules' (agent-harness, agent-runner, citation, installer-steps, journey-check, link-sweep, monitoring).
- `checks/ownership.mjs /home/user/bio investigation tranche/T51 job/T51/investigation`: 5 files, 0 failures.

Size (session_01BEnRuExNYqeZc3R4yJCB4s): test runs 9, module lines 1581
