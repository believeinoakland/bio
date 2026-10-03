# reevaluation (T28)

**Status** · session_01CqAd23e8YE6QX8eLXZeLoJ · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R1's new sentence, my reading (carrying on with it):
1. A ref target is seen by a viewer when `accepted-work.acceptedFinding({ref, edition, viewer})` answers a finding at **at least one** edition a leg on it names; it is refused `NO_SUCH_BUNDLE` when that answers null at every such edition (or no leg names it). "at any edition" read as "not at any".
2. With nothing registered, or the read unreadable, whether the viewer may see the ref cannot be read, so a targeted read is refused `NO_SUCH_BUNDLE` (the safe side, R20) and states `accepted_work_absent` (or `acceptance_read: false`); an untargeted listing withholds such a target's obligations whole.
3. A machine credential (`viewerPredicate` scope `member`) is not filtered, as for bundles.
4. A ref is never a `deletion` cause: today a leg on one is listed with a false `deletion` cause (`#moved` finds no `bundles` row). Fixed in this job.
R32: the capture's level moves are kept in a new table `reevaluation_capture_level_moves` (capture sha, both levels, case, edition, instant; no member), whole-store purge only, rather than altering R29's table (whose `observation` is NOT NULL on deployed stores). R18's list names R29's rows; this is the same kind of row.

## J2 · COMPLETE

**Entries applied** (plan L7: R1, R8, R31, R32; N519, N522), on my reading J1 as answered by B2 (K1312):
- **R1**: an imported finding reference is a target. It is seen when `accepted-work.acceptedFinding` answers a finding at any edition a leg on it names (the editions read off the dependents' `basis[ord].target_edition`). Otherwise it is refused `NO_SUCH_BUNDLE`, as an absent target is. With nothing registered the refusal states `accepted_work_absent`; a failed read states nothing more. A machine credential is not filtered. The untargeted listing withholds an unseen ref's obligations whole, and `recordReevaluation` uses the same rule. **Flaw fixed:** before this job, a leg on a ref was listed with a false `deletion` cause (no `bundles` row); `#moved` now answers no own cause for a ref.
- **R31**: the cause arm `acceptance` (`#accepted` pages `acceptanceWithdrawals` through each cursor; `#acceptanceOn` checks the leg's edition against each withdrawal's `edition` and `refs`, live legs only). It carries `since` (the withdrawal's `at`), `ref`, `edition`, `withdrawal`, `import`, and `group`/`case` read through `acceptedFinding` for the viewer (null where it answers none, e.g. a machine credential under case-import R16). It is in `reevaluations`, `changesOf` (R9) and `CAUSE_SOURCES`, and closes by R16. The answers state `accepted_work_absent`, or `acceptance_read: false` when the withdrawals cannot all be read (R21). Telling: `acceptanceWithdrawn({withdrawal})` (an id, or an object carrying one). It tells R8's listeners once after commit (`kind: "acceptance"`, `subject` the withdrawal, `import`, `edition`, `refs`, `dependents` `{bundle_id, ord, role, state, target}`), writes nothing and never throws. Unknown → `withdrawal_read: false`.
- **R8**: kind `acceptance`.
- **R32**: `levelMoved({capture, …})` writes one row in the new table `reevaluation_capture_level_moves` (capture sha, both levels, case, edition, instant; no member; whole-store purge, declared). The `attribution` cause goes to live legs targeting a document whose capture it is (R28's `#legCaptures`: a passage's capture, or each capture a whole target registers), after the dependent's last write. A call naming both `observation` and `capture`, or a capture that is not a whole sha-256, writes nothing. Told as `kind: "attribution"`, `subject` the capture, naming no member. `#legsOnSource` refactored onto a shared `#legsOnCaptures`.

**Deferred:** none.

**Other modules:**
- `bio-plane/dist/bio-plane.bundled.mjs` is stale from this module's source (§14). BOB regenerates it at L7's close.
- For `case-import` (L8, its R7): call `reevaluation.acceptanceWithdrawn({withdrawal})` after the withdrawal commits and carry the answer as `reevaluation`.
- For `ratification` (L8, its R36): `levelMoved({capture, from, to, case, edition, at})` is ready.
- For `plane` (L11): reevaluation reaches `acceptedWorkOf(host, {record, promotion})` lazily unless given `deps.acceptedWork`; strength and basis-versions already create the same per-host instance.
- control-plane `families.test.mjs:47` fails as accepted red 6, and identically without this change.

**Catalogue rows added:** none (nothing awaits a stamp).

**Re-scan (N502/N508 kind):** clean. The one `src/plane/store.mjs` note names a live file; line 12's "extracted from `store.mjs`" is history.

**Tests and checks:**
- reevaluation: 111 pass, 0 fail (new: `acceptance.test.mjs` (7, R1 R8 R9 R16 R18 R19 R20 R21 R31); `attribution.test.mjs` +3 (R32)).
- Users' tests: publication 98/0, docket 37/0, ratification 199/0, case-authoring 100/0, conformance 54/0, monitoring 99/0, scheduler 66/0, affordances 153/0, queue-producers 73/0, plane 65/0, migrate-released 1/0, control-plane 138/1 (red 6 only).
- Checks: format 0 failures (95 modules); architecture 0 (17 files); coverage 32 of 32 live ids, 0 failures; ownership 5 files, 0 failures.

Size (session_01CqAd23e8YE6QX8eLXZeLoJ): test runs 9, module lines 2790
