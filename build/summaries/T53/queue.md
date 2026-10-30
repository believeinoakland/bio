# Task summary · T53 · queue

Stands for: `build/plan/current.md` lines 407-413, `build/plan/T53-R1/queue.md`, `build/requirements/queue.md` (all), `build/layers.md` (head, layer 11: `queue` follows `queue-producers` and `notice-producers`; a module uses only earlier modules, P4), and the Public part of each used module (Purpose, plus the services the brief names). The sources stay binding; "read R<n> whole" marks a requirement compressed here. R97-R99 are kept nearly whole in Private because the entries touch them.

## Entries

- T53-345 (current.md:408; rows file line 6): K5480, K5478. `classOfKind` gains `retesting-off` and `ai-credits-stop`, both OBLIGATION, each with one sentence; source texts `draft-ai-use.md` R29, `draft-ai-accounts-dec465.md` R75, AI-DESIGN A50 (R1). Test: `catalogue.test.mjs` answers OBLIGATION for both; muting either by its published id is refused `KIND_NOT_PERSONAL`; control: an uncatalogued kind is still refused `NO_SUCH_KIND` (R1, R19, R31).
- T53-345 also (rows file line 11, DEC-475, screens-ai AI6): the Queue kinds `retesting-off` and the payer-flag stops (`ai-credits-stop`) are the same two kinds; nothing more here (R1, R31).
- T53-346 (current.md:409; rows file line 8): A6 (Q-A6-1, Q-A6-2 decided, K5456; wording a UX need). A per-key choice of act is passed through (queue), a line and two acts per key; "choose several" never handles it (screens-daily's side). That is R97, amending R12, R96, R28 (`queue-producers` R56).
- T53-347 (current.md:410; rows file lines 10 and 17): N1259 CAPABILITIES rows. The four register kinds are catalogued as FINDINGs, disposition `watched-changed`'s (UNVERIFIED, recommended); N1259-c R97 **numbered R98** here (A6 keeps R97) (R98, R57's pattern, R51). The plan's capabilities line 10 also names "register notices and kinds"; for this module that is R98 alone.
- T53-348 (current.md:411; rows file line 32): K4354, P15, P24 (`time-budgets-draft.md` §3; G80, G12a, G12c). Home reads kept counts, not whole lists; "which module keeps each count is settled at START from the read Home makes". Bar: P-22's Home 3,526 ms and Queue 3,456 ms on Seed A (503 documents). Test: Home's and Queue's in-room and net time within their class; Control: the counts equal the lists' lengths after each act that changes them. This module's count is the queue's (R99, amending R93, R94).
- T53-349 (current.md:412; rows file lines 12, 21-25): K5565, English in tests. This module: literal files A 0 / B 1; regex sites A 4 / B 40 / C 2 (13 files) (`tests-sweep/CENSUS.md`, `CENSUS-RX.md` rows). Convert each assertion to read the word key the product reads (and its placeholders' values), never a copied sentence; a B site first gets its key in the module (a words row, UX-DESIGN's wording where shown to a member); a C site is kept as input data or removed with its reason; every test touched for other entries is converted with it. Test: the words check's baseline loses the module's files and the suite is green. Words-bearing requirements: R48, R55, R58, R60 (`queue.kind.<kind>`, `queue.muted.*`, `queue.allclear.failed`, `queue.declared.<op>`), R38.

## queue (own requirements)

### Public

Purpose (§ Purpose): the member's one feed (QUEUE) of things that want this member, each typed by class and filed under every case it belongs to, with the acts that reach it; the personal half (mute, snooze) kept apart from the record acts (resolve, dispose) (§ Purpose, R30).

Terms (§ Provides): an item is `{id, class, kind, case, subject, summary, detail, basis, age, assignee, assignee_role, options, disposition}`, plus `catalogue_id`, `prior_disposition`, `options_grain`, `recipients` or `due` (`queue-producers` R25) where a producer carries them. A home set (`case`) is `{state, ungrouped, reasons, depth_bound, ancestors}`, each ancestor `{id, type, title, state, terminal, depth}`; depth bound 6. A case is an inquiry or a project. A member is the control plane's stamp of who asks (empty for a machine credential).

**The catalogue (pure)**
- **R1** `classOfKind(kind)` answers `OBLIGATION`, `FINDING` or `CONDITION` for every catalogued kind, each with one sentence, null for anything else (non-string or empty included). The kind lists are long and binding: read R1 whole before adding a kind. T53 text (the entry): `classOfKind` also answers `OBLIGATION` for `retesting-off` (an administrator of a paying account turned re-testing of the AIs off; one undismissable item while it is off, closed when it is turned on again) and `ai-credits-stop` (an AI account was stopped because a gateway call was not paid by the team's own key; assigned to whoever may clear it; undismissable, closed by clearing it or removing the account), each with its one sentence; the words members see are the design stream's. *(not yet met: T53)* Test: `catalogue.test.mjs` answers `OBLIGATION` for both; muting either by its published id is refused `KIND_NOT_PERSONAL`. Control: an uncatalogued kind is still refused `NO_SUCH_KIND`. R98 adds four FINDING kinds.
- **R2** `catalogueIdOf(kind)` answers `N-1` for export-performed, else null.
- **R3** `itemClassOf(id)` answers `FINDING` or `CONDITION` for an id `FINDING::<rest>` or `CONDITION::<rest>` (trimmed) with non-blank rest, else null.
- **R4** `suppressedBy(item, mutes)` answers the first ancestor whose kind set holds the item's kind, else null (no wildcard); `mutedAsItem(item, set)` true only for a CONDITION or FINDING in the set; `serializeMutedKinds` sorted, de-duplicated, comma-joined; `parseMutedKinds` inverts it.
- **R5** Condition kinds are `observation-log`'s vocabulary plus the sweep and notice kinds, re-exported as `QUEUE_CONDITION_KINDS` with action-clock-overdue, cited-docket-unreadable, edition-scheduled, place-profile-arrived, request-unsent. Read R5 whole before touching it.

**queueFeed({member, viewer, now, limit}) → feed or refusal (`op=queue`)**
- **R6** `limit` clamped to 1-500 (default 200). Order: OBLIGATION, FINDING, CONDITION, then id; sorted by R49, then cut. The answer carries `member`, `items`, `limit`, `item_count`, `truncated`, `classes`, `classes_deferred` (empty), `ancestor_depth_bound` (6), `mute`, `disposed`, decorated options, `vocabularies` (R17), and `queue-producers` R8's facts (`objective_gap_projects_bound`, contradiction projects' bound, with their `_truncated`).
- **R48** The answer publishes `class_labels` (`QUEUE_CLASS_LABELS`): OBLIGATION "To do", FINDING "Noticed", CONDITION "Status"; codes unchanged. No member-facing sentence calls a to-do an "obligation" or a status item a "condition" or "signal"; "obligation" names only a public body's duty.
- **R49** `queueFeed` takes `sort`: absent or blank (grouped by case, within a case to-dos, noticed, status, R6's order among equals), `added` (newest `age` first), `due` (soonest `due` first), `case`, `kind`; missing values and ties keep R6's order; applied before R6's cut; answer states `sort`; any other value is refused `QUEUE_SORT_UNKNOWN` naming the four, before anything is read. Read R49 whole when touched.
- **R7** Homes: ancestors are every inquiry and project reached upward from an item's subjects by basis legs and `cites` edges (a withdrawn edge is not a step); the walk stops at depth 6; an unseen ancestor is not named and adds `out_of_view`; a stop at the bound with more beyond adds `depth_bound`; either makes the set `undetermined`; `terminal` null when the machine does not name the state; `ungrouped` true exactly when the set is determined and empty.
- **R8** OBLIGATIONs: each open or forwarded task (`tasks` R6) on a viewable subject, assigned to the member or `unassigned`, with `assignee`, `assignee_role`, `age`; an unseen subject's task is withheld and not counted.
- **R51** The feed reads `notice-producers.noticeItems` (its R1) beside `queue-producers`, with the same `homesOf` and `optionsOf`, and treats its items as theirs (R1, R11, R7, muted, decided, sorted); a producer in its `facts.failed` contributes no item and the answer states it.
- **R11** The mint: before suppression every item's class must be one of three, its kind catalogued, its class its kind's; else the whole feed is refused `NO_CLASS` (C-31.1), `NO_SUCH_KIND` (C-31.2) or `KIND_MISCLASSED` (C-31.3).
- **R12** Every item carries `options` (acts `affordances.deriveActs` offers on its first 8 subject bundles, once each) and `disposition`. OBLIGATION: `available: false`, `instead` the door: a producer-declared `door` (op name or non-empty list, first led with) first, else the per-kind hand list, else `taskresolve` (`Queue.doorOf(kind, declared)`); the hand list is binding: read R12 whole before changing any door. CONDITION: `available: false`, `instead: queuemute`. FINDING with a progression stage: `available: true`, `scope: instance`, `key` `<progression>::<stage>`, `definition_version`, `requires: [definitionVersion]`; other FINDING `scope: project`, `key: null`, `finding`, `projects`, `requires: [project, finding]`, or with no project home `available: false`, `reason: no_project_scope`; newer-capture-affects-reference `available: true`, `scope: notice`, `acts: [versionadopt, versionkeep]`, `requires: [notice]`. A project-scoped disposition carries `keyed_on` and a `detail`. *(amended for `signer-self-registered` by R97, T53)*
- **R13** A project-scoped decision (R27) removes its finding for that project only: when every project home has decided the item leaves; otherwise it stays with deciding projects removed from its homes and `disposition.projects`, named in `case.disposed_by` (`{id, reason: "disposed_by_that_project", detail}`) and `disposition.disposed_by`.
- **R14** Mutes apply to every item, item mutes first: a suppressed item leaves `items` and is listed in `mute.suppressed` (id, class, kind, suppressing case or null, `scope`). `mute` is `{personal: true, cases, case_kinds, items, suppressed, suppressed_count, detail}`; with no member nothing is suppressed.
- **R15** `disposed` is `{personal: false, findings, count, recorded, bound: 64, truncated}`: instance-scope decisions then project-scope decisions that removed an item, at most 64.
- **R39** A bounded `resolved` block beside `disposed`: obligations resolved in a recent window on subjects the viewer may see, each with who resolved it and when. A task put aside by `taskresolve` before anyone decided it carries `resolved_undecided` in place of `resolved` and is read as the resolving event here and in R59, so `resolved_by` and `by` name the member who put it aside, never null for it.
- **R40** A snoozed case's `snoozed_until` is published in `mute`; its items are marked `snoozed` until then, not withheld.
- **R16** A FINDING never reads as an obligation: its `basis` names source and derivation; it leaves only by a recorded disposition.
- **R17** `op=queue` decorates every option through `affordances.decorate` with the control plane's gate, so an option equals the act `op=affordances` publishes for that subject; attaches no vocabularies; a store refusal is passed through with status 400.
- **R18** An out-of-inquiry-lead offers set-it-aside (R27) beside `queue-producers` R9's take-up; no item offers an act its op would refuse `NO_PROJECT_SCOPE`.
- **R46, R50, R52, R54, R57** Per-kind dispositions added to R12: read each whole when a disposition is touched. Fixed points: OBLIGATION kinds are never muted (R19, R31) and R28's bridge names the same door; `standing-answer` and `watched-changed` are told to one person (`available: false`, `scope: null`, `instead: queuemute`); `update-ready` is filed under `sections` (`QUEUE_SECTIONS`); uncatalogued kind refused `NO_SUCH_KIND`.
- **R53** `op=queue` is evaluated at the server's instant: a `now` in query or body is ignored; everything is judged at `queueOf`'s option `now` (function answering epoch ms; `Date.now` default), adopted at first call, another function refused by a throw (`capture` R90). Control: `now` a year ahead answers the same.
- **R55** `queueFeed` with `muted: true` answers `{ok: true, muted: [...], count}`: the asking member's mutes only, one row per kind muted in a case (`{kind, case: {id, title}, at}`) and one per muted item, newest first; `at` null for a mute made before it was recorded, never back-filled. Row act `queuemute` with `unmute`. Words `queue.muted.title`, `.help`, `.kind`, `.by` (null `at`: `queue.muted.by.undated`), `.unmute`; plain name `queue.kind.<kind>`.
- **R56** Every item's `subject` carries `title`: the bundle's title (`record-core` R34) when it names a viewable bundle, else `null`, never missing.
- **R58** The muted-list item row is `{item, class, kind, title, at}`: `kind` and `title` recorded with the mute (new `queue_item_mutes` columns, looked up once among her current feed's items); an older row reads the id's second segment as kind only where `classOfKind` names it a kind of the row's class, else `kind: null`; `title` null when not live then or no longer visible.
- **R59** `queueFeed` with `answered: true` answers `{ok: true, answered: [...], count, window_days, bound, truncated}`: rows `resolved` (R39's, with `by`, `by_you`), `forwarded`, `snoozed`, `set_aside` (R61) and R95's `join_answer`, newest first, within `QUEUE_RESOLVED_WINDOW_DAYS` and `QUEUE_RESOLVED_MAX`; others' acts appear only as `resolved` rows. Read R59 and R61 whole.
- **R60** The answer publishes `feeds` (`{feed, classes, answered, failed}` per feed: `tasks`, `bias-debts`, each `queue-producers` R45 feed id, `members` (OBLIGATION), `notice-producers`), `all_answered`, `classes_answered`, `all_clear` (true for a class only when its feeds all answered and the unsuppressed feed holds no item of it). A failure naming `read` or `code` carries both onto its row. Word `queue.allclear.failed` for `sources` only (job REPORTs ids with no key). R91: each row carries `ms` (null where none stated), the answer `feeds_ms`. Read R60 whole when touched.
- **R61** `queueFeed` with `aside: true` answers `{ok: true, aside: [...], count, next, truncated}`: every set-aside finding, both scopes, newest first, paged by `after`/`limit` (default 200, at most 500), not cut at R15's 64; project rows carry `definition_version: null`.
- **R93** `op=queue` with `count: true` answers `{ok, member, count}`: open items after mutes and decisions, before the limit's cut. Kept per viewer while nothing moves it (no `writeCount()` change, `record-core` R90, no write to this module's tables, one 5-second bucket `QUEUE_COUNT_BUCKET_MS`; never when no counter is stated, nor for a refusal; at most 256 viewers). **R94** one derivation serves list, muted list and count at one signature; `Server-Timing` `queue-count` (`desc=hit|miss`), `rows-queue`; a list after a write is never served from before it. R99 amends both.

**queueMute({member, case, kinds, item, unmute, viewer, at}) (`op=queuemute`)**
- **R19** Refusals in order: `NO_MEMBER`; `item` with a case or kinds `BAD_KIND`; without `item`: `NO_CASE`, `NO_SUCH_CASE` (absent and invisible alike), `NOT_A_CASE`, `NO_KINDS`; per kind or item: comma `BAD_KIND`, unclassifiable `UNKNOWN_KIND`, an OBLIGATION `KIND_NOT_PERSONAL` (C-33.27). An item id is classed by R3, else OBLIGATION when a viewable task has it (`taskExists`).
- **R20** Item form records or removes one (member, item) mute, answers `form: item`, `item_class`, `muted_items`, `added`, `removed`, `at`. Case form adds to (never replaces) or removes kinds, keeps the snooze, answers `muted_kinds`, `added`, `removed`, `at`. Both answer `wrote` naming only `queue_item_mutes` or `queue_state`.

**queueSnooze({member, case, until, clear, viewer, at}) (`op=queuesnooze`)**
- **R21** `NO_MEMBER`, R19's case refusals; unless `clear`: `NO_UNTIL`, `BAD_UNTIL`, `UNTIL_IN_PAST` (an instant before now, or a date before today's local day, `civil-time.localDay`, never UTC). A date snoozes to the start of that local day (`dayRange`). Mutes kept.
- **R22** A `scheduler` consumer is due when a snooze has expired, wakes at the earliest future one, writes nothing; every day derived is the local day via `civil-time`.
- **R26** Muting an OBLIGATION item by its published id (`OBLIGATION::bias-debt::<run>`) is refused `KIND_NOT_PERSONAL`, not `UNKNOWN_KIND`.

**proposeDispose (`op=proposedispose`)**
- **R27** With `items`, each is decided on its own through `record-core.perItem` (R50-R52) with `PER_ITEM_ACTS`' identity groups, decider, viewer and identity forced. A call naming `project` or `finding` takes the project arm; any other goes to `progressions.disposeProposal` after R28's bridge. Project arm refusals in order: `NO_FINDING`, `NO_PROJECT_SCOPE`, `NOT_A_DISPOSITION`, `NO_REASON`, `BAD_REASON`, `NO_DECIDER`, `NO_SUCH_PROJECT`, `PROJECT_ACT_NOT_A_PARTICIPANT` (membership R55). Success keeps one decision per (project, finding), replaced on re-decision; answers `scope: project`, `key` `<project>::<finding>`; no bundle written. A question's set-aside is always this arm.
- **R28** The bridge: a `key` whose class (R3, else `OBLIGATION::<kind>` as R26, else contradiction ids as `contradiction-duty` / `-unseen`, else first segment via R1) is CONDITION or OBLIGATION is refused `CLASS_NOT_DISPOSED` (C-33.44) with `class`, `kind`, `instead` (`queuemute` for CONDITION; R12's door for OBLIGATION, from the caller's own live item with that id and kind, else the hand list); a FINDING key `NO_PROJECT_SCOPE` with `finding`, `kind`, `requires: [project, finding]`. Nothing written. *(`signer-self-registered`: `signerset`, `signerknown`, R97)*
- **R29** Both `NO_PROJECT_SCOPE` refusals carry a catalogued check id and a translation.
- **R42** At start registers with `record-core` (R63) the figures of three tables: `findingDispositions` (by `project_id`), `queueState` (by `case_id`), `queueItemMutes` (not keyed to a bundle). The `tasks` figure is `tasks`' (R5).
- **R92** The module exports `DECLARED_OPS` for `proposedispose` (requires a project or key or `items`, a finding or key or `items`, a disposition word and a reason; `reasoned`), `queuemute` (item or case; `caller-owned`) and `queuesnooze` (case and `until` or `clear`; `caller-owned`); descriptions read by key `queue.declared.<op>`; agree with `op-declarations` and `op-grades`. Read R92 for the accepts lists.
- Retired R9, R10, R23-R25, R41, R43-R45, R47 (to `queue-producers`/`tasks`). A58 (choose several) is met by R27, R21, R40, R12; nothing written.

### Private

#### Uses (§ Uses)
- `legacy-checks` (C-31, C-32.10, C-32.11, C-33.27, C-33.44, C-76 until they move, R35; `STATES`, `vocabFor`, `normalizeType`, `isMachineIdentity`, `isMachineStamp`); `notice-producers` `noticeItems` (R51); `civil-time` `localDay`, `dayRange`, `isCalendarDate` (R21, R22); `record-core` as in Uses: record-core (R42, not declared); `membership` `viewerPredicate`, `inSight`, `positionalMember`, `isAdministrator`, `activeAdmins`, `projectAuthority`, existence answer, `memberFacts`, `projectOwners`; `connections`, `inquiry`, `progressions`, `bias`, `observation-log` as below; `tasks`, `queue-producers`, `affordances`, `scheduler` as below (R42).

#### Invariants
- **R30** Muting is personal and dismissing is a record act, never one control: a mute writes only this member's rows and moves no other member's feed; a disposition or resolution never writes a mute.
- **R31** No OBLIGATION kind or item is ever held in `queue_state.muted_kinds` or `queue_item_mutes`, and none is suppressed by R14 even if a row held one.
- **R32** One state, N homes: an event resolved or disposed once leaves every home it had; no item is duplicated per case.
- **R33** No answer names a bundle the viewer may not see, and no count reveals one.
- **R34** Options come from the producer and the catalogue, never from a surface; a CONDITION earns an item only where a member's act can change it.
- **R35** Checks that move here as invariants with tests: C-31.1-C-31.3, C-33.27, C-33.44.
- **R36** `queue_state` is declared to purge keyed by `case_id`; `queue_item_mutes` and `finding_dispositions` to the whole-store purge.
- **R37** `member` and `viewer` are taken only from the control plane's stamps, never from a body.
- **R38** No place is named in this module's behaviour or outward text.
- **R96** `signer-self-registered`: `available: true`, `acts: [signerknown]` (`credentials` R83), door `signerset`; superseded in part by R97 (per key, T53).
- **R97** (T53; DEC-462; amends R12, R96, R28; `queue-producers` R56) A signing-key item passes a choice of act through for each key it lists. For a `signer-self-registered` item the `disposition` is `available: true`, `scope: "key"`, `requires: ["key"]` (the key field as `credentials` R7 and R83 name it), and `keys`: one entry `{key_b64, acts: ["signerknown"], instead: "signerset"}` for each key in the item's `basis.keys`, in the same order, no entry for a key `basis.keys_more` only counts. Its `options` hold, for each listed key, two entries: the revoke (`signerset`, to `revoked`) and "I know about this key" (`signerknown`), each carrying that key and no other, each decorated through `affordances.decorate` (R17), so each equals the act `op=affordances` publishes for that key and viewer. These per-key entries are the producer's (R34) and are not cut by R12's 8 subject bundles; at most twice the keys listed. A viewer to whom the plane would refuse an act is offered no entry for it (R17's gate), whichever key. The top-level `acts: [signerknown]` of R96 is kept as the name of the answer that ends a key. The bridge (R28) refuses a `signer-self-registered` key with `CLASS_NOT_DISPOSED` and `instead: [signerset, signerknown]`, the first the one the screen leads with (R12's `door` list rule). After an act on one key the next feed lists the item with that key's entries gone and the others unchanged; after the last key's act it lists no item. *(not yet met: T53)* Test: a member with three listed keys: `disposition.keys` has three entries in `basis.keys` order, `options` six entries, each pair carrying its own key; `signerknown` for the second key, then the next feed has two entries each and the first and third unchanged; the last two acts clear the item. Control: no entry carries a key not in `basis.keys`; a viewer without the act is offered no entry for it; muting the item by its id is refused `KIND_NOT_PERSONAL`; `proposedispose` on its key is refused `CLASS_NOT_DISPOSED` with `instead` the list; 21 keys registered list 20 entries and none for the 21st (`basis.keys_more` states it, `queue-producers` R56); a set act (R27 with `items`) never resolves it.
- **R98** (T53; N1259; K4403 (7); `notice-producers` R30, R31; R57's pattern; amends R1, R12, R55) The four register kinds are catalogued so the feed lists, homes and mutes them as other FINDING items. `classOfKind` answers `FINDING` for `register-changed-noticed`, `register-import-done`, `register-import-stopped`, `register-import-failed`, each with its one sentence in the kind catalogue as `watched-changed`'s (R57); the feed reads them through `noticeItems` (R51) and homes them under the project (or the registers screen), drawing `summary_key` and `detail_key`. Disposition (R12): as R57 gives `watched-changed`, `available: false`, `scope: null`, `instead: queuemute` (UNVERIFIED: R12's default FINDING disposition is project-scoped, `requires: [project, finding]`; which of the two is wanted for a change told to several owners is BOB's); each kind's plain name for the muted list is `queue.kind.<kind>` (R55). An uncatalogued kind is refused `NO_SUCH_KIND`, so without these entries the feed lists none of the four. If the item contract lacks anything else these items need, the job REPORTs and BOB opens `queue` by CHANGE. *(not yet met: T53)* Test: the four kinds classed and minted (R11), appear in a member's feed with the standard options, are disposed once and leave; a muted kind is not shown and is listed in the muted list by its plain name. Control: an uncatalogued kind still refused `NO_SUCH_KIND`; other items unchanged.
- **R99** (T53; K4354, P15, P24; `platform/time-budgets-draft.md` §3; G80, G12a, G12c) Home reads a kept count, not the whole list. Which module keeps each count Home reads is settled at the job's START from the read Home makes. The viewer's count of open items (R93) is read from a count the queue keeps and is not made by deriving the feeds and the list; it still equals the length of the same viewer's uncut list after each act that changes it (R93, R94's meaning unchanged). *(not yet met: T53)* Test: `op=queue` with `count: true` and the Queue screen's list, timed on PLATFORM's Seed A (503 documents), each within its budget class at p50 (bar: P-22's Home 3,526 ms and Queue 3,456 ms); after each act that changes the feed (a task resolved, an item disposed, a mute added) the count equals the list's length. Control: the counts equal the lists' lengths after each such act.
- Suggestions kept (§ Suggestions): `queueOf(ctx)` factory, `queuestate.mjs` pure; `queue-renotify` registered with `scheduler` (R22); T48 START re-tests whether `op=queue` answers what Home draws (R12). Tests to keep: R7 over a chain of seven with one invisible ancestor; R11 with a producer stubbed to mint each fault; R13 with two project homes (R46).

## Uses: duties
- Purpose: the one obligation object (a duty `DUT-` adopted by a member's act, occurrences derived on read); "overdue" raises a question, never a violation. Queue's use is through `notice-producers` R5's `temporal-expectation-due` (R1, R50).

## Uses: answers
- Purpose: the plane's half of the assistant and members' standing questions; queue's `standing-answer` FINDING is told to its author alone (R1, R50).

## Uses: provenance
- Purpose: the trust root (register of captured bytes, acquisition receipts, capture grade, a member's firsthand observation); a hop attests bytes, address and time, never credibility. Queue's direct edge was dropped (K563); its condition kinds come via `observation-log` (R5).

## Uses: money-checks
- Purpose: checks over money facts that raise questions, never verdicts; detector results reach the queue only as "Noticed", the machine's. Queue catalogues `money-detector-noticed` FINDING, project-scoped with `acts: [hypothesishold]` (R1, R50).

## Uses: people
- Purpose: the people the record is about; the machine's interest checks live in the hypothesis layer and are shown after a measured false-alarm rate. Queue catalogues `interest-check-noticed` FINDING like the money detector (R1, R50).

## Uses: docket
- Purpose: a published case's docket of dated entries on three shelves; the manager places entries in public. Queue catalogues `docket-core-due` OBLIGATION (`instead: [docketprepare, docketdecline]`, never muted) and `edition-withdrawn`, `edition-contested` FINDINGs (R1, R50).

## Uses: monitoring
- Purpose: the daemon's watch over monitored documents, archive fallback and the actions' clocks; `escalationsSeen()` (monitoring R35) mints no queue item (Suggestions; R5, R1).

## Uses: record-grammar
- Purpose: the shared grammar below every module (id and type vocabulary, front-matter parser, canonical JSON, actor identity, grade vocabulary); no store, network or clock. Queue's item ids (`FINDING::`, `CONDITION::`, `OBLIGATION::` forms) follow R3, R26 (R3, R26).

## Uses: record-core
- Purpose: owns storage, id allocation, leases, append-only history and manifest, purge; every module writes through it (R42).
- `mintOpaqueId(prefix, year, tail, taken)` returns `<prefix>-<year>-DDDD<tail>`, null only after 64 collisions; every id is recorded in the caller's transaction and never redrawn, purge included (record-core R6-R9).
- `mintExhausted(prefix, extra?)` answers `{ok: false, reason: "MINT_EXHAUSTED", code, check, translation, prefix, detail}`, one fixed `detail` per prefix; writes nothing, never throws (record-core R62; queue R23 via `tasks`).
- `registerCounts(module, keys, counts)` once at start; `counts(hid)` synchronous; a held key is `COUNTS_DECLARED`, malformed `COUNTS_MALFORMED`; an unreadable figure is null, never zero (record-core R63; queue R42).
- `declarePurge(module, tables, {exempt?})`: tables `purge: clear` unless exempt; a table declared twice `TABLE_DECLARED` (record-core R21, R80; queue R36). `seedMintLedger(sources)` seeds the ledger from `[[prefix, table, column], …]` before the first mint (record-core R40).
- `stampInstant(precision, when?)`: `"second"` or `"millisecond"` UTC ISO 8601, any other precision throws; `instantOrder` compares as instants (record-core R47, R48). `manifestByAuthor({authorPrefix, after, limit})` answers `{bundles, cursor}`, each `{bundleId, latest, firstOther}` (record-core R53; queue R10, retired). `perItem`/`PER_ITEM_MAX` 100 back R27 (record-core R49-R52); `writeCount()` is R90 (queue R93).

## Uses: membership
- Purpose: who members are and what each may do, projects at their setup, and the fence (the viewer gate, existence answer, positional member, ownership). Queue compiles its SQL gate from `viewerPredicate` and uses `membership` R55 for `PROJECT_ACT_NOT_A_PARTICIPANT` (R27, R7, R33).

## Uses: connections
- Purpose: derived connections between documents and the `cites` edges between bundles. Queue walks `cites` edges into a node and `edgeSevered` for homes (R7).

## Uses: progressions
- Purpose: a group's declared flow with stages; derived questions are aggregated one per (progression, stage), a member's decision ages a question without hiding it. Queue uses `proposalsFeed` (its R18, `dispositions[]`), instance rows and `disposeProposal` (R12, R15, R27, R61).

## Uses: bias
- Purpose: declared bias, adoptions and the effective lens. Queue uses uncleared debts, recipients and `settled` (bias R44) for bias-debt OBLIGATIONs and R39's settled debts (R8, R39).

## Uses: observation-log
- Purpose: the append-only log of looking, at four levels, and the member's lead. Queue re-exports its condition-kind vocabulary as `QUEUE_CONDITION_KINDS` (R5, R18).

## Uses: inquiry
- Purpose: the inquiry's lifecycle, basis legs, ground partition, supersession and division. Queue uses `restingOn` and basis-leg reads for homes, and `inquiry` R20-R21, R39, R56 for set-aside and `waitlook` (R7, R27, R50).

## Uses: actions
- Purpose: the Action object (kind, tier, counterparty, clock, lifecycle). Queue's action-clock and reminder kinds are `action-producers`' since T45; queue keeps their classes and doors (R1, R12).

## Uses: scheduler
- Purpose: the registry of consumers on one reconciling alarm; the work is each consumer's owner's. Queue registers `queue-renotify`, due when a snooze has expired, waking at the earliest future one, writing nothing (R22, R42).

## Uses: affordances
- Purpose: the plane-sourced act pre-flight; publishes what the acting modules enforce, computes no refusal of its own (R12, R17).
- `deriveActs(facts) → act[]` (pure, never throws on well-formed facts): acts by affordances R8-R10; a null fact never narrows an act; queue offers them on an item's first 8 subject bundles (R12).
- `decorate(act, gate) → decorated act` (pure): `needs`, `mode`, `rung`, `rung_absence`, `weight`, `prompt`, keys always present; a queue option and an `op=affordances` act for one subject are the same shape (affordances R11; queue R17, R97).
- `affordanceFacts({target, viewer, identity, author, by})`: `NO_TARGET`, `NO_SUCH_BUNDLE` (absent and unseen alike), else counts-never-ids facts (affordances R13-R16; queue R12).

## Uses: tasks
- Purpose: the obligation inbox (tasks routed from captures of undetermined authority, listed to members who may see their subjects, forwarded or resolved by the assignee, anyone when unassigned, or an administrator). Queue reads `recentTasks`, `resolvedTasks`, `taskExists`, `forwarded` history (R8, R19, R39, R59).

## Uses: queue-producers
- Purpose: the feed's producers, each deriving on read and writing nothing the items one provider's facts earn, for `queue` to home, offer, mint and publish. Queue calls `feedItems` (its R8) with `homesOf` and `optionsOf`, publishes its `facts`, `facts.failed`, `facts.absent` (its R45), `facts.ms`; R56 supplies the per-key signer fields R97 reads (R6, R12, R60, R97).

## Uses: credentials
- Purpose: the credentials a person or the instance acts by (passwords, sessions, signer keys, AI credentials). Queue's R97 names the key field of `credentials` R7 and the answer `signerknown` of its R83 (R96, R97).

## Uses: test-support
- Purpose: temporary-file sandbox, standard output that keeps a test's tally, shared fixtures; queue's tests use its helper to call ops as the plane's route map does (R92).

## Uses: civil-time
- Purpose: the one engine for civil time (local days, `isCalendarDate`, `dayRange`, `localDay`), pure, "now" always its caller's. Queue uses it for every day it derives (R21, R22).

## Uses: notice-producers
- Purpose: the feed's newer producers (machine-noticed people and money, standing answers, duties come due, inquiry waits) deriving on read, naming subjects and homes for `queue` to mint. Queue reads `noticeItems` (its R1) and treats its items as its own producers' (R51, R98, R60).

## Uses: investigation
- Purpose: a project's own working material (milestones, status reports, intake interview, planning proposals, quiet-project prompt). Queue catalogues `milestone-overdue`, `milestone-reminder`, `project-quiet` (investigation R3, R18) (R1, R52).

## Uses: setup-words
- Purpose: the interface's word list as frozen data; pure. Queue's keys (`queue.kind.<kind>`, `queue.muted.*`, `queue.allclear.failed`) are read by key and never inlined as English (R55, R60).

## Uses: project-roster
- Purpose: the acts on a project's working group after its setup (roster, owners' votes, rescue, visibility, requests to join). Queue's R95 `join_answer` reads its `closed_by`; `project-leave` and `project-request` doors are its ops (R59, R57).
