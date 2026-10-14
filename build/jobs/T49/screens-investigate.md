# screens-investigate (T49)

**Status** · session_016pXDF9DWaZT1NX5gzoCeit · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

QUESTION (J1): five keyed sentences the design reworded in place (DEC-259) take placeholders no op supplies. My best reading is below; I carry on with it.

1. `screen.calculation.counts` ({visited} {n} {yes} {no} {unsure} {answer}) and `.range` ({judged} {answer}): `{answer}` is the word the draw's question is answered with ("closed"); `spotcheck` answers only free text in `question`. Best reading: `{answer}` = the keyed `screen.calculation.standing.yes` word, lower-cased by code; `{visited}` = n minus `not_visited`.
2. `screen.calculation.notsays` ({size} {whose} {item} {outside} {items} {what}): six words about the subject of one particular draw; none is answered. Best reading: the screen draws `screen.help.notsays.p` (the same meaning, no placeholders) in its place, and does not read `notsays`.
3. `screen.due-date.of` ({who}'s reply to your {item}): `{item}` = the action's kind. Best reading: the keyed `screen.start-send.kind.<kind>` word when the key exists; the sentence is not drawn for a kind with no key.
4. `screen.due-date.step.counted` adds `{date}`: best reading `{date}` = the proposal's `date`; drops `{count}`.
5. `screen.ties.either` lost `{handle}`: filled without it (no question).
If you rule otherwise (e.g. the design lane adds structured fields or generic keys), tell me; I will bring the screens in line.

## Completion (SCREENS-INVESTIGATE #3, T49-26)

**Read.** Requirements, entries, layer contract, all module source (14 files, whole) and the tests that name a requirement I changed (explore, graph, fold, common, fixtures, proceeding, person, people, money, calculation, due-date, standard, ties, timeline: each whole); `words-reads.json`'s entry for this module and `words.json`'s keys for it. Used services read: `following` R30 (`proceedingdates`' answer), `affordances` R59/R60 (not merged at my START: the vocabulary I draw from is the fixture, `group: "step_source"`; a `step_source` kind is drawn in its own class even where the vocabulary answers another group), `interface-shell`'s `cs.state`/`cs.sec`/`cs.w` (escaping).

**Measured.** Module 2,086 lines at COMPLETE (2,559 at START: the 658 English rows and `row.mjs`, `words.mjs` went; R27–R29 and the helpers came).

**Entries applied.**
- **R30 words by key.** `SCREEN_WORDS`, `words.mjs`, `row.mjs` and every `*_WORDS` row set are gone; each screen's `words` lists keys only (862 distinct, all in `words.json`); nothing but keys is exported. The two inline English strings the entry marks keyed are read by key (`file.chain.*`, `file.recheck.chain*` through `PARTS.plain`, which undoes `cs.w`'s HTML escape for text written to a record or a request; `screen.timeline.method.member`; `screen.money.check.note`). `act.connectionassert.label.explore` is now `act.stepsource.label.explore`. The 2 `unkeyed` headings stay. Every test that compared a sentence's English now compares `word(key, vars)`; tests assert keys with `hasWord` (common R30).
- **R27.** `explore` offers six groups (the sixth `step_source`, "Stated in a source"); the graph draws `.e-step_source`, names it in the legend (`connection.kind.step_source.name`/`.means`, both in `GRAPH_SHARED`).
- **R28.** `proceeding` draws "Dates" from `proceedingdates`: today's stage, two lanes (`section[data-lane]`, `mk-lanehead`), each date by `cs.date` (`PARTS.when`, moved out of `timeline`), `proceeding.dates.none` over nothing, nothing drawn as late.
- **R29.** `explore` with no centre draws `screen.explore.nocentre` and reads no graph.
- **R10's red** (K3321 (B)): cleared; see REPORT J2 for the registry acts it exposed.
- **Rule 6:** words by key (above); N1068 (no "labelled" in my words or tests; two in comments/titles left as they are code prose, none a member-facing sentence); `admin` grep: none; N1073: `common.test.mjs`'s hand list of ops is gone, the reads are those the page is seen to send; D29: a read answering `ok` with `refused` is drawn as a refusal (people's search fixed, graph and spot-check read covered by test).

**Flaws found and fixed in this module (P8).** People's search treated `{ok: true, refused}` as success (D29). `PARTS.month` was dead after `PARTS.when`; `graphKeys` and `graphRows` were dead. Money's "The expertise asked for" field carried an English default, "municipal budget": removed (no key holds it); the member names the expertise (the act refuses an empty one).

**Deferred / for BOB (also J2).**
1. The design reworded five sentences with placeholders no op supplies (J1). As built: `screen.calculation.range` is drawn with `{answer}` = the keyed "Yes", lower-cased; `.counts` is not drawn (its one sentence prints zero counts, which R22 forbids), the parts are drawn by `counts.yes/no/unsure/disagree/notvisited`; `.notsays` is replaced by `screen.help.notsays.p`; `due-date.of` only for the two request kinds keyed in `screen.start-send.kind.*`; `step.counted` takes `{date}` = the proposal's date. The trace's `amount`/`units` are read as before (the proposals fixture carries them; I did not verify the real trace carries them).
2. A key is owed for the expertise default ("municipal budget") and, from the design lane, the fields J1 lists.
3. Registry acts added by PR #36 that no requirement or T49 entry places on these screens: `person`: entityalias, relationdeclare, resolve, resolvetestify, connect, writinghelp; `timeline`: instance, thread, discharge, proposedispose, progression, progressiondefine. `common.test.mjs` pins them as `UNPLACED` (they must stay undrawn here, every other registry act must be drawn), so R10 is red-free; BOB places them (an entry per owner) or tells me to draw them.
4. Another module: `interface-shell` R21/R5 still describes a screen's `words` as possibly `[key, en, protected]` rows (`wordsOf` takes both); with R70 only keys arrive. Not stale for correctness.
5. `affordances` R60 (the `step_source` group) was not merged at START; R27's group test runs on the fixture and needs R60's vocabulary on the composed plane.

**Tests and checks.** The committed tree imports `word` and `hasWord` from `setup-words` (R11, R12), which has not merged: until then these tests do not load. I ran them against a local, uncommitted stand-in of those two functions over `words.json` (never committed, reverted): `node --test bio-plane/test/m/screens-investigate/`: 108 tests (one file of 17 with the D29 test), 0 fail. `node checks/format.mjs`: 0 failures. `node checks/architecture.mjs`: 27 product files, 0 failures. `node checks/coverage.mjs`: 30 of 30 live requirement ids named, 0 failures. `node checks/ownership.mjs`: 0 failures. Other modules' tests: none use a service I changed (this module provides screens only); `control-plane/t46-app.test.mjs` imports `SCREENS` only. After setup-words merges, merge `tranche/T49` and re-run this module's tests (CHANGE).

Size (session_016pXDF9DWaZT1NX5gzoCeit): test runs 40, module lines 2086

## J2 · REPORT

REPORT (J2), full text in my record's Completion section. For BOB:
1. R10's red was the registry: PR #36 added to `person` entityalias, relationdeclare, resolve, resolvetestify, connect, writinghelp and to `timeline` instance, thread, discharge, proposedispose, progression, progressiondefine. No requirement of mine or T49 entry places them (R1 and R3 name six acts each). My R10 test pins them as unplaced (still undrawn; every other registry act must be drawn). Please place them or tell me to draw them.
2. J1, as built: `counts` is NOT drawn (its sentence prints zero counts, which R22 forbids); the parts are drawn by `counts.yes/no/unsure/disagree/notvisited`. `range` is drawn with `{answer}` = lower-cased "Yes". `notsays` -> `screen.help.notsays.p`. These need the design lane's answer (structured words per draw).
3. Money's expertise field carried the English default "municipal budget": removed, since no key holds it. A key is owed if the default is wanted.
4. `affordances` R60 was not merged at my START; R27's group test runs on the fixture.
5. setup-words has not merged: this module's tests import `word`/`hasWord` and load only after it does (I ran them on a local stand-in: 108 pass).

## J3 · COMPLETE

COMPLETE (J3). T49-26 applied: R27 (six groups, `.e-step_source`), R28 (proceeding "Dates", two lanes), R29 (explore with no centre), R30 (words by key; no English in the module or its tests), R10's red cleared, rule 6 (D29, N1073's hand list, N1068, `admin`). Checks from the process repository: format 0 failures, architecture 0 failures (whole product too), coverage 30 of 30 ids named, ownership 0 failures. Tests: 108 pass on a local stand-in for setup-words' `word`/`hasWord`; on the committed tree they load only after setup-words merges (then merge `tranche/T49` and I re-run: send a CHANGE). Details, deferred items and the REPORT in my record.

## After CHANGE B3/B4 (real setup-words, DEC-259–DEC-261 words)
Merged `tranche/T49`; 109 tests pass against the real setup-words. New placeholders met: `screen.money.didnotmove` `{date}` (read as the figure's period start: the data holds no adoption date), `screen.timeline.order.evidence` `{examples}` (the event's keyed kind word). The shell now words known refusal codes itself, so the tie-refusal test uses an unknown code. Both fills are guesses for BOB/the design lane (REPORT J4).
Size (session_016pXDF9DWaZT1NX5gzoCeit): test runs 44, module lines 2087

## J4 · COMPLETE

COMPLETE (J4) after CHANGE B3/B4: merged tranche/T49, 109 tests pass on the real setup-words; format, architecture, coverage (30/30), ownership 0 failures. Two fills are guesses for you or the design lane: screen.money.didnotmove {date} (no adoption date in the data; I use the figure's period start) and screen.timeline.order.evidence {examples} (the event's keyed kind word).
