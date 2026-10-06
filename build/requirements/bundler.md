# bundler — requirements

**Status** · Written by BOB #38, 2026-09-26: a helper module, so its requirements are BOB's (K20). Layer 1. Code: `bio-plane/scripts/fleet-bundle.mjs`, `bio-plane/scripts/provenance.mjs`; tests `bio-plane/test/m/bundler/`. Every id met and tested in T2 (2026-09-26; `build/plan/archive/T2.md`). AMENDED at T19's fold (BOB-5, K648, K653) by a worker for BOB #80, 2026-10-01: the release tooling joins the module (`from: legacy-index`): `bio-plane/scripts/build-plane.mjs`, `deploy.mjs`, `derive-bindings.mjs`, `resolve-version.mjs`, `jsonc.mjs`, and from `tools/` `release-assemble.mjs`, `deploy-fleet.mjs`, `bundles.mjs`, `jsonc.mjs`. R11–R23 state their behaviour today, worded at the fold and tested by bundler's T19 job (layer 1); the module now uses `signatures` (placed before it in the order).

## Public

### Purpose

Builds each member of the fleet (the plane and the workers) into one bundled artifact with a manifest of hashes, and verifies that a committed artifact is exactly what its source builds, so a stale artifact fails instead of shipping. It also holds the release tooling run from an operator's machine: one version across the fleet, a signed release assembled over the whole fleet, and a deploy of a signed artifact believed only from the bytes read back.

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

**Release tooling (T19 BOB-5).** The commands below are run by an operator and named by their usage line; each refusal prints `REFUSED [CODE]: …` to stderr and exits non-zero, before any write or upload unless stated.

**`stripJsonc(text)`, `parseJsonc(text, what?)` → string, object.**
- **R11** `stripJsonc` removes `//` line comments (keeping their newline) and `/* … */` block comments, and nothing inside a single- or double-quoted string (escapes honoured), so a `//` in a URL survives. `parseJsonc` returns the parsed object, and throws `Error` reading `<what> did not parse as JSONC: …` otherwise. One implementation serves every caller in the module.

**`versionSites(root?)`, `resolveVersion(root?)`, `resolveVersionOrExit(root?, label?)`.**
- **R12** The sites are, for the plane and then each discovered member (R1), `<dir>/package.json`'s `version` and `<dir>/wrangler.jsonc`'s `vars.VERSION`, each where present. `bio-plane/package.json` is the authority. `resolveVersion` returns `{ok:true, version, sites}` when every site equals the authority; otherwise `{ok:false, version, sites, findings}`, one finding per disagreeing site (behind or ahead) naming the file, the key and the edit, and `version: null` with one finding when the authority declares none. Never throws on skew. `resolveVersionOrExit` returns the version, or prints `REFUSED [VERSION_SKEW]` with the findings and exits 1.

**`deriveBindings(cfg, {slug, version, instanceClaudeToken?, instanceAiToken?})` → bindings.**
- **R13** From a parsed `wrangler.jsonc`: `plain_text` `VERSION` (the argument) and `INSTANCE_NAME` (the slug); each `vars` entry but `VERSION` as `plain_text`; each `r2_buckets` entry as `r2_bucket`; each `services` entry as `service`, a target of `bio-plane` replaced by the slug and any other kept as written; `browser` when declared; `secret_text` `INSTANCE_AI_TOKEN` only when given; never a Claude credential (K1502). No Durable Object binding is emitted.
- **R14** Throws `REFUSED [NO_SLUG]` or `[NO_VERSION]` when either is missing; `[UNKNOWN_BINDING_CLASS]` naming each other binding key the config declares non-empty (`kv_namespaces`, `d1_databases`, `queues`, `analytics_engine_datasets`, `ai`, `vectorize`, `hyperdrive`, `dispatch_namespaces`, `mtls_certificates`, `send_email`, `wasm_modules`, `data_blobs`, `text_blobs`); `[BROWSER_BINDING_UNNAMED]` for a `browser` with no `binding`; `[PHANTOM_TARGET]` if a derived service still targets `bio-plane`. `serviceTargets(bindings, slug)` lists the service targets other than the slug.

**`deriveLimits(cfg)`, `limitsReadBack(settings, want)`.**
- **R15** `deriveLimits` returns `{subrequests, cpu_ms?}` from `cfg.limits`; throws `REFUSED [NO_SUBREQUEST_LIMIT]` unless `subrequests` is a positive integer, and `[UNKNOWN_LIMIT_KEY]` for any key but `subrequests` and `cpu_ms`. `limitsReadBack` returns `{verdict, why}`: `UNDETERMINED` when the settings are unreadable or state no `limits.subrequests`, `MISMATCH` when it differs from `want.subrequests`, `MATCH` otherwise. Neither makes a request.

**Build the plane (`npm run build` in `bio-plane/`, `scripts/build-plane.mjs`).**
- **R16** Renders the signer page (signatures R30), then writes the plane's bundle and manifest by R5, and prints the artifact's size and SHA-256 and the manifest's input counts.

**Deploy the plane (`node scripts/deploy.mjs <slug> <version> <asset>`, `CF_TOKEN`, `CF_ACCT`).**
- **R17** Refuses `[VERSION_SKEW]` (R12) and `[VERSION_ARGUMENT_DISAGREES]` when `<version>` is not the resolved version; exits 2 with its usage line when an argument, `CF_TOKEN` or `CF_ACCT` is missing; refuses (exit 3) a slug that names a non-plane worker (`civicos`, `pdf-worker`); refuses `[BINDING_TARGET_MISSING]` or `[PREFLIGHT_UNREADABLE]` unless every service target other than the slug (R14) is found in the account.
- **R18** Uploads the asset with R13's bindings and R15's limits, keeping the instance's `secret_text`, `durable_object_namespace` and `service` bindings, and states whether each instance token was sent without printing it. It reports success only when the script read back from the account hashes to the asset's SHA-256 (up to four attempts) and R15's read-back is `MATCH` (`[LIMITS_MISMATCH]` exits 1); when the bytes never match it exits 1 saying nothing was applied. When the deployed bytes already match, the instance serves `<version>` and the limits match, it uploads nothing and exits 0. After success it waits up to 60 seconds for `/version` to answer `<version>` and says so either way, without failing.

**Deploy a fleet member (`node bio-plane/scripts/deploy-fleet.mjs <member> --instance <slug> [--dry-run]`, `CF_TOKEN` or `CLOUDFLARE_API_TOKEN`).** It reads no limits back. The plane's deploy (`deploy.mjs`, R18), when R15's read-back is `UNDETERMINED` (the account's settings are unreadable or state no `limits.subrequests`), prints that the ceiling sent is not confirmed, never prints `verified` for the limit, waits on the rollout and exits 0: the bytes are deployed, and only the limit is unconfirmed (K761).
- **R19** Refuses `[NO_MEMBER]`, `[NO_INSTANCE]` (no default), `[NOT_A_FLEET_MEMBER]` (no `fleet-member.json`), `[NO_CONFIG]`, `[UNPARSEABLE_CONFIG]`, `[ACCOUNT_NOT_PINNED]` (no `account_id`), `[NO_TOKEN]`, and `[BINDING_TARGET_MISSING]` or `[PREFLIGHT_UNREADABLE]` for a service target not found in the account. The `bio-plane` service target becomes the slug and every other is kept as written; it prints the member, instance, account and each binding.
- **R20** With `--dry-run` it deploys nothing and exits 0. Otherwise it deploys through `wrangler deploy` from the member's directory with a generated config that is removed afterwards whether or not the deploy succeeded; the tracked `wrangler.jsonc` is never written. It exits with wrangler's failure, or waits up to 60 seconds for the member's `/version` to answer its declared `VERSION` and says so either way.

**Rebuild stale bundles (`node bio-plane/scripts/bundles.mjs [--check]`; `run({check})`).**
- **R21** Surveys every guarded bundle (R1's members and the plane) by R6 and names each finding. With `--check` it writes nothing and exits 1 when any is stale, 0 when none. Otherwise it rebuilds each stale member by the member's own `npm run build`, reports it rebuilt only when the artifact's or the manifest's bytes changed (and which), surveys again, and exits 1 when any is still stale or a build failed, 0 otherwise.

**Assemble a release (`node bio-plane/scripts/release-assemble.mjs [--dry-run] [--version V] [--emit-payload F] [--sign | --fleet-sig F]`).**
- **R22** Refuses unless every member's committed artifact is proved fresh by R7 and its manifest (`[NO_ARTIFACT]`, `[NO_MANIFEST]`, `[GUARD_CANNOT_RUN]` when the byte check cannot run, `[STALE_OR_UNINSTALLABLE]`, `[MANIFEST_DISAGREES]`), every declared part is present, hashed, typed and equal to its manifest hash (`[MEMBER_PART_MISSING]`, `[MEMBER_PART_UNHASHED]`, `[MEMBER_PART_UNTYPED]`, `[MEMBER_PART_DISAGREES]`) and every member states its compatibility (`[MEMBER_COMPAT_UNSTATED]`); refuses `[VERSION_SKEW]` (R12), `[VERSION_DISAGREES]` when `--version` is not the resolved version, and `[VERSION_ALREADY_RELEASED]` when `release/RELEASE.json` holds that version with a different plane SHA-256. The fleet payload is signatures' `fleetStatement` (R8) over the plane and every member. `--emit-payload` writes it; `--dry-run` writes nothing else and exits 0.
- **R23** With `--sign` (`BIO_RELEASE_SEED`, else `[NO_SEED]`; `[SIGNING_FAILED]`) it signs the plane asset in `bio-release` and the payload in `bio-release-fleet` (signatures R33); otherwise the fleet signature comes from `--fleet-sig` and the plane's from the current `RELEASE.json`. It refuses `[NO_PLANE_SIG]`, `[NO_FLEET_SIG]`, `[PLANE_SIG_DOES_NOT_COVER_ASSET]` and `[FLEET_SIG_REJECTED]` unless stock `ssh-keygen -Y verify` accepts each signature over its exact bytes for the release's `signer`. Only then does it copy each asset, and each part under `<member>/<path>`, into `release/`, and write `RELEASE.json` with `version`, the plane's `sha256`, `bytes`, `asset`, `sig` and `signer`, `fleet` (each member's `member`, `asset`, `sha256`, `bytes`, `compat`, `services`, `parts`) and `fleetSig`.

## Private

### Uses

- `signatures.fleetStatement`, `signatures.NS_FLEET` (R22: the payload the installer verifies with the same function); `signatures.signSshsig` (R23).

### Invariants

- **R10** Verification never writes: no verifying call creates or changes a file.

### Satisfies

- `docs/architecture/BIO_Distribution_v0_1.md`: an installable fleet is one bundled, hashed, signed artifact per member.
- `build/layers.md`, "Helper modules".

### Suggestions

- Its tests build a tiny fixture member in a temporary directory; `esbuild` comes from the plane's installed dependencies.
- **Release tooling (BOB-5).** The job moves `tools/`' four files beside the scripts (one directory for the module's commands), makes `tools/jsonc.mjs` and `scripts/jsonc.mjs` one (R11), re-points `bio-plane/package.json`'s `build` and `deploy` scripts if a path moves (legacy-index's file, `from`), and N31: `fleet-bundle.mjs`' remedy text names the rebuild command at its new path. Tests drive the commands at their interface: R11–R15 as functions; R16–R23 against a fixture repository with `fetch`, `wrangler` and `ssh-keygen` stubbed or a throwaway key, never a real account.
- **Not stated as a requirement:** `deploy.mjs`' release-baton gate (`--thread`, `--force-without-baton`, reading `docs/development/kickoffs/BATON.md` from `main`) is the old process's coordination (K648); the job removes it with the old process's tooling. `tools/fleet-posture.mjs` (DEC-43's credential-posture report) is not release tooling and has no caller; legacy-index deletes it.
