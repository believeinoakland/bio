# T2 · docprofile — job record

Session: `session_01QLCYkFnXjtMweB8KWin4FT` (DOCPROFILE #1). BOB at start: `session_01JwTyEmUPSgvwiHEwzCzoxK` (BOB #41).

**Status** · WORKING, 2026-09-26. Job for module `docprofile`, tranche T2, branch `job/T2/docprofile`, `origin/tranche/T2` @ 0f976daad3 merged (jurisdictions merged there @ 332aff0c; K39 answers Q1). Entries: T2-11, N3. Code, tests and checks done; the legacy battery comparison is running.

## Questions

### Q1 · 2026-09-26 · The vocabulary's shape — ANSWERED by K39

My R6 asked for vocabulary "keyed by the type's own key", including kinds `jurisdictions`' closed `vocabulary` set has no key for. I built on the reading that the provider's keys are the interface and place-free language, a system's own page shapes and measured floors stay in code, and recommended rewording R6/R30 that way. BOB ruled K39: R6 and R30 reworded so, and with no `ctx.view` (legacy-index today) the view is `jurisdictions.combine` of every non-test held profile, until N21. Merged the tranche and brought the work in line (the fallback, below).

## Entries applied

- **N3** · Local vocabulary into the profile. Every local fact a content type tests for is read from `ctx.view` under `jurisdictions`' keys (R6 as ruled by K39), through one adapter in `doctypes/index.mjs` (`readerView`, `vocabulary`, `vocabPatterns`, `enactmentPatterns`, `enactmentNumber`, `codePatterns`, `practiceValue`); no new file, so the UI's fixed flattening list still covers the package.
  - `meeting_agenda`, `meeting_minutes`: file numbers (`file_numbers`, anchored to a line by the reader), the jurisdiction's and its offices' names and record link labels (`furniture`), bodies (`bodies`, ending a line), member titles (`member_titles`). New stated facts: `body_why` (agenda) and `references_why` (both) when no profile supplies the fact.
  - `staff_report`: template sections and titles (`report_sections`, `report_titles`), the recommendation opener (`recommendation_openers`), instruments by kind and number (`spaces.enactment` kinds, forms, `enactment_markers`), file numbers (bounded in prose), code citations (`codes`: the code's `key` prefixes the reference key, its `label` shows it; the fact gains `code`).
  - `regulation`: its own caption (kinds, forms, markers), the enacting body above it (`bodies`, tested as printed and in capitals), template blanks (`template_blanks`), codes and instruments as above. `number_why` now tells "no number in the caption" from "no caption read".
  - `meeting_calendar`: minutes due days from `practice.minutes_due_days`; with none, `expected_by` is null and the `why` says the due date is unknown (never a default 21).
  - `staff_directory` and the four stack handlers read nothing local (the handlers recognise technology; the directory's floors are measured structure, kept per K39).
  - Patterns are used as the profile wrote them (anchors, groups) wherever they name a whole line's thing; a reader wraps only where it supplies the position. An instrument's number is the form's own `normal` (so `Resolution No. 87759 C.M.S.` keys `resolution:87759`, as before).
  - **K39 fallback**: no `ctx.view` → `combine` of every non-test held profile, computed once; a test profile is never the fallback; an empty view (`combine([]).view`) means no local recognition. Verified: with no view, the Oakland-shaped staff report and ordinance read exactly the keys, number and title the pre-N3 code read.
  - No place is named in the module's code outside comments (checked by stripping comments and searching for the measured instance's names, codes and markers). Comments that cite where a measurement was taken stay (`layers.md` rule 6).
- **T2-11** · Requirement-named tests for every live id: `docprofile/test/docprofile.test.mjs` (35 tests, one per id R1–R35, each named in its title) over `docprofile/test/fixtures.mjs`: two made-up TEST profiles (Port Alder, Lakemont), validated and combined by `jurisdictions` itself, and documents of every content type written in their vocabulary. Every test goes through `docprofile/registry.mjs`, the entry the plane imports.

## Flaws fixed in the module (step 4)

- **R10** A declared boundary that missed fell back to the presentational rules (a WordPress article with no `<article>` had its nav and footer normalised). Now it normalises nothing beyond the mechanical pass.
- **R13, R17** A content type that read nothing on one side returned `meaningful: null` and the pipeline called it `routine`; a type's `assess` or `connections` throwing escaped `assess()`; a parse failure dropped `content_type`. Now: any unread or unjudged document is `changed` with `meaningful: null` and a stated why, `content_type` kept; `assess`, `connections`, `doctypeFor` and a failing hash are all caught (never throws).
- **R14** The generic type asserted `meaningful: true` with no events. It now emits one catalogued `substance_changed` event (EVENT), and the pipeline derives `meaningful` from the events for every type.
- **R16, R33** `staff_report`, `regulation` and `staff_directory` treated a read that found nothing as failed only when BOTH sides found nothing, so a failed read on one side reported everything the other side read as pulled. Now either side. Every type's `confirmed` is null when nothing was verified unchanged (it was `{intact: 0}`); the directory counts an entry intact only when its facts are unchanged.
- **R2** `kind` was `"unknown"` for a handler that defines no `kind()`; it is now absent.
- **R26, R27, R7–R10** `fidelity`, `profileRecord` and `digests` threw on odd inputs (no `subresources` array, a handler without `ignorable`, a null id, a handler without `rules`, non-byte input). Now they answer in the safe direction; `digests` throws only for a missing `ctx.sha256` (a `TypeError`, its stated precondition).
- **R35** `doctypeFor` gave no `why` when it fell back to `generic`; it now says so.

## Deferred

None.

## Found in other modules (REPORT)

- **legacy-index** · passes no `ctx.view` (N21, already in `next.md`). Until N21 the K39 fallback keeps it reading as before.
- **Generated artifact stale** · `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` embed `docprofile` (and now reach `jurisdictions` through it); regenerate at the layer close (`not_product`, BOB's).
- **legacy-ui** · `civicos-ui/app.html` carries a flattened copy of this package that `civicos-ui/check-semantics.mjs` compares to `tools/bundle-docprofile.mjs`'s output; it is now stale (the drift check will fail until the copy is re-pasted). The flattener's fixed list does not include `jurisdictions`, so in the UI the no-view fallback is an empty view; harmless today, since the UI calls only `identify` and `fidelity`, which read no view. Part of N14's retirement of `tools/`.
- **legacy-tests** · results of the old battery's docprofile tests against the tranche baseline: see "Tests and checks".
- **Requirements (for BOB)** · R6 and R30 are met: their "(not yet met: N3)" markers and the Status paragraph's R6/R30 sentence can go. The module is now about 4,060 lines including comments (3,658 before), near `layers.md`'s ~4,000 reporting line (Bob's ruling 1: a metric, not a bound).

## Tests and checks run

(filled at completion)
