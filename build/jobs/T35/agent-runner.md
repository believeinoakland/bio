# agent-runner (T35)

**Status** · session_01R7wNZkLCVjXa645gdAf5GQ · depth 2 · WORKING · handled B1

## Completion

**Entries applied (T35-49).**
- K1915, R15: `src/worker.mjs` gains a default export `{ fetch }` beside `AgentRunner`: it answers every request 404 `{ok: false, code: "UNKNOWN"}` (R6's answer), reads no body, touches no `env` or `ctx` (so reaches no container instance) and holds no state. R12's test now finds exactly `AgentRunner`, `ContainerProxy` and `default` (whose only key is `fetch`); a new R15 test imports the committed bundle (wrangler's `main`) and checks seven method/path cases twice (an upgrade and body-bearing requests among them): 404 `UNKNOWN`, no body byte pulled, no `env`/`ctx` property read, `AgentRunner` still exported.
- K1905, R11: the test now reads the marker with `image.repository` replaced, and `wrangler.jsonc` with exactly the repository prefix of each `containers[].image` replaced (asserting one per container, each equal to the marker's repository); everything else is read whole, the five `src/` files now included beside the Dockerfile, package and the runner's answers. It also proves the exemption is exact: the release's `ghcr.io/believeinoakland/agent-runner` with a digest passes in those two places, and the same namespace in `build.command` or `note`, a place word in another marker field, a wrangler comment or the wrangler name each fail. `fleet-member.json`'s `build.command` now reads `-t <repository>:<version>`, as the Dockerfile's comment does, so the namespace stays only in the exempt field when the release writes it (the cut 0.81.0 also rewrote `build.command`; with this change the release need not, and if it does, R11's test will name it). The tranche's repository stays `docker.io/civicos/agent-runner` (bundler's `bundler.test.mjs`:619, `fleetbundles.test.mjs`:119 and newgroup's fixture pin it); the release writes GHCR's address with the digest, as at K1905.
- F20, R16: `Dockerfile` installs with `npm ci --omit=dev --ignore-scripts`. A new R16 test splits every non-comment Dockerfile command and requires each npm install command to be `npm ci` carrying `--ignore-scripts` and `--omit=dev`, the lock to be copied in, no `package-lock.json` entry with `hasInstallScript` outside an admitted list (empty; a change to it is BOB's ruling) and no lifecycle script in `package.json`. The lock holds none of the 112 entries with `hasInstallScript`.
- N678's share: not here (N708, K1922).

**R16's proof that the built image still answers.** A `docker build` of the module needed this session's proxy and CA inside the build; building from a scratch copy with those added was refused by this session's permission check (not retried). So the image's install was reproduced outside Docker: the Dockerfile's files copied to a scratch directory and `npm ci --omit=dev --ignore-scripts` run there with the same lock (0 vulnerabilities). The SDK's platform binary is present and runs (`claude --version` → `2.1.289 (Claude Code)`); `node src/entry.mjs` answers `GET /version` 200 `{ok: true, name: "agent-runner", version: "0.79.0"}` (R5), `POST /x` 404 `UNKNOWN` (R6), and a conversation with no credential `NO_CREDENTIAL` (R2). A conversation with a dummy key through the real SDK started Claude Code and ran until the probe's 60 s limit with no error (this sandbox has no direct egress; the runner's whole-environment replacement drops the proxy, as it should). Fully proving R1–R5 on the image needs the release's build (T33-D1).

**Generated artifact staled (§14).** `agent-runner/dist/agent-runner.bundled.mjs` and `.bundle.json` (`src/worker.mjs` and `fleet-member.json` changed); not regenerated here. Until BOB regenerates (`agent-runner/`: `npm run build`), R12's export test and R15's test fail and fleetbundles names the bundle stale. Checked from a fresh build, then the committed bundle restored with `git checkout`: module tests 24 pass, 0 fail; `fleetbundles.test.mjs` 0 fail; `bio-plane/test/m/bundler/` 70 pass, 0 fail. Against the stale bundle without the fix, R15 fails (checked).

**Deferred.** None.

**Found in other modules.** None. (The release tooling that rewrote `build.command` at the 0.81.0 cut, K1905, is bundler's; no change is needed there now, see R11 above.)

**Tests and checks.**
- `node --test agent-runner/test/` on this branch (committed, stale bundle): tests 24, pass 22, fail 2 (R12 exports, R15: the stale bundle, above). With the bundle regenerated: 24 pass, 0 fail.
- `format.mjs`: 130 modules, 0 failures. `architecture.mjs agent-runner`: 0 failures. `coverage.mjs agent-runner`: 16 of 16 live ids named, 0 failures. `ownership.mjs agent-runner tranche/T35`: 0 failures (re-run after the commit, below).
- Final `uses`: `bundler` (unchanged; `scripts/build.mjs`'s `writeMember`).

Size (session_01R7wNZkLCVjXa645gdAf5GQ): test runs 9, module lines 1417
