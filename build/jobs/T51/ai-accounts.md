# ai-accounts (T51)

**Status** · session_01UqVXapoj5wpdUoADSpasF2 · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

Completion of T51-175 (ai-accounts, the words findings). Commit 3669033966 on job/T51/ai-accounts (merge of tranche/T51 at 888af5c935 in 5e41146262 first, K1991).

**Entries applied (build/plan/words-pass/ai-accounts.md):**
- inline `index.mjs` (was :1169): the keep-away reason's suffix "; this one has {length}" is now its own `localize('ai-accounts.index.this_one_has', ...)`, filled into the sentence as before; the sentence text is unchanged.
- plain `index.mjs` (was :313, :585, :1178): the three act phrases given to `#adminBar` ("switching the team key's assistant settings", "reading the team key's assistant settings", "keeping the team's material away from every assistant") are `localize` reads, ids `ai-accounts.index.switching_the_team_keys`, `...reading_the_team_keys_assistant`, `...keeping_the_teams_material_away`. Each phrase is a member-facing detail (membership's notAnAdmin fills it into "{what} is an administrator's act"), so none is reported to BOB as a non-member string.
- testcopy (the four in the findings): `t35-misc.test.mjs` compares the seal refusal's translation with `word('refusal.ACCOUNT_SEAL_UNAVAILABLE')` and its detail, and the two member-key and reference details, with `localize(id, en)`; `seams.test.mjs` (:524) compares KEPT_AWAY_UNREADABLE's detail with `localize('ai-accounts.index.whether_the_team_keeps_its', en)`.
- Found on the words check after the first fix (same en copied by the module's other tests): `group-key`, `t36`, `t40` and `t41` compare the notAnAdmin detail with `localize(id, en)` for the same three phrases.

**Deferred:** none.

**Reports about other modules:** none raised by this job. Observed on the repo-wide run (`checks/run.mjs`, not this module's): coverage 33 failures and words 4293 failures, in other modules (for example wizard-scripts' testcopy findings); none names ai-accounts. Those are inherited reds of the plan's rule 5, not this job's.

**Tests and checks (run on the committed head 3669033966, or on the working tree before the commit where noted):**
- `node --test bio-plane/test/m/ai-accounts/`: tests 114, pass 114, fail 0 (run twice: after the source change, and after the test copies were fixed).
- `checks/words.mjs /home/user/bio ai-accounts`: 0 failures.
- `checks/format.mjs /home/user/bio`: 175 modules, 0 failures.
- `checks/architecture.mjs /home/user/bio ai-accounts`: 18 product files, 0 failures.
- `checks/coverage.mjs /home/user/bio ai-accounts`: 34 of 34 live requirement ids named by a test, 0 failures.
- `checks/ownership.mjs /home/user/bio ai-accounts tranche/T51 job/T51/ai-accounts`: 8 files changed by ai-accounts (the seven module files and this record), 0 failures.
- `checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; coverage and words carry the other modules' failures above, with no line naming ai-accounts.
- `bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only (rows.mjs is BOB's to regenerate at the layer close); no refusal naming ai-accounts.

**Reading:** the requirements (both parts), the entry, build/layers.md (whole), the words findings, the module's own code and tests, the tests the findings name. The word-test sentence in `t35-misc.test.mjs:145` (a substring of the unknown-kind detail) is a copy the check does not flag; left as it was.

**Commit note:** the commit carries the Claude-Session line only; the model-name Co-Authored-By line is left out because the session's rule forbids a model identifier in a commit.

Size (session_01UqVXapoj5wpdUoADSpasF2): test runs 2, module lines 2147

## J2 · COMPLETE

CHANGE B2 applied (K3974). Tranche/T51 merged first (14905d7049 on the job branch, no rebase).
- `t35-misc.test.mjs`:145 (the unknown-kind detail) now compares the whole detail with `localize('ai-accounts.index.the_kind_your_teams_civicsmith', en, { ACCOUNT_KINDS: 'apikey' })` by equality; the product reads that detail by `localize` already (index.mjs:392).
- Tests: `node --test bio-plane/test/m/ai-accounts/` 114 pass, 0 fail.
- Checks: words 0 failures (testcopy 0); format 0; architecture 0; coverage 34 of 34 ids named, 0 failures; ownership 0 failures; setup-words --check shows the stale-rows note only, expected.
- Committed and pushed; state COMPLETE.
Size (session_01UqVXapoj5wpdUoADSpasF2): test runs 3, module lines 2147
