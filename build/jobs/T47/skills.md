# skills (T47)

**Status** · session_01WwUjYLBTS2rPZn3Z8JEkzz · depth 2 · COMPLETE · handled B1

## Completion (SKILLS #20)

**Read.** I read my requirements (`build/requirements/skills.md`) whole. I read my code (`skilldoctrine.mjs`, `skillpack.mjs`) whole myself (P20). My plan entry is T47-22, with K3038 and the plan's K3038 line. The reading set measured over 600 KB at START (mechanics §17 (3)). For the rest, a helper in this session read all 15 files under `bio-plane/test/m/skills/` whole (2,942 lines), plus these parts of the requirements:
- `run-rules` Purpose and Provides (R9, R14);
- `case-inputs` Purpose and Provides (R6, R7, R16);
- `case-authoring` R38 and R39;
- `ratification` R2.

The helper wrote me a digest citing each file and line. I then read whole the deployment sequence's source (`run-rules/deployment.mjs`), the edition test and both R18 tests. The sources stay binding.

**Applied.**
- **N949 (R18).** The `deployment_sequence` layer's note is re-worded for the four-member order:
  - this module deploys no mode;
  - which modes are deployed (the order's first, and any mode that deploys apart from the chain by its own flag) is read from the gate and from the run's rules;
  - the note gives the reason for the order and who owns each later mode's enabling condition (it said "the second mode").

  Its `load_when` now says "which modes are deployed". The SK-4 header states the order's four members, and that the first mode and `plan` (by its own flag since T46) are the deployed modes today. No behaviour moved. No mode name is typed (R23). R16 finds no control-flow authority in it. The pack's version moves (R11).
- **K3038 (R31).** `EDITION_STATEMENT_ACTS`' `whatchangedpropose` now cites `case-inputs R6` (was `case-authoring R39`), with the layer's comments. `publish` stays `case-authoring R38`, and `caseratify` stays `ratification R2`.
- **Own flaws fixed (P8).**
  - `skillpack.mjs`'s header and its SOURCING comment said "three kinds" while listing four (`guide` added in T41). They now say four, and name `absent` as the stated absence.
  - `lookup.test.mjs`'s message cited "run-rules R9" for what is deployed; it now cites "R9, as its R14 amends it".

**Tests.**
- New: `doctrine.test.mjs` "R18 (T47)". It checks:
  - the order's four members, `plan` last;
  - the deployed members of the order, read through run-rules' `DEPLOYED_MODES`, are exactly the first mode and `plan`, with `plan` deployed by its own flag and the chain's middle members not deployed;
  - this module deploys none: no export of either file holds a deployed set, and the layer's body outside the re-exported order holds no flag or predicate;
  - the note's new wording, with no mode name typed and no control-flow authority.

  Control: with the note's old wording restored, this test fails. (A dead assertion in my first draft, found by the digest, was replaced by a walk for flags and predicates.)
- Changed: `edition.test.mjs` R31 asserts `defined_by` `["case-inputs R6"]` for the proposal.

**Deferred, and digest findings not acted on (own tests, pre-existing).**
- The R11 "the version moves" arms in `action.test.mjs`:115, `translation.test.mjs`:207 and `writing.test.mjs`:120 check that the words are in the rendered JSON, not that the version differs. Behaviour is still held by `pack.test.mjs`'s R11 tests. This is not in this entry's scope, and is deferred to a later skills job.

**Other modules.**
- **R31's requirement text** (`build/requirements/skills.md`) still cites `case-authoring` R39 twice: in its heading parenthesis and for `whatchangedpropose`. The code and tests now cite case-inputs R6. The text is BOB's.
- **answer-envelope**, `envelope.test.mjs`:240 "R8": `DISCLOSURE_DUE` reads C-29.40 with new words where its table pins C-69.6. It is red on `job/T47/skills` with my change stashed too, so it is inherited and not mine.
- No generated artifact reads skills (manifest: the agent-worker bundle reads the pack from `op=agentpack`), so none is stale.

**Ran.**
- skills `bio-plane/test/m/skills/`: tests 118, pass 118, fail 0.
- Users of skills (P11):
  - investigation, answer-envelope and control-plane: 307 tests, 306 pass, 1 fail (the inherited answer-envelope R8 above);
  - agent-worker `npm test`: 16 pass, 0 fail.
- Checks:
  - format: 166 modules, 164 requirements files; 0 failures;
  - architecture skills: 17 product files, 83 relative imports; 0 failures;
  - coverage skills: 48 of 48 live ids named by a test; 0 failures;
  - ownership skills tranche/T47: 0 failures;
  - `run.mjs`: architecture 3071 product files, 0 failures; format 0; channels 0; coverage 44 failures, all in other modules (screens-*, setup-words, wizard-scripts), none in skills.

Size (session_01WwUjYLBTS2rPZn3Z8JEkzz): test runs 9, module lines 3091

## J1 · COMPLETE

T47-22 done, pushed on job/T47/skills. N949: R18's deployment_sequence note re-worded (four-member order, this module deploys none, who owns each later mode's enabling condition), tested by the new doctrine R18 (T47) test with a control. K3038: whatchangedpropose now cites case-inputs R6. skills 118/118 pass. The users' tests show 1 inherited red (answer-envelope R8 DISCLOSURE_DUE, red without my change too). format, architecture, coverage (48/48) and ownership: 0 failures. For BOB: skills.md R31's text still cites case-authoring R39 twice (yours). Details in my record's Completion.
