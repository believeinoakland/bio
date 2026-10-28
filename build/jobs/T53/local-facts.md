# local-facts (T53)

**Status** · session_018BhcedSE6M2T5swdLzFC13 · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# local-facts · T53 · R1 report

**Entries applied.** T53-144 (R23-R27), T53-145 (R31, R32), T53-146 (R28-R30), T53-542 (a fact is read by its `layer` as well as its `profile`).

- **Team layer (R23, R30).** New `layer.mjs`: `layerEntryDraft/Confirm/Withdraw`, `layerEntries`, and `teamLayer({viewer})`, which returns the confirmed team layer as one profile object (id `team`, the shape `combine` takes; `null` for a viewer outside the group, per BOB's K5761). Table `team_layers` is declared exempt from purge, `sight: group`, append-only. Confirmed entries reach `combine` as the team layer, tagged `origin: team` with their `government`.
- **Rules (R24, R28).** `ruleDraft` takes `layer` and `government`. Two new columns on `local_rule_acts`, added by ALTER, with old rows untouched and read as the team's layer. A key is judged within layer and government first, then across active layers, naming the holder. Closure names are stored as `<layer>:<name>` through `nameResolve`. New read `ruleResolve` answers NAME_AMBIGUOUS naming each government.
- **Facts (R25, R27, R29).** The setting's packages are read as their layers. A path naming a package resolves to the layer holding the fact, its history is read under both spellings, and new acts are recorded under the layer's path. `factStatus` and `factsDue` answer `layer`. Paths `team/<government>/...` carry the government.
- **Reports (R26).** `layerReport`, `layerReports`, `layerReportCarry`, table `layer_reports`.
- **Fiscal year (R31, R32).** `factConfirm` `correct` at `team/<government>/fiscal_year` states a year with `how`. It is an entry at once, needs neither a source nor a second member, and the records are read first. A stated year is read as the time zone's is: it lapses at 183 days, and a year the records later give differently is set aside.
- 10 new refusal rows C-126.17 to C-126.26. The shared codes (RULE_ENTRY_INVALID, RULE_NO_SOURCE, RULE_SELF_CONFIRM, RULE_NOT_DRAFTED, RULE_NEEDS_QUALIFICATION) each moved to one builder, so their `where` moved. Their words are `localize` sentences, since `words.json` is the design stream's and has none of them yet.
- DECLARED_OPS: five mutating ops (stamps `by`, `viewer`; `needs: null`) and three reads (`layerentries`, `layerreports`, `ruleresolve`).

**Not done / choices BOB may reverse.**
- NAME_AMBIGUOUS: DUTIES holds C-133.45 for the same meaning. local-facts sits below duties in the module order (duties uses it), so I cannot read their row. Mine is C-126.24 with its own words. BOB may move one row to a lower module.
- Report state `answered` is in `LAYER_REPORT_STATES` but nothing sets it: no requirement says who answers or when.
- Tier of a confirmed team entry: holidays, counterparties and systems are Tier 1; a deadline takes its kind's tier; a law the highest tier of the kinds citing it; an action kind its own. Undetermined needs the statement.
- A stated year refuses a `*` entry of the government's own layer as FISCAL_YEAR_IN_RECORDS whatever its value; a differing own entry (by body) is LAYER_ENTRY_IN_SHIPPED.
- Unmodified `ruleDraft` answer shape; `layerEntry*` take `entry` (an id `LE-n`); reports are `LR-n`.

**Found in other modules.**
- `jurisdictions` `validate`: the team layer's holidays reject the same (year, list) for two governments ("listed twice"), though R99/R115 say names are unique within the government. R29's two-cities-in-the-team-layer case cannot be written until this is government-aware. `DUPLICATE_KIND` for `action_kinds` is probably the same.
- `screens-settings` (R45 test, `group.test.mjs`): reads `factStatus({})` for `<package>/time_zone`; the list now names the layer's path (R29), so the screen must read by layer. `screens-settings` also has 77 failures on the tranche already, unrelated.
- `op-declarations`/`op-grades` hand tables have no rows for `ruleoffer`-like reads of mine beyond the declared ones; the declared rows cover the door.
- `build/tests-english-baseline.json`: nothing of mine to remove.

**Met** · R23, R24, R25, R26, R27, R28, R29, R30, R31, R32

Tests: 107/107. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedSE6M2T5swdLzFC13): test runs 1, module lines 2492
