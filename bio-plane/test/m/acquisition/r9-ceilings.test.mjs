/* acquisition R114 (T51 fix round 9, G124a, G124b, G124g): THE CEILINGS ARE `READ_BOUNDS`', AND A REFUSAL STATES SIZE AND LIMIT. The capture ceiling, the
   multipart keep, the profile text and the archive limits resolve to the table; a capture declared one over its limit is refused TOO_LARGE with
   {size, bound, key} at once and nothing is filed, one at the limit is accepted; this module keeps no numeric literal for a ceiling it quotes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, run } from "./fixture.mjs";
import { CAPTURE_MAX, MULTIPART_KEEP_MAX, PROFILE_TEXT_MAX } from "../../../src/acquisition/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { ARCHIVE_LIMITS } from "../../../src/ooxml.mjs";

const member = { cls: "member", member: true, sessMember: "m1", storeName: "bio", settle: false };
const U = "https://big.example/x.bin";
const declared = (n) => () => new Response(new Uint8Array(8), { headers: { "content-type": "application/octet-stream", "content-length": String(n) } });

test("R114: the exported ceilings are the table's active figures, and the archive limits are ooxml's quotes of the same rows", () => {
  assert.equal(CAPTURE_MAX, boundOf("archive", "uploaded_bytes"));
  assert.equal(MULTIPART_KEEP_MAX, boundOf("capture", "keep_bytes"));
  assert.equal(PROFILE_TEXT_MAX, boundOf("capture", "profile_text_bytes"));
  assert.equal(ARCHIVE_LIMITS.ARCHIVE_TOTAL_MAX, boundOf("archive", "unpacked_bytes"));
});

test("R114: a capture declared one byte over the limit is refused TOO_LARGE (413) with size, bound and key, nothing filed; at the limit it is not refused (control)", async () => {
  // fixtures-contract: plane owed-ledger
  const w = world(); w.store.owedLater = async () => ({ ok: true });
  const over = await run(w, { [U]: declared(CAPTURE_MAX + 1) }, { locator: U }, member);
  assert.equal(over.status, 413);
  assert.equal(over.body.reason, "TOO_LARGE");
  assert.deepEqual([over.body.size, over.body.bound, over.body.key], [CAPTURE_MAX + 1, CAPTURE_MAX, "limit.archive.uploaded_bytes"]);
  assert.equal(over.body.document, undefined);
  // fixtures-contract: plane owed-ledger
  const at = await run(world(), { [U]: declared(CAPTURE_MAX) }, { locator: U }, { ...member, owedLater: async () => ({ ok: true }) });
  assert.notEqual(at.body.reason, "TOO_LARGE");
});

test("R114: this module's source keeps no numeric literal for a ceiling it quotes", () => {
  const src = readFileSync(new URL("../../../src/acquisition/index.mjs", import.meta.url), "utf8");
  for (const name of ["CAPTURE_MAX", "MULTIPART_KEEP_MAX", "PROFILE_TEXT_MAX"]) {
    const line = src.split("\n").find((l) => l.startsWith(`export const ${name} =`));
    assert.match(line, /boundOf\(/, name);
    assert.doesNotMatch(line.split("//")[0], /\d{4,}|\*\s*1024/, name);
  }
});
