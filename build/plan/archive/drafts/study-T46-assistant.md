# Study · T46 assistant: which modes can work on biosmoke7 (doubts 9, 10)

Read whole: the requirement and plan files named in the brief, `run-rules/deployment.mjs`, and the code cited inline.

**New finding (decides `check`).** The plane calls `agent-worker /run` from one place only: the wake (`ai-runs/index.mjs`:1892 → :2051, R16, R18). That wake needs three things: a capture completion; a run opened by the instance's *organisation* credential; and principal stamps that are equal. A run a member opens is withheld as `MEMBER_PRINCIPAL_RUN` (:1993). No door starts a run's first segment for a member. So no mode that runs as a run (check, investigate, extract, plan, explore and `openMany`) is served end to end from a member's act, whatever its flag says.

## 1. Each mode or door

| part | served end to end today? | gate | missing on biosmoke7 under the exception | class |
|---|---|---|---|---|
| ask | Yes: `op=ask` → `askOnObject` (`plane/ask.mjs`:79) → `/ask` (aw R54) → streamed answer, use counted | `ASK_MODE.deployed` false (deployment.mjs:159), unread; no bar | T46-9/-10/-48 (flag `true`, `partAdmitted`, label); suggestions mismatch on a sign-in (ask.mjs:108 sends the reference's switch; aw R6 refuses `BAD_ACCOUNT`): T46-14 R6, T46-48 R33 | (a) |
| draft (own_words, translation) | Yes: control-plane R57 `draftDue` (`DRAFT_OPS` draft.mjs:14) → `draftOnObject` → `/draft` (R59, R68) → checked, counted | `DRAFT_MODE.deployed` false (:249), unread | same as ask | (a) |
| check | No. The open lands (C-109.1 passes on the exception), but nothing dispatches a member's run. The org-credential path is reached only through a capture wake | chain index 0; harness `MODES.check.deployed: true`; bar at ai-runs :996 | ai-runs R18 amended plus a door op ("continue my run", member's account and credential) in control-plane, or the org-credential opener as a BOB act; plus a screen to open a run | (c) member-run dispatch (ai-runs, control-plane) |
| transcribe | Yes on an API key: `plane/transcribe.mjs`:109 → `/transcribe` R72 → extraction R71 | bar at transcribe.mjs:132 (`TRANSCRIBE_NOT_DEPLOYED`) | a sign-in is refused (`TRANSCRIBE_NEEDS_API_KEY`, aw R72): T46-13/-14 (N852); label T46-7, -48; capture with upload (T46-44) | (b) agent-runner + agent-worker, in plan |
| plan | No. plan-work R10 opens a re-examination run (:864) and `action-plans` R30 registers the check, but nothing dispatches it, as for check | `deploys_apart.plan` false (:115) and harness `MODES.plan` false (:218), one reviewed act (aw R53) | the flag (run-rules R14 + agent-harness) and the same member-run dispatch | (c) as check |
| enquire | No agent-worker task (`SURFACE`, aw index.mjs:288), no door, no op | `ENQUIRE_MODE.deployed` false | N842: an `/enquire` task, door, op and screen | (c) N842 |
| action_drafts (textcheck, infractiondraft, bearingdraft) | Worker only: aw R76 (`action-drafts.mjs`). No op is declared or routed. The `action_drafting` pack layer stays absent until affordances publishes the acts (skilldoctrine :1776), so `/draft` answers `PACK_UNDETERMINED` | `action_drafts` false; `draftKindDeployed` read by no one | ops (op-declarations), `DRAFT_OPS` and record assembly per K2824 (control-plane), catalogue acts (affordances), the flag. T46-47 routes `textcheck` only | textcheck (b) control-plane/op-declarations/affordances + flag; the other two (c) |
| investigate | No: needs check's verification recorded (`deployable`), `DEPLOYMENT_SEQUENCE.verification_recorded` edited (:101; `DEPLOYED_MODES` reads the constant, not the record) and harness `MODES.investigate` | chain | check end to end first, then a live run verified (`op=airunverify`) and the reviewed edit; explorer (T46-12) follows | (c) check's dispatch |
| extract | No: after investigate in the chain; harness `MODES.extract` false | chain | as investigate, plus investigate verified | (c) |

**Net:** the ask and the drafts work once the exception lands; so does transcription, if N852 merges. `check` is not reachable by Bob in T46 unless a member-run dispatch is added. That is not in the draft plan; trial §1.3 overstates it. Setting the `plan`, `enquire` or `action_drafts` flags alone serves nothing: each lacks a door or a dispatcher.

## 2. N881's status report: the minimum text

**Collision:** `statusreportdraft` is already plan-work's op for R8's system list (plan-work :1153). The assistant arm needs its own op.

- **credentials (L2, 36):** no change. The draft reads nothing through a grant. The door hands it R7's items, as translation (K2201) and K2824 do. `AI_GRANT_OPS` has no plan op and gains none.
- **run-rules (L6, 81):** R27 amended: `DRAFT_KINDS` gains `statusreport`. Its `DRAFT_REACH` is `none` ("only the items `plan-work` R8 assembled, handed in by the door"), and `draftMayRead` is false for it. The flag needs a choice. Recommended: `draft`'s own flag, as for R25's kinds (it reads nothing, as translation does). The alternative is `action_drafts`, which blocks it with the other three. The test-bar part is `draft:statusreport` (TEST_BAR_PARTS follows `DRAFT_KINDS`).
- **skills (L6, 87):** the `action_drafting` layer (R45) names the act, or the worker's own words carry the instruction (BOB's at the fold).
- **agent-worker (L6, 93):** R76's fourth task, `{op: "statusreportdraft", plan, items}` → `{text, sources}`. Each sentence comes from a handed item. `grant` present is `DRAFT_READ_NOT_ALLOWED`. R77's injection rule and fixtures apply. R79's `untested` label applies.
- **plan-work (L9, 127):** R8's arm, a new op `statusreportassist`. Past sight it answers `ASSISTANT_DRAFT_UNAVAILABLE` carrying R8's items (the `draftDue` pattern). `statusReportSave`'s `from` records that the text began as a labelled machine draft. **No edge to run-rules** (the door gates).
- **op-grades (133):** grade `statusreportassist`.
- **op-declarations (144):** `statusreportassist: "ownread"` in plan-work's spec.
- **control-plane (148):** R57: `DRAFT_OPS` gains `statusreportassist`, and `draftAsk` hands over the owner's items (the translation arm's form).
- **plane (149):** R40: `partAdmitted("draft:statusreport")` and keep-away (`aiKeptAway` with the plan's project) before any account is read. Use is counted as `draft`.
