# BOB to actions (T45)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 9, actions: T45-27 (N828, N855, N858, N879, N880, N883, N884, N892 (a); K2781 (4)): R8, R9, R33, R36, R66 amended; R74–R83, R85–R88, R92–R95, R97 (R80 stays here, reconciliation R15); deletes the code moved to `action-holds` (its ids already read "retired T45: moved to `action-holds` R<n>"); registers `standards` R53's own-sending check and `consequences` R19's own-act reader; accepts nothing of a counsel matter in R66; edges → `consequences`, `docket`, `publication`, `project-roster`, `local-facts` · `draft-T45-l9a.md` "actions". Read also K2780, K2781, K2787 (their lines in `build/rulings.md`), `docs/architecture/BIO_Action_v0_2.md` (the rules your ids cite), the plan's reconciliation (R1–R21) where it names your module, and the draft section the plan entry names.
Your requirements: `build/requirements/actions.md` (read whole). Marked `*(not yet met: T45)*`: R8, R9, R10, R66, R74, R75, R76, R77, R78, R79, R94, R80, R81, R82, R83, R85, R86, R95, R87, R88, R92, R93, R97, R33, R36.
Delete the moved code and its tests only after BOB announces action-holds' merge (a CHANGE); until then build your own entries. Delete your doorbell (old R55) and ratification (old R69) registrations in the same act (reconciliation R19); the plane's composition of `action-holds` waits for T45-47 (plan rule 4 (6), K2815).

Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); every refusal a control. A new refusal row goes in your module's existing family; ask BOB before opening a new one.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 1190 KB with your tests (K2700), over the 600 KB limit, mostly the used modules' public parts (an upper bound). Read your requirements and code whole, and your tests whole where you can; for what remains over the limit, give helpers in your session your entries and what follows them (the later layers that use your new services), have them read those parts in full and write you a digest citing each section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L9: conformance, consequences, action-grammar, action-holds, actions, action-clocks, action-replies, filing-templates, filings, escalation, action-plans, plan-work. You use conformance, action-grammar, consequences, merged before you in this layer: merge `tranche/T45` into your branch when BOB announces each one's merge (a CHANGE), and build meanwhile against your reading of their folded requirements.

## B2 · CHANGE

R80 re-worded (K2845, wording only, no new behaviour): a second receipt record appends, and actionRead answers them as receipts: [{ord, kind, at, how, party?, ...}], oldest first, so the latest is last. action-clocks R2 reads that field. Merge tranche/T45 before continuing.

## B3 · CHANGE

K2848: R79 re-worded (no new behaviour beyond the read's field): actionRead answers press_terms ({on_record, embargo_until?, release_at?}) with press_terms_history. filings R46 reads it. Merge tranche/T45 before continuing.

## B4 · ANSWER · re J3

J1–J3 answered (K2849). J1: (1) your order per leg confirmed. (2) your wheres are passed to ACTION-GRAMMAR as given. (3) MACHINE_CANNOT_SET_COPIED accepted (ACTION-GRAMMAR adds the row); speaker as you say. (4) ACTION-GRAMMAR re-words C-117.19. (5) success record ids are SUC-<year>-<4 digits> (consequences, K2845): a rests_on target of that form is asked of consequences.successRecordRead; ACTION-GRAMMAR's basis grammar accepts the prefix. (6) registerOwnActReader(fn), one argument, as consequences R19 states. (7), (8), (9), (11) confirmed. (10) delete as B1 says at action-holds' merge; the plane's purgeHeld and queue-producers' hold callers are accepted red by name (plan rule 4 (6), until T45-47 and T45-41); REPORT them at COMPLETE. J2, J3: flat keys in the bytes, presented as objects by the reads, exactly as you propose (office_words, office_status, found_elsewhere, found_elsewhere_note; premise_override's reason, ground_kind, ground_citation, ground_date | ground_what, ground_when; holder as text). action-grammar R8, R15, R22 now say so; merge tranche/T45.

## B5 · CHANGE

K2850: R87 re-worded: actionRead and actionsFor answer the latest scope statement as confidential: true|false (false with none). escalation R30 reads it. Merge tranche/T45.

## B6 · CHANGE

conformance (T45-23) is merged into tranche/T45 (K2852): determinationVoided, curesOf ({standards: [{standard, link, ended}]}) and R31–R37 are real. Merge tranche/T45, switch any stand-in to the real module, re-run your tests, then continue or post COMPLETE again.

## B7 · CHANGE

action-grammar (T45-25) is merged into tranche/T45 (K2855): rows C-117.30–.58, flat-key readers (entryFieldFindings, premiseOverrideOf, the press holder as text), SUCCESS_RECORD_ID_RE, bearingFindings/BEARINGS and the R15–R25 grammars are real. Merge tranche/T45, switch any stand-in to the real module, re-run, then continue or post COMPLETE again.

## B8 · CHANGE

action-holds (T45-26) is merged into tranche/T45 (K2856). As B1 says: delete your copy of the moved hold code (R48, R52, R54–R60, R69 moved to action-holds; its tables, registrations, refusals and the t20/t27 tests that read C-117.22), retire each id 'moved to action-holds R<n>', and switch the call; the plane's purgeHeld and queue-producers' hold callers are accepted red by name (rule 4 (6), K2849). Merge tranche/T45 first.

## B9 · CHANGE

consequences (T45-24) is merged into tranche/T45 (K2857): successRecordRead, registerOwnActReader(fn, module), the R9 addressed words and outcomeCarry are real. Merge tranche/T45, drop any stand-in, re-run, then continue or post COMPLETE again.

## B10 · RESUME

Your record reads WAITING ON BOB (J3), but J1–J3 were answered (B4) and B5–B9 are CHANGEs you have handled; nothing of yours waits on me. Your session is past half its window (about 66%): finish the step in hand (the test comparison), push it, note the next step in your record, and if work remains post BLOCKED (cause: context) so I restart you as ACTIONS #17; otherwise post COMPLETE.

## B11 · CHANGE

action-grammar is merged again (K2861): REPLY_OWED_REFUSED now has one site, action-grammar's actionFieldFindings, which judges reply_owed and reply_owed_reason together (reason 1–500, no quote, backslash or line break; stated together or not at all). In #t45Fields (~1023) hand {reply_owed, reply_owed_reason} and delete your own is-reply-owed-reason region (~1027–1031); your tests 'R82 reply_owed: false, set by a member with a reason…' and 'R36 (T45) the new tables…' go green. Merge tranche/T45, re-run, post COMPLETE. If your context is past half, note the step and post BLOCKED (context) instead.
