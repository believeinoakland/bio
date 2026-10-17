# filings (T50)

**Status** · session_01KMCayDcxgt1R1F5KZRvu7k · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

T50-46 filings: complete.

Entries applied
- R60 `#matterStake`: the action's own stake (`actions` R105 `own_stake`), else the project's (`public-read.groupFields({project}).matter_stake`), else null; an unreadable source answers `undetermined` with its own `source`, never the other and never null. The project is the action's record's, else the determination's.
- R61: the stamp's `group` is `groupFields({project})` with `matter_stake` = R60's answer, read at approval (filings, communications) and at export (packets); the in-band block adds the matter line by key beside the team's (`stake.inmatter`, `stake.source.action|project`, `stake.unreadable`); no matter line when null; the body fingerprint is unchanged.
- R62 `stakeAtPreparation` (`op=stakeatpreparation`, a read): `{higher_stakes, governing_tier, group_stake, matter_stake, project}`; true for Tier 2, 3 and undetermined; writes nothing, gates nothing.
- R63: an accepted source's line prints its `matter_stake` after identity and team stake; nothing added when null.
- N1132 / plan rule 6: no member-facing English. Every sentence is `word(key, vars)` through one door (`words.mjs`, which records the keys read); every C-115 row's translation is `refusal.<CODE>` by key (SECOND_APPROVAL_NEEDED, NO_SUCH_BUNDLE and the rest now too); `phrasing.no_list` and the review-copy sentences by key; KEYED and FILINGS_WORDS removed. The three words checks red at START now pass.

Deferred: none.

Reports (other modules / design lane)
1. op-declarations, op-grades, affordances: `op=stakeatpreparation` (a read) is new; affordances' catalogue test "R1 R12: layer 9's op maps hold exactly its 41 writes, 19 ungated reads…" now counts one more read.
2. actions R105 is not merged: `own_stake` and an accepted disclosure's `matter_stake` are tested through stand-ins answering as R105 states. Ring me with a CHANGE after actions merges and I re-run against the real one.
3. words-reads.json for filings lacks the keys I read: stake.inmatter, stake.source.action, stake.source.project, stake.unreadable, state.undetermined (WORDS_OWED). It lists but nothing here reads: filings.secondapproval.waiting (no requirement answers it), filings.correcting_act, filings.remedying_harm, filings.time_review_response (`part` ids stay ids).
4. Sentences/fragments no key holds, kept as value tokens: "none declared", "undetermined", "none" (in-band lines); ", by {office}"; ", {n} not judged"; " by {x}" (superseded); "the project {p}"/"the action {a}" (hold notice); "{n} calendar days, …"; "a deadline", "a period", "days"; "the counterparty" (stale list); section titles Facts, Chronology, Exhibits, Standards, Deadlines, Briefing; `part` ids; a record-check item's `why` for an unread check is now `code: RECORD_CHECK_UNREAD`.
5. Requirement text R51/R52 still says several words are kept/returned (phrasing.no_list, rfc, waiting); they are now read by key. BOB's edit.
6. plane t46 "R40 Store's RPC groupFields()" fails here (it expects groupFields without public-read R36's matter_stake): plane's job.
7. Branches whose keys no test reaches (unreadable-module cases): about 40 of the design's 326; static check of all 307 key calls: every key held, every placeholder supplied.

Tests and checks
- node --test test/m/filings/: 132 pass, 0 fail (t50.test.mjs R60-R63; words.test.mjs R51 R52).
- Dependents: escalation, action-plans, plan-work, action-producers: same 8 inherited reds as the tranche, none mine. affordances/answer-envelope/op-declarations/plane/control-plane/screens-action: only the two noted above (items 1, 6) are new.
- checks/format 0 failures; architecture filings 0; coverage filings 62 of 62; ownership 0 (14 files); checks/run.mjs: architecture 0 failures, none of the coverage failures in filings.

Size (session_01KMCayDcxgt1R1F5KZRvu7k): test runs 12, module lines 3615
