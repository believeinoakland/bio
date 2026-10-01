# action-clocks (T19)

**Status** · session_01LbLhGUeBjRyQBrJoVL9Ddv · depth 2 · COMPLETE · handled B2

## J1 · REPORT

Done on job/T19/action-clocks (pushed): parseFrontmatter, normalizeType, isMachineIdentity re-pointed to record-grammar (frontmatter.mjs, types.mjs, actors.mjs) in index.mjs and fixture.mjs; N427: reminderRefused(arm, detail, extra?) exported as a module-level function (the one REMINDER_REFUSED site; extra adds, never replaces a fixed field; writes nothing, never throws), its row's where re-pointed to 'reminderRefused > is-reminder-refused', with a new R4 (N427) test. 21/21 pass; format, architecture, coverage (9/9), ownership 0 failures. Remaining: lawProposalLabel to action-grammar; action-grammar has not built or merged yet (its branch has no src/action-grammar/). Until then index.mjs:34 still imports lawProposalLabel from bio-checks.mjs (rule 1 not yet met). I wait for a CHANGE or RESUME saying action-grammar is on tranche/T19, then merge it, re-point, re-run steps 5-7 and post COMPLETE. Stale generated artifact: bio-plane/dist/bio-plane.bundled.mjs (not_product) holds the old #reminderRefused and its where; regenerated at layer close.

## J2 · COMPLETE

Completion (job/T19/action-clocks @ d9fe164851, tranche/T19 merged at 324f200167).

**Entries applied (plan layer 9, B1, B2):**
- `parseFrontmatter`, `normalizeType`, `isMachineIdentity` re-pointed to record-grammar (`frontmatter.mjs`, `types.mjs`, `actors.mjs`) in `src/action-clocks/index.mjs` and `test/m/action-clocks/fixture.mjs`.
- `lawProposalLabel` re-pointed to action-grammar (`../action-grammar/index.mjs`); the label comment re-worded. Rule 1 met: no action-clocks file imports `bio-checks.mjs`.
- N427: `reminderRefused(arm, detail, extra?)` exported as a module-level function, the one site minting `REMINDER_REFUSED` (every reminderSet/reminderAnswer arm goes through it); `extra` adds a caller's fields and never replaces ok/reason/code/check/translation/detail/arm; writes nothing, never throws. Row C-123.2's `where` re-pointed to `reminderRefused > is-reminder-refused`.

**Rs met and their tests** (`bio-plane/test/m/action-clocks/`): R1 clocks "R1 pendingClocks lists…", "R1 pendingClocks reads at most 500 actions…", "R1 (N311) a page runs…", "R1 (N311) an action with more…"; R2 clocks "R2 clockPropose computes…", "R2 a business-day count…"; R3 overdue "R3 overdueClocks lists…", "R3 a pending entry is past…", "R3 pages run…", "R3 R5 the action's project…"; R4 reminders "R4 reminderSet…", "R4 refusals in order…", "R4 remindersFor…", "R4 R6 the ops…", and the T19 mark: "R4 (N427) reminderRefused(arm, detail, extra?) is exported…"; R5 reminders "R5 remindersDue lists…", "R5 pages run…", "R3 R5 the action's project…"; R6 reminders "R6 reminderAnswer…"; R7 overdue "R7 overdue is derived…"; R8 reminders "R8 nothing reminds…"; R9 overdue "R9 every read answers…".

**Deferred:** none.

**Found elsewhere (for BOB):** (1) `build/requirements/action-clocks.md` Uses still lists `legacy-checks: parseFrontmatter, normalizeType, isMachineIdentity` and action-grammar as "(not declared)"; those three are now record-grammar's, and `modules.json` uses still lists `legacy-checks`, which action-clocks no longer imports. BOB's to re-word/drop. (2) Stale generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (not_product) holds the old `#reminderRefused`, its `where`, and the bio-checks imports; regenerated at layer close.

**Tests and checks:** `node --test bio-plane/test/m/action-clocks/`: tests 21, pass 21, fail 0. No layer tests named in the manifest. No service's behaviour changed (one new export), so no user module's tests re-run. `format`: 87 modules, 82 requirements files; 0 failures. `architecture … action-clocks`: 7 product files, 30 relative imports; 0 failures. `coverage … action-clocks`: 9 of 9 live requirement ids named by a test; 0 failures. `ownership … action-clocks tranche/T19`: 5 files changed; 0 failures.

Size (session_01LbLhGUeBjRyQBrJoVL9Ddv): test runs 5, module lines 676
