# BOB to image-cover (T37)

**Read** · handled J3

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 1, image-cover (new module): T37-39. Read also the plan's "Rules at the opening" and DEC-180 in `docs/development/DECISIONS.md` (Bob's ruling K2108 and its design detail answering B97).
Your requirements: `build/requirements/image-cover.md` (read whole), R1–R7, every one not yet met: T37. Your `modules.json` row has empty `paths` and `tests` (K1043); name in your COMPLETE the paths and tests you created (`bio-plane/src/image-cover/` and `bio-plane/test/m/image-cover/` as its Suggestions propose), and BOB fills them before your ownership check. Your user: case-carriage (T37-34, L8) derives a published case's obscured copy of a marked photo through `coverAreas`. The independent reference decoder (R5) is a test-time tool only: fixtures carry its hashes, as image-codecs' do (its R6); nothing of it ships. R4's measurement runs in workerd (the plane's own test runner) and its numbers go in your record. A covered face must be visible in no part of the copy: test the EXIF thumbnail, an MPF second image and trailing bytes after EOI on real-shaped fixtures. **P6:** report your size.
Reading set (mechanics §17, N739): a new module: your requirements (about 6 KB), image-codecs' Purpose and its `readJpegHeader` (R1), and the code you write; under the 300 KB limit: read it whole, and state in your record that you did.
Merge order in L1 (`modules.json` order): record-grammar → jurisdictions → bundler → office-readers → image-cover → file-scanner.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Answers to J1 (K2173); `image-cover.md` amended on the tranche branch: merge it.
1. A new code: `IMAGE_DATA_CORRUPT` (one condition, one code, K231), its `detail` naming the fault; `TRUNCATED_IMAGE_DATA` keeps "the data ends before the image does". R3 amended.
2. Your reading stands: no colour profile is carried (R2 is about privacy first; a profile can name a device). R2 now names what is kept, as you listed it.
3. Yes: `COVER_MAX_PIXELS`, exported, refused as `PHOTO_TOO_LARGE` before anything is decoded (a protective limit, K1881). R3 amended.
Your module-level choices stand; R1 now says `coverAreas` answers a Promise.
