# actions (T22)

**Status** · session_017xH4dbRvV6QifghDnUGAVp · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R55 is built as B1 says (`3edac9159a`): `actionsOf` registers `captureOf(host).registerReader("litigation-hold", "actions", () => a.holdInPlace())` once per host; the reader is synchronous, unviewered, writes nothing, answers `true` on a failed read. `test/m/actions/t22.test.mjs` proves it over the real capture with every negative control B1 lists; `test/m/actions/` 66/66 green, t18 green (note sent).

The consequence for users' suites: `captureOf(host)` with no capture on the host creates one, and capture's default `provenanceOf(ctx)` joins provenance's promotion step to the host. Fixtures that build `actionsOf` without provenance's tables now fail every promotion (`no such column: authored`, provenance `#testimonyFence`): `test/m/action-clocks/` 25 of 27 red (all fixture), `test/m/action-plans/` 43 of 43 red, `test/m/affordances/backing.test.mjs`:140, :165 (through action-plans' fixture). Without my change all three are green (checked by stash). The plane is unaffected: it builds provenance before actions, and capture adopts the `env` of its later caller (R58); I also hand capture the `env` actions is given.

My best reading, which I carry on with: keep `captureOf(host)` as B1 says; these are users' fixtures that do not migrate provenance, which every real host has; accept them by name until each user's job adds `provenanceOf(host).migrate()` to its fixture (action-clocks is in L9 now; action-plans and affordances later). The alternative within my module is `capture: null` unless a dep is given, which leaves the plane to register the reader (`plane` passing `capture`), contrary to "at start, once, in actionsOf". Which do you want?

## J2 · REPORT

Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs`. This job changed `bio-plane/src/actions/index.mjs` (R55's registration, `holdInPlace`) and `bio-plane/src/actions/schema.mjs` (a comment only), and actions now imports `../capture/index.mjs`; the plane's bundle is stale. Regenerated nothing (`build/manifest.md`, "Generated artifacts").

## J3 · COMPLETE

**Entries applied** (START B1; ANSWER B2, K1086)
- (1) **R55 met.** `actionsOf` registers, once per host and at start beside its other registrations, `captureOf(host, {env})`'s `registerReader("litigation-hold", "actions", () => a.holdInPlace())` (capture R32). `holdInPlace()` takes no argument and answers synchronously `true` when any (action, entry) in `action_holds` has `in_place` as its highest-`seq` statement, whatever the viewer, else `false`; it writes nothing and never throws, a failed read answering `true`. A refusal from capture's slot held by `actions` (another host over the same storage) stands; one held by any other module throws as a wiring defect. Deps take `capture` (`null` registers none). The `*(not yet met: T22)*` mark on R55 is BOB's to strike.
- (2) `test/m/actions/t18.test.mjs`:299's `createEntity` sends a note (entities R1, `ENTITY_NO_NOTE`); its assertions (R9's person arm, the office landing) unchanged; green.
- (3) Re-scan: `schema.mjs`:75 named the deleted plane `index.mjs` as live ("SERVER-STAMPED at index.mjs"): re-pointed to the control plane. `index.mjs`:1550's "deleted in T20" is provenance and stays. No other note names a T20-deleted file, `tools/` or `legacy-tests`.

**Deferred**: none.

**Found in other modules**: in J1 (and B2): `captureOf(host)` brings capture and, through its default, provenance onto the host; action-clocks' and action-plans' fixtures never migrate provenance's tables, so `test/m/action-clocks/` (25: calendar :76 :143 :178 :188; clocks :33 :52 :71 :93 :115 :164; overdue :15 :40 :50 :75 :95 :133; reminders :19 :42 :86 :104 :130 :167 :207 :231 :245), `test/m/action-plans/` (all 43) and `test/m/affordances/backing.test.mjs`:140, :165 are red from this merge until action-clocks' L9 job and action-plans' L9 job fix their fixtures (B2). The plane bundle stale (J2, REPORT).

**Tests and checks** (head `3edac9159a` plus mail commits)
- R55: `test/m/actions/t22.test.mjs` over the real capture on one host: no hold → `may: true` naming actions; `in_place` → `may: false` for an action in a project and one in none, invisible to the asking viewer; released with another entry still in place → false; all released → true; the latest statement decides; the hold table renamed away → reader `true`, `may: false`, no throw; reader writes nothing (holds, marks, manifest, bundles, both documents unchanged); a second `actionsOf` registers nothing and capture's slot refuses another module naming actions. Mutations checked: dropping the latest-statement rule, and answering `false` on a failed read, each turn a test red.
- `test/m/actions/`: tests 66, pass 66, fail 0.
- Users' suites and capture: filings 58/58, escalation 38/38, monitoring 73/73, queue 80/80, instance-setup 86/86, capture 112/112; action-clocks 2/27 and action-plans 0/43 (B2's), affordances 136/138 (B2's two), queue-producers 45/49 (`proposals.test.mjs` :78 :124 :153 :167, accepted), control-plane 100/102 (`doorbell.test.mjs`:310, `catalogue-end.test.mjs`:15, accepted).
- Whole `bio-plane/test/m`: tests 4929, pass 4831, fail 80, cancelled 0. The 80: B2's 70 above; accepted carries `control-plane/catalogue-end.test.mjs`:15, `doorbell.test.mjs`:310, `membership/module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, `promotion/registry.test.mjs`:58 (accepted red 4), `queue-producers/proposals.test.mjs` (4), `scheduler/plane.test.mjs`:85. No other red; `consequences/reads.test.mjs`:185 passed this run.
- `node checks/format.mjs`: 86 modules, 85 requirements files; 0 failures. `architecture.mjs … actions`: 13 product files, 50 relative imports; 0 failures. `coverage.mjs … actions`: 43 of 43 live requirement ids named by a test; 0 failures (actions R55's accepted red cleared). `ownership.mjs … actions tranche/T22`: 5 files changed; 0 failures.

Size (session_017xH4dbRvV6QifghDnUGAVp): test runs 27, module lines 2652

## J4 · COMPLETE

B3 (N497, K1087) applied: merged `tranche/T22` @ 9e3c197c15 (`4f4be007cf`); `test/m/actions/fixture.mjs`:100 registers `producingGroup` under `instance-setup`, not the retired `legacy-store` (`ac2c284da5`). Test-only; no behaviour changed. Everything in J3 stands.

**Tests and checks re-run** (head `ac2c284da5`)
- `test/m/actions/`: tests 66, pass 66, fail 0.
- Whole `bio-plane/test/m`: tests 4930, pass 4832, fail 80, cancelled 0: exactly J3's 80 (B2's 70 in action-clocks, action-plans and affordances `backing.test.mjs`:140, :165; the accepted carries control-plane `catalogue-end`:15, `doorbell`:310, membership `module-order`:12, `t9-notice-sight-bounds`:185, promotion `registry`:58, queue-producers `proposals` :78 :124 :153 :167, scheduler `plane`:85). No other red.
- format 0 failures; architecture 0 failures; coverage 43 of 43, 0 failures; ownership 5 files, 0 failures.

Size (session_017xH4dbRvV6QifghDnUGAVp): test runs 29, module lines 2652
