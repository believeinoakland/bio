/* record-core, fix round 9 (job 61; K4912): R91 amended, the job table's two stamp tables are bookkeeping too. PLANE's job table
   (`job_unit_attempts`, `job_batches`) is written by every ledger tick; a tick that changed no record must leave `writeCount()` as it
   was. The through-the-ledger tests are plane's (`plane/r9-bookkeeping.test.mjs`, K4933: a module's test never imports a later module). Counted, never timed (R-CLOCK). */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as core from "../../../src/record-core/index.mjs";
import { storage } from "./storage.mjs";

test("R91: the job table's two stamp tables, job_unit_attempts and job_batches, are on the bookkeeping list", () => {
  for (const t of ["job_unit_attempts", "job_batches"]) assert.ok(core.BOOKKEEPING_TABLES.includes(t), `${t} is bookkeeping`);
});

