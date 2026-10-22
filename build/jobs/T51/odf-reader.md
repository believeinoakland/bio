# odf-reader (T51)

**Status** · session_01Y3a7inMeXF8xJY4JE2EiKK · depth 2 · WORKING · handled B3

## J1 · REPORT

Found in another module, not changed (ooxml, not odf-reader). The words check, `inline` arm, reads eight string literals in `bio-plane/src/ooxml.mjs` as sentences people read: lines 773, 834, 854, 927, 929, 933, 965 and 978 (for example "odf:{} is first but COMPRESSED (method {}, ODF requires stored)" and "odf:mimetype declares {}, but {} is ABSENT"). Lines 927, 933, 965 and 978 are the ODF mimetype diagnostics that odf-reader's detect and digest rely on through `discriminate`; the others are the OOXML part-declaration diagnostics. My read: these are developer or diagnostic signals, not member-facing text, so they may belong on the design's `unkeyed` list (K3944) rather than in `localize`. Please route to ooxml's owner. odf-reader does not depend on their wording, which its tests assert by behaviour.

Also seen, not mine: the repo-wide run reports 4839 failures (4844 before my change), all inherited from other modules' words and testcopy findings.

## J2 · COMPLETE

Entries applied: T51-250, the five `plain` findings in `bio-plane/src/odf.mjs` (K3957), each judged a sentence a member reads, so each now goes through `localize` with a key fixed once (commit aae68e82ef):
- line 713, meta.xml absence detail, R28: `odf-reader.odf.this_package_carries_no_meta`
- line 1048, structure()'s guard note, R10: `odf-reader.odf.content_xml_not_read_over`
- line 2265, `ODF_EVIDENTIARY_MEASURED.odt`, R37 basis: `odf-reader.odf.content_xml_with_text_list`
- line 2268, `ODF_EVIDENTIARY_UNMEASURED.odp`, R33 basis: `odf-reader.odf.no_odp_export_has_been`
- line 2382, the not-certain refusal basis, R32: `odf-reader.odf.the_bytes_are_not_an`
Same class, not flagged, converted in the same pass for consistency: `ODF_EVIDENTIARY_MEASURED.ods` (`odf-reader.odf.content_xml_byte_identical_across`), and the two UTF-8 refusal bases in the digest (`odf-reader.odf.content_xml_is_not_valid`, `odf-reader.odf.content_xml_is_not_valid_2`). Wording is unchanged. No sentence was judged unread by any member, so nothing is listed for the `unkeyed` list.

Deferred, and why: `bio-plane/test/m/odf-reader/digest.test.mjs` asserts two of these bases by regex (the "not an OpenDocument package" refusal and the ".odp export has been measured" refusal). The check passes them, and I left them so as not to widen the change. Under K3810 they hold sentence fragments, so once BOB regenerates the rows I'd move them to `localize`/key comparisons. This is a question for BOB, not a blocker.

Found in another module (see REPORT above): eight inline strings in `ooxml.mjs`.

Tests and checks:
- `node --test test/m/odf-reader/*.test.mjs` (in bio-plane): 70 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 174 modules, 173 requirements; 0 failures.
- `node checks/architecture.mjs /home/user/bio odf-reader`: 12 product files, 0 failures.
- `node checks/coverage.mjs /home/user/bio odf-reader`: 47 of 47 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio odf-reader tranche/T51 job/T51/odf-reader`: 1 file changed by odf-reader, 0 failures.
- `node checks/run.mjs /home/user/bio`: the words check shows no finding in odf-reader or `odf.mjs`; `plain` 2137 to 2132. The run exits 1 on other modules' inherited failures only (4844 to 4839), as above.

Size (session_013zPuS6aCiGt1Nqw5Gii5vD): test runs 1, module lines 2413

## J3 · COMPLETE

CHANGE B2 (K3960) handled. Merged tranche/T51 into job/T51/odf-reader (merge commit 5795b25470). The recomputed "Plain findings (K3957)" section reads "None left", so no code change this round: the five findings I converted in aae68e82ef are on the design's unkeyed list (DEC-343). `bio-plane/src/odf.mjs` is unchanged by the merge.

Checks after the merge:
- `node --test test/m/odf-reader/*.test.mjs` (bio-plane): 70 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio odf-reader`: 0 failures.
- `node checks/coverage.mjs /home/user/bio odf-reader`: 47 of 47 live requirement ids named by a test.
- `node checks/ownership.mjs /home/user/bio odf-reader tranche/T51 job/T51/odf-reader`: 1 file changed by odf-reader, 0 failures.
- `node checks/run.mjs /home/user/bio`: no odf-reader or `odf.mjs` finding; the run exits 1 on other modules' failures only (4174 now, down from 4839 after the merge).
- `node bio-plane/src/setup-words/build.mjs --check` (read-only): does not name odf-reader. It reports `rows.mjs` as stale for `doc-clean.images` (word 16640). That is another module's generated artifact; I did not regenerate it.

Still open from J1 and J2: the eight inline strings in `ooxml.mjs` (for BOB to route to ooxml's owner) and the two regex assertions in `digest.test.mjs` (a question for BOB about moving them to key comparisons once rows are regenerated).

Size (session_013zPuS6aCiGt1Nqw5Gii5vD): test runs 2, module lines 2413

## J4 · COMPLETE

CHANGE B3 (K3968; K3965) handled. Merged tranche/T51 into job/T51/odf-reader (the merge brought my `odf.mjs` change into the tranche, so ownership now reports 0 odf-reader files changed against the tranche).

Done: the two regex assertions in `bio-plane/test/m/odf-reader/digest.test.mjs` now compare by equality with `localize`: the not-certain refusal (`odf-reader.odf.the_bytes_are_not_an`) and the unmeasured `.odp` basis (`odf-reader.odf.no_odp_export_has_been`), each with its en text. Commit is on the job branch and pushed. The file imports `localize` from `src/setup-words/index.mjs`.

Checks:
- `node --test test/m/odf-reader/*.test.mjs` (bio-plane): 70 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 0 failures.
- `node checks/architecture.mjs /home/user/bio odf-reader`: 0 failures.
- `node checks/coverage.mjs /home/user/bio odf-reader`: 47 of 47 live ids named by a test.
- `node checks/ownership.mjs /home/user/bio odf-reader tranche/T51 job/T51/odf-reader`: 0 files changed against the tranche, 0 failures.
- `node checks/run.mjs /home/user/bio`: no odf-reader or `odf.mjs` finding; exits 1 on other modules' failures only (4174).
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note names other modules (for example `budget-doctypes`), not odf-reader; regenerating is left to R1's close, as B3 says.

Size (session_013zPuS6aCiGt1Nqw5Gii5vD): test runs 3, module lines 2413
