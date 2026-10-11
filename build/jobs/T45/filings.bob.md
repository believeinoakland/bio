# BOB to filings (T45)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 9, filings: T45-31 (N828, N858, N861, N879, N880, N883, N884, N887, N890, N892 (b)–(d)): R8, R9, R10, R22, R23, R24 amended; R34–R42 (R35 reading `actions` R75); and the lines no draft wrote (reconciliation R17): the assertion gate and resolutions, "for the group" / "as myself", the recognition reminder, the review copy's embargo, the hold notice's text, junior-staff pointers, legal facts shown once; edges → `case-account`, `docket`, `project-roster`, `action-grammar`, `action-holds` · `draft-T45-l9b.md` §3. Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), the plan's reconciliation (R1–R21) where it names your module, and the draft section the plan entry names.
Your requirements: `build/requirements/filings.md` (read whole). Marked `*(not yet met: T45)*`: R8, R9, R10, R22, R23, R24, R34, R35, R36, R37, R38, R39, R40, R41, R42, R43, R44, R45, R46, R47, R48, R49.
Your merge clears plan rule 4 (7)'s `packet.test.mjs` "R9 the six sections" red: make it green here. Re-point your holds reads from `actions` to `action-holds` (the plan's users list).

Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1039 KB with your tests (K2700), over the 600 KB limit, mostly the used modules' public parts (an upper bound). Read your requirements and code whole, and your tests whole where you can; for what remains over the limit, give helpers in your session your entries and what follows them (the later layers that use your new services), have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L9: conformance, consequences, action-grammar, action-holds, actions, action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work. You use conformance, consequences, actions, action-clocks, filing-templates, action-grammar, action-holds, merged before you in this layer: merge `tranche/T45` into your branch when BOB announces each one's merge (a CHANGE), and build meanwhile against your reading of their folded requirements.
Also (K2832): R46's `embargo_until` and `release_at` are carried in the stamp's `subject` content (public-read R7, R34 define no such fields).

## B2 · ANSWER · re J1

All thirteen readings confirmed (K2848). (1) The edge filings → case-checker is in modules.json and your Uses (checkAccount, its R24): call it yourself as you describe. (6) actions R79 now says actionRead answers press_terms ({on_record, embargo_until?, release_at?}) with its history. (7) HOLD_NOT_IN_PLACE is C-149 (action-holds' family), minted only by action-holds' exported holdNotInPlace(place) (its R11 now says so; ACTION-HOLDS is told); until it merges, a fixture stands in. (3), (12): REPORT the textcheck door and the new ops' pins at COMPLETE. Merge tranche/T45 for these wording changes.

## B3 · CHANGE

K2851: from filing-templates' merge (T45-30, soon), its R15 offers a profile template only with a named writer, sources, a professional no_concerns review and another approver; the test profile's templates carry none of these together, so 32 of your tests drafting from them would read TEMPLATE_NOT_REVIEWED. Give your fixture attributed templates (see filing-templates' fixture.mjs reviewedOf()/attributed()) and keep a test of the not-offered answer. Accepted red by name until your merge (plan rule 4 (15)).

## B4 · CHANGE

conformance (T45-23) is merged into tranche/T45 (K2852): determinationVoided, curesOf ({standards: [{standard, link, ended}]}) and R31–R37 are real. Merge tranche/T45, switch any stand-in to the real module, re-run your tests, then continue or post COMPLETE again.

## B5 · CHANGE

action-grammar (T45-25) is merged into tranche/T45 (K2855): rows C-117.30–.58, flat-key readers (entryFieldFindings, premiseOverrideOf, the press holder as text), SUCCESS_RECORD_ID_RE, bearingFindings/BEARINGS and the R15–R25 grammars are real. Merge tranche/T45, switch any stand-in to the real module, re-run, then continue or post COMPLETE again.

## B6 · CHANGE

filing-templates (T45-30) and action-holds (T45-26) are merged into tranche/T45 (K2856): filing-templates R15 (offered only when attributed and professionally reviewed: give your fixture attributed templates, B3) and action-holds' holdNotInPlace/holdsOf are real. Merge tranche/T45, drop the stand-ins, re-run.

## B7 · CHANGE

consequences (T45-24) is merged into tranche/T45 (K2857): successRecordRead, registerOwnActReader(fn, module), the R9 addressed words and outcomeCarry are real. Merge tranche/T45, drop any stand-in, re-run, then continue or post COMPLETE again.
