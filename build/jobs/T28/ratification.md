# ratification (T28)

**Status** · session_01KY9hTGfankh8NKom3Z2q59 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Ratification measures 3,973 lines at my START (src only, `bio-plane/src/ratification/`); my estimate for N519/N523 is +10 to +20, so it stays under 4,000 and I go on without a split (I will trim my own comments if needed to keep it under).

Question (the interface I read from `publication` R60, not yet built: PUBLICATION #16 has pushed nothing). R2, R35 and R36 read the attesting member's level "as they read an observation's". My best reading of the spelling, which I build to now:
1. `attributionFacts(doc)`'s `current` and `stated` rows for an off-the-record capture carry `capture: <sha256>` in place of `observation` (with `level`, `shown`, `why` as for an observation).
2. In the signed document, the `observation_attributions:` block states such a capture as a row with `capture: <sha256>` in place of `observation:` (case-grammar R2's one spelling, written by `attributionStatements`); R36 reads the previous and this edition's levels from those rows.
3. The C-58.5 refusal names `{member, document}` for an evidence leg (strength's `testimonyCorroboration` answers `kind: "evidence"` with the document as `target_id` and the capture), and never the capture's source; C-92.10 names `{capture, why}` for an unchosen capture.
My code accepts either key on every row, so if publication's spelling differs only in the block's name I need one line. Please confirm, or name the spelling PUBLICATION #16 uses.
