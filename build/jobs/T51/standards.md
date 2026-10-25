# standards (T51)

**Status** · session_01AttFwdpMk7hg2XJoF6Y7AX · depth 2 · RUNNING until 2026-10-25T21:41:28Z (module tests standards, control-plane, plane) · handled B8

## J1 · COMPLETE

T51-204 · standards: the words check's findings are fixed (B1, layer 5 re-run, K3949, K3957, K3958).

**Entries applied**
- Inline (`words-pass/standards.md`, 6 lines):
  - `checks.mjs` STANDARD_PROPOSER_UNNAMED's translation reads its refusal row, `word('refusal.STANDARD_PROPOSER_UNNAMED')` (the row already holds the sentence; the table wins).
  - `index.mjs` proposal "stored with no captured text" sentence → `localize('standards.index.proposal_stored_no_text', …)`.
  - `index.mjs` cited-by refusal detail → `localize('standards.index.cited_by_names_where_cited', …)`.
  - `index.mjs` period_basis refusal "'s {side} is a held passage…" → `localize('standards.index.side_is_held_passage', …, { side })`.
- Plain (4 lines, each judged a sentence a member reads; none left unjudged, no REPORT needed):
  - `standards.index.no_source_matches_citation` (line ~302), `standards.index.sources_disagree_none_chosen` (~308), `standards.index.period_starts_after_captures` (~744), `standards.index.documents_cite_it_as_stated` (~1540).
- `localize` takes one string literal per call (setup-words build reads it), so each multi-line sentence is one literal on one line. Wording, codes, shapes and behaviour unchanged.
- Commit `4c43e67e3f` on `job/T51/standards`, pushed.

**Deferred:** nothing.

**Found in another module:** none in code I read for the job. Forward-looking note, not a current flaw: `index.mjs` `#eventDay` relays `events`' `when` reason with `String(w.why)`. Today events answers a string, so this is correct. When events' CR-7 makes that reason `{key, vars}`, this line must pass it through as given (not `String`), or the sentence reads "[object Object]". Mine to change then; noting it so CR-7's job knows.

**R48 tests (K3958).** `reads.test.mjs` "R48 neighbours…" and "R48 … registers once at load…" are green on this tree. They read civil-time's `why` as truthy only, which a `{key, vars}` satisfies. The relay of civil-time's `why` in R20 (`#versionAtPeriod`) already passes it through as given. No change needed there.

**Tests and checks run**
- `node --test test/m/standards/*.test.mjs` (bio-plane): before and after the edits, `tests 104, pass 104, fail 0`.
- `node checks/run.mjs /home/user/bio` (civicos-process): `format: 175 modules, 174 requirements files; 0 failures`; `architecture: 3617 product files, 12043 relative imports (36 naming no tracked file, not judged); 0 failures`; `channels: 2 participants, 1051 outbox commits read; 0 failures`. `coverage: 174 modules, 5929 of 6060 live requirement ids named by a test; 30 failures`, none in standards. The words check's totals are repo-wide (3791 failures in other modules; `standards` none, in `src/standards/` or `test/m/standards/`). The exit is 1 for those repo-wide failures, not from this module.
- `node bio-plane/src/setup-words/build.mjs --check`: a stale-rows note, expected (rows regenerate at layer close): `rows.mjs is stale: word 19608 (standards.index.cited_by_names_where_cited)`. Not a refusal. No refusal names `standards`.
- `node checks/ownership.mjs /home/user/bio standards tranche/T51 job/T51/standards`: `1 files changed by standards between tranche/T51 and job/T51/standards; 0 failures`.

**Attribution note:** the commit message omits the Co-Authored-By line naming the model (the Model identity rule forbids model identifiers in commits); the Claude-Session line is kept.

Size (session_01GMf4vYSoxxQorhQmm2FhQa): test runs 2, module lines 3570

## J2 · COMPLETE

K3992 (CHANGE B2) done: events' `when` reason is passed on as given.

- `index.mjs` `#eventDay`: a reason events gives as `{key, vars}` returns unchanged; a string reason still reads through `standards.why.event_record_read`. Same change in the bounds relay (`standards.bounds`), the override reason (`standards.why.overrides_portion_whether`) and the undetermined branch of `#versionAtPeriod`, where a keyed bound reason is returned as given (this also covers civil-time's keyed `why` in the overrides path, which `String()` would have stringified).
- Test added: `inforce.test.mjs` "K3992 a reason events gives as {key, vars} reaches inForceAt as given" (keyed reason returned by deepEqual; a plain string reason still matches its sentence).
- Commit `9994d2b84b`, pushed to `job/T51/standards`.

Tests: `node --test test/m/standards/*.test.mjs`: tests 105, pass 105, fail 0.
Checks (`node checks/run.mjs /home/user/bio`): format 0 failures; architecture 0 failures; channels 0 failures; coverage 30 failures, none in standards; words: no finding in `src/standards/` or `test/m/standards/` (repo-wide 3791 failures are other modules'). Ownership (`standards tranche/T51 job/T51/standards`): 3 files changed by standards, 0 failures. `setup-words --check`: the expected stale-rows note for `standards.index.cited_by_names_where_cited` only.

Size (session_01GMf4vYSoxxQorhQmm2FhQa): test runs 4, module lines 3570

## J3 · COMPLETE

K4015 (B3 START, the words round RW): the five findings `checks/words.mjs` lists for standards are fixed. The check now reads 0 findings in `src/standards/` and `test/m/standards/`.

**Entries applied**
- `checks.mjs` `STANDARD_SEARCH_MISSING` and `COPY_UNKNOWN` translations: `word('refusal.STANDARD_SEARCH_MISSING')` and `word('refusal.COPY_UNKNOWN')`. Both rows already hold the sentences in `rows.mjs` under those keys, so the table wins, as the other refusal translations in the file do.
- `index.mjs` `proposed force … moves no answer` (the `says` of a stored proposal): `localize('standards.index.proposed_force_moves_no_answer', …)`.
- `index.mjs` `force is read from the provision's own words` (the `note` of a standard's reads): `localize('standards.index.force_read_from_provision_words', …)`.
- `index.mjs` `VIEWER_MISSING` detail: `localize('standards.index.read_names_the_member_reading', …)`.
- Wording, codes, shapes and behaviour unchanged. Each sentence is one string literal on one line.

**Deferred:** nothing.

**Found in another module (not changed here):**
- `law-relations` `src/law-relations/checks.mjs:52` (`[copy]` "A relation joins two different standards or portions, and both ends…"): an inline sentence in law-relations' own code, for its job.
- `affordances` `test/m/affordances/catalogue.test.mjs:411` and `t33.test.mjs:89`, and `op-grades` `test/m/op-grades/pins.test.mjs:176`: hand-lists of `standards`' ops (`standard`, `standards`, `inforceat`, `standardsfor` and others) in other modules' tests. K3268 says such a list is assembled from its own module's declaration. Reporting to BOB.

**Tree merged:** `tranche/T51` (21f27ab166) merged into the branch at `7d6b69a738`; no rebase, no reset.

**Tests and checks** (after the merge):
- `node --test test/m/standards/*.test.mjs` (bio-plane): `tests 105, pass 105, fail 0`.
- `node checks/words.mjs /home/user/bio standards`: `words: 1 modules, 5312 string literals read, 15438 words; inline 0, plain 0, testcopy 0, missingkey 0 … 0 failures`. Before the fix it was 5 failures, all inline `[copy]`.
- `node checks/run.mjs /home/user/bio` (civicos-process): `format: 176 modules, 175 requirements files; 0 failures`; `architecture: 3644 product files, 12278 relative imports (36 naming no tracked file, not judged); 0 failures`; `channels: 2 participants, 1074 outbox commits read; 0 failures`; `coverage: 175 modules, 5941 of 6062 live requirement ids named by a test; 22 failures`, none in `standards`; `words` repo-wide 1625 failures, none in `standards` (the other modules' findings are the ones named above and their own jobs' work). Exit 1 is from those repo-wide failures.
- `node checks/architecture.mjs /home/user/bio standards`: `23 product files … 0 failures`. `node checks/format.mjs`: `0 failures`.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only, expected: `rows.mjs is stale: word 21291 (standards.index.force_read_from_provision_words)`. No refusal names `standards`.
- `node checks/ownership.mjs /home/user/bio standards tranche/T51 job/T51/standards`: `3 files changed by standards between tranche/T51 and job/T51/standards; 0 failures`.

**Notes for BOB**
- The three new `localize` ids (`standards.index.proposed_force_moves_no_answer`, `standards.index.force_read_from_provision_words`, `standards.index.read_names_the_member_reading`) have no `words.json` row yet. They read their English from code until the design gives them rows (K3944), as J1's ids do.
- Commit message: I kept the Claude-Session line and left out the Co-Authored-By model line, because the process rules say no model identifier goes in a commit.

Size (session_0156GUxDJmfWv8jdceqhcys5): test runs 3, module lines 3563

## Fix round 10, Wave A batch 1 (B4) · session_01SABp1mbexAxC9AfGM6BDu6

**Causes done:** six fixtures published and one contract run, in `bio-plane/test/m/standards/fixtures.mjs` (new) with `fixtures.test.mjs` (new). Every fixture is made by the real `standardsOf` over the real record, membership, content and entities each time it is called; nothing is stored.
- `bindsAt` → `{standard, body, elsewhere, date, binds, other}`: the real R43 answers. The real answer is `{ok, standard, body, date, state, why, rests_on, says}`, not `{ok, standard, body, binds}`: the user (duties) changes to read `state === "binds"`.
- `standardRead` → `{id, contentId, absentId, read, absent, unseen}`: R5 with designation, edition, access, requires and texts; NO_SUCH_STANDARD for an absent id and for a viewer naming no member (R17).
- `standardReadWorld` → the real instance with `policy(over)`, `declare`, `passage`, `standardRead`, and the viewers `member` and `stranger`.
- `standardRow` → `{std, cnt, ordinance, row, standards}`: one held policy's R5 read and the `standardsIn` list of two; the STD and CNT ids are the real minted ones.
- `standardsEmptyReads` → the real `standardsAt`, `standardsWithPortion`, `addressesOf` over an empty record.
- `standardsIn` → the real `{ok, items: [], count: 0, limit, truncated: false, cursor: null}`.
- Contract `host-refusals`: the ten refusals stated as data in `fixtures.test.mjs` ("R10 R17 R23 host-refusals…"), each run through law ops on the real instance; marker `// fixtures-run: law-relations host-refusals`.

**Where the real answer differs from the users' hand-built ones (the real wins; each user changes in its own job):**
- law-relations `hostRefusal` adds `host: true`; the real refusals have none, and carry `check` and `translation`. Their extras differ: NO_REASON has `{max_chars: 2000}` (not `fault`), WHY_INVALID `{max: 240}`, NO_SUCH_STANDARD `{standard, id, end}`, FIELD_UNKNOWN `{rejected, accepted}`, NO_ID `{op}`, DATE_INVALID `{date}`, NO_SUCH_PROPOSAL `{proposal}`, PROPOSAL_ADOPTED `{proposal, adopted_as}`, PORTION_UNKNOWN `{end, standard, portion}`, PROPOSER_UNNAMED none.
- duties' `bindsAt` Proxy answer (see above). reevaluation's and following's empty reads: the real `standardsAt`/`standardsWithPortion` give `{ok, items, truncated}`; `addressesOf` gives `{ok, addresses, truncated}`-shaped (checked: `addresses` is `[]`, `truncated` false); `standardsIn` also carries `count`, `limit`, `cursor`.

**Markers added:** no `fixtures-own` and no `fixtures-generic`. One `fixtures-run` (law-relations host-refusals), `orphan-run` until law-relations' marker merges; it waits for law-relations.

**Fixtures check** (`checks/fixtures.mjs . standards --list`): zero lines for standards. **Tests:** `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/standards/*.test.mjs`: tests 117, pass 117, fail 0. **Checks:** format 0 failures; architecture 0 failures; coverage 53 of 53 ids, 0 failures; words (standards) 0 failures; ownership 0 failures. `impact.mjs origin/tranche/T51 HEAD`: standards only (affected modules 1 of 178); no other module's tests are affected, since no source changed.

Size (session_01SABp1mbexAxC9AfGM6BDu6): test runs 4, module lines 3563

## J4 · COMPLETE

Fix round 10, Wave A batch 1 done (commit on job/T51/standards). Six fixtures published in bio-plane/test/m/standards/fixtures.mjs (bindsAt, standardRead, standardReadWorld, standardRow, standardsEmptyReads, standardsIn), each made by the real standardsOf at test time; host-refusals contract run (marker fixtures-run: law-relations host-refusals, orphan-run until law-relations' marker merges). No fixtures-own or fixtures-generic markers added. Real answers differ from users' hand-built ones (host:true absent; NO_REASON max_chars, WHY_INVALID max, bindsAt returns state not binds): listed in my record. Tests 117/117; format, architecture, coverage, words, fixtures (standards lines 0), ownership all 0 failures; impact: standards only. Record: build/jobs/T51/standards.md.

## Fix round 10, the final pass's causes (B5) · session_01BGmyopxvDtf9nKPbPea8fa

**Met ids (BOB strikes the marks):** R41 (K5148 clause: a capture's actor names a member spelled `member:<id>` or bare), R45 (K5148 clause: no `member:` stamp inside a `why` or `says`).

**1. "Not public" held by no one (diag2-08 C10, R41).** `#memberCaptured` now strips a leading `member:`, requires a non-empty id, and refuses when either spelling is a machine identity. Test `t35.test.mjs` "R41 K5148 …": bare id and `member:<id>` accepted for `paywalled` and `reading_room`; `system`, `token:ingest`, `member:` and empty refused `TEXT_NOT_MEMBER_CAPTURED`. Seen red (bare id refused) before the fix, green after.
*Why the tests missed it:* the fixture's capture stand-in was only ever told `V("bob")` (`member:bob`), never the bare handle the real capture records. The stand-in keeps the real `captureAccountsOf` shape (`{actor, at}`); capture publishes no actors fixture, so the stand-in stays, now fed both spellings. A through-the-door case is control-plane's: REPORT for BOB to place.

**2. Raw stamp in a member sentence (R45, R70.12).** `#throughOf` passes the author to `standard.inforce.known` without `member:`, so a `why` reads "recorded by bob". Test `t50.test.mjs` "R45 K5148 …": no `member:` in `inForceAt`'s `why` or the record's `says`; the member is named. Seen red, then green. Three existing tests (t36, t37, t50) that built the expected sentence with `V("bob")` now pass `"bob"`.
*Why the tests missed it:* they built the expected sentence from the same stamped value the code passed, so the stamp matched itself.
*Note for BOB / design:* the row `standard.inforce.known` names its var `{author}`, not `{member}` as R45's amendment says; I cannot edit `rows.mjs`/`words.json`. The value is now the bare member, so the sentence is right; renaming the var is the design stream's. The screen (`standard.mjs:97`, `P.why`) draws the string as given; no change needed there now.

**Tests and checks:** `node --import ./bio-plane/test/platform-sqlite.mjs --test bio-plane/test/m/standards/*.test.mjs`: tests 119, pass 119, fail 0. format 0 failures; architecture (standards) 0; coverage 53 of 53, 0; words 0; ownership (standards, tranche/T51, job/T51/standards) see push; fixtures `--list`: only the known `orphan-run` (`fixtures.test.mjs:83`, waits for law-relations' marker). No marker added. `setup-words --check` refuses on `plane.declared.readtranslate` (plane module, not standards).

Size (session_01BGmyopxvDtf9nKPbPea8fa): test runs 4, module lines 3567

## J5 · COMPLETE · re B5

B5 done: cause 1 (#memberCaptured accepts a bare id or member:<id>, never a machine identity) and cause 2 (the in-force why names the member without a member: stamp) fixed, each test seen red then green. Met ids: R41, R45. Tests 119/119; format, architecture, coverage, words, ownership 0; fixtures only the known orphan-run. Notes: the row standard.inforce.known names its var {author}, not {member} (design's to rename); the door case for a bare-id upload is control-plane's, for BOB to place; setup-words --check refuses on plane.declared.readtranslate (plane, not mine). Record: build/jobs/T51/standards.md.

## Fix round 10, R7 known_through (B6) · session_017cwPRYtTMcVjGxduRoTLMb

## J6 · COMPLETE · re B6

T51 · standards #20 · K5178 (SCREENS-INVESTIGATE #16 J28 (2)).

**What changed** (`bio-plane/src/standards/index.mjs`)
- `#throughOf` (~1375) also answers `ref: {through, source: {captureSha, extent}, by}`, the R50 record's own fields (`by` as the record stores it, `member:<id>`, the same as `inForceThroughOf`'s `by`).
- `#versionAtPeriod` (~1325-1365) sets `restsOnRecord` when R51's record decides the state (`validAt` `in` over `{from, to: through}`) and returns `known_through: ref` only while the final state is `in_force`; the existing record object stays as `in_force_through` (unchanged, as before).
- `#versionAt` (~1254) is now a wrapper over `#versionAtState`: where R38's version basis or an override moves the state off `in_force`, `known_through` is dropped. A stated end, the day after `through`, codifier lag and a withdrawn record all leave none.
- `inForceAt` (~1393, ~1409), both the standard and the key paths, and `inForce` (~1190, R7's alias) carry `known_through` beside `why` (unchanged).
- `fixtures.mjs`: new export `inForceKnown` (made by the real act and the real reads); tested in `fixtures.test.mjs`.

**Failing-first test:** `bio-plane/test/m/standards/known-through.test.mjs` (R7 R20): an R50 record made by the real act, then `standardinforce` (through `standardsOps`), `inForce` and `inForceAt`; red on the earlier code (`R7's alias: actual undefined`), green now. Controls: no record, the day after `through`, a stated end, a withdrawn record, codifier lag: none carries `known_through`. Why the tests missed it: they asserted `why`'s text, never what a screen needs to draw it.

**Met ids (BOB strikes the mark):** R7.

**Suite counts:** `bio-plane/test/m/standards/`: 122 tests, 0 failures. Users run: filings 165/0, action-plans 105/0, affordances 289/0, conformance 125 tests / 1 failure, screens-investigate 249 / 1 failure (both pre-existing, below); control-plane and plane: see the line below.

**Found in other modules (REPORT):**
- conformance `bio-plane/test/m/conformance/t36.test.mjs:58`: expects R3's `why` to read "recorded by member:olive"; the module's sentence (`standard.inforce.known`, author drawn without the stamp, R45 amended K5148) reads "recorded by olive". Fails identically on the tranche code without my change. The test needs the bare id.
- screens-investigate "R4 C8 (the figure) Money, the real plane: a figure read in with its period's dates…": fails identically without my change (a money/period case, outside standards).

**Checks** (absolute root `/home/user/bio`): format 0 failures; architecture (standards) 0; coverage (standards) 53 of 53, 0; ownership 0; `checks/run.mjs`: no finding in my files, words count unchanged (I added no sentence); `fixtures.mjs standards --list`: one line, `contract law-relations bio-plane/test/m/standards/fixtures.test.mjs:83 orphan-run` (the allowed one, waits for law-relations' marker merge). No `fixtures-own` or `fixtures-generic` marker added.

**Deferred:** nothing.

## Saved at K5183

Done: the whole change of J6 above (index.mjs `known_through`, `known-through.test.mjs`, `inForceKnown` fixture and its test), committed; module tests 122/0; filings, action-plans, affordances green; format, architecture, coverage, ownership 0. J6's COMPLETE is NOT posted.
Half done: the control-plane and plane test runs were stopped unfinished; no result.
Next step: run `bio-plane/test/m/control-plane/` and `bio-plane/test/m/plane/` (`node --import ./bio-plane/test/platform-sqlite.mjs --test <dir>`), add their counts to J6's "Suite counts" and a `Size (<session id>): test runs <n>, module lines <n>` line, commit, push, `mail state --set COMPLETE`, `mail post --as job --kind COMPLETE`, ring BOB. Also REPORT to BOB the conformance `t36.test.mjs:58` stale "member:olive" expectation (in J6). No workers to stop.
