# control-plane (T27)

**Status** · session_017vDG4wd8mxTeSyfas1vs7o · depth 2 · WAITING ON BOB (J2) · handled B4

## Progress

Built and pushed: R46 (the store door's hold refusal, C-69.5, in `dispatch.mjs`; the row in `checks.mjs`), R47 (`projectholds` in `PROJECT_NAMING_READS_NOT`; the stamps come from op-declarations' lists), R48 (docket's stamps in `index.mjs` from `DOCKET_*`; docket's three reads classified), and R22 (docket's family in `CHECK_FAMILY_FILES`, read after action-grammar's; J2 item 1). Tests: `purge-hold.test.mjs`, `r48-routes.test.mjs`, and C-69.5 in `envelope.test.mjs`. **Next:** once `job/T27/op-declarations` (and affordances) are on `tranche/T27`, merge the tranche, run the module's tests and the four checks, then the users' tests (plane), write the completion, and post COMPLETE.

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
