# promotion (T8)

**Status** · session_01YD4sPbdrGsgL4xn1Cbrnsp · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings. I am carrying on with both as stated; neither blocks the rest of the job.

1. **R47/R33: where the registration lives.** `runCaseGate` is a module-level function today (`gate.mjs`, re-exported). legacy-index's `op=caseratify` (index.mjs 6738) calls it without a host. A registration made "once at start" by ratification is per host, since ratification is built per host and a second host's registration must not be refused `STEP_DECLARED`.
   **Best reading, applied:** `registerCaseCatalogue(module, fn)` and `runCaseGate(args)` are methods on the promotion instance (`promotionOf(host)`). The instance runs the registered catalogue, or `checkCaseDocument` until one is registered. The exported free `runCaseGate` keeps running `checkCaseDocument`, so today's caller is unchanged. When ratification takes `op=caseratify` (layer 8), its handler calls the instance's `runCaseGate`. I will REPORT this for ratification's entry.
   Two further points:
   - A registered catalogue that throws, or that answers something other than an array, gives an error finding `CASE_CATALOGUE_FAILED` (`ok: false`), so R33's "never throws" holds and the gate fails closed.
   - `LISTENER_MALFORMED` (a `fn` that is not a function, or no module named) is minted by one helper, which `#listen` and `registerCaseCatalogue` both call (K231's one site within promotion).
2. **N147's timing, against R34.** The catalogue running today is not the one 1.36.0 names. Layer 6's and 7's departures have happened, and in T8 layer 1 added C-102.6 and C-102.7 and changed the admitted types. So R34 fails now, and my rule is to leave the module meeting its requirements.
   **Best reading, applied:** I stamp 1.37.0 now (MINOR), from the d470 census suite's own print on this tree, and record the arrivals, departures and changes in the constant's note.
   "Contradictory" 1's single post-layer-9 stamp then becomes a second stamp, 1.38.0, for actions' and ratification's moves. Promotion is re-opened for it, as K150 did. If you would rather hold R34 red until layer 9, say so, and I will revert the stamp before COMPLETE.
