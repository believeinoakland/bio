# installer (T12)

**Status** · session_01BB1Bcv3GqjX9wdZK5x9pH8 · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

N234 (my R30), the import seam. My best reading, on which I am building now:

1. **Where and what.** I import `GROUP_SLUG_RE` and `FLEET_BINDINGS` from `bio-plane/src/setup.mjs` (instance-setup's paths), in the shapes the extraction map moves them with: `GROUP_SLUG_RE` a RegExp (legacy-store's static), `FLEET_BINDINGS` the list of `[member, binding]` pairs (legacy-index 3832). The installer derives its member→binding lookup from that list and keeps no table of its own. Until your CHANGE, both come through a local stub in my own paths (`newgroup/src/instance-setup-stub.mjs`, marked temporary); at the CHANGE I point the import at `setup.mjs` and delete the stub.
2. **A constraint on instance-setup this creates (please pass it on, or rule).** The installer ships as one esbuild bundle (`--platform=neutral`) pasted into a dashboard Worker (DEPLOY.md). Whatever `setup.mjs` imports at module level is pulled into that bundle: today `checks/bio-checks.mjs`; after the extraction likely record-core, membership and the rest, and any `cloudflare:*` specifier would fail the neutral build outright. My reading: instance-setup should keep the two exports import-free (e.g. in a leaf file of its own that `setup.mjs` re-exports, which needs a path added to its `paths`), so the installer imports that leaf. If you rule it stays in `setup.mjs`, I will build the bundle against it at the CHANGE and report its size and any failure.
3. **Retired by this change (legacy-tests', reported):** `bio-plane/test/instance-group.test.mjs`:232 reads `const SLUG_RE = …` from `newgroup/src/index.mjs` by source text; it stops matching when my copy goes (the extraction map already names it as retired by N234).

## J2 · QUESTION

B3 done (import from `setup-fleet.mjs`, stub deleted, wizard 206/0, requirements 27/0 + 6 todo, bundle 4,612,323 bytes and fresh; pushed a6bc39446b). My plan line (layer 11's shared list) carries N10 beside N234, so I am building R21 now. Two readings, on which I am building:

1. **R21 against R22 and R31.** R21 has the install page offer each held non-test profile "by name and coverage", so the page will show `City of Oakland and Alameda County` (profile data, from `jurisdictions.list()`). My R22 and R31 tests today assert no page names a place a held profile covers. My reading: R31 ("no place is named in this module's behaviour") and R22 govern the installer's own text; the profile choices are `jurisdictions`' data shown as data (layers.md rules 1–2), so the tests exempt exactly the choice list's rendered names and coverage, and still hold over every other word on every page. If you read R31 as forbidding even that, R21 cannot be met as worded and needs a ruling.
2. **The binding.** `/begin` takes an optional `profiles` list of ids; an id not held, a test profile or a repeat is refused 400 by name. The chosen ids ride the cookie and are bound as `JURISDICTION_PROFILES` (`plain_text`, comma-joined, in order) on the install PUT *and restated on the install's step-3 re-PUT* (that re-PUT takes the update's shape, `plain_text` is not in `keep_bindings`, and the store's first boot is likely after it, at verify, so dropping it there would lose the choice). None chosen binds nothing (instance-setup R13 then records nothing, and the page says the copy reads no local facts until an administrator chooses on its setup page, R15). An update never sends it and offers no choice.

## J3 · COMPLETE

**Entries applied.**
- N234 (R30; B2, B3, K405): the installer imports `GROUP_SLUG_RE` and `FLEET_BINDINGS` from instance-setup's import-free leaf `bio-plane/src/setup-fleet.mjs`. Its `SLUG_RE` and exported `MEMBER_BINDINGS` copies are gone; the member→binding lookup is derived from `FLEET_BINDINGS` inside the module. The interim stub is deleted. The tests import the same leaf. The wizard suite no longer reads `FLEET_BINDINGS` from the plane's source text: its DIST-6 PIN now checks that the installer exports no table of its own. R30's todo is now an interface test: `/begin` accepts exactly `GROUP_SLUG_RE`'s slugs (less `newgroup`) over every length 0–42 and every printable character at three positions, and the plane is bound under exactly `FLEET_BINDINGS`' names. The installer exports no grammar or table. Negative controls, each alone and restored by cmp: an exported regex copy fails R30, and a different grammar in `slugOk` fails R30.
- N10, installer share (R21; B4, K415): the install page offers every held non-test profile (`jurisdictions.list()`) by name and coverage, with none preselected, and says what choosing none means. The update page offers no choice. `/begin` takes an optional `profiles` list. It refuses 400 by name: a profile not offered (unknown or a test profile), a repeat, a non-list, and any choice on an update. The chosen ids, in the order chosen, ride the cookie and are bound as `JURISDICTION_PROFILES` (`plain_text`, comma-joined) on the install PUT and on its step-3 re-PUT. None chosen binds nothing, and an update never sends it. R22 and R31 now exempt exactly the rendered choice data (name, coverage, the checkbox's id). Negative control: dropping the profiles from the re-PUT fails R21, restored by cmp.
- Requirement marks: R30's and R21's `not yet met` are met; left to you (B4).

**Tests and checks.**
- `newgroup/`: `npm test`: embed 23 passed, 0 failed; wizard 206 passed, 0 failed; requirements tests 33, pass 28, fail 0, todo 5 (R13, R20, R24, R32, R33).
- `node --test bio-plane/test/newgroup-bundle-fresh.test.mjs`: pass 1, fail 0.
- Bundle (`newgroup/dist/newgroup.bundled.mjs`, mine, rebuilt): 4,641,478 bytes. It was 4,612,323 with only N234 (7 bytes over the tranche's copy); R21 adds the profile data and the choice page. esbuild builds it neutral with no error.
- Process checks: format 0 failures; architecture 0 failures (27 relative imports); coverage 33 of 33 live ids, 0 failures; ownership 7 files, 0 failures.

**Found in other modules (REPORT).**
1. legacy-tests: `bio-plane/test/instance-group.test.mjs`:232 reads `const SLUG_RE = …` from `newgroup/src/index.mjs` by source text, which no longer exists (B2 says you pass it on).
2. civicos-ui and affordances: no hit for `JURISDICTION_PROFILES`, `MEMBER_BINDINGS` or `SLUG_RE`. `docs/architecture/construct-status.json` still names `MEMBER_BINDINGS` (docs, not product).
3. No check row added or changed: nothing for promotion R34 to stamp (N318).

Deferred: none.

Size (session_01BB1Bcv3GqjX9wdZK5x9pH8): test runs 14, module lines 1867
