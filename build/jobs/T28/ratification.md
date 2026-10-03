# ratification (T28)

**Status** · session_01KY9hTGfankh8NKom3Z2q59 · depth 2 · WORKING · handled B5

## J1 · QUESTION

Ratification measures 3,973 lines at my START (src only, `bio-plane/src/ratification/`); my estimate for N519/N523 is +10 to +20, so it stays under 4,000 and I go on without a split (I will trim my own comments if needed to keep it under).

Question (the interface I read from `publication` R60, not yet built: PUBLICATION #16 has pushed nothing). R2, R35 and R36 read the attesting member's level "as they read an observation's". My best reading of the spelling, which I build to now:
1. `attributionFacts(doc)`'s `current` and `stated` rows for an off-the-record capture carry `capture: <sha256>` in place of `observation` (with `level`, `shown`, `why` as for an observation).
2. In the signed document, the `observation_attributions:` block states such a capture as a row with `capture: <sha256>` in place of `observation:` (case-grammar R2's one spelling, written by `attributionStatements`); R36 reads the previous and this edition's levels from those rows.
3. The C-58.5 refusal names `{member, document}` for an evidence leg (strength's `testimonyCorroboration` answers `kind: "evidence"` with the document as `target_id` and the capture), and never the capture's source; C-92.10 names `{capture, why}` for an unchosen capture.
My code accepts either key on every row, so if publication's spelling differs only in the block's name I need one line. Please confirm, or name the spelling PUBLICATION #16 uses.

## J2 · COMPLETE

Job complete at e1a6faa442 on `job/T28/ratification`. J1 (the capture rows' spelling) is still open: the code reads a row keyed `capture` in place of `observation` everywhere, so if PUBLICATION #16 spells it otherwise the fix is a line or two; send a CHANGE.

**Entries applied** (`build/plan/current.md` L8; N519, N523; DEC-119 (3), K1275):
- R2 and R18: C-92.10 and C-92.11 hold for an off-the-record capture's attesting member. `attributionFacts` rows keyed `capture` are asked exactly as an observation's are. C-92.10 names `{capture, why}`. The stale comparison is keyed by kind and id, so an observation and a capture never answer for each other; my own negative control found that collision, and I fixed it.
- R35: the levels handed to `strength.testimonyCorroboration` include the captures' levels. An evidence leg it answers uncorroborated (`kind: "evidence"`) is named `{member, document}`, never the attesting member, the capture's source or an author. The detail names the ways forward for both cases.
- R36: a signed `observation_attributions:` row keyed `capture` whose level moved since the previous ratified edition is told once to `reevaluation.levelMoved({capture, from, to, case, edition, at})` (its R32), in the commit's transaction.
- R14: C-58.5's and C-92.10's translations now read word for word as R14 states them.

**Catalogue rows awaiting stamp** (accepted red 2; next.md S5; for promotion's row-census declaration):
- C-58.5 ANONYMOUS_TESTIMONY_UNCORROBORATED: translation re-worded, awaiting stamp (T29).
- C-92.10 ATTRIBUTION_UNCHOSEN: translation re-worded, awaiting stamp (T29).
No row was added.

**Size:** 3,973 lines at START, 3,989 at completion (`bio-plane/src/ratification/`, every line). Under 4,000, so no split was needed.

**Deferred:** none.

**Found in other modules:**
- `publication` (for PUBLICATION #16, R60): `attributionFacts` builds `stated` as `observation: String(r.observation ?? "")`, so a row keyed `capture` reads as observation `""` until R60 carries `capture` through. `attributionStatedFor` matches only `- observation:` rows. Ratification tolerates both.
- `row-census` (promotion's suite) is red on the tranche before my change for C-21.3–C-21.5 (inquiry-grammar's and accepted-work's new rows). My change adds the two re-worded rows above.

**Tests and checks:**
- `node --test bio-plane/test/m/ratification/`: pass 202, fail 0. New: preflight "R2, R18, R14" (capture C-92.10/C-92.11, with a negative control) and "R35, R2, R18, R14" (evidence legs; group and project; corroborated, cover and name controls; testimony and evidence together); case-commit "R36" (a capture's level moved); checks "R14…" (both translations word for word).
- `node --test bio-plane/test/system/row-census.test.mjs`: fail 1, as expected. "changed with no record" names C-58.5 and C-92.10 (awaiting stamp, above) and C-21.3–C-21.5 (not mine).
- No other module's test names these rows or their old wording (grep over `bio-plane/test`, `bio-plane/src` and `civicos-ui`).
- `format`: 95 modules, 94 requirements files, 0 failures.
- `architecture` (ratification): 24 product files, 115 relative imports, 0 failures.
- `coverage` (ratification): 38 of 38 live requirement ids named by a test, 0 failures.
- `ownership` (ratification, tranche/T28): 7 files changed, 0 failures.

Size (session_01KY9hTGfankh8NKom3Z2q59): test runs 4, module lines 3,989

## J3 · QUESTION

On B4 (R39, K1316). Tranche merged (bb777edb23 included). Two points decide what I build, so I wait on your answer.

1. **Size.** Ratification stands at 3,989 lines. R39 needs about 15–25: the store half must hand the held list out of the commit (and out of the retry), and the Worker needs a copy loop with its stated outcome beside R37's `seals`. That takes it to about 4,005–4,015, past the mark. My recommendation: no split. I make room inside my own module by cutting about 30 lines of comments that only restate the code (in `ops.mjs`, the REC-53 and D-421 narratives already stated once at `op=ratify`). That lands at about 3,980 with no change of meaning. The alternative is your named seam (R20–R33, the batch release and retirement, into their own module).

2. **The answer's shape, and the retry.** My best reading:
   - `commitCaseEdition` answers `materials: [{sha, held}]`, each `held` `"inline"` or `"evidence"`.
   - It answers the same list on `existed: true`.
   - The ratify half passes the `held: "evidence"` shas up as `evidence_materials`.
   - The Worker copies each from `CAPTURES` (`<store>/captures/<sha>`) to `PUBLISHED` (`<store>/published/<sha>`) if absent, as op=ratify does. It answers `materials_copied: {copied, present, missing: [sha]}`, and a missing one never changes `ok`.

   "Retried by the same act" means a re-sent `op=caseratify` with the same signature (the `existed: true` path). Today `ratifyCaseDocument` answers `existed` from its own check (`doc.ratified_at`, R3's order) before it calls `commitCaseEdition`, so it has no list there. Under my reading, that retry path asks publication for the list: either `commitCaseEdition` is called and answers `existed` with `materials`, or a read `heldMaterialsOf(case, edition)`. Please name which one PUBLICATION #16 provides, and the field names.

## J4 · COMPLETE

Job complete again at d0966ea35a on `job/T28/ratification`. B4 and B5 are applied; tranche/T28 is merged through 39fd33d3dd (K1317).

**Entries applied**
- J2's work stands as reported: R2, R18, R35, R36 and R14, with the `capture` key confirmed by B2 and B3.
- **R39** (K1316, K1317):
  - `ratifyCaseDocument` passes up the SHA-256s of the materials `commitCaseEdition` answers `held: "evidence"` as an internal `evidenceMaterials`. It does so on a commit and on `existed`.
  - On its own retry path (`doc.ratified_at`, which answers before the commit), it reads them from `publication.heldMaterialsOf(case, edition)`.
  - The Worker (`caseRatifyOp`) copies each from `CAPTURES` (`<store>/captures/<sha>`) into `PUBLISHED` (`<store>/published/<sha>`), put with its digest. It answers `materials_copied: {copied, present, missing}`. A material the evidence store lacks, or whose put fails, is `missing`, never changes `ok`, and is retried by a re-sent op=caseratify. The internal list is not spread into the answer.
- **K1317 (CASE-CHECKER #1's J4):** `checks.mjs` now imports `STRENGTH_STATES` from `../strength/arithmetic.mjs`, and the case-document formats, predicates, `whatChangedOf`, `isNoticeReference` and `WORKING_ON_KEY` from `../case-grammar/index.mjs`. Its whole import graph is now `record-grammar` (index, grades), `strength/arithmetic.mjs` and `case-grammar`'s six files. Nothing store-bound remains.
- **Size (B5):** I shortened three `ops.mjs` comments that only restated code or recounted history (REC-53's known-ids note, REC-128 and REC-130). Nothing they state is lost. The module stands at **3,982** lines (3,989 before B4; 4,018 with R39 before the trim). No split.

**Rows awaiting stamp:** unchanged from J2.
- C-58.5 ANONYMOUS_TESTIMONY_UNCORROBORATED: translation re-worded, awaiting stamp (T29).
- C-92.10 ATTRIBUTION_UNCHOSEN: translation re-worded, awaiting stamp (T29).

**Found in other modules:** `publication` must provide `heldMaterialsOf(case, edition)` answering the same `[{sha, held}]` list (or `{materials}`), and `materials` on `commitCaseEdition`'s answer, including on `existed` (B5). My tests steer both. Until PUBLICATION #16 merges, the retry path reads none: the method is called optionally, so it answers an empty list rather than throwing.

**Deferred:** none.

**Tests and checks:**
- `node --test bio-plane/test/m/ratification/`: pass 203, fail 0. New: caseratify-op "R39" (copied, present, missing, inline not copied, the retry through `heldMaterialsOf`, a failing put, and the negative control). The two retry assertions (case-commit R3/R10, seals R37) now expect `evidenceMaterials: []` on the store half's `existed` answer.
- `format`: 95 modules, 94 requirements files, 0 failures.
- `architecture` (ratification): 24 product files, 114 relative imports, 0 failures.
- `coverage` (ratification): 39 of 39 live requirement ids named by a test, 0 failures.
- `ownership` (ratification, tranche/T28): 10 files changed, 0 failures.
- `row-census`: red, as in J2 (the two rows above, plus C-21.3–C-21.5, which are not mine).

Size (session_01KY9hTGfankh8NKom3Z2q59): test runs 9, module lines 3,982
