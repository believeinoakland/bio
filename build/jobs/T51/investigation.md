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
