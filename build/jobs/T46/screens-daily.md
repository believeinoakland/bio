# screens-daily (T46)

**Status** · session_01RJBRXS3sxyhSh6P5LL6g9S · depth 2 · COMPLETE · handled B7

## J1 · QUESTION

The screen contract's calling shape is interface-shell's (its R21 and Suggestions), and INTERFACE-SHELL #1 is building it in parallel with nothing pushed yet. My four screen-module siblings and I all need the same shape. My reading, which I am building against now, and which I ask you to confirm or replace (and, if you confirm, relay to INTERFACE-SHELL #1 and the other screen jobs):

1. `SCREENS` is an array of `{id, reads, render, acts, words}`. `words` is the list of word keys the screen may draw (keys of `WORD_ROWS` or of the module's `SCREEN_WORDS`).
2. `reads(view)` answers an object `{name: {op, query}}` (query an object of strings); the shell sends each read as `op=<op>` under the session, and hands the screen `view.data[name]` = `{state: 'loading'|'empty'|'failed'|'ok', value, refusal}` (R10). The screen decides "empty" for its own read shape with an optional `empty(value)` beside `op`.
3. `render(cs, view)` answers an HTML string for the main area under the path; `view` = `{subject, data, me (whoami's answer), ui (the screen's own per-visit state, an object the screen may mutate through cs.set(name, value), which redraws), reachable (R20's boolean)}`.
4. `acts` is an array of `{op, label (a word key), send(view, el) -> {query, body} | null}`; the screen draws an act with `cs.act(op, {label, data: {...}})`, which the shell turns into the gated, weighted button of R11–R12 (or nothing when R12 refuses it), bound by delegation on `data-act`; `el.dataset` carries the data. On the answer the shell draws a refusal beside the act (R13) or, on success, calls the act's optional `done(view, answer, cs)` (to open another screen with `cs.go(screen, subject)` or to set ui state) and then re-reads the screen's reads (my R7).
5. The kit `cs` holds at least `w(key, fills)`, `state(readName, view, inner)` (draws the four states, calling `inner(value)` for data), `act`, `go`, `set`, `ref(kind, id, text, card)`, `mark(kind, arg)` (kind marks, `due`, `hint`, `origin`, `gap`), `grade`, `row`, `sec`, `sheet`, `field`, `choice`, `checks`, `date(iso)` (R6), and `esc`.

What I build if you do not answer before I finish: exactly the above, with my tests running the screens over a small fake kit of this shape in my own test path, to be replaced by interface-shell's stand-in when its merge is announced.

## J2 · QUESTION

R1 (home) reads `projectdirectory` for "each project the member may see, its question count and its stage ladder". `project-roster` R9's `projectdirectory` answers something else: only the discoverable projects the caller does NOT see at full sight (projects to ask to join), each `{id, name, request}`, with no question count and no stage. No op I have found answers a member's own projects with their question counts.

My best reading, which I am building now: Home draws "What the group is working on" from `search` with `q=type:project` (query-language R3's `type:` field; retrieval's sight gate gives exactly the projects the member may see), each hit's `title` as a link to `project`, and its stage ladder from the hit's `current_state` (Forming, Investigating, Matured, Closed; an unknown state draws no step on), with no question count drawn; and it also reads `projectdirectory` and, when it lists any, draws them under a second heading "Projects you could join" (name only, no act: `projectrequest` is not a registered home act). `search` is not a registered home act, only a read, so R21 is not touched.

Please confirm, or name the op that answers a member's projects with their question count (or rule the count out for T46).

## J3 · REPORT

Found in another module, not mine to change (reported, not verified by an integrated run): `action-clocks`' `reminderSet` and `reminderAnswer` store and compare `set_by` as the positional `member:<id>` (control-plane stamps `author` that way, cp:1688), while `action-producers`' `action-reminder` producer keeps an item only when `x.set_by === me`, `me` being the queue's bare member stamp (`bio-plane/src/action-producers/index.mjs`:655); its tests use fakes with a bare `set_by`. If so, a real reminder never reaches the queue, and the queue screen's `reminderanswer` act (my R3) is never drawn on a live instance. The fix belongs to action-producers (compare both forms) or action-clocks.

## Completion (SCREENS-DAILY #1)

**Entry applied.** T46-57: `home`, `queue`, `finder`, `find-in`, `answers` (R1–R7), built fresh to interface-shell R21's contract as K2996/K2998 fixed it (B2, B3), with Home's projects as K3000 rules (B4: `search` `type:project`, stage from `current_state`, no question count; `projectdirectory` under "Projects you could join", name only).

**Files** (BOB enters them in `modules.json`, K1043): code `bio-plane/src/screens-daily/` (`index.mjs`, `words.mjs`, `home.mjs`, `queue.mjs`, `finder.mjs`, `find-in.mjs`, `answers.mjs`); tests `bio-plane/test/m/screens-daily/` (`kit.mjs`, `contract.test.mjs`, `home.test.mjs`, `queue.test.mjs`, `finder.test.mjs`, `find-in.test.mjs`, `answers.test.mjs`).

**Readings taken (each tested):**
- R1: the description is drawn from `groupidentity`'s `description` when it answers one; the public read (instance-setup R10) answers none today, so Home says "Your group has not described itself yet." A description would need `groupdescription` (membership R110) or a field on `groupidentity`: noted for BOB, not a defect of mine.
- R3: an item's acts are its decorated `options` and the doors its `disposition` names (`op` when available, `acts`, `instead`; queue R12, R46), since `taskresolve`, `proposedispose`, `adoptversion`/`keepversion`, `reminderanswer` and `exploreapprove` reach a member only there; `queuemute` (item form) on every item that is not an obligation; `queuesnooze` on each case's heading (it is per case, queue R21). "Open" is drawn once per item, to the subject's screen where T46 builds one.
- R2: the sort is the route's subject (`/app/queue/<sort>`), so it survives reload and history; items are grouped by case in the feed's order for every sort. The three-kinds note's "once per member on the device" uses `localStorage` (keyed by member), guarded, as the kit offers no device store; a device that cannot keep it does not show it.
- R4: search results and the held set's handle are kept in the screen's page memory (`view.ui`); "until" is the handle's time of day (it lapses five minutes after last use); "Count" sends `calculationcreate` `kind: count` over the held set (`inputs: [{name: "held", set: <handle>}]`), question and period asked in the act's dialog.
- R5: the scope is the route's subject (`PROJ-…` a project, `sel-…` the held set, else a capture digest); recording bodies follow each owner's documented fields, the fields a member must supply asked in the act's dialog; `cite` uses citation's `found` form in the query.
- R6: `ask`'s answer is a stream; `done` takes its last event whether the shell hands the raw text, the parsed events or the last event. "Show how this was counted" sends `ruleanswer` with service `occurrences` over the member's words: the requirement names no service, so this is my reading. `ASSISTANT_OFF` and `AI_PART_NOT_DEPLOYED` have no `ai.refused.*` word, so they are this module's own rows (`screen.answers.refused.*`).

**Deferred:** the re-point of my tests to interface-shell's shared DOM stand-in and harness, at its merge's CHANGE (B3). Until then they run over `kit.mjs`, a stand-in at R21's contract.

**Found in another module:** J3 (action-producers vs action-clocks `set_by`, forwarded by BOB to ACTION-PRODUCERS #2). Also, not a defect: `groupidentity`'s public answer carries no description (R1 above).

**Tests and checks:**
- `node --test bio-plane/test/m/screens-daily/*.test.mjs`: tests 41, pass 41, fail 0. No layer tests are named (manifest).
- `checks/format.mjs`: 0 failures. With my paths entered locally (not committed): `architecture.mjs … screens-daily` 0 failures (14 product files); `coverage.mjs … screens-daily` 7 of 7 live ids named; `ownership.mjs … screens-daily tranche/T46` 0 failures. As committed (empty `paths`, K1043) ownership and coverage fail on my files only for want of the entry.
- `checks/run.mjs`: format 0, channels 0; architecture/ownership failures only for my files' missing entry; coverage reds are other L11 jobs in flight and mine pending the entry.

Size (session_01RJBRXS3sxyhSh6P5LL6g9S): test runs 12, module lines 1082 (tests 866)

## J4 · COMPLETE

T46-57 applied: home, queue, finder, find-in, answers (R1–R7), to interface-shell R21 as K2996/K2998, Home per K3000. Files for modules.json: paths bio-plane/src/screens-daily/ (index, words, home, queue, finder, find-in, answers .mjs); tests bio-plane/test/m/screens-daily/ (kit.mjs and five *.test.mjs plus contract.test.mjs). 41/41 pass. With the paths entered: architecture, coverage (7/7), ownership 0 failures. Readings taken (R1 description, R2 sort route and device note, R3 dispositions' doors, R4–R6 details) and the deferred re-point to the shell's stand-in are in my record's Completion section. Size: test runs 12, module lines 1082.

## Completion of B5 (CHANGE, K3002)

`tranche/T46` merged. Applied the kit additions my screens need: the clock is `cs.now()` everywhere (Home's new project, the queue's due marks and question, the standing questions' end); `adoptversion` (`why`) and `standarddeclare` (`reason`) collect the member's own words in their dialog and name that field as `reasonField`, so the words are the act's reason and no second one is asked (R11 as amended). `cs.value`'s checkbox `true`/`false` was already read. `parts`, `view.origin`, `cs.digest` and outside links are not needed by these screens (promotion computes the bundle's digest itself). New own rows: `screen.queue.why`, `screen.find-in.field.reason`. Tests: 42/42 (a new one for the page's clock). With paths entered locally: architecture 0, coverage 7/7, ownership 0; format 0.

Size (session_01RJBRXS3sxyhSh6P5LL6g9S): test runs 15, module lines 1096 (tests 878)

## J5 · COMPLETE · re B5

B5 (K3002) applied after merging tranche/T46: cs.now() is the clock throughout; adoptversion and standarddeclare collect the member's words in their dialog as their reasonField. Two own rows added (screen.queue.why, screen.find-in.field.reason); files unchanged from J4's list. 42/42; with paths entered: architecture 0, coverage 7/7, ownership 0. Details in my record.

## J6 · COMPLETE · re B6

B6 (K3004): tranche/T46 merged (145c1cfcd8). None of the merged services is one these screens call directly or change; nothing to change. Re-run: 42/42; with paths entered: architecture 0, coverage 7/7, ownership 0; format 0.

## Completion of B7 (CHANGE, K3007: interface-shell merged)

`tranche/T46` merged (3eb60f7750). Tests re-pointed: `kit.mjs` (my stand-in) is removed; `page.mjs` boots the real page `interfacePage(SCREENS)` over the shell's `harness.mjs` and `dom.mjs`, and every test now drives the served page (the shell's kit, gate, friction, refusals and re-reads). Checked each kit signature I use against `browser.mjs` and corrected the screens:
- `cs.state`: the four-argument form I used dropped its options (the shell reads `(name, view, inner)` or `(name, inner, opts)`): now `cs.state(name, inner, {empty})`, so each screen's own empty words are drawn.
- Dialogs: the shell opens an act's `dialog` only for a terminal or signed act (R11); none of mine is. Every act that asks the member's words (queue: forward, snooze, adopt's why, reminder date, question from a hint, project key; finder: Count; find-in: each recording act's fields) now draws its fields in place, with the act, in a native disclosure (`<details>`, no script), read by `send` through `cs.value`; an empty required field answers `{refuse}` in the screen's words. `adoptversion` and `standarddeclare` name their field as `reasonField` (R11, DEC-88).
- Links I draw myself (the queue's sorts, "Open", Home's "Your queue (n)") carry `data-nav`, so the shell routes them with history.
- `cs.title(undefined)` draws the screen's own name; a project, document or question is the kit's reference (`ref`), a link once its screen is registered beside these (screens-inquiry), its card meanwhile.
- The queue's three-kinds note is decided once per visit and kept in page memory, so redraws keep it (found by the real page's repeated draws).
- Finder: the "no document holds all the words" note is drawn when the search reads empty (found by the real page).
New own row: `screen.queue.fieldfirst`. Files: `bio-plane/test/m/screens-daily/kit.mjs` removed, `page.mjs` added; the rest as J4.

Tests: 45/45 over the served page (the words check proven by a planted raw string failing it). With paths entered locally: architecture 0, coverage 7/7, ownership 0; format 0.

**Kit gaps remaining (REPORT J7):** `ask`'s stream; reads weighed as reasoned; `frontier` in no session set. Each is described in J7.

Size (session_01RJBRXS3sxyhSh6P5LL6g9S): test runs 27, module lines 1135 (tests 918)

## J7 · REPORT

Kit gaps found re-pointing to interface-shell's real page (B7). None is mine to fix; each leaves part of a registered act unusable on a live page.

1. **`ask`'s answer is a stream (agent-worker R54: NDJSON, the answer the last event).** The shell's op client reads every answer with `r.json()`, so a multi-line answer reads as no answer ("no answer" drawn beside Ask), and the Ask screen never shows an answer on a live plane. My `done` already takes the last event from raw text, a list of events or one event; it needs the op client (or `cs.call`) to hand one of those for `ask` (e.g. parse `application/x-ndjson` and answer its last line). screens-inquiry's dock likely meets the same. Owner: interface-shell.
2. **Reads drawn as acts weigh "reasoned".** `search`, `findin`, `frontier` and `ruleanswer` (all `mutating: false`) are in neither `op-grades`' `RUNGS` nor `RUNG_ABSENT`, so the shell asks the member for a reason before every search, find-in and count explanation, and adds `reason` to the request. Fix: `op-grades` `RUNG_ABSENT` with an `observational` ground for these reads (then the shell runs them on press), or the shell weighing any non-mutating op as `none`. Owner: op-grades (or interface-shell).
3. **`frontier` is in no session set.** It is a read (admission lets every session reach a read), but it is in neither `SESSION_OPS.member` nor `.admin`, and interface-shell R12 draws an act only when the session set holds it, so Find's registered "See where nobody looked" is never drawn. Fix: `op-declarations` adding `frontier` to both session sets (as `search` and `findin` are), or R12 admitting reads. Owner: op-declarations (or interface-shell). My test proves the screen draws and sends it once the set holds it.

Also noted, not a gap: the shell opens a `dialog` only for a terminal or signed act, so my lower-weight acts that ask the member's words draw their fields in place (a native disclosure), read by `send`; and the queue's note-once keeps its device mark in `localStorage` directly, as the kit has no device store.

## J8 · COMPLETE · re B7

B7 (K3007) done: tranche/T46 merged; tests re-pointed to interface-shell's harness.mjs and dom.mjs (my kit.mjs removed, page.mjs added) and run on the real served page; kit signatures checked against browser.mjs and the screens corrected (cs.state's form, acts' fields in place since the shell's dialog is terminal/signed only, data-nav on my links, cs.title, the queue note kept per visit, finder's widen on empty). 45/45; with paths entered: architecture 0, coverage 7/7, ownership 0; format 0. Kit gaps remaining: REPORT J7 (ask's stream; reads weighed reasoned; frontier in no session set). Details in my record.
