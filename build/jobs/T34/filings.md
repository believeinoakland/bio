# filings (T34)

**Status** · session_01YPiEUecerwrN96dTvpFkFA · depth 2 · COMPLETE · handled B1

## Completion (FILINGS #14)

**Entries applied.**
- **T34-62** (EVENTS #2 J2, K1795; N602, user side; K1653). R33's chronology now reads `events.timeline` once per reader, dated (`from` the act's day, `to` the assembly): the placed-nowhere items come from that same read (events R29 since T34-17), so the second undated read for the reader and the second undated plane read (R27's `out_of_view` comparison) are gone. Behaviour at the interface is unchanged. K1795's red, `chronology.test.mjs`:63, is cleared: the test now expects the source arguments with `viewer` (events R30), and the world lane's `placed_nowhere` is compared with the dated read's. New R33 test: every timeline read names both dates, there is one read as the reader and one as the plane, and the placed-nowhere items come from the dated read. Its negative control is a timeline that drops them from a dated read: then none are listed.
- **T34-87** (DEC-149; K1811), the four rows BOB re-checked:
  - `checks.mjs` C-115.13 `MACHINE_CANNOT_FILE`: "… Your group's Civicsmith sends nothing itself."
  - `index.mjs` `#view`'s why: "your group's Civicsmith has no active jurisdiction profile". It reaches the packet's deadlines and venue standard, `TEMPLATE_NOT_NAMED`'s detail, the governing tier's `says` and the available-actions block.
  - `index.mjs` R3's `group` blank: "no producing group is recorded" (it needs no name).
  - `index.mjs` R6's approval `says`: "… Your group's Civicsmith transmits nothing; …".
  The comments BOB named (:127, :1402, :296, :734, :1057, :1696) stay. New `wording.test.mjs` (R7, R16, R20, R9, R3) names each changed string exactly as a member receives it, with negative controls. It also checks that no translation in C-115 says "this/the instance, copy or plane". `prepare.test.mjs`'s two matches on the old words (R1/R28 `TEMPLATE_NOT_NAMED`, R20's block) now match the new words.

**Deferred.** None.

**Found in other modules / stale artifacts (REPORT J1).**
- promotion: C-115.13's translation changed, so `test/system/row-census.test.mjs` names it "changed with no record". That test was already red on `tranche/T34` (plan Rules (5) item 4), and C-115.13 joins it until T35's promotion stamp moves `CATALOG_VERSION` and re-pins.
- `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale from this change. BOB regenerates it at L9's close.
- provenance `index.mjs`:899, :905: `captureGrade`'s `why` ("this instance fetched these bytes …") passes through into a packet's exhibits. It is already on N664's T35 list (LEG-EARNING's report), so there is nothing new.

**Tests and checks run.**
- `node --test bio-plane/test/m/filings/`: tests 67, pass 67, fail 0. It was 63/1 before, at K1795's named red.
- `node --test bio-plane/test/system/row-census.test.mjs`: fail 1 before and after (the accepted red above).
- `format`: 127 modules, 126 requirements files; 0 failures.
- `architecture filings`: 15 product files, 71 relative imports; 0 failures.
- `coverage filings`: 32 of 32 live requirement ids named by a test; 0 failures.
- `ownership filings tranche/T34`: 6 files changed; 0 failures.

Size (session_01YPiEUecerwrN96dTvpFkFA): test runs 9, module lines 2117

## J1 · REPORT

Outside filings, from T34-87 (details in my record's Completion): (1) promotion: C-115.13 MACHINE_CANNOT_FILE's translation changed (DEC-149), so row-census.test.mjs names it 'changed with no record'; that test was already red (plan Rules (5) item 4), and C-115.13 joins it until T35's promotion stamp moves CATALOG_VERSION and re-pins. (2) bio-plane/dist/bio-plane.bundled.mjs is stale from this change, for your regeneration at L9's close. (3) provenance index.mjs:899, :905 (captureGrade's 'this instance fetched these bytes') passes through into a packet's exhibits; it is already on N664's T35 list, so there is nothing new.

## J2 · COMPLETE

T34-62 applied: R33 reads events' timeline once per reader, dated; placed-nowhere items come from that read (N602), the undated reads are gone; K1795's red chronology.test.mjs:63 is cleared (viewer in the source arguments). T34-87 applied: the four DEC-149 rows (C-115.13; #view's why; R3's group why; R6's approval says) say "your group's Civicsmith" or need no name; wording.test.mjs names each. filings 67/67 (was 63/1); format, architecture, coverage (32/32), ownership: 0 failures. Nothing deferred. Branch job/T34/filings; the record has the summary lines and Size.
