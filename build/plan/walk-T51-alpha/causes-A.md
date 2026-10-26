# Causes of walker A's MAJOR findings (alpha walk T51), deployed commit 7b5ace1d19

Method: the record read whole; the code read in the worktree `scratchpad/diag-A` (detached at 7b5ace1d19, only a scratch test added and removed); the live copy read only (sign-in screen, `Server-Timing`, the wire answers `stats`, `queue`, `memberlist`; no act made). Paths are under `bio-plane/src/`. A local run of the real module/store tests reproduced A-02's data shape and A-06 exactly.

Summary table

| id | owner | cause (one line) | design says? |
| --- | --- | --- | --- |
| A-01 | store-assembly (+ extraction, screens-settings) | `op=stats` runs an FTS5 `integrity-check` rank 1 over the whole text index on every call; Your team calls `stats` only to read `dbBytes` | design silent (card is requirement screens-settings R79, K4635) |
| A-02 | screens-daily | the forward field sends the member's HANDLE, `taskForward` looks up a MEMBER ID; equal only for members whose id was typed as their handle (founder: id `admin`, handle `sparky`; second admin id `walk-a-admin2b`, handle `walk-a-admin2`) | design (d) step 3 says forward to a member; no exclusion of administrators |
| A-03 | queue-producers (+ queue, screens-daily, setup-words) | the item leaves only when the key is revoked; the sentence says "mark it done", but no such act exists and the queue draws no revoke either | design (UC-161) says "know and revoke if needed" only; an "I know about it" answer is MISSING |
| A-04 | machinery-producers (+ setup-words) | the producer's summary and detail are the original developer strings; the design's reviewed plain sentence sits under another key and is not used | design has the plain sentence for the summary (DEC-347) and none for the detail |
| A-05 | member-roster (rule), screens-settings (prompt) | the rule says the question is asked at setup and in settings "never on adding an administrator" (DEC-134 (3)); nothing asks again | design CONFLICTS with itself: (a) step 5 says asked when the second administrator is added; DEC-134 / member-roster R8 say not |
| A-06 | queue-producers | the producer reads a second `Members` instance that was never told the copy is claimed, so the founder (`admin`) is not an administrator in its list | design (j) step 2 "tally, who must still act" |
| A-07 | membership (R43/R44), project-roster (R26/R34) | administrators see a discoverable project whole by rule (K2409); the code does what the requirement says | design silent for administrators; (a) step 10 says "outsiders see the name only" |
| A-17 | screens-daily | `done` handlers store the OP name; the message words the op's single label, so the second intent of a shared op is named wrongly | design says the button names its act (DEC-299) |

Shared causes: A-03, A-04 and A-17 are all "words": a sentence produced from code or from an op label that was never reviewed against what the screen offers (setup-words / design-words lineage). A-05 and A-07 are both requirement-versus-design conflicts, not code defects; they are Bob's (policy). A-02 and A-17 are both screens-daily and both missed by tests because the fixtures use members whose id equals their handle and a single-intent button. A-06 stands alone. No finding shares a cause with A-01.

---------------------------------------------------------------------------------------------

## A-01 `stats` 8-13 s on Settings > Your team

Cause. The screen asks for the whole `stats` answer to read one number.
- `screens-settings/group.mjs:25` sends `{ op: "stats" }` for an administering session; `group.mjs:248-251` uses only `dbBytes` out of it (`record-core/index.mjs:1199-1200`, `#dbBytes`, is `sql.databaseSize`, free).
- `store-assembly/stats.mjs:63-68` (`figures`) builds the answer: `refs`, `textIndexOk`, `observationsNonLead`, then `recordOf(ctx).counts(hid)` (record-core/index.mjs:1114-1128), which asks the 20-odd registered owners for their counts.
- `store-assembly/stats.mjs:67` calls `extractionOf(ctx).textIndexOk()`, which is `extraction/index.mjs:2375-2378`: `INSERT INTO capture_text_fts(capture_text_fts, rank) VALUES('integrity-check', 1)`. At rank 1 FTS5 re-reads every row of the external-content table `capture_text` and re-tokenises it, to compare with the index (the comment at 2366-2373 says so: "It walks the index, so it belongs on an admin read taken deliberately").

What `stats` does, measured. It is NOT a full scan of many tables: every other figure is a `count(*)` on a table with few rows. The live answer (read once, as the administrator, 2026-10-26 07:2x) was: `textUnits` 8,767 (the `capture_text` table, the one the integrity check re-reads), `observationsNonLead` 984, `bundles` 231, `files` 835, `history` 187, `register` 199, `content` 31, `refs` 29, `tasks` 10, `taskQueue` 4, every other figure 0 to 21; `dbBytes` 560,418,816. `Server-Timing` of that call: `stats;dur=5768, do-stats;dur=5699` (the Durable Object spent 5.7 s; the session lookup 68 ms). The table counts total fewer than 12,000 rows, which take milliseconds (local control: `count(*)` over 8,767 rows 0.4 ms). The remaining work is the one integrity check. Local control on an in-memory FTS5 external-content table with 8,767 rows of about 11 KB: rank-1 `integrity-check` 1,251 ms, `count(*)` 0.4 ms; the live object is slower (storage-backed, and shared with four other walkers), and the check grows with the text held. Honest limit: I could not time the call without the integrity check on the live copy (no write or code change allowed), so the share of the 5.7 s that belongs to it is by elimination plus the local control, not a direct live subtraction.

What makes it slow beyond that: a Durable Object runs one request at a time, so while `stats` computes, every other op of the same screen (and of anyone else on the copy) waits; that is how the walker's other ops "queued behind it" and why a settle took 8-13 s with four others active (4.3 s alone). My own load: frame 1.0 s, settled 7.4 s.

Design. The design (registry.json screen `group`, ux-experience journeys) has no storage card at all; the card comes from the requirement `build/requirements/screens-settings.md` R79 (T51 fix round 6; G42; K4635, K4638), which says "reads `stats` once". So the design is missing the card and its speed budget; the requirement fixes the op.

Owner: store-assembly (the answer) with screens-settings (the caller); extraction owns the check.

Smallest fix meeting the requirement: take the check off the default read. In `store-assembly/stats.mjs` run `textIndexOk()` only when the request asks for it (a flag such as `deep=1`, set by nothing on the Your team screen; the purge proof and any deliberate "check the index" read keep it), and make `screens-settings/group.mjs:25` ask for the size alone (the same op with `fields=size`, answering `dbBytes` and nothing else, so the 20 owners' counts are not run either). R79's sentence "reads `stats` once" stays true.

Test at the interface: store-assembly (op `stats`) over a store holding a large `capture_text`: `stats` without the flag does not run `integrity-check` (assert through a counting `sql.exec` stand-in that no `capture_text_fts` statement is issued, and that the answer has no `textIndexOk`), and with the flag it does; screens-settings: the Your team screen sends the size-only read (assert the request). A latency assertion is not stable; the statement-count assertion is.

---------------------------------------------------------------------------------------------

## A-02 Forwarding a queue item to an administrator refused

Cause. The screen and the act disagree on what `to` is.
- The screen: `screens-daily/forward.mjs:8-12` builds the choice from the roster as `String(m.handle)` and `forward.mjs:20-26` returns `{ to: <handle> }` (also the typed-handle fallback box). `screens-daily/queue.mjs:424-426` and `queue-states.mjs:89` send it as `to`.
- The act: `tasks/index.mjs:645-657` (`taskForward`): `memberFacts(to)` is `member-roster/index.mjs:349-353`, a lookup by `member_id`; none found is `noSuchMember(to)` (the "No member of your team answers to the name or id given" sentence, `setup-words/rows.mjs:15567`). The requirement says the same: tasks R3 "`NO_SUCH_MEMBER` (an active member)", the task's `assignee` being a member id.
- Handle and id differ exactly where the member was not enrolled with id typed equal to the handle. Live `memberlist` (read): `admin` / handle `sparky` (the founder), `walk-a-admin2b` / `walk-a-admin2` (the second administrator), but `walk-a-m3` / `walk-a-m3`, `walker` / `walker`. So forwarding to plain members the walkers made works by coincidence, to the founder and to the second administrator never. It is not an administrator rule at all; any member whose handle differs from the id they were invited under fails.
- Contrast: every other act that takes a handle resolves it (`member-roster/index.mjs:536 memberByHandle`, used by project-roster, credentials, membership); `taskForward` and its screen alone mix the two.

Design. (d) step 3 "Resolve or forward obligations ... decide: forward to whom"; no exclusion of administrators. The words even offer the refused choice. Specified; the behaviour contradicts it.

Owner: screens-daily (sends the wrong name), with tasks as the second place that could accept both. Smallest fix: `forward.mjs` offers `value: m.member_id`, `text: handle` (the roster read `memberlist` carries `member_id`; the founder's row has id `admin`), and the typed-handle fallback resolves a typed handle against the same roster before sending. (Alternative at tasks: accept a handle through `memberByHandle` / `founderHandle`; the screen fix is smaller and keeps tasks R3.)

Test at screens-daily's interface: in the store world sign in a member whose handle differs from its id (e.g. `signIn("rosa-h")` enrolled under id `rosa`), and the founder (id `admin`, handle `founder`); press "Forward to a member", choose each in the field, assert the answer is `ok` and the task's assignee is the id. The present fixtures use handle equal to id (`w.signIn("ana")`), and none forwards to the founder.

---------------------------------------------------------------------------------------------

## A-03 "registered a signing key" items that can never be cleared

Cause. By construction the item is read from the key's state, not from anything an administrator can answer.
- `queue-producers/index.mjs:2063-2112` (`#obligationsSignerSelfRegistered`): one OBLIGATION per `signerList` key that is `active` with `origin: "self"`, raised to every administrator; "It leaves when the key is no longer `active` ... nothing is stored to clear". Its only option is `SIGNER_REVOKE` (`signerset`), and `queue/index.mjs:715,773` declares the same door.
- `screens-daily/queue.mjs:199` draws that item with only an "Open Members" link; `signerset` is not among the queue's registered acts (requirement screens-daily R3 list), so even the revoke is not offered where the item is.
- The words promise an act that does not exist: `queue.signer-self-registered.detail` (`setup-words/rows.mjs:6304`): "If you did not expect it, open Members and withdraw the key; if you did, mark it done." There is no "mark it done" for this kind; "Choose several items > Mark them done" resolves tasks, not keys.
- Two things make it worse, both visible live: the item is also raised to the registrant herself (the founder is told about her own keys; line 2072 `raisedTo = this.#activeAdmins()` with no exclusion of `registered_by`), and the summary carries no key identity, so the items cannot be told apart. Live (read): 14 such items, all "sparky registered a signing key for themselves", `kind` counts `{signer-self-registered: 14, authority-undetermined: 5}`; each key is an explicit `signerregisterown` act (`credentials/index.mjs:945-949`), made by the walkers' publish-ceremony runs, so the count rises with every walker; it was 6 when A looked.

Design. UC-161 (ux-experience.json:5570-5590): "Know when a member registers their own signing key, and revoke it if needed. ... a feed item offers the revoke (signerset)". The design specifies know + revoke only. How an administrator says "I know about this key, keep it" is MISSING from the design (and from requirement queue-producers R14); the shipped sentence invented it.

Owner: queue-producers (the item's life), with screens-daily and setup-words for the draw and the words. Smallest fix meeting the design as written: (1) do not tell the registrant (filter `registered_by`/`member_id` equal to the reader); (2) draw the revoke on the item (register `signerset` in the queue's acts) and strike "mark it done" from the detail; (3) Bob/BOB decide the missing answer: either a per-administrator "I know about this key" (a stored acknowledgement keyed by key and administrator, which the producer reads, as `queue.snooze` rows do), or accept that a kept key stays a standing to-do (then the item should be a CONDITION/status, not an OBLIGATION, and not counted in the badge).

Test at queue-producers' interface (members.test.mjs style, which exists for R14): (a) the registrant's own feed has no item for her key; (b) an administrator's feed has the item with the revoke option, and after the answer chosen in (3) the item is absent from that administrator's feed and present for the other; (c) the detail text names no act that the item's `options` do not carry (assert each verb in the sentence against `options`).

---------------------------------------------------------------------------------------------

## A-04 Pacing status in internal terms and milliseconds

Cause. The producer builds its own sentences from developer strings.
- `machinery-producers/index.mjs:346` summary: `word("machinery-producers.summary.pacing_holding_captures")` = "our own pacing is holding {host}: captures from it are PACED, not broken" (`setup-words/rows.mjs:15931`; in `words.json:109949` the note is only "machinery-producers, summary"; never reviewed). Lower case, "PACED".
- `machinery-producers/index.mjs:347` detail: an inline `localize(...)` "the per-host governor is in cool-off for {host} for another {max}ms after {refusals} consecutive refusal{v1}{v2}. Nothing about the source is being claimed here." with `max` = `cooloff_until - now` in raw milliseconds and `v2` = " (last status 429)"; a code-origin row (`rows.mjs:24415`, source "code"), no design row at all.
- The design already reviewed the plain version of the summary under a different key: `docs/development/ux-substrate/screens/words.json:57009-57014`, key `observation-log.vocabulary.condition_governor_holding_host`, "Your team's Civicsmith is spacing out its captures from this site on purpose: they are paced, not broken" (DEC-347, B349, "the same meaning as machinery-producers.summary.pacing_holding_captures, in its words"). The rewrite went to the observation-log's key; the queue's own key kept the original wording. The queue kind name is also reviewed (`queue.kind.governor-holding-host`, "Sites Civicsmith is pausing its requests to").

Design. Summary: specified (DEC-347's sentence), not applied at this producer. Detail (how long, in what unit, whether to name the 429): MISSING.

Owner: machinery-producers (+ setup-words rows). Smallest fix: point the summary at the reviewed sentence (with `{host}`), and write a design row for the detail with the wait in a time word (e.g. "about 4 minutes"; `civil-time` already formats durations), no "governor", "cool-off" or status code; keep the numbers in `basis`.

Test at machinery-producers' interface: the item for a held host has a `summary` and `detail` that match no `/governor|cool-?off|PACED|\d+ ?ms|\b4\d\d\b/`, start with a capital letter, and read through `word(key)` keys that `hasWord` finds with a design source (a keys-have-reviewed-words check, the same style as the existing `hasWord` assertions).

---------------------------------------------------------------------------------------------

## A-05 Nothing asks who holds hosting access when a second administrator is added

Cause. It was ruled so.
- `member-roster/index.mjs:395-399` (`hostingAccessSet`): "R11 (section 4.8; DEC-134 (3)): ... It is asked at setup ... and the group's settings ..., never on adding an administrator, so `memberAdd` asks nothing about it"; `member-roster/index.mjs:1016` repeats it at the add. Requirement `build/requirements/member-roster.md` R8: "asked at setup ..., never on adding an administrator: `memberAdd`'s answer carries no hosting-access question". The setup act is skippable (`screens-entry/setup.mjs` "Skip"), and nothing after setup raises the question: no producer in `queue-producers` mentions hosting access (grep: none), and `screens-settings` offers the form only on Your team (`group.mjs`, `screen.settings.hosting`).
- DEC-134 is Bob's (J9, 5 October, "setup recommends a second administrator once, saying why, asks who holds the hosting account and records it"; `docs/development/ux-substrate/journeys.html:393`).

Design. The design contradicts itself. ux-experience.json journey (a) step 5 (line ~5937): "the group, asked when the second administrator is added", src "membership R11", and the "today" paragraph at line 15359: "When a second administrator is added, the group is asked to record who holds hosting access". That predates DEC-134, which moved the question to setup. So A-05 is the walker following a stale design step; the code follows the later ruling. Not a code defect.

Owner: a decision (policy: when the group is asked), then member-roster (rule) and queue-producers or screens-settings (the asking). If Bob wants the original intent (asked when the second administrator is added): smallest fix is not a prompt in `memberAdd` (R8 forbids it) but an OBLIGATION `hosting-access-unrecorded` from queue-producers, raised to the administrators while the team has two or more and `hostingAccess().current` is null, leaving when `hostingAccessSet` records; its door is `hostingaccessset`. If DEC-134 stands, journey (a) step 5 and line 15359 are corrected in the design instead.

Test (if built): queue-producers: with one administrator and nothing recorded, no item; after a second administrator is active, each administrator has the item; after `hostingAccessSet` it is gone for both; a recorded answer from before the second administrator also silences it.

---------------------------------------------------------------------------------------------

## A-06 "Agreed: no one yet" after the proposer's endorsement

Cause. Two `Members` objects over one storage, and the one `queue-producers` reads never learned that the copy is claimed.
- `membership/index.mjs:238`: `this.members = members ?? new Members({ sql, ... })` makes the Membership's own member-roster half, NOT through `membersOf`. `credentials/index.mjs:170` registers the claimed-state on that one: `this.membership.registerClaimed("credentials", () => this.claimed())`.
- `queue-producers/index.mjs:146`: `get #memberRoster() { return this.#dep("memberRoster", () => membersOf(this.#host)); }`, and `member-roster/index.mjs:2053-2058` (`membersOf`) makes a SECOND `Members` in a WeakMap, whose `#claimedSource` is null (`member-roster/index.mjs:342-346`: `#claimed()` is false with no source).
- With `#claimed()` false, `activeAdmins()` (`member-roster/index.mjs:729-732`) omits the founder (`admin`, who has no `members` row, R94). `endorsementsOwed` (`member-roster/index.mjs:1870-1887`) intersects the votes with that list, so the founder's recorded vote is dropped: `have` is empty and `awaiting` omits the founder too. That is exactly the walker's text "Agreed: no one yet. Awaited: walk-a-admin2" (and why the founder never appears among those awaited). Its other effect, same cause: a proposal made by the second administrator never reaches the founder's queue (`by` = `admin` is not in the list, so `endorsementsOwed` returns `[]`); `expertiseAwaitingConfirmation` (line 1892) likewise loses the founder's own row (`#founderMember` is null while unclaimed).
- Evidence by reproduction (store world, `storeWorld()`): founder proposes `ana` with two administrators; `memberadd` answers `have: ["admin"], awaiting: ["rosa"]`; the queue item for `rosa` carries `basis.have: []`. Patching line 3254 to ask the Membership's instance (`this.#membership.endorsementsOwed`, a delegate at `membership/index.mjs:1321`) gives `have: ["admin"]`. The tree's own existing test fails on exactly this: `test/m/screens-daily/routed.test.mjs:168`, `R75 (home)` and `R75 (queue)`: "the record says who has agreed and who is awaited" (actual 0). The member-roster unit test passes because its fixture registers the claim on the one instance it builds.

Design. (j) step 2 "know: tally, who must still act". Specified; the data is wrong.

Owner: queue-producers (reads the wrong object); membership is the cause of there being two (`membership/index.mjs:238`). Smallest fix: `queue-producers/index.mjs:146` takes the roster from `membershipOf(host)` (its `endorsementsOwed` and `expertiseAwaitingConfirmation` delegates exist, `membership/index.mjs:1321`), or `membership` builds its half with `membersOf(ctx)` so there is one instance per storage (this removes the class of fault; `membersOf` is documented as "one instance per storage", member-roster `world()` even asserts it).

Test at queue-producers' interface over the real store (not the member-roster fixture): claimed copy, founder + second administrator, founder proposes a third: the second administrator's item has `basis.have` = [`admin`] and `basis.awaiting` = [second]; control: the second proposes, the founder's feed has the item. The existing routed.test.mjs R75 test already asserts the first half and is red at this commit: the fix is "make it green", plus the control.

---------------------------------------------------------------------------------------------

## A-07 A findable project shown in full to a non-participant administrator

Cause. This is the rule as written, not a defect in code.
- `membership/index.mjs:89-93` (`viewerPredicate`, "The administrator's arm (D54): a discoverable project only"): an active administrator and the founder see every discoverable project at FULL, and a hidden one only as participant. Requirement `build/requirements/membership.md` R43: "an active administrator sees a hidden project only as a participant (D54; a discoverable project stays seen whole by administrators, K2409)"; R44 `sight` is `FULL` when R43 admits; `project-roster.md` R26 and R34 (`projectList` lists "each discoverable project" to an administrator with `participation` null); R10 `projectRequest` refuses `PROJECT_REQUEST_NOT_OUTSIDE` at `FULL`, which is why no "Ask to join" is drawn.
- Bob's D54 ("administrators see that a hidden project exists, its name and its owners; contents only if its owners add them", K2408) narrowed hidden projects only; K2409 records that discoverable stays whole.

Design. The design's "Sees only the name of a discoverable project, nothing inside" (ux-experience.json:878) and journey (a) step 10 "Outsiders see the name only" are written for the member; for an administrator who is not in the project the design is SILENT. The walker read the member rule onto the administrator. The conflict (an administrator's whole sight of a project they were never invited to, against the project owners' control of who sees inside) is a policy question for Bob, not a bug.

Owner: membership (R43/R44) with project-roster (R26/R34). If Bob rules name-only for administrators at discoverable projects too: smallest fix is to drop the `discoverable` arm from `administers` in `membership/index.mjs:91-93` (so R43 admits an administrator only as participant) and let `sight` answer `EXISTENCE` for them (R44 already does for hidden), then project-roster R26 lists such a project as a name row with "Ask to join" (`projectRequest` is already allowed at EXISTENCE), and R34's comment goes. Cost: the administrator-only reads that rely on whole sight of discoverable projects (their queue items, retrieval) narrow too.

Test (if ruled): membership: `sight(projectId, administrator)` of a discoverable project they are not in is `existence`, `viewerPredicate` does not admit its bundles; project-roster: `projectList` for that administrator has no row at FULL and `projectDirectory` lists it with `request` null; screens-daily: the project page for them draws the name and "Ask to join" only.

---------------------------------------------------------------------------------------------

## MINOR: "Done: ..." messages naming the wrong act (A-17)

Cause. `screens-daily/queue.mjs:359` words the confirmation as `cs.w("queue.done", { what: cs.w("act." + ui.done + ".label.queue") })` ("Done: {what}. It has left your queue.", `rows.mjs:5579`, DEC-299: "every item's button names its act"), and each handler stores a fixed OP name: `queue.mjs:438` `proposedispose`, `:455` `queuemute`, `:525` `projectrequestanswer` (and `:419,427,462,465,517,534-552` for the single-intent ops). An op has one label (`rows.mjs:17892` "Dismiss with a reason", `:17894` "Mute a kind", `:17903` "Grant or decline", `:17905` "Endorse an administrator"), but the button carries the real intent in the element data: Defer vs Dismiss is `el.dataset.to` (`queue.mjs:432`, "R68: the button says which"), Mute vs "Turn back on" is `el.dataset.unmute` (`queue.mjs:450-451`), Grant vs Decline is `el.dataset.answer` (`:521`). So Defer says "Dismiss with a reason", Turn back on says "Mute a kind", Grant says "Grant or decline", exactly the walker's list. The `done` callback also does not receive the element, so it could not word it differently.
Separate and same family: "BUDGET-2024-APP.pdf BUDGET-2024-APP.pdf has been fetched" (a title placed twice in a status sentence, not examined further; not in this scope) and the walker's "Done: Endorse an administrator" (correct act, plain label; not wrong).

Design. DEC-299 / words `queue.done` "after any queue item's own act; every item's button names its act, never 'Act on an item'": the message must name what the button said. Specified.

Owner: screens-daily. Smallest fix: `done` stores the pressed button's own label key, e.g. `{op, intent}` taken from `el.dataset` (`to`, `unmute`, `answer`), and `queue.done` words `act.<op>.label.queue.<intent>`; add the missing design word rows for the three second intents ("Defer", "Turn back on", "Grant" / "Decline"; the buttons already carry these words, so the rows exist as the buttons' labels and are reused).

Test at screens-daily's interface (queue-actions/queue-states tests): press Defer on a finding, assert the confirmation contains the Defer word and not the Dismiss one; Turn back on vs Mute; Grant vs Decline; each as `word(key)`.

---------------------------------------------------------------------------------------------

## What I could not establish
- A-01: the live share of the integrity check (see above).
- A-06: I reproduced the empty `have` and the fix in the store world; I did not see the live item (no proposal is pending on the copy, and I made no write).
- A-03: why the count grew from 6 to 14 is the other walkers' key registrations (each is an explicit act), not a growth by itself.
