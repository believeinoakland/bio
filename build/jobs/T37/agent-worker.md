# agent-worker (T37)

**Status** · session_01WhyJcr7TyurxDxBDdU3eVj · depth 2 · RUNNING until 2026-10-08T11:27:27Z (negative controls (agent-worker/test/*.control.mjs) in a scratch worktree) · handled B5

## J1 · QUESTION

Three readings I am building on; none stops me, answer when you can.
(1) R69 "The model is offered no tool". `agent-model` R6 ends a conversation only when the model calls `finalTool`, so a draft answers through its `draft` tool (as R59's drafts do). My reading: the translation draft is offered exactly one tool, the final `draft` tool (the answer itself, whose input is the draft, `{words:[{key,text}], not_drafted?}` or `{key, english}`), and no read tool or any other; `onTool` refuses every other name without a plane call. If you mean literally zero tools, `agent-model` would need a text-answer ending (another module's change).
(2) SURFACE (R34): `index.mjs`' SURFACE already lists `ask` and `draft` beside `run` and `version` (R34's text says `{run, version}`). I add `signin: {method: POST, mutating: false}` as `/ask` and `/draft` were added, and R31's refusal names `POST /signin`. Say if SURFACE should stay without it.
(3) R67 guard: should the runner ever answer with the code in its body, passing it "unchanged" (R66, R43) would put the code in an answer (R67, R36). My reading: R67 wins; I do not build a guard (the runner's R18 says its detail never carries the code, and a guard would add an unworded code). The relay's own refusal detail (`RUNNER_SILENT` from a thrown binding error) has any copy of the code cut out.
