# Task summary · T53 · queue-producers

Stands for: `build/plan/current.md` lines 392-399 (plan block); `build/plan/T53-R1/queue-producers.md` (rows); `build/requirements/queue-producers.md` (every R below, unless a module is named); `build/layers.md` (layer 11 "Interface and distribution": ops, member surfaces, installer; queue-producers is after action-producers, before notice-producers and queue; a module uses only earlier modules, P4); each used module's Public Purpose and named services. "(read R<n> whole)" marks a compressed requirement.

## Entries

- T53-336 · A6 (DEC-462) · one item per member for new keys (current.md:393; rows: plan-T53-draft.md, `planning/lines-A5-A6-signing.md`): R56 (one `signer-self-registered` item per member listing each new key) and R57 (each key's line by key words, `added` a local day in the group's zone); "not yet met: T53"; tests in R56, R57.
- T53-337 · N1257 · `place-profile-arrived` for any layer (current.md:394; rows: plan-T53-draft.md, `capabilities/N1257-requirements-modules.md`): R58 (an arriving layer of any level is one Status item; `layer-rule-changed` once per update to administrators) and R59 (key by layer id).
- T53-339 · CAPABILITIES · CAPABILITIES rows (current.md:396; rows: plan-T53-capabilities.md): "queue-producers R59 (arrival item keyed by layer) · N1257 layer-names": R59, amending R38.
- T53-338 · K5574, K5575 · hand-off: Queue item with the link; her file matched by address (current.md:395; rows: K5574, K5575). NEED: queue-producers.md holds no requirement line for this item (K5574: written once B4 is answered; K5575 answers it); get the owed line from BOB before coding. Binding now (K5575): the member who asked for the capture is told by a Queue item with the link; she opens it in her own browser, passes the check, saves the file and adds it in Civicsmith; for a request no member asked (a scheduled re-fetch) the item goes to the members following it; the words are UX-DESIGN's. K5574/K3656: a challenge page is never filed as the document; bot protection is never worked around. Producing side: `capture-requests` R61 (not this module's R61), below.
- T53-340 · K5571 · the same notices as reads it calls; owed lines (current.md:397; rows: K5571 (2)): ai-accounts' and ai-use's notices to owners are reads this module calls (the R13 pattern), lines owed here: R60 (`ai-accounts.creditsStopsOpen`), R61 (`ai-use.retestingOff`), both "not yet met: T53", owed lines "drafted by a worker for BOB"; two new `modules.json` edges (BOB's, to layers 2 and 6).
- T53-341 · K5565 · English in tests: its entry (current.md:398; rows: plan-T53-tests-english.md): convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (text only in the module's source) first gets its key in the module (a words row, UX-DESIGN's wording where shown to a member); a C site (in neither) is test input or a dead assertion, kept as input or removed with its reason; every test touched for other entries is converted too. Here: literal A/B files 0/0; regex A/B/C sites 1/3/1 (3 files; `tests-sweep/CENSUS.md`, `CENSUS-RX.md`); B sites need a source key first (`sonnet-5-5`). Done when the words baseline loses the module's files and its suite is green (R43).
- Carried (rows file, carried-T52-R1; DEC-452/453 items U497, `e5feed33be`, K5416): queue-producers' `member.unnamed` for a raw id, at START: a sentence naming a member who holds no handle (R53; R46's fallback to her id) (R43, R53).

## queue-producers (own requirements)

### Public

**feedItems({member, viewer, now, identity, homesOf, optionsOf}) → {items, facts}**, `queue`'s one read; writes nothing. An item is `queue`'s item without `disposition` and `catalogue_id` (`queue` mints and stamps from its R2).
- R8: answers every item R1, R2, R4-R7, R9, R14, R23, R30-R35, R37-R39, R41, R42, R46-R48 derive, plus `machinery-producers.conditionItems` and `action-producers.actionItems` (R15-R21, R29 moved there), passed the same `homesOf`/`optionsOf`; each item homed through `homesOf(subjectIds)` (`queue` R7) and carrying `options` from `optionsOf(subjectIds)` (`queue` R12). `facts`: `objective_gap` `{bound, truncated}`, `unattributed`, `contradiction` `{bound, truncated}`, the proposals feed's `dispositions` (one `proposalsFeed` read), `failed`, `absent`, `ms`, action-producers' `facts`. A contradiction-duty/-lead/-plurality item's `subject` is `{kind: "contradiction_candidate", id, state, inquiry?, between_projects, parties: [{project, opted_in}]}` (member's party projects only); a -duty-unseen/-plurality-unseen item's is `{kind: "contradiction_notice", id, parties: [{project, opted_in}]}`.

**Producers** (retired: R3, R15-R19, R20, R21, R22, R26, R27, R29; R9, R10, R14 stand)
- R1: each uncleared bias debt (`bias.uncleared`) inside the viewer's gate whose recipients include the member or name nobody, at most 200, keyed `OBLIGATION::bias-debt::<run>`.
- R2 (read R2 whole): FINDINGs. One per open proposal of `progressions.proposalsFeed`: `overdue_successor` when overdue else `missing_predecessor`, keyed `FINDING::<progression>::<stage>`, subject bundles the viewer may see (at most 8 named), `age` undetermined, `prior_disposition` from the feed; a stage with an open `cardinality_exceeded` instance (progressions R31) joins that stage's proposal item (`basis.kinds` gains `cardinality_exceeded`) else is an item of kind `cardinality_exceeded` with the same key, grade the weakest instance's (`connections.weakerGrade`). Also `out-of-inquiry-lead` (homed under the inquiry the evidence bears on, never the run's); `stance-changed-here-not-elsewhere`, `new-version-arrived-from-another-team`, `shared-inquiry-concluded-by-another-project` (`basis-versions.projectsDrawingOn`, `ai-runs.runFor`); `export-performed` (latest 200 of `corpus-export.exportLog`, to an administrator member or the `admin` credential only); `newer-capture-affects-reference` (per open `reevaluation.notices({holder, state: "open", viewer})` notice, `FINDING::newer-capture-affects-reference::<notice>`); `objective-gap` (per gap of `intent.gaps({project, viewer})`, each visible project the member participates in, all visible with no member, at most 50 projects in id order, bound returned as `objective_gap_projects_bound` beside `objective_gap_projects_truncated`); `source-modified`/`source-removed` (per document `monitoring.flagged` lists).
- R9: `out-of-inquiry-lead` offers, on the inquiry it bears on, the inquiry-grain act take it up. R10: a FINDING's `basis` names its source and derivation (D-82).
- R14: OBLIGATION `signer-self-registered` to an administrator member (`membership` R64) or the `admin` credential, per key `credentials.signerList` (its R8) answers `active` with `origin: "self"`, `OBLIGATION::signer-self-registered::<key>`, naming comment and member (`registered_by`), `age` from `added`, offering revoke (`credentials` R7, `signerSet` to `revoked`); not to the registrant; leaves when the key is no longer `active`. Grain amended by R56.
- R23: OBLIGATION `attribution-unchosen`, per (case edition, observation) of a prepared unsigned edition reaching an observation the member authored without a chosen credit level (`publication.caseDocumentFacts`, its R2, R17), `OBLIGATION::attribution-unchosen::<case>@<edition>::<observation>`, to that member only; offers `op=attribute`; leaves when chosen, unreached, signed or replaced; raised once.
- R30: OBLIGATION `docket-core-due`, per item of `docket.coreDue` (its R9), `OBLIGATION::docket-core-due::<case>::<kind>::<ref>`, to the case's manager (`membership` R65) only; offers `op=docketprepare` and, for a submission, `op=docketdecline`; `age` from `since`; raised once. R31: FINDINGs `edition-withdrawn`, `edition-contested`, per (dependent, entry) of `reevaluation.docketDependents` (its R30), `FINDING::<kind>::<dependent>::<case>#<seq>`, homed under the dependent's ancestors; leave when the cause closes.
- R4: per project joined, at most 50 in id order (all visible with no member), bound beside `contradiction_projects_truncated`: one item per candidate of `contradiction.candidatesFor({on: {project}})` (its R25), `<CLASS>::contradiction::<candidate>`, counted once across projects: `duty` → `contradiction-duty` (`open`, `taken_up`, `explained_not_shown`); `lead` → `contradiction-lead` (`open`); `plurality` → `contradiction-plurality` (`open`); homed under both sides' ancestors.
- R5: `side-corrected`, per (dependent, candidate) of `reevaluation.correctedDependents` (its R27), `FINDING::side-corrected::<dependent>::<candidate>`, homed under the dependent's ancestors. R6: `tension-after-publication`, per (case, candidate) of `case-tensions.caseTensions({project})` (its R4), per project the member owns (`membership` R65), at most 50, to those owners only, `FINDING::tension-after-publication::<case>::<candidate>`; leaves when a later edition discloses it or it resolves.
- R7 (read R7 whole): per project joined (R4's projects and bound), one item per notice of `contradiction.conflictNotices({project})` (its R50): weight `duty` → `contradiction-duty-unseen`, `plurality` → `contradiction-plurality-unseen`, `<CLASS>::contradiction-unseen::<candidate>`, counted once. Its only subject is the visible side (`queue` R7 homes from it alone). Detail: the fixed sentence, `asked_by_another`, her party projects with opt-in, once revealed the parties' names, the relay `responses` (only what the responder shared, never a handle or member id). No count, bound or `truncated` flag reveals the other side or the number of parties (R11). Leaves when the notice leaves R50.
- R32: FINDINGs `wizard-withdrawn`, `wizard-restored`, per entry of `wizard-scripts.brokenScripts` (its R13), `FINDING::wizard-<kind>::<script>@<version>::<at>`, to the script's project owners and its version's author only; names the script and, for a withdrawal, the first refusal; raised once. R33: OBLIGATION `wizard-approval-requested`, per (version, owner) of `wizard-scripts.submittedFor` (its R17), `OBLIGATION::wizard-approval-requested::<script>@<version>::<owner>`, to that owner only; `age` from the submission; leaves when approved, withdrawn or retired. R39: FINDING `wizard-base-updated`, per entry and recipient of `wizard-scripts.baseUpdates` (its R26), `FINDING::wizard-base-updated::<copy>::<base version>::<member>`, to that recipient only; offers `wizardRead` of both versions and `adopt: {base}`; raised once.
- R34: FINDINGs `cited-newer-edition`, `cited-edition-withdrawn`, per (dependent, move) of `reevaluation.citedCaseDependents` (its R33), `FINDING::<kind>::<dependent>::<import>#<seq>`, homed under the dependent's ancestors; detail names group, case, cited edition, edition named, quotes `what_changed`/`reason`, says when `key_listed` is false the signing key is not among the imported file's keys, and when the move was taken back; leaves when the cause closes.
- R35 (`case-import` R20; read R35 whole): items go to the member who set the watch (`set_by`), else (not an active member) the administrators (`membership` R86), nobody else; `age` from `seen_at`; subject `{kind: "import", id}`, no project home. FINDING `followed-case-entry` (per verified entry, `FINDING::followed-case-entry::<import>#<seq>`); FINDING `cited-docket-entry-refused` (per refused entry, same shape, names the failed check); CONDITION `cited-docket-unreadable` (per watch whose latest read is unreadable, `CONDITION::cited-docket-unreadable::<import>`, opens with `DOCKET_UNREADABLE`'s sentence; leaves when a read succeeds or the watch ends).
- R37 (read R37 whole): per edition of `publishSchedule.scheduledEditions` (its R4, as the plane), items to the member who set its time and the case's project owners only, homed under the case's project: CONDITION `edition-scheduled` (while `waiting`, `CONDITION::edition-scheduled::<case>@<edition>`, time in the group's zone never UTC, offers `op=publishatmove`, `op=publishatcancel`; a moved time changes words, mints no second item); FINDINGs `edition-published-as-scheduled` (once `published`) and `scheduled-edition-stopped` (once `stopped`, naming each `publish-schedule` R2 reason in its own translation), `FINDING::<kind>::<case>@<edition>`, raised once. A cancelled edition earns none.
- R38: `registerPlaceArrivals(read)` takes once at start `instance-setup`'s `placeArrivals` (its R62); a second call is refused `PLACE_ARRIVALS_REGISTERED`; none registered, no item. Per arrival one CONDITION `place-profile-arrived`, `CONDITION::place-profile-arrived::<profile>`, to every administrator member (`membership` R64, R86) only, no project home, a "status" (R24), naming the place, profile name and coverage, offering the way to choose it under Places; raised once; leaves when the arrival leaves. Amended by R58, R59.
- R40: `source-modified`/`source-removed` carry `title` (document's title or `null`) and name no bundle id, HTTP status or mechanism in `summary` or `detail`. Test: untitled has `title: null`, no `B-` id.
- R41/R44: per project where `participation` is `invited` (`project-roster.projectList`), at most 50 in id order, OBLIGATION `project-invitation`, `OBLIGATION::project-invitation::<project>::<member>`, to her only, no project home; offers `projectjoin` (`act.projectjoin.label.queue`); `queue.project-invitation.summary` (`{who}`, `{project}`), `.detail`. R44: read `project-roster.projectInvitations({viewer})` (its R35), following `next` while `truncated`, to 50; `{who}` the inviter's handle, a handle-less founder `member.founder.unnamed`'s word, never `admin`; no inviter, an unlisted invitation or a read that is `undetermined` or throws gives `queue.project-invitation.summary.unnamed` (`{project}`), item still raised; `age` from `invited_at` else her row's `created`; `basis.inviter` `{member, handle, founder}`.
- R42: per project owned, at most 50 in id order, OBLIGATION `project-request` per open request of `projectRequests({projectId})` (project-roster R14), `OBLIGATION::project-request::<project>::<requester>`, to each owner only; keys `queue.project-request.summary` (`{who}`, `{project}`), `.detail`; offers `projectrequestanswer` (`act.projectrequestanswer.label.queue`) with `answers: [{answer: "grant"|"decline", label}]`; carries `quote: {by, text}` (null when none); `age` from `asked`; leaves for all owners when one answers or she withdraws. R54: a participant's request to leave (`membership` R35 `leaving`) is an item for the owners as R42.
- R46 (`members` feed; read R46-R48 whole): per row of `member-roster.endorsementsOwed({by: member})` (its R77), at most 50, OBLIGATION `endorsement-owed`, `OBLIGATION::endorsement-owed::admin::<proposed member>::<member>`, to that administrator only, no project home; `queue.endorsement-owed.summary` (`{who}`, `{have}`, `{awaiting}`), `.detail`; offers `adminendorse` (`act.adminendorse.label.queue`), `door: "adminendorse"`; `age` from `proposed_at`; `fills.who` her handle; read through the one claimed `membership` instance so the founder (`admin`) counts. R47: per project owned, at most 50, each change of `project-roster.projectOwnerVotes({projectId, viewer})` (its R30) with the member in `awaiting`: `OBLIGATION::endorsement-owed::owner::<project>::<change>::<member>` (`<change>` is `add:<target>`/`remove:<target>`), to her only; `queue.endorsement-owed.owner.summary.add|.remove` (`{who}`, `{project}`, `{agreed}`, `{awaiting}`), `.owner.detail`; offer and `door` `projectowneradd`/`projectownerremove`. R48: per row of `member-roster.expertiseAwaitingConfirmation({by: member})` (its R78), at most 50, `OBLIGATION::expertise-confirmation-owed::<member declared>::<label>`, to each active administrator only; `queue.expertise-confirmation-owed.summary` (`{who}`, `{label}`), `.detail`; offer and `door` `expertiseconfirm`; `age` from `declared_at`. Until the word list holds these rows, `localize` under this module's ids.

**The words and the feed**
- R24: sentences call an OBLIGATION a "to do" and a CONDITION a "status", never "obligation", "condition" or "signal". R28: what a plan addresses is a "matter", never "subject". R25: no item here carries `due`. R53: the founder is named by her handle else `member.founder.unnamed`'s word, never `admin`; others by handle (R46's id fallback stands).
- R43 (read R43 whole; it holds the key list by producer): every `summary`/`detail` and joining sentence is read through `setup-words` `word(key, vars)`, never composed here; the item answers `summary_key`, `detail_key`. Placeholders get facts (names, titles, counts, codes, local days `date.daymonth`/`date.daymonthyear` via `civil-time`, set times `time.at` with `time.clock`, in the group's zone, R37); a fill that is another module's sentence is that module's keyed word. An optional fact is its own sentence key appended only when it exists; a branching count is `.one`/`.other`. A missing key, or a fill a source states in English or as a bare code with no key, fails its test and is named in the REPORT: the fill is left empty, the item still raised, never inline English. A holder is named by title, a case by scope, never by id. Test: each fixture's `summary`/`detail` equal `word(key, vars)`, keys asserted with `hasWord`, optional sentences absent without their fact, no unfilled `{placeholder}`, no English in a test.
- R45 (read R45 whole): `feedItems` reads its producers as separate feeds (ids: `bias-debts`, `proposals`, `shared-inquiries`, `leads`, `exports`, `references`, `objectives`, `sources`, `machinery`, `contradictions`, `signing-keys` (R14, R56), `action`, `attribution`, `docket`, `cited-cases`, `wizards`, `schedule`, `places`, `projects`, `members`). A feed whose read throws, or whose provider answers a refusal or `undetermined`, adds no item and is named in `facts.failed` `[{feed, reason}]` (`threw`, `refused`, `undetermined`; `partial` for a provider `machinery`/`action` names), never English; other feeds unchanged; `feedItems` never throws whole. Only `sources` has a word key (`queue.allclear.failed`); other ids go in the REPORT. A feed with no provider composed is in `facts.absent`.
- R49: each kind of fact is asked once per `feedItems`: joined and owned projects one statement each over `membership` `project_participants` (R120); rows, titles, owners, case projects, capture days for all items at once; shared-question candidates once for the three kinds; `homesOf`/`optionsOf` once per distinct subject set; reads keyed by one project, question or edition (`candidatesFor`, `conflictNotices`, `caseTensions`, `projectOwnerVotes`, `projectRequests`, `projectsDrawingOn`) once per distinct key (at most 50 projects, 64 questions); statements and calls do not grow with items or projects.
- R50: a `facts.failed` entry from a provider refusal or `undetermined` also carries `read` (`<module>.<read>`) and, when given, `code` (its `code` else `reason`); a throw inside a named read carries `read` alone. The four `contradictions` reads (`contradiction.candidatesFor`, `reevaluation.correctedDependents`, `case-tensions.caseTensions`, `contradiction.conflictNotices`) name themselves. `conflictNotices` refusing `NOT_A_PARTICIPANT`, `NO_SUCH_PROJECT` or `PROJECT_SEEN_NOT_A_PARTICIPANT` is no failure (R7); `undetermined: true` with an empty list answers empty. R51: `facts.ms` is `{<feed id>: whole ms}` per feed read (a thrown feed included, an absent one not). R52: items equal in class, kind, subject, summary, detail and basis are one (one `local-fact-due` per action; `newer-capture-affects-reference` one per (holder, target, newer version), `basis.notices` naming all).

**T53 (all "not yet met")**
- R56 (DEC-462; amends R14, R55): for each member holding at least one key that is active, self-registered and not yet known (R55), at most 50 members in id order, the founder included: one OBLIGATION `signer-self-registered`, `OBLIGATION::signer-self-registered::<member>`, to the recipients R14 states, nobody else, not her. `basis.keys`: each such key `{key_b64, comment, added}`, earliest first, at most 20; `basis.keys_more` the count beyond (0 when none, never absent); `age` from the earliest `added`. Per listed key two options in `queue` R12's shape, each carrying that key only: revoke (`signerset` to `revoked`) and "I know about this key" (`signerknown`); a key counted only in `keys_more` has no option until acts on listed ones let it in. A key leaves when revoked, not active or known; the item leaves when none remains; a later key of a member whose item exists joins it (same id); a key registered after all were known raises it again. Tests (read R56 whole): two keys registered by one member give one item for each of two administrators with both keys and four options; one "I know" removes that key from both; an administrator-registered key, a revoked key and the registrant's own feed raise nothing; 21 keys list 20, `keys_more` 1, no option for the 21st until one of the 20 is known.
- R57 (K5456; amends R43, R36): the summary states the member and how many new keys (one or other form); each key's line is a keyed sentence filled with the comment (own optional sentence, R43) and `added` as a local day in the group's zone, never UTC; no zone held: the day is undetermined and the line says so without a date (R36). No sentence composed here. The word is "added" or "registered", not "made". Test: added 23:30 local on the 4th reads the 4th; no zone, no date; no comment reads the base line. One `signerList` read serves all members (R49); the founder counts as `admin`; item key `::<key>` becomes `::<member>`, no migration.
- R58 (N1257, DEC-404; amends R38): `place-profile-arrived` is raised for a layer of any level, keyed by layer id (R59); a layer an update changed in a rule the team's active chain gives raises `layer-rule-changed` once per update to administrators, naming the rule keys changed, never the text of a team's entry. Test: an update adding a county raises one arrival per administrator; one changing nothing raises none.
- R59 (K5458; amends R38, R58): `CONDITION::place-profile-arrived::<profile>` becomes `...::<layer id>` for a new arrival; an item raised before keeps its key and leaves when its arrival leaves; the summary names the layer's place and, when two held layers carry the same place name, its level. Test: two like-named arrivals raise two items with their levels; an old item is not raised again.
- R60 (K5478; DEC-471, DEC-475; `ai-accounts` R75, R68; `queue` R1, R12; read R60 whole): one OBLIGATION `ai-credits-stop` per entry of `ai-accounts.creditsStopsOpen({viewer, at})` (its R75), keyed by the entry's own `key` as given (a later flagged call adds none), to the viewer the read answers only; names account, time and cause (keys `screen.aiproviders.stands.credits`, `.othergateway`, `.logunreadable`); `disposition` `available: false`, `instead` `aicreditsclear` (`queue` R12): not dismissable, not mutable (`KIND_NOT_PERSONAL`); leaves when the read stops answering. A throwing read adds none and names `ai-accounts` in `facts.failed` (R50).
- R61 (K5480; `ai-use` R28, R29; read R61 whole): one OBLIGATION `retesting-off` per entry of `ai-use.retestingOff({viewer, at})` (its R29), keyed by the entry's own `key` as given, to the administrators of the paying account only; names who turned it off and when via `queue.retesting-off.summary` (R43); `disposition` `available: false`, `instead` `airetestset` (`ai-use` R28): not dismissable, not raised twice while it exists; leaves when `on` is true again. A throwing read names `ai-use` in `facts.failed` (R50).

### Private

- R41-R44, R46-R49: Uses `project-roster`, `setup-words`, `civil-time`, `member-roster` (see their sections); `membership` `project_participants` (`project_id`, `member_id`, `state`, `owner`; its R120 read contract) is joined in this module's own SQL (R49).
- R8, R1-R7: also used: `membership` (`viewerPredicate`, `inSight`, `isAdministrator` R64, `activeAdmins` R86, `memberFacts` R68, `hiddenBundles` R88, `projectOwners` R65), `provenance` (`register`, `captured_locators`), `monitoring` (`monitoring()` R32, `escalationsSeen()` R35), `capture-requests` (`completed`, `leads`, `rendersHeld` R26); `action-producers` is edge 137 < 138 (BOB drops an edge no remaining code imports); until the T34 job deletes its copy also `host-governor.governorHolding`, `capture`, `link-sweep.sweepConditions`, `network-notices.noticesOf`.
- R60, R61: new T53 edges, BOB's, to earlier modules: `ai-accounts.creditsStopsOpen` (its R75), `ai-use.retestingOff` (its R29). R38: registered at start, not used: `instance-setup` `placeArrivals` (its R62); this module registers nothing with an earlier module and holds no check row.
- R36: every day this module derives or compares (an `age` in days, a window, a date shown) is the local day in the subject's zone via `civil-time` (`localDay`, `span`), never the UTC day; no zone held: day and `age` undetermined, stated, never computed on UTC. R11: no answer names a bundle the viewer may not see and no count reveals one. R12: a CONDITION earns an item only where a member's act can change it. R13: no place is named in this module's behaviour or outward text.
- R55 (`credentials` R83): R14 mints no `signer-self-registered` item for a key whose row carries `known_by`, so one administrator's "I know about this key" ends it for all. Test: minted, `signerknown` called, next feed holds none; control: a second self-registered key still mints one.
- R8, R2: factory `queueProducersOf(ctx, deps)`; exports `queueProducersOf`, `proposalFindingItems`, `CARDINALITY_EXCEEDED`; `queue` passes `member`, `viewer`, `identity`, `homesOf`, `optionsOf`. Tests `producers.test.mjs`, `proposals.test.mjs`. `escalationsSeen()` yields no item. Tests (R4, R7, R11): a duty reaching two projects is one item; a hidden side gives no item and no count.

## Uses: escalation

- Purpose (R8): the escalation protocol's stages; its `escalationsDue` read is `action-producers`' now.

## Uses: record-grammar

- Purpose (R1-R7). Used: `normalizeType`, `STATES`, `vocabFor`, `MACHINE_AUTHOR_PREFIX`, `MACHINE_CLASS_PREFIX`.

## Uses: record-core

- R34, R41-R43, R47, R53 (R2, R4): `bundleInfo(bundleId) → {id, type, title, project}` or null; `head(bundleId)` → `{bundleSha, rowVersion, type, title, currentState, priorState, groupId}` or null; `manifestEntry(bundleId, snapKey)` → `{kind, base, author, created, files, writer, operation}` or null; `livePaths(bundleId)` → paths or null; `stampInstant(precision, when?)` (`"second"`/`"millisecond"`, UTC); `manifestByAuthor({authorPrefix, after, limit}) → {bundles, cursor}`, each `{bundleId, latest, firstOther}`.

## Uses: membership

- R74 (R2, R4, R41): `participation(projectId, memberId) → {state, owner}` or null (`invited`, `joined`, `leaving`, others); never throws. R87 (R50): refusal `{ok: false, reason: "NOT_A_PARTICIPANT", code, check, translation, project, detail}`.

## Uses: provenance

- R4 (R2): `homeOf(captureSha) → {bundleId, path, encoding, bytes, registered, authored}` or null; the author of an authored row is never in it; never throws. R74: a part's digest is no register key, so `homeOf(partSha)` is null unless it is a whole's.

## Uses: connections

- Purpose (R2): derived connections, graded by the weaker end. Used: `weakerGrade`, `edgeSevered`.

## Uses: progressions

- R18 (R2, R8): `proposalsFeed(now) → {instances, proposals, dispositions, counts}`: `proposals[]` one per (progression, stage) with the weakest grade (null and `grade_determined: false` if any undetermined), `overdue`, `overdue_count`, `kinds`, `prior_disposition`; `dispositions[]` every decision; a finding governed by an applying decision leaves `proposals` and stays in `dispositions`. In-plane callers may pass their own instant (R43).

## Uses: bias

- R43 (R1): `uncleared({gate, limit})`: uncleared debts whose `gate` (`{sql, args}`) admits, newest first; each with `run`, `context_type`, `context_id`, `recipients` and the lens fields; `limit` 1-1,000, default 200, `truncated`; never throws.

## Uses: inquiry

- Purpose (R2): the one recursive object of case-making; no version, conclusion or strength. Used: basis-leg reads.

## Uses: basis-versions

- R37 (R2): `projectsDrawingOn(inquiryId, viewer) → projects`: in id order each project the viewer may see whose document holds an unsevered `cites` reference to the inquiry, each `{id, title, current}`, at most 32 with `bound` and `truncated`; empty id answers empty; never throws. Also `conclusionOf`, `conclusionRecordOf`.

## Uses: contradiction

- R25 (R4): `candidatesFor({on, label?, weight?, state?, after?, limit?, viewer})`: `on` exactly one of `{inquiry}`, `{content}`, `{entity}`, `{bundle}`, `{project}`, `{candidate}` (else `CANDIDATES_NO_SUBJECT`, C-60.2; `{project}` = candidates whose duty or lead reaches it); candidates not `not_shown` whose both sides the viewer may see; between projects also `opted_in`, `asked_by_another`, `revealed`, `parties`, `responses`; page at most 50.
- R50 (R7): `conflictNotices({project, after?, limit?, viewer})`: refusals in order: `membership`'s existence answer (its R77), `NO_SUCH_PROJECT` (its R78), not a joined participant via `notAParticipant` (R87). A notice: candidate id, `project`, weight, state, the one visible side, a fixed sentence, `opted_in`, `asked_by_another`, `revealed` (R52) then `parties`, `responses` (R54), `named`; always withheld: the other side, its project and members, key, label reason, number of parties; page at most 50.

## Uses: ai-runs

- Purpose (R2): the AI run, a bounded, attributed object over a question or project. Used: `runFor` (its R28).

## Uses: capture-requests

- R10 (R2, R43 `{statement}`): `captureRequestAttribution(row) → {ok: true, actor, machine_attributed: true, at_the_request_of: {run, inquiry}, principals: {plane, claude}, statement}` or `{ok: false, code: "CAPTURE_ATTRIBUTION_ONE_PRINCIPAL", plane, claude}`.
- Hand-off (capture-requests R61, entry T53-338; read it whole): a drain fetch refused `SITE_ASKS_FOR_PERSON` is held, `needs_person` true; `personWaits({viewer, limit})` → `[{request, address, host, asked_at, asker}]` oldest first (`asker` null for a scheduled re-fetch, then "`queue-producers` offers the item to the members following the address"); `fillAskedRequest({address, capture_sha, by, at})` (`capture`'s upload path, R86) completes the one matching row, recording she brought the file from that address.

## Uses: intent

- R6 (R2): `gaps({project, viewer}) → {ok, project, gaps}`: one gap per short instance (missing stage names progression, entity, stage; short grade names the link), each a proposal offered to `queue` as kind `objective-gap`; answers `limit`, `truncated`.

## Uses: reevaluation

- Purpose (R2, R5, R31, R34). Used: `notices` (R14), `correctedDependents` (R27), `docketDependents` (R30), `citedCaseDependents` (R33).

## Uses: publication

- Purpose (R23): the one irreversible act; holds every case document. Used: `caseDocumentFacts` (R2, R17).

## Uses: monitoring

- R47: `archiveEligible(now)` (moved producers): at most 50 addresses `{address, first_failure_since, reachability}` with `limit`, `truncated`, `paused`. R48 (R2): `flagged({viewer, limit})`: documents the viewer may see whose last tick flagged them, each `{bundleId, source_status, since}`, at most `limit` (1-200, default 200) in id order, unseen ones skipped and uncounted, `truncated`.

## Uses: credentials

- Purpose (R14, R55, R56): holds the signer keys the record accepts. Used: `signerList` (its R8), `signerSet` (its R7), `known_by` (its R83); read them whole for R56.

## Uses: corpus-export

- Purpose (R2). Used: `exportLog` (its R2), `EXPORT_LOG_LIMIT_DEFAULT`.

## Uses: docket

- Purpose (R30). Used: `coreDue` (its R9).

## Uses: wizard-scripts

- Purpose (R32, R33, R39). Used: `brokenScripts` (R13), `submittedFor` (R17), `baseUpdates`.

## Uses: case-import

- Purpose (R34, R35). Used: `watchItems` (its R20).

## Uses: civil-time

- Purpose (R36, R43, R57): the one civil-time engine; pure. Used: `localDay`, `dayRange`, `span`, `isCalendarDate`.

## Uses: machinery-producers

- Purpose (R8). Used: `conditionItems` (its R1).

## Uses: case-tensions

- Purpose (R6). Used: `caseTensions` (its R4).

## Uses: publish-schedule

- Purpose (R37). Used: `scheduledEditions` (its R4, as the plane), the stop reasons of its R2.

## Uses: action-producers

- Purpose (R8). Used: `actionItems` (its R13) and its `facts`.

## Uses: setup-words

- Purpose (R43): the word list as frozen data; pure. Used: `word(key, vars)`, `hasWord` (tests).

## Uses: project-roster

- Purpose (R41, R42, R44, R47). Used: `projectList` (R26, R34), `projectParticipants` (R1), `projectRequests` (R14), `projectInvitations` (R35), `projectOwnerVotes` (R30).

## Uses: member-roster

- Purpose (R46, R48, R53). Used: `membersOf(ctx)`, `endorsementsOwed` (R77), `expertiseAwaitingConfirmation` (R78), `viewerMember` (R73).

## Uses: content

- Purpose (R43): the unit the record points at; no service named for this module.

## Uses: test-support

- Purpose (R43, R49): test sandbox, lossless output, seeded generators.

## Uses: ai-accounts

- Purpose (R60): the AI accounts that pay for use. Used: `creditsStopsOpen` (its R75), act `aicreditsclear` (its R68). NEED: R75 and R68 are outside this reading set; the job reads them whole before coding R60.

## Uses: ai-use

- Purpose (R61): what each AI account has spent and may spend. Used: `retestingOff` (its R29), act `airetestset` (its R28). NEED: R28 and R29 are outside this reading set; the job reads them whole before coding R61.
