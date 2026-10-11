# conformance (T45)

**Status** · session_016gYHj2rZibm83nWVHN24Te · depth 2 · WORKING · handled B2

## J1 · QUESTION

Three readings I am building on; please confirm or correct (none blocks me).

1. **R33, accepted finding, "and no acceptance in force at that edition".** My reading: a later publisher move recorded after the determination (`publisherMoves`, `at` after the determination's `at`, `taken_back` null) voids it as follows. A **withdrawal** of the pinned edition or of `all` voids it, whatever the acceptance says (the source withdrew what we rest on). A **newer edition** N of the case voids it unless `acceptedFinding({ref, edition: N})` answers an acceptance in force at N (the group has accepted the revision; the determination still pins its own edition and reads that pin). A move read that fails answers `cause: "unreadable"`.
2. **R36's refusal order** follows the requirements file (in force), not the l9a draft: MACHINE_CANNOT_LINK_CURE, NO_SUCH_DETERMINATION (either), DETERMINATION_NOT_A_PARTICIPANT (in `determination`'s project), DETERMINATION_SUPERSEDED (either), DETERMINATION_VOID (either), CURE_TARGET_NOT_NONCOMPLIANT, CURE_NOT_COMPLIANT, CURE_OTHER_OFFICE, CURE_NOT_LATER, CURE_LINKED. An optional `reason` that is given but not text or over 500 characters is `CONFORMANCE_BAD_REASON`, asked last.
3. **`cureUnlink` on a link that is absent, not visible, or already ended.** R36 names no code. My reading: absent or invisible answers through `noSuchDetermination(null, {link})` (a link is read on its determination; no new row); an already ended link answers `CURE_LINKED`'s opposite is not wanted, so I answer `{ok: true, wrote: false, ended: <the ending>}` (idempotent, nothing written). Refusals in order: MACHINE_CANNOT_LINK_CURE, the link unseen, DETERMINATION_NOT_A_PARTICIPANT, CONFORMANCE_NO_REASON / CONFORMANCE_BAD_REASON.

Also (K2832): R32's `identity`, `stake` and `edition_date` read from `case-import.importedCase`'s edition where it records them (fields `identity`, `stake`, `edition_date`, or inside `group_fields`); today none is recorded, so each reads null / `"undetermined"` with the sentence why.
