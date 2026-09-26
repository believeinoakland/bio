# T2 · jurisdictions — job record

Session: `session_014szwz88Jt9EWztKH5wfE1v` (JURISDICTIONS #1). BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T2`.

**Status** · COMPLETE, 2026-09-26, re-run after BOB's ANSWER to Q1 (K44, `origin/tranche/T2` @ e6398b33, merged at b944ce1d78): every reading stood and R2, R12, R13, R14, R25 and R29 now state them. No open question. Waiting on: nothing; available for a `CHANGE`.

## Questions (Q1, 2026-09-26) — ANSWERED by BOB: all six readings, ruling K44

The interface is pushed: `jurisdictions/index.mjs` (`list`, `get`, `validate`, `combine`), `jurisdictions/profiles/oakland-alameda.mjs` (the first profile) and `jurisdictions/profiles/test-port-ellery.mjs` (the test profile, which also carries a crosswalk). Both held profiles pass `validate`.

1. **R25 lists `tier` and `venue` as required, R30 gives a tier only "where §8 names it".** Roadmap §8 tiers records requests, grand-jury complaints, State Controller referrals and media outreach (Tier 1); it names no tier for `public_comment`, `litigation_support`, `request_for_comment` or `other`, and nothing measured names a venue except the records portal. *Reading:* `tier`, `venue` and `template` are optional; an absent one means the profile supplies none, so the consumer answers undetermined (R27; D-182: never a default of 1). `validate` refuses a tier that is present and not 1, 2 or 3.
2. **How the view carries "both" when equal entries merge (R13, R14).** *Reading:* every fact in the view has `basis` and `profile` from its first giver, plus `bases: [{profile, basis}, …]` listing every giver. The view also has `id` (the ids joined by `+`) and `name` (the names joined by `; `).
3. **The basis grammar (R2).** *Reading:* one or more references separated by `, ` or `; `, each `M-n`, a date `YYYY-MM-DD`, `D-n`, `DEC-n` or `Kn`, optionally followed by a qualifier naming the part (`M-119 LEG`, `M-157 (4)`); or exactly `UNMEASURED`; `TEST` only in a test profile.
4. **Fields R15/R29 do not name.** *Reading:* an action kind's `label` and a deadline's `citation` that differ between profiles are joined with `; ` (like a space's labels); a kind's `laws` are unioned; a deadline's `extension` is one value per key like `days`. A kind's `prefix` is part of the kind entry (list semantics); only its `floor` is one value per kind.
5. **Errors R12 does not name.** *Reading:* two different profiles with one `id` in the list give `INVALID_PROFILE` (the view's `profile` tags could not tell them apart); a `list` that is not an array gives `NOT_A_LIST`. An unknown field inside an entry gives `UNKNOWN_SECTION` at its path.
6. **The records law's extension.** The canon names the 10-day response period (Gov. Code § 7922.535, Roadmap §1, State Rules §4.4) but not the 14-day extension for unusual circumstances that the same section provides. *Reading:* hold both, with basis `UNMEASURED`.

## Entries applied

- **N1** · The module is created: `jurisdictions/index.mjs` provides `list`, `get`, `validate` and `combine` (R8–R16), with no imports but its two profiles and no store, network or clock (R17). `jurisdictions/profiles/oakland-alameda.mjs` is the first profile (R21): the four spaces renamed to `enactment`, `project`, `fund`, `parcel` with every form, `clean` and `normal` of `idspaces.mjs`, the enactment kinds with their prefixes and floors (12274, 75950, system `oakland.legistar`, M-132); the seven systems in `idspaces.mjs`'s order and both mixed hosts; no crosswalk (M-157); the recognisers' local vocabulary (furniture names and link labels, body forms, member title, the C.M.S. marker, the municipal code `omc` / `O.M.C.`, the legislative file-number form, the staff-report titles, the ten section headings, the recommendation opener, the unfilled template text); the minutes-due period 21 (`UNMEASURED`, as its code says); the default search terms `oakland`, `police` (`UNMEASURED`: no measurement found); and the California Public Records Act (D-149). The status's undetermined bases are settled: the agenda vocabulary rests on the dated entry `2026-08-03` (FW-15's item-shape measurement); the minutes, staff-report and ordinance/resolution vocabulary on M-24 (driven over M-18's corpus); the calendar carries no local vocabulary beyond the minutes-due period; the search terms have no measurement and read `UNMEASURED`. `jurisdictions/profiles/test-port-ellery.mjs` is the test profile (R22), with a crosswalk the first profile lacks, so `id-spaces` can test R17 against it.
- **N11** · The action sections (R23–R30) are in the shape, in `validate` (R28) and in `combine` (R29). The first profile holds `ACTION_KINDS` with `cpra_request` renamed `records_request`; Tier 1 for the four kinds Roadmap §8 names (records requests, grand-jury complaints, State Controller referrals, media outreach; basis D-182), no tier for the other four; the records portal as the one venue the canon names; the records law's 10-day period from receipt with the 14-day extension, citing Gov. Code § 7922.535 (`UNMEASURED`); the four offices the canon addresses these kinds to (the Finance Department's Controller, the City Council, the civil grand jury, the State Controller); and three standard sources (the municipal code, the Council's ordinances and resolutions, the Government Code).
- **T2-1** · `jurisdictions/test/jurisdictions.test.mjs` names R1–R30, each in a test title, 30 tests. R21 is judged against `jurisdictions/test/helpers.mjs`'s fixed copy of the snapshot's recognisers: over a deterministic corpus of 2,000+ values every string the old code matched is matched with the same form, normal and kind, and none is newly matched; every address gives the same system; every recogniser pattern's sample lines match the same way.

## Deferred

None.

## Found in other modules (no change needed for this job)

- **id-spaces, docprofile (T2):** they can now take every fact from `combine(...).view`. Local facts remain in code outside T2's entries, as `layers.md` already plans: `readingNamePlan(["oakland", "police"])` in `store.mjs` (legacy-store) and `cpra_request` in `ACTION_KINDS` with its CPRA sentence in `governingLawsOf` (legacy-checks). Their consumers should read `search_terms` and `action_kinds` / `records_laws` from the view when those modules are extracted.
- **Generated artifacts:** none made stale; no bundle includes `jurisdictions/`.

## K44 (BOB's answer to Q1)

- `tranche/T2` merged. New tests name the added sentences: R2 (basis grammar), R12 (`NOT_A_LIST`, two profiles under one id, an unknown entry field), R13 (the view's `id` and `name`), R25 (tier and venue optional), R29 (labels and citations joined, laws unioned, an extension one value per key). R14's `bases` was already tested.
- One change to the module, found by the R2 test: a basis qualifier is now one word, as R2 says (`M-1 and M-2` was accepted before). Both held profiles still validate. `id-spaces`'s tests were not re-run here (running them from its branch was denied in this session); the change only narrows which basis strings `validate` accepts, and BOB verifies `id-spaces` after this branch merges.

## Tests and checks run (job/T2/jurisdictions, tranche/T2 @ b944ce1d78 merged)

- `node --test jurisdictions/test/` — `tests 35, pass 35, fail 0` (7 runs in all; the sixth found the one-word qualifier above; the third found 2 failures, both slips in the tests themselves: an R15 case that invalidated its own crosswalk, and an R21 comparison of `undefined` with `false`).
- Layer tests: none named in `build/manifest.md`. No provided service changed for an existing user (the module is new).
- `node checks/format.mjs` — `format: 61 modules, 19 requirements files; 0 failures`
- `node checks/architecture.mjs … jurisdictions` — `architecture: 5 product files, 4 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs … jurisdictions` — `coverage: 1 modules, 30 of 30 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs … jurisdictions tranche/T2` — `ownership: 6 files changed by jurisdictions between tranche/T2 and HEAD; 0 failures`

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_014szwz88Jt9EWztKH5wfE1v,job,jurisdictions,12100708,231358,132,99828,65,7,1017
```
