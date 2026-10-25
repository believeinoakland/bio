/* pdf-reader: the fixtures this module publishes (fixtures.mjs) answer what the module answers, at its interface. A test
 * that uses a published fixture checks the real answer here, so a user's test never stands on a value this module does
 * not give. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { notAPdf } from "./fixtures.mjs";

test("R1: the published fixture notAPdf answers NOT_A_PDF, from the module's real code", async () => {
  assert.deepEqual(await notAPdf(), { ok: false, container: "pdf", reason: "NOT_A_PDF" });
});
