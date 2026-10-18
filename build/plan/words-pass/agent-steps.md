# agent-steps: the words check after the conversion (K3949)

Layer 6. 18 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `agent-steps/test/plan.test.mjs:16` [?] ops: whoami, determination, standard, ... (7 of 15 not the module's own) — handlist
- inline `agent-steps/src/drive.mjs:123` "model would be instructed by words the record does not name."
- inline `agent-steps/src/drive.mjs:125` "The run cannot be continued under another pack, so what it composed..."
- inline `agent-steps/src/drive.mjs:125` "UNDETERMINED and cannot be held to the one the run recorded ({})."
- inline `agent-steps/src/drive.mjs:126` "The run is resumable once the two agree."
- inline `agent-steps/src/drive.mjs:126` "accepted it and the run was closed (R107)."
- inline `agent-steps/src/drive.mjs:557` ", {} not accepted by the plane ({})"
- inline `agent-steps/src/work.mjs:231` ", and {} read(s) could NOT be made — the plane refused"
- inline `agent-steps/src/work.mjs:232` "'{}', so what they would have answered is UNREAD"
- inline `agent-steps/src/work.mjs:235` "; {} cited record(s) ({}) are not answered"
- inline `agent-steps/src/work.mjs:297` "; {} reported empty and {}, so not written down"
- inline `agent-steps/src/work.mjs:315` "the record was unread (the plane refused '{}')"
- inline `agent-steps/src/work.mjs:317` "the record was read at passage grain ({} passage(s))"
- inline `agent-steps/src/work.mjs:324` "; {} disagreement(s) between levels stated and each record read onc..."
- inline `agent-steps/src/work.mjs:385` "; {} already held, dropped ({})"
- inline `agent-steps/src/work.mjs:385` "; {} named a question other than the run's target and were NOT comp..."
- inline `agent-steps/src/work.mjs:525` "the plane refused '{}'"
- inline `agent-steps/src/work.mjs:81` "; {} sub-session(s) reported, {} returned no report" — string concatenation (+=)

## Plain findings (K3957)

21 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('agent-steps.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `agent-steps/src/drive.mjs:99` "the project's account, serving that member"
- plain `agent-steps/src/drive.mjs:110` "the plane refused the read of the skill pack"
- plain `agent-steps/src/plane.mjs:76` "the answer carries no pack"
- plain `agent-steps/src/plane.mjs:76` "the answer's pack has no version, resident layer or disclosed layers"
- plain `agent-steps/src/plane.mjs:94` "the suggestions layer is not loaded: the suggestions switch that governs this act is off"
- plain `agent-steps/src/work.mjs:216` "the cited record names no source address, so no version chain can hold it"
- plain `agent-steps/src/work.mjs:293` "plane answered without a rows collection this member could read"
- plain `agent-steps/src/work.mjs:316` "the record was read, and the plane answered without a list of passages this member coul..."
- plain `agent-steps/src/work.mjs:450` "the submission was changed in answer to the refusal"
- plain `agent-steps/src/work.mjs:451` "the refusal could not be answered by changing the submission; the candidate is dropped"
- plain `agent-steps/src/work.mjs:474` "the plane did not answer"
- plain `agent-steps/src/work.mjs:480` "the run names no plan"
- plain `agent-steps/src/work.mjs:491` "the plan names no project"
- plain `agent-steps/src/work.mjs:498` "the plane's profile answer does not publish it"
- plain `agent-steps/src/work.mjs:526` "the run names no plan"
- plain `agent-steps/src/work.mjs:570` "the proposal was changed in answer to the refusal, and keeps its place"
- plain `agent-steps/src/work.mjs:571` "the refusal could not be answered by changing the proposal; it is dropped"
- plain `agent-steps/src/work.mjs:593` "the run's recorded response names no action entry this member can read"
- plain `agent-steps/src/work.mjs:602` "the action answered holds no such correspondence entry"
- plain `agent-steps/src/work.mjs:607` "the response is a member's account or a non-response, with no capture to read"
- plain `agent-steps/src/work.mjs:610` "the action answered names no kind"
