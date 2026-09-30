# inquiry (T15)

**Status** · session_01Ew9rdcsPSSYPHdbKmBr6Hv · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings I am building on; neither stops the job.

1. **R47's `qualifiers: {a?, b?}` cannot be written.** The restricted frontmatter grammar has no map inside a map: `resolution:` → `qualifiers:` → `a:` is refused C-2.1 ("key 'a' indented 4 does not fit the restricted grammar"), and an inline `{a: …}` parses as a string. My reading: in the bytes, `resolutionLines` writes the two qualifiers as `qualifier_a` and `qualifier_b` inside the `resolution` block; the grammar (R47) reads them as the logical `qualifiers: {a, b}` (each at most 200 characters), refuses a `qualifiers` key in the bytes as `RESOLUTION_INCOMPLETE` naming the field, and `contradictionLink` (R48) answers the logical `qualifiers: {a, b}`. Contradiction writes only through `resolutionLines` and reads only through `contradictionLink`, so no other module sees the byte form. If you want a different byte form, say which; the change is local to this module.

2. **R36's older clause, "the columns this module writes on `bundles` … move to a table of its own keyed by `bundle_id` (K75 (3))", contradicts R40**, which makes `bundles.inquiry_subject_entity` a stated read contract that `contradiction` joins in its own SQL. My reading: the N345 mark on R36 covers only its new clause (the table holding R48's projection, keyed by `bundle_id` and declared to purge), which I build; the three `bundles` columns stay where they are until a requirement change resolves R36 against R40, and I record R36's older clause as not met in my record rather than break R40 and contradiction's join.

## J2 · REPORT

Found in other modules while applying N345 (commit 66b4767370):
1. **promotion (N318): seven rows added at layer 6, `awaiting stamp` for T16.** C-2.11 `CONTRADICTION_LINK_MALFORMED`, C-2.12 `RESOLUTION_WITHOUT_CONTRADICTION`, C-2.13 `RESOLUTION_MISSING`, C-2.14 `RESOLUTION_KIND_UNKNOWN`, C-2.15 `RESOLUTION_INCOMPLETE`, C-2.16 `EXPLORES_MALFORMED`, C-2.17 `CANDIDATE_ALREADY_TAKEN_UP`, in the new table `INQUIRY_CONTRADICTION_CHECKS` (`bio-plane/src/inquiry/checks.mjs`). No row moved or retired. **Composition:** the promote gate's inquiry step now also runs R47's arm and C-2.17. It moves no existing row.
2. **legacy-tests:** `test/row-census.test.mjs` fails 6 pass, 2 fail ("no snapshot of 1.45.0"). It fails the same way on `tranche/T15` without this change. Its re-anchor should declare the seven rows above as `arrived`, `awaiting stamp`, by name, against `build/jobs/T15/inquiry.md`.
3. **control-plane (layer 11):** no new op. R48's `contradictionLink` and `inquiryOfCandidate` are in-process reads for `contradiction` (R16's terms), not routed, with no stamps. The promote op needs no new stamp: the arm reads only the document.
4. **contradiction:** reads from `inquiry/index.mjs`: `RESOLUTION_KINDS`, `resolutionFamily`, `resolutionLines` (the only writer of the byte form: `qualifier_a`/`qualifier_b`, K487), `CONTRADICTION_COORDINATES`, `PLURALITY_DIFFERENCES`, `DISSOLVED_BY`, `NORM_CANONS`, `CANDIDATE_RE`, `contradictionLink(id)`, `inquiryOfCandidate(candidate)`. Take-up writes `contradiction:` / `  candidate: <id>` into the document. A second take-up of a held candidate is refused C-2.17 at the promotion, naming the holder in `inquiry`. A divided parent keeps its candidate, and its children carry no link.
5. **Generated artifact, stale, not rebuilt (§14):** `bio-plane/dist/bio-plane.bundled.mjs` (the plane bundles `src/inquiry/`).
6. **Grep:** no hit in `civicos-ui/` or in affordances' or queue's lists for any name added (`RESOLUTION_KINDS`, `DISSOLVED_BY`, `NORM_CANONS`, `resolutionLines`, `contradictionLink`, `inquiryOfCandidate`, the seven codes). Nothing was retired.
