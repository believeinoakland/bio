HANDOFF to UX-DESIGN: T51 fix round 7 (BOB). Asks for a MERGE when folded.

1. DEC-425 (U463): what the code does with its 10 rows
- Used by the code under the design's key: `refusal.PROMOTE_NOT_A_PARTICIPANT` (promotion/index.mjs:708, {project} by name; G74) and `refusal.NO_SUCH_SESSION` (screens-intake/capture.mjs:408, index.mjs:83; G72; the nearest held row `acquisition.index.no_such_session` stands in until yours merges).
- NOT yet under your key, stand-ins instead; T52 re-keys after your MERGE:
  - `screen.ceremony.gate.head` (G60): code draws `ceremony.gate.heading` ("Put these right before you sign"), screens-publish/ceremony.mjs:23, :196. Your "What Civicsmith's checks found" is not drawn yet. `screen.ceremony.gate.check` is not read.
  - `screen.ceremony.publishat.nozone/.notreached/.nooffer` (G62): ceremony.mjs:~381 draws the ops' own sentences (`refusal.PUBLISH_AT_NO_ZONE`, `case-authoring.publish_at_not_reached_sentence`, `..._unanswered_sentence`) and asks for a row `screen.ceremony.when.nozonestated` for an offer naming no zone; your `.nooffer` covers it, so use that key.
  - `queue.kind.ingest-done/-stopped/-fetch-done` (G61): the Queue reads `queue.kind.<kind>` (screens-daily/queue.mjs:341); code names the kinds in queuestate.mjs:402-404 with code-origin text only. Nothing owed beyond your rows.

2. New word keys in code, not in your `words.json` (13; `localize(id, en)` stand-ins; English is ours, review and own)
bio-plane/src/:
- `acquisition.index.render_did_not_return` (acquisition/index.mjs:1492) "the page as a visitor saw it did not come back in time"
- `acquisition.index.the_rendered_document_is_length` (:1511, G72 area) "the rendered document is {length} bytes, over this surface's {MAX}."
- `calculations.index.taking_every_row_of_a` (calculations/index.mjs:1762, G63) "taking every row of a table is the rare case; state the reason (K1468). Nothing was written."
- `calculations.index.the_source_reads_as_one` (:566, G64) "the source reads as one cell per line (delimiter found: {delimiter}), and the declared header has {columns} columns; ..."
- `capture.index.vouched_basis` (capture/index.mjs:259, G78) "this document is already vouched for, so whether it could be vouched for in a batch is not asked"
- `capture.index.file_too_large` (:745) "the file exceeds what this surface will capture even in parts; nothing was written"
- `capture.index.file_bytes_unreadable` (:757, :770) "the file's bytes could not be read whole or held under their own digest, so nothing was written"
- `reading-pipeline.index.bytes_not_held` (reading-pipeline/index.mjs:2369, :2434; G68) "the capture's bytes are not held in the evidence store, so nothing was read"
- `.no_capture_digest` (:2349), `.reading_not_composed` (:2264, {detail}), `.entry_no_text` (:2693, {fmt}), `.entry_not_read_bytes` (:2722, {fmt} {detail})
- `translations.index.the_teams_translations_could_not` (translations/index.mjs:738) "the team's translations could not be read, so every word is shown in English."
- `instance-setup.selftest.store_place_note` (setup.mjs:3201) "store_location and store_generation are what this copy is configured with ... They do not say where the room runs."
Causes: the round's edits to these lines (refusal and failure sentences now keyed, never raw); G-numbers are the ones named in the code comments; the rest are keyed in passing. These are operator-facing detail lines, none stops a member's operation.
Already in your `words.json`, so no new row unless the English differs: `calculations.index.one_act_reads_at_most`, `calculations.ingest.already`, `calculations.ingest.started` (G55), `plane.pending.interrupted` (PLANE #50), `refusal.PROMOTE_NOT_A_PARTICIPANT`.
newgroup/src: no new `localize` key this round.

3. Design questions
- INSTALLER #25 (J24/J25): the unreadable-settings stop (newgroup/src/index.mjs:1140 `installer.update.stopped.lookup` with {said}, and :478) reuses `installer.keys.unread`, whose sentence is about member keys. Please give the stop a dedicated key, e.g. `installer.update.stopped.lookup.unread`, and we re-point it in T52.
- `screen.ceremony.gate.head`: confirm it replaces `ceremony.gate.heading` (DEC-299) on both the refusal and the Sign step, or both stay.

4. Two reds that clear on your regenerated `words-reads.json` (U466)
- installer-steps R36, R40: the row `installer.fleet.logsunconfirmed` (G83).
- file-safety `rows.test.mjs` R24: `refusal.SIGNATURES_RUN_RECENT` (C-140.44, DEC-412).
Both keys are already in your `words.json`; they are accepted red by name until your MERGE.

5. Layout and wording items that stop nothing went to `build/plan/later-ux.md` for T52 (nine lines, fix round 7 section 5): ceremony findings heading and singular grammar, Sign-step reasons, Queue kind lines, Add closed-capture sentence, "Untitled capture", PROMOTE refusal, Timeline kind box, "Show the routes".

Please MERGE when folded.
