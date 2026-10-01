/* The old suite `test/signer-enrolment.test.mjs`'s credentials share, converted to this module's interface (K619 (2);
   `build/jobs/T17/legacy-tests.md`: "R25/R26 refusal fields (translation, member_status, enrolled, nothing written)",
   now R6 and R7). Its ratify-gate half (a revoked member's key refused SIG_UNKNOWN_KEY at op=ratify) is
   ratification's. `test/aicredential.test.mjs`'s share is in `ai.test.mjs` (R12, R15). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";

const keys = (w) => w.c.signerList().signers.map((s) => s.key_b64);

test("R6 R7 R8 (signer-enrolment): a key for a member who has not enrolled is refused by name with the stored facts and writes nothing; the same key is accepted once they enrol; the second door cannot re-activate a revoked member's key; the roster hides nothing", async () => {
  const w = await world().group("iris", "jonah");
  const kestrel = await w.m.memberAdd({ memberId: "kestrel", cover: "cover for kestrel", by: "admin" });
  assert.equal(kestrel.ok, true);
  assert.deepEqual(keys(w), [], "the roster starts empty, so every row below was put there here");
  /* §1 the write: refused by name, with the plane's sentence and the stored status, and nothing written */
  const early = w.c.signerAdd({ keyB64: "AAAAkestrel", memberId: "kestrel", comment: "kestrel laptop", by: "admin" });
  assert.equal(early.reason, "SIGNER_MEMBER_NOT_ENROLLED");
  assert.ok(typeof early.translation === "string" && early.translation.length > 20);
  assert.deepEqual([early.member_status, early.enrolled], ["invited", false]);
  assert.deepEqual(keys(w), []);
  assert.deepEqual([w.c.signerAdd({ keyB64: "AAAAiris", memberId: "iris", by: "admin" }).ok,
                    w.c.signerAdd({ keyB64: "AAAAjonah", memberId: "jonah", by: "admin" }).ok], [true, true]);
  /* over-strictness: the same key for the same member is accepted once kestrel enrols */
  assert.equal((await w.m.enroll({ invite: kestrel.invite, handle: "kestrel", password: "kestrel-passphrase-x" })).ok, true);
  assert.equal(w.c.signerAdd({ keyB64: "AAAAkestrel", memberId: "kestrel", comment: "kestrel laptop", by: "admin" }).ok, true);
  assert.ok(keys(w).includes("AAAAkestrel"));
  assert.equal(w.c.signerAdd({ keyB64: "AAAAstranger", memberId: "ghost", by: "admin" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.c.signerAdd({ keyB64: "not-a-key", memberId: "iris", by: "admin" }).reason, "BAD_KEY");
  /* §2 the second door */
  assert.equal(w.m.memberSet({ memberId: "jonah", status: "revoked", by: "admin" }).ok, true);
  const jonah = () => w.c.signerList().signers.find((s) => s.key_b64 === "AAAAjonah");
  assert.equal(jonah().status, "revoked", "the cascade takes his key with him");
  const revive = w.c.signerSet({ keyB64: "AAAAjonah", status: "active", by: "admin" });
  assert.deepEqual([revive.reason, revive.member_status, revive.enrolled], ["SIGNER_MEMBER_NOT_ACTIVE", "revoked", true]);
  assert.equal(jonah().status, "revoked", "nothing landed");
  assert.equal(w.c.signerSet({ keyB64: "AAAAkestrel", status: "revoked", by: "admin" }).ok, true, "revoking is never barred");
  assert.equal(w.c.signerSet({ keyB64: "AAAAkestrel", status: "active", by: "admin" }).ok, true, "an active member's key re-activates");
  /* §3 the roster says which state each key is in, and hides none */
  const rows = w.c.signerList().signers;
  assert.deepEqual(rows.map((r) => r.key_b64).sort(), ["AAAAiris", "AAAAjonah", "AAAAkestrel"]);
  const row = (k) => rows.find((r) => r.key_b64 === k);
  assert.deepEqual([row("AAAAiris").status, row("AAAAiris").member_status, row("AAAAiris").attests], ["active", "active", true]);
  assert.deepEqual([row("AAAAjonah").attests, row("AAAAjonah").attests_why, row("AAAAjonah").member_status], [false, "key_revoked", "revoked"]);
  const whys = rows.map((r) => r.attests_why).filter((x) => x !== null);
  assert.ok(whys.length >= 1);
  assert.deepEqual(whys.filter((x) => !["key_revoked", "member_invited", "member_proposed", "member_revoked", "member_absent"].includes(x)), []);
  /* the attesting set is the roster's attesting keys (R11): the gate's view and the roster's agree */
  assert.deepEqual(w.c.attestingKeys().map((k) => k.key_b64).sort(), rows.filter((r) => r.attests).map((r) => r.key_b64).sort());
});
