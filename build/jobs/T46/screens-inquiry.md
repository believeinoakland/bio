# screens-inquiry (T46)

**Status** · session_01YMxGacVK3G14cDwVAkXxu7 · depth 2 · WORKING · handled B3

## J1 · QUESTION

The screen contract's calling shape (interface-shell R21 and its Suggestions) is not yet pushed by INTERFACE-SHELL #1. I build against exactly the reading SCREENS-DAILY #1 posted as its J1 (SCREENS an array of `{id, reads, render, acts, words}`; `reads(view)` → `{name: {op, query, empty?}}`; `render(cs, view)` → an HTML string with `view = {subject, data, me, ui, reachable}`; `acts` `[{op, label, send(view, el), done?}]` drawn by `cs.act(op, {label, data})`; the kit `cs` as its point 5), so that the four screen modules share one shape. My tests run the screens over a small fake kit of that shape under my own test path, replaced by interface-shell's stand-in when its merge is announced. Whatever you answer SCREENS-DAILY #1 applies to me too: one answer to both is enough.

## J2 · QUESTION

R6 (K2976) needs two things from interface-shell's kit that J1's shape does not give, since the kit's reads and acts carry the member's session token in `Authorization` (its R3):

1. **A call under another bearer.** `airunopen` (opened under her minted `ai` credential) and each `airundispatch` must present the minted credential, not the session, in `Authorization: Bearer`. My reading: the kit gives `cs.call(op, {query, body, bearer})` answering a promise of the parsed answer; `bearer` absent means the session; present, it replaces the session token in the header for that one request and appears nowhere else. `aicredentialmint` and `aicredentialrevoke` go under the session through the same call.
2. **Memory that survives a redraw but not a reload, and a close hook.** The credential lives only in page memory. My reading: the dock's `ui` object (J1 point 3) is kept by the shell in memory across redraws of the same page and never written to storage, the address or the record; and the shell calls the dock panel's optional `closed(cs, view)` when the member closes the dock or leaves the page (`pagehide`), where I revoke. A reload loses `ui`, so the dock finds an open run of hers it holds no credential for and offers a new run (R6).

I build against this reading, behind my own fake kit, and replace it with interface-shell's when its merge is announced. Please confirm or replace, and relay to INTERFACE-SHELL #1 if confirmed (it touches its R3 test, which finds the session token only in headers: a request carrying the `ai` credential carries no session token).

## J3 · QUESTION

R4 and R6: what the dock's `airunopen` body carries. `ai-runs` R9 needs both principals, a well-formed `skillVersion` (`run-rules` R8) and declared `bounds` (`run-rules` R3); none of my sources says where the dock takes them. My reading, which I build now:
- `run`: a fresh id the page draws (`RUN-` and 16 random hex); `mode`: `check` (the one deployed mode, R40; `plan` only with a plan named, so the dock offers `plan` nowhere in T46: the project's plans are T47's screen);
- context: on `question` and `assistant`, `{contextType: "inquiry", contextId: <the question>}`; on `project`, `{contextType: "project", contextId: <the project>}`; on `document`, the project the document is filed in when the screen knows it (its `place`), else "Work on this" is not drawn there (`RUN_CONTEXTS` holds only inquiry and project);
- `principalClaude`: `member:<whoami.member>` (her own Claude principal); `skillVersion`: the pack and edition `op=agentpack` answers, read once by the dock (if it names none, "Work on this" is not drawn and the dock says the assistant is not ready, `state.failed`);
- `bounds`: `[{bound: "wallclock", allowed: 1800000, unit: "ms"}, {bound: "fetches", allowed: 0}, {bound: "subsessions", allowed: 0}]` (a member's check reads what the group holds, fetching nothing);
- the minted credential's `writes`: `["airunopen", "airundispatch", "airunclose", "suggest"]`, `principalKind: "member"`, `taskScope` left to its default, `expiresInDays: 1`, `tokenId` `dock-` and 16 random hex. Until T46-59 declares `airundispatch`, the mint refuses `AI_SCOPE_UNKNOWN_OP` and the dock draws that refusal; my tests stub the plane.
Please confirm or name the values; only the skillVersion source and the bounds would change what I build.

## J4 · REPORT

What my op survey found in the ops my requirements name, against their owners' code on `tranche/T46` (I build on the readings given; none blocks me, each is BOB's to place):
1. R1 "the project's questions (`list` of its inquiries)": `list` neither filters by project nor answers one per row, and no op serves `basis-versions` R41 (`projectQuestions`) over HTTP. I take the project's questions as its document's `cites` references to `INQ-` ids not `severed` (R41's own test), read from `image` of the project, their titles from `list` (`type=inquiry`). An op for R41 would be cleaner (control-plane, or basis-versions' map).
2. R1 `promote` "Open a question": a new inquiry written with `project:` is fenced by the project (promotion R53) but is not among the project's questions by R41 until the project's document cites it, and no op adds that edge short of a full revision of the project's bundle. I write the inquiry (allocid, then promote with `project:`) and open its screen; it shows on the project screen only once cited. A served "draw this question into the project" act is owed.
3. R1 `strengthbarset` (→ `strengthbar`) sets the group's default bar, administrators only (`STRENGTH_BAR_NOT_ADMIN`); a project's own bar is `required_strength` in its document. The registry and the word say "Set the project's bar". I draw the act as the requirement says and it sets the group's bar: the protected label is then untrue. Needs a ruling (and perhaps a design-stream correction).
4. R2 `sever`, `reinstate` act only on a project's `cites` edges: an inquiry is refused `NOT_A_PROJECT`, so on the question screen they cannot remove a leg. I send `project=<the question>` as the requirement implies, and the plane refuses; I draw the refusal (R13).
5. R1 `projectdirectory` lists only discoverable projects the member does not see in full; I use it as "she has not joined" (subject listed → `projectjoin` drawn), beside the existence answer `PROJECT_SEEN_NOT_A_PARTICIPANT` on the project's reads.
6. R3 `attest` is an RFC 3161 timestamp over the capture's hash, not a member's signature, though `act.attest.does` says "Signed with your key"; `monitor` runs one check now and does not subscribe, though `act.monitor.does` says it watches. Words for the design stream.
7. R7: `airunlog` entries and the `suggest` answer carry no `untested`; the dock takes the label from the run (`airun` `session.untested`, and `airunopen`'s answer) for every output of that run.
8. `aicredentialmint`, `transcribe`, `airunopen` and `airunclose` read `at` from the body and the door does not strip it, so a client could date its own act. The dock never sends `at`; the door (control-plane) may want to strip it.
