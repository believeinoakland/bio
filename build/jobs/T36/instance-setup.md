# instance-setup (T36)

**Status** · session_01DU7JcZgKofYj3uee3CqU8X · depth 2 · COMPLETE · handled B1

## Completion (INSTANCE-SETUP #15, T36-34)

**Reading.** BOB's measure: 674 KB, over 300 KB. Read whole myself: `build/requirements/instance-setup.md`; layer 11's row of `build/layers.md`; T36-34 in `build/plan/current.md`, the plan's rules at the opening, K2130's line and the draft's instance-setup section, Choices and "BOB's review" (`build/plan/draft-T36-L11-reqs.md`), K2093, K2101, K2152, K1936, K1957, K2063; all three code files (`setup.mjs`, `setup-fleet.mjs`, `livefire.mjs`); the tests my entry changes (`fixture.mjs`, `assistant`, `draft`, `exports`, `recovery`, `reports`, `words`, `worker-reports`, and the part of `seeds` around `#readCapture`); the used services: credentials R35, R51, R52 with `aiKeepAwayState` and `#keptAway`, provenance R60 `receiptsOfCapture` (and R16, R48 for the row shape). A worker read the nine other test files whole (`group`, `identity`, `language`, `limits`, `page`, `places`, `profiles`, `relay`, `seeds`) and wrote a summary of about 600 words, each statement citing file and line: none depends on the retired switch, `MEMBER_TOKEN` or `FLEET_BINDINGS`; `places`:73 reads `assistantState()` (it must not throw without a keep-away provider: it does not); `seeds` always injects `readCapture`, so no test reached `receiptsOfCapture` (I added one). Nothing it left out mattered.

**Entries applied (T36-34).**
- R53 superseded (N721; DEC-172; K2093): `assistantState()` answers `{ok, on, set_by, set_at, reason}` from `credentials.aiKeepAwayState()`: `on: false` with the setting's who, when and reason while keep-away is on; any other `on` (null when unread, or a provider that throws or answers nothing) read as kept away, the three null, with `read: false` and a sentence; otherwise `on: true`, the three null. Writes nothing, never throws. `assistantSet`, `op=assistantset`, the first boot's `ASSISTANT_ENABLED` read, `ASSISTANT_INSTALLER` and the `ASSISTANT_SWITCH_MALFORMED` row removed; the `assistant_switch` table and its rows are kept, declared as before, no longer read.
- R55: `assistantGate()` refuses `ASSISTANT_OFF` carrying `keep_away: {reason, set_by, set_at}` (and `set_by`, `set_at` as before; null and stated so when unread). `store-door` R10 and `wizard-scripts` R24 read the same shape (`on` plus the new `reason`).
- R18: `op=selftest` neither reads, reports nor requires `MEMBER_TOKEN`; `bindingsAllPresent` rests on `STORE`, `ADMIN_TOKEN`, `PROBE_TOKEN`.
- R19: livefire's token assertions run over `ADMIN_TOKEN`, `PROBE_TOKEN`, `DAEMON_TOKEN`. The battery never acts as a member. In this module's tests the one call that acted as a member through the shared bearer (`worker-reports` R42's acquire and runtime, `token=MEM`) now uses the administrator's binding credential.
- N756 (K2101): `#readCapture` reads `provenance.receiptsOfCapture({captureSha})` for the one capture; a test with 500 receipts at other captures answers the same, and its negative control (put back `receipts()`) fails.
- K2152: `FLEET_BINDINGS` gains `["file-scanner", "FILE_SCANNER"]` (file-scanner's `/version` answers `name: "file-scanner"`).

**Rows (for T37's promotion job).** Re-worded: `ASSISTANT_OFF` (C-119.5) translation ("Your group keeps its material away from every assistant, so no question is put to one and nothing runs. The administrator's reason, in their own words, and who set it and when, come with this answer. Nothing was asked."). Its `where` already named the gate that raises it (`src/setup.mjs assistantGate > is-assistant-on`), so it is unchanged; the draft's "`assistantSet > is-assistant-switch`" was `ASSISTANT_SWITCH_MALFORMED`'s. Retired: `ASSISTANT_SWITCH_MALFORMED` (C-119.6). No row added.

**Deferred.** None.

**Found in other modules (the REPORT).** Reds my merge causes, each from removing `assistantSet` (no requirement of theirs changes; each re-points to `credentials.aiKeepAwaySet`, or relies on on-by-default):
- plane: `ask.test.mjs` :69, :77, :83 and seven more B2/B7/K1806/R19 tests (`instanceSetupOf(...).assistantSet is not a function`), and `door.test.mjs`:112 (R1, R5: "twenty-five routes", now 24). 11 more failures than the tranche (plane 117/13 against 128/2).
- store-door: `routes.test.mjs`:111 and :150 (R10). 34/2 against 36/0.
- control-plane: `t34-routes.test.mjs`:198 and :237 (R57). 161/6 against 163/4 (the other four are reds 22–24, 26).
- op-declarations still declares `assistantset`, op-grades grades it and control-plane's route map no longer finds a handler for it; setup-page's page still posts `assistantset` (`setup-page/index.mjs`:1970, :2063), now answered by no handler. op-declarations 90/3, answer-envelope 24/2, wizard-scripts 64/0, setup-page 71/0, installer `newgroup/test` 42/1, `migrate-released` 1/0: each the same as on `tranche/T36`.
- Generated artifacts made stale (mechanics §14): `newgroup/dist/newgroup.bundled.mjs` (installer's; `setup-fleet.mjs`'s `FLEET_BINDINGS` is its input): `newgroup-bundle-fresh.test.mjs` 0/1 against 1/0. `bio-plane/dist/bio-plane.bundled.mjs` (`setup.mjs`, `livefire.mjs`). Both regenerate at L11's close.

**Tests and checks.**
- `node --test bio-plane/test/m/instance-setup/`: tests 111, pass 111, fail 0.
- `checks/format.mjs`: 135 modules, 134 requirements files; 0 failures.
- `checks/architecture.mjs … instance-setup`: 20 product files, 76 relative imports; 0 failures.
- `checks/coverage.mjs … instance-setup`: 48 of 48 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … instance-setup tranche/T36`: 13 files changed; 0 failures.
- No layer tests (manifest).

**P6.** 2,494 lines (own paths, code only), was 2,519.

Size (session_01DU7JcZgKofYj3uee3CqU8X): test runs 9, module lines 2494
