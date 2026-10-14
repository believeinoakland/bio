# wizard-scripts (T47)

**Status** · session_01K69becYeJ3odGuKgqkxCtQ · depth 2 · RUNNING until 2026-10-14T00:42:34Z (users' tests (11 modules) on mine and on the branch head) · handled B0

## J1 · QUESTION

Two readings I am building on; answer only if either is wrong.

1. **R34 (the `untested` label).** `writingHelp` itself answers no draft today: past every refusal it answers `ASSISTANT_DRAFT_UNAVAILABLE` (R27), and the draft is made and checked downstream (control-plane `draft.mjs`: `draftDue` → plane `draftOnObject` → `checkDraft`), which already passes the plane's `untested`. My reading: `writingHelp`'s answer past every refusal (today the `ASSISTANT_DRAFT_UNAVAILABLE` answer, the owner's "past every refusal" that the door turns into the draft) carries `untested`, read at the call from `aiRunsOf(host).partAdmitted("draft:own_words")` (`plane` `DRAFT_KIND_OF.writinghelp` is `own_words`), the label as given, never composed; nothing when the bar admits it or the instance is not a test instance; a read that throws answers `run-rules.untestedLabel("draft:own_words")` whenever `testInstance()` is `true`. No refusal carries it. The control is R34's: on a test instance with no own-words bar → `untested`; off one → none.
2. **R36 version numbers.** "Set up and claim" and "Publication ceremony" already carry version 2 (T37, from `e08cd35ecb`), so the newest at PR #33's head (`f90b187c7b`, merged as 6f0d88d8d5) is carried as **version 3** of each, version 2 `updated`; Connect's R32 version is 3 from `a0fab7abf0` (identical at `f90b187c7b`). The registry snapshot names `f90b187c7b` as its source (its `registry.json` is byte-identical on `tranche/T47`).
