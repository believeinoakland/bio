# leg-earning (T51)

**Status** · session_01RTtq97ZaJKFYsmuNFMRacD · depth 2 · COMPLETE · handled B1

## J1 · REPORT

One sentence for BOB to settle (not a finding in my module, not converted).

The words row `leg-earning.ceiling.grade_reachable_capture` in `docs/development/ux-substrate/screens/words.json` is a different sentence from the code's ceiling sentence. The code's sentence (`leg-earning.index.grade_unreachable_capture_grade_is`, and `_2` at the standard site) ends "...does not claim (CAPTURE-FIDELITY.md)." and fills `{UNREACHABLE_CAPTURE_GRADE}`; the design row ends "...does not claim." and uses `{unreachable_capture_grade}`. The rule (K3930 (d)) converts only a sentence equal to its row, so the code keeps its own localize text. Both code ids answer their code text while the row is not matched.

Decision for BOB: if the design's wording is the one to ship, the two localize sites become `word("leg-earning.ceiling.grade_reachable_capture", { unreachable_capture_grade: ... })` and the words test follows. If the code's wording stands, the design row is the one that should change. Until then the ceiling reads the code's text.

## J2 · COMPLETE

## T51-217 · leg-earning (words, the nine findings)

Commit `f98173a2e0` on `job/T51/leg-earning` (merged `tranche/T51` first, `899eadbeb7`; no rebase).

**Entries applied.** All nine findings in `build/plan/words-pass/leg-earning.md` are fixed by the words rule.
- `index.mjs`, inline 759–768: the fidelity-bound sentence, a template literal with `${captureWord}` and `${e.bound}`, becomes `localize("leg-earning.index.fidelity_bound_bytes_fetched", …)` with its vars.
- `index.mjs`, plain 715: the served-route `empty_level` becomes `localize("leg-earning.index.capture_route_no_ruling", …)`.
- `index.mjs`, plain 821 and inline 821: the AI-passage `empty_level` becomes `localize("leg-earning.index.passage_ai_reading_member_check", …)` as one sentence (it was split across two literals).
- `index.mjs`, plain 156: the `writeBasis` refusal `detail` becomes `localize("leg-earning.index.write_basis_requires_bundle_id", …)`. A refusal's `detail` is in R13's scope, so it is converted, not reported.
- `index.mjs`, not in the findings: the unmeasured-fidelity `empty_level` (the punctuated sentence at 725–727, split across three literals) becomes `localize("leg-earning.index.transcription_fidelity_unmeasured", …)`. A member is told this empty level so they can go and get it, so it is read under R13.
- `test/m/leg-earning/words.test.mjs`, testcopy 14–15, 30, 38–39 and the rest: the test holds no sentence text. Each capture `why` is compared to `word("leg-earning.capture_word")`, `word("leg-earning.why.strongest_capture_grade")` and `word("leg-earning.why.strongest_route_group")`; the fidelity bound and each ceiling are compared to `localize` with its own literal id and en. R1 and R8 keep their titles and what they check.

**Deferred.** None.

**Found elsewhere.** The wording of the ceiling sentence differs from its design row. See the REPORT just before this entry. No other module is affected by this job's changes.

**Tests and checks** (run on the bio tree at `f98173a2e0`).
- `node --test bio-plane/test/m/leg-earning/*.test.mjs`: 0 failures across all nine suites, including `words.test.mjs`.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 5925 of 6062 live ids named (28 failures, none in leg-earning); words 3355 failures, none in leg-earning (those are other modules' findings).
- `node checks/coverage.mjs /home/user/bio leg-earning`: 16 of 16 live ids named by a test, 0 failures.
- `node checks/architecture.mjs /home/user/bio leg-earning`: 0 failures.
- `node checks/words.mjs /home/user/bio`: no finding under `leg-earning`.
- `node bio-plane/src/setup-words/build.mjs --check`: only the stale-rows note (`rows.mjs` is stale: the new code rows are for BOB to regenerate at the layer close); no refusal naming leg-earning.
- `node checks/ownership.mjs /home/user/bio leg-earning tranche/T51 job/T51/leg-earning`: 3 files changed by leg-earning, 0 failures.

Size (session_01RTtq97ZaJKFYsmuNFMRacD): test runs 2, module lines 1387
