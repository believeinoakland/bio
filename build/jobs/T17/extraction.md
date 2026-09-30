# extraction (T17)

**Status** · session_011qbqAh8m73FQnGqGT9f8qb · depth 2 · WORKING · handled B1

## Completion (EXTRACTION #7)

**Entry applied.** N391 (K573): `bio-plane/test/staff-directory-e2e.test.mjs` converted to `bio-plane/test/m/extraction/staffdirectory.test.mjs`, three tests at the module's interface (`Extraction#read` over the stored bytes, the real tier-1 `pdf` entry, `PDF_WORKER` bound to the real member's `fetch` from `pdf-worker/src/index.mjs` over the same evidence bucket as its `CAPTURES`). R4 names the member through its binding, not the bundle, so the committed bundle is not used. The two real fixtures are copied into `bio-plane/test/m/extraction/fixtures/` (sha256 pinned in the tests), so legacy-tests may delete `test/fixtures/fw20/` with the old suite. The old suite and its helpers are untouched.

**Which old assertions each new test carries.**
- `R4 R11 R12 R17 (N391)` (directory, member bound): old §1 (the directory's sha256); §2 read from text, tier 2, `staff_directory`, twelve entries, keyed by address, each a `pdf-page` source, basis names the reader. Added: the member called once with exactly `{capture_sha, store}` (R17); one layer part at tier 2 (R11); every provenance page tier 2 on `pdf-worker`; the basis's tier-2 note and "12 of 12" placement (R12); the ref is `kind:key` as it appears (R46).
- `R4 R12 (N391)` (directory, no member): old §3 whole (read_from_text false, `no_tounicode` in the basis, no `staff_directory`). Added: a failed reading (`found: false`, no entities, tier 1) naming the unbound member.
- `R4 (N391)` (schedule): old §1 (the schedule's sha256) and §4 whole (read from text, not a `staff_directory`). Added: read at tier 2 through one member call.

**Not carried, with why.** (1) The path through `op=acquire`, the outbound fetch stub and Miniflare: that is `capture`'s acquire and the plane's wiring, not this module's interface; R1's wire (the reading and units on the acquire answer) is already tested by `read.test.mjs` through `acquireReadingOp`. (2) The committed `pdf-worker` bundle: bundle freshness is a system check, and R4 does not name the bundle. (3) "every entry is keyed by its address" is carried as "the key ends with the entry's address", not the old `^contact:<address>$` regex, which pins the doubled prefix reported below. (4) The comment's negative-control arms edit docprofile's source; they are docprofile's (N390).

**Found in another module (REPORT J2).** `docprofile/doctypes/staff-directory.mjs`:177 emits each entity with `kind: "contact"` and `key: "contact:<address>"`, so the reference extraction records (R19, R46: raw `kind:key`) is `contact:contact:<address>` in `reading_refs.ref` and the name terms; every other type emits a bare key (`meeting:2101`). docprofile's key should be the bare address (a change to its reading shape, with any reader of `contact:` refs checked).

**Deferred.** None. Of the module's own code I read only the parts the entry touches (`pipeline.mjs`'s tier-2 call; the test fixture and `read.test.mjs` whole); no code changed.

**Tests and checks.**
- `node --test bio-plane/test/m/extraction/staffdirectory.test.mjs`: tests 3, pass 3, fail 0.
- `node --test bio-plane/test/m/extraction/`: tests 94, pass 94, fail 0.
- `format: 72 modules, 67 requirements files; 0 failures`
- `architecture: 18 product files, 66 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 59 of 59 live requirement ids named by a test; 0 failures`
- `ownership: … legacy-checks: 0 line(s) added, 0 removed; legacy-store: 0 …; legacy-index: 0 …; 0 failures`

Size (session_011qbqAh8m73FQnGqGT9f8qb): test runs 3, module lines 0
