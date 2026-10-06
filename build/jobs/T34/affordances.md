# affordances (T34)

**Status** · session_01D46sKU6GQxJsbHFhXN1a2o · depth 2 · WORKING · handled B8

## J1 · QUESTION

R44's `writing_help_refused`: how does affordances read wizard-scripts R24's list? R24 fixes neither an export name nor an accessor, and WIZARD-SCRIPTS #3 has not built it yet (its branch holds only mail).

My best reading, which I build to unless you rule otherwise:
1. wizard-scripts exports its named list as a frozen array (say `WRITING_HELP_NAMED`), and its instance answers the list as registered through a pure read, `writingHelpRefused()` → `{named, machine_refused, irreversible}`: `named` is that very frozen array, and the two sets are the ones `wizardRegister` was handed (arrays in registration order; `[]` before registration).
2. affordances asks for it through the in-process route it already has for the no-target answer (`op=affordancescreens`, facts.mjs `screens()`, R37). The route gains `writing_help_refused`, and `affordancesAnswer` passes it through unchanged, as it passes `screens` and `wizard_scripts`. With no registration it answers the empty sets, never absent.
3. Until wizard-scripts merges, my test drives the route with a stub `wizardScripts` dep that holds that shape. After wizard-scripts merges I merge `tranche/T34` and drive the real module.

Please confirm the method name and shape, or name another, and pass it to WIZARD-SCRIPTS #3 so its R24 exposes it. Everything else in my START goes ahead meanwhile.

## J2 · REPORT

Progress, and three findings outside my module. Pushed at the job branch's head: R42, R43, R37's `baseupdates`, R44's grades and the door's pass-through of `writing_help_refused`, DEC-149's one row (`RUNG_ABSENCE_GROUNDS.undetermined` now reads "no refusal establishes one"), and N630's share. All 200 affordances tests pass. That clears K1805's red (`t33-backing.test.mjs`:122) and K1807's two (:212, `t33.test.mjs`:135): `DUTY_NO_REASON` and `HYPOTHESIS_NO_REASON` join `JUSTIFICATION_REFUSALS`. The four checks are clean (coverage 44/44). Size: 3,926 lines (P6 fine).

Still open: one line in `facts.mjs` `screens()`, which reads `wizardScripts().writingHelpRefused()`, and its test against the real module. That waits on your CHANGE after wizard-scripts merges, per B2. Calling the method before it exists would break the plane's untargeted answer.

**N630 (K1717), measured at this branch in Miniflare.** `op=affordances` with no target answers 257,776 bytes as served. Compact, it is 195,121 bytes, so 63 KB of the 258 KB is the control plane's `json()` indentation (`JSON.stringify(…, null, 1)`, `control-plane/index.mjs`:218). Of the 195 KB compact:
- `pack` is 124,125 bytes and `fences` 22,828. Together that is 75%, and both are control-plane R41's decoration (`publishAffordances`) for the member's agent.
- This module composes about 48 KB: `vocabularies` 31,411 (of which `connection_kinds` is 13,625: R39 carries `owners()` whole as `values` and again as `words`), `catalog` 8,180, `answer_checks` 2,836, `screens` 2,612, and `capture_acts`, `set_acts` and `detail` about 3,000 together.
- What `civicos-ui/app.html` reads once per session (`loadActSource`, about :7684) is `catalog`, `vocabularies`, `capture_acts` and `set_acts`: about 42 KB.

Composing this module's part takes about 0.2 ms. `renderPack` takes about 2.7 ms and `machineFences` 0.5 ms (node, local). So the size the app does not need is the control plane's to trim or split, not this module's. Options are a pack the agent asks for apart (for example `op=affordances&part=pack`, or its own read), and compact JSON. Either is a control-plane (R41) and agent-worker R48 requirement change, so it is yours to place. In this module I made the door ask its two store questions (the kinds, and the screens or the facts) together instead of one after the other, which saves one store round trip per call. Trimming `connection_kinds`' duplication would change R39's shape, so I left it.

**DEC-149, outside my 30 rows.** `answers`' C-135.6 and C-135.8 translations say "this copy" ("No rule service of that name is held in this copy", "… switched off in this copy …"). `op=affordances` carries them in `answer_checks` (K1601) for the pack. They are answers' rows (layer 6), not mine, so I left them. They are agent-facing in the pack, but a member also reads them where `answers` refuses.

**Ordering.** `op-declarations` R25 and R29 and control-plane merge before affordances. Until affordances merges, control-plane's `totality.test.mjs` will see `publishat`, `publishatmove`, `publishatcancel`, `publishschedule`, `notewrite`, `noteturn`, `notes`, `baseupdates`, `groupdescriptiondraft` and `writinghelp` as unpublished or unranked. affordances' merge clears it.

## J3 · QUESTION

Re B3 (K1863 (4)). **P6: grading these ops would take affordances past 4,000 lines.** It is 3,926 now. The 31 new ops (membership 14, tasks 5, credentials 7, `placewanted`/`placewantedstate`, `memberlanguageset`/`memberlanguage`/`startfrom`), each with a grade and a reason, plus the 29 aliases, add about 95 lines, which makes about 4,020. Per the CHANGE I have not built them. Two ways to stay under, and the choice is yours:
- **(a) Trim, no split (recommended).** `affordances.mjs` carries about 150 lines of superseded history in comments: the FW-14 "CORRECTED" paragraphs (:37–:50, :432–:441), D-310's argument kept "as history" with its correction (:2487–:2535), and REC-35's "history" block (:201–:226). I would shorten them to their ruling lines with the ids kept. No behaviour or test changes. That lands about 3,900 with the new grades.
- **(b) Split per K617**, a second module for the grading tables. That is heavier, and the tables are one concern.

**Proposed grades,** read from each owner's requirements. These are data only, as R40 is. I need your wording as a requirement first (say R45, beside R40), since R40–R44 name none of these:
- membership R98–R105, the roster's doors, all `credential` as `memberadd` and `knock`: `invitewithdraw`, `websitekeycreate`, `websitekeyset`, `websitekeyrevoke`, `joinlinkenable`, `joinlinkset`, `joinlinkreplace`, `joinlinkoff`, and the public doors `websiteinvite` and `joinlinkinvite`.
- `courtnoticeset` and `groupdescriptionset` (R107, R109): `substrate`, as `groupnameset` (the group's settings and its words for itself, moving no document, claim or grade).
- The reads `courtnotice` and `groupdescription`: `read: …` where gated. `groupdescription` is public and, as I read R22, has no `NEEDS` row, so it gets no reason (R12). Please confirm which of the four public or door ops op-declarations gives a `NEEDS` row.
- tasks R13–R16: `checkrequest` and `checktake` are `undetermined` on R27's rule (no reason asked, nothing takes them back). `checkrecord` is `reasoned`, its `concern` arm refused `CHECK_NO_REASON`, `triage`'s shape; that code joins `JUSTIFICATION_REFUSALS`. The reads `checkrequests` and `checksof`. None goes in `MACHINE_REFUSALS` (`tasks` refuses `MACHINE_CANNOT_CHECK` itself).
- credentials R33, R34, R36, R37: `groupkeyset` and `groupkeyremove` are `credential`, as `keyedserviceset`; `groupkeyswitch` and `groupswitchset` are `substrate`, as `keyedserviceswitch`; `groupkeynoticeseen` is `caller-owned`, as `disclosureshown`. The reads `groupkeystate` and `groupkeynotice`.
- `placewanted` is `substrate`, as `officesseed`; `placewantedstate` is a read. `memberlanguageset` is `caller-owned`, as `accountswitchset`; `memberlanguage` and `startfrom` are reads.
- **R21's 29 aliases:** each takes its op's grade and reason, through one frozen alias table here (`{alias: op}`, the 29 pairs from OP-DECLARATIONS #11 J1 (4)). The tables are spread from it, so an alias cannot drift from its op. affordances is earlier than op-declarations, so it cannot import `OP_ALIASES`. control-plane's totality test is what catches a mismatch between the two tables. If you would rather `unaccounted` resolve aliases from a column of the op table (`alias_of`), that is an R12 change, and the table here goes.

Each grade's backing gets a test as T33's do (R19 for `checkrecord`, driven at tasks' interface once tasks merges; the codes held to their owners' checks). I wait for your choice of (a) or (b) and the wording before adding anything. Everything else in my job stands as J2 reports.

## J4 · REPORT

B4 and B5 applied (K1864 (1)), and the commit is on the job branch. The history comments (FW-14, REC-24, REC-35, D-310 to D-311) are cut to their ruling lines with the ids kept. R45 is built in `affordances/t34.mjs` with your accepted grades, and `CHECK_NO_REASON` joins the reason-refusal family. The 29 aliases come from one frozen table, and each alias holds its op's very value. Lines are now 3,943, under 4,000. 202 tests pass, and the four checks are clean (coverage 45/45).

Three readings for you to check:
1. **Public ops.** I read op-declarations R22's `classes: null` ops (`websiteinvite`, `joinlinkinvite`, `groupdescription`) as having no `NEEDS` row. So the two doors are graded `credential` but carry no `NON_ACTS` reason, and `groupdescription` is named nowhere. `courtnotice` is a session read and gets `read: …`. If OP-DECLARATIONS #11 gives any of the four a `NEEDS` row, `unaccounted` will say so at control-plane's totality, and I add the reason.
2. **`checkrecord`'s R19 backing can't be tested here.** `tasks` is later in the order (P4), so affordances' tests cannot import it. Its refusal is tasks' own R15 test, and affordances holds only `CHECK_NO_REASON`'s place in the family. The plane test names `checkrecord` as the one reasoned op this module does not test itself. If you want that drive somewhere, it is tasks' (or control-plane's) to add.
3. **Aliases are copied here, not imported.** The alias table can only be held here as data, because `OP_ALIASES` is in op-declarations, which comes later. control-plane's totality test is what catches the two tables drifting apart.

Still open: the `writingHelpRefused()` read, waiting on the CHANGE after wizard-scripts merges.

## J5 · COMPLETE

**Entries applied**
- **T34-75.**
  - `JUSTIFICATION_REFUSALS` gains `HYPOTHESIS_NO_REASON` and `DUTY_NO_REASON` (R43; K1805, K1807). The three accepted reds are cleared: `t33-backing.test.mjs`:122, :212 and `t33.test.mjs`:135.
  - The note ops: `notewrite` and `noteturn` are `caller-owned`, and `notes` is a read.
  - R42: `publishat` and `publishatmove` are `irreversible`, and `publishatcancel` is `reversible`. Each has its `NON_ACTS` reason, and `publishschedule` is a read. R19 is amended to match.
  - N630 was measured (J2). The door now asks its two store questions together, which saves one store round trip per call. The rest went to N695 and control-plane (B4).
- **T34-87 (DEC-149).** `RUNG_ABSENCE_GROUNDS.undetermined` now reads "no refusal establishes one", and a test names it. The other 29 rows stay as ruled (K1849 (7)).
- **T34-91 and T34-90's op (R44).** `groupdescriptiondraft` and `writinghelp` are in `NON_ACTS` with their sentence. Neither is in `MACHINE_REFUSALS`. The no-target answer's `writing_help_refused` is read through `op=affordancescreens` from `wizardScripts().writingHelpRefused()`, the very list, and is tested against the real module (B7). R37's `baseupdates` is a read.
- **R45 (B3, B5; K1864).** T34's declared ops are graded in `affordances/t34.mjs` with the grades accepted in B4. `CHECK_NO_REASON` joins the family. The 29 aliases come from one frozen `{alias: op}` table, each alias holding its op's very value. The P6 trim (K1864 (1)) cut the superseded FW-14, REC-24, REC-35 and D-310 to D-311 comments to their ruling lines.

**Deferred:** none in this module. `checkrecord`'s R19 drive is tasks' own R15 test (K1867 (2)).

**Found in other modules (reported)**
- J2: control-plane's pack and fences make up 75% of the answer, and its indented JSON adds 63 KB (now N695 and control-plane's work).
- J2: answers' C-135.6 and C-135.8 say "this copy" (T35's sweep).
- J4: control-plane's totality test reads the new ops as unaccounted until affordances merges.
- Now: plane's `SCREEN_REGISTRY` gap. A library wizard step names the screen `capture`, which the plane does not publish, so in the running plane `renderPack` throws and the untargeted answer carries `pack_absent`. That is the red `plane.test.mjs`:317 shows; plane's fix clears it (B7).

**Tests and checks**
- `node --test test/m/affordances/`: tests 203, pass 202, fail 1 (`plane.test.mjs`:317 R17/R37, `pack_absent`, plane's, per B7).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio affordances`: 20 product files, 0 failures. `checks/coverage.mjs bio affordances`: 45 of 45, 0 failures. `checks/ownership.mjs bio affordances tranche/T34`: 13 files, 0 failures.

Size (session_01D46sKU6GQxJsbHFhXN1a2o): test runs 22, module lines 3945

## J6 · REPORT

Re B9 (K1879). The cause of `pack_absent` is not this module's. I merged `tranche/T34` @ a6c22ceb7e and drove the running plane in Miniflare. `plane` now registers the screens: the untargeted answer carries all 42 of them and 17 offered scripts. `renderPack` (`skillpack.mjs`:541–544, skills R10's `validateWizardScripts`) still throws, on the first offered script whose step names an act its screen does not list. Every such step on this tranche:
- `WIZ-74328804ddae3503` "Connect your Claude account" (`wizard-scripts/civicsmith-library.mjs`:21), step 3, act `subscriptionsignin` on `connect`;
- `WIZ-af4c9fafc3713f26` "Translate the interface" (`civicsmith-library.mjs`:28), steps 3–5, acts `translationdraft`, `translationadopt` and `translationconfirm` on `translations` (N669's acts with no op).

Both are optional library scripts. `wizardRegister` (`wizard-scripts/index.mjs`:683–700) re-checks only group scripts (R13), and `requiredFailures` only required ones (R14). So nothing withholds an optional Civicsmith script that fails R12, and `wizardsAt` (R11) offers it. K1869 (2) reads this as harmless ("do not fail R14's required check"), but skills R10 refuses the whole pack on it.

affordances passes `wizard_scripts` through unchanged (R37: "as `wizard-scripts` R11 answers the viewer"), so filtering them here would be a copy of wizard-scripts' rule. The fix is one of these, yours to place:
- **(a) wizard-scripts:** its offered-script reads withhold a library script that fails R12 against the registration, as R13 does a group one (`civicsmith-library.mjs` stays Bob's approved data).
- **(b) skills R10:** the pack leaves out a script it cannot validate instead of refusing whole.
- **(c)** ops for `subscriptionsignin` and the three `translation*` acts (N669; later).

Either (a) or (b) clears `plane.test.mjs`:317 with no change here. Nothing in affordances changed for this: the branch has only the merge.

## J7 · COMPLETE

Re-opened by B9 and done. `tranche/T34` @ a6c22ceb7e is merged, and nothing in affordances changed. The remaining red, `plane.test.mjs`:317 R17/R37 `pack_absent`, is caused by wizard-scripts offering two optional Civicsmith library scripts whose steps name acts with no op (`subscriptionsignin`, `translationdraft`, `translationadopt`, `translationconfirm`). skills R10's `validateWizardScripts` (`skillpack.mjs`:541) refuses the whole pack on them. Modules and lines are in J6.

**Tests and checks**
- `node --test test/m/affordances/`: tests 203, pass 202, fail 1 (`plane.test.mjs`:317, wizard-scripts or skills per J6).
- format: 0 failures. architecture: 20 product files, 0 failures. coverage: 45 of 45, 0 failures. ownership: 1 file (the merge), 0 failures.

Size (session_01D46sKU6GQxJsbHFhXN1a2o): test runs 24, module lines 3945
