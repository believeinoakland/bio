# agent-worker (T35)

**Status** · session_015n9TPjBe1pYaYabW7hyVhC · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three points where `POST /draft` (R59) and R61 meet another module's share. I carry on with my best reading of each; none stops the rest of the job.

1. **The pack for a draft that sends no grant.** R59 has the draft read the pack "as R48 reads it" (`op=affordances`, untargeted), but a grant arrives only when the draft may read (switch on, field not firsthand). Without a grant this member has no credential to call `op=affordances` with: control-plane's `grantAdmit` admits `affordances` only under a live grant, and op-declarations gives it no anonymous class. So a switch-off or firsthand draft (the default case) could never be instructed. **My best reading, which I build:** with a grant, `op=affordances` under it (R48, R60); with none, the body carries `pack`, the rendered pack the door holds (control-plane R41), held to R48's whole-pack test; neither gives 502 `PACK_UNDETERMINED` and no model call. That adds `pack` to R59's body and to control-plane T35-72's share (the door sends it). The other reading (the door always mints a grant, its reach only the pack read) would contradict R59's `DRAFT_READ_NOT_ALLOWED`.

2. **`MODEL_FOR_MODE` has no `draft` entry** (agent-model R1; its Suggestions name it, but T35-48's entry is F5 only). `converse({mode: "draft"})` answers `refused` `MODE_UNKNOWN`, so every draft would end `MODEL_REFUSED`. **Best reading:** agent-model's job adds `draft` (provisional, today's default, until M-Q9) as R1's reviewed edit; a CHANGE to AGENT-MODEL #3. My tests stub the model and do not depend on it.

3. **Who builds a judged row's facts opening (R61; agent-model R12).** R12 takes the facts out of `rowPrompt` and has them "arrive as the result of a tool call the conversation makes or is opened with"; this member builds the parent's `messages`. **Best reading:** this member opens each judged row with the row's prompt (step and row only), an assistant `tool_use` of a fixed `read_facts` tool and the user's `tool_result` holding `rowFacts`, with `read_facts` declared in the row's tools; if agent-model exports its own opener or tool for this, I adopt it when I merge the tranche branch after its merge.

Also noted, no answer needed unless you differ: `/draft` does not gate on `run-rules`' `DEPLOYED_MODES.draft` (R59 names no such refusal; the door routes it), and it reports no `askusage` (R59: the door counts the `usage` it answers).
