# inquiry (T15)

**Status** · session_01Ew9rdcsPSSYPHdbKmBr6Hv · depth 2 · COMPLETE · handled B2

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

## J3 · COMPLETE

**Entries applied** (layer 6's inquiry bullet: N345; B1, with the J1 readings confirmed in B2, K487). Commit 66b4767370: 6 files, +632 −4. New: `src/inquiry/contradiction.mjs`, `src/inquiry/checks.mjs`, `test/m/inquiry/contradiction.test.mjs`.
- **R46:** frozen `CONTRADICTION_COORDINATES`, `PLURALITY_DIFFERENCES`, `DISSOLVED_BY` (their union, plus `precision` and `opinion`), `NORM_CANONS` and `RESOLUTION_KINDS`. `resolutionFamily(kind)` answers DISSOLVED, CORRECTED or GENUINE, and null for anything else. `resolutionLines(resolution)` writes the `resolution` block in one fixed order (kind, coordinates, qualifier_a, qualifier_b, wrong_side, reason, canon). Each value is made frontmatter-safe by basis-versions R5's normalising, and a blank field is left out. It never throws. All are exported from `inquiry/index.mjs`.
- **R47** (C-2.11–C-2.16), in `contradictionFindings`, judged by R11 at every promotion of an inquiry that is not a replay:
  - The link: exactly `{candidate}`, with 64 lowercase hex.
  - A resolution without a link is refused, at any state.
  - At `concluded`: a missing kind, then an unknown kind, then each missing or ill-formed field named (`coordinates`, `wrong_side`, `reason`, `canon`, `qualifiers.a`/`.b`, or an unknown key, including a byte-form `qualifiers`). At any other state the resolution is kept and never read.
  - `explores`: exactly one of `coordinate`, `canon` or `hypothesis` (at most 500).
- **R11:** R47's findings inside `BASIS_REFUSED`, each with its code and translation. Then `CANDIDATE_ALREADY_TAKEN_UP` (C-2.17), naming the inquiry that holds the candidate.
- **R12 / R48:** the projection re-derives `inquiry_contradiction_links` whole at each promotion: the candidate, the logical resolution (only while concluded) and `explores`. There is no row for a plain inquiry. `contradictionLink(id)` and `inquiryOfCandidate(candidate)` are ungated in-process reads, and neither throws.
- **R36:** the new clause is met: `inquiry_contradiction_links` is keyed by `bundle_id`, indexed on `candidate`, and declared to the purge. **Not met, against R40 (K487; N358 resolves it):** the older clause that moves the `bundles` columns `inquiry_basis_count`, `inquiry_subject_entity` and `inquiry_superseded_by`.
- **R38:** C-2.11–C-2.17 are held in `INQUIRY_CONTRADICTION_CHECKS`, with the requirement's translations verbatim, each `where` naming a DEC-49 region in the source.
- **Improvement in this module:** `divide` strips the parent's `contradiction` and `resolution` from its children, so a child neither re-takes the candidate (C-2.17) nor carries a resolution without a link (C-2.12). Its pre-flight now also runs R47's arm.

**Awaiting stamp (T16):** rows C-2.11, C-2.12, C-2.13, C-2.14, C-2.15, C-2.16 and C-2.17 arrived at layer 6, `awaiting stamp`. The composition changed too: the promote gate's inquiry step runs R47's arm and C-2.17.
**Stamps for new ops:** none. This job adds no op, and R48's reads are in-process.
**`not yet met` to strike:** R11, R12, R46, R47, R48, R38, and R36's N345 clause. R36's older clause stays marked (above). R31 stays (MK-5).
**Deferred:** nothing.
**Reported (J2):** the promotion rows; the legacy-tests census re-anchor (red on `tranche/T15` before this change too); control-plane (nothing to route); contradiction's reading list; the stale `bio-plane` bundle; grep clean.

**Tests and checks**
- `node --test bio-plane/test/m/inquiry/`: tests 75, pass 74, fail 0, todo 1 (R31, MK-5).
- The suites of the modules that use inquiry, all 0 fail: citation 49, basis-versions 47, strength 45, contradiction 28, ai-runs 49, run-productions 35, capture-requests 62, intent 51, reevaluation 49, publication 91, ratification 74, case-authoring 39, conformance 36, consequences 24, actions 40, affordances 76, queue 69, control-plane 52 passes.
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture inquiry`: 17 product files, 55 relative imports; 0 failures.
- `coverage inquiry`: 48 of 48 live ids named by a test; 0 failures.
- `ownership inquiry tranche/T15`: 7 files changed; legacy-store and legacy-checks 0 lines added, 0 removed; 0 failures.

Size (session_01Ew9rdcsPSSYPHdbKmBr6Hv): test runs 7, module lines 3440
