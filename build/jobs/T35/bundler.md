# bundler (T35)

**Status** · session_01PSRv1PEnzVenMM8dS21qae · depth 2 · WORKING · handled B0

## J1 · QUESTION

Best readings, carrying on with them; answer only to change one.
1. R27 "packages not marked dev": I list every non-dev lockfile entry, including the optional platform variants (the Agent SDK's darwin/arm64/musl packages) that `npm ci` skips on linux/amd64. The rule is the requirement's own; over-listing is conservative for R29. (Alternative: filter by the lock's os/cpu/libc against `image.platform`.)
2. R28 (c) declaration `bio-plane/scripts/third-party.json` also declares `@cloudflare/containers` 0.3.7 for agent-runner: a devDependency inlined into agent-runner's committed Worker bundle (K1799), which (a) misses; it is "code copied from a package and committed". `ocr-worker`'s `assets/eng.traineddata` (a model, no package ecosystem) is not listed.
3. R28 (a): a member with no lockfile and no declared dependencies is no source (not `unread`); one declaring dependencies with no lockfile is `unread`. A container member the release leaves out (R25, K1730) ships nothing and adds nothing.
4. R28 Cargo.lock: crates with no `source` (the root crate, and any local path crate) are left out; the rest are `crates.io`.
