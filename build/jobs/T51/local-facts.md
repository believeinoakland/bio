# local-facts (T51)

**Status** · session_0173wYyJecMfho8UMa2bzEeh · depth 2 · COMPLETE · handled B7

## Completion (T51-158)

**Entries applied**
- R18: `ruleFields({section, viewer})` (`LocalFacts.ruleFields`, `rules.mjs` `RULE_FIELDS` frozen data, op `rulefields` in `localFactsOps`), fields in `jurisdictions`' order with `effective_from` last; choices from `jurisdictions`' own exported vocabularies (`UNITS`, `COUNTS`, `DIRECTIONS`, `STARTS`, `OWED_BY`, `LEGAL_FACT_TRIGGERS`) and the active view's `action_kinds` ids. Unknown or absent section: R17's one builder.
- R18 (DEC-341, K3938): `effective_from` required on a member-drafted rule (a real `YYYY-MM-DD`; else `RULE_ENTRY_INVALID` with an error at `<section>[0].effective_from`, no new code); kept on the rule's entry; `governingView` does not apply a confirmed rule until that local day in the view's zone, and does not carry the field into the view.
- R19: each `groupRules` row also answers `applies_to`, `tier` (R11's read, one `combine` per read) and `source`.
- Words (K3949): the 5 findings and the K3962 one fixed; checks.mjs's three RULE_* rows read `refusal.*` keys by `word` (`{errors}` left for the screen); tests compare with `word`; two `why` strings in `governingPath` now `localize`.

**My readings (BOB may overrule)**
1. `ruleFields` to a viewer naming no member answers `fields: []` (as `groupRules` answers none).
2. A deadline's `applies_to` choices are `claim` followed by the view's kind ids (`jurisdictions` accepts `claim`; omitting it forbids drafting claim rules). A legal fact's `applies_to` carries `many: true` (it is a list). `many` is an extra key beside the spec's `{field, required, kind, choices?}`.
3. Fields left out because no `kind` can draw them: deadline `starter`, `extension`, `tolling`, `observed`, `closures`, `computation`, `applies_on`, `roll`, `consequence`, `defends`; legal fact `threshold`. `starts` offers the seven starts the design draws, without `third_party` (BOB's B2, K3997).
4. `effective_from` is stripped from the entry when `governingView` applies a rule; `groupRules` and `ruleOffer` keep it (the entry as drafted).

**Found in other modules (caused by this change; theirs to fix, not touched)**
- `duties` R5 test "over the real local-facts" (`response.test.mjs`:346): its draft lacks `effective_from`.
- `affordances` `t45-backing.test.mjs`:153, :156 (R19): same; and its "op maps of filing-templates and local-facts hold exactly their ops" test lists the old ops (now also `rulefields`).
- `plane` `compose.test.mjs`:84 (R11, R5): the op list now also has `rulefields`; `op-declarations` T51-107 declares it.
- Baseline reds that are not mine and unchanged: duties 4, affordances 2, progressions 3, action-clocks 8, filings 2.
- Refusal `detail` strings in `index.mjs`/`rules.mjs` (e.g. "the act is one of confirm, correct, dispute.") are English diagnostics beside the keyed `translation`; `checks/words.mjs` finds none. Listed for BOB to settle with the design stream (K3944).

**Deferred**: none.

**B2 (CHANGE, K3997)**: `starts` choices are the seven (no `third_party`); tested in `t51.test.mjs`; readings 1, 2, 4 accepted.

**Tests and checks** (from `/home/user/bio` and the process repository):
- `node --test bio-plane/test/m/local-facts/`: 71 pass, 0 fail (new: `t51.test.mjs`, 8 tests naming R18, R19).
- `checks/run.mjs`: format 0 failures, architecture 0 failures; words: no finding in local-facts; coverage local-facts: 19 of 19 live ids named by a test.
- `setup-words/build.mjs --check`: stale-rows note only (`local-facts.rules.effective_from_is_a_day` and `local-facts.index.the_year_is_undetermined`, `local-facts.index.lines_is_not_reachable` are new `localize` ids awaiting BOB's regeneration).
- `checks/ownership.mjs`: 0 failures.

Size (session_01ST4CngevnjWcyxth5PJjXe): test runs 14, module lines 1449

## J1 · COMPLETE

T51-158 done on job/T51/local-facts: R18 ruleFields (+op rulefields) with effective_from, R19 rows (applies_to, tier, source), words findings fixed (words check clean for local-facts). Module tests 71 pass, coverage 19/19, format/architecture/ownership 0 failures. Record: build/jobs/T51/local-facts.md. Needs you: (1) four reds I caused in other modules' tests, not touched: duties R5 response.test.mjs:346 and affordances t45-backing.test.mjs:153,156 draft without effective_from; affordances op-map test and plane compose.test.mjs:84 list the ops without rulefields (T51-107 declares it). (2) readings in my record: starts offers third_party but starter has no drawable kind (deferred); claim added to a deadline's applies_to choices; extra many:true key; refusal detail strings are diagnostics for you to settle with the design (K3944). (3) setup-words rows stale for 3 new localize ids; regenerate at layer close.

## J2 · COMPLETE · re B2

B2 applied: ruleFields starts choices are the seven (no third_party), tested; deferral dropped from the record. Module tests 71 pass, coverage 19/19, format/architecture/ownership 0 failures, words clean for local-facts.

## J3 · COMPLETE · re B3

RW (words, K4015): done. `checks/words.mjs /home/user/bio local-facts` reads 0 failures (was 1 inline).

**Entries applied**
- The one finding, `rules.mjs` (the refusal `MACHINE_CANNOT_DRAFT_RULE`'s detail): the inline sentence is replaced by `word("refusal.MACHINE_CANNOT_DRAFT_RULE")`, the list's row already for it. Members now read the row's text: "Only a member drafts or withdraws your team's own rule. The assistant may draft one for you to read, but it enters only when you draft it yourself. Nothing was written." Please confirm at the regeneration (list wins, K3930).

**Other changes in this module (P8)**
- `index.mjs` governingPath: an undetermined `part_of` line's reason was a lines `{key, vars}` object, so a member read "[object Object]" in the sentence. It now goes through lines' `reasonText`, which lines exports for this.
- Tests: the sentence regexes in `governing`, `due`, `status`, `rows`, `rules` (K3964, K3965, K3974) now compare with `word(key, vars)` by equality. Two R6 governing tests, red at the start of this job on the changed rows, pass. `t46`'s `/\{errors\}/` is a placeholder check, not sentence text, and stays.

**Not reported:** no string judged unread by a member; nothing deferred.

**Tests and checks** (from `/home/user/bio`, process repository at `e8ac153`, which contains d424c32):
- `node --test bio-plane/test/m/local-facts/*.test.mjs`: 71 pass, 0 fail (before: 69 pass, 2 fail).
- `checks/run.mjs /home/user/bio`: format 0 failures, architecture 0 failures. Coverage, words and the rest report failures in other modules only (coverage 22, words 1629 across the tranche; none name local-facts).
- `checks/words.mjs /home/user/bio local-facts`: 0 failures.
- `checks/coverage.mjs /home/user/bio local-facts`: 19 of 19 live ids named.
- `bio-plane/src/setup-words/build.mjs --check`: rows and unreviewed list match words.json and the source.
- `checks/ownership.mjs /home/user/bio local-facts tranche/T51 job/T51/local-facts`: 0 failures.

Size (session_012PieGczCfTTKCXgZH64nqx): test runs 10, module lines 1450

## Fix round 10 · D-B1 (plan item 133; K5264) · LOCAL-FACTS #11

**What changed**
- `local-facts/paths.mjs`: `TEAM_ZONE_PATH = "@team/time_zone"`; `factPath({team: true, fact: "time_zone"})` answers it and `parseFactPath` reads it back as `{team: true, fact: "time_zone"}`. `@` is no character of a profile id, so no profile can hold the path.
- `local-facts/index.mjs`: `#resolve` treats the team path as always a fact (no profile needed); `#profileZone` (the zone the active profiles agree on, each as it governs here) is its default; `#teamZone` (latest `correct` on the team path, else the default) is the zone its horizon counts on; `factConfirm` validates the value through `jurisdictions.validate` of a probe profile holding it as `time_zone` (one rule, R41), writes `profile` `@team`; confirm/dispute with no zone governing answer `NO_SUCH_FACT`. `TEAM_ZONE_PATH` exported.
- The team zone is read by its path and is not listed by `factstatus {}` or `factsdue {}`: `screens-settings/group.mjs:139` takes the first listed `time_zone` as a profile's (listing it broke its R45 tests, seen and reverted).

**The op the settings screen sends:** `op=factconfirm` body `{path: "@team/time_zone", act: "correct", value: "<IANA name>", how: "<1-500 chars>", source: "<1-500 chars>"}` (`by`/`viewer` stamped). Read: `op=factstatus&path=@team/time_zone` answers `status` `absent` (nothing stated, no profile default), `unconfirmed` (default only), `corrected` (stated); the governing zone is `governs.value`.

**Test red then green:** `team-zone.test.mjs` (8 tests, R21): red before (the module did not export `TEAM_ZONE_PATH`; a no-profile team's correction answered `NO_SUCH_FACT`), green after: a team with no profile sets its zone then reads it; invalid zones (`Mars/Olympus`, `pacific time`, empty, non-string) refused with nothing written; no confirm/dispute until a zone governs; 183-day lapse on the zone's local day; profile zone is the default, a stated one governs over it; two disagreeing profiles give no default.

**Readers of the team's zone, for BOB to carry** (each reads `${id}/time_zone` per active profile and returns null with no active profile; they should read `@team/time_zone` first):
- `review/index.mjs:381-384` (`#zone`, early return at :372 when no profile is active)
- `retrieval/index.mjs:502-505` (same shape)
- `publish-schedule/schedule.mjs:49-66` (`groupZone`, early return at :53; review R35 / screens-publish R27 reach it)
- `screens-settings/group.mjs:34, 138-165, 294-301` (draws and sends; sends `path: ""` with none held, now `@team/time_zone`)
- `screens-daily/find-in.mjs:17-18`, `find-in-forms.mjs:23` (read the list's time_zone; need the path read)
- `progressions/index.mjs:1709` (`factStatus({})` listing; unchanged, the team fact is not listed)

**Proposed wording for BOB (R21; amends R1, R6, R3)**: "**R21** (T51; D-B1; K5264) The team's own time zone is a fact the team states whether or not a place profile is installed: path `@team/time_zone` (R6; no profile id can spell it). `factConfirm` accepts a `correct` of it with a `value` that is an IANA name valid as a profile's `time_zone` (`jurisdictions` R41), a `source` and a `how`, with no profile held; `confirm` and `dispute` need a zone that governs (else `NO_SUCH_FACT`). It governs from its latest correction, else the zone the active profiles agree on; with none, `factStatus` of the path answers `absent`. Horizon: 183 days (R3). It is read by its path and is not among the facts `factStatus`/`factsDue` list without a path." R1's `NO_SUCH_FACT` ("a path R6 does not name in an active profile") needs "or the team's own".

**Open for BOB:** (1) "the administrator sets it": `factconfirm` admits member and probe classes; restricting the team path to administrators needs a new refusal and its `words.json` key (design stream) or an admin-only door; not done. (2) New `localize` id `local-facts.index.the_team_has_not_stated`: setup-words rows stale, regenerate at layer close.

**Tests and checks**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/local-facts/*.test.mjs`: 83 pass, 0 fail (run alone, files summed = 83).
- `impact.mjs origin/tranche/T51 HEAD` named 1781 test files in 95 modules; I ran 1719 of them (the run was stopped, a flake-prone tail left). Failing files: 14, all red on the tranche tip too except `queue-producers/names.test.mjs` (fixed by tranche changes, green after merging the tip) and `instance-setup/worker-reports.test.mjs` (load flake, green alone); `screens-settings/group.test.mjs` went red only while the team fact was listed and is green after the revert. The direct users re-run after the revert, all green: progressions 96, retrieval 221, publish-schedule 35, review 106, screens-settings 272, screens-daily 319, duties 80, ratification 340, action-clocks 87, filings 168.
- checks: format 0 failures, architecture 0, coverage 20 of 20, words 0, ownership 0.

Size (session_01TwA2g3SpTvu1uEcFVRLefh): test runs 12, module lines 1560

## J4 · COMPLETE

D-B1 done (R21). Team zone = fact at path @team/time_zone; set with op=factconfirm {path:'@team/time_zone', act:'correct', value:<IANA>, how, source}; read with op=factstatus&path=@team/time_zone (absent / unconfirmed(default) / corrected; governs.value). Invalid zone -> FACT_VALUE_REFUSED. New test team-zone.test.mjs 8 tests (red before, green after); local-facts 83 pass; direct users green (progressions, retrieval, publish-schedule, review, screens-settings, screens-daily, duties, ratification, action-clocks, filings); impact run 1719/1781 files, remaining reds red on the tip too. Not listed by factstatus{} (screens-settings takes the first listed time_zone). Readers for you to carry (file:line in my record): review 381, retrieval 502, publish-schedule 59, screens-settings group.mjs 34/138/294, screens-daily find-in 17. Open: admin-only needs a refusal+word (design); R21/R1 wording proposed in record; setup-words rows stale for 1 new localize id. Size (session_01TwA2g3SpTvu1uEcFVRLefh): test runs 12, module lines 1560. Fixtures: team-zone tests use fixtures-own (own store, profiles written by the test).

## J5 · COMPLETE · re B6

D-B1 is done and J4 (COMPLETE) is already on origin/job/T51/local-facts; this answers B6. For SCREENS-SETTINGS #23: set the team zone with op=factconfirm body {path:'@team/time_zone', act:'correct', value:<IANA zone name>, how:<1-500 chars>, source:<1-500 chars>} (by/viewer stamped); an invalid zone answers FACT_VALUE_REFUSED. Read it with op=factstatus&path=@team/time_zone: status absent (nothing stated, no profile default), unconfirmed (profile default only), corrected (stated); the governing zone is governs.value. The team fact is NOT in the factstatus{} list, so the screen must read that path itself (it should send path '@team/time_zone' instead of '' when no profile holds a time_zone). The other readers to carry (review 381, retrieval 502, publish-schedule 59, screens-daily find-in 17) are in my record. Size (session_01TwA2g3SpTvu1uEcFVRLefh): test runs 12, module lines 1560.

## Fix round 10 · R22 (plan item 144; K5292; walk E N2, AP2) · LOCAL-FACTS #12

**What changed**
- `bio-plane/src/local-facts/index.mjs:287` `#syncTeamZone()`: sets record-core's setting `team_time_zone` to the latest `correct` of `@team/time_zone` when the setting differs (by the act's member); answers `setSetting`'s refusal or null.
- `:477` `factConfirm`: after the act's INSERT, inside the same `record.transact`, a `correct` of the team path calls it; a refusal rolls the act back. A refused correction (`FACT_VALUE_REFUSED`, `FACT_HOW_REFUSED`) returns before the transaction, so sets nothing.
- `:316` `#active()` calls it first, so the first read or write of any kind (`factStatus`, `factsDue`, `factConfirm`) backfills a copy that holds a correction and no setting (biosmoke8). R21's governing value is unchanged.
- New test file `bio-plane/test/m/local-facts/r22.test.mjs` (5 tests, R22): correction sets it and a second replaces it (`getSetting`); confirm, dispute and a profile fact's correction leave it; refused corrections set nothing and keep the old value; backfill by each of three reads; backfill by a write. Marker: `fixtures-own` (acts for the backfill case written into this module's own table).

**Red then green:** with `index.mjs` stashed, `r22.test.mjs`: 0 pass, 5 fail (setting stays null); with the change: 5 pass.

**Tests and checks** (from `/home/user/bio`; process repository `8be32ff`)
- `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/local-facts/*.test.mjs`: 88 pass, 0 fail (files run alone sum to 88).
- Direct users, run once: screens-settings 273, retrieval 222, review 109, publish-schedule 37, progressions 96, duties 80, all 0 fail.
- format 0 failures; architecture 0 failures; coverage local-facts 22 of 22; words local-facts 0 failures; ownership 0 failures (3 files).
- Not run: the whole `checks/run.mjs` tranche-wide list (other modules' findings are not mine).

**Found in other modules:** none new. Readers still taking the zone from profiles alone are listed in `causes-rewalk.md` §3; R22's setting is what lets them read settings alone (`jurisdictions.governingZone`, R98).
**Deferred:** none. R22's "(not yet met: T51)" mark in `build/requirements/local-facts.md` is BOB's to lift.

Size (session_0173wYyJecMfho8UMa2bzEeh): test runs 10, module lines 1575
