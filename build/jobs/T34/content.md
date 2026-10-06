# content (T34)

**Status** · session_01BpNkAEf4j1DeURWRx9Fgdb · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**T34-15 applied** (N589, K1624; R55 as BOB worded it, K1745), commit f4f4fa7262 on `job/T34/content` (`tranche/T34` merged at 7976392b7b first: mail, plan and rulings only). Module 3,683 → 3,710 lines (P6 guard held).
- **R55** `passageAcross(row, captureSha, memo?)`: one candidate for a row read through R45's contract (R47's `row`) against a capture the caller found at another address. It is the same comparison R30/R31 make on a version chain: R30's extent test (`#extentTestAcross`, nothing minted, an existing row named) and R31's grade (`gradeAcross` over both captures' units, `memo` shared as R47's). R47's per-candidate code is now one private `#candidateAt`, called by `noticeForRow` (which adds the chain's `bundle_id` and `first_retrieved`) and by `passageAcross`, so the two cannot drift. It reads no version chain and asks no sight. It answers null for a row that is not an object, a capture that is not 64 lowercase hex, the row's own capture, or a read that fails. It writes nothing and never throws. No new grade.
- **My technical choice (P17):** a matched candidate's `says` is its own sentence ("a passage at the same extent of the capture compared, held at another address … nor that capture the same work"), because R55 decides neither newness nor identity. The `why`/`grade_why` texts are R30/R31's unchanged ("newer"), since reevaluation R36 calls it only for a capture it has decided is newer.

**Deferred:** none.

**Found in another module:** none. reevaluation's L7 job (T34-41) calls R55 per R36. The answer has R47's candidate fields less `bundle_id` and `first_retrieved`.

**Tests and checks:**
- `node --test bio-plane/test/m/content/`: tests 126, pass 126, fail 0. There are three new R55 tests in `passage.test.mjs`. They cover: grades A, B, C and NOT_FOUND; UNDETERMINED when either side is not whole; R30's reasons; an existing row named and nothing minted; field-for-field equality with `noticeForRow`'s candidate once the capture is on the row's chain; a version chain that throws, which changes nothing; no sight asked; each null case; memo reading units once; and never throwing.
- `noticeForRow` was refactored, so its user's tests were run: `bio-plane/test/m/reevaluation/` 135 pass, 0 fail, the same on the unchanged base.
- `format`: 0 failures. `architecture content`: 24 files, 0 failures. `coverage content`: 55 of 55 live ids named, 0 failures. `ownership content tranche/T34`: 0 failures.
- R55's `*(not yet met: T34)*` marker is in the requirements, which are BOB's file, so it is BOB's to clear at the merge.

Size (session_01BpNkAEf4j1DeURWRx9Fgdb): test runs 11, module lines 3710
