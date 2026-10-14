# screens-action — requirements

**Status** · New in T47 (T47-64; K657, K1043, K569, K3027 doubt 2): a module built fresh, layer 11 after `screens-publish`, last of the screen modules, before `control-plane` (N897 (1): the v0.2 constructs the design stream has drawn, `plan`, `start-send`, `request`, `action`, `matter`; `BIO_Action_v0_2.md` rules 1–3, 6, 15, 18–21; K608, K2780; DEC-89, DEC-113, DEC-115, DEC-194). Drafted in `build/plan/draft-T47-interface.md` §2.4, worded here by BOB (P5). No ids move. Not yet met (T47). Last changed T48 (T48-76: R11 new, amending R3, the prepared draft re-read on reload, N1034, `filings` R59; R12 new, amending R5, the action's project, title and pressure marks, N1035, `actions` R102, `action-holds` R16; R13 new, amending R1, "Ask the assistant for options" as a planning run, N1043, `action-plans` R51; K3145, K3149, K3195, K3207); marked not yet met (T48). Last changed T48 (K3254, the L11 design fold of WALK-084 #2, K3250: R14 new, the common line); marked not yet met (T48).

**Size (P6).** Estimated 2,400–3,000 lines with comments, its own keyed sentences included, measured at its START (M-T47-1, K617).

## Public

### Purpose

The Action layer's working screens: a project's action plan, starting an option and sending what it says, a records request, one action with its replies, deadlines, pressure and holds, and one government act as a matter with its escalation. The member decides and sends; the group's Civicsmith proposes, prepares and records, and sends nothing. Pure: every read and act is an op, through `interface-shell`.

### Provides

**`SCREENS`, `SCREEN_WORDS`** (the screen contract, `interface-shell` R21; words, its R5)

**plan** (Projects › <project> › Action plan; the registry's 10 acts; K608 (4); `views/plan-page.html`)
- **R1** Reads the plan (`plan`: its subjects, called matters in member words, each with its determination and escalation stage; its options with category, regulated end date, subject and disposition; its scenarios and their phases; what each started option became) and its checks (`planproposals`, the assistant's suggestions, drawn only while the assistant is reachable, labelled machine work "not yet in the plan"). The checks strip states each check, such as a scenario with no branch for a hostile response. Options sort by category, regulated end date, matter or disposition, and are picked as rows (`interface-shell` R19). Acts: `plansubjectadd` "Add a matter"; `optionadd`; `optionpropose` "Ask the assistant for options" (reachable only); `optionadopt` (a suggestion, by the member's own act); `optiondispose` "Choose" or "Decline" (with a reason where declining); `scenarioset` "Lay out a scenario"; `checkpointrecord` "Judge" a checkpoint; `optionstartpreview` "Start…" (opening `start-send` for the option); `itemtakeup` "Take this up" on an item nobody has taken up (routing its to-dos to the member; nobody assigns anybody); `planclose` "Close plan…" with a reason.

**start-send** (Projects › <project> › Action plan › Start and send; the registry's 7 acts; DEC-115; `views/start-and-send.html`)
- **R2** Step 1, Start: `optionstartpreview` answers what starting does (the kind, the office addressed by its role with who holds it today, what it rests on with each matter's state, the clock from the law the profile names, whether it asserts a breach, and every refusal it would meet, first); the member resolves a refusal in place (a reason where proceeding anyway, which the action and everything prepared from it then state) and `optionstart` "Start the action" starts it. Nothing runs before her confirm.
- **R3** Step 2, Prepare and send: `communicationprepare` "Prepare what is sent" (from the group's template for this kind where it has one, else her own words; a machine draft only while the assistant is reachable, labelled, each filled blank naming its source), `filingprepare` "Prepare the filing", `filingapprove` "Approve this text" (terminal: approving fixes the text; its dialog says so), `filingsecondapprove` "Give the second approval" (where the project asks a second approval, by a member other than the first approver; while it waits, the screen says so and offers no send), and `filingrecordsent` "I have sent it · record the sending" (`mark.outward.means`; read, not done, at the phone width, `op-grades` R18). The screen says that the group's Civicsmith sends nothing: the member sends by the office's own means and records it.

**request** (Projects › <project> › Request records; the registry's 6 acts)
- **R4** Says to look first: a record already public is captured instead (`capture`). Acts, in the flow's order: `addresseesuggest` "Choose the office" (the offices that hold such records, each by its role and who holds it today); `actioncreate` "Start the request" (what is wanted, in plain words); `actionlaws` "Choose the law it goes under" (the laws the profile names, each with its window); `communicationprepare` "Prepare the text"; `filingapprove` "Approve this text"; `filingrecordsent` "I have sent it" (`mark.outward.means`: sending tells the office what the group is looking at). The "Get a record" wizard's mark is drawn here.

**action** (Projects › <project> › Action; the registry's 6 acts; DEC-113; v0.2 rules 6, 15)
- **R5** Reads the action (`action`: what it is, to whom, when and by whom it was sent, its clock entries with their due dates and state, its replies and their entries, its scope, its holds and pressure) and draws "Waiting on <office>'s reply" while one is owed, each due date with `mark.due` (a passed one as canon's question, "no reply recorded by <date>", never "overdue" until a member determines it, `action-producers` R1). Acts: `actioncorrespond` "Record a reply"; `actionpressure` "Mark a reply as pressure"; `actionmove` "Move the action"; `reminderset` "Remind me"; `actionhold` "Record a litigation hold" (with a reason); `actionscope` "Make the action confidential, or not" (with a reason; a published case keeps what it said). Each due date opens `due-date`.

**matter** (Projects › <project> › Matter; the registry's 6 acts; DEC-89; `views/matter-page.html`)
- **R6** Reads the matter's determination (`determination`: the act, the standard it is tested against, what it requires and what the act did, its outcome, compliant or not, recorded with the same care either way), its consequences (`consequencesof`: who or what, the measure and how it is known, an undetermined measure never read as zero, people counted as a class), and its escalation (`escalation`, `escalationstatus`: the stages Documentation, Notification, Clock starts, Public, Formal, Political, Legal, the proposed next stage and its trigger, what ends it, and the actions attached). Acts: `escalationopen`; `escalationadvance` "Advance to stage <n>"; `declinetoescalate` "Decline to escalate, with a reason"; `escalationend` "End" (terminal, its dialog stating what ending does); `escalationstoppursuing` "Stop pursuing, with a reason"; `escalationreopen` "Reopen where it stopped" (with a reason). The legal tools a stage makes available are listed as facts from the profile, never as advice.

**Common**
- **R7** `interface-shell` R8–R13 and R16 hold on every screen; after an act, the screen re-reads what it changed and draws it; nothing is drawn as sent, approved or started before its answer. Every member-facing sentence calls a plan's subject a "matter" (`action-producers` R19).

#### T47's L11 fold (K3100)

- **R8** (DEC-209 (3), (4); `filings` R54, R55) **request**: the period, the form and the cost limit as fields sent as `fills`; the outward warning names that the portal shows the text to anyone; `filingrecordsent` takes the venue's reference (the portal's request number).
- **R9** (DEC-209 (5)) **help-records**, from `request`: what the office must do, the profile's faster request where held (`profiles`' `view`), what the portal shows, what Civicsmith does with the due date; its sources listed.
- **R10** (DEC-212) An action opened from the unsent-request item opens at its step (approved, not sent: the send step).

#### T48 (T48-76)

- **R11** (T48; N1034; K3145; `filings` R59; amends R3) On `start-send` and `request`, a draft prepared and not yet approved is read again on load through `filingread` (the filing the action holds), so a reload between preparing and approving draws the same text, blanks with their sources, unfilled blanks with why, the member's fills (labelled hers), the advisory and the offers; nothing is prepared again by reading. `NO_SUCH_FILING` is drawn as "Nothing is here" (`interface-shell` R35). Test: prepare, reload, and the same text and fills are drawn; control: no `filingprepare` or `communicationprepare` is sent on load.
- **R12** (T48; N1035; K3145; `actions` R102; `action-holds` R16; amends R5) `action` heads the screen with the action's `title` and its project as a reference (`place`, `interface-shell` R8's project step), each as `action` answers them (a null drawn absent, never as "untitled"); and draws the pressure marks from `pressurefor` (the action's marks and pressure records, each with where it arrived), paged by `after`. Test: an action in a project draws its title and the project step; control: a mark on another action is not drawn.
- **R13** (T48; N1043; K3149, K3207; `action-plans` R51; `interface-shell` R55; amends R1) On `plan`, "Ask the assistant for options" (the registry's label `act.optionpropose.label.plan` and help `act.optionpropose.does`) sends `planask` with the plan, only while the assistant is reachable (`interface-shell` R20); its answer's run is drawn running (re-read by `cs.later`, as `screens-inquiry` R8), and the run's proposals reach the tray (`planproposals`, labelled machine work). `existed: true` draws the run already asked. `optionpropose` is not drawn for this act. Refusals by their words (`AI_*`, `PLAN_CLOSED`). Test: the act sends `planask` and the tray is re-read when the run ends; control: no `optionpropose` is sent.

**The design walk folded** (T48; WALK-084 #2; K3250, K3254)
- **R14** (T48; K3250, K3254 (1), (5); walk C1, C4, C5; DEC-219 (3); K3052; amends R7) The common line, on every screen of the module: every element these screens draw uses a class that a served stylesheet defines (`interface-shell` R56).
  - Where the design draws the element, the screen uses the design's own class: an `mk-*` class as `shell.css` carries it, and a `cs-*` class the design spells `mk-*` (`cs-frontgrid`, `cs-signin`, `cs-fronthead`, `cs-flogo`, `cs-facts`, `cs-note`, `cs-sub`, `cs-small`, `cs-steps`, `cs-passage`, `cs-strengthbox`, `cs-gapblock`, `cs-pickc`, `cs-areas`, `cs-table`) is renamed to the design's spelling. A class the design does not draw is mapped to the kit's or a design class; only where none fits does `interface-shell` carry its style (its R56), with an ASK to UX-DESIGN to draw it (K3254 (1)).
  - Every labelled field is drawn with `cs.field`. No screen draws `cs-form` or a bare `<label>` with `.help`.
  - A section, tray, list, block or reading that holds nothing is not drawn. No count, reading or "finished by" is drawn at zero. A screen with nothing at all to show draws its one designed empty state, which names the first step. (DEC-219 (3) applied to every screen is BOB's reading of K3052, K3254 (5); the designed screen-level empty states are kept.)
  - A read that failed is still drawn as failed (`interface-shell` R10).
  - It covers `mk-form`, which becomes `cs.field`, and `mk-done` and `mk-grid`, which become the design's classes or `HOOK_CLASSES`.

  Test: the module's real `SCREENS` compose under `interface-shell` R56, and each screen drawn over an empty fixture shows no empty section and no zero. Control: a failed read is drawn `state.failed`.

## Private

### Uses

- `interface-shell`: the kit `cs` and the screen contract (its R21), rows and the hold strip (its R19).
- `setup-words`: `WORD_ROWS` keys (the Action layer's words, DEC-194).
- `wizard-scripts`: `SCREEN_REGISTRY` (its R13, R31), in tests only.
- Through the plane: `action-plans` (`plan`, `planproposals`, the plan acts, `optionstartpreview`, `optionstart`), `plan-work` (`itemtakeup`), `filings` (`communicationprepare`, `filingprepare`, `filingapprove`, `filingsecondapprove`, `filingsent`), `actions` (`action`, `actioncreate`, `actionlaws`, `actionmove`, `actioncorrespond`, `addresseesuggest`), `action-records` (`actionscope`), `action-holds` (`actionhold`, `actionpressure`), `action-clocks` (`reminderset`), `conformance` (`determination`), `consequences` (`consequencesof`), `escalation` (the escalation acts and reads).
- (T48) Through the plane: `filings` (`filingread`, its R59; R11), `actions` (`action`'s `project` and `title`, its R102; R12), `action-holds` (`pressurefor`, its R16; R12), `action-plans` (`planask`, its R51; R13).
- Tests only: `op-declarations` (`OPS`).

### Invariants

None numbered here: `interface-shell` R23 and R24 (no place named; no log of who opened what) bind this module's screens as every screen's.

### Satisfies

- Registry screens `plan`, `start-send`, `request`, `action`, `matter` (`docs/development/ux-substrate/screens/registry.json` at `a0fab7abf0`; DEC-139); their drawings in `mock-screens.js` and `views/plan-page.html`, `views/start-and-send.html`, `views/matter-page.html` (ACTION_DESIGN #1) at that commit; N897 (1).
- `BIO_Action_v0_2.md` rules 1–3 (refusals first, a reason in place, a premise override stated: R2), 6 (one date, canon's question: R5), 15 (scope: R5), 18 (take-up, nobody assigned: R1), 19 (labelled drafts: R1, R3), 20, 21; DEC-115 (R2, R3); DEC-113 (R5); DEC-89 (R6); DEC-194 (the words); K608 (4) (R1).

### Suggestions

- The screens' own sentences are held in `SCREEN_WORDS` (`screen.<id>.<part>`) from the mockups' English at `a0fab7abf0` until the design stream adopts them (DEC-198 (6)).
- `views/*.html` draw more than the registry lists for these screens (a plan's "Decline with reason" on picked options, a pressure record's "Open an inquiry"); only the registry's acts are drawn (`interface-shell` R21), the rest named back to the design stream (`draft-T47-interface.md` §3).
