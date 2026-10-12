# agent-runner (T46)

**Status** · session_01BPav5py7tUQEUxAhMso2Mn · depth 2 · WORKING · handled B1

## J1 · QUESTION

R24 / agent-model R15: "IMAGE_NOT_RELAYED stays for a runner that does not answer R24's capability". Neither my requirements nor agent-model's say how a runner answers that capability, and R5 (`GET /version` → `{ok, name, version}`, tested by deepEqual) has no field for it.

My best reading, which I am building now: R24 changes no surface; the runner states nothing new, and an older runner (pre-R24) is told apart by agent-model from R5's `version` or by agent-worker's `/version` `runner`. Facts for the choice: a pre-R24 runner (0.82.0's image) passes the R14 block to Claude Code's MCP client as-is; that client's schema needs `{type:"image", data, mimeType}`, so the call fails as a tool error (the model sees an error, the picture is not dropped silently, but no `IMAGE_NOT_RELAYED` either).

If you want an explicit signal, the smallest is R5 amended: `/version` answers `{ok, name, version, image_results: true}` (I would update R5's test). Tell me which; until then I keep R5 unchanged.

Also measured at START (as R24's suggestion asks): a page at agent-worker's `TRANSCRIBE_IMAGE_MAX_BYTES` (5 MiB decoded) is 6,990,508 base64 characters in one relay frame; the runner's own frame cap (`ws.mjs` MAX_MESSAGE) is 16 MiB and Cloudflare Workers' WebSocket limit is 32 MiB (changelog 2025-10-31). No limit is hit; a test sends a 5 MiB page through the connection.

Detail I am applying (mine unless you rule otherwise): an `image` block not in R14's shape at all (no `source`, `source.type` not `base64`, or MCP's own `{data, mimeType}` shape) is treated like R24's bad media type: the tool's error result naming the fault, no bytes passed.
