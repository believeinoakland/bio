# T2 · docprofile — job record

Session: `session_01QLCYkFnXjtMweB8KWin4FT` (DOCPROFILE #1). BOB at start: `session_01JwTyEmUPSgvwiHEwzCzoxK` (BOB #41).

**Status** · COMPLETE, 2026-09-26, with ONE ITEM FOR BOB: the old battery's docprofile-dependent tests are not all green, for a cause in `legacy-tests` (39 harnesses copy a fixed directory list into a sandbox that lacks `jurisdictions/`); a tested patch is below, not applied (not my files). Job for module `docprofile`, tranche T2, branch `job/T2/docprofile`, `origin/tranche/T2` @ 0f976daad3 merged (jurisdictions merged there @ 332aff0c; K39 answers Q1; BOB's CHANGE of 17:14 processed). Entries: T2-11, N3. Waiting on: BOB's routing of the legacy-tests patch.

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
- **legacy-tests (blocks "the old battery stays green")** · 48 legacy harnesses build a sandbox by copying a fixed directory list (`bio-plane/src`, `bio-plane/checks`, `docprofile`, sometimes `agent-worker/src`), or `git archive` of those paths, and then load the plane under miniflare. `docprofile` now imports `../../jurisdictions/index.mjs` (N3, K39), which is not in the list, so module loading fails with `ENOENT …/jurisdictions/index.mjs`. 39 files regress for this reason alone (list in "Tests and checks"). The fix is one added copy per harness. The script below applies it; with it applied, **all 39 pass** (verified on this branch, then reverted, since these are `legacy-tests`' files). `id-spaces` will hit the same thing if `bio-plane/src/idspaces.mjs` imports `jurisdictions`.

```bash
#!/bin/bash
# Proposed legacy-tests patch (DOCPROFILE #1 REPORT): every harness that copies docprofile/ into a
# sandbox also copies jurisdictions/, which docprofile now imports (N3, K39). Run from the repo root.
set -e
files=$(grep -rlE '"docprofile"' bio-plane/test civicos-ui/test 2>/dev/null || true)
for f in $files; do
  perl -0pi -e '
    s{^(\s*)cpSync\(join\((REPO), "docprofile"\), join\((\w+), "docprofile"\), \{ recursive: true \}\);}{$&\n$1cpSync(join($2, "jurisdictions"), join($3, "jurisdictions"), { recursive: true });}mg;
    s{^(\s*)cpSync\(fileURLToPath\(new URL\("\.\./\.\./docprofile", import\.meta\.url\)\), join\((\w+), "docprofile"\), \{ recursive: true \}\);}{$&\n$1cpSync(fileURLToPath(new URL("../../jurisdictions", import.meta.url)), join($2, "jurisdictions"), { recursive: true });}mg;
    s{("agent-worker/src", "docprofile")\]}{$1, "jurisdictions"]}g;
    s{("bio-plane/checks", "docprofile")(\],|,\s*\n|\])}{$1, "jurisdictions"$2}g;
  ' "$f"
done
```
- **Requirements (for BOB)** · R6 and R30 are met: their "(not yet met: N3)" markers and the Status paragraph's R6/R30 sentence can go. The module is now about 4,060 lines including comments (3,658 before), near `layers.md`'s ~4,000 reporting line (Bob's ruling 1: a metric, not a bound).

## Tests and checks run

On the merged branch (tranche/T2 @ 0f976daad3):
- `node --test docprofile/test/` — `tests 35, pass 35, fail 0` (7 runs in the job: the first passed; 2 were mutation runs, one reverting the R10 fix and one reverting the R13 fix, which failed R10, and R13 and R16, as they should; the rest after the K39 changes).
- `node --test jurisdictions/test/` (the module I use; no change to it) — `pass 35, fail 0`.
- Layer tests: none named in `build/manifest.md`.
- Old battery, every file under `bio-plane/test`, `civicos-ui/test` and `civicos-ui/*.mjs` that mentions docprofile (76 files), run on this branch and on `origin/tranche/T2` @ 0f976daad3 as baseline: baseline 12 fail, head 52 fail. The 40 regressions: `civicos-ui/check-semantics.mjs` (the UI's flattened copy is stale, as reported above) and 39 sandbox harnesses, all `ENOENT jurisdictions/index.mjs`: airun-contextkind, airun-principal, case-authority, d179onehome, d260-resume, d510-promoted-type, d511-replay-server-word, d512-replay-verified, d526-refusal-order, d533partsaudit, d547-revision-retype, d556partedpublish, d563-promoted-title-state, d86-bias-debt, group-identity, group-public, homecensus, m0187-surfacing-fixture, mint-ledger (control and test), opaque-ids, project-discoverable (control and test), project-join-request, ratify-authority, rec169-consume, rec171-surface-token, rec172-bounds, rec173-migration-replay, rec177-allowance, rec179-surfaced-by, rec180-promote-rollback, rec207-bias-debt-settle, setup-signeradd (all `.control.mjs`), founder-sight, mk7-attribution, observation-log, reopen, resolution (`.test.mjs`). With the patch above: 0 of 39 fail. The 12 baseline failures fail the same on both sides.
- `node checks/format.mjs` — `format: 61 modules, 23 requirements files; 0 failures`
- `node checks/architecture.mjs … docprofile` — `architecture: 21 product files, 51 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs … docprofile` — `coverage: 1 modules, 35 of 35 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs … docprofile tranche/T2` — `ownership: 15 files changed by docprofile between tranche/T2 and HEAD; 0 failures`

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_01QLCYkFnXjtMweB8KWin4FT,job,docprofile,25232697,320599,196,126514,95,7,4060
```
