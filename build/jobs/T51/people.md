# people (T51)

**Status** · session_014qiZzWUT5rWTceixKQwyba · depth 2 · COMPLETE · handled B8

## J1 · QUESTION

Two questions; R40 and R41 are built and tested on my best readings (committed on my branch), and I carry on with the record meanwhile.

1. **people's `uses` lacks `setup-words`** (your file, `build/modules.json`). K3810/R13 have my tests assert keys with `hasWord`/`word` from `setup-words`; `checks/architecture.mjs` fails 2 files (`identity.test.mjs`, `reads.test.mjs`, now also `why.test.mjs`) with "imports setup-words, which people does not declare in uses". Best reading: add `setup-words` to people's uses (it is layer 1 and "uses nothing"). Until you do, I cannot reach 0 architecture failures. The module code itself imports nothing from it.

2. **R40's "hub answer (R26)" breaks connection-grammar's `neighbours` contract.** R40 says the hub answer's `why` is `{key: people.why.person_end_identity, vars: {hub}}` and an item's `undetermined.why` is a key too. But connection-grammar's `reads.mjs` (R6/R20) judges `hub.why` and `item.undetermined.why` by `filled()`, i.e. a non-empty STRING, and the registry then refuses people's answer `OWNER_NONCONFORMING` ("hub: a hub is answered {set_size, why}"; I reproduced it with a person with more than BOUNDS.hub claims). I built it as R40 states (keys). Best reading: connection-grammar's entry accepts `{key, vars}` for those two `why`s (its module's change, not mine). If instead the contract stays a string, tell me and I put the strings back at those two sites (hub, and a claim's `undetermined`).

## J2 · REPORT

Found in other modules while meeting R40 (I passed each reason on exactly as its owner answers it, never flattened):
1. **civil-time** (`validAt`, `undetermined(why)`, `values.mjs`) answers every `why` as English ("no end is stated", "no start is stated", "... overlaps the start ... at the precision held", zone and date refusals). Against R40's "a reason an owner answers is its own key and fills" it answers a sentence; its entry should key them. people passes it through, so a personAt item built on an open-ended `holds` line still shows civil-time's English in `undetermined.why`.
2. **lines** answers `valid: {undetermined: true, why: "cache stale"}` and `{state: "undetermined", why}` as English strings (`index.mjs` around 350-359, 599, 793).
3. **events** `sequence` answers `why` as `word(...)` English (`events.why.cited_orders_disagree`, `events.why.precision_held_settle`), not `{key, vars}`, so a pair statementsOf cannot order shows events' sentence.
4. **duties** `in_force.why`: people passes it through when given, else `people.why.whether_source_force`.
5. **screens-investigate** (`person.mjs`:90) reads `String(f.undetermined.why)`: `why` is now `{key, vars}` and (at the contract sites) a string beside `why_key`; its draw of `screen.person.facts.undetermined` as `{reason}` should take `word(key, vars)`. Also `people.mjs`:88 offers only the `both`, `people`, `organisations` choices; R41's `show` has six more values (`screen.people.show.*`).
6. Inherited, not mine: 32 failures in `notice-producers`, `op-declarations`, `affordances`, `case-authoring`, `retrieval/words`, `screens-investigate/{explore,person}` are identical on `tranche/T51` without my commit.

## J3 · COMPLETE

**People (T51-38): R40 and R41 met; every test of the module green; checks clean for people.**

**Entries applied**
- R40: every undetermined `why` is `{key, vars}`. Sites: `personAt` items (`undetermined.why`, also posts, facts, duties and the `undetermined` lists of staffing/credentials/interests that share `#judge`), the identity cluster (`identityOf` and each read's `cluster.why`: `people.identity_cluster_cache`, `people.identity_cluster_cache_differs`, `people.why.claim_joins_two` with `{apart}` the claim ids), a pair `statementsOf` cannot order (`people.why.record_settle_order`), `people.why.validity_stated`, `people.why.owner_settle_validity`, `people.why.whether_source_force`, `lines.why.stated_current_through` (`{why, day}`). A reason an owner answers is passed on exactly. At connection-grammar's two string-judged sites (the hub answer and a hop's `undetermined`) `why` is the sentence `word(key, vars)` reads and `why_key` stands beside it (B2, K3865).
- R41: `peopleDirectory`'s `show` gains `offices`, `ordinances`, `contracts`, `funds` (fund and program), `sources`, `everything` (every kind but proceeding); `both` stays the default; an office row answers `holders` (at most 5 `{entity, label}`, persons whose `holds` line civil-time does not rule out today, by entity id); the `office` filter still keeps persons only; `today` for another kind is its note as R38 states.

**Tests** (named R40, R41): new `why.test.mjs` (7), `kinds.test.mjs` (3); converted for K3810 the existing assertions that copied a sentence (identity, reads, facts: they now assert the key or the owner's own answer); `directory.test.mjs` no longer calls `offices` malformed (it is a value now; `parcels` is the control).
- `node --test test/m/people/*.test.mjs`: tests 66, pass 66, fail 0.
- Users of people (retrieval, calculations, strength, answers, corpus-export, ratification, case-disclosures, case-authoring, consequences, scheduler, affordances, notice-producers, op-declarations, control-plane, plane, screens-investigate, explore): 2599 tests, 32 fail; the same 32 fail on `tranche/T51` without my commit (inherited).
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage for people 41 of 41 (the 21 coverage failures are other modules'); channels 0.
- `node checks/ownership.mjs /home/user/bio people tranche/T51 job/T51/people`: 8 files, 0 failures.

**Deferred**: nothing. One judgement recorded: `people.why.owner_settle_validity` also answers when civil-time throws or answers no reason (no key exists for a bare "undetermined"); `#validity`'s refusal details for a bad bound stay English in the refusal `detail` (a refusal is not an undetermined answer; the keys `people.why.precision`, `bound_gives_value`, `event_bound_names`, `bound_date_value` are held for a screen, not emitted).

**Found in other modules**: see the REPORT (J2): civil-time, lines and events answer English reasons; screens-investigate reads `String(why)` and offers three `show` values.

Size (session_016nx6W8cHCnGj3NUy1ARzAe): test runs 14, module lines 2238

## J4 · REPORT

R40 needs your amendment; two decisions are yours (P17).

1. Requirement text. R40 says that where connection-grammar's contract judges an undetermined reason as a filled string, `why` stays a string with `why_key` beside it. connection-grammar R6 (its reads.mjs:17-21, as merged) now judges a hop's `undetermined.why` as a `{key, vars}`; a string fails OWNER_NONCONFORMING. I changed the hop to pass civil-time's `{key, vars}` on as it answers, and dropped `why_key` on hops. The hub answer keeps its string `why` (connection-grammar still requires a filled string there) with `why_key` beside it. Requested: amend R40 to say so.
2. Composed reason. `lines.why.stated_current_through` takes its `{why}` fill as the owner's sentence (civil-time's key read through `word`), as lines R21 does; the test in why.test.mjs:62 says the same. reads.test.mjs:251 expected the nested key object, which `word` cannot draw: its fill is String-written, so a nested key shows as "[object Object]". I changed that expectation to the sentence. Choice for you: keep the sentence (current code), or extend setup-words so a fill can take a key (its owner, not mine).

The rows for `people.index.evidence_names_cited_line`, `people.index.read_names_member` and `people.checks.join_shape` are new ids: rows.mjs regenerates at the layer close (BOB's step).

## J5 · COMPLETE

CR-13 done on job/T51/people (ffb974f5de): words findings and the R40 reason changes.

Applied
- Words (K3949, K3957, K3962): inline copies at index.mjs:53-54 and :473 now read label.identityclaimkinds rows (not_same_as, unsure, same_as); the cited-line sentence (:505) and the read-needs-member refusal (:1757) are localize ids of this module; the OWNER_HOST_AMBIGUOUS sentence (:1790) reads people.why.people_neighbors_needs; the join-shape sentence (checks.mjs:70) is localize people.checks.join_shape; the test copy (directory.test.mjs:91) is now an assertion message with no sentence.
- R40 (K3958): connection-grammar R6 judges a hop's undetermined reason as {key, vars}: items pass civil-time's key on as it answers (no sentence, no why_key on hops); the composed lines.why.stated_current_through key takes its {why} fill as the owner's sentence (lines R21); why.test.mjs's R40 hop test and reads.test.mjs's R14 expectation align to this. The hub keeps its string why with why_key.

Deferred: none in the module.
Found elsewhere: setup-words word() writes a key fill as String, so a nested key renders "[object Object]" (see REPORT to BOB, also sent).

Checks (civicos-process ebcc1a3 + tranche/T51 merged, run from the process repository)
- checks/run.mjs /home/user/bio: format 0 failures; architecture 0 failures; words: no finding in people (the repository-wide run lists failures in other modules, none in people).
- checks/ownership.mjs people tranche/T51 job/T51/people: 0 failures.
- checks/coverage.mjs people: 41 of 41 live requirement ids named by a test; 0 failures.
- checks/architecture.mjs people: 15 product files; 0 failures.
- setup-words build.mjs --check: rows.mjs stale (expected; BOB regenerates at the layer close).
- node --test test/m/people/*.test.mjs: 66 pass, 0 fail (after the merge too).

Rulings for BOB to record in build/rulings.md (P17): (a) hop reasons are {key, vars} per connection-grammar R6; (b) the composed stated-current reason carries the owner's sentence in its {why} fill; (c) the kind words read the label.identityclaimkinds rows.

Size (session_01Qbqab5EFYZCrkmKLgiPXzP): test runs 5, module lines 2241

## J6 · COMPLETE

COMPLETE again after CHANGE B4 (K3992). Merged tranche/T51 into job/T51/people (4c756b88c4) and pushed. No change to the module was needed: R40 as worded in K3992 matches the code (a hop's undetermined.why is {key, vars} with no why_key; the hub answer keeps its string why and why_key; lines.why.stated_current_through takes the owner's sentence as its {why} fill).

Checks after the merge (process repository, merged tree)
- checks/run.mjs /home/user/bio: format 0 failures; architecture 0 failures; no words finding in people (the repository-wide run lists other modules' findings only).
- checks/ownership.mjs people tranche/T51 job/T51/people: 0 failures.
- checks/coverage.mjs people: 41 of 41 live requirement ids named by a test; 0 failures.
- checks/architecture.mjs people: 0 failures.
- setup-words build.mjs --check: rows.mjs stale (expected; BOB regenerates at the layer close; the stale-rows note names no people word).
- node --test test/m/people/*.test.mjs: 66 pass, 0 fail.

Deferred: none. Requirements and tests unchanged since the first COMPLETE.

Size (session_01Qbqab5EFYZCrkmKLgiPXzP): test runs 7, module lines 2241

## J7 · COMPLETE

COMPLETE again after CHANGE B5 (K3998). Merged tranche/T51 (lines and events, CR-7 now in) into job/T51/people (7fe02ab582) and pushed. Their keyed reasons break nothing here: the module's tests pass unchanged, so no code or test change was needed.

Checks (process repository, merged tree)
- node --test test/m/people/*.test.mjs: 66 pass, 0 fail.
- checks/run.mjs /home/user/bio: format 0 failures; architecture 0 failures; no words finding in people (the one FAIL line naming "people" is strength's sentence, not this module).
- checks/ownership.mjs people tranche/T51 job/T51/people: 0 failures.
- checks/coverage.mjs people: 41 of 41 live requirement ids named by a test; 0 failures.
- checks/architecture.mjs people: 0 failures.

Deferred: none.

Size (session_01Qbqab5EFYZCrkmKLgiPXzP): test runs 8, module lines 2241

## J8 · COMPLETE

**Words round RW (K4015): people, complete.** Merged `tranche/T51` (efb5ff66a1) into `job/T51/people`; one finding, fixed (commit 3976b9f286).

Applied
- `bio-plane/src/people/index.mjs`:1252, the directory page's `detail` sentence was a `+` chain of two literals (the words check's `stitched` arm, read as one sentence). It is now one `localize("people.index.directory_follows", "<the same sentence, unchanged>")`, a single literal, with no wording change. No word-table row held the sentence, so none was matched; the id is new, and `rows.mjs` is stale for it (expected; BOB regenerates at the layer close). No test copied the sentence.

Checks (process repository e8ac153 for the checks; product `job/T51/people` at 3976b9f286)
- `node checks/words.mjs /home/user/bio people`: 0 failures (inline 0, plain 0, testcopy 0, missingkey 0, handlist 0).
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note for `people.index.directory_follows` only; no refusal naming people.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; channels 0 failures; coverage: people is not among the failing modules (the 26 coverage failures are other modules'); the words check run within it shows no finding in people.
- `node checks/ownership.mjs /home/user/bio people tranche/T51 job/T51/people`: 1 file changed by people, 0 failures.
- `node checks/architecture.mjs /home/user/bio people`: 0 failures. `node checks/format.mjs /home/user/bio`: 0 failures.
- `node --test test/m/people/*.test.mjs` run from `bio-plane/` (the module's tests live there): tests 66, pass 66, fail 0.

Deferred: none. Found in other modules: none new in this round.

Note for the record: the commit message for 3976b9f286 carries a Co-Authored-By line naming a model. That breaks the no-model-identifier rule for commits; the commit is already pushed, and I did not rewrite it (no force-push). Bob may want the line removed at the layer's merge.

Size (session_011qciUiMoVjk9Zn2kHVnzVS): test runs 3, module lines 2240

## J9 · COMPLETE

**FR-64 · people (I-32, DEC-384, K4214): claims and candidates serve organizations. COMPLETE.**

Entries applied
- `claimIdentity` (R1) accepts two distinct registered entities of one kind among `person`, `institution`, `body`, `movement` (`CLAIM_ENTITY_KINDS`). Any other kind (office, fund, source) stays `NOT_A_PERSON` naming the end; two ends of different kinds (person and organization, institution and body) are refused `KIND_MISMATCH` naming both kinds, writing nothing. The `name` basis's shared-name test is within the ends' own kind.
- `samePersonCandidates` (R7) proposes candidates of the entity's own kind (name fold and scheme identifier); a kind no claim joins is `NOT_A_PERSON`.
- `identityOf` and `personAt`'s `claims` (R5, R39) already answered any registered entity; now tested for an organization. Person facts (R9) stay persons' only (tested control). No op's fields changed, so `DECLARED_OPS` (R42) is unchanged.
- Requirements: R1 and R7 amended in `build/requirements/people.md` (Status line too); both already named by tests, so no *(not yet met)* marker.

Tests (new `orgclaims.test.mjs`, 4 tests naming R1/R7): an organization pair claimed `same_as`, read back through identity, the page's claims and candidates, then withdrawn; body and movement pairs; office refused; cross-kind refused KIND_MISMATCH writing nothing (control: same-kind claimed; candidates of person and institution never mix); person pair as before.
- `node --test test/m/people/*.test.mjs` (from bio-plane): tests 77, pass 77, fail 0.
- Users of people (retrieval, calculations, strength, answers, corpus-export, ratification, case-disclosures, case-authoring, consequences, scheduler, affordances, notice-producers, op-declarations, control-plane, plane, screens-investigate, explore, retrieval-browse): 2725 tests, 8 fail, all in screens/op-declarations tests (R73/R21 registryActGaps, R47, R46, R4, R36, R24, R17, R10), none touching a claim or candidate; I did not diff them against the tranche.
- Checks (process repo): format 0; architecture people 0; coverage people 42 of 42; words people 0 (two new sentences are `localize` ids `people.index.registered_no_claim_joins`, `people.index.claim_joins_one_kind`; rows.mjs stale for them, BOB regenerates); ownership 1 file, 0 failures; setup-words --check: stale-rows note only, none naming people.

Deferred: none. Found elsewhere: nothing new; screens-investigate (FR-29) can now fill the organization page from these reads.

Size (session_01VLYyVmHthCsTAnJoos37ea): test runs 6, module lines 2276

## J10 · COMPLETE

**Fix round 2, wave 1 · people: C7 met (R9 "An organisation's facts"). COMPLETE.**

Applied
- `recordPersonFact` (R9) takes an `institution`, `body` or `movement`: `name`, `address`, `contact` are recorded as for a person (R10 unchanged: an address or contact by a machine is `CONTACT_NOT_IMPORTED`, `publishable: false`); `birth`, `death`, `locality` are refused `NOT_A_PERSON` naming the entity, writing nothing (new `ORGANISATION_FACT_KINDS`; word `people.index.org_fact_kinds`, a new `localize` id, rows.mjs stale for it). Any other entity kind (office, fund, source) stays `NOT_A_PERSON`; an unknown kind stays `UNKNOWN_FACT_KIND`. The facts read back through `personAt` (`facts`, member = the organisation) and withdraw by R11; no op's fields changed, `DECLARED_OPS` unchanged.
- Requirement R9 in `build/requirements/people.md`: the *(not yet met: T51)* marker removed (a test now names it); Status line updated.
- Tests: new `orgfacts.test.mjs` (2 tests naming R9), seen failing first (`institution name` refused NOT_A_PERSON), controls: birth/death/locality refused with no row written; person's six kinds unchanged; office refused. `orgclaims.test.mjs`: its control now uses `birth` (a `name` fact is an organisation's now).

Runs
- `node --test test/m/people/*.test.mjs` (bio-plane): tests 79, pass 79, fail 0.
- Users of people (strength 173, control-plane 324, affordances 281, corpus-export 27, queue 206, scheduler 135: all pass; plane 279 pass, 1 fail, the same 1 fails on `tranche/T51`'s people, so not from this change). The impact list's 82 modules were not all run; the others do not touch facts.
- Checks: architecture people 0; coverage people 42 of 42; words people 0 findings; ownership: the one failure is `build/requirements/people.md`, the file K4210 has accepted at my merge; format: 1 failure, `build/rulings.md:4298` (K4301 states no standing-list decision), not mine.

Deferred: none. Found elsewhere: `build/rulings.md` K4301 lacks the standing-list line (format check fails on it); screens-investigate should draw the act on this merged code (same wave).

Note: an earlier commit on this branch (3976b9f286) carries a model-naming Co-Authored-By line; this round's commit has none.

Size (session_01ECyVAGFG2gSJzC9b78r7qH): test runs 8, module lines 1868

## J11 · REPORT

Fixture round 10, Wave A batch 3 (people): three fixtures published in bio-plane/test/m/people/fixtures.mjs, each checked by fixtures.test.mjs at the interface (R20, R22, R23, R24). Commit 0b2c72995a on job/T51/people.

Published, with the real answer each hands on:
- checkResults (R22, R24): { checkResults, listChecks }, the real people methods over an empty record. Shipped revolving-door check only, gated, no result shown; no viewer refused NO_VIEWER.
- evaluateChecksAnswers (R23): people.evaluateChecks; over the empty record the one person the test world registers: {ok, evaluated: 1, remaining: false}.
- tiesConcerningRefusal (R20): people.tiesConcerning with a bad argument (member named none): {ok: true, member: null, ties: []}. Decision for BOB: tiesConcerning has no refusal at all (it answers ok with an empty list for every argument), so the user's refusal branch (case-disclosures people.test.mjs:317, a reason "down") has no real answer to copy. The fixture gives the real answer and says so in its comment; the user re-points to it and tests its empty branch, or the refusal is raised as a product change (not mine).

Not published, needs BOB: moneyChecks.noticed (listed under this fixture by the plan, used by queue noticed.test.mjs:290). It is money-checks' real code. people does not declare money-checks in uses, and the architecture check would fail an import from people's tests. Best reading: money-checks publishes its own fixture from its own tests (a later money-checks job), and queue's re-point takes both halves from the two providers. The alternative is a uses change in build/modules.json (your file). Please decide.

Markers: none added (no fixtures-own, no fixtures-generic). Users of these fixtures are later in modules.json than people, so no fixtures-contract or fixtures-run markers are needed.

Lines of the list: the people fixture lines are done except the one FIX-E events line you named (why.test.mjs:110, op-table sequence; events' fixture, left for the CHANGE). checks/fixtures.mjs people: 1 failure, that line.
