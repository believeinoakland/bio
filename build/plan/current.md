# Plan R085

**Status** · OPEN · BOB #190 · session_01HqQ2d1HjF7g1iniy8y5mNx · depth 1

**Jobs** · installer: INSTALLER #13 session_014NJFRDyaFqVZ3Rve2MDf5G; capture: CAPTURE #33 session_01FvYpkWVNKobnL3zvXh2oyY; control-plane: CONTROL-PLANE #35 session_013MCbxDMa9jH48CQ4Ks4wqm; screens-intake: SCREENS-INTAKE #5 session_01LTHS3Rs6T9eRCKe5iQiDrX; screens-daily: SCREENS-DAILY #5 session_01KMKGKQB8H39uXLhH43ccYQ; agent-runner: AGENT-RUNNER #8 session_01CnAYmpK7zwcNdBC9r85K5y; observation-log: OBSERVATION-LOG #13 session_01SJrWSUDWk4ygPEnF4edtGH; ai-runs: AI-RUNS #24 session_014E6HztL3Ehb1nLBpG9td7t; agent-model: AGENT-MODEL #10 session_01QxtF2G4H6Q337jE4Ti6TBN; machinery-producers: MACHINERY-PRODUCERS #4 session_01WdZWF2N7iamL2RKVC1vFPM; query-language: QUERY-LANGUAGE #8 session_01DiiUVwjsM1J2yZP34YaftH; agent-worker: AGENT-WORKER #28 session_01UDzBRUVhc41T5zHi38Bjvf; agent-harness: AGENT-HARNESS #7 session_013YmnX8vmq9VJkF9WjDtBtS; screens-inquiry: SCREENS-INQUIRY #8 session_01XMC7d8bfcv7DEh1in4Bov7

**Adopted** · K3441 (Bob's "A" to K3440): a one-job release fix on the 0.85.0 cut, outside the tranche order (K1548: an out-of-layer job, Bob's approval this once, no precedent). Branch `tranche/R085` from `dist/cut-0.85.0` @ 1053faa726; its job merges into `tranche/R085`, which is then merged into `dist/cut-0.85.0` (the cut reaches `main` through T50, K2273). Legacy census: none touched (no legacy module has an entry; each stays as `next.md` and T50's draft say).

## L11

- **R085-1 · installer** · (N1149, K3440) R33 as amended: the read-back hashes the script's part as downloaded bytes and the install and update keep within a Worker's 128 MB at the release's real size · req: R33 amended · claude-sonnet-5-5.

- **R085-2 · agent-runner** · (N1155, K3450) R18 as amended: the code, then its line end as a separate keystroke · req: R18 amended · claude-sonnet-5-5. Out-of-layer, covered by Bob's approval of fixes on the cut until the sign-in works (K3450).

## Fix round 2 (K3477; WALK-085 F1, F2; N1161's blockers), out of layer on the cut

All six run at once (out-of-layer on the cut, K1548; Bob's standing permission K3466). Merge order: capture, then control-plane and screens-intake; ai-runs before agent-worker where both are complete; screens-inquiry any time.

- **R085-3 · capture** · R92 (an upload's declared text type profiles it from text) · claude-sonnet-5-5.
- **R085-4 · control-plane** · R100 (the upload's type passed on; an upload read as an acquire is) · claude-sonnet-5-5.
- **R085-5 · screens-intake** · R27 (the upload sends `file.type`) · claude-haiku-5-5.
- **R085-6 · screens-inquiry** · R45 (the question's run: drawn at once, seen to move, its end stated) · claude-sonnet-5-5.
- **R085-7 · ai-runs** · R82 (dispatch waits only for acceptance), R83 (10-minute lease), R84 (segment ends logged; a stopped segment continued; an error ends the run) · claude-sonnet-5-5.
- **R085-8 · agent-worker** · R91 (a segment outlives its caller and reports its end), R92 (tick entries and reports reach the log; the `REPORT_UNLOCATED` cause) · default model (a durable segment driver and an unknown cause).

## Fix round 3 (K3486, K3489; the run's length and Find), out of layer on the cut

All four run at once (out of layer on the cut, K1548; Bob's standing permission K3466, as round 2). Merge order: agent-harness and agent-model before agent-worker (R94 uses agent-model R18 and agent-harness R11); screens-daily any time.

- **R085-9 · agent-worker** · R93 (`segment_end` sent after the segment is marked not running), R94 (a refused report handed back once through `checkFinal`), R95 (sub-sessions pass `role: "subsession"`) · claude-sonnet-5-5.
- **R085-10 · agent-model** · R17 (the `report` tool states its bounds; `condition` an enum of the contract's conditions), R18 (`converse`'s `checkFinal`: one hand-back), R19 (Bob's K3490: Sonnet 5.5 sub-sessions at `low`, Opus 5.5 elsewhere at `medium`) · claude-sonnet-5-5.
- **R085-11 · agent-harness** · R11 (the contract's `returns.conditions`) · claude-haiku-5-5.
- **R085-12 · screens-daily** · R35 (Find's words also match held documents' passages) · claude-haiku-5-5.
- **R085-13 · agent-runner** · R32 (a request's `effort` reaches the SDK's options; K3490) · claude-haiku-5-5. Its image is rebuilt by `agent-runner-image.yml` and reaches biosmoke8 at the round's deploy.

## Fix round 4 (K3501; the check's sub-sessions blind to the question's document), out of layer on the cut

All seven run at once (out of layer on the cut, K1548 read as covered by Bob's K3466, as rounds 2 and 3). The diagnosis is `build/plan/diag-085-r4.md`. Merge order: observation-log, ai-runs, agent-harness and agent-model before agent-worker (R97 uses agent-harness R12 and ai-runs R85's payload, R98 uses agent-model R21); machinery-producers and screens-inquiry any time. DEC-283 (Settings › The assistant) is not in this round: its words exist only in the design's `words.json`, whose merge onto the cut would also bring T50's rewording (K3472); it stays first among T50's screens jobs (N1158).

- **R085-14 · observation-log** · R38 (a `text` capture has a unit arm; C5) · claude-haiku-5-5.
- **R085-15 · ai-runs** · R85 (the search half carries the context's subjects; C3), R86 (an inquiry in a project takes the project's bar; DEC-17) · claude-sonnet-5-5.
- **R085-16 · agent-harness** · R12 (the contract's `subjects` and `arms`) · claude-haiku-5-5.
- **R085-17 · agent-model** · R20 (the `meaningrows` tool: arms, `passage:`, `id:`, `ids`), R21 (`converse` answers its model and effort) · claude-sonnet-5-5.
- **R085-18 · agent-worker** · R96 (forward `ids`), R97 (contracts carry subjects, targets and arms), R98 (each usage entry's real model), R99 (wallclock measured), R100 (a cited address with an extent resolves to its record) · claude-sonnet-5-5.
- **R085-19 · machinery-producers** · R14 (no "capture finished" item for a record holding no capture) · claude-haiku-5-5.
- **R085-20 · screens-inquiry** · R46 (the founder drawn by handle) · claude-haiku-5-5.

## Fix round 5 (K3510; passage reads with bare words, and the run shown on the question), out of layer on the cut

All five run at once (out of layer on the cut, K1548 read as covered by Bob's K3466, as rounds 2–4). The diagnosis is `build/plan/diag-085-r5.md`. Merge order: query-language and agent-harness before agent-worker (its bundle takes both); screens-inquiry and control-plane any time. Not in the round, each with its hard reason: the dock's pass, level and cost (words missing, K3366; the cost is DEC-296's, T50, N1167); a `level-empty` proposal drawn by key (its sentence is missing from `words.json`); a backfill of pre-R38 captures' index state (only biosmoke8's trial capture is affected; the walk uses a fresh capture); `airunopen`'s project-gate wording (a permitting ground, not a bug); `/app/ai-session/<run>` (a legacy-interface registry entry, no requirement asks for it).

- **R085-21 · query-language** · R31 (bare words under `rows=passage` read as passage words) · claude-sonnet-5-5.
- **R085-22 · agent-worker** · R101 (a dedup drop is logged), R102 (`¶` ends a cited record id) · claude-sonnet-5-5.
- **R085-23 · agent-harness** · R13 (an empty-level description names "this question") · claude-haiku-5-5.
- **R085-24 · screens-inquiry** · R47 (the question page draws its run beside waiting proposals), R48 (the dock draws the latest ended run) · claude-sonnet-5-5.
- **R085-25 · control-plane** · R101 (`/favicon.ico` answers 204) · claude-haiku-5-5.
