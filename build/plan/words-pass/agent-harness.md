# agent-harness: the words check after the conversion (K3949)

Layer 6. 7 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `agent-harness/test/agent-harness.test.mjs:399` [?] ops: airunspawn, capturerequest, suggest, ... (6 of 7 not the module's own) — handlist
- inline `agent-harness/src/harness.mjs:1137` "this run's last tick published its state at '{}', which works from ..."
- inline `agent-harness/src/harness.mjs:642` "(the plane refused '{}')"
- inline `agent-harness/src/harness.mjs:676` "this run's log carries {} observation(s); continuing rather than re..."
- inline `agent-harness/src/harness.mjs:697` "; {} return(s) REFUSED — a sub-session that returns documents has"
- inline `agent-harness/src/subsession.mjs:591` "; {} cited item(s) in no version chain, each counted as itself"
- inline `agent-harness/src/subsession.mjs:592` "; {} citation(s) whose document is UNDETERMINED — the plane refused"
