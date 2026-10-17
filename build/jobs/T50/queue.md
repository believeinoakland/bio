# queue (T50)

**Status** · session_016Aha62MHvicFq7HrjZjQZz · depth 2 · COMPLETE · handled B1

## Job record

**Entry** · T50-21 · queue · R55 (the muted list), R56 (every item names its subject's title), R57 (the new kinds), plan rule 6.

### Entries applied

- **R55** `queueFeed({muted: true})` (`op=queue&muted=true`; the door and `queueOps` pass it, `queueAnswer` returns the list as it is) answers `{ok, muted, count}`: one row per kind muted in a case (`{kind, case: {id, title}, at}`), one per muted item (`{item, class, at}`), newest first by the instant as a time, the undated after them. The kind's instant is new storage beside the kind set: `queue_state.muted_at`, a JSON object kind to instant (column in `QUEUE_SCHEMA`, added by `migrate()` to a table made without it); `queueMute`'s case form writes it when a kind is added, keeps the first instant of a kind muted again, drops it with the kind, and a mute made before it was kept answers `at: null`, never back-filled. The unmute is the existing `queuemute` with `unmute`. No member, or none muted: `muted: []`.
- **R56** `subject.title` at the mint for every item whatever its producer (and for a task's `{kind: "bundle", id}`): the bundle's title when the viewer may see it (`viewerPredicate`, one read per id), else `null`; the key is always present.
- **R57** `project-invitation`, `project-request` (OBLIGATIONs) and `watched-changed` (FINDING) catalogued with their sentences; doors `projectjoin`, `projectrequestanswer` (R12, R28's bridge, the door details); `watched-changed` told to its watcher alone (`available: false`, `scope: null`, `instead: queuemute`); the two OBLIGATIONs are refused `KIND_NOT_PERSONAL`.
- **Plan rule 6.** The seven refusal translations (`checks.mjs`) are read by key (`word("refusal.<CODE>")`), the class labels (`mark.kind.todo.name`, `.noticed.name`, `.status.name`) and the lead's set-aside label (`queue.label.set_aside_project`) likewise; "labelled" is "labeled" and "group" is "team" in the catalogue's sentences (`queuestate.mjs`). Tests that compared those sentences were respelled.

### Rulings made in the job (for BOB to fold into R55)

1. A muted row whose case the viewer may no longer see is left out and not counted (R33); the member cannot see what it would have unmuted.
2. The muted list takes neither `sort` nor `limit`, and is answered before either is read.
3. A kind muted again keeps the instant of its first mute; muting it afresh after an unmute dates it by that mute.
4. The instant is a column of `queue_state` (no fourth table, so R36 and R42 stand).

### Deferred

Nothing.

### Found in another module

- **answer-envelope R7's pins** (T50-25): two of queue's refusals now read different words from before (they read `words.json`): C-33.27 `KIND_NOT_PERSONAL` ("the group" is "the team") and C-33.50 `NO_PROJECT_SCOPE` ("no team's list" is "no project's list"); the other five are word for word the old ones. Their pins in `answer-envelope` are by hash and stay red until re-pinned to `refusal.KIND_NOT_PERSONAL` and `refusal.NO_PROJECT_SCOPE`. That job merges before this one (L11 order), so the order of the re-pin is BOB's.
- **Catalogue sentences** (`QUEUE_OBLIGATION_KINDS`, `QUEUE_FINDING_KINDS`, `QUEUE_CONDITION_KINDS`) are developer-facing ("(op=…) — LIVE: …"), published to `op=affordances` as vocabularies; no screen draws them (the shell draws `queue.<kind>.summary` and `.detail`). They stay inline; a REPORT asks whether the design lane wants them keyed.
- **queue-producers R41, R42 and notice-producers R24** are not on this branch yet: the three new kinds are catalogued and tested against stub producers; the real items pass the mint as soon as those jobs merge.

### Tests and checks

- `node --test bio-plane/test/m/queue/`: tests 164, pass 164, fail 0 (153 before, 11 new in `t50.test.mjs`: R55 ×6, R56, R57 ×4); `conclude-project.test.mjs` pass 1.
- Users of queue, run: answer-envelope 40 tests, 3 fail (the same 3 fail on the branch before this job; the pins above add two codes to the first); store-door 48, 1 fail (R15 `reauthdue`, not queue's); plane 251, 8 fail (project-roster, capture drain, public-read, case-inputs routes: none names queue); `migrate-released.test.mjs` fail after 538 s (boots the generated plane bundle, which this job does not touch).
- `checks/format.mjs bio`: 171 modules, 170 requirements files; 0 failures. `checks/architecture.mjs bio queue`: 32 product files, 97 relative imports; 0 failures. `checks/coverage.mjs bio queue`: 47 of 47 live requirement ids named by a test; 0 failures. `checks/ownership.mjs bio queue tranche/T50`: see the line below.

Size (session_016Aha62MHvicFq7HrjZjQZz): test runs 9, module lines 3214

## J1 · REPORT

Found outside queue (T50-21; details in my record):
1. answer-envelope R7's hash pins: queue's C-33.27 KIND_NOT_PERSONAL and C-33.50 NO_PROJECT_SCOPE now read refusal.KIND_NOT_PERSONAL / refusal.NO_PROJECT_SCOPE from words.json, whose sentences differ from the old inline ones ("group" is "team"; "no team's list" is "no project's list"). The other five queue refusals are word for word unchanged. The two pins stay red until T50-25 re-pins them; answer-envelope merges before queue, so the order of that re-pin is BOB's.
2. For the design lane: queue's catalogue sentences (QUEUE_*_KINDS, one per kind, 'op=… — LIVE: …') are developer-facing, published only as op=affordances vocabularies; no screen draws them, so they stay inline. If the design lane wants them keyed, that is a new list of keys. Tell me if so.
