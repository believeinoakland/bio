# notice-producers (T36)

**Status** · session_014RE9GRKMXoXK4GGwKBuTgt · depth 2 · WORKING · handled B2

## J1 · QUESTION

R14's leaving rule cannot be read as written. `file-safety.threatOf` is `async` (it answers a Promise: `file-safety/index.mjs`:532, its `#grade` awaits archive reads), while `noticeItems` is synchronous and `queue` reads it synchronously (`queue/index.mjs`:897, its R51). No other file-safety service answers a file's hold synchronously: `verdictNotes` and `scanFindings` (R2, R15) carry no hold state, and `#holdOf`/`#openHolds` are private. So "leaves when ... `file-safety.threatOf` no longer answers the file under a scan hold that covers that finding" has no synchronous read in T36.

Options:
(a) T36: R14's item leaves when its recipient disposes of it; its leaving on release waits for a synchronous hold read in `file-safety` (a T37 entry beside N762's `since`, e.g. `scanFindings` answering each finding with `held` true or false: whether an open hold still covers that note's names). R14 is amended to say so, that clause marked not yet met (T37); `threatOf` dropped from R14's Uses for T36.
(b) notice-producers reads file-safety's `fs_holds` table directly: crosses file-safety's data; not recommended.
(c) `noticeItems` and queue's read become async: cascades through queue and its callers mid-L11; not recommended.

Recommendation (a). My best reading, on which I build now: (a). Everything else in R1, R13, R14, R15 I build as written.

## Completion (NOTICE-PRODUCERS #4)

**Entry applied: T36-32** (N707, N710, N741 shares; K1913, K1929, K2038, K2130, K2155).
- **R13 (T36):** `policyChanges` is read with `since`, the instant 90 days before the call (in ms; following R21 reads it to the whole second at or after), on every page; the window is no longer filtered from an unbounded read, so a change older than it is never read and never uses up the 1,000 bound. A `since_invalid` answer is a failure of `following` (named in `facts.failed`), never read as "no change".
- **R14 `scan-found`:** `file-safety.scanFindings` followed by its cursor (pages of 200, stopping on its `truncated`) to at most 1,000 findings as the viewer; one FINDING per `found` note, keyed `FINDING::scan-found::<captureSha>::<note_id>`, to this member while active (`membership.memberFacts`); a capture the viewer may not see is left out by file-safety and not counted. Subject the capture's home (`provenance.homeOf`), homed through queue's walk; detail: names with engine, tool and local day, each in `findingKind`'s words, the safe view open, the release rule ending "the machine never can"; no member named; no hint mark, no `label`. Per K2155 it leaves by disposal (queue's, by its key) in T36; its leaving once no hold covers the finding waits for N771 (T37), named in a `test.todo`.
- **R15 `security-tool-off`:** to an active administrator alone, `securityToolEvents` under the administrator's own viewer to at most 1,000 events; one FINDING per `switched_off` event (the only cause file-safety switches a tool off for is `PRIVATE_MODE_NOT_HONOURED`), keyed `FINDING::security-tool-off::<tool_id>::<at>`; subject the group's Civicsmith; detail names the tool (provider and tool id), the private-mode reason, and that it stays off until re-tested; no file, no member. It leaves when the tool is on again: a `test_passed` event after it, or `securityTools` answering it `on`. A refusal or throw of either read is `file-safety` in `facts.failed`.
- **R1:** items include R14's and R15's; `facts.scan_found` and `facts.security_tool_off` each `{bound: 1000, truncated}`; `failed` names `file-safety` and `provenance`.
- Uses: `fileSafety` and `provenance` deps added (lazy, as the others); `threatOf` not used (K2155). Fixture: stand-ins for both added to `NONE`, so other tests never reach the real file-safety (which would migrate its tables).

**Deferred:** R14's leaving when no open hold covers the finding: T37 (N771, K2155), `test.todo` in `files.test.mjs`. R14's bound cuts the newest findings past 1,000 (oldest-first cursor) until `scanFindings` gains `since` (N762, T37-28); stated in `facts`.

**Found in other modules (for BOB):**
1. `file-safety`: `scanFindings` and `securityToolEvents` never answer a null `cursor` (each answers the last seq, or `after` again, when nothing follows); a reader must stop on `truncated`. R15 and R31 state a cursor, not that `truncated` is the end. Worth a line in their requirements, or a null cursor at the end, with N771.
2. `file-safety` R31's event carries no reason; R15 reads `switched_off` as `PRIVATE_MODE_NOT_HONOURED` because `#switchOff` is called for that code alone (`file-safety/index.mjs`:1060, :1143, :1176, :1249). If another cause is ever added, the event should carry `off_reason`.
3. `queue` (6th) must catalogue `scan-found` and `security-tool-off` (T36-46) or its mint refuses them: queue's own tests pass today (127/0), since its fixtures do not produce these kinds.

**Reading set (N739):** read whole: my requirements (17 KB) and its amended R14; the draft's notice-producers section and "BOB's review"; layer 11's row of `build/layers.md`; the plan's rules at the opening and my entry; K2130, K2152, K2154, K2155's answer; my code (44 KB) and all nine test files (≈77 KB); `file-safety`'s public part whole (22 KB) and its code for the services I call; `following` R21, R16 and its `policyChanges` code; `provenance`'s Purpose and R4 `homeOf`. About 200 KB, under 300 KB. Not re-read: the Purposes and services of the other used modules (people, money-checks, duties, answers, inquiry, credentials, standards, membership, civil-time, jurisdictions, record-grammar), whose calls this entry does not change; none of my changes depends on them beyond `membership.memberFacts` and `activeAdmins`, already used by R12 and R13.

**Tests and checks:**
- `node --test bio-plane/test/m/notice-producers/`: 74 tests, 73 pass, 0 fail, 1 todo (R14, T37).
- Users: `bio-plane/test/m/queue/`: 127 pass, 0 fail. `bio-plane/test/m/plane/` with `conclude-project`, `docdates`, `system/migrate-released`: 133 tests, 131 pass, 2 fail (`plane/body.test.mjs`:25, :34), identical on `tranche/T36`'s tip: inherited red 27, not mine.
- `checks/format.mjs`: 135 modules, 134 requirements files; 0 failures. `checks/architecture.mjs … notice-producers`: 11 product files, 52 relative imports; 0 failures. `checks/coverage.mjs … notice-producers`: 15 of 15 live ids named by a test; 0 failures. `checks/ownership.mjs … notice-producers tranche/T36`: 6 files; 0 failures.

**P6:** 854 lines (code, own `paths`; was 715).

Size (session_014RE9GRKMXoXK4GGwKBuTgt): test runs 12, module lines 854
