# Plan T50 (draft)

**Status** · DRAFT, a planning worker's, for BOB #181's review (P18). Nothing here is binding until BOB reviews it, settles the doubts at the foot and adopts it as `next.md` at T49's close (§5.2).

**Sources** (each read whole): `civicos-process` PROCESS-DESIGN (P1–P20), PROCESS-MECHANICS (whole); `build/rulings-active.md`; `build/plan/next.md` (N751…N1129); `build/plan/current.md` (T49: Rules, Left out, reds, L11); `build/modules.json` (order, layers, `uses`, `paths`, status) and `build/layers.md`, on `tranche/T49` @ `bb6f2be88e`. Searched on need, not read whole: `rulings.md` K3347–K3380 (T49's late reds and answers); `DECISIONS.md` DEC-233, DEC-242, DEC-243, DEC-247–DEC-263 (headers); `words.json` and `words-reads.json` (which keys and `reads` exist). T49 is assumed to land whole.

**Aim.** T50 follows the release K3320 asked for. It carries every entry on that journey (install, sign in and out, project, connect by subscription, capture, question, assistant, conclude, as administrator and member) and every accepted red whose clearing entry is now open; it joins any other entry to a module that already has a T50 job (P19, P8). Work off the journey that would need a job of its own is left out under the meter (doubt 1). Bob's own walk of the release will find more: see rule 8.

**Sizes** (K617, K2513: own code in `paths`, no tests, `dist` or generated files; `tranche/T49` @ `bb6f2be88e`, before L11's last merges). Placed modules at or near ~4,000: instance-setup 4,320 (split first, T50-23), promotion 3,948 (stamp only), membership 3,903, inquiry 3,825, basis-versions 3,782, control-plane 3,763, ai-runs 3,677, retrieval 3,513, capture 3,351, extraction 3,277. setup-words is 125 (`rows.mjs`, 11,837, is generated). screens-inquiry (1,723) and screens-investigate (2,559) are measured before T49-25 and T49-26 merge: re-measure at the fold (doubt 5).

## Legacy census (§5.2 (2))

| legacy module | in T50 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`, with `bio-plane/test/budget.mjs`, `caseceremony.mjs`) | **stays** | A dependency not yet built. The recorded reason ("S2–S4 not drawn") is stale: DEC-233 drew S2 (the person acts), DEC-243 S3 (progressions), DEC-242 S4 (themes). Their screens are not built: N1101 and N1127 are built in T50's L11 (T50-32), N1102 is left out. The retiring job follows them (T51's L11 at the earliest; doubt 2). Its reds N794, N865 and N1057 stay accepted by name (rule 5). Its retiring job also removes plane R24's copied screen list and `regression.yml`'s `civicos-ui` glob (K3190). |

legacy-ui is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order.** Within a layer, `modules.json` order. A provider merges before its users; a new module merges first in its layer (K624); promotion's stamp merges last in L2. L11: translations first (new), then wizard-scripts, op-grades, affordances, queue-producers, queue, instance-setup, op-declarations, answer-envelope, interface-assets, interface-shell, the screens in order, control-plane, plane, site, journey-check last (K3100). interface-shell merges before every screen job. Ids are re-checked against each file's next free id at the fold.
2. **Reading (K3271, P20).** A job reads whole its requirements, its entries, its layer's contract, its own code, the used services its entries touch, and the tests that name a requirement its entries change; it runs its other tests without reading them. Each START measures the set against 600 KB (K2032, `reading-sets.py`). A job's Size line counts its own code only (K2513).
3. **Models (rulings-active §5; K3269, K3275, K3286, K3292, K3294).** claude-sonnet-5-5 by default. claude-haiku-5-5 for the test-only and mechanical jobs: T50-1, T50-5, T50-18, T50-25, T50-26, T50-36. The default model for T50-28 screens-entry (it draws the claim and the first sign-in). T50-22 translations is a new module built by copy, so Sonnet (K3321 settled 5's precedent). A job that blocks on tests restarts one model up.
4. **The opening act** (K657, K1043, K624; BOB's, P17).
   - `modules.json`: **setup-words moves to L1**, first in the order, directly before `record-grammar` (it uses nothing; N1115, K3366 (4)). It keeps its paths, tests and its L11 users' edges.
   - `modules.json`: **`translations`** (new, L11, directly before `instance-setup`, empty `paths` and `tests`, K1043). Its `uses` come from the extraction map; `instance-setup` gains `translations`.
   - `layers.md`: L1's and L11's lists and the status line, each move stated.
   - membership's `MODULE_ORDER` entry is T50-2 (N1115).
   - `build/extraction/instance-setup-split.md` (the translation workspace: R67–R75, R87, its code, tables and ops) is written by a worker before L11's START and reviewed (P18).
   - The requirements fold (P5): N1109's change of meaning, Bob's ("S24: A", K3359), into basis-versions and screens-inquiry; the owed lines of DEC-247 to DEC-256 (N1106, N1108, N1112) once PR #39 is on `main` (T49's close); every "text to write" below.
5. **Accepted reds at the opening**, each until the entry named (K2704):
   1. Coverage: every id marked *(not yet met: T50)*, until its module's merge.
   2. Row census: rows T49's L3+ jobs added or changed, until T50-6 (the stamp); rows T50's L3+ jobs add, until T51's stamp.
   3. **legacy-ui:** `statement-ack.test.mjs` (N794), `progression-revision.test.mjs` and `queue-recipients.test.mjs` (N865), and its 8 tests failing at the `{role}` sign-in (N1057), through T50 (legacy census).
   4. bundler `fleetbundles.test.mjs`'s pin of agent-worker's 28 inputs (K3353), until T50-1 (N1107).
   5. membership R83's `MODULE_ORDER` test, and plane `store.test.mjs` R2/R10 (K3380), from setup-words' move (K3368 (2)) and the opening act until T50-2 (N1115).
   6. answer-envelope `families.test.mjs`' 18 digest pins of admission's refusals (K3379), until T50-25 (N1128).
   7. plane R12 (a run waiting on an expiring request is woken once; K3363, K3364), until T50-23 (N1113).
   8. instance-setup `recovery.test.mjs`:36 (`recover({role})`, which credentials R75 no longer reads), until T50-23 (N1103).
   9. screens-daily `contract.test.mjs` on Projects' `themeread` (K3380), until T50-31 (N1101).
   10. setup-words R13 on `refusal.TEMPLATE_BLANK_UNKNOWN`'s literal braces (K3374, K3379), and screens-action R7 on its two "subject" keys (K3373): until the design lane rewords them and BOB regenerates `rows.mjs` (§14); no job.
   11. The plane bundle and `program.mjs`, staled by any merge, until each layer's close (K1540).
   12. test-support R2 run as root under a 0700 directory: environment only (K3192 E).
6. **Every T50 job also does the following**, in its own module only, stated in its START. The Haiku jobs do only the second and third items.
   - (N1116, K3366, K3368; DEC-259, DEC-260) It holds no member-facing English: each sentence it draws or answers is read through setup-words' `word(key, vars)`, its keys its `reads` in `words-reads.json`; its verbatim copies and the tests comparing English go; one words id per module, as T49's (rule 6 there). A sentence no key holds is a REPORT to BOB for the design lane, never inline English. This is possible below L11 only after the opening act.
   - (N1068, DEC-221) "labelled" is re-spelled "labeled" in its own member-facing words.
   - (N1073, K3268) Its tests that hand-list another module's ops, rows or words read the owner's declaration instead (`draft-T49-N1073-hand-lists.md`); the four registries wait (N1074).
   - (K3324 (2), D29) No screen treats an answer of `ok: true` that carries `ok: false`, `started: false`, `dispatched: false` or `withheld` as success.
7. **Wording only (K3259): BOB's edits at the fold, no job.** N1061's Uses line is done (T49 rule 7). Any `SCREEN_WORDS`-style Provides line a T49 merge left is BOB's (K3373).
8. **Bob's walk (K3320, K3052).** A defect Bob's walk of the T49 release finds becomes an entry. One for a module whose T50 job has not started joins that job's START (K279; K1249: work may join a layer not yet started); one in a layer already closed goes to T51. A defect that breaks the journey may justify a release from the open tranche (K1501); BOB decides.

## Entries

### L1
- **T50-1 · bundler** · (N1107, K3268, K3353) `fleetbundles.test.mjs`:258–262 reads agent-worker's bundle inputs from its committed manifest (`dist/agent-worker.bundle.json`), never a hand-list. Test only · req: none · claude-haiku-5-5.

No other L1 job: jurisdictions' N1121 and N847 are left out; setup-words' move is the opening act; file-scanner's N1061 waits.

### L2
- **T50-2 · membership** · (N1115, K657, K3366) R83's `MODULE_ORDER` follows the opening act: `setup-words` first, and `translations` before `instance-setup`, tolerated as not yet built until its job merges (R140's form). (N1119, K3369 (5)) `memberlist` answers the founder's row (`{member_id: "admin", handle: founderHandle() or null, founder: true, role: "admin", status: "active"}`, as project-roster R29), so every administrator sees her named. (N1116) its 64 reads by key · req: R83 amended, `memberlist`'s founder row · text to write · claude-sonnet-5-5 · first in L2. START re-measures (3,903): if the work would pass ~4,000, it still runs and its split is T51's first entry (P6; T49 doubt 15).
- **T50-3 · project-roster** · (N1129, K3379) `projectDirectory` takes the founder's viewer (`admin`, membership R144) as the member `admin`, answering the discoverable projects she does not see at FULL, never `PROJECT_DIRECTORY_NEEDS_A_MEMBER`. (N1124, K3375) `projectparticipants` answers each participant's `joined_at` and when each became an owner; the rescue answers since when the owners are gone; `projectvisibility`'s history names `set_by` by handle (the founder by R29). (N1118) no line: screens-daily R29 was met and struck at T49-24's merge (K3380); START confirms · req: text to write · claude-sonnet-5-5 · after T50-2; provider for T50-30 and T50-31.
- **T50-4 · ai-accounts** · (N1060, K3218, K3224) R26: `subscriptionTokenRefused`, when it drops a held sign-in, tells its listeners (`account: "signin"`, `why: "refused"`) inside that act. Test: a refused sign-in calls the listener once; control: a refusal for a member with none held calls none · req: R26 amended · text to write · claude-sonnet-5-5 · provider for T50-5.
- **T50-5 · credentials** · (N1060) a test of R73 against T50-4's clause: a refused sign-in revokes the member's live run credential; control: a refusal for a member with none changes nothing. Test only (R73's text already names the refusal) · req: none · claude-haiku-5-5 · after T50-4.
- **T50-6 · promotion** · **The stamp** (rule 5 (2)): every row T49's L3+ jobs added, moved or changed (as named in T49's merge rulings K3348–K3380), and T50's L2 rows · req: none · claude-sonnet-5-5 · last in L2.

**L2 merge order:** membership, project-roster, ai-accounts, credentials, promotion.

### L3
- **T50-7 · acquisition** · (N1117, K3369 (6)) `acquire` takes an optional `for` (a question the member can see) and hands it to capture. (N1126, K3376) `archivelist`'s `already_held` entry carries `held_at` and the earlier capture's name. (N1104, P9) `archiveList` answers "is this an archive" without four evidence reads per unopened capture (`acquisition/unpack.mjs`:757–764), within capture R91's bound. (N1094, DEC-240) R46: a read of a member's open captures, for Add's "Unfinished" (`acquire` `continue`). (N1064, K3232; joins) the tests that sample: C-139.9 `MEMBER_MAX` at its boundary, R30's "no place" over the full place list, R23's "secret nowhere" over every store table, and `checks.test.mjs`:214–231's source-text check replaced by an interface test (or R29's structural clause restated for BOB) · req: R46; `acquire`'s `for`; `already_held`'s fields · text to write · claude-sonnet-5-5 · provider for T50-8.
- **T50-8 · capture** · (N1117) the capture records `for`, so `captured_for` (capture R83) names that question. (N1079, K3295) R77's `heldcaptures` rows answer `capture_sha`. (N1124) a read of a document's capture grade object of its own, not only inside `heldcaptures`. (N1094) capture's share of the open captures read (DEC-240's fold draft), if the map puts any here; START confirms with T50-7 · req: R83 amended, R77 amended, the grade read · text to write · claude-sonnet-5-5 · after T50-7.

### L4
- **T50-9 · extraction** · (N1082, K3297) `transcription(...)` takes the door's `trace` and `memberRef` (plane R55, control-plane R93) and passes them to `/transcribe`; tested at the stub binding. (N1066, K3241; joins) `t43`:114 and `t44`:152 pin the exact status; the key-leak check covers every transcriber path; `t43`:20's `deployable` stub gains its false arm · req: text to write · claude-sonnet-5-5.

### L5
- **T50-10 · retrieval** · (N1123, K3373) `findIn` answers the document's `title` in its scope and in each item, so Find-in and Home name titles (screens-daily R26, R28) · req: text to write · claude-sonnet-5-5.

### L6
- **T50-11 · inquiry** · (N1124) a read of an inquiry's partition as a structure, with each change's strength after it, for the question page · req: text to write · claude-sonnet-5-5. START re-measures (3,825; P6 as T50-2).
- **T50-12 · basis-versions** · (N1109; DEC-254, Bob's "S24: A", K3359) the concluding act accepts a member's own reading: written in the form, marked as hers (`Written by {member}`, never machine work), accepted and concluded on in one act, with every requirement of a conclusion (cited passages, what would change it, its strength); offered with or without an assistant; `NO_CLAIM` reads its new words. (N1070, K3264; joins) inquiry R64's `DIVIDED_CANNOT_RESTRUCTURE` is named as relayed and a test writes one. (N1106, DEC-248) the affirmation at Accept, if the fold finds the act records it · req: the own-reading act (Bob's change, folded at the opening); R-line for N1070 · text to write · claude-sonnet-5-5 · START re-measures (3,782; P6 as T50-2).
- **T50-13 · ai-runs** · (N1082) `dispatchMemberRun` takes `trace` and `memberRef` and passes them to `/run`; tested at the stub binding · req: text to write · claude-sonnet-5-5.

**L6 merge order:** inquiry, basis-versions, ai-runs.

### L7
- **T50-14 · reevaluation** · (N1069, K3261) `adoptVersion` names the adopting member as `version.author` (the document page offers `adoptversion` since T49-25). (N1070; joins) the relayed `DIVIDED_CANNOT_RESTRUCTURE` named and tested · req: text to write · claude-sonnet-5-5.

### L8
- **T50-15 · case-import** · (N1087, N1090; DEC-236) R26: the list of the group's imported cases for `imported` (states b, c), the read Projects' "Imported cases" opens · req: R26 · text to write · claude-sonnet-5-5 · provider for T50-33.

### L9
No job. N1093's `actioninquiry` (action-records) and N1121's records help are left out.

### L10
- **T50-16 · scheduler** · (N1114, K3363) a consumer registered through R8 whose wake, read after its tick, is unchanged and at or before `now` is held, wanting no wake until its wake changes or an arm or start releases it (as deadline-recheck and scheduled-publish are held), so no consumer can spin the alarm · req: R8's clause · text BOB's at the fold · claude-sonnet-5-5.

### L11
- **T50-17 · wizard-scripts** · (N1122, K3373) `SCREEN_REGISTRY` is generated from the design's `registry.json` in the tree by the module's own build (`--check` for staleness), as setup-words' list is since K3366; the generated file joins the manifest's generated artifacts · req: text to write · claude-sonnet-5-5 · provider for T50-27.
- **T50-18 · op-grades** · grades for T50's new ops (the open-captures read, the capture grade read, the partition read, the imported list, the own-reading act if it is a new op): each read in `NON_ACTS`, an act by its rung · req: R-line text to write · claude-haiku-5-5 (mechanical) · before T50-19, which uses it.
- **T50-19 · affordances** · (N1108, DEC-253) DEC-253's keys (`label.<set>.<value>`, `label.lineroles.*`, `label.standard*.*`, `standard.*`) read by R39's order (the owner's registered word, else the design's key, else none); its own English dropped. (N1125, K3375) the act `label`s of ACTS, CAPTURE_ACTS and PER_ITEM_ACTS, DIVIDE_PROMPT, GROUND_PROMPT, attestFence's sentence, CATALOGUE_DETAIL, NOT_CATALOGUED and `reauth`'s help read by key; `reads` regenerated (the 52 `act.<op>.does` keys R61 adds). A key the design has not given is a REPORT · req: R39's reading, R61 · text to write · claude-sonnet-5-5.
- **T50-20 · queue-producers** · (N1106, DEC-248; D25) raises the `project-invitation` item for a member invited to a project, by its queue kind · req: text to write · claude-sonnet-5-5 · provider for T50-31.
- **T50-21 · queue** · (N1123) items carry `subject.title`. (N1094, DEC-240; joins) R55: `queuemute`'s `unmute`, and the Muted list's read · req: R55, the title field · text to write · claude-sonnet-5-5.
- **T50-22 · translations** (new module; N1084, K3302, P6) · built by copy from instance-setup by the extraction map: the translation workspace (R67–R75, R87), its tables and ops; its requirements are instance-setup's ids moved (K531, K114) · req: R1 onward (the moved ids) · text to write (`requirements/translations.md`, from the map) · claude-sonnet-5-5 · **first in L11**.
- **T50-23 · instance-setup** · (N1084) deletes its copy of the workspace, retires the moved ids as "moved to translations R<n>", and keeps a delegate for each caller not yet re-pointed (store-door, K3268). (N1113, K3363) R88's update-check consumer passes the alarm's `now` through its tick and stamps `update_checks.at` from it, so its wake advances; clears plane R12. (N1103, K3337) `recovery.test.mjs`:36 recovers by the founder's handle (or `admin` while none is held), as credentials R75 · req: R88 amended; R67–R75, R87 retired as moved · text to write · claude-sonnet-5-5 · after T50-22.
- **T50-24 · op-declarations** · the spec of each new op of T50-18 (classes, `machineClasses`, mutating, `NEEDS`), each placed in `ACT_HELP_ABSENT` until affordances holds its help · req: text to write · claude-sonnet-5-5 · after T50-18.
- **T50-25 · answer-envelope** · (N1128, K3379) `families.test.mjs` re-pins its 18 admission refusals (R7, R13, R15) by key through setup-words, never a digest of another module's sentence (K3268). Test only · req: none · claude-haiku-5-5.
- **T50-26 · interface-assets** · (N1106, DEC-249) R8: `ASSETS_COMMIT` is the `main` commit named at START (T49's close, with PR #39); `.cs-testband` leaves `civicsmith.css` as the design now has it · req: R8 · text to write · claude-haiku-5-5 (a re-take) · provider for T50-27.
- **T50-27 · interface-shell** · (N1122) R72's interim `RE_POINTS` dropped once T50-17's registry lists each act; R72 retired. (N1106, DEC-251) R4: the member menu ("Your menu", "signed in as {handle}", "Your account", "Sign out", `shell.menu.*`) on every working screen; R17: the first month's question atop Home, once (`level.keep.ask`, `infolevelset`); (DEC-249) the re-auth dialog as drawn. (N1083, K3297; joins) `cs.checks` takes data options as `cs.choice` does · req: R4, R17 amended; R72 retired; `cs.checks` · text to write · claude-sonnet-5-5 · after T50-17 and T50-26; before every screen job.
- **T50-28 · screens-entry** · (N1106; DEC-249) setup's "Skip for now" and the second administrator; (DEC-251) R7: `join` state e draws `refusal.JOIN_LINK_DAILY_CAP`. (N1112, DEC-256) `screen.forgot.handle.help` and `screen.setup.taken` readers dropped where T49 left any · req: text to write · **default model** (the claim and the first sign-in, K3286, K3292) · after T50-27.
- **T50-29 · screens-settings** · (N1106; DEC-249) `connect` driven by the member's choice, connecting by her own Claude subscription (no API-key path, K3347); (DEC-251) R7 the court statement (`court.statement`), R33 `settings.set.setup` and `settings.set.system`. (N1119) Members draws the founder from `memberlist` for every administrator (R35). (N1112) `screen.updates.skip.noreason`'s reader dropped where left · req: text to write · claude-sonnet-5-5 · after T50-27.
- **T50-30 · screens-intake** · (N1117; screens-intake R22, R25) capture opened from a question offers "For which question", sends `acquire`'s `for`, and sends no `capturerequest` for it. (N1126) `screen.archive.alreadyheld` drawn whole. (N1094, DEC-240) Add's "Unfinished" from the open-captures read, with `acquire` `continue`. (N1106, DEC-251) R7: discarding a knock asks its reason first (`inbox.discard.why`) · req: R22, R25 struck; text to write for the rest · claude-sonnet-5-5 · after T50-27.
- **T50-31 · screens-daily** · (N1101, DEC-242; clears rule 5 (9)) Projects' theme section with `themeread`, and Find's Theme filter. (N1123) Home's and the queue's items, and Find-in's scope and results, by title (R26, R28 met on real items). (N1087, N1090) Projects' "Imported cases" opens the `imported` list (T50-33). (N1094; joins) the Muted list at the queue's foot with "Turn back on". (N1106, DEC-248) the `project-invitation` item with "Join" (T50-20); `due.ours.passed` where a group's own date has passed. (N1112) `screen.home.strip.overdue` and `screen.queue.due.overdue` readers dropped where left · req: text to write · claude-sonnet-5-5 · after T50-27.
- **T50-32 · screens-inquiry** · (N1109; DEC-254) the question's "Conclude" form takes a member's own reading, with or without an assistant, and `question.empty.conclude.own` replaces `question.empty.conclude`. (N1124) the question and project pages read T50-3's `joined_at`, owners and `set_by`, T50-8's grade read and T50-11's partition. (N1101, DEC-242) the document page's and question page's theme sections, a question's themes through its cited passages. (N1106; DEC-248) the dock's withheld keys and the affirmation at Accept; (DEC-251) R10 the project's bar in words (`project.bar.*`) · req: text to write · claude-sonnet-5-5 (doubt 6) · after T50-27 and T50-29.
- **T50-33 · screens-investigate** · (N1101, DEC-242) the `theme` screen (states a, b): counts per theme where a read answers them, else the list. (N1127, K3376; joins) the registry's `person` acts (`entityalias`, `relationdeclare`, `resolve`, `resolvetestify`, `connect`, `writinghelp`), a requirement each, drawn as DEC-233 draws them; the `timeline` acts wait with N1102. (N1079; joins) R23's passage, calculation and content-id fields become choices from `capture_sha` (T50-8) · req: text to write (N1127's requirements first, BOB's at the fold) · claude-sonnet-5-5 · after T50-27. Re-measure at the fold (doubt 5).
- **T50-34 · screens-publish** · (N1087, N1090; DEC-236) `imported` draws its list (states b, c; `screen.imported.*`) from case-import R26 · req: text to write · claude-sonnet-5-5 · after T50-27.
- **T50-35 · control-plane** · routes T50's new ops through their owners' maps, `viewer` stamped from the session (as R98) · req: text to write if the fold finds a line needed · claude-sonnet-5-5 · after T50-24. START re-measures (3,763).
- **T50-36 · plane** · wires T50's new ops as it did `founderhandleset` (K3280) · req: a line only if the fold finds one needed · claude-haiku-5-5 · after T50-35.
- **T50-37 · site** · (N1106, DEC-247) R4's state d and R11's places sentence · req: R4, R11 amended · text to write · claude-sonnet-5-5.
- **T50-38 · journey-check** · (N1109, N1106 DEC-250, DEC-251) the walk (R9, R10) gains the member's own reading concluded in one act, and Sign out from the member menu; R13's comparison follows DEC-250's path · req: text to write · claude-sonnet-5-5 · last in L11.

**L11 merge order:** rule 1.

## Count

**38 jobs:** L1 1, L2 5, L3 2, L4 1, L5 1, L6 3, L7 1, L8 1, L10 1, L11 22; L9 none. **Models:** Haiku 6 (T50-1, -5, -18, -25, -26, -36), default 1 (T50-28), Sonnet 31. Every job carries a journey entry, clears an accepted red, provides a journey screen, or is the stamp or the split.

## BOB's acts (no job)

- **Before T50 opens:** the opening act (rule 4); the extraction map for instance-setup's split (a worker, reviewed); the fold.
- **One channel act to UX-DESIGN at the opening:** the fills N1120 names (`{plan}`, `{last4}`, `{used}`, `{when}`, `{suggestions}`), the unkeyed words N1125 names, `refusal.TEMPLATE_BLANK_UNKNOWN`'s braces, screens-action's two "subject" keys (K3373), and any key a T50 START finds missing.
- **At each layer close:** regenerate `rows.mjs` and the T50-17 registry with the manifest's other generated artifacts (§14).
- **Bob, at the opening:** told in one line that T50 has opened and what it covers; asked his meter reading (§5.2 (3)); reminded of the questions open with him: the stewards' address (N923), civicsmith.org's DNS (N1011), the records-request reviewer (N858), R88's channel and terms (N670), S20 (N1028), translation (K3190), email capture's timing (N824).

## Left out of T50 (one hard reason each)

"Bob's priority under the meter" stands for Bob's priority (K3320) under the meter (K2341, 71% during T49). **It is used only for work off K3320's journey that would need a job of its own**, as each row says.

| entry | hard reason |
|---|---|
| legacy-ui's retirement (N1002's rest); N794, N865, N1057 | a dependency not yet built: the screens that replace S2–S4 (N1101, N1127 built in T50's L11; N1102 left out) (doubt 2) |
| N1102 (progressions' `timeline`, the matters a project follows) | Bob's priority under the meter: off the journey; its read needs a progressions job of its own |
| N1086 with N1090's unnamed node | Bob's priority under the meter: off the journey (Explore is not a step of it); explore's only entry |
| N1085 | Bob's priority under the meter: off the journey; standards' only behaviour entry |
| N1081 | Bob's priority under the meter: off the journey (publication's outside reader); review's only entry |
| N1093's rest (`actioninquiry`) | Bob's priority under the meter: off the journey; action-records' only entry |
| N1121 | Bob's priority under the meter: off the journey (the action page's records help); jurisdictions' only entry, and screens-action has no other behaviour entry |
| N847 (`elsewhere`, the sixth door) | Bob's priority under the meter: off the journey; its keys now exist, but its pointers are researched data, a jurisdictions job and a new screen |
| N1092 (Find's browse, `watchitem`, `secondlook`) | Bob's priority under the meter: off the journey; its acts' owner is unplaced and retrieval's browse, queue-producers R41 and the watch table are new work |
| N933 (stake per matter) | Bob's priority under the meter: off the journey; it lands whole (K3231) across ten modules, most with no T50 job |
| N1074, N898 | Bob's priority under the meter: BOB's own between-tranche tooling the release does not need |
| N1073 for the four registries | a dependency not yet built: N1074 |
| N1120 | a dependency not yet built: the design lane's choice (reword the keys, or the providers answer the fills; asked K3369); it joins a START if answered first (K279) |
| N1088 | a dependency not yet built: no provider read answers DEC-218's remaining readings; BOB names them (P18) |
| N1046 | a dependency not yet built: no offered script carries a `{template}` draft (with N858) |
| N858, N880 | a dependency not yet built: the ACTIONS-DESIGN lane's hand-off; N858's templates are also Bob's (the reviewer) |
| N1110 | a dependency not yet built: the directory (network-notices R23 only prepares a submission); the rule's text awaits Bob's approval |
| N842 | a dependency not yet built: the interactive AI paths; and N829 |
| N1028 | a question that is Bob's: S20 (the dashboards); the tokens join N1027's screens |
| N1105 | a question that is Bob's, closed: K3347, never asked again; after subscription is proven live |
| N923, stewards R7 | a question that is Bob's: the stewards' address (K2799) |
| N824 | a question that is Bob's: "D42 - email: A", after upload is in use; and a deployment |
| N1094's translation part | a question that is Bob's (K3190) |
| N751, N829, N853c | a measurement (N829 also holds a public release, K3324 (4)) |
| N1116 and N1075 for modules with no T50 job (about 110 modules, `words-reads.json`) | no behaviour (P19): each waits for its module's next entry; N1075's count ends at T51 (3 of 3), so T51 sweeps the rest (doubt 1) |
| N1068's rest (record-grammar, action-plans, answers, lines, inquiry-grammar, skills) | no behaviour: 3 of 3, by T51 |
| N1073's rest | no behaviour (test hygiene): 3 of 3, by T51 |
| N1061 (file-scanner), N1071 (citation), N1070's run-productions part | no behaviour (test hygiene): 3 of 3, by T51 |
| N1023 (conformance, C-113.6 by key) | no behaviour (a word by key): 3 of 3, by T51 |
| N889 (notice-producers' dates by key) | no behaviour; its keys are now in `words.json`: 1 of 3, by T52 |
| N1108's standards part (R45's words) | no behaviour: 1 of 3, by T52 |
| N1112 for screens-action | no behaviour (readers of retired rows, if T49 left any): 1 of 3, by T52 |

**No entry owed:** N1118 (screens-daily R29 met at T49-24, K3380; confirm at the fold); N1084's store-door re-point (instance-setup keeps a delegate; store-door re-points when next touched, K3268).

## Measure first

- **M-T50-1** (P6): re-measure at the fold, after T49's last merges, membership, inquiry, basis-versions, control-plane, screens-inquiry and screens-investigate, each against its T50 work; the translation workspace's lines from the map, and instance-setup's after the split.
- **M-T50-2** (P14, K3269): tokens per job and per layer, beside the work done, and the meter at the open and close.
- **M-T50-3** (N1104): `heldcaptures`' time per row at the plane's shape, before and after T50-7.

## Doubts for BOB (BOB's, P17, unless marked)

1. **The meter and the words sweep.** (a) This draft leaves out off-journey work that would need its own job (ten rows above), so T50 stays near T49's size (38 jobs against 32) with the meter at 71% or more; the alternative is full P19 scope (adding about 9 jobs: explore, standards, review, action-records, jurisdictions, progressions, screens-action, and N933's and N1092's sets). *Recommended:* as drafted; K3320 and K3324 (5) still frame the release, and the 80% pause (K2341) would otherwise stop L11, where the journey's work is. (b) N1116 (Bob's "Move all the strings", U259) for ~110 modules with no T50 job is a no-behaviour wait, but N1075's count ends at T51, so T51 must carry a sweep of about 110 Haiku jobs. *Recommended:* accept the wait now; at T51 shape the sweep as one Haiku job per module, layer by layer, and report its cost to Bob first. Neither is Bob's (what goes into a tranche is BOB's, P17).
2. **legacy-ui's retirement.** Its recorded reason (S2–S4 undrawn) is stale. If biosmoke8 serves the `civicos` Worker to a member (T49's close re-points `civicos`), K3052 makes that a defect now. *Recommended:* at T49's close BOB checks whether any member route reaches legacy-ui on biosmoke8. If none does, legacy-ui waits as above (T51, with N1102). If one does, place N1102 (a progressions job and screens-investigate's `timeline`) and legacy-ui's retirement (Sonnet, last in L11, after a worker's surface census, since `app.html`'s 27,404 lines exceed the 600 KB set, §17 (3)) in T50.
3. **setup-words' place in L1.** *Recommended:* first in the order, before record-grammar, so every module may use it; it uses nothing.
4. **translations on Sonnet.** A new module, but built by copy (as op-capabilities, K3321 settled 5). *Recommended:* Sonnet; the default model only on a test block.
5. **screens-inquiry's and screens-investigate's sizes.** T49-25 may take screens-inquiry to about 3,000 (T49's estimate); T50-32 adds the own-reading form, themes and reads. T50-33 adds the `theme` screen and six person acts to about 2,800 after T49-26. *Recommended:* re-measure at the fold (M-T50-1). If either would pass ~4,000, split it by copy first in L11 (BOB's, K624); for screens-investigate the person acts can wait instead (they are off the journey).
6. **screens-inquiry's model.** T49 used the default (K3321 settled 4). T50's work is a form and reads, not the claim or the first sign-in. *Recommended:* Sonnet.
7. **N1109's op.** Whether the member's own reading is a new op or a mode of `versionaccept`/`conclude` decides whether T50-18, T50-24, T50-35 and T50-36 carry it. *Recommended:* a mode of the existing concluding act if basis-versions' fold allows it (fewer wiring lines); BOB decides at the fold.
8. **The new reads' wiring (T50-18, T50-24, T50-35, T50-36).** About five new reads (open captures, capture grade, partition, imported list, perhaps the own reading). *Recommended:* place all four jobs; the alternative is to carry each read as a field of an existing read (no new op), which saves the four jobs but is the providers' choice and makes their reads heavier.
9. **N1087 (the imported list).** Two jobs (case-import, screens-publish) for a link on Projects that today opens "Nothing is here". *Recommended:* place it: Projects is a journey screen (K3052: every screen fully functional).
10. **journey-check in T50.** *Recommended:* place it on Sonnet so the acceptance walk covers T50's own reading and Sign out; the alternative is to defer it to the tranche that next cuts a release.
11. **queue-producers for the invitation item (DEC-248).** *Recommended:* place it (the member's journey begins with an invitation); its only entry.
12. **N1124's grade read: capture or provenance.** *Recommended:* capture (T50-8); if START finds the grade is provenance's, a REPORT to BOB, the read to T51.
13. **N1060 on the journey.** A refused subscription sign-in leaving run credentials live is a security gap on the subscription path K3347 makes the only one. *Recommended:* as placed (T50-4, T50-5).

## Reviewed by BOB #181 (2026-10-15; BOB's, P17, P18)

Read whole. Adopted as T50's draft, to become `next.md`'s plan at T49's close, with these changes:
- Rule 5 (10) is struck: setup-words R13 cleared at K3381 (DEC-263 holds no brace) and screens-action's "subject" keys are reworded ("Add a matter", DEC-263).
- Rule 5 gains: filing-templates `r33.test.mjs` R33 (K3381) until **T50-39 · filing-templates** (L9; N1130; test only; claude-haiku-5-5): the test and `FILING_TEMPLATES_WORDS` read `refusal.RFC_QUOTING_MISSING` by key from the list. T50-25 also re-pins `catalogue-end.test.mjs`' R7/R13 pins (K3382).
- Any red still open at T49's close (its archive's outcome) joins rule 5 with its entry at the opening.
- Doubts 1–13: as recommended. Doubt 2's check of biosmoke8 is a step of T49's close (BOB's live walk). Sizes and N1118 are confirmed at the fold.
