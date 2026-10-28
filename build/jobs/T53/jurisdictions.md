# jurisdictions (T53)

**Status** · session_018BhcefMFW1bhVhh3w9sjUp · depth 2 · COMPLETE
**Sessions** · 3

## Completion (2026-10-28)

# jurisdictions T53 report (successor session, #2; #1's work carried)

**Entries applied.** T53-4 (R103-R105, R107), T53-5 (R99-R102, R106, R108, R121), T53-7 and T53-10 engine side (R115-R117, R123, R134, R135), T53-11 (R40, R125, R126, R136, R138, and R137's data side: a source's `address`, a text's `source_check`, `textStanding`), T53-13 (R139, a test), all by #1 and verified here. This session: **T53-6**, the split: four shipped layers (`us-federal`, `us-california`, `us-ca-alameda-county`, `us-ca-oakland`), `oakland-alameda` a package of them, `get(package)` the composed whole, `layers()`, the pre-split view as a fixture with the equality test, R113's every-footprint check as a test, the test forest as a published fixture (`test/fixtures/forest.mjs`, R118); **T53-12**: R127-R132 and most of R133 (`registers`, `use_limits`, `query_templates`, a system's `rate_limits`, `gated`, `terms`, `volatile`, `use_limit`; `validateRegisterDefinition`, `queryAddress`; the test profile supplies every shape; the first profile lists what M-R1 measured, with columns read from the real headers, and what it did not read as `not_measured`); **T53-502**: `vocabulary.street_types`, 211 USPS Publication 28 suffixes with their abbreviations, in the federal layer; **T53-14**: the four English sites in this module's tests replaced (their baseline rows in `build/tests-english-baseline.json` are BOB's to remove); K5618's courtlistener path widened in the first profile and the test profile. T53-9: nothing to build in this module (US places only is the screens' and the other modules'). T53-8 (R119, R120): waits on F4 and the makers' key; not started.

**Choices I made that BOB may reverse (one line each).**
1. **Tags.** R114 says a fact's `profile` tag names the layer that holds it. Doing that breaks every caller that reads the tag as an id it holds (`local-facts` reads `active.held.get(profile)` and answers NO_SUCH_FACT; `actions.actionZone` reads zero; `instance-setup`'s venue test). I kept `profile` as the package the caller named (as before the split) and added `layer` (the holding layer's id) on each fact; a conflict's values keep their own `layer {id, level, origin}`. With this, 134 test files of other modules that load `oakland-alameda` give the same results as before the split, but one (below). If BOB wants the strict reading, it is one function (`retag` in `combineInner`) and the tests of the modules above change with it.
2. **Order.** The layers lay a list's entries end to end, federal first, so a list's order is not the unsplit profile's (R14). The equality compares lists as sets. Tests of this module that pinned an order or a position (`records_laws[0]`, `deadlines[0]`, `systems.slice`, `action_kinds.slice`, a holidays list order, one locale conflict order) were changed to find by content, each change commented.
3. **R109 vs R114: `records_request.laws`.** The federal layer's `records_request` kind names FOIA (R109), so the combined kind's `laws` gains `Freedom of Information Act`, first. The equality excepts that one difference, named in the test.
4. **A layer within another may name kinds, laws and starters it does not hold**, as R104 already lets it name a closure list; and may carry **an addendum to a rule the layer above states: its own body's observed practice** (`{rule, applies_to, observed, status, basis}`). The City's `observed` practice of the state's `records_response` rule moved to the City layer that way (R112 puts `observed` there; R104 forbids the state layer naming the City's list).
5. **Where facts went** beyond R109-R112's lists: the state's court proceeding kinds and flows (civil, writ, appeal) to California (their citations are state law, R113); the Alameda County Superior Court's forum, the `records_petition` kind (its venue is the Superior Court), the assessor's and eCourt systems, the parcel space, legal-aid and self-help pointers to the county layer; the state appellate courts' forums to California, the federal court's to federal. `courtlistener_docket` and `cpuc_proceeding` stay in the City layer (R112: every remaining fact).
6. **R127's locator holes** gain `{cycle2}` (the cycle's last two digits), because the FEC's address is `/bulk-downloads/2026/indiv26.zip`.
7. **`row_key_basis: source` with columns of role `other` only** is refused (R128), so the FEC individual file and the behested-payments register key by content.
8. **R133's `systems` count** in `jurisdictions.test.mjs` is now legacy + 6 (the OakData portal, the state CDN, the FEC host), as R133 says the job amends it; the state's company API system entry is NOT added (see below).

**Not done and why.**
- **R109**: the federal `records_help` block for FOIA is not written: it needs the statute's text read, and whether the twenty days are shown as business days (R93 says only `days`). Marked `test.todo`.
- **R119, R120**: wait on F4 and the makers' key.
- **R133**: the state's company-service `systems` entry (terms from its sign-up page, call limits) is not added: neither was read (M-R1 row 9); the officers register is listed as `not_measured`, `beta`, `gate: account`, no pieces, as R133 says. `test.todo`.
- **R137's offer side** is `filing-templates`' and `reading-guides`' (this module gives `textStanding`, the words keys `text.reviewedby`, `text.sourcechanged`, `text.lastchecked`, whose rows UX-DESIGN has not written except the second; setup-words waits on them). **R124**'s member act is `local-facts`'. `test.todo` for both.
- R111: the county layer holds the facts the unsplit profile held; "whatever research finds" (county records laws, deadlines, holiday list) was not researched, as the requirement says it is research to be named in the plan.
- The test profile's templates still lack a professional-review hash and `sources`, so `textsLack(get("test-port-ellery"))` is not empty (#1's note).

**Found in other modules.**
- `instance-setup/test/seeds.test.mjs:408` expects the unmatched bodies as Civil Grand Jury then State Controller; the layers give State Controller first (order, see 2). Change the test to compare as a set.
- `local-facts` must read a fact's `layer` (R99, T53 entry) as well as `profile`; until then it works through the package name.
- `actions.actionZone` should read `governingZone(ids, team, layer)` (R102) rather than a profile's own `time_zone`.
- `bio-plane/src/screens-action/help-records.mjs:33-35` reads `view.records_help` as one object; it is a list (R105). `setup.mjs:3052` copies it.
- `setup-words/rows.mjs` and `words-unreviewed.json` are stale for the new `localize` ids here (`proc merge` regenerates); three tests of `bio-plane` fail on the tranche before my change too (acquisition `acquire`, `journey-check` `pseudo`, reading-pipeline `read` and `text-units`, `control-plane` round7, screens-daily `fix2`, screens-investigate `person`): inherited, not mine.
- The `build/plan/walk-T51-final/scripts/*.test.mjs` walk tests rewrite tracked screenshots when run; I ran them once and restored the files.

**Met** · R40, R99, R100, R101, R102, R103, R104, R105, R106, R107, R108, R110, R111, R112, R113, R114, R115, R116, R117, R118, R121, R123, R125, R126, R127, R128, R129, R130, R131, R132, R134, R135, R136, R138, R139

Tests: 240/246. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefMFW1bhVhh3w9sjUp): test runs 1, module lines 21539
