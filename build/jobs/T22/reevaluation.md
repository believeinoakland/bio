# reevaluation (T22)

**Status** · session_01Q1RgBhiWfGKr5JjiSzSa23 · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Before my merge (START (1)–(3)). Branch `job/T22/reevaluation`.

1. **DEC-88 callers** (grep `adoptVersion(`, `versionadopt` over `bio-plane/`, `agent-worker/`, `civicos-ui/`, on my branch). No other module calls `adoptVersion`. Mine: `test/m/reevaluation/` (`pushed`, `sweep`, `caseparts`) now send a why, except where a test proves the refusal. Not mine, for routing:
   - **queue** (L11): `src/queue/index.mjs`:599–:606. The `newer-capture-affects-reference` door names `versionadopt` with `requires: ["notice"]`, and its detail says only the keep takes a why. Adopting now also requires `why` (R15, C-110.29 `VERSION_ADOPT_NO_REASON`, 1–2,000 characters after trimming).
   - **affordances** (L11): `src/affordances.mjs`:1184 and :2642 describe `versionadopt` without its required why (it sits in `RUNG_ABSENT`).
   - **civicos-ui**: `app.html`:15752 is a comment only; no call sends `versionadopt`.
   - agent-worker: none.
2. **Conformance and an `attribution` event** (R8; `conformance/index.mjs`:1049–:1060, not mine). `basisChanged` reads every kind but `passage` as `finding`. So an `attribution` event looks up `determination_findings` with `finding_id` = the observation id, and flags only the determinations that pin that observation itself as a finding, with source `attribution`. A determination pinning a finding that rests on the observation is not flagged. Today that usually means nothing is flagged. `test/m/conformance/` is green (54/0); no conformance test sends an `attribution` event.
3. **Suites run, each red named.** All are reds already accepted by name, and none is new.
   - publication 94/0, ratification 181/0, conformance 54/0, monitoring 73/0, queue 80/0.
   - case-authoring 79/1: `members.test.mjs`:129 (K1065).
   - scheduler 50/1: `plane.test.mjs`:85 (L10).
   - queue-producers 45/4: `proposals.test.mjs` tests at :78, :124, :153, :167, all failing in `seeded` (:58). This is the accepted :39 fixture red (L11).
   - control-plane 100/2: `catalogue-end.test.mjs`:15 and `doorbell.test.mjs`:310 (L11).
   - Whole `bio-plane/test/m`: 4874 tests, 4816 pass, 39 fail. The failing tests are a subset of `tranche/T22`'s run on the same machine (4855 tests, 4795 pass, 41 fail; its two extra failures are extraction's `convert-tiers` and `staffdirectory` in that bare worktree). Mine are actions `t18.test.mjs`:299; affordances `backing.test.mjs`:27; intent's fixture (29 tests); the four above; scheduler :85; control-plane's two. `test/system/row-census.test.mjs` is red with C-110.29 among the rows awaiting stamp (accepted red 3).
4. **Bundle.** `src/reevaluation/` changed, so `bio-plane/dist/bio-plane.bundled.mjs` is stale. I regenerated nothing.

## J2 · COMPLETE

**Entries applied** (`build/plan/current.md` T22 L7: DEC-102 R18, R29; DEC-88 R15). All three are met:
- **R15** (DEC-88). `adoptVersion({notice, why, author})` requires `why`. A why that is absent, not a string, blank, or over 2,000 characters (after trimming) is refused `VERSION_ADOPT_NO_REASON`, the new row **C-110.29** in `REEVALUATION_ACT_CHECKS`, after C-110.9 (C-110.10–.28 are not reused). It sits in `#choiceSubject`'s `is-version-choice` region, straight after the machine refusal and before anything is read for writing or written.
  - The why is recorded with the new version: at the end of the version's description (basis-versions' `fmSafe` applies there), in its Session Log entry (on one line, so a line break cannot open a heading), and exactly as given on the notice's closure (`reevaluation_notices.why`).
  - The answer carries `why`. `versionadopt` carries `why` from the body or the query, as `versionkeep` does. `keepVersion` is unchanged: its why stays optional.
- **R29** (DEC-102 item 2). `levelMoved({observation, from, to, case, edition, at})` keeps one row in the new table `reevaluation_level_moves` (observation, level_before, level_after, case_id, edition, at; no author, no text). It is migrated forward and declared to purge keyed on `observation`.
  - A call naming no observation, a level missing on either side, or the same level twice writes nothing. An `at` that does not read as an instant is replaced by now.
  - The `attribution` cause (`CAUSE_SOURCES` gains it) is derived on read in `#levelMoves`, modelled on R28's `#sourceMoves`. A live leg (R7) whose target is the observation carries it when the move came after the dependent's `bundles.last_updated`. `detail` names the two levels, the case and the edition; `since` is the move's instant; causes are listed latest first. It appears in `reevaluations`, and in `changesOf` with its target. It closes as any cause does (R16) and never regrades.
  - It is told to R8's listeners once per move as `kind: "attribution"` (`subject` the observation, `since` the move's instant, both levels, case, edition, the live dependents, no author), after the row is written, through `#tellAfterCommit`. A rolled-back caller keeps no row and tells nobody.
- **R18**: the level-move row is the only new row, and no read writes.
- Notes re-scanned (N469, N471, N480): `index.mjs` op-map note re-pointed to `src/plane/store.mjs`; `fixture.mjs`'s "legacy-store's facts" re-pointed to publication's (`R7`) and instance-setup's `producingGroup`, and its "store's additive list" to the plane's store. The provenance note at `index.mjs`:9 stays.

**Rows.** C-110.29 is new, **awaiting stamp** (`test/system/row-census.test.mjs` red, accepted red 3). No other row changed.

**Deferred:** none.

**Other modules** (J1 REPORT):
- queue's door `src/queue/index.mjs`:599–:606 (`requires: ["notice"]`, "only the keep takes a why") and affordances' `versionadopt` text (:1184, :2642) need the required why (L11).
- conformance's `basisChanged` reads an `attribution` event as a finding on the observation id.
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale from `src/reevaluation/`; I regenerated nothing.

**Tests and checks:**
- `bio-plane/test/m/reevaluation/`: 90 pass, 0 fail. New `attribution.test.mjs` (R29, R18, R8, R16, R9, R20). In `pushed.test.mjs`: R15's why, with negative controls (absent, null, number, array, object, empty, blank, 2,001 characters, each refused with nothing written, the notice still open and no new version; the machine still refused first; exactly 2,000 characters accepted; why recorded on the version, its log and the closure; keep without a why accepted) and the op. In `checks.test.mjs`: C-110.29's row test.
- Mutation controls: removing the attribution arm fails 4 tests, removing the why check fails 3, and moving the bound to 2,001 fails 1.
- Users' suites: publication 94/0, ratification 181/0, conformance 54/0, monitoring 73/0, queue 80/0, case-authoring 79/1 (`members.test.mjs`:129), scheduler 50/1 (`plane.test.mjs`:85), queue-producers 45/4 (`proposals.test.mjs` fixture), control-plane 100/2 (`catalogue-end`:15, `doorbell`:310). All are accepted by name and identical on `tranche/T22`.
- Whole `bio-plane/test/m`: 4874 tests, 4816 pass, 39 fail, a subset of `tranche/T22`'s 41; no new red.
- Checks: `format: 85 modules, 84 requirements files; 0 failures` · `architecture: 14 product files, 59 relative imports (0 naming no tracked file, not judged); 0 failures` · `coverage: 1 modules, 29 of 29 live requirement ids named by a test; 0 failures` · `ownership: 10 files changed by reevaluation between tranche/T22 and HEAD; 0 failures`.

Size (session_01Q1RgBhiWfGKr5JjiSzSa23): test runs 28, module lines 2225
