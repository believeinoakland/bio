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
