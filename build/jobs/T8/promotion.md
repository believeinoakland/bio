# promotion (T8)

**Status** · session_01YD4sPbdrGsgL4xn1Cbrnsp · depth 2 · COMPLETE · handled B2

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

## J2 · REPORT

Found in other modules or artifacts by this job. None of them is changed here.

1. **legacy-checks (next plan, K233 (1)):** `CASE_CATALOGUE_FAILED` needs a catalogue row. The case gate mints it when a registered case-document catalogue throws, or answers something other than a list of finding objects; the gate then fails closed (R33).
   Its site is `src/gate.mjs runCaseGate`, a whole-function `where`: the function mints only that code.
   Suggested translation: "The checks a case document must pass could not be run over this one, so it was not passed. The fault is in the checks, not the document, and nothing was signed."
2. **legacy-checks, next plan (K231's three deferred rows):** `STEP_DECLARED` is now minted at one site, the helper `stepDeclared` in `src/promotion/index.mjs`, which `registerStep`, `registerFact` and `registerCaseCatalogue` all call. Its row's `where` can now name that helper.
   `LISTENER_MALFORMED` is minted at one site within promotion (the helper `listenerMalformed`, called by `#listen` and `registerCaseCatalogue`); the other modules' sites wait on N202.
3. **legacy-tests (layer 11, N147's share and J3.6's re-pins):** after this job, `civicos-ui/check-refusal-codes.mjs` goes from 102 to 100 failures.
   - Cleared: the two region failures, `is-fact-named` and `is-step-named`.
   - Cleared: arm C's collapsed corpus. outcomeReturns now reads 206 against its floor of 205.
   - Every other failure it reports is a ratchet to re-pin from its print: codesChecked 676, refusalsJudged 668, regions 283, outcomeReturns 206. regionLines is 4357, against a floor of 4705.
   - `d470-catalog-census.test.mjs` A3 and A9 need the 1.37.0 row. Record it from the suite's own print: count 491, digest `42a9d0a3f36d1af8d714458aa8af2916b5b07034c6fd28427aeb8e5c746014f0`, source `17c6fd162802b67d0bfacfbd930611cb14b7b11004cb519e111180aa97dd86a4`, with the changed checks the constant's note names. The suite's (A5) literal, and any `gateVersion` literal pinned in the old battery (`ratify.test.mjs`), move with it.
4. **Generated artifacts (§14):** this job changes `bio-plane/src/gate.mjs` and `src/promotion/index.mjs`, so `agent-worker/dist/agent-worker.bundled.mjs` is stale. `fleetbundles` fails the agent-worker rows. `bio-plane/dist/bio-plane.bundled.mjs` embeds the same sources, so it is stale too. Regenerate both at the layer close.
5. **N70 (meaning-bounds), for the record:** promotion's `#fact` now returns its `FACT_UNAVAILABLE` refusal flat (`{ok:false, …}`) or `{ok:true, value}`; it no longer nests the refusal. The D-240 (b) arm's list on this tree names no promotion function: `pdfStructure`, reevaluation's `adoptVersion` (N182 (4)) and citation's `#document` (N196). The arm is still red on those.
6. **Reds seen in users' suites, the same on the tranche base as here:**
   - citation R5 (the retiring types; LEGACY-CHECKS #3 J3 item 3).
   - intent R26 (`STATE_MOVE_UNDECLARED`; in intent's layer-7 entry).
   - connections "R24, R18, K155" (the capture and extraction creates carrying the env). This one has no entry I can find: connections has no T8 job.
