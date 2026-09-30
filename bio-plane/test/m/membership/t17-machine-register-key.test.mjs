/* T17 (N387, K571; DEC-49): R89's first refusal, MACHINE_CANNOT_REGISTER_KEY, carries its row C-96.17 (code, check and
   translation), minted at its one site in `signerRegisterOwn`. At the interface only. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../checks/bio-checks.mjs";

const ROW = MEMBERSHIP_CHECKS.MACHINE_CANNOT_REGISTER_KEY;
const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));
/* Every caller with no member behind it: no stamp, an empty one, and every machine credential (the four token classes,
   an organisation-scoped `ai` credential, the operator's bearer spelled as a token). */
const NOBODY = [null, undefined, "", ...["admin", "member", "probe", "daemon", "ai"].map((c) => `${MACHINE_CLASS_PREFIX}${c}`),
                "token:daemon"];

test("R89 C-96.17: MACHINE_CANNOT_REGISTER_KEY's row is this module's, frozen, its where naming its one site, and C-96's next free number", () => {
  assert.deepEqual({ ...ROW }, { check: "C-96.17",
    where: "src/membership/index.mjs signerRegisterOwn > is-machine-register-key",
    translation: "A member registers their own signing key, from their own signed-in session. The credential that asked "
      + "here has no member behind it: it is an automated one, the operator's token, or a call with nobody signed in. "
      + "Sign in as yourself to register your key, or ask an administrator to register one for you. Nothing was changed." });
  assert.ok(Object.isFrozen(ROW));
  /* One row per code, and no other of this module's rows holds C-96.17. */
  const holders = Object.entries(MEMBERSHIP_CHECKS).filter(([, r]) => r.check === "C-96.17").map(([code]) => code);
  assert.deepEqual(holders, ["MACHINE_CANNOT_REGISTER_KEY"]);
});

test("R89 C-96.17: every caller with no member behind it is refused MACHINE_CANNOT_REGISTER_KEY with its code, row and translation, first and whatever the key; nothing is written", async () => {
  const w = await world().group("ann", "bob");
  assert.equal(w.m.signerAdd({ keyB64: "AAAAannkey", memberId: "ann", by: "admin" }).ok, true);
  const before = snapshot(w);
  for (const by of NOBODY)
    for (const key of ["AAAAnew", "AAAAannkey", "not a key", undefined, 7]) {
      const r = w.m.signerRegisterOwn({ keyB64: key, comment: "c", by });
      const label = `${String(by)} ${String(key)}`;
      assert.deepEqual(Object.keys(r).sort(), ["by", "check", "code", "detail", "ok", "reason", "translation"], label);
      assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.by],
        [false, "MACHINE_CANNOT_REGISTER_KEY", "MACHINE_CANNOT_REGISTER_KEY", "C-96.17", ROW.translation, by || null], label);
      assert.match(r.detail, /Nothing was written\.$/, label);
    }
  assert.equal(snapshot(w), before, "no refusal writes");
  /* One answer for every such caller but its `by`: the fence says nothing about the key or the roster. */
  const shapes = new Set(NOBODY.map((by) => JSON.stringify({ ...w.m.signerRegisterOwn({ keyB64: "AAAAannkey", by }), by: null })));
  assert.equal(shapes.size, 1);
  /* A member session passes the fence and meets R89's later answers. */
  assert.equal(w.m.signerRegisterOwn({ keyB64: "AAAAbobkey", by: "bob" }).ok, true);
  assert.equal(w.m.signerRegisterOwn({ keyB64: "AAAAannkey", by: "bob" }).reason, "SIGNER_KEY_HELD_BY_ANOTHER");
});
