# JOURNEYS #1: the walk plan

**Status** · Written 2026-10-16 by JOURNEYS #1 for BOB #192, before the release with fix round 6 is deployed to the trial instance. Not yet walked. Sources: `CHARTER.md`; `docs/development/ux-substrate/` (`journeys.html`: twenty-seven journeys; `screens/registry.json`: 69 screens; `words.json` and the words files); `requirements/README.md`'s canon; `build/plan/draft-T49-walk.md` (the 32 defects D1–D32 of the local discovery walk, K3320); `build/plan/walk-085.md` (the live walk of 0.85.0: F1–F11, D1–D18). Nothing here changes product code or decides anything.

## 1. Ground rules

- **Instance and roles.** The trial instance, as administrator (`JOURNEY_ADMIN_*`) and as member (`JOURNEY_MEMBER_*`), read by variable and never printed. Every journey is walked in both roles where both can take it; for the member, what an administrator-only act should hide is checked as hidden, not refused (walk-085's "plain-member differences").
- **Browser.** Chromium, `--no-proxy-server`; direct to the instance (`curl --noproxy '*'`), never the agent proxy. If the browser fails on TLS, that is reported first (K3530, K3534).
- **Widths.** Every screen at 1280 and 390 wide; dark mode at 1280 for Home, Project, Settings and one question page; no page scroll sideways at 390; touch targets and clipped text at 390.
- **My own work.** Projects named `JOURNEYS …` only. Nothing in `WALK-085 project` or another lane's records.
- **No assistant.** A screen that asks for the assistant is checked for what it draws before and after, never run: the plain path (search, cite, conclude by hand) must stand without it (K3320's "real investigation").
- **Refusals.** An act a permission or safety check refuses is recorded in `HANDOFF.md`, never worked around.
- **Evidence.** Per screen: a screenshot at each width (`shots/<journey>-<screen>-<1280|390>.png`), the page text, the console and failed-request log, and the steps taken.

## 2. What "works" means (applied to every screen)

A screen passes only if all of these hold; each failure is a finding at the severity in §6.

1. **Right screen.** It is the design's screen for its address (`registry.json`), with the purpose, acts and frame the registry names; nothing the design lists is missing (a missing screen is a defect).
2. **Right words.** Plain words (brand-and-voice, K3052): no raw ids (`PROJ-…`, `INQ-…`, 64-hex shas, ISO times), no record dumps, no field names, no unfilled `{handle}` or `{tie}`, no developer or check-code prose (`C-nn.nn`, `NOT_YOUR_ACCOUNT`), no garbled sentences, no unexplained term at its first use (bar, vouch, attest, tie, capture, run), no sentence that contradicts another on the screen.
3. **Every control works.** Each button, link, form and menu does what its label says, shows an acknowledgement at once, and shows its result or its refusal in words with a next step. A link goes somewhere real. A control that does nothing, or says "later", is a defect.
4. **One clear next step.** The screen leads with what to do now; heavy acts (permanent, signed, outward, terminal) are marked and apart from ordinary ones; the weight marks are explained where first met.
5. **States.** Empty (new group), populated, loading, refused (not allowed, not yours, rate-limited) and failed are each drawn sensibly; an unknown address draws a page, not raw JSON.
6. **Role.** An administrator-only thing is absent for a member, not refused.
7. **Sharp.** Both widths and dark mode: nothing clipped, overlapping or sideways-scrolling; tooltips do not cover content; spacing, alignment and states follow `visual-language`; no console error on a normal load; first load settles in a few seconds.
8. **Accessible.** Keyboard order and focus visible; controls have accessible names (D31's "closed door buttons have no accessible text"); contrast reads at AA.

## 3. The journeys

Journey numbers are `journeys.html`'s. A = administrator, M = member. "Walk" = walked live; "Look" = what is drawn is checked, the act not run; "Out" = not walkable here, with the reason.

| # | Journey | Role | Mode | What "works" means for it |
|---|---|---|---|---|
| 28 | Arrive, sign in, sign out | A, M | Walk | The group's page tells a stranger what this is; sign-in works; wrong password gives a kind message; a deep link signed out asks for sign-in and returns after; reload and 40 page loads stay signed in; sign-out ends the session; 429 (D24) never appears in ordinary use. |
| 1 | A group gets going (site, installer, update, claim) | A | Look | civicsmith.org's three pages read plainly; the install and update screens draw their steps and what is needed; the claim screen (`/app/setup`) lets the founder choose a handle and names the founder correctly; for a member it says nothing about being first administrator (D23). Installing is not walked here (it is a real account). |
| 2 | The group says who it is | A | Walk | Who your group is, Your group, Places, Recovery codes, Settings: each saves what it says, shows it back in words, and the member sees it in the welcome; nothing is required; wording has no `Recorded by set at setup` gaps (F6). |
| 3 | A member joins and finds their footing | M, A | Walk (join link for a new member where the instance allows; otherwise the used-link states) | The invitation opens in the member's language, offers a handle with a live "free" check, a password, and lands on Home; Home tells a newcomer the two first things (strength against the bar; Undetermined); a used or expired link says so kindly. The administrator's side: invite, copy the link, see the invitation raise a queue item (D25). |
| 4 | Connect your own account | A, M | Look | Connect leads with who serves you and what it costs, then the choices; the key form accepts and refuses in words; no pointer to a missing screen (D27); never runs the assistant. |
| 5 | Your ties | A, M | Walk | Add, see and remove a tie; seen only by the member and administrators; no placeholders (F5). |
| 6 | From a problem to a question (home, projects, project, question) | A, M | Walk | Start from a problem, name it, get a project with its title in words (D11), open a question, see where things stand; the project page leads with the work, not its bar; a member not joined sees a kind refusal (D32). |
| 7 | Getting a record: find or ask for it (finder, capture, held, document, request, due-date, help) | A, M | Walk | Find by words and by kind and state; capture from an address, a file and a photograph; the capture result links to the held copy and the document; the document shows its words, grade and note consistently (D6, D15, F1); the file lands under the question; the records-request screens draw the office, the wanted record, the law and the date, with the help page. |
| 8 | Checking a deadline's basis | A, M | Walk | The due date shows how it was worked out, can be confirmed and downloaded. |
| 9 | Checking a claim about the city's performance (calculation, help) | A, M | Walk | A calculation is created, shows its method and sources; the spot-check help reads plainly. |
| 10 | Following a person (people, person, explore) | A, M | Walk | Search and add a person; the person page shows positions and cited facts; "same person?" works or says why not (F9). |
| 11 | Building a timeline | A, M | Walk | Record an event in the two lanes (what they did / what we did) with a cited source; order, edit and withdraw. |
| 12 | Following a money trail | A, M | Walk | Record a money fact with stage and period; trail and reconcile draw in words. |
| 13 | Exploring connections | A, M | Walk | A chain between two records, each step cited and graded, or a plain "no connection found". |
| 14 | A court case or proceeding (proceeding, standard) | A, M | Walk | Register a proceeding; the register, parties and orders draw; a standard is held and found. |
| 15 | From a question to a published case (questions by hand, case-editor, ceremony, docket, held vouching) | A, M | Walk to the ceremony; publish only to a `JOURNEYS …` case on the trial instance | A passage can be cited with a role (D7); a question can be concluded by hand (D8); vouching works (D13); the case is prepared, its checks and disclosures read plainly, the ceremony completes or refuses in words; nothing outward goes to a real outsider. Blocked journeys are the first finding. |
| 16 | A professional lends expertise | A, M | Walk | Declare expertise; an administrator adds it for another; a check by expertise is offered on a question. |
| 17 | Working with the assistant | A, M | Look | The dock and Ask draw their states and refusals in words (D3, D18); the without-assistant search form in Ask works. The assistant itself is not run. |
| 18 | A standing question | A, M | Look | Drawn and explained; not run (needs the assistant). |
| 19 | The daily queue (queue, home to-do, updates) | A, M | Walk | Items are real, each opens the thing to act on and is resolved by the act (D21); empty states are quiet; Updates shows the running release and what is new. |
| 20 | From a knock to the record (doorbell, inbox) | A (and an unsigned visitor) | Walk | An outsider hands material in with no account; it appears in the Inbox; it can be moved into the record; the visitor sees a kind receipt; abuse limits are plain. |
| 21 | A review copy, out and back | A | Walk to the link | A named reviewer gets a revocable link; the outside view works signed out; a comment returns; revoke ends it. |
| 22 | From suspicion to a closed plan (dashboards, plan, action, matter, start-send) | A, M | Walk | The Action dashboard draws status, clocks and the open items; a plan can be opened with subjects and options and no raw `INQ-…` (D19, D20); an action moves; a matter opens and escalates; start-and-send previews before it acts and refuses first in words. Planning help (the assistant) is looked at only. |
| 23 | A source changes after publishing | A | Walk if a published case exists | Watching raises a queue item; a correction or withdrawal is filed in the docket. |
| 24 | Complying with a court order | A | Look | Docket entries and the order's effect draw. |
| 25 | Exchanging cases with other groups (imported) | A | Look | Import screen draws; an import of a sample case is read-only and recreated. |
| 26 | Reading and checking a case (published) | Anyone, signed out | Walk | The public page shows findings, strengths, timeline and people named; "Check the signature" verifies. |
| 27 | Changing the administrators (members, security) | A | Walk | Add and remove an administrator with its guard (the last one cannot be removed); security reads in a plain sentence first. |
| — | Settings and account (settings, account, themes, translations, wizards, notes, more) | A, M | Walk | Every setting saves and shows; light, dark and follow-my-device show the one chosen; translations and wizards read for a founder, not a builder; the phone More tab matches the design. |
| — | Recover and sign in again (forgot, reset, recovery) | A, M | Walk | A recovery code sets a new password; an administrator's reset link works once; used links say so. |

**Out of this lane (reported as "Out", walked later):** anything that needs the assistant to run (journeys 17 and 18's runs, planning help, suggested readings, translation drafts); the installer's fleet step and the update act (they act on a hosting account); PDF reading through `pdf-worker`, the subscription sign-in through `agent-runner` and outbound timestamping, unless the deployed instance shows them working without an assistant run, in which case they are walked and reported.

## 4. Cross-checks carried from the earlier walks (re-walked each round)

Each of the 32 `draft-T49-walk.md` defects (D1–D32) and the walk-085 findings (F1–F11, D1–D18) that touch a non-assistant path is re-walked and its status recorded as FIXED / STILL / NEW in `FINDINGS.md`, so BOB sees which of them the release closed. The ones most likely to block: D1 (own API key), D6 (HTML and text captures have no words), D7 (cite sends no role), D8 (a question can never be concluded), D9 (uploads vanish), D11 (raw project titles), D13 (vouching), D14–D16 (document and Find-in), D21 (bare queue items), D23 (setup says member is first admin), D24 (rate limit), D26 (handle), F3 (Home's member count), F4 (Find shows raw records), F5 (`{handle}` placeholders), F6 (garbled sentences) and walk-085's D1–D8 (weight marks, mixed Members page, jargon).

## 5. Order of the walk

1. Signed out: front, tour, doorbell, forgot, reset, join, setup, an unknown address, sign-in right and wrong (28, 20, 26, recover).
2. Administrator: sign-in, Home, Settings and each settings page, Members, account (28, 1, 2, 3, 5, 19, 27, settings).
3. The investigation by hand, as administrator: project, question, capture (address, file, photograph), held, document, cite, conclude, vouch, find (6, 7, 8, 9, 15).
4. The record's kinds: people, timeline, money, connections, proceeding, standard (10–14).
5. Action: dashboard, plan, request, action, matter, start-and-send (22).
6. Case: case editor, review copy, ceremony, docket, published, import (15, 21, 23–26).
7. Member: sign-in, Home, then 2, 3, 5, 6, 7, 15, 16 as a member, and each hidden-versus-refused check.
8. Both widths and dark are taken on every screen as it is reached, not in a separate pass.

## 6. Severity and the findings record

- **BLOCKS** a journey: the user cannot finish it or cannot do the real work of an investigation.
- **MISLEADS**: the screen is wrong, contradicts itself, says something untrue or shows something raw, so a user is wrong or lost.
- **COSMETIC**: sharpness, spacing, wording that is only ugly.

`FINDINGS.md` entries `J-<n>`: journey and screen, role and width, what the user sees (screenshot), what the design says (`registry` id or journey step, canon section), severity, the owning module where plain (`build/modules.json`), and the status against any earlier D or F number. After each fix round BOB names, the failed journeys are walked again and each entry's status updated; `HANDOFF.md` carries a `W<n>` per report.

## 7. The screens

All 69 screens of the registry, each walked at both widths by the checks in §2 plus its purpose.

| id | name | frame | journeys | what it is for (the registry's words; works = §2 and this) |
| --- | --- | --- | --- | --- |
| `site` | civicsmith.org | setup | 1, 28 | Civicsmith's own website, one site of three pages joined by one menu (Bob's D6, K3060; Outside the instance (civicsmith.org): open only, read as a stranger. |
| `install` | Create your Civicsmith group | setup | 1, 28 | The founder's link and the installer, in order: Installer runs in a Cloudflare account: look only; do not install or update (a refusal is recorded, not worked around). |
| `update` | Update your group's Civicsmith | setup | 1 | The hosting account's holder updates the group's Civicsmith to the signed release chosen in Settings › Updates and no other: Installer runs in a Cloudflare account: look only; do not install or update (a refusal is recorded, not worked around). |
| `front` | Your group's page | public | 3, 28 | The group's own landing page at its address (Bob's D2, K3060): |
| `tour` | How we work, step by step | public | 3 | The walk-through for anyone, offered on the group's page before joining (Bob's D7, K3060): |
| `reset` | Choose a new password | public | 3 | The administrator's one-time reset link opens here: |
| `forgot` | Forgot your password | public | 3 | Getting back in without email: |
| `setup` | Become your group's first administrator | setup | 1, 28 | The founder claims it, choosing their own handle, names the group, reviews offices and seats, offers the assistant and records the hosting account; |
| `group-identity` | Who your group is | working | 2 | Kinds, focus and purpose, and who sees them (DEC-132). |
| `join` | Your invitation | setup | 3, 28 | The invitation link opens here: |
| `home` | Your group's home | working | 3, 6 | The group's nerve center (Bob's S20, DEC-218: |
| `members` | Members | working | 16, 27 | The roster: invitations, capabilities, expertise, administrators, joining through the website. |
| `security` | Security | working | 27 | Administrators only: how hard the group's Civicsmith is being tried over a period they choose, by kind and hour against its usual; |
| `account` | Your account | working | 3, 16 | Handle, password, language, expertise, signing key, theme. |
| `connect` | The assistant | working | 4, 17 | The member's own API key or subscription token, or the group's key where it offers one, or none; |
| `places` | Places and offices | working | 2 | Administrators: the places whose rules apply, the place a group wants that Civicsmith does not hold yet, and the offices and seats the group deals with (setup-page R13; |
| `recovery` | Recovery codes | working | 2 | Every member's own one-time recovery codes (D4, K3060), how many are left, and whether two administrators hold them (credentials R46; |
| `group` | Your group | working | 2 | Administrators: the settings chosen at setup, changeable here: |
| `settings` | Settings | working | 2, 3 | Every setting in one list: |
| `more` | More | working | 2 | The phone's More tab: |
| `updates` | Updates | working | 19 | Administrators: the release the group's Civicsmith runs; |
| `ties` | Your ties | working | 5 | The member's own ties, seen only by them and administrators (K1490). |
| `notes` | Your notes | working | 6 | A member's own notes, seen only by them (DEC-136). |
| `translations` | Translations | working | 3 | The interface's words in the group's languages (DEC-127). |
| `wizards` | Wizards | working | — | The group's wizard library: |
| `projects` | Projects | working | 6 | Every project the member may see, with its owner, questions and stage (projectlist; |
| `theme` | Themes | working | 6 | The group's themes, newest first, searchable by name or test, and declaring one (state a); |
| `dash-action` | The Action dashboard | working | 22 | An area dashboard in three tiers (DEC-214): |
| `dash-project` | A project's dashboard | working | 15 | A project as a dashboard (DEC-214): |
| `unavailable` | Can't open this | working | 3 | An address that leads nowhere, something the member may not see, and the group's Civicsmith out of reach (DEC-201). |
| `elsewhere` | Where else to go | working | 6 | What a member sees when what they need is not Civicsmith's work (wizard-scripts R23's 'elsewhere' route, reached from Home's sixth door and from a door-offered wizard's guide): |
| `queue` | Your queue | working | 19, 23 | To do, Noticed and Status, grouped by case (DEC-110, DEC-131). |
| `finder` | Find | working | 6, 7 | Search what the group holds, or browse it by kind and state with no words; |
| `capture` | Add | working | 6, 7, 9, 15 | Capture a document from an address or a file, photograph a handout, or record what you saw. |
| `held` | Held captures | working | 15 | Captures not yet vouched for, per member and project (DEC-97). |
| `archive` | Archive | working | 15 | A captured ZIP: every file with its state (filed with the archive's grade and held for review, already held, or not filed with its reason); |
| `open-file` | Opening a file | working | 7, 15 | Before a file opens: its risk, the safe view, the deeper check, its checks as notes, and a hold released by two members or a second engine; |
| `document` | Document | working | 7, 15, 23 | One captured document: |
| `find-in` | Find in this | working | 6, 10 | One control on a document, a held set or a project: |
| `project` | Project | working | 6, 9, 15 | A project's home: objective, bar, questions, stage, plans, what the group has at stake here, members. |
| `projectai` | AI for this project | working | — | Who pays for the assistant's work in a project: |
| `question` | Question | working | 6, 9, 15, 16 | A question and what supports it or cuts against it; |
| `answers` | Ask | working | 17, 18 | Ask in plain words (with the assistant) or by search (without); **Needs the assistant: only its screen is drawn and not run.** |
| `assistant` | The assistant panel | dock | 17 | Docked beside the screen it serves; **Needs the assistant: only its screen is drawn and not run.** |
| `people` | People | working | 10, 13 | A directory of the people and organizations the record follows, never the group's own members (Settings › Members): |
| `person` | Person | working | 10 | A person or an organization the record follows: |
| `timeline` | Timeline | working | 11 | What they did and what we did, in two lanes (K1462, K1494); |
| `money` | Money trail | working | 12 | Money facts with stage and period; |
| `calculation` | Calculation | working | 9 | A computed fact with its method, or a member's spreadsheet bound to the record. |
| `help-records` | Help: How a records request works | working | 7 | What your state's public records law requires of the office, your city's faster request where it has one, what the city's portal shows, and what Civicsmith does with a request; |
| `help` | Help: How spot-checks work | working | 9 | A help page: one method explained in plain words, linked from where it is used (Bob, 7 October). |
| `explore` | Explore connections | working | 13 | Chains between a start and an end, each step cited and graded (K1469, K1487). |
| `proceeding` | Proceeding | working | 14 | A court case or regulatory proceeding: |
| `due-date` | How this date was worked out | working | 7, 8 | A due date's basis and counting; |
| `standard` | Standard | working | 6, 14, 22 | A requirement the city set itself, held and searchable. |
| `plan` | Action plan | working | 22 | The approved plan page: |
| `start-send` | Start and send | working | 7, 22 | The bound start-and-send flow: |
| `request` | Request records | working | 7 | A records request: the office by role, what is wanted, the law, the text, approving and recording the send. |
| `action` | Action | working | 7, 22 | One action: replies, deadlines, the law it goes under, its risk tier, pressure, holds; |
| `matter` | Matter | working | 22 | One government act: determination, consequences, escalation, actions. |
| `case-editor` | Case | working | 15, 23 | Prepare the case: scope, statement, what it leaves out, bias, timeline, people named. |
| `review-copy` | Review copy | working | 21 | A named outsider's revocable view of the draft. |
| `ceremony` | Publication ceremony | working | 15, 24 | The required wizard: checks, disclosures, ties confirmed, preview, then signing inside the ceremony (Bob's D9, K3060; |
| `review-outside` | A review copy, from outside | published | 21 | What an outside reviewer sees from a review link: |
| `published` | Published case | published | 26 | The public page: findings, strengths, timeline, people named, evidence; |
| `imported` | Another group's case | imported | 25 | An imported case in its read-only project, recreated finding by finding. |
| `docket` | Docket | working | 23, 24 | The case's public docket: |
| `inbox` | Inbox | working | 20 | Material handed in through the doorbell. |
| `doorbell` | Hand material to the group | public | 20 | The doorbell page for someone outside, with no account. |

## 8. What I need from BOB

- The word that the release with fix round 6 is deployed, and the trial instance's address (not secret) in `HANDOFF.md` or a message.
- Whether publishing in journey 15 may go as far as a published `JOURNEYS …` case on the trial instance, or stops at the ceremony's preview. I will stop at the preview until told.
