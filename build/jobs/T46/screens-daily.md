# screens-daily (T46)

**Status** · session_01RJBRXS3sxyhSh6P5LL6g9S · depth 2 · COMPLETE · handled B6

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
