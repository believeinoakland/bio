# op-declarations (T24)

**Status** · session_01XsBuA9qDhPPKm4AZfBVosV · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1; `build/plan/current.md` T24 L11, op-declarations)
1. **N490, R11.** `OPS.optionstartpreview` = `{classes: ["admin", "member", "probe"], mutating: false}` (a read; `optionstart`'s classes, no `machineClasses`). In `SESSION_OPS.member` and `SESSION_OPS.admin`. Its stamps are `author` and `viewer`, through a new list `ACTION_PLANS_PREVIEWS = ["optionstartpreview"]`. That list joins `QUERY_AUTHOR_ACTIONS`, so the door stamps `author` as the start's own positional identity, and through it `ACTION_LAYER_ACTIONS`, which stamps `viewer`. Control-plane's stamping code needs no change. `NEEDS.optionstartpreview` is a present `null`: a read needs no capability, and affordances names it in `NON_ACTS` (its B1), so its R12 totality needs the row to be gated (K516's precedent, as `publishpreflight`). Clears red 6's op-declarations share.
2. **N506, R10's `sweeps`.** It is declared for link-sweep's map (its R9). `MONITORING_READS` is renamed `LINK_SWEEP_READS` (its only reader was this module; nothing outside imports it). Its spec, stamps and session reach are unchanged, and it still joins `ACTION_LAYER_READS`. The comments are re-pointed to link-sweep R9. A new R10/R6 test reads `linkSweepOps`' own map through the `link-sweep` edge (K1207): every op it serves has a spec, and `LINK_SWEEP_READS` names exactly its reads.
3. **The N502/N508 re-scan of my module.** One hit: `CUSTODIAL_ACTIONS`' note named the retired store's `Store#custodialBar` as live. It is re-worded to the owners (membership's methods for `memberadd` and `memberset`, credentials' `#custodialBar` for the signer acts). The header now says `control-plane/ops.mjs` has been deleted and reads R1–R11. No `awaiting stamp` text is in the module. `UNATTENDED_BY_DECISION`'s `src/control-plane/ops.mjs` citations keep their words (Suggestions: a citation names where a decision was recorded).

**Decided here (a technical detail, for `rulings.md` if BOB keeps it).** The preview is stamped through `QUERY_AUTHOR_ACTIONS` rather than by a new rule at the door. As a result, two composed lists named `_ACTIONS` carry one read. R4's test now states that exception by name, and only that one: a list named `_ACTIONS` holds mutating ops, except `optionstartpreview` in `QUERY_AUTHOR_ACTIONS` and `ACTION_LAYER_ACTIONS`.

**Deferred.** None.

**Found in other modules.**
- `plane`'s bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is likely stale from my change under `bio-plane/src/op-declarations/`. I regenerated nothing (manifest §14).
- `control-plane` (its L11 job, "`sweeps` and `optionstartpreview` routed"): the stamps need no door change, because the lists confer them. Its comment at `index.mjs`:1343 ("monitoring's `sweeps` take it as `ACTION_LAYER_READS`") now names link-sweep's read. Nothing imported `MONITORING_READS`.
- `control-plane` `test/m/control-plane/totality.test.mjs`:16 now reads `unpublished: ["optionstartpreview"]` until affordances' L11 merge adds its `NON_ACTS` entry. This is red 6, its affordances share.

**Rows `awaiting stamp` (red 5).** None: this module holds no catalogue rows.

**Tests and checks**
- `node --test bio-plane/test/m/op-declarations/`: tests 35, pass 35, fail 0. Negative control: run against the module as it stood at B1, the new tests give pass 27, fail 8.
- `node --test bio-plane/test/m/`: tests 5280, pass 5260, fail 9, skipped 0. Run on the module as it stood at B1, the same files give 8 of those 9 failures. The one added is `control-plane/totality.test.mjs`:16, red 6 (above). The other eight are accepted reds:
  - `affordances/catalogue.test.mjs`:524 and :903, `optionstartpreview` not yet affordances': red 6.
  - `control-plane/families.test.mjs`:47 and `r45-routes.test.mjs`:68 (`sweeps` not yet a route of control-plane's owner map): red 7.
  - `plane/compose.test.mjs`:101, `door.test.mjs`:183 and :209, the sweep's and queue's composition (K1208): red 7.
  - `plane/notices.test.mjs`:33, no mint seed: red 9.
- Checks (civicos-process): `format`: 88 modules, 87 requirements files; 0 failures. `architecture`: 0 failures. `coverage`: 11 of 11 live requirement ids named by a test; 0 failures. `ownership` against `tranche/T24`: 0 failures. Both re-run after the commit; see below.

Size (session_01XsBuA9qDhPPKm4AZfBVosV): test runs 8, module lines 2490
