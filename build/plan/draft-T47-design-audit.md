# Design audit: design vs built vs planned (T47), screen by screen and journey by journey

Research only, 2026-10-12, for BOB #166 (handoff A4, K3058). Nothing in the repository was changed.

**Sources read**
- Design: branch `origin/claude/gallant-brown-zg0wc1` @ `4803ca7d00` (PR #33, two commits beyond `main` @ `b4dd9d2616`: DEC-200 and N997). `screens/registry.json` (50 screens, read whole, every act), `screens/library.json` (22 wizard scripts, every step), `screens/mock-journeys.js` (27 walked journeys), `screens/mock-screens.js` (50 `SCR` drawings, searched for every auth/recovery/empty/error state), `mock-shell.js` (PATH, rail), `words.json` (1,636 words, searched for auth keys), `journeys.html` (27 journeys + 17 wizards + gaps), `layouts.html` (section list; its screens are the `SCR` set above), `HANDOFF.md`, `DECISIONS.md` DEC-180…DEC-200 whole.
- Built: `build/modules.json`; `bio-plane/src/interface-shell`, `screens-settings`, `screens-intake`, `screens-daily`, `screens-inquiry` (each module's `SCREENS` loaded and its acts listed by script), `setup-page`, `control-plane/app.mjs`, `credentials` requirements (R1, R3–R5, R38, R39, R46, R47), `installer` requirements, `interface-shell` requirements R3, R12, R25, R28–R30.
- Planned: `build/plan/current.md` (T47, L11 = T47-47…T47-66, -73…-75, -77), `build/plan/next.md` N997, N999–N1006, `build/plan/draft-T47-interface.md` §5–§6 (Q1–Q3), `build/handoff.md`, rulings K3041, K3051–K3058.
- Mail: `origin/mail/BOB` B155–B159; `origin/mail/UX-DESIGN` U160–U181 (last entry U181; Read cursor "handled BOB B157").

Legend: **Drawn** = on the layouts page (PR #33) as a screen or state. **Built** = in `/app` (live 0.83.0 = `main` @ `b4dd9d2616`). **T47** = the T47 entry that builds it (or "next.md only" when it exists only as a next.md entry not yet folded into T47's entries).

---

## 0. Headline findings

1. **B158 and B159 are unanswered.** The design session's last entry is U181 (N997 drawn); its Read cursor stops at B157. Nothing in PR #33 draws the front door, sign-in, sign-out, expiry, forgotten password, the founder's link page, the installer's real steps or the hand-over.
2. **Built: 17 of 50 registry screens, 5 of them missing registry acts** (against PR #33's registry): `capture` (no `monitorset`), `home` (no `startfrom`, so none of the five "What happened?" doors), `project` (no `drawquestion`, `projectbarset`), `question` (no `sever`, `reinstate`), `document` (no `monitorset`). The handoff's "6 partly" was counted against `main`'s 48-screen registry (K3051); the sixth effective partial is `connect`, built act-complete but not working (Bob, K3053; N1001).
3. **T47 plans 27 more screens (to 44 of 50).** The six left are exactly the founder's and newcomer's path plus two admin screens: `install`, `setup`, `join`, `places`, `recovery`, `help`. They exist only as next.md N1005/N997 (and N1003 for the installer), not as T47 entries.
4. **The whole start of the product is undesigned or old.** A visitor to `/` meets the old setup page; the founder installs through the old newgroup page, claims and sets up on the old setup page; an invitation link opens the old setup page's enrolment; sign-in is the old setup page; sign-out and an expired session drop the member on the old setup page with no message; a forgotten password has **no path at all** (the `recover` op, credentials R47, is served but no page, old or new, calls it; members have no recovery at all).
5. **The design contradicts built requirements in four places** (each must be settled before building): the free Cloudflare plan (design: "the free plan works"; installer R6 refuses Free, R7 needs a payment method); the installer's last page (design shows a "Member key"; installer R16 since T36 shows none); where places are chosen (installer R21 at install; design at setup); the setup page's assistant text ("Administrators see spending by member", contradicting DEC-188 (5)).
6. **Screens a journey needs that the registry lacks:** front door, sign-in, sign-out, expired session, forgotten password (two kinds), founder's link page, installer progress and refusals, hand-over, the claim's recovery codes, setup's finish, join by reusable join link and its dead-link states, Home's empty state and welcome offer, **Group settings** (rename, website, languages, court notice, hosting account, the group's bar: after setup they live only on the old setup page), Projects list, People list (Q2), the outside reviewer's view of a review copy, the browser signing hand-over (Q4), the installer's update page.

---

## 1. Screen table

### 1a. The 50 registry screens

| # | screen (id) | Drawn | Built (`/app`) | Planned in T47 | Gap |
|---|---|---|---|---|---|
| 1 | Install Civicsmith (`install`) | partly: one page (prerequisites, short name, self-test, one-time password); no Cloudflare permission step, no progress page, no refusal states, no update page | no: the old newgroup Worker page (`newgroup/src/ui.mjs`) | no (next.md N1003, N1005) | B159 unanswered; conflicts with installer R6/R7 (free plan), R16 (no member key), R21 (places at install) |
| 2 | Become your group's first administrator (`setup`) | yes: 7 parts (claim, name/website, places/languages, offices, people, assistant, court, administrators, security tools) | no: old setup page at `/` | no (N1005, N1002) | no recovery codes shown at claim (setup-page R29), no "setup finished, go to Home" end; stale words: "Administrators see spending by member" (DEC-188 (5)), "safe-copy maker" (DEC-200 (5)) |
| 3 | Who your group is (`group-identity`) | yes | no (old setup page section) | T47-58 (screens-settings R14) | none beyond the build |
| 4 | Your invitation (`join`) | yes: one state (live invitation; handle free/taken/not allowed) | no: old setup page's enrolment (`invitelook`, `joinlinkinvite`, `enroll`) | no (N1005) | not drawn: the reusable join link variant, an expired/used/withdrawn link, sign-in paused, "already a member? sign in", where Join lands |
| 5 | Your group's home (`home`) | yes (one state: busy group) | **partly**: no `startfrom`, so no "What happened?" doors | T47-60 (startfrom through T47-57), N972 counts | not drawn: empty group, newly joined member, welcome-wizard offer (Q1) |
| 6 | Members (`members`) | yes, with "More for administrators" (DEC-200) | yes (15/15 acts) | T47-58 touch | built lacks links to Places and Recovery (unplanned) |
| 7 | Security (`security`) | yes | no (old setup page) | T47-58 (R15) | none |
| 8 | Your account (`account`) | yes | yes (6/6) | none needed | not drawn or built: "Sign out everywhere" (credentials R39 `signOutEverywhere`) |
| 9 | The assistant (`connect`) | yes | yes (8/8) but **does not work** (Bob tried, K3053) | N1001 (trace + logging), T47-58 `part_signin` | functional, not design: diagnose |
| 10 | Places and offices (`places`) | yes (DEC-200 (8), new) | no (old setup page) | no (N997 → N1005) | unplanned |
| 11 | Recovery codes (`recovery`) | yes (new) | no (old setup page) | no (N997 → N1005) | unplanned |
| 12 | Your ties (`ties`) | yes | no | T47-62 | none |
| 13 | Your notes (`notes`) | yes | yes (5/5) | — | none |
| 14 | Translations (`translations`) | yes | no (old setup page) | T47-58 (R16) | none |
| 15 | Wizards (`wizards`) | yes | no | T47-57 | runner, dock guide |
| 16 | Your queue (`queue`) | yes | yes (11/11) | T47-73 server instant | none |
| 17 | Find (`finder`) | yes | yes (6/6) | — | none |
| 18 | Add (`capture`) | yes | **partly**: no `monitorset` ("Watch this address") | T47-45 (op) + T47-59 ("monitor from Add") | none once built |
| 19 | Held captures (`held`) | yes | yes (4/4) | T47-59 (grade, thumbnail, set-aside list) | none |
| 20 | Archive (`archive`) | yes | no | T47-59 | none |
| 21 | Opening a file (`open-file`) | yes | yes (5/5) | — | none |
| 22 | Document (`document`) | yes | **partly**: no `monitorset` ("Watch for changes") | T47-45 serves the op; **no screens entry names it on Document** (T47-61 omits it) | add to T47-61 |
| 23 | Find in this (`find-in`) | yes | yes (9/9) | — | none |
| 24 | Project (`project`) | yes | **partly**: no `drawquestion`, `projectbarset` | T47-17, T47-19 (ops) + T47-61 | none once built; no Projects list screen exists to reach a project from the rail |
| 25 | AI for this project (`projectai`) | yes | no | T47-61 (R14) | `projectaikeepaway` still owed (DEC-188) |
| 26 | Question (`question`) | yes | **partly**: no `sever`, `reinstate` | T47-17 (N977) + T47-61 | none |
| 27 | Ask (`answers`) | yes | yes (5/5) | — | none |
| 28 | The assistant panel (`assistant`, dock) | yes | yes (3/3) | T47-61 (N955 dock credential) | depends on connect working |
| 29 | Person (`person`) | yes | no | T47-62 | People place opens Find (R29) pending Bob's Q2 |
| 30 | Timeline (`timeline`) | yes | no | T47-62 | none |
| 31 | Money trail (`money`) | yes | no | T47-62 | none |
| 32 | Calculation (`calculation`) | yes | no | T47-62 | none |
| 33 | Help: How spot-checks work (`help`) | yes | no | no (N997 → N1005; no module) | unplanned, no module |
| 34 | Explore connections (`explore`) | yes | no | T47-62 | none |
| 35 | Proceeding (`proceeding`) | yes | no | T47-62 | none |
| 36 | How this date was worked out (`due-date`) | yes | no | T47-62 | none |
| 37 | Standard (`standard`) | yes | no | T47-62 | none |
| 38 | Action plan (`plan`) | yes | no | T47-64 | "v0.2 constructs drawn by L11's START" |
| 39 | Start and send (`start-send`) | yes | no | T47-64 | none |
| 40 | Request records (`request`) | yes | no | T47-64 | none |
| 41 | Action (`action`) | yes | no | T47-64 | none |
| 42 | Matter (`matter`) | yes | no | T47-64 | none |
| 43 | Case (`case-editor`) | yes | no | T47-63 | needs T47-53 (statementack in SESSION_OPS) |
| 44 | Review copy (`review-copy`) | yes (the member's side only) | no | T47-63 | **the outside reviewer's own page is not drawn** |
| 45 | Publication ceremony (`ceremony`) | yes (incl. Photos gate) | no | T47-63 | browser signing hand-over undrawn (Q4) |
| 46 | Published case (`published`, public) | yes | no in `/app` (legacy-ui's public page today) | T47-63 (R30 public frame) | Bob's Q3 open |
| 47 | Another group's case (`imported`) | yes | no | T47-63 | none |
| 48 | Docket (`docket`) | yes | no | T47-63 | none |
| 49 | Inbox (`inbox`) | yes | yes (3/3) | T47-59 (a knock's card, `sourcelink` without ids) | none |
| 50 | Hand material to the group (`doorbell`, public) | yes | no in `/app` (legacy page) | T47-63 (R30) | none |

Totals: drawn 50 (install partly); built 17 (12 complete, 5 missing acts; connect not working); planned in T47 27; unplanned 6 (`install`, `setup`, `join`, `places`, `recovery`, `help`).

### 1b. Screens a journey needs that are not in the registry

| screen or state | Drawn | Built | Planned | Gap |
|---|---|---|---|---|
| **Front door at `/`** (visitor not signed in) | no | `/` = old setup page for everyone; `/` never forwards a signed-in visitor (setup-page R32) | next.md N999 (not a T47 entry) | Bob's question A below; B158 (1) |
| **Sign in** (administrator and member) | no | old setup page: one form, "leave the name empty for the administrator" (`op=login`) | N999, N1005 | B158 (2); no words (`refusal.SIGN_IN_REFUSED`, `SIGN_IN_PAUSED` not in words.json) |
| **Sign out** | no (the mock's avatar opens Your account; no menu) | yes, undesigned: shell menu "Sign out" (`shell.signout`), then to `/` (old page) | N999, N1005 | B158 (3); where it lands; "sign out everywhere" (R39) offered nowhere |
| **Session expired** | no | silent: on a 401 the shell clears the record and goes to `/` (old page); session is per tab (`sessionStorage`), 12 h (`login` ttl 43200) | N999 (session across tabs) | B158 (3); Bob's question C (length, "this device") |
| **Forgotten password, administrator** (recovery code) | no (Recovery codes screen shows codes; no screen uses one) | **no page calls `recover`** (credentials R47 served, unreachable) | N1005 | B158 (4) |
| **Forgotten password, member** (no codes) | no | no requirement, no op | none | Bob's question B; B158 (4) |
| **Founder's link page** ("Create your new Civicsmith group") | no | no | N1003 | B159; Bob's question E (where it lives) |
| **Installer: Cloudflare permission step** (OAuth on Cloudflare's page, return) | no | old newgroup page (`/begin`, `/callback`) | N1003 | B159 |
| **Installer: progress and refusals** (fresh, plan, r2, rel, gen, install, fleet, bind, addr, verify; Workers Paid needed, payment method needed, a copy already in the account R32, Logpush R46, images not pullable R23) | no (only a 3-row "Testing itself" sheet) | old newgroup page | N1003 | B159 |
| **Installer: update page** (`/update`) | no | old newgroup page | none | an administrator's journey with no design or plan |
| **Hand-over** installer → setup at the group's address | a button only ("Continue: become the first administrator") | installer R16 hands over with the one-time password in the fragment to `/` (old setup page) | N1003, N1005 | must land on `/app/setup` (or the front door's claim state) |
| **Claim's recovery codes shown once** (setup-page R29) | no (setup design omits them) | old setup page | N1005 | add to `setup` |
| **Setup finished → Home** | no | old setup page stays | N1005 | the founder's first view of `/app` |
| **Join by reusable join link** (`joinlinkinvite`) and dead-link states | no | old setup page | N1005 | B158 asks; part of `join` |
| **Home empty / first-visit states** (new group, new member, welcome offer) | no | Home draws whatever the reads answer | none | Q1 (Bob); empty state design's |
| **Group settings** (group name, website `groupdomainset`, languages, court notice `courtnoticeset`, hosting account `hostingaccessset`, the group's bar `strengthbarset`, logo) | no registry screen after setup | old setup page (interface-shell R25/R28 "Group settings" link to `/`) | T47-56 keeps "Group settings" → old setup page; N1002 wants it gone | undrawn screen; DEC-200 (3) itself says `strengthbarset` waits for "the group settings screen that will draw it" |
| **Settings index** (the Settings place) | no (mock has no Settings landing) | shell's own list (R28) | T47-56 | design's |
| **Projects list** (the Projects place) | no | rail opens `project`; no list | none (`projectlist` read exists, help given DEC-200 (6)) | undrawn |
| **People list** (the People place) | no | "comes later" (R7) | T47-56 (R29: Find over people) pending Bob's Q2 | Q2 |
| **Outside reviewer's view** of a review copy (no account; journey 21) | no | legacy | none | undrawn |
| **Browser signing** (ceremony "Sign with your key", `publishat`, `docketpost` → `/sign`) | no hand-over drawn | `/sign` (signatures R31) is a separate page | T47-63, Q4 | Bob's Q4 |
| **Group's public page** (DEC-132's "public page": who the group is, published cases, doorbell) | no | legacy | none | overlaps the front door (question A) |
| **Not found / not yours / offline / plane unreachable** | no (kit has refusal rows and read states, R10) | shell's generic states | none | design's |

---

## 2. Journey walk

Each step: the screen serving it · Drawn / Built / Planned. **BREAK** marks where a real user meets an old page, a dead end, or nothing.

### J-A. Arrive at the group's address `/`
| step | screen | D | B | P |
|---|---|---|---|---|
| A stranger, a member or the founder opens `https://<group>.workers.dev/` | front door | no | old setup page | N999 |
| A signed-in member opens `/` in a new tab | front door → Home | no | old setup page; session not shared across tabs | N999 |
**BREAK at step 1 for everyone:** the old page. Undesigned, unplanned in T47's entries.

### J-B. Founder: link → install → hand-over → setup (journey 1, wizard "Set up and claim")
| step | screen | D | B | P |
|---|---|---|---|---|
| 1 Clicks "Create your new Civicsmith group" | founder's link page | no | no | N1003 |
| 2 Reads what is needed (Cloudflare account, ~20 min; plan) | `install` | yes, but says the free plan works | old newgroup page; R6 refuses Free | N1003 |
| 3 Chooses the short name (Irreversible) | `install` `bootstrap` | yes | old page | N1003 |
| 4 Grants Cloudflare permission on Cloudflare's page; returns | — | no | old page; OAuth client lacks `connectivity-directory.bind` (K2164, Bob's dashboard act) | N1003 |
| 5 Watches the install's steps; any refusal | install progress | no (3 rows) | old page | N1003 |
| 6 Self-test (`selftest`) | `install` | yes | old page | N1003 |
| 7 Saves the one-time password; reads the hosting-account warning | `install` | yes (with a "Member key" the installer no longer issues) | old page (R16, R34) | N1003 |
| 8 Continues to the group's address | hand-over | button only | fragment to `/` = old setup page | N1003, N1005 |
| 9 Claims, chooses a password | `setup` `claim` | yes | old setup page | N1005 |
| 10 Saves recovery codes (shown once) | — | no | old setup page (R29) | N1005 |
| 11 Names the group, logo, website | `setup` | yes | old | N1005 |
| 12 Places and languages; "Other" | `setup` | yes | old | N1005 |
| 13 Reviews offices and seats | `setup` | yes | old | N1005 |
| 14 Reads who sees what about people | `setup` | yes | old | N1005 |
| 15 Keep-away; the group's API key | `setup` | yes (one stale sentence) | old | N1005 |
| 16 Court notice | `setup` | yes | old | N1005 |
| 17 Hosting account recorded | `setup` | yes | old | N1005 |
| 18 Invite first members / a second administrator | `setup` → `members` | yes | old setup page; `/app` Members built | — |
| 19 Optional: who your group is | `group-identity` | yes | old | T47-58 |
| 20 Setup finished → the group's Home | — | no | the founder stays on the old page; `/app` reachable by link (founder admitted, K3051) | N1005 |
**BREAKs:** steps 1, 4, 5 (undrawn); every step from 2 to 17 on old pages; step 10 and 20 undrawn; four design/requirement conflicts (free plan, member key, places at install vs setup, spending-by-member sentence).

### J-C. Inviting a member (wizard "Invite a member")
| step | screen | D | B | P |
|---|---|---|---|---|
| 1 Short id, cover | `members` `memberadd` | yes | yes | — |
| 2 Capabilities | `members` `membercaps` | yes | yes | — |
| 3 Copy the link, send it yourself | `members` | yes | yes (link shown once) | — |
| 4 Or a website key / join link | `members` | yes | yes | — |
Works in `/app`. **BREAK downstream:** the link the member receives opens the old setup page (J-D).

### J-D. A member joins (journey 3, wizard "Welcome a new member")
| step | screen | D | B | P |
|---|---|---|---|---|
| 1 Opens the invitation (or the join link) | `join` `invitelook` | invitation yes; join link no; dead link no | old setup page | N1005 |
| 2 Chooses language | `join` | yes | old | N1005 |
| 3 Handle (checked as typed, fixed for good, DEC-197) | `join` `handlecheck` | yes | old | N1005 |
| 4 Password | `join` `enroll` | yes | old | N1005 |
| 5 Lands on Home | `home` | not drawn as a first visit | `/app/home` exists, but how the old page hands over is undesigned | N1005 |
| 6 Two things to know (strength, Undetermined) | `question` (wizard step) | yes | question built; no wizard runner | T47-57 |
| 7 Optional: connect Claude | `connect` | yes | built, does not work | N1001 |
| 8 Optional: ties | `ties` | yes | no | T47-62 |
| 9 First step: Start from… | `home` `startfrom` | yes | no | T47-60 |
**BREAKs:** 1–4 old page; 5 undesigned hand-over; the welcome wizard itself needs T47-57 and Bob's Q1; 7 broken; 9 not built.

### J-E. Sign in (returning member or administrator)
| step | screen | D | B | P |
|---|---|---|---|---|
| Opens the address | front door | no | old page | N999 |
| Signs in (handle + password; administrator?) | sign-in | no | old page (empty name = administrator) | N999, N1005 |
| Refused / paused (`SIGN_IN_REFUSED`, `SIGN_IN_PAUSED`) | sign-in states | no; no words | old page | — |
| Lands on Home | `home` | yes | yes | — |
**BREAK:** everything before Home.

### J-F. Sign out
| step | screen | D | B | P |
|---|---|---|---|---|
| Chooses Sign out | member menu | no | shell menu item | N999 |
| Signed-out confirmation | — | no | sent to `/` (old page) | N999 |
| Sign out on every device | `account` | no | op served (R39), no act | none |
**BREAK:** lands on the old page; no "sign out everywhere".

### J-G. Session expiry (12 h, or a password changed elsewhere ends other sessions, DEC-183 (7))
| step | screen | D | B | P |
|---|---|---|---|---|
| The next request answers 401 | — | no | silent jump to `/` (old page), place and any typed text lost | N999 |
| Signs in again and returns to where they were | — | no | no | none |
**BREAK:** no message, old page, lost place. Also: a second tab is signed out by design today (`sessionStorage`).

### J-H. Forgotten password
| step | screen | D | B | P |
|---|---|---|---|---|
| Administrator: "Forgot your password?" → recovery code + new password (`recover`) → sign in | — | no | **unreachable** (op served, no page) | N1005 |
| Founder before claiming: lost one-time password → hosting account sets a new one | `setup` help text | words only | installer/Cloudflare dashboard | — |
| Member (holds no codes): ? | — | no | no op, no requirement | none |
| An administrator whose codes are spent and no second administrator | — | no | only the hosting account | none |
**BREAK:** total. Members locked out have no path at all.

### J-I. Home (journey 6's door, D52 "What happened?")
| step | screen | D | B | P |
|---|---|---|---|---|
| Sees group name, purpose, waiting on you, what the group works on | `home` | yes (busy state) | yes | T47-60 counts/stages |
| Picks one of five doors → offered wizards | `home` `startfrom` → wizard runner | yes | no | T47-60, T47-57 |
| Starts a project | `home` `promote` | yes | yes | — |
| Empty group / no projects / first visit | — | no | whatever the reads answer | none |

### J-J. A member's first work (journey 6 "From a problem to a question")
| step | screen | D | B | P |
|---|---|---|---|---|
| "A problem I live with" | `home` `startfrom` | yes | no | T47-60 |
| Writes a private note | `notes` | yes | yes | — |
| Records what they saw (testify) | `capture` | yes | yes | — |
| Asks the assistant (AI) / searches (no AI) | `answers` / `finder` | yes | yes (AI path broken with connect) | N1001 |
| Find in this | `find-in` | yes | yes | — |
| Holds the standard | `standard` | yes | no | T47-62 |
| Opens a question in a project | `project` | yes | yes | — |
| Asks for records | `request` | yes | no | T47-64 |
Works in `/app` for 5 of 8 steps today; the door (step 1) is not built.

### J-K. Account settings, incl. Claude connect (journeys 4, 16)
| step | screen | D | B | P |
|---|---|---|---|---|
| Language, information level, expertise, password, signing key | `account` | yes | yes | — |
| Handle shown fixed | `account` | yes | yes | — |
| Ties | `ties` | yes | no | T47-62 |
| Connect: disclosure; subscription sign-in code or API key; limits; uses; disconnect | `connect` | yes | built, **fails** (K3053) | N1001 |
| Group's key notice | `connect` | yes | yes | — |

### J-L. Functional areas: main journeys
| journey | screens (in order) | Drawn | Built today | Planned | Break |
|---|---|---|---|---|---|
| 7 Get a record | finder, capture, request ×6, due-date | yes | finder, capture | request T47-64, due-date T47-62 | ends after capture until T47 |
| 8 Deadline basis | action, due-date, queue | yes | queue | action T47-64, due-date T47-62 | — |
| 9 Check a claim | capture, document, project, question, finder, calculation ×2, capture, question; help | yes | capture, document, project, question, finder | calculation T47-62; **help unplanned** | spot-check help |
| 10 Following a person | document, find-in, person ×4 (+dock) | yes | document, find-in | person T47-62; People place Q2 | — |
| 11 Timeline | timeline ×5 | yes | — | T47-62 | — |
| 12 Money | capture, money ×4 | yes | capture | T47-62 | — |
| 13 Explore | person, explore ×4 | yes | — | T47-62 | — |
| 14 Proceeding | capture, proceeding ×4 | yes | capture | T47-62 | — |
| 15 Question → published case | capture, held, project, question ×2, case-editor, review-copy, ceremony, published | yes | capture, held, project, question | T47-63 | Q3, Q4; reviewer's page undrawn |
| 16 Expertise | account, members, question, calculation | yes | account, members, question | calculation T47-62 | — |
| 17 Assistant | question+dock, answers, project, assistant | yes | all | — | connect broken |
| 18 Standing question | answers, queue | yes | yes | — | — |
| 19 Daily queue | queue | yes | yes | — | — |
| 20 Knock → record | doorbell, inbox | yes | inbox | doorbell T47-63 | doorbell legacy today |
| 21 Review copy | review-copy, ceremony | member side | — | T47-63 | **outside reviewer's view undrawn** |
| 22 Suspicion → closed plan | question, plan ×4, start-send, action, matter, plan | yes | question | T47-64 | — |
| 23 Source changes after publishing | queue, case-editor, docket | yes | queue | T47-63 | — |
| 24 Court order | capture, docket, ceremony | yes | capture | T47-63 | — |
| 25 Exchange cases | imported ×4 | yes | — | T47-63 | — |
| 26 Reading a case (public) | published | yes | legacy | T47-63 | Q3 |
| 27 Changing administrators | members | yes | yes | — | — |
| 2 Who the group is | group-identity | yes | old setup page | T47-58 | — |
| Administration: security, translations, places, recovery, group settings, update | security, translations, places, recovery, —, — | 4 of 6 | old setup page / installer | security, translations T47-58; places, recovery N1005; group settings, update none | **group settings and update undrawn** |

---

## 3. Design questions still open

### 3a. Bob's (UX, policy or doctrine), each with options and a recommendation

**A. What a visitor who is not signed in sees at the group's address.**
Issue: `/` is the true front door; members, the founder, strangers and reporters all arrive there. Some groups want to stay unnamed (DEC-132: who the group is is members-only by default).
- A1: a sign-in page only, showing the group's name (or only the short name for an unnamed group).
- A2: the group's public page (name, purpose if public, published cases, "Hand material to the group"), with "Members: sign in".
- A3: a sign-in page that also links to the group's published cases and its doorbell when the group has them, and shows its purpose only if the group made it public.
Recommendation: **A3**: members get straight to sign-in, outsiders still find published cases and the doorbell, and an unnamed group reveals nothing it did not choose to.

**B. How a member who forgot their password gets back in.** Civicsmith sends no email, and only administrators hold recovery codes (credentials R46, R47).
- B1: an administrator issues a one-time reset link for that member (like an invitation: works once, expires in 7 days, sent by the administrator), and the member chooses a new password; every other session ends.
- B2: every member holds recovery codes too, shown once at joining.
- B3: both.
Recommendation: **B1**: it matches how members join, needs nothing the member must keep, and leaves the record (who reset whom, when). Administrators keep their codes; a sole administrator without codes falls back to the hosting account.

**C. How long a sign-in lasts.** Today 12 hours, one tab (K3052 settled "kept across tabs").
- C1: 12 hours on every device, across tabs.
- C2: a choice at sign-in, "Keep me signed in on this device" (e.g. 30 days) vs a public/shared computer (ends when the browser closes).
- C3: short sessions (e.g. 12 h) always, renewed while active.
Recommendation: **C2**: members on their own phone are not asked to sign in twice a day, a shared library computer is safe; on expiry the member sees why and returns to where they were.

**D. The free Cloudflare plan.** The design, the journeys page and Bob's earlier B41 (K1536/K1537) say a group can start on the free plan; installer R6/R7 refuse Free and need a payment method; the built-in file scanner and safe view are containers that need Workers Paid.
- D1: require Workers Paid (as built); the design says so.
- D2: allow Free, stating what is missing (no file scanner, no safe view so high-risk files never open, no subscription sign-in, no spreadsheet recomputation).
Recommendation: **D1** for the first public release (a group without the scanner is a weaker, riskier product; $5 a month is stated up front), unless BOB finds Free installs work end to end. BOB checks the facts first; the choice is Bob's.

**E. Where the founder's link lives and what its page says.**
- E1: on Civicsmith's own website (believeinoakland), leading to the installer.
- E2: the installer's own first page is the link page ("Create your new Civicsmith group": what it is, what you need, Start).
Recommendation: **E2**: one page fewer, and the installer already must name Civicsmith and the publisher (installer R22, R42).

**Q1–Q4 (K3041, N1006; asked, unanswered):** Q1 the welcome wizard's entry (rec. A: offered at the top of Home until finished or stopped); Q2 what People opens (rec. A: Find over the people the record follows); Q3 where readers see a published case (rec. A: `/app/published/<case>` beside legacy-ui's until legacy-ui's future is decided; under K3052 "no user meets an old interface", **B, the new page replaces legacy-ui's, now fits better**); Q4 signing in the new interface (rec.: the ceremony opens the signing page in a new tab and takes the signature back, drawn as a step of the ceremony, so nobody meets an unexplained page).

**Later (S20, not now):** the dashboards re-centre (B141, K2803); deliberately after the clean current system (K3053).

### 3b. The design stream's own (draw and decide, report to Bob)
1. Front door, sign-in (administrator and member in one form; refusal and paused states), sign-out landing, expired session (message and return to place), forgotten password (administrator by code; member per B), "Sign out everywhere" on Your account.
2. Founder's link page; install as a sequence: before you start, short name, Cloudflare permission (and back), progress with every step and each refusal, self-test, one-time password; the update page; the hand-over to `/app/setup`.
3. Setup: recovery codes shown once after the claim; "setup finished" → Home; fix "Administrators see spending by member" (DEC-188 (5)) and "safe-copy maker" (DEC-200 (5)); drop the install page's "Member key" (installer R16); settle places at install (installer R21) vs at setup.
4. Join: reusable join link variant; expired, used, withdrawn invitation; paused; "already a member? sign in"; after Join, the member is signed in and lands on Home with the welcome offer.
5. Home: empty group, first member visit, welcome offer (Q1).
6. Group settings screen (name, logo, website, languages, court notice, hosting account, the group's bar), so the old setup page has nothing left (N1002).
7. Projects list; Settings index; People (Q2).
8. The outside reviewer's view of a review copy (journey 21).
9. Not found, not yours, offline/unreachable states in the shell.
10. Document's `monitorset` is drawn; tell BOB it is missing from T47-61.
11. Re-sync the journeys page (5 October; frozen on the secondary account): it still says the free plan works, a handle can be changed until published (DEC-197 fixed it), and members set a daily limit an administrator may lower (DEC-188).

### 3c. Words missing (words.json has none of these keys)
`refusal.SIGN_IN_REFUSED`, `SIGN_IN_PAUSED`, `RECOVERY_REFUSED`, `NOT_SIGNED_IN`, `PASSWORD_TOO_SHORT`, `CURRENT_PASSWORD_WRONG`, `ALREADY_CLAIMED`, the invitation and join-link refusals, `shell.signout` (the built shell holds its own), `act.login.*`, `act.recover.*`, `act.signout.*`; every sign-in, expiry, recovery and front-door sentence; the installer's step lines and refusals (installer R40 holds them in the module's own words); the founder's link page.

---

## 4. B158 and B159

- **Not answered.** UX-DESIGN's outbox ends at U181 (N997 drawn, 14:15 UTC on 12 October); its Read line says "handled BOB B157". PR #33's head (`4803ca7d00`) draws none of B158's five screens or B159's founder path.
- **What remains, all of it:** B158 (a) draw the front door, sign-in, sign-out and expiry, forgotten password (recovery code, and a member with none), the hand-over from the installer into setup; (b) walk every journey from arrival to its end and name every other missing screen or state (errors, empty states, offline, a refused act). B159: the founder's link page, every installer step as `install` plus any missing steps, the hand-over, the front door, sign-in, sign-out, inviting, joining, a new member's first settings and first piece of work, as one walked journey. Section 3b above is a ready list of what that answer must contain.
- **Before the design can finish it, Bob must answer** A (front door), B (member's forgotten password), C (session length), D (free plan; BOB checks facts first), E (link page), and Q1–Q4.
- **Account note:** the design session runs on Bob's primary account (paused for tokens, K3054); BOB #166 is on the secondary and cannot ring it. Per the handoff (A3), Bob nudges that session; nothing from N999/N1002/N1003/N1005 can be folded into T47's L11 until it answers.
