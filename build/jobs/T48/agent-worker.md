# agent-worker (T48)

**Status** · session_01Cc4Xq7rwJJfpqbv93XkwvJ · depth 2 · COMPLETE · handled B1

## Completion

**Entry T48-37 applied.**
- **R87 (N1015, K3103).** `/ask`, `/run`, `/draft` (every task) and `/transcribe` read `x-civicsmith-trace` and `x-civicsmith-member-ref` in R83's shapes and pass them to every `converse` they make. The reader is `doorTrace` (`src/signin.mjs`), shared with `/signin`, so there is one copy of the shapes.
  - A header that is absent or out of shape is passed as absent. Nothing is minted, refused or logged.
  - On a sign-in the headers reach the runner's upgrade (`agent-model` R16). On an API key they change nothing.
  - The module makes no `modelCall`, so `modelCall` needed nothing.
- **R86 (N670, K3190).** `/draft` takes `{op: "readtranslate", language, text, from_language?}` (`readTaskOf`, `readingDraft` in `src/draft.mjs`). `text` is 1 to 20,000 characters (`READ_TEXT_MAX`) and not blank.
  - Refusals come in R68's order. A grant is refused through `draftMayRead({kind: "reading"})`. That call answers `false` today because `reading` is not yet a known kind; it stays `false` once `run-rules` R33 lands, so nothing waits on run-rules' unmerged change.
  - Only the pack's `reading_translation` layer instructs it. With that layer absent, or a stated absence, it answers 502 `PACK_UNDETERMINED` with no model call.
  - The model is offered no tool but its answer. The passage goes only in the user turn. It makes no plane call.
  - It answers `{text, language, from_language}`. `from_language` is as given, else as the model states it in a tag's shape, else null. R79's `untested` applies.
- **N1052 (K3192).** The 5 test sign-ins in 4 files now use `{handle}`: `agent-worker.test.mjs`:622, `harness.test.mjs`:1708 and :1755, `requirements.test.mjs`:97 and `versions.test.mjs`:224.
- **Tests.** The new `test/t48.test.mjs` has 80 checks. They name R86 and R87 and cover every clause, each with its control.
  - I confirmed the tests catch real faults: dropping the trace from `/transcribe`, or admitting a grant on `readtranslate`, turns them red.
  - `t45`'s exact `DRAFT_OPS` set now includes `readtranslate`. It is still an exact set, not a loosened one.

**Flaw fixed in my own tests.** REC-100's real-plane fixture (`harness.test.mjs` REC100-0 to -2c, 5 reds) was red before this job, with or without the N1052 fix.
- **Cause.** The fixture's account connection was refused. First `REAUTH_DUE` (C-29.42, credentials R66), then `DISCLOSURE_DUE` (C-29.40, credentials R64). As a result `airunopen` answered `AI_NO_ACCOUNT` and the log stayed empty.
- **Fix.** The fixture now:
  - re-authenticates (`op=reauth`);
  - reads the disclosure's version through her own `op=disclosureof`;
  - records it shown (`op=disclosureshown`, member `member:ruth`) before `accountreferenceset`.
- This is test only. No import of instance-setup's source.

**Reading set (mechanics §17).** I read my requirements and all ten source files whole. Two helper agents read the rest in full and wrote digests citing file:line:
- all 33 test files (13,094 lines);
- the Public parts of all 18 uses, and `build/layers.md`'s layer 6 contract.

I read every test I changed in the parts I changed, plus `t47`'s harness whole. The sources stay binding.

**Deferred, with why.**
- **R45 (bundle byte-identity) is red.** The committed `dist/agent-worker.bundled.mjs` predates this change. R45 passes on the original source and fails only on my source change. BOB regenerates this bundle at L6's close (START), and its inputs include run-rules, whose L6 change is not merged yet.
- **Flaws the test digest found and I left.** All are in my own tests, none affects behaviour, and I left them for scope:
  - vacuous asserts at `fanout.test.mjs`:625-626 and :697-698, and `requirements.test.mjs`:1393 (R39 checks only `ok`);
  - stale arm counts in `harness.control.mjs`'s header;
  - `requirements.test.mjs`:3 says "R1–R49";
  - `ask.test.mjs`:250 hard-codes 25;
  - `agent-worker.control.mjs`' `takeOriginal` names its copy by path alone.

  They are listed for a later job.

**Found in other modules.** None changed. One note for BOB: `agent-runner/src/entry.mjs`:37 takes a member ref only in `[A-Za-z0-9._:-]{1,128}`, narrower than R83's `[\x21-\x7e]{1,200}`. The door's values (12 hex characters) pass both, so nothing fails today.

**Tests and checks.**
- `npm test` (agent-worker): 18 files, 17 pass, 1 fail. The failure is `requirements.test.mjs`, R45 only (the bundle, above). `harness`: 261 passed, 0 failed. `t48`: 80 passed, 0 failed.
- No layer tests are named in `build/manifest.md`.
- `format`: 0 failures. `architecture agent-worker`: 0 failures. `coverage agent-worker`: 79 of 79 live ids named, 0 failures. `ownership agent-worker tranche/T48`: 13 files, 0 failures.
- `run.mjs`: architecture 0 failures overall. Its 36 coverage failures are all other modules'.

Size (session_01Cc4Xq7rwJJfpqbv93XkwvJ): test runs 15, module lines 3634

## J1 · COMPLETE

T48-37 done: R87 (trace and member ref through converse on /ask, /run, /draft, /transcribe), R86 (readtranslate), N1052 (5 sign-ins by {handle}), and REC-100's fixture fixed (reauth + disclosure; 5 pre-existing reds). t48 80/0, harness 261/0; checks format/architecture/coverage/ownership 0 failures. One red, expected: R45 bundle byte-identity, which is yours to regenerate at L6 close. It uses no unmerged same-layer change (readtranslate's grant refusal holds before and after run-rules R33). Record: build/jobs/T48/agent-worker.md.
