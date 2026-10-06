# agent-runner (T33)

**Status** · session_01N1t3rme7vXuC6u3GdZF3Jt · depth 2 · WORKING · handled B1

## J1 · QUESTION

Four points my requirements leave open, each with the reading I am building on now (I carry on; only (2) changes what lands outside my module).

(1) **The conversation's path and wire (R1–R4, R6; shared with agent-model R2, R7).** Reading: the container listens on port 8080; `GET /conversation` with `Upgrade: websocket` is the one connection per conversation. Frames are JSON text: the caller's first frame is the conversation request; the runner sends `{tool_use:{id,name,input}}`; the caller answers `{tool_result:{id,content,is_error?}}` (`content` a string or MCP content blocks, passed through); the runner's last frame is R4's answer, then it closes (1000). `GET /conversation` without the upgrade, like any other path or method, is R6's 404 `UNKNOWN`. A first frame that is not a conversation request answers `{ok:false, code:"BAD_REQUEST"}`. The model sees each tool as `mcp__relay__<name>` (the SDK's MCP naming); every relay carries the request's own `name`. R4's other codes: `SDK_ERROR`, `CONNECTION_CLOSED` (a pending relay's connection closed), `MAX_TURNS`. Please confirm or name the path, so AGENT-MODEL #1 codes the same wire.

(2) **`fleet-member.json` and bundler (R7; Suggestions "Open for BOB" (3)).** My code sits at `agent-runner/` beside agent-worker, so bundler's `discoverMembers` finds my marker, and `bio-plane/test/system/fleetbundles.test.mjs` goes red: its exact member list, and "every discovered member declares one [`bundle`]". A container image has no Worker bundle. Reading: my marker carries `"kind": "container"` and an `image` block, no `bundle`; bundler (its job or a CHANGE to BUNDLER #7) learns container members (discovered, listed, not bundle-guarded), and until then that test is a red naming agent-runner, which I REPORT. Alternative: the marker under another name until bundler learns it (against R7's text).

(3) **R7's digest before the image exists.** The image is first built and pushed at the release (T33-D1, "Not here"), so no digest exists at my COMPLETE. Reading: the manifest holds `image: {repository, digest}` with `digest: null` until the release writes it; the module exports `imageReference(manifest)`, which answers `<repository>@sha256:<64 hex>` and refuses `IMAGE_NOT_PINNED` for a manifest with no digest, so an install can name only one image; R7's test checks that, the surface and the recipe. Placement: the `default` policy, a public Docker Hub image (M-Q8).

(4) **The repository name (R11).** `believeinoakland/...` names a place in outward text; layers' rule 4 allows the publisher's name only "as the publisher and signer of a release". Reading: `docker.io/civicos/agent-runner` as a placeholder that the release's first push confirms (the Docker Hub account is Bob's act at T33-D1). Say if you want the publisher's name instead.

Also keeping both R2 arms (`subscription`, `apikey`) as the requirement states.
