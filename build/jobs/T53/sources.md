# sources (T53)

**Status** · session_018BhcegmVJVqgECaQJcGU5q · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-28)

# sources · T53 · report

**Entries applied**
- T53-121 · A3 (DEC-459) · R23: `sourceLinksFor({captureShas, viewer})` in `src/sources/index.mjs`. Per capture (at most 50, `LINKS_MAX`; beyond that `truncated: true`) it answers `{captureSha, handed_in, source?}`. `handed_in` is true when the viewer may see the capture (`provenance.homeOf` + `membership.inSight`, R43) and `provenance.captureGrades` gives route `doorbell`; `source` (the source's id only) is added only for a member named in the sight list of a recorded detail of that capture's source. It never mints a source, writes nothing, logs no read, and never throws. Unseen, sourceless and unlisted captures answer alike. Tests: `test/m/sources/links.test.mjs` (listed member, unlisted, unlisted administrator, machine, source with nothing recorded, not-recorded detail, upload/email/email-attachment, unseen capture and project-hidden home, batch/order/50 cap, no private fields, no writes). The fixture's `captured` now always advances its bundle counter (so two captures with explicit text no longer collide).
- T53-122 · K5565: `consent.test.mjs` asserted a copied English sentence; it now reads `word("sources.consent_permanent_anything")`. The census's other site (a C site) had no remaining English in the module's tests. **BOB lowers the line** `"bio-plane/test/m/sources/consent.test.mjs": 1` in `build/tests-english-baseline.json` (delete it); a job does not edit that shared file.

**Not done / for BOB**
- `build/requirements/sources.md` R23 still carries "(not yet met: T53)"; `proc merge` strikes it on the Met line.
- The route (`sourcelinks` op) is not added: R23 is in-process only; the screens' lines own it.

**Found in other modules** · none.

**Met** · R23

Tests: 52/52. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegmVJVqgECaQJcGU5q): test runs 1, module lines 1156
