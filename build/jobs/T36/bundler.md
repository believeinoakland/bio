# bundler (T36)

**Status** · session_01AVSxAcVVnwvGFa9niTqNUo · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings I am building on now; none blocks me, but (A) is the contract file-scanner's job (T36-5) must write, so please relay or confirm.

**(A) The two-class marker (R24, R25, R26; file-scanner R10).** No requirement fixes its shape, so bundler defines it and reads it:
- `kind: "container"`, `bundle` as today, and `containers: [ {class_name, image: {repository, digest, platform?, port?, schedulingPolicy?, base: {repository, digest}, packages: "<member-relative path of the package statement>"}, max_instances?, bind?}, … ]`, one entry per class.
- `max_instances` and `bind` are read from the class entry, else from the member's top level (the marker stating them once for every class). Nothing is defaulted; a class that ends up without one is `[CONTAINER_UNDESCRIBED]` naming the class and the field.
- A member with a top-level `image` and no `containers` is a one-class member exactly as today (agent-runner unchanged). R24's "an `image` block" reads as: a top-level `image`, or a `containers` list whose every entry has one.
- Parts: one class keeps `container.json`; two or more are `container/<class_name>.json`, each type `Container`. The installer (not mine) will need to read more than one `Container` part: I will REPORT it.
- R26: `deploy-fleet.mjs` pulls, tags and pushes each class's image and points each `containers[]` entry of the member's wrangler.jsonc at its class's pushed copy by `class_name`; a wrangler container naming no marker class is refused `[CONTAINER_UNDESCRIBED]`.

**(B) The package statement (R27, R28 (b)).** A committed JSON file named by `image.packages`: `{ "ecosystem": "<OSV ecosystem, e.g. Debian:12>", "base": {"repository": "…", "digest": "sha256:<64 hex>"}, "packages": [{"name", "version"}, …] }`. Its `base.digest` must equal the class's `image.base.digest`, else `[CONTAINER_PACKAGES_UNREAD]` naming the digest. A class with no `image.packages` keeps reading the member's `package-lock.json` (npm). R28 lists those entries under the statement's `ecosystem`, and R29 asks OSV in that ecosystem.

**(C) R30's commands (no new file: `release-sign.yml`'s steps call existing paths).** My reading: the workflow re-runs assembly itself on the commit it signs, so it signs only what it proved fresh, never a payload a session handed it. In order:
1. `npm ci` in `bio-plane/` and in each member directory with a `package-lock.json` (the byte arm needs the installs; I add `node bio-plane/scripts/bundles.mjs --install-dirs`, printing those directories, one per line, so the workflow does not hand-list them).
2. `node bio-plane/scripts/release-assemble.mjs --version <V> --dry-run` (every R22 check, no seed, nothing written).
3. `node bio-plane/scripts/release-assemble.mjs --version <V> --sign` (in the environment holding `BIO_RELEASE_SEED`; signs both, R23's stock-ssh-keygen checks, writes `release/`).
Sessions run only (2) and `--emit-payload`. `--sign` stays (R23) but refuses `[NOT_SIGNING_ENVIRONMENT]` before reading the seed unless `GITHUB_ACTIONS` is `true`, so no session command reads `BIO_RELEASE_SEED`. I also add `--plane-sig <file>` beside `--fleet-sig`, so a release can be completed from signatures made elsewhere (R30's "completed from those signatures") without the previous `RELEASE.json`'s `sig`. Committing `release/` after step 3 is the workflow's (yours).
