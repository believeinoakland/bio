# case-authoring (T23)

**Status** · session_0115DsBvkWjRDrABc4Ccc2CR · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

R41's two interfaces do not exist yet (job/T23/case-grammar and job/T23/network-notices hold only their start entries), so I build R41 on this reading and finish it after merging tranche/T23 once both are merged (I merge last in L8 anyway):
1. network-notices is reached as `networkNoticesOf(host)` from `bio-plane/src/network-notices/index.mjs`, its instance answering `noticeReferenceOf(project)` → a notice id string or null (its R19). case-authoring reaches it lazily like its other deps (`deps.networkNotices` for tests).
2. case-grammar R10's "writer" is a pure export of `case-grammar/index.mjs` answering the front-matter line(s) for a reference (e.g. `workingOnLines(ref)` → `["working_on: <id>"]`, `[]` for null), placed directly after `case_project:`. If case-grammar offers only `isNoticeReference` and no writer, I write the one line `working_on: <id>` myself, only when `isNoticeReference(ref)` holds, and omit it otherwise (a malformed answer is treated as null and never written, since ratification R38 would refuse the document).
Please confirm or give the names the two jobs actually export. Nothing else in the job waits on this.

## J2 · REPORT

Progress, before the L8 merges I wait on (R41's wiring):
- Done on job/T23/case-authoring: R39 (`proposeWhatChanged`/`whatChangedDrafts`, ops `whatchangedpropose`, `whatchangeddrafts`; new table `what_changed_drafts`, append-only, declared whole to purge beside `statement_acknowledgements`), R38's draft arm, N497, R41 and R42 over an injected `networkNotices` (the real `networkNoticesOf` and case-grammar's `isNoticeReference` are wired after I merge tranche/T23 with both; a local copy of R10's id shape stands in until then, marked TODO). Stale notes re-worded: checks.mjs C-82.8 "awaiting promotion's stamp" (stamped in 1.53.0), index.mjs "the legacy store's op map" (now plane's).
- Readings, for rulings: (a) R38's draft arm: any R39 draft of this case, whoever proposed it, records `began_as: machine_draft` (your START's words; a member-proposed draft is labelled `member_proposed` in its own label). (b) R39's `NO_SUCH_CASE`: published = a ratified edition (`cases` row); sight = membership's gate over the case's project; one byte-identical answer (R27). (c) R39's list is bounded at 500 with `truncated`, as R20's. (d) R28 names only `statement_acknowledgements`; `what_changed_drafts` is declared the same way: R28's text could name it.
- Reds, by name: new ops `whatchangedpropose`, `whatchangeddrafts` fall under red 5 (affordances/op-declarations totality until L11) — neither suite is red today (affordances 146/146, op-declarations 25/25). Whole `bio-plane/test/m`: 5046 pass, 3 fail, all accepted: control-plane `inbox-door.test.mjs`:81 (red 9), queue `catalogue.test.mjs`:34 and :116 (red 13). Users: affordances 146/146, review 35/35, plane 36/36, control-plane 115/116 (red 9), skills 49/49.
- Generated artifact: my change under `bio-plane/src/case-authoring/` stales `bio-plane/dist/bio-plane.bundled.mjs` (red 12); regenerated nothing.
- Another module: plane's `store.mjs`:131 builds `caseAuthoringOf(ctx)` with no deps; once wired, case-authoring reaches network-notices lazily on the same host, so plane needs no change.

## J3 · COMPLETE

**Entries applied** (merged tranche/T23 through B5, f3ed11b561):
- N485: R39 `proposeWhatChanged` / `whatChangedDrafts` (ops `whatchangedpropose`, `whatchangeddrafts` in `caseAuthoringOps`), over a new append-only table `what_changed_drafts` (draft id `WCD-<year>-<n>` through record-core's ledger; label `proposalLabel(proposedBy, "edition_statement")` kept as answered; `NO_SUCH_CASE` one byte-identical answer for unpublished, unseen or absent; `BAD_WHAT_CHANGED` for non-string, blank, over 8,000 code points; list oldest first, bounded 500 with `truncated`). R38's draft arm: a draft of this case records `began_as: machine_draft`, the draft and `adopted_as_drafted`; any other draft `NO_SUCH_WHAT_CHANGED_DRAFT`. Readings K1147 (a)–(c).
- R41: `working_on` written only as `workingOnLines(noticeReferenceOf(project))` (K1144), directly after `case_project:`; `network-notices` reached as `networkNoticesOf(host)` lazily (`deps.networkNotices` in tests).
- R42 (K1119): pre-flight step one adds `NOTICE_SEALS_SENTENCE` (one plain sentence, until the UX stream's words) and `working_on` when the project has a notice; nothing said to a caller the authority fences refuse.
- N497: fixture registers `producingGroup` under `instance-setup`.
- P8 re-scan (K1138): `checks.mjs` C-82.8 "awaiting promotion's stamp" → stamped in 1.53.0; `index.mjs` "the legacy store's op map" → the plane's (`plane/store.mjs`). The extraction notes naming `store.mjs`/`airun.mjs` are provenance and stay.
- R28 (yours at merge, K1147): `what_changed_drafts` is declared whole to purge beside `statement_acknowledgements`; its test asserts both.

**Deferred:** nothing.

**Other modules:** none found wanting. Plane's `store.mjs`:131 needs no change (case-authoring reaches network-notices on the same host). The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale from my change (red 12); regenerated nothing.

**Reds:** new ops `whatchangedpropose`, `whatchangeddrafts` are red 5's (affordances/op-declarations totality until L11; neither suite red today). Whole `bio-plane/test/m` at f3ed11b561 + my commits: 5132 tests, 5114 pass, 6 fail — none mine; each is red on tranche/T23 without my changes (re-run there): control-plane `inbox-door.test.mjs`:81 (red 9); queue `catalogue.test.mjs`:34, :116 (red 13); conformance `record.test.mjs`:144 R17 (red 6, the line moved from :165); control-plane `families.test.mjs`:47 R22 (CHECK_FAMILIES totality, likely network-notices' new rows: please name); plane `worker.test.mjs`:39 R6 (the door through the hooks; please name). Users: affordances 146/146, review 35/35, plane 36/36 (before network-notices' merge), control-plane 115/116 (red 9), skills 49/49.

**Tests and checks:** `bio-plane/test/m/case-authoring/` 99 pass, 0 fail (new `drafts.test.mjs`, `notices.test.mjs`). format: 0 failures; architecture: 18 product files, 0 failures; coverage: 42 of 42 live ids named, 0 failures; ownership: 10 files, 0 failures.

**Final line count:** `bio-plane/src/case-authoring/` 3,418 lines (under 4,000, P6).

Size (session_0115DsBvkWjRDrABc4Ccc2CR): test runs 17, module lines 3418
