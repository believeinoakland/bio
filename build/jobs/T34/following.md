# following (T34)

**Status** · session_01PHvCR5g2gvUo33ZsaVz5zA · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

T34-70: two more of my refusal codes are already held by other families, so giving them C-137 rows as they stand would put each in two families, against "no code is held in two families": `BAD_CADENCE` is answers C-135.10 (a standing question's cadence, a different act) and `MEMBER_ACT_ONLY` is money-checks' row (a machine credential refused; mine, in `refreshRegister`, also refuses a member who is not the follow's author). Neither code is in my requirements (Suggestions 7: "Refusal codes are this draft's"). My best reading, on which I am building now: re-key both, as K1836 did `NO_SUCH_ADDRESS`: `BAD_CADENCE` → `BAD_FOLLOW_CADENCE` and `MEMBER_ACT_ONLY` → `NOT_THE_FOLLOWER`, each with its C-137 row; the other 18 codes (incl. `NO_SUCH_MEETING_ADDRESS`) are held by no family today and keep their names. If you prefer other names, say so and I rename before COMPLETE.

## Completion (T34-70)

**Entries applied.**
- T34-70 (N620; K1686, K1836): following's own checks family, C-137, in a new `bio-plane/src/following/checks.mjs` (`FOLLOWING_CHECKS`, rows `{check, where, translation}`, and `followRefusal`, which answers DEC-49's `code`, `check`, `translation`, `detail` beside `reason`). Every refusal of the module now carries its row (the old bare `refuse` is `followRefusal`). 20 rows, one per refusal code. Re-keyed so no code is held in two families: `NO_SUCH_ADDRESS` → `NO_SUCH_MEETING_ADDRESS` (K1836); `BAD_CADENCE` → `BAD_FOLLOW_CADENCE` (answers' C-135.10 held it) and `MEMBER_ACT_ONLY` → `NOT_THE_FOLLOWER` (money-checks held it), both by J1 and B2 (K1855 (2)). Each translation says what the code already said; none names a place or the group's system (DEC-149: none needs the name). `meetings.test.mjs`:65 and :70 moved to `NO_SUCH_MEETING_ADDRESS`; `body.test.mjs` and `registers.test.mjs` to the two other new codes.
- **Awaiting stamp** (plan Rules (5) 4; until T35's promotion job), each a new row: C-137.1 MACHINE_CANNOT_FOLLOW, C-137.2 NO_SUCH_HOME, C-137.3 NO_SUCH_BODY, C-137.4 NO_LEGISTAR_ID, C-137.5 BAD_PERIOD, C-137.6 BAD_FOLLOW_CADENCE, C-137.7 NO_SUCH_FOLLOW, C-137.8 NOT_THE_AUTHOR, C-137.9 NO_LOCATOR, C-137.10 BAD_RENDER, C-137.11 BAD_GATE, C-137.12 PERSON_QUERY_NOT_NAMED, C-137.13 NO_KEY, C-137.14 NO_SUCH_MEETING_ADDRESS, C-137.15 NO_SUCH_SNAPSHOT, C-137.16 NOT_GATED, C-137.17 NOT_THE_FOLLOWER, C-137.18 PRICE_FIRST, C-137.19 NO_CREDENTIAL, C-137.20 NOT_READ. These rows are `awaiting stamp`.
- K1738 (named red, `body.test.mjs`:71 R2): the fixture's `legistar_body` scheme is in the `body` space. A second cause stood behind it: the test profile now holds `vote_values` (Content, Not content, Abstains; jurisdictions R58), so the fixture's Legistar votes are written with the profile's labels and R2 expects the value `content` (events R11, K1788). Cleared.
- B3 (K1855 (3)): `fixture.mjs`'s monitoring stand-in answers monitoring's current per-meeting reason ("your group's Civicsmith").

**Deferred.** Nothing.

**Found in other modules.** Nothing new. Expected, accepted by name: control-plane `families.test.mjs` R22 totality walk names `bio-plane/src/following/checks.mjs FOLLOWING_CHECKS` (and `index.mjs`, which re-exports the same row objects; listing `checks.mjs` reaches both by identity) until T34-60 (K1836, accepted red 9); the row census reports the 20 C-137 arrivals until T35's stamp (Rules (5) 4). No other module names the three re-keyed codes. No generated artifact of another module is made stale by this job beyond the plane bundle (regenerated at L10's close).

**Tests and checks.**
- `node --test bio-plane/test/m/following/`: 44 tests, 44 pass, 0 fail (new `checks.test.mjs`: one test per C-137 row driving the act that refuses, the family's shape and code uniqueness against every other plane module's `*_CHECKS`, and DEC-149/R18 over the translations).
- `node --test bio-plane/test/m/scheduler/` (uses following): 81 pass, 1 fail, the inherited scheduler R12 (K1708), identical without this job's change.
- No layer tests (`build/manifest.md`).
- `checks/format.mjs`: 129 modules, 128 requirements files; 0 failures. `checks/architecture.mjs … following`: 13 product files, 40 relative imports; 0 failures. `checks/coverage.mjs … following`: 19 of 19 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … following tranche/T34`: 8 files changed; 0 failures.

Size (session_01PHvCR5g2gvUo33ZsaVz5zA): test runs 12, module lines 1109

## J2 · COMPLETE

T34-70 applied: C-137 (20 rows, `following/checks.mjs`, `FOLLOWING_CHECKS`), every refusal carrying its row; `NO_SUCH_ADDRESS` → `NO_SUCH_MEETING_ADDRESS`, `BAD_CADENCE` → `BAD_FOLLOW_CADENCE`, `MEMBER_ACT_ONLY` → `NOT_THE_FOLLOWER` (K1836, K1855 (2)); rows awaiting stamp. K1738 red cleared (body space; and the profile's vote labels, events R11). B3 applied after merging tranche/T34. following 44/44; scheduler 81/1 (inherited R12, K1708, unchanged); format, architecture, coverage (19/19), ownership (8 files) 0 failures. Expected reds: control-plane families.test totality (K1836, until T34-60), row census C-137 arrivals (Rules (5) 4). Details in the record.
