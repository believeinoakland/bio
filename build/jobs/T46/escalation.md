# escalation (T46)

**Status** · session_01QtKSd8jPA5JkqpDtCs2VMc · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings I am building on; none blocks me. Answer only where you read otherwise.

1. **R34 `attachConditions` at a stage other than 7.** It answers `ok: true` with the escalation's `stage` and `purposes: null`, saying counterparty conditions are judged at stage 7 only (R9 asks them nowhere else); its only refusals are R9's for an absent or invisible escalation (`NO_SUCH_ESCALATION`) or action (`NO_SUCH_ACTION`, actions R43). It is a module read with no op arm: R25 names none, and T46-51 specifies only R31's two ops.
2. **R31, R35 `NOT_OPEN`'s site.** Stopping now answers `NOT_OPEN` too (ended or already stopped), and so do `escalationEnd` and `escalationSuspend` on a stopped escalation (it is reopened first; record-grammar R57 holds no edge `stopped_pursuing` → `ended` or `suspended`). To keep DEC-49's one code at one site, `NOT_OPEN` is minted by one function, `refuseNotOpen`. Its row's `where` moves from `#edgeArgs > is-edge-open` to `refuseNotOpen > is-escalation-open`. Its check C-116.27 and its translation are unchanged (R35). Answer-envelope's `catalogue-end` pin is check plus translation digest, so it stays green.
3. **A stopped escalation's other acts.** Attach and evaluate behave on a stopped escalation as they do on a suspended one, so they are not refused: R31 names only the edges (`NOT_OPEN`, R13) and the end. Resume answers `NOT_SUSPENDED`. R1 and R27 answer `ALREADY_OPEN`, naming it.
