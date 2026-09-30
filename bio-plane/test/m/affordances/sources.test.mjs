/* affordances and N364's acts, driven at their own modules' interfaces over their fixtures: `sources` over its real
   record-core, membership and capture (test/m/sources/fixture.mjs), and `capture`'s late co-attestation and account over
   its own (test/m/capture/fixture.mjs), which the plane fixture does not reach (the durable object does not route
   `sourcesOps`). Measured here: the backing of the source acts graded `reasoned` (R19), of the two capture acts graded
   `attested` (R2), and that `sourceconsent`, an ACTS row, answers a machine with no MACHINE_* code, so it is rightly
   absent from MACHINE_REFUSALS (R20). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, SECRET, OTHER_SECRET } from "../sources/fixture.mjs";
import { fresh, bucket, governor, provenance, sha, newKey, sshsign, signer, H } from "../capture/fixture.mjs";
import { captureAccountStatement } from "../../../src/capture/index.mjs";
import { NS_RATIFY } from "../../../src/sshsig.mjs";
import { ACTS, JUSTIFICATION_REFUSALS, MACHINE_REFUSALS, RUNGS, CONSENT_PROMPT } from "../../../src/affordances.mjs";

const NO_EVIDENCE = [undefined, "", "   ", null];
const inFamily = (r, label) =>
  assert.ok(r && r.ok === false && JUSTIFICATION_REFUSALS.includes(r.reason), `${label}: ${JSON.stringify(r).slice(0, 240)}`);

/* A pulled knock with a secret, its source, and one disclosure on it: what the three acts are asked of. */
const scene = async () => {
  const w = seeded();
  const a = await w.pulled({ secret: SECRET });
  const b = await w.pulled({ secret: OTHER_SECRET });
  const d = w.disclose(a.sourceId);
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  return { w, source: a.sourceId, other: b.sourceId, entry: d.entry };
};

test("R19: sourcedisclose, graded `reasoned` (R2, N364), is refused without its evidence with a code in "
   + "JUSTIFICATION_REFUSALS, and accepted with it", async () => {
  const { w, source } = await scene();
  assert.equal(RUNGS.sourcedisclose, "reasoned");
  for (const evidence of NO_EVIDENCE) inFamily(w.disclose(source, { evidence }), `disclose ${JSON.stringify(evidence)}`);
  assert.equal(w.disclose(source, { revealed: { kind: "attribute", attribute: "occupation", value: "clerk" },
                                    evidence: "the filing names the occupation" }).ok, true);
});

test("R19: sourcelink, graded `reasoned` (R2, N364), is refused without its evidence with a code in "
   + "JUSTIFICATION_REFUSALS, and accepted with it", async () => {
  const { w, source, other } = await scene();
  assert.equal(RUNGS.sourcelink, "reasoned");
  for (const evidence of NO_EVIDENCE)
    inFamily(await w.s.linkClaim({ source, to: other, evidence, by: "bob" }), `link ${JSON.stringify(evidence)}`);
  const ok = await w.s.linkClaim({ source, to: other, evidence: "the same handwriting on both", by: "bob" });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
});

test("R19: sourceconsent, graded `reasoned` (R2, N364), is refused without its evidence with a code in "
   + "JUSTIFICATION_REFUSALS, and accepted with it", async () => {
  const { w, source, entry } = await scene();
  assert.equal(RUNGS.sourceconsent, "reasoned");
  for (const evidence of NO_EVIDENCE)
    inFamily(w.s.recordConsent({ source, entry, audience: "group", evidence, by: "bob" }), `consent ${JSON.stringify(evidence)}`);
  const ok = w.s.recordConsent({ source, entry, audience: "group", evidence: "the source said so in writing", by: "bob" });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  /* the prompt the act carries says what its answer records */
  assert.ok(CONSENT_PROMPT.startsWith(ok.statement));
});

/* R2 grades `sourceconsentwithdraw` `reasoned`, but sources R7's withdrawal asks no reason and no evidence
   (`withdrawConsent({source, entry, audience, by})`), so no call without an account is refused for want of one: R19 does
   not hold for it (J1 (2)). */
test.todo("R19: sourceconsentwithdraw, graded `reasoned` (R2), refused without an authored account — not met: sources "
        + "R7's withdrawal asks none, so nothing backs the rung (AFFORDANCES #8 J1 (2))");

test("R19: sourceconsentwithdraw today — accepted with no reason and no evidence, which is why its backing is a todo", async () => {
  const { w, source, entry } = await scene();
  assert.equal(w.s.recordConsent({ source, entry, audience: "group", evidence: "in writing", by: "bob" }).ok, true);
  const r = w.s.withdrawConsent({ source, entry, audience: "group", by: "bob" });
  assert.deepEqual([r.ok, r.act], [true, "withdraw"], JSON.stringify(r).slice(0, 300));
});

test("R20 R1: sourceconsent answers a machine credential with no MACHINE_* code (a machine names no member who may "
   + "read a source), so it is absent from MACHINE_REFUSALS; and it is an ACTS row", async () => {
  const { w, source, entry } = await scene();
  assert.ok(ACTS.some((a) => a.id === "sourceconsent"));
  for (const by of [MACHINE, "class:ai/tok1", "token:member", null]) {
    const r = w.s.recordConsent({ source, entry, audience: "group", evidence: "in writing", by });
    assert.equal(r.ok, false, String(by));
    assert.doesNotMatch(String(r.reason), /^MACHINE_/, String(by));
  }
  assert.ok(!Object.hasOwn(MACHINE_REFUSALS, "sourceconsent"));
  /* and the member it refuses nothing of is accepted */
  assert.equal(w.s.recordConsent({ source, entry, audience: "group", evidence: "in writing", by: V("bob") }).ok, true);
});

/* R2 (N364): `attested` names an authority the group does not hold alone. captureaccount is refused unless the capturing
   member's registered key verifies the account; reattest asks the timestamp authority (through provenance's attest). */
test("R2: captureaccount, graded `attested`, is refused unless a registered signing key of the capturing member "
   + "verifies the account, and accepted when one does", async () => {
  assert.equal(RUNGS.captureaccount, "attested");
  const { c, s } = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  const d = H("c1");
  c.recordCaptureActor({ captureSha: d, actor: "m1", at: "2026-09-01T00:00:00Z" });
  const key = await newKey();
  const text = "I saved this page myself on 1 September.";
  for (const signature of [undefined, "", await sshsign(key, captureAccountStatement(d, text), NS_RATIFY)]) {
    const r = await c.recordCaptureAccount({ captureSha: d, text, signature, by: "m1" });
    assert.match(String(r.reason), /^SIG_/, "no key of the member's verifies it");
  }
  signer(s, "m1", key.keyB64);
  const ok = await c.recordCaptureAccount({ captureSha: d, text,
    signature: await sshsign(key, captureAccountStatement(d, text), NS_RATIFY), by: "m1" });
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
});

test("R2: reattest, graded `attested`, asks the timestamp authority for a fresh token over the digest through "
   + "provenance's attest, and appends what it proves", async () => {
  assert.equal(RUNGS.reattest, "attested");
  const b = bucket();
  const f = fresh({ evidence: b, gov: governor(), env: { INSTANCE_NAME: "i" } });
  const bytes = new TextEncoder().encode("the captured page");
  const d = sha(bytes);
  b.held.set(`bio/captures/${d}`, bytes);
  f.c.provenance = provenance(f.s, { attestAnswer: { ok: true, attempts: [{ service: "https://tsa.test/",
    attempted: "2026-09-30T11:00:00Z", ok: true, kind: "rfc3161", token_sha256: H("7"), token_bytes: 900 }] } });
  const r = await f.c.reattest({ captureSha: d, by: "m1" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(f.c.provenance.attests.map((a) => a.sha256), [d], "the authority is asked over this digest");
  assert.deepEqual(r.late_attestations.map((o) => [o.kind, o.ok, o.late]), [["timestamp", true, true]]);
});
