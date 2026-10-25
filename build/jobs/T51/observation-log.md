# observation-log (T51)

**Status** · session_01NWeJdk2kVHeYkijVPMg5d9 · depth 2 · WORKING · handled B5

## J1 · COMPLETE

Entries applied (BOB B1, T51-34): both stale comments in `bio-plane/src/observation-log/vocabulary.mjs` restated for the code as it is, no behaviour change.
- Line 59 (the LEAD_LOOK_OUTCOMES naming note) named `civicos-ui/check-semantics.mjs`, a checker deleted in T20. It now states the rule without naming the file.
- Line 261 (the REC-94 spawn measurement) named `civicos-ui/` and `agent-worker/`. `civicos-ui/` is deleted by T51-126. It now says "the product's source, checks and tests".

Deferred: none.

Found in other modules (not changed; for BOB): `node checks/run.mjs` shows coverage failures outside this module: agent-harness R17; agent-runner R36 R37 R38 R40; agent-steps (all 49 ids); agent-worker R119; basis-versions R55; case-grammar R33; entities R57-R61; explore R26; journey-check R19; people R40 R41; progressions R46; retrieval-browse (all 18 ids); retrieval R87 R89 R90. Architecture is 0 failures.

Tests and checks (this module):
- `node --test test/m/observation-log/` (bio-plane): 78 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 174 modules, 172 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio observation-log`: 0 failures.
- `node checks/coverage.mjs /home/user/bio observation-log`: 38 of 38 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio observation-log tranche/T51 job/T51/observation-log`: 1 file changed by observation-log; 0 failures.
- `node checks/run.mjs /home/user/bio`: architecture 0 failures (the coverage failures listed above are other modules').

Reading: the requirements (whole), the T51-34 plan entry, the BOB START, and `vocabulary.mjs` (whole). `index.mjs`, `checks.mjs` and `schema.mjs` were searched for stale names, not read whole; the change does not touch them.

Commit 9b6fd6e936 on job/T51/observation-log.

Size (session_018EFM1gtb8uU1diGsNZYq71): test runs 1, module lines 3290

## J2 · REPORT

Words after T51-200 (observation-log): items for the design stream (K3944). The conversion is in commit 37ccba91f7; nothing below changed a member's text.

1. Wire-grammar hints, kept as they were (not converted). Each names a caller's parameter and reads as usage, not as prose. Each is the detail of a refusal for a missing parameter:
   - `pass lead=<LEAD-…>: the id op=lead returned` (index.mjs, leadFor)
   - `pass project=<PROJ-…>: the project to share this lead to` (index.mjs, leadShare)
   - `pass reason=<your words>: why this lead is disclosed to {pid}` (index.mjs, leadShare; part English)
   - `pass detail=<your words>: where you looked and what you found` (index.mjs, leadLook)
   If the design reads refusal details as member text, these four convert.

2. Developer text, kept: the thrown Error messages (`observation-log: … was refused …`, `record-core refused its table declaration`, `provenance refused its testimony registration`), SQL, and the `(via …)` machine token in a stored detail.

3. Design rows whose words differ from the code's words. The code's text is kept under a new id, so the output does not change. Which text is the member's is the design's call:
   - observation-log.lead_list_note: row says "never looked"; code says "NEVER_LOOKED" (observation-log.index.lead_list_note)
   - observation-log.never_followed: row says "This is never looked"; code says "This is NEVER_LOOKED" (observation-log.vocabulary.frontier_never_followed)
   - observation-log.address: row says "normalized"; code says "normalised" (observation-log.vocabulary.subject_address)
   - observation-log.says.undetermined_derivation_over: row says "The log stores whole seconds"; code says "`observation_log.at` stores whole seconds" (observation-log.vocabulary.derived_watermark_band)
   - observation-log.capture_session_ttl_expiring: row drops "(CAPTURE-SCALING)" (observation-log.vocabulary.condition_capture_session_ttl_expiring)
   - observation-log.why.capture_content_level: row ends ": {cause}"; code names OBSERVATION-LOG-DESIGN.md section 5.1 before the cause (observation-log.vocabulary.capture_no_content_row)
   - observation-log.why.reading_persisted_capture_reader: row drops "(section 5.1)" (observation-log.vocabulary.no_reader_run_recorded)
   - observation-log.partial.looked_got_part: row drops the parenthetical "(SWH's crawl status; CPDF-5's measured 88% case)" that the code keeps (observation-log.vocabulary.state_partial). OBSERVATION_STATE_WORDS strips that note either way.
   The design rows also drop developer notes such as "(S-7)" and "(D-104)" from condition sentences, where the code keeps them. Whether those notes stay in member text is a design question.

4. Tests. The words rule binds tests, so two tests no longer hold a sentence:
   - test/m/observation-log/registrations.test.mjs imports AUTHORED_EXTRACTION_DETAIL, a new export of index.mjs (R30's detail), instead of copying it.
   - test/m/observation-log/vocabulary.test.mjs (R36, render-deferred) asserts the opening "a render your team's" and the ending "conditionsRenderDeferred" instead of the whole sentence. R36's exact-wording pin is weaker until a words.json row exists for observation-log.vocabulary.condition_render_deferred; if the design adds that row, the test can pin it with hasWord.

5. rows.mjs is stale for the 70 new ids (`setup-words/build.mjs --check` says so, as B2 expects). BOB regenerates it at the layer close.

## J3 · COMPLETE

Entries applied (BOB B2, T51-200): every sentence this module shows a member goes through `word(key)` or `localize(id, en, vars)`.
- The words check's findings for this module are all fixed: 7 inline (sentences filled from a template) and 41 plain. `node checks/words.mjs /home/user/bio observation-log` reads 0 failures (it read inline 0, plain 0, testcopy 0).
- Beyond the findings, I converted the sentences the check does not count, as R13 binds (punctuated sentences, refusal details, the sentences stored in a log row's detail): about 70 new localize ids, plus word() for the sentences whose words.json row is identical to the code's text.
- Text is unchanged character for character. A differential run of the old and new vocabulary over 878,457 input combinations compared equal (exports, causesNotRuledOut, contentAxisFor, checkObservation, contentObservationsFor, readerRunObservation, resolutionObservation, derivationObservation, derivationStatement, observationCoverage). It caught one row that differed and I reverted that one. The index-side texts were checked by reading the diff.
- Where a words.json row differs from the code's text, the code's text is kept under a new id. Those rows, and the wire hints I left as they are, are in the REPORT for BOB (K3944).
- Two tests no longer hold a sentence (the REPORT item 4).
- Deferred: none in this module.

Found in other modules (not changed): nothing specific. The full `node checks/run.mjs /home/user/bio` run shows 3,728 words failures and 30 coverage failures in other modules; none names observation-log.

Commits on job/T51/observation-log: 37ccba91f7 (the conversion), f6c5cef3ae (the merge of tranche/T51 at 940517d41e). Pushed.

Tests: `node --test test/m/observation-log/` (bio-plane): 78 pass, 0 fail, before and after the merge.
Checks:
- `node checks/format.mjs /home/user/bio`: 175 modules, 174 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio observation-log`: 0 failures.
- `node checks/coverage.mjs /home/user/bio observation-log`: 38 of 38 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio observation-log tranche/T51 job/T51/observation-log`: 5 files changed by observation-log; 0 failures.
- `node checks/words.mjs /home/user/bio observation-log`: 0 failures.
- `node checks/run.mjs /home/user/bio`: architecture 0 failures; no observation-log line in its output.
- `node bio-plane/src/setup-words/build.mjs --check`: rows.mjs stale for the new ids (expected; BOB regenerates at the layer close); no refusal names this module.

Reading: the requirements (whole), T51-200 and BOB's B2 notes, the words-pass findings, and my own code (index.mjs, vocabulary.mjs, checks.mjs and schema.mjs, whole; schema.mjs was not changed).

Size (session_017p9yDiKdDPqfnyWK37NQsk): test runs 2, module lines 3105

## J4 · COMPLETE

B3 done: the CHANGE (K3994) is applied in ecb70f9274 and pushed to job/T51/observation-log. This entry replaces J3's text where they differ.

Changed member text (each sentence the design's row now supplies; the row text is what members read):
- Eight design rows, as B3 names them, with word(key); the code-side ids are deleted:
  - observation-log.lead_list_note (LEAD_LIST_NOTE): "...(never looked when nobody has followed it)..." (was "NEVER_LOOKED")
  - observation-log.never_followed (the internet frontier's never_followed cause): "This is never looked, established rather than inferred" (was "This is NEVER_LOOKED")
  - observation-log.address (subject kind address): "...in its normalized form" (was "normalised")
  - observation-log.says.undetermined_derivation_over (the watermark band's derivation statement): "The log stores whole seconds" (was "`observation_log.at` stores whole seconds")
  - observation-log.capture_session_ttl_expiring (condition): "a capture session is expiring with work outstanding" (dropped "(CAPTURE-SCALING)")
  - observation-log.why.capture_content_level (the content level's undetermined reason): dropped "(OBSERVATION-LOG-DESIGN.md section 5.1)"
  - observation-log.why.reading_persisted_capture_reader (no reader run): dropped "(section 5.1)"
  - observation-log.partial.looked_got_part (state partial): "we looked and got part of it" (dropped "(SWH's crawl status; CPDF-5's measured 88% case)"); the derived state word is unchanged, since it strips that note either way.
- Four state words, which I matched to the refusal rows: they differ only in capital letter and final stop, so I took the design's words as B3 asks. Tell me if you would rather keep the code's form.
  - state NEVER_LOOKED: "Nobody looked at this level for this subject." (refusal.NEVER_LOOKED)
  - state LOOKED_ABSENT: "We looked and it is positively not there." (refusal.LOOKED_ABSENT)
  - state LOOKED_INDETERMINATE: "We looked and could not tell." (refusal.LOOKED_INDETERMINATE)
  - state PRESENT: "We looked and it is there." (refusal.PRESENT)
- The four pass hints keep their text (localize, same words): pass lead=…, pass project=…, pass reason=… (with {pid}), pass detail=….
- Not changed: governor-holding-host's sentence. words.json row machinery-producers.summary.pacing_holding_captures reads "our own pacing is holding {host}: captures from it are PACED, not broken", which is a different sentence from the code's "the per-host governor is holding a host: the capture is PACED, not broken (D-103)". Its words differ, so I kept the code's text under observation-log.vocabulary.condition_governor_holding_host. Decide whether it is the same sentence.
- Not changed: the other condition sentences. I searched words.json for each (for example "(S-7)", "(D-104)", "recheck", "archive fallback") and found no row, so they stay as localize. Only capture-session-ttl matched.
- Noticed, not mine, not changed: observation-log.index.who_s_lead_is_recorded (a localize that predates this job) and the design row observation-log.says.lead_recorded_somewhere share most words; the code says "recorded with op=leadlook" where the row says "recorded as a look against it". Developer wording in member text; for the design stream.

R36 (B3 item 3): test/m/observation-log/vocabulary.test.mjs now asserts CONDITION_KINDS["render-deferred"] equals RENDER_DEFERRED_CONDITION, which the module exports from its own localize call. Holding the sentence in the test would fail the testcopy check, so the test compares with the product's call rather than a copy of its text. The prefix and suffix checks are gone.

Tests after the change: `node --test test/m/observation-log/` (bio-plane): 78 pass, 0 fail.
Checks after the change: format 0 failures; architecture 0 failures; coverage 38 of 38 ids named, 0 failures; ownership 5 files, 0 failures; words 0 failures for observation-log. setup-words --check still reports rows.mjs stale for the new ids (expected; BOB regenerates at the layer close).

Commits on job/T51/observation-log: 37ccba91f7 (the conversion), f6c5cef3ae (merge of tranche/T51 at 940517d41e), ecb70f9274 (B3). Pushed.

Size (session_017p9yDiKdDPqfnyWK37NQsk): test runs 4, module lines 3105

## J5 · QUESTION

B4 asks for a new read op=leads, but op=leadlist already is that read (R20, since D-681): the leads the viewer may read by leadReach (the same reach leadread applies), each once, newest first, with lead_id, author, words, locator, at, latest state, looked_at, looks, bounded by limit (default/max constants) with truncated, and an empty-answer for a viewer who reaches none. It is routed in observationLogOps and op-declarations/op-grades list it. What is missing is its entry in DECLARED_OPS (R39 lists only lead, leadlook, leadshare, leadread), which is why the leads screen cannot send it; SCREENS-INTAKE's comment 'the plane lists no leads' is out of date. My best reading: add NO duplicate op; add leadlist to DECLARED_OPS (classes admin/member/probe, read, accepts [limit], requires []) with its declaredOpHolds test and a reach-control test, and report that screens-intake should send op=leadlist. A new op name op=leads would also need routing in control-plane/op-declarations/op-grades, which are not my module. Proceeding on this reading; tell me if you want op=leads as a second name.

## J6 · COMPLETE

B4 (K4240): no new op. op=leadlist already is the read asked for (R20, see J5): the leads the viewer may read by leadReach, newest first, each with lead_id, author, words, locator, at, state, looked_at, looks, bounded by limit with truncated. The gap was that it was not declared, so I added leadlist to DECLARED_OPS (classes admin/member/probe, read, accepts [limit], requires []), its description the op-grades row's, id observation-log.declared.leadlist. Tests (declared-ops.test.mjs, naming R39/R20): declaredOpHolds for leadlist, and a reach control (a lead the viewer may not read is absent). Behaviour unchanged. For BOB: (1) requirement line, R39 to read 'lead, leadlook, leadshare, leadread, leadlist'. (2) screens-intake should send op=leadlist; its comment in screens-intake/leads.mjs ('The plane lists no leads') is stale. (3) If op=leads as a second name is still wanted, it needs routing in control-plane, op-declarations and op-grades, which are not mine. Tests: node --test bio-plane/test/m/observation-log/ 84 pass 0 fail. Checks: format 0 failures; architecture 0; coverage 39 of 39 ids named, 0; words 0; ownership 0 failures. Commit on job/T51/observation-log (pushed). Size (session_01WPbhxZPiQAyS8UNV84uKH4): test runs 2, module lines 3122

## J7 · COMPLETE

G15 (K4571, fix round 6, wave 2): done. A unit stored cut to the per-unit cap now makes the content axis `partial`.

**Cause (1).** `observeIndexed` (`bio-plane/src/observation-log/index.mjs`, the chain at :451-465 before) reached `partial` only on `over_bound > 0`; a cut unit (`truncated > 0`, none over bound) fell to the `written > 0` branch, so `PRESENT`, with the cut only appended to the detail.
**Why the tests missed it (2).** Two tests recorded the wrong behaviour as right: the R7 index-notice test asserted `PRESENT` for `truncated: 1` (writers.test.mjs), and the R7 unit test for `truncated: 2` asserted only the detail text, never the state. Both now assert `partial`; the control (uncut stays `PRESENT`) is in the notice test.
**Change (file:line).** `index.mjs`: a new branch before the `PRESENT` branch, `r.truncated > 0 && r.written > 0` gives state `partial`, bound = the per-unit cap naming how many units were cut, detail = the units-indexed sentence (the cut sentence is still appended after). The R7 comment updated. The result is the reading (capture) as for over-bound `partial`.
**Failing-first (3).** Through the real index notice (`w.ex.fireIndexed`, extraction's R62 entry) and the direct writer:
- `indexed({offered:1, written:1, truncated:1})` -> state `partial`: RED before (actual `PRESENT`, expected `partial`), GREEN after.
- `observeIndexed(... truncated:2, unaddressable:1)` -> `partial`: RED, GREEN.
- Control `truncated:0` stays `PRESENT`: green throughout.
**Platform (4).** N.
**R-OLD.** New data only: rows already written as `PRESENT` over a cut unit are not rewritten.
**Census ops (K4208).** None of my ops' accepted keys changed.
**Stand-in sentence owed.** New member-readable sentence `localize("observation-log.index.per_unit_cut_bound", "the per-unit text cap: {truncated} unit(s) were stored cut, so the record holds only the start of their text")`. Row owed in setup-words (BOB regenerates `setup-words/rows.mjs` at the layer close; the words check passes, count unchanged at 18421).

**Tests.** observation-log 84 pass, 0 fail. Users that read the axis: retrieval 183/183, extraction 247/247, duties 75/75 (impact.mjs names 89 modules because of the shared table; I ran the three that call the changed service).
**Checks** (`checks/run.mjs`): format 0, architecture 0, coverage 6623 of 6623, channels 0, words 0 failures, 18421 words (not risen). Ownership: 3 files changed, 0 failures.

**Requirement line proposed (R7, BOB writes it):** "...The row is `PRESENT` when every unit was stored whole, `partial` with the bound that stopped it when units were over the bound or any unit was stored cut to the per-unit cap, `LOOKED_ABSENT`..." Test: a unit cut with none over bound writes `partial` naming the per-unit cap; control: an uncut index writes `PRESENT`.

Nothing deferred. No flaw found in another module.

Size (session_01N9utw85aeGstUGpxK1qCWr): test runs 8, module lines 3122
