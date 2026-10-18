# file-scanner (T51)

**Status** · session_017CLfp2cx6WQCCmCguGYJu2 · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

QUESTION 1. Entry T51-9 (Docker Hub addresses) against file-scanner R10, whose text still reads: "each a `ghcr.io/believeinoakland/<image>@sha256:<64 hex>` reference ... and no other registry named". Entry says "Text: none", so R10 is not amended, yet it forbids the Docker Hub address the entry asks for, and `worker.test.mjs` (R10, three tests) asserts ghcr.io and rejects `docker.io/civicos…`.
My best reading: R10's registry rule is superseded by N1242/K3805 (images named `docker.io/civicsmith/<image>@sha256:…`, the GitHub copy kept but not named); BOB amends R10 accordingly (the rule, "no other registry named", and the sentence "Cloudflare Containers do not pull from ghcr.io, so an instance runs the images copied by digest into its own account's registry" which no longer describes the release).
I carry on on that reading: marker, wrangler.jsonc, its comment and the R10 tests name `docker.io/civicsmith/file-scanner-scanner` and `…-renderer`, with the digests of run 39084912830 on tranche/T51 (7a5ac2e450; no docker.io marker is committed, so I read them from that run's logs): scanner sha256:38d314ed955e0af0c3f5379ecb609c718b562911af80e34cd787d0c3bc0a76fd, renderer sha256:27941d2aab6f9fd11e308ff4d3715674d38f268be7a6dcf3d7be8e398fa5ae9c. (They differ from the committed 0.85.0 ghcr digests because that run rebuilt from tranche/T51.) If you amend R10 differently, tell me and I redo it.
Note 1 of START: the module's `catalogue.mjs` already says "team" and has no "group" in any served text; `handling_digest` is not produced by this module (file-safety R27 computes it in bio-plane), so there is nothing to regenerate here.
