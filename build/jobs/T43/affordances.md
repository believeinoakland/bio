# affordances (T43)

**Status** · session_01S81AeYUiK3j4br2K1UYVmu · depth 2 · COMPLETE · handled B2

## J1 · REPORT

op-declarations: my entry makes `ACT_HELP_ABSENT` stale (mechanics §14 does not apply; it is op-declarations' source). `ACT_HELP` now holds `transcribe` (`act.transcribe.does`) and `pagetranscribe` (`act.owed_pagetranscribe.does`), and op-declarations still names both in `ACT_HELP_ABSENT` (`src/op-declarations/index.mjs`, the `unexplained` ground, lines ~3401 and ~3419). Its R34 asks the partition both ways, so two new reds appear on `job/T43/affordances`, neither in rule 4:
- `test/m/op-declarations/t36.test.mjs`:292 (R34: `transcribe`, `pagetranscribe` both explained and named);
- `test/m/op-declarations/t42.test.mjs`:128 (R47, R34: asserts `pagetranscribe` has no text; its own message says "R34 now asks it leave ACT_HELP_ABSENT").
Without my change only rule 4 (10)'s eight reds stand (t34:68, 145, 307; t37:105, 177, 218; t38:76, 87). The fix is op-declarations': drop both ops from `ACT_HELP_ABSENT` and re-pin t42:128 (and R47's sentence) to "explained". T43-18 says "tests only"; it needs widening to this source line and R47's text. Since affordances merges first in L11, the two reds stand on the tranche until T43-18 merges, unless you accept them by name.

## J2 · COMPLETE

**T43-17 applied on `job/T43/affordances` (c0db46c78b).**

**Entry applied**
- `src/affordances/act-help.mjs`: `ACT_HELP` re-generated, by script, from `docs/development/ux-substrate/screens/mock-acts.js` as it stands on `tranche/T43` (DEC-189 `4455c7fbe5`, DEC-190 `bbf92e344a`): 213 texts, all held, in the design's order. The script reproduces the 211 existing entries byte for byte (DEC-189's 37 re-keyings from `owed_<op>` were all to ops already held under their op; the four retired acts' texts are gone from the file and were never held). It adds two texts, keyed in the registry as `act.transcribe.does` and `act.owed_pagetranscribe.does` (`words.json`), held under `transcribe` and `pagetranscribe` (both declared since T42). The remaining `owed_` keys in the design are `infolevelset` (undeclared, held as `owed_infolevelset`), `subscriptionsignin`, `projectaikeepaway` and `pagetranscribe` (declared, held under their ops). Header comment updated.
- `test/m/affordances/t36.test.mjs` re-pinned. It reads `mock-acts.js` and `words.json` from `docs/development/ux-substrate/screens/` and copies nothing by hand.
  - R48 checks: 213 texts; both files agree text for text (`act.<key>.does`); the design's `owed_` keys are the four above; every text is held under R48's key, verbatim and in order; negative controls.
  - A new R48 test checks `transcribe` and `pagetranscribe` against `act.transcribe.does` and `act.owed_pagetranscribe.does`. Controls: `translationmark` is declared and graded but has no registry text, and is absent; every held key has a registry text; a missing text, a differing text, or a text held under `owed_` is each seen.
  - Against the old table the re-pinned file fails 3 of 5 tests. Rule 4 (10)'s `t36`:55 red is cleared.

**Deferred:** nothing.

**Found in other modules** (also J1 REPORT)
- op-declarations: `ACT_HELP_ABSENT` (`src/op-declarations/index.mjs`, `unexplained` ground, :3401 `pagetranscribe`, :3419 `transcribe`) is now stale against its R34. My change makes two reds, not in rule 4:
  - `t36.test.mjs`:292 (R34's partition);
  - `t42.test.mjs`:128 (R47: asserts `pagetranscribe` unexplained).
- R47 already says `pagetranscribe` stays named "until `affordances`' `ACT_HELP` holds its text (R34)" (helper's digest), so no requirement text changes. The fix is op-declarations': drop both ops from `ACT_HELP_ABSENT` and flip t42:128. This widens T43-18 beyond "tests only".

**How the reading set was read (mechanics §17)**
- **Read whole by me:**
  - `build/requirements/affordances.md`;
  - `src/affordances/act-help.mjs`, the file my entry changes;
  - `test/m/affordances/t36.test.mjs`;
  - the plan's T43-17 entry and rule 4 (10);
  - K2704 and K2700.
- **Not read whole this job:** the rest of `src/affordances.mjs` (115 KB) and the other 20 test files. My entry changes neither, and all 233 module tests pass. The trade-off is named here for BOB.
- **Read by one helper agent in this session:** in full, the public parts of op-declarations, op-grades, plane, wizard-scripts, capture, ai-runs, content and credentials (the used modules whose public parts name ACT_HELP, `transcribe`, `pagetranscribe`, `owed_` or `mock-acts.js`). It gave the entries and T43-18/T43-15 as context and wrote a digest citing sections:
  - op-declarations R34, R21, R47 and R42 bind ACT_HELP;
  - op-grades R31 and R1 grade `pagetranscribe` and `transcribe`;
  - content R23–R26 and R50 separate manual typing from the assistant's page reading;
  - nothing relevant is in plane's, capture's or ai-runs' public parts.

**Tests**
- affordances, `node --test test/m/affordances/`: 233 pass, 0 fail (`t36`: 5/0).
- My users:
  - tasks 106/0; queue 138/0; store-door 44/0; plane (with `test/system/migrate-released.test.mjs`) 185/0.
  - op-declarations 123 pass, 10 fail. Eight are rule 4 (10): `t34`:68, 145, 307; `t37`:105, 177, 218; `t38`:76, 87. Two are mine, by the stale table above: `t36`:292, `t42`:128.
  - control-plane 222 pass, 1 fail: `envelope.test.mjs`:391, rule 4 (12) (T43-23).

**Checks** (from civicos-process)
- format: 147 modules, 146 requirements files; 0 failures.
- architecture . affordances: 25 product files, 268 relative imports; 0 failures.
- coverage . affordances: 34 of 34 live requirement ids named by a test; 0 failures.
- ownership . affordances tranche/T43: 3 files changed; 0 failures.

Size (session_01S81AeYUiK3j4br2K1UYVmu): test runs 9, module lines 2335
