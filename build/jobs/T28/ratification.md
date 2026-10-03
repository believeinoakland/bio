# ratification (T28)

**Status** · session_01KY9hTGfankh8NKom3Z2q59 · depth 2 · WORKING · handled B1

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
