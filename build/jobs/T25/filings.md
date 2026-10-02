# filings (T25)

**Status** · session_01W16gVN2HRjfWXSGsuuntKT · depth 2 · WORKING · handled B0

## Completion (FILINGS #12)

**Entries applied** (`build/plan/current.md` T25 L9, filings; BOB's B1):
- **N512's user side (R9).** The exhibits' attestations now come from `attestation.attestationsOf(captureSha)` (its R7), never from provenance (`bio-plane/src/filings/index.mjs`).
  - `Filings` takes an `attestation` dependency. Absent, it reaches `attestationOf(host, {record, provenance})` on the same host. With no host and none given, there is none.
  - A new `#attestations(sha)` makes the one read. When no module answers, it says the attestations are undetermined, and why. A read that fails or refuses says "could not be read". In both cases co-attestation (R25) reads undetermined, never "none recorded".
  - The header's `deps` list names `attestation`, and `provenance` no longer lists `attestationsOf`.
  - The fixture (`test/m/filings/fixture.mjs`) builds the real attestation module on the host and hands it to `filings` and to `filingsWith`. The R9 test compares against `x.attestation.attestationsOf`.
  - This clears red 7 for filings: before the change, 3 filings tests failed (R9 sections, and R25 ×2); after it, none do.
- **Re-scan (N502/N508 kind).** `checks.mjs`:160 (N502) and `index.mjs`:1598 (N508) were already re-worded before this job. No `awaiting stamp`, live legacy store, legacy-index or dispatcher note remains. The legacy store is named only as retired, in past-tense notes (`index.mjs`:41, :176; `prepare.test.mjs`:218).
  - Two stale pointers of the same kind are re-worded. The evidence block's registration (`evidenceBlock`'s comment and `filingsOf`'s comment) named `publication` (its R36). It is now `public-read` (its R8, was publication R36; K651), as the header already said.

**Rows changed:** none. No refusal code, check, translation or `where` moved, so this job adds no row under red 6.

**Improvements in my own module:** an absent attestation module is now stated by name rather than read as a failed call (above). Nothing else.

**Deferred:** none.

**Found elsewhere (REPORT J1):**
- **Stale bundle.** The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from `bio-plane/src/filings/index.mjs`. I regenerated nothing.
- **Requirement marks for you to strike.** In `build/requirements/filings.md`, R9 and the Uses line for `attestation` still say "*(not yet met: T25)*". Both are now met.

**Tests and checks:**
- **New test.** In `test/m/filings/packet.test.mjs`: "R9 an exhibit's attestations are attestation.attestationsOf's answer…". Against the real module, it checks that the answer is passed through whole for each exhibit. A stand-in module answers an attestation that the bundle document does not hold, so the exhibit shows the module's answer and nothing parsed beside it; that answer is checked in a packet and in a draft (R25). The stand-in's `undetermined` is carried with its why, and co-attestation is then undetermined. A read that throws, a refusal (`BAD_SHA`) and no module (no host) each read undetermined, said so.
- `node --test bio-plane/test/m/filings/`: tests 60, pass 60, fail 0. Before the change: 3 failures, all red 7.
- **The whole `bio-plane/test/m`:** tests 5333, pass 5318, fail 4, todo 11. On `tranche/T25` without this change: pass 5314, fail 7. The 4 that remain also failed before this change, and none is in filings:
  - `control-plane/catalogue-end.test.mjs` "R43, R22" and `control-plane/families.test.mjs` "R22 … CHECK_FAMILIES is total": red 8.
  - `affordances/sources.test.mjs`:117 "R2: reattest … through provenance's attest": its stand-in provenance's `attest`, a name moved to attestation. My reading is red 7 or 9.
  - `promotion/write-path.test.mjs`:218 "R53 (N426)": the plane's `/list` answer has no `bundles` (`Cannot read properties of undefined`), from the plane's composition. My reading is red 9. BOB, please confirm.
- `format`: 91 modules, 90 requirements files; 0 failures.
- `architecture filings`: 14 product files, 67 relative imports; 0 failures.
- `coverage filings`: 31 of 31 live requirement ids named by a test; 0 failures.
- `ownership filings tranche/T25`: 4 files changed; 0 failures.

Size (session_01W16gVN2HRjfWXSGsuuntKT): test runs 11, module lines 2035

## J1 · REPORT

Stale: the plane bundle (bio-plane/dist/bio-plane.bundled.mjs) from bio-plane/src/filings/index.mjs; I regenerated nothing. Requirement marks for you: filings R9 and its Uses line for attestation still read '(not yet met: T25)'; both are met now.
