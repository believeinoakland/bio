# BOB to affordances (T7)

**Read** · handled J5

## B1 · START

Depth 2. Your entries are in `build/plan/current.md`, layer 11, with the forwarded items at the plan's foot ("Forwarded to these jobs at their start" and "Forwarded to later jobs in T7") naming you. Apply each only as far as the item gives it to you. The layers below are merged into `tranche/T7`, and so are their records (`build/jobs/T7/`), which the forwarded items cite. Your module is extracted per its map (`build/extraction/affordances.md`) and requirements; the extraction rule of mechanics §12.2 holds for legacy-store.

## B2 · CHANGE

Correction to B1 (it replaces B1's last sentence; the rest stands): this tranche does not extract affordances. Apply only your entries in layer 11 (N84, N114's share, N115) and the forwarded items naming you, within your own paths. Where an item reaches into legacy-store or legacy-index, which are not yours here, REPORT it rather than editing them. Your extraction is a later tranche's.

## B3 · CHANGE

This replaces B2 and B1's last sentence; the rest of B1 stands.

This tranche does not extract your module whole. It applies only your layer-11 entries and the forwarded items that name you, as far as each gives them to you.
- Where an entry changes a legacy module in your `from`, the extraction rule of mechanics §12.2 holds. You may remove code, and you may rewire the legacy code to your module or to another module's service with an import and its uses. Queue's N112, which rewires `#counts` and `#obligationsBiasDebt` to read through retrieval and bias, is of this kind.
- An addition beyond that goes in a REPORT to me, not into the legacy module. Adding `pdfstructure` to legacy-store's `PROJECT_NAMING_READS_NOT` list is such an addition.
- Items that say "when queue extracts" (RUN-PRODUCTIONS #1 J2.6, AI-RUNS #2 J6.5) are for that later job. Leave them.

## B4 · ANSWER · re J1

(K208) I folded R6 on `tranche/T7`: `DISPOSITIONS` is inquiry's, and Uses matches. Merge the tranche.

**Q1.** Test every id at the interface as it stands today, wherever its code sits. R13–R17 go through `op=affordancefacts` and `op=affordances`, as you propose.
- An id whose behaviour holds is met, even if its code is still in legacy-store or legacy-index. P7 asks about behaviour, not where the code is.
- An id that does not hold gets no red test and no pin of today's behaviour. Name it in a `test.todo` that states the requirement and its cause, as capture-sources' R37 does (K48). List it in a QUESTION or in your COMPLETE, and I mark it `*(not yet met: …)*` in the requirements.
- R26 waits on `actions`; give it the same treatment.
- For R27, send me your proposed reassignment of the 42 `undetermined` ops, and I will rule on it.

**Q2.** Adopted. Add the NON_ACTS and rung rows for intent's mutating ops now, keyed to `intentOps`, and state the transient red in your record. LEGACY-INDEX #4 is adding their OPS and NEEDS rows in this layer (INTENT J4.2).

**Q3.** Adopted, as folded above. The other objects stay as you list them.

## B5 · ANSWER · re J2

(K211) All three are adopted and folded on `tranche/T7`. Merge the tranche.

It now also carries QUEUE #1's merge (`store.mjs` gains `proposalFindingItems`' call). A conflict with your branch is possible there; resolve it in the merge.

- **Q4.** R2's `reasoned` list gains your eight ops. The absences stand as you graded them.
- **Q5.** R12 now reads `{op, mutating, gated}`, as you built it.
- **Q6.** R2 now carries your R27 ruling:
  - to `reasoned`: `biasdebtresolve`, `actionrisktier`, `narrow`;
  - to `reversible`: `versionaccept`, `versioncurrent`, `actionlaws`, `projectvisibilityset`;
  - the 34 stay `undetermined`.

Move the rows, extend the family, and turn R27's `test.todo` into a test. In your COMPLETE, name R27 as met, and I lift its mark.

## B6 · ANSWER · re J3

(K212) Both are folded on `tranche/T7`. Merge the tranche.

- **Q7.** `jurisdictions` is in your `uses` and Uses (`list`, `get`, `combine`). Keep reading the place names from the profiles.
- **Q8.** Option (b). R19 now holds the refusal only where the act revises what stands. `inquiryground` stays `reasoned`, and its first grouping asks no reason. Turn the `test.todo` into a test of both cases.

Your J4 is routed:
- 3 goes to LEGACY-INDEX #4;
- 4 goes to LEGACY-TESTS #4;
- 1–2 are N176, for your extraction;
- 5–6 are N177;
- 7 is handled at the close;
- 8: R3 now names R12 as its totality.
