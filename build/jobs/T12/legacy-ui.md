# legacy-ui (T12)

**Status** · session_01BSC2Ek4hARuMbaqzmitcK9 · depth 2 · COMPLETE · handled B1

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

Size (session_01BSC2Ek4hARuMbaqzmitcK9): test runs 4, module lines 53

## J1 · COMPLETE

Complete (record's Completion). K387: entitycreate probe keys on ENTITY_NO_LABEL; intent-write.test.mjs green again. No other UI probe or label keys on a T12-renamed code (grep; the rest render the plane's translation). N301: queue class FINDING shown as Noticed (one helper queueClassLabel: row chip, notifClassLine) and 'noticed item' in the queue, set-aside ledgers and progression/document decision sentences; 'finding' kept for concluded questions. For legacy-tests to re-anchor (text pins of the old N301 wording): notifications.test.mjs:894,:923; queue.test.mjs:725; queue-projectscope.test.mjs:397; document-decided-finding.test.mjs:254/277/285/327-330; progression-decided-finding.test.mjs:224/247/253. Pre-existing, unchanged: add-surface, bias-vocabulary, semantics-harvest; the three check scripts' FAILs identical before/after. No code added or retired; no generated artifact stale. Checks: format, architecture, coverage, ownership 0 failures.

## Completion after B2 (CHANGE)

I merged `tranche/T12` into this branch (queue merged, K409).

**Applied:**
- **`options_grain` (queue R18).** The lead no longer carries `options_grain`. The UI's grain renderer draws one only for an item that carries it, so nothing shows on the lead now. The stance and version items still declare their grain and still render it. The comment above the renderer is updated to say this.
- **The lead's new options (`cite`, and with a project home `proposedispose`).** These render through `queueOptionsHtml` like any other option.
- **A dead control I found and fixed.** Each queue row draws its own Defer/Dismiss buttons. For a *project-scoped* finding, the lead among them, those buttons sent the instance-wide `key`. The plane refuses that shape (the IC-60 bridge, `NO_PROJECT_SCOPE` in spirit of R18). A project-scoped finding now draws:
  - Defer and Dismiss only. Adopt makes the question a shared one; the lead's take-up is its `cite` option.
  - A dialog that names the case, or asks for it when the item is filed under several, with none chosen until the member chooses (D-266).
  - A commit that sends `{project, finding, to, reason}`.

  The selection-bar path already did this (UI-110).
- **`notifDispositionKeyed` reads the published `disposition.op`.** Adopt/Defer/Dismiss are drawn only where that op is `proposedispose`. Queue R12's newer-capture notice (`available: true`, decided through `versionadopt`/`versionkeep`) no longer gets three controls that would be refused. It gets no "no adopt, defer or dismiss" sentence either, since its options are its door.
- **`class_labels`.** `queueClassLabel` reads `op=queue`'s `class_labels` verbatim. It falls back to "Noticed" for FINDING only on a plane that publishes none.

**Tests and checks run:**
- **The UI battery.** `node --test civicos-ui/test/*.test.mjs` fails the same ten files before and after this round's edits, on the merged tree (stash diff):
  - Five N301 text pins, reported in J1.
  - `add-surface`, `bias-vocabulary` and `semantics-harvest`, which were already failing.
  - `member-respect` (ARM 4d reads `proposeDispose`, `taskResolve`, `taskForward` and `queuemute` in `store.mjs`, which queue moved) and `bound-sweep` (3 delta walks). These two are red since the tranche merge, before my edits, and are for legacy-tests to re-anchor.
  - Per-assertion FAIL lines are identical before and after in `queue`, `queue-projectscope`, `notifications`, `member-respect`, `bound-sweep`, `document-decided-finding` and `progression-decided-finding`.
- **A scratch smoke test** (outside the repository) on `queue-projectscope`'s real-plane fixture: 11 pass, 0 fail. It checks the following on a two-home stance finding:
  - Defer and Dismiss are drawn with no Adopt; the instance-wide finding keeps Adopt.
  - The dialog asks for the case and draws no commit, and sends nothing, until one is chosen.
  - It then sends one `proposedispose` with `{project, finding}` and no `key`.
  - The plane accepts it, and the read-back finds the decision under the chosen case.
- **Process checks.** format: 0 failures. architecture: 0 failures. coverage: 0 of 0 ids. ownership (`tranche/T12`): 1 file changed by legacy-ui, 0 failures.

**Found for BOB:** the `member-respect` and `bound-sweep` re-anchoring above, for legacy-tests. No code was added or retired, and nothing generated is stale.

Size (session_01BSC2Ek4hARuMbaqzmitcK9): test runs 9, module lines 132

## J2 · COMPLETE · re B2

B2 applied (record: 'Completion after B2'). Merged tranche/T12. Lead's options_grain: renderer draws only where an item carries one (stance/version still do); comment updated. class_labels read verbatim (fallback Noticed for FINDING on an older plane). Found and fixed in my module: per-item Defer/Dismiss on a project-scoped finding (the lead among them) sent the instance-wide key, which the plane refuses; they now send (project, finding) with the case named or asked (no default), and draw no Adopt. notifDispositionKeyed now requires disposition.op === proposedispose, so queue R12's newer-capture notice no longer gets three refused controls. Smoke on the real-plane fixture: 11/11. UI battery: same 10 files red before/after my edits (assertion-level identical); new since the merge and legacy-tests' to re-anchor: member-respect ARM 4d (reads proposeDispose/taskResolve/taskForward/queuemute in store.mjs, which queue moved), bound-sweep (3 delta walks). Checks: 0 failures.
