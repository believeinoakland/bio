# DRAFT · T47 L11 plan audit against the design (K3052), for BOB #168

A worker's draft, read-only, not committed. Ruling: `build/rulings-active.md` §1 "Real users" (K3052): every plan is audited screen by screen and journey by journey (arrive, install, sign in, sign out, join, recover, home, each journey) against the design before it opens; a missing screen is a defect. This audit follows `draft-T47-L11-fold.md` §C (the previous one, at 63 screens) after K3100 and K3127.

**Sources read.** `build/plan/current.md` "Rules at the opening", "### L11" (T47-47…T47-91), "BOB's acts", "Left out of T47"; `draft-T47-L11-fold.md` §C, §D; the design at PR #33's head `origin/claude/gallant-brown-zg0wc1` @ 1d41495eda: `docs/development/ux-substrate/screens/registry.json` (66 screens), `screens/library.json` (22 scripts), `screens/mock-journeys.js` (journeys 1–28), `screens/mock-screens.js`, `journeys.html` §4–§6, `docs/development/DECISIONS.md` DEC-213, DEC-214; the registry on `tranche/T47` (63 screens; PR #33 @ 4ccf05ea88 merged at K3107); `build/requirements/` Public parts of interface-shell, screens-entry, -wizards, -settings, -intake, -daily, -inquiry, -investigate, -publish, -action, control-plane (R78–R88), installer (R50–R53), setup-page (all retired), plane (R47, R48), and journey-check, wizard-scripts R35–R36, setup-words R7, affordances R56, op-declarations R57–R61; `build/rulings.md` K3081, K3100, K3107, K3127, K3134; `build/plan/next.md` N1011, N1025, N1002.

Walk method: each journey expanded as the viewer expands it (`mock-journeys.js` `journeySteps`, both the assistant and no-assistant paths; a wizard journey takes the script's steps from `library.json`). Every step's screen exists in the registry and every step's act is an act the registry lists on that screen (checked mechanically: 0 misses).

---

## 1. Screens (registry at PR #33's head, 66)

"exists" = drawn since T46 by the named module; its T47 additions follow. Module ids abbreviated: `settings` = screens-settings, `intake` = screens-intake, `daily` = screens-daily, `inquiry` = screens-inquiry, `investigate`, `publish`, `action`, `wizards`, `entry` = the screens-* modules; `shell` = interface-shell.

### 1a. Owed screens

| screen (frame) | built by in T47 | acts covered |
|---|---|---|
| `site` (setup) | **MISSING**: no module, no entry, no "Left out" row (see D1) | none drawn (no acts) |
| `install` (setup) | installer R50, R51 (T47-87), on installer R1–R49 (exists) | `bootstrap`, `selftest` |
| `update` (setup) | installer R52 (T47-87) | `bootstrap` |
| `setup` (setup) | entry R6 (T47-86) | all 16 |
| `join` (setup) | entry R7 | all 5 |
| `front` (public) | entry R1, R2; shell R32; control-plane R82 | `login` (R2 also sends `unlock`: D5) |
| `tour` (public) | entry R3 | none |
| `forgot` (public) | entry R4 | `recover` |
| `reset` (public) | entry R5 | `passwordreset` |
| `doorbell` (public) | publish R9 (T47-63) | `knock` |
| `published` (published) | publish R6 | `verify`, `publishedcase` |
| `review-outside` (published) | publish R17 | `reviewcomment` (address: D8) |
| `imported` (imported) | publish R7 | all 4 |
| `assistant` (dock) | exists (inquiry R4, R6, R7); inquiry R8, R13 (T47-61) | all 3 |
| `home` | exists (daily R1); daily R8, R9, R11 (T47-60); wizards R7 | `promote`, `startfrom` |
| `settings` | settings R17 (T47-58); shell R37 | none |
| `members` | exists (settings R1, R2); settings R12, R23 | all 17 (`owed:passwordresetlink` as `passwordresetlink`, R23; `signerset`, R23, DEC-213 (3)) |
| `account` | exists (settings R3); settings R21, R22 | all 8 |
| `connect` | exists (settings R4, R5); settings R13, R24 | all 8 |
| `notes` | exists (settings R6, R7); settings R11 | all 5 |
| `group-identity` | settings R14 | both |
| `security` | settings R15 | all 4 |
| `translations` | settings R16 | all 5 |
| `group` | settings R18 | all 7 |
| `places` | settings R19 | all 4 |
| `recovery` | settings R20 | `recoverycodesissue` |
| `wizards` | wizards R1 (T47-57) | all 6 |
| `projects` | daily R10 | `promote`; **partial**: DEC-214 (3)'s members, activity and last change columns wait on N1025 (T48) (D3) |
| `unavailable` | shell R35 (T47-56) | none |
| `queue` | exists (daily R2, R3); daily R12, R13 | all 13 (`actionmove` R13) |
| `finder` | exists (daily R4); daily R12 | all 6 |
| `find-in` | exists (daily R5) | all 9 |
| `answers` | exists (daily R6) | all 5 |
| `capture` | exists (intake R1–R3); intake R10, R14, R16 | all 7 |
| `held` | exists (intake R4); intake R11, R13 | all 4 |
| `archive` | intake R15 | all 4 |
| `open-file` | exists (intake R5, R6) | all 5 |
| `inbox` | exists (intake R7); intake R10, R12 | all 3 |
| `project` | exists (inquiry R1); inquiry R9–R11, R14 (link), R16 | all 7 |
| `projectai` | inquiry R14 | all 8 (`owed:projectaikeepaway` is declared, op-declarations R41: D9) |
| `question` | exists (inquiry R2); inquiry R12 | all 11 |
| `document` | exists (inquiry R3); inquiry R15 | all 11 |
| `people` | investigate R12, R13 (T47-62), through people R37 (T47-92) | `search` (as `peopledirectory`'s query), `explore`, `entitycreate` |
| `person` | investigate R1 | all 7 |
| `timeline` | investigate R3 | all 6 |
| `money` | investigate R4 | all 14 |
| `calculation` | investigate R5, R14 | all 10 |
| `help` | investigate R11 | none |
| `explore` | investigate R2 | all 5 |
| `proceeding` | investigate R6 | all 5 |
| `due-date` | investigate R7 | all 3 |
| `standard` | investigate R8 | all 3 |
| `ties` | investigate R9 | both |
| `plan` | action R1 (T47-64) | all 10 |
| `start-send` | action R2, R3 | all 7 |
| `request` | action R4, R8 | all 6 |
| `help-records` | action R9 | none |
| `action` | action R5, R10 | all 6 |
| `matter` | action R6 | all 6 |
| `case-editor` | publish R1 | all 5 |
| `review-copy` | publish R2 | all 3 (the link handed over: D8) |
| `ceremony` | publish R3–R5, R12–R15; `ratify` re-point, shell R38 | all 11 |
| `docket` | publish R8, R16 | both |

63 owed screens: 62 built by a T47 entry or existing, `site` missing.

### 1b. Not owed (treatments, DEC-214 (4), (5); K3127)

| screen | why not owed |
|---|---|
| `dash-home` | Home in three arrangements (C, A, B) for S20; Bob chooses after the test instance (DEC-214 (5)); "owed nothing until S20" (DEC-214 "owed") |
| `dash-action` | the Action area as a dashboard; the same |
| `dash-project` | a project as a dashboard; the same |

Their acts (`release`, `adoptversion`, `keepversion`, `taskresolve`, `promote`, `startfrom`, `filingapprove`, `reminderanswer`, `actioncreate`) are all declared or function ops already drawn elsewhere; nothing new is owed by them. But they are in the registry that T47 now carries (K3127), so any check over "every registry screen" counts them (D2).

---

## 2. Journeys walked

"built" = every step's screen and act has a T47 requirement line or exists. Notation: screen:act.

### The way in (K3052's list)

| journey | steps (screen:act) | built? |
|---|---|---|
| **arrive** | `site` (journey 28 steps 1–2) → `/` → `front` (no session; R1 reads `groupidentity`, `groupdescription`, `publishedlist`); `/` with a live record → `home` (shell R32); old addresses `/#invite=`, `/#join=`, `/#boot=` forwarded (shell R36); `/` served as `interfacePage` (control-plane R82) | yes from `/`; **no** before it: `site` missing (D1) |
| **install** | `install`:`bootstrap` (start, cloudflare) → progress → `install`:`selftest` (done, hand-over to `/app/setup#boot=`) (installer R50, R51); `update`:`bootstrap` (R52) | built; its **deploy** is left out (Bob's dashboard act, K2164; "Left out of T47"), so no founder installs from a link in T47; journey-check's local arm uses the fake account (journey-check R1 (a)) |
| **set up and claim** (journey 1, wizard "Set up and claim") | `setup`:`claim`, `recoverycodesissue`, `groupnameset`, `groupdomainset`, `profilesset`, `officesseed`, `aikeepaway`, `groupkeyset`, `courtnoticeset`, `hostingaccessset`, `memberadd`; via "Say who your group is" | yes (entry R6). The wizard has no runner in the setup frame (DEC-213 (4), confirmed): its steps are the screen's parts |
| **sign in** | `front`:`login` (handle, password, device; states refused, paused, signed out, ended, locked) | yes (entry R2; credentials R65, R67; control-plane R83; admission R24–R25) but the lock's "Unlock" act: D5 |
| **lock, password again** | lock over the screen at 30 min (own device), `unlock`; `REAUTH_DUE` → `reauth` → act resent | yes (shell R33, R34; op-declarations R57, R58) |
| **sign out** | `account`:`signout`, `signouteverywhere` → `front` signed out; masthead "Sign out"; shared device 15 min idle | yes (settings R21; shell R4, R32, R33) |
| **join** | `members`:`memberadd` (invitation link, cover) → `join`:`invitelook` / `joinlinkinvite` → `memberlanguageset` → `handlecheck` → `enroll` → `login` → `recoverycodesissue` → `home` (welcome offer) | yes (settings R2; entry R7); the welcome's continuation: D4 |
| **recover** | `forgot`:`recover` (a code); `members`:`passwordresetlink` → `reset`:`passwordresetlook`, `passwordreset`; `recovery`:`recoverycodesissue`; no administrator: `HOSTING_CONTROL`'s steps | yes (entry R4, R5; settings R20, R23) |
| **home** | `home` busy, first visit ("Continue the guided welcome"), new group ("Nothing is here yet", invite, say who you are); "What happened?" doors (`startfrom`); "What the group is working on" | yes (daily R1, R8, R9, R11; wizards R7) |
| **can't open** | `unavailable` (nothing here, not yours, can't be reached) | yes (shell R35) |

### Journeys 1–28 (`mock-journeys.js`; `journeys.html` §4)

| # | journey | steps (screen:act) | built? |
|---|---|---|---|
| 1 | A group gets going | wizard "Set up and claim": `install`, `install`:`bootstrap`, `selftest`, `setup`:… (above), via `group-identity` | yes but the deploy (above) and `site` (28) |
| 2 | The group says who it is | `group-identity`:`groupdescriptionset` (×4) | yes (settings R14) |
| 3 | A member joins | wizard "Welcome a new member": `join`:`memberlanguageset`, `join`:`enroll`, `home`, `question`, via `connect`, via `ties`, `home`:`startfrom` | yes (entry R7; wizards R2, R5, R7) but D4 (steps 1–2 are on the setup frame, where no guide is drawn) |
| 4 | Connecting your own Claude account | wizard: `connect`, `disclosureshown`, `subscriptionsignin` ×2, `accountreferenceset`, `ailimitset`, `accountusesset`, `subscriptiondisconnect` | yes (settings R4, R5, R13, R24; L6 T47-78…80, T47-20; signin-door, control-plane R85–R87; plane R47) |
| 5 | Declaring your own ties | `ties`:`declaretie` ×2, `ties` | yes (investigate R9) |
| 6 | From a problem to a question | `home`:`startfrom`, `notes`:`notewrite`, `capture`:`testify`, `answers`:`ask` (assistant) / `finder`:`search` (without), `find-in`:`findin`, `standard`:`standarddeclare`, `project`:`promote`, `request`:`addresseesuggest` | yes |
| 7 | Getting a record | wizard "Get a record": `finder`:`search`, `capture`:`acquire`, `request`:`addresseesuggest`, `actioncreate`, `actionlaws`, `communicationprepare`, `filingapprove`, `filingrecordsent`, `due-date`:`clockadopt` | yes (action R4, R8; investigate R7). Known: the `@records-request` template is held from members until its professional review (K3081, T47-41; the reviewer Bob's, N858), so the no-assistant path's "the group's own template" step is the member's own words in T47 |
| 8 | Checking a deadline's basis | `action`, `due-date`:`clockpropose`, `clockadopt`, `queue` | yes (action R5; investigate R7) |
| 9 | Checking a claim | wizard "Check a claim": `capture`:`acquire`, `document`:`cite`, `project`:`promote`, `question`:`narrow`, via "Get a record" at `finder`:`search`, `calculation`:`calculationcreate`, `calculationdraw`, `capture`:`testify`, `question`:`conclude`; `help` | yes (investigate R5, R11, R14) |
| 10 | Following a person | `document`:`identityclaim`, `find-in`:`recordpersonfact`, `people`:`search`, `person`:`person`, `recordpersonfact`, `identityclaim`, `followregister` | yes (investigate R1, R12, R13; people R37) |
| 11 | Building a timeline | wizard: `timeline`:`createevent`, `addparticipant`, `relate`, `hypothesishold`, `timeline` | yes (investigate R3) |
| 12 | Following a money trail | wizard: `capture`:`acquire`, `money`:`recordfact`, `createset`, `include`, `reconcile` | yes (investigate R4) |
| 13 | Exploring connections | `people`:`explore`, `explore`:`explore`, `exploreverify`, `connectionassert`, `promote` | yes (investigate R2, R13) |
| 14 | Following a proceeding | wizard: `capture`:`acquire`, `proceeding`:`entitycreate`, `recordline`, `followregister`, `declare` | yes (investigate R6) |
| 15 | From a question to a published case | `capture`:`acquire`, `held`:`release`, `project`:`promote`, `question`:`cite`, `conclude`, `case-editor`:`casedraft`, `review-copy`:`reviewgrant`, `ceremony`:`caseratify` (wizard "Publication ceremony"), `published` | yes (publish R1–R6, R12–R15; ratification R52, T47-72, L8) |
| 16 | A professional lends expertise | `account`:`expertisedeclare`, `members`:`expertiseconfirm`, `question`:`checkrequest`, `calculation`:`recordcheck`, `question` | yes |
| 17 | Working with the assistant | `question`, `answers`:`ask`, `project`:`promote`, `assistant`:`airunclose` (assistant); `answers`:`search` (without) | yes (inquiry R4, R8, R13) |
| 18 | Asking a standing question | wizard: `answers`:`standingquestionset`, `answers`, `queue`, `standingquestionend` | yes (daily R6) |
| 19 | The daily queue | `queue`, `adoptversion`, `reminderanswer`, `proposedispose`, `queuesnooze` | yes (daily R2, R3, R12, R13; action-producers R25) |
| 20 | From a knock to the record | `doorbell`:`knock`, `inbox`:`inboxpull`, `sourcelink` | yes (publish R9; intake R7, R12) |
| 21 | A review copy, out and back | `review-copy`:`reviewgrant`, `reviewcomment`, `ceremony`:`publish`; the reader on `review-outside` | built, but the reader's link is not specified (D8) |
| 22 | From suspicion to a closed plan | `question`:`planopen`, `plan`:`optionadd`, `optionadopt` (assistant), `optiondispose`, `scenarioset`, `start-send`:`optionstart`, `action`:`actioncorrespond`, `matter`:`declinetoescalate`, `plan`:`planclose`; six wizards (Start and send, Demand a correction, …) all on these screens | yes (action R1–R6) |
| 23 | A source changes after publishing | `queue`:`adoptversion`, `case-editor`:`casedraft`, `docket`:`docketpost` | yes (publish R8, R16) |
| 24 | Complying with a court order | `capture`:`acquire`, `docket`:`docketpost`, `ceremony`:`publish` | yes |
| 25 | Exchanging cases | wizard: `imported`:`caseimport`, `imported`, `importaccept`, `importwatch` | yes (publish R7) |
| 26 | Reading and checking a case | `published` ×2, `published`:`verify` | yes (publish R6) |
| 27 | Changing the administrators | `members`:`memberset`, `adminendorse` (password again: `REAUTH_ACTS`) | yes (settings R2; shell R34; op-declarations R58) |
| 28 | civicsmith.org to first work | `site` ×2, `install`:`bootstrap` ×2, progress, `selftest`, `setup`:`claim`, `recoverycodesissue`, `groupnameset`, `home` (new group), `members`:`memberadd`, `join`:`enroll`, `home` (first visit), `account`:`expertisedeclare`, `home`:`startfrom`, `capture`:`testify`, `account`:`signout`, `front`:`login` | yes from step 3, **no** for steps 1–2 (`site`, D1); install's deploy (above) |

Wizards not tied to a walked journey ("Your first question", "Invite a member", "Translate the interface", "Pick up a plan", "Take an escalation to its next stage", "Refer it to an oversight body", "Comment for the group") step only on screens and acts covered above (`library.json`; 0 misses).

---

## 3. Defects

Each: what, where, the recommended plan entry or requirement line, and whose.

**D1. `site` (civicsmith.org) has no entry and no "Left out" row.** Registry `site` (journeys 1, 28); N1011 (`next.md`: "its home and its module placed when Bob's DNS is configured (D14)"); `current.md` has neither an entry nor a row in "Left out of T47"; fold §C named it a gap. Journey 28's first two steps and journey 1's start cannot run. *Recommend:* a "Left out of T47" row: "N1011 `site` (civicsmith.org) | Bob's: the site's host and DNS (D14, K3060 D6); joins the next tranche once named"; installer R50's one block stands meanwhile (DEC-213 (2)). **BOB's to fold**; the act that unblocks it (DNS) is Bob's and already asked (D14).

**D2. The registry T47 now carries has 66 screens, three of them treatments; three requirements count or walk the old 63.** K3127 merges PR #33's head (14ce668e) at L10's close. (a) wizard-scripts R35 says "63 screens"; (b) journey-check R1 (b) opens "every working screen of the registry" and R2 fails on "any registry screen not drawn": `dash-home`, `dash-action`, `dash-project` (and `site`) are never drawn, so the release check fails by construction; (c) setup-words R7 says 1,728 words, 617 protected, but `words.json` is 1,730/618 on `tranche/T47` (DEC-213) and 1,749/631 at the head (DEC-214). *Recommend:* R35 "66 screens, at the K3127 merge's commit; `dash-*` carried as treatments (DEC-214 (4))"; journey-check R2 "any registry screen not drawn, except `site` (D1) and the treatments DEC-214 (4) names"; setup-words R7 "the K3127 merge's `words.json`, its counts as read there". **BOB's** (wording; P17).

**D3. `projects` ships without DEC-214 (3)'s three columns.** daily R10 draws members, activity and last change only once `projectlist` answers them (N1025, project-roster, L2 closed: T48, K3127). Under K3052 the screen is partial in the release Bob tries. **A question for Bob** (an out-of-layer job is his, K1548, as K3069 and K3104): A, one out-of-layer project-roster job now (`projectlist` answers each project's members, acts per week over eight weeks, last change, counting only what the viewer may see; N1025's text), merged before L11's START, daily R10's "when answered" clause dropped; B, as ruled (T48), the table showing stage and owner only. Recommend **A**: it is Bob's own direction (DEC-214 (3)), small, and has two precedents; B ships the table the design replaced.

**D4. The welcome wizard cannot continue as journey 28 draws it.** "Welcome a new member" (`library.json`) starts on `join` (steps 1–2, the setup frame, where no dock or guide is drawn: entry R9; shell R31); `mock-screens.js` `home` first-visit draws "Continue the guided welcome … which you began when you joined". wizards R7 offers it on Home "to a member who has finished neither", and R2 starts a script at its first step, which would open `join` with no fragment. *Recommend:* wizards R7 amended: "the welcome offered on Home after `join` continues at its first step on a working screen (step 3), its two `join` steps counted done by the enrolment (one `wizardprogress` `start` and `step` reached at the join's end); 'Not now' keeps the offer". **BOB's** (detail; the design's intent is drawn).

**D5. "Unlock" is not a registry act on `front`.** The design draws the locked state's "Unlock" as `login` (`mock-screens.js` `SCR.front`, state f); entry R2 sends `unlock` (credentials R71); shell R38 admits only the registry's ops, `infolevelset` and `ratify`, so a `front` act naming `unlock` makes `interfacePage` throw (shell R21). *Recommend:* shell R38 admits a second re-point, `unlock` on `front`, until the registry lists it; a HANDOFF line asks the design stream to list `unlock` ("Unlock") on `front`. **BOB's**.

**D6. The setup frame is not defined in the shell, and `screens-entry` is missing from two module lists.** shell R30 draws without a session only frames `public` and `published`; `setup` and `join` (frame `setup`) start without a session and continue with one (after `claim` + `login`, after `enroll` + `login`); entry R11 asserts it but the frame is the shell's. Shell R28 and control-plane R81 still name "eight" screen modules, without `screens-entry`; control-plane's Uses add four edges, not five; plane R48 already says nine. *Recommend:* shell R45: "a `setup`-frame screen is drawn without rail, tabs or dock, with or without a session record; before one exists it calls public ops only, after it the acts R12 allows"; shell R28 and control-plane R81 amended to nine modules (`screens-entry` first), control-plane's Uses gaining `screens-entry` (an earlier module). **BOB's**.

**D7. legacy-ui has no retirement entry.** K3052 (`rulings-active.md`: "until each is retired, it is a defect on the plan with an entry, never a kept choice"); N1002 names the `civicos` Worker's retirement from biosmoke7; `current.md` "Legacy census" keeps it ("whether it then retires is Bob's, asked at T47's close"); fold §C asked for a census. *Recommend:* a "BOB's acts" entry: before the release, BOB's census of what legacy-ui serves that `/app` does not (each a screen above, or named as dropped with its reason, as DEC-213 (3) did for the setup page); then **Bob's one act**, approving the deploy that takes the `civicos` Worker off biosmoke7 (K1716); code deleted in T48. **BOB's to fold**; the deploy approval is Bob's.

**D8. Journey 21's hand-over has no address.** publish R2 shows the grant's secret once; R17 serves the reader at `/app/review#grant=<secret>`, but the router maps `/app/<screen>` (shell R9) and the screen id is `review-outside`; nothing draws the link the member hands over (the design's `review-copy` draws none either). *Recommend:* publish R2 "shows the reader's link `<origin>/app/review#grant=<secret>` once, with 'Civicsmith sends no email'" (as members' invitation); shell R9 maps `/app/review` to `review-outside`. **BOB's**; HANDOFF the link's words.

**D9. Registry still marks `projectaikeepaway` owed though it is declared.** DEC-213 (5) keeps `owed:projectaikeepaway` "until declared"; op-declarations R41 declares it and credentials serves it (`bio-plane/src/credentials/index.mjs`). Harmless to the build (the shell admits owed ops by name), but the registry is wrong. *Recommend:* HANDOFF to UX-DESIGN; no plan change. **BOB's** (channel).

**D10. An entry with no requirement line.** T47-65's "(K3104) `peopledirectory` routed with people's ops" has no control-plane R-line (control-plane.md has none naming it), and plane R48 re-pins the route map to R57–R59 and tasks R19, not op-declarations R61. *Recommend:* control-plane R89 "`peopledirectory` routed through `people`'s map, `viewer` stamped (op-declarations R61)", plane R48 adds R61. **BOB's** (wording).

**Stale text (BOB's, wording, no job):** screens-settings' Status still says "Places and offices and recovery codes stay on the setup page" (now R19, R20); shell R28's "Group settings opens the setup page … the record browser" (retired by R37, the record browser closed by DEC-213 (3)) and shell R3's "goes to `/` (the setup page's sign-in)" (R32) could carry their retirement marks, as setup-page's lines do.

**Not defects, noted:** shell R44 builds `cs.reading`, `cs.path`, `cs.storyline`, `cs.strip` for which no owed T47 screen calls (only `cs.initials`, `cs.activity` in daily R10, and only after N1025); K3127 ruled it, so it stands, tested over fixtures. "Set up and claim" is required but never run (no runner in the setup frame, DEC-213 (4)); its `wizardprogress` counts stay zero. The installer's deploy (K2164) and the records-request template's review (K3081) each wait on a named Bob act already recorded.

---

## 4. Registry: `tranche/T47` (63) against PR #33's head (66)

Between them only DEC-214 changed the registry (commit 14ce668e7c; `git diff` of `registry.json`: 140 lines added, none removed):

| change | screens | acts |
|---|---|---|
| added | `dash-home` (Home in three arrangements, S20), `dash-action` (the Action area), `dash-project` (a project) | none new: each act already declared on another screen |
| changed | none in `registry.json` (`projects`' purpose there unchanged; its new columns are in `mock-screens.js` `projTable` and `mock-refs.js`) | none |

Outside the registry, the same commit: the masthead's mark (`mock-shell.js`; shell R43), the at-a-glance elements (`mock-screens.js` `spark`, `people`, `tile`, `strip`, `nextpath`, `tlstrip`; shell R44), the Projects table (`projTable`; daily R10, D3), 19 more words (1,749, 631 protected), `layouts.html` and `page.src.html`'s styles and the "Dashboards: first treatments" section. `library.json`, `mock-acts.js` and `mock-journeys.js` are identical on both.

DEC-213 (4ccf05ea88) is already on `tranche/T47` (K3107): `reset` `passwordreset`, `group` `grouplanguagesset` and `grouplogoset`, `ceremony` `signrequest` lost their `owed:` names; `members` gained `signerset` ("Withdraw <handle>'s signing key"; settings R23); "Set up and claim" step 1 names Workers Paid (wizard-scripts R36); the installer's interim block (installer R50).

### Whose

- **BOB's to fold (P17):** D1 (a "Left out" row), D2, D4, D5, D6, D7 (the entry; Bob approves the deploy), D8, D9 (HANDOFF), D10, the stale text.
- **Bob's (UX value, an out-of-layer job, K1548):** D3, options A/B, recommend A.
