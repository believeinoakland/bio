/* extraction R99, R100, R107 (fix round 9): the second half's ids (job 41, extraction-2: G128a/c/d/e/f/h/i/j), named here as `test.todo` until that job
   writes their tests (K208, K4888; BOB's K4901 (4)). R105 (b) (G128j) is that job's too. */
import { test } from "node:test";

test.todo("R99 (G128; units land in batches under LAND_BATCH_BYTES, a batch landed twice leaves one copy): job 41 (extraction-2), fix round 9");
test.todo("R100 (G128a, G128b; completeness is one fact, the job's counters, through reading-pipeline.completenessOf): job 41 (extraction-2), fix round 9");
test.todo("R107 (G134d, G128h; a stored unit has a kind, answered by unitsOf, op=reading and capture_text): job 41 (extraction-2), fix round 9");
