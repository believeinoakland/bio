# legacy-ui (T12)

**Status** · session_01BSC2Ek4hARuMbaqzmitcK9 · depth 2 · WORKING · handled B0

## Completion

**Entries applied** (K387, N285's legacy-ui half, N301):
- K387: `civicos-ui/app.html`'s `INTENT_HOLD.entitycreate` probe keys on `ENTITY_NO_LABEL` (was `NO_LABEL`), the code entities R1 now answers for an empty label (`bio-plane/src/entities/index.mjs`). `civicos-ui/test/intent-write.test.mjs`, red at the job's start, is green.
- T12's other renamed codes, by grep of `civicos-ui/` (`PROGRESSION_NO_LABEL`, `PROGRESSION_VERSION_NOT_HELD`, `EXPERTISE_NO_LABEL`, `NO_SUCH_KNOCK`, `DETERMINATION_`/`CONSEQUENCE_`/`ESCALATION_NOT_A_PARTICIPANT`, `CONSEQUENCE_NOT_NONCOMPLIANT`, `EDGE_NOT_PROPOSED`, `NO_SUCH_COMPARISON`, and their old names `NO_LABEL`, `NOT_FOUND`, `NOT_A_PARTICIPANT`, `NOT_NONCOMPLIANT`, `NOT_PROPOSED`): the UI keyed on none of them but `entitycreate`'s. It renders every other refusal through the plane's own `translation`. The other pre-flight probes' codes were checked against the plane source on the tranche and still hold (`NO_ALIAS`, `NO_SUCH_ENTITY`, `NO_SHA`, `NO_ENTITY`, `UNKNOWN_AFTER`, `BAD_STAGE`, `NOT_CONCERNED`).
- N301: the queue class `FINDING` is shown to members as **Noticed**. There is one helper, `queueClassLabel`, used by the queue row's class chip and by every class line of "what this list can be empty about" (`notifClassLine`). The member-facing prose about these items says "noticed item(s)" in these places: the queue feed's description, the selection bar's held-back count, the mute control, the two set-aside ledgers and their empty state, and the progression and document pages' decision sentences, count and banner. The code, `data-*` attributes, CSS classes and function names are unchanged. "Finding" stays wherever it names a concluded question (the case and publication pages, "not an established finding").
- Monitoring R30's `NOT_AN_ADMIN` on `monitorpause`: the UI has no `monitorpause` control yet. Once one exists it shows the plane's translation (C-96.1), as it does for every refusal, so nothing changed here.

**Deferred:** nothing. `legacy-ui` has no requirements file and no `tests` path, so no requirement id or `not yet met` mark applies.

**Found for BOB** (in J1 COMPLETE):
- Five legacy-tests suites pin the old N301 wording and need re-anchoring, since legacy-tests owns `civicos-ui/test/`. Each failure is a text pin only:
  - `notifications.test.mjs`:894 and :923 pin `<b>FINDING</b>`.
  - `queue.test.mjs`:725 pins "A finding you mute", and :451 still passes on the row's `class` attribute.
  - `queue-projectscope.test.mjs`:397 pins "1 selected finding is filed".
  - `document-decided-finding.test.mjs`:254/277/285/327–330 pin "(no) member has decided this finding".
  - `progression-decided-finding.test.mjs`:224/247/253 pin the same sentence.
- No refusal code was added or retired by this job. `civicos-ui/` and affordances' lists need no change for it.
- No generated artifact reads `civicos-ui/`, so nothing is stale.

**Tests and checks run**
- `node --test civicos-ui/test/*.test.mjs` (legacy-tests' battery, the only UI tests):
  - Before: 4 files fail (`add-surface`, `bias-vocabulary`, `intent-write`, `semantics-harvest`).
  - After: 8 files fail. `intent-write` is fixed, and the five N301 text pins above are new. The other three fail identically before and after (checked by stashing).
- `node civicos-ui/check-mock-envelope.mjs`, `check-refusal-codes.mjs`, `check-semantics.mjs`: their FAIL lines are identical before and after (all pre-existing, diffed by stashing).
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `architecture.mjs … legacy-ui`: 7 product files, 0 relative imports; 0 failures.
- `coverage.mjs … legacy-ui`: 0 of 0 live requirement ids; 0 failures.
- `ownership.mjs … legacy-ui tranche/T12`: 2 files changed by legacy-ui; 0 failures.

Size (session_01BSC2Ek4hARuMbaqzmitcK9): test runs 4, module lines 43
