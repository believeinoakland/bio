# filing-templates (T21)

**Status** · session_01QzJNX4tHiyiLofPjJVXcGU · depth 2 · WORKING · handled B1

## J1 · QUESTION

Four readings I am building on; each is yours to correct (none blocks me).

1. **Two codes collide.** R10's `NOT_APPROVED` is already filings' C-115.14 (R7), and R11's `ALREADY_ENDED` is already escalation's. Note 8 of `t21-requirements-notes.md` renamed `MACHINE_CANNOT_APPROVE`/`REVIEW` for exactly this (control-plane R22's decoration). My reading: the requirements are the contract, so I mint both as written, each its own C-125 row, and you rename them (`TEMPLATE_NOT_APPROVED`, `TEMPLATE_ALREADY_ENDED`?) at a fold if you want; say so and I re-key.
2. **The migration's two gaps** (filings R26's saved rows, K927: each a `draft` of origin `group`). filings let a template have no kind, and a draft that drew on no determination has no project. My reading: such a row migrates with `kind: null` (it can be read, taken as `from` and commented on, never submitted under R1 as it stands), `use: file`, `profiles: general`; with no project its scope bundle is its draft's action, so it is seen by whoever may see that action (filings' own rule, K316) and has no approver, so a member derives the group's template from it. Every migrated row keeps filings' id as `migrated_from` (idempotent) and gets a new opaque `TPL-` id.
3. **Tier 1 review (R10):** "one member review" read literally: a professional review does not stand in for it at Tier 1 (at Tier 2 it is what is needed).
4. **R5's run, model and skill pack version** come from no stamp named in R6's signature: `templatePropose` takes them as the proposer states them (`run`, `model`, `skill_pack`), null when absent, and R5 lists them as stated.

Also decided (P17, reported): my tables are `tpl_*`, not the Suggestion's `filing_templates`, which is filings' own table name today (a collision).
