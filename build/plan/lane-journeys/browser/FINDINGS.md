# JOURNEYS browser findings (JOURNEYS #2)

**Status** · Walk of biosmoke8 (release 0.85.0, fix round 6) in Chromium (`HOME=/opt/walk-home`, `--no-proxy-server`) on 2026-10-16, as administrator (`sparky`) and member (`walker`), at 1280 and 390 wide, plus dark mode at 1280. Entries `B-<n>`, in the form `PLAN.md` §6 sets. Evidence is in `shots/` (small PNGs; the shots named below). Nothing was changed in product code. My own work on the instance: project "JOURNEYS browser: do pothole repairs finish on time?" (question, a text file, a photo, an address capture, a person, a money trail, a case draft, a timeline event, two doorbell knocks). JOURNEYS #1's files were read, not edited.

**What passes** (so BOB sees it is not all red): no screen scrolls sideways at 390 (every page crawled, about 80 addresses); dark mode is sound on Home, Project, Settings, Question; keyboard focus is visible and the order is sensible; theme choice (light, dark, follow device) persists across reload; sign-in (wrong password kind, deep link returns after sign-in), sign-out, the doorbell (empty and filled, both widths), forgot, reset, join and setup states for a stranger all read plainly; a member sees only the "Yours" settings, one project, hides the unjoined project's work ("Nothing is here") and gets a kind "Join" refusal on its page; capture from an address, a file and a photograph each land under the question with a link to the document; the Timeline draws its two lanes and keeps undated events apart; a money trail starts; a case draft prepares.

## Blockers (a journey cannot be finished from the screens)

### B-1 · Most investigation screens have no door · BLOCKS journeys 11, 12, 14, 15, 21, 22 · NEW
Admin, 1280. From the project page, question page, document page, person page, People, Find, Queue, More and Settings there is no link to Timeline, Money trail, Proceeding, Request records, Case (draft), Review copy, Publish, Docket, Calculation, Plan, Matter, Action or the two dashboards. They open only by typing an address with a project in it (`/app/timeline/<project>`, `/money/`, `/proceeding/`, `/request/`, `/case-editor/`, `/review-copy/` all drew); `calculation`, `plan`, `matter`, `docket`, `dash-action`, `dash-project`, `archive`, `theme` drew "Nothing is here" for every address I tried. The wizard "Your first question" walks onto subject-less addresses and draws "Nothing is here" beside its own step (B-13). Design: registry's 69 screens and the journeys' step lists; the project is "a project's home: objective, bar, questions, stage, plans…". Owner: screens-inquiry (project, question) and interface-shell (rail, doors). Shots: `adm-explore-p-1280`, `journey6-project-new-1280`.

### B-2 · A review copy cannot be shared: it asks for a time zone that cannot be set · BLOCKS journey 21 · NEW
Admin, `/app/review-copy/<project>`. "Share for review" answers: "Set your group's time zone first: a review link's end date is counted in it. Then share." No screen has a time-zone setting (Your group, Who your group is, Places and offices, Account: none mention one). A dead end with a false next step. Owner: screens-publish with screens-settings. Shot: `journey21-review-shared-1280`.

### B-3 · Request records: "Choose the office" does nothing, and nothing says how to get an office · BLOCKS journey 7 (records request) · NEW
Admin, `/app/request/<project>`. "No office is known to hold such records yet." Choose the office draws nothing new; "Start the request" answers "Choose the office first." Settings › Places and offices does offer "Add an office yourself", but the request screen never points there. Owner: screens-action (request). Shot: `journey7-request-office-1280`.

### B-4 · A question cannot be concluded by hand, and the screen promises it can · BLOCKS journey 15 · STILL (J-3; draft-T49-walk D8)
Admin, question page. It says: "Nothing to conclude on yet: a conclusion adopts a reading, the assistant's accepted or one you write yourself", then offers only "Narrow the question". There is no form to write a reading, so no hand investigation reaches a finding, and the ceremony (B-5) can never be satisfied. K3544's reading (Bob's K1755; T50 asks UX-DESIGN) stands; this entry only records that the sentence on the screen is untrue today. Shot: `adm-question-1280`.

## Misleads

### B-5 · The publication ceremony draws the developer's gate text · MISLEADS · NEW (J-7 seen in the browser)
Admin, `/app/ceremony/<project>%2F<draft>`. Heading: "Publish a case this draft does not name and publication DERIVES, so which case it is stays UNDETERMINED here: …" (a paragraph). "Before publishing / These stop the signing until they are put right:" then "a published case is a CONTAINER over ONE OR MORE FINDINGS, scoped to the question that brought them together: pass targets=[<inquiry id>, ...]. One finding is legal and is the degenerate case (DEC-44); what is not legal is publishing nothing." Design: plain words, no check codes or ids (brand-and-voice; K3052). Owner: screens-publish with case-checker. Shot: `journey15-ceremony-1280`.

### B-6 · The case draft is named by a paragraph of developer prose · MISLEADS · NEW
Admin, case editor after "Prepare the draft". The draft's own title, its list entry and the ceremony heading are all "a case this draft does not name and publication DERIVES, so which case it is stays UNDETERMINED here: the draft names no case and does not ask for a new one, …". Also "prepared by admin" (the founder is `sparky`) and "Internally checked not yet evaluated / Externally compliant not met / Distributed not yet evaluated" (terms never explained). Owner: screens-publish. Shot: `journey15-case-draft-1280`.

### B-7 · Citing from a document defaults to the first question in the group, not the document's own · MISLEADS · NEW
Admin, document page. "In which question" is a list of every question the group holds across all projects, including other lanes' and duplicated wordings, and preselects the first (`INQ-…-0001`, WALK-085's), not the one the document was captured for. Pressing "Cite a passage" without changing it cites into another project's question. Same list, no preselection of the project's own, in Find in's "For which question" (ok there: "None yet") and Money's "Beside which question" (also offers "What time does the library now open?"). Owner: screens-daily (document). Shot: `adm-doc-text-1280`.

### B-8 · Vouching a copy shows no acknowledgement and no state · MISLEADS · NEW (D13 works, its screen is silent)
Admin, document page. After "Vouch for this copy" nothing on the page changes: the two boxes keep the typed words (shot `journey15-vouch-result-1280`), the button stays, no "vouched by …" line appears, and the page after reload shows nothing either. The only sign is that the file has left Held captures. Citing a passage likewise only adds a row under "What cites it", with the role not shown. Design: every act acknowledges at once and shows its result (PLAN §2.3). Owner: screens-daily (document).

### B-9 · Find's results are raw records · MISLEADS · STILL (walk-085 F4)
Admin, Find, "pothole" → 12 results, for a question, a project: `INQ-2026-0001-how-many-[pothole]-reports… id … object_type inquiry schema inquiry@1 title … current_state open prior_state created 2026-10-15T23:46:50Z last_updated … project PROJ-2026-5304-walk…`. Documents found by words ("420") are listed as "Found by search" with no passage and no reason (J-4 is otherwise FIXED: the word now finds the note). Owner: content-search/screens-daily (finder). Shot: `journey7-finder-pothole-1280`.

### B-10 · Your ties still draws `{handle}` and `{tie}` · MISLEADS · STILL (walk-085 F5)
Admin and member, `/app/ties`, both widths: raw placeholders `{handle}`, `{tie}`, `{tie}` in the page's sentences. Owner: screens-investigate (ties). Shot: `adm-ties-1280`.

### B-11 · Garbled sentences · MISLEADS · STILL (F6) and NEW
- Group › hosting account: "Recorded by set at setup on 15 October 2026: Bob Krause" (F6 STILL), shown to a member too. `adm-group-1280`, `mem-m-group-1280`.
- Group › stake: "None stated beyond the group's".
- Project page: "started Findable: every member of the group sees it in Projects and can ask to join., 16 October 2026". `journey6-project-new-1280`.
- Question page: "Your answer fails if any one of these fails:· note.txtRead it back: …" (no space, stray dot).
- Document (photo): "Pages 0 are pictures of text that Civicsmith's own reading couldn't make out" with a page picker "0" (a PNG is not paged). `adm-doc-png-1280`.
- Member Members page: "The group's founder … who hasn't chosen a handle yet" while Home and the member's own project list name the founder `sparky`. `mem-m-members-1280`.
- Home counts "3 members"; Members says "Active members: 4" (F3 STILL).

### B-12 · A captured web page has no title: "Undetermined, because" · MISLEADS · NEW (D14–D16 in part)
Admin, document `example.com`: the heading is "Undetermined, because" (a cut-off sentence); the queue and Home name the same item "A document with no title, captured 16 October 2026". The page's own title ("Example Domain") is not read. `adm-doc-web-1280`, `journey19-queue-1280`.

### B-13 · Starting a wizard walks onto "Nothing is here" · MISLEADS · NEW
Admin, Home › "A problem I live with" › "Your first question": the dock opens with step 1, and the page beside it reads "Nothing is here: This address doesn't lead to anything in your group's Civicsmith" (address `/app/project`). Steps 2, 4 and 5 add "This step's control is not on this screen for you just now: you may not do it here, or the screen is in another state", and the pages for steps 4 and 5 (`/app/document`, `/app/question` with no subject) are the same blank. A new member's first guided walk never shows the screen it describes. Owner: screens-wizards with interface-shell. Shot: `journey6-firstq-1280`.

### B-14 · An unknown address outside `/app` still draws raw JSON · MISLEADS · STILL (J-1; walk-085 F8)
Signed out or in, `/nonexistent-walk`, `/doorbell`, `/tour`: a white page of `{"ok":false,"error":"unknown op","reason":"UNKNOWN_OP","code":"UNKNOWN_OP","check":"C-69.1",…}` with a console 400. `/app/<unknown>` is fine when signed in ("Nothing is here" with a way back), and draws the group's front page, with no word of why, when signed out. People type `/doorbell` and `/tour`, so these two matter most. Owner: admission or control-plane. Shot: `pub-unknown-root-1280`.

### B-15 · Queue items: "Act on an item" is opaque and silent · MISLEADS · STILL (D21)
Admin, Queue and Home: the To do item "A document with no title, captured 16 October 2026" offers "Act on an item" and "Open". "Act on an item" removes the item with no word of what was done, and does not open the document (the item is a filing approval). "Open" goes to the document. Owner: screens-daily (queue). Shot: `journey19-queue-1280`.

### B-16 · Forms ask the member to type a document's fingerprint, which no page shows in full · MISLEADS · NEW
Timeline ("The document: the document's fingerprint, as its page shows it"), Money ("The document", "The contract … (a record id)"), Person ("The document it is read from") and Standard ("Its words (the passage's content ids, separated by commas)"). The Document page shows only "a8cc…9d64", and typing that is refused ("Name the passage: the document's fingerprint, and its page."); the full 64 characters work (Timeline then draws the event). Upload documents leak the full hash in their subtitle (B-17) but web captures do not. Design: the member chooses a document; the program holds its identity. Owner: screens-investigate. Shots: `journey11-timeline-full-1280`, `adm-standard-p-1280`.

### B-17 · Raw ids and times in the words · MISLEADS/COSMETIC · STILL (D11, walk-085 D-series, in part)
- Home and Queue, security notice: "has been High since 2026-10-16T16:00:00Z". `admin-home-1280`.
- Document subtitle: "Captured 16 October 2026 · upload:a8ccb4d10b60…9d64" (full hash). `adm-doc-text-1280`.
- Held captures: `Project: PROJ-2026-5304-walk-085-project`, `From upload:5bd6c06f…`, `knock:KNOCK-…` on every row, to member and administrator. `adm-held-1280`.
- Breadcrumbs and subtitles with a project id: Standard (`Projects › PROJ-2026-8083-… › Standard`), Explore ("From PROJ-…"), Publish, Docket, and a member's Timeline of a project they have not joined. `adm-explore-p-1280`, `mem-m-timeline-1280`.
- Project page: "Not load-bearing: INFO-2026-0011-note-txt". `adm-project-dark-1280`.
- Inbox: each knock headed `KNOCK-2026-10-16-ea2f2cb0`, "237 B". `journey20-inbox-1280`.

### B-18 · A member is offered a form they cannot use · MISLEADS · NEW (D32 closed, a sibling open)
Member, `/app/timeline/<project>` of a project they have not joined: the full "Add to the timeline" form is drawn under the sentence "you are not one of its participants, so you cannot do that in it or see what is inside it". The project page itself is right ("Join"). Hidden, not refused, is the design (PLAN §2.6). `mem-m-timeline-1280`.

## Cosmetic and accessibility

### B-19 · The page title never changes · COSMETIC · NEW
Signed out every page's `<title>` is empty; signed in it is "Believe In Oakland" on every screen, so tabs, history and screen-reader announcements cannot tell the screens apart.

### B-20 · The project page leads with its bar, and tooltips cover content · COSMETIC · STILL (walk-085)
Project page order: stage, the bar's two selects and its button, then the first question. A tooltip that opens on the button's focus after a click covers the next section ("Your first question", the "Attest" and "Watch for changes" buttons on the Document page, the home area tiles in dark mode). `journey6-project-new-1280`, `journey15-vouch-result-1280`.

### B-21 · Person page: an empty graph and a button to itself · COSMETIC · NEW
A newly added person's page leads with a 500 px empty graph box holding one node, "Open the person" sits on the person's own page, the legend reads "the step's grade" with no graph. Facts come below. `journey10-person-new-1280`.

### B-22 · Layout at 390 and touch targets · COSMETIC · NEW
No sideways scroll anywhere. But: the group's name is cut to "Believe In Oa…"; the Members page's column header row (HANDLE COVER ROLE MAY DO STATUS EXPERTISE) sits above cards that are stacked; many controls are under 24 px (counts: Members 29, Your group 32, Wizards 23, Security 21, Held 14, Elsewhere 14). `adm-members-390`, `adm-group-390`.

### B-23 · Small accessible-name and control gaps · COSMETIC · D31 FIXED, others new
D31 (closed doors' buttons) FIXED: they are not in the accessibility tree until a door opens, and then read. Still unnamed: Projects page's search box, its filter and its button (3 controls, both roles). Group name "Save the name" with the name unchanged does nothing visible (no acknowledgement, no reason panel). The Home "Help for my own situation" card is one long underlined link. The public doorbell's "Hand it over | Reasoned" weight mark is unexplained to a stranger.

### B-24 · The instance answered 503 to several reads once under parallel load · to watch
During two overlapping walks (my crawl as member while another script read the Inbox as administrator) `assistantstate`, `subscriptionsignin` and `groupidentity` answered 503 and the Inbox's rows did not draw; a retry a minute later was clean. One walk at a time shows none. Not reproduced since; recorded in case release walks run in parallel.

## Status of the earlier defects (browser view; "—" = not reachable without the assistant or not walked)

| Earlier | Status | Note |
| --- | --- | --- |
| D1 own API key | — | Connect page draws; the key form was not submitted |
| D3, D18 dock and Ask states | — | assistant lane |
| D6 captured text/HTML has words | FIXED | note.txt, example.com show passages |
| D7 cite sends a role | FIXED on Document; Find in's "against" not walked | see J-2 |
| D8 a question can be concluded | STILL | B-4 |
| D9 uploads vanish | FIXED | file and photo land under the question |
| D11 project title | FIXED (title) | raw ids remain elsewhere, B-17 |
| D13 vouching | FIXED (works) | silent, B-8 |
| D14–D16 document and Find in | STILL in part | B-9, B-12, J-5 visible (title and first sentence run together) |
| D21 bare queue items | STILL | B-15 |
| D23 setup says member is first admin | FIXED | "Already claimed" for a stranger |
| D24 429 | not seen | 503 once, B-24 |
| D26 handle | FIXED | `sparky`, `walker` |
| D31 closed-door buttons | FIXED | B-23 |
| D32 kind refusal for a member | FIXED | B-18 is a sibling |
| F3 member count | STILL | B-11 |
| F4 Find raw records | STILL | B-9 |
| F5 placeholders | STILL | B-10 |
| F6 garbled sentences | STILL | B-11 |
| F8 unknown address | STILL in part | B-14 |
| J-4 Find searches words | FIXED | finds note.txt for "420" |
| J-6 text file as "high risk" | FIXED | no such words |
