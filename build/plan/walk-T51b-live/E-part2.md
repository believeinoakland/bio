# Live walk of 0.87.0, area E (taking action): walker E, part 2

> Part 2 of `E.md` (split, mechanics §17, K5353), moved whole and unchanged.

## Widths, roles and times (every E screen)

Each screen below was opened signed in as administrator and as member, at 1280 and at 390 px (plan, action, start and send, due date, matter, standard, the standard's own page, timeline, request (project and action), counsel, new action, case editor, ceremony, question, project, Home, Queue, Action dashboard, watched addresses, assistant, proceeding, More). Result for every one of the 23 screens x 4 cells: no sideways scroll (scroll width equals the window width), no control past the window edge, no `[object Object]`, no "undefined". The words a member would see as raw ids: `ENT-2026-0005` on plan and matter (every cell), `opt-1` on the action's risk line (every cell). Wall time to a drawn screen (press or address to the frame, proxy and headless browser included, four other walkers acting): median about 2.4 s, range 1.1 to 6.5 s (slowest: Home as administrator at 390 6.5 s on a first load, case editor 5.5 s at 1280, the Action dashboard 5.3 s as member at 390; `/app/more` never sets the frame mark, so my wait ran its 15 s limit: 15.8 to 17.2 s in the table is the wait, not the screen). Server-Timing, the longest single answer per screen: 0.24 to 1.5 s except `groupidentity` 2875 ms (request screen as administrator, 1280), `reading` 4186 ms and `content` 3494 ms (standard and timeline pages, first load) and the 12.4 s stall at 06:40:34Z on the standard page (row C2c). Acts: 0.7 to 3.4 s wall to the result (the reason step included), server 140 to 1349 ms; over the 2 s bar on Server-Timing: `allocid` 2588 ms (open a question), `optionadd` 2042 ms, `determine` 2628 ms (compliant determination), `caseratify` 3057 ms (publish), `groupidentity` 2875 ms. None of these is over 5 s except the stall. Shots: shots/E/<screen>-<width>-<ROLE>.png for each cell.

## Re-walk 11's open rows (area E), at my own case

Row | verdict | quoted
adoption row (a standard's adoption by day or event) | **FIXED** (by day; by event not walked, the list of acts offers only the team's standards and laws, no Timeline event) | "Adopted by City of Walkton in Walkton Municipal Code, section 12.4, edition 2026 / Written into the act by reference · in force from February 1, 2026 · recorded by sparky, October 27, 2026" (the form now has "The day"; the refusal "A field of this act ... is not in the form it takes" did not occur)
E-AP2/N2 plan date checks (the team's zone, K5343) | **FIXED** for the plan's dates | "Complain to the state oversight office's regulated date November 10, 2026 falls before phase Complain can start (November 25, 2026)" (computed on the team's day; the old "no time zone is held for your team ... not compared with the UTC day" is gone). The events' dates stay a **known gap** (row C2a)
E-C2a against the issuer | **NOT FIXED, BLOCKER** | "whether Walkton Roof Order Rule 087, section 2 binds City of Walkton is undetermined (the act's event is placed nowhere (placed nowhere: no attestation of this event is dated)), and an act is found noncompliant only against a standard that binds its body: settle it on the standard's page first. Nothing was written." with the adoption, the imposition and the in-force-through day all recorded
N1 (undated office sentence) | **FIXED** | "An office named without both a Since and an Until date is recorded, but it is offered as an addressee only once both are stated."
H1(b) | **FIXED** | "THE OFFICE / The office that holds the records / City of Live full, Records desk, Rewalk10 E Walkton Records Board"
N7 | **FIXED** | "A request for comment must name the specific questions it puts to the subject: add each one under 'Advances' ..."
R56-5 / plan words | **FIXED** | "Ask the office: its checkpoint has nowhere to go when it is judged met" (no `not_met`, no `opt-1`, no "UTC day")
E-K4 | **FIXED** | "State the outlet and the person's role there." / "State the person's role at the outlet." / "State the outlet."
R56-10 | **FIXED** | "A member states the tier first." and the door "State its risk"
N8 | **FIXED** | compliant page: "A compliant outcome is recorded with the same care ... ESCALATION / NOT AVAILABLE YET / Open an escalation / Needs a recorded determination that the act did not comply."
N5 | **FIXED** | the Matter's "Office or body" lists "City of Walkton" (the issuer)
R59 | **FIXED** | "No member has said which law this goes under yet. / Your team's places list no law for this kind of action. Name the law yourself: its level and its citation." and "PROPOSED, NOT CHOSEN: state · California Public Records Act, Government Code section 7920.000" (but see H1: no way to choose it)
R62 timeline hint | **FIXED** | events read "placed nowhere: no attestation you can see dates this event, so none governs its time"; the old "your team has not chosen the places whose rules apply" is gone
N-a (raw body id after a determination) | **NOT FIXED, MINOR** | Matter "order · by Records officer, ENT-2026-0005"; plan "Its reference / Records officer, ENT-2026-0005 · Walkton Roof Order Rule 087, section 2"
N-b (reason nested twice) | **NOT FIXED, MINOR** | "(the act's event is placed nowhere (placed nowhere: no attestation of this event is dated))"
N-d (plan check with a zone set) | **FIXED** | see E-AP2/N2
N3 (`screen.request.office.nobody`) | **known gap, not walkable** | the team holds bodies
Earlier alpha findings met again: K10 tier not carried **FIXED** (Tier 2 carried to the action; "Tier 2 · file with caution / Set by sparky ... 'the tier option opt-1 of plan PLN-2026-0004-plan states'"); H3 fee quote not shown back **FIXED**; H1 a saved office not offered again / duplicates **not re-walked** (I named a different office each time); K12 action "Waiting on ... reply" after resolved **FIXED**; H2 "Work out the due date ... box below" **FIXED**; C12 raw "##" in the counsel packet **NOT FIXED**; S3 cite list blank **NOT FIXED**; W3 not re-walked.
Re-walk 11 rows walked: 17 (N1, H1b, N7, R56-5, E-K4, R56-10, N8, N5, R59, R62, adoption, E-AP2/N2, E-C2a, N-a, N-b, N-d, N3); FIXED 12, NOT FIXED 3 (E-C2a, N-a, N-b), known gap 2 (events' dates, N3).

## Dead-end census (K4164)

Each line: screen, what, quoted, severity.
D1 | Matter, "Record this determination", Noncompliant | the refusal sends the member to "the standard's page first", where nothing dates an event; the Timeline offers no field to date an event ("Record a dated fact" has no event), so the member goes round the three screens and ends where they began | BLOCKER
D2 | Publish screen for a second edition | shows only "Published: edition 1 / Open the public page" | BLOCKER
D3 | Action page, "THE LAW IT GOES UNDER" | "PROPOSED, NOT CHOSEN ... not the law it goes under until a member chooses it": no control chooses it (administrator or member) | MAJOR
D4 | Request screen of a started request | the heading "THE LAW IT GOES UNDER" has nothing under it | MAJOR
D5 | Brief counsel | "Assemble the packet, with a reason" answers 200 and draws no packet, version, link or export | MAJOR
D6 | Matter | no "decline to escalate, saying why not now" (UC-154) | MAJOR
D7 | Start and send, breach preview | "Name the determination it rests on" with no control to name one; "proceed anyway" cannot name a ground | MAJOR (see K-breach)
D8 | Case editor, "Acknowledge what it leaves out" | draws the review-copy sentence "There is no review copy here for you to read. Ask the owner of the project for a new review link ..." to the owner (404 NO_REVIEW_COPY) | MAJOR
D9 | Standard page | the `timeline` read fails (502 STORE_DID_NOT_ANSWER) on every load and the page does not say so | MAJOR
D10 | Keep this filing as a template | answers 200, shows nothing | MINOR
D11 | Action dashboard | "WHOSE MOVE", "NEXT" blank on every row; "THE CLOCK" blank where a due date exists | MINOR
D12 | Action, "Show the routes" | "No route is known for this matter yet." with no cause and no door to who can choose the places | MINOR
D13 | Plan, "Plan what to do" for a matter already in a plan | "which is named" and no plan is named | MINOR
D14 | Question page of a published finding | nothing says a published case carries it | MINOR
D15 | Plan | no tray or sentence about the assistant's suggestions | MINOR
D16 | Find in this ("Dates and deadlines") | "2 documents could not be read for this, so “nothing” is not said for them." without which or why | MINOR
D17 | Standard page, document pickers | 217 documents, oldest first, no project filter (typing narrows) | MINOR
Words a member would not understand (quoted): "the generic reader found no entities in this document's docx text-layer text (tier 1); recorded as an empty reading, never an emptied document" (document page, MAJOR); "recorded 2026-10-27T05:54:58Z for resolution through the task list" (document page, MINOR); "The jurisdiction profile holds no file template for this kind: name a template, or write the words." (Start and send, MINOR); "Kind of copy not known" (standard page, MINOR); "Assumed: not shown yet" (plan, MINOR); "Record a success" / "Choose" (Matter foot, MINOR); "the tier option opt-1 of plan PLN-2026-0004-plan states" (action risk line, MINOR); "arrived with reply 1" (pressure line, MINOR); "When no day is recorded" (over a recorded adoption, MINOR).


## Findings, sorted

BLOCKER
- B1 C2a: Matter > "Record this determination" > Noncompliant is refused for every body and every event ("... binds City of Walkton is undetermined (the act's event is placed nowhere (placed nowhere: no attestation of this event is dated)) ... Nothing was written.") even with the adoption, the imposition and the in-force-through day recorded; Timeline has no way to date an event ("Record a dated fact" names no event; the dated fact sits in "DATED IN THE DOCUMENTS" beside events listed "UNDATED / placed nowhere"). Journey (c) cannot pass its step 3 (no consequences, escalation, breach action, advance, end). 06:20 to 06:45Z, 1280, admin.
- B2 (i)3: after "Reopen this finding" and a new conclusion and "Prepare a case from this", the Publish screen (`/app/ceremony/<project>`) shows only "Which draft ... Published: edition 1 / Open the public page", at both widths: no bias box, ties or signing, so a second edition cannot be published. 06:50Z.

MAJOR
- M1 Brief counsel (`/app/counsel/ACTN-2026-0010`): "Assemble the packet, with a reason" makes a packet (CPK-2026-0002, version 3, 6.7 KB on the wire) and the screen shows no packet, no version, no export or link; only the fixed marking line and the raw heading "## What Would Falsify This".
- M2 Question page, re-concluding after a reopen: a newly written reading is dropped and the first reading's words are shown ("... as the order in the first file and the budget line in the second show.") with only "What would change it" new.
- M3 Action page, "THE LAW IT GOES UNDER": "PROPOSED, NOT CHOSEN ... until a member chooses it" has no control to choose it (administrator or member); the Request screen of a started request draws the same heading with nothing under it.
- M4 Standard page: the `timeline` read answers 502 `STORE_DID_NOT_ANSWER` on every load, both roles and widths, and the page does not say so; first load at 06:40:20Z took about 14 s (ten reads each 12.4 s on Server-Timing).
- M5 Case editor, "Acknowledge what it leaves out": answers 404 `NO_REVIEW_COPY` and draws "There is no review copy here for you to read. Ask the owner of the project for a new review link, or join the project ..." to the project's owner.
- M6 Start and send, breach path: "Name the determination it rests on" (no control) and "Acting before a determination needs one of two grounds: a legal deadline would pass first ..." refused after a reason that states a legal deadline; no place to name the ground.
- M7 Matter: no "decline to escalate, saying why not now" door (UC-154, (c)6).
- M8 Document page words: "the generic reader found no entities in this document's docx text-layer text (tier 1); recorded as an empty reading, never an emptied document".

MINOR
- N1 Matter/plan show the body as a raw id: "by Records officer, ENT-2026-0005" (re-walk 11 N-a, not fixed); action risk line "the tier option opt-1 of plan PLN-2026-0004-plan states".
- N2 Refusal nests its reason twice: "(the act's event is placed nowhere (placed nowhere: ...))" (re-walk 11 N-b).
- N3 Document page: "Cite in which question" left on "Choose a question" despite its help text; "recorded 2026-10-27T05:54:58Z for resolution through the task list".
- N4 Plan: checks repeat per scenario ("Checks · 9" for two scenarios, scenario not named); closed plan keeps its checks; "Assumed: not shown yet"; no word about suggestions; the options' sort buttons are not announced.
- N5 Plan: tier select not cleared after an add (led to "A tier belongs only on a legal option").
- N6 Action: a silence accepted for a reply not yet due, its stage dropped silently; head "Waiting on ... reply" after a Denial; reply pressure choice repeated under every reply; "arrived with reply 1".
- N7 Action dashboard blank "WHOSE MOVE", "NEXT", sometimes "THE CLOCK"; "Show the routes" without a cause; "Keep as a template" shows nothing; "The action started ·" with nothing after the dot.
- N8 Request: "Fill in The body that holds it first"; the body list offers only one court-like body; the second-plan refusal says "which is named" and names none.
- N9 Standard page: "Kind of copy not known", "When no day is recorded" over a recorded adoption, 217 documents in each picker with no project filter; two offices with one name make binding and benchmark rows look contradictory.
- N10 Matter: "WHERE THIS MATTER STANDS / Choose / Record a determination / Record a success" unexplained; "Find in this" (dates) "2 documents could not be read for this" without which or why; counsel "##".
- N11 Question page of a published finding says nothing of the published case; "Unrated" twice without a label; Held captures per project reachable only from the project page.
- N12 Server-Timing over the 2 s bar (under 5 s) on `allocid` 2588 ms, `optionadd` 2042 ms, `determine` 2628 ms, `caseratify` 3057 ms, `groupidentity` 2875 ms (others acting).

Journeys completed of journeys walked: 2 of 4 ((h) records request round trip completed with findings; (k) steps 7 to 12 completed except step 8, which cannot be judged before November 3, 2026 ("You can judge this checkpoint from November 3, 2026."); (c) acting on a finding blocked at step 3 (B1); (i) a source changes after a case is published: step 1 not producible, step 3 blocked (B2)). (e): its screen says plainly the assistant is not ready.
