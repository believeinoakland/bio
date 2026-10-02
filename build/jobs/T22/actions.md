# actions (T22)

**Status** · session_017xH4dbRvV6QifghDnUGAVp · depth 2 · WAITING ON BOB (J1) · handled B0

## J1 · QUESTION

R55 is built as B1 says (`3edac9159a`): `actionsOf` registers `captureOf(host).registerReader("litigation-hold", "actions", () => a.holdInPlace())` once per host; the reader is synchronous, unviewered, writes nothing, answers `true` on a failed read. `test/m/actions/t22.test.mjs` proves it over the real capture with every negative control B1 lists; `test/m/actions/` 66/66 green, t18 green (note sent).

The consequence for users' suites: `captureOf(host)` with no capture on the host creates one, and capture's default `provenanceOf(ctx)` joins provenance's promotion step to the host. Fixtures that build `actionsOf` without provenance's tables now fail every promotion (`no such column: authored`, provenance `#testimonyFence`): `test/m/action-clocks/` 25 of 27 red (all fixture), `test/m/action-plans/` 43 of 43 red, `test/m/affordances/backing.test.mjs`:140, :165 (through action-plans' fixture). Without my change all three are green (checked by stash). The plane is unaffected: it builds provenance before actions, and capture adopts the `env` of its later caller (R58); I also hand capture the `env` actions is given.

My best reading, which I carry on with: keep `captureOf(host)` as B1 says; these are users' fixtures that do not migrate provenance, which every real host has; accept them by name until each user's job adds `provenanceOf(host).migrate()` to its fixture (action-clocks is in L9 now; action-plans and affordances later). The alternative within my module is `capture: null` unless a dep is given, which leaves the plane to register the reader (`plane` passing `capture`), contrary to "at start, once, in actionsOf". Which do you want?
