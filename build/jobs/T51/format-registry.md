# format-registry (T51)

**Status** · session_019Jfv3mJzeNs65nwh7mC8TQ · depth 2 · WORKING · handled B1

## J1 · COMPLETE

T51-251 (the words check's four `plain` findings, K3957) is applied and pushed as e3d48dccc2 on job/T51/format-registry.

**Applied**
- `bio-plane/src/formats.mjs`: the four flagged sentences are read through `localize` with dotted ids, English unchanged:
  - `format-registry.formats.no_magic_byte_match`, "no registered magic-byte signature matched" (was :134; R12)
  - `format-registry.formats.no_bytes_to_sniff`, "no bytes were available to sniff" (was :134; R12)
  - `format-registry.formats.no_content_type_declared`, "no content type was declared" (was :135; R12)
  - `format-registry.formats.magic_doctype_root_tag`, "magic: doctype/root tag in the first 1024 bytes" (was :161; R17, the html signal)
- `bio-plane/test/m/format-registry/registry.test.mjs`: the R9 and R12 tests read those sentences through `localize` with literal arguments, not as copied text. One new test, "R12, R17: the reasons the registry states are read by their word keys", names the four ids (K874).
- `build/words` generated files (`rows.mjs`, `words-unreviewed.json`) not touched. Until BOB regenerates at the layer close, `localize` answers the English and `hasWord` is false for the four new keys. That is expected, and it is the only step left for BOB.

**Deferred:** none.

**Found in another module:** none.

**Not changed, noted:** `formats.mjs:187` (pdf's "magic: %PDF- header in the first 1024 bytes") is a sibling sentence the plain arm does not count, because of the `%` and `-`. I left it as is. BOB may want it keyed in the same pass.

**Tests and checks** (from `/home/user/bio`, the process repo's checks)
- `node --test test/m/format-registry/`: 43 pass, 0 fail (42 before the new test).
- `checks/format.mjs`: 174 modules, 173 requirements files; 0 failures.
- `checks/architecture.mjs format-registry`: 0 failures.
- `checks/coverage.mjs format-registry`: 30 of 30 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs /home/user/bio format-registry tranche/T51 job/T51/format-registry`: 0 failures.
- `checks/words.mjs`, this module: 0 findings (`marker` was 4 before the test rewrite, now 0).
- `checks/run.mjs /home/user/bio`: format 0 failures, architecture 0 failures, channels 0 failures. Repo-wide coverage shows 33 failures and repo-wide words shows 4840 failures, both in other modules. This module's own coverage and words are clean.

Size (session_01GtJpPC5eXPwseWqdbYXLRA): test runs 3, module lines 394

## J2 · QUESTION

START says ooxml (3) and csv-reader (4) are merged before me. They are not: tranche/T51 holds neither decodeText (ooxml R36), ooxml.discriminate over a range source (ooxml R11) nor isDelimitedText (csv-reader R21); both jobs (OOXML #4, CSV-READER #5) have only posted their start. My best reading: I code to the section-2c interfaces through namespace imports (import * as ooxml / csv-reader), so the module loads before and after their merge; G130a (picture order) and the structure of R31/R32/R17 are built now; tests that need a provider's real function stay red by name (R-SEAM) until it merges, then I re-run and go COMPLETE. Say if you would rather I wait or stub differently. I do not need an answer to carry on.
