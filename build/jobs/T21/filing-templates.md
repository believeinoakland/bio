# filing-templates (T21)

**Status** · session_01QzJNX4tHiyiLofPjJVXcGU · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Four readings I am building on; each is yours to correct (none blocks me).

1. **Two codes collide.** R10's `NOT_APPROVED` is already filings' C-115.14 (R7), and R11's `ALREADY_ENDED` is already escalation's. Note 8 of `t21-requirements-notes.md` renamed `MACHINE_CANNOT_APPROVE`/`REVIEW` for exactly this (control-plane R22's decoration). My reading: the requirements are the contract, so I mint both as written, each its own C-125 row, and you rename them (`TEMPLATE_NOT_APPROVED`, `TEMPLATE_ALREADY_ENDED`?) at a fold if you want; say so and I re-key.
2. **The migration's two gaps** (filings R26's saved rows, K927: each a `draft` of origin `group`). filings let a template have no kind, and a draft that drew on no determination has no project. My reading: such a row migrates with `kind: null` (it can be read, taken as `from` and commented on, never submitted under R1 as it stands), `use: file`, `profiles: general`; with no project its scope bundle is its draft's action, so it is seen by whoever may see that action (filings' own rule, K316) and has no approver, so a member derives the group's template from it. Every migrated row keeps filings' id as `migrated_from` (idempotent) and gets a new opaque `TPL-` id.
3. **Tier 1 review (R10):** "one member review" read literally: a professional review does not stand in for it at Tier 1 (at Tier 2 it is what is needed).
4. **R5's run, model and skill pack version** come from no stamp named in R6's signature: `templatePropose` takes them as the proposer states them (`run`, `model`, `skill_pack`), null when absent, and R5 lists them as stated.

Also decided (P17, reported): my tables are `tpl_*`, not the Suggestion's `filing_templates`, which is filings' own table name today (a collision).

## J2 · COMPLETE

**Entry applied** (`build/plan/current.md` T21 layer 9, filing-templates; K921, K924, K927, K988): `bio-plane/src/filing-templates/` built from nothing, meeting R1–R25. Files: `index.mjs` (the services, reads, migration, factory `filingTemplatesOf`, ops map `filingTemplatesOps`), `blanks.mjs` (R19), `checks.mjs` (R23), `schema.mjs` (R17). Every `not yet met: T21` mark R1–R25 is met (BOB strikes them at the merge).
- **Moved by copy from `filings`** (K624 (1)): `FILING_BLANKS`, `FILING_TEXT_MAX` unchanged (`blanks.mjs`); `templateSave`'s checks into R1/R2's judges; `templatesFor`'s read into R14. `filings`' job deletes its copies and imports mine. `blanksOf` is new.
- **Migration (K927, J1 (2) as adopted):** each `filings` R26 row becomes a `draft` of origin `group` (`use: file`, `profiles: general`, `kind` kept or null, scope its project or else its draft's action), author its saver, `derived_from {filing, sha}`, the carried note "kept before templates were reviewed (K921)", `migrated_from` kept; idempotent; `filing_templates` is read, never written.
- **K988:** `TEMPLATE_NOT_APPROVED`, `TEMPLATE_ALREADY_ENDED` minted as renamed.
- **Decisions (P17):** tables `tpl_*` (append-only: state, approvals, updates, widenings, endings are `tpl_events` rows, revocations their own table), each keyed by `bundle_id` for purge; opaque ids `TPL-`/`TPP-`/`TRG-` through `mintOpaqueId`, seeded (record-core R70), never colliding with `filings`' library ids or a profile template's. A general template's tier is the strictest across the active profiles' own tiers (the combined view withholds a disagreement). Profile templates are read per active profile (`jurisdictions.get`). Through the op, the stamps are `author` (author, proposer, `by`), `viewer` and `secretSha`; a `{filing, sha}` source is refused there. Extra row C-125.32 `TEMPLATES_STATE_REFUSED` (an unknown `state` for R14). A grant on a version past review answers `NOT_IN_REVIEW`.

**Rows, all `awaiting stamp` for T22's promotion job** (`checks.mjs`, `FILING_TEMPLATE_CHECKS`): moved with their numbers, `where` re-pointed here, held twice until filings' job deletes its copies: C-115.31 (re-keyed `MACHINE_CANNOT_DRAFT_TEMPLATE`, re-worded), C-115.32 `TEMPLATE_NAME_REFUSED`, C-115.33 `TEMPLATE_KIND_REFUSED` (re-worded: a kind is now required), C-115.35 `TEMPLATE_TEXT_REFUSED`, C-115.36 (re-keyed `TEMPLATE_TIER3_FILE`, re-worded), C-115.37 `TEMPLATE_NAME_TAKEN`, C-115.38 `NO_SUCH_TEMPLATE`. New, C-125.1–C-125.32: `TEMPLATE_KIND_UNKNOWN`, `TEMPLATE_USE_REFUSED`, `TEMPLATE_PROFILE_UNKNOWN`, `TEMPLATE_BLANK_UNKNOWN`, `TEMPLATE_SCOPE_REFUSED`, `TEMPLATE_DRAFT_OPEN`, `TEMPLATE_RETIRED`, `TEMPLATE_FROM_REFUSED`, `NOT_A_DRAFT`, `TEMPLATE_NO_PROPOSER`, `TEMPLATE_WHY_REFUSED`, `REVIEWER_UNKNOWN`, `NO_REVIEWERS`, `GRANT_RECIPIENT_REFUSED`, `GRANT_NO_SECRET`, `NO_SUCH_GRANT`, `NO_TEMPLATE_GRANT`, `MACHINE_CANNOT_REVIEW_TEMPLATE`, `NOT_IN_REVIEW`, `REVIEW_REFUSED`, `REVIEW_STALE`, `MACHINE_CANNOT_APPROVE_TEMPLATE`, `TEMPLATE_NOT_APPROVED`, `NOT_AN_APPROVER`, `APPROVER_IS_AUTHOR`, `REVIEWS_INSUFFICIENT`, `TEMPLATE_REASON_REFUSED`, `TEMPLATE_ALREADY_ENDED`, `TEMPLATE_NOTES_REFUSED`, `COMMENT_REFUSED`, `TEMPLATE_NOT_OFFERED`, `TEMPLATES_STATE_REFUSED`, in that order.

**Deferred:** none. **N469:** my paths are new; no note names a file T20 deleted, none names "the battery".

**For BOB, in other modules:**
- **Generated artifact:** no file of mine is in any bundle's import graph yet (the plane composes me in L11, its R11), so I stale none. `fleetbundles.test.mjs` already fails on `tranche/T21` @ 70f8ac15f5 itself, before my change (the bio-plane member: a fresh build is not byte-identical to the committed `dist/bio-plane.bundled.mjs`); same 4 FAILs with and without my branch.
- **op=templates** is now in two ops maps (`filingsOps` and mine): the plane's L11 spread must take mine once filings drops its arm.
- `filings`, when it re-points: `offeredVersion` answers `text` beside the metadata; a `{filing, sha}` source to `templateDraft` must be passed in-process (the op refuses it); `NO_SUCH_TEMPLATE`, `TEMPLATE_RETIRED`, `TEMPLATE_NOT_OFFERED` and (for a profile template) `TEMPLATE_BLANK_UNKNOWN` pass through as mine.

**Tests and checks run:**
- `node --test bio-plane/test/m/filing-templates/` (6 files, R1–R25 each named): `ℹ tests 46 · ℹ pass 46 · ℹ fail 0` (run 5× in a row clean after fixing one same-instant ordering in a test).
- Layer tests: none named in `build/manifest.md`. I changed no service another module uses. Also ran `node --test bio-plane/test/m/promotion/`: `ℹ pass 101 · ℹ fail 0` (its census with my rows present).
- `node checks/format.mjs`: `format: 86 modules, 84 requirements files; 0 failures`
- `node checks/architecture.mjs … filing-templates`: `architecture: 9 product files, 29 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs … filing-templates`: `coverage: 1 modules, 25 of 25 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs … filing-templates tranche/T21`: `ownership: 11 files changed by filing-templates between tranche/T21 and HEAD; 0 failures`

Size (session_01QzJNX4tHiyiLofPjJVXcGU): test runs 24, module lines 1714
