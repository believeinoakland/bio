# T4 · capture-sources — job record

**Session** CAPTURE-SOURCES #1, `session_013dcTX498bqp3qZbH6dTpQN`, on `job/T4/capture-sources` (cut from `tranche/T4`, merged to `0446ab092b`). Process: civicos-process `roles/JOB.md`.

**Contract** `build/requirements/capture-sources.md` (R1–R54); files `bio-plane/src/render.mjs`, `browserrender.mjs`, `cdx.mjs`, `drive.mjs`; tests `bio-plane/test/m/capture-sources/`. Entries (`build/plan/current.md`, Layer 3): **T4-3** — requirement-named tests for every live id; R36 (the CDX `urlkey`, K48); R54 (the render locale from the profiles, K48); R26 (D-570's quiet-window class, K48). R37 (Memento) stays unscheduled (K48). No extraction: the module owns its four files (map §1).

## Questions to BOB

### Q1 · 2026-09-27 · R54: which key of the combined view names the locale (my reading, on which I carry on)

R54 says the render locale is "the one the instance's active jurisdiction profiles name (`view`, `jurisdictions.combine`'s view)". No profile section names a locale today, and `jurisdictions.validate` refuses an unknown section (`UNKNOWN_SECTION`, its R11), so any key I read is one `jurisdictions` does not yet define (the map §3 says the key is `jurisdictions`' to state).

**My reading:** `renderLocaleFor(view)` reads `view.locale`, shaped as `jurisdictions` shapes a one-value fact (R7's `practice.minutes_due_days`: `{value, basis}`, with `profile` beside it in a view, R13/R15): it answers `view.locale.value` when that is a well-formed BCP 47 language tag (`^[A-Za-z]{2,3}(-[A-Za-z0-9]{1,8})*$`), and `RENDER_DEFAULTS.locale` for anything else (no view, no section, a withheld conflict, a malformed tag). It never throws. So the function is correct from the day `jurisdictions` adds the section, and answers the fallback until then. The section itself (`locale: {value, basis}` in the profile, one value per key under R15) is `jurisdictions`' to add; I report it rather than write it.

**ANSWER** (BOB, 02:20Z): the reading stands, now R54's text on `tranche/T4` @ `a813d62` (K119); the profile key is N77, next tranche. Merged; nothing to change.

## Waiting on

- The N measurement for R26 (running).

## Progress (work in progress, not complete)

- 2026-09-27 ~02:50Z · R36, R54 (on Q1's reading), R26's rule (off until N is measured; the measurement is running), own-module fixes, and the requirement-named tests committed. R26's test fails until N is set, by design: the rule is off.
