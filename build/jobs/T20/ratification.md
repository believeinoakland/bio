# ratification (T20)

**Status** · session_01A7m8vFb8rvrLPbS3Xo2b4s · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1, `build/plan/current.md` T20 L8):
- K875: `test/m/ratification/preflight.test.mjs` registers and revokes a member's own key through `credentials`' `signerRegisterOwn` / `signerRevokeOwn` (credentials R9, R10; `w.credentials`, already in the fixture), five calls (:157, :159, :255, :268, :272). Re-scan of `src/ratification/` and `test/m/ratification/` for `attestingKeys`, `signerList`, `signerRegisterOwn`, `signerRevokeOwn`, `aiCredentialLook` on membership: none left (every `attestingKeys` was already `credentials`'). Every test asserts what it asserted. Membership's two copies have no caller here now (N453).
- K882: `checks.mjs` comment above `SEARCHED_SUBJECT_SOURCES` no longer names `airun.mjs` as present; it says where the vocabulary lives and who imports it (`case-authoring`'s `searched.mjs`), with the cycle kept as a provenance note.
- K899 (1), member-read text "bundle" → "record", identifiers kept: `checks.mjs` :311 (the repair "name the excluded record by id"), :522 ("as DEC-12 already requires of a record"), :686 ("the (record, revision) pairs"), :693 ("no bias record was in force"; field `bias_manifest_bundles` kept); `ops.mjs` :375 (`RATIFY_STALE`: "the record has changed since it was reviewed"), :774, :776 (the reuse note: "whether this record reused any part…", "The record is ratified"), :826 ("the record is ratified with the bytes captured on the day"); `release.mjs` :149 (`ENTRY_REQUIREMENTS`: "would mint records the catalog immediately rejects"). Re-scan of the paths for other member-read strings holding the word (comments, SQL, identifiers, region names and field names aside): none found. No test of mine pinned the old words; none re-keyed.

**Fixed in my module (beyond the entries):** R18 says the `NO_ATTESTING_KEY` remedy names `credentials` R9 (was `membership` R89); `refusals.mjs` still said "membership R89". The remedy now says "(op=signerregister, credentials R9)"; the R18 test that pinned `/R89/` is re-keyed to `/credentials R9\b/` and its title says so. This is a member-read string (product code), outside B1's "no product code changes"; done because the requirement is the contract (JOB.md step 4) and reported to BOB in J1.

**Deferred:** none.

**Found in another module / generated artifacts:** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`, owned by `not_product`) is stale: it carries the re-worded strings and the remedy text from `src/ratification/` (BOB regenerates at layer close). No other module's test pins the old phrases (grep over `bio-plane/`; `test/d84-case-manifest.test.mjs` holds "(bundle, revision)" only in a comment and a log line).

**Tests and checks run:**
- `node --test test/m/ratification/` (in `bio-plane/`): tests 181, pass 181, fail 0. No layer tests named in the manifest; no service I provide changed.
- `node checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `node checks/architecture.mjs … ratification`: 22 product files, 97 relative imports; 0 failures.
- `node checks/coverage.mjs … ratification`: 33 of 33 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … ratification tranche/T20`: see the line below (run after commit).

Size (session_01A7m8vFb8rvrLPbS3Xo2b4s): test runs 1, module lines 5 files changed (about 30 lines)
