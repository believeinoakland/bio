# AI-DESIGN's A43-A45 drafts folded (PLANNING L6)

**Status** · DECIDED by BOB #321 (L6, the K after K5463): §1 B with `draft:reading` → `draft`; §2 all as recommended, layer 6 re-cut so every use points earlier (positions in §2.9); §3 relayed to AI-DESIGN. PLANNING #2, 2026-10-27. AI-DESIGN's eleven READY drafts (on `lane/ai-design` at `09708874`: ai-catalogue, ai-accounts with credentials, ai-issuer, agent-model, agent-run-path, ai-gate, agent-runner, ai-use, run-rules, assistant-screens, ai-costs; NEXT-ENTRIES) were read whole by four Sonnet reading workers against `layers.md`, `modules.json`, the requirement files they amend and K5457. Their entries are in `plan-T53-draft.md` by layer. This file holds what the fold found: §1 a choice BOB must make, §2 order and `uses` (BOB's), §3 gaps and form defects (to AI-DESIGN through BOB), §4 points touching Bob's open AI1-AI10, §5 BOB's acts before each layer. No requirement id collides with a current file or with another lane's draft.

## 1. run-rules: what "the six-part TEST_BAR_PARTS delta" means (BOB's; lower-level)

K5457 says run-rules "gains the six-part TEST_BAR_PARTS delta (owed by PLANNING)"; AI-DESIGN then drafted it (A44, `draft-run-rules.md`). The lane's drafts read it two ways:
- **A** · `TEST_BAR_PARTS` becomes the six ids (`ask`, `draft`, `read`, `transcribe`, `run`, `account`): `draft-ai-gate.md` Terms ("the list `run-rules` `TEST_BAR_PARTS` equals"), `draft-ai-catalogue.md` For BOB 5, `draft-agent-run-path.md` agent-harness R21 (`partOf` equal to `TEST_BAR_PARTS` both ways).
- **B** · `TEST_BAR_PARTS` keeps its fine names (each mode, each draft kind, `transcribe`, the explorer's use) and the bar is read per entry through a map `GATE_PART_OF` (R36): `draft-run-rules.md` itself.

A breaks every line that keys a deploy flag to a fine part (run-rules R14, R16, R21, R24, R27, R29's tests, R33's `draft:reading`); B leaves them standing. **Recommend B**, with ai-gate's Terms, the catalogue's For BOB 5 and agent-harness R21 re-worded to "the six gate parts, `GATE_PART_OF`'s values". Also in R36: "`draft` for every draft kind" and "`read` for reading" both claim `draft:reading`; recommend `draft:reading` → `draft` (it is a draft kind, R33) and `read` for the mode `extract` and the reading part only.

## 2. Order and `uses` (BOB's, P4)

1. **ai-use uses agent-model** (R3, R10, R18), but ai-use is earlier in layer 6. Recommend moving agent-model before ai-use (it uses neither); else ai-use takes the usage record handed in.
2. **agent-harness R20** checks `ROLE_NEEDS` against agent-model's capability names, and the harness is before agent-model: the names live in the harness as a constant, agent-model's `capabilities` tested equal to it.
3. **agent-model's `uses`**: `modules.json` has only `setup-words`; add `runtime-limits` (its file already names it), `ai-catalogue`, `ai-accounts`, and `agent-harness` (R1's test calls `needOf`).
4. **ai-runs reads ai-gate's verdicts** (R78), and ai-gate is later in layer 6. ai-gate cannot move earlier (its scorer runs through agent-model). ai-gate's own R37 calls the gate record one "that `ai-runs` R75 writes". **Recommend** the gate record stays an extended `ai-runs` R75 record in ai-runs' table: ai-gate computes the verdict and writes it through ai-runs' service, and ai-runs hands the records to `run-rules` as `held.gateRecords`. No upward edge results. The drafts do not say this outright; BOB to confirm.
5. **ai-gate R26** names `conformance` (layer 9) as a scorer source: forbidden from layer 6. Recommend the scorer's conformance items are data in the signed bank, not an import. ai-gate's `uses` also lacks `observation-log` and `answers`, which its lines call.
6. **ai-accounts R45, R47, R59** reach `notice-producers` (layer 11) from layer 2: a registration, as other layer-2 producers do.
7. **agent-runner** moves after ai-gate (it is ai-gate's container); the `agent-worker` → `agent-runner` edge comes off.
8. **The retired ops and service names** (ai-accounts' twelve) are still named in sixteen modules: op-declarations, op-grades, admission, store-door, store-request, store-assembly, control-plane, interface-shell, signin-door, screens-settings, screens-entry, screens-inquiry, screens-daily, wizard-scripts, affordances, journey-check. Each of those layer-11 jobs takes the re-pointing as a CHANGE in the same round (no aliases, ai-accounts For BOB 6); the plan names it in each job's START.
9. **Layer 6's positions** (accepted by BOB, L7; he writes `modules.json` at plan time): after contradiction (87): 88 run-rules, 89 agent-harness, 90 agent-model, 91 ai-use, 92 ai-runs, 93 run-productions, 94 capture-requests, 95 reading-guides, 96 skills, 97 question-explorer, 98 answers, 99 agent-steps, 100 agent-worker, 101 ai-gate, 102 agent-runner; then layer 7 as today. Checked against each module's `uses` in `modules.json` plus the drafts' additions: agent-harness uses run-rules and observation-log; agent-model uses agent-harness and layer 1-2 modules; ai-use uses agent-model; ai-runs uses ai-use; ai-gate uses answers, ai-runs, agent-model, run-rules, observation-log; agent-runner is used by none once agent-worker's edge comes off. If ai-gate needs agent-steps or agent-worker it already follows them.

## 3. Gaps and form defects (to AI-DESIGN through BOB)

- **`aicredential`**: no owner, grade, rung or budget class; it is the one read that answers a sealed key. Recommend owner `ai-accounts`, served only to the agent Worker's principal for the act's own account, on `AI_GRANT_OPS` and `PLANE_OPS`, never a model tool, never logged.
- **The Worker reaching `ai-accounts.gatewayServedCheck` and `accountCredentialFailed`** (agent-model R47, R50): no op is named. Recommend two plane ops.
- **The readiness read** ai-runs R95 and R97 use (agent-model's `health` over the Worker) is unnamed, and no `scheduler` line is drafted.
- **One refusal, two names**: `PAYER_NOT_VERIFIED` (agent-model) and `GATEWAY_KEY_NOT_USED` (ai-accounts). Recommend one.
- **Missing ops**: an administrator's act clearing a payer-mismatch flag (AI4); the replacement of interface-shell R20's reachable rule; `aiusebymember` (U7, K5459) is outside the screens draft's §4 table.
- **No retirement list** of the alpha's AI ops and screens in one place (the screens draft retires `connect`, `teamai`, `projectai`; ai-accounts twelve ops).
- **Grades**: `aitermsaccept` and `aipersonalchoose` are "reasoned" but ask no reason; recommend reversible.
- **signatures R49-R53** are listed, not written as lines, and share numbers with ai-catalogue's own R49-R53; the issuer's R12 needs a run-key check no signatures line covers.
- **ai-catalogue R25** (an omitted entry reads as retired) contradicts its R24 and R27; **ai-issuer R7**'s five advisory triggers differ from the catalogue's advisory reasons (`health`, `other`); the catalogue ties "instance-setup near its limit" to N1205, which is the agent-worker split.
- **Form**: no AI-DESIGN line carries the house prefix `(T53; source; amends …)`; ai-accounts R63, R64 and many amended lines have no Test; retry, breaker and other numbers sit inside lines though K5457 sets every number at the job's START (move them to Suggestions as "set at START"); credentials' delta counts five amendments and has six (R48).
- **Budget classes**: three AI ops need PLATFORM's "AI act" class (P1, open), and the long Gate 1 run a second, longer class, since PL2 allows overrides only downward.

## 4. Points touching Bob's open questions (AI1-AI10; for BOB's page, no new question)

- **Retention**: ai-issuer R18 keeps sealed bundles 180 days (a K5457 number); AI8 (c) recommends "while the AI is listed, plus one year". The number follows Bob's AI8 answer.
- **N1258 and AI1** (Bob answered B, K5475: N1258's text is amended accordingly when BOB writes it): N1258 says "tested before the beta against real questions"; AI1's option B admits a part by Gate 1 and keeps the real set as the standing measure. If Bob answers B, N1258's text is amended to say so.
- **AI2 and Gate 1**: AI2 admits investigate, extract and explore per AI; Gate 1 verdicts are per part. Under B, AI2's answer is read through `GATE_PART_OF`.
- Lines waiting: AI1 (run-rules R19, R37; agent-worker R121; ai-runs R40, R78; ai-gate), AI3 (ai-runs R94), AI4 (agent-model R47), AI6-AI7 (ai-gate R41-R53), AI8 (ai-gate R54-R64, ai-issuer R18), AI10 (agent-model R5, R13, R34, R50-R53; agent-worker R124; ai-runs R95).
- **`next.md`**: N1105 closed, N1198 generalised (ai-catalogue, ai-accounts), N1199 and N1276 retired, N842, N1200, N1219 into their modules, N1258 the standing measure (R2), N829 (the real-matters set) outside the product with its hard reason (the set is Civicsmith's data, gathered, not built).

## 5. BOB's acts before a layer's START

Before layer 1: signatures' lines written. Before layer 2: `modules.json` and `layers.md` rows for ai-catalogue (layer 2, before ai-accounts), ai-gate (layer 6), ai-issuer (layer 11) (K5457 decided them); `MODULE_ORDER` follows (member-roster R61); the catalogue key ceremony and the seed signed; the seal key pair made (issuer custody (b)). Before layer 6: N1205's split ordered first inside agent-model and agent-worker; the `principal_claude` → `principal_ai` rename and its consumers (capture-requests, screens-inquiry); the bundler change in the same deploy as `deleted_classes`. Before layer 11: ai-issuer deployed to account `20b533579290b9b93168345edd3b7f72` only; the image digest registered; PLATFORM's AI act class. After the first measuring run: Bob's floors (AD13) before any part reaches members.
