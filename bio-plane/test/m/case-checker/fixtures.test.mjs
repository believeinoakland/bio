/* case-checker's published fixtures (`fixtures.mjs`), each called here and its real answer checked. A user's test takes
   these answers from the fixture; this file is what keeps them case-checker's own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAccount } from "../../../src/case-checker/account.mjs";
import { checkAccountMalformed } from "./fixtures.mjs";

test("R24 (fixture checkAccountMalformed): an account that is not a list of rows answers {ok: false, reason: MALFORMED, field: account}, as checkAccount does", () => {
  const got = checkAccountMalformed();
  assert.deepEqual(got, { ok: false, reason: "MALFORMED", field: "account" });
  assert.deepEqual(got, checkAccount({ account: "x" }), "the fixture is the checker's real answer, not a copy of it");
});
