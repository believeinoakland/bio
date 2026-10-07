# extraction (T35)

**Status** · session_012j4Xu6XxwHWUGxui4G3m5P · depth 2 · WAITING ON BOB (J1) · handled B1

## J1 · QUESTION

N636 needs a modules.json edge: extraction's uses gains doctypes (L1, earlier). The fix registers doctypes' readers once in the suite fixture (`registerDoctypes(registerDoctype)` in `bio-plane/test/m/extraction/fixture.mjs`, as reading-pipeline's suites do since K1781); with it all six reds clear (121/121). The architecture check then fails one line only: fixture.mjs imports doctypes/index.mjs, which extraction does not declare in uses. My best reading: BOB adds the edge (as K1781 did for reading-pipeline); I carry on with the sweep rows and will merge tranche/T35 when it lands.
