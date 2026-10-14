# wizard-scripts (T47)

**Status** · session_01K69becYeJ3odGuKgqkxCtQ · depth 2 · COMPLETE · handled B3

## Completion (WIZARD-SCRIPTS #10)

**Entry applied:** T47-47 whole: R31–R36 (B1; readings K3143, edge K3145).
- **R31, R35** `SCREEN_REGISTRY` re-taken from `registry.json` at PR #33's head `f90b187c7b` (as merged into `tranche/T47` at 6f0d88d8d5; byte-identical there), named as the snapshot's source: 66 screens, `dash-home`, `dash-action`, `dash-project` registered; the one act still owed is `owed:passwordresetlink DEC-201`, registered once declared; DEC-217 took the owed mark off `projectaikeepaway` (now declared).
- **R32** Connect your Claude account version 3 from `a0fab7abf0` (identical at `f90b187c7b`), approved BOB 2026-10-14 under K2241; version 2 `updated`.
- **R33** `FRONT_DOORS` (and `FRONT_DOORS_SOURCE`) generated from `library.json`'s `doors` at `a0fab7abf0` (same at the head): problem, person, money, read, tip.
- **R34** `writingHelp`'s answer past every refusal (`ASSISTANT_DRAFT_UNAVAILABLE`) carries `untested` as `ai-runs.partAdmitted("draft:own_words")` answers it (K3143's reading). My fail-closed reading of "a read that throws": `ai-runs.partAdmitted` never throws (it answers `{admitted: false}` for a record it cannot read), so any answer other than "admitted" (with or without the label) answers `run-rules.untestedLabel("draft:own_words")` whenever `ai-runs.testInstance()` is true; nothing when the bar admits it or off a test instance. New edges `ai-runs` and (K3145) `run-rules`. **Uses line for the requirements:** `run-rules`: `untestedLabel` (its R29).
- **R36** Set up and claim and Publication ceremony version 3 from `f90b187c7b` (step 1 Workers Paid, step 14 `hostingaccessset`; steps 9–11 re-worded), approved BOB 2026-10-14 under K2241; versions 1 and 2 `updated`.
- `data.mjs` `adoptedLibrary` now chains adoptions (a script adopted twice keeps every earlier version); `doorsFromFile` new; `build-data.mjs` writes `front-doors.mjs` too.

**Read:** requirements and code whole (P20). Tests: `library.test.mjs`, `t47.test.mjs` (new) and the parts I changed read whole by me; the other twelve test files and `fixture.mjs`, and the used modules' Purposes and named services (plus `run-rules` R29), read whole by a helper in this session who wrote a digest citing each section (§17 (3); the set measured 763 KB).

**Flaws found in my module and fixed here (P8):** R34's fallback never fired against the real ai-runs (see above); `startFrom` dropped a required script from a door (R33 says only a script not offered is left out); `via.test.mjs`'s "at registration … until it returns" checked approval only: break and return at registration now tested.

**Deferred, with why:**
- `writingHelp` answers `AI_KEPT_AWAY` without a row when credentials cannot be reached (minted here, not at credentials' one site, credentials R35). Pre-existing; the row is credentials' and a fix needs BOB's ruling on what a fail-closed keep-away answers when credentials is unreachable.
- R24 item 3 reads a reason field by its name only (`/reason$/`); "any field the screen registry or the design stream marks a reason" has no such mark in `registry.json` yet.
- `fixture.mjs` `restart()` builds the object without `aiRuns` (test helper only; production goes through `wizardScriptsOf`).

**For BOB (requirements, other modules):**
- **R13 vs R20:** R13 carries every screen's `purpose`; the registry's `help-records` purpose names "the California Public Records Act" and "Oakland's faster request", which R20 forbids in this module's outward text. Carried as the file holds it; a design-stream wording or an R13 exception is BOB's.
- Requirements' Uses omits membership's `inSight`, `positionalMember`, `memberFacts`, `activeAdmins` (used since T31); R5 cites `record-grammar` R42 for `proposalLabel`'s `wizard` subject, which a helper reads as R45 — worth a check.
- **Reds my merge opens, each an L11 job's to clear (no wizard-scripts code):** `screens-intake` `common.test.mjs` R8 "capture draws monitorset" (DEC-200 (2)'s new act; T47-59 R16); `plane` `wizards.test.mjs` R19 "front: unlock" (the registry's new acts `unlock`, `passwordreset`, `passwordresetlink`, `grouplanguagesset`, `grouplogoset`, `monitorset` (capture, document), `drawquestion`, `projectbarset`, `signrequest` are not yet in op-declarations' `OPS`, so R13 rightly leaves them unregistered; clears at T47-53). No library step walks any of them: R14 passes in the real plane.

**Tests and checks:**
- `node --test bio-plane/test/m/wizard-scripts/`: tests 89, pass 89, fail 0.
- Users (P11), mine against the branch head: affordances 235/10 fail, op-declarations 144/12, answer-envelope 25/8, control-plane 235/7, plane (its own reds) — the same tests on both sides; queue-producers 74/0, instance-setup 157/0, store-door 45/0, interface-shell 63/0; new on mine only: screens-intake 41/1, plane R19 (both above).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio wizard-scripts`: 0 failures (after K3145). `checks/coverage.mjs bio wizard-scripts`: 36 of 36; 0 failures. `checks/ownership.mjs bio wizard-scripts tranche/T47`: 0 failures. `checks/run.mjs`: format 0, architecture 0, channels 0; coverage 25 failures, all other modules' not-yet-met ids (rule 5 (1)), none wizard-scripts'.

Size (session_01K69becYeJ3odGuKgqkxCtQ): test runs 14, module lines 2688

## J1 · QUESTION

Two readings I am building on; answer only if either is wrong.

1. **R34 (the `untested` label).** `writingHelp` itself answers no draft today: past every refusal it answers `ASSISTANT_DRAFT_UNAVAILABLE` (R27), and the draft is made and checked downstream (control-plane `draft.mjs`: `draftDue` → plane `draftOnObject` → `checkDraft`), which already passes the plane's `untested`. My reading: `writingHelp`'s answer past every refusal (today the `ASSISTANT_DRAFT_UNAVAILABLE` answer, the owner's "past every refusal" that the door turns into the draft) carries `untested`, read at the call from `aiRunsOf(host).partAdmitted("draft:own_words")` (`plane` `DRAFT_KIND_OF.writinghelp` is `own_words`), the label as given, never composed; nothing when the bar admits it or the instance is not a test instance; a read that throws answers `run-rules.untestedLabel("draft:own_words")` whenever `testInstance()` is `true`. No refusal carries it. The control is R34's: on a test instance with no own-words bar → `untested`; off one → none.
2. **R36 version numbers.** "Set up and claim" and "Publication ceremony" already carry version 2 (T37, from `e08cd35ecb`), so the newest at PR #33's head (`f90b187c7b`, merged as 6f0d88d8d5) is carried as **version 3** of each, version 2 `updated`; Connect's R32 version is 3 from `a0fab7abf0` (identical at `f90b187c7b`). The registry snapshot names `f90b187c7b` as its source (its `registry.json` is byte-identical on `tranche/T47`).

## J2 · QUESTION

Replaces nothing (J1 stands). **A second new edge for R34: `wizard-scripts` → `run-rules`.**

R34: "A read that throws answers the label whenever `ai-runs.testInstance()` answers `true`." When `partAdmitted` throws, the only label that is not composed here is `run-rules.untestedLabel("draft:own_words")` (its R29); `ai-runs` does not re-export it. So `index.mjs` imports `untestedLabel` from `run-rules/test-bar.mjs`, and `checks/architecture.mjs` reports that one failure (wizard-scripts does not declare `run-rules` in uses). Everything else is 0.

Options: (A) add `run-rules` (layer 6) to wizard-scripts' `uses` in `modules.json` with `ai-runs`, and a line in my requirements' Uses (`run-rules`: `untestedLabel`, its R29); (B) drop the throw clause and answer no label when the read throws (contradicts R34's last sentence). **Recommend A.** I am building on A; the rest of the job (R31–R36) is done and green (module 89/89), and I am now running the users' tests.
