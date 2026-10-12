# DRAFT · T46: the member interface's first part (N897 (1))

**Status** · DRAFT for BOB, written 2026-10-11 by a drafting worker of BOB #158 on `tranche/T45` (P18). It rules nothing. §1 (packaging) and §7's technical points are BOB's (P17); §7's first part is Bob's. Requirement text is BOB's wording at T46's fold (P5); ids are a draft's and may renumber before approval (README rule 6).

**Sources** · `build/plan/next.md` N897 (K2816), N896; `build/plan/draft-T46-usable.md` §2–§3; PROCESS-MECHANICS §3, §12; `build/requirements/README.md`, `setup-page.md`, `setup-words.md`, `op-declarations.md` (R2–R5, R21, R34, R36, R45), `wizard-scripts.md` (R13, R22, R23), `control-plane.md` (R18, R65, R72), `capture.md` (R86), `agent-runner.md` (R17–R21), `instance-setup.md` (R53, R64, R74), `answer-envelope.md` (R2, R6), `queue.md` (R6, R17, R48), `op-grades.md` (R1–R3); `build/layers.md` (layer 11); `build/modules.json` (entries named); the design stream's PR head `origin/claude/gallant-brown-zg0wc1` @ `0ceb3240af`: `ux-substrate/README.md`, `HANDOFF.md` §0′, `screens/registry.json`, `screens/words.json`, `screens/mock-shell.js`, `mock-screens.js`, `visual-language/civicsmith.css`, `faces.css`, `fonts/`, `icons.svg`, `docs/development/DECISIONS.md` (DEC-87, -97, -98, -99, -110, -122, -131, -136, -138, -139, -153, -154, -156, -157, -159 to -164, -168, -175 to -177, -179, -181, -182, -188); `bio-plane/src/op-declarations/index.mjs` (`OPS`, 886 ops) on `tranche/T45`.

---

## 1. Packaging (BOB's; proposed)

### 1.1 The modules

Six new product modules in layer 11, **directly after `store-door` and before `control-plane`** (`modules.json`:152–153), with no `from` (nothing is extracted from a legacy module; `legacy-ui` stays as it is, K633). Placed after `op-declarations` (`modules.json`:149) rather than directly after `setup-page`, so that the interface may read `OPS` and `NEEDS` (to offer only the acts a session may do, and to test that every act names a served op) and `op-grades`' rungs (to draw each act's weight), and before `control-plane`, which serves it.

| # | module | what it is | uses (earlier only) | size estimate |
|---|---|---|---|---|
| 1 | `interface-assets` | The visual language as frozen data: `civicsmith.css` with `faces.css`, the 15 `woff2` faces (base64) with their three OFL licences, `icons.svg`, at a named commit of the design stream's files. No code. | none | ~120 lines of generated data, ~1.1 MB (the faces as base64) |
| 2 | `interface-shell` | The page and everything every screen shares: the session handed over by the setup page, the op client, words, the working frame (masthead, band, rail, phone tabs, path, dock), the router, the read states, acts with weight and friction, the act gate, refusals, explanations and levels, theme, references and cards, table rows and the hold strip, sign-out, and the screen contract the screen modules meet. | `interface-assets`, `setup-words` (`WORD_ROWS`), `setup-page` (R31's session record, new), `op-declarations` (`OPS`, `NEEDS`, `SESSION_OPS`), `op-grades` (`RUNGS`, `RUNG_ABSENT`) | 3,200–3,800 |
| 3 | `screens-settings` | `members`, `account`, `connect` (with `subscriptionsignin`), `notes`; the AI account panel (DEC-188 (1)) drawn once for the group's key and the member's own. | `interface-shell`, `setup-words`; tests: `op-declarations` | 2,400–3,000 |
| 4 | `screens-intake` | `capture` (with `captureupload`), `held`, `open-file`, `inbox`. | `interface-shell`, `setup-words`; tests: `op-declarations` | 2,000–2,600 |
| 5 | `screens-daily` | `home`, `queue`, `finder`, `find-in`, `answers`. | `interface-shell`, `setup-words`; tests: `op-declarations` | 2,200–2,800 |
| 6 | `screens-inquiry` | `project`, `question`, `document`, the assistant dock (`assistant`). | `interface-shell`, `setup-words`; tests: `op-declarations` | 2,400–3,000 |

Estimates are with comments, against K617's ~4,000 (measured with comments, M-T45-6). Each screen module also carries its own keyed sentences (§2.2 R5), counted in its size. `membership` R83's `MODULE_ORDER` gains the six in the same act that enters them in `modules.json`, with empty `paths` and `tests` (K657, K1043).

### 1.2 Serving (principle 9.6, N559, DEC-122 (3))

The interface is served only by the group's own plane, from `control-plane`'s Worker routes, beside `/` (the setup page, `bio-plane/src/control-plane/index.mjs`:589–598), `/version` (:560) and `/sign` (:564). `control-plane` gains one entry (§5, I13) and two requirements:
- `GET /app` and `GET /app/<path>` (any path below it) answer `interface-shell`'s page, `text/html`, `cache-control: no-store`, through the same namespace and address gates as `/` (`admission` R1, R20; :591–594), under `answer-envelope` R6's page policy (nonce per response; that policy already allows same-origin styles and fonts, `bio-plane/src/answer-envelope/index.mjs`:18).
- `GET /app/assets/<name>` answers `interface-assets`' file of that name with its content type (`text/css`, `font/woff2`, `image/svg+xml`, `text/plain` for a licence), and a `cache-control` that lets the browser keep it while the plane's version is unchanged; any other name 404. No credential is read on either route (the page holds no secret; every read is an op under the session).

`answer-envelope` needs no change: R6 already covers "every `text/html` response the plane serves". Routing is in `control-plane`, not `plane`, because the HTML routes answer before `path` and `op` exist (as `/` does, :566–588's comment).

### 1.3 How the screen modules reach the browser (BOB's; §7 T1)

Recommended: each screen module exports **self-contained browser functions** (each referring only to its parameters and the shell's `cs` kit object handed in, never to a module-scope import), and `interface-shell` composes the page's one script from their `toString()` (the setup page already embeds `deriveInquiryTitle` this way, `setup-page.md` Uses). The functions run unchanged in node for tests and in the browser.

---

## 2. Requirements

Common terms, stated once in `interface-shell` and read by every screen module: a **screen** is a registry screen (`screens/registry.json`, carried by `wizard-scripts` as `SCREEN_REGISTRY`, its R13); an **act** is a control that calls one op; a **read** is a call of a non-mutating op; **words** are the interface's keyed words (§2.2 R5). Every requirement below is marked `*(not yet met: T46)*` at the fold.

### 2.1 interface-assets

**Purpose.** The visual language every member screen uses (DEC-138), as frozen data copied from the design stream's files at a named commit. Pure data: it imports nothing, reads nothing and writes nothing; `interface-shell` names its files and `control-plane` serves them.

**Provides** — `ASSET_FILES`, `ASSETS_COMMIT`
- **R1** `ASSETS_COMMIT` names the commit of `main` the files are read at (the merge of the design stream's PR at T45's close). `ASSET_FILES` maps each published name to `{type, body}` (`body` a string; a face's bytes as base64 with `encoding: "base64"`): `civicsmith.css` (the file's bytes, followed by `faces.css`'s with each `url("fonts/<f>")` rewritten to `url("/app/assets/fonts/<f>")`); `icons.svg`; `fonts/<f>` for each of the 15 `woff2` faces of `visual-language/fonts/`; `fonts/OFL-source-serif-4.txt`, `fonts/OFL-source-sans-3.txt`, `fonts/OFL-source-code-pro.txt`. A test reads each file from git at `ASSETS_COMMIT` and finds it equal, byte for byte (base64-decoded for a face).
- **R2** No file of `ASSET_FILES` names a resource on another origin (`url()`, `@import`, `href`, `src`) other than `/app/assets/…` on the page's own origin.
- **R3** `ASSET_FILES` and each entry are frozen.

**Uses** · none. Tests: the design stream's files at `ASSETS_COMMIT`, read from git.

**Invariants**
- **R4** It imports nothing and does nothing when loaded beyond defining its exports.

**Satisfies** · DEC-138 (owed: the stylesheet, faces with their licences and icons served from the group's copy); DEC-122 (3); design principles 9.6; N559.

**Suggestions** · Generated by a script kept beside the module (not imported), as `setup-words`' generator is; a later commit is carried only by a later requirement naming it. `check_contrast.py` is the design stream's, run when a colour changes (DEC-138 owed).

### 2.2 interface-shell

**Purpose.** The member interface's page and frame: it signs a member in through the setup page's session, loads the member's words, draws the working frame and the path, routes among the screens the screen modules register, and gives every screen one way to read, to act, to explain and to refuse. Pure: it reads no table and writes nothing; every read and act is an op the plane serves, called from the browser.

**Provides**

*The page* — `interfacePage(screens)`, `NONCE_SLOT`
- **R1** `interfacePage(screens)` answers one HTML document: `<html lang>` from the member's language once known (`en` before), a `<link rel="stylesheet" href="/app/assets/civicsmith.css">`, the inline sprite of `icons.svg` absent (icons are referenced from `/app/assets/icons.svg`), and one `<script nonce="__CSP_NONCE__">` composed from the shell's own functions and each registered screen's (§1.3). The page holds no member text of its own outside the script's words (R5) and no secret.
- **R2** The page names no resource on another origin in any `src`, `href`, `@import`, `url()` or fetch, and loads no typeface that is not `interface-assets`' (DEC-122 (3)). It has no inline event-handler attribute, no `javascript:` address and no script made from a string (`answer-envelope` R6; `setup-page` R28's rule). A test serves the page through the door and finds every script element carrying the response's nonce.

*The session* (handed over by the setup page)
- **R3** On load the page reads the session record `setup-page` R31 names. With none, or one whose expiry has passed, it goes to `/` (the setup page's sign-in) and draws nothing else. With one, it sends `op=whoami`; an answer without a member session (`session` false or `member` empty) is treated as none. A `401` answer to any request clears the record and goes to `/`. The session token travels only in each request's `Authorization: Bearer` header: never in an address, a query, a body, a link drawn or the browser's history (`setup-page` R26's rule; `admission` R20). A test drives every screen with a sentinel token and finds it in each request's header and nowhere else.
- **R4** The masthead's member initial opens a menu with "Sign out": it sends `op=signout`, then clears the session record and goes to `/`, whatever the answer.

*Words*
- **R5** Every member-facing string the interface draws is a word read by key: a key of `setup-words`' `WORD_ROWS` (its R1), or a key of a module's own `SCREEN_WORDS` (frozen `[key, en, protected]` rows, keys `screen.<id>.<part>` with `{placeholders}`, DEC-179 (5)), never text written into a render function. After `whoami`, the shell reads `op=interfacewords` (`instance-setup` R74: the member's language, the group's shown translation, else the English); a key it does not answer, or a read that fails, is drawn in the English of `WORD_ROWS` or `SCREEN_WORDS`. `w(key, fills)` fills each `{name}` with the screen's data, HTML-escaped. A test renders every screen in every state and finds each drawn text node equal to a word's text, filled, or to the record's own data (names, titles, quotes, dates, counts). A key no list holds fails that test.
- **R6** Dates are drawn by `date.daymonth` and `date.daymonthyear` with `date.month.*` (DEC-191, DEC-192); no date is drawn in ISO form.

*The frame and the path* (DEC-139 (1), DEC-154; `mock-shell.js` `RAIL`, `TABS`, `PATH`)
- **R7** Every screen is drawn in the working frame: the masthead (the group's name, read once through the public `op=groupidentity`; search, opening `finder`; the explanation-level control, R17; the assistant button only while the assistant is reachable for this member, R20; the count of the member's To do items from `op=queue`; the member's initial, R4), the band `mark.band` with `mark.path.working.*` (DEC-106), the rail's seven places in the order Home, Queue, Find, Add, Projects, People, Settings (`rail.<k>.name`, guidance `rail.<k>.holds`), one column of work, and the dock (R20). At a viewport of 760 px or less the rail gives way to the five tabs Home, Queue, Add, Find, More (`tab.more.*`) and the dock to a sheet above them (`civicsmith.css`' breakpoint). A place whose screens are not yet built (People) is shown and opens a screen saying, in its words, that it comes later (§7 Q1).
- **R8** Every screen opens its main area with its path, at the same place: from its rail place to the screen's own name, last, marked as the current page, each earlier step a link; the heading below names the thing shown (a question's words, a document's title). Each screen's path is `PATH`'s for its id (members: Settings › Members; held: Add › Held captures; document: Projects › <project> › Document), the project's step its title as read.
- **R9** The router maps `/app` to `home` and `/app/<screen>[/<subject>]` to that screen with that subject id, keeps the browser's history (back and forward redraw the screen), and answers an unknown screen or a subject the read does not find with the screen's "Nothing here" state (R10), never a blank page.

*Reads and their states* (DEC-98)
- **R10** Every read is drawn in one of four states: still loading (`state.loading`), empty (`state.empty`, or the screen's own empty sentence), could not read (`state.failed` with the refusal's words as `{reason}`, R13), or its data. A read that failed is never drawn as empty, and an empty one never as failed. A test answers each read of each screen in turn as pending, empty, refused and failed (no answer), and finds the four states drawn.

*Acts: weight, friction and the gate* (DEC-82, DEC-87, DEC-143, DEC-181, DEC-122 (1))
- **R11** Every act is a button labelled `act.<op>.label.<screen>` (or the registry's label's key where the screen has one), carrying its weight's pips and name (`weight.<w>.name`): the weight read from `op-grades` `RUNGS` (`attested` drawn as `weight.signed`), an op in `RUNG_ABSENT` or unnamed drawn as reasoned (DEC-87). Friction follows the weight: reversible acts run on press; reasoned acts open a reason field in place and send only with a reason; terminal and signed acts open a dialog stating what the act does (`act.<op>.does`) and who signs, and send only on its confirm. An act that leaves the group carries `mark.outward.means`. On a phone (R7's width) a signed or irreversible act is drawn with what it does and a sentence saying where to finish, and is not sent (DEC-181). No T46 screen offers an irreversible act.
- **R12** An act is drawn only when the session may do it: `NEEDS[op]` is `null` or among `whoami`'s `capabilities`, the op is in `SESSION_OPS.member` (or `SESSION_OPS.admin` for the founder's session), and, for an act its owner refuses to a member who does not administer (`membership`'s administrator acts, `credentials`' group-key acts, `aikeepaway`), `whoami`'s `administer` is `true`. An act not drawn is absent, never greyed (DEC-139 (7)). Before `whoami` answers, no act is drawn.

*Refusals*
- **R13** A refusal (`ok: false` at the top level or in `result`, or an HTTP error) is drawn beside the act or read it answers, never in place of the screen: the word `refusal.<code>` (or a screen's own key for that code) when one is held; else the answer's `translation` (`answer-envelope` R2); else `state.failed` with the code. A form keeps what the member typed; nothing on the screen changes but the refusal. A test drives every act of every screen with a refusal of each kind and finds the words drawn and the form kept.

*Explanations* (DEC-159 to DEC-163, DEC-175, DEC-177)
- **R14** Every mark, name and reference explains itself (level 1, marks and names); every screen heading, section heading, rail place, tab and act explains itself at level 2 (guidance: `screen.<id>.purpose`, `rail.<k>.holds`, `act.<op>.does`). An explanation opens after the pointer rests 0.5 s (level 1, and level 2 at "Explain promptly") or 1.5 s (level 2 at "On a longer pause"), at once on keyboard focus or a tap; stays while the pointer is on the element or the explanation; closes 0.5 s after it leaves both, or on Escape; one at a time; announced as the element's description. Nothing is hidden at either level.
- **R15** No explaining element sits inside another (DEC-177 (1)): a control or a mark with no label of its own absorbs those inside it, said after its own; a title naming a particular thing explains that thing first. A test renders every screen in every state, on both widths, and finds no element carrying an explanation inside another that carries one.
- **R16** Every item the record holds that a screen names (a document, a passage, a question, a project, a member, a capture) is a link opening its screen where one is built, and shows a card on hover or focus with what it is and the facts the screen's read answered for it (DEC-160 (1)–(3)); an item whose screen is not yet built carries its card only.
- **R17** The explanation level is the member's: the masthead control shows the current value (`level.prompt.name`, `level.pause.name`) and switches it in one click, as does Alt+Shift+I and the account screen (`screens-settings`); it is sent as `op=infolevelset` and read with `whoami`'s answers (§5 I5; `owed:infolevelset` until served, kept meanwhile on the device, default "Explain promptly"). A new member starts at "Explain promptly"; after their first month the shell asks once whether to keep it (DEC-162 (2)), recorded through the same op.
- **R18** Appearance is "Follow my device", "Light" or "Dark", kept on the device; print is always light (DEC-122 (2), DEC-138 (6)).

*Rows, picks and the hold strip* (DEC-176; canon §S)
- **R19** A table of rows offers each row's acts in a panel opened beneath it (by its name or the keyboard), never elsewhere on the screen; ticking rows brings the hold strip with its count, the acts that apply to every picked row, and "Unpick all"; sorting keeps each open panel with its row; on a phone each row reads as a card with every value labelled.

*The dock* (DEC-139 (1), (7))
- **R20** The assistant is **reachable** for this member when `op=assistantstate` answers `on: true` and either `op=accountreference` holds the member's own reference, `op=subscriptionsignin` `{step: "state"}` answers `connected: true`, or `op=groupkeystate` answers held and on. While reachable, the masthead's assistant button opens the dock with the panel `screens-inquiry` registers, beside the screen it serves; while not, no assistant control is drawn anywhere (absent, not greyed). Each read that does not answer is taken as not reachable.

*The screen contract*
- **R21** A screen module exports `SCREENS`: per screen `{id, reads, render, acts, words}`. `id` is a registry screen id. Each act names one op; every op a screen's acts name is in `OPS`, and is the op the registry lists for that screen, or a re-point §3 names. `interfacePage` refuses (throws, naming the screen) a screen whose `id` is not in `SCREEN_REGISTRY` or whose act names an op `OPS` does not hold, so a broken screen is never served.

*Access* (DEC-99; canon §L)
- **R22** Every control is reachable and operable by keyboard in reading order with a visible focus; every field has a label; every icon is beside a word; colour is never the only signal (DEC-138 (5)); motion stops under reduced motion. A test finds an accessible name on every control and a label on every field of every screen.

**Uses** · `interface-assets` (`ASSET_FILES`' names, R1); `setup-words` (`WORD_ROWS`, R5); `setup-page` (R31's session record); `op-declarations` (`OPS`, `NEEDS`, `SESSION_OPS`; its R2, R3); `op-grades` (`RUNGS`, `RUNG_ABSENT`; its R1, R2). Through the plane, each op's owner's documented answer: `control-plane` R18 (`whoami`), `instance-setup` R53 (`assistantstate`), R74 (`interfacewords`), `credentials` (`signout`, `accountreference`, `groupkeystate`), `control-plane` R65 (`subscriptionsignin`), `queue` R6 (`queue`).

**Invariants**
- **R23** No place is named in the shell's behaviour or words (README rule 7).
- **R24** Nothing the shell does records who opened what: it keeps no log of reads or of screens visited (K1888).

**Satisfies** · DEC-98 (R10); DEC-99, canon §L (R22); DEC-87, canon §F (R11); DEC-122 (R2, R7, R11, R18); DEC-138, canon §V (R1, R7, R18); DEC-139 (1), (7) (R7, R12, R20); DEC-154, N672 (R8); DEC-159–DEC-163, DEC-175 (R14, R16, R17); DEC-176, canon §S (R19); DEC-177 (R15); DEC-179 (R5); DEC-181 (R11); K1874 F1 (R3); principle 9.6 (R2); N559.

**Suggestions** · The kit object `cs` handed to screens holds `read`, `act`, `w`, `state`, `row`, `ref`, `mark`, `grade`, `due`, `sheet`, `sec`, `field`, `choice`, `checks` (the mockups' `mock-kit.js` names). Screens draw HTML strings; acts are bound by delegation on `data-act` attributes, so no inline handler exists. The shell may pass the page's own `store=scratch` to each op for live verification. A failed `interfacewords` read is retried once on the next screen change.

### 2.3 screens-settings

**Purpose.** The settings a member and an administrator use day to day: the roster and the group's AI key (`members`), the member's own account (`account`), how the assistant serves the member, with their own Claude sign-in (`connect`), and their own notes (`notes`). Pure: every read and act is an op, through `interface-shell`.

**Provides** — `SCREENS`, `SCREEN_WORDS`

*members* (Settings › Members; 15 registry acts)
- **R1** Reads: `memberlist` (the roster: handle, cover, role, capabilities, status, "formerly" per `handle.formerly`), `expertiselist`, `adminrecoverystep` (the one-administrator note while not met, as `setup-page` R16 states it), and for the group's key `groupkeystate`, `accountuses`, `ailimits`, `aiusage` and `accounthistory` with `owner: "group"`, and `aikeepawaystate`. Use is drawn summed, naming no member (DEC-188 (5)).
- **R2** Acts, each with its owner's documented arguments and drawn per R12 of the shell: `memberadd` (an invitation: `memberId` the short id, `cover`, and the capabilities ticked; the invitation answered shown once, with the sentence that Civicsmith sends no email), `membercaps`, `memberset`, `adminendorse`, `adminremove`, `expertiseconfirm`, `invitewithdraw` (from the invitation's row), `websitekeycreate`, `joinlinkenable`, `groupkeyset` (the key in the request's body only, never drawn again; then `groupkeyswitch` `on: true`, as `setup-page` R18 does), `groupkeyswitch`, `groupkeyremove`, `accountusesset` and `ailimitset` with `owner: "group"` (the AI account panel, R9), `aikeepaway` (on only with a reason of 1 to 2,000 characters, saying what it does first, as `setup-page` R18, R24). Each row's acts are in its panel (shell R19).

*account* (Settings › Your account; 7 registry acts)
- **R3** Reads: `whoami` (handle), `memberlanguage`, `expertiselist` (the member's own), `signerlist` (the member's own key). Acts: `memberlanguageset` (the languages the group's profiles answer); `handlechange` (the new handle checked as typed through `op=handlecheck`, drawing `handle.free`, `handle.taken`, `handle.characters`, and `handle.changeable` or `handle.fixed` from the answer; refusals `handle.refused.*`; DEC-186, DEC-188 (10)); `setpassword` (current and new password, the new typed twice alike, sent only when alike, as `setup-page` R3); `expertisedeclare`; `signerregisterown` and `signerrevokeown` (friction by their weight, shell R11); the explanation level (`owed:infolevelset`, shell R17) and appearance (shell R18). Links to `connect` and `notes`.

*connect* (Settings › The assistant; 7 registry acts and two re-points, §3)
- **R4** Reads: `assistantstate`, `aikeepawaystate`, `groupkeystate`, `groupkeynotice`, `disclosureof`, `accountreference`, `subscriptionsignin` `{step: "state"}`, and for the member's own account `accountuses`, `ailimits`, `aiusage`, `accounthistory` with `owner: "member:<me>"`. It draws exactly one of four situations from them: the group's key serves the member (with the member's daily allowance if a per-member limit is set, from `ailimits`); the member's own account serves them (what it is, never its key); nothing serves yet; the group keeps its material away (who, when and the reason in the administrator's words, "If you think this should change, ask an administrator", and no act). The rule of who pays is `ai.whopays`.
- **R5** Acts: `groupkeynoticeseen` and `disclosureshown` (the two notices, each `mark.outward`, before the first question on that account); connecting, offered in DEC-156's order, subscription first, then an API key, then skip:
  - **Subscription sign-in (DEC-156; K2147):** "Open Anthropic's sign-in page" sends `op=subscriptionsignin` with body `{step: "start"}` and opens the answered `address` in a new browsing context (`rel="noopener noreferrer"`); the field "The code from Anthropic's page" sends `{step: "code", code}` in the body only, never stored, logged or drawn again; `connected: true` draws the second situation. Refusals drawn by R13 of the shell, with these meanings until the design stream keys them: `NO_SIGNIN_WAITING` (the sign-in timed out or was never started: start again), `SIGNIN_REFUSED` (Anthropic's page did not accept the code; the runner's `detail` shown), `SIGNIN_UNAVAILABLE`, `SIGNIN_ADDRESS_UNEXPECTED`, `RUNNER_NOT_CONFIGURED`, `AGENT_WORKER_UNBOUND` (the sign-in cannot run on this group's Civicsmith yet), `AI_KEPT_AWAY` (`agent-runner` R17–R19, `agent-worker` R66, `control-plane` R65).
  - **API key:** `accountreferenceset` with the key in the request's body only, never drawn again.
  - **Disconnect:** a connected subscription sends `op=subscriptiondisconnect`; an API key, `accountreferenceremove`.
  - The member's own account panel (R9): `accountusesset`, `ailimitset` with `owner: "member:<me>"`.

*notes* (Settings › Your notes; 5 registry acts; DEC-136)
- **R6** Reads `notes` (the member's own). Acts: `notewrite`, `noterevise`, `notedelete` (reasoned or as graded, shell R11), `noteturn` (into an observation, hunch or question, as the owner's shape names), and `writinghelp` under the note's field only while the assistant is reachable (shell R20), its draft placed in the field labelled "Draft · the assistant's, asked by <handle>" and kept only by the member's own `notewrite` or `noterevise` (DEC-153 (3)). The screen states who can see the notes (protected words).
- **R7** When the group tells members what a court can reach (`op=courtnotice`), the first time this member keeps a note the screen shows DEC-136's sentence once, by its key.

*Common*
- **R8** After an act answers, the screen re-reads what that act changes and draws it; nothing is drawn as done before the answer.
- **R9** The AI account panel (DEC-188 (1)) is one render over an `owner`: what the account pays for (the uses `ai.use.<u>.name`, exploring `ai.explore.*` at group level only), its limits as a table with one form (`ai.limitfield.*` on refusal), this month's use summed, the changes with who and when. The same render serves `members` (`owner: "group"`) and `connect` (`owner: "member:<me>"`); `projectai` (T47) will reuse it.

**Uses** · `interface-shell` (`cs`, the screen contract, its R21); `setup-words` (`WORD_ROWS` keys). Through the plane: `membership` (the roster and administrator acts, R12–R13, R123–R124), `credentials` (R3, R9–R10, R33, R35, R43, R51–R62), `ai-use` (R12 and the limit acts), `instance-setup` (R53, R64), `hypotheses` (notes), `wizard-scripts` (R27, `writinghelp`), `control-plane` R65. Tests: `op-declarations` (`OPS`).

**Invariants**
- **R10** No key, code or password typed on these screens is written to the browser's storage, an address or a later request.

**Satisfies** · registry screens `members`, `account`, `connect`, `notes`; DEC-136, DEC-153, DEC-156, DEC-186, DEC-188; K2147; N897 (3).

**Suggestions** · Words for the sign-in refusals are a HANDOFF to the design stream (§3); until given, `SCREEN_WORDS` holds the meanings above. The "Need more? Connect your own account" link is a scroll to the section, not a route.

### 2.4 screens-intake

**Purpose.** Bringing material in and deciding what enters the record: capturing from an address, uploading a file, recording what a member saw (`capture`), vouching for or setting aside held captures (`held`), opening a file safely (`open-file`), and the doorbell's inbox (`inbox`). Pure, through `interface-shell`.

**Provides** — `SCREENS`, `SCREEN_WORDS`

*capture* (Add; three tabs, each its own; 6 registry acts, `capture` re-pointed to `captureupload`, §3)
- **R1** "From an address": `acquire` with the address; `capturerequest` ("Ask for this later"); `monitor` ("Watch this address"). `acquire`'s refusals are drawn each in its own sentence (`BAD_LOCATOR`, `SOURCE_REFUSED`, `FETCH_FAILED`, `EMPTY`, `TOO_LARGE`, as `setup-page` R10), any other by shell R13.
- **R2** "A file or photo" (`captureupload`, `capture` R86): the member chooses a file (on a phone the camera may open, `accept` and `capture` attributes); the screen asks "How you got it" (four choices, none preselected), "Where and when" and "What it shows, in your own words", and composes `statement` from the three in that order, each with its label, at most 2,000 characters, refusing to send while any is empty and saying which; it sends `POST /api/?op=captureupload&statement=<s>&name=<the file's name>` with the file's bytes as the raw body and the session header (`control-plane` R72). The answer's `existed: true` says the record already held the bytes; otherwise the screen says the capture waits in Held captures. `UPLOAD_NO_STATEMENT`, `EMPTY`, `TOO_LARGE` and `MEMBER_SESSION_REQUIRED` each in its own sentence. "Downloaded from a website?" offers the address tab instead. The photo reminder (`PHOTO_REMINDER`'s sentence) is drawn by its key.
- **R3** "What I saw or heard": `testify` with the member's words, where and when; `writinghelp` under the words field only while the assistant is reachable, helping word only what the member saw (DEC-153 (2)).

*held* (Add › Held captures; 4 registry acts; DEC-97)
- **R4** Reads `heldcaptures` (each capture with its grade, age, project, and the eligibility mark: a capture not eligible for a batch drawn `mark.gap.refused` with its reason, a capture for a question this member may not see `mark.gap.withheld`). Rows are picked (shell R19); the hold strip offers `release` (vouch for the picked; friction by its weight, shell R11), `heldsetaside` (one reason for all picked; the reason field has no writing help, K1841) and `heldrestore`. A row's thumbnail opens `open-file` for it.

*open-file* (4 states: low risk, high risk, held; 5 registry acts; DEC-168, K1888, K1892)
- **R5** Reads `threatof`, `originalstate`, `scanstatus`, `scanfindings`, `verdictnotes` for the capture, and draws one state: low risk (`openoriginal`); high risk (`safeview` first, `deepercheck`, and `openwithwarning` only after the member ticks both confirmations, and never for a file a scanner flagged or the built-in scanner has not checked within the week, as `file-safety` answers); held after a finding (`releasescanhold` with a reason, offered only as `file-safety` answers it may be). The safe view is drawn from `op=safeview`'s pages, labelled `mark.origin.machine` "Derived · a safe copy of the original", with "Cite the original, never the safe copy".
- **R6** Opening the original fetches its bytes with the session header and hands them to the browser as a file (a `Blob` behind an object address released once the download starts, `setup-page` R26's form); no link written carries a token.

*inbox* (Queue › Inbox; 3 registry acts)
- **R7** Reads `inbox` (each knock: what was handed in, its note, same-knocker mark, the identification ladder) and `inboxget` for one knock. Acts: `inboxpull` ("Move into the record"); `inboxresolve` to `discarded`, asking the reason first and sending it as `reason` (`setup-page` R11's rule; `RESOLVE_NO_REASON` drawn by its words, the knock left as it was); `sourcelink`.

*Common*
- **R8** shell R8–R13 hold on every screen; after an act, the screen re-reads what it changed.

**Uses** · `interface-shell`; `setup-words`. Through the plane: `acquisition` (R10), `capture` (R76–R81, R86), `capture-requests`, `monitoring`, `entities`/`provenance` (`testify`), `ratification` (`release`), `file-safety` (R6, R27–R32 and the open ops), `doorbell`, `store-door`, `sources`, `wizard-scripts` (`writinghelp`). Tests: `op-declarations`.

**Invariants**
- **R9** No act or read of these screens records, in the browser or in a request beyond the op's own, which member opened which file.

**Satisfies** · registry screens `capture`, `held`, `open-file`, `inbox`; DEC-97, DEC-153, DEC-168; K1852; N821 (upload's surface); the survey's §3 item 2.

**Suggestions** · "For which project" on the upload tab has no field in `capture` R86; T46 omits it (§7 T4). The camera's photo date and place (EXIF) are read in the browser only to pre-fill "Where and when", never sent apart from the bytes.

### 2.5 screens-daily

**Purpose.** Where a member starts and works each day: the group's home, their queue, finding what the group holds and finding inside it, and asking. Pure, through `interface-shell`.

**Provides** — `SCREENS`, `SCREEN_WORDS`

*home* (Home; registry acts `promote`, `startfrom`)
- **R1** Reads `queue` (the first items waiting on the member, by kind mark, with "Your queue (<n>)") and `projectdirectory` (each project the member may see, its question count and stage ladder `Forming, Investigating, Matured, Closed`). Heading: the group's name and its description from the public `groupidentity` read. Act: `promote` "Start a project" (a new project, as `control-plane` R73 and `promotion` take it: its title, the member its owner), opening `project` on success. `startfrom` is drawn only once T47's wizard runner can start what it lists (§6).

*queue* (Queue; 11 registry acts; DEC-110, DEC-131)
- **R2** Reads `queue` with the member's chosen sort (time added, time due, case, kind; `queue` R49) and grouping by case, drawing each item's kind by `mark.kind.<k>` and its summary and detail (`queue.<kind>.*` words where keyed, else the item's own `summary` and `detail`), due dates with `mark.due`, hints with `mark.hint` opening in place (what was matched, how, the false-alarm rate, what it is not). The three-kinds note is shown once per member (device).
- **R3** An item's acts are the item's own decorated `options` (`queue` R17), drawn when the op is one of the screen's registered acts (`taskresolve`, `taskforward`, `proposedispose` with a reason, `queuesnooze` with a date, `queuemute`, `adoptversion`, `keepversion`, `reminderanswer`, `promote`, `projectkeyset`, `exploreapprove`); any other option is drawn as "Open", a link to its subject's screen. An item resolved or muted leaves the list on the answer.

*finder* (Find; 6 registry acts)
- **R4** `search` with the member's words, results each with its grade and where it matched (`mark.origin.search`); `select` holds picked results together (the hold strip shows "<n> documents held together · until <time>", from `selection`), `selectionrelease`, `findin` ("Find in these", opening `find-in` over the selection); `frontier` draws `mark.gap.nobody` for where nobody looked; `calculationcreate` "Count" over the held set.

*find-in* (Find in this; 9 registry acts; DEC-164)
- **R5** The scope is set by where it was opened (a document, the held set, a project) and shown under "Look in". The member ticks what to find and an optional term and question; `findin` answers results by kind, each with its words as written, its passage and `mark.origin.search`; a kind with none says "Nothing here". Each result offers only the recording act of its kind (`recordpersonfact`, `recorddatedfact`, `standarddeclare`, `recordfact`, `tabledeclare`, `cite`), with the chosen question kept beside it; a result already recorded shows who recorded it. `standingquestionset` keeps finding over the scope; `search` "See all in Find". Finding records nothing.

*answers* (Find › Ask; registry acts `ruleanswer`, `search`, `standingquestionset`, `standingquestionend`; one re-point, §3)
- **R6** While the assistant is reachable: "Ask" sends the question through `op=ask` (`agent-worker` R54's answer: summary, sentences with their support, looks, `label` machine work), drawn with each holding as a link to its passage and the looks as where it looked; "Search instead" is `search`. While not: the screen is "Find and count" (`search`, and `ruleanswer` "Show how this was counted"). In both, `standingquestionset` and `standingquestionend`, with "New matches will arrive in your queue as a list". `AI_*` and `ASSISTANT_OFF` refusals by their words (`ai.refused.*`).

*Common*
- **R7** shell R8–R13 hold; after an act, the screen re-reads what it changed.

**Uses** · `interface-shell`; `setup-words`. Through the plane: `queue` (R6, R17, R48, R49), `tasks`, `project-roster` (`projectdirectory`), `promotion`, `retrieval` (`search`, `select`, `findin`, `frontier`), `calculations`, `people`, `events`, `standards`, `money`, `citation`, `answers` (`rule`, `standing*`), `agent-worker` R54, `reevaluation`, `action-clocks`, `inquiry`, `credentials`, `ai-use`. Tests: `op-declarations`.

**Satisfies** · registry screens `home`, `queue`, `finder`, `find-in`, `answers`; DEC-110, DEC-131, DEC-139 (3), (7), DEC-164; K1468.

**Suggestions** · The front doors ("What brought you here?") come from `startfrom`'s `doors` (`wizard-scripts` R23), `[]` until the design stream gives them; T46's home draws the section only when doors are given.

### 2.6 screens-inquiry

**Purpose.** The investigation's working screens: a project's home, one question with what supports and cuts against it, one captured document with its passages, and the assistant's panel beside them. Pure, through `interface-shell`.

**Provides** — `SCREENS`, `SCREEN_WORDS`

*project* (Projects › <project>; 6 registry acts)
- **R1** Reads `projectdirectory` (the project), `projectstage`, `projectparticipants`, `strengthbarof`, the project's questions (`list` of its inquiries) each with `inquirystrength`, and `projectaccountstate` (what pays for the assistant here, read-only; the AI-for-this-project screen is T47's). Acts: `promote` "Open a question" (a question in this project), `findin` (opening `find-in` with the project as scope), `strengthbarset` (high friction, `op-grades` R4's dialog), `projectinvite`, `projectjoin` (for a member who has not joined), `planopen` (opens the plan; the plan screen is T47's, so the screen says the plan was opened and lists it).

*question* (Projects › <project> › Question; 11 registry acts)
- **R2** Reads the inquiry (`image`), `inquirystrength` against `strengthbarof` (two grades and the phrase, never one score; its weakest part and what would raise it; `mark.strength.means`), `basisversions`, `hypotheses` (hunches, `mark.hunch`), `questionwaits` (what it waits on, with who set a document aside and their reason). Sections: Supports, Cuts against, Hunches, Concluding. Acts: `cite` (a passage, chosen from a document's passages or `find-in`), `sever`, `reinstate`, `narrow`, `conclude` and `withdrawconclusion` (terminal: shell R11's dialog; never with writing help), `hypothesishold`, `planopen`, `checkrequest` (by expertise), `heldrestore` (with a reason), `search` "Find another source".

*document* (Projects › <project> › Document; 10 registry acts)
- **R3** Reads the capture (`image`), its reading's passages (`reading`), `gradenote` ("Why B?"), `backlinks` (what cites it), `versionchain` (versions; a newer version marked changed), and the pages its reading could not make out (`document.unread.pages`). Acts: `findin`, `cite` (per passage), `gradenote`, `release` (by its weight), `attest` (signed: `op-grades` R1 grades it attested), `retire` (terminal), `monitor`, `identityclaim` (a person the record follows, from a name in it), `transcribe` (the member types a page's words), and `pagetranscribe` only while the assistant is reachable (DEC-190). Opening the original goes through `open-file`.

*the assistant dock* (registry screen `assistant`: the question with the dock; 3 registry acts)
- **R4** The panel says once what it is and what it never does (it finds, reads and checks; it never concludes, signs or sends), and whose account serves this member (`ai.account.*`). Acts on the screen's subject: `airunopen` "Work on this" (a run with the screen's subject as its context, the mode the owner's shape names), `suggest`, `airunclose` "Stop the run"; the run's progress and productions from `airun` and `airunlog`, every production labelled `mark.origin.machine`, never drawn as evidence. Refusals by their words: `AI_RUN_MODE_NOT_DEPLOYED`, `AI_KEPT_AWAY`, `AI_NO_ACCOUNT`, `AI_USE_SWITCHED_OFF`, `AI_LIMIT_REACHED` (`ai.refused.*`). On a test instance (N897 (2)) every AI output carries the test-instance label the plane marks it with (§5 I14), by its key.

*Common*
- **R5** shell R8–R13 and R16 hold; every grade is drawn as one mark (the scale's hue and icon and the letter) explaining itself (`mark.scale.<s>.*`, `mark.grade.reading`).

**Uses** · `interface-shell`; `setup-words`. Through the plane: `project-roster`, `project-stage`, `strength`, `promotion`, `membership` (project acts), `action-plans` (`planopen`), `inquiry`, `basis-versions`, `citation`, `contradiction`, `hypotheses`, `tasks` (`checkrequest`), `capture`, `ratification`, `attestation`, `monitoring`, `people`, `content`, `extraction` (`pagetranscribe`), `reading-pipeline`, `ai-runs`, `run-productions`, `credentials` (`projectaccountstate`). Tests: `op-declarations`.

**Satisfies** · registry screens `project`, `question`, `document`, `assistant`; DEC-82, DEC-139 (1), (7), DEC-160, DEC-190; canon §P (the assistant), §U (undetermined).

**Suggestions** · The mockups' assistant text ("$0.42 of your $2.00 today") comes from `aiusage` for the serving account; omit it when the read does not answer.

---

## 3. The screen set against the registry

All 17 screen ids of T46's set exist in `registry.json` on the PR head (48 screens): `home`, `members`, `account`, `connect`, `capture`, `held`, `open-file`, `inbox`, `finder`, `document`, `find-in`, `project`, `question`, `answers`, `assistant` (the dock is registry screen `assistant`, "The assistant panel", frame `dock`), `queue`, `notes`; the shell is not a registry screen. Their acts: 114 (home 2, members 15, account 7, connect 7, notes 5, queue 11, finder 6, capture 6, held 4, open-file 5, document 10, find-in 9, project 6, question 11, answers 4, assistant 3, inbox 3). Every act's op is in `OPS` on `tranche/T45` except `owed:infolevelset DEC-162` (account). Aliases resolve through `OP_ALIASES` (`signerregisterown`, `signerrevokeown`, `recordpersonfact`, `recorddatedfact`, `recordfact`, `strengthbarset`, `ruleanswer` → `rule`, `standingquestionset`, `standingquestionend`, `adoptversion`, `keepversion`).

**Registry corrections for the design stream (a HANDOFF to UX-DESIGN; its file, K945):**
1. `capture`'s "Capture a file or photo" names `capture`; the upload is `captureupload` (served, `capture` R86). The draft's screen calls `captureupload`.
2. `connect`'s `owed:subscriptionsignin DEC-156` is served (`control-plane` R65); and its "Disconnect" names `accountreferenceremove` only, while a subscription disconnects by `subscriptiondisconnect` (served).
3. `answers`' "Ask" names `ruleanswer` (`rule`: a rule service's answer, `answers` R7); a plain-words question is `op=ask` (`agent-worker` R54). The draft's screen calls `ask` and keeps `ruleanswer` for "Show how this was counted".
4. Words owed (DEC-179 (5)): the screens' own sentences (`screen.<id>.<part>`, held meanwhile in each module's `SCREEN_WORDS` from the mockups' English at `0ceb3240af`); the sign-in refusals (§2.3 R5); the test-instance label; the cards' "Here:" lines for record data; the front doors (`wizard-scripts` R23 `doors`).

---

## 4. How it is tested (P7)

Every requirement is tested at the module's interface, never by reading source text. As `setup-page` is tested today (`bio-plane/test/m/setup-page/fixture.mjs`: the served page's script run over a document stand-in with a scripted `fetch`, every request recorded with its address, body and headers; `worker-page.test.mjs`: the page end to end over Miniflare and the real plane):

1. **Screen tests (each screen module, over a fake plane).** `SCREENS`' render and act functions run in node over a DOM stand-in, with a fake op client answering each op in its owner's documented shape. A test asserts what is drawn (each word by key, filled; each state of R10; each mark) and, for each act, which op is called, with which query and body, under which header, and what is drawn on success and on each refusal. One table per screen lists every registry act: a test fails if a screen draws an act not listed, or a listed act is not drawn in the state where it applies (DEC-139 (6)'s "every screen draws exactly its registered acts").
2. **Shell tests.** The served page (`interfacePage`) through the same stand-in: the session hand-over and sign-out (R3, R4) with a sentinel token found only in headers; words (R5) by rendering every screen in every state and checking every text node; R10's four states; R11–R13 over every act; R14–R15 (timings with a fake clock, no nesting); R21 (a screen with a foreign id or an unserved op throws); R22.
3. **One end-to-end suite** (in `control-plane`'s tests, the first module that can serve it): Miniflare over `src/plane/index.mjs`, `GET /app` and `/app/assets/*` served with the policy and nonce (`answer-envelope` R6), a member signed in through the real setup page's login, then home, capture with an upload, held and release, read back through the real ops.
4. **Assets.** `interface-assets` R1 by byte comparison with git at `ASSETS_COMMIT`.

**The DOM stand-in (BOB's; §7 T2).** The fixture's hand-written stand-in (`fixture.mjs`:78–162) answers only the selectors the setup page uses. Recommended: a shared, small DOM stand-in for the interface's tests, owned by `interface-shell`'s tests and imported by the screen modules' tests (a test-only use of an earlier module); alternatively a dev dependency (`linkedom`, no install scripts).

---

## 5. Entries for T46's plan

Numbered `I1`–`I15` here; BOB numbers them `T46-n` at the opening.

- **T46-I1 · membership** · (N897; K657) R83 `MODULE_ORDER` gains `interface-assets`, `interface-shell`, `screens-settings`, `screens-intake`, `screens-daily`, `screens-inquiry`, after `store-door`, in the act that enters them in `modules.json` (empty `paths`, `tests`, K1043) and `layers.md`'s layer-11 row · req: R83 · at T46's opening.
- **T46-I2 · setup-words** · (N897; DEC-179; K2484's form) R1, R2: `WORD_ROWS` re-taken from `words.json` at the merge of the design stream's PR at T45's close (1,504 words, 550 protected at `0ceb3240af`; counts restated at the merge commit), `WORDS_COMMIT` that commit · req: R1, R2 · L11, before `instance-setup`.
- **T46-I3 · wizard-scripts** · (N897; DEC-139 (5)) R13: `SCREEN_REGISTRY` re-taken from `registry.json` at the same merge (and at the later commit carrying §3's corrections if the design stream merges them before T46's L11 START) · req: R13.
- **T46-I4 · setup-page** · (N897 (1)) R31 new: the session record is exported as `SESSION_STORE_KEY` (`"bio-session"`, sessionStorage) with its shape `{t, e, c, w}` (`bio-plane/src/setup-page/index.mjs`:918, :1062), stated as the record the interface reads; R32 new: after sign-in a member lands on `/app` (the interface's home), and the panel offers "Open your group's Civicsmith" (`/app`) beside its settings sections, per §7 Q1 · req: R31, R32.
- **T46-I5 · instance-setup** · (DEC-162, DEC-175; `owed:infolevelset`) R79 new: `infoLevelSet({level, by})` (`op=infolevelset`, `level` `prompt` or `pause`) and `infoLevel({viewer})` (`op=infolevel`), a per-member setting beside R64's language, default `prompt`, with `asked_at` for the one-month question recorded by the same act · req: R79.
- **T46-I6 · op-declarations** · (I5) R50 new: `infolevelset` (mutating, member and admin sessions, `by` stamped, `NEEDS` null) and `infolevel` (a read, `viewer` stamped); R34 holds (both in `ACT_HELP_ABSENT` or explained) · req: R50.
- **T46-I7 · interface-assets** · (N897 (1); DEC-138; N559) new module, R1–R4 (§2.1) · req: R1–R4 · L11, after `store-door`.
- **T46-I8 · interface-shell** · (N897 (1); DEC-87, -98, -99, -122, -138, -139, -154, -159–-163, -175–-177, -179, -181; N672) new module, R1–R24 (§2.2) · req: R1–R24 · after I7, I4.
- **T46-I9 · screens-settings** · (N897 (1), (3); DEC-136, -153, -156, -186, -188; K2147) new module, R1–R10 (§2.3); registry `members`, `account`, `connect`, `notes` · after I8.
- **T46-I10 · screens-intake** · (N897 (1); DEC-97, -153, -168; N821) new module, R1–R9 (§2.4); registry `capture`, `held`, `open-file`, `inbox` · after I8.
- **T46-I11 · screens-daily** · (N897 (1); DEC-110, -131, -139, -164) new module, R1–R7 (§2.5); registry `home`, `queue`, `finder`, `find-in`, `answers` · after I8.
- **T46-I12 · screens-inquiry** · (N897 (1), (2); DEC-82, -139, -160, -190) new module, R1–R5 (§2.6); registry `project`, `question`, `document`, `assistant` · after I8.
- **T46-I13 · control-plane** · (N897 (1); principle 9.6; N559) R75 new: `GET /app`, `/app/<path>` answer `interface-shell`'s page and `GET /app/assets/<name>` `interface-assets`' files (§1.2); R76 new: `infolevelset` and `infolevel` routed through `instance-setup`'s map with the stamps I6 declares; the end-to-end suite of §4 (3); uses gain the six modules · req: R75, R76 · after I7–I12.
- **T46-I14 · run-rules, ai-runs (the test-instance mark)** · (N897 (2)) whatever entry applies Q2's answer also marks each AI output on a test instance in its answer (a field the dock reads, §2.6 R4); its words are owed by the design stream · req: per that entry.
- **T46-I15 · the channel** · (K945, K1430) one HANDOFF to UX-DESIGN: §3's corrections 1–4 and the `SCREEN_WORDS` keys with their English, for `words.json` and `registry.json`; not a precondition of any job (each module carries its own words meanwhile) · req: none.

**Left to T47, with hard reasons.** The other 31 registry screens (investigation tools, publication, action, `wizards`, `ties`, `projectai`, `translations`, `security`, `group-identity`, `person`, `archive`, `doorbell`'s page within the shell's frame): Bob's ruling N897 (1) ("the rest in T47") and K617's size bound. `startfrom` on `home` and the wizard guide in the dock: a dependency not yet built (N821's runner, screen side, is T47's with `wizards`). People (rail place): its screens (`person`, `explore`) are T47's. The project's link to `projectai`: that screen is T47's (the panel render, §2.3 R9, is ready for it). The action layer's screens: the v0.2 constructs are not yet drawn (survey §3). Settings sections still on the setup page (who the group is, places and offices, security tools, translations, recovery codes): their screens are T47's; the setup page keeps serving them (§7 Q1).

---

## 6. Owed acts

- `owed:infolevelset` (account; DEC-162): proposed served in T46 by I5, I6, I13; until then the level is kept on the device (§2.2 R17).

No other act of T46's screens is owed: every other registry act names an op `OPS` holds. Three registry acts are re-pointed to served ops (§3, items 1–3).

---

## 7. Open points

### For Bob (UX; P17)

**Q1 · Where a member lands after signing in, and where the settings not yet redrawn live.** Today signing in shows the setup page's panel (its settings sections, the old record browser). With T46, the new screens exist beside it, but some group settings (who the group is, places and offices, security tools, translations, recovery codes) are not redrawn until T47.
- **A · Land on the new Home (recommended).** Signing in opens the new interface's Home. Settings › "Group settings" opens the setup page's sections for what is not yet redrawn; the setup page also links back to the new interface.
- **B · Land on the setup page, with a link to the new interface.** Nothing changes for today's sign-in; members open the new screens from a link.
- **C · Land on Home, and hide the setup page's day-to-day sections** (intake form, record browser) once the new screens cover them, keeping only settings there.

*Recommendation:* **A**: it lets you use the design you reviewed from the first screen, and nothing you need is out of reach. C can follow in T47 once every settings screen is redrawn.

### For BOB (technical; decided without Bob, recorded in `rulings.md`)

- **T1 · How screen code reaches the browser.** (a) self-contained functions serialized by `toString()` (§1.3; recommended: testable in node as written, no build step); (b) template-string scripts (the setup page's form; harder to test piecewise); (c) a browser bundle built by `bundler` and embedded as a string (cleanest code, a new build path in layer 1).
- **T2 · The DOM stand-in for tests.** (a) one shared stand-in in `interface-shell`'s tests (recommended; no new dependency); (b) `linkedom` as a dev dependency (fuller DOM; a supply-chain addition, reviewed as F20's rule asks).
- **T3 · Faces in the bundle.** All 15 faces (~0.79 MB, ~1.05 MB as base64; the plane bundle 13.9 MB → ~15 MB, under `bundler` R31's 32 MiB warning) (recommended: DEC-138 (2) ships Latin, Latin Extended and Vietnamese); or Latin only (~0.33 MB) until a group's language needs more.
- **T4 · The upload's statement.** `capture` R86 takes one `statement`; the design asks three fields and a project. (a) compose the statement from the three, labelled, and omit the project (recommended; §2.4 R2); (b) ask one field and send the design stream a re-draw; (c) amend `capture` R86 to take the method and project (a T46 `capture` entry).
- **T5 · Placement.** After `store-door` (recommended: the interface reads `OPS`, `NEEDS` and `op-grades`, and its tests check every act against `OPS`) versus directly after `setup-page` (then the act gate's data would be copied, and the check would move to `op-declarations`' tests).
- **T6 · Routes.** Path routes `/app/<screen>/<subject>` with history (recommended: links survive a reload and can be shared inside the group) versus fragment routes (`/app#…`; one route, but the setup page strips fragments on its own page and the two conventions would differ).
- **T7 · Words not yet in `words.json`.** Each screen module's `SCREEN_WORDS` (recommended; translated once the design stream adds them and `setup-words` re-takes the list) versus waiting for the design stream before each screen's job (a dependency across accounts, K1430 says not to make).
