# agent-runner (T34)

**Status** · session_0126JraxknDBEVK93UFj7XHf · depth 2 · WORKING · handled B2

## Completion

**Entry applied: T34-74** (N624; K1705, K1604/T33-D1, K1730, K1734; readings accepted K1799).
- **R12** `src/worker.mjs`: the Container Durable Object class `AgentRunner` over `@cloudflare/containers` 0.3.7 (devDependency, inlined into the bundle, not installed in the image). Every request goes to the image's one port (`image.port`, 8080) unchanged, WebSocket upgrade included; a caller's `cf-container-target-port` cannot pick another port. No default export (no route of its own); `ContainerProxy` exported because the library's outbound interception needs it through `ctx.exports`. The container is started with no environment and no entrypoint override.
- **R13** `wrangler.jsonc`: account pinned; `main` the committed bundle; `containers` [{class_name AgentRunner, image `docker.io/civicos/agent-runner@sha256:UNPUBLISHED`, max_instances 10}]; DO binding `AGENT_RUNNER` and SQLite migration `v1`; `workers_dev`/`preview_urls` false; `vars.VERSION` only (the release's version site, resolve-version ARM 7c). `Dockerfile` `FROM node:22-bookworm-slim@sha256:efd0ab57…7562` (linux/amd64 manifest, Docker Hub, 2026-10-06), `NODE_EXTRA_CA_CERTS` set to Cloudflare's container CA. R10's egress declared once in `fleet-member.json` `egress` and applied by the class: `enableInternet = false`, `allowedHosts = ["api.anthropic.com"]`, `interceptHttps = true`. `runner.mjs` passes `NODE_EXTRA_CA_CERTS` (and nothing else) from the process into the query's environment.
- **R14** `fleet-member.json`: kind and image kept; `bundle` (src/worker.mjs → dist/agent-runner.bundled.mjs + .bundle.json), `class_name`, `max_instances` 10, `bind` [{agent-worker, RUNNER}], `image.digest` null until the release. `scripts/build.mjs` builds it with bundler's `writeMember` (`npm run build`); `uses` is now `bundler` (BOB, K1799).

**For the release (T33-D1, bundler R25/R26):** publishing the image writes the digest into **both** `fleet-member.json` `image.digest` and `wrangler.jsonc` `containers[0].image` (the test holds them equal), then rebuilds agent-runner's bundle (`node bio-plane/scripts/bundles.mjs`): the bundle inlines the marker, so writing the digest stales it until rebuilt. The live egress (HTTPS through Cloudflare's interception to api.anthropic.com) and start are measured only at a deploy (M-Q2); `deploy-fleet` needs Containers reachable by the token (Bob's act if not, K1705).

**Deferred:** none.

**Found in other modules:** the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale against `tranche/T34`'s merged sources (fleetbundles: 4 FAIL, all `bio-plane:`, none agent-runner's); a generated artifact BOB regenerates at the layer close, not touched by this job.

**Tests and checks** (on `job/T34/agent-runner` with `tranche/T34` merged):
- `agent-runner`: `node --test test/` — tests 22, pass 22, fail 0 (new: `worker.test.mjs` R12 ×4 through the bundled class against the real runner image; `container.test.mjs` R13 ×3, R14).
- `bio-plane/test/system/fleetbundles.test.mjs` — 116 pass, 4 fail (the plane's own staleness above; agent-runner's bundle guarded and green).
- `bio-plane/test/system/resolveversion.test.mjs` — 12 pass, 0 fail.
- `checks/format.mjs` — 126 modules, 0 failures; `checks/architecture.mjs agent-runner` — 0 failures; `checks/coverage.mjs agent-runner` — 14 of 14 live ids named, 0 failures; `checks/ownership.mjs agent-runner tranche/T34` — 0 failures.

Size (session_0126JraxknDBEVK93UFj7XHf): test runs 12, module lines 1280 (source and configuration 468, tests 812; package-lock and dist excluded)

## J1 · QUESTION

Three readings for T34-74; I am building on them now. Answer only where you differ.

(1) R13's image before the release. `wrangler.jsonc` `containers[0].image` cannot hold `<repository>@sha256:<64 hex>` until the release writes the digest, and wrangler's schema has no other place for it. Reading: it holds `docker.io/civicos/agent-runner@sha256:UNPUBLISHED` while `fleet-member.json` `image.digest` is null, and the release writes the same digest into both (a test holds them equal once set; `deploy-fleet` refuses while the marker's digest is null and replaces the image with the pushed copy anyway, bundler R26). I invent no digest.

(2) R10/R13's egress. wrangler's `ContainerApp` schema is closed (`additionalProperties: false`), so the allow-list cannot live in `containers`. Reading: it stays declared once in `fleet-member.json` `egress: ["api.anthropic.com"]` (the member's own configuration), and the `AgentRunner` class reads it from there and applies it through `@cloudflare/containers` (pinned 0.3.7): `enableInternet = false`, `allowedHosts = egress`, `interceptHttps = true`; the image trusts Cloudflare's container CA through `NODE_EXTRA_CA_CERTS`, which the runner passes into the query's environment (R2's environment gains that one variable and no other). This makes R10 enforced by the deploy, not only declared. The live behaviour (HTTPS interception to api.anthropic.com) can only be measured at the release (M-Q2).

(3) `uses`. The Worker is built with bundler's `writeMember`, as agent-worker's is (`agent-runner/scripts/build.mjs`), so `modules.json` agent-runner `uses` gains `bundler`. `@cloudflare/containers` is a devDependency, inlined into the committed bundle (a vendored input), never installed in the image (`npm ci --omit=dev`). The bundle `agent-runner/dist/agent-runner.bundled.mjs` (+ `.bundle.json`) becomes a generated artifact for the manifest's table (owned by agent-runner; regenerate `agent-runner/`: `npm run build`).

Also chosen (BOB's level, recorded in my record): `max_instances` 10; `bind` [{member: agent-worker, binding: RUNNER}]; the base image pinned to `node:22-bookworm-slim@sha256:efd0ab5780c2d9ab1f0f869571a00d5edb17793bff4cce4a2792e3eb0ffc7562` (linux/amd64 manifest, read from Docker Hub 2026-10-06); the Worker has no default export (no route of its own), exports `AgentRunner` and the library's `ContainerProxy` (required for outbound interception, reachable only through `ctx.exports`).
