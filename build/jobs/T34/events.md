# events (T34)

**Status** · session_01X7zjPcASYWQWpU1ZrM8Moh · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

**R11 with R22: how a Legistar vote's value meets the profile's `vote_values`.** `jurisdictions` R58 makes each `value` a key (`^[a-z][a-z0-9_]*$`) with a `label`; R11 matches "on `value`". Legistar's `VoteValueName` is written in the label's form (`Aye`, `Excused`; legistar-reader R9). So once a profile holds vote values, every imported vote would be refused `UNKNOWN_VOTE_VALUE` and answered `unresolved` (R22), unless the match also reads the label.

**My best reading, which I am building now:** R11 as written. Both `addParticipant` and `followedImport` match exactly on `value`, with no case folding and no match on `label`. A Legistar vote whose `VoteValueName` is no profile `value` is not written. It is answered in `unresolved` with its source row and `refusal: UNKNOWN_VOTE_VALUE`. While the active profiles hold no vote values (the first profile today: "two captured roll calls show only Aye and Excused"), the value is kept as written with `vote_value_checked: false`, as T33 did (K1746).

**The alternative, if you prefer it:** an import matches a source's value against each entry's `label`, written exactly, and holds the entry's `value`. That would be a change to R11/R22's wording, so it would be your call.

Nothing I build next waits on this answer.

## J2 · COMPLETE

**T34-17 applied, all five entries.** The branch is `job/T34/events`. It has `tranche/T34` merged in at K1793, after B2.
- **(N591) R16.** The `onEventChanged` telling now carries `at`. Each act takes one instant when its transaction starts. All its rows and every telling of it carry that instant, so every listener is told the same value (`#tx`, `#instant`).
- **(N595) R30.** `timeline` passes its own `viewer`, unchanged, to every registered source. A source's lane is `truncated` when the source answers `truncated: true` or when the limit cuts its items.
- **(N561) R11.** Vote values are read from the active profiles' `vocabulary.vote_values` (`jurisdictions` R58), never from a top-level key or a list of this module's own. They are matched on `value`. With none held, the value is kept as written and answered `vote_value_checked: false`. **K1788:** an import's source value that is no entry's `value` is matched exactly on an entry's `label`, and the entry's `value` is held. A member's act matches on `value` only.
- **(N602) R29.** On a dated `timeline` read, `from` and `to` bound only the placed items. Every placed-nowhere item of the set is still listed apart, within the lane's limit.
- **(N606) R22.** Each meeting `followedImport` writes concerns the followed body, through one `concerns` end. A meeting held before T34 gains that end at its next import. `eventsFor(body)` therefore reads the body's meetings.
- **Improvement.** The `event_when_cache` declaration now names its `from` (`events`, `event_attestations`, `event_choices`, `dated_facts`), per record-core R77. Vote values are read once per participant view, not twice.
- **Before-start reds cleared:** `participants.test.mjs` R11 and `follow.test.mjs` R22 and R41. The fixture now uses the profile's own vote values (`votes: "none"` removes them) and adds the Legistar body scheme in the `body` space.
- **Deferred:** nothing.

**Found in other modules (REPORT):**
1. **filings, stale test.** `chronology.test.mjs:63` (R33) `deepEqual`s the arguments a registered source receives as `{set, from, to, limit}`. Under events R30 they now carry `viewer` too. The test is red from this merge until filings' own job updates it (T34-62 already depends on T34-17). On the baseline it passes.
2. **calculations R19, intermittent on the baseline too.** `registrations.test.mjs:46` gets `[true, false]` where it expects `[false, true]`. It fails about 3 runs in 5 with this change and without it, so it looks like an order dependence, not something this job caused.
3. **plane bundle stale.** The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from this change, to regenerate at L5's close (§14).

**Tests and checks run:**
- events: `node --test bio-plane/test/m/events/` gave 45 pass, 0 fail.
- Every module whose `uses` names events, run before and after this change (`calculations` R19 aside, which flips either way): no new red other than filings R33. The other reds match the baseline, all named: calculations R4, answers R1, corpus-export R4, following R2, op-declarations R19/R6, control-plane R43.
- Checks: format: 126 modules, 0 failures. architecture: 15 product files, 0 failures. coverage: 42 of 42 live ids, 0 failures. ownership: 8 files vs `tranche/T34`, 0 failures.

Size (session_01X7zjPcASYWQWpU1ZrM8Moh): test runs 34, module lines 1927
