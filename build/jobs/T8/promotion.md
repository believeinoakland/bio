# promotion (T8)

**Status** · session_01YGxAM3S1q5VWSShovpg56h · depth 2 · COMPLETE · handled B3

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

## J3 · COMPLETE

**Every entry is applied.** Code is at commit a99312070e (merged with `tranche/T8` at da7be427ca, taking K233).

## Entries applied

- **N67 and N69, promotion's share (R47, R33; K202, K233):**
  - `registerCaseCatalogue(module, fn)` and `runCaseGate(args)` are methods on the promotion instance. The instance runs the registered catalogue, or `checkCaseDocument` until one registers, with the same answer shape and `GATE_VERSION`.
  - A second registration, by any module, is `STEP_DECLARED`. A missing module or function is `LISTENER_MALFORMED`.
  - A registered catalogue that throws, or does not answer a list of findings, gives `CASE_CATALOGUE_FAILED` (`ok: false`), so the gate never throws and never passes a document it did not judge.
  - The exported free `runCaseGate` in `gate.mjs` takes the catalogue as an optional second argument, defaulting to `checkCaseDocument`. Today's caller, `op=caseratify`, is unchanged. Ratification's handler moves to the instance gate, as its entry now says.
- **N142, promotion's share (R48, K230):** `INLINE_MAX` was already built. It is now documented as R48, and a test pins the value 1,048,576 and checks the byte-exact edge (UTF-8 bytes, not characters) for `bundle.md` and other files, at creation and revision.
- **N70, promotion's share:** `#fact` answers `{ok: true, value}`, or the flat `FACT_UNAVAILABLE` refusal, never nested. Its three callers return that refusal directly.
- **N147, promotion's share (K233):** `CATALOG_VERSION` moves 1.36.0 → 1.37.0, MINOR. The constant's note records the census the d470 suite prints on this tree: 550 → 491 checks, sha256 42a9d0a3…, source 17c6fd16…. It also names the departures (T7's layers 6–7) and the arrivals and changes (T8's layer 1).
- **N202, promotion's share (K231):**
  - `STEP_DECLARED` is minted at one site, the helper `stepDeclared`, which `registerStep`, `registerFact` and `registerCaseCatalogue` all call.
  - `LISTENER_MALFORMED` is minted at one site within promotion, the helper `listenerMalformed`.
  - The regions `is-fact-named` (in `registerFact`) and `is-step-named` (in `registerStep`) are marked. Their refusals now carry C-102.6 and C-102.7's check and translation, and `FACT_UNAVAILABLE` and `FACT_FAILED` carry C-102.4 and C-102.5's.
- **R15's test (LEGACY-CHECKS #3 J3.1):** the prefix map now comes from the catalogue's `OBJECT_TYPES`, so every admitted type is driven, the six new ones included. It passes.

## Deferred

None.

## Found in other modules

See J2: `CASE_CATALOGUE_FAILED`'s row and `STEP_DECLARED`'s now-single site (legacy-checks, next plan); the guard's and the d470 census' re-pins (legacy-tests); the stale agent-worker and bio-plane bundles; three reds in users' suites that are the same on the base.

## Tests and checks

- **This module:** `node --test bio-plane/test/m/promotion/`: tests 64, pass 64, fail 0. New or extended tests:
  - R47 (registration, refusals, per-host, facts passed through);
  - R33 (fails closed on a broken catalogue);
  - R39/R40/R47 (`STEP_DECLARED` at every registration; C-102.6 and C-102.7 carried);
  - R48;
  - R34 (the instance gate's version);
  - R15 (over every admitted type).
- R34's other half, one version per catalogue, is held by legacy-tests' d470 census. The census is red until its 1.37.0 row is recorded (J2 item 3).
- **Users' suites** (every module importing promotion), each on this branch and on the base:
  - affordances 65/0, ai-runs 41/0, basis-versions 42/0, bias 45/0, content 50/0, inquiry 50/0, provenance 55/0, reevaluation 30/0, retrieval 58/0, strength 40/0.
  - citation 48/1, connections 59/1 and intent 29/1 fail on the same test on the base as here.
- **No layer tests** (manifest).
- **Old battery:**
  - `check-refusal-codes` 102 → 100 failures.
  - `meaning-bounds` 94/2, unchanged; no promotion function is named.
  - `d470` 11/2 (A3, A9: the re-pin).
  - `fleetbundles`: the agent-worker rows are stale.
- **Checks:**
  - format: 69 modules, 64 requirements files; 0 failures.
  - architecture: 16 product files, 53 relative imports; 0 failures.
  - coverage: 48 of 48 live requirement ids named by a test; 0 failures.
  - ownership: 6 files changed by promotion between tranche/T8 and HEAD; legacy-checks 0 lines, legacy-store 0 lines; 0 failures.

Size (session_01YD4sPbdrGsgL4xn1Cbrnsp): test runs 45, module lines 2233

## J4 · REPORT

Found by this re-opening (B3). None of them is changed here.

1. **legacy-tests (N147's share, 1.38.0):** `d470-catalog-census.test.mjs` needs the 1.38.0 row. Record it from the suite's own print on this tree:
   - count 395, digest `c22e257463a71e5ef07465bd8960687b586dd556c964b1b437451325da8b4db2`, source `4108bfa49f11a4de75a5902772fdde1d34c366eea6695a24e4796eafe5004f58` (esbuild 0.25.12);
   - `changed: ["C-2.8", "C-2.10", "C-6.1"]`: the arms `checkBundle` no longer runs (see the constant's note in `src/gate.mjs`);
   - the 1.37.0 row too, if it is still unrecorded (J2 item 3's figures), since ratifications were stamped 1.37.0 in between;
   - A5's literal moves to 1.38.0, with any pinned `gateVersion` (`ratify.test.mjs`).
   - **A1's floors are now red on the measured figures:** count 395 against a floor of 400, and 44 literal emission sites against 45. The one literal site that left is C-11.1 (`checkActionExtension`'s clock arm, now actions'). Both floors are to re-pin from the print.
2. **ratification and legacy-checks (R38, "the checks are carried"):** C-41.1–C-41.15 did not leave the catalogue file in layer 8. Ratification defines its own `CASE_DOCUMENT_FAMILY` in `src/ratification/checks.mjs`, and `bio-checks.mjs` keeps its copy for `checkCaseDocument`, promotion's fallback before a catalogue registers (R33, R47). So two definitions of the C-41 rows exist, and the census counts the file's. Once ratification registers at every host, the file's copy (and `checkCaseDocument`'s per-member arm) is a candidate to retire, which would be a departure and the next stamp. Your B3 lists C-41 among layer 8's departures; the census says it has not departed.
3. **Generated artifacts (§14):** this job changes `bio-plane/src/gate.mjs`, so `agent-worker/dist/agent-worker.bundled.mjs` is stale (`fleetbundles`: the agent-worker rows fail, ocr-worker and pdf-worker pass). `bio-plane/dist/bio-plane.bundled.mjs` embeds the same source, so it is stale too. Regenerate both at the close.
4. **actions (K253), for the record:** promotion's write-path suite no longer probes `GOVERNING_LAWS_REWRITTEN` or `RISK_TIER_REWRITTEN`. Their rows moved to `src/actions/`, which promotion cannot import, so their enforcement at the write is actions' to test.
5. **affordances (layer 9, not promotion's):** its suite reads 43/22 on this branch and the same 43/22 on `tranche/T8` @ 732edcdf90; after layer 2 it read 65/0. One cause: its fixture creates `ACTN-2026-9400-request` with `action_kind: cpra_request`, which actions now refuses on creation (`ACTION_KIND_UNKNOWN`, C-101.1: records_request, request_for_comment, other). The 22 tests that fail all build on that one refused promotion. The fix is in the affordances fixture (a kind actions offers), a legacy-tests or affordances job's to make.
6. **Other reds in users' suites, the same on the base as here (already in J2 item 6):** citation R5 (48/1) and connections "R24, R18, K155" (59/1).

## J5 · COMPLETE

**B3 is applied.** PROMOTION #7 (session_01YGxAM3S1q5VWSShovpg56h), restarted from this record at B3. Code is at commit f16a6c55b1 on `job/T8/promotion`, over `tranche/T8` @ 732edcdf90.

## Entries applied

- **N147, 1.38.0 (B3.1):** `CATALOG_VERSION` moves 1.37.0 → 1.38.0, MINOR. The figures are the d470 suite's own print on this tree: census 491 → 395, sha256 c22e2574…, behaviour source 4108bfa4…. The catalogue file's diff since the 1.37.0 stamp (a99312070e) is 1,523 lines, all removals.
  - The constant's note names all 96 departures, read by diffing the census at a99312070e against this tree. Layer 8 has 55: publication's, ratification's, case-authoring's and review's rows, as B3 lists them. Layer 9 has 41, all actions': C-11.1, C-32.3, C-32.4, C-32.18, C-32.19, C-33.3–.9, C-72.1–.8, C-73.1–.5, C-90.1–.5 and C-94.1–.11. There are no arrivals.
  - The note also names 3 checks changed under an unmoved id, arms that `checkBundle` no longer runs: C-2.10 and C-6.1 (to actions) and C-2.8's case-member arm (to ratification's registered step).
  - It names the families outside the catalogue: standards C-112, conformance C-113, consequences C-114, filings C-115, escalation C-116 and actions C-117.
  - **One correction to B3's list:** C-41.1–C-41.15 are still in the catalogue file, so the census still counts them. J4 item 2 has the detail.
- **K253 (B3.2):** `write-path.test.mjs` is re-pinned.
  - R18's floor is now 36. The measured row list confirms it: actions took `GOVERNING_LAWS_REWRITTEN` and `RISK_TIER_REWRITTEN`. Their two probes are removed, since those rows are actions' to test.
  - R17's D-741 fixture now creates its action with `counterparty: {state: named, role: Town Clerk, body: Town of Port Ellery}`. The readability refusals are asserted unchanged.
- **B3.3:** the suites are run (below).

## Deferred

None.

## Found in other modules

See J4:
- the d470 1.38.0 row, the A5 literal and A1's floors (legacy-tests);
- C-41 held twice, in ratification and in the catalogue file;
- the stale agent-worker and bio-plane bundles;
- affordances 43/22 since layer 9, from one fixture action kind (`cpra_request`) that actions now refuses;
- citation R5 and connections K155, the same on the base.

## Tests and checks

- **This module:** `node --test bio-plane/test/m/promotion/`: tests 64, pass 64, fail 0. Before the re-pin it was 62/2 (R18's floor, R17's fixture).
- **Users' suites** (every module whose uses include promotion), on this branch and on `tranche/T8` @ 732edcdf90. Every result is identical on both:
  - provenance 55/0, extraction 65/0, content 50/0, bias 45/0, retrieval 58/0, inquiry 50/0, basis-versions 42/0, strength 40/0, ai-runs 41/0, capture-requests 53/0, intent 35/0, reevaluation 39/0, publication 53/0, ratification 65/0, standards 16/0, conformance 29/0, consequences 22/0, actions 30/0, escalation 27/0.
  - These fail the same way here and on the base: connections 59/1, citation 48/1, affordances 43/22.
  - monitoring, scheduler and instance-setup have no tests yet.
- **Old battery:**
  - `d470-catalog-census`: 10 pass, 3 fail. A3 has no 1.38.0 row, A5 has the literal, and A1 has the floors; all three are legacy-tests' re-pins.
  - `fleetbundles`: the agent-worker rows are stale.
- **Checks:**
  - format: 69 modules, 64 requirements files; 0 failures.
  - architecture: 16 product files, 53 relative imports; 0 failures.
  - coverage: 48 of 48 live requirement ids named by a test; 0 failures.
  - ownership: 3 files changed by promotion between tranche/T8 and HEAD; legacy-checks 0 lines, legacy-store 0 lines; 0 failures.

Size (session_01YGxAM3S1q5VWSShovpg56h): test runs 58, module lines 2248
