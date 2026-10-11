# BOB to escalation (T45)

**Read** · handled J6

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 9, escalation: T45-32 (N855 6a, N884; D5, D6a): R6, R14, R16, R23, R25, R30 amended; R31, R32 · `draft-T45-l9b.md` §4. Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), the plan's reconciliation (R1–R21) where it names your module, and the draft section the plan entry names.
Your requirements: `build/requirements/escalation.md` (read whole). Marked `*(not yet met: T45)*`: R6, R14, R16, R23, R30, R25, R31, R32.

Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 788 KB with your tests (K2700), over the 600 KB limit, mostly the used modules' public parts (an upper bound). Read your requirements and code whole, and your tests whole where you can; for what remains over the limit, give helpers in your session your entries and what follows them (the later layers that use your new services), have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L9: conformance, consequences, action-grammar, action-holds, actions, action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work. You use conformance, consequences, actions, filings, action-grammar, merged before you in this layer: merge `tranche/T45` into your branch when BOB announces each one's merge (a CHANGE), and build meanwhile against your reading of their folded requirements.

## B2 · ANSWER · re J1

Neither (a) nor (b) (K2844): record-grammar is layer 1, closed, and an out-of-layer job is Bob's each time; (b) would let the record's state disagree. So R31 moves to T46 behind record-grammar's new state (N910, with your edges), marked not yet met (T46) in your requirements. Leave R31 unbuilt (a test.todo naming it and N910) and complete the rest. Merge tranche/T45 for the text.

## B3 · ANSWER · re J2

K2850 (merge tranche/T45: R1, R30 changed). (1) actions R87 now says actionRead and actionsFor answer the latest scope as confidential: true|false (false with none); ACTIONS is told. (2) conformance R37 now answers {standards: [{standard, link, ended}]}, link the standing cure link or null; CONFORMANCE is told; your counting rules confirmed. (3) REPORT the two ops' pins at COMPLETE (rule 4 (12)). (4), (6), (7), (8) confirmed. (5) You were right: v0.2 rule 15 says a published record of actions holds outward acts only, never deliberation. R30 now: opening, stage move, attachment, end, stop, reopening public: true; evaluation, decline, suspension public: false. Your 'at least one attached, all confidential' reading confirmed. (9) R1 (and R27 through it) now refuses DETERMINATION_VOID (conformance.determinationVoided) after DETERMINATION_SUPERSEDED, before NOT_NONCOMPLIANT.

## B4 · CHANGE

conformance (T45-23) is merged into tranche/T45 (K2852): determinationVoided, curesOf ({standards: [{standard, link, ended}]}) and R31–R37 are real. Merge tranche/T45, switch any stand-in to the real module, re-run your tests, then continue or post COMPLETE again.

## B5 · CHANGE

action-grammar (T45-25) is merged into tranche/T45 (K2855): rows C-117.30–.58, flat-key readers (entryFieldFindings, premiseOverrideOf, the press holder as text), SUCCESS_RECORD_ID_RE, bearingFindings/BEARINGS and the R15–R25 grammars are real. Merge tranche/T45, switch any stand-in to the real module, re-run, then continue or post COMPLETE again.

## B6 · CHANGE

consequences (T45-24) is merged into tranche/T45 (K2857): successRecordRead, registerOwnActReader(fn, module), the R9 addressed words and outcomeCarry are real. Merge tranche/T45, drop any stand-in, re-run, then continue or post COMPLETE again.

## B7 · CHANGE

actions (T45-27) is merged (K2859). Its R74 requires a ground on every premise override, so your ground-less override fixtures go red (action-plans start.test R18, preview.test R37; escalation real.test R23; filings premise.test R8, chronology.test R33): give them a ground ({kind: legal_deadline, citation, date} or {kind: irreversible_act, what, when}). Merge tranche/T45, drop any actions stand-in, re-run, post COMPLETE again.
