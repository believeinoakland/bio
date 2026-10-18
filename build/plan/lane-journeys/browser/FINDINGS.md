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

### B-25 · "Find in this" from a document fails with the wrong words · MISLEADS · NEW (D14–D16 family)
Admin, Document page › "Find in this" (address `/app/find-in/<document>`): every search answers "This could not be read. Try again in a moment." The call behind it answers `CAPTURE_NOT_HELD` ("this record holds no capture with that fingerprint that you may see"): the screen sends the document's record id where the call wants its fingerprint. Trying again never helps. The same search from the project (`/app/find-in/<project>/<question>`) works. Owner: screens-daily (find-in, document).

### B-26 · Find in's results offer no act, and the question choice is lost · MISLEADS · NEW (J-2, J-8, J-9 unreachable here)
Admin, `/app/find-in/<project>/<question>`, all kinds ticked, "pothole" and "420": each hit reads "Found by search" with the passage, "Accepted by our group" and "Recorded by admin" (the founder is `sparky`), but no "Cite a passage", "Record a fact about a person" or "Hold as a standard" control is drawn, and the "For which question" box returns to "None yet" after the search. So J-2 (`against`), J-8 (validity) and J-9 (standard needs a passage id) cannot be seen in the browser with this data; they stay as J-FINDINGS recorded them. "One document could not be read for this" is said of a plain text note for money, dates and requirements. Shot: `journey6-findin-result-1280`.

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

---

# V4 (JOURNEYS #3, 2026-10-16): round 7 re-checked in passing, then one real investigation worked by hand (K3578)

Walk of biosmoke8 after fix round 7, as administrator (`sparky`) and member (`walker`), 1280 wide (390 not walked in V4; no time). My project: "JOURNEYS V4: are bus shelters repaired within 30 days?" with one question, ten documents (text files, a real web-served PDF, a CSV, a photo, an image-only PDF, an xlsx, a doorbell knock), a person, a money trail, a plan, a draft wizard. Shots: `shots/v4-*.png`. Findings continue from B-27.

## Blockers

### B-27 · A proceeding cannot be registered: the court list is empty · BLOCKS journey 14 · NEW
Admin, `/app/proceeding/<project>`. "The court or tribunal" is a choice with no options at all; with the other fields filled, "Register the proceeding" answers "Give the court, the number, the kind and where the caption comes from." No screen adds a court (Places and offices adds places and offices, not courts). Owner: screens-action / places. Shot: `v4-proceeding-empty-1280`.

### B-28 · A standard cannot be held from any screen with real words · BLOCKS journey 14 (standards) · STILL (J-9, B-16)
Admin. Find in's "Hold this as a standard" on a requirement hit of a text file sends `text: []` and is refused in words (`STANDARD_NO_TEXT`: "name at least one passage of a captured document"), though the passage is on screen. The Standard screen asks for "the passage's content ids, separated by commas", which no screen shows; typing anything is refused ("A passage named as this standard's text is not held in the record. Capture the document and cite the passage first"). Passages of a web page or PDF were not tried (no such document with a "shall" was reachable). The form's "What kind of fact" label on the standard's kind (Find in) is also wrong. Shots: `v4-findin-standard-after-1280`, `v4-standard-typed-1280`.

## Misleads

### B-29 · Find in's recording acts: free-text fields, unprefilled, and a wrong refusal word · MISLEADS · NEW
Admin, Find in, fresh passages (acts DO draw on a passage not yet recorded; V3's "no act drawn" was because its passage was already cited: so B-26's first half is explained, see status).
- Money: the amount is not prefilled though the figure was read ("$15,000"); empty fields answer "This could not be read. Try again in a moment." (the call said `NO_AMOUNT`). Kind and stage are free text with no list; an "actual" payment needs a flow step (encumbered, incurred, paid) that this form has no field for, so it is always refused ("This request does not say which step of the flow it is about"); only "adopted" went through. The Money trail's own form has the stage field.
- Dated fact: "What kind of fact" is free text (11 kinds exist, not listed); empty or unknown kind answers "This could not be read. Try again in a moment."; the date read ("20 May 2025") is not prefilled. Typing `received` and `2025-05-20` worked.
- Success shows nothing: the form simply closes; the hit stays until the search is run again.
Same wrong refusal word elsewhere: the project page's invite of an already-invited handle, and Timeline's "Record an event". Owner: screens-daily (find-in) and the shell's refusal wording. Shots: `v4-findin-money-empty-1280`, `v4-findin-money-filled-1280`, `v4-findin-dated-after-1280`.

### B-30 · A document is one passage; a recorded fact hides every other act on it; tables and sheets are flattened · MISLEADS · STILL (J-5)
- A plain text file is a single passage. Recording one fact from it marks the whole document "Recorded by admin", so the date, the requirement and the money in the same file lose their acts (seen: after one money fact, all 10 hits of that file read "Recorded"). A person who captures a one-page order can record one thing from it.
- The CSV (`airtravel.csv`) is one run of words ("Month 1958 1959 1960 JAN 340 360 417 …"): rows and columns are gone. The xlsx loses its sheet name, and formula cells (no cached value) are empty ("Total" with nothing). Nothing says a table was flattened.
- The text PDF (Federal Reserve H.15, 3 pages) is read fully, one passage per page, pages numbered from 0 ("Page 0"); Find in splits it into sentences. This is the best case and works.
Owner: extraction / content-search. Shots: `v4-doc-h15-pdf`, `v4-doc-airtravel-csv`, `v4-doc-shelter-repairs-xlsx`.

### B-31 · A photograph's words are not read; an image-only PDF's are · MISLEADS · NEW (D14–D16 family)
Admin. `notice-photo.jpg` (a clear 1000-px notice, text 34 px): the Document page says "Passages: Nothing here" and "Pages 0 are pictures of text that Civicsmith's own reading couldn't make out"; it offers "Have the assistant read pages" or typing them. The same notice as an image-only PDF (`notice-scan.pdf`) was read correctly (one passage, a single letter wrong: "inspected" for "Inspected"). So OCR works for a scanned PDF and not for a photograph, with no explanation. "Pages 0" and a page picker "0" for a one-image file remain (B-11). Owner: extraction. Shots: `v4-doc-notice-photo-jpg`, `v4-doc-0677...`.

### B-32 · A person the group follows is not found, and the person page shows nothing recorded · MISLEADS · NEW
Admin. "Maria Alvarez" was added (People) and is named in four passages; Find in's "People and offices your group follows" answers "Nothing here" every time, so Find in's person-fact act (J-8) cannot be reached. The Person page's own form works (a fact with a typed full fingerprint was recorded: `PFA-…`), but the page lists no fact afterwards and still draws an empty graph and "Open the person" on itself (B-21 STILL). The Timeline form, People list and Explore (From `PROJ-…`, B-17) were reached; Explore not run.

### B-33 · The Timeline holds nothing though dates were recorded · MISLEADS · NEW
Admin. Five dated facts (from text files and the OCR'd PDF) were recorded; the project's Timeline still says "This project's document names no person, organization or event yet, so its timeline holds nothing." "Record an event" (kind, full fingerprint, page 0) answered "This could not be read. Try again in a moment." (B-29). "Look for dates in this project" opens Find in, which is a door, not an act.

### B-34 · Acts are silent, and "Reasoned" does not always ask for a reason · MISLEADS · STILL (B-8)
Vouch: still no acknowledgement (the item leaves Held; the page says nothing). Cite from Find in an already-cited passage: nothing at all (the act said `alreadyCited`). A cite from Find in with "cuts against" lands (J-2 FIXED) and shows only on the question page. "Write a note", "Add a tie", "Save as a draft" (wizard) and "Plan what to do" are marked Reasoned and ask nothing; "Remove a tie" and the Standard act do ask. Typed text stays in the box after a note is written.

### B-35 · Security refuses a period that ends today, including its own default · MISLEADS · NEW
Admin, `/app/security`. The screen opens on "From 9 October to 16 October". Asking for 9 to 16 October, 10 to 17, or 14 to 16 October is refused: "The security map shows a period of up to 90 days within the last 90, from an earlier time to a later one. The period asked was not one of those." 20 September to 15 October works (and is shown as "to 16 October"). Backwards dates get a plain sentence. Owner: screens-settings / security. Shot: `v4-security-period-1280`.

### B-36 · A recorded wizard draft is saved but not listed · MISLEADS · NEW
Admin, Wizards. "Record a new wizard" starts a recording dock; pressing an act adds a step ("1. 1. Question: Read in my language", double numbering); "Save as a draft" answered ok (`WIZ-2026-5115`, "only its author runs it") but the dock says nothing visible to me, and the library's Drafts view (needs "See the whole library" pressed, the select alone does nothing) shows "No wizards to show here". Shot: `v4-wizard-recording-step-1280`, `v4-wizard-drafts-1280`.

### B-37 · The second file captured in a session loses its name · MISLEADS · NEW
Admin, Add › file. Seen twice (`second.txt`, `notice-scan.pdf`): when a second file is captured after the first by opening the capture page again, the result says "Captured: ." and the document is titled `upload:<64 hex>` (B-12 family). A file captured first, or after moving between captures by the page's own links, is named. The long address capture of `https://www.oaklandca.gov/` (420 kB page) ended with no result sentence and no document in 25 s; a PDF, a CSV and `rfc2119` by address worked (the last answered "already held" naming `rfc2119`).

### B-38 · A typed name or term is ignored unless "A name or term" is ticked · COSMETIC · NEW
Admin, Find in. Typing "30 days" in "The name or term" with the box unticked searches nothing and says nothing; ticking it everything else off gives "Tick at least one thing to find" only when none is ticked.

### B-39 · Citing from a document: the own question is listed first but not preselected; nothing chosen reads "Open a question first" · MISLEADS · PARTIAL (B-7)
Admin and member. The document's cite list now puts its own question first and, for a member, lists only the questions they may see, but opens on an empty choice. "Cite a passage" with it empty answers "Open a question first: a passage is cited in a question." (a question exists; the sentence is wrong). Choosing the question cites correctly.

### B-40 · The inbox: a knock with already-held bytes cannot be moved; raw ids remain · MISLEADS · NEW
Admin. "Move into the record" exists on each knock's own page (`/app/inbox/<knock>`; the list has no control). A fresh knock moves with "Moved into the record. It waits in Held captures until a member vouches for it." Two of my V3 knocks answer a long sentence about "another record" (`CAPTURE_HELD_BY_ANOTHER_BUNDLE`) with no way on. The page shows `SRC-…` ids and "who handed in KNOCK-…" (B-17). The Updates screen offers no act (nothing to install: reads plainly).

## Worked, in this walk (no defect)
Capture from an address (PDF, CSV) and of files (text, jpg, scanned pdf, xlsx) land under the question with a link and a "Cite a passage"; vouch removes from Held; cite from the document, from Find in (supports and cuts against), by member and administrator; question page shows SUPPORTS and CUTS AGAINST; Find in from a document (B-25) and from the project keep the chosen question (B-26); a person is added; a person fact with a full fingerprint; a dated fact and a money fact from Find in with correct values; a money trail starts and reads a figure with stage and period; a plan opens; the doorbell receipt ("Received, 16 October 2026. A member of the group will read it."); a fresh knock moves into the record; the member joins an invited project, cites, adds a tie, declares expertise, writes and deletes a note; Security's 25-day period; wizard recording adds steps.

## Status of earlier findings re-checked in V4
| Finding | Status | Note |
| --- | --- | --- |
| B-7 cite defaults to another project's question | PARTIAL | no longer; own question not preselected, B-39 |
| B-8 vouch silent | STILL | B-34 |
| B-9 Find raw records | NOT RECHECKED | Find in's results read in words |
| B-10 `{handle}` `{tie}` | STILL | Your ties page |
| B-11 garbles | STILL | project "started Hidden…", "shelter-log.txtRead it back", "Pages 0", "Recorded by admin" (founder is `sparky`), plan "by admin" |
| B-17 raw ids | STILL | knock source ids, "Reference: b24083b9", `PROJ-…` in Explore/Standard |
| B-20 tooltips cover content | STILL | seen on the question page |
| B-21 person graph | STILL | B-32 |
| B-24 503 | SEEN ONCE | `/app/notes` first load drew blank with a 503; fine on reload |
| B-25 Find in from a document | FIXED | search runs |
| B-26 Find in no acts, question lost | FIXED / EXPLAINED | question stays chosen; acts draw on unrecorded passages (B-30) |
| J-2 cuts against from Find in | FIXED | recorded as `cuts_against` |
| J-8 person fact from Find in | STILL (unreachable) | no people hit, B-32; the Person page's act works |
| J-9 standard from a text passage | STILL | B-28 |
| J-5 passages joined | STILL | B-30 |
| B-1, B-2, B-3, B-4 | NOT WALKED | by instruction; the plan page opens from the question (`/app/plan/<id>`) and draws |
