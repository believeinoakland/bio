# agent-model (T46)

**Status** · session_01CaJrGe6DNpLsPm21SYxPJM · depth 2 · WORKING · handled B0

## J1 · QUESTION

R15 keeps `IMAGE_NOT_RELAYED` "for a runner that does not answer R24's capability", but neither agent-runner R24 nor R5 says how a runner states that capability. An older runner passes an array `content` to the SDK unchanged (`agent-runner/src/runner.mjs`:68–69), so a Messages-shaped image block would reach Claude Code malformed or be dropped: agent-model must know before it sends.

My best reading, which I am building now: agent-runner R5's `GET /version` answer gains `capabilities` (an array; `"image"` once R24 is met), a one-line amendment to agent-runner R5 and R24 for T46-18. agent-model asks the member's own instance `GET https://agent-runner/version` only when a picture is about to be relayed (lazily, at most once per conversation), and relays it only if `capabilities` includes `"image"`; an absent field, a non-200, a throw or a non-JSON answer is "does not answer R24's capability" and refuses `IMAGE_NOT_RELAYED` as today, sending nothing. Text-only conversations make no extra call. A picture in a `user` turn's own content (outside any `tool_result`) stays refused `IMAGE_NOT_RELAYED` on this path (R14: never there).
On the wire the relay's `tool_result.content` is then the block array: `text` and `image` blocks in their order (a `search_result` block flattened to a `text` block), the `image` block unchanged; text-only results stay one string as today (R3 control). A held result read with `read_result` that holds a picture goes the same way.

Alternative: a first frame from the runner on the connection announcing capabilities (rejected: today's agent-model would read an unknown first frame as the conversation's end).
