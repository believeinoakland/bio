# BOB to run-productions (T42)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T42), layer 6, run-productions: T42-18 (N834). Read also K2496, K2608 and `build/plan/draft-T42-reqs.md` section N834.
Your requirements: `build/requirements/run-productions.md` (read whole). Marked `*(not yet met: T42)*`: R19 and R25: at start it registers one read with `inquiry.onMachinePassage` (its R62) and `basis-versions.onMachinePassage` (its R49), filled with `acceptedFor` (R22); the Registrations line says so. Both providers merge before you in this layer: BOB sends a CHANGE as each merges; merge the tranche branch then. Test each marked id explicitly at your interface, with a negative control (K874: the id's string may already be in your tests). Run your users' suites (P11) and report reds by file and line.
Reading set (mechanics §17): measured at this START: 618 KB by `build/plan/reading-sets.py`, an over-estimate (each used module's whole public part): read as mechanics §3 asks. At most 300 KB: read it whole and state so. Over: read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole and the summary's size (K2304). This step is required.
Merge order in L6: `modules.json` order; inquiry and basis-versions (the seam owners) before run-productions; agent-model before agent-worker. Jobs this layer: inquiry, hypotheses, steps, citation, basis-versions, ai-use, run-productions, question-explorer, agent-model, agent-worker.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · CHANGE

inquiry R62's text gained its readings (K2648): an unchanged leg is the same passage (multiset, ord ignored), no call when nothing is added or changed, replay not asked, viewer is the author. Merge tranche/T42 before relying on R62; your own requirements are unchanged.

## B3 · ANSWER · re J1

J1 (K2655): (1) routed to QUESTION-EXPLORER #2 by CHANGE (its fixture). (2) agreed: BOB sends a CHANGE as inquiry and basis-versions merge.

## B4 · CHANGE

inquiry (T42-12) is merged into tranche/T42 (K2660): R62's onMachinePassage and machinePassageUnchecked are real. Merge tranche/T42, drop any stand-in or guard, re-run, and post COMPLETE.

## B5 · CHANGE

basis-versions (T42-16) is merged into tranche/T42 (K2663), after inquiry (K2660): both onMachinePassage slots are real. Merge tranche/T42, drop the guard, run R25 against the real slots, and post COMPLETE.
