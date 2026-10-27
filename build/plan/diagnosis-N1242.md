# Diagnosis N1242: the release's container images are on ghcr.io, which no install can pull

Worker diagnosis for BOB, 2026-10-18 (K3803). Read-only; nothing committed, pushed, deployed or run against an account.
Note: the workflow is `.github/workflows/container-images.yml` (it replaced `agent-runner-image.yml`), not the name in the task.

## Summary and recommendation

**Cause.** The release's signed `Container` parts name `ghcr.io/believeinoakland/...@sha256:...`
(`newgroup/src/release.mjs:3`, `release/agent-runner/container.json:3`, `release/file-scanner/container/*.json`).
The installer creates container applications under the `default` scheduling policy through the Containers API
(`newgroup/src/index.mjs:1031-1046`), and Cloudflare Containers pulls under that policy only from the Cloudflare registry,
Docker Hub, ECR and Google Artifact Registry. `newgroup/src/images.mjs:12` (`PULLABLE`) refuses everything else by design (K2816 (4)), so
R38 leaves `agent-runner` and `file-scanner` out on every real install.

**Which registries work today** (Cloudflare docs, fetched 2026-10-18):
- `registry.cloudflare.com` (per account), Docker Hub, Amazon ECR, Google Artifact Registry. GHCR is not supported; the docs say to push any other image to the Cloudflare registry first.
- Only **public Docker Hub needs no credentials**: "Public Docker Hub images do not require registry configuration." ECR (private only; "Public ECR is not supported") and GAR need a stored credential in the group's Secrets Store, which a group cannot be expected to hold for Civicsmith's images.
- Images in `registry.cloudflare.com/<account_id>/...` are namespaced to one account, so a signed release cannot name one for everybody.

**Recommendation: option (b), also publish each image to a public Docker Hub repository, pinned by digest** (this is what N1242 already
proposes). It is the only route where a group's account pulls with no credential, no installer runtime work and no new memory or time
cost. The installer needs **no code change**: `PULLABLE` already admits `docker.io/...@sha256:<64 hex>`. The control in R38's own test
("a `docker.io/…@sha256:<hex>` descriptor installs") already covers it.

**Bob's act (one, plus a token he must hand over in a safe way).** Create a free Docker Hub organisation (the repository names were
earlier planned as `civicos`, K2259/K2266; he must check the name is free and may pick another) and make its repositories public:
`agent-runner`, `file-scanner-scanner`, `file-scanner-renderer`. Then create a read/write access token for the CI and add it to the GitHub repository
`believeinoakland/bio` as Actions secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (GitHub, Settings, Secrets and variables, Actions). BOB can walk him through
it in plain steps. The token is never to be printed. Docker offers free public repositories; a sponsored open-source application is optional.
(That Hub's free-tier terms and anonymous pull limits are from general knowledge, not fetched: Bob or a worker should confirm them when creating the org.)

**What changes, by module id** (names as in `build/modules.json`; confirm ids there):
1. Workflow `.github/workflows/container-images.yml` (owned with `bundler`'s release steps): add a Docker Hub login and a second tag/push (or `docker buildx imagetools create` from the pushed ghcr digest, which keeps the identical digest) for the three images. The ghcr copy stays (K3060).
2. `agent-runner` and `file-scanner`: `fleet-member.json` image `repository` and `wrangler.jsonc` `containers[].image` change from `ghcr.io/believeinoakland/...` to `docker.io/<org>/...@sha256:...` (same digests if the second push is a copy of the manifest; a rebuild gives new digests).
3. `bundler`: no requirement change (R25 writes `image` from the marker; R24/R26 tests re-pointed; `deploy-fleet.mjs` pulls whatever the marker names). Its test pinning the real-fleet image (K2266) now holds again.
4. Release cut, `release-sign`, then `newgroup`'s `src/release.mjs` re-embedded (the `RELEASE_CONTAINERS` constant), as N1242 already says. This is the T51 release cut.
5. `installer`: nothing, apart from tests whose fixtures name ghcr.io (`newgroup/test/t50.test.mjs`, `requirements.test.mjs`) if they assert the old behaviour on the real release.

**Risks of (b):** Docker Hub's anonymous pull rate limit applies to Cloudflare's pulling addresses and Cloudflare does not cache Hub images (docs), so a burst of installs could be refused (R71's retry then named stop covers it; mitigation if it shows: move to Cloudflare-hosted copy, option a). Digest pinning keeps the content exact. Hub is a second place to keep in step at each cut.

**Fallback: option (a), the installer copies each image into the group's own Cloudflare registry.** Possible in principle (the Containers API has `POST /accounts/{id}/containers/registries/{domain}/credentials`, which wrangler uses for `docker login`; a token with `containers.write`, which the installer already asks, is the likely scope, but the docs do not state it and I could not confirm it), but it fits badly:
the installer is a Worker with 128 MB (install memory is 120 of 128 at the real size, N1240), the images are hundreds of MB, and each blob must be streamed ghcr.io to registry.cloudflare.com
with correct lengths inside Worker subrequest, CPU and wall limits, with R71's retry and "nothing half-made" rules over a multi-minute copy. It contradicts R67 ("depends on no local tool") only if done by Docker, not if streamed, but then the installer
gains an OCI client, a new `PULLABLE` form that is account-specific and must be rewritten (digest preserved, verified against the signed one), and a new failure surface. It needs no act from Bob but is the larger and riskier change (`installer` plus new tests). Not recommended unless Bob will not open a Docker Hub account.

**Other routes, rejected:** (c) publish to ECR public (unsupported by Cloudflare) or private ECR/GAR (each group would need a credential in its Secrets Store; not workable). (d) Push from CI to one Cloudflare account's registry: namespaced per account, other accounts cannot pull.

**Order:** Bob's act (org and secrets), then workflow run, markers, cut and re-sign, re-embed `release.mjs`, then the installer's local-arm journey tests (J7, J8) can pass against a real digest. Until the cut, T50's install completes without these members (K3793).

## Evidence

Documentation (fetched 2026-10-18):
- https://developers.cloudflare.com/containers/platform-details/image-management/ : "Containers support images from the Cloudflare managed registry at `registry.cloudflare.com`", plus Docker Hub, ECR, GAR; "Public Docker Hub images do not require registry configuration."; "The `durable_object` scheduling policy does not pull from Docker Hub, Amazon ECR, or Google Artifact Registry."; "Images are limited in size by available disk of the configured instance type"; GHCR not mentioned; other registries must be pushed to the Cloudflare registry first.
- https://developers.cloudflare.com/api/resources/containers/subresources/registries/methods/create : `POST /accounts/{account_id}/containers/registries` registers credentials for ECR, DockerHub, GAR only (`domain` docker.io, ECR hosts, `*-docker.pkg.dev`); needs token permission `Workers Containers Write`; secret must be a Secrets Store reference; "Public Docker Hub images and images in the Cloudflare managed registry don't need this configuration"; `is_public` must be omitted or false.
- https://developers.cloudflare.com/workers/wrangler/commands/containers/ : `containers push` pushes "to a Cloudflare managed registry, which is automatically integrated with your account"; `registries credentials --push|--pull` generates temporary credentials (default 15 minutes). Token scope for it is not stated.
- https://github.com/cloudflare/workers-sdk/blob/main/packages/containers-shared/src/login.ts and `client/services/ImageRegistriesService.ts` : wrangler calls `/accounts/{id}/containers/registries/{domain}/credentials` with a Bearer API token (expiration_minutes, permissions PUSH/PULL), then `docker login`.
- https://github.com/cloudflare/workers-sdk/blob/main/packages/containers-shared/src/images.ts : external registries supported are docker.io, ECR hosts and `*-docker.pkg.dev`; any other host errors with "is not a supported image registry".

Code and requirements:
- `newgroup/src/images.mjs:1-9` (policy comment), `:12` PINNED, `:13` PULLABLE (docker.io, registry-1.docker.io, ECR, `*-docker.pkg.dev`), `:15-16` the reason strings, `:19-23` `imageWhy`, `:50-58` `partsLeftOut`.
- `newgroup/src/index.mjs:54-59` scopes (`containers.write` among them), `:905-914` install rule, `:1005-1020` scope and plan checks, `:1031-1046` `placeContainer` (creates the application with the image as the part names it), `:1164-1168` and `:1242` left-out handling.
- `newgroup/src/release.mjs:3` `RELEASE_CONTAINERS` names ghcr.io digests (agent-runner `sha256:03dcdf70...`).
- `.github/workflows/container-images.yml:1-9` (GHCR only, "no Docker Hub"), `:35-36` login to ghcr.io, `:50-61` build, push and digest print for `agent-runner`, `file-scanner-scanner`, `file-scanner-renderer`.
- `file-scanner/wrangler.jsonc:35-47` (comment: "Cloudflare Containers do not pull from ghcr.io: bundler's deploy copies each image"), `file-scanner/fleet-member.json:26,55`.
- `bio-plane/scripts/deploy-fleet.mjs:40-45` and `:235-266`: the project's own deploy pulls by digest with Docker, pushes with `wrangler containers push` to `registry.cloudflare.com/<account>/<tag>`; it is a developer tool, not what the installer runs (`:30-33`: "The INSTALLER cannot run wrangler").
- `build/requirements/installer.md` R38 (line 56: image "a public registry image pinned by digest", test with `docker.io` control), R67 (line 121: no local tool; images are public-registry images pinned by digest), R68 (line 122-ish: read back deployed image against `container.json`), R71 (line 125: registry slow or unavailable retries then a named stop). `build/requirements/bundler.md` R24, R25 (line 73: `container.json` image from the marker), R26 (line 74).
- `build/plan/next.md:85` (N1242), `:83` (N1240: install memory 120 of 128 MB because R71 holds the whole fleet before creating anything). `build/rulings.md`: K3793 (line 3791), K3803 (line 3801), K2816 (4), K2912, K2259/K2266 (docker.io/civicos planned earlier).
