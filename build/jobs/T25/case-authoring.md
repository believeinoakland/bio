# case-authoring (T25)

**Status** · session_01TvrujhMcaGJbTFhyyPqdMd · depth 2 · RUNNING until 2026-10-02T20:17:16Z (node --test bio-plane/test/m) · handled B0

## Completion (CASE-AUTHORING #12)

**Entries applied** (`build/plan/current.md` T25 L8; B1 START):
- **N512's user side, R35.** `attestationsOf` is read from `attestation` (its R7), never provenance: `CaseAuthoring` takes an `attestation` dep (reached lazily through `attestationOf(host)` when none is handed in) and `#captureFacts` asks `this.attestation.attestationsOf`; the header's deps list re-pointed. The fixture builds the real attestation module (`attestationOf(host, {record, provenance})`) and hands it in. This clears red 7 for case-authoring: the 13 R34/R35/R36/R37 tests that failed on `provenance.attestationsOf` pass against the real attestation module. New test "R35: the co-attestation recorded at capture is read through attestation.attestationsOf…": the real module's answer for a co-attested capture; provenance no longer answers it; a stand-in handed in answering none makes both captures unacknowledged and is asked for each; negative control, a stand-in answering attestations for both, publishes with no acknowledgement. R35's `*(not yet met: T25)*` marks (R35, Uses) are for BOB to strike at the merge.
- **Re-scan for the N502/N508 kind** (N469's rule): nothing stale found. Every stamp note names the stamp that took its rows (`checks.mjs`: C-32.6/C-33.14 T19 L2, C-82.8 1.53.0, C-120.4–.7 1.47.0, each confirmed in `src/gate.mjs`'s history); every `store.mjs`/`airun.mjs`/dispatch mention is past-tense extraction history ("Extracted from", "Moved from", "a legacy file since deleted"); the op map named is the plane's (`plane/store.mjs`), live. One test comment re-worded: `preflight.test.mjs`'s "provenance R32–R33" → "attestation R2–R3".

**Rows added or changed:** none (no red 6 row).

**Deferred:** nothing.

**Found in other modules (REPORT):**
- `bio-plane/dist/bio-plane.bundled.mjs` (owner `not_product`) is stale from this change: `fleetbundles.test.mjs` fails its four bio-plane arms (staleness, byte-identity, manifest sha, comment-only); it passes on `tranche/T25` without this commit. Regenerated nothing (manifest §14).
- Two reds in `test/m` outside the accepted names, both failing identically on unchanged `tranche/T25` (a clean worktree at 1d60dbff02):
  - `affordances/sources.test.mjs` "R2: reattest … through provenance's attest" (TypeError at :129, `f.c.provenance.attests` undefined): its stand-in provenance's `attest` is no longer what capture's `reattest` calls since capture's L3 merge went through attestation. A user fixture of a moved name, red 7's kind; affordances is L11.
  - `promotion/write-path.test.mjs` "R53 (N426): through the whole write path…" (TypeError at :234, `/list` answers undefined): not case-authoring's; cause not investigated.

**Tests and checks run:**
- `node --test bio-plane/test/m/case-authoring/`: tests 100, pass 100, fail 0.
- `node --test bio-plane/test/m/` (proof run): tests 5331, pass 5258, fail 62, skipped 0. The 62: network-notices 54 (activity 10, post 9, prepare 17, reads 11, seals 7) and scheduler `consumers.test.mjs` R5 (network-notices through `instanceSign`…): red 7; filings 3 (`outward` 2, `packet` 1; `attestationsOf`): red 7; control-plane `catalogue-end` R43/R22 and `families` R22: red 8; affordances `sources` R2 and promotion `write-path` R53: above. No red from case-authoring.
- `node checks/format.mjs .`: 91 modules, 90 requirements files; 0 failures.
- `node checks/architecture.mjs . case-authoring`: 18 product files, 95 relative imports; 0 failures.
- `node checks/coverage.mjs . case-authoring`: 42 of 42 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . case-authoring tranche/T25`: 4 files changed; 0 failures.

Size (session_01TvrujhMcaGJbTFhyyPqdMd): test runs 13, module lines 3421
