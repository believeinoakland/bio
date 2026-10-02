# T22: callers of DEC-88's newly reasoned acts (K1030)

**Status** · Written by BOB #90, 2026-10-02, from the fold worker's grep on `tranche/T22` (folds K1025, merged K1030). Each module's job sends the new field from its own tests; the callers below are in OTHER modules and go into those modules' STARTs (P4, P9). Paths under `bio-plane/` unless they start `civicos-ui/`.

| act (module, layer) | new field, refusal | callers outside the module | whose job fixes it |
|---|---|---|---|
| `attestText`, `transcriptionAttest` (content, L4) | `note`, `ATTEST_NO_NOTE` C-52.10 | `test/m/inquiry/content-legs.test.mjs`:399, :409 | inquiry (L6) |
| `leadlook`, `leadshare` (observation-log, L5) | `detail` / `reason`, C-54.11, C-54.12 | none (`test/stats-disclosure.test.mjs` already complies) | — |
| `createEntity` (entities, L5) | `note`, `ENTITY_NO_NOTE` C-91.8 | `test/m/actions/t18.test.mjs`:302; `test/m/bias/adopt-manifest.test.mjs`:303; `test/m/connections/converts-derivation.test.mjs`:143, :145, :208; `test/m/connections/derive.test.mjs`:219; `test/m/scheduler/plane.test.mjs`:87; UI `civicos-ui/app.html` `entityDraft()` ~:17128 | actions (L9), bias (L5), connections (L5), scheduler (L10); the UI: N487 |
| `progressiondefine` (progressions, L5) | `basis` on a first declaration, `NO_BASIS` C-33.40 | `test/m/intent/fixture.mjs`:203, `test/m/intent/invariants.test.mjs`:207 (intent, L7); `test/m/queue-producers/proposals.test.mjs`:39 (L11); `civicos-ui/test/progression-revision.test.mjs`:208, UI `progDefineDraft()` ~:17767 | intent, queue-producers; the UI: N487 |
| `biasadopt` (bias, L5) | `reason`, C-26.21 | `test/m/ai-runs/world.mjs`:167 (L6); `civicos-ui/test/queue-recipients.test.mjs`:160 | ai-runs; the UI: N487 |
| `strengthBarSet` (strength, L6) | `reason`, `BAR_NO_REASON` C-107.3 | `test/m/case-authoring/members.test.mjs`:129 (L8) | case-authoring |
| `adoptVersion` (reevaluation, L7) | `why`, C-110.29 | none (`src/queue/index.mjs`:604 only names the op) | — |
| `objectivecondition`, `workobjective` (intent, L7) | `reason`, C-111.13 | none | — |
| `attribute` (publication, L8) | `reason`, C-92.13 | none (`src/ratification/refusals.mjs`:72, `src/review/index.mjs`:666, :668 name the op) | — |
| `statementack` (case-authoring, L8) | `reason`, C-82.8 | **control-plane drops it**: `src/control-plane/index.mjs`:783–799 builds the inner URL without it (L11); `src/review/index.mjs`:620 builds the act link; tests `test/m/control-plane/envelope.test.mjs`:145, :341, `test/m/review/copy.test.mjs`:188; UI `app.html` :25792, :25802, `civicos-ui/test/statement-ack.test.mjs`:277, :342, `civicos-ui/check-mock-envelope.mjs`:206 | control-plane (L11); review (not in T22: N487); the UI: N487 |
| `standardDeclare` (standards, L9) | `reason`, C-112.20 | `test/m/conformance/fixture.mjs`:320 (conformance, no job); `test/m/filings/fixture.mjs`:130 (L9) | filings; conformance: N487 |
| `counselpacket` (filings, L9), `escalationattach` (escalation, L9) | `reason`, C-115.44 / C-116.24 | none | — |
| all 17 ops | the `reasoned` rung | `bio-plane/src/affordances.mjs` (each `RUNG_ABSENT`); `test/m/affordances/catalogue.test.mjs` | affordances (L11, J1) |
