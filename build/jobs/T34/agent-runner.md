# agent-runner (T34)

**Status** · session_0126JraxknDBEVK93UFj7XHf · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings for T34-74; I am building on them now. Answer only where you differ.

(1) R13's image before the release. `wrangler.jsonc` `containers[0].image` cannot hold `<repository>@sha256:<64 hex>` until the release writes the digest, and wrangler's schema has no other place for it. Reading: it holds `docker.io/civicos/agent-runner@sha256:UNPUBLISHED` while `fleet-member.json` `image.digest` is null, and the release writes the same digest into both (a test holds them equal once set; `deploy-fleet` refuses while the marker's digest is null and replaces the image with the pushed copy anyway, bundler R26). I invent no digest.

(2) R10/R13's egress. wrangler's `ContainerApp` schema is closed (`additionalProperties: false`), so the allow-list cannot live in `containers`. Reading: it stays declared once in `fleet-member.json` `egress: ["api.anthropic.com"]` (the member's own configuration), and the `AgentRunner` class reads it from there and applies it through `@cloudflare/containers` (pinned 0.3.7): `enableInternet = false`, `allowedHosts = egress`, `interceptHttps = true`; the image trusts Cloudflare's container CA through `NODE_EXTRA_CA_CERTS`, which the runner passes into the query's environment (R2's environment gains that one variable and no other). This makes R10 enforced by the deploy, not only declared. The live behaviour (HTTPS interception to api.anthropic.com) can only be measured at the release (M-Q2).

(3) `uses`. The Worker is built with bundler's `writeMember`, as agent-worker's is (`agent-runner/scripts/build.mjs`), so `modules.json` agent-runner `uses` gains `bundler`. `@cloudflare/containers` is a devDependency, inlined into the committed bundle (a vendored input), never installed in the image (`npm ci --omit=dev`). The bundle `agent-runner/dist/agent-runner.bundled.mjs` (+ `.bundle.json`) becomes a generated artifact for the manifest's table (owned by agent-runner; regenerate `agent-runner/`: `npm run build`).

Also chosen (BOB's level, recorded in my record): `max_instances` 10; `bind` [{member: agent-worker, binding: RUNNER}]; the base image pinned to `node:22-bookworm-slim@sha256:efd0ab5780c2d9ab1f0f869571a00d5edb17793bff4cce4a2792e3eb0ffc7562` (linux/amd64 manifest, read from Docker Hub 2026-10-06); the Worker has no default export (no route of its own), exports `AgentRunner` and the library's `ContainerProxy` (required for outbound interception, reachable only through `ctx.exports`).
