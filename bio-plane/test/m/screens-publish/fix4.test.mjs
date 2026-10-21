/* screens-publish, T51 fix round 4 (K4429), over a scripted plane: C40. The seam tests that need a provider's own instance are in
 * seam4.test.mjs. A sentence is asserted by its key (R24); every request is compared with its owner's declaration (interface-shell R104). */
import { registerDeclared } from "../../declared-ops.mjs";
import { registerDeclaredOps } from "../../../src/op-declarations/index.mjs";
await registerDeclared(new URL("../../../../", import.meta.url).pathname, registerDeclaredOps);
import { test } from "node:test";
import assert from "node:assert/strict";
import { open, drew, press, ok, PREFLIGHT, F1, P, DR, rawKeys, main } from "./fixtures.mjs";

const CER = `/app/ceremony/${P}/${DR}`;
const B64 = "b".repeat(64);
const ROW = (o = {}) => ({ capture: B64, by: "dev", findings: [F1], timestamp_at: null, co_archive: null, missing: ["timestamp", "co_archive"], late: false, timestamp_late: false, late_words: null, ...o });
const STEP3 = (o = {}) => ({ step: 3, tensions: { candidates: [], count: 0 }, not_co_attested: [], self_attested: [], ...o });
const HELD_BACK = { ok: false, code: "CO_ATTESTATION_UNACKNOWLEDGED", reason: "CO_ATTESTATION_UNACKNOWLEDGED" };
const pre = (row) => PREFLIGHT({ steps: [...PREFLIGHT().steps.slice(0, 5), STEP3({ not_co_attested: [row] }), ...PREFLIGHT().steps.slice(5)], ready: false, first: HELD_BACK, blockers: [] });

test("R74 R51 C40 after reattest the document's sentence is read again: it says 'neither' only while both proofs are missing, and no raw key is drawn", async () => {
  let again = false;
  const p = await open(CER, { plane: { publishpreflight: () => ok(pre(again ? ROW({ timestamp_at: "2026-10-20T10:00:00Z", missing: ["co_archive"] }) : ROW())),
    reattest: () => { again = true; return ok({ ok: true, captureSha: B64 }); }, captureaccounts: ok({ captureSha: B64, actors: [], accounts: [] }) } });
  assert.ok(drew(p, "screen.ceremony.conf.intro2", { finding: F1 }), "before: neither proof, so the sentence says so");
  await press(p, "reattest", { reason: "because" });
  assert.ok(drew(p, "screen.ceremony.conf.row.missing.co_archive"), "the proof still missing");
  assert.ok(!drew(p, "screen.ceremony.conf.intro2", { finding: F1 }), "the sentence is not left saying neither");
  assert.deepEqual(rawKeys(main(p)).filter((k) => k.startsWith("screen.ceremony.conf")), [], "no key of the row drawn raw");
});
