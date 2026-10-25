# plan-work (T51)

**Status** · session_018fWmQdUi2CZqXCuLdnhhG4 · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

T51-241 (plan-work, the words check) is applied on `job/T51/plan-work` at `23edb6fe61`, pushed. No PR opened (JOB step 1).

Entries applied (`build/plan/words-pass/plan-work.md`):
- Inline `index.mjs:357` (the rhythm refusal) is read through `localize("plan-work.index.a_rhythm_is_recurrence", …, { why })`; the reason is a var.
- Inline `index.mjs:564-565` (the comment-target refusal) is one `localize("plan-work.index.a_comment_is_on_one", …)`. Judgment: its text named `{option}, {action} or {draft}`, which the placeholder rule would read as variables, so the sentence now says "an option, an action or a draft"; the meaning is unchanged. Please check the wording with the design stream.
- Plain `index.mjs:1067` (the `from` refusal, a two-literal concatenation the check did not count) is `localize("plan-work.index.from_is_one_line_of_your", …)`, passed as `says`. It is a member-read refusal, so it is keyed, not unkeyed.
- No test held any of these sentences; none changed. No string judged diagnostic or wire, so no REPORT on that.
- The new localize ids have no words row yet; they join `words-unreviewed.json` for the design review, as the `accepted-work` job's did.

Deferred: none. Flaws found in other modules: none. No requirement or provided service changed.

Tests and checks (summary lines):
- `node --test "test/m/**/*.test.mjs"` for plan-work (in `bio-plane`): tests 50, pass 50, fail 0.
- `checks/words.mjs /home/user/bio plan-work`: inline 0, plain 0, testcopy 0, missingkey 0, unkeyed 0; 0 failures.
- `checks/words.mjs` joint list (conformance … action-replies): no line names plan-work (the run's 213 failures are in other modules).
- `checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio plan-work`: 12 product files, 52 relative imports; 0 failures.
- `checks/coverage.mjs /home/user/bio plan-work`: 1 module, 18 of 18 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio plan-work tranche/T51 job/T51/plan-work`: 1 file changed by plan-work; 0 failures.
- `setup-words/build.mjs --check`: the stale-rows note only, naming the new `a_comment_is_on_one` id (expected); no refusal naming plan-work.
- `checks/run.mjs /home/user/bio` (whole tree): format 0 failures, architecture 0; coverage 28 failures and words 1404 failures, all in other modules; none names plan-work.

Size (session_01K7dTpWYM64vfv1dGDQstQa): test runs 1, module lines 1420 (`src/plan-work`: index.mjs, checks.mjs, schema.mjs).

## J2 · COMPLETE (fix round 10, Wave A batch 4; START B2)

Fixture published: `bio-plane/test/m/plan-work/fixtures.mjs` `watchReaderRegistrar` (R9; real `registerWatchReader`: first registration, `LISTENER_DECLARED`, `LISTENER_MALFORMED` for no module and no reader), called and checked by `fixtures.test.mjs`.

Own fixture lines re-pointed (all FIX-E, providers earlier; no `fixtures-own`, `fixtures-generic` or `fixtures-contract` marker added):
- `fixture.mjs` conformance `curesOf` refusal: now conformance's published `curesOf` fixture, its real `curesOf` over its outsider (`NO_SUCH_DETERMINATION`).
- `fixture.mjs` actions `actionRead`: now actions' published `actionRead().unseenAnswer`, naming the id asked (R43/R106; the stand-in's `NO_SUCH_BUNDLE` was an answer no provider gives).
- `matters.test.mjs` escalation: `escalationRead().unknownDeterminationAnswer`; `takeup.test.mjs` escalation: `escalationRead().unknownAnswer`.
- `takeup.test.mjs:175,221` duties: `transitionsUnknownDuty().read` (`{ok:true, transitions:[], count:0}`, duties R14), per the K5070 note.
- `fixture.mjs` docket `NO_SUCH_ENTRY`: judgment. Docket's `docketEntryRead` fixture cannot be imported, because `docket` is not in plan-work's `uses` (architecture check refuses; `build/modules.json` is BOB's). No plan-work test reads a docket entry (the stand-in's `docketPressureOf` was never called), so I removed that member; action-holds would treat its absence as a failed read (`DOCKET_UNREADABLE`) if any test did. `docketPressureMarks` stays (`marks: []`, not flagged). If BOB wants the docket fixture used instead, add `docket` to plan-work's `uses`.

Deferred: none. Flaws in other modules: none. No requirement or provided service changed; impact.mjs: 0 affected modules.

Checks: plan-work tests 52 of 52 pass; fixtures `--list` plan-work: answer 0, 0 failures; words (own and joint list): 0 failures, no line names plan-work; format 0; architecture 0; coverage 19 of 19; ownership 0.

Size (session_018fWmQdUi2CZqXCuLdnhhG4): test runs 3, module lines 1427

## J3 · COMPLETE

J2 COMPLETE: watchReaderRegistrar published; 6 fixture lines re-pointed to providers' fixtures; the docket NO_SUCH_ENTRY stand-in member removed (docket is not in plan-work's uses, no test reads it). Details and checks in my record J2. Fixtures 0 failures, tests 52/52, words/format/architecture/coverage/ownership 0 failures.
