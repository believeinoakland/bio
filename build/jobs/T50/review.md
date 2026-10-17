# review (T50)

**Status** · session_01Ls3xVNM1EfFNgJtypzQMNt · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

R36 reads 'each concluded question ... with its findings' without saying what a question's findings are. My reading (building on it): a target and a concluded entry's `findings` are R12's per-id reading (present/absent, type, state, role, text) of the question's own bundle, for the draft's last editor in `copy`, for the viewer in `list`'s `concluded`; no further expansion into legs or other bundles (no service in my Uses lists them). Concluded questions are enumerated from the project document's `conclusions` rows and each judged by ratification.caseConclusionFor. If you mean the findings the question rests on, say which service lists them and I will add the edge.

## J2 · COMPLETE

**Entries applied (T50-72).** R35: the grant part of the copy (recipient's own grant and each roster row) carries `zone` beside `until`, read as retrieval R69 reads it (local-facts' governing value, else the profiles' own, else `null`; two zones govern none); written nothing. R36: `draft` already kept `targets` and `copy` already reads them as R12 does; added `list`'s `concluded` / `concluded_truncated` (concluded questions enumerated from the project document's `conclusions` rows, each judged by `ratification.caseConclusionFor`, oldest conclusion first, capped as R14, dead answer without standing). My reading of "findings" is in J1 (QUESTION), no answer needed unless it differs.
**Deferred:** none. **Other modules:** none found. No new sentences (rule 6): no word keys used.
**Tests:** `node --test bio-plane/test/m/review/`: 59 pass, 0 fail (new `zone-concluded.test.mjs` names R35 and R36 with controls; copy.test.mjs and doors.test.mjs updated for the new answer shapes). No layer tests named.
**Checks:** format 0 failures; architecture 0 failures; coverage review 36 of 36 live ids named, 0 failures; ownership 6 files, 0 failures; `checks/run.mjs` shows no review line failing (other modules' coverage reds are inherited).
**Note for BOB:** `review` provided answers changed shape (grant `zone`; `list` `concluded`): consumers in later layers (screens-publish, control-plane envelope) read them.
Size (session_01Ls3xVNM1EfFNgJtypzQMNt): test runs 8, module lines 1430
