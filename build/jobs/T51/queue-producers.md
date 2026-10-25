# queue-producers (T51)

**Status** · session_016R48b4KURUGUt3h76T2fsb · depth 2 · COMPLETE · handled B13

## J1 · REPORT

T51-102 queue-producers: what the word list lacks, and what I found beside my module. For BOB to carry to the design stream (K3944) and to the jobs named.

**1. Fills a source states as a bare code, or an unkeyed sentence, which the word list holds no key for (R43's control).** Each item is still raised; the fill is left empty, or the optional sentence left out; no English is written here, no field is added to `facts`.
- `queue.export-performed.summary` and `.detail` `{scope}`: corpus-export states the scope as the codes `working-corpus` and `rendering` and the list has no word for either. The summary reads "A full export was taken on …" (the blank closed up); the detail reads "An export of the left your team's Civicsmith …", which is broken until the design either supplies a word per scope code (suggested: a `corpus-export.scope.<code>` pair) or drops `{scope}` from `queue.export-performed.detail`.
- `queue.newer-capture-affects-reference.detail` `{grade}`: reevaluation states the grade as the codes `affected` or `undetermined`; no key. It reads "… was read as. Nothing about the reference has changed …". `.detail.affects` (`{affects}`): reevaluation states what it affects as a code or a short phrase; no key, so the sentence is left out.
- `queue.new-version-arrived-from-another-team.detail.state` `{state}`: basis-versions states a reading's state as the codes `suggested`, `accepted` and so on; no key, so the sentence is left out.
- `queue.docket-core-due.what.*`: only `response`, `statement`, `edition` and `tension` have a word; a kind docket might add later leaves `{what}` empty.
- `queue.source.untitled` `{date}`: read from provenance's register and receipts (the earliest `first_retrieved` of the bundle's captures); a document with no capture day readable leaves it empty ("A document with no title, captured has changed at its source").
- `queue.cited-docket-entry-refused.detail.*` `{checks}`: the failed checks' codes as case-import gives them (R43 asks for the codes); a refused entry whose check is named by no code leaves it empty.
- `queue.cited-docket-unreadable.detail.reason` `{reason}`: case-import states the reason it recorded (a code such as `not_json`, or a short phrase it was given); carried as recorded, since there is no key to read it through.
- `{statement}` (capture-requests) and `{says}` (intent) are the owners' own sentences, built there through `word`; neither module exposes the key and vars beside the text, so a screen cannot re-read them in another language. They are passed on as the owners state them.
- R45's feed ids: the word table holds a key for `sources` only (`queue.allclear.failed`). The ids with no key, so the screen's fill is empty: bias-debts, proposals, shared-inquiries, leads, exports, references, objectives, machinery, contradictions, signing-keys, action, attribution, docket, cited-cases, wizards, schedule, places, projects.

**2. Found beside my module.**
- queue: its 29 reds (`world.mjs` builds project-roster without `migrate()`, so `project_scopes` is absent) now pass, because R45 makes a feed whose provider throws a named feed in `facts.failed` rather than a throw of the whole read. The world is still broken and the `projects` feed is named failed in every one of those tests; queue's job should run the roster's `migrate()` as its entry says, and may want to assert `facts.failed` is empty.
- wizard-scripts: its fixture (`test/m/wizard-scripts/fixture.mjs`) still lacks `project_scopes` (T51-139). My two inherited reds (`wizard.test.mjs`:105, :139) are green for the same reason, with `projects` named failed in them, until T51-139 merges.
- plane: `test/m/plane/compose.test.mjs` "R11, R5: every op of local-facts' and filing-templates' maps …" fails on the tranche tip without my change (1 of 260).
- The requirement file still marks R43, R44 and R45 "not yet met: T51"; marking them met is BOB's. All three are named by tests.

**3. Low-level choices I made in my module.**
- A date or clock inside a sentence is read in the group's zone (`publish-schedule.groupZone`, civil-time `localDay` and `localClock`); with no zone held it is the UTC day, for the sentence only (R36's ages are unchanged), as notice-producers' `{date}` does. A set time is shown as set (`time.at`), never converted.
- A title the viewer may not see is not written into a sentence (R11): the lead's run question and a newer-capture notice's pinned document fall back to the id and to `.summary.untitled`.
- A member is named by handle (the signing key's registrant, a wizard's submitter); a case by its id.
- `facts.absent` names `places` (no read registered) and `attribution` (publication's case documents not migrated here). `facts.failed` carries a provider machinery-producers or action-producers names failed as `partial`.
- Items now come in feed order: R39's wizard-base items follow R32 and R33 (they used to follow the place item); queue sorts before it cuts.

## J2 · COMPLETE

T51-102 queue-producers applied whole. Branch job/T51/queue-producers @ f87911f624, tranche/T51 merged at fe5d5656fb (nothing newer at the time).

**Entries applied**
- R43 (N1231, DEC-329 (10), K3766, K3806): every older producer's `summary` and `detail` read through `word(key, vars)` (the item answers `summary_key` and `detail_key`); facts, not English, in the placeholders (a local day as `date.daymonth` or `date.daymonthyear`, a set time as `time.at` with `time.clock`, a published instant read in the group's zone through civil-time's `localDay` and `localClock`; a count by `.one` or `.other`; an optional fact its own sentence). R1's bias debt now carries its detail. The producers, the keys they read and the gaps are in `words.mjs` and the REPORT.
- R44 (N1209, K3843): `project-invitation` reads `project-roster.projectInvitations({viewer})`, following `next` to 50; the inviter by handle, the handle-less founder as `member.founder.unnamed`'s word (never `admin`), none recorded or a read that fails: the unnamed summary, the item still raised; age from `invited_at`, else her row's `created`; `basis.inviter` as `{member, handle, founder}` or null.
- R45 (DEC-330 A62): `feedItems` reads 19 feeds each on its own; `facts.failed` `[{feed, reason}]` (`threw`, `refused`, `undetermined`, `partial`), `facts.absent`; `[]` when every feed answered.
- Words findings (W, K3957, K3962): the 35 findings, the 33 plain strings (each judged a sentence a member may read: converted to `localize` ids) and the 7 test copies; `node checks/words.mjs /home/user/bio queue-producers`: 0 failures, and none naming my module over all 175 modules.
- Inherited reds (K4065): `wizard.test.mjs`:105, :139 green (see the REPORT: R45 contains the roster read that fails in wizard-scripts' fixture).

**Deferred:** none.

**Found in other modules:** in the REPORT (queue's 29 reds now contained, wizard-scripts' fixture, plane `compose.test.mjs`, and the keys the word list lacks).

**Tests and checks** (from /home/user/civicos-process unless stated)
- `node --test bio-plane/test/m/queue-producers/` (bio): 117 tests, 117 pass, 0 fail. Added: `words.test.mjs` (R43, 22), `inviter.test.mjs` (R44, 5), `feeds.test.mjs` (R45, 7), `every.mjs` (the shared fixtures, moved out of `feeditems.test.mjs`). The 83 earlier tests were changed only where they held a sentence's text.
- Users of the services I provide: `bio-plane/test/m/queue/` 164 pass, 0 fail; `bio-plane/test/m/instance-setup/` 182 pass, 0 fail; `bio-plane/test/m/plane/` 259 pass, 1 fail (`compose.test.mjs`, red on the tranche tip without my change).
- `node checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio queue-producers`: 19 product files, 87 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio queue-producers`: 33 of 33 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio queue-producers tranche/T51 job/T51/queue-producers`: 23 files changed by queue-producers; 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0; architecture 1 failure and coverage 24 failures, none in my module; words 1024 failures, none in my module.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only (the `localize` ids I changed are not in `rows.mjs` yet); no refusal naming my module.

Size (session_01LGxvuQMoQnNwSkNodRjiu5): test runs 44, module lines 3144

## J3 · COMPLETE

B2 CHANGE applied. tranche/T51 merged (design @ 2a64c5ae77, DEC-359); branch @ 568de76e87.

- `queue.export-performed`: a full export drops {scope}; a rendering reads `.rendering.summary` and `.rendering.detail` with {format} from `queue.fill.format.<code>`.
- `newer-capture-affects-reference`: {grade} from `queue.fill.grade.<letter lower-cased>`, `.detail.affects` from `queue.fill.affects.<code>`, `.detail.unseen` when reevaluation blanks the capture for the viewer.
- `new-version-arrived-from-another-team`: `.detail.state` back, {state} from `queue.fill.state.<code>`.
- `cited-docket-entry-refused`: {checks} the `queue.fill.check.<code>` words as one list, `queue.fill.check.undetermined` when none.
- `cited-docket-unreadable`: {reason} from `queue.fill.reason.<code>` (`.http` with {status} for http_<n>).
- A code the list holds no word for is left empty, or its optional sentence left out; never written into a sentence.
- Not changed, for BOB: `{statement}` (capture-requests) and `{says}` (intent) are still passed as the owners state them; B2 named no key for them (`queue.fill.statement.*` exists, but capture-requests does not expose who/run/payer beside its text).

Tests: queue-producers 117 pass, 0 fail (new assertions in words.test.mjs; cited and shared tests moved to the real check codes and states). Checks: format 0, architecture 0, coverage 33 of 33, words 0 failures, ownership 0 failures.

Size (session_01LGxvuQMoQnNwSkNodRjiu5): test runs 49, module lines 3180

## J4 · QUESTION

QUESTION (R49, entry 2 · L13), best reading below; I carry on with it.

R49 as drafted says a feed's reads are "bounded by the number of kinds it reads, not by projects x items". Most of the reads that grow are not mine to batch: contradiction.candidatesFor and conflictNotices take one `{project}`, case-tensions.caseTensions one project, project-roster.projectOwnerVotes and projectRequests one project, basis-versions.projectsDrawingOn one question, and queue's `homesOf(subjectIds)` one subject set. None has a batch form, so no change inside this module can make those constant in the number of projects.

My reading, which I am building: every read THIS module makes itself is one statement per kind of fact for the whole feed and is made once per read (the member's joined and owned projects by one join over membership's contract tables (R120); bundle rows, titles, owners, case projects, capture days by one `json_each` statement; the shared-question candidates and their per-question reads computed once for all three shared-inquiry finders, not three times; `homesOf` and `optionsOf` asked once for each distinct subject set). Provider reads keyed by one project or one question stay one for each distinct project or question (at most 50 and 64), never again per item or per page repeat. The test counts this module's statements and the homes/options calls at two sizes, and the provider reads against the project count.

If the live `facts.ms` still shows contradictions dear after this, the remedy is a batch form in the owners (`candidatesFor`/`conflictNotices` taking `projects: [...]`, `caseTensions` the same, and a batch `homesOf` in queue): I will list them in my REPORT for you to place. Tell me if you want R49 read otherwise.

## J5 · REPORT

REPORT (FR-22): what I found beside my module, and what the word list lacks. For BOB to place.

1. Words the list lacks for R46-R48 (design stream). The items are raised and read; each sentence is written once with `localize` under `queue-producers.index.*` ids, and the item answers `summary_key`/`detail_key` for the design row the moment the list holds it (the list wins). Rows wanted: `queue.endorsement-owed.summary` ({who}, {have}, {awaiting}) and `.detail`; `queue.endorsement-owed.owner.summary.add` and `.remove` ({who}, {project}, {agreed}, {awaiting}) and `.owner.detail`; `queue.expertise-confirmation-owed.summary` ({who}, {label}) and `.detail`; `act.projectownerremove.label.queue` (the add has `act.projectowneradd.label.queue`; the removal's label is written here: "Agree to remove an owner").

2. Batch forms in the owners (K4222: list for BOB to place after the redeploy's live `facts.ms`). What still grows with projects or items and is not this module's to batch: `contradiction.candidatesFor({on:{project}})` and `conflictNotices({project})` (one project each, up to 50 projects x pages), `case-tensions.caseTensions({project})`, `project-roster.projectOwnerVotes` and `projectRequests` (one project each), `intent.gaps({project})`, `basis-versions.projectsDrawingOn(question)` and `conclusionOf`/`conclusionRecordOf` (one project and question each), `provenance.homeOf(sha)` per lead, and queue's `homesOf(subjectIds)` (one walk for each distinct subject set; this module now asks each set once). A batch form would be `projects: [...]` on the first three and a `homesOf` that takes many sets.

3. L12, the likely cause (read from code, not yet confirmed live): the founder's session is the bare viewer `admin`; `viewerPredicate("admin").member` is null (`member-roster` `viewerMember`), so `contradiction.conflictNotices` refuses every project with NOT_A_PARTICIPANT (its `#projectRefusals`, `contradiction/index.mjs:2699`) although the founder is a joined participant (`membership.participation` finds her row under the member id `admin`). `#answered` read that refusal as the feed's failure: `failed:["refused"]`, and "which of the four" could not be told. Now: the refusal codes NOT_A_PARTICIPANT, NO_SUCH_PROJECT and PROJECT_SEEN_NOT_A_PARTICIPANT are "told nothing" (R7) and the feed answers; any other refusal names `read` and `code`. The finding for `contradiction` (and `membership`): the founder is never told a notice or shown a project conflict (R50, R25's project reach) because its gate does not know her member id; it should read the member through `viewerMember(viewer, identity)` as `membership` R154 does. `queue` should carry `read` and `code` from `facts.failed[]` into `feeds[]` so the live copy can say which, if a refusal remains.

4. `queue` (FR-23) reads the new optional fields: `door` on `endorsement-owed` and `expertise-confirmation-owed` items (`adminendorse`; `projowneradd`/`projectownerremove` for an owner vote, `expertiseconfirm`), `facts.ms` ({feed id: ms}, the `members` feed included), and `facts.failed[].read`/`.code`. Added fields only; no existing answer changed.

5. Inherited, not mine: `plane` `test/m/plane` has the same 4 reds on the tranche tip with and without my change (case-import route map, the R24 surface words, `op=sweeps`, T46's route map). `setup-words` `rows.mjs` is stale for the `localize` ids I added (expected; BOB regenerates at the layer close).

6. Low-level choices I made in my module: a member is named in R47 by the handle `projectOwnerVotes` gives, matched against her id, handle and (founder) held handle; R46-R48 items have no project home (as R41, R42); R47's `<change>` in the key is `add:<target>` or `remove:<target>`; the pages of `side-corrected` are followed first and the items made after, each carrying the `read` and `cut` flags it had when its page was read (as before).

## J6 · COMPLETE

COMPLETE (FR-22 · B3 START and B4 CHANGE; K4222 answers J4). Branch job/T51/queue-producers; tranche/T51 merged at the start (nothing newer since).

**Requirement lines:** written by me in `build/requirements/queue-producers.md` (not in this record), each marked *(not yet met: T51)*: R46, R47, R48 (the `members` feed, each with its door), R49 (as K4222 states it), R50 (L12), R51 (`facts.ms`); R8's list, R45's feed list (`members`) and Uses amended; the ownership check lists that one file, accepted at the merge (B4). My correction to J5 item 4: the owner-vote doors are `projectowneradd` and `projectownerremove`.

**Entries applied**
- Entry 1 (C62, K4169, UC-046) R46-R48: the `members` feed (the 20th) reads `member-roster.endorsementsOwed` and `expertiseAwaitingConfirmation` and `project-roster.projectOwnerVotes`. An endorsement owed is one OBLIGATION `endorsement-owed` for each administrator who has not endorsed (key `...::admin::<proposed>::<member>`); an owner vote owed one for the owner whose vote is awaited (`...::owner::<project>::add:<target>::<member>`, `door` `projectowneradd`/`projectownerremove` as the change is); an expertise awaiting confirmation one `expertise-confirmation-owed` for each administrator, the same id for all, so one confirmation clears them (B4: every item carries its optional `door`: `adminendorse`, `projectowneradd` or `projectownerremove`, `expertiseconfirm`). A throw or refusal in them names `members` and loses no other feed.
- Entry 2 (L13, K4194) R49, R51: every read the module itself makes is now one statement per kind of fact for the whole feed, made once: the member's joined and owned projects each by one statement over membership's R120 contract (not a read per project), bundle rows, titles, sight, owners, case projects, authors, capture days, the proposals' instance bundles and the leads' register and leg counts each read for all items at once, the three shared-inquiry kinds sharing one candidate list and one read per question, `homesOf` and `optionsOf` asked once for each distinct subject set (the machinery and action feeds are handed the same memoised ones). `facts.ms` is `{feed: ms}` for every feed read, the one that threw included, a feed in `absent` not. Provider reads keyed by one project or question stay one per distinct project or question (K4222); they are listed in J5 for you to place.
- Entry 3 (L12, K4195) R50: `facts.failed[]` entries carry `read` (`<module>.<read>`) and `code` where a provider refused or answered undetermined, and `read` alone for a throw inside a named read (the contradictions feed's four reads name themselves); `NOT_A_PARTICIPANT`, `NO_SUCH_PROJECT` and `PROJECT_SEEN_NOT_A_PARTICIPANT` from `conflictNotices` are "told nothing" for that project, not a failure. The likely live cause (the founder's bare `admin` viewer has no member id in contradiction's gate) is in J5.

**Deferred:** the provider batch forms and queue's batch `homesOf` (K4222, J5 item 2); the design rows for R46-R48's sentences (J5 item 1; the sentences are written once with `localize` until the list holds them).

**Found in other modules:** J5 (words the list lacks; batch forms; the founder's gate in contradiction; plane's 4 inherited reds; rows.mjs stale for my `localize` ids).

**Tests and checks** (from /home/user/civicos-process unless stated)
- `node --test bio-plane/test/m/queue-producers/` (bio): 135 tests, 135 pass, 0 fail. New: `members.test.mjs` (R46-R48, 8 tests) and `reads.test.mjs` (R49 ×5, R50 ×3, R51 ×2); each written before the code and seen failing on the unchanged source (14 of the 18 fail there; the four that pass on it are controls: R46, R47 no-item controls, R50 "no candidate index", R49's small-size answer, which is the answer before the change). Amended, not weakened: `feeds.test.mjs` (R45's `failed` entries now `{feed, reason, read, code}` where R50 gives them; `members` joins the feed list) and `words.test.mjs` (R51's `ms` joins the facts keys, the key list still pinned exactly).
- Users: `bio-plane/test/m/queue/` 180 pass, 0 fail; `instance-setup` 216 pass, 0 fail; `plane` 262 pass, 4 fail (the same 4 on the tranche tip without my change).
- `node checks/format.mjs /home/user/bio`: 175 modules, 175 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio queue-producers`: 26 product files, 105 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio queue-producers`: 39 of 39 live requirement ids named by a test; 0 failures.
- `node checks/words.mjs /home/user/bio queue-producers`: 0 failures. `node checks/run.mjs /home/user/bio`: format 0, architecture 0, words 16 failures (strength, op-grades), coverage 5 failures (agent-harness, agent-runner, installer-steps, journey-check, link-sweep): none in my module.
- `node checks/ownership.mjs /home/user/bio queue-producers tranche/T51 job/T51/queue-producers`: 7 files changed by queue-producers; 1 failure, `build/requirements/queue-producers.md` (accepted at the merge, B4). `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only (the `localize` ids I added are not in `rows.mjs`); no refusal naming my module.

Size (session_01RGDHZRqyU8MUPCnVS1KQxu): test runs 26, module lines 3562

## J7 · COMPLETE

T51-102 queue-producers, B7 (K4245) applied. Branch job/T51/queue-producers @ 1a99ef27a0 (on tranche/T51's tip; pushed).

**Entries applied**
- R46, R47, R48: each OBLIGATION item carries `fills.who`, the member's handle: R46 and R48 as member-roster answers it (`handle` on `endorsementsOwed` and `expertiseAwaitingConfirmation`); R47 as project-roster names the target (`projectOwnerVotes`, by handle). `fills` is always present; `fills.who` is absent when the member holds no handle (a founder's held handle counts). The subject id is unchanged in every case, and the sentences keep their existing name fallback to the id.
- R47 uses `membership.memberByHandle` and `founderHandle` to tell a handle from an id, since the roster falls back to the id for a member with no handle.

**Tests**
- New, each named by its id and each with a control (no handle, no `who`, id stays): `R46 (B7)`, `R47 (B7)`, `R48 (B7)` in `bio-plane/test/m/queue-producers/members.test.mjs`. Seen failing before the change, passing after.
- `node --test test/m/queue-producers/`: 138 tests, 138 pass, 0 fail.

**Checks** (from /home/user/civicos-process, against /home/user/bio)
- format: 175 modules, 175 requirements files; 0 failures.
- architecture queue-producers: 26 product files, 105 relative imports; 0 failures.
- coverage queue-producers: 39 of 39 live requirement ids named by a test; 0 failures.
- words queue-producers: 0 failures.
- ownership queue-producers tranche/T51 job/T51/queue-producers: 3 files changed by queue-producers; 0 failures.
- Not run: `checks/run.mjs` (the full sweep); this job's B7 entry does not ask for it, and the earlier sweep's failures were all outside this module.

**Deferred:** none.

**Found in other modules:** none in this change.

**Requirement lines for BOB** (not written into `build/requirements/queue-producers.md`; BOB places them). Each is an amendment of the line named, marked *(not yet met: T51)* until BOB accepts:
- R46 (amends the line): "... It also carries `fills.who`, her handle as member-roster answers it (its R77), absent when she holds none; `subject` still names her id."
- R47 (amends the line): "... It also carries `fills.who`, the target's handle as project-roster names her (its R30), absent when she holds none; `subject.target` still names her id."
- R48 (amends the line): "... It also carries `fills.who`, the declarer's handle as member-roster answers it (its R78), absent when she holds none; `subject` still names her id."

Size (session_01PLhNRyfycvsdh5hgzEqhcL): test runs 7, module lines 3577

## J8 · QUESTION

QUESTION (C69, C94; fix round 2). Best reading below; I carry on with it and it is applied.

1. Requirement lines are not written for either cause. Proposed, for you to fold: **R8 amended / new R52 "One item per matter"** (C69): `feedItems` answers one item for each matter: a fact of an action's deadline, in whatever status and however many of its facts are due, is one `local-fact-due` to do for that action (action-producers R7 raises one per fact and status; the survivor is the item with the least id, its basis naming every `statuses` and `paths`); any other item equal to an earlier one in class, kind, subject, summary, detail and basis is that item again; a different subject or basis is a different matter. **R53 "Members are named by handle"** (C94): a sentence names the founder by the handle she holds, else by `member.founder.unnamed`'s word, never `admin`; another member by her handle (R46's fallback to her id stands). My tests name R8, R14, R33, R48 until R52/R53 exist.

2. C94 and "never an id" for a member who has no handle: R46 says "her handle, else her id", and no word key exists for such a member (interface-shell R111 names none), so I changed only the founder (the defect: `admin` shown) and left a handle-less ordinary member named by her id, as R46 states. If you want no id at all, the design stream needs a row (suggested `member.unnamed`, "A member") and R46's wording changes; say so and I use it.

3. C69's second half, "two identical NOTICED items": NOTICED items come from `notice-producers`, which `queue` reads beside this module; this module cannot collapse them. The rule above holds for every item this module answers (machinery, action included). If the live duplicate is in notice-producers' own answer, its job (or queue's merge) needs the same rule: one item per matter.

## J9 · COMPLETE

COMPLETE (B8 START, fix round 2, wave 1). Branch job/T51/queue-producers @ ed4a728d86, tranche/T51 merged at the start (nothing newer).

**Causes met**
- **C69** (R8, proposed R52; QUESTION above): `feedItems` answers one item per matter. A fact of one action's deadline, in any status and however many facts, is one `local-fact-due` for that action (least id stands, basis `statuses` and `paths` name what it stands for); any item equal to an earlier one in everything but its id is that item again; two actions' deadlines, and items on different subjects, stay two. Tests in `matters.test.mjs` (5): four statuses of one action's facts are one; the survivor is the same whatever order the provider answered; two equal notices are one, differing ids with equal content one, another subject two; two actions two; a repeat keeps the first one's place, no id twice. Seen failing on the unchanged source (5 of 5 new C69 tests fail there; the "two matters are two" control passes on both).
- **C94** (queue-producers' part; proposed R53): `#memberName` names the founder by the handle she holds (membership `founderHandle`), else by `member.founder.unnamed`'s word, never `admin`; R14's signer key, R33's author, R44's inviter (when `by.member` names the founder) and R46-R48's `who` read through it. Tests in `names.test.mjs` (4: R14 twice, R33, R48): founder with and without a held handle; control: an ordinary member's handle as itself, a handle-less member keeps R46's fallback (her id). Seen failing on the unchanged source (3 of 4; the R14 control passes on both). Shell's `memberName(id)` and the screens' use of it are the other jobs'.

**Deferred:** none. **Words:** no new sentence; `member.founder.unnamed` is the existing row. The key wanted for a handle-less non-founder member is in the QUESTION (item 2).

**Found in other modules (P9):** `build/rulings.md:4298`: K4301 records Bob's approval of a refused act but states no standing-list decision (`checks/format.mjs`: 1 failure, BOB's file). `notice-producers`/`queue`: item 3 of the QUESTION (NOTICED duplicates). No generated artifact made stale.

**Tests and checks** (from /home/user/civicos-process unless stated)
- `node --test --test-force-exit bio-plane/test/m/queue-producers/` (bio): 147 tests, 147 pass, 0 fail (138 before, 9 new: matters 5, names 4; the older tests that name a handle-less member by her id are unchanged and pass).
- Users of what I provide: `bio-plane/test/m/queue/` 206 pass, 0 fail; `bio-plane/test/m/instance-setup/` 216 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 175 modules, 175 requirements files; 1 failure, `build/rulings.md:4298` (not mine). `checks/architecture.mjs`: 26 product files, 106 relative imports; 0 failures. `checks/coverage.mjs`: 39 of 39 live ids named; 0 failures. `checks/words.mjs`: 0 failures. `checks/ownership.mjs /home/user/bio queue-producers tranche/T51 job/T51/queue-producers`: 4 files changed; 0 failures.

Size (session_014VPFaRWHG8FznaELunDUKF): test runs 9, module lines 3618

## J10 · COMPLETE

COMPLETE (B9 START, fix round 3, wave 1). Branch job/T51/queue-producers, tranche/T51 merged at the start (providers of wave 1 not needed: reevaluation's `notices` is read as scripted in the tests).

**Cause met**
- **C69** (re-walk B CA60; R52): `#findingsNewerCapture` answered one `newer-capture-affects-reference` item per reevaluation notice, so two notices of one newer capture on one holder and target (different `ord`, a reference pinned twice) drew twice. It now answers one item per (holder, target, newer version), standing where the first stood, the least notice id surviving, `basis.notices` naming every notice it stands for. A notice whose newer version the viewer cannot see (`newer_capture` and `newer_bundle` both blank) has no version to key on and stays its own matter. The identical-looking pairs of "Who issued a document", "A full export" and the signing-key notices are other producers' items and are untouched (R52's equal-item rule stands).

**Proposed requirement line for BOB (R52 gains a clause, or a new id):** `newer-capture-affects-reference` is one item for each (holder, target, newer version) its notices share: the survivor is the item with the least notice id, its basis naming every notice (`basis.notices`); a notice whose newer version the viewer cannot see is its own matter. The tests name R52.

**Found, for BOB (P9):** the door acts (`versionadopt`, `versionkeep`) take one notice id, so adopting or keeping on the surviving item closes that notice only; the other notice of the same version stays open and appears as its own item on the next read, until reevaluation closes sibling notices of one version together (or `queue` carries `basis.notices` to the act). Deferred: this, not mine to change. `build/rulings.md:4346` (K4349) fails `checks/format.mjs`: BOB's file, also red on the tranche tip.

**Tests and checks**
- `node --test --test-force-exit bio-plane/test/m/queue-producers/`: 151 tests, 151 pass, 0 fail (147 before, 4 new in `noticed.test.mjs`, the first seen failing: 2 !== 1).
- Users (`impact.mjs`): `queue` 206/206; `control-plane` 340/340; `store-door` 52/53 and `plane` 279/280, the one failure of each (R17 op-grades; R24 screen words) also fails on the tranche tip, not mine.
- `checks/run.mjs`: format 1 failure (rulings.md, above); architecture 0; words 0; coverage: queue-producers not among the 16 failures (other modules' ids); ownership 0 failures.

Size (session_01QHswMjuJkugiUqGLjnDCa5): test runs 7, module lines 3633

## J11 · COMPLETE

COMPLETE (B9, C69, R52): one newer-capture item per (holder, target, newer version); 151/151 module tests; details and proposed R52 clause in J10 of the record. Found: door acts take one notice id, so a sibling notice of the same version reappears after adopt/keep (see record).

## J12 · QUESTION

Fix round 4, cause C69 (queue-producers, wave 1, #14). The fix is committed and pushed (60da3f642a on job/T51/queue-producers, merged with tranche/T51). Two things need BOB's decision before COMPLETE; the rest of the job is done.

**C69, the four fields.**
1. Root cause, certain: `bio-plane/src/queue-producers/index.mjs:1511` builds the sentence with `fillWord("grade", n.grade)`. A capture read after its first carries no grade (reevaluation's grade-not-carried, `reevaluation/index.mjs:2819`), so the word is blank and the sentence reads "was read as. Nothing about the reference...". Fix: `n.grade ?? "undetermined"`, the same fallback reevaluation's own text uses (`reevaluation/index.mjs:2379`).
2. Test gap: every fixture grades its notice, so the blank was never built. The new test grades none.
3. Failing-first: `test/m/queue-producers/noticed.test.mjs`, "R52 (C69): a newer capture no one has graded reads as undetermined, and its two notices are one item". Red before the fix (sentence reads "was read as."), green after.
4. N (pure code).

Suites: queue-producers all 152 tests pass. queue + store-door 258/259: `store-door/declared-ops.test.mjs` R17 (op-grades, `groupdescriptiondraft`) red. control-plane 355/356: `t47-e2e` R81 red. plane 278/283. The three reds (store-door R17, control-plane R81, plane's five route-map tests) are the same on origin/tranche/T51 (checked in a worktree of the tip); none is in a file I changed. Checks: ownership 1 file, 0 failures; format 0; architecture 0; coverage: no failure for queue-producers; words: 3 failures, all in op-grades (not mine). Impact: 5 modules, 113 test files.

**Decision 1 (repair for the old pair).** Read-time R52 already merges notices with the same holder, target and newer version, so the two stored NOTICED items should merge when both carry `newer_capture` or `newer_bundle`. If they still show twice on the smoke copy, their stored records lack both keys, and this module puts each such notice on its own. queue-producers is a read-only producer (its reader's role forbids writes), so it cannot merge stored rows at a wake. Recommendation: first, a read of the two stored notices on the smoke copy (LIVE-CHECK, read only). If they share holder, target and newer version, no repair is needed and C69 closes. If they lack the keys, the repair belongs to reevaluation, which owns the notices; I will not write it here. Which do you want?

**Decision 2 (word).** The grade fill for `undetermined` is `queue.fill.grade.undetermined` = "undetermined: the record lacks what it needs to tell" (`setup-words/rows.mjs:7213`). Inside the sentence it reads "was read as undetermined: the record lacks what it needs to tell." The sentence is right in shape but the fill carries a clause. Recommendation: a short fill row for the sentence (e.g. "undetermined"). I have not edited rows.

Waiting on BOB (J4) for these two answers. Nothing else is open.

## J13 · COMPLETE

COMPLETE, fix round 4, queue-producers (T51), cause C69. Commit 60da3f642a on job/T51/queue-producers (tranche/T51 merged in). Answers: J12 answered by B11 (K4440): no repair this round; the fix is new data only (R-OLD); the re-walk scores the old pair apart, and if the two stored notices lack the version keys, the repair is reevaluation's next entry. Keep the existing fill; the short fill row goes to the design's word batch.

**C69 (queue-producers owns the sentence; one module, no seam; the test enters by the act: `read` of the reference's notices).**
1. Root cause, certain (file:line): `bio-plane/src/queue-producers/index.mjs:1511` builds the detail with `fillWord("grade", n.grade)`. A capture read after its first carries no grade (reevaluation grade-not-carried, `reevaluation/index.mjs:2819`), so the word is blank: "was read as. Nothing about the reference has changed". Fix: `fillWord("grade", n.grade ?? "undetermined")`, the fallback reevaluation's own text uses (`reevaluation/index.mjs:2379`). Key used: `queue.fill.grade.undetermined` (its English row, `setup-words/rows.mjs:7213`, is "undetermined: the record lacks what it needs to tell"; kept per BOB's answer, for the design's word batch).
2. Test-gap: every fixture grades its notice, so the blank was never built. Fixture now grades none (test below); the control "one item per matter" stays in `noticed.test.mjs`.
3. Failing-first: `bio-plane/test/m/queue-producers/noticed.test.mjs`, "R52 (C69): a newer capture no one has graded reads as undetermined, and its two notices are one item". Red before the fix ("was read as. Nothing about..."), green after. Control: "R52: control: the same newer version on another holder, or another target, is another matter" and the untouched-notice control pass in the same file.
4. Platform check: N (pure code).

**Requirement ids met:** R52 (the new test names it; the row's second line, the sentence, is R43's fill rule and passes with it).

**Suite counts:**
- queue-producers, all files: 152 of 152 pass.
- queue + store-door: 258 of 259. Red: store-door `declared-ops.test.mjs` R17 (op-grades, `groupdescriptiondraft`). Same red on origin/tranche/T51 (checked in a worktree of the tip). Not mine; named, not fixed.
- control-plane: 355 of 356. Red: `t47-e2e.test.mjs` R81. Same red on the tip. Named, not fixed.
- plane: 278 of 283. Reds: R18/R5 (case-disclosures / case-carriage ops routing), R24, R5/R9/R45, R5 and R9 route-map tests. Identical set on the tip. Named, not fixed.

**Checks** (`/home/user/civicos-process/checks/`):
- ownership (queue-producers, tranche/T51): 1 file changed, 0 failures.
- run.mjs: format 0 failures; architecture 0 failures; coverage: no failure for queue-producers (15 failures elsewhere: acquisition, agent-harness, agent-runner, citation, control-plane, installer-steps, interface-shell, journey-check, money, pdf-reader, public-read, queue, screens-daily, screens-inquiry, screens-publish; none mine); channels 0; words: 3 failures, all op-grades (`t33.mjs:214`, `t51.mjs:41`, `t51.mjs:45`), none mine.
- impact (tranche/T51 → HEAD): queue-producers 24/24, queue 29/31, store-door 6/6, control-plane 14/66, plane 40/43; 5 modules, 113 test files; each user's reds are the tip's reds above.

**Open QUESTIONs:** none (J12 answered by B11).

**Deferred:** nothing deferred in my module. The old NOTICED pair: not repaired (BOB's answer); the re-walk reads the two stored notices.

Size (session_01XcQxCDGtXj11iuy1HP8Y8Z): test runs 10, module lines 3630 (`bio-plane/src/queue-producers/`: index.mjs, proposals.mjs, words.mjs)

## J5 · COMPLETE

G65 applied (fix round 7). tranche/T51 merged first.

**Changed.** `bio-plane/src/queue-producers/words.mjs` `fillWord`: a grade code is lower-cased with its underscores closed up, so content's `NOT_FOUND` reads the row `queue.fill.grade.notfound` ("neither the passage nor similar text") instead of `queue.fill.grade.not_found`, which has no row and gave "" (the hole in "was read as . Nothing about the reference has changed"). Derived on read; no old records.

**Failing-first (seen red, then green)**, `test/m/queue-producers/feeditems.test.mjs`: (a) "R43 (G65): a newer-capture notice whose grade is NOT_FOUND, as content emits it, …" and (b) "R43 (G65): every grade content can emit has a word row …", which walks `VERSION_NOTICE_GRADES` from content itself. Both failed before the fix (grade NOT_FOUND left a hole); both pass after.

**Platform check:** N. **Census ops:** none owned or changed. **Rows owed to UX-DESIGN:** none (existing row `queue.fill.grade.notfound` used).
**Requirement lines proposed for BOB:** R43: a grade of any spelling content emits (`A`, `B`, `C`, `NOT_FOUND`, `UNDETERMINED`) is read through its row; no sentence is left with a hole where the grade belongs.
**A.md:39 duplicates:** not researched per the plan; nothing planned until the re-walk lists notice ids.

**Tests/checks.** queue-producers 154 pass, 0 fail; users queue 210 pass, 0 fail; control-plane 447 pass, 0 fail; `impact.mjs` names 0 further modules. `checks/coverage` 41 of 41, 0 failures; `checks/words queue-producers` 0 failures; `checks/ownership` 0 failures; `checks/run.mjs`: failures only in case-checker and installer-steps, none in my files.

Size (session_018ia9y7957RisU9biUjnUGX): test runs 5, module lines 3189

## J14 · COMPLETE

G65 applied: fillWord closes up a grade's underscores so NOT_FOUND reads queue.fill.grade.notfound. Two failing-first tests (red then green); queue-producers 154, queue 210, control-plane 447 pass; coverage, words, ownership 0 failures. Details in record J5.

## J15 · QUESTION

QUESTION (fix round 10, batch 6; replaces nothing): `build/modules.json` is BOB's, and queue-producers' `uses` lacks `escalation`.

`bio-plane/test/m/queue-producers/action.test.mjs` now takes `escalationsDue().due` from `bio-plane/test/m/escalation/fixtures.mjs` (the START's line 88; escalation is earlier in the list). `checks/architecture.mjs bio queue-producers` therefore fails once: "imports escalation/fixtures.mjs of escalation, which queue-producers does not declare in uses". Every other provider I import (action-producers, contradiction, publication, monitoring, docket, provenance) is already in `uses`.

My reading: add `escalation` to queue-producers' `uses`. The alternative is to leave that line hand-built (it stays a fixtures finding), which the START does not want. I carry on with the rest and post COMPLETE with this one check red until you answer.

## J16 · COMPLETE

COMPLETE · fix round 10, Wave B batch 6 (B13): 30 of my 33 fixture lines re-pointed; 3 wait on providers' fixtures; 1 check waits on BOB (J15). Tests only: no source of the module changed. tranche/T51 merged (24b12d1f9f).

**Lines done (fixtures check: 33 listed, 3 left, 2 accepted generic).**
- action-producers/actionItems: `action.test.mjs:20` takes `actionItems().actionProducers` (each read recorded, its answer kept). Real answer: one item (the overdue clock), homed by its own project when no walk is passed; two assertions follow the real answer (see "Tests changed in meaning").
- escalation/escalationsDue: `action.test.mjs:88` takes `escalationsDue().due`.
- contradiction/readRefusals: `contradictions.test.mjs:159` takes `readRefusals().notAParticipant` (the real code is `NOT_A_PARTICIPANT`, not `PROJECT_ACT_NOT_A_PARTICIPANT` as the START said); `reads.test.mjs:90` loops the two real refusals `notAParticipant` and `unknownProject`.
- publication/caseDocumentFacts: `credit.test.mjs:28` and `world.mjs:159` take publication's own absent answer (`caseId`, `edition`, `detail`).
- docket/coreDue: `world.mjs:183` default is the real `unread`; `every.mjs:65` and `localday.test.mjs:38` take the real `due` (its case `DOCKET.case` is the world's case row); `feeditems.test.mjs:50` follows its real ref.
- monitoring/monitoringReads: `world.mjs:173` defaults to `empty`; `every.mjs:59` takes `seeded` (the busy world now also raises a `source-removed`); `reads.test.mjs:21,121` take `empty`; `feeditems.test.mjs:130` takes `seeded.archiveEligible` (the address and host follow it); `producers.test.mjs:114,140` and `words.test.mjs:127` take `seeded.flagged` (titles and capture days set on its two real bundles, once titled and once not).
- monitoring/flaggedRefusal: `producers.test.mjs:133`.
- provenance/homeOfHomed and homeOfEmpty: `feeditems.test.mjs:125`, `lead.test.mjs:18`, `producers.test.mjs:29`, `reads.test.mjs:227` take `homed({sha: bundle})` (world.mjs, over `homeOfHomed`; digests are `sha(name)`); `world.mjs:150` default and `proposals.test.mjs:32` take `homeOfEmpty()`.
- project-roster reads: `feeds.test.mjs:98` and `inviter.test.mjs:74`: the hand-built REFUSED is gone; the real empty `ok: true` list for a viewer it holds nothing for (R35, R36); the throw stays as the boom case. The "projects feed refused" case is no longer tested (no real refusal exists).
- CODE `scheduled.test.mjs:62,157`: `SCHEDULED_SOURCES_CHANGED` and `SCHEDULED_HOLD_CHANGED` (both are real; the START's note that HOLD is in no source was wrong: it is C-58.9 in ratification/checks.mjs), their translations from `word("refusal.<code>")`.

**Markers added (fixtures-generic; BOB reads each, K5060).**
- `feeds.test.mjs:74` `REFUSED`: R45's loop makes each of fourteen providers' reads answer one refusal in turn; the module carries whatever code a provider gives, and most of those providers have no refusal of their own to publish.
- `reads.test.mjs:101` `OTHER`: the control that a refusal code this module does not know is a failure; no real `conflictNotices` refusal other than the two told-nothing codes exists.
No `fixtures-own`, no `fixtures-contract`.

**Lines left, all waiting on a provider's fixture (named, not worked around).**
- `docket.test.mjs:36` and `words.test.mjs:217` (docket/coreDue): the tests need items of kind `statement` (with and without an edition), `edition` (with `what_changed`) and `tension` (with `member`, `state`), over several cases of different projects; `coreDue().due` publishes one `response`. Owed: docket publishes `coreDue` over those kinds. (`words.test.mjs:217` already uses the real `response` item beside two hand-built kinds.)
- `noticed.test.mjs:10` (reevaluation/noticesRead): R52 groups several notices of one holder, target and newer capture, with null grades and other holders and targets; `noticesRead()` publishes one notice. Owed: reevaluation publishes `noticesRead` over several legs, grades and holders.

**Waiting on BOB.** `checks/architecture.mjs bio queue-producers`: 1 failure, `action.test.mjs` imports `escalation/fixtures.mjs` and `escalation` is not in my `uses` (QUESTION J15; the one line in `build/modules.json`). Everything else I import is declared.

**Tests tightened in meaning (real answers differ from the hand-built ones).** `action.test.mjs` R8: the real action-producers gives one item, not two (the plan-review item is gone from the control), its facts are taken from its answer, the options check is the last option (`opt`) rather than the exact pair, the "no walk" check says the item is homed by its own project (the real module reads it) and queue's walk is not asked. Nothing weakened: each requirement id is still named by a full test.

**Found in other modules.** None beyond the owed fixtures above. Fixture cost: `world.mjs` awaits `monitoringReads()` once per test file (about 150 ms).

**Checks and tests.** queue-producers `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit` 154 tests, 154 pass, 0 fail. `impact.mjs origin/tranche/T51 HEAD`: "queue-producers 24/24, affected modules: 1 of 178" (tests only; no user to run). `checks/format.mjs`: 178 modules, 0 failures. `checks/coverage.mjs queue-producers`: 41 of 41, 0 failures. `checks/ownership.mjs queue-producers tranche/T51`: 16 files, 0 failures. `checks/words.mjs queue-producers`: 0 failures. `checks/fixtures.mjs queue-producers`: answer 3 (3 op-table), stub 0, code 0, contract 0, accepted 2; 3 failures (the three waiting lines). `checks/architecture.mjs queue-producers`: 1 failure (above).

Size (session_016R48b4KURUGUt3h76T2fsb): test runs 14, module lines 3630
