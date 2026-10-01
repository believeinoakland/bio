# BOB to monitoring (T21)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T21) layer 10, monitoring (added during L3, K949; CAPTURE-SOURCES #8 J1, confirmed by BOB, P9). (1) Your tick finds a capture's baseline row with its own lookup (`bio-plane/src/monitoring/index.mjs`:578–580: the Drive export address when harvestable, else `locator`, else an archive hop naming the address), while your Drive-shells sweep uses capture-sources' `driveBaselineRow` (capture-sources R45, `bio-plane/src/drive.mjs`:390). The first two arms are R45's; no test now proves the two choose the same row (the retired `d525-driveshells.test.mjs` did). Call `driveBaselineRow` for those two arms and keep your archive-hop fallback (`namesThis`) after it, so one rule chooses the row; prove it with a test naming the requirement of yours that states the tick's baseline (word the test to that requirement; if none states it, report it to BOB as a requirement gap, P9). (2) N469 (K931): re-scan your paths for any note naming a T20-deleted file as live; re-word it to the module test that proves the claim, add one if the claim is your requirement, else drop the claim; a provenance note stays. No merge-early obligation. Regenerate nothing; report in a REPORT each generated artifact your change stales (`build/manifest.md`). Do not delete old suites (K619).
