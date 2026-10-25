/* case-disclosures' published fixtures (fix round 10, T51): `gateRefusal` is the module's real answer for each gate, checked
   here at the interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { gateRefusal } from "./fixtures.mjs";
import { CASE_DISCLOSURE_CHECKS } from "../../../src/case-disclosures/index.mjs";

test("R1, R2, R6, R22 the gateRefusal fixture: the four pre-flight gate refusals are the real ones, each with its check and translation from the module's table, the document and the photo named where the gate names them", () => {
  const g = gateRefusal();
  const codes = ["DOCUMENT_COPY_PENDING", "PHOTO_UNCHECKED", "CO_ATTESTATION_UNACKNOWLEDGED", "TENSION_NOT_DISCLOSED"];
  for (const code of codes) {
    const r = g[code];
    assert.equal(r.ok, false, code);
    assert.deepEqual([r.reason, r.code, r.check, r.translation],
      [code, code, CASE_DISCLOSURE_CHECKS[code].check, CASE_DISCLOSURE_CHECKS[code].translation], code);
    assert.equal(typeof r.detail, "string", code);
  }
  assert.equal(g.DOCUMENT_COPY_PENDING.document, g.held.document, "the document fills {document}");
  assert.equal(g.PHOTO_UNCHECKED.photo, g.held.photo, "the photo fills {photo}");
  assert.deepEqual(g.CO_ATTESTATION_UNACKNOWLEDGED.unacknowledged.map((u) => u.capture), [g.held.capture]);
  assert.deepEqual(g.TENSION_NOT_DISCLOSED.undisclosed.map((u) => u.candidate), [g.held.candidate]);
});
