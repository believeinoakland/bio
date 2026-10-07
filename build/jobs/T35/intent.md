# intent (T35)

**Status** · session_01UdnNvtAgsbA7Psysnpv2Ch · depth 2 · COMPLETE · handled B0

## Completion

**Entries applied.** T35-51:
- (DEC-149; plan rule 4, K1847) Sweep row `checks.mjs`:134, C-111.24 `SOURCE_DECLARED`. Its translation now ends "A source registers once, when your group's Civicsmith starts." instead of "when the plane starts". Code, check id and where are unchanged. A new test in `discovery.test.mjs` (R15, R22) registers a source twice and checks the whole refusal at the interface: code, row and the full sentence. It also checks that no row of this module names the plane, the instance, the copy or a server (DEC-149's pattern). The sweep's three X rows (`index.mjs`:429, :454, :586: "instance" meaning an instance of a progression) are not member-facing in that sense and are unchanged.

**Rows awaiting stamp (accepted red 2):** C-111.24 `SOURCE_DECLARED` (translation re-worded), until T36's promotion job.

**Deferred.** None. No flaw found in the module on reading it whole.

**Found in other modules (for BOB).**
- control-plane: `test/m/control-plane/rows-before-r43.json`:755 pins C-111.24's translation digest (`724bc52eadc32272`). `catalogue-end.test.mjs`:21 is already red on the tranche (red 19; it stops at C-29.3 first), and this row joins the set T35-72 re-pins.
- Generated artifact (§14): `bio-plane/dist/bio-plane.bundled.mjs` embeds the old sentence (line ~168975), so the plane bundle is stale until L7's close regenerates it. I did not touch it.

**Tests and checks.**
- `node --test bio-plane/test/m/intent/`: tests 74, pass 74, fail 0 (one new test).
- `catalogue-end.test.mjs` (the one test outside the module that pins the row): 1 pass, 1 fail, both with and without this change (red 19); no new failing test.
- Layer tests: none named in `build/manifest.md`.
- `format`: 130 modules, 129 requirements files; 0 failures. `architecture`: 15 product files, 65 relative imports; 0 failures. `coverage`: 31 of 31 live requirement ids named by a test; 0 failures. `ownership`: 3 files changed by intent between tranche/T35 and HEAD; 0 failures.

Size (session_01UdnNvtAgsbA7Psysnpv2Ch): test runs 4, module lines 2120
