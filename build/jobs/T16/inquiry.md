# inquiry (T16)

**Status** · session_01H5mTTXgEPXqH137mj1KHYa · depth 2 · WORKING · handled B2

## J1 · QUESTION

N369, the catch in `contradictionFindings` (`src/inquiry/contradiction.mjs`:208–211). No existing row is true of it: C-2.11 says the link is not a candidate id, and the only nearby row for a check that threw, C-102.3 `AUDIT_CHECK_FAILED`, is the audit's and says "the audit changes nothing". My best reading, which I am building now: a new row in inquiry's own table, awaiting T17's stamp (promotion's, N318):

| C-2.18 | `CONTRADICTION_ARM_FAILED` | "The check of this question's contradiction fields (its link, its resolution, what it explores) stopped with an error instead of answering, so the question is refused rather than let through. The error is in the check and says nothing yet about the document. Nothing was written." |

`where`: `src/inquiry/contradiction.mjs contradictionFindings > is-contradiction-arm-judged` (a DEC-49 region round the catch). It stays inside `BASIS_REFUSED` with the other R47 findings (R11), so the document fails closed as today; only the code and the words change. It needs R38's list (C-2.11–C-2.17 → C-2.18) and R47 a line ("a document the arm cannot judge is `CONTRADICTION_ARM_FAILED` (C-2.18); it never passes"). If you prefer another code or wording, answer and I will rename.

## Completion (INQUIRY #5)

**Entries applied**
1. **N369.** The catch in `contradictionFindings` (`src/inquiry/contradiction.mjs`, now the region `is-contradiction-arm-judged`) no longer spells C-2.11: it answers `CONTRADICTION_ARM_FAILED`, a new row **C-2.18** in `INQUIRY_CONTRADICTION_CHECKS` (my J1 reading, kept by BOB's B2, K543; R47's arm "An arm that cannot judge" and R38's C-2.11–C-2.18 are folded, and after merging `tranche/T16` the eight rows in my table equal the requirement's table word for word). The test names R47's new arm in its title. It still refuses inside `BASIS_REFUSED` (R11), so the document fails closed as before. C-2.15's translation is now the requirement's re-worded text (K530). The scalar-resolution case (`resolution: "irreconcilable"`) moved inside `is-resolution-complete` and goes through the one `incomplete` helper, so `RESOLUTION_INCOMPLETE` has one literal site. The test's R38 table carries both rows as worded; a C-2.15 arm drives the scalar case (a string and a list).
2. **N360 (K495).** `divide` gives each child its apportioned legs **verbatim**: the leg's own lines from the parent's bytes (new `blockEntries` in `text.mjs`), so `content_id`, every `extent_*` field and `extent_capture` travel. Where the block cannot be lined up with the parsed legs (a replayed shape), a rebuild writes every leg field, the passage fields included. Test: a child's leg names the parent leg's passage, field for field and line for line, and the child's `inquiry_basis` row rests on that passage (it fails on the old code).
3. **W2 (K494).** No test pinned R36's struck clause (the column move): `promotion.test.mjs` R36 and `contradiction.test.mjs` R36 test only `bundle_id` and purge, and R40's test pins `bundles.inquiry_subject_entity` as the read contract. Nothing to re-anchor.
4. **Provenance R51 (K538).** The grade reading treats `CAPTURE_RECEIVED_NOT_FETCHED` as it treats `CAPTURE_ROUTE_UNRECORDED` (`AUTHORED_ROUTE_BASES`, exported): the author's letter under `captureGrade`'s `ceiling`. When no capture of the document came by a measured route, the earned entry says so: `stated_as: "authored"`, `route_basis`, and a `why` that says "stated as authored and never as measured" in place of the old "as this instance fetched them" (which was false for the unrecorded route too). A document with a measured route as well (direct) answers as measured. Test in `earned.test.mjs` (doorbell, unrecorded, doorbell plus direct; a leg at or under the ceiling passes the grammar, above it is refused; it fails on the old code).

**Fixed in my module besides (R24, R34, R8).** A grouped inquiry could not be divided at all: each child copied the parent's `grounds` block but dropped its legs' `ground` labels, so every child was refused `CHILD_REFUSED` ("declares 'g1', which no basis leg belongs to"). Now a child given every leg of each group its legs belong to carries those groups verbatim (labels and rows, asserter and date unchanged); a child given part of a group carries no partition (the ungrouped, weakest-leg reading), because a group's row asserts that *its* legs together are enough, and nobody asserted that of a part. My ruling on a detail R24 does not settle; test in `divide.test.mjs`.

**Not yet met marks** · met: R47's "An arm that cannot judge" *(not yet met: N369)* (K543), for BOB to strike. R31 stays marked, its `test.todo` unchanged.

**Check rows (promotion's stamp, T17, N318)** · added C-2.18 `CONTRADICTION_ARM_FAILED` (`src/inquiry/contradiction.mjs contradictionFindings > is-contradiction-arm-judged`), awaiting stamp; C-2.15's translation changed (K530's wording), awaiting stamp. No row moved or retired.

**Grep** (`civicos-ui/`, affordances, everything else outside my paths) for `CONTRADICTION_ARM_FAILED`, `AUTHORED_ROUTE_BASES`, `blockEntries`, `stated_as` and the old texts:
- `civicos-ui/check-refusal-codes.mjs`:3852–3858: the comment names the old catch (:208–211) and `MULTI_SITE_CLOSED` declares `RESOLUTION_INCOMPLETE` as two literals. Now stale: its arm G fails "RESOLUTION_INCOMPLETE is declared in MULTI_SITE_CLOSED but is not multi-site on this tree". legacy-tests' (reported).
- `bio-plane/dist/bio-plane.bundled.mjs`:61557, :61870: the old C-2.15 text and the old catch. A generated artifact (`not_product`'s), made stale by this job; not rebuilt.
- Nothing in affordances.

**Found in other modules**
- **reevaluation** (`test/m/reevaluation/corrected.test.mjs`:84–101, "R27: only a live leg rests on anything"): the test pins the old `divide` behaviour N360 fixes ("the child that took the leg holds it on the whole document, not on the passage, so it is not caused either": `after` deepEqual `[Q, D]`, and `!after.includes(C1)`). With the leg carried verbatim, the child C1 (`INQ-2026-0007-first`) now rests on the passage and is owed the `corrected` cause, which is what N360 asks for ("so a child inherits reevaluation R27's passage-level corrected cause"). The test is red on this branch (57 of 58, 58/58 without my change). Reevaluation re-anchors it: C1 is caused, the divided parent is still not.
- **legacy-tests** (the DEC-49 guard, `civicos-ui/check-refusal-codes.mjs`): the `RESOLUTION_INCOMPLETE` declaration above is stale; the two `CONTRADICTION_LINK_MALFORMED` failures are gone; C-2.18 adds one row, one region and one governed site to the floors it re-pins (families unchanged by me: C-2.18 joins the existing family).
- **ratification / legacy-checks** (`test/m/ratification/checks.test.mjs`:133, "R8, N211"): red with and without my change (legacy-checks' copy answers `bio-case-document/4`, the catalogue `/5`). Not mine; noted in case it is not already known.
- `test/machinefences-dec49.test.mjs` fails as a file (0 pass) on `tranche/T16` too. Not mine.

**Deferred** · none.

**Tests and checks**
- `node --test test/m/inquiry/`: tests 79, pass 78, fail 0, todo 1 (R31); re-run after merging `tranche/T16` for B2, the same.
- The users of inquiry: citation 49/49, basis-versions 47/47, strength 45/45, contradiction 84/84, ai-runs 49/49, run-productions 35/35, capture-requests 62/62, intent 51/51, reevaluation 58 pass 1 fail (above, the pinned old behaviour), publication 100/100, ratification 73 pass 1 fail (pre-existing, above), case-authoring 53/53, conformance 46/46, consequences 24/24, actions 40/40, affordances 90/90, queue 69/69, control-plane 57/57; queue-producers has no tests yet.
- `format`: 72 modules, 67 requirements files; 0 failures. `architecture`: 17 product files, 56 relative imports; 0 failures. `coverage`: 48 of 48 live requirement ids named by a test; 0 failures. `ownership` (tranche/T16): 8 files changed; legacy-store and legacy-checks 0 lines added; 0 failures.

Size (session_01H5mTTXgEPXqH137mj1KHYa): test runs 35, module lines 3542
