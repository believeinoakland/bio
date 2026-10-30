# events.md wording trim: notes for BOB

## Size
- Old: 55,721 bytes. New: 34,731 bytes (`wc -c`).
- **The 30,000-byte target is not reached.** 34,731 is the smallest version I could make without changing meaning. Every requirement is now terse. What remains is mostly closed lists, interface names, fields, refusal codes and ruling parentheses, which must all be kept. Getting below 30 KB would mean dropping obligations, cited ids or stated outputs. Two options for BOB:
  1. Split the module (REQ 8). The register-following lines R38, R58 and R59 (about 3.3 KB together) and the uses lines R43–R48 (about 4.5 KB) are the natural cuts.
  2. Accept about 35 KB for this file in the reading set.
- Largest lines now: R58 about 2.5 KB, R49 about 1.7 KB, R43 about 1.1 KB, R53 about 1.1 KB.

## Mechanical checks
- `**R<n>**` ids: 61 in the old file and 61 in the new. The sequences are identical (`cmp`):
  R1–R30, R50, R51, R52, R53, R54, R31, R32–R38, R43–R49, R58, R59, R60, R61, R39–R42, R55, R56, R57.
- `*(not yet met: …)*` marks: 0 in the old file and 0 in the new, so they match. The old Status line mentioned "marked not yet met (T48)" etc. as history only. No mark stood after any requirement.
- Section structure is kept: the title line, `## Public` (`### Purpose`, `### Provides`), and `## Private` (`### Uses`, `### Invariants`, `### Satisfies`, `### Suggestions`). The service headings are kept with their full signatures.
- Ruling and decision ids: every K…, N…, DEC-… and T…-… id the old file cites is still present, except two:
  - K1976, which appeared only in the Status history ("every other requirement met").
  - T36-40, which appeared only in a Suggestion ("its R6 as amended in T36-40").
- Status-only ids that I moved into the parenthesis of the requirement they changed:
  - T48-19 and K3195 now sit on R50 and R51.
  - T50-60 and K3630 now sit on R53.
  - T36-14 and K2092 now sit on R49.
- Every Uses entry and every Satisfies canon section is kept. In Satisfies only the topic glosses were cut; no § was dropped.

## What was cut (wording only)
- The Status history narrative.
- Test and control sentences that only restated the rule they test (R50, R51, R53, R54, R56, R57, R58, R59, R60, R61, R30). Where a test carried a fact the rule did not state, the fact was kept in the rule. Examples: R60's 200 captures and "never a 502"; R58's "HTML or JSON first, same outcome"; R50's hidden-capture participant; R55's requires/accepts checks.
- The K2114 wording addendum to R49 is folded into R49's single statement of the item shape, order and refusals. Its meaning is unchanged: item extent parsed to an object, code-unit order, one item per extent, and `VIEWER_MISSING` / `EXTENT_MALFORMED` defined as K2114 states.
- R53's two halves were merged, so `NO_SET` "only when both empty" is stated once instead of twice.
- R23's governing-zone formula now points at Terms instead of repeating it. R42 does the same, while still saying "the governing zone".
- Suggestions are cut hard. Each point is kept, but the op-name examples, the T35 and R49 test lists and the M-X1a timing figures are gone.

## Statements left long, and why
- **R58** (about 2.5 KB) has five numbered parts. Each states an output field, a key format, a refusal or an ordering rule.
- **R49** (about 1.7 KB) is a cross-module shape that other modules answer in, so every field, ordering rule and refusal shape is needed.
- **R43** has an ordered refusal list with per-refusal meanings and waiver-only fields.
- **R11** has refusal order plus the vote-value matching rules (`value`, then exact `label`, and the no-profile behaviour).
- **R45** carries the DEC-145 (7) `says` wording, which is quoted text and cannot be paraphrased.

## Ambiguities and contradictions seen (text kept as it was; for BOB)
1. **`sequence({a, b})` heading is misplaced.** The heading sits before R52, R53 and R54. R52 belongs to R34, R53 to `timeline` and R54 is cross-cutting. Only R31 is `sequence`. I kept the placement.
2. **R6 `USE_NEEDS_ITS_ACT` position.** The text says only "after `UNKNOWN_EVENT_KIND`". It does not say whether it comes immediately after, or after `UNKNOWN_STATUS` and the rest. I kept the wording.
3. **R43 refusal order is incomplete.** The text gives the order for `KIND_NOT_DISCRETION`, `MEMBER_ACT_ONLY` (before R6's refusals) and the rest (after). Where `WAIVER_NO_SCOPE`, `BAD_DATE` on expiry and `FIELD_NOT_FOR_KIND` fall in that order is not stated.
4. **R44 leaves its refusal order unstated** relative to R6's refusals. It says only "`MEMBER_ACT_ONLY` … as R43".
5. **R58 cites "R7's `sameAttestation`"**, but R7 names no `sameAttestation`.
6. **`followedRegister` has no service heading or signature in Provides.** It appears first inside R58, as "the three … content types it takes now". It is not among the ops listed in R36's suggestions either.
7. **R49's refusal shape `{ok: false, refused, code, reason, why}`** differs from the Terms refusal shape `{ok: false, reason, detail}`. This may be intentional (K2114/K2116), but the file does not say the R49 shape overrides Terms.
8. **R49's `EXTENT_MALFORMED` has two definitions.** One is "an `extent` `content.canonicalExtent` cannot read". The other, from K2114, is "not an object of a `content` `CONTENT_EXTENT_KINDS` kind". I kept the K2114 one, which is marked binding. If the two can differ, BOB should confirm.
9. **R61 is silent on withdrawn events in `timeline`.** It says `timeline` "carries `withdrawn`" for a withdrawn event, but not whether withdrawn events are still listed and counted. R46 by contrast leaves withdrawn uses out.
10. **R60's "(R53: no refusal names which captures exist)"** is not stated in R53 itself. R53 says only that unheld and hidden captures "contribute nothing, alike". K5786 is cited for it.
11. **R55, R56 and R57 are requirements under `### Suggestions`**, a section that "binds nothing" (REQ 3). It is unclear whether they bind. Their order was kept.
12. **R11 uses two different refusal codes for an empty event id**: `NO_SUCH_EVENT` for an absent event, while R26 uses `NO_EVENT` for an empty id. R11 has no empty-id case. The question is whether an empty `eventId` to `addParticipant` answers `NO_SUCH_EVENT`.
13. **R27 vs R33 on order.** R27 orders `eventsFor` "by `when` (R31's order)" without saying how undetermined orders are shown. R33 says "with undetermined orders shown". Probably the same, but not stated.

## Files read
- `/home/user/civicsmith/build/requirements/README.md`
- `/home/user/neoprocess/rulebooks/requirements.md`
- `/home/user/civicsmith/build/requirements/events.md`

No other module's file was needed.

## Review fixes applied (events.review.md, gaps 1–10)

All ten gaps are real. Each is restored with the original meaning, and nothing else changed.

1. R27: `limit` is clamped to 1–500 (default 100). The lines that say "as R27" (R29, R33, R53, R57) inherit the clamp.
2. R46: `limit` is clamped to 1–500.
3. R46: `count` is the number answered, and the answer says these are the held uses this viewer may see.
4. R49: `limit` is clamped to 1–500.
5. R49: the special refusal shape is named explicitly as belonging to `VIEWER_MISSING` and `EXTENT_MALFORMED`, so "these two" can no longer be misread.
6. R49: "no catalogue row" is limited again to "any module reading in this shape".
7. R50: each participant's fields are listed again: entity, role, vote value, attestation, and R12's two grades.
8. R51: a `precedes` relation is cited by a capture extent stating the order, or by a member's testimony graded D (R17), and is held with two grades.
9. R54: the rule again states that each key's `word(key, vars)` is non-empty, and that every kind R35 registers has a word equal to `word` of its `label.<set>.<value>` key.
10. R59: the meaning of the absence rule is restored: a row a later reading no longer states is not an event that ended, and no event is deleted.

Re-run checks after the fixes:
- `**R<n>**` ids: 61 old and 61 new, and the sequences are identical.
- `*(not yet met: …)*` marks: 0 in the old file and 0 in the new, so they match.
- New size: 35,185 bytes, still over the 30,000 target.
