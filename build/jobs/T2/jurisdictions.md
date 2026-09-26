# T2 · jurisdictions — job record

Session: `session_014szwz88Jt9EWztKH5wfE1v` (JURISDICTIONS #1). BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T2`.

**Status** · WORKING, 2026-09-26. Job for module `jurisdictions`, tranche T2, branch `job/T2/jurisdictions`. Entries: T2-1, N1, N11. The profile interface (R1–R16, R23–R29) comes first, since `id-spaces` and `docprofile` read it.

## Questions (Q1, 2026-09-26) — carrying on with the reading stated

The interface is pushed: `jurisdictions/index.mjs` (`list`, `get`, `validate`, `combine`), `jurisdictions/profiles/oakland-alameda.mjs` (the first profile) and `jurisdictions/profiles/test-port-ellery.mjs` (the test profile, which also carries a crosswalk). Both held profiles pass `validate`.

1. **R25 lists `tier` and `venue` as required, R30 gives a tier only "where §8 names it".** Roadmap §8 tiers records requests, grand-jury complaints, State Controller referrals and media outreach (Tier 1); it names no tier for `public_comment`, `litigation_support`, `request_for_comment` or `other`, and nothing measured names a venue except the records portal. *Reading:* `tier`, `venue` and `template` are optional; an absent one means the profile supplies none, so the consumer answers undetermined (R27; D-182: never a default of 1). `validate` refuses a tier that is present and not 1, 2 or 3.
2. **How the view carries "both" when equal entries merge (R13, R14).** *Reading:* every fact in the view has `basis` and `profile` from its first giver, plus `bases: [{profile, basis}, …]` listing every giver. The view also has `id` (the ids joined by `+`) and `name` (the names joined by `; `).
3. **The basis grammar (R2).** *Reading:* one or more references separated by `, ` or `; `, each `M-n`, a date `YYYY-MM-DD`, `D-n`, `DEC-n` or `Kn`, optionally followed by a qualifier naming the part (`M-119 LEG`, `M-157 (4)`); or exactly `UNMEASURED`; `TEST` only in a test profile.
4. **Fields R15/R29 do not name.** *Reading:* an action kind's `label` and a deadline's `citation` that differ between profiles are joined with `; ` (like a space's labels); a kind's `laws` are unioned; a deadline's `extension` is one value per key like `days`. A kind's `prefix` is part of the kind entry (list semantics); only its `floor` is one value per kind.
5. **Errors R12 does not name.** *Reading:* two different profiles with one `id` in the list give `INVALID_PROFILE` (the view's `profile` tags could not tell them apart); a `list` that is not an array gives `NOT_A_LIST`. An unknown field inside an entry gives `UNKNOWN_SECTION` at its path.
6. **The records law's extension.** The canon names the 10-day response period (Gov. Code § 7922.535, Roadmap §1, State Rules §4.4) but not the 14-day extension for unusual circumstances that the same section provides. *Reading:* hold both, with basis `UNMEASURED`.
