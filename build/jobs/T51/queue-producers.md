# queue-producers (T51)

**Status** · session_01RGDHZRqyU8MUPCnVS1KQxu · depth 2 · WORKING · handled B6

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
