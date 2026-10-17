# WALK-085M #1: live walk of biosmoke8, release 0.85.0, as a plain member

Walked 2026-10-16 (about 00:05–00:25 UTC) with Playwright Chromium through the session's own network (proxy from the environment, the browser trust store holding the session CA, TLS checked, no bypass). Account: `bob-test`, role **member**, "May do: contribute" (Settings › Members). Screens at 1280×800 and 390×844. About 45 page loads. Screenshots and each page's text: `build/plan/walk-085m/` (`<screen>-1280.png|txt`, `-390`; `j*` = journey steps; `_log.txt`). Findings of walk-085 are cited as F#/D#.

## Verdict

**For a plain member 0.85.0 does not work: the member journey cannot start.** Signing in, every rail screen and every Settings page the member reaches open with no error and nothing scrolls sideways at 390 px. But a member cannot start a project ("Your account can't do this: an administrator grants what each member may do. Ask an administrator. Nothing was changed."), and the administrator's project "WALK-085 project" and question INQ-2026-0001 are correctly hidden from the member (Projects: "No projects yet"; Find for "pothole" and "WALK-085": nothing). So a new member has no project, no question, and nowhere to press "Ask the assistant"; that press was **not done**. The page offers the form and says "you become its owner" with no sign beforehand that the member may not. A member can capture a file with no project ("No project yet", `/app/held`), but then cannot read its words, cite it, or open the safe view (F1 again, plus a button that does nothing). Hidden-vs-refused: administrator-only settings are hidden from the Settings list and answer politely when typed by address; the roster hides invitations, join link, keys and limits. Counts: **FUNCTIONAL 2 blocker-level, 3 major, 3 minor; DESIGN 6.**

## FUNCTIONAL

### Blockers

**M-F1. A new member cannot start a project, and there is nothing else to work in.** `/app/projects` › "Start a project" › "WALK-085M project" › "Start the project" gives the red message above; the page lists no project ("No projects yet") and no way to ask to join, since the only project is hidden. The Home form "Start a project" (home-title) was not pressed (same act). The form is shown to a member who is not allowed to use it, with "you become its owner". Fix: hide or grey the form for a member without the right, say on the page who can start one, and make the member's first-run path work (a default grant of "start a project", or an invitation to an existing project). Journey as the brief asks (open a question, cite, Ask the assistant) **could not be completed**; see M-F2.

**M-F2. A captured file still cannot be read or cited (same as F1), and "Read the safe view" does nothing.** Add › A file or photo › `walk085m-sample.txt` (2 lines) › Capture: "Captured: walk085m-sample.txt. It waits in Held captures until you or another member vouches for it." Document page `/app/document/INFO-2026-0002-walk085m-sample-txt` shows only name, fingerprint and buttons, no words; no "Cite" anywhere. "Find in this" opens a form. "Opening a file" says "HIGH RISK ... CHECKS clamav · clamav not reported: not_scanned"; pressing "Read the safe view" gave no change at all after 5 s (`j13`). So the member cannot read their own note.

### Major

**M-F3. Find shows a raw record for the member's own file (F4).** Search "walk085m": "INFO-2026-0002-[walk085m]-sample-txt id ... object_type information schema information@2 ... current_state collected prior_state created ... produced_by mode assisted capability_tier session references state_history annotations_open 0 reeval_pending flag false since source visuals criticality supporting source…".

**M-F4. Placeholders and garbled sentences remain (F5, F6a).** Settings › Your ties: "Naming me by my handle: “{handle}, who worked on this case, is {tie}.”"; Your group: "Recorded by set at setup on 15 October 2026: Bob Krause".

**M-F5. Members roster names the administrator "The group's founder ... who hasn't chosen a handle yet" although they sign in as sparky (admin walk) — and Home says "2 wizards start here" with wizards unexplained is DESIGN (M-D3).** Roster row reads "The group's founder / The person who set up this group's Civicsmith, who hasn't chosen a handle yet. Their work will show it once they do." (the same person the administrator walk saw as sparky); a member cannot tell who to ask for rights. Related to F6c.

### Minor

**M-F6.** Console error on every load: `GET /favicon.ico` 400 (F8).
**M-F7.** Settings › Wizards, reached by address, shows a member "RECORD A NEW WIZARD ... Record a new wizard | Reasoned" and the whole library table (22 wizards, "Approved by"): a builder's control shown to a member (not tried; may refuse). Also the member's Settings list does not list Members, Translations or Wizards (the design keeps Members and Translations): they open only by typing the address, and More (phone) says "Your account, your group's members, the assistant, translations, wizards and updates" though Settings shows only five entries.
**M-F8.** "Add › Held captures" is the breadcrumb for Held captures, yet the rail highlights Add; fine. But `/app/held` lists the member's file as "Open the file ... Captured today · No project yet · From upload:328a13d1…" with the fingerprint raw. Minor.

## DESIGN

**M-D1. The "●○○○○ Reversible / Reasoned / Signed / Terminal" mark** on every button, including Sign in and Search (D1).
**M-D2. "The assistant" page leads with rule text**: "For a member's act in a project that has its own AI account, that project's account pays. Otherwise the member's own account, if they connected one; otherwise the group's key..." before the plain statement ("The assistant isn't serving you yet. Your group doesn't pay for the assistant; if you want it, connect your own account below, or skip it."). A member should see the plain statement first (D3). Good: it says clearly who serves the member, offers "My Claude subscription / My own API key / Not now", and shows no group key control.
**M-D3. Unexplained terms:** "2 wizards start here" (Home), "3 wizards start here" (Add), "1 wizard starts here" (assistant, ties, translations, imported); "capture", "vouch for this copy", "attest", "Retire", "held", "safe view", "clamav", "not_scanned", "deeper check", "ties", "court notice", "hosting account", "Explain promptly". A member who has just uploaded their own note is told "HIGH RISK" (D5).
**M-D4. Members page for a member** shows "THE GROUP'S API KEY: The group's key is not on." plus the same "For a member's act..." rule text and "KEEPING OUR MATERIAL AWAY FROM AI: Off. Members may use the group's key, a project's account or their own." Read-only, but jargon on a roster page (D2); the roster's "MAY DO: contribute" is unexplained and Expertise is empty.
**M-D5. Home gives a member an empty-group opening** ("What happened?" cards, "Start from…" box with no placeholder, then "None of these: start a project from a blank page." and "Start a project", which does nothing when pressed at the bottom link) and no mention that the member cannot yet start one (M-F1). Clicking "A problem I live with" reveals two buttons "Your first question" and "Check a claim" with no explanation (D7).
**M-D6. Dead-end copy:** "Security: The security screen is for administrators." / "Updates: Only your group's administrators install updates. If something needs updating, ask one of them." (good: polite and plain, but "ask one of them" does not name them); Your notes and Recovery codes are clear. Where else to go page is long but plain.

## Plain-member differences (from walk-085)

| Item | Result |
|---|---|
| `/app/settings` lists only "Yours" (account, assistant, ties, notes, recovery codes) | **hidden (correct)**: five entries, "The group's" absent |
| Your group, Who your group is, Places and offices | **shown read-only** ("Administrators change them; you can read them here"): no controls; acceptable, though the design hid them |
| Security | **hidden from the list; refused politely by address** ("for administrators"): correct |
| Updates | **hidden from the list; refused politely by address**: correct |
| Members: roster without invitation, join link, API key and limits blocks | **hidden (correct)**; but the roster still shows an API-key statement and "Keeping our material away from AI" text (read-only, M-D4) |
| Home hides the Administration card and "Invite your first members / Say who your group is" | **hidden (correct)** |
| Assistant page: "isn't serving you yet" with "Connect your own account"; no "Hold the group's API key"; no Switch on/off rows | **correct**, no group key control, no switches (M-D2 on wording) |
| Translations and Wizards | **shown by address** (not in the Settings list); Wizards shows "Record a new wizard" (M-F7) |
| WALK-085 project and INQ-2026-0001 | **hidden (correct)**: absent from Projects and Find |
| Held captures of the administrator's file | **hidden (correct)**; the member sees only their own |
| Start a project | **refused (wrong)**: form shown, then refused (M-F1) |

## Every screen

| Screen | URL | 1280 | 390 | Result |
|---|---|---|---|---|
| Front, sign-in, sign-out | / | ok | ok | pass (D1) |
| Home | /app | ok | ok | M-D3, M-D5 |
| Queue | /app/queue | ok | ok | pass |
| Find | /app/finder | ok | ok | M-F3 |
| Add (address/file) | /app/capture(/file) | ok | ok | pass; capture works with no project |
| Held captures | /app/held | ok | ok | M-F8 |
| Document | /app/document/INFO-2026-0002-... | ok | ok | M-F2 |
| Opening a file | /app/open-file/... | ok | not shot | M-F2, M-D3 |
| Projects | /app/projects | ok | ok | M-F1 |
| Project, Question, Ask the assistant | — | — | — | not reachable (M-F1); the hidden project is absent |
| People | /app/people | ok | ok | pass |
| Settings | /app/settings | ok | ok | pass |
| Your account | /app/account | ok | ok | pass |
| The assistant | /app/connect | ok | ok | M-D2 |
| Your ties | /app/ties | ok | ok | M-F4 |
| Your notes | /app/notes | ok | ok | pass |
| Recovery codes | /app/recovery | ok | ok | pass |
| Your group, Who your group is, Places | /app/group ... | ok | ok | M-F4 (read-only) |
| Members | /app/members | ok | ok | M-F5, M-D4 |
| Security, Updates | /app/security, /app/updates | ok | ok | pass (refused politely) |
| Translations, Wizards | by address | ok | ok | M-F7 |
| Another group's case, Inbox | /app/imported, /app/inbox | ok | ok | pass |
| More, Where else to go | /app/more, /app/elsewhere | ok | ok | pass |

No page scrolled sideways at 390 px. Left in the instance: the member's held file `walk085m-sample.txt` (INFO-2026-0002). No project or question was created; no assistant account connected.
