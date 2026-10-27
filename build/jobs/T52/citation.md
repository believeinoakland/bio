# citation (T52)

**Status** · session_018BhcedirTswJ5Q8CK6bwqc · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

## Report: CITATION, T52, entry T52-21 (R25)

**Entries applied.** T52-21: on a question, `sever` and `reinstate` act on one passage, named by its part (`content_id` or `extent_*`, R22's identity).
- Only that passage's leg changes. When a document is held in several legs, each leg carries its own `status:` line. `reinstate`'s `role` changes only that leg's role.
- The document's `references[]` entry is `severed` exactly when no leg of it is live, and `confirmed` again when one is reinstated.
- A document held in one leg is unchanged: no part is named, and the entry alone carries its status as in R15.
- Two or more legs with no part named is refused `WHICH_PASSAGE` (new row C-33.65, awaiting the stamp). The refusal lists each passage's part and writes nothing.
- `NOT_CITED` and `NOT_SEVERED` are asked of the named passage. A part on a call naming several documents is `EXTENT_ON_MANY`. An unknown part field is `UNKNOWN_EXTENT_FIELD`.
- `DECLARED_OPS` now lists the part's fields for `sever` and `reinstate` (R19). The op routes read the part from the body and the address.
- The project arm is unchanged.

**Tests.** New: `passage-sever.test.mjs` (R25 and its controls). Amended: `invariants.test.mjs` (the op route now passes the part; the row table gains `WHICH_PASSAGE`). The citation suite is green, 157 of 157.

**Not done / for other modules.**
- `leg-earning` R17 (T52-105) must read each leg's own `status:` line, absent meaning the document entry's status. Today `restsOnLive` counts each leg of a document by the entry's status. Until R17 lands, a passage severed beside a live one is still counted live. This is correct only because the entry stays `confirmed`.
- `recordedBy` (R13) still reads `withdrawn` from a project's edge only. A severed question leg is not marked withdrawn.
- The words for the new sentences are not yet in the word table. `proc merge` regenerates it (setup-words).

**Met** · R25

Tests: 157/157. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedirTswJ5Q8CK6bwqc): test runs 1, module lines 2152

## Completion (2026-10-27)

## Report: CITATION, T52, entry T52-21 (R25)

**Entries applied.** T52-21: on a question, `sever` and `reinstate` act on one passage, named by its part (`content_id` or `extent_*`, R22's identity).
- Only that passage's leg changes. When a document is held in several legs, each leg carries its own `status:` line. `reinstate`'s `role` changes only that leg's role.
- The document's `references[]` entry is `severed` exactly when no leg of it is live, and `confirmed` again when one is reinstated.
- (CHANGE K5407) Every severed passage's leg carries `status: "severed"`, a one-leg document included; reinstate removes the line (absent = live). A document severed before this has its entry `severed` and no leg status: its legs read through the entry until a leg is given a status.
- Two or more legs with no part named is refused `WHICH_PASSAGE` (new row C-33.65, awaiting the stamp). The refusal lists each passage's part and writes nothing.
- `NOT_CITED` and `NOT_SEVERED` are asked of the named passage. A part on a call naming several documents is `EXTENT_ON_MANY`. An unknown part field is `UNKNOWN_EXTENT_FIELD`.
- `DECLARED_OPS` now lists the part's fields for `sever` and `reinstate` (R19). The op routes read the part from the body and the address.
- The project arm is unchanged.

**Tests.** New: `passage-sever.test.mjs` (R25 and its controls). Amended: `sever-inquiry.test.mjs` (a severed leg gains its status line), `invariants.test.mjs` (the op route now passes the part; the row table gains `WHICH_PASSAGE`). The citation suite is green, 157 of 157.

**Not done / for other modules.**
- `leg-earning` R17 (T52-105, LEG-EARNING #1) reads the leg's `status`. Until it lands, `restsOnLive` counts by the entry's status.
- `recordedBy` (R13) still reads `withdrawn` from a project's edge only. A severed question leg is not marked withdrawn.
- The words for the new sentences are not yet in the word table. `proc merge` regenerates it (setup-words).

**Met** · R25

Tests: 157/157. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcedirTswJ5Q8CK6bwqc): test runs 2, module lines 2152
