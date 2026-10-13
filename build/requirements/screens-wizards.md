# screens-wizards — requirements

**Status** · New in T47 (T47-57; K657, K1043, K569, K3027 doubt 2): a module built fresh, layer 11 directly after `interface-shell` and before `screens-settings` (N897 (1); N821's runner, its screen side; N551, its share: the welcome and first-question wizards' order; N572: DEC-140's "Show me where"; DEC-120, DEC-121, DEC-139 (4), DEC-148, DEC-158). Drafted in `build/plan/draft-T47-interface.md` §2.1, worded here by BOB (P5). No ids move. Not yet met (T47).

**Size (P6).** Estimated 1,800–2,400 lines with comments, its own keyed sentences included, measured at its START (M-T47-1, K617).

## Public

### Purpose

The wizards a member walks on the real screens: the group's wizard library (`wizards`), and the runner, the wizard guide docked beside any screen, which says each step's what and why, rings the control the step names and never presses it. Pure: every read and act is an op, through `interface-shell`.

### Provides

**`SCREENS`, `SCREEN_WORDS`, `GUIDE`** (the screen contract, `interface-shell` R21; words, its R5; the dock's guide, its R31)

Terms. A **script**, a **version**, a **step**, **offered** and a **side trip** (`via`) are `wizard-scripts`' (its Terms, R1, R2, R11). **The runner** is this module's `GUIDE`, registered with the shell for the dock (`interface-shell` R31). A **wizard mark** is the mark a screen shows for each offered script that starts there.

**wizards** (Settings › Wizards; the registry's 6 acts; DEC-121, DEC-158)
- **R1** Reads `wizards` (the scripts the member may see, each with its state, author, contributors, approver and dates, `broken`, its use, and `based_on` with its base's name), `wizardread` for one script's version with its steps and attribution, and `baseupdates` (each copy whose base has a newer approved version, with both step lists). Each script is a row (`interface-shell` R19): its name (a Civicsmith script's by its key `wizard.<id>.name`, a group's as recorded), whose it is (Civicsmith's or this group's), what a copy is based on, who approved it, and how many finished it; a copy whose base changed says so, showing what changed. Acts, each with its owner's arguments and drawn per `interface-shell` R12:
  - `wizards` "See the whole library": the list again with a state chosen (drafts, submitted, withdrawn, retired, broken, or open proposals);
  - `wizarddraft`: "Record a new wizard" (R3's recording) and "Copy a wizard to change it" (`copy`, any approved version the member may see, the new script showing what it is based on);
  - `wizardrevise`: reword, reorder or delete a draft's steps (adding one only with the advanced editor, `wizard-scripts` R8), adopt a proposal, or bring a base's change across (`adopt: {base}`);
  - `wizardsubmit`, `wizardapprove` (a project owner; "make it group-wide", `widen`, an administrator), `wizardretire` (a script, by an approver, or a draft or submitted version, by its author; with a reason).
  A Civicsmith script's row offers no write act but the copy (`wizard-scripts` R9: `WIZARD_NOT_THE_GROUPS`). Every refusal is drawn by `interface-shell` R13, a check's refusal naming its step. *(not yet met: T47)*

**The runner** (the dock's wizard guide; DEC-120 (2), DEC-139 (4), DEC-140)
- **R2** A wizard starts from a screen's wizard mark (`wizardsat` for that screen: each offered script with its name and finished count, and the member's own drafts, run privately), from Home's front doors (`screens-daily` R9, through `cs.wizard`), or from the library (R1). While it runs, the dock holds the guide (`interface-shell` R31): the script's name, "step <i> of <n>", the step's what and why (a Civicsmith script's by its keys `wizard.<id>.step<n>.what` and `.why`, a group's as recorded), Back and Next, and Stop with "Stopping is fine: nothing is lost, and nobody is told". On each step the runner opens the step's screen (`cs.go`) and, where the step names an act, rings that act's control once (`cs.ring`); "Show me where" (Alt+Shift+W) rings it again, as often as the member asks. A step whose act the screen does not draw for this member (absent by `interface-shell` R12, or the screen in another state) says so and offers Next. The runner never presses a control, never sends an act, and never fills a field but as R4 says. *(not yet met: T47)*
- **R3** "Record a new wizard" puts the guide in recording: as the member works on the real screens, each act she presses is added as `{screen, act}` (`interface-shell` R31 tells the guide the op and screen only), never a value she typed; she may remove a recorded pair before saving, and saving sends `wizarddraft` with `recorded` and the name she gives. Her draft's `what` and `why` are then written by `wizardrevise` on `wizards`. *(not yet met: T47)*
- **R4** A step carrying a `draft` places it in the field of the step's act, by `cs.fill`, labelled with its kind ("Draft · from the wizard", "Draft · from your group's template", or, for `{machine: <op>}`, "Draft · the assistant's, asked by <handle>"), and never submits it: it becomes the member's words only by her own act. A `{machine: <op>}` draft is asked of its op only while the assistant is reachable (`interface-shell` R20) and at the member's press of "Draft it", carrying `ai.label.untested` where the answer carries `untested`; with the assistant not reachable the step offers no machine draft. A step whose act is one the assistant may not help with is never given a machine draft (`wizard-scripts` R24, R12). *(not yet met: T47)*
- **R5** A step with `via` starts that script as a side trip, the guide saying "Side trip: <name>. When it finishes or you stop it, you come back to this step."; when it ends, by its last step or by Stop, the guide returns to the step left (DEC-139 (4)). *(not yet met: T47)*
- **R6** The runner reports progress only through `wizardprogress` (`start`, each `step` reached, `finish`), which carries nothing naming the member, the case, the project or the instant beyond the day (`wizard-scripts` R15); stopping sends nothing. A running wizard's place is kept in the page's memory only, never in the browser's storage, an address or a request, so leaving the page ends it. *(not yet met: T47)*
- **R7** (N551, its share; DEC-148) Home offers the required "Welcome a new member" first, and "Your first question" after it, to a member who has finished neither on this device (the finish kept on the device, never sent), as wizard marks at the top of Home; the ceremony screen (`screens-publish`) carries the required "Publication ceremony" as its wizard mark. A required wizard is offered, never forced. The welcome offered on Home after `join` continues at its first step on a working screen (step 3): its two `join` steps are counted done by the enrolment (one `wizardprogress` `start` and the `step` reached at the join's end, sent once the member's session exists); "Not now" keeps the offer (K3137; journey 28). *(not yet met: T47)*

**Common**
- **R8** `interface-shell` R8–R13 hold on `wizards`; after an act, the screen re-reads what it changed. *(not yet met: T47)*

## Private

### Uses

- `interface-shell`: the kit `cs` and the screen contract (its R21), the dock's one panel, `cs.ring`, `cs.wizard` and the recording hook (its R31), `cs.fill` (its R27).
- `setup-words`: `WORD_ROWS` keys (`wizard.<id>.*`, `screen.wizards.*`).
- `wizard-scripts`: `SCREEN_REGISTRY` (its R13, R31), in tests only.
- Through the plane: `wizard-scripts` (`wizards`, `wizardread`, `wizardsat`, `wizarddraft`, `wizardrevise`, `wizardsubmit`, `wizardapprove`, `wizardretire`, `wizardprogress`, `baseupdates`; its R3–R11, R15, R26), and each op a `{machine: <op>}` draft names (`writinghelp`, `whatchangedpropose`, `escalationreasondraft`, `groupdescriptiondraft`, the T45 drafts; their owners).
- Tests only: `op-declarations` (`OPS`).

### Invariants

- **R9** Nothing this module does records which member walked, stopped or finished which wizard: no log, no request beyond `wizardprogress`'s unattributed tally (K1364 B4), and the device's note of a finished welcome (R7) is never sent. *(not yet met: T47)*

### Satisfies

- Registry screen `wizards` (`docs/development/ux-substrate/screens/registry.json` at `a0fab7abf0`; DEC-139); the dock's wizard guide (`mock-shell.js`' `wizardGuide`, `layouts.html` §3 "Journeys and wizards, walked"); N897 (1); N821 (the runner, its screen side); N572, DEC-140 (R2: "Show me where", Alt+Shift+W).
- DEC-120 (1), (2) (a wizard runs with no AI and no key; drafts in fields, the member alone acting): R2, R4. DEC-121 (1)–(6) (the libraries, authoring by recording, approval, use tallied unattributed): R1, R3, R6, R9. DEC-139 (4) (side trips): R5. DEC-148 (the library, its required flows): R7. DEC-158 (copy a wizard to change it): R1. DEC-153 (4) (no machine help on a refused act): R4. K1364 B3, B4.

### Suggestions

- The guide's sentences ("step <i> of <n>", "Side trip: …", "Stopping is fine…", the ring's labels, the draft labels) are held in this module's `SCREEN_WORDS` (`screen.wizards.<part>`, `screen.guide.<part>`) from the mockups' English at `a0fab7abf0` until the design stream adopts them (DEC-198 (6)).
- Where a member may change Alt+Shift+W (DEC-140: "changeable in the member's settings") is not drawn in `account` today; the shortcut is fixed until the design stream draws it.
- Tests per `draft-T47-interface.md` §4: the library's six acts by table; the runner over a fake plane, walking a two-screen script with a side trip, checking every request (no act sent by the runner, `wizardprogress` carrying no member) and the ring on each step's control.
