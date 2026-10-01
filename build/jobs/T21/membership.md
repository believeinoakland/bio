# membership (T21)

**Status** · session_01UPfhtBfCMAXM1TSrfENr6o · depth 2 · COMPLETE · handled B1

MEMBERSHIP #15, T21 layer 2. Entries from BOB's B1 START (`build/plan/current.md` L2 membership).

## Completion

**Applied**
- **N453** (K875, K910). Re-scan at `tranche/T21` HEAD over `bio-plane/src`, `bio-plane/test/m` and the kept suites (`bio-plane/test/*.test.mjs`, `bio-plane/test/system/`, `civicos-ui/test/`): no caller of membership's signer-key copies remains (ratification's `preflight.test.mjs` calls `w.credentials.*`; `control-plane/dispatch.mjs`:209–210 dispatches to credentials; the other hits are credentials' own tests and code). Deleted from `index.mjs`: `signerRegisterOwn`, `signerRevokeOwn`, `#signerMemberBar`, `#keyShaped`, the comment block naming them as waiting, the `SIGNER_ENROLMENT_CHECKS` import, and the `isMachineIdentity` import only `signerRegisterOwn` used. Deleted from `checks.mjs`: `BAD_KEY` (C-96.8), rows C-96.15–.17 and their header comments, the `SIGNER_ENROLMENT_CHECKS` copy (C-63.1, C-63.2) with its note; the family comments now say C-96.8 is `credentials`'.
  - **Rows leaving membership's table (promotion's stamp, rule 4):** C-96.8 `BAD_KEY`; C-96.15 `SIGNER_KEY_HELD_BY_ANOTHER`; C-96.16 `SIGNER_KEY_REVOKED`; C-96.17 `MACHINE_CANNOT_REGISTER_KEY`; C-63.1 `SIGNER_MEMBER_NOT_ENROLLED`; C-63.2 `SIGNER_MEMBER_NOT_ACTIVE`. Each stays in `credentials/checks.mjs`, so every code keeps its row (families test green).
- **N468** (K923, K933). R96's export comment (`index.mjs`) re-worded: plane registers the export under this module's name (plane R10), so membership registers nothing itself; `src/plane/held.mjs` no longer named. R96's test (`t20-figures.test.mjs`): header, helper and messages re-worded from "plane's held copy" to R96's own pinned statement of the figure (`pinned`); assertions unchanged.
- **N469** (K931). Notes naming a file T20 deleted as live, re-worded: `index.mjs` (the `project_sight` derivation) and `schema.mjs`:76 (`versionnotice.test.mjs`'s witness) now point to `t19-enrol-boot.test.mjs`'s R45/R85 test, which holds a second boot's index idempotent at the byte; `index.mjs` `derivation-bounds.test.mjs` claim dropped (the cost statement stays). Re-scan of my paths found more live claims, each handled the same way: `bounds.test.mjs` "names" (dropped); "the suite's negative control" for the identity stamp (dropped, control-plane's); `position-first` control arm (now R61's test in `sight.test.mjs`); `default-discoverable` arm "now flips THIS CASE" (dropped; the "caught that" provenance stays); `roster-stamp-dropped` arm (dropped); `ownsAnyProject`'s "control arms exist to catch" (dropped); `fence-dropped` arm (now R9's test in `not-an-admin-visibility.test.mjs`, which asks with a bearer's stamp). Provenance notes ("caught by", "found by", "first full battery") kept.
- **K936** (JURISDICTIONS #5 J2 (4)). `MODULE_ORDER` gains `local-facts` (first in layer 9) and `filing-templates` (after `action-clocks`), in `build/modules.json`'s order. R83 and R79 are green again; so is promotion's R39/R45/R46 ordering test, which reads the same list.

**Deferred.** None of the entries. Seen, not changed: a few comments still point at the legacy `index.mjs` for the control plane's stamp tables (`GOVERNANCE_ACTIONS` is in `op-declarations` now; `dec49Decorate` in `control-plane/index.mjs`). They are history from the old source, not claims about tests, so I left them out of this entry's scope.

**Found in other modules.** None outside my paths. Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (inputs `src/membership/index.mjs`, `checks.mjs`, `schema.mjs`); no other bundle's manifest names a membership file. Not regenerated (REPORT J1).

**Tests and checks**
- `node --test test/m/membership/`: before 137 pass, 2 fail (R83, R79: the accepted red); after 139 pass, 0 fail.
- `test/m/credentials/` 33/33; `test/m/ratification/` 181/181; `test/m/control-plane/` 93/93 (`families.test.mjs` among them).
- Whole `test/m`: 4681 tests, 4617 pass, 44 fail. Baseline `origin/tranche/T21` (2ac3f3814d…b6bba07ff7) in a worktree: 4670 tests, 4600 pass, 50 fail. No test fails here that passes on the baseline. Fixed relative to it: R83, R79, promotion's R39/R45/R46 ordering test (all from K936), plus test-support's R2 read-only tree and two extraction files (`convert-tiers`, `staffdirectory`), which differ by the worktree's environment, not by this change.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio membership`: 0 failures. `checks/coverage.mjs bio membership`: 79 of 79 live ids named, 0 failures. `checks/ownership.mjs bio membership tranche/T21`: 0 failures.

Size (session_01UPfhtBfCMAXM1TSrfENr6o): test runs 8, module lines 3341

## J1 · REPORT

Generated artifact made stale by this job: the plane's bundle, bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (inputs src/membership/index.mjs, checks.mjs, schema.mjs changed). No other bundle manifest names a membership file. Not regenerated (mechanics §14).
