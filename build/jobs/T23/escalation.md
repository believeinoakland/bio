# escalation (T23)

**Status** · session_01N9sEHpafE1j6jdtXMc1XiR · depth 2 · RUNNING until 2026-10-02T09:51:57Z (node --test bio-plane/test/m) · handled B1

## Completion

**Entries applied** (B1; `build/plan/current.md` T23 layer 9, escalation).
- **N485, R29** (DEC-89 with Bob's addition; K1019, K1025, K1051): `escalationReasonDraft({determination, nowMs?, viewer})` (`bio-plane/src/escalation/index.mjs`) offers R1's opening reason assembled from the determination's record and writes nothing. It is one sentence per part, each part `{id, text}` naming the record id it came from, and `text` is the parts in order. The parts are:
  - the determination and the noncompliant standards it pursues;
  - the act (its id; description, office and date, each stated undetermined where the read lacks it);
  - each pursued standard with its basis as `conformance.determinationRead` holds it: its rows (`requires`, `did`, `reading`, content), whether it was in force, and any disagreement the determination states;
  - each action resting on the determination that the viewer may see (`actions.actionsFor`, every page; each read through `actionRead` at the same instant; one `actionRead` refuses is left out whole), with its counterparty office, state, each clock entry with its basis and status, and every pending date passed at `nowMs` (the caller's, else the instance clock; `actions` R12's UTC-day rule);
  - each live consequence part (`consequences.consequencesOf`), with its affected, measure (or why it is undetermined), period, state and causation, never a total.

  A read that is refused, a provider read that fails, or a page limit exceeded is stated undetermined, never filled. The answer is labelled `proposalLabel("system", "escalation_reason")`, so `machine_proposed` and machine work. It also carries `as_of`, `length`, `reason_max` (2,000) and `next`. Refusals: `NO_SUCH_DETERMINATION`, `DETERMINATION_SUPERSEDED`, `NOT_NONCOMPLIANT`, asked through `#pursuable` with a draft mode that stops after those three. Each code is still minted at its one site, so no C-116 row and no `where` changed. Like every service, it answers `PROVIDER_UNAVAILABLE` when a provider is absent.
- **R25's `escalationreasondraft` arm** (K1122): `ops.mjs` passes the query's `determination`, `now` as `nowMs` and `viewer`. The header is re-worded: it says the legacy store, not `store.mjs`, which no longer exists.
- **N497**: `fixture.mjs` registers `producingGroup` under `instance-setup`. No assertion changed meaning.
- The fixture's stand-ins gain `actionsFor` (R30's shape, paged) and `consequencesOf` (R7's shape). `actionRead` gains `current_state` and `now`. The conformance stand-in answers R9's `standards` with rows.
- The re-scan for comments of N469's or N502's kind found none beyond `ops.mjs`'s header (re-worded). The `record-grammar` imports now go through its one entry (`index.mjs`).

**Deferred:** none.

**Found in other modules:** none to change. R29 needs no new service; each read it uses answers in its published shape (proved over the real modules in `real.test.mjs`).

**Reds, for the merge (REPORT J1):**
- `bio-plane/test/m` has 5148 tests: 5130 pass, 6 fail, 12 skipped or todo. Each failure is accepted by name, and the same 6 fail on `origin/tranche/T23` without this change:
  - conformance `record.test.mjs` R17 (red 6, conformance's share, N483);
  - control-plane `families.test.mjs` R22 (K1150);
  - control-plane `inbox-door.test.mjs` R36 (red 9);
  - plane `worker.test.mjs` R6 (red 6, plane's share);
  - queue `catalogue.test.mjs` R1 and R5 (red 13).
- Red 5 for `escalationreasondraft` did not appear: affordances' and op-declarations' tests (in the run above) already name the op.
- The plane bundle is STALE (`fleetbundles.test.mjs`) because of `src/escalation/index.mjs` and `ops.mjs` (red 12). Nothing was regenerated.

**Tests and checks run:**
- `node --test bio-plane/test/m/escalation/`: 52 tests, 52 pass, 0 fail.
- Users (action-plans, monitoring, queue-producers, control-plane, affordances, plane) and the whole `bio-plane/test/m`: as above.
- `checks/format.mjs`: 87 modules, 0 failures.
- `checks/architecture.mjs escalation`: 13 product files, 0 failures.
- `checks/coverage.mjs escalation`: 29 of 29 live ids named, 0 failures.
- `checks/ownership.mjs escalation tranche/T23`: 7 files, 0 failures.

Size (session_01N9sEHpafE1j6jdtXMc1XiR): test runs 9, module lines 1833
