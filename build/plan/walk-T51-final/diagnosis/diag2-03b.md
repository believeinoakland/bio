# Diagnosis of the BROKEN rows of the FINAL record 03-projects (WALK-FINAL-03 #1, 229 rows, 34 BROKEN)

Read: record `prep/final-03-projects` at c10b729675 (`build/plan/archive/walk-T51-final/03-projects.md`, 284 lines, 118 KB, read whole); product read in the detached worktree `/home/user/wt-diag` at 49f2e85a98 (tranche/T51). Also read whole: `diag2-020305.md`, `fix-round-10-T51.md`; grepped `diag-04/09/10a-05`, `diag2-04/07/08/0910a/10b`, `later-ux.md`/`next.md` (N1263). Probes run (one at a time, then deleted; no tracked file changed): `project-roster` via its fixture `w.ops(...)` with `by` bare and in the door's form. Browser facts (pixels, wall times) are the walker's; mine are code reads and the two probes, marked as such.

Paths: a module's code is `bio-plane/src/<module>/`, its tests `bio-plane/test/m/<module>/` (modules.json: `paths`, `tests`, for every module named here).

## Summary table

| # | Record | Rows | Verdict | Owning module | One-line cause |
|---|---|---|---|---|---|
| 1 | 03 | R24 member sets the project's stake (refused though joined and owner) | DEFECT (MAJOR) | project-roster | the door stamps `by` as `member:ben` (viewer form); `projectStakeSet` prefixes `member:` again, so the joined member reads as `member:member:ben`; same in `projectScopeSet`/`projectApprovalSet` (probe) |
| 2 | 03 | R24 malformed stake refused in the TEAM's stake words | DEFECT (MINOR) | screens-inquiry | the `projectstakeset` act has no `refusals` map; the shell draws `refusal.STAKE_MALFORMED` (team's) before the answer's `translation` (project's); screens-inquiry R53 names `.project` |
| 3 | 03 | R25 requester not told the owners' answer | DEFECT (MAJOR) + REQUIREMENT GAP | screens-inquiry | project page draws only a request with `state === "open"`; the declined state, date (directory `request`) and word (`projectrequests` own list) are read nowhere |
| 4 | 03 | R25 Decline/Grant offers no place for "any word you add" | DEFECT (MAJOR, rides on 3) | screens-daily | Queue's and Home's `projectrequestanswer` send `{projectId, handle, answer}`; `comment`, which the op accepts, is never offered |
| 5 | 03 | R21 (x2) "What you answered" empty after a join answer | SPECIFIED as built + REQUIREMENT GAP | queue | queue R59 lists four row kinds; a join answer is none; the data (`closed_by`, `closed_at`, `state`) is in project-roster |
| 6 | 03 | R25 plain member's "Ask to leave" gives no receipt, owners not told | DEFECT (MAJOR) + REQUIREMENT GAP | screens-inquiry (then queue-producers) | state `leaving` is recorded; the page draws nothing for it (member or owner row), and no queue item exists for owners |
| 7 | 03 | R25 rescue act not drawn for an administrator | DEFECT (MAJOR) | screens-inquiry | page reads `aff.value.roster.rescue_open`; `op=affordances` answers no `roster` key (the rescue is in `acts`); tests fabricate the key |
| 8 | 03 | R218 second owner's bar save silently overwrites | DEFECT (MAJOR) + REQUIREMENT GAP | strength | `projectBarSet` reads the head at write time (`base: head.bundleSha`), never the base the writer saw; no stale outcome exists |
| 9 | 03 | R25 fork form: "Hidden" preselected | SPECIFIED (conflicts with overlay 7 / DEC-77) | screens-inquiry (+ screens-daily R30) | screens-inquiry R29 and screens-daily R30 both say "hidden preselected" |
| 10 | 03 | R25 fork fields drawn for a member without the act | DEFECT (MINOR) | screens-inquiry | title field and choice are drawn on `joined`; only the button is gated |
| 11 | 03 | R26 a member's own aspiration not on the owner's page | SPECIFIED as built + REQUIREMENT GAP | screens-inquiry R106 / intent | the read asks `member: <viewer>` only; no read lists other members' aspirations |
| 12 | 03 | R26 retired aspiration, its dead ends and lesson no longer drawn | DEFECT (MINOR) + READ GAP | screens-inquiry; intent | page draws `aspirationsFor` (held only); nothing lists retired ones though intent R11 says they stay readable |
| 13 | 03 | R26 goal link answers with no receipt | DEFECT (MINOR) | screens-inquiry | goal rows never draw `g.objectives` (project, by, at) that `goalread` holds |
| 14 | 03 | R26 declarer "The team's founder" vs "ross" | DEFECT (MINOR) | screens-inquiry | objective screen calls `P.who(cs, author)` without the `founder` handle argument (R46) |
| 15 | 03 | R27 theme page has no id-typing placement controls | SPECIFIED (map expectation) | screens-investigate | R31 lists the acts and where they sit; placing is the Document page's act |
| 16 | 03 | R27 outsider told nothing is withheld | SPECIFIED (conflicts with overlay 2) | connections (R44) / screens-investigate (R31) | R44: a placement the viewer cannot see "is omitted, not counted and not labelled" |
| 17 | 03 | R27 Find with a theme draws the raw document id | DEFECT (MINOR) | screens-daily | finder reads `p.document.title`, but `themeread` answers `document` as the bundle id string |
| 18 | 03 | R130 roster has no projects column | REQUIREMENT GAP | screens-settings (R47) | columns are handle, cover, role, may do, status, expertise; `m.projects` (member-roster R71) is not read |
| 19 | 03 | R213 rail does not reset by double-click | SPECIFIED (map expectation) | interface-shell | R26 says drag or keys; the grip tip says "Home resets it"; no dblclick handler exists |
| 20 | 03 | R27 placement with no note draws `“”` | WORDS (MINOR) | screens-investigate | |
| 21 | 03 | R24 "1 questions" | WORDS (MINOR) | screens-inquiry / setup-words | |
| 22 | 03 | R21 "1 items wait on you" | WORDS (MINOR) | setup-words / screens-daily | |
| 23 | 03 | R20 "any member can take the next step" on a join request | WORDS (MINOR) | screens-daily | |
| 24 | 03 | R21 receipt "Done: Grant or decline." | WORDS (MINOR) | screens-daily | |
| 25 | 03 | R25 proposer blank in "proposed by , ·" | WORDS (MINOR) | screens-inquiry | |
| 26 | 03 | R24 Proceeding breadcrumb loses the project | WORDS (MINOR, layout) | screens-investigate | |
| 27 | 03 | OV-30 "Only this project's members see its work." | WORDS (MINOR) | setup-words | |
| K1 | 03 | R24 founder with no handle: no owner acts | KNOWN diag2-020305#1 | | |
| K2 | 03 | R20 member who may not start: "What happened?" over one door | KNOWN diag2-020305#2 | | |
| K3 | 03 | R20 first step 1 "Name your team" has no sentence | KNOWN diag2-020305#3 (SPECIFIED, R40) | | |
| K4 | 03 | R217 "Help me write this" drawn on no box with no assistant | KNOWN diag-09#11 (SPECIFIED) and fix-round-10 entry 63 (D5) | | |
| K5 | 03 | R213 "Show me how" 112x24 / 94x24 | KNOWN diag2-07#10 (interface-shell `.cs-wizmark`); also next.md N1263 | | |
| K6 | 03 | R213 radios 24x24 (`home-visibility-*`, `projects-visibility-*`, `project-close-why-*`, `aio-*`) | WALKER-ERROR, as diag2-07#11 | | |
| K7 | 03 | OV-19 unnamed buttons (promote, projectbarset, objectivecondition, release) | WALKER-ERROR, as diag2-10b#C9 | | |
| K8 | 03 | R21 vouch band words not drawn | KNOWN next.md N1263 (`screen.queue.vouchband.apart` read at T51's close) | | |

Notes on the KNOWN lines (evidence I read):
- K4: `screens-inquiry/project.mjs:519` `view.reachable ? cs.act("writinghelp", ...)`, `objective.mjs` likewise; interface-shell R20 "no assistant control is drawn anywhere (absent, not greyed)"; the operation itself answers `NO_ACCOUNT` (store-door R10). The 03 row's "guide or not ready" is the map's wording only (diag-09#11).
- K6: `cs.checks` draws `<label><input type="radio"> <span>text</span></label>` (`interface-shell/browser.mjs:838-842`), and the phone block keeps the box at 24 px but gives the label `min-height:44px` (`interface-shell/index.mjs:361`, `:364`). The walker's script measured the `input`, not the label (not drawn in a browser here).
- K7: the walker's detector tests `e.innerText` (`scripts/03/walk03.mjs:55`, `lib.mjs:38`), empty for a button inside a closed `<details>`. The listed buttons are in folds: `projectbarset` inside `<details data-fold="settings">` (`screens-inquiry/project.mjs:761`), the objective acts inside `fold(...)` (`objective.mjs:66`, a `<details>`), Queue/Home `release` in `data-f` details (diag2-10b#C9). Every `cs.act` button draws its label as text (`browser.mjs:704-706`).
- K8: the sentence exists as a row (`setup-words/rows.mjs:11095`) and is read by no screen code (grep `vouchband` in `bio-plane/src`: none outside the rows); next.md N1263 places it. The "counted in the queue" half is screens-daily R17/C70 ("counted with the list", `queue.mjs:307`) against R95 ("the bell and the sidebar equal the items the Queue lists"): the vouch to-do is a listed item, so they agree; the apart sentence is what N1263 supplies.

---

## 1. 03 R24 "A joined member (not an administrator) sets the project's stake" -- DEFECT (MAJOR), project-roster

### 1. Root cause with evidence
The walker's act was right (ben, joined owner, writes a stake, "Save this project's stake"); he is refused `PROJECT_ACT_NOT_A_PARTICIPANT`.
- The door stamps the actor of `projectstakeset` in the viewer's form. `op-declarations` declares `OP_STAMPS.projectstakeset = ["viewer","by"]` (run: node import, same for `projectscopeset`, `projectapprovalset`); `control-plane/index.mjs:1409-1410`: `const actor = viaSession ? sessViewer : ...; const stampOf = { viewer: ..., by: actor, ...` with the comment above it (`:1403-1405`) "`by` (query) ... the actor in the viewer's form (a session's viewer ...)". A session's viewer is `member:<id>` (`admission/index.mjs:374`: `viewer: r === "admin" ? "admin" : \`member:${member}\``). The loop at `:1423-1428` deletes the caller's `by` and sets this one.
- `project-roster/index.mjs:692-695`:
  ```
  if (!this.#adminAtFull(projectId, by)) {
    const denied = this.m.projectAuthority(projectId, `member:${by}`, "joined", "projectstakeset");
  ```
  With `by = "member:ben"` the identity becomes `member:member:ben`; `membership.projectAuthority` (`membership/index.mjs:614-627`) reads it through `positionalMember` as member id `member:ben`, who has no row: `PROJECT_ACT_NOT_A_PARTICIPANT`. `#adminAtFull` (`:167`) asks `isAdministrator(by)` of the same prefixed string, so an enrolled administrator is refused too; the founder's `by` is the bare `admin`, which is why her save works. Requirement project-roster R31 states the call as `membership.projectAuthority(projectId, by, "joined", ...)`: `by` passed as the identity, no second prefix.
- Run (probe, `w.ops(...)` of `project-roster/fixture.mjs`, project owned by ann, bob joined, discoverable): `by=bob` true; `by=member:bob` false `PROJECT_ACT_NOT_A_PARTICIPANT`; enrolled administrator `second` `by=second` true, `by=member:second` false; `projectapprovalset` for owner ann `by=ann` true, `by=member:ann` false `NOT_THE_OWNER`; `projectscopeset` `by=member:ann` false `PROJECT_ACT_NOT_A_PARTICIPANT`. Same cause at `:561-562` (`projectScopeSet`, `member:${who}`), `:578` and `:619` (`isProjectOwner(projectId, by)`). Not walked here (scope, approvals have no 03 row) but the same code path and the same refusal.

### 2. Why the module tests missed it
`project-roster/stake-gone.test.mjs` calls `projectStakeSet({ projectId, stake, by, viewer })` with `by` the bare id (`set(w, "bob", ...)`, l.14) and `w.ops("...&by=bob&viewer=...")` (l.84-86); `scope-approval.test.mjs` the same. `op-declarations` tests check the stamp lists; `control-plane` tests (`r45/r48/r49-routes`, `new-ops`) check stamps by routes they know; none sends `projectstakeset`, `projectscopeset` or `projectapprovalset` (grep of `bio-plane/test/m` finds these names only under `screens-inquiry/` and `wizard-scripts/`). screens-inquiry tests answer from a scripted plane (`t50-project.test.mjs:66`). So no test joins the door's stamp to the module's reading.

### 3. Failing-first test
`bio-plane/test/m/project-roster/stake-gone.test.mjs` (owner's tests), in `stakeWorld()` (ann owns, bob joined, cal invited): call the op as the door sends it, `w.ops(\`projectId=PROJ-P&stake=x&by=${encodeURIComponent("member:bob")}&viewer=${encodeURIComponent(V("bob"))}\`).projectstakeset()`; assert `ok === true` and `projectStake("PROJ-P").set_by === "bob"`; the same with `by=member:second` (administrator, discoverable project) ok; controls: `by=member:cal` (invited) `PROJECT_ACT_NOT_A_PARTICIPANT`, `by=member:dee` (outside, hidden) `NO_SUCH_PROJECT`. Red today (probe above). The same file for `projectscopeset` and `projectapprovalset` with `by=member:ann` (owner). Through the real door: `bio-plane/test/m/control-plane/r8-kit.mjs`/`harness.mjs` `world()`+`call()` as a member session sending `op=projectstakeset`; `opCalls` shows the inner `by=member:<id>`; the owner answers `ok`.

### 4. Platform
None (in-process arithmetic on strings). Requirement: project-roster R31 (and R21, R24) already state the right behaviour ("`by`" as the identity); op-declarations R17 states the stamp's form; add one sentence to project-roster R31/R21/R24: "`by` is read in the form the door stamps, `member:<id>` or the founder's `admin`".

---

## 2. 03 R24 "A malformed stake (6,000 characters) is refused in words that name the PROJECT's stake" -- DEFECT (MINOR), screens-inquiry

### 1. Root cause with evidence
The module answers the right sentence: `project-roster/checks.mjs:124-127` `STAKE_MALFORMED: ... translation: hasWord('refusal.STAKE_MALFORMED.project') ? word('refusal.STAKE_MALFORMED.project') : null`. The screen's act has no `refusals` map: `screens-inquiry/project.mjs:960-964` `{ op: "projectstakeset", label: "stake.project.save", rereads: ["stake"], send(...) {...} }`. The shell picks the member's sentence by code first: `interface-shell/browser.mjs:341-352` `refusalOf`: `const key = own && typeof own[a.code] === "string" ? own[a.code] : "refusal." + a.code; if (has(key)) return { words: w(key ...) }` and only then `if (a.translation) ...`. `refusal.STAKE_MALFORMED` is held (`setup-words/rows.mjs:11757`: "Your team's declared stake says ...", the team's), so it wins over the answer's project sentence (`rows.mjs:5641`: "This project's stake says ..."). Contrast `screens-action/send-steps.mjs:461` `refusals: { STAKE_MALFORMED: "refusal.STAKE_MALFORMED.action" }`. screens-inquiry R53: "`refusal.MACHINE_CANNOT_SET_STAKE`, `refusal.STAKE_MALFORMED.project` and `PROJECT_ACT_NOT_A_PARTICIPANT` are drawn by their words".

### 2. Why the module tests missed it
`screens-inquiry/t50-project.test.mjs:66-69` presses the act against `refusedIn("STAKE_MALFORMED", "Too long.")` and asserts only `textContent.length > 0`; `project-roster/stake-gone.test.mjs` asserts the module's `translation` (`word("refusal.STAKE_MALFORMED.project")`), never the screen.

### 3. Failing-first test
`bio-plane/test/m/screens-inquiry/t50-project.test.mjs` (that test, strengthened): after the press, assert the text beside the act contains `word("refusal.STAKE_MALFORMED.project")` and not `word("refusal.STAKE_MALFORMED")`. Red today. Fix: `refusals: { STAKE_MALFORMED: "refusal.STAKE_MALFORMED.project", MACHINE_CANNOT_SET_STAKE: ... }` and the key in the screen's `words`.

### 4. Platform
None. Requirement R53 already states it.

---

## 3. 03 R25 "The requester is told the owners' answer" -- DEFECT (MAJOR) + REQUIREMENT GAP, screens-inquiry

### 1. Root cause with evidence
After Decline the module holds the whole answer: `project_join_requests` row `state='declined'`, `closed_by`, `closed_comment`, `closed_at` (`project-roster/index.mjs:1168-1176`, `:1280`). The requester can read it: the directory row carries `request: { state, asked, closed }` (`:815`, R9 "the caller's own latest request") and `projectrequests` with no project returns her own rows with `state, closed_comment, closed` (`:1297-1312`, R14). The page draws only an open one: `screens-inquiry/project.mjs:155-158`: `const req = listed && listed.request && listed.request.state === "open" ? listed.request : null; ... : req ? <p ... data-request="asked"> ... withdraw : cs.act("projectrequest", ...)`. A declined request is therefore drawn as no request: the page offers "Ask to join" again, as the walker saw. Nothing reads `projectrequests`. The owner's item promises it (`queue.project-request.detail` = "They see your answer and any word you add.", `rows.mjs:5471`, DEC-286). screens-inquiry R60 specifies only the open request (`projects.request.asked`, "Withdraw your request"); screens-daily R42 lists her open requests on Home; nothing says a closed one is drawn. So the data exists and no requirement draws it.

### 2. Why the module tests missed it
`screens-inquiry/project.test.mjs:306-310` ("R60 ... her open request is said") covers `state: "open"` only; `screens-daily/join.test.mjs:76-95` is the owner's side. `project-roster/requests.test.mjs` proves the stored closing fields, not a reader.

### 3. Failing-first test
`bio-plane/test/m/screens-inquiry/project.test.mjs` next to l.306: directory row `request: { state: "declined", asked: "2026-10-05T09:00:00Z", closed: "2026-10-06T09:00:00Z" }` for a findable project; assert the page draws a sentence that her request was declined on 2026-10-06 (new word) and still offers "Ask to join"; control: `granted` draws no decline sentence (she is invited and sees Join). The owner's word (the plane's `closed_comment`, only in `projectrequests`' own list, not in the directory row) needs project-roster R9 to carry `closed_comment`, or the screen to read `projectrequests`; one ruling.

### 4. Platform
None. Requirement text needs wording: screens-inquiry R60 (draw her latest closed request and the owner's word) and project-roster R9 (`request` carries `closed_comment`). UX words for the sentence.

---

## 4. 03 R25 "Decline offers no place to add a word" -- DEFECT (MAJOR, with 3), screens-daily

### 1. Root cause with evidence
`projectRequestAnswer({ projectId, handle, answer, comment, by, viewer })` takes and stores `comment` (`project-roster/index.mjs:1247`, `:1273`, `#requestComment` 280 chars; R12). The Queue's act sends none: `screens-daily/queue.mjs:508-512` `send: ... { query: { projectId: el.dataset.project, handle: el.dataset.who, answer: el.dataset.answer } }`; Home's the same (`home.mjs:466`, `:135-141` draws the two buttons only). `actOf` (`queue.mjs:102-107`) draws Grant and Decline with no field, though the item says "any word you add" and the act's help says "with a word if you like" (`rows.mjs:17814`).

### 2. Why the module tests missed it
`screens-daily/join.test.mjs:76-95` presses Grant/Decline and checks the op and answers sent (`dataset.answer`); no test asks for a comment field. `project-roster` tests the comment through the module.

### 3. Failing-first test
`bio-plane/test/m/screens-daily/join.test.mjs` (l.76 fixture): fill a field `qa-...-comment` (new, the same `cs.field` kit as `FIELDS`), press Decline, assert the `projectrequestanswer` query carries `comment: "<text>"`; control: empty field sends no `comment`. Red today (no field).

### 4. Platform
None. Requirement: screens-daily R42 says "Grant and Decline"; add "with an optional word, sent as `comment`".

---

## 5. 03 R21 (x2) "'What you answered and set aside' lists the join answer" -- SPECIFIED as built + REQUIREMENT GAP, queue

### 1. Root cause with evidence
`queue/index.mjs:1893-1954` `#answeredList` builds exactly four row kinds ("Four kinds of row, each `act`: `resolved`, `forwarded`, `snoozed`, `set_aside`", the doc comment `:1893-1901` and queue R59): tasks resolved (`resolvedTasks`), bias debts settled, forwards, snoozes, finding dispositions. A join answer is none of them; it lives in project-roster (`project_join_requests.closed_by/closed_at/state`). `screens-daily/queue.mjs:371-388` draws what `queue?answered=true` returns, so the page is empty after Grant or Decline (the walker's observation, both answers). queue R59 and screens-daily R59/R61 do not name it; the map row and queue-producers R42's own text ("It leaves for every owner at once when one owner answers it") say only that it leaves.

### 2. Why the module tests missed it
`queue/feed.test.mjs`, `t51.test.mjs`, `ledger.test.mjs` prove the four kinds; the join request is a producer-derived item (`queue-producers` `#obligationsProjectRequest`, "never stored"), so no queue test ever had an answered one.

### 3. Failing-first test (if BOB adds the kind)
`bio-plane/test/m/queue/t51.test.mjs`: with project-roster answering a closed request (`state: "declined"`, `closed_by` the member, `closed_at` in the window) the member's `queueFeed({ answered: true })` holds `{ act: "join_answer", project, requester, state: "declined", at }`; control: a request answered by another owner is not hers; a hidden project's row names nothing (R33). Screens test in `screens-daily/queue.test.mjs`: the page draws the requester's handle, the answer and the day only. Red today.

### 4. Platform
None. Requirement: needs a decision (what the answered list holds beyond tasks): queue R59 amended with a fifth kind, project-roster publishing a read of answered requests by `closed_by` (R14 reads by project only), screens-daily R59 drawing it. Not Bob's policy; BOB's ruling.

---

## 6. 03 R25 "A plain member presses 'Ask to leave this project'" -- DEFECT (MAJOR) + REQUIREMENT GAP, screens-inquiry (then queue-producers)

### 1. Root cause with evidence
The module does what membership R35 says: `membership/index.mjs:1075-1105` sets `state='leaving'`, answers `detail: "recorded as a request to leave. An owner of this project removes participants; this does not."`; a second press answers `NOT_JOINED` with `state: "leaving"` (`:1081`). Everything after is the page:
- The member: `project.mjs:175` `joined = mine.state === "joined"`; Leave is drawn only `joined` (`:567`); Join only `mine.state === "invited"` (`:566`). After the press her row is `leaving`, so she is shown no leave button, no sentence that the request stands, no way to cancel; membership R34 says `projectJoin` "withdraws a request to leave" but no Join is drawn for `leaving`. The act has `rereads: "all"` and no `done` (`:945-946`), and a successful act gives no receipt (shell `:2222-2227` marks the button `done` for two seconds and redraws).
- The owners: the Members row's owner acts are drawn only for `x.state === "joined"` (`:549`), the "invited" suffix only for `x.state === "invited"` (`:560`); a `leaving` row shows no mark and no "Remove from the project". The act's own help promises more: `act.projectleave.name` help "Tells the owners you are leaving the project, with a note if you like." (`rows.mjs:5775`); the page sends no `comment` (`:945-946`).
- No queue item: `queue-producers` mentions `leaving` only for participation (`:1533-1548`); queue R1/R57 list no leave kind.
Design: Membership v2 §7.6 "it greys the checkmark to record a request to leave"; §7.7 "Only an owner removes a participant ... whether or not a request to leave is outstanding".

### 2. Why the module tests missed it
`screens-inquiry/project.test.mjs:262-268` presses `projectleave` and checks the query; `:336` checks the page "now a participant's". No fixture has a participant with `state: "leaving"`. `membership/participation.test.mjs` proves the state, not its drawing.

### 3. Failing-first test
`bio-plane/test/m/screens-inquiry/project.test.mjs` (owner's tests): roster `[{handle:"ola", state:"leaving", owner:0}, {handle:"ross", state:"joined", owner:1}]`. As ola: the page says her request stands (new word) and draws "Join" (`projectjoin`) as the way to withdraw it; no second leave button. As ross (owner): ola's row is marked as asked-to-leave and carries "Remove from the project…" (`projectremove`). Controls: a `joined` member sees the leave button; an owner is not offered removal of an owner. Red today (rows drawn as plain members, no acts). Whether owners are also told in the Queue is a requirement decision (queue-producers R42-style item); BOB rules.

### 4. Platform
None. Requirement: screens-inquiry R29 lists "Ask to leave this project" and nothing after it; add the leaving row and withdraw. Words (UX design): the asked-to-leave mark, her own sentence.

---

## 7. 03 R25 "Rescue: every owner inactive, an administrator who is not an owner is offered to become its owner" -- DEFECT (MAJOR), screens-inquiry

### 1. Root cause with evidence
The plane offers it (walker: `projectownersgone` `gone: true`; Home's row drawn). The page decides whether to draw the rescue from a key the affordances answer does not carry: `screens-inquiry/project.mjs:126-130`:
```
const aff = later("rescue", "affordances", { target: id });
const roster = aff.state === "ok" && aff.value && aff.value.roster ? aff.value.roster : null;
... if (roster && roster.rescue_open === true) { ... cs.act("projectownerrescue", ...)
```
`op=affordances` answers `{ target, object_type, current_state, acts: deriveActs(facts).map(dec), vocabularies, capture_acts }` (`affordances/door.mjs:74-76`, read). `rescue_open` is a fact (`affordances/facts.mjs:175`, `:336` `roster: {... rescue_open: m.rescueRefusal(target, actor) === null}`) that the act table consumes (`affordances.mjs:1555-1557` `projectownerrescue ... applies: f.roster?.rescue_open === true`), so the answer's `acts` list holds `{id: "projectownerrescue", ...}` and no `roster`. With `roster` null the page falls through to the unavailable state (the walker's text "You can't open this ... A hidden project shows only"). screens-inquiry R30 specifies the screen; affordances R18 "the pre-flight offers the rescue exactly where the act accepts it".

### 2. Why the module tests missed it
`screens-inquiry/project.test.mjs:278, 288, 293` fabricate the answer: `affordances: ok({ ok: true, roster: { rescue_open: true, owner: false } })`. `affordances` tests prove `acts` includes the rescue (facts.mjs fact), not that a screen reads it. The scripted plane was written to agree with the screen, not with the module's answer.

### 3. Failing-first test
`bio-plane/test/m/screens-inquiry/project.test.mjs` (l.278's case): answer `affordances` in the real shape, `ok({ target: P, object_type: "project", current_state: null, acts: [{ id: "projectownerrescue", label: "..." }], vocabularies: {}, capture_acts: [] })` (build it from `affordancesAnswer` of the module, as `fixtures.mjs` for real shapes), administrator viewing at existence; assert the rescue section (`project.rescue.title`, the field, `projectownerrescue`) is drawn; control: `acts` without the rescue draws the unavailable state. Red today. Real entry: `bio-plane/test/m/control-plane/` harness, an administrator session sending `op=affordances&target=<hidden project, owners inactive>`; assert `acts` holds `projectownerrescue` (green today) and no `roster` key (documents the shape).

### 4. Platform
None.

---

## 8. 03 R218 "Two owners change the same field at once (the project's bar)" -- DEFECT (MAJOR) + REQUIREMENT GAP, strength

### 1. Root cause with evidence
Ben saved capture C from a stale page after ross saved B; the later write stood. `strength/index.mjs:1501-1560` `projectBarSet`: `const head = this.record.head(pid); ... const previous = this.projectBar(pid); ... this.promotion.promote({ bundleId: pid, base: head.bundleSha, ...})`. The base is read at write time, so `promotion`'s compare-and-set always passes; the act takes no `base` or "bar I saw" from the writer. The screen sends only `{project, capture, connection}` (`screens-inquiry/project.mjs:853-860`). The earlier value is not lost: the document gets a Session Log line "the project's standard of evidence from {before} to {after}" with the author and reason (`strength:1546-1553`), but the second writer is told nothing and the page draws no divergence. strength R40 states no base; the map (overlay R218) wants "base-stamped write, divergence outcome".

### 2. Why the module tests missed it
`strength/projectbar.test.mjs` and `strengthbarset.test.mjs` set the bar in sequence by one writer; no test holds two views. `promotion`'s CAS tests (`CAS_STALE`) use an explicit `base`.

### 3. Failing-first test
`bio-plane/test/m/strength/projectbar.test.mjs`: two owners read the bar (none); A sets B for capture, then C sets C passing the bar it read (`expected: {capture: null, connection: null}` new field) → refused with a stale-bar outcome naming A's value (`previous`), nothing written; control: omitting `expected` keeps today's last-writer behaviour; C re-reading and setting succeeds. Screen: `screens-inquiry/project.test.mjs` sends `expected` from the bar it drew, and draws the divergence word. Red today (the second set succeeds).

### 4. Platform
None. Requirement: needs wording and a decision before any job (strength R40 + screens-inquiry R10 + a divergence word; case draft and objective rows of R218 were NOT REACHED here).

---

## 9. 03 R25 "Fork: the form asks who can find it with neither choice preselected" -- SPECIFIED (conflicts with overlay 7), screens-inquiry

### 1. Root cause / specification
`screens-inquiry/project.mjs:568` `cs.choice("project-fork-visibility", "project.visibility.title", [["hidden", ...], ["discoverable", ...]], { value: "hidden" })` and `:952` (`projectfork` send: `=== "discoverable" ? "discoverable" : "hidden"`). screens-inquiry R29: `"Start a project from this one…" (projectfork), with the new title and the visibility (hidden preselected)`; screens-daily R30 the same for Start ("`project.visibility.start.hidden` (preselected)"; "Control: an untouched form sends hidden"). The walker's expectation is overlay 7 (DEC-77 "no preselected choice"). The requirements and code agree; they conflict with the overlay's doctrine, so this is a policy-level conflict for BOB to bring to Bob (P17), not a code defect.

### 2. Tests
`screens-daily/projects.test.mjs`/`home.test.mjs` assert "an untouched form sends hidden" (R30); `screens-inquiry/project.test.mjs:262-268` presses fork.

### 3. Failing-first test
None while R29/R30 stand. If Bob rules "neither preselected": `screens-inquiry/project.test.mjs` fork press with no choice made refuses in place (`project.visibility.title` needed) and sends nothing; same for Start in `screens-daily`.

### 4. Platform
None. Requirement wording changes in both R29 and R30 if the doctrine is applied.

---

## 10. 03 R25 "Fork needs a joined participant who holds 'start projects'" -- DEFECT (MINOR), screens-inquiry

### 1. Root cause with evidence
`project.mjs:568-570`: `(joined ? cs.field("project-fork-title", ...) + cs.choice("project-fork-visibility", ...) + cs.act("projectfork", ...) : "")`. `cs.act` returns "" when the act is not offered to the member (shell R12, absent not greyed; the walker: button count 0), but the title field and the choice are gated on `joined` alone. A member without `create projects` is shown two fields for an act she cannot press. screens-inquiry R29 draws the fork for the participant; promotion R41-R44 gate it by capability.

### 2. Why the module tests missed it
`project.test.mjs:262-268` opens as a member with the act; no test gives the member the owner/participant role without the capability and counts the fields.

### 3. Failing-first test
`bio-plane/test/m/screens-inquiry/project.test.mjs`: joined participant whose `whoami` lacks `create_projects`: assert `main(p)` has no `#project-fork-title` and no `#project-fork-visibility` (and no `projectfork` button); control: with the capability all three. Red today.

### 4. Platform
None. Requirement R29 states "the new title and visibility" without the capability; one sentence.

---

## 11. 03 R26 "A member's own aspiration is visible to the group (the project owner reads it)" -- SPECIFIED as built + REQUIREMENT GAP, screens-inquiry R106 / intent

### 1. Root cause / specification
`screens-inquiry/objective.mjs:34`: `aspirations: { op: "aspirations", query: { project: id, ...(me ? { member: String(me) } : {}) } }`; `intent/index.mjs:1068-1085` `aspirationsFor` returns `[...group, ...own, ...mine]` where `mine = held.filter(a => a.scope === "member" && a.owner === str(member))`: only the named member's own. The screen words it "Held by me" (`objective.mjs:198`, `held-by-me`). intent R9 says "The group's and a member's aspirations are readable by every member", but no read lists another member's; R28 says member aspirations "shape that member's queue only, §12.1"; screens-inquiry R106 names "aspirations a team, project or member holds" with reads "for the project and for her". So as built each member reads her own. Whether the owner (or the group) should read members' own is a product question (map overlay), not a defect.

### 2-3. Tests
`intent/pursuits.test.mjs`, `serves.test.mjs`; `screens-inquiry/fr28-objective.test.mjs`. If BOB wants it: `intent/pursuits.test.mjs` a read (`aspirationsFor({project})` or a new list) returns ben's member-scope aspiration to ross; red today (it returns only `member`'s). Screens test: the owner's page draws it as "Held by ben".

### 4. Platform
None. Decision for BOB with Bob (privacy of a member's own commitments); R9 and R106 need the same sentence either way.

---

## 12. 03 R26 "Retire an aspiration: what pursuing it taught is captured; 'it and its dead ends stay readable'" -- DEFECT (MINOR) + READ GAP, screens-inquiry (intent)

### 1. Root cause with evidence
The act works (the walker: lesson captured). The retired aspiration then disappears from the page: `objective.mjs:76-77, 195-204` draws `asp.aspirations` from `aspirationsFor`, which returns "those in force" (intent R12, `#heldAspirations`), and fetches `pursuit` only for `shown` plus departures. Retired ones are in neither. The page's own note says "it and its dead ends stay readable" (`objective.mjs:223`), and intent R11: "a retired aspiration and its pursuit record stay readable" (via `pursuitOf({aspiration})`, which needs the id). No read lists retired aspirations, so the screen cannot reach them.

### 2. Tests
`intent/pursuits.test.mjs:153` proves dead ends are kept; `screens-inquiry/fr28-objective.test.mjs` draws held rows.

### 3. Failing-first test
`bio-plane/test/m/intent/pursuits.test.mjs`: after `retireAspiration`, a list read (`aspirationsFor` with `retired: true`, new) answers it with `taught` and its dead ends; control: held list unchanged. `screens-inquiry/fr28-objective.test.mjs`: the page draws the retired row (marked retired, its `taught`, its dead ends). Red today.

### 4. Platform
None. Requirement: intent R12 amended (or a new R) with a retired read; screens-inquiry R106 draws it.

---

## 13. 03 R26 "Link this objective to the goal: the act answers with a receipt" -- DEFECT (MINOR), screens-inquiry

### 1. Root cause with evidence
`intent/index.mjs:868-871` appends `{ project, by, at }` to the goal's `objectives`, and `goalread` returns `objectives` (`:899-916`, "the objectives linked (each a project the viewer may see)"). `objective.mjs:235-236` draws each goal row as statement, bounds, author, closed reason; it never reads `g.objectives`. The `goallink` act (`:307-309`) has `rereads: ["goals"]` and draws nothing. The fold says "your name and the date are kept with the link" (`objective.mjs` `your-name-and-the-date-are-kept-with-the-link`); it is not shown.

### 2. Tests
`fr28-objective.test.mjs` presses `goallink` and checks the body sent; no goal fixture carries `objectives`.

### 3. Failing-first test
`bio-plane/test/m/screens-inquiry/fr28-objective.test.mjs`: `goal` answer `objectives: [{project: P, by: "ross", at: "2026-10-25T..."}]`; assert the row draws the project's name, "ross" and the day; control: none linked draws nothing extra. Red today.

### 4. Platform
None. Requirement R106 adds the sentence "each goal row lists the objectives linked, with who and when".

---

## 14. 03 R26 "The declarer is named the same way everywhere" -- DEFECT (MINOR), screens-inquiry

### 1. Root cause with evidence
`screens-inquiry/common.mjs:78-87` `who(cs, x, founder)`: a bare `admin` is drawn `member.founder.unnamed` ("The team's founder") unless `founder` (her handle) is passed. `objective.mjs:199, 207, 235` call `P.who(cs, a.author)` / `P.who(cs, e.author)` / `P.who(cs, g.author)` with no founder; `project.mjs:102-105` passes it (`whoIs(x, founder)`), which is why Members and Home read "ross". R46 (`common.mjs:77`): "A screen that reads the founder's handle passes it as `founder`".

### 2. Tests
`fr28-objective.test.mjs` fixtures use a member author ("dev"); `common.test.mjs` tests `who` with and without `founder`.

### 3. Failing-first test
`bio-plane/test/m/screens-inquiry/fr28-objective.test.mjs`: aspiration/goal `author: "admin"`, participants (or `groupidentity`) naming the founder's handle "ross"; assert rows read "ross", not `word("member.founder.unnamed")`; control: handle none still reads the unnamed word. Red today. The founder's handle must be read by the screen (`projectparticipants` founder row, as `project.mjs` does).

### 4. Platform
None. R46 states it.

---

## 15. 03 R27 "The theme page: the controls to place by typing a document or passage id" -- SPECIFIED (the map's wording), screens-investigate

### 1. Root cause / specification
`screens-investigate/theme.mjs:51-69` state b draws test, declarer, placements, hunches, taken-out, with `themewithdraw` and `themeplace` (confirm) on rows only. screens-investigate R31 lists exactly that ("State b, one theme: its test and declarer; `theme.placed` ...; `theme.confirm` ('It belongs': `themeplace` at a hunch)"); placing is done from the document's own page (screens-inquiry), and `connections` R40 takes a bundle or content id, which a member never types (screens-investigate R23 "no id fields"). So the screen is as specified; typing an id would contradict R23. The map row is out of date.

### 2-4. Tests / platform
None to add. Platform: none. BOB: correct the map row; no requirement change.

---

## 16. 03 R27 "A member who cannot see the project a placement belongs to is told that something is withheld" -- SPECIFIED (conflicts with overlay 2), connections R44

### 1. Root cause / specification
`connections` R44: "Each placement is gated by its document through the viewer: one the viewer cannot see is omitted, not counted and not labelled, and `truncated` counts only visible rows" (code `connections/themes.mjs:95-97`, `this.k.sees(bundleId, viewer)`). screens-investigate R31's control: "a document the member may not see is left out". Overlay 2 (map): "downstream lists (dependents, cited-by) say something was withheld". The same module already does what overlay 2 wants elsewhere: R20 `backlinks` answers `out_of_view: true` "and only that". So R44 and R31 as written give the walker's result; the conflict is between those requirements and overlay 2.

### 2-3. Tests / failing-first
If BOB amends R44: `bio-plane/test/m/connections/` (themes tests): a theme with one placement in a project the viewer cannot see, `readThemes({id, viewer})` answers `out_of_view: true` and no count, id, title; control: all visible, key absent. `screens-investigate/theme.test.mjs`: the page draws the shell's fixed withheld sentence once. Red once written.

### 4. Platform
None. Requirement needs wording (R44, R31 control) after BOB's decision whether a theme is "a downstream list" (it is a lens, `says` states counts of visible rows; a count of hidden ones would leak).

---

## 17. 03 R27 "Find with a theme chosen names each document in words, never by its raw id" -- DEFECT (MINOR), screens-daily

### 1. Root cause with evidence
`screens-daily/finder.mjs:192-196`: `const t = p.document && typeof p.document === "object" && p.document.title ? String(p.document.title) : (typeof p.title === "string" && p.title ? p.title : id); return cs.row("", cs.ref(screenOf(p.target_kind, id), id, t, []), "", "")`. The placement view `connections/themes.mjs:253, 262` answers `document: r.bundle_id` (a string), no title. So `t` falls to `id`, "INFO-2026-0002-lease-minutes-b". The Theme page (`screens-investigate/theme.mjs:25-33`) reads each title with `P.later(... "image", {id})`. screens-daily R26/R43: documents named by their title.

### 2. Tests
`screens-daily/finder.test.mjs` / `finder-states.test.mjs` fixtures give `document: {title: ...}` (an object the real op never returns).

### 3. Failing-first test
`bio-plane/test/m/screens-daily/finder.test.mjs`: `themeread` answer in the real shape (`members: [{target: "INFO-1", target_kind: "document", document: "INFO-1", ...}]`) and `image` answering the document's title; assert the row text is the title and not `INFO-1`; control: no title read leaves `word("shell.card.document")`, never the id. Red today.

### 4. Platform
None.

---

## 18. 03 R130 "The roster lists each member's projects the administrator may see in full" -- REQUIREMENT GAP, screens-settings

### 1. Root cause / specification
`screens-settings/members.mjs:98-112`: columns `col.handle, col.cover, col.role, col.caps, col.status, col.expertise`; `cells` never read `m.projects`. The data exists: member-roster R71 gives each row `projects` for an administrator's roster (the walker: "the API's row has a `projects` list"). screens-settings R47 (the roster) lists columns without Projects; Membership v2 §7.8 (docs/architecture) says "the administrator's roster lists, for each member, the projects that member participates in that the administrator can see in full". No screens-settings requirement draws it.

### 2-3. Tests
`screens-settings/members.test.mjs` draws the columns. If BOB adds it: row with `projects: [{project, state, owner}]` → the cell lists project names (those the administrator sees in full; a hidden one at existence draws its name only); control: a member's table has no Projects column. Red once written.

### 4. Platform
None. Requirement: screens-settings R47 amended by one sentence.

---

## 19. 03 R213 "Desktop rail: ... resets by double-click" -- SPECIFIED (map expectation), interface-shell

### 1. Root cause / specification
interface-shell R26: width 184 default, 64-320, "set by dragging its edge or by the keyboard, kept on the device"; code `browser.mjs:2450-2453` ArrowLeft/ArrowRight step 8, Home resets to `RAIL_DEFAULT` (the tip says so, `rows.mjs:1391` "Home resets it"); the drag at `:2435-2442`; no `dblclick` listener on the grip (grep `dblclick` in `interface-shell/browser.mjs`: none). The walker's values match: 184, +32 = 216, 64 floor (rail 47 px, icons only), double-click leaves 64. "Resets by double-click" is DEC-154 in the map, not in R26. "Kept per member" is R26's "on each device".

### 2-4. Tests / platform
`interface-shell/t51.test.mjs`/`frame.test.mjs` cover R26. If BOB wants the double-click: R26 amended; test: dblclick on the grip sets `aria-valuenow` 184. None otherwise. Platform: browser event only.

---

## 20. 03 R27 "A placement made with no note reads without empty quotation marks" -- WORDS (MINOR), screens-investigate

Seen: "Placed by ross, October 25, 2026: “”" and the hunch line likewise. Wanted: "Placed by ross, October 25, 2026." Cause: `theme.placed.by` = "Placed by {who}, {date}: “{note}”" (`setup-words/rows.mjs:1148`) is filled with `note: m.note || ""` (`screens-investigate/theme.mjs:59, 60, 62`). A second row (or the fill dropping the clause) for a placement with no note is needed; same for `theme.hunch.by` (`rows.mjs:1151`).

## 21. 03 R24 "1 questions" -- WORDS (MINOR), screens-inquiry / setup-words

Seen: "1 questions" on the stage line and the same plural in "what each stage needs". Wanted: "1 question". Cause: `project.mjs:181` `W("screen.project.stage." + k, { count })` with fixed plural rows `screen.project.stage.read` "{count} questions" (`rows.mjs:2181`), `.legs`, `.concluded` (`:2182-2183`) and the "either one reaches it" sentence (`project.mjs:216`); the repo's convention is a `.one`/`.other` pair ("every count has .one and .other", `count.questions.one`, `rows.mjs:1269`), which these rows lack.

## 22. 03 R21 "1 items wait on you" -- WORDS (MINOR), setup-words / screens-daily / interface-shell

Seen: "1 items wait on you in your queue: 1 to do, 0 noticed, 0 status." Wanted: "1 item waits on you in your queue: ...". Cause: one row `shell.queue.waiting` "{n} items wait on you in your queue: ..." (`rows.mjs:4875`), drawn by `screens-daily/queue.mjs:316` and `interface-shell/browser.mjs:1309`; the head above it already picks `screen.queue.count.one` for 1 (`queue.mjs:311`). A `.one` row beside it and the choice at both sites.

## 23. 03 R20 "Home names who can take a join request's next step" -- WORDS (MINOR), screens-daily

Seen (Home, under "Needs the team"): "ben asks to join Park Lease Review ... any member can take the next step Grant Decline". Wanted: "the project's owners' move" (only owners can answer; the same item is the owner's To do in her Queue and nobody else's). Cause: `home.mjs:97-99` puts every item whose `assignee` is not the member in "Needs the team"; `:178-181` then draws `screen.home.move.anyone` ("any member can take the next step", `rows.mjs:1795`) for `assignee` null. The join request has `assignee: null` and `recipients: [owners]` (`queue-producers/index.mjs` `#obligationsProjectRequest`: `assignee: null, recipients: [...owners]`). A row for an item with named recipients ("an owner's move") and the choice in `whose`. screens-daily R17 says only "unassigned or assigned by role".

## 24. 03 R21 "The receipt after Grant or Decline says which was done" -- WORDS (MINOR), screens-daily

Seen: "Done: Grant or decline. It has left your queue." Wanted: "Done: Decline." (or "Declined"). Cause: `queue.mjs:512` `done: cs.set("done", "projectrequestanswer")` and `:354-355` `cs.w("queue.done", { what: cs.w("act.projectrequestanswer.label.queue") })`, the act's single label "Grant or decline" (`rows.mjs:17814`). The `done` handler receives the pressed button (`el.dataset.answer`) and could set the label `screen.home.request.grant`/`.decline`.

## 25. 03 R25 "Later additions need every owner: the line names who agreed and who is awaited" -- WORDS (MINOR), screens-inquiry

Seen (ross's page just after pressing "Make an owner" on mai): "Making mai an owner · proposed by , · agreed: ross · waiting for: ben". Wanted: "proposed by ross, October 25, 2026". Cause: `project.mjs:936-937` `refusals: { CONSENSUS_REQUIRED: (r, cs) => cs.w("project.owners.pending", { who: ..., by: "", date: "", agreed: ..., awaiting: ... }) }` fills `by` and `date` with "" (the answer `project-roster/index.mjs:310-313` carries only `have` and `awaiting`); the proposer is the presser (`view.me`) and the instant is the press. After a re-read `projectownervotes` supplies `proposed_by`/`proposed_at` (`:456`), which is why it heals.

## 26. 03 R24 "Breadcrumb of the Proceeding page ends with its own name and keeps the project" -- WORDS (MINOR, layout), screens-investigate

Seen: "Projects › Proceeding" then the title "Proceeding". Wanted (R6's header, the other door pages): "Projects › Sewer Fund Transfers › Proceeding". Cause: the path is `["projects","@project","screen.proceeding.name"]` (`interface-shell/index.mjs:55`); the `@project` step is drawn only when the screen's `place(view)` answers a project (`interface-shell/browser.mjs:1150-1156`); `PROCEEDING_SCREEN` has no `place` (`screens-investigate/proceeding.mjs:226`; `money.mjs:28` and `standard.mjs` have one). The door opens `/app/proceeding/<project id>` (subject `PROJ-...`, `proceeding.mjs:15` `if (!/^ENT-/.test(id)) return base`), so `place` can answer from the subject; once an entity (`ENT-...`) is open no read here names its project: UNKNOWN whether the crumb should keep it (reproduction: open a registered proceeding and read the entity answer for a project field).

## 27. 03 OV-30 "No screen implies projects are private from the team's administrators" -- WORDS (MINOR), setup-words

Seen: project page "Only this project's members see its work." (`rows.mjs:2211`, `screen.project.members.who`) and, for a hidden project, "A hidden project shows only to its own members; ask its owner if you think you should be in it." (`rows.mjs:1430`, `shell.unavailable.notyours.says`). Wanted (overlay 30, ARCH:156-162): the second must not read as privacy from administrators, who see a hidden project's name and owners (membership R44, project-roster R5; the walker's R130 rows WORK): e.g. "A hidden project's work shows only to its own members; the team's administrators see that it exists, its name and its owners." The first sentence is true as written ("its work").

---

## Rows not diagnosed
None left undiagnosed. Two things are UNKNOWN and stated where they arise: whether the Proceeding crumb should keep the project for an open entity (26); and the layout facts of K6/K7 and the pixel sizes, which I read from code (rules cited) and did not draw in a browser (reproduction: measure the `label` boxes at 390 px; print `outerHTML` of the flagged buttons with their `closest("details")`).
