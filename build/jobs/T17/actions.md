# actions (T17)

**Status** · session_01NCrn5QviMeTSZwRUNYvqjR · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N396 (DEC-13): R1 names the two refusals in passing ("a `request_for_comment` naming no inquiry as an `advances` leg or no clock entry"), but nothing states what counts as naming an inquiry, that the audit reports it, or that the window's length is not enforced and the GAO precedent is carried as a citation (today only `bio-checks.mjs` holds `RFC_RESPONSE_WINDOW_PRECEDENT`). Proposed, in my wording, as a new id in the Provides' write section:

- **R44** (N396, DEC-13) A `request_for_comment` names the specific inquiries it put to its subject and states the response window it gave: at least one `action_basis` leg of kind `advances` whose target is an inquiry, and at least one `clock[]` entry (which carries its basis as every entry does, R7, R35). A `rests_on` leg, or an `advances` leg onto anything but an inquiry, is not a disclosed inquiry. A creation or revision missing either is refused `ACTION_BASIS_REFUSED` (R1), its findings naming each missing part under C-2.10, and the audit reports the same findings (R37); another kind is not asked. The window's length is the group's: no range is enforced, and `RFC_RESPONSE_WINDOW_PRECEDENT` (`{min_days: 7, max_days: 30, source, enforced: false}`, the GAO agency-comment protocol) is exported by this module as a citation a surface may show, never compared against a date. A non-response to it is recorded with its date (R15, R34).

My best reading, and what I am building meanwhile: the rule stays where it runs today (legacy-checks' `actionBasisFindings`, imported); this module re-exports `RFC_RESPONSE_WINDOW_PRECEDENT` beside its other re-exported vocabularies (R40's pattern), since the definition cannot move while legacy-checks' own finding text reads it and the old suites import it from there. Tests go in `test/m/actions/t17.test.mjs`, titled R44 (with R1, R37).
