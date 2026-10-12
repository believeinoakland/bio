# BOB to queue-producers (T45)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 11, queue-producers: T45-41: delete the code moved to `action-producers` (its ids already read "moved to `action-producers` R<n>"); R8 answers action-producers' items as it reads `machinery-producers`; edge → `action-producers`. Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), the plan's reconciliation (R1–R21) where it names your module, and the draft section the plan entry names.
Your requirements: `build/requirements/queue-producers.md` (read whole). Marked `*(not yet met: T45)*`: R8, R25, R36.
Delete the moved code and its tests only after BOB announces action-producers' merge (a CHANGE).

Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1383 KB with your tests (K2700), over the 600 KB limit, mostly the used modules' public parts (an upper bound). Read your requirements and code whole, and your tests whole where you can; for what remains over the limit, give helpers in your session your entries and what follows them (the later layers that use your new services), have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L11: wizard-scripts, op-grades, affordances, action-producers, queue-producers, notice-producers, queue, instance-setup, op-declarations, installer, stewards, plane. You use wizard-scripts, action-producers, merged before you in this layer: merge `tranche/T45` into your branch when BOB announces each one's merge (a CHANGE), and build meanwhile against your reading of their folded requirements.

(K2878) At this START: installer (T45-46) does not run in T45 (the stewards' contact address is Bob's to name and is not yet named, K2799); T45-46 moves to T46. The L11 merge order is therefore: wizard-scripts, op-grades, affordances, action-producers, queue-producers, notice-producers, queue, instance-setup, op-declarations, stewards, answer-envelope, plane last.

## B2 · ANSWER · re J1

K2882: `facts.action` stands. J2 received: at your merge I drop the six edges, refresh the stale Uses lines and re-word R33, R35 (R20 → action-producers R6) and R36 (no day derived here). Queue has added actionHolds, following, planWork to PRODUCER_DEPS. You delete after action-producers merges: wait for my CHANGE.

## B3 · CHANGE

K2888: action-producers (T45-40) is merged into tranche/T45. Merge it in, apply your prepared deletion, add the test through the real action-producers, run queue's and the plane's feed tests, and post COMPLETE.
