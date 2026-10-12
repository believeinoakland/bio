# screens-settings — requirements

**Status** · New in T46 (T46-55; K657, K1043): a module built fresh, layer 11 directly after `interface-shell` (N897 (1), (3), Bob's K2816; K2147; DEC-136, DEC-153, DEC-156, DEC-188; DEC-197 and N934: a handle fixed at joining). Drafted in `build/plan/draft-T46-interface.md` §2.3, amended by DEC-197, worded here by BOB (P5). No ids move. Not yet met (T46).

**Size (P6).** Estimated 2,400–3,000 lines with comments, its own keyed sentences included, measured at its START (M-T46-1, K617).

## Public

### Purpose

The settings a member and an administrator use day to day: the roster and the group's AI key (`members`), the member's own account (`account`), how the assistant serves the member, with their own Claude sign-in (`connect`), and their own notes (`notes`). Pure: every read and act is an op, through `interface-shell`.

### Provides

**`SCREENS`, `SCREEN_WORDS`** (the screen contract, `interface-shell` R21; words, its R5)

**members** (Settings › Members; the registry's 15 acts)
- **R1** Reads: `memberlist` (the roster: handle, cover, role, capabilities, status; no "formerly" is drawn, DEC-197), `expertiselist`, `adminrecoverystep` (the one-administrator note while not met, as `setup-page` R16 states it), and for the group's key `groupkeystate`, `accountuses`, `ailimits`, `aiusage` and `accounthistory` with `owner: "group"`, and `aikeepawaystate`. Use is drawn summed, naming no member (DEC-188 (5)). *(not yet met: T46)*
- **R2** Acts, each with its owner's documented arguments and drawn per `interface-shell` R12: `memberadd` (an invitation: `memberId` the short id, `cover`, and the capabilities ticked; the invitation answered is shown once, with the sentence that your group's Civicsmith sends no email); `membercaps`; `memberset`; `adminendorse`; `adminremove`; `expertiseconfirm`; `invitewithdraw` (from the invitation's row); `websitekeycreate`; `joinlinkenable`; `groupkeyset` (the key in the request's body only, never drawn again; then `groupkeyswitch` `on: true`, as `setup-page` R18 does); `groupkeyswitch`; `groupkeyremove`; `accountusesset` and `ailimitset` with `owner: "group"` (the AI account panel, R9); `aikeepaway` (on only with a reason of 1 to 2,000 characters, saying first what it does, as `setup-page` R18, R24). Each row's acts are in its panel (`interface-shell` R19). *(not yet met: T46)*

**account** (Settings › Your account; the registry's 6 acts)
- **R3** Reads: `whoami` (the handle), `memberlanguage`, `expertiselist` (the member's own), `signerlist` (the member's own key). The handle is drawn fixed, with DEC-197's sentence ("Your handle is fixed: it names your work in the group and in published cases, and no one else can ever take it"), and no act changes it: no `handlechange` act is drawn, and `handle.changeable`, `handle.formerly` and `handle.refused.*` are not drawn. Acts: `memberlanguageset` (the languages the group's profiles answer); `setpassword` (current and new password, the new typed twice alike, sent only when alike, as `setup-page` R3); `expertisedeclare`; `signerregisterown` and `signerrevokeown` (friction by their weight, `interface-shell` R11); the explanation level (`infolevelset`, `interface-shell` R17) and appearance (its R18). Links to `connect` and `notes`. *(not yet met: T46)*

**connect** (Settings › The assistant; the registry's 7 acts and two re-points, `interface-shell` R21)
- **R4** Reads: `assistantstate`, `aikeepawaystate`, `groupkeystate`, `groupkeynotice`, `disclosureof`, `accountreference`, `subscriptionsignin` `{step: "state"}`, and for the member's own account `accountuses`, `ailimits`, `aiusage`, `accounthistory` with `owner: "member:<me>"`. It draws exactly one of four situations from them: the group's key serves the member (with the member's daily allowance when a per-member limit is set, from `aiusage` read without `owner`: `ai-use` R4's `payers[].limits`, since `ailimits` with `owner: "group"` is an administrator's read, K3002); the member's own account serves them (what it is, never its key); nothing serves yet; the group keeps its material away (who, when and the reason in the administrator's words, "If you think this should change, ask an administrator", and no act). The rule of who pays is `ai.whopays`. *(not yet met: T46)*
- **R5** Acts: `groupkeynoticeseen` and `disclosureshown` (the two notices, each `mark.outward.means`, before the first question on that account); connecting, offered in DEC-156's order, subscription first, then an API key, then skip:
  - **Subscription sign-in** (DEC-156; K2147; N897 (3)): "Open Anthropic's sign-in page" sends `op=subscriptionsignin` with body `{step: "start"}` and opens the answered `address` in a new browsing context (`rel="noopener noreferrer"`); the field "The code from Anthropic's page" sends `{step: "code", code}` in the body only, never stored, logged or drawn again; `connected: true` draws the second situation. Refusals are drawn by `interface-shell` R13, with these meanings in this module's `SCREEN_WORDS` until the design stream keys them: `NO_SIGNIN_WAITING` (the sign-in timed out or was never started: start again), `SIGNIN_REFUSED` (Anthropic's page did not accept the code; the runner's `detail` shown), `SIGNIN_UNAVAILABLE`, `SIGNIN_ADDRESS_UNEXPECTED`, `AGENT_WORKER_UNBOUND` (the sign-in cannot run on your group's Civicsmith yet), `AI_KEPT_AWAY` (`agent-runner` R17–R19, `agent-worker` R66, `control-plane` R65); `RUNNER_NOT_CONFIGURED` and `DISCLOSURE_DUE` by the translation the door relays (`control-plane` R65).
  - **API key:** `accountreferenceset` with the key in the request's body only, never drawn again.
  - **Disconnect:** a connected subscription sends `op=subscriptiondisconnect`; an API key, `accountreferenceremove`.
  - The member's own account panel (R9): `accountusesset`, `ailimitset` with `owner: "member:<me>"`. *(not yet met: T46)*

**notes** (Settings › Your notes; the registry's 5 acts; DEC-136)
- **R6** Reads `notes` (the member's own). Acts: `notewrite`, `noterevise`, `notedelete` (as graded, `interface-shell` R11), `noteturn` (into an observation, hunch or question, as the owner's shape names), and `writinghelp` under the note's field only while the assistant is reachable (`interface-shell` R20), its draft placed in the field labelled "Draft · the assistant's, asked by <handle>" and kept only by the member's own `notewrite` or `noterevise` (DEC-153 (3)). The screen states who can see the notes (protected words). *(not yet met: T46)*
- **R7** When the group tells members what a court can reach (`op=courtnotice` answers `tell`), the first time this member keeps a note the screen shows DEC-136's sentence once, in `membership` R108's words. *(not yet met: T46)*

**Common**
- **R8** After an act answers, the screen re-reads what that act changes and draws it; nothing is drawn as done before the answer. *(not yet met: T46)*
- **R9** The AI account panel (DEC-188 (1)) is one render over an `owner`: what the account pays for (the uses `ai.use.<u>.name`; exploring, `ai.explore.*`, at group level only), its limits as a table with one form (`ai.limitfield.*` on refusal), this month's use summed, and the changes with who and when. The same render serves `members` (`owner: "group"`) and `connect` (`owner: "member:<me>"`). *(not yet met: T46)*

## Private

### Uses

- `interface-shell`: the kit `cs` and the screen contract (its R21), the act gate and refusals (its R11–R13, R19, R20).
- `setup-words`: `WORD_ROWS` keys.
- Through the plane: `membership` (the roster and administrator acts, R12–R13, R123; R108's court sentence), `credentials` (R3, R9–R10, R33, R35, R43, R51–R62), `ai-use` (R12 and the limit acts), `instance-setup` (R53, R54, R64, R79), `hypotheses` (notes), `wizard-scripts` (R27, `writinghelp`), `control-plane` R65.
- Tests only: `op-declarations` (`OPS`).

### Invariants

- **R10** No key, code or password typed on these screens is written to the browser's storage, an address or a later request. *(not yet met: T46)*

### Satisfies

- Registry screens `members`, `account`, `connect`, `notes` (DEC-139); N897 (1), (3) (Bob's K2816: the assistant paid by Bob's own sign-in through `connect`); K2147.
- DEC-136 (R6, R7), DEC-153 (R6), DEC-156 (R5), DEC-188 (R1, R2, R4, R9), DEC-197 and DEC-196 (R1, R3; N934), DEC-149 (R2's sentence).

### Suggestions

- The sign-in refusals' words, DEC-197's handle sentence and the screens' own sentences are a HANDOFF to the design stream in BOB's channel act; until given, `SCREEN_WORDS` holds the meanings above (`screen.<id>.<part>` keys).
- The "Need more? Connect your own account" link is a scroll to the section, not a route. `projectai` (T47) will reuse R9's render.
- Tests per `draft-T46-interface.md` §4 (1): one table per screen lists every registry act; a test fails if a screen draws an act not listed, or a listed act is not drawn in the state where it applies.
