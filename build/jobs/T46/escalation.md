# escalation (T46)

**Status** · session_01QtKSd8jPA5JkqpDtCs2VMc · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three readings I am building on; none blocks me. Answer only where you read otherwise.

1. **R34 `attachConditions` at a stage other than 7.** It answers `ok: true` with the escalation's `stage` and `purposes: null`, saying counterparty conditions are judged at stage 7 only (R9 asks them nowhere else); its only refusals are R9's for an absent or invisible escalation (`NO_SUCH_ESCALATION`) or action (`NO_SUCH_ACTION`, actions R43). It is a module read with no op arm: R25 names none, and T46-51 specifies only R31's two ops.
2. **R31, R35 `NOT_OPEN`'s site.** Stopping now answers `NOT_OPEN` too (ended or already stopped), and so do `escalationEnd` and `escalationSuspend` on a stopped escalation (it is reopened first; record-grammar R57 holds no edge `stopped_pursuing` → `ended` or `suspended`). To keep DEC-49's one code at one site, `NOT_OPEN` is minted by one function, `refuseNotOpen`. Its row's `where` moves from `#edgeArgs > is-edge-open` to `refuseNotOpen > is-escalation-open`. Its check C-116.27 and its translation are unchanged (R35). Answer-envelope's `catalogue-end` pin is check plus translation digest, so it stays green.
3. **A stopped escalation's other acts.** Attach and evaluate behave on a stopped escalation as they do on a suspended one, so they are not refused: R31 names only the edges (`NOT_OPEN`, R13) and the end. Resume answers `NOT_SUSPENDED`. R1 and R27 answer `ALREADY_OPEN`, naming it.

## J2 · COMPLETE

**Completion (T46-38).** The code is commit abea6ad87a on `job/T46/escalation`; the record entries follow it. `tranche/T46` is not merged in: no file I read changed there.

**Applied:**
- **R31 / R33 (N910).** `escalationStopPursuing` (`op=escalationstoppursuing`) writes `stopped_pursuing` as the document's state. It goes along record-grammar R57's edge from `open` or `suspended`, and adds a `prior_state`, a `state_history` entry and a Session Log entry. `escalationReopen` (`op=escalationreopen`) writes `open` at the stage where the escalation stopped. The head, the `escalations` row and every read answer the document's state.
  - Refusals, in order: `MACHINE_CANNOT_STOP`, `NO_SUCH_ESCALATION`, `NOT_OPEN` (ended or already stopped), `ESCALATION_NO_REASON`. Reopen refuses `NOT_STOPPED` in place of `NOT_OPEN`.
  - A stopped escalation proposes nothing, and R16 never lists it. R1 and R27 answer `ALREADY_OPEN`, naming it. Advance, decline, end and suspend answer `NOT_OPEN`; resume answers `NOT_SUSPENDED`. Attach and evaluate behave as they do on a suspended escalation (B2 (3)).
  - R30's source answers `stopped_pursuing` and `reopened`, dated, `public: true`, never with the reason.
  - The rows are C-116.47 `MACHINE_CANNOT_STOP` and C-116.48 `NOT_STOPPED`. Their translations are `words.json`'s `refusal.MACHINE_CANNOT_STOP` and `refusal.NOT_STOPPED`, read by key from the new `ESCALATION_WORDS`, exported.
  - R25's map gains its two arms.
- **R34 (N931).** `ALREADY_ATTACHED` is refused for every attachment. It names the escalation and stage only where the viewer may see that escalation; otherwise it names nothing of it, as one answer.
  - New read `attachConditions({id, action, nowMs?, viewer})`. At stage 7 it answers per accountability purpose: `admitted` (with the line held, or the profile's flag), `refused` (code, check, translation), `undetermined`, or `none_asked`. Elsewhere it answers `purposes: null`. Its refusals are R9's: `NO_SUCH_ESCALATION` and `noSuchAction`. It has no op arm (B2 (1)).
  - R9 and the read share one judgment, `#counterparty`, so they cannot disagree. The test drives both over the same offices.
- **R35 (N913).** C-116.27 `NOT_OPEN` keeps its translation. `words.json`'s sentence is not adopted, and a test checks that it differs (control).

**Row census (B2 (2); rule 5 (2), accepted red until T47's stamp):**
- C-116.27's `where` moves from `#edgeArgs > is-edge-open` to `refuseNotOpen > is-escalation-open`. Its check and translation are unchanged, so answer-envelope's `catalogue-end` pin stays green (32/32).
- C-116.47 and C-116.48 are new.

**Fixed in my module (P8):** `ESCALATION_BY_ACT_ONLY`'s detail now lists stop pursuing and reopen among the acts.

**Deferred, and why:** C-116.41 `ESCALATION_BY_ACT_ONLY`'s translation still lists the acts without stop pursuing and reopen. R35 keeps this module's other rows as they are in T46, so a re-wording is yours or the design stream's, with T47's stamp.

**Found in other modules:**
- `words.json` holds no `refusal.ALREADY_ATTACHED`, so C-116.14 keeps its own sentence.
- The new ops are seen by affordances' "R1 R12: layer 9's op maps…" test (`escalationreopen`, `escalationstoppursuing` unaccounted). Rule 5 already names this red, until T46-45 (with -44, -51, -59, -62).
- `attachConditions` is the read affordances R51 offers stage-7 attachment through (T46-45).

**Reading:**
- Read whole by me: requirements, and code (`index.mjs`, `checks.mjs`, `doc.mjs`, `ops.mjs`, `schema.mjs`), plus the layer-9 entry and the plan's opening rules.
- My tests (all 13 files, 3,478 lines) and the used modules' public parts were each read in full by a helper in this session, which wrote me a digest citing each section (mechanics §17 (3), K2032). The sources stay binding.
- I read T45's parked version (f0c0e4574d) whole and kept what meets R31/R33–R35. Its widened `NOT_OPEN` sentence was dropped.

**Tests:**
- `node --test bio-plane/test/m/escalation/`: tests 85, pass 85, fail 0, todo 0.
  - New: `stopped.test.mjs` (R31, R33, R35, R16, R25, R30) and `attach-sight.test.mjs` (R34).
  - Updated: `invariants` R21's states, `codes-ops` R25's fifteen arms, `structure` R30 with a stop and a reopening.
- Users of my services, against the base without my change:
  - Same results: action-plans 75/0, plan-work 40/0, monitoring 134/0, action-producers 36/0, answer-envelope 32/0, control-plane 221/2, plane 210/1. The control-plane and plane failures are identical on the base, so they are inherited.
  - affordances 231/3 against 232/2 on the base. The one added failure is rule 5's named red.

**Checks** (process repository):
- `format`: 0 failures.
- `architecture escalation`: 18 files, 0 failures.
- `coverage escalation`: 35 of 35 live ids, 0 failures.
- `ownership escalation tranche/T46`: 0 failures.
- `checks/run.mjs` over the product: architecture 2,957 files, 0 failures. Its coverage failures are other modules' (rule 5 (1)); none is escalation's.

Size (session_01QtKSd8jPA5JkqpDtCs2VMc): test runs 14, module lines 2367
