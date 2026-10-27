# agent-harness: the words check after the conversion (K3949)

Layer 6. 7 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `agent-harness/test/agent-harness.test.mjs:399` [?] ops: airunspawn, capturerequest, suggest, ... (6 of 7 not the module's own) — handlist
- inline `agent-harness/src/harness.mjs:1137` "this run's last tick published its state at '{}', which works from ..."
- inline `agent-harness/src/harness.mjs:642` "(the plane refused '{}')"
- inline `agent-harness/src/harness.mjs:676` "this run's log carries {} observation(s); continuing rather than re..."
- inline `agent-harness/src/harness.mjs:697` "; {} return(s) REFUSED — a sub-session that returns documents has"
- inline `agent-harness/src/subsession.mjs:591` "; {} cited item(s) in no version chain, each counted as itself"
- inline `agent-harness/src/subsession.mjs:592` "; {} citation(s) whose document is UNDETERMINED — the plane refused"

## Plain findings (K3957)

30 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('agent-harness.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `agent-harness/src/harness.mjs:323` "form candidate versions from the reports"
- plain `agent-harness/src/harness.mjs:324` "what each level's reports mean, and what the version says"
- plain `agent-harness/src/harness.mjs:332` "whether this reading differs in substance"
- plain `agent-harness/src/harness.mjs:347` "how to answer the refusal"
- plain `agent-harness/src/harness.mjs:352` "the pass counter and the loop's termination — neither is the model's to decide"
- plain `agent-harness/src/harness.mjs:358` "the one exit, naming the bound (C-22.5). Terminal"
- plain `agent-harness/src/harness.mjs:397` "run read does not publish that set; a candidate names its own target, never the project id"
- plain `agent-harness/src/harness.mjs:400` "the one question the run's project confirmed-cites"
- plain `agent-harness/src/harness.mjs:404` "names its own target, never the project id"
- plain `agent-harness/src/harness.mjs:617` "the mode is deployed; read this run's own log before doing anything else"
- plain `agent-harness/src/harness.mjs:677` "this run's log is empty; starting the first pass"
- plain `agent-harness/src/harness.mjs:712` "no candidate differs in substance from what the record already holds"
- plain `agent-harness/src/harness.mjs:721` "every candidate this pass formed has been written or dropped"
- plain `agent-harness/src/harness.mjs:1049` "the same gate: refuse a mode that is not deployed, before anything is spent"
- plain `agent-harness/src/harness.mjs:1068` "which options to propose, in order of strength, and why"
- plain `agent-harness/src/harness.mjs:1087` "how to answer the refusal"
- plain `agent-harness/src/harness.mjs:1092` "the one exit, naming the bound (C-22.5). Terminal"
- plain `agent-harness/src/harness.mjs:1127` "the plan's one pass is done; the loop's termination is the table's and not the model's"
- plain `agent-harness/src/harness.mjs:1138` "state does not carry, so the reads are made again"
- plain `agent-harness/src/harness.mjs:1139` "starting the plan's one pass: read what the record holds"
- plain `agent-harness/src/harness.mjs:1146` "no candidate differs from what the plan already holds"
- plain `agent-harness/src/harness.mjs:1151` "every candidate this pass composed has been proposed or dropped"
- plain `agent-harness/src/subsession.mjs:116` "nobody looked at this level for this subject"
- plain `agent-harness/src/subsession.mjs:117` "we looked and it is positively not there"
- plain `agent-harness/src/subsession.mjs:118` "we looked and could not tell"
- plain `agent-harness/src/subsession.mjs:119` "we looked and it is there"
- plain `agent-harness/src/subsession.mjs:363` "is not one of them"
- plain `agent-harness/src/subsession.mjs:549` "the record holds no captured version at this address"
- plain `agent-harness/src/subsession.mjs:581` "never a title, a text or a byte comparison"
- plain `agent-harness/src/subsession.mjs:593` "a read, so they are counted as neither a document nor an item"

## Test copies of code sentences (K3962)

2 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `agent-harness/test/agent-harness.test.mjs:163` "\"' is not deployed yet — it is a row in this table\""
- testcopy `agent-harness/test/agent-harness.test.mjs:500` "\"return a REPORT with a citation, never documents. The parent re-rea...\""
