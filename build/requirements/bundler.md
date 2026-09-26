# bundler — requirements

**Status** · Written by BOB #38, 2026-09-26: a helper module, so its requirements are BOB's (K20). Layer 1. Code: `bio-plane/scripts/fleet-bundle.mjs`, `bio-plane/scripts/provenance.mjs`; tests `bio-plane/test/m/bundler/`. Every id met and tested in T2 (2026-09-26; `build/plan/archive/T2.md`).

## Public

### Purpose

Builds each member of the fleet (the plane and the workers) into one bundled artifact with a manifest of hashes, and verifies that a committed artifact is exactly what its source builds, so a stale artifact fails instead of shipping.

### Provides

**`discoverMembers(repoRoot?)` → members.**
- **R1** Lists the fleet's members from the repository, each with its directory and entry point, in a stable order.

**`buildMember(member, {write?})` → built.**
- **R2** Bundles the member with one recipe (ES module output, platform-neutral, the declared externals), with the working directory pinned to the member's own directory and symlinks preserved, so the same source gives the same bytes from any checkout layout.
- **R3** Writes the artifact only when `write` is true.

**`manifestFrom(member, built)` → manifest.**
- **R4** Records the SHA-256 of the artifact, of every first-party input file, and of the member's lockfile, and the pinned working directory.

**`writeMember(member)`.**
- **R5** Builds with writing on and writes the artifact and its manifest.

**`verifyStatic(member)` → result.**
- **R6** With no dependencies installed, reports stale when any recorded input's hash, or the lockfile's, differs from the file now; reports which input.

**`verifyFresh(member, committed)` → result.**
- **R7** Where the member's dependencies are installed, rebuilds without writing and reports stale unless the bytes equal the committed artifact exactly; where they are not installed, says it could not check, never that the artifact is fresh.

**`unresolvableSpecifiers(text, allowed?)` → list.**
- **R8** Lists every static `import` or `export … from` specifier in a built artifact that is neither bundled nor in the allowed externals (what a one-part upload must resolve at instantiation). A dynamic `import()` is not listed; `verifyFresh` checks those through the build's own metafile.

**Provenance (`readGitProvenance`, `stateOf`, `classifyDiscovered`, `reportProvenance`).**
- **R9** For a set of files, states for each whether it is committed and unchanged, changed, or untracked in the repository, and reports it.

## Private

### Uses

None.

### Invariants

- **R10** Verification never writes: no verifying call creates or changes a file.

### Satisfies

- `docs/architecture/BIO_Distribution_v0_1.md`: an installable fleet is one bundled, hashed, signed artifact per member.
- `build/layers.md`, "Helper modules".

### Suggestions

- Its tests build a tiny fixture member in a temporary directory; `esbuild` comes from the plane's installed dependencies.
