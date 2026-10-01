# filings (T21)

**Status** · session_01TvVyWHR59YbbaUAFjxHb9M · depth 2 · WAITING ON BOB (filing-templates merge, rule 2) · handled B2

## J1 · QUESTION

My readings, on which I carry on; each changes only what I build, not a requirement's meaning. Upstream (local-facts, action-clocks, filing-templates) has not merged; I am doing the parts that do not read them (R8, R10, R17's packet arm, the retired rows, the fixtures re-keyed to R40's object) and will merge `tranche/T21` when filing-templates lands.

1. **The `filing_templates` table.** K927 adopted "R26's saved templates migrate as drafts", so filing-templates' migration reads my table. I delete `templateSave`'s keeping, `templatesFor`, the moved rows and their tests, but **keep the table's CREATE and its purge declaration** (R19) as the read contract filing-templates' migration reads, its rows written by nothing any more. If you would rather the table be dropped (by me, after filing-templates' migration has run), say so.
2. **R28's order.** After R1's refusals: `TEMPLATE_AND_TEXT` first (both given), then with `template` the `offeredVersion` refusals, `TEMPLATE_USE_BRIEF`, `TEMPLATE_KIND_MISMATCH`; with `text`, `TEXT_UNWRITABLE` then `TEMPLATE_BLANK_UNKNOWN`; with neither, the profile's `file` template, else `TEMPLATE_NOT_NAMED`. With `text`, `TEXT_UNWRITABLE` and `TEMPLATE_BLANK_UNKNOWN` are filing-templates' codes and rows (R2 there: `TEMPLATE_TEXT_REFUSED`, C-115.35 moved); R28 names `TEXT_UNWRITABLE` (C-115.12, mine, R6). I answer `TEXT_UNWRITABLE` from my own row (C-115.12, its `where` widened to filingPrepare) and pass `TEMPLATE_BLANK_UNKNOWN` through as filing-templates' (judged by its `blanksOf`).
3. **`TEMPLATE_NOT_NAMED`'s list** (at most 20 offered `file` templates for the kind) is read through `filing-templates.templatesFor` (its R14), which my Uses does not name (it names `templateRead`); I read it there.
4. **R29's statement** goes after R24's disclosure and R4's advisory, before the template's text: disclosure, advisory, "not written for", text. "Naming it" names the action kind's profile (its `profile` tag).
5. **R8 with no counsel** stores `counsel: null` and the head and export say no counsel is named; `NO_COUNSEL` at Tier 1 or 2 only for a counsel given without both name and organisation (or a field too long).
6. **R31's briefing** at Tier 3 with no counsel is refused `NO_COUNSEL` before R31's template refusals (R8's order).
