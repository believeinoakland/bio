# JOURNEYS walk, area S4 (continued): findings V-S4-21 to V-S4-43 (plan, action, start an action, matter, keyboard, times, console, published page)

Split from S4.md by subject (LANES §1 size cap). The table, journeys, V-S4-1 to V-S4-20 and the sorted list are in S4.md.

### V-S4-21 · MISLEADS · Plan: a checkpoint shows neither its test nor where it leads
- **Journey and screen:** Journey 22 step 3; screen plan
- **Role and width:** administrator and member, 1280
- **What the user sees:** A scenario with a checkpoint "Did the officer answer by the date?" after 10 days draws only "Ask the records officer / File a records request ... / November 6, 2026 / You can judge this checkpoint from November 6, 2026." The question the checkpoint tests and its "if met, go to" and "if not met, go to" are drawn nowhere (the judge's form is the only place they could appear and it is not drawn until the day).
- **What the design says:** registry `checkpointrecord` "Judge a checkpoint"; journey 22 step 3.
- **Severity:** MISLEADS
- **Cause:** `bio-plane/src/screens-action/plan.mjs:487-496` builds the row from the phase name, the option names and the judgement only.
- **Owning module:** action-plans (the data is held); screens-action
- **How it was missed:** E.md K7 laid out scenarios and read the row's presence, not its content; the judge's day (2026-11-06) is beyond every walk.
- **Status:** NEW (the checkpoint could not be judged: first judgeable 2026-11-06)
- **Screenshot:** `build/plan/lane-journeys/shots/S4/plan-admin-1280.png`

### V-S4-22 · MISLEADS · Plan: "Take this up" says "You took this up." and forgets on reload
- **Journey and screen:** Journey 22; screen plan
- **Role and width:** administrator, 1280
- **What the user sees:** After "Take this up" the row reads "You took this up."; reloading the plan offers "Take this up" again; my queue shows no new to-do for the checkpoint (it is not yet due, which may be why).
- **What the design says:** registry `itemtakeup` "Take an item up yourself": "routes the item's to-dos to the member".
- **Severity:** MISLEADS
- **Cause:** `plan.mjs:703-716`: `rereads: []` and `done` only sets `view.ui.took`, a per-page state; nothing the plan reads back shows the take-up.
- **Owning module:** plan-work; screens-action
- **How it was missed:** no walk reloaded after taking an item up; the act's own test checks the said-line.
- **Status:** NEW (not traced to the queue; checkpoint not yet due)
- **Screenshot:** `build/plan/lane-journeys/shots/S4/plan-admin-1280.png`

### V-S4-23 · COSMETIC · Plan: the option row omits who it goes to and its tier; "Assumed: not shown yet" is unexplained
- **Journey and screen:** Journey 22 steps 1, 2, 4; screen plan
- **Role and width:** administrator and member, 1280
- **What the user sees:** The options table has OPTION, CATEGORY, LEGAL DEADLINE, MATTER, DISPOSITION: the office the option goes to ("Records officer, City of Walkton Public Works") and the tier "2 · file with caution" I chose appear only on the action later. MATTERS reads "Assumed: not shown yet · a suspected matter: a question concluded in this project, not yet a determination".
- **What the design says:** journey 22 steps 2 and 4; registry purpose "subjects, options, scenarios, what each option became".
- **Severity:** COSMETIC
- **Cause:** `screens-action/plan.mjs` option row (table columns, lines 340-361).
- **Owning module:** action-plans (holds both); screens-action
- **How it was missed:** recorded in C.md (steps 2 and 5) and not taken into a round.
- **Status:** SAME AS walk-T51b-live/C.md Plan steps 2 and 5 (both MINOR)
- **Screenshot:** `build/plan/lane-journeys/shots/S4/plan-admin-1280.png`

### V-S4-24 · COSMETIC · Plan: no assistant tray and no word on whether suggestions are ready
- **Journey and screen:** Journey 22 step 2; screen plan
- **Role and width:** administrator, 1280
- **What the user sees:** No "Ask the assistant for options" door, no tray, and no sentence about suggestions (only the page-wide banner "Parts of its assistant haven't yet passed Civicsmith's tests"). Not run.
- **What the design says:** registry `planask`; journey 22 "with their own Claude account, may also ask".
- **Severity:** COSMETIC
- **Cause:** `plan.mjs:456-457` draws the tray only when `view.reachable` and proposals exist; nothing otherwise.
- **Owning module:** action-plans; screens-action
- **How it was missed:** recorded in C.md step 3.
- **Status:** SAME AS walk-T51b-live/C.md Plan step 3 (MINOR)
- **Screenshot:** `build/plan/lane-journeys/shots/S4/plan-admin-1280.png`

### V-S4-25 · COSMETIC · Plan: "Checks · 3" runs its sentences together, is never explained and stays after the plan is closed
- **Journey and screen:** Journey 22; screen plan
- **Role and width:** administrator, 1280
- **What the user sees:** "Checks · 3" then "Ask the records officer: its checkpoint has nowhere to go when it is judged met  Ask the records officer: its checkpoint has nowhere to go when it is judged not met" in one line, "... has no step for a hostile response (a refusal, obstruction or retaliation)"; the box is still drawn after "Closed: ...".
- **What the design says:** PLAN §2 tests 2 and 4 (unexplained terms; weight and warnings explained where first met).
- **Severity:** COSMETIC
- **Cause:** `screens-action/plan.mjs` (checks list, joined without a break).
- **Owning module:** action-plans; screens-action
- **How it was missed:** the checks appear only with a scenario and an action; E.md read neither after the close.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/plan-closed-admin-1280.png`

### V-S4-26 · COSMETIC · Plan: "Show me how (5)" panel is crowded and its tooltip covers the list
- **Journey and screen:** Journey 22; screen plan
- **Role and width:** administrator, 1280 and 390
- **What the user sees:** At 1280 each of five rows is a bullet plus a button that repeats it ("Comment for the team" / "Start: Comment for the team") packed at the right of the title; at 390 the tooltip "A wizard walks you through this screen step by step ..." covers the first rows. The wizard itself works ("Pick up a plan · step 1 of 4 ... Stopping is fine: nothing is lost, and nobody is told.").
- **What the design says:** visual-language (tooltips do not cover content).
- **Severity:** COSMETIC
- **Cause:** `interface-shell` wizard list.
- **Owning module:** interface-shell
- **How it was missed:** wizard lists were checked for presence.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/plan-showhow-admin-390.png`

### V-S4-27 · COSMETIC · The reason box opens before the form is checked, so a member writes a reason for an act that is then refused
- **Journey and screen:** Journeys 22, 15; screens plan (Add an option), actionnew, matter
- **Role and width:** administrator, 1280
- **What the user sees:** "Add an option", "Start the action", "Record this determination" with nothing filled in all open "Your reason / It is kept with the act, under your name. / Send with this reason" first; only after it comes "Say what the option is first." or "No event with that id is held in the record ...".
- **What the design says:** PLAN §2 test 3; the weight "Asks for a reason".
- **Severity:** COSMETIC
- **Cause:** the shell asks the reason before `send` runs (`interface-shell`).
- **Owning module:** interface-shell
- **How it was missed:** no earlier walk pressed these acts empty.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/plan-admin-1280.png`

### V-S4-28 · MISLEADS · Action: "Propose another law…" with nothing typed does nothing at all
- **Journey and screen:** Journey 22, 7; screen action
- **Role and width:** administrator, 1280
- **What the user sees:** With the citation empty the button gives no sentence and no change (page text identical before and after).
- **What the design says:** PLAN §2 test 3.
- **Severity:** MISLEADS
- **Cause:** `bio-plane/src/screens-action/action.mjs:623-626` returns `null` when no citation is named, which the shell draws as nothing.
- **Owning module:** screens-action
- **How it was missed:** E.md H1 filled the citation first.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/action-admin-1280.png`

### V-S4-29 · MISLEADS · Action: a proposed law can never be chosen when the team's places list no law
- **Journey and screen:** Journey 22 step 4 and journey 7; screen action
- **Role and width:** administrator and member, 1280
- **What the user sees:** After "Propose another law…": "PROPOSED, NOT CHOSEN: state · California Public Records Act, Government Code section 7920.000 / ... not the law it goes under until a member chooses it", but the head still reads "No member has said which law this goes under yet." and no control chooses it.
- **What the design says:** registry `actionlaws` "Change the law it goes under".
- **Severity:** MISLEADS
- **Cause:** `action.mjs:478-484`: `actionlaws` is drawn only when the places offer laws (`offered.length`).
- **Owning module:** actions (law); screens-action
- **How it was missed:** E.md H1.
- **Status:** SAME AS walk-T51b-live/E.md H1 (MAJOR): still open
- **Screenshot:** `build/plan/lane-journeys/shots/S4/action-admin-1280.png`

### V-S4-30 · MISLEADS · Action: raw ids in the risk line
- **Journey and screen:** Journey 22; screen action
- **Role and width:** administrator and member, 1280
- **What the user sees:** "Set by <handle>, October 27, 2026: "the tier option opt-1 of plan PLN-2026-0007-plan states" · was not assessed: no member has stated a risk tier for this action".
- **What the design says:** PLAN §2 test 2 (no raw ids).
- **Severity:** MISLEADS
- **Cause:** the reason text is composed from the option and plan ids when an action is started from a plan (`plan.mjs` start; `actions`).
- **Owning module:** actions; action-plans
- **How it was missed:** E-part2 N1 recorded the same text.
- **Status:** SAME AS walk-T51b-live/E-part2.md N1
- **Screenshot:** `build/plan/lane-journeys/shots/S4/action-admin-1280.png`

### V-S4-31 · COSMETIC · Action: "Show the routes" answers nothing new
- **Journey and screen:** Journey 22; screen action
- **Role and width:** administrator, 1280
- **What the user sees:** Pressing it leaves "No route is known for this matter yet." with no cause and no door to who can choose the places.
- **What the design says:** registry `procedureguides`.
- **Severity:** COSMETIC
- **Cause:** not traced.
- **Owning module:** reading-guides; agent-steps
- **How it was missed:** recorded before.
- **Status:** SAME AS walk-T51b-live/E-part2.md D12 (MINOR)
- **Screenshot:** `build/plan/lane-journeys/shots/S4/action-admin-1280.png`

### V-S4-32 · MISLEADS · Action: "Move it to: resolved" records "the office complied" when nothing was chosen
- **Journey and screen:** Journey 22 step 9; screen action
- **Role and width:** administrator, 1280
- **What the user sees:** Choosing "resolved" and pressing "Move the action" (reason typed, the "How it was resolved (when resolving)" list untouched) made the action read "resolved" and "Resolved: the office complied." The office had only sent an acknowledgement.
- **What the design says:** journey 22 step 9: "Records the outcome, closes the action" (Terminal); "A missed ... is never a finding about the office".
- **Severity:** MISLEADS
- **Cause:** `bio-plane/src/screens-action/action.mjs:510` draws the resolution list with `complied` first and no empty choice, and `:586` sends it whenever `to` is resolved.
- **Owning module:** actions (the resolution is required to be stated); screens-action
- **How it was missed:** E.md K12 chose "denied" on purpose.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/action-admin-1280.png`

### V-S4-33 · MISLEADS · Action: a reply stage cannot be recorded, and the refusal asks for something the form cannot give
- **Journey and screen:** Journey 22 step 6; screen action
- **Role and width:** administrator, 1280
- **What the user sees:** With "Where this reply stands in the request" set to "Acknowledgment": "Every stage after the request names the earlier entry it answers or follows, by its position in the correspondence counted from zero. Give the position of an entry already recorded." The "If it follows" list offers only "Nothing earlier" (no entry is recorded for the request itself). "Not stated" went through.
- **What the design says:** PLAN §2 test 2 (no developer prose); registry `actioncorrespond`.
- **Severity:** MISLEADS
- **Cause:** `action.mjs` (`reply-follows` offers recorded entries only); the plane's rule wants position 0 to be the request.
- **Owning module:** action-replies; screens-action
- **How it was missed:** E.md recorded replies without a stage.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/action-admin-1280.png`

### V-S4-34 · MISLEADS · Action: a silence dated three weeks ahead is accepted, and replies are listed in the order recorded
- **Journey and screen:** Journey 22 step 6; screen action
- **Role and width:** administrator, 1280
- **What the user sees:** "No reply came by the date" dated November 17, 2026 (today October 27) was recorded: "November 17, 2026 / no response / What the reply said: No reply came by the date", while the date due, November 16, still reads "pending". The reply of October 27 is listed after it.
- **What the design says:** registry `actioncorrespond`: "Record a silence with its date, so the record says no reply came and when."
- **Severity:** MISLEADS
- **Cause:** not traced.
- **Owning module:** action-replies
- **How it was missed:** E.md recorded no silence.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/action-admin-1280.png`

### V-S4-35 · MISLEADS · Start an action: the office typed under "A named office or public body" is kept as an audience, and the action never names it
- **Journey and screen:** Journey 22 step 5; screens actionnew, action
- **Role and width:** administrator, 1280
- **What the user sees:** Kind "Request for comment", "Who it goes to: A named office or public body", "Who": Public Works Director. The new action reads "Request for comment · planned" and "Waiting on the office's reply"; "Public Works Director" appears nowhere on the page.
- **What the design says:** registry `actionnew`: "who it goes to (named, or undetermined with the reason)".
- **Severity:** MISLEADS
- **Cause:** `bio-plane/src/screens-action/actionnew.mjs:140-141` stores the typed words as `state: "audience"`, and `action.mjs` (head, `:196-221`) draws only an office addressee.
- **Owning module:** actions (addressee); screens-action
- **How it was missed:** E.md K-N7 started actions from the plan, which carries an addressee.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/actionnew-admin-1280.png`

### V-S4-36 · MISLEADS · Start an action: "Choose the office" is hidden until a question is picked below it, and answers nothing when none is found
- **Journey and screen:** Journey 22 step 5; screen actionnew
- **Role and width:** administrator, 1280
- **What the user sees:** The door appears only after "Point at what this rests on or advances" (a section lower down) is set; pressed, it shows no office list and no sentence.
- **What the design says:** registry `addresseesuggest` "Choose the office".
- **Severity:** MISLEADS
- **Cause:** `actionnew.mjs:77` draws it only when a rests-on choice exists; `:78` draws the office list only when offices came back and has no empty sentence (`done` at `:117-122`).
- **Owning module:** actions; screens-action
- **How it was missed:** E.md H1b walked the Request screen, which does say "No office is known to hold such records yet."
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/actionnew-admin-1280.png`

### V-S4-37 · COSMETIC · Start an action: developer words in the refusals
- **Journey and screen:** Journey 22 step 5; screen actionnew
- **Role and width:** administrator, 1280
- **What the user sees:** A due date with no basis: "Each deadline on an action carries a short label, a description, a date written year-month-day, the statute, order or commitment the date comes from, and a status: pending, met, overdue or waived. An entry in this write lacked one of those or held one in another form, so nothing was written." Empty: "An action says who it is addressed to: an office by its official role and the body it belongs to; a reporter, an organization or another team by a role and the organization; ..."
- **What the design says:** brand-and-voice.
- **Severity:** COSMETIC
- **Cause:** `actionnew.mjs:134-151` returns the codes `COUNTERPARTY_REFUSED` and `CLOCK_REFUSED`, drawn with the plane's sentences.
- **Owning module:** action-grammar; setup-words
- **How it was missed:** the sentences are the plane's own and were never read as a member would.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/actionnew-admin-1280.png`

### V-S4-38 · BLOCKS · Matter: no determination, no decline and no escalation can be reached
- **Journey and screen:** Journey 22 steps 4 and 8; screen matter
- **Role and width:** administrator and member, 1280 and 390
- **What the user sees:** "No determination yet"; "NOT AVAILABLE YET: Open an escalation / Needs a recorded determination that the act did not comply." The determination form needs "The event it was part of" and says "This project has no dated event yet. Record the act on the project's Timeline, with its date, then choose it here."; empty it answers "No event with that id is held in the record, so nothing can be said about it ...". "Decline to escalate, with a reason" is nowhere. I did not re-walk the Timeline.
- **What the design says:** registry `matter` acts `determine`, `declinetoescalate`, `escalationopen`; journey 22 steps 4 and 8.
- **Severity:** BLOCKS
- **Cause:** `bio-plane/src/screens-action/matter.mjs:538` draws `escalationopen` and `declinetoescalate` only when a noncompliant determination exists (`P.ctx(view).nc.length`), else the "Not available yet" list; `:231-232` the event choice is empty when the project holds no dated event, and the Timeline has no way to date one (E-part2 B1).
- **Owning module:** escalation; events (dating); op-declarations
- **How it was missed:** E-part2 B1 recorded it as a BLOCKER; not re-walked here beyond the screen's own statement.
- **Status:** SAME AS walk-T51b-live/E-part2.md B1, D1 and D6 (not re-walked in full)
- **Screenshot:** `build/plan/lane-journeys/shots/S4/matter-admin-1280.png`

### V-S4-39 · COSMETIC · Matter: duplicate offices in "Office or body"; "Matter" is the only heading
- **Journey and screen:** Journey 22 step 4; screen matter
- **Role and width:** administrator, 1280
- **What the user sees:** "City of Walkton, Clerk's records desk" twice, "City of Rewalk nodates, Records desk" twice, "City of Rewalk full" twice, in a list of 14 from other walkers' work; the page title is the single word "Matter" and the "Published findings" list names seven findings of other projects.
- **What the design says:** registry `matter`: "One government act".
- **Severity:** COSMETIC
- **Cause:** `matter.mjs` lists the team's offices without collapsing equal lines.
- **Owning module:** entities; screens-action
- **How it was missed:** fixtures hold one office each.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/matter-admin-1280.png`

### V-S4-40 · COSMETIC · Keyboard: headings take Tab stops at 390 and on the public page; focus tooltips cover content; "Stop sharing" is twice the same name
- **Journey and screen:** every screen; keyboard
- **Role and width:** all roles, 390 and 1280
- **What the user sees:** At 390 the 8th to 14th Tab stops include `h1` and `h2` (headings); on the published page the first stops are `h1` and `h2` at every width. Focus is visible everywhere (outline). Keyboard focus raises a tooltip that covers neighbouring text (plan, action, published at 390). At 1280 the first 14 stops are the page shell; no skip link was found (the first stop is the "Civicsmith" label).
- **What the design says:** PLAN §2 test 8.
- **Severity:** COSMETIC
- **Cause:** not traced (`interface-shell` sets `tabindex=0` on headings).
- **Owning module:** interface-shell
- **How it was missed:** the browser pass measured tab order on a few screens only.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/plan-admin-390.png`

### V-S4-41 · COSMETIC · Times over the 2 s bar on this shared copy
- **Journey and screen:** all screens
- **Role and width:** all, 1280
- **What the user sees:** First drawn (settled, no loading marks), one run each, other walkers acting: plan 2.9 to 5.6 s, case editor 1.7 to 11.8 s, ceremony 3.1 to 8.8 s, review copy 2.1 to 3.4 s, published 1.4 to 5.8 s, docket 1.4 to 11.2 s (admin, 390), imported 0.9 to 10.0 s, action 2.4 to 3.0 s; actionnew 0.8 s, matter 0.9 to 2.9 s, docket-public 0.7 to 3.5 s. Acts: 0.5 to 3 s; "Check the signature" about 6 s; "Ask for the confirmation again" about 5.9 s. `Server-Timing` on the document is `page;dur=0`; the API entries (`isolate`, `object-age`, `rows-queue`, `bytes`) are ages and sizes, not durations.
- **What the design says:** K4354: drawn or answered within 2 s.
- **Severity:** COSMETIC
- **Cause:** shared Worker, many walkers; not traced.
- **Owning module:** control-plane; plane
- **How it was missed:** timing was not a test with a budget on a shared copy.
- **Status:** NEW

### V-S4-42 · COSMETIC · Console errors on normal acts
- **Journey and screen:** journeys 15, 21; screens ceremony, case-editor, review-outside
- **Role and width:** administrator, signed out, 1280
- **What the user sees:** "Failed to load resource: ... 403" on the first `caseratify` (the step-up for the password, then it succeeds); 404 on `statementack` (V-S4-6); 404 on `reviewcopy` for a revoked link (the page itself is drawn well).
- **What the design says:** PLAN §2 test 7 (no console error on a normal load).
- **Severity:** COSMETIC
- **Cause:** the step-up answers 403 before the password prompt.
- **Owning module:** interface-shell; review
- **How it was missed:** walkers filter 4xx the app handles.
- **Status:** NEW

### V-S4-43 · MISLEADS · Published case: no group name at the head and no "Made with Civicsmith" at the foot; the tab says "Your team"
- **Journey and screen:** Journey 26 step 1; screens published, docket-public, review-outside
- **Role and width:** signed out, 1280 and 390
- **What the user sees:** The page opens on the banner "Test Civicsmith ..." and then the case's own heading; the group appears once, mid-page, in "This case is the work of Alpha walk team." Nothing at the foot (it ends on "Check it"). The browser tab reads "Published case · Your team", and "A case's docket, from outside · Your team" and "A review copy, from outside · Your team" for the other two outside pages.
- **What the design says:** journey 26 step 1: "Opens the public page: the group's name at the head, 'Made with Civicsmith' at the foot."; DEC-276 credit line.
- **Severity:** MISLEADS
- **Cause:** `bio-plane/src/screens-publish/published.mjs:30-31` reads the group's name but uses it only in the explanation sentence at `:82`; no head and no credit are drawn; the page title's group part is the placeholder "Your team" for a signed-out reader (the `groupidentity` read is not shown to them).
- **Owning module:** public-read (identity for the signed-out reader); screens-publish
- **How it was missed:** D.md read the public page for words and hashes; the head and foot of journey 26 step 1 were never asserted.
- **Status:** NEW
- **Screenshot:** `build/plan/lane-journeys/shots/S4/published-anon-1280.png`

