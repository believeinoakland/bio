# steps (T51)

**Status** · session_01WtREN7u96ssU34h4ftCLDF · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Another module's finding, found while doing T51-220 (steps).

`bio-plane/src/investigation/checks.mjs:26` holds `INVESTIGATION_MEMBER_ONLY`'s translation as an inline sentence: "Only a member does this, in their own words and by their own choice. Nothing was written." That is the same text as the `refusal.STEP_MEMBER_ONLY` row, so the words check counts it as a copy of a words.json `en`.

Not changed here: investigation is another module, so its owner fixes it. The fix is the same as in steps (`word("refusal.INVESTIGATION_MEMBER_ONLY")`, the row exists in rows.mjs). Its own words-pass entry is the place for it.

Otherwise nothing found in another module that my change touches. The `notice-producers` sentence "a later arrival is steps' …; no outcome moves by itself." is the source of the test copy I removed from steps' follow.test.mjs; notice-producers itself is unchanged.
