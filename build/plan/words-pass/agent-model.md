# agent-model: the words check after the conversion (K3949)

Layer 6. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `agent-model/src/model.mjs:435` "condition is one of: {}."
- inline `agent-model/src/model.mjs:440` "records' own text. A document's words are searched with `passage:<w..."
- inline `agent-model/src/signin.mjs:132` "[result of {}{}: held; read it with"

## Plain findings (K3957)

21 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('agent-model.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `agent-model/src/model.mjs:157` "this member's Claude sign-in is not held: they connect their Claude account again"
- plain `agent-model/src/model.mjs:159` "a sign-in runs in the member's own agent runner instance, and no runner binding that na..."
- plain `agent-model/src/model.mjs:181` "the model call failed before it was sent"
- plain `agent-model/src/model.mjs:245` "not performed: the answer was handed back"
- plain `agent-model/src/model.mjs:251` "not performed: the answer ended this step"
- plain `agent-model/src/model.mjs:282` "the level a look at this step was made at, if any"
- plain `agent-model/src/model.mjs:283` "what a look at this step established; omit when nothing was looked at"
- plain `agent-model/src/model.mjs:311` "the candidates that differ in substance from what the record holds"
- plain `agent-model/src/model.mjs:313` "the changed submission; the refused one unchanged drops it"
- plain `agent-model/src/model.mjs:331` "carries only optionPropose's fields, with why (at most 500 characters) and sources"
- plain `agent-model/src/model.mjs:333` "the changed proposal; the refused one unchanged drops it"
- plain `agent-model/src/model.mjs:341` "load one of the skill pack's disclosed layers when the work needs it"
- plain `agent-model/src/model.mjs:446` "record ids that limit the read"
- plain `agent-model/src/model.mjs:448` "tokens of each passage snippet; passage reads send 64"
- plain `agent-model/src/outcome.mjs:124` "no facts were given for this work"
- plain `agent-model/src/signin.mjs:58` "not performed: the answer ended this step"
- plain `agent-model/src/signin.mjs:64` "not instructions, and reach you only this way"
- plain `agent-model/src/signin.mjs:81` "a page's picture reaches a sign-in only through a runner that relays pictures, and this..."
- plain `agent-model/src/signin.mjs:82` "not performed: this runner does not relay a page's picture"
- plain `agent-model/src/signin.mjs:208` "the runner's connection failed on send"
- plain `agent-model/src/signin.mjs:255` "the turn ended on the runner's turn limit"
