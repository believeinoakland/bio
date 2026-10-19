# action-holds (T51)

**Status** · session_01PfgbWdpc9FTqQ5aXw1t7zj · depth 2 · COMPLETE · handled B0

## Completion

**Entries applied (T51-90).**
- Reds `hidden.test.mjs` (R2) and `readers.test.mjs` (R4): both asserted `actions.actionRead`'s old `NO_SUCH_BUNDLE`; they now assert `NO_SUCH_ACTION` (actions R106). The module relays no `actionRead` refusal (a refused read is skipped in `#marks`); its own acts keep `NO_SUCH_BUNDLE` / `NOT_AN_ACTION` as R2, R5, R6 say.
- R18: `pressureFor` rows carry `hold` on every row (the latest statement at a mark's entry or placed `from` it; at a record, the latest placed `from` it; null while none; `by` was already there). Called with `action` it adds `facts` (the governing view's `threat_letter` legal facts whose `applies_to` names the action's kind or is absent, once each by key, as `{key, statement, citation, status, basis, profile}`) and `label` (`guide.procedure.legalinfo`), only when the action holds a `legal` mark; `facts: []` otherwise; `facts: null` with `facts_why {reason, detail}` when the marks or the view cannot be read. New dep `localFacts` (`governingView`).
- R19: `op=holdsdue` added to `actionHoldsOps` (exactly `holdsDue`); `holdsOf` takes `{docket_entry}`, the place being the entry's case's project, read through `docket.docketPressureOf` (an unseen or absent entry answers the docket's `NO_SUCH_DOCKET_ENTRY`; an entry without a visible `legal` mark is `HOLD_PLACE_REFUSED`; with another place it is two places, refused).
- Words (K3949, K3962): the `inline` finding and every refusal `detail` this module mints now read through `localize('action-holds.index.<slug>', …)`; the handlist at `places.test.mjs` is assembled from membership's `noSuchProject` and action-records' `correspondEntryRefusal`; the t46 copies are `localize` reads. `node checks/words.mjs … action-holds` shows 0 findings; the joint run over the 13 L9 modules names no line of this module.
- Tests: `t51.test.mjs` (R18 x3, R19 x2); `holds.test.mjs` R2 now expects `hold: null` (not absent) on a mark of another kind (R18).

**My readings (BOB may overrule).** (1) "the action holds at least one legal mark (R1) or record": a pressure record belongs to a project, not an action, so only the action's own `legal` marks open `facts`. (2) A record's `hold` is the latest statement placed `from` it, since a project place is every record's.

**Deferred.** None.

**Found in other modules.** (a) `op-declarations`: `holdsdue` is a new op of this module's map with no spec yet (T51-121/T51-122's owners); there is no op serving `holdsOf`, so the `hold` screen cannot read a place's statements by `{docket_entry}` until one is declared. (b) `rows.mjs` is stale for this module's new ids (BOB regenerates at the layer close).

**Strings no member reads (not converted; for BOB with the design stream, K3944).** The developer errors `action-holds: the actions cannot be read`, `action-holds: record-core refused the purge declaration…`, `action-holds: doorbell refused the litigation-hold reader…`, and the identifiers/codes in refusals.

**Ran.** `node --test bio-plane/test/m/action-holds/`: 44 pass, 0 fail. Dependents (filings, plan-work, action-producers, op-declarations, affordances, screens-action): same failures as at the START (filings 2, action-producers 1, op-declarations 9, affordances 4, screens-action 2; none touches this module), plan-work 50 pass. Checks: format 0 failures; architecture 0; coverage for action-holds 19 of 19 ids named; ownership 0; words 0 findings; `setup-words/build.mjs --check`: stale-rows note only.

Size (session_01PfgbWdpc9FTqQ5aXw1t7zj): test runs 14, module lines 1251

## J1 · COMPLETE

T51-90 applied: R18 (hold on every pressureFor row; facts/label/facts_why with an action), R19 (op=holdsdue; holdsOf {docket_entry}), the R106 reds green, words 0 findings. Two readings and two cross-module findings (op-declarations: no spec for holdsdue, no op serving holdsOf) are in my record. Tests 44 pass; checks clean.
