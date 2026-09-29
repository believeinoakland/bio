# affordances (T13)

**Status** · session_01NhLZHCLTs7E1w8EfnWcDnJ · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Q1 (N321's share, B1). My best reading, on which I am proceeding: `op=projectstage` (publication R44) is a viewer-stamped read, `mutating: false`, and control-plane gives it **no `NEEDS` row**. That is how every other project and publication read is carried today (`projectparticipants`, `projectvisibility`, `projectdirectory`, `publishedcase`, `publishededitions`, `caseflags`: 116 of 141 reads have no row). K416 treated `op=profiles` the same way. On that reading, affordances names it in none of `ACTS`, `NON_ACTS`, `RUNGS` or `RUNG_ABSENT`. A `NON_ACTS` row would read `stale` under R12, and a read takes no rung (R3 covers mutating ops only). So no list changes. I am adding a test at my interface: over a table carrying `projectstage` as an ungated read, `unaccounted` is empty, and no registry names it.

If control-plane instead gives it a `NEEDS` row (even `null`, as `inquirystrength` and `casedrafts` have), then the op is gated and needs a `NON_ACTS` "read: …" row. That row would be added on my branch and merged with control-plane's. Tell me which, or tell me once control-plane has merged and I will match its table.

Also (REPORT): R26 now holds at the interface. `index.mjs`'s `op=affordances` publishes `vocabulariesFor(kinds)` with `kinds` asked of actions' `op=actionkinds` at the call (actions R42). I am replacing `plane.test`'s R26 `test.todo` with a test that makes a profile active through `op=profilesset` and checks `action_kind`. The requirement's R26 "not yet met" mark can be struck (the requirements file is yours).

## J2 · COMPLETE

**Entries applied** (B1: N321's share; B2 answered J1):
- `op=projectstage` (publication R44) is accounted for the way every op is. It is a read stamping `viewer`: class `admin`/`member`/`probe`, `mutating: false`, and no `NEEDS` or `SESSION_OPS` row (CONTROL-PLANE #4 J1, as B2 states). So it takes no rung (R3 grades ops that write) and no `NON_ACTS` row (an ungated op's row reads `stale`, R12). No registry names it. That is `op=profiles`' precedent (K416). **No list changed.**
- New test (`catalogue.test.mjs`, "R3 R7 R12: op=projectstage, an ungated read…"): no registry names the op. A table carrying it as an ungated read leaves `unaccounted` exactly as the table without it. Carried as gated or as mutating, it would be named `unpublished` or `unranked`.
- Checked against control-plane's pushed table (`job/T13/control-plane` @ dd775ca0a1, which carries 2ae7254e93): `unaccounted` over its `OPS`/`NEEDS` gives 312 ops, `projectstage` ungated, `{unpublished: [], unranked: [], stale: []}`. On `tranche/T13`: 311 ops, all three empty.
- **R26's mark can be struck** (B2: BOB strikes it at the layer close). `op=affordances` publishes `vocabulariesFor(kinds)` with the kinds asked of actions' `op=actionkinds` at the call (actions R42). `plane.test`'s R26 `test.todo` is now a test. It makes the held non-test profile whose view adds kinds active through `op=profilesset`, chosen from `jurisdictions.list()` and never named (R25). It checks `vocabularies.action_kind` with and without a target: the product's kinds with no profile, then `actions.actionKinds(view)`, then the product's again once cleared. `risk_tiers` is actions' own. Negative control: with `index.mjs` publishing `vocabulariesFor(null)` (a local edit, reverted), the test fails 1/1.
- A flaw fixed in my own module: `affordances.mjs`'s header paragraph "TOTALITY, AND THE DRIFT GUARD" said the suite parses `NEEDS` out of the source. It now names R12's `unaccounted` service and the suite that calls it with the control plane's tables.

**Tests and checks.**
- `node --test test/m/affordances/`: tests 76, pass 76, fail 0, todo 0 (was 75/74/0/1).
- `node --test test/rung-ladder.test.mjs` (legacy-tests', which calls `unaccounted` over the control plane's tables): 1 pass, 0 fail.
- format: 0 failures. architecture: 7 product files, 54 relative imports, 0 failures (the new test imports are `actions` and `jurisdictions`, both declared in `uses`). coverage: 27 of 27 live ids, 0 failures. ownership: 0 failures (no legacy line added).

**Reports.**
- No check row was added, moved or retired, so there is nothing for promotion to stamp (N318).
- Grep: `civicos-ui/` has no hit for `projectstage`. I added and retired no list entry, so there was nothing else to grep for.
- Generated artifacts: `bio-plane/dist/bio-plane.bundled.mjs` carries `affordances.mjs`, and a comment in it changed. The bundle goes stale by that comment and is regenerated at the layer close. I did not rebuild it.
- To re-run once control-plane merges (B2's CHANGE): merge `tranche/T13`, then run `test/m/affordances/` and `unaccounted` over the merged table.

Deferred: none.

Size (session_01NhLZHCLTs7E1w8EfnWcDnJ): test runs 5, module lines 2727

## J3 · COMPLETE · re B3

**B3 applied.** Merged `tranche/T13` @ dda83f78ad (K442, control-plane merged; bundles regenerated) into my branch, a fast-forward: nothing of mine was pending beyond what the tranche already carries. Nothing differs from J2.
- The merged table: `OPS.projectstage` is `{classes: [admin, member, probe], mutating: false}` with no `NEEDS` row. `unaccounted` over the merged `OPS`/`NEEDS` gives 312 ops, `{unpublished: [], unranked: [], stale: []}`.
- `node --test test/m/affordances/`: tests 76, pass 76, fail 0, todo 0.
- format, architecture, coverage (27 of 27) and ownership: 0 failures each.

Deferred: none.

Size (session_01NhLZHCLTs7E1w8EfnWcDnJ): test runs 6, module lines 2727
