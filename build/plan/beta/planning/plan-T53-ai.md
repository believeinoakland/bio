# T53's entries for the AI modules of layer 6 (and observation-log, layer 5) (PLANNING L47)

**Status** · Moved whole from `plan-T53-draft.md` at L47 to keep it under its cap (BOB #324); entries unchanged, in the plan's form. Each module's START carries its rows here verbatim (K5564, L37 R1). Detail: AI-DESIGN's drafts in `build/plan/lane-ai-design/` as each entry names; `FOLD-AI.md` for the layer-6 order and the retired ops.

## Layer 6

**run-rules**
- T53 · K5457 · the test bar read per AI and part: R19, R29, R30 amended; `GATE_PART_OF` and `gatePartOf` (R36); `PART_WITHDRAWN` (R37), per AI and naming it (A48) · `lane-ai-design/draft-run-rules.md` (the map, `draft:reading` → `draft`; FOLD-AI §1 decided) (AI1 answered B, K5475)

**ai-runs**
- T53 · K5457 (K2892 as K5457 reads it) · `principal_ai`; the account per act; Gate 1 per (entry, part) through `partAdmitted`; segments, labels, hops; pause and resume; a recipient notice holds the run; ops `aicontinue`, `aistop`, `aiwait`, `aiswitchaccount`, `aiwithout`, `aisend`, `aisendrefuse` · `lane-ai-design/draft-agent-run-path.md` (ai-runs R91-R97, R105 `aiwaitswitch` with `WAIT_THEN_SWITCH_CHOICES` set at START (K5489), and the amended; R75's `testBarRecord` gains `entry_id`, named in run-rules R19, A48) (AI-DESIGN READY and final, AD1-AD58) (AI1, AI3 answered, K5475, K5477)
- T53 · N1219, DEC-466 · `read` and `disagree` passed through (R99), `op=airunlog` (R100), segments as parts, hops and refusals recorded (R101, R102), `op=airunparts` "How this run went" (R103), the label names the AI, never the account (R104) · `lane-ai-design/draft-run-record.md`

**observation-log** (layer 5)
- T53 · N1219 · a run's log entry carries its reads and disagreements as data, with no sight of their own (R40, R41) · `lane-ai-design/draft-run-record.md`

**agent-harness**
- T53 · K5457 · `ROLE_NEEDS`, `needOf`, `partOf` over the six parts, `disclosureGate`, `resumeAt`; R17 moves with N1205 · `lane-ai-design/draft-agent-run-path.md` (agent-harness R20-R24)

**agent-model** (position 90, FOLD-AI §2.9)
- T53 · K5457 · first: the interface (`turn`, `converse`, `capabilities`, `estimate`, `health`) with the Anthropic adapter behind it, today's tests passing through `turn` (N1205's landing place) · `lane-ai-design/draft-agent-model.md` R1-R36, R43, R44, R54, R55
- T53 · K5457 · then the OpenAI-compatible adapter and host profiles (openrouter first, ai_gateway, workers_ai, custom), the served-host pin, the payer check, bounded retry and the circuit, `provider_limit` · `lane-ai-design/draft-agent-model.md` R37-R42, R45-R53 `[waits: live checks L2, L3]` (AI4 answered, K5478)

**agent-runner**
- T53 · K5457 · the Claude Code route retired in one change (R35, R42; RUNNER and REMOTE bindings off) · `lane-ai-design/draft-agent-runner.md` R13 `first: N1205's split`
- T53 · K5457 · the Gate 1 test container (distroless, `/run` only, the key in memory for one run, per-run egress, sealed capture, manifest before the bundle, three deployments) · `lane-ai-design/draft-agent-runner.md` R5-R16, R26, R29, R30, R33, R41, R43-R60 `[waits: the offline keys]`

**agent-steps**
- T53 · K5457 · the entry by need per conversation, Gate 1 per part before the first turn, `ai_stop` at a step boundary, a notice before a new recipient, `idem`, `produced_by` · `lane-ai-design/draft-agent-run-path.md` (agent-steps R50-R57)

**agent-worker**
- T53 · K5485 (AI2 A) · the beta offers every built part plus the intake interview, the case's account and charge-or-rule answers; investigate, extract and explore per AI behind their bars · K5485
- T53 · N1205 (K5457) · first: the split: `/signin`, its relay and REMOTE dispatch (R66, R67, R81-R85, R109, R111) to agent-model's adapter; `ai_account`; no credential in the Worker · `lane-ai-design/draft-agent-run-path.md` (agent-worker) `first: agent-model's interface`
- T53 · K5457 · each path takes its entry by need, refuses by name, labels every result, fails fast with three choices, turn-level progress, the sealed key by `aicredential` at the call · `lane-ai-design/draft-agent-run-path.md` R120-R127 (AI-DESIGN READY and final) (AI1 answered, K5475)

**ai-use**
- T53 · K5457 · the neutral usage record (provider-reported money apart from Civicsmith's estimate; never zero for the unmeasured); provider limits as limits reached; thresholds, alerts, reconciliation · `lane-ai-design/draft-ai-use.md` R1-R26
- T53 · K5459 · a paying team or project sees each member's use over thirty days; a personal subscription never · `lane-ai-design/draft-ai-use.md` R27
- T53 · K5480 · op `airetestset`, an administrator's switch turning re-testing off (R28) · `lane-ai-design/draft-ai-use.md` (A50)
- T53 · K5480, K5481, K5487 · re-testing capped monthly per AI with the switch (R28), administrators reminded while off (R29), lifecycle by Bob's standing rule (R30); opt-in health counts: `countHealth` (R31), `aihealthshare` off by default (R32), `healthReport` by day (R33), a personal subscription flagged and kept out (K5491) · `lane-ai-design/draft-ai-use.md`

**ai-gate** (new; after agent-worker; K5457)
- T53 · K5457 · the Gate 1 suite: signed bank and thresholds, items scored by code on a stub plane through agent-model, per-part verdicts, Wilson intervals, the gate record · `lane-ai-design/draft-ai-gate.md` R1-R40, R65, R66 `[waits: Bob's pass marks after the first measuring run, AD13, K5475]`
- T53 · K5457 · characterization and cost shown before a run, consent, canaries, the lifecycle signal · `lane-ai-design/draft-ai-gate.md` R41-R53 (AI6 A with an administrator's switch to turn re-testing off and a queue reminder while off, K5480; AI7 B, K5481) ; R52 asks `retestAllowed` before each canary (A50)
- T53 · K5457 · the results bundle and the library row, `partsRefused` · `lane-ai-design/draft-ai-gate.md` R54-R64 (AI8 as Bob amended it, K5482: the shared results page shows every tested AI; a team's results active six months, combined statistically) `[waits: ai-issuer]`
- T53 · K5482 · `combineResults`, Bob's "statistically joined", active six months (R67); R53, R63 amended · `lane-ai-design/draft-ai-gate.md`

N1258 and N829: the real public-matters set, when it exists, is a standing check that can switch a part off for an AI (K5475, supersedes N829's and K2479's gate for the beta); who writes the set is Bob's, later
