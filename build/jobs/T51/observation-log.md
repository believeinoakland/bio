# observation-log (T51)

**Status** · session_01WPbhxZPiQAyS8UNV84uKH4 · depth 2 · COMPLETE · handled B3

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
