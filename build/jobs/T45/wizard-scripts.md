# wizard-scripts (T45)

**Status** · session_01LvyhffaPeeTv75JqLtwjLD · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R13's T45 append ("`machineDrafts` also holds the labelled machine drafts T45's owners serve, once `op-declarations` declares them … A script's step may then carry `{machine: <op>}` for them on acts not in `machineRefused`"). Two readings I need confirmed; I carry on with both as stated.

(1) "Once declared" at my interface. The list is the plane's to pass (plane R19's `MACHINE_DRAFTS`), and T45's op names are not fixed until T45-45 (today only `agent-worker`'s `infractiondraft` task exists, no op; no chance-to-fix draft op is named). My reading: as R13 already does for acts since T37, when an op table is registered, a registered machine draft whose op the table does not hold is not registered, so `{machine: <op>}` for it is refused `WIZARD_DRAFT_REFUSED` until `op-declarations` declares it, and is accepted, with no change here, once it does. The plane may then list the T45 drafts at once. Today's four (`whatchangedpropose`, `escalationreasondraft`, `groupdescriptiondraft`, `writinghelp`) are all in `OPS`, so nothing changes for them. The plane's adding the T45 names to `MACHINE_DRAFTS` is plane's (I report it, not change it).

(2) "on acts not in `machineRefused`". R12 lets a registered machine draft sit on an act in `machineRefused` (the DEC-101 exception), except the two help drafts. My reading: the sentence states where the T45 drafts are placeable and does not narrow R12's exception; I add no frozen list of T45 names (they are not fixed). The alternative is a second exception list like `HELP_DRAFTS` naming T45's drafts once T45-45 fixes them, which I cannot write now. In practice their act is `communicationprepare`, not in `MACHINE_REFUSALS`.

## J2 · COMPLETE

**T45-37 applied on `job/T45/wizard-scripts` (0308642e1b).**

**Read whole by me (P20):** `build/requirements/wizard-scripts.md`; every file under `src/wizard-scripts/` (the two generated data files, `screen-registry.mjs` and `civicsmith-library.mjs`, excepted as generated, K2053), and all 13 test files and the fixture under `test/m/wizard-scripts/`; T45-37, rule 4 (15) and the reconciliation in the plan; `draft-T45-upper.md` "wizard-scripts" and its doubts; K2780, K2781, K2787; `BIO_Action_v0_2.md` rules 11 and 19. The over-limit part (the used modules' public parts: record-grammar, record-core, membership, filing-templates, credentials; and layer 11's contract) was read in full by a helper in this session, given my entries and their users, writing a digest that cites each section (mechanics §17 (3)). Nothing in it disagrees with the change. It confirms the withholding must follow `offeredVersion`'s answer, not visibility alone (filing-templates R15, R26, R28: an unreviewed, shadowed, ambiguous or court template of the handle also withholds), and that is how it is built.

**Entries applied**
- **R22 (first clause; N858, K2781 (6)).** Before this job, the library's `{template}` drafts were judged by shape only, so "Get a record" (and "Start and send") were offered whatever filing-templates offered. Now a library script is withheld from a viewer, in `wizardsAt`, the registry form (R21), `startFrom`, `wizards` and `wizardRead`'s `offered`, while any of its `{template}` drafts is not answered `ok` by `filingTemplates.offeredVersion` for that viewer (by handle, R26, with no project). It is judged at each read, so the script is offered once a "Records request" template is, with no new registration and the library data unchanged. R14 still judges by shape, and "Get a record" is not required. "Start and send" stays withheld, as the plan says (K1883; its `@communication` is the design stream's).
- **R13 (Actions D25, D26; K2880, both readings confirmed).** With an op table registered, a machine draft named in `machineDrafts` counts as registered only once the table holds its op, so `{machine: <op>}` is refused `WIZARD_DRAFT_REFUSED` until `op-declarations` declares it. R12's refused-act exception is unchanged. Today's four drafts are all declared.
- **K2851 (inherited reds).** The fixture now hands filing-templates a made-up test profile (one records-request kind, its template attributed per R15 and named "Records request"), with an unreviewed case and an under-the-label-name case. It no longer imports `jurisdictions`, which is not one of my uses (the architecture check). This clears the 7 reds.

**Also fixed (my module)**
- The withholding above was a flaw beside the entry: R11 offered a library script whose template step R12 refuses.
- The fixture's comment named `machineRefused` "affordances'", where it is op-grades' (R5; K1974), as AFFORDANCES' T44 record noted.

**Tests changed, none weakened:** the R12 handle test uses the under-the-label world. Two real-library tests expect "Start and send" withheld. The fixture's `OPS` holds the drafts it registers. New tests are in `t45.test.mjs`: R22 offered and withheld across every read, with controls (unreviewed, other handle, R14); R22 offered once a template is and withheld again; R22 the template only at `communicationprepare` after `actioncreate`; R13 declared and undeclared, with controls.

**Deferred:** nothing.

**Found in other modules**
- **plane (R19):** `MACHINE_DRAFTS` gains T45's drafts once their op names are fixed (T45-45). They are inert here until declared (K2880; PLANE #33 told by BOB).

**Tests**
- wizard-scripts: 80 pass, 0 fail.
- My users (affordances 218/8, queue-producers 84/0, instance-setup 135/0, op-declarations 132/1, answer-envelope 25/6, store-door 44/0, control-plane 219/4, plane 188/8): every red is the same named test as on `origin/tranche/T45` without my change (diffed). None is mine.

**Checks** (from civicos-process)
- format: 153 modules, 152 requirements files; 0 failures.
- architecture wizard-scripts: 27 product files, 59 relative imports; 0 failures.
- coverage wizard-scripts: 28 of 28 live requirement ids named by a test; 0 failures.
- ownership wizard-scripts tranche/T45: 0 failures.

Size (session_01LvyhffaPeeTv75JqLtwjLD): test runs 12 (plus 3 of my users' suites), module lines 2538
