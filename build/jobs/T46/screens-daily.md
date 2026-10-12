# screens-daily (T46)

**Status** · session_01RJBRXS3sxyhSh6P5LL6g9S · depth 2 · WORKING · handled B3

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
