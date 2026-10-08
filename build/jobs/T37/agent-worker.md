# agent-worker (T37)

**Status** · session_01WhyJcr7TyurxDxBDdU3eVj · depth 2 · COMPLETE · handled B5

## Completion

**Reading set (mechanics §17).** BOB's START measured it at 1,220 KB, over 300 KB, so I followed option (3) and trimmed nothing.
- **Read whole myself:** my requirements (both parts); layer 6's row of `build/layers.md`; the plan's rules at the opening and T37-17; DEC-156; K1819, K1994, K2134, K2147, K2200 and K2201; `agent-runner`'s Purpose and R17–R23; `skills` R39; `run-rules` R21–R22; `src/draft.mjs`; `src/index.mjs`'s header, SURFACE, `json`, `refusal`, `askPlane` and routing; `agent-model`'s `converse`, plus R2 and R6. I also read every test I changed or wrote.
- **Read by a worker:** one worker read the rest whole: `index.mjs`, `ask.mjs`, `ops.mjs`, `reads.mjs`, `cascade.mjs`, the configuration and build script, every file under `test/`, and `agent-model/src/subscription.mjs`. Its summary is about 13 KB, and each statement cites file and line. It covers how the suites and controls run, the pins on SURFACE, env, wrangler and the bundle, how the `/draft` tests build requests, and how `RUNNER` is reached.
- **What it found that mattered:** the SURFACE pin (`requirements.test.mjs`:1136) and control A3's stale anchor. It left out nothing that mattered.

**Entries applied (T37-17).**
- **R66 (new file `src/signin.mjs`).** `POST /signin` takes `{member, step, code?}`.
  - It refuses in this order: `RUNNER_NOT_CONFIGURED` 503, `BAD_BODY` 400, `BAD_MEMBER` 400, `BAD_STEP` 400, `BAD_CODE` 400.
  - It then sends the step to `RUNNER.get(RUNNER.idFromName(member))`, at agent-runner's `/signin`, `/signin/code`, `/signin/state` or `/signout`. The body is `{member}`, or `{member, code}` for the code step.
  - It answers the runner's status and body byte for byte. A runner that throws or answers no JSON gives 502 `RUNNER_SILENT`.
  - It makes no plane call and needs no `PLANE`.
  - SURFACE gains `signin`, and R31's refusal names it (J1 (2), K2211).
- **R67, R36.** The code travels only in the code step's body to the member's own instance. The relay's own `RUNNER_SILENT` detail has any copy of the code cut out. There is no guard on the runner's answer (J1 (3), K2211).
- **R35.** The header text now says the `RUNNER` binding also carries the relay. The wrangler binding is unchanged.
- **R59, R68–R70 (`src/draft.mjs`).** `task.op` `translationdraft` is checked exactly.
  - `to_language` takes 1 to `TRANSLATION_DRAFT_MAX_WORDS` distinct words, each `{key, en, note, means, protected}`. `to_english` takes exactly one `{key, en, text, protected}`. The language must have a tag's shape. Anything else is `BAD_TASK`.
  - The account is checked as R59's is. A grant is refused `DRAFT_READ_NOT_ALLOWED` through `run-rules`' `draftMayRead`.
  - The pack comes from the body and needs its `interface_translation` layer, or the draft answers `PACK_UNDETERMINED`.
  - The model is offered exactly one tool, the final `draft` tool (J1 (1), K2211). The words go in the user turn only. The system prompt carries the pack's resident and `interface_translation` layers, never `writing_help` or `suggestions`.
  - The answer is `{ok, task, draft, not_drafted, label, usage, calls}` for `to_language`: only asked keys, in asked order, with the undrafted keys in `not_drafted`. For `to_english` the draft is `{key, english}`. The endings are R59's, factored into `draftEnding`.
  - The 100-word bound is read from `run-rules` (B3, K2213); no 100 is held here.
- **Inherited reds fixed (B5, K2217).** Four suites were red on a clean `tranche/T37`, from the plane's T36 refusals: a credential in the address (C-38.10) and the retired shared member token (C-38.11).
  - The fix: each helper now signs in an enrolled member (memberadd, enroll, login) and sends the session in the `Authorization` header.
  - `agent-worker.test.mjs` §8 (D-276), 6 reds; `harness.test.mjs` REC-100, 5 reds; `requirements.test.mjs` R48 agentpack and the namespaces read, 1 red; `versions.test.mjs`, which crashed at its fixture.
  - R45's bundle was rebuilt with `npm run build`.
- **Own flaw fixed.** Control arm A3 in `agent-worker.control.mjs` had matched nothing since R60 (T35). It is re-anchored to the header call, and now arms as declared.

**Deferred.** `cascade.control.mjs` arms 1 and 3 still match nothing (`if (cascade && !cascade.available)`, gone since K1502's cascade rewrite). `cascade.test.mjs`:8–12 already names this, and the control exits on arm 1. Re-anchoring them means re-deriving what the cascade's refusal path now is. That is outside this entry and needs no new behaviour, so it is left for the next agent-worker job that touches the cascade.

**Found in other modules (REPORT J2).**
1. **bundler**, red from this merge. `bio-plane/test/system/fleetbundles.test.mjs`:232–235 pins agent-worker's bundle at 22 inputs. It is now 23, because `src/signin.mjs` is an input. The other fleetbundles arms pass, including agent-worker's byte identity.
2. **installer.** `newgroup/dist/newgroup.bundled.mjs` carries agent-worker's bundle, so it is stale from this change. It is regenerated at the layer close (manifest §14).
3. **Requirement text, BOB's.** R34 still reads `{run: POST, version: GET}`, while SURFACE holds run, ask, draft, signin and version (K2211 (2)). `fleet-member.json`:26's note ("both routes") and `wrangler.jsonc`:117–127's comment on RUNNER are prose of mine that the next job can refresh.

**Tests and checks run** (on `job/T37/agent-worker`, with `tranche/T37` @ 6490d909c1 merged):
- `npm test`: 12 of 12 files pass. agent-worker 140/0, ask 57/0, cascade 56/0, fanout 185/0, harness 261/0, plan 55/0, requirements 294/0, t35 206/0, t36 20/0, t37 165/0, versions 20/0, wire-vocabulary 83/0.
- The new suite `t37.test.mjs` names R66, R67, R35, R36, R31, R59 and R68–R70. Against the tranche's source without this change it reads 65/100.
- Negative controls, run in a scratch worktree, never in this checkout. harness 13/13 as declared; wire-vocabulary 3/3; versions baseline 20/0; agent-worker 14/15 with A3 never armed (then re-anchored, and A3 alone is as declared). cascade.control is deferred, see above. Every restore was verified.
- `fleetbundles`: agent-worker has no staleness and is byte-identical (sha256 `84c24c63…0310`). One fail, bundler's input-count pin (finding 1).
- `format`: 0 failures. `architecture`: 0 failures. `coverage`: 62 of 62 ids. `ownership`: 12 files, 0 failures.
- P6: 2,723 source lines, under 4,000.

Size (session_01WhyJcr7TyurxDxBDdU3eVj): test runs 24, module lines 2723

## J1 · QUESTION

Three readings I am building on; none stops me, answer when you can.
(1) R69 "The model is offered no tool". `agent-model` R6 ends a conversation only when the model calls `finalTool`, so a draft answers through its `draft` tool (as R59's drafts do). My reading: the translation draft is offered exactly one tool, the final `draft` tool (the answer itself, whose input is the draft, `{words:[{key,text}], not_drafted?}` or `{key, english}`), and no read tool or any other; `onTool` refuses every other name without a plane call. If you mean literally zero tools, `agent-model` would need a text-answer ending (another module's change).
(2) SURFACE (R34): `index.mjs`' SURFACE already lists `ask` and `draft` beside `run` and `version` (R34's text says `{run, version}`). I add `signin: {method: POST, mutating: false}` as `/ask` and `/draft` were added, and R31's refusal names `POST /signin`. Say if SURFACE should stay without it.
(3) R67 guard: should the runner ever answer with the code in its body, passing it "unchanged" (R66, R43) would put the code in an answer (R67, R36). My reading: R67 wins; I do not build a guard (the runner's R18 says its detail never carries the code, and a guard would add an unworded code). The relay's own refusal detail (`RUNNER_SILENT` from a thrown binding error) has any copy of the code cut out.

## J2 · REPORT

Found outside my module (citations in my record's Completion):
1. bundler, red from my merge: bio-plane/test/system/fleetbundles.test.mjs:232-235 pins agent-worker's bundle at 22 inputs; it is 23 now (src/signin.mjs). Every other fleetbundles arm passes, agent-worker's byte identity included.
2. installer: newgroup/dist/newgroup.bundled.mjs carries my bundle, so it is stale from this change (regenerated at the layer close, manifest §14).
3. Wording, yours: R34 still reads {run: POST, version: GET}; SURFACE holds run, ask, draft, signin, version (K2211 (2)).
4. Deferred in my own module: cascade.control.mjs arms 1 and 3 still match nothing (named already at cascade.test.mjs:8-12).
