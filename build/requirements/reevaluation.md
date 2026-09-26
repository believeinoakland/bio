# reevaluation — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 7. Code today (measured on `tranche/T3` @ `f324df9b0f`; `build/extraction/reevaluation.md` has the table): `bio-plane/src/store.mjs` 4792–4803 (`#reevalRaisedBy`), 31193–31557 (the REC-17 header, `reevaluations`, `#reevalLegsEarned`, `#reevalMoved`, `#frontmatterOf`, `#basisFrontmatter`), 36670–36768 (`changedFromAudit` and its bounds), 36770–36824 (the D-394 header, `VERSION_NOTICE_LEGS_MAX`), 37182–37254 (`versionNotice`), the `reevaluation` answer fields of four acts (4782–4789 dispose, 7894–7897 reopen, 8980–8986 a new edition, 12714–12721 divide), and the dispatch entries `changedfromaudit`, `reevaluations`, `versionnotice`. `bio-plane/checks/bio-checks.mjs` 1226–1274 (C-10.1: `REEVAL_SOURCES`, `checkReevalPending`, called at 1223) and 14039–14070 (the C-80 header, C-80.1, C-80.2). `schema.mjs`: no table. `from`: `legacy-store` as declared; the map proposes `legacy-store` and `legacy-checks`. Not yet met: R8, R9 (the registration layer 9 needs), R14 (REC-222), R15 (REC-223), R16 (K102), R17 (K102).

**Size (P6).** About 700 lines move (about 330 without comment-only and blank lines): `store.mjs` 622, `bio-checks.mjs` 81. REC-222 and REC-223 add a notice table and two acts. Well under 4,000.

## Public

### Purpose

When something a finding rests on changes, this module says which findings are affected and how, and changes nothing itself (Content Framework §18.1; State Rules §5.4). It derives the re-evaluation obligation on read from the record's own facts about each target (superseded, set down, reopened, dismissed, published at a later edition), tells a member when a newer version of a document affects a passage they reference, lets that member adopt the newer version or keep the earlier one, audits the "changed from" sentences already written against the version chain, and tells later modules when a finding's basis changed.

### Provides

Terms. A **dependent** is a bundle with a basis leg naming the target (`inquiry_basis`). A **cause** is `{source, since, detail, …}`, `source` one of `supersession`, `edition`, `deferred`, `reopened`, `dismissed`. An **obligation** is `{bundle_id, title, object_type, current_state, target, target_state, legs, reeval, causes, stored, strength, superseded_by?}`.

**reevaluations({target, viewer})** (`op=reevaluations`; admin, member, probe)
- **R1** A target that is absent or that the viewer may not see is refused `NO_SUCH_BUNDLE`. With no target, every id any basis leg names is asked. It writes nothing.
- **R2** Causes are facts about the target's own row: `supersession` when something supersedes it (`since` the latest superseder's `last_updated`; a superseding id the viewer may not see is null in `superseded_by`, and the cause stands); `deferred` or `dismissed` from its state; `reopened` when it is `open` with a prior state that is a disposition or `concluded`; `edition`, per leg, when the target's latest edition (the greater of the latest ratified and the document's authored edition, only above 1) exceeds the edition the leg names or the leg names none, carrying `cited_edition`, `latest_edition` and `latest_ratified_edition`. A dependent with no cause is not listed.
- **R3** A dependent the viewer may not see is withheld whole, with no count of what was withheld. A withdrawn leg is listed with `status: severed` and a sentence saying it supports nothing and is listed because the connection still informs a second look (DEC-70); every other leg is `confirmed` (`connections.edgeSevered`).
- **R4** Each obligation carries `reeval: {flag: true, since, source}` from its first cause; `stored`, the dependent's own authored `reeval_pending` triple (null where unstated), beside it and never merged; and `strength`, the dependent's pair per axis with its depth bound (`strength.strengthOf`), unaltered.
- **R5** Each leg is `{ord, role, grade, grade_axis, grade_source, target_edition, status, grade_authored, grade_why}`: a capture-axis letter on a leg whose target is not an inquiry is bounded by what the target earns (`inquiry.legCapped`), `grade_authored` the letter as written and `grade_why` null when not bounded. Both fields are always present.
- **R6** Obligations are ordered by dependent id, then target; the answer carries `count`.

**raise({target, source, since, edition?, viewer}) → `{source, since, edition?, raised}`**, called by the acts that move a target: dispose and divide through `inquiry`'s `onRaised` (its R21, R25), reopen through the registration `promotion` offers, a new edition by `publication` directly.
- **R7** `raised` is the live legs resting on the target (`inquiry.restsOnLive`), each `{bundle_id, ord, role, state}`, with every dependent the viewer may not see withheld and not counted, and no titles. The act puts the answer in its own reply as `reevaluation`.

**onBasisChanged(listener)** (a registration later modules fill once at start; K31's pattern) **and changesOf({findings?, contents?, viewer}) → `{findings, contents}`**
- **R8** Each registered listener is called once for every R7 raise and every R14 notice raised, with `{kind, subject, source, since, detail, dependents, affects?}`: `kind: finding` names the moved finding and R7's dependents; `kind: passage` names the content id, both captures and R14's grade and `affects`. It is called after the act commits: a listener that throws never undoes or refuses the act, and the act's reply names it under `reevaluation.listeners_failed`. *(not yet met: no hook exists; asked for by conformance R10 and consequences R8)*
- **R9** `changesOf` answers, now, the causes standing on each named finding (R2's arms, the finding as target) and each named passage's `affects` (`content.passageNotice`), so a module that missed an event, or records something after it, can ask. Ids the viewer may not see answer as absent. It writes nothing. *(not yet met: new service, for the same two modules)*

**versionNotice({target | content, limit, viewer})** (`op=versionnotice`; admin, member, probe)
- **R10** Refusals: both subjects or neither is `VERSION_NOTICE_NO_SUBJECT` (C-80.1); a `target` that is not an inquiry the viewer may see is `VERSION_NOTICE_NO_INQUIRY` (C-80.2), absent and invisible alike; a `content` id is answered by `content.passageNotice`, its refusal included (C-80.3).
- **R11** For a question, its legs in order, `limit` clamped to 1–200 (default 200) and `truncated`; a leg resting on a passage carries `content.passageNotice`'s answer with its `ord` and `target`; any other leg is `state: not_asked`, `newer` and `affects` null, with why. The answer carries `notices`, `count`, the applied `limit` (1 for a passage), `truncated`, the `states` and `grades` vocabularies, `wrote: false`, `proposal_only: true`, the sentence that the chains are those visible to the viewer, and the sentence that nothing was moved. No table changes across the read.

**changedFromAudit({limit, offset})** (`op=changedfromaudit`; admin, probe)
- **R12** Every live `bundle.md` holding the literal the old writer emitted gets one verdict: `undetermined` with `several_named` or `no_named_id` when it names other than one id; with `several_versions_held` when the bundle holds several (address, capture) pairs and the frontmatter's `content_hash` picks none; with `no_version_held` when it holds none or the chain refuses; with `no_prior_version` when its capture is the oldest in the chain (`provenance.versionChain`); else `right` or `wrong` by whether the chain's predecessor is the named bundle, with `sole_prior` and the predecessor.
- **R13** The three totals count every affected bundle; the listing is clamped to 200 by default and 1,000 at most, with `offset` and `truncated`. It writes nothing and every body stays byte-identical; the answer says undetermined is never evidence the sentence was right.

**The pushed notice and the member's choice** (Bob's 2026-09-25 00:40Z doctrine, rules 2 and 3)
- **R14** For each reference a member holds (a basis leg, a cite onto a case or question, a claim) pinned to a capture, a newer capture graded affected or undetermined (`content.passageNotice`) raises one notice per (holder, reference, newer capture), never for A or B; a yet newer capture raises a new one. It is a queue item with its own kind, mutable by each member. A published case's owners are told once per affected or undetermined cited part, and nobody else is. A capture whose version chain could not be read (`chain_unread`) raises no pushed notice: a pushed notice needs a newer capture to exist, and the pull read (R11) keeps answering it as undetermined by name. *(not yet met: REC-222; REC-209 is superseded by it; the `chain_unread` rule is K102)*
- **R15** `adoptVersion({notice, author})` writes a new version of the reference pinned to the newer capture (for a basis leg, a new basis version through `basis-versions`), the old staying readable; `keepVersion({notice, why?, author})` records "stays on the earlier version" with who, when, the optional why and both captures. Either closes the notice, and a later read does not raise it again for the same capture. A machine is refused both (`MACHINE_CANNOT_ADOPT_VERSION`, `MACHINE_CANNOT_KEEP_VERSION`). *(not yet met: REC-223)*

**Closing and extending the obligation**
- **R16** `recordReevaluation({dependent, target, source, since, note, author})` records a member's re-evaluation, closing that cause for that dependent until the target moves again (a later `since`); the obligation read lists closed causes apart, with who and when. §5.4's cascade events (a deletion, an Information `source_status` change, a work product retracted or re-distributed, an annotation addressed with a substantive change) are causes like R2's. A machine is refused. *(not yet met: K102)*
- **R17** A dependent at a published edition carries the cause `weakened` when its derived pair now reads weaker on an axis than that edition's frozen pair, naming both per axis; neither pair is altered. *(not yet met: layers.md layer 7's "a weaker derivation, a changed grade"; K102)*

## Private

### Uses

- `legacy-checks`: the C-10.1, C-80.1 and C-80.2 rows until they move (R23), `normalizeType`, `ISO_TS_RE`, `parseFrontmatter`.
- `record-core`: `recordOf(ctx)`, the `bundles` and `files` read contract, `transact` (R14–R16).
- `membership`: `bundleRedactor`, `viewerPredicate`. *(not declared)*
- `promotion`: `registerStep` (R22's check); the reopen registration (R7); `REOPENABLE_FROM` (R2); the fact `publishedRegistry` (R2's ratified edition, R17's frozen pair). *(not declared)*
- `provenance`: `versionChain`, the `register` and `captured_locators` read contract (R12). *(not declared)*
- `content`: `passageNotice` (R9–R11, R14).
- `connections`: `edgeSevered` (R3).
- `inquiry`: `restsOnLive`, `supersededBy`, `legCapped`, `earned`, the `inquiry_basis` read contract, the `onRaised` registration (R2–R7).
- `basis-versions`: the new version R15 writes.
- `strength`: `strengthOf` (R4, R17).

### Invariants

- **R18** The obligation is a query: nothing is stored for it, and no read here writes (P-64). The only rows this module writes are R14's notices and their closures and R16's recorded re-evaluations.
- **R19** Nothing here alters a strength, re-points a reference or moves a leg; only a member's act (R15) moves a reference, and it keeps the old one readable (DEC-12, Framework §14.4, §18.1).
- **R20** Every viewer is given the same record facts; only ids a viewer may not see are withheld or nulled, and a withholding is never counted (REC-30).
- **R21** Silence is earned: no answer reads "nothing newer" or "unaffected" unless the record read it; what could not be read is undetermined, by name (§18.1).
- **R22** C-10.1, registered with `promotion` as a check: `reeval_pending` is a `{flag, since, source}` record or a legacy boolean; a legacy `true` warns; any other type errors; a non-boolean `flag` errors; `false` with a `since` or `source` warns; `true` needs an ISO-8601 UTC `since` (error) and, older than the policy age (30 days unless set), is reported (info); `source` is one of `deletion`, `source_status`, `wp_retraction`, `annotation` (error).
- **R23** Each check moves here as an invariant with its test (K6): C-10.1, C-80.1, C-80.2 (C-80.3 is `content`'s).
- **R24** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the cross-version relation; Bob's rulings of 2026-09-24, option D, and 2026-09-25 00:40Z, rules 1–3), §14.4 (only a member's act moves an authored edge), §2 invariant 8.
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §3 (`reeval_pending`), §5.4 (cascade semantics; DEC-70's severance rule).
- `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.8 (the grade vocabulary R14 reads).
- `docs/development/NOTIFICATIONS.md` (the queue and mute kinds on D-534's model).
- DEC-12 (editions), DEC-19, DEC-69, DEC-70, DEC-72; `build/layers.md` layer 7.
- State Rules §5.4 is amended to say the obligation is derived on read, not a stored flag a cascade sets, with its four cascade events as causes and a member's recorded re-evaluation closing one cause for one dependent until the target moves again (R16, R18; K102, a change to the canon's text).

### Suggestions

- **Factory.** `reevaluationOf(ctx)` answers the one instance per Durable Object storage (K61).
- **The stored triple** (R4) is read off the dependent's document, as `target_edition` already is, rather than off `bundles.reeval_*`, which `retrieval` takes as projection columns (K75 (3)).
- **Callers.** `publication` calls `raise` at a new edition and reads R1 and R9 for which findings still stand; `conformance` and `consequences` fill R8 and read R9; `monitoring` raises §5.4's `source_status` cause (R16) and watches what R14 needs; `queue` renders R14 and holds the queue door that offers R15 in a named, joined project (REC-202, K83 (4)).
- **R14's order.** Its pins come first: D-580 (first-held order), D-579 (action legs, `actions`) and D-595 (suggested legs, `run-productions`).
- Tests: `versionnotice.test.mjs`'s all-tables digest across R10–R11; C-80.1, C-80.2 and each C-10.1 arm get negative controls; R8 gets an arm where a listener throws and the act still lands.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for the rulings file)

- `reevaluation`'s `from` is `["legacy-store", "legacy-checks"]` (C-10.1, C-80.1, C-80.2 move with it; C-80's object is split, numbers unchanged, as content's map says).
- Its uses gain `membership`, `promotion` and `provenance`; `content`, `connections`, `inquiry`, `basis-versions` and `strength` stay.
- `raise` replaces `#reevalRaisedBy` as the one service the four acts call; `promotion` offers a registration that fills `reopen`'s `reevaluation` field (promotion's `reopen`, R24ff., states no route today).
- R8's listeners run after commit and cannot refuse the act; R9 is the recovery read.
- `changedFromAudit` is this module's (a read of what the record already wrote against the version chain), not `provenance`'s or `publication`'s.
- `caseFlags` (`op=caseflags`, the case revision flags) is `publication`'s, not this module's: it reads published cases only.
