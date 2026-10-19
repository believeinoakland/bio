# escalation (T51)

**Status** · session_013AsFroTyykKKbdaHRfrSrH · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Findings in other modules, not changed here (P9), and artifacts my change makes stale:

1. Hand-listed escalation op names in other modules' tests (K3268: a list assembled from the owning module's declaration). Owners to fix: `affordances` (`test/m/affordances/catalogue.test.mjs:770`, five ops incl. `escalationreasondraft`); `op-grades` (`test/m/op-grades/owners.test.mjs:46`; `pins.test.mjs:114` incl. `escalationend`, `escalationopen`; `pins.test.mjs:187`); `plane` (`test/m/plane/t46.test.mjs:385`, incl. `escalationstoppursuing`, `escalationreopen`). Each is a `handlist` finding of the words check.
2. `wizard-scripts`: `src/wizard-scripts/data.mjs:54` "Take an escalation to its next stage" is a copy of a word row (inline, copy); `test/m/wizard-scripts/library.test.mjs:41, :67, :366` copy it too. Owner: wizard-scripts.
3. The full `checks/run.mjs` words total (1379 failures over 175 modules) and coverage (28 failures) are other modules'. None names escalation.

Generated artifacts made stale by this job (BOB regenerates at the layer close; I did not touch them):
- `bio-plane/src/setup-words/rows.mjs`: seven `localize` ids are new (`escalation.index.consequence_state_undetermined`, `escalation.index.clock_entry_past_undetermined`, `escalation.index.determination_states`, `escalation.index.its_state_is`, `escalation.index.date_undetermined`, `escalation.index.basis_undetermined`, `escalation.index.doubt_and_reason`). `node bio-plane/src/setup-words/build.mjs --check` exits 1 with the stale-rows note naming `escalation.index.basis_undetermined`: the expected note, not a refusal.
- `words-unreviewed.json` (release mode) will list those seven rows.
- `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` (built from the escalation source).

For Bob (a word-policy question, not decided here): the seven new sentences are `localize` sentences with no words.json row yet. Whether they get rows (K3944) is for the design stream.

Defect fixed in this module (P8): the lines module answers an undetermined reason as `{key, vars}` (civil-time, K3958). Two places in `src/escalation/index.mjs` rendered it with `String()`, so a member would read "[object Object]" (the part-of line sentence, and the joined doubt). They now render through `reasonText`, which calls `word(key, vars)`.
