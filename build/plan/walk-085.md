# WALK-085 #1: live walk of biosmoke8, release 0.85.0, as administrator

Walked 2026-10-15 (about 23:35–23:55 UTC) with Playwright Chromium through the session's own network (proxy from the environment, the session's CA bundle, TLS checked, no bypass). Account: `JOURNEY_ADMIN_*`, handle shown on screen as **sparky**, role **administrator** (Settings › Members: "Active members: 2 · Administrators: 1"; the administrator-only pages Security, Updates, Your group, Places, Wizards all open). The other member is `bob-test`, a plain member. Screens at 1280×800 and 390×844, dark at 1280 for four screens. Screenshots and each page's text are in `build/plan/walk-085/` (`<screen>-1280.png`, `<screen>-390.png`, `j*`/`k*` = journey steps, `00-*` = signed out, `_log.jsonl` = console errors and failed requests per page).

**Route proved.** Sign-in answered, `/app` loaded signed in, and reload, 40 more page loads and the journey all stayed signed in. Sign-out returned to the group's front page and a deep link then asked for sign-in. The route works; K3246's failure is gone.

## Verdict

**0.85.0 is not yet a release Bob can use end to end, though most of the way there.** What works live: sign-in and sign-out, every rail screen and every settings page open with no error, no screen scrolls sideways at 390 px, dark mode holds, the phone More tab matches the design, a project can be created, a question opened under it, a file captured into it and the assistant started on the question (Bob's subscription is connected and shows as serving). What does not yet work or would lose its audience: after the file is captured there is no way to read its text or cite a passage (the Document page shows no words, the question page never lists the document); the assistant run shows "working" for 6+ minutes with no progress and no result (5 calls, $0.36 spent); Find shows raw internal record dumps; Home says "1 member" when there are 2; several screens print unfilled `{handle}` / `{tie}` or garbled sentences. Judged for a non-technical community member or founder, most working screens are **MAJOR** on sense: the same unexplained marks ("●○○○○ Reversible/Reasoned/Signed/Terminal" on every button), and terms such as "bar", "runs", "standing questions", "wizards", "ties", "capture", "vouch", "attest", "safe view", "ICAP", "clamav" are never explained where they appear. Counts: **FUNCTIONAL 2 blocker-level (journey cannot complete), 5 major, 4 minor; DESIGN 8 major, 10 minor.** Plain-member differences are listed at the end.

## FUNCTIONAL findings

### Blockers (the journey cannot complete)

**F1. A captured document cannot be read or cited, and the question never shows it.** Journey: Projects › WALK-085 project › question "How many pothole reports did the city close late in 2025?" › Add a document › "A file or photo" › walk085-sample.txt (plain text, 2 lines) › Capture. Result: "Captured: walk085-sample.txt. It waits in Held captures until you or another member vouches for it." and a link "Cite a passage"; the file appears in `/app/held`, "Filed under WALK-085 project, for the question ...". But: the Document page (`/app/document/INFO-2026-0001-walk085-sample-txt`, `j12-document-1280.png`) shows only the file name, fingerprint and buttons "Read the grade note / Find in this / Vouch for this copy / Attest / Watch for changes / Retire", with **no words of the document at all**, so there is nothing to select and cite; and the question page (`j13`, `k05`) still says no document is attached to it. Find does return the question and project, but the document itself was not found by search (2 results, neither is the file). Design: `screens` entries `document` ("its words by page with citing") and `question` ("what each cited passage carries"). Fix: after a text file is captured, extract and show its words on the Document page with "Cite this passage", list the captured document under the question, and say when reading is still under way.

**F2. The assistant run does not finish or show anything.** `j14`/`k05`/`k08`: pressing "Ask the assistant" (question page) gives no visible reaction at all for 3 and 12 seconds; only a later reload shows "THE ASSISTANT IS WORKING ON THIS QUESTION / Machine work / You can leave this page; the run keeps going...". Six minutes later it still says working; the Queue is empty ("You are up to date"), the dock says "THE ASSISTANT'S RUN ... Last 30 days: $0.36, 5 calls". No step, progress or result is shown, and the page gives no way to tell a slow run from a stuck one. Fix: acknowledge the press at once ("Started"), show what it is doing and when it was last heard from, and show failure or result.

### Major

**F3. Home reports the wrong number of members.** Home › Each area at a glance › Members: "1 member"; Settings › Members: "Active members: 2" (sparky, bob-test). (`dark-home-1280.png`, `members-1280.png`.)

**F4. Find returns raw internal records.** Find › Search "pothole": the first result's body reads "INQ-2026-0001-how-many-[pothole]-reports-did-the-city-cl id INQ-2026-0001-... object_type inquiry schema inquiry@1 title How many [pothole] reports ... current_state open prior_state created 2026-10-15T23:46:50Z last_updated ..."; the second is "## Session Log ### Session 2026-10-15T23:46:17Z | Formation | interactive Trigger: started from the projects list ...". (`k04-find-results-1280.png`.) A member must see the question's title, its project and state in words, never ids and field names.

**F5. Unfilled placeholders on Settings › Your ties.** Radio choices read: "Naming me by my handle: “{handle}”, who worked on this case, is {tie}.” and "...A member of the group who worked on this case is {tie}." (`ties-1280.png`.) Also the "Who" menu above them is empty with no explanation.

**F6. Garbled sentences with missing words.** (a) Settings › Your group: "Recorded by set at setup on 15 October 2026: Bob Krause". (b) Project page: "started Hidden: only its members know it exists., 15 October 2026" (`j03-after-start-1280.png`). (c) Question page: "Opened by The group's founder, 15 October 2026" where the opener is sparky (the project page says "Owner: sparky"). (d) Settings › The assistant "Changes": "sparky connected a sign-in" (fine) but Members page copy of the same block repeats "A case's account" without saying what it is.

**F7. "Another group's case" / design items not on the screen that the design lists.** Home has no "Needs you", "Needs the group" or "Since you last looked" block and no strip (design `home`, DEC-218), even after a project, a question and a file exist and the assistant is running; it is the empty-group text first ("Nothing is here yet...") and then only areas, projects and "What happened?". Find lacks "browse it by kind and state with no words" and the held-set tools show only as buttons (design `finder`).

### Minor

**F8.** Every page load logs a console error "Failed to load resource: the server responded with a status of 400": `GET /favicon.ico` answers 400 (the first load of every page; also unknown paths such as `/nonexistent-walk` return raw JSON `{"ok":false,"error":"unknown op","reason":"UNKNOWN_OP",...}` instead of a page).

**F9.** Person page (Finance Department), "SAME PERSON?" shows "This could not be read. Try again in a moment." and an empty "The other record" menu; the page's connection picture is one box alone. (`person_ENT-2026-0001-1280.png`.)

**F10.** Hover help stays open and covers content: project page, the bar tooltip covers the question box label (`j03`); Assistant dock, the tooltip covers the first line ("It finds, reads and checks; it ne..."; `k01`).

**F11.** Speed: first loads of `/app/*` measured 2.7–4.7 s to settle (Home 4.7 s with a "Still loading" bar on first view); every full address reload repeats this. Within the app moves are quicker.

## DESIGN findings (to the design lane, K3460)

### Major

**D1. The "●○○○○ Reversible / Reasoned / Signed / Terminal" mark beside every button label.** Seen on the sign-in button, Search, Capture, every Settings and Projects button: "Sign in | ●○○○○ Reversible", "Start from… | ●○○○○ Reversible", "Disconnect your subscription | ●●●○○ Terminal", "Register your signing key | ●●●●○ Signed". Never explained on the screen where a person meets it first (the sign-in page), and it crowds each button. A community member would ask what "Reversible" has to do with signing in. Design: `words.json` keys `weight.*` (mark in `mock-kit.js WNAME`). Fix: keep the weight marks only for acts that change something, explain the scale once in plain words (a one-line key on first view), and drop them from navigation-like buttons (Sign in, Search, Open).

**D2. Settings › Members is a 3,790-px mixed page.** The roster, the invitation form, the website join link, the group's Anthropic key, nine assistant "Switch on/off" rows, limits, a usage chart and "Keeping our material away from AI" are all on one page (`members-1280.png`); the assistant settings repeat on The assistant page. A founder looking for "who is in my group and how do I add someone" cannot find the roster's controls. Design `members`: "The roster: invitations, capabilities, expertise, administrators, joining through the website". Fix: keep the roster, invite and join link on Members; move the key, switches, limits and away-from-AI to their own pages under The assistant.

**D3. Settings › The assistant uses unexplained terms in a column of nine switches.** "Asking · on", "Drafting · on", "Runs · on", "Standing questions · off", "Interviews and planning · on", "Reading inside documents · on", "Reading page pictures · on", "A case's account · on", "Suggestions · off", each with "Switch off | ●●○○○ Reasoned". The first paragraph ("For a member's act in a project that has its own AI account, that project's account pays. Otherwise the member's own account...") is rule text before the plain statement of who serves you. This is the page Bob already called unfriendly (K3459, handoff B241). Design `connect` (words `screen.connect.*`): lead with who serves you and what it costs, plain names for the uses ("Runs" and "Standing questions" need a sentence each), and the rest tucked behind "More".

**D4. Security page is a vendor list a founder cannot read.** "Uva Software, LLC · Scanii", "stated by the administrator · any ICAP server (RFC 3507)", "Deep CDR (MetaDefender Cloud or Core)", "any syslog collector (RFC 5424 over TLS)", "any HTTPS endpoint taking a JSON POST", "makes a safe copy", "runs files in a sandbox", twenty-one rows with a "▶ Acts" control each. The page opens with "Ordinary. From 8 October 2026 to 15 October 2026." and a table "Refused sign-ins 1 / Usually 0" with no sentence saying whether that is good or what to do. Design `security`: "counts only; told only when risk is high". Fix: lead with one plain sentence on how things stand, then "File checking: on / off" and "Add another checker (advanced)" with the list folded away.

**D5. Document and "Opening a file" screens speak machine language.** Opening the plain text note I added: "HIGH RISK ... Why: Handed in, not fetched by your group's Civicsmith", "THE SAFE VIEW", "Machine work Derived · a safe copy of the original. Cite the original, never the safe copy", "CHECKS clamav · clamav not reported: not_scanned", "1 files waiting for a check." A member who just uploaded their own note is told it is high risk and shown "clamav ... not_scanned" with no next step. Also "Vouch for this copy / Attest / Signed / Retire Terminal" sit together with equal weight and no explanation of which comes first (`j11`, `j12`). Fix: say what to do next ("Read it", "Mark it as checked by you"), explain "vouch" and "attest" once, put "Retire" away from the main actions.

**D6. Question page speaks in the group's jargon at the first step.** "NOTHING CITED YET: A question stands on passages the group holds"; "Capture a document for it"; "Cite a passage"; "HUNCHES: Your hunch / What kind of hunch: A suspicion / Where something went"; "Narrow the question"; "Ask for a check by expertise"; "Plan what to do"; "WHAT RELIES ON THIS: WALK-085 project, A project". After the run begins the page puts Stop, Cite, Hunches, Concluding, Narrow, Check and Plan in one long column with equal weight. Design `question`: "what supports it or cuts against it; strength against the bar; its readings...". Fix: one clear next step at a time ("1 Add a source  2 Mark what it says  3 Say what you conclude"), the rest folded.

**D7. Home first-visit explains nothing about what comes next.** For the administrator: "2 wizards start here" (what is a wizard?), "YOUR GROUP'S CIVICSMITH IS READY ... Nothing is here yet. Most groups start by inviting a few members and opening one project...", two plain links "Invite your first members" / "Say who your group is" with no buttons or order, then a 7-card "What happened?" with one card (the sixth, "Help for my own situation") shown as an underlined link whose whole paragraph is underlined and a text box beside "Start from… | ●○○○○ Reversible" (`home-1280.png`). The empty box next to the button has no placeholder. On phone the box and button sit side by side in a narrow row (`home-390.png`).

**D8. "Bar" and other group-wide terms on admin pages.** Your group › "THE GROUP'S BAR: Capture / No bar / Connection / No bar / Why (every member will see this)"; project page "THE PROJECT'S BAR ... Unrated ... Capture / No bar on this axis / Connection / No bar on this axis ... Choose neither axis to withdraw the project's bar." These appear above the project's real work (the first question). Nowhere is "bar" defined at the point of use ("how strong the evidence must be before the group calls it a finding"). Same for "ties", "court notice", "hosting account".

### Minor

**D9.** The masthead on 390 truncates the group name ("Believe In Oa...") and the three header icons (search, ?, diamond) carry no words, while 1280 shows "Explain promptly" and "Assistant" in words; "Explain promptly" is not self-explaining (it is the explanation level).
**D10.** Buttons in a row on the question page sit at different heights and lengths ("Add a document" is a link, the others bordered boxes; `j05`); on Find "Your words" input and the Search button are different heights.
**D11.** Account page: the signing-key checkbox floats far from its text (`account-1280.png`); "Light / Dark / Follow my device" do not show which is chosen; "Your screens follow your device's setting." appears twice.
**D12.** Recovery codes page: "You hold recovery codes: 10 of 10 unused" with no reminder that the administrator never saw them, nor a link to where they were shown.
**D13.** Queue: "Three kinds: To do needs your act; Noticed ...; Status ... (Shown once.)" then "Sort by time added · time due · case · kind" over an empty list; the sort controls and the "(Shown once.)" are noise when nothing is waiting.
**D14.** Add (capture) from a question: the page is headed only "Add" with no sign it will file into the question ("Filed under ..." appears only after saving); the radio choices "How you got it" run into the next heading with no spacing (`j08`).
**D15.** The "Wizards" page is a library table with "Which wizards / Offered to members / Drafts / Submitted for approval / Withdrawn / Retired / Broken: no longer matching the screens / Open proposals", a page for builders on a Settings list meant for a founder.
**D16.** Project page: the visibility form and "Start a project from this one" form are at the bottom after Members, below a long set of "Reasoned" buttons.
**D17.** Hover tooltips repeat the visible label ("Sign in: Signs you in on this device...").
**D18.** The People page lists three organisations all "added at setup from your group's place" with an identical "Explore connections | ●○○○○ Reversible" on every row; the add form below has two fields that read the same ("Their name", "A person or an organization").

## Signed-out and recovery screens (view only)

Front page `/`: works, but the two left blocks have no gap (the "Hand material to the group" button touches "HOW WE WORK"), the sign-in form is narrow and low on phone (below 2 screens of text), and the "Sign in | ●○○○○ Reversible" button (D1). A wrong password gives a clear, kind message ("That handle and password don't match... after several tries, sign-in pauses"). Forgot your password: clear, no email, ends with "Set a new password with a recovery code | Reasoned". Doorbell, tour, reset (used link: "This link no longer works"), join (same) and setup ("ALREADY CLAIMED... sign in instead") all render and read plainly. Every one still has the "Reversible/Reasoned" mark. Unknown path: raw JSON (F8).

## Plain-member differences (from the design; a member walk follows separately)

The rail already lists Settings for the administrator; for a member `/app/settings` should list only "Yours" (account, assistant, ties, notes, recovery codes) and hide "The group's" (Your group, Who your group is, Places and offices, Security, Updates) but keep Members and Translations/Wizards as the design says; Members should show the roster without invite, join-link, API-key and limits blocks; Home hides the Administration card and the "Invite your first members / Say who your group is" links; the Assistant page shows "The group's key serves you" or "isn't serving you yet" with "Connect your own account" (design `connect`); no "Hold the group's API key", no Switch on/off rows. The member walk should confirm each hides rather than refuses.

## Every screen

P = renders and matches in substance; F = functional defect; D = design defect only (P/F/D: worst applies). W = wording/sense major.

| Screen | URL | 1280 | 390 | Result |
|---|---|---|---|---|
| Front (signed out) | / | ok | ok, long | D (D1) |
| Forgot password | /app/forgot | ok | ok | D (D1) |
| Doorbell | /app/doorbell | ok | ok | D (D1) |
| Tour | /app/tour | ok | ok | pass |
| Reset (used link) | /app/reset | ok | ok | pass |
| Join (used link) | /app/join | ok | ok | pass |
| Setup (claimed) | /app/setup | ok | ok | pass |
| Unknown path | /nonexistent | raw JSON | raw JSON | F8 |
| Sign in / sign-out / deep link | / | ok | ok | pass |
| Home | /app | ok | ok | F3, F7, D7 |
| Queue | /app/queue | ok | ok | pass, D13 |
| Find | /app/finder | ok | ok | F4, F7 |
| Add (address/file/saw) | /app/capture | ok | ok | pass, D14 |
| Held captures | /app/held | ok | ok | pass |
| Opening a file | /app/open-file/... | ok | not shot | D5 |
| Document | /app/document/... | ok | not shot | F1, D5 |
| Projects | /app/projects | ok | ok | pass |
| Project | /app/project/... | ok | ok | D8, D10, D16, F6 |
| Question | /app/question/... | ok | ok | F1, F2, F6, D6 |
| Ask | /app/answers | ok | ok | pass (not run) |
| People | /app/people | ok | ok | D18 |
| Person | /app/person/ENT-... | ok | ok | F9 |
| Explore connections | /app/explore | ok | ok | pass |
| Where else to go | /app/elsewhere | ok | ok | pass |
| More (phone) | /app/more | ok | ok | pass |
| Settings | /app/settings | ok | ok | pass |
| Your account | /app/account | ok | ok | D11 |
| The assistant | /app/connect | ok | ok | D3 |
| Your ties | /app/ties | ok | ok | F5 |
| Your notes | /app/notes | ok | ok | pass |
| Recovery codes | /app/recovery | ok | ok | D12 |
| Your group | /app/group | ok | ok | F6, D8 |
| Who your group is | /app/group-identity | ok | ok | pass |
| Members | /app/members | ok | ok | D2 |
| Places and offices | /app/places | ok | ok | pass |
| Security | /app/security | ok | ok | D4 |
| Updates | /app/updates | ok | ok | pass (0.85.0, nothing to install) |
| Translations | /app/translations | ok | ok | pass |
| Wizards | /app/wizards | ok | ok | D15 |
| Another group's case | /app/imported | ok | ok | pass |
| Inbox | /app/inbox | ok | ok | pass |
| Assistant panel | (dock) | ok | not shot | D10 |
| Help (spot-checks) | /app/help | text only | - | pass |
| Dark mode (home, assistant, settings, project) | | ok | - | pass |
| Timeline, Money trail | /app/timeline, /app/money | "Nothing is here" (need an id; not reachable by address) | same | n/a |

Not done: Archive, Published, Docket, Ceremony, Action, Matter, Case, Standard, Proceeding, Request and Calculation screens (no data to open them without publishing, sending or other forbidden acts); a phone shot of Document/Opening a file/Assistant dock; the assistant's actual answer (F2). Two sessions were opened for the walk and signed out; one stray wrong-password attempt ("nobody-walk") shows as "Refused sign-ins 1" on the Security page. Left in the instance: project "WALK-085 project" (PROJ-2026-5304), question INQ-2026-0001, held file `walk085-sample.txt`, and a started assistant run on that question, which can be stopped from the question page.
