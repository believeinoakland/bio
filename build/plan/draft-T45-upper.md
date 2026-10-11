# Draft: T45 requirement text for layers 10–11 of the Actions fold (monitoring, following, queue-producers, wizard-scripts; the L11 op pattern)

Sources:
- `REQUIREMENTS-HANDOFF.md` and `canon-draft/BIO_Action_v0_2.md` on `origin/design/actions` (Bob's approval as a whole, K2775); `DESIGN.md` §2, §10, §11; `research/S1-synthesis.md` §D (defects 4, 5, 8, 10, 12) and §E.
- `build/plan/next.md`: N855 (6d), N858, N881, N882, N890, N891; the rest named where they touch the L11 op pattern.
- The requirements of monitoring, following, queue-producers, wizard-scripts, affordances, op-grades, op-declarations, whole; the Uses-side services read in action-plans, actions (R48, R52, R54), docket (R2), duties, answers (R15, R16), membership (R36, R68, R79), queue (R12, R28), filing-templates (R26).
- The code on `tranche/T44`: `queue-producers/index.mjs`:1886–1895 (`#actionRecipients` chooses the author with no check that she is still a member: S1 §D 8 verified), :1929–1975 (R15's item), :2067/:2109/:2162 (R17–R19 already lead `options` with their doors; R15 and R16 do not); `following/index.mjs`:222–252 and `schema.mjs` (a follow's `until_day` is the read period of a body's records, distinct from `ended_at`; `unfollow` is its author's only); `wizard-scripts/civicsmith-library.mjs` ("Get a record" step 6 `{template: "@records-request"}`; "Start and send" step 4 `{template: "@communication"}`).

Canon cited as "v0.2 rule n"; Actions decisions as "D n".

Next free ids: monitoring **R71**, following **R22**, queue-producers **R40**, wizard-scripts **R29**, affordances **R51**, op-grades **R32**, op-declarations **R49**. New ids used: monitoring R71–R72; following R22–R26; queue-producers R40–R43; affordances R51; op-grades R32; op-declarations R49. Everything else is an amendment.

**One placement for BOB first (Doubt 1).** DESIGN §11 has `monitoring` raise the once-only question, with edges `monitoring` → `action-plans` and `following` → `action-plans`. `monitoring` is 3,489 code lines (K617's mark is about 4,000) and cannot read `following` (later in the order), so it could not ask about follows without a seam. This draft puts the watch register and the question in **`following`** (1,336 lines; it reads `monitoring`, `duties`, `answers` and `action-plans`, all earlier). `monitoring` keeps only its own watch's end date (an address), as v0.2 §3 places it ("watches and their end dates live with `monitoring` and `following`"). With this, the `monitoring` → `action-plans` edge is not needed. If BOB keeps DESIGN's placement instead, R23–R26 below move to `monitoring` unchanged in meaning, `following` registering its follows with `monitoring` at start (`registerSweep`'s pattern, monitoring R66), and both edges are added.

---

## monitoring (L10, position 124)

**(a)** R32 and R34 amended; R71 and R72 new. R50 amended (with R34).

**(b)**
- monitoring **R71** (T45; N855; Actions D6d; v0.2 rule 17) **An address's end date.** `addressWatchEnd({address, until, by, viewer})` (in process; called by `following` R25, never by a request) records the day after which the address is no longer watched: `until` is a calendar day (`civil-time.isCalendarDate`) not before today's local day in the instance's zone, today meaning "stop now"; `null` clears it, returning the address to R14–R16. Refusals, in order, each writing nothing: an empty or machine `by` `MACHINE_CANNOT_SET_FREQUENCY` (R52's code, the same condition); an address that is not a subject of R15 the viewer may see `NO_SUCH_ADDRESS` (absent and invisible alike); `until` neither a calendar day nor `null`, or a day before today, `WATCH_END_REFUSED`. A setting is appended with who and when and never edited; the latest governs; every setting stays readable on the address's history (R52's rule). After the end day, R16's plan row for the address is `ended`, stating the day and who set it: it is never due, no tick reads it (R19), no look is written for it and no `monitoring-recheck-due` item is drawn for it (R31). A document that still asks to be monitored at an ended address is stated on the row (`asked_after_end`), and does not restart it. *(not yet met: T45)*
  - Tests: an address ended today is not ticked on the next cadence tick (control: an address ended tomorrow is ticked today); `null` returns the address to its frequency; each refusal with a control; R31's recheck item absent for an ended address (control: an unscheduled address still draws it).
- monitoring **R72** (T45; N855; Actions D6d; v0.2 rule 17) `addressWatchers(address)` (in process, for `following` R24) answers the ids of the projects whose monitored documents ask to be monitored at that address (R15's grouping), and `[]` for an address that is not a subject of R15. It writes nothing, never throws, and is not served as an op: no caller learns a project from it (`following` R24 names none). *(not yet met: T45)*
  - Tests: two projects' documents at one normalised address answer both; a document that no longer asks is left out (control: one that asks is in).
- monitoring **R32**, append: (T45; N855; Actions D6d; v0.2 rule 17) Each row also answers its end date: `until`, the day R71's latest setting holds with who set it and when, or `until: null` with `ends: "none_set"`, so every watched address shows its end date. *(not yet met: T45)*
- monitoring **R34**, append: (T45; N882; Actions D15; v0.2 rule 6) An entry that carries a time of day (`action-clocks`' T45 entry, its zone the office's) is past at that instant in that zone, not at the end of its local day, and is marked then; an entry with a date alone is marked as before. R44's bound is unchanged. *(not yet met: T45)*
  - Tests: an entry due "12:00" in the office's zone is marked at a tick at 12:01 that day (control: at 11:59 it is not); a date-only entry is still marked on the next local day.
- monitoring **R50**, append: (T45; R34 as amended) Among pending entries, one with a time of day offers that instant as its candidate, in place of the start of the next local day. *(not yet met: T45)*

**(c) Uses.** No new edge. (`action-plans`, named by the hand-off, is not needed under the placement above; Doubt 1.) `civil-time` (already a use) for R34's instant.

**(d) Owed to others.**
- `action-clocks`: an entry's time of day and its zone as a field `pendingClocks` answers (its T45 time-of-day line), for R34.
- UX: the plan row's `ended` and "no end date" words (`monitoring.address.ended`, `monitoring.address.noend`; keyed sentences, words the design stream's).

**(e) Size.** 3,489 code lines today (`index.mjs`, `checks.mjs`, `schema.mjs`). R71, R72 and the R34 change add about 100. Under 4,000, but close: **no further work should land in `monitoring` without a split plan** (K617). This is the main reason for Doubt 1.

---

## following (L10, position 125)

**(a)** R14 amended; R22–R26 new.

**Terms (added to Provides).** A **watch** is one of four things a plan may set running (v0.2 rule 17): a **follow** (R1, R7, R9, R10, R20), a watched **address** (`monitoring` R15), a **duty** adopted from a promise (`duties` R2), or a member's **standing question** (`answers` R15, R28). A **link** records that a plan set a watch running (R23).

**(b)**
- following **R22** (T45; N855; Actions D6d; v0.2 rule 17) **A follow's end date.** `followBody`, `followRegister`, `followPersonQuery` and `followPortal` (R1, R7, R9, R10) also take `ends`, a calendar day after today's local day (instance zone), or none. It is not the read period of R1 (`until`, the days of a body's records that are read). Refused `WATCH_END_REFUSED` when given and not such a day, before any write. `followEnd({follow, ends, by, viewer})` changes it later, by the follow's author or by R25; `ends: null` removes it. After its end day a follow is ended as `unfollow` ends it, by itself, recorded once with `ended_by: null` and `ended_reason: "ends"`; it is then never due (R12) and R19's listeners are told. A `policy` watch (R20) takes no `ends`: it is the group's standing watch (K1727) and ends only as R20 says. *(not yet met: T45)*
  - Tests: a follow with `ends` yesterday is ended at the next tick and read no more (control: `ends` tomorrow is read); R19 told once at that end; `until` and `ends` independent (a body's past period with no `ends` is still due); a policy watch refuses `ends`.
- following **R14**, append: (T45; N855; Actions D6d; v0.2 rule 17) Each follow also answers `ends` (R22) or `ends: null` with `ends_state: "none_set"`, and, when ended, `ended_reason` (`author`, `ends`, `answer` (R25) or R20's). *(not yet met: T45)*
- following **R23** (T45; N855; Actions D6d; v0.2 rules 1, 17) **Linking a watch to the plan that set it running.** `watchLink({plan, matters?, watch: {kind, id}, author, viewer})` (`op=watchlink`) records, by a member's act, that the plan set the watch running: `kind` is `follow`, `address`, `duty` or `question`; `matters`, when given, names matters of that plan the watch serves. Refusals, in order, each writing nothing: an empty or machine author `MACHINE_CANNOT_LINK_WATCH`; a plan absent or not visible, `action-plans`' `NO_SUCH_PLAN` (one answer); a closed plan `PLAN_CLOSED`; a `kind` outside the four, or a watch absent or not visible to the author (a follow, R14; an address, `monitoring` R32; a duty, `duties`' read; a standing question, which only its author sees, `answers` R16), `NO_SUCH_WATCH` (one answer); a matter not of that plan `MATTER_NOT_OF_PLAN`; an ended watch `WATCH_ENDED`. A second link of the same watch to the same plan answers `existed: true` with the first. Links are append-only and keep who and when. A link to a standing question is seen only by that question's author, as the question is (`answers` R16), in every read here. *(not yet met: T45)*
  - Tests: each refusal with a control; a second member cannot link another member's standing question (`NO_SUCH_WATCH`, the same answer as an absent one); that link is absent from every read for another member (control: its author sees it).
- following **R24** (T45; N855; Actions D6d; v0.2 rule 17; DESIGN §10 "every promise met") **The once-only question.** `watchQuestions({after?, limit?, viewer})` answers one entry per link whose question is due and not yet answered (R25), in (due instant, link) order after `after`, at most `limit` (1–200, default 200), with `cursor`:
  - **Due** at the first of: (a) the plan closed (`action-plans`' read, the closing instant); (b) for the link's matters (all the plan's matters when it names none), each matter holding at least one duty adopted from its responses' promises, every such duty reading `met` (`action-plans`' read of a matter's adopted promise-duties, its T45 line; `duties` R10's state), at the instant the last one did. The cause is stated, `closed` or `promises_met`. A link whose watch has already ended is never due.
  - **Each entry** is `{link, plan, matters, watch: {kind, id, ends}, due_at, cause, relied_on, offered, recipients}`. `ends` is the watch's present end date (R22; `monitoring` R71; R25's for a duty; `answers`' `ends` for a question).
  - **Relied on** is true when another link of the same watch names a plan that is not closed; for an address, also when `monitoring` R72 names a project other than the plan's; and for a `policy` follow, always. A relied-on watch is listed with `offered: []`; otherwise `offered: ["keep", "stop"]`. `relied_on` names no other plan or project.
  - **Recipients**: for a standing question, its author alone. Otherwise the link's author, while she is an active member (`membership.memberFacts`) who may see the plan; else the plan's project's active owners (`membership` R65); else the administrators (`membership` R86).
  - An entry the viewer may not see (the plan, or a standing question not hers) is left out whole and counted nowhere (R17). It writes nothing; asking once is R25's record and `queue-producers` R41's item.

  *(not yet met: T45)*
  - Tests: a closed plan's link listed once with `cause: closed`; a link listed on `promises_met` when the second of two adopted duties reads met (control: one met, one pending, not listed); a link whose other plan is open is `relied_on` with `offered: []` (control: that plan closed, both offered); an address another project's document asks for is relied on, naming no project; a standing question's entry seen by its author only.
- following **R25** (T45; N855; Actions D6d; v0.2 rules 1, 17) **The answer.** `watchAnswer({link, keep?: {until}, stop?: true, author, viewer})` (`op=watchanswer`) records the one answer to R24's question, by one of its recipients: `keep` with `until`, a calendar day after today's local day, or `stop`. Refusals, in order, each writing nothing: an empty or machine author `MACHINE_CANNOT_LINK_WATCH`; no such link visible to the author `NO_SUCH_WATCH`; no due question for that link, or an author who is not one of R24's recipients for it, `WATCH_NOT_ASKED` (one answer); a relied-on watch `WATCH_RELIED_ON`; neither or both of `keep` and `stop`, or `until` not such a day, `WATCH_END_REFUSED`. An answered link answers `existed: true` with the first answer. The answer sets the watch's end in its owner's terms, in the same act:
  - a follow: `keep` sets R22's `ends`; `stop` ends it now, `ended_reason: "answer"`, by this author (whether or not she made the follow);
  - an address: `monitoring.addressWatchEnd` (its R71) with `until`, or today;
  - a duty: the end day is held on the link here. The duty itself stays held and its occurrences are still derived and readable (`duties` R10); only telling of it stops after that day (owed to `notice-producers`, below);
  - a standing question: `keep` sets its `ends` through `answers` (owed: an author's act changing `ends`); `stop` is `answers.standingQuestionEnd` (its R16).

  A refusal by the owner's act undoes nothing here and is answered as given. Once answered, R24 never lists the link again. *(not yet met: T45)*
  - Tests: each kind kept and stopped, its end shown afterwards by its owner's read; a second answer `existed: true`; a non-recipient refused `WATCH_NOT_ASKED`, alike with an unasked link (control: a recipient lands); a relied-on watch refused `WATCH_RELIED_ON`; a duty stopped is still read as held with its occurrences.
- following **R26** (T45; N881; Actions D14; v0.2 rule 18) **For the plan's "where it stands" view.** This module registers once at start, through `action-plans`' registration door (owed, below), the read `watchesOfPlan({plan, viewer})`: each watch linked to that plan the viewer may see, with its kind, its owner's words for it (a follow's subject, an address, a duty's performance, a standing question's words to its author only), its end date or `none_set`, whether it has ended, and `relied_on` (R24's rule). It writes nothing and never throws; `action-plans` reads it and imports nothing of this module. *(not yet met: T45)*
  - Tests: the registered read answers a plan's three linked watches with end dates (control: a watch linked to another plan is absent); a second registration is refused by the door.

**(c) Uses.** New edges, each to an earlier module (positions from `modules.json`):
- `action-plans` (123): plan read, its sight and state with the closing instant, its matters, each matter's adopted promise-duties and their states; `NO_SUCH_PLAN`; the registration door (R23, R24, R26).
- `duties` (63): a duty's sight and words; `met` state (R23, R24, R26).
- `answers` (89): a standing question's sight, words, `ends`; `standingQuestionEnd`; the `ends` change (R23–R26).
- `monitoring` (124): already a use; `addressWatchEnd` (R71) and `addressWatchers` (R72) added to it.
- `membership`: already used (`memberFacts`, `projectOwners`, `activeAdmins`).

**(d) Owed to others.**
- `action-plans`: (1) a read of a plan's state with its closing instant and matters; (2) per matter, the duties adopted from its responses' promises, each with its `met` state (the hand-off's duties line "duties proposed from … a reply's promises, adopted by a member" gives the duty; the link to the matter is the plan's); (3) a registration door for `watchesOfPlan`, once per module, for the "where it stands" view and D6b's closing summary (K31's pattern, as `monitoring` R66).
- `answers`: `standingQuestionEndSet({id, ends, author})`, the author's act changing a standing question's `ends` (R15's rule for the day), for R25's `keep`.
- `notice-producers`: no "Noticed" item for an adopted duty after the end day a link holds for it (R25); it reads `following` (125 < 134).
- `op-declarations`, `op-grades`, `affordances`: `watchlink`, `watchanswer`, `followend` (pattern below).
- UX: the question's words, "keep until <date>" and "stop now"; "relied on elsewhere"; "no end date"; the plan's watch list. All keyed sentences (`following.watch.question`, `following.watch.keep`, `following.watch.stop`, `following.watch.reliedon`, `following.watch.noend`), words the design stream's.

**(e) Size.** 1,336 code lines today. R22–R26 add about 350–450. Well under 4,000.

---

## queue-producers (L11, position 133)

**(a)** R8, R15, R16, R17, R18, R19 and R21 amended; R40–R43 new.

**(b)**
- queue-producers **R15**, append: (T45; N881, N882; Actions D14, D15; v0.2 rules 6, 18; S1 §D 8)
  - **Recipient.** The item goes to the first of these who is an active member (`membership.memberFacts` status `active`) and may see the action: the member who last took up the entry (`action-plans`' take-up read, its T45 line "Take up"); then the member who created the action. Else it goes to the project's active owners; else to the administrators. Nobody else ever receives it; R40 tells the owners once when a member leaves. This replaces "to the member who created the action, else its project's owners, else the administrators".
  - **One item per fact.** No item is raised for an entry that `action-clocks` answers as replaced by an adopted duty's "Noticed" item (its T45 "one date, one reminder"), which `notice-producers` draws. An entry `action-clocks` answers as the same date as a step's "by when" is this one item, naming the step too.
  - **The words.** For an entry the action's addressee owes, `summary` reads as canon's question, "Noticed: no reply recorded by <date>" (v0.2 rule 6; keyed `queue.action-clock-overdue.noreply`, canon's words). It never says "overdue" or "violation" until a member determines noncompliance. For an entry the group owes a venue ("our deadlines", `action-clocks`' T45 `owed_by: group`), it is the group's own missed date, keyed `queue.action-clock-overdue.ours`. For an entry whose basis is the other side's stated deadline, it is keyed `queue.action-clock-overdue.theirs`, and never says the deadline is a legal one. The last two keys are owed to UX.

  *(not yet met: T45)*
  - Tests: creator left the group, so the item goes to the owners (control: creator active); a member who took the item up receives it and the creator does not; an entry replaced by a duty's Noticed raises no item (control: one not replaced does); each wording by basis, read by key.
- queue-producers **R16**, append: (T45; N881; Actions D14; v0.2 rule 18) The recipient follows R15's rule: the member who last took up the checkpoint, then the member who set the scenario's current version; each only while an active member who may see the plan. *(not yet met: T45)*
- queue-producers **R17**, append: (T45; N881; Actions D14; v0.2 rule 18) The recipient follows R15's rule: the member who last took up the escalation, then the member who opened it. A `stopped_pursuing` escalation (`escalation`'s T45 state) proposes no edge, and its item leaves as for `suspended`. *(not yet met: T45)*
- queue-producers **R18**, append: (T45; N881; Actions D14; v0.2 rules 6, 18) A reminder is its setter's own request. It raises an item only while she is an active member who may see the action; otherwise it raises none and goes to nobody else (R40 names it). A date `action-clocks` answers as one with another reminder's date raises one item (its T45 de-duplication). *(not yet met: T45)*
- queue-producers **R21**, append: (T45; R15 as amended) Its recipients follow R15's rule. *(not yet met: T45)*
- queue-producers **R19**, append: (T45; N858; Actions D10; v0.2 rule 12; S1 §D 10) There is also one such OBLIGATION for each `legal` pressure mark on a docket record entry (`docket` R2) on which no hold is stated, as `actions`' hold read answers it once `actions` reads docket marks (the hand-off's `actions` "Holds" line). It is keyed `OBLIGATION::litigation-hold::docket::<entry>` and goes to R19's recipients: the administrators, and the member who marked it while she is active. Its subject is the case; it names the mark's note and offers the hold placed from that mark (`actionhold` as `actions` extends it) as its door. It is raised once, and leaves when a hold is stated on that mark. A recipient who sees the case's project only at `EXISTENCE` is told its id, never its contents (K2581's reading). *(not yet met: T45)*
  - Tests: a docket `legal` mark raises one item (control: a `retaliation` mark raises none); placing the hold removes it; an action's mark and a docket mark on one matter are two items with two keys.
- queue-producers **R40** (T45; N881; Actions D14; v0.2 rule 18; hand-off "project-roster": "owners told once … producer in queue-producers") **A member who left.** FINDING `member-left-items`.
  - **When.** For each pair (member, project) where the member is no longer an active member of the group (`membership.memberFacts` status other than `active`), or is no longer a participant of the project (`membership.participation`), and open dated items of that project routed their to-dos to her when she left.
  - **Routed to her** means she took the item up last, or created it and nobody took it up. The items are: pending or overdue clock entries (R15), unjudged checkpoints (R16), proposed escalation stages (R17), holds she marked with none stated (R19), and her own reminders on pending entries (R18).
  - **Recipients and key.** One item to the project's active owners (the others, when she was an owner), else the administrators. Items of no project go to the administrators under `none`. It is keyed `FINDING::member-left-items::<member>::<project | none>`.
  - **Its detail** lists each item the recipient may see (kind, subject, date, basis) and offers on each the take-up act (`action-plans`' T45 op) as its door. It never says why she left, and no list or count names an item the recipient may not see (R11). She herself is never told.
  - **Age and lifetime.** Its `age` runs from the departure instant where `membership` answers one, else is undetermined, stated. It is raised once and never repeated; it leaves when its recipient disposes of it (DEC-69, DEC-70).

  *(not yet met: T45)*
  - Tests: a revoked creator's two entries named to the owners in one item (control: an active creator raises none); an item another member took up is not named; leaving one project names only that project's items; an item in a project the owner may not see is neither named nor counted.
- queue-producers **R41** (T45; N855; Actions D6d; v0.2 rule 17) OBLIGATION `watch-keep-or-stop`: one per entry `following.watchQuestions` answers the viewer (its R24), keyed `OBLIGATION::watch-keep-or-stop::<link>`, to that entry's recipients and to nobody else. Its subject is the plan, homed under the plan's project. It names the watch, its present end date and the cause (`closed` or `promises_met`). It offers `watchanswer` (keep until a date, or stop) as its door when `offered` is not empty; a relied-on watch is shown with no door, its detail saying it is relied on elsewhere and naming nothing more. Its `age` runs from `due_at`. It is raised once and never repeated. It leaves when the link is answered or its watch ends (DEC-69, DEC-94). *(not yet met: T45)*
  - Tests: one item per due link (control: no item before close); a standing question's item to its author alone; the relied-on item has no door.
- queue-producers **R42** (T45; Actions §D 4; S1 §D 4; DEC-8) **Doors per action to-do kind.** Every Action-layer item's `options` begin with its doors, in this order, each decorated as `options` are (`affordances.decorate`), before `optionsOf`'s acts. Each door is the act whose taking makes the item leave, or routes it (take-up).
  - R15: `actioncorrespond` (record a reply), the act `actions` names for stating an entry met or waived, take-up.
  - R16: `checkpointrecord`, take-up.
  - R17: `escalationadvance`, `escalationdecline`, take-up.
  - R18: `reminderanswer`.
  - R19: `actionhold`, `actionholdrelease`.
  - R21: `factconfirm`.
  - R40: take-up per named item.
  - R41: `watchanswer`.
  - R43: the review entry act and, for a paused plan, its resume act (`action-plans`' T45 ops).

  An item never offers "mark resolved" for a kind whose door is named here (`queue` R28 refuses it). *(not yet met: T45)*
  - Tests: each kind's first options are its doors in order (control: a FINDING outside the Action layer, e.g. R5's, has none); R15's item offers `actioncorrespond` first.
- queue-producers **R43** (T45; N890; Actions D27; v0.2 rule 20) OBLIGATION `plan-review-due`. There is one for each review day a plan's member-set rhythm reaches with no review entry recorded since (`action-plans`' T45 read), and one for a paused plan whose look-again date has come. They are keyed `OBLIGATION::plan-review-due::<plan>::<day>` and `OBLIGATION::plan-look-again::<plan>::<day>`. Each goes to the member who set the rhythm, or who paused the plan, by R15's rule. Its subject is the plan; its `due` and `age` are local days in the instance profile's `time_zone` (R25, R36). It is raised once per day reached and never repeated (a reminder because the group asked, v0.2 rule 20). It leaves when a review entry is recorded, or the plan is resumed or closed. No plan without a rhythm or look-again date raises one. *(not yet met: T45)*
  - Tests: a weekly rhythm raises one item on its day (control: a plan with none raises none); a recorded review removes it; a paused plan's look-again date raises one.
- queue-producers **R8**, append: (T45) It also answers every item R40, R41 and R43 derive. *(not yet met: T45)*

**(c) Uses.** New edge: `following` (125 < 133): `watchQuestions` (its R24; R41). Existing edges gain services: `action-plans` (take-up read; review and look-again read; the take-up and review ops as doors), `action-clocks` (the replaced and joined facts; `owed_by`; the time of day), `actions` (hold read over docket marks), `escalation` (`stopped_pursuing`), `membership` (`memberFacts`, `participation`, already used).

**(d) Owed to others.**
- `action-plans`: the take-up act and its read (who last took up which item); the review rhythm, review entries and the look-again date, as a read.
- `action-clocks`: in `overdueClocks` and `remindersDue`, the facts "replaced by a duty's Noticed", "same date as step S's by-when", "owed by the group", and the basis kind `theirs`.
- `actions`: `holdsDue` (its R54) extended to docket `legal` marks, or a sibling read; the act stating an entry met or waived, named as an op.
- `notice-producers`: withhold its step "by when" item for a step `action-clocks` joins to a clock entry (R15's one item).
- `queue`: R12's per-kind `instead` for the new OBLIGATION kinds (`watch-keep-or-stop` → `watchanswer`; `plan-review-due` → the review op; `member-left-items` is a FINDING with no project-scoped finding id, so `available: false, reason: no_project_scope` unless BOB names an `instead`).
- UX: keyed sentences for R15's `ours` and `theirs`, R19's docket arm, R40, R41 and R43 (`queue.member-left-items.*`, `queue.watch-keep-or-stop.*`, `queue.plan-review-due.*`, `queue.plan-look-again.*`, `queue.litigation-hold.docket.*`); door labels.

**(e) Size.** **3,487 code lines today** (`index.mjs`, `proposals.mjs`). R40–R43 and the routing and doors add about 400–500, which reaches about 3,900–4,000. **This crosses K617's threshold** (Doubt 6).

---

## wizard-scripts (L11, position 128)

**(a)** R22 and R13 amended. No new id. R29 is free and unused.

**(b)**
- wizard-scripts **R22**, append: (T45; N858; Actions D8; v0.2 rule 11; S1 §D 5) "Get a record"'s step `{template: "@records-request"}` names the plain records request of the active profiles' approved Tier 1 set (`filing-templates`' T45 template set). It is resolved by `filing-templates` R26's handle, so that template's name must give the handle `records-request` (e.g. "Records request"). While no visible template has that handle, R12 refuses the step and R11 withholds the script (K1883); once one is offered, the script passes R12 and is offered, the library data unchanged. A template is placed only at `communicationprepare` on an action already created (step 4, `actioncreate`), so it is offered only after the act is chosen (v0.2 rule 11). *(not yet met: T45)*
  - Tests: with a profile offering "Records request", "Get a record" is in `wizardsAt("finder")` (control: without it, withheld, and R14 still passes since the script is not required).
- wizard-scripts **R22**, append (second clause): (T45; N881; S1 §E; DESIGN §6 "wizard runner"; K2241) The Civicsmith library gains the scripts for a public comment, a demand to cure, an escalation stage, an oversight referral and picking up a plan, as the design stream gives them in `library.json`. BOB adopts each under K2241, `required: false`, authored by the Civicsmith library, `approved` on adoption, each a new script under R1. The records request is "Get a record", above. Each passes R12 against the registration, or R11 withholds it until its acts are declared. *(not yet met: T45, until the design stream gives them)*
  - Tests: as R22's for each script carried (equal to the file step by step; control: a step naming an undeclared op withholds that script only).
- wizard-scripts **R13**, append: (T45; Actions D25, D14; v0.2 rules 18, 19) `machineDrafts` also holds the labelled machine drafts T45's owners declare, once declared: the documentation of an infraction (`filings`' per-audience draft), the chance-to-fix notice's draft, and the plan status report's draft (`action-plans`). A script's step may then carry `{machine: <op>}` for them on acts not in `machineRefused`. R24's item 3 keeps every reason field out of writing help. *(not yet met: T45)*

**(c) Uses.** None new (`filing-templates` already).

**(d) Owed to others.**
- `filing-templates` (and `jurisdictions`' data): the Tier 1 set's plain records request named so its handle is `records-request`.
- UX: the five new scripts in `library.json`. The design stream's words, including "for the group" or "as myself" in the public-comment script (D12); the demand script's Tier 2 advisory (v0.2 rule 13); the referral's asking, not asserting (v0.2 rule 2); "pick up a plan" reading "where it stands" and the status report (D14). Also the screen registry's marks on the new reason fields (R24 item 3): the override's reason, "confirm it only asks", the contradicted-send reason, the stop, set-aside and pause reasons, scope reasons, and the harm-addressed statement.

**(e) Size.** 2,517 code lines (including `civicsmith-library.mjs` data). The changes are data and a registration line. Under 4,000.

---

## The L11 op pattern: affordances, op-grades, op-declarations

T45's L9 modules (and a few earlier ones) add acts. Each act is declared, graded and offered at L11 as T41 did for the investigation's ops (`op-grades` R30, K2569: "grades fixed at L11's START from the owners' requirements and merged code"). The L9 drafts are being written in parallel, so op names are provisional. Each job's START fixes them from the merged owners.

**The known new acts, from the hand-off** (owner; my expected grade under `op-grades` R3; final names the owners'):
- `project-roster`: the second-approval setting (owners' act; reasoned or reversible); a counsel matter's creation and its scope's removal (reasoned).
- `standards`, `duties`: duties proposed from a report's required responses or a reply's promises (a proposal, `undetermined`; adopt exists).
- `publication`, `case-authoring`, `docket`: hold a checked case unsigned and re-run the check (case-directed; graded by R3); the advocacy evidence check run in a member's hidden project (`caller-owned`); carrying a success record into the next edition (reasoned, or as `docketfile`).
- `conformance`: link a curing act (`cures`; reasoned); re-evaluate after a void (as `determine`, reasoned).
- `consequences`: the harm-addressed statement; the success record, recorded and revised (reasoned, as `consequencerecord`).
- `actions`: `confidential` set and remove (reasoned); promises note and press terms note (reversible); partners (reversible); receipt recorded (as `actioncorrespond`); "no reply owed" (reasoned); response found elsewhere and `arose_from` links (reasoned or `undetermined`); claim-by-claim bearing (reversible); assertion resolution per sentence (rewrite, "only asks" in her words, treat as claim; reasoned); the override with its ground (reasoned); joining the escalation once determined (reasoned); the hold extended to docket marks and counsel matters (stays reasoned); the hold notice prepared and recorded sent (`undetermined`); pressure recorded without an action (as `actionpressure`); several speakers' sendings (as `filingsent`).
- `action-clocks`: "our deadlines" entries (as `clockadopt`); reminders unchanged.
- `filings`, `filing-templates`: the contradicted-sentence send override (reasoned); defence packet (as `counselpacket`); per-audience infraction documentation drafts (machine draft, a `NON_ACTS` "draft:" row as `writinghelp`) and member approval; the chance-to-fix notice (as `communicationprepare`); joint approval per group and signatory added (attested or terminal, by the signatory's own organisation's act).
- `escalation`: stop pursuing and reopen (reasoned).
- `action-plans`: scenario set aside (reasoned) and restore (reasoned or reversible); pause (reasoned) and resume (reversible); intended outcome (reversible); review rhythm (`caller-owned`) and review entry (reasoned or `undetermined`); preparation item add (reversible) and take up (`caller-owned`); notes and comments (reversible); closing note (part of `planclose`); status report draft (machine draft; a member's own draft, `undetermined`); take up an item (`caller-owned`, as `reminderset`: a member choosing where her own to-dos go); "another outward step first" (reasoned, as declining).
- `following` (this draft): `watchlink` (`undetermined`), `watchanswer` (`undetermined`: it asks no reason, and no published act takes it back), `followend` (reversible).
- Agent reads and drafts (`agent-worker`, the planning run): assertion reading, reply reading, claim bearings, status-report draft. These are `NON_ACTS` "draft:" or run-directed rows, never in `RUNGS`.

**(b) Text.**
- op-declarations **R49** (T45; the Actions fold; R2–R4's rules) Every op T45's owners serve (the acts above as their merged requirements name them, and their reads) has a spec in `OPS`:
  - Each act a member takes is mutating, in `SESSION_OPS.member` and `SESSION_OPS.admin`, `NEEDS` `contribute` (an owners' act, the owner's own predicate, as `projectvisibilityset`), stamped `author` (or `by`) and `viewer`, with no `machineClasses`.
  - Each machine proposal or labelled draft is reached by any credential (an `ai` credential by its scope), `proposer` stamped, as `templatepropose` and `whatchangedpropose`.
  - Each read is not mutating.
  - An act whose text `mock-acts.js` lacks is named in `ACT_HELP_ABSENT` (R34) until the design stream gives it.
  - An owed act in the screen registry whose op is now declared is registered by `wizard-scripts` R13 with no change there.

  Each op is tested by name, with a negative control (K874). *(not yet met: T45)*
- op-grades **R32** (T45; R3's rule; K2569's pattern) Every op `op-declarations` R49 declares is graded by R5 and R3, `affordances` R12's totality holding over them, each grade read from its owner's requirements:
  - **Rungs.** Each writing op has a rung or one ground of `RUNG_ABSENCE_GROUNDS`. An act that requires an authored reason is `reasoned`, and its refusal code joins `JUSTIFICATION_REFUSALS` (the stop, set-aside, pause, scope, override, contradicted-send and "step first" reasons among them). An act a published act takes back is `reversible`. A member's own setting is `caller-owned` (take-up, review rhythm). Otherwise it is `undetermined`.
  - **NON_ACTS.** Each op has its sentence there, a read beginning "read: …" and a draft "draft: …".
  - **MACHINE_REFUSALS** holds each op in `affordances`' `ACTS` whose method refuses a machine by name, with that code (`affordances` R20).
  - **Phone.** By R18, `phone` follows the rung.
  - **Consequence statements.** `CONSEQUENCE_STATEMENTS` and `IRREVERSIBLE_WEIGHT` gain an op only where its owner's requirement names a consequence that cannot be undone. Which acts take a statement (a scope's removal, stopping pursuit) is the UX stream's to propose (R14's rule).

  Each listed op is tested by name, with a negative control. *(not yet met: T45)*
- affordances **R51** (T45; S1 §D 12; hand-off `actions` "Affordances derive every act an action offers"; v0.2 rule 1; DEC-8)
  - **The acts.** `ACTS` (R1) and `deriveActs` (R8) gain every act directed at an action that T45's owners serve: the escalation acts (open, attach, join on override), the filing and communication acts (prepare, approve, record sent, counsel packet), the hold acts (`actionhold`, `actionholdrelease`, `actionpressure`, the hold notice), the plan acts reached from an action, the clock and reminder acts (`clockadopt`, `reminderset`), the take-up act, and T45's new action acts (scope, receipt, links, "no reply owed", notes, claim bearings).
  - **When offered.** Each is offered on an `action` target exactly where its own refusal would admit this caller (R18). The facts R14 gains for them are asked through the predicates those acts run, each of its owner: the action's escalation and its state, its `legal` marks and holds, its plan link, its scope, its open requests for comment. As before, a null fact never narrows an act (R10).
  - **Vocabularies.** `VOCABULARIES` (R4) gains, by reference, the closed vocabularies T45's owners refuse against: the five basis kinds, escalation states with `stopped_pursuing`, plan states with `paused`, matter states, the harm words, the scopes, and the links `arose_from` and `cures`.
  - **Act help.** `ACT_HELP` (R48) holds each new op's text once the design stream gives it.

  *(not yet met: T45)*
  - Tests: R18 by driving each new act with the caller the facts describe; an action with an open escalation offers its acts (control: one without, not); a machine caller is offered none in `MACHINE_REFUSALS`.

**(c) Uses.** `affordances`: `project-roster` (35) as a new edge if the second-approval setting is its op (backing, R19). Every other owner is already used. `op-declarations`: edges only where its code imports an owner's op map. BOB records them at the job (escalation, filings, conformance, consequences, docket and project-roster are not edges today). `op-grades`: none (it imports nothing).

**(d) Owed.** UX: `mock-acts.js` texts for each new op; door labels; which acts open a consequence dialog.

**(e) Size.** `op-declarations` is **3,433** code lines; about 40–60 specs add about 200–300, to about 3,700. That is close to the threshold, so BOB should watch it (Doubt 7). `op-grades` is 2,636, plus a `t45.mjs` of about 300. `affordances` is 2,351, plus about 200. Both are fine.

**(f) Order.** N891 joins these jobs: `op-grades`' job pins its own tables' content first, then `affordances` drops its copies. Within L11: op-declarations, op-grades, then affordances, as T41.

---

## Doubts

1. **Where the watch register and the question live** (BOB's: module boundaries). *Recommended:* `following` (R23–R26), with `monitoring` holding only an address's end (R71, R72). `monitoring` → `action-plans` is then not added. *Alternative:* DESIGN §11's `monitoring`, with a seam from `following`, adding about 300 lines to a 3,489-line module.
2. **What stopping a duty watch does** (BOB's). *Recommended:* the duty stays held, its occurrences derived and readable; only its "Noticed" telling ends after the day (`notice-producers`). Withdrawing the duty would say the body no longer owes it, which is false.
3. **A standing question linked to a plan** (BOB's). *Recommended:* the link and the question stay its author's alone (`answers` R16, K1481). Owners never see it in a question or in "where it stands".
4. **A relied-on watch** (BOB's reading of rule 17's "shown but not offered for stopping"). *Recommended:* neither keep nor stop is offered, since setting an end date would end it for the plan that relies on it.
5. **Who may stop a follow** (BOB's). `unfollow` is its author's alone. *Recommended:* R25 lets the question's recipient stop or keep it, recorded with her, because the routing already falls back to owners when the author has left.
6. **`queue-producers` size** (BOB's, K617). At about 3,900–4,000 after T45: *recommended:* before its job, split the Action layer's producers (R15–R21, R29, R40–R43) into a new L11 module (e.g. `action-producers`), as `machinery-producers` was split (K1850), `queue-producers.feedItems` reading it as it reads `machinery-producers`.
7. **`op-declarations` size** (BOB's): about 3,700 after T45. *Recommended:* no split now; put T45's specs in a separate file of the module, as `op-grades` keeps `t4x.mjs`.
8. **Departure detection** (BOB's). No read of departures with an instant exists in `membership`. *Recommended:* derive on read from `memberFacts` status and `participation` (R40), with age undetermined until `membership` answers the instant; a later entry may add `departures()`.
9. **A departed member's reminders** (BOB's). *Recommended:* they raise no item (her own request, DEC-69), and R40 names them, so an owner may take up the entry and set her own.
10. **Plan-review and look-again recipients** (BOB's). *Recommended:* R15's chain from the member who set them. *Alternative:* every plan member, which would be several items for one rhythm.
11. **A second-approval request as a to-do** (BOB's). *Recommended:* no item in T45. The pending second approval shows on the filing, and any member may approve. A routed request would choose a person, which rule 20 ("nobody assigns anybody") rules out. Put to the design stream as a screen question.
12. **"Start and send"'s `@communication`** (BOB's). No Tier 1 template is a generic communication, so the script stays withheld (K1883). *Options:* (a) the design stream re-points that step (no `{template}` draft, or the kind's template named); (b) the Tier 1 set gains a generic one (not in v0.2 rule 11's list); (c) a kind-relative reference resolved at the step (a `filing-templates` R26 change). *Recommended:* (a) now, (c) as a later entry if the design stream wants it.
13. **The docket mark's read** (BOB's). *Recommended:* `actions.holdsDue` extended to docket marks, since `actions` owns the act and already reads `docket` (103 < 118). Then `queue-producers` R19 reads one source.
14. **Time-of-day overdue** (R34; BOB's). This is not in the hand-off's monitoring line; it follows from `action-clocks`' rule-6 line. *Recommended:* drafted as above. Drop it if `action-clocks`' draft keeps time of day in display only.
15. **`member-left-items`' disposition** (BOB's, `queue` R12). It is a FINDING with no project-scoped finding id. *Recommended:* `available: false, instead: queuemute`, as a CONDITION, since its doors are the take-ups.

None of these changes what a ruled requirement means, or touches values, money or legal exposure, so none is put to Bob.

## Hand-off lines assigned here, and where each went

| Hand-off line | Placed |
|---|---|
| monitoring/following: watches carry end dates | following R22, R14; monitoring R71, R32 |
| once-only question at close / all promise-duties met | following R24, R25; queue-producers R41 |
| watches another plan or project relies on: shown, not offered | following R24 (`relied_on`), R25 (`WATCH_RELIED_ON`); monitoring R72 |
| new uses edges to `action-plans` | `following` → `action-plans` added; `monitoring` → `action-plans` not needed (Doubt 1) |
| queue-producers R15–R18: departure, owners told once, items to who takes them up | R15–R18, R21 amended; R40 |
| hold to-do from a docket `legal` mark | R19 amended |
| one item per fact | R15, R18 amended |
| queue doors per action to-do kind (S1 §D 4) | R42 |
| project-roster: on leaving, owners told once (producer in queue-producers) | R40 |
| DESIGN §11: one date, one reminder; `queue-producers` draws one item | R15, R18 amended |
| wizards: records request, public comment, demand, escalation stage, oversight referral, pick up a plan | wizard-scripts R22 (second clause); words owed to UX |
| filing-templates: "fixes `wizard-scripts` R22's `@records-request`" (S1 §D 5) | wizard-scripts R22 (first clause) |
| actions: affordances derive every act an action offers (S1 §D 12) | affordances R51 |
| every new L9 act declared, graded, offered | op-declarations R49, op-grades R32, affordances R51 |
| (found need) the assistant's new labelled drafts placeable by a wizard | wizard-scripts R13 |
| (found need) time-of-day deadlines marked at the instant | monitoring R34, R50 (Doubt 14) |
| (found need) plan review rhythm and look-again date told | queue-producers R43 (N890) |
| (found need) "where it stands" shows watches; `action-plans` cannot read layer 10 | following R26 + a door owed by `action-plans` |

No "measure first" item falls to these modules (no `M-` note).

## next.md entries

- **N855**: part 6d is applied whole by following R22–R26, monitoring R71, R72 and R32, and queue-producers R41, with their owed reads (`action-plans`, `answers`, `notice-producers`). 6a–6c are the L9 workers'. The entry moves to applied when their drafts are adopted.
- **N858**: the `@records-request` fix (wizard-scripts R22) and D10's hold from a docket pressure mark (queue-producers R19) are applied here. The rest is the L1/L5/L9 workers'.
- **N881**: `queue-producers` R15–R18's "else" gap is closed (R15–R18, R21, R40), and the "pick up a plan" wizard is carried (R22, words owed). Take-up, "where it stands" and status reports are `action-plans`' (other worker), with R26's seam for its watch part.
- **N882**: "a missed own deadline told once" is applied (R15's `ours`). **Remains:** "the proceeding followed with its own dates". *Hard reason:* the approved hand-off assigns it to no module, and v0.2 places a party's dates in action clocks ("our deadlines"). Following a court or commission docket is COURTS L2, a ladder rung not scheduled in T45.
- **N890**: the review rhythm's and look-again's items are applied (R43). The rest is `action-plans`'.
- **N891**: not part of this fold. It joins `op-grades`' and `affordances`' T45 jobs, in that order (pattern (f)).
- **N828, N861, N879, N880, N883, N884, N885, N887, N892**: only their new ops' declarations, grades and offering touch these modules (R49, R32, R51). Each moves with its L9 owner's draft.

Fully applied by these modules alone: none (each entry spans the L9 drafts).
