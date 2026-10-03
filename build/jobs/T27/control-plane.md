# control-plane (T27)

**Status** · session_017vDG4wd8mxTeSyfas1vs7o · depth 2 · COMPLETE · handled B4

## Completion

**Entries applied** (L11; N518 R46, R47; N520 R48; R22's accepted red 4 cleared):
- **R46** (DEC-113, C-69.5): `dispatch.mjs` refuses `op=purge` 409 `PURGE_HOLD_IN_PLACE` before the purge route (record-core's arm) runs, unless `store.purgeHeld({bundleId})` answers exactly `false`. A throw, an absent reader or any other answer refuses (a failure to ask). `bundleId` is read as record-core's arm reads it (`|| null`). `store.namespace()` is asked at the purge: only `"scratch"` skips the check, and any other answer, a throw or a non-function reads as the real record (B2, PLANE #17's shape). The refusal names only the `bundleId` asked. The row C-69.5 is new in `checks.mjs` `DISPATCH_CHECKS`; its `where` is `dispatch.mjs purgeHoldRefusal > is-purge-hold-in-place`.
- **R47**: `projectholds` is in `PROJECT_NAMING_READS_NOT`, with its reason (`held: null`, DEC-36). The three hold ops route through `actions`' map with the stamps from op-declarations' `ACTIONS_ACTIONS`/`ACTIONS_READS` (R12); the door needed no new stamp code.
- **R48**: `index.mjs` stamps `viewer` on `DOCKET_ACTIONS` and `DOCKET_READS`, and the positional identity as `author` on `DOCKET_AUTHOR` and as `by` on `DOCKET_BY` (op-declarations R13, names agreed in J1/B2). The docket's public shelves and feed are public ops answered by plane's public hook through public-read's door (its R21); the door adds nothing for them. Docket's three reads are classified in `PROJECT_NAMING_READS_NOT`.
- **R22**: `families.mjs` reads `src/docket/checks.mjs`. It is read after action-grammar's file, not at docket's module-order place, because docket holds `MACHINE_CANNOT_MARK_PRESSURE` (C-129.10), a code action-grammar's C-117.14 already holds (J2 item 1; N526 in `next.md`, K1291). Once docket renames it, docket's entry moves to its place directly after publication.

**Deferred:** moving docket's family to its module-order place, after N526 (above). Nothing else.

**Found in other modules (reported, J2):**
- `docket`: one code held in two places (DEC-49), above.
- `plane`: until PLANE #17 hands `namespace` and `purgeHeld` to `dispatch` (plane R14), every purge outside `scratch` is refused C-69.5 (fail closed).
- Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (owned by `not_product`) is stale by this module's source; regenerated at layer close.

**Catalogue rows awaiting stamp (accepted red 2):** C-69.5 `PURGE_HOLD_IN_PLACE`.

**Tests and checks** (on `job/T27/control-plane` with `tranche/T27` merged, bd56b74570):
- `node --test bio-plane/test/m/control-plane/*.test.mjs`: tests 139, pass 139, fail 0. New: `purge-hold.test.mjs` (R46), `r48-routes.test.mjs` (R47, R48); C-69.5 added to `envelope.test.mjs`'s R32 census.
- Users' tests, `plane`: `test/m/plane/*.test.mjs` and `test/system/migrate-released.test.mjs`: tests 56, pass 56, fail 0, skipped 0.
- `format`: 0 failures · `architecture control-plane`: 0 failures · `coverage control-plane`: 32 of 32 ids named, 0 failures · `ownership control-plane tranche/T27`: 8 files, 0 failures.
- Module size: code 3,612 lines (`src/control-plane/`), tests 5,739 lines; diff against the tranche +413/−10 in 7 files.

Size (session_017vDG4wd8mxTeSyfas1vs7o): test runs 9, module lines 9351

## J1 · QUESTION

R48 and R47's stamps are set from op-declarations' act lists. OP-DECLARATIONS #7 is building R12 and R13 now, so I need the names of the lists it will export. My best reading, which I am building against:

- R47: `actionholdrelease` joins `ACTIONS_ACTIONS`, as R12 says; it reaches `QUERY_AUTHOR_ACTIONS`, so `author` is the positional identity and `viewer` is stamped. `actionholdpreview` and `projectholds` join `ACTIONS_READS`, so `viewer` is stamped. This needs no change in control-plane's door except R27's entry for `projectholds` in `PROJECT_NAMING_READS_NOT`.
- R48: op-declarations exports
  - `DOCKET_ACTIONS` = docketfile, docketpressure, docketdecline, docketpost
  - `DOCKET_READS` = docket, docketprepare, docketinvitation
  - `DOCKET_AUTHOR` = docketfile, docketpressure (`author` = the positional identity, `member:<id>`)
  - `DOCKET_BY` = docketprepare, docketdecline, docketpost (`by` = the positional identity)
  - `DOCKET_PUBLIC_READS` = docketpublic, docketfeed

  `viewer` is stamped on all seven member ops, because docket's map passes `viewer` to each one. `docket`'s `#member` reads `positionalMember(null, identity)`, so the positional form is the one it accepts. The two public reads get `classes: null` and go to plane's public hook (public-read's `publicReadDoorOp`, R21), as `publishedcase` does. The door adds nothing for them.

If op-declarations picks other names, I will re-point my import at the merge. Please pass these names to OP-DECLARATIONS #7, or tell me the ones it uses.

## J2 · REPORT

Three things.

1. **A flaw in `docket`: one code held in two places.** `docket`'s `DOCKET_CHECKS` holds `MACHINE_CANNOT_MARK_PRESSURE` as C-129.10 ("Only a member, signed in as themselves, marks a docket entry as a threat…"). `action-grammar`'s `ACTION_CATALOGUE_CHECKS` already holds the same code as C-117.14 (`actions`' `actionpressure` refusal). That is DEC-49's one-code-one-row rule broken (the guard's arm A); `docket` R2 needs its own code, for example `MACHINE_CANNOT_MARK_DOCKET_PRESSURE`. Until then I read docket's family *after* action-grammar's in `CHECK_FAMILY_FILES` (not at its module-order place after publication), so `actionpressure`'s refusal keeps C-117.14 (R43; `catalogue-end` and `families` tests). Docket's own refusals carry their row at the site (`withRow`), so the wire is right for both. Once docket renames its code, the list can move docket to its place; that is a one-line edit for this module.

2. **The store door's interface, for PLANE #17 (R46; plane R14), as built:** `dispatch(req, {routes, membership, namespace, purgeHeld})`. `namespace()` and `purgeHeld({bundleId})` are functions, asked only at an `op=purge` that has a route. Only `namespace() === "scratch"` skips the hold check. Any other name, `null`, a throw, or a non-function reads as the real record. The purge runs only when `purgeHeld` answers exactly `false`; anything else (`true`, a throw, an absent reader, a non-boolean, a promise) is refused 409 `PURGE_HOLD_IN_PLACE` (C-69.5). So plane must pass a synchronous reader.

3. **Merge order.** My branch imports `DOCKET_ACTIONS`, `DOCKET_READS`, `DOCKET_AUTHOR` and `DOCKET_BY` from op-declarations, so it loads only once `job/T27/op-declarations` is on `tranche/T27`. Against a local merge of op-declarations and affordances, the module's 139 tests pass (0 fail). I will merge the tranche, re-run and post COMPLETE once both are merged. Format, architecture, coverage (32/32) and ownership checks are green now.
