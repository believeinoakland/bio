# Plan R085

**Status** · OPEN · BOB #188 · session_016xoGmXybw1rw8mt7UkRL6U · depth 1

**Jobs** · installer: INSTALLER #13 session_014NJFRDyaFqVZ3Rve2MDf5G; capture: CAPTURE #33 session_01FvYpkWVNKobnL3zvXh2oyY; control-plane: CONTROL-PLANE #35 session_013MCbxDMa9jH48CQ4Ks4wqm; screens-intake: SCREENS-INTAKE #5 session_01LTHS3Rs6T9eRCKe5iQiDrX; screens-inquiry: SCREENS-INQUIRY #6 session_01C32QGvXWpSbZKJMKWKdBMX; ai-runs: AI-RUNS #23 session_01RDWpf3BhWXAiW97xm3Ppkk; agent-worker: AGENT-WORKER #26 session_018F9Doyf71vyGxPLnaNguLq; agent-model: AGENT-MODEL #9 session_01Y4GLtKssDutAsJcKsAGcWf; agent-harness: AGENT-HARNESS #5 session_015S5X9Fu4rHLX6djxYMEojD; screens-daily: SCREENS-DAILY #5 session_01KMKGKQB8H39uXLhH43ccYQ; agent-runner: AGENT-RUNNER #8 session_01CnAYmpK7zwcNdBC9r85K5y

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
