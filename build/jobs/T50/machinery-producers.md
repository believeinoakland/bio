# machinery-producers (T50)

**Status** · session_01C2Z4QagtjAtuUyAsUGoELa · depth 2 · WORKING · handled B1

## Completion (T50-52)

**Entries applied**
- R15 (N1143, DEC-274): a completed capture request is told by key. `summary` and `detail` read `queue.capture-completed-unattended.request.summary` / `.summary.unnamed` and `.request.detail` / `.detail.assistant` / `.detail.unnamed`. `{member}` is the requester's handle (the founder's through the held founder handle): `at_the_request_of.member`, or for a run the member read from `principals.plane` through `run-rules`' `runPrincipalOf`. A request naming no member, a run whose principal is no member, or a member with no handle draws the unnamed forms. `{title}` is the title of the document the capture is registered under (its `register` row), `screen.held.untitled` when none is held, it is untitled, or the viewer may not see it (R6). No record, run or credential id is said.
- The grade note (R3, R15) is read as `queue.capture-completed-unattended.gradenote` once per distinct note, for both capture-completed-unattended producers. The captures a note is of stay on `basis.grade_notes`. The detail no longer lists capture digests.
- Plan rule 6: every summary, the notice option labels, the two age details and `ZONE_UNDETERMINED` that a key in `words.json` holds are now read through `word()` (the keys in the `machinery-producers.*` reads of `words-reads.json`). "group" is now "team" in the remaining text. Two summaries changed wording to the design's keys: the recheck item no longer says "overdue" (`machinery-producers.summary.overdue_check_interval`, DEC-269), and the capture-request summary is now R15's.

**New `reads` (for BOB to regenerate `words-reads.json`; not edited by me)**: `queue.capture-completed-unattended.request.summary`, `.request.summary.unnamed`, `.request.detail`, `.request.detail.assistant`, `.request.detail.unnamed`, `queue.capture-completed-unattended.gradenote`, `screen.held.untitled`. Retired from my reads: `machinery-producers.map.grade_note_names`, `machinery-producers.summary.captured_daemon_investigative`.

**Deferred / REPORT (sentences no key holds; inline English left as it was, "team" for "group")**
- The `detail` of governor-holding-host, partial-capture-outstanding, render-deferred (its `released` and waiting detail), archive-fallback-eligible, monitoring-recheck-due (both forms), the five sweep-* details, and the three notice-* details, plus their `basis.detail` and `age.detail` sentences (no_refusal_instant, unparseable_*, no_first_failure, unscheduled, no_condition_instant). These have no key in `words.json`; for the design lane.
- `summary` for `render-deferred`'s fallback and the update to-do keep their keys; the update to-do's `basis.detail` is inline.
- Requirement R3 says nothing about naming digests in the detail, but its test did ("(cap88)"); that assertion is replaced by R15's note-by-key assertion.
- The wider hand-list/`words.json holds none of my words` red for this module: not in my entry; nothing in this module's tests hand-lists another module's ops, rows or words.

**Other modules**: none found.

**Tests and checks**
- `node --test test/m/machinery-producers/*.test.mjs`: tests 35, pass 35, fail 0.
- format: 171 modules, 170 requirements files; 0 failures. architecture (machinery-producers): 7 product files, 33 relative imports; 0 failures. coverage (machinery-producers): 15 of 15 live requirement ids named by a test; 0 failures. ownership: 4 files changed by machinery-producers between tranche/T50 and HEAD; 0 failures.
- `checks/run.mjs` over the product: architecture 3486 product files, 0 failures; coverage 5702 of 5853 (25 failures, none machinery-producers: other modules' not-yet-met ids).

Size (session_01C2Z4QagtjAtuUyAsUGoELa): test runs 3, module lines 1234
