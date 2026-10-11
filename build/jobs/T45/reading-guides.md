# reading-guides (T45)

**Status** · session_01GPQU3GXVRK9Gn2tFttZP17 · depth 2 · COMPLETE · handled B2

## J1 · COMPLETE

**T45-12 applied on `job/T45/reading-guides`, with B2's CHANGE (K2820)** (tranche/T45 merged in after B2). Files: `bio-plane/src/reading-guides/{index,check,checks,schema}.mjs`, `bio-plane/test/m/reading-guides/{procedure.test.mjs (new),fixture,acts,across,reads}.test.mjs`. Nothing outside my paths.

**Read whole by me (P20; K2730):**
- `build/requirements/reading-guides.md`.
- Every file of `src/reading-guides/` (5) and `test/m/reading-guides/` (7).
- T45-12, the plan's Rules at the opening (rule 4) and reconciliation R7 (R80's `after`, read through R13).
- K2780, K2781, K2787; `draft-T45-lower.md` §6 (and §8.3's R46, which reads R13).
- `BIO_Action_v0_2.md` rule 11.
- jurisdictions' Public part and R74–R87 (R80, R87 (d)); its `combine` for `procedure_guides`; the test profile's R80 guide.
- No flaw found in my own code beyond what R13 changed.

**Entries applied**
- **R13** A guide's `purpose`, `reading` (the default) or `procedure`. Stored in a new `purpose` column on `reading_guides` and `reading_guide_proposals`. A store made before R13 gains the column by `ALTER TABLE` at migrate, and every row it already held reads `reading` (tested).
  - A procedure guide's `kind` must be an `action_kinds` kind of the active profiles' view. The view is `jurisdictions.combine` over record-core's `jurisdiction_profiles` setting; a `profileView` dep may be injected. Otherwise the guide is refused `GUIDE_KIND_UNKNOWN`. An unknown purpose is refused with the same code; its detail says so.
  - Items are `{route, expect?, citation}`. The limits are route ≤500, expect ≤500 and citation ≤200 characters. An item with no citation, or a blank one, is refused `GUIDE_ITEM_UNSOURCED`, naming the item.
  - R4 narrowed: `checkGuide(items, purpose)`. For a procedure guide it applies only `op=`, the party list and the registered R16 check (which fails closed). The look-for opener and the act and rule words do not apply. "The Clerk must respond within 10 days" passes for a procedure guide and is still refused for a reading guide. Every act and rule word is tested both ways.
  - R2, R3, R6–R8 and R12 hold for procedure guides. An offer's bytes carry `purpose: "procedure"` only for a procedure guide, so a reading guide's offer bytes are unchanged. Adoption checks the kind against the adopting group's view. `guidesOf` takes an optional `purpose` filter, and every view carries `purpose`. R5's `guideFor` answers reading guides only.
  - `procedureGuidesFor({kind, viewer})` answers `{ok, kind, guides: [{guide, origin, items}], withheld, label}` (K2820). It is served to members by `op=procedureguides` (`{kind}`; the viewer is read from the URL, as my other reads do). Its guides are:
    - first the profile's guide (`guide: null`, since the profile's has no id; `origin: "profile"`; items as R80 holds them, `after` included);
    - then the group's approved procedure guides, in the order of their approval rows, adopted ones included (the group's guides only for a viewer who sees the group, as R8);
    - no rank or score field;
    - every guide passes the narrowed check again, and a failing one is named in `withheld`.
  - Every answer carries `label: {key: "guide.procedure.legalinfo", says: "legal information, not legal advice"}`, the empty answers included. It never throws.

**Mine, done (told as done):**
- One new row in my existing family: C-144.19 `GUIDE_ITEM_UNSOURCED`, region `is-guide-sourced`.
- Re-worded translations of C-144.1 `GUIDE_CARRIES_CONDUCT`, C-144.2 `GUIDE_ITEMS_REFUSED` and C-144.4 `GUIDE_KIND_UNKNOWN`, so each also covers procedure guides.
- The conduct refusal is still minted at one site (`is-guide-look-for`), shared by both purposes.
- The label is shaped `{key, says}`, as my proposal labels are.
- Beyond K2820's three fields, the answer keeps `ok` and `withheld` (`{guide, origin, profile, reason, item}` for a guide that no longer passes the narrowed check), as R5's `guideFor` does. A profile guide's `guide` is null.

**Deferred:** nothing.

**Found in other modules / owed (REPORT-worthy, no change made):**
- `skills` (R46) and `agent-worker` (R78) read the K2820 shape. A profile guide's items may carry `after` (R87 (d)); a group guide's never do.
- `op=procedureguides` is new in my op map. op-declarations (spec, R19/R6), op-grades, affordances (R12) and the plane (route) owe it, as the K2820 STARTs say. It adds to two already-red tests, op-declarations R19/R6 and affordances R12; their names are unchanged from before my change.
- Row census: C-144.19 is new, and C-144.1, .2, .4 are re-worded, until promotion's stamp (rule 4 (2)). UX: the translation of `GUIDE_ITEM_UNSOURCED` and the re-wordings (owed list, "reading-guides").
- The plane bundle is stale (rule 4 (5)).

**Tests**
- reading-guides: 52 pass, 0 fail (`node --test bio-plane/test/m/reading-guides/`). It includes `procedure.test.mjs`, 10 tests naming R13 (and R4, R2, R3, R6–R9, R12 with it).
- Users and readers of my module:
  - answer-envelope 31/31, promotion 137/137, instance-setup 135/135.
  - skills 103 pass, 2 fail: R28 and R30, accepted rule 4 (10).
  - plane 194 pass, 2 fail: compose R11/R5 (rule 4 (11)) and roster R5/R9 (rule 4 (9)).
  - op-declarations 132 pass, 1 fail; affordances 224 pass, 2 fail. Each of these reds is identical on `tranche/T45` without my change (verified by stash): duties' and local-facts' new ops (rule 4 (11), (12)).
  - `test/system/migrate-released.test.mjs`: 1 pass, 0 fail (the released stores migrate with the new `purpose` column).
- Checks:
  - format: 153 modules, 152 requirements files; 0 failures.
  - architecture: 13 product files, 43 relative imports; 0 failures.
  - coverage: 13 of 13 live requirement ids named by a test; 0 failures.
  - ownership: 10 files changed by reading-guides between tranche/T45 and HEAD; 0 failures.

Size (session_01GPQU3GXVRK9Gn2tFttZP17): test runs 15, module lines 1148
